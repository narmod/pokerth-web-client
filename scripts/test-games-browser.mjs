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
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  const st = await pg.evaluate(() => ({
    open: !!document.getElementById('pth-game'), nick: document.getElementById('nick').value,
    stored: localStorage.getItem('pth_nick'), ace: !!document.querySelector('#pth-game-ace .mc-face'),
    pad: window._pthPadOwner, title: (document.getElementById('ar-title') || {}).textContent,
    page: document.getElementById('s-arcade').classList.contains('active'),
    back: !!document.querySelector('#s-arcade .cp-header #ar-back-btn'), menu: !!document.querySelector('#s-arcade #ar-overflow-btn'),
    tiles: [...document.querySelectorAll('#pth-game .gm-card h3')].map((b) => b.textContent),
  }));
  ok(st.open && st.ace && st.page && st.title === 'Arcade', label + ': the arcade page opens with the Ace');
  ok(st.back && st.menu, label + ': with the header of the other pages (back, ⚙ menu)');
  ok(st.tiles.join('|') === 'Ace Runner|Château de cartes|Poker Solitaire', label + ': it lists the games (' + st.tiles.join(', ') + ')');
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
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card') && document.getElementById('ar-title').textContent === 'Arcade'), label + ': Esc again goes back to the arcade page');
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
  // ── Poker Solitaire (daily challenge, keyboard only) ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowRight');
  await sleep(100);
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Poker Solitaire', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'solitaire' && document.querySelectorAll('#pth-game .pg-panel .gm-tile').length === 2), label + ': → → Space opens Poker Solitaire (daily / free)');
  await shot(pg, label + '-solitaire-title');
  await pg.keyboard.press('Space');
  await sleep(300);
  await pg.keyboard.press('ArrowLeft');      // the cursor moves; Space places
  for (let i = 0; i < 25; i++) {
    await pg.keyboard.press('Space');
    await sleep(260);
    if (i === 12) await shot(pg, label + '-solitaire-run');
  }
  await pg.waitForSelector('#pth-game .pg-panel .ar-show', { timeout: 12000 }).catch(() => {});
  const ps = await pg.evaluate(() => ({ h2: (document.querySelector('#pth-game .pg-panel h2') || {}).textContent,
    hud: (document.querySelector('#pth-game .ps-score') || {}).textContent, left: (document.querySelector('#pth-game .ps-left') || {}).textContent,
    daily: localStorage.getItem('pth_game_daily_solitaire'), cards: document.querySelectorAll('#pth-game .ar-show .pk').length }));
  ok(ps.left === '25/25' && ps.h2 === ps.hud && ps.cards === 5, label + ': 25 cards placed, ten lines counted, score ' + ps.h2 + ' and its best line shown');
  ok(!!ps.daily && JSON.parse(ps.daily).d === new Date().toISOString().slice(0, 10), label + ': the daily score is kept for today');
  await shot(pg, label + '-solitaire-over');
  await pg.keyboard.press('Escape');
  await sleep(500);
  await pg.keyboard.press('Escape');
  await sleep(600);
  const closed = await pg.evaluate(() => ({ gone: !document.getElementById('pth-game'), pad: window._pthPadOwner, on: window._pthGameOn, ach: window._achSeen,
    login: document.getElementById('s-connect').classList.contains('active') }));
  ok(closed.gone && !closed.pad && !closed.on && closed.login, label + ': Esc from the arcade page goes back to the login and releases the gamepad and the mascot');
  if (label === 'desktop') ok(closed.ach.indexOf('runner') >= 0, label + ': secret trophy granted on the way out');
  // An ordinary nickname: a normal training game, no overlay.
  await pg.fill('#nick', 'Narmod');
  await pg.evaluate(() => App.connect());
  await sleep(2500);
  ok(await pg.evaluate(() => !document.getElementById('pth-game') && document.getElementById('s-connect').classList.contains('active') === false), label + ': an ordinary nickname starts a normal training game');
  await ctx.close();
}
// ── The page: rules, header back, turning the phone, light theme ──
{
  const { ctx, pg } = await fresh(390, 844);
  await pg.fill('#nick', 'Mascotte');
  await pg.evaluate(() => App.connect());
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pg.click('#pth-game [data-rules="1"]');
  await sleep(200);
  const r = await pg.evaluate(() => ({ open: !document.querySelector('#pth-game .pg-rules').hidden,
    h: (document.querySelector('#pth-game .pg-sheet h3') || {}).textContent, li: document.querySelectorAll('#pth-game .pg-sheet li').length }));
  ok(r.open && r.h === 'Château de cartes' && r.li === 6, 'page: « Rules » explains the game (' + r.h + ', ' + r.li + ' points)');
  await shot(pg, 'page-rules');
  await pg.click('#pth-game .pg-sheet [data-r="play"]');
  await pg.waitForFunction(() => window._pthPadOwner === 'house', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => document.getElementById('ar-title').textContent === 'Château de cartes'), 'page: « Play » from the rules opens the game, its name in the header');
  await pg.keyboard.press('Space');
  await sleep(400);
  await pg.click('#ar-help-btn');
  await sleep(200);
  const hp = await pg.evaluate(() => ({ open: !document.querySelector('#pth-game .pg-rules').hidden, paused: !document.querySelector('#pth-game .pg-pause').hidden }));
  ok(hp.open && hp.paused, 'page: « ? » in the header shows the rules and pauses the game');
  await pg.click('#pth-game .pg-sheet [data-r="close"]');
  await sleep(200);
  const size = () => pg.evaluate(() => { const s = document.querySelector('#pth-game .pg-stage').getBoundingClientRect(), m = document.getElementById('arcade-main').getBoundingClientRect();
    return { w: Math.round(s.width), h: Math.round(s.height), inside: s.left >= m.left - 1 && s.right <= m.right + 1 && s.top >= m.top - 1 && s.bottom <= m.bottom + 1,
      land: document.querySelector('#pth-game .pg-play').classList.contains('pg-land'), cw: document.querySelector('#pth-game canvas').width }; });
  const p1 = await size();
  await pg.setViewportSize({ width: 844, height: 390 });
  await sleep(500);
  const p2 = await size();
  await shot(pg, 'page-landscape');
  await pg.setViewportSize({ width: 390, height: 844 });
  await sleep(500);
  const p3 = await size();
  ok(p1.inside && p2.inside && p3.inside && p2.w > p1.w && p2.land && !p3.land && p3.w === p1.w, 'page: portrait → landscape → portrait, the stage follows (' + p1.w + '×' + p1.h + ' → ' + p2.w + '×' + p2.h + ' → ' + p3.w + '×' + p3.h + ')');
  await pg.evaluate(() => document.documentElement.setAttribute('data-theme', 'pokerth-light'));
  await sleep(300);
  ok(await pg.evaluate(() => document.getElementById('pth-game').classList.contains('pg-light')), 'page: the light theme paints the arcade light');
  await shot(pg, 'page-light');
  await pg.click('#ar-back-btn');
  await sleep(400);
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card') && document.getElementById('s-arcade').classList.contains('active')), 'page: the header\'s back arrow goes from a game to the arcade page');
  await shot(pg, 'page-light-home');
  await pg.click('#ar-back-btn');
  await sleep(500);
  ok(await pg.evaluate(() => !document.getElementById('pth-game') && document.getElementById('s-connect').classList.contains('active')), 'page: and from the arcade page back to the login');
  await ctx.close();
}
// ── Every trophy won: the Ace comes with the secret word (Ace's Help off) ──
{
  const { ctx, pg } = await fresh(1280, 800);
  await pg.evaluate(async () => {
    const st = await import('/modules/achievements/store.mjs');
    const { ACHIEVEMENTS } = await import('/modules/achievements/defs.mjs');
    const store = st.createStore();
    ACHIEVEMENTS.filter((d) => d.cat !== 'secret').forEach((d) => store.unlock(d.id));
    window.dispatchEvent(new CustomEvent('pth-achievement', { detail: { id: 'collector' } }));
  });
  await pg.waitForFunction(() => /mascotte/.test((document.querySelector('#ace-dock .ad-bubble') || {}).textContent || ''), null, { timeout: 10000 }).catch(() => {});
  const bub = await pg.evaluate(() => ({ text: (document.querySelector('#ace-dock .ad-bubble') || {}).textContent || '', told: localStorage.getItem('pth_arcade_told'),
    btns: [...document.querySelectorAll('#ace-dock .ad-bubble button')].map((b) => b.textContent.trim()) }));
  ok(/mascotte/.test(bub.text) && bub.told === '1', 'all trophies: the Ace gives the secret word (« ' + bub.text.slice(0, 60) + '… »)');
  ok(bub.btns.indexOf('Jouer maintenant') >= 0, 'his bubble offers « Play now » (' + bub.btns.join(', ') + ')');
  await pg.evaluate(() => { const b = [...document.querySelectorAll('#ace-dock .ad-bubble button')].find((x) => x.textContent.trim() === 'Jouer maintenant'); if (b) b.click(); });
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card')), '« Play now » opens the arcade');
  await shot(pg, 'reveal-arcade');
  await ctx.close();
}
ok(errors.length === 0, 'no page error' + (errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''));
await b.close();
server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
