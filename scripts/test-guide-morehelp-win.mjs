#!/usr/bin/env node
// « More help » as a window (web.310), in a real browser:
//   · desktop: the panel moves by its title line and resizes from an edge and
//     a corner, stays inside the screen, keeps its box after a chapter change
//     and after closing / reopening, and the header's reset forgets it;
//   · a chapter change updates the panel in place, without a new entrance (web.311);
//   · phone: no handles, the panel stays docked next to the Ace; command lists fit it (web.312).
// Run: node scripts/test-guide-morehelp-win.mjs
import { chromium, devices } from 'playwright';
import { startServer, openTable } from './lib/mobile-harness.mjs';

const { server, base } = await startServer();
const browser = await chromium.launch();
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const init = () => { try { localStorage.setItem('pth_guide_webdriver', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); } catch (_e) {} };
const B = '#ace-dock .ad-bubble.ad-open';
const errors = [];

async function openMore(page) {
  for (let i = 0; i < 12; i++) {
    if (await page.locator(B + ' [data-ad-btn="moreHelp"]').count()) break;
    const id = await page.evaluate(() => { const b = document.querySelector('#ace-dock .ad-bubble.ad-open [data-ad-btn="gotIt"], #ace-dock .ad-bubble.ad-open [data-ad-btn="next"]'); if (b) { b.click(); return 1; } return 0; });
    if (!id) await page.evaluate(() => document.querySelector('#ace-dock .ad-ace').click());
    await page.waitForTimeout(600);
  }
  await page.click(B + ' [data-ad-btn="moreHelp"]');
  await page.waitForSelector(B + '.ad-big .ad-hnav', { timeout: 6000 });
  await page.waitForTimeout(450);
}
const box = (page) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }, B);
async function drag(page, sel, dx, dy) {
  const r = await page.locator(sel).first().boundingBox();
  const x = r.x + Math.min(r.width / 2, 40), y = r.y + r.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 }); await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up(); await page.waitForTimeout(150);
}

{ // desktop
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await openTable(page, base, { stopAt: 'login' });
  await page.waitForSelector('#ace-dock .ad-ace', { state: 'attached', timeout: 9000 });
  await page.waitForTimeout(1200);
  await openMore(page);
  ok(await page.locator(B + '.ad-float').count() === 1 && await page.locator(B + ' .win-rsz').count() === 8, 'desktop: « More help » is a window (8 resize handles)');
  const b0 = await box(page);
  await drag(page, B + ' .ad-kicker', -300, -60);
  const b1 = await box(page);
  ok(Math.abs(b1.l - (b0.l - 300)) <= 3 && Math.abs(b1.t - (b0.t - 60)) <= 3 && b1.w === b0.w, `moved by its title line (${b0.l},${b0.t} → ${b1.l},${b1.t})`);
  await drag(page, B + ' .win-rsz-e', -200, 0);
  const b2 = await box(page);
  ok(Math.abs(b2.w - (b1.w - 200)) <= 3 && b2.l === b1.l, `resized from its right edge (${b1.w} → ${b2.w})`);
  await drag(page, B + ' .win-rsz-nw', 0, 150);   // top-left: the backup banner of the test page sits at the bottom
  const b3 = await box(page);
  ok(Math.abs(b3.h - (b2.h - 150)) <= 3 && Math.abs(b3.t - (b2.t + 150)) <= 3, `resized from a corner (${b2.h} → ${b3.h})`);
  await drag(page, B + ' .win-rsz-e', -2000, 0);
  ok((await box(page)).w >= 420, 'never narrower than its minimum');
  await drag(page, B + ' .ad-kicker', -3000, -3000);
  const b4 = await box(page);
  ok(b4.l >= 6 && b4.t >= 6, `kept inside the screen (${b4.l},${b4.t})`);
  await page.evaluate((b) => { window.__mhNav = document.querySelector(b + ' .ad-hnav'); window.__mhAnims = 0; const el = document.querySelector(b); const o = el.animate.bind(el); el.animate = (...x) => { window.__mhAnims++; return o(...x); }; }, B);
  await page.click(B + ' .ad-hcat:nth-child(3)');
  await page.waitForTimeout(450);
  ok(await page.evaluate((b) => document.querySelector(b + ' .ad-hnav') === window.__mhNav && window.__mhAnims === 0 && /ad-on/.test(document.querySelector(b + ' .ad-hcat:nth-child(3)').className), B),
    'a chapter change updates the panel in place (no close / reopen flicker)');
  const b5 = await box(page);
  ok(b5.l === b4.l && b5.t === b4.t && b5.w === b4.w && b5.h === b4.h, 'a chapter change keeps the box');
  const tail = await page.evaluate((s) => getComputedStyle(document.querySelector(s), '::after').display, B);
  ok(tail === 'none', 'no speech tail on the window');
  await page.click(B + ' [data-ad-btn="close"]');
  await page.waitForTimeout(400);
  await openMore(page);
  const b6 = await box(page);
  ok(b6.l === b4.l && b6.t === b4.t && b6.w === b4.w, 'reopened where it was left');
  ok(await page.evaluate(() => !!localStorage.getItem('pth_win_morehelp')), 'its box is kept (pth_win_morehelp)');
  await page.evaluate(() => window.resetWindows ? window.resetWindows() : window.pthAceResetWin());
  await page.waitForTimeout(300);
  const b7 = await box(page);
  ok((b7.l !== b4.l || b7.t !== b4.t) && !(await page.evaluate(() => localStorage.getItem('pth_win_morehelp'))), `reset windows: back next to the Ace (${b7.l},${b7.t})`);
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.waitForTimeout(400);
  const b8 = await box(page);
  ok(b8.l >= 0 && b8.t >= 0 && b8.l + b8.w <= 1000 && b8.t + b8.h <= 700, 'a smaller browser window keeps it on screen');
  await ctx.close();
}
{ // phone
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await openTable(page, base, { stopAt: 'login' });
  await page.waitForSelector('#ace-dock .ad-ace', { state: 'attached', timeout: 9000 });
  await page.waitForTimeout(1200);
  await openMore(page);
  ok(await page.locator(B + '.ad-float').count() === 0 && await page.locator(B + ' .win-rsz:visible').count() === 0, 'phone: docked panel, no handles');
  // a long command (« /carddbg · /msglog · … ») used to widen the key column and push the descriptions off the panel (web.312)
  await page.click(B + ' [data-ad-btn="ch:chat"]');
  await page.waitForTimeout(400);
  const ov = await page.evaluate((b) => { const h = document.querySelector(b + ' .ad-hbody'); return [h.scrollWidth, h.clientWidth, [...h.querySelectorAll('.ad-keys span')].every((x) => x.getBoundingClientRect().width > 80)]; }, B);
  ok(ov[0] <= ov[1] + 1 && ov[2], `phone: the command lists fit the panel (${ov[0]} ≤ ${ov[1]}), every description readable`);
  await ctx.close();
}
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
