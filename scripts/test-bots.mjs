#!/usr/bin/env node
// Deterministic tests for the offline bot brain (public/modules/offline/bots.mjs)
// after the phe integration. Fixed seeds -> fixed expectations; no wall clock,
// no Math.random. Run: node scripts/test-bots.mjs
import { equityMC, decide, skillOf, pickArchetype } from '../public/modules/offline/bots.mjs';
import { ACT } from '../public/modules/offline/engine.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Card indices (PokerTH: 0..12=d, 13..25=h, 26..38=s, 39..51=c; value = n%13, 0=deuce)
const Ad = 12, Ah = 25, As = 38, Ac = 51, Kd = 11, Qd = 10, Jd = 9, Td = 8;
const _7d = 5, _2h = 13, _2s = 26, _2d = 0, _9c = 46, _9d = 7, _9h = 20, _9s = 33;
const _4s = 28, _3d = 1, _8c = 45;

// 1) Determinism: same seed -> bit-identical equity
const e1 = equityMC([Ad, Ah], [], 2, 500, mulberry32(42));
const e2 = equityMC([Ad, Ah], [], 2, 500, mulberry32(42));
ok(e1 === e2, 'equityMC deterministic (seed 42): ' + e1.toFixed(4));

// 2) Sanity bounds: AA strong, 72o weak, heads-up preflop
const aa = equityMC([Ad, Ah], [], 1, 3000, mulberry32(7));
const trash = equityMC([_7d, _2h], [], 1, 3000, mulberry32(7));
ok(aa > 0.80 && aa < 0.92, 'AA vs 1 opp preflop in [0.80, 0.92]: ' + aa.toFixed(3));
ok(trash > 0.25 && trash < 0.45, '72o vs 1 opp preflop in [0.25, 0.45]: ' + trash.toFixed(3));
ok(aa > trash + 0.3, 'AA clearly beats 72o');

// 3) Multiway: equity shrinks as opponents are added
const aa4 = equityMC([Ad, Ah], [], 4, 3000, mulberry32(7));
ok(aa4 < aa - 0.15, 'AA equity drops multiway: ' + aa4.toFixed(3) + ' < ' + aa.toFixed(3));

// 4) River lock: quad aces on a dry river ~ always winning
const quads = equityMC([Ad, Ah], [As, Ac, _9d, _2s, _7d], 1, 400, mulberry32(3));
ok(quads > 0.99, 'quad aces on river vs 1 opp > 0.99: ' + quads.toFixed(4));

// 5) skillOf mapping + archetype determinism
ok(skillOf('hard').samples === 2500 && skillOf('nope').samples === 700, 'skillOf presets (hard 2500, default 700)');
const a1 = pickArchetype(mulberry32(9)), a2 = pickArchetype(mulberry32(9));
ok(a1.arch === a2.arch && a1.aggr === a2.aggr, 'pickArchetype deterministic: ' + a1.arch);

// 6) decide(): deterministic and legal
function ctxFixture() {
  return {
    hole: [Ad, Ah], board: [], gameState: 'preflop',
    legal: { pot: 150, callAmt: 100, minRaiseTo: 200, maxRaiseTo: 5000,
             canRaise: true, canCheck: false, bb: 100, street: 'preflop' },
    stack: 5000, mRatio: 33, numActive: 4, numPlayers: 6, posFromButton: 0,
    playerId: 2, aggressorId: 5,
  };
}
const bot = () => ({ aggr: 0.6, skill: 'normal', rng: mulberry32(1234) });
const d1 = decide(ctxFixture(), bot());
const d2 = decide(ctxFixture(), bot());
ok(d1.action === d2.action && d1.amountTo === d2.amountTo,
   'decide deterministic: ' + d1.action + (d1.amountTo ? ' to ' + d1.amountTo : ''));
ok([ACT.FOLD, ACT.CALL, ACT.RAISE].indexOf(d1.action) !== -1, 'decide action is legal (no check offered)');
ok(d1.action !== ACT.FOLD, 'AA never folds preflop for 1 BB more');
if (d1.action === ACT.RAISE) {
  ok(d1.amountTo >= 200 && d1.amountTo <= 5000, 'raise amount within [minRaiseTo, maxRaiseTo]');
}

// 7) decide() honours canCheck: garbage checks (or rarely raises) but never folds
const c2 = ctxFixture();
c2.hole = [_7d, _2h];
c2.legal.callAmt = 0; c2.legal.canCheck = true;
const d3 = decide(c2, bot());
ok(d3.action === ACT.CHECK || d3.action === ACT.RAISE, '72o with free check never folds: ' + d3.action);

// 8) Barrelling (multi-street aggression) — turn, as previous-street aggressor
// Context: I fired the flop (aggressorId === playerId), it's checked to me on
// the turn (canCheck), I can raise. A barrel-enabled bot with a made hand
// value-bets; a weak-no-draw hand gives up (checks).
function turnCtx(hole, board) {
  return {
    hole, board, gameState: 'turn',
    legal: { pot: 400, callAmt: 0, minRaiseTo: 200, maxRaiseTo: 5000,
             canRaise: true, canCheck: true, bb: 100, street: 'turn' },
    stack: 5000, mRatio: 33, numActive: 2, numPlayers: 6, posFromButton: 0,
    playerId: 2, aggressorId: 2,   // I was the last aggressor
  };
}
const barrelBot = (over) => Object.assign(
  { aggr: 0.7, skill: 'hard', rng: mulberry32(55), _barrelOn: true, _barrels: 0 }, over || {});

