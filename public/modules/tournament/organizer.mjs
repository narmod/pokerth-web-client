// ═══════════════════════════════════════════════════════════════════
// /tournament — « Table check », the first organizer tool (2026-10-23).
//
// Talks to /admin/tournaments/* with the admin token (the same browser key as
// /admin, so a signed-in admin lands straight in). English only for now, like
// the admin; the public views will come in every language of the app.
// Design: docs/TOURNAMENT_DIRECTOR.md.
// ═══════════════════════════════════════════════════════════════════

const TOKK = 'pth_admin_tok';
const THEMEK = 'pth_td_theme';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LIVE = ['connecting', 'waiting', 'running'];

let servers = [];
let lobbyData = null;
let current = null;
let detailTimer = null, listTimer = null, lastLive = null;

function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function tok() { return (load(TOKK) || '').trim(); }

function api(path, body) {
  const opts = { headers: { Authorization: 'Bearer ' + tok() }, cache: 'no-store' };
  if (body) { opts.method = 'POST'; opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  return fetch(path, opts).then((r) => r.json().catch(() => ({ ok: false, error: 'HTTP ' + r.status })).then((d) => {
    if (r.status === 403) { signedOut('Token refused.'); throw new Error('forbidden'); }
    if (r.status === 429) throw new Error(d.error || 'too many failed attempts, retry later');
    return d;
  }));
}

// ── theme ──────────────────────────────────────────────────────────
function applyTheme(t) {
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
  $('themeBtn').textContent = 'Theme: ' + t;
}
$('themeBtn').addEventListener('click', () => {
  const order = ['auto', 'dark', 'light'];
  const next = order[(order.indexOf(load(THEMEK) || 'auto') + 1) % order.length];
  store(THEMEK, next === 'auto' ? null : next);
  applyTheme(next);
});
applyTheme(load(THEMEK) || 'auto');

// ── sign-in ────────────────────────────────────────────────────────
function signedOut(msg) {
  clearInterval(listTimer); clearTimeout(detailTimer);
  $('app').hidden = true; $('signOut').hidden = true; $('signIn').hidden = false;
  $('signInMsg').textContent = msg || '';
  $('signInMsg').className = 'msg' + (msg ? ' bad' : '');
}
$('signInForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  store(TOKK, $('tokIn').value.trim());
  $('tokIn').value = '';
  start();
});
$('signOut').addEventListener('click', () => { store(TOKK, null); signedOut('Signed out.'); });

function start() {
  if (!tok()) return signedOut('');
  api('/admin/tournaments/servers').then((d) => {
    if (!d.ok) { $('fatal').textContent = d.error || 'Not available.'; return; }
    $('fatal').textContent = '';
    $('signIn').hidden = true; $('app').hidden = false; $('signOut').hidden = false;
    servers = d.servers || [];
    $('srvSel').innerHTML = servers.map((s) => '<option value="' + esc(s.ref) + '">' + esc(s.name) + ' — ' + esc(s.host) + ':' + esc(s.port) + (s.tls ? ' (TLS)' : '') + ' · ' + esc({ registry: 'game server', lan: 'LAN directory', local: 'local' }[s.kind] || s.kind) + '</option>').join('');
    refreshList();
    clearInterval(listTimer);
    listTimer = setInterval(refreshList, 5000);
  }).catch(() => {});
}

