// ═══════════════════════════════════════════════════════════════════
// Lobby : liste des tables (filtres, stats bar), panneau « Infos de
// partie », actions de la wait-page, en-tête TABLE — chantier ESM #9f-8.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), _groupThousands (fmt.mjs), Proto
// (net/proto.mjs), _ccToFlag/_avatarChipHtml (player-popup.mjs)
// importés ; send / renderPlayersList / _lang via window.* ;
// $( réécrit en document.getElementById(.
// NOTE parité : le `T.PlayerInfoRequest` nu (renderTablePlayers,
// _renderInfoPlayerRows) est un bug latent PRÉEXISTANT — la
// ReferenceError est avalée par le try/catch, la requête ne part
// jamais. Conservé à l'identique ; fix proposé séparément (MSG.T).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from './misc.mjs';
import { _groupThousands } from './fmt.mjs';
import { Proto } from '../net/proto.mjs';
import { _ccToFlag, _avatarChipHtml } from './player-popup.mjs';

// ──────────────────────────────────────────────────────────────
// Game info modal -- snapshot of the current table's settings +
// state, opened by clicking the "TABLE" label in the game header.
// Per the user-validated design (Q1=c, Q2=a, Q3=b):
//   - All sections EXCEPT the player list (saves vertical space).
//   - Snapshot at click time, not live-updated.
//   - Subtle underline hover on the trigger.
// ──────────────────────────────────────────────────────────────
function _gameTypeLabel(t) {
  // PokerTH NetGameInfo.netGameType enum (from the protocol):
  //   1 = normal game (the default created via the UI)
  //   2 = registered-only
  //   3 = invite-only
  // The server has no separate "limit/no-limit" field exposed in
  // the listing -- it's always No Limit Texas Hold'em here.
  switch (t) {
    case 2: return (window._lang === 'fr') ? 'Inscrits seulement' : 'Registered only';
    case 3: return (window._lang === 'fr') ? 'Sur invitation' : 'Invite only';
    default: return (window._lang === 'fr') ? 'Partie normale' : 'Normal game';
  }
}

// ──────────────────────────────────────────────────────────────
// En-tete de jeu : nom de la table + badges de statut, centres.
// _updateGameHeader() peuple #g-name (nom reel de la partie),
// #g-admin-badge (visible si je suis admin) et #g-public-badge
// (Public/Prive selon _gameMeta.priv). _resetGameHeader() remet
// l'etiquette "TABLE" et masque les badges au depart de la table.
// ──────────────────────────────────────────────────────────────
function _updateGameHeader() {
  var nameEl = document.getElementById('g-name');
  if (nameEl && S._gameMeta) {
    nameEl.textContent = S._gameMeta.name || ('#' + (S._gameMeta.id || S.gId));
  }
  var adm = document.getElementById('g-admin-badge');
  if (adm) adm.style.display = S.amGameAdmin ? '' : 'none';
  var pub = document.getElementById('g-public-badge');
  if (pub) {
    var priv = !!(S._gameMeta && S._gameMeta.priv);
    pub.style.display = '';
    pub.classList.toggle('g-status-private', priv);
    pub.classList.toggle('g-status-public', !priv);
    if (pub.firstChild && pub.firstChild.nodeType === 3) {
      pub.firstChild.nodeValue = priv ? '\uD83D\uDD12' : '\uD83C\uDF10';
    }
    var lbl = pub.querySelector('span');
    if (lbl) {
      var key = priv ? 'piPrivate' : 'piPublic';
      lbl.setAttribute('data-i18n', key);
      lbl.textContent = t(key);
    }
  }
}

// ── AFFICHAGE DES TABLES ──
// Resolve mode labels via t() at CALL time, not at module-init time —
// when this file loads, the i18n table from modules/i18n.mjs hasn't
// been attached to the closure yet (its <script type=module> defers
// until after this file's IIFE runs). Building the dict eagerly threw
// 'ReferenceError: t is not defined', which broke the entire IIFE and
// left App undefined — that's why no header button worked.
function MODE_LABEL(mode) {
  if (mode === 1) return t('modeWaiting');
  if (mode === 2) return t('modeInProgress');
  if (mode === 3) return t('modeClosed');
  return '?';
}
function GTYPE(tp) { return ({1:t('gtypeNormal'), 2:t('gtypeRegistered'), 3:t('gtypeInvite'), 4:t('gtypeRanked')})[tp]; }

