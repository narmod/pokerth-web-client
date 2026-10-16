// @ts-check
// ── gamepad.mjs — gamepad adapter of the controller core ────────────────────
//
// WEB ADDITION: the official QML client has no gamepad support (bible §6
// lists keyboard and Android Back only). Reads the browser Gamepad API
// ("standard" layout: Xbox, PlayStation, Switch Pro, most Bluetooth pads;
// browsers report a pad only after one of its buttons was pressed) and turns
// buttons into the abstract actions of ui/ctl-nav.mjs, which owns the modes,
// the focus ring, the zones and the table actions. A TV remote will be a
// second adapter on the same core.
//
//   Everywhere   Select  game ⇄ navigation     Start  controller menu
//                B       back (Escape); never folds
//   GAME         A Check/Call · X Fold · Y Bet/Raise, Y held 600 ms All-In
//                LT/RT bet amount −/+ (accelerates) · LB/RB 1/3 · 1/2 · Pot
//                D-pad ←/→ playing mode
//   NAVIGATION   D-pad / left stick move · A select · X chat · Y Ace's Help
//                LB/RB previous / next zone (table, open panels, the Ace)
//                LT/RT previous / next tab · right stick scroll
//                ←/→ on a list, slider or number field: change its value
//
// Options (Advanced options → User interface → Gamepad): pad_on (default
// on), pad_rumble (vibrate on my turn, default on), pad_nintendo (A/B swapped:
// confirm with the right-hand face button, default off).
//
// Body classes: has-gamepad (a pad was seen), pad-active (the pad is the last
// input used — mouse, touch or keyboard removes it). Button glyphs on the
// action bar come from --pad-g-ok, --pad-g-fold, --pad-g-raise on <html>.

import { ctl, t, opt, isTextField, effective, candidates } from './ctl-nav.mjs';

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

var st = {
  raf: 0, seen: false, style: 'xb',
  prev: [], dir: null, dirNext: 0, stickDir: null,
  holdAt: -1, holdDone: false,
  betNext: 0, betSteps: 0,
  kPos: 0, kAt: 0, kBackAt: 0      // Konami code (see konami())
};

function pads() {
  var out = [];
  try {
    var list = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < (list ? list.length : 0); i++) if (list[i] && list[i].connected !== false) out.push(list[i]);
  } catch (e) {}
  return out;
}
function glyph(role) { return GLYPHS[st.style][roleButton(role, opt('pad_nintendo', false))]; }
function hint(text) { try { if (window.showKeyHint) window.showKeyHint(text, '🎮'); } catch (e) {} }

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
function onTurn() {
  if (!st.seen || !opt('pad_on', true) || !opt('pad_rumble', true)) return;
  rumble(140, 0.7, 0.4);
  setTimeout(function () { rumble(140, 0.7, 0.4); }, 230);
}

// ── Glyphs and input source ────────────────────────────────────────────────
function applyGlyphs() {
  var de = document.documentElement;
  de.style.setProperty('--pad-g-ok', JSON.stringify(glyph('ok')));
  de.style.setProperty('--pad-g-fold', JSON.stringify(glyph('fold')));
  de.style.setProperty('--pad-g-raise', JSON.stringify(glyph('raise')));
}
function setActive(on) {
  if (!document.body) return;
  document.body.classList.toggle('pad-active', !!on);
  if (!on) ctl.clearRing();
}
function onOtherInput(e) {
  if (!document.body || !document.body.classList.contains('pad-active')) return;
  if (e && e.isTrusted === false) return;    // our own synthetic events
  // Typing in a field the pad opened (on-screen keyboard) keeps the ring.
  if (e && e.type === 'keydown' && isTextField(e.target)) return;
  setActive(false);
}

// ── Polling ────────────────────────────────────────────────────────────────
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

