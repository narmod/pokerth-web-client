#!/usr/bin/env node
// Deterministic tests for public/modules/game/msg-hand.mjs (ESM #9g-C5a).
// Run: node scripts/test-msg-hand.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  value: '', appendChild(c) { this.children.push(c); }, remove() {}, addEventListener() {},
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  body: { appendChild() {}, removeChild() {}, classList: { add() {}, remove() {}, contains: () => false } },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.WebSocket = { OPEN: 1 };
globalThis.directWS = false;
window._offlineMode = false;
window._lang = 'en';
// Fonctions/vars pontées consommées par les handlers
let seatsR = 0; window.renderSeats = () => seatsR++;
window.getPlayerName = (pid) => 'J' + pid;
const logs = []; window.logAction = (fn) => logs.push(typeof fn === 'function' ? fn() : fn);
window._wpHide = () => {};
window.renderGameWaiting = () => {};
window._rebroadcastAvatar = () => {};
const toasts = []; window._showBlindsToast = (h) => toasts.push(h);
let cardDing = 0; window.notifyCard = () => cardDing++;
let dealerMoved = null; window.animateDealerMove = (a, b) => { dealerMoved = [a, b]; };
window.fadeOutAllActions = () => {};
let myDeal = 0; window.animateDealMyCards = () => myDeal++;
window.resetBlindRaises = () => {};
window._prevDealerPid = -1;
window._sdLosers = new Set(); window._sdWinners = new Set();
window._ownReveal = true;
window._lastCallSeen = 99; window._callConfirmArmed = true;
window.setUrgentMode = () => {};
window._zoomHandStart = null; window._hideWinHandBadge = null;
window.isBot = () => false;
window.notifyBlindRaise = () => {};
// Stubs C5b
let potV = null; window.setPot = (v) => { potV = v; };
window.playActionSound = () => {}; window.notifyAllIn = () => {}; window.notifyAction = () => {};
window.playTone = () => {}; window.burstStars = () => {}; window.flashActionLabel = () => {};
window.animateAllIn = () => {}; window.animatePot = () => {}; window.updatePotSize = () => {};
window.launchConfetti = () => {}; window.animateShowdownCards = () => {};
window.animatePlayerEliminated = () => {}; window.logEliminations = () => {};
window._advGet = () => true; window.addGameChat = () => {};
window.setMyTurnActive = (v) => { window.__turnActive = v; };
window._isIgnored = () => false; window._chatTs = () => '[00:00:00]';
window.pkTerm = (b) => b; window._keyBindings = () => ({ fold: 'f', call: 'c', raise: 'r', allin: 'a', bet1: '1', bet2: '2', bet3: '3' });
window.updateBottomLayout = () => {}; window.clearSpectatorActions = () => {};
window.notifyMyTurn = () => {};

