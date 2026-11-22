#!/usr/bin/env node
// Reconnect hold (modules/net/reconn-hold.mjs, web.152): game server restarts
// (proxy close 4504) and lost Internet must not burn the 6 reconnect attempts.
// Executed for real with fake timers and a fake window/navigator.
// Run: node scripts/test-reconn-hold.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// ── minimal browser globals ──
const timers = [];
let now = 1_000_000;
const listeners = {};
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.document = { documentElement: { lang: 'en' }, getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {}, body: { classList: { toggle() {}, add() {}, remove() {}, contains: () => false } } };
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true, language: 'en' }, configurable: true, writable: true });
globalThis.addEventListener = (n, f) => { (listeners[n] = listeners[n] || []).push(f); };
globalThis.removeEventListener = (n, f) => { listeners[n] = (listeners[n] || []).filter((x) => x !== f); };
globalThis.setTimeout = (cb, ms) => { timers.push({ cb, ms, kind: 't' }); return timers.length; };
globalThis.clearTimeout = () => {};
globalThis.setInterval = (cb, ms) => { timers.push({ cb, ms, kind: 'i' }); return timers.length; };
globalThis.clearInterval = () => {};
Date.now = () => now;
const banners = [];
globalThis._showBanner = (m) => banners.push(m);

const { S } = await import('../public/modules/game/state.mjs');
const H = (await import('../public/modules/net/reconn-hold.mjs')).default;

let opened = 0, failed = null;
const deps = { open: () => { opened++; }, fail: (m) => { failed = m; } };
const lastTimeout = () => [...timers].reverse().find((x) => x.kind === 't');

// 1. classification
assert.equal(H.kindOf({ code: 4504 }, true), 'server');
assert.equal(H.kindOf({ code: 1006 }, false), 'offline');
assert.equal(H.kindOf({ code: 1006 }, true), '');
assert.equal(H.kindOf({ code: 4503 }, true), '', '4503 = proxy at capacity, not a server outage');
assert.equal(H.kindOf(undefined, undefined), '');

// 2. jitter stays within 20 s ± 5 s
for (const r of [0, 0.25, 0.5, 0.9999]) {
  const d = H.nextDelay(r);
  assert.ok(d >= 15000 && d <= 25000, 'delay in range: ' + d);
}
assert.equal(H.nextDelay(0.5), 20000);

// 3. ordinary close → not held, usual backoff keeps control
assert.equal(H.hold({ code: 1006 }, deps), false);

// 4. server down → held, attempts held at 1, retry scheduled, banner shown
S._reconnectAttempts = 4;
assert.equal(H.hold({ code: 4504 }, deps), true);
assert.equal(S._reconnectAttempts, 1, 'attempt counter no longer burns');
assert.ok(banners.length > 0, 'banner shown');
const t1 = lastTimeout();
assert.ok(t1.ms >= 15000 && t1.ms <= 25000, 'retry in 20 s ± 5 s');
t1.cb();
assert.equal(opened, 1, 'retry rebinds');

// 5. still down after 29 min → still waiting; after 30 min → gives up once
now += 29 * 60 * 1000;
assert.equal(H.hold({ code: 4504 }, deps), true);
assert.equal(failed, null, 'not yet expired at 29 min');
now += 61 * 1000;
assert.equal(H.hold({ code: 4504 }, deps), true);
assert.ok(failed !== null, 'gives up after 30 min');
assert.equal(H.outageSince(), 0, 'outage cleared after giving up');

// 6. a stable link ends the outage: the next 4504 starts a fresh 30 min
failed = null;
H.hold({ code: 4504 }, deps);
const start = H.outageSince();
assert.ok(start > 0);
H.reset();
assert.equal(H.outageSince(), 0);

// 7. offline → waits for « online », then rebinds once
navigator.onLine = false;
opened = 0;
assert.equal(H.hold({ code: 1006 }, deps), true);
assert.equal((listeners.online || []).length, 1, 'listens for the network to come back');
navigator.onLine = true;
listeners.online[0]();
assert.equal((listeners.online || []).length, 0, 'listener removed once fired');
lastTimeout().cb();
assert.equal(opened, 1, 'rebinds after the network came back');

// 8. every new UI string exists in every language file
const langDir = new URL('../public/modules/lang/', import.meta.url);
const { readdirSync } = await import('node:fs');
const files = readdirSync(langDir).filter((f) => f.endsWith('.mjs') && f !== 'index.mjs');
const keys = ['srvDownBanner', 'srvDownGaveUp', 'netOfflineBanner'];
for (const f of files) {
  const src = readFileSync(new URL(f, langDir), 'utf8');
  if (!/export const strings\s*=/.test(src)) continue;
  for (const k of keys) assert.ok(new RegExp('\\b' + k + '\\s*:').test(src), f + ': missing ' + k);
  const m = src.match(/srvDownBanner\s*:\s*'((?:\\.|[^'\\])*)'/);
  assert.ok(m && m[1].indexOf('{s}') !== -1, f + ': srvDownBanner must keep the {s} countdown');
}

// 9. wiring in the page
const html = readFileSync(new URL('../public/pokerth-client.html', import.meta.url), 'utf8');
assert.ok(html.includes('<script type="module" src="modules/net/reconn-hold.mjs"></script>'), 'module loaded by the page');
const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
assert.ok(sw.includes("'/modules/net/reconn-hold.mjs'"), 'module precached');
const app = readFileSync(new URL('../public/pokerth.js', import.meta.url), 'utf8');
assert.equal((app.match(/App\._reconnectHold\((e|ev)\)/g) || []).length, 2, 'both reconnect paths consult the hold');
assert.equal((app.match(/_reconnectContinue\(ev\)/g) || []).length, 3, 'close events are handed on');

console.log('ALL OK — reconnect hold: ' + files.length + ' language files checked');
