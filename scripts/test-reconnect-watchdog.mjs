#!/usr/bin/env node
// Deterministic tests for the connect watchdog on a transparent reattach.
// Run: node scripts/test-reconnect-watchdog.mjs
//
// _beginConnecting arms a 20 s timer that fires connectSlow -- "connection is
// taking a while... retry if needed". _endConnecting disarms it, but it only
// runs on InitAck or when the socket closes. connect({preserve:true}) reattaches
// to a PokerTH session the proxy kept alive: no Init is replayed, so no InitAck
// comes back and the socket never closed. The timer therefore fired ~20 s after
// a reconnection that had already succeeded, mirroring an error toast over the
// action bar in the middle of a hand.
//
// The rule tested here: on a preserve attempt, the first received frame is the
// acknowledgement, and it disarms the watchdog.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rd = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');
const state = rd('public', 'modules', 'game', 'state.mjs');
const session = rd('public', 'modules', 'net', 'session.mjs');
const main = rd('public', 'pokerth.js');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

// ── The flag exists and starts clean ──────────────────────────────
ok(/_preserveConnect:\s*false,/.test(state), 'the state carries _preserveConnect, off by default');

// ── connect() marks the attempt before arming the watchdog ────────
const armed = main.indexOf('_beginConnecting();');
ok(armed > 0, 'connect() still arms the watchdog where the test expects it');
const before = main.slice(Math.max(0, armed - 400), armed);
ok(/S\._preserveConnect\s*=\s*_preserve;/.test(before),
   'the attempt is flagged as preserve before the watchdog is armed');

// ── _endConnecting clears it, so the flag never outlives an attempt
const ec = session.indexOf('function _endConnecting()');
ok(ec > 0, '_endConnecting is still where the test expects it');
const ecBody = session.slice(ec, session.indexOf('\n}', ec) + 2);
ok(/S\._connectingNow\s*=\s*false;/.test(ecBody), '_endConnecting still frees the attempt');
ok(/S\._preserveConnect\s*=\s*false;/.test(ecBody), 'and clears the preserve flag with it');

// ── onRawData disarms on the first frame of a preserve attempt ────
const ord = main.indexOf('function onRawData(');
ok(ord > 0, 'onRawData is still where the test expects it');
const ordHead = main.slice(ord, ord + 2000);
ok(/if\s*\(S\._preserveConnect\s*&&\s*S\._connectingNow\)\s*_endConnecting\(\);/.test(ordHead),
   'a received frame disarms the watchdog of a transparent reattach');
// The disarm must not fire on an ordinary login: there the watchdog has to keep
// covering the whole auth handshake, otherwise a re-click during it tears down
// the in-flight socket and the server blocks the IP.
ok(!/if\s*\(S\._connectingNow\)\s*_endConnecting\(\);/.test(ordHead),
   'but never on an ordinary login, whose handshake stays covered');

// ── Behaviour of the guard, both ways ─────────────────────────────
const guard = (S) => (S._preserveConnect && S._connectingNow);
ok(guard({ _preserveConnect: true, _connectingNow: true }) === true,
   'preserve attempt still pending -> disarm');
ok(guard({ _preserveConnect: false, _connectingNow: true }) === false,
   'ordinary login pending -> leave the watchdog armed');
ok(!guard({ _preserveConnect: true, _connectingNow: false }),
   'already resolved -> nothing to disarm');

// ── The message that was leaking is now connect-screen only ───────
ok(/setStatus\(t\('connectSlow'\), 'err', null, \{ local: true \}\)/.test(session),
   'connectSlow is no longer mirrored away from the connect screen');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
