#!/usr/bin/env node
// Traffic figures compare like with like.
// Run: node scripts/test-stats-fair.mjs
//
// Four ways the Traffic tab used to mislead:
//  - "Last 7 days" (today so far + 6 days) set against 7 complete days, and
//    the slope / halves / means read on a series ending with today so far:
//    a drop every morning;
//  - on the night clocks go back, hour 02 read twice in every 24 h / 48 h view;
//  - "today" and the music start day worked out in the browser's zone;
//  - a slow answer painting over a newer one after a quick change of period.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const SELF = fileURLToPath(import.meta.url);
// Daylight-saving checks need a zone that has it, whatever the machine runs.
if (process.env.TZ !== 'Europe/Paris') {
  const r = spawnSync(process.execPath, [SELF], { stdio: 'inherit', env: Object.assign({}, process.env, { TZ: 'Europe/Paris' }) });
  process.exit(r.status == null ? 1 : r.status);
}
const root = join(dirname(SELF), '..');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
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

// ── Hour cells across a clock change ──────────────────────────────────────
function hoursAt(isoLocal, count) {
  const FIXED = new Date(isoLocal).getTime();
  class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(FIXED); } static now() { return FIXED; } }
  const ctx = { Date: FakeDate };
  vm.createContext(ctx);
  vm.runInContext(fn(proxy, 'visitDayKey') + '\n' + fn(proxy, '_hourInstants'), ctx);
  ctx.N = count;
  return vm.runInContext('_hourInstants(N).map(function (d) { return visitDayKey(d) + "T" + d.getHours(); })', ctx);
}
const fallBack = hoursAt('2026-10-25T05:30:00', 24);       // clocks went back at 03:00 → 02:00
ok(fallBack.length === 23 && new Set(fallBack).size === 23, 'the night clocks go back, hour 02 is read once (23 cells in 24 hours)');
ok(fallBack.filter(k => k === '2026-10-25T2').length === 1, 'and the doubled hour is still in the window');
const plain = hoursAt('2026-10-20T15:30:00', 24);
ok(plain.length === 24 && new Set(plain).size === 24 && plain[0] === '2026-10-20T15', 'an ordinary day has 24 cells, newest first');
const spring = hoursAt('2026-03-29T05:30:00', 24);
ok(spring.length === 24 && !spring.includes('2026-03-29T2'), 'the night clocks go forward has no hour 02, nothing is invented');
ok(hoursAt('2026-10-20T15:30:00', 24 + 1).length === 25, 'offset windows walk on from the same top of the hour');
for (const f of ['visitList', 'visitBotWindow', 'visitHourSeries', 'visitHourProfile24', 'visitsSummaryRead', 'pthShareSummary']) {
  ok(/_hourInstants\(/.test(fn(proxy, f)) && !/3600000/.test(fn(proxy, f)), f + ' walks the hours through _hourInstants');
}

// ── Complete-day comparisons ──────────────────────────────────────────────
const sum = fn(proxy, 'visitsSummaryRead');
ok(/full: \{/.test(sum) && /week: \{ cur: visitWindow\(7, 1\), prev: visitWindow\(7, 8\) \}/.test(sum), 'the summary carries complete-day windows (7 days ending yesterday vs the 7 before)');
ok(/cur: visitWindow\(P, E \|\| 1\), prev: visitWindow\(P, \(E \|\| 1\) \+ P\)/.test(sum), 'and the same for the chosen period (a past custom range is complete as it stands)');
ok(/todayKey: visitDayKey\(now\)/.test(sum) && /musicSinceKey/.test(sum), 'and the server\'s own day keys');
ok(/tile\('Last 7 days',d\.week,pv\.week,'the 7 days before \(complete days\)',fu\.week,cv\.week\)/.test(admin), 'the 7-day tile compares complete days and says so');
const ins = fn(admin, '_trafInsights');
ok(/if\(n>2 && live\)\{ s=s\.slice\(0,-1\); n=s\.length; \}/.test(ins), 'mean, slope and halves leave the day in progress out');
ok(/_linreg\(lines\[0\]\.vals\.length>2\?lines\[0\]\.vals\.slice\(0,-1\)/.test(admin), 'so does the trend line of the chart');

// ── Server day keys, request order ────────────────────────────────────────
const mt = fn(admin, '_musTrendWin') + fn(admin, '_musDays');
ok(!/getFullYear\(\)/.test(mt) && /_trafTodayKey/.test(mt) && /_musSinceKey/.test(mt), 'the music trend uses the server\'s day keys, not the browser\'s');
const lt = fn(admin, 'loadTraffic');
ok(/var _seq=\+\+_trafSeq;/.test(lt) && /if\(_seq!==_trafSeq\) return;/.test(lt), 'only the newest Traffic answer paints');

// The point in progress is left out of means, slope and halves, only when there
// is one: always for 24 h, never for a past custom range (audit 2026-10-20, B6).
ok(/var sAll=s, live=d\.h24 \|\| !d\.periodEnd;\n\s+if\(n>2 && live\)\{ s=s\.slice\(0,-1\); n=s\.length; \}/.test(admin),
  'a window ending now drops its day (hour) in progress; a past range keeps every day');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
