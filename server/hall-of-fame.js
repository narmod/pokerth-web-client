'use strict';
// ═══════════════════════════════════════════════════════════════════
// The mini-games' Hall of Fame (design note claude/CONCEPTION_HALL_OF_FAME.md,
// narmod 2026-11-16) — arcade-style best scores of everyone who plays from
// the web client. Pure: no I/O, no clock of its own (proxy.js passes `now`,
// stores the state in hall-of-fame.json); scripts/test-hall-of-fame.mjs drives it.
//
// The admin chooses whether there is a Hall of Fame and the name shown beside a
// score (_adminConfig.hofNames):
//   off       no Hall of Fame (the default, narmod 2026-11-16): no ticket, no
//             score, no board, no account token handed out;
//   account   the pokerth.net nickname, proved by a Hall of Fame token the
//             proxy hands out when the real PokerTH server accepted an
//             AUTHENTICATED login (guests never get one), valid TOKEN_DAYS;
//   initials  three letters or digits, as on an arcade machine;
//   free      a free nickname, 2 to 12 characters, through a word filter.
// Each setting has its own boards (narmod: « un tableau par réglage »): coming
// back to a setting brings its scores back.
//
// Each line remembers who may take it back (web.97, narmod: « some people will
// not want to take part »): the hash of a random key the browser keeps
// (pth_hof_dev), never shown; forget() removes a player's lines — the device's,
// and with an account token every line of that nickname.
//
// Boards: '<names>/<game>:<mode>' keeps the TOP best, '<names>/<game>:<daily mode>:<day>'
// the TOP_DAY best of a daily challenge (DAYS_KEPT days kept). One line per name
// and board (its best), so a player cannot fill a board alone.
//
// Not cheat-proof (the score is counted in the browser), only tedious to fake:
// a run must start with a ticket signed here (HMAC, nothing stored), the score
// must be possible in the time since that ticket (GAMES[g].perSec), and the
// proxy limits the submissions per address (in memory) and per name.
// ═══════════════════════════════════════════════════════════════════

const crypto = require('crypto');

const NAMES = Object.freeze(['off', 'account', 'initials', 'free']);
/** The settings that keep boards (all but 'off'). */
const RANKED = Object.freeze(['account', 'initials', 'free']);
const TOP = 20, TOP_DAY = 10, DAYS_KEPT = 7;
const TOKEN_DAYS = 90, TOKENS_PER_NAME = 5, TOKENS_MAX = 50000;
const TICKET_MAX_MS = 6 * 3600 * 1000;   // a run longer than this is not ranked
const NAME_GAP_MS = 5000;                 // one score per name every 5 s at most
// The games that may be ranked (pilot: Ace Runner) and the most a second of play
// can bring (Ace Runner: ≈ 99 m/s at top speed, ×2 in All-In, ×4 with a royal flush).
const GAMES = Object.freeze({
  'ace-runner': { modes: ['free', 'daily', 'time'], daily: 'daily', perSec: 800, base: 2000 },
  // Tapis! (web.122: every pay ÷10 or so, the level's weight ×(1 + (level − 1)/4)): a round of ≈ 60 s pays
  // ≈ 2 000 at level 10, a royal flush of cards 10 × 50 × that — the Duel is not ranked. Kept loose.
  tapis: { modes: ['classic', 'folie', 'daily', 'zen'], daily: 'daily', perSec: 1000, base: 20000 },
  // Ace Dash (web.99): ≈ 29 m/s at top speed, ×2 in All-In, chips 10 × a streak of 5 × 2 (gold),
  // the pool's rows, all × 4 with a royal flush.
  'ace-dash': { modes: ['free', 'daily', 'time'], daily: 'daily', perSec: 3000, base: 5000 },
  // Poker Run (web.100): (chips + 5 a second left) × the hand (×50 a royal) × the Queen's hearts (×2.8 at most).
  'poker-run': { modes: ['free', 'queen', 'daily'], daily: 'daily', perSec: 30000, base: 50000 },
  // Video Poker (web.100): the credits left, a game per machine (free) and a daily per machine; a royal pays
  // 4 000 on 5 credits, doubled up to 5 times.
  videopoker: { modes: ['jacks', 'bonus', 'deuces', 'joker', 'day-jacks', 'day-bonus', 'day-deuces', 'day-joker'],
    daily: ['day-jacks', 'day-bonus', 'day-deuces', 'day-joker'], perSec: 20000, base: 200000 },
  // Who Wins? (web.101): endless and daily ≤ 66 points an answer (fever ×2), an answer a second at most;
  // the TV show pays its ladder, up to 1 000 000 (caps: a mode's own ceiling). The daily counts its first game only.
  whowins: { modes: ['tv', 'endless', 'daily'], daily: 'daily', perSec: 70, base: 200, caps: { tv: { base: 1000000, perSec: 0 } } },
  // Higher or Lower (web.101): the hand game's pots (×2 or so a right guess, banked); the tournaments' stack
  // can double on every All-In, so their ceiling is loose.
  hilo: { modes: ['hand', 'tourney', 'both'], perSec: 5000, base: 20000, caps: { tourney: { base: 2000000, perSec: 1000000 }, both: { base: 2000000, perSec: 1000000 } } },
  // Poker Solitaire (web.102): ten lines of 5 cards, 100 a royal at most — a ceiling, whatever the time.
  solitaire: { modes: ['daily', 'free'], daily: 'daily', perSec: 0, base: 1000 },
  // The Ace's Bluff (web.102): 100 chips and 20 hands (free, daily); the tournament 200 each, 10 a hand played.
  bluff: { modes: ['free', 'daily', 'tourney'], daily: 'daily', perSec: 100, base: 10000 },
  // The House of Cards (web.102, the easter egg): a floor of 5 cards pays its hand (gold cards, the goal met).
  house: { modes: ['free', 'daily', 'zen'], daily: 'daily', perSec: 2000, base: 20000 },
});
/** Is mode m of game G a daily challenge (its board of the day)? G.daily is a mode or a list of them. */
const isDaily = (G, m) => !!G && (Array.isArray(G.daily) ? G.daily.indexOf(m) >= 0 : m === G.daily);
// Words a free nickname may not contain (the admin adds more: _adminConfig.hofWords).
// A word of the name (or the whole name) that STARTS with one of them is refused —
// « Computer » stays fine, « Pute123 » does not.
const BASE_WORDS = Object.freeze(['fuck', 'shit', 'cunt', 'nigger', 'nigga', 'whore', 'hitler', 'nazi', 'pute', 'salope',
  'connard', 'connasse', 'encule', 'negro', 'puta', 'cabron', 'fotze', 'arschloch', 'kurwa', 'bitch']);

