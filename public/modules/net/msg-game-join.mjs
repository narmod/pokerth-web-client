// ═══════════════════════════════════════════════════════════════════
// Handlers réseau — entrée/sortie de partie (JoinGameAck/Failed,
// GamePlayerJoined/Left, RemovedFromGame, StartEvent,
// GameAdminChanged, GameSpectatorJoined/Left) — chantier ESM #9g-C4.
// Corps EXACTS des anciennes cases de handleMsg ; `break` de case →
// `return;` (rien après le switch, règle prouvée en C3). Adaptations
// comptées : imports t, show/setStatus/send (session), addChat (chat),
// renderGames/renderGameInfoPanel/_updateGameHeader (lobby),
// updateLobbyPill/openGameInfoPopup (game-info), stopTurnTimer
// (turn-timer), dismissWinner/showEndGameOverlay (showdown),
// autoScaleTable (seats) ; window.* pour les fonctions pontées
// (renderWaitingPanel, updateSpectatorStrip, setPot [pont ajouté],
// clearSpectatorActions, _rebroadcastAvatar, renderSeats,
// _applyReactMuteUI, animateTableEnter, notifyPlayerConnected/
// GameReady, _hideBanner) ; App.* conservé nu.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { Proto } from './proto.mjs';
import { MSG } from './messages.mjs';
import { send, setStatus, show } from './session.mjs';
import { t } from '../i18n.mjs';
import { addChat } from '../ui/chat.mjs';
import { renderGames, renderGameInfoPanel, _updateGameHeader } from '../ui/lobby.mjs';
import { updateLobbyPill, openGameInfoPopup } from '../ui/game-info.mjs';
import { stopTurnTimer } from '../game/turn-timer.mjs';
import { dismissWinner, showEndGameOverlay } from '../game/showdown.mjs';
import { autoScaleTable } from '../game/seats.mjs';

const T = MSG.T;

function onGameSpectatorJoined(sub) {
    const spid = Proto.u32(sub, 2);
    if (spid && spid !== S.myId) {
      S._specPids.add(spid);
      window.updateSpectatorStrip();
      // Request the pseudo if we don't have it yet. PlayerInfoReply
      // will populate players[spid] and the modal renderer reads
      // straight from there, so the row updates next time the modal
      // is opened (or right now if it's already open).
      if (!S.players[spid]) {
        try {
          const req = Proto.encode([[1,0,spid]]);
          send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
        } catch(e) {}
      }
      // If the modal is currently open, re-render it so the new
      // spectator appears live.
      var _gim = document.getElementById('game-info-modal');
      if (_gim && _gim.style.display === 'flex') {
        try { openGameInfoPopup(); } catch(e) {}
      }
    }
    return;
}

function onGameSpectatorLeft(sub) {
    const spid = Proto.u32(sub, 2);
    if (spid) {
      S._specPids.delete(spid);
      window.updateSpectatorStrip();
      var _gim2 = document.getElementById('game-info-modal');
      if (_gim2 && _gim2.style.display === 'flex') {
        try { openGameInfoPopup(); } catch(e) {}
      }
    }
    return;
}

