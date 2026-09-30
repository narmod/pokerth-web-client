#!/usr/bin/env node
// Ace's Help — anonymous statistics (L3): server/guide-stats.js (validation,
// counting, period sums, the admin summary), the real /__guide route of
// proxy.js (spawned on a scratch visits file: 204 when counted, 400 for an
// unknown context or event, 405 for GET, nothing stored for a refused pair),
// the client beacons (queue offline, no visitor id, « do not count my
// visits » respected) and the admin card wiring.
// Run: node scripts/test-guide-admin.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const G = require(path.join(root, 'server', 'guide-stats.js'));
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

// ── validation ──
ok(G.valid('lobby-ranking', 'join') && G.valid('offer', 'accepted') && G.valid('lobby-guest', 'guest_redirect'), 'known pairs accepted');
ok(!G.valid('lobby-ranking', 'guest_redirect'), 'an event of another context is refused');
ok(!G.valid('nope', 'shown') && !G.valid('lobby-ranking', 'nope'), 'unknown context / event refused');
ok(!G.valid('__proto__', 'shown') && !G.valid('constructor', 'shown') && !G.valid('toString', 'shown'), 'prototype keys refused');
ok(!G.valid(null, 'shown') && !G.valid('offer', 7) && !G.valid(['offer'], 'offered'), 'non-strings refused');
const pairs = Object.keys(G.EVENTS).reduce((n, k) => n + G.EVENTS[k].length, 0);
ok(pairs <= 80, 'bounded key set (' + pairs + ' pairs)');
const contexts = (await import(path.join(root, 'public/modules/guide/contexts/index.mjs'))).CONTEXTS.map((c) => c.id);
ok(contexts.every((id) => G.EVENTS[id]), 'every shipped context can be counted');

// ── counting, periods, summary ──
const store = {}, days = [{}, {}, {}];
const rec = (d, c, e) => G.record(store, days[d], c, e, 1000);
ok(rec(0, 'offer', 'offered') && rec(0, 'offer', 'accepted') && rec(1, 'offer', 'offered') && rec(1, 'offer', 'dismissed'), 'events recorded');
ok(!rec(0, 'offer', 'hack') && !store.guide.offer.hack && !days[0].gd['offer.hack'], 'a refused pair stores nothing');
for (let i = 0; i < 10; i++) rec(i % 3, 'lobby-ranking', 'shown');
for (let i = 0; i < 4; i++) rec(0, 'lobby-ranking', 'join');
rec(0, 'lobby-ranking', 'started'); rec(2, 'lobby-ranking', 'started');
rec(2, 'lobby-guest', 'shown'); rec(2, 'lobby-guest', 'guest_redirect');
ok(store.guide.offer.offered === 2 && store.guideSince === 1000, 'all-time totals and first date');
const S = G.summary(store.guide);
ok(S.acceptance.offered === 2 && S.acceptance.accepted === 1 && S.acceptance.declined === 1 && S.acceptance.rate === 0.5, 'acceptance 1 of 2 (50 %)');
ok(S.funnel.highlighted === 10 && S.funnel.joined === 4 && S.funnel.started === 2, 'funnel highlighted → joined → started');
ok(S.funnel.joinRate === 0.4 && S.funnel.startRate === 0.5, 'funnel rates');
ok(S.guests.shown === 1 && S.guests.redirect === 1, 'guests counted apart');
ok(S.contexts['lobby-ranking'].shown === 10 && !S.contexts.offer, 'per-context table (offer apart)');
ok(G.summary({}).acceptance.rate === null && G.summary(null).funnel.joinRate === null, 'no data → no invented rate');
const P1 = G.period(1, (i) => days[i]), P3 = G.period(3, (i) => days[i]);
ok(P1.days === 1 && P1.guide.offer.offered === 1 && !P1.guide.offer.dismissed, 'period of 1 day');
ok(P3.days === 3 && P3.guide['lobby-ranking'].shown === 10, 'period of 3 days = all');
ok(G.period(2, (i) => (i === 0 ? { gd: { 'x.y': 5, 'offer.offered': 2 } } : null)).guide.x === undefined, 'stray keys in a stored bucket are ignored');

