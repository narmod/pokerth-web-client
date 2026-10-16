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
import { startServer, openTable, turnTo } from './lib/mobile-harness.mjs';

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

const ids = await openTable(page, base, { seats: 4, board: 'flop', turn: 'me' });

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

const KONAMI_WAIT = 1800;
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

// ── Floating panels do not stop play ──
await page.evaluate(() => window.toggleGameChat());
await page.waitForTimeout(150);
await page.evaluate(() => document.activeElement && document.activeElement.blur());   // opened with the mouse, not typing
ok(await page.evaluate(() => getComputedStyle(document.getElementById('g-chat-panel')).display !== 'none'), 'chat panel open');
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'game'), 'chat open → still game mode');
await press(B.X);
c = await calls();
ok(c.some((x) => x[0] === 'doAction' && x[1] === 1), 'X still folds with the chat open');
await press(B.B);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('g-chat-panel')).display === 'none'), 'B closes the chat panel');
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'game'), 'still game mode after closing it');

// ── Select: game ⇄ navigation ──
await press(B.SELECT);
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'nav'), 'Select → navigation');
ok(await page.evaluate(() => { const b = document.getElementById('ctl-badge'); return !!b && !b.hidden && b.classList.contains('ctl-badge-nav'); }), 'badge shows navigation');
ok(await page.evaluate(() => !!document.querySelector('#s-game .pad-cur')), 'ring placed on the table');
await press(B.SELECT);
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'game' && !document.querySelector('.pad-cur')), 'Select → back to game, ring gone');

// X in navigation = chat: opens the panel and the controller keyboard.
await page.evaluate(() => { window.__sent = []; window.App.sendGameChat = function () { const f = document.getElementById('g-chat-in'); window.__sent.push(f.value); f.value = ''; }; });
await press(B.SELECT);
await press(B.X);
await page.waitForTimeout(300);
const kb = await page.evaluate(() => { const k = document.getElementById('ctl-kb'); const r = document.querySelector('.pad-cur'); return { open: !!k && getComputedStyle(k).display !== 'none', ring: r ? r.className : null, mode: window.PadNav.currentMode().forced }; });
ok(kb.open && /ctl-phrase/.test(kb.ring || '') && kb.mode, 'X (navigation) opens the chat and the keyboard, ring on the quick phrases ' + JSON.stringify(kb));
ok((await calls()).length === 0, 'X did not fold in navigation');
ok(await page.evaluate(() => document.activeElement && document.activeElement.id !== 'g-chat-in'), 'the chat field is not focused (no device keyboard)');
await press(B.A);
let sent = await page.evaluate(() => window.__sent.slice());
ok(sent.length === 1 && sent[0].length > 0, 'A on a quick phrase sends it ' + JSON.stringify(sent));
ok(await page.evaluate(() => getComputedStyle(document.getElementById('ctl-kb')).display === 'none'), 'keyboard closes after sending');
// Type "hi" with letters, Y = space, X = backspace, Start = send.
await press(B.A);   // ring back on the chat field (zone chat) → A opens the keyboard
const typed = async (ch) => {
  for (let i = 0; i < 30; i++) {
    const step = await page.evaluate((ch) => {
      const r = document.querySelector('.pad-cur');
      const k = [...document.querySelectorAll('#ctl-kb .ctl-key')].find((b) => b.textContent.toLowerCase() === ch);
      if (!k) return 'none';
      if (r === k) return 'done';
      if (!r) return 'down';
      const a = r.getBoundingClientRect(), b = k.getBoundingClientRect();
      if (b.top > a.bottom - 2) return 'down';
      if (b.bottom < a.top + 2) return 'up';
      return b.left > a.left ? 'right' : 'left';
    }, ch);
    if (step === 'done') { await press(B.A); return true; }
    if (step === 'none') return false;
    await press({ down: B.DOWN, up: B.UP, left: B.LEFT, right: B.RIGHT }[step]);
  }
  return false;
};
ok(await page.evaluate(() => getComputedStyle(document.getElementById('ctl-kb')).display !== 'none'), 'A on the chat field opens the keyboard');
ok(await typed('h') && await typed('i'), 'letters typed with the D-pad and A');
await press(B.Y); await press(B.Y);
await press(B.X);
const val = await page.evaluate(() => document.getElementById('g-chat-in').value);
ok(val === 'hi ', 'Y = space, X = backspace (' + JSON.stringify(val) + ')');
await press(B.START);
sent = await page.evaluate(() => window.__sent.slice());
ok(sent.length === 2 && sent[1] === 'hi ', 'Start sends the message ' + JSON.stringify(sent));
// LB / RB cycle the zones: table ⇄ chat.
const z0 = await page.evaluate(() => window.PadNav.currentMode().scope.id);
await press(B.RB);
const z1 = await page.evaluate(() => window.PadNav.currentMode().scope.id);
ok(z0 !== z1, `RB switches zone (${z0} → ${z1})`);
await press(B.RB);
const z2 = await page.evaluate(() => window.PadNav.currentMode().scope.id);
ok(z2 === z0 || z2 === 'ace-dock', `RB again goes on (${z2})`);
await press(B.B);   // closes the chat
await press(B.B);   // nothing left → game
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'game'), 'B with nothing to close returns to game');

