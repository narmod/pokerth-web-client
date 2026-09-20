#!/usr/bin/env node
// The language count inside the SEO copy (step 3).
//   node scripts/lang-tools/seo-lang-count.mjs bump <old> <new>
//   node scripts/lang-tools/seo-lang-count.mjs check <n>
// `bump` only touches SEO_I18N / SEO_BODY_I18N / SEO_FAQ_I18N in proxy.js and
// the `faqP:` / `lead:` lines of seo-i18n/howto.js and glossary.js — never a
// timer, a slice() limit or a protocol enum. It reads \uXXXX escapes as units,
// so "\u300262" (a full stop followed by 62) is handled and "\u0a62" is left
// alone, and it knows the native-digit scripts, literal or escaped.
// `check` EVALUATES the tables and lists the languages whose copy does not
// carry <n> in digits: those spell the number out (Arabic, Urdu in places) and
// must be edited by hand. The English phrases of proxy.js ("NN languages",
// "NN interface languages", "NN UI languages") are left to a reviewed grep.
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { NATIVE_DIGITS, toNative, uEscape, die } from './_lib.mjs';

const [mode, A, B] = process.argv.slice(2);
const TABLES = ['SEO_I18N', 'SEO_BODY_I18N', 'SEO_FAQ_I18N'];
const span = (s, name) => { const i = s.indexOf('var ' + name + ' = {'); if (i < 0) die(name + ' not found'); return [i, s.indexOf('\n};', i)]; };

function fix(text, o, n) {
  let c = 0;
  text = text.replace(/\\u[0-9a-fA-F]{4}|\d+/g, m => (m === o ? (c++, n) : m));
  for (const d of NATIVE_DIGITS) for (const f of [x => x, uEscape]) {
    const from = f(toNative(o, d)), to = f(toNative(n, d));
    text = text.replace(new RegExp(from.replace(/\\/g, '\\\\'), 'gi'), () => (c++, to));
  }
  return [text, c];
}

if (mode === 'bump' && /^\d+$/.test(A || '') && /^\d+$/.test(B || '')) {
  let s = fs.readFileSync('proxy.js', 'utf8');
  for (const t of TABLES) { const [i, j] = span(s, t); const [blk, c] = fix(s.slice(i, j), A, B); s = s.slice(0, i) + blk + s.slice(j); console.log(t + ': ' + c); }
  fs.writeFileSync('proxy.js', s);
  for (const [f, key] of [['seo-i18n/howto.js', '    faqP:'], ['seo-i18n/glossary.js', '    lead:']]) {
    let tot = 0;
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').split('\n').map(l => { if (!l.startsWith(key)) return l; const [r, c] = fix(l, A, B); tot += c; return r; }).join('\n'));
    console.log(f + ': ' + tot);
  }
  console.log('now: seo-lang-count.mjs check ' + B + ', then grep the English phrases in proxy.js');
} else if (mode === 'check' && /^\d+$/.test(A || '')) {
  const s = fs.readFileSync('proxy.js', 'utf8');
  const tbl = name => { // evaluate one object literal, string-aware brace matching
    let j = s.indexOf('var ' + name + ' = {') + ('var ' + name + ' = ').length, d = 0; const st = j;
    for (; ; j++) { const c = s[j]; if (c === '"' || c === "'") { j++; while (s[j] !== c) { if (s[j] === '\\') j++; j++; } } else if (c === '{') d++; else if (c === '}' && !--d) break; }
    return new Function('SEO_TITLE', 'SEO_DESC', 'return (' + s.slice(st, j + 1) + ')')('', '');
  };
  const require = createRequire(import.meta.url), R = f => require(path.resolve(f)).PARTS;
  const has = t => t.includes(A) || NATIVE_DIGITS.some(d => t.includes(toNative(A, d)));
  const Bd = tbl('SEO_BODY_I18N'), F = tbl('SEO_FAQ_I18N'), g = R('seo-i18n/glossary.js'), h = R('seo-i18n/howto.js'), x = () => 'x';
  const out = [];
  for (const l in Bd) if (!has(Bd[l].g)) out.push('SEO_BODY_I18N.' + l + '.g');
  for (const l in F) if (!has(F[l].qa[9][1])) out.push('SEO_FAQ_I18N.' + l + '.qa[9]');
  for (const l in g) if (!has(g[l].lead)) out.push('glossary.' + l + '.lead');
  for (const l in h) if (!has(h[l].faqP(x, l))) out.push('howto.' + l + '.faqP');
  console.log(out.length ? 'no "' + A + '" in digits — spelled out? check by hand:\n  ' + out.join('\n  ') : 'every entry carries ' + A);
} else die('usage: seo-lang-count.mjs bump <old> <new> | check <n>');
