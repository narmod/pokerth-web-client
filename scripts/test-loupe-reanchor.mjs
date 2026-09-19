#!/usr/bin/env node
// Mobile loupe (x2 zoom layer) - follow state machine, port of GamePage.qml
// 2.1.9 (tableZone): deferred follow of the seat to act, immediate pan when it
// acts, self box zone on my turn, community cards on a new street, pan reset
// at showdown, and re-anchoring when the ring is redistributed (a6d4f05).
// This test runs the real loupe block of public/pokerth.js against a fake DOM.
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
let timerSeq = 0;
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
  setTimeout: (fn, ms) => { const id = ++timerSeq; timers.push({ id, fn, ms }); return id; },
  clearTimeout: (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
  parseFloat, Math, isFinite });
vm.runInContext(block + '\nthis.__loupe = _loupe; this.__render = window._loupeOnRender;', ctx);
const L = ctx.__loupe, render = ctx.__render;
function flush() { while (timers.length) timers.shift().fn(); }

ok(typeof window._loupeReanchor === 'function' && typeof window._loupeMyTurn === 'function'
   && typeof window._loupeBoardCards === 'function', 'loupe hooks are exposed');
const acted = () => vm.runInContext('_loupeDoFollow()', ctx);
const handStart = () => vm.runInContext('_loupeHandStart()', ctx);
const me = mkEl({ dataset: { baseTop: '260', baseLeft: '200', baseScale: '1' } });
const _qs = document.querySelector;
document.querySelector = (sel) => (sel === '#g-seats .seat.me' ? me : _qs(sel));
window._commCenterY = 120;

// ── Deferred follow (QML _scheduleFollow / _doFollow) ──────────────────────
seats = { 11: seat(11, 60, 80), 12: seat(12, 280, 80), 13: seat(13, 200, 40) };
window._seatCount = 6; activePid = 12;
window.toggleLoupe(); flush();
render(seats[12], false, 8);
ok(timers.length === 1 && timers[0].ms === 2000 && L.pendSeat === '12' && L.panX === 0,
  'opponent to act: pan planned at 1/4 of the thinking time (8 s -> 2000 ms), not executed yet');
render(seats[12], false, 8);
ok(timers.length === 1, 're-renders do not thrash the timer (idempotent)');
timers.length = 0; acted();
ok(L.followSeat === '12' && L.pendSeat === null && L.panX === 2 * (200 - 280) && L.panY === 2 * (150 - 80),
  'the player acted: planned pan executed at once (' + L.panX + ',' + L.panY + ')');
render(seats[12], false, 8);
ok(timers.length === 0, 'seat already panned to: nothing planned');
render(seats[11], false, 0); 
ok(timers.length === 1 && timers[0].ms === 2000, 'no timeout known: 8 s fallback');
flush();
ok(L.followSeat === '11', 'timer expiry pans to the planned seat');

// ── My turn (QML onMyTurnChanged) ──────────────────────────────────────────
render(seats[12], false, 8);           // a pan to 12 is pending...
window._loupeMyTurn();                 // ...and it is my turn
ok(L.pendSeat === null && L.followSeat === 'self' && L.panX === 0 && L.panY === -150,
  'my turn: planned pan dropped, self box zone shown at once (0,-150)');
timers.length = 0;

// ── New street (QML onBoardCardsChanged) ───────────────────────────────────
render(seats[12], false, 8); acted();
window._loupeBoardCards();
ok(L.followSeat === null && L.panX === 0 && L.panY === 2 * (150 - 120),
  'new board card: pan to the community cards (0,' + L.panY + '), marks reset');
render(seats[12], false, 8);
ok(timers.length === 1 && L.pendSeat === '12', 'same seat first to act on the new street is followed again');
timers.length = 0; L.pendSeat = null;
L.drag = true; L.panX = 50; L.panY = 60; window._loupeBoardCards();
ok(L.panX === 50 && L.panY === 60, 'new board card during a drag: view left alone');
L.drag = false;

// ── Showdown (QML onShowdownActiveChanged) ─────────────────────────────────
render(seats[12], false, 8);
render(seats[12], true, 8);
ok(L.susp === true && L.panX === 0 && L.panY === 0 && L.pendSeat === null && L.followSeat === null
   && window._loupeK === 1, 'showdown: zoomed out, pan reset, planned pan dropped');
timers.length = 0;
window._loupeMyTurn(); window._loupeBoardCards();
ok(L.panX === 0 && L.panY === 0, 'suspended: my-turn / board hooks do nothing');
activePid = null; handStart(); render(null, false, 8);
ok(L.susp === false && window._loupeK === 2 && L.panX === 0 && L.panY === 0, 'next hand: zoom back on, centred');

// ── Re-anchor on ring redistribution (upstream a6d4f05) ────────────────────
activePid = 12; render(seats[12], false, 8); acted();
const px0 = L.panX, py0 = L.panY;
render(seats[12], false, 8);
ok(timers.length === 0 && L.panX === px0 && L.panY === py0, 'same ring count: no re-anchor');
seats = { 11: seat(11, 40, 150), 12: seat(12, 260, 100) };
window._seatCount = 5;
render(seats[12], false, 8);
ok(timers.length === 1 && timers[0].ms === 0, 'ring count changed: a deferred re-anchor is scheduled');
flush();
ok(L.panX === 2 * (200 - 260) && L.panY === 2 * (150 - 100), 're-anchored onto seat 12 at its new place (' + L.panX + ',' + L.panY + ')');
seats = { 11: seat(11, 40, 150) };
window._seatCount = 4; activePid = null;
render(null, false, 8); flush();
ok(L.panX === 0 && L.panY === 2 * (150 - 120) && L.followSeat === null, 'followed seat gone: back to the table centre (community cards)');
window._loupeMyTurn(); window._seatCount = 3; render(null, false, 8); flush();
ok(L.panX === 0 && L.panY === -150 && L.followSeat === 'self', 'self box zone: its excerpt stays valid, no re-anchor');
L.followSeat = null; L.panX = 123; L.panY = -45; L.drag = true;
window._seatCount = 2;
render(null, false, 8); flush();
ok(L.panX === 123 && L.panY === -45, 'no re-anchor during a manual drag');
L.drag = false;
window.toggleLoupe(); flush();
window._seatCount = 6;
render(null, false, 8);
ok(timers.length === 0 && L.ringN === 6 && L.panX === 0, 'loupe off: count tracked, nothing scheduled, pan reset');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All loupe tests passed.');
