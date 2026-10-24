#!/usr/bin/env node
// Tests of the link with a web client (arena/lib/link.mjs, service 0.34.0):
// the key made once and kept, the hello (wrong key, no address, rate limit),
// servers and events read from the web client with the key, a loopback
// server moved to the web client's host, the last good list kept a while,
// a new key cutting the link; then the Arena run on its own over HTTP
// (/arena/api/link/hello, /admin/arena/link, servers from the linked web
// client). No proxy.js: a small fake web client stands in.
// Run: node arena/test/test-arena-link.mjs
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createLink, cleanOrigin, KEY_RE } from '../lib/link.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const HERE = dirname(fileURLToPath(import.meta.url));

// ── cleanOrigin ──
ok(cleanOrigin('https://webclient.pokerth.net/') === 'https://webclient.pokerth.net', 'origin: trailing slash dropped');
ok(cleanOrigin('http://192.168.1.10:8080') === 'http://192.168.1.10:8080', 'origin: address and port');
ok(cleanOrigin('https://x.org/path') === null && cleanOrigin('ftp://x.org') === null && cleanOrigin('javascript:alert(1)') === null, 'origin: path, other schemes refused');

// ── the key, kept ──
const dir = mkdtempSync(join(tmpdir(), 'arena-link-'));
let t = 1000000;
const now = () => t;
// A fake fetch: the web client's two endpoints, checking the key.
let wcKey = null, wcUp = true, calls = [];
const fakeFetch = async (url, opts) => {
  calls.push(url);
  if (!wcUp) throw new Error('ECONNREFUSED');
  const auth = (opts && opts.headers && opts.headers.Authorization) || '';
  if (auth !== 'Bearer ' + wcKey) return { ok: false, status: 403, json: async () => ({ ok: false }) };
  if (/\/api\/arena-link\/servers$/.test(url)) return { ok: true, status: 200, json: async () => ({ ok: true, servers: [{ ref: 'local', kind: 'local', name: 'Local server', host: '127.0.0.1', port: 7234 }, { ref: 'lan:1', kind: 'lan', name: 'Club', host: 'club.example', port: 7234 }, { nope: 1 }] }) };
  if (/\/api\/arena-link\/events$/.test(url)) return { ok: true, status: 200, json: async () => ({ ok: true, events: { upcoming: [{ name: 'BBC' }] } }) };
  return { ok: false, status: 404, json: async () => ({}) };
};
const L = createLink({ dir, fetch: fakeFetch, now, version: '0.34.0' });
const k1 = L.key();
ok(KEY_RE.test(k1), 'key made at the first start');
ok((statSync(join(dir, 'link.json')).mode & 0o777) === 0o600, 'link.json readable by the service only');
ok(createLink({ dir, fetch: fakeFetch, now }).key() === k1, 'key kept across restarts');
ok(!L.linked() && L.info().webClient === null, 'not linked at first');
ok((await L.servers()).length === 0 && calls.length === 0, 'no web client: no servers, nothing asked');

// ── hello ──
let r = L.hello('Bearer alk_wrong', { url: 'https://wc.example.org' }, '1.2.3.4');
ok(r.status === 403 && r.body.code === 'key', 'hello: wrong key refused');
r = L.hello('Bearer ' + k1, {}, '1.2.3.4');
ok(r.status === 400 && r.body.code === 'url', 'hello: no address refused');
r = L.hello('Bearer ' + k1, { url: 'https://wc.example.org/', version: '2.1.10-web.323' }, '1.2.3.4');
ok(r.status === 200 && r.body.webClient === 'https://wc.example.org' && r.body.arena === '0.34.0', 'hello: linked, the Arena says its version');
ok(L.info().webClientVersion === '2.1.10-web.323' && L.info().linkedAt === t, 'hello: web client version and time kept');
ok(createLink({ dir, fetch: fakeFetch, now }).url() === 'https://wc.example.org', 'link kept across restarts');
for (let i = 0; i < 10; i++) L.hello('Bearer alk_bad' + i, { url: 'https://evil.example' }, '9.9.9.9');
r = L.hello('Bearer ' + k1, { url: 'https://evil.example' }, '9.9.9.9');
ok(r.status === 429 && L.url() === 'https://wc.example.org', 'hello: ten wrong keys from one address, then refused for a while');
t += 11 * 60 * 1000;
ok(L.hello('Bearer ' + k1, { url: 'https://wc.example.org' }, '9.9.9.9').status === 200, 'hello: allowed again after the window');

// ── servers and events from the web client ──
wcKey = k1;
let sv = await L.servers();
ok(sv.length === 2 && calls[calls.length - 1] === 'https://wc.example.org/api/arena-link/servers', 'servers read from the web client with the key (bad rows dropped)');
ok(sv[0].host === 'wc.example.org' && sv[1].host === 'club.example', 'the web client\'s local server: on its host, seen from here');
const keep = createLink({ dir, fetch: fakeFetch, now, keepLoopback: true });
ok((await keep.servers())[0].host === '127.0.0.1', 'ARENA_KEEP_LOOPBACK: hosts left as they are');
const ev = await L.events();
ok(ev && Array.isArray(ev.upcoming) && ev.upcoming[0].name === 'BBC', 'events read from the web client');
ok(L.info().lastPull === t && L.info().lastError === null, 'last answer noted');
wcUp = false;
ok((await L.servers()).length === 2, 'web client away: the last good list, for a while');
ok(/servers: ECONNREFUSED/.test(L.info().lastError || ''), 'the error is shown');
t += 11 * 60 * 1000;
ok((await L.servers()).length === 0, 'away too long: no servers');
ok((await L.events()) === null, 'away: no events');
wcUp = true;

