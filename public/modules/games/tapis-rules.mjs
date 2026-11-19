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
//             pays the sum of its chips' values × that hand's multiplier
//             (handMult: ×1.25 a pair … ×3.25 a royal, web.93),
//             its 5th to 8th chips counting ×2, from its 9th ×3 (tierOf).
//   Recave    no group left: the dealer pushes a row in from the felt, made
//             of pairs (recaveRow) — the player is never stuck.
//   Levels    (push 3, web.78, levelKit) cards in the stacks from level 2
//             ({ k: CARD, card }: a group going next to one sets it free, into
//             the hand of 5); Joker chips from 3 (WILD, with every colour);
//             the Dealer button on a friend from 5; sealed chips from 9 ({ seal }:
//             no group until a group next to it breaks the seal); rows rising
//             from the felt from 13 (riseRow). A venue every 4 levels (venueAt).
//             Past the final table (web.137, narmod: « too easy from level 20,
//             nothing new »): level 25 opens a new stage — a 6th colour (as the
//             arcade's 6 tombstone colours), the seals again from 2 up to 12, rows
//             from 10 s down to 6 s — and the clock keeps tightening.
// ═══════════════════════════════════════════════════════════════════

/** The chips: colour (side, dark side, marks), suit printed on them, value (web.122: ÷5, was 5 / 10 / 25 / 100 / 500, the Joker 50; web.137: the 6th, orange ✦, 50). */
export const CHIPS = [
  { id: 'red', top: '#d23a30', side: '#8e1c15', mark: '#f7f1e3', suit: '♥', v: 1 },
  { id: 'blue', top: '#2f6bd0', side: '#173c80', mark: '#f7f1e3', suit: '♦', v: 2 },
  { id: 'green', top: '#27a058', side: '#115a2e', mark: '#f7f1e3', suit: '♣', v: 5 },
  { id: 'black', top: '#33363c', side: '#121316', mark: '#e3c06a', suit: '♠', v: 20 },
  { id: 'purple', top: '#9a5ae0', side: '#542a8f', mark: '#f7f1e3', suit: '★', v: 100 },
  { id: 'wild', top: '#f5f0e3', side: '#b8902e', mark: '#141414', suit: 'J', v: 10 },
  // web.137: the 6th colour (from level 25), after the Joker chip so WILD keeps its index; worth 50, between the
  // black and the purple, so the scores keep their size (narmod web.122: « too many digits »)
  { id: 'orange', top: '#ee8a1f', side: '#9c4f0b', mark: '#f7f1e3', suit: '✦', v: 50 },
];
/** The Joker chip (CHIPS[WILD]): it goes with every colour (from level 3). */
export const WILD = 5;
/** The k of the i-th colour (0-based): the Joker chip's index is skipped (the 6th colour is CHIPS[6]). */
export const colorK = (i) => (i < WILD ? i : i + 1);
/** A colour drawn among the first n. */
const randK = (n, rnd) => colorK(Math.floor(rnd() * n));
/** A card in a stack: { k: CARD, card: n }; it goes to the hand when a group next to it goes (from level 2). */
export const CARD = -1;

/**
 * What a blind level brings (claude/CONCEPTION_TAPIS.md § 6): cards in the
 * stacks, Joker chips, the Dealer button on a friend, sealed chips, rows
 * coming up from the felt (seconds between two, 0 for none).
 */
export function levelKit(lv) {
  lv = Math.max(1, lv);
  return {
    cards: lv < 2 ? 0 : lv < 5 ? 2 : lv < 10 ? 3 : 4,
    wild: lv < 3 ? 0 : lv < 9 ? 1 : 2,
    dealer: lv >= 5,
    // web.137 (narmod: « nothing new past level 20 »): level 25 opens a new stage with the 6th colour — the seals
    // start again from 2 (up to 12 at 45) and the rows from 10 s (down to 6 s at 41). 6 colours with 8+ seals at
    // once was a wall in the simulation (40 % of rounds won at 24 → 7 % at 25); this way it goes down step by step.
    seals: lv < 9 ? 0 : lv < 25 ? Math.min(8, 2 + Math.floor((lv - 9) / 2)) : Math.min(12, 2 + Math.floor((lv - 25) / 2)),
    rise: lv < 13 ? 0 : lv < 25 ? Math.max(8, 14 - (lv - 13) * 0.5) : Math.max(6, 10 - (lv - 25) * 0.25),
  };
}
/** The level each new thing first comes at (for its word the first time). */
export const KIT_FROM = [['cards', 2, 'tpNewCards'], ['wild', 3, 'tpNewWild'], ['dealer', 5, 'tpNewDealer'], ['seals', 9, 'tpNewSeal'], ['rise', 13, 'tpNewRise']];
/** The venue at blind level lv (runner-scenery.mjs VENUES): a new one every 4 levels, the final table from 21. */
export const venueAt = (lv) => Math.min(5, Math.floor((Math.max(1, lv) - 1) / 4));
/** The time of day in a venue: day, dusk, evening, night along its 4 levels. */
export const dayOfLevel = (lv) => [0.5, 0.71, 0.8, 0.93][(Math.max(1, lv) - 1) % 4];

