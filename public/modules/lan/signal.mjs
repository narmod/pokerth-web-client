// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/signal.mjs — « Play nearby » connection codes
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// Two phones on one Wi-Fi connect with WebRTC, which needs one message each
// way before anything flows: the host's OFFER, then the guest's ANSWER. With
// no server to carry them, a person does: QR code, the share sheet (AirDrop /
// Quick Share) or a pasted code (step 3). A raw SDP is 1–3 KB, too much for a
// comfortable QR code, so only what matters is kept and the SDP is rebuilt on
// the other side from a fixed template — about 150–250 characters.
//
// Payload v1 (binary, then base64url without padding):
//   u8   (NEARBY_PROTOCOL << 4) | kind        kind 1 = offer, 2 = answer
//   u16  slot                                  pairs an answer with its offer
//   str8 build                                 BUILD_VERSION: both ends must match
//   str8 label                                 offer: the host's nickname; answer: ''
//   str8 ice-ufrag, str8 ice-pwd
//   32 B DTLS fingerprint (SHA-256)
//   u8   DTLS setup                            0 actpass · 1 active · 2 passive
//   u8   candidate count, then per candidate:
//        u8 kind (4 IPv4 · 6 IPv6 · 1 mDNS name <uuid>.local · 2 other name, str8)
//        address bytes, u16 port               (UDP host candidates only: no STUN,
//                                               no TURN, same Wi-Fi)
// str8 = u8 length + UTF-8 bytes. Big-endian integers. The format is versioned
// (NEARBY_PROTOCOL) and documented so another client could speak it.
// ─────────────────────────────────────────────────────────────────────────

import { NEARBY_PROTOCOL } from './protocol.mjs';

export const KIND = Object.freeze({ offer: 1, answer: 2 });
const SETUP = ['actpass', 'active', 'passive'];
const UUID_RE = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\.local$/i;

export class SignalError extends Error {
  /** @param {string} code  'bad-code' | 'unsupported' | 'no-candidates' | 'wrong-kind' */
  constructor(code, msg) { super(msg || code); this.code = code; }
}

// ── SDP → fields ───────────────────────────────────────────────────────────
/**
 * The parts of a local description the other side needs.
 * @param {string} sdp
 */
export function parseSdp(sdp) {
  const lines = String(sdp || '').split(/\r?\n/);
  const get = (k) => { const l = lines.find(x => x.startsWith('a=' + k + ':')); return l ? l.slice(k.length + 3).trim() : ''; };
  const ufrag = get('ice-ufrag'), pwd = get('ice-pwd'), fp = get('fingerprint'), setup = get('setup');
  const m = /^sha-256\s+([0-9A-F:]+)$/i.exec(fp);
  if (!ufrag || !pwd || !m) throw new SignalError('unsupported', 'missing ICE credentials or SHA-256 fingerprint');
  const fpHex = m[1].split(':');
  if (fpHex.length !== 32) throw new SignalError('unsupported', 'fingerprint is not 32 bytes');
  const cands = [];
  for (const l of lines) {
    if (!l.startsWith('a=candidate:')) continue;
    // candidate:<foundation> <component> <transport> <priority> <address> <port> typ <type> …
    const p = l.slice(12).trim().split(/\s+/);
    if (p.length < 8 || p[1] !== '1' || p[2].toLowerCase() !== 'udp' || p[6] !== 'typ' || p[7] !== 'host') continue;
    const port = parseInt(p[5], 10);
    if (!(port > 0 && port < 65536)) continue;
    if (!cands.some(c => c.address === p[4] && c.port === port)) cands.push({ address: p[4], port });
  }
  return { ufrag, pwd, fingerprint: fpHex.map(h => parseInt(h, 16)), setup: Math.max(0, SETUP.indexOf(setup)), candidates: cands };
}

// ── fields → SDP ───────────────────────────────────────────────────────────
/**
 * Rebuild a description the browser accepts as the remote one.
 * @param {{ ufrag: string, pwd: string, fingerprint: number[], setup: number, candidates: {address: string, port: number}[] }} f
 */
export function buildSdp(f) {
  const hex = f.fingerprint.map(b => (b < 16 ? '0' : '') + b.toString(16).toUpperCase()).join(':');
  let sid = 0; for (const ch of f.ufrag + f.pwd) sid = (sid * 31 + ch.charCodeAt(0)) % 4294967291;
  const L = [
    'v=0', 'o=- ' + (1000000000 + sid) + ' 2 IN IP4 127.0.0.1', 's=-', 't=0 0',
    'a=group:BUNDLE 0', 'a=msid-semantic: WMS',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0',
  ];
  f.candidates.forEach((c, i) => L.push('a=candidate:' + (i + 1) + ' 1 udp ' + (2113937151 - i) + ' ' + c.address + ' ' + c.port + ' typ host'));
  L.push('a=end-of-candidates', 'a=ice-ufrag:' + f.ufrag, 'a=ice-pwd:' + f.pwd, 'a=ice-options:trickle',
    'a=fingerprint:sha-256 ' + hex, 'a=setup:' + (SETUP[f.setup] || 'actpass'), 'a=mid:0',
    'a=sctp-port:5000', 'a=max-message-size:262144');
  return L.join('\r\n') + '\r\n';
}

// ── bytes ──────────────────────────────────────────────────────────────────
const enc = new TextEncoder(), dec = new TextDecoder();
function b64url(u8) {
  let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64url(str) {
  const s = String(str || '').trim().replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*$/.test(s)) throw new SignalError('bad-code');
  const bin = atob(s + '==='.slice((s.length + 3) % 4));
  const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}
