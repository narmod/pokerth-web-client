#!/usr/bin/env node
// The mini-games with a gamepad (web.65, narmod: « with the pad it doesn't
// work at all »): a fake standard pad (navigator.getGamepads stubbed) drives
// the arcade page (the D-pad moves between rows too, A plays, Y the rules,
// B back), a title screen (↑/↓ move between its tiles) and Poker Run (←/→
// held and let go, A / RT nitro, B / LT brake, the stick on its main axis).
import { chromium } from 'playwright';
import { startServer } from './lib/mobile-harness.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };

const { server, base } = await startServer();
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => {
  try {
    if (!sessionStorage.getItem('x')) {
      sessionStorage.setItem('x', '1'); localStorage.clear();
      for (const [k, v] of [['pth_guide_offered', '1'], ['pth_lang', 'fr'], ['pth_bak_auto', '0'], ['pth_arcade_all', '1'], ['pth_arcade_shown', '1'], ['pth_arcade_seen', '1']]) localStorage.setItem(k, v);
    }
  } catch (e) {}
  const btn = () => ({ pressed: false, value: 0, touched: false });
  window.__pad = { id: 'Xbox fake (STANDARD GAMEPAD Vendor: 045e)', index: 0, connected: true, mapping: 'standard', timestamp: 0, buttons: Array.from({ length: 17 }, btn), axes: [0, 0, 0, 0] };
  navigator.getGamepads = () => [window.__pad];
});
const pg = await ctx.newPage();
const errors = []; pg.on('pageerror', (e) => errors.push(e.message));
const press = (i, on) => pg.evaluate(([i, on]) => { window.__pad.buttons[i] = { pressed: on, value: on ? 1 : 0, touched: on }; window.__pad.timestamp++; }, [i, on]);
const tap = async (i) => { await press(i, true); await sleep(90); await press(i, false); await sleep(120); };
const axes = (x, y) => pg.evaluate(([x, y]) => { window.__pad.axes = [x, y, 0, 0]; }, [x, y]);
const A = 0, B = 1, Y = 3, LT = 6, RT = 7, UP = 12, DOWN = 13, LEFT = 14, RIGHT = 15;

