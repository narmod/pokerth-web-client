#!/usr/bin/env node
// « Play on the web client » (service 0.36.0) in a real browser: the Arena
// run on its own (no proxy.js), linked to a web client (a sync with its
// address), a tournament, a registration on its page; the button carries the
// personal code in the link's fragment, and the web client's witness module
// (public/modules/arena-witness.mjs, takeHandoff) files it. Not linked, or
// without a code kept here: no button.
// Needs Chromium (Playwright). PW_CHROMIUM=<path> picks a binary; without a
// browser the test says so and stops without failing.
// Run: node arena/test/test-arena-play-browser.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ARENA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// The web client around (its witness module), when the Arena still lives in its repository.
const WITNESS = path.join(ARENA, '..', 'public', 'modules', 'arena-witness.mjs');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.log('No browser engine available (playwright missing): skipped.'); process.exit(0); }

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arena-play-'));
const env = Object.assign({}, process.env, { ARENA_DIR: tmp, ARENA_ADMIN_TOKEN: 'play-admin', ARENA_PORT: '0', ARENA_HOST: '127.0.0.1' });
for (const k of ['ARENA_SERVERS', 'ARENA_EVENTS_URL', 'ARENA_LINK_KEY', 'ARENA_WEBCLIENT_URL', 'ARENA_SECRET']) delete env[k];
const arena = spawn(process.execPath, [path.join(ARENA, 'server.mjs')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let out = '';
arena.stdout.on('data', (d) => { out += d; }); arena.stderr.on('data', (d) => { out += d; });
let port = 0;
for (let i = 0; i < 100 && !port; i++) { await wait(100); const m = /on http:\/\/127\.0\.0\.1:(\d+)/.exec(out); if (m) port = +m[1]; }
const base = 'http://127.0.0.1:' + port;
const A = { Authorization: 'Bearer play-admin', 'Content-Type': 'application/json' };
const admin = async (p, b) => (await fetch(base + '/admin/arena' + p, b ? { method: 'POST', headers: A, body: JSON.stringify(b) } : { headers: A })).json();

let browser = null;
const exe = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
try { browser = await chromium.launch(exe ? { executablePath: exe } : {}); } catch (e) { console.log('No browser engine available: skipped.'); arena.kill('SIGTERM'); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(0); }

try {
  ok(port > 0, 'the Arena runs on its own');
  const t = await admin('/t/create', { name: 'Saturday cup', profile: 'club', server: { ref: 'lan:1', name: 'Club', host: '10.0.0.5', port: 7234 }, startsAt: Date.now() + 2 * 3600e3 });
  ok(t && t.publicKey, 'a tournament');
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, locale: 'en-US' });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));

  // Not linked yet: registering gives a code, but no button.
  await pg.goto(base + '/arena/t/' + t.publicKey);
  await pg.waitForSelector('#regForm', { timeout: 8000 });
  await pg.fill('#regNick', 'Alice');
  await pg.click('#regForm button');
  await pg.waitForSelector('[data-copy]', { timeout: 8000 });
  const code = (/Your personal code: ([A-Z2-9]{8})/.exec(await pg.textContent('#view')) || [])[1];
  ok(!!code, 'registered, the personal code shown');
  ok(!(await pg.$('a.btn.primary[href*="#arena="]')), 'not linked to a web client: no « Play » button');

  // Linked: the web client sent its address.
  const link = await admin('/link');
  const sync = await (await fetch(base + '/arena/api/link/sync', { method: 'POST', headers: { Authorization: 'Bearer ' + link.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ url: 'https://webclient.example.org', version: '2.1.10-web.325', servers: [] }) })).json();
  ok(sync.ok, 'the web client is linked');
  await pg.reload();
  await pg.waitForSelector('a.btn.primary[href*="#arena="]', { timeout: 8000 });
  const href = await pg.getAttribute('a.btn.primary[href*="#arena="]', 'href');
  const label = (await pg.textContent('a.btn.primary[href*="#arena="]')).trim();
  ok(href.indexOf('https://webclient.example.org/#arena=') === 0 && label === 'Play on the web client', 'linked: « Play on the web client » leads to the linked web client');
  ok(await pg.getAttribute('a.btn.primary[href*="#arena="]', 'target') === '_blank', 'it opens in a new tab');
  if (fs.existsSync(WITNESS)) {
    const { takeHandoff } = await import(WITNESS);
    const store = new Map();
    const storage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
    const r = takeHandoff(new URL(href).hash, storage);
    const regs = JSON.parse(store.get('pth_td_regs') || '{}');
    ok(r && r.taken === 1 && r.rest === '' && regs[t.publicKey] && regs[t.publicKey][0].nick === 'Alice' && regs[t.publicKey][0].code === code, 'the web client files the code for this tournament, the fragment cleared');
  } else {
    // On its own: the payload as the web client reads it (#arena=<base64url JSON>).
    const data = JSON.parse(Buffer.from(new URLSearchParams(new URL(href).hash.slice(1)).get('arena'), 'base64url').toString('utf8'));
    ok(data.v === 1 && data.regs[t.publicKey][0].nick === 'Alice' && data.regs[t.publicKey][0].code === code, 'the link carries the code for this tournament (v1)');
  }
  ok(href.indexOf(code) < 0, 'the code is not readable as is in the link (encoded)');

  // Another browser, without the code: no button.
  const ctx2 = await browser.newContext({ locale: 'en-US' });
  const pg2 = await ctx2.newPage();
  await pg2.goto(base + '/arena/t/' + t.publicKey);
  await pg2.waitForSelector('#regForm', { timeout: 8000 });
  ok(!(await pg2.$('a.btn.primary[href*="#arena="]')), 'a browser without a code kept here: no button');

  // French: the label follows the language.
  const fr = (await import(path.join(ARENA, 'public', 'lang', 'fr.mjs'))).strings;
  await pg.click('#langBtn'); await pg.click('#langList li[data-lang="fr"]');
  await pg.waitForFunction(() => document.documentElement.lang === 'fr', null, { timeout: 8000 });
  await pg.waitForSelector('a.btn.primary[href*="#arena="]', { timeout: 8000 });
  ok((await pg.textContent('a.btn.primary[href*="#arena="]')).trim() === fr.playWebClient, 'in French: « ' + fr.playWebClient + ' »');
  ok(errors.length === 0, 'no page error' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally {
  await browser.close();
  arena.kill('SIGTERM');
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
