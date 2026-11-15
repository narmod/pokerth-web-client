#!/usr/bin/env node
// Ace Dash's jetpack (web.72, narmod: « A + C »): picked up, the Ace flies over
// a card wall without a scratch, ← → still change lane; three cards in the sky,
// the one he flies through joins his hand and the others go; he lands safe;
// time attack: +5 s; the rules sheet tells it. Then (web.73) the roller skates
// (faster, distance ×1.5, the rail to grind along) and the hourglass (slow motion).
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
ok(rules.length >= 4 && /Jetpack/.test(rules[rules.length - 3]) && /Patins/.test(rules[rules.length - 2]) && /Espace/.test(rules[rules.length - 1]), 'the rules tell the jetpack, the skates and the hourglass, before the keys');
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
// Roller skates: faster, the distance counts more, past the edge lane the rail.
await pg.evaluate(() => window.__pthDash.start('free')); await sleep(800);
const sk0 = await pg.evaluate(() => { const G = window.__pthDash.run(); G.obj = []; G.items = []; G.items.push({ kind: 'skates', x: G.x, z: 4.8, y: 0.6, spin: 0, col: ['#000', '#fff'] }); return G.speed; });
await sleep(1500);
const sk1 = await pg.evaluate(() => { const G = window.__pthDash.run(); return { on: G.skateUntil > performance.now(), speed: G.speed }; });
ok(sk1.on && sk1.speed > sk0 * 1.1, 'skates picked up: faster (' + sk0.toFixed(1) + ' → ' + sk1.speed.toFixed(1) + ' m/s)');
const d0 = await pg.evaluate(() => { const G = window.__pthDash.run(); G.obj = []; return { d: G.dist, tr: G.travel }; });
await sleep(500);
const d1 = await pg.evaluate(() => { const G = window.__pthDash.run(); return { d: G.dist, tr: G.travel }; });
const k = (d1.d - d0.d) / (d1.tr - d0.tr);
ok(k > 1.45 && k < 1.55, 'on skates the distance counts ×1.5 (' + k.toFixed(2) + ')');
await pg.keyboard.press('ArrowLeft'); await sleep(120); await pg.keyboard.press('ArrowLeft'); await sleep(500);
const g0 = await pg.evaluate(() => { const G = window.__pthDash.run(); G.obj = []; return { lane: G.lane, x: G.x, grind: G.grinding, b: G.bonus }; });
await sleep(1000);
const g1 = await pg.evaluate(() => { const G = window.__pthDash.run(); return { grind: G.grinding, b: G.bonus }; });
ok(g0.lane === -1 && g0.x < -2.4 && g1.grind && g1.b - g0.b >= 15, 'past the edge lane: on the rail, grinding (+' + (g1.b - g0.b) + ' in 1 s)');
await pg.evaluate(() => { window.__pthDash.run().skateUntil = performance.now() - 1; }); await sleep(400);
ok(await pg.evaluate(() => { const G = window.__pthDash.run(); return G.lane === 0 && !G.grinding; }), 'the skates off: back on the felt');
// The hourglass: slow motion.
await pg.evaluate(() => { const G = window.__pthDash.run(); G.obj = []; G.items = []; G.items.push({ kind: 'slow', x: G.x, z: 4.8, y: 0.6, spin: 0, col: ['#000', '#fff'] }); });
await sleep(500);
const s0 = await pg.evaluate(() => ({ on: window.__pthDash.run().slowUntil > performance.now(), t: window.__pthDash.run().t, w: performance.now() }));
await sleep(1000);
const s1 = await pg.evaluate(() => ({ t: window.__pthDash.run().t, w: performance.now() }));
const rate = (s1.t - s0.t) / ((s1.w - s0.w) / 1000);
ok(s0.on && rate > 0.4 && rate < 0.6, 'the hourglass: the game at half speed (' + rate.toFixed(2) + ')');
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
