#!/usr/bin/env node
// Mobile verification in REAL browser engines (Playwright): iOS Safari is
// approximated by WebKit with iPhone profiles, Android Chrome by Chromium with
// Pixel / Galaxy profiles (viewport, DPR, touch, user agent, pointer: coarse).
//
// What it guards (the mobile regressions of web.89 - web.91 and their kin):
//   · boot without a page error, no horizontal page overflow;
//   · table: every seat inside the zone, self box centred above the action bar,
//     action buttons reachable and finger-sized, community cards in the zone;
//   · loupe (x2): button offered, layer scaled; after the view FOLLOWED A SIDE
//     SEAT, "my turn" shows the self box centred and magnified (web.90 bug:
//     it landed at left = W/2 + panX, off-screen);
//   · mini-board (web.91): shown on my turn when the board is out of view,
//     inside the zone, clear of the floating buttons, mirrors the dealt cards,
//     tap = cards <-> self box, hidden with the loupe off;
//   · loupe off: the layout comes back exactly.
// The hand is driven through a fixture WebSocket (same technique as
// test-accessibility-browser): deterministic, no bots, no network.
//
// Run:            node scripts/test-mobile-browser.mjs        (npm run test:mobile)
// Engines once:   npx playwright install chromium webkit
// Options (env):  PTH_MOBILE=all|ios|android     (default all)
//                 PTH_DEVICES="iPhone 15,Pixel 7" (exact Playwright device names)
//                 PTH_SHOTS=0                     (no screenshots)
//                 PTH_ENGINE=chromium|webkit      (force one engine for every profile,
//                                                  e.g. iPhone viewports without WebKit)
// Screenshots:    test-artifacts/mobile/<device>-<step>.png (git-ignored) - open
//                 them after a UI change: the assertions catch geometry, the eye
//                 catches the rest.
// An engine that is not installed is SKIPPED with a notice (exit code 0 if at
// least one engine ran and everything passed). WebKit is close to, but not,
// Safari on a real iPhone: audio, the collapsing toolbar, the notch safe area
// and the on-screen keyboard still need a real device before a release.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium, webkit, devices } from 'playwright';

const MATRIX = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },
  { name: 'iPhone 15', family: 'ios' },
  { name: 'iPhone 15 landscape', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'Galaxy S24', family: 'android' },
  { name: 'Galaxy A55 landscape', family: 'android' },
];
const ENGINES = { ios: ['webkit', webkit], android: ['chromium', chromium] };
const SEATS = 10;
const SHOTS = process.env.PTH_SHOTS !== '0';
const SHOT_DIR = join(process.cwd(), 'test-artifacts', 'mobile');

