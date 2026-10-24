#!/usr/bin/env node
// Tests of the tournament director's manual mode
// (tournament/lib/tournaments.mjs, tournament/lib/pdb.mjs): profiles,
// players, the three result sources (typed, a Table check's sealed result,
// a .pdb log), validation, corrections, the sealed journal and its checks.
// Run: node tournament/test/test-td-tournaments.mjs
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTournaments, PROFILES, cleanNick } from '../lib/tournaments.mjs';
import { listPdbGames, rankPdbGame } from '../lib/pdb.mjs';
import { generateKeys, signPayload, verifyJournal } from '../lib/journal.mjs';
import { buildPdb, sampleGames } from './lib/td-pdb-fixture.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
async function refused(p, re, label) {
  try { await p; ok(false, label + ' (accepted)'); } catch (e) { ok(re.test(e.message), label + (re.test(e.message) ? '' : ' — got: ' + e.message)); }
}

const dir = mkdtempSync(join(tmpdir(), 'td-tour-'));
const keys = generateKeys();
writeFileSync(join(dir, 'td-key.pem'), keys.privateKeyPem);
const watches = {};
let clock = 1792800000000;
const T = createTournaments({ dir, keyFile: join(dir, 'td-key.pem'), now: () => clock++, readWatch: (id) => watches[id] || null });

// ── .pdb reader ────────────────────────────────────────────────────
const pdb = await buildPdb(sampleGames());
const info = await listPdbGames(pdb);
ok(info.games.length === 2 && info.games[1].players.join(',') === 'Alice,Bob,Carol,Dave' && info.games[1].finished, 'pdb: both games listed with their players');
const ranked = await rankPdbGame(pdb, 2);
ok(ranked.ranking.map((r) => r.nick).join(',') === 'Alice,Bob,Carol,Dave', 'pdb: BBC rule — winner, then last hand, then cash at its start');
ok(ranked.ranking[3].elimHand === 1 && ranked.ranking[1].stack === 600, 'pdb: hand and stack kept');
const tied = await buildPdb([{ uniqueGameId: 3, gameId: 9, startMoney: 500, seats: ['A', 'B', 'C'], hands: [{ cash: { 1: 500, 2: 500, 3: 500 }, actions: [[1, 'wins game']] }] }]);
const rt = await rankPdbGame(tied, 3);
ok(rt.ranking[1].place === 2 && rt.ranking[2].place === 2 && rt.ranking[1].tie, 'pdb: same hand and same cash share a place, as on the BBC site');
await refused(listPdbGames(Buffer.from('not a log at all, clearly not sqlite..........................................................................')), /not a \.pdb/, 'pdb: anything else refused');

// ── create, profiles ───────────────────────────────────────────────
const c = await T.create({ name: 'Friday SnG', profile: 'club', server: { ref: 'local', name: 'Local server', host: '127.0.0.1', port: 7234 }, startsAt: 1792900000000 }, 'admin');
ok(c.id && c.status === 'draft' && c.mode === 'manual' && c.format === 'sitngo', 'create: draft, manual mode, Sit & Go');
ok(JSON.stringify(c.settings) === JSON.stringify(PROFILES.club), 'create: club profile settings');
ok(c.checks.chain && c.history[0].type === 'created', 'create: sealed journal starts with « created »');
const priv = await T.create({ name: 'Private one', profile: 'friendly', visibility: 'private' }, 'admin');
ok(priv.settings.visibility === 'private' && priv.inviteCode && priv.inviteCode.length >= 8, 'private: an invitation code is made');
const cust = await T.create({ name: 'Custom', profile: 'custom', settings: { identity: 'code', witnesses: 'nope', archiveDays: 99 } }, 'admin');
ok(cust.settings.identity === 'code' && cust.settings.witnesses === PROFILES.club.witnesses && cust.settings.archiveDays === 99, 'custom: valid choices kept, others fall back');
await refused(Promise.resolve().then(() => T.create({ name: 'x' })), /name/, 'create: a name is needed');
ok(T.list().length === 3, 'list: three tournaments');

// ── players ────────────────────────────────────────────────────────
for (const n of ['Alice', 'Bob', 'Carol', 'Dave']) await T.addPlayer(c.id, n, 'admin');
await refused(Promise.resolve().then(() => T.addPlayer(c.id, 'alice', 'admin')), /already in/, 'players: no duplicate (case-insensitive)');
await T.addPlayer(c.id, 'Eve', 'admin');
const rm = await T.removePlayer(c.id, 'Eve', 'admin');
ok(rm.players.map((p) => p.nick).join(',') === 'Alice,Bob,Carol,Dave' && rm.status === 'registration', 'players: added and removed, registration open');
ok(cleanNick('  Bob  ') === 'Bob' && Buffer.byteLength(cleanNick('é'.repeat(80))) <= 64, 'nicknames trimmed and capped at 64 bytes like the server');

