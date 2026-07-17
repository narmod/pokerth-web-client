// PokerTH web client — Hand recorder (.pdb-compatible model)
//
// Capture les mains depuis les événements protocole et les agrège dans le
// MÊME modèle que le log SQLite du client officiel (voir SPEC_PDB_LOG.md,
// LogVersion 1). But : alimenter le panneau stats natif + un export .pdb
// importable par pokerth-tracker (Ollika).
//
// Conception : module AUTONOME. pokerth.js n'appelle que des hooks optionnels
// window._handlog*(...). Si ce module n'est pas chargé, les hooks sont absents
// et le jeu tourne exactement comme avant (aucune régression possible).
//
// Encodage cartes : entiers bruts 0..51 (identiques protocole + log officiel).
// Aucune conversion.

// ── Constantes alignées sur le moteur/officiel ────────────────────────────
// BeRo : 0=preflop 1=flop 2=turn 3=river 4=showdown (= notre gameState + le
// showdown ajouté en fin de main).
const BERO = { preflop: 0, flop: 1, turn: 2, river: 3, showdown: 4 };

// Action numérique du protocole (PlayersActionDone.playerAction) → chaîne de
// log EXACTE du client officiel. 1=Fold 2=Check 3=Call 4=Bet 5=Raise 6=All-in.
// Bet ET Raise fusionnent en 'bets' (comme transformPlayerActionLog côté C++).
const ACTION_STR = {
  1: 'folds',
  2: 'checks',
  3: 'calls',
  4: 'bets',
  5: 'bets',
  6: 'is all in with',
};

// LogVersion du format .pdb officiel courant.
const LOG_VERSION = 1;

// ── État interne ──────────────────────────────────────────────────────────
// Un enregistreur = une SESSION (comme un fichier .pdb). On tient en mémoire
// la structure complète puis on la persiste (IndexedDB) et/ou on l'exporte.

function _now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
  };
}

class HandRecorder {
  constructor(opts = {}) {
    const t = _now();
    this.sessionId = opts.sessionId || (t.date + '_' + t.time.replace(/:/g, ''));
    // Callbacks optionnels de persistance (le store les branche ; le recorder
    // reste testable sans IndexedDB). Appelés au fil des événements.
    this.onGamePersist = opts.onGamePersist || null;   // (session, game, players)
    this.onHandPersist = opts.onHandPersist || null;   // (hand, actionsDeLaMain)
    this.session = {
      pokerthVersion: opts.version || 'web',
      date: t.date,
      time: t.time,
      logVersion: LOG_VERSION,
    };
    this.games = [];   // {uniqueGameID, gameID, startMoney, startSb, dealerPos, winnerSeat}
    this.players = []; // {uniqueGameID, seat, player}
    this.hands = [];   // voir _newHand()
    this.actions = []; // {actionID, handID, uniqueGameID, beRo, seat, action, amount}

    this._uniqueGameID = 0;   // compteur de session (démarre à 1 au 1er game)
    this._actionID = 0;       // AUTOINCREMENT
    this._curGame = null;
    this._curHand = null;
    this._round = BERO.preflop;
    // pid → seat(1..10) pour la partie courante ; posté par onGameStart.
    this._seatOfPid = {};
    // seat → { revealedThisHand:bool } pour gérer shows/has en run-out.
    this._revealed = {};
    // Suivi du "raise TO" par street pour convertir totalPlayerBet → montant loggé.
    // Le protocole donne totalPlayerBet (mise totale du joueur sur la street) ;
    // le log officiel écrit : calls = delta ajouté ; bets = total atteint (raise TO).
    this._streetBetOf = {}; // seat → dernier totalBet posté cette street
    this._streetHighest = 0; // plus haute mise atteinte cette street
  }

