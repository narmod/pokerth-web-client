#!/usr/bin/env node
// Ace's Help (L1) in a real browser, on phones and a desktop:
//   · without ?guide=1 nothing shows (L1 is hidden): no Ace, no button;
//   · with it, the Ace offers his help ONCE on first launch (D3), docked at
//     the bottom right, bubble and buttons inside the screen, big enough for a
//     finger; « Yes » turns the help on and he says what he does; « Got it »
//     folds the bubble and he stays; a tap on him opens his menu; the offer
//     never comes back after a reload;
//   · the idle scenes are paused while he is there (D6);
//   · in the lobby he is docked; the moment a hand starts he leaves (D8);
//   · switching the option off in Advanced options sends him away;
//   · with reduced motion there is no Ace, only a plain bubble (D4);
//   · no page error along the way.
// Run: node scripts/test-guide-browser.mjs   (PTH_MOBILE / PTH_DEVICES as the other browser tests)
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, openTable, enterTable, runPlan } from './lib/mobile-harness.mjs';

const MATRIX = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'Galaxy A55 landscape', family: 'android' },
  { name: 'Desktop Chrome', family: 'android' },
];
const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

const DEV = () => { try { localStorage.setItem('pth_guide_dev', '1'); } catch (_e) {} };
const bubble = '#ace-dock .ad-bubble.ad-open';
const text = (page) => page.locator(bubble + ' .ad-text').innerText();
const store = (page) => page.evaluate(() => ({ on: localStorage.getItem('pth_guide_on'), offered: localStorage.getItem('pth_guide_offered'), seen: localStorage.getItem('pth_guide_seen') }));
const box = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight }; }, sel);
const inside = (b, what) => {
  assert.ok(b, what + ': missing');
  assert.ok(b.left >= -0.5 && b.top >= -0.5 && b.right <= b.vw + 0.5 && b.bottom <= b.vh + 0.5, `${what}: outside the screen (${Math.round(b.left)},${Math.round(b.top)} → ${Math.round(b.right)},${Math.round(b.bottom)} in ${b.vw}x${b.vh})`);
};
const click = async (page, sel) => { const l = page.locator(sel).first(); await l.click(); };
// The first-run « local backup » banner (Chromium) — the offer waits for it: close it like a player.
const noBanner = async (page) => { const b = page.locator('#bak-restore-banner button').last(); if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (_e) {} } };
const btn = (id) => `${bubble} [data-ad-btn="${id}"]`;

