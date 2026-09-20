#!/usr/bin/env node
// PWA / service worker in real browser engines (the other mobile tests run
// with service workers blocked). What a player relies on without knowing it:
//
//   1 · the service worker installs, activates, and controls the next load;
//   2 · the precache is COMPLETE in a real browser: every entry of ASSETS in
//       sw.js is in the cache (a 404 there is silent: the app simply breaks
//       offline one day), and the cache carries the current CACHE_VERSION;
//   3 · OFFLINE BOOT: network cut, reload - the app starts from the cache with
//       no JavaScript error, reaches the login screen, and a training table
//       against the bots can be opened and played (no server needed);
//   4 · UPDATE BANNER: the deploy stamp served by /__ver changes -> the "new
//       version" banner appears, translated, inside the screen, and can be
//       dismissed; it does not come back for the same version;
//   5 · the web app manifest is valid: name, start_url, display, and every icon
//       it lists really exists with the announced size.
//
// Run:  node scripts/test-pwa-browser.mjs           (npm run test:pwa-browser)
// Env:  PTH_MOBILE / PTH_DEVICES / PTH_ENGINE / PTH_SHOTS (see the harness).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, createReporter, shot, runPlan } from './lib/mobile-harness.mjs';

const PHONES = [
  { name: 'iPhone 15', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
];
const { server, state, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

const swSource = readFileSync(join(process.cwd(), 'public', 'sw.js'), 'utf8');
const CACHE_VERSION = (swSource.match(/const CACHE_VERSION = '([^']+)'/) || [])[1];
const BUILD = (readFileSync(join(process.cwd(), 'public', 'pokerth.js'), 'utf8').match(/window\.BUILD_VERSION='([^']+)'/) || [])[1];

// App booted AND the boot splash gone (it fades out over the login screen).
const appReady = (page) => page.waitForFunction(() => { if (!(document.readyState === 'complete' && window.App
  && typeof window.App.connect === 'function' && document.querySelector('#s-connect .btn-primary'))) return false;
  const b = document.getElementById('boot-splash'); if (!b) return true; const c = getComputedStyle(b);
  return c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) < 0.02; }, null, { timeout: 25000 });

async function runDevice(browser, name, descriptor) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'allow' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  try {
    state.ver = 1000;
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await appReady(page);
    const supported = await page.evaluate(() => 'serviceWorker' in navigator);
    if (!supported) { reporter.pass('service workers are not available in this engine build - skipped'); return; }

    await check('service worker installs, activates and controls the next load', async () => {
      const st = await page.evaluate(async () => { const reg = await navigator.serviceWorker.ready; return { scope: reg.scope, active: !!reg.active, state: reg.active && reg.active.state }; });
      assert.ok(st.active, 'no active service worker');
      await page.waitForFunction(async () => { const r = await navigator.serviceWorker.getRegistration(); return r && r.active && r.active.state === 'activated'; }, null, { timeout: 30000 });
      await page.reload({ waitUntil: 'domcontentloaded' }); await appReady(page);
      assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true, 'the reloaded page is not controlled by the service worker');
    });

    await check(`precache is complete and carries ${CACHE_VERSION}`, async () => {
      assert.equal(CACHE_VERSION, 'pokerth-v' + BUILD, `sw.js (${CACHE_VERSION}) and pokerth.js (${BUILD}) disagree`);
      const res = await page.evaluate(async (version) => {
        const src = await (await fetch('/sw.js', { cache: 'no-store' })).text();
        const block = src.slice(src.indexOf('const ASSETS = ['), src.indexOf('];', src.indexOf('const ASSETS = [')));
        const assets = [...block.matchAll(/^\s*'([^']+)'/gm)].map((m) => m[1]);
        const names = await caches.keys();
        if (!names.includes(version)) return { names, assets: assets.length, missing: ['<cache ' + version + ' does not exist>'] };
        const cache = await caches.open(version);
        const missing = [];
        for (const a of assets) { const hit = await cache.match(a, { ignoreSearch: true }); if (!hit || !hit.ok) missing.push(a); }
        return { names, assets: assets.length, missing };
      }, CACHE_VERSION);
      assert.ok(res.assets > 50, `only ${res.assets} precache entries were read from sw.js`);
      assert.deepEqual(res.missing, [], `${res.missing.length} of ${res.assets} precache entries are not in the cache`);
      assert.deepEqual(res.names.filter((n) => /^pokerth-v/.test(n) && n !== CACHE_VERSION), [], 'an old cache was not dropped');
    });

    await check('OFFLINE: origin unreachable - the app still boots, entirely from the cache', async () => {
      await page.waitForTimeout(1500);           // let the background revalidations of the previous load finish
      state.down = true; await context.setOffline(true);
      const before = state.hits.length, errBefore = errors.length;
      await page.reload({ waitUntil: 'domcontentloaded' }); await appReady(page);
      await page.waitForTimeout(800);
      assert.equal(state.hits.length, before, 'the server answered although it is down: ' + state.hits.slice(before, before + 5).join(' '));
      assert.deepEqual(errors.slice(errBefore), [], 'JavaScript error while booting offline');
      const ui = await page.evaluate(() => ({ cards: document.querySelectorAll('#s-connect .login-card').length, css: getComputedStyle(document.body).fontFamily.length > 0 && document.styleSheets.length > 0,
        lang: typeof window.t === 'function' && window.t('connect') !== 'connect' }));
      assert.ok(ui.cards >= 3 && ui.css && ui.lang, `login screen incomplete offline: ${JSON.stringify(ui)}`);
      await shot(page, name, 'pwa-1-offline-login');
    });

    await check('OFFLINE: a training table against the bots opens and deals a hand', async () => {
      const errBefore = errors.length;
      const later = page.locator('#bak-restore-banner button').last();
      if (await later.count()) { try { await later.tap({ timeout: 1500 }); } catch (_e) {} }
      await page.locator('.login-card').nth(1).click();
      await page.locator('#nick').fill('OfflineTester');
      await page.locator('#s-connect .btn-primary').first().click();
      await page.locator('#s-create.active, #s-lobby.active').first().waitFor({ timeout: 10000 });
      await page.evaluate(() => window.App.createGame());
      await page.locator('#s-game.active').waitFor({ timeout: 10000 });
      await page.waitForFunction(() => document.querySelectorAll('#g-seats .seat').length >= 2 && document.querySelectorAll('#g-seats .seat.me .pk[data-c]').length === 2, null, { timeout: 15000 });
      await shot(page, name, 'pwa-2-offline-table');
      assert.deepEqual(errors.slice(errBefore), [], 'JavaScript error while playing offline');
      const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.offsetParent !== null).map((i) => i.getAttribute('src')).slice(0, 5));
      assert.deepEqual(broken, [], 'images missing offline (not precached, never seen online): ' + broken.join(' '));
    });

    await check('UPDATE: a new deploy stamp shows the banner, inside the screen, dismissible', async () => {
      state.down = false; await context.setOffline(false);
      await page.goto(base, { waitUntil: 'domcontentloaded' }); await appReady(page);
      await page.waitForTimeout(600);
      assert.equal(await page.locator('#update-banner').count(), 0, 'the banner is shown although nothing changed');
      state.ver = 2000;                                            // a deploy happened
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));   // the app re-checks /__ver on focus
      await page.locator('#update-banner').waitFor({ timeout: 8000 });
      await page.waitForTimeout(450);                              // its 300 ms fade-in
      await shot(page, name, 'pwa-3-update-banner');
      const b = await page.evaluate(() => { const e = document.getElementById('update-banner'), r = e.getBoundingClientRect(); const btn = e.querySelector('button');
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, vw: innerWidth, vh: innerHeight, text: e.textContent.trim(), btnH: btn.getBoundingClientRect().height, onTop: !!top && e.contains(top) }; });
      assert.ok(b.onTop, 'the banner is hidden under another element');
      assert.ok(b.bottom - b.top <= 3.2 * b.btnH, `the banner text is squeezed onto too many lines (${Math.round(b.bottom - b.top)}px high for a ${Math.round(b.btnH)}px button)`);
      assert.ok(b.left >= -1 && b.right <= b.vw + 1 && b.top >= -1 && b.bottom <= b.vh + 1, `banner leaves the screen: ${JSON.stringify(b)}`);
      assert.ok(b.text.length > 8 && !/updateAvailable|updateNow/.test(b.text), `banner text is not translated: "${b.text}"`);
      await page.locator('#update-banner button').last().tap();   // the dismiss cross
      await page.waitForTimeout(300);
      assert.equal(await page.locator('#update-banner').count(), 0, 'the banner cannot be dismissed');
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      await page.waitForTimeout(1200);
      assert.equal(await page.locator('#update-banner').count(), 0, 'the banner comes back for the version that was just dismissed');
    });

    await check('manifest: valid, every icon exists with the announced size', async () => {
      const res = await page.evaluate(async () => {
        const link = document.querySelector('link[rel="manifest"]'); if (!link) return { error: 'no <link rel="manifest">' };
        const m = await (await fetch(link.href, { cache: 'no-store' })).json();
        const icons = [];
        for (const ic of m.icons || []) {
          const url = new URL(ic.src, link.href).href;
          const size = await new Promise((resolve) => { const im = new Image(); im.onload = () => resolve(im.naturalWidth + 'x' + im.naturalHeight); im.onerror = () => resolve('missing'); im.src = url; });
          icons.push({ src: ic.src, announced: ic.sizes, real: size, purpose: ic.purpose || '' });
        }
        return { name: m.name, short: m.short_name, start: m.start_url, display: m.display, theme: m.theme_color, bg: m.background_color, icons };
      });
      assert.ok(!res.error, res.error);
      assert.ok(res.name && res.short && res.start && res.theme && res.bg, `manifest fields missing: ${JSON.stringify({ ...res, icons: undefined })}`);
      assert.ok(['standalone', 'fullscreen', 'minimal-ui'].includes(res.display), `display is "${res.display}"`);
      assert.ok(res.icons.some((i) => /192x192/.test(i.announced)) && res.icons.some((i) => /512x512/.test(i.announced)), 'the 192 and 512 px icons required for installation are not both listed');
      res.icons.forEach((i) => { assert.notEqual(i.real, 'missing', `icon ${i.src} does not load`);
        if (/^\d+x\d+$/.test(i.announced) && !/\.svg$/.test(i.src)) assert.equal(i.real, i.announced, `icon ${i.src} is ${i.real}, announced ${i.announced}`); });
    });

    await check('no JavaScript error during the whole run', async () => assert.equal(errors.length, 0, errors.join(' | ')));
  } catch (error) { reporter.fail('run aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'pwa-aborted'); }
  finally { state.down = false; await context.setOffline(false).catch(() => {}); await context.close(); }
}

const code = await runPlan('test-pwa-browser', reporter, runDevice, PHONES);
server.close();
process.exit(code);
