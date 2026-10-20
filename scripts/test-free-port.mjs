#!/usr/bin/env node
// Tests for scripts/lib/free-port.mjs, the helper every proxy-spawning test uses
// to get its port and to wait for its server.  Run: node scripts/test-free-port.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { freePort, waitForServer } from './lib/free-port.mjs';

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };

// A port from the OS can be bound right away, and two calls do not collide
// while the first one is in use.
const p1 = await freePort();
ok(Number.isInteger(p1) && p1 > 0 && p1 < 65536, 'freePort returns a TCP port (' + p1 + ')');
const srv = http.createServer((req, res) => { res.writeHead(req.url.startsWith('/__ver') ? 200 : 404); res.end('ok'); });
await new Promise((r) => srv.listen(p1, '127.0.0.1', r));
ok(srv.listening, 'the port can be bound');
const p2 = await freePort();
ok(p2 !== p1, 'a second call while the first port is taken gives another port');

// waitForServer resolves once the server answers…
let t0 = Date.now();
await waitForServer('http://127.0.0.1:' + p1, null, 5000);
ok(Date.now() - t0 < 2000, 'waitForServer returns as soon as the server answers');
srv.close();

// …rejects quickly when the spawned process dies first (port taken, crash)…
const dead = spawn(process.execPath, ['-e', 'process.exit(3)'], { stdio: 'ignore' });
let err = null; t0 = Date.now();
try { await waitForServer('http://127.0.0.1:' + p2, dead, 10000); } catch (e) { err = e; }
ok(err && /exited before answering \(code 3\)/.test(err.message) && Date.now() - t0 < 5000, 'a server that exits fails fast with its exit code');

// …and gives up after its timeout when nothing ever answers.
err = null; t0 = Date.now();
try { await waitForServer('http://127.0.0.1:' + p2, null, 800); } catch (e) { err = e; }
ok(err && /did not answer within 800 ms/.test(err.message), 'nothing listening: rejects after the timeout');

console.log(fail ? `\n${fail}/${n} FAILED` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
