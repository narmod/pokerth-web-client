#!/usr/bin/env node
// Deterministic tests for the LAN server directory (server/lan-directory.js)
// and its wiring in proxy.js. Run: node scripts/test-lan-directory.mjs
//
//   1. unit: address checks, sanitizing, the propose -> approve flow, the
//      allowlist hooks, visibility rules, rate limits (fake DNS and probe);
//   2. socket: the greeting probe against a fake PokerTH server that sends a
//      real AnnounceMessage, a non-PokerTH server and a closed port;
//   3. end to end: the real proxy.js spawned with a temporary config, driven
//      through /api/lan-directory/* and /admin/lan-directory.
import net from 'net';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import * as P from '../public/proto/index.mjs';
import WebSocket from 'ws';

const require = createRequire(import.meta.url);
const LD = require('../server/lan-directory.js');
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let fails = 0, checks = 0;
function ok(cond, label) {
  checks++;
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}
const call = (fn, ...a) => new Promise((res) => fn(...a, res));

// ── 1. unit ────────────────────────────────────────────────────────
console.log('Address checks');
for (const ip of ['10.1.2.3', '127.0.0.1', '192.168.1.20', '172.16.0.1', '172.31.255.255', '169.254.1.1', '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255', '::1', '::', 'fd12::1', 'fe80::1', '::ffff:192.168.0.1', 'ff02::1', 'nonsense'])
  ok(LD.isPrivateAddress(ip), ip + ' is refused');
for (const ip of ['93.184.216.34', '172.32.0.1', '8.8.8.8', '2a00:1450:4007:80e::200e', '::ffff:8.8.8.8'])
  ok(!LD.isPrivateAddress(ip), ip + ' is public');

console.log('Sanitizing');
ok(LD.cleanHost(' Poker.Example.ORG ') === 'poker.example.org', 'host is trimmed and lower-cased');
ok(LD.cleanHost('[::1]') === '::1' && LD.cleanHost('1.2.3.4') === '1.2.3.4', 'IP literals accepted, brackets dropped');
ok(LD.cleanHost('bad host') === '' && LD.cleanHost('-a.com') === '' && LD.cleanHost('a..b') === '' && LD.cleanHost('x/y') === '', 'malformed hosts refused');
ok(LD.cleanText('  <b>Club</b>\u0000 Lyon  ', 40) === 'b Club /b Lyon', 'angle brackets and control characters removed');
ok(LD.cleanText('x'.repeat(99), 40).length === 40, 'text is capped');
const ns = LD.normSettings({ checkMinutes: 0, autoHideDays: 'x', maxPerIpDay: 999, manualEntry: false });
ok(ns.checkMinutes === 5 && ns.autoHideDays === 7 && ns.maxPerIpDay === 3 && ns.manualEntry === false && ns.acceptRequests === true, 'settings: bad values fall back, booleans kept');
ok(LD.normSettings(null).manualEntry === false && LD.normSettings(null).localEntry === true && LD.normSettings(null).refusePrivate === true, 'defaults: manual entry off, local server listed, private addresses refused');
ok(LD.normSettings({ localEntry: false }).localEntry === false, 'the local server can be turned off (pokerth.net)');

console.log('Directory flow');
let T = Date.parse('2026-10-14T10:00:00Z');
const cfg = {};
let saves = 0;
const DNS = { 'club.example.org': ['93.184.216.34'], 'home.example.org': ['192.168.1.20'], 'dual.example.org': ['93.184.216.35', '10.0.0.5'],
  'self.example.org': ['93.184.216.36'], 'off.example.org': ['93.184.216.37'], 'web.example.org': ['93.184.216.38'],
  'a.example.org': ['93.184.216.40'], 'b.example.org': ['93.184.216.41'], 'c.example.org': ['93.184.216.42'], 'd.example.org': ['93.184.216.43'], 'e.example.org': ['93.184.216.44'] };
