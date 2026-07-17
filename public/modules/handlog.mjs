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
// Activation : option avancée pth_stats_track (ON par défaut). Désactivée →
// aucune capture (les hooks sortent immédiatement).
//
// Encodage cartes : entiers bruts 0..51 (identiques protocole + log officiel).
// Aucune conversion.

// Lecture de l'option d'activation (ON par défaut). Relue à chaque événement
// pour réagir immédiatement à un changement dans les options avancées.
function _trackingEnabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    const v = localStorage.getItem('pth_stats_track');
    return v === null ? true : v === '1';
  } catch (_e) { return true; }
}

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
    if (!_trackingEnabled()) { this._curGame = null; this._curHand = null; return; }
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
    if (!this._curGame || !_trackingEnabled()) return;
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
  // eliminated : Array de pid dont le stack final = 0 (nouvellement éliminés).
  // gameOverPid : pid du gagnant de la partie si elle se termine (sinon null).
  onShowdown(results, eliminated, gameOverPid) {
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

    this._emitWinners(results);
    this._emitEndOfHand(eliminated, gameOverPid);
    this._closeHand();
  }

  // Gagnants en BeRo=4. Le client officiel logge les side pots d'abord
  // (`wins (side pot)`) puis le pot PRINCIPAL en dernier (`wins`) — les outils
  // de stats prennent la 1re ligne `wins` comme gagnant du showdown. Le
  // protocole web ne distingue pas main/side pot : on traite le plus gros
  // gain comme le pot principal, le reste en side.
  _emitWinners(results) {
    const winners = (results || [])
      .filter((r) => r.won > 0 && this._seatOfPid[r.pid] != null)
      .map((r) => ({ seat: this._seatOfPid[r.pid], won: r.won | 0 }));
    if (winners.length === 1) {
      this._pushAction(winners[0].seat, 'wins', winners[0].won);
    } else if (winners.length > 1) {
      let mainIdx = 0;
      for (let i = 1; i < winners.length; i++) if (winners[i].won > winners[mainIdx].won) mainIdx = i;
      winners.forEach((w, i) => { if (i !== mainIdx) this._pushAction(w.seat, 'wins (side pot)', w.won); });
      this._pushAction(winners[mainIdx].seat, 'wins', winners[mainIdx].won);
    }
  }

  // sits out (éliminés, dédupliqué par partie) puis wins game (dernier
  // survivant) — après le `wins`, en BeRo courant (showdown). Ordre officiel.
  _emitEndOfHand(eliminated, gameOverPid) {
    this._sitOut = this._sitOut || new Set();
    (eliminated || []).forEach((pid) => {
      const seat = this._seatOfPid[pid];
      if (seat == null) return;
      const key = this._curGame.uniqueGameID + ':' + seat;
      if (this._sitOut.has(key)) return;
      this._sitOut.add(key);
      this._pushAction(seat, 'sits out', null);
    });
    if (gameOverPid != null) {
      this._gameOverDone = this._gameOverDone || new Set();
      const gk = this._curGame.uniqueGameID;
      if (!this._gameOverDone.has(gk)) {
        const seat = this._seatOfPid[gameOverPid];
        if (seat != null) { this._gameOverDone.add(gk); this._pushAction(seat, 'wins game', null); }
      }
    }
  }

  // Fin de main sans abattage (tout le monde s'est couché).
  // Le client officiel logge le `wins` au BeRo de la street atteinte. On accepte
  // un `round` explicite (gameState courant du client) ; sinon on garde
  // this._round, tenu à jour par les événements de board.
  onHandHideEnd({ pid, won, round, eliminated, gameOverPid }) {
    if (!this._curHand) return;
    if (round != null && round >= 0 && round <= 4) this._round = round;
    if (won > 0) {
      const seat = this._seatOfPid[pid];
      if (seat != null) this._pushAction(seat, 'wins', won | 0);
    }
    this._emitEndOfHand(eliminated, gameOverPid);
    this._closeHand();
  }

  _closeHand() {
    // 'sits out'/'wins game' sont émis dans _emitEndOfHand avant la fermeture.
    const hand = this._curHand;
    this._closedHand = hand;                 // pour un éventuel onGameOver tardif
    this._closedHandStart = this._handActionStart;
    if (hand && this.onHandPersist) {
      try {
        const handActions = this.actions.slice(this._handActionStart);
        this.onHandPersist(hand, handActions);
      } catch (_e) {}
    }
    this._curHand = null;
    this._round = BERO.preflop;
  }

  // Fin de partie signalée tardivement (message EndOfGame séparé) : rattache
  // `wins game` à la dernière main jouée, en BeRo=4, et re-persiste cette main.
  // Idempotent : ne réémet pas si déjà fait pour cette partie.
  onGameOver(pid) {
    if (!this._curGame || !this._closedHand) return;
    this._gameOverDone = this._gameOverDone || new Set();
    const gk = this._curGame.uniqueGameID;
    if (this._gameOverDone.has(gk)) return;
    const seat = this._seatOfPid[pid];
    if (seat == null) return;
    this._gameOverDone.add(gk);
    // Émettre en BeRo=4, rattaché au handID de la dernière main.
    const savedRound = this._round;
    this._round = BERO.showdown;
    this._actionID += 1;
    this.actions.push({
      actionID: this._actionID,
      handID: this._closedHand.handID,
      uniqueGameID: gk,
      beRo: BERO.showdown,
      seat: seat | 0,
      action: 'wins game',
      amount: null,
    });
    this._round = savedRound;
    // Re-persister la dernière main avec la ligne ajoutée.
    if (this.onHandPersist) {
      try {
        const handActions = this.actions.filter((a) => a.uniqueGameID === gk && a.handID === this._closedHand.handID);
        this.onHandPersist(this._closedHand, handActions);
      } catch (_e) {}
    }
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


// PokerTH web client — Calculateur de statistiques (port du tracker MCNCHEESYF
// v1.1.4, GPL-3.0, accord d'Ollika). Port fidèle ligne-à-ligne de
// src/stats/calculator.py + models.py. Voir SPEC_STATS.md.
//
// Entrée : tables au modèle .pdb (games/players/hands/actions) telles que
// produites par le recorder (handlog.mjs) et relues d'IndexedDB.
// Sortie : { playerName -> statsDict } identique à PlayerStats.to_dict().
//
// Aucune dépendance. Utilisable dans le navigateur ou en Node (tests).

const VPIP_ACTIONS = ['calls', 'bets', 'is all in with'];
const PFR_ACTIONS = ['bets', 'is all in with'];
const AGGRESSIVE_ACTIONS = ['bets', 'is all in with'];
const PASSIVE_ACTIONS = ['calls'];
const RAISE_ACTIONS = ['bets', 'is all in with'];
const FOLD_ACTIONS = ['folds'];
const SKIP_PATTERNS = ['blind', 'starts as dealer', 'shows', 'wins'];

const containsAny = (str, list) => { const l = (str || '').toLowerCase(); return list.some((x) => l.indexOf(x) !== -1); };
const isSkip = (str) => { const l = (str || '').toLowerCase(); return SKIP_PATTERNS.some((s) => l.indexOf(s) !== -1); };
// Python round() = banker's rounding (arrondi au pair) sur 1 décimale.
// Nécessaire pour parité exacte avec l'oracle (ex. 0.25 → 0.2, pas 0.3).
const round1 = (n) => {
  if (!isFinite(n)) return n;
  const x = n * 10;
  const floor = Math.floor(x);
  const diff = x - floor;
  let r;
  const EPS = 1e-9;
  if (Math.abs(diff - 0.5) < EPS) {
    r = (floor % 2 === 0) ? floor : floor + 1; // vers le pair
  } else {
    r = Math.round(x);
  }
  return r / 10;
};

// ── Index des données (équivalent du LogParser) ────────────────────────────
class StatsData {
  // tables : { games:[], players:[], hands:[], actions:[] } au modèle .pdb.
  constructor(tables) {
    this.games = tables.games || [];
    this.players = tables.players || [];
    this.hands = tables.hands || [];
    this.actions = tables.actions || [];

    // actions triées par actionID (ordre chronologique fiable)
    this._actions = this.actions.slice().sort((a, b) => (a.actionID | 0) - (b.actionID | 0));

    // index actions par (ug,hand,beRo) et par (ug,hand)
    this._byGHB = new Map();
    this._byGH = new Map();
    for (const a of this._actions) {
      const ug = a.uniqueGameID, h = a.handID, r = a.beRo;
      const kGH = ug + ':' + h;
      const kGHB = kGH + ':' + r;
      (this._byGHB.get(kGHB) || this._byGHB.set(kGHB, []).get(kGHB)).push(a);
      (this._byGH.get(kGH) || this._byGH.set(kGH, []).get(kGH)).push(a);
    }

    // Player → { game → seat }
    this._seatsOf = new Map();
    for (const p of this.players) {
      let m = this._seatsOf.get(p.player); if (!m) { m = new Map(); this._seatsOf.set(p.player, m); }
      m.set(p.uniqueGameID, p.seat);
    }

    // Hand → stacks (Seat_i_Cash) index
    this._handByGH = new Map();
    for (const h of this.hands) this._handByGH.set(h.uniqueGameID + ':' + h.handID, h);
  }

  getPlayers() { return Array.from(this._seatsOf.keys()); }
  getPlayerSeats(name) { return this._seatsOf.get(name) || new Map(); }

  getActions(ug, hand, beRo) {
    if (beRo != null) return this._byGHB.get(ug + ':' + hand + ':' + beRo) || [];
    return this._byGH.get(ug + ':' + hand) || [];
  }

  // Mains où le joueur a AGI (via table Action, siège du joueur dans la partie).
  getHandsPlayedByPlayer(name) {
    const seats = this.getPlayerSeats(name);
    const out = [];
    const seen = new Set();
    for (const a of this._actions) {
      const seat = seats.get(a.uniqueGameID);
      if (seat == null || a.seat !== seat) continue;
      const k = a.uniqueGameID + ':' + a.handID;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push([a.uniqueGameID, a.handID]);
    }
    return out;
  }

  // Stack de début de main pour le joueur : {"ug:hand" -> cash}.
  getPlayerHandStacks(name) {
    const seats = this.getPlayerSeats(name);
    const res = new Map();
    for (const h of this.hands) {
      const seat = seats.get(h.uniqueGameID);
      if (seat == null) continue;
      const cash = h['Seat_' + seat + '_Cash'];
      if (cash != null) res.set(h.uniqueGameID + ':' + h.handID, cash);
    }
    return res;
  }

  handHasShowdown(ug, hand) { return this.getActions(ug, hand, 4).length > 0; }

  getShowdownWinner(ug, hand) {
    const b4 = this.getActions(ug, hand, 4);
    for (const a of b4) if (a.action === 'wins') return a.seat;
    return null;
  }

  // Toutes les actions preflop (tous joueurs) pour une main.
  allPreflopActions(ug, hand) { return this.getActions(ug, hand, 0); }

  // Actions preflop du joueur.
  preflopActionsOfPlayer(name) {
    const seats = this.getPlayerSeats(name);
    return this._actions.filter((a) => a.beRo === 0 && a.seat === seats.get(a.uniqueGameID));
  }

  allActionsOfPlayer(name) {
    const seats = this.getPlayerSeats(name);
    return this._actions.filter((a) => a.seat === seats.get(a.uniqueGameID));
  }
}

// ── Calculateur ────────────────────────────────────────────────────────────
class StatsCalculator {
  constructor(data) { this.d = data; }

  calculatePlayerStats(name) {
    const d = this.d;
    const S = {
      name, total_hands: 0,
      vpip_hands: 0, pfr_hands: 0,
      total_bets: 0, total_calls: 0,
      three_bet_made: 0, three_bet_opportunities: 0,
      cbet_made: 0, cbet_opportunities: 0,
      fold_to_3bet_made: 0, fold_to_3bet_opportunities: 0,
      fold_to_cbet_made: 0, fold_to_cbet_opportunities: 0,
      hands_saw_flop: 0, hands_went_to_showdown: 0, showdowns_won: 0,
    };

    const handsPlayed = d.getHandsPlayedByPlayer(name);
    S.total_hands = handsPlayed.length;
    if (S.total_hands === 0) return this._finalize(S);

    const playerSeats = d.getPlayerSeats(name);
    const playerHandStacks = d.getPlayerHandStacks(name);

    // preflop du joueur groupé par main
    const preflopByHand = new Map();
    for (const a of d.preflopActionsOfPlayer(name)) {
      const k = a.uniqueGameID + ':' + a.handID;
      (preflopByHand.get(k) || preflopByHand.set(k, []).get(k)).push(a);
    }

    const pfrHands = [];

    for (const [k, actions] of preflopByHand) {
      let hasVpip = false, hasPfr = false;
      for (const a of actions) {
        const at = (a.action || '').toLowerCase();
        if (at.indexOf('blind') !== -1) continue;
        if (containsAny(at, VPIP_ACTIONS)) hasVpip = true;
        if (containsAny(at, PFR_ACTIONS)) hasPfr = true;
      }
      if (hasVpip) S.vpip_hands += 1;
      if (hasPfr) { S.pfr_hands += 1; pfrHands.push(k); }

      const [ug, hand] = k.split(':').map(Number);
      const seat = playerSeats.get(ug);
      if (seat != null) {
        const allPre = d.allPreflopActions(ug, hand);
        if (allPre.length) {
          const stack = playerHandStacks.has(k) ? playerHandStacks.get(k) : null;
          const tb = this._analyzeThreeBet(allPre, seat, stack);
          if (tb.opportunity) { S.three_bet_opportunities += 1; if (tb.made) S.three_bet_made += 1; }
        }
      }
    }

    // C-Bet + Fold to 3-Bet : sur les mains où le joueur a raise preflop
    for (const k of pfrHands) {
      const [ug, hand] = k.split(':').map(Number);
      const seat = playerSeats.get(ug);
      if (seat == null) continue;
      const cb = this._analyzeCbet(ug, hand, seat);
      if (cb.opportunity) { S.cbet_opportunities += 1; if (cb.made) S.cbet_made += 1; }
      const f3 = this._analyzeFoldTo3bet(d.allPreflopActions(ug, hand), seat);
      if (f3.opportunity) { S.fold_to_3bet_opportunities += 1; if (f3.folded) S.fold_to_3bet_made += 1; }
    }

    // Fold to C-Bet, WTSD, W$SD
    for (const [ug, hand] of handsPlayed) {
      const seat = playerSeats.get(ug);
      if (seat == null) continue;
      const flop = d.getActions(ug, hand, 1);
      const sawFlop = flop.some((a) => a.seat === seat);
      if (!sawFlop) continue;
      S.hands_saw_flop += 1;

      const fcb = this._analyzeFoldToCbet(ug, hand, seat, d.allPreflopActions(ug, hand));
      if (fcb.opportunity) { S.fold_to_cbet_opportunities += 1; if (fcb.folded) S.fold_to_cbet_made += 1; }

      if (d.handHasShowdown(ug, hand)) {
        const sd = d.getActions(ug, hand, 4);
        const atSd = sd.some((a) => a.seat === seat);
        if (atSd) {
          S.hands_went_to_showdown += 1;
          if (d.getShowdownWinner(ug, hand) === seat) S.showdowns_won += 1;
        }
      }
    }

    // AF : toutes les actions du joueur hors showdown
    for (const a of d.allActionsOfPlayer(name)) {
      if (a.beRo === 4) continue;
      const at = (a.action || '').toLowerCase();
      if (containsAny(at, AGGRESSIVE_ACTIONS)) S.total_bets += 1;
      if (containsAny(at, PASSIVE_ACTIONS)) S.total_calls += 1;
    }

    return this._finalize(S);
  }

  _analyzeThreeBet(allPre, playerSeat, playerStack) {
    const res = { opportunity: false, made: false };
    let lastIdx = -1, lastAmt = 0;
    for (let i = 0; i < allPre.length; i++) {
      const a = allPre[i];
      if (a.seat === playerSeat || isSkip(a.action)) continue;
      const at = (a.action || '').toLowerCase();
      if (!containsAny(at, RAISE_ACTIONS)) continue;
      const amt = a.amount || 0;
      const hasResp = allPre.slice(i + 1).some((x) => x.seat === playerSeat && !isSkip(x.action));
      if (!hasResp) continue;
      if (at.indexOf('is all in with') !== -1) {
        if (playerStack != null && playerStack <= amt) continue;
        const allinSeat = a.seat;
        const othersCan = allPre.slice(i + 1).some((x) => x.seat !== playerSeat && x.seat !== allinSeat && !isSkip(x.action));
        if (!othersCan) continue;
      }
      lastIdx = i; lastAmt = amt;
    }
    if (lastIdx === -1) return res;
    res.opportunity = true;
    for (const a of allPre.slice(lastIdx + 1)) {
      if (a.seat !== playerSeat || isSkip(a.action)) continue;
      if (containsAny((a.action || '').toLowerCase(), RAISE_ACTIONS)) {
        if ((a.amount || 0) > lastAmt) res.made = true;
      }
      break; // une seule action compte
    }
    return res;
  }

  _analyzeCbet(ug, hand, playerSeat) {
    const res = { opportunity: false, made: false };
    const flop = this.d.getActions(ug, hand, 1);
    if (!flop.length) return res;
    res.opportunity = true;
    for (const a of flop) {
      if (a.seat === playerSeat && containsAny((a.action || '').toLowerCase(), RAISE_ACTIONS)) { res.made = true; break; }
    }
    return res;
  }

  _analyzeFoldTo3bet(allPre, playerSeat) {
    const res = { opportunity: false, folded: false };
    let playerRaised = false, threeBet = false;
    for (const a of allPre) {
      const at = (a.action || '').toLowerCase();
      if (a.seat === playerSeat) {
        if (containsAny(at, RAISE_ACTIONS)) playerRaised = true;
        else if (playerRaised && threeBet && containsAny(at, FOLD_ACTIONS)) { res.folded = true; break; }
      } else if (playerRaised && containsAny(at, RAISE_ACTIONS)) {
        threeBet = true; res.opportunity = true;
      }
    }
    return res;
  }

  _analyzeFoldToCbet(ug, hand, playerSeat, allPre) {
    const res = { opportunity: false, folded: false };
    let raiserSeat = null;
    for (const a of allPre) {
      if (a.seat !== playerSeat && containsAny((a.action || '').toLowerCase(), RAISE_ACTIONS)) raiserSeat = a.seat;
    }
    if (raiserSeat == null) return res;
    const flop = this.d.getActions(ug, hand, 1);
    let cbet = false;
    for (const a of flop) {
      const at = (a.action || '').toLowerCase();
      if (a.seat === raiserSeat) { if (containsAny(at, RAISE_ACTIONS)) cbet = true; }
      else if (a.seat === playerSeat && cbet) {
        res.opportunity = true;
        if (containsAny(at, FOLD_ACTIONS)) res.folded = true;
        break;
      }
    }
    return res;
  }

  _finalize(S) {
    const pct = (n, d) => (d === 0 ? 0 : (n / d) * 100);
    const af = S.total_calls === 0 ? (S.total_bets > 0 ? Infinity : 0) : S.total_bets / S.total_calls;
    return {
      name: S.name,
      hands: S.total_hands,
      vpip: round1(pct(S.vpip_hands, S.total_hands)),
      pfr: round1(pct(S.pfr_hands, S.total_hands)),
      af: af === Infinity ? 'inf' : round1(af),
      three_bet: round1(pct(S.three_bet_made, S.three_bet_opportunities)),
      cbet: round1(pct(S.cbet_made, S.cbet_opportunities)),
      fold_to_3bet: round1(pct(S.fold_to_3bet_made, S.fold_to_3bet_opportunities)),
      fold_to_cbet: round1(pct(S.fold_to_cbet_made, S.fold_to_cbet_opportunities)),
      wtsd: round1(pct(S.hands_went_to_showdown, S.hands_saw_flop)),
      wsd: round1(pct(S.showdowns_won, S.hands_went_to_showdown)),
    };
  }

  calculateAllPlayersStats() {
    const out = {};
    for (const name of this.d.getPlayers()) out[name] = this.calculatePlayerStats(name);
    return out;
  }
}

// ── Range showdown (combos VPIP visibles) — port de range_window.py ─────────
const _CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const _POSITION_NAMES = {
  2: ['BTN', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'SB', 'BB', 'UTG'],
  5: ['BTN', 'SB', 'BB', 'UTG', 'CO'],
  6: ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'],
  7: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'HJ', 'CO'],
  8: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'HJ', 'CO'],
  9: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'HJ', 'CO'],
  10: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'HJ', 'CO'],
};