function ipv4(a) { const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(a); if (!m) return null; const b = m.slice(1).map(Number); return b.every(x => x < 256) ? b : null; }
function ipv6(a) {
  if (!/^[0-9a-f:]+$/i.test(a) || a.indexOf(':') < 0) return null;
  const halves = a.split('::'); if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [], tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = 8 - head.length - tail.length; if (fill < 0 || (halves.length === 1 && fill !== 0)) return null;
  const words = head.concat(Array(halves.length === 2 ? fill : 0).fill('0'), tail);
  if (words.length !== 8 || words.some(w => !/^[0-9a-f]{1,4}$/i.test(w))) return null;
  const out = []; for (const w of words) { const v = parseInt(w, 16); out.push(v >> 8, v & 0xff); } return out;
}
// RFC 5952 text: the longest run (2+) of zero words becomes '::'.
function v6text(b) {
  const w = []; for (let i = 0; i < 16; i += 2) w.push((b[i] << 8) | b[i + 1]);
  let bs = -1, bl = 0;
  for (let i = 0; i < 8;) { if (w[i]) { i++; continue; } let j = i; while (j < 8 && !w[j]) j++; if (j - i > bl) { bs = i; bl = j - i; } i = j; }
  const hex = w.map(x => x.toString(16));
  if (bl < 2) return hex.join(':');
  return hex.slice(0, bs).join(':') + '::' + hex.slice(bs + bl).join(':');
}

/**
 * Encode a local description as a connection code.
 * @param {{ kind: number, slot: number, build: string, label?: string, sdp: string }} o
 */
export function encodePayload(o) {
  const f = parseSdp(o.sdp);
  if (!f.candidates.length) throw new SignalError('no-candidates', 'no local network address');
  const out = [];
  const str8 = (s) => { let b = enc.encode(String(s || '')); if (b.length > 255) b = b.slice(0, 255); out.push(b.length, ...b); };
  out.push(((NEARBY_PROTOCOL & 0x0f) << 4) | (o.kind & 0x0f), (o.slot >> 8) & 0xff, o.slot & 0xff);
  str8(o.build); str8(o.label || ''); str8(f.ufrag); str8(f.pwd);
  out.push(...f.fingerprint, f.setup);
  const cands = f.candidates.slice(0, 8);
  out.push(cands.length);
  for (const c of cands) {
    const v4 = ipv4(c.address), v6 = v4 ? null : ipv6(c.address), u = (v4 || v6) ? null : UUID_RE.exec(c.address);
    if (v4) out.push(4, ...v4);
    else if (v6) out.push(6, ...v6);
    else if (u) { out.push(1); const hex = u.slice(1).join(''); for (let i = 0; i < 32; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16)); }
    else { out.push(2); str8(c.address); }
    out.push((c.port >> 8) & 0xff, c.port & 0xff);
  }
  return b64url(new Uint8Array(out));
}

/**
 * Decode a connection code (as typed, scanned or opened from a link).
 * @param {string} code
 * @returns {{ protocol: number, kind: number, slot: number, build: string, label: string, sdp: string, fields: any }}
 */
export function decodePayload(code) {
  let b;
  try { b = unb64url(code); } catch (e) { throw new SignalError('bad-code'); }
  let i = 0;
  const need = (n) => { if (i + n > b.length) throw new SignalError('bad-code', 'truncated'); };
  const u8 = () => { need(1); return b[i++]; };
  const str8 = () => { const n = u8(); need(n); const s = dec.decode(b.slice(i, i + n)); i += n; return s; };
  const head = u8();
  const protocol = head >> 4, kind = head & 0x0f;
  if (protocol !== NEARBY_PROTOCOL) throw new SignalError('unsupported', 'protocol ' + protocol);
  if (kind !== KIND.offer && kind !== KIND.answer) throw new SignalError('bad-code', 'kind ' + kind);
  const slot = (u8() << 8) | u8();
  const build = str8(), label = str8(), ufrag = str8(), pwd = str8();
  need(32); const fingerprint = Array.from(b.slice(i, i + 32)); i += 32;
  const setup = u8();
  const n = u8(); const candidates = [];
  for (let k = 0; k < n; k++) {
    const t = u8(); let address;
    if (t === 4) { need(4); address = Array.from(b.slice(i, i + 4)).join('.'); i += 4; }
    else if (t === 6) { need(16); address = v6text(b.slice(i, i + 16)); i += 16; }
    else if (t === 1) {
      need(16); const h = Array.from(b.slice(i, i + 16)).map(x => (x < 16 ? '0' : '') + x.toString(16)).join(''); i += 16;
      address = h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) + '.local';
    } else if (t === 2) { address = str8(); if (!/^[A-Za-z0-9.\-]+$/.test(address)) throw new SignalError('bad-code', 'address'); }
    else throw new SignalError('bad-code', 'candidate kind ' + t);
    const port = (u8() << 8) | u8();
    candidates.push({ address, port });
  }
  if (i !== b.length) throw new SignalError('bad-code', 'trailing bytes');
  if (!ufrag || !pwd || !candidates.length || !/^[\x21-\x7e]+$/.test(ufrag + pwd)) throw new SignalError('bad-code');
  const fields = { ufrag, pwd, fingerprint, setup, candidates };
  return { protocol, kind, slot, build, label, sdp: buildSdp(fields), fields };
}
