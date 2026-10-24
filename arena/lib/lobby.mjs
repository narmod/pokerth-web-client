// ═══════════════════════════════════════════════════════════════════
// Tournament director — read a server's lobby: its type and its tables.
//
// Guest login (like the proxy's lobby probe behind « Check »), then collect
// GameListNew / GameListUpdate / player and spectator joins until the lobby
// has been quiet for a moment. Read-only: never joins a game. Used by the
// « Table check » view of /arena to list what can be watched.
// ═══════════════════════════════════════════════════════════════════

import net from 'node:net';
import tls from 'node:tls';
import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { build, frame, spkiPin, buildIdFor } from './spectator.mjs';

const LOGIN = pb.InitMessage.LoginType;
const SERVER_TYPES = ['lan', 'internetNoAuth', 'internetAuth'];
const GAME_MODES = { 1: 'created', 2: 'started', 3: 'closed' };
const GAME_TYPES = { 1: 'normal', 2: 'registeredOnly', 3: 'inviteOnly', 4: 'ranking' };

/**
 * @param {object} o  host, port, tls, servername, insecure, pins, version, timeoutMs, quietMs, connect (tests)
 * @returns {Promise<{ok:boolean, serverType?:string, players?:number, games?:object[], error?:string}>}
 */
export function listGames(o) {
  return new Promise((resolve) => {
    let sock, rx = Buffer.alloc(0), done = false, quiet = null, serverType = null, players = null, gotAck = false;
    const games = new Map();
    const overall = setTimeout(() => finish(gotAck ? '' : 'timeout'), o.timeoutMs || 8000);
    function settle() { if (quiet) clearTimeout(quiet); quiet = setTimeout(() => finish(''), o.quietMs || 800); }
    function finish(error) {
      if (done) return;
      done = true;
      clearTimeout(overall); if (quiet) clearTimeout(quiet);
      try { sock && sock.destroy(); } catch (e) {}
      const list = [...games.values()].filter((g) => g.mode !== 'closed').map((g) => Object.assign({}, g, {
        players: g.playerIds.size, spectators: g.spectatorIds.size, playerIds: undefined, spectatorIds: undefined,
      }));
      list.sort((a, b) => (a.mode === b.mode ? a.name.localeCompare(b.name) : a.mode === 'started' ? -1 : 1));
      if (error && !gotAck) return resolve({ ok: false, error, serverType, players });
      resolve({ ok: true, serverType, players, games: list, error: error || '' });
    }
    function onMsg(m) {
      if (m.announceMessage) {
        const a = m.announceMessage, v = a.protocolVersion || {};
        serverType = SERVER_TYPES[a.serverType] || String(a.serverType);
        players = Number(a.numPlayersOnServer);
        const nick = 'Guest' + Math.floor(Math.random() * 900000 + 100000);
        sock.write(frame(build.init({ major: v.majorVersion, minor: v.minorVersion, nick, login: LOGIN.guestLogin, buildId: buildIdFor(o.version) })));
      } else if (m.initAckMessage) { gotAck = true; settle(); }
      else if (m.gameListNewMessage) {
        const g = m.gameListNewMessage, gi = g.gameInfo || {};
        games.set(Number(g.gameId), {
          gameId: Number(g.gameId), name: String(gi.gameName || ''), mode: GAME_MODES[g.gameMode] || String(g.gameMode),
          isPrivate: !!g.isPrivate, gameType: GAME_TYPES[gi.netGameType] || String(gi.netGameType),
          maxPlayers: Number(gi.maxNumPlayers), startMoney: Number(gi.startMoney),
          allowSpectators: gi.allowSpectators !== false,
          playerIds: new Set((g.playerIds || []).map(Number)), spectatorIds: new Set((g.spectatorIds || []).map(Number)),
        });
        settle();
      } else if (m.gameListUpdateMessage) {
        const g = games.get(Number(m.gameListUpdateMessage.gameId));
        if (g) g.mode = GAME_MODES[m.gameListUpdateMessage.gameMode] || g.mode;
        settle();
      } else if (m.gameListPlayerJoinedMessage) {
        const g = games.get(Number(m.gameListPlayerJoinedMessage.gameId)); if (g) g.playerIds.add(Number(m.gameListPlayerJoinedMessage.playerId));
      } else if (m.gameListPlayerLeftMessage) {
        const g = games.get(Number(m.gameListPlayerLeftMessage.gameId)); if (g) g.playerIds.delete(Number(m.gameListPlayerLeftMessage.playerId));
      } else if (m.gameListSpectatorJoinedMessage) {
        const g = games.get(Number(m.gameListSpectatorJoinedMessage.gameId)); if (g) g.spectatorIds.add(Number(m.gameListSpectatorJoinedMessage.playerId));
      } else if (m.gameListSpectatorLeftMessage) {
        const g = games.get(Number(m.gameListSpectatorLeftMessage.gameId)); if (g) g.spectatorIds.delete(Number(m.gameListSpectatorLeftMessage.playerId));
      } else if (m.errorMessage) {
        const r = m.errorMessage.errorReason;
        finish('login refused (' + (pb.ErrorMessage.ErrorReason[r] || r) + ')');
      }
    }
    try {
      const opts = { host: o.host, port: o.port };
      const pins = o.pins || [];
      if (o.connect) sock = o.connect(opts);
      else if (o.tls) {
        sock = tls.connect(Object.assign({}, opts, {
          servername: o.servername || (/^[0-9.:]+$/.test(o.host) ? undefined : o.host),
          rejectUnauthorized: pins.length ? false : !o.insecure,
        }), () => { if (pins.length && pins.indexOf(spkiPin(sock)) < 0) finish('tls pin mismatch'); });
      } else sock = net.connect(opts);
      sock.setTimeout(o.timeoutMs || 8000);
      sock.on('data', (c) => {
        rx = Buffer.concat([rx, c]);
        while (rx.length >= 4) {
          const len = rx.readUInt32BE(0);
          if (len > 2000000) return finish('frame too big');
          if (rx.length < 4 + len) break;
          const body = rx.subarray(4, 4 + len); rx = rx.subarray(4 + len);
          let m; try { m = pb.PokerTHMessage.decode(body); } catch (e) { continue; }
          onMsg(m);
        }
      });
      sock.on('timeout', () => finish(gotAck ? '' : 'timeout'));
      sock.on('error', (e) => finish((e && e.code) || 'error'));
      sock.on('close', () => finish(gotAck ? '' : 'connection closed'));
    } catch (e) { finish((e && e.code) || 'error'); }
  });
}
