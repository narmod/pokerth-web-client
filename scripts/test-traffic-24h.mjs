#!/usr/bin/env node
// « Last 24 hours » in the admin Traffic tab: the hourly cells of proxy.js
// (visitCell, hc[h] in the day bucket, same fields as a day), the sliding 24 h
// summary of /admin/visits?hours=24 (real proxy, scratch visits file), the
// pruning of cells older than three days, and the admin wiring (option, query,
// hour labels, no all-time fallback, cohorts hidden).
// Run: node scripts/test-traffic-24h.mjs
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
const dayKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

// A stale cell five days back, and a 2.1.10-web.28 geoH: both must go.
const VISITS = path.join(os.tmpdir(), 'pth-24h-' + process.pid + '.json');
const old = new Date(); old.setDate(old.getDate() - 5);
fs.writeFileSync(VISITS, JSON.stringify({ days: { [dayKey(old)]: { v: 3, ids: {}, hc: { 4: { v: 3 } }, geoH: { 4: {} } } }, totalV: 3, allU: {} }));
const PORT = await freePort();
const TOKEN = 't24-' + process.pid;
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
  env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, STATS_ADMIN_TOKEN: TOKEN }),
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const post = (url, body, hdr) => fetch(base + url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr || {}), body: JSON.stringify(body) }).then((r) => r.status).catch(() => 0);
const get = (q) => fetch(base + '/admin/visits?token=' + TOKEN + '&' + q).then((r) => r.json()).catch(() => null);
let up = false;
for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await fetch(base + '/admin/visits?token=' + TOKEN).then((r) => r.status).catch(() => 0)) === 200; }
try {
  ok(up, 'proxy up');
  const FR = { 'Accept-Language': 'fr-FR,fr;q=0.9', 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1' };
  await post('/__visit', { vid: 'a', tz: 'Europe/Paris', ref: 'forum.pokerth.net' }, FR);
  await post('/__visit', { vid: 'a', tz: 'Europe/Paris' }, FR);
  await post('/__visit', { vid: 'b', tz: 'Europe/Berlin' }, { 'Accept-Language': 'de-DE' });
  await post('/__visit', { mode: 'pokerthnet', vid: 'a', tz: 'Europe/Paris' });
  await post('/__visit', { mode: 'offline', vid: 'b', tz: 'Europe/Berlin' });
  await post('/__visit', { vid: 'L1', live: true });
  await post('/__guide', { ctx: 'offer', ev: 'offered' });
  const h = await get('hours=24');
  ok(h && h.ok && h.h24 === true && h.periodDays === 1 && h.periodHours === 1, '24 h summary: one hourly cell so far');
  ok(h.series.length === 24 && /T\d\d$/.test(h.series[23].date) && h.series[23].v === 3 && h.series[23].u === 2 && h.series[0].v === 0, 'series: 24 hourly points, the last is the hour in progress');
  ok(h.period.v === 3 && h.period.u === 2 && h.period.nw === 2 && h.period.rt === 1, 'window: visits, unique, new, returning');
  ok(h.period.m.pokerthnet === 1 && h.period.m.offline === 1 && h.period.lv === 1 && h.period.lu === 1, 'window: sessions per mode and /live');
  ok(h.prev.period.v === 0 && h.prev.period.u === 0, 'previous 24 hours: empty, nothing invented');
  ok(h.envPeriod.days === 1 && h.envPeriod.lang.fr === 2 && h.envPeriod.lang.de === 1 && h.envPeriod.os.iPhone === 2, '« Who visits » from the hour cells');
  ok(h.srcPeriod.days === 1 && Object.keys(h.srcPeriod.all).length >= 1, 'sources from the hour cells');
  ok(h.guidePeriod.days === 1 && h.guidePeriod.summary.acceptance.offered === 1, 'Ace’s Help from the hour cells');
  ok(h.langTrend && h.langTrend.h24 === true && h.langTrend.win === 24 && h.langTrend.curN === 3, 'language trend: last 24 hours vs the 24 before');
  ok(h.cohorts === null, 'cohorts are not computed over 24 hours');
  ok(h.hourProfile && h.hourProfile.v.length === 24 && h.hourProfile.v.reduce((a, b) => a + b, 0) === 0, 'time-of-day profile over the 24 complete hours: the visits of the hour in progress are not in it yet');
  ok(h.pth && h.pth.h24 === true && h.pth.days.length === 24 && /T\d\d$/.test(h.pth.days[0].date), 'pokerth.net share: one row per hour');
  const d14 = await get('days=14');
  ok(d14 && d14.h24 === false && d14.periodDays === 14 && d14.series.length === 14 && d14.cohorts && typeof d14.cohorts === 'object', 'days mode unchanged (14 days, cohorts present)');
  ok(d14.period.v === 6 && d14.envPeriod.lang.fr === 2 && d14.guidePeriod.days === 1, 'and the day buckets still count the same pings once (3 today + 3 seeded five days back)');
  await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
  const v = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
  const today = v.days[dayKey(new Date())], stale = v.days[dayKey(old)];
  const cell = today && today.hc && Object.values(today.hc)[0];
  ok(cell && cell.v === 3 && Object.keys(cell.ids).length === 2 && cell.m.pokerthnet === 1 && cell.lv === 1 && cell.ev && cell.lg && cell.sr && cell.gd && cell.geo, 'a cell carries the day fields');
  ok(v.totalV === 6 && (v.guide.offer || {}).offered === 1, 'all-time totals counted once, not once per cell');
  ok(stale && !stale.hc && !stale.geoH && stale.v === 3, 'cells older than three days are pruned, the day itself is kept');
} finally {
  proxy.kill('SIGTERM');
  if (!up) console.log(plog.slice(-2000));
  try { fs.unlinkSync(VISITS); } catch (e) {}
}

// ── admin wiring ──
const admin = fs.readFileSync(path.join(root, 'public/admin.html'), 'utf8');
ok(/<option value="1">Last 24 hours<\/option><option value="7">Last 7 days<\/option>/.test(admin) && /TRAF_PERIODS=\[1,7,14,30,60,90\]/.test(admin), 'the period selector offers Last 24 hours');
ok(/function _perQuery\(\)\{ return \(_trafRange \? 'from='\+_trafRange\.from\+'&to='\+_trafRange\.to : \(_trafPeriod===1 \? 'hours=24' : 'days='\+_trafPeriod\)\)\+\(_trafBots\?'&bots=1':''\); \}/.test(admin) && /api\('\/admin\/visits\?'\+_perQuery\(\)\)/.test(admin) && /q=_perQuery\(\)/.test(admin), 'Traffic and World ask for hours=24');
ok(/function _sLab\(x\)\{[^}]*t\.slice\(11\)\+'h'/.test(admin) && !/\(x\.date\|\|''\)\.slice\(5\)/.test(admin), 'every series label goes through _sLab (hours shown as HHh)');
ok(/var h=\(_isH24\(\)\);/.test(admin) && /function _isH24\(\)\{ return !_trafRange && _trafPeriod===1; \}/.test(admin) && /\(_musPeriodDays\|\|\(d\.h24&&d\.musicPeriod\)\)/.test(admin) && /\(_guidePeriodDays\|\|\(d\.h24&&d\.guidePeriod\)\)/.test(admin), 'no fallback to all-time totals under 24 hours');
ok(/if\(d\.h24\)\{\s*box\.innerHTML='<div class="empty">Return rates are measured over whole days/.test(admin), 'cohorts say why they are hidden');
ok(/U=d\.h24\?\{one:'hour'/.test(admin), 'insights speak per hour under 24 hours');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
