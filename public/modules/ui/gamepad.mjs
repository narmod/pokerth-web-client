// @ts-check
// ── gamepad.mjs — play and browse menus with a game controller ──────────────
//
// WEB ADDITION: the official QML client has no gamepad support (bible §6
// lists keyboard and Android Back only). Uses the browser Gamepad API with the
// "standard" button layout (Xbox, PlayStation, Switch Pro and most Bluetooth
// pads); browsers only report a pad after one of its buttons was pressed.
//
// Two modes, switched automatically:
//
//   TABLE — game screen with nothing open over it. Buttons go through the
//   very same action-bar buttons as a click (pre-action arming off-turn, the
//   call guard and the "expected amount" check included):
//     A  Check/Call      X  Fold          Y  Bet/Raise, held = All-In (Show)
//     LT/RT  bet amount −/+ (accelerates)  LB/RB  1/3 · 1/2 · Pot
//     D-pad ←/→  playing mode (Manual · Auto Check/Call · Auto Check/Fold)
//     D-pad ↑  browse the table (header, seats…) — B or the next turn ends it
//     Start  settings (Alt+S)    Select  chat (Alt+C)
//
//   NAVIGATION — everywhere else, and at the table as soon as a surface of
//   ui/keynav.mjs (window, menu, confirmation, chat…) is open: the table
//   buttons are dead, so a press meant for a menu can never act at the table.
//     D-pad / left stick  move the focus ring (ui/spatial-nav.mjs), kept
//                         inside the topmost surface
//     A  activate          B  back = Escape (keynav closeTop); never folds
//     ←/→ on a list, slider or number field: change its value
//     LB/RB  previous / next tab of the surface (first tab list),
//     LT/RT  same for a second tab list (Settings sub-tabs)
//     Right stick  scroll
//   Text fields are not focused on the way through (that would pop the
//   on-screen keyboard): A puts the cursor in the field, B takes it out.
//
// Options (Advanced options → Keyboard shortcuts → Gamepad): pad_on (default
// on), pad_rumble (vibrate on my turn, default on), pad_nintendo (A/B swapped:
// confirm with the right-hand face button, default off).
//
// Body classes: has-gamepad (a pad was seen), pad-active (the pad is the last
// input used — mouse, touch or keyboard removes it); the ring is .pad-cur.
// Button glyphs on the action bar come from CSS variables --pad-g-ok,
// --pad-g-fold and --pad-g-raise set on <html> (pokerth.css).

import { pickNext, pickFirst } from './spatial-nav.mjs';
import { closeTop, topSurfaceEl } from './keynav.mjs';
import { showKeyHint } from './shortcuts.mjs';

function t(key, opts) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, opts) : key;
}
function opt(key, def) {
  try { if (typeof window._advGet === 'function') return window._advGet(key, def); } catch (e) {}
  try { var v = localStorage.getItem('pth_' + key); return v === null ? def : v === '1'; } catch (e) { return def; }
}

// ── Layout ──────────────────────────────────────────────────────────────────
// Standard mapping: 0-3 face buttons by POSITION (bottom, right, left, top),
// 4/5 bumpers, 6/7 triggers (analog), 8 Select, 9 Start, 12-15 D-pad.
const LB = 4, RB = 5, LT = 6, RT = 7, SELECT = 8, START = 9, UP = 12, DOWN = 13, LEFT = 14, RIGHT = 15;
const GLYPHS = {
  xb:  ['A', 'B', 'X', 'Y'],
  ps:  ['✕', '○', '□', '△'],   // ✕ ○ □ △
  nin: ['B', 'A', 'Y', 'X']
};
export const HOLD_MS = 600;          // Y held this long = All-In
const REPEAT_DELAY = 380, REPEAT_EVERY = 110;
const STICK_ON = 0.55, STICK_OFF = 0.35, TRIGGER_ON = 0.12, SCROLL_DEAD = 0.2;
const EXTRA_MODALS = ['timeout-warn-modal', 'conn-lost-modal'];   // handle Escape themselves

