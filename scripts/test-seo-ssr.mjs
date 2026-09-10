#!/usr/bin/env node
// Deterministic guards for seo-i18n/ssr.js — the serve-time localization of
// pokerth-client.html for /?lang= variants. Run: node scripts/test-seo-ssr.mjs
//
// What a crawler without JavaScript reads must match what setLang() produces
// at boot, in the page's language, without disturbing a single byte of code:
//   1. the catalog is the client's own (catalog-dump.mjs imports i18n.mjs);
//   2. every data-i18n element of the template is a leaf, so it can be filled;
//   3. no static default in the template is French (the English fallback);
//   4. per language, every data-i18n* node carries t(key), scripts untouched,
//      markup otherwise identical, and a second pass changes nothing;
//   5. values are escaped, and a missing title="" is added as el.title would;
//   6. proxy.js wires it in for indexed pages and the seo-intro uses the
//      client strings instead of a hardcoded English line.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ssr = require(join(root, 'seo-i18n', 'ssr.js'));
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escA = (s) => esc(s).replace(/"/g, '&quot;');

// 1. Catalog from the client module ------------------------------------------
const cat = JSON.parse(execFileSync(process.execPath, [join(root, 'seo-i18n', 'catalog-dump.mjs'), join(root, 'public')],
  { maxBuffer: 64 * 1024 * 1024 }).toString('utf8'));
const codes = Object.keys(cat);
ok(codes.length >= 45 && cat.en && cat.fr && cat.nl, `catalog loads from i18n.mjs (${codes.length} languages)`);
ok(typeof cat.nl.assist === 'string' && cat.nl.assist !== cat.en.assist, 'catalog includes the i18n.mjs overlays (assist)');

const tpl = readFileSync(join(root, 'public', 'pokerth-client.html'), 'utf8');
const t = (code, k) => (cat[code] && cat[code][k] != null) ? cat[code][k] : cat.en[k];

// 2. Leaf elements ---------------------------------------------------------------
const TEXT_RE = /<([a-zA-Z][\w-]*)\b[^>]*\sdata-i18n(?:-opt)?="([^"]+)"[^>]*>/g;
let m, nonLeaf = [], textKeys = [];
while ((m = TEXT_RE.exec(tpl))) {
  const rest = tpl.slice(TEXT_RE.lastIndex);
  if (rest.indexOf('<') !== rest.indexOf('</' + m[1])) nonLeaf.push(m[2]);
  textKeys.push(m[2]);
}
ok(textKeys.length > 400, `template has ${textKeys.length} data-i18n / data-i18n-opt elements`);
ok(nonLeaf.length === 0, 'every data-i18n element holds text only' + (nonLeaf.length ? ': ' + nonLeaf.join(', ') : ''));

