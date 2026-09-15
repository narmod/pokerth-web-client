/**
 * Bot text banter (offline / Training mode). Short, personality-flavoured
 * chat LINES — a companion to the emoji reactions in server.mjs / ui/
 * reactions.mjs, but these are real Chat messages (no "[R]" prefix), so they
 * show in the chat log like any player's message. Independent of the emoji
 * mute setting (pth_react_muted); gated by its own pth_bot_banter (default
 * ON, checked live via localStorage — no rebuild needed to disable it).
 *
 * i18n: EN + FR ship with this feature; every other language falls back to
 * English through the normal t() resolution (active lang -> English -> raw
 * key), exactly like any other UI string. Other languages get their own
 * translations later, one at a time, the same way a new UI string normally
 * gets swept across public/modules/lang/*.mjs.
 *
 * Deliberately data-only: no rng, no DOM, no protocol — server.mjs owns the
 * "when" (triggers, frequency, anti-repeat), this module owns the "what"
 * (which key pool exists for a given archetype + moment).
 */

// Moments a bot might comment on. Kept in sync with server.mjs call sites:
//   greet    — rare, once at table seating (before the first hand)
//   big      — won a hand with real showdown strength
//   bad      — lost a hand despite a strong hand (bad beat)
//   steal    — won a pot without showdown (a real bet, not a trivial one)
//   bust     — the bot itself is eliminated from the tournament
//   victory  — the bot wins the whole Sit'n'Go
//   runnerup — the human wins the whole Sit'n'Go; a bot on the rail reacts
export const KINDS = ['greet', 'big', 'bad', 'steal', 'bust', 'victory', 'runnerup'];
export const ARCHETYPES = ['rock', 'tag', 'lag', 'station', 'maniac'];
const VARIANTS_PER_KIND = 4;

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// BANTER.rock.big -> ['bntRockBig1', 'bntRockBig2', 'bntRockBig3', 'bntRockBig4']
// (the i18n keys themselves live in public/modules/lang/*.mjs — this module
// only builds/holds the key NAMES, never the text.)
export const BANTER = {};
for (const a of ARCHETYPES) {
  BANTER[a] = {};
  for (const k of KINDS) {
    const keys = [];
    for (let i = 1; i <= VARIANTS_PER_KIND; i++) keys.push('bnt' + cap(a) + cap(k) + i);
    BANTER[a][k] = keys;
  }
}

/**
 * Pick an i18n key for (archetype, kind), avoiding an immediate repeat of
 * `last` when the pool has more than one option. Falls back to the 'tag'
 * archetype's pool if `arch` is unknown, and returns null if the kind
 * genuinely has nothing (should not happen given the table above).
 */
export function pickBanterKey(arch, kind, last, rng) {
  const pool = (BANTER[arch] && BANTER[arch][kind]) || (BANTER.tag && BANTER.tag[kind]);
  if (!pool || !pool.length) return null;
  const r = rng || Math.random;
  let key = pool[Math.floor(r() * pool.length)];
  if (key === last && pool.length > 1) key = pool[Math.floor(r() * pool.length)];
  return key;
}
