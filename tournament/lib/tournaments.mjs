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
// Design: docs/TOURNAMENT_DIRECTOR.md (Tournament settings, Trust).
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, renameSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { Journal, verifyJournal, signPayload, verifyPayload, publicKeyFromPrivate, publicKeyRawB64 } from './journal.mjs';
import { listPdbGames, rankPdbGame, isPdb, pdbWitness } from './pdb.mjs';
import { isBotLang } from './botchat.mjs';
import { cleanReport, directorFacts, compareWithDirector, compareWithRanking, MAX_HANDS } from './witness.mjs';
import { analyzeCollusion } from './collusion.mjs';

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
const FORMATS = ['sitngo'];
// Table settings when the director opens the table (PokerTH NetGameInfo).
export const TABLE_DEFAULTS = Object.freeze({
  startMoney: 3000, firstSmallBlind: 10, raiseMode: 'hands', raiseEvery: 7,
  endRaiseMode: 'double', endRaiseValue: 0, actionTimeout: 30, delayBetweenHands: 7,
});
// How the director runs the table: opening by itself before the start, and
// its announcements in the table chat.
export const RUN_DEFAULTS = Object.freeze({ autoOpen: false, openBefore: 10, announce: true, selfRegister: true, checkInBefore: 30, chatLang: 'en', qmlWitnesses: false });
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
    // QML players witness by sending their log (.pdb) on the players' page.
    qmlWitnesses: typeof r.qmlWitnesses === 'boolean' ? r.qmlWitnesses : !!b.qmlWitnesses,
    // Check-in (identity « code »): opens this long before the start.
    checkInBefore: Number.isInteger(ci) && ci >= 5 && ci <= 240 ? ci : b.checkInBefore,
    // The language the director writes in, in the chat (botlang/<code>.mjs).
    chatLang: isBotLang(r.chatLang) ? String(r.chatLang).toLowerCase() : (b.chatLang || 'en'),
  };
}
// A table opened by itself is not opened any more this long after the start.
const AUTO_OPEN_GRACE_MS = 60 * 60 * 1000;
const AUTO_OPEN_RETRY_MS = 2 * 60 * 1000;
export function cleanTable(t, base) {
  const b = Object.assign({}, TABLE_DEFAULTS, base || {});
  t = t || {};
  const int = (v, min, max, d) => { const x = parseInt(v, 10); return Number.isInteger(x) && x >= min && x <= max ? x : d; };
  const o = {};
  o.startMoney = int(t.startMoney, 100, 1000000, b.startMoney);
  o.firstSmallBlind = int(t.firstSmallBlind, 1, Math.max(1, Math.floor(o.startMoney / 2)), Math.min(b.firstSmallBlind, Math.max(1, Math.floor(o.startMoney / 2))));
  o.raiseMode = ['hands', 'minutes'].indexOf(t.raiseMode) >= 0 ? t.raiseMode : b.raiseMode;
  o.raiseEvery = int(t.raiseEvery, 1, o.raiseMode === 'minutes' ? 60 : 100, Math.min(b.raiseEvery, o.raiseMode === 'minutes' ? 60 : 100));
  o.endRaiseMode = ['double', 'value', 'keep'].indexOf(t.endRaiseMode) >= 0 ? t.endRaiseMode : b.endRaiseMode;
  o.endRaiseValue = o.endRaiseMode === 'value' ? int(t.endRaiseValue, 1, 1000000, b.endRaiseValue || o.firstSmallBlind * 2) : 0;
  o.actionTimeout = int(t.actionTimeout, 5, 120, b.actionTimeout);
  o.delayBetweenHands = int(t.delayBetweenHands, 3, 20, b.delayBetweenHands);
  return o;
}
const ID_RE = /^[a-z0-9]{8,32}$/;
const NICK_MAX = 64;
const MAX_PLAYERS = 10;   // one table (Sit & Go)

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
  function save(t, journal) {
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
        players: t.players.length, server: t.server ? t.server.name : null, resultStatus: t.result ? t.result.status : null, host: t.host ? t.host.status : null }));
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
    if (run.autoOpen && startsAt == null) refuse('opening by itself needs a start date');
    const t = {
      id, name, format, profile, settings, server, startsAt, mode: 'manual', table, run, host: null,
      status: 'draft', players: [], result: null, corrections: [],
      inviteCode: settings.visibility === 'private' ? randomBytes(6).toString('base64url') : null,
      // The public address (/tournament/t/<publicKey>): random, so an
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
      if (t.status === 'validated') refuse('already validated: use a correction');
      const changes = data.changes;
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
      if (t.players.length >= MAX_PLAYERS) refuse('a Sit & Go seats ' + MAX_PLAYERS + ' players at most');
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
    const closed = !!(t.result || hostOpen(t) || t.status === 'validated');
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
    if (hostOpen(t)) return 'tableOpen';
    if (t.players.length >= MAX_PLAYERS) return 'full';
    return null;
  }
  function phaseOf(t) {
    if (t.status === 'validated') return 'validated';
    if (t.result) return 'finished';
    if (hostOpen(t)) return 'table';
    return 'upcoming';
  }
  function publicCard(t) {
    const w = t.result && t.result.ranking && t.result.ranking.find((r) => r.place === 1);
    return {
      key: t.publicKey, name: t.name, format: t.format, profile: t.profile, startsAt: t.startsAt,
      server: t.server ? t.server.name : null, players: t.players.length, maxPlayers: MAX_PLAYERS,
      phase: phaseOf(t), registration: regClosed(t) ? 'closed' : 'open', winner: w ? w.nick : null,
    };
  }
  // Public tournaments only; unlisted and private ones never appear here.
  function publicList() {
    return allTournaments().filter((t) => t.settings && t.settings.visibility === 'public')
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
    if (ranking.length > MAX_PLAYERS) refuse('more than ' + MAX_PLAYERS + ' players');
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
    if (t.settings.witnesses === 'required') {
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
    return save(t2, journal);
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
    return save(t, journal);
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
    publicList, publicGet, register, unregister, publicFile, witnessReport, witnessLog, keyHost, checkCollusion, checkIn, issueCode, organizerCheckIn, markNotCheckedIn, needsCheckIn: (id) => needsCheckIn(load(id).t),
    hostOpened, hostCheck, hostNote, hostEnded, hostResultRefused, openHosts, autoOpenDue, autoOpenNote, Refusal };
}

export { Refusal };
