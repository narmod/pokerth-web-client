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
/** The end screen (end.mjs, web.67): waits for it (the cards turned, the score counted up), reads it. */
const endInfo = async (pg, ms) => {
  await pg.waitForSelector('#pth-game .gm-endc .gm-erest:not(.gm-ewait)', { timeout: ms || 15000 }).catch(() => {});
  await sleep(1100);
  return pg.evaluate(() => {
    const q = (x) => document.querySelector('#pth-game .gm-endc ' + x), tx = (x) => (q(x) || {}).textContent || '';
    return { on: !!document.querySelector('#pth-game .pg-panel.gm-end .gm-endc'), title: tx('h2'), score: tx('.gm-esv'), calc: tx('.gm-ecalc'), lv: tx('.gm-elv'), stats: tx('.gm-estats'),
      rec: tx('.gm-enew') + tx('.gm-erec'), note: tx('.gm-enote'), cards: document.querySelectorAll('#pth-game .gm-ecards .pk:not(.back)').length,
      backs: document.querySelectorAll('#pth-game .gm-ecards .pk.back').length, btns: [...document.querySelectorAll('#pth-game .gm-ebtns [data-e]')].map((b) => b.textContent),
      steps: document.querySelectorAll('#pth-game .gm-esteps i').length, bars: document.querySelectorAll('#pth-game .gm-ebars i').length,
      list: document.querySelectorAll('#pth-game .gm-elist > div').length, focusA: !!(document.activeElement && document.activeElement.classList.contains('gm-eA')) };
  });
};
const shot = async (pg, name) => { if (!SHOTS) return; mkdirSync('.shots', { recursive: true }); await pg.screenshot({ path: '.shots/games-' + name + '.png' }); };

