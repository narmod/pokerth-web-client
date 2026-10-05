#!/usr/bin/env node
// Ace's Help (web.313): the very first bubble after a page load is wholly in
// the player's language — its buttons used to be built before the language
// catalogue had loaded, so a French menu showed « More help » / « Close ».
// Tips off and on, a slow catalogue download included.
// Run: node scripts/test-guide-lang-first.mjs
import { chromium, devices } from 'playwright';
import { startServer, openTable } from './lib/mobile-harness.mjs';

const { server, base } = await startServer();
const browser = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const B = '#ace-dock .ad-bubble.ad-open';

for (const [on, slow] of [['0', false], ['0', true], ['1', false]]) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block', locale: 'fr-FR' });
  if (slow) await ctx.route('**/modules/guide/lang/fr.mjs*', async (r) => { await new Promise((res) => setTimeout(res, 2500)); await r.continue(); });
  await ctx.addInitScript((v) => { try { localStorage.setItem('pth_guide_webdriver', '1'); localStorage.setItem('pth_guide_on', v); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'fr'); } catch (_e) {} }, on);
  const page = await ctx.newPage();
  await openTable(page, base, { stopAt: 'login' });
  if (on === '0') {
    // tips off: the « Ace's Help » button of the login screen calls him with his menu (the player's report)
    await page.waitForSelector('.guide-login-btn', { state: 'visible', timeout: 12000 });
    await page.click('.guide-login-btn');
    await page.waitForSelector(B + ' .ad-btn', { timeout: 12000 });
  } else await page.waitForSelector('#ace-dock .ad-ace', { state: 'attached', timeout: 12000 });
  // his menu: the tip of the screen (tips on) first, then a tap on him
  let btns = await page.evaluate((b) => [...document.querySelectorAll(b + ' .ad-btn')].map((x) => ({ id: x.getAttribute('data-ad-btn'), t: x.textContent.trim() })), B);
  for (let i = 0; i < 14 && !btns.some((b) => b.id === 'moreHelp'); i++) {
    const id = await page.evaluate(() => { const b = document.querySelector('#ace-dock .ad-bubble.ad-open [data-ad-btn="gotIt"], #ace-dock .ad-bubble.ad-open [data-ad-btn="next"]'); if (b) { b.click(); return 1; } return 0; });
    if (!id) await page.evaluate(() => document.querySelector('#ace-dock .ad-ace').click());
    await page.waitForTimeout(500);
    btns = await page.evaluate((b) => [...document.querySelectorAll(b + ' .ad-btn')].map((x) => ({ id: x.getAttribute('data-ad-btn'), t: x.textContent.trim() })), B);
  }
  const more = btns.find((b) => b.id === 'moreHelp'), close = btns.find((b) => b.id === 'close');
  const txt = await page.locator(B + ' .ad-text').innerText().catch(() => '');
  ok(more && /aide/i.test(more.t) && close && close.t === 'Fermer' && !/More help|Close/.test(btns.map((b) => b.t).join('|')) && /[éè’]/.test(txt),
    `tips ${on === '1' ? 'on' : 'off'}${slow ? ', slow catalogue' : ''}: the first menu is in French, buttons included (${btns.map((b) => b.t).join(' · ')})`);
  await ctx.close();
}
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