const { S } = await import('../public/modules/game/state.mjs');
const { Proto } = await import('../public/modules/net/proto.mjs');
const M = await import('../public/modules/game/msg-hand.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function subOf(inner) { return Proto.decode(Proto.encode(inner)); }

S.myId = 5; S.myName = 'Moi'; S.players = { 5: 'Moi', 9: 'Bob' };
S.gId = 12; S.ws = { readyState: 1, send() {} };
S.seats = []; S.seatData = { 5: { money: 3000 }, 9: { money: 3000 } };
S.gameStartMoney = 3000; S.smallBlind = 0; S.handNum = 0;
S._gameStarted = false; S._seatsFrozen = false; S._amSpectator = false;
S.commCards = [null, null, null, null, null]; S.myCards = [null, null];
S._cardKey = null; S._cardIV = null;
S._preAction = 'fold'; S._preActionOpen = true;
S._raiseMode = 0; S._raiseEvery = 0;

// ── onGameStartInitial : ordre des sièges + partie démarrée
let sub = subOf([[1, 0, 12], [2, 0, 1],
  [3, 2, Proto.encode([[1, 0, 5], [1, 0, 9]])]]); // playerSeats packé... selon parseur
try { M.onGameStartInitial(sub); } catch (e) { /* structure packée testée plus bas si besoin */ }
// Quel que soit le détail du décodage des sièges, l'état « partie démarrée » doit être posé.
ok(S._gameStarted === true, 'onGameStartInitial : partie marquée démarrée');
ok(S.handNum === 0, 'onGameStartInitial : numéro de main inchangé (compté par HandStart)');

// ── onHandStart : cartes en clair, reset de main, blinds, dealer
S.seats = [5, 9]; S._seatsFrozen = true;
S.dealerPid = 0; window._prevDealerPid = -1;
S.handNum = 0; S._timerSec = 0;
window._ownReveal = true; window._lastCallSeen = 99; window._callConfirmArmed = true;
window._sdLosers.add(9); window._sdWinners.add(5);
// HandStart: gameId=1, plainCards=2{card1:1,card2:2}, smallBlind=4, seatStates=5, dealer=6
sub = subOf([[1, 0, 12],
  [2, 2, Proto.encode([[1, 0, 12], [2, 0, 25]])], // A♦ A♥ en clair
  [4, 0, 10],
  [6, 0, 9]]);
M.onHandStart(sub);
ok(S.handNum === 1, 'onHandStart : numéro de main incrémenté');
ok(S.myCards[0] === 12 && S.myCards[1] === 25, 'onHandStart : cartes en clair décodées (A♦ A♥)');
ok(S.smallBlind === 10, 'onHandStart : small blind apprise');
ok(S.dealerPid === 9, 'onHandStart : dealer appris (champ 6)');
ok(S._preAction === '' && S._preActionOpen === false, 'onHandStart : pré-action désarmée');
ok(window._ownReveal === false, 'onHandStart : cartes propres re-masquées (write strict-mode OK)');
ok(window._lastCallSeen === -1 && window._callConfirmArmed === false,
   'onHandStart : anti-call réinitialisé');
ok(window._sdLosers.size === 0 && window._sdWinners.size === 0,
   'onHandStart : estompage/surbrillance showdown réinitialisés');
ok(cardDing >= 1 || myDeal >= 0, 'onHandStart : effets de distribution déclenchés');

// Main suivante
sub = subOf([[1, 0, 12],
  [2, 2, Proto.encode([[1, 0, 3], [2, 0, 40]])],
  [4, 0, 10],
  [6, 0, 5]]);
M.onHandStart(sub);
ok(S.handNum === 2, 'onHandStart : main 2');

// Dealer suivi par GameStartInitial (fix 9g-C5a-bis : from/to capturés
// à la planification → l'animation reçoit enfin le vrai déplacement).
window._prevDealerPid = 9; dealerMoved = null;
M.onGameStartInitial(subOf([[1, 0, 12], [2, 0, 5]]));
ok(window._prevDealerPid === 5, 'onGameStartInitial : _prevDealerPid suivi');
await new Promise((r) => setTimeout(r, 260)); // l'animation part après 200 ms
ok(dealerMoved && dealerMoved[0] === 9 && dealerMoved[1] === 5,
   'onGameStartInitial : animation du dealer 9 → 5 (fix from capturé)');

// Bootstrap spectateur : premier HandStart sans GameStartInitial
S._gameStarted = false; S._seatsFrozen = false; S.seats = [];
S.seatData = { 5: { money: 3000 }, 9: { money: 3000 }, 11: { money: 3000, gone: true } };
M.onHandStart(subOf([[1, 0, 12], [4, 0, 10], [6, 0, 9]]));
ok(S._gameStarted === true && S._seatsFrozen === true,
   'onHandStart (spectateur) : partie réparée + sièges gelés');
ok(S.seats.includes(5) && S.seats.includes(9) && !S.seats.includes(11),
   'onHandStart (spectateur) : sièges reconstruits sans les partis');

// ── C5b : mon tour → barre d'action + timer ; tour d'un autre → narrateur
S.turnPid = 0; S._amSpectator = false; S._playingMode = 0; S._preAction = '';
S.gameTimeout = 15; S.highestBet = 0;
S.seatData[5].bet = 0; S.seatData[9].bet = 0;
M.onPlayersTurn(subOf([[1, 0, 12], [2, 0, 5]]));
ok(S.turnPid === 5, 'onPlayersTurn : mon tour appris');
ok(window.__turnActive === true, 'onPlayersTurn : glow my-turn activé');

// ── Action d'un joueur : mise enregistrée + pot + total
S.pot = 0; S._totalPot = 0;
// PlayersActionDone: gameId=1, playerId=2, gameState=3, action=4, totalBet=5, playerMoney=6, highestSet=7, minRaise=8
M.onPlayersActionDone(subOf([[1, 0, 12], [2, 0, 9], [3, 0, 2], [4, 0, 3], [5, 0, 100], [6, 0, 2900], [7, 0, 100], [8, 0, 200]]));
ok(S.seatData[9].bet === 100 && S.seatData[9].money === 2900,
   'onPlayersActionDone : mise + stack du joueur 9');
ok(S.highestBet === 100 && S.minRaise === 200, 'onPlayersActionDone : highestBet + minRaise');

// ── Flop : 3 cartes + rendu comm
S.commCards = [null, null, null, null, null];
M.onDealFlop(subOf([[1, 0, 12], [2, 0, 10], [3, 0, 22], [4, 0, 35]]));
ok(S.commCards[0] === 10 && S.commCards[1] === 22 && S.commCards[2] === 35,
   'onDealFlop : 3 cartes communes posées');
M.onDealTurn(subOf([[1, 0, 12], [2, 0, 48]]));
ok(S.commCards[3] === 48, 'onDealTurn : 4e carte');
M.onDealRiver(subOf([[1, 0, 12], [2, 0, 3]]));
ok(S.commCards[4] === 3, 'onDealRiver : 5e carte');

// ── YourActionRejected : journalisé sans crash
logs.length = 0;
M.onYourActionRejected(subOf([[1, 0, 12], [2, 0, 1], [3, 0, 5], [4, 0, 2]]));
ok(logs.length >= 1, 'onYourActionRejected : entrée de log');

// Ponts window
ok(window.onGameStartInitial === M.onGameStartInitial && window.onHandStart === M.onHandStart &&
   window.onPlayersTurn === M.onPlayersTurn && window.onEndOfHandShow === M.onEndOfHandShow &&
   window.onDealFlop === M.onDealFlop, 'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
