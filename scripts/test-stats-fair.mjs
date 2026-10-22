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
ok(/if\(n>=1 && live\)\{ s=s\.slice\(0,-1\); n=s\.length; \}/.test(ins), 'mean, slope and halves leave the day in progress out, even on a 1- or 2-day range');
ok(/if\(_fit\.length && \(d\.h24\|\|!d\.periodEnd\)\) _fit=_fit\.slice\(0,-1\);/.test(admin), 'so does the trend line of the chart');

// ── Server day keys, request order ────────────────────────────────────────
const mt = fn(admin, '_musTrendWin') + fn(admin, '_musDays');
ok(!/getFullYear\(\)/.test(mt) && /_trafTodayKey/.test(mt) && /_musSinceKey/.test(mt), 'the music trend uses the server\'s day keys, not the browser\'s');
const lt = fn(admin, 'loadTraffic');
ok(/var _seq=\+\+_trafSeq;/.test(lt) && /if\(_seq!==_trafSeq\) return;/.test(lt), 'only the newest Traffic answer paints');

// The point in progress is left out of means, slope and halves, only when there
// is one: always for 24 h, never for a past custom range (audit 2026-10-20, B6).
ok(/var sAll=s, live=d\.h24 \|\| !d\.periodEnd;\n\s+if\(n>=1 && live\)\{ s=s\.slice\(0,-1\); n=s\.length; \}/.test(admin),
  'a window ending now drops its day (hour) in progress; a past range keeps every day');

// ── Devices against devices (audit 2026-10-22) ────────────────────────────
// `rt` counts the visits of known devices (a newcomer's reload included), `nw`
// the devices seen for the first time: the dashboard sets devices against
// devices, rd = u − nw, never rt against nw.
{
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fn(proxy, 'visitWindowList') + '\n' + fn(proxy, 'visitPointRd') + '\n' + fn(admin, '_rdOf'), ctx);
  const d1 = { v: 6, ids: { a: 1, b: 1 }, nw: 2, rt: 4 };      // a and b arrive, reload four times
  const d2 = { v: 5, ids: { a: 1, c: 1 }, nw: 1, rt: 4 };      // a comes back, c arrives
  const w2 = vm.runInContext('visitWindowList(L)', Object.assign(ctx, { L: [d1, d2] }));
  ok(w2.u === 3 && w2.nw === 3 && w2.rd === 0 && w2.rt === 8, 'over both days: three devices, all new in the window, none returning (rt still the 8 visits)');
  const w1 = vm.runInContext('visitWindowList(L)', Object.assign(ctx, { L: [d2] }));
  ok(w1.u === 2 && w1.nw === 1 && w1.rd === 1, 'the second day alone: one device back, one new');
  const p = vm.runInContext('visitPointRd({ u: 762, nw: 496, rt: 661 })', ctx);
  ok(p.rd === 266, 'a day of 762 devices with 496 new has 266 returning, whatever its 661 returning visits');
  ok(vm.runInContext('_rdOf({ u: 10, nw: 4 }) === 6 && _rdOf({ u: 10, nw: 4, rd: 5 }) === 5 && _rdOf(null) === 0', ctx), 'the dashboard falls back on u − nw for an older proxy');
}
ok(!/x\.rt\b|\.rt\|\||month\.rt/.test(fn(admin, '_trafInsights') + fn(admin, 'loadTraffic') + fn(admin, '_tsAudience')), 'no dashboard figure reads returning visits as returning devices');

// The device tiles and the closing lines follow the period picked in Filters.
{
  const tI = fn(admin, '_trafInsights');
  ok(/var per=d\.period\|\|d\.month\|\|\{\}/.test(tI) && !/Unique devices \/ 30 d|New share \/ 30 d|over 30 days/.test(tI), 'Unique devices, New share and the closing lines read the chosen period');
  ok(/pct\(per\.nw,per\.u\)/.test(tI), 'New share = new devices out of the devices of the period');
}

// Days before counting began are no measure: out of means, slope and halves.
{
  const ctx = { visitOldestBack: function () { return 3; }, visitDayIndex: function () { return 20000; } };
  vm.createContext(ctx);
  vm.runInContext(fn(proxy, 'visitDayKeyFromIndex') + '\n' + fn(proxy, 'visitCountedFrom'), ctx);
  ok(vm.runInContext('visitCountedFrom()', ctx) === vm.runInContext('visitDayKeyFromIndex(19998)', ctx), 'the first complete day is the one after counting began');
  ok(vm.runInContext('visitCountedFrom(-1)', ctx) === '', 'nothing counted: no day');
  ok(/countedFrom: visitCountedFrom\(\)/.test(sum), 'the summary carries it');
  const tI = fn(admin, '_trafInsights');
  ok(/while\(off<n && String\(s\[off\]\.date\|\|''\)<cf\) off\+\+;/.test(tI), 'the insights drop the days before it');
  ok(/segs:n>=2\?\[\{from:off,to:off\+half-1\},\{from:off\+half,to:off\+n-1\}\]:\[\]/.test(tI), 'and the halves on the new-devices chart start where counting does');
  ok(/i<_t0\?null:/.test(fn(admin, 'loadTraffic')) && /if\(v==null\) return;/.test(fn(admin, '_lineChart')), 'the trend line starts there too, nothing drawn before');
}

