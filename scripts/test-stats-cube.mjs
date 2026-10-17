#!/usr/bin/env node
// Cross-tabulated session counts (server/cube-stats.js) — step 1: recording.
// Run: node scripts/test-stats-cube.mjs
//
// Unit checks of the key format, then a live proxy on a random port fed with
// real pings: each session start and each login must land as ONE key holding
// all its dimensions, nothing but closed values may be written, and robots
// go to their own mirror.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const C = require(path.join(root, 'server', 'cube-stats.js'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// ── Keys ──────────────────────────────────────────────────────────────────
ok(C.factKey('c', { mode: 'lan', cc: 'DE', dev: 'm', app: 'p', new: 'n', lan: 'lan_3f9a01' }) === 'c|lan|DE|m|p|n|lan_3f9a01', 'a connection is one key, every dimension in order');
ok(C.factKey('l', { acc: 'guest', cc: 'FR', dev: 'd', app: '-', new: 'r' }) === 'l|guest|FR|d|-|r', 'and so is a login');
ok(C.factKey('c', { mode: 'chess' }) === null && C.factKey('l', { acc: 'admin' }) === null && C.factKey('x', {}) === null, 'an unknown mode, account or type writes nothing');
ok(C.factKey('c', { mode: 'pokerthnet', cc: 'de|x', dev: 'tablet', app: 'yes', new: 'maybe', lan: 'lyon.example.org:7234' }) === 'c|pokerthnet|ZZ|d|-|-|-',
  'anything outside the closed sets falls back to a neutral value — no free text, no separator smuggled in');
ok(JSON.stringify(C.parse('c|lan|DE|m|p|n|other')) === JSON.stringify({ type: 'c', mode: 'lan', cc: 'DE', dev: 'm', app: 'p', new: 'n', lan: 'other' }), 'a key reads back');
ok(C.parse('c|lan|DE') === null && C.parse('*') === null, 'a truncated key or the overflow does not parse');
const b = {};
for (let i = 0; i < 5; i++) C.add(b, 'k' + i, 3);
C.add(b, 'k0', 3);
ok(b.fx.k0 === 2 && b.fx.k2 === 1 && b.fx['*'] === 2 && Object.keys(b.fx).length === 4, 'past the cap, new combinations go to the overflow; known ones keep counting');
const days = [{ fx: { 'c|lan|DE|m|-|n|lan_a1': 3, 'c|lan|FR|d|-|r|other': 2, 'c|pokerthnet|DE|d|p|r|-': 5, 'l|guest|DE|m|-|n': 4, '*': 7 } }, null, { fx: { 'c|lan|DE|d|-|r|lan_a1': 1 } }];
const q1 = C.query(days, 'c', { mode: ['lan'] }, 'cc');
ok(q1.total === 6 && q1.by.DE === 4 && q1.by.FR === 2, 'a filter keeps the matching facts, broken down by a dimension');
ok(q1.overflow === 7, 'the overflow is reported apart, never folded into a figure');
const q2 = C.query(days, 'c', { cc: ['DE'], dev: ['m', 'd'], lan: ['lan_a1'] }, 'dev');
ok(q2.total === 4 && q2.by.m === 3 && q2.by.d === 1, 'several filters combine, several values of one filter add up');
ok(C.query(days, 'l', { cc: ['DE'] }, 'acc').by.guest === 4, 'logins are read on their own');
ok(C.query(days, 'c', { acc: ['guest'] }, 'nope').total === 11 && !Object.keys(C.query(days, 'c', {}, 'nope').by).length, 'a filter or a breakdown on a dimension the type does not have is ignored');

// ── Live ──────────────────────────────────────────────────────────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stcube-'));
const F = (x) => path.join(tmp, x);
fs.writeFileSync(F('admin-config.json'), JSON.stringify({ lanDirectory: { settings: {}, pending: [], entries: [
  { id: 'lan_aaaaaa01', name: 'Club Lyon', host: 'lyon.example.org', port: 7234, visible: true, addedAt: Date.now() - 9e8 }] } }));
