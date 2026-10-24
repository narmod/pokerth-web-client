// ═══════════════════════════════════════════════════════════════════
// Tournament director — spectator client (prototype, 2026-10-23).
//
// Connects to a PokerTH server, logs in, joins ONE table as a spectator
// (JoinExistingGame spectateOnly) and turns what the server sends into
// normalized events. Every event goes, in this order, into the sealed
// journal and into the game tracker; replaying the journal through a fresh
// tracker therefore gives back the same ranking (tournament/test/test-td-*.mjs).
//
// The director never sits at the table and never acts: it only reads.
// Wire framing as the web client and the proxy's lobby probe: 4-byte
// big-endian length + protobuf PokerTHMessage (public/proto/ bundle).
//
// Spectator facts relied on (pokerth/pokerth@stable):
//   - StartEvent is sent to seated players only; a spectator acks nothing.
//   - A spectator joining a running game gets GameStartRejoin at the next
//     hand, with every seat's cash (resynchronisation after a reconnect).
//   - The in-game inactivity timer warns with TimeoutWarning; answering
//     ResetTimeout keeps the session.
// Design: docs/TOURNAMENT_DIRECTOR.md (How a table is run, Trust).
// ═══════════════════════════════════════════════════════════════════

import { EventEmitter } from 'node:events';
import net from 'node:net';
import tls from 'node:tls';
import { createHash } from 'node:crypto';
import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { Journal, signPayload, publicKeyFromPrivate, JOURNAL_VERSION } from './journal.mjs';
import { GameTracker } from './tracker.mjs';

const T = pb.PokerTHMessage.PokerTHMessageType;
const LOGIN = pb.InitMessage.LoginType;
const MAX_FRAME = 2000000;
const CLIENT_TYPE_WEB = 0x03;

export function buildIdFor(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(version || ''));
  const M = m ? +m[1] : 2, N = m ? +m[2] : 1, P = m ? +m[3] : 10;
  return ((CLIENT_TYPE_WEB << 24) | (M << 16) | (N << 8) | P) >>> 0;
}

export function frame(payload) {
  const body = Buffer.from(payload);
  const hdr = Buffer.alloc(4);
  hdr.writeUInt32BE(body.length, 0);
  return Buffer.concat([hdr, body]);
}

function encode(messageType, field, value) {
  return pb.PokerTHMessage.encode(pb.PokerTHMessage.create({ messageType, [field]: value })).finish();
}

// { b64 | bytes, type? } → { bytes, type (1 PNG, 2 JPEG, 3 GIF), md5 } or null.
export function avatarOf(a) {
  if (!a) return null;
  let bytes = a.bytes ? Buffer.from(a.bytes) : a.b64 ? Buffer.from(String(a.b64), 'base64') : null;
  if (!bytes || bytes.length < 32 || bytes.length > 30720) return null;
  const type = bytes[0] === 0x89 && bytes[1] === 0x50 ? 1 : bytes[0] === 0xff && bytes[1] === 0xd8 ? 2 : bytes.subarray(0, 3).toString('latin1') === 'GIF' ? 3 : 0;
  if (!type) return null;
  return { bytes, type, md5: createHash('md5').update(bytes).digest() };
}

