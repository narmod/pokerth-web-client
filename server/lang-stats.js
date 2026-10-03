'use strict';
// ═══════════════════════════════════════════════════════════════════
// Visitor language — parsing of the Accept-Language header and the
// diagnostic counters behind the "other" bucket (2.1.9-web.299). Pure: no
// I/O, no clock; proxy.js stores the numbers in visits.json and
// scripts/test-lang-stats.mjs drives this module directly.
//
// Only the FIRST tag of a header the browser already sends is read. Nothing
// else is collected: no IP, no raw User-Agent, no fingerprint.
//
//   lang     base language, the historical statistic ("fr", "zh", "fur")
//   locale   canonical locale of a recognised language ("fr-CA",
//            "zh-Hant-TW", "es-419", or "fr" alone when no region is sent)
//   raw      for an unusable header only: what was received, so the "other"
//            bucket can be read — "(none)", "(empty)", "(malformed)", or the
//            tag itself ("*", "C", "x-klingon", "und")
//
// A valid 2-3 letter ISO 639 code keeps its own key even when PokerTH has
// no translation for it (fur stays fur): that is how new languages are
// discovered. "other" is reserved for values that cannot be a language.
// ═══════════════════════════════════════════════════════════════════

// Retired codes still sent by some Android / Java stacks. Applied when a
// ping is recorded AND when stored maps are read (foldLangMap), so history
// recorded under the old code reads together with the new one — no
// migration of the stored file. "no" is deliberately absent: it is the
// generic Norwegian code, nb is Bokmål only; both stay distinct.
const LANG_FOLD = Object.freeze({ iw: 'he', in: 'id', tl: 'fil', ji: 'yi', mo: 'ro', jw: 'jv' });
// ISO 639 codes that name no language: undetermined, multiple, no
// linguistic content, uncoded. Plus the private-use range qaa..qtz.
const LANG_VOID = Object.freeze({ und: 1, mul: 1, zxx: 1, mis: 1 });
function isVoid(l) { return LANG_VOID[l] === 1 || /^q[a-t][a-z]$/.test(l); }

// A first tag longer than this, or holding anything outside the BCP-47 /
// POSIX alphabet, is stored as "(malformed)": a client cannot mint keys.
const RAW_MAX = 35;
const RAW_OK = /^[A-Za-z0-9_\-.@*]+$/;

// Cardinality caps, per counter map (running total and each day alike).
// Past the cap a NEW key lands in "(overflow)", never in "other", so the
// language statistics themselves are untouched.
const CAP_RAW = 50;      // otherRaw* — distinct unusable values
const CAP_LOCALE = 250;  // langLocale — ~85 languages x their usual regions
const CAP_COMBO = 70;    // otherCombo — bounded by the OS x browser tables
const OVERFLOW = '(overflow)';

function parse(header) {
  if (header === undefined || header === null) return { lang: 'other', locale: null, raw: '(none)' };
  const s = String(header);
  const comma = s.indexOf(',');
  const first = comma < 0 ? s : s.slice(0, comma);
  // Drop the parameters (";q=0.9") before anything else: a bare "en;q=0.9"
  // used to read as unusable.
  const tag = first.split(';')[0].trim();
  if (!tag) return { lang: 'other', locale: null, raw: '(empty)' };
  if (tag.length > RAW_MAX || !RAW_OK.test(tag)) return { lang: 'other', locale: null, raw: '(malformed)' };
  // POSIX locales ("en_US.UTF-8", "de_DE@euro"): codeset and modifier go,
  // the underscore becomes the BCP-47 hyphen.
  const parts = tag.replace(/[.@].*$/, '').replace(/_/g, '-').split('-');
  let base = (parts[0] || '').toLowerCase();
  if (!/^[a-z]{2,3}$/.test(base)) return { lang: 'other', locale: null, raw: tag };
  base = LANG_FOLD[base] || base;
  if (isVoid(base)) return { lang: 'other', locale: null, raw: tag };
  // language [-extlang] [-Script] [-Region]; variants, extensions and
  // private-use subtags end the locale ("de-DE-1996" → de-DE).
  let script = '', region = '', i = 1;
  if (parts[i] && /^[A-Za-z]{3}$/.test(parts[i])) i++;                 // extlang (zh-yue-HK)
  if (parts[i] && /^[A-Za-z]{4}$/.test(parts[i])) {
    script = parts[i][0].toUpperCase() + parts[i].slice(1).toLowerCase(); i++;
  }
  if (parts[i] && (/^[A-Za-z]{2}$/.test(parts[i]) || /^\d{3}$/.test(parts[i]))) region = parts[i].toUpperCase();
  return { lang: base, locale: [base, script, region].filter(Boolean).join('-'), raw: null };
}

