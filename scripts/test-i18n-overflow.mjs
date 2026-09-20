#!/usr/bin/env node
// Text overflow across every interface language, in real browser engines on
// narrow phones. A translation is only checked for *parity* by the unit tests
// (every key present); whether "Relancer de $2,980" still fits its button in
// Finnish, Tamil or Arabic (RTL) is only visible in a browser.
//
// Screens: mode picker · login form · lobby · create table · game table on my
// turn (facing a bet: "Call $1,490" / "Raise $2,980", the longest labels).
// For each language the active screen is audited for:
//   · clipped text   - label wider / taller than its box with overflow hidden
//                      (an ellipsis counts too on buttons, tabs and titles);
//   · off-screen     - a control or label beyond the left / right screen edge;
//   · overlap        - two visible controls / titles on top of each other;
//   · page overflow  - the page scrolls sideways.
// A problem present in EVERY language (English included) is structural and is
// reported once as "all languages"; the rest is reported per language.
//
// Run:  node scripts/test-i18n-overflow.mjs          (npm run test:i18n-overflow)
// Env:  PTH_LANGS="de,fi,ar"  PTH_SCREENS="game,login"  + the harness variables
//       (PTH_MOBILE, PTH_DEVICES, PTH_ENGINE, PTH_VIEWPORT, PTH_SHOTS).
// Shots: one per failing language x screen: test-artifacts/mobile/<device>-i18n-<screen>-<lang>.png
import { startServer, createReporter, shot, openTable, enterTable, settle, runPlan, ME, GAME } from './lib/mobile-harness.mjs';

