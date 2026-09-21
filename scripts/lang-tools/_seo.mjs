// Shared by seo-dump.mjs and seo-build.mjs: reads the SEO tables of proxy.js
// and seo-i18n/*.js without running the server, and flattens one language
// entry to `path → string` (paths like `faq.qa[3][1]`, `hands.names[0]`).
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { die } from './_lib.mjs';

const require = createRequire(import.meta.url);
export const PROXY = 'proxy.js';
export const MODULES = ['hands', 'howto', 'glossary'];
// [path prefix, table of proxy.js]
export const TABLES = [['meta', 'SEO_I18N'], ['body', 'SEO_BODY_I18N'], ['rules', 'SEO_RULES_I18N'], ['faq', 'SEO_FAQ_I18N']];
// English lives as positional arrays in proxy.js, not in the tables.
const EN_ARRAYS = [['_SEO_FAQ', i => [`faq.qa[${i}][0]`, `faq.qa[${i}][1]`]], ['_SEO_HANDS', i => [`hands.names[${i}]`, `hands.texts[${i}]`]],
  ['_SEO_HOWTO', i => [`howto.steps[${i}][0]`, `howto.steps[${i}][1]`]], ['_SEO_GLOSSARY', i => [`glossary.terms[${i}][0]`, `glossary.terms[${i}][1]`]]];

// Index of the bracket closing the one at `start`, skipping strings and // comments.
export function blockEnd(src, start) {
  let d = 0, q = null;
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '/' && src[k + 1] === '/') { k = src.indexOf('\n', k); continue; }
    if (c === '{' || c === '[') d++;
    if (c === '}' || c === ']') { d--; if (!d) return k; }
  }
  die('unbalanced brackets after offset ' + start);
}
export function tableRange(src, name, open) {
  const i = src.indexOf('var ' + name + ' = ' + open);
  if (i < 0) die(name + ' not found in ' + PROXY);
  const j = src.indexOf(open, i);
  return [j, blockEnd(src, j)];
}
export function evalTable(src, name, open = '{') {
  const [j, e] = tableRange(src, name, open);
  // the `en` entries point at two constants defined elsewhere in proxy.js
  return new Function('SEO_TITLE', 'SEO_DESC', 'return (' + src.slice(j, e + 1) + ')')('', '');
}
export const modParts = m => require(path.resolve('seo-i18n/' + m + '.js')).PARTS;

const stub = k => '{' + k + '}';           // link builders become {rules} / {hands} / {faq}
export function flatten(o, p, out = {}) {
  if (typeof o === 'function') out[p] = o(stub, 'xx');
  else if (Array.isArray(o)) o.forEach((v, i) => flatten(v, p + '[' + i + ']', out));
  else if (o && typeof o === 'object') for (const k in o) flatten(o[k], p ? p + '.' + k : k, out);
  else out[p] = o === null ? null : String(o);
  return out;
}
// Every SEO string of one language, keyed by path.
export function flatLang(code) {
  const src = fs.readFileSync(PROXY, 'utf8'), out = {};
  for (const [pre, name] of TABLES) { const e = evalTable(src, name)[code]; if (e) flatten(e, pre, out); }
  for (const m of MODULES) { const e = modParts(m)[code]; if (e) flatten(e, m, out); }
  return out;
}
export function englishPositional() {
  const src = fs.readFileSync(PROXY, 'utf8'), out = {};
  for (const [name, keys] of EN_ARRAYS) evalTable(src, name, '[').forEach((row, i) => keys(i).forEach((k, n) => { out[k] = row[n]; }));
  return out;
}