const probes = [];
const PROBE = {
  'self.example.org': (t) => t.noverify ? { reachable: true, pokerth: true, players: 2, ver: '6.1' } : { reachable: true, certError: true, error: 'DEPTH_ZERO_SELF_SIGNED_CERT' },
  'off.example.org': () => ({ reachable: false, error: 'ECONNREFUSED' }),
  'web.example.org': () => ({ reachable: true, pokerth: false, error: 'not a PokerTH server' })
};
const dir = LD.createLanDirectory({
  getStore: () => { if (!cfg.lanDirectory) cfg.lanDirectory = {}; return cfg.lanDirectory; },
  save: () => { saves++; },
  isPortAllowed: (p) => p === 7234 || p === 7236,
  now: () => T,
  lookup: (h, cb) => DNS[h] ? cb(null, DNS[h]) : cb(new Error('ENOTFOUND')),
  probe: (t, cb) => { probes.push(t); const f = PROBE[t.host]; setImmediate(() => cb(f ? f(t) : { reachable: true, pokerth: true, players: 12, ver: '6.1' })); },
  lobbyProbe: (h, p, tls, cb) => setImmediate(() => cb({ ok: true, reachable: true, players: 12, games: 3, running: 1, ver: '6.1', ms: 40 })),
  globalIpCap: () => 20
});
const IP = '198.51.100.7';
const prop = (o, ip = IP) => call(dir.propose, Object.assign({ name: 'Club', port: 7234, tls: false }, o), ip);

let r = await call(dir.test, { host: 'club.example.org', port: 7234 }, IP);
ok(r.ok && r.reachable && r.pokerth && r.players === 12, 'test: a PokerTH server answers');
ok(probes[0].address === '93.184.216.34' && probes[0].host === 'club.example.org', 'the probe dials the address that was checked (no DNS rebinding)');
ok(!('lanDirectory' in cfg) || !cfg.lanDirectory.pending, 'test stores nothing');
r = await call(dir.test, { host: 'club.example.org', port: 22 }, IP);
ok(!r.ok && r.error === 'port', 'test: a non-PokerTH port is refused before any connection');
r = await call(dir.test, { host: 'home.example.org', port: 7234 }, IP);
ok(!r.ok && r.error === 'private', 'test: a private address is refused');
r = await call(dir.test, { host: 'dual.example.org', port: 7234 }, IP);
ok(!r.ok && r.error === 'private', 'test: refused when ANY resolved address is private');
r = await call(dir.test, { host: 'nowhere.example.org', port: 7234 }, IP);
ok(!r.ok && r.error === 'dns', 'test: unknown host');