// 3. English static fallback -------------------------------------------------------
const norm = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
let french = [];
TEXT_RE.lastIndex = 0;
while ((m = TEXT_RE.exec(tpl))) {
  const k = m[2], v = norm(tpl.slice(TEXT_RE.lastIndex).split('<')[0]);
  const fr = cat.fr[k] != null ? norm(cat.fr[k]) : null, en = cat.en[k] != null ? norm(cat.en[k]) : null;
  if (v && fr && fr !== en && v === fr) french.push(k);
}
const ATTR_RE = /\sdata-i18n-(title|placeholder)="([^"]+)"/g;
const tagRe = /<[a-zA-Z][\w-]*\b(?:[^>"']|"[^"]*"|'[^']*')*>/g;
for (const tag of tpl.match(tagRe) || []) {
  let a; ATTR_RE.lastIndex = 0;
  while ((a = ATTR_RE.exec(tag))) {
    const attr = a[1] === 'title' ? 'title' : 'placeholder', k = a[2];
    const vm = new RegExp('\\s' + attr + '="([^"]*)"').exec(tag);
    const fr = cat.fr[k] != null ? norm(cat.fr[k]) : null, en = cat.en[k] != null ? norm(cat.en[k]) : null;
    if (vm && fr && fr !== en && norm(vm[1]) === fr) french.push(attr + ':' + k);
  }
}
ok(french.length === 0, 'no French static default left in the template' + (french.length ? ': ' + french.slice(0, 12).join(', ') : ''));
for (const s of ['Table protégée', 'Aucun joueur', 'Kicker ce joueur']) ok(tpl.indexOf(s) === -1, `untagged French text gone: « ${s} »`);

// 4. Per-language rendering ----------------------------------------------------------
const blocks = (h) => (h.match(/<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->/gi) || []).join('\u0000');
const skeleton = (h) => h
  .replace(/(<([a-zA-Z][\w-]*)\b[^>]*\sdata-i18n(?:-opt)?="[^"]*"[^>]*>)[^<]*(<\/\2\s*>)/g, '$1$3')
  .replace(tagRe, (tag) => /data-i18n-(title|aria|placeholder)=/.test(tag)
    ? tag.replace(/\s(title|aria-label|placeholder)="[^"]*"/g, '') : tag);
const tplBlocks = blocks(tpl), tplSkel = skeleton(tpl);
let bad = [];
for (const code of codes) {
  const out = ssr.localize(tpl, code, cat);
  const errs = [];
  if (blocks(out) !== tplBlocks) errs.push('script/style/comment changed');
  if (skeleton(out) !== tplSkel) errs.push('markup changed outside localized values');
  if (ssr.localize(out, code, cat) !== out) errs.push('not idempotent');
  TEXT_RE.lastIndex = 0;
  let miss = 0;
  while ((m = TEXT_RE.exec(out))) {
    const want = t(code, m[2]);
    if (want == null) continue;
    if (out.slice(TEXT_RE.lastIndex).split('<')[0] !== esc(want)) miss++;
  }
  if (miss) errs.push(miss + ' text nodes differ from t()');
  let amiss = 0;
  for (const tag of out.match(tagRe) || []) {
    for (const [da, attr] of [['title', 'title'], ['aria', 'aria-label'], ['placeholder', 'placeholder']]) {
      const km = new RegExp('\\sdata-i18n-' + da + '="([^"]+)"').exec(tag);
      if (!km || t(code, km[1]) == null) continue;
      const vm = new RegExp('\\s' + attr + '="([^"]*)"').exec(tag);
      if (!vm || vm[1] !== escA(t(code, km[1]))) amiss++;
    }
  }
  if (amiss) errs.push(amiss + ' attributes differ from t()');
  if (errs.length) bad.push(code + ': ' + errs.join('; '));
}
ok(bad.length === 0, `all ${codes.length} languages render every data-i18n* node as t(key), code untouched, idempotent` + (bad.length ? '\n      ' + bad.join('\n      ') : ''));

const nl = ssr.localize(tpl, 'nl', cat);
ok(nl.indexOf('>' + esc(cat.nl.abTitle) + '<') !== -1 && nl.indexOf('>' + esc(cat.fr.abTitle) + '<') === -1, 'nl: About dialog title is Dutch, not French');
ok(nl.indexOf('>' + esc(cat.nl.createTableHdr) + '<') !== -1, 'nl: create-table header is Dutch');
ok(ssr.localize(tpl, 'xx', cat) === ssr.localize(tpl, 'en', cat), 'unknown language renders as English');
ok(ssr.localize(tpl, 'nl', null) === tpl, 'no catalog: HTML served unchanged');

// 5. Escaping and attribute handling --------------------------------------------------
const mini = { en: { a: 'A & <b>"x"</b>', b: 'Close "now"', c: 'Type…' }, de: { a: 'Ä' } };
const src = '<script>var s = "<span data-i18n=\\"a\\">keep</span>";</script>' +
  '<span data-i18n="a">old</span><button data-i18n-title="b">x</button>' +
  '<input data-i18n-placeholder="c" placeholder="old"><!-- <b data-i18n="a">c</b> -->' +
  '<i data-i18n="zz">untouched</i><button onclick="if(a>b)go()" title="t" data-i18n-title="b">y</button>';
const outMini = ssr.localize(src, 'de', mini);
ok(outMini.indexOf('<span data-i18n="a">Ä</span>') !== -1, 'language value wins over English');
ok(ssr.localize(src, 'en', mini).indexOf('<span data-i18n="a">A &amp; &lt;b&gt;"x"&lt;/b&gt;</span>') !== -1, 'text is HTML-escaped');
ok(outMini.indexOf('<button data-i18n-title="b" title="Close &quot;now&quot;">') !== -1, 'missing title="" is added, attribute-escaped');
ok(outMini.indexOf('placeholder="Type…"') !== -1, 'placeholder is replaced');
ok(outMini.indexOf('"<span data-i18n=\\"a\\">keep</span>"') !== -1 && outMini.indexOf('<b data-i18n="a">c</b>') !== -1, 'scripts and comments are left alone');
ok(outMini.indexOf('<i data-i18n="zz">untouched</i>') !== -1, 'unknown key keeps its static default');
ok(outMini.indexOf('onclick="if(a>b)go()" title="Close &quot;now&quot;"') !== -1, 'quote-aware tag parsing (">" inside a handler)');

// 6. proxy.js wiring ---------------------------------------------------------------------
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
ok(/if \(on\) html = _seoSsr\.localize\(html, lang \|\| 'en', _seoSsr\.catalog\(\)\);/.test(proxy), 'sendClientHtml localizes indexed pages');
ok(/JSON\.stringify\(_seoAdmin\(\)\) \+ '\|' \+ _seoSsr\.version\(\)/.test(proxy), 'HTML cache generation includes the catalog version');
ok(proxy.indexOf('data-i18n="abProject1"') !== -1 && proxy.indexOf('Free software \\u2014 source code on GitHub') === -1, 'seo-intro project line uses the client strings');
for (const f of ['hands', 'howto', 'glossary']) {
  const P = require(join(root, 'seo-i18n', f + '.js')).PARTS;
  const empty = Object.keys(P).filter((c) => !String(P[c].h1 || '').split(' \u2014 ')[0].trim());
  ok(empty.length === 0, `${f}: every language has an <h1> usable as link label`);
}

console.log(`\n${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
