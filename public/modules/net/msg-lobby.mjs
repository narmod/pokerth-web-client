// ═══════════════════════════════════════════════════════════════════
// Handlers réseau — lobby & connexion (Announce/InitAck/AuthChallenge,
// Error, ReportGameAck, AdminBanPlayerAck, Statistics, PlayerList,
// PlayerInfoReply, GameList*) — chantier ESM #9g-C3.
// Chaque fonction = le corps EXACT de l'ancienne case de handleMsg,
// signature (sub). handleMsg n'ayant AUCUN code après son switch,
// chaque `break` de niveau case est devenu `return;` (sémantique
// identique, y compris les sorties anticipées d'InitAck).
// Adaptations (comptées et prouvées par AST) : imports t, setStatus/
// send/_endConnecting/show (session), renderGames/updateLobbyStatsBar/
// renderGameInfoPanel (lobby), addChat (chat), PTHCrypto (crypto),
// _pthCacheGet (avatar-cache), updateLobbyPill (game-info),
// _lifeSeedFromServer (stats) ; window.* pour les globaux du script
// (showToast, _showBanner/_hideBanner, _startIpBlockCountdown,
// renderPlayersList, _lang, getPlayerName) et les fonctions restées
// dans l'IIFE (_defaultNameForMode, _tableHasPid, renderWaitingPanel
// — ponts ajoutés) ; `App.*` conservé nu (const lexical global du
// script, résolu à l'exécution) ; $( réécrit.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { Proto } from './proto.mjs';
import { MSG } from './messages.mjs';
import { PTHCrypto } from './crypto.mjs';
import { send, setStatus, show, _endConnecting } from './session.mjs';
import { _pthCacheGet } from './avatar-cache.mjs';
import { t } from '../i18n.mjs';
import { addChat } from '../ui/chat.mjs';
import { renderGames, updateLobbyStatsBar, renderGameInfoPanel } from '../ui/lobby.mjs';
import { updateLobbyPill } from '../ui/game-info.mjs';
import { _lifeSeedFromServer } from '../game/stats.mjs';

const T = MSG.T;

