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
      // Animer le déplacement du dealer + fade des actions
      if (window._prevDealerPid >= 0 && window._prevDealerPid !== S.dealerPid) {
        setTimeout(function(){ window.animateDealerMove(window._prevDealerPid, S.dealerPid); }, 200);
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
    if (S._preAction) console.log('[prearm] reset nouvelle main (était: ' + S._preAction + ')');
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
      console.log('[cards-diag]', JSON.stringify(_cd));
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

export { onGameStartInitial, onHandStart };

for (const [k, v] of Object.entries({ onGameStartInitial, onHandStart }))
  window[k] = v;
