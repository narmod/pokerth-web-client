// Admin › Overview: what needs the operator now, and how the service is doing.
//
// Read-only. Everything shown comes from endpoints the other sections already
// use (/admin/status, /admin/sessions, /admin/visits, /admin/lan-directory,
// /admin/errors, /admin/audit, /api/live); nothing here writes. Each card
// leads to the section that holds the detail and the controls.
//
// The inline dashboard script owns the sections and tells this module which
// one is open through an `admin:section` event; it also exposes
// window.PthAdmin = { api, open(t), master() }.
import { icon } from './icons.mjs';

// The four ways in, in the order the statistics use. `key` is the name the
// visit store counts under, `sess` the one a live connection carries.
export const MODES = [
  { id: 'net',  key: 'pokerthnet', label: 'Internet', glyph: 'globe',   color: 'var(--m-net)' },
  { id: 'lan',  key: 'lan',        label: 'LAN',      glyph: 'network', color: 'var(--m-lan)' },
  { id: 'off',  key: 'offline',    label: 'Training', glyph: 'robot',   color: 'var(--m-off)' },
  { id: 'live', key: 'live',       label: 'Live/spectator tool', glyph: 'eye', color: 'var(--m-live)' },
];

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const nf = (n) => (typeof n === 'number' && isFinite(n) ? n.toLocaleString('en-US') : '—');

// ── Right now, by entry mode ─────────────────────────────────────────────
// Bridges are game connections relayed by this proxy (pokerth.net or a LAN
// server). Notice channels are opened by clients that play WITHOUT a bridge:
// connected straight to pokerth.net, or training offline against the bots.
// /live spectators are counted apart, whichever way they connect.
export function nowByMode(d) {
  const out = { net: { n: 0, bridged: 0, direct: 0 }, lan: { n: 0, servers: 0 }, off: { n: 0 }, live: { n: 0 } };
  if (!d || !d.ok) return null;
  const lanServers = new Set();
  (d.bridges || []).forEach((b) => {
    if (b.live) { out.live.n++; return; }
    if (b.mode === 'lan') { out.lan.n++; lanServers.add(String(b.host || '').toLowerCase() + ':' + b.port); return; }
    out.net.n++; out.net.bridged++;
  });
  (d.notify || []).forEach((c) => {
    if (c.live) { out.live.n++; return; }
    if (c.mode === 'offline') { out.off.n++; return; }
    out.net.n++; out.net.direct++;
  });
  out.lan.servers = lanServers.size;
  return out;
}

// ── Connections per day, by entry mode ───────────────────────────────────
export function dailyByMode(series, todayKey) {
  return (series || []).map((p) => {
    const m = p.m || {};
    const row = { date: p.date, today: !!todayKey && p.date === todayKey, total: 0, has: !!p.m };
    MODES.forEach((x) => { row[x.id] = m[x.key] || 0; row.total += row[x.id]; });
    return row;
  });
}