function onAnnounce(sub) {
    const pv    = Proto.sub(sub, 1); // protocolVersion (réseau, ex: 5.1)
    const gv    = Proto.sub(sub, 2); // latestGameVersion (appli, ex: 2.0)
    const stype = Proto.u32(sub, 4); // 0=LAN, 1=NoAuth, 2=Auth
    const np    = Proto.u32(sub, 5);
    const pMaj  = Proto.u32(pv, 1), pMin = Proto.u32(pv, 2);
    const gMaj  = Proto.u32(gv, 1), gMin = Proto.u32(gv, 2);

    const loginMode = document.getElementById('login-mode') ? document.getElementById('login-mode').value : 'guest';
    // Mot de passe de COMPTE optionnel sur serveur dédié / LAN : s'il est
    // saisi (champ user-pass de la roue crantée), on bascule en
    // authenticatedLogin pour l'envoyer dans clientUserData — permet à un
    // serveur dédié avec gestion de comptes d'authentifier l'utilisateur.
    // Vide ⇒ on garde le login normal du mode (unauthenticated / guest).
    const userAcctPass = ((loginMode === 'unauth' || loginMode === 'lan') && document.getElementById('user-pass'))
      ? document.getElementById('user-pass').value.trim() : '';
    const useAcctAuth = !!userAcctPass;
    if (stype === 2 && loginMode !== 'guest' && loginMode !== 'auth' && !useAcctAuth) {
      setStatus(t('serverRequiresAuth'), 'err');
      S._intentionalDisconnect = true; // fatal config error — don't auto-retry
      S.ws.close(); return;
    }
    let loginType;
    if (loginMode === 'unauth' || loginMode === 'guest') loginType = 2;
    else if (loginMode === 'auth') loginType = 1;
    else loginType = 0; // lan
    if (useAcctAuth) loginType = 1; // mot de passe utilisateur saisi ⇒ authenticatedLogin
    // Track lifetime stats / leaderboard only on the private server & LAN
    // (private server / LAN). pokerth.net modes (guest + registered) are never
    // recorded — strangers and throwaway guest names would pollute it.
    // Stats scope by mode:
    //  • training (vs bots) → own persistent "à vie" store (pth_life_offline),
    //    NEVER pushed to the shared family leaderboard;
    //  • private server / LAN → shared leaderboard (push + seed) as before;
    //  • pokerth.net direct → session only.
    S._statsOffline  = !!window._offlineMode;
    S._boardEligible = !S._statsOffline && (loginMode === 'unauth' || loginMode === 'lan');
    S._statsEligible = S._statsOffline || S._boardEligible;
    if (S._boardEligible) _lifeSeedFromServer();
    const typeLabel = ['LAN','Internet (no-auth)','Internet (auth)'][stype] || 'Serveur';
    setStatus(t('connectingPlayers', { type: typeLabel, ver: pMaj + '.' + pMin, n: np }));
    S.lastMajor = pMaj; S.lastMinor = pMin; S.lastLoginType = loginType;
    const authPass = (loginType === 1)
      ? (useAcctAuth ? userAcctPass : (document.getElementById('pass') ? document.getElementById('pass').value : ''))
      : null;
    // Compte authentifié : pokerth.net chiffre nos cartes (encryptedCards)
    // avec une clé dérivée du mot de passe. On la calcule maintenant
    // (SHA-1 pur-JS, SYNCHRONE) — donc prête à coup sûr avant le 1er
    // HandStart (plus de course async) et fonctionnelle même hors contexte
    // sécurisé (http local). Sinon on efface toute clé résiduelle
    // (passage auth → invité sans recharger la page).
    S._cardKey = null; S._cardIV = null;
    if (loginType === 1 && authPass) {
      try {
        const _kv = PTHCrypto.deriveKeyIv(new TextEncoder().encode(authPass));
        S._cardKey = _kv.key; S._cardIV = _kv.iv;
      } catch (e) { S._cardKey = null; S._cardIV = null; }
    }
    // Pré-armer le rejoin AVANT d'envoyer Init : si une partie récente est
    // mémorisée (pth_resume, même pseudo, < 5 min), on note _pendingRejoin
    // pour que le handler Error(4) « pseudo pris » RÉCLAME le siège (attend
    // que le fantôme tombe, réessaie le même pseudo) au lieu de renommer.
    // Couvre le rechargement complet ; la coupure transitoire est déjà
    // couverte par _armRejoin().
    if (!S._pendingRejoin && !window._offlineMode) {
      try {
        var _rs0 = JSON.parse(localStorage.getItem('pth_resume') || 'null');
        if (_rs0 && _rs0.n === S.myName && (Date.now() - _rs0.t) < 5 * 60 * 1000) S._pendingRejoin = _rs0.g;
      } catch (e) {}
    }
    // Mot de passe serveur (optionnel, masqué sous « plus d'options »).
    // Trimmé ; vide → null donc omis de l'InitMessage. Lu directement ici
    // (comme authPass) pour couvrir aussi les reconnexions automatiques.
    const srvPass = (document.getElementById('server-pass') ? document.getElementById('server-pass').value.trim() : '') || null;
    send(MSG.buildInit(S.myName, pMaj, pMin, loginType, authPass, srvPass));
    return;
}

