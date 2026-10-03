// @ts-check
// ═══════════════════════════════════════════════════════════════════
// "Events" tab of the Forum news window — web extension, no QML
// counterpart. Shows what is coming up on the community sites (BBC step
// games with their sign-up count, the next Monthly Cup), who won last
// (BBC / WEC / Monthly Cup podium); the leaders card is gone since web.242
// (the rankings have their own window). WEC publishes no schedule: its daily game (22:00 server time, no
// registration — sp0ck, 28/09/2026) is added to each evening by evWecDaily.
// Its monthly / yearly finals come from their forum announcement (relay,
// web.292): a row that unfolds to the table set-up and the qualified players.
//
// Data: GET /api/events, the relay in proxy.js (server/community-events.js)
// that reads the three sites once per five minutes for everyone. Times come
// as epoch ms and are shown in the PLAYER's zone and language: a game
// announced for 23:15 in Berlin reads 22:15 in Lisbon.
//
// Purely additive. The tab bar is hidden by the existing "Show community
// content (BBC / WEC)" option (body.adv-no-communitycontent), and when the
// relay has nothing to say the tab shows a one-line message; the Posts tab
// never depends on this module.
//
// Rows reuse the list look of forumnews.mjs (.fn-row / .fn-forum / .fn-main)
// so both tabs read as one window.
// ═══════════════════════════════════════════════════════════════════
import { esc } from './misc.mjs';
import { lobbyClockNow, lcCity, lcLabels } from './lobby-clock.mjs';

const EVENTS_URL = '/api/events';
const CLIENT_TTL_MS = 2 * 60 * 1000;   // the relay caches 5 min; this only spares tab flips
const DAY_MS = 86400000;

let _cache = null;                     // { at, data }
let _fetching = null;

// ── Pure helpers (exported for scripts/test-forum-events.mjs) ──────────
const SRC = {
  bbc: { name: 'BBC', cls: 'fn-c0' },
  wec: { name: 'WEC', cls: 'fn-c1' },
  mc: { name: 'Monthly Cup', cls: 'fn-c5' }
};
export function evSrcName(src) { return (SRC[src] || {}).name || String(src || '').toUpperCase(); }
export function evSrcClass(src) { return (SRC[src] || {}).cls || 'fn-c7'; }

function _dayStart(ms) { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); }

// "today · 21 Sep · 23:15" / "tomorrow · 22 Sep · 01:00" / "Sat, 26 Sep · 20:00",
// in the given locale. Day distance is counted on the local calendar, not in
// 24 h blocks: a game at 01:00 seen at 23:00 is "tomorrow", not "today". The
// relative word always comes with its date: "tomorrow" read just after midnight
// is ambiguous, and a player planning an evening thinks in dates.
export function evWhen(ms, now, locale) {
  if (typeof ms !== 'number' || !isFinite(ms)) return '';
  const loc = locale || undefined;
  let time = '';
  try { time = new Date(ms).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' }); } catch (e) { time = ''; }
  const days = Math.round((_dayStart(ms) - _dayStart(now)) / DAY_MS);
  let day = '';
  if (days >= -1 && days <= 1) {
    try { day = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' }).format(days, 'day'); } catch (e) { day = ''; }
    if (day) {
      let date = '';
      try { date = new Date(ms).toLocaleDateString(loc, { day: 'numeric', month: 'short' }); } catch (e) { date = ''; }
      // Same neutral separator as the rest of the line: a comma reads wrong in
      // Japanese, Arabic and other scripts.
      if (date) day += ' \u00b7 ' + date;
    }
  }
  if (!day) {
    try { day = new Date(ms).toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { day = ''; }
  }
  return day && time ? day + ' \u00b7 ' + time : (day || time);
}

// Month number (1-12) -> its name in the locale; '' when out of range.
export function evMonthName(month, locale, year) {
  if (!(month >= 1 && month <= 12)) return '';
  try {
    const s = new Date(year || 2026, month - 1, 15).toLocaleDateString(locale || undefined, { month: 'long' });
    return year ? s + ' ' + year : s;
  } catch (e) { return ''; }
}

// Title of an upcoming row. `stepWord` is the translated "Step".
// `words` = { final: 'Monthly final · {month}', grand: 'Grand final {year}' } (WEC finals).
export function evUpcomingTitle(e, locale, stepWord, words) {
  if (!e) return '';
  if (e.src === 'mc') return evMonthName(e.month, locale) || evSrcName('mc');
  if (e.kind === 'final') {
    const w = words || {};
    if (e.grand) return String(w.grand || 'Grand final {year}').replace('{year}', e.year ? String(e.year) : '').trim();
    return String(w.final || 'Monthly final \u00b7 {month}').replace('{month}', evMonthName(e.month, locale, e.year) || (e.year ? String(e.year) : '')).replace(/\s*\u00b7\s*$/, '');
  }
  const parts = [];
  if (e.step != null) parts.push((stepWord || 'Step') + ' ' + e.step);
  if (e.title) parts.push(e.title);
  return parts.join(' \u00b7 ') || evSrcName(e.src);
}

// Step badge of a BBC game, shown next to the BBC source badge, colours of the
// QML BBC tab (ForumNewsPage.qml stepColor, pokerth/pokerth f0ea7de):
// "STEP 1".."STEP 4", always in English (the cup's own word, like the table
// presets). null = no step (special game, other sources).
export function evStepBadge(e) {
  if (!e || e.src !== 'bbc') return null;
  const s = e.step;
  return (s >= 1 && s <= 4) ? { text: 'STEP ' + s, cls: 'fn-forum ev-stepb ev-step' + s } : null;
}

// ── Day grouping of the Upcoming list (QML BbcGameDates.qml _gameDay/dayLabel) ──
// Key "YYYY-MM-DD" of the game evening, read on the BBC site's clock
// (Europe/Berlin): a game before 14:00 there (the 01:00 game) belongs to the
// evening of the previous day, as on the BBC calendar.
const GAME_TZ = 'Europe/Berlin';
// Wall clock of `ms` in GAME_TZ: { year, month, day, hour, minute } (numbers), or null.
function _gameWall(ms) {
  try {
    const p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: GAME_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = +x.value; });
    return p;
  } catch (e) { return null; }
}
export function evGameDay(ms) {
  if (typeof ms !== 'number' || !isFinite(ms)) return '';
  const p = _gameWall(ms);
  if (!p) return '';
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day));
  if (p.hour < 14) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// What the community site shows for this game, when the player's clock reads
