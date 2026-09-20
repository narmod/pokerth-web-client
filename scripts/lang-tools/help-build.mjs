#!/usr/bin/env node
// Builds public/modules/help/content/<code>.mjs from the structure of en.mjs
// and the chunks $LANG_WORK/<code>hN.txt (`path|field<space>text` per line,
// paths as printed by help-dump.mjs). Fails on a missing or unused path, then
// checks that the result has exactly the shape of en.mjs.
//   node scripts/lang-tools/help-build.mjs <code> <English name> <native label>
// Convention of the other corpora: action terms AND the hand names of the
// rules chapter (and of info.odds) stay in English.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { HELP_DIR, readChunks, die } from './_lib.mjs';

const [code, enName, native] = process.argv.slice(2);
if (!code || !enName || !native) die('usage: help-build.mjs <code> <English name> <native label>');
const { help } = await import(pathToFileURL(path.join(HELP_DIR, 'en.mjs')).href);
const tr = readChunks(code + 'h'), used = new Set(), J = JSON.stringify;
const T = k => { if (!(k in tr)) die('missing ' + k); used.add(k); return tr[k]; };

let o = `// ── help/content/${code}.mjs — ${enName} (${native}) help corpus ${'─'.repeat(20)}\n//\n` +
  '// Same structure as en.mjs (reference): chapters[] → { id, icon, title,\n' +
  '// sections[] }, section = { id, t, b[], list[], keys[[kbd,label]], note }.\n' +
  '// Poker action terms (Fold, Check, Call, Bet, Raise, All-In) and the hand\n' +
  '// names of the rules chapter stay in English, as in the other help corpora.\n' +
  'export const help = {\n  chapters: [\n';
o += help.chapters.map(c => {
  const secs = c.sections.map(sec => {
    const p = `${c.id}.${sec.id}`, parts = [];
    for (const k of Object.keys(sec)) {
      if (k === 'id') continue;
      if (k === 't' || k === 'note') parts.push(`          ${k}: ${J(T(p + '|' + k))}`);
      else if (k === 'b' || k === 'list') parts.push(`          ${k}: [\n` + sec[k].map((_, i) => `            ${J(T(p + '|' + k + i))}`).join(',\n') + ']');
      else if (k === 'keys') parts.push('          keys: [\n' + sec[k].map((v, i) => `            [${J(v[0])}, ${J(T(p + '|keys' + i))}]`).join(',\n') + ']');
      else die('unknown help field ' + p + '.' + k);
    }
    return `        { id: ${J(sec.id)},\n` + parts.join(',\n') + ' }';
  }).join(',\n');
  return `    {\n      id: ${J(c.id)}, icon: ${J(c.icon)}, title: ${J(T(c.id + '|title'))},\n      sections: [\n${secs}\n      ]\n    }`;
}).join(',\n');
o += '\n  ]\n};\n';
const unused = Object.keys(tr).filter(k => !used.has(k));
if (unused.length) die('unused paths: ' + unused.join(', '));
const file = path.join(HELP_DIR, code + '.mjs');
fs.writeFileSync(file, o);

const shape = h => J(h.chapters.map(c => [c.id, c.icon, c.sections.map(s =>
  [s.id, Object.keys(s).join(), (s.b || []).length, (s.list || []).length, (s.keys || []).map(k => k[0])])]));
const built = await import(pathToFileURL(file).href + '?v=' + Date.now());
if (shape(built.help) !== shape(help)) die('shape differs from en.mjs');
console.log(used.size + ' strings, shape identical to en.mjs → ' + file);
