#!/usr/bin/env node
// Deterministic sanity test for the vendored poker hand evaluator
// (public/vendor/phe.mjs). Fixed inputs, exact expected outputs — no RNG.
// Run: node scripts/test-phe.mjs   (exit 0 = pass, 1 = fail)
import { evaluateCards, handRank, rankDescription } from '../public/vendor/phe.mjs';

let fails = 0;
function eq(actual, expected, label) {
  if (actual !== expected) { console.error('FAIL ' + label + ': got ' + actual + ', expected ' + expected); fails++; }
  else console.log('ok   ' + label);
}

// 1) Absolute strengths (phe scale: 1 = royal flush .. 7462 = worst high card)
eq(evaluateCards(['Ah', 'Kh', 'Qh', 'Jh', 'Th']), 1, 'royal flush = 1');
eq(evaluateCards(['7c', '5d', '4h', '3s', '2c']), 7462, 'worst hand 75432 offsuit = 7462');

// 2) Category buckets via handRank (0=Straight Flush .. 8=High Card)
const cases = [
  [['Ah', 'Kh', 'Qh', 'Jh', 'Th'], 'Straight Flush'],
  [['9c', '9d', '9h', '9s', '2c'], 'Four of a Kind'],
  [['9c', '9d', '9h', '2s', '2c'], 'Full House'],
  [['Ah', 'Jh', '8h', '5h', '2h'], 'Flush'],
  [['9c', '8d', '7h', '6s', '5c'], 'Straight'],
  [['Ah', '2c', '3d', '4s', '5c'], 'Straight'],          // wheel A-5
  [['9c', '9d', '9h', 'Ks', '2c'], 'Three of a Kind'],
  [['9c', '9d', '5h', '5s', '2c'], 'Two Pair'],
  [['9c', '9d', 'Ah', 'Ks', '2c'], 'One Pair'],
  [['2c', '3d', '7h', '9s', 'Jc'], 'High Card'],
];
for (const [cards, want] of cases) {
  eq(rankDescription[handRank(evaluateCards(cards))], want, cards.join(' ') + ' -> ' + want);
}

// 3) 7-card evaluation picks the best 5 (hole + board, Hold'em style)
const sevenFlush = evaluateCards(['Ah', 'Kh', '2h', '7h', '9h', '2c', '2d']);
eq(rankDescription[handRank(sevenFlush)], 'Flush', '7 cards: flush beats trips');

// 4) Ordering: smaller = better, equal hands tie exactly
const aces = evaluateCards(['Ac', 'Ad', 'Ah', 'As', 'Kc']);
const kings = evaluateCards(['Kc', 'Kd', 'Kh', 'Ks', 'Ac']);
eq(aces < kings, true, 'quad aces < quad kings (smaller is better)');
eq(evaluateCards(['Ac', 'Kd', 'Qh', 'Js', '9c']),
   evaluateCards(['Ad', 'Kh', 'Qs', 'Jc', '9d']), 'same hand, different suits -> same strength');

// 5) PokerTH index mapping (mirrors _ensurePhe/_pheCat in pokerth.js):
//    index 0..51 -> 0..12=diamonds, 13..25=hearts, 26..38=spades, 39..51=clubs;
//    value = n % 13 (0=deuce .. 12=ace). Category scale 0..9 (9=Royal Flush),
//    same as _evalFive().r and QML GameTable.cardsChance.
import { cardCode, evaluateCardCodes } from '../public/vendor/phe.mjs';
const SUITS = ['d', 'h', 's', 'c'];
const RK = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const MAP = new Array(52);
for (let n = 0; n < 52; n++) MAP[n] = cardCode(RK[n % 13], SUITS[(n / 13) | 0]);  // signature (rank, suit)
function pthCat(indices) {
  const st = evaluateCardCodes(indices.map(n => MAP[n]));
  return st === 1 ? 9 : 8 - handRank(st);
}
eq(pthCat([25, 24, 23, 22, 21]), 9, 'PTH idx: royal flush hearts (25,24,23,22,21) -> 9');
eq(pthCat([3, 4, 5, 6, 7]), 8, 'PTH idx: straight flush 5-9 diamonds -> 8');
eq(pthCat([7, 20, 33, 46, 0]), 7, 'PTH idx: quad nines -> 7');
eq(pthCat([12, 13, 27, 41, 3]), 4, 'PTH idx: wheel A2345 offsuit -> 4');
eq(pthCat([0, 18, 33, 48, 2]), 0, 'PTH idx: 2d 7h 9s Jc 4d high card -> 0');
eq(pthCat([25, 24, 23, 22, 21, 0, 46]), 9, 'PTH idx: royal stays 9 with 7 cards');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All phe tests passed.');
