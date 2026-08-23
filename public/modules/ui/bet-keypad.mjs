// ═══════════════════════════════════════════════════════════════════
// Bet keypad — web-only addition on top of the QML GameActionBar.
//
// On touch devices the OS keyboard is a poor fit for the bet field: it
// covers half of the table, it pushes the whole layout up on iOS, and a
// 24 px field is well below the 44/48 px touch target guidelines. This
// module replaces it with an in-bar keypad: the field goes readonly with
// inputmode="none" so the OS keyboard is never summoned, and the digits
// are entered from a grid that takes the place of the middle and action
// rows — same overall height, so the table above never reflows.
//
// The keypad is ADDITIVE: the slider, the quick-bet buttons and the
// regular field all keep working exactly as before. Validating simply
// writes the amount into #raise-amt and calls App.doRaise(), so every
// existing guard (clamp, guard_raise, all-in routing) still applies.
//
// Also hosts the QML raise-step helpers, used by the slider in
// action-bar.mjs (see raiseStepFor / roundedRaiseAmount in
// src/gui/qt6-qml/components/GameActionBar.qml).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { fmtChips } from './fmt.mjs';

// ─── QML parity helpers (GameActionBar.qml) ────────────────────────
// Slider granularity by stack size. Without it the web slider ran on
// step=1, which made a precise amount impossible to reach with a finger
// on a 4 px track — and diverged from the desktop client.
function raiseStepFor(maximum) {
  if (maximum <= 1000)   return 10;
  if (maximum <= 10000)  return 50;
  if (maximum <= 100000) return 500;
  return 5000;
}

// Floor to the step, with the maximum kept exact so the top of the
// slider is always a true all-in. Applied to the SLIDER only — typing in
// the field or on the keypad stays accurate to the chip.
function roundedRaiseAmount(amount, min, max) {
  if (!Number.isFinite(amount)) return min;
  if (amount >= max) return max;
  return Math.max(min, Math.floor(amount / raiseStepFor(max)) * raiseStepFor(max));
}

// ─── State ─────────────────────────────────────────────────────────
let _buf   = '';     // digits typed so far
let _fresh = true;   // true until the first keypress: it replaces, not appends
let _min   = 0;
let _max   = 0;
let _keyH  = null;   // physical-keyboard handler while the keypad is open
let _open  = false;  // guard: close() must be a no-op when nothing is open

function _actionGrid() { return document.querySelector('#g-actions .action-grid'); }
function _field()      { return document.getElementById('raise-amt'); }

// True when the pointer is coarse: the field then goes readonly and a tap
// opens the keypad instead of the OS keyboard.
function isCoarsePointer() {
  try { return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); }
  catch (e) { return false; }
}

// True when a keypad makes sense at all — coarse pointers, but also
// touch-capable desktops, where the field keeps its physical keyboard and
// the keypad is reached through the small keypad button next to it.
function keypadAvailable() {
  if (isCoarsePointer()) return true;
  try { return (navigator.maxTouchPoints || 0) > 0; } catch (e) { return false; }
}

// ─── Quick picks (4th column) ──────────────────────────────────────
// 1/2 and Pot are read back from the existing quick-bet buttons rather
// than recomputed, so the two paths can never disagree on the amount.
function _quickPicks(min, max) {
  const picks = [{ label: 'Min', value: min }];
  const btns  = document.querySelectorAll('#g-actions .pct-row .btn-pct');
  const want  = [{ i: 1, label: '1/2' }, { i: 2, label: 'Pot' }];
  for (let k = 0; k < want.length; k++) {
    const b = btns[want[k].i];
    if (!b) continue;
    const m = /setPct\((\d+)\)/.exec(b.getAttribute('onclick') || '');
    if (m) picks.push({ label: want[k].label, value: Math.max(min, Math.min(parseInt(m[1], 10), max)) });
  }
  picks.push({ label: window.pkTerm ? window.pkTerm('allin') : 'All-In', value: max });
  return picks;
}