/** A fresh or loaded state, made safe to use. */
function normalize(st) {
  const s = st && typeof st === 'object' ? st : {};
  if (typeof s.secret !== 'string' || s.secret.length < 32) s.secret = crypto.randomBytes(32).toString('hex');
  if (!s.boards || typeof s.boards !== 'object') s.boards = {};
  if (!s.tokens || typeof s.tokens !== 'object') s.tokens = {};
  if (!s.resets || typeof s.resets !== 'object') s.resets = {};
  // Tapis!'s score was cut about 30 times (web.122, narmod: « too many digits »): its old boards could no
  // longer be beaten — dropped once (narmod's choice, as the browsers' own records).
  if (!s.resets.tapis122) { Object.keys(s.boards).forEach((k) => { if (/\/tapis:/.test(k)) delete s.boards[k]; }); s.resets.tapis122 = 1; }
  return s;
}
const namesOf = (v) => (NAMES.indexOf(v) >= 0 ? v : 'off');
const dayOf = (now) => new Date(now).toISOString().slice(0, 10);
/** Is `day` (YYYY-MM-DD) today or yesterday (a run that crossed midnight), UTC? */
function dayOk(day, now) {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && (day === dayOf(now) || day === dayOf(now - 86400000));
}
function boardKey(names, g, m, day) {
  const G = GAMES[g];
  return namesOf(names) + '/' + g + ':' + (isDaily(G, m) ? m + ':' + day : m);
}
const validGame = (g, m) => !!(GAMES[g] && GAMES[g].modes.indexOf(m) >= 0);

// ── Tickets ──────────────────────────────────────────────────────────
const sign = (st, s) => crypto.createHmac('sha256', st.secret).update(s).digest('base64url').slice(0, 22);
/** A run starts: a ticket for game g, mode m, signed with the time. */
function ticket(st, g, m, now) {
  if (!validGame(g, m)) return null;
  const body = g + '|' + m + '|' + Math.floor(now);
  return Buffer.from(body).toString('base64url') + '.' + sign(st, body);
}
/** The ticket's start time when it is ours, for g and m, and not too old; else 0. */
function ticketStart(st, tk, g, m, now) {
  if (typeof tk !== 'string' || tk.length > 200) return 0;
  const i = tk.indexOf('.');
  if (i < 0) return 0;
  let body = '';
  try { body = Buffer.from(tk.slice(0, i), 'base64url').toString(); } catch (e) { return 0; }
  const a = crypto.createHash('sha256').update(sign(st, body)).digest(), b = crypto.createHash('sha256').update(tk.slice(i + 1)).digest();
  if (!crypto.timingSafeEqual(a, b)) return 0;
  const p = body.split('|');
  if (p[0] !== g || p[1] !== m) return 0;
  const t0 = +p[2];
  return t0 > 0 && t0 <= now && now - t0 <= TICKET_MAX_MS ? t0 : 0;
}
/** Could this score be made in `secs` seconds of this game? */
function plausible(g, s, secs, m) {
  const G = GAMES[g], C = G && G.caps && m && G.caps[m] ? G.caps[m] : G;
  return !!G && Number.isInteger(s) && s > 0 && s <= C.base + C.perSec * Math.max(0, secs);
}

