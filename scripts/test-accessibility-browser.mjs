#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = join(process.cwd(), 'public');
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const relative = pathname === '/' ? 'pokerth-client.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !statSync(file).isFile()) throw new Error('not found');
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    response.end(readFileSync(file));
  } catch (_error) {
    response.writeHead(404);
    response.end('not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, serviceWorkers: 'block' });
const page = await context.newPage();
page.on('dialog', (dialog) => dialog.dismiss());

let passed = 0;
async function check(name, action) {
  await action();
  console.log('ok  -', name);
  passed++;
}

async function chooseInterfaceSize(page, surface, value) {
  await page.locator(`#accessibility-open-${surface}`).click();
  await page.locator(`input[name="interface-size"][value="${value}"]`).check();
  await page.keyboard.press('Escape');
}

async function visibleMetrics(page, selectors) {
  return page.evaluate((entries) => Object.fromEntries(entries.map((selector) => {
    const element = document.querySelector(selector);
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return [selector, {
      fontSize: parseFloat(style.fontSize),
      width: rect.width,
      height: rect.height,
      visible: rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth,
    }];
  })), selectors);
}

function assertScaled(actual, baseline, multiplier, label) {
  assert.ok(actual >= baseline * (multiplier - 0.05), `${label}: expected ${multiplier}x ${baseline}, got ${actual}`);
}

function assertExactScaled(actual, baseline, multiplier, label) {
  assert.ok(Math.abs(actual - baseline * multiplier) <= 0.05,
    `${label}: expected exactly ${multiplier}x ${baseline}, got ${actual}`);
}

async function assertTextFits(page, selector, label) {
  const fits = await page.locator(selector).first().evaluate((element) =>
    element.scrollWidth <= element.clientWidth + 1 && element.scrollHeight <= element.clientHeight + 1);
  assert.equal(fits, true, `${label} is clipped`);
}

async function assertEnhancedTargets(page, selectors, label) {
  for (const selector of selectors) {
    const target = page.locator(selector).first();
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44,
      `${label} ${selector} is ${box ? `${box.width}x${box.height}` : 'not rendered'}`);
  }
}

async function assertKeyboardFocusVisible(page, selectors, label) {
  for (const selector of selectors) {
    const target = page.locator(selector).first();
    await target.scrollIntoViewIfNeeded();
    await page.keyboard.press('Tab');
    await target.focus();
    const focus = await target.evaluate((element) => {
      const style = getComputedStyle(element);
      return { active: document.activeElement === element, width: parseFloat(style.outlineWidth), style: style.outlineStyle };
    });
    assert.ok(focus.active && focus.width >= 2 && focus.style !== 'none', `${label} ${selector} has no visible focus outline`);
  }
}

console.log('test-accessibility-browser');
try {
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.applyAccessibilityPreferences === 'function' && typeof window.exportWebBackup === 'function');

  await check('the pre-login entry point discovers and opens the accessibility panel', async () => {
    await page.locator('#accessibility-open-connect').click();
    await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
  });
  await check('keyboard focus stays in the modal and returns to its invoker', async () => {
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.value), 'standard');
    await page.locator('#accessibility-reset').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'accessibility-close');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'accessibility-reset');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#accessibility-modal').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.id), 'accessibility-open-connect');
  });
  await check('the lobby Accessibility entry is visibly operable', async () => {
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const entry = page.locator('#accessibility-open-lobby');
    assert.equal(await entry.isVisible(), true);
    assert.equal(await entry.isEnabled(), true);
    await entry.click();
    await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
    await page.keyboard.press('Escape');
  });
  await check('the game Accessibility entry is visibly operable', async () => {
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-game'));
    await page.locator('#s-game.active').waitFor();
    const entry = page.locator('#accessibility-open-game');
    assert.equal(await entry.isVisible(), true);
    assert.equal(await entry.isEnabled(), true);
    await entry.click();
    await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
  });
  await check('interface size and high contrast apply live', async () => {
    await page.locator('input[name="interface-size"][value="large"]').check();
    await page.locator('#accessibility-high-contrast').check();
    assert.equal(await page.locator('html').getAttribute('data-interface-size'), 'large');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
  });
  await check('valid preferences survive a real page reload', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.interfaceSize === 'large');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
  });

  const downloadPromise = page.waitForEvent('download');
  await page.evaluate(() => window.exportWebBackup());
  const download = await downloadPromise;
  const backupPath = await download.path();
  const backup = JSON.parse(readFileSync(backupPath, 'utf8'));
  await check('the real full-backup export carries accessibility preferences', async () => {
    assert.equal(backup.keys.pth_interface_size, 'large');
    assert.equal(backup.keys.pth_high_contrast, '1');
  });

  await page.evaluate(() => {
    localStorage.removeItem('pth_interface_size');
    localStorage.removeItem('pth_high_contrast');
  });
  const chooserPromise = page.waitForEvent('filechooser');
  await page.evaluate(() => window.importWebBackupPick());
  const chooser = await chooserPromise;
  await chooser.setFiles(backupPath);
  await page.waitForFunction(() => localStorage.getItem('pth_interface_size') === 'large' && localStorage.getItem('pth_high_contrast') === '1');
  await check('the real full-backup import restores and reapplies preferences', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.interfaceSize === 'large');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
  });

  await page.evaluate(() => {
    localStorage.setItem('pth_interface_size', 'giant');
    localStorage.setItem('pth_high_contrast', '1');
    localStorage.setItem('pth_browser_zoom', 'broken');
  });
  await check('malformed properties recover independently after reload', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.interfaceSize === 'standard');
    assert.equal(await page.locator('html').getAttribute('data-high-contrast'), 'true');
    assert.equal(await page.locator('#accessibility-browser-zoom').isChecked(), false);
  });
  await check('desktop login remains readable and operable at every Interface size', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const selectors = ['#login-step1 .login-lead', '.login-card .lc-t', '.login-card .lc-d', '.login-card .lc-ic'];
    const samples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'connect', value);
      samples[value] = await visibleMetrics(page, selectors);
      for (const selector of selectors) {
        assert.equal(samples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        assertScaled(samples[value][selector].fontSize, samples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${value} login overflows horizontally`);
      await page.locator('.login-card').first().click();
      await page.locator('#nick').fill('OutcomeTester');
      assert.equal(await page.locator('#nick').isVisible(), true);
      assert.equal(await page.locator('.btn-primary[data-i18n="connect"]').isVisible(), true);
      await page.locator('.login-back').click();
    }
  });
  await check('desktop lobby remains readable and operable at every Interface size', async () => {
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const selectors = ['#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create', '#accessibility-open-lobby svg'];
    const samples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'lobby', value);
      samples[value] = await visibleMetrics(page, selectors);
      for (const selector of selectors.slice(0, 3)) {
        assert.equal(samples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        assertScaled(samples[value][selector].fontSize, samples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
      }
      assertScaled(samples[value][selectors[3]].width, samples.standard[selectors[3]].width, multiplier, `${value} lobby Accessibility icon`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${value} lobby overflows horizontally`);
      await page.locator('#g-filter-select').selectOption('1');
      assert.equal(await page.locator('#g-filter-select').inputValue(), '1');
      await page.locator('#chat-in').fill(`Lobby chat ${value}`);
      await page.locator('.lobby-footbar .lfb-create').click();
      await page.locator('#s-create.active #create-form').waitFor();
      await page.locator('#cf-name').fill(`Outcome ${value}`);
      assert.equal(await page.locator('#cf-name').inputValue(), `Outcome ${value}`);
      await page.locator('#s-create .cp-back').click();
      await page.locator('#s-lobby.active').waitFor();
    }
  });
  await check('mobile login and lobby remain usable at Extra Large', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
    await page.locator('#s-connect.active').waitFor();
    await chooseInterfaceSize(page, 'connect', 'standard');
    const standardLogin = await visibleMetrics(page, ['.login-card .lc-t', '.login-card .lc-d', '.login-card .lc-ic']);
    await chooseInterfaceSize(page, 'connect', 'extra-large');
    const extraLargeLogin = await visibleMetrics(page, ['.login-card .lc-t', '.login-card .lc-d', '.login-card .lc-ic']);
    for (const selector of Object.keys(standardLogin)) {
      assertScaled(extraLargeLogin[selector].fontSize, standardLogin[selector].fontSize, 2, `mobile Extra Large ${selector}`);
      await assertTextFits(page, selector, `mobile Extra Large ${selector}`);
    }
    assert.ok(await page.locator('#s-connect').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), 'mobile Extra Large login overflows horizontally');
    await page.locator('.login-card').first().click();
    await page.locator('#nick').fill('MobileOutcome');
    await page.locator('.btn-primary[data-i18n="connect"]').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.btn-primary[data-i18n="connect"]').isVisible(), true);
    await page.locator('.login-back').click();

    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const standardLobby = await chooseInterfaceSize(page, 'lobby', 'standard').then(() =>
      visibleMetrics(page, ['#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create']));
    await chooseInterfaceSize(page, 'lobby', 'extra-large');
    const extraLargeLobby = await visibleMetrics(page, ['#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create']);
    for (const selector of Object.keys(standardLobby)) {
      assertScaled(extraLargeLobby[selector].fontSize, standardLobby[selector].fontSize, 2, `mobile Extra Large ${selector}`);
    }
    await assertTextFits(page, '.lobby-footbar .lfb-create', 'mobile Extra Large Create Table action');
    const lobbyOverflow = await page.locator('#s-lobby').evaluate((screen) => ({
      clientWidth: screen.clientWidth,
      scrollWidth: screen.scrollWidth,
      offenders: [...screen.querySelectorAll('*')].filter((element) => {
        const rect = element.getBoundingClientRect();
        return getComputedStyle(element).display !== 'none' && rect.right > screen.clientWidth + 1;
      }).slice(0, 8).map((element) => `${element.tagName.toLowerCase()}#${element.id}.${element.className}`),
    }));
    assert.ok(lobbyOverflow.scrollWidth <= lobbyOverflow.clientWidth + 1, `mobile Extra Large lobby overflows horizontally: ${JSON.stringify(lobbyOverflow)}`);
    await page.locator('#g-filter-select').selectOption('2');
    await page.locator('#chat-in').fill('Mobile lobby chat');
    await page.locator('.lobby-footbar .lfb-create').click();
    await page.locator('#s-create.active #create-form').waitFor();
    await page.locator('#cf-name').fill('Mobile Outcome');
    await page.locator('#s-create .cp-back').click();
    await page.locator('#s-lobby.active').waitFor();
  });
  await check('principal login and lobby targets are enhanced in Large and Extra Large', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const value of ['large', 'extra-large']) {
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
      await page.locator('#s-connect.active').waitFor();
      await chooseInterfaceSize(page, 'connect', value);
      await assertEnhancedTargets(page, ['#accessibility-open-connect', '.login-card'], `${value} login`);
      await page.locator('.login-card').first().click();
      await assertEnhancedTargets(page, ['.login-back', '#av-trigger', '#nick', '.btn-primary[data-i18n="connect"]'], `${value} login form`);

      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
      await page.locator('#s-lobby.active').waitFor();
      await assertEnhancedTargets(page, ['#live-leave-anchor', '#accessibility-open-lobby', '#l-overflow-btn', '#g-filter-select', '#l-chat-emoji-toggle', '#lobby-chat-panel .chat-send', '.lobby-footbar .lfb-create'], `${value} lobby`);
      await page.locator('.lobby-footbar .lfb-create').click();
      await page.locator('#s-create.active #create-form').waitFor();
      await assertEnhancedTargets(page, ['#s-create .cp-back', '#cf-name', '.cf-create-btn'], `${value} Create Table`);
    }
  });
  await check('short mobile landscape keeps principal login and lobby header targets enhanced', async () => {
    await page.setViewportSize({ width: 844, height: 390 });
    for (const value of ['large', 'extra-large']) {
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
      await page.locator('#s-connect.active').waitFor();
      await chooseInterfaceSize(page, 'connect', value);
      await assertEnhancedTargets(page, ['#cl-links-connect > summary', '#accessibility-open-connect', '#connect-overflow-btn'], `${value} short-landscape login header`);
      await page.locator('#accessibility-open-connect').click();
      await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
      await page.keyboard.press('Escape');

      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
      await page.locator('#s-lobby.active').waitFor();
      await assertEnhancedTargets(page, ['#live-leave-anchor', '#accessibility-open-lobby', '#l-overflow-btn'], `${value} short-landscape lobby header`);
      await page.locator('#accessibility-open-lobby').click();
      await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
      await page.keyboard.press('Escape');
    }
  });
  await check('visible login branding and lobby headings follow the exact Interface size multiplier', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const loginSelectors = ['.card-chip', '.card-suits-row', '.card-subtitle', '.login-card .lc-go'];
    const loginSamples = {};
    const backSamples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
      await page.locator('#s-connect.active').waitFor();
      await chooseInterfaceSize(page, 'connect', value);
      loginSamples[value] = await visibleMetrics(page, loginSelectors);
      for (const selector of loginSelectors) {
        assert.equal(loginSamples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        if (selector === '.card-chip') {
          assertExactScaled(loginSamples[value][selector].width, loginSamples.standard[selector].width, multiplier, `${value} login branding width`);
          assertExactScaled(loginSamples[value][selector].height, loginSamples.standard[selector].height, multiplier, `${value} login branding height`);
        } else {
          assertExactScaled(loginSamples[value][selector].fontSize, loginSamples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
          if (selector !== '.login-card .lc-go') await assertTextFits(page, selector, `${value} ${selector}`);
        }
      }
      await page.locator('.login-card').first().click();
      backSamples[value] = await visibleMetrics(page, ['.login-back .lb-chev']);
      assert.equal(backSamples[value]['.login-back .lb-chev'].visible, true, `${value} login chevron is outside the viewport`);
      assertExactScaled(backSamples[value]['.login-back .lb-chev'].fontSize, backSamples.standard['.login-back .lb-chev'].fontSize, multiplier, `${value} login chevron`);
      await page.locator('#nick').fill(`Scale ${value}`);
      await page.locator('.login-back').click();
      assert.ok(await page.locator('#s-connect').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), `${value} login branding overflows horizontally`);
    }

    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    const headingSelectors = [
      '#s-lobby .games-col > .g-chat-panel-header > span:first-child',
      '#lobby-chat-panel > .g-chat-panel-header > span:first-child',
      '#lobby-gameinfo > .g-chat-panel-header > span:first-child',
    ];
    const headingSamples = {};
    for (const [value, multiplier] of [['standard', 1], ['large', 1.5], ['extra-large', 2]]) {
      await chooseInterfaceSize(page, 'lobby', value);
      headingSamples[value] = await visibleMetrics(page, headingSelectors);
      for (const selector of headingSelectors) {
        assert.equal(headingSamples[value][selector].visible, true, `${value} ${selector} is outside the viewport`);
        assertExactScaled(headingSamples[value][selector].fontSize, headingSamples.standard[selector].fontSize, multiplier, `${value} ${selector}`);
        await assertTextFits(page, selector, `${value} ${selector}`);
      }
      await page.locator('#g-filter-select').selectOption('1');
      await page.locator('#chat-in').fill(`Scale ${value}`);
      assert.ok(await page.locator('#s-lobby').evaluate((screen) => screen.scrollWidth <= screen.clientWidth + 1), `${value} lobby headings overflow horizontally`);
    }
  });
  await check('keyboard focus remains visible throughout login and lobby controls', async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-connect'));
    await page.locator('#s-connect.active').waitFor();
    await chooseInterfaceSize(page, 'connect', 'standard');
    await assertKeyboardFocusVisible(page, ['#accessibility-open-connect', '.login-card'], 'login');
    await page.locator('.login-card').first().click();
    await assertKeyboardFocusVisible(page, ['.login-back', '#nick', '.btn-primary[data-i18n="connect"]'], 'login form');

    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    await assertKeyboardFocusVisible(page, ['#accessibility-open-lobby', '#g-filter-select', '#chat-in', '.lobby-footbar .lfb-create'], 'lobby');
    await page.locator('.lobby-footbar .lfb-create').click();
    await page.locator('#s-create.active #create-form').waitFor();
    await assertKeyboardFocusVisible(page, ['#s-create .cp-back', '#cf-name', '.cf-create-btn'], 'Create Table');
  });
  await check('Standard remains operable in a 200% browser-zoom layout with chat visible', async () => {
    await page.setViewportSize({ width: 640, height: 450 });
    await page.evaluate(async () => (await import('/modules/net/session.mjs')).show('s-lobby'));
    await page.locator('#s-lobby.active').waitFor();
    await chooseInterfaceSize(page, 'lobby', 'standard');
    const chat = page.locator('#lobby-chat-panel');
    const create = page.locator('.lobby-footbar .lfb-create');
    assert.equal(await chat.isVisible(), true, 'lobby chat must remain visible before opening Create Table');
    assert.equal(await create.isVisible(), true, 'Create Table must remain reachable at 200% browser zoom');
    const pointerOutcome = await create.evaluate((button) => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        receivesPointer: hit === button || button.contains(hit),
        hit: hit ? `${hit.tagName.toLowerCase()}#${hit.id}.${hit.className}` : 'none',
        buttonRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        hitRect: hit ? (() => { const value = hit.getBoundingClientRect(); return { left: value.left, top: value.top, width: value.width, height: value.height }; })() : null,
      };
    });
    assert.equal(pointerOutcome.receivesPointer, true, `another lobby surface intercepts Create Table: ${JSON.stringify(pointerOutcome)}`);
    await create.click();
    await page.locator('#s-create.active #create-form').waitFor();
    await page.locator('#cf-name').fill('Zoom Outcome');
    assert.equal(await page.locator('#cf-name').inputValue(), 'Zoom Outcome');
  });
  console.log(`PASS ${passed}/${passed}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
