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
  store.days[key(d)] = { v: 10, m: { pokerthnet: i + 1, lan: 2 }, bt: { v: 3, m: { pokerthnet: 100 } } };
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

const PORT = 18000 + Math.floor(Math.random() * 900), TOKEN = 'stworld-token';
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

  const empty = await get('/admin/visits?days=90');
  ok(empty.prevM.length === 90 && empty.prevM.slice(0, 60).every((x) => !Object.keys(x).length), 'days with nothing recorded are empty, not missing');
} finally {
  proxy.kill('SIGTERM');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
if (fail) console.log(plog.slice(-1500));
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