function _esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Rendering ─────────────────────────────────────────────────────
function _html(min, max) {
  const picks = _quickPicks(min, max);
  const rows  = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];
  let g = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) g += '<button type="button" class="kp-k" data-k="' + rows[r][c] + '">' + rows[r][c] + '</button>';
    g += _pickBtn(picks[r]);
  }
  g += '<button type="button" class="kp-k kp-del" data-del="1" aria-label="' + _esc(t('delete')) + '">\u232b</button>'
     + '<button type="button" class="kp-k" data-k="0">0</button>'
     + '<button type="button" class="kp-k" data-k="00">00</button>'
     + _pickBtn(picks[3]);
  const raiseWord = window.pkTerm ? window.pkTerm(S.highestBet > 0 ? 'raise' : 'bet') : 'Raise';
  return '<div class="bet-keypad" id="bet-keypad" role="group" aria-label="' + _esc(t('betKeypad')) + '">'
    + '<div class="kp-head">'
    +   '<span class="kp-amt" id="kp-amt"></span>'
    +   '<span class="kp-range">\u2265 ' + fmtChips(min) + ' \u00b7 \u2264 ' + fmtChips(max) + '</span>'
    + '</div>'
    + '<div class="kp-grid" id="kp-grid">' + g + '</div>'
    + '<div class="kp-foot">'
    // Les deux boutons du pied portent les VRAIES classes de la barre
    // (.btn-action / .btn-raise) : ils heritent ainsi de la forme, des
    // couleurs et des images de boutons du theme en vigueur, sans
    // qu'aucune regle n'ait a etre dupliquee ici.
    +   '<button type="button" class="btn-action kp-cancel" id="kp-cancel">' + _esc(t('cancelBtn')) + '</button>'
    +   '<button type="button" class="btn-action btn-raise kp-ok" id="kp-ok">' + raiseWord + ' <b id="kp-ok-amt"></b></button>'
    + '</div>'
    + '</div>';
}

function _pickBtn(p) {
  if (!p) return '<span></span>';
  return '<button type="button" class="kp-s" data-set="' + p.value + '">' + _esc(p.label) + '</button>';
}

function _value() {
  const n = parseInt(_buf || '', 10);
  return Number.isFinite(n) ? n : 0;
}

// An amount is valid exactly when the action bar would accept it: something
// typed, at least the minimum raise, no more than the stack.
function _valid() {
  const n = _value();
  return _buf !== '' && n >= _min && n <= _max;
}

function _paint() {
  const n    = _value();
  const good = _valid();
  const amt  = document.getElementById('kp-amt');
  const okA  = document.getElementById('kp-ok-amt');
  const okB  = document.getElementById('kp-ok');
  if (amt) {
    amt.textContent = fmtChips(n);
    // Out of range is SHOWN, never silently corrected.
    if (good) amt.classList.remove('kp-bad');
    else      amt.classList.add('kp-bad');
  }
  // The confirm button always shows what was actually typed, and greys out
  // while that amount is unplayable — same guard as the bar, where Bet/Raise
  // is disabled whenever a raise is not available. Showing a clamped amount
  // here would contradict the greyed-out state and hide the real problem.
  if (okA) okA.textContent = fmtChips(n);
  if (okB) okB.disabled = !good;
}

// ─── Open / close ──────────────────────────────────────────────────
function openBetKeypad() {
  const grid = _actionGrid();
  const fld  = _field();
  if (!grid || !fld || fld.disabled) return;
  if (document.getElementById('bet-keypad')) return;
  // Same preconditions as the bar itself. The out-of-turn preview is inert,
  // and a frozen bar (.no-action, e.g. after folding) must stay frozen — the
  // keypad cannot become a side door onto a bar that refuses clicks.
  if (grid.closest('.actions-preview')) return;
  if (grid.closest('.no-action')) return;
  // A closed socket makes any action pointless; doAction would only show the
  // "connection lost" panel. Better not to open a keypad over it.
  if (!S.ws || S.ws.readyState !== 1) return;
  // Not my turn any more: the panel is about to be re-rendered anyway.
  if (S.turnPid !== S.myId) return;
  _min = parseInt(fld.getAttribute('min'), 10) || 0;
  _max = parseInt(fld.getAttribute('max'), 10) || 0;
  if (_max <= 0) return;
  _buf = String(parseInt(fld.value, 10) || _min);
  _fresh = true;
  const row = grid.querySelector('.bet-row');
  if (!row) return;
  row.insertAdjacentHTML('afterend', _html(_min, _max));
  grid.classList.add('kp-open');
  try { fld.blur(); } catch (e) {}
  const kg = document.getElementById('kp-grid');
  if (kg) kg.addEventListener('click', _onGridClick);
  const kc = document.getElementById('kp-cancel');
  if (kc) kc.addEventListener('click', function (e) { e.preventDefault(); closeBetKeypad(); });
  const ko = document.getElementById('kp-ok');
  if (ko) ko.addEventListener('click', function (e) { e.preventDefault(); _commit(); });
  _keyH = _onKeyDown;
  _open = true;
  document.addEventListener('keydown', _keyH, true);
  _paint();
  try { if (window.updateBottomLayout) window.updateBottomLayout(); } catch (e) {}
}

