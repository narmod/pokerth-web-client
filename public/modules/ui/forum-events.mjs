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

// "today 23:15" / "tomorrow 01:00" / "Sat 26 · 20:00", in the given locale.
// Day distance is counted on the local calendar, not in 24 h blocks: a game
// at 01:00 seen at 23:00 is "tomorrow", not "today".
export function evWhen(ms, now, locale) {
  if (typeof ms !== 'number' || !isFinite(ms)) return '';
  const loc = locale || undefined;
  let time = '';
  try { time = new Date(ms).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' }); } catch (e) { time = ''; }
  const days = Math.round((_dayStart(ms) - _dayStart(now)) / DAY_MS);
  let day = '';
  if (days >= -1 && days <= 1) {
    try { day = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' }).format(days, 'day'); } catch (e) { day = ''; }
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

// Only ever link to the community sites, whatever the relay says.
export function evSafeUrl(u) {
  return /^https:\/\/(bbc|wec|monthlycup)\.pokerth\.net\//.test(String(u || '')) ? String(u) : '';
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
  let html = '<div class="ev-h">' + esc(_t('evUpcoming', 'Upcoming')) + '</div>';
  if (!up.length) html += '<div class="rk-msg">' + esc(_t('evNone', 'No upcoming events.')) + '</div>';
  for (const e of up) {
    const meta = [evWhen(e.at, now, loc)];
    if (e.signups != null) meta.push(_t('evSignups', 'Signed up: {n}', { n: e.signups }));
    html += _row(e.src, e.url, evUpcomingTitle(e, loc, stepWord), meta.filter(Boolean).join(' \u00b7 '), false);
  }
  if (res.length) {
    html += '<div class="ev-h">' + esc(_t('evResults', 'Latest results')) + '</div>';
    for (const r of res) {
      const pod = Array.isArray(r.podium) ? r.podium : [];
      if (!pod.length) continue;
      html += _row(r.src, r.url, pod[0], evResultMeta(r, now, loc), true);
    }
  }
  const lead = (data.leaders || []).filter(function (l) { return l && l.player; });
  if (lead.length) {
    const w = { season: _t('rankingSeason', 'Season'), points: _t('rankingColPoints', 'Points'), games: _t('rankingColGames', 'Games') };
    html += '<div class="ev-h">' + esc(_t('rankingTitle', 'Ranking')) + '</div>';
    for (const l of lead) html += _row(l.src, l.url, l.player, evLeaderMeta(l, loc, w), true);
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
