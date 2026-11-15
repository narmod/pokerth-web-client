#!/usr/bin/env node
// Poker Run's « Dame de Cœur » mode (web.66): the title's second tile, the
// Queen's request under the HUD, the hearts in the corner, a request kept
// (« no bumps for 10 s ») worth ♥♥♥, a bump that misses one, and the score
// multiplied by the hearts, with its own record.
import { chromium } from 'playwright';
import { startServer } from './lib/mobile-harness.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const { server, base } = await startServer();
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); for (const [k, v] of [['pth_guide_offered', '1'], ['pth_lang', 'fr'], ['pth_bak_auto', '0'], ['pth_arcade_all', '1'], ['pth_arcade_shown', '1'], ['pth_arcade_seen', '1']]) localStorage.setItem(k, v); } catch (e) {} });
const pg = await ctx.newPage();
const errors = []; pg.on('pageerror', (e) => errors.push(e.message));
await pg.goto(base); await pg.waitForSelector('.login-card'); await sleep(1500);
await pg.evaluate(() => { window.loginOpenArcade(); });
await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }); await sleep(500);
await pg.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="poker-run"]').closest('.gm-card'); (c.querySelector('[data-play]') || c).click(); });
await sleep(1200);
const tiles = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .pg-panel .gm-mode, #pth-game .pg-panel [data-m]')].map((x) => x.textContent));
ok(tiles.length === 2 && /Dame de Cœur/.test(tiles[1]), 'two tiles on the title: free run and Dame de Cœur');
await pg.keyboard.press('ArrowRight'); await sleep(200); await pg.keyboard.press('Space'); await sleep(3000);
const q0 = await pg.evaluate(() => ({ mode: window.__pthRun.mode(), q: window.__pthRun.quest(), box: (() => { const e = document.querySelector('#pth-game .prun-q'); return e && !e.hidden ? e.textContent : ''; })(), hearts: (() => { const e = document.querySelector('#pth-game .prun-hearts'); return e && !e.hidden ? e.textContent : ''; })() }));
ok(q0.mode === 'queen' && q0.q && q0.box.length > 5, 'the Queen asks for something at the start (' + (q0.q && q0.q.id) + ': ' + q0.box.slice(0, 40) + ')');
ok(/0\s*\/\s*18/.test(q0.hearts), 'the hearts in the corner (' + q0.hearts + ')');
ok(await pg.evaluate(() => { const c = document.querySelector('#pth-game .prun-qc'); return !!c && /Q/.test(c.textContent); }), 'her card, Q♥, beside the request');
// « No bumps for 10 s », the road cleared: ♥♥♥.
await pg.evaluate(() => { const R = window.__pthRun; R.cars().forEach((c) => { c.dead = true; }); R.setTime(99); R.forceQuest('clean'); });
for (let i = 0; i < 22; i++) { await pg.evaluate(() => { window.__pthRun.setTime(99); window.__pthRun.cars().forEach((c) => { c.dead = true; }); }); await sleep(500); if (!(await pg.evaluate(() => window.__pthRun.quest()))) break; }
const q1 = await pg.evaluate(() => window.__pthRun.quests());
const last = q1[q1.length - 1];
ok(last.id === 'clean' && last.done && last.h === 3, 'no bumps for 10 s: ♥♥♥ (' + last.h + ')');
ok(/3\s*\/\s*18/.test(await pg.evaluate(() => document.querySelector('#pth-game .prun-hearts').textContent)), 'the corner counts them (3 / 18)');
// A bump during « no bumps »: missed.
await pg.evaluate(() => {
  const R = window.__pthRun; R.forceQuest('clean'); R.setPos(5); R.setPx(0); R.setV(0.8);
  const cs = R.cars(); Object.assign(cs[0], { dead: false, lane: 1, z: 25 * 200, v: 200 * 62 * 0.2, ahead: true });
});
for (let i = 0; i < 12; i++) { await pg.evaluate(() => { window.__pthRun.setPx(0); window.__pthRun.setV(0.8); }); await sleep(100); }
const q2 = await pg.evaluate(() => window.__pthRun.quests());
ok(q2[q2.length - 1].done && q2[q2.length - 1].h === 0, 'a bump during « no bumps »: missed (✗)');
// Time out: the score × (1 + ♥ / 10), the list of requests.
await pg.evaluate(() => window.__pthRun.setTime(0.1));
await pg.waitForSelector('#pth-game .gm-endc .gm-erest:not(.gm-ewait)', { timeout: 15000 }).catch(() => {});
await sleep(1200);
const o = await pg.evaluate(() => ({ calc: (document.querySelector('#pth-game .gm-ecalc') || {}).textContent || '', items: document.querySelectorAll('#pth-game .gm-elist > div').length,
  lv: (document.querySelector('#pth-game .gm-elt') || {}).textContent || '', score: (document.querySelector('#pth-game .gm-esv') || {}).textContent || '', best: localStorage.getItem('pth_prun_best') }));
ok(/♥ 3\s*×1,3/.test(o.calc) && o.items >= 2 && /♥ 3/.test(o.lv), 'the result: the hearts multiply the score, the requests listed (' + o.calc + ' · ' + o.lv + ')');
ok(/"queen":\d+/.test(o.best || '') || o.score === '0', 'its own record (' + o.best + ')');
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
