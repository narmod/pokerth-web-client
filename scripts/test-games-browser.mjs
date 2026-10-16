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

// Open game `id` from the arcade's home with the keys: → up to its card, then Space.
async function pick(pg, id) {
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  const n = await pg.evaluate((g) => [...document.querySelectorAll('#pth-game .gm-card .gm-art')].findIndex((a) => a.getAttribute('data-art') === g), id);
  for (let i = 0; i < n; i++) await pg.keyboard.press('ArrowRight');
  await sleep(100);
  await pg.keyboard.press('Space');
}
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
    tiles: [...document.querySelectorAll('#pth-game .gm-card h3')].map((b) => b.lastChild.textContent),
    arts: [...document.querySelectorAll('#pth-game .gm-card .gm-art svg')].length,
    shelves: document.querySelectorAll('#pth-game .gm-shelf').length,
  }));
  ok(st.open && st.ace && st.page && st.title === 'Mini-jeux', label + ': the mini-games page opens with the Ace');
  ok(st.back && st.menu, label + ': with the header of the other pages (back, ⚙ menu)');
  const ALL = ['Ace Runner', 'Château de cartes', 'Poker Solitaire', 'Vidéo Poker', 'Qui gagne ?', 'Plus haut / Plus bas', 'Le Bluff de l\'As'];
  ok(ALL.every((n) => st.tiles.indexOf(n) >= 0) && st.shelves === 0 && st.tiles.length === ALL.length, label + ': it lists the games, no category (' + st.tiles.join(', ') + ')');
  ok(st.arts === st.tiles.length, label + ': every game has its picture (' + st.arts + ')');
  ok(st.nick === 'Narmod' && st.stored === 'Narmod', label + ': the real nickname is back (field ' + st.nick + ', stored ' + st.stored + ')');
  ok(st.pad === 'arcade', label + ': the gamepad navigation steps aside');
  await shot(pg, label + '-menu');
  // ── Ace Runner ──
  await pick(pg, 'ace-runner');
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
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card') && document.getElementById('ar-title').textContent === 'Mini-jeux'), label + ': Esc again goes back to the mini-games page');
  // ── House of Cards ──
  await pick(pg, 'house');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Château de cartes', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'house'), label + ': its card then Space opens the House of Cards');
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
  await pick(pg, 'solitaire');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Poker Solitaire', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'solitaire' && document.querySelectorAll('#pth-game .pg-panel .gm-tile').length === 2), label + ': its card then Space opens Poker Solitaire (daily / free)');
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
  // ── Video Poker (daily challenge): a pair of jacks pays, then double or nothing ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'videopoker');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Vidéo Poker', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'videopoker' && document.getElementById('ar-title').textContent === 'Vidéo Poker'), label + ': its card then Space opens Video Poker');
  await pg.keyboard.press('Space');
  await sleep(400);
  const vp0 = await pg.evaluate(() => ({ st: window.__pthVP.state(), cr: document.querySelector('#pth-game .vp-cr').textContent, h: document.querySelector('#pth-game .vp-h').textContent }));
  ok(vp0.st === 'hold' && vp0.cr === '95' && vp0.h === '1/20', label + ': a hand is dealt for 5 credits (' + vp0.cr + ', ' + vp0.h + ')');
  await shot(pg, label + '-vp-hold');
  await pg.keyboard.press('Space');                // holds the first card
  await sleep(150);
  ok(await pg.evaluate(() => window.__pthVP.run().held[0] === true), label + ': Space holds the card under the cursor');
  await pg.evaluate(() => { const G = window.__pthVP.run(); G.cards = [9, 22, 2, 18, 33]; G.held = [true, true, true, true, true]; });   // J♦ J♥ 4♦ 7♥ 9♠
  await pg.keyboard.press('ArrowDown');
  await pg.waitForFunction(() => window.__pthVP.state() === 'win', null, { timeout: 4000 }).catch(() => {});
  const vp1 = await pg.evaluate(() => ({ st: window.__pthVP.state(), win: window.__pthVP.run().win }));
  ok(vp1.st === 'win' && vp1.win === 5, label + ': Jacks or Better pays 5 (' + vp1.st + ', ' + vp1.win + ')');
  await shot(pg, label + '-vp-win');
  await pg.keyboard.press('ArrowUp');
  await sleep(300);
  ok(await pg.evaluate(() => window.__pthVP.state() === 'double'), label + ': ↑ doubles: the Ace turns a card');
  await shot(pg, label + '-vp-double');
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => ['win', 'ready'].indexOf(window.__pthVP.state()) >= 0, null, { timeout: 4000 }).catch(() => {});
  const vp2 = await pg.evaluate(() => ({ st: window.__pthVP.state(), win: window.__pthVP.run().win }));
  ok((vp2.st === 'win' && vp2.win >= 5) || (vp2.st === 'ready' && vp2.win === 0), label + ': the pick settles the double (' + vp2.st + ', ' + vp2.win + ')');
  if (vp2.st === 'win') { await pg.keyboard.press('ArrowDown'); await sleep(300); }
  const vp3 = await pg.evaluate(() => ({ st: window.__pthVP.state(), cr: +document.querySelector('#pth-game .vp-cr').textContent }));
  ok(vp3.st === 'ready' && vp3.cr === 95 + (vp2.st === 'win' ? vp2.win : 0), label + ': collected, ready for the next hand (' + vp3.cr + ')');
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(500);
  // ── Who Wins?: the right hand scores, a wrong one costs a heart ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'whowins');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Qui gagne ?', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'whowins'), label + ': its card then Space opens Who Wins?');
  await pg.keyboard.press('Space');
  await sleep(300);
  const keyFor = (w) => (w === 1 ? 'ArrowLeft' : w === -1 ? 'ArrowRight' : 'ArrowDown');
  const w1 = await pg.evaluate(() => window.__pthWW.run().q.win);
  await shot(pg, label + '-ww-ask');
  await pg.keyboard.press(keyFor(w1));
  await sleep(250);
  const ww1 = await pg.evaluate(() => ({ st: window.__pthWW.state(), ok: window.__pthWW.run().ok, score: +document.querySelector('#pth-game .ww-score').textContent }));
  ok(ww1.st === 'shown' && ww1.ok && ww1.score >= 10, label + ': the right hand scores (' + ww1.score + ')');
  await shot(pg, label + '-ww-shown');
  await sleep(600);
  await pg.keyboard.press('Space');               // go on
  await sleep(300);
  const w2 = await pg.evaluate(() => window.__pthWW.run().q.win);
  await pg.keyboard.press(keyFor(w2 === 1 ? -1 : 1));
  await sleep(250);
  const ww2 = await pg.evaluate(() => ({ ok: window.__pthWW.run().ok, lives: window.__pthWW.run().lives, hud: document.querySelector('#pth-game .ww-lives').textContent }));
  ok(!ww2.ok && ww2.lives === 2 && ww2.hud === '❤❤♡', label + ': a wrong answer costs a heart (' + ww2.hud + ')');
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(500);
  // ── Higher or Lower: a right guess grows the pot, Space banks it, a wrong one costs a heart ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'hilo');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Plus haut / Plus bas', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'hilo'), label + ': its card then Space opens Higher or Lower');
  await pg.keyboard.press('Space');
  await sleep(300);
  // A 7♦ face up, a K♠ next: ↑ wins.
  await pg.evaluate(() => { const G = window.__pthHL.run(); G.cur = 5; G.shoe = G.shoe.filter((c) => c !== 5 && c !== 37); G.shoe.push(37); });
  await shot(pg, label + '-hl-guess');
  await pg.keyboard.press('ArrowUp');
  await pg.waitForFunction(() => window.__pthHL.state() === 'guess', null, { timeout: 3000 }).catch(() => {});
  const hl1 = await pg.evaluate(() => ({ pot: window.__pthHL.run().pot, streak: window.__pthHL.run().streak, cur: window.__pthHL.run().cur }));
  ok(hl1.pot > 10 && hl1.streak === 1 && hl1.cur === 37, label + ': ↑ on a 7 with a K next: the pot grows (' + hl1.pot + ')');
  await shot(pg, label + '-hl-won');
  await pg.keyboard.press('Space');
  await sleep(200);
  const hl2 = await pg.evaluate(() => ({ score: +document.querySelector('#pth-game .hl-score').textContent, pot: window.__pthHL.run().pot }));
  ok(hl2.score === hl1.pot && hl2.pot === 10, label + ': Space banks the pot (' + hl2.score + ')');
  await pg.evaluate(() => { const G = window.__pthHL.run(); G.shoe = G.shoe.filter((c) => c !== 0); G.shoe.push(0); });   // a 2♦ next
  await pg.keyboard.press('ArrowUp');
  await pg.waitForFunction(() => window.__pthHL.state() === 'guess', null, { timeout: 3000 }).catch(() => {});
  ok(await pg.evaluate(() => window.__pthHL.run().lives === 2 && window.__pthHL.run().pot === 10), label + ': a wrong guess loses the pot and a heart');
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(500);
  // ── The Ace's Bluff: he bets, Call shows his cards; Fold gives up the ante ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'bluff');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Le Bluff de l\'As', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'bluff'), label + ": its card then Space opens the Ace's Bluff");
  await pg.keyboard.press('Space');
  const toDecide = async () => {
    for (let i = 0; i < 12; i++) {
      await pg.waitForFunction(() => ['decide', 'shown', 'over'].indexOf(window.__pthBL.state()) >= 0, null, { timeout: 5000 }).catch(() => {});
      const st = await pg.evaluate(() => window.__pthBL.state());
      if (st === 'decide' || st === 'over') return st;
      await pg.keyboard.press('Space');            // a check: go on to the next hand
      await sleep(150);
    }
    return '';
  };
  ok(await toDecide() === 'decide', label + ': the Ace bets and waits for an answer');
  await shot(pg, label + '-bl-decide');
  const bl0 = await pg.evaluate(() => ({ chips: window.__pthBL.run().chips, bet: window.__pthBL.run().bet }));
  await pg.keyboard.press('Space');
  await sleep(300);
  const bl1 = await pg.evaluate(() => ({ st: window.__pthBL.state(), called: window.__pthBL.run().called, net: window.__pthBL.run().net, chips: window.__pthBL.run().chips }));
  ok(bl1.st === 'shown' && bl1.called && bl1.chips === bl0.chips - bl0.bet + (bl1.net + 5 + bl0.bet), label + ': Space calls, his cards are shown (net ' + bl1.net + ')');
  await shot(pg, label + '-bl-shown');
  await pg.keyboard.press('Space');
  await sleep(200);
  if (await toDecide() === 'decide') {
    const before = await pg.evaluate(() => window.__pthBL.run().chips);
    await pg.keyboard.press('ArrowDown');
    await sleep(300);
    ok(await pg.evaluate((b) => window.__pthBL.state() === 'shown' && window.__pthBL.run().folded && window.__pthBL.run().chips === b, before), label + ': ↓ folds: only the ante is lost');
  }
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(500);
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
  await pg.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="house"]').closest('.gm-card'); c.querySelector('[data-rules]').click(); });
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
  const sky = () => pg.evaluate(() => { const st = document.querySelector('#pth-game .gm-art[data-art="ace-runner"] stop'); return st && st.getAttribute('stop-color'); });
  const skyLight = await sky();
  await pg.evaluate(() => document.documentElement.setAttribute('data-theme', 'pokerth'));
  await sleep(300);
  const skyDark = await sky();
  ok(skyLight === '#f7f0e3' && skyDark === '#0a100e', 'page: the pictures follow the theme (' + skyLight + ' → ' + skyDark + ')');
  await shot(pg, 'page-dark-home');
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