// ── What needs attention ─────────────────────────────────────────────────
// Most urgent first. With nothing to report the row says so, rather than
// leaving a gap the operator has to interpret.
export function alertsFrom(st) {
  const out = [];
  const s = st.status;
  const now = st.now || Date.now();
  if (s && s.ok) {
    if (s.runningVersion && s.version && s.runningVersion !== s.version) {
      out.push({ kind: 'warn', glyph: 'terminal', title: 'Restart needed',
        sub: 'Files are ' + s.version + ', the proxy still runs ' + s.runningVersion, label: 'Deployment', t: 'deploy' });
    }
    const u = s.update || {};
    if (u.available) {
      out.push({ kind: 'ok', glyph: 'download', title: 'Update available',
        sub: (u.remote ? String(u.remote).slice(0, 8) + ' · ' : '') + (u.needsRestart ? 'needs a restart' : 'client files only, no restart')
          + (u.checkedAt ? ' · checked ' + ago(now - u.checkedAt) : ''),
        label: 'Deploy', t: 'deploy' });
    }
    if (s.restartAt && s.restartAt > now) {
      out.push({ kind: 'info', glyph: 'clock', title: 'Restart scheduled',
        sub: 'At ' + new Date(s.restartAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), label: 'Deployment', t: 'deploy' });
    }
  }
  const pend = st.landir && st.landir.ok && Array.isArray(st.landir.pending) ? st.landir.pending.length : 0;
  if (pend) {
    out.push({ kind: 'warn', glyph: 'network', title: pend + ' LAN server' + (pend === 1 ? '' : 's') + ' waiting',
      sub: 'Proposed for the public directory', label: 'Review', t: 'landir' });
  }
  const e = st.errors;
  if (e && e.ok) {
    // A group seen from robots only is a crawler's quirk, not a player's bug.
    const real = (e.groups || []).filter((g) => !(g.bots && g.uas && g.bots >= g.uas.length));
    if (real.length) {
      const last = Math.max.apply(null, real.map((g) => g.last || 0));
      const day = real.filter((g) => now - (g.last || 0) < 864e5).length;
      out.push({ kind: day ? 'err' : 'info', glyph: 'warning',
        title: real.length + ' client error' + (real.length === 1 ? '' : 's'),
        sub: (day ? day + ' seen in the last 24 h' : 'none in the last 24 h') + (last ? ' · last ' + ago(now - last) : ''),
        label: 'Open', t: 'errors' });
    }
  }
  const rank = { err: 0, warn: 1, ok: 2, info: 3 };
  out.sort((a, b) => rank[a.kind] - rank[b.kind]);
  if (!out.length && s && s.ok) out.push({ kind: 'ok', glyph: 'check', title: 'All clear', sub: 'Nothing needs you right now' });
  return out;
}

export function ago(ms) {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  if (h < 48) return h + ' h ago';
  return Math.round(h / 24) + ' days ago';
}
export function fmtUptime(s) {
  s = s || 0;
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return (d ? d + 'd ' : '') + (h ? h + 'h ' : '') + m + 'm';
}
// The country of a connection (from its browser time zone), as a small flag.
export function flag(cc) {
  if (!/^[A-Z]{2}$/.test(cc || '') || cc === 'ZZ') return '';
  return '<img class="ovflag" alt="" src="/flags/' + cc.toLowerCase() + '.svg" title="' + cc + '" onerror="this.remove()">';
}
export function dur(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return s + ' s';
  const m = Math.floor(s / 60);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60);
  return h + ' h ' + (m % 60) + ' min';
}

// Audit entries carry the endpoint that changed something; these read better.
const ACTIONS = {
  'config': 'Settings saved', 'config/import': 'Backup restored', 'servers': 'Game servers saved',
  'broadcasts': 'Scheduled message saved', 'broadcasts/delete': 'Scheduled message deleted',
  'broadcasts/toggle': 'Scheduled message switched', 'broadcasts/fire': 'Scheduled message sent now',
  'broadcast-now': 'Message sent to players', 'polls': 'Poll saved', 'polls/activate': 'Poll activated',
  'polls/delete': 'Poll deleted', 'polls/reset': 'Poll reset', 'lan-directory': 'LAN directory changed',
  'lan-boards': 'LAN leaderboards changed', 'tokens': 'Delegate key created', 'tokens/delete': 'Delegate key revoked',
  'update': 'Update deployed', 'restart': 'Proxy restarted', 'schedule-restart': 'Restart scheduled',
  'cancel-restart': 'Restart cancelled', 'auto-update': 'Automatic updates changed', 'pkg-upload': 'Package uploaded',
  'pkg-remove': 'Package removed', 'pkg-toggle': 'Package switched', 'music-upload-finish': 'Track uploaded',
  'music-remove': 'Track removed', 'music-toggle': 'Track switched', 'music-enable': 'Music switched',
  'sessions': 'Session disconnected', 'errors': 'Error list changed', 'clear-logs': 'Logs cleared',
  'blocked': 'Address unblocked', 'db': 'MySQL mirror changed', 'clock': 'Clocks changed',
};
export function auditLabel(a) { return ACTIONS[a] || a || '?'; }

