// ═══════════════════════════════════════════════════════════════════
// Ace's Help — texts (web extension, narmod 2026-09-30).
//
// The Ace's texts live in their own catalogues, modules/guide/lang/<code>.mjs
// (lower-case code, like help/content/), loaded on demand — only when the
// help is on — so the main UI catalogues do not grow for a feature most
// players never turn on (i18n exception approved by Arnaud on 2026-09-28).
// Fallback: language → base language (pt-br → pt) → English → the key.
// Placeholders: {name}, filled by gt(key, vars).
// English (lang/en.mjs) is the reference; every key exists in every file
// (scripts/test-guide-lang.mjs).
// ═══════════════════════════════════════════════════════════════════

import { getLang, onLangChange } from '../i18n.mjs';
import { fill } from './core.mjs';
import EN from './lang/en.mjs';

let cur = EN;          // catalogue of the current language (EN until loaded)
let curCode = 'en';
let loading = null;

function code() {
  try { return String(getLang() || 'en').toLowerCase(); } catch (e) { return 'en'; }
}

/** Loads the catalogue of the current language (resolves when ready). */
export function ready() {
  const c = code();
  if (c === curCode && !loading) return Promise.resolve();
  if (loading && loading.code === c) return loading.p;
  const attempt = (l) => (l === 'en' ? Promise.resolve({ default: EN }) : import('./lang/' + l + '.mjs'));
  const p = attempt(c)
    .catch(() => attempt(c.split('-')[0]))
    .catch(() => ({ default: EN }))
    .then((m) => { cur = (m && m.default) || EN; curCode = c; })
    .finally(() => { if (loading && loading.p === p) loading = null; });
  loading = { code: c, p };
  return p;
}

/** Text of a key in the current language, placeholders filled. */
export function gt(key, vars) {
  let s = cur[key];
  if (s == null) s = EN[key];
  if (s == null) s = key;
  return fill(s, vars);
}

try { onLangChange(() => { ready(); }); } catch (e) {}
