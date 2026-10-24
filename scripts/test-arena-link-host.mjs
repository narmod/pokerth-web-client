#!/usr/bin/env node
// « Its own app » (web.323): the web client's side of the link with an Arena
// running as an application of its own (server/arena-host.js).
// A real Arena is started on its own (arena/server.mjs, no proxy.js); the
// web client's host is wired to a small HTTP server answering
// /api/arena-link/* (handleArenaLink) and /arena (handleArenaPage).
// Checks: settings validation, « Test and save » (wrong key, no Arena,
// accepted then saved), the switch to « its own app » (no service launched
// here), the Arena reading servers and events with the key, wrong keys and
// their limit, /arena sent to the Arena, the organizer API refused here.
// Run: node scripts/test-arena-link-host.mjs
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const H = require(join(root, 'server', 'arena-host.js'));
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }

// ── the Arena, on its own ──
const adir = mkdtempSync(join(tmpdir(), 'arena-own-'));
const env = Object.assign({}, process.env, { ARENA_DIR: adir, ARENA_ADMIN_TOKEN: 'arena-admin', ARENA_PORT: '0', ARENA_HOST: '127.0.0.1' });
for (const k of ['ARENA_SERVERS', 'ARENA_EVENTS_URL', 'ARENA_LINK_KEY', 'ARENA_WEBCLIENT_URL', 'ARENA_SECRET']) delete env[k];
const arena = spawn(process.execPath, [join(root, 'arena', 'server.mjs')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let aout = '';
arena.stdout.on('data', (d) => { aout += d; }); arena.stderr.on('data', (d) => { aout += d; });
const aport = await new Promise((resolve) => { const t0 = Date.now(); const iv = setInterval(() => { const m = /on http:\/\/127\.0\.0\.1:(\d+)/.exec(aout); if (m || Date.now() - t0 > 10000) { clearInterval(iv); resolve(m ? +m[1] : 0); } }, 50); });
ok(aport > 0, 'the Arena runs on its own');
const arenaUrl = 'http://127.0.0.1:' + aport;
const linkInfo = await (await fetch(arenaUrl + '/admin/arena/link', { headers: { Authorization: 'Bearer arena-admin' } })).json();
const KEY = linkInfo.key;
ok(H.LINK_KEY_RE.test(KEY), 'the Arena shows its link key');

// ── the web client's side ──
let conf = {}, evCalls = 0;
const host = H.createArenaHost({
  dir: mkdtempSync(join(tmpdir(), 'wc-arena-')),
  getConfig: () => conf,
  setConfig: (c) => { conf = c; },
  listServers: () => [{ ref: 'local', kind: 'local', name: 'Local server', host: '127.0.0.1', port: 7234, tls: false, pins: [] }, { ref: 'lan:3', kind: 'lan', name: 'Club', host: '10.1.2.3', port: 7234, tls: false, pins: [] }],
  communityEvents: () => { evCalls++; return Promise.resolve({ upcoming: [{ site: 'bbc', name: 'BBC 42' }] }); },
  clientVersion: () => '2.1.10-web.323',
  log: () => {},
});
const wc = http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  if (p.indexOf('/api/arena-link/') === 0) return H.handleArenaLink(host, req, res, p, req.socket.remoteAddress);
  if (p === '/arena' || p.indexOf('/arena/') === 0) return H.handleArenaPage(host, req, res, p, req.socket.remoteAddress, '');
  if (p.indexOf('/admin/arena') === 0) {
    const json = (r, c, o) => { r.writeHead(c, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(o)); };
    return H.handleArenaAdmin(host, { adminAuthed: () => true, adminJson: json, readJsonBody: (r, cb) => { let b = ''; r.on('data', (d) => { b += d; }); r.on('end', () => { try { cb(b ? JSON.parse(b) : {}); } catch (e) { cb(null); } }); }, author: () => 'admin', origin: () => wcUrl }, req, res, p, {});
  }
  res.writeHead(404); res.end();
});
await new Promise((r) => wc.listen(0, '127.0.0.1', r));
const wcUrl = 'http://127.0.0.1:' + wc.address().port;

// settings
let threw = null;
try { host.setSettings({ url: 'https://arena.example.org/path' }); } catch (e) { threw = e.message; }
ok(/no path/.test(threw || ''), 'an address with a path is refused');
threw = null; try { host.setSettings({ key: 'not-a-key' }); } catch (e) { threw = e.message; }
ok(/link key/.test(threw || ''), 'a key that is not alk_… is refused');
threw = null; try { host.setSettings({ mode: 'external' }); } catch (e) { threw = e.message; }
ok(/address and its link key first/.test(threw || ''), '« its own app » needs an address and a key first');
ok(host.settings().link.mode === 'embedded' && host.settings().link.keySet === false, 'nothing saved by refused settings');

