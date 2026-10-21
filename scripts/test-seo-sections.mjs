#!/usr/bin/env node
// /faq and /glossary are split into themed sections (H2) — web.237. Before,
// each page was one flat list under its H1, with no outline for a search
// engine or an assistant to quote from. Checks:
//   1. every FAQ question and every glossary term sits in exactly one section;
//   2. seo-i18n/sections.js has the 5 FAQ and 4 glossary headings for every
//      language the two pages exist in;
//   3. rendered (English and every language): the H2 count, one H3 per FAQ
//      question, one <dt> per term, and FAQPage questions in reading order.
// Run: node scripts/test-seo-sections.mjs   (~10 s)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import http from 'node:http';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  ✗', m); } else if (!process.env.QUIET) console.log('  ✓', m); };
function lift(name) {
  const i = proxy.indexOf('var ' + name + ' = ');
  if (i < 0) throw new Error('no ' + name);
  let j = i + ('var ' + name + ' = ').length, d = 0, k = j;
  for (; k < proxy.length; k++) {
    const ch = proxy[k];
    if (ch === "'" || ch === '"') { const q = ch; k++; while (proxy[k] !== q) { if (proxy[k] === '\\') k++; k++; } continue; }
    if (ch === '/' && proxy[k + 1] === '/') { k = proxy.indexOf('\n', k); continue; }
    if (ch === '{' || ch === '[') d++;
    else if (ch === '}' || ch === ']') { d--; if (!d) break; }
  }
  return new Function('return ' + proxy.slice(j, k + 1))();
}
const FAQ = lift('_SEO_FAQ'), GLOSS = lift('_SEO_GLOSSARY');
const FG = lift('_SEO_FAQ_GROUPS'), GG = lift('_SEO_GLOSSARY_GROUPS'), EN = lift('_SEO_SECTIONS_EN');
const FAQ_I18N = lift('SEO_FAQ_I18N');
const SEC = require(join(root, 'seo-i18n', 'sections.js'));

// ── 1. groups ──
const fi = FG.flat().sort((a, b) => a - b);
ok(JSON.stringify(fi) === JSON.stringify(FAQ.map((q, i) => i)), `FAQ: each of the ${FAQ.length} questions in exactly one of ${FG.length} sections`);
const gw = GG.flat();
ok(gw.length === GLOSS.length && new Set(gw).size === gw.length && gw.every((w) => GLOSS.some((g) => g[0] === w)),
  `glossary: each of the ${GLOSS.length} terms in exactly one of ${GG.length} sections`);
ok(GG.every((g) => g.every((w, i) => !i || g[i - 1].localeCompare(w, 'en') < 0)), 'glossary: alphabetical within each section');
ok(EN.faq.length === FG.length && EN.gloss.length === GG.length, 'English headings: one per section');

// ── 2. translations ──
const langs = Object.keys(FAQ_I18N);
const missing = langs.filter((c) => !(SEC[c] && Array.isArray(SEC[c].faq) && SEC[c].faq.length === FG.length && Array.isArray(SEC[c].gloss) && SEC[c].gloss.length === GG.length));
ok(!missing.length, `headings in all ${langs.length} languages` + (missing.length ? ' — missing: ' + missing.join(' ') : ''));
const badStr = [];
for (const c in SEC) for (const k of ['faq', 'gloss']) for (const s of SEC[c][k] || []) if (typeof s !== 'string' || !s.trim() || [...s].length > 40 || /["<>]/.test(s)) badStr.push(c + '/' + k + ': ' + s);
ok(!badStr.length, 'headings: non-empty, ≤ 40 characters, no markup' + (badStr.length ? ' — ' + badStr.slice(0, 5).join('; ') : ''));
ok(Object.keys(SEC).every((c) => langs.includes(c)), 'no headings for a language the pages do not exist in');

// ── 3. rendered ──
const tmp = mkdtempSync(join(tmpdir(), 'pth-sec-'));
writeFileSync(join(tmp, 'admin-config.json'), JSON.stringify({ seo: { enabled: true, publicUrl: 'https://example.org' } }));
const PORT = 18000 + Math.floor(Math.random() * 900);
const child = spawn(process.execPath, [join(root, 'proxy.js'), '--notls', String(PORT)], {
  env: Object.assign({}, process.env, { ADMIN_CONFIG_FILE: join(tmp, 'admin-config.json'), VISITS_FILE: join(tmp, 'visits.json'), NO_PROXY: '*' }), stdio: 'ignore' });
const get = (p) => new Promise((res, rej) => http.get({ host: '127.0.0.1', port: PORT, path: p }, (r) => { let b = ''; r.setEncoding('utf8'); r.on('data', (c) => b += c); r.on('end', () => res(b)); }).on('error', rej));
const count = (h, re) => (h.match(re) || []).length;
try {
  for (let i = 0; i < 60; i++) { try { await get('/robots.txt'); break; } catch (e) { await new Promise((r) => setTimeout(r, 250)); } }
  const off = { faq: [], gloss: [] };
  for (const l of ['en'].concat(langs)) {
    const q = l === 'en' ? '' : '?lang=' + l;
    const f = await get('/faq' + q), g = await get('/glossary' + q);
    const heads = l === 'en' ? EN : SEC[l] || EN;
    const fh2 = [...f.matchAll(/<h2>([^<]*)<\/h2>/g)].map((m) => m[1]);
    const h3 = [...f.matchAll(/<div class="qa"><h3>([\s\S]*?)<\/h3>/g)].map((m) => m[1]);
    const ld = [...f.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((b) => b['@type'] === 'FAQPage');
    if (JSON.stringify(fh2) !== JSON.stringify(heads.faq) || h3.length !== FAQ.length || !ld ||
        JSON.stringify(ld.mainEntity.map((e) => e.name)) !== JSON.stringify(h3) || count(f, /<dt>/g)) off.faq.push(l);
    const gh2 = [...g.matchAll(/<h2>([^<]*)<\/h2>/g)].map((m) => m[1]);
    if (JSON.stringify(gh2.slice(0, GG.length)) !== JSON.stringify(heads.gloss) || count(g, /<dt>/g) !== GLOSS.length || count(g, /<dl>/g) !== GG.length) off.gloss.push(l);
  }
  ok(!off.faq.length, `/faq in ${langs.length + 1} languages: ${FG.length} H2 sections, ${FAQ.length} H3 questions, FAQPage in reading order` + (off.faq.length ? ' — ' + off.faq.join(' ') : ''));
  ok(!off.gloss.length, `/glossary in ${langs.length + 1} languages: ${GG.length} H2 sections, ${GLOSS.length} terms` + (off.gloss.length ? ' — ' + off.gloss.join(' ') : ''));
} finally { child.kill(); rmSync(tmp, { recursive: true, force: true }); }
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
