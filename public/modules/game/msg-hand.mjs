// ═══════════════════════════════════════════════════════════════════
// Handlers réseau — déroulé de main, partie 1/2 (GameStartInitial,
// HandStart) — chantier ESM #9g-C5a. Corps EXACTS des anciennes cases
// de handleMsg ; `break` de case → `return;` (règle C3).
// HandStart couvre : reset de main, déchiffrement des cartes
// (PTHCrypto, comptes auth pokerth.net), snapshot des stacks, dealer/
// blinds (+ toast et minuteur de montée), sons, distribution animée,
// pré-actions/odds. Adaptations comptées : 12 imports de modules ;
// window.* pour les fonctions pontées (renderSeats, getPlayerName,
// logAction, _wpHide, renderGameWaiting, _rebroadcastAvatar,
// _showBlindsToast, notifyCard, animateDealerMove, fadeOutAllActions,
// animateDealMyCards, resetBlindRaises), les vars top-level du script
// _sdLosers/_sdWinners/_ownReveal/_lastCallSeen/_callConfirmArmed
// (affectations nues = ReferenceError en module strict — leçon C5a :
// acorn-walk ne visite pas les Identifier en position de pattern,
// audit par tokens désormais obligatoire) et `_prevDealerPid` (var de
// module anim.mjs exposée par accesseur window get/set) ; $( réécrit.
// ═══════════════════════════════════════════════════════════════════
import { S } from './state.mjs';
import { Proto } from '../net/proto.mjs';
import { MSG } from '../net/messages.mjs';
import { PTHCrypto } from '../net/crypto.mjs';
import { send, setStatus, show } from '../net/session.mjs';
import { t } from '../i18n.mjs';
import { _groupThousands } from '../ui/fmt.mjs';
import { cardName } from '../ui/deck.mjs';
import { _fmtBlindsCountdown, _startBlindsCountdown, _stopBlindsCountdown } from '../ui/game-info.mjs';
import { _setCanShow, renderMyCards, renderComm, animateCardDeal } from '../ui/table-cards.mjs';
import { clearTurnNotif } from '../ui/action-bar.mjs';
import { renderPreFlopStrength, renderOddsMonitor, _hsHide } from '../ui/odds-panel.mjs';
import { autoScaleTable } from '../game/seats.mjs';
import { renderStats, initStats } from '../game/stats.mjs';
import { _updateLobbyWaitStatus, _renderLobbyWaitActions } from '../ui/lobby.mjs';

import { esc } from '../ui/misc.mjs';
import { fmtChips, fmtChipsVoice } from '../ui/fmt.mjs';
import { evaluateBestHand, _qmlWinningHandText } from '../game/cards.mjs';
import { animateChipToPot } from '../ui/table-cards.mjs';
import { renderHandStrength } from '../ui/odds-panel.mjs';
import { startTurnTimer, stopTurnTimer } from '../game/turn-timer.mjs';
import { renderMyTurnActions, _runPreAction, _playAutoMode, notifyMyTurnVisuals } from '../ui/action-bar.mjs';
import { speak, hapticBuzz, voiceActionPhrase } from '../ui/media.mjs';
import { recordHand } from '../game/stats.mjs';
import { addChat } from '../ui/chat.mjs';
import { _hlEliminatedPids, _snapshotHandResults, showWinnerOverlay, showWinHandBadge,
         dismissWinner, showEndGameOverlay } from '../game/showdown.mjs';

const T = MSG.T;

