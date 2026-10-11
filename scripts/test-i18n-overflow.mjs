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
import { UI_AUDIT as AUDIT } from './lib/layout-audit.mjs';

const PHONES = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },       // 375 px: narrowest iPhone still sold
  { name: 'iPhone 15 landscape', family: 'ios' },       // the one-line bet panel
  { name: 'Galaxy S24', family: 'android' },            // 360 px: narrowest common Android
];
const ONLY_LANGS = (process.env.PTH_LANGS || '').split(',').map((s) => s.trim()).filter(Boolean);
const ONLY_SCREENS = (process.env.PTH_SCREENS || '').split(',').map((s) => s.trim()).filter(Boolean);
const { server, base } = await startServer();
const reporter = createReporter();

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