// Predicate for the table-list filter (design A).
//   open   = waiting (mode 1) and not full        → joinable now
//   nopass = not password-protected / invite-only
//   live   = game in progress (mode 2)             → watchable
function _tableMatches(g, filter) {
  var f = parseInt(filter, 10); if (isNaN(f)) f = 0;
  var prot    = g.priv || g.type === 3;
  var open    = g.mode === 1;
  var nonfull = g.players < (g.maxPlayers || 0);
  switch (f) {
    case 1: return open;                            // Jeux ouverts
    case 2: return open && nonfull;                 // + non complets
    case 3: return open && nonfull && !prot;        // + non privés
    case 4: return open && nonfull && prot;         // + privés
    case 5: return open && nonfull && g.type === 4; // + classés
    default: return true;                           // 0 = Aucun filtre
  }
}
function _refreshFilterChips(entries) {
  // Menu déroulant (parité QML gameListFilter) : on synchronise juste la
  // valeur sélectionnée avec le filtre actif.
  var sel = document.getElementById('g-filter-select');
  if (sel && sel.value !== String(S._tableFilter)) sel.value = String(S._tableFilter);
}

// ── Liste dépliable des joueurs par table (lobby) ─────────────
// GameListNew fournit l'ENSEMBLE des IDs joueurs de chaque table
// (champ 4, playerIds) — pas leur position de siège — donc on liste
// qui est présent et on demande à la volée les pseudos inconnus
// (même déduplication que le roster des joueurs en ligne).
function renderTablePlayers(gid) {
  const g = S.games[gid];
  if (!g) return '';
  const _gseats = (g.seats || []);
  if (!_gseats.length) return '<div class="gp-empty">' + t('tablePlayersEmpty') + '</div>';
  return _gseats.map(function(pid){
    const nm = S.players[pid];
    if (!nm && !S._pendingNameRequests.has(pid)) {
      S._pendingNameRequests.add(pid);
      try { window.send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
    }
    const flag = _ccToFlag(S._playerCountries[pid], 'gp-flag');
    const label = nm ? esc(nm) : '#' + pid;
    const av = _avatarChipHtml(pid, label, 'gp-av');
    return '<span class="gp-player' + (nm ? '' : ' gp-pending') + '">' + av + '<span class="gp-name">' + label + '</span>' + flag + '</span>';
  }).join('');
}

// ── Panneau « Infos de partie » (parité officielle) : Type · SB/Capital ·
//    Joueurs dans la partie. Alimenté au clic sur une ligne. Les libellés
//    portent data-i18n → retraduits automatiquement par setLang. ──
function _renderInfoPlayerRows(gid) {
  var g = S.games[gid]; if (!g) return '';
  var _gseats = g.seats || [];
  if (!_gseats.length) return '<div class="lgi-pempty">' + t('tablePlayersEmpty') + '</div>';
  return _gseats.map(function(pid){
    var nm = S.players[pid];
    if (!nm && !S._pendingNameRequests.has(pid)) {
      S._pendingNameRequests.add(pid);
      try { window.send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
    }
    var flag  = _ccToFlag(S._playerCountries[pid], 'gp-flag');
    var label = nm ? esc(nm) : '#' + pid;
    var av    = _avatarChipHtml(pid, label, 'gp-av');
    return '<div class="lgi-prow lgi-click' + (nm ? '' : ' lgi-pending') + '" role="button" tabindex="0"'
         + ' onclick="window.openPlayerInfoPopup(' + pid + ')"'
         + ' onkeydown="if(event.key===\'Enter\')window.openPlayerInfoPopup(' + pid + ')">'
         + av + flag + '<span class="lgi-pname">' + label + '</span></div>';
  }).join('');
}
// pids présents à MA table pendant l'attente : seatData non 'gone' + moi si
// absent (le serveur n'écho pas toujours mon propre join, surtout créateur).
function _gamePresentPids() {
  var pids = Object.keys(S.seatData).map(Number).filter(function(pid){ return S.seatData[pid] && !S.seatData[pid].gone; });
  if (!S._amSpectator && S.myId && pids.indexOf(S.myId) === -1) pids.push(S.myId);
  return pids;
}
// Rendu des lignes joueurs depuis une liste de pids arbitraire (pour ma
// partie en attente, où games[gId].seats peut être vide/en retard).
function _renderInfoRowsFromPids(pids) {
  if (!pids || !pids.length) return '<div class="lgi-pempty">' + t('tablePlayersEmpty') + '</div>';
  return pids.map(function(pid){
    var nm = S.players[pid];
    if (!nm && pid === S.myId) nm = (document.getElementById('nick') ? document.getElementById('nick').value : '') || S.myName;
    if (!nm && !S._pendingNameRequests.has(pid)) {
      S._pendingNameRequests.add(pid);
      try { window.send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
    }
    var flag  = _ccToFlag(S._playerCountries[pid], 'gp-flag');
    var label = nm ? esc(nm) : '#' + pid;
    var av    = _avatarChipHtml(pid, label, 'gp-av');
    return '<div class="lgi-prow lgi-click' + (nm ? '' : ' lgi-pending') + '" role="button" tabindex="0"'
         + ' onclick="window.openPlayerInfoPopup(' + pid + ')"'
         + ' onkeydown="if(event.key===\'Enter\')window.openPlayerInfoPopup(' + pid + ')">'
         + av + flag + '<span class="lgi-pname">' + label + '</span></div>';
  }).join('');
}
function renderGameInfoPanel(gid) {
  var el = document.getElementById('lobby-gameinfo');
  if (!el) return;
  // Est-ce MA partie en cours d'attente (créée ou rejointe, pas démarrée) ?
  // On se base sur gId (posé dès JoinGameAck) et NON sur amInGame, qui n'est
  // mis à true qu'à GameStartInitial → sinon la barre d'options n'apparaît
  // jamais pendant l'attente.
  var _mine = (gid != null && S.gId !== 0 && gid === S.gId && !S._gameStarted);
  var g = (gid != null) ? S.games[gid] : null;
  // Créateur : games[gId] peut ne pas encore être peuplé (GameListNew arrive
  // juste après). On synthétise depuis _gameMeta + variables live.
  if (!g && _mine && S._gameMeta) {
    g = { name:S._gameMeta.name, type:S._gameMeta.type, maxPlayers:S._gameMeta.maxPlayers,
          priv:S._gameMeta.priv, timeout: S.gameTimeout || S._gameMeta.timeout || 0,
          startMoney: S.gameStartMoney || S._gameMeta.startMoney || 0,
          smallBlind: S.smallBlind || 0, seats: [], mode: 1 };
  }
  if (!g) {
    el.innerHTML = '<div class="g-chat-panel-header"><span class="lgi-htitle" data-i18n="gameInfoTitle">' + t('gameInfoTitle') + '</span></div>'
                 + '<div class="lgi-empty" data-i18n="gameInfoEmpty">' + t('gameInfoEmpty') + '</div>';
    try { _renderLobbyWaitActions(); } catch(e) {}
    return;
  }
  var typeKey = S._GTYPE_KEY[g.type];
  var typeLbl = GTYPE(g.type) || '';
  // Liste + décompte des joueurs : pour MA partie, on prend les pids réels
  // (seatData) au lieu de g.seats qui peut être vide sur une table fraîche.
  var _pids   = _mine ? _gamePresentPids() : (g.seats || []);
  var _count  = _pids.length;
  var _rows   = _mine ? _renderInfoRowsFromPids(_pids) : _renderInfoPlayerRows(gid);
  var _blUp = (g.raiseMode === 2) ? (g.raiseMins > 0 ? t('blindsUpMins', { n: g.raiseMins }) : '') : (g.raiseHands > 0 ? t('blindsUpHands', { n: g.raiseHands }) : '');
  // Ordre manuel des blinds (NetGameInfo champ 14) : afficher la structure
  // complète, comme le Game Info du client officiel.
  var _mbRow = '';
  if (g.manualBlinds && g.manualBlinds.length) {
    _mbRow = '<div class="lgi-row"><span data-i18n="infoBlindsManual">' + t('infoBlindsManual') + '</span> : '
           + esc(g.manualBlinds.map(function(v){ return _groupThousands(v); }).join(' \u2192 ')) + '</div>';
  }
  var _dly  = g.delay || 0;

  el.innerHTML =
    '<div class="g-chat-panel-header">'
      + '<span class="lgi-htitle" data-i18n="gameInfoTitle">' + t('gameInfoTitle') + '</span>'
      + '<button class="lgi-report" type="button" onclick="App.reportGameName(' + parseInt(gid) + ')" title="' + t('reportGameTitle') + '" data-i18n-title="reportGameTitle" aria-label="' + t('reportGameTitle') + '">🚩</button>'
    + '</div>'
    + '<div class="lgi-scroll">'
      + (_mine && g.name ? '<div class="lgi-row lgi-gname">' + esc(g.name) + '</div>' : '')
      + '<div class="lgi-row"><span class="lgi-ico">🎲</span> <span data-i18n="infoTypeLabel">' + t('infoTypeLabel') + '</span> : '
        + (typeKey ? '<span data-i18n="' + typeKey + '">' + esc(typeLbl) + '</span>' : esc(typeLbl)) + '</div>'
      + '<div class="lgi-row lgi-blinds">SB : ' + _groupThousands(g.smallBlind || 0)
        + ' | <span data-i18n="infoCapitalLabel">' + t('infoCapitalLabel') + '</span> : ' + _groupThousands(g.startMoney || 0) + '</div>'
      + (_blUp ? '<div class="lgi-row"><span data-i18n="infoBlindsUp">' + t('infoBlindsUp') + '</span> : ' + _blUp + '</div>' : '')
      + _mbRow
      + '<div class="lgi-row"><span data-i18n="gameTimeLabel">' + t('gameTimeLabel') + '</span> : ' + (g.timeout || 0) + 's' + (_dly ? '/' + _dly + 's' : '') + '</div>'
      + '<div class="lgi-ptitle"><span data-i18n="infoPlayersInGame">' + t('infoPlayersInGame') + '</span> (' + _count + ')</div>'
      + '<div class="lgi-players">' + _rows + '</div>'
    + '</div>';
  // Les options d'attente (case bots + Démarrer/Quitter) vivent désormais
  // dans la barre du bas (centre), à la place de « + Créer une partie » —
  // parité client officiel.
  try { _renderLobbyWaitActions(); } catch(e) {}
}
// Barre du bas (centre) : options d'attente selon le type d'utilisateur, à la
// place de « + Créer une partie » (parité GameWaitPage.qml officiel). Rendue
// tant que je suis dans une partie NON démarrée (gId posé au JoinGameAck).
//   Admin (hors ranking) : case « Compléter avec des bots » (si sièges libres)
//     + « Démarrer la partie » (actif à ≥ 2 joueurs, offline exempté)
//     + « Quitter la partie ».
//   Joueur simple / spectateur : « Quitter la partie » + hint d'attente.
function _renderLobbyWaitActions() {
  var bar = document.getElementById('lobby-wait-actions');
  if (!bar) return;
  var create = document.querySelector('.lobby-footbar .lfb-create');
  var mine = (S.gId !== 0 && !S._gameStarted);
  // Mode « ma partie en attente » : la liste passe à droite et mes infos +
  // le chat au centre (parité client officiel) — piloté par une classe CSS.
  var _sl = document.getElementById('s-lobby');
  var _wasWaiting = _sl ? _sl.classList.contains('lobby-waiting') : false;
  if (_sl) _sl.classList.toggle('lobby-waiting', mine);
  // Colonne « Inviter » de la liste Joueurs : ajoutée/retirée au changement
  // de mode -> re-render immédiat (sinon elle n'apparaît qu'au prochain event lobby).
  if (_sl && _wasWaiting !== mine) { try { if (typeof renderPlayersList === 'function') window.renderPlayersList(); } catch(e) {} }
  if (!mine) {
    bar.style.display = 'none'; bar.innerHTML = '';
    if (create) create.style.display = '';
    try { _updateFootJoin(); } catch(e){}
    return;
  }
  var g        = S.games[S.gId] || {};
  var maxP     = g.maxPlayers || (S._gameMeta && S._gameMeta.maxPlayers) || 10;
  var isRank   = (g.type || (S._gameMeta && S._gameMeta.type) || 1) === 4;
  var isHost   = !S._amSpectator && S.amGameAdmin && !isRank;
  var count    = _gamePresentPids().length;
  // Mode entraînement (offline) : la case « Fill up with computer players »
  // est cochée par défaut. Sans effet sur les autres modes, et un (dé)cochage
  // explicite de l'utilisateur (_wpFillBotsUserSet) est respecté.
  if (!window._wpFillBotsUserSet) window._wpFillBots = !!window._offlineMode;
  // Démarrage solo AVEC bots : dès que « Compléter avec des joueurs ordinateur »
  // est coché, l'hôte peut lancer même seul — le serveur remplit les sièges
  // vides de bots. Aucun filtrage par mode côté client : c'est déjà ce que fait
  // le bouton admin « Start with bots » de l'en-tête (sans garde), et c'est le
  // serveur qui accepte ou refuse le remplissage selon sa politique.
  var canStart = isHost && (count >= 2 || window._offlineMode || window._wpFillBots);
  var fillRow  = (isHost && count < maxP)
    ? '<label class="wp-fillbots"><input type="checkbox" id="wp-fillbots-cb"' + (window._wpFillBots ? ' checked' : '') + ' onchange="window._wpSetFillBots(this.checked)"><span>' + t('wpFillBots') + '</span></label>'
    : '';
  var leaveBtn = '<button class="wp-btn wp-btn-leave" onclick="App.confirmLeaveGame()">' + t('wpLeaveGame') + '</button>';
  var startBtn = isHost
    ? '<button class="wp-btn wp-btn-start" onclick="App.startFromWait()"' + (canStart ? '' : ' disabled') + ' title="' + t('wpStartHumansTip') + '">' + t('wpStartGame') + '</button>'
    : '';
  var hint = isHost ? '' : '<div class="lfb-waithint">' + t(S._amSpectator ? 'waitingHintSpectator' : 'waitingHintGuest') + '</div>';
  bar.innerHTML = fillRow + '<div class="wp-actions">' + leaveBtn + startBtn + '</div>' + hint;
  bar.style.display = 'flex';
  if (create) create.style.display = 'none';
  try { _updateFootJoin(); } catch(e){}
}
// Rafraîchit le panneau si une partie est sélectionnée (noms/joueurs qui arrivent).
// Affiche/masque le bouton « Rejoindre » du bas selon la partie sélectionnée :
// visible seulement pour une partie OUVERTE (mode 1) et si je ne suis pas déjà
// en partie (le footer montre alors les options d'attente). Parité LobbyPage QML.
// pokerth.net : un joueur invité (guest) ne peut rejoindre que les parties
// de type « Normal » (1) — le serveur refuse registered-only (2),
// invite-only (3) et ranking (4). On masque/bloque côté client pour
// éviter un rejet serveur cryptique.
function _guestJoinBlocked(g) {
  return S._currentLoginMode === 'guest' && !!g && g.type != null && g.type !== 1;
}

function _updateFootJoin() {
  var g = (S._selectedGame != null && typeof S.games !== 'undefined') ? S.games[S._selectedGame] : null;
  var bj = document.getElementById('lobby-foot-join');
  var bs = document.getElementById('lobby-foot-spec');
  // Déjà dans une partie (assis, en attente de démarrage OU démarrée) : on
  // ne propose ni Rejoindre ni Spectateur — seules Démarrer/Quitter restent.
  // gId!=0 couvre l'attente (amInGame est encore faux avant le démarrage).
  var busy = S.amInGame || (typeof S.gId !== 'undefined' && S.gId !== 0);
  var joinable  = !!(g && g.mode === 1) && !busy && !_guestJoinBlocked(g);   // partie ouverte (et autorisée pour un invité)
  var watchable = !!(g && g.mode === 2) && !busy;   // partie en cours
  if (bj) bj.style.display = joinable  ? '' : 'none';
  if (bs) bs.style.display = watchable ? '' : 'none';
}

function _refreshGameInfoPanel() {
  _updateFootJoin();
  if (S._selectedGame != null) {
    if (S.games[S._selectedGame]) renderGameInfoPanel(S._selectedGame);
    else { S._selectedGame = null; renderGameInfoPanel(null); }
  }
}


// ── LobbyStatsBar (parité QML, bible §16) : « X joueurs · Y en cours ·
// Z ouvertes », alimentée par la liste des tables + StatisticsMessage. ──
function updateLobbyStatsBar() {
  var el = document.getElementById('lsb-text');
  if (!el) return;
  var open = 0, running = 0;
  try {
    Object.values(S.games).forEach(function (g) {
      if (g.mode === 2) running++;
      else if (g.mode === 1) open++;
    });
  } catch (e) {}
  el.textContent = S._lobbyPlayerCount + ' ' + t('playersOnline') + ' \u00b7 '
    + running + ' ' + t('lsbRunning') + ' \u00b7 ' + open + ' ' + t('lsbOpen');
}

function renderGames() {
  // Utiliser entries() pour avoir l'id ET l'objet
  const entries = Object.entries(S.games);
  entries.sort(([,a],[,b]) => a.mode - b.mode);

  // Per-chip counts + active highlight (on the full set).
  _refreshFilterChips(entries);
  updateLobbyStatsBar();

  if (entries.length === 0) {
    document.getElementById('g-count').textContent = '0 table(s)';
    document.getElementById('g-list').innerHTML = S.loaded
      ? '<div class="empty">' + t('noTablesAvailable') + '</div>'
      : '<div class="empty">Chargement des tables<br><span class="ld"><span>●</span><span>●</span><span>●</span></span></div>';
    return;
  }

  // Apply the active filter.
  const shown = entries.filter(function(e){ return _tableMatches(e[1], S._tableFilter); });
  document.getElementById('g-count').textContent = shown.length + ' table(s)';

  if (shown.length === 0) {
    document.getElementById('g-list').innerHTML = '<div class="empty">' + t('noTablesForFilter') + '</div>';
    return;
  }

  document.getElementById('g-list').innerHTML = shown.map(([gid, g]) => {
    const label  = MODE_LABEL(g.mode);
    const type   = GTYPE(g.type) || '';
    const lock   = (g.priv || g.type === 3) ? '🔒 ' : '';
    const badgeCls = g.mode === 2 ? 'live' : (g.mode === 3 ? 'closed' : 'wait');
    var rawJoin = (typeof t === 'function' ? t('joinBtn') || '\u25B6 Join' : '\u25B6 Join');
    const joinLabel = (g.priv || g.type === 3)
      ? '🔒 ' + rawJoin.replace(/^\u25B6\s*/, '')
      : rawJoin.replace(/^\u25B6\s*/, '');
    // Pas de Rejoindre/Spectateur sur MA propre table (déjà assis) : gid === gId.
    const isMyTable = (typeof S.gId !== 'undefined' && S.gId !== 0 && String(gid) === String(S.gId));
    const watchBtn = (g.mode === 2 && !isMyTable)
      ? '<button class="btn-join btn-spectate" title="' + t('watchTitle') + '" onclick="event.stopPropagation();App.spectateGame(' + gid + ')">👁 ' + t('spectatorBtn') + '</button>'
      : '';
    const guestBlocked = _guestJoinBlocked(g);
    const joinBtn = (g.mode === 1 && !isMyTable && !guestBlocked)
      ? '<button class="btn-join" onclick="event.stopPropagation();App.joinGame(' + parseInt(gid) + ')">' + joinLabel + '</button>'
      : (g.mode === 1 && !isMyTable && guestBlocked)
        ? '<span class="gl-guestlock" title="' + t('guestJoinBlocked') + '">👤 ' + t('guestNeedAccount') + '</span>'
        : '';
    // Meta façon officiel : X/max · Temps : Xs/Ys · Publique/Privée · Classement.
    // (cash, blindes, hausse et points de sièges sont désormais dans le panneau Infos.)
    var metaBits = [];
    metaBits.push('<span>👥 ' + g.players + '/' + (g.maxPlayers || 10) + '</span>');
    metaBits.push('<span class="game-badge ' + badgeCls + '">' + label + '</span>');
    var _dly = g.delay || 0;
    metaBits.push('<span>' + t('gameTimeLabel') + ' : ' + (g.timeout || 0) + 's' + (_dly ? '/' + _dly + 's' : '') + '</span>');
    metaBits.push('<span>' + ((g.priv || g.type === 3) ? t('piPrivate') : t('piPublic')) + '</span>');
    if (g.type === 4) metaBits.push('<span>' + t('visRanked') + '</span>');
    var _sel = (String(gid) === String(S._selectedGame)) ? ' sel' : '';
    var _open = S._openTables.has(String(gid));
    var caret = '<button class="gcard-caret" onclick="event.stopPropagation();App.toggleTablePlayers(' + parseInt(gid) + ')" title="' + t('showPlayers') + '" aria-label="' + t('showPlayers') + '" aria-expanded="' + (_open?'true':'false') + '">' + (_open ? '\u25B4' : '\u25BE') + '</button>';
    return '<div class="game-row gcard' + _sel + (_open ? ' gc-open' : '') + '" onclick="App.selectGame(' + parseInt(gid) + ')">'
      + '<div class="gcard-main">'
      + '<div class="game-name">' + lock + esc(g.name) + '</div>'
      + '<div class="game-meta">' + metaBits.join('') + '</div>'
      + '</div>'
      + '<div class="gcard-btns">' + joinBtn + watchBtn + caret + '</div>'
      + '</div>'
      + (_open ? '<div class="game-players">' + renderTablePlayers(gid) + '</div>' : '');
  }).join('');
  _refreshGameInfoPanel();
  _updateFootJoin();
}

// Statut « En attente de joueurs… » centre dans le header du lobby :
// visible tant que je suis dans une table creee/rejointe non demarree.
// Le texte est i18n (hdrWaitingPlayers) ; les points sont animes en CSS.
function _updateLobbyWaitStatus() {
  var el = document.getElementById('lobby-wait-status');
  if (!el) return;
  // « En attente » = je suis dans une table rejointe/creee non demarree.
  // NB : amInGame ne passe a true qu'au debut de la 1re main (HandStart),
  // donc on s'appuie sur gId (table courante) + !_gameStarted uniquement.
  var waiting = !!(S.gId && !S._gameStarted);
  el.style.display = waiting ? '' : 'none';
  // Parite QML GameWaitPage : en spectateur, « Spectating — waiting for the
  // next hand » remplace « Waiting for players ». La cle data-i18n est
  // permutee pour que setLang retraduise correctement a chaud.
  var txt = document.getElementById('lws-txt');
  if (txt) {
    var key = S._amSpectator ? 'hdrSpectatingWait' : 'hdrWaitingPlayers';
    if (txt.getAttribute('data-i18n') !== key) {
      txt.setAttribute('data-i18n', key);
      try { txt.textContent = t(key); } catch (e) {}
    }
  }
}

export { MODE_LABEL, GTYPE, _tableMatches, _refreshFilterChips,
         renderTablePlayers, _renderInfoPlayerRows, _gamePresentPids,
         _renderInfoRowsFromPids, renderGameInfoPanel, _renderLobbyWaitActions,
         _guestJoinBlocked, _updateFootJoin, _refreshGameInfoPanel,
         updateLobbyStatsBar, renderGames, _gameTypeLabel, _updateGameHeader,
         _updateLobbyWaitStatus };

for (const [k, v] of Object.entries({ MODE_LABEL, GTYPE, _tableMatches,
  _refreshFilterChips, renderTablePlayers, _renderInfoPlayerRows,
  _gamePresentPids, _renderInfoRowsFromPids, renderGameInfoPanel,
  _renderLobbyWaitActions, _guestJoinBlocked, _updateFootJoin,
  _refreshGameInfoPanel, updateLobbyStatsBar, renderGames, _gameTypeLabel,
  _updateGameHeader, _updateLobbyWaitStatus })) window[k] = v;