// Deux cartes brutes 0..51 → nom de combo (ex. 'AKs', 'TT', '76o').
function cardsToCombo(card1, card2) {
  let v1 = card1 % 13, s1 = Math.floor(card1 / 13);
  let v2 = card2 % 13, s2 = Math.floor(card2 / 13);
  if (v1 < v2) { const tv = v1; v1 = v2; v2 = tv; const ts = s1; s1 = s2; s2 = ts; }
  const r1 = _CARD_RANKS[v1], r2 = _CARD_RANKS[v2];
  if (v1 === v2) return r1 + r2;
  return r1 + r2 + (s1 === s2 ? 's' : 'o');
}

// Combos VPIP visibles au showdown d'un joueur → [{combo, position, nPlayers}].
function playerVpipCombos(data, name) {
  const seats = data.getPlayerSeats(name);
  if (seats.size === 0) return [];
  // mains où le joueur a VPIP preflop (call/bet/allin), à son siège
  const vpipHands = new Set();
  for (const a of data._actions) {
    if (a.beRo !== 0) continue;
    if (a.seat !== seats.get(a.uniqueGameID)) continue;
    if (a.action === 'calls' || a.action === 'bets' || a.action === 'is all in with') {
      vpipHands.add(a.uniqueGameID + ':' + a.handID);
    }
  }
  if (vpipHands.size === 0) return [];
  const out = [];
  for (const h of data.hands) {
    const key = h.uniqueGameID + ':' + h.handID;
    if (!vpipHands.has(key)) continue;
    const seat = seats.get(h.uniqueGameID);
    if (seat == null) continue;
    const c1 = h['Seat_' + seat + '_Card_1'], c2 = h['Seat_' + seat + '_Card_2'];
    if (c1 == null || c2 == null) continue;
    const occupied = [];
    for (let s = 1; s <= 10; s++) if (h['Seat_' + s + '_Cash'] != null) occupied.push(s);
    const nPlayers = occupied.length;
    const dealer = h.dealerSeat;
    let position = '?';
    if (occupied.indexOf(dealer) >= 0 && occupied.indexOf(seat) >= 0) {
      const di = occupied.indexOf(dealer), pi = occupied.indexOf(seat);
      const offset = ((pi - di) % nPlayers + nPlayers) % nPlayers;
      const names = _POSITION_NAMES[nPlayers];
      position = names ? names[offset] : ('P' + offset);
    }
    out.push({ combo: cardsToCombo(c1, c2), position, nPlayers });
  }
  return out;
}