function onJoinGameAck(sub) {
    S.gId = Proto.u32(sub, 1);
    // Back at the table — clear the transient pending-rejoin flag and the
    // banner, mais ÉCRIRE un marqueur durable « je suis dans la partie gId »
    // (pth_resume) : il permet de réintégrer la table après une coupure
    // suivie d'un rechargement complet (page rechargée → DOM neuf). Pour une
    // coupure transitoire (l'écran de jeu reste affiché), c'est _armRejoin()
    // qui réarme _pendingRejoin au moment de la reconnexion.
    S._pendingRejoin = 0; S._rejoinNickRetries = 0;
    // Jamais en entraînement : le FakeServer est recréé à chaque chargement,
    // un rejoin vers son ancienne partie resterait sans réponse (type 23
    // ignoré) et bloquerait la connexion sur « Reprise en cours… ».
    if (!window._offlineMode) {
      // s:1 = session spectateur → au resume on re-spectatera au lieu de
      // réclamer un siège (voir onInitAck / _armRejoin).
      try { localStorage.setItem('pth_resume', JSON.stringify({ n: S.myName, g: S.gId, t: Date.now(), s: S._amSpectator ? 1 : 0 })); } catch(e) {}
    }
    window._hideBanner();
    // Fresh game = empty spectator set. The server will replay
    // GameSpectatorJoined for each existing spectator so we'll
    // rebuild the set within milliseconds.
    S._specPids = new Set();
    const isAdmin = Proto.u32(sub, 2);
    // Appliquer le timeout de la partie (depuis games[] si on rejoint, sinon celui créé)
    if (S.games[S.gId] && S.games[S.gId].timeout) S.gameTimeout = S.games[S.gId].timeout;
    // Same for starting stack so the seat-data init (line ~1770) uses
    // the real configured value instead of 0. When *we* are the
    // creator, createGame() already wrote gameStartMoney directly —
    // this branch handles the case where we joined someone else's
    // table and discovered the settings via GameListNew.
    if (S.games[S.gId] && S.games[S.gId].startMoney) S.gameStartMoney = S.games[S.gId].startMoney;
    // Blind-raise schedule for the "blinds up" counter/alert.
    S._raiseMode  = (S.games[S.gId] && S.games[S.gId].raiseMode)  || 1;
    S._raiseEvery = (S.games[S.gId] && (S._raiseMode === 2 ? S.games[S.gId].raiseMins : S.games[S.gId].raiseHands)) || 0;
    S._endRaiseMode  = (S.games[S.gId] && S.games[S.gId].endRaiseMode)  || 1;
    S._endRaiseValue = (S.games[S.gId] && S.games[S.gId].endRaiseValue) || 0;
    S._manualBlinds  = (S.games[S.gId] && S.games[S.gId].manualBlinds) || [];
    S._lastBlindsUpHand = 0;
    S.amGameAdmin = !!isAdmin;
    // Replay hors-ligne en un tap : une fois recréée la table (on est admin),
    // enchaîner automatiquement le démarrage avec bots. Différé en microtâche
    // pour laisser ce handler finir son installation d'état.
    if (window._offlineMode && window._offlineAutoReplay && S.amGameAdmin) {
      window._offlineAutoReplay = false;
      setTimeout(function(){ try { App.startWithBots(); } catch (e) {} }, 0);
    }
    // Snapshot the lobby's view of this table for openGameInfoPopup.
    // Fields we care about: name, type, maxPlayers, priv, timeout,
    // startMoney. All of these come from NetGameInfo when the table
    // was originally listed. Default the name to "#<gId>" if missing.
    var _gm = (S.games[S.gId] || {});
    S._gameMeta = {
      id:         S.gId,
      name:       _gm.name || ('#' + S.gId),
      type:       _gm.type || 1,       // 1=NoLimit Hold'em (default)
      maxPlayers: _gm.maxPlayers || 0,
      priv:       !!_gm.priv,
      timeout:    _gm.timeout || S.gameTimeout || 15,
      startMoney: _gm.startMoney || S.gameStartMoney || 3000,
    };
    // Le header affiche desormais le nom reel de la partie (centre) +
    // les badges de statut (Admin / Public-Prive), tout en restant
    // cliquable pour ouvrir la modale de details. Le nom tronque en
    // "..." cote CSS pour ne pas deborder sur mobile.
    try { _updateGameHeader(); } catch(e) {}
    var acb = document.getElementById('admin-close-btn');
    if (acb) acb.style.display = S.amGameAdmin ? '' : 'none';
    var asb = document.getElementById('admin-start-btn');
    if (asb) asb.style.display = S.amGameAdmin ? '' : 'none';
    var acbm = document.getElementById('admin-close-mob');
    if (acbm) acbm.style.display = S.amGameAdmin ? '' : 'none';
    // Kick button: shown only to admins (server ignores non-admin
    // KickPlayerRequest anyway, but exposing it would be confusing).
    var akb = document.getElementById('admin-kick-btn');
    if (akb) akb.style.display = S.amGameAdmin ? '' : 'none';
    var akbm = document.getElementById('admin-kick-mob');
    if (akbm) akbm.style.display = S.amGameAdmin ? '' : 'none';
    var asbm = document.getElementById('admin-start-mob');
    if (asbm) asbm.style.display = S.amGameAdmin ? '' : 'none';
    // Invite-players entry (menu ≡): any seated, non-spectator player
    // online may invite others; the server arbitrates. Hidden offline
    // and for spectators.
    var _imb = document.getElementById('invite-players-mob');
    var _ims = document.getElementById('invite-sep-mob');
    var _canInv = !window._offlineMode && !S._amSpectator;
    if (_imb) _imb.style.display = _canInv ? '' : 'none';
    if (_ims) _ims.style.display = _canInv ? '' : 'none';
    // Ne plus basculer directement sur le feutre : tant que la partie n'a
    // pas démarré, on RESTE dans le lobby (parité GameWaitPage) avec la
    // partie sélectionnée dans le panneau central #lobby-gameinfo et ses
    // options d'attente (case bots + Démarrer/Quitter selon le rôle). Le
    // gametable ne s'affiche qu'à GameStartInitial. On prépare quand même
    // le feutre (nettoyage ci-dessous) pour qu'il soit propre au démarrage.
    if (S._gameStarted) {
      show('s-game');
    } else {
      S._selectedGame = S.gId;
      try { renderGameInfoPanel(S.gId); } catch(e) {}
      try { renderGames(); } catch(e) {}
      // Ne PAS ouvrir automatiquement le panneau « Infos de partie » ici :
      // sur mobile openInfo() fait coulisser un overlay par-dessus le lobby
      // (agacant a chaque creation/join). Le panneau est deja alimente par
      // renderGameInfoPanel ci-dessus ; l'utilisateur l'ouvre via son bouton
      // s'il le souhaite. Sur desktop c'etait deja un no-op (colonne permanente).
      show('s-lobby');
    }
    // Clear any leftover felt from a previously-viewed table. After
    // leaveGame the rendered seats / pot / community stay in the DOM,
    // and since seats[] is empty on entry window.renderSeats() won't redraw —
    // so the previous hand would remain visible behind the waiting
    // panel. The server replays the real state right after JoinGameAck,
    // so starting from a clean felt is always correct (and a harmless
    // no-op when joining a genuinely fresh table).
    try {
      S.pot = 0; S.collectedPot = 0;
      window.setPot(0);
      S.commCards = [];
      var _czComm  = document.getElementById('g-comm');  if (_czComm)  _czComm.innerHTML  = '';
      var _czSeats = document.getElementById('g-seats'); if (_czSeats) _czSeats.innerHTML = '';
    } catch(e) {}
    // ── Spectator UI mode ──
    // If we joined via spectateGame(), flip the banner up top and put
    // a 'You are watching' message in place of the action bar. Player
    // join paths leave _amSpectator untouched (still false) so this
    // branch is skipped and the regular waiting panel logic applies.
    if (S._amSpectator) {
      // Pas de barre d'action en mode spectateur (parité client QML officiel,
      // qui n'affiche rien à la place des boutons).
      window.clearSpectatorActions();
    }
    document.body.classList.add('in-game');
    try { window._applyReactMuteUI(); } catch(e) {}
    // Diffuser l'avatar aux autres joueurs via le proxy. We use
    // _myAvatarToBroadcast() which collapses the '__pth__' sentinel
    // to '' -- the other players will then receive an empty avatar
    // and render our initial. They'll still get our real PokerTH
    // avatar (if any) through their own PlayerInfoReply flow, so
    // sending the sentinel would just produce visual garbage.
    setTimeout(function() { window._rebroadcastAvatar(); }, 500);
    // Plusieurs tentatives pour s'assurer que la table s'affiche
    [100, 300, 600, 1200].forEach(function(d){
      setTimeout(function(){
        autoScaleTable();
        if (S.seats.length > 0) window.renderSeats();
      }, d);
    });
    setTimeout(window.animateTableEnter, 100);
    // Mettre à jour le label de la barre de réactions selon le mode
    var rbl = document.getElementById('reaction-bar-label');
    if (rbl) {
      if (S._currentLoginMode === 'lan') {
        rbl.textContent = t('reactionsLanLocal');
        rbl.style.color = 'var(--orange)';
      } else {
        rbl.textContent = t('reactionsLabel');
        rbl.style.color = '';
      }
    }
    const admBadge = document.getElementById('g-admin-badge');
    if (admBadge) admBadge.style.display = S.amGameAdmin ? '' : 'none';
    try { _updateGameHeader(); } catch(e) {}
    setTimeout(function(){ autoScaleTable(); }, 200);
    window.renderWaitingPanel();
    // The list of already-present players arrives via subsequent
    // GamePlayerJoined messages from the server. Schedule a few
    // refreshes so the panel populates as those messages land,
    // and so PlayerInfoRequest replies catch up.
    [200, 600, 1200, 2500].forEach(function(d){
      setTimeout(function(){ if (!S._gameStarted) window.renderWaitingPanel(); }, d);
    });
    return;
}

