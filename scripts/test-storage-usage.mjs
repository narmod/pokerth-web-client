#!/usr/bin/env node
// Storage on this device (modules/ui/storage-usage.mjs, web.29): Advanced
// options › Reset & backup shows what the web client keeps in this browser,
// its largest entries grouped, whether saving works, and the other data —
// to check a device where trophies and settings are not kept.
import { chromium } from 'playwright';
import { startServer } from './lib/mobile-harness.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };

console.log('test-storage-usage');
// ── Pure helpers ─────────────────────────────────────────────────
const U = await import('../public/modules/ui/storage-usage.mjs');
ok(U.fmtBytes(512) === '512 B' && U.fmtBytes(1500) === '1.5 KB' && U.fmtBytes(42000) === '42 KB' && U.fmtBytes(2300000) === '2.3 MB', 'fmtBytes(): B, KB, MB');
ok(U.group('pth_av_9f2c3a1b77e0') === 'pth_av_*' && U.group('pth_game_best_house') === 'pth_game_best_*' && U.group('pth_ach_unlocked') === 'pth_ach_unlocked'
  && U.group('pth_hand_0123456789abcdef') === 'pth_hand_*', 'group(): entries that differ only by an id are one line');
function mem(full) {
  const m = new Map();
  return { get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null, getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (full) throw new Error('QuotaExceededError'); m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m };
}
const s = mem(false);
s.setItem('pth_av_aaaaaaaa1', 'x'.repeat(1000)); s.setItem('pth_av_bbbbbbbb2', 'x'.repeat(1000)); s.setItem('pth_lang', 'fr'); s.setItem('other', 'y'.repeat(5000));
const u = U.localUsage(s);
ok(u.total === 2 * (2 * (16 + 1000) + 8 + 2) && u.items[0].key === 'pth_av_*' && u.items[0].n === 2 && u.items.length === 2, 'localUsage(): the pth_* entries only, 2 bytes a character, largest group first');
const f = mem(true); f._m.set('pth_lang', 'fr');
ok(U.canSave(s) && !s.getItem('pth__probe') && !U.canSave(f), 'canSave(): written, read back and removed; false when the storage refuses');

// ── In the page ──────────────────────────────────────────────────
const { server, base } = await startServer();
const b = await chromium.launch();
const errors = [];
async function look(full) {
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block', isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('x')) return; sessionStorage.setItem('x', '1');
    localStorage.clear(); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_lang', 'fr'); localStorage.setItem('pth_bak_auto', '0');
    localStorage.setItem('pth_av_0123456789ab', 'x'.repeat(40000));
  });
  if (full) await ctx.addInitScript(() => {
    const o = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === 'pth__probe') throw new DOMException('full', 'QuotaExceededError'); return o.call(this, k, v); };
  });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await pg.goto(base);
  await pg.waitForSelector('.login-card');
  await sleep(800);
  await pg.evaluate(() => { window.openAdvancedOptions(); window.advSelectCat('reset'); });
  await sleep(300);
  await pg.evaluate(() => document.getElementById('adv-storage').scrollIntoView());
  await pg.waitForFunction(() => document.getElementById('adv-storage').textContent.length > 10, null, { timeout: 5000 }).catch(() => {});
  const r = await pg.evaluate(() => {
    const el = document.getElementById('adv-storage');
    return { text: el.textContent, ok: !!el.querySelector('.adv-store-st.ok'), ko: !!el.querySelector('.adv-store-st.ko'),
      first: (el.querySelector('.adv-store-list li') || {}).textContent || '', sec: document.querySelector('[data-i18n="advStorageSec"]').textContent,
      fits: el.scrollWidth <= el.clientWidth + 1 };
  });
  await ctx.close();
  return r;
}
const a = await look(false);
ok(a.sec === 'Stockage sur cet appareil' && a.ok && /Réglages et progression : \d/.test(a.text) && /pth_av_\*.*80 KB/.test(a.first) && a.fits,
  'Reset & backup › Storage on this device: saving works, the size, the largest group first (' + a.first + ')');
const k = await look(true);
ok(k.ko && /échoue/.test(k.text), 'a storage that refuses: « Saving fails » in red');
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