  // ── Nouvelle partie ──────────────────────────────────────────────────────
  // seatMap : Array de { pid, seat(1..10), name } pour les joueurs actifs.
  onGameStart({ gameID, startMoney, startSb, dealerSeat, seatMap }) {
    this._uniqueGameID += 1;
    const ug = this._uniqueGameID;
    this._curGame = {
      uniqueGameID: ug,
      gameID: gameID | 0,
      startMoney: startMoney | 0,
      startSb: startSb | 0,
      dealerPos: dealerSeat | 0,
      winnerSeat: null, // le client officiel ne le remplit pas
    };
    this.games.push(this._curGame);

    this._seatOfPid = {};
    (seatMap || []).forEach((s) => {
      this._seatOfPid[s.pid] = s.seat;
      this.players.push({ uniqueGameID: ug, seat: s.seat, player: s.name });
    });

    if (this.onGamePersist) {
      try {
        const gamePlayers = (seatMap || []).map((s) => ({ uniqueGameID: ug, seat: s.seat, player: s.name }));
        this.onGamePersist(this.session, this._curGame, gamePlayers);
      } catch (_e) {}
    }
  }

  // ── Nouvelle main ────────────────────────────────────────────────────────
  // stacks : { seat(1..10) → cash de début de main } (NULL pour siège inactif).
  // sbSeat/bbSeat/dealerSeat en base 1.
  onHandStart({ handID, dealerSeat, sbSeat, sbAmount, bbSeat, bbAmount, stacks }) {
    if (!this._curGame) return;
    this._round = BERO.preflop;
    this._revealed = {};
    this._streetBetOf = {};
    this._streetHighest = 0;

    const h = this._newHand(handID, dealerSeat, sbSeat, sbAmount, bbSeat, bbAmount, stacks);
    this._curHand = h;
    this._handActionStart = this.actions.length; // pour extraire les actions de CETTE main
    this.hands.push(h);

    // Chronologie officielle : dealer, puis SB, puis BB (heads-up : dealer==SB,
    // action loggée au siège SB). On reproduit à l'identique.
    const nActive = Object.values(stacks || {}).filter((v) => v != null).length;
    if (nActive === 2) {
      this._pushAction(sbSeat, 'starts as dealer', null);
    } else {
      this._pushAction(dealerSeat, 'starts as dealer', null);
    }
    if (sbAmount > 0) this._pushAction(sbSeat, 'posts small blind', sbAmount);
    if (bbAmount > 0) this._pushAction(bbSeat, 'posts big blind', bbAmount);
    // Les blinds occupent déjà le "highest" de la street preflop.
    if (sbAmount > 0) { this._streetBetOf[sbSeat] = sbAmount; }
    if (bbAmount > 0) { this._streetBetOf[bbSeat] = bbAmount; this._streetHighest = Math.max(this._streetHighest, bbAmount); }
  }

  _newHand(handID, dealerSeat, sbSeat, sbAmount, bbSeat, bbAmount, stacks) {
    const seatCols = {};
    for (let i = 1; i <= 10; i++) {
      seatCols['Seat_' + i + '_Cash'] = (stacks && stacks[i] != null) ? stacks[i] : null;
      seatCols['Seat_' + i + '_Card_1'] = null;
      seatCols['Seat_' + i + '_Card_2'] = null;
      seatCols['Seat_' + i + '_Hand_text'] = null;
      seatCols['Seat_' + i + '_Hand_int'] = null;
    }
    return {
      handID: handID | 0,
      uniqueGameID: this._curGame.uniqueGameID,
      dealerSeat: dealerSeat | 0,
      sbAmount: sbAmount | 0, sbSeat: sbSeat | 0,
      bbAmount: bbAmount | 0, bbSeat: bbSeat | 0,
      board: [null, null, null, null, null],
      ...seatCols,
    };
  }

