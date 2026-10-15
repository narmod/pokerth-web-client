#!/usr/bin/env node
// Real-browser test of public/modules/ui/gamepad.mjs (Chromium, desktop).
// A fake standard-mapping pad replaces navigator.getGamepads; the table comes
// from the fixture socket of scripts/lib/mobile-harness.mjs (my turn, flop).
// The App action entry points are wrapped to record calls without sending,
// so the action bar stays up between checks.
//   · table mode: A = Check/Call, X = Fold, Y tap = Raise, Y held = All-In,
//     RT raises the amount, RB = 1/3, D-pad → = playing mode, glyphs shown
//   · navigation: Start opens the settings, the ring moves inside them, A
//     toggles a checkbox, RB switches category, B closes; table buttons dead
//     while a surface is open; D-pad ↑ browses the table and X does not fold
// Run: node scripts/test-gamepad-browser.mjs
import { chromium } from 'playwright';
import { startServer, openTable } from './lib/mobile-harness.mjs';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label); }
}

const { server, base } = await startServer();
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.addInitScript(() => {
  const pad = {
    id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)',
    index: 0, connected: true, mapping: 'standard', timestamp: 0,
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })),
    axes: [0, 0, 0, 0]
  };
  window.__pad = pad;
  window.__padOn = false;
  Object.defineProperty(Navigator.prototype, 'getGamepads', {
    configurable: true, value: () => (window.__padOn ? [pad, null, null, null] : [null, null, null, null])
  });
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await openTable(page, base, { seats: 4, board: 'flop', turn: 'me' });

await page.evaluate(() => {
  window.__calls = [];
  const rec = (name) => function () { window.__calls.push([name].concat([].slice.call(arguments))); };
  window.App.doAction = rec('doAction');
  window.App.doRaise = rec('doRaise');
  window.App.confirmCall = rec('confirmCall');
  const real = window.App.setPlayingMode;
  window.App.setPlayingMode = function (i) { window.__calls.push(['mode', i]); };
  window.__realMode = real;
  window.__padOn = true;
  const e = new Event('gamepadconnected');
  e.gamepad = window.__pad;
  window.dispatchEvent(e);
});

const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SELECT: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const set = (b, on) => page.evaluate(([b, on]) => { const x = window.__pad.buttons[b]; x.pressed = on; x.value = on ? 1 : 0; }, [b, on]);
async function press(b, ms = 90) { await set(b, true); await page.waitForTimeout(ms); await set(b, false); await page.waitForTimeout(120); }
const calls = () => page.evaluate(() => window.__calls.splice(0));

ok(await page.evaluate(() => document.body.classList.contains('has-gamepad')), 'connect: body.has-gamepad');

// ── Table mode ──
await press(B.X);
let c = await calls();
ok(c.some((x) => x[0] === 'doAction' && x[1] === 1), 'X folds (doAction 1)');
ok(await page.evaluate(() => document.body.classList.contains('pad-active')), 'pad input marks body.pad-active');
const glyph = await page.evaluate(() => {
  const g = (sel) => { const el = document.querySelector('#g-actions ' + sel); return el ? getComputedStyle(el, '::before').content : null; };
  return { fold: g('.btn-fold'), call: g('.btn-call, .btn-check'), raise: g('.btn-raise'), allin: g('.btn-allin') };
});
ok(glyph.fold === '"X"' && glyph.call === '"A"' && glyph.raise === '"Y"' && (glyph.allin === 'none' || glyph.allin === 'normal'), 'Xbox glyphs on the action buttons, none on the narrow All-In ' + JSON.stringify(glyph));

await press(B.A);
c = await calls();
ok(c.length === 1 && /doAction|confirmCall/.test(c[0][0]), 'A checks/calls ' + JSON.stringify(c));

const amt0 = await page.evaluate(() => +document.getElementById('raise-slider').value);
await set(B.RT, true); await page.waitForTimeout(900); await set(B.RT, false); await page.waitForTimeout(100);
const amt1 = await page.evaluate(() => ({ s: +document.getElementById('raise-slider').value, a: +document.getElementById('raise-amt').value }));
ok(amt1.s > amt0 && amt1.a > amt0, `RT raises the amount (slider ${amt0} → ${amt1.s}, field rounded to ${amt1.a})`);
await set(B.LT, true); await page.waitForTimeout(500); await set(B.LT, false); await page.waitForTimeout(100);
const amt2 = await page.evaluate(() => +document.getElementById('raise-slider').value);
ok(amt2 < amt1.s, `LT lowers it (${amt1.s} → ${amt2})`);

await press(B.RB);
const pct = await page.evaluate(() => +document.getElementById('raise-amt').value);
ok(pct > 0, 'RB applies the first quick bet (' + pct + ')');
await calls();

await press(B.Y, 120);
c = await calls();
ok(c.length === 1 && c[0][0] === 'doRaise', 'Y tap raises ' + JSON.stringify(c));

await set(B.Y, true);
await page.waitForTimeout(250);
ok(await page.evaluate(() => !!document.querySelector('#g-actions .btn-allin .pad-hold-fill')), 'holding Y shows the All-In gauge');
ok((await calls()).length === 0, 'nothing fires before the hold time');
await page.waitForTimeout(550);
c = await calls();
await set(B.Y, false); await page.waitForTimeout(120);
c = c.concat(await calls());
ok(c.length === 1 && c[0][0] === 'doAction' && c[0][1] === 6, 'Y held 0.8 s goes All-In once ' + JSON.stringify(c));
ok(await page.evaluate(() => !document.querySelector('.pad-hold-fill')), 'gauge removed');

await press(B.RIGHT);
c = await calls();
ok(c.some((x) => x[0] === 'mode' && x[1] === 1), 'D-pad → = next playing mode ' + JSON.stringify(c));

