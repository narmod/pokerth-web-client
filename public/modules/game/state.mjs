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
};

// Pont legacy : pokerth.js (script classique) fait `const S = window.PthState;`
// en tête de l'IIFE App. Aussi pratique pour l'inspection console.
window.PthState = S;