r = await prop({ name: 'Club <Lyon>', host: 'Club.Example.org', country: 'fr', lang: 'fr', desc: 'Thursdays', resetPeriod: 'weekly' });
ok(r.ok === true, 'propose: accepted');
let av = dir.adminView();
ok(av.pending[0].resetPeriod === 'weekly', 'the leaderboard reset period chosen in the request is kept');
ok(av.pending[0].maxPerIp === 3, 'players per IP: 3 by default');
ok(LD.RESET_PERIODS.join() === 'off,daily,weekly,monthly,yearly', 'five reset periods');
ok(av.pending.length === 1 && av.pending[0].name === 'Club Lyon' && av.pending[0].host === 'club.example.org' && av.pending[0].country === 'FR', 'pending request sanitized (name, host, country)');
ok(av.pending[0].probe && av.pending[0].probe.pokerth && av.pending[0].probe.players === 12, 'the submit check result is kept for the admin');
ok(!JSON.stringify(cfg).includes(IP), 'the sender IP is not stored anywhere');
ok(!dir.hostAllowed('club.example.org'), 'a pending server is NOT allowlisted');
ok(dir.publicView().servers.length === 0, 'a pending server is not listed');
r = await prop({ host: 'club.example.org' });
ok(!r.ok && r.error === 'pending', 'propose: same address twice -> pending');
r = await prop({ host: 'off.example.org' });
ok(!r.ok && r.error === 'unreachable', 'propose: unreachable server refused');
r = await prop({ host: 'web.example.org' });
ok(!r.ok && r.error === 'notpokerth', 'propose: something that is not PokerTH refused');
r = await prop({ host: 'home.example.org' });
ok(!r.ok && r.error === 'private', 'propose: private address refused');
r = await prop({ host: 'self.example.org', port: 7236, tls: true });
ok(r.ok, 'propose: self-signed TLS server accepted (still PokerTH)');
av = dir.adminView();
const selfReq = av.pending.find((x) => x.host === 'self.example.org');
ok(selfReq && selfReq.probe.certUntrusted === true, 'the untrusted certificate is flagged for the admin');
r = await prop({ host: 'a.example.org' });
ok(r.ok, 'propose: third request of the day accepted (refused ones do not count)');
r = await prop({ host: 'b.example.org' });
ok(!r.ok && r.error === 'limit', 'propose: per-IP daily limit (3 accepted, then refused)');
r = await prop({ host: 'b.example.org' }, '198.51.100.8');
ok(r.ok, 'another IP is not affected');
T += 86400000;
r = await prop({ host: 'e.example.org', maxPerIp: 9 });
ok(r.ok, 'the limit resets the next day');
ok(dir.adminView().pending.find((x) => x.host === 'e.example.org').maxPerIp === 5, 'a request cannot ask for more than 5 players per IP');

console.log('Admin actions');
const clubId = dir.adminView().pending.find((x) => x.host === 'club.example.org').id;
r = await call(dir.admin, { action: 'approve', id: clubId });
ok(r.ok && r.entries.length === 1 && r.pending.every((x) => x.id !== clubId), 'approve moves the request to the directory');
ok(dir.hostAllowed('club.example.org') && dir.portAllowed(7234), 'approved server joins the dial allowlist');
ok(dir.ipCapFor('club.example.org', 7234) === 3 && dir.ipCapFor('nope.example.org', 7234) === 0, 'per-server players-per-IP cap (0 = not a listed server)');
r = await call(dir.admin, { action: 'update', id: clubId, entry: { maxPerIp: 12 } });
ok(r.ok && dir.ipCapFor('club.example.org', 7234) === 12, 'the admin can go above 5');
r = await call(dir.admin, { action: 'update', id: clubId, entry: { maxPerIp: 99 } });
ok(dir.ipCapFor('club.example.org', 7234) === 20 && r.ipCap.max === 20 && r.ipCap.global === 20, 'never above the proxy-wide per-IP cap');
await call(dir.admin, { action: 'update', id: clubId, entry: { maxPerIp: 3 } });
let pv = dir.publicView();
ok(pv.servers.length === 1 && pv.servers[0].name === 'Club Lyon' && pv.servers[0].online === null, 'listed, status unknown until the first check');
ok(pv.manualEntry === false && pv.localEntry === true && pv.acceptRequests === true, 'public view carries the three client switches');
await new Promise((res) => dir.checkEntry(clubId, res));
pv = dir.publicView();
ok(pv.servers[0].online === true && pv.servers[0].players === 12, 'health check: online with its player count');
ok(!('lastSeenIp' in pv.servers[0]) && !('noverify' in pv.servers[0]) && !('sni' in pv.servers[0]), 'public view exposes no admin-only field');
const selfId = dir.adminView().pending.find((x) => x.host === 'self.example.org').id;
r = await call(dir.admin, { action: 'approve', id: selfId, entry: { name: 'Self TLS' } });
ok(r.ok && dir.tlsOpts('self.example.org', 7236).noverify === true, 'approving a self-signed server sets "skip cert check" for it');
ok(dir.tlsOpts('club.example.org', 7234).noverify === false && dir.tlsOpts('x.example.org', 7234) === null, 'other hosts keep certificate checks');
r = await call(dir.admin, { action: 'update', id: selfId, entry: { visible: false } });
ok(r.ok && !dir.publicView().servers.some((s) => s.host === 'self.example.org') && dir.hostAllowed('self.example.org'), 'unlisted: hidden from the list but still dialable');
const aId = dir.adminView().pending.find((x) => x.host === 'a.example.org').id;
r = await call(dir.admin, { action: 'reject', id: aId });
ok(r.ok && !r.pending.some((x) => x.id === aId) && !dir.hostAllowed('a.example.org'), 'reject drops the request');
r = await call(dir.admin, { action: 'add', entry: { name: 'Manual', host: 'd.example.org', port: 7234 } });
ok(r.ok && dir.hostAllowed('d.example.org'), 'admin can add a server by hand');
r = await call(dir.admin, { action: 'add', entry: { host: 'd.example.org', port: 7234 } });
ok(!r.ok, 'no duplicate entries');
const dId = dir.adminView().entries.find((x) => x.host === 'd.example.org').id;
r = await call(dir.admin, { action: 'check', id: dId });
ok(r.ok && r.check.games === 3 && r.check.players === 12, 'admin check runs the full lobby probe (tables + players)');
r = await call(dir.admin, { action: 'remove', id: dId });
ok(r.ok && !dir.hostAllowed('d.example.org'), 'remove takes the server out of the allowlist');
r = await call(dir.admin, { action: 'nope' });
ok(!r.ok, 'unknown action refused');

