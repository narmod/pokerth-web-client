#!/usr/bin/env node
// Poker Run's « Défi du jour » (web.68): the title's third tile; the same
// cards, scenes, road and traffic at every try today (a free run deals anew);
// the best run of the day kept with its line, then driven by its ghost — the
// HUD tells the gap (👻 +1.2 s when behind it).
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
const openRun = async () => {
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }); await sleep(400);
  await pg.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="poker-run"]').closest('.gm-card'); (c.querySelector('[data-play]') || c).click(); });
  await sleep(1200);
};
const snap = () => pg.evaluate(() => { const R = window.__pthRun; return { mode: R.mode(), hole: R.hole().join(), cards: R.cards().map((c) => c.join('-')).join(), br: R.branches().map((x) => x.join('-')).join(), cars: R.carsAt(), c1: R.stageCurves(1).toFixed(3) }; });
await pg.goto(base); await pg.waitForSelector('.login-card'); await sleep(1500);
await pg.evaluate(() => { window.loginOpenArcade(); });
await openRun();
const tiles = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .pg-panel .gm-mode, #pth-game .pg-panel [data-m]')].map((x) => x.textContent));
ok(tiles.length === 3 && /Défi du jour/.test(tiles[2]) && /👻/.test(tiles[2]), 'a third tile: the daily challenge, with its ghost (' + (tiles[2] || '').slice(0, 50) + ')');
await pg.keyboard.press('ArrowRight'); await sleep(150); await pg.keyboard.press('ArrowRight'); await sleep(150); await pg.keyboard.press('Space'); await sleep(500);
const a = await snap();
ok(a.mode === 'daily', 'the daily challenge starts');
await pg.evaluate(() => { window.__pthRun.cars().forEach((c) => { c.dead = true; }); });
await sleep(4000);
ok(await pg.evaluate(() => document.querySelector('#pth-game .prun-ghost').hidden && window.__pthRun.ghost() === null), 'the first try of the day: no ghost yet');
await pg.evaluate(() => window.__pthRun.setTime(0.2));
await pg.waitForSelector('#pth-game .gm-endc .gm-erest:not(.gm-ewait)', { timeout: 15000 }).catch(() => {}); await sleep(1200);
const e1 = await pg.evaluate(() => ({ sub: (document.querySelector('#pth-game .gm-esub') || {}).textContent || '', d: JSON.parse(localStorage.getItem('pth_prun_daily') || 'null') }));
const today = new Date().toISOString().slice(0, 10);
ok(/Défi du jour/.test(e1.sub) && e1.sub.includes(today), 'its end screen says so, with the day (' + e1.sub + ')');
ok(e1.d && e1.d.d === today && e1.d.g && e1.d.g.z.length >= 30 && e1.d.g.p.length === 5, 'the run of the day kept with its line (' + (e1.d ? e1.d.g.z.length : 0) + ' samples)');
await pg.keyboard.press('Space'); await sleep(500);
const b2 = await snap();
ok(b2.mode === 'daily' && b2.hole === a.hole && b2.cards === a.cards && b2.br === a.br && b2.c1 === a.c1, 'played again: the same cards, scenes and road (' + b2.hole + ' · ' + b2.br.slice(0, 30) + ')');
ok(b2.cars === a.cars, 'and the same traffic, car for car');
ok(await pg.evaluate(() => !!window.__pthRun.ghost()), 'today\'s best run comes back as a ghost');
await pg.evaluate(() => { window.__pthRun.cars().forEach((c) => { c.dead = true; }); });
await pg.keyboard.down('ArrowDown'); await sleep(2500); await pg.keyboard.up('ArrowDown');
const g = await pg.evaluate(() => ({ gap: window.__pthRun.gap(), now: window.__pthRun.ghostNow(), tag: (() => { const e = document.querySelector('#pth-game .prun-ghost'); return e && !e.hidden ? e.textContent + '|' + e.className : ''; })() }));
ok(g.gap > 0.5 && /👻 \+\d/.test(g.tag) && /behind/.test(g.tag), 'braking: behind the ghost, the HUD says by how much (' + g.tag + ')');
ok(g.now && g.now.z > 0, 'the ghost drives ahead on the same road (segment ' + (g.now ? g.now.z.toFixed(1) : '-') + ')');
await pg.keyboard.press('Escape'); await sleep(300); await pg.keyboard.press('Escape'); await sleep(600);
await openRun();
const t2 = await pg.evaluate(() => (document.querySelectorAll('#pth-game .pg-panel [data-m]')[2] || {}).textContent || '');
ok(/Aujourd'hui/.test(t2), 'the tile shows today\'s score (' + t2.slice(0, 60) + ')');
await pg.click('#pth-game .pg-panel [data-m="0"]'); await sleep(600);
const f = await snap();
ok(f.mode === 'free' && (f.hole !== a.hole || f.cards !== a.cards), 'a free run deals anew (' + f.mode + ' ' + f.hole + ')');
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
