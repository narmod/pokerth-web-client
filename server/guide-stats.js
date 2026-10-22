'use strict';
// ═══════════════════════════════════════════════════════════════════
// Ace's Help — anonymous counters (L3, web.261). Pure: no I/O, no clock of
// its own; proxy.js stores the numbers in visits.json (same file, same
// retention and reset as the music counter) and scripts/test-guide-admin.mjs
// drives this module directly.
//
// The client posts POST /__guide { ctx, ev } — no visitor id, no player
// name, no table. Only the (context, event) pairs listed below are
// accepted, so the stored key set is bounded whatever a caller sends.
//
// What the dashboard wants to know:
//  · acceptance — how many players were offered the help and said yes;
//  · per context — shown / done (Got it or the action) / dismissed (Later);
//    acted (web.264) — the player moved on without answering (picked a
//    mode, connected, started the game, closed the window…): the tip is
//    then seen and does not come back;
//  · the Ranking funnel, the project's success metric: a table was
//    highlighted in the lobby → the player joined it from the bubble → that
//    game started (a Ranking game only starts when its 10 seats are full);
//  · guests apart: they cannot play Ranking games, they are only shown the
//    free-account bubble (guest_redirect = they tapped « Create an account »);
//  · the local backup offer (web.27): said by the Ace (shown) or, when he
//    cannot, by the fallback banner (banner); Create / Restore tapped and
//    done, « Later », « Show me ». Both carriers count in the same context.
//    On Firefox (web.31) the offer is to protect the settings instead
//    (persistent storage): persist_shown, persist (tapped), persisted
//    (granted), persist_no (refused in Firefox's prompt), persist_later.
// ═══════════════════════════════════════════════════════════════════

const EVENTS = Object.freeze({
  offer: ['offered', 'accepted', 'dismissed', 'first'],   // first: once per device (web.6)
  welcome: ['shown', 'done'],
  'lobby-ranking': ['shown', 'done', 'dismissed', 'join', 'started'],
  'lobby-ranking-create': ['shown', 'done', 'dismissed', 'create'],
  // account (web.268): « Create an account » tapped, then this device reached the lobby with an account
  'lobby-guest': ['shown', 'done', 'dismissed', 'acted', 'guest_redirect', 'account'],
  'lobby-watch': ['shown', 'done', 'dismissed', 'watch'],   // tap on a running game (web.64)
  'lobby-cup': ['shown', 'done', 'dismissed', 'events'],    // tap on a cup game not started yet (web.65)
  'lobby-flag': ['shown', 'done', 'dismissed', 'acted', 'profile'],  // no flag next to my name (web.66)
  'lobby-open': ['shown', 'done', 'dismissed', 'join'],     // tap on an open non-ranked table (web.67)
  'lobby-lan': ['shown', 'done', 'dismissed', 'acted'],     // the lobby of a LAN / dedicated server (web.272)
  'wait-ranking': ['shown', 'done', 'dismissed', 'started'],
  'ranked-result': ['shown', 'done', 'dismissed', 'acted'],
  // L4
  login: ['shown', 'done', 'dismissed', 'acted', 'signup', 'account'],
  'login-profile': ['shown', 'done', 'dismissed', 'acted'],
  'login-lan': ['shown', 'done', 'dismissed', 'acted'],   // LAN directory (web.43)
  'wait-normal': ['shown', 'done', 'dismissed', 'acted'],
  // L5 — game creation page and windows (first opening)
  'create-game': ['shown', 'done', 'dismissed', 'acted', 'full'],   // full (web.266): « Full tour » tapped
  'create-game-full': ['shown', 'done', 'dismissed'],               // the tour of every field, on demand (web.266)
  'w-ranking': ['shown', 'done', 'dismissed', 'acted'],
  'w-events': ['shown', 'done', 'dismissed', 'acted'],
  'w-posts': ['shown', 'done', 'dismissed', 'acted'],   // web.289
  'w-help': ['shown', 'done', 'dismissed', 'acted'],
  'w-adv': ['shown', 'done', 'dismissed', 'acted'],
  'w-theme': ['shown', 'done', 'dismissed', 'acted'],
  'w-music': ['shown', 'done', 'dismissed', 'acted'],
  'w-avatar': ['shown', 'done', 'dismissed', 'acted'],
  'w-players': ['shown', 'done', 'dismissed', 'acted'],
  'w-profile': ['shown', 'done', 'dismissed', 'acted'],
  'w-logs': ['shown', 'done', 'dismissed', 'acted'],
  'w-trophies': ['shown', 'done', 'dismissed', 'acted'],   // the Trophies tab: win them all, a surprise (web.87)
  // web.87 — every trophy won: the Ace says the arcade's secret word; « Play now »
  arcade: ['revealed', 'play'],
  // L6 — « ? » mode: entered, an element explained, left
  ask: ['shown', 'explained', 'done', 'more'],   // more (H2): « More about it » → the help section
  // H1 — « More help »: opened, a section read, a search typed, the help window opened from it
  'more-help': ['shown', 'section', 'search', 'window'],
  // web.269 — « Want PokerTH on your home screen? » after a finished game, tips on or off
  install: ['shown', 'later', 'install', 'howto', 'installed'],
  // web.27 — the local backup offer on a blank browser storage (backup-autosave.mjs)
  // returning (web.265): « I already play » on a blank browser — the offer asks « Had a backup? »
  // create_* / restore_* (web.267): why a Create / Restore did not succeed (picker closed, no file…)
  backup: ['shown', 'banner', 'create', 'created', 'restore', 'restored', 'dismissed', 'showme', 'returning',
    'create_abort', 'create_exists', 'create_noperm', 'create_bad',
    'restore_abort', 'restore_nofile', 'restore_noperm', 'restore_empty', 'restore_bad',
    'persist_shown', 'persist', 'persisted', 'persist_no', 'persist_later'],   // Firefox (web.31)
});

