#!/usr/bin/env node
// World map statistics (admin Traffic › World): server/geo-stats.js (time zone →
// country table, counting, merge), the real /__visit and /admin/geo routes of
// proxy.js (spawned on a scratch visits file: days window, sliding 24 h, a
// ping without tz is not counted, an unknown zone lands in ZZ), the client
// pings (tz sent with the visit and the mode pings), the map asset and the
// admin section wiring (Traffic › World).
// Run: node scripts/test-geo-stats.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const G = require(path.join(root, 'server', 'geo-stats.js'));
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

// ── time zone → country ──
ok(G.countryOfTz('Europe/Paris') === 'FR' && G.countryOfTz('Europe/Berlin') === 'DE' && G.countryOfTz('America/New_York') === 'US', 'common zones');
ok(G.countryOfTz('Asia/Calcutta') === 'IN' && G.countryOfTz('Europe/Kiev') === 'UA' && G.countryOfTz('Asia/Saigon') === 'VN', 'deprecated aliases browsers still report');
ok(G.countryOfTz('Europe/Amsterdam') === 'NL' && G.countryOfTz('Europe/Luxembourg') === 'LU' && G.countryOfTz('Europe/Zurich') === 'CH', 'zones merged in tzdb keep their own country');
ok(G.countryOfTz('UTC') === 'ZZ' && G.countryOfTz('Etc/GMT+3') === 'ZZ' && G.countryOfTz('Mars/Olympus') === 'ZZ', 'unmapped zones → ZZ');
ok(G.countryOfTz(null) === 'ZZ' && G.countryOfTz(7) === 'ZZ' && G.countryOfTz('') === 'ZZ' && G.countryOfTz('x'.repeat(65)) === 'ZZ', 'non-strings and oversize → ZZ');
ok(G.countryOfTz('__proto__') === 'ZZ' && G.countryOfTz('constructor') === 'ZZ' && G.countryOfTz('toString') === 'ZZ', 'prototype keys → ZZ');
const codes = G.knownCountries();
ok(codes.every((c) => /^[A-Z]{2}$/.test(c)) && codes.length < 260, 'bounded key set (' + codes.length + ' codes)');

// ── counting and merge ──
const g = {};
G.addVisit(g, 'FR', { nw: true, pwa: false, mob: true });
G.addVisit(g, 'FR', { nw: false, pwa: true, mob: false });
G.addMode(g, 'FR', 'pokerthnet'); G.addMode(g, 'FR', 'offline'); G.addMode(g, 'FR', 'offline');
G.addMode(g, 'DE', 'live'); G.addMode(g, 'DE', 'hack');
ok(g.FR.v === 2 && g.FR.nw === 1 && g.FR.pwa === 1 && g.FR.mob === 1, 'visit fields');
ok(g.FR.m.pokerthnet === 1 && g.FR.m.offline === 2 && g.DE.m.live === 1 && !g.DE.m.hack, 'mode counts, unknown mode ignored');
const sum = G.merge(G.merge({}, g), { FR: { v: 3, m: { lan: 1, bad: 9 } }, 'fr': { v: 1 }, __proto__x: { v: 1 } });
ok(sum.FR.v === 5 && sum.FR.m.lan === 1 && !sum.FR.m.bad && !sum.fr && !sum.__proto__x, 'merge copies only known codes, fields and modes');

// ── map asset ──
const map = JSON.parse(fs.readFileSync(path.join(root, 'public/vendor/world-110m.json'), 'utf8'));
const shapes = Object.keys(map.c || {});
ok(map.w > 0 && map.h > 0 && shapes.length > 150 && shapes.every((c) => /^[A-Z]{2}$/.test(c)), 'map asset: ' + shapes.length + ' ISO2 shapes');
ok(['FR', 'DE', 'US', 'BR', 'IN', 'CN', 'RU', 'AU'].every((c) => map.c[c] && /^M[\d\-.,LZM]+/.test(map.c[c])), 'major countries drawn as SVG paths');

