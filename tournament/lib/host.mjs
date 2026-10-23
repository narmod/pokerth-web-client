// ═══════════════════════════════════════════════════════════════════
// Tournament director — opens a Sit & Go table and runs it (2026-10-23).
//
// The HostDirector is a SpectatorDirector that first CREATES the table:
//   create   log in, create an invite-only table with the tournament's
//            settings; the director is seated and is the table admin;
//   seated   invite every registered player it sees in the lobby, check every
//            player who sits: a nickname that is not registered is kicked
//            (only possible before the start, and only by the admin);
//   handover all registered players seated (or the organizer said « go
//            without the absent »): the director leaves its seat — the server
//            makes the first player admin — and comes straight back as a
//            spectator (option A, design §2);
//   watch    it reminds the new admin in the chat to start, then follows the
//            game to the end exactly like a Table check: sealed journal,
//            ranking, signature. With announcements on (default), it tells
//            the table who is out and how many are left, heads-up, and the
//            winner (not the blinds: every client already shows them). The organizer can also send a
//            line to the table from /tournament (command « say »).
//
// Server facts relied on (pokerth/pokerth, src/net/servergame*.cpp):
//   - only the admin starts a table, and kicks only before the start;
//   - the creator is seated; when the admin leaves before the start, the
//     first player becomes admin (GameListAdminChanged in the lobby);
//   - an invite-only table refuses anyone not invited (NTF_NET_JOIN_NOT_INVITED);
//     LAN players (unauthenticated login) have the rights to join one;
//   - on a non-LAN server a full table starts by itself 6 s later, and any
//     player leaving cancels that: the director never stays seated at a full
//     table (it leaves at once, which cancels the autostart);
//   - the admin has 30 min to start (non-LAN), warned by TimeoutWarning,
//     which ResetTimeout answers;
//   - a spectator can write in the table chat; GameAdminChanged only goes to
//     seated players.
// The director's chat follows the chatcleaner's rules: no capitals, no
// links, never the same line twice in a row, spaced out.
// Design: docs/TOURNAMENT_DIRECTOR.md.
// ═══════════════════════════════════════════════════════════════════

import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { SpectatorDirector, frame } from './spectator.mjs';

const T = pb.PokerTHMessage.PokerTHMessageType;
const MAX_SEATS = 10;
const CHAT_GAP_MS = 4000;
const n = (v) => (v == null ? v : Number(v));
const low = (s) => String(s || '').toLowerCase();

function encode(messageType, field, value) {
  return pb.PokerTHMessage.encode(pb.PokerTHMessage.create({ messageType, [field]: value })).finish();
}
export const hostBuild = {
  create(info, password) {
    const j = { gameInfo: pb.NetGameInfo.create(info) };
    if (password) j.password = password;
    return encode(T.Type_JoinNewGameMessage, 'joinNewGameMessage', pb.JoinNewGameMessage.create(j));
  },
  invite(gameId, playerId) {
    return encode(T.Type_InvitePlayerToGameMessage, 'invitePlayerToGameMessage', pb.InvitePlayerToGameMessage.create({ gameId, playerId }));
  },
  kick(gameId, playerId) {
    return encode(T.Type_KickPlayerRequestMessage, 'kickPlayerRequestMessage', pb.KickPlayerRequestMessage.create({ gameId, playerId }));
  },
  chat(gameId, chatText) {
    return encode(T.Type_ChatRequestMessage, 'chatRequestMessage', pb.ChatRequestMessage.create({ targetGameId: gameId, chatText }));
  },
};

