#!/usr/bin/env node
// Dumps the English help corpus as `path|field<TAB>text` lines into
// $LANG_WORK/help_en.tsv. Paths: <chapter>|title, <chapter>.<section>|t, |note,
// |b0…, |list0…, |keys0… (the key names themselves are shown in ⟦…⟧ and are
// not translated).
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { HELP_DIR, WORK, die } from './_lib.mjs';

const { help } = await import(pathToFileURL(path.join(HELP_DIR, 'en.mjs')).href);
const out = [];
for (const c of help.chapters) {
  out.push(`${c.id}|title\t${c.title}`);
  for (const s of c.sections) {
    const p = `${c.id}.${s.id}`;
    for (const k of Object.keys(s)) {
      if (k === 'id') continue;
      if (k === 't' || k === 'note') out.push(`${p}|${k}\t${s[k]}`);
      else if (k === 'b' || k === 'list') s[k].forEach((v, i) => out.push(`${p}|${k}${i}\t${v}`));
      else if (k === 'keys') s[k].forEach((v, i) => out.push(`${p}|keys${i}\t${v[1]}   ⟦${v[0]}⟧`));
      else die('unknown help field ' + p + '.' + k + ' — teach help-dump/help-build about it');
    }
  }
}
fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(path.join(WORK, 'help_en.tsv'), out.join('\n') + '\n');
console.log(out.length + ' strings → ' + path.join(WORK, 'help_en.tsv'));