// ── Easter egg: the Konami code ────────────────────────────────────────────
// ↑ ↑ ↓ ↓ ← → ← → on the D-pad, then B, A — in Navigation mode at the table
// (the gamepad menu and the on-screen keyboard included; never in Game mode,
// where ←/→ and A play). Same effect as typing it in the game chat
// (window._konamiEgg, pokerth.js). The eight directions only move the ring;
// once they are in, the next B is held back for KONAMI_MS: A within that
// time plays the egg and both presses are swallowed, anything else (or the
// time running out) gives B its usual Back, a little late. B and A are the
// back / ok roles, so they follow the Nintendo option like the labels.
const KONAMI = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];
export const KONAMI_MS = 1500;
function konamiHere() {
  var scr = document.querySelector('.screen.active');
  return !!(scr && scr.id === 's-game') && effective().mode === 'nav';
}
// Returns 'egg' (A swallowed), 'held' (B swallowed) or ''.
function konami(now, s, down, dirFire, repeat, dpad, OK, BACK) {
  // A held-back B: A completes the code, anything else releases it.
  if (st.kBackAt) {
    if (down(OK) && now - st.kBackAt <= KONAMI_MS) {
      st.kBackAt = 0; st.kPos = 0;
      try { if (typeof window._konamiEgg === 'function') window._konamiEgg(); } catch (e) {}
      return 'egg';
    }
    var other = !!dirFire || s.pressed.some(function (p, b) { return p && down(b); });
    if (other || now - st.kBackAt > KONAMI_MS) { st.kBackAt = 0; st.kPos = 0; ctl.do('back'); }
    return '';
  }
  if (!konamiHere()) { st.kPos = 0; return ''; }
  if (st.kPos && now - st.kAt > KONAMI_MS) st.kPos = 0;
  if (st.kPos === KONAMI.length && down(BACK)) { st.kBackAt = now; return 'held'; }
  if (dirFire && !repeat && dpad === dirFire) {
    if (st.kPos < KONAMI.length && dirFire === KONAMI[st.kPos]) st.kPos++;
    else st.kPos = dirFire !== 'up' ? 0 : (st.kPos === 2 ? 2 : 1);   // ↑↑↑ still ends in ↑↑
    st.kAt = now;
  } else if (s.pressed.some(function (p, b) { return p && down(b) && b !== UP && b !== DOWN && b !== LEFT && b !== RIGHT; })) {
    st.kPos = 0;
  }
  return '';
}

