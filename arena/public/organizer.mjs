// ═══════════════════════════════════════════════════════════════════
// /arena — organizer page: « Tournaments » (manual mode,
// tournaments-ui.mjs) and « Table check » (this file) (2026-10-23).
//
// Talks to /admin/arena/* with the admin token (the same browser key as
// /admin, so a signed-in admin lands straight in). English only for now, like
// the admin; the public views will come in every language of the app.
// Design: docs/ARENA.md.
// ═══════════════════════════════════════════════════════════════════

import { createTournamentsView } from './tournaments-ui.mjs';
import { createCupsView } from './cups-ui.mjs';
import { createImagePicker } from './image-pick.mjs';
import { createAccountsView } from './accounts-ui.mjs';
import { createResetView } from './reset-ui.mjs';
import { createHomeView } from './home-ui.mjs';
import { createPlayersView } from './players-ui.mjs';
import { createGroupsView } from './groups-ui.mjs';
import { initTheme } from './theme.mjs';

const TOKK = 'pth_admin_tok';         // a key (master or organizer): shared with /admin
const SESSK = 'pth_arena_session';    // an organizer account's session (as_…)
const VIEWK = 'pth_td_view';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LIVE = ['connecting', 'waiting', 'running'];
const RATE_LIMIT_TEXT = 'The server refused the login for now: too many logins from this proxy’s address in a short time (ServerBruteForceProtection: 5 in a row, then one every 30 s). Wait a little and retry — or, on your own server, add this proxy’s address to ServerBruteForceProtectionExempt, as every web client player connects through it.';

let servers = [];
let lobbyData = null;
let current = null;
let detailTimer = null, listTimer = null, lastLive = null;

function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function tok() { return (load(SESSK) || load(TOKK) || '').trim(); }