async function runDevice(browser, name, descriptor) {
  const errors = [];
  const watch = (page) => page.on('pageerror', (e) => errors.push(String(e && e.message || e)));

  // ── hidden without the L1 flag ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
    await page.waitForTimeout(3500);
    await check(`${name}: without ?guide=1 the Ace does not show`, async () => {
      assert.equal(await page.locator('#ace-dock').count(), 0, 'Ace docked');
      assert.equal(await page.locator('.guide-login-btn').isVisible(), false, 'login button visible');
    });
    await ctx.close();
  }

  // ── first launch: the offer ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(DEV);
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
    await check(`${name}: the Ace offers his help on first launch`, async () => {
      await page.locator(bubble).waitFor({ timeout: 9000 });
      assert.match(await text(page), /New here/);
      assert.equal(await page.locator('#ace-dock .ad-ace .mc-pos').count(), 1, 'no Ace drawn');
    });
    await check(`${name}: Ace, bubble and buttons inside the screen, finger-sized`, async () => {
      inside(await box(page, '#ace-dock .ad-ace'), 'Ace');
      inside(await box(page, bubble), 'bubble');
      for (const id of ['offerNo', 'offerYes']) { const b = await box(page, btn(id)); inside(b, id); assert.ok(b.h >= 32, `${id} is ${Math.round(b.h)}px tall`); }
      const ace = await box(page, '#ace-dock .ad-ace'), bub = await box(page, bubble);
      assert.ok(bub.bottom <= ace.top + 1 || bub.right <= ace.left + 1, 'the bubble covers the Ace');
    });
    await check(`${name}: the login button shows with ?guide=1`, async () => {
      assert.equal(await page.locator('.guide-login-btn').isVisible(), true);
    });
    await shot(page, name, 'guide-offer');
    await check(`${name}: scenes paused while he is there (D6)`, async () => {
      assert.equal(await page.evaluate(() => window._guideBusy), true);
    });
    await check(`${name}: « Yes » turns the help on, he explains himself`, async () => {
      await click(page, btn('offerYes'));
      await page.waitForFunction(() => /pop up/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 4000 });
      const s = await store(page);
      assert.equal(s.on, '1'); assert.equal(s.offered, '1');
    });
    await check(`${name}: « Got it » folds the bubble, the Ace stays`, async () => {
      await click(page, btn('gotIt'));
      await page.waitForTimeout(300);
      assert.equal(await page.locator(bubble).count(), 0, 'bubble still open');
      assert.equal(await page.locator('#ace-dock .ad-ace').count(), 1, 'Ace gone');
      assert.match((await store(page)).seen || '', /"welcome"/);
    });
    await check(`${name}: a tap on the Ace opens his menu`, async () => {
      await click(page, '#ace-dock .ad-ace');
      await page.locator(bubble).waitFor({ timeout: 3000 });
      assert.match(await text(page), /is on/);
      assert.equal(await page.locator(btn('resetTips')).count(), 1);
      await click(page, btn('resetTips'));
      await page.waitForFunction(() => /every tip/.test((document.querySelector('#ace-dock .ad-bubble.ad-open .ad-text') || {}).textContent || ''), null, { timeout: 3000 });
      assert.doesNotMatch((await store(page)).seen || '', /"welcome"/);
      await click(page, btn('close'));
    });
    await shot(page, name, 'guide-menu');
    await check(`${name}: the offer never comes back after a reload`, async () => {
      await page.evaluate(() => localStorage.setItem('pth_guide_on', '0'));
      await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
      await page.waitForTimeout(4000);
      assert.equal(await page.locator(bubble).count(), 0);
    });
    await ctx.close();
  }

  // ── lobby → a hand starts: he leaves (D8); option off sends him away ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
    await ctx.addInitScript(() => { try { localStorage.setItem('pth_guide_dev', '1'); if (!sessionStorage.getItem('g1')) { sessionStorage.setItem('g1', '1'); localStorage.setItem('pth_guide_on', '1'); localStorage.setItem('pth_guide_offered', '1'); } } catch (_e) {} });
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'lobby', seats: 6 });
    await check(`${name}: docked in the lobby`, async () => {
      await page.locator('#ace-dock .ad-ace').waitFor({ timeout: 5000 });
      inside(await box(page, '#ace-dock .ad-ace'), 'Ace');
    });
    await check(`${name}: the docked Ace hides no button or link (Create, chat send, status bar…)`, async () => {
      const under = await page.evaluate(() => {
        const a = document.querySelector('#ace-dock .ad-ace').getBoundingClientRect();
        const out = [];
        document.querySelectorAll('button,a[href],input,select,textarea').forEach((el) => {
          if (el.closest('#ace-dock')) return;
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) return;
          const hit = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1));
          if (!hit || !(hit === el || el.contains(hit) || hit.closest('#ace-dock'))) return;   // not visible there anyway
          if (r.left < a.right - 1 && a.left < r.right - 1 && r.top < a.bottom - 1 && a.top < r.bottom - 1) out.push(el.id || el.className || el.tagName);
        });
        return out;
      });
      assert.deepEqual(under, []);
    });
    await shot(page, name, 'guide-lobby');
    await enterTable(page, { seats: 6 });
    await check(`${name}: silent during a hand — he leaves the table (D8)`, async () => {
      await page.waitForFunction(() => !document.getElementById('ace-dock'), null, { timeout: 3000 });
      assert.equal(await page.evaluate(() => window._guideBusy), false);
    });
    await check(`${name}: the option in Advanced options turns him off`, async () => {
      await page.evaluate(() => { window.setAdvOpt('guide_on', false); });
      assert.equal((await store(page)).on, '0');
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
      await page.waitForTimeout(1200);
      assert.equal(await page.locator('#ace-dock').count(), 0, 'Ace still docked with the help off');
    });
    await ctx.close();
  }

  // ── reduced motion: plain bubble, no Ace (D4) ──
  {
    const ctx = await browser.newContext({ ...descriptor, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await ctx.addInitScript(DEV);
    const page = await ctx.newPage(); watch(page);
    await openTable(page, base, { stopAt: 'login' }); await noBanner(page);
    await check(`${name}: reduced motion — a plain bubble, no Ace (D4)`, async () => {
      await page.locator(bubble).waitFor({ timeout: 9000 });
      assert.equal(await page.locator('#ace-dock .mc-pos').count(), 0, 'the Ace is drawn');
      assert.equal(await page.locator('#ace-dock .ad-chip').count(), 1, 'no chip to reopen');
      inside(await box(page, bubble), 'bubble');
      const chip = await box(page, '#ace-dock .ad-ace'), bub = await box(page, bubble);
      assert.ok(bub.bottom <= chip.top + 1 || bub.right <= chip.left + 1, 'the bubble and the chip overlap');
    });
    await shot(page, name, 'guide-plain');
    await ctx.close();
  }

  await check(`${name}: no page error`, async () => {
    assert.deepEqual(errors.filter((e) => !/ResizeObserver loop/.test(e)), []);
  });
}

const code = await runPlan('Ace’s Help (L1)', reporter, runDevice, MATRIX, 15);
server.close();
process.exit(code);