const PHONES = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },       // 375 px: narrowest iPhone still sold
  { name: 'iPhone 15 landscape', family: 'ios' },       // the one-line bet panel
  { name: 'Galaxy S24', family: 'android' },            // 360 px: narrowest common Android
];
const ONLY_LANGS = (process.env.PTH_LANGS || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY_SCREENS = (process.env.PTH_SCREENS || '').split(',').map((s) => s.trim()).filter(Boolean);
const { server, base } = await startServer();
const reporter = createReporter();

// In-page audit of the visible part of `rootSel` (+ the app header).
const AUDIT = (rootSel) => {
  const root = document.querySelector(rootSel) || document.body;
  const vw = window.innerWidth, out = [];
  const vis = (e) => { const c = getComputedStyle(e), r = e.getBoundingClientRect();
    // closed <details> (header menus) keep their boxes but paint nothing
    const d = e.closest('details:not([open])'); if (d && !e.closest('summary')) return false;
    if (typeof e.checkVisibility === 'function' && !e.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })) return false;
    return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.05 && r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && r.right > 2 && r.left < vw - 2; };   // panes of the mobile lobby pager sit fully off-screen on purpose
  const hiddenUp = (e) => { for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return true; } return false; };
  const scrollsX = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth + 1) return true; } return false; };
  const ownText = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const name = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '')) + (e.getAttribute('data-i18n') ? '[' + e.getAttribute('data-i18n') + ']' : '');
  const NOT_I18N = '.seat-name, .seat-money, .pb-name, .game-name, .gname, .player-name, .chat-line, .chat-msg, #g-title, .wc-name, input, textarea, .log-line, .notice-body';
  const STRICT = 'button, .btn-action, [role="tab"], .tab, h1, h2, h3, .login-card, .lc-t, .mode-seg-btn, .screen-title, select';
  const scope = [...root.querySelectorAll('*'), ...document.querySelectorAll('.header *')];
  const seen = new Set(), texts = [];
  // Rectangles of the PAINTED text, one per line (a wrapped inline link is two small boxes, not one big
  // one covering its neighbours), each cut by every box that clips it (an ellipsised name reports its
  // full unclipped width otherwise).
  const clipBy = (e, q) => { const r = { left: q.left, top: q.top, right: q.right, bottom: q.bottom };
    for (let p = e; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (c.overflowX === 'visible' && c.overflowY === 'visible') continue; const b = p.getBoundingClientRect();
      if (c.overflowX !== 'visible') { r.left = Math.max(r.left, b.left); r.right = Math.min(r.right, b.right); } if (c.overflowY !== 'visible') { r.top = Math.max(r.top, b.top); r.bottom = Math.min(r.bottom, b.bottom); } }
    return r; };
  const textRects = (e) => { const rg = document.createRange(); rg.selectNodeContents(e); let q = [...rg.getClientRects()].filter((r) => r.width > 1 && r.height > 1); if (!q.length) q = [e.getBoundingClientRect()]; return q.map((r) => clipBy(e, r)); };
  const boxRects = (e) => (getComputedStyle(e).display === 'inline' ? [...e.getClientRects()] : [e.getBoundingClientRect()]).map((r) => clipBy(e.parentElement || e, r));
  const cross = (A, B) => { let best = null; for (const a of A) for (const b of B) { const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (w > 3 && h > 3 && (!best || w * h > best[0] * best[1])) best = [w, h]; } return best; };
  for (const e of scope) {
    if (seen.has(e)) continue; seen.add(e);
    if (e.closest(NOT_I18N) || !vis(e) || hiddenUp(e)) continue;
    const txt = ownText(e); if (txt.length < 2) continue;
    const c = getComputedStyle(e), r = e.getBoundingClientRect();
    texts.push({ e, r: textRects(e), txt });
    const dx = e.scrollWidth - e.clientWidth, dy = e.scrollHeight - e.clientHeight;
    const cutX = dx > 1 && c.overflowX !== 'visible', cutY = dy > 2 && c.overflowY !== 'visible' && c.overflowY !== 'auto' && c.overflowY !== 'scroll';
    // An ellipsis is fine on a secondary description (.lc-d), never on a button, a tab or a title.
    const strict = !e.matches('.lc-d') && (e.matches(STRICT) || !!e.closest('button, .btn-action, [role="tab"], .lc-t'));
    if (cutX && (c.textOverflow !== 'ellipsis' || strict)) out.push({ kind: 'clipped', el: name(e), text: txt.slice(0, 40), by: Math.round(dx) + 'px' + (c.textOverflow === 'ellipsis' ? ' (…)' : '') });
    else if (cutY) out.push({ kind: 'clipped', el: name(e), text: txt.slice(0, 40), by: Math.round(dy) + 'px tall' });
    // text spilling OUT of a button-like box whose overflow is visible
    const box = e.closest('button, .btn-action, .login-card, .mode-seg-btn, [role="tab"]');
    if (box && box !== e) { const b = box.getBoundingClientRect(); if (r.right > b.right + 2 || r.left < b.left - 2) out.push({ kind: 'spills', el: name(e) + ' out of ' + name(box), text: txt.slice(0, 40), by: Math.round(Math.max(r.right - b.right, b.left - r.left)) + 'px' }); }
    if ((r.right > vw + 1 || r.left < -1) && !scrollsX(e)) out.push({ kind: 'off-screen', el: name(e), text: txt.slice(0, 40), by: Math.round(Math.max(r.right - vw, -r.left)) + 'px' });
  }
  // overlaps between controls / titles of the same screen
  const ctl = [...root.querySelectorAll('button, select, input, a[href], .login-card, h1, h2, h3, .screen-title'), ...document.querySelectorAll('.header button, .header h1, .header .title, #g-title')]
    .filter((e, i, a) => a.indexOf(e) === i && vis(e) && !hiddenUp(e));

  for (let i = 0; i < ctl.length; i++) for (let j = i + 1; j < ctl.length; j++) {
    const a = ctl[i], b = ctl[j]; if (a.contains(b) || b.contains(a)) continue;
    const x = cross(boxRects(a), boxRects(b));
    if (x) out.push({ kind: 'overlap', el: name(a) + ' x ' + name(b), text: (ownText(a) || ownText(b)).slice(0, 30), by: Math.round(x[0]) + 'x' + Math.round(x[1]) + 'px' });
  }
  // a label lying over (or under) a control it does not belong to - e.g. a screen title across the header icons
  for (const t of texts) for (const k of ctl) {
    if (k === t.e || k.contains(t.e) || t.e.contains(k)) continue;
    const x = cross(t.r, boxRects(k));
    if (x) out.push({ kind: 'overlap', el: name(t.e) + ' x ' + name(k), text: t.txt.slice(0, 30), by: Math.round(x[0]) + 'x' + Math.round(x[1]) + 'px' });
  }
  const over = document.documentElement.scrollWidth - vw;
  if (over > 1) out.push({ kind: 'page', el: 'document', text: '', by: over + 'px wider than the screen' });
  return out;
};

async function setLang(page, code) {
  await page.evaluate((c) => window.setLang(c), code);
  await page.waitForFunction((c) => document.documentElement.lang === c, code, { timeout: 8000 });
  await page.waitForTimeout(120);
}