const root = join(process.cwd(), 'public');
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer((request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const relative = pathname === '/' ? 'pokerth-client.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
    const file = normalize(join(root, relative));
    if (!file.startsWith(root) || !statSync(file).isFile()) throw new Error('not found');
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    response.end(readFileSync(file));
  } catch (_error) { response.writeHead(404); response.end('not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;

let passed = 0, failed = 0, currentDevice = '';
// On GitHub Actions every failure is also emitted as an ::error annotation, so
// it shows on the run page (and through the check-runs API) without opening
// the log.
function annotate(label, message) {
  if (!process.env.GITHUB_ACTIONS) return;
  const clean = (v) => String(v).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  console.log(`::error title=${clean(currentDevice).replace(/,/g, '%2C').replace(/:/g, '%3A')}::${clean(label + ' - ' + message)}`);
}
async function check(label, action) {
  try { await action(); passed++; console.log('  \u2713 ' + label); }
  catch (error) {
    failed++; const message = String(error && error.message || error).split('\n')[0];
    console.log('  \u2717 ' + label + '\n      ' + message); annotate(label, message);
  }
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
async function shot(page, device, step) {
  if (!SHOTS) return;
  try { mkdirSync(SHOT_DIR, { recursive: true }); await page.screenshot({ path: join(SHOT_DIR, `${slug(device)}-${step}.png`) }); } catch (_e) {}
}

// ── Fixture WebSocket + a 10-seat hand: flop dealt, my turn ────────────────
async function startHand(page) {
  await page.waitForFunction(() => document.readyState === 'complete' && window.App
    && typeof window.App.connect === 'function' && window.PthState && document.querySelector('#s-connect .btn-primary'));
  await page.evaluate(async () => {
    try { localStorage.removeItem('pth_resume'); } catch (_e) {}
    (await import('/modules/net/session.mjs')).show('s-connect');
  });
  await page.locator('#s-connect.active').waitFor();
  // The first-run "local backup" banner (Chromium only: File System Access
  // API) sits over the third login card on a phone: dismiss it the way a
  // player would, with its last button ("Later").
  await page.waitForTimeout(600);
  const later = page.locator('#bak-restore-banner button').last();
  if (await later.count()) { try { await later.tap({ timeout: 2000 }); } catch (_e) {} }
  await page.locator('.login-card').nth(2).click();
  await page.locator('#nick').fill('MobileTester');
  await page.evaluate(() => {
    class FixtureSocket extends EventTarget {
      static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
      constructor(url) { super(); this.url = url; this.readyState = 1; this.sent = []; FixtureSocket.instance = this;
        setTimeout(() => this.onopen && this.onopen({ target: this }), 0); }
      send(data) { this.sent.push(data); }
      close() { this.readyState = 3; if (this.onclose) this.onclose({ code: 1000, target: this }); }
      receive(payload) {
        const frame = new ArrayBuffer(4 + payload.byteLength);
        new DataView(frame).setUint32(0, payload.byteLength, false);
        new Uint8Array(frame).set(payload, 4);
        this.onmessage({ data: frame, target: this });
      }
    }
    window.WebSocket = FixtureSocket;
  });
  await page.locator('.btn-primary[data-i18n="connect"]').click();
  await page.waitForFunction(() => window.WebSocket.instance && typeof window.WebSocket.instance.onmessage === 'function');
  await page.waitForTimeout(300);
  await page.evaluate(async (count) => {
    const { Proto } = await import('/modules/net/proto.mjs');
    const { MSG } = await import('/modules/net/messages.mjs');
    const socket = window.WebSocket.instance;
    const envelope = (type, field, inner) => Proto.encode([[1, 0, type], [field, 2, Proto.encode(inner)]]);
    window.__fx = { Proto, MSG, socket, envelope };
    const version = Proto.encode([[1, 0, 2], [2, 0, 1]]);
    const ids = [42, ...Array.from({ length: count - 1 }, (_, index) => 50 + index)];
    window.__fx.ids = ids;
    socket.receive(envelope(MSG.T.Announce, 2, [[1, 2, version], [2, 2, version], [4, 0, 0], [5, 0, 0]]));
    socket.receive(envelope(MSG.T.InitAck, 7, [[1, 2, new Uint8Array([1, 2, 3, count])], [2, 0, 42]]));
    for (const [index, pid] of ids.entries()) {
      socket.receive(envelope(MSG.T.PlayerList, 13, [[1, 0, pid], [2, 0, 0]]));
      const info = Proto.encode([[1, 2, pid === 42 ? 'MobileTester' : `Player ${index + 1}`], [3, 0, 2]]);
      socket.receive(envelope(MSG.T.PlayerInfoReply, 20, [[1, 0, pid], [2, 2, info]]));
    }
    const gameInfo = Proto.encode([[1, 2, `Mobile ${count}-seat table`], [2, 0, 1], [3, 0, count],
      [4, 0, 1], [5, 0, 7], [10, 0, 5], [11, 0, 30], [12, 0, 10], [13, 0, 3000]]);
    socket.receive(envelope(MSG.T.GameListNew, 14, [[1, 0, 303], [2, 0, 1], [3, 0, 0], ...ids.map((pid) => [4, 0, pid]), [5, 0, ids[1]], [6, 2, gameInfo]]));
    socket.receive(envelope(MSG.T.JoinGameAck, 25, [[1, 0, 303], [2, 0, 0]]));
    socket.receive(envelope(MSG.T.GameStartInitial, 39, [[1, 0, 303], [2, 0, ids[1]], [3, 2, new Uint8Array(ids)]]));
    socket.receive(envelope(MSG.T.HandStart, 41, [[1, 0, 303], [2, 2, Proto.encode([[1, 0, 12], [2, 0, 25]])], [4, 0, 10], [6, 0, ids[1]]]));
    socket.receive(envelope(MSG.T.PlayersActionDone, 45, [[1, 0, 303], [2, 0, ids[1]], [3, 0, 0], [4, 0, 0], [5, 0, 20], [6, 0, 2980], [7, 0, 20], [8, 0, 20]]));
    socket.receive(envelope(MSG.T.PlayersActionDone, 45, [[1, 0, 303], [2, 0, 42], [3, 0, 0], [4, 0, 0], [5, 0, 10], [6, 0, 2990], [7, 0, 20], [8, 0, 20]]));
    socket.receive(envelope(MSG.T.DealFlop, 46, [[1, 0, 303], [2, 0, 10], [3, 0, 22], [4, 0, 35]]));
    socket.receive(envelope(MSG.T.PlayersTurn, 42, [[1, 0, 303], [2, 0, 42], [3, 0, 1]]));
  }, SEATS);
  await page.locator('#s-game.active .act-buttons-row .btn-action').first().waitFor();
  await page.waitForFunction((count) => document.querySelectorAll('#g-seats .seat').length === count, SEATS);
  await settle(page);
}
const turnTo = (page, pid) => page.evaluate((p) => { const f = window.__fx;
  f.socket.receive(f.envelope(f.MSG.T.PlayersTurn, 42, [[1, 0, 303], [2, 0, p], [3, 0, 1]])); }, pid);
const acted = (page, pid) => page.evaluate((p) => { const f = window.__fx;
  f.socket.receive(f.envelope(f.MSG.T.PlayersActionDone, 45, [[1, 0, 303], [2, 0, p], [3, 0, 1], [4, 0, 2], [5, 0, 0], [6, 0, 3000], [7, 0, 0], [8, 0, 20]])); }, pid);
const dealTurn = (page, card) => page.evaluate((c) => { const f = window.__fx;
  f.socket.receive(f.envelope(f.MSG.T.DealTurn, 47, [[1, 0, 303], [2, 0, c]])); }, card);

// Wait until the table geometry stops moving (renders are rAF-batched, the
// loupe pan animates 220 ms).
async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => {
    let prior = '', since = performance.now(); const started = since;
    const tick = (now) => {
      const cur = JSON.stringify([...document.querySelectorAll('#g-seats .seat, #g-comm .pk, #g-miniboard')].map((e) => {
        const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)]; }));
      if (cur !== prior) { prior = cur; since = now; }
      if (now - since >= 350 || now - started >= 4000) resolve(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
}

const geometry = (page) => page.evaluate(() => {
  const rect = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const vis = (e) => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect();   // offsetParent is null for position:fixed
    return c.display !== 'none' && c.visibility !== 'hidden' && r.width > 1 && r.height > 1; };
  const mb = document.getElementById('g-miniboard');
  const layer = document.getElementById('g-zoom-layer'), lr = layer.getBoundingClientRect();
  const me = document.querySelector('#g-seats .seat.me');
  return {
    viewport: { width: innerWidth, height: innerHeight },
    overflowX: document.documentElement.scrollWidth - innerWidth,
    zone: rect(document.getElementById('g-table-zone')),
    layerScale: lr.width / layer.offsetWidth,
    layerLeft: lr.left,
    me: rect(me.querySelector('.seat-plate') || me),
    meLeft: me.style.left,
    plates: [...document.querySelectorAll('#g-seats .seat:not(.seat-ghost)')].map((s) => rect(s.querySelector('.seat-plate') || s)),
    comm: [...document.querySelectorAll('#g-comm .pk[data-c]')].map(rect),
    actionBar: rect(document.querySelector('.my-zone')),
    actions: [...document.querySelectorAll('.act-buttons-row .btn-action')].filter(vis).map(rect),
    loupeBtn: vis(document.getElementById('g-zoom-toggle')) ? rect(document.getElementById('g-zoom-toggle')) : null,
    floating: ['chat-toggle-btn', 'react-toggle-btn', 'hands-toggle-btn', 'log-toggle-btn'].map((id) => document.getElementById(id)).filter(vis).map(rect),
    mini: { hidden: mb.hidden, rect: rect(mb), cards: mb.querySelectorAll('.pk[data-c]').length, aria: mb.getAttribute('aria-label') },
  };
});
const overlap = (a, b) => a && b && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;

async function runDevice(browser, name) {
  const descriptor = devices[name];
  const context = await browser.newContext({ ...descriptor, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  const vp = descriptor.viewport;
  currentDevice = `${name} (${browser.browserType().name()})`;
  console.log(`\n${name} - ${vp.width}x${vp.height} @${descriptor.deviceScaleFactor}x`);
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await check('boots, login screen has no horizontal overflow', async () => {
      await page.waitForFunction(() => document.readyState === 'complete' && window.App && document.querySelector('#s-connect .btn-primary'));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(over <= 1, `page is ${over}px wider than the screen`);
    });
    await startHand(page);
    const base0 = await geometry(page);
    await shot(page, name, '1-table');
    const cx = base0.zone.left + base0.zone.width / 2;

    await check(`table: ${SEATS} seats inside the zone, no page overflow`, async () => {
      assert.equal(base0.plates.length, SEATS);
      assert.ok(base0.overflowX <= 1, `page overflows by ${base0.overflowX}px`);
      base0.plates.forEach((p, i) => assert.ok(p.left >= base0.zone.left - 2 && p.right <= base0.zone.right + 2
        && p.top >= base0.zone.top - 2 && p.bottom <= base0.zone.bottom + 2, `seat ${i + 1} leaves the table zone: ${JSON.stringify(p)}`));
    });
    await check('table: self box centred, clear of the action bar', async () => {
      const mid = (base0.me.left + base0.me.right) / 2;
      assert.ok(Math.abs(mid - cx) <= 2, `self box centre ${mid.toFixed(1)} vs zone centre ${cx.toFixed(1)}`);
      assert.ok(!overlap(base0.me, base0.actionBar), 'self box is covered by the action bar');
    });
    await check('table: action buttons reachable and finger-sized', async () => {
      assert.ok(base0.actions.length >= 2, 'fewer than two action buttons');
      base0.actions.forEach((a, i) => { assert.ok(a.left >= -1 && a.right <= base0.viewport.width + 1 && a.bottom <= base0.viewport.height + 1, `action ${i + 1} is off-screen`);
        const min = base0.viewport.height < 600 && base0.viewport.width > base0.viewport.height ? 28 : 36;   // landscapeCompact: flattened row
        assert.ok(a.height >= min, `action ${i + 1} is only ${a.height.toFixed(0)}px high (min ${min})`); });
    });
    await check('table: the three flop cards are inside the zone, hidden by no seat', async () => {
      assert.equal(base0.comm.length, 3);
      base0.comm.forEach((c, i) => { assert.ok(c.left >= base0.zone.left && c.right <= base0.zone.right, `card ${i + 1} leaves the zone`);
        base0.plates.forEach((p, j) => assert.ok(!overlap(c, p), `card ${i + 1} is under seat ${j + 1}`)); });
    });
    await check('loupe: offered on this phone, mini-board hidden while it is off', async () => {
      assert.ok(base0.loupeBtn, 'magnifier button is not visible');
      assert.equal(base0.mini.hidden, true);
    });

    // Loupe on, let the view follow a side seat, then give the turn back to me.
    await page.locator('#g-zoom-toggle').tap();
    await settle(page);
    const side = await page.evaluate(() => { const z = document.getElementById('g-table-zone').clientWidth; let best = null, d = -1;
      document.querySelectorAll('#g-seats .seat:not(.me)').forEach((s) => { const x = Math.abs((parseFloat(s.style.left) || 0) - z / 2); if (x > d) { d = x; best = s.getAttribute('data-pid'); } });
      return Number(best); });
    await turnTo(page, side); await page.waitForTimeout(250);   // the render plans the deferred pan...
    await acted(page, side);                                   // ...and "acted" makes it happen at once
    await settle(page);
    const followed = await geometry(page);
    await shot(page, name, '2-loupe-follow');
    await check('loupe: x2 layer, the view followed the side seat', async () => {
      assert.ok(Math.abs(followed.layerScale - 2) < 0.02, `layer scale is ${followed.layerScale.toFixed(2)}`);
      const centred = followed.zone.left - followed.zone.width / 2;   // layer left when panX = 0
      assert.ok(Math.abs(followed.layerLeft - centred) > 8, 'the view did not pan sideways');
    });
    await turnTo(page, 42);
    await settle(page);
    const mine = await geometry(page);
    await shot(page, name, '3-loupe-my-turn');
    await check('loupe: on my turn the self box is centred and magnified (web.90)', async () => {
      const mid = (mine.me.left + mine.me.right) / 2;
      assert.ok(Math.abs(mid - cx) <= 3, `self box centre ${mid.toFixed(1)} vs zone centre ${cx.toFixed(1)} (style.left ${mine.meLeft})`);
      assert.ok(mine.me.width >= base0.me.width * 1.8, `self box is not magnified: ${base0.me.width.toFixed(0)} -> ${mine.me.width.toFixed(0)}`);
      assert.ok(mine.me.bottom <= mine.zone.bottom + 2 && mine.me.top >= mine.zone.top - 2, 'self box is cut off vertically');
      assert.ok(!overlap(mine.me, mine.actionBar), 'self box is covered by the action bar');
    });
    await check('mini-board: shown, mirrors the flop, inside the zone, clear of the buttons (web.91)', async () => {
      assert.equal(mine.mini.hidden, false, 'mini-board is hidden although the board is out of view');
      assert.equal(mine.mini.cards, 3);
      assert.match(mine.mini.aria || '', /: .+ .+ .+$/);
      const r = mine.mini.rect;
      assert.ok(r.left >= mine.zone.left && r.right <= mine.zone.right && r.top >= mine.zone.top && r.bottom <= mine.zone.bottom, `mini-board leaves the zone: ${JSON.stringify(r)}`);
      mine.floating.forEach((f, i) => assert.ok(!overlap(r, f), `mini-board overlaps floating button ${i + 1}`));
      assert.ok(!overlap(r, mine.me), 'mini-board covers the self box');
    });
    await check('mini-board: tap goes to the cards, tap again comes back; a new card is mirrored', async () => {
      await page.locator('#g-miniboard').tap(); await settle(page);
      const onBoard = await geometry(page);
      assert.ok(onBoard.me.top > mine.me.top + 20, 'the view did not move to the community cards');
      await shot(page, name, '4-loupe-board');
      if (onBoard.mini.hidden) {   // wide screen: every real card is readable now, so no duplicate - by design
        onBoard.comm.forEach((c, i) => assert.ok(c.left >= onBoard.zone.left - 1 && c.top >= onBoard.zone.top - 1, `mini-board hidden but card ${i + 1} is cut off`));
        await page.evaluate(() => window._loupeMyTurn());
      } else await page.locator('#g-miniboard').tap();
      await settle(page);
      const back = await geometry(page);
      assert.ok(Math.abs(back.me.top - mine.me.top) <= 2, 'the view did not come back to the self box');
      await dealTurn(page, 48); await turnTo(page, 42); await settle(page);
      const turn = await geometry(page);
      assert.equal(turn.mini.hidden, false); assert.equal(turn.mini.cards, 4);
    });
    await check('loupe off: mini-board hidden, layout restored exactly', async () => {
      await page.locator('#g-zoom-toggle').tap(); await settle(page);
      const ref = await geometry(page);          // reference: loupe off, current game state
      assert.equal(ref.mini.hidden, true);
      assert.ok(Math.abs(ref.layerScale - 1) < 0.01, `layer scale is ${ref.layerScale.toFixed(2)} with the loupe off`);
      ref.plates.forEach((p, i) => assert.ok(p.left >= ref.zone.left - 2 && p.right <= ref.zone.right + 2, `seat ${i + 1} leaves the zone after the loupe`));
      await page.locator('#g-zoom-toggle').tap(); await settle(page);   // on...
      await page.locator('#g-zoom-toggle').tap(); await settle(page);   // ...and off again
      const off = await geometry(page);
      assert.ok(Math.abs(off.me.left - ref.me.left) <= 1 && Math.abs(off.me.top - ref.me.top) <= 1 && Math.abs(off.me.width - ref.me.width) <= 1, `self box ${JSON.stringify(ref.me)} -> ${JSON.stringify(off.me)}`);
      off.plates.forEach((p, i) => assert.ok(Math.abs(p.left - ref.plates[i].left) <= 1 && Math.abs(p.top - ref.plates[i].top) <= 1, `seat ${i + 1} moved`));
    });
    await check('no JavaScript error during the whole run', async () => { assert.deepEqual(errors, []); });
  } catch (error) {
    failed++; const message = String(error && error.message || error).split('\n')[0];
    console.log('  \u2717 run aborted: ' + message); annotate('run aborted', message);
    await shot(page, name, 'aborted');
  } finally { await context.close(); }
}

const family = (process.env.PTH_MOBILE || 'all').toLowerCase();
const only = (process.env.PTH_DEVICES || '').split(',').map((s) => s.trim()).filter(Boolean);
const plan = MATRIX.filter((d) => (family === 'all' || d.family === family) && (!only.length || only.includes(d.name)));
only.filter((n) => !MATRIX.some((d) => d.name === n) && devices[n]).forEach((n) => plan.push({ name: n, family: /iphone|ipad/i.test(n) ? 'ios' : 'android' }));
console.log('test-mobile-browser - ' + plan.map((d) => d.name).join(', '));
let enginesRun = 0; const skipped = [];
for (const fam of ['ios', 'android']) {
  const list = plan.filter((d) => d.family === fam); if (!list.length) continue;
  const forced = (process.env.PTH_ENGINE || '').toLowerCase();
  const [engineName, engine] = forced === 'chromium' ? ['chromium', chromium] : forced === 'webkit' ? ['webkit', webkit] : ENGINES[fam];
  let browser;
  try { browser = await engine.launch({ headless: true }); }
  catch (error) { skipped.push(`${engineName} (${fam}): not installed - run "npx playwright install ${engineName}"`); continue; }
  enginesRun++;
  console.log(`\n== ${fam === 'ios' ? 'iOS profiles' : 'Android profiles'} - ${engineName} ${browser.version()} ==`);
  try { for (const d of list) await runDevice(browser, d.name); } finally { await browser.close(); }
}
server.close();
skipped.forEach((s) => { console.log('\nSKIPPED ' + s); if (process.env.GITHUB_ACTIONS) console.log('::warning title=Engine skipped::' + s); });
if (process.env.GITHUB_ACTIONS) console.log(`::notice title=Mobile verification::${passed} passed, ${failed} failed`);
console.log(`\n${passed} passed, ${failed} failed` + (SHOTS ? ` - screenshots in test-artifacts/mobile/` : ''));
if (!enginesRun) { console.log('No browser engine available.'); process.exit(2); }
process.exit(failed ? 1 : 0);