const PORT = 18000 + Math.floor(Math.random() * 900), TOKEN = 'stcube-token';
const env = Object.assign({}, process.env, {
  PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN,
  ADMIN_CONFIG_FILE: F('admin-config.json'), VISITS_FILE: F('visits.json'), STATS_FILE: F('stats.json'),
  STATS_META_FILE: F('stats.meta.json'), BROADCASTS_FILE: F('broadcasts.json'), POLLS_FILE: F('polls.json'),
  DB_CONFIG_FILE: F('db-config.json'), DEPLOY_HISTORY_FILE: F('deploy-history.json'),
  SCOPED_TOKENS_FILE: F('scoped-tokens.json'), AUDIT_FILE: F('admin-audit.json'), LAN_BOARDS_FILE: F('lan-boards.json'),
});
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env });
let plog = ''; proxy.stdout.on('data', (x) => { plog += x; }); proxy.stderr.on('data', (x) => { plog += x; });
const base = 'http://127.0.0.1:' + PORT, H = { Authorization: 'Bearer ' + TOKEN };
const PHONE = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
const DESK = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const BOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const ping = (body, ua) => fetch(base + '/__visit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': ua || DESK }, body: JSON.stringify(body) });
try {
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { up = (await fetch(base + '/admin')).ok; } catch (e) {} if (!up) await new Promise((r) => setTimeout(r, 250)); }
  ok(up, 'the proxy answers');
  await ping({ vid: 'dev-new', tz: 'Europe/Berlin' }, PHONE);                       // first visit today: a new device
  await ping({ mode: 'lan', vid: 'dev-new', tz: 'Europe/Berlin', pwa: true, srv: 'lyon.example.org:7234' }, PHONE);
  await ping({ mode: 'pokerthnet', vid: 'dev-unseen', tz: 'Europe/Paris' }, DESK);  // never counted as a visit
  await ping({ mode: 'lan', vid: 'dev-unseen', srv: 'home.example.net:7234' }, DESK);
  await ping({ login: 'auth', vid: 'dev-new', tz: 'Europe/Berlin', pwa: true }, PHONE);
  await ping({ mode: 'chess', vid: 'x', tz: 'Europe/Berlin' }, DESK);
  await ping({ login: 'admin', vid: 'x' }, DESK);
  await ping({ mode: 'offline', vid: 'bot1', tz: 'America/New_York' }, BOT);
  const exp = await (await fetch(base + '/admin/visits/export?format=json', { headers: H })).json();
  const st = exp.store || {}, dk = Object.keys(st.days || {}).sort().pop(), day = (st.days || {})[dk] || {};
  const fx = day.fx || {};
  ok(fx['c|lan|DE|m|p|n|lan_aaaaaa01'] === 1, 'a LAN game from a phone in Germany, in the installed app, by a device new today, on a listed server: one key');
  ok(fx['c|pokerthnet|FR|d|-|-|-'] === 1, 'a device never counted as a visit is neither new nor known');
  ok(fx['c|lan|ZZ|d|-|-|other'] === 1, 'no time zone → unknown country; an unlisted server → other');
  ok(fx['l|auth|DE|m|p|n'] === 1, 'a login carries the same dimensions, its account kind first');
  ok(Object.keys(fx).length === 4, 'an unknown mode or account writes nothing (' + Object.keys(fx).join(', ') + ')');
  ok(day.bt && day.bt.fx && day.bt.fx['c|offline|US|d|-|-|-'] === 1 && !fx['c|offline|US|d|-|-|-'], 'a robot lands in its own mirror');
  ok(st.cubeSince > 0, 'the store says since when it counts');
  const cell = Object.values(day.hc || {}).find((c) => c && c.fx);
  ok(cell && cell.fx['c|lan|DE|m|p|n|lan_aaaaaa01'] === 1, 'the hour cell counts it too (for the 24-hour view)');
  ok(!/home\.example\.net|lyon\.example\.org|Europe\/Berlin|dev-new/.test(JSON.stringify(fx) + JSON.stringify(cell && cell.fx)), 'no address, time zone or device id in the facts');
} finally {
  proxy.kill('SIGTERM');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}

// ── Client wiring ─────────────────────────────────────────────────────────
const pjs = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');
ok(/window\._pthIsApp = function \(\)/.test(pjs), 'the client knows when it runs as the installed app');
ok(/if \(window\._pthIsApp && window\._pthIsApp\(\)\) cm\.pwa = true;/.test(pjs), 'and says so with a session start');
ok(/var tz = window\._pthTimeZone\(\); if \(tz\) lg\.tz = tz;/.test(pjs) && /if \(window\._pthIsApp && window\._pthIsApp\(\)\) lg\.pwa = true;/.test(pjs), 'and with a login, time zone included');
const px = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
ok(/recordFact\('c', \{ mode: d\.mode, lan: d\.mode === 'lan' \? lanServerKey\(d\.srv\) : '-' \}, d, req, _bot\);/.test(px), 'the proxy files each session start');
ok(/recordLogin\(d\.login, _bot\); recordFact\('l', \{ acc: d\.login \}, d, req, _bot\);/.test(px), 'and each login');
const priv = fs.readFileSync(path.join(root, 'public', 'privacy.html'), 'utf8');
ok(/These totals may be combined/.test(priv), 'the privacy page says the totals are combined');

if (fail) console.log(plog.slice(-1500));
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