function onGameStartInitial(sub) {
    S._gameStarted = true;
    try { _updateLobbyWaitStatus(); } catch(e) {}
    // La partie démarre → on quitte la wait-page du lobby et on bascule
    // sur le gametable (le feutre a été préparé au JoinGameAck).
    try { show('s-game'); } catch(e) {}
    try { _renderLobbyWaitActions(); } catch(e) {}  // restaure « + Créer une partie » côté lobby
    // Reset de l'escalade des sons de montee de blinds (nouvelle partie).
    if (typeof window.resetBlindRaises === 'function') window.resetBlindRaises();
    // Clear the waiting panel ("EN ATTENTE…") immediately when the
    // game starts. It used to linger until our first MyActionRequest
    // because that's the next thing that writes to #g-actions —
    // meaning if another player goes first, the user sees the
    // start-now banner and the live table at the same time.
    var _ga = document.getElementById('g-actions');
    if (_ga) _ga.innerHTML = '';
    // La partie démarre → on masque la wait-page et on révèle le feutre.
    try { window._wpHide(); } catch(e) {}
    // Same goes for the "▶ Start" / "▶ Bots" admin buttons in the
    // header: once the game has started they no longer make sense.
    // Hide all four (desktop + mobile-overflow variants) defensively.
    ['admin-start-btn','admin-start-mob','admin-startnobots-btn','admin-startnobots-mob'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // GameStartInitialMessage: gameId=1, startDealerPlayerId=2, playerSeats=3 (packed uint32)
    S.gId       = Proto.u32(sub, 1);
    S.dealerPid = Proto.u32(sub, 2);

    // Décoder la liste de sièges envoyée par le serveur
    const newSeats = [];
    if (sub[3] && sub[3].length > 0) {
      if (sub[3][0] instanceof Uint8Array) {
        let pos = 0, buf = sub[3][0];
        while (pos < buf.length) {
          const r = Proto.decodeVarint(buf, pos);
          newSeats.push(r.value); pos = r.pos;
        }
      } else {
        newSeats.push(...sub[3].map(v => +v));
      }
    }

    // FIX : le serveur renvoie GameStartInitial avant chaque main avec un ordre
    // potentiellement différent (rotation du dealer). On fige l'ordre dès
    // la PREMIÈRE réception et on ne le change plus — évite que les joueurs
    // "tournent" visuellement autour de la table à chaque nouvelle main.
    //
    // PREVIOUS BUG: the freeze used `seats.length === 0` as the gate, which
    // is fragile — any path that empties seats[] without setting _seatsFrozen
    // back to false re-opens the freeze and the server's new (rotated) order
    // gets written. Browser logs proved this was happening: hand#1 seats
    // [724,722,723,712,721] but hand#2 [712,721,722,723,724], hand#3
    // [721,712,722,723,724], etc. The dealer rotation visibly cycled the
    // array on every GameStartInitial.
    //
    // The new gate is a dedicated one-way flag `_seatsFrozen`, set to true
    // here and only reset by RemovedFromGame / leaveGame / closeTable.
    const isFirstDeal = !S._seatsFrozen;
    if (isFirstDeal) {
      S.seats  = newSeats.slice(); // copy, defensive
      S._seatsFrozen = true;
      S.handNum = 0;
      // Nouvelle table → repartir de zéro pour les stats de session
      // (sinon le stack de départ et l'historique de la table précédente
      // persistent et faussent le « gain net »).
      S._stats.handsPlayed = 0; S._stats.handsWon = 0; S._stats.startMoney = 0;
      S._stats.peakMoney = 0; S._stats.totalGain = 0; S._stats.bigWin = 0;
      S._stats.bigLoss = 0; S._stats.history = [];
      S._statsInited = false;
      S._gameCounted = false;
      S._myStackAtHandStart = null; S._seatStackAtHandStart = {};
      if (S._statsOpen) renderStats();
      const scEl = document.getElementById('g-myseat-cards');
      if (scEl) scEl.innerHTML = '<div class="pk sm back"></div><div class="pk sm back"></div>';
    }
    // Late joins : ajouter les nouveaux joueurs à la fin
    for (const pid of newSeats) {
      if (!S.seats.includes(pid)) S.seats.push(pid);
    }

    // Mettre à jour seatData pour tous les joueurs
    // active = vrai UNIQUEMENT si le joueur est dans newSeats (cette main)
    for (const pid of S.seats) {
      const inGame = newSeats.includes(pid);
      if (!S.seatData[pid]) S.seatData[pid] = {};
      if (isFirstDeal) {
        // Use the table's configured startMoney as the initial stack
        // for every seat. The server only sends per-player money in
        // PlayersActionDone, which means a seat that has NOT acted yet
        // (everyone except SB/BB on hand #1) keeps its 0 default —
        // which then makes the Call button mis-route to All-In once
        // toCall >= 0. Seeding with the real startMoney fixes that
        // misfire until PlayersActionDone corrects each seat's value.
        Object.assign(S.seatData[pid], {money: S.gameStartMoney || 3000, bet:0, action:'', active:inGame, folded:false});
      } else {
        // Conserver le stack, réinitialiser uniquement l'état de la main
        Object.assign(S.seatData[pid], {bet:0, action:'', active:inGame, folded:false});
      }
    }

    // Mémoriser le stack de chaque joueur AU DÉBUT de la main (avant blinds),
    // pour calculer le gain/perte NET exact (mien + bonus popup gagnant).
    S._seatStackAtHandStart = {};
    for (const _sp of S.seats) {
      if (S.seatData[_sp] && S.seatData[_sp].money != null) S._seatStackAtHandStart[_sp] = S.seatData[_sp].money;
    }
    S._myStackAtHandStart = (S._seatStackAtHandStart[S.myId] != null) ? S._seatStackAtHandStart[S.myId] : null;

    S.commCards = [null, null, null, null, null];
    S.amInGame  = true;
    document.getElementById('g-round').textContent = t('gameStart');

    // Demander les infos des joueurs inconnus
    for (const pid of S.seats) {
      if (!S.players[pid]) {
        const req = Proto.encode([[1,0,pid]]);
        send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
      }
    }

    // Re-diffuser l'avatar à chaque début de main (pour les nouveaux
    // connectés). Respecte le choix image / emoji / initiale.
    window._rebroadcastAvatar();
    if (isFirstDeal) {
      setTimeout(function(){ window.renderSeats(); }, 120);
      window.renderGameWaiting(t('gameStartedWaitHand'));
    } else {
      // Animer le déplacement du dealer + fade des actions.
      // FIX 9g-C5a-bis : capturer from/to AU MOMENT DE LA PLANIFICATION —
      // l'ancienne closure relisait _prevDealerPid au déclenchement (200 ms
      // plus tard), après son écrasement ci-dessous → anim(nouveau, nouveau),
      // no-op silencieux depuis l'introduction de l'animation.
      if (window._prevDealerPid >= 0 && window._prevDealerPid !== S.dealerPid) {
        var _dlFrom = window._prevDealerPid, _dlTo = S.dealerPid;
        setTimeout(function(){ window.animateDealerMove(_dlFrom, _dlTo); }, 200);
      }
      window.fadeOutAllActions();
      window.renderSeats();
    }
    window._prevDealerPid = S.dealerPid;
    try {
      if (window._handlog && isFirstDeal) {
        var _hlSeatMap = S.seats.map(function(pid, i){
          return { pid: pid, seat: i + 1, name: window.getPlayerName(pid) };
        });
        window._handlog.onGameStart({
          gameID: S.gId, startMoney: S.gameStartMoney || 0,
          startSb: S.smallBlind || 0, dealerSeat: (S.seats.indexOf(S.dealerPid) + 1) || 0,
          seatMap: _hlSeatMap
        });
      }
    } catch (_e) {}
    return;
}

function onHandStart(sub) {
    // HandStartMessage: gameId=1, plainCards=2 {card1:1, card2:2}, smallBlind=4, seatStates=5, dealerPlayerId=6
    S.handNum++;
    // Mode de jeu PERSISTANT entre les mains (comme le client officiel) :
    // pas de reset par main. Le joueur le change via le dropdown ou un
    // clic manuel sur une action.
    S._preActionOpen = false; // referme tout panneau "aperçu" à chaque main
    S._preAction = '';        // désarme toute pré-action à chaque nouvelle main
    // Zoom-follow : reset du suivi + restauration d'un zoom suspendu au showdown
    try { if (window._zoomHandStart) window._zoomHandStart(); } catch (_e) {}
    // Badge « main gagnante » : masqué dès la nouvelle main
    try { if (window._hideWinHandBadge) window._hideWinHandBadge(); } catch (_e) {}
    try { window._sdLosers = new Set(); } catch (e) {} // reset estompage perdants (nouvelle main)
    try { window._sdWinners = new Set(); } catch (e) {} // reset surbrillance gagnants (nouvelle main)
    window._ownReveal = false; // cartes propres re-masquées à chaque main (si option active)
    window._lastCallSeen = -1; window._callConfirmArmed = false; // reset anti-Call (nouvelle main)

    // ── SPECTATOR BOOTSTRAP ──
    // When the user joined as spectator of a hand-in-progress, the
    // server never sends GameStartInitial — only the live messages
    // (HandStart, DealFlop, PlayersTurn, etc.). Both _gameStarted
    // and seats[] therefore stay at their initial empty/false state,
    // and the table shows the waiting panel forever with no seats
    // around the felt.
    //
    // Use the FIRST HandStart we receive as a synthetic 'game has
    // started' event to repair both:
    //   * _gameStarted = true → the waiting panel gets hidden
    //   * _seatsFrozen = true → the freeze latch is armed so no later
    //                            GameStartInitial (unlikely but possible)
    //                            can shuffle the order under us
    //   * seats[] is populated from every pid we know about via the
    //     GamePlayerJoined messages that arrived since join time.
    //     The .gone filter excludes pids that have already left.
    //
    // For a normal player join this branch is a no-op: GameStartInitial
    // already flipped _gameStarted and populated seats[] before the
    // first HandStart fires, so the condition is false.
    if (!S._gameStarted) {
      S._gameStarted = true;
      S._seatsFrozen = true;
      try { window._wpHide(); } catch(e) {}
      try { show('s-game'); } catch(e) {}
    }
    if (S.seats.length === 0) {
      S.seats = Object.keys(S.seatData)
        .map(Number)
        .filter(function(pid) { return !S.seatData[pid].gone; });
    }
    // Re-snapshot de chaque stack AU DÉBUT de cette main (avant blinds).
    // GameStartInitial le fait déjà sur le vrai serveur (il précède CHAQUE
    // main) ; mais le moteur offline n'envoie GameStartInitial qu'une fois
    // par partie, puis un simple HandStart à chaque main. Sans ce re-snapshot,
    // _myStackAtHandStart restait figé au buy-in initial → « solde net » de
    // session gonflé et « pire perte » jamais enregistrée. En ligne : idempotent
    // (seatData porte déjà la même valeur que celle figée par GameStartInitial).
    S._seatStackAtHandStart = {};
    for (const _sp2 of S.seats) {
      if (S.seatData[_sp2] && S.seatData[_sp2].money != null) S._seatStackAtHandStart[_sp2] = S.seatData[_sp2].money;
    }
    S._myStackAtHandStart = (S._seatStackAtHandStart[S.myId] != null) ? S._seatStackAtHandStart[S.myId] : null;
    try {
      if (window._handlog) {
        // Sièges (base 1) via l'ordre figé seats[]. Dealer/SB/BB dérivés
        // de la rotation des sièges ACTIFS, comme le client officiel.
        var _hlSeatOf = function(pid){ var i = S.seats.indexOf(pid); return i >= 0 ? i + 1 : 0; };
        var _hlActive = function(pid){ var d = S.seatData[pid]; return d && !d.gone && d.active !== false && !(d.money != null && d.money <= 0); };
        var _hlDealerIdx = S.seats.indexOf(S.dealerPid);
        var _hlNextActive = function(fromIdx, step){
          var stepped = 0;
          for (var k = 1; k <= S.seats.length; k++) {
            var idx = (fromIdx + k) % S.seats.length;
            if (_hlActive(S.seats[idx])) { stepped++; if (stepped === step) return S.seats[idx]; }
          }
          return -1;
        };
        var _hlSbPid, _hlBbPid;
        var _hlActiveCount = S.seats.filter(_hlActive).length;
        if (_hlActiveCount === 2) { _hlSbPid = S.dealerPid; _hlBbPid = _hlNextActive(_hlDealerIdx, 1); }
        else { _hlSbPid = _hlNextActive(_hlDealerIdx, 1); _hlBbPid = _hlNextActive(_hlDealerIdx, 2); }
        var _hlStacks = {};
        for (var _sp3 = 0; _sp3 < S.seats.length; _sp3++) {
          var _pid3 = S.seats[_sp3];
          if (_hlActive(_pid3) && S._seatStackAtHandStart[_pid3] != null) _hlStacks[_sp3 + 1] = S._seatStackAtHandStart[_pid3];
        }
        window._handlog.onHandStart({
          handID: S.handNum,
          dealerSeat: _hlSeatOf(S.dealerPid),
          sbSeat: _hlSeatOf(_hlSbPid), sbAmount: S.smallBlind || 0,
          bbSeat: _hlSeatOf(_hlBbPid), bbAmount: (S.smallBlind || 0) * 2,
          stacks: _hlStacks
        });
      }
    } catch (_e) {}
    // N° de main seul : le Game ID vit dans le popup d'info de table
    // (titre « … · #id ») — retiré de la strip (feedback : trop chargée).
    // GameStatusBar : « Partie : <gId> · Main : <n> » (droite du bandeau)
    var _ghn = document.getElementById('g-handn');  if (_ghn) _ghn.textContent = S.handNum;
    var _ggi = document.getElementById('g-gameid'); if (_ggi) _ggi.textContent = S.gId || '\u2013';
    var _gbs = document.getElementById('g-blinds-slot'); if (_gbs) _gbs.innerHTML = '';
    document.getElementById('g-round').textContent = t('preflop');
    S.gameState = 0; // preflop
    S.commCards = [null, null, null, null, null];
    S.pot = 0; S.collectedPot = 0; S.highestBet = 0; S.minRaise = 0;

    // My cards (plainCards sub-message at field 2)
    // FIX : pour un SPECTATEUR le serveur peut envoyer plainCards vide ou sans les champs 1/2.
    // u32orNull distingue "champ absent" (null → carte cachée) de "valeur 0" (carte 2♣ valide).
    const pc = sub[2] ? Proto.decode(sub[2][0]) : {};
    S.myCards = [Proto.u32orNull(pc, 1), Proto.u32orNull(pc, 2)];
    // Comptes pokerth.net authentifiés : pas de plainCards (champ 2),
    // les cartes arrivent dans encryptedCards (champ 3), chiffrées AES-128
    // avec une clé dérivée du mot de passe. On les déchiffre ici. Le
    // déchiffrement est synchrone (clé/IV déjà dérivés à l'Init).
    // ── DIAG temporaire (bug « cartes invisibles en mode auth ») ──
    // Trace chaque étape de la voie encryptedCards ; retirer une fois le
    // bug identifié. Visible : console + setStatus (2 premières mains).
    var _cd = { hand: S.handNum, plain: !!sub[2], enc: sub[3] ? (sub[3][0] && sub[3][0].length) : -1,
                encU8: !!(sub[3] && sub[3][0] instanceof Uint8Array),
                key: !!(S._cardKey && S._cardIV), dec: null, cleared: false };
    if ((S.myCards[0] == null || S.myCards[1] == null) && sub[3] && S._cardKey && S._cardIV) {
      const cipher = (sub[3][0] instanceof Uint8Array) ? sub[3][0] : null;
      const dec = cipher ? PTHCrypto.decryptCards(cipher, S._cardKey, S._cardIV) : null;
      _cd.dec = !!dec;
      if (dec) S.myCards = [dec[0], dec[1]];
    }
    // If I'm bust (lost my whole stack last hand), the server may
    // still echo cards for the deal but I'm not actually in the
    // hand. Force-clear so the player bar shows card backs and
    // matches the eliminated state shown on my seat.
    if (S.seatData[S.myId] && S.seatData[S.myId].money <= 0 && !S.seatData[S.myId].gone) {
      if (S.myCards[0] != null || S.myCards[1] != null) _cd.cleared = true;
      S.myCards = [null, null];
    }
    try {
      _cd.money = S.seatData[S.myId] ? S.seatData[S.myId].money : undefined;
      window._pthCardDiag = _cd;
      var _cdh = window._pthCardDiagHist || (window._pthCardDiagHist = []);
      _cdh.push(_cd); if (_cdh.length > 20) _cdh.shift();
      // Anomalie = cartes toujours nulles alors qu'on est assis avec des
      // données serveur (plain ou enc). Statut visible sur mobile.
      if (S.myCards[0] == null && S.myCards[1] == null && (_cd.plain || _cd.enc >= 0)) {
        window._pthCardDiagN = (window._pthCardDiagN || 0) + 1;
        if (window._pthCardDiagN <= 2) {
          setStatus('cards diag: plain=' + _cd.plain + ' enc=' + _cd.enc +
                    ' u8=' + _cd.encU8 + ' key=' + _cd.key + ' dec=' + _cd.dec +
                    ' clr=' + _cd.cleared + ' $=' + _cd.money, 'err');
        }
      }
    } catch (_de) {}
    const hsFields = Object.keys(sub).sort((a,b)=>+a-+b).map(f=>f+':'+Proto.u32(sub,+f)).join(' ');

    const sb = Proto.u32(sub, 4);
    var _prevSB = S.smallBlind;
    S.smallBlind = sb;
    // ── Compteur + explication "blinds" ──
    // On (re)construit à chaque main : la pastille compacte du bandeau
    // (cliquable) et le texte d'explication détaillé stocké pour le tap.
    try {
      var grp = (typeof _groupThousands === 'function') ? _groupThousands : function(n){ return String(n); };
      // Prochaine valeur de small blind — sémantique officielle
      // (Game::raiseBlinds) : avec une liste manuelle, la prochaine SB est
      // la première valeur de la liste > SB courante ; liste épuisée →
      // endRaiseMode (1=doubler, 2=+valeur, 3=garder). Sans liste (mode
      // auto), les blinds doublent toujours — endRaiseMode ne s'applique
      // qu'après une liste manuelle côté serveur.
      var _nextSB = null;
      var _mbNext = null;
      if (S._manualBlinds && S._manualBlinds.length) {
        for (var _bi = 0; _bi < S._manualBlinds.length; _bi++) {
          if (S._manualBlinds[_bi] > sb) { _mbNext = S._manualBlinds[_bi]; break; }
        }
      }
      if (_mbNext != null) _nextSB = _mbNext;                                        // liste manuelle
      else if (S._manualBlinds && S._manualBlinds.length) {                              // liste épuisée → Ensuite
        if (S._endRaiseMode === 2 && S._endRaiseValue > 0) _nextSB = sb + S._endRaiseValue;
        else if (S._endRaiseMode === 3) _nextSB = null;
        else _nextSB = sb * 2;
      }
      else _nextSB = sb * 2;                                                         // auto : doubler

      // Blinds actuelles (small/big) : affichées DANS la pastille du
      // bandeau (demande narmod 2026-07-15) en plus du compteur de montée.
      var _curStr  = grp(sb) + '/' + grp(sb * 2);

      // Le "quand" + la pastille compacte selon le mode d'intervalle.
      // Pastille = blinds actuelles + éventuel compteur de montée ;
      // blinds fixes (aucune montée) → blinds seules, sans flèche.
      var _whenTxt = '', _chip = _curStr;
      if (S._raiseMode === 1 && S._raiseEvery > 0) {
        var _left = S._raiseEvery - ((S.handNum - 1) % S._raiseEvery);
        _whenTxt = t('blindsNextTip', { n: _left });
        _chip = _curStr + ' ↑\u202F' + _left;
      } else if (S._raiseMode === 2 && S._raiseEvery > 0) {
        // Ancre du niveau courant : 1re main (ou rejoint en cours) et à
        // chaque montée effective du small blind.
        if (!S._blindsClockStart || S.handNum <= 1) S._blindsClockStart = Date.now();
        else if (_prevSB > 0 && sb > _prevSB) S._blindsClockStart = Date.now();
        _whenTxt = t('blindsEveryMin', { n: S._raiseEvery });
        _chip = _curStr + ' ↑ <span id="blinds-cd" style="font-variant-numeric:tabular-nums">'
          + _fmtBlindsCountdown() + '</span>';
      }

      // Texte d'explication (affiché au tap et lors de la montée).
      // Ex : "Blinds 1600/3200 → 3200/6400 · dans 1 main".
      var _nextStr = (_nextSB != null) ? (grp(_nextSB) + '/' + grp(_nextSB * 2)) : null;
      window._blindsInfoHtml =
        '<span class="bu-icon">↑</span>'
        + '<span class="bu-text">' + t('blinds') + '</span>'
        + '<span class="bu-val">' + _curStr + (_nextStr ? '<span class="bu-arrow">→</span>' + _nextStr : '') + '</span>'
        + (_whenTxt ? '<span class="bu-when">' + _whenTxt + '</span>' : '');

      // Pastille du bandeau : cliquable → affiche l'explication.
      if (_chip) {
        var _tip = (_whenTxt || '').replace(/"/g, '');
        var _slot = document.getElementById('g-blinds-slot');
        if (_slot) _slot.innerHTML =
          '<span class="blinds-next" role="button" tabindex="0" title="' + _tip + '"'
          + ' onclick="window.showBlindsInfo&&window.showBlindsInfo()">' + _chip + '</span>';
      }
      if (S._raiseMode === 2 && S._raiseEvery > 0) _startBlindsCountdown();
      else _stopBlindsCountdown();
    } catch (e) {}
    // Fin de la fenêtre « Show » de la main précédente
    try { _setCanShow(false); } catch (e) {}
    // ── Alerte au moment de la montée (les 2 modes) ──
    // Si le small blind a augmenté (hors 1ʳᵉ main) : bandeau + son, en
    // réutilisant l'explication qu'on vient de préparer.
    if (S.handNum > 1 && _prevSB > 0 && sb > _prevSB && S._lastBlindsUpHand !== S.handNum) {
      S._lastBlindsUpHand = S.handNum;
      if (typeof window._showBlindsToast === 'function') window._showBlindsToast(window._blindsInfoHtml, true);
    }
    S.dealerPid = Proto.u32(sub, 6) || S.dealerPid;

    // Reset seat data for new hand. IMPORTANT exclusions:
    //  - .gone pids (player left voluntarily, GamePlayerLeft set
    //    this) → keep as ghost seats forever.
    //  - players with money <= 0 (eliminated last hand by losing
    //    their stack, e.g. lost an all-in) → keep .active = false
    //    so window.renderSeats keeps the .seat-out greyed-out class and
    //    OUT badge, and skip them in the dealer rotation. The
    //    server doesn't deal them cards anyway; this just prevents
    //    the UI from showing them as live + clearing their stale
    //    cards from the previous hand.
    for (const pid of S.seats) {
      var __sd = S.seatData[pid];
      if (!__sd || __sd.gone) continue;
      __sd.bet    = 0;
      __sd.action = '';
      __sd.folded = false;
      __sd.card1  = null;
      __sd.card2  = null;
      // Mark as eliminated ONLY if we KNOW for sure the player is
      // bust (money is defined AND <= 0). When money is null/
      // undefined we have no info yet — default to active=true so
      // we don't incorrectly grey out live players. This matters
      // particularly in spectator mode where HandStart arrives
      // before the stacks have been synced to seatData, so a
      // bare `money > 0` check was making EVERY seat look OUT.
      var __knownBust = (__sd.money != null && __sd.money <= 0);
      __sd.active = !__knownBust;
    }

    clearTurnNotif();
    renderMyCards();
    renderComm();
    window.renderSeats();
    // Fix #3: was 'autoScaleTable + window.renderSeats' — the second window.renderSeats
    // here was redundant (we just called it 100ms earlier) and produced
    // a brief flicker as the same DOM was rebuilt twice in quick
    // succession. autoScaleTable() is enough — it adjusts the CSS
    // transform of the parent without touching the seat DOM at all.
    setTimeout(autoScaleTable, 100);
    setTimeout(animateCardDeal, 200);
    setTimeout(renderPreFlopStrength, 350);
    setTimeout(renderOddsMonitor, 400); // moniteur d'odds (préflop)
    // Init stats
    var startMon = (S.seatData[S.myId]||{}).money || 0;
    if (!S._statsInited && startMon > 0) initStats(startMon);
    // Sons + animations deal
    setTimeout(function(){
      window.notifyCard();
      setTimeout(window.notifyCard, 120);
      window.animateDealMyCards();
    }, 250);
    var hs = document.getElementById('hand-strength');
    if (hs) _hsHide(hs);
    window.renderGameWaiting(t('handOf') + ' ' + S.handNum + ' — Blinds: ' + sb + '/' + (sb*2));
    const _lhN = S.handNum, _lhSB = sb;
    window.logAction(function(){ return '══ ' + t('handOf') + ' ' + _lhN + ' — ' + t('blinds') + ' ' + _lhSB + '/' + (_lhSB*2) + ' ══'; });
    // Donneur (bouton) de la main — dealerPid déjà résolu plus haut (champ 6).
    if (S.dealerPid && window.getPlayerName(S.dealerPid)) {
      const _lhD = S.dealerPid;
      window.logAction(function(){ return '\uD83D\uDD18 ' + t('logDealer', { name: window.getPlayerName(_lhD) }); });
    }
    // Show my hole cards in log
    if (S.myCards[0] != null && S.myCards[1] != null) {
      const _lhMy0 = S.myCards[0], _lhMy1 = S.myCards[1];
      window.logAction(function(){ return t('myCards') + ' ' + cardName(_lhMy0, false) + ' ' + cardName(_lhMy1, false); });
    }
    return;
}

// ── #9g-C5b : déroulé de main 2/2 (tours, actions, streets, showdown, fin) ──

function onPlayersTurn(sub) {
    // PlayersTurnMessage: gameId=1, playerId=2, gameState=3
    S.turnPid   = Proto.u32(sub, 2);
    S.gameState = Proto.u32(sub, 3);
    // Defensive guard: if the server (older PokerTH versions, e.g.
    // the Debian 1.1.2-2 package) mistakenly sends PlayersTurn for
    // a player who has already left the table, ignore it. The
    // server should normally skip gone pids and assign the turn to
    // the next live one. We still set turnPid above (for any UI
    // consistency code that may inspect it) but bail out of the
    // turn-handling logic so we don't render a ghost as active.
    if (S.turnPid && S.seatData[S.turnPid] && S.seatData[S.turnPid].gone) {
      console.warn('[PlayersTurn] server assigned turn to a gone pid', S.turnPid, '— ignoring');
      window.renderSeats();
      return;
    }
    // A seat whose turn the server just assigned is by definition
    // in the hand — force active=true. Safety net for spectators
    // who joined mid-hand and missed the HandStart reset.
    if (S.turnPid && S.seatData[S.turnPid]) S.seatData[S.turnPid].active = true;
    const rounds = [t('preflop'),t('flop'),t('turn'),t('river'),t('preflop')+' (SB)',t('preflop')+' (BB)'];
    document.getElementById('g-round').textContent = rounds[S.gameState] || t('preflop');
    startTurnTimer();
    if (S.turnPid === S.myId) {
      // C'est notre tour : on referme tout panneau "aperçu" pour ne pas
      // interférer avec la barre d'actions normale (et tous ses effets).
      S._preActionOpen = false;
      // Pré-action armée (comme l'officiel) : si une action a été armée avant
      // notre tour et qu'elle est encore valide, on la joue directement sans
      // afficher les boutons live.
      if (S._preAction) { var _pdid = _runPreAction(); S._preAction = ''; if (_pdid) return; }
      // Mode auto PERSISTANT (Manuel/Auto Check-Call/Auto Check-Fold) :
      // si un mode auto est actif, jouer l'action sans afficher les boutons.
      // Le mode reste actif (pas de désarmement), comme le client officiel.
      if (_playAutoMode()) return;
      renderMyTurnActions();
      window.setMyTurnActive(true);
      // Play the audio ding-dong (from sounds.mjs, attached to window)
      // AND trigger the visual cue (tab title blink, browser notification).
      // These used to be one call but the visual function shadowed the
      // audio one, silencing the chime entirely.
      if (typeof window.notifyMyTurn === 'function') window.notifyMyTurn();
      notifyMyTurnVisuals();
      hapticBuzz([90, 50, 90]); // "your turn" double-buzz
    } else {
      clearTurnNotif();
      window.setMyTurnActive(false);
      // Zoom-follow : planifie le cadrage du siège actif (parité QML §3.4)
      try { if (window._zoomFollowTurn) window._zoomFollowTurn(S.turnPid, S.gameTimeout); } catch (_e) {}
      // isHtml=true : HTML interne sûr, pas du contenu utilisateur
      window.renderGameWaiting(
        '<span style="font-family:inherit">' + esc(window.getPlayerName(S.turnPid)) + '</span>'
        + '<span class="thinking-dots"><span></span><span></span><span></span></span>',
        true);
    }
    return;
}

function onPlayersActionDone(sub) {
    // gameId=1, playerId=2, gameState=3, playerAction=4, totalPlayerBet=5, playerMoney=6, highestSet=7, minimumRaise=8
    const pid    = Proto.u32(sub, 2);
    const action = Proto.u32(sub, 4);
    const bet    = Proto.u32(sub, 5);
    const money  = Proto.u32(sub, 6);
    S.highestBet   = Proto.u32(sub, 7);
    S.minRaise     = Proto.u32(sub, 8);
    // Zoom-follow : le joueur a agi → pan en attente exécuté tout de suite
    try { if (window._zoomFollowActed) window._zoomFollowActed(); } catch (_e) {}
    try {
      if (window._handlog) window._handlog.onAction({ pid: pid, actionCode: action, totalBet: bet });
    } catch (_e) {}
    const aLabels = ['','Fold','Check','Call','Bet','Raise','All-in'];
    const aLabel  = aLabels[action] || '?';
    if (S.seatData[pid]) {
      S.seatData[pid].bet    = bet;
      S.seatData[pid].money  = money;
      S.seatData[pid].folded = action === 1;
      S.seatData[pid].action = aLabel;
    }
    S.pot = S.collectedPot;
    for (const p of S.seats) if (S.seatData[p]) S.pot += S.seatData[p].bet;
    window.setPot(S.pot);
    window.logAction(window.getPlayerName(pid) + ': ' + aLabel + (bet ? ' ' + bet : ''), true);
    speak(voiceActionPhrase(action, pid, bet));
    if (pid === S.myId) {
      const myMon = (S.seatData[S.myId] || {}).money || 0;
      if (document.getElementById('g-mystack')) document.getElementById('g-mystack').textContent = myMon > 0 ? fmtChips(myMon) : '';
    }
    window.renderSeats();
    // Sons d'action : 6 sons PokerTH distincts (fold/check/call/bet/raise/
    // all-in) via window.playActionSound(), repli automatique sur les bips
    // synthetises si un sample n'est pas charge. La pop visuelle
    // window.animateAllIn() reste appairee a l'audio pour l'all-in.
    if (typeof window.playActionSound === 'function') {
      window.playActionSound(action);
    } else if (action === 6) {
      if (typeof window.notifyAllIn === 'function') window.notifyAllIn();
    } else {
      window.notifyAction();
    }
    window.flashActionLabel(pid);
    if (action === 6) window.animateAllIn(pid); // All-in
    if (bet > 0) {
      // Fix #2: chip starts moving immediately (was 80ms) so the
      // user's click → visual response loop feels instant.
      animateChipToPot(pid, bet);
      // Fix #1: pot updates 200ms after instead of 550ms. The chip
      // animation lasts ~700ms so the pot grows roughly as the
      // chip arrives — looks coherent without the long lag that
      // made rapid bot turns feel choppy.
      setTimeout(function(){
        window.animatePot(S.pot);
        window.updatePotSize(S.pot);
      }, 200);
    }
    return;
}

function onDealFlop(sub) {
    // DealFlopCardsMessage : deux formats possibles selon la version proto.
    // Essai A : gameId=1, card1=2, card2=3, card3=4 (proto officiel actuel)
    // Essai B : card1=1, card2=2, card3=3 (ancienne version, sans gameId)
    // FIX bug rare : on utilise u32orNull pour DISTINGUER "champ absent" (null) de "valeur 0" (le 2♦).
    // L'ancienne logique avec u32 (défaut 0) confondait les deux et pouvait accepter fA = [card2, card3, 0]
    // dans le format ancien, traitant 0 comme une 3e carte valide (le 2♦) à tort.
    const fA = [Proto.u32orNull(sub,2), Proto.u32orNull(sub,3), Proto.u32orNull(sub,4)];
    const fB = [Proto.u32orNull(sub,1), Proto.u32orNull(sub,2), Proto.u32orNull(sub,3)];
    const allFields = Object.keys(sub).sort((a,b)=>+a-+b);
    const allVals = allFields.map(f => f+'='+Proto.u32(sub,+f)).join(' ');
    // Une carte est valide si elle est PRÉSENTE (≠null) et dans la plage 0..51
    const isValidCard = n => n !== null && n >= 0 && n <= 51;
    const allValid = a => a.every(isValidCard);
    // Préférer fA (format officiel) ; basculer sur fB si fA incomplet ; sinon garder fA tel quel (cardToHtml affichera des dos)
    S.commCards = allValid(fA) ? fA : (allValid(fB) ? fB : fA);
    const dbg = 'FLOP sub:'+allVals+' →['+S.commCards.join(',')+']';
    if (document.getElementById('g-debug')) document.getElementById('g-debug').textContent = dbg;
    try { if (window._handlog) window._handlog.onFlop(S.commCards.slice(0, 3)); } catch (_e) {}
    document.getElementById('g-round').textContent = t('flop');
    S.gameState = 1;
    // Collect preflop bets into pot
    let flopBets = 0;
    for (const p of S.seats) if (S.seatData[p] && S.seatData[p].bet) { flopBets += S.seatData[p].bet; S.seatData[p].bet = 0; }
    S.collectedPot += flopBets;
    S.pot = S.collectedPot;
    // FIX 2024-XX : reset des stats par round.
    // Sans ce reset, le premier joueur à parler au flop voyait son
    // bouton afficher "Call X" (X étant la mise du round précédent)
    // alors que personne n'avait encore misé → le serveur rejetait
    // (rejectedActionNotAllowed) et le joueur restait coincé.
    S.highestBet = 0;
    S.minRaise   = 0;
    window.setPot(S.pot);
    const flopStr = S.commCards.filter(n=>n!=null).map(n=>cardName(n,true)).join(', ');
    renderComm(true); // flip animation
    window.renderSeats();
    setTimeout(renderHandStrength, 150); // force de la main au flop (was 500ms)
    setTimeout(renderOddsMonitor, 220); // moniteur d'odds (flop)
    const _lhPotF = S.pot;
    window.logAction(function(){ return '--- ' + t('flop') + ' [' + flopStr + '] · ' + t('pot') + ' ' + _groupThousands(_lhPotF) + ' ---'; });
    window.notifyCard(); window.notifyCard(); window.notifyCard();
    return;
}

function onDealTurn(sub) {
    // Fix : utiliser sub[2] pour détecter la présence du champ
    const tv = sub[2] !== undefined ? Proto.u32(sub, 2) : Proto.u32(sub, 1);
    S.commCards.push(tv);
    try { if (window._handlog) window._handlog.onTurn(tv); } catch (_e) {}
    document.getElementById('g-round').textContent = t('turn');
    S.gameState = 2;
    let turnBets = 0;
    for (const p of S.seats) if (S.seatData[p] && S.seatData[p].bet) { turnBets += S.seatData[p].bet; S.seatData[p].bet = 0; }
    S.collectedPot += turnBets;
    S.pot = S.collectedPot;
    // Voir DealFlop pour le commentaire — reset des stats par round
    // pour éviter que le bouton Call affiche un montant périmé.
    S.highestBet = 0;
    S.minRaise   = 0;
    window.setPot(S.pot);
    const tvCard = S.commCards[3]; const tvName = tvCard != null ? cardName(tvCard, true) : '?';
    const _lhPotT = S.pot;
    window.logAction(function(){ return '--- ' + t('turn') + ' [' + tvName + '] · ' + t('pot') + ' ' + _groupThousands(_lhPotT) + ' ---'; });
    renderComm(true); // flip animation
    setTimeout(renderHandStrength, 150); // force de la main au turn (was 500ms)
    setTimeout(renderOddsMonitor, 220); // moniteur d'odds (turn)
    window.notifyCard();
    return;
}

function onDealRiver(sub) {
    // Fix : sub[2] présent ? utiliser field 2 ; sinon field 1
    // rv || fallback est FAUX pour rv=0 (carte 2♦)
    const rv = sub[2] !== undefined ? Proto.u32(sub, 2) : Proto.u32(sub, 1);
    S.commCards.push(rv);
    try { if (window._handlog) window._handlog.onRiver(rv); } catch (_e) {}
    document.getElementById('g-round').textContent = t('river');
    S.gameState = 3;
    let rvBets = 0;
    for (const p of S.seats) if (S.seatData[p] && S.seatData[p].bet) { rvBets += S.seatData[p].bet; S.seatData[p].bet = 0; }
    S.collectedPot += rvBets;
    S.pot = S.collectedPot;
    // Voir DealFlop pour le commentaire — reset des stats par round
    // pour éviter que le bouton Call affiche un montant périmé.
    S.highestBet = 0;
    S.minRaise   = 0;
    window.setPot(S.pot);
    const rvCard = S.commCards[4]; const rvName = rvCard != null ? cardName(rvCard, true) : '?';
    const _lhPotR = S.pot;
    window.logAction(function(){ return '--- ' + t('river') + ' [' + rvName + '] · ' + t('pot') + ' ' + _groupThousands(_lhPotR) + ' ---'; });
    renderComm(true, true); // flip animation + dramatic river
    setTimeout(renderHandStrength, 200); // force de la main à la river (was 600ms)
    setTimeout(renderOddsMonitor, 240); // moniteur d'odds (river)
    window.playTone(350, 0.08, 0.08); setTimeout(function(){ window.notifyCard(); }, 200);

    return;
}

function onAllInShowCards(sub) {
    // Show cards of all-in players during the hand
    // AllInShowCardsMessage: gameId=1, playersAllIn=2 (repeated PlayerAllIn {playerId=1, allInCard1=2, allInCard2=3})
    const allIns = sub[2] || [];
    for (const ab of allIns) {
      const a   = Proto.decode(ab);
      const pid = Proto.u32(a, 1);
      // FIX : un joueur sans carte révélée → null (pas 0 qui serait le 2♣)
      const c1  = Proto.u32orNull(a, 2);
      const c2  = Proto.u32orNull(a, 3);
      if (S.seatData[pid]) { S.seatData[pid].card1 = c1; S.seatData[pid].card2 = c2; }
      try { if (window._handlog) window._handlog.onRevealCards([{ pid: pid, card1: c1, card2: c2 }]); } catch (_e) {}
    }
    window.renderSeats();
    return;
}

function onEndOfHandShow(sub) {
    window._ownReveal = true; // showdown : mes cartes sont publiques, on les montre
    // Zoom-follow : suspension du zoom pour la vue d'ensemble du showdown
    try { if (window._zoomShowdownSuspend) window._zoomShowdownSuspend(); } catch (_e) {}
    try { renderMyCards(); } catch (e) {}
    const results = sub[2] || [];
    const winners = [];
    for (const rb of results) {
      const r   = Proto.decode(rb);
      const pid = Proto.u32(r, 1);
      // FIX : joueur qui a foldé ne révèle pas ses cartes → null (pas 0 = 2♣ fantôme)
      const c1  = Proto.u32orNull(r, 2);
      const c2  = Proto.u32orNull(r, 3);
      const won = Proto.u32(r, 5);
      const cash= Proto.u32(r, 6);
      if (S.seatData[pid]) {
        S.seatData[pid].money  = cash;
        S.seatData[pid].card1  = c1;
        S.seatData[pid].card2  = c2;
        S.seatData[pid].action = won ? '🏆 +' + won : '';
      }
      // Abattage : cartes révélées + nom de la combinaison. Le label vient
      // de evaluateBestHand (clés hs* déjà traduites dans les 36 langues).
      // Joueurs couchés avant l'abattage : c1/c2 == null → pas de ligne.
      if (c1 != null && c2 != null) {
        const _bd = S.commCards.slice(); // fige le board de CETTE main
        window.logAction(function(){
          var ev = (typeof evaluateBestHand === 'function') ? evaluateBestHand([c1, c2], _bd) : null;
          return t('logShowdown', {
            name:  window.getPlayerName(pid),
            cards: cardName(c1, false) + ' ' + cardName(c2, false),
            hand:  ev ? ev.label : ''
          });
        });
      }
      if (won > 0) {
        winners.push({ pid, won, cash, c1, c2 });
        // Stats si c'est moi
        if (pid === S.myId) {
          // Gain NET de la main = stack final − stack au début de la main
          // (et NON le pot brut « won », qui inclut ma propre mise).
          var myStartHand = (S._myStackAtHandStart != null) ? S._myStackAtHandStart : ((S._stats.startMoney || 0) + S._stats.totalGain);
          var netWin = cash - myStartHand;
          var myPair2 = S.myCards.map && S.myCards.map(function(c){ return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 }; });
          recordHand(true, netWin, myPair2);
        }
        // Gain affiché dans le Journal 📋 (pas dans le chat, pour ne pas le noyer)
        window.logAction('🏆 ' + window.getPlayerName(pid) + ' +' + _groupThousands(won));
    speak(t('voiceWins', { name: window.getPlayerName(pid), n: fmtChipsVoice(won) }));
      }
    }
    // Enregistrer la perte si je ne suis pas dans les gagnants
    if (!winners.some(function(w){ return w.pid === S.myId; })) {
      var myEndMon = (S.seatData[S.myId] || {}).money;
      if (myEndMon != null) {
        var myStartMon = (S._myStackAtHandStart != null) ? S._myStackAtHandStart : ((S._stats.startMoney || 0) + S._stats.totalGain);
        var myLoss = myEndMon - myStartMon;
        var myPairLoss = S.myCards.map && S.myCards.map(function(c){
          return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 };
        });
        recordHand(false, myLoss, myPairLoss);
      }
    }
    // Options avancées : marquer les perdants du showdown (cartes révélées
    // mais pas gagnantes) pour estomper leurs cartes (fadeOutLosingCards, ON par défaut).
    try {
      window._sdLosers = new Set();
      if (localStorage.getItem('pth_fade_losers') !== '0') {
        var _winPids = {};
        winners.forEach(function (w) { _winPids[w.pid] = 1; });
        for (var _lp in S.seatData) {
          var _ls = S.seatData[_lp];
          if (_ls && _ls.card1 != null && _ls.card2 != null && !_winPids[_lp])
            window._sdLosers.add(parseInt(_lp, 10));
        }
      }
    } catch (e) {}
    // PlayerWinnerOverlay QML : marquer les sièges gagnants jusqu'à la main suivante.
    try { window._sdWinners = new Set(winners.map(function (w) { return w.pid; })); } catch (e) {}
    // WinningHandBadge QML (bible §9) : libellé de la main gagnante sous
    // les community cards pendant TOUT le showdown, au format Qt-Widgets
    // anglais (winningHandText). Indépendant de la fenêtre du gagnant
    // (option winner_popup) — comme le client officiel.
    try {
      var _whBd = S.commCards.filter(function (n) { return n != null; });
      var _whLabel = '';
      if (_whBd.length >= 3) {
        for (var _whI = 0; _whI < winners.length && !_whLabel; _whI++) {
          var _whW = winners[_whI];
          if (_whW.c1 != null && _whW.c2 != null) {
            var _whEv = evaluateBestHand([_whW.c1, _whW.c2], _whBd);
            if (_whEv) _whLabel = _qmlWinningHandText(_whEv);
          }
        }
      }
      if (_whLabel) showWinHandBadge(_whLabel);
    } catch (e) {}
    try {
      if (window._handlog) {
        var _bdSD = S.commCards.slice();
        var _hlResults = [];
        for (var _ri = 0; _ri < results.length; _ri++) {
          var _rr = Proto.decode(results[_ri]);
          var _rpid = Proto.u32(_rr, 1);
          var _rc1 = Proto.u32orNull(_rr, 2);
          var _rc2 = Proto.u32orNull(_rr, 3);
          var _rwon = Proto.u32(_rr, 6);
          var _htext = null, _hint = null;
          if (_rc1 != null && _rc2 != null && typeof evaluateBestHand === 'function') {
            var _ev = evaluateBestHand([_rc1, _rc2], _bdSD);
            if (_ev) { _htext = _ev.label || null; }
          }
          _hlResults.push({ pid: _rpid, card1: _rc1, card2: _rc2, won: _rwon, handText: _htext, handInt: _hint });
        }
        window._handlog.onShowdown(_hlResults, _hlEliminatedPids(), null);
        try { if (typeof window._hudRefresh === 'function') window._hudRefresh(); } catch (_e) {}
      }
    } catch (_e) {}
    S.pot = 0; window.setPot(0);
    window.renderSeats();
    // Animations de fin de main
    var iWon = winners.some(function(w){ return w.pid === S.myId; });
    var bigWin = winners.reduce(function(s,w){ return s + w.won; }, 0) > 500;
    if (iWon && window._advGet('winner_popup', true)) {
      var ov = document.getElementById('g-winner-overlay');
      var cx = ov ? ov.getBoundingClientRect().left + ov.offsetWidth/2 : window.innerWidth/2;
      var cy = ov ? ov.getBoundingClientRect().top  + 80 : window.innerHeight * 0.3;
      window.burstStars(cx, cy, 16);
      setTimeout(function(){ window.burstStars(cx - 80, cy + 40, 8); }, 300);
      setTimeout(function(){ window.burstStars(cx + 80, cy + 40, 8); }, 500);
      if (bigWin) setTimeout(function(){ window.launchConfetti(70); }, 200);
    }
    // Showdown flip cartes adversaires
    setTimeout(window.animateShowdownCards, 300);
    // Reset glow pot
    setTimeout(function(){
      var p1 = document.getElementById('g-pot');
      var p2 = document.getElementById('g-potbar');
      if (p1) p1.classList.remove('pot-huge');
      if (p2) p2.classList.remove('pot-huge');
    }, 800);
    window.logEliminations();
    _snapshotHandResults();
    showWinnerOverlay(winners);
    window.renderGameWaiting('Prochaine main...');
    return;
}

