/* test-lang-count — claims about how many languages the client speaks must
 * match the catalogue on disk.
 *
 * The figure was stated as 40 in several places written long after the fourth
 * RTL batch took it there, and nobody counted. It is now 45. Historical
 * CHANGELOG entries are exempt: "bringing the client to 40 languages" was
 * true when it was written, and a changelog is a record, not a status page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-lang-count');

const langs = fs.readdirSync(path.join(root, 'public', 'modules', 'lang'))
  .filter(f => f.endsWith('.mjs'));
const help = fs.readdirSync(path.join(root, 'public', 'modules', 'help', 'content'))
  .filter(f => f.endsWith('.mjs'));

const N = langs.length;
console.log('  (catalogue on disk: ' + N + ' languages)');

check('every UI catalogue has a help corpus', help.length === N);
check('english is present', langs.includes('en.mjs'));

// Files that describe the client as it is now. The CHANGELOG is deliberately
// absent: its old entries record older counts and must not be rewritten.
const CURRENT = [
  'README.md',
  'docs/PROJECT.md',
  'public/modules/live/lobby.mjs',
  'public/modules/live/spectate-dialog.mjs',
];
for (const rel of CURRENT) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8');
  const stale = txt.match(/\b(\d{2}) (?:languages|locales|langues)\b/g) || [];
  const wrong = stale.filter(m => parseInt(m, 10) !== N);
  check(rel + ' states the real count', wrong.length === 0);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
