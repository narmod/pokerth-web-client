// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Opening ranges of « Open or Fold? » (preflop.mjs) — pure, DOM-free
// (scripts/test-games.mjs). A 10-player table, everyone folded to you:
// the hands to open with a raise from each position, a classic, prudent
// full-ring chart (no limping, the big blind never opens first).
//
// Hand classes: 'AA', 'AKs' (suited), 'AKo' (offsuit). Range notation:
// '77+' (77 and every higher pair), 'ATs+' (AT, AJ, AQ, AK suited: the
// kicker climbs up to the card under the first), 'KQo', 'T9s'.
// The 13 × 13 grid: row i / column j over RANKS (A first); i == j a pair,
// i < j suited (above the diagonal), i > j offsuit.
// ═══════════════════════════════════════════════════════════════════

export const RANKS = 'AKQJT98765432';
export const POSITIONS = ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'];
export const RANGES = {
  'UTG': '77+ AJs+ KQs AQo+',
  'UTG+1': '66+ ATs+ KJs+ AQo+',
  'MP': '55+ A9s+ KTs+ QJs JTs AJo+ KQo',
  'LJ': '44+ A8s+ KTs+ QTs+ JTs T9s ATo+ KQo',
  'HJ': '33+ A5s+ K9s+ Q9s+ J9s+ T9s 98s ATo+ KJo+',
  'CO': '22+ A2s+ K8s+ Q9s+ J9s+ T8s+ 98s 87s 76s A9o+ KTo+ QTo+ JTo',
  'BTN': '22+ A2s+ K5s+ Q7s+ J7s+ T7s+ 96s+ 86s+ 75s+ 65s 54s A5o+ K9o+ Q9o+ J9o+ T9o',
  'SB': '22+ A2s+ K7s+ Q8s+ J8s+ T8s+ 97s+ 87s 76s 65s A7o+ KTo+ QTo+ JTo',
};

const ri = (c) => RANKS.indexOf(c);

/** The classes a range string covers (a Set of 'AA', 'AKs', 'AKo'…). */
export function parseRange(str) {
  const out = new Set();
  for (const tok of String(str).trim().split(/\s+/)) {
    if (!tok) continue;
    const plus = tok.endsWith('+');
    const t = plus ? tok.slice(0, -1) : tok;
    const a = t[0], b = t[1], kind = t[2] || '';
    if (a === b) {                                   // pairs
      for (let i = plus ? 0 : ri(a); i <= ri(a); i++) out.add(RANKS[i] + RANKS[i]);
      continue;
    }
    // Kicker from b up to the card under a.
    for (let j = ri(b); j > ri(a); j--) { out.add(a + RANKS[j] + kind); if (!plus) break; }
  }
  return out;
}
const SETS = {};
for (const p of POSITIONS) SETS[p] = parseRange(RANGES[p]);

/** The class of two cards (PokerTH numbers 0..51): 'AA', 'AKs', 'AKo'. */
export function classOf(c1, c2) {
  const R = '23456789TJQKA';
  const r1 = c1 % 13, r2 = c2 % 13;
  const hi = Math.max(r1, r2), lo = Math.min(r1, r2);
  if (hi === lo) return R[hi] + R[lo];
  return R[hi] + R[lo] + (Math.floor(c1 / 13) === Math.floor(c2 / 13) ? 's' : 'o');
}
/** Open from position `pos` with class `cls`? */
export function opens(pos, cls) { return SETS[pos].has(cls); }
/** The class in cell (i, j) of the grid. */
export function cellClass(i, j) {
  if (i === j) return RANKS[i] + RANKS[i];
  return i < j ? RANKS[i] + RANKS[j] + 's' : RANKS[j] + RANKS[i] + 'o';
}
/** Grid cell (i, j) of a class. */
export function cellOf(cls) {
  const a = ri(cls[0]), b = ri(cls[1]);
  if (a === b) return [a, a];
  return cls[2] === 's' ? [a, b] : [b, a];
}
/** Classes on the edge of a position's range (one step from a cell of the other side): the close calls. */
export function edgeClasses(pos) {
  const out = [];
  for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) {
    const me = opens(pos, cellClass(i, j));
    const nb = [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < 13 && y < 13);
    if (nb.some(([x, y]) => opens(pos, cellClass(x, y)) !== me)) out.push(cellClass(i, j));
  }
  return out;
}
/** Two cards (PokerTH numbers) of class `cls`, suits chosen by rnd. */
export function cardsOf(cls, rnd = Math.random) {
  const R = '23456789TJQKA';
  const r1 = R.indexOf(cls[0]), r2 = R.indexOf(cls[1]);
  const s1 = Math.floor(rnd() * 4);
  let s2 = s1;
  if (cls.length === 2 || cls[2] === 'o') { s2 = (s1 + 1 + Math.floor(rnd() * 3)) % 4; }
  return [s1 * 13 + r1, s2 * 13 + r2];
}