// Physical button of each role (A/B swapped by the Nintendo option).
export function roleButton(role, nintendo) {
  if (role === 'ok') return nintendo ? 1 : 0;
  if (role === 'back') return nintendo ? 0 : 1;
  if (role === 'fold') return 2;
  if (role === 'raise') return 3;
  return -1;
}
// Glyph style from Gamepad.id: Sony vendor 054c, Nintendo 057e.
export function padStyle(id) {
  var s = String(id || '').toLowerCase();
  if (/054c|playstation|dualshock|dualsense|sony/.test(s)) return 'ps';
  if (/057e|nintendo|pro controller|joy-con/.test(s)) return 'nin';
  return 'xb';
}

// ── State ───────────────────────────────────────────────────────────────────
var st = {
  raf: 0,
  seen: false,           // a pad was connected at least once
  style: 'xb',
  prev: [],              // previous pressed state of each button (merged pads)
  dir: null, dirNext: 0, // held direction and next auto-repeat time
  stickDir: null,
  holdAt: -1, holdDone: false, holdFill: null,
  betNext: 0, betSteps: 0,
  pctIdx: -1, grid: null,
  tableNav: false,
  cur: null, ringEl: null, curKey: null, curBox: null, curScope: null,
  wasTurn: false
};

function pads() {
  var out = [];
  try {
    var list = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < (list ? list.length : 0); i++) if (list[i] && list[i].connected !== false) out.push(list[i]);
  } catch (e) {}
  return out;
}

