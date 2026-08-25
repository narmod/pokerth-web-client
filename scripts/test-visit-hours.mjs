#!/usr/bin/env node
// Deterministic guards for the hourly traffic buckets in proxy.js.
// Run: node scripts/test-visit-hours.mjs
//
// The two readers are pure functions over visitsStore, so they are lifted out
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

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
