#!/usr/bin/env node
// The content pages typed Article (/rules, /hand-rankings, /poker-odds,
// /starting-hands, /accessibility) carry the fields Google lists for an
// Article: datePublished, dateModified, image, author and publisher with a
// logo, plus article:published_time / article:modified_time for link cards.
// The dates come from seo-i18n/article-dates.json, which also keeps a
// fingerprint of each page's English body (<main>). When the body changes,
// this test fails until the date is moved on:
//   node scripts/test-seo-article-ld.mjs --update   (records today's date)
// A new Article page fails here until it has an entry (--update adds it).
// Run: node scripts/test-seo-article-ld.mjs   (~5 s)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import http from 'node:http';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(root, 'seo-i18n', 'article-dates.json');
const UPDATE = process.argv.includes('--update');
const PAGES = ['/', '/faq', '/rules', '/hand-rankings', '/how-to-play', '/glossary', '/competitions', '/privacy',
  '/play-with-friends', '/poker-odds', '/play-against-computer', '/starting-hands', '/accessibility', '/host-a-server'];
const BASE = 'https://example.org';
const tmp = mkdtempSync(join(tmpdir(), 'pth-art-'));
writeFileSync(join(tmp, 'admin-config.json'), JSON.stringify({ seo: { enabled: true, publicUrl: BASE } }));
const PORT = 18000 + Math.floor(Math.random() * 900);
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
  env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
const get = (p) => new Promise((res, rej) => http.get({ host: '127.0.0.1', port: PORT, path: p }, (r) => { let b = ''; r.setEncoding('utf8'); r.on('data', (c) => b += c); r.on('end', () => res(b)); }).on('error', rej));
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); };
const blocks = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [].concat(JSON.parse(m[1])));
const meta = (h, p) => (h.match(new RegExp('<meta property="' + p + '" content="([^"]*)"')) || [])[1];
const fp = (h) => createHash('sha1').update((h.match(/<main>([\s\S]*)<\/main>/) || [])[1] || '').digest('hex').slice(0, 16);
const today = new Date().toISOString().slice(0, 10);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const dates = JSON.parse(readFileSync(FILE, 'utf8'));
let changed = false;
try {
  for (let i = 0; i < 60; i++) { try { await get('/robots.txt'); break; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } }
  for (const p of PAGES) {
    const h = await get(p);
    const art = blocks(h).find((b) => b['@type'] === 'Article');
    if (!art) { ok(!dates[p], `${p}: no Article, no stale date entry`); continue; }
    const f = fp(h), d = dates[p];
    if (UPDATE && (!d || d.en !== f)) {
      dates[p] = { published: (d && d.published) || today, modified: today, en: f }; changed = true;
      console.log(`  · ${p}: ${d ? 'English body changed' : 'new Article page'}, dated ${today}`);
      continue;
    }
    ok(d, `${p}: has an entry in seo-i18n/article-dates.json`);
    if (!d) continue;
    ok(d.en === f, `${p}: English body unchanged since ${d.modified}` + (d.en === f ? '' : ' — move the date: node scripts/test-seo-article-ld.mjs --update'));
    ok(ISO.test(d.published) && ISO.test(d.modified) && d.published <= d.modified && d.modified <= today, `${p}: dates in order (${d.published} ≤ ${d.modified} ≤ today)`);
    ok(art.datePublished === d.published && art.dateModified === d.modified, `${p}: datePublished / dateModified in the JSON-LD`);
    ok(meta(h, 'article:published_time') === d.published && meta(h, 'article:modified_time') === d.modified, `${p}: article:published_time / modified_time`);
    ok(art.image === BASE + '/screenshots/social-preview.png', `${p}: image is the social card`);
    ok(art.publisher && art.publisher.name === 'PokerTH Development Team' && art.publisher.logo && art.publisher.logo.url === BASE + '/favicon-512.png', `${p}: publisher with its logo`);
    ok(art.author && art.author.url === 'https://www.pokerth.net/', `${p}: author with its URL`);
    ok(art.headline && art.mainEntityOfPage === BASE + p, `${p}: headline and mainEntityOfPage`);
    // A translation carries the same dates: one page, many languages.
    const fr = blocks(await get(p + '?lang=fr')).find((b) => b['@type'] === 'Article');
    ok(fr && fr.dateModified === d.modified && fr.inLanguage === 'fr' && fr.mainEntityOfPage === BASE + p + '?lang=fr', `${p}?lang=fr: same dates, own language and URL`);
  }
  for (const p of Object.keys(dates)) ok(PAGES.includes(p), `${p}: date entry belongs to a known page`);
} finally { child.kill(); rmSync(tmp, { recursive: true, force: true }); }
if (UPDATE) { if (changed) writeFileSync(FILE, JSON.stringify(dates, null, 2) + '\n'); console.log(changed ? '  · written seo-i18n/article-dates.json' : '  · nothing to update'); process.exit(0); }
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