function onInitAck(sub) {
    S._wasAuthenticated = true;
    S._lastConnectFailed = false; // connexion réussie
    _endConnecting();           // login OK → unlock the connect button
    S._reconnectAttempts = 0;
    S.myId = Proto.u32(sub, 2);
    S._rejoinNickRetries = 0;
    // Demander NOTRE PROPRE PlayerInfo : le serveur n'écho pas toujours
    // notre arrivée dans PlayerList, donc sans ça on n'apprend jamais le
    // hash de notre avatar pokerth.net. Le handler PlayerInfoReply
    // déclenche ensuite le téléchargement/cache/rendu de l'avatar (et
    // confirme notre pseudo canonique). Inoffensif pour invité/LAN
    // (la réponse n'aura simplement pas de champ avatar).
    try {
      S._pendingNameRequests.add(S.myId);
      const _selfReq = Proto.encode([[1, 0, S.myId]]);
      send(Proto.encode([[1, 0, T.PlayerInfoRequest], [19, 2, _selfReq]]));
    } catch (e) {}
    // Auto-rejoin the table we dropped from, if any. Source: the in-memory
    // flag (transient drop) or a recent persisted marker (full reload).
    // Same nickname required so we don't hijack another player's seat.
    var _rt = S._pendingRejoin;
    if (window._offlineMode) {
      // Entraînement : aucune partie ne survit au rechargement — on ignore et
      // on purge tout marqueur de reprise (y compris hérité d'avant correctif).
      _rt = 0; S._pendingRejoin = 0;
      try { localStorage.removeItem('pth_resume'); } catch (e) {}
    }
    if (!_rt) {
      try {
        var _rs = JSON.parse(localStorage.getItem('pth_resume') || 'null');
        if (_rs && _rs.n === S.myName && (Date.now() - _rs.t) < 5 * 60 * 1000) _rt = _rs.g;
      } catch (e) {}
    }
    if (_rt) {
      S._pendingRejoin = _rt;
      window._showBanner(t('rejoinInProgress'));
      try { send(MSG.buildRejoinGame(_rt)); } catch (e) {}
      return;   // JoinGameAck → game screen; JoinGameFailed → lobby fallback
    }
    updateLobbyPill();
    App._resetGameState();   // ensure a clean lobby baseline (no-op on first connect)
    // Entrainement : pas d'etape lobby — le formulaire « Creer une table »
    // s'ouvre directement (le lobby reste accessible via Annuler/retour).
    if (window._offlineMode) { try { App.openCreatePage(); } catch (eOc) { show('s-lobby'); } }
    else show('s-lobby');
    // Demander la permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(function(){});
    }
    const cfName = document.getElementById('cf-name');
    if (cfName) cfName.value = window._defaultNameForMode();  // nom par défaut (mode courant / admin)
    return;
}

function onAuthChallenge(sub) {
    // Legacy auth (SCRAM temporarily disabled): empty AuthClientResponse.
    setStatus(t('verifyingAccount'));
    send(MSG.buildAuthResponse());
    return;
}

function onReportGameAck(sub) {
    // ReportGameAckMessage : reportedGameId=1, reportGameResult=2
    // (0 accepté · 1 déjà signalé · 2 invalide/erreur)
    var _rgRes = Proto.u32(sub, 2);
    if (_rgRes === 0) {
      window.showToast(t('reportGameAccepted'), { icon: '\u2713' });
    } else if (_rgRes === 1) {
      window.showToast(t('reportGameDup'), { icon: '\u2139' });
    } else {
      window.showToast(t('reportGameError'), { tone: 'error', icon: '\u2715' });
    }
    return;
}

function onAdminBanPlayerAck(sub) {
    // AdminBanPlayerAckMessage : banPlayerId=1, banPlayerResult=2
    // (0 accepté · 1 en attente · 2 pas de BDD · 3 erreur BDD · 4 invalide)
    var _kbPid = Proto.u32(sub, 1);
    var _kbRes = Proto.u32(sub, 2);
    var _kbNm = window.getPlayerName(_kbPid) || ('#' + _kbPid);
    if (_kbRes === 0 || _kbRes === 1) {
      window.showToast((typeof t === 'function' && t('kickbanOk') !== 'kickbanOk')
        ? t('kickbanOk', { name: _kbNm }) : ('Kickban: ' + _kbNm));
    } else {
      window.showToast(((typeof t === 'function' && t('kickbanFail') !== 'kickbanFail')
        ? t('kickbanFail') : 'Kickban failed') + ' (' + _kbRes + ')',
        { tone: 'error', icon: '\u2715' });
    }
    return;
}

