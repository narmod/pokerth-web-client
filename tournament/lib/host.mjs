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
// Players who do not come (the tournament's « absence » rule, service 0.18.0):
//   - every refusal, invitation left unanswered for retrySec, « busy » answer
//     (in another game) and seat left before the start is a failure; the
//     player is invited again retrySec later (a seat left: at once);
//   - back on the server after a drop, or out of another game: invited again
//     at once, no failure;
//   - from graceMin past the start (the opening without a date) on, a player
//     with `strikes` failures, or not connected for retrySec, is marked
//     absent (told privately): not invited, not ranked; the table goes on as
//     soon as the others are seated. Mode « manual »: none of this, the
//     organizer decides (« go »). An absent player who sits before the start
//     after all is welcome again.
//   - when the admin starts with registered players missing (after the
//     hand-over), those are marked absent at the start.
// Nicknames: the server tells « Bob » from « bob »; a registered name matches
// its exact spelling first, another case only when nobody online has it.
// The director's chat follows the chatcleaner's rules: no capitals, no
// links, never the same line twice in a row, spaced out.
// Before the start, a waiting player sees the LOBBY chat (QML GameWaitPage,
// and the web client the same way), not the table's: the director's lines
// for the players then go as private messages to them; once the game runs
// (the server refuses private messages to its players) they go to the table.
// Design: docs/TOURNAMENT_DIRECTOR.md.
// ═══════════════════════════════════════════════════════════════════

import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { SpectatorDirector, frame } from './spectator.mjs';
import { BOT_EN, fill, splitChat } from './botchat.mjs';
import { cleanTable } from './table.mjs';

const T = pb.PokerTHMessage.PokerTHMessageType;
const MAX_SEATS = 10;
// The reason the worker gives when the organizer closes the table.
export const CLOSED_BY_ORGANIZER = 'stopped by the organizer';
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
  pm(playerId, chatText) {
    return encode(T.Type_ChatRequestMessage, 'chatRequestMessage', pb.ChatRequestMessage.create({ targetPlayerId: playerId, chatText }));
  },
};

