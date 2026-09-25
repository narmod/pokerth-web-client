// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Lobby server clock (web extension, forum request 2026-09-23).
//
// The PokerTH protocol carries no server time and no time zone, so the
// clock is read from the proxy: GET /__time → { now, tz }.
//   now  the server's own instant (ms) — the browser clock is not trusted,
//        a skew is kept and corrected for half the round trip;
//   tz   the zone community events (BBC, WEC, Monthly Cup) are announced
//        in: admin setting (lobbyClockTz), else SERVER_TZ, else Europe/Berlin
//        (QML parity). Nothing is hard-coded in this module — the zone is
//        always the one the proxy reports.
//
// Shown only when connected to pokerth.net (window._pthConnMode) and with
// community content on (parity: QML LobbyStatsBar showServerTime =
// showCommunityContent, upstream f01d1db9), as a chip in the LobbyStatsBar
// before the PokerTH.net link, followed by a ' | ' separator. Label as in the
// QML: wide 'Server time (Berlin): 14:05', compact 'Berlin 14:05', portrait
// clock icon + '14:05' (the variant is picked by CSS media queries). A tap
// opens a small panel with the local time and the offset (web extension).
// Advanced option / admin kill switch: lobby_clock.
// ═══════════════════════════════════════════════════════════════════

const SYNC_MS = 10 * 60 * 1000;   // re-read the server instant every 10 min
const TICK_MS = 5000;             // minute display: a 5 s tick is plenty

let _skew = 0;        // server now − browser now (ms)
let _tz = '';         // zone reported by the server ('' until the first sync)
let _syncAt = 0;      // last successful sync (browser ms)
let _syncing = false;

// ── Pure helpers (exported for scripts/test-lobby-clock.mjs) ─────────

/** City part of an IANA zone: 'Europe/Berlin' → 'Berlin', 'UTC' → 'UTC'. */
export function lcCity(tz) {
  const s = String(tz || 'UTC');
  return s.split('/').pop().replace(/_/g, ' ');
}

/** Offset of `tz` from UTC at instant `ms`, in minutes (Berlin summer → 120). */
export function lcOffsetMin(tz, ms) {
  try {
    const p = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
    return Math.round((asUtc - Math.floor(ms / 60000) * 60000) / 60000);
  } catch (e) { return 0; }
}

/** '+2', '-5:30', '0' — signed hours, minutes only when needed. */
export function lcFmtOffset(min) {
  if (!min) return '0';
  const sg = min < 0 ? '\u2212' : '+', a = Math.abs(min);
  const h = Math.floor(a / 60), m = a % 60;
  return sg + h + (m ? ':' + (m < 10 ? '0' : '') + m : '');
}

/** The three footer labels of the QML LobbyStatsBar (wide / compact / portrait). */
export function lcLabels(title, city, hm) {
  return { wide: title + ' (' + city + '): ' + hm, compact: city + ' ' + hm, portrait: hm };
}

/** Skew from one round trip: server instant vs the midpoint of the request. */
export function lcSkew(serverNow, t0, t1) {
  return serverNow - Math.round((t0 + t1) / 2);
}

// ── Runtime ──────────────────────────────────────────────────────────

function _t(key, fallback) {
  try { if (typeof window.t === 'function') { const v = window.t(key); if (v && v !== key) return v; } } catch (e) {}
  return fallback;
}

function _enabled() {
  try { if (typeof window._advGet === 'function' && !window._advGet('lobby_clock', true)) return false; } catch (e) {}
  try { if (typeof window._advGet === 'function' && !window._advGet('community_content', true)) return false; } catch (e) {}
  try { return typeof window._pthConnMode === 'function' && window._pthConnMode() === 'pokerthnet'; } catch (e) { return false; }
}

function _loc() {
  try { return document.documentElement.lang || undefined; } catch (e) { return undefined; }
}

function _hm(ms, tz) {
  try {
    return new Intl.DateTimeFormat(_loc(), { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(ms));
  } catch (e) {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(ms));
  }
}