await pg.goto(base); await pg.waitForSelector('.login-card'); await sleep(1500);
await pg.evaluate(() => { window.loginOpenArcade(); });
await pg.waitForSelector('#pth-game .gm-card', { timeout: 8000 }); await sleep(600);
console.log('arcade page');
const lit = () => pg.evaluate(() => { const c = [...document.querySelectorAll('#pth-game .gm-card')]; const i = c.findIndex((x) => x.classList.contains('on') || x.classList.contains('sel') || x.getAttribute('aria-current') === 'true'); return { i, top: i >= 0 ? Math.round(c[i].getBoundingClientRect().top) : -1 }; });
const l0 = await lit();
await tap(DOWN); const l1 = await lit();
ok(l0.i >= 0 && l1.top > l0.top, 'D-pad ↓ moves to the row below (card ' + l0.i + ' → ' + l1.i + ')');
await tap(UP); const l2 = await lit();
ok(l2.top === l0.top, 'D-pad ↑ moves back up (card ' + l2.i + ')');
await tap(RIGHT); const l3 = await lit();
ok(l3.i === (l2.i + 1), 'D-pad → the next card');
await tap(Y); await sleep(200);
ok(await pg.evaluate(() => { const r = document.querySelector('#pth-game .pg-rules'); return !!r && !r.hidden; }), 'Y shows the rules of the lit card');
await tap(B); await sleep(200);
ok(await pg.evaluate(() => { const r = document.querySelector('#pth-game .pg-rules'); return !r || r.hidden; }), 'B closes them, still on the page');
ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card')), '… the arcade page is still there');
// To Poker Run with the pad: along the cards, then A.
const target = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .gm-card')].findIndex((c) => !!c.querySelector('.gm-art[data-art="poker-run"]')));
for (let n = 0; n < 12 && (await lit()).i !== target; n++) await tap(RIGHT);
await tap(A); await sleep(1200);
ok(await pg.evaluate(() => window._pthPadOwner === 'poker-run'), 'A opens the lit game (Poker Run)');
console.log('Poker Run');
await tap(A); await sleep(600);
ok(await pg.evaluate(() => window.__pthRun && window.__pthRun.state() === 'run'), 'A starts the run from its title');
await pg.evaluate(() => { const R = window.__pthRun; R.cars().forEach((c) => { c.dead = true; }); R.setTime(99); R.setPos(5); R.setPx(0); R.setV(0.8); });
await press(LEFT, true); await sleep(250);
const k1 = await pg.evaluate(() => window.__pthRun.game());
await press(LEFT, false); await sleep(250);
const k2 = await pg.evaluate(() => window.__pthRun.game());
await sleep(400);
const k3 = await pg.evaluate(() => window.__pthRun.game());
ok(k1.keys.l && k1.px < -0.15, 'D-pad ← held steers left (x ' + k1.px.toFixed(2) + ')');
ok(!k2.keys.l && Math.abs(k3.px - k2.px) < 0.15, '… and let go, the car stops turning (x ' + k2.px.toFixed(2) + ' → ' + k3.px.toFixed(2) + ')');
await axes(0.9, -0.5); await sleep(300);
const k4 = await pg.evaluate(() => window.__pthRun.game());
ok(k4.keys.r && !k4.keys.n, 'the stick right and a little up steers right, no nitro');
await axes(0, 0); await sleep(150);
await press(RT, true); await sleep(250);
const k5 = await pg.evaluate(() => window.__pthRun.game());
await press(RT, false); await sleep(150);
await press(A, true); await sleep(200);
const k6 = await pg.evaluate(() => window.__pthRun.game());
await press(A, false); await sleep(150);
ok(k5.keys.n && k6.keys.n && !(await pg.evaluate(() => window.__pthRun.game().keys.n)), 'RT or A held: nitro; let go: off');
await press(B, true); await sleep(200);
const k7 = await pg.evaluate(() => window.__pthRun.game());
await press(B, false); await press(LT, true); await sleep(200);
const k8 = await pg.evaluate(() => window.__pthRun.game());
await press(LT, false); await sleep(150);
ok(k7.keys.b && k8.keys.b && !(await pg.evaluate(() => window.__pthRun.game().keys.b)), 'B or LT held: brake; let go: off');
await tap(9); await sleep(200);
const paused = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .pg-pause, #pth-game [class*="pause"]')].some((e) => !e.hidden && e.offsetParent !== null));
const t0p = await pg.evaluate(() => window.__pthRun.game().time); await sleep(300);
ok(paused && Math.abs((await pg.evaluate(() => window.__pthRun.game().time)) - t0p) < 0.01, 'Start pauses (the clock stops)');
ok(await pg.evaluate(() => { const b = document.querySelectorAll('#pth-game .pg-pause [data-p]'); return b.length === 2 && document.activeElement === b[0]; }), 'the pause offers Resume (focused) and Quit');
await tap(A); await sleep(200);
ok(!(await pg.evaluate(() => !document.querySelector('#pth-game .pg-pause').hidden)), 'A resumes');
await tap(9); await sleep(200); await tap(B); await sleep(500);
ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card')), 'Start then B quits to the arcade page');
// A TV remote: Back (GoBack) pauses a run, Back again leaves it; ⏯ pauses and resumes.
for (let n = 0; n < 12 && (await lit()).i !== target; n++) await tap(RIGHT);
await tap(A); await sleep(900); await tap(A); await sleep(500);
const key = (k, c) => pg.evaluate(([k, c]) => { for (const type of ['keydown', 'keyup']) window.dispatchEvent(new KeyboardEvent(type, { key: k, keyCode: c, bubbles: true })); }, [k, c]);
await key('MediaPlayPause', 179); await sleep(200);
const pp1 = await pg.evaluate(() => !document.querySelector('#pth-game .pg-pause').hidden);
await key('MediaPlayPause', 179); await sleep(200);
const pp2 = await pg.evaluate(() => !document.querySelector('#pth-game .pg-pause').hidden);
ok(pp1 && !pp2, 'remote ⏯ pauses and resumes');
await key('GoBack', 4); await sleep(200);
const gb1 = await pg.evaluate(() => !document.querySelector('#pth-game .pg-pause').hidden);
await key('GoBack', 4); await sleep(500);
ok(gb1 && await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card')), 'remote Back pauses, Back again leaves the game');
console.log('a title screen (Video Poker)');
const vp = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .gm-card')].findIndex((c) => !!c.querySelector('.gm-art[data-art="videopoker"]')));
for (let n = 0; n < 12 && (await lit()).i !== vp; n++) await tap(LEFT);
await tap(A); await sleep(900);
const sel = () => pg.evaluate(() => [...document.querySelectorAll('#pth-game .pg-panel .gm-mode, #pth-game .pg-panel [data-m]')].findIndex((x) => x.classList.contains('on')));
const t0 = await sel(); await tap(DOWN); const t1 = await sel(); await tap(UP); const t2 = await sel();
ok(t0 >= 0 && t1 !== t0 && t2 === t0, 'on a title, ↓ / ↑ move between the tiles (' + t0 + ' → ' + t1 + ' → ' + t2 + ')');
const o0 = await pg.evaluate(() => (document.querySelector('#pth-game .gm-opt.on') || {}).textContent || '');
await tap(Y); await sleep(200);
const o1 = await pg.evaluate(() => (document.querySelector('#pth-game .gm-opt.on') || {}).textContent || '');
ok(o0 && o1 && o0 !== o1, "Y switches the title's option (" + o0.slice(0, 14) + ' → ' + o1.slice(0, 14) + ')');
await tap(B); await sleep(400);
ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card')), 'B on a title goes back to the arcade page');
console.log('an end screen (Ace Runner)');
const arI = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .gm-card')].findIndex((c) => !!c.querySelector('.gm-art[data-art="ace-runner"]')));
for (let n = 0; n < 12 && (await lit()).i !== arI; n++) await tap(LEFT);
await tap(A); await sleep(900); await tap(A);
const endUp = () => pg.waitForSelector('#pth-game .gm-endc .gm-erest:not(.gm-ewait)', { timeout: 25000 }).then(() => sleep(300)).catch(() => {});
const focused = () => pg.evaluate(() => (document.activeElement && document.activeElement.getAttribute('data-e')) || '');
await endUp();
const f0 = await focused(); await tap(RIGHT); const f1 = await focused(); await tap(LEFT); const f2 = await focused();
ok(f0 === 'again' && f1 === 'menu' && f2 === 'again', 'the end screen: « Rejouer » lit, the D-pad moves between its two buttons (' + f0 + ' → ' + f1 + ' → ' + f2 + ')');
await tap(A); await sleep(500);
ok(await pg.evaluate(() => { const p = document.querySelector('#pth-game .pg-panel'); return p.hidden && window._pthPadOwner === 'ace-runner'; }), 'A plays again');
await endUp();
await tap(B); await sleep(400);
ok(await pg.evaluate(() => !!document.querySelector('#pth-game .pg-panel.gm-title')), "B: the game's menu");
await tap(B); await sleep(400);
ok(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card')), 'B again: the arcade page');
console.log('every game: A opens it, A starts it, Select comes back');
const ids = await pg.evaluate(() => [...document.querySelectorAll('#pth-game .gm-card .gm-art[data-art]')].map((x) => x.getAttribute('data-art')));
for (const id of ids) {
  const idx = await pg.evaluate((id) => [...document.querySelectorAll('#pth-game .gm-card')].findIndex((c) => !!c.querySelector('.gm-art[data-art="' + id + '"]')), id);
  for (let n = 0; n < 12 && (await lit()).i !== idx; n++) await tap(RIGHT);
  await tap(A); await sleep(900);
  const opened = await pg.evaluate((id) => window._pthPadOwner === id || !document.querySelector('#pth-game .gm-card'), id);
  await tap(A); await sleep(700);
  const started = await pg.evaluate(() => { const p = document.querySelector('#pth-game .pg-panel'); return !p || p.hidden || !p.classList.contains('gm-title'); });
  await tap(8); await sleep(300);
  if (!(await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card')))) { await tap(8); await sleep(400); }
  const back = await pg.evaluate(() => !!document.querySelector('#pth-game .gm-card'));
  ok(opened && started && back, id + ': opened, started and left with the pad');
}
ok(!errors.length, 'no page error' + (errors.length ? ': ' + errors[0] : ''));
await b.close(); server.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