// ── Visibility and focusable candidates ────────────────────────────────────
function visible(el) {
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

function usable(el) {
  if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
  if (el.closest && el.closest('[inert]')) return false;
  if (!visible(el)) return false;
  var r = el.getBoundingClientRect();
  if (!(r.width > 0 && r.height > 0)) return false;
  try { if (window.getComputedStyle(el).pointerEvents === 'none') return false; } catch (e) {}
  return true;
}

// Every reachable element inside scope, in document order.
export function candidates(scope) {
  var raw = scope.querySelectorAll(CAND), out = [], seen = new Set();
  for (var i = 0; i < raw.length; i++) {
    var el = raw[i];
    if (el === scope) continue;
    var tg = el;
    if (!usable(el)) {
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

function isTextField(el) {
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

// ── Mode and scope ─────────────────────────────────────────────────────────
function activeScreen() { return document.querySelector('.screen.active'); }
function surface() {
  for (var i = 0; i < EXTRA_MODALS.length; i++) {
    var m = document.getElementById(EXTRA_MODALS[i]);
    if (m && visible(m)) return m;
  }
  try { return topSurfaceEl(); } catch (e) { return null; }
}
// { mode: 'table' | 'nav', scope }
export function currentMode() {
  var s = surface();
  if (s) return { mode: 'nav', scope: s };
  var scr = activeScreen();
  if (scr && scr.id === 's-game' && !st.tableNav) return { mode: 'table', scope: scr };
  return { mode: 'nav', scope: scr || document.body };
}

// ── Focus ring ─────────────────────────────────────────────────────────────
function ringTarget(el) {
  var ty = ((el && el.type) || '').toLowerCase();
  if ((ty === 'checkbox' || ty === 'radio') && el.closest) {
    var lab = el.closest('label');
    if (lab) return lab;
  }
  return el;
}
function clearRing() {
  if (st.ringEl) st.ringEl.classList.remove('pad-cur');
  st.ringEl = null;
  st.cur = null;
  st.curKey = null;
  st.curBox = null;
}
function setCur(el) {
  if (st.ringEl) st.ringEl.classList.remove('pad-cur');
  st.cur = el;
  st.curKey = keyOf(el);
  st.curBox = box(el);
  try { st.curScope = currentMode().scope; } catch (e) { st.curScope = null; }
  st.ringEl = ringTarget(el);
  st.ringEl.classList.add('pad-cur');
  var ae = document.activeElement;
  if (isTextField(el)) {
    // Do not focus a text field on the way through: phones would pop the
    // on-screen keyboard. A focuses it (activate()).
    if (ae && ae !== document.body && isTextField(ae) && typeof ae.blur === 'function') ae.blur();
  } else if (ae !== el) {
    try { el.focus({ preventScroll: true }); } catch (e) {}
  }
  try { st.ringEl.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
}
function curValid(scope) {
  return !!(st.cur && st.cur.isConnected && scope.contains(st.cur) && usable(st.cur));
}
// First ring of a scope: the focused element if it is reachable, else the
// [data-kn-focus] / [data-kn-start] keynav would pick, else reading order.
function initialIn(scope, list) {
  var ae = document.activeElement;
  if (ae && ae !== document.body && list.indexOf(ae) >= 0) return ae;
  for (var i = 0; i < list.length; i++) {
    if (list[i].hasAttribute && (list[i].hasAttribute('data-kn-focus') || list[i].hasAttribute('data-kn-start'))) return list[i];
  }
  var k = pickFirst(list.map(box));
  return k >= 0 ? list[k] : null;
}
// The ringed element was re-rendered (lobby rows, action bar, tabs…): find
// its replacement — same id or same data key, else the candidate sitting
// where it was.
const KEY_ATTRS = ['data-gid', 'data-cat', 'data-uitab', 'data-act', 'data-pid', 'data-seat'];
function keyOf(el) {
  if (el.id) return '#' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id);
  for (var i = 0; i < KEY_ATTRS.length; i++) {
    var v = el.getAttribute(KEY_ATTRS[i]);
    if (v != null) return el.tagName.toLowerCase() + '[' + KEY_ATTRS[i] + '="' + String(v).replace(/"/g, '\\"') + '"]';
  }
  return null;
}
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
function ensureRing(scope) {
  if (curValid(scope)) {
    if (st.ringEl && !st.ringEl.classList.contains('pad-cur')) st.ringEl.classList.add('pad-cur');
    return true;
  }
  var list = candidates(scope);
  if (st.cur && !st.cur.isConnected && st.curScope === scope) {
    var re = relocate(list);
    if (re) { setCur(re); return true; }
  }
  var first = initialIn(scope, list);
  if (!first) { clearRing(); return false; }
  setCur(first);
  return false;    // the press only showed where the ring is
}
function move(scope, dir) {
  if (!ensureRing(scope)) return;
  var list = candidates(scope);
  var from = box(st.ringEl || st.cur);
  var others = list.filter(function (el) { return el !== st.cur && el !== st.ringEl; });
  var k = pickNext(from, others.map(box), dir);
  if (k >= 0) setCur(others[k]);
}

// ── Navigation actions ─────────────────────────────────────────────────────
function fire(el, type) {
  try { el.dispatchEvent(new Event(type, { bubbles: true })); } catch (e) {}
}
export function adjust(el, d) {
  var tag = (el.tagName || '').toLowerCase();
  if (tag === 'select') {
    var i = el.selectedIndex;
    for (var j = i + d; j >= 0 && j < el.options.length; j += d) {
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
function activate(el) {
  if (isTextField(el)) {
    try { el.focus(); } catch (e) {}
    return;
  }
  if ((el.tagName || '').toLowerCase() === 'select') { adjust(el, 1); return; }
  if (el.matches && el.matches('.game-row') && el.classList.contains('sel')) {
    // Second A on the selected lobby table = Enter on the list (join / info,
    // ui/lobby-keynav.mjs).
    var list = el.closest('#g-list');
    if (list) {
      var ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      list.dispatchEvent(ev);
      if (ev.defaultPrevented) return;
    }
  }
  try { el.click(); } catch (e) {}
}
// Tab lists of the scope; which = 0 (first) or 1 (second).
function cycleTabs(scope, which, d) {
  var lists = Array.prototype.filter.call(scope.querySelectorAll('[role="tablist"]'), visible);
  var tl = lists[which];
  if (!tl) return false;
  var tabs = Array.prototype.filter.call(tl.querySelectorAll('[role="tab"]').length ? tl.querySelectorAll('[role="tab"]') : tl.querySelectorAll('button'),
    function (b) { return !b.disabled && visible(b); });
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

// ── Table actions (same buttons as the mouse, same rules as shortcuts.mjs) ──
function glyph(role) {
  return GLYPHS[st.style][roleButton(role, opt('pad_nintendo', false))];
}
function hint(text) { try { showKeyHint(text, '🎮'); } catch (e) {} }
function bar() {
  var ap = document.querySelector('#g-actions .action-grid');
  if (!ap) return null;
  var pv = !!document.querySelector('#g-actions > .actions-preview');
  if (pv && document.querySelector('#g-actions > .actions-preview.no-action')) return null;   // locked
  return { grid: ap, preview: pv };
}
const ACT_SEL = {
  fold: '.btn-fold:not([disabled])',
  call: '.btn-call:not([disabled]), .btn-check:not([disabled])',
  raise: '.btn-raise:not([disabled])',
  allin: '.btn-allin:not([disabled])'
};
export function act(name, role) {
  var b = bar();
  if (!b) return false;
  var btn = document.querySelector('#g-actions ' + ACT_SEL[name].split(', ').join(', #g-actions '));
  if (!btn) return false;
  btn.click();
  var pk = function (k) { try { return window.pkTerm ? window.pkTerm(k) : k; } catch (e) { return k; } };
  var term = btn.classList.contains('btn-show') ? t('showCards')
    : pk(btn.classList.contains('btn-check') ? 'check' : name);
  var txt = glyph(role) + ' — ' + term;
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
  hint((lbl ? lbl.textContent : '') + ' — ' + glyph('raise') + ' ' + (window.pkTerm ? window.pkTerm('raise') : 'Raise'));
}
function stepBet(d, mult) {
  var b = bar();
  if (!b || b.preview) return;
  var sl = document.getElementById('raise-slider');
  if (!sl || sl.disabled) return;
  var min = parseFloat(sl.min), max = parseFloat(sl.max), step = parseFloat(sl.step) || 1;
  var cur = parseFloat(sl.value);
  if (!isFinite(cur)) cur = min;
  var v = Math.max(min, Math.min(max, cur + d * step * mult));
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
function holdStart(now) {
  st.holdAt = now; st.holdDone = false;
  var b = bar();
  var ai = b ? document.querySelector('#g-actions ' + ACT_SEL.allin) : null;
  if (!ai) return;
  var f = document.createElement('span');
  f.className = 'pad-hold-fill';
  f.style.setProperty('--pad-hold-ms', HOLD_MS + 'ms');
  ai.appendChild(f);
  st.holdFill = f;
}
function holdEnd() {
  if (st.holdFill && st.holdFill.parentNode) st.holdFill.parentNode.removeChild(st.holdFill);
  st.holdFill = null;
  st.holdAt = -1;
}

// ── Rumble ─────────────────────────────────────────────────────────────────
function rumble(ms, strong, weak) {
  var list = pads();
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    try {
      var a = p.vibrationActuator;
      if (a && typeof a.playEffect === 'function') {
        var r = a.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak });
        if (r && r.catch) r.catch(function () {});
        continue;
      }
      var h = p.hapticActuators && p.hapticActuators[0];
      if (h && typeof h.pulse === 'function') h.pulse(strong, ms);
    } catch (e) {}
  }
}
// My turn begins: the live action grid (direct child of #g-actions) appears.
function watchTurn() {
  var ga = document.getElementById('g-actions');
  if (!ga || typeof MutationObserver !== 'function') return false;
  new MutationObserver(function () {
    var live = !!ga.querySelector(':scope > .action-grid');
    if (live && !st.wasTurn) onTurn();
    st.wasTurn = live;
  }).observe(ga, { childList: true });
  return true;
}
function onTurn() {
  if (!st.seen || !opt('pad_on', true)) return;
  if (st.tableNav) {
    st.tableNav = false;
    var g = document.getElementById('s-game');
    if (st.cur && g && g.contains(st.cur)) clearRing();
  }
  if (opt('pad_rumble', true)) {
    rumble(140, 0.7, 0.4);
    setTimeout(function () { rumble(140, 0.7, 0.4); }, 230);
  }
}

// ── Glyphs and input source ────────────────────────────────────────────────
function applyGlyphs() {
  var de = document.documentElement, nin = opt('pad_nintendo', false), g = GLYPHS[st.style];
  de.style.setProperty('--pad-g-ok', JSON.stringify(g[roleButton('ok', nin)]));
  de.style.setProperty('--pad-g-fold', JSON.stringify(g[roleButton('fold', nin)]));
  de.style.setProperty('--pad-g-raise', JSON.stringify(g[roleButton('raise', nin)]));
}
function setActive(on) {
  if (!document.body) return;
  document.body.classList.toggle('pad-active', !!on);
  if (!on) clearRing();
}
function onOtherInput(e) {
  if (!document.body || !document.body.classList.contains('pad-active')) return;
  if (e && e.isTrusted === false) return;    // our own synthetic Enter
  // Typing in a field the pad opened (on-screen keyboard) keeps the ring.
  if (e && e.type === 'keydown' && isTextField(e.target)) return;
  setActive(false);
}

// ── Main step ──────────────────────────────────────────────────────────────
function readPads(list) {
  var pressed = [], val = [], axes = [0, 0, 0, 0];
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    for (var b = 0; b < p.buttons.length && b < 18; b++) {
      var bt = p.buttons[b];
      var v = typeof bt === 'number' ? bt : (bt.value || (bt.pressed ? 1 : 0));
      var pr = typeof bt === 'number' ? bt > 0.5 : !!bt.pressed;
      if (pr) pressed[b] = true;
      if (v > (val[b] || 0)) val[b] = v;
    }
    for (var a = 0; a < 4 && a < p.axes.length; a++) if (Math.abs(p.axes[a]) > Math.abs(axes[a])) axes[a] = p.axes[a];
  }
  return { pressed: pressed, val: val, axes: axes };
}
function stickDir(x, y) {
  var ax = Math.abs(x), ay = Math.abs(y);
  var on = st.stickDir ? STICK_OFF : STICK_ON;   // hysteresis
  if (Math.max(ax, ay) < on) return null;
  if (ay >= ax) return y < 0 ? 'up' : 'down';
  return x < 0 ? 'left' : 'right';
}

// One polling step at time `now` (ms). Exported for the tests.
export function padTick(now) {
  var list = pads();
  if (!list.length) { st.prev = []; return; }
  var s = readPads(list);
  var nin = opt('pad_nintendo', false);
  var focused = true;
  try { focused = document.visibilityState !== 'hidden' && (typeof document.hasFocus !== 'function' || document.hasFocus()); } catch (e) {}
  if (!opt('pad_on', true) || !focused) { st.prev = s.pressed; holdEnd(); return; }
  var prev = st.prev;
  st.prev = s.pressed;
  var down = function (b) { return !!s.pressed[b] && !prev[b]; };
  var up = function (b) { return !s.pressed[b] && !!prev[b]; };

  var any = s.pressed.some(Boolean) || s.axes.some(function (v) { return Math.abs(v) > STICK_ON; }) ||
    (s.val[LT] || 0) > TRIGGER_ON || (s.val[RT] || 0) > TRIGGER_ON;
  if (any && document.body && !document.body.classList.contains('pad-active')) setActive(true);

  var m = currentMode();
  var OK = roleButton('ok', nin), BACK = roleButton('back', nin), FOLD = roleButton('fold', nin), RAISE = roleButton('raise', nin);

  // Direction: D-pad first, else left stick; edge + auto-repeat.
  var dir = s.pressed[UP] ? 'up' : s.pressed[DOWN] ? 'down' : s.pressed[LEFT] ? 'left' : s.pressed[RIGHT] ? 'right' : null;
  var sd = stickDir(s.axes[0], s.axes[1]);
  st.stickDir = sd;
  if (!dir) dir = sd;
  var dirFire = null, repeat = false;
  if (dir && dir !== st.dir) { dirFire = dir; st.dirNext = now + REPEAT_DELAY; }
  else if (dir && now >= st.dirNext) { dirFire = dir; repeat = true; st.dirNext = now + REPEAT_EVERY; }
  st.dir = dir;

  if (down(START)) { try { if (window.toggleAdvancedOptions) window.toggleAdvancedOptions(); } catch (e) {} }

  if (down(BACK)) {
    var ed = editing();
    if (ed) { try { ed.blur(); } catch (e) {} }
    else if (closeTop()) { /* closed */ }
    else if (st.tableNav) { st.tableNav = false; clearRing(); }
  }

  if (m.mode === 'table') {
    if (st.cur) clearRing();
    if (down(SELECT)) { try { if (window.toggleGameChat) window.toggleGameChat(); } catch (e) {} }
    if (down(OK)) act('call', 'ok');
    if (down(FOLD)) act('fold', 'fold');
    if (down(RAISE)) holdStart(now);
    if (s.pressed[RAISE] && st.holdAt >= 0 && !st.holdDone && now - st.holdAt >= HOLD_MS) {
      st.holdDone = true;
      holdEnd();
      act('allin', 'raise');
    }
    if (up(RAISE)) {
      if (st.holdAt >= 0 && !st.holdDone) act('raise', 'raise');
      holdEnd();
      st.holdDone = false;
    }
    if (down(LB)) quickBet(-1);
    if (down(RB)) quickBet(1);
    var tv = (s.val[RT] || 0) - (s.val[LT] || 0);
    if (Math.abs(tv) > TRIGGER_ON) {
      if (st.betNext === 0 || now >= st.betNext) {
        st.betSteps++;
        stepBet(tv > 0 ? 1 : -1, st.betSteps > 12 ? 5 : 1);
        st.betNext = now + (st.betNext === 0 ? 320 : Math.max(60, 260 - 200 * Math.abs(tv)));
      }
    } else { st.betNext = 0; st.betSteps = 0; }
    if (dirFire && !repeat && s.pressed[dirFire === 'up' ? UP : dirFire === 'down' ? DOWN : dirFire === 'left' ? LEFT : RIGHT]) {
      if (dirFire === 'left') cycleMode(-1);
      else if (dirFire === 'right') cycleMode(1);
      else if (dirFire === 'up') {
        st.tableNav = true;
        ensureRing(m.scope);
        hint(t('padBrowse', { b: glyph('back') }));
      }
    }
    return;
  }

  // Navigation mode: a hold started at the table is dropped.
  if (st.holdAt >= 0) { holdEnd(); st.holdDone = false; }
  st.betNext = 0; st.betSteps = 0;
  var scope = m.scope;
  if (down(OK)) {
    if (ensureRing(scope)) activate(st.cur);
  }
  if (dirFire) {
    var ed2 = editing();
    if (ed2) { try { ed2.blur(); } catch (e) {} }
    if ((dirFire === 'left' || dirFire === 'right') && curValid(scope) && isAdjustable(st.cur)) {
      adjust(st.cur, dirFire === 'right' ? 1 : -1);
    } else {
      move(scope, dirFire);
    }
  }
  if (down(LB)) cycleTabs(scope, 0, -1);
  if (down(RB)) cycleTabs(scope, 0, 1);
  if (down(LT)) cycleTabs(scope, 1, -1);
  if (down(RT)) cycleTabs(scope, 1, 1);
  var rx = s.axes[2] || 0, ry = s.axes[3] || 0;
  if (Math.abs(rx) > SCROLL_DEAD || Math.abs(ry) > SCROLL_DEAD) {
    scrollFrom(scope, Math.abs(rx) > SCROLL_DEAD ? rx * 16 : 0, Math.abs(ry) > SCROLL_DEAD ? ry * 16 : 0);
  }
}

// ── Loop and lifecycle ─────────────────────────────────────────────────────
var turnWatched = false;
function loop(now) {
  st.raf = 0;
  if (!turnWatched) turnWatched = watchTurn();
  try { padTick(now); } catch (e) {}
  if (pads().length) st.raf = requestAnimationFrame(loop);
}
function start() {
  if (!st.raf && typeof requestAnimationFrame === 'function') st.raf = requestAnimationFrame(loop);
}
function onConnect(e) {
  var gp = e && e.gamepad;
  st.seen = true;
  st.style = padStyle(gp && gp.id);
  applyGlyphs();
  if (document.body) document.body.classList.add('has-gamepad');
  if (opt('pad_on', true)) hint(t('padConnected'));
  start();
}
function onDisconnect() {
  if (pads().length) return;
  if (document.body) document.body.classList.remove('has-gamepad');
  setActive(false);
  holdEnd();
  st.prev = []; st.dir = null; st.tableNav = false;
  if (opt('pad_on', true)) hint(t('padDisconnected'));
}

// Options changed (Nintendo layout swaps the glyphs; turning the pad off
// drops the ring and the glyphs).
export function padApply() {
  applyGlyphs();
  if (!opt('pad_on', true)) { setActive(false); holdEnd(); st.tableNav = false; }
}

if (typeof window !== 'undefined') {
  window.addEventListener('gamepadconnected', onConnect);
  window.addEventListener('gamepaddisconnected', onDisconnect);
  ['pointerdown', 'keydown', 'wheel'].forEach(function (ev) {
    document.addEventListener(ev, onOtherInput, true);
  });
  // A pad already known to the page (module loaded after its first press).
  if (pads().length) onConnect({ gamepad: pads()[0] });
  window.padApply = padApply;
  window.PadNav = { padTick: padTick, currentMode: currentMode, candidates: candidates, padApply: padApply };
}
