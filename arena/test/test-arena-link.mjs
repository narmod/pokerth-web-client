#!/usr/bin/env node
// Tests of the link with a web client (arena/lib/link.mjs, service 0.34.0):
// the key made once and kept; POST /arena/api/link/sync (wrong key, rate
// limit, bad rows dropped); the servers and events sent, used while fresh
// and kept across a restart; a loopback server moved to the web client's
// host; a new key cutting the link; then the Arena run on its own over HTTP
// (/arena/api/link/sync, /admin/arena/link, servers from what was sent).
// The web client is never called: only the Arena has an API.
// Run: node arena/test/test-arena-link.mjs
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createLink, cleanOrigin, cleanServer, KEY_RE } from '../lib/link.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const HERE = dirname(fileURLToPath(import.meta.url));

// ── helpers ──
ok(cleanOrigin('https://webclient.pokerth.net/') === 'https://webclient.pokerth.net', 'origin: trailing slash dropped');
ok(cleanOrigin('http://192.168.1.10:8080') === 'http://192.168.1.10:8080', 'origin: address and port');
ok(cleanOrigin('https://x.org/path') === null && cleanOrigin('ftp://x.org') === null && cleanOrigin('javascript:alert(1)') === null, 'origin: path, other schemes refused');
ok(cleanServer({ ref: 'lan:1', kind: 'lan', name: 'Club', host: 'club.example', port: 7234, extra: 'x' }).extra === undefined, 'server: only the fields the director uses');
ok(cleanServer({ ref: 'x', host: 'bad host;rm', port: 7234 }) === null && cleanServer({ ref: 'x', host: 'h', port: 70000 }) === null && cleanServer({ host: 'h', port: 1 }) === null, 'server: bad host, port or no ref dropped');

// ── the key, kept ──
const dir = mkdtempSync(join(tmpdir(), 'arena-link-'));
let t = 1000000;
const now = () => t;
const L = createLink({ dir, now, version: '0.34.0' });
const k1 = L.key();
ok(KEY_RE.test(k1), 'key made at the first start');
ok((statSync(join(dir, 'link.json')).mode & 0o777) === 0o600, 'link.json readable by the service only');
ok(createLink({ dir, now }).key() === k1, 'key kept across restarts');
ok(!L.linked() && L.info().webClient === null, 'not linked at first');
ok((await L.servers()).length === 0 && (await L.events()) === null, 'nothing sent: no servers, no events');

// ── sync ──
const SERVERS = [{ ref: 'local', kind: 'local', name: 'Local server', host: '127.0.0.1', port: 7234 }, { ref: 'lan:1', kind: 'lan', name: 'Club', host: 'club.example', port: 7234, tls: true }, { nope: 1 }];
let r = L.sync('Bearer alk_wrong', { url: 'https://wc.example.org', servers: SERVERS }, '1.2.3.4');
ok(r.status === 403 && r.body.code === 'key' && (await L.servers()).length === 0, 'sync: wrong key refused, nothing kept');
ok(L.sync('Bearer ' + k1, null, '1.2.3.4').status === 400, 'sync: no body refused');
r = L.sync('Bearer ' + k1, { url: 'https://wc.example.org/', version: '2.1.10-web.323', servers: SERVERS, events: { upcoming: [{ name: 'BBC' }] } }, '1.2.3.4');
ok(r.status === 200 && r.body.webClient === 'https://wc.example.org' && r.body.arena === '0.34.0' && r.body.servers === 2, 'sync: linked, two servers kept (bad row dropped)');
let sv = await L.servers();
ok(sv.length === 2 && sv[0].host === 'wc.example.org' && sv[1].host === 'club.example' && sv[1].tls === true, 'the web client\'s local server: on its host, seen from here');
ok((await createLink({ dir, now, keepLoopback: true }).servers())[0].host === '127.0.0.1', 'ARENA_KEEP_LOOPBACK: hosts left as they are');
const ev = await L.events();
ok(ev && ev.upcoming[0].name === 'BBC', 'events kept');
ok(L.info().webClientVersion === '2.1.10-web.323' && L.info().lastSync === t && L.info().servers === 2 && L.info().serversFresh, 'info: version, last sync, servers');
const L2 = createLink({ dir, now });
ok((await L2.servers()).length === 2 && L2.url() === 'https://wc.example.org', 'kept across a restart');
t += 60 * 1000;
r = L.sync('Bearer ' + k1, { version: '2.1.10-web.323', servers: SERVERS.slice(1) }, '1.2.3.4');
ok(r.status === 200 && (await L.servers()).length === 1 && L.url() === 'https://wc.example.org', 'a sync without address keeps the known one; servers replaced');
ok((await L.events()).upcoming[0].name === 'BBC', 'a sync without events keeps the last ones');
const since = L.info().linkedAt;
ok(since === 1000000, 'linked since the first sync');
t += 11 * 60 * 1000;
ok((await L.servers()).length === 0 && !L.info().serversFresh, 'nothing sent for over ten minutes: no servers');
ok((await L.events()) !== null, 'events: kept half an hour');
t += 20 * 60 * 1000;
ok((await L.events()) === null, 'events: then dropped');

// ── rate limit ──
for (let i = 0; i < 10; i++) L.sync('Bearer alk_bad' + i, {}, '9.9.9.9');
r = L.sync('Bearer ' + k1, { servers: [] }, '9.9.9.9');
ok(r.status === 429, 'ten wrong keys from one address, then refused for a while');
t += 11 * 60 * 1000;
ok(L.sync('Bearer ' + k1, { servers: [] }, '9.9.9.9').status === 200, 'allowed again after the window');

