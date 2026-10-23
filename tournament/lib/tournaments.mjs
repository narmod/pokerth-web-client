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
import { randomBytes } from 'node:crypto';
import { Journal, verifyJournal, signPayload, verifyPayload, publicKeyFromPrivate, publicKeyRawB64 } from './journal.mjs';
import { listPdbGames, rankPdbGame, isPdb } from './pdb.mjs';

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
      case 'pdbImported': return 'imported a log (' + d.games + ' game' + (d.games === 1 ? '' : 's') + ', sha256 ' + String(d.sha256).slice(0, 12) + '…)';
      case 'resultSet': return 'result from ' + d.source + (d.watchId ? ' ' + d.watchId : '') + (d.uniqueGameId != null ? ' game ' + d.uniqueGameId : '');
      case 'validated': return 'validated and signed';
      case 'corrected': return 'corrected: ' + d.reason;
      case 'tableOpened': return 'the director opens the table on ' + (d.server || 'the server') + ' (' + d.watchId + ')';
      case 'tableGo': return 'go without the absent';
      case 'tableReinvite': return 'invitations sent again';
      case 'tableEnded': return 'table ' + d.status + (d.error ? ': ' + d.error : '');
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
    const t = {
      id, name, format, profile, settings, server, startsAt, mode: 'manual', table, host: null,
      status: 'draft', players: [], result: null, corrections: [],
      inviteCode: settings.visibility === 'private' ? randomBytes(6).toString('base64url') : null,
      createdAt: now(), updatedAt: now(),
    };
    const journal = new Journal({ now });
    journal.append('created', { author: author || 'admin', name, format, profile, settings, server, startsAt, table });
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
      if (patch.table) {
        if (hostOpen(t)) refuse('the table is open: close it first');
        changes.table = t.table = cleanTable(patch.table, t.table || TABLE_DEFAULTS);
      }
      if (!Object.keys(changes).length) refuse('nothing to change');
    });
  }

  // ── players ──
  function addPlayer(id, nickIn, author) {
    const nick = cleanNick(nickIn);
    return act(id, author, 'playerAdded', { nick }, (t) => {
      if (!nick) refuse('nickname missing');
      if (t.result) refuse('the result is set: players can no longer change');
      if (hostOpen(t)) refuse('the table is open: players can no longer change');
      if (t.players.some((p) => sameNick(p.nick, nick))) refuse(nick + ' is already in');
      if (t.players.length >= MAX_PLAYERS) refuse('a Sit & Go seats ' + MAX_PLAYERS + ' players at most');
      t.players.push({ nick, addedAt: now() });
      if (t.status === 'draft') t.status = 'registration';
    });
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
    });
  }
  function afterResult(id, author) {
    const { t } = load(id);
    // Automatic validation, unless the profile wants an organizer to do it,
    // or the result has a flag (tie, unknown hand, unfinished game) to look at.
    if (t.settings.validation === 'auto' && t.result && t.result.status === 'complete') return validate(id, author);
    return get(id);
  }

  function seal(t, journal) {
    const key = privateKey();
    const payload = { tournamentId: t.id, name: t.name, head: journal.head, entries: journal.entries.length, result: t.result, corrections: t.corrections };
    const sealed = { payload, signature: key ? signPayload(payload, key) : null, publicKeyPem: key ? publicKeyFromPrivate(key) : null };
    writeAtomic(join(tdir(t.id), 'result.json'), sealed);
  }

  function validate(id, author) {
    const { t, journal } = load(id);
    if (!t.result) refuse('no result to validate');
    if (t.status === 'validated') refuse('already validated');
    journal.append('validated', { author: author || 'admin', result: t.result });
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
    if (t2.settings.corrections === 'second') refuse('this profile needs a second organizer to approve corrections; organizer accounts come later');
    const rankingIn = (input.ranking || []).map((nick, i) => ({ nick: typeof nick === 'string' ? nick : nick && nick.nick, place: i + 1 }));
    const before = t2.result.ranking.map((r) => r.nick);
    const fitted = fitRanking(t2, rankingIn);
    if (fitted.map((r) => r.nick).join('\n') === before.join('\n')) refuse('same ranking as now');
    t2.corrections.push({ at: now(), author: author || 'admin', reason, before, after: fitted.map((r) => r.nick) });
    t2.result = Object.assign({}, t2.result, { ranking: fitted, corrected: true });
    journal.append('corrected', { author: author || 'admin', reason, before, after: fitted.map((r) => r.nick) });
    seal(t2, journal);
    return save(t2, journal);
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
      t.host = { watchId, status: 'open', openedAt: now() };
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

  return { list, get, create, update, addPlayer, removePlayer, setResult: setResultP, validate, correct, importPdb, file,
    hostOpened, hostCheck, hostNote, hostEnded, hostResultRefused, openHosts, Refusal };
}

export { Refusal };
