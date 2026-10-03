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
//                       the number of players signed up in advance, shown by
//                       the site as "Players: num/10" (checked against
//                       /registration/date/get/<id>, whose `regs` list has
//                       `num` rows). It is NOT the attendance: most players
//                       join without signing up. `date` is naive site-local
//                       time; the same endpoint returns it in UTC, which
//                       confirms Europe/Berlin.
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
//   pth  /pthranking/ranking/cod  (www.pokerth.net) a real JSON array, best
//                       first: [{ username, url, score, games }] -- the
//                       "Champions of the Day" box of the forum home page
//                       (checked 2026-09-22). We keep the top three.
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
  wecRanking: 'https://wec.pokerth.net/results/ranking',
  pthCod: 'https://www.pokerth.net/pthranking/ranking/cod'
};

const LINKS = {
  bbcRanking: 'https://bbc.pokerth.net/results/ranking',
  wecRanking: 'https://wec.pokerth.net/results/ranking',
  bbcRegister: 'https://bbc.pokerth.net/registration',
  bbcResults: 'https://bbc.pokerth.net/results',
  wecResults: 'https://wec.pokerth.net/results',
  mcRegister: 'https://monthlycup.pokerth.net/registration',
  mcHome: 'https://monthlycup.pokerth.net/',
  pthLeaderboard: 'https://www.pokerth.net/app.php/leaderboard'
};

const BBC_SEATS = 10;            // the BBC calendar itself labels a game "Players: n/10"
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
    up.push({ src: 'bbc', kind: 'step', id: count(g.id), step: step, title: name(g.title), at: at,
      signups: count(g.num), seats: BBC_SEATS, url: LINKS.bbcRegister });
  }
  up.sort(function (a, b) { return a.at - b.at; });
  return { ok: true, upcoming: up.slice(0, MAX_UPCOMING_BBC) };
}

