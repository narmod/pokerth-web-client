#!/usr/bin/env node
// Step 3: inserts the SEO entries of a language from the chunks
// $LANG_WORK/<code>sN.txt (`path<space>text` per line, paths as printed by
// seo-dump.mjs) into seo-i18n/{hands,howto,glossary}.js and into the proxy.js
// tables SEO_I18N, SEO_BODY_I18N, SEO_RULES_I18N, SEO_FAQ_I18N and OG_LOCALE.
// The new entry takes the exact shape of <code2>'s and lands right after it;
// link builders (`function (h, c) { return "…".replace('{rules}', …) }`) are
// rebuilt around the translated string. Fails on a missing or unused path, on
// {token} / HTML-tag / %s drift against <code2>, and when the ten hand names
// differ from h1n…h10n of the catalogue.
//   node scripts/lang-tools/seo-build.mjs <code> <og_locale> --after <code2>
// A glossary term identical to the English one is written `null`, like the
// other entries. Then: seo-lang-count.mjs, the English phrases, the tests.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { LANG_DIR, readChunks, die } from './_lib.mjs';
import { PROXY, MODULES, TABLES, blockEnd, tableRange, evalTable, modParts, flatLang, englishPositional } from './_seo.mjs';

const a = process.argv.slice(2), [code, og] = a, after = a[a.indexOf('--after') + 1];
if (!code || !/^[a-z]{2,3}_[A-Z]{2}$/.test(og || '') || a.indexOf('--after') < 0 || !after) die('usage: seo-build.mjs <code> <og_locale> --after <code2>');
const tr = readChunks(code + 's'), ref = flatLang(after), en = englishPositional(), used = new Set(), J = JSON.stringify;
if (!Object.keys(ref).length) die('no SEO entry for ' + after);
if (Object.keys(flatLang(code)).length) die(code + ' already has SEO entries');

const toks = s => [/\{[^}]*\}/g, /<\/?[a-zA-Z0-9][^>]*>/g, /%s/g].map(r => (String(s).match(r) || []).sort().join('|')).join('§');
for (const k in ref) {
  if (!(k in tr)) die('missing ' + k);
  if (ref[k] !== null && toks(ref[k]) !== toks(tr[k])) die('token/tag drift at ' + k);
}
for (const k in tr) if (!(k in ref)) die('unknown path ' + k);
// Object key for the new entry: bare for a plain code, quoted for a region
// code such as zh-HK (bare `zh-HK:` is a syntax error).
const KEY = /^[a-z]+$/.test(code) ? code : "'" + code + "'";
const { strings } = await import(pathToFileURL(path.join(LANG_DIR, code.toLowerCase() + '.mjs')).href);
for (let i = 0; i < 10; i++) if (tr[`hands.names[${i}]`] !== strings['h' + (i + 1) + 'n']) die(`hands.names[${i}] "${tr[`hands.names[${i}]`]}" ≠ catalogue h${i + 1}n "${strings['h' + (i + 1) + 'n']}"`);

const get = p => { used.add(p); return tr[p]; };
function ser(v, p, ind) {
  const pad = ' '.repeat(ind);
  if (typeof v === 'function') {
    const m = String(v).match(/^function \(h, c\) \{ return "(?:[^"\\]|\\.)*"((?:\.replace\([^)]*\([^)]*\)\))*); \}$/);
    if (!m) die('unexpected link-builder shape at ' + p);
    return 'function (h, c) { return ' + J(get(p)) + m[1] + '; }';
  }
  if (v === null || typeof v === 'string') { const t = get(p); return /^glossary\.terms\[\d+\]\[0\]$/.test(p) && t === en[p] ? 'null' : J(t); }
  if (Array.isArray(v)) {
    const items = v.map((x, i) => ser(x, p + '[' + i + ']', ind + 2)), one = items.join(', ');
    return v.every(x => x === null || typeof x === 'string') && one.length < 110 ? '[' + one + ']' : '[\n' + items.map(x => pad + '  ' + x).join(',\n') + ',\n' + pad + ']';
  }
  return '{\n' + Object.keys(v).map(k => pad + '  ' + (/^[A-Za-z_$][\w$]*$/.test(k) ? k : J(k)) + ': ' + ser(v[k], p ? p + '.' + k : k, ind + 2)).join(',\n') + ',\n' + pad + '}';
}
// Insert `text` as the entry following <after>'s, inside [from, to] of `s`.
function insert(s, from, to, text) {
  const m = new RegExp('\\n  (?:' + after + '|[\'"]' + after + '[\'"]): \\{').exec(s.slice(from, to + 1));
  if (!m) die('entry "' + after + '" not found');
  const open = s.indexOf('{', from + m.index), end = blockEnd(s, open);
  if (s[end + 1] !== ',') { const nl = s.indexOf('\n', end); return s.slice(0, end + 1) + ',' + s.slice(end + 1, nl + 1) + '  ' + KEY + ': ' + text + '\n' + s.slice(nl + 1); }
  const nl = s.indexOf('\n', end);
  return s.slice(0, nl + 1) + '  ' + KEY + ': ' + text + ',\n' + s.slice(nl + 1);
}

for (const m of MODULES) {
  const file = 'seo-i18n/' + m + '.js', s = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, insert(s, 0, s.length - 1, ser(modParts(m)[after], m, 2)));
}
let s = fs.readFileSync(PROXY, 'utf8');
for (const [pre, name] of TABLES) {
  const shape = evalTable(s, name)[after], [j, e] = tableRange(s, name, '{');
  let text = ser(shape, pre, 2);
  if (name === 'SEO_I18N') text = '{ ' + Object.keys(shape).map(k => k + ': ' + J(tr[pre + '.' + k])).join(', ') + ' }';
  if (name === 'SEO_BODY_I18N') { const k = Object.keys(shape), v = x => x + ': ' + J(tr[pre + '.' + x]); text = '{ ' + k.slice(0, -2).map(v).join(',\n     ') + ',\n     ' + k.slice(-2).map(v).join(', ') + ' }'; }
  s = insert(s, j, e, text);
}
const ogRe = new RegExp("((?:^|[ {])(?:" + after + "|'" + after + "'): '[A-Za-z_]+',)");
if (s.split(ogRe).length !== 3) die('OG_LOCALE: entry "' + after + '" not found exactly once');
s = s.replace(ogRe, "$1 " + (/^[a-z]+$/.test(code) ? code : "'" + code + "'") + ": '" + og + "',");
fs.writeFileSync(PROXY, s);
const left = Object.keys(tr).filter(k => !used.has(k));
if (left.length) die('unused paths: ' + left.join(', '));
console.log(used.size + ' strings → seo-i18n/{' + MODULES.join(',') + '}.js + ' + PROXY + ' (' + TABLES.map(t => t[1]).join(', ') + ', OG_LOCALE ' + og + ')');