function api(path, body) {
  const opts = { headers: { Authorization: 'Bearer ' + tok() }, cache: 'no-store' };
  if (body) { opts.method = 'POST'; opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  return fetch(path, opts).then((r) => r.json().catch(() => ({ ok: false, error: 'HTTP ' + r.status })).then((d) => {
    // A role that may not do this: said, not signed out.
    if (r.status === 403 && d.code === 'role') throw new Error(d.error || 'your role cannot do this');
    if (r.status === 401 && d.code === 'session') { store(SESSK, null); signedOut('Your session has ended: sign in again.'); throw new Error('forbidden'); }
    if (r.status === 403) { signedOut(load(SESSK) ? 'Sign-in refused.' : 'Token refused.'); throw new Error('forbidden'); }
    if (r.status === 429) throw new Error(d.error || 'too many failed attempts, retry later');
    return d;
  }));
}
// The players' API (no token): sign in, the invitation link, sign out.
function pub(path, body) {
  return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' })
    .then((r) => r.json().catch(() => ({ ok: false, error: 'HTTP ' + r.status })));
}

// ── theme (theme.mjs, shared with the players' page) ───────────────
initTheme($('themeBtn'));

// ── views: Tournaments | Table check ────────────────────────────────
const VIEWS = [['tour', 'tabTour', 'viewTour'], ['check', 'tabCheck', 'viewCheck'], ['cups', 'tabCup', 'viewCup'], ['players', 'tabPl', 'viewPl'], ['acc', 'tabAcc', 'viewAcc'], ['home', 'tabHome', 'viewHome'], ['reset', 'tabReset', 'viewReset']];
function setView(v) {
  for (const [k, tab, view] of VIEWS) {
    const on = k === v;
    $(view).hidden = !on;
    $(tab).setAttribute('aria-selected', String(on));
    $(tab).tabIndex = on ? 0 : -1;
  }
  store(VIEWK, v === 'tour' ? null : v);
}
$('tabTour').addEventListener('click', () => { setView('tour'); tours.refresh(); });
$('tabCheck').addEventListener('click', () => { setView('check'); refreshList(); });
$('tabCup').addEventListener('click', () => { setView('cups'); cups.refresh(); });
$('tabAcc').addEventListener('click', () => { setView('acc'); accounts.refresh(); });
$('tabReset').addEventListener('click', () => { setView('reset'); resetView.refresh(); });
$('tabHome').addEventListener('click', () => { setView('home'); homeView.refresh(); });
$('tabPl').addEventListener('click', () => { setView('players'); playersView.refresh(); groupsView.refresh(); });
document.querySelector('.tabs').addEventListener('keydown', (ev) => {
  if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
  const vis = VIEWS.filter((x) => !$(x[1]).hidden);
  const i = vis.findIndex((x) => $(x[1]).getAttribute('aria-selected') === 'true');
  const next = vis[(i + (ev.key === 'ArrowRight' ? 1 : vis.length - 1)) % vis.length][1];
  $(next).click(); $(next).focus();
});
setView(['check', 'cups', 'players'].indexOf(load(VIEWK)) >= 0 ? load(VIEWK) : 'tour');
let you = '';   // who is signed in: « admin » (master key) or an organizer's key name
// The images of tournaments and cups: one library, shared by both views.
const images = createImagePicker({ api, esc });
const tours = createTournamentsView({ api, esc, tok, servers: () => servers, you: () => you, images });
const cups = createCupsView({ api, esc, images, you: () => you, form: () => tours, openTournament: (id) => { setView('tour'); tours.open(id); } });
let role = '', account = null;   // the signed-in role: admin (master key), organizer, referee, viewer
const accounts = createAccountsView({ api, esc, me: () => ({ role, account }) });
// Start again from zero: the super admin only (the tab shows for the master key).
const playersView = createPlayersView({ api, esc, role: () => role });
const groupsView = createGroupsView({ api, esc, role: () => role });
const homeView = createHomeView({ api, esc });
const resetView = createResetView({ api, esc, changed: () => { tours.refresh(); cups.refresh(); refreshList(); } });

// ── the director's avatar ──────────────────────────────────────────
// One of the robots shipped with the service (no image of one's own).
function avShow(msg, bad) { $('avMsg').textContent = msg || ''; $('avMsg').className = 'msg' + (msg ? (bad ? ' bad' : ' ok') : ''); }
function avRefresh() { $('avImg').src = '/arena/avatar?ts=' + Date.now(); avLoad(); }
// The shipped robots: one click picks one; the current one is marked.
function avLoad() {
  api('/admin/arena/avatar?images=1').then((d) => {
    if (!d || !d.ok) return;
    $('avPick').innerHTML = (d.presets || []).map((n) => '<button type="button" class="avopt' + (d.preset === n ? ' on' : '') + '" role="radio" aria-checked="' + (d.preset === n) + '" data-preset="' + n + '" title="Robot ' + n + (n === d.defaultPreset ? ' (default)' : '') + '">' +
      '<img src="' + esc((d.images || {})[n] || '') + '" alt="Robot ' + n + '" width="56" height="56"></button>').join('');
  }).catch(() => {});
}
$('avPick').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-preset]');
  if (!b) return;
  api('/admin/arena/avatar', { preset: Number(b.dataset.preset) }).then((d) => {
    if (!d.ok) return avShow(d.error || 'Refused', true);
    avShow('Robot ' + b.dataset.preset + ' chosen: tables opened from now on show it.'); avRefresh();
  }).catch(() => avShow('Network error', true));
});
$('avReset').addEventListener('click', () => {
  api('/admin/arena/avatar', { reset: true }).then((d) => { if (d.ok) { avShow('Back to the default robot.'); avRefresh(); } else avShow(d.error || 'Refused', true); }).catch(() => avShow('Network error', true));
});

