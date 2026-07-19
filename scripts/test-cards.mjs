#!/usr/bin/env node
// Deterministic tests for public/modules/game/cards.mjs (extraction #1 of
// docs/ESM_PLAN.md). Pure functions + one async _oddsCompute river case.
// Run: node scripts/test-cards.mjs
import {
  _evalFive, _cmpHand, evaluateBestHand, evaluatePreFlopHand,
  normalizeHoleCard, _oddsCompute,
} from '../public/modules/game/cards.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// Indices (0..12=d, 13..25=h, 26..38=s, 39..51=c; value = n%13, 0=deuce)
const Ad = 12, Ah = 25, As = 38, Ac = 51, Kd = 11, Kh = 24, Qh = 23, Jh = 22, Th = 21;
const _2d = 0, _2h = 13, _2s = 26, _7d = 5, _9d = 7, _9h = 20, _9s = 33, _9c = 46, _5c = 42;

// 1) _evalFive categories (r scale 0..9, royal = 9; t() shim returns raw keys)
ok(_evalFive([Ah, Kh, Qh, Jh, Th]).r === 9, '_evalFive royal -> r=9');
ok(_evalFive([_9d, _9h, _9s, _9c, _2d]).r === 7, '_evalFive quad nines -> r=7');
ok(_evalFive([Ad, _2h, _2s, _7d, _9c]).r === 1, '_evalFive one pair -> r=1');
ok(_evalFive([_2d, _7d, _9h, Jh, Ad]).r === 0, '_evalFive high card -> r=0');
ok(typeof _evalFive([Ah, Kh, Qh, Jh, Th]).label === 'string', '_evalFive returns a label');

// 2) _cmpHand ordering (>0 means a beats b)
const quadsA = _evalFive([Ad, Ah, As, Ac, Kd]);
const quadsN = _evalFive([_9d, _9h, _9s, _9c, Ad]);
ok(_cmpHand(quadsA, quadsN) > 0, '_cmpHand: quad aces beat quad nines');
ok(_cmpHand(quadsN, quadsA) < 0, '_cmpHand antisymmetric');
ok(_cmpHand(quadsA, _evalFive([Ah, As, Ad, Ac, Kh])) === 0, '_cmpHand: identical hands tie');

// 3) evaluateBestHand picks the best 5 of 7
const seven = evaluateBestHand([Ad, Kd], [_9d, _7d, _2d, _9h, _9s]);
ok(seven.r === 5, 'evaluateBestHand: flush (r=5) beats trips in 7 cards, got r=' + seven.r);

// 4) normalizeHoleCard: identity + strict validation
ok(normalizeHoleCard(0) === 0 && normalizeHoleCard(51) === 51, 'normalizeHoleCard identity on 0/51');
ok(normalizeHoleCard(52) === null && normalizeHoleCard(-1) === null, 'normalizeHoleCard rejects out of range');
ok(normalizeHoleCard(3.5) === null && normalizeHoleCard(null) === null, 'normalizeHoleCard rejects non-integers/null');

// 5) evaluatePreFlopHand tiers
ok(evaluatePreFlopHand(Ad, Ah).stars === 3, 'preflop AA -> 3 stars');
ok(evaluatePreFlopHand(Ad, Kd).stars === 3, 'preflop AKs -> 3 stars');
ok(evaluatePreFlopHand(_7d, _2h).stars === -1, 'preflop 72o -> weakest tier');
ok(evaluatePreFlopHand(null, Ah) === null, 'preflop null card -> null');

// 6) _oddsCompute river lock: full board known -> exact single category
await new Promise((resolve) => {
  _oddsCompute([Ad, Ah], [As, Ac, _9d, _2s, _7d], (r) => {
    ok(r && r.exact === true, '_oddsCompute river: exact=true');
    ok(r && r.pct[7] === 1, '_oddsCompute river: quads probability = 1');
    ok(r && r.pct.reduce((a, b) => a + b, 0) === 1, '_oddsCompute river: pct sums to 1');
    resolve();
  });
});

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All cards tests passed.');