// ── the real route ──
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-'));
const VISITS = path.join(tmp, 'visits.json');
const PORT = 18000 + Math.floor(Math.random() * 900);
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
  env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, ADMIN_ENABLED: '0' }),
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const post = (body, raw) => fetch(base + '/__guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw ? body : JSON.stringify(body) }).then((r) => r.status).catch(() => 0);
let up = false;
for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await post({ ctx: 'offer', ev: 'offered' })) === 204; }
try {
  ok(up, 'proxy up, a valid event → 204');
  ok((await post({ ctx: 'lobby-ranking', ev: 'join' })) === 204, 'join → 204');
  ok((await post({ ctx: 'nope', ev: 'shown' })) === 400, 'unknown context → 400');
  ok((await post({ ctx: 'lobby-ranking', ev: 'nope' })) === 400, 'unknown event → 400');
  ok((await post({ ctx: '__proto__', ev: 'shown' })) === 400, 'prototype key → 400');
  ok((await post('not json', true)) === 400, 'garbage body → 400');
  ok((await fetch(base + '/__guide').then((r) => r.status).catch(() => 0)) === 405, 'GET → 405');
  await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
  const v = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
  ok(v.guide && v.guide.offer.offered === 1 && v.guide['lobby-ranking'].join === 1, 'stored in visits.json');
  ok(!v.guide.nope && !(v.guide['lobby-ranking'] || {}).nope && !Object.prototype.hasOwnProperty.call(v.guide, '__proto__'), 'refused pairs left no key');
  const day = Object.values(v.days || {})[0] || {};
  ok(day.gd && day.gd['offer.offered'] === 1, 'per-day series in the visit bucket');
} finally {
  proxy.kill('SIGTERM');
  if (!up) console.log(plog.slice(-2000));
}

// ── client + admin wiring ──
const beacons = fs.readFileSync(path.join(root, 'public/modules/guide/beacons.mjs'), 'utf8');
ok(/fetch\('\/__guide'/.test(beacons) && /JSON\.stringify\(\{ ctx, ev \}\)/.test(beacons), 'the client posts { ctx, ev } only');
ok(!/vid|sessionId|myName|myId|gId/.test(beacons), 'no visitor id, name or table travels');
ok(/pth_no_count/.test(beacons), '« Do not count my visits » respected');
ok(/MAX_QUEUE = 50/.test(beacons) && /addEventListener\('online'/.test(beacons), 'bounded offline queue, flushed when back online');
const idx = fs.readFileSync(path.join(root, 'public/modules/guide/index.mjs'), 'utf8');
for (const [c, e] of [['offer', 'offered'], ['offer', 'accepted'], ['offer', 'dismissed'], ['lobby-ranking', 'started'], ['wait-ranking', 'started']]) {
  ok(idx.includes(`beacon('${c}', '${e}')`), `client sends ${c}.${e}`);
}
ok(/beacon\(ctx\.id, 'shown'\)/.test(idx) && /beacon\(cid, 'done'\)/.test(idx) && /beacon\(cid, 'dismissed'\)/.test(idx), 'client sends shown / done / dismissed');
ok(/join: 'join', createRanking: 'create', signup: 'signup'/.test(idx) && /cid === 'lobby-guest' \? 'guest_redirect'/.test(idx), 'actions mapped to join / create / signup (guest_redirect for a guest in the lobby)');
const proxySrc = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
ok(/guide: \{\}, guideSince: 0/.test(proxySrc), 'the counters are part of the empty store (reset clears them)');
ok(/guidePeriod:/.test(proxySrc) && /guide: GUIDE_STATS\.summary/.test(proxySrc), 'the traffic summary carries all-time and period figures');
const route = proxySrc.slice(proxySrc.indexOf("reqPathOnly === '/__guide'"), proxySrc.indexOf("reqPathOnly === '/__guide'") + 800);
ok(!/clientIp|x-forwarded-for|remoteAddress/.test(route), 'the route never reads the caller address');
const admin = fs.readFileSync(path.join(root, 'public/admin.html'), 'utf8');
ok(/id="trafGuide"/.test(admin) && /function renderGuide\(\)/.test(admin), 'admin card present');
ok(/Ranking funnel/.test(admin) && /Game started \(10\/10\)/.test(admin), 'the funnel is shown');
ok(/predates the feature/.test(admin.slice(admin.indexOf('function renderGuide'))), 'an old proxy says so instead of showing zeros');
ok(fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8').includes("'/modules/guide/beacons.mjs'"), 'beacons precached (offline queue works offline)');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