// Couleur continue d'une stat selon sa valeur (dégradé vert→jaune→rouge).
// Chaque stat a sa plage [lo, hi] : sous lo = vert (bas), au-dessus hi = rouge
// (haut). Échelle visuelle par magnitude, cohérente entre HUD et panneau.
// Renvoie une couleur CSS (hsl) lisible sur thèmes sombres et clair, ou '' si
// non colorable (hands, valeur absente).
const _STAT_RANGES = {
  vpip: [12, 45], pfr: [5, 28], af: [0.5, 3.5], three_bet: [1.5, 10],
  cbet: [35, 80], fold_to_3bet: [30, 70], fold_to_cbet: [35, 75],
  wtsd: [20, 40], wsd: [42, 58],
};
function statColor(id, v) {
  if (v == null || id === 'hands') return '';
  const r = _STAT_RANGES[id];
  if (!r) return '';
  let n;
  if (v === 'inf' || v === Infinity) n = Infinity;
  else { n = (typeof v === 'number') ? v : parseFloat(v); if (isNaN(n)) return ''; }
  let t = (n === Infinity) ? 1 : (n - r[0]) / (r[1] - r[0]);
  t = Math.max(0, Math.min(1, t));
  const hue = Math.round(130 * (1 - t)); // 130 = vert → 0 = rouge (jaune ~65)
  return 'hsl(' + hue + ',64%,58%)';
}

