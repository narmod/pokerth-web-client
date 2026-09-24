// @ts-check
// ═══════════════════════════════════════════════════════════════════
// "Events" tab of the Forum news window — web extension, no QML
// counterpart. Shows what is coming up on the community sites (BBC step
// games with their sign-up count, the next Monthly Cup), who won last
// (BBC / WEC / Monthly Cup podium) and who leads the BBC season and the WEC
// month. WEC publishes no schedule, so it only appears in the last two.
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
export function evUpcomingTitle(e, locale, stepWord) {
  if (!e) return '';
  if (e.src === 'mc') return evMonthName(e.month, locale) || evSrcName('mc');
  const parts = [];
  if (e.step != null) parts.push((stepWord || 'Step') + ' ' + e.step);
  if (e.title) parts.push(e.title);
  return parts.join(' \u00b7 ') || evSrcName(e.src);
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

// Meta line of a leader row: "September 2026 · 650 Points · 16 Games · 2. boehmi · 3. Yes".
// `w` carries the translated words { season, points, games } (existing ranking keys).
export function evLeaderMeta(l, locale, w) {
  if (!l) return '';
  const words = w || {}, parts = [], p = l.period || {};
  if (p.season != null) parts.push((words.season || 'Season') + ' ' + p.season);
  else { const m = evMonthName(p.month, locale, p.year); if (m) parts.push(m); }
  if (l.points != null) parts.push(l.points + ' ' + (words.points || 'Points'));
  if (l.games != null) parts.push(l.games + ' ' + (words.games || 'Games'));
  const next = Array.isArray(l.next) ? l.next : [];
  for (let i = 0; i < next.length && i < 2; i++) parts.push((i + 2) + '. ' + next[i]);
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

function _fetch(force) {
  const now = Date.now();
  if (!force && _cache && (now - _cache.at) < CLIENT_TTL_MS) return Promise.resolve(_cache.data);
  if (_fetching) return _fetching;
  _fetching = fetch(EVENTS_URL, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http_' + r.status); return r.json(); })
    .then(function (j) {
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
const ICON_BARS = _ico('<path d="M6 20V10M12 20V4M18 20v-7"/>');
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

function _row(src, url, title, meta, winner) {
  const safe = evSafeUrl(url);
  const open = _t('evOpenSite', 'Open the site');
  return '<a class="fn-row ev-row"' + (safe ? ' href="' + esc(safe).replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer"' : '')
    + ' title="' + esc(open).replace(/"/g, '&quot;') + '">'
    + '<span class="fn-forum ' + evSrcClass(src) + '">' + esc(evSrcName(src)) + '</span>'
    + '<div class="fn-main"><div class="fn-t' + (winner ? ' ev-win' : '') + '">' + (winner ? ICON_CUP : '') + esc(title) + '</div>'
    + (meta ? '<div class="fn-meta">' + esc(meta) + '</div>' : '') + '</div>'
    + '<span class="fn-golink" aria-hidden="true">' + ICON_OUT + '</span>'
    + '</a>';
}

function _render(data) {
  const box = document.getElementById('fn-events');
  if (!box) return;
  const now = Date.now(), loc = _locale();
  const stepWord = _t('rankingStep', 'Step');
  const up = (data.upcoming || []).filter(function (e) { return e && typeof e.at === 'number' && e.at >= now - 5 * 60 * 1000; });
  const res = data.results || [];
  let html = '', rows = '';
  for (const e of up) {
    const meta = [evWhen(e.at, now, loc)];
    meta.push(evSignupText(e, _t('evSignups', 'Signed up: {n}')));
    rows += _row(e.src, e.url, evUpcomingTitle(e, loc, stepWord), meta.filter(Boolean).join(' \u00b7 '), false);
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
  const lead = (data.leaders || []).filter(function (l) { return l && l.player; });
  if (lead.length) {
    const w = { season: _t('rankingSeason', 'Season'), points: _t('rankingColPoints', 'Points'), games: _t('rankingColGames', 'Games') };
    rows = '';
    for (const l of lead) rows += _row(l.src, l.url, l.player, evLeaderMeta(l, loc, w), true);
    html += _card(ICON_BARS, _t('rankingTitle', 'Ranking'), lead.length, rows);
  }
  box.innerHTML = html;
}

function _msg(text) {
  const box = document.getElementById('fn-events');
  if (box) box.innerHTML = '<div class="rk-msg">' + esc(text) + '</div>';
}

// Called by forumnews.mjs when the Events tab is shown.
export function evShow(force) {
  if (_cache) _render(_cache.data); else _msg(_t('rankingLoading', 'Loading\u2026'));
  _fetch(!!force).then(_render).catch(function () {
    if (!_cache) _msg(_t('evError', 'Could not load the events.'));
  });
}

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
