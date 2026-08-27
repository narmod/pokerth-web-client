// ═══════════════════════════════════════════════════════════════════
// Barre d'action (parité GameActionBar QML) : rendu des boutons
// Fold / Check-Call / Bet-Raise / All-In + aperçu pré-action, envoi
// des actions (doAction/doRaise), anti-call accidentel (confirmCall),
// exécution des pré-actions et du mode auto, notifications « mon
// tour », panneau d'assistance — chantier ESM #9g-B4.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t/esc/fmtChips/hapticBuzz/speak/stopTurnTimer/MSG/send/
// _hsHide/renderHandStrength/renderPreFlopStrength importés ;
// window.* pour les globaux du script : pkTerm (8×), _keyBindings,
// setMyTurnActive (2×), getPlayerName (2×), logAction,
// renderGameWaiting, updateBottomLayout (3×), clearSpectatorActions,
// et les vars top-level _lastCallSeen/_lastBoardCount/
// _callConfirmArmed/_callConfirmTimer ; 5× $( réécrits. Les closures
// window.toggleAssist/setAssist déménagent avec _applyAssistUI.
// FIX 9g-B4b (0.3.855) : le bug latent `KB` de confirmCall (local de
// renderMyTurnActions → ReferenceError, relabel jamais affiché) est
// corrigé — les bindings sont relus via window._keyBindings().
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from './misc.mjs';
import { fmtChips } from './fmt.mjs';
import { hapticBuzz, speak } from './media.mjs';
import { stopTurnTimer } from '../game/turn-timer.mjs';
import { MSG } from '../net/messages.mjs';
import { send } from '../net/session.mjs';
import { _hsHide, renderHandStrength, renderPreFlopStrength } from './odds-panel.mjs';
import { raiseStepFor, roundedRaiseAmount, isCoarsePointer, keypadAvailable,
         openBetKeypad, closeBetKeypad } from './bet-keypad.mjs';

// Joue l'action du mode auto courant a NOTRE tour (sans afficher les boutons).
// Retourne true si une action auto a ete declenchee.
function _playAutoMode() {
  if (S._playingMode === 0 || S.turnPid !== S.myId) return false;
  if (!S.ws || S.ws.readyState !== WebSocket.OPEN) return false;
  // Plus de toast (demande narmod 2026-07-18) : l'indicateur visuel du mode
  // auto est le dropdown de mode encadré d'or (.mode-sel-wrap.mode-auto).
  window.setMyTurnActive(true);
  // Parité QML 2.1.6 (runAutoAction) : l'action est recalculée AU MOMENT du
  // tir, pas à l'armement — pendant les 60 ms de délai, une relance adverse
  // a pu arriver. Auto Check/Fold ne joue qu'un check réellement gratuit à
  // cet instant, sinon fold (espérance 0 garantie). Auto Check/Call calle
  // sciemment n'importe quel montant (sémantique « −1 » du QML), recalculé
  // frais pour que la garde de doAction le laisse passer.
  setTimeout(function () {
    if (S._playingMode === 0 || S.turnPid !== S.myId) return; // mode coupé / tour passé
    var _b  = (S.seatData[S.myId] || {}).bet || 0;
    var _tc = Math.max(0, S.highestBet - _b);
    if (_tc === 0) { doAction(2, 0); return; }                 // check gratuit
    if (S._playingMode === 2) { doAction(1, 0); return; }      // Check/Fold → fold
    var _m = (S.seatData[S.myId] || {}).money || 0;            // Check/Call → tout montant
    if (_tc >= _m) doAction(6, _m); else doAction(3, _tc);
  }, 60);
  return true;
}

function _updatePinBtn() {
  // Mode masqué permanent (option « barre joueur masquée » retirée) : la
  // barre d'action est affichée en permanence -> le bouton épingle est
  // définitivement inutile, on le cache.
  var b = document.getElementById('g-pin-btn'); if (!b) return;
  b.style.display = 'none';
}

function _renderPreActionPanel() {
  // Affiche EXACTEMENT le même panneau d'action que pendant notre tour
  // (Fold / Call / %, relance, All-In, AUTO), mais en mode aperçu :
  // tout est non cliquable sauf le bouton AUTO. Voir
  // renderMyTurnActions(preview=true) et la classe CSS .actions-preview.
  renderMyTurnActions(true);
}

// Ferme le panneau et restaure le message d'attente du tour courant.
function _closePreActionPanel() {
  S._preActionOpen = false;
  // Narrateur de tour retiré (fidélité QML) : plus de texte « X ... », on
  // repasse par renderGameWaiting avec un message vide pour conserver la
  // logique aperçu/pin côté joueur.
  window.renderGameWaiting('', true);
}

// ── Notification + titre dynamique quand c'est mon tour ──

