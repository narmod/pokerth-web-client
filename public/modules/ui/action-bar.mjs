// ═══════════════════════════════════════════════════════════════════
// Barre d'action (parité GameActionBar QML) : rendu des boutons
// Fold / Check-Call / Bet-Raise / All-In + aperçu pré-action, envoi
// des actions (doAction/doRaise), anti-call accidentel (confirmCall),
// exécution des pré-actions et du mode auto, notifications « mon
// tour », panneau d'assistance — chantier ESM #9g-B4.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t/esc/fmtChips/hapticBuzz/speak/stopTurnTimer/Proto/MSG/send/
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
import { Proto } from '../net/proto.mjs';
import { MSG } from '../net/messages.mjs';
import { send } from '../net/session.mjs';
import { _hsHide, renderHandStrength, renderPreFlopStrength } from './odds-panel.mjs';

// Joue l'action du mode auto courant a NOTRE tour (sans afficher les boutons).
// Retourne true si une action auto a ete declenchee.
function _playAutoMode() {
  if (S._playingMode === 0 || S.turnPid !== S.myId) return false;
  if (!S.ws || S.ws.readyState !== WebSocket.OPEN) return false;
  var myBet0    = (S.seatData[S.myId] || {}).bet || 0;
  var toCall0   = Math.max(0, S.highestBet - myBet0);
  var canCheck0 = toCall0 === 0;
  var act = canCheck0 ? 2 : (S._playingMode === 1 ? 3 : 1); // 2=check, 3=call, 1=fold
  var amt = (act === 3) ? toCall0 : 0;
  // Plus de toast (demande narmod 2026-07-18) : l'indicateur visuel du mode
  // auto est le dropdown de mode encadré d'or (.mode-sel-wrap.mode-auto).
  window.setMyTurnActive(true);
  setTimeout(function () { doAction(act, amt); }, 60);
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
  if (S.turnPid && S.turnPid !== S.myId && S.seatData[S.turnPid]) {
    window.renderGameWaiting(
      '<span style="font-family:inherit">' + esc(window.getPlayerName(S.turnPid)) + '</span>'
      + '<span class="thinking-dots"><span></span><span></span><span></span></span>', true);
  } else {
    document.getElementById('g-actions').innerHTML = '';
    window.updateBottomLayout();
  }
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
    try { new Notification(msg, { body: sub, icon: '/favicon.ico', tag: 'pokerth-turn', silent: false, vibrate: S._hapticEnabled ? [90, 50, 90] : [] }); } catch(e) {}
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

function clearTurnNotif() {
  clearInterval(S._titleBlinkID);
  document.title = S._origTitle;
  window._badgeTurn = false;
  if (window.refreshAppBadge) window.refreshAppBadge();
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

// Exécute l'action pré-armée quand notre tour arrive (runPreAction officiel).
// Recalcule le contexte au moment de l'exécution. Un Fold pré-armé devient
// Check si le check est gratuit. Retourne true si une action a été jouée.
function _runPreAction() {
  if (!S._preAction || S._amSpectator) return false;
  var pa = S._preAction;
  var myMoney = (S.seatData[S.myId] || {}).money || 0;
  var myBet   = (S.seatData[S.myId] || {}).bet   || 0;
  var toCall  = Math.max(0, S.highestBet - myBet);
  var canCheck = toCall === 0;
  var minBet = S.minRaise > 0 ? S.minRaise : Math.max(S.highestBet > 0 ? S.highestBet : S.smallBlind * 2, S.smallBlind * 2);
  var canRaise = myMoney > toCall && myMoney >= minBet;
  if (pa === 'fold')  { if (canCheck) doAction(2, 0); else doAction(1, 0); return true; }
  if (pa === 'call')  { if (canCheck) doAction(2, 0); else if (toCall >= myMoney) doAction(6, myMoney); else doAction(3, toCall); return true; }
  if (pa === 'allin') { doAction(6, myMoney); return true; }
  if (pa === 'raise') { if (!canRaise) return false; if (minBet >= myMoney) doAction(6, myMoney); else doAction(5, minBet); return true; }
  return false;
}

function renderMyTurnActions(preview) {
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
    // Anti-call accidentel : ACTIF par défaut (parité QML AccidentallyCallBlocker=1).
    var _gc = true; try { _gc = (localStorage.getItem('pth_guard_call') !== '0'); } catch (e) {}
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
  const minBet  = S.minRaise > 0 ? S.minRaise : Math.max(S.highestBet > 0 ? S.highestBet : S.smallBlind * 2, S.smallBlind * 2);
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
  const betRowHtml = '<div class="bet-row">'
    + '<input class="raise-amt-field" id="raise-amt" type="number" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '"' + da
    + ' oninput="var s=document.getElementById(\'raise-slider\');if(s)s.value=this.value">'
    + '<input class="raise-slider" id="raise-slider" type="range" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '" step="1"' + da
    + ' oninput="var a=document.getElementById(\'raise-amt\');if(a)a.value=this.value">'
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
           ? '<button class="btn-action btn-allin" onclick="event.stopPropagation();App.showMyCards&&App.showMyCards()" title="Show (F5)">' + t('showCards') + ' \ud83d\udc41</button>'
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
    // Mode masqué (player-bar cachée) : le narrateur de tour ("X ●●●"),
    // normalement affiché À LA PLACE de l'aperçu, est ré-injecté AU-DESSUS
    // des boutons pour conserver l'info "à qui le tour".
    var _narr = '';
    if (S.turnPid && S.turnPid !== S.myId && S.seatData[S.turnPid]) {
      _narr = '<div class="act-narrator"><span style="font-family:inherit">'
            + esc(window.getPlayerName(S.turnPid)) + '</span>'
            + '<span class="thinking-dots"><span></span><span></span><span></span></span></div>';
    }
    document.getElementById('g-actions').innerHTML = _narr +
      '<div class="actions-preview" data-cap="' + esc(t('preActionTitle')) + '">' + h + '</div>';
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
  // Tell server we're alive (avoid timeout)
  const rtm = Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]]);
  send(rtm);
}

// ─── Patch App with action methods ───

function doAction(action, bet) {
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
  const minBet  = S.minRaise > 0
    ? S.minRaise
    : Math.max(S.highestBet > 0 ? S.highestBet : S.smallBlind * 2, S.smallBlind * 2);
  let amt = parseInt((document.getElementById('raise-amt')||{}).value, 10);
  if (!Number.isFinite(amt) || amt <= 0) amt = minBet;
  // Clamp dans [minBet, myMoney]. Si le résultat atteint le stack,
  // on bascule explicitement en All-in (action=6) — sémantiquement
  // plus juste et évite tout doute sur l'interprétation serveur.
  amt = Math.max(minBet, Math.min(amt, myMoney));
  if (amt >= myMoney) {
    doAction(6, myMoney);
  } else {
    doAction(S.highestBet > 0 ? 5 : 4, amt);
  }
}

export { _playAutoMode, _updatePinBtn, _renderPreActionPanel,
         _closePreActionPanel, notifyMyTurnVisuals, clearTurnNotif,
         _applyAssistUI, _runPreAction, renderMyTurnActions,
         doAction, confirmCall, doRaise };

for (const [k, v] of Object.entries({ _playAutoMode, _updatePinBtn,
  _renderPreActionPanel, _closePreActionPanel, notifyMyTurnVisuals,
  clearTurnNotif, _applyAssistUI, _runPreAction, renderMyTurnActions,
  doAction, confirmCall, doRaise })) window[k] = v;
