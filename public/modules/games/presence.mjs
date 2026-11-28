// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The Mini-games page, seen live on the admin board (web extension, narmod
// 2026-11-20). Not in the official QML client.
//
// While the page is open, a notice-only channel to the proxy that serves the
// app (?notify=1&mode=arcade) — the same light channel training opens in
// pokerth.js (_openNotifyWS), kept apart so the two never close each other.
// Admin › Overview, Live › Sessions and Live › Map count it under
// « Mini-games », and the player gets the admin broadcasts like everyone.
//
// One text frame « G:<id> » says the game on screen ('' = the page's home);
// « M:… » frames say what the music panel plays (net/music-live.mjs).
// No nickname, no id: the proxy keeps the game with the socket and drops it
// with it (proxy.js, notify branch). Offline (installed app without network,
// a static host without the proxy) the dial fails quietly and is tried again
// while the page stays open.
// ═══════════════════════════════════════════════════════════════════

import { ctl as musicLiveCtl } from '../net/music-live.mjs';

const RETRY_MS = 15000, OFFLINE_RETRY_MS = 30000;
let sock = /** @type {WebSocket|null} */ (null);
let timer = /** @type {any} */ (null);
let want = false;
let game = '';

/** The channel's address: the site that serves the app hosts the proxy. */
export function channelUrl(loc = location, win = /** @type {any} */ (window)) {
  let u = (loc.protocol === 'https:' ? 'wss://' : 'ws://') + loc.host + '/?notify=1&mode=arcade';
  if (win.BUILD_VERSION) u += '&v=' + encodeURIComponent(win.BUILD_VERSION);
  // The browser time zone, read by the proxy as a country code for Live › Map.
  try { const z = win._pthTimeZone && win._pthTimeZone(); if (z) u += '&tz=' + encodeURIComponent(z); } catch (e) {}
  return u;
}

function frame() { return 'G:' + game; }

function dial() {
  timer = null;
  if (!want || typeof WebSocket === 'undefined') return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { timer = setTimeout(dial, OFFLINE_RETRY_MS); return; }
  let s = null;
  try { s = new WebSocket(channelUrl()); } catch (e) {}
  if (!s) { timer = setTimeout(dial, OFFLINE_RETRY_MS); return; }
  const me = s;
  sock = me;
  me.onopen = () => { if (game) { try { me.send(frame()); } catch (e) {} } };
  me.onmessage = (e) => {
    // « MLIVE:1 »: this channel also carries what the music panel plays.
    if (musicLiveCtl(me, e.data)) return;
    const h = /** @type {any} */ (window)._handleCtrlFrame;
    if (typeof e.data === 'string' && typeof h === 'function') { try { h(e.data); } catch (x) {} }
  };
  me.onerror = () => { try { me.close(); } catch (e) {} };
  me.onclose = () => {
    if (me !== sock) return;
    sock = null;
    if (want && !timer) timer = setTimeout(dial, RETRY_MS);
  };
}

/** The page opened: show up on the admin board. */
export function enter() {
  if (want) return;
  want = true; game = '';
  dial();
}

/** The game on screen changed ('' = the page's home). */
export function setGame(id) {
  game = String(id || '');
  if (sock && sock.readyState === 1) { try { sock.send(frame()); } catch (e) {} }
}

/** The page closed: leave the board. */
export function leave() {
  want = false; game = '';
  if (timer) { clearTimeout(timer); timer = null; }
  const s = sock; sock = null;
  if (s) { s.onclose = null; try { s.close(); } catch (e) {} }
}

/** For the tests: is the channel wanted, and what is on screen. */
export function state() { return { want, game, open: !!(sock && sock.readyState === 1) }; }