// ── Rendering ────────────────────────────────────────────────────────────
function alertsHtml(list) {
  return list.map((a) => '<div class="ovalert ov-' + a.kind + '">' + icon(a.glyph, 'ovai') +
    '<div class="ovat"><b>' + esc(a.title) + '</b><span>' + esc(a.sub) + '</span></div>' +
    (a.t ? '<button type="button" class="ovgo" data-go="' + esc(a.t) + '">' + esc(a.label) + '</button>' : '') + '</div>').join('');
}

function modesHtml(now, live) {
  return MODES.map((x) => {
    const c = now ? now[x.id] : null;
    let sub = '';
    if (c) {
      if (x.id === 'net') {
        // Each figure stays with its words: on a phone « 0 » used to end one
        // line and « direct » start the next.
        const nw = (t) => '<span class="nw">' + t + '</span>';
        sub = nw(c.bridged + ' through this proxy') + ' · ' + nw(c.direct + ' direct');
        if (live && live.ok && typeof live.online === 'number') sub += '<br>' + nw(nf(live.online) + ' online on the server') + (typeof live.tables === 'number' ? ' · ' + nw(nf(live.tables) + ' tables') : '');
      } else if (x.id === 'lan') sub = c.n ? 'on ' + c.servers + ' server' + (c.servers === 1 ? '' : 's') : 'no LAN table right now';
      else if (x.id === 'off') sub = 'playing the bots offline';
      else sub = 'watching on /live';
    }
    return '<div class="ovmode" style="--mc:' + x.color + '"><div class="ovmh">' + icon(x.glyph, 'ovmi') + '<span>' + x.label + '</span></div>' +
      '<b class="ovmn">' + (c ? nf(c.n) : '…') + '</b><span class="ovms">' + sub + '</span></div>';
  }).join('');
}

function chartHtml(rows) {
  if (!rows.length) return '<div class="empty">No figures yet.</div>';
  if (!rows.some((r) => r.has && r.total)) return '<div class="empty">No connection counted over these 14 days yet.</div>';
  const max = Math.max(1, ...rows.map((r) => r.total));
  const tot = {}; MODES.forEach((x) => { tot[x.id] = 0; });
  rows.forEach((r) => MODES.forEach((x) => { tot[x.id] += r[x.id]; }));
  const bars = rows.map((r) => {
    const d = new Date(r.date + 'T12:00:00');
    const day = isNaN(d) ? r.date : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const tip = day + (r.today ? ' (so far)' : '') + ' — ' + MODES.map((x) => x.label + ' ' + r[x.id]).join(' · ');
    const segs = MODES.map((x) => r[x.id] ? '<i style="height:' + (r[x.id] / max * 100).toFixed(2) + '%;background:' + x.color + '"></i>' : '').join('');
    return '<div class="ovbar' + (r.today ? ' today' : '') + '" title="' + esc(tip) + '"><div class="ovstack">' + segs + '</div><span>' + (isNaN(d) ? '' : d.getDate()) + '</span></div>';
  }).join('');
  const sum = MODES.map((x) => x.label + ' ' + tot[x.id]).join(', ');
  return '<div class="ovchart" role="img" aria-label="Connections per day over 14 days by entry mode: ' + esc(sum) + '">' + bars + '</div>' +
    '<div class="ovlegend">' + MODES.map((x) => '<span><i style="background:' + x.color + '"></i>' + x.label + ' <b>' + nf(tot[x.id]) + '</b></span>').join('') +
    '<span class="ovpeak">peak ' + nf(max) + ' a day</span></div>';
}