// BUG FIX: this function used to be named notifyMyTurn(), which
// shadowed the sound-playing notifyMyTurn() exported by sounds.mjs onto
// window. As a result, the audio "ding-dong" never played -- only the
// browser-tab title blink. Renamed to notifyMyTurnVisuals so the audio
// and the visual cue are both fired explicitly (see call sites below).
function notifyMyTurnVisuals() {
  var msg = t('notifTurnTitle');
  var sub = t('notifTurnBody');
  speak(t('voiceYourTurn'), { interrupt: true });
  // App-icon badge (installed PWA) — feature-detected global helper.
  window._badgeTurn = true;
  if (window.refreshAppBadge) window.refreshAppBadge();
  // Notification navigateur (si onglet en arrière-plan)
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    _showTurnNotification(msg, sub);
  }
  // Titre d'onglet dynamique + clignotement
  clearInterval(S._titleBlinkID);
  var blink = true;
  document.title = msg + ' — PokerTH';
  S._titleBlinkID = setInterval(function() {
    document.title = blink ? (msg + ' — PokerTH') : S._origTitle;
    blink = !blink;
  }, 900);
  // Arrêter quand l'onglet est de nouveau actif
  document.addEventListener('visibilitychange', function handler() {
    if (!document.hidden) {
      clearInterval(S._titleBlinkID);
      document.title = S._origTitle;
      document.removeEventListener('visibilitychange', handler);
    }
  });
}

// La notification de tour porte deux boutons — Fold et Check/Call — pour jouer
// sans revenir dans l'application. Seul un service worker peut poser des
// boutons (showNotification), donc on passe par lui quand il est disponible et
// on retombe sur la notification simple sinon (Safari, SW pas encore prêt) :
// dans tous les cas le joueur voit exactement la même alerte qu'avant.
// Libellés en anglais comme partout ailleurs pour les actions de poker.
function _turnNotifOptions() {
  var toCall = 0, money = 0;
  try {
    var sd = S.seatData[S.myId] || {};
    toCall = Math.max(0, (S.highestBet || 0) - (sd.bet || 0));
    money  = sd.money || 0;
  } catch (e) {}
  var second = (toCall === 0) ? 'Check'
             : (toCall >= money ? 'All-In' : 'Call ' + toCall);
  return { toCall: toCall, actions: [
    { action: 'fold', title: 'Fold' },
    { action: 'checkcall', title: second }
  ] };
}
function _showTurnNotification(msg, sub) {
  var base = { body: sub, icon: '/icon-192.png', badge: '/icon-192.png',
               tag: 'pokerth-turn', renotify: true, silent: false,
               vibrate: S._hapticEnabled ? [90, 50, 90] : [] };
  var sw = null;
  try { sw = navigator.serviceWorker; } catch (e) {}
  if (sw && sw.ready && typeof Notification !== 'undefined' && 'actions' in Notification.prototype) {
    var opt = _turnNotifOptions();
    base.actions = opt.actions;
    sw.ready.then(function (reg) {
      // Le tour a pu passer pendant que le worker se réveillait.
      if (S.turnPid !== S.myId) return;
      return reg.showNotification(msg, base);
    }).catch(function () {
      try { new Notification(msg, base); } catch (e) {}
    });
    return;
  }
  try { new Notification(msg, base); } catch (e) {}
}

// Action choisie depuis la notification (message posté par le service worker).
// Rien n'est envoyé à l'aveugle : le tour est revérifié ici, et les montants
// sont recalculés au moment du tir comme le fait le mode automatique — une
// relance adverse arrivée entre-temps transforme un Call périmé en simple
// re-rendu par la garde de doAction.
function _runNotifAction(which) {
  if (S.turnPid !== S.myId) return;
  if (which === 'fold') { doAction(1, 0); }
  else if (which === 'checkcall') {
    var sd = S.seatData[S.myId] || {};
    var tc = Math.max(0, (S.highestBet || 0) - (sd.bet || 0));
    var money = sd.money || 0;
    if (tc === 0) doAction(2, 0);
    else if (tc >= money) doAction(6, money);
    else doAction(3, tc);
  }
  try { clearTurnNotif(); } catch (e) {}
}
try {
  if (navigator.serviceWorker && navigator.serviceWorker.addEventListener) {
    navigator.serviceWorker.addEventListener('message', function (ev) {
      var d = ev && ev.data;
      if (d && d.type === 'NOTIF_ACTION') _runNotifAction(d.action);
    });
  }
} catch (e) {}

function clearTurnNotif() {
  clearInterval(S._titleBlinkID);
  document.title = S._origTitle;
  window._badgeTurn = false;
  if (window.refreshAppBadge) window.refreshAppBadge();
  // Une notification posée par le service worker survit au tour : la retirer,
  // sinon ses boutons resteraient offerts alors que la main a avancé.
  try {
    navigator.serviceWorker.ready.then(function (reg) {
      return reg.getNotifications({ tag: 'pokerth-turn' });
    }).then(function (list) {
      (list || []).forEach(function (n) { try { n.close(); } catch (e) {} });
    }).catch(function () {});
  } catch (e) {}
}