// ── a new key cuts the link ──
const i2 = L.rotate();
ok(KEY_RE.test(i2.key) && i2.key !== k1 && i2.webClient === null, 'new key: made, the web client forgotten');
ok(L.hello('Bearer ' + k1, { url: 'https://wc.example.org' }, '5.5.5.6').status === 403, 'the old key does not link any more');
const envL = createLink({ dir: mkdtempSync(join(tmpdir(), 'arena-link-env-')), key: 'alk_' + 'e'.repeat(44), webClientUrl: 'https://fixed.example', fetch: fakeFetch, now });
ok(envL.key() === 'alk_' + 'e'.repeat(44) && envL.info().keyFromEnv, 'ARENA_LINK_KEY used');
let refused = false; try { envL.rotate(); } catch (e) { refused = true; }
ok(refused, 'ARENA_LINK_KEY: no new key from the page');
envL.hello('Bearer ' + envL.key(), { url: 'https://other.example' }, '1.1.1.1');
ok(envL.url() === 'https://fixed.example' && envL.info().fixed, 'ARENA_WEBCLIENT_URL: the hello does not change the address');

// ── the Arena on its own, over HTTP ──
const wcSeen = [];
let linkKey = null;
const wc = http.createServer((req, res) => {
  wcSeen.push(req.url);
  if (req.headers.authorization !== 'Bearer ' + linkKey) { res.writeHead(403); return res.end('{}'); }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  if (req.url === '/api/arena-link/servers') return res.end(JSON.stringify({ ok: true, servers: [{ ref: 'lan:7', kind: 'lan', name: 'Club LAN', host: '10.0.0.7', port: 7234, tls: false, pins: [] }] }));
  if (req.url === '/api/arena-link/events') return res.end(JSON.stringify({ ok: true, events: null }));
  res.end('{}');
});
await new Promise((ok2) => wc.listen(0, '127.0.0.1', ok2));
const wcUrl = 'http://127.0.0.1:' + wc.address().port;
const adir = mkdtempSync(join(tmpdir(), 'arena-link-svc-'));
const env = Object.assign({}, process.env, { ARENA_DIR: adir, ARENA_ADMIN_TOKEN: 'admin-token-for-tests', ARENA_PORT: '0', ARENA_HOST: '127.0.0.1' });
delete env.ARENA_SERVERS; delete env.ARENA_EVENTS_URL; delete env.ARENA_LINK_KEY; delete env.ARENA_WEBCLIENT_URL; delete env.ARENA_SECRET;
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
ok(x.status === 200 && x.body.mode === 'standalone' && KEY_RE.test(x.body.key) && x.body.webClient === null, '/admin/arena/link: the key, not linked');
linkKey = x.body.key;
ok((await jget('/admin/arena/link', {})).status === 403, '/admin/arena/link: nobody else');
x = await jget('/admin/arena/servers');
ok(x.status === 200 && x.body.servers.length === 0, 'not linked: no servers');
ok((await jpost('/arena/api/link/hello', { url: wcUrl }, { Authorization: 'Bearer alk_nope' })).status === 403, 'hello over HTTP: wrong key refused');
ok((await jget('/arena/api/link/hello', {})).status === 404, 'hello: POST only');
x = await jpost('/arena/api/link/hello', { url: wcUrl, version: '2.1.10-web.323' }, { Authorization: 'Bearer ' + linkKey });
ok(x.status === 200 && x.body.ok && x.body.webClient === wcUrl, 'hello over HTTP: linked');
x = await jget('/admin/arena/servers');
ok(x.status === 200 && x.body.servers.length === 1 && x.body.servers[0].ref === 'lan:7', 'servers now come from the linked web client');
ok(wcSeen.indexOf('/api/arena-link/servers') >= 0, 'the web client was asked with the key');
x = await jget('/admin/arena/link');
ok(x.body.webClient === wcUrl && x.body.webClientVersion === '2.1.10-web.323' && x.body.lastPull > 0, '/admin/arena/link: linked web client and last answer');
x = await jpost('/admin/arena/link/rotate', {});
ok(x.status === 200 && x.body.key !== linkKey && x.body.webClient === null, 'rotate over HTTP: new key, link cut');
const page = await fetch(base + '/arena/link-ui.mjs');
ok(page.status === 200 && /createLinkView/.test(await page.text()), 'the view\'s script is served');
const org = await (await fetch(base + '/arena/organize')).text();
ok(/id="tabLink"/.test(org) && /id="lkKey"/.test(org), 'the organizer page has the Web client view');

child.kill('SIGTERM');
wc.close();
for (const d of [dir, adir]) rmSync(d, { recursive: true, force: true });
console.log(fails ? '\n' + fails + ' FAILED' : '\nall link tests passed');
process.exit(fails ? 1 : 0);