// ── manual result, automatic validation (club) ─────────────────────
await refused(T.setResult(c.id, { source: 'manual', ranking: ['Alice', 'Bob', 'Carol'] }, 'admin'), /not in the result: Dave/, 'manual: every player must be placed');
await refused(T.setResult(c.id, { source: 'manual', ranking: ['Alice', 'Bob', 'Carol', 'Zed'] }, 'admin'), /not in the tournament: Zed/, 'manual: no stranger in the ranking');
const r1 = await T.setResult(c.id, { source: 'manual', ranking: ['Alice', 'Carol', 'Bob', 'Dave'] }, 'admin');
ok(r1.status === 'validated' && r1.result.source === 'manual', 'club: a complete result is validated at once');
ok(r1.checks.chain && r1.checks.headMatches && r1.checks.signature, 'club: journal intact, signed head in the journal, signature valid');
await refused(Promise.resolve().then(() => T.addPlayer(c.id, 'Late', 'admin')), /result is set/, 'players frozen once the result is set');

// ── correction (free, logged) ──────────────────────────────────────
await refused(Promise.resolve().then(() => T.correct(c.id, { ranking: ['Alice', 'Bob', 'Carol', 'Dave'], reason: '' }, 'admin')), /say why/, 'correction: a reason is required');
const cor = await T.correct(c.id, { ranking: ['Alice', 'Bob', 'Carol', 'Dave'], reason: 'Bob and Carol swapped by mistake' }, 'admin');
ok(cor.result.ranking[1].nick === 'Bob' && cor.result.corrected && cor.corrections.length === 1 && cor.corrections[0].before[1] === 'Carol', 'correction: added, with before and after');
ok(cor.history.some((h) => h.type === 'corrected') && cor.history.some((h) => h.type === 'resultSet'), 'correction: the first result stays in the journal');
ok(cor.checks.signature && cor.checks.headMatches, 'correction: re-signed');

// ── official: organizer validation, corrections need a second organizer ──
const off = await T.create({ name: 'Official cup', profile: 'official' }, 'admin');
for (const n of ['A1', 'B1']) await T.addPlayer(off.id, n, 'admin');
const o1 = await T.setResult(off.id, { source: 'manual', ranking: ['B1', 'A1'] }, 'admin');
ok(o1.status === 'finished' && !o1.sealedHead, 'official: result waits for an organizer');
await refused(Promise.resolve().then(() => T.validate(off.id, 'admin')), /witnesses required/, 'official: witnesses required — no validation without one, or a reason');
const o2 = await T.validate(off.id, 'admin', { override: 'played at the club, seen by the organizer' });
ok(o2.status === 'validated' && o2.checks.signature && o2.witnessOverride.reason === 'played at the club, seen by the organizer', 'official: validated by hand with a reason, then signed');
const pr = await T.correct(off.id, { ranking: ['A1', 'B1'], reason: 'appeal accepted' }, 'admin');
ok(pr.pendingCorrection && pr.pendingCorrection.by === 'admin' && pr.result.ranking[0].nick === 'B1' && pr.history.some((h) => h.type === 'correctionProposed'), 'official: a correction is proposed, the result unchanged until approved');
await refused(Promise.resolve().then(() => T.correct(off.id, { ranking: ['A1', 'B1'], reason: 'again' }, 'Alice')), /already waiting/, 'official: one correction waiting at a time');
await refused(Promise.resolve().then(() => T.approveCorrection(off.id, 'ADMIN')), /second organizer must approve/, 'official: not approved by the one who proposed it');
await refused(Promise.resolve().then(() => T.rejectCorrection(off.id, 'Alice', '')), /say why/, 'official: rejecting needs a reason');
const ap = await T.approveCorrection(off.id, 'Alice');
ok(!ap.pendingCorrection && ap.result.ranking[0].nick === 'A1' && ap.result.corrected && ap.corrections[0].approvedBy === 'Alice' && ap.checks.signature && ap.history.some((h) => h.type === 'corrected' && /proposed by admin, approved by Alice/.test(h.summary)), 'official: approved by a second organizer, applied and signed again');
await T.correct(off.id, { ranking: ['B1', 'A1'], reason: 'second thoughts' }, 'Alice');
const wd = await T.rejectCorrection(off.id, 'Alice');
ok(!wd.pendingCorrection && wd.result.ranking[0].nick === 'A1' && wd.history.some((h) => h.type === 'correctionRejected' && /withdrawn/.test(h.summary)), 'official: the one who proposed it can withdraw it');
await T.correct(off.id, { ranking: ['B1', 'A1'], reason: 'third try' }, 'Alice');
const rj = await T.rejectCorrection(off.id, 'Bob', 'the log says otherwise');
ok(!rj.pendingCorrection && rj.result.ranking[0].nick === 'A1' && rj.history.some((h) => h.type === 'correctionRejected' && /rejected: the log says otherwise/.test(h.summary)), 'official: another organizer can reject it, with a reason');

