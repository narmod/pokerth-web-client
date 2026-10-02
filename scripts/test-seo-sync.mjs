#!/usr/bin/env node
// The translated content pages must say what the English says (web.277).
// /faq, /rules, /how-to-play, /glossary and /hand-rankings are written in
// English in proxy.js and translated into 82 languages (proxy.js tables and
// seo-i18n/*.js). The English was corrected and extended several times while
// the translations stayed as they were: three FAQ answers, a rules paragraph
// and a dozen facts existed in English only. Two guards:
//   1. shape — every translation has as many FAQ entries, rules headings /
//      list items / paragraphs, how-to steps and glossary terms as English;
//   2. drift — a fingerprint of the English prose of each page is kept in
//      seo-i18n/en-sync.json. When the English changes, this test fails until
//      the translations have been brought up to date and the fingerprint is
//      refreshed: node scripts/test-seo-sync.mjs --update
// Run: node scripts/test-seo-sync.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// A literal (object or array) assigned to `var name = …`, string-aware.
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
function fnSrc(name) {
  const i = proxy.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('no function ' + name);
  return proxy.slice(i, proxy.indexOf('\n}\n', i));
}
// The English body of /rules: the expression assigned to `var body` in seoRulesPage.
function rulesBody() {
  const src = fnSrc('seoRulesPage');
  const i = src.indexOf('var body = '), j = src.indexOf(';\n', i);
  return new Function('return (' + src.slice(i + 'var body = '.length, j) + ')')();
}
// Prose literals of a page function: strings with a space and some length.
function prose(name) {
  const out = [];
  for (const m of fnSrc(name).matchAll(/'((?:[^'\\\n]|\\.){30,})'/g)) if (/\s/.test(m[1])) out.push(m[1]);
  return out.join('\n');
}
const hash = (x) => createHash('sha1').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex').slice(0, 16);

const EN = {
  faq: lift('_SEO_FAQ'),
  rules: rulesBody(),
  howto: lift('_SEO_HOWTO'),
  glossary: lift('_SEO_GLOSSARY'),
  howtoPage: prose('seoHowToPage'),
  handsPage: prose('seoHandsPage'),
};

// ── 1. shape ──
const FAQ = lift('SEO_FAQ_I18N'), RULES = lift('SEO_RULES_I18N');
const HOWTO = require(join(root, 'seo-i18n', 'howto.js'));
const tags = (b) => ['<h2', '<li', '<p'].map((t) => b.split(t).length - 1).join('/');
const enTags = tags(EN.rules);
const faqOff = Object.keys(FAQ).filter((c) => FAQ[c].qa.length !== EN.faq.length);
ok(!faqOff.length, `FAQ: ${EN.faq.length} questions in every language` + (faqOff.length ? ' — ' + faqOff.slice(0, 8).join(', ') : ''));
const rulesOff = Object.keys(RULES).filter((c) => tags(RULES[c].body) !== enTags);
ok(!rulesOff.length, `rules: the same headings / items / paragraphs as English (${enTags})` + (rulesOff.length ? ' — ' + rulesOff.slice(0, 8).join(', ') : ''));
ok(Object.keys(FAQ).length === Object.keys(RULES).length && Object.keys(FAQ).length >= 82, `FAQ and rules in the same ${Object.keys(FAQ).length} languages`);
// how-to and glossary tables: count checks live in their own tests; the step count is cheap to repeat
const hwSrc = readFileSync(join(root, 'seo-i18n', 'howto.js'), 'utf8');
ok(typeof HOWTO.build === 'function' && /steps\[6\]/.test(hwSrc) && EN.howto.length === 6, 'how-to: 6 steps in English, as the table expects');

// ── 2. drift ──
const FILE = join(root, 'seo-i18n', 'en-sync.json');
const now = Object.fromEntries(Object.entries(EN).map(([k, v]) => [k, hash(v)]));
if (process.argv.includes('--update')) {
  writeFileSync(FILE, JSON.stringify(now, null, 2) + '\n');
  console.log('  · fingerprint written to seo-i18n/en-sync.json');
} else {
  let saved = {};
  try { saved = JSON.parse(readFileSync(FILE, 'utf8')); } catch (e) {}
  for (const k of Object.keys(now)) {
    ok(saved[k] === now[k], `English ${k} unchanged since the translations were synced` +
      (saved[k] === now[k] ? '' : ' — update the 82 translations, then: node scripts/test-seo-sync.mjs --update'));
  }
}

console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