export const build = {
  init({ major, minor, nick, login, password, serverPassword, buildId, avatarHash }) {
    const init = { requestedVersion: { majorVersion: major, minorVersion: minor }, buildId, login, nickName: nick };
    if (avatarHash && login !== LOGIN.guestLogin) init.avatarHash = avatarHash;
    if (serverPassword) init.authServerPassword = serverPassword;
    if (login === LOGIN.authenticatedLogin && password) init.clientUserData = Buffer.from(password, 'utf8').subarray(0, 256);
    return encode(T.Type_InitMessage, 'initMessage', pb.InitMessage.create(init));
  },
  // The director's avatar, when the server asks for it (it knows it by its
  // MD5 from the Init): header, 256-byte blocks, end — as every client does.
  avatarUpload(requestId, avatar) {
    const out = [encode(T.Type_AvatarHeaderMessage, 'avatarHeaderMessage', pb.AvatarHeaderMessage.create({ requestId, avatarType: avatar.type, avatarSize: avatar.bytes.length }))];
    for (let o = 0; o < avatar.bytes.length; o += 256) {
      out.push(encode(T.Type_AvatarDataMessage, 'avatarDataMessage', pb.AvatarDataMessage.create({ requestId, avatarBlock: avatar.bytes.subarray(o, Math.min(o + 256, avatar.bytes.length)) })));
    }
    out.push(encode(T.Type_AvatarEndMessage, 'avatarEndMessage', pb.AvatarEndMessage.create({ requestId })));
    return out;
  },
  unknownAvatar(requestId) {
    return encode(T.Type_UnknownAvatarMessage, 'unknownAvatarMessage', pb.UnknownAvatarMessage.create({ requestId }));
  },
  joinSpectator(gameId, password) {
    const j = { gameId, spectateOnly: true };
    if (password) j.password = password;
    return encode(T.Type_JoinExistingGameMessage, 'joinExistingGameMessage', pb.JoinExistingGameMessage.create(j));
  },
  playerInfo(ids) {
    return encode(T.Type_PlayerInfoRequestMessage, 'playerInfoRequestMessage', pb.PlayerInfoRequestMessage.create({ playerId: ids }));
  },
  resetTimeout() {
    return encode(T.Type_ResetTimeoutMessage, 'resetTimeoutMessage', pb.ResetTimeoutMessage.create({}));
  },
  leave(gameId) {
    return encode(T.Type_LeaveGameRequestMessage, 'leaveGameRequestMessage', pb.LeaveGameRequestMessage.create({ gameId }));
  },
};

export function spkiPin(sock) {
  const pc = sock.getPeerCertificate();
  const der = pc && pc.pubkey;
  return der && der.length ? createHash('sha256').update(der).digest('base64') : '';
}

const n = (v) => (v == null ? v : Number(v));

export class SpectatorDirector extends EventEmitter {
  /**
   * @param {object} o
   * @param {string} o.host
   * @param {number} o.port
   * @param {boolean} [o.tls]
   * @param {string} [o.servername]        SNI
   * @param {boolean} [o.insecure]         accept any certificate (tests, LAN self-signed)
   * @param {string[]} [o.pins]            SPKI SHA-256 pins (base64); a pin replaces CA trust
   * @param {string} o.nick                director name, e.g. "TD-cup-T1"
   * @param {'unauth'|'guest'|'auth'} [o.login]  default 'unauth' (LAN / no-auth servers)
   * @param {string} [o.password]          account password ('auth')
   * @param {string} [o.serverPassword]    ServerPassword of the server (consent mode B)
   * @param {number} [o.gameId]            table to watch...
   * @param {string} [o.gameName]          ...or its exact name (first match in the game list)
   * @param {string} [o.gamePassword]
   * @param {string} [o.privateKeyPem]     install key; without it the result is unsigned
   * @param {string} [o.version]           web client version (build id)
   * @param {boolean} [o.refuseAuthServer] stop if the server announces authenticated logins (the manager always sets it)
   * @param {number} [o.reconnects]        attempts after a drop (default 5)
   * @param {number} [o.reconnectDelayMs]  first delay, doubled each time (default 2000)
   * @param {number} [o.rateLimitDelayMs]  wait after a login refused as rate-limited (default 31000)
   * @param {() => number} [o.now]
   * @param {(o: object) => import('node:net').Socket} [o.connect]  socket factory (tests)
   */
  constructor(o) {
    super();
    this.o = Object.assign({ login: 'unauth', reconnects: 5, reconnectDelayMs: 2000 }, o);
    this.now = this.o.now || (() => Date.now());
    this.journal = new Journal({ now: this.now });
    this.tracker = new GameTracker();
    // Its avatar (PNG/JPEG/GIF, 32 B to 30 KB like the server checks), sent
    // when the server asks for it: the director stands out in the lobby.
    this.avatar = avatarOf(this.o.avatar);
    this.gameId = this.o.gameId != null ? Number(this.o.gameId) : null;
    this.myId = null;
    this.sock = null;
    this.rx = Buffer.alloc(0);
    this.done = false;
    this.attempt = 0;
    this.joined = false;
    this.askedNames = new Set();
  }

  // ── lifecycle ────────────────────────────────────────────────────

  start() {
    this._record('directorStart', { host: this.o.host, port: this.o.port, nick: this.o.nick, gameId: this.gameId, gameName: this.o.gameName || null });
    this._connect();
    return this;
  }

