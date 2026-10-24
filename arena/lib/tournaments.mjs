// ═══════════════════════════════════════════════════════════════════
// Tournament director — tournaments, manual mode (2026-10-23).
//
// A tournament is organized by hand: the organizer creates it, adds the
// players, and establishes the result in one of three ways —
//   manual  the ranking typed in;
//   watch   the sealed result of a « Table check » watch, reused;
//   pdb     a PokerTH game log, the organizer picking the game (BBC rule).
// No connection to any game server here.
//
// Every action is appended to the tournament's own sealed journal (hash
// chain, journal.mjs) with its author; a correction is added, never
// overwritten. The validated result is signed with the install's key.
// tournament.json is only a convenience copy: the journal is the record.
//
// Storage: one folder per tournament under <dir>/tournaments/<id>/ —
// tournament.json, journal.json, result.json, and the imported log.pdb.
// Files now; the same calls will sit on the dedicated database later.
// Design: docs/ARENA.md (Tournament settings, Trust).
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, renameSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { Journal, verifyJournal, signPayload, verifyPayload, publicKeyFromPrivate, publicKeyRawB64 } from './journal.mjs';
import { listPdbGames, rankPdbGame, isPdb, pdbWitness } from './pdb.mjs';
import { isBotLang } from './botchat.mjs';
import { cleanReport, directorFacts, compareWithDirector, compareWithRanking, MAX_HANDS } from './witness.mjs';
import { analyzeCollusion } from './collusion.mjs';
import { TABLE_DEFAULTS, cleanTable } from './table.mjs';
import { IMG_RE, DEFAULT_IMAGE, imageUrl } from './images.mjs';

// Profiles (design « Tournament settings », decided 2026-10-23).
export const PROFILES = Object.freeze({
  friendly: { identity: 'simple', witnesses: 'off', validation: 'auto', corrections: 'free', visibility: 'unlisted', archiveDays: 30, collusion: 'off' },
  club: { identity: 'simple', witnesses: 'informative', validation: 'auto', corrections: 'free', visibility: 'public', archiveDays: 365, collusion: 'report' },
  official: { identity: 'code', witnesses: 'required', validation: 'organizer', corrections: 'second', visibility: 'public', archiveDays: 0, collusion: 'separate' },
});
export const CHOICES = Object.freeze({
  identity: ['simple', 'code', 'accounts'],
  witnesses: ['off', 'informative', 'required'],
  validation: ['auto', 'organizer'],
  corrections: ['free', 'second'],
  visibility: ['public', 'unlisted', 'private'],
  collusion: ['off', 'report', 'separate', 'forbid'],
});
const FORMATS = ['sitngo', 'multi'];
// Table settings when the director opens the table: lib/table.mjs (the web
// client's create-game lists and limits).
export { TABLE_DEFAULTS, cleanTable };
// How the director runs the table: opening by itself before the start, and
// its announcements in the table chat.
export const RUN_DEFAULTS = Object.freeze({ autoOpen: false, openBefore: 10, announce: true, selfRegister: true, checkInBefore: 30, chatLang: 'en', qmlWitnesses: false, finalists: 2, absence: null });
// Players who do not come to the table (decided 2026-10-24). « auto »: a
// connected player is invited again every minute when he refuses, does not
// answer, is busy in another game or leaves the table (each one a failure;
// coming back to the server or out of another game: invited at once, no
// failure); nobody is marked absent before 10 min past the start (or the
// opening without a date); after that, 3 failures or not connected = absent,
// and the table goes on with the others (2 at least). « custom »: the same
// with the organizer's numbers. « manual »: nothing automatic — the organizer
// decides (« Start without the absent »).
export const ABSENCE_AUTO = Object.freeze({ mode: 'auto', strikes: 3, retrySec: 60, graceMin: 10 });
export function cleanAbsence(a, base) {
  const b = Object.assign({}, ABSENCE_AUTO, base || {});
  a = a || {};
  const mode = ['auto', 'custom', 'manual'].indexOf(a.mode) >= 0 ? a.mode : (['auto', 'custom', 'manual'].indexOf(b.mode) >= 0 ? b.mode : 'auto');
  if (mode !== 'custom') return Object.assign({}, ABSENCE_AUTO, { mode });
  // A number out of bounds is brought to the nearest bound; no number: the base.
  const int = (v, min, max, d) => { const x = parseInt(v, 10); return Math.min(max, Math.max(min, Number.isInteger(x) ? x : (parseInt(d, 10) || min))); };
  return { mode, strikes: int(a.strikes, 1, 10, b.strikes), retrySec: int(a.retrySec, 20, 600, b.retrySec), graceMin: int(a.graceMin, 0, 120, b.graceMin) };
}
const MAX_LOG_BYTES = 10 * 1024 * 1024;
export function cleanRun(r, base) {
  const b = Object.assign({}, RUN_DEFAULTS, base || {});
  r = r || {};
  const m = parseInt(r.openBefore, 10);
  const ci = parseInt(r.checkInBefore, 10);
  return {
    autoOpen: typeof r.autoOpen === 'boolean' ? r.autoOpen : b.autoOpen,
    openBefore: Number.isInteger(m) && m >= 0 && m <= 120 ? m : b.openBefore,
    announce: typeof r.announce === 'boolean' ? r.announce : b.announce,
    selfRegister: typeof r.selfRegister === 'boolean' ? r.selfRegister : b.selfRegister,
    // Several tables: how many players of each table go to the final table.
    finalists: Number.isInteger(parseInt(r.finalists, 10)) && parseInt(r.finalists, 10) >= 1 && parseInt(r.finalists, 10) <= 5 ? parseInt(r.finalists, 10) : (b.finalists || 2),
    // QML players witness by sending their log (.pdb) on the players' page.
    qmlWitnesses: typeof r.qmlWitnesses === 'boolean' ? r.qmlWitnesses : !!b.qmlWitnesses,
    // Check-in (identity « code »): opens this long before the start.
    checkInBefore: Number.isInteger(ci) && ci >= 5 && ci <= 240 ? ci : b.checkInBefore,
    // The language the director writes in, in the chat (botlang/<code>.mjs).
    chatLang: isBotLang(r.chatLang) ? String(r.chatLang).toLowerCase() : (b.chatLang || 'en'),
    // Players who do not come to the table (ABSENCE_AUTO above).
    absence: cleanAbsence(r.absence, b.absence),
  };
}
// A table opened by itself is not opened any more this long after the start.
const AUTO_OPEN_GRACE_MS = 60 * 60 * 1000;
const AUTO_OPEN_RETRY_MS = 2 * 60 * 1000;
const ID_RE = /^[a-z0-9]{8,32}$/;
const NICK_MAX = 64;
const MAX_PLAYERS = 10;   // one table (Sit & Go)
const MAX_TABLES = 4;     // several tables (format « multi »): at most 40 players
const maxPlayersOf = (t) => (t && t.format === 'multi' ? MAX_PLAYERS * MAX_TABLES : MAX_PLAYERS);