// otherwise: the site's evening (weekday + day) and the Berlin time. The BBC
// calendar files a 01:00 game under the evening before, so does this. '' when
// the player is on Berlin time (nothing to translate).
export function evBerlinRef(ms, locale) {
  if (typeof ms !== 'number' || !isFinite(ms)) return null;
  const loc = locale || undefined;
  let mine = '', srv = '';
  try {
    mine = new Date(ms).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    srv = new Date(ms).toLocaleString('en-GB', { timeZone: GAME_TZ, weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  } catch (e) { return null; }
  if (mine === srv) return null;
  const k = evGameDay(ms).split('-');
  let day = '', time = '';
  try {
    day = new Date(Date.UTC(+k[0], +k[1] - 1, +k[2], 12)).toLocaleDateString(loc, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });
    time = new Date(ms).toLocaleTimeString(loc, { timeZone: GAME_TZ, hour: '2-digit', minute: '2-digit' });
  } catch (e) { return null; }
  return { day: day, time: time };
}

// Epoch ms of a GAME_TZ wall time (summer / winter time handled by Intl).
export function evGameTimeToUtc(y, mo, d, h, mi) {
  const want = Date.UTC(y, mo - 1, d, h, mi);
  let t = want - 3600000;
  for (let i = 0; i < 3; i++) {
    const p = _gameWall(t);
    if (!p) return NaN;
    const diff = want - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    if (!diff) break;
    t += diff;
  }
  return t;
}

// WEC daily game, one per evening from day key `from` to `to` (inclusive):
// 22:00 server time, no registration.
const WEC_DAILY_HOUR = 22;
const WEC_URL = 'https://wec.pokerth.net/';
export function evWecDaily(from, to) {
  const out = [];
  const a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(from || '')), b = /^\d{4}-\d{2}-\d{2}$/.test(String(to || ''));
  if (!a || !b) return out;
  const d = new Date(Date.UTC(+a[1], +a[2] - 1, +a[3]));
  for (let i = 0; i < 14 && d.toISOString().slice(0, 10) <= to; i++) {
    const at = evGameTimeToUtc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), WEC_DAILY_HOUR, 0);
    if (isFinite(at)) out.push({ src: 'wec', kind: 'daily', at: at, url: WEC_URL });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

// Section header: "Aujourd'hui · lundi, 28/09/2026", "Demain · …", then the
// bare date. Distance counted from the player's local today, as in QML.
export function evDayLabel(key, now, locale) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
  if (!m) return '';
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  const loc = locale || undefined;
  let name = '';
  try { name = d.toLocaleDateString(loc, { weekday: 'long' }) + ', ' + d.toLocaleDateString(loc); } catch (e) { name = key; }
  const diff = Math.round((d.getTime() - _dayStart(now)) / DAY_MS);
  if (diff === 0 || diff === 1) {
    let rel = '';
    try { rel = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' }).format(diff, 'day'); } catch (e) { rel = ''; }
    if (rel) return rel.charAt(0).toLocaleUpperCase(loc) + rel.slice(1) + ' \u00b7 ' + name;
  }
  return name;
}

