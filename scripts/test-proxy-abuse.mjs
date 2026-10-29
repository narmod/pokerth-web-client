#!/usr/bin/env node
// Audit of 2026-10-29 (web.342) — abuse and robustness of the proxy:
//   · LAN directory: private addresses in every IPv6 spelling; proposals count
//     toward the hourly probe budget;
//   · relay cache bounded at insert, not only every 10 min;
//   · « Accept-Language: constructor » stored as text in the language counters;
//   · lan-boards.json / admin-config.json written atomically (0600 for the
//     latter), a file that does not parse kept aside instead of overwritten;
//   · REACT relay only from a session the server accepted, under its own id;
//   · public beacons and the log-analysis relay limited per address;
//   · /api/player refuses a nickname past 64 characters.
// Run: node scripts/test-proxy-abuse.mjs   (~8 s)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { freePort, waitForServer } from './lib/free-port.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const WebSocket = require('ws');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pxabuse-'));
const F = (x) => path.join(tmp, x);

// ── units ──
const { isPrivateAddress } = require('../server/lan-directory.js');
for (const a of ['127.0.0.1', '::1', '0:0:0:0:0:0:0:1', '0000::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:a00:5', '::ffff:c0a8:1', '::7f00:1', '2002:7f00:1::', '2001::1', '100::1', 'fe80::1', 'fd00::1', '10.1.2.3', 'not-an-ip'])
  ok(isPrivateAddress(a) === true, 'private: ' + a);
for (const a of ['8.8.8.8', '::ffff:808:808', '2a00:1450:4007::1', '1.1.1.1'])
  ok(isPrivateAddress(a) === false, 'public: ' + a);

const { createRelayCache } = require('../server/relay-cache.js');
const rc = createRelayCache({ max: 50 });
for (let i = 0; i < 300; i++) await rc.get('k' + i, 60000, () => ({ status: 200, body: 'x' }));
for (let i = 0; i < 300; i++) await rc.get('f' + i, 60000, () => ({ status: 404, body: 'no' }));
ok(rc.cache.size <= 50 && rc.fails.size <= 50, 'relay cache: bounded at insert (' + rc.cache.size + ' / ' + rc.fails.size + ')');
ok(rc.cache.has('k299') && !rc.cache.has('k0'), 'relay cache: the oldest entries go first');

const LS = require('../server/lang-stats.js');
const dst = {};
for (let i = 0; i < 3; i++) LS.record(dst, { lang: 'other', raw: 'constructor' }, { isBot: false, seenBefore: false });
ok(dst.otherRaw && dst.otherRaw.constructor === 3 && typeof dst.otherRaw.hasOwnProperty === 'function', 'language counters: « constructor » counted as a number');

const { createLanBoards } = require('../server/lan-boards.js');
fs.writeFileSync(F('lb.json'), '{"broken');
const lb = createLanBoards({ file: F('lb.json'), sanitize: (d) => d, merge: (a, b) => Object.assign({}, a, b), periodKey: () => null, entries: () => [{ id: 'lan_abc123', resetPeriod: 'off' }] });
ok(fs.readdirSync(tmp).some((f) => /^lb\.json\.corrupt-/.test(f)), 'lan-boards: an unreadable file is kept aside');
lb.upsert('lan_abc123', 'Alice', { handsPlayed: 1 });
await sleep(1000);
ok(JSON.parse(fs.readFileSync(F('lb.json'), 'utf8')).lan_abc123 !== undefined && !fs.existsSync(F('lb.json.tmp')), 'lan-boards: written through a temp file, valid JSON');

// ── the proxy ──
const UP = await freePort();
const upSocks = [];
const up = net.createServer((s) => { upSocks.push(s); s.on('error', () => {}); });
await new Promise((r) => up.listen(UP, '127.0.0.1', r));
fs.writeFileSync(F('cfg.json'), JSON.stringify({ proxyCfg: { connGapMs: 0 } }));
const TOK = 'abuse-token-0123456789', PORT = await freePort();
const env = Object.assign({}, process.env, { PORT: String(PORT), STATS_ADMIN_TOKEN: TOK, ADMIN_ENABLED: '1', ALLOWED_HOSTS: '127.0.0.1', ALLOWED_PORTS: String(UP),
  RATE_LIMIT_DISABLED: '1', ADMIN_CONFIG_FILE: F('cfg.json'), PREFS_DIR: F('prefs'), DB_CONFIG_FILE: F('db.json'), NO_PROXY: '*' });