// ── Assistance (aide « force de la main ») : entrée du menu •••  ──
// Met à jour l'indicateur d'état du menu et affiche/masque l'aide.
function _applyAssistUI() {
  var st = document.getElementById('assist-state-mob');
  if (st) {
    st.textContent = S._assistOn ? '\u2713' : '';
    st.style.color = 'var(--green)';
  }
  var hs = document.getElementById('hand-strength');
  if (!S._assistOn) {
    if (hs) _hsHide(hs);
  } else {
    // Réafficher l'aide adaptée à la phase courante.
    var nComm = (S.commCards || []).filter(function(c){ return c != null; }).length;
    if (nComm > 0) renderHandStrength(); else renderPreFlopStrength();
  }
}
window.toggleAssist = function() {
  S._assistOn = !S._assistOn;
  try { localStorage.setItem('pth_assist', S._assistOn ? '1' : '0'); } catch(e) {}
  _applyAssistUI();
  if (typeof showKeyHint === 'function') showKeyHint(t('assist') + (S._assistOn ? ' \u2713' : ''));
};
// Variante setter (pour la case a cocher des options avancees) : pose l'etat
// exact au lieu de basculer, puis rafraichit la fenetre d'assistance.
window.setAssist = function(on) {
  S._assistOn = !!on;
  try { localStorage.setItem('pth_assist', S._assistOn ? '1' : '0'); } catch(e) {}
  _applyAssistUI();
};

// Barre d'action verrouillee : rien a decider pour l'instant, donc ni clic
// ni pre-armement (comportement des clients Qt-Widgets et QML, confirme par
// sp0ck : « buttons are deactivated until next raise or until next round »).
// Six cas, calques sur actionsArmed du QML :
//   · showdown en cours   -> jusqu'a la main suivante ;
//   · cartes communes en cours de revelation ;
//   · manche de mise close -> jusqu'a ce que quelqu'un reprenne la parole
//     avec les montants de la nouvelle manche ;
//   · j'ai jete ma main   -> jusqu'a la main suivante ;
//   · je suis a tapis     -> plus rien a decider de la main ;
//   · j'ai deja parle sur cette street et personne ne m'a relance depuis
//     -> jusqu'a une relance adverse (toCall repasse > 0) ou la street
//        suivante, qui remet _actedStreet en decalage.
// Minimum RELATIVE raise amount, mirroring GameHandler::recomputeActionState()
// in the official QML client (gamehandler.cpp):
//
//   preflop  : minimum = (highestSet - mySet) + minimumRaise
//   postflop : highestSet == 0 -> minimum = 2 * smallBlind   (opening bet)
//              otherwise       -> (highestSet - mySet) + minimumRaise
//   minimum is then clamped to the player's stack (maxRaise = myCash).
//
// MyActionRequest.myRelativeBet is RELATIVE: the server does
// player->setMySet(bet), which ADDS the amount to the player's current set.
// The previous code sent `S.minRaise` (= BettingRound::getMinimumRaise(), the
// raise INCREMENT only, field 8 of PlayersActionDone) and therefore omitted
// the call portion: with mySet=0, highestSet=100, minRaise=100 it sent 100, so
// the new set was exactly the highest set. checkMyAction() accepts that
// (targetBet >= minimumRaise) and PerformPlayerAction() then leaves highestSet
// untouched -> the raise silently degraded into a plain call
// (forum bug report, 02/08/2026: "raise button only a call").
function _minRaiseRel() {
  const sd         = (S.seatData && S.seatData[S.myId]) || {};
  const myMoney    = sd.money || 0;
  const mySet      = sd.bet   || 0;
  const highestSet = S.highestBet || 0;
  const bb         = Math.max(1, S.smallBlind * 2);
  let minimum;
  if (highestSet === 0) {
    minimum = bb;                                       // opening bet
  } else {
    // S.minRaise == 0 only before the first PlayersActionDone of the round;
    // the big blind is the engine's default minimum raise in that window.
    minimum = (highestSet - mySet) + (S.minRaise > 0 ? S.minRaise : bb);
  }
  if (minimum < 0) minimum = 0;
  return Math.min(minimum, myMoney);
}
window._minRaiseRel = _minRaiseRel;

function _barLocked() {
  if (S._inShowdown || S._boardDealing || S._roundEnded) return true;
  var sd = (S.seatData && S.seatData[S.myId]) || null;
  if (!sd) return false;
  if (sd.folded) return true;
  if ((sd.money || 0) <= 0) return true;                    // tapis (ou elimine)
  var board = (S.commCards || []).filter(function (c) { return c != null; }).length;
  var toCall = Math.max(0, S.highestBet - (sd.bet || 0));
  return (S._actedStreet === board && toCall === 0);
}
window._barLocked = _barLocked;

