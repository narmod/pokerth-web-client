// ═══════════════════════════════════════════════════════════════════
// The director's lines in the chat: in the tournament's chat language
// (botlang/<code>.mjs, falling back to English), and cut to what the server
// accepts.
//
// The PokerTH server takes a chat line of 1 to 128 bytes (UTF-8): a longer
// one is an invalid packet and the server closes the session — the director
// would drop off the table. So every line is split into parts of at most
// CHAT_PART_BYTES (room left for the « (hh:mm) » the director adds to a line
// repeated word for word), after a sentence when it can, else between words,
// else between characters (never inside one).
// ═══════════════════════════════════════════════════════════════════

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { strings as EN } from './botlang/en.mjs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'botlang');
export const CHAT_MAX_BYTES = 128;
export const CHAT_PART_BYTES = 118;
export const BOT_EN = EN;

/** The chat languages there is a catalogue for (codes as in the app, e.g. pt-br). */
export function botLangs() {
  try { return readdirSync(DIR).filter((f) => /^[a-z]{2,3}(-[a-z0-9]{2,4})?\.mjs$/.test(f)).map((f) => f.slice(0, -4)).sort(); } catch (e) { return ['en']; }
}
export function isBotLang(code) { return typeof code === 'string' && botLangs().indexOf(code.toLowerCase()) >= 0; }

/** The strings of a chat language, English filling any gap. */
export async function loadBotStrings(code) {
  const c = String(code || 'en').toLowerCase();
  if (c === 'en' || !isBotLang(c)) return Object.assign({}, EN);
  try {
    const L = (await import(pathToFileURL(join(DIR, c + '.mjs')).href)).strings || {};
    const out = Object.assign({}, EN);
    for (const k of Object.keys(EN)) if (typeof L[k] === 'string' && L[k].trim()) out[k] = L[k];
    return out;
  } catch (e) { return Object.assign({}, EN); }
}

export function fill(s, vars) {
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? String(vars[k]) : m));
}

const bytes = (s) => Buffer.byteLength(s, 'utf8');
let wordSeg = null, graphSeg = null;
// Words (Thai, Lao, Khmer, Burmese, Chinese and Japanese have no spaces
// between words: the segmenter finds them), a word too long cut into graphemes.
function units(s) {
  let words;
  try { wordSeg = wordSeg || new Intl.Segmenter(undefined, { granularity: 'word' }); words = Array.from(wordSeg.segment(s), (x) => x.segment); } catch (e) { words = s.split(/(\s+)/).filter(Boolean); }
  const out = [];
  for (const w of words) {
    if (bytes(w) <= CHAT_PART_BYTES) { out.push(w); continue; }
    try { graphSeg = graphSeg || new Intl.Segmenter(undefined, { granularity: 'grapheme' }); for (const g of graphSeg.segment(w)) out.push(g.segment); } catch (e) { out.push(...Array.from(w)); }
  }
  return out;
}
const END = /[.!?;:。！？；：।။።]\s*$/;   // a sentence (or clause) ends with this unit

/** A line cut into parts the server accepts. */
export function splitChat(text, max) {
  max = max || CHAT_PART_BYTES;
  const all = String(text == null ? '' : text).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (bytes(all) <= max) return all ? [all] : [];
  const u = units(all);
  const out = [];
  let i = 0;
  while (i < u.length) {
    let j = i, b = 0;
    while (j < u.length && b + bytes(u[j]) <= max) { b += bytes(u[j]); j++; }
    if (j === u.length) { out.push(u.slice(i).join('').trim()); break; }
    if (j === i) j = i + 1;   // cannot happen with units of at most CHAT_PART_BYTES
    // Prefer the end of a sentence in the last two thirds, else any word end.
    const low = i + Math.floor((j - i) / 3);
    let at = j;
    for (let k = j; k > low; k--) if (END.test(u[k - 1]) || (/^\s+$/.test(u[k - 1]) && k - 2 >= i && END.test(u[k - 2]))) { at = k; break; }
    const part = u.slice(i, at).join('').trim();
    if (part) out.push(part);
    i = at;
  }
  return out.filter(Boolean);
}
