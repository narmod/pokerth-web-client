// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/mini-board.mjs — mini-board of the mobile loupe (web).
//
// WEB ADDITION (narmod 20/09/2026), NOT in the QML client. With the x2 loupe
// the "my turn" pan (QML parity: panX = 0, panY = -(k-1)*h/2) shows the lower
// half of the table: the community cards sit on the upper edge of that window
// and their index corners are cut off - unreadable exactly when the player has
// to decide. The QML client has the same limit (the player drags the view).
//
// Rather than bending the QML framing (pan / zoom factor stay untouched), a
// small fixed copy of the board is shown at the top of the table zone, OUTSIDE
// #g-zoom-layer, only while ALL of these hold:
//   · the loupe is active (window._loupeK > 1, so never during the showdown),
//   · it is my turn and I can act,
//   · at least one dealt community card has its index corner out of view.
// It is a <button>: tap toggles the view between the real cards and the self
// box (window._loupeToggleBoard, pokerth.js); being a button it also keeps the
// loupe drag handler from starting on it. Cards are rendered by cardToHtml in
// a .comm-row context, so deck, 4-colour suits, Interface size and High
// contrast all apply with no card CSS of their own; size = --comm-scale.
// ─────────────────────────────────────────────────────────────────────────
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { cardToHtml } from './deck.mjs';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['\u2666', '\u2665', '\u2660', '\u2663'];   // 0 = diamonds (card 0 = 2 of diamonds)
const SCALE_STD = 0.70;   // share of the normal community card size (narmod)
const SCALE_BIG = 0.78;   // Interface size other than standard
let _sig = '';
let _raf = 0, _tmr = 0;

function _dealt() {
  const out = [];
  const cc = (S && S.commCards) || [];
  for (let i = 0; i < 5; i++) {
    const v = cc[i];
    if (Number.isInteger(v) && v >= 0 && v <= 51) out.push(v);
  }
  return out;
}

function _myTurn() {
  if (!S || S.myId == null || S.turnPid !== S.myId) return false;
  const btns = document.querySelectorAll('.act-buttons-row .btn-action');
  for (const b of btns) {
    if (/** @type {HTMLButtonElement} */ (b).disabled) continue;
    if (/** @type {HTMLElement} */ (b).offsetParent !== null) return true;
  }
  return false;
}

// True when every dealt card shows its index corner (top-left quarter) inside
// the table zone - screen rects, so the loupe transform is taken into account.
function _boardReadable(zone) {
  const zr = zone.getBoundingClientRect();
  const cards = document.querySelectorAll('#g-comm .pk[data-c]');
  if (!cards.length) return true;
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    if (r.width < 2) continue;
    if (r.left < zr.left - 1 || r.top < zr.top - 1
      || r.left + r.width / 2 > zr.right + 1 || r.top + r.height / 2 > zr.bottom + 1) return false;
  }
  return true;
}

// Largest scale that keeps five cards between the floating buttons of the zone
// (chat / reactions on the left, hands / log on the right) when they share the
// mini-board's row; never above the target.
function _fitScale(zone, el, target) {
  try {
    const zr = zone.getBoundingClientRect();
    let left = zr.left + 8, right = zr.right - 8;
    const rowBottom = zr.top + 8 + 64 * target + 16;
    ['chat-toggle-btn', 'react-toggle-btn', 'hands-toggle-btn', 'log-toggle-btn'].forEach(function (id) {
      const b = document.getElementById(id);
      if (!b || b.offsetParent === null) return;
      const r = b.getBoundingClientRect();
      if (r.bottom <= zr.top || r.top >= rowBottom) return;          // not on this row
      if (r.left + r.width / 2 < zr.left + zr.width / 2) left = Math.max(left, r.right + 6);
      else right = Math.min(right, r.left - 6);
    });
    // Symmetric room around the zone centre (the mini-board is centred).
    const cx = zr.left + zr.width / 2;
    const room = 2 * Math.min(cx - left, right - cx);
    // 5 cards of 46 px + 4 gaps of 3 px + the two 11 px street gaps, all x scale; + chrome.
    const natural = 5 * 46 + 4 * 3 + 2 * 11;
    const chrome = 20;
    const s = (room - chrome) / natural;
    return Math.max(0.4, Math.min(target, s));
  } catch (e) { return target; }
}