function onError(sub) {
    _endConnecting();   // server rejected → free the button now
    S._lastConnectFailed = true;
    const codes = {1:t('connErrVersion'),2:t('connErrFull'),3:t('connErrAuth'),
      4:t('connErrNickTaken'),5:t('connErrNickInvalid'),6:t('connErrMaintenance'),7:t('connErrBlocked')};
    const r = Proto.u32(sub, 1);
    if (r === 3) {
      // initAuthFailure: login/password rejected by server
      setStatus(t('errBadCreds'), 'err');
      S._intentionalDisconnect = true; // bad credentials — retrying won't help
      S.ws.close(); return;
    }
    if (r === 7) {
      S._intentionalDisconnect = true;
      S._wasAuthenticated = false;
      window._hideBanner();
      S._ipBlockUntil = Date.now() + 1 * 60 * 1000; // 1 minute (was 5 — server usually clears earlier)
      window._startIpBlockCountdown();
      setStatus(t('ipBlockedRetry'), 'err'); return;
    }
    if (r === 4) {
      // Pseudo déjà utilisé sur le serveur. On NE renomme JAMAIS (l'ancien
      // code passait à « narmod_211 ») et on N'enchaîne PAS d'essais : ces
      // deux comportements alimentaient une tempête de connexions qui
      // finissait par faire bloquer l'IP (initBlocked). À la place : on
      // informe clairement et on s'arrête. L'utilisateur attend que sa
      // session précédente expire (~2 min, grâce proxy) ou choisit un autre
      // pseudo, puis se reconnecte manuellement. (En multi-onglets, chaque
      // onglet doit utiliser un pseudo distinct — ce message le rappelle.)
      S._pendingRejoin = 0; S._rejoinNickRetries = 0;
      S._wasAuthenticated = false;
      S._intentionalDisconnect = true;             // stoppe toute reconnexion auto
      try { localStorage.removeItem('pth_resume'); } catch (e) {}
      window._hideBanner();
      var _fr = (typeof window._lang === 'undefined' || window._lang !== 'en');
      var _msg = _fr
        ? '« ' + S.myName + ' » est déjà utilisé. Une session précédente est peut-être encore active : patiente ~2 min, ou choisis un autre pseudo, puis reconnecte.'
        : '“' + S.myName + '” is already in use. A previous session may still be active: wait ~2 min, or pick another nickname, then reconnect.';
      setStatus(_msg, 'err');
    } else {
      setStatus(t('errGeneric', { code: codes[r] || ('code ' + r) }), 'err');
    }
    return;
}

function onPlayerList(sub) {
    // PlayerListMessage: playerId=1, notification=2 (0=new, 1=left)
    const _pid_pl = Proto.u32(sub, 1);
    const notif = Proto.u32(sub, 2);
    if (notif === 0) {
      S._lobbyPlayerCount++;
      S._lobbyPids.add(_pid_pl);
      // Fetch the player's name so the players-online panel can
      // show something better than '#42'. Skip if we already
      // know the name OR have already asked.
      if (!S.players[_pid_pl] && !S._pendingNameRequests.has(_pid_pl)) {
        S._pendingNameRequests.add(_pid_pl);
        try {
          const req = Proto.encode([[1,0,_pid_pl]]);
          send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
        } catch(e) {}
      }
    } else if (notif === 1) {
      S._lobbyPlayerCount = Math.max(0, S._lobbyPlayerCount - 1);
      S._lobbyPids.delete(_pid_pl);
      S._pendingNameRequests.delete(_pid_pl);
    }
    if (!S._hasStatistics) {
      document.getElementById('h-players').textContent = S._lobbyPlayerCount + ' ' + t('playersOnline');
    }
    // Refresh the panel if it's open.
    var _pp = document.getElementById('players-panel');
    if (_pp && _pp.style.display !== 'none' && typeof window.renderPlayersList === 'function') window.renderPlayersList();
    return;
}

function onStatistics(sub) {
    const arr = sub[1] || [];
    for (const d of arr) {
      const s = Proto.decode(d);
      if (Proto.u32(s,1) === 1) {
        // Server-authoritative count. Mark the flag so PlayerList
        // updates stop overriding the header pill from below.
        S._hasStatistics = true;
        S._lobbyPlayerCount = Proto.u32(s,2);
        document.getElementById('h-players').textContent = S._lobbyPlayerCount + ' ' + t('playersOnline');
        updateLobbyStatsBar();
      }
    }
    return;
}