// name, root selector, how to get there, what to do after each language switch
const SCREENS = [
  { id: 'mode', root: '#s-connect', enter: async (page) => { await openTable(page, base, { stopAt: 'login' }); } },
  { id: 'login', root: '#s-connect', enter: async (page) => { await page.locator('.login-card').nth(0).click(); await page.waitForTimeout(400); },
    leave: async (page) => { await page.locator('.login-back').first().click().catch(() => {}); await page.waitForTimeout(300); } },
  { id: 'lobby', root: '#s-lobby', enter: async (page) => { await openTable(page, base, { seats: 6, stopAt: 'lobby' }); await page.locator('#s-lobby.active').waitFor({ timeout: 8000 }); } },
  // App.openCreatePage(), not show('s-create'): the form is only moved into the page by the former -
  // the first version of this test audited an EMPTY create screen.
  { id: 'create', root: '#s-create', scroll: '#s-create .cp-scroll', enter: async (page) => { await page.evaluate(() => window.App.openCreatePage()); await page.locator('#s-create.active #create-form').waitFor({ timeout: 5000 }); await page.waitForTimeout(400); },
    leave: async (page) => { await page.evaluate(() => window.App.closeCreatePage()); await page.waitForTimeout(300); } },
  { id: 'game', root: '#s-game', enter: async (page) => { await enterTable(page, { seats: 6, board: 'flop', turn: 'first' }); },
    refresh: async (page) => { await page.evaluate(({ ME, GAME }) => { const f = window.__fx, opp = f.ids[2];   // an opponent bets big, then it is my turn
        f.socket.receive(f.envelope(f.MSG.T.PlayersActionDone, 45, [[1, 0, GAME], [2, 0, opp], [3, 0, 1], [4, 0, 4], [5, 0, 1500], [6, 0, 1500], [7, 0, 1500], [8, 0, 1500]]));
        f.socket.receive(f.envelope(f.MSG.T.PlayersTurn, 42, [[1, 0, GAME], [2, 0, ME], [3, 0, 1]])); }, { ME, GAME });
      await page.locator('#s-game.active .act-buttons-row .btn-action').first().waitFor({ timeout: 5000 }); await page.waitForTimeout(250); } },
];

async function runDevice(browser, name, descriptor) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.setLang === 'function');
    let langs = await page.evaluate(async () => (await import('/modules/i18n.mjs')).LANG_CODES.slice());
    if (ONLY_LANGS.length) langs = langs.filter((l) => ONLY_LANGS.includes(l));
    if (!langs.includes('en')) langs.unshift('en');
    for (const sc of SCREENS) {
      if (sc.enter) await sc.enter(page);
      if (ONLY_SCREENS.length && !ONLY_SCREENS.includes(sc.id)) { if (sc.leave) await sc.leave(page); continue; }
      const found = new Map();   // key -> { problem, langs[] }
      for (const lang of langs) {
        await setLang(page, lang);
        if (sc.refresh) await sc.refresh(page);
        let problems = await page.evaluate(AUDIT, sc.root);
        if (sc.scroll) {   // a long form: audit it screenful by screenful, not just its first screen
          const steps = await page.evaluate((q) => { const e = document.querySelector(q); return e ? Math.ceil((e.scrollHeight - e.clientHeight) / Math.max(1, e.clientHeight * 0.8)) : 0; }, sc.scroll);
          for (let i = 1; i <= Math.min(steps, 8); i++) {
            await page.evaluate(({ q, i }) => { const e = document.querySelector(q); e.scrollTop = i * e.clientHeight * 0.8; }, { q: sc.scroll, i });
            await page.waitForTimeout(60);
            problems = problems.concat(await page.evaluate(AUDIT, sc.root));
          }
          await page.evaluate((q) => { const e = document.querySelector(q); if (e) e.scrollTop = 0; }, sc.scroll);
        }
        for (const p of problems) { const key = p.kind + '|' + p.el; if (!found.has(key)) found.set(key, { p, langs: [], sample: {} }); const f = found.get(key); if (!f.langs.includes(lang)) f.langs.push(lang); f.sample[lang] = p; }
        if (problems.length && lang !== 'en') await shot(page, name, `i18n-${sc.id}-${lang}`);
      }
      await setLang(page, 'en');
      const lines = [];
      for (const { p, langs: ls, sample } of found.values()) {
        const all = ls.length === langs.length;
        const worst = ls.map((l) => sample[l]).sort((a, b) => parseInt(b.by, 10) - parseInt(a.by, 10))[0];
        lines.push(`${p.kind}: ${p.el} - ${all ? 'ALL languages' : ls.length + ' language(s): ' + ls.join(' ')} - worst "${worst.text}" by ${worst.by}`);
      }
      const label = `${sc.id} screen, ${langs.length} languages`;
      if (lines.length) reporter.fail(label, lines.join('\n      ')); else reporter.pass(label);
      if (sc.leave) await sc.leave(page);
    }
  } catch (error) { reporter.fail('run aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'i18n-aborted'); }
  finally { await context.close(); }
}

const code = await runPlan('test-i18n-overflow', reporter, runDevice, PHONES);
server.close();
process.exit(code);