  // ── Action d'un joueur ───────────────────────────────────────────────────
  // pid, actionCode (1..6), totalBet (=totalPlayerBet de la street), money(restant).
  onAction({ pid, actionCode, totalBet }) {
    if (!this._curHand) return;
    const seat = this._seatOfPid[pid];
    if (seat == null) return;
    const str = ACTION_STR[actionCode];
    if (!str) return;

    let amount = null;
    if (str === 'folds' || str === 'checks') {
      amount = null;
    } else if (str === 'calls') {
      // log officiel : jetons AJOUTÉS par ce call (delta sur la street).
      const prev = this._streetBetOf[seat] || 0;
      amount = Math.max(0, (totalBet | 0) - prev);
    } else if (str === 'bets') {
      // log officiel : mise TOTALE atteinte sur la street (raise TO).
      amount = totalBet | 0;
    } else if (str === 'is all in with') {
      // montant poussé = total sur la street (cohérent avec bets/call all-in).
      amount = totalBet | 0;
    }

    if (totalBet != null) {
      this._streetBetOf[seat] = totalBet | 0;
      this._streetHighest = Math.max(this._streetHighest, totalBet | 0);
    }
    this._pushAction(seat, str, amount);
  }

  // ── Distribution du board ────────────────────────────────────────────────
  onFlop(cards) { this._setRound(BERO.flop); this._setBoard(0, cards[0]); this._setBoard(1, cards[1]); this._setBoard(2, cards[2]); }
  onTurn(card)  { this._setRound(BERO.turn); this._setBoard(3, card); }
  onRiver(card) { this._setRound(BERO.river); this._setBoard(4, card); }

  _setRound(r) {
    this._round = r;
    // Nouvelle street : les mises sont collectées, on repart de 0.
    this._streetBetOf = {};
    this._streetHighest = 0;
  }

  _setBoard(idx, card) {
    if (!this._curHand) return;
    if (card != null && card >= 0 && card <= 51) this._curHand.board[idx] = card;
  }

  // Révélation anticipée (all-in run-out) : shows/has + cartes, sans winner.
  onRevealCards(reveals) {
    if (!this._curHand) return;
    (reveals || []).forEach((r) => {
      const seat = this._seatOfPid[r.pid];
      if (seat == null || r.card1 == null || r.card2 == null) return;
      this._curHand['Seat_' + seat + '_Card_1'] = r.card1;
      this._curHand['Seat_' + seat + '_Card_2'] = r.card2;
      const first = !this._revealed[seat];
      this._revealed[seat] = true;
      this._pushAction(seat, first ? 'shows' : 'has', null);
    });
  }

  // ── Showdown / fin de main ───────────────────────────────────────────────
  // results : Array de { pid, card1, card2, won(cash gagné), handText?, handInt? }
  // Le protocole ne fournit pas handText/handInt : on peut les remplir via
  // evaluateBestHand côté appelant si souhaité (facultatif — NULL sinon).
  onShowdown(results) {
    if (!this._curHand) return;
    this._round = BERO.showdown;

    const shown = [];
    (results || []).forEach((r) => {
      const seat = this._seatOfPid[r.pid];
      if (seat == null) return;
      if (r.card1 != null && r.card2 != null) {
        this._curHand['Seat_' + seat + '_Card_1'] = r.card1;
        this._curHand['Seat_' + seat + '_Card_2'] = r.card2;
        if (r.handText != null) this._curHand['Seat_' + seat + '_Hand_text'] = r.handText;
        if (r.handInt != null)  this._curHand['Seat_' + seat + '_Hand_int'] = r.handInt;
        const first = !this._revealed[seat];
        this._revealed[seat] = true;
        this._pushAction(seat, first ? 'shows' : 'has', null);
        shown.push(seat);
      }
    });

    // Gagnants en BeRo=4. Le client officiel logge les side pots d'abord
    // (`wins (side pot)`) puis le pot PRINCIPAL en dernier (`wins`) — et les
    // outils de stats prennent la 1re ligne `wins` comme gagnant du showdown.
    // Le protocole web ne distingue pas main/side pot : on reproduit la règle
    // en traitant le plus gros gain comme le pot principal, le reste en side.
    const winners = (results || [])
      .filter((r) => r.won > 0 && this._seatOfPid[r.pid] != null)
      .map((r) => ({ seat: this._seatOfPid[r.pid], won: r.won | 0 }));
    if (winners.length === 1) {
      this._pushAction(winners[0].seat, 'wins', winners[0].won);
    } else if (winners.length > 1) {
      // Gain max = pot principal (émis en dernier avec 'wins').
      let mainIdx = 0;
      for (let i = 1; i < winners.length; i++) if (winners[i].won > winners[mainIdx].won) mainIdx = i;
      winners.forEach((w, i) => { if (i !== mainIdx) this._pushAction(w.seat, 'wins (side pot)', w.won); });
      this._pushAction(winners[mainIdx].seat, 'wins', winners[mainIdx].won);
    }

    this._closeHand();
  }