function onEndOfHandHide(sub) {
    // playerId=2, moneyWon=3, playerMoney=4
    const pid  = Proto.u32(sub, 2);
    const won  = Proto.u32(sub, 3);
    const cash = Proto.u32(sub, 4);
    if (S.seatData[pid]) { S.seatData[pid].money = cash; if(won) S.seatData[pid].action = '+'+won; }
    if (won > 0) window.logAction('🏆 ' + window.getPlayerName(pid) + ' +' + _groupThousands(won));
    try { if (window._handlog) window._handlog.onHandHideEnd({ pid: pid, won: won, round: (typeof S.gameState === 'number' ? S.gameState : undefined), eliminated: _hlEliminatedPids(), gameOverPid: null }); } catch (_e) {}
    try { if (typeof window._hudRefresh === 'function') window._hudRefresh(); } catch (_e) {}
    try { window._sdWinners = won > 0 ? new Set([pid]) : new Set(); } catch (e) {}
    // Enregistrer le résultat de la main pour moi (fin sans abattage).
    var myHideMon = (S.seatData[S.myId] || {}).money;
    if (myHideMon != null) {
      var myHideStart = (S._myStackAtHandStart != null) ? S._myStackAtHandStart : ((S._stats.startMoney || 0) + S._stats.totalGain);
      var myHideNet   = myHideMon - myHideStart;
      var myPairHide  = S.myCards.map && S.myCards.map(function(c){
        return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 };
      });
      if (pid === S.myId) {
        // J'ai gagné sans abattage (tout le monde s'est couché) → victoire comptée.
        recordHand(true, myHideNet, myPairHide);
      } else if (myHideNet < 0) {
        // Quelqu'un d'autre a gagné et j'ai perdu des jetons (blinds/mise).
        recordHand(false, myHideNet, myPairHide);
      }
    }
    S.pot = 0; window.setPot(0);
    window.renderSeats();
    // Détection élimination (stack à 0)
    for (var _ep of S.seats) {
      if (_ep !== S.myId && S.seatData[_ep] && S.seatData[_ep].money === 0) {
        setTimeout(function(p){ window.animatePlayerEliminated(p); }, 600, _ep);
      }
    }
    window.logEliminations();
    if (won > 0) { _snapshotHandResults(); showWinnerOverlay([{pid, won, cash, c1:null, c2:null}]); }
    // « Show » volontaire : main terminée SANS abattage → mes cartes
    // n'ont pas été révélées. Réseau seulement (le FakeServer offline
    // ignore le type 51) et jamais en spectateur.
    if (!S._amSpectator && !window._offlineMode && S.myCards[0] != null) _setCanShow(true);
    return;
}

