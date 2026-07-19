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
};

// Pont legacy : pokerth.js (script classique) fait `const S = window.PthState;`
// en tête de l'IIFE App. Aussi pratique pour l'inspection console.
window.PthState = S;