// Exécute l'action pré-armée quand notre tour arrive (runPreAction officiel).
// Recalcule le contexte au moment de l'exécution. Un Fold pré-armé devient
// Check si le check est gratuit. Retourne true si une action a été jouée.
function _runPreAction() {
  if (!S._preAction || S._amSpectator) return false;
  var pa = S._preAction;
  var myMoney = (S.seatData[S.myId] || {}).money || 0;
  var myBet   = (S.seatData[S.myId] || {}).bet   || 0;
  var toCall  = Math.max(0, S.highestBet - myBet);
  // Execution-time invalidation (official onCallAmountChanged semantics,
  // boehmi bug report 31/07/2026): a pre-armed Check/Call or Raise is only
  // valid for the amount it was armed at. If someone raised (or went all-in)
  // AFTER arming — especially the player right before us, e.g. SB shoving
  // into the BB, where no preview re-render ever runs the render-time
  // invalidation — the armed "Check" must NOT silently become a call of the
  // raise. Drop the pre-action and show the live action bar instead so the
  // player decides. Fold and All-In stay valid (amount-independent).
  if ((pa === 'call' || pa === 'raise') && toCall !== S._preActionToCall) {
    S._preAction = '';
    return false;
  }
  var canCheck = toCall === 0;
  var minBet = _minRaiseRel();
  var canRaise = myMoney > toCall && myMoney >= minBet;
  if (pa === 'fold')  { if (canCheck) doAction(2, 0); else doAction(1, 0); return true; }
  if (pa === 'call')  { if (canCheck) doAction(2, 0); else if (toCall >= myMoney) doAction(6, myMoney); else doAction(3, toCall); return true; }
  if (pa === 'allin') { doAction(6, myMoney); return true; }
  if (pa === 'raise') { if (!canRaise) return false; if (minBet >= myMoney) doAction(6, myMoney); else doAction(5, minBet); return true; }
  return false;
}

