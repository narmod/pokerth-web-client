#!/usr/bin/env node
// Waiting room alerts (web.270) — modules/ui/wait-alert.mjs and the
// « 🔔 Notify me » button of the waiting room (modules/ui/lobby.mjs), in jsdom:
//   · tab in the background, Ranking table at 9/10 → « One more player! »
//     (notification + blinking title), once per table; 8/10 or a Normal
//     table → nothing;
//   · StartEvent with the tab in the background → « Your table is starting! »;
//   · tab in front, spectator, offline training → nothing;
//   · the button shows only for a seated non-host online player whose
//     browser has not answered yet, and asks on the click;
//   · the lobby no longer asks cold (msg-lobby.mjs), the module is precached.
// Run: node scripts/test-wait-alert.mjs   (needs jsdom)
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('  ✓ ' + label); } else { fail++; console.log('  ✗ ' + label); } }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const html = fs.readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://webclient.pokerth.net/', pretendToBeVisual: true });
const w = dom.window;
globalThis.window = w;
for (const k of ['document', 'localStorage', 'location', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'CustomEvent', 'Event',
  'MutationObserver', 'Node', 'HTMLElement', 'Element']) { try { globalThis[k] = w[k]; } catch (e) {} }
Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true, writable: true });
w.matchMedia = () => ({ matches: false, addListener() {}, addEventListener() {} });
globalThis.matchMedia = w.matchMedia;

// the browser's side: notifications, visibility
const shown = [];
let permission = 'default', asked = 0;
function FakeNotification(title, opts) { shown.push({ title, body: opts && opts.body }); }
FakeNotification.requestPermission = () => { asked++; permission = 'granted'; return Promise.resolve('granted'); };
Object.defineProperty(FakeNotification, 'permission', { get: () => permission });
w.Notification = FakeNotification;
let hidden = true;
Object.defineProperty(w.document, 'hidden', { get: () => hidden, configurable: true });
for (const k of Object.getOwnPropertyNames(w)) { if (k === 'performance' || k in globalThis) continue; try { globalThis[k] = w[k]; } catch (e) {} }

const { S } = await import(pathToFileURL(path.resolve('public/modules/game/state.mjs')).href);
const WA = await import(pathToFileURL(path.resolve('public/modules/ui/wait-alert.mjs')).href);
let present = 9;
w._gamePresentPids = () => Array.from({ length: present }, (_, i) => i + 1);
const table = (type) => { S.gId = 7; S._gameStarted = false; S._amSpectator = false; w._offlineMode = false; S.games = { 7: { type, maxPlayers: 10 } }; };

// ── 9/10 at a Ranking table, tab in the background ──
table(4); permission = 'granted';
WA.waitPlayerJoined();
await wait(50);
ok(shown.length === 1 && /One more player/.test(shown[0].title) && /9\/10/.test(shown[0].body), '9/10, tab hidden: « One more player! » — ' + JSON.stringify(shown[0] || {}));
ok(/One more player/.test(w.document.title), 'the tab title blinks with it');
WA.waitPlayerJoined();
await wait(50);
ok(shown.length === 1, 'told once per table');
hidden = false; w.document.dispatchEvent(new w.Event('visibilitychange'));
ok(w.document.title === S._origTitle, 'back in front: the title is restored');

// ── nothing when it is not « one more » or not ranked ──
shown.length = 0; hidden = true;
S.gId = 8; S.games = { 8: { type: 4, maxPlayers: 10 } }; present = 8;
WA.waitPlayerJoined(); await wait(50);
ok(shown.length === 0, '8/10: nothing yet');
S.games = { 8: { type: 1, maxPlayers: 10 } }; present = 9;
WA.waitPlayerJoined(); await wait(50);
ok(shown.length === 0, 'a Normal table (its host starts it): no « one more »');

// ── the table starts ──
WA.waitGameReady(); await wait(50);
ok(shown.length === 1 && /Your table is starting/.test(shown[0].title), 'StartEvent, tab hidden: « Your table is starting! »');
shown.length = 0;
hidden = false; WA.waitGameReady(); await wait(50);
ok(shown.length === 0, 'tab in front: no notification (the sound and the screen say it)');
hidden = true; S._amSpectator = true; WA.waitGameReady(); await wait(50);
ok(shown.length === 0, 'a spectator: nothing');
S._amSpectator = false; w._offlineMode = true; WA.waitGameReady(); await wait(50);
ok(shown.length === 0, 'offline training: nothing');
w._offlineMode = false;
permission = 'denied'; WA.waitGameReady(); await wait(50);
ok(shown.length === 0 && /Your table is starting/.test(w.document.title), 'notifications refused: the blinking title only');

// ── « 🔔 Notify me » ──
permission = 'default';
ok(WA.notifState() === 'default', 'not answered yet: default');
await WA.askNotify();
ok(asked === 1 && WA.notifState() === 'granted', 'the click asks the browser, once');
await WA.askNotify();
ok(asked === 1, 'answered: not asked again');

const lob = fs.readFileSync('public/modules/ui/lobby.mjs', 'utf8');
ok(/var notifyBtn = \(!isHost && !S\._amSpectator && !window\._offlineMode && notifState\(\) === 'default'\)/.test(lob)
  && /'waitingHintGuest'\)\) \+ notifyBtn \+ '<\/div>'/.test(lob), 'the waiting room button (end of the waiting hint): seated, not host, online, not answered yet');
const ml = fs.readFileSync('public/modules/net/msg-lobby.mjs', 'utf8');
ok(!/requestPermission/.test(ml), 'the lobby no longer asks cold');
const gj = fs.readFileSync('public/modules/net/msg-game-join.mjs', 'utf8');
ok(/try \{ waitPlayerJoined\(\); \} catch/.test(gj) && /try \{ waitGameReady\(\); \} catch/.test(gj), 'wired on GamePlayerJoined and StartEvent');
ok(fs.readFileSync('public/sw.js', 'utf8').includes("'/modules/ui/wait-alert.mjs',"), 'precached');
const en = (await import(pathToFileURL(path.resolve('public/modules/lang/en.mjs')).href));
const enS = en.strings || en.default || {};
ok(['notifStartTitle', 'notifStartBody', 'notifAlmostTitle', 'notifAlmostBody', 'wpNotify', 'wpNotifyTip'].every((k) => typeof enS[k] === 'string'), 'texts in the English catalogue');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
