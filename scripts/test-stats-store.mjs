#!/usr/bin/env node
// What the proxy stores for the Traffic and Errors tabs.
// Run: node scripts/test-stats-store.mjs
//
//  - one rule tells robots from people, and CUBOT phones are people;
//  - a robot's browser and language go to the robots' totals, not the people's;
//  - "All time" devices are counted by a counter that never shrinks, while the
//    day buckets go by date after 400 days;
//  - an error stays one group when a deployment moves its line or bumps ?v=.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const proxySrc = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function fn(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(head, j + 1); }
  }
  return '';
}

// ── One bot rule ──────────────────────────────────────────────────────────
const { isBotUA } = require(path.join(root, 'server', 'ua-bot.js'));
const CUBOT = 'Mozilla/5.0 (Linux; Android 12; CUBOT P80 Build/SP1A.210812.016) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
ok(!isBotUA(CUBOT), 'a CUBOT phone is a player');
ok(!isBotUA('Mozilla/5.0 (Linux; Android 11; CUBOT_X30) AppleWebKit/537.36 Chrome/119.0 Mobile Safari/537.36'), 'whatever the model is called');
ok(!isBotUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'), 'an iPhone is a player');
for (const ua of ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Mozilla/5.0 (compatible; bingbot/2.0)',
  'curl/8.4.0', 'python-requests/2.31', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/120.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11) Chrome/120 Mobile Safari/537.36 Chrome-Lighthouse', 'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)']) {
  ok(isBotUA(ua), 'robot: ' + ua.slice(0, 60));
}
ok(/UA_BOT_RULE\.isBotUA\(ua\) \|\| !!\(d && d\.wd === true\)/.test(proxySrc) && !/^const UA_BOT = /m.test(proxySrc), 'the proxy counts with that rule, and has no second one');
ok(/bots: Object\.keys\(g\.uas\)\.filter\(UA_BOT_RULE\.isBotUA\)\.length/.test(proxySrc), 'the Errors list gets the same classification from the proxy');

// ── Error groups ──────────────────────────────────────────────────────────
const ctx = {}; vm.createContext(ctx); vm.runInContext(fn(proxySrc, '_errSig'), ctx);
const sig = (stack) => vm.runInContext('_errSig(' + JSON.stringify({ msg: 'x is undefined', stack: stack }) + ')', ctx);
const a = sig('TypeError: x is undefined\n    at renderSeats (https://webclient.pokerth.net/pokerth.js?v=2.1.10-web.114:4512:17)');
const b = sig('TypeError: x is undefined\n    at renderSeats (https://webclient.pokerth.net/pokerth.js?v=2.1.10-web.115:4530:9)');
const c = sig('TypeError: x is undefined\n    at renderLobby (https://webclient.pokerth.net/pokerth.js?v=2.1.10-web.115:900:3)');
ok(a === b, 'the same error after a deployment (new line, new ?v=) stays one group');
ok(a !== c, 'a different function is a different group');
ok(/ipsMore/.test(fn(proxySrc, '_errRecord')) && /500\)\) g\.ipsMore = true/.test(fn(proxySrc, '_errRecord')), 'IPs are counted up to 500 and the cap is said, not silently 12');
ok(/since: _pingStats\.boot/.test(fn(proxySrc, '_errSnapshot')), 'the list says since when it counts');

// ── Retention by date ─────────────────────────────────────────────────────
const pr = { visitsStore: { days: {} }, pruned: 0, VISIT_RETENTION_DAYS: 400 };
vm.createContext(pr);
vm.runInContext(fn(proxySrc, 'visitDayKey') + '\n' + fn(proxySrc, 'pruneVisitDays') + '\nfunction pruneVisitIds(){ pruned++; }', pr);
pr.visitsStore.days = { '2025-01-01': {}, '2025-06-01': {}, '2026-10-17': {} };   // three buckets, gaps between them
vm.runInContext('pruneVisitDays(new Date(2026, 9, 17, 12).getTime())', pr);
ok(!pr.visitsStore.days['2025-01-01'] && !pr.visitsStore.days['2025-06-01'] && pr.visitsStore.days['2026-10-17'], 'buckets older than 400 days go, however few buckets there are');
ok(pr.pruned === 1, 'and the device lists are pruned with them');

// ── Live: robots apart, devices ever seen ─────────────────────────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statsstore-'));
const F = (x) => path.join(tmp, x);
fs.writeFileSync(F('visits.json'), JSON.stringify({ days: {}, totalV: 5, allU: { aaaaaaaaaaaaaaaa: 20000, bbbbbbbbbbbbbbbb: 20000 }, totalRet: 0 }));
const PORT = 18000 + Math.floor(Math.random() * 900), TOKEN = 'statsstore-token';
const env = Object.assign({}, process.env, { PORT: String(PORT), ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN,
  VISITS_FILE: F('visits.json'), ADMIN_CONFIG_FILE: F('admin-config.json'), STATS_FILE: F('stats.json'), STATS_META_FILE: F('stats.meta.json'),
  DEPLOY_HISTORY_FILE: F('dh.json'), AUDIT_FILE: F('audit.json'), BROADCASTS_FILE: F('bc.json'), POLLS_FILE: F('polls.json') });
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js'), '--notls'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env });
let plog = ''; proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const H = { Authorization: 'Bearer ' + TOKEN };
const visit = (body, ua) => fetch(base + '/__visit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': ua, 'Accept-Language': 'de-DE' }, body: JSON.stringify(body) }).then(r => r.status).catch(() => 0);
const summary = (q) => fetch(base + '/admin/visits?days=7' + (q || ''), { headers: H }).then(r => r.json()).catch(() => null);
let up = false;
for (let i = 0; i < 80 && !up; i++) { await new Promise(r => setTimeout(r, 150)); up = !!((await summary()) || {}).ok; }
try {
  ok(up, 'proxy up');
  const before = await summary();
  ok(before.allTime.u === 2, 'a store written before the counter starts from the devices it holds');
  await visit({ vid: 'cubot-player', tz: 'Europe/Berlin' }, CUBOT);
  await visit({ vid: 'crawler', tz: 'Europe/Berlin' }, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
  await new Promise(r => setTimeout(r, 300));
  const s1 = await summary(), s2 = await summary('&bots=1');
  ok(s1.allTime.u === 3, 'the CUBOT player is counted among people');
  ok(s2.allTime.u === 4, 'the crawler only with the robots shown');
  const osHuman = (s1.env && s1.env.os) || {}, osAll = (s2.env && s2.env.os) || {};
  const sum = (o) => Object.values(o).reduce((x, y) => x + (typeof y === 'number' ? y : 0), 0);
  ok(sum(osHuman) === 1 && sum(osAll) === 2, 'a robot\'s system goes to the robots\' running totals, not the people\'s');
} finally {
  proxy.kill('SIGTERM');
  if (fail) console.error(plog.slice(-1500));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
