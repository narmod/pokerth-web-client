#!/usr/bin/env node
// The Mini-games page, seen live on the admin board (web.144).
// Run: node scripts/test-arcade-presence.mjs
//
// public/modules/games/presence.mjs opens a notice channel (?notify=1&mode=
// arcade) while the page is open and tells the game on screen with « G:<id> ».
// The proxy side (mode kept, known game ids only) is in test-stats-world.mjs.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// A fake WebSocket that records what it is asked to do.
const made = [];
class FakeWS {
  constructor(url) { this.url = url; this.sent = []; this.readyState = 0; this.closed = false; made.push(this); }
  send(x) { this.sent.push(x); }
  close() { this.closed = true; this.readyState = 3; if (this.onclose) this.onclose(); }
  _open() { this.readyState = 1; if (this.onopen) this.onopen(); }
}
const timers = [];
globalThis.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
globalThis.clearTimeout = () => {};
globalThis.WebSocket = FakeWS;
globalThis.location = { protocol: 'https:', host: 'webclient.example.org' };
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true, writable: true });
const frames = [];
globalThis.window = { BUILD_VERSION: '2.1.11-web.144', _pthTimeZone: () => 'Europe/Paris', _handleCtrlFrame: (d) => { frames.push(d); return true; } };

const P = await import(pathToFileURL(join(root, 'public', 'modules', 'games', 'presence.mjs')).href);

ok(P.channelUrl() === 'wss://webclient.example.org/?notify=1&mode=arcade&v=2.1.11-web.144&tz=Europe%2FParis', 'the channel goes to the site that serves the app, in mode arcade');
ok(P.channelUrl({ protocol: 'http:', host: 'localhost:8080' }, {}) === 'ws://localhost:8080/?notify=1&mode=arcade', 'plain http dials ws, nothing optional added');

P.enter();
ok(made.length === 1 && P.state().want, 'opening the page dials once');
P.enter();
ok(made.length === 1, 'a second enter does not dial again');
P.setGame('tapis');
ok(made[0].sent.length === 0, 'nothing is sent before the socket is open');
made[0]._open();
ok(made[0].sent.join() === 'G:tapis', 'the game chosen before the socket opened is told on open');
P.setGame('');
ok(made[0].sent[1] === 'G:', 'back on the page’s home');
made[0].onmessage({ data: 'INFO::hello' });
ok(frames[0] === 'INFO::hello', 'an admin broadcast goes to the usual handler');

// A dropped socket is dialled again while the page is open.
made[0].onclose();
ok(timers.length === 1 && timers[0].ms === 15000, 'a dropped channel is tried again in 15 s');
timers.shift().fn();
ok(made.length === 2, 'and dials again');

// Leaving closes it for good.
P.leave();
ok(made[1].closed && !P.state().want, 'leaving the page closes the channel');
ok(timers.length === 0, 'and nothing is tried again');

// Offline: no dial, a slower retry.
navigator.onLine = false;
P.enter();
ok(made.length === 2 && timers.length === 1 && timers[0].ms === 30000, 'offline, no dial, a try again in 30 s');
P.leave();

// The wiring in the page's registry.
const idx = readFileSync(join(root, 'public', 'modules', 'games', 'index.mjs'), 'utf8');
ok(/import \* as presence from '\.\/presence\.mjs';/.test(idx), 'the registry imports it');
ok(/presence\.setGame\(id === HOME \? '' : id\);/.test(idx), 'every game switch tells the game on screen');
ok(/open = true;\s*\/\/[^\n]*\n\s*presence\.enter\(\);/.test(idx) && /finally \{ open = false; shellNow = null; presence\.leave\(\); \}/.test(idx), 'the page enters on launch and leaves when it closes');
const sw = readFileSync(join(root, 'public', 'sw.js'), 'utf8');
ok(sw.includes("'/modules/games/presence.mjs',"), 'precached for offline play');

console.log(fail ? 'FAILED ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