  stop(reason) {
    if (this.done) return;
    this.done = true;
    if (this._timer) clearTimeout(this._timer);
    if (this._namesTimer) clearTimeout(this._namesTimer);
    try { if (this.sock && this.gameId != null && this.joined) this.sock.write(frame(build.leave(this.gameId))); } catch (e) {}
    try { if (this.sock) this.sock.end(); } catch (e) {}
    this.emit('stopped', reason || '');
  }

  _connect() {
    this.rx = Buffer.alloc(0);
    this.joined = false;
    const o = this.o;
    const opts = { host: o.host, port: o.port };
    let sock;
    if (o.connect) sock = o.connect(opts);
    else if (o.tls) {
      const pins = o.pins || [];
      sock = tls.connect(Object.assign({}, opts, {
        servername: o.servername || (/^[0-9.:]+$/.test(o.host) ? undefined : o.host),
        rejectUnauthorized: pins.length ? false : !o.insecure,
      }), () => {
        if (pins.length && pins.indexOf(spkiPin(sock)) < 0) {
          this._fail('tlsPinMismatch', { pin: spkiPin(sock) });
        }
      });
    } else sock = net.connect(opts);
    this.sock = sock;
    sock.on('data', (c) => this._feed(c));
    sock.on('error', (e) => this.emit('log', 'socket error: ' + ((e && e.code) || (e && e.message) || e)));
    sock.on('close', () => this._onClose());
  }

  _onClose() {
    if (this.done) return;
    if (this.tracker.finished) return this.stop('finished');
    // A drop only matters to the ranking once the game is being followed.
    if (this.tracker.started) this._emitEvent({ type: 'disconnected' });
    const limited = this._rateLimited;
    this._rateLimited = false;
    if (this.attempt >= this.o.reconnects) return this._fail(limited ? 'rateLimited' : 'gaveUp', { attempts: this.attempt });
    let delay = this.o.reconnectDelayMs * Math.pow(2, this.attempt);
    // The server's login limit (ServerBruteForceProtection) refills one login
    // every 30 s per address: wait at least that long before trying again.
    if (limited) delay = Math.max(delay, this.o.rateLimitDelayMs != null ? this.o.rateLimitDelayMs : 31000);
    this.attempt += 1;
    this.emit('log', (limited ? 'login refused for now (too many logins from this address), retry ' : 'connection lost, retry ') + this.attempt + ' in ' + Math.round(delay / 1000) + ' s');
    this._timer = setTimeout(() => { if (!this.done) this._connect(); }, delay);
  }

  _fail(code, data) {
    this._record('error', Object.assign({ code }, data || {}));
    this.emit('failed', code, data || {});
    this.stop(code);
  }

  _send(payload) {
    try { this.sock.write(frame(payload)); } catch (e) { this.emit('log', 'send failed: ' + e.message); }
  }

  _feed(chunk) {
    this.rx = Buffer.concat([this.rx, chunk]);
    while (this.rx.length >= 4) {
      const len = this.rx.readUInt32BE(0);
      if (len > MAX_FRAME) return this._fail('frameTooBig', { len });
      if (this.rx.length < 4 + len) break;
      const body = this.rx.subarray(4, 4 + len);
      this.rx = this.rx.subarray(4 + len);
      let msg;
      try { msg = pb.PokerTHMessage.decode(body); } catch (e) { this.emit('log', 'undecodable frame'); continue; }
      try { this._onMessage(msg); } catch (e) { this.emit('log', 'handler error: ' + e.message); }
    }
  }

  // ── journal + tracker ────────────────────────────────────────────

  // Director bookkeeping (not a game fact): journaled, not fed to the tracker.
  _record(type, data) {
    return this.journal.append(type, data);
  }

  // A game fact: journaled AND applied, so the journal replays the ranking.
  _emitEvent(ev) {
    this.journal.append('game', ev);
    this.tracker.apply(ev);
    this.emit('event', ev);
  }

  // One « handLog » event per hand, at its end: the actions and who won,
  // with or without a showdown. The tracker ignores it (the ranking does not
  // depend on it); the collusion check reads it from the journal.
  _handLog(showdown, winners) {
    if (!this._hand) return;
    const h = this._hand;
    this._hand = null;
    this._emitEvent({ type: 'handLog', hand: this.tracker.hand, actions: h.actions, winners, showdown: !!showdown });
  }

  _askNames(ids) {
    const want = (ids || []).map(Number).filter((id) => id && !this.askedNames.has(id) && id !== this.myId);
    if (!want.length) return;
    want.forEach((id) => this.askedNames.add(id));
    this._send(build.playerInfo(want));
  }

