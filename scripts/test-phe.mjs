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

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All phe tests passed.');