// Table settings (NetGameInfo) from the tournament's « table » settings.
export function gameInfoFor(table, name, maxPlayers) {
  // Brought inside the server's limits first (a table stored with older,
  // wider limits would make the server refuse the request and drop us).
  const t = cleanTable(table || {}, table || {});
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
  // A manual blinds order (field 14): the server plays it, then « afterwards » (endRaiseMode).
  if (t.manualBlinds && t.manualBlinds.length) info.manualBlinds = t.manualBlinds.slice();
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
    // The chat language's lines (from the manager), English filling any gap.
    this.chat = Object.assign({}, BOT_EN, o.chat || {});
    this.announced = new Set();    // playerIds whose elimination was told
    this.blind = null;
    // Absence rule (tournaments.mjs ABSENCE_AUTO); tests may give ms directly.
    const a = Object.assign({ mode: 'auto', strikes: 3, retrySec: 60, graceMin: 10 }, o.absence || {});
    this.policy = { mode: ['auto', 'custom', 'manual'].indexOf(a.mode) >= 0 ? a.mode : 'auto', strikes: Math.max(1, Number(a.strikes) || 3),
      retryMs: a.retryMs != null ? Number(a.retryMs) : Math.max(1, Number(a.retrySec) || 60) * 1000,
      graceMs: a.graceMs != null ? Number(a.graceMs) : Math.max(0, Number(a.graceMin) || 0) * 60000 };
    this.startsAt = Number(o.startsAt) > 0 ? Number(o.startsAt) : null;
    this.openedAt = null;
    this.failures = new Map();     // lowercased nickname -> number of failures
    this.lastFailure = new Map();  // lowercased nickname -> 'declined' | 'busy' | 'noAnswer' | 'left'
    this.pending = new Map();      // lowercased nickname -> { id, at } invitation without an answer
    this.retryAt = new Map();      // lowercased nickname -> when to invite again
    this.offlineSince = new Map(); // lowercased nickname -> since when not on the server
    this.invitedId = new Map();    // lowercased nickname -> the player id invited for it
    this.absentWhy = new Map();    // lowercased nickname -> why marked absent
    this.toldStranger = new Set(); // playerIds the admin was told about (watch phase)
  }
  get auto() { return this.policy.mode !== 'manual'; }
  deadline() { return (this.startsAt || this.openedAt || this.now()) + this.policy.graceMs; }

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
        return { nick, status, failures: this.failures.get(k) || 0, absentWhy: this.absentWhy.get(k) || null };
      }),
      kicked: this.kicked.slice(), absent: this.absent.slice(),
      absence: { mode: this.policy.mode, strikes: this.policy.strikes, retrySec: Math.round(this.policy.retryMs / 1000), deadline: this.phase === 'create' ? null : this.deadline() },
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
      if (this.tracker.started) this._say(text);
      else if (!this.table.size) this.emit('log', 'message not sent: nobody at the table yet');
      else this._tell([...this.table], text);
    } else if (c.cmd === 'reinvite') {
      this.declined.clear();
      this.invited.clear();
      this.failures.clear(); this.lastFailure.clear(); this.pending.clear(); this.retryAt.clear();
      this._record('reinvite', { author: c.author || null });
      this._inviteAll();
      this._changed();
    }
  }

  // ── chat ──
  // A line of the chat language, its {x} filled in.
  _t(key, vars) { return fill(this.chat[key] != null ? this.chat[key] : BOT_EN[key], vars); }
  // A line for the table chat (once the game runs). The server takes at most
  // 128 bytes a line (more closes the session): longer ones go in parts.
  _say(text, now) {
    if (this.gameId == null) return;
    const parts = splitChat(text);
    if (now) { for (const t of parts) this._sendChat({ text: t }); return; }
    for (const t of parts) this.chatQueue.push({ text: t });
    this._pumpChat();
  }
  // A line for some players: private before the start (they read the lobby
  // chat then), the table chat once the game runs.
  _tell(ids, text) {
    if (this.tracker.started) return this._say(text);
    const parts = splitChat(text);
    for (const id of ids || []) if (id != null && id !== this.myId) for (const t of parts) this.chatQueue.push({ text: t, to: id });
    this._pumpChat();
  }
  _sendChat(e) {
    if (typeof e === 'string') e = { text: e };
    let t = e.text;
    if (e.to != null) {
      this.lastPmAt = this.now();
      this._send(hostBuild.pm(e.to, t));
      this._record('chat', { to: e.to, text: t });
      return;
    }
    if (t === this.lastChat) t = t + ' (' + new Date(this.now()).toISOString().slice(11, 16) + ')';
    this.lastChat = t;
    this.lastChatAt = this.now();
    this._send(hostBuild.chat(this.gameId, t));
    this._record('chat', { text: t });
  }
  _pumpChat() {
    if (this._chatTimer || !this.chatQueue.length) return;
    const pm = this.chatQueue[0].to != null;
    const gap = pm ? (this.o.pmGapMs != null ? this.o.pmGapMs : 300) : (this.o.chatGapMs != null ? this.o.chatGapMs : CHAT_GAP_MS);
    const wait = Math.max(0, ((pm ? this.lastPmAt : this.lastChatAt) || 0) + gap - this.now());
    this._chatTimer = setTimeout(() => {
      this._chatTimer = null;
      if (this.done || !this.chatQueue.length) return;
      // Between leaving the seat and coming back as a spectator the session
      // is in the lobby: a table line waits until it is at the table again
      // (a private message does not).
      if (!this.joined && this.chatQueue[0].to == null) { this._chatTimer = setTimeout(() => { this._chatTimer = null; this._pumpChat(); }, 1000); return; }
      this._sendChat(this.chatQueue.shift());
      this._pumpChat();
    }, wait);
  }

  stop(reason) {
    if (this.done) return;
    for (const k of ['_chatTimer', '_handTimer', '_unknownTimer', '_remind0', '_remind1', '_remind2']) if (this[k]) { clearTimeout(this[k]); this[k] = null; }
    if (this._tick) { clearInterval(this._tick); this._tick = null; }
    // Closed by the organizer before the start: nobody keeps playing a game
    // that would not count. Seated (admin), the director removes every player
    // so that the table goes away; watching, it tells them.
    if (reason === CLOSED_BY_ORGANIZER && this.gameId != null && !this.tracker.started && this.sock) {
      const text = this._t('closedByOrganizer');
      for (const id of this.table) {
        if (id === this.myId) continue;
        for (const t of splitChat(text)) this._send(hostBuild.pm(id, t));
        if (this.phase === 'seated') this._send(hostBuild.kick(this.gameId, id));
      }
      this._record('closedByOrganizer', { phase: this.phase, players: [...this.table].map((id) => this.names.get(id) || ('#' + id)), kicked: this.phase === 'seated' });
    }
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
        const k = this._keyOf(id);
        if (k && this.expected.has(k)) {
          this.invited.delete(k); this.declined.delete(k); this.pending.delete(k); this.retryAt.delete(k); this.invitedId.delete(k);
          if (![...this.lobby.keys()].some((x) => this._keyOf(x) === k)) this.offlineSince.set(k, this.now());
          this._record('playerDisconnected', { nick: this.names.get(id) });
        }
        this._changed();
      }
      else { this.lobby.set(id, true); if (this.names.has(id)) this._onName(id); else this._ask([id]); }
      return;
    }
    if (m.gameListPlayerLeftMessage) {
      // A registered player back in the lobby after another game: invite again.
      const id = n(m.gameListPlayerLeftMessage.playerId);
      if (n(m.gameListPlayerLeftMessage.gameId) !== this.gameId && this._invitingOpen()) {
        const k = this._keyOf(id);
        if (k && (this.declined.get(k) === 'busy' || (this.auto && this.retryAt.has(k)))) { this.declined.delete(k); this.invited.delete(k); this.retryAt.delete(k); this.pending.delete(k); this._invite(id); }
      }
      return;
    }
    if (m.gameListAdminChangedMessage) {
      const a = m.gameListAdminChangedMessage;
      if (n(a.gameId) === this.gameId) { this._setAdmin(n(a.newAdminPlayerId)); this._record('adminChanged', { playerId: this.adminId }); this._changed(); }
      return;
    }
    if (m.playerInfoReplyMessage) {
      const r = m.playerInfoReplyMessage, id = n(r.playerId);
      if (r.playerInfoData && r.playerInfoData.playerName) this.names.set(id, String(r.playerInfoData.playerName));
      this._nameSeat(id);
      this._onName(id);
      // A name that was missing may decide another player's case (« Bob » / « bob »).
      if (this._invitingOpen() && [...this.lobby.keys()].every((x) => this.names.has(x))) this._inviteAll();
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
        this.openedAt = this.now();
        // Registered players not on the server yet: offline since the opening.
        for (const k of this.expected) if (![...this.lobby.keys()].some((x) => this._keyOf(x) === k)) this.offlineSince.set(k, this.openedAt);
        this._record('absenceRule', { mode: this.policy.mode, strikes: this.policy.strikes, retrySec: Math.round(this.policy.retryMs / 1000), deadline: this.deadline() });
        this._inviteAll();
        this._startTick();
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
          // the lobby (now if it already is). Leaving is a failure (the server
          // refuses a seventh join at the same table).
          const k = low(nick);
          this.invited.delete(k); this.declined.delete(k); this.pending.delete(k);
          if (this.lobby.has(id)) { this._fail_(k, 'left'); if (this.expected.has(k)) this._invite(id); }
        }
        this._changed();
        return;
      }
      if (m.rejectInvNotifyMessage) {
        this._onReject(m.rejectInvNotifyMessage);
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
      if (m.rejectInvNotifyMessage) { this._onReject(m.rejectInvNotifyMessage); return; }
      if (m.gamePlayerJoinedMessage && !this.tracker.started) {
        const id = n(m.gamePlayerJoinedMessage.playerId);
        if (id !== this.myId) { this.table.add(id); if (this.names.has(id)) this._watchSeat(id); }
      }
      if (m.gamePlayerJoinedMessage) this.table.add(n(m.gamePlayerJoinedMessage.playerId));
      if (m.gamePlayerLeftMessage && !this.tracker.started) {
        const id = n(m.gamePlayerLeftMessage.playerId), k = this._keyOf(id);
        this.table.delete(id);
        this.seated.delete(id);
        this._changed();
        if (k && this.expected.has(k)) { this.invited.delete(k); this.declined.delete(k); this.pending.delete(k); if (this.lobby.has(id)) { this._fail_(k, 'left'); if (this.expected.has(k)) this._invite(id); } }
      }
      if (m.gamePlayerJoinedMessage && m.gamePlayerJoinedMessage.isGameAdmin) this._setAdmin(n(m.gamePlayerJoinedMessage.playerId));
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
        if (this._tick) { clearInterval(this._tick); this._tick = null; }
        this._absentAtStart();
        this._checkStartSeats();
        for (const k of ['_remind0', '_remind1', '_remind2']) if (this[k]) { clearTimeout(this[k]); this[k] = null; }
        this.chatQueue = this.chatQueue.filter((e) => e.to == null);   // private lines no longer reach a running table
        this._say(this._t('started'));
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
    if (!this._invitingOpen()) return;
    for (const id of this.lobby.keys()) if (this.names.has(id)) this._onName(id);
  }
  // Before the start only: seated (admin), or watching once handed over (the
  // server takes an invitation from anyone at the table).
  _invitingOpen() { return this.phase === 'seated' || (this.phase === 'watch' && this.joined && !this.tracker.started); }
  // The registered nickname a server name stands for: its exact spelling, or
  // another case when nobody online has the exact one (« Bob » and « bob »
  // are two players for the server).
  _regFor(name) {
    if (!name) return null;
    const exact = this.registered.find((x) => x === name);
    if (exact) return exact;
    const ci = this.registered.filter((x) => low(x) === low(name));
    if (ci.length !== 1) return null;
    // Only once every name on the server is known, and nobody has the exact one.
    const ids = [...this.lobby.keys()];
    if (ids.some((id) => !this.names.has(id)) || ids.some((id) => this.names.get(id) === ci[0])) return null;
    return ci[0];
  }
  _keyOf(id) { const r = this._regFor(this.names.get(id)); return r ? low(r) : null; }
  _invite(id) {
    const name = this.names.get(id), reg = this._regFor(name), k = reg ? low(reg) : null;
    if (!k || !this._invitingOpen() || !this.expected.has(k) || this.invited.has(k) || [...this.seated.values()].some((x) => low(x) === k)) return;
    if (this.phase === 'watch' && this.table.has(id)) return;
    this.invited.add(k);
    this.invitedId.set(k, id);
    this.pending.set(k, { id, at: this.now() });
    this.retryAt.delete(k);
    this.offlineSince.delete(k);
    this._send(hostBuild.invite(this.gameId, id));
    this._record('invited', { nick: name, playerId: id });
    this.emit('log', 'invited ' + name);
  }
  // An answer to an invitation: a failure, invited again later (auto modes).
  _onReject(r) {
    const id = n(r.playerId), k = this._keyOf(id);
    const why = r.playerRejectReason === pb.RejectGameInvitationMessage.RejectGameInvReason.rejectReasonBusy ? 'busy' : 'no';
    if (k) {
      this.declined.set(k, why);
      this.pending.delete(k);
      this._record('inviteDeclined', { nick: this.names.get(id), reason: why });
      this.emit('log', this.names.get(id) + (why === 'busy' ? ' is busy (not in the lobby)' : ' declined the invitation'));
      if (this.expected.has(k) && this._fail_(k, why === 'busy' ? 'busy' : 'declined') && this.expected.has(k)) this.retryAt.set(k, this.now() + this.policy.retryMs);
    }
    this._changed();
  }
  // One failure more (auto modes only). True when counted.
  _fail_(k, reason) {
    if (!this.auto || !this.expected.has(k)) return false;
    const f = (this.failures.get(k) || 0) + 1;
    this.failures.set(k, f);
    this.lastFailure.set(k, reason);
    this._record('inviteFailed', { nick: this.registered.find((x) => low(x) === k) || k, reason, failures: f });
    this._changed();
    this._checkAbsent();
    return true;
  }
  // Once a second before the start: unanswered invitations, invitations to
  // send again, and the absence rule once past the deadline.
  _startTick() {
    if (this._tick) return;
    this._tick = setInterval(() => this._onTick(), this.o.tickMs || 1000);
    if (this._tick.unref) this._tick.unref();
  }
  _onTick() {
    if (this.done || this.tracker.started) { if (this._tick) { clearInterval(this._tick); this._tick = null; } return; }
    if (!this._invitingOpen()) return;
    const now = this.now();
    if (this.auto) {
      for (const [k, p] of [...this.pending]) {
        if (now - p.at < this.policy.retryMs) continue;
        this.pending.delete(k);
        this.invited.delete(k);
        this._record('inviteUnanswered', { nick: this.names.get(p.id) || k });
        if (this._fail_(k, 'noAnswer') && this.expected.has(k) && this.lobby.has(p.id)) this._invite(p.id);
      }
      for (const [k, at] of [...this.retryAt]) {
        if (now < at) continue;
        this.retryAt.delete(k);
        if (!this.expected.has(k)) continue;
        const id = [...this.lobby.keys()].find((x) => this._keyOf(x) === k);
        if (id != null) { this.invited.delete(k); this.declined.delete(k); this._invite(id); }
      }
    }
    this._checkAbsent();
  }
  // Past the deadline: `strikes` failures, or off the server for retryMs → absent.
  _checkAbsent() {
    if (!this.auto || this.tracker.started || !this._invitingOpen() || this.now() < this.deadline()) return;
    // Seated: checked by the director (seated phase), or at the table (watching).
    const seatedK = new Set([...this.seated.values()].map(low).concat([...this.table].map((id) => this._keyOf(id)).filter(Boolean)));
    let any = false;
    for (const k of [...this.expected]) {
      if (seatedK.has(k)) continue;
      const off = this.offlineSince.get(k);
      const why = (this.failures.get(k) || 0) >= this.policy.strikes ? 'failures' : off != null && this.now() - off >= this.policy.retryMs ? (this.lastFailure.has(k) || this.invitedId.has(k) ? 'offline' : 'neverConnected') : null;
      if (why) { this._markAbsent(k, why); any = true; }
    }
    if (any) {
      if (this.phase === 'seated') this._maybeHandover();
      const left = [...this.expected].length;
      if (left < 2) this.emit('log', 'fewer than two players left for this table: the organizer decides');
    }
  }
  _markAbsent(k, why) {
    const nick = this.registered.find((x) => low(x) === k) || k;
    this.expected.delete(k);
    if (!this.absent.some((x) => low(x) === k)) this.absent.push(nick);
    this.absentWhy.set(k, why);
    this.pending.delete(k); this.retryAt.delete(k); this.invited.delete(k);
    this._record('markedAbsent', { nick, reason: why, failures: this.failures.get(k) || 0 });
    this.emit('log', nick + ' marked absent (' + why + ')');
    const id = [...this.lobby.keys()].find((x) => this._keyOf(x) === k);
    if (id != null && !this.tracker.started) this._tell([id], this._t('absentMarked'));
    this._changed();
  }
  // An absent player who sits before the start after all: welcome again.
  _absentBack(k) {
    const nick = this.registered.find((x) => low(x) === k);
    if (!nick || this.expected.has(k) || !this.absent.some((x) => low(x) === k) || this.tracker.started) return false;
    this.expected.add(k);
    this.absent = this.absent.filter((x) => low(x) !== k);
    this.absentWhy.delete(k);
    this._record('absentBack', { nick });
    return true;
  }
  // The admin started with registered players missing (after the hand-over):
  // they are absent (not ranked); absent players who did sit are back.
  _absentAtStart() {
    const seatNames = this.tracker.seats.map((id) => this.names.get(id)).filter(Boolean);
    const seatK = new Set(seatNames.map((nm) => { const r = this._regFor(nm); return r ? low(r) : null; }).filter(Boolean));
    for (const k of seatK) if (!this.expected.has(k)) this._absentBack(k);
    for (const k of [...this.expected]) if (!seatK.has(k)) { const nick = this.registered.find((x) => low(x) === k) || k; this.expected.delete(k); if (!this.absent.some((x) => low(x) === k)) this.absent.push(nick); this.absentWhy.set(k, 'notSeatedAtStart'); this._record('markedAbsent', { nick, reason: 'notSeatedAtStart', failures: this.failures.get(k) || 0 }); }
  }
  // The table admin (after the hand-over): asked to start; a new admin (the
  // previous one left or was timed out) is asked again.
  _setAdmin(id) {
    if (id == null) return;
    const changed = this.adminId !== id;
    this.adminId = id;
    this._ask([id]);
    if (changed && this.phase === 'watch' && !this.tracker.started && this._reminded) {
      this._reminded = false;
      for (const k of ['_remind0', '_remind1', '_remind2']) if (this[k]) { clearTimeout(this[k]); this[k] = null; }
    }
    this._remindAdmin();
  }
  // Watching before the start: a seat taken by someone not registered (the
  // admin, a player, may invite anyone): the admin is asked to remove them.
  _watchSeat(id) {
    if (this.tracker.started || id === this.myId || !this.table.has(id)) return;
    const name = this.names.get(id);
    const reg = this._regFor(name);
    if (reg) { const k = low(reg); if (!this.expected.has(k)) this._absentBack(k); this.pending.delete(k); this._changed(); return; }
    if (this.toldStranger.has(id)) return;
    this.toldStranger.add(id);
    this._record('strangerSeated', { nick: name, playerId: id });
    this.emit('log', name + ' sat down and is not registered: the admin is asked to remove them');
    this._tell([id], this._t('notRegistered'));
    if (this.adminId != null && this.adminId !== id) this._tell([this.adminId], this._t('strangerSeated', { nick: name }));
  }
  _onName(id) {
    if (this.phase === 'seated') {
      if (this.lobby.has(id) && !this.table.has(id)) this._invite(id);
      if (this.table.has(id) && !this.seated.has(id)) this._checkSeat(id);
    }
    if (this.phase === 'watch' && this.lobby.has(id) && !this.table.has(id)) this._invite(id);
    if (this.phase === 'watch' && this.table.has(id)) this._watchSeat(id);
    if (this.phase === 'watch' && id === this.adminId) this._remindAdmin();
    this._changed();
  }

  // A player sat down: registered → welcome; anyone else → kicked (admin,
  // before the start: the only moment the server allows it).
  _checkSeat(id) {
    const name = this.names.get(id);
    if (!name || this.seated.has(id) || !this.table.has(id)) return;
    const reg = this._regFor(name);
    // Another case than the registered spelling: only the player invited for it.
    const okCase = reg && (reg === name || this.invitedId.get(low(reg)) === id);
    if (reg && okCase && !this.expected.has(low(reg))) this._absentBack(low(reg));
    if (reg && okCase && this.expected.has(low(reg))) {
      this.pending.delete(low(reg)); this.retryAt.delete(low(reg));
      this.seated.set(id, reg);
      this._record('seated', { nick: reg, playerId: id });
      this.emit('log', reg + ' is seated (' + this.seated.size + ' of ' + this.expected.size + ')');
      this._tell([id], this._t('welcome', { nick: reg, n: this.seated.size, of: this.expected.size }));
      this._changed();
      this._maybeHandover();
    } else {
      this._send(hostBuild.kick(this.gameId, id));
      this.table.delete(id);
      this.kicked.push(name);
      this._record('kicked', { nick: name, playerId: id });
      this.emit('log', name + ' is not registered: kicked');
      this._tell([id], this._t('notRegistered'));
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
    this._send(hostBuild.leaveSeat(this.gameId));
    this.joined = false;
    this._changed();
  }

  // Back as a spectator: the new admin is asked (privately) to start, the
  // others are told who starts. A short pause first, so that every player of
  // the table has been announced (GamePlayerJoined) to the spectator.
  _remindAdmin() {
    if (this.phase !== 'watch' || this.tracker.started || this._reminded || this._remind0 || this.adminId == null || !this.joined) return;
    if (!this.names.get(this.adminId)) return;
    this._remind0 = setTimeout(() => {
      this._remind0 = null;
      if (this.tracker.started || this._reminded) return;
      const admin = this.adminId, name = this.names.get(admin);
      this._reminded = true;
      this._tell([admin], this._t('youAdmin'));
      this._tell([...this.table].filter((id) => id !== admin), this._t('newAdmin', { nick: name }));
      const [a, b] = this.o.remindAfterMs || [120000, 300000];
      this._remind1 = setTimeout(() => { this._remind1 = null; if (!this.tracker.started) this._tell([admin], this._t('waiting')); }, a);
      this._remind2 = setTimeout(() => { this._remind2 = null; if (!this.tracker.started) this._tell([admin], this._t('reminder')); }, b);
    }, this.o.adminNoticeDelayMs != null ? this.o.adminNoticeDelayMs : 600);
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
      this._say(who.length === 1 ? this._t('outOne', { nick: who[0], n: left.length })
        : this._t('outMany', { list: this._t('listAnd', { list: who.slice(0, -1).join(', '), last: who[who.length - 1] }), n: left.length }));
      if (left.length === 2) this._say(this._t('headsUp', { a: this._nm(left[0]), b: this._nm(left[1]) }));
    }
  }
  _announceEnd(winnerId) {
    if (!this.announce || winnerId == null) return;
    const t = this.tracker;
    const second = t.seats.filter((id) => id !== winnerId && !t.elim.has(id));
    const line = second.length === 1 ? this._t('winsSecond', { nick: this._nm(winnerId), second: this._nm(second[0]) }) : this._t('wins', { nick: this._nm(winnerId) });
    this.chatQueue = [];
    this._say(line, true);
  }

  // The seats at the start against the registered list: a stranger means the
  // result needs an organizer (it never counts on its own).
  _checkStartSeats() {
    const strangers = this.tracker.seats.map((id) => this.names.get(id) || ('#' + id)).filter((name) => !this.registered.some((x) => low(x) === low(name)));
    this._record('seatCheck', { ok: strangers.length === 0, strangers });
    if (strangers.length) {
      this.emit('log', 'seat check: not registered at the start: ' + strangers.join(', '));
      // Computer players added at the start, or someone the admin let in: the
      // table is told the result waits for an organizer.
      this._say(this._t('strangersAtStart', { list: strangers.join(', ') }));
    }
  }
}

hostBuild.leaveSeat = (gameId) => encode(T.Type_LeaveGameRequestMessage, 'leaveGameRequestMessage', pb.LeaveGameRequestMessage.create({ gameId }));
export { frame };
