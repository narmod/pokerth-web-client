// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Poker Drop rules — pure, DOM-free (scripts/test-games.mjs runs them under
// Node): the upright 7 × 6 grid, its lines of five, the score of a drop and
// the Ace's choice of move. The game is pokerdrop.mjs.
//
// Cells are numbered row × COLS + col with row 0 at the BOTTOM: a card
// dropped in a column lands on the lowest free row. A line is any five
// cells in a row across, up or along a diagonal (WINDOWS). The cards belong
// to no one: whoever drops the card that fills a line scores its poker hand
// (SCORE by category, poker-hand.mjs). One drop can fill lines in several
// directions; in each direction only its best hand counts.
// Sudden death: the first line at SUDDEN_CAT (full house) or better wins.
// ═══════════════════════════════════════════════════════════════════

import { evalCards } from './poker-hand.mjs';

export const COLS = 7, ROWS = 6, CELLS = COLS * ROWS, HAND = 2;
// Points per category, high card → royal flush.
export const SCORE = [0, 1, 3, 6, 12, 15, 25, 50, 100, 150];
export const SUDDEN_CAT = 4;
// Directions: across, up, diagonal ↗, diagonal ↖.
export const DIRS = [[1, 0], [0, 1], [1, 1], [-1, 1]];

export const cellOf = (row, col) => row * COLS + col;
export const rowOf = (cell) => Math.floor(cell / COLS);
export const colOf = (cell) => cell % COLS;

// Every line of five: { dir, cells } (cells in order along the line).
function windows() {
  const out = [];
  DIRS.forEach(([dc, dr], dir) => {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const er = r + 4 * dr, ec = c + 4 * dc;
      if (er < 0 || er >= ROWS || ec < 0 || ec >= COLS) continue;
      const cells = [];
      for (let k = 0; k < 5; k++) cells.push(cellOf(r + k * dr, c + k * dc));
      out.push({ dir, cells });
    }
  });
  return out;
}
export const WINDOWS = windows();
/** The lines through each cell. */
export const BY_CELL = Array.from({ length: CELLS }, (_, i) => WINDOWS.filter((w) => w.cells.indexOf(i) >= 0));

/** An empty grid (null = free cell). */
export const emptyGrid = () => new Array(CELLS).fill(null);
/** Row a card dropped in `col` lands on, or -1 when the column is full. */
export function dropRow(grid, col) {
  for (let r = 0; r < ROWS; r++) if (grid[cellOf(r, col)] == null) return r;
  return -1;
}
/** The columns that still take a card. */
export const openCols = (grid) => [0, 1, 2, 3, 4, 5, 6].filter((c) => dropRow(grid, c) >= 0);
export const isFull = (grid) => grid.every((x) => x != null);

/**
 * What card `n` dropped on free cell `cell` scores: { points, cat, lines }.
 * lines: [{ dir, cells, cat, nameKey }] — the best filled line of each
 * direction through the cell; cat: the best category among them (-1: none).
 */
export function scoreDrop(grid, cell, n) {
  const best = [null, null, null, null];
  for (const w of BY_CELL[cell]) {
    let full = true;
    const cards = w.cells.map((i) => { const v = i === cell ? n : grid[i]; if (v == null) full = false; return v; });
    if (!full) continue;
    const ev = evalCards(cards);
    const b = best[w.dir];
    if (!b || ev.cat > b.cat) best[w.dir] = { dir: w.dir, cells: w.cells, cat: ev.cat, nameKey: ev.nameKey };
  }
  const lines = best.filter(Boolean);
  return {
    points: lines.reduce((a, l) => a + SCORE[l.cat], 0),
    cat: lines.reduce((a, l) => Math.max(a, l.cat), -1),
    lines,
  };
}

// ── The Ace's play ───────────────────────────────────────────────────

/**
 * Value of a line that is not full yet, for the cards in it: how close it
 * is to a good hand (same suit, ranks close together, pairs). Small next to
 * real points — it only breaks ties between moves that score nothing.
 */
function promise(cards) {
  const got = cards.filter((c) => c != null);
  if (got.length < 2) return 0;
  const suits = [0, 0, 0, 0], ranks = {};
  for (const c of got) { suits[Math.floor(c / 13)]++; ranks[c % 13] = (ranks[c % 13] || 0) + 1; }
  const flush = Math.max(...suits) === got.length ? got.length : 0;
  const counts = Object.values(ranks);
  const pairs = counts.reduce((a, k) => a + (k >= 2 ? k * k : 0), 0);
  const rs = Object.keys(ranks).map(Number);
  const span = Math.max(...rs) - Math.min(...rs);
  const straight = counts.length === got.length && span <= 4 ? got.length : 0;
  return (flush * flush * 0.12 + straight * straight * 0.08 + pairs * 0.25) * (got.length / 5);
}
/** Promise of the lines through `cell` once `n` sits there (none full). */
function promiseAt(grid, cell, n) {
  let p = 0;
  for (const w of BY_CELL[cell]) {
    const cards = w.cells.map((i) => (i === cell ? n : grid[i]));
    if (cards.some((c) => c == null)) p += promise(cards);
  }
  return p;
}
/** The best a hand of cards scores in one drop on `grid`: { points, cat }. */
export function bestReply(grid, hand) {
  let top = { points: 0, cat: -1 };
  for (const col of openCols(grid)) {
    const cell = cellOf(dropRow(grid, col), col);
    for (const n of hand) {
      if (n == null) continue;
      const s = scoreDrop(grid, cell, n);
      if (s.points > top.points || s.cat > top.cat) top = { points: Math.max(top.points, s.points), cat: Math.max(top.cat, s.cat) };
    }
  }
  return top;
}

/**
 * The Ace's move: { col, k } — drop hand[k] in column col.
 *   mine   the cards he holds; theirs  the opponent's (face up)
 *   sudden sudden death: a full house or better wins (or must be stopped)
 *   level  0 casual … 2 sharp: how far he looks and how often he slips
 *   rnd    random source
 * He weighs what a drop scores now against the best the opponent can reply
 * with the cards they hold on the grid it leaves, and the promise of his lines.
 */
export function aceMove(grid, mine, theirs, opts = {}) {
  const { sudden = false, level = 1, rnd = Math.random } = opts;
  const look = [0.35, 0.8, 1][level] ?? 0.8;
  const slip = [0.18, 0.06, 0][level] ?? 0.06;
  const moves = [];
  for (const col of openCols(grid)) {
    const row = dropRow(grid, col), cell = cellOf(row, col);
    for (let k = 0; k < mine.length; k++) {
      const n = mine[k];
      if (n == null) continue;
      const s = scoreDrop(grid, cell, n);
      let v;
      if (sudden && s.cat >= SUDDEN_CAT) v = 1e6;
      else {
        const g2 = grid.slice(); g2[cell] = n;
        const rep = bestReply(g2, theirs);
        v = s.points - look * rep.points + promiseAt(grid, cell, n);
        if (sudden && rep.cat >= SUDDEN_CAT) v -= 1e4 * look;
      }
      moves.push({ col, k, v: v + rnd() * 0.01 });
    }
  }
  if (!moves.length) return null;
  moves.sort((a, b) => b.v - a.v);
  // A slip: one of the other decent moves instead of the best.
  if (moves.length > 1 && rnd() < slip && moves[0].v < 1e5) {
    const pick = 1 + Math.floor(rnd() * Math.min(3, moves.length - 1));
    return { col: moves[pick].col, k: moves[pick].k };
  }
  return { col: moves[0].col, k: moves[0].k };
}
