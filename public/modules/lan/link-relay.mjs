// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/link-relay.mjs — « Play nearby »: a code link opened in
// another tab (web extension, no QML counterpart; narmod 2026-10-31).
//
// When the host scans a guest's answer with the phone's own camera app (or
// opens it from AirDrop / a messenger), the browser opens the link in a NEW
// tab, while the game runs in the first one. The new tab hands the code over
// on a BroadcastChannel and tells the player he can close it; the game tab
// takes it as if it had been scanned in the app.
//
//   game tab:   const stop = listenForCodes((found) => wantIt(found));   // true = taken
//   new tab:    if (await relayCode(found)) → « sent to your game, close this tab »
//               else → handle it here (nobody took it).
// Same browser and same origin only: an installed iOS app (home screen) does
// not share this channel with Safari — the UI then offers « paste the code ».
// `found` is what codes.mjs readCode() returns ({ code, kind, info }).
// ─────────────────────────────────────────────────────────────────────────

import { readCode } from './codes.mjs';

export const RELAY_CHANNEL = 'pth-nearby-codes';

function _bc() {
  const BC = /** @type {any} */ (globalThis).BroadcastChannel;
  return typeof BC === 'function' ? new BC(RELAY_CHANNEL) : null;
}

/**
 * Game tab: receive codes opened elsewhere. `take(found)` returns true when
 * this tab used the code (the sender is then told).
 * @param {(found: ReturnType<typeof readCode>) => boolean} take
 * @returns {() => void} stop listening
 */
export function listenForCodes(take) {
  const ch = _bc(); if (!ch) return () => {};
  ch.onmessage = (ev) => {
    const m = ev && ev.data;
    if (!m || m.k !== 'code' || typeof m.code !== 'string' || typeof m.id !== 'string') return;
    let found; try { found = readCode(m.code); } catch (e) { return; }
    let taken = false; try { taken = !!take(found); } catch (e) {}
    if (taken) { try { ch.postMessage({ k: 'taken', id: m.id }); } catch (e) {} }
  };
  return () => { try { ch.close(); } catch (e) {} };
}

/**
 * New tab: offer the code to a game tab. Resolves true when one took it.
 * @param {{ code: string }} found @param {number} [timeoutMs]
 */
export function relayCode(found, timeoutMs) {
  return new Promise((resolve) => {
    const ch = _bc(); if (!ch) return resolve(false);
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const done = (v) => { clearTimeout(t); try { ch.close(); } catch (e) {} resolve(v); };
    const t = setTimeout(() => done(false), timeoutMs || 1500);
    ch.onmessage = (ev) => { const m = ev && ev.data; if (m && m.k === 'taken' && m.id === id) done(true); };
    try { ch.postMessage({ k: 'code', code: found.code, id }); } catch (e) { done(false); }
  });
}
