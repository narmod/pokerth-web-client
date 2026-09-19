#!/usr/bin/env node
// Mobile loupe (x2 zoom layer): the pan is stored in absolute zone pixels of
// the ring layout that was current when it was made. When the ring gets
// redistributed ("Remove players who left", or that option toggled mid-hand)
// the excerpt used to keep showing a spot where no seat sits any more
// (upstream a6d4f05, GamePage.qml _reanchorZoom). This test runs the real
// loupe block of public/pokerth.js against a fake DOM.
// Run: node scripts/test-loupe-reanchor.mjs
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');
let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

const START = 'var _loupe = {';
const END = "window.addEventListener('resize', function () { _loupeClamp(); _loupeApply(false); _loupeBtnSync(); });";
const a = src.indexOf(START), b = src.indexOf(END);
ok(a > 0 && b > a, 'loupe block is still where the test expects it');
const block = src.slice(a, b);

// ── Fake DOM: a 400x300 zone, seats addressed by data-pid ──────────────────
function mkEl(extra) {
  return Object.assign({ style: {}, dataset: {}, classList: { toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute(k) { return this.attrs ? this.attrs[k] : null; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 0, height: 0 }; } }, extra || {});
}
const zone = mkEl({ clientWidth: 400, clientHeight: 300 });
const layer = mkEl();
let seats = {};      // pid -> element
let activePid = null;
function seat(pid, left, top) {
  return mkEl({ attrs: { 'data-pid': String(pid) }, style: { left: left + 'px', top: top + 'px' } });
}
const timers = [];
const document = {
  getElementById(id) { return id === 'g-table-zone' ? zone : id === 'g-zoom-layer' ? layer : null; },
  querySelector(sel) {
    let m = sel.match(/data-pid="(\d+)"/);
    if (m) return seats[m[1]] || null;
    if (sel.indexOf('.seat.active') >= 0) return activePid != null ? (seats[activePid] || null) : null;
    return null;
  },
  addEventListener() {},
};
const window = { innerWidth: 400, innerHeight: 300, matchMedia: () => ({ matches: true }), _seatCount: 0 };
const ctx = vm.createContext({ window, document, localStorage: { getItem: () => null },
  setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearTimeout() {}, parseFloat, Math });
vm.runInContext(block + '\nthis.__loupe = _loupe; this.__render = window._loupeOnRender;', ctx);
const L = ctx.__loupe, render = ctx.__render;
function flush() { while (timers.length) timers.shift().fn(); }

ok(typeof window._loupeReanchor === 'function', '_loupeReanchor is exposed');

// 6-seat ring, loupe on, opponent 12 is to act → deferred follow pans onto it
seats = { 11: seat(11, 60, 80), 12: seat(12, 280, 80), 13: seat(13, 200, 40) };
window._seatCount = 6; activePid = 12;
window.toggleLoupe(); flush();
render(seats[12], false, 8); flush();
ok(L.panSeat === '12', 'the pan remembers the seat it was computed for');
ok(L.panX === 2 * (200 - 280) && L.panY === 2 * (150 - 80), 'pan centres seat 12 (' + L.panX + ',' + L.panY + ')');

// Same ring count → nothing is scheduled, pan untouched
const px0 = L.panX, py0 = L.panY;
render(seats[12], false, 8);
ok(timers.length === 0 && L.panX === px0 && L.panY === py0, 'same ring count: no re-anchor');

// Ring redistributed (a player removed): seat 12 moved → pan follows it
seats = { 11: seat(11, 40, 150), 12: seat(12, 260, 100) };
window._seatCount = 5;
render(seats[12], false, 8);
ok(timers.length === 1 && timers[0].ms === 0, 'ring count changed: a deferred re-anchor is scheduled');
flush();
ok(L.panX === 2 * (200 - 260) && L.panY === 2 * (150 - 100), 're-anchored onto seat 12 at its new place (' + L.panX + ',' + L.panY + ')');

// The followed seat itself left the ring → back to the table centre
seats = { 11: seat(11, 40, 150) };
window._seatCount = 4; activePid = null;
render(null, false, 8); flush();
ok(L.panX === 0 && L.panY === 0 && L.panSeat === null, 'followed seat gone: back to the table centre');

// Never while the player is dragging the view
L.panX = 123; L.panY = -45; L.drag = true;
window._seatCount = 3;
render(null, false, 8); flush();
ok(L.panX === 123 && L.panY === -45, 'no re-anchor during a manual drag');
L.drag = false;

// Loupe off: ring count is tracked but nothing is scheduled
window.toggleLoupe(); flush();
window._seatCount = 2;
render(null, false, 8);
ok(timers.length === 0 && L.ringN === 2, 'loupe off: count tracked, nothing scheduled');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All loupe re-anchor tests passed.');
