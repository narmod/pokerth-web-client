#!/usr/bin/env node
// The link with a PokerTH Arena (server/arena-link.js, web.327): the Arena is
// an application of its own (narmod/pokerth-arena); only it has an API, the
// web client sends it what it needs with the key it made.
// A fake Arena stands in for its link API (POST /arena/api/link/sync, the
// players' API); the web client's side is wired to a small HTTP server for
// /arena (handleArenaPage) and /admin/arena (handleArenaAdmin).
// Checks: settings validation (no switch on without address and key),
// « Test and save » (wrong key, no Arena, unknown address, accepted: saved
// and on), what is sent (address, version, servers, events) and its
// schedule, a key renewed on the Arena, the players' API relayed with the
// key and the player's address (no redirect), bodies over the limits,
// /arena pages sent to the Arena, the rest of /admin/arena pointing to the
// Arena's organizer page, paused, old settings of the embedded Arena.
// Run: node scripts/test-arena-link-host.mjs
import { join, dirname } from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const L = require(join(root, 'server', 'arena-link.js'));
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await sleep(25); } return null; }

// ── a fake Arena: its link API and a bit of the players' API ──
let KEY = 'alk_' + 'k'.repeat(44);
const syncs = [], seen = [];
const arena = http.createServer((req, res) => {
  let b = '';
  req.on('data', (d) => { b += d; });
  req.on('end', () => {
    const p = new URL(req.url, 'http://x').pathname;
    const json = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    if (p === '/arena/api/link/sync' && req.method === 'POST') {
      if (req.headers.authorization !== 'Bearer ' + KEY) return json(403, { ok: false, code: 'key' });
      const body = JSON.parse(b || '{}');
      syncs.push(body);
      return json(200, { ok: true, arena: '0.37.0', servers: (body.servers || []).length });
    }
    seen.push({ path: p, method: req.method, link: req.headers['x-arena-link'], client: req.headers['x-td-client'], body: b, qs: new URL(req.url, 'http://x').search });
    if (p === '/arena/api/table') return json(404, { ok: false, code: 'notFound' });
    if (/^\/arena\/api\/t\/[A-Za-z0-9_-]+\/witness$/.test(p)) return json(200, { ok: true, verdict: 'agrees' });
    json(404, { ok: false, code: 'notFound' });
  });
});
await new Promise((r) => arena.listen(0, '127.0.0.1', r));
const arenaUrl = 'http://127.0.0.1:' + arena.address().port;

// ── the web client's side ──
let conf = {}, evCalls = 0, lanName = 'Club';
const link = L.createArenaLink({
  getConfig: () => conf,
  setConfig: (c) => { conf = c; },
  listServers: () => [{ ref: 'local', kind: 'local', name: 'Local server', host: '127.0.0.1', port: 7234, tls: false, pins: [] }, { ref: 'lan:3', kind: 'lan', name: lanName, host: '10.1.2.3', port: 7234, tls: false, pins: [] }],
  communityEvents: () => { evCalls++; return Promise.resolve({ upcoming: [{ site: 'bbc', name: 'BBC 42' }] }); },
  clientVersion: () => '2.1.10-web.327',
  pushMs: 150,
  log: () => {},
});
const wc = http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  if (p === '/arena' || p.indexOf('/arena/') === 0) return L.handleArenaPage(link, req, res, p, '203.0.113.9');
  if (p.indexOf('/admin/arena') === 0) {
    const json = (r, c, o) => { r.writeHead(c, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(o)); };
    return L.handleArenaAdmin(link, { adminAuthed: () => true, adminJson: json, readJsonBody: (r, cb) => { let b = ''; r.on('data', (d) => { b += d; }); r.on('end', () => { try { cb(b ? JSON.parse(b) : {}); } catch (e) { cb(null); } }); }, origin: () => wcUrl }, req, res, p, {});
  }
  res.writeHead(404); res.end();
});
await new Promise((r) => wc.listen(0, '127.0.0.1', r));
const wcUrl = 'http://127.0.0.1:' + wc.address().port;
const get = (p, o) => fetch(wcUrl + p, Object.assign({ redirect: 'manual' }, o || {}));

// Nothing linked: nothing answers.
ok((await get('/arena')).status === 404 && (await get('/arena/api/list')).status === 404, 'not linked: /arena answers 404');
ok(L.createArenaHost === undefined && L.handleArenaLink === undefined, 'no Arena runs here and the web client exposes no API for it');

// Settings.
let threw = null;
try { link.setSettings({ url: 'https://arena.example.org/path' }); } catch (e) { threw = e.message; }
ok(/no path/.test(threw || ''), 'an address with a path is refused');
threw = null; try { link.setSettings({ key: 'not-a-key' }); } catch (e) { threw = e.message; }
ok(/link key/.test(threw || ''), 'a key that is not alk_… is refused');
threw = null; try { link.setSettings({ enabled: true }); } catch (e) { threw = e.message; }
ok(/address and its link key first/.test(threw || ''), 'the switch needs an address and a key first');
ok(!link.settings().enabled && !link.settings().link.keySet, 'nothing saved by refused settings');

