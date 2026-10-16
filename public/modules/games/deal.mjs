// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Seeded shuffles for the arcade's card games (web extension, narmod
// 2026-10-16) — pure, DOM-free (scripts/test-games.mjs). A daily challenge
// deals the same cards to every player on a given UTC day: its seed is the
// game, the day and the hand number, no server involved.
// ═══════════════════════════════════════════════════════════════════

/** A random generator in [0, 1) from a seed string (mulberry32 over a string hash). */
export function rng(seed) {
  const s = String(seed);
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** The 52 cards (PokerTH numbers) shuffled with `rnd` (Math.random by default). */
export function shuffled(rnd = Math.random) {
  const deck = [];
  for (let n = 0; n < 52; n++) deck.push(n);
  for (let j = deck.length - 1; j > 0; j--) { const x = Math.floor(rnd() * (j + 1)); const tmp = deck[j]; deck[j] = deck[x]; deck[x] = tmp; }
  return deck;
}
/** A deck for `seed` (string) or a fresh random one (null). */
export function deckFor(seed) { return shuffled(seed == null ? Math.random : rng(seed)); }