function onJoinGameFailed(sub) {
    const failedGameId = Proto.u32(sub, 1);
    const failCode = Proto.u32(sub, 2);
    if (S._pendingRejoin) {
      // We were reclaiming our seat but it's gone (grace window elapsed)
      // or the rejoin was refused — drop cleanly to the lobby. Clear the
      // in-game/admin state too, otherwise the client still thinks it's
      // in (and admin of) the dead table, which blocks creating a new one.
      S._pendingRejoin = 0; S._rejoinNickRetries = 0;
      try { localStorage.removeItem('pth_resume'); } catch(e) {}
      App._resetGameState();
      window._hideBanner();
      updateLobbyPill();
      show('s-lobby');
      setStatus(t('rejoinFailed'), 'err');
      return;
    }
    // PokerTH JoinGameFailureReason codes from pokerth.proto:
    // 1=invalidGame, 2=gameIsFull, 3=gameIsRunning, 4=invalidPassword,
    // 5=notAllowedAsGuest, 6=notInvited, 7=gameNameInUse, 8=badGameName,
    // 9=invalidSettings, 10=ipAddressBlocked, 11=rejoinFailed, 12=noSpectatorsAllowed
    const errMsgs = {
      1: t('errInvalidGame')||'Invalid game',
      2: t('errGameFull')||'Game is full',
      3: t('errInProgress')||'Game already started',
      4: t('errWrongPassword')||'Wrong password',
      5: t('errGuestsNotAllowed')||'Guests are not allowed on this table',
      6: t('errNotInvited')||'Invite-only table — you need an explicit invitation from the host',
      7: t('errNameUsed')||'Game name already in use',
      8: t('errBadGameName')||'Bad game name',
      9: t('errInvalidSettings')||'Invalid game settings',
      10: t('errBlocked')||'IP address blocked',
      11: t('errRejoinFailed')||'Rejoin failed',
      12: t('errNoSpectators')||'Spectators are not allowed'
    };
    const errMsg = errMsgs[failCode] || 'Join failed for game '+failedGameId+' (code '+failCode+')';
    setStatus('⚠ ' + errMsg, 'err');
    // Re-show password prompt if wrong password
    if (failCode === 4) {
      var pp2 = document.getElementById('password-prompt');
      if (pp2 && pp2.dataset.gameId) {
        pp2.style.display = 'flex';
        var ppin = document.getElementById('pp-pass');
        if (ppin) { ppin.value = ''; ppin.focus(); }
      }
    }
    return;
}