// Combo d'une cellule (row,col) : diagonale = paires, haut-droite = suited,
// bas-gauche = offsuit.
function cellCombo(row, col) {
  const r1 = GRID_RANKS[row], r2 = GRID_RANKS[col];
  if (row === col) return r1 + r2;
  if (row < col) return r1 + r2 + 's';
  return r2 + r1 + 'o';
}


// PokerTH web client — Onglet Stats du panneau info (GameInfoPanel).
//
// Affiche les stats (VPIP/PFR/AF/3Bet/CBet/F3B/FCB/WTSD/W$SD) de tous les
// joueurs de la table, avec bascule Session courante / Historique cumulé.
// Lit les mains persistées via window._handlogStore et calcule via
// StatsCalculator (stats.mjs). Ne modifie pas le jeu.
//
// Dépend de : window._handlogStore (handlog.mjs), StatsData/StatsCalculator
// (assemblés dans le même module), et des globales du client exposées :
//   window._statsTablePlayers() → [{name}] joueurs de la table (fourni par le glue).

// Rendu paresseux : ne calcule que si l'onglet Stats est visible.
let _statsScope = 'session'; // 'session' | 'all'
try { const v = localStorage.getItem('pth_stats_scope'); if (v === 'all' || v === 'session') _statsScope = v; } catch (_e) {}

