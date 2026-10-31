// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/rtc-link.mjs — « Play nearby » WebRTC carrier
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// One private DataChannel per guest, straight from phone to phone over the
// local Wi-Fi: no STUN, no TURN, no server. Each DataChannel message is one
// frame of the proxy's format ([u32 BE length][PokerTHMessage]).
//
//   Host, for each guest:
//     const inv = await hostInvite(server, { slot, build, label });
//     show(inv.payload);                 // QR / share / copy (step 3)
//     await inv.accept(answerCode);      // the guest's code, scanned back
//     … inv.close() to cancel a pending invitation.
//   Guest:
//     const g = await guestAnswer(offerCode, { build });
//     show(g.payload);                   // the host scans it
//     S.ws = g.socket;                   // opens when the channel does
//
// Failures surface as SignalError codes (signal.mjs) on the calls, and as a
// socket close reason on the guest: 'nearby-timeout' (nobody completed the
// pairing), 'nearby-lost' (the link dropped and did not come back), 'nearby-
// closed'. A short Wi-Fi hiccup does not drop the player: the link is only
// given up after `lostMs` in the « disconnected » state. Once given up, the
// host's LocalServer keeps the seat for a while (seat recovery, see
// local-server.mjs) and the guest pairs again to take it back.
// ─────────────────────────────────────────────────────────────────────────

import { PipeSocket } from './pipe-socket.mjs';
import { encodePayload, decodePayload, KIND, SignalError } from './signal.mjs';

export const RTC_DEFAULTS = Object.freeze({
  gatherMs: 3000,     // wait at most this long for the local addresses
  openMs: 180000,     // a pairing nobody completes is dropped after 3 min
  lostMs: 15000,      // « disconnected » this long → the link is given up
});

/** Can this browser carry a nearby game? */
export function rtcSupported(RTC) {
  const C = RTC || /** @type {any} */ (globalThis).RTCPeerConnection;
  return typeof C === 'function';
}

function newPc(o) {
  const C = o.RTCPeerConnection || /** @type {any} */ (globalThis).RTCPeerConnection;
  if (typeof C !== 'function') throw new SignalError('unsupported', 'WebRTC unavailable');
  return new C({ iceServers: [] });
}

// Local description complete (all local addresses known), or the time is up.
function gathered(pc, ms) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve(undefined);
    const t = setTimeout(done, ms);
    function done() { clearTimeout(t); pc.removeEventListener('icegatheringstatechange', check); resolve(undefined); }
    function check() { if (pc.iceGatheringState === 'complete') done(); }
    pc.addEventListener('icegatheringstatechange', check);
  });
}

// Give up on a link that failed, closed, or stayed « disconnected » too long.
function watch(pc, lostMs, onLost) {
  let t = null;
  const state = () => pc.connectionState || pc.iceConnectionState;
  const on = () => {
    const s = state();
    if (s === 'failed' || s === 'closed') { clearTimeout(t); t = null; onLost(s === 'failed' ? 'lost' : 'closed'); }
    else if (s === 'disconnected') { if (!t) t = setTimeout(() => { t = null; if (state() === 'disconnected') onLost('lost'); }, lostMs); }
    else if (t) { clearTimeout(t); t = null; }
  };
  pc.addEventListener('connectionstatechange', on);
  pc.addEventListener('iceconnectionstatechange', on);
  return () => { clearTimeout(t); t = null; };
}

/**
 * Host side: one invitation (one guest).
 * @param {import('./local-server.mjs').LocalServer} server
 * @param {{ slot: number, build: string, label?: string, RTCPeerConnection?: any, gatherMs?: number, openMs?: number, lostMs?: number, onState?: (s: string, why?: string) => void }} o
 */
