#!/usr/bin/env node
// The « Mini-games » mode on the login (modules/ui/login-arcade.mjs, web.22;
// design note claude/CONCEPTION_MODE_ARCADE.md): the fourth card stays hidden
// until 8 training trophies or the secret word, then says how many games are
// open, carries a « NEW » pill until opened once, opens the mini-games page
// with only the games already open, and fits on phones in landscape.
import { chromium } from 'playwright';
import { startServer } from './lib/mobile-harness.mjs';
import { ACHIEVEMENTS } from '../public/modules/achievements/defs.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const normal = ACHIEVEMENTS.filter((d) => d.cat !== 'secret').map((d) => d.id);

const { server, base } = await startServer();
const b = await chromium.launch();
const errors = [];
async function open(w, h, trophies, extra, full) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', isMobile: w < 1000, hasTouch: w < 1000 });
  // A storage that refuses the mode's flags (full, blocked).
  if (full) await ctx.addInitScript(() => {
    const o = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (/^pth_arcade/.test(k)) throw new DOMException('full', 'QuotaExceededError'); return o.call(this, k, v); };
  });
  await ctx.addInitScript(([u, ex]) => {
    try {
      if (sessionStorage.getItem('x')) return;
      sessionStorage.setItem('x', '1');
      localStorage.clear();
      localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'fr'); localStorage.setItem('pth_bak_auto', '0');
      localStorage.setItem('pth_ach_unlocked', JSON.stringify(u));
      for (const k in ex) localStorage.setItem(k, ex[k]);
    } catch (e) {}
  }, [Object.fromEntries(normal.slice(0, trophies).map((id) => [id, 1])), extra || {}]);
  // Watch for the light of the mode's first appearance (whenever it starts).
  await ctx.addInitScript(() => {
    window.__light = { canvas: false, hide: false, n: 0 };
    let lit = false;
    new MutationObserver(() => {
      const on = !!document.querySelector('canvas.pth-backlight');
      if (on && !lit) window.__light.n++;
      lit = on;
      if (on) window.__light.canvas = true;
      const c = document.getElementById('login-card-arcade');
      if (c && c.classList.contains('lc-hide')) window.__light.hide = true;
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  pg.arcadeEvents = [];
  pg.on('request', (r) => { if (r.url().endsWith('/__arcade')) { try { pg.arcadeEvents.push(JSON.parse(r.postData() || '{}').ev); } catch (e) {} } });
  await pg.goto(base);
  await pg.waitForSelector('.login-card');
  await pg.waitForFunction(() => window.loginOpenArcade, null, { timeout: 8000 }).catch(() => {});
  await sleep(900);
  return { ctx, pg };
}
const card = (pg) => pg.evaluate(() => {
  const c = document.getElementById('login-card-arcade');
  return { shown: !c.hidden && c.offsetParent !== null, desc: document.getElementById('lc-arcade-desc').textContent,
    pill: !document.getElementById('lc-arcade-new').hidden, last: c === c.parentNode.lastElementChild };
});

console.log('test-login-arcade-browser');
{
  const { ctx, pg } = await open(393, 852, 7);
  ok(!(await card(pg)).shown, '7 trophies: the Mini-games card is hidden');
  await ctx.close();
}
{
  const { ctx, pg } = await open(393, 852, 8);
  const c = await card(pg);
  ok(c.shown && c.last && c.desc === "Les jeux de l'As · 1/10 ouverts" && c.pill, '8 trophies: the fourth card, « 1/10 open », the NEW pill (' + c.desc + ')');
  // The first time the unlocked mode is on screen it appears in the light, then the Ace speaks.
  const anim = await pg.evaluate(() => window.__light);
  ok(anim.canvas && anim.hide, 'its first appearance: the light (canvas) while the card waits for the flash');
  await pg.waitForFunction(() => !document.querySelector('canvas.pth-backlight'), null, { timeout: 9000 }).catch(() => {});
  await sleep(1200);
  const after = await pg.evaluate(() => ({ canvas: !!document.querySelector('canvas.pth-backlight'), hide: document.getElementById('login-card-arcade').classList.contains('lc-hide'),
    shown: localStorage.getItem('pth_arcade_shown'), bubble: (document.querySelector('.ad-bubble') || {}).textContent || '' }));
  ok(!after.canvas && !after.hide && after.shown === '1' && /mini-jeux/i.test(after.bubble), 'then the card stays and the Ace congratulates (' + after.bubble.slice(0, 50) + '…)');
  await pg.click('#login-card-arcade');
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await sleep(400);
  const before = await pg.evaluate(() => document.querySelectorAll('#pth-game .gm-card.lock').length);
  ok(before === 10, 'the menu first shows game 1 as a mystery game (' + before + ' mystery cards)…');
  await sleep(4200);
  const m = await pg.evaluate(() => {
    const cards = [...document.querySelectorAll('#pth-game .gm-card')];
    const lock = cards.filter((c) => c.classList.contains('lock'));
    return {
      open: cards.filter((c) => !c.classList.contains('lock')).map((c) => c.querySelector('.gm-art').getAttribute('data-art')),
      steps: cards.map((c) => c.querySelector('.gm-step').textContent).join(','),
      kind: (document.querySelector('#pth-game .gm-card:not(.lock) .gm-kind') || {}).textContent,
      lock: lock.length, quiet: lock.every((c) => !c.querySelector('[data-play],[data-rules],.gm-kind,.gm-ico,[data-art]')),
      names: lock.map((c) => c.querySelector('.gm-q').textContent),
      need: (lock[0] && lock[0].querySelector('.gm-need span').textContent) || '',
      count: document.querySelector('#pth-game .gm-count').textContent,
    };
  });
  ok(m.open.join(',') === 'whowins' && m.steps === '1,2,3,4,5,6,7,8,9,10' && m.kind === '🎓 Progresser',
    '…then reveals it: game 1 open, numbered, with its kind (' + m.open.join(',') + ', ' + m.kind + ')');
  ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('pth_arcade_revealed') || '[]').join(',')) === 'whowins', 'the reveal is remembered (pth_arcade_revealed)');
  await sleep(300);
  ok(['unlock_trophies', 'celebrated', 'login_open', 'menu_open', 'reveal_1'].every((e) => pg.arcadeEvents.includes(e)),
    'the statistics follow (/__arcade: ' + pg.arcadeEvents.join(', ') + ')');
  ok(m.lock === 9 && m.names.every((n) => n === 'Jeu mystère') && m.quiet,
    'the 9 others are mystery games: no name, icon, kind, rules or play button');
  ok(m.need === '🏆 Encore 2 trophées · 8/10' && m.count === '🕹️ 1/10 jeux ouverts · 9 jeux mystère à découvrir',
    'the trophies still to win and the count of mystery games (' + m.need + ' | ' + m.count + ')');
  await pg.evaluate(() => { const c = document.querySelectorAll('#pth-game .gm-card')[1]; c.querySelector('.gm-art').click(); c.click(); });
  for (let i = 0; i < 1; i++) await pg.keyboard.press('ArrowRight');
  await pg.keyboard.press('Space');
  await sleep(700);
  ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-hub')), 'a mystery game cannot be opened (tap, Space)');
  await pg.evaluate(() => window.PthGames && window.PthGames.back());
  await sleep(1200);
  const back = await card(pg);
  ok(back.shown && !back.pill, 'back on the login: the card stays, the NEW pill is gone');
  await ctx.close();
}
{
  // At the table: the trophy that unlocks the mode is followed by a toast.
  const { ctx, pg } = await open(393, 852, 7);
  const t = await pg.evaluate(async () => {
    const seen = [];
    const orig = window.showToast; window.showToast = (m) => { seen.push(m); try { orig && orig(m); } catch (e) {} };
    document.getElementById('s-connect').classList.remove('active');
    const m = await import('/modules/achievements/index.mjs');
    const id = m.ACHIEVEMENTS.filter((d) => d.cat !== 'secret')[7].id;
    const st = JSON.parse(localStorage.getItem('pth_ach_unlocked') || '{}'); st[id] = Date.now(); localStorage.setItem('pth_ach_unlocked', JSON.stringify(st));
    window.dispatchEvent(new CustomEvent('pth-achievement', { detail: { id } }));
    await new Promise((r) => setTimeout(r, 3300));
    return { seen, flag: localStorage.getItem('pth_arcade_toast'), canvas: !!document.querySelector('canvas.pth-backlight') };
  });
  ok(t.seen.some((x) => /^🕹️ Nouveau mode débloqué/.test(x)) && t.flag === '1' && !t.canvas, 'at the table, the 8th trophy brings the toast « 🕹️ Nouveau mode débloqué ! », no light (' + t.seen.join(' | ') + ')');
  await ctx.close();
}
{
  const { ctx, pg } = await open(393, 852, 13, { pth_lang: 'en', pth_arcade_shown: '1' });
  const c = await card(pg);
  ok(c.shown && c.desc === "The Ace's games · 3/10 open", '13 trophies in English: « 3/10 open » (' + c.desc + ')');
  await pg.evaluate(() => window.setLang && window.setLang('de'));
  await sleep(1500);
  const d = await card(pg);
  ok(/3\/10/.test(d.desc) && d.desc !== c.desc, 'the count is re-worded when the language changes (' + d.desc + ')');
  await ctx.close();
}
{
  const { ctx, pg } = await open(393, 852, 0, { pth_arcade_all: '1', pth_arcade_shown: '1' });
  const c = await card(pg);
  ok(c.shown && /10\/10/.test(c.desc), 'the secret word (pth_arcade_all): the card with every game (' + c.desc + ')');
  await ctx.close();
}
{
  // The secret word typed in training unlocks the mode for good.
  const { ctx, pg } = await open(393, 852, 0);
  await pg.evaluate(() => { loginPickMode(document.querySelector('.login-card[onclick*="\'offline\'"]'), 'offline'); });
  await sleep(800);
  await pg.fill('#nick', 'Mascotte');
  await pg.evaluate(() => App.connect());
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  const n = await pg.evaluate(() => document.querySelectorAll('#pth-game .gm-card').length);
  ok(n === 10 && await pg.evaluate(() => localStorage.getItem('pth_arcade_all') === '1'), 'Mascotte: every game, and the mode stays unlocked on this device (' + n + ')');
  await ctx.close();
}
for (const [w, h] of [[852, 393], [740, 360], [375, 667], [1440, 900]]) {
  const { ctx, pg } = await open(w, h, 12, { pth_arcade_seen: '1', pth_arcade_shown: '1' });
  const m = await pg.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const hdr = r('#s-connect .connect-header'), cards = [...document.querySelectorAll('#login-step1 .login-card')].map((c) => c.getBoundingClientRect());
    return { ih: innerHeight, top: r('#s-connect > .card').top, hdr: hdr.bottom, last: cards[cards.length - 1].bottom, n: cards.filter((c) => c.height > 0).length };
  });
  ok(m.n === 4 && m.last <= m.ih && m.top >= m.hdr - 1, w + '×' + h + ': the four modes fit under the header (last card ' + Math.round(m.last) + '/' + m.ih + ', card top ' + Math.round(m.top) + ' ≥ ' + Math.round(m.hdr) + ')');
  await ctx.close();
}
{
  // web.27: the header folds away as for the other modes before the page
  // opens, and unfolds in its transition back on the login.
  const { ctx, pg } = await open(393, 852, 12, { pth_arcade_seen: '1', pth_arcade_shown: '1', pth_arcade_revealed: '["whowins","ace-runner","hilo"]' });
  const logoH = () => pg.evaluate(() => { const l = document.querySelector('#s-connect .card-logo'); return { h: l.getBoundingClientRect().height, fold: l.parentNode.classList.contains('login-in-mode'), game: !!document.getElementById('pth-game') }; });
  const h0 = await logoH();
  await pg.click('#login-card-arcade');
  await sleep(150);
  const mid = await logoH();
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await sleep(600);
  await pg.keyboard.press('Escape');
  await pg.waitForFunction(() => !document.getElementById('pth-game'), null, { timeout: 5000 }).catch(() => {});
  await sleep(120);
  const back1 = await logoH();
  await sleep(900);
  const back2 = await logoH();
  ok(h0.h > 40 && mid.fold && !mid.game && mid.h < h0.h && mid.h > 0, 'the tap folds the header first, as the other modes do (' + Math.round(h0.h) + ' → ' + Math.round(mid.h) + ' px, page not open yet)');
  ok(!back1.fold && back1.h < back2.h - 5 && Math.abs(back2.h - h0.h) < 2, 'back on the login, it unfolds in its transition (' + Math.round(back1.h) + ' → ' + Math.round(back2.h) + ' px)');
  await ctx.close();
}
{
  // web.28: a player who played games before the mode (the secret word kept
  // nothing then) keeps them open — a game's trophy or its best score — even
  // below 8 trophies, without the light; the others are mystery games.
  const { ctx, pg } = await open(393, 852, 0, { pth_ach_unlocked: JSON.stringify({ [normal[0]]: 1, [normal[1]]: 1, runner: 1 }), pth_game_best_house: '5', pth_arcade_seen: '1', pth_arcade_shown: '1' });
  const c = await card(pg);
  await pg.click('#login-card-arcade');
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await sleep(3000);
  const m = await pg.evaluate(() => ({ open: [...document.querySelectorAll('#pth-game .gm-card:not(.lock) h3')].map((h) => h.textContent), lock: document.querySelectorAll('#pth-game .gm-card.lock').length, n: window.__light.n }));
  ok(c.shown && c.desc === "Les jeux de l'As · 2/10 ouverts" && m.open.length === 2 && /Runner/.test(m.open[0]) && m.lock === 8 && m.n === 0,
    'games played before the mode stay open at 3 trophies, without the light (' + c.desc + ' · ' + m.open.join(' / ') + ' · ' + m.n + ' lights)');
  await ctx.close();
}
{
  // web.26: a storage that refuses the flags never replays the light — not on
  // the login, not in the menu, not after a game, not after a restart.
  const { ctx, pg } = await open(393, 852, 12, {}, true);
  await sleep(2500);
  const c = await card(pg);
  await pg.click('#login-card-arcade');
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await sleep(2500);
  const m = await pg.evaluate(() => ({ open: document.querySelectorAll('#pth-game .gm-card:not(.lock)').length }));
  await pg.click('#pth-game [data-play="0"]').catch(() => {});
  await sleep(1500);
  await pg.keyboard.press('Escape'); await sleep(2500);
  await pg.keyboard.press('Escape'); await sleep(3000);
  let n = await pg.evaluate(() => window.__light.n);   // login, menu, after the game, login again
  await pg.reload(); await pg.waitForSelector('.login-card'); await sleep(3500);
  n += await pg.evaluate(() => window.__light.n);
  ok(c.shown && m.open === 3 && n === 0, 'storage refusing the flags: the card and the 3 open games are there, never in the light (' + n + ' lights, ' + m.open + ' open)');
  await ctx.close();
}
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
