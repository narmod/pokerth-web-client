#!/usr/bin/env node
// Step-2 wiring of docs/ADDING_A_LANGUAGE.md, once lang/<code>.mjs and
// help/content/<code>.mjs exist:
//   node scripts/lang-tools/wire-language.mjs <code> <oldCount> <newCount> --after <code2> [--bump <oldVer> <newVer>]
// - language count in every other help corpus (native digits included), in
//   README.md, docs/PROJECT.md, docs/ROADMAP.md, the two live/ comments and
//   gen-lang-meta.mjs — only where the number is followed by a word that names
//   languages; every changed line is printed: READ THEM.
// - sw.js precache (both files, inserted after <code2>'s entries)
// - admin.html WC_LANGS
// - guest / registered / LAN notices in proxy.js, from
//   $LANG_WORK/<code>_notices.json = { guest:{title,body}, auth:{…}, lan:{…} },
//   inserted after <code2>'s entry
// - optional version bump of the three served files
// Then run `node scripts/gen-lang-meta.mjs`, update both changelogs, run the tests.
import fs from 'fs';
import path from 'path';
import { WORK, HELP_DIR, NATIVE_DIGITS, toNative, replaceExact, die } from './_lib.mjs';

const a = process.argv.slice(2), [code, oldN, newN] = a;
const opt = (n, k = 1) => { const i = a.indexOf(n); return i < 0 ? null : a.slice(i + 1, i + 1 + k); };
const after = (opt('--after') || [])[0], bump = opt('--bump', 2);
if (!code || !/^\d+$/.test(oldN || '') || !/^\d+$/.test(newN || '') || !after) die('usage: see header');
const rd = f => fs.readFileSync(f, 'utf8'), wr = (f, s) => fs.writeFileSync(f, s);

// 1. help corpora
for (const f of fs.readdirSync(HELP_DIR).filter(f => f.endsWith('.mjs') && f !== code + '.mjs')) {
  const file = path.join(HELP_DIR, f), s = rd(file);
  const forms = [oldN, ...NATIVE_DIGITS.map(d => toNative(oldN, d))].filter(x => s.includes(x));
  if (forms.length !== 1) die(f + ': count written ' + forms.length + ' ways — fix by hand');
  replaceExact(file, forms[0], forms[0] === oldN ? newN : toNative(newN, NATIVE_DIGITS.find(d => toNative(oldN, d) === forms[0])));
}
// 2. counted phrases
const pat = new RegExp('\\b' + oldN + '(?=[ -](?:languages?\\b|language catalogues|locales|files, ~))', 'g');
for (const f of ['README.md', 'docs/PROJECT.md', 'docs/ROADMAP.md', 'public/modules/live/lobby.mjs',
  'public/modules/live/spectate-dialog.mjs', 'scripts/gen-lang-meta.mjs']) {
  let n = 0;
  wr(f, rd(f).split('\n').map(l => { const r = l.replace(pat, newN); if (r !== l) { n++; console.log('  ~ ' + f + ': ' + r.trim().slice(0, 110)); } return r; }).join('\n'));
  if (!n) die(f + ': no "' + oldN + ' languages" phrase found');
}
// 3. sw.js precache
for (const kind of ['help/content', 'lang']) {
  const anchor = `  '/modules/${kind}/${after}.mjs',\n`;
  replaceExact('public/sw.js', anchor, anchor + `  '/modules/${kind}/${code}.mjs',\n`);
}
// 4. admin WC_LANGS (kept in its existing order; inserted alphabetically)
{
  const s = rd('public/admin.html'), m = /var WC_LANGS=\[([^\]]*)\];/.exec(s);
  if (!m) die('WC_LANGS not found');
  const L = m[1].split(',').map(x => x.trim().replace(/'/g, ''));
  if (L.includes(code)) die(code + ' already in WC_LANGS');
  const i = L.findIndex(x => x > code && x !== 'sq');
  L.splice(i < 0 ? L.length : i, 0, code);
  wr('public/admin.html', s.replace(m[0], 'var WC_LANGS=[' + L.map(x => `'${x}'`).join(',') + '];'));
}
// 5. notices
{
  const N = JSON.parse(rd(path.join(WORK, code + '_notices.json')));
  let s = rd('proxy.js');
  for (const [tbl, key] of [['GUEST_NOTICE_DEFAULT_LANGS', 'guest'], ['AUTH_NOTICE_DEFAULT_LANGS', 'auth'], ['LAN_NOTICE_DEFAULT_LANGS', 'lan']]) {
    const i = s.indexOf('const ' + tbl + ' = {'), j = s.indexOf('\n};', i);
    if (i < 0) die(tbl + ' not found');
    let blk = s.slice(i, j); const anchor = `\n  "${after}": {`;
    if (blk.split(anchor).length !== 2) die(tbl + ': anchor "' + after + '" not unique');
    const k = blk.indexOf(anchor), e = blk.indexOf('\n', k + 1) < 0 ? blk.length : blk.indexOf('\n', k + 1);
    blk = blk.slice(0, e) + `\n  "${code}": { title: ${JSON.stringify(N[key].title)}, body: ${JSON.stringify(N[key].body)} },` + blk.slice(e);
    s = s.slice(0, i) + blk + s.slice(j);
  }
  wr('proxy.js', s);
}
// 6. version
if (bump) {
  const [o, n] = bump;
  replaceExact('public/sw.js', 'pokerth-v' + o, 'pokerth-v' + n);
  replaceExact('public/pokerth.js', `window.BUILD_VERSION='${o}'`, `window.BUILD_VERSION='${n}'`);
  replaceExact('package.json', `"version": "${o}"`, `"version": "${n}"`);
}
console.log('wired ' + code + ' — now: node scripts/gen-lang-meta.mjs, changelogs, tests');
