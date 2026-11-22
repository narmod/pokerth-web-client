// ═══════════════════════════════════════════════════════════════════
// Reconnect hold — game server restarts and lost Internet (web.152).
//
// The usual reconnect (pokerth.js: 5 s, then 6 · 12 · 24 · 30 · 30 s) gives up
// after about 1 min 50. That fits a network blip, not the two cases seen in
// the lobby chat (17–22/11/2026):
//
//   · the PokerTH game server restarts (« Server will be restarted in 5
//     Minutes »): the proxy answers each attempt with close code 4504
//     « game-server-unreachable » (proxy.js, UPSTREAM_UNREACHABLE). The player's
//     own connection works, so we say so, and wait for the server: one try
//     every 20 s ± 5 s (spread, so the players do not all come back in the
//     same second), for at most 30 minutes, then a « still unavailable »
//     window with the manual reconnect;
//   · the device itself is offline (navigator.onLine === false): no counter
//     to burn — we wait for the browser's « online » event and try at once,
//     with a safety try every 60 s in case that event never comes.
//
// Any other close keeps the usual policy. With an older proxy (no 4504) the
// behaviour is exactly the previous one. The attempt counter is held at 1 while
// we wait, so once the server is back a later blip still gets its attempts.
// Timers live in window._reconnectTimer / window._reconnectCountdown, the
// ones App.disconnect() already clears.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';

export const CLOSE_GAME_SERVER_UNREACHABLE = 4504;
export const RETRY_MS = 20000;
export const JITTER_MS = 5000;
export const MAX_WAIT_MS = 30 * 60 * 1000;
export const OFFLINE_SAFETY_MS = 60000;

let since = 0;          // first 4504 of the current outage (0 = none)
let onlineCb = null;    // pending « online » listener

/** 'server' | 'offline' | '' for a WebSocket close event. */
export function kindOf(ev, online) {
  if (ev && ev.code === CLOSE_GAME_SERVER_UNREACHABLE) return 'server';
  if (online === false) return 'offline';
  return '';
}

/** Next try in ms: RETRY_MS ± JITTER_MS, rnd in [0, 1). */
export function nextDelay(rnd) {
  const r = (typeof rnd === 'number' && rnd >= 0 && rnd < 1) ? rnd : 0.5;
  return RETRY_MS + Math.round((r * 2 - 1) * JITTER_MS);
}

export function expired(start, now) {
  return !!start && (now - start) >= MAX_WAIT_MS;
}

function _unbindOnline() {
  if (onlineCb) {
    try { window.removeEventListener('online', onlineCb); } catch (e) {}
    onlineCb = null;
  }
}

function _stopTimers() {
  try { clearTimeout(window._reconnectTimer); } catch (e) {}
  try { clearInterval(window._reconnectCountdown); } catch (e) {}
  _unbindOnline();
}

/** The link is back and stable: the outage is over. */
export function reset() {
  since = 0;
  _unbindOnline();
}

/** Outage start (for tests / diagnostics). */
export function outageSince() { return since; }

function _banner(msg) {
  try { if (typeof window._showBanner === 'function') window._showBanner(msg); } catch (e) {}
}

/**
 * Called by every reconnect close handler before the usual backoff.
 * deps.open()      : rebind now (App._reconnectOpen);
 * deps.fail(msg)   : give up, back to the connect screen with this message.
 * Returns true when the hold took over (caller stops), false otherwise.
 */
export function hold(ev, deps) {
  const online = (typeof navigator !== 'undefined' && 'onLine' in navigator) ? navigator.onLine : undefined;
  const kind = kindOf(ev, online);
  if (!kind || !deps || typeof deps.open !== 'function') return false;
  _stopTimers();
  // 1, not 0: the rebind's first frame hides the banner as after any attempt
  // (pokerth.js onmessage), and _armReconnectStable clears it once stable.
  S._reconnectAttempts = 1;

  if (kind === 'offline') {
    _banner(t('netOfflineBanner'));
    const go = () => {
      _stopTimers();
      // Let the new network settle (DHCP, DNS) before dialling.
      window._reconnectTimer = setTimeout(deps.open, 1000 + Math.round(Math.random() * 2000));
    };
    onlineCb = go;
    try { window.addEventListener('online', onlineCb); } catch (e) {}
    window._reconnectTimer = setTimeout(go, OFFLINE_SAFETY_MS);
    return true;
  }

  // kind === 'server'
  const now = Date.now();
  if (!since) since = now;
  if (expired(since, now)) {
    since = 0;
    try { if (typeof deps.fail === 'function') deps.fail(t('srvDownGaveUp')); } catch (e) {}
    return true;
  }
  const delay = nextDelay(Math.random());
  let left = Math.round(delay / 1000);
  const tick = () => {
    _banner(t('srvDownBanner', { s: left }));
    if (left > 0) left--;
  };
  tick();
  window._reconnectCountdown = setInterval(tick, 1000);
  window._reconnectTimer = setTimeout(() => {
    try { clearInterval(window._reconnectCountdown); } catch (e) {}
    deps.open();
  }, delay);
  return true;
}

const api = { hold, reset, kindOf, nextDelay, expired, outageSince,
              CLOSE_GAME_SERVER_UNREACHABLE, RETRY_MS, JITTER_MS, MAX_WAIT_MS };
try { window.PthReconnHold = api; } catch (e) {}
export default api;
