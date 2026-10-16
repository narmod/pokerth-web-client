#!/usr/bin/env node
// Hidden mini-games in a real browser (Playwright): the secret word typed as
// the training nickname opens the arcade menu instead of a table, then Ace
// Runner and the House of Cards, the real
// nickname comes back (field and pth_nick), the Ace runs, busts and gets his
// showdown, Esc closes the overlay, the secret trophy is granted, and an
// ordinary nickname still starts a normal training game.
// Run: node scripts/test-games-browser.mjs   (PTH_SHOTS=1 writes screenshots
// to .shots/games-*.png)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { startServer } from './lib/mobile-harness.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHOTS = process.env.PTH_SHOTS === '1';
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };

const { server, base } = await startServer();
const b = await chromium.launch();
const errors = [];
async function fresh(width, height) {
  const ctx = await b.newContext({ viewport: { width, height }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => {
    try {
      if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); }
      localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'fr');
      localStorage.setItem('pth_bak_auto', '0'); localStorage.setItem('pth_nick', 'Narmod');
    } catch (e) {}
  });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await pg.goto(base);
  await pg.waitForSelector('.login-card');
  await sleep(800);
  await pg.evaluate(() => { loginPickMode(document.querySelector('.login-card[onclick*="\'offline\'"]'), 'offline'); });
  await sleep(1000);
  return { ctx, pg };
}
const shot = async (pg, name) => { if (!SHOTS) return; mkdirSync('.shots', { recursive: true }); await pg.screenshot({ path: '.shots/games-' + name + '.png' }); };

