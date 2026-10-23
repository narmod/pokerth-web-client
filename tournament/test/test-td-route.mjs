#!/usr/bin/env node
// Live test of /tournament and /admin/tournaments/* on a real proxy, which
// launches the tournament service (tournament/server.mjs) and relays to it,
// with the scripted fake PokerTH server standing in as the install's local
// server. Then the page itself (tournament/public/organizer.mjs) is driven in
// jsdom against that proxy: sign-in, lobby, watch, result, tournaments.
// Run: node tournament/test/test-td-route.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { freePort } from '../../scripts/lib/free-port.mjs';
import { S, fakeServer, answerNames, wait } from './lib/td-fake-server.mjs';
import { buildPdb, sampleGames } from './lib/td-pdb-fixture.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Fake game server: guest logins read the lobby, the director gets a game.
const game = await fakeServer((conn) => {
  answerNames(conn);
  conn.sock.write(S.announce());
  conn.after = async (m) => {
    if (m.initMessage) conn.sock.write(Buffer.concat([S.initAck(), S.gameList()]));
    if (m.joinExistingGameMessage) {
      conn.sock.write(S.joinAck());
      await wait(100);
      conn.sock.write(Buffer.concat([S.start(), S.hand([0, 0, 0, 0]), S.act(14, 0), S.act(12, 600), S.act(13, 400), S.show([[11, 2000], [14, 0]])]));
      await wait(100);
      conn.sock.write(Buffer.concat([S.hand([0, 0, 0, 2]), S.act(12, 0), S.act(13, 0), S.hide(11, 4000), S.end(11)]));
    }
  };
});

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'td-route-'));
const F = (x) => path.join(tmp, x);
fs.writeFileSync(F('admin-config.json'), JSON.stringify({ loginDefaults: { lanMode: 'forced', host: '127.0.0.1', lanPort: game.port, lanTls: false } }));
const PORT = await freePort();
const TOKEN = 'td-route-token';
const env = Object.assign({}, process.env, {
  PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN, RATE_LIMIT_DISABLED: '1',
  ADMIN_CONFIG_FILE: F('admin-config.json'), VISITS_FILE: F('visits.json'), STATS_FILE: F('stats.json'),
  STATS_META_FILE: F('stats.meta.json'), BROADCASTS_FILE: F('broadcasts.json'), POLLS_FILE: F('polls.json'),
  DB_CONFIG_FILE: F('db-config.json'), DEPLOY_HISTORY_FILE: F('deploy-history.json'),
  SCOPED_TOKENS_FILE: F('scoped-tokens.json'), AUDIT_FILE: F('admin-audit.json'), LAN_BOARDS_FILE: F('lan-boards.json'),
  TD_DIR: F('td'), TD_CODE_POLL_MS: '300',
});
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env });
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const H = { Authorization: 'Bearer ' + TOKEN };
const get = (p, h) => fetch(base + p, { headers: h || H });
const post = (p, body, h) => fetch(base + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, h || H), body: JSON.stringify(body) });
let up = false;
for (let i = 0; i < 80 && !up; i++) { await wait(150); try { up = (await (await get('/admin/whoami')).json()).ok; } catch (e) {} }

