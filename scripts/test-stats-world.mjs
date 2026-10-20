#!/usr/bin/env node
// Admin › Statistics › World: the figures behind the Internet and LAN cards
// and behind "Connections per day, by entry mode".
// Run: node scripts/test-stats-world.mjs
//
// Live: a proxy on a random port reads a seeded visit store, and the answer
// of /admin/visits is checked for the per-mode counts of each point (series
// m) and of the window just before (prevM), day by day and hour by hour.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { freePort } from './lib/free-port.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stworld-'));
const F = (x) => path.join(tmp, x);
const key = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
// Day i back carries i+1 Internet and 2 LAN connections; a robot's day of its own.
const store = { days: {} };
for (let i = 0; i < 20; i++) {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i);
  store.days[key(d)] = { v: 10, m: { pokerthnet: i + 1, lan: 2 }, geo: { DE: { v: 1 } }, bt: { v: 3, m: { pokerthnet: 100 } } };
}
// Hour cells: 1 Training connection in each of the last 48 hours.
const now = new Date();
for (let h = 0; h < 48; h++) {
  const d = new Date(now.getTime() - h * 3600000);
  const b = store.days[key(d)] || (store.days[key(d)] = { v: 0 });
  b.hc = b.hc || {};
  b.hc[d.getHours()] = { v: 1, m: { offline: 1 } };
}
fs.writeFileSync(F('visits.json'), JSON.stringify(store));
fs.writeFileSync(F('admin-config.json'), JSON.stringify({ lanDirectory: { settings: {}, pending: [], entries: [
  { id: 'lan_aaaaaa01', name: 'Club Lyon', host: 'lyon.example.org', port: 7234, visible: true, addedAt: Date.now() - 9e8 }] } }));

