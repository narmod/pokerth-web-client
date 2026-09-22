#!/usr/bin/env node
// Deterministic guards for the per-language trend arrow in "Who visits".
// Run: node scripts/test-admin-lang-trend.mjs
//
// The arrow answers "is this language gaining ground?", so it compares the
// language's SHARE of pings, not its raw count, over two full 14-day windows.
// It is only drawn when the change is statistically significant; otherwise
// it says "stable", and with too little data it says nothing at all.
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

// -- Proxy: two full windows, ending yesterday ------------------------------
const lt = body(proxy, 'visitLangTrend');
ok(!!lt, 'proxy exposes visitLangTrend');
ok(/sumWin\(1\)/.test(lt) && /sumWin\(1 \+ win\)/.test(lt), 'current window ends yesterday (today is partial), previous window sits right before it');
ok(/curDays/.test(lt) && /prevDays/.test(lt), 'it reports how many days of each window actually carry a language series');
ok(/langTrend: visitLangTrend\(14\)/.test(proxy), 'and the traffic payload carries it as langTrend over 14 days');

// -- Admin: the statistic itself -------------------------------------------
const statSrc = body(admin, '_langTrendStat');
ok(!!statSrc, 'admin has _langTrendStat');
const stat = new Function('a', 'T1', 'b', 'T2', statSrc.slice(1, -1));
ok(stat(3, 100, 4, 100) === null, 'fewer than 10 pings in total: no verdict');
ok(stat(20, 100, 20, 0) === null, 'an empty window: no verdict rather than a division by zero');
let s = stat(150, 1000, 100, 1000);
ok(s && s.dir === 'up' && s.z > 1.96, '15% vs 10% share on a thousand pings each is a significant rise (' + s.z.toFixed(2) + 'σ)');
s = stat(100, 1000, 150, 1000);
ok(s && s.dir === 'down', 'and the reverse is a significant fall');
s = stat(102, 1000, 100, 1000);
ok(s && s.dir === 'flat', '10.2% vs 10.0% is within noise: stable');
s = stat(12, 100, 6, 100);
ok(s && s.dir === 'flat', 'a doubling on tiny volumes (6 -> 12 pings) is still not significant, so no arrow is claimed');
s = stat(300, 2000, 300, 1000);
ok(s && s.dir === 'down' && Math.round(s.rel * 100) === -50, 'same raw count with double the traffic is a share halved (rel ' + Math.round(s.rel * 100) + '%) — the arrow reads share, not volume');

// -- Admin: how the badge uses it -------------------------------------------
const badge = body(admin, '_envTrendBadge');
ok(!!badge, 'admin has _envTrendBadge');
ok(/_envView!=='lang'/.test(badge), 'the badge only exists in the Language view');
ok(/curDays\|\|0\)<w \|\| \(t\.prevDays\|\|0\)<w/.test(badge), 'nothing is drawn until both windows are full');
ok(/t\.curN-oc/.test(badge) && /t\.prevN-op/.test(badge), 'real languages are measured against pings that have a usable language (bots without a header do not dilute them)');
ok(/key==='other'\? t\.curN/.test(badge), 'the "No language header" row keeps its share of all pings');
ok(/_envTrendBadge\(s\.key\)/.test(body(admin, 'renderEnv')), 'and renderEnv appends it at the end of each row');
ok(/\.envrow \.trend\.up\{color:#5ec269\}/.test(admin) && /\.envrow \.trend\.down\{color:#e26d6d\}/.test(admin), 'up is green, down is red');

console.log(fail ? `\n${fail}/${n} checks failed` : `\nall ${n} checks passed`);
process.exit(fail ? 1 : 0);
