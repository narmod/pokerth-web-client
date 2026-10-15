#!/usr/bin/env node
// Deterministic test for public/modules/ui/spatial-nav.mjs — the geometry
// behind gamepad menu navigation (D-pad / left stick in ui/gamepad.mjs).
// Run: node scripts/test-spatial-nav.mjs
import { pickNext, pickFirst, score } from '../public/modules/ui/spatial-nav.mjs';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}
const R = (left, top, w, h) => ({ left, top, right: left + w, bottom: top + h });

// 3×3 grid of 40×20 buttons, 10 px apart.
const grid = [];
for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) grid.push(R(col * 50, row * 30, 40, 20));
const mid = grid[4];
ok(pickNext(mid, grid, 'up') === 1, 'grid: up from the centre');
ok(pickNext(mid, grid, 'down') === 7, 'grid: down from the centre');
ok(pickNext(mid, grid, 'left') === 3, 'grid: left from the centre');
ok(pickNext(mid, grid, 'right') === 5, 'grid: right from the centre');
ok(pickNext(grid[0], grid, 'up') === -1, 'grid: nothing above the top row');
ok(pickNext(grid[8], grid, 'right') === -1, 'grid: nothing right of the last column');
ok(pickNext(grid[0], grid, 'down') === 3, 'grid: down stays in the column');

// Settings list: full-width rows, each with a small checkbox on the left and,
// on some, a <select> on the right.
const rows = [R(10, 0, 16, 16), R(10, 30, 16, 16), R(200, 28, 80, 20), R(10, 60, 16, 16)];
ok(pickNext(rows[0], rows, 'down') === 1, 'list: down reaches the checkbox under, not the select');
ok(pickNext(rows[1], rows, 'right') === 2, 'list: right reaches the select on the same row');
ok(pickNext(rows[2], rows, 'down') === 3, 'list: down from a select goes to the next row');
ok(pickNext(rows[2], rows, 'up') === 0, 'list: up from a select goes to the previous row');

// A row containing a button: ↓ from the row must skip its own button.
const nested = [R(0, 0, 300, 40), R(260, 10, 30, 20), R(0, 45, 300, 40)];
ok(pickNext(nested[0], nested, 'down') === 2, 'nested: down from a row skips its inner button');
ok(pickNext(nested[0], nested, 'right') === 1, 'nested: right from a row reaches its inner button');
ok(pickNext(nested[1], nested, 'down') === 2, 'nested: down from the inner button reaches the next row');

// Overlap beats distance across the axis: the aligned target wins even when a
// misaligned one is a little closer along the axis.
const align = [R(100, 0, 40, 20), R(300, 30, 40, 20), R(100, 60, 40, 20)];
ok(pickNext(align[0], align, 'down') === 2, 'alignment: down prefers the box straight below');

// Same-line neighbours are not "up" or "down".
const line = [R(0, 0, 40, 20), R(50, 4, 40, 20)];
ok(pickNext(line[0], line, 'down') === -1, 'same line: a slightly lower neighbour is not below');

ok(score(mid, mid, 'down') === -1, 'score: an element is never its own neighbour');
ok(pickNext(mid, [], 'left') === -1, 'empty list');

// Reading order for the initial ring.
ok(pickFirst([R(100, 50, 10, 10), R(0, 52, 10, 10), R(300, 0, 10, 10)]) === 2, 'first: the top line wins');
ok(pickFirst([R(100, 3, 10, 10), R(20, 0, 10, 10)]) === 1, 'first: leftmost on the same line');
ok(pickFirst([]) === -1, 'first: empty list');

console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
