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
ok(/hourProfile: h24 \? visitHourProfile24\(\) : visitHourProfile\(P, E\)/.test(src), 'and an average day over the dashboard period (or the sliding 24 hours)');
ok(/hourSince: visitsStore\.hourSince/.test(src), 'and says since when any of it was collected');
ok(/bucket\.hm\[mode\]\[hr\] = \(bucket\.hm\[mode\]\[hr\] \|\| 0\) \+ 1;/.test(src), 'every session opening lands in an hour bucket for its mode');
ok(/modeHourSince: visitsStore\.modeHourSince \|\| 0/.test(src), 'and the summary says since when sessions are counted by hour');
ok(/visitsStore\.modeHourSince = \(typeof _vs\.modeHourSince === 'number'\)/.test(src), 'which survives a restart too');
ok(/visitsStore\.hourSince = \(typeof _vs\.hourSince === 'number'\)/.test(src),
  'which survives a restart instead of resetting to now');

const now = new Date();
const visitsStore = { days: {} };
// The lifted functions call visitDayKey by name, so they are evaluated together
// in one scope where all three are visible.
const scope = new Function('visitsStore',
  'let _visitBots = false, _visitMerged = null;\n' + fn('_visitAdd') + '\n' + fn('visitWithBots') + '\n' + fn('visitDay') + '\n' + fn('visitDayKey') + '\n' + fn('_hourInstants') + '\n' + fn('visitHourSeries') + '\n' + fn('visitHourProfile') +
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
ok(s48.every(x => x.m && ['pokerthnet', 'lan', 'offline', 'live'].every(k => x.m[k] === 0)),
  'each hour carries a per-mode count, zero where none was recorded');
{
  const kNow = visitDayKey(now), hh = now.getHours();
  visitsStore.days[kNow].hm = { offline: { [hh]: 3 }, pokerthnet: { [hh]: 5 } };
  const last = visitHourSeries(48)[47].m;
  ok(last.offline === 3 && last.pokerthnet === 5 && last.lan === 0 && last.live === 0,
    'and reads the mode buckets of the hour it stands for');
  delete visitsStore.days[kNow].hm;
}
const gap = new Date(now); gap.setDate(now.getDate() - 6);
ok(visitHourSeries(48).length === 48 && !visitsStore.days[visitDayKey(gap)].h,
  'a day with no hour bucket does not break the series');

const p = visitHourProfile(30);
const hh = now.getHours();
const expected = 4 + hh / 24;
ok(Math.abs(p.days - Math.round(expected * 100) / 100) < 0.02,
  'four whole days plus today\'s complete hours, not five');
ok(p.days < 5, 'so a half-finished day never drags the average down');
ok(p.v.length === 24 && p.nw.length === 24 && p.dh.length === 24, 'the profile has one slot per hour');
ok(p.dh.every((x, k) => x === (k < hh ? 5 : 4)), 'each hour is divided by the days it was counted whole: today only up to the hour in progress');
ok(p.dh.every((x, k) => p.v[k] / x === (QUIET.includes(k) ? 2 : 20)), 'so every hour reads its true daily mean (20, or 2 in the trough), the evening as much as the morning');
ok(p.v[19] > p.v[5], 'the evening carries more traffic than the small hours');
const V = p.v.reduce((a, b) => a + b, 0), N = p.nw.reduce((a, b) => a + b, 0);
const idx = h => (p.nw[h] / N) / (p.v[h] / V);
ok(idx(5) > 1.5, 'newcomers are over-represented in the trough — the point of the second bucket');
ok(idx(19) < 1, 'and under-represented at peak, where the regulars are');

{
  // Counting began at 10:xx three days ago: that day's hours 0-10 are no measure.
  const st = new Date(now); st.setDate(now.getDate() - 3); st.setHours(10, 20, 0, 0);
  visitsStore.hourSince = st.getTime();
  const q = visitHourProfile(30);
  ok(q.dh[3] === (3 < hh ? 4 : 3) && q.dh[10] === (10 < hh ? 4 : 3) && q.dh[11] === (11 < hh ? 4 : 3) + 1,
    'the day counting began only counts the hours after the one it began in');
  delete visitsStore.hourSince;
}
// Nothing recorded at all: no NaN, no division by zero, just zeros.
const empty = new Function('visitsStore',
  'let _visitBots = false, _visitMerged = null;\n' + fn('_visitAdd') + '\n' + fn('visitWithBots') + '\n' + fn('visitDay') + '\n' + fn('visitDayKey') + '\n' + fn('visitHourProfile') + '\nreturn visitHourProfile;')({ days: {} })(30);
ok(empty.days === 0 && empty.v.every(x => x === 0),
  'an empty store answers with zeros rather than NaN');

// -- Cohorts ---------------------------------------------------------------
// allU used to hold a 1 per device, which answered "seen before?" and nothing
// else. It now holds the day of the first visit, so a cohort can be rebuilt
// against the daily buckets. The three rates are measured on three different
// totals on purpose: yesterday's newcomers cannot appear in a seven-day rate.
ok(/const VISIT_FIRST_UNKNOWN = 1000;/.test(src), 'a pre-measurement device is told apart by a sentinel');
ok(/if \(!seenBefore\) \{ A\.allU\[h\] = visitDayIndex\(\); A\.totalU = \(A\.totalU \|\| 0\) \+ 1; \}/.test(src) && /const bucket = T\.day, A = T\.all;/.test(src),
  'a first visit records its day (in the humans\' or the bots\' set, cf. visitTarget)');
ok(!/allU\[h\] = 1;/.test(src), 'and a return no longer overwrites it');
ok(/cohorts: h24 \? null : visitCohorts\(P, E\)/.test(src), 'the summary carries the cohorts, over the dashboard period (none over 24 hours)');
ok(/Math\.floor\(Date\.UTC\(d\.getFullYear\(\), d\.getMonth\(\), d\.getDate\(\)\) \/ 86400000\)/.test(src),
  'the day index is built from local parts in UTC arithmetic, so a DST shift adds no day');

const cohortScope = new Function('visitsStore', 'VISIT_FIRST_UNKNOWN',
  'const VISIT_COHORT_W = 7;\n' + fn('visitDayIndex') + '\n' + fn('visitDayKeyFromIndex') + '\n' + fn('visitOldestBack') + '\n' + fn('visitCohorts') +
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
// Counting began long ago (an empty bucket 60 days back): no cohort is cut by it.
store2.days[co.visitDayKeyFromIndex(today - 60)] = { v: 0, ids: {} };
// Three devices from before the measurement, active four days in the window.
for (let i = 1; i <= 3; i++) { store2.allU['h' + i] = 1; for (let d = 0; d < 4; d++) put(today - d, [i]); }
store2.allU.h10 = today - 10; put(today - 10, [10]); put(today - 9, [10]);   // back next day
store2.allU.h11 = today - 10; put(today - 10, [11]); put(today - 5, [11]);   // back on day 5
store2.allU.h12 = today - 10; put(today - 10, [12]);                          // never back
store2.allU.h13 = today - 1;  put(today - 1, [13]);                           // only d1 is due
store2.allU.h14 = today;      put(today, [14]);                               // nothing is due
const c = co.visitCohorts(30);
ok(c.known === 5, 'only dated devices are counted as known');
ok(c.d1.n === 3 && c.d1.back === 1, 'the next-day rate waits for a complete next day: yesterday\u2019s arrivals are not judged on today so far');
ok(c.d3.n === 3 && c.d3.back === 1, 'a return on day 5 is not a return within 3');
ok(c.d7.n === 3 && c.d7.back === 2, 'but it is one within 7');
ok(c.newTotal === 5 && c.actTotal === 3, 'five newcomers in the window, three with seven complete days behind them');
ok(c.active.length === 7 && c.active[0] === 1 && c.active[1] === 2, 'active days over each newcomer\u2019s first seven days land in the right buckets');
ok(c.estTotal === 3 && c.estDays / c.estTotal === 3,
  'the established base is read over the last seven complete days (3 of them active), not the whole window');
ok(c.since === co.visitDayKeyFromIndex(today - 10), 'the earliest dated first visit is reported');
store2.allU.h20 = today - 40; put(today - 40, [20]);                          // dated, before the window
const c7 = co.visitCohorts(7);
ok(c7.since === co.visitDayKeyFromIndex(today - 40) && c7.first === co.visitDayKeyFromIndex(today - 1),
  'since is the earliest dated device ever, first the earliest inside the window (what the card says)');
ok(co.visitCohorts(30).first === co.visitDayKeyFromIndex(today - 10), 'a device before the window never sets first');
{
  // After a reset (or on a fresh store) every regular gets the first day's date:
  // they are the base, not a cohort of newcomers with remarkable returns.
  const st = { days: {}, allU: {} }, cr = cohortScope(st, 1000), t = cr.visitDayIndex();
  const pt = (idx, ids) => { const k = cr.visitDayKeyFromIndex(idx); st.days[k] = st.days[k] || { v: 0, ids: {} }; ids.forEach(i => { st.days[k].ids['r' + i] = 1; }); };
  for (let i = 0; i < 5; i++) { st.allU['r' + i] = t - 12; for (let d = 12; d >= 1; d--) pt(t - d, [i]); }
  st.allU.r9 = t - 10; pt(t - 10, [9]);
  const r = cr.visitCohorts(30);
  ok(r.newTotal === 1 && r.d7.n === 1 && r.d7.back === 0 && r.estTotal === 5, 'devices of the day counting began are the base; only the real newcomer is a cohort');
  ok(r.countedFrom === cr.visitDayKeyFromIndex(t - 11), 'and the cohorts say from which day they count');
}
const none = cohortScope({ days: {}, allU: {} }, 1000).visitCohorts(30);
ok(none.known === 0 && none.d1.n === 0 && none.newTotal === 0 && none.first === 0,
  'an empty store answers with zeros, not with a rate over nothing');

// -- « vs before » only against a fully counted window (audit 2026-10-20, B2)
const coverScope = new Function('visitsStore',
  fn('visitDayIndex') + '\n' + fn('visitDayKeyFromIndex') + '\n' + fn('visitOldestBack') + '\n' + fn('visitCovered') +
  '\nreturn { visitDayIndex, visitDayKeyFromIndex, visitOldestBack, visitCovered };');
const store3 = { days: {} };
const cv = coverScope(store3);
const t3 = cv.visitDayIndex();
ok(cv.visitOldestBack() === -1 && cv.visitCovered(1) === false, 'an empty store covers nothing');
store3.days[cv.visitDayKeyFromIndex(t3 - 45)] = { v: 1, ids: {} };
store3.days[cv.visitDayKeyFromIndex(t3 - 3)] = { v: 1, ids: {} };
store3.days.junk = { v: 1 };
ok(cv.visitOldestBack() === 45, 'the oldest day bucket sets how far back counting goes (junk keys ignored)');
ok(cv.visitCovered(27) === true, '14 days against the 14 before (oldest day 27 back): covered');
ok(cv.visitCovered(59) === false, '30 days against the 30 before (59 back) with 46 days of data: incomplete');
ok(cv.visitCovered(45) === false, 'the first counted day is never taken as whole');
ok(cv.visitCovered(27, Date.now() - 10 * 86400000) === false && cv.visitCovered(5, Date.now() - 10 * 86400000) === true,
  'a figure counted since a later build is covered only from that build on');
ok(/cover: \(function \(\) \{/.test(src) && /prevCovered: visitCovered\(h24 \? 2 : E \+ 2 \* P - 1, visitsStore\.cubeSince/.test(src),
  'the summary and the cube both say whether the window before is covered');
const adm = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'admin.html'), 'utf8');
ok(/function tile\(lbl,o,ref,refLbl,cmp,cov\)\{\n\s+var dl=cov===false\?null:/.test(adm) && /previous period incomplete<\/div>/.test(adm),
  'Summary: an incomplete period before gives no percentage, it says so');
ok((adm.match(/_wDelta\(F\.cur,F\.prev,F\.cov\)/g) || []).length === 2 && /if\(cov===false\) return W_INCOMPLETE;/.test(adm) && /cov:Q\.fullPrevCovered/.test(adm),
  'World: the Internet and LAN cards follow the cover (the cube one when narrowed)');
ok(/\(tp&&cov!==false\)\?Math\.round/.test(adm) && /\(b&&lcov!==false\)\?/.test(adm), 'no percentage either on logins or per LAN server');
ok(/fcov2===false\?' \\u00b7 previous period incomplete'/.test(adm) && /FF\.cov===false\?' · previous period incomplete'/.test(adm),
  'connections per day: the note says it, narrowed or not');

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
