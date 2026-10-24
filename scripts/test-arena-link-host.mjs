#!/usr/bin/env node
// « Its own app » (web.323): the web client's side of the link with an Arena
// running as an application of its own (server/arena-host.js). Only the
// Arena has an API: the web client SENDS it the servers and the events with
// the key the Arena made.
// A real Arena is started on its own (arena/server.mjs, no proxy.js); the
// web client's host is wired to a small HTTP server for /arena
// (handleArenaPage) and /admin/arena (handleArenaAdmin).
// Checks: settings validation, « Test and save » (wrong key, no Arena,
// unknown address, accepted then saved), the switch to « its own app » (no
// service here, sends every tick), the Arena using what was sent, nothing
// exposed by the web client, /arena sent to the Arena, the organizer API
// refused here, back inside.
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await sleep(50); } return null; }

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
const AH = { headers: { Authorization: 'Bearer arena-admin' } };
const aget = (p) => fetch(arenaUrl + p, AH).then((r) => r.json());
const KEY = (await aget('/admin/arena/link')).key;
ok(H.LINK_KEY_RE.test(KEY), 'the Arena makes and shows its link key');

// ── the web client's side ──
let conf = {}, evCalls = 0, lanName = 'Club';
const host = H.createArenaHost({
  dir: mkdtempSync(join(tmpdir(), 'wc-arena-')),
  getConfig: () => conf,
  setConfig: (c) => { conf = c; },
  listServers: () => [{ ref: 'local', kind: 'local', name: 'Local server', host: '127.0.0.1', port: 7234, tls: false, sni: '', noverify: true, pins: [] }, { ref: 'lan:3', kind: 'lan', name: lanName, host: '10.1.2.3', port: 7234, tls: false, sni: '', noverify: false, pins: [] }],
  communityEvents: () => { evCalls++; return Promise.resolve({ upcoming: [{ site: 'bbc', name: 'BBC 42' }] }); },
  clientVersion: () => '2.1.10-web.323',
  pushMs: 300,
  log: () => {},
});
const wc = http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  if (p === '/arena' || p.indexOf('/arena/') === 0) return H.handleArenaPage(host, req, res, p, req.socket.remoteAddress, '');
  if (p.indexOf('/admin/arena') === 0) {
    const json = (r, c, o) => { r.writeHead(c, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(o)); };
    return H.handleArenaAdmin(host, { adminAuthed: () => true, adminJson: json, readJsonBody: (r, cb) => { let b = ''; r.on('data', (d) => { b += d; }); r.on('end', () => { try { cb(b ? JSON.parse(b) : {}); } catch (e) { cb(null); } }); }, author: () => 'admin', origin: () => wcUrl }, req, res, p, {});
  }
  res.writeHead(404); res.end();
});
await new Promise((r) => wc.listen(0, '127.0.0.1', r));
const wcUrl = 'http://127.0.0.1:' + wc.address().port;
ok(typeof H.handleArenaLink === 'undefined', 'the web client has no API for the Arena');

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
ok(r.ok && r.arena && r.servers === 2, 'test: the Arena accepts the key and receives the servers');
let s = host.settings();
ok(s.link.url === arenaUrl && s.link.keySet && s.link.self === wcUrl && s.link.keyHint.length < 20, 'test OK: address, key and our address saved, only a hint shown');
ok(s.link.lastTest.ok && s.link.lastPush.ok && s.link.lastPush.servers === 2, 'last test and last send shown');
let li = await aget('/admin/arena/link');
ok(li.webClient === wcUrl && li.webClientVersion === '2.1.10-web.323' && li.servers === 2, 'the Arena knows this web client, its version and its servers');
ok(li.eventsAt > 0, 'the events went with the test');
const evAfterTest = evCalls;