// One polling step at time `now` (ms). Exported for the tests.
export function padTick(now) {
  var list = pads();
  if (!list.length) { st.prev = []; return; }
  var s = readPads(list);
  var nin = opt('pad_nintendo', false);
  var focused = true;
  try { focused = document.visibilityState !== 'hidden' && (typeof document.hasFocus !== 'function' || document.hasFocus()); } catch (e) {}
  if (!opt('pad_on', true) || !focused) { st.prev = s.pressed; ctl.holdEnd(); st.holdAt = -1; return; }
  var prev = st.prev;
  st.prev = s.pressed;
  var down = function (b) { return !!s.pressed[b] && !prev[b]; };
  var up = function (b) { return !s.pressed[b] && !!prev[b]; };

  var any = s.pressed.some(Boolean) || s.axes.some(function (v) { return Math.abs(v) > STICK_ON; }) ||
    (s.val[LT] || 0) > TRIGGER_ON || (s.val[RT] || 0) > TRIGGER_ON;
  if (any) ctl.source('gamepad');
  if (any && document.body && !document.body.classList.contains('pad-active')) setActive(true);
  ctl.tick();

  var OK = roleButton('ok', nin), BACK = roleButton('back', nin), FOLD = roleButton('fold', nin), RAISE = roleButton('raise', nin);

  // Direction: D-pad first, else left stick; edge + auto-repeat.
  var dpad = s.pressed[UP] ? 'up' : s.pressed[DOWN] ? 'down' : s.pressed[LEFT] ? 'left' : s.pressed[RIGHT] ? 'right' : null;
  var sd = stickDir(s.axes[0], s.axes[1]);
  st.stickDir = sd;
  var dir = dpad || sd;
  var dirFire = null, repeat = false;
  if (dir && dir !== st.dir) { dirFire = dir; st.dirNext = now + REPEAT_DELAY; }
  else if (dir && now >= st.dirNext) { dirFire = dir; repeat = true; st.dirNext = now + REPEAT_EVERY; }
  st.dir = dir;

  var egg = konami(now, s, down, dirFire, repeat, dpad, OK, BACK);
  if (egg === 'egg') return;

  if (down(SELECT)) { ctl.do('toggle'); return; }
  if (down(START)) { ctl.do('menu'); return; }
  if (down(BACK) && egg !== 'held') ctl.do('back');

  var mode = effective().mode;
  if (mode === 'game') {
    if (down(OK)) ctl.do('call');
    if (down(FOLD)) ctl.do('fold');
    if (down(RAISE)) { st.holdAt = now; st.holdDone = false; ctl.holdStart(HOLD_MS); }
    if (s.pressed[RAISE] && st.holdAt >= 0 && !st.holdDone && now - st.holdAt >= HOLD_MS) {
      st.holdDone = true;
      ctl.holdEnd();
      ctl.do('allin');
    }
    if (up(RAISE)) {
      if (st.holdAt >= 0 && !st.holdDone) ctl.do('raise');
      ctl.holdEnd();
      st.holdAt = -1; st.holdDone = false;
    }
    if (down(LB)) ctl.do('quickBet', -1);
    if (down(RB)) ctl.do('quickBet', 1);
    var tv = (s.val[RT] || 0) - (s.val[LT] || 0);
    if (Math.abs(tv) > TRIGGER_ON) {
      if (st.betNext === 0 || now >= st.betNext) {
        st.betSteps++;
        ctl.do('bet', (tv > 0 ? 1 : -1) * (st.betSteps > 12 ? 5 : 1));
        st.betNext = now + (st.betNext === 0 ? 320 : Math.max(60, 260 - 200 * Math.abs(tv)));
      }
    } else { st.betNext = 0; st.betSteps = 0; }
    if (dirFire && !repeat && dpad === dirFire && (dirFire === 'left' || dirFire === 'right')) {
      ctl.do('playMode', dirFire === 'left' ? -1 : 1);
    }
    return;
  }

  // Navigation: a hold started in game mode is dropped.
  if (st.holdAt >= 0) { ctl.holdEnd(); st.holdAt = -1; st.holdDone = false; }
  st.betNext = 0; st.betSteps = 0;
  if (down(OK)) ctl.do('ok');
  if (dirFire) ctl.do(dirFire, { repeat: repeat });
  if (down(FOLD)) ctl.do('chat');
  if (down(RAISE)) ctl.do('ace');
  if (down(LB)) ctl.do('zonePrev');
  if (down(RB)) ctl.do('zoneNext');
  if (down(LT)) ctl.do('tabPrev');
  if (down(RT)) ctl.do('tabNext');
  var rx = s.axes[2] || 0, ry = s.axes[3] || 0;
  if (Math.abs(rx) > SCROLL_DEAD || Math.abs(ry) > SCROLL_DEAD) {
    ctl.do('scroll', { dx: Math.abs(rx) > SCROLL_DEAD ? rx * 16 : 0, dy: Math.abs(ry) > SCROLL_DEAD ? ry * 16 : 0 });
  }
}

// ── Loop and lifecycle ─────────────────────────────────────────────────────
function loop(now) {
  st.raf = 0;
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
  ctl.holdEnd();
  st.prev = []; st.dir = null; st.holdAt = -1;
  ctl.setMode('game');
  if (opt('pad_on', true)) hint(t('padDisconnected'));
}

// Options changed (Nintendo layout swaps the glyphs; turning the pad off
// drops the ring and the glyphs).
export function padApply() {
  applyGlyphs();
  if (!opt('pad_on', true)) { setActive(false); ctl.holdEnd(); st.holdAt = -1; }
}

if (typeof window !== 'undefined') {
  ctl.setGlyph(glyph);
  ctl.setTurnHook(onTurn);
  ctl.setKeysHelp(function () { return [t('padHintTable'), t('padHintNav')]; });
  ctl.setKbLegend(function () {
    return glyph('fold') + ' \u232B \u00B7 ' + glyph('raise') + ' \u2423 \u00B7 LB \u21E7 \u00B7 RB 123 \u00B7 Start \u21B5 \u00B7 ' + glyph('back') + ' \u2715';
  });
  window.addEventListener('gamepadconnected', onConnect);
  window.addEventListener('gamepaddisconnected', onDisconnect);
  ['pointerdown', 'keydown', 'wheel'].forEach(function (ev) {
    document.addEventListener(ev, onOtherInput, true);
  });
  // A pad already known to the page (module loaded after its first press).
  if (pads().length) onConnect({ gamepad: pads()[0] });
  window.padApply = padApply;
  window.PadNav = { padTick: padTick, currentMode: effective, candidates: candidates, padApply: padApply };
}