function onGamePlayerJoined(sub) {
    const pid = Proto.u32(sub, 2);
    if (!S.seatData[pid]) S.seatData[pid] = {money:0,bet:0,action:'',active:false,folded:false};
    // 'gone' means the player has been seen leaving (GamePlayerLeft).
    // We reset it to false here because the same pid can rejoin (rare,
    // but possible if the player closes and reopens the tab fast).
    S.seatData[pid].gone = false;
    // ── SPECTATOR LATE-ARRIVAL FIX ──
    // When the game has already started (HandStart was processed), we
    // append late-arriving pids straight to seats[] so they appear
    // visually around the felt. For player mode this is a no-op
    // (GameStartInitial populated seats[] before the first
    // GamePlayerJoined, and the includes() check skips the duplicate).
    // For spectator mode it's the only path that learns about
    // newcomers after our HandStart bootstrap.
    if (S._gameStarted && !S.seats.includes(pid)) {
      S.seats.push(pid);
      window.renderSeats();
    }
    const name = S.players[pid] || '#'+pid;
    // Son « joueur connecté » (playerconnected.wav) — parties réseau seulement
    if (pid !== S.myId && !window._offlineMode) {
      try { if (typeof window.notifyPlayerConnected === 'function') window.notifyPlayerConnected(); } catch (_e) {}
    }
    // Ask the server for this player's name if we don't have it yet,
    // so the waiting panel can display a real pseudo rather than '#42'.
    if (!S.players[pid]) {
      try {
        const req = Proto.encode([[1,0,pid]]);
        send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
      } catch(e) {}
    }
    // Refresh the waiting panel if the game hasn't started yet.
    if (!S._gameStarted) window.renderWaitingPanel();
    return;
}