// Registrations of one BBC game: GET /registration/date/get/<id>, JSON
// { success, date: { regs: [{ player: { nickname, admin } }] } } -- the endpoint
// the QML client reads (BbcGameDates.qml loadRegs). Admins get a gold tag.
const MAX_REGS = 20;
function bbcRegsUrl(id) { return 'https://bbc.pokerth.net/registration/date/get/' + id; }
function parseBbcRegs(text) {
  let j;
  try { j = JSON.parse(String(text)); } catch (e) { j = null; }
  if (!j || j.success !== true || !j.date || !Array.isArray(j.date.regs)) return { ok: false, error: 'parse_no_regs' };
  const players = [];
  for (const r of j.date.regs) {
    const p = r && r.player;
    const n = p && name(p.nickname);
    if (n) players.push({ nick: n, admin: p.admin === true });
    if (players.length >= MAX_REGS) break;
  }
  return { ok: true, players: players };
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

// Champions of the Day (official server): top three of the JSON array.
function parseCod(text) {
  let arr;
  try { arr = JSON.parse(text); } catch (e) { return { ok: false, error: 'parse_json' }; }
  if (!Array.isArray(arr)) return { ok: false, error: 'parse_shape' };
  const top = arr.filter(function (p) { return p && typeof p === 'object' && name(p.username); })
    .slice(0, 3).map(function (p) {
      return { player: name(p.username),
        score: (typeof p.score === 'number' && Number.isFinite(p.score)) ? Math.round(p.score * 100) / 100 : null,
        games: count(p.games) };
    });
  if (!top.length) return { ok: false, error: 'parse_no_rows' };
  return { ok: true, champions: { top: top, url: LINKS.pthLeaderboard } };
}

// ── WEC finals, from their forum announcement (web.292) ──────────────
// WEC has no public schedule, but its monthly and yearly finals are announced
// on the pokerth.net forum (topic « WEC Monthly and Yearly Grand Finals »),
// always in the same shape:
//   The finals for September 2026 are scheduled for Sunday 04th October 2026
//   22:00 CEST (20:00 UTC)
//   Table Set-up: Starting Money: $ 10,000 · First Small Blind: $ 50 ·
//   Delay: 7 s · time for Action: 15 s · Blind level increasing: double every 25th hand
//   … qualified directly: one line per player, « Nick: …, won 7 of 22 games
//   in September, 1st Place in monthly WEC ranking. »
//   Replacement Players are: « 11th DerSchlesier », « 13th - »
// The forum feed (proxy.js) hands the posts in; this reads them. Quoted older
// announcements (<blockquote>) are ignored. Nothing recognised = null: the
// Events tab simply has no final, as before.
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MAX_FINALISTS = 12, MAX_RESERVES = 6;

/** Post HTML -> plain text, one line per line of the post. */
function postText(html) {
  let s = String(html || '');
  // quoted posts are someone else's (an older announcement): never read them
  for (let i = 0; i < 4 && /<blockquote\b/i.test(s); i++) s = s.replace(/<blockquote\b[^>]*>(?:(?!<blockquote\b)[\s\S])*?<\/blockquote>/gi, '\n');
  s = s.replace(/<(?:br|hr)\b[^>]*>/gi, '\n').replace(/<\/(?:p|div|li|h\d|tr)>/gi, '\n').replace(/<[^>]+>/g, '');
  s = decodeHtml(s.replace(/&nbsp;/gi, ' ').replace(/&#(\d+);/g, function (m, d) { const c = +d; return c > 31 && c < 0x110000 ? String.fromCodePoint(c) : ' '; }));
  return s.split(/\r?\n/).map(function (l) { return l.replace(/[ \t\u00a0]+/g, ' ').trim(); }).join('\n');
}

function numberIn(str) {
  const m = /(\d[\d,.' ]*)/.exec(String(str || ''));
  if (!m) return null;
  return count(m[1].replace(/[,.' ]/g, ''));
}

/** « 04th October 2026 22:00 CEST (20:00 UTC) » -> epoch ms, UTC time preferred. */
function finalDate(text) {
  const m = /(\d{1,2})(?:st|nd|rd|th)?\.?\s+([A-Za-z]+)\s+(\d{4})\D{0,12}?(\d{1,2})[:.](\d{2})\s*([A-Z]{2,5})?(?:\s*\((\d{1,2})[:.](\d{2})\s*UTC\))?/.exec(text);
  if (!m) return null;
  const mon = MONTHS.indexOf(m[2].toLowerCase());
  if (mon < 0) return null;
  const y = +m[3], d = +m[1];
  if (m[7] != null) {
    // the UTC time given in brackets; the day may have rolled back (00:30 CEST = 22:30 UTC the day before)
    let at = Date.UTC(y, mon, d, +m[7], +m[8]);
    const local = zonedToEpoch(y + '-' + String(mon + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') + ' ' + String(+m[4]).padStart(2, '0') + ':' + m[5]);
    if (local !== null && Math.abs(at - local) > 12 * 3600000) at += (local > at ? 1 : -1) * 86400000;
    return at;
  }
  return zonedToEpoch(y + '-' + String(mon + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') + ' ' + String(+m[4]).padStart(2, '0') + ':' + m[5]);
}

/**
 * One forum post -> a WEC final event, or null.
 * post = { title, link, forum, date, html } (the relay's forum feed entry).
 */
function parseWecFinalPost(post) {
  if (!post || typeof post !== 'object') return null;
  const head = String(post.title || '') + ' ' + String(post.forum || '');
  const text = postText(post.html);
  // « The finals for September 2026 are scheduled for … » / « The Grand Final 2026 is scheduled for … »
  const sm = /\b(?:the\s+)?(grand\s+finals?|finals?)\b([^\n]{0,60}?)\b(?:is|are)\s+scheduled\s+for\b([^\n]*)/i.exec(text);
  if (!sm || !/\bwec\b|\bwecup/i.test(head + ' ' + text.slice(0, 400))) return null;
  const at = finalDate(sm[3]);
  if (at === null) return null;
  const grand = /grand/i.test(sm[1]);
  const pm = /([A-Za-z]+)\s+(\d{4})/.exec(sm[2]);
  let month = null, year = null;
  if (pm && MONTHS.indexOf(pm[1].toLowerCase()) >= 0) { month = MONTHS.indexOf(pm[1].toLowerCase()) + 1; year = +pm[2]; }
  else { const yy = /(\d{4})/.exec(sm[2]); if (yy) year = +yy[1]; }
  const ev = { src: 'wec', kind: 'final', grand: grand, month: month, year: year, at: at,
    id: 'wecfinal:' + at, url: /^https:\/\/(www\.)?pokerth\.net\//.test(String(post.link || '')) ? String(post.link) : LINKS.wecResults };
  // table set-up
  const field = function (re) { const m = re.exec(text); return m ? m[1] : null; };
  const setup = {
    stack: numberIn(field(/starting\s+(?:money|cash|stack)\s*:\s*([^\n]+)/i)),
    blind: numberIn(field(/first\s+small\s+blind\s*:\s*([^\n]+)/i)),
    delay: numberIn(field(/delay\s*:\s*([^\n]+)/i)),
    timeout: numberIn(field(/time\s+for\s+action\s*:\s*([^\n]+)/i)),
    raiseEvery: numberIn(field(/blind\s+level\s+increas\w*\s*:[^\n]*?every\s+([^\n]+)/i))
  };
  if (Object.keys(setup).some(function (k) { return setup[k] !== null; })) ev.setup = setup;
  // qualified players: the lines after « qualified directly », until the replacements
  const lines = text.split('\n');
  let i = lines.findIndex(function (l) { return /qualified/i.test(l); });
  const qualified = [], reserves = [];
  if (i >= 0) {
    for (i++; i < lines.length && qualified.length < MAX_FINALISTS; i++) {
      const l = lines[i];
      if (!l) continue;
      if (/replacement|reserve|substitute|good luck/i.test(l)) break;
      const mm = /^([^:\n]{2,40}?)\s*:\s*(.*)$/.exec(l);
      if (!mm) continue;
      const nick = name(mm[1]);
      if (!nick) continue;
      const won = /won\s+(\d+)\s+of\s+(\d+)\s+games/i.exec(mm[2]);
      const place = /(\d+)(?:st|nd|rd|th)\s+place/i.exec(mm[2]);
      qualified.push({ nick: nick, place: place ? +place[1] : qualified.length + 1,
        won: won ? +won[1] : null, games: won ? +won[2] : null });
    }
    const r = lines.findIndex(function (l) { return /replacement|reserve|substitute/i.test(l); });
    if (r >= 0) {
      for (let k = r + 1; k < lines.length && reserves.length < MAX_RESERVES; k++) {
        const l = lines[k];
        if (!l) continue;
        const rm = /^(\d+)(?:st|nd|rd|th)\.?\s+(.+)$/.exec(l);
        if (!rm) break;
        const nick = name(rm[2]);
        if (nick && !/^[-\u2013\u2014.?]+$/.test(nick)) reserves.push({ nick: nick, place: +rm[1] });
      }
    }
  }
  if (qualified.length) ev.qualified = qualified;
  if (reserves.length) ev.reserves = reserves;
  return ev;
}

/**
 * The WEC finals announced in these posts and in the ones kept from before
 * (`kept`, the relay's memory: the feed only holds the latest posts), newest
 * announcement first for the same final, past ones dropped (6 h after the start).
 */
function wecFinals(posts, kept, now) {
  const byAt = new Map();
  const add = function (e, when) {
    if (!e || typeof e.at !== 'number' || e.at < now - 6 * 3600000) return;
    const k = e.grand ? 'g' + (e.year || '') : 'm' + (e.year || '') + '-' + (e.month || '');
    const old = byAt.get(k);
    if (!old || when >= old.when) byAt.set(k, { e: e, when: when });
  };
  (Array.isArray(kept) ? kept : []).forEach(function (e) { add(e, e && e.posted ? e.posted : 0); });
  (Array.isArray(posts) ? posts : []).forEach(function (p) {
    let e = null;
    try { e = parseWecFinalPost(p); } catch (x) { e = null; }
    const when = Date.parse(p && p.date) || 0;
    if (e) { e.posted = when; add(e, when); }
  });
  return Array.from(byAt.values()).map(function (v) { return v.e; }).sort(function (a, b) { return a.at - b.at; });
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
    // The BBC / WEC ranking pages are no longer read (web.253): nothing shows
    // `leaders` since the leaders card left in web.242, and those two slow pages
    // held back every round. parseBbcRanking / parseWecRanking stay exported
    // (tested); `leaders` stays in the payload, empty, for older clients.
    ['cod', SOURCES.pthCod, parseCod]
  ];
  const settled = await Promise.all(jobs.map(function (j) {
    return Promise.resolve().then(function () { return fetchText(j[1]); })
      .then(function (html) { return j[2](html); })
      .catch(function (e) { return { ok: false, error: String((e && e.message) || e).slice(0, 80) }; });
  }));
  const upcoming = [], results = [], leaders = [], errors = {};
  let champions = null;
  settled.forEach(function (r, i) {
    if (!r.ok) { errors[jobs[i][0] + (i === 0 ? '_schedule' : '')] = r.error; return; }
    if (r.upcoming) for (const u of r.upcoming) upcoming.push(u);
    if (r.result) results.push(r.result);
    if (r.leader) leaders.push(r.leader);
    if (r.champions) champions = r.champions;
  });
  upcoming.sort(function (a, b) { return a.at - b.at; });
  const order = { bbc: 0, wec: 1, mc: 2 };
  results.sort(function (a, b) { return order[a.src] - order[b.src]; });
  leaders.sort(function (a, b) { return order[a.src] - order[b.src]; });
  const ok = upcoming.length > 0 || results.length > 0 || leaders.length > 0 || !!champions;
  const out = { ok: ok, at: now, tz: SITE_TZ, upcoming: upcoming, results: results, leaders: leaders };
  if (champions) out.champions = champions;
  if (Object.keys(errors).length) out.errors = errors;
  if (!ok) out.error = 'no_data';
  return out;
}

module.exports = {
  SITE_TZ, SOURCES, LINKS,
  decodeHtml, attrOf, propJson, zonedToEpoch,
  parseBbcSchedule, parseBbcResults, parseWecResults, parseMcHome,
  parseBbcRanking, parseWecRanking, parseCod,
  bbcRegsUrl, parseBbcRegs,
  postText, parseWecFinalPost, wecFinals,
  buildEvents
};