// ── sign-in ────────────────────────────────────────────────────────
function signedOut(msg) {
  clearInterval(listTimer); clearTimeout(detailTimer);
  $('app').hidden = true; $('signOut').hidden = true; $('signIn').hidden = false;
  $('signInMsg').textContent = msg || '';
  $('signInMsg').className = 'msg' + (msg ? ' bad' : '');
}
$('signInForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  store(SESSK, null);
  store(TOKK, $('tokIn').value.trim());
  $('tokIn').value = '';
  start();
});
// An organizer account: login + password → a session.
$('loginForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  $('signInMsg').textContent = 'Signing in…'; $('signInMsg').className = 'msg';
  pub('/arena/api/account/login', { login: $('loginIn').value.trim(), password: $('passIn').value }).then((d) => {
    if (!d.ok) { $('signInMsg').textContent = d.error || 'Refused'; $('signInMsg').className = 'msg bad'; return; }
    $('passIn').value = '';
    store(SESSK, d.token);
    start();
  }).catch(() => { $('signInMsg').textContent = 'Network error'; $('signInMsg').className = 'msg bad'; });
});
// The invitation link (#invite=…): choose a password, then signed in.
function inviteFromHash() { const m = /[#&]invite=([A-Za-z0-9_-]{20,80})/.exec(window.location.hash || ''); return m ? m[1] : null; }
$('inviteForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const say = (t, bad) => { $('inviteMsg').textContent = t; $('inviteMsg').className = 'msg' + (bad ? ' bad' : ''); };
  if ($('invPass').value !== $('invPass2').value) return say('The two passwords differ.', true);
  pub('/arena/api/account/invite', { token: inviteFromHash(), password: $('invPass').value }).then((d) => {
    if (!d.ok) return say(d.error || 'Refused', true);
    history.replaceState(null, '', window.location.pathname);
    $('inviteCard').hidden = true;
    store(SESSK, d.token);
    start();
  }).catch(() => say('Network error', true));
});
$('signOut').addEventListener('click', () => {
  const s = load(SESSK);
  if (s) pub('/arena/api/account/logout', { token: s }).catch(() => {});
  store(SESSK, null); store(TOKK, null); signedOut('Signed out.');
});

function start() {
  if (inviteFromHash()) { $('signIn').hidden = true; $('app').hidden = true; $('inviteCard').hidden = false; return; }
  if (!tok()) return signedOut('');
  api('/admin/arena/servers').then((d) => {
    if (!d.ok) { $('fatal').textContent = d.error || 'Not available.'; return; }
    $('fatal').textContent = '';
    $('signIn').hidden = true; $('app').hidden = false; $('signOut').hidden = false;
    servers = d.servers || [];
    api('/admin/arena/status').then((st) => {
      you = (st && st.you) || '';
      role = (st && st.role) || 'organizer'; account = (st && st.account) || null;
      document.body.dataset.role = role;
      const roleName = { admin: 'super admin', organizer: 'organizer', referee: 'referee', viewer: 'read only' }[role] || role;
      $('signOut').textContent = you ? 'Sign out (' + you + ' · ' + roleName + ')' : 'Sign out';
      $('signOut').title = role === 'admin' ? 'Signed in with the master key (super admin)' : 'Signed in as « ' + you + ' », ' + roleName;
      $('tabAcc').textContent = role === 'admin' ? 'Accounts' : 'My account';
      if (document.querySelector('#tabAcc[aria-selected="true"]')) accounts.refresh();
      if (document.querySelector('#tabPl[aria-selected="true"]')) { playersView.refresh(); groupsView.refresh(); }
      $('tabReset').hidden = role !== 'admin';
      $('tabHome').hidden = role !== 'admin';
      if (role !== 'admin' && document.querySelector('#tabReset[aria-selected="true"], #tabHome[aria-selected="true"]')) setView('tour');
    }).catch(() => {});
    $('srvSel').innerHTML = servers.map((s) => '<option value="' + esc(s.ref) + '">' + esc(s.name) + ' — ' + esc(s.host) + ':' + esc(s.port) + (s.tls ? ' (TLS)' : '') + ' · ' + esc({ registry: 'game server', lan: 'LAN directory', local: 'local' }[s.kind] || s.kind) + '</option>').join('');
    refreshList();
    tours.refresh();
    cups.refresh();
    avLoad();
    clearInterval(listTimer);
    listTimer = setInterval(refreshList, 5000);
  }).catch(() => {});
}

// ── lobby and tables ───────────────────────────────────────────────
$('lobbyBtn').addEventListener('click', () => {
  const ref = $('srvSel').value;
  $('lobbyMsg').className = 'msg'; $('lobbyMsg').textContent = 'Reading the lobby…';
  $('tables').innerHTML = ''; $('watchForm').hidden = true; lobbyData = null;
  api('/admin/arena/lobby', { ref }).then((d) => {
    if (!d.ok) {
      $('lobbyMsg').className = 'msg bad';
      $('lobbyMsg').textContent = /initBlocked/.test(d.error || '') ? RATE_LIMIT_TEXT : 'Could not read the lobby: ' + (d.error || 'error');
      return;
    }
    lobbyData = d;
    const type = { lan: 'LAN server', internetNoAuth: 'server without accounts', internetAuth: 'server with accounts' }[d.serverType] || d.serverType;
    let note = type + ' · ' + (d.players != null ? d.players + ' connected' : '') + ' · ' + d.games.length + ' table' + (d.games.length === 1 ? '' : 's');
    if (!d.watchable) note += ' — not watchable: LAN servers only (no server with accounts such as pokerth.net)';
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
  api('/admin/arena/watch', { ref: lobbyData.server.ref, gameId: g.gameId, gameName: g.name, gamePassword: $('gamePw').value || undefined, nick: $('nickIn').value.trim() || undefined })
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
  api('/admin/arena/watches').then((d) => {
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
  api('/admin/arena/watch?id=' + encodeURIComponent(id)).then((d) => {
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
  if (st.error) h += '<p class="msg bad">' + esc(errorText(st.error)) + (st.error.data && st.error.data.message ? ': ' + esc(st.error.data.message) : '') + '</p>';
  if (st.status === 'crashed') h += '<p class="msg bad">The director process stopped without saying why (killed, or out of memory). Its output is below.</p>';
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
  if (d.processLog) h += '<details' + (st.status === 'crashed' ? ' open' : '') + '><summary class="small muted">Process output (worker.log)</summary><div class="log">' + esc(d.processLog) + '</div></details>';
  h += '<div class="actions">' + (live ? '<button type="button" class="primary" data-act="stop">Stop watching</button>' : '') +
    (d.entries ? '<button type="button" data-act="journal">Download journal</button>' : '') + (d.result ? '<button type="button" data-act="result">Download result</button>' : '') + '</div>';
  $('detailEmpty').hidden = true;
  $('detailBody').hidden = false;
  $('detailBody').innerHTML = h;
}
function errorText(e) {
  const map = {
    joinFailed: 'The server refused the spectator', authServerRefused: 'Server with accounts (pokerth.net): LAN servers only for now',
    serverError: 'The server closed the session', gaveUp: 'Connection lost, gave up after several retries',
    rateLimited: 'Login kept being refused: too many logins from this proxy’s address. Add it to ServerBruteForceProtectionExempt in the server config', removedFromGame: 'Removed from the table', tlsPinMismatch: 'TLS key does not match the pin', startFailed: 'Could not start',
    uncaughtException: 'The director stopped on an error', unhandledRejection: 'The director stopped on an error',
  };
  return (map[e.code] || e.code) + (e.data && e.data.reason ? ' (' + e.data.reason + ')' : '');
}
$('detailBody').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-act]');
  if (!b || !current) return;
  const act = b.dataset.act;
  if (act === 'stop') {
    b.disabled = true;
    api('/admin/arena/watch/stop', { id: current }).then(() => { refreshList(); clearTimeout(detailTimer); detailTimer = setTimeout(loadDetail, 800); }).catch(() => { b.disabled = false; });
    return;
  }
  fetch('/admin/arena/watch/file?id=' + encodeURIComponent(current) + '&which=' + act, { headers: { Authorization: 'Bearer ' + tok() }, cache: 'no-store' })
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
