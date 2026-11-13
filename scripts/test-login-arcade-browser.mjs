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
async function open(w, h, trophies, extra) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', isMobile: w < 1000, hasTouch: w < 1000 });
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
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errors.push(String(e && e.message || e)));
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
  await pg.click('#login-card-arcade');
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  await sleep(500);
  const tiles = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .gm-card .gm-art')].map((a) => a.getAttribute('data-art')));
  ok(tiles.join(',') === 'whowins', 'a tap opens the mini-games page with only the game already open (' + tiles.join(',') + ')');
  await pg.evaluate(() => window.PthGames && window.PthGames.back());
  await sleep(1200);
  const back = await card(pg);
  ok(back.shown && !back.pill, 'back on the login: the card stays, the NEW pill is gone');
  await ctx.close();
}
{
  const { ctx, pg } = await open(393, 852, 13, { pth_lang: 'en' });
  const c = await card(pg);
  ok(c.shown && c.desc === "The Ace's games · 3/10 open", '13 trophies in English: « 3/10 open » (' + c.desc + ')');
  await pg.evaluate(() => window.setLang && window.setLang('de'));
  await sleep(1500);
  const d = await card(pg);
  ok(/3\/10/.test(d.desc) && d.desc !== c.desc, 'the count is re-worded when the language changes (' + d.desc + ')');
  await ctx.close();
}
{
  const { ctx, pg } = await open(393, 852, 0, { pth_arcade_all: '1' });
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
  const { ctx, pg } = await open(w, h, 12, { pth_arcade_seen: '1' });
  const m = await pg.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const hdr = r('#s-connect .connect-header'), cards = [...document.querySelectorAll('#login-step1 .login-card')].map((c) => c.getBoundingClientRect());
    return { ih: innerHeight, top: r('#s-connect > .card').top, hdr: hdr.bottom, last: cards[cards.length - 1].bottom, n: cards.filter((c) => c.height > 0).length };
  });
  ok(m.n === 4 && m.last <= m.ih && m.top >= m.hdr - 1, w + '×' + h + ': the four modes fit under the header (last card ' + Math.round(m.last) + '/' + m.ih + ', card top ' + Math.round(m.top) + ' ≥ ' + Math.round(m.hdr) + ')');
  await ctx.close();
}
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
