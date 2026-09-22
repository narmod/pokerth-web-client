#!/usr/bin/env node
// Deterministic guards for the Traffic tab period selector.
// Run: node scripts/test-admin-period.mjs
//
// One number of days, chosen once at the top of the tab, drives the daily
// series, the hour profile, the cohorts, the language trend, the "Who visits"
// breakdowns and the music ranking. Where a per-day history does not exist
// yet, the page falls back to the running totals and says so.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  \u2717', msg); } else console.log('  \u2713', msg); }
function body(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}

// -- Proxy ---------------------------------------------------------------
const vp = body(proxy, 'visitPeriodDays');
ok(!!vp, 'proxy has visitPeriodDays');
const consts = /const VISIT_PERIOD_MIN = (\d+), VISIT_PERIOD_MAX = (\d+), VISIT_PERIOD_DEFAULT = (\d+);/.exec(proxy);
ok(!!consts, 'the bounds are named constants');
const fn = new Function('VISIT_PERIOD_MIN', 'VISIT_PERIOD_MAX', 'VISIT_PERIOD_DEFAULT', 'q', vp.slice(1, -1));
const f = q => fn(+consts[1], +consts[2], +consts[3], q);
ok(f(undefined) === 14 && f('abc') === 14 && f('') === 14, 'no or unusable ?days= keeps the 14-day window the charts always had');
ok(f('7') === 7 && f('90') === 90, 'the ends of the range pass through');
ok(f('3') === 14, 'below the minimum falls back to the default rather than a 3-day "trend"');
ok(f('500') === 90, 'above the maximum is clamped, so the previous trend window still fits the 400-day retention');
ok(/visitsSummary\(query\.days\)/.test(proxy), 'GET /admin/visits reads ?days=');
ok(/for \(let i = P - 1; i >= 0; i--\)/.test(body(proxy, 'visitsSummary')), 'the daily series is P days long');
ok(/period: visitWindow\(P\)/.test(proxy) && /period: visitWindow\(P, P\)/.test(proxy), 'the period tile has a previous-period reference');
ok(/envPeriod: visitEnvPeriod\(P\)/.test(proxy) && /musicPeriod: visitMusicPeriod\(P\)/.test(proxy), 'environment and music are sliced by the same period');

const rec = body(proxy, 'recordVisitEnv');
ok(/bucket\.ev\b/.test(rec) && /\['os', os\], \['br', br\], \['combo'/.test(rec), 'each ping also lands in a per-day environment dictionary');
ok(/_envRoom\(b, kv\[1\], kv\[0\]\)/.test(rec), 'with the same cardinality cap as the running totals');
ok(/seenBefore \? 'lgr' : 'lgn'/.test(rec), 'and the language × new/returning split is kept per day too');
const ep = body(proxy, 'visitEnvPeriod');
ok(/days: 0, lgDays: 0, lgnDays: 0/.test(ep), 'the period summary reports how many days each series really has, since they started at different times');

// -- Admin -----------------------------------------------------------------
ok(/<select id="trafPeriod"/.test(admin), 'the tab has a period selector');
ok(/<option value="14" selected>/.test(admin), 'defaulting to 14 days');
ok(/api\('\/admin\/visits\?days='\+_trafPeriod\)/.test(admin), 'which is sent with every load');
ok(/localStorage\.setItem\('pth_admin_period'/.test(admin), 'and remembered like the theme');
ok(/if\(P===7\|\|!per\)\{ P=30; per=d\.month; perPrev=pv\.month; \}/.test(admin), 'at 7 days the third tile shows 30 days instead of repeating "Last 7 days"');
const pick = body(admin, '_envPick');
ok(!!pick, 'admin has _envPick');
ok(/per\.days>0/.test(pick) && /per\.lgDays>0/.test(pick), 'a view uses the period only where its own per-day history exists — the running totals otherwise');
const line = body(admin, '_envSrcLine');
ok(/per-day history for this view starts with this proxy version/.test(line), 'and the header says when it fell back');
ok(/per-day history covers/.test(line), 'or when the history is shorter than the period');
ok(/document\.querySelectorAll\('\.perN'\)/.test(body(admin, '_paintPeriod')), 'the section texts quote the selected period instead of a hard-coded 30');
ok(!/over the last 30 days/.test(admin) && !/in the last 30 days, how many/.test(admin), 'no stale "last 30 days" left in the retention/hours texts');

console.log(fail ? `\n${fail}/${n} checks failed` : `\nall ${n} checks passed`);
process.exit(fail ? 1 : 0);