  // ── protocol ─────────────────────────────────────────────────────

  _onMessage(m) {
    if (m.avatarRequestMessage) {
      const q = m.avatarRequestMessage;
      const want = q.avatarHash ? Buffer.from(q.avatarHash) : null;
      if (this.avatar && want && want.equals(this.avatar.md5)) { for (const f of build.avatarUpload(n(q.requestId), this.avatar)) this._send(f); this._record('avatarSent', { size: this.avatar.bytes.length }); }
      else this._send(build.unknownAvatar(n(q.requestId)));
      return;
    }
    if (m.announceMessage) {
      const v = m.announceMessage.protocolVersion || {};
      // LAN only for now: a server with accounts (pokerth.net) is refused.
      if (this.o.refuseAuthServer && m.announceMessage.serverType === pb.AnnounceMessage.ServerType.serverTypeInternetAuth) {
        return this._fail('authServerRefused', {});
      }
      const login = this.o.login === 'auth' ? LOGIN.authenticatedLogin : this.o.login === 'guest' ? LOGIN.guestLogin : LOGIN.unauthenticatedLogin;
      this._send(build.init({
        major: v.majorVersion, minor: v.minorVersion, nick: this.o.nick, login,
        password: this.o.password, serverPassword: this.o.serverPassword, buildId: buildIdFor(this.o.version),
        avatarHash: this.avatar ? this.avatar.md5 : null,
      }));
    } else if (m.initAckMessage) {
      this.myId = n(m.initAckMessage.yourPlayerId);
      this.attempt = 0;
      this._record('loggedIn', { playerId: this.myId });
      if (this.gameId != null) this._join();
    } else if (m.gameListNewMessage) {
      const g = m.gameListNewMessage;
      const name = g.gameInfo && g.gameInfo.gameName;
      if (this.gameId == null && this.o.gameName && name === this.o.gameName && g.gameMode !== pb.NetGameMode.netGameClosed) {
        this.gameId = n(g.gameId);
        this._record('gameFound', { gameId: this.gameId, gameName: name });
        this._join();
      }
    } else if (m.joinGameAckMessage) {
      const a = m.joinGameAckMessage, gi = a.gameInfo || {};
      this.joined = true;
      this._record('joined', { gameId: n(a.gameId), spectateOnly: !!a.spectateOnly });
      this._emitEvent({ type: 'gameInfo', gameId: n(a.gameId), name: gi.gameName || '', startMoney: n(gi.startMoney), maxPlayers: n(gi.maxNumPlayers) });
    } else if (m.joinGameFailedMessage) {
      const reason = m.joinGameFailedMessage.joinGameFailureReason;
      this._fail('joinFailed', { reason: pb.JoinGameFailedMessage.JoinGameFailureReason[reason] || reason });
    } else if (m.gamePlayerJoinedMessage) {
      this._askNames([m.gamePlayerJoinedMessage.playerId]);
    } else if (m.gameStartInitialMessage) {
      const s = m.gameStartInitialMessage;
      const seats = (s.playerSeats || []).map(Number);
      this._emitEvent({ type: 'gameStart', dealer: n(s.startDealerPlayerId), seats });
      this._askNames(seats);
    } else if (m.gameStartRejoinMessage) {
      const r = m.gameStartRejoinMessage;
      const players = (r.rejoinPlayerData || []).map((p) => ({ id: n(p.playerId), money: n(p.playerMoney) }));
      this._emitEvent({ type: 'rejoin', handNum: n(r.handNum), players });
      this._askNames(players.map((p) => p.id));
    } else if (m.handStartMessage) {
      const seatStates = (m.handStartMessage.seatStates || []).map(Number);
      this._emitEvent({ type: 'handStart', seatStates });
      this._hand = { actions: [] };
    } else if (m.playersActionDoneMessage) {
      const a = m.playersActionDoneMessage;
      this._emitEvent({ type: 'money', id: n(a.playerId), money: n(a.playerMoney) });
      // Who did what in the hand (public: every client sees it), for the
      // collusion check: [playerId, round 0–3, action 1 fold … 6 all-in, bet in the round].
      if (this._hand && this._hand.actions.length < 400) this._hand.actions.push([n(a.playerId), n(a.gameState), n(a.playerAction), n(a.totalPlayerBet)]);
    } else if (m.endOfHandShowCardsMessage) {
      for (const r of m.endOfHandShowCardsMessage.playerResults || []) {
        this._emitEvent({ type: 'money', id: n(r.playerId), money: n(r.playerMoney) });
      }
      this._handLog(true, (m.endOfHandShowCardsMessage.playerResults || []).filter((r) => n(r.moneyWon) > 0).map((r) => [n(r.playerId), n(r.moneyWon)]));
    } else if (m.endOfHandHideCardsMessage) {
      const h = m.endOfHandHideCardsMessage;
      this._emitEvent({ type: 'money', id: n(h.playerId), money: n(h.playerMoney) });
      this._handLog(false, [[n(h.playerId), n(h.moneyWon)]]);
    } else if (m.playerIdChangedMessage) {
      const c = m.playerIdChangedMessage;
      this._emitEvent({ type: 'idChange', oldId: n(c.oldPlayerId), newId: n(c.newPlayerId) });
    } else if (m.gamePlayerLeftMessage) {
      const l = m.gamePlayerLeftMessage;
      const reason = pb.GamePlayerLeftMessage.GamePlayerLeftReason[l.gamePlayerLeftReason] || String(l.gamePlayerLeftReason);
      this._emitEvent({ type: 'playerLeft', id: n(l.playerId), reason });
    } else if (m.playerInfoReplyMessage) {
      const r = m.playerInfoReplyMessage;
      if (r.playerInfoData && r.playerInfoData.playerName) this._emitEvent({ type: 'playerName', id: n(r.playerId), name: r.playerInfoData.playerName });
      if (this._namesTimer && this._missingNames().length === 0) { clearTimeout(this._namesTimer); this._namesTimer = null; this._finish(); }
    } else if (m.endOfGameMessage) {
      this._emitEvent({ type: 'endOfGame', winnerId: n(m.endOfGameMessage.winnerPlayerId) });
      this._finishWhenNamed();
    } else if (m.timeoutWarningMessage) {
      this._send(build.resetTimeout());
    } else if (m.removedFromGameMessage) {
      this._record('removedFromGame', { reason: m.removedFromGameMessage.removedFromGameReason });
      if (!this.tracker.finished) this._fail('removedFromGame', {});
    } else if (m.errorMessage) {
      const reason = m.errorMessage.errorReason;
      if (reason === pb.ErrorMessage.ErrorReason.initBlocked) {
        // Login rate limit per address — every web client player and every
        // lobby read through this proxy share its address. Temporary: wait for
        // the server to refill a login, then try again (see _onClose).
        this._record('rateLimited', { attempt: this.attempt });
        this._rateLimited = true;
        try { this.sock.destroy(); } catch (e) {}
        return;
      }
      this._fail('serverError', { reason: pb.ErrorMessage.ErrorReason[reason] || reason });
    }
  }

