#!/usr/bin/env node
// Operator messages on phones: the broadcast toast (gold), the restart notice
// (red) and the four notice windows (welcome, guest, account, LAN). They are
// written by an operator, so their length is unknown - and whatever the length,
// the player must be able to READ them and CLOSE them.
//
// Each one is shown with a short, a long (500 characters = the admin limit for a
// broadcast) and, for the windows, a very long text (2 500 characters), on
// portrait and landscape phones, twice: flat, and with the iPhone safe areas
// (status bar / Dynamic Island 59px, home indicator 34px - emulated through the
// --pth-sat / --pth-sab custom properties, Playwright has no notch).
//   · the whole notice is inside the usable screen: below the status bar, above
//     the home indicator, not wider than the screen;
//   · its close control is fully visible, is the top element at its centre
//     (nothing covers it), is at least 32px in both directions, and closes it;
//   · two notices at once (restart + broadcast) do not cover each other's
//     close control;
//   · a window keeps its button on screen however long the text is (the text
//     scrolls, not the window).
//
// Run:  node scripts/test-notices-browser.mjs      (npm run test:notices-browser)
import assert from 'node:assert/strict';
import { startServer, createReporter, shot, openTable, runPlan } from './lib/mobile-harness.mjs';

const PHONES = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },
  { name: 'iPhone 15', family: 'ios' },
  { name: 'iPhone 15 landscape', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
];
const { server, base } = await startServer();
const reporter = createReporter();
const check = reporter.check;

const WORDS = 'The server will be updated tonight. Tables in progress finish normally, new tables are paused for a few minutes. Thank you for your patience - see the forum for details: https://www.pokerth.net/forum ';
const text = (n) => { let s = ''; while (s.length < n) s += WORDS; return s.slice(0, n).trim(); };

// Inspect a notice: its box, its close control, what is on top of that control.
const inspect = (page, sel, closeSel) => page.evaluate(({ sel, closeSel }) => {
  const el = document.querySelector(sel); if (!el) return null;
  const st = getComputedStyle(document.documentElement);
  const sat = parseFloat(st.getPropertyValue('--pth-sat')) || 0, sab = parseFloat(st.getPropertyValue('--pth-sab')) || 0;
  const box = (closeSel === ':card' ? el.firstElementChild : el).getBoundingClientRect();
  const btn = closeSel === ':card' ? el.querySelector('button') : el.querySelector(closeSel);
  const b = btn ? btn.getBoundingClientRect() : null;
  const top = b ? document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) : null;
  return { vw: innerWidth, vh: innerHeight, sat, sab, box: { left: box.left, top: box.top, right: box.right, bottom: box.bottom },
    btn: b ? { left: b.left, top: b.top, right: b.right, bottom: b.bottom, w: b.width, h: b.height } : null, onTop: !!btn && !!top && (btn === top || btn.contains(top)) };
}, { sel, closeSel });
function verify(i, what) {
  assert.ok(i, `${what}: not shown`);
  assert.ok(i.box.top >= i.sat - 0.5, `${what}: starts at ${Math.round(i.box.top)}px, under the status bar (${i.sat}px)`);
  assert.ok(i.box.bottom <= i.vh - i.sab + 0.5, `${what}: ends at ${Math.round(i.box.bottom)}px, the usable screen ends at ${i.vh - i.sab}px`);
  assert.ok(i.box.left >= -0.5 && i.box.right <= i.vw + 0.5, `${what}: wider than the screen`);
  assert.ok(i.btn, `${what}: no close control`);
  assert.ok(i.btn.top >= i.sat - 0.5 && i.btn.bottom <= i.vh - i.sab + 0.5 && i.btn.left >= 0 && i.btn.right <= i.vw + 0.5, `${what}: close control outside the usable screen (${Math.round(i.btn.top)}..${Math.round(i.btn.bottom)})`);
  assert.ok(i.btn.w >= 32 && i.btn.h >= 32, `${what}: close control is ${Math.round(i.btn.w)}x${Math.round(i.btn.h)}px (32px needed for a finger)`);
  assert.ok(i.onTop, `${what}: something covers the close control`);
}
const gone = async (page, sel) => { await page.waitForTimeout(150); assert.equal(await page.locator(sel).count(), 0, `${sel} is still there after closing`); };

