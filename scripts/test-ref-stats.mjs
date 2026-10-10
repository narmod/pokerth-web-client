#!/usr/bin/env node
// Deterministic guards for "Where visitors come from" (server/ref-stats.js):
// classification, caps, period sums, the proxy wiring and an end-to-end run.
// Run: node scripts/test-ref-stats.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const R = require(join(root, 'server', 'ref-stats.js'));
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const html = readFileSync(join(root, 'public', 'pokerth-client.html'), 'utf8');
const app = readFileSync(join(root, 'public', 'pokerth.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const is = (d, want) => { const got = R.classify(d); ok(got === want, JSON.stringify(d) + ' → ' + want + (got === want ? '' : '  (got ' + got + ')')); };

// -- Classification: one key per visit, first match wins --------------------
is({}, '(direct)');
is(null, '(direct)');
is({ ref: 'www.google.com' }, 'google.com');
is({ ref: 'WWW.Google.COM.' }, 'google.com');
is({ ref: 'm.facebook.com' }, 'facebook.com');
is({ ref: 'l.facebook.com' }, 'facebook.com');
is({ ref: 'lm.facebook.com' }, 'facebook.com');
is({ ref: 'm.me' }, 'm.me');
is({ ref: 'com.tencent.mm' }, 'com.tencent.mm');
is({ ref: 'www.baidu.com' }, 'baidu.com');
is({ ref: 'forum.pokerth.net' }, 'forum.pokerth.net');
is({ ref: 'localhost' }, '(overflow)');
is({ ref: 'evil.com/path?q=1' }, '(overflow)');
is({ ref: 'x'.repeat(90) + '.com' }, '(overflow)');
is({ src: 'Reddit' }, 'utm:reddit');
is({ src: '  Forum Post!! ', ref: 'reddit.com' }, 'utm:forum-post');
is({ src: '!!!', ref: 'reddit.com' }, 'reddit.com');
is({ inv: true }, '(invite)');
is({ inv: true, ref: 'web.whatsapp.com' }, 'web.whatsapp.com');
is({ self: '/rules' }, 'site:/rules');
is({ self: '/glossary/flop' }, 'site:/glossary');
is({ self: '/' }, 'site:/');
is({ self: '/<script>' }, '(overflow)');
is({ lang: true }, '(lang link)');
is({ inv: true, lang: true }, '(invite)');
is({ inv: 'yes' }, '(direct)');
ok(R.classify({ src: 'a'.repeat(100) }) === 'utm:' + 'a'.repeat(32), 'utm tag cut at 32 characters');

// -- Recording: per day, new visitors apart, source x language --------------
{
  const store = {}, b = {};
  R.record(store, b, 'google.com', true, 'zh', 1000);
  R.record(store, b, 'google.com', false, 'zh', 2000);
  R.record(store, b, 'google.com', null, 'zh', 3000);
  R.record(store, b, '(lang link)', true, 'vi', 4000);
  R.record(store, b, '(direct)', true, 'X!', 5000);
  ok(b.sr['google.com'] === 3 && b.srn['google.com'] === 1, 'sr counts every visit, srn the new ones only');
  ok(b.srl['google.com zh'] === 1 && b.srl['(lang link) vi'] === 1 && b.srl['(direct) other'] === 1, 'srl: source × language for new visitors, junk language → other');
  ok(store.refSince === 1000, 'refSince keeps the first ping');
  ok(R.record(store, null, 'x', true, 'en') === false && R.record(store, b, '', true, 'en') === false, 'no bucket or no key: nothing recorded');
}
{
  const b = {};
  for (let i = 0; i < R.CAP_DAY + 15; i++) R.record(null, b, 'site' + i + '.com', true, 'en');
  ok(Object.keys(b.sr).length === R.CAP_DAY + 1 && b.sr['(overflow)'] === 15, 'daily cap: past ' + R.CAP_DAY + ' sources, new keys land in (overflow)');
  ok(b.srl['(overflow) en'] === 15, 'and their language pairs follow them into (overflow)');
  R.record(null, b, 'site0.com', true, 'en');
  ok(b.sr['site0.com'] === 2, 'a known source keeps counting past the cap');
}

// -- Period: sums the days that carry the series ----------------------------
{
  const days = [{ sr: { a: 2, '(lang link)': 1 }, srn: { a: 1, '(lang link)': 1 }, srl: { 'a zh': 1, '(lang link) vi': 1 } }, null, { v: 3 }, { sr: { a: 1 }, srn: { a: 1 }, srl: { 'a zh': 1 } }];
  const p = R.period(5, (i) => days[i] || null);
  ok(p.days === 2, 'days counts only the buckets with a series');
  ok(p.all.a === 3 && p.nw.a === 2 && p.lang.a.zh === 2, 'all / new / languages are summed');
  ok(p.lang['(lang link)'].vi === 1, 'a source key with a space splits on the LAST space');
}

// -- Wiring ------------------------------------------------------------------
ok(/require\('\.\/server\/ref-stats\.js'\)/.test(proxy), 'proxy loads server/ref-stats.js');
ok(/recordVisitSource\(d, req\.headers && req\.headers\['accept-language'\], _seenBefore\)/.test(proxy), 'the /__visit handler records the source with the same new/returning verdict');
ok(/srcPeriod: visitSourcePeriod\(P\)/.test(proxy), 'the summary slices sources by the selected period');
ok(/refSince: 0/.test(proxy.slice(proxy.indexOf('function emptyVisitsStore'), proxy.indexOf('function emptyVisitsStore') + 600)), 'a full reset clears refSince too');
const cap = html.indexOf('window.__pthLanding = L'), pal = html.indexOf('Palette : appliquer le th');
ok(cap > 0 && cap < pal && html.indexOf('window.__pthErrQ') < cap, 'the landing is read in the head, right after the error collector, before any module');
ok(!/L\.ref = [^;]*pathname/.test(html) && /L\.ref = String\(u\.hostname/.test(html), 'only the referrer host name leaves the page, never its path');
ok(/window\.__pthLanding \|\| \{\}/.test(app) && /if \(!window\.LIVE_MODE\)/.test(app), 'pokerth.js adds the landing to the visit ping, not to /live pings');
ok(/id="trafSrc"/.test(admin) && /function renderSrc\(\)/.test(admin) && /_srcData=d\.srcPeriod/.test(admin), 'the admin page renders the sources card');
ok(/_annEsc\(k\.slice\(4\)\)/.test(admin) && /return _annEsc\(k\);/.test(admin), 'source keys come from the client and are escaped before display');

// -- End to end: a real proxy and real beacons -------------------------------
{
  const fs = await import('node:fs'), os = await import('node:os'), http = await import('node:http');
  const { spawn } = await import('node:child_process');
  const tmp = fs.mkdtempSync(join(os.tmpdir(), 'refstats-'));
  const VISITS = join(tmp, 'visits.json');
  const d = new Date(), today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const PORT = 18990 + Math.floor(Math.random() * 90), TOKEN = 'ref-stats-test';
  const proxyP = spawn(process.execPath, [join(root, 'proxy.js')], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN }),
  });
  proxyP.stdout.on('data', () => {}); proxyP.stderr.on('data', () => {});
  function beacon(body, lang) {
    return new Promise((res) => {
      const s = JSON.stringify(body);
      const r = http.request({ host: '127.0.0.1', port: PORT, path: '/__visit', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(s), 'Accept-Language': lang || 'en-US' } },
        (x) => { x.resume(); res(x.statusCode); });
      r.on('error', () => res(0)); r.end(s);
    });
  }
  let up = false;
  for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await beacon({ mode: 'nope' })) === 204; }
  try {
    ok(up, 'proxy up, beacon → 204');
    await beacon({ vid: 'z1', pwa: false, ref: 'www.baidu.com' }, 'zh-CN,zh;q=0.9');
    await beacon({ vid: 'z2', pwa: false, ref: 'www.baidu.com' }, 'zh-CN');
    await beacon({ vid: 'z1', pwa: false, ref: 'www.baidu.com' }, 'zh-CN');
    await beacon({ vid: 'v1', pwa: false, lang: true }, 'vi-VN');
    await beacon({ vid: 'e1', pwa: false, inv: true }, 'en-US');
    await beacon({ vid: 'e2', pwa: false }, 'en-US');
    await beacon({ vid: 'L1', live: true, ref: 'pokerth.net' }, 'en-US');
    await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
    const v = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
    const b = (v.days || {})[today] || {};
    ok(b.sr && b.sr['baidu.com'] === 3 && b.sr['(lang link)'] === 1 && b.sr['(invite)'] === 1 && b.sr['(direct)'] === 1, 'stored per day: baidu ×3, lang link, invite, direct');
    ok(b.srn['baidu.com'] === 2 && b.srl['baidu.com zh'] === 2 && b.srl['(lang link) vi'] === 1, 'new visitors and their language: z1 came back, counted new once');
    ok(!('pokerth.net' in b.sr), '/live pings are not counted as web-client sources');
    ok(v.refSince > 1000, 'refSince recorded');
    const ex = await fetch('http://127.0.0.1:' + PORT + '/admin/visits/export?fmt=json&token=' + TOKEN).then((r) => r.json());
    const S = (ex.summary || {}).srcPeriod || {};
    ok(S.days === 1 && S.all['baidu.com'] === 3 && S.nw['baidu.com'] === 2 && S.lang['baidu.com'].zh === 2, 'summary.srcPeriod in the export');
    ok(ex.store.days[today].sr['baidu.com'] === 3, 'and the raw per-day maps in store');
  } finally {
    proxyP.kill();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
