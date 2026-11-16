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
  // (it waits for the login to settle and the games to warm up: give a slow machine the time)
  await pg.waitForFunction(() => window.__light && window.__light.canvas, null, { timeout: 8000 }).catch(() => {});
  const anim = await pg.evaluate(() => window.__light);
  ok(anim.canvas && anim.hide, 'its first appearance: the light (canvas) while the card waits for the flash');
  await pg.waitForFunction(() => !document.querySelector('canvas.pth-backlight'), null, { timeout: 9000 }).catch(() => {});
  await sleep(1200);
  const after = await pg.evaluate(() => ({ canvas: !!document.querySelector('canvas.pth-backlight'), hide: document.getElementById('login-card-arcade').classList.contains('lc-hide'),
    shown: localStorage.getItem('pth_arcade_shown'), bubble: (document.querySelector('.ad-bubble') || {}).textContent || '' }));
  ok(!after.canvas && !after.hide && after.shown === '1' && /mini-jeux/i.test(after.bubble), 'then the card stays and the Ace congratulates (' + after.bubble.slice(0, 50) + '…)');
  const bb = await pg.evaluate(() => [...document.querySelectorAll('#ace-dock .ad-bubble button')].map((b) => b.textContent.trim()));
  ok(bb.length === 1 && bb[0] === 'Fermer', 'his word only, with « Close » — no « Play now » (' + bb.join(', ') + ')');
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
  ok(['unlock_trophies', 'celebrated', 'celebrate_play', 'login_open', 'menu_open', 'reveal_1'].every((e) => pg.arcadeEvents.includes(e)),
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
  // web.40: no page — back on the choice of modes, the card out of its egg.
  await sleep(250);
  const mid = await pg.evaluate(() => ({ step1: document.getElementById('login-step1').style.display !== 'none', fold: document.querySelector('#s-connect .card').classList.contains('login-in-mode'), page: !!document.getElementById('pth-game') }));
  ok(mid.step1 && !mid.fold && !mid.page, 'Mascotte: back on the choice of modes, the header unfolding, no mini-games page');
  await sleep(1400);
  const egg = await pg.evaluate(() => ({ canvas: !!document.querySelector('canvas.pth-backlight'), hide: document.getElementById('login-card-arcade').classList.contains('lc-hide') }));
  ok(egg.canvas && egg.hide, 'Mascotte: the easter egg plays round the empty card');
  // web.71: the light's canvas has the window's size in px, as its drawing (at 100vh, Safari's bars shown, it was stretched).
  const cvs = await pg.evaluate(() => { const c = document.querySelector('canvas.pth-backlight'); if (!c) return null; const r = c.getBoundingClientRect(); return { h: r.height, w: r.width, ih: innerHeight, iw: innerWidth, px: c.style.height }; });
  ok(cvs && Math.abs(cvs.h - cvs.ih) < 1 && Math.abs(cvs.w - cvs.iw) < 1 && /px$/.test(cvs.px), 'the light is drawn over the window it measures (' + JSON.stringify(cvs) + ')');
  // web.70: the mini-games page's modules and fonts are loaded before the egg plays (nothing fetched during it).
  const warmed = await pg.evaluate(() => typeof window.loginArcadeWarmed === 'function' && window.loginArcadeWarmed());
  ok(warmed, 'Mascotte: the page, its light and its fonts loaded ahead of the egg');
  await pg.waitForFunction(() => /🥚/.test((document.querySelector('#ace-dock .ad-bubble') || {}).textContent || ''), null, { timeout: 12000 }).catch(() => {});
  const c = await card(pg);
  const st = await pg.evaluate(() => ({ all: localStorage.getItem('pth_arcade_all'), shown: localStorage.getItem('pth_arcade_shown'), bub: (document.querySelector('#ace-dock .ad-bubble') || {}).textContent || '', cls: document.getElementById('login-card-arcade').className }));
  ok(c.shown && /10\/10/.test(c.desc) && st.all === '1' && st.shown === '1', 'Mascotte: the card with every game, unlocked for good (' + c.desc + ')');
  ok(/mot secret/.test(st.bub), 'Mascotte: the Ace\'s easter-egg word (« ' + st.bub.slice(0, 50) + '… »)');
  const btns = await pg.evaluate(() => [...document.querySelectorAll('#ace-dock .ad-bubble button')].map((b) => b.textContent.trim()));
  ok(btns.length === 1 && btns[0] === 'Fermer', 'Mascotte: only « Close » under the Ace\'s word (' + btns.join(', ') + ')');
  // Typed again: everything is open already — the Ace's joke, no light.
  await pg.evaluate(() => loginPickMode(document.querySelector('.login-card[onclick*="\'offline\'"]'), 'offline'));
  await sleep(500);
  ok(await pg.evaluate(() => { const b = document.querySelector('#ace-dock .ad-bubble.ad-open'); return !b || !/🥚/.test(b.textContent); }),
    'a mode picked while the Ace\'s word is up: as « Close »');
  await pg.fill('#nick', 'mascotte');
  await pg.evaluate(() => App.connect());
  await pg.waitForFunction(() => /😄/.test((document.querySelector('#ace-dock .ad-bubble') || {}).textContent || ''), null, { timeout: 8000 }).catch(() => {});
  const again = await pg.evaluate(() => ({ step1: document.getElementById('login-step1').style.display !== 'none', canvas: !!document.querySelector('canvas.pth-backlight'), page: !!document.getElementById('pth-game'), bub: (document.querySelector('#ace-dock .ad-bubble') || {}).textContent || '' }));
  ok(again.step1 && !again.canvas && !again.page && /déjà débloqué/.test(again.bub), 'Mascotte again: back on the modes, the Ace\'s joke, no light (« ' + again.bub.slice(0, 50) + '… »)');
  await pg.click('#login-card-arcade');
  await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
  const op = await pg.evaluate(() => ({ n: document.querySelectorAll('#pth-game .gm-card').length, bub: (document.querySelector('#ace-dock .ad-bubble.ad-open') || {}).textContent || '' }));
  ok(op.n === 11 && !/😄/.test(op.bub), 'Mascotte again: the card opens the page with every game and the easter-egg bonus, the Ace\'s word closed (' + op.n + ')');
  await ctx.close();
}
{
  // The mode already there from the trophies, some games still closed: the
  // secret word opens the rest with the easter egg.
  const { ctx, pg } = await open(393, 852, 12, { pth_lang: 'en', pth_arcade_shown: '1', pth_arcade_seen: '1' });
  await pg.evaluate(() => { loginPickMode(document.querySelector('.login-card[onclick*="\'offline\'"]'), 'offline'); });
  await sleep(800);
  await pg.fill('#nick', 'Mascot');
  await pg.evaluate(() => App.connect());
  await pg.waitForFunction(() => /🥚/.test((document.querySelector('#ace-dock .ad-bubble') || {}).textContent || ''), null, { timeout: 15000 }).catch(() => {});
  const c = await card(pg);
  ok(/10\/10/.test(c.desc), 'mode from the trophies (3/10): the secret word opens all ten, with the egg (' + c.desc + ')');
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
  const { ctx, pg } = await open(393, 852, 0, { pth_ach_unlocked: JSON.stringify({ [normal[0]]: 1, [normal[1]]: 1, runner: 1 }), pth_game_best_videopoker: '5', pth_arcade_seen: '1', pth_arcade_shown: '1' });
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
{
  // web.105: the welcome sentence follows the Hall of Fame (off: « stay on this device »; on: « can enter the
  // Hall of Fame, if you wish »; on but « never »: the device again), and the Ranking window gets a « Mini-jeux »
  // tab with every ranked game's boards, opened by itself from the mini-games page.
  const intro = async (names, opt) => {
    const { ctx, pg } = await open(393, 852, 12, Object.assign({ pth_arcade_seen: '1', pth_arcade_shown: '1', pth_arcade_revealed: '["whowins","ace-runner","hilo"]' }, opt ? { pth_hof_opt: opt } : {}));
    const top = [{ n: 'ABC', s: 4321, ts: Date.now() }, { n: 'XYZ', s: 1200, ts: Date.now() }];
    const boards = { tv: top, endless: [], daily: [], free: top, time: [] };
    if (names) await pg.route('**/__hof?g=*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, names, day: '2026-11-16', top: 20, topDay: 10, boards }) }));
    await pg.click('#login-card-arcade');
    await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }).catch(() => {});
    await sleep(900);
    const txt = await pg.evaluate(() => (document.querySelector('#pth-game .gm-intro') || {}).textContent || '');
    return { ctx, pg, txt };
  };
  let r = await intro(null);
  ok(/restent sur cet appareil/.test(r.txt), 'Hall of Fame off: « the best scores stay on this device » (' + r.txt.slice(-40) + ')');
  await r.ctx.close();
  r = await intro('initials', 'no');
  ok(/restent sur cet appareil/.test(r.txt), 'Hall of Fame on, the player said never: the same sentence');
  await r.ctx.close();
  r = await intro('initials');
  ok(/peuvent entrer au Hall of Fame, si tu le veux/.test(r.txt), 'Hall of Fame on: « your best scores can enter the Hall of Fame, if you wish » (' + r.txt.slice(-50) + ')');
  const pg = r.pg;
  await pg.click('#ranking-btn-arcade');
  await pg.waitForSelector('#rk-hof-wrap .rk-table', { timeout: 6000 }).catch(() => {});
  const v = await pg.evaluate(() => {
    const tab = document.querySelector('#ranking-modal .rk-tab-hof'), act = document.querySelector('#ranking-modal .rk-tab.active');
    const tabs = [...document.querySelectorAll('#ranking-modal .rk-tab')].filter((b) => b.offsetParent), rows = [...document.querySelectorAll('#rk-hof-wrap tbody tr')];
    const tr = tabs.map((b) => b.getBoundingClientRect()), card = document.querySelector('#ranking-modal .rk-card').getBoundingClientRect();
    return { shown: tab && tab.style.display !== 'none', label: tab && tab.textContent, active: act && act.dataset.src,
      games: [...document.querySelectorAll('#rk-hof-wrap select option')].map((o) => o.value), modes: [...document.querySelectorAll('#rk-hof-wrap .hofv-modes button')].map((b) => b.textContent),
      rows: rows.map((x) => x.cells[1].textContent + ' ' + x.cells[2].textContent), fit: tr.every((x) => x.right <= card.right + 1), ach: document.getElementById('rk-ach-wrap').style.display };
  });
  ok(v.shown && v.label === 'Mini-jeux' && v.active === 'hof' && v.ach === 'none', 'Ranking from the mini-games page: the « Mini-jeux » tab, opened by itself (' + JSON.stringify({ label: v.label, active: v.active }) + ')');
  ok(v.games.join(',') === 'whowins,ace-runner,hilo' && v.modes.length === 3 && v.rows.length === 2 && /^ABC 4/.test(v.rows[0]) && v.fit,
    'its boards: only the games open here (12 trophies: 3 — web.106), a tab per mode, the top lines; the five tabs fit (' + JSON.stringify({ g: v.games, modes: v.modes, rows: v.rows }) + ')');
  // The secret word opens everything: every ranked game, the hidden House of Cards too (never Poker Drop).
  await pg.evaluate(() => { localStorage.setItem('pth_arcade_all', '1'); window.rankingSelect('pth'); window.rankingSelect('hof'); });
  await pg.waitForSelector('#rk-hof-wrap select', { timeout: 6000 }).catch(() => {});
  await sleep(400);
  const all = await pg.evaluate(() => [...document.querySelectorAll('#rk-hof-wrap select option')].map((o) => o.value));
  ok(all.length === 10 && all.includes('house') && !all.includes('pokerdrop'), 'everything open (secret word): the 10 ranked games, the House of Cards too (' + all.join(',') + ')');
  await pg.selectOption('#rk-hof-wrap select', 'videopoker');
  await sleep(500);
  const vp = await pg.evaluate(() => [...document.querySelectorAll('#rk-hof-wrap .hofv-modes button')].map((b) => b.textContent));
  ok(vp.length === 8 && vp.filter((x) => /Défi du jour/.test(x)).length === 4, 'Video Poker: each machine, free and daily (' + vp.length + ' tabs)');
  await pg.click('#ranking-modal .rk-tab[data-src="pth"]').catch(() => {});
  await sleep(300);
  ok(await pg.evaluate(() => document.getElementById('rk-hof-wrap').style.display === 'none' && document.querySelector('#ranking-modal .rk-tab.active').dataset.src === 'pth'), 'back on PokerTH, the boards hide');
  await r.ctx.close();
}
{
  // web.106: no game open on this device → no Mini-games tab, even with the Hall of Fame on.
  const { ctx, pg } = await open(393, 852, 0);
  await pg.route('**/__hof?g=*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, names: 'initials', day: '2026-11-16', top: 20, topDay: 10, boards: {} }) }));
  await pg.evaluate(() => window.openRankingModal());
  await sleep(1500);
  const t = await pg.evaluate(() => document.querySelector('#ranking-modal .rk-tab-hof').style.display);
  ok(t === 'none', 'no game open here: no Mini-games tab in Ranking, the Hall of Fame on or not (' + t + ')');
  await ctx.close();
}
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
