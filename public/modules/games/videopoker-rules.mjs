// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Video Poker — the machines' rules (web.46): four variants, their pay tables
// (per credit, 1 to 5 credits a hand) and a hand classifier that knows wild
// cards (Deuces Wild: the 2s; Joker Poker: the joker, card 52).
//
//   jacks   Jacks or Better (9/6): a pair of jacks or better pays.
//   bonus   Bonus Poker (8/5): four of a kind pay more — aces 80, 2-4 40.
//   deuces  Deuces Wild: the four 2s are wild; three of a kind is the least
//           paying hand; four deuces 200, a wild royal flush 25.
//   joker   Joker Poker (Kings or Better): 53 cards, the joker is wild;
//           five of a kind 200, a wild royal flush 100.
// A natural royal flush (no wild card) pays 250 a credit, and 4,000 at the
// maximum bet (5 credits) — as on the machines, betting the max is the way.
// ═══════════════════════════════════════════════════════════════════

import { rankOf, suitOf, JOKER } from './poker-hand.mjs';
import { deckFor } from './deal.mjs';

export const MAX_BET = 5, ROYAL_MAX = 4000;

/** What a hand is made of, wild cards counted (the best they can do). */
export function facts(cards, isWild) {
  const nat = cards.filter((c) => !isWild(c)), n = cards.length - nat.length;
  const ranks = nat.map(rankOf), suits = nat.map(suitOf);
  /** @type {Record<number, number>} */
  const cnt = {};
  for (const r of ranks) cnt[r] = (cnt[r] || 0) + 1;
  const counts = Object.keys(cnt).map((r) => [+r, cnt[+r]]).sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const c1 = counts.length ? counts[0][1] : 0, c2 = counts.length > 1 ? counts[1][1] : 0;
  const flush = cards.length === 5 && suits.every((s) => s === suits[0]);
  const distinct = counts.every((x) => x[1] === 1);
  let straight = false;
  if (cards.length === 5 && distinct) {
    for (let lo = 1; lo <= 10 && !straight; lo++) straight = ranks.every((r) => { const v = lo === 1 && r === 14 ? 1 : r; return v >= lo && v <= lo + 4; });
  }
  const royal = flush && straight && ranks.every((r) => r >= 10);
  return {
    n, natural: n === 0,
    five: c1 + n >= 5,
    royal, sf: flush && straight,
    quads: c1 + n >= 4, quadRank: counts.length ? counts[0][0] : 14,
    full: c1 + n >= 3 && c1 + c2 + n >= 5,
    flush, straight,
    trips: c1 + n >= 3,
    twoPair: c1 >= 2 && c2 >= 2,
    pairRank: c1 >= 2 ? counts[0][0] : n >= 1 && ranks.length ? Math.max(...ranks) : n >= 1 ? 14 : 0,
  };
}

