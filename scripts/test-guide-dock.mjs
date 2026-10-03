#!/usr/bin/env node
// Ace's Help (web.274) in a real browser:
//   · one docked Ace only: with a slow engine download, a tip and a « Help »
//     or « What's this? » close together used to draw two Aces;
//   · his menu offers « Install the app » (not in the installed app): the
//     steps for this device, « More about it » opens the help section.
// Run: node scripts/test-guide-dock.mjs
import { chromium, devices } from 'playwright';
import { startServer, openTable } from './lib/mobile-harness.mjs';

const { server, base } = await startServer();
const browser = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const init = () => { try { localStorage.setItem('pth_guide_webdriver', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); } catch (_e) {} };
const docks = (page) => page.evaluate(() => document.querySelectorAll('#ace-dock').length).catch(() => 0);
const errors = [];

for (const poke of ['help', 'ask']) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  await ctx.route('**/modules/mascot/engine.mjs*', async (r) => { await new Promise((res) => setTimeout(res, 3000)); await r.continue(); });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  openTable(page, base, { stopAt: 'login' }).catch(() => {});
  let max = 0;
  for (let t = 0; t < 30; t++) {
    await page.waitForTimeout(300);
    if (t === 8) await page.evaluate((p) => { try { if (p === 'help') window.toggleHelp(); else window.guideAsk(); } catch (e) {} }, poke).catch(() => {});
    max = Math.max(max, await docks(page));
  }
  ok(max === 1, `slow engine + « ${poke} » during the first dock: one Ace (max ${max})`);
  await ctx.close();
}

