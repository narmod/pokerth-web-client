'use strict';
// ═══════════════════════════════════════════════════════════════════
// Visitor language — parsing of the Accept-Language header and the
// diagnostic counters behind the "other" bucket (2.1.9-web.299). Pure: no
// I/O, no clock; proxy.js stores the numbers in visits.json and
// scripts/test-lang-stats.mjs drives this module directly.
//
// The first USABLE tag of a header the browser already sends is kept: tags
// are read in order and an unusable one ("*", "und", an empty slot) is
// skipped (2.1.10-web.254; until then only the first tag was read, so
// "*, fr-FR" counted as "other"). When the header holds no language at all,
// the browser's own navigator.languages, sent with the visit ping, is read
// the same way (resolve). Nothing else is collected: no IP, no raw
// User-Agent, no fingerprint.
//
//   lang     base language, the historical statistic ("fr", "zh", "fur")
//   locale   canonical locale of a recognised language ("fr-CA",
//            "zh-Hant-TW", "es-419", or "fr" alone when no region is sent)
//   raw      for an unusable header only: what its FIRST tag was, so the
//            "other" bucket can be read — "(none)", "(empty)",
//            "(malformed)", or the tag itself ("*", "C", "x-klingon", "und")
//   skipped  for a language found past an unusable first tag: that first
//            tag, as raw would have named it
//   via      with skipped: 'tag' (a later tag of the header) or 'navigator'
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
// Tags read per header (or per navigator.languages list) before giving up:
// a real browser puts its language in the first two or three.
const MAX_TAGS = 8;
// navigator.languages as sent by the client: longer is not a language list.
const CLIENT_MAX = 128;

// Cardinality caps, per counter map (running total and each day alike).
// Past the cap a NEW key lands in "(overflow)", never in "other", so the
// language statistics themselves are untouched.
const CAP_RAW = 50;      // otherRaw* — distinct unusable values
const CAP_LOCALE = 250;  // langLocale — ~85 languages x their usual regions
const CAP_COMBO = 70;    // otherCombo — bounded by the OS x browser tables
const CAP_RECOVERED = 50; // langRecovered — first tag x where the language came from
const OVERFLOW = '(overflow)';

// One tag of the list ("fr-CA;q=0.9"): the same result as parse().
function parseTag(item) {
  // Drop the parameters (";q=0.9") before anything else: a bare "en;q=0.9"
  // used to read as unusable.
  const tag = item.split(';')[0].trim();
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

function parse(header) {
  if (header === undefined || header === null) return { lang: 'other', locale: null, raw: '(none)' };
  const items = String(header).split(',', MAX_TAGS);
  const first = parseTag(items[0]);
  if (first.lang !== 'other') return first;
  for (let k = 1; k < items.length; k++) {
    const p = parseTag(items[k]);
    if (p.lang !== 'other') return { lang: p.lang, locale: p.locale, raw: null, skipped: first.raw, via: 'tag' };
  }
  return first;
}

// The header first; navigator.languages (`client`, "fr-FR,en") only when the
// header holds no language at all. The header keeps the last word whenever
// it has one, and the client value goes through the same parser, so it
// cannot mint a key the header could not.
function resolve(header, client) {
  const h = parse(header);
  if (h.lang !== 'other' || typeof client !== 'string' || !client || client.length > CLIENT_MAX) return h;
  const c = parse(client);
  if (c.lang === 'other') return h;
  return { lang: c.lang, locale: c.locale, raw: null, skipped: h.raw, via: 'navigator' };
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
const DIAG_KEYS = ['langLocale', 'otherRaw', 'otherRawNew', 'otherRawRet', 'otherRawBot', 'otherRawClean', 'otherCombo', 'bot', 'langRecovered'];

// One ping, into one target ({ langLocale: {...}, ... }). `ctx`:
//   seenBefore  true / false / null (null: no id, neither new nor returning)
//   isBot       the User-Agent test alone — never the language
//   combo       "OS · browser", already computed for the env breakdown
function record(dst, p, ctx) {
  function m(k) { return dst[k] || (dst[k] = {}); }
  bumpCapped(m('bot'), ctx.isBot ? 'bot-like' : 'clean', 2);
  if (p.lang !== 'other') {
    if (p.locale) bumpCapped(m('langLocale'), p.locale, CAP_LOCALE);
    // Found past an unusable first tag: which one, and where the language
    // came from ("* → later tag", "(none) → navigator").
    if (p.skipped) bumpCapped(m('langRecovered'), p.skipped + (p.via === 'navigator' ? ' \u2192 navigator' : ' \u2192 later tag'), CAP_RECOVERED);
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

module.exports = { LANG_FOLD, LANG_VOID, RAW_MAX, MAX_TAGS, CLIENT_MAX, CAP_RAW, CAP_LOCALE, CAP_COMBO, CAP_RECOVERED, OVERFLOW, DIAG_KEYS,
  parse, resolve, isVoid, foldLangMap, foldEnv, noiseMeta, record, period };
