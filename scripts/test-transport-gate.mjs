#!/usr/bin/env node
// Internet transport « Via proxy » must hold even when /app-config is slow.
// Run: node scripts/test-transport-gate.mjs
//
// The client learns the admin's transport choice from /app-config
// (internetTransport). Until that answer arrives window._pthNetTransport is
// undefined, and the old test `_tr !== 'proxy'` read undefined as « direct »:
// a connect fired before the answer (an invite link auto-connects 350 ms
// after load; a quick click on a slow network) went straight to
// wss://www.pokerth.net/pthlive and showed up in the admin as a pokerth.net
// notice channel, although the instance is set to « Via proxy ».
// App.connect() now waits for /app-config to settle (bounded) first.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
// cfg: { delay, transport, fail } — what /app-config answers, and when.
const cfg = { delay: 0, transport: 'proxy', fail: false };
const server = createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  if (p === '/app-config') {
    setTimeout(() => {
      if (cfg.fail) { req.socket.destroy(); return; }
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify({ ok: true, internetTransport: cfg.transport, pokerthnetServer: { host: 'pokerth.net', port: 7234, tls: true } }));
    }, cfg.delay);
    return;
  }
  try {
    const rel = p === '/' ? 'pokerth-client.html' : decodeURIComponent(p).replace(/^\/+/, '');
    const f = normalize(join(root, rel));
    if (!f.startsWith(root) || !statSync(f).isFile()) throw 0;
    res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
    res.end(readFileSync(f));
  } catch (_e) { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };
const browser = await chromium.launch();

// Every WebSocket the page opens is recorded and never reaches the network.
function recorder() {
  window.__ws = [];
  class RecSocket extends EventTarget {
    static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
    constructor(url) { super(); this.url = String(url); this.readyState = 0; window.__ws.push(this.url); }
    send() {} close() { this.readyState = 3; }
  }
  window.WebSocket = RecSocket;
  // A returning guest of pokerth.net, as the login form remembers one: the
  // « Guest » box ticked for the Internet mode, and a guest name.
  try { localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_no_count', '1');
    localStorage.setItem('pth_server_mode', 'pokerthnet'); localStorage.setItem('pth_guest_inet', '1'); localStorage.setItem('pth_guest_name', 'GateTester'); } catch (_e) {}
}
// Guest on pokerth.net, connect fired as soon as the app can take it — the
// invite-link path — so the answer of /app-config is not there yet.
async function run(label, opts) {
  Object.assign(cfg, { delay: 0, transport: 'proxy', fail: false }, opts.cfg);
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  await ctx.addInitScript(recorder);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.App && typeof window.App.connect === 'function' && document.getElementById('server-mode'));
  await page.evaluate(() => {
    // As a player would: the visible « Guest » box, then the form re-derives.
    const sm = document.getElementById('server-mode'); sm.value = 'pokerthnet';
    const gc = document.getElementById('guest-mode-cb'); if (gc) gc.checked = true;
    window.App.onServerOrGuestChange();
    window._swReadyOnce = true;   // the SW gate (≤1.5 s) is not what is under test
    window.App.connect();
  });
  await page.waitForTimeout(opts.wait);
  const urls = await page.evaluate(() => window.__ws.slice());
  if (process.env.DBG) console.log(label, JSON.stringify(await page.evaluate(() => ({ tr: window._pthNetTransport, lm: (document.getElementById('login-mode') || {}).value, nick: document.getElementById('nick').value }))), JSON.stringify(urls));
  await ctx.close();
  return { urls, errors };
}
const isDirect = (u) => /^wss:\/\/www\.pokerth\.net/.test(u);
const isProxy = (u) => u.indexOf(base.replace('http', 'ws').replace(/\/$/, '')) === 0 && /[?&]mode=pthnet/.test(u) && !/notify=1/.test(u);

{ // slow /app-config, « Via proxy »: wait, then go through the proxy
  const r = await run('slow proxy', { cfg: { delay: 2500, transport: 'proxy' }, wait: 4000 });
  ok(r.urls.length > 0, 'slow /app-config: a connection is opened once it answers (' + r.urls.length + ')');
  ok(!r.urls.some(isDirect), 'slow /app-config set to « Via proxy »: never a direct socket to pokerth.net');
  ok(r.urls.some(isProxy), 'the game socket goes through the proxy (mode=pthnet)');
  ok(!r.urls.some((u) => /notify=1/.test(u)), 'and no notice channel is opened (the game socket carries the broadcasts)');
  ok(!r.errors.length, 'no page error' + (r.errors.length ? ': ' + r.errors[0] : ''));
}
{ // nothing opened while /app-config is still pending
  const r = await run('pending', { cfg: { delay: 3000, transport: 'proxy' }, wait: 1500 });
  ok(r.urls.length === 0, 'while /app-config is pending, connect waits (no socket yet)');
}
{ // « Direct »: unchanged behaviour
  const r = await run('direct', { cfg: { delay: 300, transport: 'direct' }, wait: 2000 });
  ok(r.urls.some(isDirect), '« Direct » still goes straight to pokerth.net');
  ok(r.urls.some((u) => /notify=1/.test(u) && /mode=pthnet/.test(u)), 'with its notice channel, as before');
}
{ // /app-config unreachable: bounded wait, then the historical default
  const t0 = Date.now();
  const r = await run('down', { cfg: { delay: 0, fail: true }, wait: 2500 });
  ok(r.urls.length > 0 && Date.now() - t0 < 15000, '/app-config unreachable: connect is not blocked');
}
{ // a very slow answer: the wait is bounded
  const r = await run('very slow', { cfg: { delay: 9000, transport: 'proxy' }, wait: 6000 });
  ok(r.urls.length > 0, 'an answer slower than the cap does not hold the player forever');
}

await browser.close();
server.close();
console.log(fail ? `FAIL ${fail}/${pass + fail}` : `OK ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