function healthHtml(s) {
  if (!s || !s.ok) return '<div class="empty err">Could not load the server status.</div>';
  const stale = s.runningVersion && s.version && s.runningVersion !== s.version;
  const u = s.update || {};
  const rows = [
    ['Build', esc(s.version || '—') + (stale ? ' <span class="err">(running ' + esc(s.runningVersion) + ')</span>' : '')],
    ['Uptime', esc(fmtUptime(s.uptimeSec))],
    ['Install', esc(s.installKind || '—') + ' · ' + (s.gitUpdatable === false ? 'no self-update' : 'self-update')],
    ['Updates', u.checkedAt ? (u.available ? 'available' : 'up to date') + ' · checked ' + esc(ago(Date.now() - u.checkedAt)) : (s.gitUpdatable === false ? 'by image' : 'not checked yet')],
    ['Connections', nf(s.sockets) + (s.maxClients ? ' of ' + nf(s.maxClients) : ' · no cap')],
    ['Open files', s.fd ? (s.fd.softN ? nf(s.fd.softN) : esc(s.fd.soft)) + (s.fd.approxPlayers ? ' · ~' + nf(s.fd.approxPlayers) + ' players' : '') : '—'],
  ];
  return rows.map((r) => '<div class="srow"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>').join('');
}

function nowListHtml(d) {
  if (!d || !d.ok) return '<div class="empty err">Could not load the connections.</div>';
  const all = [];
  (d.bridges || []).forEach((b) => all.push({ mode: b.live ? 'live' : b.mode === 'lan' ? 'lan' : 'net', who: b.live ? 'spectator' : (b.nick || (b.auth ? 'account' : 'guest')), at: b.startedAt, cc: b.cc, where: b.live ? '/live' : (b.mode === 'lan' ? b.host : 'pokerth.net') }));
  (d.notify || []).forEach((c) => all.push({ mode: c.live ? 'live' : c.mode === 'offline' ? 'off' : 'net', who: c.live ? 'spectator' : c.mode === 'offline' ? 'training' : 'direct client', at: c.startedAt, cc: c.cc, where: c.live ? '/live' : c.mode === 'offline' ? 'offline' : 'pokerth.net, direct' }));
  if (!all.length) return '<div class="empty">Nobody connected right now.</div>';
  all.sort((a, b) => b.at - a.at);
  const M = Object.fromEntries(MODES.map((x) => [x.id, x]));
  const rows = all.slice(0, 6).map((r) => '<div class="ovrow"><span class="ovri" style="color:' + M[r.mode].color + '" title="' + M[r.mode].label + '">' + icon(M[r.mode].glyph, 'ovmi') + '</span>' +
    '<span class="ovrn">' + flag(r.cc) + esc(r.who) + '</span><span class="ovrm">' + esc(r.where) + '</span><span class="ovrt">' + esc(dur(d.now - r.at)) + '</span></div>').join('');
  return rows + (all.length > 6 ? '<p class="muted note">and ' + (all.length - 6) + ' more</p>' : '');
}

function auditHtml(d) {
  if (!d || !d.ok) return '<div class="empty err">Could not load the audit log.</div>';
  const e = (d.entries || []).slice(0, 6);
  if (!e.length) return '<div class="empty">Nothing changed yet.</div>';
  const today = new Date().toDateString();
  return e.map((x) => {
    const t = new Date(x.at);
    const when = t.toDateString() === today ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return '<div class="ovrow"><span class="ovrt mono">' + esc(when) + '</span><span class="ovrn">' + esc(auditLabel(x.action)) + (x.ok === false ? ' <span class="err">(' + esc(x.status) + ')</span>' : '') + '</span><span class="ovrm">' + esc(x.master ? 'master' : (x.actor || '?')) + '</span></div>';
  }).join('');
}