// ── proxy routes ──
const VISITS = path.join(os.tmpdir(), 'pth-geo-' + process.pid + '.json');
try { fs.unlinkSync(VISITS); } catch (e) {}
const PORT = 18000 + Math.floor(Math.random() * 900);
const TOKEN = 'geo-test-' + process.pid;
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
  env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, STATS_ADMIN_TOKEN: TOKEN }),
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const post = (body, ua) => fetch(base + '/__visit', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, ua ? { 'User-Agent': ua } : {}), body: JSON.stringify(body) }).then((r) => r.status).catch(() => 0);
const geo = (q) => fetch(base + '/admin/geo?token=' + TOKEN + '&' + q).then((r) => r.json()).catch(() => null);
let up = false;
for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await fetch(base + '/admin/geo?token=' + TOKEN + '&days=7').then((r) => r.status).catch(() => 0)) === 200; }
try {
  ok(up, 'proxy up, /admin/geo answers');
  ok((await fetch(base + '/admin/geo?token=wrong').then((r) => r.status).catch(() => 0)) === 403, 'wrong token → 403');
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1';
  await post({ vid: 'a1', pwa: true, tz: 'Europe/Paris' }, IPHONE);
  await post({ vid: 'a2', tz: 'Europe/Paris' });
  await post({ vid: 'a2', tz: 'Europe/Paris' });
  await post({ vid: 'b1', tz: 'Europe/Berlin' });
  await post({ vid: 'c1', tz: 'Etc/GMT+3' });
  await post({ vid: 'old' });   // pre-web.28 client: no tz → not on the map
  await post({ mode: 'pokerthnet', vid: 'a1', tz: 'Europe/Paris' });
  await post({ mode: 'offline', vid: 'a2', tz: 'Europe/Paris' });
  await post({ mode: 'live', vid: 'b1', tz: 'Europe/Berlin' });
  await post({ mode: 'lan', vid: 'old' });
  await post({ mode: 'nope', vid: 'b1', tz: 'Europe/Berlin' });
  const d7 = await geo('days=7');
  const c = (d7 && d7.countries) || {};
  ok(d7 && d7.ok && d7.periodDays === 7 && d7.counted === 1 && d7.since > 0, 'days window: today counted, since set');
  ok(c.FR && c.FR.v === 3 && c.FR.nw === 2 && c.FR.pwa === 1 && c.FR.mob === 1, 'FR: 3 visits, 2 new devices, 1 PWA, 1 phone');
  ok(c.FR?.m?.pokerthnet === 1 && c.FR?.m?.offline === 1 && c.DE?.m?.live === 1 && c.DE?.v === 1, 'modes per country');
  ok(c.ZZ && c.ZZ.v === 1, 'unmapped zone counted as Unknown');
  const tot = Object.values(c).reduce((n, x) => n + (x.v || 0), 0);
  const totM = Object.values(c).reduce((n, x) => n + Object.values(x.m || {}).reduce((a, b) => a + b, 0), 0);
  ok(tot === 5 && totM === 3, 'pings without tz and unknown modes left out (5 visits, 3 mode connects)');
  const h = await geo('hours=24');
  ok(h && h.h24 === true && h.counted === 1 && h.countries.FR?.v === 3 && h.countries.DE?.m?.live === 1, 'sliding 24 h from the hourly cells');
  await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
  const v = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
  const day = Object.values(v.days || {})[0] || {};
  ok(day.geo && day.geo.FR?.v === 3 && day.geoH && Object.keys(day.geoH).length === 1, 'stored per day and per hour in visits.json');
  ok(v.geoSince > 0 && day.v === 6, 'traffic counter unchanged: the tz-less ping still counts as a visit');
} finally {
  proxy.kill('SIGTERM');
  if (!up) console.log(plog.slice(-2000));
  try { fs.unlinkSync(VISITS); } catch (e) {}
}

// ── client + admin wiring ──
const js = fs.readFileSync(path.join(root, 'public/pokerth.js'), 'utf8');
ok(/window\._pthTimeZone = function/.test(js) && /resolvedOptions\(\)\.timeZone/.test(js), 'client reads the browser time zone');
ok(/msg\.tz = tz/.test(js) && /cm\.tz = tz/.test(js), 'tz sent with the visit ping and the mode ping');
const admin = fs.readFileSync(path.join(root, 'public/admin.html'), 'utf8');
ok(/<button[^>]*data-ts="world"[^>]*>World</.test(admin) && /class="tsub" data-ts="world"/.test(admin) && /TRAF_SUBS=\[[^\]]*'world'/.test(admin), 'admin: Traffic › World section and its button');
ok(/loadGeo\(\);\s*api\('\/admin\/visits/.test(admin), 'admin: the World section follows the common period (loaded with the Traffic tab)');
ok(/\/admin\/geo\?/.test(admin) && /hours=24/.test(admin) && /vendor\/world-110m\.json/.test(admin), 'admin: reads /admin/geo (days and 24 h) and the map asset');
const priv = fs.readFileSync(path.join(root, 'public/privacy.html'), 'utf8');
ok(/time zone/i.test(priv), 'privacy page mentions the time zone');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
