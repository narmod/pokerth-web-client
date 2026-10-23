#!/usr/bin/env node
// End-to-end test of the tournament director spectator client
// (server/tournament/spectator.mjs) against a scripted fake PokerTH server
// on localhost: real TCP, real framing, real protobuf bundle. Checks the
// login type, the spectator join, name requests, ResetTimeout, the ranking,
// the signature, the journal replay, and a reconnect in the middle of the
// game. Run: node scripts/test-td-spectator.mjs
import net from 'node:net';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pb from '../public/proto/pokerth-bundle.mjs';
import { SpectatorDirector, frame, replayJournal, buildIdFor } from '../server/tournament/spectator.mjs';
import { generateKeys, verifyJournal, verifyPayload, canonical } from '../server/tournament/journal.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

const T = pb.PokerTHMessage.PokerTHMessageType;
const GAME = 7;
const gameInfo = {
  gameName: 'Friday SnG', netGameType: 1, maxNumPlayers: 4, raiseIntervalMode: 1, raiseEveryHands: 8,
  endRaiseMode: 1, proposedGuiSpeed: 4, delayBetweenHands: 6, playerActionTimeout: 20,
  firstSmallBlind: 10, startMoney: 1000, allowSpectators: true,
};
const NAMES = { 11: 'Alice', 12: 'Bob', 13: 'Carol', 14: 'Dave' };

function msg(type, field, value) {
  const Ctor = pb[field.charAt(0).toUpperCase() + field.slice(1)];
  return frame(pb.PokerTHMessage.encode(pb.PokerTHMessage.create({ messageType: T['Type_' + Ctor.name], [field]: Ctor.create(value) })).finish());
}
const S = {
  announce: () => msg(0, 'announceMessage', { protocolVersion: { majorVersion: 5, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 }, latestBetaRevision: 0, serverType: 0, numPlayersOnServer: 5 }),
  initAck: () => msg(0, 'initAckMessage', { yourSessionId: Buffer.alloc(16, 1), yourPlayerId: 99 }),
  gameList: () => msg(0, 'gameListNewMessage', { gameId: GAME, gameMode: 1, isPrivate: false, playerIds: [11, 12, 13, 14], adminPlayerId: 11, gameInfo }),
  otherGame: () => msg(0, 'gameListNewMessage', { gameId: 3, gameMode: 1, isPrivate: false, adminPlayerId: 5, gameInfo: Object.assign({}, gameInfo, { gameName: 'Other' }) }),
  joinAck: () => msg(0, 'joinGameAckMessage', { gameId: GAME, areYouGameAdmin: false, gameInfo, spectateOnly: true }),
  start: () => msg(0, 'gameStartInitialMessage', { gameId: GAME, startDealerPlayerId: 11, playerSeats: [11, 12, 13, 14] }),
  rejoin: (handNum, cash) => msg(0, 'gameStartRejoinMessage', { gameId: GAME, startDealerPlayerId: 11, handNum, rejoinPlayerData: cash.map(([playerId, playerMoney]) => ({ playerId, playerMoney })) }),
  hand: (seatStates) => msg(0, 'handStartMessage', { gameId: GAME, smallBlind: 10, seatStates }),
  act: (playerId, playerMoney) => msg(0, 'playersActionDoneMessage', { gameId: GAME, playerId, gameState: 0, playerAction: 6, totalPlayerBet: 0, playerMoney, highestSet: 0, minimumRaise: 0 }),
  show: (res) => msg(0, 'endOfHandShowCardsMessage', { gameId: GAME, playerResults: res.map(([playerId, playerMoney]) => ({ playerId, resultCard1: 0, resultCard2: 1, moneyWon: 0, playerMoney })) }),
  hide: (playerId, playerMoney) => msg(0, 'endOfHandHideCardsMessage', { gameId: GAME, playerId, moneyWon: 100, playerMoney }),
  info: (playerId) => msg(0, 'playerInfoReplyMessage', { playerId, playerInfoData: { playerName: NAMES[playerId], isHuman: true, playerRights: 1 } }),
  warn: () => msg(0, 'timeoutWarningMessage', { timeoutReason: 1, remainingSeconds: 60 }),
  end: (winnerPlayerId) => msg(0, 'endOfGameMessage', { gameId: GAME, winnerPlayerId }),
};