// Yesterday at this hour weighs the hour in progress by what has passed of it.
{
  const FIXED = new Date('2026-10-20T15:30:00').getTime();
  class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(FIXED); } static now() { return FIXED; } }
  const h = {}, hn = {}; for (let i = 0; i < 24; i++) { h[i] = 10; hn[i] = 2; }
  const ctx = { Date: FakeDate, visitDay: function () { return { h: h, hn: hn }; } };
  vm.createContext(ctx);
  vm.runInContext(fn(proxy, 'visitDayKey') + '\n' + fn(proxy, 'visitYesterdayToHour'), ctx);
  const y = vm.runInContext('visitYesterdayToHour()', ctx);
  ok(y.v === 155 && y.nw === 31, 'at 15:30, yesterday counts 15 whole hours and half of the 16th (155, not 160)');
}

// An average day reads each hour over the days it was counted whole.
{
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fn(admin, '_profMeans'), ctx);
  const v = Array(24).fill(100), dh = Array(24).fill(5); v[21] = 80; dh[21] = 4;   // 21:00 not reached yet today
  const m = vm.runInContext('_profMeans(P)', Object.assign(ctx, { P: { v: v, nw: Array(24).fill(0), dh: dh, days: 4.88 } }));
  ok(m.v[21] === 20 && m.v[3] === 20, 'an hour not yet reached today is not read as a quieter one (20 = 20)');
  const o = vm.runInContext('_profMeans(P)', Object.assign(ctx, { P: { v: Array(24).fill(10), nw: Array(24).fill(0), days: 2 } }));
  ok(o.v[0] === 5, 'an older proxy without dh keeps the single divisor');
  ok(/pm=_profMeans\(prof\)/.test(fn(admin, '_tsActivity')) && /var pm=_profMeans\(prof\)/.test(fn(admin, '_trafHours')), 'Busiest hour, Visits per hour, the quiet stretch and the newcomer index all read the means');
}

// World and Activity: every « vs before » compares complete days (hours) too (lot 1).
{
  const ctx = { visitList: function (h24, n, off) { return { h24: h24, n: n, off: off || 0 }; } };
  vm.createContext(ctx);
  vm.runInContext(fn(proxy, 'visitFullLists'), ctx);
  const a = vm.runInContext('visitFullLists(false, 14, 0)', ctx), b = vm.runInContext('visitFullLists(false, 14, 5)', ctx), c = vm.runInContext('visitFullLists(true, 1, 0)', ctx);
  ok(a.cur.off === 1 && a.prev.off === 15 && a.cur.n === 14, 'a window ending now: the 14 days ending yesterday against the 14 before');
  ok(b.cur.off === 5 && b.prev.off === 19, 'a past range as it stands, against the range before');
  ok(c.cur.h24 && c.cur.off === 1 && c.prev.off === 25, '24 h: the 24 complete hours against the 24 before');
  const sumSrc = fn(proxy, 'visitsSummaryRead'), cube = fn(proxy, 'visitCubeSummary');
  ok(/full: visitFullSum\(h24, P, E, 'lo'\)/.test(sumSrc) && /full: visitFullSum\(h24, P, E, 'ls'\)/.test(sumSrc), 'logins and LAN servers carry their like-for-like pair');
  ok(/loginsFull: visitCovered\(h24 \? 2 : \(E \|\| 1\) \+ 2 \* P - 1/.test(sumSrc) && /lanFull: visitCovered/.test(sumSrc), 'with a cover for the window one day further back');
  ok(/const FL = visitFullLists\(h24, P, E\);/.test(cube) && /fullPrevCovered: visitCovered\(h24 \? 2 : \(E \|\| 1\) \+ 2 \* P - 1/.test(cube), 'and so does the narrowing cube');
  const w = fn(admin, '_worldInet') + fn(admin, '_worldLan') + fn(admin, '_worldConn') + fn(admin, '_wLogins');
  ok(!/_wDelta\(cur,prv,cov\)/.test(w) && /_wDelta\(F\.cur,F\.prev,F\.cov\)/.test(fn(admin, '_worldInet')) && /_wDelta\(F\.cur,F\.prev,F\.cov\)/.test(fn(admin, '_worldLan')), 'the Internet and LAN cards set complete days against complete days');
  ok(/c=lc\[id\]\|\|0, b=lb\[id\]\|\|0/.test(fn(admin, '_worldLan')), 'each LAN server too');
  ok(/Math\.round\(\(tc-tp\)\/tp\*100\)/.test(fn(admin, '_wLogins')), 'and the logins');
  ok(/_wFullM\(d,keys\)/.test(fn(admin, '_worldConn')) && /_wFullCube\(NB,m\.k\)/.test(fn(admin, '_worldConn')), 'and the connections-per-day note, plain or narrowed');
  ok(/_hourInstants\(24, 1\)/.test(fn(proxy, 'visitHourProfile24')), 'the 24-hour average day leaves the hour in progress out');
}
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