export async function hostInvite(server, o) {
  const cfg = Object.assign({}, RTC_DEFAULTS, o);
  const onState = typeof o.onState === 'function' ? o.onState : () => {};
  const pc = newPc(o);
  const dc = pc.createDataChannel('pokerth', { ordered: true });
  dc.binaryType = 'arraybuffer';
  /** @type {any} */ let handle = null;
  let ended = false, opened = false, openTimer = null, unwatch = () => {};
  const end = (why) => {
    if (ended) return; ended = true;
    clearTimeout(openTimer); unwatch();
    if (handle) { const h = handle; handle = null; h.detach(); }
    try { dc.close(); } catch (e) {}
    try { pc.close(); } catch (e) {}
    onState('closed', why);
  };
  dc.onopen = () => {
    if (ended || opened) return;
    opened = true; clearTimeout(openTimer);
    handle = server.attach({
      send: (u8) => { if (dc.readyState === 'open') { try { dc.send(u8); } catch (e) {} } },
      close: () => end('server'),
    });
    onState('open');
  };
  dc.onmessage = (ev) => { if (handle && ev.data) handle.receive(new Uint8Array(ev.data)); };
  dc.onclose = () => end('closed');
  unwatch = watch(pc, cfg.lostMs, (why) => end(why));
  await pc.setLocalDescription(await pc.createOffer());
  await gathered(pc, cfg.gatherMs);
  let payload;
  try { payload = encodePayload({ kind: KIND.offer, slot: o.slot, build: o.build, label: o.label || '', sdp: pc.localDescription.sdp }); }
  catch (e) { end('error'); throw e; }
  openTimer = setTimeout(() => { if (!opened) end('timeout'); }, cfg.openMs);
  return {
    payload, slot: o.slot,
    /** @param {string} code the guest's answer */
    async accept(code) {
      if (ended) throw new SignalError('closed', 'invitation closed');
      const a = decodePayload(code);
      if (a.kind !== KIND.answer) throw new SignalError('wrong-kind');
      if (a.slot !== o.slot) throw new SignalError('wrong-slot');
      if (o.build && a.build !== o.build) throw new SignalError('version', a.build);
      await pc.setRemoteDescription({ type: 'answer', sdp: a.sdp });
      onState('connecting');
    },
    close() { end('host'); },
    get open() { return opened && !ended; },
    get ended() { return ended; },
  };
}

/**
 * Guest side: answer the host's code; the returned socket is the client's S.ws.
 * @param {string} code the host's offer
 * @param {{ build: string, RTCPeerConnection?: any, gatherMs?: number, openMs?: number, lostMs?: number }} o
 */
export async function guestAnswer(code, o) {
  const cfg = Object.assign({}, RTC_DEFAULTS, o);
  const off = decodePayload(code);
  if (off.kind !== KIND.offer) throw new SignalError('wrong-kind');
  if (o.build && off.build !== o.build) throw new SignalError('version', off.build);
  const pc = newPc(o);
  /** @type {any} */ let dc = null;
  let ended = false, openTimer = null, unwatch = () => {};
  const sock = new PipeSocket((u8) => { if (dc && dc.readyState === 'open') { try { dc.send(u8); } catch (e) {} } });
  const end = (why, local) => {
    if (ended) return; ended = true;
    clearTimeout(openTimer); unwatch();
    try { if (dc) dc.close(); } catch (e) {}
    try { pc.close(); } catch (e) {}
    if (!local) sock._remoteClosed('nearby-' + why);
  };
  sock.onLocalClose = () => end('closed', true);
  pc.ondatachannel = (ev) => {
    if (dc || ended) return;
    dc = ev.channel; dc.binaryType = 'arraybuffer';
    dc.onmessage = (m) => { if (m.data) sock._deliver(new Uint8Array(m.data)); };
    dc.onclose = () => end('closed');
    const opened = () => { clearTimeout(openTimer); sock._open(); };
    if (dc.readyState === 'open') opened(); else dc.onopen = opened;
  };
  unwatch = watch(pc, cfg.lostMs, (why) => end(why));
  await pc.setRemoteDescription({ type: 'offer', sdp: off.sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await gathered(pc, cfg.gatherMs);
  let payload;
  try { payload = encodePayload({ kind: KIND.answer, slot: off.slot, build: o.build || off.build, label: '', sdp: pc.localDescription.sdp }); }
  catch (e) { end('error', true); throw e; }
  openTimer = setTimeout(() => { if (sock.readyState === 0) end('timeout'); }, cfg.openMs);
  return { payload, socket: sock, host: off.label, slot: off.slot, close() { sock.close(); } };
}