// Table settings (NetGameInfo) from the tournament's « table » settings.
export function gameInfoFor(table, name, maxPlayers) {
  const t = table || {};
  const minutes = t.raiseMode === 'minutes';
  const end = { double: 1, value: 2, keep: 3 }[t.endRaiseMode] || 1;
  const info = {
    gameName: name, netGameType: pb.NetGameInfo.NetGameType.inviteOnlyGame, maxNumPlayers: maxPlayers,
    raiseIntervalMode: minutes ? 2 : 1, endRaiseMode: end,
    proposedGuiSpeed: 5, delayBetweenHands: t.delayBetweenHands, playerActionTimeout: t.actionTimeout,
    firstSmallBlind: t.firstSmallBlind, startMoney: t.startMoney, allowSpectators: true,
  };
  if (minutes) info.raiseEveryMinutes = t.raiseEvery; else info.raiseEveryHands = t.raiseEvery;
  if (end === 2) info.endRaiseSmallBlindValue = t.endRaiseValue;
  return info;
}

// The game server checks the first byte with isprint(): keep the name plain.
export function safeTableName(s) {
  let out = String(s || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!/^[\x21-\x7e]/.test(out)) out = 'Tournament ' + out;
  while (Buffer.byteLength(out, 'utf8') > 64) out = out.slice(0, -1);
  return out.trim();
}

export class HostDirector extends SpectatorDirector {
  /**
   * Options of SpectatorDirector, plus:
   * @param {string} o.tableName   table name (the tournament's)
   * @param {object} o.table       table settings (tournaments.mjs TABLE_DEFAULTS shape)
   * @param {string[]} o.registered  registered nicknames
   * @param {number} [o.handoverDelayMs]  pause between « all seated » and leaving (default 1500)
   * @param {number} [o.unknownSeatMs]    a full table with an unchecked seat: leave after this (default 3000)
   * @param {number[]} [o.remindAfterMs]  reminders to the new admin (default [120000, 300000])
   */
  constructor(o) {
    super(Object.assign({}, o, { gameId: null, gameName: null }));
    this.phase = 'create';
    this.registered = (o.registered || []).map(String);
    this.expected = new Set(this.registered.map(low));
    this.lobby = new Map();        // playerId -> true (connected to the server)
    this.names = new Map();        // playerId -> name (every reply)
    this.table = new Set();        // playerIds seated, director excluded
    this.seated = new Map();       // playerId -> registered nickname
    this.invited = new Set();      // lowercased nicknames
    this.declined = new Map();     // lowercased nickname -> 'no' | 'busy'
    this.kicked = [];              // nicknames
    this.absent = [];              // nicknames (organizer went without them)
    this.adminId = null;
    this.chatQueue = [];
    this.lastChat = '';
    this.nameTry = 0;
    this.tableName = safeTableName(o.tableName || 'Tournament');
    const nReg = this.registered.length;
    this.maxPlayers = Math.min(MAX_SEATS, Math.max(2, nReg + 1));
    // Ten registered: the director's seat is needed — it makes room before
    // the table is full (the last two invited players then sit).
    this.leaveEarlyAt = nReg + 1 > MAX_SEATS ? MAX_SEATS - 2 : null;
    this.startedAt = null;
    this.announce = o.announce !== false;
    this.announced = new Set();    // playerIds whose elimination was told
    this.blind = null;
  }

  // ── public state, for the worker / the page ──
  hostState() {
    const online = new Set([...this.lobby.keys()].map((id) => low(this.names.get(id))).filter(Boolean));
    const seatedNicks = new Set([...this.seated.values()].map(low));
    const absent = new Set(this.absent.map(low));
    return {
      phase: this.phase, tableName: this.tableName, gameId: this.gameId, maxPlayers: this.maxPlayers,
      admin: this.adminId != null ? (this.names.get(this.adminId) || null) : null,
      registered: this.registered.map((nick) => {
        const k = low(nick);
        const status = seatedNicks.has(k) ? 'seated' : absent.has(k) ? 'absent' : this.declined.has(k) ? 'declined-' + this.declined.get(k)
          : this.invited.has(k) ? 'invited' : online.has(k) ? 'online' : 'offline';
        return { nick, status };
      }),
      kicked: this.kicked.slice(), absent: this.absent.slice(),
    };
  }
  _changed() { this.emit('host', this.hostState()); }