console.log('Visibility');
dir._status.set(clubId, { online: false, players: null, at: T });
ok(dir.publicView().servers.some((s) => s.id === clubId && s.online === false), 'offline server stays listed by default (greyed client-side)');
const store = cfg.lanDirectory;
store.entries.find((x) => x.id === clubId).lastSeen = T - 8 * 86400000;
ok(!dir.publicView().servers.some((s) => s.id === clubId), 'offline for more than 7 days: auto-hidden');
ok(dir.adminView().entries.find((x) => x.id === clubId).autoHidden === true, 'admin sees it marked auto-hidden');
ok(dir.hostAllowed('club.example.org'), 'auto-hidden servers stay allowlisted');
store.entries.find((x) => x.id === clubId).lastSeen = T - 3600000;
r = await call(dir.admin, { action: 'settings', settings: { showOffline: false } });
ok(r.ok && !dir.publicView().servers.some((s) => s.id === clubId), 'showOffline off: offline servers dropped from the list');
r = await call(dir.admin, { action: 'settings', settings: { acceptRequests: false, manualEntry: false } });
ok(dir.publicView().manualEntry === false && dir.publicView().acceptRequests === false, 'settings reach the public view');
r = await prop({ host: 'c.example.org' }, '198.51.100.9');
ok(!r.ok && r.error === 'closed', 'requests closed by the admin');

console.log('Robustness');
store.entries.push({ id: 'bad', host: 'x y', port: 'z' }, null, { id: 'lan_abcdef12', host: 'ok.example.org', port: 7234, name: '<i>' });
ok(dir.adminView().entries.every((e) => e.host && e.port) && dir.adminView().entries.some((e) => e.host === 'ok.example.org' && e.name === 'i'), 'garbage from an imported config is filtered on read');
let lim = 0;
for (let i = 0; i < 25; i++) { const x = await call(dir.test, { host: 'club.example.org', port: 7234 }, '198.51.100.99'); if (x.error === 'limit') lim++; }
ok(lim === 5, 'connection tests are limited to 20 per IP per hour (' + lim + ' refused)');
T += 2 * 60000;
const startedTick = dir.tick();
ok(Array.isArray(startedTick) && startedTick.length >= 1, 'periodic tick re-checks servers whose status is stale');

