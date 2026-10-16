// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Poker Solitaire rules — pure, DOM-free (scripts/test-games.mjs runs them
// under Node): the scale, the ten lines of the grid, the seeded deal of the
// daily challenge and the score of a full grid. The game is solitaire.mjs.
// ═══════════════════════════════════════════════════════════════════

import { evalCards } from './poker-hand.mjs';

export const N = 5;
// Points per category, high card → royal flush (American Poker Squares).
export const SCORE = [0, 2, 5, 10, 15, 20, 25, 50, 75, 100];
/** Day key of the daily challenge (UTC, so the same deal everywhere). */
export function dayKey(d = new Date()) { return d.toISOString().slice(0, 10); }
/** Deterministic 25-card deal for a seed string (mulberry32 over a string hash). */
export function dealFor(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const deck = [];
  for (let n = 0; n < 52; n++) deck.push(n);
  for (let j = deck.length - 1; j > 0; j--) { const x = Math.floor(rnd() * (j + 1)); const tmp = deck[j]; deck[j] = deck[x]; deck[x] = tmp; }
  return deck.slice(0, 25);
}
/** Score of a full grid (25 card numbers, row by row). */
export function scoreGrid(grid) {
  let total = 0;
  for (const line of lines()) total += SCORE[evalCards(line.map((i) => grid[i])).cat];
  return total;
}
// The ten lines as lists of cell indices: rows 0-4, then columns 0-4.
function lines() {
  const out = [];
  for (let r = 0; r < N; r++) out.push([0, 1, 2, 3, 4].map((c) => r * N + c));
  for (let c = 0; c < N; c++) out.push([0, 1, 2, 3, 4].map((r) => r * N + c));
  return out;
}
export const LINES = lines();

