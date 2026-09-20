// Shared helpers for scripts/lang-tools — see README.md in this folder.
import fs from 'fs';
import path from 'path';

export const ROOT = process.cwd();
export const WORK = path.resolve(process.env.LANG_WORK || '.lang-work');
export const LANG_DIR = path.join(ROOT, 'public/modules/lang');
export const HELP_DIR = path.join(ROOT, 'public/modules/help/content');

export function die(msg) { console.error('ERROR: ' + msg); process.exit(1); }

// Tokenise the `strings` object of a catalogue without evaluating it, so the
// file can be rebuilt with its comments, key order and line layout intact.
// Returns [{t:'raw',s} | {t:'val',key,src}]; `src` is the literal, quotes included.
export function tokenizeCatalogue(src) {
  const head = 'export const strings = {';
  const start = src.indexOf(head);
  if (start < 0) die('no `export const strings = {` in catalogue');
  let i = start + head.length, raw = '';
  const segs = [{ t: 'raw', s: src.slice(0, i) }], n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); raw += src.slice(i, e); i = e; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i) + 2; raw += src.slice(i, e); i = e; continue; }
    const m = /^([A-Za-z_$][\w$]*|'[^']+'|"[^"]+")(\s*:\s*)/.exec(src.slice(i, i + 200));
    if (m) {
      const j = i + m[0].length, q = src[j];
      if (q !== "'" && q !== '"' && q !== '`') die('non-string value at key ' + m[1]);
      let k = j + 1;
      while (src[k] !== q) { if (src[k] === '\\') k++; k++; }
      k++;
      segs.push({ t: 'raw', s: raw + m[0] }); raw = '';
      segs.push({ t: 'val', key: m[1].replace(/^['"]|['"]$/g, ''), src: src.slice(j, k) });
      i = k; continue;
    }
    raw += c; i++;
  }
  segs.push({ t: 'raw', s: raw });
  return segs;
}

// Translation chunks: one `key<space>value` per line (keys never contain a
// space, values may). Files <prefix>1.txt, <prefix>2.txt… are merged in order.
export function readChunks(prefix) {
  if (!fs.existsSync(WORK)) die('work dir not found: ' + WORK);
  const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\d+)\\.txt$');
  const files = fs.readdirSync(WORK).filter(f => re.test(f))
    .sort((a, b) => +re.exec(a)[1] - +re.exec(b)[1]);
  if (!files.length) die('no ' + prefix + 'N.txt chunk in ' + WORK);
  const tr = {};
  for (const f of files) for (const line of fs.readFileSync(path.join(WORK, f), 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const sp = line.indexOf(' ');
    if (sp < 0) die(f + ': no value on line "' + line + '"');
    const k = line.slice(0, sp);
    if (k in tr) die(f + ': duplicate key ' + k);
    tr[k] = line.slice(sp + 1);
  }
  return tr;
}

export const sq = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";

// Replace `a` by `b` in a file, failing unless it occurs exactly `count` times.
export function replaceExact(file, a, b, count = 1) {
  const s = fs.readFileSync(file, 'utf8'), n = s.split(a).length - 1;
  if (n !== count) die(file + ': expected ' + count + '× "' + a.slice(0, 60) + '", found ' + n);
  fs.writeFileSync(file, s.split(a).join(b));
}

// Native-digit scripts used for the language count somewhere in the repo.
export const NATIVE_DIGITS = ['০১২৩৪৫৬৭৮৯', '០១២៣៤៥៦៧៨៩', '۰۱۲۳۴۵۶۷۸۹', '٠١٢٣٤٥٦٧٨٩', '၀၁၂၃၄၅၆၇၈၉'];
export const toNative = (n, digits) => [...String(n)].map(c => digits[+c]).join('');
export const uEscape = t => [...t].map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
