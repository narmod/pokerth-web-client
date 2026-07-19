// ═══════════════════════════════════════════════════════════════════
// État partagé de l'application — chantier ESM #9e (option A).
// Chaque vague migre un domaine de variables de closure de l'IIFE App
// (pokerth.js) vers cet objet : les noms restent STRICTEMENT identiques
// (S.<nom> ⇔ ancien <nom> de closure), les valeurs initiales sont
// recopiées telles quelles. Aucune logique ici : uniquement de l'état.
// Gabarit i18n.mjs : export ES nommé + pont legacy window.*.
// ⚠ Pas de t() ni d'accès DOM au top-level de ce module.
// ═══════════════════════════════════════════════════════════════════

export const S = {
  // ── V0 · Timer de tour (domaine F) ──
  _timerID: null,   // setInterval handle
  _timerSec: 0,     // seconds remaining
  _timerTot: 30,    // total seconds

  // ── V1 · Voix / haptique (domaine I) ──
  _hapticEnabled: (function() {
    try { return localStorage.getItem('pth_haptic') !== '0'; } catch (e) { return true; }
  })(),
  _voiceEnabled: (function() {
    try { return localStorage.getItem('pth_voice') === '1'; } catch (e) { return false; }
  })(),
  _voices: [],
  _speakQ: [],       // pending texts
  _speaking: false,  // an utterance is currently playing
  _curU: null,       // the live utterance (identity guard)
  _SPEAK_MAX: 4,     // cap the backlog so the voice can't lag far behind play

  // ── V2 · Stats / board / profil (domaine H) ──
  _stats: { handsPlayed: 0, handsWon: 0, startMoney: 0, peakMoney: 0, totalGain: 0,
            bigWin: 0, bigLoss: 0, history: [] },
  _statsInited: false,
  _statsEligible: false,   // record lifetime stats at all (training OR private/LAN)
  _boardEligible: false,   // shared family leaderboard + /stats push (private/LAN only)
  _statsOffline: false,    // training (vs bots) → isolated lifetime store, no board
  _gameCounted: false,     // guard: count each finished game once
  _lifePushTimer: null,
  _statsOpen: false,
  _statsTab: 'session',
  _boardSort: 'net',
  _pimTab: 'session',
  _pimPid: 0,              // pid affiché dans le popup profil (0 / myId = mon profil)

  // ── V3 · Pétitions / invitations + chat / notifs / titre (domaines K + J) ──
  _pet: null,              // { petitionId, target, endsAt, timer, voted } | null
  _inv: null,              // { gameId } | null
  _invSent: {},            // pids invited during the current invite-modal session
  _lastMsgWasReaction: false, // true si le dernier chat envoyé était une réaction
  _chatRejectShown: false,    // n'afficher l'avertissement LAN qu'une seule fois
  _reactEmojiQueue: [],
  _reactEmojiTimer: null,
  _reactEmojiLastSent: 0,
  REACT_EMOJI_MIN_GAP: 1500,  // ms minimum entre deux /emoji (sous le seuil serveur)
  REACT_EMOJI_QUEUE_MAX: 4,   // file bornée : au-delà on abandonne l'envoi réseau
  _statusKey: null,
  _origTitle: 'PokerTH Web',
  _titleBlinkID: null,

  // ── V4 · Avatars (domaine C) ──
  _playerAvatars: {},      // pid → emoji avatar (reçu des autres joueurs via proxy)
  _playerImgAvatars: {},   // pid → data URL (avatar image perso diffusé via proxy)
  _pthAvatarHashes: {},
  _pthAvatarsByHash: {},
  _pthAvatarReqIdToHash: {},
  _pthNextAvatarReqId: 1,
  _pthDataUrls: {},
  _myAvatarCache: '',      // cache de l'avatar local (évite les lectures localStorage répétées)
  _avatarPopupOrigParent: null,
  _avatarPopupOrigNextSibling: null,
  _avatarPickerBackdropHandler: null,
  _avatarPickerBtnHandler: null,

  // ── V5 · Lobby (domaine B) ──
  games: {},               // gameId → {name, mode, players, maxPlayers, type, priv}
  players: {},             // playerId → name
  _openTables: new Set(),  // gids dont le panneau joueurs est déplié dans le lobby
  loaded: false,
  _tableFilter: (function () {
    try { var v = localStorage.getItem('pth_table_filter'); return (v && /^[0-5]$/.test(v)) ? v : '0'; } catch (e) { return '0'; }
  })(),
  _selectedGame: null,     // partie sélectionnée pour le panneau « Infos de partie »
  _lobbyPids: new Set(),   // pids en ligne dans le lobby
  _lobbyPlayerCount: 0,
  _hasStatistics: false,   // true dès qu'un StatisticsMessage a été vu
  _specPids: new Set(),
  _pendingNameRequests: new Set(),
  _playerCountries: {},
  _playerRights: {},
  MODE_DOT: { 1: 'dot-open', 2: 'dot-run', 3: 'dot-closed' },
  _GTYPE_KEY: { 1: 'gtypeNormal', 2: 'gtypeRegistered', 3: 'gtypeInvite', 4: 'gtypeRanked' },

  // ── V6 · Config de partie / blinds (domaine D) ──
  gId: 0,                  // current gameId
  smallBlind: 10,
  handNum: 0,              // hand counter
  _raiseMode: 1,
  _raiseEvery: 0,
  _lastBlindsUpHand: 0,
  _endRaiseMode: 1,
  _endRaiseValue: 0,
  _manualBlinds: [],       // liste manuelle (NetGameInfo champ 14) de la partie en cours
  _blindsClockStart: 0,
  _blindsCdTimer: null,
  _displayBB: false,
  gameTimeout: 15,         // timeout par joueur (depuis les settings de la partie)
  gameStartMoney: 3000,
  _gameMeta: null,
  amGameAdmin: false,      // true if we created this game
  MAX_GAME_NAME: 48,

  // ── V7 · Connexion / reconnexion (domaine A) ──
  ws: null,
  rxBuf: new Uint8Array(0),
  lastMajor: 5, lastMinor: 1, lastLoginType: 0,   // for name-retry
  _lastConnectParams: null,
  _lastInitMode: null,     // 'lan' / 'unauth' / 'guest' / 'auth'
  _lastInitNick: null,     // pseudo saisi au dernier Init
  _lastInitTime: 0,
  _connectingNow: false,   // anti double-clic (ré-entrance)
  _connectTimeout: null,   // filet : le bouton Connexion ne reste jamais bloqué
  _connectBtnLabel: null,
  _currentLoginMode: 'lan',
  _reconnectAttempts: 0,
  _lastRxTime: Date.now(), // watchdog liveness (dernier message reçu)
  _intentionalDisconnect: false,
  _pendingRejoin: 0,       // gameId à rejoindre après reconnexion (0 = aucun)
  _rejoinNickRetries: 0,
  _wasAuthenticated: false, // true seulement après InitAck réussi
  _lastConnectTime: 0,
  _lastConnectFailed: false,
  _ipBlockUntil: 0,
  _notifyWS: null, _notifyUrl: '', _notifyTimer: null,
  MIN_CONNECT_INTERVAL: 1500,
  MODE_SWAP_MIN_GAP: 3000,
  _RX_WATCHDOG_MIN_MS: 45000,

  // ── V8 · Barre d'action / pré-sélection (domaine G) ──
  _playingMode: 0,         // 0 = Manuel · 1 = Auto Check/Call · 2 = Auto Check/Fold
  _preAction: '',          // '' | 'fold' | 'call' | 'raise' | 'allin'
  _preActionToCall: -1,    // « à suivre » POUR MOI mémorisé au pré-armement
  _preActionOpen: false,
  _modeSelBusy: false, _modeSelPendingPreview: false, _modeSelHoldTimer: null,
  _actionBarPinned: (function () {
    try { return localStorage.getItem('pth_pin_actionbar') === '1'; } catch (e) { return false; }
  })(),
  FEATURE_AUTO_CHECK_FOLD: true,

  // ── V9.1 · Cœur de main : snapshots showdown (domaine E, 1/3) ──
  _handResultSnapshot: {},    // stack final + net exact par joueur en fin de main
  _seatStackAtHandStart: {},  // {pid: stack au début de la main}
  _myStackAtHandStart: null,  // mon stack réel au début de la main (avant blinds)
  _lastPixPos: [],            // [{top, left}] dans l'ordre de rotated
  _potCenter: { x: 0, y: 0 }, // centre du pot à l'écran
  _lastPotValue: null,

  // ── V9.2 · Cœur de main : cartes / mises / phases (domaine E, 2/3) ──
  myCards: [null, null],
  commCards: [],
  _cardKey: null,          // clé AES des cartes chiffrées
  _cardIV: null,
  highestBet: 0,
  minRaise: 0,
  pot: 0,
  collectedPot: 0,         // mises accumulées des streets précédentes
  gameState: 0,            // preflop/flop/turn/river
  dealerPid: 0,
  turnPid: 0,
  _lastSbPid: 0,           // SB/BB du dernier rendu (popup d'info joueur)
  _lastBbPid: 0,

  // ── V9.3 · Cœur de main : identité / sièges / verrous (domaine E, 3/3) ──
  seats: [],               // player IDs in seat order (GameStartInitial) — figé après 1ʳᵉ main
  seatData: {},            // {pid: {money, bet, action, active, folded}}
  amInGame: false,
  myName: '',
  _gameStarted: false,     // vrai au GameStartInitial ; gèle le panneau d'attente
  _seatsFrozen: false,     // verrou one-way : ordre de sièges d'origine figé
  _amSpectator: false,     // rejoint via « Regarder » — actions désactivées
  autoAction: false,
};

// Pont legacy : pokerth.js (script classique) fait `const S = window.PthState;`
// en tête de l'IIFE App. Aussi pratique pour l'inspection console.
window.PthState = S;