const PORT = await freePort(), TOKEN = 'stworld-token';
const env = Object.assign({}, process.env, {
  PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN,
  ADMIN_CONFIG_FILE: F('admin-config.json'), VISITS_FILE: F('visits.json'), STATS_FILE: F('stats.json'),
  STATS_META_FILE: F('stats.meta.json'), BROADCASTS_FILE: F('broadcasts.json'), POLLS_FILE: F('polls.json'),
  DB_CONFIG_FILE: F('db-config.json'), DEPLOY_HISTORY_FILE: F('deploy-history.json'),
  SCOPED_TOKENS_FILE: F('scoped-tokens.json'), AUDIT_FILE: F('admin-audit.json'), LAN_BOARDS_FILE: F('lan-boards.json'),
});
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env });
let plog = ''; proxy.stdout.on('data', (b) => { plog += b; }); proxy.stderr.on('data', (b) => { plog += b; });
const base = 'http://127.0.0.1:' + PORT, H = { Authorization: 'Bearer ' + TOKEN };
async function get(p) { const r = await fetch(base + p, { headers: H }); return r.json(); }
try {
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { up = (await fetch(base + '/admin')).ok; } catch (e) {} if (!up) await new Promise((r) => setTimeout(r, 250)); }
  ok(up, 'the proxy answers');

  const d7 = await get('/admin/visits?days=7');
  ok(d7.ok && d7.series.length === 7 && Array.isArray(d7.prevM) && d7.prevM.length === 7, 'seven days, and seven days before them');
  ok(d7.series.map((x) => x.m && x.m.pokerthnet).join() === '7,6,5,4,3,2,1', 'each day carries its own counts by mode, oldest first');
  ok(d7.prevM.map((x) => x.pokerthnet).join() === '14,13,12,11,10,9,8', 'the window before lines up point for point');
  ok(d7.prevM.every((x) => x.lan === 2), 'every mode is there');
  const b7 = await get('/admin/visits?days=7&bots=1');
  ok(b7.series[6].m.pokerthnet === 101 && b7.prevM[6].pokerthnet === 108, 'robots join both windows when shown');

  const h24 = await get('/admin/visits?hours=24');
  ok(h24.series.length === 24 && h24.prevM.length === 24, 'over 24 h: one point an hour, and the 24 hours before');
  ok(h24.series.every((x) => x.m && x.m.offline === 1) && h24.prevM.every((x) => x.offline === 1), 'hour cells carry their counts by mode too');

  // ── A custom range (web.121): P days ending E days back ──
  const back = (i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i); return key(d); };
  const r = await get('/admin/visits?from=' + back(10) + '&to=' + back(4));
  ok(r.ok && r.range && r.range.from === back(10) && r.range.to === back(4) && r.periodDays === 7 && r.periodEnd === 4, 'a range reads as seven days ending four days back');
  ok(r.series.map((x) => x.date).join() === [10, 9, 8, 7, 6, 5, 4].map(back).join(), 'the series covers exactly its days');
  ok(r.series.map((x) => x.m.pokerthnet).join() === '11,10,9,8,7,6,5' && r.prevM.map((x) => x.pokerthnet).join() === '18,17,16,15,14,13,12', 'and the comparison the seven days before it');
  ok(r.period.v === 70 && r.prev.period.v === 70, 'the period tile and its reference are the range and the range before');
  ok(r.full.period.cur.v === 70, 'a past range is complete: its own days are the like-for-like ones');
  ok(r.bots.period.v === 21, 'robots taken out are counted over the range too');
  ok(typeof r.tz === 'string', 'the server says in which zone its days are');
  const rv = await get('/admin/visits?from=' + back(4) + '&to=' + back(10));
  ok(rv.range && rv.range.from === back(10) && rv.periodDays === 7, 'reversed dates are put back in order');
  const fut = await get('/admin/visits?from=' + back(2) + '&to=' + back(-5));
  ok(fut.range && fut.range.to === back(0) && fut.periodDays === 3 && fut.periodEnd === 0, 'an end in the future stops at today');
  const bad = await get('/admin/visits?days=7&from=2026-02-31&to=' + back(0));
  ok(!bad.range && bad.periodDays === 7, 'a date that does not exist falls back to the preset');
  const old = await get('/admin/visits?from=2000-01-01&to=' + back(0));
  ok(old.range && old.periodDays === 366, 'a range is a year at most');
  const g = await get('/admin/geo?from=' + back(10) + '&to=' + back(4));
  ok(g.ok && g.counted === 7 && g.countries.DE && g.countries.DE.v === 7 && g.range && g.range.to === back(4), 'the map reads the same range');
  const h = await get('/admin/visits?hours=24&from=' + back(10) + '&to=' + back(4));
  ok(!h.range && h.series.length === 24, '24 hours ignores a range');

  // ── Live now: a country per open connection (web.122) ──
  const { default: WS } = await import(path.join(root, 'node_modules', 'ws', 'index.js'));
  const open = (q) => new Promise((res, rej) => { const w = new WS('ws://127.0.0.1:' + PORT + '/?notify=1' + q); w.on('open', () => res(w)); w.on('error', rej); });
  const w1 = await open('&mode=offline&tz=' + encodeURIComponent('Europe/Berlin'));
  const w2 = await open('&mode=pthnet&live=1&tz=' + encodeURIComponent('Not/AZone'));
  const w3 = await open('&mode=pthnet');
  await new Promise((r) => setTimeout(r, 200));
  const se = await get('/admin/sessions');
  const ccs = (se.notify || []).map((c) => c.mode + ':' + (c.live ? 'live:' : '') + c.cc).sort().join();
  ok(ccs === 'offline:DE,pthnet:,pthnet:live:ZZ', 'each open connection carries the country of its time zone (' + ccs + ')');
  ok(!JSON.stringify(se).includes('Europe/Berlin'), 'the time zone itself is never handed out, only the country');
  [w1, w2, w3].forEach((w) => w.close());

  // ── Connections per LAN server, logins by kind (web.123) ──
  const ping = (b, ua) => fetch(base + '/__visit', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, ua ? { 'User-Agent': ua } : {}), body: JSON.stringify(b) });
  await ping({ mode: 'lan', vid: 'v1', srv: 'lyon.example.org:7234' });
  await ping({ mode: 'lan', vid: 'v2', srv: 'LYON.example.org:7234' });
  await ping({ mode: 'lan', vid: 'v3', srv: 'secret-home.example.net:7234' });
  await ping({ mode: 'lan', vid: 'v4', srv: 'nonsense' });
  await ping({ mode: 'pokerthnet', vid: 'v5', srv: 'pthsrv.pokerth.net:7236' });
  await ping({ login: 'guest', vid: 'v1' }); await ping({ login: 'guest', vid: 'v2' }); await ping({ login: 'auth', vid: 'v3' });
  await ping({ login: 'admin', vid: 'v4' });
  await ping({ login: 'guest', vid: 'v6' }, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
  const c1 = await get('/admin/visits?days=7');
  ok(c1.lanServers && c1.lanServers.period.lan_aaaaaa01 === 2, 'a game on a listed LAN server counts under its entry, whatever the case of the host');
  ok(c1.lanServers.period.other === 2 && Object.keys(c1.lanServers.period).length === 2, 'an unlisted or unreadable address counts as other, and nothing else is kept');
  ok(c1.lanServers.names.lan_aaaaaa01 === 'Club Lyon' && c1.lanServers.since > 0, 'the answer names the entries and says since when it counts');
  ok(c1.logins && c1.logins.period.g === 2 && c1.logins.period.a === 1 && c1.logins.since > 0, 'logins are counted by kind, an unknown kind and a robot left out');
  const c2 = await get('/admin/visits?days=7&bots=1');
  ok(c2.logins.period.g === 3, 'the robot is counted apart, and joins when robots are shown');
  ok(c1.series[6].lo && c1.series[6].lo.g === 2, 'today\'s point carries its logins');
  const exp = await (await fetch(base + '/admin/visits/export?format=json', { headers: H })).text();
  ok(!/secret-home|lyon\.example\.org|nonsense/.test(exp), 'no server address is ever stored');

  const empty = await get('/admin/visits?days=90');
  ok(empty.prevM.length === 90 && empty.prevM.slice(0, 60).every((x) => !Object.keys(x).length), 'days with nothing recorded are empty, not missing');
} finally {
  proxy.kill('SIGTERM');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
const pjs = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');
const lob = fs.readFileSync(path.join(root, 'public', 'modules', 'net', 'msg-lobby.mjs'), 'utf8');
ok(/window\._pthCountConnect\(_cntMode\(\), host \+ ':' \+ port\)/.test(pjs) && /if \(srv\) cm\.srv = srv;/.test(pjs), 'the client sends the LAN server with the mode ping');
ok(/var k = 'pth_conn_' \+ mode \+ \(srv \? '@' \+ srv : ''\);/.test(pjs), 'once per server and browser session');
ok(/window\._pthCountLogin = function \(kind\)/.test(pjs) && /if \(window\.LIVE_MODE \|\| \(kind !== 'guest' && kind !== 'auth'\)\) return;/.test(pjs), 'a login ping, players only');
ok(/localStorage\.getItem\('pth_no_count'\) === '1'\) return; \} catch \(e\) \{\}\s*var k = 'pth_login_' \+ kind;/.test(pjs), 'which honours « do not count me »');
ok(/window\._pthCountLogin && window\._pthCountLogin\(_lm\)/.test(lob), 'sent when the server confirms the login');
const priv = fs.readFileSync(path.join(root, 'public', 'privacy.html'), 'utf8');
ok(/as a guest or with an account is counted, as a total per day/.test(priv) && /never by its address/.test(priv), 'the privacy page says what is counted');
if (fail) console.log(plog.slice(-1500));
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