function onYourActionRejected(sub) {
    // YourActionRejectedMessage: gameId=1, gameState=2, yourAction=3,
    //   yourRelativeBet=4, rejectionReason=5
    // Sent by the server when our MyActionRequest is invalid (game state
    // drift, no longer our turn, or action not allowed). Without this
    // handler the UI used to hang on "Action envoyée" and the server
    // would silently time-out our turn → counted as Fold.
    // Most common trigger: 4-player all-in cascades where local
    // gameState lags the server's by one round.
    const rejGameState = Proto.u32(sub, 2);
    const rejAction    = Proto.u32(sub, 3);
    const rejBet       = Proto.u32(sub, 4);
    const reason       = Proto.u32(sub, 5);
    const actNames     = ['','Fold','Check','Call','Bet','Raise','All-in'];
    const reasonLabels = {
      1: t('rejInvalidState'),
      2: t('rejNotYourTurn'),
      3: t('rejNotAllowed'),
    };
    const reasonStr = reasonLabels[reason] || ('code ' + reason);
    const actStr    = actNames[rejAction] || ('?' + rejAction);
    window.logAction(function(){
      var rl = { 1: t('rejInvalidState'), 2: t('rejNotYourTurn'), 3: t('rejNotAllowed') };
      var rs = rl[reason] || ('code ' + reason);
      return '⚠ ' + actStr + (rejBet ? ' ' + rejBet : '') + ' — ' + rs;
    });
    window.addGameChat(null, '⚠ ' + t('actionRejected') +
                      ' (' + actStr + ') — ' + reasonStr, 'sys', { prefix: '⚠ ', key: 'actionRejected', suffix: ' (' + actStr + ') — ' + reasonStr });
    // If we're still the active player according to the local state,
    // the server may give us a second chance — re-render the action
    // buttons so the user can retry. The local turn timer was already
    // stopped by doAction; restart it so the user has the full delay
    // again instead of a stale countdown.
    if (S.turnPid === S.myId && !S._amSpectator) {
      renderMyTurnActions();
      startTurnTimer();
    }
    return;
}

