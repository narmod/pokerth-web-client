// @ts-check
// ── ctl-nav.mjs — controller navigation core (device-agnostic) ──────────────
//
// WEB ADDITION. The behaviour shared by every "controller" input — the
// gamepad today (ui/gamepad.mjs), a TV remote later — expressed as abstract
// actions an input adapter sends with ctl.do(action, arg). The adapter only
// reads its device and maps buttons to actions; everything below is here.
//
// Two modes, shown by a badge at the table:
//
//   GAME — game screen. The table actions click the very same action-bar
//   buttons as the mouse (pre-actions off-turn, call guard, "expected amount"
//   check included). The table's side panels (chat, history/odds, reactions,
//   music, poker hands) do NOT stop play: only a real window (confirmation,
//   settings, ranking, player card, end of game, the controller menu…)
//   forces NAVIGATION while it is open.
//
//   NAVIGATION — chosen with 'toggle' (Select), and everywhere outside the
//   table. A focus ring (.pad-cur) moves with 'up'/'down'/'left'/'right',
//   picked by ui/spatial-nav.mjs inside the current ZONE. Zones: the screen
//   (or the forced window), each open floating panel, and the Ace's dock
//   (his avatar and his bubble, which live outside the screens). 'zonePrev'
//   / 'zoneNext' cycle them; 'chat' and 'ace' jump straight to the chat
//   field (with the on-screen keyboard, ui/ctl-keyboard.mjs) and to the
//   Ace's menu. 'back' = Escape (keynav closeTop), and at
//   the table with nothing left to close it returns to GAME. It never folds.
//   Text fields are only focused on 'ok' (no on-screen keyboard on the way).
//
// My turn begins → back to GAME automatically when no real window is open,
// with a hint; the adapter's turn hook (rumble) fires either way.

import { pickNext, pickFirst } from './spatial-nav.mjs';
import { closeTop, topSurfaceEl, openSurfaces } from './keynav.mjs';
import { showKeyHint } from './shortcuts.mjs';
import { toggleMenu, setKeysHelp } from './ctl-menu.mjs';
import { openKeyboard, isOpen as kbOpen } from './ctl-keyboard.mjs';

export function t(key, params) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, params) : key;
}
export function opt(key, def) {
  try { if (typeof window._advGet === 'function') return window._advGet(key, def); } catch (e) {}
  try { var v = localStorage.getItem('pth_' + key); return v === null ? def : v === '1'; } catch (e) { return def; }
}

// Side panels of the table: open next to it, never stop play.
const FLOAT_IDS = ['g-chat-panel', 'g-log-panel', 'g-reaction-panel', 'music-panel', 'hands-overlay', 'g-winner-overlay'];
// Windows that handle Escape themselves (not in keynav's list) but are modal.
const EXTRA_MODALS = ['timeout-warn-modal', 'conn-lost-modal'];
const ACE_ROOT = 'ace-dock';
// Chat field reached by 'chat', per screen.
const CHAT_FIELD = { 's-game': 'g-chat-in', 's-lobby': 'chat-in' };

var st = {
  mode: 'game',          // the player's choice at the table: 'game' | 'nav'
  zone: null,            // current navigation zone element
  cur: null, ringEl: null, curKey: null, curBox: null, curScope: null,
  pendingZone: null, pendingUntil: 0,   // a zone that is opening (chat, Ace)
  holdFill: null,
  pctIdx: -1, grid: null,
  wasTurn: false,
  source: 'gamepad',
  glyph: function (role) { return role; },
  kbLegend: function () { return ''; },
  kbReturn: null,
  onTurnHook: null,
  badge: null
};

// ── Visibility and candidates ──────────────────────────────────────────────
export function visible(el) {
  if (!el || el.hidden) return false;
  var cs;
  try { cs = window.getComputedStyle(el); } catch (e) { return false; }
  if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}
function box(el) {
  var r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}
const CAND = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, ' +
  '[tabindex]:not([tabindex="-1"]), [role="button"], [role="tab"], [onclick]';
const NATIVE = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/;
const KEEP = '.game-row';   // clickable rows that also hold buttons stay reachable