/** Colours on the board at blind level `lv`: 3, a 4th from level 5, a 5th from 13, a 6th from 25 (web.137). */
export const colorsAt = (lv) => (lv >= 25 ? 6 : lv >= 13 ? 5 : lv >= 5 ? 4 : 3);
/**
 * Seconds a chip is worth on the clock: 0.9 at first, down to 0.7 (web.93, narmod: « a bit harder »; was 1.1 → 0.8),
 * then past the final table 0.005 less a level, down to 0.6 at level 41 (web.137).
 */
export const perChipAt = (lv) => (lv <= 21 ? Math.max(0.7, 0.9 - 0.015 * (Math.max(1, lv) - 1)) : Math.max(0.6, 0.7 - 0.005 * (lv - 21)));
/**
 * The round's clock for `total` chips at level `lv`: 35 s at least, 12 % more
 * for each colour past 3 (more colours, more moves: level 13 is no wall).
 */
export const timeFor = (total, lv) => Math.max(35, Math.round(total * perChipAt(lv) * (1 + 0.12 * (colorsAt(lv) - 3))));
/**
 * How much more a level pays (web.122, narmod: « too many digits, millions by level 20 »): ×1 at level 1, a
 * quarter more a level — ×6.5 at level 23 (was × the level: ×23). With every pay ÷10 the scores of a long
 * game are about 30 times smaller (3.4 million → about 100 000).
 */
export const lvFactor = (lv) => 1 + (Math.max(1, lv) - 1) / 4;
/** What the level pays for `base` (the old pays ÷10, scaled by lvFactor), rounded. */
export const lvPay = (base, lv) => Math.round(base * lvFactor(lv));
/** A character in its hole pays this (10 at level 1; web.93: was 100 × level); the round's leftover seconds pay TIME_PAY each. */
export const inPay = (lv) => lvPay(10, lv);
export const TIME_PAY = 1;
/** A round left without a single chip (the « Table rase »). */
export const cleanPay = (lv) => lvPay(50, lv);
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
/**
 * A group's hand multiplier (web.93, narmod: « the score gets very high fast »):
 * ×1.25 a pair up to ×3.25 a royal — the poker multipliers (×2 … ×50) on top
 * of the tiers made one big group worth more than a whole round.
 */
export const handMult = (cat) => (cat < 0 ? 0 : 1 + cat / 4);
/** What a group pays: the sum of its values × its hand's multiplier. */
export function groupPay(grid, cells) {
  cells = cells.filter(([c, r]) => grid[c][r].k >= 0);
  const cat = handOf(cells.length);
  if (cat < 0) return { cat, pts: 0, each: [] };
  // each chip: its value × its rank's tier (the 5th to 8th count ×2, from the 9th ×3 — Monster Madness'
  // 100 / 250 / 500 a block in a big group, web.88; ×5 until web.93) × the group's hand
  const each = cells.map(([c, r], i) => Math.round(CHIPS[grid[c][r].k].v * tierOf(i) * handMult(cat)));
  return { cat, pts: each.reduce((a, b) => a + b, 0), each };
}
/** A chip's tier by its rank in its group (0 the touched one): ×1 up to the 4th, ×2 to the 8th, ×3 beyond. */
export const tierOf = (i) => (i < 4 ? 1 : i < 8 ? 2 : 3);

const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
/** Can this cell join a group (a chip, not sealed)? */
const free = (b) => !!b && b.k >= 0 && !b.seal;
/** Do two free chips go together (same colour, or one of them a Joker chip)? */
const goes = (a, b) => free(a) && free(b) && (a.k === b.k || a.k === WILD || b.k === WILD);
/** The chips of colour k (and Joker chips) touching (c, r), from it. */
function flood(grid, c, r, k) {
  const seen = new Set([c + ',' + r]), out = [[c, r]], todo = [[c, r]];
  while (todo.length) {
    const [x, y] = /** @type {number[]} */ (todo.pop());
    for (const [dx, dy] of NB) {
      const nx = x + dx, ny = y + dy, key = nx + ',' + ny, b = grid[nx] && grid[nx][ny];
      if (seen.has(key) || !free(b) || (b.k !== k && b.k !== WILD)) continue;
      seen.add(key); out.push([nx, ny]); todo.push([nx, ny]);
    }
  }
  return out;
}
/**
 * The chips of one colour touching the chip at column c, row r (itself
 * included), Joker chips with them; from a Joker chip, the biggest group of a
 * colour it touches (or the Joker chips together). Cards and sealed chips
 * never join.
 */
