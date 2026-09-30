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
//  · the Ranking funnel, the project's success metric: a table was
//    highlighted in the lobby → the player joined it from the bubble → that
//    game started (a Ranking game only starts when its 10 seats are full);
//  · guests apart: they cannot play Ranking games, they are only shown the
//    free-account bubble (guest_redirect = they tapped « Create an account »).
// ═══════════════════════════════════════════════════════════════════

const EVENTS = Object.freeze({
  offer: ['offered', 'accepted', 'dismissed'],
  welcome: ['shown', 'done'],
  'lobby-ranking': ['shown', 'done', 'dismissed', 'join', 'started'],
  'lobby-ranking-create': ['shown', 'done', 'dismissed', 'create'],
  'lobby-guest': ['shown', 'done', 'dismissed', 'guest_redirect'],
  'wait-ranking': ['shown', 'done', 'dismissed', 'started'],
  'ranked-result': ['shown', 'done', 'dismissed'],
  // L4
  login: ['shown', 'done', 'dismissed', 'signup'],
  'login-profile': ['shown', 'done', 'dismissed'],
  'wait-normal': ['shown', 'done', 'dismissed'],
  // L5 — game creation page and windows (first opening)
  'create-game': ['shown', 'done', 'dismissed'],
  'w-ranking': ['shown', 'done', 'dismissed'],
  'w-events': ['shown', 'done', 'dismissed'],
  'w-help': ['shown', 'done', 'dismissed'],
  'w-adv': ['shown', 'done', 'dismissed'],
  'w-theme': ['shown', 'done', 'dismissed'],
  'w-music': ['shown', 'done', 'dismissed'],
  'w-avatar': ['shown', 'done', 'dismissed'],
  'w-players': ['shown', 'done', 'dismissed'],
  'w-profile': ['shown', 'done', 'dismissed'],
  'w-logs': ['shown', 'done', 'dismissed'],
  // L6 — « ? » mode: entered, an element explained, left
  ask: ['shown', 'explained', 'done', 'more'],   // more (H2): « More about it » → the help section
  // H1 — « More help »: opened, a section read, a search typed, the help window opened from it
  'more-help': ['shown', 'section', 'search', 'window'],
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
    acceptance: { offered, accepted, declined: n('offer', 'dismissed'), rate: rate(accepted, offered) },
    contexts,
    funnel: { highlighted, joined, started, joinRate: rate(joined, highlighted), startRate: rate(started, joined) },
    create: { shown: n('lobby-ranking-create', 'shown'), created: n('lobby-ranking-create', 'create') },
    guests: { shown: n('lobby-guest', 'shown'), redirect: n('lobby-guest', 'guest_redirect') },
    rankedStarts: n('wait-ranking', 'started'),
  };
}

module.exports = { EVENTS, valid, record, period, summary };