// ── a new key cuts the link ──
const i2 = L.rotate();
ok(KEY_RE.test(i2.key) && i2.key !== k1 && i2.webClient === null && i2.servers === 0, 'new key: made, the web client and its servers forgotten');
ok(L.sync('Bearer ' + k1, { servers: SERVERS }, '5.5.5.6').status === 403, 'the old key does not link any more');
const envL = createLink({ dir: mkdtempSync(join(tmpdir(), 'arena-link-env-')), key: 'alk_' + 'e'.repeat(44), webClientUrl: 'https://fixed.example', now });
ok(envL.key() === 'alk_' + 'e'.repeat(44) && envL.info().keyFromEnv, 'ARENA_LINK_KEY used');
let refused = false; try { envL.rotate(); } catch (e) { refused = true; }
ok(refused, 'ARENA_LINK_KEY: no new key from the page');
envL.sync('Bearer ' + envL.key(), { url: 'https://other.example', servers: [] }, '1.1.1.1');
ok(envL.url() === 'https://fixed.example' && envL.info().fixed, 'ARENA_WEBCLIENT_URL: the sync does not change the address');

// ── the Arena on its own, over HTTP ──
const adir = mkdtempSync(join(tmpdir(), 'arena-link-svc-'));
const env = Object.assign({}, process.env, { ARENA_DIR: adir, ARENA_ADMIN_TOKEN: 'admin-token-for-tests', ARENA_PORT: '0', ARENA_HOST: '127.0.0.1' });
for (const k of ['ARENA_SERVERS', 'ARENA_EVENTS_URL', 'ARENA_LINK_KEY', 'ARENA_WEBCLIENT_URL', 'ARENA_SECRET']) delete env[k];
const child = spawn(process.execPath, [join(HERE, '..', 'server.mjs')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let out = '';
child.stdout.on('data', (d) => { out += d; });
child.stderr.on('data', (d) => { out += d; });
const port = await new Promise((resolve) => {
  const t0 = Date.now();
  const iv = setInterval(() => { const m = /on http:\/\/127\.0\.0\.1:(\d+)/.exec(out); if (m || Date.now() - t0 > 10000) { clearInterval(iv); resolve(m ? Number(m[1]) : 0); } }, 50);
});
ok(port > 0, 'service started on its own');
ok(/not linked to a web client yet/.test(out), 'it says it is not linked yet');
const base = 'http://127.0.0.1:' + port;
const H = { Authorization: 'Bearer admin-token-for-tests' };
const jget = (p, h) => fetch(base + p, { headers: h || H }).then(async (x) => ({ status: x.status, body: await x.json().catch(() => null) }));
const jpost = (p, b, h) => fetch(base + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, h || H), body: JSON.stringify(b) }).then(async (x) => ({ status: x.status, body: await x.json().catch(() => null) }));
let x = await jget('/admin/arena/link');
ok(x.status === 200 && x.body.mode === 'standalone' && KEY_RE.test(x.body.key) && x.body.lastSync === null, '/admin/arena/link: the key, not linked');
const linkKey = x.body.key;
ok((await jget('/admin/arena/link', {})).status === 403, '/admin/arena/link: nobody else');
x = await jget('/admin/arena/servers');
ok(x.status === 200 && x.body.servers.length === 0, 'not linked: no servers');
ok((await jpost('/arena/api/link/sync', { servers: [] }, { Authorization: 'Bearer alk_nope' })).status === 403, 'sync over HTTP: wrong key refused');
ok((await jget('/arena/api/link/sync', {})).status === 404, 'sync: POST only');
x = await jpost('/arena/api/link/sync', { url: 'http://127.0.0.1:9999', version: '2.1.10-web.323', servers: [{ ref: 'lan:7', kind: 'lan', name: 'Club LAN', host: '10.0.0.7', port: 7234, tls: false, pins: [] }], events: null }, { Authorization: 'Bearer ' + linkKey });
ok(x.status === 200 && x.body.ok && x.body.servers === 1, 'sync over HTTP: linked');
x = await jget('/admin/arena/servers');
ok(x.status === 200 && x.body.servers.length === 1 && x.body.servers[0].ref === 'lan:7', 'servers now come from what the web client sent');
x = await jget('/admin/arena/link');
ok(x.body.webClient === 'http://127.0.0.1:9999' && x.body.webClientVersion === '2.1.10-web.323' && x.body.lastSync > 0, '/admin/arena/link: linked web client and last sync');
x = await jpost('/admin/arena/link/rotate', {});
ok(x.status === 200 && x.body.key !== linkKey && x.body.webClient === null, 'rotate over HTTP: new key, link cut');
ok((await jget('/admin/arena/servers')).body.servers.length === 0, 'after a new key: no servers until the web client sends again');
const page = await fetch(base + '/arena/link-ui.mjs');
ok(page.status === 200 && /createLinkView/.test(await page.text()), 'the view\'s script is served');
const org = await (await fetch(base + '/arena/organize')).text();
ok(/id="tabLink"/.test(org) && /id="lkKey"/.test(org), 'the organizer page has the Web client view');

child.kill('SIGTERM');
for (const d of [dir, adir]) rmSync(d, { recursive: true, force: true });
console.log(fails ? '\n' + fails + ' FAILED' : '\nall link tests passed');
process.exit(fails ? 1 : 0);