  // Fin de main sans abattage (tout le monde s'est couché).
  // Le client officiel logge le `wins` au BeRo de la street atteinte. On accepte
  // un `round` explicite (gameState courant du client) ; sinon on garde
  // this._round, tenu à jour par les événements de board.
  onHandHideEnd({ pid, won, round }) {
    if (!this._curHand) return;
    if (round != null && round >= 0 && round <= 4) this._round = round;
    if (won > 0) {
      const seat = this._seatOfPid[pid];
      if (seat != null) this._pushAction(seat, 'wins', won | 0);
    }
    this._closeHand();
  }

  _closeHand() {
    // 'sits out' pour les stacks tombés à 0 est géré par onEliminated (dédup).
    const hand = this._curHand;
    if (hand && this.onHandPersist) {
      try {
        // Actions de cette main = toutes celles ajoutées depuis onHandStart,
        // plus d'éventuels 'sits out' qui référencent ce handID.
        const handActions = this.actions.slice(this._handActionStart);
        this.onHandPersist(hand, handActions);
      } catch (_e) {}
    }
    this._curHand = null;
    this._round = BERO.preflop;
  }

  // Élimination (stack 0) : 'sits out' une seule fois par (game, seat).
  onEliminated(pid) {
    const seat = this._seatOfPid[pid];
    if (seat == null || !this._curGame) return;
    const key = this._curGame.uniqueGameID + ':' + seat;
    this._sitOut = this._sitOut || new Set();
    if (this._sitOut.has(key)) return;
    this._sitOut.add(key);
    // BeRo courant au moment de l'élimination (souvent showdown).
    this._pushAction(seat, 'sits out', null, this._curHand ? this._curHand.handID : (this._lastHandID || 0));
  }

  // ── Bas niveau ───────────────────────────────────────────────────────────
  _pushAction(seat, action, amount, handIDOverride) {
    if (!this._curGame) return;
    const handID = handIDOverride != null
      ? handIDOverride
      : (this._curHand ? this._curHand.handID : (this._lastHandID || 0));
    if (this._curHand) this._lastHandID = this._curHand.handID;
    this._actionID += 1;
    this.actions.push({
      actionID: this._actionID,
      handID,
      uniqueGameID: this._curGame.uniqueGameID,
      beRo: this._round,
      seat: seat | 0,
      action,
      amount: amount == null ? null : (amount | 0),
    });
  }

  // Snapshot sérialisable (pour IndexedDB / debug / tests).
  toJSON() {
    return {
      session: this.session,
      games: this.games,
      players: this.players,
      hands: this.hands,
      actions: this.actions,
    };
  }
}


// PokerTH web client — Persistance IndexedDB de l'historique des mains.
//
// Stocke la session courante (modèle .pdb, voir SPEC_PDB_LOG.md) de façon
// incrémentale : à chaque main terminée, on écrit games/players/hands/actions
// dans une base IndexedDB. Survit aux rechargements. Sert de source au panneau
// stats et à l'export .pdb.
//
// Base : 'pth_handlog' · stores : meta, games, players, hands, actions.
// Clés composites encodées en string pour rester simples et déterministes.