function cleanText(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f-\u009f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
// A PokerTH nickname: as the server takes it (trimmed, ≤ 64 bytes, first byte printable).
export function cleanNick(s) {
  let n = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  while (Buffer.byteLength(n, 'utf8') > NICK_MAX) n = n.slice(0, -1);
  return n;
}
const sameNick = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
const hostOpen = (t) => !!(t.host && t.host.status === 'open');

function settingsFor(profile, custom) {
  if (profile !== 'custom') return Object.assign({}, PROFILES[profile]);
  const base = Object.assign({}, PROFILES.club);
  const out = {};
  for (const k of Object.keys(base)) {
    if (k === 'archiveDays') {
      const d = parseInt(custom && custom.archiveDays, 10);
      out.archiveDays = Number.isInteger(d) && d >= 0 && d <= 3650 ? d : base.archiveDays;
    } else {
      const v = custom && custom[k];
      out[k] = CHOICES[k].indexOf(v) >= 0 ? v : base[k];
    }
  }
  return out;
}

class Refusal extends Error {}
const refuse = (msg) => { throw new Refusal(msg); };

export function createTournaments(o) {
  const root = join(o.dir, 'tournaments');
  const now = o.now || (() => Date.now());
  // The tournament's image (images.mjs): one of the library, or null for the default.
  const imageOf = (v) => {
    if (v == null || v === '') return null;
    if (!IMG_RE.test(String(v)) || (o.imageOk && !o.imageOk(String(v)))) refuse('unknown image');
    return String(v);
  };

  function tdir(id) { return join(root, id); }
  function writeAtomic(p, obj) {
    const tmp = p + '.' + process.pid + '.tmp';
    writeFileSync(tmp, typeof obj === 'string' || Buffer.isBuffer(obj) ? obj : JSON.stringify(obj));
    renameSync(tmp, p);
  }
  function readJson(p) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { return null; } }
  function privateKey() { try { return readFileSync(o.keyFile, 'utf8'); } catch (e) { return null; } }

  function load(id) {
    if (!ID_RE.test(String(id || ''))) refuse('unknown tournament');
    const t = readJson(join(tdir(id), 'tournament.json'));
    const j = readJson(join(tdir(id), 'journal.json'));
    if (!t || !j) refuse('unknown tournament');
    const journal = new Journal({ entries: j.entries, now });
    return { t, journal };
  }
  let gen = 0;   // bumped on every save: readers that derive from the results (medals) know when to recompute
  function save(t, journal) {
    gen++;
    t.updatedAt = now();
    t.journalHead = journal.head;
    t.journalEntries = journal.entries.length;
    writeAtomic(join(tdir(t.id), 'journal.json'), journal.toJSON());
    writeAtomic(join(tdir(t.id), 'tournament.json'), t);
    return view(t, journal);
  }
  function act(id, author, type, data, fn) {
    const { t, journal } = load(id);
    fn(t, journal);
    journal.append(type, Object.assign({ author: author || 'admin' }, data || {}));
    return save(t, journal);
  }

  // ── public shape ──
  function view(t, journal) {
    const sealed = readJson(join(tdir(t.id), 'result.json'));
    const out = Object.assign({}, t);
    out.players = (t.players || []).map((p) => { const q = Object.assign({}, p); delete q.codeHash; return q; });
    out.witnessState = witnessState(t);
    if (t.stages) {
      const st = stagesState(t);
      out.stagesInfo = { N: st.N, allValidated: st.allValidated, finalists: st.finalists,
        tables: st.tables.map((c) => ({ id: c.id, name: c.name, index: c.stage && c.stage.index, status: c.status, host: c.host ? c.host.status : null, players: c.players.map((p) => p.nick), winner: c.result ? (c.result.ranking.find((x) => x.place === 1) || {}).nick : null })),
        final: st.final ? { id: st.final.id, name: st.final.name, status: st.final.status, host: st.final.host ? st.final.host.status : null, players: st.final.players.map((p) => p.nick), winner: st.final.result ? (st.final.result.ranking.find((x) => x.place === 1) || {}).nick : null } : null };
    }
    if (t.parentId) { try { const pt = load(t.parentId).t; out.parent = { id: pt.id, name: pt.name }; } catch (e) {} }
    if (journal) {
      const chain = verifyJournal(journal.entries);
      out.checks = { chain: chain.ok, badSeq: chain.badSeq, entries: journal.entries.length };
      if (sealed) {
        out.checks.headMatches = chain.ok && journal.entries.some((e) => e.hash === sealed.payload.head);
        out.checks.signature = !!(sealed.signature && sealed.publicKeyPem && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem));
        out.checks.signedBy = sealed.publicKeyPem ? publicKeyRawB64(sealed.publicKeyPem) : null;
        out.sealedHead = sealed.payload.head;
      }
      out.history = journal.entries.map((e) => ({ seq: e.seq, ts: e.ts, type: e.type, author: e.data && e.data.author, summary: summary(e) }));
    }
    return out;
  }
  function summary(e) {
    const d = e.data || {};
    switch (e.type) {
      case 'created': return 'created « ' + d.name + ' » (' + d.profile + ')';
      case 'updated': return 'changed ' + Object.keys(d.changes || {}).join(', ');
      case 'playerAdded': return 'added ' + d.nick;
      case 'playerRemoved': return 'removed ' + d.nick;
      case 'playerRegistered': return d.nick + ' registered (public page)';
      case 'playerUnregistered': return d.nick + ' unregistered (public page)';
      case 'codeIssued': return 'new personal code for ' + d.nick;
      case 'tablesDrawn': return 'tables drawn: ' + (d.tables || []).map((x, i) => 'table ' + (i + 1) + ' (' + x.length + ')').join(', ') + (d.separated != null ? ' — flagged pairs kept apart: ' + d.separated : '');
      case 'finalReady': return 'final table: ' + (d.finalists || []).join(', ');
      case 'stagesRecomputed': return 'ranking recomputed from the tables (a table was corrected)';
      case 'collusionChecked': return 'collusion check: ' + d.hands + ' hands read, ' + d.flags + ' pair' + (d.flags === 1 ? '' : 's') + ' flagged, ' + d.notes + ' note' + (d.notes === 1 ? '' : 's');
      case 'witnessReport': return 'witness ' + d.nick + (d.source === 'log' ? ' (log)' : '') + (d.verified ? ' (code)' : '') + ': ' + d.hands + ' hands' + (d.winner ? ', winner ' + d.winner : '') + ' — ' + d.verdict;
      case 'checkedIn': return d.nick + ' checked in' + (d.by === 'organizer' ? ' (by the organizer)' : '');
      case 'notCheckedIn': return 'not checked in, marked absent: ' + (d.nicks || []).join(', ');
      case 'pdbImported': return 'imported a log (' + d.games + ' game' + (d.games === 1 ? '' : 's') + ', sha256 ' + String(d.sha256).slice(0, 12) + '…)';
      case 'resultSet': return 'result from ' + d.source + (d.watchId ? ' ' + d.watchId : '') + (d.uniqueGameId != null ? ' game ' + d.uniqueGameId : '');
      case 'validated': return 'validated and signed';
      case 'corrected': return 'corrected: ' + d.reason + (d.proposedBy ? ' (proposed by ' + d.proposedBy + ', approved by ' + d.author + ')' : '');
      case 'correctionProposed': return 'correction proposed, waiting for a second organizer: ' + d.reason;
      case 'correctionRejected': return 'correction of ' + d.proposedBy + ' ' + (d.withdrawn ? 'withdrawn' : 'rejected') + (d.reason ? ': ' + d.reason : '');
      case 'tableOpened': return 'the director opens the table on ' + (d.server || 'the server') + ' (' + d.watchId + ')';
      case 'tableGo': return 'go without the absent';
      case 'tableReinvite': return 'invitations sent again';
      case 'tableMessage': return 'message sent to the table';
      case 'tableEnded': return 'table ' + d.status + (d.error ? ': ' + d.error : '');
      case 'autoOpenFailed': return 'could not open the table by itself: ' + d.reason;
      case 'autoOpenMissed': return 'the start time passed without the table being opened';
      case 'tableResultRefused': return 'the director\'s result needs an organizer: ' + d.reason;
      default: return e.type;
    }
  }

  // ── listing ──
  function list() {
    let ids = [];
    try { ids = readdirSync(root).filter((x) => ID_RE.test(x)); } catch (e) {}
    return ids.map((id) => readJson(join(tdir(id), 'tournament.json'))).filter(Boolean)
      .sort((a, b) => (b.startsAt || b.createdAt) - (a.startsAt || a.createdAt))
      .map((t) => ({ id: t.id, name: t.name, status: t.status, profile: t.profile, visibility: t.settings.visibility, startsAt: t.startsAt,
        players: t.players.length, server: t.server ? t.server.name : null, resultStatus: t.result ? t.result.status : null, host: t.host ? t.host.status : null,
        format: t.format, parentId: t.parentId || null, stage: t.stage || null }));
  }

  function get(id) { const { t, journal } = load(id); return view(t, journal); }

  // ── create / update ──
  function create(input, author) {
    const name = cleanText(input && input.name, 60);
    if (name.length < 2) refuse('name: 2 to 60 characters');
    const profile = ['friendly', 'club', 'official', 'custom'].indexOf(input.profile) >= 0 ? input.profile : 'club';
    const format = FORMATS.indexOf(input.format) >= 0 ? input.format : 'sitngo';
    const settings = settingsFor(profile, input.settings);
    if (input.visibility && CHOICES.visibility.indexOf(input.visibility) >= 0) settings.visibility = input.visibility;
    const startsAt = input.startsAt != null && input.startsAt !== '' ? Number(input.startsAt) : null;
    if (startsAt != null && !(startsAt > 0)) refuse('start date not understood');
    const server = input.server && input.server.ref ? { ref: String(input.server.ref), name: cleanText(input.server.name, 80), host: cleanText(input.server.host, 253), port: Number(input.server.port) || null } : null;
    mkdirSync(root, { recursive: true });
    const id = now().toString(36) + randomBytes(4).toString('hex');
    mkdirSync(tdir(id));
    const table = cleanTable(input.table);
    const run = cleanRun(input.run);
    const image = imageOf(input.image);
    if (run.autoOpen && startsAt == null) refuse('opening by itself needs a start date');
    const t = {
      id, name, format, profile, settings, server, startsAt, mode: 'manual', table, run, host: null, image,
      status: 'draft', players: [], result: null, corrections: [],
      inviteCode: settings.visibility === 'private' ? randomBytes(6).toString('base64url') : null,
      // The public address (/arena/t/<publicKey>): random, so an
      // unlisted tournament cannot be found by guessing.
      publicKey: randomBytes(12).toString('base64url'),
      createdAt: now(), updatedAt: now(),
    };
    const journal = new Journal({ now });
    journal.append('created', { author: author || 'admin', name, format, profile, settings, server, startsAt, table, run });
    return save(t, journal);
  }

  function update(id, patch, author) {
    const data = { changes: {} };
    return act(id, author, 'updated', data, (t) => {
      // The image may change at any time; the rest only before validation.
      if (t.status === 'validated' && Object.keys(patch).some((k) => k !== 'image')) refuse('already validated: use a correction');
      const changes = data.changes;
      if (patch.image !== undefined) changes.image = t.image = imageOf(patch.image);
      if (patch.name != null) { const n = cleanText(patch.name, 60); if (n.length < 2) refuse('name: 2 to 60 characters'); changes.name = t.name = n; }
      if (patch.startsAt !== undefined) { const s = patch.startsAt === null || patch.startsAt === '' ? null : Number(patch.startsAt); if (s !== null && !(s > 0)) refuse('start date not understood'); changes.startsAt = t.startsAt = s; }
      if (patch.profile) {
        if (['friendly', 'club', 'official', 'custom'].indexOf(patch.profile) < 0) refuse('unknown profile');
        t.profile = patch.profile; t.settings = settingsFor(patch.profile, patch.settings); changes.profile = t.profile; changes.settings = t.settings;
      }
      if (patch.visibility) {
        if (CHOICES.visibility.indexOf(patch.visibility) < 0) refuse('unknown visibility');
        t.settings.visibility = patch.visibility; changes.visibility = patch.visibility;
        if (patch.visibility === 'private' && !t.inviteCode) t.inviteCode = randomBytes(6).toString('base64url');
      }
      if (patch.server !== undefined) {
        if (hostOpen(t)) refuse('the table is open: close it first');
        const sv = patch.server;
        changes.server = t.server = sv && sv.ref ? { ref: String(sv.ref), name: cleanText(sv.name, 80), host: cleanText(sv.host, 253), port: Number(sv.port) || null } : null;
      }
      if (patch.run) {
        changes.run = t.run = cleanRun(patch.run, t.run || RUN_DEFAULTS);
        t.autoTry = null;
      }
      if (patch.table) {
        if (hostOpen(t)) refuse('the table is open: close it first');
        changes.table = t.table = cleanTable(patch.table, t.table || TABLE_DEFAULTS);
      }
      if (!Object.keys(changes).length) refuse('nothing to change');
      if (t.run && t.run.autoOpen && t.startsAt == null) refuse('opening by itself needs a start date');
    });
  }

  // ── players ──
  // A player added by the organizer gets a personal code too: with the
  // identity « code » (Official) the organizer hands it over, for the check-in.
  function addPlayer(id, nickIn, author) {
    const nick = cleanNick(nickIn);
    const code = newCode();
    let needs = false;
    const v = act(id, author, 'playerAdded', { nick }, (t) => {
      needs = needsCheckIn(t);
      if (!nick) refuse('nickname missing');
      if (t.result) refuse('the result is set: players can no longer change');
      if (hostOpen(t)) refuse('the table is open: players can no longer change');
      if (t.players.some((p) => sameNick(p.nick, nick))) refuse(nick + ' is already in');
      if (t.stages) refuse('the tables are drawn: players can no longer change');
      if (t.parentId) refuse('the draw set this table\'s players');
      if (t.players.length >= maxPlayersOf(t)) refuse(t.format === 'multi' ? 'at most ' + maxPlayersOf(t) + ' players (' + MAX_TABLES + ' tables)' : 'a Sit & Go seats ' + MAX_PLAYERS + ' players at most');
      t.players.push({ nick, addedAt: now(), codeHash: hashCode(code) });
      if (t.status === 'draft') t.status = 'registration';
    });
    if (needs) v.issuedCode = { nick, code };
    return v;
  }
  // A new personal code for a player (lost, or added before codes existed).
  function issueCode(id, nickIn, author) {
    const nick = cleanNick(nickIn);
    const code = newCode();
    const v = act(id, author, 'codeIssued', { nick }, (t) => {
      if (t.result) refuse('the result is set');
      const p = t.players.find((x) => sameNick(x.nick, nick));
      if (!p) refuse(nick + ' is not in');
      p.codeHash = hashCode(code);
    });
    v.issuedCode = { nick, code };
    return v;
  }
  // The organizer checks a player in himself (seen in the room, say).
  function organizerCheckIn(id, nickIn, author) {
    const nick = cleanNick(nickIn);
    return act(id, author, 'checkedIn', { nick, by: 'organizer' }, (t) => {
      if (!needsCheckIn(t)) refuse('this tournament has no check-in (identity « code » only)');
      if (t.result || hostOpen(t)) refuse('too late: the table is open or the result is set');
      const p = t.players.find((x) => sameNick(x.nick, nick));
      if (!p) refuse(nick + ' is not in');
      if (p.checkedIn) refuse(nick + ' is already checked in');
      p.checkedIn = now();
    });
  }
  // When the director opens the table of a check-in tournament: whoever has
  // not checked in is marked absent (not invited, not ranked).
  function markNotCheckedIn(id) {
    const { t } = load(id);
    if (!needsCheckIn(t)) return null;
    const nicks = t.players.filter((p) => !p.checkedIn && !p.absent).map((p) => p.nick);
    if (!nicks.length) return null;
    return act(id, 'director', 'notCheckedIn', { nicks }, (tt) => { for (const p of tt.players) if (!p.checkedIn) p.absent = true; });
  }
  function removePlayer(id, nickIn, author) {
    const nick = cleanNick(nickIn);
    return act(id, author, 'playerRemoved', { nick }, (t) => {
      if (t.result) refuse('the result is set: players can no longer change');
      if (hostOpen(t)) refuse('the table is open: players can no longer change');
      if (t.stages || t.parentId) refuse('the tables are drawn: players can no longer change');
      const i = t.players.findIndex((p) => sameNick(p.nick, nick));
      if (i < 0) refuse(nick + ' is not in');
      t.players.splice(i, 1);
    });
  }

  // ── public page: list, tournament, registration ──
  // Errors here carry a code the page translates (`code`), the English text
  // stays for logs and the organizer side.
  const prefuse = (code, msg) => { const e = new Refusal(msg); e.code = code; throw e; };
  const hashCode = (c) => createHash('sha256').update('ptd-reg:' + String(c || '').trim().toUpperCase()).digest('hex');
  const sameHash = (a, b) => { const x = Buffer.from(String(a || ''), 'hex'), y = Buffer.from(String(b || ''), 'hex'); return x.length === 32 && x.length === y.length && timingSafeEqual(x, y); };
  // A personal code: 8 characters, no 0/O or 1/I to mix up.
  function newCode() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const b = randomBytes(8);
    let s = '';
    for (let i = 0; i < 8; i++) s += A[b[i] % A.length];
    return s;
  }
  function allTournaments() {
    let ids = [];
    try { ids = readdirSync(root).filter((x) => ID_RE.test(x)); } catch (e) {}
    const out = [];
    for (const x of ids) {
      const t = readJson(join(tdir(x), 'tournament.json'));
      if (!t) continue;
      if (!t.publicKey) { t.publicKey = randomBytes(12).toString('base64url'); try { writeAtomic(join(tdir(t.id), 'tournament.json'), t); } catch (e) {} }
      out.push(t);
    }
    return out;
  }
  function byKey(key) {
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(String(key || ''))) return null;
    return allTournaments().find((t) => t.publicKey === key) || null;
  }
  // Why registration is closed, or null when it is open.
  // Check-in: only with the identity « code » (Official); from checkInBefore
  // minutes before the start (at once without a date) until the table opens.
  function needsCheckIn(t) { return !!(t.settings && t.settings.identity === 'code'); }
  function checkInState(t) {
    if (!needsCheckIn(t)) return { needed: false };
    const before = (t.run && t.run.checkInBefore) || RUN_DEFAULTS.checkInBefore;
    const opensAt = t.startsAt ? t.startsAt - before * 60000 : null;
    const closed = !!(t.result || hostOpen(t) || t.stages || t.status === 'validated');
    return { needed: true, opensAt, open: !closed && (!opensAt || now() >= opensAt), closed,
      count: t.players.filter((p) => p.checkedIn).length, of: t.players.length };
  }
  function checkIn(key, input) {
    const t0 = byKey(key);
    if (!t0 || !visible(t0, input && input.invite)) prefuse('notFound', 'unknown tournament');
    const data = { nick: cleanNick(input && input.nick) };
    const nick = data.nick;
    act(t0.id, 'player', 'checkedIn', data, (t) => {
      const st = checkInState(t);
      if (!st.needed) prefuse('noCheckIn', 'this tournament has no check-in');
      if (st.closed) prefuse('checkInClosed', 'check-in is closed');
      if (!st.open) prefuse('checkInNotYet', 'check-in is not open yet');
      const p = t.players.find((x) => sameNick(x.nick, nick));
      if (!p || !p.codeHash || !sameHash(p.codeHash, hashCode(input && input.code))) prefuse('badCode', 'nickname or code not recognised');
      if (p.checkedIn) prefuse('alreadyIn', 'already checked in');
      p.checkedIn = now();
      data.nick = p.nick;   // as registered, in the journal too
    });
    return { nick: data.nick, tournament: publicGet(key, input && input.invite) };
  }
  function regClosed(t) {
    if (!t.run || t.run.selfRegister === false) return 'organizer';
    if (t.result || t.status === 'finished' || t.status === 'validated') return 'finished';
    if (hostOpen(t) || t.stages) return 'tableOpen';
    if (t.parentId) return 'organizer';
    if (t.players.length >= maxPlayersOf(t)) return 'full';
    return null;
  }
  function phaseOf(t) {
    if (t.status === 'validated') return 'validated';
    if (t.result) return 'finished';
    if (hostOpen(t) || t.stages) return 'table';
    return 'upcoming';
  }
  function publicCard(t) {
    const w = t.result && t.result.ranking && t.result.ranking.find((r) => r.place === 1);
    return {
      key: t.publicKey, name: t.name, format: t.format, profile: t.profile, startsAt: t.startsAt,
      server: t.server ? t.server.name : null, players: t.players.length, maxPlayers: maxPlayersOf(t),
      phase: phaseOf(t), registration: regClosed(t) ? 'closed' : 'open', winner: w ? w.nick : null,
      image: imageUrl(t.image || DEFAULT_IMAGE.tournament), thumb: imageUrl(t.image || DEFAULT_IMAGE.tournament, true),
    };
  }
  // Public tournaments only; unlisted and private ones never appear here.
  function publicList() {
    return allTournaments().filter((t) => t.settings && t.settings.visibility === 'public' && !t.parentId)
      .sort((a, b) => (b.startsAt || b.createdAt) - (a.startsAt || a.createdAt)).map(publicCard);
  }
  // A private tournament answers as if it did not exist without its code.
  function visible(t, invite) {
    if (!t) return false;
    if (t.settings.visibility !== 'private') return true;
    const a = Buffer.from(String(invite || '')), b = Buffer.from(String(t.inviteCode || ''));
    return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
  }
  function publicGet(key, invite, live) {
    const t = byKey(key);
    if (!t) prefuse('notFound', 'unknown tournament');
    if (!visible(t, invite)) prefuse(t.settings.visibility === 'private' ? 'private' : 'notFound', 'this tournament is private');
    const sealed = readJson(join(tdir(t.id), 'result.json'));
    const card = publicCard(t);
    const out = Object.assign(card, {
      visibility: t.settings.visibility, identity: t.settings.identity, validation: t.settings.validation,
      table: t.table || null, autoOpen: !!(t.run && t.run.autoOpen), openBefore: t.run ? t.run.openBefore : null,
      closedBecause: regClosed(t),
      playerList: t.players.map((p) => ({ nick: p.nick, absent: !!p.absent, checkedIn: !!p.checkedIn })),
      checkIn: checkInState(t),
      witnesses: t.settings.witnesses === 'off' ? null : Object.assign(witnessState(t), { logs: !!(t.run && t.run.qmlWitnesses), list: (t.witnesses || []).map((w) => ({ nick: w.nick, verdict: w.verdict, counts: countsW(t, w), log: w.source === 'log' })),
        override: t.witnessOverride ? { at: t.witnessOverride.at, reason: t.witnessOverride.reason } : null }),
      result: t.result ? { status: t.result.status, byDirector: !!t.result.byDirector, corrected: !!t.result.corrected, absent: t.result.absent || [],
        ranking: t.result.ranking.map((r) => ({ place: r.place, nick: r.nick, winner: !!r.winner, elimHand: r.elimHand, tie: !!r.tie })) } : null,
      corrections: (t.corrections || []).map((c) => ({ at: c.at, reason: c.reason, before: c.before, after: c.after })),
      sealed: sealed ? { head: sealed.payload.head, signedBy: sealed.publicKeyPem ? publicKeyRawB64(sealed.publicKeyPem) : null,
        signature: !!(sealed.signature && sealed.publicKeyPem && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem)) } : null,
    });
    if (live) out.table_live = live(t);
    if (t.format === 'multi') {
      out.multi = { finalists: (t.stages && t.stages.finalists) || (t.run && t.run.finalists) || 2, maxTables: MAX_TABLES };
      const st = t.stages ? stagesState(t) : null;
      if (st) {
        const card = (c) => Object.assign(publicCard(c), { index: c.stage && c.stage.index, live: live ? live(c) : null, playerList: c.players.map((p) => p.nick) });
        out.multi.tables = st.tables.map(card);
        out.multi.final = st.final ? card(st.final) : null;
        out.multi.finalistsSoFar = st.finalists;
      }
    }
    if (t.parentId) { try { const pt = load(t.parentId).t; out.parent = { key: pt.publicKey, name: pt.name }; out.stage = t.stage; } catch (e) {} }
    return out;
  }
  function register(key, input) {
    const t0 = byKey(key);
    if (!t0 || !visible(t0, input && input.invite)) prefuse('notFound', 'unknown tournament');
    const nick = cleanNick(input && input.nick);
    if (Buffer.byteLength(nick, 'utf8') < 2 || !/^[\x21-\x7e]/.test(nick)) prefuse('badNick', 'nickname: 2 to 64 bytes, starting with a plain character');
    const code = newCode();
    act(t0.id, 'player', 'playerRegistered', { nick }, (t) => {
      const why = regClosed(t);
      if (why) prefuse('closed_' + why, 'registration is closed (' + why + ')');
      if (t.players.some((p) => sameNick(p.nick, nick))) prefuse('taken', nick + ' is already registered');
      t.players.push({ nick, addedAt: now(), self: true, codeHash: hashCode(code) });
      if (t.status === 'draft') t.status = 'registration';
    });
    return { nick, code, tournament: publicGet(key, input && input.invite) };
  }
  function unregister(key, input) {
    const t0 = byKey(key);
    if (!t0 || !visible(t0, input && input.invite)) prefuse('notFound', 'unknown tournament');
    const nick = cleanNick(input && input.nick);
    act(t0.id, 'player', 'playerUnregistered', { nick }, (t) => {
      if (t.result) prefuse('closed_finished', 'the result is set');
      if (hostOpen(t)) prefuse('closed_tableOpen', 'the table is open');
      const i = t.players.findIndex((p) => sameNick(p.nick, nick));
      if (i < 0 || !t.players[i].codeHash || !sameHash(t.players[i].codeHash, hashCode(input && input.code))) prefuse('badCode', 'nickname or code not recognised');
      t.players.splice(i, 1);
    });
    return { nick, tournament: publicGet(key, input && input.invite) };
  }
  // ── several tables (format « multi », service 0.12.0) ──
  // The players are drawn into tables of at most 10, each played as a Sit &
  // Go of its own (a « stage » tournament: its director, witnesses, result,
  // validation); the first N of every table then play the final table, which
  // gives the tournament's ranking. PokerTH cannot move a player from one game
  // to another, so tables are never merged.
  function stagePlayers(t) {
    return t.players.filter((p) => !p.absent && (!needsCheckIn(t) || p.checkedIn));
  }
  // Pairs the collusion check flagged in earlier tournaments (any table of
  // this install), lower-cased: with « separate », the draw keeps them apart.
  function flaggedPairs() {
    const out = new Set();
    for (const t of allTournaments()) for (const pr of (t.collusion && t.collusion.pairs) || []) if (pr.level === 'flag') out.add([pr.a, pr.b].map((x) => String(x).toLowerCase()).sort().join('\u0000'));
    return out;
  }
  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function createStage(parent, kind, index, players) {
    const id = now().toString(36) + randomBytes(4).toString('hex');
    mkdirSync(tdir(id));
    const run = Object.assign({}, parent.run, { autoOpen: false, selfRegister: false });
    const t = {
      id, name: parent.name + (kind === 'final' ? ' — final table' : ' — table ' + index), format: 'sitngo', profile: parent.profile,
      settings: JSON.parse(JSON.stringify(parent.settings)), server: parent.server, startsAt: null, mode: 'manual', table: parent.table, run, host: null, image: parent.image || null,
      status: 'registration', players: players.map((p) => ({ nick: p.nick, addedAt: now(), codeHash: p.codeHash, checkedIn: p.checkedIn || now(), self: p.self || undefined })),
      result: null, corrections: [], inviteCode: parent.inviteCode || null, publicKey: randomBytes(12).toString('base64url'),
      parentId: parent.id, stage: { kind, index }, createdAt: now(), updatedAt: now(),
    };
    const journal = new Journal({ now });
    journal.append('created', { author: 'director', name: t.name, format: t.format, profile: t.profile, settings: t.settings, parentId: parent.id, stage: t.stage, players: t.players.map((p) => p.nick) });
    save(t, journal);
    return t;
  }
  function drawTables(id, author) {
    const { t: t0 } = load(id);
    if (t0.format !== 'multi') refuse('only a tournament with several tables is drawn');
    if (t0.stages) refuse('the tables are already drawn');
    if (t0.result) refuse('the result is set');
    const players = stagePlayers(t0);
    if (players.length < 4) refuse(needsCheckIn(t0) ? 'fewer than four players have checked in' : 'at least four players');
    const n = Math.min(MAX_TABLES, Math.ceil(players.length / MAX_PLAYERS));
    if (n < 2) refuse('ten players or fewer: one table is enough — choose the format « Sit & Go, one table »');
    const flagged = t0.settings.collusion === 'separate' ? flaggedPairs() : new Set();
    const rnd = (k) => randomBytes(4).readUInt32BE(0) % k;
    // Random seats; with « separate », the draw with the fewest flagged pairs
    // at the same table, out of a few hundred.
    let best = null, bestBad = Infinity;
    for (let tries = 0; tries < (flagged.size ? 300 : 1) && bestBad > 0; tries++) {
      const order = shuffle(players, rnd);
      const tables = Array.from({ length: n }, () => []);
      order.forEach((p, i) => tables[i % n].push(p));
      let bad = 0;
      for (const tb of tables) for (let i = 0; i < tb.length; i++) for (let j = i + 1; j < tb.length; j++) if (flagged.has([tb[i].nick, tb[j].nick].map((x) => x.toLowerCase()).sort().join('\u0000'))) bad++;
      if (bad < bestBad) { best = tables; bestBad = bad; }
    }
    const children = best.map((tb, i) => createStage(t0, 'qualifier', i + 1, tb));
    const data = { tables: best.map((tb) => tb.map((p) => p.nick)), childIds: children.map((c) => c.id) };
    if (flagged.size) data.separated = bestBad === 0 ? 'all' : 'all but ' + bestBad;
    return act(id, author, 'tablesDrawn', data, (t) => {
      t.stages = { drawnAt: now(), tables: children.map((c) => c.id), final: null, finalists: t.run.finalists || 2 };
      for (const p of t.players) if (!players.some((x) => sameNick(x.nick, p.nick))) p.absent = true;
      t.status = 'running';
    });
  }
  // Where the tables stand: { tables: [...], allValidated, finalists: [...], final }.
  function stagesState(t) {
    if (!t.stages) return null;
    const rows = t.stages.tables.map((cid) => { try { return load(cid).t; } catch (e) { return null; } }).filter(Boolean);
    const N = t.stages.finalists || 2;
    const finalists = [];
    for (const c of rows) if (c.status === 'validated' && c.result) for (const r of c.result.ranking) if (r.place <= N) finalists.push(r.nick);
    let fin = null;
    if (t.stages.final) { try { fin = load(t.stages.final).t; } catch (e) { fin = null; } }
    return { tables: rows, allValidated: rows.length > 0 && rows.every((c) => c.status === 'validated'), finalists, final: fin, N };
  }
  // All tables validated: the final table, with the first N of each.
  function makeFinal(id, author) {
    const { t: t0 } = load(id);
    const st = stagesState(t0);
    if (!st) refuse('draw the tables first');
    if (st.final) refuse('the final table exists');
    if (!st.allValidated) refuse('every table must have its result validated first');
    if (st.finalists.length < 2) refuse('fewer than two finalists');
    const players = st.finalists.map((nick) => t0.players.find((p) => sameNick(p.nick, nick)) || { nick });
    const fin = createStage(t0, 'final', 0, players.slice(0, MAX_PLAYERS));
    act(id, author, 'finalReady', { finalists: players.map((p) => p.nick), childId: fin.id }, (t) => { t.stages.final = fin.id; });
    return fin;
  }
  // The tournament's ranking: the final table's, then the others by their
  // place at their table (the same place at different tables is shared).
  function stagesRanking(t, st) {
    const ranking = st.final.result.ranking.map((r) => ({ nick: r.nick, place: r.place, winner: r.place === 1, tie: !!r.tie, elimHand: r.elimHand, stack: r.stack }));
    const finals = new Set(ranking.map((r) => r.nick.toLowerCase()));
    const byPlace = new Map();
    for (const c of st.tables) for (const r of c.result.ranking) {
      if (finals.has(r.nick.toLowerCase())) continue;
      if (!byPlace.has(r.place)) byPlace.set(r.place, []);
      byPlace.get(r.place).push({ nick: r.nick, table: c.stage && c.stage.index });
    }
    let next = ranking.length + 1;
    for (const p of [...byPlace.keys()].sort((a, b) => a - b)) {
      const grp = byPlace.get(p);
      for (const g of grp) ranking.push({ nick: g.nick, place: next, winner: false, tie: grp.length > 1, tablePlace: p, table: g.table });
      next += grp.length;
    }
    return ranking;
  }
  // Called by the service's sweep for a « multi » tournament: the final
  // table once every table is validated (when it opens by itself), the
  // tournament's result once the final is validated. Returns what to open.
  function stagesTick(id) {
    const { t } = load(id);
    if (t.format !== 'multi' || !t.stages || t.status === 'validated') return {};
    const st = stagesState(t);
    if (!st.final) return st.allValidated ? { finalReady: true } : {};
    if (st.final.status !== 'validated' || !st.final.result) return {};
    const ranking = stagesRanking(t, st);
    const { t: tt, journal } = load(id);
    tt.result = { source: 'stages', status: 'complete', ranking, setAt: now(), absent: tt.players.filter((p) => p.absent).map((p) => p.nick), tables: st.tables.map((c) => c.id), final: st.final.id };
    tt.status = 'finished';
    journal.append('resultSet', { author: 'director', source: 'stages', status: 'complete', ranking, tables: tt.result.tables, final: tt.result.final });
    save(tt, journal);
    // Every table was validated (with its witnesses, collusion check and
    // corrections); the tournament's ranking follows from them: sealed now.
    validate(id, 'director');
    return { done: true };
  }
  // A table corrected after the tournament was validated: its ranking again.
  function stagesRecompute(parentId) {
    const { t, journal } = load(parentId);
    if (t.status !== 'validated' || !t.stages) return null;
    const st = stagesState(t);
    if (!st.final || !st.final.result) return null;
    const ranking = stagesRanking(t, st);
    if (JSON.stringify(ranking.map((r) => r.nick)) === JSON.stringify(t.result.ranking.map((r) => r.nick))) return null;
    t.result = Object.assign({}, t.result, { ranking, corrected: true });
    journal.append('stagesRecomputed', { author: 'director', ranking });
    seal(t, journal);
    return save(t, journal);
  }

  // ── collusion check (service 0.10.0) ──
  // Signals for an organizer, never a sanction: from the director's journal
  // (the actions of each hand). Shown on the organizer page only; the journal
  // keeps how many pairs were flagged, not their names.
  function collusionOf(t) {
    if (!t.settings || t.settings.collusion === 'off') return null;
    const w = (t.result && t.result.watchId) || (t.host && t.host.watchId);
    if (!w || !o.readWatchJournal) return null;
    const j = o.readWatchJournal(w);
    if (!j || !Array.isArray(j.entries)) return null;
    return Object.assign({ at: now(), watchId: w }, analyzeCollusion(j.entries));
  }
  function checkCollusion(id, author) {
    const { t: t0 } = load(id);
    if (t0.settings.collusion === 'off') refuse('the collusion check is off for this tournament');
    const cc = collusionOf(t0);
    if (!cc) refuse('no director\'s journal to read: the check needs a table run or watched by the director');
    return act(id, author, 'collusionChecked', { hands: cc.hands, flags: cc.flags, notes: cc.pairs.length - cc.flags }, (t) => { t.collusion = cc; });
  }

  // ── witnesses (service 0.7.0) ──
  // A web client at the table sends what it saw; it is compared with the
  // director's journal, or with the ranking set without a director. Only the
  // tournament's players are witnesses; with the identity « code » only those
  // whose report carries their personal code count.
  const lowN = (x) => String(x == null ? '' : x).toLowerCase();
  function witnessFile(id, nick) { return join(tdir(id), 'witness', createHash('sha256').update(lowN(nick)).digest('hex').slice(0, 24) + '.json'); }
  function directorOf(t) {
    const w = (t.result && t.result.watchId) || (t.host && t.host.watchId);
    if (!w || !o.readWatchJournal) return null;
    const j = o.readWatchJournal(w);
    return j && Array.isArray(j.entries) ? directorFacts(j.entries) : null;
  }
  function judge(t, rep, f) {
    if (f && f.hands.size) return compareWithDirector(rep, f);
    if (t.result) return compareWithRanking(rep, t.result.ranking);
    return { verdict: 'pending', common: 0 };
  }
  function countsW(t, w) {
    const p = t.players.find((x) => sameNick(x.nick, w.nick));
    return !!p && !p.absent && (t.settings.identity !== 'code' || !!w.verified);
  }
  function witnessState(t) {
    const all = t.witnesses || [];
    const ws = all.filter((w) => countsW(t, w));
    const agree = ws.filter((w) => w.verdict === 'agrees').length, disagree = ws.filter((w) => w.verdict === 'disagrees').length;
    return { mode: (t.settings && t.settings.witnesses) || 'off', total: all.length, counting: ws.length, agree, disagree, ok: agree >= 1 && disagree === 0 };
  }
  // Verdicts again, against what is known now (the director's journal grows
  // until the end; a manual result may come after the reports).
  function refreshWitnesses(t) {
    if (!t.witnesses || !t.witnesses.length) return;
    const f = directorOf(t);
    for (const w of t.witnesses) {
      const rep = readJson(witnessFile(t.id, w.nick));
      if (!rep) continue;
      const j = judge(t, rep, f);
      w.verdict = j.verdict; w.common = j.common; w.diff = j.diff || null;
    }
  }
  function witnessReport(key, input, opts) {
    const t0 = byKey(key);
    if (!t0 || !(visible(t0, input && input.invite) || (opts && opts.atTable))) prefuse('notFound', 'unknown tournament');
    if (t0.settings.witnesses === 'off') prefuse('noWitness', 'this tournament takes no witness reports');
    let rep;
    try { rep = cleanReport(input && input.report); } catch (e) { prefuse('badReport', 'report: ' + e.message); }
    if (!rep.hands.length && !rep.winner) prefuse('badReport', 'an empty report');
    return addWitness(t0, input, rep, 'web', {});
  }
  // A QML player's log (.pdb), when the tournament accepts them as witnesses:
  // read in memory, only the stacks of the director's game (or of the game
  // with the tournament's players) and its winner are kept — never the cards.
  async function witnessLog(key, input, opts) {
    const t0 = byKey(key);
    if (!t0 || !visible(t0, input && input.invite)) prefuse('notFound', 'unknown tournament');
    if (t0.settings.witnesses === 'off') prefuse('noWitness', 'this tournament takes no witness reports');
    if (!(t0.run && t0.run.qmlWitnesses)) prefuse('noLogWitness', 'this tournament takes no log from the official client');
    let buf;
    try { buf = Buffer.from(String((input && input.log) || ''), 'base64'); } catch (e) { buf = null; }
    if (!buf || !isPdb(buf)) prefuse('notPdb', 'not a PokerTH log (.pdb)');
    if (buf.length > MAX_LOG_BYTES) prefuse('tooLarge', 'a log of at most 10 MB');
    const gameId = opts && opts.gameId != null ? opts.gameId : null;
    let got;
    try { got = await pdbWitness(buf, { gameId, players: t0.players.map((p) => p.nick) }); } catch (e) { prefuse('noGame', e.message); }
    let rep;
    try { rep = cleanReport({ hands: got.hands, winner: got.winner, complete: got.complete }); } catch (e) { prefuse('badReport', 'report: ' + e.message); }
    if (!rep.hands.length && !rep.winner) prefuse('noGame', 'this log has no hand of that game');
    return addWitness(t0, input, rep, 'log', { logSha256: createHash('sha256').update(buf).digest('hex'), logGame: got.uniqueGameId });
  }
  function addWitness(t0, input, rep, source, extra) {
    const nick0 = cleanNick(input && input.nick);
    const data = { nick: nick0, source };
    act(t0.id, 'witness', 'witnessReport', data, (t) => {
      if (t.status === 'validated') prefuse('closed_finished', 'the result is validated');
      if (!t.host && !t.result) prefuse('noTable', 'no table yet');
      const p = t.players.find((x) => sameNick(x.nick, nick0));
      if (!p) prefuse('notPlayer', 'not a player of this tournament');
      const code = input && input.code;
      const verified = !!(code && p.codeHash && sameHash(p.codeHash, hashCode(code)));
      if (code && !verified) prefuse('badCode', 'nickname or code not recognised');
      // A later report adds to the earlier one (a client reloaded in the
      // middle of the game only knows the hands since): same hand, the later wins.
      const old = readJson(witnessFile(t.id, p.nick));
      if (old && Array.isArray(old.hands)) {
        const m = new Map(old.hands.map((x) => [x.h, x]));
        for (const x of rep.hands) m.set(x.h, x);
        rep = { hands: [...m.values()].sort((a, b) => a.h - b.h).slice(-MAX_HANDS), winner: rep.winner || old.winner || null, complete: rep.complete || !!old.complete };
      }
      mkdirSync(join(tdir(t.id), 'witness'), { recursive: true });
      writeAtomic(witnessFile(t.id, p.nick), rep);
      const j = judge(t, rep, directorOf(t));
      const hs = rep.hands.map((x) => x.h);
      const w = { nick: p.nick, at: now(), verified, source, hands: hs.length, from: hs.length ? hs[0] : null, to: hs.length ? hs[hs.length - 1] : null,
        winner: rep.winner, complete: rep.complete, verdict: j.verdict, common: j.common, diff: j.diff || null };
      t.witnesses = (t.witnesses || []).filter((x) => !sameNick(x.nick, p.nick)).concat([w]);
      Object.assign(data, { nick: p.nick, verified, hands: w.hands, from: w.from, to: w.to, winner: rep.winner, verdict: j.verdict, common: j.common,
        digest: createHash('sha256').update(JSON.stringify(rep)).digest('hex') }, extra || {});
    });
    // A result that waited for its witnesses to validate by itself.
    const { t } = load(t0.id);
    if (t.status === 'finished' && t.settings.validation === 'auto' && t.settings.witnesses === 'required' && t.result && t.result.status === 'complete' && witnessState(t).ok) {
      try { validate(t.id, 'witnesses'); } catch (e) { if (!(e instanceof Refusal)) throw e; }
    }
    return { nick: data.nick, verdict: data.verdict };
  }
  // The director's table of a tournament (by its public key), for the service.
  function keyHost(key) { const t = byKey(key); return t && t.host ? { watchId: t.host.watchId, status: t.host.status } : null; }
  function publicFile(key, invite, which) {
    const t = byKey(key);
    if (!t || !visible(t, invite) || (which !== 'journal' && which !== 'result')) return null;
    return file(t.id, which);
  }

  // ── result ──
  // A ranking must place every player exactly once; with no player yet, the
  // result's names become the players.
  function fitRanking(t, ranking) {
    if (!Array.isArray(ranking) || !ranking.length) refuse('empty ranking');
    if (ranking.length > maxPlayersOf(t)) refuse('more than ' + maxPlayersOf(t) + ' players');
    const nicks = ranking.map((r) => cleanNick(r.nick));
    if (nicks.some((n) => !n)) refuse('a name is missing in the ranking');
    if (new Set(nicks.map((n) => n.toLowerCase())).size !== nicks.length) refuse('a player is ranked twice');
    if (!t.players.length) {
      t.players = nicks.map((nick) => ({ nick, addedAt: now(), fromResult: true }));
    } else {
      // An absent player (the organizer went without him) is not ranked.
      const unknown = nicks.filter((n) => !t.players.some((p) => sameNick(p.nick, n)));
      const missing = t.players.filter((p) => !p.absent && !nicks.some((n) => sameNick(p.nick, n))).map((p) => p.nick);
      if (unknown.length || missing.length) {
        refuse((unknown.length ? 'not in the tournament: ' + unknown.join(', ') : '') + (unknown.length && missing.length ? ' · ' : '') + (missing.length ? 'not in the result: ' + missing.join(', ') : ''));
      }
    }
    return ranking.map((r, i) => ({
      place: Number.isInteger(r.place) && r.place >= 1 ? r.place : i + 1,
      nick: t.players.find((p) => sameNick(p.nick, cleanNick(r.nick))).nick,
      elimHand: r.elimHand != null ? Number(r.elimHand) : null,
      stack: r.stack != null ? Number(r.stack) : null,
      winner: !!r.winner || i === 0,
      tie: !!r.tie, unknown: !!r.unknown,
    }));
  }

  async function setResult(id, input, author) {
    const { t } = load(id);
    if (t.status === 'validated') refuse('already validated: use a correction');
    if (hostOpen(t) && !input.byDirector) refuse('the director is running the table: its result comes by itself (or close the table first)');
    let ranking, data = { source: input.source };
    if (input.source === 'manual') {
      ranking = (input.ranking || []).map((nick, i) => ({ nick: typeof nick === 'string' ? nick : nick && nick.nick, place: i + 1 }));
      data.status = 'complete';
    } else if (input.source === 'watch') {
      // The watch's sealed result (result.json of a Table check): its
      // signature must hold before it is reused.
      const sealed = o.readWatch && o.readWatch(String(input.watchId || ''));
      if (!sealed || !sealed.payload || !sealed.payload.result) refuse('that watch has no sealed result');
      if (sealed.signature && !verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem)) refuse('the signature of that watch does not hold');
      const res = sealed.payload.result;
      if (!res.finished) refuse('that watch did not see the end of the game');
      ranking = res.ranking.map((r) => ({ nick: r.name || ('#' + r.id), place: r.place, elimHand: r.elimHand, stack: r.stackAtHandStart, winner: r.winner, tie: r.tie, unknown: r.unknown }));
      data.watchId = String(input.watchId); data.status = res.status;
      data.watchHead = sealed.payload.head; data.watchSignature = sealed.signature || null;
      data.watchSignedBy = sealed.publicKeyPem ? publicKeyRawB64(sealed.publicKeyPem) : null;
      if (Array.isArray(input.absent) && input.absent.length) data.absent = input.absent.map(cleanNick).filter(Boolean);
      if (input.byDirector) data.byDirector = true;
    } else if (input.source === 'pdb') {
      const p = join(tdir(id), 'log.pdb');
      if (!existsSync(p)) refuse('import a log first');
      const r = await rankPdbGame(readFileSync(p), input.uniqueGameId).catch((e) => refuse(e.message));
      ranking = r.ranking;
      data.uniqueGameId = r.uniqueGameId; data.hands = r.hands;
      data.status = !r.finished ? 'incomplete' : ranking.some((x) => x.tie) ? 'incomplete' : 'complete';
      data.pdbSha256 = (t.pdb || {}).sha256 || null;
    } else refuse('unknown source');
    act(id, author, 'resultSet', data, (tt) => {
      if (data.absent) for (const p of tt.players) if (data.absent.some((x) => sameNick(x, p.nick))) p.absent = true;
      const fitted = fitRanking(tt, ranking);
      tt.result = { source: data.source, status: data.status, ranking: fitted, setAt: now(), watchId: data.watchId, uniqueGameId: data.uniqueGameId,
        absent: tt.players.filter((p) => p.absent).map((p) => p.nick), byDirector: !!data.byDirector };
      data.ranking = fitted;
      tt.status = 'finished';
      refreshWitnesses(tt);
      // The collusion check, from the director's journal (organizer only).
      const cc = collusionOf(tt);
      if (cc) { tt.collusion = cc; data.collusion = { hands: cc.hands, flags: cc.flags, notes: cc.pairs.length - cc.flags }; }
    });
  }
  function afterResult(id, author) {
    const { t } = load(id);
    // Automatic validation, unless the profile wants an organizer to do it,
    // or the result has a flag (tie, unknown hand, unfinished game) to look at.
    // With witnesses required, it waits until one agrees and none disagrees.
    if (t.settings.validation === 'auto' && t.result && t.result.status === 'complete' && (t.settings.witnesses !== 'required' || witnessState(t).ok)) return validate(id, author);
    return get(id);
  }

  function seal(t, journal) {
    const key = privateKey();
    const payload = { tournamentId: t.id, name: t.name, head: journal.head, entries: journal.entries.length, result: t.result, corrections: t.corrections };
    const sealed = { payload, signature: key ? signPayload(payload, key) : null, publicKeyPem: key ? publicKeyFromPrivate(key) : null };
    writeAtomic(join(tdir(t.id), 'result.json'), sealed);
  }

  function validate(id, author, opts) {
    const { t, journal } = load(id);
    if (!t.result) refuse('no result to validate');
    if (t.status === 'validated') refuse('already validated');
    // Witnesses required: one agrees and none disagrees — or the organizer
    // says why he validates anyway (in the journal, on the public page).
    refreshWitnesses(t);
    let override = null;
    if (t.settings.witnesses === 'required' && t.result.source !== 'stages') {
      const s = witnessState(t);
      if (!s.ok) {
        override = cleanText(opts && opts.override, 200);
        if (override.length < 3) refuse('witnesses required: ' + (s.disagree ? s.disagree + ' disagree' : 'no witness agrees yet') + ' — give a reason to validate anyway');
        t.witnessOverride = { at: now(), author: author || 'admin', reason: override, agree: s.agree, disagree: s.disagree };
      }
    }
    journal.append('validated', Object.assign({ author: author || 'admin', result: t.result }, override ? { witnessOverride: override } : {}));
    t.status = 'validated';
    t.validatedAt = now();
    seal(t, journal);
    return save(t, journal);
  }

  function correct(id, input, author) {
    const reason = cleanText(input && input.reason, 200);
    if (reason.length < 3) refuse('say why (3 to 200 characters)');
    const { t: t2, journal } = load(id);
    if (t2.status !== 'validated') refuse('only a validated result is corrected — before that, set the result again');
    if (t2.result && t2.result.source === 'stages') refuse('this ranking comes from the tables: correct the table concerned, the ranking follows');
    const rankingIn = (input.ranking || []).map((nick, i) => ({ nick: typeof nick === 'string' ? nick : nick && nick.nick, place: i + 1 }));
    const before = t2.result.ranking.map((r) => r.nick);
    const fitted = fitRanking(t2, rankingIn);
    if (fitted.map((r) => r.nick).join('\n') === before.join('\n')) refuse('same ranking as now');
    // Corrections approved by a second organizer (Official): proposed now,
    // applied when another organizer approves it.
    if (t2.settings.corrections === 'second') {
      if (t2.pendingCorrection) refuse('a correction is already waiting for a second organizer');
      const after = fitted.map((r) => r.nick);
      t2.pendingCorrection = { at: now(), by: author || 'admin', reason, before, after };
      journal.append('correctionProposed', { author: author || 'admin', reason, before, after });
      return save(t2, journal);
    }
    t2.corrections.push({ at: now(), author: author || 'admin', reason, before, after: fitted.map((r) => r.nick) });
    t2.result = Object.assign({}, t2.result, { ranking: fitted, corrected: true });
    journal.append('corrected', { author: author || 'admin', reason, before, after: fitted.map((r) => r.nick) });
    seal(t2, journal);
    const out = save(t2, journal);
    if (t2.parentId) stagesRecompute(t2.parentId);
    return out;
  }

  // The second organizer approves (or anyone rejects; the one who proposed
  // it withdraws it).
  function approveCorrection(id, author) {
    const { t, journal } = load(id);
    const p = t.pendingCorrection;
    if (!p) refuse('no correction waiting');
    if (String(p.by).toLowerCase() === String(author || 'admin').toLowerCase()) refuse('a second organizer must approve it — not the one who proposed it');
    const fitted = fitRanking(t, p.after.map((nick, i) => ({ nick, place: i + 1 })));
    t.corrections.push({ at: now(), author: p.by, approvedBy: author || 'admin', reason: p.reason, before: p.before, after: p.after });
    t.result = Object.assign({}, t.result, { ranking: fitted, corrected: true });
    delete t.pendingCorrection;
    journal.append('corrected', { author: author || 'admin', proposedBy: p.by, reason: p.reason, before: p.before, after: p.after });
    seal(t, journal);
    const out = save(t, journal);
    if (t.parentId) stagesRecompute(t.parentId);
    return out;
  }
  function rejectCorrection(id, author, why) {
    const { t, journal } = load(id);
    const p = t.pendingCorrection;
    if (!p) refuse('no correction waiting');
    const withdrawn = String(p.by).toLowerCase() === String(author || 'admin').toLowerCase();
    const reason = cleanText(why, 200);
    if (!withdrawn && reason.length < 3) refuse('say why you reject it (3 to 200 characters)');
    delete t.pendingCorrection;
    journal.append('correctionRejected', { author: author || 'admin', proposedBy: p.by, reason, withdrawn, before: p.before, after: p.after });
    return save(t, journal);
  }

  // ── .pdb import ──
  async function importPdb(id, buf, author) {
    if (!isPdb(buf)) refuse('not a PokerTH log (.pdb)');
    const { t } = load(id);
    if (t.status === 'validated') refuse('already validated');
    const info = await listPdbGames(buf).catch((e) => refuse(e.message));
    const { createHash } = await import('node:crypto');
    const sha256 = createHash('sha256').update(buf).digest('hex');
    writeAtomic(join(tdir(id), 'log.pdb'), buf);
    const v = act(id, author, 'pdbImported', { sha256, size: buf.length, games: info.games.length }, (tt) => { tt.pdb = { sha256, size: buf.length, importedAt: now(), session: info.session, games: info.games }; });
    return Object.assign({}, v, { pdbGames: info.games, pdbSession: info.session });
  }

  // ── the director opens the table (host mode) ──
  function hostOpened(id, watchId, info, author) {
    return act(id, author, 'tableOpened', Object.assign({ watchId }, info || {}), (t) => {
      if (t.status === 'validated' || t.result) refuse('the result is set');
      if (hostOpen(t)) refuse('the table is already open');
      t.host = { watchId, status: 'open', openedAt: now(), by: author || 'admin' };
      t.autoTry = null;
      t.status = 'running';
    });
  }
  function hostCheck(id) {
    const { t } = load(id);
    if (!hostOpen(t)) refuse('the table is not open');
    return t.host.watchId;
  }
  function hostNote(id, type, author) {
    return act(id, author, type, {}, (t) => { if (!hostOpen(t)) refuse('the table is not open'); });
  }
  function hostEnded(id, status, extra) {
    return act(id, 'director', 'tableEnded', Object.assign({ status }, extra || {}), (t) => {
      if (!t.host) refuse('no table');
      t.host = Object.assign({}, t.host, { status, endedAt: now() }, extra && extra.error ? { error: extra.error } : {});
      if (t.status === 'running') t.status = t.players.length ? 'registration' : 'draft';
    });
  }
  function hostResultRefused(id, reason) {
    return act(id, 'director', 'tableResultRefused', { reason }, (t) => { t.host = Object.assign({}, t.host, { resultError: reason }); });
  }
  // Tournaments whose table the director should open by itself now.
  function autoOpenDue() {
    let ids = [];
    try { ids = readdirSync(root).filter((x) => ID_RE.test(x)); } catch (e) {}
    const at = now();
    const due = [];
    for (const x of ids) {
      const t = readJson(join(tdir(x), 'tournament.json'));
      if (!t || !t.run || !t.run.autoOpen || !t.startsAt || t.result || hostOpen(t)) continue;
      if (t.status !== 'draft' && t.status !== 'registration') continue;
      if (t.host && t.host.openedAt && t.host.openedAt >= t.startsAt - t.run.openBefore * 60000) continue;   // already opened for this start
      if (at < t.startsAt - t.run.openBefore * 60000) continue;
      if (t.autoTry && t.autoTry.missed) continue;
      if (at > t.startsAt + AUTO_OPEN_GRACE_MS) { due.push({ id: t.id, missed: true }); continue; }
      if (t.autoTry && at - t.autoTry.at < AUTO_OPEN_RETRY_MS) continue;
      due.push({ id: t.id });
    }
    return due;
  }
  // A failed or missed automatic opening: said once in the journal (not at
  // every retry), kept on the tournament for the page.
  function autoOpenNote(id, reason, missed) {
    const { t, journal } = load(id);
    const same = t.autoTry && t.autoTry.reason === reason;
    t.autoTry = { at: now(), reason, missed: !!missed };
    if (!same) journal.append(missed ? 'autoOpenMissed' : 'autoOpenFailed', { author: 'scheduler', reason });
    return save(t, journal);
  }

  // Open host tables, for the service's sweep.
  function openHosts() {
    let ids = [];
    try { ids = readdirSync(root).filter((x) => ID_RE.test(x)); } catch (e) {}
    return ids.map((x) => readJson(join(tdir(x), 'tournament.json'))).filter((t) => t && hostOpen(t)).map((t) => ({ id: t.id, watchId: t.host.watchId }));
  }

  function file(id, which) {
    if (!ID_RE.test(String(id || ''))) return null;
    const name = { journal: 'journal.json', result: 'result.json', pdb: 'log.pdb' }[which];
    if (!name) return null;
    try { return readFileSync(join(tdir(id), name)); } catch (e) { return null; }
  }

  // setResult chains act() (sync) then validation; keep it a promise.
  async function setResultP(id, input, author) {
    await setResult(id, input, author);
    return afterResult(id, author);
  }

  return { list, get, create, update, addPlayer, removePlayer, setResult: setResultP, validate, correct, approveCorrection, rejectCorrection, importPdb, file,
    publicList, publicGet, register, unregister, publicFile, witnessReport, witnessLog, keyHost, checkCollusion, allRaw: () => allTournaments(), generation: () => gen, idOfKey: (key) => { const t = byKey(key); return t ? t.id : null; }, drawTables, makeFinal, stagesTick, stagesRecompute, multiParents: () => allTournaments().filter((t) => t.format === 'multi' && t.stages && t.status !== 'validated').map((t) => t.id), checkIn, issueCode, organizerCheckIn, markNotCheckedIn, needsCheckIn: (id) => needsCheckIn(load(id).t),
    hostOpened, hostCheck, hostNote, hostEnded, hostResultRefused, openHosts, autoOpenDue, autoOpenNote, Refusal };
}

export { Refusal };
