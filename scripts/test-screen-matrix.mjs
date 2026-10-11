#!/usr/bin/env node
// Screen matrix in real browser engines: the screens the phone tests do not
// reach - desktop monitors from a small laptop to 4K / ultrawide, tablets and
// foldables - in the THREE engines (Chromium = Chrome / Edge / Opera, Firefox =
// Gecko, WebKit = Safari). The phone tests only run WebKit and Chromium on
// phone profiles; nothing ran Firefox on the table before this test.
//
// Per profile x engine:
//   · mode picker, login form, lobby (6-seat game listed), create-table form
//     (scrolled screenful by screenful): text clipped / spilling out of its
//     button / off-screen, controls on top of one another, sideways page
//     scroll (the same audit as test-i18n-overflow, in English);
//   · table on my turn facing a big bet, 2 / 6 / 10 players seated and 10 as a
//     spectator: the table-sweep geometry (seats inside the zone, no overlap,
//     board / pot / pucks / chips clear, self box centred above the action
//     bar), plus: the table zone inside the window, every action button fully
//     on screen, the same text audit on the game screen;
//   · resize (desktop profiles at 1440x900 only): the window is dragged
//     through every layout breakpoint of the CSS / JS (900, 740, 600 px wide,
//     600 / 500 px tall, portrait and landscape) down to a phone and back. At
//     each size: lobby and table audited as above; back at the start size,
//     the layout must be the one it was (no state left over from the phone
//     layout - the way Arnaud checks the phone layout from his desktop).
//
// Run:   node scripts/test-screen-matrix.mjs            (npm run test:screen-matrix)
// Env:   PTH_ENGINES="firefox"  or "chromium,webkit"  - engines to run (default all)
//        PTH_DEVICES="Desktop 1920x1080,iPad Mini"     - profiles (every engine of each)
//        PTH_MOBILE=desktop|tablet|resize              - one family only
//        PTH_STEPS="ui,table,resize"                   - parts to run
//        PTH_SHOTS=0, PTH_VIEWPORT as the other browser tests.
// Shots: test-artifacts/mobile/<profile>-<engine>-<step>.png
import { startServer, createReporter, shot, settle, openTable, enterTable, runPlan, devices, ME, GAME } from './lib/mobile-harness.mjs';
import { UI_AUDIT, measureTable, auditTable } from './lib/layout-audit.mjs';

const ENGINES = ['chromium', 'firefox', 'webkit'];
const UA = { chromium: devices['Desktop Chrome'].userAgent, firefox: devices['Desktop Firefox'].userAgent, webkit: devices['Desktop Safari'].userAgent };
const desktop = (w, h, dpr, note) => ENGINES.map((engine) => ({ name: `Desktop ${w}x${h}`, family: 'desktop', engine, note,
  descriptor: { viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: false, hasTouch: false, userAgent: UA[engine] } }));
// A tablet runs in its own engine (iPad = WebKit, every iPad browser is WebKit)
// and, for Android, in Firefox as well (Firefox for Android is Gecko).
const tablet = (name, engines) => engines.map((engine) => ({ name, family: 'tablet', engine, descriptor: devices[name] }));
const custom = (name, w, h, dpr, engines, ua) => engines.map((engine) => ({ name, family: 'tablet', engine,
  descriptor: { viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, userAgent: ua || devices['Galaxy Tab S9'].userAgent } }));

