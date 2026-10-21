#!/usr/bin/env node
// Deterministic guards for server/ua-hints.js (2.1.10-web.257): the Client
// Hints that refine a « Chrome » read from the User-Agent, and the major
// versions (iOS 18, Chrome 141…) kept per day for Admin › Visitors.
// Run: node scripts/test-ua-hints.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { freePort } from './lib/free-port.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const H = require(join(root, 'server', 'ua-hints.js'));
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// -- Client Hints: brands ---------------------------------------------------
const BRAVE = '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"';
const CHROME = '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"';
ok(H.brands(BRAVE).join('|') === 'Brave|Not?A_Brand|Chromium', 'the brand list is read in order');
ok(H.refineBrowser('Chrome', BRAVE) === 'Brave', 'Brave, whose UA is Chrome\'s, is told apart by its brand');
ok(H.refineBrowser('Chrome', CHROME) === 'Chrome', 'Google Chrome stays Chrome (GREASE and Chromium ignored)');
ok(H.refineBrowser('Chrome', '"Opera GX";v="124", "Chromium";v="139"') === 'Opera', 'Opera GX → Opera');
ok(H.refineBrowser('Chrome', '"Microsoft Edge";v="141", "Chromium";v="141"') === 'Edge', 'Edge brand → Edge');
ok(H.refineBrowser('Chrome', '"Android WebView";v="141", "Chromium";v="141"') === 'WebView', 'Android WebView brand → WebView');
ok(H.refineBrowser('In-app', BRAVE) === 'In-app' && H.refineBrowser('Samsung', BRAVE) === 'Samsung',
  'a UA label that is already specific is kept');
ok(H.refineBrowser('Chrome', undefined) === 'Chrome' && H.refineBrowser('Chrome', '') === 'Chrome', 'no header: the UA label stands');
ok(H.refineBrowser('Chrome', '"Brave";v="1",'.repeat(60)) === 'Chrome', 'an oversized header is ignored');
ok(H.refineBrowser('Chrome', '<script>"Brave"</script>') === 'Chrome', 'a header that is not a brand list names nothing');
ok(H.brands('"a";v="1",'.repeat(40)).length <= 12, 'at most 12 brands are read');

// -- Client Hints: platform -------------------------------------------------
ok(H.refineOs('other', '"Windows"') === 'Windows' && H.refineOs('other', '"Chrome OS"') === 'ChromeOS', 'the platform fills an OS the UA left at « other »');
ok(H.refineOs('Linux', '"Android"') === 'Linux', 'and never overrides one the UA gave');
ok(H.refineOs('other', '"Plan 9"') === 'other' && H.refineOs('other', undefined) === 'other', 'an unknown or missing platform changes nothing');

