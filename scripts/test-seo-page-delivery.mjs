#!/usr/bin/env node
// How the content pages are delivered (web.242, SEO audit of 2026-10-21):
//   - compressed (brotli / gzip) and validated: ETag, 304 on If-None-Match,
//     Last-Modified from the page's date — they were sent raw, re-downloaded
//     on every visit;
//   - a favicon, an Apple touch icon and a theme colour in <head>;
//   - the text face as two small Inter subsets (the full 343 KB file only
//     for Greek, Cyrillic and Vietnamese), the title and text faces
//     preloaded on Latin-script pages only;
//   - the header logo at its display size (68 px for 34 px at 2x), not the
//     256 px original.
// Run: node scripts/test-seo-page-delivery.mjs   (~3 s)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';
import http from 'node:http';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const dates = JSON.parse(readFileSync(join(root, 'seo-i18n', 'article-dates.json'), 'utf8'));
const tmp = mkdtempSync(join(tmpdir(), 'pth-del-'));
writeFileSync(join(tmp, 'admin-config.json'), JSON.stringify({ seo: { enabled: true, publicUrl: 'https://example.org' } }));
const PORT = 18000 + Math.floor(Math.random() * 900);
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
  env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
const req = (p, headers = {}, method = 'GET') => new Promise((res, rej) => http.request({ host: '127.0.0.1', port: PORT, path: p, headers, method }, (r) => {
  const ch = []; r.on('data', (c) => ch.push(c)); r.on('end', () => res({ status: r.statusCode, headers: r.headers, buf: Buffer.concat(ch) }));
}).on('error', rej).end());
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
try {
  for (let i = 0; i < 60; i++) { try { await req('/robots.txt'); break; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } }
  const raw = await req('/rules');
  const html = raw.buf.toString('utf8');
  const gz = await req('/rules', { 'accept-encoding': 'gzip' }), br = await req('/rules', { 'accept-encoding': 'gzip, deflate, br' });
  ok(gz.headers['content-encoding'] === 'gzip' && gunzipSync(gz.buf).equals(raw.buf), `gzip: ${raw.buf.length} → ${gz.buf.length} bytes`);
  ok(br.headers['content-encoding'] === 'br' && brotliDecompressSync(br.buf).equals(raw.buf) && br.buf.length < raw.buf.length / 3, `brotli: ${raw.buf.length} → ${br.buf.length} bytes`);
  ok(!raw.headers['content-encoding'] && raw.headers.vary === 'Accept-Encoding', 'raw when nothing is offered; Vary: Accept-Encoding');
  const tag = raw.headers.etag;
  ok(tag && (await req('/rules', { 'if-none-match': tag })).status === 304, '304 on a matching If-None-Match');
  ok((await req('/rules?lang=fr', { 'if-none-match': tag })).status === 200, 'another language is another ETag');
  ok(raw.headers['last-modified'] === new Date(dates['/rules'].modified + 'T00:00:00Z').toUTCString(), 'Last-Modified is the page\'s day');
  const head = await req('/rules', {}, 'HEAD');
  ok(head.status === 200 && !head.buf.length && head.headers.etag === tag, 'HEAD: headers only, same ETag');
  ok(/<link rel="icon" href="\/favicon\.svg"/.test(html) && /<link rel="apple-touch-icon" href="\/favicon-180\.png">/.test(html) && /<meta name="theme-color" content="#[0-9a-f]{6}">/.test(html), 'favicon, apple-touch-icon and theme-color in <head>');
  for (const f of ['favicon.svg', 'favicon-32.png', 'favicon-180.png']) ok(existsSync(join(pub, f)), `/${f} exists`);
  ok(/rel="preload" href="\/fonts\/inter-latin-wght-normal\.woff2" as="font" type="font\/woff2" crossorigin/.test(html) && /rel="preload" href="\/fonts\/cinzel-latin-600-normal\.woff2"/.test(html), 'Latin page: text and title faces preloaded');
  const ru = (await req('/rules?lang=ru')).buf.toString('utf8');
  ok(!/rel="preload"/.test(ru), 'Cyrillic page: nothing preloaded');
  const all = [...html.matchAll(/@font-face\{([^}]*)\}/g)].map((m) => m[1]);
  const faces = all.filter((f) => /url\(/.test(f));
  ok(all.some((f) => /font-family:'Inter Fallback';src:local\(/.test(f) && /size-adjust:/.test(f)) && /font:[^;]*Inter,'Inter Fallback'/.test(html), 'a local fallback sized like Inter, next in the font stack');
  const urls = faces.map((f) => (f.match(/url\(([^)]+)\)/) || [])[1]);
  ok(urls.every((u) => u && existsSync(join(pub, u.replace(/^\//, '')))), `every @font-face file exists (${urls.length})`);
  ok(faces.every((f) => /unicode-range:/.test(f)), 'every face is limited by unicode-range');
  const full = faces.find((f) => /InterVariable/.test(f));
  ok(full && !/U\+0000-00FF/.test(full) && /U\+0400-052F/.test(full), 'the full Inter file serves only the scripts the subsets lack');
  ok(/<img src="\/logo-chip-68\.png" alt="" width="34" height="34">/.test(html), 'header logo: the 68 px file');
  ok(statSync(join(pub, 'logo-chip-68.png')).size < 8000, `logo-chip-68.png is small (${statSync(join(pub, 'logo-chip-68.png')).size} bytes)`);
} finally { child.kill(); rmSync(tmp, { recursive: true, force: true }); }
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