function renderMyTurnActions(preview) {
  // Le panneau est reconstruit : un pave de mise encore ouvert porterait des
  // bornes perimees (une relance adverse a pu passer). On le ferme d'abord.
  try { closeBetKeypad(); } catch (e) {}
  // iOS/Android : ne pas detruire #mode-sel pendant que l'utilisateur le
  // manipule (le picker natif se fermerait). On differe le rafraichissement
  // de l'apercu hors-tour jusqu'a la fin de l'interaction (voir _modeSelHold).
  if (preview && S._modeSelBusy && document.getElementById('mode-sel')) {
    S._modeSelPendingPreview = true;
    return;
  }
  // Defensive: never render action buttons in spectator mode. The
  // server normally won't send PlayersTurn to spectators, but we
  // guard against it anyway so a stray message can't accidentally
  // give the user an action UI they shouldn't have.
  if (S._amSpectator) {
    window.clearSpectatorActions();
    return;
  }
  // Main jetée : la barre reste EXACTEMENT celle de l'instant du fold. Le
  // premier rendu replié passe — il applique .no-action et fige les montants
  // tels qu'ils étaient — puis les suivants sont ignorés : les mises des
  // autres continuent, mais nos boutons n'ont plus rien à en dire (rapport
  // forum : « the action key labels continue to update after you have
  // folded »). folded repasse à false au HandStart, ce qui rouvre le rendu.
  // Le dropdown de mode reste utilisable : setPlayingMode met à jour sa
  // sélection et son cadre or chirurgicalement, sans re-rendu.
  if (preview) {
    var _sdFz = (S.seatData && S.seatData[S.myId]) || null;
    var _foldedNow = !!(_sdFz && _sdFz.folded);
    var _gaFz = document.getElementById('g-actions');
    if (_foldedNow && S._foldBarFrozen && _gaFz && _gaFz.innerHTML && _gaFz.innerHTML.indexOf('actions-preview') >= 0) return;
    S._foldBarFrozen = _foldedNow;
  }
  // Invalidation d'une pré-action call/raise si la mise à suivre a changé
  // depuis l'armement (comme l'officiel : onCallAmountChanged). Fold/All-In
  // restent valides (pas de dépendance au montant).
  var _paCurToCall = Math.max(0, S.highestBet - ((S.seatData[S.myId] || {}).bet || 0));
  if (S._preAction && (S._preAction === 'call' || S._preAction === 'raise') && _paCurToCall !== S._preActionToCall) {
    S._preAction = '';
  }
  const myMoney = (S.seatData[S.myId] || {}).money || 0;
  const myBet   = (S.seatData[S.myId] || {}).bet || 0;
  const toCall  = Math.max(0, S.highestBet - myBet);
  const canCheck = toCall === 0;
  // ── Anti-Call accidentel : grosse relance ? ──
  // Vrai si "à suivre" a au moins DOUBLÉ et bondi de >= 2 BB depuis ma dernière
  // décision sur CETTE street (suivi remis à zéro par street via le nombre de
  // cartes du board). Si vrai, le clic Call passera par App.confirmCall (2e tap).
  var _bigRaise = false;
  if (!preview) {
    // Anti-call accidentel : INACTIF par défaut (choix web) ; actif seulement si coché.
    var _gc = false; try { _gc = (localStorage.getItem('pth_guard_call') === '1'); } catch (e) {}
    var _ncomm = (S.commCards || []).filter(function (c) { return c != null; }).length;
    if (_ncomm !== window._lastBoardCount) { window._lastCallSeen = -1; window._lastBoardCount = _ncomm; }
    if (_gc && !canCheck && toCall > 0) {
      var _bb = Math.max(1, S.smallBlind * 2);
      var _base = (window._lastCallSeen >= 0) ? window._lastCallSeen : _bb;
      if (toCall >= 2 * _base && (toCall - _base) >= 2 * _bb) _bigRaise = true;
    }
    window._lastCallSeen = toCall;
    window._callConfirmArmed = false; // panneau frais : aucune confirmation en attente
  }
  const minBet  = _minRaiseRel();
  const p33  = Math.min(myMoney, Math.max(minBet, Math.round(S.pot * 0.33)));
  const p50  = Math.min(myMoney, Math.max(minBet, Math.round(S.pot * 0.5)));
  const p100 = Math.min(myMoney, Math.max(minBet, S.pot));
  // (Pot odds « (X%) » retire du bouton Suivre : parite GameActionBar QML
  //  qui n'affiche que « Call $X ».)
  // Si toCall >= myMoney, le call consommerait tout le stack — c'est
  // un all-in implicite. On route vers action=6 (All-in) au lieu de
  // action=3 (Call), sinon le serveur rejette (montant > stack).
  // Le label affiche le montant disponible avec un indicateur "(All-In)".
  let callLabel, callAction, callClass;
  if (canCheck) {
    callLabel  = window.pkTerm('check');
    callAction = 'App.doAction(2,0)';
    callClass  = 'btn-check';
  } else if (toCall >= myMoney) {
    callLabel  = window.pkTerm('call') + ' <b>' + fmtChips(myMoney) + '</b> <span style="font-size:0.75em;opacity:0.85">(' + window.pkTerm('allin') + ')</span>';
    callAction = 'App.doAction(6,' + myMoney + ')';
    callClass  = 'btn-call';
  } else {
    callLabel  = window.pkTerm('call') + ' <b>' + fmtChips(toCall) + '</b>';
    callAction = 'App.doAction(3,' + toCall + ')';
    callClass  = 'btn-call';
  }
  // Anti-Call accidentel : si grosse relance + option active, exiger un 2e tap.
  if (_bigRaise && callClass === 'btn-call') {
    var _ca   = (toCall >= myMoney) ? 6 : 3;
    var _camt = (toCall >= myMoney) ? myMoney : toCall;
    callAction = 'App.confirmCall(' + _ca + ',' + _camt + ')';
  }
  const raiseLabel = S.highestBet > 0 ? window.pkTerm('raise') : window.pkTerm('bet');

  // Peut relancer : doit avoir plus que le montant du call ET >= mise min
  const canRaise = myMoney > toCall && myMoney >= minBet;
  const da = canRaise ? '' : ' disabled'; // disabled attribute
  const allInOnly = myMoney <= toCall;    // ne peut que call ou all-in

  var KB = window._keyBindings(); // touches liées (badges des boutons)
  // Parite QML GameActionBar : le slider avance par paliers raiseStepFor(max)
  // (10 / 50 / 500 / 5000 selon le tapis) et non au jeton pres — c'est ce qui
  // le rend visable au doigt. La sortie passe par roundedRaiseAmount, le
  // maximum restant exact pour que le haut du slider soit un vrai all-in. La
  // SAISIE (champ et pave) reste, elle, precise au jeton.
  const _step = raiseStepFor(myMoney);
  // Pointeur grossier : le champ passe en lecture seule avec inputmode="none"
  // — le clavier systeme n'est jamais convoque (il masquait la table et
  // repoussait toute la mise en page sur iOS), un tap ouvre le pave integre.
  // Pointeur fin tactile (PC a ecran tactile) : le champ garde son clavier
  // physique, le pave reste accessible par le bouton a cote.
  const _coarse = isCoarsePointer();
  // Le bouton pave ne sert QUE la ou un tap sur le champ n'ouvre pas deja le
  // pave : PC et tablettes tactiles a pointeur fin. Sur telephone (pointeur
  // grossier) le champ EST le declencheur, l'icone faisait doublon.
  const _kpAvail = keypadAvailable() && !_coarse;
  const _fldAttrs = _coarse
    ? ' readonly inputmode="none" onclick="App.openBetKeypad()"'
    : ' inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" autocomplete="off" onfocus="this.select()"';
  const betRowHtml = '<div class="bet-row">'
    + '<input class="raise-amt-field" id="raise-amt" type="number" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '"' + da + _fldAttrs
    + ' oninput="var s=document.getElementById(\'raise-slider\');if(s)s.value=this.value">'
    + (_kpAvail
        ? '<button type="button" class="kp-open-btn"' + da + ' onclick="App.openBetKeypad()" title="' + esc(t('betKeypad')) + '" aria-label="' + esc(t('betKeypad')) + '">'
          + '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor">'
          + '<circle cx="6" cy="5.5" r="1.7"/><circle cx="12" cy="5.5" r="1.7"/><circle cx="18" cy="5.5" r="1.7"/>'
          + '<circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/>'
          + '<rect x="4" y="17" width="16" height="2.6" rx="1.3"/></svg></button>'
        : '')
    + '<input class="raise-slider" id="raise-slider" type="range" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '" step="' + _step + '"' + da
    + ' oninput="var a=document.getElementById(\'raise-amt\');if(a)a.value=App._roundRaise(this.value,' + minBet + ',' + myMoney + ')">'
    + '</div>';

  // Sélecteur de mode PERSISTANT (remplace l'ancien bouton AUTO, même emplacement) :
  // Manuel / Auto Check-Call / Auto Check-Fold. Piloté par App.setPlayingMode.
  const modeSel = '<div class="sel-wrap mode-sel-wrap' + (S._playingMode !== 0 ? ' mode-auto' : '') + '">'
    + '<select id="mode-sel" autocomplete="off" onfocus="App._modeSelHold(true)" onblur="App._modeSelHold(false)" onchange="App.setPlayingMode(this.selectedIndex)">'
    +   '<option' + (S._playingMode === 0 ? ' selected' : '') + '>' + t('modeManual') + '</option>'
    +   '<option' + (S._playingMode === 1 ? ' selected' : '') + '>' + t('modeAutoCheckCall') + '</option>'
    +   '<option' + (S._playingMode === 2 ? ' selected' : '') + '>' + t('modeAutoCheckFold') + '</option>'
    + '</select><span class="sel-arr">▾</span></div>';

  // En aperçu (hors-tour), les 4 boutons d'action ARMENT une pré-action au
  // lieu d'agir ; le bouton armé reçoit la classe .prearmed (bord or).
  var _pv = !!preview;
  // Rien a decider : les 4 touches deviennent inertes (aucun clic, aucun
  // pré-armement) jusqu'a ce que la parole me revienne — .no-action.
  var _fo = _pv && _barLocked();
  function _preClk(name, live) { return _pv ? "App.armPreAction('" + name + "')" : live; }
  function _preCls(name) { return (_pv && S._preAction === name) ? ' prearmed' : ''; }

  const h = '<div class="action-grid">'
    + betRowHtml
    + '<div class="mid-row">'
    +   '<div class="pct-row">'
    +     '<button class="btn-pct"' + da + ' onclick="setPct(' + p33  + ')"><span class="pct-p">1/3</span><span class="act-key">' + KB.bet1.toUpperCase() + '</span></button>'
    +     '<button class="btn-pct"' + da + ' onclick="setPct(' + p50  + ')"><span class="pct-p">1/2</span><span class="act-key">' + KB.bet2.toUpperCase() + '</span></button>'
    +     '<button class="btn-pct"' + da + ' onclick="setPct(' + p100 + ')"><span class="pct-p">Pot</span><span class="act-key">' + KB.bet3.toUpperCase() + '</span></button>'
    +   '</div>'
    +   (window._canShowCards
           // Parité QML GameActionBar §5.1 : post-river, le bouton All-In
           // devient « Show » (canShowCards) — jamais pré-armable.
           ? '<button class="btn-action btn-allin btn-show" onclick="event.stopPropagation();App.showMyCards&&App.showMyCards()" title="Show (F5)">' + t('showCards') + ' \ud83d\udc41</button>'
           : '<button class="btn-action btn-allin' + _preCls('allin') + '" onclick="' + _preClk('allin', 'App.doAction(6,' + myMoney + ')') + '" title="All-In (A)">' + window.pkTerm('allin') + '<span class="act-key">' + KB.allin.toUpperCase() + '</span></button>')
    +   modeSel
    + '</div>'
    + '<div class="act-buttons-row">'
    +   '<button class="btn-action btn-fold' + _preCls('fold') + '" onclick="' + _preClk('fold', 'App.doAction(1,0)') + '" title="Fold (F)">' + window.pkTerm('fold') + '<span class="act-key">' + KB.fold.toUpperCase() + '</span></button>'
    +   '<button class="btn-action ' + callClass + _preCls('call') + '" onclick="' + _preClk('call', callAction) + '" title="Call/Check (C)">' + callLabel + '<span class="act-key">' + KB.call.toUpperCase() + '</span></button>'
    +   '<button class="btn-action btn-raise raise-btn' + _preCls('raise') + '"' + da + ' onclick="' + _preClk('raise', 'App.doRaise()') + '" title="Raise (R)">' + raiseLabel + (canRaise ? ' <b class="raise-btn-amt">' + fmtChips(minBet) + '</b>' : '') + '<span class="act-key">' + KB.raise.toUpperCase() + '</span></button>'
    + '</div>'
    + '</div>';

  // Montant dynamique sur le bouton Relancer (parite GameActionBar QML :
  // « Relancer $X », X suit le champ/slider). Def unique, appelee apres
  // chaque injection (live + apercu) ; exposee pour setPct.
  function _wireRaiseBtn() {
    var _amt = document.getElementById('raise-amt');
    var _sld = document.getElementById('raise-slider');
    function _sync() {
      var v = parseInt((_amt || {}).value, 10);
      if (!Number.isFinite(v)) v = minBet;
      var els = document.querySelectorAll('#g-actions .raise-btn-amt');
      for (var i = 0; i < els.length; i++) els[i].textContent = fmtChips(v);
    }
    if (_amt) _amt.addEventListener('input', _sync);
    if (_sld) _sld.addEventListener('input', _sync);
    window._syncRaiseBtnAmt = _sync;
    _sync();
  }

  if (preview) {
    // Aperçu hors-tour : EXACTEMENT le même panneau, mais non interactif
    // (la classe .actions-preview coupe pointer-events sauf sur AUTO).
    // Aucun son, aucune vibration, aucun keepalive serveur.
    // (Narrateur de tour "X ●●●" retiré — fidélité QML : le tour est
    // signalé uniquement par la surbrillance du siège.)
    document.getElementById('g-actions').innerHTML =
      '<div class="actions-preview' + (_fo ? ' no-action' : '') + '" data-cap="' + esc(t('preActionTitle')) + '">' + h + '</div>';
    window.updateBottomLayout();
    _wireRaiseBtn();
    return;
  }
  document.getElementById('g-actions').innerHTML = h;
  window.updateBottomLayout(); // paysage : recalcule la reserve sous la table apres le rendu live
  _wireRaiseBtn();
  // visual notification (they used to be one call, but the local function
  // shadowed the audio one).
  if (typeof window.notifyMyTurn === 'function') window.notifyMyTurn();
  if (typeof notifyMyTurnVisuals === 'function') notifyMyTurnVisuals();
  hapticBuzz([90, 50, 90]); // "your turn" double-buzz (mobile only)
  // NO ResetTimeoutMessage here. This function runs on its own every time the
  // turn comes round, so answering "still here" from it told the server a
  // player was present when nobody was: an abandoned tab kept its seat for
  // ever, auto-folded hand after hand, and the table never freed up. That is
  // exactly what the server-side AFK kick exists to prevent, and a QML client
  // in the same spot IS kicked. Upstream only ever sends a reset from real
  // input (GameHandler::eventFilter) or from the OK button of the timeout
  // popup (TimeoutMsgBoxImpl) -- never on "it is my turn". Tapping an action
  // button is real input and is already covered by _afkActivity in
  // modules/net/msg-social.mjs, which is the single sender on the web side.
}

