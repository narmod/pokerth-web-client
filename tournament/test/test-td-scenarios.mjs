#!/usr/bin/env node
// Scenarios of the director at a tournament table (service 0.18.0), against
// a fake PokerTH server that behaves like the real one (servergamestate.cpp,
// serverlobbythread.cpp): invitations and their answers, a « busy » answer
// for a player in another game, the admin passing to the first player when
// the creator leaves, kicks before the start only, case-sensitive nicknames.
// Each scenario drives the server by hand and checks what the director did.
// The absence rule runs on short times here (retry 120 ms, grace 0–300 ms).
// Run: node tournament/test/test-td-scenarios.mjs
import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { HostDirector, CLOSED_BY_ORGANIZER } from '../lib/host.mjs';
import { cleanTable } from '../lib/table.mjs';
import { generateKeys } from '../lib/journal.mjs';
import { cleanAbsence, cleanRun } from '../lib/tournaments.mjs';
import { msg, fakeServer, wait } from './lib/td-fake-server.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
async function until(fn, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await wait(20); }
  return null;
}

const GID = 60, ME = 99;
const NAMES = { 21: 'Alice', 22: 'Bob', 23: 'Carol', 24: 'Dave', 25: 'Mallory', 26: 'bob', 27: 'Erin', 28: 'Frank', 29: 'Gina', 30: 'Hugo', 31: 'Ivy', 32: 'Jack', 33: 'Carol', [ME]: 'TD-s' };
const M = {
  announce: () => msg(0, 'announceMessage', { protocolVersion: { majorVersion: 5, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 }, latestBetaRevision: 0, serverType: 1, numPlayersOnServer: 5 }),
  initAck: () => msg(0, 'initAckMessage', { yourSessionId: Buffer.alloc(16, 1), yourPlayerId: ME }),
  lobby: (id, left) => msg(0, 'playerListMessage', { playerId: id, playerListNotification: left ? 1 : 0 }),
  info: (id) => msg(0, 'playerInfoReplyMessage', { playerId: id, playerInfoData: { playerName: NAMES[id], isHuman: true, playerRights: 1 } }),
  created: (gi) => msg(0, 'joinGameAckMessage', { gameId: GID, areYouGameAdmin: true, gameInfo: gi }),
  joined: (id, admin) => msg(0, 'gamePlayerJoinedMessage', { gameId: GID, playerId: id, isGameAdmin: !!admin }),
  left: (id, reason) => msg(0, 'gamePlayerLeftMessage', { gameId: GID, playerId: id, gamePlayerLeftReason: reason || 0 }),
  rejectInv: (id, busy) => msg(0, 'rejectInvNotifyMessage', { gameId: GID, playerId: id, playerRejectReason: busy ? 1 : 0 }),
  otherGameLeft: (id) => msg(0, 'gameListPlayerLeftMessage', { gameId: 3, playerId: id }),
  removed: () => msg(0, 'removedFromGameMessage', { gameId: GID, removedFromGameReason: 0 }),
  adminChanged: (id) => msg(0, 'gameListAdminChangedMessage', { gameId: GID, newAdminPlayerId: id }),
  specAck: (gi) => msg(0, 'joinGameAckMessage', { gameId: GID, areYouGameAdmin: false, gameInfo: gi, spectateOnly: true }),
  start: (seats) => msg(0, 'gameStartInitialMessage', { gameId: GID, startDealerPlayerId: seats[0], playerSeats: seats }),
};

