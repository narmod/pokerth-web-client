// ═══════════════════════════════════════════════════════════════════
// Tournament director — game tracker (prototype, 2026-10-23).
//
// Builds the final ranking of one table from what a SPECTATOR receives
// from the PokerTH server. Pure state machine: it consumes normalized
// events (the spectator client turns protobuf messages into them), so the
// same logic is replayed byte for byte in the tests.
//
// What the server sends to spectators (pokerth/pokerth@stable,
// src/net/servergamestate.cpp):
//   GameStartInitial  seat order (playerSeats), before hand 1
//   GameStartRejoin   seat order + cash of every seat, sent to a spectator
//                     who joins a RUNNING game, BEFORE the next hand is
//                     initialised: handNum is the last hand played and the
//                     cash is the stack at the start of the next hand
//   HandStart         one seatState per seat (same order); 2 = NoMoney is
//                     the server's own "eliminated" flag (myActiveStatus)
//   PlayersActionDone / EndOfHand*  current cash of a player
//   PlayerIdChanged   a player rejoined and got a new id
//   EndOfGame         the winner
// HandStartMessage carries no hand number: hands are counted here.
//
// Ranking rule — the one the BBC site applies to a log (get_player_list):
// the later a player was eliminated, the better; players eliminated in the
// same hand are ordered by their stack at the START of that hand, bigger
// first. Design: docs/TOURNAMENT_DIRECTOR.md (Trust).
// ═══════════════════════════════════════════════════════════════════

export const SEAT_NORMAL = 0;
export const SEAT_INACTIVE = 1;
export const SEAT_NO_MONEY = 2;

export class GameTracker {
  constructor() {
    this.gameId = null;
    this.gameName = '';
    this.startMoney = 0;
    this.maxPlayers = 0;
    this.names = new Map();     // playerId -> name
    this.seats = [];            // playerIds in seat order
    this.money = new Map();     // playerId -> last known cash
    this.hand = 0;              // number of the hand being played (0 = not started)
    this.startStacks = new Map();      // stacks at the start of hand startStacksHand
    this.startStacksHand = 0;
    this.elim = new Map();      // playerId -> { hand, stack, unknown }
    this.winnerId = null;
    this.started = false;
    this.finished = false;
    this.gaps = [];             // { fromHand, toHand } — hands we did not see
    this.notes = [];
  }

  // ── events ───────────────────────────────────────────────────────

  apply(ev) {
    switch (ev.type) {
      case 'gameInfo': return this._gameInfo(ev);
      case 'playerName': return this._playerName(ev);
      case 'gameStart': return this._gameStart(ev);
      case 'rejoin': return this._rejoin(ev);
      case 'handStart': return this._handStart(ev);
      case 'money': return this._money(ev);
      case 'idChange': return this._idChange(ev);
      case 'playerLeft': return this._playerLeft(ev);
      case 'endOfGame': return this._endOfGame(ev);
      case 'disconnected': return this._disconnected(ev);
      default: return null;
    }
  }

  _gameInfo(ev) {
    if (ev.gameId != null) this.gameId = ev.gameId;
    if (ev.name != null) this.gameName = String(ev.name);
    if (ev.startMoney != null) this.startMoney = ev.startMoney;
    if (ev.maxPlayers != null) this.maxPlayers = ev.maxPlayers;
  }

  _playerName(ev) {
    if (ev.id != null && ev.name) this.names.set(ev.id, String(ev.name));
  }

  _gameStart(ev) {
    this.started = true;
    this.hand = 0;
    this.seats = (ev.seats || []).slice();
    for (const id of this.seats) this.money.set(id, this.startMoney);
  }

  // A spectator joining a running game (first join, or after a reconnect).
  _rejoin(ev) {
    const handNum = ev.handNum | 0;
    const lastSeen = this.started ? this.hand : 0;
    if (handNum > lastSeen) this.gaps.push({ fromHand: lastSeen + 1, toHand: handNum });
    this.started = true;
    this.seats = (ev.players || []).map((p) => p.id);
    for (const p of ev.players || []) {
      this.money.set(p.id, p.money);
      if (p.money === 0 && !this.elim.has(p.id)) {
        // Out with no money left. If we saw the start of the last hand with
        // this player in it, he went out in that hand; otherwise it happened
        // while we were away and the hand is unknown.
        const seen = this.startStacksHand === handNum && handNum >= 1 && this.startStacks.has(p.id);
        this.elim.set(p.id, seen
          ? { hand: handNum, stack: this.startStacks.get(p.id), unknown: false }
          : { hand: null, stack: null, unknown: true });
      }
    }
    this.hand = handNum;
    // The cash sent with the rejoin is the stack at the start of the next
    // hand (the snapshot is taken before the server initialises it).
    this._pendingStacks = new Map(this.seats.map((id) => [id, this.money.get(id) || 0]));
  }

