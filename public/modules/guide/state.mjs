// ═══════════════════════════════════════════════════════════════════
// Ace's Help — saved progress (web extension, narmod 2026-09-30).
//
// Four localStorage keys:
//   pth_guide_on       '1' / '0'  the help is on (option, synced like any
//                                 other web option through _CFG_WEB_SYNC_KEYS)
//   pth_guide_offered  '1'        the first-launch offer was answered
//   pth_guide_seen     JSON       { r: resetMs, s: { <context id>: seenMs } }
//   pth_guide_offer_n  '1'…'3'    how many times the offer was shown on this
//                                 device without an answer (web.6): after
//                                 OFFER_MAX_SHOWS it is not proposed again
//                                 here — the help stays one tap away (login
//                                 button, Advanced options). Local only.
//
// pth_guide_offered and pth_guide_seen travel with the pokerth.net account
// on the /prefs-web channel (pokerth.js, _GUIDE_SYNC_KEYS) and are MERGED,
// never overwritten, like trophies and the forum read state: offered on one
// device = offered everywhere, a tip seen on the phone is not shown again on
// the desktop. « Show all tips again » stores a reset time: every tip seen
// before it is forgotten, on every device, and later sightings survive.
// Guests have no /prefs-web channel: their progress stays on the device.
//
// The merge helpers are pure (no DOM, no storage) — scripts/test-guide-state.mjs.
// ═══════════════════════════════════════════════════════════════════

export const KEY_ON = 'pth_guide_on';
export const KEY_OFFERED = 'pth_guide_offered';
export const KEY_SEEN = 'pth_guide_seen';
export const KEY_OFFER_N = 'pth_guide_offer_n';
/** Offer shown this many times with no answer: it stops coming back on this device. */
export const OFFER_MAX_SHOWS = 3;
/** Keys merged on the account channel (pokerth.js _GUIDE_SYNC_KEYS). */
export const SYNC_KEYS = [KEY_OFFERED, KEY_SEEN];

const MAX_IDS = 64;          // far more than there will ever be contexts
const ID_RE = /^[a-z0-9][a-z0-9_.-]{0,39}$/;