// A server driven by the test: `S.sit(id)`, `S.reject(id, busy)`, … The
// `onInvite` hook answers invitations as a scenario wants.
async function scene({ lobbyIds, onInvite }) {
  const S = { gi: null, seats: [], admin: ME, invites: [], pms: [], chats: [], kicks: [], leaves: 0, specJoins: 0, w: null };
  const f = await fakeServer((conn) => {
    const w = (b) => { try { conn.sock.write(b); } catch (e) {} };
    S.w = w;
    conn.onMsg = (m) => {
      if (m.initMessage) { w(M.initAck()); for (const id of lobbyIds) w(M.lobby(id)); }
      if (m.playerInfoRequestMessage) for (const id of m.playerInfoRequestMessage.playerId) if (NAMES[id]) w(M.info(id));
      if (m.joinNewGameMessage) { S.gi = m.joinNewGameMessage.gameInfo; w(M.created(S.gi)); w(M.joined(ME, true)); }
      if (m.invitePlayerToGameMessage) { const id = m.invitePlayerToGameMessage.playerId; S.invites.push(id); if (onInvite) onInvite(id, S); }
      if (m.kickPlayerRequestMessage) { const id = m.kickPlayerRequestMessage.playerId; S.kicks.push(id); S.seats = S.seats.filter((x) => x !== id); w(M.left(id, 1)); }
      if (m.chatRequestMessage) { const c = m.chatRequestMessage; if (c.targetPlayerId) S.pms.push({ to: c.targetPlayerId, text: c.chatText }); else S.chats.push(c.chatText); }
      if (m.leaveGameRequestMessage) { S.leaves += 1; if (S.specJoins === 0) { S.admin = S.seats[0]; w(M.removed()); if (S.admin != null) w(M.adminChanged(S.admin)); } }
      if (m.joinExistingGameMessage && m.joinExistingGameMessage.spectateOnly) { S.specJoins += 1; w(M.specAck(S.gi)); for (const id of S.seats) w(M.joined(id, id === S.admin)); }
    };
    w(M.announce());
  });
  Object.assign(S, {
    f,
    sit: (id) => { S.seats.push(id); S.w(M.joined(id, false)); },
    stand: (id) => { S.seats = S.seats.filter((x) => x !== id); S.w(M.left(id, 0)); },
    reject: (id, busy) => S.w(M.rejectInv(id, busy)),
    gone: (id) => S.w(M.lobby(id, true)),
    back: (id) => S.w(M.lobby(id)),
    otherGameLeft: (id) => S.w(M.otherGameLeft(id)),
    start: (seats) => S.w(M.start(seats || S.seats)),
    newAdmin: (id) => { S.admin = id; S.w(M.adminChanged(id)); },
    count: (id) => S.invites.filter((x) => x === id).length,
    pm: (to, re) => S.pms.some((p) => p.to === to && re.test(p.text)),
  });
  return S;
}
const keys = generateKeys();
function director(S, registered, absence, extra) {
  return new HostDirector(Object.assign({
    host: '127.0.0.1', port: S.f.port, nick: 'TD-s', tableName: 'Scenario', table: cleanTable({}), registered,
    privateKeyPem: keys.privateKeyPem, version: '2.1.10-web.316', handoverDelayMs: 0, nameWaitMs: 0, reconnects: 0,
    chatGapMs: 10, pmGapMs: 2, adminNoticeDelayMs: 10, tickMs: 20,
    absence: Object.assign({ mode: 'auto', strikes: 3, retryMs: 120, graceMs: 0 }, absence || {}),
  }, extra || {}));
}
const entries = (d, type) => d.journal.entries.filter((e) => e.type === type).map((e) => e.data);
const reg = (d, nick) => d.hostState().registered.find((r) => r.nick === nick);
const close = (d, S) => { try { d.stop('test'); } catch (e) {} S.f.server.close(); };