console.log('test-games-browser');
for (const [w, h, label] of [[1280, 800, 'desktop'], [390, 844, 'phone']]) {
  const { ctx, pg } = await fresh(w, h);
  ok(await pg.evaluate(() => document.getElementById('server-mode').value === 'offline' && !!window.PthGames), label + ': training selected, games registry loaded');
  await pg.click('#nick');
  await pg.fill('#nick', '');
  await pg.type('#nick', 'Mascotte', { delay: 15 });
  await pg.evaluate(() => { window._achSeen = []; window.addEventListener('pth-achievement', (e) => window._achSeen.push(e.detail && e.detail.id)); });
  await pg.evaluate(() => App.connect());
  await pg.waitForSelector('#pth-game .gm-tile', { timeout: 8000 }).catch(() => {});
  const st = await pg.evaluate(() => ({
    open: !!document.getElementById('pth-game'), nick: document.getElementById('nick').value,
    stored: localStorage.getItem('pth_nick'), ace: !!document.querySelector('#pth-game-ace .mc-face'),
    pad: window._pthPadOwner, title: (document.querySelector('#pth-game .pg-panel h2') || {}).textContent,
    tiles: [...document.querySelectorAll('#pth-game .gm-tile b')].map((b) => b.textContent),
  }));
  ok(st.open && st.ace && st.title === 'Arcade', label + ': the arcade menu opens with the Ace');
  ok(st.tiles.join('|') === 'Ace Runner|Château de cartes', label + ': it lists the games (' + st.tiles.join(', ') + ')');
  ok(st.nick === 'Narmod' && st.stored === 'Narmod', label + ': the real nickname is back (field ' + st.nick + ', stored ' + st.stored + ')');
  ok(st.pad === 'arcade', label + ': the gamepad navigation steps aside');
  await shot(pg, label + '-menu');
  // ── Ace Runner ──
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Ace Runner', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'ace-runner'), label + ': Space opens Ace Runner');
  await shot(pg, label + '-title');
  await pg.keyboard.press('Space');
  await sleep(1200);
  const run = await pg.evaluate(() => ({ hidden: document.querySelector('#pth-game .pg-panel').hidden, dist: document.querySelector('#pth-game .ar-num').textContent }));
  ok(run.hidden && +run.dist > 0, label + ': Space starts the run (distance ' + run.dist + ')');
  await shot(pg, label + '-run');
  // Nobody jumps: the first obstacle ends the run, then the showdown.
  await pg.waitForSelector('#pth-game .ar-final', { timeout: 20000 }).catch(() => {});
  const over = await pg.evaluate(() => ({
    final: (document.querySelector('#pth-game .ar-final') || {}).textContent || '',
    best: localStorage.getItem('pth_game_best_ace-runner'),
    cards: document.querySelectorAll('#pth-game .ar-show .pk:not(.back)').length,
    backs: document.querySelectorAll('#pth-game .ar-show .pk.back').length,
    busted: (document.querySelector('#pth-game .pg-panel h2') || {}).textContent,
  }));
  ok(/=/.test(over.final) && over.best !== null, label + ': busted, score shown and saved (' + over.final.trim() + ')');
  ok(over.backs === 0, label + ': showdown cards all turned (' + over.cards + ')');
  ok(over.busted === 'Éliminé !', label + ': texts in the player\'s language');
  await shot(pg, label + '-over');
  await sleep(800);
  await pg.keyboard.press('Space');
  await sleep(400);
  ok(await pg.evaluate(() => document.querySelector('#pth-game .pg-panel').hidden), label + ': Space plays again');
  await pg.keyboard.press('Escape');
  await sleep(200);
  ok(await pg.evaluate(() => !document.querySelector('#pth-game .pg-pause').hidden), label + ': Esc during a run pauses');
  await pg.keyboard.press('Escape');
  await pg.waitForSelector('#pth-game .gm-tile', { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-tile') && !document.getElementById('pth-game-ace-css') === false), label + ': Esc again goes back to the menu');
  // ── House of Cards ──
  await pg.keyboard.press('ArrowRight');
  await sleep(100);
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Château de cartes', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'house'), label + ': → then Space opens the House of Cards');
  await shot(pg, label + '-house-title');
  await pg.keyboard.press('Space');
  await sleep(500);
  await pg.keyboard.press('ArrowDown');
  await sleep(300);
  ok(await pg.evaluate(() => (document.querySelector('#pth-game .hc-burn') || {}).textContent === '🔥 2'), label + ': ↓ burns the hanging card (3 → 2)');
  // A careful player: drop when the card is over its place (slot x of house.mjs).
  let placed = 0, floors = 0;
  const SLOT_X = [-36.5, -23.5, 23.5, 36.5, 0];
  for (let i = 0; i < 7; i++) {
    await pg.waitForFunction((X) => { const G = window.__pthHouse && window.__pthHouse.run();
      return !!G && !G.fall && Math.abs(G.railX - (X[G.cur.length] + G.tilt * 5 * G.floors.length)) < 2; }, SLOT_X, { timeout: 8000, polling: 'raf' }).catch(() => {});
    await pg.keyboard.press('Space');
    await sleep(500);
    const s2 = await pg.evaluate(() => ({ c: document.querySelectorAll('#pth-game .ar-slots .pk').length, f: +(document.querySelector('#pth-game .hc-floors') || {}).textContent || 0 }));
    placed = Math.max(placed, s2.c); floors = Math.max(floors, s2.f);
    if (i === 6) await shot(pg, label + '-house-run');
  }
  // Push it past the point of no return, then one more drop brings it down.
  await pg.evaluate(() => { const G = window.__pthHouse && window.__pthHouse.run(); if (G) G.tilt = 3; });
  await pg.keyboard.press('Space');
  await pg.waitForSelector('#pth-game .ar-final', { timeout: 15000 }).catch(() => {});
  const hOver = await pg.evaluate(() => ({ final: (document.querySelector('#pth-game .ar-final') || {}).textContent || '',
    title: (document.querySelector('#pth-game .pg-panel h2') || {}).textContent, best: localStorage.getItem('pth_game_best_house') }));
  ok(floors >= 1, label + ': cards land in the house (up to ' + placed + ' on a floor, ' + floors + ' floor(s))');
  ok(hOver.title === 'Tout s\'écroule !' && /·/.test(hOver.final), label + ': at full tilt it comes down, score saved (' + hOver.final.trim() + ')');
  await shot(pg, label + '-house-over');
  await pg.keyboard.press('Escape');
  await sleep(500);
  await pg.keyboard.press('Escape');
  await sleep(600);
  const closed = await pg.evaluate(() => ({ gone: !document.getElementById('pth-game'), pad: window._pthPadOwner, on: window._pthGameOn, ach: window._achSeen }));
  ok(closed.gone && !closed.pad && !closed.on, label + ': Esc from the menu closes and releases the gamepad and the mascot');
  if (label === 'desktop') ok(closed.ach.indexOf('runner') >= 0, label + ': secret trophy granted on the way out');
  // An ordinary nickname: a normal training game, no overlay.
  await pg.fill('#nick', 'Narmod');
  await pg.evaluate(() => App.connect());
  await sleep(2500);
  ok(await pg.evaluate(() => !document.getElementById('pth-game') && document.getElementById('s-connect').classList.contains('active') === false), label + ': an ordinary nickname starts a normal training game');
  await ctx.close();
}
ok(errors.length === 0, 'no page error' + (errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''));
await b.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
