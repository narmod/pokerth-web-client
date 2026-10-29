#!/usr/bin/env node
// The local backup, end to end in a real Chromium (web.267): a blank browser,
// a folder that holds pokerth-web-backup.json, and the Ace's bubble.
//   · « First time on PokerTH? » → « I already play » → « Already have a
//     backup file of your settings on this computer? » (web.345) → Restore
//     picks the FILE: the settings come back after the reload, and
//     backup.restore / backup.restored are posted to /__guide;
//   · Create on a blank browser writes the file into the picked folder
//     (backup.created);
//   · a picked file that is not a backup: the bubble says why,
//     backup.restore_bad.
// The pickers cannot be driven: window.showOpenFilePicker hands out the file
// and window.showDirectoryPicker a folder of the Origin Private File System
// (real FileSystem*Handles). Cancelling a picker is an AbortError:
// backup.restore_abort.
// Run: node scripts/test-backup-restore-browser.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startServer } from './lib/mobile-harness.mjs';

const { server, base } = await startServer();
const browser = await chromium.launch(process.env.PLAYWRIGHT_BROWSERS_PATH ? {} : { executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0;
async function check(label, fn) {
  try { await fn(); pass++; console.log('  ✓ ' + label); } catch (e) { fail++; console.log('  ✗ ' + label + ' — ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}
const bubble = '#ace-dock .ad-bubble.ad-open';
const btn = (id) => bubble + ' [data-ad-btn="' + id + '"]';
const text = (page) => page.locator(bubble).innerText();

// folder: 'full' (a backup inside), 'empty' (no backup: the picked file is not one), 'cancel' (the pickers are closed)
async function newPage(folder) {
  const ctx = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce', locale: 'fr-FR' });
  const beacons = [];
  await ctx.route('**/__guide', async (route) => {
    try { const b = JSON.parse(route.request().postData() || '{}'); beacons.push(b.ctx + '.' + b.ev); } catch (_e) {}
    await route.fulfill({ status: 204, body: '' });
  });
  await ctx.addInitScript((mode) => {
    try {
      localStorage.setItem('pth_guide_webdriver', '1');      // the Ace and the backup offer as for a player
      localStorage.setItem('pth_lang', 'fr');
    } catch (_e) {}
    window.showDirectoryPicker = async () => {
      if (mode === 'cancel') throw new DOMException('The user aborted a request.', 'AbortError');
      const root = await navigator.storage.getDirectory();
      return root.getDirectoryHandle(mode === 'empty' ? 'empty' : 'pokerth', { create: true });
    };
    window.showOpenFilePicker = async () => {
      if (mode === 'cancel') throw new DOMException('The user aborted a request.', 'AbortError');
      const root = await navigator.storage.getDirectory();
      if (mode === 'empty') {
        const fh = await root.getFileHandle('notes.json', { create: true });
        const w = await fh.createWritable(); await w.write('{"hello":1}'); await w.close();
        return [fh];
      }
      const dir = await root.getDirectoryHandle('pokerth', { create: true });
      return [await dir.getFileHandle('pokerth-web-backup.json')];
    };
  }, folder);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  // the backup file in the « pokerth » folder (OPFS persists for the context)
  if (folder === 'full') {
    await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('pokerth', { create: true });
      const fh = await dir.getFileHandle('pokerth-web-backup.json', { create: true });
      const w = await fh.createWritable();
      await w.write(JSON.stringify({ format: 'pokerth-web-client', kind: 'full-backup', version: 1, app: 'test',
        exportedAt: new Date().toISOString(), keys: { pth_nick: 'Narmod', pth_unauth_nick: 'Narmod', pth_deck: 'big' } }));
      await w.close();
    });
  }
  return { ctx, page, beacons, errors };
}
const firstQuestion = async (page) => {
  await page.locator(bubble).waitFor({ timeout: 12000 });
  assert.match(await text(page), /Première fois sur PokerTH/);
};

// ── a returning player restores his settings ──
{
  const { ctx, page, beacons, errors } = await newPage('full');
  await check('blank browser: « Première fois sur PokerTH ? » first', () => firstQuestion(page));
  await check('« Je connais déjà » → « Tu as déjà un fichier de sauvegarde… ? », Create first', async () => {
    await page.locator(btn('offerNo')).click();
    await page.locator(btn('bakRestore')).waitFor({ timeout: 5000 });
    assert.match(await text(page), /Tu as déjà un fichier de sauvegarde de tes réglages sur cet ordinateur/);
    assert.equal(await page.locator(bubble + ' .ad-primary').getAttribute('data-ad-btn'), 'bakCreate');
  });
  await check('Restore → the picked file → the page reloads with the settings of the backup', async () => {
    await Promise.all([page.waitForEvent('load', { timeout: 15000 }), page.locator(btn('bakRestore')).click()]);
    await page.waitForFunction(() => document.readyState === 'complete');
    assert.equal(await page.evaluate(() => localStorage.getItem('pth_nick')), 'Narmod');
    assert.equal(await page.evaluate(() => localStorage.getItem('pth_deck')), 'big');
  });
  await check('counted: offer.dismissed, backup.returning, backup.restore, backup.restored', async () => {
    await page.waitForTimeout(500);
    for (const e of ['offer.dismissed', 'backup.shown', 'backup.returning', 'backup.restore', 'backup.restored']) assert.ok(beacons.includes(e), e + ' missing: ' + beacons.join(','));
  });
  await check('after the restore: no backup offer again', async () => {
    await page.waitForTimeout(3500);
    assert.equal(await page.locator(bubble + ' .ad-bak-path').count(), 0);
  });
  await check('no page error', async () => assert.deepEqual(errors, []));
  await ctx.close();
}

// ── the picked file is not a backup: the reason, in the bubble and in the counters ──
{
  const { ctx, page, beacons } = await newPage('empty');
  await firstQuestion(page);
  await page.locator(btn('offerNo')).click();
  await page.locator(btn('bakRestore')).waitFor({ timeout: 5000 });
  await check('a file that is not a backup: the error in the bubble, restore_bad', async () => {
    await page.locator(btn('bakRestore')).click();
    await page.locator(bubble + ' .ad-bak-err').waitFor({ timeout: 5000 });
    await page.waitForTimeout(300);
    assert.ok(beacons.includes('backup.restore') && beacons.includes('backup.restore_bad'), beacons.join(','));
  });
  await check('Create in that folder writes the backup file (created)', async () => {
    await page.locator(btn('bakCreate')).click();
    await page.waitForFunction(async () => {
      try { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle('empty'); await d.getFileHandle('pokerth-web-backup.json'); return true; } catch (_e) { return false; }
    }, null, { timeout: 8000, polling: 300 });
    await page.waitForTimeout(300);
    assert.ok(beacons.includes('backup.create') && beacons.includes('backup.created'), beacons.join(','));
  });
  await ctx.close();
}

// ── the picker closed: abort, counted, nothing said ──
{
  const { ctx, page, beacons } = await newPage('cancel');
  await firstQuestion(page);
  await page.locator(btn('offerNo')).click();
  await page.locator(btn('bakRestore')).waitFor({ timeout: 5000 });
  await check('picker closed: restore_abort, the bubble stays without an error', async () => {
    await page.locator(btn('bakRestore')).click();
    await page.waitForTimeout(800);
    assert.equal(await page.locator(bubble + ' .ad-bak-err').count(), 0);
    assert.ok(beacons.includes('backup.restore_abort'), beacons.join(','));
  });
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