export const SCREENS = [
  ...desktop(1280, 720, 1, 'small laptop'),
  ...desktop(1366, 768, 1, 'most common laptop'),
  ...desktop(1440, 900, 2, 'MacBook Air'),
  ...desktop(1536, 864, 1.25, 'Windows laptop at 125 %'),
  ...desktop(1920, 1080, 1, 'Full HD'),
  ...desktop(2560, 1440, 1, 'QHD'),
  ...desktop(3440, 1440, 1, 'ultrawide'),
  ...desktop(3840, 2160, 1, '4K at 100 %'),
  ...tablet('iPad Mini', ['webkit']),
  ...tablet('iPad Mini landscape', ['webkit']),
  ...tablet('iPad (gen 11)', ['webkit']),
  ...tablet('iPad (gen 11) landscape', ['webkit']),
  ...tablet('iPad Pro 11', ['webkit']),
  ...tablet('iPad Pro 11 landscape', ['webkit']),
  ...tablet('Galaxy Tab S9', ['chromium', 'firefox']),
  ...tablet('Galaxy Tab S9 landscape', ['chromium', 'firefox']),
  // Foldables: no Playwright profile, sizes as reported by Chrome on the devices.
  ...custom('Foldable open 904x1100', 904, 1100, 2.4, ['chromium', 'firefox']),
  ...custom('Foldable open landscape 1100x904', 1100, 904, 2.4, ['chromium']),
  ...custom('Foldable cover 344x882', 344, 882, 3, ['chromium']),
  ...ENGINES.map((engine) => ({ name: 'Resize 1440x900', family: 'resize', engine,
    descriptor: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, userAgent: UA[engine] } })),
];
// Every width / height threshold used by pokerth.css and pokerth.js, crossed
// one by one, then a phone in both orientations, then back.
const RESIZE = [[1440, 900], [1180, 820], [1024, 768], [899, 700], [820, 1180], [740, 900], [739, 900], [600, 900], [599, 900],
  [390, 844], [844, 390], [900, 599], [960, 499], [1440, 900]];

const STEPS = (process.env.PTH_STEPS || 'ui,table,resize').split(',').map((s) => s.trim());
const TABLES = [{ seats: 2 }, { seats: 6 }, { seats: 10 }, { seats: 10, spectator: true }];

const { server, base } = await startServer();
const reporter = createReporter();

// Same flows as test-i18n-overflow. The first-run "local backup" banner
// (Chromium: File System Access API) is dismissed by openTable with a tap -
// a desktop profile has no touch: click it away.
async function dismissBanner(page) {
  const later = page.locator('#bak-restore-banner button').last();
  try { if (await later.isVisible()) await later.click({ timeout: 2000 }); } catch (_e) {}
}
async function bigBetMyTurn(page) {
  await page.evaluate(({ ME, GAME }) => { const f = window.__fx, opp = f.ids[2] || f.ids[1];
    f.socket.receive(f.envelope(f.MSG.T.PlayersActionDone, 45, [[1, 0, GAME], [2, 0, opp], [3, 0, 1], [4, 0, 4], [5, 0, 1500], [6, 0, 1500], [7, 0, 1500], [8, 0, 1500]]));
    f.socket.receive(f.envelope(f.MSG.T.PlayersTurn, 42, [[1, 0, GAME], [2, 0, ME], [3, 0, 1]])); }, { ME, GAME });
  await page.locator('#s-game.active .act-buttons-row .btn-action').first().waitFor({ timeout: 5000 });
  await page.waitForFunction(() => !document.querySelector('.fly-card, .fly-chip'), null, { timeout: 3000 }).catch(() => {});
  await settle(page);
}
// Names the audits above skip on purpose (player data, not translated text)
// but that must stay readable: a name cell squeezed to nothing by the fixed
// tracks of its row (the players list at its default 240 px width).
const NAMES_AUDIT = (rootSel) => [...document.querySelectorAll(`${rootSel} .pl-name, ${rootSel} .game-name, ${rootSel} .seat-name`)]
  .filter((e) => e.textContent.trim().length > 1 && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden')
  .filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width < Math.min(24, e.scrollWidth); })
  .map((e) => `name squeezed: .${e.className.split(' ')[0]} "${e.textContent.trim().slice(0, 30)}" is ${Math.round(e.getBoundingClientRect().width)}px wide`)
  .slice(0, 3);