// ── Navigation in the settings ──
await press(B.START);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('adv-modal')).display !== 'none'), 'Start opens the settings');
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'nav'), 'settings open → navigation mode');
await press(B.X);
ok((await calls()).length === 0, 'X does nothing while a window is open');
await press(B.DOWN);
const r1 = await page.evaluate(() => { const r = document.querySelector('.pad-cur'); return r ? { inModal: document.getElementById('adv-modal').contains(r), txt: (r.textContent || r.id || r.tagName).trim().slice(0, 40) } : null; });
ok(r1 && r1.inModal, 'first press shows the ring inside the settings ' + JSON.stringify(r1));
await press(B.DOWN); await press(B.DOWN);
const r2 = await page.evaluate(() => { const r = document.querySelector('.pad-cur'); return r ? (r.textContent || r.id || r.tagName).trim().slice(0, 40) : null; });
ok(r2 && r2 !== r1.txt, 'D-pad ↓ moves the ring (' + r1.txt + ' → ' + r2 + ')');

const cat0 = await page.evaluate(() => document.querySelector('#adv-modal .adv-cat[aria-selected="true"]').dataset.cat);
await press(B.RB);
const cat1 = await page.evaluate(() => document.querySelector('#adv-modal .adv-cat[aria-selected="true"]').dataset.cat);
ok(cat0 !== cat1, `RB switches category (${cat0} → ${cat1})`);
await press(B.LB);
const cat2 = await page.evaluate(() => document.querySelector('#adv-modal .adv-cat[aria-selected="true"]').dataset.cat);
ok(cat2 === cat0, 'LB goes back (' + cat2 + ')');

// Walk down to a checkbox row and toggle it with A.
let toggled = null;
for (let i = 0; i < 25 && !toggled; i++) {
  const info = await page.evaluate(() => { const r = document.querySelector('.pad-cur'); if (!r) return null; const cb = r.querySelector && r.querySelector('input[type=checkbox]'); return cb ? { id: cb.id, on: cb.checked } : null; });
  if (info) {
    await press(B.A);
    const now = await page.evaluate((id) => document.getElementById(id).checked, info.id);
    toggled = { id: info.id, before: info.on, after: now };
    await press(B.A);   // restore
  } else await press(B.DOWN);
}
ok(toggled && toggled.before !== toggled.after, 'A toggles a checkbox row ' + JSON.stringify(toggled));

await press(B.B);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('adv-modal')).display === 'none'), 'B closes the settings');
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'table'), 'back to table mode');
ok(await page.evaluate(() => !document.querySelector('.pad-cur')), 'ring cleared at the table');

// ── Browse the table ──
await press(B.UP);
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'nav' && !!document.querySelector('#s-game .pad-cur')), 'D-pad ↑ browses the table');
await press(B.X);
ok((await calls()).length === 0, 'X does not fold while browsing');
await press(B.B);
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'table' && !document.querySelector('.pad-cur')), 'B returns to the table buttons');

// ── Mouse takes over ──
await press(B.UP);
await page.mouse.click(5, 5);
await page.waitForTimeout(100);
ok(await page.evaluate(() => !document.body.classList.contains('pad-active') && !document.querySelector('.pad-cur')), 'a mouse click hides glyphs and ring');

// ── Option off ──
await page.evaluate(() => { localStorage.setItem('pth_pad_on', '0'); });
await press(B.X);
ok((await calls()).length === 0, 'pad_on = 0: buttons ignored');
await page.evaluate(() => { localStorage.removeItem('pth_pad_on'); });

// ── Lobby: reach a table row, A selects it, A again joins ──
const lobby = await context.newPage();
lobby.on('pageerror', (e) => errors.push(String(e)));
await openTable(lobby, base, { seats: 4, spectator: true, stopAt: 'lobby' });   // not seated: Join offered
await lobby.evaluate(() => {
  window.__joins = 0;
  window.App.joinSelectedGame = function () { window.__joins++; };
  window.__padOn = true;
  const e = new Event('gamepadconnected');
  e.gamepad = window.__pad;
  window.dispatchEvent(e);
});
const lset = (b, on) => lobby.evaluate(([b, on]) => { const x = window.__pad.buttons[b]; x.pressed = on; x.value = on ? 1 : 0; }, [b, on]);
async function lpress(b) { await lset(b, true); await lobby.waitForTimeout(90); await lset(b, false); await lobby.waitForTimeout(120); }
ok(await lobby.evaluate(() => window.PadNav.currentMode().mode === 'nav'), 'lobby: navigation mode');
let onRow = false;
// Down out of the header, then right across the player-list column.
for (let i = 0; i < 16; i++) {
  if (await lobby.evaluate(() => !!document.querySelector('.game-row.pad-cur'))) { onRow = true; break; }
  const y = await lobby.evaluate(() => { const r = document.querySelector('.pad-cur'); return r ? r.getBoundingClientRect().top : -1; });
  await lpress(y < 110 ? B.DOWN : B.RIGHT);
}
const path = await lobby.evaluate(() => { const r = document.querySelector('.pad-cur'); return r ? r.className + ' ' + (r.id || '') : 'none'; });
ok(onRow, 'lobby: the D-pad reaches a table row (' + path + ')');
if (onRow) {
  await lpress(B.A);
  ok(await lobby.evaluate(() => !!document.querySelector('.game-row.sel')), 'lobby: A selects the table');
  await lpress(B.A);
  ok(await lobby.evaluate(() => window.__joins === 1), 'lobby: A on the selected table joins it');
}
await lobby.close();

ok(errors.length === 0, 'no page errors ' + JSON.stringify(errors.slice(0, 3)));

await browser.close();
server.close();
console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