const DB_NAME = 'pth_handlog';
const DB_VERSION = 1;

function _openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no-indexeddb')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('meta'))    db.createObjectStore('meta', { keyPath: 'k' });
      if (!db.objectStoreNames.contains('games'))   db.createObjectStore('games', { keyPath: 'id' });   // id = `${sessionId}:${uniqueGameID}`
      if (!db.objectStoreNames.contains('players')) db.createObjectStore('players', { keyPath: 'id' }); // id = `${sessionId}:${ug}:${seat}`
      if (!db.objectStoreNames.contains('hands'))   db.createObjectStore('hands', { keyPath: 'id' });   // id = `${sessionId}:${ug}:${handID}`
      if (!db.objectStoreNames.contains('actions')) db.createObjectStore('actions', { keyPath: 'id' }); // id = `${sessionId}:${actionID}`
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class HandStore {
  constructor() {
    this._db = null;
    this._ready = _openDb().then((db) => { this._db = db; }).catch(() => { this._db = null; });
  }

  async _tx(stores, mode, fn) {
    await this._ready;
    if (!this._db) return null;
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(stores, mode);
      const out = fn(tx);
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  // Écrit/écrase le méta de session (idempotent).
  async putSession(sessionId, session) {
    return this._tx(['meta'], 'readwrite', (tx) => {
      tx.objectStore('meta').put({ k: 'session:' + sessionId, session, sessionId });
    });
  }

  // Persiste une partie (idempotent sur son id).
  async putGame(sessionId, game) {
    return this._tx(['games'], 'readwrite', (tx) => {
      tx.objectStore('games').put({ id: sessionId + ':' + game.uniqueGameID, sessionId, ...game });
    });
  }

  async putPlayers(sessionId, players) {
    return this._tx(['players'], 'readwrite', (tx) => {
      const st = tx.objectStore('players');
      players.forEach((p) => st.put({ id: sessionId + ':' + p.uniqueGameID + ':' + p.seat, sessionId, ...p }));
    });
  }

  // Persiste une main complète + ses actions (appelé en fin de main).
  async putHandBundle(sessionId, hand, actions) {
    return this._tx(['hands', 'actions'], 'readwrite', (tx) => {
      tx.objectStore('hands').put({ id: sessionId + ':' + hand.uniqueGameID + ':' + hand.handID, sessionId, ...hand });
      const st = tx.objectStore('actions');
      actions.forEach((a) => st.put({ id: sessionId + ':' + a.actionID, sessionId, ...a }));
    });
  }

  async _all(store) {
    await this._ready;
    if (!this._db) return [];
    return new Promise((resolve, reject) => {
      const req = this._db.transaction([store], 'readonly').objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // Recharge tout l'historique (toutes sessions) sous forme de tables .pdb.
  async loadAll() {
    const [metas, games, players, hands, actions] = await Promise.all([
      this._all('meta'), this._all('games'), this._all('players'), this._all('hands'), this._all('actions'),
    ]);
    return { metas, games, players, hands, actions };
  }

  async clear() {
    return this._tx(['meta', 'games', 'players', 'hands', 'actions'], 'readwrite', (tx) => {
      ['meta', 'games', 'players', 'hands', 'actions'].forEach((s) => tx.objectStore(s).clear());
    });
  }
}



(function () {
  try {
    var store = new HandStore();
    var rec = new HandRecorder({
      version: (typeof window !== 'undefined' && window.BUILD_VERSION) ? ('web-' + window.BUILD_VERSION) : 'web',
      onGamePersist: function (session, game, players) { store.putSession(rec.sessionId, session); store.putGame(rec.sessionId, game); store.putPlayers(rec.sessionId, players); },
      onHandPersist: function (hand, actions) { store.putHandBundle(rec.sessionId, hand, actions); }
    });
    if (typeof window !== 'undefined') { window._handlog = rec; window._handlogStore = store; }
  } catch (_e) {}
})();