function onGamePlayerLeft(sub) {
    const pid = Proto.u32(sub, 2);
    const name = S.players[pid] || '#'+pid;
    addChat(null, t('playerLeftTable', { name: name }), 'sys', { key: 'playerLeftTable', params: { name: name } });
    if (S.seatData[pid]) { S.seatData[pid].active = false; S.seatData[pid].gone = true; }
    window.renderSeats();
    // Refresh the waiting panel if the game hasn't started yet.
    if (!S._gameStarted) window.renderWaitingPanel();
    // ── Detect "only one player left" and force end-of-game ──
    // PokerTH server 1.1.2-2 is known to OMIT EndOfGameMessage
    // when a player leaves voluntarily (vs being eliminated by
    // a losing all-in). Without this, the remaining human keeps
    // posting blinds and 'winning' lonely hands forever.
    // The user-validated rule (Q1=c): if total non-gone seats
    // drop to <= 1, fire the overlay locally with the last
    // remaining pid as the winner. The eg-overlay handler itself
    // is idempotent — calling it again if EndOfGame eventually
    // arrives from the server is harmless.
    if (S._gameStarted) {
      var stillIn = S.seats.filter(function(p) {
        return S.seatData[p] && !S.seatData[p].gone;
      });
      if (stillIn.length <= 1) {
        // Don't re-trigger if an end-game overlay is already up.
        var _egoEl = document.getElementById('g-endgame-overlay');
        var alreadyShown = _egoEl && _egoEl.style.display !== 'none' && _egoEl.style.display !== '';
        // (empty string defaults to block via CSS; treat that as visible)
        // Stricter check: simply look at the offsetParent.
        var visible = _egoEl && _egoEl.offsetParent !== null;
        if (!visible) {
          var winnerPid = stillIn[0] || S.myId;
          addChat(null, '⚠ ' + t('onePlayerLeft'), 'sys', { prefix: '⚠ ', key: 'onePlayerLeft' });
          stopTurnTimer();
          dismissWinner();
          showEndGameOverlay(winnerPid);
        }
      }
    }
    return;
}

function onRemovedFromGame(sub) {
    // RemovedFromGameMessage: field 1 = gameId, field 2 = removedFromGameReason.
    // Reason enum (pokerth.proto): 0 removedOnRequest · 1 kickedFromGame ·
    // 2 gameIsFull · 3 gameIsRunning · 4 gameTimeout (inactivity) ·
    // 5 removedStartFailed · 6 gameClosed. We surface it so the player (and the
    // logs) know WHY they left — a timeout removal is a real bug to chase, a
    // gameClosed is just the game ending. Unknown codes fall back to generic.
    const reason = Proto.u32(sub, 2);
    const _rk = { 0:'removedReason_onRequest', 1:'removedReason_kicked', 2:'removedReason_full',
                  3:'removedReason_running', 4:'removedReason_timeout', 5:'removedReason_startFailed',
                  6:'removedReason_closed' };
    const key = _rk[reason] || 'youWereRemoved';
    try { console.log('[RemovedFromGame] reason=' + reason + ' (' + key + ')'); } catch (e) {}
    S._gameMeta = null;
    // force:true → passe le filtre anti-« sys » de addChat (le joueur DOIT voir
    // la raison). Atterrit dans le chat lobby (#chat), non effacé au retour lobby.
    addChat(null, t(key), 'sys', { key: key, force: true });
    S._pendingRejoin = 0; try { localStorage.removeItem('pth_resume'); } catch(e) {}
    App._resetGameState();
    show('s-lobby');
    return;
}