const _esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Construit les tables .pdb (modèle recorder) à partir du store, filtrées par
// portée. En session : uniquement la session courante du recorder.
async function _loadTables(scope) {
  const store = (typeof window !== 'undefined') ? window._handlogStore : null;
  if (!store) return { games: [], players: [], hands: [], actions: [] };
  const all = await store.loadAll();
  let games = all.games, players = all.players, hands = all.hands, actions = all.actions;
  if (scope === 'session') {
    const sid = (window._handlog && window._handlog.sessionId) || null;
    if (sid) {
      const keep = (r) => r.sessionId === sid;
      games = games.filter(keep); players = players.filter(keep);
      hands = hands.filter(keep); actions = actions.filter(keep);
    }
  }
  return { games, players, hands, actions };
}

// Colonnes du tableau (clé de stat, libellé court, titre).
const COLS = [
  ['hands', 'N', 'Mains jouées'],
  ['vpip', 'VPIP', 'Voluntarily Put $ In Pot'],
  ['pfr', 'PFR', 'Pre-Flop Raise'],
  ['af', 'AF', 'Aggression Factor'],
  ['three_bet', '3B', '3-Bet %'],
  ['cbet', 'CB', 'Continuation Bet %'],
  ['fold_to_3bet', 'F3B', 'Fold to 3-Bet %'],
  ['fold_to_cbet', 'FCB', 'Fold to C-Bet %'],
  ['wtsd', 'WTSD', 'Went To Showdown %'],
  ['wsd', 'W$SD', 'Won $ at Showdown %'],
];

function _fmt(key, v) {
  if (v == null) return '–';
  if (key === 'hands') return String(v);
  if (key === 'af') return v === 'inf' ? '∞' : String(v);
  return v + '%';
}

// Option d'activation du tracking (ON par défaut) — pilote capture ET onglet.
function _statsEnabled() {
  try {
    if (typeof localStorage === 'undefined') return true;
    const v = localStorage.getItem('pth_stats_track');
    return v === null ? true : v === '1';
  } catch (_e) { return true; }
}

// Affiche/masque le bouton d'onglet Stats selon l'option. Si masqué et que
// l'onglet courant était 'stats', on bascule sur l'Historique.
function syncStatsTab() {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('gip-tab-stats');
  const on = _statsEnabled();
  if (btn) btn.style.display = on ? '' : 'none';
  if (!on) {
    let tab = 'log'; try { tab = localStorage.getItem('pth_gip_tab') || 'log'; } catch (_e) {}
    if (tab === 'stats') { try { if (typeof window.gipShowTab === 'function') window.gipShowTab('log'); } catch (_e) {} }
    const body = document.getElementById('g-stats-body');
    if (body) { body.style.display = 'none'; body.innerHTML = ''; body._built = false; }
  }
}
if (typeof window !== 'undefined') window._syncStatsTab = syncStatsTab;

// Rendu principal — exposé en window._renderStats().
async function renderStatsPanel() {
  if (!_statsEnabled()) { syncStatsTab(); return; }
  const el = (typeof document !== 'undefined') ? document.getElementById('g-stats-body') : null;
  if (!el) return;
  // N'agir que si le panneau est ouvert sur l'onglet stats.
  const panel = document.getElementById('g-log-panel');
  const open = !!(panel && panel.style.display !== 'none');
  let tab = 'log'; try { tab = localStorage.getItem('pth_gip_tab') || 'log'; } catch (_e) {}
  if (!open || tab !== 'stats') return;
  el.style.display = '';

  // Joueurs de la table (fournis par le glue du client).
  let tablePlayers = [];
  try { if (typeof window._statsTablePlayers === 'function') tablePlayers = window._statsTablePlayers() || []; } catch (_e) {}
  const tableNames = new Set(tablePlayers.map((p) => p.name));

  // En-tête : bascule de portée + export.
  const scopeBtns =
    '<div class="stats-scope">'
    + '<button type="button" class="stats-scope-btn' + (_statsScope === 'session' ? ' on' : '') + '" data-scope="session">Session</button>'
    + '<button type="button" class="stats-scope-btn' + (_statsScope === 'all' ? ' on' : '') + '" data-scope="all">Historique</button>'
    + '<button type="button" class="stats-export-btn" data-export="1" title="Exporter en .pdb (importable dans PokerTH Tracker)">⤓ .pdb</button>'
    + '</div>';

  if (!el._built) { el.innerHTML = '<div class="odds-hd">Stats</div>' + scopeBtns + '<div class="stats-wait">…</div>'; el._built = true; }

  const tables = await _loadTables(_statsScope);
  let statsByName = {};
  try {
    const data = new StatsData(tables);
    const calc = new StatsCalculator(data);
    statsByName = calc.calculateAllPlayersStats();
  } catch (_e) { statsByName = {}; }

  // Lignes : joueurs de la table d'abord (ordre de la table), puis rien d'autre.
  const rowsFor = tablePlayers.length
    ? tablePlayers.map((p) => p.name)
    : Object.keys(statsByName);

  let head = '<tr><th class="stats-name"></th>';
  for (const [, lbl, title] of COLS) head += '<th title="' + _esc(title) + '">' + _esc(lbl) + '</th>';
  head += '</tr>';

  let body = '';
  for (const name of rowsFor) {
    const s = statsByName[name];
    body += '<tr><td class="stats-name" title="' + _esc(name) + '">' + _esc(name) + '</td>';
    for (const [key] of COLS) {
      if (!s) { body += '<td>–</td>'; continue; }
      const col = statColor(key, s[key]);
      body += '<td' + (col ? ' style="color:' + col + '"' : '') + '>' + _esc(_fmt(key, s[key])) + '</td>';
    }
    body += '</tr>';
  }
  if (!body) body = '<tr><td class="stats-empty" colspan="' + (COLS.length + 1) + '">Aucune donnée pour le moment.</td></tr>';

  el.innerHTML = '<div class="odds-hd">Stats</div>' + scopeBtns
    + '<div class="stats-scroll"><table class="stats-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';

  // Brancher les boutons de portée.
  const btns = el.querySelectorAll('.stats-scope-btn');
  btns.forEach((b) => {
    b.onclick = () => {
      const sc = b.getAttribute('data-scope');
      if (sc && sc !== _statsScope) {
        _statsScope = sc;
        try { localStorage.setItem('pth_stats_scope', sc); } catch (_e) {}
        renderStatsPanel();
      }
    };
  });
  // Bouton d'export .pdb (exporte selon la portée affichée).
  const exp = el.querySelector('.stats-export-btn');
  if (exp) exp.onclick = async () => {
    exp.disabled = true; const old = exp.textContent; exp.textContent = '…';
    try { if (typeof window._exportPdb === 'function') await window._exportPdb(_statsScope); }
    catch (_e) {}
    finally { exp.disabled = false; exp.textContent = old; }
  };
}

