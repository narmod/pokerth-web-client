#!/usr/bin/env node
// Ace's Help — the Ranking rules (modules/guide/ranking-pick.mjs):
// which Ranking table the Ace points at (the fullest open one, the oldest on a
// tie, never a full / started / password / non-Ranking table, never for a
// guest), the point scale, and my finishing place read from the stacks.
// Run: node scripts/test-guide-pick.mjs
import path from 'path';
import { pathToFileURL } from 'url';

const R = await import(pathToFileURL(path.resolve('public/modules/guide/ranking-pick.mjs')).href);
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}
const G = (id, players, o = {}) => Object.assign({ id, type: 4, players, max: 10, mode: 1, started: false, priv: false }, o);
const id = (g) => (g ? g.id : null);

// ── choosing the table ──
ok(id(R.pickRankingTable([G(5, 3), G(6, 7), G(7, 2)])) === 6, 'the fullest open Ranking table');
ok(id(R.pickRankingTable([G(9, 7), G(4, 7), G(6, 7)])) === 4, 'tie → the oldest (lowest id)');
ok(id(R.pickRankingTable([G(1, 10), G(2, 4)])) === 2, 'a full table is skipped');
ok(id(R.pickRankingTable([G(1, 9, { mode: 2, started: true }), G(2, 4)])) === 2, 'a started table is skipped');
ok(id(R.pickRankingTable([G(1, 9, { started: true }), G(2, 4)])) === 2, 'started flag alone is enough');
ok(id(R.pickRankingTable([G(1, 9, { mode: 3 }), G(2, 4)])) === 2, 'a closed table is skipped');
ok(id(R.pickRankingTable([G(1, 9, { type: 1 }), G(2, 4, { type: 2 }), G(3, 1)])) === 3, 'only Ranking games (type 4)');
ok(id(R.pickRankingTable([G(1, 9, { priv: true }), G(2, 4)])) === 2, 'no password-protected table');
ok(id(R.pickRankingTable([G(1, 5, { max: 6 }), G(2, 6, { max: 6 })])) === 1, 'uses each table’s own maximum');
ok(id(R.pickRankingTable([G(1, 0), G(2, 0)])) === 1, 'empty tables: the oldest');
ok(R.pickRankingTable([]) === null, 'no table → null (C1 offers to create one)');
ok(R.pickRankingTable([G(1, 10), G(2, 9, { mode: 2 })]) === null, 'only full or running tables → null');
ok(R.pickRankingTable(null) === null, 'no list → null');
ok(R.pickRankingTable([G(1, 5)], { guest: true }) === null, 'a guest is never pointed at a Ranking table (D16)');
ok(R.pickRankingTable([null, undefined, G(3, 2)]).id === 3, 'holes in the list are ignored');

// ── points ──
ok([1, 2, 3, 4, 5, 6, 7].map(R.pointsFor).join() === '15,9,6,4,3,2,1', 'points 15/9/6/4/3/2/1');
ok([8, 9, 10, 0, -1, 11].every((p) => R.pointsFor(p) === 0), 'no points from 8th, nor for nonsense');
ok(R.POINTS.reduce((a, b) => a + b, 0) === 40, '40 points per table');

// ── my finishing place ──
const ME = 42;
let r = R.finishPlace({ 42: 500, 1: 3000, 2: 2000, 3: 0, 4: 0 }, { 42: 0, 1: 3500, 2: 2000, 3: 0, 4: 0 }, ME);
ok(r && r.place === 3, 'out with two players left → 3rd');
r = R.finishPlace({ 42: 500, 1: 3000, 2: 20 }, { 42: 0, 1: 3520, 2: 0 }, ME);
ok(r && r.place === null && r.tied, 'two players out in the same hand → unknown order, no guess');
r = R.finishPlace({ 42: 9000, 1: 1000 }, { 42: 10000, 1: 0 }, ME);
ok(r && r.place === 1, 'everyone else out → 1st');
r = R.finishPlace({ 42: 500, 1: 3000 }, { 42: 450, 1: 3050 }, ME);
ok(r === null, 'still playing → nothing decided');
r = R.finishPlace({ 42: 0, 1: 3000 }, { 42: 0, 1: 3000 }, ME);
ok(r === null, 'already out before → not counted twice');
r = R.finishPlace({ 42: 500, 1: null, 2: 100 }, { 42: 0, 1: null, 2: 600 }, ME);
ok(r && r.place === 3, 'an unknown stack counts as still in');
r = R.finishPlace({ 42: 900, 1: null }, { 42: 1000, 1: null }, ME);
ok(r === null, 'unknown stacks never make me the winner');
ok(R.finishPlace(null, {}, ME) === null && R.finishPlace({}, {}, null) === null, 'missing data → null');
const ten = {}; const ten2 = {};
for (let p = 1; p <= 9; p++) { ten[p] = 1000; ten2[p] = 1000; }
ten[42] = 100; ten2[42] = 0;
ok(R.finishPlace(ten, ten2, ME).place === 10, 'first out of ten → 10th (0 points)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