/** Parses a stored seen value; anything malformed is an empty record. */
export function parseSeen(raw) {
  const out = { r: 0, s: {} };
  if (typeof raw !== 'string' || !raw || raw.length > 20000) return out;
  let o;
  try { o = JSON.parse(raw); } catch (e) { return out; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return out;
  const r = Number(o.r);
  out.r = Number.isFinite(r) && r > 0 ? Math.floor(r) : 0;
  const s = o.s && typeof o.s === 'object' && !Array.isArray(o.s) ? o.s : {};
  for (const id of Object.keys(s)) {
    const ts = Number(s[id]);
    if (ID_RE.test(id) && Number.isFinite(ts) && ts > out.r) out.s[id] = Math.floor(ts);
  }
  return out;
}

/** Stable text form (sorted ids, bounded to the most recent MAX_IDS). */
export function serializeSeen(rec) {
  let ids = Object.keys(rec.s || {}).filter((id) => ID_RE.test(id) && rec.s[id] > (rec.r || 0));
  if (ids.length > MAX_IDS) ids = ids.sort((a, b) => rec.s[b] - rec.s[a]).slice(0, MAX_IDS);
  ids.sort();
  const s = {};
  for (const id of ids) s[id] = rec.s[id];
  return JSON.stringify({ r: rec.r || 0, s });
}

/**
 * Union of two seen records: the latest reset wins, then every sighting after
 * it is kept (the earliest time when both devices saw the same tip).
 */
export function mergeSeen(a, b) {
  const r = Math.max(a.r || 0, b.r || 0);
  const s = {};
  for (const rec of [a, b]) {
    for (const id of Object.keys(rec.s || {})) {
      const ts = rec.s[id];
      if (!(ts > r)) continue;
      s[id] = s[id] ? Math.min(s[id], ts) : ts;
    }
  }
  return { r, s };
}

/**
 * Merges the account blob `o` into the local values.
 * @param {object} o          blob received from /prefs-web
 * @param {{offered: string|null, seen: string|null}} mine  local raw values
 * @returns {{ offered: string|null, seen: string|null, needPush: boolean, changed: boolean }}
 *          new local raw values (null = leave as is), whether the account
 *          knows less than this device, whether anything local changed.
 */
export function mergeIn(o, mine) {
  const res = { offered: null, seen: null, needPush: false, changed: false };
  if (!o || typeof o !== 'object') return res;
  // offered: '1' anywhere = '1' everywhere
  const theirsOff = o[KEY_OFFERED] === '1';
  const mineOff = mine.offered === '1';
  if (theirsOff && !mineOff) { res.offered = '1'; res.changed = true; }
  if (mineOff && !theirsOff) res.needPush = true;
  // seen: union after the latest reset
  const rawT = o[KEY_SEEN];
  if (typeof rawT === 'string' && rawT.length <= 20000) {
    const theirs = parseSeen(rawT), local = parseSeen(mine.seen);
    const merged = serializeSeen(mergeSeen(local, theirs));
    const localNorm = serializeSeen(local);
    if (merged !== serializeSeen(theirs)) res.needPush = true;
    if (merged !== localNorm) { res.seen = merged; res.changed = true; }
    else if (mine.seen != null && mine.seen !== merged) res.seen = merged;   // same content, tidier text
  } else {
    const l = parseSeen(mine.seen);
    if (l.r || Object.keys(l.s).length) res.needPush = true;   // the account has none yet
  }
  return res;
}

/**
 * The saved progress on a storage (localStorage in the page, a Map-backed
 * stub in the tests). `onChange(key)` runs after every write (sync mark).
 */
export function createState(storage, onChange, now = () => Date.now()) {
  const get = (k) => { try { return storage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { storage.setItem(k, v); } catch (e) {} try { if (onChange) onChange(k); } catch (e) {} };
  return {
    isOn: () => get(KEY_ON) === '1',
    setOn(on) { set(KEY_ON, on ? '1' : '0'); },
    wasOffered: () => get(KEY_OFFERED) === '1',
    markOffered() { if (get(KEY_OFFERED) !== '1') set(KEY_OFFERED, '1'); },
    /** Times the offer was shown on this device (not synced, no onChange). */
    offerShows() { const n = parseInt(get(KEY_OFFER_N) || '0', 10); return Number.isFinite(n) && n > 0 ? Math.min(n, 999) : 0; },
    /** One more showing; returns the new count (1 = first time on this device). */
    countOfferShow() {
      const n = this.offerShows() + 1;
      try { storage.setItem(KEY_OFFER_N, String(n)); } catch (e) {}
      return n;
    },
    /** Shown OFFER_MAX_SHOWS times and never answered: not proposed again here. */
    offerTired() { return this.offerShows() >= OFFER_MAX_SHOWS; },
    seen: (id) => !!parseSeen(get(KEY_SEEN)).s[id],
    markSeen(id) {
      if (!ID_RE.test(id)) return;
      const rec = parseSeen(get(KEY_SEEN));
      if (rec.s[id]) return;
      rec.s[id] = Math.max(now(), rec.r + 1);
      set(KEY_SEEN, serializeSeen(rec));
    },
    /** « Show all tips again »: forgets every tip seen so far, on every device. */
    resetSeen() { set(KEY_SEEN, serializeSeen({ r: now(), s: {} })); },
    seenIds: () => Object.keys(parseSeen(get(KEY_SEEN)).s).sort(),
    raw: () => ({ offered: get(KEY_OFFERED), seen: get(KEY_SEEN) }),
    /** Applies a mergeIn() result to the storage (no sync mark: it came from the account). */
    applyMerge(m) {
      try { if (m.offered != null) storage.setItem(KEY_OFFERED, m.offered); } catch (e) {}
      try { if (m.seen != null) storage.setItem(KEY_SEEN, m.seen); } catch (e) {}
    },
  };
}