// ── result from a Table check ──────────────────────────────────────
const wPayload = { journalVersion: 1, head: 'ab'.repeat(32), entries: 40, result: { finished: true, status: 'complete', ranking: [
  { place: 1, id: 11, name: 'Alice', winner: true, elimHand: null, stackAtHandStart: null },
  { place: 2, id: 12, name: 'Bob', elimHand: 2, stackAtHandStart: 600 },
  { place: 3, id: 13, name: 'Carol', elimHand: 2, stackAtHandStart: 400 },
  { place: 4, id: 14, name: 'Dave', elimHand: 1, stackAtHandStart: 1000 }] } };
watches.w1abc123 = { payload: wPayload, signature: signPayload(wPayload, keys.privateKeyPem), publicKeyPem: keys.publicKeyPem };
watches.w2abc123 = { payload: Object.assign({}, wPayload, { entries: 41 }), signature: watches.w1abc123.signature, publicKeyPem: keys.publicKeyPem };
const wt = await T.create({ name: 'From a watch', profile: 'friendly' }, 'admin');
await refused(T.setResult(wt.id, { source: 'watch', watchId: 'w2abc123' }, 'admin'), /signature/, 'watch: a result whose signature fails is refused');
const fromW = await T.setResult(wt.id, { source: 'watch', watchId: 'w1abc123' }, 'admin');
ok(fromW.players.length === 4 && fromW.result.ranking.map((r) => r.nick).join(',') === 'Alice,Bob,Carol,Dave' && fromW.status === 'validated', 'watch: no players yet → they come from the result; validated');
const jW = JSON.parse(readFileSync(join(dir, 'tournaments', wt.id, 'journal.json'), 'utf8'));
const setW = jW.entries.find((e) => e.type === 'resultSet');
ok(setW.data.watchHead === wPayload.head && setW.data.watchSignature && setW.data.watchSignedBy, 'watch: its head and signature are kept in the tournament journal');

// ── result from a .pdb ─────────────────────────────────────────────
const pt = await T.create({ name: 'From a log', profile: 'club' }, 'admin');
await refused(T.setResult(pt.id, { source: 'pdb', uniqueGameId: 2 }, 'admin'), /import a log/, 'pdb: a log is needed first');
const imp = await T.importPdb(pt.id, pdb, 'admin');
ok(imp.pdbGames.length === 2 && imp.pdb.sha256.length === 64, 'pdb: imported, its games returned, fingerprint kept');
const fromP = await T.setResult(pt.id, { source: 'pdb', uniqueGameId: 2 }, 'admin');
ok(fromP.result.ranking.map((r) => r.nick).join(',') === 'Alice,Bob,Carol,Dave' && fromP.status === 'validated', 'pdb: the picked game ranked and validated');
ok(T.file(pt.id, 'pdb').length === pdb.length, 'pdb: the log is kept as evidence');
const ptie = await T.create({ name: 'Tied log', profile: 'club' }, 'admin');
await T.importPdb(ptie.id, tied, 'admin');
const tieRes = await T.setResult(ptie.id, { source: 'pdb', uniqueGameId: 3 }, 'admin');
ok(tieRes.result.status === 'incomplete' && tieRes.status === 'finished', 'pdb: a tie is not validated automatically — an organizer looks first');

// ── journal tampering and files ────────────────────────────────────
const jp = join(dir, 'tournaments', c.id, 'journal.json');
const j = JSON.parse(readFileSync(jp, 'utf8'));
ok(verifyJournal(j.entries).ok, 'journal file verifies');
j.entries[2].data.nick = 'Mallory';
writeFileSync(jp, JSON.stringify(j));
await refused(Promise.resolve().then(() => T.get(c.id)), /broken/, 'a tampered journal is refused on load');
ok(T.file(c.id, '../x') === null && T.file('../../etc', 'journal') === null, 'files: only the tournament\'s own');
await refused(Promise.resolve().then(() => T.get('nope')), /unknown tournament/, 'unknown id refused');

rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} FAILED` : '\nall td-tournaments tests passed');
process.exit(fails ? 1 : 0);