// Paint whatever has arrived; a part still missing keeps its placeholder.
export function render(root, st) {
  const q = (id) => root.querySelector('#' + id);
  const set = (id, html) => { const el = q(id); if (el && el.innerHTML !== html) el.innerHTML = html; };
  if (st.status || st.landir || st.errors) set('ovAlerts', alertsHtml(alertsFrom(st)));
  if (st.sessions) set('ovModes', modesHtml(nowByMode(st.sessions), st.live));
  if (st.visits) set('ovChart', st.visits.ok ? chartHtml(dailyByMode(st.visits.series, st.visits.todayKey)) : '<div class="empty err">Could not load the statistics.</div>');
  if (st.status) set('ovHealth', healthHtml(st.status));
  if (st.sessions) {
    set('ovNow', nowListHtml(st.sessions));
    const n = nowByMode(st.sessions);
    const c = n ? n.net.n + n.lan.n + n.off.n + n.live.n : 0;
    set('ovNowN', n ? c + ' connection' + (c === 1 ? '' : 's') : '');
  }
  if (st.audit) set('ovAudit', auditHtml(st.audit));
}

// ── Life cycle ───────────────────────────────────────────────────────────
// Live parts every 10 s, the rest every minute, only while the section is
// open and the page is visible.
const FAST_MS = 10000, SLOW_MS = 60000;
let _fast = null, _slow = null, _st = {}, _seq = 0;

function json(p) { return p.then((r) => r.json()).catch(() => ({ ok: false })); }
function paint() { const root = document.getElementById('panel-overview'); if (root) render(root, _st); }

function loadFast(seq) {
  const A = window.PthAdmin;
  if (!A || document.hidden) return;
  Promise.all([json(A.api('/admin/sessions')), json(A.api('/admin/status'))]).then(([se, s]) => {
    if (seq !== _seq) return;
    _st.sessions = se; _st.status = s; _st.now = Date.now(); paint();
  });
}
function loadSlow(seq) {
  const A = window.PthAdmin;
  if (!A || document.hidden) return;
  Promise.all([
    json(A.api('/admin/visits?days=14')),
    json(A.api('/admin/lan-directory')),
    json(A.api('/admin/errors')),
    json(A.api('/admin/audit')),
    json(fetch('/api/live', { cache: 'no-store' })),
  ]).then(([v, ld, er, au, lv]) => {
    if (seq !== _seq) return;
    _st.visits = v; _st.landir = ld; _st.errors = er; _st.audit = au; _st.live = lv; _st.now = Date.now(); paint();
  });
}
export function start() {
  stop();
  const seq = ++_seq;
  _st = {};
  loadFast(seq); loadSlow(seq);
  _fast = setInterval(() => loadFast(seq), FAST_MS);
  _slow = setInterval(() => loadSlow(seq), SLOW_MS);
}
export function stop() {
  _seq++;
  if (_fast) { clearInterval(_fast); _fast = null; }
  if (_slow) { clearInterval(_slow); _slow = null; }
}

// Security › Audit log reads the same labels (admin.html falls back to the raw
// endpoint until this module has loaded).
if (typeof window !== 'undefined' && window.PthAdmin) window.PthAdmin.auditLabel = auditLabel;

if (typeof document !== 'undefined' && document.getElementById('panel-overview')) {
  document.addEventListener('admin:section', (e) => {
    if (e.detail && e.detail.t === 'overview') start(); else stop();
  });
  // A card's button leads to the section with the detail.
  document.getElementById('panel-overview').addEventListener('click', (e) => {
    const b = e.target && e.target.closest ? e.target.closest('[data-go]') : null;
    if (b && window.PthAdmin) window.PthAdmin.open(b.getAttribute('data-go'));
  });
  // Coming back to the tab: refresh at once rather than at the next tick.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && _fast) { loadFast(_seq); loadSlow(_seq); } });
  // The dashboard may already be on Overview when this module arrives.
  const dash = document.getElementById('dash');
  const on = document.querySelector('.tab.on[data-t="overview"]');
  if (dash && dash.style.display !== 'none' && on && window.PthAdmin) start();
}