// ── 2. socket: the greeting probe ──────────────────────────────────
console.log('Greeting probe');
function frame(buf) { const b = Buffer.alloc(4 + buf.length); b.writeUInt32BE(buf.length, 0); Buffer.from(buf).copy(b, 4); return b; }
const announce = P.PokerTHMessage.encode(P.PokerTHMessage.create({
  messageType: P.MessageType.Type_AnnounceMessage,
  announceMessage: { protocolVersion: { majorVersion: 6, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 },
                     latestBetaRevision: 0, serverType: 0, numPlayersOnServer: 7 }
})).finish();
let received = 0;
const fake = net.createServer((s) => { s.on('data', () => { received++; }); s.write(frame(announce)); s.on('error', () => {}); });
await new Promise((res) => fake.listen(0, '127.0.0.1', res));
const junk = net.createServer((s) => { s.write('HTTP/1.1 400 Bad Request\r\n\r\n'); s.on('error', () => {}); });
await new Promise((res) => junk.listen(0, '127.0.0.1', res));
const FAKE = fake.address().port, JUNK = junk.address().port;
r = await call(LD.announceProbe, { host: '127.0.0.1', port: FAKE, tls: false }, P.decode);
ok(r.reachable && r.pokerth && r.players === 7 && r.ver === '6.1', 'a real AnnounceMessage is recognised (7 players, protocol 6.1)');
await new Promise((res) => setTimeout(res, 100));
ok(received === 0, 'the probe sends nothing (no login, no guest in the server lobby)');
r = await call(LD.announceProbe, { host: '127.0.0.1', port: JUNK, tls: false }, P.decode);
ok(r.reachable && !r.pokerth, 'an HTTP server is reachable but not PokerTH');
// TLS with a self-signed certificate (skipped when openssl is missing).
let tlsSrv = null;
try {
  const { execFileSync } = await import('child_process');
  const kd = fs.mkdtempSync(path.join(os.tmpdir(), 'lan-tls-'));
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=self.example.org',
    '-keyout', path.join(kd, 'k.pem'), '-out', path.join(kd, 'c.pem')], { stdio: 'ignore' });
  const tlsMod = await import('tls');
  tlsSrv = tlsMod.createServer({ key: fs.readFileSync(path.join(kd, 'k.pem')), cert: fs.readFileSync(path.join(kd, 'c.pem')) },
    (s) => { s.write(frame(announce)); s.on('error', () => {}); });
  tlsSrv.on('tlsClientError', () => {});
  await new Promise((res) => tlsSrv.listen(0, '127.0.0.1', res));
  fs.rmSync(kd, { recursive: true, force: true });
} catch (e) { tlsSrv = null; }
if (tlsSrv) {
  const TP = tlsSrv.address().port;
  r = await call(LD.announceProbe, { host: 'self.example.org', address: '127.0.0.1', port: TP, tls: true }, P.decode);
  ok(r.certError && !r.pokerth, 'TLS, self-signed: certificate refused while checks are on (' + r.error + ')');
  r = await call(LD.announceProbe, { host: 'self.example.org', address: '127.0.0.1', port: TP, tls: true, noverify: true }, P.decode);
  ok(r.pokerth && r.players === 7, 'TLS, self-signed: still recognised as PokerTH once checks are skipped');
  tlsSrv.close();
} else console.log('  - TLS probe checks skipped (no openssl)');
const closedPort = await new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
r = await call(LD.announceProbe, { host: '127.0.0.1', port: closedPort, tls: false, timeoutMs: 2000 }, P.decode);
ok(!r.reachable && !r.pokerth && r.error, 'a closed port is unreachable (' + r.error + ')');