function onPlayerInfoReply(sub) {
    const pid = Proto.u32(sub, 1);
    const info = Proto.sub(sub, 2);
    const name = Proto.str(info, 1);
    if (name) S.players[pid] = name;
    // Rafraîchir un panneau « joueurs à cette table » en attente de ce pseudo.
    if (name && S._openTables.size && window._tableHasPid(pid)) renderGames();
    // Code pays (champ 4, optionnel) — présent surtout sur pokerth.net.
    var cc = Proto.str(info, 4);
    if (cc) S._playerCountries[pid] = cc.toUpperCase();
    // Panneau « Infos de partie » : rafraîchir si ce joueur appartient à la
    // partie sélectionnée (nom/drapeau qui arrivent en asynchrone).
    if ((name || cc) && S._selectedGame != null) {
      var _selG = S.games[S._selectedGame];
      if (_selG && _selG.seats && _selG.seats.indexOf(pid) !== -1) {
        try { renderGameInfoPanel(S._selectedGame); } catch(e) {}
      }
    }
    // Droits (champ 3) : 1=invité, 2=enregistré, 3=admin. Sert à ne
    // rendre cliquables que les joueurs ayant un compte pokerth.net.
    var rights = Proto.u32(info, 3);
    if (rights) S._playerRights[pid] = rights;
    S._pendingNameRequests.delete(pid); // got the reply, free for retry if needed
    // ── Step 1 (PokerTH avatar): peek for the optional AvatarData
    // sub-message (field 5). Present only for registered players who
    // uploaded an avatar on pokerth.net. We just log + memoize.
    // The download (AvatarRequest/Header/Data/End) is intentionally
    // NOT done yet -- this step exists to verify hashes are
    // detected correctly before we add anything else.
    const avData = Proto.sub(info, 5);
    if (avData && Object.keys(avData).length > 0) {
      const avType = Proto.u32(avData, 1); // 1=PNG, 2=JPG, 3=GIF
      const avHashBytes = Proto.raw(avData, 2);
      if (avHashBytes && avHashBytes.length > 0) {
        // Convert bytes to lower-case hex string for logging.
        let hashHex = '';
        for (let i = 0; i < avHashBytes.length; i++) {
          const h = avHashBytes[i].toString(16);
          hashHex += (h.length === 1 ? '0' : '') + h;
        }
        S._pthAvatarHashes[pid] = { type: avType, hashHex: hashHex };
        // ── Step 3: cache hit?
        // If the same hash has been downloaded in a previous session
        // and is still in localStorage, restore it immediately --
        // no network round-trip, no AvatarRequest, no waiting.
        if (!S._pthAvatarsByHash[hashHex] && !S._pthDataUrls[hashHex]) {
          const cached = _pthCacheGet(hashHex);
          if (cached) {
            S._pthAvatarsByHash[hashHex] = {
              status: 'done', type: cached.type, expectedSize: 0,
              chunks: [], received: 0,
            };
            S._pthDataUrls[hashHex] = cached.dataUrl;
            // Re-render so the seat picks up the image right away.
            if (typeof window._renderSeats === 'function') window._renderSeats();
            if (typeof window.refreshMyAvatar === 'function') window.refreshMyAvatar();
            if (S._openTables.size) renderGames();
          }
        }
        // ── Step 2: cache miss -> kick off an AvatarRequest. Dedup
        // by hash so two players sharing an avatar download once.
        if (!S._pthAvatarsByHash[hashHex]) {
          S._pthAvatarsByHash[hashHex] = {
            status: 'pending', // 'pending' | 'done' | 'unknown' | 'error'
            type:   avType,
            expectedSize: 0,   // filled by AvatarHeader
            chunks: [],        // Uint8Array[] -- joined at AvatarEnd
            received: 0,       // running total bytes
          };
          const reqId = S._pthNextAvatarReqId++;
          S._pthAvatarReqIdToHash[reqId] = hashHex;
          const reqMsg = Proto.encode([
            [1, 0, reqId],
            [2, 2, avHashBytes],
          ]);
          send(Proto.encode([[1, 0, T.AvatarRequest], [8, 2, reqMsg]]));
        } else if (S._pthAvatarsByHash[hashHex].status === 'done') {
          // Already cached this session -- nothing to do, the
          // re-render path will pick it up.
        }
      }
    }
    // If the waiting panel is visible, update it so the new pseudo
    // appears in place of the temporary '#<pid>' placeholder. On teste gId
    // (posé au JoinGameAck) et non amInGame (true seulement au démarrage).
    if (!S._gameStarted && S.gId) window.renderWaitingPanel();
    // Same idea for the lobby players panel.
    var _pp2 = document.getElementById('players-panel');
    if (_pp2 && _pp2.style.display !== 'none' && typeof window.renderPlayersList === 'function') window.renderPlayersList();
    return;
}

