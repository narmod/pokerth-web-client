#!/usr/bin/env node
// What assistants and AI crawlers read (GEO, web.157). Most AI fetchers run no
// JavaScript, so the raw HTML has to say what the site is:
//   1. the home page summary is a <noscript> fallback, never off-viewport text,
//      and the in-app privacy overlay no longer supplies the page's <h2> outline;
//   2. /llms-full.txt carries every guide page in Markdown, behind the same
//      gate as /llms.txt (SEO on and AI crawlers allowed), and /llms.txt links it;
//   3. the app entity's sameAs names the PokerTH Wikidata item and Wikipedia;
//   4. a guide path with a trailing slash or capitals redirects to the canonical one;
//   5. fonts are cached a month.
// Run: node scripts/test-seo-geo.mjs   (~10 s)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://example.org';
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };

function start(cfg) {
  const tmp = mkdtempSync(join(tmpdir(), 'pth-geo-'));
  writeFileSync(join(tmp, 'admin-config.json'), JSON.stringify(cfg));
  const port = 18000 + Math.floor(Math.random() * 900);
  const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(port)], {
    env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
  const get = (p) => new Promise((res, rej) => http.get({ host: '127.0.0.1', port, path: p }, (r) => {
    let b = ''; r.setEncoding('utf8'); r.on('data', (c) => b += c); r.on('end', () => res({ status: r.statusCode, headers: r.headers, body: b }));
  }).on('error', rej));
  const ready = async () => { for (let i = 0; i < 60; i++) { try { await get('/robots.txt'); return; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } } };
  const stop = () => { child.kill(); rmSync(tmp, { recursive: true, force: true }); };
  return { get, ready, stop };
}

const on = start({ seo: { enabled: true, publicUrl: BASE } });
try {
  await on.ready();
  // 1. Home page
  for (const q of ['', '?lang=fr']) {
    const h = (await on.get('/' + q)).body;
    ok(/<noscript><div id="seo-intro"><h2>[^<]+<\/h2>/.test(h), `/${q}: summary is a <noscript> fallback with its heading`);
    ok(h.indexOf('left:-9999px') === -1, `/${q}: no off-viewport text`);
    ok(!/<h2 data-i18n="pv/.test(h) && (h.match(/<h3 data-i18n="pv\w+H">/g) || []).length === 7, `/${q}: privacy overlay headings are <h3>, not the page outline`);
    ok((h.match(/<h1[\s>]/g) || []).length === 1, `/${q}: still exactly one <h1>`);
  }
  // 2. llms-full.txt
  const full = await on.get('/llms-full.txt');
  ok(full.status === 200 && /^text\/plain/.test(full.headers['content-type'] || ''), '/llms-full.txt: served as text');
  const srcs = (full.body.match(/^Source: https:\/\/example\.org\/[a-z-]+$/gm) || []);
  ok(srcs.length === 11, `/llms-full.txt: 11 guide pages (${srcs.length})`);
  ok(full.body.indexOf('Source: ' + BASE + '/competitions') === -1, '/llms-full.txt: the live calendar is left out');
  ok(/^# Texas Hold’em Poker Rules/m.test(full.body) && /^### Is PokerTH free\?/m.test(full.body), '/llms-full.txt: page and FAQ headings in Markdown');
  ok(/^\| --- \|/m.test(full.body), '/llms-full.txt: tables keep their separator line');
  ok(full.body.indexOf('<') === -1 || !/<\/?(p|div|h\d|a|li|table|td)[\s>]/.test(full.body), '/llms-full.txt: no HTML left');
  ok(full.body.indexOf('](' + BASE + '/') !== -1, '/llms-full.txt: internal links are absolute');
  const llms = (await on.get('/llms.txt')).body;
  ok(llms.indexOf(BASE + '/llms-full.txt') !== -1, '/llms.txt links /llms-full.txt');
  ok(llms.indexOf('2.8 million') !== -1 && llms.indexOf('https://en.wikipedia.org/wiki/PokerTH') !== -1, '/llms.txt: sourced history figure');
  // 3. sameAs
  const home = (await on.get('/')).body;
  const app = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
    .find((b) => Array.isArray(b['@type']) && b['@type'].includes('WebApplication'));
  ok(app && app.sameAs.includes('https://www.wikidata.org/wiki/Q182261') && app.sameAs.includes('https://en.wikipedia.org/wiki/PokerTH'), 'app entity sameAs: Wikidata Q182261 and Wikipedia');
  // 4. Redirects
  for (const [from, to] of [['/rules/', '/rules'], ['/Rules', '/rules'], ['/FAQ/?lang=de', '/faq?lang=de'], ['/Hand-Rankings', '/hand-rankings']]) {
    const r = await on.get(from);
    ok(r.status === 301 && r.headers.location === to, `${from} → 301 ${to}`);
  }
  ok((await on.get('/rules')).status === 200 && (await on.get('/not-a-page/')).status === 404, 'canonical path 200, unknown path still 404');
  // 5. Fonts
  const f = await on.get('/fonts/inter-latin-wght-normal.woff2');
  ok(/max-age=2592000/.test(f.headers['cache-control'] || ''), 'fonts cached a month');
} finally { on.stop(); }

// Gate: AI crawlers refused → no llms files.
const off = start({ seo: { enabled: true, publicUrl: BASE, aiCrawlers: false } });
try {
  await off.ready();
  ok((await off.get('/llms-full.txt')).status === 404 && (await off.get('/llms.txt')).status === 404, 'AI crawlers refused: /llms.txt and /llms-full.txt are 404');
} finally { off.stop(); }

console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
