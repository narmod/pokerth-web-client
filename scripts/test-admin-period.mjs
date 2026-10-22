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
ok(/visitsSummary\(query\.days, _h24, String\(query\.bots \|\| ''\) === '1', _h24 \? null : visitRange\(query\.from, query\.to\)\)/.test(proxy), 'GET /admin/visits reads ?days= (and ?hours=24, ?bots=1, ?from=&to=)');
ok(/for \(let i = E \+ P - 1; i >= E; i--\)/.test(body(proxy, 'visitsSummaryRead')), 'the daily series is P days long, ending E days back (0 without a custom range)');
ok(/period: h24 \? visitWindowList\(L\) : visitWindow\(P, E\)/.test(proxy) && /period: h24 \? visitWindowList\(visitList\(true, 24, 24\)\) : visitWindow\(P, E \+ P\)/.test(proxy), 'the period tile has a previous-period reference');
ok(/envPeriod: visitEnvPeriod\(P, L\)/.test(proxy) && /musicPeriod: visitMusicPeriod\(P, L\)/.test(proxy), 'environment and music are sliced by the same period');

const rec = body(proxy, 'recordVisitEnv');
ok(/bucket\.ev\b/.test(rec) && /\['os', os\], \['br', br\], \['combo'/.test(rec), 'each ping also lands in a per-day environment dictionary');
ok(/_envRoom\(b, kv\[1\], kv\[0\]\)/.test(rec), 'with the same cardinality cap as the running totals');
ok(/seenBefore \? 'lgr' : 'lgn'/.test(rec), 'and the language × new/returning split is kept per day too');
const ep = body(proxy, 'visitEnvPeriod');
ok(/days: 0, verDays: 0, lgDays: 0, lgnDays: 0/.test(ep), 'the period summary reports how many days each series really has, since they started at different times (versions: web.257)');

// -- Admin -----------------------------------------------------------------
ok(/<select id="trafPeriod"/.test(admin), 'the tab has a period selector');
ok(/<option value="14" selected>/.test(admin), 'defaulting to 14 days');
ok(/api\('\/admin\/visits\?'\+_perQuery\(\)\)/.test(admin) && /'days='\+_trafPeriod/.test(admin), 'which is sent with every load');
ok(/localStorage\.setItem\('pth_admin_period'/.test(admin), 'and remembered like the theme');
ok(/if\(\(P===7&&!d\.range\)\|\|!per\)\{ P=30; per=d\.month; perPrev=pv\.month; perCmp=fu\.month; perCov=cv\.month; \}/.test(admin), 'at 7 days the third tile shows 30 days instead of repeating "Last 7 days" (a custom range of 7 days stays itself)');
const pick = body(admin, '_envPick');
ok(!!pick, 'admin has _envPick');
ok(/per\.days>0/.test(pick) && /per\.lgDays>0/.test(pick), 'a view uses the period only where its own per-day history exists — the running totals otherwise');
const line = body(admin, '_envSrcLine');
ok(/per-day history for this view starts with this proxy version/.test(line), 'and the header says when it fell back');
ok(/per-'\+U\.one\+' history covers/.test(line), 'or when the history is shorter than the period');
ok(/document\.querySelectorAll\('\.perN'\)/.test(body(admin, '_paintPeriod')), 'the section texts quote the selected period instead of a hard-coded 30');
ok(!/over the last 30 days/.test(admin) && !/in the last 30 days, how many/.test(admin), 'no stale "last 30 days" left in the retention/hours texts');

// Edge cases say what they are (audit 2026-10-20, B5).
ok(/\(c\.window\|\|30\)===1\?' day':' days'/.test(admin), 'a one-day window reads « window 1 day »');
ok(/n<2 \? 'a single '\+U\.one\+': no halves to compare'/.test(admin) && /n<2\?'devices seen on an earlier '\+U\.one\+' \\u00b7 a single '\+U\.one\+': no halves to compare':'devices seen on an earlier '\+U\.one\+' \\u00b7 first half '/.test(admin)
  && /\(n===1\?U\.one:U\.many\)/.test(admin), 'a single day or hour has no halves to compare, and no plural');
ok(/var need=d\.periodEnd\?8:9;/.test(body(admin, '_tsAudience')) && /var why=d\.h24\?'needs whole days':\(!C\.newTotal\?'no new device in the window':\(\(d\.periodDays\|\|0\)<need\?'needs a window of '\+need\+' days or more':'too recent to tell'\)\);/.test(body(admin, '_tsAudience')),
  'Back within 7 days says why there is no rate, not « too recent » for an old empty window');
ok(/\(d\.h24\?' \\u00b7 server time, ':' \\u00b7 server days, '\)\+d\.tz/.test(admin), 'the 24-hour window reads server time, not server days');
// One date format across Statistics: « 7 Oct 2026 » (audit 2026-10-20, S6).
{
  const whole = n => { const h = admin.indexOf('function ' + n + '('); const b = body(admin, n); return b ? admin.slice(h, admin.indexOf(b, h) + b.length) : ''; };
  const f = new Function(admin.match(/var ST_MON=\[[^\]]+\];/)[0] + whole('_stDate') + whole('_sFull') + whole('_dayLab') + '\nreturn { _stDate, _sFull, _dayLab };')();
  ok(f._stDate('2026-09-05') === '5 Sep 2026' && f._stDate('2026-10-07') === '7 Oct 2026', 'a day key reads « 5 Sep 2026 » (three-letter months, not « Sept »)');
  ok(f._stDate(new Date(2026, 9, 7, 14, 5).getTime(), true) === '7 Oct 2026, 14:05', 'a timestamp, with its time when asked');
  ok(f._sFull({ date: '2026-10-19T18' }) === '19 Oct 2026 18:00' && f._sFull({ date: '2026-10-07' }) === '7 Oct 2026', 'the date line of the filters bar uses it');
  ok(f._dayLab('2026-09-05', true) === '5 Sep 2026' && f._dayLab('2026-09-05') === '5 Sep', 'custom ranges name months the same way');
  ok(/'all time since '\+_stDate\(_guideSince\)/.test(admin) && /'all time since '\+_stDate\(_musSince\)/.test(admin) && /\(' · since '\+_stDate\(d\.since\)\)/.test(admin)
    && /'since '\+_stDate\(_envLangDiagSince\)/.test(admin) && /\(' since '\+_stDate\(_musVotesSince\)\)/.test(admin) && /' Counted since '\+_stDate\(since\)/.test(admin)
    && /hourly counting started '\+_stDate\(d\.modeHourSince,true\)/.test(admin) && /return _stDate\(ts\);/.test(admin),
    'every Statistics « since » uses it, none the numeric browser locale (9/5/2026)');
  ok(/_chartMount\(nb,sAll\.map\(_sFull\),/.test(admin) && /the earliest on '\+_annEsc\(_stDate\(c\.first\)\)/.test(admin), 'nor a raw day key in a readout or a note');
}
console.log(fail ? `\n${fail}/${n} checks failed` : `\nall ${n} checks passed`);
process.exit(fail ? 1 : 0);
