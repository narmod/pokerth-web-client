#!/usr/bin/env node
// puck-dodge.mjs - D / SB / BB pucks keep off the neighbouring boxes.
// Fake DOM: each seat has a plate and a puck whose rectangle depends on the
// seat's current betside-* class, like the real CSS.
// Run: node scripts/test-puck-dodge.mjs
import { dodgePucks } from '../public/modules/game/puck-dodge.mjs';

let fails = 0;
function ok(cond, label) { console.log((cond ? '  \u2713 ' : '  \u2717 ') + label); if (!cond) fails++; }

const R = (l, t, w, h) => ({ left: l, top: t, right: l + w, bottom: t + h, width: w, height: h });
function classList(initial) {
  const set = new Set(initial);
  return { contains: (c) => set.has(c), toggle: (c, on) => { if (on) set.add(c); else set.delete(c); }, list: set };
}
const PUCK = 40;
function mkSeat(name, plate, side, hasPuck = true, extra = []) {
  const seat = { name, dataset: {}, classList: classList(['seat', 'betside-' + side, ...extra]) };
  const plateEl = { getBoundingClientRect: () => plate };
  const puckEl = { classList: classList(['seat-pucks']), closest: () => null, getBoundingClientRect: () => {
    const cur = ['l', 'r', 't', 'b', 'split'].find((s) => seat.classList.contains('betside-' + s));
    if (cur === 'r') return R(plate.right + 8, plate.top + plate.height / 2 - PUCK / 2, PUCK, PUCK);
    if (cur === 'l' || cur === 'split') return R(plate.left - 8 - PUCK, plate.top + plate.height / 2 - PUCK / 2, PUCK, PUCK);
    if (cur === 't') return R(plate.right - 6 - PUCK, plate.top - 1 - PUCK, PUCK, PUCK);
    return R(plate.right - 6 - PUCK, plate.bottom + 1, PUCK, PUCK);   // b
  } };
  seat.querySelector = (sel) => (sel === '.seat-plate' ? plateEl : null);
  seat.querySelectorAll = () => (hasPuck ? [puckEl] : []);
  seat.getBoundingClientRect = () => plate;
  seat.side = () => ['l', 'r', 't', 'b', 'split'].find((s) => seat.classList.contains('betside-' + s));
  return seat;
}
function table(seats, slots = []) {
  globalThis.document = { querySelectorAll: () => slots.map((r) => ({ getBoundingClientRect: () => r })) };
  const seatsEl = { querySelectorAll: (sel) => (sel.indexOf(':not(.seat-ghost)') >= 0 ? seats.filter((s) => !s.classList.contains('seat-ghost')) : seats) };
  const zoneEl = { getBoundingClientRect: () => R(0, 0, 412, 640) };
  return () => dodgePucks(seatsEl, zoneEl);
}

// 1) Room on the default side: nothing moves.
{
  const a = mkSeat('TL', R(4, 200, 120, 60), 'r'), b = mkSeat('TR', R(288, 200, 120, 60), 'l');
  const moved = table([a, b])();
  ok(moved === 0 && a.side() === 'r' && b.side() === 'l', 'room between the boxes: pucks stay on the QML side');
}
// 2) TL and TR almost touch (3 opponents in portrait): both pucks leave the gap.
{
  const tl = mkSeat('TL', R(0, 240, 188, 90), 'r'), tc = mkSeat('TC', R(116, 90, 180, 120), 'b'), tr = mkSeat('TR', R(228, 240, 180, 90), 'l');
  const run = table([tl, tc, tr]);
  const moved = run();
  ok(tl.side() === 'b' && tr.side() === 'b', 'narrow gap: TL and TR pucks go below their own box');
  ok(tc.side() === 'split', 'top-centre puck would sit on the TR corner: it goes beside the box');
  ok(moved === 3, 'three seats moved');
  ok(tl.dataset.bs0 === 'r' && tc.dataset.bs0 === 'b' && tr.dataset.bs0 === 'l', 'the side chosen by renderSeats is remembered');
  run();
  ok(tl.side() === 'b' && tc.side() === 'split' && tr.side() === 'b', 'idempotent: a second pass gives the same result');
}
// 3) The collision goes away (a player left, boxes shrank): back to the default side.
{
  let plate = R(0, 240, 188, 90);
  const tl = mkSeat('TL', plate, 'r'), tr = mkSeat('TR', R(228, 240, 180, 90), 'l', false);
  const run = table([tl, tr]);
  run(); ok(tl.side() === 'b', 'collision: moved');
  const tl2 = mkSeat('TL', R(0, 240, 120, 60), 'r'); tl2.dataset.bs0 = 'r'; tl2.classList.toggle('betside-r', false); tl2.classList.toggle('betside-b', true);
  table([tl2, mkSeat('TR', R(290, 240, 118, 60), 'l', false)])();
  ok(tl2.side() === 'r', 'collision gone: the puck returns to the QML side');
}
// 4) Never over a community card, never out of the zone; no free side -> default kept.
{
  const tl = mkSeat('TL', R(0, 240, 188, 90), 'r'), tr = mkSeat('TR', R(228, 240, 180, 90), 'l', false);
  table([tl, tr], [R(130, 330, 60, 80)])();          // a card right under TL's corner
  ok(tl.side() === 't', 'below is taken by a community card: above');
  const top = mkSeat('TL', R(0, 10, 188, 90), 'r'), tr2 = mkSeat('TR', R(228, 10, 180, 90), 'l', false);
  table([top, tr2], [R(130, 100, 60, 80)])();
  ok(top.side() === 'r', 'no free side at all: the default side is kept');
}
// 5) Self box and ghost seats are left alone.
{
  const me = mkSeat('me', R(100, 500, 200, 100), 'b', true, ['me']), ghost = mkSeat('ghost', R(0, 240, 188, 90), 'r', true, ['seat-ghost']);
  const tr = mkSeat('TR', R(228, 240, 180, 90), 'l');
  table([me, ghost, tr])();
  ok(me.side() === 'b' && ghost.side() === 'r' && !me.dataset.bs0 && !ghost.dataset.bs0, 'self box and ghost seats are never touched');
}
console.log(fails ? `\n${fails} FAILED` : '\nAll puck-dodge tests passed.');
process.exit(fails ? 1 : 0);