function onStartEvent(sub) {
    // Répondre avec StartEventAck
    const evGameId = Proto.u32(sub, 1);
    send(MSG.buildStartEventAck(evGameId));
    // Son « partie prête » (onlinegameready.wav) — parties réseau seulement
    if (!window._offlineMode) {
      try { if (typeof window.notifyGameReady === 'function') window.notifyGameReady(); } catch (_e) {}
    }
    S._eliminatedLogged.clear();
    return;
}

function onGameAdminChanged(sub) {
    const newAdminId = Proto.u32(sub, 2);
    if (newAdminId !== S.myId) S.amGameAdmin = false;
    else S.amGameAdmin = true;
    try { _updateGameHeader(); } catch(e) {}
    return;
}

function onPlayerIdChanged(sub) {
    // PlayerIdChangedMessage (type 54) : oldPlayerId=1, newPlayerId=2.
    // Envoye aux clients d'une partie quand un joueur reprend sa place
    // (RejoinExistingGame) avec une nouvelle session : son ancien pid
    // devient le nouveau. On remappe TOUTES les structures indexees par
    // pid pour que siege, nom, avatar et stack suivent — sinon le joueur
    // revenu apparait en double / en '#id' et son ancien siege reste
    // fige « parti ».
    const oldPid = Proto.u32(sub, 1);
    const newPid = Proto.u32(sub, 2);
    if (!oldPid || !newPid || oldPid === newPid) return;
    const idx = S.seats.indexOf(oldPid);
    if (idx !== -1) S.seats[idx] = newPid;
    if (S.players[oldPid] !== undefined) { S.players[newPid] = S.players[oldPid]; delete S.players[oldPid]; }
    if (S.seatData[oldPid]) { S.seatData[newPid] = S.seatData[oldPid]; delete S.seatData[oldPid]; S.seatData[newPid].gone = false; }
    if (S._playerAvatars[oldPid]) { S._playerAvatars[newPid] = S._playerAvatars[oldPid]; delete S._playerAvatars[oldPid]; }
    if (S._playerImgAvatars[oldPid]) { S._playerImgAvatars[newPid] = S._playerImgAvatars[oldPid]; delete S._playerImgAvatars[oldPid]; }
    if (S._seatStackAtHandStart && S._seatStackAtHandStart[oldPid] != null) {
      S._seatStackAtHandStart[newPid] = S._seatStackAtHandStart[oldPid];
      delete S._seatStackAtHandStart[oldPid];
    }
    if (S.dealerPid === oldPid) S.dealerPid = newPid;
    if (S.turnPid === oldPid) S.turnPid = newPid;
    if (S.myId === oldPid) S.myId = newPid; // defensif — normalement jamais nous
    try { if (window._prevDealerPid === oldPid) window._prevDealerPid = newPid; } catch (e) {}
    try { window.renderSeats(); } catch (e) {}
    return;
}

export { onGameSpectatorJoined, onGameSpectatorLeft, onJoinGameAck, onJoinGameFailed, onGamePlayerJoined, onGamePlayerLeft, onRemovedFromGame, onStartEvent, onGameAdminChanged, onPlayerIdChanged };

for (const [k, v] of Object.entries({ onGameSpectatorJoined, onGameSpectatorLeft, onJoinGameAck, onJoinGameFailed, onGamePlayerJoined, onGamePlayerLeft, onRemovedFromGame, onStartEvent, onGameAdminChanged, onPlayerIdChanged }))
  window[k] = v;
