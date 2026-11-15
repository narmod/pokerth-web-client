#!/usr/bin/env node
// Ace Dash's jetpack (web.72, narmod: « A + C »): picked up, the Ace flies over
// a card wall without a scratch, ← → still change lane; three cards in the sky,
// the one he flies through joins his hand and the others go; he lands safe;
// time attack: +5 s; the rules sheet tells it.
import { chromium } from 'playwright';
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
await pg.goto(base); await pg.waitForSelector('.login-card'); await sleep(1500);
await pg.evaluate(() => { window.loginOpenArcade(); });
await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }); await sleep(400);
await pg.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="ace-dash"]').closest('.gm-card'); (c.querySelector('[data-play]') || c).click(); });
await sleep(1000);
// The rules sheet: the jetpack's line, before the keys.
await pg.evaluate(() => window.PthGames.rules()); await sleep(300);
const rules = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .pg-rules li')].map((l) => l.textContent));
ok(rules.length >= 3 && /Jetpack/.test(rules[rules.length - 2]) && /Espace/.test(rules[rules.length - 1]), 'the rules tell the jetpack, before the keys');
await pg.click('#pth-game .pg-rules [data-r="close"]').catch(() => {}); await sleep(300);
await pg.evaluate(() => window.__pthDash.start('free')); await sleep(600);
// A jetpack in his lane.
await pg.evaluate(() => { const G = window.__pthDash.run(); G.obj = []; G.items = []; G.hand = []; G.items.push({ kind: 'jet', x: G.x, z: 4.8, y: 0.6, spin: 0, col: ['#000', '#fff'] }); });
await sleep(400);
const j0 = await pg.evaluate(() => { const G = window.__pthDash.run(); return { jet: G.jet, sky: G.items.filter((i) => i.sky && i.kind === 'card').length }; });
ok(j0.jet && j0.sky === 3, 'picked up: he takes off, three cards wait in the sky (' + j0.sky + ')');
await sleep(500);
// A card wall in his lane: flown over.
await pg.evaluate(() => { const G = window.__pthDash.run(); G.obj.push({ kind: 'wall', x: G.x, z: 6, h: 1.6, hw: 0.66, dz: 0.3, tilt: 0 }); });
await sleep(700);
const j1 = await pg.evaluate(() => ({ st: window.__pthDash.state(), y: window.__pthDash.run().y }));
ok(j1.st === 'run' && j1.y > 2, 'a card wall below: flown over (height ' + j1.y.toFixed(2) + ' m)');
await pg.keyboard.press('ArrowLeft'); await sleep(400);
ok(await pg.evaluate(() => window.__pthDash.run().lane === 0), '← still changes lane in the air');
// Through one of the three cards.
await pg.waitForFunction(() => window.__pthDash.run().hand.length === 1, null, { timeout: 5000 }).catch(() => {});
const j2 = await pg.evaluate(() => { const G = window.__pthDash.run(); return { hand: G.hand.length, left: G.items.filter((i) => i.trio && !i.got).length, deck: G.deck.length }; });
ok(j2.hand === 1 && j2.left === 0, 'the card he flies through joins his hand, the two others are gone');
await pg.waitForFunction(() => !window.__pthDash.run().jet, null, { timeout: 8000 }).catch(() => {});
const j3 = await pg.evaluate(() => { const G = window.__pthDash.run(); return { st: window.__pthDash.state(), y: G.y, ground: G.onGround, safe: G.safeUntil > performance.now() }; });
ok(j3.st === 'run' && j3.y === 0 && j3.ground && j3.safe, 'he lands, safe for a moment');
// Time attack: +5 s.
await pg.evaluate(() => window.__pthDash.start('time')); await sleep(300);
const t0 = await pg.evaluate(() => window.__pthDash.run().time);
await pg.evaluate(() => window.__pthDash.jet()); 
const t1 = await pg.evaluate(() => window.__pthDash.run().time);
ok(t1 - t0 > 4.8 && t1 - t0 < 5.2, 'time attack: the jetpack gives 5 s (' + (t1 - t0).toFixed(1) + ')');
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