// 0 ── the rule's settings.
{
  ok(JSON.stringify(cleanAbsence()) === '{"mode":"auto","strikes":3,"retrySec":60,"graceMin":10}' && cleanRun({}).absence.mode === 'auto', 'default: automatic, 3 failures, 1 min, 10 min after the start');
  const c = cleanAbsence({ mode: 'custom', strikes: 5, retrySec: 5, graceMin: 500 });
  ok(c.mode === 'custom' && c.strikes === 5 && c.retrySec === 20 && c.graceMin === 120, 'custom: the organizer\'s numbers, kept within bounds');
  ok(cleanAbsence({ mode: 'manual', strikes: 9 }).mode === 'manual' && cleanAbsence({ mode: 'x' }).mode === 'auto', 'manual; an unknown mode is automatic');
}
// 1 ── refuses three times: invited again each time, then absent; the table goes on.
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => { if (id === 23) setTimeout(() => S.reject(23, false), 10); else setTimeout(() => S.sit(id), 10); } });
  const d = director(S, ['Alice', 'Bob', 'Carol']);
  d.start();
  await until(() => S.leaves >= 1, 4000);
  ok(S.count(23) === 3 && reg(d, 'Carol').status === 'absent' && reg(d, 'Carol').absentWhy === 'failures', 'refused 3 times: invited 3 times, then absent');
  ok(entries(d, 'inviteFailed').filter((x) => x.nick === 'Carol').map((x) => x.reason).join() === 'declined,declined,declined', 'journal: each refusal a failure');
  ok(S.pm(23, /^you did not join the table in time/), 'the absent player is told privately');
  ok(S.leaves === 1 && entries(d, 'handover')[0].seated.length === 2, 'the table goes on with the two others (hand-over)');
  close(d, S);
}
// 2 ── never answers: an unanswered invitation is a failure and is sent again.
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => { if (id !== 23) setTimeout(() => S.sit(id), 10); } });
  const d = director(S, ['Alice', 'Bob', 'Carol']);
  d.start();
  await until(() => S.leaves >= 1, 4000);
  ok(S.count(23) === 3 && entries(d, 'inviteFailed').filter((x) => x.nick === 'Carol').every((x) => x.reason === 'noAnswer') && reg(d, 'Carol').status === 'absent', 'no answer: invited again every retry, absent after 3');
  close(d, S);
}
// 3 ── busy in another game: each « busy » a failure; out of the other game: invited at once, no failure.
{
  let busy = 2;
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => {
    if (id !== 23) return setTimeout(() => S.sit(id), 10);
    if (busy > 0) { busy -= 1; setTimeout(() => S.reject(23, true), 5); if (busy === 0) setTimeout(() => S.otherGameLeft(23), 60); }
    else setTimeout(() => S.sit(23), 10);
  } });
  const d = director(S, ['Alice', 'Bob', 'Carol'], { graceMs: 5000 });
  d.start();
  await until(() => S.leaves >= 1, 4000);
  ok(S.count(23) === 3 && reg(d, 'Carol').failures === 2 && d.seated.size === 3, 'busy twice (2 failures), back from the other game: invited at once without a failure, seated');
  close(d, S);
}
// 4 ── drops and comes back: invited again at once, no failure.
{
  let first = true;
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => {
    if (id !== 23) return setTimeout(() => S.sit(id), 10);
    if (first) { first = false; setTimeout(() => { S.gone(23); setTimeout(() => S.back(23), 30); }, 10); }
    else setTimeout(() => S.sit(23), 10);
  } });
  const d = director(S, ['Alice', 'Bob', 'Carol'], { graceMs: 5000 });
  d.start();
  await until(() => d.seated.size === 3, 3000);
  ok(S.count(23) === 2 && (reg(d, 'Carol').failures || 0) === 0 && entries(d, 'playerDisconnected').length === 1, 'a drop: invited again when back, no failure');
  close(d, S);
}
// 5 ── never connected: absent once past the deadline (after one retry time offline).
{
  const S = await scene({ lobbyIds: [21, 22], onInvite: (id, S) => setTimeout(() => S.sit(id), 10) });
  const d = director(S, ['Alice', 'Bob', 'Dave'], { graceMs: 200 });
  d.start();
  await until(() => d.seated.size === 2, 2000);
  await wait(60);
  ok(d.phase === 'seated' && reg(d, 'Dave').status === 'offline', 'before the deadline: Dave not connected, the table waits');
  await until(() => S.leaves >= 1, 3000);
  ok(reg(d, 'Dave').status === 'absent' && reg(d, 'Dave').absentWhy === 'neverConnected' && S.leaves === 1, 'past the deadline: Dave absent (never connected), the table goes on');
  close(d, S);
}
// 6 ── grace period: failures before the deadline do not remove anyone yet.
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => { if (id === 23) setTimeout(() => S.reject(23, false), 5); else setTimeout(() => S.sit(id), 10); } });
  const d = director(S, ['Alice', 'Bob', 'Carol'], { graceMs: 900 });
  d.start();
  await until(() => (reg(d, 'Carol') || {}).failures >= 4, 3000);
  ok(reg(d, 'Carol').status !== 'absent' && d.phase === 'seated', 'grace: 4 failures before the deadline, still invited');
  await until(() => S.leaves >= 1, 3000);
  ok(reg(d, 'Carol').status === 'absent', 'grace over: absent');
  close(d, S);
}
// 7 ── manual: nothing automatic, the organizer decides.
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => { if (id === 23) setTimeout(() => S.reject(23, false), 5); else setTimeout(() => S.sit(id), 10); } });
  const d = director(S, ['Alice', 'Bob', 'Carol'], { mode: 'manual' });
  d.start();
  await until(() => d.seated.size === 2, 2000);
  await wait(500);
  ok(S.count(23) === 1 && reg(d, 'Carol').status === 'declined-no' && d.phase === 'seated' && (reg(d, 'Carol').failures || 0) === 0, 'manual: a refusal stays, no new invitation, the table waits');
  d.command({ cmd: 'go', author: 'admin' });
  await until(() => S.leaves >= 1, 2000);
  ok(reg(d, 'Carol').status === 'absent' && S.leaves === 1, 'manual: « go » starts without her');
  close(d, S);
}
// 8 ── sits and leaves three times: absent (the server refuses a 7th join).
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => {
    if (id !== 23) return;
    setTimeout(() => { S.sit(23); setTimeout(() => S.stand(23), 20); }, 10);
  } });
  const d = director(S, ['Alice', 'Bob', 'Carol']);
  d.start();
  await until(() => reg(d, 'Carol') && reg(d, 'Carol').status === 'absent', 3000);
  ok(reg(d, 'Carol').status === 'absent' && entries(d, 'inviteFailed').filter((x) => x.nick === 'Carol' && x.reason === 'left').length === 3, 'left the table 3 times: absent');
  close(d, S);
}
// 9 ── an absent player who sits after all (his invitation was still valid): welcome back.
{
  let carolSits = false;
  const S = await scene({ lobbyIds: [21, 22, 23, 24], onInvite: (id, S) => { if (id === 21 || id === 22) setTimeout(() => S.sit(id), 10); } });
  const d = director(S, ['Alice', 'Bob', 'Carol', 'Dave'], { graceMs: 0, retryMs: 100 });
  d.start();
  await until(() => reg(d, 'Carol') && reg(d, 'Carol').status === 'absent' && reg(d, 'Dave').status === 'absent', 3000);
  ok(reg(d, 'Carol').status === 'absent', 'Carol absent (no answer)');
  // Hand-over already done (Alice + Bob): the director watches; Carol accepts an old invitation.
  await until(() => d.phase === 'watch' && d.joined, 2000);
  S.sit(23); carolSits = true;
  await until(() => reg(d, 'Carol').status !== 'absent', 2000);
  ok(carolSits && reg(d, 'Carol').status !== 'absent' && entries(d, 'absentBack').some((x) => x.nick === 'Carol'), 'she sits before the start after all: no longer absent');
  S.start([21, 22, 23]);
  await until(() => d.tracker.started, 2000);
  await wait(50);
  ok(d.absent.join() === 'Dave' && entries(d, 'markedAbsent').some((x) => x.nick === 'Dave'), 'at the start: only Dave absent');
  close(d, S);
}
// 10 ── « Bob » and « bob » are two players for the server.
{
  const S = await scene({ lobbyIds: [21, 26, 22], onInvite: (id, S) => setTimeout(() => S.sit(id), 10) });
  const d = director(S, ['Alice', 'Bob']);
  d.start();
  await until(() => S.leaves >= 1, 3000);
  ok(S.invites.indexOf(22) >= 0 && S.invites.indexOf(26) < 0, 'exact spelling first: « Bob » invited, « bob » not');
  close(d, S);
  const S2 = await scene({ lobbyIds: [21, 26], onInvite: (id, S) => setTimeout(() => S.sit(id), 10) });
  const d2 = director(S2, ['Alice', 'Bob']);
  d2.start();
  await until(() => S2.leaves >= 1, 3000);
  ok(S2.invites.indexOf(26) >= 0 && d2.seated.size === 2, 'only « bob » online: invited for « Bob » (registered with another case)');
  close(d2, S2);
}
// 11 ── ten registered: the director makes room at 8; the admin starts with 9 → the 10th absent at the start.
{
  const ids = [21, 22, 23, 24, 27, 28, 29, 30, 31, 32];
  const S = await scene({ lobbyIds: ids, onInvite: (id, S) => { if (id !== 32) setTimeout(() => S.sit(id), 5 + ids.indexOf(id) * 5); } });
  const d = director(S, ids.map((i) => NAMES[i]), { mode: 'manual' });
  d.start();
  await until(() => d.phase === 'watch' && d.joined, 3000);
  await until(() => S.seats.length === 9, 2000);
  S.start(S.seats.slice());
  await until(() => d.tracker.started, 2000);
  await wait(50);
  ok(entries(d, 'handover')[0].reason === 'makeRoom' && d.absent.join() === 'Jack' && entries(d, 'markedAbsent').some((x) => x.nick === 'Jack' && x.reason === 'notSeatedAtStart'), 'started before every player sat: the missing one absent at the start (so the result fits the tournament)');
  close(d, S);
}
// 12 ── the new admin leaves before the start: the next admin is asked to start too.
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => setTimeout(() => S.sit(id), 10) });
  const d = director(S, ['Alice', 'Bob', 'Carol']);
  d.start();
  await until(() => S.pm(21, /^you are the table admin now/), 3000);
  S.stand(21);
  S.newAdmin(22);
  await until(() => S.pm(22, /^you are the table admin now/), 2000);
  ok(S.pm(21, /^you are the table admin now/) && S.pm(22, /^you are the table admin now/), 'each new admin is asked to start');
  ok(S.count(21) >= 2, 'the admin who left is invited again');
  close(d, S);
}
// 13 ── after the hand-over, the admin lets a stranger in: the admin is asked to remove them; at the start, it is said.
{
  const S = await scene({ lobbyIds: [21, 22, 25], onInvite: (id, S) => setTimeout(() => S.sit(id), 10) });
  const d = director(S, ['Alice', 'Bob']);
  d.start();
  await until(() => d.phase === 'watch' && d.joined, 3000);
  S.sit(25);
  await until(() => S.pm(21, /^Mallory is not registered for this tournament: please remove them/), 2000);
  ok(S.pm(21, /^Mallory is not registered/) && S.pm(25, /^you are not registered for this tournament/), 'stranger seated after the hand-over: the admin asked to remove them, the stranger told');
  S.start([21, 22, 25]);
  await until(() => S.chats.some((c) => /^not registered for this tournament: Mallory/.test(c)), 2000);
  ok(S.chats.some((c) => /^not registered for this tournament: Mallory/.test(c)) && entries(d, 'seatCheck')[0].ok === false, 'started with a stranger: said in the table chat, the seat check fails (an organizer decides)');
  close(d, S);
}
// 14 ── closed by the organizer before the start: every player removed, told why; the table goes away.
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => { if (id !== 23) setTimeout(() => S.sit(id), 10); } });
  const d = director(S, ['Alice', 'Bob', 'Carol'], { mode: 'manual' });
  d.start();
  await until(() => d.seated.size === 2, 2000);
  d.stop(CLOSED_BY_ORGANIZER);
  await until(() => S.kicks.length === 2, 1000);
  ok(S.kicks.sort().join() === '21,22' && S.pm(21, /^the organizer closed this table/) && S.pm(22, /^the organizer closed this table/) && S.leaves === 1, 'closed before the start: players told and removed, then the director leaves');
  S.f.server.close();
}
// 15 ── fewer than two players left: nobody absent leaves the table alone; the organizer decides.
{
  const S = await scene({ lobbyIds: [21, 22, 23], onInvite: (id, S) => { if (id === 21) setTimeout(() => S.sit(21), 10); else setTimeout(() => S.reject(id, false), 5); } });
  const d = director(S, ['Alice', 'Bob', 'Carol']);
  d.start();
  await until(() => reg(d, 'Bob').status === 'absent' && reg(d, 'Carol').status === 'absent', 3000);
  await wait(100);
  ok(d.phase === 'seated' && S.leaves === 0, 'only one player left: no hand-over, the table waits for the organizer');
  close(d, S);
}

console.log(fails ? `\n${fails} FAILED` : '\nall td-scenarios tests passed');
process.exit(fails ? 1 : 0);