export function groupAt(grid, c, r) {
  const b = grid[c] && grid[c][r];
  if (!free(b)) return b ? [[c, r]] : [];
  if (b.k !== WILD) return flood(grid, c, r, b.k);
  let best = flood(grid, c, r, WILD);
  const ks = new Set();
  best.forEach(([x, y]) => NB.forEach(([dx, dy]) => { const o = grid[x + dx] && grid[x + dx][y + dy]; if (free(o) && o.k !== WILD) ks.add(o.k); }));
  for (const k of ks) { const g = flood(grid, c, r, k); if (g.length > best.length) best = g; }
  return best;
}
/** Is there a group of 2 or more anywhere? */
export function anyMove(grid) {
  for (let c = 0; c < grid.length; c++) {
    const col = grid[c];
    for (let r = 0; r < col.length; r++) {
      if (goes(col[r], col[r + 1])) return true;
      if (grid[c + 1] && goes(col[r], grid[c + 1][r])) return true;
    }
  }
  return false;
}
/**
 * What a group going sets free next to it (before it goes): the cards
 * touching it (they go too, into the hand) and the sealed chips touching it
 * (their seal breaks). Returns { cards: [[c, r]], seals: [[c, r]] }.
 */
export function freedBy(grid, cells) {
  const inSet = new Set(cells.map(([c, r]) => c + ',' + r)), seen = new Set(), cards = [], seals = [];
  for (const [c, r] of cells) for (const [dx, dy] of NB) {
    const x = c + dx, y = r + dy, key = x + ',' + y, b = grid[x] && grid[x][y];
    if (!b || inSet.has(key) || seen.has(key)) continue;
    seen.add(key);
    if (b.k === CARD) cards.push([x, y]); else if (b.seal) seals.push([x, y]);
  }
  return { cards, seals };
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
  if (k === CARD) return out;
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
  grid.forEach((col) => col.forEach((b) => { if (b.k >= 0) ks.push(b.k); }));
  for (let j = ks.length - 1; j > 0; j--) { const x = Math.floor(rnd() * (j + 1)); const t = ks[j]; ks[j] = ks[x]; ks[x] = t; }
  let i = 0;
  grid.forEach((col) => col.forEach((b) => { if (b.k >= 0) b.k = ks[i++]; }));
}
/**
 * The dealer's recave: a chip pushed in under every column, an empty one too,
 * the chips above rising one row. Neighbouring columns get the same colour
 * two by two, so there is a pair at once; a column left alone gets the colour
 * of the chip above it (two of a colour over a card, a seal or nothing).
 * Returns the number of chips added.
 */
export function recaveRow(grid, nColors, rnd = Math.random) {
  // Every column, an empty one too: in Monster Madness the row comes up under the
  // whole table, so an emptied column fills again (narmod web.86, « B »).
  const live = grid.map((_, c) => c);
  const ks = new Map();
  for (let i = 0; i < live.length;) {
    if (live[i + 1] === live[i] + 1) { const k = randK(nColors, rnd); ks.set(live[i], k); ks.set(live[i + 1], k); i += 2; }
    else { const b = grid[live[i]][0]; ks.set(live[i], free(b) && b.k !== WILD ? b.k : -2 - randK(nColors, rnd)); i += 1; }
  }
  let n = 0;
  for (const c of live) {
    let k = ks.get(c);
    const two = k <= -2;                       // alone over a card or a seal: a pair of its own
    if (two) k = -2 - k;
    const m = two ? 2 : 1;
    grid[c].forEach((b) => { b.off -= m; });
    for (let j = 0; j < m; j++) grid[c].unshift({ k, off: -m });
    n += m;
  }
  return n;
}
/**
 * « No more moves! » as in Monster Madness (narmod web.87, after the arcade
 * video): 2 or 3 rows come up under every column, the empty ones too, in the
 * colours still on the table (the video: two colours left, two colours come).
 * So the help is never undone (one row under a lone stack used to be eaten by
 * the very pair it made): under a stack, the new chip touching it takes the
 * colour of its bottom chip — the group reaches into the old stack; an empty
 * column (put back to bring the table to its full width) copies its
 * neighbour's new chips row by row — pairs side by side.
 * Returns the rows added.
 */