// « Test and save »
let r = await host.linkTest({ url: arenaUrl, key: 'alk_' + 'x'.repeat(44), origin: wcUrl });
ok(!r.ok && /refused the key/.test(r.error), 'test: a wrong key is reported');
ok(!host.settings().link.keySet, 'test failed: nothing saved');
r = await host.linkTest({ url: 'http://127.0.0.1:9', key: KEY, origin: wcUrl });
ok(!r.ok && /cannot reach|timeout/.test(r.error), 'test: no Arena at the address is reported');
r = await host.linkTest({ url: arenaUrl, key: KEY, origin: '' });
ok(!r.ok && /public address/.test(r.error), 'test: an unknown public address is reported');
r = await host.linkTest({ url: arenaUrl + '/', key: KEY, origin: wcUrl });
ok(r.ok && r.arena && r.webClient === wcUrl, 'test: the Arena accepts the key and its version comes back');
let s = host.settings();
ok(s.link.url === arenaUrl && s.link.keySet && s.link.keyHint.indexOf('alk_') === 0 && s.link.keyHint.length < 20, 'test OK: address and key saved, only a hint shown');
ok(s.link.lastTest && s.link.lastTest.ok, 'the last test is shown');
const back = await (await fetch(arenaUrl + '/admin/arena/link', { headers: { Authorization: 'Bearer arena-admin' } })).json();
ok(back.webClient === wcUrl && back.webClientVersion === '2.1.10-web.323', 'the Arena knows this web client and its version');

// the switch: no service launched here
host.setSettings({ enabled: true, mode: 'external' });
ok(host.external() && host.info().status === 'off' && host.info().pid === null, '« its own app »: on, and no service started here');

// the Arena reads the servers and events here
const sv = await (await fetch(arenaUrl + '/admin/arena/servers', { headers: { Authorization: 'Bearer arena-admin' } })).json();
ok(sv.ok && sv.servers.length === 2 && sv.servers[1].ref === 'lan:3', 'the Arena gets the servers from the web client');
ok(sv.servers[0].host === '127.0.0.1', 'local server: seen on the web client\'s host (here the same machine)');
ok(host.settings().link.lastContact && host.settings().link.lastContact.what === 'servers', 'the last contact of the Arena is noted');
const showcase = await (await fetch(arenaUrl + '/admin/arena/showcase', { headers: { Authorization: 'Bearer arena-admin' } })).json();
ok(showcase.ok && showcase.community === true, 'the Arena\'s home page can show the community events');
const evr = await fetch(wcUrl + '/api/arena-link/events', { headers: { Authorization: 'Bearer ' + KEY } });
const evj = await evr.json();
ok(evr.status === 200 && evj.events && evj.events.upcoming[0].name === 'BBC 42', '/api/arena-link/events with the key');

// wrong keys
let x = await fetch(wcUrl + '/api/arena-link/servers');
ok(x.status === 403, 'no key: refused');
x = await fetch(wcUrl + '/api/arena-link/servers', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY } });
ok(x.status === 404, 'GET only');
x = await fetch(wcUrl + '/api/arena-link/other', { headers: { Authorization: 'Bearer ' + KEY } });
ok(x.status === 404, 'only servers and events');
for (let i = 0; i < 9; i++) await fetch(wcUrl + '/api/arena-link/servers', { headers: { Authorization: 'Bearer alk_wrong' } });
x = await fetch(wcUrl + '/api/arena-link/servers', { headers: { Authorization: 'Bearer ' + KEY } });
ok(x.status === 429, 'ten wrong keys from one address: blocked, even with the right one');

// /arena sent to the Arena; the organizer API not relayed here
x = await fetch(wcUrl + '/arena/tournaments', { redirect: 'manual' });
ok(x.status === 302 && x.headers.get('location') === arenaUrl + '/arena/tournaments', '/arena pages: sent to the Arena (302)');
x = await fetch(wcUrl + '/arena/api/list?x=1', { redirect: 'manual' });
ok(x.status === 307 && x.headers.get('location') === arenaUrl + '/arena/api/list?x=1', 'players\' API: 307 to the Arena');
x = await fetch(wcUrl + '/admin/arena/tournaments');
const xj = await x.json();
ok(x.status === 409 && xj.code === 'external' && xj.url === arenaUrl + '/arena/organize', 'organizer API: refused here, pointing to the Arena\'s organizer page');
x = await fetch(wcUrl + '/admin/arena/restart', { method: 'POST', body: '{}' });
ok(x.status === 409, 'restart: refused (restart it on the Arena)');
x = await fetch(wcUrl + '/admin/arena/settings');
const sj = await x.json();
ok(sj.ok && sj.link.mode === 'external' && sj.link.url === arenaUrl && !('key' in sj.link), 'settings answer: the link, never the key');

// back inside the web client; the key is kept
host.setSettings({ enabled: false });
host.setSettings({ mode: 'embedded' });
ok(!host.external() && host.settings().link.keySet && host.settings().link.url === arenaUrl, 'back inside: address and key kept for later');
x = await fetch(wcUrl + '/api/arena-link/servers', { headers: { Authorization: 'Bearer ' + KEY } });
ok(x.status === 404, 'not « its own app »: /api/arena-link answers 404');
host.setSettings({ key: '', url: '' });
ok(!host.settings().link.keySet && !host.settings().link.url, 'address and key can be cleared');

host.stop();
arena.kill('SIGTERM');
wc.close();
rmSync(adir, { recursive: true, force: true });
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
