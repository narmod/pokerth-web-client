// Scripted fake PokerTH server for the tournament director tests: real TCP,
// real 4-byte framing, real protobuf bundle. Shared by test-arena-spectator.mjs
// and test-arena-manager.mjs.
import net from 'node:net';
import * as pb from '../../../public/proto/pokerth-bundle.mjs';
import { frame } from '../../lib/spectator.mjs';

export const T = pb.PokerTHMessage.PokerTHMessageType;
export const GAME = 7;
export const gameInfo = {
  gameName: 'Friday SnG', netGameType: 1, maxNumPlayers: 4, raiseIntervalMode: 1, raiseEveryHands: 8,
  endRaiseMode: 1, proposedGuiSpeed: 4, delayBetweenHands: 6, playerActionTimeout: 20,
  firstSmallBlind: 10, startMoney: 1000, allowSpectators: true,
};
export const NAMES = { 11: 'Alice', 12: 'Bob', 13: 'Carol', 14: 'Dave' };

export function msg(type, field, value) {
  const Ctor = pb[field.charAt(0).toUpperCase() + field.slice(1)];
  return frame(pb.PokerTHMessage.encode(pb.PokerTHMessage.create({ messageType: T['Type_' + Ctor.name], [field]: Ctor.create(value) })).finish());
}
export const S = {
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
export function fakeServer(script) {
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

export function answerNames(conn) {
  conn.onMsg = (m) => {
    if (m.playerInfoRequestMessage) for (const id of m.playerInfoRequestMessage.playerId) if (NAMES[id]) conn.sock.write(S.info(id));
    if (conn.after) conn.after(m);
  };
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
