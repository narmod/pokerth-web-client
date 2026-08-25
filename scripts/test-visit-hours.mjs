#!/usr/bin/env node
// Deterministic guards for the hourly buckets and the cohort readers in proxy.js.
// Run: node scripts/test-visit-hours.mjs
//
// The readers are pure functions over visitsStore, so they are lifted out
// of the monolith by name and run against a store built here. Nothing listens,
// nothing is written, and the clock is the only input that varies — every
// assertion below is stated relative to it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Lift a named function out of the source, braces balanced.
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
for (const name of ['visitDayKey', 'visitHourSeries', 'visitHourProfile']) {
  ok(fn(name) !== '', name + ' is defined in proxy.js');
}
ok(/bucket\.h\[hr\] = \(bucket\.h\[hr\] \|\| 0\) \+ 1;/.test(src), 'every visit lands in an hour bucket');
ok(/bucket\.hn\[hr\] = \(bucket\.hn\[hr\] \|\| 0\) \+ 1;/.test(src), 'and a first-ever visit lands in a second one');
ok(src.indexOf('bucket.hn[hr]') > src.indexOf('bucket.nw = (bucket.nw || 0) + 1;'),
  'the first-time bucket is filled on the new-device branch only');
ok(/hours48: visitHourSeries\(48\)/.test(src), 'the summary carries the last 48 hours');
ok(/hourProfile: visitHourProfile\(30\)/.test(src), 'and an average day over 30 days');
ok(/hourSince: visitsStore\.hourSince/.test(src), 'and says since when any of it was collected');
ok(/visitsStore\.hourSince = \(typeof _vs\.hourSince === 'number'\)/.test(src),
  'which survives a restart instead of resetting to now');

const now = new Date();
const visitsStore = { days: {} };
// The lifted functions call visitDayKey by name, so they are evaluated together
// in one scope where all three are visible.
const scope = new Function('visitsStore',
  fn('visitDayKey') + '\n' + fn('visitHourSeries') + '\n' + fn('visitHourProfile') +
  '\nreturn { visitDayKey, visitHourSeries, visitHourProfile };')(visitsStore);
const { visitDayKey, visitHourSeries, visitHourProfile } = scope;

// Five days carrying hourly buckets, three older ones from before the feature.
const QUIET = [4, 5, 6, 7];
for (let i = 0; i < 8; i++) {
  const d = new Date(now); d.setDate(now.getDate() - i);
  const b = { v: 0, ids: {} };
  if (i < 5) {
    b.h = {}; b.hn = {};
    for (let k = 0; k < 24; k++) {
      b.h[k] = QUIET.includes(k) ? 2 : 20;
      b.hn[k] = QUIET.includes(k) ? 2 : 2;   // as many newcomers in the trough
      b.v += b.h[k];
    }
  }
  visitsStore.days[visitDayKey(d)] = b;
}

const s48 = visitHourSeries(48);
ok(s48.length === 48, 'the series is exactly 48 hours long');
ok(s48[47].t === visitDayKey(now) + 'T' + String(now.getHours()).padStart(2, '0'),
  'and ends on the hour in progress');
ok(new Date(s48[0].t.slice(0, 10)) <= now, 'and starts two days back, not in the future');
ok(s48.every(x => typeof x.v === 'number' && typeof x.nw === 'number'),
  'each hour carries both a visit count and a first-time count');
const gap = new Date(now); gap.setDate(now.getDate() - 6);
ok(visitHourSeries(48).length === 48 && !visitsStore.days[visitDayKey(gap)].h,
  'a day with no hour bucket does not break the series');

const p = visitHourProfile(30);
const expected = 4 + (now.getHours() + 1) / 24;
ok(Math.abs(p.days - Math.round(expected * 100) / 100) < 0.02,
  'four whole days plus the elapsed fraction of today, not five');
ok(p.days < 5, 'so a half-finished day never drags the average down');
ok(p.v.length === 24 && p.nw.length === 24, 'the profile has one slot per hour');
ok(p.v[19] > p.v[5], 'the evening carries more traffic than the small hours');
const V = p.v.reduce((a, b) => a + b, 0), N = p.nw.reduce((a, b) => a + b, 0);
const idx = h => (p.nw[h] / N) / (p.v[h] / V);
ok(idx(5) > 1.5, 'newcomers are over-represented in the trough — the point of the second bucket');
ok(idx(19) < 1, 'and under-represented at peak, where the regulars are');

// Nothing recorded at all: no NaN, no division by zero, just zeros.
const empty = new Function('visitsStore',
  fn('visitDayKey') + '\n' + fn('visitHourProfile') + '\nreturn visitHourProfile;')({ days: {} })(30);
ok(empty.days === 0 && empty.v.every(x => x === 0),
  'an empty store answers with zeros rather than NaN');

