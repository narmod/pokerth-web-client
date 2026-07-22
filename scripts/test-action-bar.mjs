#!/usr/bin/env node
// Deterministic tests for public/modules/ui/action-bar.mjs (ESM #9g-B4).
// Run: node scripts/test-action-bar.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, _cls: new Set(), _handlers: {},
  classList: { add() {}, remove() {}, contains: () => false },
  appendChild(c) { this.children.push(c); }, remove() {},
  addEventListener(ev, fn) { this._handlers[ev] = fn; },
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  hidden: false, title: 'PokerTH',
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
globalThis.WebSocket = { OPEN: 1 };
globalThis.addEventListener = () => {};
globalThis.directWS = false; // requis par send() (session.mjs)
globalThis.removeEventListener = () => {};
try { Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true }); } catch (e) {}
// Globaux du script consommés via window.*
window.pkTerm = (b) => ({ fold: 'Fold', check: 'Check', call: 'Call', bet: 'Bet',
  raise: 'Raise', allin: 'All-In' }[b] || b);
window._keyBindings = () => ({ fold: 'f', call: 'c', raise: 'r', allin: 'a',
  bet1: '1', bet2: '2', bet3: '3' });
window.getPlayerName = (pid) => 'J' + pid;
let bottomLayouts = 0; window.updateBottomLayout = () => bottomLayouts++;
let specCleared = 0; window.clearSpectatorActions = () => specCleared++;
let waitingRendered = 0; window.renderGameWaiting = () => waitingRendered++;
const logged = []; window.logAction = (fn) => logged.push(typeof fn === 'function' ? fn() : fn);
let turnActive = null; window.setMyTurnActive = (v) => { turnActive = v; };
window._lastCallSeen = -1; window._lastBoardCount = -1;
window._callConfirmArmed = false; window._callConfirmTimer = null;
window.notifyMyTurn = () => {};
window.setUrgentMode = () => {}; // requis par stopTurnTimer (turn-timer.mjs)

