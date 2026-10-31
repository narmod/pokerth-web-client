// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/local-server.mjs — « Play nearby » local server
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// The host's tab runs this small PokerTH server: a lobby, ONE table, and the
// evening scoreboard. Every player — the host included — talks to it with the
// real PokerTH protocol, framed exactly like the proxy does ([u32 BE length]
// + PokerTHMessage), so the existing lobby, waiting room and table screens
// work unchanged. The transport is not this module's business: a connection
// is attached with attach({ send, close }) and fed with receive(frame). The
// host uses an in-page pipe (lan/pipe-socket.mjs), the guests a WebRTC
// DataChannel (lan/rtc-link.mjs), the tests BroadcastChannel (lan/bc-link.mjs)
// or a plain in-memory pipe.
//
// What it reuses: the training engine (offline/engine.mjs, untouched), its
// bots (offline/bots.mjs) and its protobuf codec (offline/proto.mjs). What it
// does NOT carry over from the training server: achievements, bot reactions,
// easter eggs, the pause between hands — none of them fits a table of humans.
//
// V1 rules (design note claude/CONCEPTION_LAN_LOCAL.md, decided 2026-10-31):
//   · one table at a time; any lobby player may create it while none exists
//     and becomes its admin; a second creation is refused (JoinGameFailed,
//     invalidSettings — the UI of step 4 hides the button anyway);
//   · up to 10 seats (PokerTH's limit); the admin's « + Bots » fills the rest;
//   · players who find no seat, or arrive after the start, stay in the lobby;
//   · when the game ends the table closes and a new one can be created;
//   · each player only ever receives their OWN hole cards (HandStart);
//   · every frame from a player is checked: one acts only for one's own seat,
//     on one's own turn; only the admin kicks, starts, and only bots can be
//     kicked once the game runs;
//   · two players can never share a nickname (case-insensitive) — the
//     scoreboard tells players apart by name;
//   · a player whose connection drops DURING a game keeps his seat for
//     GRACE_MS (« away »: he checks or folds at once when his turn comes, his
//     nickname stays reserved). He takes it back by logging in again with the
//     same nickname and the session GUID of his InitAck (InitMessage field 3,
//     exactly what the client replays): InitAck.rejoinGameId, then his
//     RejoinExistingGame is answered with JoinGameAck + GameStartRejoin, and
//     he plays again from the next hand — the client's existing resume path.
//     After GRACE_MS he leaves the table (fold, then out). Dropping in the
//     lobby or the waiting room simply leaves.
//
// The scoreboard (lan/scoreboard.mjs) travels in a message of our own,
// NEARBY_TYPE.Scoreboard (240, envelope field 241, a JSON string in field 1),
// outside PokerTH's numbering: a client that does not know it ignores it.
// ─────────────────────────────────────────────────────────────────────────

import { OfflineTable, ACT } from '../offline/engine.mjs';
import { decide, pickArchetype } from '../offline/bots.mjs';
import { encode, frame, packed, readFields, parseClientFrame } from '../offline/proto.mjs';
import { createScoreboard } from './scoreboard.mjs';

import { NEARBY_PROTOCOL, NEARBY_TYPE } from './protocol.mjs';
export { NEARBY_PROTOCOL, NEARBY_TYPE };

// PokerTH message type ids (pokerth.proto). Envelope field is always type + 1.
const T = Object.freeze({
  Announce: 1, Init: 2, InitAck: 6, PlayerList: 12,
  GameListNew: 13, GameListUpdate: 14, GameListPlayerJoined: 15, GameListPlayerLeft: 16,
  GameListAdminChanged: 17, PlayerInfoRequest: 18, PlayerInfoReply: 19,
  JoinExisting: 21, JoinNew: 22, RejoinExisting: 23, JoinGameAck: 24, JoinGameFailed: 25,
  GamePlayerJoined: 26, GamePlayerLeft: 27, GameAdminChanged: 28, RemovedFromGame: 29,
  KickPlayer: 30, LeaveGame: 31, StartEvent: 36, StartEventAck: 37, GameStartInitial: 38,
  HandStart: 40, PlayersTurn: 41, MyActionRequest: 42, YourActionRejected: 43,
  PlayersActionDone: 44, DealFlop: 45, DealTurn: 46, DealRiver: 47,
  EndOfHandShow: 49, EndOfHandHide: 50, EndOfGame: 53,
  ChatRequest: 63, Chat: 64, Error: 73,
});
const GS  = { preflop: 0, flop: 1, turn: 2, river: 3 };
const NPA = { fold: 1, check: 2, call: 3, bet: 4, raise: 5, allin: 6 };

// Reasons (pokerth.proto)
const ERR = { versionNotSupported: 1, serverFull: 2, nameInUse: 4, invalidName: 5 };
const JOINFAIL = { invalidGame: 1, gameIsFull: 2, gameIsRunning: 3, invalidSettings: 9, noSpectators: 12 };
const LEFT = { onRequest: 0, kicked: 1 };
const REMOVED = { onRequest: 0, kicked: 1 };
const CHAT = { lobby: 0, game: 1, priv: 4 };
const GAMEMODE = { created: 1, started: 2, closed: 3 };

/** Limits of the V1. */
export const LIMITS = Object.freeze({ seats: 10, lobby: 16, nameLen: 32, chatLen: 512, gameInfoBytes: 2048 });
const BOT_ID_BASE = 1000;          // humans get 1, 2, 3…; bots 1001, 1002…
const START_ACK_WAIT_MS = 5000;    // start anyway if a player never acks StartEvent
/** How long a dropped player's seat waits for him during a game. */
export const GRACE_MS = 120000;

