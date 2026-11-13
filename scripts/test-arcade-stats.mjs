#!/usr/bin/env node
// The Mini-games mode's statistics (web.25, design note
// claude/CONCEPTION_MODE_ARCADE.md): server/arcade-stats.js (closed list of
// events, counting, period sums, the admin summary), the real /__arcade route
// of proxy.js, the « arcade » mode in the session counts, and the client wiring.
import fs from 'fs';
import os from 'os';
import path from 'path';
import net from 'net';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const freePort = () => new Promise((r) => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });

console.log('test-arcade-stats');
const A = require(path.join(root, 'server/arcade-stats.js'));
const reg = await import(path.join(root, 'public/modules/games/index.mjs'));
const ids = reg.GAMES.filter((g) => g.id !== reg.HOME).map((g) => g.id);
ok(A.GAMES.join(',') === ids.join(','), 'the server knows the games in the path\'s order (' + A.GAMES.length + ')');
ok(A.EVENTS.length === 7 + 10 + 20 + 2 && A.valid('reveal_10') && A.valid('open_poker-run') && A.valid('end_whowins') && A.valid('train_on'),
  'a closed list: funnel, reveal_1…10, open_ / end_ per game, train_on / train_off');
ok(!A.valid('reveal_11') && !A.valid('open_nope') && !A.valid('__proto__') && !A.valid(42) && !A.valid(''), 'anything else is refused');
const store = {}, days = [{}, {}, {}];
const rec = (i, ev) => A.record(store, days[i], ev, 1000);
['unlock_trophies', 'unlock_trophies', 'unlock_word', 'celebrated', 'celebrated', 'celebrate_play', 'menu_open', 'reveal_1', 'reveal_1', 'reveal_2', 'open_whowins', 'end_whowins', 'end_whowins', 'train_on'].forEach((e) => rec(0, e));
rec(1, 'train_off'); rec(2, 'train_off'); rec(2, 'nope');
ok(store.arcade.unlock_trophies === 2 && store.arcadeSince === 1000 && !store.arcade.nope, 'all-time counts, a start date, nothing for a refused event');
ok(days[0].ar.reveal_1 === 2 && days[2].ar.train_off === 1 && !days[2].ar.nope, 'per-day counts (bucket.ar)');
const S = A.summary(store.arcade);
ok(S.unlocked === 3 && S.funnel.celebrated === 2 && S.playRate === 0.5, 'summary: unlocked (trophies + word), funnel, « Play now » rate');
ok(S.reveals.length === 10 && S.reveals[0] === 2 && S.reveals[1] === 1 && S.reveals[9] === 0, 'summary: how far players get, game by game');
ok(S.games[0].id === 'whowins' && S.games[0].open === 1 && S.games[0].end === 2 && S.training.on === 1 && S.training.off === 2, 'summary: games opened / ended, training games with / without the mode');
ok(A.summary(null).playRate === null && A.summary({}).unlocked === 0, 'no data → no invented rate');
const P1 = A.period(1, (i) => days[i]), P3 = A.period(3, (i) => days[i]);
ok(P1.days === 1 && P1.arcade.menu_open === 1 && !P1.arcade.train_off && P3.days === 3 && P3.arcade.train_off === 2, 'period sums');
ok(A.period(1, () => ({ ar: { nope: 5, reveal_1: 1 } })).arcade.nope === undefined, 'stray keys in a stored bucket are ignored');
const cube = require(path.join(root, 'server/cube-stats.js')), geo = require(path.join(root, 'server/geo-stats.js'));
ok(cube.MODES.includes('arcade') && cube.clean('mode', 'arcade') === 'arcade' && geo.MODES.includes('arcade'), 'the « arcade » mode in the session cube and the world map');

