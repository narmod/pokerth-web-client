// ═══════════════════════════════════════════════════════════════════
// Ace's Help — « More help »: the help window's knowledge, read by the Ace
// (H1, web.267). No DOM: the corpus is modules/help/content/<lang>.mjs
// (83 languages, the same texts as the help window), split into short
// pages for his bubble. modules/guide/index.mjs renders them; the pure
// helpers are tested by scripts/test-guide-help.mjs.
// ═══════════════════════════════════════════════════════════════════

const cache = {};

/** The help corpus of a language (base language, then English as fallbacks). */
export function loadHelp(lang) {
  const lg = String(lang || 'en').toLowerCase();
  if (cache[lg]) return cache[lg];
  const attempt = (l) => import('../help/content/' + l + '.mjs');
  cache[lg] = attempt(lg)
    .catch(() => attempt(lg.split('-')[0]))
    .catch(() => attempt('en'))
    .then((m) => (m && m.help && Array.isArray(m.help.chapters) ? m.help : { chapters: [] }))
    .catch(() => ({ chapters: [] }));
  return cache[lg];
}

/** The chapter that fits a screen of where() (same choice as the help window). */
export function chapterFor(screen) {
  if (screen === 'game') return 'game';
  if (screen === 'lobby' || screen === 'wait' || screen === 'create') return 'lobby';
  return 'start';
}

/** Case- and accent-insensitive text, for the search. */
export function fold(s) {
  try { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  catch (e) { return String(s == null ? '' : s).toLowerCase(); }
}

const notes = (s) => (Array.isArray(s.note) ? s.note : s.note ? [s.note] : []);

/** Finds a chapter and a section by id: { ch, sec } or null. */
export function findSection(help, chId, secId) {
  const ch = (help && help.chapters || []).find((c) => c.id === chId);
  const sec = ch && (ch.sections || []).find((s) => s.id === secId);
  return sec ? { ch, sec } : null;
}

/** Sections whose title or text contain the query (2 characters at least), at most `max`. */
export function search(help, q, max = 40) {
  const k = fold(String(q || '').trim());
  if (k.length < 2) return [];
  const hits = [];
  for (const ch of (help && help.chapters) || []) {
    for (const sec of ch.sections || []) {
      const hay = [sec.t, (sec.b || []).join(' '), (sec.list || []).join(' '),
        (sec.keys || []).map((r) => r.join(' ')).join(' '), notes(sec).join(' ')].map(fold).join(' ');
      if (hay.indexOf(k) >= 0) hits.push({ ch, sec });
      if (hits.length >= max) return hits;
    }
  }
  return hits;
}

/** A long paragraph cut at sentence ends, ~maxChars per piece (never inside a sentence). */
export function splitText(text, maxChars = 420) {
  const s = String(text || '').trim();
  if (s.length <= maxChars) return s ? [s] : [];
  // a sentence ends with . ! ? (and the Indic । ॥, the Burmese ။, the Urdu ۔ and Arabic ؟) followed by a space — not
  // « pokerth.net » or « 2.5 » —, or with the CJK 。！？
  // no regex lookbehind: Safari < 16.4 refuses it at parse time and the whole module would fail to load
  const parts = [];
  const re = /[.!?…।॥။۔؟][)»”’"]*(\s+)|[。！？]/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    parts.push(s.slice(last, m.index + m[0].length - (m[1] ? m[1].length : 0)));
    last = m.index + m[0].length;
  }
  parts.push(s.slice(last));
  for (let i = parts.length - 1; i >= 0; i--) if (!parts[i]) parts.splice(i, 1);
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (cur && (cur + ' ' + p).length > maxChars) { out.push(cur.trim()); cur = ''; }
    cur += (cur && !/[。！？]$/.test(cur) ? ' ' : '') + p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/**
 * The pages of a section for the bubble, in order: every paragraph (long
 * ones cut), the list by 5, the keys by 6, then the notes.
 * Page = { kind: 'p' | 'list' | 'keys' | 'note', items: [...] }.
 */
export function pages(sec, o = {}) {
  const maxChars = o.maxChars || 420, perList = o.perList || 5, perKeys = o.perKeys || 6;
  const out = [];
  for (const b of sec.b || []) for (const piece of splitText(b, maxChars)) out.push({ kind: 'p', items: [piece] });
  const list = sec.list || [];
  for (let i = 0; i < list.length; i += perList) out.push({ kind: 'list', items: list.slice(i, i + perList) });
  const keys = sec.keys || [];
  for (let i = 0; i < keys.length; i += perKeys) out.push({ kind: 'keys', items: keys.slice(i, i + perKeys) });
  for (const n of notes(sec)) for (const piece of splitText(n, maxChars)) out.push({ kind: 'note', items: [piece] });
  if (!out.length) out.push({ kind: 'p', items: [sec.t || ''] });
  return out;
}