function onGameListNew(sub) {
    const id   = Proto.u32(sub, 1);
    const mode = Proto.u32(sub, 2); // 1=created,2=started,3=closed
    const priv = Proto.u32(sub, 3);
    const gi   = Proto.sub(sub, 6); // NetGameInfo
    const name = Proto.str(gi, 1) || `#${id}`;
    const gtype= Proto.u32(gi, 2);
    const maxp = Proto.u32(gi, 3);

    // Liste des joueurs présents (champ 4 = playerIds). Selon l'état de la
    // partie, le serveur l'envoie tantôt en varints PACKED (un buffer),
    // tantôt en REPEATED (une valeur par occurrence). On gère les deux,
    // sinon les sièges restaient vides pour certaines parties (panneau
    // « Joueurs dans la partie (0) » alors que la partie a des joueurs).
    let _seats = [];
    if (sub[4]) {
      var _raw4 = sub[4];
      for (var _i4 = 0; _i4 < _raw4.length; _i4++) {
        var _el4 = _raw4[_i4];
        if (typeof _el4 === 'number') {
          _seats.push(_el4);                                   // repeated non-packed
        } else if (_el4 && _el4.length !== undefined) {
          var _p4 = 0;                                         // packed varints
          while (_p4 < _el4.length) { var _r4 = Proto.decodeVarint(_el4, _p4); _p4 = _r4.pos; _seats.push(_r4.value); }
        }
      }
    }
    let pc = _seats.length;

    // Pull playerActionTimeout from the NetGameInfo we already decoded
    // above (field 6 of GameListNewMessage). Previous attempts probed
    // sub[13] / sub[5] for a NetGameInfo that lives under neither —
    // both came back null, so `timeout` always fell through to the
    // hard-coded 15 s default regardless of what the table creator
    // had set. NetGameInfo.playerActionTimeout is field 11 (see
    // buildCreateGame above, which writes the same key).
    var _gto = Proto.u32(gi, 11) || 0;
    // NetGameInfo.startMoney is field 13 — same key the table creator
    // wrote via buildCreateGame(). Default to 3000 if absent (matches
    // the PokerTH server default for unconfigured games).
    var _gsm = Proto.u32(gi, 13) || 0;
    // NetGameInfo raise schedule: field 4 = mode (1=every N hands,
    // 2=every N minutes), field 5 = N hands (mode 1), field 6 = N
    // minutes (mode 2). Used to show a "blinds up in X hands" counter.
    var _grmode  = Proto.u32(gi, 4) || 1;
    var _grhands = Proto.u32(gi, 5) || 0;
    var _grmins  = Proto.u32(gi, 6) || 0;
    var _germode = Proto.u32(gi, 7) || 1;  // endRaiseMode (1=double,2=+val,3=keep)
    var _gerval  = Proto.u32(gi, 8) || 0;  // endRaiseSmallBlindValue
    var _gsb     = Proto.u32(gi, 12) || 0; // NetGameInfo.firstSmallBlind (field 12)
    var _gdelay  = Proto.u32(gi, 10) || 0; // NetGameInfo.delayBetweenHands (field 10) → 2e « Temps »
    // NetGameInfo.manualBlinds (champ 14, repeated packed uint32) : comme
    // pour les playerIds (champ 4 plus haut), on gère les deux encodages
    // packed (un buffer de varints) et repeated (une valeur par entrée).
    var _gmb = [];
    if (gi[14]) {
      for (var _im = 0; _im < gi[14].length; _im++) {
        var _em = gi[14][_im];
        if (typeof _em === 'number') { _gmb.push(_em); }
        else if (_em && _em.length !== undefined) {
          var _pm = 0;
          while (_pm < _em.length) { var _rm = Proto.decodeVarint(_em, _pm); _pm = _rm.pos; _gmb.push(_rm.value); }
        }
      }
    }
    S.games[id] = { name, mode, players:pc, seats:_seats, maxPlayers:maxp, type:gtype, priv:!!priv,
                  timeout: _gto || 15, startMoney: _gsm || 3000, delay: _gdelay,
                  raiseMode: _grmode, raiseHands: _grhands, raiseMins: _grmins, smallBlind: _gsb,
                  endRaiseMode: _germode, endRaiseValue: _gerval, manualBlinds: _gmb };
    if (!S.loaded) { S.loaded = true; }
    renderGames();
    // ── Auto-join from a share link ──
    // If we arrived via a "copy table link" URL and this is the
    // table it pointed to, join it now (the lobby has just told
    // us it exists). Clear the pending id so we only do it once.
    // window._pendingAutoJoin is set by parseShareLink() which
    // runs at global scope (outside this IIFE).
    if (window._pendingAutoJoin && id === window._pendingAutoJoin && !S.amInGame) {
      var _aj = window._pendingAutoJoin;
      window._pendingAutoJoin = 0;
      var fr = (typeof window._lang === 'undefined' || window._lang !== 'en');
      addChat(null, t('sharedTableJoining'), 'sys', { key: 'sharedTableJoining' });
      // Defer slightly so renderGames() has painted and games[id]
      // is fully populated before joinGame reads it.
      setTimeout(function(){
        try { if (App && App.joinGame) App.joinGame(_aj); } catch(e) {}
      }, 150);
    }
    return;
}