// ── 3. end to end through proxy.js ─────────────────────────────────
console.log('Through proxy.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lan-dir-'));
const PROXY_PORT = 18000 + Math.floor(Math.random() * 900);
const TOKEN = 'test-token-' + Math.random().toString(36).slice(2);
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root,
  env: Object.assign({}, process.env, {
    PORT: String(PROXY_PORT), ALLOWED_PORTS: String(FAKE), STATS_ADMIN_TOKEN: TOKEN,
    ADMIN_CONFIG_FILE: path.join(tmp, 'admin-config.json'), STATS_FILE: path.join(tmp, 'stats.json'),
    STATS_META_FILE: path.join(tmp, 'stats.meta.json'), AUDIT_FILE: path.join(tmp, 'audit.json'),
    VISITS_FILE: path.join(tmp, 'visits.json'), BROADCASTS_FILE: path.join(tmp, 'broadcasts.json'),
    POLLS_FILE: path.join(tmp, 'polls.json'), SCOPED_TOKENS_FILE: path.join(tmp, 'scoped.json'),
    DEPLOY_HISTORY_FILE: path.join(tmp, 'deploy.json'), DB_CONFIG_FILE: path.join(tmp, 'db.json')
  }),
  stdio: ['ignore', 'pipe', 'pipe']
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; });
proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PROXY_PORT;
async function http(p, body, method) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(base + p, body ? { method: method || 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
      return { status: res.status, json: await res.json().catch(() => null) };
    } catch (e) { await new Promise((r2) => setTimeout(r2, 150)); }
  }
  return { status: 0, json: null };
}
try {
  let h = await http('/api/lan-directory');
  ok(h.status === 200 && h.json.ok && Array.isArray(h.json.servers) && h.json.servers.length === 0 && h.json.manualEntry === false && h.json.localEntry === true, 'GET /api/lan-directory: empty list, manual entry off and local server on by default');
  h = await http('/api/lan-directory/test', { host: '127.0.0.1', port: FAKE });
  ok(h.json && !h.json.ok && h.json.error === 'private', 'loopback refused while "refuse private addresses" is on');
  h = await http('/admin/lan-directory?token=wrong');
  ok(h.status === 403, 'admin route needs the master token');
  h = await http('/admin/lan-directory', { token: TOKEN, action: 'settings', settings: { refusePrivate: false } });
  ok(h.status === 200 && h.json.settings.refusePrivate === false, 'admin turns private addresses on (self-hosted LAN case)');
  await new Promise((r2) => setTimeout(r2, 300));   // proto bundle loads asynchronously
  h = await http('/api/lan-directory/test', { host: '127.0.0.1', port: FAKE });
  ok(h.json && h.json.ok && h.json.pokerth && h.json.players === 7, 'POST test: the fake server answers as PokerTH (7 players)');
  h = await http('/api/lan-directory/propose', { name: 'Fake club', host: '127.0.0.1', port: FAKE, country: 'FR', lang: 'fr', resetPeriod: 'bogus' });
  ok(h.json && h.json.ok, 'POST propose: accepted');
  h = await http('/admin/lan-directory?token=' + TOKEN);
  ok(h.json && h.json.pending.length === 1 && h.json.pending[0].name === 'Fake club', 'admin sees the pending request');
  ok(h.json.pending[0].resetPeriod === 'monthly', 'an invalid reset period falls back to monthly');
  const id = h.json.pending[0].id;
  h = await http('/app-config');
  ok(h.json && h.json.lanDirectory && h.json.lanDirectory.servers.length === 0, '/app-config: nothing listed before approval');
  h = await http('/admin/lan-directory', { token: TOKEN, action: 'approve', id });
  ok(h.status === 200 && h.json.entries.length === 1, 'admin approves');
  h = await http('/app-config');
  ok(h.json && h.json.lanDirectory.servers.length === 1 && h.json.lanDirectory.servers[0].name === 'Fake club', '/app-config lists the approved server');
  const saved = JSON.parse(fs.readFileSync(path.join(tmp, 'admin-config.json'), 'utf8'));
  ok(saved.lanDirectory && saved.lanDirectory.entries.length === 1 && !JSON.stringify(saved).includes('127.0.0.1"' + ',"ip'), 'directory persisted in admin-config.json');
  h = await http('/api/lan-directory/propose', { host: '127.0.0.1', port: FAKE });
  ok(h.json && !h.json.ok && h.json.error === 'listed', 'proposing a listed server is refused');
  h = await http('/api/lan-directory', { x: 1 });
  ok(h.status === 405, 'GET-only list route');

  // ── per-server leaderboards (server/lan-boards.js) ──
  ok(h && (await http('/app-config')).json.lanDirectory.servers[0].resetPeriod === 'monthly', 'the public list carries the board period');
  h = await http('/stats', { name: 'bob', board: id, handsPlayed: 12, handsWon: 3, net: 40 });
  ok(h.status === 200 && h.json.ok, 'a player is recorded on the listed server board');
  h = await http('/stats?board=' + id);
  ok(h.json && h.json.bob && h.json.bob.handsPlayed === 12, 'GET /stats?board= returns that board');
  h = await http('/stats');
  ok(h.json && !h.json.bob, 'the historical board is untouched');
  h = await http('/stats', { name: 'zed', handsPlayed: 2 });
  h = await http('/stats?board=' + id);
  ok(h.json && !h.json.zed, 'and the historical board does not leak into it');
  h = await http('/stats', { name: 'bob', board: 'lan_ffffff99', handsPlayed: 1 });
  ok(h.status === 404, 'an unknown board is refused, never created');
  h = await http('/stats', { board: id, _resetAll: true });
  ok(h.status === 403, 'resetting a board needs the admin key');
  h = await http('/admin/lan-boards?token=' + TOKEN);
  ok(h.json && h.json.ok && h.json.boards.length === 1 && h.json.boards[0].players === 1 && h.json.defaultPlayers === 1, 'admin: board list with player counts');
  h = await http('/admin/lan-directory', { token: TOKEN, action: 'update', id, entry: { resetPeriod: 'weekly' } });
  ok(h.json && h.json.entries[0].resetPeriod === 'weekly', 'the admin changes the board period');
  h = await http('/stats', { board: id, _resetAll: true, token: TOKEN });
  ok(h.json && h.json.reset && !(await http('/stats?board=' + id)).json.bob, 'the admin resets that board only');
  // ── players per IP on a listed server (close 4430) ──
  h = await http('/admin/lan-directory', { token: TOKEN, action: 'update', id, entry: { maxPerIp: 1 } });
  ok(h.json && h.json.entries[0].maxPerIp === 1, 'the admin sets one player per IP on that server');
  const wsUrl = (sid) => 'ws://127.0.0.1:' + PROXY_PORT + '/?host=127.0.0.1&port=' + FAKE + '&tls=0&sid=' + sid + '&mode=lan&fresh=1&v=test';
  const openWs = (sid) => new Promise((res) => { const w = new WebSocket(wsUrl(sid)); let code = null; w.on('close', (c) => { code = c; }); w.on('error', () => {}); setTimeout(() => res({ w, code: () => code }), 900); });
  const w1 = await openWs('capsid-1');
  ok(w1.code() === null, 'first connection from this address goes through');
  const w2 = await openWs('capsid-2');
  ok(w2.code() === 4430, 'a second one is refused with 4430 (got ' + w2.code() + ')');
  w1.w.terminate(); w2.w.terminate();
  h = await http('/admin/lan-directory', { token: TOKEN, action: 'remove', id });
  await new Promise((r2) => setTimeout(r2, 100));
  const lb = JSON.parse(fs.readFileSync(path.join(tmp, 'lan-boards.json'), 'utf8'));
  ok(!(id in lb), 'removing the server drops its board');
} finally {
  proxy.kill('SIGTERM');
  fake.close(); junk.close();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
if (fails) console.log(plog.split('\n').slice(-30).join('\n'));
console.log('\n' + (fails ? fails + ' FAILED' : 'All ' + checks + ' checks passed'));
process.exit(fails ? 1 : 0);