// « Test and save ».
let r = await link.linkTest({ url: arenaUrl, key: 'alk_' + 'x'.repeat(44), origin: wcUrl });
ok(!r.ok && /refused the key/.test(r.error) && !link.settings().link.keySet, 'test: a wrong key is reported, nothing saved');
r = await link.linkTest({ url: 'http://127.0.0.1:9', key: KEY, origin: wcUrl });
ok(!r.ok && /cannot reach|timeout/.test(r.error), 'test: no Arena at the address is reported');
r = await link.linkTest({ url: arenaUrl, key: KEY, origin: '' });
ok(!r.ok && /public address/.test(r.error), 'test: an unknown public address is reported');
syncs.length = 0;
r = await link.linkTest({ url: arenaUrl + '/', key: KEY, origin: wcUrl });
ok(r.ok && r.arena === '0.37.0' && r.servers === 2, 'test: the Arena accepts the key and receives the servers');
const first = syncs[0];
ok(first && first.url === wcUrl && first.version === '2.1.10-web.327' && first.servers.length === 2 && first.events && first.events.upcoming[0].name === 'BBC 42', 'what is sent: our address, version, servers and the events');
let s = link.settings();
ok(s.enabled && s.linked && s.link.url === arenaUrl && s.link.self === wcUrl && s.link.keySet && s.link.keyHint.length < 20, 'accepted: address, key and our address saved, the link on, only a hint shown');
ok(s.link.lastTest.ok && s.link.lastPush.ok && s.link.lastPush.servers === 2, 'last test and last send shown');

// Sends on schedule, the directory as it is now.
lanName = 'Club renamed';
const later = await until(() => syncs.find((x) => x.servers && x.servers[1] && x.servers[1].name === 'Club renamed'), 3000);
ok(later && later.servers.length === 2, 'the next sends carry the directory as it is now');
const evBefore = evCalls;
await until(() => evCalls > evBefore, 3000);
ok(evCalls > evBefore, 'the events go again every fifth send');

// A key renewed on the Arena: the next send fails and says why.
KEY = 'alk_' + 'n'.repeat(44);
const failed = await until(() => { const l = link.settings().link.lastPush; return l && !l.ok ? l : null; }, 3000);
ok(failed && /refused the key/.test(failed.error), 'a new key on the Arena: the next send fails and says why');
r = await link.linkTest({ key: KEY, origin: wcUrl });
ok(r.ok && link.settings().link.keyHint.indexOf(KEY.slice(0, 8)) === 0, 'the new key pasted (address kept): linked again');

// The players' API (the witness) relayed, never redirected.
seen.length = 0;
let x = await get('/arena/api/table?game=7&name=Friday');
let xb = await x.json().catch(() => null);
const t1 = seen.find((q) => q.path === '/arena/api/table');
ok(x.status === 404 && xb && xb.code === 'notFound' && t1 && t1.qs === '?game=7&name=Friday', 'witness table lookup: relayed with its query, the Arena\'s answer back (no redirect)');
ok(t1 && t1.link === KEY && t1.client === '203.0.113.9', 'relayed with the link key and the player\'s address');
const wbody = JSON.stringify({ nick: 'Bob', code: 'ABCD2345', game: 7, name: 'Friday', report: { players: ['Bob'], hands: [[1, 1000]], winner: null, complete: false } });
x = await get('/arena/api/t/abcdefgh12/witness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: wbody });
xb = await x.json().catch(() => null);
ok(x.status === 200 && xb && xb.verdict === 'agrees' && seen.some((q) => q.method === 'POST' && q.body === wbody), 'witness report: relayed as a POST, body as is');
x = await get('/arena/api/t/abcdefgh12/witness', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': String(70 * 1024) }, body: 'x'.repeat(70 * 1024) });
ok(x.status === 413, 'a witness report over 64 KB: refused here, not relayed');

// Pages to the Arena; its administration on the Arena.
x = await get('/arena/tournaments?x=1');
ok(x.status === 302 && x.headers.get('location') === arenaUrl + '/arena/tournaments?x=1', '/arena pages: sent to the Arena (302)');
x = await get('/arena/../admin');
ok(x.status !== 302 || x.headers.get('location').indexOf('..') < 0, 'no « .. » sent along');
x = await get('/admin/arena/tournaments');
const xj = await x.json();
ok(x.status === 404 && xj.code === 'moved' && xj.url === arenaUrl + '/arena/organize', 'the rest of /admin/arena: points to the Arena\'s organizer page');
x = await get('/admin/arena/settings');
const sj = await x.json();
ok(sj.ok && sj.linked && sj.link.url === arenaUrl && !('key' in sj.link) && !('key' in sj), 'settings answer: the link, never the key');

// Paused: nothing sent, /arena 404; the address and key kept.
link.setSettings({ enabled: false });
const n0 = syncs.length;
await sleep(500);
ok(syncs.length === n0 && (await get('/arena')).status === 404, 'paused: nothing sent, /arena answers 404');
ok(link.settings().link.keySet && link.settings().link.url === arenaUrl, 'paused: address and key kept');

// Settings left by the Arena that ran inside the web client (until web.326).
conf = { enabled: true, mode: 'embedded' };
ok(!link.linked() && (await get('/arena')).status === 404, 'old embedded settings: not linked, /arena 404');
link.setSettings({ url: arenaUrl });
ok(!('mode' in conf), 'old « mode » setting dropped at the next save');
link.setSettings({ key: '', url: '' });
ok(!link.settings().link.keySet && !link.settings().link.url, 'address and key can be cleared');

link.stop();
arena.close();
wc.close();
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
