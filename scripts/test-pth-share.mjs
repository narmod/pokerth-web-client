#!/usr/bin/env node
// Deterministic guards for the pokerth.net vs web client sampler in proxy.js.
// Run: node scripts/test-pth-share.mjs
//
// recordPthSample and pthShareSummary are pure over visitsStore, so they are
// lifted out by name and run against a store built here; the sampler timer,
// the upstream read and the socket census are checked by source shape only.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function fn(name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let depth = 0;
  for (let j = src.indexOf('{', head); j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(head, j + 1); }
  }
  return '';
}

// -- Source shape ------------------------------------------------------------
for (const name of ['pthWebOnlineNow', 'recordPthSample', '_pthSampleTick', 'pthShareSummary', '_liveRead']) {
  ok(fn(name) !== '', name + ' is defined in proxy.js');
}
ok(/_liveRead\(cfg\)\.then\(function \(out\) \{ send\(out\.body, out\.note\); \}\)/.test(fn('handleLiveStats')),
  'the login card and the sampler share one cached upstream read');
ok(/setInterval\(_pthSampleTick, PTH_SAMPLE_MS\)\.unref\(\)/.test(src), 'the sampler runs on its own timer, which never holds the process');
ok(/const PTH_SAMPLE_MS = 5 \* 60 \* 1000;/.test(src), 'every five minutes');
ok(/if \(!cfg\.on\) return;/.test(fn('_pthSampleTick')), 'and not at all when the live figures are switched off');
const census = fn('pthWebOnlineNow');
ok(/m !== 'pthnet' \|\| !S\.connected/.test(census), 'a bridge counts only on pokerth.net and once its upstream is up');
ok(/!c\._notify \|\| c\.readyState !== 1 \|\| c\._bcMode !== 'pthnet'/.test(census), 'a direct player counts through its notify channel, training excluded');
ok(/if \(S\.live\) lv\+\+; else wb\+\+;/.test(census) && /if \(c\._live\) lv\+\+; else wb\+\+;/.test(census),
  '/live spectators are counted apart on both paths');
ok(/pth: pthShareSummary\(P\)/.test(src), 'the admin summary carries it, over the dashboard period');
ok(/visitsStore\.pthSince = \(typeof _vs\.pthSince === 'number'\)/.test(src), 'its start date survives a restart');
ok(/pthSince: 0,/.test(fn('emptyVisitsStore')), 'and a full reset clears it');
ok(!/chatNick|nick/.test(fn('recordPthSample')), 'no nickname is stored, only counts');

// -- Run it -------------------------------------------------------------------
const visitsStore = { days: {}, pthSince: 0 };
const scope = new Function('visitsStore', 'PTH_SAMPLE_MS', '_liveStatsCfg', 'pruneVisitDays', '_pthLast',
  fn('visitDayKey') + '\n' + fn('recordPthSample') + '\n' + fn('_pthMean') + '\n' + fn('pthShareSummary') +
  '\nreturn { visitDayKey, recordPthSample, pthShareSummary };')(visitsStore, 300000, () => ({ on: true }), () => {}, null);
const { visitDayKey, recordPthSample, pthShareSummary } = scope;

const now = new Date(); now.setMinutes(10, 0, 0);
ok(recordPthSample({ ok: false }, { wb: 3, lv: 0 }, now) === false, 'a failed upstream read records nothing');
ok(!visitsStore.days[visitDayKey(now)], 'and does not even open a day bucket');
ok(recordPthSample({ ok: true, online: 20, tables: 3, waiting: 3, today: 21 }, { wb: 4, lv: 1 }, now), 'a good read is recorded');
recordPthSample({ ok: true, online: 30, tables: 4, waiting: 2, today: 25 }, { wb: 2, lv: 0 }, now);
const slot = visitsStore.days[visitDayKey(now)].ps[now.getHours()];
ok(slot.n === 2 && slot.on === 50 && slot.wb === 6 && slot.lv === 1, 'samples of one hour add up in one slot');
ok(slot.onX === 30 && slot.wbX === 4, 'and keep the maxima');
ok(slot.td === 25, 'the today counter keeps its latest reading');
ok(visitsStore.pthSince === now.getTime(), 'the first sample dates the measurement');

const s = pthShareSummary(7);
ok(s.h48.length === 48 && s.days.length === 7, '48 hourly points and one per day of the period');
const last = s.h48[47];
ok(last.n === 2 && last.on === 25 && last.wb === 3 && last.lv === 0.5, 'the current hour shows the means of its samples');
ok(s.h48.slice(0, 47).every(x => x.n === 0 && x.on === 0), 'hours without samples are zero, with n = 0 to say so');
const dToday = s.days[6];
ok(dToday.date === visitDayKey(now) && dToday.on === 25 && dToday.wb === 3 && dToday.onX === 30 && dToday.td === 25,
  'the day folds its hours the same way');

// A quiet hour must weigh less than a busy one in the day's mean.
const early = new Date(now); early.setHours(now.getHours() === 0 ? 1 : 0, 5, 0, 0);
if (visitDayKey(early) === visitDayKey(now) && early.getHours() !== now.getHours()) {
  for (let i = 0; i < 2; i++) recordPthSample({ ok: true, online: 2, tables: 0, waiting: 0, today: 1 }, { wb: 2, lv: 0 }, early);
  const d2 = pthShareSummary(7).days[6];
  ok(d2.n === 4 && d2.on === 13.5 && d2.wb === 2.5, 'a day mean is weighted by samples, not by hours');
}

// -- Admin page --------------------------------------------------------------
ok(/function _trafPth\(d\)/.test(admin) && /_trafPth\(d\);/.test(admin), 'the admin page renders the comparison');
ok(/function _pthPct\(wb,on\)\{ return on\? /.test(admin), 'the share never divides by zero');
ok(/d\.pth===undefined/.test(admin), 'an older proxy is told apart from an empty record');
ok(/_chartMount\(\$\('trafPthShare'\)/.test(admin) && /_chartMount\(\$\('trafPthDays'\)/.test(admin) && /_chartMount\(\$\('trafPth48'\)/.test(admin),
  'all three charts are mounted, so a tap reads them on mobile');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