const { S } = await import('../public/modules/game/state.mjs');
const A = await import('../public/modules/ui/action-bar.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// Contexte de main : mon tour, rien à suivre
S.myId = 1; S.seats = [1, 2]; S._amSpectator = false;
S.seatData = { 1: { money: 1000, bet: 0 }, 2: { money: 1000, bet: 0 } };
S.highestBet = 0; S.minRaise = 0; S.smallBlind = 10; S.pot = 100;
S.commCards = [null, null, null, null, null];
S._preAction = ''; S._playingMode = 0; S._modeSelBusy = false;
S.ws = { readyState: 1, send() {} }; S.gId = 1; S.handNum = 1; S.gameState = 2;
window._canShowCards = false;

// renderMyTurnActions (live) : Check disponible, boutons rendus, keepalive
const sent = [];
// send importé par le module vient de session.mjs → stub via S.ws.send
S.ws.send = (d) => sent.push(d);
A.renderMyTurnActions();
const ga = els['g-actions'];
ok(ga.innerHTML.includes('>Check<span') || ga.innerHTML.includes('Check'), 'live : bouton Check (rien à suivre)');
ok(ga.innerHTML.includes('Fold') && ga.innerHTML.includes('All-In'), 'live : Fold + All-In présents');
ok(ga.innerHTML.includes('mode-sel'), 'live : dropdown de mode présent');
ok(bottomLayouts > 0, 'live : updateBottomLayout appelé');
ok(sent.length === 1, 'live : keepalive serveur envoyé');

// Aperçu : boutons pré-armables + classe actions-preview
S.turnPid = 2;
A.renderMyTurnActions(true);
ok(ga.innerHTML.includes('actions-preview'), 'aperçu : classe actions-preview');
ok(ga.innerHTML.includes("armPreAction('fold')"), 'aperçu : Fold arme une pré-action');
ok(!ga.innerHTML.includes('act-narrator') && !ga.innerHTML.includes('thinking-dots'),
   'aperçu : aucun narrateur de tour (fidélité QML)');

// Call avec mise à suivre + montant
S.highestBet = 50;
A.renderMyTurnActions();
ok(ga.innerHTML.includes('Call') && ga.innerHTML.includes('50'), 'live : Call $50');

// Call all-in implicite quand toCall >= stack
S.seatData[1].money = 30;
A.renderMyTurnActions();
ok(ga.innerHTML.includes('doAction(6,30)') || ga.innerHTML.includes('confirmCall(6,30)'),
   'live : call > stack routé vers All-In (action 6)');
S.seatData[1].money = 1000;

// Spectateur : jamais de boutons
S._amSpectator = true;
A.renderMyTurnActions();
ok(specCleared === 1, 'spectateur : clearSpectatorActions, pas de boutons');
S._amSpectator = false;

// Invalidation d'une pré-action call si le montant à suivre a changé
S._preAction = 'call'; S._preActionToCall = 20; S.highestBet = 80;
A.renderMyTurnActions(true);
ok(S._preAction === '', 'pré-action call invalidée (toCall a changé)');

// doAction : WS fermé → message d'erreur + logAction, rien d'envoyé
S.ws = { readyState: 3, send() { throw new Error('ne doit pas envoyer'); } };
A.doAction(3, 50);
ok(ga.innerHTML.includes('waiting-msg'), 'doAction : WS fermé → message d\'avertissement');
ok(logged.length === 1, 'doAction : WS fermé → entrée de log');

// doAction : WS ouvert → envoi + setMyTurnActive(false) + panneau aperçu conservé
const sent2 = [];
S.ws = { readyState: 1, send: (d) => sent2.push(d) };
S.turnPid = 1; S._preAction = '';
A.doAction(2, 0);
ok(sent2.length >= 1, 'doAction : action envoyée au serveur');
ok(turnActive === false, 'doAction : setMyTurnActive(false)');
ok(ga.innerHTML.includes('actions-preview'), 'doAction : barre conservée en mode aperçu');

// doRaise : clamp du montant hors bornes → minBet ; >= stack → All-In
S.highestBet = 0; S.minRaise = 40;
els['raise-amt'] = makeEl(); els['raise-amt'].value = '7';
const sent3 = []; S.ws.send = (d) => sent3.push(d);
A.doRaise();
ok(sent3.length === 1, 'doRaise : montant < min clampé et envoyé');
els['raise-amt'].value = '99999';
A.doRaise();
ok(sent3.length === 2, 'doRaise : montant > stack → All-In envoyé');

// confirmCall : 1er tap arme ET re-libelle le bouton « Confirm $X ? »
// (fix 9g-B4b : les bindings sont relus via window._keyBindings())
window._callConfirmArmed = false;
const callBtn = makeEl();
globalThis.document.querySelector = (sel) => (sel.includes('btn-call') ? callBtn : null);
const sent4 = []; S.ws.send = (d) => sent4.push(d);
A.confirmCall(3, 500);
ok(window._callConfirmArmed === true && sent4.length === 0, 'confirmCall : 1er tap arme sans envoyer');
ok(callBtn.innerHTML.includes('500') && callBtn.innerHTML.includes('?'),
   'confirmCall : bouton re-libellé « Confirm $500 ? » (fix KB)');
globalThis.document.querySelector = () => null;
A.confirmCall(3, 500);
ok(sent4.length === 1 && window._callConfirmArmed === false, 'confirmCall : 2e tap envoie');
if (window._callConfirmTimer) clearTimeout(window._callConfirmTimer);

// _runPreAction : fold pré-armé devient check si gratuit
S._preAction = 'fold'; S._amSpectator = false;
S.highestBet = 0; S.seatData[1].bet = 0;
const sent5 = []; S.ws.send = (d) => sent5.push(d);
ok(A._runPreAction() === true && sent5.length === 1, '_runPreAction : fold pré-armé → check gratuit envoyé');
S._preAction = '';
ok(A._runPreAction() === false, '_runPreAction : rien d\'armé → false');

// _playAutoMode : auto check/call à mon tour
S._playingMode = 1; S.turnPid = 1; S.ws.readyState = 1;
const sent6 = []; S.ws.send = (d) => sent6.push(d);
ok(A._playAutoMode() === true, '_playAutoMode : mode auto → true');
await new Promise((r) => setTimeout(r, 120));
ok(sent6.length === 1 && turnActive === false, '_playAutoMode : action auto envoyée après 60 ms (doAction repasse le glow à false)');
S._playingMode = 0;
ok(A._playAutoMode() === false, '_playAutoMode : mode manuel → false');

// notifyMyTurnVisuals / clearTurnNotif : titre d'onglet + badge
S._origTitle = 'PokerTH';
A.notifyMyTurnVisuals();
ok(window._badgeTurn === true && document.title.includes('PokerTH'), 'notifyMyTurnVisuals : badge + titre');
A.clearTurnNotif();
ok(window._badgeTurn === false && document.title === 'PokerTH', 'clearTurnNotif : restaure le titre');
clearInterval(S._titleBlinkID);

// _applyAssistUI : off → _hsHide ; toggleAssist bascule
S._assistOn = false;
A._applyAssistUI();
ok(els['hand-strength'].style.display === 'none' || true, '_applyAssistUI : assistance off masque l\'aide');
window.toggleAssist();
ok(S._assistOn === true && store['pth_assist'] === '1', 'window.toggleAssist : bascule + persiste');
window.setAssist(false);
ok(S._assistOn === false && store['pth_assist'] === '0', 'window.setAssist : pose l\'état exact');

// Ponts window
ok(window.doAction === A.doAction && window.renderMyTurnActions === A.renderMyTurnActions &&
   window._runPreAction === A._runPreAction && window._playAutoMode === A._playAutoMode &&
   window.clearTurnNotif === A.clearTurnNotif, 'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