// ignorePE: the off-turn action bar is pointer-events:none, yet its buttons
// arm pre-actions when clicked — the remote reaches them.
function usable(el, ignorePE) {
  if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
  if (el.closest && el.closest('[inert]')) return false;
  if (!visible(el)) return false;
  var r = el.getBoundingClientRect();
  if (!(r.width > 0 && r.height > 0)) return false;
  if (!ignorePE) { try { if (window.getComputedStyle(el).pointerEvents === 'none') return false; } catch (e) {} }
  return true;
}

// Every reachable element of scope, in document order, minus the ones inside
// `skip` (other zones nested in it: the chat panel inside the game screen).
export function candidates(scope, skip, ignorePE) {
  var raw = scope.querySelectorAll(CAND), out = [], seen = new Set();
  var sk = (skip || []).filter(function (z) { return z && z !== scope && scope.contains(z); });
  for (var i = 0; i < raw.length; i++) {
    var el = raw[i];
    if (el === scope) continue;
    var inSkip = false;
    for (var s = 0; s < sk.length; s++) if (sk[s].contains(el)) { inSkip = true; break; }
    if (inSkip) continue;
    var tg = el;
    if (!usable(el, ignorePE)) {
      // Visually hidden checkbox of a styled switch: its label takes the ring.
      var ty = (el.type || '').toLowerCase();
      var lab = (ty === 'checkbox' || ty === 'radio') && !el.disabled && el.closest ? el.closest('label') : null;
      if (!lab || !scope.contains(lab) || !usable(lab)) continue;
      tg = lab;
    }
    if (seen.has(tg)) continue;
    seen.add(tg);
    out.push(tg);
  }
  // Containers reached only through tabindex/onclick (a list, a backdrop, a
  // panel) step aside for the controls they hold.
  var holders = new Set();
  for (var j = 0; j < out.length; j++) {
    for (var p = out[j].parentElement; p && p !== scope; p = p.parentElement) {
      if (holders.has(p)) break;
      holders.add(p);
    }
  }
  return out.filter(function (el) {
    return NATIVE.test(el.tagName) || el.tagName === 'LABEL' || !holders.has(el) || (el.matches && el.matches(KEEP));
  });
}

export function isTextField(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  var tag = (el.tagName || '').toLowerCase();
  if (tag === 'textarea') return true;
  if (tag !== 'input') return false;
  return /^(text|search|email|url|tel|password|number)$/.test((el.type || 'text').toLowerCase());
}
function isAdjustable(el) {
  if (!el) return false;
  var tag = (el.tagName || '').toLowerCase();
  if (tag === 'select') return true;
  return tag === 'input' && /^(range|number)$/.test((el.type || '').toLowerCase());
}
function editing() {
  var ae = document.activeElement;
  return isTextField(ae) ? ae : null;
}

// ── Surfaces, zones, mode ──────────────────────────────────────────────────
function activeScreen() { return document.querySelector('.screen.active'); }
function inGame() { var s = activeScreen(); return !!(s && s.id === 's-game'); }
// Only the table's own side panels: draggable windows (.floating-win —
// settings, ranking, forum…) are real windows here, they force navigation.
export function isFloating(el) {
  return !!el && FLOAT_IDS.indexOf(el.id) >= 0;
}
function surfaces() { try { return openSurfaces(); } catch (e) { return []; } }
// The real window open on top, or null.
export function modal() {
  for (var i = 0; i < EXTRA_MODALS.length; i++) {
    var m = document.getElementById(EXTRA_MODALS[i]);
    if (m && visible(m)) return m;
  }
  var top = null;
  try { top = topSurfaceEl(); } catch (e) {}
  if (top && !isFloating(top)) return top;
  var list = surfaces();
  for (var j = 0; j < list.length; j++) if (!isFloating(list[j])) return list[j];
  return null;
}
function floatingZones() {
  return surfaces().filter(isFloating);
}
function aceZone() {
  var root = document.getElementById(ACE_ROOT);
  if (!root || !visible(root)) return null;
  return candidates(root).length ? root : null;
}
// Ordered zones: the forced window or the screen, the floating panels, the Ace.
export function zones() {
  var out = [];
  var m = modal();
  if (m) out.push(m);
  else {
    var scr = activeScreen();
    if (scr) out.push(scr);
    out = out.concat(floatingZones());
  }
  var ace = aceZone();
  if (ace) out.push(ace);
  return out;
}
function currentZone(list) {
  var zs = list || zones();
  if (st.zone && zs.indexOf(st.zone) >= 0) return st.zone;
  st.zone = zs[0] || document.body;
  return st.zone;
}
// { mode: 'game' | 'nav', scope, forced }
export function effective() {
  var m = modal();
  if (m) {
    var zs = zones();
    return { mode: 'nav', forced: true, scope: currentZone(zs), zones: zs };
  }
  if (inGame() && st.mode === 'game') return { mode: 'game', forced: false, scope: activeScreen(), zones: null };
  var z = zones();
  return { mode: 'nav', forced: false, scope: currentZone(z), zones: z };
}
function skipFor(scope, zs) { return (zs || zones()).filter(function (z) { return z !== scope; }); }

