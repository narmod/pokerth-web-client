#!/usr/bin/env node
// « Hide bots » in the admin Traffic tab: pings from detected automation (a
// robot user-agent, or navigator.webdriver sent as `wd`) are counted apart in
// `bt` (day bucket, hourly cell, all-time store), never dropped. The real
// proxy is spawned on a scratch visits file: summaries without bots=1 show the
// humans only, with bots=1 both added, and the hidden counts are reported.
// Also checks the client flag, the admin toggle and the World country card.
// Run: node scripts/test-traffic-bots.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { freePort } from './lib/free-port.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

const VISITS = path.join(os.tmpdir(), 'pth-bots-' + process.pid + '.json');
try { fs.unlinkSync(VISITS); } catch (e) {}
const PORT = await freePort();
const TOKEN = 'bots-' + process.pid;
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
  env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, STATS_ADMIN_TOKEN: TOKEN }),
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const HUMAN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const HEADLESS = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/129.0 Safari/537.36';
const post = (url, body, ua) => fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': ua || HUMAN, 'Accept-Language': 'fr-FR' }, body: JSON.stringify(body) }).then((r) => r.status).catch(() => 0);
const get = (u) => fetch(base + u + (u.indexOf('?') < 0 ? '?' : '&') + 'token=' + TOKEN).then((r) => r.json()).catch(() => null);
let up = false;
for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await fetch(base + '/admin/visits?token=' + TOKEN).then((r) => r.status).catch(() => 0)) === 200; }
try {
  ok(up, 'proxy up');
  // Humans: 2 visits from 2 devices in France, one Internet session, one Ace event.
  await post('/__visit', { vid: 'h1', tz: 'Europe/Paris' });
  await post('/__visit', { vid: 'h2', tz: 'Europe/Paris' });
  await post('/__visit', { mode: 'pokerthnet', vid: 'h1', tz: 'Europe/Paris' });
  await post('/__guide', { ctx: 'offer', ev: 'offered' });
  // Bots: a headless browser (UA) in Austria, a webdriver-driven « real » Chrome, a /live crawler, a guide event.
  for (let i = 0; i < 3; i++) await post('/__visit', { vid: 'b' + i, tz: 'Europe/Vienna' }, HEADLESS);
  await post('/__visit', { vid: 'w1', tz: 'Europe/Vienna', wd: true });
  await post('/__visit', { mode: 'offline', vid: 'w1', tz: 'Europe/Vienna', wd: true });
  await post('/__visit', { vid: 'L1', live: true }, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
  await post('/__guide', { ctx: 'offer', ev: 'offered', wd: true });

  const H = await get('/admin/visits?days=7');
  ok(H && H.ok && H.today.v === 2 && H.today.u === 2 && H.today.lv === 0, 'default: humans only (2 visits, 2 devices, no /live bot)');
  ok(H.today.m.pokerthnet === 1 && !H.today.m.offline, 'default: the driven browser\'s session is left out');
  ok(H.allTime.v === 2 && H.allTime.u === 2, 'default: all-time totals are the humans\'');
  ok(H.envPeriod.lang.fr === 2 && (H.envPeriod.os.Linux || 0) === 0, 'default: « Who visits » leaves the bots out');
  ok(H.guidePeriod.summary.acceptance.offered === 1 && H.guide.acceptance.offered === 1, 'default: Ace\'s Help counts the human offer only');
  ok(H.bots && H.bots.shown === false && H.bots.period.v === 4 && H.bots.period.lv === 1 && H.bots.period.m.offline === 1 && H.bots.since > 0, 'the summary says what was hidden (4 visits, 1 /live, 1 session)');
  ok(H.pings && H.pings.bots === 4, 'ping counter: 4 bot visits received');

  const A = await get('/admin/visits?days=7&bots=1');
  ok(A && A.today.v === 6 && A.today.u === 6 && A.today.lv === 1 && A.today.m.offline === 1, 'bots=1: humans and bots added');
  ok(A.allTime.v === 6 && A.allTime.u === 6 && A.allTime.lv === 1 && A.allTime.m.offline === 1, 'bots=1: all-time totals too');
  ok(A.envPeriod.os.Linux === 3 && A.guide.acceptance.offered === 2, 'bots=1: environment and Ace\'s Help too');
  ok(A.bots.shown === true && A.bots.period.v === 4, 'and still reports the bot share');

  const H24 = await get('/admin/visits?hours=24');
  const A24 = await get('/admin/visits?hours=24&bots=1');
  ok(H24.period.v === 2 && A24.period.v === 6 && H24.bots.period.v === 4, 'the last 24 hours follow the filter (hour cells)');

  const G = await get('/admin/geo?days=7');
  const GA = await get('/admin/geo?days=7&bots=1');
  ok(G && G.bots === false && G.countries.FR.v === 2 && !G.countries.AT, 'world map, default: Austria\'s bots are gone');
  ok(G.botCountries.AT && G.botCountries.AT.v === 4 && G.botCountries.AT.m.offline === 1, 'and the hidden visits are given per country');
  ok(GA.bots === true && GA.countries.AT.v === 4 && GA.countries.FR.v === 2, 'bots=1: Austria is back');

  await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
  const v = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
  const day = Object.values(v.days)[0];
  ok(day.v === 2 && day.bt && day.bt.v === 4 && Object.keys(day.bt.ids).length === 4 && day.bt.lv === 1, 'stored apart in the day bucket (bt)');
  ok(Object.values(day.hc)[0].bt && Object.values(day.hc)[0].bt.v === 4, 'and in the hourly cell');
  ok(v.totalV === 2 && Object.keys(v.allU).length === 2 && v.bt.totalV === 4 && Object.keys(v.bt.allU).length === 4, 'all-time: humans and bots in separate sets, so cohorts never see a bot');
} finally {
  proxy.kill('SIGTERM');
  if (!up) console.log(plog.slice(-2000));
  try { fs.unlinkSync(VISITS); } catch (e) {}
}

// ── client flag ──
const js = fs.readFileSync(path.join(root, 'public/pokerth.js'), 'utf8');
ok(/window\._pthAutomated = function \(\) \{\s*try \{ return navigator\.webdriver === true; \}/.test(js), 'client reads navigator.webdriver');
ok(/msg\.wd = true/.test(js) && /cm\.wd = true/.test(js), 'and flags the visit and the mode pings');
ok(/wd: true/.test(fs.readFileSync(path.join(root, 'public/modules/guide/beacons.mjs'), 'utf8')) && /m\.wd = true/.test(fs.readFileSync(path.join(root, 'public/modules/music.mjs'), 'utf8')), 'Ace\'s Help and music beacons too');

// ── admin wiring ──
const admin = fs.readFileSync(path.join(root, 'public/admin.html'), 'utf8');
ok(/<button id="trafBots" class="use" aria-pressed="true"[^>]*>Hide bots<\/button>/.test(admin), 'the Traffic header has the toggle, on by default');
ok(/_trafBots=localStorage\.getItem\('pth_admin_bots'\)==='1'/.test(admin) && /\+\(_trafBots\?'&bots=1':''\)/.test(admin), 'remembered per browser, sent as bots=1 when off (Traffic and World)');
ok(/function _geoLooksBot\(c\)\{ var v=\(c&&c\.v\)\|\|0; return v>=5 && \(c\.nw\|\|0\)===v && !_geoSess\(c\); \}/.test(admin), 'a country that still looks automated is spotted (5+ visits, all new, no game)');
ok(/class="geobot"/.test(admin) && /class="geowarn"/.test(admin) && /sessions per 100 visits/.test(admin), 'tagged in the list, explained in the card');
ok(/bot visit'\+\(hid>1\?'s':''\)\+' hidden/.test(admin), '« Who visits » says how many were hidden instead of a 0 % noise estimate');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