function onAfterHandShowCards(sub) {
    // Show volontaire d'un joueur (rediffusion serveur du
    // ShowMyCardsRequest). PlayerResult : playerId=1, resultCard1=2,
    // resultCard2=3 (moneyWon/playerMoney ignorés : déjà appliqués par
    // EndOfHand*). Même chemin de révélation que le showdown :
    // seatData.card1/2 + window.renderSeats + ligne logShowdown.
    const _sPr  = Proto.sub(sub, 1);
    const _sPid = Proto.u32(_sPr, 1);
    const _sC1  = Proto.u32orNull(_sPr, 2);
    const _sC2  = Proto.u32orNull(_sPr, 3);
    if (_sPid && _sC1 != null && _sC2 != null) {
      if (S.seatData[_sPid]) { S.seatData[_sPid].card1 = _sC1; S.seatData[_sPid].card2 = _sC2; }
      if (_sPid === S.myId) { window._ownReveal = true; try { renderMyCards(); } catch (e) {} _setCanShow(false); }
      try { window.renderSeats(); } catch (e) {}
      const _sBd = S.commCards.slice();
      window.logAction(function () {
        var ev = (typeof evaluateBestHand === 'function') ? evaluateBestHand([_sC1, _sC2], _sBd) : null;
        return t('logShowdown', {
          name:  window.getPlayerName(_sPid),
          cards: cardName(_sC1, false) + ' ' + cardName(_sC2, false),
          hand:  ev ? ev.label : ''
        });
      });
    }
    return;
}

