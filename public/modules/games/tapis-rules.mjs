// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Tapis! — the rules, pure and DOM-free (scripts/test-games.mjs). The game
// itself is tapis.mjs; design note claude/CONCEPTION_TAPIS.md (narmod
// 2026-11-15, in the spirit of Megatouch's Monster Madness).
//
// The board: columns of chips standing on the felt, a character on each one
// and a hole under each. grid[c] is column c, bottom first; a chip is
// { k, off }: k its colour (CHIPS), off how many rows above its place it is
// still falling from (0 at rest, < 0 rising from below) — the game animates
// it back to 0.
//   Group     2 or more chips of one colour touching (left, right, above,
//             below — rows are counted from the felt) leave together; a lone
//             chip cannot.
//   Hand      a group is named after a poker hand by its size (handOf) and
//             pays the sum of its chips' values × that hand's multiplier.
//   Recave    no group left: the dealer pushes a row in from the felt, made
//             of pairs (recaveRow) — the player is never stuck.
// ═══════════════════════════════════════════════════════════════════

import { MULT } from './poker-hand.mjs';

/** The chips: colour (side, dark side, marks), suit printed on them, value. */
export const CHIPS = [
  { id: 'red', top: '#d23a30', side: '#8e1c15', mark: '#f7f1e3', suit: '♥', v: 5 },
  { id: 'blue', top: '#2f6bd0', side: '#173c80', mark: '#f7f1e3', suit: '♦', v: 10 },
  { id: 'green', top: '#27a058', side: '#115a2e', mark: '#f7f1e3', suit: '♣', v: 25 },
  { id: 'black', top: '#33363c', side: '#121316', mark: '#e3c06a', suit: '♠', v: 100 },
  { id: 'purple', top: '#9a5ae0', side: '#542a8f', mark: '#f7f1e3', suit: '★', v: 500 },
];

/** Colours on the board at blind level `lv`: 3, a 4th from level 5, a 5th from 13. */
export const colorsAt = (lv) => (lv >= 13 ? 5 : lv >= 5 ? 4 : 3);
/** Seconds a chip is worth on the clock: 1.1 at first, down to 0.8. */
export const perChipAt = (lv) => Math.max(0.8, 1.1 - 0.02 * (Math.max(1, lv) - 1));
/** The round's clock for `total` chips at level `lv` (45 s at least). */
export const timeFor = (total, lv) => Math.max(45, Math.round(total * perChipAt(lv)));
/** A character in its hole pays this; the round's leftover seconds pay TIME_PAY each. */
export const inPay = (lv) => 250 * Math.max(1, lv);
export const TIME_PAY = 10;
/** A round left without a single chip (the « Table rase »). */
export const cleanPay = (lv) => 1000 * Math.max(1, lv);
/** Seconds a recave costs. */
export const RECAVE_S = 5;
/** The blinds shown for a level (as in the other games: 10/20, 20/40…). */
export function blindsAt(lv) {
  const b = [10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000];
  const s = b[Math.min(b.length - 1, Math.max(1, lv) - 1)] * (lv > b.length ? lv - b.length + 1 : 1);
  return s + '/' + s * 2;
}

/**
 * The poker hand a group of n chips is named after (a category of
 * poker-hand.mjs: 1 pair … 9 royal flush), -1 for a lone chip.
 */
export function handOf(n) {
  if (n < 2) return -1;
  if (n >= 10) return 9;
  return [1, 3, 4, 5, 6, 7, 8, 8][n - 2];
}
/** What a group pays: the sum of its values × its hand's multiplier. */
export function groupPay(grid, cells) {
  let sum = 0;
  for (const [c, r] of cells) sum += CHIPS[grid[c][r].k].v;
  const cat = handOf(cells.length);
  return { cat, pts: cat < 0 ? 0 : sum * MULT[cat] };
}

