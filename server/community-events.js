'use strict';
// ═══════════════════════════════════════════════════════════════════
// Community events relay (GET /api/events) -- web extension, no QML
// counterpart. Feeds the "Events" tab of the Forum news window: what is
// coming up on the three community sites, and who won last.
//
// None of the three sites has a JSON API. All are Laravel + Vue and render
// their data into the props of a component in the page, which is public and
// needs no login (verified 2026-09-20):
//
//   bbc  /registration  <registration-component :gamedates="[…]">
//                       HTML-entity JSON: { id, step, date, num } -- `num` is
//                       the number of players signed up, `date` is naive
//                       site-local time.
//   bbc  /results       <results-component :results="[…]">
//                       { number, started, p1..p10 } -- p1 is the winner.
//   wec  /results       <results-component :results="[…]">
//                       { wec, started, p1..p10 }. WEC has no public schedule:
//                       every planning path answers 404 without a login, and
//                       /register is the account form, not a game sign-up
//                       (audited 2026-09-21).
//   bbc  /results/ranking  <ranking-component :results="[…]" :season="N">
//   wec  /results/ranking  <ranking-component :stats="[…]" :stats_year :stats_month>
//                       Rows { nickname, score, points, games }, best first:
//                       BBC ranks a season, WEC ranks the current month.
//   mc   /              <home-component :next-cup="JSON.parse('…')"
//                         :signup-count="2" :latest-cup="JSON.parse('…')">
//                       Laravel Js::from(): a JS string literal with \u0022
//                       escapes, not HTML entities. `next-cup.date` is a full
//                       ISO date with its offset (+02:00).
//
// That offset is how we know the sites run on Europe/Berlin time; the naive
// BBC/WEC dates are read in that zone. If a site ever moves, SITE_TZ is the
// one place to change.
//
// Everything here is pure (no network, no clock of its own) so that
// scripts/test-community-events.js can pin the parsing against fixtures.
// proxy.js supplies the fetcher and the cache.
// ═══════════════════════════════════════════════════════════════════

const SITE_TZ = 'Europe/Berlin';

const SOURCES = {
  bbcSchedule: 'https://bbc.pokerth.net/registration',
  bbcResults: 'https://bbc.pokerth.net/results',
  wecResults: 'https://wec.pokerth.net/results',
  mcHome: 'https://monthlycup.pokerth.net/',
  bbcRanking: 'https://bbc.pokerth.net/results/ranking',
  wecRanking: 'https://wec.pokerth.net/results/ranking'
};

const LINKS = {
  bbcRanking: 'https://bbc.pokerth.net/results/ranking',
  wecRanking: 'https://wec.pokerth.net/results/ranking',
  bbcRegister: 'https://bbc.pokerth.net/registration',
  bbcResults: 'https://bbc.pokerth.net/results',
  wecResults: 'https://wec.pokerth.net/results',
  mcRegister: 'https://monthlycup.pokerth.net/registration',
  mcHome: 'https://monthlycup.pokerth.net/'
};

const MAX_UPCOMING_BBC = 8;      // the BBC calendar holds a whole season
const MAX_NAME = 40;             // nicknames are 3-20 chars upstream; be generous, stay bounded

function decodeHtml(s) {
  return String(s).replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Raw value of one attribute of one component tag, or null. Attribute values
// never hold a bare double quote (entities or \u0022), so [^"]* is exact.
function attrOf(html, tag, attr) {
  const mt = new RegExp('<' + tag + '\\b[^>]*>', 'i').exec(String(html || ''));
  if (!mt) return null;
  const ma = new RegExp('[\\s:]' + attr + '="([^"]*)"', 'i').exec(mt[0]);
  return ma ? ma[1] : null;
}

// A prop value is either entity-encoded JSON (BBC/WEC) or a Laravel
// Js::from() expression, JSON.parse('<js string literal>') (Monthly Cup).
function propJson(raw) {
  if (raw == null) return undefined;
  const v = decodeHtml(raw).trim();
  const m = /^JSON\.parse\('([\s\S]*)'\)$/.exec(v);
  try {
    if (!m) return JSON.parse(v);
    // Un-escape the JS string literal by reading it as a JSON string: the
    // escapes Js::from() emits (\uXXXX, \\, \/) are all valid JSON escapes.
    const text = JSON.parse('"' + m[1].replace(/"/g, '\\"') + '"');
    return JSON.parse(text);
  } catch (e) { return undefined; }
}

function name(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, MAX_NAME) : null;
}

function count(v) {
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  return (Number.isFinite(n) && n >= 0 && n < 100000) ? n : null;
}

// Offset of `tz` at the instant `ms`, in ms (zone minus UTC).
function tzOffsetMs(ms, tz) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const p = {};
  for (const part of f.formatToParts(new Date(ms))) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - (ms - (ms % 1000));
}

// "2026-09-20 23:15:00" read as wall-clock time in `tz` -> epoch ms, or null.
function zonedToEpoch(str, tz) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(str || '').trim());
  if (!m) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
  try {
    let ms = guess - tzOffsetMs(guess, tz || SITE_TZ);
    // Second pass settles the hour around a DST switch.
    ms = guess - tzOffsetMs(ms, tz || SITE_TZ);
    return Number.isFinite(ms) ? ms : null;
  } catch (e) { return null; }
}

