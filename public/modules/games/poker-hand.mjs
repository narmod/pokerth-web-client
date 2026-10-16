// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Best five-card hand among any number of cards (web extension, hidden
// mini-games, modules/games/). Pure and DOM-free: scripts/test-games.mjs
// exercises it under Node.
//
// Cards use the PokerTH encoding of the rest of the client (modules/ui/
// deck.mjs): 0..12 = ♦ 2..A, 13..25 = ♥, 26..38 = ♠, 39..51 = ♣. JOKER (52)
// is a wild card: it becomes whichever card makes the best hand.
//
// evalCards(cards) → { cat, id, mult, best, nameKey }
//   cat      0 (high card) … 9 (royal flush)
//   id       'high' 'pair' 'two' 'trips' 'straight' 'flush' 'full' 'quads' 'sf' 'royal' ('none': no card)
//   mult     score multiplier of the category (MULT)
//   best     the five cards (or fewer) that make it, jokers kept as JOKER
//   nameKey  i18n key of the hand name, shared with the hands panel (h1n…h10n)
// ═══════════════════════════════════════════════════════════════════

export const JOKER = 52;
export const IDS = ['high', 'pair', 'two', 'trips', 'straight', 'flush', 'full', 'quads', 'sf', 'royal'];
export const MULT = [1, 2, 3, 4, 5, 6, 8, 12, 20, 50];
// h1n = Royal Flush … h10n = High Card (hands panel of the table).
export const NAME_KEYS = ['h10n', 'h9n', 'h8n', 'h7n', 'h6n', 'h5n', 'h4n', 'h3n', 'h2n', 'h1n'];

/** Rank 2..14 (ace high) of a PokerTH card number. */
export const rankOf = (n) => (n % 13) + 2;
/** Suit 0..3 (♦ ♥ ♠ ♣) of a PokerTH card number. */
export const suitOf = (n) => Math.floor(n / 13);

const desc = (a) => a.slice().sort((x, y) => rankOf(y) - rankOf(x));

// Five cards of a straight among `cs` (ace low allowed), highest first; null if none.
function straightOf(cs) {
  const byR = {};
  for (const c of cs) { const r = rankOf(c); if (byR[r] == null) byR[r] = c; }
  if (byR[14] != null) byR[1] = byR[14];
  for (let top = 14; top >= 5; top--) {
    let ok = true;
    for (let k = 0; k < 5; k++) if (byR[top - k] == null) { ok = false; break; }
    if (ok) return [0, 1, 2, 3, 4].map((k) => byR[top - k]);
  }
  return null;
}

// Natural cards only (no joker): [cat, best, tiebreak ranks].
function evalNatural(cards) {
  const bySuit = [[], [], [], []];
  const byRank = {};
  for (const c of cards) { bySuit[suitOf(c)].push(c); (byRank[rankOf(c)] = byRank[rankOf(c)] || []).push(c); }
  const rest = (used, n) => desc(cards.filter((c) => used.indexOf(c) < 0)).slice(0, n);
  const tb = (best) => best.map(rankOf);
  const sTop = (s) => (rankOf(s[0]) === 14 && rankOf(s[1]) === 5 ? 5 : rankOf(s[0]));   // wheel: 5 high

  let sf = null;
  for (const su of bySuit) if (su.length >= 5) {
    const s = straightOf(su);
    if (s && (!sf || sTop(s) > sTop(sf))) sf = s;
  }
  if (sf) return [sTop(sf) === 14 ? 9 : 8, sf, [sTop(sf)]];
  const groups = Object.keys(byRank).map((k) => byRank[k])
    .sort((a, b) => b.length - a.length || rankOf(b[0]) - rankOf(a[0]));
  const g0 = groups[0], g1 = groups[1];
  if (g0.length >= 4) { const q = g0.slice(0, 4); const b = q.concat(rest(q, 1)); return [7, b, tb(b)]; }
  if (g0.length === 3 && g1 && g1.length >= 2) { const b = g0.concat(g1.slice(0, 2)); return [6, b, tb(b)]; }
  let fl = null;
  for (const su of bySuit) if (su.length >= 5) {
    const b = desc(su).slice(0, 5);
    if (!fl || cmp(tb(b), tb(fl)) > 0) fl = b;
  }
  if (fl) return [5, fl, tb(fl)];
  const st = straightOf(cards);
  if (st) return [4, st, [sTop(st)]];
  if (g0.length === 3) { const b = g0.concat(rest(g0, 2)); return [3, b, tb(b)]; }
  if (g0.length === 2 && g1 && g1.length === 2) { const p = g0.concat(g1); const b = p.concat(rest(p, 1)); return [2, b, tb(b)]; }
  if (g0.length === 2) { const b = g0.concat(rest(g0, 3)); return [1, b, tb(b)]; }
  const b = desc(cards).slice(0, 5);
  return [0, b, tb(b)];
}

function cmp(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}
function better(x, y) { return !y || x[0] > y[0] || (x[0] === y[0] && cmp(x[2], y[2]) > 0); }

/**
 * Best hand among natural cards (no joker), with what breaks ties:
 * { cat, best, tb, nameKey } — tb are the ranks to compare, in order
 * (kickers included). Who Wins? (whowins.mjs) and the Ace's Bluff compare
 * two Hold'em hands with compareHands().
 */
export function rankHand(cards) {
  const nat = (cards || []).filter((c) => Number.isInteger(c) && c >= 0 && c < JOKER);
  if (!nat.length) return { cat: -1, best: [], tb: [], nameKey: '' };
  const r = evalNatural(nat);
  return { cat: r[0], best: r[1], tb: r[2], nameKey: NAME_KEYS[r[0]] };
}
/** > 0 when hand a beats hand b, < 0 when b wins, 0 for a split pot (rankHand results). */
export function compareHands(a, b) { return a.cat !== b.cat ? a.cat - b.cat : cmp(a.tb, b.tb); }

/** Best hand among `cards` (PokerTH numbers, JOKER = wild). */
export function evalCards(cards) {
  const list = (cards || []).filter((c) => Number.isInteger(c) && c >= 0 && c <= JOKER);
  if (!list.length) return { cat: -1, id: 'none', mult: 1, best: [], nameKey: '' };
  const nat = list.filter((c) => c !== JOKER);
  const jokers = list.length - nat.length;
  let top = nat.length ? evalNatural(nat) : null;
  // Each joker tries every card not already held (two at most in practice:
  // 52 × 52 evaluations, run only when a card is picked up).
  if (jokers) {
    const free = [];
    for (let c = 0; c < 52; c++) if (nat.indexOf(c) < 0) free.push(c);
    const tryWith = (held, left) => {
      if (!left) {
        const r = evalNatural(held);
        if (better(r, top)) {
          // Show the joker in place of the card it stands for.
          const subs = held.slice(nat.length);
          r[1] = r[1].map((c) => (subs.indexOf(c) >= 0 ? JOKER : c));
          top = r;
        }
        return;
      }
      for (const c of free) if (held.indexOf(c) < 0) tryWith(held.concat([c]), left - 1);
    };
    tryWith(nat.slice(), Math.min(jokers, 2));
  }
  const cat = top[0];
  return { cat, id: IDS[cat], mult: MULT[cat], best: top[1], nameKey: NAME_KEYS[cat] };
}
