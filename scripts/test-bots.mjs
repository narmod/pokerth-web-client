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

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All bot tests passed.');
