#!/usr/bin/env node
// Ace Dash's jetpack (web.72, narmod: « A + C »): picked up, the Ace flies over
// a card wall without a scratch, ← → still change lane; three cards in the sky,
// the one he flies through joins his hand and the others go; he lands safe;
// time attack: +5 s; the rules sheet tells it. Then (web.73) the roller skates
// (faster, distance ×1.5, the rail to grind along) and the hourglass (slow motion);
// (web.74) the pool table in the air: the gold ramp lands him on it, the 8-ball's
// jackpot, the drop at its end; a ball knocks him off; missed, he runs underneath.
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
ok(rules.length >= 5 && /Jetpack/.test(rules[rules.length - 4]) && /Patins/.test(rules[rules.length - 3]) && /Billard/.test(rules[rules.length - 2]) && /Espace/.test(rules[rules.length - 1]), 'the rules tell the jetpack, the skates, the hourglass and the pool table, before the keys');
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
// The pool table: the gold ramp, then on top; the 8-ball's jackpot; down at its end.
const poolRun = async (steer) => {
  await pg.evaluate(() => { window.__pthDash.start('free'); }); await sleep(300);
  await pg.evaluate(() => window.__pthDash.pool()); await sleep(150);
  const ramp = await pg.evaluate((st) => { const G = window.__pthDash.run(); const r = G.obj.find((o) => o.kind === 'ramp'); G.lane = Math.round(r.x / 1.6) + 1; return { pool: !!G.pool, gold: r && r.gold, balls: G.obj.filter((o) => o.kind === 'ball').length, eight: G.items.some((i) => i.kind === 'eight') }; }, steer);
  const seen = { on: false, maxY: 0, under: false, chips0: await pg.evaluate(() => window.__pthDash.run().chips), hand0: await pg.evaluate(() => window.__pthDash.run().hand.length), knocked: false };
  for (let i = 0; i < 80; i++) {
    const st = await pg.evaluate((st) => {
      const G = window.__pthDash.run();
      // Missing it on purpose: off the ramp's lane once the row before it has passed.
      const rp = G.obj.find((o) => o.kind === 'ramp');
      if (st === 'under') G.obj = G.obj.filter((o) => o.kind === 'ball' || o.kind === 'ramp');   // only the table's business
      if (st === 'under' && rp && rp.z < 7 && rp.z > 3) G.lane = (Math.round(rp.x / 1.6) + 2) % 3;
      if (st !== 'hit' && G.pool) { const nb = G.obj.filter((o) => o.kind === 'ball' && !o.dead && o.z > 4.3).sort((a, b) => a.z - b.z)[0];
        if (nb && nb.z < 12) { const used = G.obj.filter((o) => o.kind === 'ball' && !o.dead && Math.abs(o.z - nb.z) < 0.1).map((o) => Math.round(o.x / 1.6) + 1); const fr = [0, 1, 2].filter((l) => !used.includes(l)); if (!fr.includes(G.lane)) G.lane = fr[0]; } else if (!nb && G.pool.z0 < 4) G.lane = 1; }
      if (st === 'hit' && G.pool && G.pool.on) { const nb = G.obj.filter((o) => o.kind === 'ball' && !o.dead && o.z > 4.3).sort((a, b) => a.z - b.z)[0]; if (nb) G.lane = Math.round(nb.x / 1.6) + 1; }
      return { st: window.__pthDash.state(), y: G.y, on: !!(G.pool && G.pool.on), drop: !!(G.pool && G.pool.drop), pool: !!G.pool, under: !!(G.pool && G.pool.z0 < 4 && G.pool.z1 > 4 && G.y < 1), ghost: window.__pthDash.underView() };
    }, steer);
    if (st.st !== 'run') return Object.assign(ramp, seen, { dead: true });
    seen.ghost = seen.ghost || (st.under && st.ghost); seen.onGhost = seen.onGhost || (st.on && !st.drop && st.ghost && st.y >= 1.3);
    seen.on = seen.on || st.on; seen.maxY = Math.max(seen.maxY, st.y); seen.under = seen.under || st.under; seen.knocked = seen.knocked || st.drop;
    if (!st.pool && i > 3) break;
    await sleep(120);
  }
  // Still falling from the table's end, maybe: let him land.
  await pg.waitForFunction(() => window.__pthDash.state() !== 'run' || window.__pthDash.run().y === 0, null, { timeout: 2000 }).catch(() => {});
  const end = await pg.evaluate(() => { const G = window.__pthDash.run(); return { chips: G.chips, hand: G.hand.length, y: G.y }; });
  return Object.assign(ramp, seen, end);
};
const pr = await poolRun('ramp');
ok(pr.pool && pr.gold && pr.balls > 0 && pr.eight, 'the pool table: a gold ramp before it, balls on it, the 8-ball at its end (' + pr.balls + ' balls)');
ok(pr.on && pr.maxY >= 1.3, 'the ramp lands him on the table (' + pr.maxY.toFixed(2) + ' m)');
ok(pr.chips - pr.chips0 >= 25 && pr.hand - pr.hand0 === 1, 'the 8-ball: the jackpot, +25 chips and a card (+' + (pr.chips - pr.chips0) + ', +' + (pr.hand - pr.hand0) + ' card)');
ok(!pr.dead && pr.y === 0, 'at the table\'s end he drops back on the felt');
const pu = await poolRun('under');
ok(!pu.dead && !pu.on && pu.under && pu.hand === pu.hand0, 'missed: he runs underneath, no harm, no jackpot');
ok(pu.ghost && !pr.onGhost, 'underneath, the table is drawn over him, see-through (on it, it is not)');
const ph = await poolRun('hit');
ok(!ph.dead && ph.on && ph.knocked, 'a ball on the table knocks him off, back on the felt, still running');
// (web.81) Sideways on a touch screen: ◀ on the left, ▲ over ▼ then ▶ on the right.
{
  const c2 = await b.newContext({ viewport: { width: 844, height: 390 }, serviceWorkers: 'block', hasTouch: true, isMobile: true });
  await c2.addInitScript(() => { try { if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1'); localStorage.clear(); for (const [k, v] of [['pth_guide_offered', '1'], ['pth_lang', 'fr'], ['pth_bak_auto', '0'], ['pth_arcade_all', '1'], ['pth_arcade_shown', '1'], ['pth_arcade_seen', '1']]) localStorage.setItem(k, v); } catch (e) {} });
  const p2 = await c2.newPage();
  await p2.goto(base); await p2.waitForSelector('.login-card'); await sleep(1500);
  await p2.evaluate(() => { window.loginOpenArcade(); });
  await p2.waitForSelector('#pth-game .gm-card', { timeout: 8000 }); await sleep(400);
  await p2.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="ace-dash"]').closest('.gm-card'); (c.querySelector('[data-play]') || c).click(); });
  await sleep(1000);
  const r = await p2.evaluate(() => { const q = (x) => document.querySelector('#pth-game ' + x).getBoundingClientRect(); return { S: q('.pg-stage'), L: q('[data-a="left"]'), U: q('[data-a="jump"]'), D: q('[data-a="duck"]'), R: q('[data-a="right"]') }; });
  ok(r.L.right <= r.S.left && r.U.left >= r.S.right && Math.abs(r.U.left - r.D.left) < 1 && r.U.bottom <= r.D.top && r.R.left >= r.U.right && r.L.height > r.U.height * 1.5,
    'sideways: ◀ on the left, ▲ over ▼ then ▶ on the right');
  await c2.close();
}
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
