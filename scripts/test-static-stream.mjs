#!/usr/bin/env node
// Deterministic tests for _pipeFile() in proxy.js — the static-file stream.
// Run: node scripts/test-static-stream.mjs
//
// A ReadStream 'error' with no listener is thrown as an uncaught exception and
// proxy.js has no uncaughtException handler, so a file that disappeared
// between the 5-second stat cache and the open (deploy, disk hiccup) used to
// crash the whole proxy. _pipeFile must abort only that response, keep the
// process alive, and close the stream when the client leaves.
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}

// ── Source guards ────────────────────────────────────────────────
const m = src.match(/\nfunction _pipeFile\(res, filePath, opts\) \{[\s\S]*?\n\}\n/);
ok(!!m, '_pipeFile is still declared in proxy.js');
if (!m) { console.log('\nFAIL ' + fails); process.exit(1); }
const streams = src.match(/createReadStream\(/g) || [];
ok(streams.length === 1, 'createReadStream is only called inside _pipeFile (found ' + streams.length + ')');
ok(!/\.pipe\(res\)/.test(src.replace(m[0], '')), 'no bare .pipe(res) left outside _pipeFile');

// ── Behaviour ────────────────────────────────────────────────────
const logs = [];
const fakeConsole = { error: (s) => logs.push(String(s)) };
const _pipeFile = new Function('fs', 'console', m[0] + '\nreturn _pipeFile;')(fs, fakeConsole);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pth-stream-'));
const good = path.join(dir, 'good.bin');
const body = Buffer.alloc(200000, 7);
fs.writeFileSync(good, body);
const gone = path.join(dir, 'gone.bin');   // never created: stat said it existed, the open fails

let uncaught = null;
process.on('uncaughtException', (e) => { uncaught = e; });

const server = http.createServer((req, res) => {
  const file = req.url === '/good' ? good : gone;
  // Same order as sendFile: headers (with the size the stat cache gave) first.
  res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': body.length });
  _pipeFile(res, file);
});

function get(p) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: server.address().port, path: p }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks), aborted: false }));
      res.on('aborted', () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks), aborted: true }));
      res.on('error', () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks), aborted: true }));
    });
    req.on('error', () => resolve({ status: 0, buf: Buffer.alloc(0), aborted: true }));
    // A response that is neither completed nor aborted hangs forever: fail it.
    req.setTimeout(3000, () => { req.destroy(); resolve({ status: -1, buf: Buffer.alloc(0), aborted: false }); });
  });
}

server.listen(0, '127.0.0.1', async () => {
  const a = await get('/good');
  ok(!a.aborted && a.buf.equals(body), 'an existing file is streamed whole');

  const b = await get('/gone');
  await new Promise((r) => setTimeout(r, 50));
  ok(b.aborted, 'a file gone before the open aborts that response');
  ok(uncaught === null, 'the process survives (no uncaught exception)' + (uncaught ? ': ' + uncaught.message : ''));
  ok(logs.some((l) => l.indexOf('read failed') !== -1 && l.indexOf('ENOENT') !== -1), 'the failure is logged with its code');

  const c = await get('/good');
  ok(!c.aborted && c.buf.equals(body), 'the server still answers afterwards');

  server.close();
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
  console.log(fails ? '\nFAIL ' + fails : '\nOK');
  process.exit(fails ? 1 : 0);
});