// ── Names ────────────────────────────────────────────────────────────
// Letters only, accents and look-alike digits folded: « Pùt3 » → « pute ».
function fold(s) {
  return String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/@/g, 'a').replace(/\$/g, 's')
    .replace(/[^a-zͰ-ϿЀ-ӿ]/g, '');
}
/** Does a word of this name, or the whole name, start with a banned word (BASE_WORDS + the admin's)? */
function rude(name, words) {
  const parts = String(name).split(/[\s._-]+/).map(fold).filter(Boolean).concat([fold(name)]);
  return BASE_WORDS.concat(Array.isArray(words) ? words : []).some((w) => { const x = fold(w); return x.length >= 3 && parts.some((p) => p.indexOf(x) === 0); });
}
/**
 * The name a player chose, cleaned for the setting, or '' when it cannot be used:
 * initials A-Z 0-9 (exactly 3, upper case); free 2-12 letters, digits, space . _ -
 * (spaces squeezed), no banned word.
 */
function cleanName(names, raw, words) {
  const s = String(raw == null ? '' : raw).normalize('NFC').trim();
  if (names === 'initials') { const u = s.toUpperCase(); return /^[A-Z0-9]{3}$/.test(u) ? u : ''; }
  if (names === 'free') {
    const n = s.replace(/\s+/g, ' ');
    if (n.length < 2 || n.length > 12 || !/^[\p{L}\p{N} ._-]+$/u.test(n) || !/[\p{L}\p{N}]/u.test(n)) return '';
    return rude(n, words) ? '' : n;
  }
  return '';
}
const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
/** The owner mark of a line: a keyed hash of the browser's key (never the key itself), '' without one. */
function ownerOf(st, dev) {
  return typeof dev === 'string' && dev.length >= 16 && dev.length <= 64 ? crypto.createHmac('sha256', st.secret).update('dev|' + dev).digest('base64url').slice(0, 16) : '';
}
/** Is this name blocked by the admin (_adminConfig.hofBans)? */
const banned = (name, bans) => Array.isArray(bans) && bans.some((b) => same(b, name));

// ── Account tokens ───────────────────────────────────────────────────
/** An authenticated login: a token for this nickname (TOKEN_DAYS), the oldest of its own dropped past TOKENS_PER_NAME. */
function issueToken(st, nick, now) {
  const n = String(nick || '').slice(0, 64);
  if (!n) return null;
  const mine = Object.keys(st.tokens).filter((k) => same(st.tokens[k].n, n)).sort((a, b) => st.tokens[a].exp - st.tokens[b].exp);
  while (mine.length >= TOKENS_PER_NAME) delete st.tokens[mine.shift()];
  const keys = Object.keys(st.tokens);
  if (keys.length >= TOKENS_MAX) { keys.sort((a, b) => st.tokens[a].exp - st.tokens[b].exp); for (let i = 0; i < keys.length - TOKENS_MAX + 1; i++) delete st.tokens[keys[i]]; }
  const tok = crypto.randomBytes(24).toString('base64url');
  st.tokens[tok] = { n, exp: now + TOKEN_DAYS * 86400000 };
  return tok;
}
/** The nickname of a valid token, else null. */
function tokenName(st, tok, now) {
  if (typeof tok !== 'string' || tok.length > 64 || !Object.prototype.hasOwnProperty.call(st.tokens, tok)) return null;
  const e = st.tokens[tok];
  if (!e || e.exp < now) { delete st.tokens[tok]; return null; }
  return e.n;
}

// ── Boards ───────────────────────────────────────────────────────────
/**
 * A score is in: { ok, rank (1…, 0 when not in the board), key, best (the name's
 * best on the board), err }.
 */