export function refillRows(grid, nColors, rnd = Math.random) {
  const pal = [...new Set([].concat(...grid).filter((b) => b.k >= 0 && b.k !== WILD).map((b) => b.k))];
  const P = pal.length ? pal : Array.from({ length: Math.max(2, nColors) }, (_, i) => colorK(i));
  const n = 2 + (rnd() < 0.5 ? 1 : 0);
  const had = grid.map((col) => col.length > 0);
  const add = grid.map(() => Array.from({ length: n }, () => P[Math.floor(rnd() * P.length)]));
  grid.forEach((col, c) => { if (had[c] && free(col[0]) && col[0].k !== WILD) add[c][n - 1] = col[0].k; });
  for (let pass = 0; pass < grid.length; pass++) {
    let done = true;
    grid.forEach((_, c) => {
      if (had[c] || add[c].copied) return;
      const nb = [c - 1, c + 1].find((x) => grid[x] && (had[x] || add[x].copied));
      if (nb == null) { done = false; return; }
      add[c] = add[nb].slice(); add[c].copied = true;
    });
    if (done) break;
  }
  grid.forEach((col, c) => {
    col.forEach((b) => { b.off -= n; });
    for (let j = n - 1; j >= 0; j--) col.unshift({ k: add[c][j], off: -n });
  });
  if (!anyMove(grid) && grid[0] && grid[0].length > 1) grid[0][0].k = grid[0][1].k;   // never stuck
  return n;
}
/** A row of chips of any colour pushed in under every column still standing lower than maxH (the felt rising). Returns the chips added. */
export function riseRow(grid, nColors, maxH, rnd = Math.random) {
  let n = 0;
  grid.forEach((col) => {
    if (!col.length || col.length >= maxH) return;
    col.forEach((b) => { b.off -= 1; });
    col.unshift({ k: randK(nColors, rnd), off: -1 });
    n++;
  });
  return n;
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
      let k = randK(n, rnd);
      const x = rnd();
      // a little clustering so groups exist — less than until web.93 (0.26 / 0.46): fewer giant groups
      if (r > 0 && x < 0.2) k = col[r - 1].k;
      else if (c > 0 && grid[c - 1][r] && x < 0.38) k = grid[c - 1][r].k;
      col.push({ k, off: 0 });
    }
    grid.push(col);
  }
  // What the level brings: cards (face up, no two the same), Joker chips, sealed chips — never a column's top.
  const kit = levelKit(lv), spots = [];
  grid.forEach((col, c) => col.forEach((_, r) => { if (r < col.length - 1) spots.push([c, r]); }));
  const pick = () => (spots.length ? spots.splice(Math.floor(rnd() * spots.length), 1)[0] : null);
  const deck = [];
  for (let i = 0; i < kit.cards; i++) {
    const at = pick(); if (!at) break;
    let card; do card = Math.floor(rnd() * 52); while (deck.includes(card));
    deck.push(card); grid[at[0]][at[1]] = { k: CARD, card, off: 0 };
  }
  for (let i = 0; i < kit.wild; i++) { const at = pick(); if (at) grid[at[0]][at[1]].k = WILD; }
  for (let i = 0; i < kit.seals; i++) { const at = pick(); if (at) grid[at[0]][at[1]].seal = true; }
  if (!anyMove(grid)) recaveRow(grid, n, rnd);
  return grid;
}
/**
 * The family of characters at blind level `lv` (claude/CONCEPTION_TAPIS.md § 5):
 * the Suits at levels 1-2, the Figures at 3-4, and so on two by two; every
 * one of them mixed from level 21 (the final table).
 */
export const castFamily = (lv) => (lv >= 21 ? 'mixed' : (Math.floor((Math.max(1, lv) - 1) / 2) % 2 ? 'figures' : 'suits'));
/** Chips left on the board. */
export const chipsLeft = (grid) => grid.reduce((a, col) => a + col.length, 0);
/**
 * The power a big group wins (n ≥ 9), or '' : a Joker from 13, else a Dealer or a Shuffle.
 * Until web.103 from 6 and 9 (narmod: « too many rewards: at level 12, 30 Jokers »): with
 * POWER_MAX and one power a level (tapis.mjs), a few in hand, not a pile.
 */
export function powerFor(n, rnd = Math.random) {
  if (n >= 13) return 'joker';
  if (n >= 9) return rnd() < 0.5 ? 'dealer' : 'shuffle';
  return '';
}
/** The most of each power a player keeps (web.103). */
export const POWER_MAX = 3;