// ── the real route ──
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arcade-'));
const VISITS = path.join(tmp, 'visits.json');
const PORT = await freePort();
const proxy = spawn(process.execPath, [path.join(root, 'proxy.js')], {
  cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
  env: Object.assign({}, process.env, { PORT: String(PORT), VISITS_FILE: VISITS, ADMIN_ENABLED: '0' }),
});
let plog = '';
proxy.stdout.on('data', (d) => { plog += d; }); proxy.stderr.on('data', (d) => { plog += d; });
const base = 'http://127.0.0.1:' + PORT;
const post = (url, body, raw) => fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw ? body : JSON.stringify(body) }).then((r) => r.status).catch(() => 0);
let up = false;
for (let i = 0; i < 60 && !up; i++) { await new Promise((r) => setTimeout(r, 150)); up = (await post('/__arcade', { ev: 'menu_open' })) === 204; }
try {
  ok(up, 'proxy up, a valid event → 204');
  ok((await post('/__arcade', { ev: 'reveal_3' })) === 204 && (await post('/__arcade', { ev: 'end_bluff' })) === 204, 'reveal / end → 204');
  ok((await post('/__arcade', { ev: 'nope' })) === 400 && (await post('/__arcade', { ev: '__proto__' })) === 400, 'unknown event → 400');
  ok((await post('/__arcade', 'not json', true)) === 400, 'garbage body → 400');
  ok((await fetch(base + '/__arcade').then((r) => r.status).catch(() => 0)) === 405, 'GET → 405');
  ok((await post('/__visit', { mode: 'arcade', vid: 'x', tz: 'Europe/Paris' })) === 204, 'a session of the arcade mode is accepted by /__visit');
  await new Promise((r) => setTimeout(r, 2200));   // saveVisitsSoon (1.5 s)
  const v = JSON.parse(fs.readFileSync(VISITS, 'utf8'));
  ok(v.arcade && v.arcade.menu_open === 1 && v.arcade.reveal_3 === 1 && v.arcade.end_bluff === 1 && !v.arcade.nope, 'stored in visits.json, refused events left no key');
  const day = Object.values(v.days || {})[0] || {};
  ok(day.ar && day.ar.menu_open === 1, 'per-day series in the visit bucket');
  ok(day.m && day.m.arcade === 1, 'the arcade session counted with the other modes');
} finally {
  proxy.kill('SIGTERM');
  if (!up) console.log(plog.slice(-2000));
}

// ── client + admin wiring ──
const st = fs.readFileSync(path.join(root, 'public/modules/games/stats.mjs'), 'utf8');
ok(/fetch\('\/__arcade'/.test(st) && /JSON\.stringify\(wd \? \{ ev, wd: true \} : \{ ev \}\)/.test(st) && !/vid|myName|nick/.test(st), 'the client posts { ev } only — no visitor id, no name');
ok(/pth_no_count/.test(st) && /LIVE_MODE/.test(st) && /MAX_QUEUE = 60/.test(st) && /addEventListener\('online'/.test(st), '« Do not count my visits », /live apart, bounded offline queue');
const RE = /^[a-z0-9_-]{1,40}$/;
ok(A.EVENTS.every((e) => RE.test(e)), 'every server event passes the client\'s check');
const src = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const idx = src('public/modules/games/index.mjs'), sh = src('public/modules/games/shell.mjs'), la = src('public/modules/ui/login-arcade.mjs');
ok(/arcadeStat\('menu_open'\)/.test(idx) && /_pthCountConnect\('arcade'\)/.test(idx) && /arcadeStat\('open_' \+ id\)/.test(idx) && /countUnlock\('word'\)/.test(idx), 'index: page opened (and its session), game opened, the secret word');
ok(/arcadeStat\('end_' \+ cur\.id\)/.test(sh), 'shell: a round played to its end');
const games = ids.map((id) => src('public/modules/games/' + id + '.mjs'));
ok(games.every((g) => (g.match(/shell\.ended\(\)/g) || []).length === 1), 'each of the 10 games tells the shell when a round ends, once');
ok(["stat('celebrated')", "stat('toast')", "stat('login_open')", "'train_on' : 'train_off'", "countUnlock('trophies')"].every((x) => la.includes(x)), 'login: celebrated, toast, card tapped, training games, unlocked by the trophies');
ok(/arcadeStat\('reveal_' \+ \(i \+ 1\)\)/.test(src('public/modules/games/menu.mjs')) && /arcadeStat\('celebrate_play'\)/.test(src('public/modules/guide/index.mjs')), 'menu: each reveal; the Ace\'s « Play now »');
ok(/new CustomEvent\('pth-training-over'\)/.test(src('public/modules/offline/server.mjs')), 'training: the end of a game is announced (additive)');
ok(/'pokerthnet', 'lan', 'offline', 'live', 'arcade'\]\.indexOf\(mode\)/.test(src('public/pokerth.js')), 'pokerth.js counts the arcade sessions');
const proxySrc = src('proxy.js');
ok(/arcade: \{\}, arcadeSince: 0/.test(proxySrc) && /arcadePeriod:/.test(proxySrc), 'the counters are part of the empty store; the summary carries all-time and period');
const route = proxySrc.slice(proxySrc.indexOf("reqPathOnly === '/__arcade'"), proxySrc.indexOf("reqPathOnly === '/__arcade'") + 700);
ok(!/clientIp|x-forwarded-for|remoteAddress/.test(route), 'the route never reads the caller address');
const admin = src('public/admin.html');
ok(/data-ts="arcade"/.test(admin) && /id="trafArcade"/.test(admin) && /function renderArcade\(\)/.test(admin) && /function _tsArcade\(\)/.test(admin), 'admin: a Mini-games section with its tiles');
ok(/\{k:'arcade',n:'Mini-games/.test(admin) && /--m-arc:/.test(admin), 'admin: the arcade mode in the mode charts and filters, with its colour');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