if (typeof window !== 'undefined') window._renderStats = renderStatsPanel;


// PokerTH web client — Export .pdb (log SQLite au format du client officiel).
//
// Prend les tables du store (modèle recorder) et produit un fichier .pdb
// SQLite byte-lisible par le client Qt et par pokerth-tracker (Ollika).
// Schéma exact : voir SPEC_PDB_LOG.md (LogVersion 1, 5 tables).
//
// sql.js (wasm) est chargé paresseusement au premier export (via
// window._sqlJsUrl / _sqlJsWasmUrl, fournis par le glue du client).

let _SQL = null;

async function _loadSqlJs() {
  if (_SQL) return _SQL;
  if (typeof window === 'undefined') throw new Error('no-window');
  const jsUrl = window._sqlJsUrl || '/vendor/sql-wasm.js';
  const wasmUrl = window._sqlJsWasmUrl || '/vendor/sql-wasm.wasm';
  // initSqlJs est exposé en global par sql-wasm.js (chargé en <script>).
  if (typeof window.initSqlJs !== 'function') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = jsUrl; s.onload = resolve; s.onerror = () => reject(new Error('sqljs-load-failed'));
      document.head.appendChild(s);
    });
  }
  _SQL = await window.initSqlJs({ locateFile: () => wasmUrl });
  return _SQL;
}

// Colonnes de la table Hand (identiques au client officiel).
function _handColumns() {
  const cols = ['HandID', 'UniqueGameID', 'Dealer_Seat', 'Sb_Amount', 'Sb_Seat', 'Bb_Amount', 'Bb_Seat'];
  for (let i = 1; i <= 10; i++) cols.push('Seat_' + i + '_Cash', 'Seat_' + i + '_Card_1', 'Seat_' + i + '_Card_2', 'Seat_' + i + '_Hand_text', 'Seat_' + i + '_Hand_int');
  for (let i = 1; i <= 5; i++) cols.push('BoardCard_' + i);
  return cols;
}

// Construit un .pdb (Uint8Array) depuis des tables au modèle recorder.
// tables : { session|metas, games, players, hands, actions }.
async function buildPdb(tables) {
  const SQL = await _loadSqlJs();
  const db = new SQL.Database();

  db.run('CREATE TABLE Session (PokerTH_Version TEXT NOT NULL, Date TEXT NOT NULL, Time TEXT NOT NULL, LogVersion INTEGER NOT NULL, PRIMARY KEY(Date,Time));');
  db.run('CREATE TABLE Game (UniqueGameID INTEGER PRIMARY KEY, GameID INTEGER NOT NULL, Startmoney INTEGER NOT NULL, StartSb INTEGER NOT NULL, DealerPos INTEGER NOT NULL, Winner_Seat INTEGER);');
  db.run('CREATE TABLE Player (UniqueGameID INTEGER NOT NULL, Seat INTEGER NOT NULL, Player TEXT NOT NULL, PRIMARY KEY(UniqueGameID,Seat));');
  const handCols = _handColumns();
  const handDefs = handCols.map((c) => {
    if (c === 'HandID' || c === 'UniqueGameID') return c + ' INTEGER NOT NULL';
    if (c === 'Sb_Amount' || c === 'Sb_Seat' || c === 'Bb_Amount' || c === 'Bb_Seat') return c + ' INTEGER NOT NULL';
    if (/_Hand_text$/.test(c)) return c + ' TEXT';
    return c + ' INTEGER';
  });
  db.run('CREATE TABLE Hand (' + handDefs.join(', ') + ', PRIMARY KEY(HandID,UniqueGameID));');
  db.run('CREATE TABLE Action (ActionID INTEGER PRIMARY KEY AUTOINCREMENT, HandID INTEGER NOT NULL, UniqueGameID INTEGER NOT NULL, BeRo INTEGER NOT NULL, Player INTEGER NOT NULL, Action TEXT NOT NULL, Amount INTEGER);');

  db.run('BEGIN;');

  // Session (une ligne : la plus ancienne meta, ou fallback).
  const sess = (tables.session) || (tables.metas && tables.metas[0] && tables.metas[0].session) || { pokerthVersion: 'web', date: '', time: '', logVersion: 1 };
  db.run('INSERT INTO Session VALUES (?,?,?,?);', [sess.pokerthVersion || 'web', sess.date || '', sess.time || '', sess.logVersion == null ? 1 : sess.logVersion]);

  const gStmt = db.prepare('INSERT INTO Game VALUES (?,?,?,?,?,?);');
  for (const g of tables.games || []) gStmt.run([g.uniqueGameID, g.gameID | 0, g.startMoney | 0, g.startSb | 0, g.dealerPos | 0, g.winnerSeat == null ? null : g.winnerSeat | 0]);
  gStmt.free();

  const pStmt = db.prepare('INSERT INTO Player VALUES (?,?,?);');
  for (const p of tables.players || []) pStmt.run([p.uniqueGameID, p.seat | 0, String(p.player == null ? '' : p.player)]);
  pStmt.free();

  const hStmt = db.prepare('INSERT INTO Hand (' + handCols.join(',') + ') VALUES (' + handCols.map(() => '?').join(',') + ');');
  for (const h of tables.hands || []) {
    const row = handCols.map((c) => {
      if (c === 'HandID') return h.handID | 0;
      if (c === 'UniqueGameID') return h.uniqueGameID | 0;
      if (c === 'Dealer_Seat') return h.dealerSeat == null ? null : h.dealerSeat | 0;
      if (c === 'Sb_Amount') return h.sbAmount | 0;
      if (c === 'Sb_Seat') return h.sbSeat | 0;
      if (c === 'Bb_Amount') return h.bbAmount | 0;
      if (c === 'Bb_Seat') return h.bbSeat | 0;
      const bm = c.match(/^BoardCard_(\d)$/);
      if (bm) { const v = (h.board || [])[+bm[1] - 1]; return v == null ? null : v | 0; }
      const v = h[c];
      if (v == null) return null;
      return /_Hand_text$/.test(c) ? String(v) : (v | 0);
    });
    hStmt.run(row);
  }
  hStmt.free();

  // Actions : on préserve l'ActionID d'origine (ordre chronologique fiable).
  const aStmt = db.prepare('INSERT INTO Action (ActionID,HandID,UniqueGameID,BeRo,Player,Action,Amount) VALUES (?,?,?,?,?,?,?);');
  const acts = (tables.actions || []).slice().sort((a, b) => (a.actionID | 0) - (b.actionID | 0));
  for (const a of acts) aStmt.run([a.actionID | 0, a.handID | 0, a.uniqueGameID | 0, a.beRo | 0, a.seat | 0, String(a.action || ''), a.amount == null ? null : (a.amount | 0)]);
  aStmt.free();

  db.run('COMMIT;');
  const bytes = db.export();
  db.close();
  return bytes; // Uint8Array
}