  _handStart(ev) {
    if (!this.started) { this.notes.push('handStart before gameStart'); this.started = true; }
    this.hand += 1;
    const states = ev.seatStates || [];
    // Players flagged NoMoney now were eliminated in the previous hand. The
    // stacks still held are those of the start of that hand, if we saw it.
    const prevHand = this.hand - 1;
    const seen = this.startStacksHand === prevHand && prevHand >= 1 ? this.startStacks : null;
    states.forEach((state, i) => {
      const id = this.seats[i];
      if (id == null || state !== SEAT_NO_MONEY || this.elim.has(id)) return;
      this.elim.set(id, seen && seen.has(id)
        ? { hand: prevHand, stack: seen.get(id), unknown: false }
        : { hand: prevHand >= 1 ? prevHand : null, stack: null, unknown: true });
    });
    const base = this._pendingStacks || this.money;
    this._pendingStacks = null;
    this.startStacks = new Map();
    states.forEach((state, i) => {
      const id = this.seats[i];
      if (id != null && state !== SEAT_NO_MONEY) this.startStacks.set(id, base.get(id) || 0);
    });
    this.startStacksHand = this.hand;
  }

  _money(ev) {
    if (ev.id != null && ev.money != null) this.money.set(ev.id, ev.money);
  }

  _idChange(ev) {
    const { oldId, newId } = ev;
    if (oldId == null || newId == null || oldId === newId) return;
    this.seats = this.seats.map((id) => (id === oldId ? newId : id));
    for (const m of [this.names, this.money, this.startStacks, this.elim]) {
      if (m.has(oldId)) { m.set(newId, m.get(oldId)); m.delete(oldId); }
    }
    if (this.winnerId === oldId) this.winnerId = newId;
  }

  _playerLeft(ev) {
    // Informational only: a player who leaves keeps his seat and stack; the
    // blinds take it until the server flags him NoMoney like anyone else.
    if (ev.id != null) this.notes.push('player ' + ev.id + ' left (' + (ev.reason || 'unknown') + ') in hand ' + this.hand);
  }

  _endOfGame(ev) {
    this.finished = true;
    this.winnerId = ev.winnerId != null ? ev.winnerId : null;
    // Everyone still in except the winner went out in the last hand.
    for (const id of this.seats) {
      if (id === this.winnerId || this.elim.has(id)) continue;
      const known = this.startStacksHand === this.hand && this.startStacks.has(id);
      this.elim.set(id, known
        ? { hand: this.hand, stack: this.startStacks.get(id), unknown: false }
        : { hand: this.hand || null, stack: null, unknown: true });
    }
  }

  _disconnected() {
    this.disconnectedAtHand = this.hand;
  }

  // ── result ───────────────────────────────────────────────────────

  ranking() {
    const seatIndex = new Map(this.seats.map((id, i) => [id, i]));
    const rows = this.seats.map((id) => {
      const e = this.elim.get(id);
      return {
        id,
        name: this.names.get(id) || '',
        seat: seatIndex.get(id),
        winner: id === this.winnerId,
        elimHand: e ? e.hand : null,
        stackAtHandStart: e ? e.stack : null,
        unknown: e ? !!e.unknown : false,
        alive: !e && id !== this.winnerId,
      };
    });
    const rank = (r) => (r.winner ? 3 : r.alive ? 2 : r.unknown ? 0 : 1);
    rows.sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(b) - rank(a);
      if (rank(a) !== 1) return a.seat - b.seat;
      if (a.elimHand !== b.elimHand) return b.elimHand - a.elimHand;
      if (a.stackAtHandStart !== b.stackAtHandStart) return b.stackAtHandStart - a.stackAtHandStart;
      return a.seat - b.seat;
    });
    // Flag exact ties (same hand, same starting stack): an organizer decides.
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1], b = rows[i];
      if (rank(a) === 1 && rank(b) === 1 && a.elimHand === b.elimHand && a.stackAtHandStart === b.stackAtHandStart) {
        a.tie = true; b.tie = true;
      }
    }
    rows.forEach((r, i) => { r.place = i + 1; delete r.seat; });
    return rows;
  }

  result() {
    const ranking = this.ranking();
    const incomplete = this.gaps.length > 0 || ranking.some((r) => r.unknown || r.tie);
    return {
      gameId: this.gameId,
      gameName: this.gameName,
      hands: this.hand,
      finished: this.finished,
      status: !this.finished ? 'running' : incomplete ? 'incomplete' : 'complete',
      gaps: this.gaps.slice(),
      winner: this.winnerId != null ? { id: this.winnerId, name: this.names.get(this.winnerId) || '' } : null,
      ranking,
    };
  }
}