// ── lobby and tables ───────────────────────────────────────────────
$('lobbyBtn').addEventListener('click', () => {
  const ref = $('srvSel').value;
  $('lobbyMsg').className = 'msg'; $('lobbyMsg').textContent = 'Reading the lobby…';
  $('tables').innerHTML = ''; $('watchForm').hidden = true; lobbyData = null;
  api('/admin/tournaments/lobby', { ref }).then((d) => {
    if (!d.ok) { $('lobbyMsg').className = 'msg bad'; $('lobbyMsg').textContent = 'Could not read the lobby: ' + (d.error || 'error'); return; }
    lobbyData = d;
    const type = { lan: 'LAN server', internetNoAuth: 'server without accounts', internetAuth: 'server with accounts' }[d.serverType] || d.serverType;
    let note = type + ' · ' + (d.players != null ? d.players + ' connected' : '') + ' · ' + d.games.length + ' table' + (d.games.length === 1 ? '' : 's');
    if (!d.watchable) note += ' — not watchable: servers with accounts need the option in Admin › Community › Tournaments';
    $('lobbyMsg').className = 'msg' + (d.watchable ? '' : ' bad'); $('lobbyMsg').textContent = note;
    if (!d.games.length) { $('tables').innerHTML = '<li class="empty">No table open right now.</li>'; return; }
    $('tables').innerHTML = d.games.map((g) => {
      const can = d.watchable && g.allowSpectators;
      const why = !g.allowSpectators ? ' · spectators not allowed' : '';
      return '<li' + (can ? '' : ' class="off"') + '><label><input type="radio" name="tbl" value="' + g.gameId + '"' + (can ? '' : ' disabled') + '>' +
        '<span><span class="tname">' + esc(g.name) + '</span> <span class="chip ' + (g.mode === 'started' ? 'live' : '') + '">' + (g.mode === 'started' ? 'running' : 'waiting') + '</span><br>' +
        '<span class="muted small">#' + g.gameId + ' · ' + g.players + '/' + g.maxPlayers + ' players · ' + esc(g.gameType) + (g.isPrivate ? ' · password' : '') + ' · stack ' + g.startMoney + (g.spectators ? ' · ' + g.spectators + ' watching' : '') + why + '</span></span></label></li>';
    }).join('');
  }).catch((e) => { $('lobbyMsg').className = 'msg bad'; $('lobbyMsg').textContent = e.message === 'forbidden' ? '' : 'Network error'; });
});
$('tables').addEventListener('change', () => {
  const g = selectedGame();
  $('watchForm').hidden = !g;
  $('pwBox').hidden = !(g && g.isPrivate);
  $('watchMsg').textContent = '';
});
function selectedGame() {
  const r = document.querySelector('input[name="tbl"]:checked');
  return r && lobbyData ? lobbyData.games.find((g) => String(g.gameId) === r.value) : null;
}
$('watchBtn').addEventListener('click', () => {
  const g = selectedGame();
  if (!g) return;
  $('watchBtn').disabled = true;
  $('watchMsg').className = 'msg'; $('watchMsg').textContent = 'Starting the director…';
  api('/admin/tournaments/watch', { ref: lobbyData.server.ref, gameId: g.gameId, gameName: g.name, gamePassword: $('gamePw').value || undefined, nick: $('nickIn').value.trim() || undefined })
    .then((d) => {
      $('watchBtn').disabled = false;
      if (!d.ok) { $('watchMsg').className = 'msg bad'; $('watchMsg').textContent = d.error || 'Refused'; return; }
      $('watchMsg').className = 'msg ok'; $('watchMsg').textContent = 'Watching.';
      $('gamePw').value = '';
      refreshList();
      openWatch(d.id);
    }).catch((e) => { $('watchBtn').disabled = false; $('watchMsg').className = 'msg bad'; $('watchMsg').textContent = e.message === 'forbidden' ? '' : 'Network error'; });
});

// ── watches ────────────────────────────────────────────────────────
function statusChip(st, res) {
  if (st === 'finished') return '<span class="chip done">' + (res === 'complete' ? 'complete' : res || 'finished') + '</span>';
  if (LIVE.indexOf(st) >= 0) return '<span class="chip live">' + esc(st) + '</span>';
  if (st === 'stopped') return '<span class="chip warn">stopped</span>';
  return '<span class="chip bad">' + esc(st) + '</span>';
}
function refreshList() {
  api('/admin/tournaments/watches').then((d) => {
    if (!d.ok) return;
    const ws = d.watches || [];
    $('watches').innerHTML = ws.length ? ws.map((w) => '<li><button type="button" data-id="' + esc(w.id) + '"' + (w.id === current ? ' aria-current="true"' : '') + '>' +
      '<span class="wt">' + esc(w.gameName || ('#' + w.gameId)) + ' <span class="muted small">· ' + esc(w.server && w.server.name) + ' · ' + new Date(w.startedAt).toLocaleString() + (w.hand ? ' · hand ' + w.hand : '') + '</span></span>' + statusChip(w.status, w.resultStatus) + '</button></li>').join('')
      : '<li class="empty">None yet.</li>';
  }).catch(() => {});
}
$('watches').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-id]');
  if (b) openWatch(b.dataset.id);
});

function openWatch(id) {
  current = id;
  clearTimeout(detailTimer);
  document.querySelectorAll('#watches button').forEach((b) => b.setAttribute('aria-current', b.dataset.id === id ? 'true' : 'false'));
  loadDetail();
}
function loadDetail() {
  const id = current;
  api('/admin/tournaments/watch?id=' + encodeURIComponent(id)).then((d) => {
    if (id !== current) return;
    if (!d.ok) { $('detailEmpty').hidden = false; $('detailEmpty').textContent = d.error || 'Unknown watch'; $('detailBody').hidden = true; return; }
    renderDetail(d);
    const isLive = LIVE.indexOf(d.state.status) >= 0;
    // A watch that just ended: refresh the list now rather than at the next tick.
    if (!isLive && lastLive === id) refreshList();
    lastLive = isLive ? id : null;
    if (isLive) detailTimer = setTimeout(loadDetail, 2000);
  }).catch(() => { if (id === current) detailTimer = setTimeout(loadDetail, 5000); });
}

