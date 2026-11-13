'use strict';
// ═══════════════════════════════════════════════════════════════════
// The « Mini-games » mode — anonymous counters (web.25; design note
// claude/CONCEPTION_MODE_ARCADE.md). Pure: no I/O, no clock of its own;
// proxy.js stores the numbers in visits.json, like Ace's Help
// (server/guide-stats.js), and scripts/test-arcade-stats.mjs drives it.
//
// The client posts POST /__arcade { ev } — no visitor id, no player name.
// Only the events listed below are accepted, so the stored key set is
// bounded whatever a caller sends.
//
// What the dashboard wants to know:
//  · the funnel — the mode unlocked (by the trophies / by the secret word),
//    the toast seen at the table, its appearance on the login (celebrated),
//    « Play now » in the Ace's bubble, a tap on the login card, the page
//    opened (menu_open, whatever the way in);
//  · the progression — reveal_N: game N of the path revealed (where the
//    players stop, to tune the thresholds);
//  · the games — open_<id>: a game opened, end_<id>: a round played to its end;
//  · training — a training game ended by a player who has the mode unlocked
//    (train_on) or not yet (train_off): does the suspense bring more games?
// ═══════════════════════════════════════════════════════════════════

// The mini-games, in the path's order (public/modules/games/index.mjs GAMES;
// scripts/test-arcade-stats.mjs checks they match).
const GAMES = Object.freeze(['whowins', 'ace-runner', 'hilo', 'house', 'videopoker', 'pokerdrop', 'solitaire', 'ace-dash', 'bluff', 'poker-run']);
const FUNNEL = Object.freeze(['unlock_trophies', 'unlock_word', 'toast', 'celebrated', 'celebrate_play', 'login_open', 'menu_open']);
const EVENTS = Object.freeze([].concat(
  FUNNEL,
  GAMES.map((g, i) => 'reveal_' + (i + 1)),
  GAMES.map((g) => 'open_' + g),
  GAMES.map((g) => 'end_' + g),
  ['train_on', 'train_off']));

/** Is this an event we count? */
function valid(ev) { return typeof ev === 'string' && EVENTS.indexOf(ev) >= 0; }

/**
 * Counts one event. `store` = the all-time object (visitsStore), `bucket` =
 * today's visit bucket (or an hour cell); `now` = Date.now(). False when refused.
 */
function record(store, bucket, ev, now) {
  if (!valid(ev)) return false;
  if (store) {
    if (!store.arcade || typeof store.arcade !== 'object') store.arcade = {};
    store.arcade[ev] = (store.arcade[ev] || 0) + 1;
    if (!store.arcadeSince) store.arcadeSince = now || Date.now();
  }
  if (bucket) {
    if (!bucket.ar) bucket.ar = {};
    bucket.ar[ev] = (bucket.ar[ev] || 0) + 1;
  }
  return true;
}

/** Sums the per-day buckets (`bucketAt(i)` = bucket i days ago, or null). */
function period(daysBack, bucketAt) {
  const out = { arcade: {}, days: 0 };
  for (let i = 0; i < daysBack; i++) {
    const b = bucketAt(i);
    if (!b || !b.ar) continue;
    out.days++;
    for (const ev in b.ar) if (valid(ev)) out.arcade[ev] = (out.arcade[ev] || 0) + (b.ar[ev] || 0);
  }
  return out;
}

const rate = (a, b) => (b > 0 ? a / b : null);

/** What the admin section shows, from an { ev: n } table. */
function summary(a) {
  a = a || {};
  const n = (ev) => a[ev] || 0;
  const funnel = {};
  FUNNEL.forEach((ev) => { funnel[ev] = n(ev); });
  const unlocked = n('unlock_trophies') + n('unlock_word');
  return {
    funnel,
    unlocked,
    playRate: rate(n('celebrate_play'), n('celebrated')),
    reveals: GAMES.map((g, i) => n('reveal_' + (i + 1))),
    games: GAMES.map((g) => ({ id: g, open: n('open_' + g), end: n('end_' + g) })),
    training: { on: n('train_on'), off: n('train_off') },
  };
}

module.exports = { GAMES, FUNNEL, EVENTS, valid, record, period, summary };
