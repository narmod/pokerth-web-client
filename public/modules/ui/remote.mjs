// @ts-check
// ── remote.mjs — TV remote adapter of the controller core (Android TV) ──────
//
// WEB ADDITION. An Android TV / Google TV remote reaches the browser as keys:
// the D-pad as arrows, its centre as Enter (DPAD_CENTER), Back as a history
// step (handled by ui/back-guard.mjs, which asks ctl-nav first) or as
// Escape / GoBack in some TV browsers, plus Play/Pause, Menu and, on some
// remotes, the four colour keys. This adapter turns them into the actions of
// ui/ctl-nav.mjs, the core shared with the gamepad:
//
//   Arrows   Navigation: move the ring · Game: move it over the action bar
//            (←/→ on the slider or the amount change it)
//   OK       select / press the ringed button   · held 0.6 s: controller menu
//   Back     back (Escape) — never folds
//   ⏯ Play/Pause   Game ⇄ Navigation (also a tile of the menu)
//   ☰ Menu   controller menu
//   Red · Green · Yellow · Blue   Fold · Check/Call · Bet/Raise · All-In
//
// On by itself on a TV (Android TV user agent, or a screen with no pointer
// at all); option remote_on forces it either way. Keys typed into a focused
// text field (the device keyboard) are left alone, Back aside.

import { ctl, opt, isTextField } from './ctl-nav.mjs';

export const LONG_MS = 600;

// Android TV / Google TV / Fire TV / Shield… or a screen with no pointer.
export function isTV(ua, noPointer) {
  if (/Android/i.test(ua) && /\b(TV|AFT\w*|BRAVIA|GoogleTV|Chromecast|SHIELD|MiTV|SmartTV|Leanback|AndroidTV)\b/i.test(ua)) return true;
  return !!noPointer;
}
function detected() {
  var np = false;
  try { np = !!(window.matchMedia && window.matchMedia('(any-pointer: none)').matches); } catch (e) {}
  return isTV(navigator.userAgent || '', np);
}
export function enabled() { return opt('remote_on', detected()); }

// key / keyCode → remote action name, or null.
export function keyAction(e) {
  var k = e.key || '', c = e.keyCode || 0;
  if (k === 'ArrowUp' || c === 19) return 'up';
  if (k === 'ArrowDown' || c === 20) return 'down';
  if (k === 'ArrowLeft' || c === 21) return 'left';
  if (k === 'ArrowRight' || c === 22) return 'right';
  if (k === 'Enter' || c === 23 || c === 66) return 'ok';
  if (k === 'Escape' || k === 'GoBack' || k === 'BrowserBack' || c === 4) return 'back';
  if (k === 'MediaPlayPause' || k === 'MediaPlay' || k === 'MediaPause' || c === 179 || c === 85) return 'toggle';
  if (k === 'ContextMenu' || k === 'Menu' || c === 93 || c === 82) return 'menu';
  if (k === 'ColorF0Red' || c === 403) return 'fold';
  if (k === 'ColorF1Green' || c === 404) return 'call';
  if (k === 'ColorF2Yellow' || c === 405) return 'raise';
  if (k === 'ColorF3Blue' || c === 406) return 'allin';
  return null;
}

var okAt = 0, okTimer = 0, okLong = false;

function mark() {
  var b = document.body;
  if (!b) return;
  b.classList.add('has-remote');
  b.classList.add('pad-active');
  ctl.source('remote');
}

function onKeyDown(e) {
  if (!enabled()) return;
  var a = keyAction(e);
  if (!a) return;
  // The device keyboard is typing in a focused field: only Back is ours.
  if (a !== 'back' && isTextField(e.target)) return;
  mark();
  e.preventDefault();
  e.stopPropagation();
  ctl.tick();
  if (a === 'ok') {
    if (e.repeat || okAt) return;            // held: the timer decides
    okAt = Date.now(); okLong = false;
    okTimer = setTimeout(function () { okLong = true; okTimer = 0; ctl.do('menu'); }, LONG_MS);
    return;
  }
  ctl.do(a, { repeat: !!e.repeat });
}

function onKeyUp(e) {
  if (!enabled() || keyAction(e) !== 'ok') return;
  if (!okAt) return;
  if (isTextField(e.target)) { okAt = 0; return; }
  e.preventDefault();
  e.stopPropagation();
  if (okTimer) { clearTimeout(okTimer); okTimer = 0; }
  var short = !okLong;
  okAt = 0; okLong = false;
  if (short) { ctl.tick(); ctl.do('ok'); }
}

if (typeof window !== 'undefined') {
  // Window capture: before keynav, the shortcuts and the gamepad's own
  // "another input took over" listener (all on document).
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  // While the remote drives, the badge and the ring keep up with the page
  // (turn changes, panels closing) — the gamepad does it from its frames.
  setInterval(function () {
    var b = document.body;
    if (b && b.classList.contains('has-remote') && b.classList.contains('pad-active') && enabled()) {
      try { ctl.tick(); } catch (e) {}
    }
  }, 250);
  window.RemoteNav = { keyAction: keyAction, isTV: isTV, enabled: enabled };
}