// Open game `id` from the arcade's home with the keys: → up to its card, then Space.
async function pick(pg, id) {
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  const n = await pg.evaluate((g) => [...document.querySelectorAll('#pth-game .gm-card .gm-art')].findIndex((a) => a.getAttribute('data-art') === g), id);
  for (let i = 0; i < n; i++) await pg.keyboard.press('ArrowRight');
  await sleep(100);
  await pg.keyboard.press('Space');
}
// The secret word (web.40): back on the choice of modes, the card out of its
// egg, the Ace's word; then the card's tap opens the mini-games page.
async function secretWord(pg) {
  await pg.evaluate(() => App.connect());
  await pg.waitForFunction(() => /🥚|😄/.test((document.querySelector('#ace-dock .ad-bubble') || {}).textContent || ''), null, { timeout: 15000 }).catch(() => {});
  const r = await pg.evaluate(() => ({
    step1: document.getElementById('login-step1').style.display !== 'none',
    card: !document.getElementById('login-card-arcade').hidden, page: !!document.getElementById('pth-game'),
    bubble: (document.querySelector('#ace-dock .ad-bubble') || {}).textContent || '', all: localStorage.getItem('pth_arcade_all'),
  }));
  await pg.evaluate(() => { window.loginOpenArcade(); });   // resolves when the page closes: not awaited
  return r;
}
console.log('test-games-browser');
for (const [w, h, label] of [[1280, 800, 'desktop'], [390, 844, 'phone']]) {
  const { ctx, pg } = await fresh(w, h);
  ok(await pg.evaluate(() => document.getElementById('server-mode').value === 'offline' && !!window.PthGames), label + ': training selected, games registry loaded');
  await pg.click('#nick');
  await pg.fill('#nick', '');
  await pg.type('#nick', 'Mascotte', { delay: 15 });
  await pg.evaluate(() => { window._achSeen = []; window.addEventListener('pth-achievement', (e) => window._achSeen.push(e.detail && e.detail.id)); });
  const egg = await secretWord(pg);
  ok(egg.step1 && egg.card && !egg.page && egg.all === '1' && /mot secret/.test(egg.bubble), label + ': the secret word: back on the modes, the card out of its egg, the Ace\'s word, no page (« ' + egg.bubble.slice(0, 40) + '… »)');
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
  const ALL = ['Ace Runner', 'Château de cartes', 'Tapis !', 'Poker Solitaire', 'Vidéo Poker', 'Qui gagne ?', 'Plus haut / Plus bas', 'Le Bluff de l\'As', 'Puissance Poker', 'Ace Dash', 'Poker Run'];
  ok(ALL.every((n) => st.tiles.indexOf(n) >= 0) && st.shelves === 0 && st.tiles.length === ALL.length, label + ': it lists the games, no category (' + st.tiles.join(', ') + ')');
  ok(st.arts === st.tiles.length, label + ': every game has its picture (' + st.arts + ')');
  ok(st.nick === 'Narmod' && st.stored === 'Narmod', label + ': the real nickname is back (field ' + st.nick + ', stored ' + st.stored + ')');
  ok(st.pad === 'arcade', label + ': the gamepad navigation steps aside');
  await shot(pg, label + '-menu');
  // web.98: the sound button in the mini-games' header (the arcade and each game share it): the table's popover, mute.
  await pg.click('#sound-toggle-btn-arcade');
  await pg.waitForSelector('.sound-pop', { timeout: 3000 }).catch(() => {});
  const snd0 = await pg.evaluate(() => ({ pop: !!document.querySelector('.sound-pop'), vis: (() => { const b = document.getElementById('sound-toggle-btn-arcade'); const r = b.getBoundingClientRect(); return r.width > 0 && r.right <= innerWidth + 1; })() }));
  await pg.click('.sound-pop .sound-pop-mute');
  const snd1 = await pg.evaluate(() => ({ ls: localStorage.getItem('pth_sound'), op: document.getElementById('sound-toggle-btn-arcade').style.opacity, pressed: document.getElementById('sound-toggle-btn-arcade').getAttribute('aria-pressed') }));
  await pg.click('.sound-pop .sound-pop-mute');
  const snd2 = await pg.evaluate(() => ({ ls: localStorage.getItem('pth_sound'), op: document.getElementById('sound-toggle-btn-arcade').style.opacity }));
  await pg.mouse.click(5, 300);
  await sleep(150);
  const snd3 = await pg.evaluate(() => !document.querySelector('.sound-pop'));
  ok(snd0.pop && snd0.vis && snd1.ls === '0' && snd1.op === '0.5' && snd1.pressed === 'true' && snd2.ls === '1' && snd2.op === '' && snd3,
    label + ': the 🔊 button in the mini-games\' header: the sound popover, mute and back on, closed by a tap outside (' + JSON.stringify([snd0, snd1, snd2, snd3]) + ')');
  // ── Ace Runner ──
  await pick(pg, 'ace-runner');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Ace Runner', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'ace-runner'), label + ': Space opens Ace Runner');
  ok(await pg.evaluate(() => { const p = document.querySelector('#pth-game .pg-panel'); return p.classList.contains('gm-title') && p.querySelectorAll('.gm-tile').length === 3 && !p.querySelector('.gm-bg') && !p.querySelector('.gm-opt'); }),
    label + ': the common title: three modes for Ace Runner (free run, daily, time attack), its own scene behind (no picture), no 🏆 while the Hall of Fame is off');
  await shot(pg, label + '-title');
  await pg.keyboard.press('Space');
  await sleep(1200);
  const run = await pg.evaluate(() => ({ hidden: document.querySelector('#pth-game .pg-panel').hidden, dist: document.querySelector('#pth-game .ar-num').textContent }));
  ok(run.hidden && +run.dist > 0, label + ': Space starts the run (distance ' + run.dist + ')');
  await shot(pg, label + '-run');
  // Level 11: the second venue arrives with its name on the banner.
  const jump = await pg.evaluate(async () => {
    const G = window.__pthAR.run(); G.allInUntil = performance.now() + 1500; G.dist = 10 * 300 + 2;
    await new Promise((r) => setTimeout(r, 250));
    return { venue: G.venue, banner: G.banner && G.banner.s, level: G.level, hand: (document.querySelector('#pth-game .ar-hand') || {}).textContent || '' };
  });
  ok(jump.level === 11 && jump.venue === 1 && jump.banner === 'Las Vegas', label + ': level 11, a new venue and its name (' + jump.banner + ', level ' + jump.level + ')');
  // Nobody jumps: the first obstacle ends the run, then the showdown.
  const over = Object.assign(await endInfo(pg, 20000), { best: await pg.evaluate(() => localStorage.getItem('pth_game_best_ace-runner')) });
  ok(over.on && /Distance/.test(over.calc) && +over.score.replace(/\D/g, '') > 0 && over.best !== null, label + ': busted, the end screen: the score, how it was made, saved (' + over.score + ' · ' + over.calc + ')');
  ok(over.backs === 0, label + ': showdown cards all turned (' + over.cards + ')');
  ok(over.title === 'Éliminé !', label + ': texts in the player\'s language');
  ok(over.steps === 6 && /Niveau/.test(over.lv) && /Distance/.test(over.stats), label + ': the venues reached, three stat tiles (' + over.lv + ')');
  ok(over.btns.length === 2 && /Rejouer/.test(over.btns[0]) && /Menu du jeu/.test(over.btns[1]) && over.focusA, label + ': « Rejouer » (lit) and « Menu du jeu » (' + over.btns.join(' / ') + ')');
  await shot(pg, label + '-over');
  // web.94: the daily challenge deals the same course twice; the time attack: a crash costs 5 s, not the run.
  const ard = await pg.evaluate(async () => {
    const A = window.__pthAR; A.start('daily'); const d1 = A.run().deck.join(), m = A.mode();
    A.start('daily'); const d2 = A.run().deck.join();
    A.start('free'); const d3 = A.run().deck.join();
    return { m, same: d1 === d2, other: d1 !== d3 };
  });
  ok(ard.m === 'daily' && ard.same && ard.other, label + ': Ace Runner daily challenge: the same deck for everyone today (' + JSON.stringify(ard) + ')');
  const art = await pg.evaluate(async () => {
    const A = window.__pthAR; A.start('time'); await new Promise((r) => setTimeout(r, 300));
    const G = A.run(), lab = document.querySelector('#pth-game .ar-lv-lab').textContent, t0 = G.time;
    G.allInUntil = 0; G.ins = false; G.safeUntil = 0;
    G.obs.push({ type: 'stack', x: 120, w: 30, n: 6, h: 40, col: 0 });
    await new Promise((r) => setTimeout(r, 200));
    const after = { st: A.state(), hits: G.hits, lost: t0 - G.time };
    G.time = 0.05; await new Promise((r) => setTimeout(r, 400));
    return { lab, t0, after, st: A.state(), best: JSON.parse(localStorage.getItem('pth_ar_best') || '{}').time > 0 };
  });
  ok(art.lab === 'Temps' && art.t0 > 85 && art.after.st === 'run' && art.after.hits === 1 && art.after.lost > 4.5 && art.st === 'over' && art.best,
    label + ': Ace Runner time attack: 90 s, a crash costs 5 s and the run goes on, time up ends it, its record saved (' + JSON.stringify(art) + ')');
  const tu = await endInfo(pg, 4000);
  ok(tu.on && tu.title === 'Temps écoulé !', label + ': time attack: « Temps écoulé ! » (' + tu.title + ')');
  // web.96: the Hall of Fame (hof.mjs), its server mocked: 3 letters typed on the end screen, then the boards on the title.
  const hofSent = [];
  await pg.route('**/__hof/start', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, ticket: 'tk.sig', names: 'initials' }) }));
  await pg.route('**/__hof/score', (r) => { const b = JSON.parse(r.request().postData() || '{}'); hofSent.push(b);
    r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, rank: 3, best: b.s, name: String(b.name || '').toUpperCase(), names: 'initials', day: '2026-11-16', boards: { free: [{ n: 'AAA', s: 9e6, ts: Date.now() }, { n: 'BBB', s: 8e6, ts: Date.now() }, { n: 'ABC', s: b.s, ts: Date.now() }], daily: [], time: [] } }) }); });
  await pg.route('**/__hof?g=*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, names: 'initials', day: '2026-11-16', top: 20, topDay: 10, boards: { free: [{ n: 'AAA', s: 9e6, ts: Date.now() }, { n: 'ABC', s: 1234, ts: Date.now() }], daily: [], time: [] } }) }));
  await pg.evaluate(async () => {
    const A = window.__pthAR; A.start('free'); await new Promise((r) => setTimeout(r, 400));
    const G = A.run(); G.allInUntil = 0; G.ins = false; G.safeUntil = 0; G.dist = Math.max(G.dist, 50);
    G.obs.push({ type: 'stack', x: 120, w: 30, n: 6, h: 40, col: 0 });
  });
  await pg.waitForSelector('#pth-game .gm-hof input', { timeout: 8000 }).catch(() => {});
  const hf1 = await pg.evaluate(() => ({ txt: (document.querySelector('#pth-game .gm-hof') || {}).textContent || '', input: !!document.querySelector('#pth-game .gm-hof input.gm-h3'),
    no: !!document.querySelector('#pth-game .gm-hof .gm-hno'), rem: !!document.querySelector('#pth-game .gm-hof input.gm-hrem') }));
  ok(hf1.input && hf1.no && hf1.rem && /N° 3 du Hall of Fame ! Inscrire ton score \?/.test(hf1.txt) && /visibles par tous/.test(hf1.txt) && hofSent.length === 0,
    label + ': Hall of Fame: nothing sent yet — the end screen asks first (rank, what everyone will see, 3 letters, No thanks, remember my choice) (' + hf1.txt + ')');
  await pg.fill('#pth-game .gm-hof input', 'abc');
  await pg.press('#pth-game .gm-hof input', 'Enter');
  await pg.waitForFunction(() => /N° 3/.test((document.querySelector('#pth-game .gm-hof') || {}).textContent || ''), null, { timeout: 5000 }).catch(() => {});
  const hf2 = await pg.evaluate(() => ({ txt: document.querySelector('#pth-game .gm-hof').textContent, saved: localStorage.getItem('pth_hof_name'), st: window.__pthAR.state() }));
  ok(/N° 3 du Hall of Fame/.test(hf2.txt) && /"initials":"ABC"/.test(hf2.saved) && hf2.st === 'over' && hofSent.length === 1 && hofSent[0].name === 'ABC' && hofSent[0].m === 'free' && hofSent[0].ticket === 'tk.sig' && hofSent[0].s > 0,
    label + ': Hall of Fame: ABC sent with the run\'s ticket, « N° 3 », kept for next time, typing did not restart the run (' + hf2.txt + ')');
  await pg.evaluate(() => window.__pthAR.hof());
  await pg.waitForSelector('#pth-game .gm-hlist li', { timeout: 5000 }).catch(() => {});
  ok(await pg.evaluate(() => /Public : nom, score et date visibles par tous les joueurs\. Rien n'est envoyé sans ton accord \(Options avancées › Communauté\)/.test((document.querySelector('#pth-game .gm-hinfo') || {}).textContent || '') && !!document.querySelector('#pth-game .gm-hforget')),
    label + ': Hall of Fame: the boards say what is public and where to choose, « Retirer mes scores » is there');
  const hf3 = await pg.evaluate(() => ({ tabs: document.querySelectorAll('#pth-game .gm-htabs button').length, rows: document.querySelectorAll('#pth-game .gm-hlist li').length, me: (document.querySelector('#pth-game .gm-hlist li.me') || {}).textContent || '', st: window.__pthAR.state(), h: (document.querySelector('#pth-game .gm-endc h2') || {}).textContent }));
  ok(hf3.tabs === 3 && hf3.rows === 2 && /ABC/.test(hf3.me) && hf3.st === 'board' && /Hall of Fame/.test(hf3.h), label + ': Hall of Fame on the title: a tab per mode, the board, the player\'s line lit (' + JSON.stringify(hf3) + ')');
  await pg.click('#pth-game .gm-htabs [data-h="2"]');
  ok(await pg.evaluate(() => /Pas encore de score/.test(document.querySelector('#pth-game .gm-endc').textContent)), label + ': Hall of Fame: an empty board says so');
  // « Remove my scores »: confirmed, sent with this browser's key, and no longer taking part.
  let forgetBody = null;
  await pg.route('**/__hof/forget', (r) => { forgetBody = JSON.parse(r.request().postData() || '{}'); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, removed: 2 }) }); });
  pg.once('dialog', (dl) => dl.accept());
  await pg.click('#pth-game .gm-hforget');
  await pg.waitForFunction(() => /Scores retirés : 2/.test((document.querySelector('#pth-game .gm-hmsg') || {}).textContent || ''), null, { timeout: 5000 }).catch(() => {});
  const hf4 = await pg.evaluate(() => ({ msg: (document.querySelector('#pth-game .gm-hmsg') || {}).textContent || '', opt: localStorage.getItem('pth_hof_opt'), dev: localStorage.getItem('pth_hof_dev') }));
  ok(/Scores retirés : 2/.test(hf4.msg) && hf4.opt === 'no' && forgetBody && forgetBody.dev === hf4.dev && /^[0-9a-f]{32}$/.test(hf4.dev) && hofSent[0].dev === hf4.dev,
    label + ': Hall of Fame: « Retirer mes scores » takes them back with this browser\'s key, then « never » (' + JSON.stringify(hf4) + ')');
  await pg.keyboard.press('Escape');
  await sleep(300);
  ok(await pg.evaluate(() => window.__pthAR.state() === 'title' && !!document.querySelector('#pth-game .pg-panel.gm-title .gm-opt')), label + ': Hall of Fame: Escape goes back to the title, its 🏆 chip');
  // « Never »: the next run asks nothing, sends nothing.
  const sentBefore = hofSent.length;
  await pg.evaluate(async () => {
    const A = window.__pthAR; A.start('free'); await new Promise((r) => setTimeout(r, 400));
    const G = A.run(); G.allInUntil = 0; G.ins = false; G.safeUntil = 0; G.dist = Math.max(G.dist, 50);
    G.obs.push({ type: 'stack', x: 120, w: 30, n: 6, h: 40, col: 0 });
  });
  await sleep(2500);
  ok(await pg.evaluate(() => window.__pthAR.state() === 'over' && !((document.querySelector('#pth-game .gm-hof') || {}).textContent || '')) && hofSent.length === sentBefore,
    label + ': Hall of Fame: « never »: nothing asked, nothing sent');
  await pg.evaluate(() => { localStorage.removeItem('pth_hof_opt'); });
  await pg.unroute('**/__hof/start'); await pg.unroute('**/__hof/score'); await pg.unroute('**/__hof?g=*'); await pg.unroute('**/__hof/forget');
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
  // ── Tapis! (web.75): the 4th game of the path ──
  await pick(pg, 'tapis');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Tapis !', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'tapis' && document.querySelectorAll('#pth-game .pg-panel .gm-tile').length === 5), label + ': Tapis!: its card opens it, five modes on its title (Classic, Madness, Daily, Zen, Duel)');
  await pg.keyboard.press('Space');
  await sleep(1500);
  const tps = await pg.evaluate(() => {
    const T = window.__pthTapis, G = T.run();
    let c0 = -1, r0 = -1, n = 0;
    // the first group of 2 or more on the board
    for (let c = 0; c < G.grid.length && c0 < 0; c++) for (let r = 0; r < G.grid[c].length; r++) {
      const k = G.grid[c][r].k;
      if ((G.grid[c][r + 1] && G.grid[c][r + 1].k === k) || (G.grid[c + 1] && G.grid[c + 1][r] && G.grid[c + 1][r].k === k)) { c0 = c; r0 = r; break; }
    }
    const before = G.grid.reduce((a, col) => a + col.length, 0), s0 = G.score;
    T.act(c0, r0);
    n = before - G.grid.reduce((a, col) => a + col.length, 0);
    return { state: T.state(), cols: G.grid.length, actors: document.querySelectorAll('#pth-game .pg-layer > div[id^="pth-game-tp"]').length, n, gained: G.score - s0 };
  });
  ok(tps.state === 'run' && tps.cols >= 6 && tps.actors === tps.cols && tps.n >= 2 && tps.gained > 0, label + ': Tapis!: Space starts, a friend on every column, a group taken pays (' + tps.n + ' chips, +' + tps.gained + ', ' + tps.state + ', ' + tps.actors + '/' + tps.cols + ')');
  await shot(pg, label + '-tapis');
  // web.89 (Monster Madness, the video at 0:56-1:08): an emptied column goes once its friend is in his hole, the others close up
  const tpc = await pg.evaluate(async () => {
    const T = window.__pthTapis, G = T.run(), n0 = G.cols - G.grid.filter((col) => !col.length).length;
    const idx = G.grid.map((col, c) => c).filter((c) => G.grid[c].length && G.chars[c].st === 'top').slice(0, 2);
    const gone = idx.map((c) => G.chars[c]);
    idx.forEach((c) => G.grid[c].splice(0));
    await new Promise((r) => setTimeout(r, 3500));
    const xs = G.grid.map((_, c) => T.screenOf(c, 0).x), step = xs.length > 1 ? xs[1] - xs[0] : 0;
    return { n0, n: G.cols, in: gone.every((ch) => ch.st === 'in' && !G.chars.includes(ch)), even: xs.every((x, i) => i === 0 || Math.abs(x - xs[i - 1] - step) < 0.5), state: T.state() };
  });
  ok(tpc.n === tpc.n0 - 2 && tpc.in && tpc.even && tpc.state === 'run', label + ': Tapis!: two emptied columns go once their friends are in their holes, the others close up (' + JSON.stringify(tpc) + ')');
  // web.92: one touch takes the group (the double touch of web.86 is gone)
  const tpdt = await pg.evaluate(async () => {
    const T = window.__pthTapis, G = T.run();
    let at = null;
    for (let c = 0; c < G.grid.length && !at; c++) for (let r = 0; r < G.grid[c].length; r++) {
      const k = G.grid[c][r].k;
      if (k >= 0 && !G.grid[c][r].seal && G.grid[c][r + 1] && G.grid[c][r + 1].k === k && !G.grid[c][r + 1].seal) { at = [c, r]; break; }
    }
    const touch = () => { const p = T.screenOf(at[0], at[1]), st = document.querySelector('#pth-game .pg-stage') || document.elementFromPoint(p.x, p.y);
      st.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', clientX: p.x, clientY: p.y, bubbles: true, cancelable: true, isPrimary: true }));
      st.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', clientX: p.x, clientY: p.y, bubbles: true, cancelable: true, isPrimary: true })); };
    const n0 = G.grid.reduce((a, col) => a + col.length, 0);
    touch(); await new Promise((r) => setTimeout(r, 150));
    const n1 = G.grid.reduce((a, col) => a + col.length, 0), picked = !!T.picked();
    return { at, n0, n1, picked };
  });
  ok(tpdt.at && tpdt.n1 < tpdt.n0 && !tpdt.picked, label + ': Tapis!: one touch takes the group (' + JSON.stringify(tpdt) + ')');
  // never stuck: no pair left → the dealer tops up with a row of chips
  const tpr = await pg.evaluate(async () => {
    const T = window.__pthTapis, G = T.run();
    G.grid.forEach((col, c) => { col.splice(0); col.push({ k: c % 3, off: 0 }); });
    G.inv.joker = 1; G.inv.dealer = 1;
    const t0 = G.timeLeft;
    T.act(0, 0);                               // a lone chip: nothing, the check runs
    window.__pthTapis.check && window.__pthTapis.check();
    await new Promise((r) => setTimeout(r, 2800));      // (it waits for a friend still going into his hole)
    return { rows: G.grid.map((col) => col.length), lost: t0 - G.timeLeft, full: G.cols === G.cols0, none: G.chars.filter((ch) => ch.none).length };
  });
  ok(tpr.full && tpr.none >= 2 && tpr.rows.every((n) => n >= 2 && n <= 4) && tpr.lost < 4, label + ': Tapis!: no pair left, a Joker in hand or not: the table back to its full width, 2-3 rows under every column, no time taken (' + tpr.rows.join(',') + ', ' + tpr.none + ' without a friend, ' + tpr.lost.toFixed(1) + ' s)');
  // web.78: level 10 — a new venue, cards, Joker chips, seals, the Dealer button in a friend's hand; a card freed flies to the hand
  const tpl = await pg.evaluate(async () => {
    const T = window.__pthTapis, G = T.run();
    T.level(10);
    const all = [].concat(...G.grid), kit = { cards: all.filter((b) => b.k === -1).length, wild: all.filter((b) => b.k === 5).length, seals: all.filter((b) => b.seal).length };
    await new Promise((r) => setTimeout(r, 1500));
    let freed = false;
    for (let c = 0; c < G.grid.length && !freed; c++) for (let r = 0; r < G.grid[c].length && !freed; r++) {
      if (G.grid[c][r].k !== -1) continue;
      for (const [x, y] of [[c - 1, r], [c + 1, r], [c, r - 1], [c, r + 1]]) {
        const b = G.grid[x] && G.grid[x][y];
        if (!b || b.k < 0 || b.seal) continue;
        const k = b.k, nb = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(([p, q]) => G.grid[p] && G.grid[p][q] && G.grid[p][q].k >= 0 && !G.grid[p][q].seal && (G.grid[p][q].k === k || G.grid[p][q].k === 5 || k === 5));
        if (nb) { T.act(x, y); freed = true; break; }
      }
    }
    await new Promise((r) => setTimeout(r, 900));
    return { venue: G.venue, cards: kit.cards, wild: kit.wild, seals: kit.seals,
      dealer: document.querySelectorAll('#pth-game .pg-layer .cs.cs-dealer').length, freed, hand: G.hand.length };
  });
  ok(tpl.venue === 2 && tpl.cards === 4 && tpl.wild === 2 && tpl.seals === 2 && tpl.dealer === 1 && (!tpl.freed || tpl.hand >= 1),
    label + ': Tapis!: level 10 — the cruise, 4 cards, 2 Joker chips, 2 seals, the Dealer button; a freed card goes to the hand (' + JSON.stringify(tpl) + ')');
  // web.81: the modes — Daily deals the same board twice, Zen has no clock, Madness ends over the red line
  const tpm = await pg.evaluate(async () => {
    const T = window.__pthTapis, sig = () => T.run().grid.map((col) => col.map((b) => b.k).join('')).join('|');
    T.start('daily'); const d1 = sig(); T.start('daily'); const d2 = sig();
    T.start('zen'); await new Promise((r) => setTimeout(r, 300));
    const zen = { mode: T.mode(), hidden: document.querySelector('#pth-game .tp-time').style.visibility === 'hidden', t: T.run().timeLeft };
    await new Promise((r) => setTimeout(r, 600));
    zen.still = T.run().timeLeft === zen.t;
    T.start('folie'); const G = T.run(), h0 = G.grid.map((col) => col.length);
    G.riseT = G.kit.rise - 0.05; await new Promise((r) => setTimeout(r, 400));
    const risen = G.grid.every((col, c) => col.length === h0[c] + 1);
    G.grid.forEach((col) => { while (col.length < G.maxRows) col.push({ k: 0, off: 0 }); });
    G.riseT = G.kit.rise - 0.05; await new Promise((r) => setTimeout(r, 400));
    return { same: d1 === d2, zen, risen, over: T.state() };
  });
  ok(tpm.same && tpm.zen.mode === 'zen' && tpm.zen.hidden && tpm.zen.still && tpm.risen && tpm.over === 'over',
    label + ': Tapis!: Daily deals the same board, Zen has no clock, in Madness the rows rise and a stack over the red line ends it (' + JSON.stringify(tpm) + ')');
  await sleep(1600);
  // web.84: « Table rase » — a round cleared from level 5 without a recave grants the secret trophy; with a recave, not
  const tpt = await pg.evaluate(async () => {
    const T = window.__pthTapis, clear = async (recaved) => {
      T.start('classic'); const G = T.run(); T.level(5); G.recaved = recaved;
      G.grid.forEach((col) => col.splice(0));
      await new Promise((r) => setTimeout(r, 3800));
      return { state: T.state(), trophy: T.trophy() };
    };
    return { no: await clear(true), yes: await clear(false) };
  });
  ok(tpt.yes.state === 'clear' && tpt.yes.trophy && tpt.no.state === 'clear' && !tpt.no.trophy,
    label + ': Tapis!: « Table rase » — a round from level 5 without a recave grants the trophy, with a recave not (' + JSON.stringify(tpt) + ')');
  // web.83: the Duel — a move passes the turn, each his own score; too slow, the turn passes; 3 rounds, a winner
  const tpd = await pg.evaluate(async () => {
    const T = window.__pthTapis; T.start('duel');
    const G = T.run(), out = { t0: T.turn() };
    let mv = null;
    for (let c = 0; c < G.grid.length && !mv; c++) for (let r = 0; r < G.grid[c].length; r++) {
      const k = G.grid[c][r].k;
      if (k >= 0 && !G.grid[c][r].seal && ((G.grid[c][r + 1] && G.grid[c][r + 1].k === k) || (G.grid[c + 1] && G.grid[c + 1][r] && G.grid[c + 1][r].k === k))) { mv = [c, r]; break; }
    }
    T.act(mv[0], mv[1]); out.s1 = G.score;
    await new Promise((r) => setTimeout(r, 3000));      // (a friend falling into his hole first: the turn waits for him)
    out.t1 = T.turn(); out.s2now = G.score; out.p1 = G.players[0].score;
    out.hud = document.querySelector('#pth-game .ar-stats .ar-lab').textContent;
    G.turnT = 0.05; await new Promise((r) => setTimeout(r, 300));
    out.t2 = T.turn();
    T.timeUp(); await new Promise((r) => setTimeout(r, 1700));
    out.end = (document.querySelector('#pth-game .pg-panel h2') || {}).textContent || '';
    return out;
  });
  ok(tpd.t0 === 0 && tpd.s1 > 0 && tpd.t1 === 1 && tpd.s2now === 0 && tpd.p1 >= tpd.s1 && /1/.test(tpd.hud) && tpd.t2 === 0 && /1|2|!/.test(tpd.end),
    label + ': Tapis!: Duel — a move passes the turn to player 2 (player 1 keeps his ' + tpd.s1 + '), a slow turn passes back, the end names the winner (' + JSON.stringify(tpd) + ')');
  await pg.evaluate(() => window.__pthTapis.start('classic'));
  await pg.evaluate(() => window.__pthTapis.timeUp());
  const tpo = await endInfo(pg, 8000);
  ok(tpo.on && tpo.title === 'Tapis !' && tpo.btns.length === 2, label + ': Tapis!: the clock runs out, the end screen (' + tpo.score + ')');
  await shot(pg, label + '-tapis-over');
  await pg.keyboard.press('Escape');
  await sleep(300);
  await pg.keyboard.press('Escape');
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  // ── House of Cards (the easter-egg bonus since web.75) ──
  ok(await pg.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="house"]').closest('.gm-card'); return /🥚/.test(c.querySelector('.gm-step').textContent) && !!c.querySelector('.gm-kind.egg'); }),
    label + ': the House of Cards is the easter-egg bonus card (🥚, no number)');
  await pick(pg, 'house');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Château de cartes', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'house'), label + ': its card then Space opens the House of Cards');
  ok(await pg.evaluate(() => document.querySelectorAll('#pth-game .pg-panel .gm-tile').length === 3), label + ': House of Cards: three modes on its title (free, daily, Zen)');
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
      return !!G && !G.fall && Math.abs(G.railX - (X[G.cur.length] + G.tilt * 5 * G.floors.length - (G.pan || 0))) < 2; }, SLOT_X, { timeout: 8000, polling: 'raf' }).catch(() => {});
    await pg.keyboard.press('Space');
    await sleep(500);
    const s2 = await pg.evaluate(() => ({ c: document.querySelectorAll('#pth-game .ar-slots .pk').length, f: +(document.querySelector('#pth-game .hc-floors') || {}).textContent || 0 }));
    placed = Math.max(placed, s2.c); floors = Math.max(floors, s2.f);
    if (i === 6) await shot(pg, label + '-house-run');
  }
  // Push it past the point of no return, then one more drop brings it down.
  await pg.evaluate(() => { const G = window.__pthHouse && window.__pthHouse.run(); if (G) G.tilt = 3; });
  await pg.keyboard.press('Space');
  const hOver = Object.assign(await endInfo(pg, 15000), { best: await pg.evaluate(() => localStorage.getItem('pth_game_best_house')) });
  ok(floors >= 1, label + ': cards land in the house (up to ' + placed + ' on a floor, ' + floors + ' floor(s))');
  ok(hOver.title === 'Tout s\'écroule !' && hOver.btns.length === 2 && hOver.bars >= 1 && /Étages/i.test(hOver.lv), label + ': at full tilt it comes down, the floors built shown (' + hOver.bars + ' · ' + hOver.score + ')');
  await shot(pg, label + '-house-over');
  // Zen: no collapse; ← keeps the hanging card aside, once per drop.
  const c0 = await pg.evaluate(() => { const H = window.__pthHouse; H.start('zen'); return H.run().card.n; });
  await pg.keyboard.press('ArrowLeft');
  await sleep(150);
  await pg.evaluate(() => { window.__pthHouse.run().tilt = 3; });
  await pg.keyboard.press('Space');
  await sleep(900);
  const zen = await pg.evaluate((c) => { const H = window.__pthHouse, G = H.run();
    return { held: !!G.hold && G.hold.n === c, state: H.state(), tilt: +G.tilt.toFixed(2), mode: H.mode() }; }, c0);
  ok(zen.held && zen.mode === 'zen' && zen.state === 'run' && Math.abs(zen.tilt) < 1, label + ': House of Cards Zen: ← holds the card, full tilt does not bring it down (' + JSON.stringify(zen) + ')');
  const daily = await pg.evaluate(() => { const H = window.__pthHouse; H.start('daily'); const a = H.run().deck.slice(-8).join(); H.start('daily'); return a === H.run().deck.slice(-8).join(); });
  ok(daily, label + ': House of Cards daily challenge: the same cards every time today');
  await pg.keyboard.press('Escape');
  await sleep(300);
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
  const ps = Object.assign(await endInfo(pg, 12000), await pg.evaluate(() => ({
    hud: (document.querySelector('#pth-game .ps-score') || {}).textContent, left: (document.querySelector('#pth-game .ps-left') || {}).textContent,
    daily: localStorage.getItem('pth_game_daily_solitaire') })));
  ok(ps.left === '25/25' && ps.score === ps.hud && ps.cards === 5 && ps.bars === 10, label + ': 25 cards placed, ten lines counted (' + ps.bars + ' bars), score ' + ps.score + ' and its best line shown');
  ok(!!ps.daily && JSON.parse(ps.daily).d === new Date().toISOString().slice(0, 10), label + ': the daily score is kept for today');
  await shot(pg, label + '-solitaire-over');
  await pg.keyboard.press('Escape');
  await sleep(400);
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .pg-panel.gm-title')), label + ': Esc on the end screen: back to the game\'s menu');
  await pg.keyboard.press('Escape');
  await sleep(500);
  // ── Video Poker (daily challenge): a pair of jacks pays, then double or nothing ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'videopoker');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Vidéo Poker', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'videopoker' && document.getElementById('ar-title').textContent === 'Vidéo Poker'), label + ': its card then Space opens Video Poker');
  const vpt = await pg.evaluate(() => ({ chips: document.querySelectorAll('#pth-game .pg-panel .gm-opt').length, tiles: document.querySelectorAll('#pth-game .pg-panel .gm-tile').length }));
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .pg-panel.gm-title > .gm-bg svg')), label + ': Video Poker: its cover, dark, behind the title');
  ok(vpt.chips === 2 && vpt.tiles === 4, label + ': the title offers daily / free and the four machines (' + vpt.chips + ', ' + vpt.tiles + ')');
  await shot(pg, label + '-vp-title');
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => window.__pthVP.state() === 'hold', null, { timeout: 4000 }).catch(() => {});
  const vp0 = await pg.evaluate(() => ({ st: window.__pthVP.state(), v: window.__pthVP.run().v.id, bet: window.__pthVP.run().bet, cr: document.querySelector('#pth-game .vp-cr').textContent, h: document.querySelector('#pth-game .vp-h').textContent }));
  ok(vp0.st === 'hold' && vp0.v === 'jacks' && vp0.bet === 5 && vp0.cr === '95' && vp0.h === '1', label + ': the reels stop, a hand is dealt at the max bet (' + vp0.v + ', ' + vp0.cr + ', ' + vp0.h + ')');
  await shot(pg, label + '-vp-hold');
  await pg.keyboard.press('Space');                // holds the first card
  await sleep(150);
  ok(await pg.evaluate(() => window.__pthVP.run().held[0] === true), label + ': Space holds the card under the cursor');
  await pg.evaluate(() => { const G = window.__pthVP.run(); G.cards = [9, 22, 2, 18, 33]; G.held = [true, true, true, true, true]; });   // J♦ J♥ 4♦ 7♥ 9♠
  await pg.keyboard.press('ArrowDown');
  await pg.waitForFunction(() => window.__pthVP.state() === 'win', null, { timeout: 4000 }).catch(() => {});
  const vp1 = await pg.evaluate(() => ({ st: window.__pthVP.state(), win: window.__pthVP.run().win }));
  ok(vp1.st === 'win' && vp1.win === 5, label + ': Jacks or Better pays 1 a credit, 5 at 5 credits (' + vp1.st + ', ' + vp1.win + ')');
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
  await pg.waitForFunction(() => { const G = window.__pthVP.run(); return G.shown === G.credits; }, null, { timeout: 5000 }).catch(() => {});
  ok(await pg.evaluate(() => { const G = window.__pthVP.run(); return G.shown === G.credits; }), label + ': the credit meter counts up to the new total');
  await pg.keyboard.press('ArrowUp'); await sleep(100);
  ok(await pg.evaluate(() => window.__pthVP.run().bet === 1), label + ': BET ONE (↑) cycles the bet back to 1');
  await pg.keyboard.press('ArrowDown');
  await pg.waitForFunction(() => window.__pthVP.state() === 'hold', null, { timeout: 4000 }).catch(() => {});
  ok(await pg.evaluate(() => window.__pthVP.state() === 'hold' && window.__pthVP.run().hand === 2 && window.__pthVP.run().credits === +document.querySelector('#pth-game .vp-cr').textContent), label + ': no hand limit: a second hand for 1 credit');
  await pg.evaluate(() => { const G = window.__pthVP.run(); G.cards = [0, 14, 4, 20, 34]; G.held = [true, true, true, true, true]; });   // nothing
  await pg.keyboard.press('ArrowDown');
  await pg.waitForFunction(() => window.__pthVP.state() === 'ready', null, { timeout: 4000 }).catch(() => {});
  await pg.evaluate(() => { window.__pthVP.run().focus = 'cash'; });
  await pg.keyboard.press('Space');
  await sleep(300);
  ok(await pg.evaluate(() => window.__pthVP.state() === 'over'), label + ': Cash out ends the session, the credits are the score');
  const vpE = await endInfo(pg, 6000);
  ok(vpE.on && vpE.btns.length === 2 && vpE.bars >= 2 && /→/.test(vpE.lv), label + ': Video Poker\'s end screen: the credits hand after hand (' + vpE.lv + ')');
  await shot(pg, label + '-vp-over');
  await pg.keyboard.press('Escape'); await sleep(300);
  await pg.keyboard.press('Escape'); await sleep(500);
  // ── Who Wins?: the right hand scores, a wrong one costs a heart ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'whowins');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Qui gagne ?', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'whowins'), label + ': its card then Space opens Who Wins?');
  await pg.keyboard.press('ArrowRight');          // the second mode: Endless
  await sleep(150);
  await pg.keyboard.press('Space');
  await sleep(300);
  // The board is turned over like on TV (flop, turn, river), then the clock runs.
  const d0 = await pg.evaluate(() => ({ st: window.__pthWW.state(), t: window.__pthWW.run().dealT }));
  await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 4000 }).catch(() => {});
  const d1 = await pg.evaluate(() => ({ st: window.__pthWW.state(), tl: window.__pthWW.run().tLeft, tm: window.__pthWW.run().tMax }));
  ok(d0.st === 'deal' && d1.st === 'ask' && d1.tl > d1.tm - 0.5, label + ': the board is turned over first, then the clock starts (' + d0.st + ' → ' + d1.st + ')');
  const keyFor = (w) => (w === 1 ? 'ArrowLeft' : 'ArrowRight');   // no Split answer (web.38)
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
  // A key during the deal turns the rest over (no answer yet).
  const s2 = await pg.evaluate(() => window.__pthWW.state());
  await pg.keyboard.press('ArrowUp');
  await sleep(120);
  const s3 = await pg.evaluate(() => ({ st: window.__pthWW.state(), a: window.__pthWW.run().answer, pot: window.__pthWW.run().pot }));
  ok(s2 === 'deal' && s3.st === 'ask' && s3.a == null && s3.pot === 4, label + ': a key during the deal turns the board over without answering; the pot grew with the streak (' + s3.pot + ' chips)');
  const w2 = await pg.evaluate(() => window.__pthWW.run().q.win);
  await pg.keyboard.press(keyFor(w2 === 1 ? -1 : 1));
  await sleep(250);
  const ww2 = await pg.evaluate(() => ({ ok: window.__pthWW.run().ok, lives: window.__pthWW.run().lives, hud: document.querySelector('#pth-game .ww-lives').textContent }));
  const sh = await pg.evaluate(() => window.__pthWW.run().shake);
  ok(!ww2.ok && ww2.lives === 2 && ww2.hud === '❤❤♡' && sh > 0, label + ': a wrong answer costs a heart and shakes the table (' + ww2.hud + ')');
  await sleep(250); await pg.keyboard.press('Space');   // go on (a trap explained would wait longer)
  // Endless (web.32): a level every 5 right answers, the banner, the HUD.
  const answerRight = async () => {
    await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 5000 }).catch(() => {});
    const w = await pg.evaluate(() => window.__pthWW.run().q.win);
    await pg.keyboard.press(keyFor(w)); await sleep(470); await pg.keyboard.press('Space');
  };
  for (let k = 0; k < 4; k++) await answerRight();
  await sleep(250);
  const lv = await pg.evaluate(() => ({ mode: window.__pthWW.mode(), level: window.__pthWW.run().level, ban: (window.__pthWW.run().ban || {}).s, lab: document.querySelector('#pth-game .ww-tlab').textContent, n: document.querySelector('#pth-game .ww-prog').textContent }));
  ok(lv.mode === 'endless' && lv.level === 1 && /^Niveau 2 · Couleurs et suites$/.test(lv.ban || '') && lv.lab === 'Niveau' && lv.n === '2',
    label + ': Endless: after 5 right answers, level 2 (« ' + lv.ban + ' »)');
  for (let k = 0; k < 2; k++) {
    await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 5000 }).catch(() => {});
    const w = await pg.evaluate(() => window.__pthWW.run().q.win);
    await pg.keyboard.press(keyFor(w === 1 ? -1 : 1)); await sleep(470); await pg.keyboard.press('Space');
  }
  await sleep(300);
  const ov = await pg.evaluate(() => ({ st: window.__pthWW.state(), best: JSON.parse(localStorage.getItem('pth_ww_best') || '{}'),
    btns: [...document.querySelectorAll('#pth-game .pg-panel [data-e]')].map((b) => b.getAttribute('data-e')).join(','), txt: (document.querySelector('#pth-game .pg-panel') || {}).textContent || '' }));
  ok(ov.st === 'over' && ov.best.endless && ov.best.endless.level === 2 && ov.btns === 'again,menu' && /Niveau 2/.test(ov.txt), label + ': out of hearts: the level reached is kept, again / modes');
  await pg.click('#pth-game .pg-panel [data-e="menu"]');
  await sleep(300);
  const md = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .gm-tile')].map((b) => b.textContent).join(' | '));
  ok(/Sans fin/.test(md) && /Niveau 2/.test(md), label + ': the modes page: Endless with its record and level (' + md + ')');
  // The TV show (web.33): the jokers, a safe level, one mistake ends it.
  await pg.click('#pth-game .gm-tile[data-m="0"]');
  await sleep(300);
  await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 5000 }).catch(() => {});
  const tv0 = await pg.evaluate(() => ({ mode: window.__pthWW.mode(), lab: document.querySelector('#pth-game .ww-tlab').textContent, n: document.querySelector('#pth-game .ww-prog').textContent, tm: window.__pthWW.run().tMax, lives: document.querySelector('#pth-game .ww-lives').textContent }));
  await pg.keyboard.press('Digit2'); await pg.keyboard.press('Digit3');
  await sleep(150);
  const tv1 = await pg.evaluate(() => { const G = window.__pthWW.run(); return { win: G.q.win, hint: G.hint, save: G.save, jok: G.jok }; });
  ok(tv0.mode === 'tv' && tv0.lab === 'Question' && tv0.n === '1/15' && tv0.tm === 12 && tv0.lives === '', label + ': TV show: question 1/15, a longer clock (' + tv0.tm + ' s), no hearts');
  ok(tv1.hint && tv1.save && !tv1.jok.jace && !tv1.jok.jsave && tv1.jok.jswap, label + ': keys 2 3: the Ace names the hands, Second chance armed');
  const wrong1 = tv1.win === 1 ? -1 : 1;
  await pg.keyboard.press(keyFor(wrong1));          // forgiven: crossed out, the question goes on
  await sleep(150);
  const tv1b = await pg.evaluate(() => { const G = window.__pthWW.run(); return { st: window.__pthWW.state(), out: G.out, save: G.save }; });
  await pg.keyboard.press(keyFor(wrong1));          // crossed out: nothing happens
  await sleep(100);
  const st1 = await pg.evaluate(() => window.__pthWW.state());
  ok(tv1b.st === 'ask' && tv1b.out === wrong1 && !tv1b.save && st1 === 'ask', label + ': Second chance: the wrong answer is crossed out, answer again');
  await pg.keyboard.press(keyFor(tv1.win)); await sleep(470); await pg.keyboard.press('Space');
  await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 5000 }).catch(() => {});
  const q2 = await pg.evaluate(() => window.__pthWW.run().q.board.join());
  await pg.keyboard.press('Digit1');
  await sleep(150);
  const tv2b = await pg.evaluate(() => { const G = window.__pthWW.run(); return { b: G.q.board.join(), st: window.__pthWW.state(), sw: G.jok.jswap, n: document.querySelector('#pth-game .ww-prog').textContent }; });
  ok(tv2b.b !== q2 && ['deal', 'ask'].includes(tv2b.st) && !tv2b.sw && tv2b.n === '2/15', label + ': key 1: New hand, another showdown for the same question');
  for (let k = 0; k < 4; k++) await answerRight();
  await sleep(250);
  const tv2 = await pg.evaluate(() => ({ won: window.__pthWW.run().won, n: document.querySelector('#pth-game .ww-prog').textContent }));
  ok(tv2.won === 1000 && tv2.n === '6/15', label + ': five right answers: 1 000 chips, the first safe level (' + tv2.n + ')');
  await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 5000 }).catch(() => {});
  const w6 = await pg.evaluate(() => window.__pthWW.run().q.win);
  await pg.keyboard.press(keyFor(w6 === 1 ? -1 : 1)); await sleep(470); await pg.keyboard.press('Space');
  await sleep(300);
  const tv3 = await pg.evaluate(() => ({ st: window.__pthWW.state(), won: window.__pthWW.run().won, best: JSON.parse(localStorage.getItem('pth_ww_best') || '{}'), txt: (document.querySelector('#pth-game .pg-panel') || {}).textContent || '' }));
  ok(tv3.st === 'over' && tv3.won === 1000 && tv3.best.tv && tv3.best.tv.best === 1000 && /Mauvaise réponse/.test(tv3.txt) && /Tu repars avec/.test(tv3.txt),
    label + ': a mistake at question 6: the show ends, you leave with the safe level (' + tv3.won + ')');
  await pg.click('#pth-game .pg-panel [data-e="menu"]');
  await sleep(300);
  // The Daily challenge (web.34): the day's 10 hands, mistakes go on, the first game counts.
  await pg.click('#pth-game .gm-tile[data-m="2"]');
  await sleep(300);
  await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 5000 }).catch(() => {});
  const dy0 = await pg.evaluate(async () => {
    const W = await import('/modules/games/whowins.mjs'), G = window.__pthWW.run();
    const day = new Date().toISOString().slice(0, 10), q = W.dailyDeals(day)[0];
    return { mode: window.__pthWW.mode(), same: q.board.join() === G.q.board.join() && q.a.join() === G.q.a.join(), counted: G.counted,
      lab: document.querySelector('#pth-game .ww-tlab').textContent, n: document.querySelector('#pth-game .ww-prog').textContent, lives: document.querySelector('#pth-game .ww-lives').textContent };
  });
  ok(dy0.mode === 'daily' && dy0.same && dy0.counted && dy0.lab === 'Main' && dy0.n === '1/10' && dy0.lives === '', label + ': Daily challenge: the day\'s first hand, counted, hand 1/10, no hearts');
  for (let k = 0; k < 10; k++) {
    await pg.waitForFunction(() => ['ask', 'over'].includes(window.__pthWW.state()), null, { timeout: 5000 }).catch(() => {});
    if (await pg.evaluate(() => window.__pthWW.state()) === 'over') break;
    const w = await pg.evaluate(() => window.__pthWW.run().q.win);
    await pg.keyboard.press(keyFor(k % 3 === 2 ? (w === 1 ? -1 : 1) : w)); await sleep(470); await pg.keyboard.press('Space');
  }
  await sleep(300);
  const dy1 = await pg.evaluate(() => ({ st: window.__pthWW.state(), right: window.__pthWW.run().right, d: JSON.parse(localStorage.getItem('pth_ww_daily') || 'null'), txt: (document.querySelector('#pth-game .pg-panel') || {}).textContent || '' }));
  ok(dy1.st === 'over' && dy1.right === 7 && dy1.d && dy1.d.right === 7 && dy1.d.streak === 1 && /Score du jour enregistré/.test(dy1.txt), label + ': three mistakes do not stop it; 7/10 saved as today\'s score');
  await pg.click('#pth-game .pg-panel [data-e="again"]');
  await sleep(300);
  const dy2 = await pg.evaluate(() => ({ counted: window.__pthWW.run().counted, ban: (window.__pthWW.run().ban || {}).s || '' }));
  ok(dy2.counted === false && /entraînement/.test(dy2.ban), label + ': played again the same day: practice (« ' + dy2.ban + ' »)');
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(300);
  await pick(pg, 'whowins');
  await sleep(500);
  const tl = await pg.evaluate(() => (document.querySelector('#pth-game .gm-tile[data-m="2"]') || {}).textContent || '');
  ok(/Aujourd'hui/.test(tl), label + ': the Daily tile shows today\'s score (' + tl + ')');
  // The traps explained (web.35): a mistake on a counterfeited pair, the Ace explains it.
  await pg.click('#pth-game .gm-tile[data-m="1"]');
  await pg.waitForFunction(() => window.__pthWW.state() === 'ask', null, { timeout: 5000 }).catch(() => {});
  const tp = await pg.evaluate(async () => {
    const W = await import('/modules/games/whowins.mjs'); let q;
    for (let i = 0; i < 400; i++) { q = W.LEVELS[3].deal(Math.random); if (W.trapOf(q) === 'counterfeit') break; }
    window.__pthWW.run().q = q; return { win: q.win, trap: W.trapOf(q) };
  });
  await pg.keyboard.press(keyFor(-tp.win));
  await sleep(300);
  const tp2 = await pg.evaluate(() => ({ trap: window.__pthWW.run().trap, ok: window.__pthWW.run().ok }));
  ok(tp.trap === 'counterfeit' && !tp2.ok && tp2.trap === 'counterfeit', label + ': a mistake on a trap: the Ace explains it (' + tp2.trap + ')');
  await sleep(3000);
  ok(await pg.evaluate(() => window.__pthWW.state()) === 'shown', label + ': the explanation waits for the player (still there after 3 s)');
  await pg.keyboard.press('Space'); await sleep(300);
  ok(await pg.evaluate(() => window.__pthWW.run().trap == null), label + ': Space: the next hand, the explanation is gone');
  await pg.keyboard.press('Space');                // back in a game, as before the modes
  await sleep(300);
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
  await pg.evaluate(() => { const G = window.__pthHL.run(); G.cur = 5; G.hand = [5]; G.shoe = G.shoe.filter((c) => c !== 5 && c !== 37); G.shoe.push(37); });
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
  // The hand: four cards held, a pair comes — the showdown pays the pot × 1.2 and banks it.
  await pg.evaluate(() => { const G = window.__pthHL.run(); G.cur = 5; G.hand = [2, 22, 37, 5]; G.pot = 100; G.potWins = 3; G.shoe = G.shoe.filter((c) => c !== 28); G.shoe.push(28); });
  const sc0 = await pg.evaluate(() => window.__pthHL.run().score);
  await pg.keyboard.press('ArrowDown');
  await pg.waitForFunction(() => window.__pthHL.state() === 'show', null, { timeout: 3000 }).catch(() => {});
  const sd = await pg.evaluate(() => ({ st: window.__pthHL.state(), score: window.__pthHL.run().score, hand: window.__pthHL.run().hand.length, pot: window.__pthHL.run().pot, line: (window.__pthHL.run().show || {}).line || '' }));
  const m12 = /×1\.2 +([\d\s\u202f\u00a0.,]+) → ([\d\s\u202f\u00a0.,]+)/.exec(sd.line), num = (x) => +String(x).replace(/\D/g, '');
  ok(sd.st === 'show' && m12 && num(m12[2]) === Math.round(num(m12[1]) * 1.2) && sd.score - sc0 === num(m12[2]) && sd.hand === 1 && sd.pot === 10, label + ': five cards with a pair: the showdown, the pot × 1.2 banked (' + sd.line + ')');
  await shot(pg, label + '-hl-showdown');
  await pg.keyboard.press('Space'); await sleep(150);
  // The tournament: All-In on a 3 with a K next doubles the stack; Fold costs the small blind.
  await pg.evaluate(() => window.__pthHL.start('tourney'));
  await sleep(200);
  await pg.evaluate(() => { const G = window.__pthHL.run(); G.cur = 14; G.shoe = G.shoe.filter((c) => c !== 14 && c !== 37); G.shoe.push(37); });
  await pg.keyboard.press('Digit3');
  await pg.keyboard.press('ArrowUp');
  await pg.waitForFunction(() => window.__pthHL.state() === 'guess', null, { timeout: 3000 }).catch(() => {});
  const tn = await pg.evaluate(() => ({ stack: window.__pthHL.run().stack, bet: window.__pthHL.run().bet, cards: window.__pthHL.run().cards, hud: document.querySelector('#pth-game .hl-shoe').textContent }));
  ok(tn.stack === 2000 && tn.bet === 'bet' && tn.cards === 1 && /Blinds 10\/20/.test(tn.hud), label + ': tournament: All-In on a 3, a K comes: the stack doubles, back to Bet (' + tn.stack + ', ' + tn.hud + ')');
  await shot(pg, label + '-hl-tourney');
  await pg.keyboard.press('Digit4');
  await pg.waitForFunction(() => window.__pthHL.state() === 'guess', null, { timeout: 3000 }).catch(() => {});
  ok(await pg.evaluate(() => window.__pthHL.run().stack === 1990 && window.__pthHL.run().cards === 2), label + ': Fold: the small blind, the next card');
  // The table's buttons (web.51): HTML over the felt, the web client's classes; a tap plays.
  const hb = await pg.evaluate(() => {
    const vis = (sel) => [...document.querySelectorAll('#pth-game .hl-ui ' + sel)].filter((b) => b.style.display !== 'none' && b.getBoundingClientRect().width > 0).length;
    return { ud: vis('.hl-ud'), fold: vis('.btn-action.btn-fold'), pct: vis('.btn-pct'), allin: vis('.btn-action.btn-allin'), cash: vis('[data-hl="cash"]') };
  });
  ok(hb.ud === 2 && hb.fold === 1 && hb.pct === 2 && hb.allin === 1 && hb.cash === 0, label + ': the table\'s buttons: ▼ ▲ in gold, Fold, Bet / Raise, All-In (' + JSON.stringify(hb) + ')');
  await pg.click('#pth-game .hl-ui [data-hl="raise"]');
  ok(await pg.evaluate(() => window.__pthHL.run().bet === 'raise'), label + ': a tap on Raise picks the bet');
  await pg.evaluate(() => { const G = window.__pthHL.run(); G.cur = 1; G.shoe = G.shoe.filter((c) => c !== 1 && c !== 37); G.shoe.push(37); });
  const st0 = await pg.evaluate(() => window.__pthHL.run().stack);
  await pg.click('#pth-game .hl-ui [data-hl="hi"]');
  await pg.waitForFunction(() => window.__pthHL.state() === 'guess', null, { timeout: 3000 }).catch(() => {});
  ok(await pg.evaluate((s0) => window.__pthHL.run().stack > s0, st0), label + ': a tap on ▲ Plus haut plays the card (a 3, a K comes: the raise is won)');
  await shot(pg, label + '-hl-buttons');
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(500);
  // ── The Ace's Bluff: he bets, Call shows his cards; Fold gives up the ante ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'bluff');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Le Bluff de l\'As', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'bluff'), label + ": its card then Space opens the Ace's Bluff");
  ok(await pg.evaluate(() => document.querySelectorAll('#pth-game .pg-panel .gm-tile').length === 3 && !!document.querySelector('#pth-game .pg-panel .gm-opt[data-o="timer"]')),
    label + ": the Ace's Bluff: three modes and the hourglass on its title");
  await pg.keyboard.press('Space');
  const toDecide = async () => {
    for (let i = 0; i < 40; i++) {
      await pg.waitForFunction(() => ['decide', 'you', 'shown', 'over'].indexOf(window.__pthBL.state()) >= 0, null, { timeout: 8000 }).catch(() => {});
      const st = await pg.evaluate(() => window.__pthBL.state());
      if (st === 'decide' || st === 'over') return st;
      await pg.keyboard.press('Space');            // check, or the next hand
      await sleep(150);
    }
    return '';
  };
  ok(await toDecide() === 'decide', label + ': the Ace bets on a street and waits for an answer');
  ok(await pg.evaluate(() => { const b = [...document.querySelectorAll('#pth-game .bl-ui > button.btn-action')].filter((x) => x.style.display !== 'none').map((x) => x.textContent); return b.length === 3 && /^Fold/.test(b[0]) && /^Call/.test(b[1]) && /^Raise/.test(b[2]); }),
    label + ': the table\'s buttons: Fold, Call, Raise');
  await shot(pg, label + '-bl-decide');
  const bl0 = await pg.evaluate(() => ({ chips: window.__pthBL.run().chips, bet: window.__pthBL.run().bet, pot: window.__pthBL.run().pot, street: window.__pthBL.run().street }));
  await pg.keyboard.press('Space');
  await sleep(250);
  const bl1 = await pg.evaluate(() => ({ st: window.__pthBL.state(), called: window.__pthBL.run().called, chips: window.__pthBL.run().chips, pot: window.__pthBL.run().pot, street: window.__pthBL.run().street }));
  ok(bl1.called && bl1.chips === bl0.chips - Math.min(bl0.bet, bl0.chips) && (bl1.st === 'shown' || bl1.pot === bl0.pot + Math.min(bl0.bet, bl0.chips)),
    label + ': Space calls: his bet is matched (street ' + bl0.street + ', ' + bl1.st + ')');
  // To the end of the hand, then the next bet is folded.
  for (let i = 0; i < 12 && (await pg.evaluate(() => window.__pthBL.state())) !== 'shown'; i++) {
    await pg.waitForFunction(() => ['decide', 'you', 'shown'].indexOf(window.__pthBL.state()) >= 0, null, { timeout: 8000 }).catch(() => {});
    if ((await pg.evaluate(() => window.__pthBL.state())) !== 'shown') { await pg.keyboard.press('Space'); await sleep(200); }
  }
  ok(await pg.evaluate(() => window.__pthBL.state() === 'shown' && window.__pthBL.run().streetTells.every((x) => !!window.__pthBL.run().book[x.tell])),
    label + ': the hand is shown down; the notebook counts the tells he showed');
  await shot(pg, label + '-bl-shown');
  await pg.keyboard.press('Space');
  if (await toDecide() === 'decide') {
    const before = await pg.evaluate(() => window.__pthBL.run().chips);
    await pg.keyboard.press('ArrowDown');
    await sleep(300);
    ok(await pg.evaluate((b) => window.__pthBL.state() === 'shown' && window.__pthBL.run().folded && window.__pthBL.run().chips === b, before), label + ': ↓ folds: what is in the pot stays there');
  }
  // When he checks: Bet; the tournament gives him a stack.
  await pg.evaluate(() => window.__pthBL.start('tourney'));
  let you = '';
  for (let i = 0; i < 40 && you !== 'you'; i++) {
    await pg.waitForFunction(() => ['decide', 'you', 'shown'].indexOf(window.__pthBL.state()) >= 0, null, { timeout: 8000 }).catch(() => {});
    you = await pg.evaluate(() => window.__pthBL.state());
    if (you === 'decide') await pg.keyboard.press('ArrowDown'); else if (you === 'shown') await pg.keyboard.press('Space');
    await sleep(150);
  }
  if (you === 'you') {
    const y0 = await pg.evaluate(() => ({ chips: window.__pthBL.run().chips, his: window.__pthBL.run().his, yb: window.__pthBL.run().yb }));
    await pg.evaluate(() => { const b = [...document.querySelectorAll('#pth-game .bl-ui > button.btn-action')]; b[1].click(); });   // a tap on Bet
    await sleep(1300);
    const y1 = await pg.evaluate(() => ({ chips: window.__pthBL.run().chips, his: window.__pthBL.run().his, yb: window.__pthBL.run().yb, st: window.__pthBL.state(), hud: (document.querySelector('#pth-game .bl-hisv') || {}).textContent }));
    ok(y1.yb === y0.yb + 1 && typeof y0.his === 'number' && y0.his < 400 && /\d/.test(y1.hud || ''), label + ': he checks, a tap on Bet: he answers (' + JSON.stringify([y0, y1]) + ')');
  }
  ok(await pg.evaluate(() => { const b = /** @type {HTMLElement} */ (document.querySelector('#pth-game .pg-hud .bl-pill')); if (!b) return false;
    const wide = innerWidth > innerHeight; if (wide) return b.style.display === 'none' && getComputedStyle(document.querySelector('#pth-game .bl-book')).display !== 'none';
    b.click(); return getComputedStyle(document.querySelector('#pth-game .bl-book')).display !== 'none'; }), label + ': the notebook: pinned on a wide stage, its pill in the HUD opens it on a phone');
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(500);
  // ── Ace Dash: three lanes, the Ace from behind, swipes on a phone ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'ace-dash');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Ace Dash', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'ace-dash' && document.getElementById('pth-game').classList.contains('pg-lanes')), label + ': Ace Dash opens, a lane game');
  ok(await pg.evaluate(() => document.querySelectorAll('#pth-game .pg-panel .gm-tile').length === 3), label + ': three ways to play: free run, daily, time attack');
  await shot(pg, label + '-dash-title');
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => window.__pthDash && window.__pthDash.state() === 'run', null, { timeout: 4000 }).catch(() => {});
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game-ace.adash-back') && document.querySelector('#pth-game .pg-panel').hidden), label + ': Space starts the run, the Ace turned round');
  await pg.keyboard.press('ArrowLeft'); await sleep(250);
  const dl = await pg.evaluate(() => { const G = window.__pthDash.run(); return { lane: G.lane, x: G.x }; });
  ok(dl.lane === 0 && dl.x < -1, label + ': ← moves him to the left lane (x ' + dl.x.toFixed(2) + ')');
  await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowRight'); await sleep(350);
  ok(await pg.evaluate(() => window.__pthDash.run().lane === 2), label + ': → → to the right lane, and no further');
  await pg.keyboard.press('Space'); await sleep(120);
  ok(await pg.evaluate(() => window.__pthDash.run().y > 0.2), label + ': Space jumps');
  await pg.evaluate(() => { const G = window.__pthDash.run(); G.peak = 0; G.obj = []; });
  await pg.keyboard.press('Space');
  await sleep(60);
  const flipOn = await pg.evaluate(() => ({ dbl: window.__pthDash.run().dbl, cls: document.querySelector('#pth-game-ace .mc-pos').className }));
  ok(flipOn.dbl === true && / flip\b/.test(' ' + flipOn.cls), label + ': Space again in the air: the backflip (' + flipOn.cls + ')');
  let peak = 0;
  for (let i = 0; i < 12; i++) { peak = Math.max(peak, await pg.evaluate(() => window.__pthDash.run().y)); await sleep(40); }
  ok(peak > 1.6, label + ': the backflip goes higher than a card wall (' + peak.toFixed(2) + ' m)');
  await pg.waitForFunction(() => window.__pthDash.run().onGround, null, { timeout: 3000 }).catch(() => {});
  const wallOk = await pg.evaluate(() => new Promise((res) => {
    const G = window.__pthDash.run();
    G.onGround = false; G.y = 2; G.vy = 3; G.dbl = true; G.spawnAt = G.travel + 30;
    G.obj = [{ kind: 'wall', x: G.x, z: 4.6, h: 1.6, hw: 0.66, dz: 0.3, tilt: 0 }];
    setTimeout(() => res({ st: window.__pthDash.state(), done: !!G.obj.length && !!G.obj[0].done || !G.obj.length }), 260);
  }));
  ok(wallOk.st === 'run' && wallOk.done, label + ': over the top of a card wall, no crash (' + wallOk.st + ')');
  if (label === 'phone') {
    // A swipe to the left, drawn with the mouse on the stage (pointer events).
    const r = await pg.evaluate(() => { const b = document.querySelector('#pth-game .pg-stage').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    await sleep(700);
    const before = await pg.evaluate(() => window.__pthDash.run().lane);
    await pg.mouse.move(r.x, r.y); await pg.mouse.down(); await pg.mouse.move(r.x - 40, r.y, { steps: 4 }); await pg.mouse.up();
    await sleep(100);
    ok(await pg.evaluate((b) => window.__pthDash.run().lane === b - 1 && window.__pthDash.run().y === 0, before), label + ': a swipe to the left changes lane without jumping');
    ok(await pg.evaluate(() => !!document.querySelector('#pth-game .pg-pad button[data-a="left"]') && getComputedStyle(document.querySelector('#pth-game .pg-pad button[data-a="left"]')).display !== 'none' || !matchMedia('(pointer: coarse)').matches), label + ': ◀ ▶ on the touch pad');
  }
  await shot(pg, label + '-dash-run');
  // A ramp in his lane: launched into a backflip.
  await pg.waitForFunction(() => window.__pthDash.run().onGround, null, { timeout: 3000 }).catch(() => {});
  const rampOk = await pg.evaluate(() => new Promise((res) => {
    const G = window.__pthDash.run();
    G.obj = [{ kind: 'ramp', x: G.x, z: 4.8, len: 1.3, h: 0.34, hw: 0.56 }]; G.safeUntil = performance.now() + 1500;
    setTimeout(() => res({ dbl: G.dbl, y: G.y }), 350);
  }));
  ok(rampOk.dbl && rampOk.y > 0.8, label + ': a ramp launches him into a backflip (' + rampOk.y.toFixed(2) + ' m)');
  // A magnet chip: he turns round to us, heart eyes, then runs on.
  await pg.waitForFunction(() => window.__pthDash.run().onGround, null, { timeout: 3000 }).catch(() => {});
  await sleep(1000);
  await pg.evaluate(() => { const G = window.__pthDash.run(); G.lookAt = 0; G.items.push({ kind: 'magnet', x: G.x, z: 4.3, y: 0.6, spin: 0, col: ['#000', '#fff'] }); });
  await sleep(200);
  ok(await pg.evaluate(() => document.querySelector('#pth-game-ace .mc-pos').classList.contains('mc-m-love')), label + ': a magnet: he looks back at us, heart eyes');
  // Busted with 25 chips or more: the rebuy, once; Space takes it.
  await pg.waitForFunction(() => window.__pthDash.run().onGround, null, { timeout: 3000 }).catch(() => {});
  await pg.evaluate(() => { const G = window.__pthDash.run(); G.chips = 30; G.safeUntil = 0; G.ins = false; G.allInUntil = 0; G.obj = [{ kind: 'wall', x: G.x, z: 4.6, h: 1.6, hw: 0.66, dz: 0.3, tilt: 0 }]; });
  await pg.waitForFunction(() => window.__pthDash.state() === 'rebuy', null, { timeout: 3000 }).catch(() => {});
  const rbS = await pg.evaluate(() => ({ st: window.__pthDash.state(), btns: [...document.querySelectorAll('#pth-game .gm-endc .gm-ebtns [data-e]')].map((b) => b.textContent),
    ring: !!document.querySelector('#pth-game .gm-endc .gm-ecount .gm-ering'), n: (document.querySelector('#pth-game .gm-ecount b') || {}).textContent, chips: (document.querySelector('#pth-game .gm-esv') || {}).textContent }));
  ok(rbS.st === 'rebuy' && rbS.btns.length === 2 && /Se recaver/.test(rbS.btns[0]) && /Non merci/.test(rbS.btns[1]) && rbS.ring && rbS.chips === '30', label + ': busted with 30 chips: the rebuy card, its stack, its countdown (' + rbS.btns.join(' / ') + ', ' + rbS.n + ' s)');
  await shot(pg, label + '-dash-rebuy');
  await pg.keyboard.press('Space'); await sleep(150);
  const rb = await pg.evaluate(() => ({ st: window.__pthDash.state(), chips: window.__pthDash.run().chips, rb: window.__pthDash.run().rebought }));
  ok(rb.st === 'run' && rb.chips <= 6 && rb.rb, label + ': Space pays 25 chips, back in the race (' + rb.st + ', ' + rb.chips + ')');
  // Nobody steers: a row ends the run (no second rebuy), then the showdown and the score.
  const dOver = Object.assign(await endInfo(pg, 30000), await pg.evaluate(() => ({ best: localStorage.getItem('pth_game_best_ace-dash'), front: !document.querySelector('#pth-game-ace.adash-back') })));
  ok(dOver.on && /Jetons/.test(dOver.calc) && dOver.best !== null && dOver.front && dOver.steps === 6 && /✓/.test(dOver.stats), label + ': busted, he turns round, score saved, the rebuy taken shown (' + dOver.score + ' · ' + dOver.calc + ')');
  await shot(pg, label + '-dash-over');
  // Time attack: the clock in the HUD, a crash costs 5 s and not the run.
  await pg.evaluate(() => window.__pthDash.start('time'));
  await sleep(400);
  const ta0 = await pg.evaluate(() => ({ mode: window.__pthDash.mode(), time: window.__pthDash.run().time, lab: (document.querySelector('#pth-game .ad-lvl-lab') || {}).textContent }));
  ok(ta0.mode === 'time' && ta0.time < 60 && ta0.time > 58 && ta0.lab === 'Temps', label + ': time attack: 60 s on the clock (' + ta0.time.toFixed(1) + ', ' + ta0.lab + ')');
  const ta1 = await pg.evaluate(() => new Promise((res) => {
    const G = window.__pthDash.run(), t0 = G.time;
    G.obj = [{ kind: 'wall', x: G.x, z: 4.6, h: 1.6, hw: 0.66, dz: 0.3, tilt: 0 }];
    setTimeout(() => res({ st: window.__pthDash.state(), lost: t0 - G.time }), 300);
  }));
  ok(ta1.st === 'run' && ta1.lost > 4.9 && ta1.lost < 5.6, label + ': a crash costs 5 s, the run goes on (−' + ta1.lost.toFixed(1) + ' s)');
  await pg.evaluate(() => { window.__pthDash.run().time = 0.05; });
  await pg.waitForSelector('#pth-game .gm-endc', { timeout: 6000 }).catch(() => {});
  ok(await pg.evaluate(() => window.__pthDash.state() === 'over' && /\{|"time"/.test(localStorage.getItem('pth_ad_best') || '')), label + ': time\'s up: the showdown, the time-attack record kept');
  // The daily challenge: the same cards for everyone today.
  const dd = await pg.evaluate(() => { window.__pthDash.start('daily'); const a = window.__pthDash.run().deck.join(); window.__pthDash.start('daily'); const b = window.__pthDash.run().deck.join(); window.__pthDash.start('free'); const c = window.__pthDash.run().deck.join(); return { same: a === b, other: a !== c }; });
  ok(dd.same && dd.other, label + ': daily: the same deck at every try today, a free run shuffles anew');
  await pg.keyboard.press('Escape'); await sleep(300);
  await pg.keyboard.press('Escape'); await sleep(300);
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card') && !document.getElementById('pth-game').classList.contains('pg-lanes')), label + ': back on the arcade page, the lanes mode is off');
  // ── Poker Run: the Ace at the wheel, forks that deal the board ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'poker-run');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Poker Run', null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window._pthPadOwner === 'poker-run' && document.getElementById('pth-game').classList.contains('pg-lanes')
    && !!document.querySelector('#pth-game-ace.prun-back')), label + ': Poker Run opens, a lane game, the Ace from behind');
  await shot(pg, label + '-prun-title');
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => window.__pthRun && window.__pthRun.state() === 'run', null, { timeout: 4000 }).catch(() => {});
  const pr0 = await pg.evaluate(() => ({ st: window.__pthRun.state(), hole: document.querySelectorAll('#pth-game .prun-hud .ar-slots .pk').length, slots: document.querySelectorAll('#pth-game .prun-hud .ar-slot').length }));
  ok(pr0.st === 'run' && pr0.hole === 2 && pr0.slots === 5, label + ': Space starts the run, two cards in hand and five board slots');
  // Two roads at each fork (OutRun), and the last stage as long as the others.
  const prT = await pg.evaluate(() => { const G = window.__pthRun.game().gates, z = G.map((g) => g.seg).concat(window.__pthRun.finish()); return { two: G.every((g) => g.cards.length === 2), len: z.map((x, i) => x - (i ? z[i - 1] : 0)) }; });
  const prM = prT.len.reduce((a, b) => a + b, 0) / prT.len.length;
  ok(prT.two && prT.len.length === 6 && prT.len.every((x) => x > prM * 0.75 && x < prM * 1.25), label + ': two roads at each fork, six stages of like length (' + prT.len.join(', ') + ')');
  await pg.keyboard.press('Space');   // let go of the nitro the start may have left down
  await sleep(1500);
  const prMini = await pg.evaluate(() => { const m = document.querySelector('#pth-game .prun-mini'); return !!m && !m.hidden && !!m.querySelector('svg .prun-car') && m.querySelectorAll('svg circle').length >= 11; });
  ok(prMini, label + ': the course map in a corner of the HUD while driving, the car on it');
  await pg.keyboard.down('ArrowLeft'); await sleep(450); await pg.keyboard.up('ArrowLeft');
  ok(await pg.evaluate(() => window.__pthRun.game().px < -0.15), label + ': ← held steers to the left (x ' + (await pg.evaluate(() => window.__pthRun.game().px.toFixed(2))) + ')');
  await shot(pg, label + '-prun-run');
  // Between two cars side by side there is a way through; into one, a crash.
  const prGap = [];
  for (const x of [-0.33, 0]) prGap.push(await pg.evaluate((x) => new Promise((res) => {
    const R = window.__pthRun; R.setTime(99); R.setPos(0);
    const cs = R.cars(); cs.forEach((c) => { c.dead = true; });
    for (let l = 0; l < 2; l++) Object.assign(cs[l], { dead: false, lane: l, z: 20 * 200, v: 200 * 62 * 0.3, ahead: true });
    let hit = false; const iv = setInterval(() => { R.setPx(x); R.setV(0.8); if (R.game().inv > 0) hit = true; }, 8);
    setTimeout(() => { clearInterval(iv); res(hit); }, 1200);
  }), x));
  ok(!prGap[0] && prGap[1], label + ': the car slips between two cars side by side, and crashes into one (' + prGap.join(', ') + ')');
  // Drift: into a bend at speed, it starts; a short let-go does not break it.
  // In stage 0: its road is fixed (the later ones are reshaped by the forks taken).
  const prBend = await pg.evaluate(() => { const R = window.__pthRun, end = R.game().gates[0].seg - 260; let m = 100; for (let i = 100; i < end; i++) if (Math.abs(R.curve(i)) > Math.abs(R.curve(m))) m = i; return Math.abs(R.curve(m)) > 1 ? { i: m - 2, d: Math.sign(R.curve(m)) } : null; });
  if (prBend) {
    // Held on the tightest bend of the stage (the car put back on it every 0.1 s).
    await pg.evaluate((b) => { const R = window.__pthRun; R.cars().forEach((c) => { c.dead = true; }); R.setTime(99); R.setPos(b.i); R.setPx(0); R.setV(0.9); }, prBend);
    const k = prBend.d > 0 ? 'ArrowRight' : 'ArrowLeft', hold = async (n) => { for (let t = 0; t < n; t++) { await pg.evaluate((b) => { const R = window.__pthRun; R.setPos(b.i); R.setPx(0); R.setTime(99); }, prBend); await sleep(100); } };
    await pg.keyboard.down(k); await hold(14);
    const dr1 = await pg.evaluate(() => window.__pthRun.drift());
    await pg.keyboard.up(k); await hold(1);
    const dr2 = await pg.evaluate(() => window.__pthRun.drift());
    ok(dr1 && dr2, label + ': steering into a bend at speed starts a drift, a short let-go keeps it (' + dr1 + ', ' + dr2 + ')');
    // Mini-turbo: a drift held past the blue sparks gives a turbo when it ends.
    await pg.evaluate((b) => { const R = window.__pthRun; R.setPos(b.i - 4); R.setPx(0); R.setV(0.9); }, prBend);
    await pg.keyboard.down(k);
    await hold(20);
    const ch = await pg.evaluate(() => window.__pthRun.charge());
    await pg.keyboard.up(k);
    let mt = 0; for (let t = 0; t < 10 && !mt; t++) { await pg.evaluate((b) => { window.__pthRun.setPos(b.i); window.__pthRun.setPx(0); }, prBend); await sleep(80); mt = await pg.evaluate(() => window.__pthRun.mt()); }
    ok(ch > 0.9 && mt > 0, label + ': a drift held past the blue sparks ends in a turbo (charge ' + ch.toFixed(2) + ', turbo ' + mt.toFixed(2) + ' s)');
  } else ok(false, label + ': a long bend to drift in');
  // Gentle hills: along the course the road stays in sight up to the horizon.
  let crests = 0;
  const nSeg = await pg.evaluate(() => window.__pthRun.segs());
  for (let i = 0; i < 24; i++) {
    await pg.evaluate((z) => { window.__pthRun.setTime(99); window.__pthRun.setPos(z); }, Math.floor(40 + i * (nSeg - 400) / 24));
    await sleep(60);
    if ((await pg.evaluate(() => window.__pthRun.view())).hidden > 20) crests++;
  }
  // Real climbs and dives now (Chamonix, web.64): a few crests hide the road ahead, most views do not.
  ok(crests <= 7, label + ': the road is mostly seen to the horizon (' + (24 - crests) + '/24 views without a crest hiding it)');
  // The clock runs out: the dealer completes the board, the showdown and the score.
  await pg.evaluate(() => window.__pthRun.setTime(0.2));
  const prE = await endInfo(pg, 15000);
  const prOver = await pg.evaluate(() => ({ best: localStorage.getItem('pth_game_best_poker-run'),
    board: window.__pthRun.game().board.length, map: !!document.querySelector('#pth-game svg.prun-map'),
    nodes: document.querySelectorAll('#pth-game .prun-map > g > circle').length, car: !!document.querySelector('#pth-game .prun-map g g rect'),
    flag: /🏁/.test((document.querySelector('#pth-game .prun-map') || {}).textContent || ''), mini: document.querySelector('#pth-game .prun-mini').hidden }));
  ok(prE.on && /×/.test(prE.calc) && (prOver.best !== null || prE.score === '0') && prOver.board === 5 && /Drifts/.test(prE.stats),
    label + ': time out, the board is completed, score saved (' + prE.score + ' · ' + prE.calc + ')');
  ok(prOver.mini, label + ': the HUD\'s small map gone with the showdown');
  ok(prOver.map && prOver.nodes === 11 && prOver.car && prOver.flag, label + ': the course map: start, 5 forks of 2 scenes, the car where it stopped, the finish flag (' + prOver.nodes + ' scenes)');
  await shot(pg, label + '-prun-over');
  // A new run (Space on the showdown), to take every fork on the right.
  await sleep(800); await pg.keyboard.press('Space');
  await pg.waitForFunction(() => window.__pthRun && window.__pthRun.state() === 'run', null, { timeout: 4000 }).catch(() => {});
  // Left an easier road, right a harder one (sharper bends, chips worth more): all rights.
  const prLR = await pg.evaluate(async () => {
    const R = window.__pthRun, sl = (ms) => new Promise((r) => setTimeout(r, ms)), c0 = R.stageCurves(1);
    for (let i = 0; i < 5; i++) { const gs = R.game().gates.map((g) => g.seg); R.setTime(99); R.setPos(gs[i] - 30); R.setPx(0.5); await sl(150); R.setPx(0.5); R.setPos(gs[i] - 2); await sl(300); }
    return { lvl: R.lvl(), c0, c5: R.stageCurves(5), v0: R.chipVal(0), v5: R.chipVal(5) };
  });
  ok(prLR.lvl.join() === '0,1,2,3,4,5' && prLR.c5 > prLR.c0 && prLR.v5 > prLR.v0, label + ': all rights: harder each time, sharper bends, richer chips (levels ' + prLR.lvl.join('') + ', bends ' + prLR.c0.toFixed(1) + ' → ' + prLR.c5.toFixed(1) + ', chips ' + prLR.v0 + ' → ' + prLR.v5 + ')');
  await pg.keyboard.press('Escape'); await sleep(300);   // pause the new run (the next Escape leaves)
  await pg.keyboard.press('Escape'); await sleep(300);
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card') && !document.querySelector('#pth-game-ace.prun-back') && !document.querySelector('#pth-game .prun-prev')), label + ': back on the arcade page, the car and its Ace gone');
  // ── Poker Drop: against the Ace, a drop falls to the bottom, the Ace answers ──
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pick(pg, 'pokerdrop');
  await pg.waitForFunction(() => (document.querySelector('#pth-game .pg-panel h2') || {}).textContent === 'Puissance Poker', null, { timeout: 8000 }).catch(() => {});
  const pdTiles = await pg.evaluate(() => ({ tiles: document.querySelectorAll('#pth-game .pg-panel .gm-tile').length, rules: document.querySelectorAll('#pth-game .pg-panel .gm-opt').length }));
  ok(pdTiles.tiles === 3 && pdTiles.rules === 2, label + ': Poker Drop offers three opponents and two rules');
  await pg.keyboard.press('ArrowDown'); await sleep(100);
  ok(await pg.evaluate(() => document.querySelector('#pth-game .gm-opt[data-o="sudden"]').classList.contains('on')), label + ': ↓ switches to sudden death');
  await pg.keyboard.press('ArrowDown'); await sleep(100);
  await pg.keyboard.press('Space');
  await pg.waitForFunction(() => window.__pthPD && window.__pthPD.state() === 'run', null, { timeout: 4000 }).catch(() => {});
  await pg.keyboard.press('Space');
  await sleep(700);
  const pd1 = await pg.evaluate(() => { const G = window.__pthPD.run(); return { bottom: G.grid[3] != null, moves: G.moves, hand: G.players[0].hand.filter((x) => x != null).length }; });
  ok(pd1.bottom && pd1.moves >= 1 && pd1.hand === 2, label + ': Space drops the card to the bottom of the middle column, a new card is drawn');
  await pg.waitForFunction(() => window.__pthPD.run().moves >= 2 && window.__pthPD.run().turn === 0, null, { timeout: 8000 }).catch(() => {});
  ok(await pg.evaluate(() => window.__pthPD.run().moves >= 2 && window.__pthPD.run().players[1].hand.every((x) => x != null)), label + ': the Ace plays his move and draws');
  await shot(pg, label + '-pd-run');
  await pg.keyboard.press('Escape'); await sleep(200);
  await pg.keyboard.press('Escape'); await sleep(500);
  await pg.keyboard.press('Escape');
  await sleep(600);
  const closed = await pg.evaluate(() => ({ gone: !document.getElementById('pth-game'), pad: window._pthPadOwner, on: window._pthGameOn, ach: window._achSeen,
    login: document.getElementById('s-connect').classList.contains('active') }));
  ok(closed.gone && !closed.pad && !closed.on && closed.login, label + ': Esc from the arcade page goes back to the login and releases the gamepad and the mascot');
  if (label === 'desktop') ok(closed.ach.indexOf('runner') >= 0, label + ': secret trophy granted on the way out');
  // An ordinary nickname: a normal training game, no overlay (the secret word
  // left the login on the choice of modes: training again first).
  ok(await pg.evaluate(() => document.getElementById('login-step1').style.display !== 'none'), label + ': back on the choice of modes');
  await pg.evaluate(() => { loginPickMode(document.querySelector('.login-card[onclick*="\'offline\'"]'), 'offline'); });
  await sleep(500);
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
  await secretWord(pg);
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await pg.evaluate(() => { const c = document.querySelector('#pth-game .gm-art[data-art="house"]').closest('.gm-card'); c.querySelector('[data-rules]').click(); });
  await sleep(200);
  const r = await pg.evaluate(() => ({ open: !document.querySelector('#pth-game .pg-rules').hidden,
    h: (document.querySelector('#pth-game .pg-sheet h3') || {}).textContent, li: document.querySelectorAll('#pth-game .pg-sheet li').length }));
  ok(r.open && r.h === 'Château de cartes' && r.li === 8, 'page: « Rules » explains the game (' + r.h + ', ' + r.li + ' points)');
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
