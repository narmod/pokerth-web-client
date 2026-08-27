// Regression guard — reconnect backoff must actually back off.
//
// Bug (proxy logs, 2026-08-27): a target that hangs up right after its
// Announce made the client retry every 5 s forever. Both reconnect paths
// reset S._reconnectAttempts inside ws.onmessage, and the Announce always
// arrives, so the backoff never advanced past its first step. The server
// eventually answered blockedByServer.
//
// Two checks:
//   1. neither reconnect onmessage handler resets the attempt counter;
//   2. _armReconnectStable only clears the counter when the SAME socket is
//      still OPEN when the timer fires.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../public/pokerth.js', import.meta.url), 'utf8');

// ── 1. no reset inside the reconnect onmessage handlers ──
const handlers = [...src.matchAll(/S\.ws\.onmessage = function\(e\) \{([\s\S]*?)\n\s*\};/g)]
  .map(m => m[1])
  .filter(body => body.includes('_reconnectAttempts'));
assert.ok(handlers.length >= 2, 'expected both reconnect onmessage handlers to be found');
for (const body of handlers)
  assert.ok(!/_reconnectAttempts\s*=\s*0/.test(body),
    'ws.onmessage must not reset _reconnectAttempts (the Announce is not a success)');

// ── 2. both reconnect onopen handlers arm the stability timer ──
const opens = [...src.matchAll(/S\.ws\.onopen = function\(\) \{([\s\S]*?)\};/g)].map(m => m[1]);
const armed = opens.filter(b => b.includes('_armReconnectStable()'));
assert.equal(armed.length, 2, 'both reconnect onopen handlers must arm _armReconnectStable');

// ── 3. behaviour of _armReconnectStable, executed for real ──
const fn = src.match(/function _armReconnectStable\(\) \{[\s\S]*?\n  \}/);
assert.ok(fn, '_armReconnectStable not found');
const timers = [];
const win = { _reconnectStableTimer: null };
const sandbox = {
  window: win,
  clearTimeout: () => {},
  setTimeout: (cb) => { timers.push(cb); return timers.length; },
  WebSocket: { OPEN: 1 },
};
const konst = src.match(/const RECONNECT_STABLE_MS = \d+;/);
assert.ok(konst, 'RECONNECT_STABLE_MS not found');
const make = (S) => new Function('window', 'clearTimeout', 'setTimeout', 'WebSocket', 'S',
  konst[0] + '\n' + fn[0] + '; return _armReconnectStable;')(
  sandbox.window, sandbox.clearTimeout, sandbox.setTimeout, sandbox.WebSocket, S);

// same socket, still open → counter cleared
let S1 = { ws: { readyState: 1 }, _reconnectAttempts: 3 };
make(S1)();
timers.pop()();
assert.equal(S1._reconnectAttempts, 0, 'a socket still open after the delay counts as success');

// socket replaced in the meantime → counter untouched
let S2 = { ws: { readyState: 1 }, _reconnectAttempts: 3 };
const arm2 = make(S2);
arm2();
S2.ws = { readyState: 1 }; // a later attempt swapped the socket
timers.pop()();
assert.equal(S2._reconnectAttempts, 3, 'a superseded socket must not clear the counter');

// socket died before the delay → counter untouched, backoff keeps growing
let S3 = { ws: { readyState: 1 }, _reconnectAttempts: 3 };
const arm3 = make(S3);
arm3();
S3.ws = null;
timers.pop()();
assert.equal(S3._reconnectAttempts, 3, 'a socket that closed early must not clear the counter');

console.log('test-reconnect-backoff: OK');