/** The chips of one colour touching the chip at column c, row r (itself included). */
export function groupAt(grid, c, r) {
  if (!grid[c] || !grid[c][r]) return [];
  const k = grid[c][r].k, seen = new Set([c + ',' + r]), out = [[c, r]], todo = [[c, r]];
  while (todo.length) {
    const [x, y] = /** @type {number[]} */ (todo.pop());
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, key = nx + ',' + ny;
      if (seen.has(key) || !grid[nx] || !grid[nx][ny] || grid[nx][ny].k !== k) continue;
      seen.add(key); out.push([nx, ny]); todo.push([nx, ny]);
    }
  }
  return out;
}
/** Is there a group of 2 or more anywhere? */
export function anyMove(grid) {
  for (let c = 0; c < grid.length; c++) {
    const col = grid[c];
    for (let r = 0; r < col.length; r++) {
      if (col[r + 1] && col[r + 1].k === col[r].k) return true;
      if (grid[c + 1] && grid[c + 1][r] && grid[c + 1][r].k === col[r].k) return true;
    }
  }
  return false;
}
/** Takes `cells` out; the chips above fall (their off grows by the rows they drop). */
export function removeCells(grid, cells) {
  const by = new Map();
  for (const [c, r] of cells) { if (!by.has(c)) by.set(c, new Set()); by.get(c).add(r); }
  for (const [c, rows] of by) {
    const keep = [];
    grid[c].forEach((b, i) => { if (!rows.has(i)) { b.off += i - keep.length; keep.push(b); } });
    grid[c] = keep;
  }
}
/** The chips a Joker takes: every chip of colour k. */
export function colorCells(grid, k) {
  const out = [];
  grid.forEach((col, c) => col.forEach((b, r) => { if (b.k === k) out.push([c, r]); }));
  return out;
}
/** The chips a Dealer button takes: row r across the board and column c. */
export function crossCells(grid, c, r) {
  const out = [];
  grid.forEach((col, x) => { if (col[r]) out.push([x, r]); });
  (grid[c] || []).forEach((_, y) => { if (y !== r) out.push([c, y]); });
  return out;
}
/** Every colour dealt again (the Shuffle), the columns keeping their heights. */
export function shuffleGrid(grid, rnd = Math.random) {
  const ks = [];
  grid.forEach((col) => col.forEach((b) => ks.push(b.k)));
  for (let j = ks.length - 1; j > 0; j--) { const x = Math.floor(rnd() * (j + 1)); const t = ks[j]; ks[j] = ks[x]; ks[x] = t; }
  let i = 0;
  grid.forEach((col) => col.forEach((b) => { b.k = ks[i++]; }));
}
/**
 * The dealer's recave: a chip pushed in under every column still standing,
 * the chips above rising one row. Neighbouring columns get the same colour
 * two by two, so there is a pair at once; a column left alone gets the colour
 * of the chip above it. Returns the number of chips added.
 */
export function recaveRow(grid, nColors, rnd = Math.random) {
  const live = [];
  grid.forEach((col, c) => { if (col.length) live.push(c); });
  const ks = new Map();
  for (let i = 0; i < live.length;) {
    if (live[i + 1] === live[i] + 1) { const k = Math.floor(rnd() * nColors); ks.set(live[i], k); ks.set(live[i + 1], k); i += 2; }
    else { ks.set(live[i], grid[live[i]][0].k); i += 1; }
  }
  for (const c of live) {
    grid[c].forEach((b) => { b.off -= 1; });
    grid[c].unshift({ k: ks.get(c), off: -1 });
  }
  return live.length;
}
/**
 * A new round: `cols` columns, heights growing with the level (up to
 * maxRows), colours dealt with a little clustering so groups exist.
 */
export function dealRound(lv, cols, maxRows, rnd = Math.random) {
  const n = colorsAt(lv);
  const lo = Math.max(2, Math.min(maxRows - 1, Math.round(maxRows * (0.4 + 0.035 * lv))));
  const hi = Math.max(lo, Math.min(maxRows, Math.round(maxRows * (0.66 + 0.04 * lv))));
  const grid = [];
  for (let c = 0; c < cols; c++) {
    const h = lo + Math.floor(rnd() * (hi - lo + 1)), col = [];
    for (let r = 0; r < h; r++) {
      let k = Math.floor(rnd() * n);
      const x = rnd();
      if (r > 0 && x < 0.26) k = col[r - 1].k;
      else if (c > 0 && grid[c - 1][r] && x < 0.46) k = grid[c - 1][r].k;
      col.push({ k, off: 0 });
    }
    grid.push(col);
  }
  if (!anyMove(grid)) recaveRow(grid, n, rnd);
  return grid;
}
/** Chips left on the board. */
export const chipsLeft = (grid) => grid.reduce((a, col) => a + col.length, 0);
/** The power a big group wins (n ≥ 6), or '' : a Joker from 9, else a Dealer or a Shuffle. */
export function powerFor(n, rnd = Math.random) {
  if (n >= 9) return 'joker';
  if (n >= 6) return rnd() < 0.5 ? 'dealer' : 'shuffle';
  return '';
}