function renderDetail(d) {
  const st = d.state || {};
  const live = LIVE.indexOf(st.status) >= 0;
  let h = '<p>' + statusChip(st.status, d.result && d.result.status) + ' <span class="tname">' + esc(st.gameName || d.gameName || ('#' + d.gameId)) + '</span>' +
    ' <span class="muted small">on ' + esc(d.server.name) + ' (' + esc(d.server.host) + ':' + esc(d.server.port) + ') · director ' + esc(d.nick) + (st.hand ? ' · hand ' + st.hand : '') + '</span></p>';
  if (st.error) h += '<p class="msg bad">' + esc(errorText(st.error)) + '</p>';
  if (st.gaps && st.gaps.length) h += '<p class="msg bad">Hands not seen: ' + st.gaps.map((g) => g.fromHand + '–' + g.toHand).join(', ') + '</p>';

  if (d.result) {
    h += '<h3>Ranking</h3><div class="tablewrap"><table><thead><tr><th class="num">#</th><th>Player</th><th class="num">Out in hand</th><th class="num">Stack at start of that hand</th><th></th></tr></thead><tbody>' +
      d.result.ranking.map((r) => '<tr><td class="num">' + r.place + '</td><td>' + esc(r.name || ('#' + r.id)) + '</td><td class="num">' + (r.winner ? '—' : r.elimHand != null ? r.elimHand : '?') + '</td><td class="num">' + (r.stackAtHandStart != null ? r.stackAtHandStart : '—') + '</td><td>' +
        (r.winner ? '<span class="chip done">winner</span>' : '') + (r.tie ? '<span class="chip warn">tie</span>' : '') + (r.unknown ? '<span class="chip warn">hand unknown</span>' : '') + '</td></tr>').join('') + '</tbody></table></div>';
    h += '<p class="small muted">Result: <b>' + esc(d.result.status) + '</b>' + (d.result.status === 'incomplete' ? ' — an organizer has to look at the flags above.' : '') + '</p>';
  } else if (st.players && st.players.length) {
    h += '<h3>Table</h3><div class="tablewrap"><table><thead><tr><th>Player</th><th class="num">Stack</th><th>State</th></tr></thead><tbody>' +
      st.players.map((p) => '<tr' + (p.out ? ' class="out"' : '') + '><td>' + esc(p.name || ('#' + p.id)) + '</td><td class="num">' + (p.money != null ? p.money : '—') + '</td><td>' + (p.out ? 'out' + (p.out.hand ? ' in hand ' + p.out.hand : '') : 'in') + '</td></tr>').join('') + '</tbody></table></div>';
  } else if (live) h += '<p class="empty">Waiting for the game to start…</p>';

  if (d.checks) {
    const c = d.checks;
    const li = (good, text) => '<li' + (good ? '' : ' class="no"') + '>' + text + '</li>';
    h += '<h3>Checks</h3><ul class="checks">' + li(c.chain, 'Journal chain intact (' + d.entries + ' entries)') +
      (d.result ? li(c.headMatches, 'Signed head matches the journal') + li(c.signature, 'Signature valid') + li(c.replay, 'Replaying the journal gives the same ranking') : '') + '</ul>';
    if (d.head) h += '<p class="small muted">Head <span class="mono">' + esc(d.head) + '</span>' + (c.signedBy ? '<br>Signed by <span class="mono">' + esc(c.signedBy) + '</span>' : '') + '</p>';
  }
  if (st.logs && st.logs.length) h += '<h3>Log</h3><div class="log">' + st.logs.map(esc).join('\n') + '</div>';
  h += '<div class="actions">' + (live ? '<button type="button" class="primary" data-act="stop">Stop watching</button>' : '') +
    (d.entries ? '<button type="button" data-act="journal">Download journal</button>' : '') + (d.result ? '<button type="button" data-act="result">Download result</button>' : '') + '</div>';
  $('detailEmpty').hidden = true;
  $('detailBody').hidden = false;
  $('detailBody').innerHTML = h;
}
function errorText(e) {
  const map = {
    joinFailed: 'The server refused the spectator', authServerRefused: 'Server with accounts: not allowed by the settings',
    serverError: 'The server closed the session', gaveUp: 'Connection lost, gave up after several retries',
    removedFromGame: 'Removed from the table', tlsPinMismatch: 'TLS key does not match the pin', startFailed: 'Could not start',
  };
  return (map[e.code] || e.code) + (e.data && e.data.reason ? ' (' + e.data.reason + ')' : '');
}
$('detailBody').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-act]');
  if (!b || !current) return;
  const act = b.dataset.act;
  if (act === 'stop') {
    b.disabled = true;
    api('/admin/tournaments/watch/stop', { id: current }).then(() => { refreshList(); clearTimeout(detailTimer); detailTimer = setTimeout(loadDetail, 800); }).catch(() => { b.disabled = false; });
    return;
  }
  fetch('/admin/tournaments/watch/file?id=' + encodeURIComponent(current) + '&which=' + act, { headers: { Authorization: 'Bearer ' + tok() }, cache: 'no-store' })
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'td-' + current + '.' + act + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }).catch(() => {});
});

start();
