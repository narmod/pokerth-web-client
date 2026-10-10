'use strict';
// ═══════════════════════════════════════════════════════════════════
// Where visitors come from — anonymous per-day counters. Pure: no I/O, no
// clock of its own; proxy.js stores the numbers in visits.json (same day
// buckets, same retention, same reset as the rest of the traffic counter)
// and scripts/test-ref-stats.mjs drives this module directly.
//
// The web client reads its landing BEFORE any script cleans the URL
// (inline script in pokerth-client.html → window.__pthLanding) and adds
// three fields to the one visit ping of the session:
//   ref — the HOST NAME of document.referrer, only when it is another site
//         (never the path or the query of the referring page);
//   self — for a referrer on this very site, the first path segment only
//         (/rules, /glossary…: the SEO pages that link to the client);
//   src — the utm_source tag of the landing URL, if any;
//   inv — true when the landing URL is a table invite (#join=, ?proto=);
//   lang — true when the landing URL carries ?lang= (hreflang / SEO links).
// No path, no query, no full URL is ever stored: one short key per visit.
//
// One key per visit, first match wins:
//   utm:<source>  a tagged campaign link (we tag our own posts this way)
//   <host>        another site sent the visitor (google.com, com.tencent.mm…)
//   (invite)      a table invite link, opened with no referrer (chat apps)
//   site:<page>   one of our own pages (/rules, /glossary…) linked here
//   (lang link)   a ?lang= URL with no referrer (search result, bookmark)
//   (direct)      nothing at all: typed, bookmark, installed app, or a
//                 referrer withheld by the browser or the referring app
// ═══════════════════════════════════════════════════════════════════

const CAP_DAY = 80;       // distinct sources per day (sr, srn)
const CAP_DAY_LANG = 240; // distinct "source language" pairs per day (srl)
const OVERFLOW = '(overflow)';
const DIRECT = '(direct)';

// Mobile and tracking subdomains that say nothing about the source:
// m.facebook.com, l.facebook.com and lm.facebook.com are all Facebook.
const HOST_PREFIX = /^(?:www\d?|m|l|lm|mobile|amp)\./;

function cleanHost(h) {
  if (typeof h !== 'string') return '';
  let s = h.trim().toLowerCase().replace(/\.$/, '');
  if (!s || s.length > 80 || !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(s)) return '';
  // Keep at least two labels: "m.me" stays "m.me".
  while (HOST_PREFIX.test(s) && s.replace(HOST_PREFIX, '').indexOf('.') > 0) s = s.replace(HOST_PREFIX, '');
  return s;
}

function cleanTag(t) {
  if (typeof t !== 'string') return '';
  const s = t.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32);
  return s;
}

function cleanPage(p) {
  if (typeof p !== 'string') return '';
  const s = p.trim().toLowerCase();
  if (s === '/' || s === '') return '/';
  const m = /^\/?([a-z0-9-]{1,24})/.exec(s);
  return m ? '/' + m[1] : '';
}

/** The source key of one visit ping `d` (the parsed JSON body). */
function classify(d) {
  d = (d && typeof d === 'object') ? d : {};
  const tag = cleanTag(d.src);
  if (tag) return 'utm:' + tag;
  if (d.ref) {
    const h = cleanHost(d.ref);
    return h || OVERFLOW;
  }
  if (d.inv === true) return '(invite)';
  if (typeof d.self === 'string' && d.self) {
    const p = cleanPage(d.self);
    return p ? 'site:' + p : OVERFLOW;
  }
  if (d.lang === true) return '(lang link)';
  return DIRECT;
}

function bump(dst, key, cap) {
  if (dst[key] === undefined && Object.keys(dst).length >= cap) key = OVERFLOW;
  dst[key] = (dst[key] || 0) + 1;
}

/**
 * Counts one visit. `store` = the all-time object (visitsStore, only for
 * refSince), `bucket` = today's visit bucket, `key` = classify(d),
 * `isNew` = true / false / null (no id: neither), `lang` = the visitor's
 * language code (server/lang-stats.js parse().lang), `now` = Date.now().
 */
function record(store, bucket, key, isNew, lang, now) {
  if (!bucket || typeof key !== 'string' || !key) return false;
  if (!bucket.sr) bucket.sr = {};
  bump(bucket.sr, key, CAP_DAY);
  if (isNew === true) {
    if (!bucket.srn) bucket.srn = {};
    bump(bucket.srn, key, CAP_DAY);
    // Source × language for NEW visitors only: the question this answers
    // is « where does a burst of new zh visitors come from ».
    if (!bucket.srl) bucket.srl = {};
    const k = (bucket.srn[key] !== undefined ? key : OVERFLOW) + ' ' + (typeof lang === 'string' && /^[a-z]{2,3}$/.test(lang) ? lang : 'other');
    bump(bucket.srl, k, CAP_DAY_LANG);
  }
  if (store && !store.refSince) store.refSince = now || Date.now();
  return true;
}

/**
 * Sums the per-day buckets (`bucketAt(i)` = bucket i days ago, or null).
 * Returns { days, all: {src:n}, nw: {src:n}, lang: {src: {lang:n}} } —
 * `days` counts the days that actually carry the series.
 */
function period(daysBack, bucketAt) {
  const out = { days: 0, all: {}, nw: {}, lang: {} };
  for (let i = 0; i < daysBack; i++) {
    const b = bucketAt(i);
    if (!b || !b.sr) continue;
    out.days++;
    for (const k in b.sr) out.all[k] = (out.all[k] || 0) + (b.sr[k] || 0);
    if (b.srn) for (const k in b.srn) out.nw[k] = (out.nw[k] || 0) + (b.srn[k] || 0);
    if (b.srl) for (const k in b.srl) {
      const sp = k.lastIndexOf(' ');
      if (sp <= 0) continue;
      const src = k.slice(0, sp), lg = k.slice(sp + 1);
      const m = out.lang[src] || (out.lang[src] = {});
      m[lg] = (m[lg] || 0) + (b.srl[k] || 0);
    }
  }
  return out;
}

module.exports = { CAP_DAY, CAP_DAY_LANG, OVERFLOW, DIRECT, cleanHost, cleanTag, cleanPage, classify, record, period };
