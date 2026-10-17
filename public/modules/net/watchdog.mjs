// Connection watchdog with an active probe — parity with upstream 934457e
// (QML ClientThread::TimerConnectionWatchdog, 2026-10-12).
//
// The passive watchdog in pokerth.js can only wait: at the table the server
// legitimately says nothing during MY turn, so its threshold has to exceed the
// action timeout (up to ~80 s), and in a quiet lobby it leans on the 45 s
// heartbeat (~110 s). Here, once the server has been silent for a while, we
// ask it something it always answers: a PlayerInfoRequest for a player id that
// cannot exist (0xFFFFFFFF). The server excludes that request from player
// activity (NetPacket::IsClientActivity), so neither the AFK timeout nor the
// lobby idle timeout is touched. Any frame received counts as an answer
// (S._lastRxTime, refreshed by onRawData), and onRawData also hides the notice.
//
//   at the table : probe after  5 s of silence, notice at 10 s, drop at 30 s
//                  (the QML values);
//   in the lobby : probe after 50 s — just past the server's 45 s heartbeat,
//                  so a healthy lobby never needs one — notice at 60 s, drop
//                  at 80 s. Fewer probes where most of the players are.
// After a drop the usual forced reconnect runs: through the proxy it rebinds
// to the same PokerTH session while the session grace holds.
//
// Only against servers announcing 2.1 or later (IsClientActivity has excluded
// PlayerInfoRequest since early 2026): on an older server a probe could count
// as activity and keep an idle player connected. There, and in training,
// /live, hidden tabs or offline, the passive watchdog stays in charge.
import { S } from '../game/state.mjs';
import { Proto } from './proto.mjs';
import { MSG } from './messages.mjs';
import { send, _forceReconnect } from './session.mjs';
import { t } from '../i18n.mjs';

export const PROBE_PID = 0xFFFFFFFF;
export const LOOP_MS = 1000;
// A tick arriving this much later than expected means the page was asleep
// (timers frozen): probe right away instead of declaring the link dead.
export const RESUME_GAP_MS = 5000;
export const TABLE = { probe: 5000, stalled: 10000, dead: 30000 };
export const LOBBY = { probe: 50000, stalled: 60000, dead: 80000 };
// Probes are repeated at most this often while the silence lasts.
export const PROBE_EVERY_MS = 5000;
// Lowest server version (major << 8 | minor) the probe is sent to.
export const MIN_SERVER = 0x0201;

export function serverSupportsProbe(ver) {
  return (ver | 0) >= MIN_SERVER;
}

// One watchdog step, pure: `st` is the watchdog's own memory
// ({ lastTick, lastProbe }), `lastRx` the time of the last frame received,
// `thr` TABLE or LOBBY. Returns the (possibly advanced) lastRx and what to do.
export function step(st, now, lastRx, thr) {
  let rx = lastRx || 0;
  if (st.lastTick && now - st.lastTick > LOOP_MS + RESUME_GAP_MS) {
    // Back from a sleep: the silence was ours, not the server's.
    rx = Math.max(rx, now - thr.probe);
    st.lastProbe = 0;
  }
  st.lastTick = now;
  const silence = now - rx;
  const out = { lastRx: rx, probe: false, stalled: silence >= thr.stalled, dead: silence >= thr.dead };
  if (!out.dead && silence >= thr.probe && now - (st.lastProbe || 0) >= PROBE_EVERY_MS) {
    out.probe = true;
    st.lastProbe = now;
  }
  return out;
}

function _screen() {
  const sg = document.getElementById('s-game');
  if (sg && sg.classList.contains('active')) return 'game';
  const sl = document.getElementById('s-lobby');
  if (sl && sl.classList.contains('active')) return 'lobby';
  return '';
}

// Is the active watchdog in charge right now? (The passive one in pokerth.js
// stands down while it is.)
export function probing() {
  try {
    if (window._offlineMode || window.LIVE_MODE) return false;
    if (S._intentionalDisconnect || !S._lastConnectParams) return false;
    if (!S.ws || S.ws.readyState !== 1) return false;
    if (!serverSupportsProbe(S._srvVer)) return false;
    if (document.hidden) return false;
    if (typeof navigator.onLine === 'boolean' && !navigator.onLine) return false;
    return !!_screen();
  } catch (e) { return false; }
}

export function buildProbe() {
  return Proto.encode([[1, 0, MSG.T.PlayerInfoRequest], [19, 2, Proto.encode([[1, 0, PROBE_PID]])]]);
}

const _st = { lastTick: 0, lastProbe: 0, stalled: false };

function tick() {
  if (!probing()) { _st.lastTick = 0; _st.lastProbe = 0; _st.stalled = false; return; }
  const now = Date.now();
  const r = step(_st, now, S._lastRxTime, _screen() === 'game' ? TABLE : LOBBY);
  if (r.lastRx > (S._lastRxTime || 0)) S._lastRxTime = r.lastRx;
  if (r.dead) {
    _st.stalled = false; _st.lastTick = 0; _st.lastProbe = 0;
    _forceReconnect('server not responding to the connection probe');
    return;
  }
  if (r.probe) { try { send(buildProbe()); } catch (e) {} }
  if (r.stalled && !_st.stalled) {
    _st.stalled = true;
    try { window._showBanner(t('connStalledTitle') + ' — ' + t('connStalledMsg')); } catch (e) {}
  } else if (!r.stalled) {
    // The first frame received already hid the notice (onRawData).
    _st.stalled = false;
  }
}

try {
  window._wdProbing = probing;
  setInterval(tick, LOOP_MS);
} catch (e) {}