  _join() {
    this._record('joinRequest', { gameId: this.gameId });
    this._send(build.joinSpectator(this.gameId, this.o.gamePassword));
  }

  // ── result ───────────────────────────────────────────────────────

  _missingNames() {
    return this.tracker.seats.filter((id) => !this.tracker.names.has(id));
  }

  // Name replies can arrive just after EndOfGame: wait a little for them
  // (and ask again) so the sealed ranking carries every player's name.
  _finishWhenNamed() {
    const missing = this._missingNames();
    if (!missing.length || this.o.nameWaitMs === 0) return this._finish();
    missing.forEach((id) => this.askedNames.delete(id));
    this._askNames(missing);
    this._namesTimer = setTimeout(() => { this._namesTimer = null; this._finish(); }, this.o.nameWaitMs || 2000);
  }

  _finish() {
    if (this.sealed) return;
    const result = this.tracker.result();
    this._record('result', result);
    const payload = {
      journalVersion: JOURNAL_VERSION,
      head: this.journal.head,
      entries: this.journal.entries.length,
      result,
    };
    const out = { payload, signature: null, publicKeyPem: null };
    if (this.o.privateKeyPem) {
      out.signature = signPayload(payload, this.o.privateKeyPem);
      out.publicKeyPem = publicKeyFromPrivate(this.o.privateKeyPem);
    }
    this.sealed = out;
    this.emit('result', out, this.journal.toJSON());
    this.stop('finished');
  }
}

// Replay a journal through a fresh tracker (verification of a published
// result: same events → same ranking).
export function replayJournal(entries) {
  const t = new GameTracker();
  for (const e of entries) if (e.type === 'game') t.apply(e.data);
  return t.result();
}