function podiumOf(row) {
  const out = [];
  for (let i = 1; i <= 3; i++) { const n = name(row['p' + i]); if (n) out.push(n); }
  return out;
}
function playersOf(row) {
  let n = 0;
  for (let i = 1; i <= 10; i++) if (name(row['p' + i])) n++;
  return n;
}

// ── parsers: html -> { ok, … } ───────────────────────────────────────

function parseBbcSchedule(html, now) {
  const arr = propJson(attrOf(html, 'registration-component', 'gamedates'));
  if (!Array.isArray(arr)) return { ok: false, error: 'parse_no_gamedates' };
  const up = [];
  for (const g of arr) {
    if (!g || typeof g !== 'object') continue;
    const at = zonedToEpoch(g.date);
    if (at === null || at < now) continue;
    const step = count(g.step);
    up.push({ src: 'bbc', kind: 'step', step: step, title: name(g.title), at: at,
      signups: count(g.num), url: LINKS.bbcRegister });
  }
  up.sort(function (a, b) { return a.at - b.at; });
  return { ok: true, upcoming: up.slice(0, MAX_UPCOMING_BBC) };
}

function parseResults(html, src, idKey, url) {
  const arr = propJson(attrOf(html, 'results-component', 'results'));
  if (!Array.isArray(arr)) return { ok: false, error: 'parse_no_results' };
  let best = null;
  for (const r of arr) {
    if (!r || typeof r !== 'object') continue;
    const at = zonedToEpoch(r.started);
    const podium = podiumOf(r);
    if (at === null || !podium.length) continue;
    if (!best || at > best.at) {
      best = { src: src, id: count(r[idKey]), at: at, podium: podium, players: playersOf(r), url: url };
    }
  }
  if (!best) return { ok: false, error: 'parse_empty' };
  return { ok: true, result: best };
}
function parseBbcResults(html) { return parseResults(html, 'bbc', 'number', LINKS.bbcResults); }
function parseWecResults(html) { return parseResults(html, 'wec', 'wec', LINKS.wecResults); }

// Leader of a ranking page plus the two runners-up. `period` says what the
// table covers, so the client can word it: { season } or { year, month }.
function parseRanking(html, src, attr, url, period) {
  const arr = propJson(attrOf(html, 'ranking-component', attr));
  if (!Array.isArray(arr)) return { ok: false, error: 'parse_no_ranking' };
  const rows = arr.filter(function (p) { return p && typeof p === 'object' && name(p.nickname); });
  if (!rows.length) return { ok: false, error: 'parse_empty' };
  const top = rows[0];
  return { ok: true, leader: { src: src, period: period, player: name(top.nickname),
    points: count(top.points), games: count(top.games),
    next: rows.slice(1, 3).map(function (p) { return name(p.nickname); }), url: url } };
}
function parseBbcRanking(html) {
  const season = count(attrOf(html, 'ranking-component', 'season'));
  return parseRanking(html, 'bbc', 'results', LINKS.bbcRanking, season ? { season: season } : {});
}
function parseWecRanking(html) {
  // Seen as bare 2026 / 09 on the live page; tolerate a quoted "09" too.
  const digits = function (a) { return count(decodeHtml(attrOf(html, 'ranking-component', a) || '').replace(/[^0-9]/g, '')); };
  const y = digits('stats_year'), m = digits('stats_month');
  const period = (y && m >= 1 && m <= 12) ? { year: y, month: m } : {};
  return parseRanking(html, 'wec', 'stats', LINKS.wecRanking, period);
}

