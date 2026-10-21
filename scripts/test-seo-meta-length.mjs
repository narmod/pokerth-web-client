#!/usr/bin/env node
// Every server-rendered page, in every language, keeps a title and a meta
// description that fit a search result: title <= 70 (<= 60 for
// English), description <= 200 (<= 160 for English), measured as snippet
// width where a Chinese, Japanese or Korean glyph counts double (they take
// about twice the room of a Latin letter in a result). Titles and descriptions
// were cut down once (web.235) after the audit found home, /faq and
// /how-to-play descriptions of 190-290 characters in most languages; this
// keeps them there. Renders the pages through a real proxy (SEO on).
// Run: node scripts/test-seo-meta-length.mjs   (~1 min)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import http from 'node:http';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const LANGS = ['en'].concat(Object.keys(require(join(root, 'seo-i18n', 'competitions.js'))));
const PAGES = ['/', '/faq', '/rules', '/hand-rankings', '/how-to-play', '/glossary', '/competitions', '/privacy',
  '/play-with-friends', '/poker-odds', '/play-against-computer', '/starting-hands', '/accessibility', '/host-a-server'];
const tmp = mkdtempSync(join(tmpdir(), 'pth-meta-'));
writeFileSync(join(tmp, 'admin-config.json'), JSON.stringify({ seo: { enabled: true, publicUrl: 'https://example.org' } }));
const PORT = 18000 + Math.floor(Math.random() * 900);
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
  env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
const get = (p) => new Promise((res, rej) => http.get({ host: '127.0.0.1', port: PORT, path: p }, (r) => { let b = ''; r.setEncoding('utf8'); r.on('data', (c) => b += c); r.on('end', () => res(b)); }).on('error', rej));
const dec = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
// Snippet width: a CJK or Hangul glyph counts as two Latin letters.
const WIDE = /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;
const width = (s) => [...s].reduce((w, c) => w + (WIDE.test(c) ? 2 : 1), 0);
let fail = 0, n = 0; const bad = [];
try {
  for (let i = 0; i < 60; i++) { try { await get('/robots.txt'); break; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } }
  for (const p of PAGES) for (const l of LANGS) {
    const h = await get(p + (l === 'en' ? '' : '?lang=' + l));
    const t = width(dec((h.match(/<title>([^<]*)<\/title>/) || [])[1] || ''));
    const d = width(dec((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''));
    const tMax = l === 'en' ? 60 : 70, dMax = l === 'en' ? 160 : 200;
    n++; if (!t || !d || t > tMax || d > dMax) { fail++; bad.push(`${p} ${l}: title ${t}/${tMax}, description ${d}/${dMax}`); }
  }
} finally { child.kill(); rmSync(tmp, { recursive: true, force: true }); }
bad.slice(0, 30).forEach((b) => console.error('  ✗', b));
console.log(fail ? `\n${fail}/${n} pages over the limits` : `\n${n}/${n} pages within the limits`);
process.exit(fail ? 1 : 0);
