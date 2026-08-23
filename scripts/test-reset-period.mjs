#!/usr/bin/env node
// The leaderboard wipes itself when its period key changes, so the key is the
// whole safety mechanism: a key that flips when it should not wipes real
// scores, and one that fails to flip never resets at all.
// Run: node scripts/test-reset-period.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const proxy = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'proxy.js'), 'utf8');

function body(name) {
  const head = proxy.indexOf('function ' + name + '(');
  if (head < 0) throw new Error('not found: ' + name);
  let i = proxy.indexOf('{', head), depth = 0;
  for (let j = i; j < proxy.length; j++) {
    if (proxy[j] === '{') depth++;
    else if (proxy[j] === '}') { depth--; if (!depth) return proxy.slice(head, j + 1); }
  }
  throw new Error('unbalanced: ' + name);
}

// Pull both functions out and drive them with a period of our choosing.
const src = body('isoWeekKey') + '\n' + body('statsPeriodKey') + '\n';
function keyOn(period, date) {
  const f = new Function('STATS_RESET_PERIOD', 'FIXED', src +
    'const _R = Date; Date = function(...a){ return a.length ? new _R(...a) : new _R(FIXED); };' +
    'Date.prototype = _R.prototype;' +
    'const out = statsPeriodKey(); Date = _R; return out;');
  return f(period, date.getTime());
}

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const D = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0);

// ── The other periods are untouched ───────────────────────────────────────
ok(keyOn('off', D(2026, 8, 23)) === null, 'off means no scheduled reset');
ok(keyOn('daily', D(2026, 8, 23)) === '2026-08-23', 'daily keys by day');
ok(keyOn('monthly', D(2026, 8, 23)) === '2026-08', 'monthly keys by month');
ok(keyOn('yearly', D(2026, 8, 23)) === '2026', 'yearly keys by year');
ok(keyOn('nonsense', D(2026, 8, 23)) === null, 'an unknown period never wipes');

// ── The week runs Monday to Sunday ────────────────────────────────────────
const mon = keyOn('weekly', D(2026, 8, 17));   // a Monday
ok(D(2026, 8, 17).getDay() === 1, 'the fixture really is a Monday');
for (let i = 0; i < 7; i++) {
  ok(keyOn('weekly', D(2026, 8, 17 + i)) === mon, 'day ' + (i + 1) + ' of that week shares its key');
}
ok(keyOn('weekly', D(2026, 8, 24)) !== mon, 'the next Monday starts a new week');
ok(keyOn('weekly', D(2026, 8, 16)) !== mon, 'and the Sunday before belongs to the previous one');

// ── Year boundaries, where naive week numbers go wrong ────────────────────
ok(keyOn('weekly', D(2027, 1, 1)) === '2026-W53',
  '1 Jan 2027 is a Friday and belongs to the last week of 2026');
ok(keyOn('weekly', D(2026, 12, 31)) === '2026-W53', 'so does 31 Dec 2026');
ok(keyOn('weekly', D(2027, 1, 4)) === '2027-W01', 'the following Monday opens 2027');
ok(keyOn('weekly', D(2026, 1, 1)) === '2026-W01', '1 Jan 2026 is a Thursday, so week 1 of 2026');
ok(keyOn('weekly', D(2025, 12, 29)) === '2026-W01', 'and the Monday before it already counts as 2026');

// ── The key must change exactly once a week across a year ─────────────────
let flips = 0, prev = keyOn('weekly', D(2026, 1, 1));
for (let d = new Date(2026, 0, 2); d < new Date(2027, 0, 1); d.setDate(d.getDate() + 1)) {
  const k = keyOn('weekly', new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12));
  if (k !== prev) { flips++; prev = k; }
}
ok(flips === 52, 'the key changes 52 times over 2026, got ' + flips);

// ── Format ────────────────────────────────────────────────────────────────
ok(/^\d{4}-W\d{2}$/.test(mon), 'the key reads like 2026-W34, sortable as text');

// ── Both server-side validations accept it ────────────────────────────────
const accepted = proxy.match(/\['off', 'daily', 'weekly', 'monthly', 'yearly'\]/g) || [];
ok(accepted.length === 2, 'weekly passes both validation lists, found ' + accepted.length);
ok(/invalid period \(off\|daily\|weekly\|monthly\|yearly\)/.test(proxy), 'and the error message lists it');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