/** Is this (context, event) pair one we count? */
function valid(ctx, ev) {
  return typeof ctx === 'string' && typeof ev === 'string'
    && Object.prototype.hasOwnProperty.call(EVENTS, ctx) && EVENTS[ctx].indexOf(ev) >= 0;
}

/**
 * Counts one event. `store` = the all-time object (visitsStore), `bucket`
 * = today's visit bucket; `now` = Date.now(). Returns false when refused.
 */
function record(store, bucket, ctx, ev, now) {
  if (!valid(ctx, ev)) return false;
  if (!store.guide || typeof store.guide !== 'object') store.guide = {};
  if (!store.guide[ctx]) store.guide[ctx] = {};
  store.guide[ctx][ev] = (store.guide[ctx][ev] || 0) + 1;
  if (!store.guideSince) store.guideSince = now || Date.now();
  if (bucket) {
    if (!bucket.gd) bucket.gd = {};
    const k = ctx + '.' + ev;
    bucket.gd[k] = (bucket.gd[k] || 0) + 1;
  }
  return true;
}

/** Sums the per-day buckets (`bucketAt(i)` = bucket i days ago, or null). */
function period(daysBack, bucketAt) {
  const out = { guide: {}, days: 0 };
  for (let i = 0; i < daysBack; i++) {
    const b = bucketAt(i);
    if (!b || !b.gd) continue;
    out.days++;
    for (const k in b.gd) {
      const dot = k.indexOf('.');
      const ctx = k.slice(0, dot), ev = k.slice(dot + 1);
      if (!valid(ctx, ev)) continue;
      if (!out.guide[ctx]) out.guide[ctx] = {};
      out.guide[ctx][ev] = (out.guide[ctx][ev] || 0) + (b.gd[k] || 0);
    }
  }
  return out;
}

const rate = (a, b) => (b > 0 ? a / b : null);

/** What the admin card shows, from a { ctx: { ev: n } } table. */
function summary(g) {
  g = g || {};
  const n = (ctx, ev) => ((g[ctx] && g[ctx][ev]) || 0);
  const offered = n('offer', 'offered'), accepted = n('offer', 'accepted');
  const contexts = {};
  for (const ctx of Object.keys(EVENTS)) {
    if (ctx === 'offer') continue;
    contexts[ctx] = { shown: n(ctx, 'shown'), done: n(ctx, 'done'), dismissed: n(ctx, 'dismissed') };
    for (const ev of EVENTS[ctx]) contexts[ctx][ev] = n(ctx, ev);   // their own events too (ask, more-help)
  }
  const highlighted = n('lobby-ranking', 'shown'), joined = n('lobby-ranking', 'join'), started = n('lobby-ranking', 'started');
  return {
    acceptance: { offered, accepted, declined: n('offer', 'dismissed'), rate: rate(accepted, offered),
      // devices = first showing on a device (web.6); answered = yes or no
      devices: n('offer', 'first'), deviceRate: rate(accepted, n('offer', 'first')),
      answerRate: rate(accepted, accepted + n('offer', 'dismissed')) },
    contexts,
    funnel: { highlighted, joined, started, joinRate: rate(joined, highlighted), startRate: rate(started, joined) },
    create: { shown: n('lobby-ranking-create', 'shown'), created: n('lobby-ranking-create', 'create') },
    guests: { shown: n('lobby-guest', 'shown'), redirect: n('lobby-guest', 'guest_redirect'), account: n('lobby-guest', 'account'),
      loginSignup: n('login', 'signup'), loginAccount: n('login', 'account') },
    rankedStarts: n('wait-ranking', 'started'),
  };
}

module.exports = { EVENTS, valid, record, period, summary };