// Time of a game row, in the player's zone and language.
export function evTime(ms, locale) {
  try { return new Date(ms).toLocaleTimeString(locale || undefined, { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
}

// Meta line of a result row: "#9743 · 2. ElmoEGO · 3. il Buono · yesterday · 21:45".
export function evResultMeta(r, now, locale) {
  if (!r) return '';
  const parts = [];
  if (r.src === 'mc') { const m = evMonthName(r.month, locale, r.year); if (m) parts.push(m); }
  else if (r.id != null) parts.push('#' + r.id);
  const pod = Array.isArray(r.podium) ? r.podium : [];
  for (let i = 1; i < pod.length && i < 3; i++) parts.push((i + 1) + '. ' + pod[i]);
  if (typeof r.at === 'number') { const w = evWhen(r.at, now, locale); if (w) parts.push(w); }
  return parts.join(' \u00b7 ');
}

// Sign-up text of an upcoming row. With a known table size it reads like the
// BBC calendar itself ("4/10"): these are advance sign-ups, not attendance, and
// the scale says so better than a bare number. Otherwise the translated label.
export function evSignupText(e, label) {
  if (!e || e.signups == null) return '';
  if (e.seats > 0) return e.signups + '/' + e.seats;
  return String(label || 'Signed up: {n}').replace('{n}', String(e.signups));
}

// Sign-ups of a BBC game in full words, as QML BbcGameDates.playersText:
// "1 player registered" / "3 players registered" (singular only for 1).
export function evPlayersText(n, one, many) {
  const k = typeof n === 'number' && isFinite(n) ? n : 0;
  return k === 1 ? String(one || '1 player registered')
    : String(many || '{n} players registered').replace('{n}', String(k));
}

// Server clock line on top of the tab: "Server time (Berlin): 14:05", plus the
// player's own time when it differs — the event times below are shown in the
// player's zone, the community sites announce them in server time.
// `words` = { title, yours } (existing lobby-clock keys).
export function evClockText(now, tz, locale, words) {
  if (typeof now !== 'number' || !tz) return '';
  const w = words || {};
  const fmt = function (zone) {
    try { return new Intl.DateTimeFormat(locale || undefined, { hour: '2-digit', minute: '2-digit', timeZone: zone }).format(new Date(now)); }
    catch (e) { return ''; }
  };
  const srv = fmt(tz);
  if (!srv) return '';
  let txt = lcLabels(w.title || 'Server time', lcCity(tz), srv).wide;
  const mine = fmt(undefined);
  if (mine && mine !== srv) txt += ' \u00b7 ' + (w.yours || 'Your time') + ' ' + mine;
  return txt;
}

// Only ever link to the community sites and pokerth.net, whatever the relay says.
export function evSafeUrl(u) {
  return /^https:\/\/(bbc|wec|monthlycup|www)\.pokerth\.net\//.test(String(u || '')) ? String(u) : '';
}

// ── Runtime ─────────────────────────────────────────────────────────
function _t(key, fallback, params) {
  try { if (typeof window.t === 'function') { const v = window.t(key, params); if (v && v !== key) return v; } } catch (e) {}
  return params ? String(fallback).replace(/\{(\w+)\}/g, function (m, k) { return params[k] != null ? String(params[k]) : m; }) : fallback;
}

function _locale() {
  let l = '';
  try { l = String(window._lang || ''); } catch (e) {}
  if (!l) { try { l = document.documentElement.lang || ''; } catch (e) {} }
  // Catalogue codes are lower case (pt-br, zh-tw); Intl wants pt-BR, zh-TW.
  const m = /^([a-z]{2,3})(?:-([a-z0-9]{2,4}))?$/i.exec(l);
  if (!m) return undefined;
  const tag = m[1].toLowerCase() + (m[2] ? '-' + m[2].toUpperCase() : '');
  try { return Intl.DateTimeFormat.supportedLocalesOf([tag]).length ? tag : undefined; } catch (e) { return undefined; }
}

function _setOff(off) {
  try { document.body.classList.toggle('ev-relay-off', off); } catch (e) {}
}

function _fetch(force) {
  const now = Date.now();
  if (!force && _cache && (now - _cache.at) < CLIENT_TTL_MS) return Promise.resolve(_cache.data);
  if (_fetching) return _fetching;
  _fetching = fetch(EVENTS_URL, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http_' + r.status); return r.json(); })
    .then(function (j) {
      // Turned off in the admin dashboard (web.254): body.ev-relay-off hides
      // the Events tab like the "community content" option does.
      _setOff(!!(j && j.error === 'disabled'));
      if (!j || j.ok !== true) throw new Error((j && j.error) || 'no_data');
      _cache = { at: Date.now(), data: j };
      return j;
    })
    .finally(function () { _fetching = null; });
  return _fetching;
}

const ICON_OUT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>';
const ICON_CUP = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-inline-end:5px"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8.5 20h7"/></svg>';

// Section icons of the category cards (stroke, currentColor).
function _ico(d) { return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; }
const ICON_CAL = _ico('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>');
const ICON_FLAG = _ico('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>');
const ICON_CLOCK = _ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
const ICON_SUN = _ico('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');

const ICON_CROWN = '<svg class="ev-pod-crown" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l4.5 4L12 5l4.5 6L21 7l-2 11H5L3 7z"/></svg>';

// Champions of the Day (official server): a small podium (2 · 1 · 3), each step
// tinted gold / silver / bronze with its rank inside; the whole podium links to
// the pokerth.net leaderboard. DOM order stays 1 · 2 · 3 (screen readers, fewer
// than three players); the podium order is done in CSS (grid columns).
// Since web.130 it is shown above the PokerTH ranking (evShowChampions below),
// no longer in the Events tab.
function _champions(c) {
  const top = (c && Array.isArray(c.top) ? c.top : []).filter(function (p) { return p && p.player; }).slice(0, 3);
  if (!top.length) return '';
  const safe = evSafeUrl(c.url);
  const open = _t('evOpenSite', 'Open the site');
  let body = '<a class="ev-cod ev-pod"' + (safe ? ' href="' + esc(safe).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer"' : '')
    + ' title="' + esc(open).replace(/"/g, '&quot;') + '">';
  top.forEach(function (p, i) {
    const tip = [p.score != null ? String(p.score) : '', p.games != null ? p.games + ' ' + _t('rankingColGames', 'Games') : ''].filter(Boolean).join(' \u00b7 ');
    body += '<span class="ev-pod-p ev-pod' + (i + 1) + '"' + (tip ? ' title="' + esc(tip).replace(/"/g, '&quot;') + '"' : '') + '>'
      + (i === 0 ? ICON_CROWN : '')
      + '<span class="ev-cod-n">' + esc(p.player) + '</span>'
      + '<span class="ev-pod-s">' + (i + 1) + '</span></span>';
  });
  return _card(ICON_SUN, _t('evChampions', 'Champions of the day'), 0, body + '</a>');
}

// One category = one card: header (icon, label, row count) then its rows.
function _card(icon, label, count, body) {
  return '<section class="ev-card"><div class="ev-ch">' + icon + '<span class="ev-cl">' + esc(label) + '</span>'
    + (count > 0 ? '<span class="ev-cnt">' + count + '</span>' : '') + '</div>' + body + '</section>';
}

// Only the ↗ icon opens the site (web.247, narmod): the row itself is inert.
function _goLink(url) {
  const safe = evSafeUrl(url);
  if (!safe) return '';
  const open = esc(_t('evOpenSite', 'Open the site')).replace(/"/g, '&quot;');
  return '<a class="fn-golink" href="' + esc(safe).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer" title="' + open + '" aria-label="' + open + '">' + ICON_OUT + '</a>';
}

function _row(src, url, title, meta, winner) {
  return '<div class="fn-row ev-row ev-static">'
    + '<span class="fn-forum ' + evSrcClass(src) + '">' + esc(evSrcName(src)) + '</span>'
    + '<div class="fn-main"><div class="fn-t' + (winner ? ' ev-win' : '') + '">' + (winner ? ICON_CUP : '') + esc(title) + '</div>'
    + (meta ? '<div class="fn-meta">' + esc(meta) + '</div>' : '') + '</div>'
    + _goLink(url) + '</div>';
}

// ── Registered players of a BBC game (QML BbcGameDates.loadRegs) ─────
// A row with sign-ups unfolds to the nicknames, read through the relay
// /api/events/bbcregs (the BBC site sends no CORS header). Kept by game id so
// a refreshed list keeps what is open.
const REGS_URL = '/api/events/bbcregs?id=';
const REGS_TTL_MS = 2 * 60 * 1000;          // as QML regsTtlMs
const BBC_REGISTER_URL = 'https://bbc.pokerth.net/registration';
const MC_REGISTER_URL = 'https://monthlycup.pokerth.net/registration';
const _open = new Set();                     // expanded game ids (strings)
const _regs = new Map();                     // id -> { players, loading, error, at }
const _games = new Map();                    // id -> game of the last render

// A BBC game with sign-ups and an id can unfold; a WEC final unfolds to its
// table set-up and qualified players (web.292).
export function evExpandable(e) {
  if (e && e.src === 'mc') return !!(e.id != null && (e.round1 || e.finals || e.admins || e.champion || e.closeAt));
  if (e && e.kind === 'final') return !!(e.id != null && ((e.qualified && e.qualified.length) || e.setup));
  return !!(e && e.src === 'bbc' && e.id != null && e.signups > 0);
}

// An event stays in « Upcoming » until it starts — a Monthly Cup the forum
// follows stays while its night lasts (`until`, web.293).
export function evStillOn(e, now) {
  return !!e && typeof e.at === 'number' && (e.at >= now - 5 * 60 * 1000 || (typeof e.until === 'number' && e.until > now));
}

// The top 3 of a Monthly Cup table: its posted result, or for the gold table
// the cup podium. tableKey = { table: n } or { tier: 'gold' }.
export function evCupTop(e, key) {
  const res = (e && Array.isArray(e.results) ? e.results : []).find(function (r) {
    return (key.table && r.table === key.table) || (key.tier && r.tier === key.tier);
  });
  if (res && Array.isArray(res.top)) return res.top;
  if (key.tier === 'gold' && e && Array.isArray(e.podium) && e.podium.length) return e.podium.slice(0, 3);
  return null;
}

// The WEC daily game is not shown on an evening whose final is at the same time.
export function evDropDailyUnderFinal(list) {
  const finals = (list || []).filter(function (e) { return e && e.kind === 'final'; });
  if (!finals.length) return list || [];
  return list.filter(function (e) {
    return !(e && e.kind === 'daily' && finals.some(function (f) { return Math.abs(f.at - e.at) < 90 * 60000; }));
  });
}

// Set-up line of a final: label → value pairs, in the order of the create form.
// `w` = { stack, blind, timeout, delay, double } (translated labels; double has {n}).
export function evFinalSetup(e, w, locale) {
  const s = e && e.setup;
  if (!s) return [];
  const nf = function (n) { try { return Number(n).toLocaleString(locale || undefined); } catch (x) { return String(n); } };
  const out = [];
  if (s.stack != null) out.push([w.stack, nf(s.stack)]);
  if (s.blind != null) out.push([w.blind, nf(s.blind)]);
  if (s.timeout != null) out.push([w.timeout, s.timeout + ' s']);
  if (s.delay != null) out.push([w.delay, s.delay + ' s']);
  if (s.raiseEvery != null) out.push([String(w.double || 'Blinds double every {n} hands').replace('{n}', String(s.raiseEvery)), '']);
  return out;
}

// Fresh = same number of players as announced, fetched less than 2 min ago.
export function evRegsFresh(r, signups, now) {
  return !!(r && !r.error && !r.loading && Array.isArray(r.players) && r.players.length === signups && now - r.at < REGS_TTL_MS);
}

function _loadRegs(e) {
  const id = String(e.id), old = _regs.get(id);
  if (old && (old.loading || evRegsFresh(old, e.signups, Date.now()))) return;
  _regs.set(id, { players: old ? old.players : [], loading: true, error: false, at: old ? old.at : 0 });
  fetch(REGS_URL + encodeURIComponent(id), { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http_' + r.status); return r.json(); })
    .then(function (j) {
      if (!j || j.ok !== true || !Array.isArray(j.players)) throw new Error((j && j.error) || 'no_data');
      _regs.set(id, { players: j.players, loading: false, error: false, at: Date.now() });
    })
    .catch(function () {
      const prev = _regs.get(id);
      _regs.set(id, { players: prev ? prev.players : [], loading: false, error: true, at: prev ? prev.at : 0 });
    })
    .finally(function () { if (_open.has(id)) evRerender(); });
}

function _toggle(id) {
  if (_open.has(id)) { _open.delete(id); evRerender(); return; }
  const e = _games.get(id);
  if (!e) return;
  _open.clear();                 // one game unfolded at a time (narmod, web.244)
  _open.add(id);
  if (e.src === 'bbc') _loadRegs(e);      // a WEC final / a Monthly Cup carries its own players
  evRerender();
}

// Unfolded WEC final: table set-up, then the qualified players (place · nick,
// games won in the month as a tooltip) and the replacements, dimmed.
function _finalPanel(e) {
  const loc = _locale();
  const setup = evFinalSetup(e, {
    stack: _t('startCash', 'Starting stack'), blind: _t('firstSmallBlind', 'First small blind'),
    timeout: _t('actionTimeout', 'Time per action'), delay: _t('pauseBetweenHands', 'Pause between hands'),
    double: _t('evBlindsDouble', 'Blinds double every {n} hands')
  }, loc);
  let body = '';
  if (setup.length) {
    body += '<div class="ev-setup">' + setup.map(function (p) {
      return '<span class="ev-set">' + esc(p[0]) + (p[1] ? ' <b>' + esc(p[1]) + '</b>' : '') + '</span>';
    }).join('') + '</div>';
  }
  const chip = function (p, res) {
    const tip = p.won != null && p.games != null ? _t('evWonOf', '{won} of {games} games won', { won: p.won, games: p.games }) : '';
    return '<span class="ev-chip' + (res ? ' ev-res' : '') + '"' + (tip ? ' title="' + esc(tip).replace(/"/g, '&quot;') + '"' : '') + '>'
      + '<span class="ev-chip-p">' + esc(String(p.place)) + '.</span><span class="ev-chip-n">' + esc(String(p.nick || '')) + '</span></span>';
  };
  if (e.qualified && e.qualified.length) {
    body += '<div class="ev-regs-msg ev-fl">' + esc(_t('evWecQualified', 'Qualified')) + '</div>'
      + '<div class="ev-chips">' + e.qualified.map(function (p) { return chip(p, false); }).join('') + '</div>';
  }
  if (e.reserves && e.reserves.length) {
    body += '<div class="ev-regs-msg ev-fl">' + esc(_t('evWecReserves', 'Replacements')) + '</div>'
      + '<div class="ev-chips">' + e.reserves.map(function (p) { return chip(p, true); }).join('') + '</div>';
  }
  return '<div class="ev-regs ev-final">' + body + '</div>';
}

// Unfolded part: nickname chips (BBC admins: gold outline + "Admin" tag), or
// a loading / error line. Left bar in the step colour, as in QML.
// Unfolded Monthly Cup (web.293): registration close, admins, champion, the
// final tables, then the 1st round tables — each with its top 3 once posted.
const MEDALS = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'];
function _cupPanel(e) {
  const loc = _locale(), now = Date.now();
  let body = '';
  const info = [];
  if (typeof e.closeAt === 'number' && e.closeAt > now) info.push(_t('evMcCloses', 'Registration closes {time}', { time: evTime(e.closeAt, loc) }));
  if (e.admins && e.admins.length) info.push(_t('evMcAdmins', 'Table admins') + ': ' + e.admins.join(', '));
  if (info.length) body += '<div class="ev-setup">' + info.map(function (t) { return '<span class="ev-set">' + esc(t) + '</span>'; }).join('') + '</div>';
  if (e.champion) body += '<div class="ev-champ">' + ICON_CROWN + '<span>' + esc(_t('evMcChampion', 'Champion')) + ' <b>' + esc(e.champion) + '</b></span></div>';
  const block = function (label, players, top) {
    let h = '<div class="ev-regs-msg ev-fl">' + esc(label) + '</div>';
    if (top && top.some(Boolean)) h += '<div class="ev-top">' + top.map(function (n, i) { return n ? '<span class="ev-top-p">' + MEDALS[i] + ' ' + esc(n) + '</span>' : ''; }).join('') + '</div>';
    if (players && players.length) h += '<div class="ev-chips ev-chips-sm">' + players.map(function (n) { return '<span class="ev-chip"><span class="ev-chip-n">' + esc(n) + '</span></span>'; }).join('') + '</div>';
    return h;
  };
  const tierWord = { gold: _t('evMcGold', 'Gold table'), silver: _t('evMcSilver', 'Silver table'), bronze: _t('evMcBronze', 'Bronze table') };
  (e.finals || []).forEach(function (f) { body += block(tierWord[f.tier] || f.tier, f.players, evCupTop(e, { tier: f.tier })); });
  if (e.round1 && e.round1.length) {
    body += '<div class="ev-regs-msg ev-fl ev-round">' + esc(_t('evMcRound1', '1st round')) + '</div>';
    e.round1.forEach(function (t) { body += block(_t('evMcTable', 'Table {n}', { n: t.table }), t.players, evCupTop(e, { table: t.table })); });
  }
  if (e.substitutes && e.substitutes.length) body += block(_t('evWecReserves', 'Replacements'), e.substitutes, null);
  return '<div class="ev-regs ev-final ev-cup">' + body + '</div>';
}

function _regsPanel(e) {
  if (e.src === 'mc') return _cupPanel(e);
  if (e.kind === 'final') return _finalPanel(e);
  const r = _regs.get(String(e.id));
  const players = r && Array.isArray(r.players) ? r.players : [];
  const bar = e.step >= 1 && e.step <= 4 ? ' ev-step' + e.step : '';
  let body;
  if (players.length) {
    const tag = esc(_t('piRoleAdmin', 'Admin'));
    body = '<div class="ev-chips">' + players.map(function (p) {
      const nick = String((p && p.nick) || '');
      return '<span class="ev-chip' + (p && p.admin ? ' ev-admin' : '') + '"><span class="ev-chip-n">' + esc(nick) + '</span>'
        + (p && p.admin ? '<span class="ev-chip-a">' + tag + '</span>' : '') + '</span>';
    }).join('') + '</div>';
  } else if (r && r.error) {
    body = '<div class="ev-regs-msg ev-err">' + esc(_t('evRegsError', 'The registrations could not be loaded.')) + '</div>';
  } else {
    body = '<div class="ev-regs-msg">' + esc(_t('rankingLoading', 'Loading…')) + '</div>';
  }
  return '<div class="ev-regs' + bar + '">' + body + '</div>';
}

const ICON_CHEV = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

// One game of the Upcoming list, QML BBC-tab layout: time · source badge ·
// step badge (BBC) · sign-ups. Sign-ups are dimmed at 0, green when full.
// A BBC row with sign-ups unfolds on click (chevron); the ↗ icon still opens
// the site. Other rows are one link to the site.
function _gameRow(e, loc, stepWord) {
  const step = evStepBadge(e);
  const sign = evSignupText(e, _t('evSignups', 'Signed up: {n}'));
  const full = e.seats > 0 && e.signups >= e.seats;
  const text = e.kind === 'daily' ? _t('evWecDaily', 'Daily game · no registration')
    : e.kind === 'final'
    ? [evUpcomingTitle(e, loc, stepWord, { final: _t('evWecFinal', 'Monthly final · {month}'), grand: _t('evWecGrandFinal', 'Grand final {year}') }),
      e.qualified && e.qualified.length ? _t('evWecQualifiedN', '{n} qualified', { n: e.qualified.length }) : ''].filter(Boolean).join(' · ')
    : e.src === 'bbc'
    ? [e.title, e.signups != null ? '(' + evPlayersText(e.signups, _t('evPlayers1', '1 player registered'), _t('evPlayersN', '{n} players registered')) + ')' : ''].filter(Boolean).join(' ')
    : [evUpcomingTitle(e, loc, stepWord),
      e.src === 'mc' && e.champion ? '\ud83c\udfc6 ' + e.champion
        : e.src === 'mc' && e.at <= Date.now() ? _t('evMcLive', 'in progress') : sign].filter(Boolean).join(' · ');
  // the site's own day and Berlin time, for a player elsewhere (web.295): what to look for when registering
  const ref = evBerlinRef(e.at, loc);
  const refTxt = ref ? _t('evBerlinRef', 'On the site: {day} · {time} (Berlin)', ref) : '';
  const inner = '<span class="ev-time">' + esc(evTime(e.at, loc)) + '</span>'
    + '<span class="fn-forum ' + evSrcClass(e.src) + '">' + esc(evSrcName(e.src)) + '</span>'
    + (step ? '<span class="' + step.cls + '">' + esc(step.text) + '</span>' : '')
    + '<span class="ev-sub' + (full ? ' ev-full' : (e.signups === 0 ? ' ev-zero' : '')) + '">' + esc(text)
    + (refTxt ? '<span class="ev-ref">' + esc(refTxt) + '</span>' : '') + '</span>';
  // Every upcoming row can be selected (the footer button follows it); a BBC
  // row with sign-ups also unfolds. Only the ↗ icon opens the site.
  const key = evSelKey(e), sel = key === _selKey;
  _rowsByKey.set(key, e);
  const cls = 'fn-row ev-row ev-game' + (sel ? ' ev-sel' : '');
  if (!evExpandable(e)) {
    return '<div class="' + cls + '" role="button" tabindex="0" aria-pressed="' + sel + '" data-sel="' + esc(key) + '">'
      + inner + _goLink(e.url) + '</div>';
  }
  const id = String(e.id), on = _open.has(id);
  _games.set(id, e);
  return '<div class="' + cls + ' ev-exp' + (on ? ' ev-open' : '') + '" role="button" tabindex="0" aria-expanded="' + on + '" data-sel="' + esc(key) + '" data-gid="' + esc(id) + '">'
    + inner + '<span class="ev-chev" aria-hidden="true">' + ICON_CHEV + '</span>'
    + _goLink(e.url) + '</div>'
    + (on ? _regsPanel(e) : '');
}

// ── Selected upcoming event → footer button (web.247) ─────────────────
// Key of a row: BBC game id, else source + time. Nothing selected = the next
// BBC game (the button reads « Register for the BBC », as before).
let _selKey = '';
const _rowsByKey = new Map();
export function evSelKey(e) {
  if (!e) return '';
  return e.src === 'bbc' && e.id != null ? 'bbc:' + e.id : e.src + ':' + e.at;
}
// What the footer button does for an event: { label key, fallback, url } or
// { none: true } when the event takes no registration (WEC daily game).
export function evRegisterAction(e) {
  if (e && e.kind === 'daily') return { none: true, key: 'evWecDaily', fallback: 'Daily game \u00b7 no registration' };
  if (e && e.kind === 'final') return { none: true, key: 'evWecFinalNoReg', fallback: 'Qualified through the monthly WEC ranking' };
  if (e && e.src === 'mc' && typeof e.closeAt === 'number' && e.closeAt <= Date.now()) return { none: true, key: 'evMcRegClosed', fallback: 'Registration closed' };
  if (e && e.src === 'mc') return { key: 'evMcRegister', fallback: 'Register for the Monthly Cup', url: evSafeUrl(e.url) || MC_REGISTER_URL };
  return { key: 'evBbcRegister', fallback: 'Register for the BBC', url: (e && evSafeUrl(e.url)) || BBC_REGISTER_URL };
}
function _selected() { return _selKey ? _rowsByKey.get(_selKey) || null : null; }
function _paintRegister() {
  const b = document.getElementById('fn-bbcreg');
  if (!b) return;
  const a = evRegisterAction(_selected());
  // the game to pick on the site, in its own day and time (web.295)
  const sel = _selected(), ref = sel && !a.none ? evBerlinRef(sel.at, _locale()) : null;
  const tip = ref ? _t('evBerlinRef', 'On the site: {day} · {time} (Berlin)', ref) : '';
  if (tip) b.setAttribute('title', tip); else b.removeAttribute('title');
  const sp = b.querySelector('span');
  if (sp) { sp.setAttribute('data-i18n', a.key); sp.textContent = _t(a.key, a.fallback); }
  b.disabled = !!a.none;
  b.setAttribute('aria-disabled', a.none ? 'true' : 'false');
}


// Row clicks / keys (one listener on the box, set once).
function _wireBox(box) {
  if (box._evWired) return;
  box._evWired = true;
  const hit = function (ev) {
    if (ev.target && ev.target.closest && ev.target.closest('a')) return null;
    const row = ev.target && ev.target.closest ? ev.target.closest('.ev-game[data-sel]') : null;
    return row && box.contains(row) ? row : null;
  };
  // Select the row (footer button), and unfold / fold a BBC game with sign-ups.
  const act = function (row) {
    _selKey = row.getAttribute('data-sel') || _selKey;
    const gid = row.getAttribute('data-gid');
    if (gid) _toggle(gid); else evRerender();
  };
  box.addEventListener('click', function (ev) { const row = hit(ev); if (row) act(row); });
  box.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const row = hit(ev);
    if (!row) return;
    ev.preventDefault();
    act(row);
  });
}

// Register button of the window footer (Events tab), as the QML BBC tab's
// Register button: registering needs a login on the cup's site. Follows the
// selected upcoming event (web.247); nothing to open for the WEC daily game.
export function evBbcRegister() {
  const a = evRegisterAction(_selected());
  if (a.none || !a.url) return;
  try { window.open(a.url, '_blank', 'noopener'); } catch (e) {}
}
try { window.evBbcRegister = evBbcRegister; } catch (e) {}

function _render(data) {
  const box = document.getElementById('fn-events');
  if (!box) return;
  _wireBox(box);
  _games.clear();
  _rowsByKey.clear();
  const now = Date.now(), loc = _locale();
  const stepWord = _t('rankingStep', 'Step');
  let up = (data.upcoming || []).filter(function (e) { return e && typeof e.at === 'number'; });
  // WEC daily game on every evening covered by the BBC calendar (at least today).
  const today = evGameDay(now);
  let last = today;
  up.forEach(function (e) { if (e.src === 'bbc') { const k = evGameDay(e.at); if (k > last) last = k; } });
  up.forEach(function (e) { if (e.kind === 'final') { const k = evGameDay(e.at); if (k > last) last = k; } });
  up = evDropDailyUnderFinal(up.concat(evWecDaily(today, last)))
    .filter(function (e) { return evStillOn(e, now); })
    .sort(function (a, b) { return a.at - b.at; });
  const res = data.results || [];
  let html = '', rows = '';
  // Grouped by game evening under a day header (QML BBC tab), the BBC
  // calendar's evenings (web.296: back from the player's own days of web.295,
  // narmod's choice); each row says the site's day and time when they differ.
  let day = null;
  for (const e of up) {
    const k = evGameDay(e.at);
    if (k !== day) { day = k; rows += '<div class="ev-day">' + esc(evDayLabel(k, now, loc)) + '</div>'; }
    rows += _gameRow(e, loc, stepWord);
  }
  html += _card(ICON_CAL, _t('evUpcoming', 'Upcoming'), up.length,
    up.length ? rows : '<div class="rk-msg">' + esc(_t('evNone', 'No upcoming events.')) + '</div>');
  rows = ''; let n = 0;
  for (const r of res) {
    const pod = Array.isArray(r.podium) ? r.podium : [];
    if (!pod.length) continue;
    rows += _row(r.src, r.url, pod[0], evResultMeta(r, now, loc), true); n++;
  }
  if (n) html += _card(ICON_FLAG, _t('evResults', 'Latest results'), n, rows);
  // No leaders card since web.242 (narmod): the rankings have their own window.
  // A re-render (registrations landing) must not steal the keyboard focus.
  const act = document.activeElement;
  const fsel = act && box.contains(act) && act.getAttribute ? act.getAttribute('data-sel') : null;
  // Server clock in a card of its own, framed like the Upcoming card (web.242).
  box.innerHTML = '<section class="ev-card ev-clock" id="ev-clock" hidden><div class="ev-ch">' + ICON_CLOCK + '<span class="ev-cl"></span></div></section>' + html;
  if (fsel) { const again = box.querySelector('.ev-game[data-sel="' + fsel + '"]'); if (again) again.focus(); }
  // A selection whose event is gone (started) falls back to the default.
  if (_selKey && !_rowsByKey.has(_selKey)) _selKey = '';
  _paintRegister();
  _clockPaint();
}

function _clockPaint() {
  const el = document.getElementById('ev-clock');
  if (!el) return;
  const c = lobbyClockNow();
  const txt = c ? evClockText(c.now, c.tz, _locale(), { title: _t('lsbClockTitle', 'Server time'), yours: _t('lsbClockYours', 'Your time') }) : '';
  const sp = el.querySelector('span');
  if (sp && sp.textContent !== txt) sp.textContent = txt;
  el.hidden = !txt;
}
// Minute display while the tab is open: a 5 s tick is plenty (same as the lobby).
let _clockTimer = 0;
function _clockTick() {
  if (_clockTimer) return;
  _clockTimer = setInterval(function () {
    if (!document.getElementById('ev-clock')) { clearInterval(_clockTimer); _clockTimer = 0; return; }
    _clockPaint();
  }, 5000);
}

function _msg(text) {
  const box = document.getElementById('fn-events');
  if (box) box.innerHTML = '<div class="rk-msg">' + esc(text) + '</div>';
}

// Called by forumnews.mjs when the Events tab is shown.
export function evShow(force) {
  _clockTick();
  if (_cache) _render(_cache.data); else _msg(_t('rankingLoading', 'Loading\u2026'));
  _fetch(!!force).then(_render).catch(function () {
    // Relay turned off while the tab was open: back to the Posts.
    let off = false;
    try { off = document.body.classList.contains('ev-relay-off'); } catch (e) {}
    if (off && typeof window.forumSelectTab === 'function') { window.forumSelectTab('posts'); return; }
    if (!_cache) _msg(_t('evError', 'Could not load the events.'));
  });
}

// Background prefetch (web.253), same moments as the Posts badge (page load,
// lobby shown): the Events tab, first tab of the window, then paints from the
// cache at once instead of waiting for the network. Errors are silent.
export function evPrefetch() { _fetch(false).catch(function () {}); }

// Language switch while the tab is open: same data, new wording.
export function evRerender() { if (_cache) _render(_cache.data); }

// Champions of the day above the PokerTH ranking (web.130). The ranking window
// (inline script in pokerth-client.html) sets data-on="1" on its #rk-cod box
// while the PokerTH tab is shown and calls this bridge; same /api/events data
// and cache as the Events tab. Nothing to show (no data, relay down, offline)
// = the box stays hidden. data-on is re-checked when the fetch lands, so a
// quick switch to BBC / WEC never paints it back.
function _codPaint(box) {
  const h = _champions(_cache && _cache.data ? _cache.data.champions : null);
  box.innerHTML = h;
  box.style.display = h ? '' : 'none';
}
export function evShowChampions(boxId) {
  const id = boxId || 'rk-cod';
  const box = document.getElementById(id);
  if (!box || box.dataset.on !== '1') return;
  if (_cache) _codPaint(box); else box.style.display = 'none';
  _fetch(false).then(function () {
    const b = document.getElementById(id);
    if (b && b.dataset.on === '1') _codPaint(b);
  }).catch(function () {});
}
try { window.evShowChampions = evShowChampions; } catch (e) {}
