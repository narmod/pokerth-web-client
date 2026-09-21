#!/usr/bin/env node
// Step 3 source: every SEO string to translate → $LANG_WORK/seo_en.tsv, one
// `path<TAB>text` per line. English is used where the site holds it as
// structured text (FAQ, hand names and texts, how-to steps, glossary); the rest
// only exists in English as inline HTML, so those rows carry a reference
// language instead, prefixed `[xx] ` (default fr).
//   node scripts/lang-tools/seo-dump.mjs [ref]
import fs from 'fs';
import path from 'path';
import { WORK, die } from './_lib.mjs';
import { flatLang, englishPositional } from './_seo.mjs';

const ref = process.argv[2] || 'fr';
const shape = flatLang(ref), en = { ...flatLang('en'), ...englishPositional() };
if (!Object.keys(shape).length) die('no SEO entry for reference language ' + ref);
fs.mkdirSync(WORK, { recursive: true });
const lines = Object.keys(shape).map(k => k + '\t' + (en[k] != null && en[k] !== '' ? en[k] : '[' + ref + '] ' + shape[k]).replace(/\n/g, '\\n'));
fs.writeFileSync(path.join(WORK, 'seo_en.tsv'), lines.join('\n') + '\n');
console.log(lines.length + ' strings → ' + path.join(WORK, 'seo_en.tsv') + ' (' + lines.filter(l => l.includes('\t[' + ref + '] ')).length + ' from ' + ref + ')');
