#!/usr/bin/env node
// server/start-ack.js — the bridge acknowledges a table start for a browser
// that cannot (asleep, closed, in grace), so the table does not wait 20 s
// (server log 26–28/11: 14 of 17 start timeouts were web players).
// Run: node scripts/test-proxy-start-ack.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const SA = require('../server/start-ack.js');
const { Proto } = await import('../public/modules/net/proto.mjs');
const { MSG } = await import('../public/modules/net/messages.mjs');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const T = MSG.T;
const startEvent = (gid) => Buffer.from(Proto.encode([[1, 0, T.StartEvent], [37, 2, Proto.encode([[1, 0, gid], [2, 0, 0], [3, 0, 0]])]]));
const browserAck = (gid) => Buffer.from(MSG.buildStartEventAck(gid));
const typeOnly = (t) => Buffer.from(Proto.encode([[1, 0, t]]));

// Frame and parsing agree with the client's own builder.
const f = SA.ackFrame(1913);
ok(f.readUInt32BE(0) === f.length - 4 && Buffer.compare(f.subarray(4), browserAck(1913)) === 0, 'ackFrame = length prefix + MSG.buildStartEventAck');
ok(SA.ackFrame(300).subarray(4).equals(browserAck(300)) && SA.ackFrame(2).subarray(4).equals(browserAck(2)), 'ackFrame matches for 1- and 2-byte game ids');
ok(SA.gameIdOf(startEvent(1913), SA.T_START_EVENT) === 1913 && SA.gameIdOf(browserAck(1913), SA.T_START_EVENT_ACK) === 1913, 'gameIdOf reads StartEvent and StartEventAck');
ok(SA.gameIdOf(typeOnly(T.HandStart), SA.T_START_EVENT) === null && SA.gameIdOf(Buffer.from([0xff, 0xff]), SA.T_START_EVENT) === null, 'gameIdOf: other or broken messages → null');

// No browser attached: acknowledged at once, and the late browser ack is dropped once.
{
  const st = {}, out = [];
  SA.onServerPayload(st, startEvent(7), false, (x) => { out.push(x); return true; });
  ok(out.length === 1 && SA.gameIdOf(out[0].subarray(4), SA.T_START_EVENT_ACK) === 7, 'detached browser → immediate StartEventAck');
  ok(SA.onBrowserPayload(st, browserAck(7)) === true, 'the browser’s own ack for that game is dropped');
  ok(SA.onBrowserPayload(st, browserAck(7)) === false, '…only once');
}
// Browser attached and answering: nothing sent by the bridge.
{
  const st = { delayMs: 60 }, out = [];
  SA.onServerPayload(st, startEvent(8), true, (x) => { out.push(x); return true; });
  ok(SA.onBrowserPayload(st, browserAck(8)) === false, 'live browser ack is forwarded');
  await wait(100);
  ok(out.length === 0, 'live browser answered → no bridge ack');
}
// Browser attached but frozen: the bridge answers after the delay.
{
  const st = { delayMs: 60 }, out = [];
  SA.onServerPayload(st, startEvent(9), true, (x) => { out.push(x); return true; });
  ok(out.length === 0, 'attached browser: no immediate ack');
  await wait(100);
  ok(out.length === 1 && SA.onBrowserPayload(st, browserAck(9)) === true, 'silent browser → ack after the delay, its late ack dropped');
}
// The game started, or we were removed, before the delay: nothing to acknowledge.
for (const [t, label] of [[T.GameStartInitial, 'game started'], [29, 'removed from the game']]) {
  const st = { delayMs: 60 }, out = [];
  SA.onServerPayload(st, startEvent(10), true, (x) => { out.push(x); return true; });
  SA.onServerPayload(st, typeOnly(t), true, (x) => { out.push(x); return true; });
  await wait(100);
  ok(out.length === 0, `${label} before the delay → no ack (it would reach the lobby)`);
}
// Upstream gone: nothing recorded, the browser ack is not swallowed.
{
  const st = {};
  SA.onServerPayload(st, startEvent(11), false, () => false);
  ok(SA.onBrowserPayload(st, browserAck(11)) === false, 'write failed → browser ack still forwarded');
}
// dispose cancels a pending timer.
{
  const st = { delayMs: 40 }, out = [];
  SA.onServerPayload(st, startEvent(12), true, (x) => { out.push(x); return true; });
  SA.dispose(st);
  await wait(80);
  ok(out.length === 0, 'dispose → no ack after the session is gone');
}

console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