// Nom de fichier au format officiel.
function pdbFilename(sess) {
  const s = sess || {};
  const date = (s.date || '').replace(/[^0-9-]/g, '') || 'export';
  const time = (s.time || '').replace(/:/g, '') || '000000';
  return 'pokerth-log-' + date + '_' + time + '.pdb';
}

// Déclenche le téléchargement d'un .pdb depuis le store.
// scope : 'session' | 'all'.
async function exportPdb(scope) {
  const store = (typeof window !== 'undefined') ? window._handlogStore : null;
  if (!store) throw new Error('no-store');
  const all = await store.loadAll();
  let { metas, games, players, hands, actions } = all;
  let sess = (metas && metas[0] && metas[0].session) || null;

  if (scope === 'session') {
    const sid = (window._handlog && window._handlog.sessionId) || null;
    if (sid) {
      const keep = (r) => r.sessionId === sid;
      games = games.filter(keep); players = players.filter(keep);
      hands = hands.filter(keep); actions = actions.filter(keep);
      const meta = metas.find((m) => m.sessionId === sid);
      if (meta) sess = meta.session;
    }
  }

  const bytes = await buildPdb({ session: sess, games, players, hands, actions });
  const blob = new Blob([bytes], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = pdbFilename(sess);
  document.body.appendChild(a); a.click();
  setTimeout(() => { try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (_e) {} }, 100);
  return true;
}

if (typeof window !== 'undefined') window._exportPdb = exportPdb;


// PokerTH web client — HUD par siège + grille de range (showdown).
//
// HUD : une boîte compacte de stats ancrée près de chaque siège (comme un HUD
// de tracker), au thème du client. Désactivé par défaut (option pth_hud_on).
// Un clic sur une boîte ouvre la grille de range 13×13 du joueur.
//
// Données : StatsCalculator / playerVpipCombos (stats.mjs), lues depuis
// window._handlogStore. Positions : ancrées aux éléments .seat[data-pid].
//
// Dépend de : window._handlogStore, window._statsTablePlayers (glue client),
// StatsData/StatsCalculator/playerVpipCombos/cellCombo/GRID_RANKS (assemblés).

function _hudOn() {
  try { return localStorage.getItem('pth_hud_on') === '1'; } catch (_e) { return false; }
}

// Stats affichées dans chaque boîte (id → libellé court).
const HUD_ROWS = [
  ['vpip', 'VPIP'], ['pfr', 'PFR'], ['af', 'AF'],
  ['three_bet', '3B'], ['cbet', 'CB'], ['fold_to_3bet', 'F3B'],
];

function _hudFmt(id, v) {
  if (v == null) return '–';
  if (id === 'af') return v === 'inf' ? '∞' : String(v);
  if (id === 'hands') return String(v);
  return v + '%';
}

// Cache stats/combos calculés (recalcul à chaque main via _hudRefresh).
let _statsCache = {};
let _dataCache = null;

async function _computeStats() {
  const store = (typeof window !== 'undefined') ? window._handlogStore : null;
  if (!store) return;
  const all = await store.loadAll();
  const data = new StatsData({ games: all.games, players: all.players, hands: all.hands, actions: all.actions });
  _dataCache = data;
  _statsCache = new StatsCalculator(data).calculateAllPlayersStats();
}

// Construit/mets à jour une boîte HUD pour un siège donné.
function _buildBox(pid, name, seatEl, layer) {
  const s = _statsCache[name];
  const id = 'hud-box-' + pid;
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.className = 'hud-box';
    box.addEventListener('click', (e) => { e.stopPropagation(); openRangeGrid(name); });
    layer.appendChild(box);
  }
  const handsTxt = s ? _hudFmt('hands', s.hands) : '0';
  let rows = '';
  for (const [sid, lbl] of HUD_ROWS) {
    const val = s ? _hudFmt(sid, s[sid]) : '–';
    const col = s ? statColor(sid, s[sid]) : '';
    rows += '<span class="hud-stat"><i class="hud-lbl">' + lbl + '</i>'
      + '<b class="hud-val"' + (col ? ' style="color:' + col + '"' : '') + '>' + val + '</b></span>';
  }
  box.innerHTML = '<div class="hud-head"><span class="hud-name">' + _hudEsc(name) + '</span>'
    + '<span class="hud-hands">' + handsTxt + '</span></div>'
    + '<div class="hud-grid">' + rows + '</div>';

  // Positionner au-dessus du siège (ancré au centre-haut du .seat).
  const layerRect = layer.getBoundingClientRect();
  const r = seatEl.getBoundingClientRect();
  const cx = r.left + r.width / 2 - layerRect.left;
  const top = r.top - layerRect.top;
  box.style.left = cx + 'px';
  box.style.top = top + 'px';
}