// -- Cohorts ---------------------------------------------------------------
// allU used to hold a 1 per device, which answered "seen before?" and nothing
// else. It now holds the day of the first visit, so a cohort can be rebuilt
// against the daily buckets. The three rates are measured on three different
// totals on purpose: yesterday's newcomers cannot appear in a seven-day rate.
ok(/const VISIT_FIRST_UNKNOWN = 1000;/.test(src), 'a pre-measurement device is told apart by a sentinel');
ok(/if \(!seenBefore\) visitsStore\.allU\[h\] = visitDayIndex\(\);/.test(src),
  'a first visit records its day');
ok(!/visitsStore\.allU\[h\] = 1;/.test(src), 'and a return no longer overwrites it');
ok(/cohorts: visitCohorts\(30\)/.test(src), 'the summary carries the cohorts');
ok(/Math\.floor\(Date\.UTC\(d\.getFullYear\(\), d\.getMonth\(\), d\.getDate\(\)\) \/ 86400000\)/.test(src),
  'the day index is built from local parts in UTC arithmetic, so a DST shift adds no day');

const cohortScope = new Function('visitsStore', 'VISIT_FIRST_UNKNOWN',
  fn('visitDayIndex') + '\n' + fn('visitDayKeyFromIndex') + '\n' + fn('visitCohorts') +
  '\nreturn { visitDayIndex, visitDayKeyFromIndex, visitCohorts };');
const store2 = { days: {}, allU: {} };
const co = cohortScope(store2, 1000);
const today = co.visitDayIndex();
const put = (idx, ids) => {
  const k = co.visitDayKeyFromIndex(idx);
  store2.days[k] = store2.days[k] || { v: 0, ids: {} };
  ids.forEach(i => { store2.days[k].ids['h' + i] = 1; });
};
ok(co.visitDayKeyFromIndex(today) === visitDayKey(new Date()),
  'the index and the string key name the same day');
// Three devices from before the measurement, active four days in the window.
for (let i = 1; i <= 3; i++) { store2.allU['h' + i] = 1; for (let d = 0; d < 4; d++) put(today - d, [i]); }
store2.allU.h10 = today - 10; put(today - 10, [10]); put(today - 9, [10]);   // back next day
store2.allU.h11 = today - 10; put(today - 10, [11]); put(today - 5, [11]);   // back on day 5
store2.allU.h12 = today - 10; put(today - 10, [12]);                          // never back
store2.allU.h13 = today - 1;  put(today - 1, [13]);                           // only d1 is due
store2.allU.h14 = today;      put(today, [14]);                               // nothing is due
const c = co.visitCohorts(30);
ok(c.known === 5, 'only dated devices are counted as known');
ok(c.d1.n === 4 && c.d1.back === 1, 'the next-day rate excludes today\u2019s arrivals');
ok(c.d3.n === 3 && c.d3.back === 1, 'a return on day 5 is not a return within 3');
ok(c.d7.n === 3 && c.d7.back === 2, 'but it is one within 7');
ok(c.d1.n > c.d7.n, 'the denominators shrink with the lag, which is the whole point');
ok(c.active[0] === 3 && c.active[1] === 2, 'active days land in the right buckets');
ok(c.estTotal === 3 && c.estDays / c.estTotal === 4,
  'pre-measurement devices serve as the established-base comparison instead of being dropped');
ok(c.since === co.visitDayKeyFromIndex(today - 10), 'the earliest dated first visit is reported');
const none = cohortScope({ days: {}, allU: {} }, 1000).visitCohorts(30);
ok(none.known === 0 && none.d1.n === 0 && none.newTotal === 0,
  'an empty store answers with zeros, not with a rate over nothing');

// -- Wiping means wiping ---------------------------------------------------
// The reset listed its fields by hand and the list had drifted from the one
// used at startup: music, musicSince and hourSince survived a "delete
// everything". One definition now serves both, so the two cannot disagree.
ok(/function emptyVisitsStore\(\)/.test(src), 'the empty store has a single definition');
ok(/let visitsStore = emptyVisitsStore\(\);/.test(src), 'startup uses it');
ok(/if \(d && d\._reset\) \{\s*\n\s*visitsStore = emptyVisitsStore\(\);/.test(src), 'and so does the reset');
ok(!/visitsStore = \{ days: \{\}/.test(src),
  'and no hand-written store shape is left anywhere to drift again');
const wiped = new Function(fn('emptyVisitsStore') + '\nreturn emptyVisitsStore();')();
for (const k of ['days', 'totalV', 'totalRet', 'allU', 'allM', 'env', 'envSince', 'music', 'musicSince', 'hourSince']) {
  ok(k in wiped, 'a wipe clears ' + k);
}
ok(wiped.music && Object.keys(wiped.music).length === 0, 'play counts really do go back to zero');
ok(wiped.hourSince === 0, 'and so does the date the hourly buckets started');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