// A scripted server. `script(conn, n)` drives connection n (0, 1, …).
function fakeServer(script) {
  const seen = [];
  const server = net.createServer((sock) => {
    const n = seen.length;
    const conn = { sock, got: [], n };
    seen.push(conn);
    let rx = Buffer.alloc(0);
    sock.on('data', (c) => {
      rx = Buffer.concat([rx, c]);
      while (rx.length >= 4 && rx.length >= 4 + rx.readUInt32BE(0)) {
        const len = rx.readUInt32BE(0);
        const m = pb.PokerTHMessage.decode(rx.subarray(4, 4 + len));
        rx = rx.subarray(4 + len);
        conn.got.push(m);
        if (conn.onMsg) conn.onMsg(m);
      }
    });
    sock.on('error', () => {});
    script(conn, n);
  });
  return new Promise((res) => server.listen(0, '127.0.0.1', () => res({ server, port: server.address().port, seen })));
}

function answerNames(conn) {
  conn.onMsg = (m) => {
    if (m.playerInfoRequestMessage) for (const id of m.playerInfoRequestMessage.playerId) if (NAMES[id]) conn.sock.write(S.info(id));
    if (conn.after) conn.after(m);
  };
}

function runDirector(port, extra) {
  return new Promise((resolve) => {
    const d = new SpectatorDirector(Object.assign({ host: '127.0.0.1', port, nick: 'TD-test-T1', reconnectDelayMs: 50, version: '2.1.10-web.291' }, extra));
    const timer = setTimeout(() => { d.stop('timeout'); resolve({ d, timeout: true }); }, 5000);
    d.on('result', (sealed, journal) => { clearTimeout(timer); resolve({ d, sealed, journal }); });
    d.on('failed', (code, data) => { clearTimeout(timer); resolve({ d, failed: code, data }); });
    d.start();
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. full game, joined by name, signed ───────────────────────────
{
  const keys = generateKeys();
  const { server, port, seen } = await fakeServer((conn) => {
    answerNames(conn);
    conn.sock.write(S.announce());
    conn.after = async (m) => {
      if (m.initMessage) { conn.sock.write(Buffer.concat([S.initAck(), S.otherGame(), S.gameList()])); }
      if (m.joinExistingGameMessage) {
        conn.sock.write(S.joinAck());
        await wait(20);
        conn.sock.write(Buffer.concat([S.start(), S.hand([0, 0, 0, 0]), S.act(14, 0), S.act(12, 600), S.act(13, 400), S.show([[11, 2000], [14, 0]])]));
        await wait(20);
        conn.sock.write(S.warn());
        await wait(20);
        conn.sock.write(Buffer.concat([S.hand([0, 0, 0, 2]), S.act(12, 0), S.act(13, 0), S.hide(11, 4000), S.end(11)]));
      }
    };
  });
  const r = await runDirector(port, { gameName: 'Friday SnG', privateKeyPem: keys.privateKeyPem });
  const got = seen[0].got;
  const init = got.find((m) => m.initMessage);
  ok(!r.timeout && !r.failed, 'full game: director finished');
  ok(init && init.initMessage.login === pb.InitMessage.LoginType.unauthenticatedLogin && init.initMessage.nickName === 'TD-test-T1', 'logs in unauthenticated with its TD name');
  ok(init && init.initMessage.buildId === buildIdFor('2.1.10-web.291') && (init.initMessage.buildId >>> 24) === 3, 'announces itself as a web client (type 0x03)');
  const join = got.find((m) => m.joinExistingGameMessage);
  ok(join && join.joinExistingGameMessage.gameId === GAME && join.joinExistingGameMessage.spectateOnly === true, 'joins the named table as spectator only (not the other table)');
  ok(got.some((m) => m.resetTimeoutMessage), 'answers TimeoutWarning with ResetTimeout');
  ok(!got.some((m) => m.myActionRequestMessage || m.startEventAckMessage || m.chatRequestMessage), 'never acts, acks a start or chats');
  ok(got.some((m) => m.playerInfoRequestMessage), 'asks the server for player names');
  if (r.sealed) {
    const res = r.sealed.payload.result;
    ok(res.ranking.map((x) => x.name).join(',') === 'Alice,Bob,Carol,Dave', 'ranking Alice > Bob > Carol > Dave');
    ok(res.status === 'complete' && res.hands === 2, 'complete, 2 hands');
    ok(verifyPayload(r.sealed.payload, r.sealed.signature, r.sealed.publicKeyPem), 'signature verifies');
    const chain = verifyJournal(r.journal.entries);
    ok(chain.ok && chain.head === r.sealed.payload.head, 'journal chain verifies and matches the signed head');
    ok(canonical(replayJournal(r.journal.entries)) === canonical(res), 'replaying the journal gives the same result');
  }
  server.close();
}

// ── 2. reconnect mid-game without missing a hand ───────────────────
{
  const { server, port, seen } = await fakeServer((conn, n) => {
    answerNames(conn);
    conn.sock.write(S.announce());
    conn.after = async (m) => {
      if (m.initMessage) conn.sock.write(S.initAck());
      if (!m.joinExistingGameMessage) return;
      conn.sock.write(S.joinAck());
      await wait(20);
      if (n === 0) {
        conn.sock.write(Buffer.concat([S.start(), S.hand([0, 0, 0, 0]), S.act(14, 0), S.act(12, 600), S.act(13, 400), S.show([[11, 2000], [14, 0]])]));
        await wait(30);
        conn.sock.destroy();
      } else {
        conn.sock.write(Buffer.concat([S.rejoin(1, [[11, 2000], [12, 600], [13, 400], [14, 0]]), S.hand([0, 0, 0, 2]), S.act(12, 0), S.act(13, 0), S.hide(11, 4000), S.end(11)]));
      }
    };
  });
  const r = await runDirector(port, { gameId: GAME });
  ok(seen.length === 2, 'reconnect: a second connection was made');
  ok(seen[1] && seen[1].got.some((m) => m.joinExistingGameMessage && m.joinExistingGameMessage.gameId === GAME && m.joinExistingGameMessage.spectateOnly), 'reconnect: rejoins the same table as spectator');
  if (r.sealed) {
    const res = r.sealed.payload.result;
    ok(res.status === 'complete' && res.gaps.length === 0, 'reconnect: no hand missed → complete');
    ok(res.ranking.map((x) => x.id).join(',') === '11,12,13,14', 'reconnect: same ranking');
    ok(r.journal.entries.some((e) => e.type === 'game' && e.data.type === 'disconnected'), 'reconnect: the drop is in the journal');
    ok(r.sealed.signature === null, 'no key → unsigned result');
  } else ok(false, 'reconnect: result produced');
  server.close();
}

// ── 3. join refused ────────────────────────────────────────────────
{
  const { server, port } = await fakeServer((conn) => {
    conn.sock.write(S.announce());
    conn.onMsg = (m) => {
      if (m.initMessage) conn.sock.write(S.initAck());
      if (m.joinExistingGameMessage) conn.sock.write(msg(0, 'joinGameFailedMessage', { gameId: GAME, joinGameFailureReason: 12 }));
    };
  });
  const r = await runDirector(port, { gameId: GAME });
  ok(r.failed === 'joinFailed' && r.data.reason === 'noSpectatorsAllowed', 'join refused: reported with the server reason');
  ok(r.d.journal.entries.some((e) => e.type === 'error'), 'join refused: recorded in the journal');
  server.close();
}

// ── 4. names arriving only after the end of the game ──────────────
{
  const { server, port } = await fakeServer((conn) => {
    let ended = false;
    conn.sock.write(S.announce());
    conn.onMsg = async (m) => {
      if (m.initMessage) conn.sock.write(S.initAck());
      if (m.playerInfoRequestMessage && ended) {
        await wait(30);
        for (const id of m.playerInfoRequestMessage.playerId) if (NAMES[id]) conn.sock.write(S.info(id));
      }
      if (m.joinExistingGameMessage) {
        conn.sock.write(S.joinAck());
        await wait(20);
        conn.sock.write(Buffer.concat([S.start(), S.hand([0, 0, 0, 0]), S.act(14, 0), S.act(12, 0), S.act(13, 0), S.hide(11, 4000)]));
        await wait(20);
        ended = true;
        conn.sock.write(S.end(11));
      }
    };
  });
  const r = await runDirector(port, { gameId: GAME, nameWaitMs: 1000 });
  ok(r.sealed && r.sealed.payload.result.ranking.every((x) => x.name), 'late names: asked again after the end and sealed with every name');
  server.close();
}

// ── 5. command line: watch, write files, then --verify ────────────
{
  const cli = join(dirname(fileURLToPath(import.meta.url)), 'td-spectate.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'td-'));
  const run = (argv) => new Promise((res) => {
    const p = spawn(process.execPath, [cli, ...argv], { cwd: dir });
    let out = '', err = '';
    p.stdout.on('data', (c) => { out += c; });
    p.stderr.on('data', (c) => { err += c; });
    p.on('close', (code) => res({ code, out, err }));
  });
  const { server, port } = await fakeServer((conn) => {
    answerNames(conn);
    conn.sock.write(S.announce());
    conn.after = async (m) => {
      if (m.initMessage) conn.sock.write(Buffer.concat([S.initAck(), S.gameList()]));
      if (m.joinExistingGameMessage) {
        conn.sock.write(S.joinAck());
        await wait(20);
        conn.sock.write(Buffer.concat([S.start(), S.hand([0, 0, 0, 0]), S.act(14, 0), S.act(12, 0), S.act(13, 0), S.hide(11, 4000), S.end(11)]));
      }
    };
  });
  const w = await run(['--host', '127.0.0.1', '--port', String(port), '--nick', 'TD-cli-T1', '--game-name', 'Friday SnG', '--out', 'cli']);
  ok(w.code === 0, 'cli: exits 0 after the game');
  ok(existsSync(join(dir, 'td-key.pem')) && (statSync(join(dir, 'td-key.pem')).mode & 0o077) === 0, 'cli: install key created, private (600)');
  ok(existsSync(join(dir, 'cli.journal.json')) && existsSync(join(dir, 'cli.result.json')), 'cli: journal and result written');
  const v1 = await run(['--verify', 'cli.result.json', 'cli.journal.json']);
  ok(v1.code === 0 && JSON.parse(v1.out).ok === true, 'cli --verify: genuine files pass');
  const jr = JSON.parse(readFileSync(join(dir, 'cli.journal.json'), 'utf8'));
  const g = jr.entries.find((e) => e.type === 'game' && e.data.type === 'money');
  g.data.money += 1;
  writeFileSync(join(dir, 'cli.journal.json'), JSON.stringify(jr));
  const v2 = await run(['--verify', 'cli.result.json', 'cli.journal.json']);
  ok(v2.code === 1 && JSON.parse(v2.out).checks.chain === false, 'cli --verify: tampered journal fails');
  const h = await run(['--help']);
  ok(h.code === 0 && /td-spectate\.mjs --host/.test(h.out), 'cli --help prints usage');
  server.close();
  rmSync(dir, { recursive: true, force: true });
}

console.log(fails ? `\n${fails} FAILED` : '\nall td-spectator tests passed');
process.exit(fails ? 1 : 0);
