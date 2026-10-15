#!/usr/bin/env node
// Real-browser test of public/modules/ui/remote.mjs — the TV-remote (Android
// TV) adapter of ui/ctl-nav.mjs. Chromium, remote forced on (pth_remote_on);
// the table comes from the fixture socket of scripts/lib/mobile-harness.mjs
// (my turn, flop). App action entry points are wrapped to record calls.
//   · game mode: arrows ring the action bar (Check/Call first), OK presses
//     the ringed button, colour keys act, held OK opens the menu
//   · Play/Pause switches to navigation, Escape comes back
//   · a new turn puts the ring back on Check/Call
//   · keyAction / isTV mapping (keyCodes of Android TV remotes)
// Run: node scripts/test-remote-browser.mjs
import { chromium } from 'playwright';
import { startServer, openTable, turnTo } from './lib/mobile-harness.mjs';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

const { server, base } = await startServer();
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await context.addInitScript(() => { try { localStorage.setItem('pth_remote_on', '1'); } catch (e) {} });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const ids = await openTable(page, base, { seats: 4, board: 'flop', turn: 'me' });

await page.evaluate(() => {
  window.__calls = [];
  const rec = (name) => function () { window.__calls.push([name].concat([].slice.call(arguments))); };
  window.App.doAction = rec('doAction');
  window.App.doRaise = rec('doRaise');
  window.App.confirmCall = rec('confirmCall');
});
const calls = () => page.evaluate(() => window.__calls.splice(0));
const key = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(120); };
const ring = () => page.evaluate(() => { const r = document.querySelector('.pad-cur'); return r ? r.className.replace('pad-cur', '').trim() + (r.id ? '#' + r.id : '') : null; });

// Pure mapping first.
const map = await page.evaluate(() => {
  const R = window.RemoteNav;
  const a = (o) => R.keyAction(o);
  return {
    dpad: [a({ key: 'Unidentified', keyCode: 19 }), a({ key: 'Unidentified', keyCode: 22 }), a({ key: 'Unidentified', keyCode: 23 })].join(','),
    back: [a({ key: 'GoBack' }), a({ key: 'Escape' }), a({ keyCode: 4 })].join(','),
    color: [a({ keyCode: 403 }), a({ keyCode: 404 }), a({ keyCode: 405 }), a({ keyCode: 406 })].join(','),
    media: [a({ key: 'MediaPlayPause' }), a({ key: 'ContextMenu' })].join(','),
    none: a({ key: 'a' }),
    tv: [R.isTV('Mozilla/5.0 (Linux; Android 12; BRAVIA 4K VH2 Build/STT1.211025.001) Chrome/120', false),
         R.isTV('Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/120 Mobile', false),
         R.isTV('Mozilla/5.0 (X11; Linux x86_64) Chrome/120', true)].join(',')
  };
});
ok(map.dpad === 'up,right,ok', 'D-pad keyCodes 19/22/23 ' + map.dpad);
ok(map.back === 'back,back,back', 'Back: GoBack, Escape, keyCode 4');
ok(map.color === 'fold,call,raise,allin', 'colour keys 403–406 ' + map.color);
ok(map.media === 'toggle,menu' && map.none === null, 'Play/Pause = toggle, Menu = menu, letters ignored');
ok(map.tv === 'true,false,true', 'TV detection: Android TV UA yes, phone no, no-pointer screen yes ' + map.tv);

// ── Game mode: ring on the action bar ──
await key('ArrowLeft');
ok(await page.evaluate(() => document.body.classList.contains('has-remote') && document.body.classList.contains('pad-active')), 'first key marks the remote as active');
let r = await ring();
ok(/btn-(check|call)/.test(r || ''), 'first arrow shows the ring on Check/Call (' + r + ')');
ok((await calls()).length === 0, 'that first press does nothing else');
await key('ArrowLeft');
r = await ring();
ok(/btn-fold/.test(r || ''), '← moves to Fold (' + r + ')');
await key('Enter');
let c = await calls();
ok(c.length === 1 && c[0][0] === 'doAction' && c[0][1] === 1, 'OK presses Fold ' + JSON.stringify(c));
await key('ArrowRight'); await key('ArrowRight');
r = await ring();
ok(/btn-raise/.test(r || ''), '→ → reaches Raise (' + r + ')');
await key('ArrowUp');
r = await ring();
ok(r && !/btn-raise/.test(r), '↑ leaves the button row (' + r + ')');
// Colour keys.
await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ColorF0Red', keyCode: 403, bubbles: true })));
await page.waitForTimeout(100);
c = await calls();
ok(c.some((x) => x[0] === 'doAction' && x[1] === 1), 'red = Fold ' + JSON.stringify(c));
await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ColorF2Yellow', keyCode: 405, bubbles: true })));
await page.waitForTimeout(100);
c = await calls();
ok(c.some((x) => x[0] === 'doRaise'), 'yellow = Raise ' + JSON.stringify(c));

// Held OK = menu.
await page.keyboard.down('Enter');
await page.waitForTimeout(750);
await page.keyboard.up('Enter');
await page.waitForTimeout(150);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('ctl-menu')).display !== 'none'), 'OK held 0.6 s opens the menu');
ok((await calls()).length === 0, 'and presses nothing');
const tiles = await page.evaluate(() => [...document.querySelectorAll('#ctl-menu .ctl-tile')].map((b) => b.dataset.act).slice(0, 3).join(','));
ok(tiles === 'resume,mode,chat', 'menu starts with Resume, the mode switch, Chat (' + tiles + ')');
await key('Escape');
ok(await page.evaluate(() => getComputedStyle(document.getElementById('ctl-menu')).display === 'none'), 'Back closes the menu');

// ── Play/Pause: navigation ──
await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'MediaPlayPause', keyCode: 179, bubbles: true })));   // Playwright has no media keys
await page.waitForTimeout(120);
ok(await page.evaluate(() => window.CtlNav.effective().mode === 'nav'), '⏯ switches to navigation');
await key('ArrowUp'); await key('ArrowUp');
r = await page.evaluate(() => { const x = document.querySelector('.pad-cur'); return x ? !document.getElementById('g-actions').contains(x) : false; });
ok(r, 'arrows now move the ring out of the action bar');
ok(await page.evaluate(() => window.CtlNav.backFallback() && window.CtlNav.effective().mode === 'game'), 'Android Back (history step) returns to game when nothing is open');

// ── New turn: ring back on Check/Call ──
await turnTo(page, ids[1]);
await page.waitForTimeout(150);
await turnTo(page, 42);
await page.waitForTimeout(400);
r = await ring();
ok(/btn-(check|call)/.test(r || ''), 'my turn: the ring waits on Check/Call (' + r + ')');
await calls();

// Option off: arrows are the page's again.
await page.evaluate(() => { localStorage.setItem('pth_remote_on', '0'); document.activeElement && document.activeElement.blur(); });   // no focused button: Enter would click it natively
await key('Enter');
ok((await calls()).length === 0, 'remote_on = 0: OK ignored by the remote');

ok(errors.length === 0, 'no page errors ' + JSON.stringify(errors.slice(0, 3)));
await browser.close();
server.close();
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