// -- Major versions ----------------------------------------------------------
function v(ua, os, br, osv, brv) {
  const r = H.versions(ua, os, br);
  ok(r.osv === osv && r.brv === brv, `${os} · ${br} → ${r.osv} / ${r.brv}` + (r.osv === osv && r.brv === brv ? '' : `  (want ${osv} / ${brv})`));
}
v('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  'iPhone', 'Safari', 'iOS 17', 'Safari 17');
v('Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  'iPhone', 'Safari', 'iOS 26', 'Safari 26');
v('Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  'iPad', 'Safari', 'iOS 16', 'Safari 16');
v('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1',
  'iPhone', 'Chrome', 'iOS 17', 'Chrome 141');
v('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
  'Android', 'Chrome', null, 'Chrome 141');
v('Mozilla/5.0 (Android 14; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0',
  'Android', 'Firefox', 'Android 14', 'Firefox 143');
v('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
  'Android', 'Samsung', 'Android 13', 'Samsung 28');
v('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
  'Windows', 'Edge', null, 'Edge 141');
v('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15',
  'macOS', 'Safari', null, 'Safari 18');
v('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/124.0.0.0',
  'Windows', 'Opera', null, 'Opera 124');
v('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Windows', 'Brave', null, 'Brave 141');
v('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.38.108]',
  'iPhone', 'In-app', 'iOS 17', null);
v('', 'other', 'other', null, null);

// -- Wiring ------------------------------------------------------------------
ok(/const UA_HINTS = require\('\.\/server\/ua-hints\.js'\)/.test(proxy), 'proxy.js loads the module');
ok(/brands: req\.headers\['sec-ch-ua'\], platform: req\.headers\['sec-ch-ua-platform'\]/.test(proxy), 'the /__visit handler passes the two hint headers');
ok(/\['osv', ver\.osv \|\| 'unknown'\], \['brv', ver\.brv \|\| 'unknown'\]/.test(proxy), 'versions go to the per-day maps');
ok(!/_envBump\('osv'|_envBump\('brv'/.test(proxy), 'and never to a running total that only grows');
ok(/data-k="osv"/.test(admin) && /data-k="brv"/.test(admin), 'the admin has a System version and a Browser version view');

// -- End to end: a real proxy, real beacons -----------------------------------
{
  const fs = await import('node:fs'), os = await import('node:os'), http = await import('node:http');
  const { spawn } = await import('node:child_process');
  const tmp = fs.mkdtempSync(join(os.tmpdir(), 'uahints-'));
  const VISITS = join(tmp, 'visits.json');
  const PORT = await freePort(), TOKEN = 'ua-hints-test';
  const proxyP = spawn(process.execPath, [join(root, 'proxy.js')], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, ADMIN_ENABLED: '1', STATS_ADMIN_TOKEN: TOKEN }),
  });
  proxyP.stdout.on('data', () => {}); proxyP.stderr.on('data', () => {});
  function beacon(vid, headers) {
    return new Promise((res) => {
      const body = JSON.stringify({ vid, pwa: false });
      const r = http.request({ host: '127.0.0.1', port: PORT, path: '/__visit', method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, headers) },
        (x) => { x.resume(); res(x.statusCode); });
      r.on('error', () => res(0)); r.end(body);
    });
  }
  let up = false;
  for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await beacon('', { 'User-Agent': 'probe' })) === 204; }
  try {
    ok(up, 'proxy up, beacon → 204');
    const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
    const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    await beacon('b1', { 'User-Agent': WIN, 'Sec-CH-UA': BRAVE, 'Sec-CH-UA-Platform': '"Windows"', 'Sec-CH-UA-Mobile': '?0' });
    await beacon('b2', { 'User-Agent': WIN, 'Sec-CH-UA': CHROME, 'Sec-CH-UA-Platform': '"Windows"' });
    await beacon('b3', { 'User-Agent': IOS });
    await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
    const st = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
    const e = st.env || {};
    ok(e.br && e.br.Brave === 1 && e.br.Chrome === 1, 'running totals: Brave and Chrome counted apart');
    ok(e.combo && e.combo['Windows · Brave'] === 1, 'and so is the device + browser cross');
    ok(!('osv' in e) && !('brv' in e), 'no running total for versions');
    const day = Object.values(st.days || {}).find((b) => b && b.ev && b.ev.brv) || {};
    ok(day.ev && day.ev.brv['Brave 141'] === 1 && day.ev.brv['Chrome 141'] === 1 && day.ev.brv['Safari 17'] === 1, 'the day keeps the browser majors');
    ok(day.ev && day.ev.osv['iOS 17'] === 1 && day.ev.osv.unknown === 3, 'and the OS majors (two Windows and the start-up probe: unknown)');
    const ex = await fetch('http://127.0.0.1:' + PORT + '/admin/visits/export?fmt=json&token=' + TOKEN).then((r) => r.json());
    const P = (ex.summary || {}).envPeriod || {};
    ok(P.verDays === 1 && P.brv['Brave 141'] === 1 && P.osv['iOS 17'] === 1, 'envPeriod carries osv / brv and the days that have them');
  } finally {
    proxyP.kill();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