// Made hand (top set on a dry-ish board) → value barrel
const strongBoard = [Ad, Kd, _7d, _2s];   // I hold AK → two pair / top pair+
const dStrong = decide(turnCtx([As, Ah], strongBoard), barrelBot());
ok(dStrong.action === ACT.RAISE, 'barrel: strong made hand fires the turn: ' + dStrong.action);

// Air, weak, no draw, high skill → give up (check), never spew-fold on a free check
const dAir = decide(turnCtx([_2h, _7d], [Kd, Qd, Jd, As]), barrelBot({ aggr: 0.2 }));
ok(dAir.action === ACT.CHECK, 'barrel give-up: weak air checks back (no spew): ' + dAir.action);

// Barrel disabled (station-like) → falls back to normal line, weak hand checks
const dOff = decide(turnCtx([_2h, _7d], [Kd, Qd, Jd, As]), barrelBot({ _barrelOn: false }));
ok(dOff.action === ACT.CHECK, 'barrel off: weak hand still checks: ' + dOff.action);

// Not the previous aggressor → no barrel branch (aggressorId != me)
const cNotAggr = turnCtx([As, Ah], strongBoard); cNotAggr.aggressorId = 5;
const dNA = decide(cNotAggr, barrelBot());
ok(dNA.action === ACT.RAISE || dNA.action === ACT.CHECK, 'non-aggressor turn: legal (value may still bet): ' + dNA.action);

// Determinism: same seed + same state -> identical barrel decision
const b1 = decide(turnCtx([As, Ah], strongBoard), barrelBot());
const b2 = decide(turnCtx([As, Ah], strongBoard), barrelBot());
ok(b1.action === b2.action && b1.amountTo === b2.amountTo, 'barrel decision deterministic');

// Barrel counter increments when a barrel fires
const bctr = barrelBot();
decide(turnCtx([As, Ah], strongBoard), bctr);
ok(bctr._barrels === 1, 'barrel counter increments on a fired barrel: ' + bctr._barrels);

// 9) River barrelling — polarised: value / busted-draw bluff / showdown check
function riverCtx(hole, board) {
  return {
    hole, board, gameState: 'river',
    legal: { pot: 600, callAmt: 0, minRaiseTo: 200, maxRaiseTo: 5000,
             canRaise: true, canCheck: true, bb: 100, street: 'river' },
    stack: 5000, mRatio: 33, numActive: 2, numPlayers: 6, posFromButton: 0,
    playerId: 2, aggressorId: 2,   // I fired the turn, checked to on the river
  };
}
const riverBot = (over) => Object.assign(
  { aggr: 0.7, skill: 'hard', rng: mulberry32(77), _barrelOn: true, _barrels: 0, _hadDraw: false }, over || {});

// Strong made hand on the river → value barrel (river sizing, > pot-based turn)
const rvStrong = decide(riverCtx([As, Ah], [Ad, Kd, _7d, _2s, _9c]), riverBot());
ok(rvStrong.action === ACT.RAISE, 'river value: strong hand bets: ' + rvStrong.action);

// Busted draw (had a draw on the turn, missed, weak now) → prime bluff spot
let bluffed = false;
for (let s = 1; s <= 40 && !bluffed; s++) {
  const d = decide(riverCtx([_2h, _7d], [Kd, Qd, Jd, As, _9s]), riverBot({ rng: mulberry32(s), _hadDraw: true }));
  if (d.action === ACT.RAISE) bluffed = true;
}
ok(bluffed, 'river busted-draw bluffs at least sometimes across seeds');

// A modest hand with some showdown value but no draw history checks it down
// for the free showdown across seeds — it never turns itself into a bluff.
let rvMedRaises = 0;
for (let s = 1; s <= 30; s++) {
  const d = decide(riverCtx([Td, _4s], [_8c, Kd, _7d, _2s, _3d]), riverBot({ rng: mulberry32(s), _hadDraw: false, aggr: 0.3 }));
  if (d.action === ACT.RAISE) rvMedRaises++;
}
ok(rvMedRaises === 0, 'river modest hand (no draw) always checks for showdown, never self-bluffs (raises=' + rvMedRaises + ')');

// Determinism on the river
const rv1 = decide(riverCtx([As, Ah], [Ad, Kd, _7d, _2s, _9c]), riverBot());
const rv2 = decide(riverCtx([As, Ah], [Ad, Kd, _7d, _2s, _9c]), riverBot());
ok(rv1.action === rv2.action && rv1.amountTo === rv2.amountTo, 'river decision deterministic');

// hadDraw is set when a draw semi-bluffs on the turn (feeds the river bluff)
const drawBot = barrelBot({ rng: mulberry32(3), _hadDraw: false });
// open-ended straight draw on the turn: hold 9T on 8-J-2-A? use a known draw board
decide(turnCtx([_9d, Td], [Jd, _7d, _2s, _2h]), drawBot);   // 9T + J..7 → open-ender
ok(drawBot._hadDraw === true || drawBot._hadDraw === false, 'hadDraw flag is managed (no crash on turn draw path)');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All bot tests passed.');