// ─── Patch App with action methods ───

function doAction(action, bet) {
  // ── Garde de course Check/Call (parité QML 2.1.6, GameHandler::call) ──
  // Le montant attaché au clic (bet) est celui que le joueur a VU sur le
  // bouton au moment du rendu. Si un adversaire a misé/relancé/all-in dans
  // l'intervalle (le panneau n'a pas encore re-rendu), un Check voulu
  // deviendrait un Call du montant plein côté serveur, et un « Call 50 »
  // un call de la relance entière. On re-valide donc ICI, au moment de
  // l'envoi : l'action n'est exécutée que si l'engine ne demande pas plus
  // que ce qui était affiché. Sinon : rien n'est envoyé, la pré-action est
  // annulée et le panneau re-rendu aux nouveaux montants — c'est toujours
  // notre tour, le joueur décide. Fold et All-In sont indépendants du
  // montant et passent toujours ; Raise est déjà validé par doRaise et le
  // serveur (YourActionRejected).
  if (action === 2 || action === 3) {
    var _gExp  = (action === 2) ? 0 : (bet || 0);
    var _gCall = Math.max(0, S.highestBet - ((S.seatData[S.myId] || {}).bet || 0));
    // Absorption d'un 2e tap déjà « en vol » après un rejet : pendant la
    // courte fenêtre de blocage, un Check/Call re-cliqué ne part pas non
    // plus (équivalent de l'AccidentallyCallBlocker du QML, actif avec la
    // même option que l'anti-call accidentel, pth_guard_call).
    if (window._callBlockUntil && Date.now() < window._callBlockUntil) return;
    if (_gCall > _gExp) {
      S._preAction = '';
      var _gc2 = false; try { _gc2 = (localStorage.getItem('pth_guard_call') === '1'); } catch (e) {}
      if (_gc2) window._callBlockUntil = Date.now() + 1200;
      try { renderMyTurnActions(); } catch (e) {}
      return;
    }
  }
  // Guard contre les envois sur un WebSocket fermé/en cours de fermeture.
  // Sur mobile, une micro-coupure réseau (transition Wifi/4G) peut fermer
  // le WS sans qu'on s'en rende compte avant la prochaine action. send()
  // est silencieux si le WS n'est pas OPEN — on évitait donc d'envoyer
  // sans le savoir, puis on stoppait le timer et l'UI affichait
  // "Action envoyée" alors que rien n'avait quitté la machine.
  if (!S.ws || S.ws.readyState !== WebSocket.OPEN) {
    document.getElementById('g-actions').innerHTML = '<div class="waiting-msg" style="color:#e74c3c">⚠ '
      + t('wsLostAction')
      + '</div>';
    window.logAction(function(){ return '⚠ ' + t('wsSendFailed'); });
    return;
  }
  window.setMyTurnActive(false);
  send(MSG.buildMyAction(S.gId, S.handNum, S.gameState, action, bet));
  // Barre d'action TOUJOURS présente (demande narmod 2026-07-17) : le
  // remplacement de la grille par « Action envoyée » effondrait la hauteur
  // de #g-actions → re-layout de la table = zoom/dézoom désagréable. On
  // garde le panneau en mode APERÇU (boutons inertes à notre tour —
  // armPreAction no-op) ; le prochain état serveur re-rend la zone.
  try { renderMyTurnActions(true); }
  catch (e) { document.getElementById('g-actions').innerHTML = '<div class="waiting-msg">' + t('actionSent') + '</div>'; }
  stopTurnTimer();
}
// Anti-Call accidentel : 1er tap arme la confirmation (le bouton Call devient
// ambre « Confirm $X ? »), un 2e tap dans les 3 s valide l'action. Au-delà, ou
// sur un nouveau panneau, l'armement retombe (cf. reset dans renderMyTurnActions).
function confirmCall(action, amount) {
  var btn = document.querySelector('#g-actions .btn-action.btn-call');
  if (!window._callConfirmArmed) {
    window._callConfirmArmed = true;
    if (btn) {
      if (btn._origCall == null) btn._origCall = btn.innerHTML;
      btn.classList.add('confirm-call');
      var _kb = window._keyBindings(); // FIX 9g-B4b : `KB` était un local de renderMyTurnActions → ReferenceError, le relabel ne s'affichait jamais
        btn.innerHTML = t('confirmCall') + ' <b>' + fmtChips(amount) + '</b> ?<span class="act-key">' + _kb.call.toUpperCase() + '</span>';
    }
    try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {}
    if (window._callConfirmTimer) clearTimeout(window._callConfirmTimer);
    window._callConfirmTimer = setTimeout(function () {
      window._callConfirmArmed = false;
      var b = document.querySelector('#g-actions .btn-action.btn-call.confirm-call');
      if (b) { b.classList.remove('confirm-call'); if (b._origCall != null) { b.innerHTML = b._origCall; b._origCall = null; } }
    }, 3000);
    return;
  }
  window._callConfirmArmed = false;
  if (window._callConfirmTimer) { clearTimeout(window._callConfirmTimer); window._callConfirmTimer = null; }
  doAction(action, amount);
}
function doRaise() {
  // Validation préventive du montant avant envoi : sans ce clamp, un
  // input édité hors-bornes (valeur < minBet, > stack, vide ou non
  // numérique) provoquait un rejet serveur YourActionRejected. Les
  // attributs HTML min/max ne sont qu'indicatifs et ne bloquent pas
  // la soumission programmatique.
  const myMoney = (S.seatData[S.myId] || {}).money || 0;
  const myBet   = (S.seatData[S.myId] || {}).bet   || 0;
  const minBet  = _minRaiseRel();
  const _fld = document.getElementById('raise-amt');
  let amt = parseInt((_fld || {}).value, 10);
  const _typed = amt;                       // ce que le champ contient VRAIMENT
  if (!Number.isFinite(amt) || amt <= 0) amt = minBet;   // champ vide → mise min
  // Clamp dans [minBet, myMoney]. Si le résultat atteint le stack,
  // on bascule explicitement en All-in (action=6) — sémantiquement
  // plus juste et évite tout doute sur l'interprétation serveur.
  const _clamped = Math.max(minBet, Math.min(amt, myMoney));
  // ── Garde-fou « relance surprise » (parité QML 2.1.5, GameActionBar.onAccepted)
  // Un montant saisi HORS bornes était jusqu'ici clampé en silence : taper 300
  // avec 250 de tapis partait en All-In sans que rien ne l'annonce (rapport
  // joueur côté QML). Désormais on corrige le champ VISIBLEMENT, on
  // resélectionne le contenu et on ne joue PAS : c'est le second appui qui
  // valide le montant devenu visible. Le champ vide (NaN) ne déclenche rien —
  // c'est un raccourci volontaire vers la mise minimale.
  if (Number.isFinite(_typed) && _typed > 0 && _typed !== _clamped
      && (!window._advGet || window._advGet('guard_raise', true))) {
    if (_fld) {
      _fld.value = String(_clamped);
      try { _fld.focus(); _fld.select(); } catch (e) {}
    }
    const _sl = document.getElementById('raise-slider');
    if (_sl) _sl.value = String(_clamped);
    try { window.showKeyHint && window.showKeyHint(t('raiseAdjusted')); } catch (e) {}
    return;
  }
  amt = _clamped;
  if (amt >= myMoney) {
    doAction(6, myMoney);
  } else {
    doAction(S.highestBet > 0 ? 5 : 4, amt);
  }
}

// Pont pour les handlers inline du slider (App._roundRaise).
function _roundRaise(v, min, max) { return roundedRaiseAmount(parseInt(v, 10), min, max); }

export { _playAutoMode, _updatePinBtn, _renderPreActionPanel,
         _closePreActionPanel, notifyMyTurnVisuals, clearTurnNotif,
         _showTurnNotification, _runNotifAction,
         _applyAssistUI, _runPreAction, renderMyTurnActions,
         doAction, confirmCall, doRaise, _roundRaise };

for (const [k, v] of Object.entries({ _playAutoMode, _updatePinBtn,
  _renderPreActionPanel, _closePreActionPanel, notifyMyTurnVisuals,
  clearTurnNotif, _runNotifAction, _applyAssistUI, _runPreAction, renderMyTurnActions,
  doAction, confirmCall, doRaise, _roundRaise,
  openBetKeypad, closeBetKeypad })) window[k] = v;
