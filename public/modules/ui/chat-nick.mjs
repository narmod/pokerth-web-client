// ═══════════════════════════════════════════════════════════════════
// Chat nicknames: player card on a tap, menu on right-click / long-press
// (web.153).
//
// Lobby chat 21/11/2026: a troll spent an hour in the lobby and the players
// asked how to ignore him — the answer was « find him in the player list ».
// A nickname in the chat now does what a seat already does (seat-render.mjs):
//   · click / tap        → the player card (openPlayerInfoPopup);
//   · right-click        → the seat menu (ui/seat-menu.mjs) with, in front,
//   · long-press (touch)   « Player card », « Private message », « Quote »,
//                          then note, profile, ignore, report, kickban;
//   · a player who left the server keeps « Quote » and « Ignore » (by name).
// « Quote » writes « Name: » into the input of the panel clicked. Ignoring from
// the chat goes by name and does not reopen the card (the seat path does).
// Lobby chat (#chat) and game chat (#g-chat-msgs), « /me » lines included
// (their sender is a .who too since web.153). Option: Advanced options → Chat
// (chat_nick_menu, on by default; body.adv-no-chatnick when off).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { openSeatMenu, closeSeatMenu, initSeatMenu } from './seat-menu.mjs';
import { openPlayerInfoPopup } from './player-popup.mjs';

const PANELS = '#chat, #g-chat-msgs';
const BOT = '(chat bot)';
const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE = 10;

export function enabled() {
  try { return typeof window._advGet === 'function' ? !!window._advGet('chat_nick_menu', true) : true; }
  catch (e) { return true; }
}

/** The nickname under the event, or null: {name, el, panel: 'lobby'|'game'}. */
export function nickAt(target) {
  const el = target && target.closest ? target.closest('.who') : null;
  if (!el || !el.closest(PANELS)) return null;
  const name = (el.textContent || '').trim();
  if (!name || name === BOT || name.charAt(0) === '#') return null;
  return { name, el, panel: el.closest('#g-chat-msgs') ? 'game' : 'lobby' };
}

/** Player id for a chat name: online on the server, else seated at my table, else 0. */
export function pidByName(name) {
  if (!name) return 0;
  if (name === S.myName && S.myId) return S.myId;
  try { const p = window._pmPlayerId ? window._pmPlayerId(name) : 0; if (p) return p; } catch (e) {}
  try {
    const seats = S.seats || [];
    for (let i = 0; i < seats.length; i++) {
      const pid = seats[i];
      if (S.players && S.players[pid] === name && !(S.seatData && S.seatData[pid] && S.seatData[pid].gone)) return pid;
    }
  } catch (e) {}
  return 0;
}

/** « Name: » in the input of the panel the nickname was clicked in. */
export function quote(name, panel) {
  const inp = document.getElementById(panel === 'game' ? 'g-chat-in' : 'chat-in');
  if (!inp || !name) return;
  const lead = name + ': ';
  const cur = inp.value || '';
  let v = cur.indexOf(lead) === 0 ? cur : (cur.trim() ? lead + cur : lead);
  const max = parseInt(inp.getAttribute('maxlength'), 10) || 128;
  if (v.length > max) v = v.slice(0, max);
  inp.value = v;
  try { inp.focus({ preventScroll: true }); inp.setSelectionRange(v.length, v.length); } catch (e) {}
  try { inp.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
}

/** Ignore / stop ignoring by name, with the usual confirmation; no card reopened. */
export function toggleIgnoreByName(name) {
  if (!name || typeof window._setIgnoredName !== 'function') return;
  const will = !(window._isIgnored && window._isIgnored(name));
  try {
    if (window._advGet && window._advGet('confirm_social', true)) {
      const k = will ? 'ignoreConfirm' : 'unignoreConfirm';
      const tr = t(k, { name });
      const q = (tr && tr !== k) ? tr : (will ? ('Ignore ' + name + '?') : ('Stop ignoring ' + name + '?'));
      if (!window.confirm(q)) return;
    }
  } catch (e) {}
  window._setIgnoredName(name, will);
  try { if (typeof window.renderIgnoredList === 'function') window.renderIgnoredList(); } catch (e) {}
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
}

export function openNickMenu(hit, x, y) {
  const pid = pidByName(hit.name);
  return openSeatMenu(pid, x, y, {
    chat: true, name: hit.name,
    quote: (n) => quote(n, hit.panel),
    ignore: (n) => toggleIgnoreByName(n),
  });
}

function openCard(hit, x, y) {
  const pid = pidByName(hit.name);
  if (pid) { closeSeatMenu(); openPlayerInfoPopup(pid); return; }
  openNickMenu(hit, x, y);           // gone from the server: the menu is all there is
}

let _bound = false;
export function bind(doc) {
  if (_bound || !doc || !doc.addEventListener) return;
  _bound = true;
  try { initSeatMenu(); } catch (e) {}
  let lpTimer = null, lpX = 0, lpY = 0, lpFired = false;
  const lpCancel = () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } };

  doc.addEventListener('contextmenu', (ev) => {
    if (!enabled()) return;
    const hit = nickAt(ev.target);
    if (!hit) return;
    ev.preventDefault();
    openNickMenu(hit, ev.clientX, ev.clientY);
  });
  doc.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType !== 'touch' || !enabled()) return;
    const hit = nickAt(ev.target);
    if (!hit) return;
    lpX = ev.clientX; lpY = ev.clientY; lpFired = false;
    lpCancel();
    lpTimer = setTimeout(() => { lpTimer = null; lpFired = openNickMenu(hit, lpX, lpY); }, LONG_PRESS_MS);
  }, { passive: true });
  doc.addEventListener('pointermove', (ev) => {
    if (!lpTimer) return;
    if (Math.abs(ev.clientX - lpX) > MOVE_TOLERANCE || Math.abs(ev.clientY - lpY) > MOVE_TOLERANCE) lpCancel();
  }, { passive: true });
  doc.addEventListener('pointerup', lpCancel, { passive: true });
  doc.addEventListener('pointercancel', () => { lpCancel(); lpFired = false; }, { passive: true });
  doc.addEventListener('click', (ev) => {
    const hit = nickAt(ev.target);
    if (!hit) return;
    if (lpFired) { lpFired = false; ev.preventDefault(); ev.stopPropagation(); return; }
    if (!enabled()) return;
    // A tap that ends a text selection is not a request for the card.
    try { const sel = window.getSelection && window.getSelection(); if (sel && !sel.isCollapsed && String(sel).trim()) return; } catch (e) {}
    ev.preventDefault();
    openCard(hit, ev.clientX, ev.clientY);
  });
}

if (typeof document !== 'undefined') bind(document);

const api = { enabled, nickAt, pidByName, quote, toggleIgnoreByName, openNickMenu, bind };
try { window.PthChatNick = api; } catch (e) {}
export default api;
