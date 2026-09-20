#!/usr/bin/env node
// Parity of a catalogue against en.mjs: keys, {placeholders}, `||` separators,
// <b> tags / %1 tokens, trailing spaces — and which values stayed English,
// compared with a reference catalogue (default: is) to spot forgotten keys.
//   node scripts/lang-tools/catalogue-parity.mjs <code> [reference]
import path from 'path';
import { pathToFileURL } from 'url';
import { LANG_DIR } from './_lib.mjs';

const [code, ref = 'is'] = process.argv.slice(2);
const load = c => import(pathToFileURL(path.join(LANG_DIR, c + '.mjs')).href);
const [xx, en, rf] = await Promise.all([load(code), load('en'), load(ref)]);
const E = en.strings, X = xx.strings, keys = Object.keys(E);
const ph = s => (String(s).match(/\{[a-z0-9]+\}/gi) || []).sort().join();
const bars = s => (s.match(/\|\|/g) || []).length;
const tags = s => (s.match(/<\/?b>|%\d/g) || []).sort().join();
const both = keys.filter(k => k in X);
const report = {
  missing: keys.filter(k => !(k in X)),
  extra: Object.keys(X).filter(k => !(k in E)),
  placeholderDrift: both.filter(k => ph(E[k]) !== ph(X[k])),
  separatorDrift: both.filter(k => bars(E[k]) !== bars(X[k])),
  tagDrift: both.filter(k => tags(E[k]) !== tags(X[k])),
  trailingSpaceDrift: both.filter(k => /\s$/.test(E[k]) !== /\s$/.test(X[k])),
};
const refSame = new Set(keys.filter(k => E[k] === rf.strings[k]));
const same = both.filter(k => E[k] === X[k]);
let bad = 0;
for (const [k, v] of Object.entries(report)) { console.log(k + ':', v.length ? v.join(' ') : '—'); bad += v.length; }
console.log('\nsame as English but translated in ' + ref + ' (review — loanwords are fine):');
console.log(same.filter(k => !refSame.has(k)).map(k => k + '=' + E[k]).join(' | ') || '—');
console.log('\nkept English in ' + ref + ' but translated here (review):');
console.log([...refSame].filter(k => k in X && E[k] !== X[k]).map(k => k + '=' + X[k]).join(' | ') || '—');
process.exit(bad ? 1 : 0);
