// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Listening now (web extension, narmod 2026-11-28). Not in the official QML
// client.
//
// Tells the proxy what the music panel is playing at this instant, so the
// admin's Live › Sessions can show how many players listen to each track or
// radio station. A total per title only: no nickname, no table, nothing kept.
//
// Only sockets to OUR proxy speak: the proxy announces itself with the text
// frame « MLIVE:1 » (game bridge or notice channel, proxy.js) and the socket
// that received it is tracked here. A direct socket to pokerth.net, the
// offline FakeServer, a « Play nearby » link or an older proxy never send it,
// so nothing is ever written to them.
//
// Frame: « M:<tab>:<id> » when playback changes, « M:<tab>: » when it pauses
// or stops. <tab> is drawn per page load and never stored: it lets a tab with
// two sockets to the proxy (a game bridge and the Mini-games channel, say)
// count once. Playback state comes from the 'pth-music-state' event that
// music.mjs already sends on every change.
// ═══════════════════════════════════════════════════════════════════

const CAP = 'MLIVE:1';

/** A random token for this page load (letters and digits, 16 chars). */
function newTab() {
  let s = '';
  try {
    const a = new Uint8Array(12);
    crypto.getRandomValues(a);
    a.forEach((b) => { s += (b % 36).toString(36); });
  } catch (e) {}
  while (s.length < 16) s += Math.random().toString(36).slice(2);
  return s.replace(/[^a-z0-9]/g, '').slice(0, 16);
}

const tab = newTab();
const socks = /** @type {Set<WebSocket>} */ (new Set());
let cur = '';          // id playing now, '' = nothing
let spoke = false;     // nothing is sent before the first playback

/** The frame for the current state. */
export function frame() { return 'M:' + tab + ':' + cur; }

function sendTo(ws) {
  if (!spoke) return;
  if (!ws || ws.readyState !== 1) { socks.delete(ws); return; }
  try { ws.send(frame()); } catch (e) {}
}

/**
 * Called with each text frame a proxy socket receives. Returns true when the
 * frame was the proxy's announcement (the caller then ignores it).
 * @param {WebSocket|null} ws
 * @param {any} data
 */
export function ctl(ws, data) {
  if (data !== CAP) return false;
  if (ws && typeof ws.send === 'function') {
    socks.add(ws);
    try { ws.addEventListener('close', () => { socks.delete(ws); }); } catch (e) {}
    sendTo(ws);
  }
  return true;
}

/**
 * Playback changed (music.mjs, 'pth-music-state').
 * @param {boolean} playing
 * @param {string|null} id
 */
export function update(playing, id) {
  const next = (playing && id) ? String(id) : '';
  if (next === cur) return;
  cur = next;
  if (next) spoke = true;
  Array.from(socks).forEach(sendTo);
}

/** For the tests. */
export function state() { return { tab, cur, spoke, socks: socks.size }; }

if (typeof document !== 'undefined') {
  document.addEventListener('pth-music-state', (e) => {
    const d = /** @type {any} */ (e).detail || {};
    update(!!d.playing, d.id || null);
  });
}
// The classic main script (pokerth.js) reaches it through window.
if (typeof window !== 'undefined') /** @type {any} */ (window)._pthMusicLive = { ctl };