function onEndOfGame(sub) {
    const winnerPid = Proto.u32(sub, 2);
    const _egPlace = Proto.u32(sub, 3);    // offline: classement à l'élimination (0 si absent)
    const _egElim  = !!Proto.u32(sub, 4);  // offline: joueur humain éliminé
    addChat(null, t('gameOverMsg'), 'sys', { key: 'gameOverMsg' });
    // Keep amInGame true until the user dismisses the overlay, so the
    // table screen stays visible behind it. Stop the turn timer and
    // suppress any further winner pop-ups.
    stopTurnTimer();
    dismissWinner();
    try { _setCanShow(false); } catch (_e) {}
    showEndGameOverlay(winnerPid, { eliminated: _egElim, place: _egPlace });
    try { if (window._handlog) window._handlog.onGameOver(winnerPid); } catch (_e) {}
    // Retour automatique au lobby (parité NetAutoLeaveGameAfterFinish,
    // bible §15) — OPT-IN, parties réseau seulement. 12 s pour laisser
    // lire l'écran de fin ; annulé si l'utilisateur quitte avant
    // (leaveGame purge le timer).
    if (window._advGet('auto_leave', false) && !window._offlineMode) {
      try { clearTimeout(window._autoLeaveTimer); } catch (_e) {}
      window._autoLeaveTimer = setTimeout(function () {
        try { if (S.amInGame && window.App && App.leaveGame) App.leaveGame(); } catch (_e) {}
      }, 12000);
    }
    return;
}

export { onGameStartInitial, onHandStart, onPlayersTurn, onPlayersActionDone, onDealFlop, onDealTurn, onDealRiver, onAllInShowCards, onEndOfHandShow, onEndOfHandHide, onYourActionRejected, onAfterHandShowCards, onEndOfGame };

for (const [k, v] of Object.entries({ onGameStartInitial, onHandStart, onPlayersTurn, onPlayersActionDone, onDealFlop, onDealTurn, onDealRiver, onAllInShowCards, onEndOfHandShow, onEndOfHandHide, onYourActionRejected, onAfterHandShowCards, onEndOfGame }))
  window[k] = v;