const fmt = (problems) => problems.map((p) => `${p.kind}: ${p.el}${p.text ? ' "' + p.text + '"' : ''} by ${p.by}`);
async function uiAudit(page, root, scroll) {
  let problems = await page.evaluate(UI_AUDIT, root);
  if (scroll) {   // a long form: screenful by screenful
    const steps = await page.evaluate((q) => { const e = document.querySelector(q); return e ? Math.ceil((e.scrollHeight - e.clientHeight) / Math.max(1, e.clientHeight * 0.8)) : 0; }, scroll);
    for (let i = 1; i <= Math.min(steps, 8); i++) {
      await page.evaluate(({ q, i }) => { const e = document.querySelector(q); e.scrollTop = i * e.clientHeight * 0.8; }, { q: scroll, i });
      await page.waitForTimeout(60);
      problems = problems.concat(await page.evaluate(UI_AUDIT, root));
    }
    await page.evaluate((q) => { const e = document.querySelector(q); if (e) e.scrollTop = 0; }, scroll);
  }
  const seen = new Set();
  return fmt(problems).concat(await page.evaluate(NAMES_AUDIT, root)).filter((l) => !seen.has(l) && seen.add(l));
}
// Table geometry (table-sweep) + what a big screen or a resize can break.
async function tableProblems(page, seats, spectator) {
  const g = await measureTable(page);
  const extra = await page.evaluate(() => {
    const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return c.display !== 'none' && c.visibility !== 'hidden' && r.width > 1 && r.height > 1; };
    const out = [], W = innerWidth, H = innerHeight;
    const z = document.getElementById('g-table-zone').getBoundingClientRect();
    if (z.left < -1 || z.top < -1 || z.right > W + 1 || z.bottom > H + 1) out.push(`table zone leaves the window (${Math.round(z.left)},${Math.round(z.top)} - ${Math.round(z.right)},${Math.round(z.bottom)} / ${W}x${H})`);
    if (z.width < 120 || z.height < 120) out.push(`table zone collapsed to ${Math.round(z.width)}x${Math.round(z.height)}`);
    [...document.querySelectorAll('.act-buttons-row .btn-action')].filter(vis).forEach((b) => { const r = b.getBoundingClientRect();
      if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) out.push(`action button "${b.textContent.trim().slice(0, 20)}" is cut by the window edge`); });
    const overY = document.documentElement.scrollHeight - H;
    if (overY > 1 && getComputedStyle(document.documentElement).overflowY !== 'hidden') out.push(`page scrolls vertically by ${overY}px on the table`);
    return out;
  });
  return auditTable(g, seats, spectator).concat(extra);
}
// Snapshot of the layout, to compare before / after a round trip of resizes.
const signature = (page) => page.evaluate(() => [...document.querySelectorAll('#g-table-zone, #g-seats .seat, #g-comm .pk, .my-zone, .act-buttons-row .btn-action, #s-lobby .game-row, .header')]
  .filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return [e.id || e.className.split(' ')[0], Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(':'); }));
function diffSig(a, b) {
  const out = []; const n = Math.max(a.length, b.length);
  if (a.length !== b.length) out.push(`${a.length} boxes before, ${b.length} after`);
  for (let i = 0; i < n && out.length < 6; i++) if (a[i] !== b[i]) {
    const pa = (a[i] || '').split(':'), pb = (b[i] || '').split(':');
    if (pa[0] === pb[0] && pa.slice(1).every((v, k) => Math.abs(Number(v) - Number(pb[k + 1])) <= 1)) continue;
    out.push(`${a[i] || '-'} -> ${b[i] || '-'}`);
  }
  return out;
}

async function withPage(browser, descriptor, fn) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('JavaScript error: ' + String(e && e.message || e).split('\n')[0]));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  try { await fn(page, errors); } finally { await context.close(); }
}
// One reported check; an abort (harness hiccup: navigation, timeout) is retried once.
async function step(label, browser, descriptor, shotName, tag, fn) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    let aborted = null;
    await withPage(browser, descriptor, async (page, errors) => {
      try {
        const problems = (await fn(page)).concat(errors);
        await shot(page, shotName, tag);
        if (problems.length) reporter.fail(label, [...new Set(problems)].join('\n      ')); else reporter.pass(label);
      } catch (error) { aborted = String(error && error.message || error).split('\n')[0]; if (attempt === 2) await shot(page, shotName, tag + '-aborted'); }
    });
    if (!aborted) return;
    if (attempt === 2) reporter.fail(label, 'aborted twice: ' + aborted);
  }
}