function _sync() {
  if (_syncing) return;
  _syncing = true;
  const t0 = Date.now();
  fetch('/__time', { cache: 'no-store', headers: { 'Accept': 'application/json' } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      const t1 = Date.now();
      if (!d || typeof d.now !== 'number' || typeof d.tz !== 'string' || !d.tz) return;
      try { new Intl.DateTimeFormat('en-US', { timeZone: d.tz }); } catch (e) { return; }
      _skew = lcSkew(d.now, t0, t1);
      _tz = d.tz;
      _syncAt = t1;
      _render();
    })
    .catch(function () {})
    .finally(function () { _syncing = false; });
}

function _close() {
  const pop = document.getElementById('lsb-clock-pop');
  const btn = document.getElementById('lsb-clock');
  if (pop) pop.hidden = true;
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function _fillPop() {
  const pop = document.getElementById('lsb-clock-pop');
  if (!pop || pop.hidden || !_tz) return;
  const now = Date.now() + _skew;
  const srvOff = lcOffsetMin(_tz, now);
  const locOff = -new Date(now).getTimezoneOffset();
  const diff = locOff - srvOff;
  const rows = [
    [_t('lsbClockTitle', 'Server time'), _hm(now, _tz), lcCity(_tz) + ' \u00b7 UTC' + (srvOff ? lcFmtOffset(srvOff) : '')],
    [_t('lsbClockYours', 'Your time'), _hm(now, undefined),
      diff ? lcFmtOffset(diff) + ' h' : _t('lsbClockSame', 'Same time as the server')],
  ];
  pop.textContent = '';
  rows.forEach(function (r, i) {
    const row = document.createElement('div'); row.className = 'lsb-cp-row';
    const k = document.createElement('span'); k.className = 'lsb-cp-k'; k.textContent = r[0];
    const v = document.createElement('span'); v.className = 'lsb-cp-v' + (i === 0 ? ' lsb-cp-srv' : '');
    v.textContent = r[1];
    const s = document.createElement('span'); s.className = 'lsb-cp-s'; s.textContent = r[2];
    row.appendChild(k); row.appendChild(v); row.appendChild(s);
    pop.appendChild(row);
  });
  const note = document.createElement('div'); note.className = 'lsb-cp-note';
  note.textContent = _t('lsbClockNote', 'Community events (BBC, WEC, Monthly Cup) are scheduled in server time.');
  pop.appendChild(note);
}

function _render() {
  const btn = document.getElementById('lsb-clock');
  if (!btn) return;
  const on = _enabled();
  if (on && (!_syncAt || Date.now() - _syncAt > SYNC_MS)) _sync();
  const show = on && !!_tz;
  btn.hidden = !show;
  if (!show) { _close(); return; }
  const now = Date.now() + _skew;
  const hm = _hm(now, _tz), city = lcCity(_tz);
  const title = _t('lsbClockTitle', 'Server time');
  const tt = document.getElementById('lsb-clock-t');
  if (tt) {
    const v = lcLabels(title, city, hm);
    [['.lsb-ck-w', v.wide], ['.lsb-ck-c', v.compact], ['.lsb-ck-p', v.portrait]].forEach(function (x) {
      const el = tt.querySelector(x[0]);
      if (el && el.textContent !== x[1]) el.textContent = x[1];
    });
  }
  btn.title = title;
  btn.setAttribute('aria-label', title + ' ' + hm + ' ' + city);
  _fillPop();
}

function _init() {
  const btn = document.getElementById('lsb-clock');
  const pop = document.getElementById('lsb-clock-pop');
  if (!btn || !pop) return;
  btn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    const open = pop.hidden;
    pop.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) _fillPop();
  });
  document.addEventListener('click', function (ev) {
    if (pop.hidden) return;
    const tg = /** @type {Node} */ (ev.target);
    if (!pop.contains(tg) && !btn.contains(tg)) _close();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !pop.hidden) { _close(); try { btn.focus(); } catch (e) {} }
  });
  // A phone asleep for hours comes back with a stale skew: re-read at once.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { _syncAt = 0; _render(); }
  });
  _render();
  setInterval(_render, TICK_MS);
}

// Hook for applyAdvOpts (option toggled) — refresh without waiting a tick.
try { window._lobbyClockRefresh = _render; } catch (e) {}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
  else _init();
}