function onGameListUpdate(sub) {
    const id   = Proto.u32(sub, 1);
    const mode = Proto.u32(sub, 2);
    if (S.games[id]) {
      if (mode === 3) delete S.games[id];
      else S.games[id].mode = mode;
      renderGames();
    }
    return;
}

function onGameListPlayerJoined(sub) {
    const id  = Proto.u32(sub, 1);
    const pid = Proto.u32(sub, 2);
    if (S.games[id]) {
      if (!S.games[id].seats) S.games[id].seats = [];
      if (pid && S.games[id].seats.indexOf(pid) === -1) S.games[id].seats.push(pid);
      S.games[id].players = S.games[id].seats.length;
      if (pid && !S.players[pid] && S._openTables.has(String(id)) && !S._pendingNameRequests.has(pid)) {
        S._pendingNameRequests.add(pid);
        try { send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
      }
      renderGames();
    }
    return;
}

function onGameListPlayerLeft(sub) {
    const id  = Proto.u32(sub, 1);
    const pid = Proto.u32(sub, 2);
    if (S.games[id]) {
      if (S.games[id].seats) {
        const _ix = S.games[id].seats.indexOf(pid);
        if (_ix !== -1) S.games[id].seats.splice(_ix, 1);
        S.games[id].players = S.games[id].seats.length;
      } else if (S.games[id].players > 0) { S.games[id].players--; }
      renderGames();
    }
    return;
}

function onGameListSpectatorJoined(sub) {
    /* pas besoin de compter les spectateurs ici */ return;
}

function onGameListSpectatorLeft(sub) {
   return;
}

export { onAnnounce, onInitAck, onAuthChallenge, onReportGameAck, onAdminBanPlayerAck, onError, onPlayerList, onStatistics, onPlayerInfoReply, onGameListNew, onGameListUpdate, onGameListPlayerJoined, onGameListPlayerLeft, onGameListSpectatorJoined, onGameListSpectatorLeft };

for (const [k, v] of Object.entries({ onAnnounce, onInitAck, onAuthChallenge, onReportGameAck, onAdminBanPlayerAck, onError, onPlayerList, onStatistics, onPlayerInfoReply, onGameListNew, onGameListUpdate, onGameListPlayerJoined, onGameListPlayerLeft, onGameListSpectatorJoined, onGameListSpectatorLeft }))
  window[k] = v;
