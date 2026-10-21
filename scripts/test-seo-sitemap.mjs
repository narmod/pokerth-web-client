#!/usr/bin/env node
// /sitemap.xml is a sitemap index (web.239): one child per content page and
// one for / with its language variants, each with its own <lastmod>. The
// single file had reached 8.5 MB and was fetched whole on every crawl.
// Checks: the index lists every child, each child answers and is well
// formed, the dates match seo-i18n/article-dates.json, nothing is listed
// twice, the URL count matches IndexNow's list, responses are compressed and
// answer If-None-Match with 304, and an unknown child is a 404.
// Run: node scripts/test-seo-sitemap.mjs   (~5 s)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import http from 'node:http';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dates = JSON.parse(readFileSync(join(root, 'seo-i18n', 'article-dates.json'), 'utf8'));
const BASE = 'https://example.org';
const PAGES = ['/rules', '/faq', '/hand-rankings', '/how-to-play', '/glossary', '/competitions', '/play-with-friends',
  '/poker-odds', '/play-against-computer', '/starting-hands', '/accessibility', '/host-a-server', '/privacy'];
const tmp = mkdtempSync(join(tmpdir(), 'pth-sm-'));
writeFileSync(join(tmp, 'admin-config.json'), JSON.stringify({ seo: { enabled: true, publicUrl: BASE } }));
const PORT = 18000 + Math.floor(Math.random() * 900);
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
  env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
const req = (p, headers = {}) => new Promise((res, rej) => http.get({ host: '127.0.0.1', port: PORT, path: p, headers }, (r) => {
  const ch = []; r.on('data', (c) => ch.push(c)); r.on('end', () => res({ status: r.statusCode, headers: r.headers, buf: Buffer.concat(ch) }));
}).on('error', rej));
const text = (r) => r.buf.toString('utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
const ISO = /^\d{4}-\d{2}-\d{2}$/;
try {
  for (let i = 0; i < 60; i++) { try { await req('/robots.txt'); break; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } }
  // /privacy's translations come from the app catalogs, loaded in the
  // background on first use: wait until they are in.
  for (let i = 0; i < 40 && !/hreflang="fr"/.test(text(await req('/privacy'))); i++) await new Promise((r) => setTimeout(r, 250));
  const idx = await req('/sitemap.xml');
  const ix = text(idx);
  ok(idx.status === 200 && /^<\?xml[^>]*>\n<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(ix) && /<\/sitemapindex>\n$/.test(ix), '/sitemap.xml is a sitemap index');
  const kids = [...ix.matchAll(/<sitemap><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/sitemap>/g)].map((m) => ({ loc: m[1], lastmod: m[2] }));
  const want = ['home'].concat(PAGES.map((p) => p.slice(1)));
  ok(JSON.stringify(kids.map((k) => k.loc)) === JSON.stringify(want.map((s) => BASE + '/sitemap-' + s + '.xml')), `index lists the ${want.length} child sitemaps, each with a <lastmod>`);
  ok(kids.every((k) => ISO.test(k.lastmod)), 'every <lastmod> is a day (YYYY-MM-DD)');
  ok(PAGES.every((p) => !dates[p] || kids.find((k) => k.loc.endsWith('/sitemap-' + p.slice(1) + '.xml')).lastmod === dates[p].modified), 'dated pages: the index carries the day from seo-i18n/article-dates.json');
  const all = []; let big = 0, badShape = [], badLm = [];
  for (const k of kids) {
    const r = await req(k.loc.slice(BASE.length)), x = text(r);
    big = Math.max(big, r.buf.length);
    if (r.status !== 200 || !/^<\?xml[^>]*>\n<urlset [^>]*>\n/.test(x) || !/<\/urlset>\n$/.test(x)) badShape.push(k.loc);
    const urls = [...x.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)];
    if (!urls.length || urls.some((u) => u[2] !== k.lastmod)) badLm.push(k.loc);
    urls.forEach((u) => all.push(u[1]));
  }
  ok(!badShape.length, 'every child answers 200 with a well-formed <urlset>' + (badShape.length ? ' — ' + badShape.join(' ') : ''));
  ok(!badLm.length, 'each child: every <url> carries the child\'s <lastmod>' + (badLm.length ? ' — ' + badLm.join(' ') : ''));
  ok(new Set(all).size === all.length, `no URL listed twice (${all.length} URLs)`);
  const nl = Object.keys(require(join(root, 'seo-i18n', 'competitions.js'))).length + 1;
  ok(all.length === nl * (PAGES.length + 1), `${all.length} URLs: ${nl} languages × ${PAGES.length + 1} pages`);
  ok(all.filter((u) => u === BASE + '/' || u.startsWith(BASE + '/?lang=')).length >= 83, 'the home child lists / and its language variants');
  ok(PAGES.every((p) => all.includes(BASE + p) && all.some((u) => u.startsWith(BASE + p + '?lang='))), 'every page child lists the page and its translations');
  ok(big < 1.5e6, `largest child ${(big / 1e6).toFixed(2)} MB (was one 8.5 MB file)`);
  // HTTP: compression, ETag / 304, Last-Modified, 404.
  const gz = await req('/sitemap-rules.xml', { 'accept-encoding': 'gzip' });
  const plain = await req('/sitemap-rules.xml');
  ok(gz.headers['content-encoding'] === 'gzip' && gunzipSync(gz.buf).equals(plain.buf) && gz.buf.length < plain.buf.length / 5, `gzip: ${plain.buf.length} → ${gz.buf.length} bytes`);
  const br = await req('/sitemap.xml', { 'accept-encoding': 'br, gzip' });
  ok(br.headers['content-encoding'] === 'br', 'brotli when offered');
  const tag = plain.headers.etag;
  const nm = await req('/sitemap-rules.xml', { 'if-none-match': tag });
  ok(tag && nm.status === 304 && !nm.buf.length, '304 on a matching If-None-Match');
  ok((await req('/sitemap-rules.xml', { 'if-none-match': '"other"' })).status === 200, '200 when the ETag differs');
  ok(plain.headers['last-modified'] === new Date(dates['/rules'].modified + 'T00:00:00Z').toUTCString(), 'Last-Modified is the page\'s day');
  ok((await req('/sitemap-nope.xml')).status === 404 && (await req('/sitemap-.xml')).status === 404, 'unknown child: 404');
  ok(/Sitemap: https:\/\/example\.org\/sitemap\.xml/.test(text(await req('/robots.txt'))), 'robots.txt still points at /sitemap.xml');
} finally { child.kill(); rmSync(tmp, { recursive: true, force: true }); }
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
