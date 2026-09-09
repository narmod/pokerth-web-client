// ═══════════════════════════════════════════════════════════════════
// Live pokerth.net figures on the login screen — web extension, no QML
// counterpart. sp0ck publishes the official server counters as JSON; the
// proxy reads them once per interval (GET /api/live) and every client is
// served from that single cache.
//
// The line sits inside the "Internet" card of step 1: the mode it describes
// is pokerth.net for everyone, including a self-hosted web client, so the
// figures are meaningful whoever runs the front-end.
//
// It is purely additive: when the relay says no (admin kill switch
// `live_stats`, stale counters, pokerth.net unreachable) the line stays
// hidden and the card looks exactly as it did before.
// ═══════════════════════════════════════════════════════════════════
import { t } from '../i18n.mjs';

const EL_ID = 'lc-live';
const FALLBACK_SEC = 60;

let _timer = null;
let _sec = FALLBACK_SEC;
let _busy = false;

function _el() { return document.getElementById(EL_ID); }

// Only poll while the card is actually on screen. offsetParent goes null as
// soon as any ancestor is display:none, which covers both "step 2 is showing"
// and "the player is in the lobby or at a table" without coupling this module
// to the screen router.
function _onScreen() {
  const el = _el();
  if (!el) return false;
  if (document.hidden) return false;
  return el.offsetParent !== null || !!(el.parentElement && el.parentElement.offsetParent);
}

function _fmt(n) {
  try { return Number(n).toLocaleString(); } catch (e) { return String(n); }
}

// Same four counters, and the same four icons, as the Game-Server Status box on
// pokerth.net -- a player who saw one recognises the other. Stroke is
// currentColor, never a CSS var: an SVG stroke= attribute does not resolve
// var().
const ICONS = {
  online:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>',
  tables:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
  waiting: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  today:   null
};

// One counter: icon, then the figure. The wording goes on title/aria-label
// only, so a narrow card can never cut a sentence in half.
function _item(kind, key, n) {
  const sp = document.createElement('span');
  sp.className = 'lcl';
  const label = t(key, { n: _fmt(n) });
  sp.title = label;
  sp.setAttribute('aria-label', label);
  if (ICONS[kind]) {
    sp.insertAdjacentHTML('beforeend', ICONS[kind]);
  } else {
    const g = document.createElement('span');
    g.className = 'lcl-g';
    g.setAttribute('aria-hidden', 'true');
    g.textContent = '\u2660';
    sp.appendChild(g);
  }
  const b = document.createElement('b');
  b.textContent = _fmt(n);
  sp.appendChild(b);
  return sp;
}

function _hide() {
  const el = _el();
  if (!el) return;
  el.style.display = 'none';
  el.textContent = '';
}

function _render(d) {
  const el = _el();
  if (!el) return;
  if (!d || d.ok !== true || typeof d.online !== 'number') { _hide(); return; }
  el.textContent = '';
  el.appendChild(_item('online', 'liveOnline', d.online));
  // tables / waiting only exist on a server that publishes them; today can be
  // zero early in the day, and a zero there says something, so it is kept.
  if (typeof d.tables === 'number' && d.tables > 0) el.appendChild(_item('tables', 'liveTables', d.tables));
  if (typeof d.waiting === 'number' && d.waiting > 0) el.appendChild(_item('waiting', 'liveWaiting', d.waiting));
  if (typeof d.today === 'number') el.appendChild(_item('today', 'liveToday', d.today));
  el.style.display = '';
}

function _poll() {
  if (_busy || !_el()) return;
  if (!_onScreen()) return;
  _busy = true;
  fetch('/api/live', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && typeof d.sec === 'number' && d.sec > 0 && d.sec !== _sec) { _sec = d.sec; _arm(); }
      _render(d);
    })
    .catch(function () { _hide(); })
    .finally(function () { _busy = false; });
}

function _arm() {
  if (_timer) clearInterval(_timer);
  _timer = setInterval(_poll, _sec * 1000);
}

function _start() {
  if (!_el()) return;
  _arm();
  _poll();
  // Coming back to a backgrounded tab: the figures on screen may be minutes
  // old, so refresh at once instead of waiting for the next tick.
  document.addEventListener('visibilitychange', function () { if (!document.hidden) _poll(); });
  // Returning to step 1 from step 2 ("Change" button) re-reveals the card.
  window.addEventListener('pageshow', _poll);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _start);
else _start();

// Bridge for the monolith: loginPickMode() calls this when the player steps
// back to the mode picker, so the line is fresh the moment the card reappears.
window._liveStatsRefresh = _poll;