async function runDevice(browser, name, descriptor) {
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  try {
    await openTable(page, base, { seats: 6, board: 'flop', turn: 'me' });
    for (const notch of [false, true]) {
      const tag = notch ? 'iPhone safe areas' : 'flat';
      await page.evaluate((on) => { const r = document.documentElement.style; if (on) { r.setProperty('--pth-sat', '59px'); r.setProperty('--pth-sab', '34px'); } else { r.removeProperty('--pth-sat'); r.removeProperty('--pth-sab'); } }, notch);

      for (const [label, len] of [['short', 60], ['long', 500]]) {
        await check(`broadcast, ${label} text, ${tag}: readable and closable`, async () => {
          await page.evaluate((m) => window.showInfoToast(m, '\u{1F4E2}', Date.now() + 600000), text(len));
          await page.waitForTimeout(250);
          if (label === 'long') await shot(page, name, `notice-broadcast-${notch ? 'notch' : 'flat'}`);
          verify(await inspect(page, '#srv-info-toast', 'button'), 'broadcast');
          await page.locator('#srv-info-toast button').tap(); await gone(page, '#srv-info-toast');
        });
      }
      await check(`restart notice + broadcast together, ${tag}: both closable`, async () => {
        await page.evaluate((m) => { window.showRestartNotice(Date.now() + 900000, 'update', m); window.showInfoToast(m, '\u{1F4E2}'); }, text(160));
        await page.waitForTimeout(250);
        await shot(page, name, `notice-stacked-${notch ? 'notch' : 'flat'}`);
        const a = await inspect(page, '#srv-restart-notice', 'button'), b = await inspect(page, '#srv-info-toast', 'button');
        verify(a, 'restart notice'); verify(b, 'broadcast under a restart notice');
        assert.ok(b.box.top >= a.box.bottom - 1 || b.box.bottom <= a.box.top + 1, `the two notices overlap (${Math.round(a.box.top)}..${Math.round(a.box.bottom)} / ${Math.round(b.box.top)}..${Math.round(b.box.bottom)})`);
        await page.locator('#srv-info-toast button').tap(); await gone(page, '#srv-info-toast');
        await page.locator('#srv-restart-notice button').tap(); await gone(page, '#srv-restart-notice');
      });
      for (const [fn, sel] of [['showWelcomeModal', '#welcome-modal'], ['showGuestNoticeModal', '#guestnotice-modal'], ['showAuthNoticeModal', '#authnotice-modal'], ['showLanNoticeModal', '#lannotice-modal']]) {
        await check(`${fn.replace(/^show|Modal$/g, '')} window, very long text, ${tag}: the button stays on screen`, async () => {
          const id = await page.evaluate(({ fn, body }) => { const before = new Set([...document.body.children]); window[fn]('Maintenance tonight', body, 1); const el = [...document.body.children].find((c) => !before.has(c)); return el ? el.id : null; }, { fn, body: text(2500) });
          assert.ok(id, `${fn} showed nothing`);
          await page.waitForTimeout(250);
          if (fn === 'showWelcomeModal') await shot(page, name, `notice-window-${notch ? 'notch' : 'flat'}`);
          verify(await inspect(page, '#' + id, ':card'), fn);
          await page.locator('#' + id + ' button').last().tap(); await gone(page, '#' + id);
          await page.evaluate(() => { try { ['pth_welcome_seen', 'pth_guestnotice_seen', 'pth_authnotice_seen', 'pth_lannotice_seen'].forEach((k) => localStorage.removeItem(k)); } catch (_e) {} });
        });
      }
    }
    await check('no JavaScript error during the whole run', async () => assert.equal(errors.length, 0, errors.join(' | ')));
  } catch (error) { reporter.fail('run aborted', String(error && error.message || error).split('\n')[0]); await shot(page, name, 'notices-aborted'); }
  finally { await context.close(); }
}

const code = await runPlan('test-notices-browser', reporter, runDevice, PHONES, 15);
server.close();
process.exit(code);
