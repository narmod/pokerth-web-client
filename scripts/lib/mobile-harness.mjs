// Shared harness of the real-browser mobile tests (test-mobile-browser.mjs,
// test-table-sweep.mjs): static server of public/, Playwright phone profiles
// (WebKit = iOS Safari approximation, Chromium = Android Chrome), a fixture
// WebSocket that drives a deterministic hand (no bots, no network), a reporter
// that also emits GitHub ::error annotations, and step screenshots.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium, webkit, devices } from 'playwright';

export { devices };
export const MATRIX = [
  { name: 'iPhone SE (3rd gen)', family: 'ios' },
  { name: 'iPhone 15', family: 'ios' },
  { name: 'iPhone 15 landscape', family: 'ios' },
  { name: 'Pixel 7', family: 'android' },
  { name: 'Galaxy S24', family: 'android' },
  { name: 'Galaxy A55 landscape', family: 'android' },
];
const ENGINES = { ios: ['webkit', webkit], android: ['chromium', chromium] };
export const SHOTS = process.env.PTH_SHOTS !== '0';
const SHOT_DIR = join(process.cwd(), 'test-artifacts', 'mobile');
export const ME = 42, GAME = 303;

// The returned state also drives what the PWA test needs: `ver` (value served
// by /__ver, the deploy stamp the update banner polls), `down` (true = the origin
// is unreachable: every connection is reset, for the page AND for the service
// worker - browser-side offline emulation does not always reach the worker) and
// `hits` (paths actually served).
export async function startServer() {
  const root = join(process.cwd(), 'public');
  const state = { ver: 1000, down: false, hits: [] };
  const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp' };
  const server = createServer((request, response) => {
    try {
      if (state.down) { request.socket.destroy(); return; }
      const pathname = new URL(request.url, 'http://localhost').pathname;
      state.hits.push(pathname);
      if (pathname === '/__ver') { response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify({ v: state.ver })); return; }
      const relative = pathname === '/' ? 'pokerth-client.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
      const file = normalize(join(root, relative));
      if (!file.startsWith(root) || !statSync(file).isFile()) throw new Error('not found');
      response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
      response.end(readFileSync(file));
    } catch (_error) { response.writeHead(404); response.end('not found'); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, state, base: `http://127.0.0.1:${server.address().port}/` };
}

// ── Reporter: console + GitHub annotations (visible on the run page and
// through the check-runs API, without opening the log). GitHub keeps at most
// 10 error annotations per step, so the failures are grouped: ONE annotation
// per phone, listing every failed check of that phone. ─────────────────────
export function createReporter() {
  const r = { passed: 0, failed: 0, device: '', pending: [] };
  const clean = (v) => String(v).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  r.flush = () => {
    if (process.env.GITHUB_ACTIONS && r.pending.length) {
      const body = r.pending.map((f) => '\u2717 ' + f).join('\n').slice(0, 3800);
      console.log(`::error title=${clean(r.device + ' - ' + r.pending.length + ' failed').replace(/,/g, '%2C').replace(/:/g, '%3A')}::${clean(body)}`);
    }
    r.pending = [];
  };
  r.fail = (label, message) => { r.failed++; console.log('  \u2717 ' + label + '\n      ' + message);
    r.pending.push(label.replace(/\s+/g, ' ') + ': ' + String(message).replace(/\s*\n\s*/g, ' ; ')); };
  r.pass = (label) => { r.passed++; console.log('  \u2713 ' + label); };
  r.check = async (label, action) => {
    try { await action(); r.pass(label); }
    catch (error) { r.fail(label, String(error && error.message || error).split('\n')[0]); }
  };
  return r;
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export async function shot(page, device, step) {
  if (!SHOTS) return;
  try { mkdirSync(SHOT_DIR, { recursive: true }); await page.screenshot({ path: join(SHOT_DIR, `${slug(device)}-${slug(step)}.png`) }); } catch (_e) {}
}

export const overlap = (a, b, tol = 1) => !!a && !!b && a.left < b.right - tol && b.left < a.right - tol && a.top < b.bottom - tol && b.top < a.bottom - tol;

// Wait until the table geometry stops moving (renders are rAF-batched, the
// loupe pan animates 220 ms, the seat layout may re-render after measuring).
export async function settle(page) {
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

// ── Fixture WebSocket + a hand on the table ────────────────────────────────
// options: seats (2-10 players at the table), spectator (I watch: none of the
// seats is mine), board ('flop' | 'river'), turn ('me' | 'first'),
// stopAt ('login': stop on the login screen, nothing sent; 'lobby': connect and
// list the game, stop in the lobby - continue later with enterTable(page)).
// Seated: my pid (42) is seat 0 and posts the small blind, ids[1] the big one.
export async function openTable(page, base, options = {}) {
  const { seats = 10, spectator = false, board = 'flop', turn = 'me', stopAt = '' } = options;
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.readyState === 'complete' && window.App
    && typeof window.App.connect === 'function' && window.PthState && document.querySelector('#s-connect .btn-primary'));
  await page.evaluate(async () => {
    try { localStorage.removeItem('pth_resume'); } catch (_e) {}
    (await import('/modules/net/session.mjs')).show('s-connect');
  });
  await page.locator('#s-connect.active').waitFor();
  // The boot splash fades out over the login screen: wait until it is gone, or
  // the first measurements / screenshots are taken through it.
  await page.waitForFunction(() => { const b = document.getElementById('boot-splash'); if (!b) return true; const c = getComputedStyle(b); return c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) < 0.02; }, null, { timeout: 8000 }).catch(() => {});
  // The first-run "local backup" banner (Chromium only: File System Access
  // API) sits over the third login card on a phone: dismiss it the way a
  // player would, with its last button ("Later").
  await page.waitForTimeout(600);
  const later = page.locator('#bak-restore-banner button').last();
  if (await later.count()) { try { await later.tap({ timeout: 2000 }); } catch (_e) {} }
  if (stopAt === 'login') return [];
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
  const ids = await page.evaluate(async ({ count, spectator, ME, GAME }) => {
    const { Proto } = await import('/modules/net/proto.mjs');
    const { MSG } = await import('/modules/net/messages.mjs');
    const socket = window.WebSocket.instance;
    const envelope = (type, field, inner) => Proto.encode([[1, 0, type], [field, 2, Proto.encode(inner)]]);
    const version = Proto.encode([[1, 0, 2], [2, 0, 1]]);
    const others = Array.from({ length: spectator ? count : count - 1 }, (_, index) => 50 + index);
    const ids = spectator ? others : [ME, ...others];
    window.__fx = { Proto, MSG, socket, envelope, ids, GAME };
    socket.receive(envelope(MSG.T.Announce, 2, [[1, 2, version], [2, 2, version], [4, 0, 0], [5, 0, 0]]));
    socket.receive(envelope(MSG.T.InitAck, 7, [[1, 2, new Uint8Array([1, 2, 3, count])], [2, 0, ME]]));
    for (const pid of [...new Set([ME, ...ids])]) {
      socket.receive(envelope(MSG.T.PlayerList, 13, [[1, 0, pid], [2, 0, 0]]));
      const info = Proto.encode([[1, 2, pid === ME ? 'MobileTester' : `Player ${pid - 48}`], [3, 0, 2]]);
      socket.receive(envelope(MSG.T.PlayerInfoReply, 20, [[1, 0, pid], [2, 2, info]]));
    }
    const gameInfo = Proto.encode([[1, 2, `Mobile ${count}-seat table`], [2, 0, 1], [3, 0, 10],
      [4, 0, 1], [5, 0, 7], [10, 0, 5], [11, 0, 30], [12, 0, 10], [13, 0, 3000]]);
    socket.receive(envelope(MSG.T.GameListNew, 14, [[1, 0, GAME], [2, 0, 1], [3, 0, 0], ...ids.map((pid) => [4, 0, pid]), [5, 0, ids[1]], [6, 2, gameInfo]]));
    return ids;
  }, { count: seats, spectator, ME, GAME });
  if (stopAt === 'lobby') { await page.waitForTimeout(400); return ids; }
  await enterTable(page, { seats, spectator, board, turn });
  return ids;
}

// Second half of openTable: join (or watch) the listed game and deal the hand.
export async function enterTable(page, options = {}) {
  const { seats = 10, spectator = false, board = 'flop', turn = 'me' } = options;
  await page.evaluate(async ({ spectator, board, turn, ME, GAME }) => {
    const { Proto, MSG, socket, envelope, ids } = window.__fx;
    if (spectator) { await new Promise((r) => setTimeout(r, 50)); window.App.spectateGame(GAME); }
    socket.receive(envelope(MSG.T.JoinGameAck, 25, [[1, 0, GAME], [2, 0, 0]]));
    socket.receive(envelope(MSG.T.GameStartInitial, 39, [[1, 0, GAME], [2, 0, ids[1]], [3, 2, new Uint8Array(ids)]]));
    socket.receive(envelope(MSG.T.HandStart, 41, [[1, 0, GAME], ...(spectator ? [] : [[2, 2, Proto.encode([[1, 0, 12], [2, 0, 25]])]]), [4, 0, 10], [6, 0, ids[1]]]));
    socket.receive(envelope(MSG.T.PlayersActionDone, 45, [[1, 0, GAME], [2, 0, ids[1]], [3, 0, 0], [4, 0, 0], [5, 0, 20], [6, 0, 2980], [7, 0, 20], [8, 0, 20]]));
    socket.receive(envelope(MSG.T.PlayersActionDone, 45, [[1, 0, GAME], [2, 0, ids[0]], [3, 0, 0], [4, 0, 0], [5, 0, 10], [6, 0, 2990], [7, 0, 20], [8, 0, 20]]));
    socket.receive(envelope(MSG.T.DealFlop, 46, [[1, 0, GAME], [2, 0, 10], [3, 0, 22], [4, 0, 35]]));
    if (board === 'river') {
      socket.receive(envelope(MSG.T.DealTurn, 47, [[1, 0, GAME], [2, 0, 48]]));
      socket.receive(envelope(MSG.T.DealRiver, 48, [[1, 0, GAME], [2, 0, 3]]));
    }
    const first = turn === 'me' && !spectator ? ME : ids[spectator ? 0 : 1];
    socket.receive(envelope(MSG.T.PlayersTurn, 42, [[1, 0, GAME], [2, 0, first], [3, 0, board === 'river' ? 3 : 1]]));
  }, { spectator, board, turn, ME, GAME });
  await page.locator('#s-game.active').waitFor();
  await page.waitForFunction((count) => document.querySelectorAll('#g-seats .seat:not(.seat-ghost)').length === count, seats);
  await settle(page);
}
export const turnTo = (page, pid) => page.evaluate((p) => { const f = window.__fx;
  f.socket.receive(f.envelope(f.MSG.T.PlayersTurn, 42, [[1, 0, f.GAME], [2, 0, p], [3, 0, 1]])); }, pid);
export const acted = (page, pid) => page.evaluate((p) => { const f = window.__fx;
  f.socket.receive(f.envelope(f.MSG.T.PlayersActionDone, 45, [[1, 0, f.GAME], [2, 0, p], [3, 0, 1], [4, 0, 2], [5, 0, 0], [6, 0, 3000], [7, 0, 0], [8, 0, 20]])); }, pid);
export const dealTurn = (page, card) => page.evaluate((c) => { const f = window.__fx;
  f.socket.receive(f.envelope(f.MSG.T.DealTurn, 47, [[1, 0, f.GAME], [2, 0, c]])); }, card);

// ── Plan: PTH_MOBILE / PTH_DEVICES / PTH_ENGINE, engines launched per family,
// a missing engine is skipped with a notice. runDevice(browser, name, descriptor)
export async function runPlan(title, reporter, runDevice, matrix = MATRIX) {
  const family = (process.env.PTH_MOBILE || 'all').toLowerCase();
  const only = (process.env.PTH_DEVICES || '').split(',').map((s) => s.trim()).filter(Boolean);
  const plan = matrix.filter((d) => (family === 'all' || d.family === family) && (!only.length || only.includes(d.name)));
  only.filter((n) => !matrix.some((d) => d.name === n) && devices[n]).forEach((n) => plan.push({ name: n, family: /iphone|ipad/i.test(n) ? 'ios' : 'android' }));
  console.log(title + ' - ' + plan.map((d) => d.name).join(', '));
  let enginesRun = 0; const skipped = [];
  for (const fam of ['ios', 'android']) {
    const list = plan.filter((d) => d.family === fam); if (!list.length) continue;
    const forced = (process.env.PTH_ENGINE || '').toLowerCase();
    const [engineName, engine] = forced === 'chromium' ? ['chromium', chromium] : forced === 'webkit' ? ['webkit', webkit] : ENGINES[fam];
    let browser;
    try { browser = await engine.launch({ headless: true }); }
    catch (_error) { skipped.push(`${engineName} (${fam}): not installed - run "npx playwright install ${engineName}"`); continue; }
    enginesRun++;
    console.log(`\n== ${fam === 'ios' ? 'iOS profiles' : 'Android profiles'} - ${engineName} ${browser.version()} ==`);
    try {
      for (const d of list) {
        // PTH_VIEWPORT=734x400 overrides the viewport of every profile (keeps
        // DPR / touch / user agent): try an odd phone size, or find from which
        // height a layout problem appears.
        const m = /^(\d+)x(\d+)$/.exec(process.env.PTH_VIEWPORT || '');
        const descriptor = m ? { ...devices[d.name], viewport: { width: Number(m[1]), height: Number(m[2]) } } : devices[d.name];
        const label = m ? `${d.name} @${m[1]}x${m[2]}` : d.name;
        reporter.device = `${label} (${engineName})`;
        const vp = descriptor.viewport;
        console.log(`\n${label} - ${vp.width}x${vp.height} @${descriptor.deviceScaleFactor}x`);
        await runDevice(browser, label, descriptor);
        reporter.flush();
      }
    } finally { await browser.close(); }
  }
  skipped.forEach((s) => { console.log('\nSKIPPED ' + s); if (process.env.GITHUB_ACTIONS) console.log('::warning title=Engine skipped::' + s); });
  if (process.env.GITHUB_ACTIONS) console.log(`::notice title=${title}::${reporter.passed} passed, ${reporter.failed} failed`);
  console.log(`\n${reporter.passed} passed, ${reporter.failed} failed` + (SHOTS ? ' - screenshots in test-artifacts/mobile/' : ''));
  if (!enginesRun) { console.log('No browser engine available.'); return 2; }
  return reporter.failed ? 1 : 0;
}
