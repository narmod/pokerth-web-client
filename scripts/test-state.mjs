#!/usr/bin/env node
// Deterministic tests for public/modules/game/state.mjs (chantier ESM #9e,
// vague V0 — docs/ESM_PLAN.md). Vérifie la forme du store partagé S, les
// valeurs initiales du domaine migré (timer de tour) et le pont legacy
// window.PthState. Run: node scripts/test-state.mjs

globalThis.window = globalThis;
// Les initialiseurs V1 lisent localStorage au chargement du module.
const ls = new Map();
globalThis.localStorage = {
  getItem: (k) => (ls.has(k) ? ls.get(k) : null),
  setItem: (k, v) => ls.set(k, String(v)),
  removeItem: (k) => ls.delete(k),
};

const { S } = await import('../public/modules/game/state.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

console.log('state.mjs — V0 (timer) + V1 (voix/haptique) + V2 (stats) + V3 (pet/inv/chat/titre) + V4 (avatars) + V5 (lobby) + V6 (config partie)');
ok(typeof S === 'object' && S !== null, 'S est un objet');
ok(window.PthState === S, 'pont window.PthState === S (même référence)');

// Valeurs initiales strictement identiques aux anciennes déclarations
ok(S._timerID === null, '_timerID init = null');
ok(S._timerSec === 0, '_timerSec init = 0');
ok(S._timerTot === 30, '_timerTot init = 30');

// Le store est mutable et partagé (comportement attendu par pokerth.js)
S._timerSec = 12;
ok(window.PthState._timerSec === 12, 'mutation visible via le pont');
S._timerSec = 0;

// V1 — Voix / haptique : défauts (localStorage vide → haptic ON, voix OFF)
ok(S._hapticEnabled === true, '_hapticEnabled défaut = true (pth_haptic absent)');
ok(S._voiceEnabled === false, '_voiceEnabled défaut = false (pth_voice absent)');
ok(Array.isArray(S._voices) && S._voices.length === 0, '_voices init = []');
ok(Array.isArray(S._speakQ) && S._speakQ.length === 0, '_speakQ init = []');
ok(S._speaking === false, '_speaking init = false');
ok(S._curU === null, '_curU init = null');
ok(S._SPEAK_MAX === 4, '_SPEAK_MAX init = 4');

// V2 — Stats / board / profil
ok(S._stats && S._stats.handsPlayed === 0 && Array.isArray(S._stats.history)
   && S._stats.history.length === 0, '_stats init = objet vierge');
ok(S._statsInited === false && S._statsEligible === false && S._boardEligible === false
   && S._statsOffline === false && S._gameCounted === false, 'drapeaux stats init = false');
ok(S._lifePushTimer === null, '_lifePushTimer init = null');
ok(S._statsOpen === false && S._statsTab === 'session' && S._boardSort === 'net',
   'panneau stats : fermé / onglet session / tri net');
ok(S._pimTab === 'session' && S._pimPid === 0, 'popup profil : onglet session / pid 0');

// V3 — Pétitions / invitations + chat / notifs / titre
ok(S._pet === null && S._inv === null, '_pet / _inv init = null');
ok(typeof S._invSent === 'object' && Object.keys(S._invSent).length === 0, '_invSent init = {}');
ok(S._lastMsgWasReaction === false && S._chatRejectShown === false, 'drapeaux chat init = false');
ok(Array.isArray(S._reactEmojiQueue) && S._reactEmojiQueue.length === 0
   && S._reactEmojiTimer === null && S._reactEmojiLastSent === 0, 'file /emoji vierge');
ok(S.REACT_EMOJI_MIN_GAP === 1500 && S.REACT_EMOJI_QUEUE_MAX === 4, 'constantes /emoji');
ok(S._statusKey === null && S._origTitle === 'PokerTH Web' && S._titleBlinkID === null,
   'status bar / titre init');

// V4 — Avatars
ok(Object.keys(S._playerAvatars).length === 0 && Object.keys(S._playerImgAvatars).length === 0,
   'caches avatars proxy init = {}');
ok(Object.keys(S._pthAvatarHashes).length === 0 && Object.keys(S._pthAvatarsByHash).length === 0
   && Object.keys(S._pthAvatarReqIdToHash).length === 0 && Object.keys(S._pthDataUrls).length === 0,
   'caches avatars pokerth.net init = {}');
ok(S._pthNextAvatarReqId === 1, '_pthNextAvatarReqId init = 1');
ok(S._myAvatarCache === '', '_myAvatarCache init = vide');
ok(S._avatarPopupOrigParent === null && S._avatarPopupOrigNextSibling === null
   && S._avatarPickerBackdropHandler === null && S._avatarPickerBtnHandler === null,
   'refs DOM popup/picker init = null');

// V5 — Lobby
ok(typeof S.games === 'object' && Object.keys(S.games).length === 0
   && typeof S.players === 'object' && Object.keys(S.players).length === 0, 'games / players init = {}');
ok(S._openTables instanceof Set && S._openTables.size === 0
   && S._lobbyPids instanceof Set && S._specPids instanceof Set
   && S._pendingNameRequests instanceof Set, 'Sets lobby init vides');
ok(S.loaded === false && S._selectedGame === null && S._lobbyPlayerCount === 0
   && S._hasStatistics === false, 'drapeaux lobby init');
ok(S._tableFilter === '0', '_tableFilter défaut = 0 (localStorage vide)');
ok(Object.keys(S._playerCountries).length === 0 && Object.keys(S._playerRights).length === 0,
   'caches pays/droits init = {}');
ok(S.MODE_DOT[2] === 'dot-run' && S._GTYPE_KEY[4] === 'gtypeRanked', 'constantes lobby');

// V6 — Config de partie / blinds
ok(S.gId === 0 && S.handNum === 0 && S.smallBlind === 10, 'identité de partie init');
ok(S._raiseMode === 1 && S._raiseEvery === 0 && S._lastBlindsUpHand === 0
   && S._endRaiseMode === 1 && S._endRaiseValue === 0, 'modes de hausse des blinds init');
ok(Array.isArray(S._manualBlinds) && S._manualBlinds.length === 0, '_manualBlinds init = []');
ok(S._blindsClockStart === 0 && S._blindsCdTimer === null && S._displayBB === false,
   'horloge blinds / affichage BB init');
ok(S.gameTimeout === 15 && S.gameStartMoney === 3000, 'timeout 15 / stack 3000 par défaut');
ok(S._gameMeta === null && S.amGameAdmin === false && S.MAX_GAME_NAME === 48, 'méta partie init');

// Périmètre exact des vagues migrées (pas de fuite d'autres clés)
const keys = Object.keys(S).sort();
ok(JSON.stringify(keys) === JSON.stringify(['REACT_EMOJI_MIN_GAP', 'REACT_EMOJI_QUEUE_MAX',
   '_SPEAK_MAX', '_avatarPickerBackdropHandler', '_avatarPickerBtnHandler',
   '_avatarPopupOrigNextSibling', '_avatarPopupOrigParent', '_boardEligible', '_boardSort',
   '_chatRejectShown', '_curU', '_gameCounted', '_hapticEnabled', '_inv', '_invSent',
   '_lastMsgWasReaction', '_lifePushTimer', '_myAvatarCache', '_origTitle', '_pet', '_pimPid',
   '_pimTab', '_playerAvatars', '_playerImgAvatars', '_pthAvatarHashes',
   '_pthAvatarReqIdToHash', '_pthAvatarsByHash', '_pthDataUrls', '_pthNextAvatarReqId',
   '_reactEmojiLastSent', '_reactEmojiQueue', '_reactEmojiTimer', '_speakQ', '_speaking',
   '_stats', '_statsEligible', '_statsInited', '_statsOffline', '_statsOpen', '_statsTab',
   '_statusKey', '_timerID', '_timerSec', '_timerTot', '_titleBlinkID', '_voiceEnabled',
   '_voices',
   'games', 'players', '_openTables', 'loaded', '_tableFilter', '_selectedGame',
   '_lobbyPids', '_lobbyPlayerCount', '_hasStatistics', '_specPids',
   '_pendingNameRequests', '_playerCountries', '_playerRights', 'MODE_DOT',
   '_GTYPE_KEY',
   'gId', 'smallBlind', 'handNum', '_raiseMode', '_raiseEvery', '_lastBlindsUpHand',
   '_endRaiseMode', '_endRaiseValue', '_manualBlinds', '_blindsClockStart',
   '_blindsCdTimer', '_displayBB', 'gameTimeout', 'gameStartMoney', '_gameMeta',
   'amGameAdmin', 'MAX_GAME_NAME'].sort()),
   'périmètre V0..V6 exact : ' + keys.join(', '));

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