async function runDevice(browser, name, descriptor, engine) {
  const shotName = `${name}-${engine}`;
  const family = /^Resize/.test(name) ? 'resize' : 'other';
  if (family !== 'resize' && STEPS.includes('ui')) {
    await step('mode picker + login form', browser, descriptor, shotName, 'login', async (page) => {
      await openTable(page, base, { stopAt: 'login' }); await dismissBanner(page);
      const out = (await uiAudit(page, '#s-connect')).map((l) => 'mode picker - ' + l);
      await page.locator('.login-card').nth(0).click(); await page.waitForTimeout(400);
      return out.concat((await uiAudit(page, '#s-connect')).map((l) => 'login form - ' + l));
    });
    await step('lobby + create table', browser, descriptor, shotName, 'lobby', async (page) => {
      await openTable(page, base, { seats: 6, stopAt: 'lobby' }); await dismissBanner(page);
      await page.locator('#s-lobby.active').waitFor({ timeout: 8000 }); await page.waitForTimeout(300);
      const out = (await uiAudit(page, '#s-lobby')).map((l) => 'lobby - ' + l);
      await shot(page, shotName, 'lobby-list');
      await page.evaluate(() => window.App.openCreatePage()); await page.locator('#s-create.active #create-form').waitFor({ timeout: 5000 }); await page.waitForTimeout(400);
      return out.concat((await uiAudit(page, '#s-create', '#s-create .cp-scroll')).map((l) => 'create - ' + l));
    });
  }
  if (family !== 'resize' && STEPS.includes('table')) {
    for (const t of TABLES) {
      const label = `table ${t.spectator ? 'spectator' : 'seated'} ${String(t.seats).padStart(2)} players`;
      await step(label, browser, descriptor, shotName, `table-${t.spectator ? 'spectator' : 'seated'}-${String(t.seats).padStart(2, '0')}`, async (page) => {
        await openTable(page, base, { seats: t.seats, spectator: !!t.spectator, board: 'river', turn: 'first', stopAt: 'lobby' }); await dismissBanner(page);
        await enterTable(page, { seats: t.seats, spectator: !!t.spectator, board: 'river', turn: 'first' });
        if (!t.spectator) await bigBetMyTurn(page); else { await page.waitForFunction(() => !document.querySelector('.fly-card, .fly-chip'), null, { timeout: 3000 }).catch(() => {}); await settle(page); }
        return (await tableProblems(page, t.seats, !!t.spectator)).concat((await uiAudit(page, '#s-game')).map((l) => 'text - ' + l));
      });
    }
  }
  if (family === 'resize' && STEPS.includes('resize')) {
    const sizes = RESIZE.map(([w, h]) => `${w}x${h}`).join(' > ');
    await step(`lobby resized ${sizes}`, browser, descriptor, shotName, 'resize-lobby', async (page) => {
      await openTable(page, base, { seats: 6, stopAt: 'lobby' }); await dismissBanner(page);
      await page.locator('#s-lobby.active').waitFor({ timeout: 8000 }); await page.waitForTimeout(300);
      const before = await signature(page), out = [];
      for (const [w, h] of RESIZE) {
        await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(350);
        (await uiAudit(page, '#s-lobby')).forEach((l) => out.push(`${w}x${h} - ${l}`));
      }
      diffSig(before, await signature(page)).forEach((d) => out.push('back at 1440x900, the lobby moved: ' + d));
      return out;
    });
    await step(`table resized ${sizes}`, browser, descriptor, shotName, 'resize-table', async (page) => {
      await openTable(page, base, { seats: 6, board: 'river', turn: 'first', stopAt: 'lobby' }); await dismissBanner(page);
      await enterTable(page, { seats: 6, board: 'river', turn: 'first' });
      await bigBetMyTurn(page);
      const before = await signature(page), out = [];
      for (const [w, h] of RESIZE) {
        await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(250); await settle(page);
        (await tableProblems(page, 6, false)).forEach((l) => out.push(`${w}x${h} - ${l}`));
        (await uiAudit(page, '#s-game')).forEach((l) => out.push(`${w}x${h} - text - ${l}`));
        if (out.some((l) => l.startsWith(`${w}x${h}`))) await shot(page, shotName, `resize-table-${w}x${h}`);
      }
      diffSig(before, await signature(page)).forEach((d) => out.push('back at 1440x900, the table moved: ' + d));
      return out;
    });
  }
}

const code = await runPlan('test-screen-matrix', reporter, runDevice, SCREENS, 90);
server.close();
process.exit(code);