function newGuid() {
  const g = new Uint8Array(16);
  try { /** @type {any} */ (globalThis).crypto.getRandomValues(g); return g; } catch (e) {}
  for (let i = 0; i < 16; i++) g[i] = Math.floor(Math.random() * 256);
  return g;
}
function sameBytes(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function msg(type, spec) { return frame(encode([[1, 0, type], [type + 1, 2, encode(spec)]])); }
function str(v) { try { return v instanceof Uint8Array ? new TextDecoder().decode(v) : (v == null ? '' : String(v)); } catch (e) { return ''; } }
function u(f, k, d) { return (f && f[k] && f[k][0] != null && typeof f[k][0] === 'number') ? f[k][0] : d; }
function ids(f, k) {   // repeated uint32, packed or not
  const out = [];
  for (const e of (f && f[k]) || []) {
    if (typeof e === 'number') out.push(e);
    else if (e && e.length !== undefined) {
      let i = 0;
      while (i < e.length) { let s = 0, r = 0, b; do { b = e[i++]; r += (b & 0x7f) * Math.pow(2, s); s += 7; } while (b & 0x80 && i < e.length); out.push(r); }
    }
  }
  return out;
}

/** Nickname as the lobby will show it, or '' when unusable. */
export function cleanNick(raw) {
  // eslint-disable-next-line no-control-regex
  const s = String(raw || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!s || s.length > LIMITS.nameLen) return '';
  return s;
}

// Table name: the official server refuses a name whose first byte is not
// printable (isprint), so a leading space / emoji / accent is replaced.
function cleanGameName(raw) {
  // eslint-disable-next-line no-control-regex
  let s = String(raw || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 64);
  if (!s || !/^[\x21-\x7e]/.test(s)) s = 'Nearby' + (s ? ' ' + s : '');
  return s;
}

// The creator's NetGameInfo, re-encoded field by field (unknown wire types
// dropped) with a clean table name. Read into cfg the same way the training
// server does (offline/server.mjs _applyGameInfo, kept in step by hand).
function readGameInfo(gi) {
  const f = readFields(gi);
  const name = cleanGameName(str(f[1] && f[1][0]));
  const spec = [[1, 2, name]];
  for (const k of Object.keys(f).map(Number).sort((a, b) => a - b)) {
    if (k === 1) continue;
    for (const v of f[k]) spec.push([k, (typeof v === 'number') ? 0 : 2, v]);
  }
  const n = (k, d) => u(f, k, d);
  const cfg = { startMoney: 3000, smallBlind: 10, raiseEvery: 8, maxPlayers: 6, timeout: 30, gameName: name,
                raiseMode: 1, endRaiseMode: 1, endRaiseValue: 0, manualBlinds: [], guiSpeed: 5, delayHands: 2 };
  cfg.maxPlayers = Math.max(2, Math.min(LIMITS.seats, n(3, cfg.maxPlayers)));
  cfg.raiseMode = n(4, cfg.raiseMode) || 1;
  cfg.raiseEvery = (cfg.raiseMode === 2 ? n(6, cfg.raiseEvery) : n(5, cfg.raiseEvery)) || cfg.raiseEvery;
  cfg.endRaiseMode = n(7, cfg.endRaiseMode) || 1;
  cfg.endRaiseValue = n(8, cfg.endRaiseValue) || 0;
  cfg.guiSpeed = Math.max(1, Math.min(10, n(9, cfg.guiSpeed) || 5));
  cfg.delayHands = n(10, cfg.delayHands);
  cfg.timeout = n(11, cfg.timeout);
  cfg.smallBlind = Math.max(1, n(12, cfg.smallBlind));
  cfg.startMoney = Math.max(1, n(13, cfg.startMoney));
  cfg.manualBlinds = ids(f, 14).filter(v => Number.isInteger(v) && v > 0).sort((a, b) => a - b);
  return { info: encode(spec), cfg };
}

export class LocalServer {
  /**
   * @param {object} [opts]
   * @param {Array} [opts.botPool]   [name, avatar, archetype] entries (offline/index.mjs BOT_POOL)
   * @param {() => number} [opts.rng] game randomness (deck + bots); tests inject a seeded one
   * @param {{ set: (fn: Function, ms: number) => any, clear: (h: any) => void }} [opts.timers]
   * @param {string} [opts.botSkill] 'easy' | 'normal' | 'hard' | 'mixed'
   * @param {number} [opts.buildId]  when set, a player with another buildId is refused
   * @param {(snap: object) => void} [opts.onScoreboard] host-side hook, every board change
   * @param {() => Uint8Array} [opts.newGuid] session GUIDs (16 bytes; crypto by default, tests inject)
   */
  constructor(opts) {
    opts = opts || {};
    this.botPool = opts.botPool || [];
    this.rng = opts.rng || Math.random;
    this.timers = opts.timers || { set: (fn, ms) => setTimeout(fn, ms || 0), clear: (h) => clearTimeout(h) };
    this.botSkill = opts.botSkill || 'mixed';
    this.buildId = opts.buildId || 0;
    this.onScoreboard = typeof opts.onScoreboard === 'function' ? opts.onScoreboard : null;
    this.newGuid = typeof opts.newGuid === 'function' ? opts.newGuid : newGuid;
    /** @type {Map<number, any>} */ this.sessions = new Map();
    /** @type {Map<number, any>} */ this.humans = new Map();   // pid -> session
    /** @type {Map<number, any>} */ this.botInfo = new Map();  // pid -> { name, avatar }
    this.nextSid = 1; this.nextPid = 1; this.nextBot = BOT_ID_BASE + 1; this.nextGameId = 1;
    this.table = null;
    this.board = createScoreboard();
    this.stopped = false;
  }

  // ── Transport side ─────────────────────────────────────────────────────
  /**
   * A new connection. `link.send(frame)` delivers a framed message to that
   * player, `link.close()` hangs up. Returns the handle the transport feeds.
   * @param {{ send: (u8: Uint8Array) => void, close?: () => void }} link
   */
  attach(link) {
    const s = { sid: this.nextSid++, link, pid: 0, name: '', state: 'new', gameId: 0, alive: true };
    this.sessions.set(s.sid, s);
    this._to(s, T.Announce, [[1, 2, encode([[1, 0, 5], [2, 0, 1]])], [2, 2, encode([[1, 0, 2], [2, 0, 0]])],
      [3, 0, 0], [4, 0, 0], [5, 0, this.humans.size]]);
    return {
      id: s.sid,
      receive: (u8) => this._receive(s, u8),
      detach: () => this._drop(s),
    };
  }
  /** The host leaves: every table stops, every player is hung up. */
  stop() {
    if (this.stopped) return;
    for (const h of this.humans.values()) if (h.awayTimer) { this.timers.clear(h.awayTimer); h.awayTimer = null; }
    this._closeTable(false);
    for (const s of [...this.sessions.values()]) this._hangUp(s);
    this.stopped = true;
  }
  scoreboard() { return this.board.snapshot(); }

  // ── Plumbing ───────────────────────────────────────────────────────────
  _to(s, type, spec) {
    if (!s || !s.alive || this.stopped) return;
    try { s.link.send(msg(type, spec)); } catch (e) {}
  }
  _lobby(type, spec, except) { for (const s of this.sessions.values()) if (s.state === 'lobby' && s !== except) this._to(s, type, spec); }
  _seated(type, spec, except) {
    const tb = this.table; if (!tb) return;
    for (const pid of tb.seats) { const s = this.humans.get(pid); if (s && s !== except && s.gameId === tb.gameId && !s.awaitHand) this._to(s, type, spec); }
  }
  _later(fn, ms) { return this.timers.set(() => { if (!this.stopped) fn(); }, ms || 0); }
  _hangUp(s) {
    if (!s.alive) return;
    s.alive = false;
    try { if (s.link.close) s.link.close(); } catch (e) {}
  }
  _error(s, reason) { this._to(s, T.Error, [[1, 0, reason]]); this._hangUp(s); this.sessions.delete(s.sid); }
  _nameOf(pid) { const h = this.humans.get(pid); if (h) return h.name; const b = this.botInfo.get(pid); return b ? b.name : ''; }
  _isBot(pid) { return pid > BOT_ID_BASE; }

  _receive(s, u8) {
    if (this.stopped || !s.alive) return;
    let m;
    try { m = parseClientFrame(u8 instanceof Uint8Array ? u8 : new Uint8Array(u8)); } catch (e) { return; }
    const f = m.fields || {};
    if (s.state === 'new') { if (m.typeId === T.Init) this._onInit(s, f); return; }
    switch (m.typeId) {
      case T.PlayerInfoRequest: return this._onInfoReq(s, f);
      case T.JoinNew:           return this._onCreate(s, f);
      case T.JoinExisting:      return this._onJoin(s, f);
      case T.RejoinExisting:    return this._onRejoin(s, f);
      case T.LeaveGame:         return this._onLeave(s);
      case T.KickPlayer:        return this._onKick(s, f);
      case T.StartEvent:        return this._onStartRequest(s, f);
      case T.StartEventAck:     return this._onStartAck(s);
      case T.MyActionRequest:   return this._onAction(s, f);
      case T.ChatRequest:       return this._onChat(s, f);
      default: return;
    }
  }

  // ── Lobby ──────────────────────────────────────────────────────────────
  _onInit(s, f) {
    if (this.buildId && u(f, 2, 0) !== this.buildId) return this._error(s, ERR.versionNotSupported);
    const name = cleanNick(str(f[6] && f[6][0]));
    if (!name) return this._error(s, ERR.invalidName);
    const low = name.toLowerCase();
    const last = (f[3] && f[3][0] instanceof Uint8Array) ? f[3][0] : null;
    let back = null;
    for (const h of this.humans.values()) {
      if (h.name.toLowerCase() !== low) continue;
      // His own seat, kept while he was away: same nickname AND same GUID.
      if (h.away && sameBytes(last, h.guid)) { back = h; break; }
      return this._error(s, ERR.nameInUse);
    }
    if (!back && this.humans.size >= LIMITS.lobby) return this._error(s, ERR.serverFull);
    if (back) {
      if (back.awayTimer) { this.timers.clear(back.awayTimer); back.awayTimer = null; }
      s.pid = back.pid; s.name = back.name; s.guid = back.guid; s.rejoinGameId = back.gameId;
      s.away = true;                                // auto-play goes on until his rejoin
      // He must still ask for his seat (RejoinExistingGame); if he never
      // does, the seat is given up like any expired one.
      s.awayTimer = this._later(() => {
        s.awayTimer = null;
        if (!s.rejoinGameId || this.humans.get(s.pid) !== s) return;
        s.gameId = s.rejoinGameId; s.rejoinGameId = 0; s.away = false;
        this._leaveTable(s, LEFT.onRequest, false);
      }, GRACE_MS);
    } else {
      s.pid = this.nextPid++; s.name = name; s.guid = this.newGuid();
    }
    s.state = 'lobby';
    this.humans.set(s.pid, s);
    const ack = [[1, 2, s.guid], [2, 0, s.pid]];
    if (s.rejoinGameId) ack.push([4, 0, s.rejoinGameId]);
    this._to(s, T.InitAck, ack);
    for (const h of this.humans.values()) this._to(s, T.PlayerList, [[1, 0, h.pid], [2, 0, 0]]);
    for (const o of this.sessions.values()) if (o !== s && o.state === 'lobby') this._to(o, T.PlayerList, [[1, 0, s.pid], [2, 0, 0]]);
    if (this.table) this._to(s, T.GameListNew, this._listNewSpec());
    this._sendBoard(s);
  }
  _onInfoReq(s, f) {
    for (const pid of ids(f, 1)) {
      const h = this.humans.get(pid), b = this.botInfo.get(pid);
      if (h) this._to(s, T.PlayerInfoReply, [[1, 0, pid], [2, 2, encode([[1, 2, h.name], [2, 0, 1], [3, 0, 1]])]]);
      else if (b) this._to(s, T.PlayerInfoReply, [[1, 0, pid], [2, 2, encode([[1, 2, b.name], [2, 0, 0], [3, 0, 2]])]]);
      else this._to(s, T.PlayerInfoReply, [[1, 0, pid]]);
    }
  }
  _onChat(s, f) {
    let text = str(f[3] && f[3][0]);
    if (!text) return;
    if (text.length > LIMITS.chatLen) text = text.slice(0, LIMITS.chatLen);
    const target = u(f, 2, 0), game = u(f, 1, 0);
    if (target) {
      const t = this.humans.get(target); if (!t) return;
      const spec = [[2, 0, s.pid], [3, 0, CHAT.priv], [4, 2, text]];
      this._to(t, T.Chat, spec); if (t !== s) this._to(s, T.Chat, spec);
      return;
    }
    if (game) {
      const tb = this.table;
      if (!tb || tb.gameId !== game || s.gameId !== game) return;
      this._seated(T.Chat, [[1, 0, game], [2, 0, s.pid], [3, 0, CHAT.game], [4, 2, text]]);
      return;
    }
    for (const o of this.sessions.values()) if (o.state === 'lobby') this._to(o, T.Chat, [[2, 0, s.pid], [3, 0, CHAT.lobby], [4, 2, text]]);
  }
  _drop(s) {
    if (!this.sessions.has(s.sid)) return;
    this.sessions.delete(s.sid);
    s.alive = false;
    const mine = s.pid && this.humans.get(s.pid) === s;
    const tb = this.table, gid = s.gameId || s.rejoinGameId;
    const running = !!(mine && gid && tb && tb.gameId === gid && tb.started && !tb.over && tb.engine
      && (tb.engine.players.find(x => x.id === s.pid) || { in: false }).in);
    if (running) {
      // Keep the seat for a while: away, nickname reserved (see the header).
      s.away = true; s.awaitHand = false; s.gameId = gid; s.rejoinGameId = 0;
      if (tb.engine.h && tb.engine.h._pendingId === s.pid) this._autoAct(tb, s.pid, 0);
      s.awayTimer = this._later(() => this._awayExpired(s), GRACE_MS);
      this._lobby(T.PlayerList, [[1, 0, s.pid], [2, 0, 1]]);
      return;
    }
    if (s.gameId) this._leaveTable(s, LEFT.onRequest, false);
    if (mine) {
      this.humans.delete(s.pid);
      this._lobby(T.PlayerList, [[1, 0, s.pid], [2, 0, 1]]);
    }
  }
  _awayExpired(s) {
    s.awayTimer = null;
    if (this.humans.get(s.pid) !== s) return;       // he came back meanwhile
    this.humans.delete(s.pid);
    s.away = false;
    if (s.gameId) this._leaveTable(s, LEFT.onRequest, false);
  }
  // The away player's seat: check when free, else fold — after a short beat.
  _autoAct(tb, pid, delay) {
    const eng = tb.engine;
    if (tb.turnTimer) { this.timers.clear(tb.turnTimer); tb.turnTimer = null; }
    tb.turnTimer = this._later(() => {
      tb.turnTimer = null;
      if (this.table !== tb || tb.engine !== eng || tb.over || !eng.h || eng.h._pendingId !== pid) return;
      const toCall = eng.h.currentBet - (eng.h.streetCommit[pid] || 0);
      eng.act(pid, toCall > 0 ? ACT.FOLD : ACT.CHECK, 0);
    }, delay || 0);
  }
  // RejoinExistingGame after a seat recovery: the table again, from the next hand.
  _onRejoin(s, f) {
    const gid = u(f, 1, 0), tb = this.table;
    const ok = s.rejoinGameId && s.rejoinGameId === gid && tb && tb.gameId === gid && tb.started && !tb.over && tb.engine
      && tb.seats.includes(s.pid) && (tb.engine.players.find(x => x.id === s.pid) || { in: false }).in;
    if (!ok) { s.rejoinGameId = 0; s.away = false; return this._to(s, T.JoinGameFailed, [[1, 0, gid], [2, 0, 11]]); }
    const eng = tb.engine;
    if (s.awayTimer) { this.timers.clear(s.awayTimer); s.awayTimer = null; }
    s.rejoinGameId = 0; s.gameId = gid; s.awaitHand = true;     // table messages resume with the next HandStart
    this._to(s, T.JoinGameAck, [[1, 0, gid], [2, 0, tb.admin === s.pid ? 1 : 0], [3, 2, tb.info]]);
    for (const pid of tb.seats) this._to(s, T.GamePlayerJoined, [[1, 0, gid], [2, 0, pid], [3, 0, pid === tb.admin ? 1 : 0]]);
    const btn = eng.players[eng.button >= 0 ? eng.button : 0];
    const spec = [[1, 0, gid], [2, 0, btn ? btn.id : tb.seats[0]], [3, 0, eng.handNum]];
    for (const pid of tb.seats) {
      const p = eng.players.find(x => x.id === pid);
      spec.push([4, 2, encode([[1, 0, pid], [2, 0, p ? p.stack : 0]])]);
    }
    this._to(s, 39 /* GameStartRejoin */, spec);
  }

  // ── The table ──────────────────────────────────────────────────────────
  _listNewSpec() {
    const tb = this.table;
    return [[1, 0, tb.gameId], [2, 0, tb.started ? GAMEMODE.started : GAMEMODE.created], [3, 0, 0],
            [4, 2, packed(tb.seats)], [5, 0, tb.admin], [6, 2, tb.info]];
  }
  _onCreate(s, f) {
    if (s.gameId) return;
    const gi = (f[1] && f[1][0] instanceof Uint8Array) ? f[1][0] : null;
    if (this.table || !gi || gi.length > LIMITS.gameInfoBytes) {
      return this._to(s, T.JoinGameFailed, [[1, 0, this.table ? this.table.gameId : 0], [2, 0, JOINFAIL.invalidSettings]]);
    }
    const { info, cfg } = readGameInfo(gi);
    this.table = { gameId: this.nextGameId++, admin: s.pid, info, cfg, seats: [s.pid], started: false,
                   acks: new Set(), startTimer: null, engine: null, botCfg: {}, kickPending: new Set(),
                   turnTimer: null, roAcc: 0, before: {}, lineup: [], over: false };
    s.gameId = this.table.gameId;
    this._lobby(T.GameListNew, this._listNewSpec());
    this._to(s, T.JoinGameAck, [[1, 0, s.gameId], [2, 0, 1], [3, 2, info]]);
    this._to(s, T.GamePlayerJoined, [[1, 0, s.gameId], [2, 0, s.pid], [3, 0, 1]]);
  }
  _onJoin(s, f) {
    const tb = this.table, gid = u(f, 1, 0);
    if (s.gameId) return;
    if (!tb || tb.gameId !== gid) return this._to(s, T.JoinGameFailed, [[1, 0, gid], [2, 0, JOINFAIL.invalidGame]]);
    if (u(f, 4, 0)) return this._to(s, T.JoinGameFailed, [[1, 0, gid], [2, 0, JOINFAIL.noSpectators]]);
    if (tb.started || tb.startTimer) return this._to(s, T.JoinGameFailed, [[1, 0, gid], [2, 0, JOINFAIL.gameIsRunning]]);
    if (tb.seats.length >= tb.cfg.maxPlayers) return this._to(s, T.JoinGameFailed, [[1, 0, gid], [2, 0, JOINFAIL.gameIsFull]]);
    tb.seats.push(s.pid); s.gameId = gid;
    this._to(s, T.JoinGameAck, [[1, 0, gid], [2, 0, 0], [3, 2, tb.info]]);
    for (const pid of tb.seats) this._to(s, T.GamePlayerJoined, [[1, 0, gid], [2, 0, pid], [3, 0, pid === tb.admin ? 1 : 0]]);
    this._seated(T.GamePlayerJoined, [[1, 0, gid], [2, 0, s.pid], [3, 0, 0]], s);
    this._lobby(T.GameListPlayerJoined, [[1, 0, gid], [2, 0, s.pid]]);
  }
  _onLeave(s) { if (s.gameId) this._leaveTable(s, LEFT.onRequest, true); }

  // A human leaves the table (request, kick, dropped connection).
  _leaveTable(s, reason, tellHim) {
    const tb = this.table, gid = s.gameId;
    s.gameId = 0;
    if (!tb || tb.gameId !== gid) return;           // finished table: nothing left to do
    if (tellHim && reason === LEFT.kicked) this._to(s, T.RemovedFromGame, [[1, 0, gid], [2, 0, REMOVED.kicked]]);
    if (tb.started && tb.engine) {
      const r = tb.engine.removePlayer(s.pid);
      if (r === 'allin') tb.kickPending.add(s.pid);
    }
    if (!tb.started || !tb.kickPending.has(s.pid)) tb.seats = tb.seats.filter(p => p !== s.pid);
    tb.acks.delete(s.pid);
    this._seated(T.GamePlayerLeft, [[1, 0, gid], [2, 0, s.pid], [3, 0, reason]]);
    this._lobby(T.GameListPlayerLeft, [[1, 0, gid], [2, 0, s.pid]]);
    if (this.table !== tb) return;                  // the removal ended the game
    const humansLeft = tb.seats.filter(p => !this._isBot(p) && this.humans.has(p) && this.humans.get(p).gameId === gid);
    if (!humansLeft.length) { this._closeTable(true); return; }
    if (tb.admin === s.pid) {
      tb.admin = humansLeft[0];
      this._seated(T.GameAdminChanged, [[1, 0, gid], [2, 0, tb.admin]]);
      this._lobby(T.GameListAdminChanged, [[1, 0, gid], [2, 0, tb.admin]]);
    }
    if (!tb.started) this._maybeStart(tb);          // a pending start no longer waits for him
  }
  _onKick(s, f) {
    const tb = this.table, pid = u(f, 2, 0);
    if (!tb || s.gameId !== tb.gameId || tb.admin !== s.pid || !pid || pid === s.pid || !tb.seats.includes(pid)) return;
    if (!this._isBot(pid)) {
      if (tb.started) return;                       // humans: only before the start
      const h = this.humans.get(pid); if (h) this._leaveTable(h, LEFT.kicked, true);
      return;
    }
    if (!tb.started || !tb.engine) { this._dropBot(tb, pid); return; }
    const r = tb.engine.removePlayer(pid);
    if (r === 'allin') { tb.kickPending.add(pid); return; }
    this._dropBot(tb, pid);
  }
  _dropBot(tb, pid) {
    if (tb.engine) { const ep = tb.engine.players.find(x => x.id === pid); if (ep) ep.in = false; }
    tb.seats = tb.seats.filter(p => p !== pid);
    delete tb.botCfg[pid];
    this._seated(T.GamePlayerLeft, [[1, 0, tb.gameId], [2, 0, pid], [3, 0, LEFT.kicked]]);
    this._lobby(T.GameListPlayerLeft, [[1, 0, tb.gameId], [2, 0, pid]]);
  }
  _applyPending(tb) {
    if (!tb.kickPending.size) return;
    for (const pid of [...tb.kickPending]) {
      tb.kickPending.delete(pid);
      if (this._isBot(pid)) this._dropBot(tb, pid);
      else tb.seats = tb.seats.filter(p => p !== pid);
    }
  }

  _pickBot(tb) {
    const used = new Set();
    for (const pid of tb.seats) used.add(this._nameOf(pid).toLowerCase());
    for (const h of this.humans.values()) used.add(h.name.toLowerCase());
    let skill = this.botSkill;
    if (skill !== 'easy' && skill !== 'normal' && skill !== 'hard') {
      const r = this.rng(); skill = r < 0.30 ? 'easy' : (r < 0.80 ? 'normal' : 'hard');
    }
    const style = pickArchetype(this.rng);
    const id = this.nextBot++;
    let name = 'Bot ' + (id - BOT_ID_BASE), avatar = '🤖';
    if (this.botPool.length) {
      const free = this.botPool.filter(b => !used.has(String(b[0]).toLowerCase()));
      const match = free.filter(b => b[2] === style.arch);
      const pool = match.length ? match : (free.length ? free : this.botPool);
      const picked = pool[Math.floor(this.rng() * pool.length)];
      name = String(picked[0]); avatar = picked[1];
      if (used.has(name.toLowerCase())) name = name + ' ' + (id - BOT_ID_BASE);
    }
    this.botInfo.set(id, { name, avatar });
    tb.botCfg[id] = { aggr: style.aggr, rng: this.rng, skill, arch: style.arch, callMargin: style.callMargin,
      bluffMul: style.bluffMul, entryEq: style.entryEq, openMul: style.openMul,
      _barrelOn: (skill !== 'easy') && (style.arch !== 'station'), _barrels: 0, _barrelStreet: null, _hadDraw: false };
    return id;
  }
  _onStartRequest(s, f) {
    const tb = this.table;
    if (!tb || tb.started || tb.startTimer || s.gameId !== tb.gameId || tb.admin !== s.pid) return;
    if (u(f, 3, 0)) {
      while (tb.seats.length < tb.cfg.maxPlayers) {
        const id = this._pickBot(tb);
        tb.seats.push(id);
        this._seated(T.GamePlayerJoined, [[1, 0, tb.gameId], [2, 0, id], [3, 0, 0]]);
        this._lobby(T.GameListPlayerJoined, [[1, 0, tb.gameId], [2, 0, id]]);
      }
    }
    if (tb.seats.length < 2) return;
    tb.acks = new Set();
    // Armed BEFORE the StartEvent goes out: an ack may come back at once.
    tb.startTimer = this._later(() => { tb.startTimer = null; this._begin(tb); }, START_ACK_WAIT_MS);
    this._seated(T.StartEvent, [[1, 0, tb.gameId], [2, 0, 0], [3, 0, 0]]);
  }
  _onStartAck(s) {
    const tb = this.table;
    if (!tb || tb.started || !tb.startTimer || s.gameId !== tb.gameId) return;
    tb.acks.add(s.pid);
    this._maybeStart(tb);
  }
  _maybeStart(tb) {
    if (!tb.startTimer) return;
    const humans = tb.seats.filter(p => !this._isBot(p));
    if (humans.every(p => tb.acks.has(p))) { this.timers.clear(tb.startTimer); tb.startTimer = null; this._begin(tb); }
  }
  _begin(tb) {
    if (this.table !== tb || tb.started) return;
    if (tb.seats.length < 2) return;
    tb.started = true;
    const G = tb.gameId;
    this._seated(T.GameStartInitial, [[1, 0, G], [2, 0, tb.seats[0]], [3, 2, packed(tb.seats)]]);
    this._lobby(T.GameListUpdate, [[1, 0, G], [2, 0, GAMEMODE.started]]);
    tb.lineup = tb.seats.filter(p => !this._isBot(p)).map(p => this._nameOf(p));
    if (this.board.startGame(tb.lineup)) this._boardChanged();
    const ps = tb.seats.map(p => ({ id: p, name: this._nameOf(p), isBot: this._isBot(p), stack: tb.cfg.startMoney }));
    tb.engine = new OfflineTable({ players: ps, smallBlind: tb.cfg.smallBlind, raiseEvery: tb.cfg.raiseEvery,
      raiseMode: tb.cfg.raiseMode, endRaiseMode: tb.cfg.endRaiseMode, endRaiseValue: tb.cfg.endRaiseValue,
      manualBlinds: tb.cfg.manualBlinds, rng: this.rng, gameId: G, onEvent: (ev) => this._onEngine(tb, ev) });
    const eng = tb.engine;
    this._later(() => { if (this.table === tb && tb.engine === eng) eng.start(); }, 300);
  }
  // The game is over (or every human is gone): the table closes, the lobby
  // forgets it, and a new one may be created.
  _closeTable(tellLobby) {
    const tb = this.table; if (!tb) return;
    tb.over = true;
    if (tb.turnTimer) { this.timers.clear(tb.turnTimer); tb.turnTimer = null; }
    if (tb.startTimer) { this.timers.clear(tb.startTimer); tb.startTimer = null; }
    for (const pid of tb.seats) {
      const h = this.humans.get(pid);
      if (!h) continue;
      if (h.gameId === tb.gameId) h.gameId = 0;
      if (h.rejoinGameId === tb.gameId) { h.rejoinGameId = 0; h.away = false; }
      h.awaitHand = false;
      if (!h.alive) {                               // away when the game ended: his name is free again
        if (h.awayTimer) { this.timers.clear(h.awayTimer); h.awayTimer = null; }
        this.humans.delete(pid);
      }
    }
    this.table = null;
    if (tellLobby) this._lobby(T.GameListUpdate, [[1, 0, tb.gameId], [2, 0, GAMEMODE.closed]]);
  }

  // ── Play ───────────────────────────────────────────────────────────────
  _onAction(s, f) {
    const tb = this.table;
    if (!tb || !tb.engine || tb.over || s.gameId !== tb.gameId) return;
    const action = u(f, 4, 0), relBet = u(f, 5, 0);
    const h = tb.engine.h;
    if (!h || h._pendingId !== s.pid) {
      this._to(s, T.YourActionRejected, [[1, 0, tb.gameId], [2, 0, h ? (GS[h.street] || 0) : 0], [3, 0, action], [4, 0, relBet], [5, 0, 2]]);
      return;
    }
    let a, amt;
    if (action === NPA.fold) a = ACT.FOLD;
    else if (action === NPA.check || action === NPA.call) a = ACT.CALL;
    else { a = ACT.RAISE; amt = relBet; }
    if (tb.turnTimer) { this.timers.clear(tb.turnTimer); tb.turnTimer = null; }
    tb.engine.act(s.pid, a, amt);
  }

  _onEngine(tb, ev) {
    if (this.stopped || this.table !== tb || tb.over) return;
    const G = tb.gameId, eng = tb.engine;
    switch (ev.type) {
      case 'handStart': {
        tb.roAcc = 0;
        for (const id in tb.botCfg) { const c = tb.botCfg[id]; if (c) { c._barrels = 0; c._barrelStreet = null; c._hadDraw = false; } }
        tb.before = {};
        for (const st of ev.seats) tb.before[st.id] = st.stack + ((eng.h && eng.h.committed[st.id]) || 0);
        for (const pid of tb.seats) {
          const s = this.humans.get(pid);
          if (s && s.alive && s.awaitHand && s.gameId === G) { s.awaitHand = false; s.away = false; }
        }
        for (const pid of tb.seats) {
          const s = this.humans.get(pid);
          if (!s || s.gameId !== G) continue;
          const hole = ev.holeByPlayer[pid];
          const spec = [[1, 0, G]];
          if (hole) spec.push([2, 2, encode([[1, 0, hole[0]], [2, 0, hole[1]]])]);
          spec.push([4, 0, ev.sb]);
          for (const p of tb.seats) {
            const inGame = (eng.players.find(x => x.id === p) || { in: false }).in;
            const hs = this.humans.get(p);
            spec.push([5, 0, !inGame ? 2 : (hs && hs.away) ? 1 : 0]);
          }
          spec.push([6, 0, ev.dealerId]);
          this._to(s, T.HandStart, spec);
        }
        break;
      }
      case 'blindPosted':
        this._seated(T.PlayersActionDone, [[1, 0, G], [2, 0, ev.playerId], [3, 0, GS.preflop], [4, 0, 0],
          [5, 0, ev.totalStreetBet], [6, 0, ev.stack], [7, 0, ev.currentBet], [8, 0, ev.minRaise]]);
        break;
      case 'turn': {
        tb.roAcc = 0;
        if (tb.turnTimer) { this.timers.clear(tb.turnTimer); tb.turnTimer = null; }
        const sp = tb.cfg.guiSpeed || 5;
        const gap = Math.max(450, 900 - sp * 45);
        const turnSpec = [[1, 0, G], [2, 0, ev.playerId], [3, 0, GS[ev.gameState]]];
        this._later(() => { if (this.table === tb && !tb.over) this._seated(T.PlayersTurn, turnSpec); }, gap);
        const who = ev.isBot ? null : this.humans.get(ev.playerId);
        if (!ev.isBot && (!who || who.away || who.awaitHand || !who.alive)) {
          this._autoAct(tb, ev.playerId, gap);       // away: check or fold, no waiting
        } else if (ev.isBot) {
          const r = this.rng();
          const d = decide(ev, tb.botCfg[ev.playerId]);
          const base = Math.max(750, 1900 - sp * 100);
          const mult = (d.action === 'fold' || d.action === 'check') ? 0.7 : (d.action === 'raise') ? 1.5 : 1.05;
          const think = Math.max(650, Math.min(4000, Math.round(base * mult + r * base * 0.6)));
          this._later(() => { if (this.table === tb && tb.engine === eng && !tb.over) eng.act(ev.playerId, d.action, d.amountTo); }, gap + think);
        } else {
          // A human: the table's timeout, counted after the gap, then check
          // if free, else fold — like a real server. A player who already
          // left (all-in, kept for the showdown) never gets a turn.
          const to = (tb.cfg.timeout > 0 ? tb.cfg.timeout : 15);
          const canCheck = !!(ev.legal && ev.legal.canCheck);
          const pid = ev.playerId;
          tb.turnTimer = this._later(() => {
            tb.turnTimer = null;
            if (this.table === tb && tb.engine === eng && !tb.over) eng.act(pid, canCheck ? ACT.CHECK : ACT.FOLD, 0);
          }, gap + to * 1000);
        }
        break;
      }
      case 'actionDone':
        this._seated(T.PlayersActionDone, [[1, 0, G], [2, 0, ev.playerId], [3, 0, GS[ev.gameState]], [4, 0, NPA[ev.action] || 0],
          [5, 0, ev.totalStreetBet], [6, 0, ev.stack], [7, 0, ev.currentBet], [8, 0, ev.minRaise]]);
        break;
      case 'dealFlop':  this._board(tb, T.DealFlop, [[1, 0, G], [2, 0, ev.cards[0]], [3, 0, ev.cards[1]], [4, 0, ev.cards[2]]], ev.runOut); break;
      case 'dealTurn':  this._board(tb, T.DealTurn, [[1, 0, G], [2, 0, ev.card]], ev.runOut); break;
      case 'dealRiver': this._board(tb, T.DealRiver, [[1, 0, G], [2, 0, ev.card]], ev.runOut); break;
      case 'showdown': {
        const spec = [[1, 0, G]];
        for (const r of ev.results) {
          const p = eng.players.find(x => x.id === r.playerId);
          spec.push([2, 2, encode([[1, 0, r.playerId], [2, 0, r.cards[0]], [3, 0, r.cards[1]], [5, 0, r.won], [6, 0, p ? p.stack : 0]])]);
        }
        if (ev.runOut) { tb.roAcc += this._roStep(tb); this._later(() => { if (this.table === tb) this._seated(T.EndOfHandShow, spec); }, tb.roAcc); }
        else this._seated(T.EndOfHandShow, spec);
        break;
      }
      case 'endOfHandHide':
        this._seated(T.EndOfHandHide, [[1, 0, G], [2, 0, ev.playerId], [3, 0, ev.moneyWon], [4, 0, ev.playerMoney]]);
        break;
      case 'handComplete': {
        this._scoreHand(tb);
        if (!tb.seats.some(p => !this._isBot(p) && !tb.kickPending.has(p) && (eng.players.find(x => x.id === p) || {}).in)) {
          // No human still in the game: no point dealing bot-only hands.
          const live = eng.players.filter(p => p.in);
          let lead = live[0]; for (const p of live) if (p.stack > lead.stack) lead = p;
          this._gameOver(tb, lead ? lead.id : 0);
          break;
        }
        const dh = Math.max(600, Math.min(4000, (tb.cfg.delayHands || 2) * 380));
        const o = dh + tb.roAcc; tb.roAcc = 0;
        this._later(() => { if (this.table === tb && tb.engine === eng && !tb.over) { this._applyPending(tb); eng.nextHand(); } }, o);
        break;
      }
      case 'gameOver':
        this._scoreHand(tb);
        this._gameOver(tb, ev.winnerId || 0);
        break;
      default: break;
    }
  }
  _roStep(tb) { return Math.max(450, 1100 - (tb.cfg.guiSpeed || 5) * 70); }
  _board(tb, type, spec, runOut) {
    if (!runOut) { tb.roAcc = 0; this._seated(type, spec); return; }
    tb.roAcc += this._roStep(tb);
    this._later(() => { if (this.table === tb) this._seated(type, spec); }, tb.roAcc);
  }
  _gameOver(tb, winnerId) {
    if (tb.over) return;
    if (tb.turnTimer) { this.timers.clear(tb.turnTimer); tb.turnTimer = null; }
    const winner = this._nameOf(winnerId);
    for (const name of tb.lineup) this.board.recordGame(name, name === winner && !this._isBot(winnerId));
    this._boardChanged();
    const G = tb.gameId, wait = tb.roAcc + 200;
    // Announce the end after the last cards are out, then close the table.
    tb.over = true;
    this._later(() => {
      for (const pid of tb.seats) { const s = this.humans.get(pid); if (s && s.gameId === G) this._to(s, T.EndOfGame, [[1, 0, G], [2, 0, winnerId]]); }
      if (this.table === tb) this._closeTable(true);
    }, wait);
  }
  // Scoreboard: one hand for every human of the line-up who was dealt in.
  _scoreHand(tb) {
    const eng = tb.engine, h = eng && eng.h;
    if (!h || h._scored) return;
    h._scored = true;
    const res = h.results || [];
    let changed = false;
    for (const pid in tb.before) {
      const id = +pid; if (this._isBot(id)) continue;
      const name = this._nameOf(id); if (!name) continue;
      const p = eng.players.find(x => x.id === id);
      const delta = (p ? p.stack : 0) - tb.before[pid];
      const won = res.some(r => r.playerId === id && r.won > 0);
      this.board.recordHand(name, won, delta);
      changed = true;
    }
    if (changed) this._boardChanged();
  }

  // ── Scoreboard transport ───────────────────────────────────────────────
  _boardSpec() { return [[1, 2, JSON.stringify(this.board.snapshot())]]; }
  _sendBoard(s) { this._to(s, NEARBY_TYPE.Scoreboard, this._boardSpec()); }
  _boardChanged() {
    const spec = this._boardSpec();
    for (const s of this.sessions.values()) if (s.state === 'lobby') this._to(s, NEARBY_TYPE.Scoreboard, spec);
    if (this.onScoreboard) { try { this.onScoreboard(this.board.snapshot()); } catch (e) {} }
  }
}
