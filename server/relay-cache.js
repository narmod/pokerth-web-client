'use strict';
// ═══════════════════════════════════════════════════════════════════
// Relay cache core (web.254) — shared by every proxy.js relay that reads a
// community site (rankings, player cards, forum feed, live figures, events,
// BBC registrations, bot files). Pure: no network, no timers of its own, so
// scripts/test-relay-cache.mjs drives it with a fake clock.
//
//   get(key, ttlMs, produce, opts) -> Promise<{ status, body, note }>
//     produce() -> Promise<{ status, body }> (may throw). Never rejects.
//
// What it guarantees, so the upstream sites see as few requests as possible:
//  1. one upstream call per key at a time — twenty tabs asking the same thing
//     when the cache expires share one read (note 'miss' for all of them);
//  2. a failure (non-200 or thrown) is remembered failTtlMs: during that time
//     nobody retries, the last good copy is served if there is one ('stale'),
//     otherwise the failure itself ('fail'). A failure never evicts a good copy;
//  3. with opts.swr an expired good copy is served at once ('stale') and the
//     refresh runs behind it, so no player waits for a slow site;
//  4. purge() drops copies older than keepMs (pinned keys excepted) and
//     trims the map to `max` entries, oldest write first.
// ═══════════════════════════════════════════════════════════════════

function createRelayCache(o) {
  o = o || {};
  const cache = o.cache || new Map();          // key -> { at, status, body }
  const fails = new Map();                     // key -> { at, status, body }
  const inflight = new Map();                  // key -> Promise
  const failTtlMs = o.failTtlMs || 60 * 1000;
  const keepMs = o.keepMs || 6 * 3600 * 1000;
  const max = o.max || 3000;
  const pinned = new Set(o.pinned || []);
  const now = o.now || Date.now;

  function _failBody(err, opts) {
    if (opts && typeof opts.failBody === 'function') return opts.failBody(err);
    return JSON.stringify({ ok: false, error: 'relay_failed', detail: String((err && err.message) || err).slice(0, 120) });
  }

  function _run(key, produce, opts) {
    let job = inflight.get(key);
    if (!job) {
      job = Promise.resolve().then(produce).then(function (out) {
        const status = (out && out.status) || 502;
        const body = (out && typeof out.body === 'string') ? out.body : _failBody(new Error('empty'), opts);
        if (status === 200) {
          cache.delete(key);                     // re-insert: Map order = write order (purge trims oldest)
          cache.set(key, { at: now(), status: 200, body: body });
          fails.delete(key);
        } else {
          fails.set(key, { at: now(), status: status, body: body });
        }
        return { status: status, body: body, note: status === 200 ? 'miss' : 'fail' };
      }, function (err) {
        const f = { at: now(), status: 502, body: _failBody(err, opts) };
        fails.set(key, f);
        return { status: f.status, body: f.body, note: 'fail' };
      }).finally(function () { inflight.delete(key); });
      inflight.set(key, job);
    }
    return job.then(function (out) {
      if (out.status !== 200) {
        const good = cache.get(key);
        if (good) return { status: good.status, body: good.body, note: 'stale' };
      }
      return out;
    });
  }

  function get(key, ttlMs, produce, opts) {
    opts = opts || {};
    const t = now();
    const hit = cache.get(key);
    if (hit && (t - hit.at) < ttlMs) return Promise.resolve({ status: hit.status, body: hit.body, note: 'hit' });
    const f = fails.get(key);
    const cooling = !!(f && (t - f.at) < failTtlMs);
    if (hit && (opts.swr || cooling)) {
      if (!cooling) _run(key, produce, opts);  // refresh behind; _run never rejects
      return Promise.resolve({ status: hit.status, body: hit.body, note: 'stale' });
    }
    if (cooling) return Promise.resolve({ status: f.status, body: f.body, note: 'fail' });
    return _run(key, produce, opts);
  }

  // Background refresh without a request (warm-up at boot).
  function warm(key, ttlMs, produce, opts) { return get(key, ttlMs, produce, Object.assign({}, opts, { swr: true })); }

  function purge() {
    const t = now();
    let dropped = 0;
    cache.forEach(function (v, k) {
      if (!pinned.has(k) && (t - v.at) > keepMs) { cache.delete(k); dropped++; }
    });
    fails.forEach(function (v, k) { if ((t - v.at) >= failTtlMs) fails.delete(k); });
    let over = cache.size - max;
    if (over > 0) {
      for (const k of Array.from(cache.keys())) {
        if (over <= 0) break;
        if (pinned.has(k)) continue;
        cache.delete(k); over--; dropped++;
      }
    }
    return dropped;
  }

  return { get: get, warm: warm, purge: purge, cache: cache, fails: fails, inflight: inflight };
}

module.exports = { createRelayCache };
