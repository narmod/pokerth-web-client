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

// ── Client errors, by type ───────────────────────────────────────────────
// The same five types as Admin › Errors (admin.html, ER_KINDS / _erKind; kept
// in step by scripts/test-admin-overview.mjs), in the same order and colours.
// Only the first three ask for something to be done: « Recovered » says an
// in-page retry got the file in the end, « Diagnostics » are the probes that
// answered 200 and the boot-stall page states.
export const ERR_KINDS = [
  { id: 'crash',  label: 'script',     color: 'var(--err-text)',  act: true },
  { id: 'reject', label: 'rejection',  color: 'var(--warn-text)', act: true },
  { id: 'load',   label: 'load',       color: 'var(--m-live)',    act: true },
  { id: 'ok',     label: 'recovered',  color: 'var(--ok-text)',   act: false },
  { id: 'diag',   label: 'diagnostic', color: 'var(--muted)',     act: false },
];
export function errKind(e) {
  const m = String((e && e.msg) || '');
  if (/^Unhandled rejection\b/.test(m)) return 'reject';
  if (/^(Load-failure retry #\d+|Lang load retry) recovered\b/.test(m)) return 'ok';
  if (/^(Boot stall|Module graph|Login form):/.test(m)) return 'diag';
  if (/^Load-failure probe:/.test(m)) return /^Load-failure probe: HTTP [45]\d\d\b/.test(m) ? 'load' : 'diag';
  if (/^(Failed to load |Load-failure retry #\d+ failed|Lang load failed)/.test(m)) return 'load';
  return 'crash';
}

// ── What needs attention ─────────────────────────────────────────────────
// Most urgent first. With nothing to report the row says so, rather than
// leaving a gap the operator has to interpret.
export function alertsFrom(st) {
  const out = [];
  const s = st.status;
  const now = st.now || Date.now();
  if (s && s.ok) {
    if (proxyStale(s)) {
      out.push({ kind: 'warn', glyph: 'terminal', title: 'Restart needed',
        sub: 'Files are ' + s.version + ', the proxy still runs ' + s.runningVersion, label: 'Deployment', t: 'deploy' });
    }
    const u = s.update || {};
    // A failed read of the upstream (git fetch refused, network…) left
    // `available` false: no card at all, or « All clear », while updates
    // could be waiting unseen. The error itself was only on Deployment.
    if (u.error && !u.available && s.gitUpdatable !== false) {
      out.push({ kind: 'warn', glyph: 'download', title: 'Update check failed',
        sub: String(u.error).slice(0, 120) + (u.checkedAt ? ' · checked ' + ago(now - u.checkedAt) : ''),
        label: 'Deployment', t: 'deploy' });
    }
    if (u.available) {
      out.push({ kind: 'ok', glyph: 'download', title: 'Update available',
        sub: (u.remote ? String(u.remote).slice(0, 8) + ' · ' : '') + (u.skipped ? 'left alone by the automatic updates' : (u.needsRestart ? 'needs a restart' : 'client files only, no restart'))
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
      // The colour follows the worst type seen in the last 24 h: red for an
      // exception or a rejection, amber for a file that never arrived; a
      // retry that recovered, a diagnostic or anything older stays calm. The
      // count is the groups that ask for something to be done.
      const kinds = {}; ERR_KINDS.forEach((k) => { kinds[k.id] = 0; });
      const act = [], fresh = {};
      real.forEach((g) => {
        const k = errKind(g); kinds[k]++;
        if (ERR_KINDS.some((x) => x.id === k && x.act)) act.push(g);
        if (now - (g.last || 0) < 864e5) fresh[k] = true;
      });
      const pool = act.length ? act : real;
      const last = Math.max.apply(null, pool.map((g) => g.last || 0));
      const day = act.filter((g) => now - (g.last || 0) < 864e5).length;
      const sev = (fresh.crash || fresh.reject) ? 'err' : fresh.load ? 'warn' : 'info';
      out.push({ kind: sev, glyph: 'warning', kinds,
        title: act.length ? act.length + ' client error' + (act.length === 1 ? '' : 's') : 'No client error to act on',
        sub: act.length
          ? (day ? day + ' seen in the last 24 h' : 'none in the last 24 h') + (last ? ' · last ' + ago(now - last) : '')
          : 'only retries that recovered and diagnostics' + (last ? ' · last ' + ago(now - last) : ''),
        label: 'Open', t: 'errors', ek: 'all' });
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
  'lan-boards': 'LAN leaderboards changed', 'leaderboard/reset': 'Leaderboard reset',
  'leaderboard/delete': 'Player removed from the leaderboard', 'tokens': 'Delegate key created', 'tokens/delete': 'Delegate key revoked',
  'update': 'Update deployed', 'restart': 'Proxy restarted', 'schedule-restart': 'Restart scheduled',
  'cancel-restart': 'Restart cancelled', 'auto-update': 'Automatic updates changed', 'pkg-upload': 'Package uploaded',
  'pkg-remove': 'Package removed', 'pkg-toggle': 'Package switched', 'music-upload-finish': 'Track uploaded',
  'music-remove': 'Track removed', 'music-toggle': 'Track switched', 'music-enable': 'Music switched',
  'sessions': 'Session disconnected', 'errors': 'Error list changed', 'clear-logs': 'Logs cleared',
  'blocked': 'Address unblocked', 'db': 'MySQL mirror changed', 'clock': 'Clocks changed',
};
// The proxy runs older code than what is on disk (codeStale, web.172); before
// that field, the version strings — which a client-only deploy also moves.
export function proxyStale(s) {
  if (!s) return false;
  if (typeof s.codeStale === 'boolean') return s.codeStale;
  return !!(s.runningVersion && s.version && s.runningVersion !== s.version);
}
export function auditLabel(a) { return ACTIONS[a] || a || '?'; }

// ── Rendering ────────────────────────────────────────────────────────────
// The client errors card: one bar split by type, and a legend whose entries
// open Admin › Errors already filtered on that type (data-ek).
export function errKindsHtml(kinds) {
  if (!kinds) return '';
  const on = ERR_KINDS.filter((k) => kinds[k.id]);
  if (!on.length) return '';
  const tot = on.reduce((s, k) => s + kinds[k.id], 0);
  const sum = on.map((k) => kinds[k.id] + ' ' + k.label).join(', ');
  return '<div class="ovebar" role="img" aria-label="' + esc(tot + ' by type: ' + sum) + '">' +
    on.map((k) => '<i data-go="errors" data-ek="' + k.id + '" style="flex:' + kinds[k.id] + ';background:' + k.color + '"></i>').join('') + '</div>' +
    '<div class="ovekinds">' + on.map((k) => '<button type="button" data-go="errors" data-ek="' + k.id + '" style="--kc:' + k.color + '" title="Open the ' + esc(k.label) + ' errors"><i></i>' +
      kinds[k.id] + ' ' + esc(k.label) + '</button>').join('') + '</div>';
}

function alertsHtml(list) {
  return list.map((a) => '<div class="ovalert ov-' + a.kind + '">' + icon(a.glyph, 'ovai') +
    '<div class="ovat"><b>' + esc(a.title) + '</b><span>' + esc(a.sub) + '</span>' + errKindsHtml(a.kinds) + '</div>' +
    (a.t ? '<button type="button" class="ovgo" data-go="' + esc(a.t) + '"' + (a.ek ? ' data-ek="' + esc(a.ek) + '"' : '') + '>' + esc(a.label) + '</button>' : '') + '</div>').join('');
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
  const bars = rows.map((r, i) => {
    const d = new Date(r.date + 'T12:00:00');
    const on = MODES.filter((x) => r[x.id]);
    // The top segment carries the rounded corners; the day's total sits on it.
    const segs = on.map((x, j) => '<i style="height:' + (r[x.id] / max * 100).toFixed(2) + '%;background:' + x.color + '"' + (j === on.length - 1 ? ' class="ovtop"' : '') + '></i>').join('');
    const tot = r.total ? '<b class="ovtot"><span class="tl">' + nf(r.total) + '</span><span class="ts">' + compact(r.total) + '</span></b>' : '';
    return '<div class="ovbar' + (r.today ? ' today' : '') + '" data-i="' + i + '"><div class="ovstack">' + segs + tot + '</div><span>' + (isNaN(d) ? '' : d.getDate()) + '</span></div>';
  }).join('');
  _chartRows = rows;
  const sum = MODES.map((x) => x.label + ' ' + tot[x.id]).join(', ');
  return '<div class="ovchartw"><div class="ovchart" role="img" aria-label="Connections per day over 14 days by entry mode: ' + esc(sum) + '">' + bars + '</div>' +
    '<div class="chartgd"></div><div class="chartro ovtip"></div></div>' +
    '<div class="ovlegend">' + MODES.map((x) => '<span><i style="background:' + x.color + '"></i>' + x.label + ' <b>' + nf(tot[x.id]) + '</b></span>').join('') +
    '<span class="ovpeak">peak ' + nf(max) + ' a day</span></div>';
}

// A day's total in four characters at most, for a phone's narrow bars.
export function compact(n) {
  if (n < 1000) return String(n);
  if (n < 10000) return (Math.round(n / 100) / 10).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n < 1e6) return Math.round(n / 1000) + 'k';
  return (Math.round(n / 1e5) / 10) + 'M';
}

// ── Reading a bar ─────────────────────────────────────────────────────────
// The bars used to carry a title, which a phone never shows. Same reading as
// the Statistics charts (.chartro): the mouse moves it and it leaves with the
// pointer; a finger's tap leaves it in place, and a tap outside the chart
// puts it away. The rows of the last paint are kept for it.
let _chartRows = [], _tipAt = -1;
export function tipHtml(r) {
  if (!r) return '';
  const d = new Date(r.date + 'T12:00:00');
  const day = isNaN(d) ? r.date : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return '<b>' + esc(day) + (r.today ? ' · so far' : '') + '</b>' +
    MODES.map((x) => '<span><em style="background:' + x.color + '"></em><i>' + esc(x.label) + '</i><s>' + nf(r[x.id]) + '</s></span>').join('') +
    '<span class="ovtipt"><em></em><i>Total</i><s>' + nf(r.total) + '</s></span>';
}
function tipShow(box, i, clientY) {
  const r = _chartRows[i], bar = box.querySelector('.ovbar[data-i="' + i + '"]');
  const ro = box.querySelector('.ovtip'), gd = box.querySelector('.chartgd');
  if (!r || !bar || !ro || !gd) return;
  _tipAt = i;
  const hb = box.getBoundingClientRect(), bb = bar.getBoundingClientRect(), st = bar.querySelector('.ovstack').getBoundingClientRect();
  const cx = bb.left - hb.left + bb.width / 2;
  gd.style.left = cx.toFixed(1) + 'px'; gd.style.top = (st.top - hb.top).toFixed(1) + 'px'; gd.style.height = st.height.toFixed(1) + 'px';
  gd.style.display = 'block';
  ro.innerHTML = tipHtml(r);
  ro.style.left = '0px'; ro.style.display = 'block';
  const w = ro.offsetWidth, h = ro.offsetHeight;
  ro.style.left = Math.max(0, Math.min(hb.width - w, cx - w / 2)).toFixed(1) + 'px';
  let top = (clientY == null ? st.top + st.height / 2 : clientY) - hb.top + 14;
  if (top + h > hb.height) top = Math.max(0, (clientY == null ? st.top : clientY) - hb.top - h - 14);
  ro.style.top = top.toFixed(1) + 'px';
}
function tipHide(box) {
  _tipAt = -1;
  if (!box) return;
  const ro = box.querySelector('.ovtip'), gd = box.querySelector('.chartgd');
  if (ro) ro.style.display = 'none';
  if (gd) gd.style.display = 'none';
}
function tipWire(host) {
  if (!host || host._ovTip) return;
  host._ovTip = 1;
  const read = (e) => {
    const box = host.querySelector('.ovchartw'); if (!box) return;
    const bars = box.querySelectorAll('.ovbar'); if (!bars.length) return;
    // The column under the pointer, by x only: a short bar reads as well as
    // a tall one, and a finger need not land on the colour.
    let i = -1;
    bars.forEach((b) => { const rc = b.getBoundingClientRect(); if (e.clientX >= rc.left - 3 && e.clientX <= rc.right + 3) i = +b.getAttribute('data-i'); });
    if (i < 0) { if (e.pointerType === 'mouse') tipHide(box); return; }
    tipShow(box, i, e.clientY);
  };
  host.addEventListener('pointerdown', read, { passive: true });
  host.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || (e.buttons & 1)) read(e); }, { passive: true });
  host.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') tipHide(host.querySelector('.ovchartw')); }, { passive: true });
  document.addEventListener('pointerdown', (e) => { if (!host.contains(e.target)) tipHide(host.querySelector('.ovchartw')); }, { passive: true });
}

function healthHtml(s) {
  if (!s || !s.ok) return '<div class="empty err">Could not load the server status.</div>';
  const stale = proxyStale(s);
  const u = s.update || {};
  const rows = [
    ['Build', esc(s.version || '—') + (stale ? ' <span class="err">(running ' + esc(s.runningVersion) + ')</span>' : '')],
    ['Uptime', esc(fmtUptime(s.uptimeSec))],
    ['Install', esc(s.installKind || '—') + ' · ' + (s.gitUpdatable === false ? 'no self-update' : 'self-update')],
    ['Updates', u.checkedAt ? (u.available ? 'available' : 'up to date') + ' · checked ' + esc(ago(Date.now() - u.checkedAt)) : (s.gitUpdatable === false ? 'by image' : 'not checked yet')],
    // The cap is on game bridges; the sockets also count notify channels and /live.
    ['Connections', s.bridges != null
      ? nf(s.bridges) + ' game bridge' + (s.bridges === 1 ? '' : 's') + (s.maxClients ? ' of ' + nf(s.maxClients) : ' · no cap') + ' · ' + nf(s.sockets) + ' sockets in all'
      : nf(s.sockets) + (s.maxClients ? ' of ' + nf(s.maxClients) : ' · no cap')],
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
  if (st.visits) {
    const keep = _tipAt;
    set('ovChart', st.visits.ok ? chartHtml(dailyByMode(st.visits.series, st.visits.todayKey)) : '<div class="empty err">Could not load the statistics.</div>');
    tipWire(q('ovChart'));
    // A refresh redraws the chart: a reading left open by a tap stays open.
    const box = q('ovChart') && q('ovChart').querySelector('.ovchartw');
    if (keep >= 0 && box && box.querySelector('.ovtip') && box.querySelector('.ovtip').style.display !== 'block') tipShow(box, keep, null);
  }
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
function botsShown() { try { return localStorage.getItem('pth_admin_bots') === '1'; } catch (e) { return false; } }
function loadSlow(seq) {
  const A = window.PthAdmin;
  if (!A || document.hidden) return;
  Promise.all([
    // Same « Hide bots » as Statistics (pth_admin_bots), or the two pages
    // gave different totals for the same days.
    json(A.api('/admin/visits?days=14' + (botsShown() ? '&bots=1' : ''))),
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
if (typeof window !== 'undefined' && window.PthAdmin) { window.PthAdmin.auditLabel = auditLabel; window.PthAdmin.proxyStale = proxyStale; }

if (typeof document !== 'undefined' && document.getElementById('panel-overview')) {
  document.addEventListener('admin:section', (e) => {
    if (e.detail && e.detail.t === 'overview') start(); else stop();
  });
  // A card's button leads to the section with the detail.
  document.getElementById('panel-overview').addEventListener('click', (e) => {
    const b = e.target && e.target.closest ? e.target.closest('[data-go]') : null;
    if (!b || !window.PthAdmin) return;
    // The client errors card picks the type Admin › Errors opens on.
    const ek = b.getAttribute('data-ek');
    if (ek && typeof window.PthAdmin.errKindPick === 'function') window.PthAdmin.errKindPick(ek);
    window.PthAdmin.open(b.getAttribute('data-go'));
  });
  // Coming back to the tab: refresh at once rather than at the next tick.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && _fast) { loadFast(_seq); loadSlow(_seq); } });
  // The dashboard may already be on Overview when this module arrives.
  const dash = document.getElementById('dash');
  const on = document.querySelector('.tab.on[data-t="overview"]');
  if (dash && dash.style.display !== 'none' && on && window.PthAdmin) start();
}
