#!/usr/bin/env node
// Every hreflang value the site advertises must resolve, when requested as
// ?lang=<value>, to the page it points at — otherwise the variant is served
// in English and canonicalises to the English URL, which Google reads as
// "this alternate does not exist". Regression: 'es-419' (digits) fell through.
// Run: node scripts/test-seo-lang-query.mjs — no server, no network.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'proxy.js'), 'utf8');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } }
function fn(name) {
  const h = src.indexOf('function ' + name + '('); if (h < 0) return '';
  let d = 0;
  for (let j = src.indexOf('{', h); j < src.length; j++) {
    if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (!d) return src.slice(h, j + 1); }
  }
  return '';
}
function table(name) {
  const i = src.indexOf('var ' + name + ' = {'); const j = src.indexOf('\n};', i);
  return src.slice(i, j + 3);
}
const S = (0, eval)(`(function(){ var SEO_TITLE='', SEO_DESC='';
  ${table('SEO_I18N')} ${table('SEO_HREFLANG_ALIAS')}
  ${fn('seoLangFromQuery')} ${fn('seoHreflangPairs')}
  return { q: seoLangFromQuery, pairs: seoHreflangPairs, I: SEO_I18N }; })()`);

const B = 'https://x.test';
for (const [code, href] of S.pairs(B)) {
  if (code === 'x-default') continue;
  const target = href === B + '/' ? '' : href.slice((B + '/?lang=').length);
  ok(S.q('/?lang=' + code) === target, 'hreflang ' + code + ' → ?lang=' + code + ' resolves to "' + target + '", got "' + S.q('/?lang=' + code) + '"');
  if (target) ok(S.q('/?lang=' + target) === target, 'canonical code ' + target + ' resolves to itself');
}
const cat = readdirSync(join(root, 'public', 'modules', 'lang')).map(f => f.replace(/\.mjs$/, ''));
for (const c of cat) {
  const want = c === 'en' ? '' : Object.keys(S.I).find(k => k.toLowerCase() === c);
  ok(want !== undefined && S.q('/rules?lang=' + c) === want, 'catalogue ' + c + ' resolves on a content page');
}
ok(S.q('/?lang=es-419&x=1') === 'es-419', 'es-419 followed by another parameter');
ok(S.q('/?lang=zz') === '', 'unknown code falls back to English');
console.log((fail ? 'FAIL ' : 'ok ') + (n - fail) + '/' + n + ' checks');
process.exit(fail ? 1 : 0);