function submit(st, o) {
  const now = o.now, names = namesOf(o.names), g = o.g, m = o.m, s = o.s;
  if (names === 'off') return { ok: false, err: 'off' };
  if (!validGame(g, m)) return { ok: false, err: 'game' };
  const G = GAMES[g];
  const daily = isDaily(G, m), day = daily ? o.day : '';
  if (daily && !dayOk(day, now)) return { ok: false, err: 'day' };
  const t0 = ticketStart(st, o.ticket, g, m, now);
  if (!t0) return { ok: false, err: 'ticket' };
  if (!plausible(g, s, (now - t0) / 1000, m)) return { ok: false, err: 'score' };
  let name = '';
  if (names === 'account') { name = tokenName(st, o.token, now) || ''; if (!name) return { ok: false, err: 'account' }; }
  else { name = cleanName(names, o.name, o.words); if (!name) return { ok: false, err: 'name' }; }
  if (banned(name, o.bans)) return { ok: false, err: 'banned' };
  const key = boardKey(names, g, m, day), max = daily ? TOP_DAY : TOP;
  const b = Array.isArray(st.boards[key]) ? st.boards[key] : (st.boards[key] = []);
  const i = b.findIndex((r) => same(r.n, name));
  if (i >= 0 && now - (b[i].at || 0) < NAME_GAP_MS) return { ok: false, err: 'rate' };
  const o2 = ownerOf(st, o.dev);
  if (i >= 0 && b[i].s >= s) { b[i].at = now; if (o2) b[i].o = o2; return { ok: true, key, rank: i + 1, best: b[i].s, name, improved: !!o2 }; }
  if (i >= 0) b.splice(i, 1);
  const line = { n: name, s, ts: now, at: now };
  if (o2) line.o = o2;
  // The level reached, shown beside the score (web.123, narmod) — the score still ranks.
  const lv = levelOf(o.lv);
  if (lv) line.lv = lv;
  let at = b.findIndex((r) => r.s < s);
  if (at < 0) at = b.length;
  if (at >= max) return { ok: true, key, rank: 0, best: s, name, improved: true };
  b.splice(at, 0, line);
  b.length = Math.min(b.length, max);
  return { ok: true, key, rank: at + 1, best: s, name, improved: true };
}
const pub = (b) => (Array.isArray(b) ? b.map((r) => (r.lv ? { n: r.n, s: r.s, ts: r.ts, lv: r.lv } : { n: r.n, s: r.s, ts: r.ts })) : []);
/** A run's level as sent (web.123): a whole number 1 … 999, else none. */
function levelOf(v) { return Number.isInteger(v) && v >= 1 && v <= 999 ? v : 0; }
/** What a game's title shows: the setting, each mode's board, today's daily board. */
function view(st, names, g, now) {
  const G = GAMES[g];
  if (!G) return null;
  const n = namesOf(names), day = dayOf(now), boards = {};
  if (n !== 'off') for (const m of G.modes) boards[m] = pub(st.boards[boardKey(n, g, m, day)]);
  return { names: n, day, top: TOP, topDay: TOP_DAY, boards };
}
/** The admin's list: every board of a setting (key → lines). */
function adminView(st, names) {
  const n = namesOf(names), out = {};
  if (n === 'off') return out;
  Object.keys(st.boards).filter((k) => k.indexOf(n + '/') === 0).sort().forEach((k) => { out[k] = pub(st.boards[k]); });
  return out;
}
/** The admin removes a name's line from a board; true when one went. */
function remove(st, key, name) {
  const b = st.boards[key];
  if (!Array.isArray(b)) return false;
  const i = b.findIndex((r) => same(r.n, name));
  if (i < 0) return false;
  b.splice(i, 1);
  if (!b.length) delete st.boards[key];
  return true;
}
/**
 * A player takes his scores back: every line made from this browser (dev), and
 * with an account token every line of that nickname on the account boards.
 * Returns how many lines went.
 */
function forget(st, o) {
  const mark = ownerOf(st, o.dev), nick = o.token ? tokenName(st, o.token, o.now) : null;
  let n = 0;
  Object.keys(st.boards).forEach((k) => {
    const b = st.boards[k];
    if (!Array.isArray(b)) return;
    const keep = b.filter((r) => !((mark && r.o === mark) || (nick && k.indexOf('account/') === 0 && same(r.n, nick))));
    n += b.length - keep.length;
    if (keep.length) st.boards[k] = keep; else delete st.boards[k];
  });
  return n;
}
/** Old daily boards and expired tokens go. */
function prune(st, now) {
  const oldest = dayOf(now - DAYS_KEPT * 86400000);
  Object.keys(st.boards).forEach((k) => { const m = /:[a-z-]+:(\d{4}-\d{2}-\d{2})$/.exec(k); if (m && m[1] < oldest) delete st.boards[k]; });
  Object.keys(st.tokens).forEach((k) => { if (!st.tokens[k] || st.tokens[k].exp < now) delete st.tokens[k]; });
}

module.exports = { NAMES, RANKED, GAMES, TOP, TOP_DAY, DAYS_KEPT, TOKEN_DAYS, BASE_WORDS, normalize, namesOf, dayOk, boardKey, ticket, ticketStart,
  plausible, fold, rude, cleanName, banned, issueToken, tokenName, submit, view, adminView, remove, forget, prune };