  // Organizer commands (through the worker).
  command(c) {
    if (!c || this.done) return;
    if (c.cmd === 'go') {
      if (this.phase !== 'seated') return this.emit('log', 'go: the table is no longer waiting');
      if (this.seated.size < 2) return this.emit('log', 'go: at least two registered players must be seated');
      this._handover('organizer', c.author);
    } else if (c.cmd === 'say') {
      const text = String(c.text || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
      if (!text) return;
      if (this.gameId == null || this.phase === 'create') return this.emit('log', 'message not sent: no table yet');
      this._record('organizerMessage', { author: c.author || null });
      this._say(text);
    } else if (c.cmd === 'reinvite') {
      this.declined.clear();
      this.invited.clear();
      this._record('reinvite', { author: c.author || null });
      this._inviteAll();
      this._changed();
    }
  }

  // ── chat ──
  _say(text, now) {
    if (this.gameId == null) return;
    const t = String(text).slice(0, 200);
    if (now) { this._sendChat(t); return; }
    this.chatQueue.push(t);
    this._pumpChat();
  }
  _sendChat(t) {
    if (t === this.lastChat) t = t + ' (' + new Date(this.now()).toISOString().slice(11, 16) + ')';
    this.lastChat = t;
    this.lastChatAt = this.now();
    this._send(hostBuild.chat(this.gameId, t));
    this._record('chat', { text: t });
  }
  _pumpChat() {
    if (this._chatTimer || !this.chatQueue.length) return;
    const gap = this.o.chatGapMs != null ? this.o.chatGapMs : CHAT_GAP_MS;
    const wait = Math.max(0, (this.lastChatAt || 0) + gap - this.now());
    this._chatTimer = setTimeout(() => {
      this._chatTimer = null;
      if (this.done || !this.chatQueue.length) return;
      // Between leaving the seat and coming back as a spectator the session
      // is in the lobby: hold the lines until it is at the table again.
      if (!this.joined) { this._chatTimer = setTimeout(() => { this._chatTimer = null; this._pumpChat(); }, 1000); return; }
      this._sendChat(this.chatQueue.shift());
      this._pumpChat();
    }, wait);
  }

  stop(reason) {
    for (const k of ['_chatTimer', '_handTimer', '_unknownTimer', '_remind1', '_remind2']) if (this[k]) { clearTimeout(this[k]); this[k] = null; }
    super.stop(reason);
  }

  // ── names ──
  _ask(ids) {
    const want = ids.map(Number).filter((id) => id && id !== this.myId && !this.names.has(id) && !this.askedNames.has(id));
    if (!want.length) return;
    want.forEach((id) => this.askedNames.add(id));
    for (let i = 0; i < want.length; i += 50) this._send(pb.PokerTHMessage.encode(pb.PokerTHMessage.create({
      messageType: T.Type_PlayerInfoRequestMessage, playerInfoRequestMessage: pb.PlayerInfoRequestMessage.create({ playerId: want.slice(i, i + 50) }),
    })).finish());
  }
  _askNames(ids) { this._ask(ids || []); }
  // A seat's name goes into the journal (game fact); a lobby name does not.
  _nameSeat(id) {
    const name = this.names.get(id);
    if (name && !this.tracker.names.has(id) && this.tracker.seats.indexOf(id) >= 0) this._emitEvent({ type: 'playerName', id, name });
  }

  // ── protocol ──
  _onMessage(m) {
    if (m.initAckMessage) {
      this.myId = n(m.initAckMessage.yourPlayerId);
      this.attempt = 0;
      this._record('loggedIn', { playerId: this.myId });
      if (this.phase === 'create') return this._create();
      // Back after a drop once the table existed: the seat (and the admin
      // role) are gone with the old session — follow the table as a spectator.
      if (this.phase !== 'watch') { this._record('hostLost', { phase: this.phase }); this.phase = 'watch'; this._changed(); }
      return this._join();
    }
    if (m.playerListMessage) {
      const p = m.playerListMessage, id = n(p.playerId);
      if (p.playerListNotification === pb.PlayerListMessage.PlayerListNotification.playerListLeft) {
        // Gone from the server: its invitation went with its player id. When
        // it comes back (new id), it is invited again by itself.
        this.lobby.delete(id);
        const k = low(this.names.get(id));
        if (k && this.expected.has(k)) { this.invited.delete(k); this.declined.delete(k); this._record('playerDisconnected', { nick: this.names.get(id) }); }
        this._changed();
      }
      else { this.lobby.set(id, true); if (this.names.has(id)) this._onName(id); else this._ask([id]); }
      return;
    }
    if (m.gameListPlayerLeftMessage) {
      // A registered player back in the lobby after another game: invite again.
      const id = n(m.gameListPlayerLeftMessage.playerId);
      if (n(m.gameListPlayerLeftMessage.gameId) !== this.gameId && this.phase === 'seated') {
        const k = low(this.names.get(id));
        if (this.declined.get(k) === 'busy') { this.declined.delete(k); this.invited.delete(k); this._invite(id); }
      }
      return;
    }
    if (m.gameListAdminChangedMessage) {
      const a = m.gameListAdminChangedMessage;
      if (n(a.gameId) === this.gameId) { this.adminId = n(a.newAdminPlayerId); this._ask([this.adminId]); this._record('adminChanged', { playerId: this.adminId }); this._changed(); }
      return;
    }
    if (m.playerInfoReplyMessage) {
      const r = m.playerInfoReplyMessage, id = n(r.playerId);
      if (r.playerInfoData && r.playerInfoData.playerName) this.names.set(id, String(r.playerInfoData.playerName));
      this._nameSeat(id);
      this._onName(id);
      if (this._namesTimer && this._missingNames().length === 0) { clearTimeout(this._namesTimer); this._namesTimer = null; this._finish(); }
      return;
    }
    if (m.chatRejectMessage) { this.emit('log', 'chat line refused by the server'); return; }

    if (this.phase === 'create') {
      if (m.joinGameFailedMessage) {
        const reason = pb.JoinGameFailedMessage.JoinGameFailureReason[m.joinGameFailedMessage.joinGameFailureReason] || String(m.joinGameFailedMessage.joinGameFailureReason);
        if (reason === 'gameNameInUse' && this.nameTry < 5) {
          this.nameTry += 1;
          this._record('tableNameInUse', { name: this.tableName });
          this.tableName = safeTableName(this.o.tableName + ' #' + (this.nameTry + 1));
          return this._create();
        }
        return this._fail('createFailed', { reason });
      }
      if (m.joinGameAckMessage) {
        super._onMessage(m);                       // journal « joined » + gameInfo
        this.gameId = n(m.joinGameAckMessage.gameId);
        this.phase = 'seated';
        this._record('tableCreated', { gameId: this.gameId, name: this.tableName, admin: !!m.joinGameAckMessage.areYouGameAdmin, maxPlayers: this.maxPlayers });
        this.emit('log', 'table « ' + this.tableName + ' » open (#' + this.gameId + '), waiting for ' + this.registered.length + ' players');
        this._inviteAll();
        this._changed();
        return;
      }
    }

    if (this.phase === 'seated') {
      if (m.gamePlayerJoinedMessage) {
        const id = n(m.gamePlayerJoinedMessage.playerId);
        if (id === this.myId) return;
        this.table.add(id);
        this._record('seatTaken', { playerId: id });
        if (this.names.has(id)) this._checkSeat(id); else this._ask([id]);
        this._watchFull();
        return;
      }
      if (m.gamePlayerLeftMessage) {
        const id = n(m.gamePlayerLeftMessage.playerId);
        this.table.delete(id);
        const nick = this.seated.get(id);
        this.seated.delete(id);
        this._record('seatLeft', { playerId: id, nick: nick || this.names.get(id) || null });
        if (nick) {
          this.emit('log', nick + ' left the table');
          // Left by mistake or dropped: invited again as soon as it is back in
          // the lobby (now if it already is).
          this.invited.delete(low(nick)); this.declined.delete(low(nick));
          if (this.lobby.has(id)) this._invite(id);
        }
        this._changed();
        return;
      }
      if (m.rejectInvNotifyMessage) {
        const r = m.rejectInvNotifyMessage, id = n(r.playerId), k = low(this.names.get(id));
        const why = r.playerRejectReason === pb.RejectGameInvitationMessage.RejectGameInvReason.rejectReasonBusy ? 'busy' : 'no';
        if (k) { this.declined.set(k, why); this._record('inviteDeclined', { nick: this.names.get(id), reason: why }); this.emit('log', this.names.get(id) + (why === 'busy' ? ' is busy (not in the lobby)' : ' declined the invitation')); }
        this._changed();
        return;
      }
      if (m.startEventMessage) {
        // Should never happen (the director never stays seated at a full
        // table); if it does, leave at once rather than play.
        this._record('startWhileSeated', {});
        return this._handover('startWhileSeated');
      }
      if (m.removedFromGameMessage) {
        const why = pb.RemovedFromGameMessage.RemovedFromGameReason[m.removedFromGameMessage.removedFromGameReason] || '';
        return this._fail('tableClosed', { reason: why });
      }
      if (m.joinGameAckMessage || m.gameAdminChangedMessage || m.inviteNotifyMessage || m.gameSpectatorJoinedMessage || m.gameSpectatorLeftMessage) return;
    }

    if (this.phase === 'handover') {
      if (m.removedFromGameMessage) {
        this._record('leftSeat', {});
        this.table = new Set();
        this.phase = 'watch';
        this.joined = false;
        this._join();                               // straight back, as a spectator
        this._changed();
        return;
      }
      if (m.gamePlayerJoinedMessage || m.gamePlayerLeftMessage || m.rejectInvNotifyMessage || m.gameAdminChangedMessage || m.startEventMessage) return;
    }

    if (this.phase === 'watch') {
      if (m.gamePlayerJoinedMessage) this.table.add(n(m.gamePlayerJoinedMessage.playerId));
      if (m.gamePlayerLeftMessage && !this.tracker.started) {
        const id = n(m.gamePlayerLeftMessage.playerId), k = low(this.names.get(id));
        this.table.delete(id);
        this.seated.delete(id);
        this._changed();
        if (k && this.expected.has(k)) { this.invited.delete(k); this.declined.delete(k); if (this.lobby.has(id)) this._invite(id); }
      }
      if (m.gamePlayerJoinedMessage && m.gamePlayerJoinedMessage.isGameAdmin) {
        this.adminId = n(m.gamePlayerJoinedMessage.playerId);
        this._ask([this.adminId]);
        this._remindAdmin();
      }
      if (m.joinGameAckMessage) {
        super._onMessage(m);
        this._remindAdmin();
        return;
      }
      if (m.handStartMessage) {
        super._onMessage(m);
        this._announceHand(n(m.handStartMessage.smallBlind));
        return;
      }
      if (m.endOfGameMessage) {
        this._announceEnd(n(m.endOfGameMessage.winnerPlayerId));
        return super._onMessage(m);
      }
      if (m.gameStartInitialMessage) {
        super._onMessage(m);
        this.startedAt = this.now();
        for (const id of this.tracker.seats) this._nameSeat(id);
        this._checkStartSeats();
        for (const k of ['_remind1', '_remind2']) if (this[k]) { clearTimeout(this[k]); this[k] = null; }
        this._say('the game has started. the director follows it to the end and records the result. good luck!');
        this._changed();
        return;
      }
    }
    return super._onMessage(m);
  }

  _create() {
    this._record('createRequest', { name: this.tableName, maxPlayers: this.maxPlayers });
    this._send(hostBuild.create(gameInfoFor(this.o.table, this.tableName, this.maxPlayers)));
  }

  _inviteAll() {
    if (this.phase !== 'seated') return;
    for (const id of this.lobby.keys()) if (this.names.has(id)) this._onName(id);
  }
  _invite(id) {
    const name = this.names.get(id), k = low(name);
    // Before the start only: seated (admin), or watching once handed over (the
    // server takes an invitation from anyone at the table).
    const open = this.phase === 'seated' || (this.phase === 'watch' && this.joined && !this.tracker.started);
    if (!open || !this.expected.has(k) || this.invited.has(k) || [...this.seated.values()].some((x) => low(x) === k)) return;
    if (this.phase === 'watch' && this.table.has(id)) return;
    this.invited.add(k);
    this._send(hostBuild.invite(this.gameId, id));
    this._record('invited', { nick: name, playerId: id });
    this.emit('log', 'invited ' + name);
  }
  _onName(id) {
    if (this.phase === 'seated') {
      if (this.lobby.has(id) && !this.table.has(id)) this._invite(id);
      if (this.table.has(id) && !this.seated.has(id)) this._checkSeat(id);
    }
    if (this.phase === 'watch' && this.lobby.has(id) && !this.table.has(id)) this._invite(id);
    if (this.phase === 'watch' && id === this.adminId) this._remindAdmin();
    this._changed();
  }

  // A player sat down: registered → welcome; anyone else → kicked (admin,
  // before the start: the only moment the server allows it).
  _checkSeat(id) {
    const name = this.names.get(id);
    if (!name || this.seated.has(id) || !this.table.has(id)) return;
    const reg = this.registered.find((x) => low(x) === low(name));
    if (reg && this.expected.has(low(reg))) {
      this.seated.set(id, reg);
      this._record('seated', { nick: reg, playerId: id });
      this.emit('log', reg + ' is seated (' + this.seated.size + ' of ' + this.expected.size + ')');
      this._say('welcome ' + reg + ', seated ' + this.seated.size + ' of ' + this.expected.size + '.');
      this._changed();
      this._maybeHandover();
    } else {
      this._send(hostBuild.kick(this.gameId, id));
      this.table.delete(id);
      this.kicked.push(name);
      this._record('kicked', { nick: name, playerId: id });
      this.emit('log', name + ' is not registered: kicked');
      this._say(name + ' is not registered for this tournament: the seats are kept for its players.');
      this._changed();
    }
  }

  _maybeHandover() {
    if (this.phase !== 'seated') return;
    const missing = [...this.expected].filter((k) => ![...this.seated.values()].some((x) => low(x) === k));
    const early = this.leaveEarlyAt != null && this.seated.size >= this.leaveEarlyAt;
    if ((missing.length === 0 && this.seated.size >= 2) || early) {
      if (this._handTimer) return;
      const full = this.table.size + 1 >= this.maxPlayers;
      // A full table starts by itself 6 s later on a non-LAN server: never wait then.
      const delay = full ? 0 : (this.o.handoverDelayMs != null ? this.o.handoverDelayMs : 1500);
      this._handTimer = setTimeout(() => { this._handTimer = null; if (this.phase === 'seated') this._handover(early && missing.length ? 'makeRoom' : 'allSeated'); }, delay);
    }
  }
  // A full table with a seat not checked yet: the director must not stay
  // seated (autostart in 6 s on a non-LAN server).
  _watchFull() {
    if (this.table.size + 1 < this.maxPlayers || this._unknownTimer) return;
    this._unknownTimer = setTimeout(() => {
      this._unknownTimer = null;
      if (this.phase === 'seated' && this.table.size + 1 >= this.maxPlayers) this._handover('fullTable');
    }, this.o.unknownSeatMs != null ? this.o.unknownSeatMs : 3000);
  }

  _handover(reason, author) {
    if (this.phase !== 'seated') return;
    for (const k of ['_handTimer', '_unknownTimer']) if (this[k]) { clearTimeout(this[k]); this[k] = null; }
    const seatedNicks = [...this.seated.values()];
    if (reason === 'organizer') {
      this.absent = this.registered.filter((x) => !seatedNicks.some((s) => low(s) === low(x)));
      this.absent.forEach((x) => this.expected.delete(low(x)));
    }
    this.phase = 'handover';
    this._record('handover', { reason, author: author || null, seated: seatedNicks, absent: this.absent.slice() });
    this.emit('log', 'handing over (' + reason + '): the director leaves its seat');
    this._sendChat(reason === 'makeRoom'
      ? 'the director leaves its seat to make room for the last players and keeps watching the table.'
      : 'the director leaves its seat now and keeps watching the table: the new table admin starts the game.');
    this._send(hostBuild.leaveSeat(this.gameId));
    this.joined = false;
    this._changed();
  }

  _remindAdmin() {
    if (this.phase !== 'watch' || this.tracker.started || this._reminded || this.adminId == null || !this.joined) return;
    const name = this.names.get(this.adminId);
    if (!name) return;
    this._reminded = true;
    this._say(name + ', you are the table admin now: please start the game when everyone is ready. good luck to all!');
    const [a, b] = this.o.remindAfterMs || [120000, 300000];
    this._remind1 = setTimeout(() => { this._remind1 = null; if (!this.tracker.started) this._say(name + ', the players are waiting: the game starts when you press start.'); }, a);
    this._remind2 = setTimeout(() => { this._remind2 = null; if (!this.tracker.started) this._say('reminder for ' + name + ': only the table admin can start the game.'); }, b);
  }

  // ── announcements (watch phase) ──
  _nm(id) { return this.names.get(id) || this.tracker.names.get(id) || ('player ' + id); }
  _announceHand(smallBlind) {
    if (!this.announce) return;
    const t = this.tracker;
    const out = t.seats.filter((id) => t.elim.has(id) && !this.announced.has(id));
    out.forEach((id) => this.announced.add(id));
    const left = t.seats.filter((id) => !t.elim.has(id));
    if (out.length && left.length >= 2) {
      const who = out.map((id) => this._nm(id));
      this._say((who.length === 1 ? who[0] + ' is out' : who.slice(0, -1).join(', ') + ' and ' + who[who.length - 1] + ' are out') + ', ' + left.length + ' players left.');
      if (left.length === 2) this._say('heads-up: ' + this._nm(left[0]) + ' against ' + this._nm(left[1]) + '.');
    }
  }
  _announceEnd(winnerId) {
    if (!this.announce || winnerId == null) return;
    const t = this.tracker;
    const second = t.seats.filter((id) => id !== winnerId && !t.elim.has(id));
    const line = this._nm(winnerId) + ' wins the tournament' + (second.length === 1 ? ', ' + this._nm(second[0]) + ' second' : '') + '. congratulations to all, the result is recorded.';
    this.chatQueue = [];
    this._sendChat(line);
  }

  // The seats at the start against the registered list: a stranger means the
  // result needs an organizer (it never counts on its own).
  _checkStartSeats() {
    const strangers = this.tracker.seats.map((id) => this.names.get(id) || ('#' + id)).filter((name) => !this.registered.some((x) => low(x) === low(name)));
    this._record('seatCheck', { ok: strangers.length === 0, strangers });
    if (strangers.length) this.emit('log', 'seat check: not registered at the start: ' + strangers.join(', '));
  }
}

hostBuild.leaveSeat = (gameId) => encode(T.Type_LeaveGameRequestMessage, 'leaveGameRequestMessage', pb.LeaveGameRequestMessage.create({ gameId }));
export { frame };