function closeBetKeypad() {
  if (!_open) return;
  _open = false;
  const el = document.getElementById('bet-keypad');
  if (el && el.parentNode) el.parentNode.removeChild(el);
  const grid = _actionGrid();
  if (grid) grid.classList.remove('kp-open');
  // The grid may already have been wiped by a re-render; the class lives on
  // the removed node in that case, so nothing else to clean there.
  const anyGrid = document.querySelector('#g-actions .kp-open');
  if (anyGrid) anyGrid.classList.remove('kp-open');
  if (_keyH) { document.removeEventListener('keydown', _keyH, true); _keyH = null; }
  if (el) { try { if (window.updateBottomLayout) window.updateBottomLayout(); } catch (e) {} }
}

// ─── Input ─────────────────────────────────────────────────────────
function _push(d) {
  if (_fresh) { _buf = ''; _fresh = false; }
  if (_buf.length >= 9) return;
  if (_buf === '0') _buf = '';
  _buf += d;
  _paint();
}

function _del() {
  _fresh = false;
  _buf = _buf.slice(0, -1);
  _paint();
}

function _set(v) {
  _fresh = false;
  _buf = String(v);
  _paint();
}

function _onGridClick(e) {
  const b = e.target && e.target.closest ? e.target.closest('button') : null;
  if (!b) return;
  e.preventDefault();
  try { if (navigator.vibrate) navigator.vibrate(8); } catch (_e) {}
  if (b.hasAttribute('data-k'))        _push(b.getAttribute('data-k'));
  else if (b.hasAttribute('data-del')) _del();
  else if (b.hasAttribute('data-set')) _set(b.getAttribute('data-set'));
}

function _onKeyDown(e) {
  // Self-heal: a server re-render can wipe the keypad without going through
  // closeBetKeypad(), which would leave this listener attached forever.
  if (!document.getElementById('bet-keypad')) { closeBetKeypad(); return; }
  const k = e.key || '';
  if (/^[0-9]$/.test(k))       { e.preventDefault(); e.stopPropagation(); _push(k); }
  else if (k === 'Backspace')  { e.preventDefault(); e.stopPropagation(); _del(); }
  else if (k === 'Enter')      { e.preventDefault(); e.stopPropagation(); _commit(); }
  else if (k === 'Escape')     { e.preventDefault(); e.stopPropagation(); closeBetKeypad(); }
}

// Validating writes the amount through the normal path: the field is the
// single source of truth for doRaise(), so every existing guard applies.
function _commit() {
  const fld = _field();
  if (!fld) { closeBetKeypad(); return; }
  // Nothing leaves the keypad while the amount is unplayable: the confirm
  // button is disabled, and Enter must not be a way around it.
  if (!_valid()) return;
  // The amount is written AS TYPED, never pre-clamped. Clamping here would
  // short-circuit doRaise()'s guard_raise check — typing 300 with a 250 stack
  // would have gone all-in silently, exactly the surprise that guard exists
  // to prevent. doRaise() re-reads the live minimum and stack at send time,
  // so a raise that arrived while the keypad was open is still caught.
  const v = _value();
  fld.value = String(v);
  const sl = document.getElementById('raise-slider');
  if (sl) sl.value = String(Math.max(_min, Math.min(v, _max)));
  if (window._syncRaiseBtnAmt) window._syncRaiseBtnAmt();
  closeBetKeypad();
  // Passe par App.doRaise : un appui manuel doit aussi repasser le mode de
  // jeu a Manuel, exactement comme un clic sur le bouton Relancer.
  try {
    if (window.App && window.App.doRaise) window.App.doRaise();
    else if (window.doRaise) window.doRaise();
  } catch (e) {}
}

export { raiseStepFor, roundedRaiseAmount, isCoarsePointer, keypadAvailable,
         openBetKeypad, closeBetKeypad };

for (const [k, v] of Object.entries({ openBetKeypad, closeBetKeypad }))
  window[k] = v;
