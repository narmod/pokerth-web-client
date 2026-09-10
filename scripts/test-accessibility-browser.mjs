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

console.log('test-accessibility-browser');
try {
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.applyAccessibilityPreferences === 'function' && typeof window.exportWebBackup === 'function');

  await check('the pre-login entry point discovers and opens the accessibility panel', async () => {
    await page.locator('#accessibility-open-connect').click();
    await page.locator('#accessibility-modal[aria-hidden="false"]').waitFor();
  });
  await check('pre-login, lobby, and game headers expose the same entry point', async () => {
    assert.equal(await page.locator('.accessibility-entry').count(), 3);
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
    await page.locator('#accessibility-open-connect').click();
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
  console.log(`PASS ${passed}/${passed}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
