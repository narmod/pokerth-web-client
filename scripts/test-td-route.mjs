#!/usr/bin/env node
// Live test of /tournament and /admin/tournaments/* on a real proxy, with the
// scripted fake PokerTH server standing in as the install's local server.
// Then the « Table check » page itself (public/modules/tournament/organizer.mjs)
// is driven in jsdom against that proxy: sign-in, lobby, watch, result.
// Run: node scripts/test-td-route.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { freePort } from './lib/free-port.mjs';
import { S, fakeServer, answerNames, wait } from './lib/td-fake-server.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
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
  TD_DIR: F('td'),
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
  const s1 = await (await post('/admin/tournaments/settings', { enabled: true })).json();
  ok(s1.ok && s1.enabled && s1.key && s1.key.publicKeyRaw, 'enabling creates the install key');
  ok(fs.existsSync(F('td/td-key.pem')), 'the key lives in TD_DIR');
  const page = await get('/tournament', {});
  const html = await page.text();
  ok(page.status === 200 && /Table check/.test(html) && /noindex/.test(html), 'on: /tournament served, noindex');
  ok(/no-store/.test(page.headers.get('cache-control') || ''), 'served no-store');
  const srv = await (await get('/admin/tournaments/servers')).json();
  const local = srv.servers && srv.servers.find((x) => x.ref === 'local');
  ok(local && local.port === game.port, 'servers: the local server from the login defaults');
  const lob = await (await post('/admin/tournaments/lobby', { ref: 'local' })).json();
  ok(lob.ok && lob.watchable && lob.games.length === 1 && lob.games[0].name === 'Friday SnG', 'lobby read through the proxy');
  ok((await post('/admin/tournaments/watch', { ref: 'local', gameId: 7 }, {})).status === 403, 'watch needs the token');
  const cfg = JSON.parse(fs.readFileSync(F('admin-config.json'), 'utf8'));
  ok(cfg.tournaments && cfg.tournaments.enabled === true, 'the setting is saved in admin-config.json');

  // ── the page, in jsdom, against this proxy ──
  const dom = new JSDOM(html, { url: base + '/tournament', pretendToBeVisual: true });
  const w = dom.window;
  for (const k of ['window', 'document', 'localStorage', 'HTMLElement', 'Node', 'Event', 'URL']) {
    try { Object.defineProperty(globalThis, k, { value: k === 'window' ? w : w[k], configurable: true, writable: true }); } catch (e) {}
  }
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = (u, o) => nativeFetch(new URL(u, base), o);
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  await import(pathToFileURL(path.join(root, 'public', 'modules', 'tournament', 'organizer.mjs')).href + '?t=' + Date.now());
  const $ = (id) => w.document.getElementById(id);
  await wait(200);
  ok(!$('signIn').hidden && $('app').hidden, 'page: asks for the token first');
  $('tokIn').value = TOKEN;
  $('signInForm').dispatchEvent(new w.Event('submit', { cancelable: true }));
  for (let i = 0; i < 30 && $('app').hidden; i++) await wait(100);
  ok(!$('app').hidden && $('srvSel').options.length >= 1, 'page: signed in, servers listed');
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
  $('themeBtn').click();
  ok(w.document.documentElement.getAttribute('data-theme') === 'light', 'page: then light');
  $('themeBtn').click();
  ok(!w.document.documentElement.hasAttribute('data-theme'), 'page: then back to the system choice');
  w.close();

  // ── off again: page gone, files kept ──
  await post('/admin/tournaments/settings', { enabled: false });
  ok((await get('/tournament', {})).status === 404, 'off again: 404');
  const ws = await (await get('/admin/tournaments/watches')).json();
  ok(ws.ok && ws.watches.length === 1, 'past watches kept');
} finally {
  proxy.kill('SIGTERM');
  game.server.close();
  await wait(200);
  fs.rmSync(tmp, { recursive: true, force: true });
  if (fail) console.error(plog.slice(-3000));
}
console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