// My turn comes back while navigating → game automatically.
await press(B.SELECT);
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'nav'), 'navigating before the turn');
await turnTo(page, ids[1]);
await page.waitForTimeout(150);
await turnTo(page, 42);
await page.waitForTimeout(250);
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'game'), 'my turn → back to game mode automatically');

// ── Start: controller menu ──
await press(B.START);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('ctl-menu')).display !== 'none'), 'Start opens the controller menu');
ok(await page.evaluate(() => window.PadNav.currentMode().mode === 'nav' && window.PadNav.currentMode().forced), 'menu forces navigation');
const tilesIds = await page.evaluate(() => [...document.querySelectorAll('#ctl-menu .ctl-tile')].map((b) => b.dataset.act));
ok(tilesIds[0] === 'resume' && tilesIds.includes('chat') && tilesIds.includes('options') && tilesIds.includes('quit'), 'table tiles ' + tilesIds.join(','));
await press(B.X);
ok((await calls()).length === 0, 'X does nothing in the menu');
// Walk to the Settings tile and open it.
let onOpt = false;
for (let i = 0; i < 20 && !onOpt; i++) {
  const step = await page.evaluate(() => {
    const r = document.querySelector('.pad-cur'), o = document.querySelector('#ctl-menu .ctl-tile[data-act="options"]');
    if (r === o) return 'done';
    if (!r) return 'down';
    const a = r.getBoundingClientRect(), b = o.getBoundingClientRect();
    if (b.top > a.bottom - 2) return 'down';
    if (b.bottom < a.top + 2) return 'up';
    return b.left > a.left ? 'right' : 'left';
  });
  if (step === 'done') { onOpt = true; break; }
  await press({ down: B.DOWN, up: B.UP, left: B.LEFT, right: B.RIGHT }[step]);
}
ok(onOpt, 'D-pad reaches the Settings tile');
await press(B.A);
await page.waitForTimeout(200);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('adv-modal')).display !== 'none' && getComputedStyle(document.getElementById('ctl-menu')).display === 'none'), 'A on Settings closes the menu and opens the settings');

// ── Settings ──
await press(B.DOWN);
const r1 = await page.evaluate(() => { const r = document.querySelector('.pad-cur'); return r ? { inModal: document.getElementById('adv-modal').contains(r), txt: (r.textContent || r.id || r.tagName).trim().slice(0, 40) } : null; });
ok(r1 && r1.inModal, 'ring inside the settings ' + JSON.stringify(r1));
await press(B.DOWN); await press(B.DOWN);
const r2 = await page.evaluate(() => { const r = document.querySelector('.pad-cur'); return r ? (r.textContent || r.id || r.tagName).trim().slice(0, 40) : null; });
ok(r2 && r2 !== r1.txt, 'D-pad ↓ moves the ring (' + r1.txt + ' → ' + r2 + ')');
await press(B.SELECT);
ok(await page.evaluate(() => window.PadNav.currentMode().forced), 'Select ignored while a window is open');
const cat0 = await page.evaluate(() => document.querySelector('#adv-modal .adv-cat[aria-selected="true"]').dataset.cat);
await press(B.RT);
const cat1 = await page.evaluate(() => document.querySelector('#adv-modal .adv-cat[aria-selected="true"]').dataset.cat);
ok(cat0 !== cat1, `RT switches category (${cat0} → ${cat1})`);
await press(B.LT);
const cat2 = await page.evaluate(() => document.querySelector('#adv-modal .adv-cat[aria-selected="true"]').dataset.cat);
ok(cat2 === cat0, 'LT goes back (' + cat2 + ')');
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
const after = await page.evaluate(() => { const m = window.PadNav.currentMode(); const r = document.querySelector('.pad-cur'); return { mode: m.mode, scope: m.scope && m.scope.id, ring: r ? (r.id || r.className) : null }; });
ok(after.mode === 'game' && !after.ring, 'back to game mode, ring gone ' + JSON.stringify(after));