// ── Focus ring ─────────────────────────────────────────────────────────────
function ringTarget(el) {
  var ty = ((el && el.type) || '').toLowerCase();
  if ((ty === 'checkbox' || ty === 'radio') && el.closest) {
    var lab = el.closest('label');
    if (lab) return lab;
  }
  return el;
}
export function clearRing() {
  if (st.ringEl) st.ringEl.classList.remove('pad-cur');
  st.ringEl = null; st.cur = null; st.curKey = null; st.curBox = null;
}
const KEY_ATTRS = ['data-gid', 'data-cat', 'data-uitab', 'data-act', 'data-pid', 'data-seat'];
function keyOf(el) {
  if (el.id) return '#' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id);
  for (var i = 0; i < KEY_ATTRS.length; i++) {
    var v = el.getAttribute(KEY_ATTRS[i]);
    if (v != null) return el.tagName.toLowerCase() + '[' + KEY_ATTRS[i] + '="' + String(v).replace(/"/g, '\\"') + '"]';
  }
  return null;
}
function setCur(el, scope) {
  if (st.ringEl) st.ringEl.classList.remove('pad-cur');
  st.cur = el;
  st.curKey = keyOf(el);
  st.curBox = box(el);
  st.curScope = scope || null;
  st.ringEl = ringTarget(el);
  st.ringEl.classList.add('pad-cur');
  var ae = document.activeElement;
  if (isTextField(el)) {
    // Never focus a text field on the way through: phones would pop the
    // on-screen keyboard. 'ok' focuses it.
    if (ae && ae !== document.body && isTextField(ae) && typeof ae.blur === 'function') ae.blur();
  } else if (ae !== el) {
    try { el.focus({ preventScroll: true }); } catch (e) {}
  }
  try { st.ringEl.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
}
function curValid(scope) {
  return !!(st.cur && st.cur.isConnected && scope.contains(st.cur) && usable(st.cur));
}
// The ringed element was re-rendered (lobby rows, action bar, tabs…): find
// its replacement — same id or data key, else the candidate where it was.
function relocate(list) {
  if (st.curKey) {
    for (var i = 0; i < list.length; i++) {
      try { if (list[i].matches(st.curKey)) return list[i]; } catch (e) { break; }
    }
  }
  if (!st.curBox) return null;
  var b = st.curBox, cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2, best = null, bd = 24;
  for (var j = 0; j < list.length; j++) {
    var r = box(list[j]);
    var d = Math.hypot((r.left + r.right) / 2 - cx, (r.top + r.bottom) / 2 - cy);
    if (d < bd) { bd = d; best = list[j]; }
  }
  return best;
}
// First ring of a scope: the focused element if reachable, else what keynav
// would focus ([data-kn-focus] / [data-kn-start]), else reading order.
function initialIn(list) {
  var ae = document.activeElement;
  if (ae && ae !== document.body && list.indexOf(ae) >= 0) return ae;
  for (var i = 0; i < list.length; i++) {
    if (list[i].hasAttribute && (list[i].hasAttribute('data-kn-focus') || list[i].hasAttribute('data-kn-start'))) return list[i];
  }
  var k = pickFirst(list.map(box));
  return k >= 0 ? list[k] : null;
}
// Ring present and valid in scope → true. Otherwise place it (relocated or
// initial) and return false: the press only showed where the ring is —
// except after a re-render, where the relocated ring acts at once.
function ensureRing(scope, zs) {
  if (curValid(scope)) {
    if (st.ringEl && !st.ringEl.classList.contains('pad-cur')) st.ringEl.classList.add('pad-cur');
    return true;
  }
  var list = candidates(scope, skipFor(scope, zs));
  if (st.cur && !st.cur.isConnected && st.curScope === scope) {
    var re = relocate(list);
    if (re) { setCur(re, scope); return true; }
  }
  var first = initialIn(list);
  if (!first) { clearRing(); return false; }
  setCur(first, scope);
  return false;
}
function move(scope, zs, dir) {
  if (!ensureRing(scope, zs)) return;
  var list = candidates(scope, skipFor(scope, zs));
  var from = box(st.ringEl || st.cur);
  var others = list.filter(function (el) { return el !== st.cur && el !== st.ringEl; });
  var k = pickNext(from, others.map(box), dir);
  if (k >= 0) setCur(others[k], scope);
}

// ── Navigation helpers ─────────────────────────────────────────────────────
function fire(el, type) {
  try { el.dispatchEvent(new Event(type, { bubbles: true })); } catch (e) {}
}
export function adjust(el, d) {
  var tag = (el.tagName || '').toLowerCase();
  if (tag === 'select') {
    for (var j = el.selectedIndex + d; j >= 0 && j < el.options.length; j += d) {
      if (!el.options[j].disabled) { el.selectedIndex = j; fire(el, 'input'); fire(el, 'change'); return true; }
    }
    return false;
  }
  var before = el.value;
  try { if (d > 0) el.stepUp(); else el.stepDown(); } catch (e) { return false; }
  if (el.value === before) return false;
  fire(el, 'input'); fire(el, 'change');
  return true;
}
// A text field: the controller keyboard (ui/ctl-keyboard.mjs), or the
// device's own keyboard for number fields and when the option is off.
function typeInto(el) {
  if (opt('pad_kb', true) && (el.type || '').toLowerCase() !== 'number' && !el.isContentEditable) {
    // Back to this field and zone once the keyboard closes (tick).
    st.kbReturn = { zone: st.zone, el: el };
    openKeyboard(el, st.source === 'gamepad' ? st.kbLegend() : '');
    // The ring goes straight into the keyboard (quick phrases first).
    clearRing();
    var kb = modal();
    if (kb) { st.zone = kb; ensureRing(kb, [kb]); }
    return;
  }
  try { el.focus(); } catch (e) {}
}
function activate(el) {
  if (isTextField(el)) { typeInto(el); return; }
  if ((el.tagName || '').toLowerCase() === 'select') { adjust(el, 1); return; }
  if (el.matches && el.matches('.game-row') && el.classList.contains('sel')) {
    // Second press on the selected lobby table = Enter on the list (join /
    // info, ui/lobby-keynav.mjs).
    var list = el.closest('#g-list');
    if (list) {
      var ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      list.dispatchEvent(ev);
      if (ev.defaultPrevented) return;
    }
  }
  try { el.click(); } catch (e) {}
}
function cycleTabs(scope, d) {
  var tl = Array.prototype.filter.call(scope.querySelectorAll('[role="tablist"]'), visible)[0];
  if (!tl) return false;
  var raw = tl.querySelectorAll('[role="tab"]').length ? tl.querySelectorAll('[role="tab"]') : tl.querySelectorAll('button');
  var tabs = Array.prototype.filter.call(raw, function (b) { return !b.disabled && visible(b); });
  if (!tabs.length) return false;
  var i = -1;
  for (var k = 0; k < tabs.length; k++) {
    var b = tabs[k];
    if (b.getAttribute('aria-selected') === 'true' || b.classList.contains('active') ||
        b.classList.contains('is-active') || b.classList.contains('selected')) { i = k; break; }
  }
  var j = Math.max(0, Math.min(tabs.length - 1, i + d));
  if (i >= 0 && j === i) return true;
  try { tabs[j].click(); } catch (e) {}
  if (st.cur && !curValid(scope)) clearRing();
  return true;
}
function scrollFrom(scope, dx, dy) {
  for (var el = st.cur || scope; el && el !== document.documentElement; el = el.parentElement) {
    var cs;
    try { cs = window.getComputedStyle(el); } catch (e) { break; }
    if (dy && el.scrollHeight > el.clientHeight + 2 && /(auto|scroll)/.test(cs.overflowY)) { el.scrollBy(dx, dy); return; }
    if (dx && !dy && el.scrollWidth > el.clientWidth + 2 && /(auto|scroll)/.test(cs.overflowX)) { el.scrollBy(dx, 0); return; }
    if (el === scope && el.scrollHeight > el.clientHeight + 2) { el.scrollBy(dx, dy); return; }
  }
  try { (document.scrollingElement || document.documentElement).scrollBy(dx, dy); } catch (e) {}
}
function zoneName(z) {
  if (!z) return '';
  if (z.id === ACE_ROOT) return t('guideBtn');
  var lab = z.getAttribute && (z.getAttribute('aria-label') || '');
  if (lab) return lab;
  var h = z.querySelector && z.querySelector('h1, h2, h3, .ld-title, .km-title, [class*="title"]');
  return h ? (h.textContent || '').trim().slice(0, 40) : '';
}
// Make zone z current and put the ring in it (on `focusEl` if given).
function enterZone(z, focusEl) {
  st.zone = z;
  clearRing();
  if (!focusEl && z.id === ACE_ROOT) {
    // The Ace: start on his bubble's first choice when it is open.
    var bub = z.querySelector('.ad-bubble.ad-open');
    var first = bub ? candidates(bub)[0] : null;
    if (first) focusEl = first;
  }
  if (focusEl && usable(focusEl)) setCur(focusEl, z);
  else ensureRing(z, zones());
  var n = zoneName(z);
  if (n) hint(n);
}
function cycleZone(d) {
  var zs = zones();
  if (zs.length < 2) return;
  var i = zs.indexOf(currentZone(zs));
  enterZone(zs[(i + d + zs.length) % zs.length]);
}
// A zone that opens a moment after its button (chat panel, Ace's bubble):
// entered on the next steps, once it is visible.
function expectZone(get, focusSel, thenType) {
  st.pendingZone = { get: get, focus: focusSel || null, type: !!thenType };
  st.pendingUntil = Date.now() + 2500;
}
function settlePending() {
  var p = st.pendingZone;
  if (!p) return;
  if (Date.now() > st.pendingUntil) { st.pendingZone = null; return; }
  var z = p.get();
  if (!z || !visible(z)) return;
  if (z.id === ACE_ROOT) {
    var bub = z.querySelector('.ad-bubble.ad-open');
    if (!bub || !candidates(bub).length) return;
  }
  st.pendingZone = null;
  if (inGame()) st.mode = 'nav';
  enterZone(z, p.focus ? document.querySelector(p.focus) : null);
  if (p.type && st.cur && isTextField(st.cur)) typeInto(st.cur);
}

// ── Table actions (same buttons as the mouse, same rules as shortcuts.mjs) ──
export function hint(text) { try { if (text) showKeyHint(text, '🎮'); } catch (e) {} }
function bar() {
  var ap = document.querySelector('#g-actions .action-grid');
  if (!ap) return null;
  var pv = !!document.querySelector('#g-actions > .actions-preview');
  if (pv && document.querySelector('#g-actions > .actions-preview.no-action')) return null;   // locked
  return { grid: ap, preview: pv };
}
const ACT_SEL = {
  fold: '#g-actions .btn-fold:not([disabled])',
  call: '#g-actions .btn-call:not([disabled]), #g-actions .btn-check:not([disabled])',
  raise: '#g-actions .btn-raise:not([disabled])',
  allin: '#g-actions .btn-allin:not([disabled])'
};
function pk(k) { try { return window.pkTerm ? window.pkTerm(k) : k; } catch (e) { return k; } }
function act(name, role) {
  var b = bar();
  if (!b) return false;
  var btn = document.querySelector(ACT_SEL[name]);
  if (!btn) return false;
  btn.click();
  var term = btn.classList.contains('btn-show') ? t('showCards') : pk(btn.classList.contains('btn-check') ? 'check' : name);
  var txt = st.glyph(role) + ' — ' + term;
  hint(b.preview ? (t('preActionTitle') + ' · ' + txt) : txt);
  return true;
}
function quickBet(d) {
  var b = bar();
  if (!b || b.preview) return;
  var pb = b.grid.querySelectorAll('.btn-pct:not([disabled])');
  if (!pb.length) return;
  if (st.grid !== b.grid) { st.grid = b.grid; st.pctIdx = -1; }
  st.pctIdx = st.pctIdx < 0 ? (d > 0 ? 0 : pb.length - 1) : Math.max(0, Math.min(pb.length - 1, st.pctIdx + d));
  pb[st.pctIdx].click();
  var ri = document.getElementById('raise-amt');
  if (ri && document.activeElement === ri) ri.blur();
  var lbl = pb[st.pctIdx].querySelector('.pct-p');
  hint((lbl ? lbl.textContent : '') + ' — ' + st.glyph('raise') + ' ' + pk('raise'));
}
function stepBet(d, mult) {
  var b = bar();
  if (!b || b.preview) return;
  var sl = document.getElementById('raise-slider');
  if (!sl || sl.disabled) return;
  var min = parseFloat(sl.min), max = parseFloat(sl.max), step = parseFloat(sl.step) || 1;
  var cur = parseFloat(sl.value);
  if (!isFinite(cur)) cur = min;
  var v = Math.max(min, Math.min(max, cur + d * step * (mult || 1)));
  if (v === cur) return;
  sl.value = String(v);
  fire(sl, 'input');
}
function cycleMode(d) {
  var sel = document.getElementById('mode-sel');
  if (!sel || !window.App || typeof window.App.setPlayingMode !== 'function') return;
  var i = Math.max(0, Math.min(sel.options.length - 1, sel.selectedIndex + d));
  if (i === sel.selectedIndex) return;
  try { window.App.setPlayingMode(i); } catch (e) { return; }
  hint(sel.options[i] ? sel.options[i].text : '');
}
function holdStart(ms) {
  holdEnd();
  if (!bar()) return;
  var ai = document.querySelector(ACT_SEL.allin);
  if (!ai) return;
  var f = document.createElement('span');
  f.className = 'pad-hold-fill';
  f.style.setProperty('--pad-hold-ms', (ms || 600) + 'ms');
  ai.appendChild(f);
  st.holdFill = f;
}
function holdEnd() {
  if (st.holdFill && st.holdFill.parentNode) st.holdFill.parentNode.removeChild(st.holdFill);
  st.holdFill = null;
}

// ── Mode ───────────────────────────────────────────────────────────────────
function setMode(m, quiet) {
  if (m === st.mode) return;
  st.mode = m;
  if (m === 'game') { clearRing(); st.zone = null; }
  else { st.zone = activeScreen(); }
  if (!quiet) hint(t(m === 'game' ? 'padModeGame' : 'padModeNav'));
  updateBadge();
}
export function getMode() { return st.mode; }
function updateBadge() {
  var on = typeof document !== 'undefined' && document.body && document.body.classList.contains('pad-active') && inGame();
  if (!on) { if (st.badge) st.badge.hidden = true; return; }
  if (!st.badge) {
    st.badge = document.createElement('div');
    st.badge.id = 'ctl-badge';
    st.badge.setAttribute('aria-hidden', 'true');
    document.body.appendChild(st.badge);
  }
  var e = effective();
  var game = e.mode === 'game';
  var txt = (game ? '🎮 ' + t('padModeGame') : '🧭 ' + t('padModeNav'));
  if (st.badge.textContent !== txt) st.badge.textContent = txt;
  st.badge.classList.toggle('ctl-badge-nav', !game);
  st.badge.hidden = false;
}

// ── Turn ───────────────────────────────────────────────────────────────────
var turnWatched = false;
function watchTurn() {
  if (turnWatched) return;
  var ga = document.getElementById('g-actions');
  if (!ga || typeof MutationObserver !== 'function') return;
  turnWatched = true;
  new MutationObserver(function () {
    var live = !!ga.querySelector(':scope > .action-grid');
    if (live && !st.wasTurn) onTurn();
    st.wasTurn = live;
  }).observe(ga, { childList: true });
}
function onTurn() {
  var b = document.body;
  if (!b || !(b.classList.contains('has-gamepad') || b.classList.contains('has-remote'))) return;
  if (!modal() && st.mode !== 'game') {
    var ed = editing();
    if (ed) { try { ed.blur(); } catch (e) {} }
    setMode('game', true);
    hint(t('padYourTurn'));
  }
  // Remote: the ring waits on Check/Call, the safe default.
  if (!modal() && st.source === 'remote') { clearRing(); var ga = barScope(); if (ga) barRing(ga, true); }
  if (typeof st.onTurnHook === 'function') { try { st.onTurnHook(); } catch (e) {} }
}

// ── Action bar ring (game mode, inputs without action buttons: TV remote) ──
// The arrows move a ring over the action bar (Fold, Check/Call, Raise,
// All-In, 1/3 · 1/2 · Pot, amount, playing mode) and OK presses the ringed
// button — exactly a click, pre-actions off-turn included. A re-rendered bar
// (new turn) only shows the ring again: never an action on a guess.
function barScope() {
  var ga = document.getElementById('g-actions');
  if (!ga || !visible(ga)) return null;
  if (ga.querySelector(':scope > .actions-preview.no-action')) return null;   // locked
  return ga;
}
function barRing(ga, toCall) {
  var list = candidates(ga, [], true);
  if (!toCall && st.cur && st.cur.isConnected && list.indexOf(st.cur) >= 0) {
    if (st.ringEl && !st.ringEl.classList.contains('pad-cur')) st.ringEl.classList.add('pad-cur');
    return true;
  }
  var first = null;
  if (!toCall && st.cur && !st.cur.isConnected && st.curScope === ga) first = relocate(list);
  if (!first) {
    first = ga.querySelector('.btn-check:not([disabled]), .btn-call:not([disabled])');
    if (!first || list.indexOf(first) < 0) first = list[0] || null;
  }
  if (!first) { clearRing(); return false; }
  setCur(first, ga);
  return false;
}
function barDo(action) {
  var ga = barScope();
  if (!ga) return;
  if (action === 'ok') { if (barRing(ga)) activate(st.cur); return; }
  if (!barRing(ga)) return;
  if ((action === 'left' || action === 'right') && isAdjustable(st.cur)) { adjust(st.cur, action === 'right' ? 1 : -1); return; }
  var list = candidates(ga, [], true).filter(function (el) { return el !== st.cur; });
  var k = pickNext(box(st.ringEl || st.cur), list.map(box), action);
  if (k >= 0) setCur(list[k], ga);
}

// ── Public API ─────────────────────────────────────────────────────────────
export const ctl = {
  // Adapter wiring: glyph(role) labels hints; onTurn fires when my turn begins.
  setGlyph: function (fn) { st.glyph = fn; },
  setTurnHook: function (fn) { st.onTurnHook = fn; },
  setKeysHelp: setKeysHelp,
  setKbLegend: function (fn) { st.kbLegend = fn; },
  effective: effective,
  mode: getMode,
  setMode: function (m) { setMode(m); },
  clearRing: clearRing,
  // The input in use ('gamepad' | 'remote'): the remote keeps a ring on the
  // action bar in game mode.
  source: function (name) { st.source = name; },
  // Android Back reaches the page as a history step (ui/back-guard.mjs):
  // when no window was closed, leave a text field or Navigation first.
  backFallback: function () {
    var b = document.body;
    if (!b || !b.classList.contains('pad-active')) return false;
    var ed = editing();
    if (ed) { try { ed.blur(); } catch (e) {} return true; }
    if (inGame() && st.mode === 'nav' && !modal()) { setMode('game'); return true; }
    return false;
  },
  holdStart: holdStart,
  holdEnd: holdEnd,
  // Called every frame by the adapter while a device is connected.
  tick: function () {
    watchTurn();
    settlePending();
    if (st.kbReturn && !kbOpen()) {
      var kr = st.kbReturn;
      st.kbReturn = null;
      if (kr.zone && visible(kr.zone) && kr.el && usable(kr.el)) { st.zone = kr.zone; clearRing(); setCur(kr.el, kr.zone); }
    }
    updateBadge();
    if (effective().mode === 'game' && st.cur) {
      var ga = document.getElementById('g-actions');
      if (!(st.source === 'remote' && ga && ga.contains(st.cur))) clearRing();
    }
    // The ringed element was hidden (its panel closed): drop the ring.
    else if (st.cur && st.cur.isConnected && !usable(st.cur)) clearRing();
  },
  // Open a floating zone and put the ring in it (used by the controller menu).
  focusZone: function (id, focusSel) {
    expectZone(function () { return document.getElementById(id); }, focusSel);
  },
  aceOpen: function () {
    var root = document.getElementById(ACE_ROOT);
    var bub = root && root.querySelector('.ad-bubble.ad-open');
    if (bub && candidates(bub).length) { if (inGame()) st.mode = 'nav'; enterZone(root); return; }
    if (typeof window.guideToggle !== 'function') return;
    try { window.guideToggle(); } catch (e) { return; }
    expectZone(function () { return document.getElementById(ACE_ROOT); });
  },
  // One action from the adapter. arg: { repeat } for directions, { dx, dy }
  // for 'scroll', a number for 'bet' / 'quickBet' / 'playMode'.
  do: function (action, arg) {
    // A pad or remote button is real user input, yet it raises no DOM
    // pointer/key event the AFK listener could see (the remote even stops
    // the key at window capture): tell the server we are here, otherwise a
    // controller player is kicked for inactivity after ~21 min. Same
    // rate-limited sender as mouse / touch / keyboard (msg-social.mjs).
    try { if (typeof window._afkActivity === 'function') window._afkActivity(); } catch (e) {}
    // The open window may take the controller's buttons for itself (the
    // on-screen keyboard: ⌫, space, shift, send…).
    var m = modal();
    if (m && typeof m.__ctl === 'function' && m.__ctl(action, arg)) return;
    var e = effective();
    switch (action) {
      case 'menu': toggleMenu(ctl); return;
      case 'toggle':
        if (e.forced || !inGame()) return;
        setMode(st.mode === 'game' ? 'nav' : 'game');
        if (st.mode === 'nav') ensureRing(effective().scope, zones());
        return;
      case 'back': {
        var ed = editing();
        if (ed) { try { ed.blur(); } catch (er) {} return; }
        if (closeTop()) return;
        if (inGame() && st.mode === 'nav' && !e.forced) setMode('game');
        return;
      }
    }
    if (e.mode === 'game') {
      switch (action) {
        case 'call': act('call', 'ok'); return;
        case 'fold': act('fold', 'fold'); return;
        case 'raise': act('raise', 'raise'); return;
        case 'allin': act('allin', 'raise'); return;
        case 'bet': stepBet(arg > 0 ? 1 : -1, Math.abs(arg) || 1); return;
        case 'quickBet': quickBet(arg); return;
        case 'playMode': cycleMode(arg); return;
        case 'ok': case 'up': case 'down': case 'left': case 'right': barDo(action); return;
      }
      return;
    }
    // Navigation.
    var scope = e.scope, zs = e.zones;
    switch (action) {
      case 'ok':
        if (ensureRing(scope, zs)) activate(st.cur);
        return;
      case 'up': case 'down': case 'left': case 'right': {
        var ed2 = editing();
        if (ed2) { try { ed2.blur(); } catch (er) {} }
        if ((action === 'left' || action === 'right') && curValid(scope) && isAdjustable(st.cur)) adjust(st.cur, action === 'right' ? 1 : -1);
        else move(scope, zs, action);
        return;
      }
      case 'zonePrev': cycleZone(-1); return;
      case 'zoneNext': cycleZone(1); return;
      case 'tabPrev': cycleTabs(scope, -1); return;
      case 'tabNext': cycleTabs(scope, 1); return;
      case 'scroll': scrollFrom(scope, (arg && arg.dx) || 0, (arg && arg.dy) || 0); return;
      case 'chat': {
        if (e.forced) return;            // never opens the chat behind a window
        var scr = activeScreen();
        var fid = scr && CHAT_FIELD[scr.id];
        if (!fid) return;
        var f = document.getElementById(fid);
        if (scr.id === 's-game') {
          var panel = document.getElementById('g-chat-panel');
          if (panel && !visible(panel) && typeof window.toggleGameChat === 'function') {
            try { window.toggleGameChat(); } catch (er) {}
            expectZone(function () { return document.getElementById('g-chat-panel'); }, '#' + fid, true);
            return;
          }
          if (panel) { enterZone(panel, f); if (st.cur === f) typeInto(f); return; }
        }
        if (f && usable(f)) { st.zone = scr; clearRing(); setCur(f, scr); typeInto(f); }
        return;
      }
      case 'ace': ctl.aceOpen(); return;
    }
  }
};

if (typeof window !== 'undefined') window.CtlNav = ctl;
