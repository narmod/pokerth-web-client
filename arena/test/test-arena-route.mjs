#!/usr/bin/env node
// Live test of /arena and /admin/arena/* on a real proxy, which
// launches the tournament service (arena/server.mjs) and relays to it,
// with the scripted fake PokerTH server standing in as the install's local
// server. Then the page itself (arena/public/organizer.mjs) is driven in
// jsdom against that proxy: sign-in, lobby, watch, result, tournaments.
// Run: node arena/test/test-arena-route.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { freePort } from '../../scripts/lib/free-port.mjs';
import { S, fakeServer, answerNames, wait } from './lib/arena-fake-server.mjs';
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arena-route-'));
const F = (x) => path.join(tmp, x);
fs.writeFileSync(F('admin-config.json'), JSON.stringify({ loginDefaults: { lanMode: 'forced', host: '127.0.0.1', lanPort: game.port, lanTls: false } }));
// Organizer keys (Admin › Keys): two organizers, a key for another section.
fs.writeFileSync(F('scoped-tokens.json'), JSON.stringify([
  { name: 'Old organizer', token: 'org-old-key', scopes: ['arena'] },   // the Arena category of Admin › Keys is gone (web.319)
  { name: 'Musician', token: 'music-only-key', scopes: ['music'] },
]));
const PORT = await freePort();
const TOKEN = 'arena-route-token';
const env = Object.assign({}, process.env, {
  PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN, RATE_LIMIT_DISABLED: '1',
  ADMIN_CONFIG_FILE: F('admin-config.json'), VISITS_FILE: F('visits.json'), STATS_FILE: F('stats.json'),
  STATS_META_FILE: F('stats.meta.json'), BROADCASTS_FILE: F('broadcasts.json'), POLLS_FILE: F('polls.json'),
  DB_CONFIG_FILE: F('db-config.json'), DEPLOY_HISTORY_FILE: F('deploy-history.json'),
  SCOPED_TOKENS_FILE: F('scoped-tokens.json'), AUDIT_FILE: F('admin-audit.json'), LAN_BOARDS_FILE: F('lan-boards.json'),
  ARENA_DIR: F('td'), ARENA_CODE_POLL_MS: '300',
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
  ok((await get('/arena', {})).status === 404 && (await get('/arena.html', {})).status === 404, 'off: /arena and /arena.html answer 404');
  ok((await get('/admin/arena/settings', {})).status === 403, 'settings need the token');
  const s0 = await (await get('/admin/arena/settings')).json();
  ok(s0.ok && s0.enabled === false && s0.key === null, 'off by default, no key yet');
  ok((await get('/admin/arena/servers')).status === 409, 'tools answer 409 while off');
  // ── on ──
  ok(!/\[td\] tournament director/.test(plog), 'off: the service is not running');
  const s1 = await (await post('/admin/arena/settings', { enabled: true })).json();
  ok(s1.ok && s1.enabled && s1.key && s1.key.publicKeyRaw, 'enabling starts the service, which creates the install key');
  ok(s1.service && s1.service.status === 'running' && /^0\.\d+\.\d+/.test(s1.service.version) && s1.running === 0 && s1.maxRunning === 4, 'settings: the service is running, with its own version');
  ok(fs.existsSync(F('td/td-key.pem')), 'the key lives in ARENA_DIR');
  const page = await get('/arena/organize', {});
  const html = await page.text();
  ok(page.status === 200 && /Table check/.test(html) && /noindex/.test(html), 'on: /arena/organize served, noindex');
  const pubPage = await get('/arena', {});
  ok(pubPage.status === 200 && /public\.mjs/.test(await pubPage.text()), 'on: /arena is the players\' page');
  const av = await fetch(base + '/arena/avatar');
  ok(av.status === 200 && av.headers.get('content-type') === 'image/png', 'on: the director\'s avatar is served');
  const css = await (await get('/arena/arena.css', {})).text();
  ok(/no-store/.test(page.headers.get('cache-control') || ''), 'served no-store');
  ok(/viewport-fit=cover/.test(html) && /env\(safe-area-inset-top\)/.test(css) && /rel="manifest" href="\/arena\/manifest\.json"/.test(html), 'page: phone notch safe areas and its own app manifest');
  ok(html.indexOf(s1.service.version) >= 0, 'page: shows the service version');
  ok((await get('/arena/..%2F..%2Fadmin%2Ftournaments%2Ft%2Flist', {})).status === 404 && (await get('/arena/proxy.js', {})).status === 404, 'page: only the page and its files are relayed');
  const man = await (await get('/arena/manifest.json', {})).json();
  ok(man.start_url === '/arena/' && man.scope === '/arena/' && man.display === 'standalone', 'manifest: installable on its own, scoped to /arena/');
  ok(man.icons.every((i) => fs.existsSync(path.join(root, 'arena', 'public', i.src.replace(/^\/arena\//, '')))), 'manifest: every icon exists (the Arena\'s own)');
  for (const u of ['/arena/sw.js', '/arena/lang-meta.mjs', '/arena/icons/icon-192.png', '/arena/tournaments', '/arena/login', '/arena/account', '/arena/img/hero.webp', '/arena/api/showcase']) ok((await get(u, {})).status === 200, 'relayed: ' + u);
  const srv = await (await get('/admin/arena/servers')).json();
  const local = srv.servers && srv.servers.find((x) => x.ref === 'local');
  ok(local && local.port === game.port, 'servers: the local server from the login defaults');
  const lob = await (await post('/admin/arena/lobby', { ref: 'local' })).json();
  ok(lob.ok && lob.watchable && lob.games.length === 1 && lob.games[0].name === 'Friday SnG', 'lobby read through the proxy');
  ok((await post('/admin/arena/watch', { ref: 'local', gameId: 7 }, {})).status === 403, 'watch needs the token');
  const cfg = JSON.parse(fs.readFileSync(F('admin-config.json'), 'utf8'));
  ok(cfg.arena && cfg.arena.enabled === true && !cfg.tournaments, 'the setting is saved in admin-config.json (« arena »)');
  // No old address: /tournament and /admin/tournaments are not the Arena's.
  ok((await fetch(base + '/tournament', { redirect: 'manual' })).status === 404 && (await get('/admin/tournaments/settings')).status === 404, 'no old address (/tournament, /admin/tournaments)');


  // ── organizer accounts: who acts is in the journal; corrections by two organizers ──
  {
    const pj = (p, b) => fetch(base + '/arena/api' + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then((r) => r.json());
    const account = async (login, name, role) => { const a = await (await post('/admin/arena/accounts/create', { login, name, role })).json(); const i = await pj('/account/invite', { token: a.invite, password: 'a long password for ' + login }); return { Authorization: 'Bearer ' + i.token }; };
    const E = await account('elise', 'Élise', 'organizer'), B = await account('bruno', 'Bruno', 'organizer');
    const st = await (await get('/admin/arena/status', E)).json();
    ok(st.ok && st.you === 'Élise' && st.role === 'organizer', 'organizer account: signed in through the web client, the service knows who (« ' + st.you + ' »)');
    ok((await get('/admin/arena/status', { Authorization: 'Bearer music-only-key' })).status === 403 && (await get('/admin/arena/status', { Authorization: 'Bearer org-old-key' })).status === 403, 'a key of Admin › Keys (another section, or the old Arena category): refused');
    ok((await get('/admin/arena/settings', E)).status === 403 && (await post('/admin/arena/restart', {}, E)).status === 403, 'organizer account: not the module settings (master key only)');
    // Deleting a cup: the super admin only.
    const cupE = await (await post('/admin/arena/cups/create', { name: 'Elise cup' }, E)).json();
    const delE = await post('/admin/arena/cups/delete', { id: cupE.id, confirm: 'Elise cup' }, E);
    const delM = await (await post('/admin/arena/cups/delete', { id: cupE.id, confirm: 'Elise cup' })).json();
    ok(delE.status === 403 && delM.ok && delM.deleted === cupE.id, 'deleting a cup: refused to an organizer, done with the master key');
    {
      const S = await account('remi', 'Rémi', 'referee');
      const me = await (await get('/admin/arena/status', S)).json();
      const cr = await post('/admin/arena/t/create', { name: 'No' }, S);
      ok(me.you === 'Rémi' && me.role === 'referee' && cr.status === 403 && (await cr.json()).code === 'role', 'a referee account: its role applied');
      ok((await get('/admin/arena/status', { Authorization: 'Bearer as_' + 'x'.repeat(43) })).status === 401 && (await get('/admin/arena/accounts', E)).status === 403, 'an unknown session: 401; accounts: not for an organizer');
    }
    const tE = await (await post('/admin/arena/t/create', { name: 'Elise night' }, E)).json();
    ok((await post('/admin/arena/t/delete', { id: tE.id, confirm: 'Elise night' }, E)).status === 403 && (await (await post('/admin/arena/t/delete', { id: tE.id, confirm: 'Elise night' })).json()).ok, 'deleting a tournament: the master key only');
    const t = await (await post('/admin/arena/t/create', { name: 'Two organizers', profile: 'official' }, E)).json();
    for (const n of ['Ann', 'Ben']) await post('/admin/arena/t/player', { id: t.id, nick: n }, E);
    await post('/admin/arena/t/result', { id: t.id, source: 'manual', ranking: ['Ann', 'Ben'] }, E);
    await post('/admin/arena/t/validate', { id: t.id, override: 'tested on the bench' }, B);
    const pc = await (await post('/admin/arena/t/correct', { id: t.id, ranking: ['Ben', 'Ann'], reason: 'appeal' }, E)).json();
    ok(pc.ok && pc.pendingCorrection.by === 'Élise', 'Élise proposes a correction');
    const self = await (await post('/admin/arena/t/correct/approve', { id: t.id }, E)).json();
    ok(!self.ok && /second organizer/.test(self.error), 'Élise cannot approve her own');
    const ap = await (await post('/admin/arena/t/correct/approve', { id: t.id }, B)).json();
    ok(ap.ok && ap.result.ranking[0].nick === 'Ben' && ap.corrections[0].approvedBy === 'Bruno', 'Bruno approves: applied');
    const h = ap.history;
    ok(h.find((x) => x.type === 'created').author === 'Élise' && h.find((x) => x.type === 'validated').author === 'Bruno' && h.some((x) => x.type === 'corrected' && /proposed by Élise, approved by Bruno/.test(x.summary)), 'the journal says who did what');
  }

  // ── the page, in jsdom, against this proxy ──
  // ── the players' API through the web client: no token, the address set by the proxy ──
  {
    const t = await (await post('/admin/arena/t/create', { name: 'Proxy cup', profile: 'club' })).json();
    const reg = (nick, spoof) => fetch(base + '/arena/api/t/' + t.publicKey + '/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': spoof }, body: JSON.stringify({ nick }) });
    const st = [];
    for (let i = 0; i < 7; i++) st.push((await reg('N' + i, '198.51.100.' + i)).status);
    ok(st.slice(0, 6).every((x) => x === 200) && st[6] === 429, 'public API: relayed without a token; a spoofed address header does not dodge the limit');
    const big = await fetch(base + '/arena/api/t/' + t.publicKey + '/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nick: 'x'.repeat(9000) }) });
    ok(big.status === 413, 'public API: a large body is refused by the web client');
    // Images of tournaments: relayed, and the picture of a shared link from this address.
    const im = await fetch(base + '/arena/img/tournament.t.jpg');
    ok(im.status === 200 && im.headers.get('content-type') === 'image/jpeg' && /max-age/.test(im.headers.get('cache-control') || ''), 'images: relayed by the web client');
    const share = await (await fetch(base + '/arena/t/' + t.publicKey)).text();
    ok(share.includes('<meta property="og:image" content="' + base + '/arena/img/tournament.jpg">'), 'a tournament\'s page: og:image with this site\'s address');
    // Never indexed: every answer under /arena says noindex; the site's robots.txt and sitemap leave it out.
    const paths = ['/arena', '/arena/t/' + t.publicKey, '/arena/p/Ann', '/arena/organize', '/arena/img/tournament.jpg', '/arena/avatar', '/arena/api/list', '/arena/api/badges', '/arena/public.mjs', '/arena/nothing-here'];
    const tags = [];
    for (const q of paths) { const r = await fetch(base + q); tags.push(q + ' ' + r.status + ' ' + (r.headers.get('x-robots-tag') || '-')); await r.arrayBuffer(); }
    ok(tags.every((x) => /noindex/.test(x) && /nofollow/.test(x)), 'never indexed: noindex on pages, images, API and 404s (' + tags.filter((x) => !/noindex/.test(x)).join('; ') + ')');
    const rob = await (await fetch(base + '/robots.txt')).text(), smap = await (await fetch(base + '/sitemap.xml')).text();
    ok(!/arena/i.test(rob) && !/\/arena/.test(smap), 'robots.txt and sitemap.xml never list /arena');
    ok((await get('/arena/api/secret', {})).status === 404 && (await get('/arena/api/list', {})).status === 200, 'public API: only its routes');
    // Witnesses: the table lookup, and a report larger than other requests.
    const lk = await fetch(base + '/arena/api/table?game=5&name=Proxy%20cup');
    ok(lk.status === 404 && (await lk.json()).code === 'notFound', 'witness: the table lookup is relayed (no such table: 404 from the director)');
    const wit = (size) => fetch(base + '/arena/api/t/' + t.publicKey + '/witness', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.99' },
      body: JSON.stringify({ nick: 'N1', pad: 'x'.repeat(size), report: { players: ['N1'], hands: [[1, 5]] } }) });
    const w1 = await wit(20000);
    ok(w1.status === 400 && (await w1.json()).code === 'noTable', 'witness: a 20 KB report passes the web client (the director answers)');
    ok((await wit(70000)).status === 413, 'witness: over 64 KB, refused by the web client');
    const logPost = (size) => fetch(base + '/arena/api/t/' + t.publicKey + '/witnesslog', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-td-client': '198.51.100.98' },
      body: JSON.stringify({ nick: 'N1', log: 'A'.repeat(size) }) });
    const l1 = await logPost(2 * 1024 * 1024);
    ok(l1.status === 400 && (await l1.json()).code === 'noLogWitness', 'witness log: 2 MB passes the web client (the director answers)');
    ok((await logPost(15 * 1024 * 1024)).status === 413, 'witness log: over 14 MB, refused by the web client');
    await post('/admin/arena/t/player', { id: t.id, action: 'remove', nick: 'N0' });
  }

  const dom = new JSDOM(html, { url: base + '/arena/organize', pretendToBeVisual: true });
  const w = dom.window;
  for (const k of ['window', 'document', 'localStorage', 'HTMLElement', 'Node', 'Event', 'URL']) {
    try { Object.defineProperty(globalThis, k, { value: k === 'window' ? w : w[k], configurable: true, writable: true }); } catch (e) {}
  }
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = (u, o) => nativeFetch(new URL(u, base), o);
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  await import(pathToFileURL(path.join(root, 'arena', 'public', 'organizer.mjs')).href + '?t=' + Date.now());
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
  ok(/second organizer/.test(det()) && act('correct') && /Propose the correction/.test(det()), 'tournaments: official — a correction is proposed, for a second organizer');
  act('cdown', 0).click();
  $('tReason').value = 'appeal accepted';
  act('correct').click();
  ok(await until(() => /Correction waiting/.test(det()) && /A second organizer must approve it — not you/.test(det()) && act('corrReject') && !act('corrApprove')), 'tournaments: the correction waits; its author cannot approve it, only withdraw it');
  act('corrReject').click();
  ok(await until(() => /Correction set aside/.test(det()) && !/Correction waiting/.test(det())), 'tournaments: withdrawn');

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

  // Several tables: created from the form, drawn, a table opened from its tournament.
  $('tName').value = 'Big cup'; $('tProfile').value = 'club'; $('tFormat').value = 'multi'; $('tFormat').dispatchEvent(new w.Event('change'));
  ok(!$('tFinalBox').hidden, 'several tables: the number of finalists is asked');
  $('tFinalists').value = '3';
  $('tCreateForm').dispatchEvent(new w.Event('submit', { cancelable: true }));
  ok(await until(() => /Big cup/.test(det()) && /Several tables \+ final \(3 per table\)/.test(det())), 'several tables: created, three per table at the final');
  for (let i = 1; i <= 15; i++) await post('/admin/arena/t/player', { id: (await (await get('/admin/arena/t/list')).json()).tournaments.find((x) => x.name === 'Big cup').id, nick: 'B' + i });
  $('tList').querySelector('button[data-id]') && [...$('tList').querySelectorAll('button[data-id]')].find((b) => /Big cup/.test(b.textContent)).click();
  ok(await until(() => /Players \(15\/40\)/.test(det()) && act('draw') && !act('draw').disabled), 'several tables: 15 players of 40, « Draw the tables »');
  act('draw').click();
  ok(await until(() => /Table 1/.test(det()) && /Table 2/.test(det()) && act('stagesOpen')), 'drawn: two tables, « Open the tables »');
  await until(() => /↳ Big cup — table 1/.test($('tList').textContent));
  ok(/↳ Big cup — table 2/.test($('tList').textContent), 'the tables are listed under their tournament');
  w.document.querySelector('#tDetailBody [data-act="goto"]').click();
  ok(await until(() => /Table 1 of/.test(det()) && /its players come from the draw/.test(det()) && !$('tPlayerIn')), 'a table: its tournament linked, players fixed by the draw');

  // Cups: created, a validated tournament added, its points in the standings.
  $('tabCup').click();
  ok(!$('viewCup').hidden && w.localStorage.getItem('pth_td_view') === 'cups', 'cups: their own tab, remembered');
  $('cName').value = 'Winter cup'; $('cBest').value = '3';
  $('cCreateForm').dispatchEvent(new w.Event('submit', { cancelable: true }));
  const cdet = () => $('cDetailBody').textContent;
  ok(await until(() => /Winter cup/.test(cdet()) && /best 3 results per player/.test(cdet()) && /Winter cup/.test($('cList').textContent)), 'cups: created, listed, opened');
  await until(() => $('ceT') && [...$('ceT').options].some((o) => /Friday cup/.test(o.textContent)));
  $('ceT').value = [...$('ceT').options].find((o) => /Friday cup/.test(o.textContent)).value;
  w.document.querySelector('#cDetailBody [data-cact="add"]').click();
  ok(await until(() => /Tournament added/.test(cdet()) && /Standings/.test(cdet()) && /Alice/.test(cdet())), 'cups: a validated tournament added, its players in the standings');
  $('tabTour').click();
  w.close();

  // .pdb through the routes.
  const cr = await (await post('/admin/arena/t/create', { name: 'From a log', profile: 'friendly' })).json();
  ok(cr.ok && cr.id, 'routes: create');
  const pdbBuf = await buildPdb(sampleGames());
  const upl = await (await fetch(base + '/admin/arena/t/pdb?id=' + cr.id, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/octet-stream' }, H), body: pdbBuf })).json();
  ok(upl.ok && upl.pdbGames.length === 2, 'routes: .pdb uploaded, its games listed');
  ok((await fetch(base + '/admin/arena/t/pdb?id=' + cr.id, { method: 'POST', body: pdbBuf })).status === 403, 'routes: upload needs the token');
  const bad = await post('/admin/arena/t/result', { id: cr.id, source: 'pdb', uniqueGameId: 99 });
  ok(bad.status === 400, 'routes: a game that is not in the log → 400');
  const rp = await (await post('/admin/arena/t/result', { id: cr.id, source: 'pdb', uniqueGameId: 2 })).json();
  ok(rp.ok && rp.status === 'validated' && rp.result.ranking.map((r) => r.nick).join(',') === 'Alice,Bob,Carol,Dave', 'routes: ranked from the log (BBC rule), validated');
  const fp = await get('/admin/arena/t/file?id=' + cr.id + '&which=pdb');
  ok(fp.status === 200 && Buffer.from(await fp.arrayBuffer()).equals(Buffer.from(pdbBuf)), 'routes: the log is kept and downloadable');
  const lst = await (await get('/admin/arena/t/list')).json();
  ok(lst.ok && lst.tournaments.length === 9, 'routes: nine tournaments listed (with two tables)');
  ok(fs.existsSync(F('td/tournaments/' + cr.id + '/journal.json')) && fs.existsSync(F('td/tournaments/' + cr.id + '/result.json')), 'routes: stored in ARENA_DIR');

  // ── new code on disk: the service alone restarts ──
  const sNow = await (await get('/admin/arena/settings')).json();
  ok(sNow.service.diskVersion === sNow.service.version, 'settings: the version on disk is the one running');
  const entry = path.join(root, 'arena', 'server.mjs');
  const st0 = fs.statSync(entry);
  const pid0 = sNow.service.pid;
  fs.utimesSync(entry, st0.atime, new Date(Date.now() + 5000));
  let sRe = null;
  for (let i = 0; i < 60; i++) { await wait(200); sRe = await (await get('/admin/arena/settings')).json(); if (sRe.service.status === 'running' && sRe.service.pid !== pid0) break; }
  fs.utimesSync(entry, st0.atime, st0.mtime);
  ok(sRe && sRe.service.status === 'running' && sRe.service.pid !== pid0 && sRe.service.restarts === 0, 'new tournament code on disk: the service restarts by itself');
  ok((await (await fetch(base + '/admin/whoami', { headers: H })).json()).ok && /new code on disk/.test(plog), 'the web client itself keeps running, and says why');
  await wait(600);
  const rs = await (await post('/admin/arena/restart', {})).json();
  ok(rs.ok && rs.service.status === 'running' && rs.service.pid !== sRe.service.pid, 'Restart the service: a new process, at once');
  ok((await post('/admin/arena/restart', {}, {})).status === 403, 'restart needs the token');
  s1.service.pid = rs.service.pid;

  // ── the service stops: the web client starts it again ──
  const pid1 = s1.service.pid;
  process.kill(pid1, 'SIGKILL');
  let s2 = null;
  for (let i = 0; i < 60; i++) { await wait(200); s2 = await (await get('/admin/arena/settings')).json(); if (s2.service.status === 'running' && s2.service.pid !== pid1) break; }
  ok(s2 && s2.service.status === 'running' && s2.service.pid !== pid1 && s2.service.restarts === 1, 'a killed service is started again');
  ok((await (await get('/admin/arena/t/list')).json()).tournaments.length === 9, 'and finds its tournaments');

  // ── off again: page gone, service stopped, files kept ──
  const off = await (await post('/admin/arena/settings', { enabled: false })).json();
  ok(off.service.status === 'off', 'off again: the service is stopped');
  let gone = false;
  for (let i = 0; i < 30 && !gone; i++) { await wait(100); try { process.kill(s2.service.pid, 0); } catch (e) { gone = true; } }
  ok(gone, 'off again: its process has ended');
  ok((await get('/arena', {})).status === 404 && (await get('/arena/organizer.mjs', {})).status === 404, 'off again: 404');
  ok((await get('/admin/arena/watches')).status === 409, 'off again: the tools answer 409');
  await post('/admin/arena/settings', { enabled: true });
  const ws = await (await get('/admin/arena/watches')).json();
  ok(ws.ok && ws.watches.length === 2, 'on again: past watches (and the closed table) kept');
  await post('/admin/arena/settings', { enabled: false });
} finally {
  proxy.kill('SIGTERM');
  game.server.close();
  await wait(200);
  fs.rmSync(tmp, { recursive: true, force: true });
  if (fail) console.error(plog.slice(-3000));
}
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
