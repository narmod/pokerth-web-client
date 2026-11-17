#!/usr/bin/env node
// Poker Run's traffic by difficulty (web.112, narmod: « the hard roads are too
// easy — more cars, at different speeds »): every right turn makes the next
// stage busier (5 cars a level, 1 a stage); from level 2 slow trucks and fast
// sports cars, from level 3 cars that change lane after their indicator, from
// level 4 convoys (two side by side, the third behind in the gap). The band
// shows the speed and the nitro (web.113).
// Run: node scripts/test-poker-run-traffic.mjs   (PTH_SHOTS=1: .shots/prun-swerve.png)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { startServer } from './lib/mobile-harness.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const { server, base } = await startServer();
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); for (const [k, v] of [['pth_guide_offered', '1'], ['pth_lang', 'fr'], ['pth_bak_auto', '0'], ['pth_arcade_all', '1'], ['pth_arcade_shown', '1'], ['pth_arcade_seen', '1']]) localStorage.setItem(k, v); } catch (e) {} });
const pg = await ctx.newPage();
const errors = []; pg.on('pageerror', (e) => errors.push(e.message));
console.log('test-poker-run-traffic');
await pg.goto(base); await pg.waitForSelector('.login-card'); await sleep(1500);
await pg.evaluate(() => { window.loginOpenArcade(); });
await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }); await sleep(400);
await pg.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="poker-run"]').closest('.gm-card'); (c.querySelector('[data-play]') || c).click(); });
await sleep(1200);
await pg.keyboard.press('Space'); await sleep(600);
ok(await pg.evaluate(() => window.__pthRun.mode() === 'free' && window.__pthRun.state() === 'run'), 'a free run starts');
// The band (web.113): km/h and the nitro with their bars; no meter left on the stage.
await pg.evaluate(() => { const R = window.__pthRun; R.setTime(99); R.cars().forEach((c) => { c.dead = true; }); });
const hud = await pg.evaluate(async () => { const R = window.__pthRun; for (let i = 0; i < 20; i++) { R.setV(0.5); R.setTime(99); await new Promise((r) => setTimeout(r, 16)); }
  const q = (s) => document.querySelector('#pth-game ' + s); return { kmh: +q('.pr-v').textContent, nit: q('.pr-n').textContent, bar: q('.prun-spd b').style.transform, old: !!q('.prun-nitro') }; });
ok(hud.kmh >= 110 && hud.kmh <= 130 && /^\d+%$/.test(hud.nit) && /scaleX/.test(hud.bar) && !hud.old, 'the band shows the speed (' + hud.kmh + ' km/h at half speed) and the nitro (' + hud.nit + '), the old meter is gone');
const M = await pg.evaluate(async () => { const m = await import('/modules/games/poker-run.mjs'); return { ex: [0, 1, 2, 3, 4, 5].map((k) => m.extraCars(k, k)) }; });
// Five rights in a row: levels 1 … 5.
const took = [];
for (let k = 0; k < 5; k++) {
  const before = await pg.evaluate(() => window.__pthRun.cars().length);
  await pg.evaluate((k) => { const R = window.__pthRun; R.setTime(99); R.setPos(R.game().gates[k].seg - 40); R.setPx(0.6); R.setV(0.9); R.cars().forEach((c) => { c.dead = true; }); }, k);
  for (let i = 0; i < 25; i++) { await pg.evaluate(() => { const R = window.__pthRun; R.setPx(0.6); R.setTime(99); R.cars().forEach((c) => { c.dead = true; }); }); await sleep(60); if (await pg.evaluate((k) => window.__pthRun.game().gates[k].picked >= 0, k)) break; }
  took.push(await pg.evaluate((a) => { const R = window.__pthRun, k = a.k, cs = R.cars().slice(a.before); return { picked: R.game().gates[k].picked, lv: R.lvl()[k + 1], n: cs.length,
    vans: cs.filter((c) => c.kind === 'van' && c.v <= 200 * 62 * 0.3 + 1).length, fast: cs.filter((c) => c.kind === 'sport' && c.v >= 200 * 62 * 0.7 - 1).length,
    convoy: cs.filter((c) => c.convoy).length, sw: R.cars().filter((c) => c.sw && !c.dead).length }; }, { k, before }));
}
ok(took.every((x, k) => x.picked === 1 && x.lv === k + 1), 'five rights taken: levels ' + took.map((x) => x.lv).join(' '));
const route = await pg.evaluate(() => window.__pthRun.game().stageTheme.join(' > '));
ok(route === 'vegas > valley > yosemite > chamonix > stelvio > moritz', 'always right: the mountains of the pyramid\'s bottom row (' + route + ')');
ok(took.every((x, k) => x.n === M.ex[k + 1]), 'each stage adds its traffic: 5 cars a level, 1 a stage (' + took.map((x) => x.n).join(' ') + ' = ' + M.ex.slice(1).join(' ') + ')');
ok(took[0].vans === 0 && took[0].fast === 0 && took[1].vans > 0 && took[1].fast > 0, 'trucks and sports cars from level 2 (level 2: ' + took[1].vans + ' trucks, ' + took[1].fast + ' fast)');
ok(took[2].convoy === 0 && took[3].convoy === 6 && took[4].convoy === 9, 'convoys from level 4: 2 then 3 of three cars (' + took.map((x) => x.convoy).join(' ') + ')');
ok(took[1].sw === 0 && took[2].sw > 0, 'cars that change lane from level 3 (' + took.map((x) => x.sw).join(' ') + ')');
// A lane change: the indicator first, then the car slides one lane over.
const sw0 = await pg.evaluate(() => {
  const R = window.__pthRun, me = R.segAt();
  let c = R.cars().find((x) => x.sw && !x.dead && x.sw.ph === 0 && x.z / 200 > me + 80);
  // None left ahead (they may all be behind already): one of the tagged cars, put back 120 segments ahead.
  if (!c) { c = R.cars().find((x) => x.sw); if (!c) return null; Object.assign(c, { dead: false, z: (me + 120) * 200 }); Object.assign(c.sw, { ph: 0, t: 0, at: 70 }); }
  R.cars().forEach((x) => { if (x !== c) x.dead = true; });
  window._sw = c; const at = Math.floor(c.z / 200) - 40 - (R.segAt() - Math.floor(R.game().pos / 200));
  R.setPos(at); R.setV(0); R.setTime(99); window._swIv = setInterval(() => { R.setPos(at); R.setV(0); R.setTime(99); }, 16);
  return { lane: c.lane };
});
await sleep(450);
const sw1 = await pg.evaluate(() => { const w = window._sw && window._sw.sw; return w ? { ph: w.ph, from: w.from, to: w.to } : {}; });
if (process.env.PTH_SHOTS === '1') { mkdirSync('.shots', { recursive: true }); await pg.screenshot({ path: '.shots/prun-swerve.png' }); }
await sleep(2200);
const sw2 = await pg.evaluate(() => { clearInterval(window._swIv); const c = window._sw; return c ? { ph: c.sw.ph, lane: c.lane } : {}; });
ok(sw0 && sw1.ph === 1 && Math.abs(sw1.to - sw1.from) === 1 && sw1.from === sw0.lane, 'a car ahead puts its indicator on (lane ' + (sw0 && sw0.lane) + ' → ' + sw1.to + ')');
ok(sw0 && sw2.ph === 3 && sw2.lane === sw1.to, 'then changes lane (now lane ' + sw2.lane + ')');
ok(errors.length === 0, 'no page error' + (errors.length ? ': ' + errors.join(' | ') : ''));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close(); server.close();
process.exit(fail ? 1 : 0);