try {
  ok(up, 'proxy up');
  // ── off by default ──
  ok((await get('/tournament', {})).status === 404 && (await get('/tournament.html', {})).status === 404, 'off: /tournament and /tournament.html answer 404');
  ok((await get('/admin/tournaments/settings', {})).status === 403, 'settings need the token');
  const s0 = await (await get('/admin/tournaments/settings')).json();
  ok(s0.ok && s0.enabled === false && s0.key === null, 'off by default, no key yet');
  ok((await get('/admin/tournaments/servers')).status === 409, 'tools answer 409 while off');
  // ── on ──
  ok(!/\[td\] tournament director/.test(plog), 'off: the service is not running');
  const s1 = await (await post('/admin/tournaments/settings', { enabled: true })).json();
  ok(s1.ok && s1.enabled && s1.key && s1.key.publicKeyRaw, 'enabling starts the service, which creates the install key');
  ok(s1.service && s1.service.status === 'running' && /^0\.\d+\.\d+/.test(s1.service.version) && s1.running === 0 && s1.maxRunning === 4, 'settings: the service is running, with its own version');
  ok(fs.existsSync(F('td/td-key.pem')), 'the key lives in TD_DIR');
  const page = await get('/tournament/organize', {});
  const html = await page.text();
  ok(page.status === 200 && /Table check/.test(html) && /noindex/.test(html), 'on: /tournament/organize served, noindex');
  const pubPage = await get('/tournament', {});
  ok(pubPage.status === 200 && /public\.mjs/.test(await pubPage.text()), 'on: /tournament is the players\' page');
  const css = await (await get('/tournament/td.css', {})).text();
  ok(/no-store/.test(page.headers.get('cache-control') || ''), 'served no-store');
  ok(/viewport-fit=cover/.test(html) && /env\(safe-area-inset-top\)/.test(css) && /rel="manifest" href="\/tournament\/manifest\.json"/.test(html), 'page: phone notch safe areas and its own app manifest');
  ok(html.indexOf(s1.service.version) >= 0, 'page: shows the service version');
  ok((await get('/tournament/..%2F..%2Fadmin%2Ftournaments%2Ft%2Flist', {})).status === 404 && (await get('/tournament/proxy.js', {})).status === 404, 'page: only the page and its files are relayed');
  const man = await (await get('/tournament/manifest.json', {})).json();
  ok(man.start_url === '/tournament' && man.scope === '/tournament' && man.display === 'standalone', 'manifest: installable on its own, scoped to /tournament');
  ok(man.icons.every((i) => fs.existsSync(path.join(root, 'public', i.src))), 'manifest: every icon exists');
  const srv = await (await get('/admin/tournaments/servers')).json();
  const local = srv.servers && srv.servers.find((x) => x.ref === 'local');
  ok(local && local.port === game.port, 'servers: the local server from the login defaults');
  const lob = await (await post('/admin/tournaments/lobby', { ref: 'local' })).json();
  ok(lob.ok && lob.watchable && lob.games.length === 1 && lob.games[0].name === 'Friday SnG', 'lobby read through the proxy');
  ok((await post('/admin/tournaments/watch', { ref: 'local', gameId: 7 }, {})).status === 403, 'watch needs the token');
  const cfg = JSON.parse(fs.readFileSync(F('admin-config.json'), 'utf8'));
  ok(cfg.tournaments && cfg.tournaments.enabled === true, 'the setting is saved in admin-config.json');

  // ── the page, in jsdom, against this proxy ──
  // ── the players' API through the web client: no token, the address set by the proxy ──
  {
    const t = await (await post('/admin/tournaments/t/create', { name: 'Proxy cup', profile: 'club' })).json();
    const reg = (nick, spoof) => fetch(base + '/tournament/api/t/' + t.publicKey + '/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': spoof }, body: JSON.stringify({ nick }) });
    const st = [];
    for (let i = 0; i < 7; i++) st.push((await reg('N' + i, '198.51.100.' + i)).status);
    ok(st.slice(0, 6).every((x) => x === 200) && st[6] === 429, 'public API: relayed without a token; a spoofed address header does not dodge the limit');
    const big = await fetch(base + '/tournament/api/t/' + t.publicKey + '/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nick: 'x'.repeat(9000) }) });
    ok(big.status === 413, 'public API: a large body is refused by the web client');
    ok((await get('/tournament/api/secret', {})).status === 404 && (await get('/tournament/api/list', {})).status === 200, 'public API: only its routes');
    // Witnesses: the table lookup, and a report larger than other requests.
    const lk = await fetch(base + '/tournament/api/table?game=5&name=Proxy%20cup');
    ok(lk.status === 404 && (await lk.json()).code === 'notFound', 'witness: the table lookup is relayed (no such table: 404 from the director)');
    const wit = (size) => fetch(base + '/tournament/api/t/' + t.publicKey + '/witness', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.99' },
      body: JSON.stringify({ nick: 'N1', pad: 'x'.repeat(size), report: { players: ['N1'], hands: [[1, 5]] } }) });
    const w1 = await wit(20000);
    ok(w1.status === 400 && (await w1.json()).code === 'noTable', 'witness: a 20 KB report passes the web client (the director answers)');
    ok((await wit(70000)).status === 413, 'witness: over 64 KB, refused by the web client');
    await post('/admin/tournaments/t/player', { id: t.id, action: 'remove', nick: 'N0' });
  }

  const dom = new JSDOM(html, { url: base + '/tournament/organize', pretendToBeVisual: true });
  const w = dom.window;
  for (const k of ['window', 'document', 'localStorage', 'HTMLElement', 'Node', 'Event', 'URL']) {
    try { Object.defineProperty(globalThis, k, { value: k === 'window' ? w : w[k], configurable: true, writable: true }); } catch (e) {}
  }
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = (u, o) => nativeFetch(new URL(u, base), o);
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  await import(pathToFileURL(path.join(root, 'tournament', 'public', 'organizer.mjs')).href + '?t=' + Date.now());
  const $ = (id) => w.document.getElementById(id);
  await wait(200);
  ok(!$('signIn').hidden && $('app').hidden, 'page: asks for the token first');
  $('tokIn').value = TOKEN;
  $('signInForm').dispatchEvent(new w.Event('submit', { cancelable: true }));
  for (let i = 0; i < 30 && $('app').hidden; i++) await wait(100);
  ok(!$('app').hidden && $('srvSel').options.length >= 1, 'page: signed in, servers listed');
  ok(!$('viewTour').hidden && $('viewCheck').hidden && $('tabTour').getAttribute('aria-selected') === 'true', 'page: opens on the Tournaments view');
  $('tabCheck').click();
  ok($('viewTour').hidden && !$('viewCheck').hidden, 'page: Table check tab');
  ok(w.localStorage.getItem('pth_admin_tok') === TOKEN, 'page: shares the admin token key');
  $('srvSel').value = 'local';
  $('lobbyBtn').click();
  for (let i = 0; i < 50 && !w.document.querySelector('input[name="tbl"]'); i++) await wait(100);
  const radio = w.document.querySelector('input[name="tbl"]');
  ok(radio && /Friday SnG/.test($('tables').textContent), 'page: the table is listed');
  radio.checked = true;
  $('tables').dispatchEvent(new w.Event('change', { bubbles: true }));
  ok(!$('watchForm').hidden, 'page: the watch form opens');
  $('watchBtn').click();
  for (let i = 0; i < 150 && !/Ranking/.test($('detailBody').textContent); i++) await wait(100);
  const body = $('detailBody').textContent;
  ok(/Ranking/.test(body) && body.indexOf('Alice') < body.indexOf('Bob') && body.indexOf('Bob') < body.indexOf('Carol'), 'page: the sealed ranking is shown');
  ok(/Signature valid/.test(body) && w.document.querySelectorAll('#detailBody .checks li.no').length === 0, 'page: every check passes');
  ok(/Download journal/.test(body) && /Download result/.test(body), 'page: downloads offered');
  for (let i = 0; i < 80 && !/complete/.test($('watches').textContent); i++) await wait(100);
  ok(/complete/.test($('watches').textContent), 'page: the watch is listed as complete');
  // Theme switch.
  $('themeBtn').click();
  ok(w.document.documentElement.getAttribute('data-theme') === 'dark' && w.localStorage.getItem('pth_td_theme') === 'dark', 'page: theme switch to dark, remembered');
  ok([...w.document.querySelectorAll('meta[name="theme-color"]')].every((m) => m.getAttribute('content') === '#12161d' && !m.hasAttribute('media')), 'page: the app bar follows the forced theme');
  $('themeBtn').click();
  ok(w.document.documentElement.getAttribute('data-theme') === 'light', 'page: then light');
  $('themeBtn').click();
  ok(!w.document.documentElement.hasAttribute('data-theme'), 'page: then back to the system choice');

  // ── Tournaments view (manual mode) ──
  const until = async (cond, n) => { for (let i = 0; i < (n || 60) && !cond(); i++) await wait(100); return cond(); };
  const det = () => $('tDetailBody').textContent;
  const act = (a, i) => w.document.querySelector('#tDetailBody [data-act="' + a + '"]' + (i != null ? '[data-i="' + i + '"]' : ''));
  $('tabTour').click();
  ok(!$('viewTour').hidden && w.localStorage.getItem('pth_td_view') === null, 'tournaments: back on the Tournaments tab');
  ok([...$('tSrv').options].some((o) => o.value === 'local'), 'tournaments: the LAN servers are offered');
  $('tName').value = 'Friday cup'; $('tSrv').value = 'local';
  $('tCreateForm').dispatchEvent(new w.Event('submit', { cancelable: true }));
  ok(await until(() => /Friday cup/.test(det()) && /Friday cup/.test($('tList').textContent)), 'tournaments: created from the form, listed and opened');
  ok(/club/.test(det()) && /Local server|local/i.test(det()), 'tournaments: club profile and the server recorded');
  const wSrc = w.document.querySelector('input[name="tSource"][value="watch"]');
  wSrc.checked = true; wSrc.dispatchEvent(new w.Event('change', { bubbles: true }));
  ok(await until(() => $('tWatchSel') && $('tWatchSel').value), 'tournaments: the finished Table check is offered');
  act('setWatch').click();
  ok(await until(() => /validated/.test(det()) && /Signature valid/.test(det())), 'tournaments: result from the Table check, validated and signed (club)');
  const d1 = det();
  ok(d1.indexOf('Alice') < d1.indexOf('Bob') && d1.indexOf('Bob') < d1.indexOf('Carol') && w.document.querySelectorAll('#tDetailBody .checks li.no').length === 0, 'tournaments: ranking shown, every check passes');
  act('cdown', 1).click();
  $('tReason').value = 'Bob and Carol swapped, appeal';
  act('correct').click();
  ok(await until(() => /Corrections/.test(det()) && /appeal/.test(det())), 'tournaments: correction recorded with its reason');
  const rows = [...w.document.querySelectorAll('#tDetailBody tbody tr')].map((tr) => tr.children[1].textContent);
  ok(rows.join(',') === 'Alice,Carol,Bob,Dave' && /Signature valid/.test(det()), 'tournaments: corrected ranking, signed again');

  // Official, players by hand, typed ranking, organizer validation.
  $('tName').value = 'Official night'; $('tProfile').value = 'official'; $('tProfile').dispatchEvent(new w.Event('change'));
  ok(/second organizer/.test($('tProfileNote').textContent), 'tournaments: the profile is explained');
  $('tCreateForm').dispatchEvent(new w.Event('submit', { cancelable: true }));
  ok(await until(() => /Official night/.test(det()) && $('tPlayerIn')), 'tournaments: official tournament created');
  for (const nick of ['Zoe', 'Yann']) {
    $('tPlayerIn').value = nick; act('add').click();
    await until(() => new RegExp(nick + ' added').test(det()));
  }
  ok(/Players \(2\/10\) · checked in 0\/2/.test(det()), 'tournaments: two players added by hand, check-in count (Official)');
  ok(/Personal code of Yann: [A-HJ-NP-Z2-9]{8}/.test(det()) && w.document.querySelectorAll('#tDetailBody [data-act="ckin"]').length === 2 && w.document.querySelectorAll('#tDetailBody [data-act="code"]').length === 2 && /open now: no start date/.test(det()), 'check-in: the code shown once to the organizer, « Check in » and « New code » per player');
  w.document.querySelector('#tDetailBody [data-act="ckin"][data-nick="Zoe"]').click();
  ok(await until(() => /Zoe checked in\./.test(det()) && /checked in 1\/2/.test(det())), 'check-in: the organizer checks a player in');
  w.confirm = () => true;
  w.document.querySelector('#tDetailBody [data-act="code"][data-nick="Yann"]').click();
  ok(await until(() => /Personal code of Yann/.test(det())), 'check-in: a new code for a player');
  ok($('te_checkin') && $('te_checkin').value === '30', 'check-in: its window in Edit (30 minutes)');
  act('mdown', 0).click();
  const order = [...w.document.querySelectorAll('#tDetailBody .rank .nk')].slice(-2).map((x) => x.textContent);
  ok(order.join(',') === 'Yann,Zoe', 'tournaments: the typed ranking is arranged');
  act('setManual').click();
  ok(await until(() => /to validate/.test(det()) && act('validate')), 'tournaments: official — waits for an organizer');
  ok(/Witnesses required\b/.test(det()) && /No report yet/.test(det()) && $('tOverride'), 'witnesses: required (official), none yet — a reason is asked');
  act('validate').click();
  ok(await until(() => /give a reason/.test(det())), 'witnesses: no validation without a reason');
  $('tOverride').value = 'played in the club room, seen by the organizer';
  act('validate').click();
  ok(await until(() => /Validated and signed/.test(det())), 'tournaments: validated by hand, with a reason');
  ok(/Validated despite the witnesses \(admin\): played in the club room/.test(det()), 'witnesses: the reason is shown');
  ok(/second organizer/.test(det()) && !act('correct'), 'tournaments: official — no correction without a second organizer');

  // The director opens the table (the fake server here never answers the
  // table creation: enough to see the page drive it, then close it).
  w.confirm = () => true;
  $('tName').value = 'Hosted night'; $('tProfile').value = 'club'; $('tSrv').value = 'local';
  $('tt_startMoney').value = '2500';
  $('tAnnounce').checked = false;
  // The web client's language list cannot load here (no web server for
  // /modules): English only, as when it has not loaded yet. The browser test
  // checks the full list.
  ok($('tChatLang').value === 'en', 'host: the chat language, English by default');
  $('tChatLang').insertAdjacentHTML('beforeend', '<option value="fr">Français</option>');
  $('tChatLang').value = 'fr';
  $('tCreateForm').dispatchEvent(new w.Event('submit', { cancelable: true }));
  ok(await until(() => /Hosted night/.test(det()) && $('tPlayerIn')), 'host: tournament created with its LAN server');
  ok(/stack 2500/.test(det()), 'host: the table settings are shown');
  ok(/writes in the chat in (fr|.*\(fr\)) \(announcements off\)/.test(det()) && $('te_chatlang').value === 'fr', 'host: the chat language recorded, shown, in Edit');
  ok($('te_announce') && !$('te_announce').checked && $('te_auto') && !$('te_auto').checked, 'host: run choices kept (announcements off, no opening by itself)');
  ok(/Add at least two players/.test(det()) && !act('tOpen'), 'host: two players needed before opening');
  for (const nick of ['Ann', 'Ben']) { $('tPlayerIn').value = nick; act('add').click(); await until(() => new RegExp(nick + ' added').test(det())); }
  ok(!!act('tOpen'), 'host: « Open the table » offered');
  act('tOpen').click();
  ok(await until(() => $('tHostBox') && act('tClose'), 80), 'host: the director is at work, its block is live');
  ok(!!$('tSay') && !!act('tSay'), 'host: a message box for the table');
  $('tSay').value = 'PLEASE COME NOW';
  act('tSay').click();
  ok(await until(() => /no capitals/.test(det()), 40), 'host: a line in capitals is refused (chat filter)');
  ok(/table open/.test($('tList').textContent), 'host: listed as « table open »');
  ok(!$('tPlayerIn') && !w.document.querySelector('input[name="tSource"]'), 'host: players and the result are locked while it runs');
  act('tClose').click();
  ok(await until(() => /Table closed by the organizer/.test(det()) && act('tOpen'), 80), 'host: closed by the organizer, can be opened again');
  ok(/Last table: stopped/.test(det()), 'host: the last table is reported');
  w.close();

  // .pdb through the routes.
  const cr = await (await post('/admin/tournaments/t/create', { name: 'From a log', profile: 'friendly' })).json();
  ok(cr.ok && cr.id, 'routes: create');
  const pdbBuf = await buildPdb(sampleGames());
  const upl = await (await fetch(base + '/admin/tournaments/t/pdb?id=' + cr.id, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/octet-stream' }, H), body: pdbBuf })).json();
  ok(upl.ok && upl.pdbGames.length === 2, 'routes: .pdb uploaded, its games listed');
  ok((await fetch(base + '/admin/tournaments/t/pdb?id=' + cr.id, { method: 'POST', body: pdbBuf })).status === 403, 'routes: upload needs the token');
  const bad = await post('/admin/tournaments/t/result', { id: cr.id, source: 'pdb', uniqueGameId: 99 });
  ok(bad.status === 400, 'routes: a game that is not in the log → 400');
  const rp = await (await post('/admin/tournaments/t/result', { id: cr.id, source: 'pdb', uniqueGameId: 2 })).json();
  ok(rp.ok && rp.status === 'validated' && rp.result.ranking.map((r) => r.nick).join(',') === 'Alice,Bob,Carol,Dave', 'routes: ranked from the log (BBC rule), validated');
  const fp = await get('/admin/tournaments/t/file?id=' + cr.id + '&which=pdb');
  ok(fp.status === 200 && Buffer.from(await fp.arrayBuffer()).equals(Buffer.from(pdbBuf)), 'routes: the log is kept and downloadable');
  const lst = await (await get('/admin/tournaments/t/list')).json();
  ok(lst.ok && lst.tournaments.length === 5, 'routes: five tournaments listed');
  ok(fs.existsSync(F('td/tournaments/' + cr.id + '/journal.json')) && fs.existsSync(F('td/tournaments/' + cr.id + '/result.json')), 'routes: stored in TD_DIR');

  // ── new code on disk: the service alone restarts ──
  const sNow = await (await get('/admin/tournaments/settings')).json();
  ok(sNow.service.diskVersion === sNow.service.version, 'settings: the version on disk is the one running');
  const entry = path.join(root, 'tournament', 'server.mjs');
  const st0 = fs.statSync(entry);
  const pid0 = sNow.service.pid;
  fs.utimesSync(entry, st0.atime, new Date(Date.now() + 5000));
  let sRe = null;
  for (let i = 0; i < 60; i++) { await wait(200); sRe = await (await get('/admin/tournaments/settings')).json(); if (sRe.service.status === 'running' && sRe.service.pid !== pid0) break; }
  fs.utimesSync(entry, st0.atime, st0.mtime);
  ok(sRe && sRe.service.status === 'running' && sRe.service.pid !== pid0 && sRe.service.restarts === 0, 'new tournament code on disk: the service restarts by itself');
  ok((await (await fetch(base + '/admin/whoami', { headers: H })).json()).ok && /new code on disk/.test(plog), 'the web client itself keeps running, and says why');
  await wait(600);
  const rs = await (await post('/admin/tournaments/restart', {})).json();
  ok(rs.ok && rs.service.status === 'running' && rs.service.pid !== sRe.service.pid, 'Restart the service: a new process, at once');
  ok((await post('/admin/tournaments/restart', {}, {})).status === 403, 'restart needs the token');
  s1.service.pid = rs.service.pid;

  // ── the service stops: the web client starts it again ──
  const pid1 = s1.service.pid;
  process.kill(pid1, 'SIGKILL');
  let s2 = null;
  for (let i = 0; i < 60; i++) { await wait(200); s2 = await (await get('/admin/tournaments/settings')).json(); if (s2.service.status === 'running' && s2.service.pid !== pid1) break; }
  ok(s2 && s2.service.status === 'running' && s2.service.pid !== pid1 && s2.service.restarts === 1, 'a killed service is started again');
  ok((await (await get('/admin/tournaments/t/list')).json()).tournaments.length === 5, 'and finds its tournaments');

  // ── off again: page gone, service stopped, files kept ──
  const off = await (await post('/admin/tournaments/settings', { enabled: false })).json();
  ok(off.service.status === 'off', 'off again: the service is stopped');
  let gone = false;
  for (let i = 0; i < 30 && !gone; i++) { await wait(100); try { process.kill(s2.service.pid, 0); } catch (e) { gone = true; } }
  ok(gone, 'off again: its process has ended');
  ok((await get('/tournament', {})).status === 404 && (await get('/tournament/organizer.mjs', {})).status === 404, 'off again: 404');
  ok((await get('/admin/tournaments/watches')).status === 409, 'off again: the tools answer 409');
  await post('/admin/tournaments/settings', { enabled: true });
  const ws = await (await get('/admin/tournaments/watches')).json();
  ok(ws.ok && ws.watches.length === 2, 'on again: past watches (and the closed table) kept');
  await post('/admin/tournaments/settings', { enabled: false });
} finally {
  proxy.kill('SIGTERM');
  game.server.close();
  await wait(200);
  fs.rmSync(tmp, { recursive: true, force: true });
  if (fail) console.error(plog.slice(-3000));
}
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