// ── The Ace (navigation, Y) ──
const aceAvail = await page.evaluate(() => typeof window.guideToggle === 'function' && document.body.classList.contains('guide-avail'));
if (aceAvail) {
  await press(B.SELECT);
  await press(B.Y);
  await page.waitForTimeout(1600);
  const ace = await page.evaluate(() => { const r = document.querySelector('.pad-cur'); const d = document.getElementById('ace-dock'); return { inAce: !!(r && d && d.contains(r)), open: !!document.querySelector('#ace-dock .ad-bubble.ad-open') }; });
  ok(ace.open && ace.inAce, 'Y opens the Ace\'s menu with the ring in his bubble ' + JSON.stringify(ace));
  await press(B.B); await press(B.B);
  await page.evaluate(() => window.CtlNav.setMode('game'));
} else console.log('  (Ace not available in this fixture: skipped)');

// ── Konami code (Navigation at the table): ↑↑↓↓←→←→ B A ──
await page.evaluate(() => {
  window.__eggs = 0; window.__ach = [];
  const real = window._konamiEgg;
  window._konamiEgg = function () { window.__eggs++; return real(); };
  window.addEventListener('pth-achievement', (e) => window.__ach.push(e.detail && e.detail.id));
  window.CtlNav.setMode('game');
});
const konami = [B.UP, B.UP, B.DOWN, B.DOWN, B.LEFT, B.RIGHT, B.LEFT, B.RIGHT];
// Game mode: nothing (←/→ would change the playing mode, A would call).
for (const b of konami) await press(b);
await press(B.B); await press(B.A);
ok(await page.evaluate(() => window.__eggs === 0), 'Konami in Game mode does nothing');
await page.evaluate(() => window.CtlNav.setMode('game'));
await calls();
// Navigation with the chat open: B is held back, A completes the egg.
await page.evaluate(() => { window.toggleGameChat(); document.activeElement && document.activeElement.blur(); });
await press(B.SELECT);
for (const b of konami) await press(b);
await press(B.B);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('g-chat-panel')).display !== 'none'), 'after the code, B is held back (chat still open)');
await press(B.A);
await page.waitForTimeout(400);
const egg = await page.evaluate(() => ({ n: window.__eggs, ach: window.__ach.slice(), chat: getComputedStyle(document.getElementById('g-chat-panel')).display !== 'none' }));
ok(egg.n === 1 && egg.ach.includes('egg'), 'B A completes the code: egg + secret trophy ' + JSON.stringify(egg));
ok(egg.chat, 'neither B nor A acted on the page');
ok((await calls()).length === 0, 'no table action');
// The code without A: B gives its Back, late.
await page.waitForTimeout(5200);   // the egg plays at most once every 5 s
for (const b of konami) await press(b);
await press(B.B);
await page.waitForTimeout(KONAMI_WAIT);
ok(await page.evaluate(() => getComputedStyle(document.getElementById('g-chat-panel')).display === 'none' && window.__eggs === 1), 'B without A: Back happens late (chat closed), no egg');
await page.evaluate(() => window.CtlNav.setMode('game'));
await calls();

// ── Mouse takes over ──
await press(B.SELECT);
await page.mouse.click(5, 5);
await page.waitForTimeout(100);
ok(await page.evaluate(() => !document.body.classList.contains('pad-active') && !document.querySelector('.pad-cur')), 'a mouse click hides glyphs and ring');
await page.evaluate(() => window.CtlNav.setMode('game'));
await calls();

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