function _hide(el) {
  if (!el.hidden) { el.hidden = true; }
}

function sync() {
  const el = document.getElementById('g-miniboard');
  const zone = document.getElementById('g-table-zone');
  if (!el || !zone) return;
  const cards = _dealt();
  const on = (window._loupeK || 1) > 1.001 && cards.length >= 3 && _myTurn() && !_boardReadable(zone);
  if (!on) { _hide(el); return; }
  const std = (document.documentElement.getAttribute('data-interface-size') || 'standard') === 'standard';
  const scale = _fitScale(zone, el, std ? SCALE_STD : SCALE_BIG);
  const sig = cards.join(',') + '|' + scale.toFixed(3) + '|' + (document.documentElement.getAttribute('data-deck') || '');
  if (sig !== _sig) {
    _sig = sig;
    el.style.setProperty('--comm-scale', scale.toFixed(3));
    const row = el.querySelector('.mb-row');
    if (row) row.innerHTML = cards.map(function (v) { return cardToHtml(v, false, true, ''); }).join('');
    const spoken = cards.map(function (v) { return RANKS[v % 13] + SUITS[Math.floor(v / 13)]; }).join(' ');
    el.setAttribute('aria-label', t('communityCards') + ': ' + spoken);
  }
  el.hidden = false;
  _dodgeSelf(el, zone);
}

// Short landscape phones (zone ~270 px high): at x2 the magnified self box
// reaches the top of the zone and the centred mini-board would sit on the
// player's own hole cards. Dock it beside the self box instead - right side
// first, then left - between the box and the floating buttons; if neither side
// has room, hide it (own cards matter more than the board copy).
function _dodgeSelf(el, zone) {
  el.style.left = ''; el.style.transform = '';                  // back to the centred CSS position
  const me = document.querySelector('#g-seats .seat.me .seat-plate') || document.querySelector('#g-seats .seat.me');
  if (!me) return;
  const hit = function (a, b) { return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; };
  const r = el.getBoundingClientRect(), m = me.getBoundingClientRect();
  if (!hit(r, m)) return;
  const zr = zone.getBoundingClientRect();
  let minX = zr.left + 8, maxX = zr.right - 8;
  ['chat-toggle-btn', 'react-toggle-btn', 'hands-toggle-btn', 'log-toggle-btn'].forEach(function (id) {
    const b = document.getElementById(id);
    if (!b) return;
    const br = b.getBoundingClientRect();
    if (br.width < 2 || br.bottom <= r.top || br.top >= r.bottom) return;
    if (br.left + br.width / 2 < zr.left + zr.width / 2) minX = Math.max(minX, br.right + 6);
    else maxX = Math.min(maxX, br.left - 6);
  });
  let x = null;
  if (m.right + 8 + r.width <= maxX) x = m.right + 8;
  else if (m.left - 8 - r.width >= minX) x = m.left - 8 - r.width;
  if (x === null) { el.hidden = true; return; }
  el.style.transform = 'none';
  el.style.left = (x - zr.left) + 'px';
}

// Coalesced: once on the next frame, and once after the 220 ms pan animation
// (the readability test reads screen rects, final only when the pan settled).
function schedule() {
  if (!_raf) _raf = requestAnimationFrame(function () { _raf = 0; sync(); });
  clearTimeout(_tmr);
  _tmr = setTimeout(sync, 280);
}

function _onTap() {
  try { if (typeof window._loupeToggleBoard === 'function') window._loupeToggleBoard(); } catch (e) {}
}

function _init() {
  const el = document.getElementById('g-miniboard');
  if (el && !el.dataset.mbInit) { el.dataset.mbInit = '1'; el.addEventListener('click', _onTap); }
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
  else _init();
}

export { sync as miniBoardSync, schedule as miniBoardSchedule };
try { window._miniBoardSync = schedule; } catch (e) {}