// the switch: no service here, sends every tick
host.setSettings({ enabled: true, mode: 'external' });
ok(host.external() && host.info().status === 'off' && host.info().pid === null, '« its own app »: on, and no service started here');
lanName = 'Club renamed';
const seen = await until(async () => { const v = await aget('/admin/arena/servers'); return v.servers && v.servers.find((x) => x.name === 'Club renamed') ? v : null; }, 4000);
ok(seen && seen.servers.length === 2, 'the next sends carry the directory as it is now');
ok(seen && seen.servers[0].host === '127.0.0.1', 'local server: on the web client\'s host (here the same machine)');
await until(() => evCalls > evAfterTest, 4000);
ok(evCalls > evAfterTest, 'events sent again on schedule (at the switch, then every fifth send)');
const sh = await aget('/admin/arena/showcase');
ok(sh.ok && sh.community === true, 'the Arena\'s home page can show the community events');

// a new key on the Arena: the sends fail and say so
await fetch(arenaUrl + '/admin/arena/link/rotate', { method: 'POST', headers: { Authorization: 'Bearer arena-admin', 'Content-Type': 'application/json' }, body: '{}' });
const failedPush = await until(() => { const l = host.settings().link.lastPush; return l && !l.ok ? l : null; }, 4000);
ok(failedPush && /refused the key/.test(failedPush.error), 'a new key on the Arena: the next send fails and says why');
const KEY2 = (await aget('/admin/arena/link')).key;
r = await host.linkTest({ key: KEY2, origin: wcUrl });
ok(r.ok && host.settings().link.keyHint.indexOf(KEY2.slice(0, 8)) === 0, 'the new key pasted: linked again');

// /arena sent to the Arena; the organizer API not relayed here
let x = await fetch(wcUrl + '/arena/tournaments', { redirect: 'manual' });
ok(x.status === 302 && x.headers.get('location') === arenaUrl + '/arena/tournaments', '/arena pages: sent to the Arena (302)');
// The witness's requests stay on this site and are relayed to the Arena (web.325).
x = await fetch(wcUrl + '/arena/api/table?game=7&name=Friday', { redirect: 'manual' });
let xb = await x.json().catch(() => null);
ok(x.status !== 302 && x.status !== 307 && xb && xb.ok === false && xb.code, 'witness table lookup: relayed to the Arena, its answer comes back (no redirect)');
const wbody = JSON.stringify({ nick: 'Bob', code: 'ABCD2345', game: 7, name: 'Friday', report: { players: ['Bob'], hands: [[1, 1000]], winner: null, complete: false } });
x = await fetch(wcUrl + '/arena/api/t/abcdefgh12/witness', { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/json' }, body: wbody });
xb = await x.json().catch(() => null);
ok(x.status === 404 && xb && xb.code === 'notFound', 'witness report: relayed as a POST, the Arena answers (unknown tournament here)');
x = await fetch(wcUrl + '/arena/api/t/abcdefgh12/witness', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': String(70 * 1024) }, body: 'x'.repeat(70 * 1024) });
ok(x.status === 413, 'a witness report over 64 KB: refused here, not relayed');
x = await fetch(wcUrl + '/admin/arena/tournaments');
const xj = await x.json();
ok(x.status === 409 && xj.code === 'external' && xj.url === arenaUrl + '/arena/organize', 'organizer API: refused here, pointing to the Arena\'s organizer page');
x = await fetch(wcUrl + '/admin/arena/restart', { method: 'POST', body: '{}' });
ok(x.status === 409, 'restart: refused (restart it on the Arena)');
x = await fetch(wcUrl + '/admin/arena/settings');
const sj = await x.json();
ok(sj.ok && sj.link.mode === 'external' && sj.link.url === arenaUrl && !('key' in sj.link), 'settings answer: the link, never the key');

// back inside the web client; the sends stop, the key is kept
host.setSettings({ enabled: false });
host.setSettings({ mode: 'embedded' });
const before = (await aget('/admin/arena/link')).lastSync;
await sleep(900);
ok((await aget('/admin/arena/link')).lastSync === before, 'not « its own app »: nothing sent any more');
ok(!host.external() && host.settings().link.keySet && host.settings().link.url === arenaUrl, 'back inside: address and key kept for later');
host.setSettings({ key: '', url: '' });
ok(!host.settings().link.keySet && !host.settings().link.url, 'address and key can be cleared');

host.stop();
arena.kill('SIGTERM');
wc.close();
rmSync(adir, { recursive: true, force: true });
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