// The variants: name key, description key, wild cards, deck, pay table
// (best first: [id, label key, pays per credit, test]).
export const VARIANTS = [
  { id: 'jacks', key: 'vpVarJacks', desc: 'vpVarJacksD', wild: () => false, joker: false, rows: [
    ['royal', 'oddsRoyal', 250, (f) => f.royal],
    ['sf', 'oddsSF', 50, (f) => f.sf],
    ['quads', 'oddsQuads', 25, (f) => f.quads],
    ['full', 'oddsFull', 9, (f) => f.full],
    ['flush', 'oddsFlush', 6, (f) => f.flush],
    ['straight', 'oddsStraight', 4, (f) => f.straight],
    ['trips', 'oddsTrips', 3, (f) => f.trips],
    ['two', 'oddsTwoPair', 2, (f) => f.twoPair],
    ['jacks', 'vpJacks', 1, (f) => f.pairRank >= 11],
  ] },
  { id: 'bonus', key: 'vpVarBonus', desc: 'vpVarBonusD', wild: () => false, joker: false, rows: [
    ['royal', 'oddsRoyal', 250, (f) => f.royal],
    ['sf', 'oddsSF', 50, (f) => f.sf],
    ['aces', 'vpFourAces', 80, (f) => f.quads && f.quadRank === 14],
    ['low4', 'vpFour2to4', 40, (f) => f.quads && f.quadRank <= 4],
    ['quads', 'vpFour5toK', 25, (f) => f.quads],
    ['full', 'oddsFull', 8, (f) => f.full],
    ['flush', 'oddsFlush', 5, (f) => f.flush],
    ['straight', 'oddsStraight', 4, (f) => f.straight],
    ['trips', 'oddsTrips', 3, (f) => f.trips],
    ['two', 'oddsTwoPair', 2, (f) => f.twoPair],
    ['jacks', 'vpJacks', 1, (f) => f.pairRank >= 11],
  ] },
  { id: 'deuces', key: 'vpVarDeuces', desc: 'vpVarDeucesD', wild: (c) => c !== JOKER && rankOf(c) === 2, joker: false, rows: [
    ['royal', 'oddsRoyal', 250, (f) => f.royal && f.natural],
    ['deuces4', 'vpFourDeuces', 200, (f) => f.n === 4],
    ['wroyal', 'vpWildRoyal', 25, (f) => f.royal],
    ['five', 'vpFiveKind', 15, (f) => f.five],
    ['sf', 'oddsSF', 9, (f) => f.sf],
    ['quads', 'oddsQuads', 5, (f) => f.quads],
    ['full', 'oddsFull', 3, (f) => f.full],
    ['flush', 'oddsFlush', 2, (f) => f.flush],
    ['straight', 'oddsStraight', 2, (f) => f.straight],
    ['trips', 'oddsTrips', 1, (f) => f.trips],
  ] },
  { id: 'joker', key: 'vpVarJoker', desc: 'vpVarJokerD', wild: (c) => c === JOKER, joker: true, rows: [
    ['royal', 'oddsRoyal', 250, (f) => f.royal && f.natural],
    ['five', 'vpFiveKind', 200, (f) => f.five],
    ['wroyal', 'vpWildRoyal', 100, (f) => f.royal],
    ['sf', 'oddsSF', 50, (f) => f.sf],
    ['quads', 'oddsQuads', 20, (f) => f.quads],
    ['full', 'oddsFull', 7, (f) => f.full],
    ['flush', 'oddsFlush', 5, (f) => f.flush],
    ['straight', 'oddsStraight', 3, (f) => f.straight],
    ['trips', 'oddsTrips', 2, (f) => f.trips],
    ['two', 'oddsTwoPair', 1, (f) => f.twoPair],
    ['kings', 'vpKings', 1, (f) => f.pairRank >= 13],
  ] },
];
export const variantOf = (id) => VARIANTS.find((v) => v.id === id) || VARIANTS[0];

/** Row of `v`'s pay table that five cards pay (-1: nothing). */
export function rowOf(cards, v) {
  const f = facts(cards, v.wild);
  for (let i = 0; i < v.rows.length; i++) if (v.rows[i][3](f)) return i;
  return -1;
}
/** Credits row `i` pays for `bet` credits (a natural royal flush at the max bet: 4,000). */
export function payOf(v, i, bet) {
  if (i < 0) return 0;
  return v.rows[i][0] === 'royal' && bet >= MAX_BET ? ROYAL_MAX : v.rows[i][2] * bet;
}
/** The cards that make the hand (to light them): all five for a 5-card hand, else the matched ranks and the wilds. */
export function madeBy(cards, v, i) {
  if (i < 0) return [];
  const id = v.rows[i][0];
  if (!['quads', 'aces', 'low4', 'trips', 'two', 'jacks', 'kings'].includes(id)) return cards.slice();
  const nat = cards.filter((c) => !v.wild(c));
  /** @type {Record<number, number>} */
  const cnt = {};
  for (const c of nat) cnt[rankOf(c)] = (cnt[rankOf(c)] || 0) + 1;
  let keep = nat.filter((c) => cnt[rankOf(c)] >= 2);
  if (!keep.length && nat.length) { const top = Math.max(...nat.map(rankOf)); keep = nat.filter((c) => rankOf(c) === top).slice(0, 1); }
  return keep.concat(cards.filter((c) => v.wild(c)));
}
/** A deck for `v` (seeded or not): 52 cards, plus the joker for Joker Poker. */
export function deckOf(v, seed) {
  const d = deckFor(seed);
  if (v.joker) d.splice(d[51] % 53, 0, JOKER);
  return d;
}