for (const k of ['STATS_FILE', 'STATS_META_FILE', 'AUDIT_FILE', 'VISITS_FILE', 'BROADCASTS_FILE', 'POLLS_FILE', 'SCOPED_TOKENS_FILE', 'DEPLOY_HISTORY_FILE', 'LAN_BOARDS_FILE']) env[k] = F(k.toLowerCase() + '.json');
const child = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, env, stdio: 'ignore' });
const base = 'http://127.0.0.1:' + PORT;
const conn = (qs) => new Promise((res) => { const w = new WebSocket('ws://127.0.0.1:' + PORT + '/?host=127.0.0.1&port=' + UP + '&tls=0' + (qs || '')); w.on('error', () => res(null)); w.on('open', () => res(w)); });
// InitAck (messageType 6, field 7 { playerId (2) = pid }), length-prefixed.
const initAck = (pid) => { const inner = Buffer.from([0x10, pid]); const body = Buffer.concat([Buffer.from([0x08, 0x06, 0x3a, inner.length]), inner]); const h = Buffer.alloc(4); h.writeUInt32BE(body.length); return Buffer.concat([h, body]); };

try {
  await waitForServer(base, child);
  ok(true, 'the proxy starts');

  // admin-config.json: 0600 after a save
  await fetch(base + '/admin/config', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOK }, body: JSON.stringify({ welcome: { enabled: false } }) });
  await sleep(200);
  ok((fs.statSync(F('cfg.json')).mode & 0o777) === 0o600 && !fs.existsSync(F('cfg.json.tmp')), 'admin-config.json: saved 0600 through a temp file');

  // REACT
  const victim = await conn('&sid=v1');
  await sleep(300);
  const got = [];
  victim.on('message', (d, b) => { if (!b) got.push(String(d)); });
  const att = await conn('&sid=a1');
  await sleep(300);
  att.send('REACT:4242:😂');
  await sleep(300);
  ok(got.length === 0, 'REACT before the server accepted the session: not relayed');
  upSocks[upSocks.length - 1].write(initAck(42));
  await sleep(300);
  att.send('REACT:4242:😂');
  att.send('REACT:4242:' + 'SPOOF '.repeat(200));
  await sleep(300);
  ok(got.length === 1 && got[0] === 'REACT:42:😂', 'REACT after InitAck: relayed under the session\'s own id (' + JSON.stringify(got) + ')');
  victim.close(); att.close();

  // beacons: past 600 per 10 min, /__guide answers 204 without counting
  const codes = [];
  for (let i = 0; i < 620; i += 20) {
    const batch = await Promise.all(Array.from({ length: 20 }, () => fetch(base + '/__guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"ctx":"nope","ev":"nope"}' }).then((r) => r.status)));
    codes.push(...batch);
  }
  ok(codes.slice(0, 600).every((c) => c === 400) && codes.slice(600).every((c) => c === 204), 'beacons: 600 counted per 10 min and address, the rest dropped');

  // pdb-analyse: 10 per hour and address
  const pc = [];
  for (let i = 0; i < 12; i++) pc.push((await fetch(base + '/pdb-analyse', { method: 'POST', body: 'not a pdb file at all' })).status);
  ok(pc.slice(0, 10).every((c) => c === 400) && pc.slice(10).every((c) => c === 429), 'log analysis: 10 per hour and address (' + pc.join(',') + ')');

  // /api/player: nick bounded
  const pl = await fetch(base + '/api/player?src=pokerth&nick=' + 'a'.repeat(65));
  ok(pl.status === 400, '/api/player: a 65-character nickname is refused');

  // a 20 KB User-Agent is accepted and does not stall anything
  const t0 = Date.now();
  const v = await fetch(base + '/__visit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (iPhone' + ' iPhone'.repeat(2000) }, body: '{"vid":"x1"}' });
  ok(v.status === 204 && Date.now() - t0 < 1000, 'a 14 KB User-Agent: answered quickly');
} finally {
  await new Promise((r) => { child.once('exit', r); child.kill(); setTimeout(r, 3000); });
  up.close(); upSocks.forEach((s) => s.destroy());
  try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5 }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