const bubble = '#ace-dock .ad-bubble.ad-open';
// The tip of the screen first (to its end, as a player), then a tap on the Ace opens his menu.
async function openMenu(page) {
  for (let i = 0; i < 12; i++) {
    if (await page.locator(bubble + ' [data-ad-btn="moreHelp"]').count()) return true;
    const id = await page.evaluate(() => { const b = document.querySelector('#ace-dock .ad-bubble.ad-open [data-ad-btn="gotIt"], #ace-dock .ad-bubble.ad-open [data-ad-btn="next"]'); if (b) { b.click(); return b.getAttribute('data-ad-btn'); } return null; });
    if (!id) await page.evaluate(() => document.querySelector('#ace-dock .ad-ace').click());
    await page.waitForTimeout(600);
  }
  return !!(await page.locator(bubble + ' [data-ad-btn="moreHelp"]').count());
}
for (const [dev, re] of [['iPhone 13', /Share/], ['Pixel 7', /browser menu/], ['Desktop Chrome', /address bar/]]) {
  const ctx = await browser.newContext({ ...devices[dev], serviceWorkers: 'block' });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await openTable(page, base, { stopAt: 'login' });
  await page.waitForSelector('#ace-dock .ad-ace', { state: 'attached', timeout: 9000 });
  await page.waitForTimeout(1200);
  const entry = bubble + ' [data-ad-btn="installApp"]';
  if (!(await openMenu(page) && await page.locator(entry).count())) { ok(false, `${dev}: « Install the app » in his menu`); await ctx.close(); continue; }
  ok(true, `${dev}: « Install the app » in his menu`);
  await page.click(entry);
  await page.waitForTimeout(500);
  const txt = await page.locator(bubble + ' .ad-text').innerText();
  ok(/full screen/.test(txt) && re.test(txt), `${dev}: the steps for this device`);
  await page.click(bubble + ' [data-ad-btn="moreAbout"]');
  await page.waitForTimeout(600);
  const t2 = await page.locator(bubble).innerText();
  const hit = await page.locator(bubble + ' .ad-hsec.ad-hit h3').count() ? await page.locator(bubble + ' .ad-hsec.ad-hit h3').textContent() : '';
  ok(/Install as an app/i.test(t2) && /Install as an app/.test(hit), `${dev}: « More about it » opens the help section (its chapter, at that section)`);
  ok(await docks(page) === 1, `${dev}: still one Ace`);
  await ctx.close();
}
{ // installed app: no entry
  const ctx = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' });
  await ctx.addInitScript(init);
  await ctx.addInitScript(() => { window.pwaInstalled = () => true; Object.defineProperty(window, 'pwaInstalled', { get: () => () => true, set: () => {} }); });
  const page = await ctx.newPage();
  await openTable(page, base, { stopAt: 'login' });
  await page.waitForSelector('#ace-dock .ad-ace', { state: 'attached', timeout: 9000 });
  await page.waitForTimeout(1200);
  ok(await openMenu(page) && await page.locator(bubble + ' [data-ad-btn="installApp"]').count() === 0, 'installed app: no « Install the app »');
  await ctx.close();
}
{ // tips off: « Ace's Help » (header menus, login button) opens his menu with the whole help (web.275)
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('pth_guide_webdriver', '1'); localStorage.setItem('pth_guide_on', '0'); localStorage.setItem('pth_guide_offered', '1'); } catch (_e) {} });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await openTable(page, base, { stopAt: 'login' });
  await page.waitForTimeout(1500);
  ok(await page.locator('.help-menu-btn').count() === 0 && await page.locator('.guide-menu-btn').count() === 5, 'no « Help » entry in the header menus, « Ace\'s Help » in all 5');
  await page.locator('.guide-login-btn').click();
  await page.waitForSelector(bubble + ' [data-ad-btn="moreHelp"]', { timeout: 6000 });
  const ids = await page.evaluate(() => [...document.querySelectorAll('#ace-dock .ad-bubble.ad-open [data-ad-btn]')].map((b) => b.getAttribute('data-ad-btn')));
  ok(ids.includes('turnOn') && ids.includes('askMenu') && !ids.includes('turnOff') && !ids.includes('resetTips'), 'tips off: his menu — More help, What\'s this?, Turn on tips (' + ids.join(',') + ')');
  ok(/tips are off/.test(await page.locator(bubble + ' .ad-text').innerText()), 'tips off: he says his tips are off but he still answers');
  await page.click(bubble + ' [data-ad-btn="moreHelp"]');
  await page.waitForTimeout(600);
  ok(await page.locator(bubble + ' [data-ad-btn^="ch:"], ' + bubble + ' [data-ad-btn^="sec:"], ' + bubble + ' input').count() > 0, 'tips off: « More help » opens the help in his bubble');
  ok(await page.evaluate(() => localStorage.getItem('pth_guide_on')) !== '1', 'tips stay off');
  // audit web.276: « Close » of his menu with the tips off — he goes, the idle scenes are free again
  await page.evaluate(() => window.guideToggle());
  await page.waitForSelector(bubble + ' [data-ad-btn="close"]', { timeout: 4000 });
  await page.click(bubble + ' [data-ad-btn="close"]');
  await page.waitForTimeout(700);
  ok(await docks(page) === 0 && await page.evaluate(() => window._guideBusy) === false, 'tips off: « Close » of his menu — he goes, scenes no longer blocked');
  // « ? » mode, then his menu over it: the mode ends (no tap left intercepted)
  await page.evaluate(() => window.guideAsk());
  await page.waitForFunction(() => document.body.classList.contains('guide-ask'), null, { timeout: 4000 });
  await page.evaluate(() => window.guideToggle());
  await page.waitForSelector(bubble + ' [data-ad-btn="moreHelp"]', { timeout: 4000 });
  ok(!(await page.evaluate(() => document.body.classList.contains('guide-ask'))), '« ? » mode ends when his menu replaces it');
  await page.click(bubble + ' [data-ad-btn="close"]');
  await page.waitForTimeout(600);
  // « ? » on an element drawn by script with a hand cursor only: explained, not run
  await page.evaluate(() => {
    const d = document.createElement('div'); d.id = 'tst-hand'; d.textContent = 'Shuffle deck';
    d.style.cssText = 'position:fixed;left:20px;top:200px;width:140px;height:40px;cursor:pointer;background:#ddd;z-index:5000';
    d.addEventListener('click', () => { window.__tstRan = (window.__tstRan || 0) + 1; });
    document.body.appendChild(d);
  });
  await page.evaluate(() => window.guideAsk());
  await page.waitForFunction(() => document.body.classList.contains('guide-ask'), null, { timeout: 4000 });
  await page.waitForTimeout(300);
  await page.click('#tst-hand');
  await page.waitForTimeout(400);
  const ran = await page.evaluate(() => window.__tstRan || 0);
  const said = await page.locator(bubble + ' .ad-text').innerText().catch(() => '');
  ok(ran === 0 && /Shuffle deck/.test(said), '« ? » explains a hand-cursor element instead of running it (' + ran + ', ' + said.slice(0, 50) + ')');
  await ctx.close();
}
ok(!errors.length, 'no page error' + (errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''));
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