function parseMcHome(html, now) {
  if (!/<home-component\b/i.test(String(html || ''))) return { ok: false, error: 'parse_no_home' };
  const out = { ok: true, upcoming: [], result: null };
  const next = propJson(attrOf(html, 'home-component', 'next-cup'));
  if (next && typeof next === 'object') {
    const at = Date.parse(next.date);
    if (Number.isFinite(at) && at >= now) {
      out.upcoming.push({ src: 'mc', kind: 'cup', month: count(next.month), at: at,
        signups: count(attrOf(html, 'home-component', 'signup-count')), url: LINKS.mcRegister });
    }
  }
  const last = propJson(attrOf(html, 'home-component', 'latest-cup'));
  if (last && typeof last === 'object' && Array.isArray(last.podium)) {
    const podium = last.podium.slice()
      .filter(function (p) { return p && count(p.position) !== null && name(p.playername); })
      .sort(function (a, b) { return count(a.position) - count(b.position); })
      .slice(0, 3).map(function (p) { return name(p.playername); });
    const yr = count(attrOf(html, 'home-component', 'year'));
    // Only ever link back to the cup's own site, whatever the page says.
    const rawUrl = attrOf(html, 'home-component', 'results-url');
    const resUrl = rawUrl ? decodeHtml(rawUrl) : '';
    if (podium.length) {
      out.result = { src: 'mc', month: count(last.month), year: yr, at: null, podium: podium,
        url: /^https:\/\/monthlycup\.pokerth\.net\//.test(resUrl) ? resUrl : LINKS.mcHome };
    }
  }
  return out;
}

// ── aggregation ──────────────────────────────────────────────────────
// fetchText(url) -> Promise<string>. One source failing never hides the
// others: its name lands in `errors` and the rest is served.
async function buildEvents(fetchText, now) {
  const jobs = [
    ['bbc', SOURCES.bbcSchedule, function (h) { return parseBbcSchedule(h, now); }],
    ['bbc', SOURCES.bbcResults, parseBbcResults],
    ['wec', SOURCES.wecResults, parseWecResults],
    ['mc', SOURCES.mcHome, function (h) { return parseMcHome(h, now); }],
    ['bbc_ranking', SOURCES.bbcRanking, parseBbcRanking],
    ['wec_ranking', SOURCES.wecRanking, parseWecRanking]
  ];
  const settled = await Promise.all(jobs.map(function (j) {
    return Promise.resolve().then(function () { return fetchText(j[1]); })
      .then(function (html) { return j[2](html); })
      .catch(function (e) { return { ok: false, error: String((e && e.message) || e).slice(0, 80) }; });
  }));
  const upcoming = [], results = [], leaders = [], errors = {};
  settled.forEach(function (r, i) {
    if (!r.ok) { errors[jobs[i][0] + (i === 0 ? '_schedule' : '')] = r.error; return; }
    if (r.upcoming) for (const u of r.upcoming) upcoming.push(u);
    if (r.result) results.push(r.result);
    if (r.leader) leaders.push(r.leader);
  });
  upcoming.sort(function (a, b) { return a.at - b.at; });
  const order = { bbc: 0, wec: 1, mc: 2 };
  results.sort(function (a, b) { return order[a.src] - order[b.src]; });
  leaders.sort(function (a, b) { return order[a.src] - order[b.src]; });
  const ok = upcoming.length > 0 || results.length > 0 || leaders.length > 0;
  const out = { ok: ok, at: now, tz: SITE_TZ, upcoming: upcoming, results: results, leaders: leaders };
  if (Object.keys(errors).length) out.errors = errors;
  if (!ok) out.error = 'no_data';
  return out;
}

module.exports = {
  SITE_TZ, SOURCES, LINKS,
  decodeHtml, attrOf, propJson, zonedToEpoch,
  parseBbcSchedule, parseBbcResults, parseWecResults, parseMcHome,
  parseBbcRanking, parseWecRanking,
  buildEvents
};