function _hudEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// Couche d'ancrage du HUD (au-dessus de la table, sous les modales).
function _ensureLayer() {
  let layer = document.getElementById('hud-layer');
  if (!layer) {
    const table = document.getElementById('g-table') || document.getElementById('g-seats') || document.body;
    layer = document.createElement('div');
    layer.id = 'hud-layer';
    (table.parentNode || document.body).appendChild(layer);
  }
  return layer;
}

// Rendu principal : place une boîte par siège occupé. Exposé window._hudRender.
function renderHud() {
  if (typeof document === 'undefined') return;
  const layer = document.getElementById('hud-layer');
  if (!_hudOn()) { if (layer) { layer.innerHTML = ''; layer.style.display = 'none'; } return; }
  const lay = _ensureLayer();
  lay.style.display = '';
  let tablePlayers = [];
  try { if (typeof window._statsTablePlayers === 'function') tablePlayers = window._statsTablePlayers() || []; } catch (_e) {}
  const seen = new Set();
  tablePlayers.forEach((p) => {
    const seatEl = document.querySelector('#g-seats [data-pid="' + p.pid + '"]');
    if (!seatEl) return;
    seen.add('hud-box-' + p.pid);
    _buildBox(p.pid, p.name, seatEl, lay);
  });
  // Retirer les boîtes de sièges disparus.
  Array.from(lay.children).forEach((c) => { if (!seen.has(c.id)) lay.removeChild(c); });
}
if (typeof window !== 'undefined') window._hudRender = renderHud;

// Recalcule les stats puis re-rend (appelé à chaque fin de main).
async function refreshHud() {
  if (!_hudOn()) return;
  await _computeStats();
  renderHud();
}
if (typeof window !== 'undefined') window._hudRefresh = refreshHud;

// ── Grille de range 13×13 ───────────────────────────────────────────────────
function openRangeGrid(name, posFilter, playersFilter) {
  if (typeof document === 'undefined' || !_dataCache) return;
  let modal = document.getElementById('range-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'range-modal';
    modal.innerHTML = '<div class="range-card"><div class="range-head">'
      + '<span class="range-title"></span>'
      + '<span class="range-filters"></span>'
      + '<button type="button" class="range-close" title="Fermer">✕</button></div>'
      + '<div class="range-body"></div>'
      + '<div class="range-legend">Diagonale = paires · haut-droite = suited · bas-gauche = offsuit</div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    modal.querySelector('.range-close').addEventListener('click', () => { modal.style.display = 'none'; });
  }
  modal.style.display = 'flex';
  modal._player = name;
  modal._pos = posFilter || 'all';
  modal._pf = playersFilter || 'all';
  _renderRange(modal);
}
if (typeof window !== 'undefined') window._openRange = openRangeGrid;

function _renderRange(modal) {
  const name = modal._player;
  const combos = playerVpipCombos(_dataCache, name);
  // Options de filtre disponibles.
  const positions = Array.from(new Set(combos.map((c) => c.position))).filter((p) => p !== '?');
  const posOrder = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'HJ', 'CO'];
  positions.sort((a, b) => posOrder.indexOf(a) - posOrder.indexOf(b));
  const playerCounts = Array.from(new Set(combos.map((c) => c.nPlayers))).sort((a, b) => a - b);

  // Filtrage.
  const filtered = combos.filter((c) =>
    (modal._pos === 'all' || c.position === modal._pos)
    && (modal._pf === 'all' || c.nPlayers === +modal._pf));

  const counts = {};
  filtered.forEach((c) => { counts[c.combo] = (counts[c.combo] || 0) + 1; });
  const total = filtered.length;
  const maxCount = Math.max(1, ...Object.values(counts));

  modal.querySelector('.range-title').textContent = 'Range showdown — ' + name + '  ·  ' + total + ' main' + (total === 1 ? '' : 's');

  // Filtres (position + nb joueurs).
  let posSel = '<label>Position <select class="range-pos"><option value="all">Toutes</option>';
  positions.forEach((p) => { posSel += '<option value="' + p + '"' + (modal._pos === p ? ' selected' : '') + '>' + p + '</option>'; });
  posSel += '</select></label>';
  let pfSel = '<label>Joueurs <select class="range-pf"><option value="all">Tous</option>';
  playerCounts.forEach((n) => { pfSel += '<option value="' + n + '"' + (modal._pf === String(n) ? ' selected' : '') + '>' + n + '</option>'; });
  pfSel += '</select></label>';
  const filt = modal.querySelector('.range-filters');
  filt.innerHTML = posSel + pfSel;
  filt.querySelector('.range-pos').onchange = (e) => { modal._pos = e.target.value; _renderRange(modal); };
  filt.querySelector('.range-pf').onchange = (e) => { modal._pf = e.target.value; _renderRange(modal); };

  // Grille 13×13.
  let html = '<table class="range-grid"><tbody>';
  for (let row = 0; row < 13; row++) {
    html += '<tr>';
    for (let col = 0; col < 13; col++) {
      const combo = cellCombo(row, col);
      const count = counts[combo] || 0;
      let cls = 'range-cell';
      let style = '';
      if (count > 0) {
        const ratio = count / maxCount;
        const hue = Math.round(120 * (1 - ratio)); // vert→jaune→rouge
        style = 'background:hsl(' + hue + ',62%,46%);color:#0b0b0b';
        cls += ' filled';
      }
      html += '<td class="' + cls + '" style="' + style + '"><span class="rc-combo">' + combo + '</span>'
        + (count > 0 ? '<span class="rc-count">' + count + '</span>' : '') + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  modal.querySelector('.range-body').innerHTML = html;
}



(function () {
  try {
    var store = new HandStore();
    var rec = new HandRecorder({
      version: (typeof window !== 'undefined' && window.BUILD_VERSION) ? ('web-' + window.BUILD_VERSION) : 'web',
      onGamePersist: function (session, game, players) { store.putSession(rec.sessionId, session); store.putGame(rec.sessionId, game); store.putPlayers(rec.sessionId, players); },
      onHandPersist: function (hand, actions) {
        store.putHandBundle(rec.sessionId, hand, actions);
        try { if (typeof window._renderStats === 'function') window._renderStats(); } catch (_e) {}
        try { if (typeof window._hudRefresh === 'function') window._hudRefresh(); } catch (_e) {}
      }
    });
    if (typeof window !== 'undefined') { window._handlog = rec; window._handlogStore = store; }
  } catch (_e) {}
})();