// Same rule as parse(), applied to a stored { code: count } map: retired
// codes add up under their successor, codes naming no language join
// "other". A new object; the stored map is never touched.
function foldLangMap(m) {
  if (!m || typeof m !== 'object') return m;
  const out = {};
  for (const k in m) {
    let k2 = LANG_FOLD[k] || k;
    if (k2 !== 'other' && isVoid(k2)) k2 = 'other';
    out[k2] = (out[k2] || 0) + (m[k] || 0);
  }
  return out;
}
// The running totals as the dashboard reads them: the three language maps
// folded, everything else passed through.
function foldEnv(env) {
  if (!env || typeof env !== 'object') return env;
  const out = {};
  for (const k in env) out[k] = (k === 'lang' || k === 'langNew' || k === 'langRet') ? foldLangMap(env[k]) : env[k];
  return out;
}

// env.noise counted "automated User-Agent OR unusable language header" until
// 2.1.9-web.299, which made every "other" ping bot-like by construction. It
// is kept as recorded and no longer incremented; env.bot (User-Agent alone)
// replaces it. Said in the summary, beside the counter, so that nobody reads
// a frozen number as a live one months later.
function noiseMeta(frozenSince) {
  return { legacy: true, frozen: true, replacedBy: 'bot', frozenSince: frozenSince || 0,
    rule: 'automated User-Agent OR unusable Accept-Language (until 2.1.9-web.299)' };
}

function bumpCapped(dst, key, cap) {
  if (dst[key] === undefined && Object.keys(dst).length >= cap) key = OVERFLOW;
  dst[key] = (dst[key] || 0) + 1;
}

// The diagnostic maps, by name. The running totals live beside lang in
// visitsStore.env; each day keeps the same maps under bucket.ld.
const DIAG_KEYS = ['langLocale', 'otherRaw', 'otherRawNew', 'otherRawRet', 'otherRawBot', 'otherRawClean', 'otherCombo', 'bot'];

// One ping, into one target ({ langLocale: {...}, ... }). `ctx`:
//   seenBefore  true / false / null (null: no id, neither new nor returning)
//   isBot       the User-Agent test alone — never the language
//   combo       "OS · browser", already computed for the env breakdown
function record(dst, p, ctx) {
  function m(k) { return dst[k] || (dst[k] = {}); }
  bumpCapped(m('bot'), ctx.isBot ? 'bot-like' : 'clean', 2);
  if (p.lang !== 'other') {
    if (p.locale) bumpCapped(m('langLocale'), p.locale, CAP_LOCALE);
    return;
  }
  bumpCapped(m('otherRaw'), p.raw, CAP_RAW);
  if (ctx.seenBefore === true) bumpCapped(m('otherRawRet'), p.raw, CAP_RAW);
  else if (ctx.seenBefore === false) bumpCapped(m('otherRawNew'), p.raw, CAP_RAW);
  bumpCapped(m(ctx.isBot ? 'otherRawBot' : 'otherRawClean'), p.raw, CAP_RAW);
  if (ctx.combo) bumpCapped(m('otherCombo'), ctx.combo, CAP_COMBO);
}

// Sum of the per-day maps (each `ld` is one day's bucket.ld). `days` counts
// the days that carry them, so the page can say how far the series goes.
function period(lds) {
  const out = { days: 0 };
  DIAG_KEYS.forEach(function (k) { out[k] = {}; });
  lds.forEach(function (ld) {
    if (!ld) return;
    out.days++;
    DIAG_KEYS.forEach(function (k) {
      const src = ld[k];
      if (src) for (const x in src) out[k][x] = (out[k][x] || 0) + (src[x] || 0);
    });
  });
  return out;
}

module.exports = { LANG_FOLD, LANG_VOID, RAW_MAX, CAP_RAW, CAP_LOCALE, CAP_COMBO, OVERFLOW, DIAG_KEYS,
  parse, isVoid, foldLangMap, foldEnv, noiseMeta, record, period };
