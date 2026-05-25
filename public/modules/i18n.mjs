// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/i18n.mjs
//
// Internationalisation module — bilingual EN/FR string catalogue plus the
// helpers (t, setLang, toggleLang, getLang) that read and update it.
//
// History: extracted from public/pokerth.js as the first step of the
// Phase 2 modular refactor. The legacy code in pokerth.js still calls
// `t(...)`, `setLang(...)`, `toggleLang()` and reads `_lang` directly,
// so this module re-attaches those names on `window` for backward
// compatibility. Once every caller has been migrated to ES-module
// imports, the global aliases at the bottom can be dropped.
// ─────────────────────────────────────────────────────────────────────────

const LANG = {
  en: {
    connect:'Connect', disconnect:'✕ Disconnect', connecting:'Connecting…',
    nickname:'Nickname', password:'Password', useTLS:'Use TLS',
    lan:'LAN (free nickname)', privateGuest:'Private Server — Internet Guest ✓',
    guest:'pokerth.net — Internet Guest', auth:'pokerth.net — Registered Account',
    loginMode:'Login Mode', server:'PokerTH Server', proxy:'WebSocket Proxy', port:'Port',
    joinOrCreate:'⚡ Join or Create', configure:'⚙', createTable:'＋ Create table',
    tableName:'Table name', maxPlayers:'Max players', smallBlind:'Small blind',
    stack:'Stack', timeout:'Timeout (s)', fillBots:'Fill with bots (optional)',
    minHumans:'Min humans before bots:', availTables:'Available tables',
    loadingTables:'Loading tables…', noTables:'No tables available',
    lobbyChat:'Lobby chat', joinBtn:'▶ Join', waitStart:'Waiting to start…',
    handLabel:'H#', preflop:'Pre-flop', flop:'Flop', turn:'Turn', river:'River',
    fold:'Fold', check:'Check', call:'Call', raise:'Raise', allin:'All-In',
    pot:'Pot:', journal:'📋', chat:'💬', sound:'🔊', mute:'🔇',
    thinking:'is thinking…', myCards:'My cards:', gameStart:'Start',
    bet:'Bet', wins:'wins', handOf:'Hand #',
    handsTitle:'♠ Poker Hand Rankings ♥',
    h1n:'Royal Flush', h1d:'A K Q J 10 of the same suit — the absolute best hand',
    h2n:'Straight Flush', h2d:'5 consecutive cards of the same suit',
    h3n:'Four of a Kind', h3d:'4 cards of the same rank',
    h4n:'Full House', h4d:'Three of a kind + a pair',
    h5n:'Flush', h5d:'5 cards of the same suit (not consecutive)',
    h6n:'Straight', h6d:'5 consecutive cards of different suits',
    h7n:'Three of a Kind', h7d:'3 cards of the same rank',
    h8n:'Two Pair', h8d:'Two pairs of matching cards',
    h9n:'One Pair', h9d:'Two cards of the same rank',
    h10n:'High Card', h10d:'No combination — the highest card plays',
    handsClose:'Close ✕', watchBtn:'Watch',
    youWon:'You won!', handWinner:'Hand winner',
    totalPot:'Total pot', players:'Players', blinds:'Blinds',
    commCards:'Community cards', results:'Results', continue:'Continue ▶',
    closeTable:'🔒 Close', startBots:'▶ Bots', leave:'✕',
    youWon:'You won!', handWinner:'Hand winner', communityCards:'Community cards',
    results:'Results', continueBtn:'Continue ▶', yourStack:'Your stack:',
    totalPot:'Total pot', players:'Players', blinds:'Blinds', hand:'Hand',
    nextHand:'Next hand…', actionSent:'Action sent…', gameOver:'Game over!',
    connected:'Connected as guest', connectedAuth:'Connected as',
    joinedTable:'Joined table', leftTable:'left the table', joinedGame:'joined the table',
    waitingPlayers:'Waiting for players…', startingGame:'Game starting…',
    tableClosed:'Table closed.', botsStarting:'▶ Starting with bots…',
    humansWaiting:'humans waiting…', humansSendBots:'humans — sending bots…',
    chatRejected:'Chat rejected', chatRejectedLAN:'Chat rejected — LAN mode requires an account.',
    errorVersion:'Incompatible version', errorFull:'Server full', errorAuth:'Auth failed',
    errorBlocked:'IP temporarily blocked', errorName:'Nickname taken',
    retrying:'Nickname taken — retrying with', reconnecting:'Disconnected — reconnecting in 3s…',
    disconnected:'Disconnected. Please reconnect.',
    enterNick:'Please enter a nickname.', nickTooShort:'Nickname too short (min 3 chars).',
    searching:'⚡ Searching…', joining:'Joining', creating:'Creating',
    noTableCreating:'⚡ No table — creating', tableFound:'⚡ Table found — joining',
    raiseEvery:'Raise every', raiseN:'N', blindRaise:'Blind raise',
    blindDouble:'Double', blindToValue:'To value', blindKeepLast:'Keep last',
    targetBlind:'Target blind', speed:'Speed (1-10)', delayHands:'Delay (hands)',
    gameType:'Game type', gameNormal:'Normal', gameRegistered:'Registered only', gameInvite:'Invite only',
    'nHands':'N hands',
    'nMinutes':'N minutes',
    errNotAllowed:'Not allowed to join', errNameUsed:'Name already in use', errInProgress:'Game already started',
    errWrongPassword:'Wrong password', errPlayerLocked:'Player locked',
    errNotInvited:'Invite-only — you need an invitation from the host',
    errGuestsNotAllowed:'Registered accounts only — guests cannot join',
    errInvalidGame:'Cannot join this game',
    moreOptions:'More options', lessOptions:'Less options',
    addPassword:'Add a password (optional)', tablePassword:'Password:',
    rememberMe:'Remember nickname (password never stored)',
    tlsLabel:'TLS — required for pokerth.net, uncheck for LAN',
    privateGuestStatus:'✅ Chat & reactions available on private server.',
    enterNickFree:'Nickname (free, min 3 chars)',
    enterNickGuest:'Guest nickname (Guest + 5 digits)',
    enterAccount:'pokerth.net account name',
    enterCredentials:'Enter your pokerth.net credentials.',
    chatAvailPrivate:'✅ Chat & reactions available on private server.',
    connProxy:'Connecting to proxy...',
    connDirect:'Direct connection to pokerth.net...',
    fillFields:'Please fill all fields.',
    enterPassword:'Please enter your password.',
    lanModeNote:'LAN mode: in-game chat is limited.',
    urlProxy:'WebSocket Proxy URL', pokerServer:'PokerTH Server', port:'Port',
    loginMode:'Login Mode', nickLabel:'Nickname', passLabel:'Password',
      waitingStart:'Waiting to start',
    waitingPlayerCount:'Players:',
    waitingEnough:'Ready to play — admin can start',
    waitingNeedMore:'{n} more player(s) needed to start',
    waitingHintAdmin:'You\'re the admin — start when ready or fill with bots',
    waitingHintGuest:'The admin will start the game when enough players are ready',
    waitingYou:'You',
    endGameTitleEnd:'Tournament ended',
    endGameTitleWin:'You won the tournament!',
    endGameWinner:'Winner',
    endGameYouWon:'You won!',
    endGameYourStats:'Your session',
    endGameHandsPlayed:'Hands played',
    endGameHandsWon:'Hands won',
    endGameFinalStack:'Final stack',
    endGameNetGain:'Net gain/loss',
    endGameBestWin:'Best win',
    endGameWorstLoss:'Worst loss',
    endGameClose:'Close',
    endGameBackToLobby:'Back to lobby',
    gameRanking:'Ranking',
    allowSpectators:'Spectators',
    allowOn:'Allowed',
    allowOff:'Blocked',
    waitingReadyForBots:'Ready — {n} human(s) present, you can fill with bots',
    waitingStartNow:'Start now',
    autoCheckLabel:'Auto-check next turn',
    autoFoldLabel:'Auto-fold next turn',
    autoChecked:'Auto-checked',
    autoFolded:'Auto-folded',
    initializing:'Initialising…',
    preparingConnection:'Preparing new connection ({n}s)…',
    closingPrevious:'Closing previous connection…',
    spectatorBanner:'Spectator mode — you are watching',
    spectatorActionMsg:'You are watching as a spectator. Players are deciding…',
    leaveDialogTitle:'Leave the game?',
    leaveDialogBody:'You will lose your seat and return to the lobby.',
    leaveQuit:'Quit',
    leaveCancel:'Cancel',
},
  fr: {
    connect:'Se connecter', disconnect:'✕ Déconnecter', connecting:'Connexion en cours…',
    nickname:'Pseudo', password:'Mot de passe', useTLS:'Utiliser TLS',
    lan:'LAN (pseudo libre)', privateGuest:'Serveur privé — Invité Internet ✓',
    guest:'pokerth.net — Invité', auth:'pokerth.net — Compte enregistré',
    loginMode:'Mode de connexion', server:'Serveur PokerTH', proxy:'Proxy WebSocket', port:'Port',
    joinOrCreate:'⚡ Rejoindre ou Créer', configure:'⚙', createTable:'＋ Créer cette table',
    tableName:'Nom de la table', maxPlayers:'Joueurs max', smallBlind:'Petite blind',
    stack:'Stack', timeout:'Timeout (s)', fillBots:'Compléter avec des bots (optionnel)',
    minHumans:'Humains min avant bots :', availTables:'Tables disponibles',
    loadingTables:'Chargement des tables…', noTables:'Aucune table disponible',
    lobbyChat:'Chat du lobby', joinBtn:'▶ Rejoindre', waitStart:'En attente du démarrage…',
    handLabel:'M#', preflop:'Pré-flop', flop:'Flop', turn:'Tournant', river:'Rivière',
    fold:'Fold', check:'Check', call:'Call', raise:'Relance', allin:'All-In',
    pot:'Pot :', journal:'📋', chat:'💬', sound:'🔊', mute:'🔇',
    thinking:'réfléchit…', myCards:'Mes cartes :', gameStart:'Début',
    bet:'Mise', wins:'gagne', handOf:'Main #',
    handsTitle:'♠ Combinaisons du Poker ♥',
    h1n:'Quinte Flush Royale', h1d:'A K Q J 10 de la même couleur — la main absolue',
    h2n:'Quinte Flush', h2d:'5 cartes consécutives de la même couleur',
    h3n:'Carré', h3d:'4 cartes de même valeur',
    h4n:'Full House', h4d:'Un brelan + une paire',
    h5n:'Couleur (Flush)', h5d:'5 cartes de la même couleur (non consécutives)',
    h6n:'Suite (Straight)', h6d:'5 cartes consécutives de couleurs différentes',
    h7n:'Brelan', h7d:'3 cartes de même valeur',
    h8n:'Deux Paires', h8d:'Deux paires de cartes de même valeur',
    h9n:'Paire', h9d:'Deux cartes de même valeur',
    h10n:'Carte Haute', h10d:'Aucune combinaison — la carte la plus haute joue',
    handsClose:'Fermer ✕', watchBtn:'Regarder',
    youWon:'Vous avez gagné !', handWinner:'Gagnant de la main',
    totalPot:'Pot total', players:'Joueurs', blinds:'Blinds',
    commCards:'Cartes communes', results:'Résultats', continue:'Continuer ▶',
    closeTable:'🔒 Fermer', startBots:'▶ Bots', leave:'✕',
    youWon:'Vous avez gagné !', handWinner:'Gagnant de la main', communityCards:'Cartes communes',
    results:'Résultats', continueBtn:'Continuer ▶', yourStack:'Votre stack :',
    totalPot:'Pot total', players:'Joueurs', blinds:'Blinds', hand:'Main',
    nextHand:'Prochaine main…', actionSent:'Action envoyée…', gameOver:'Partie terminée !',
    connected:"Connecté en tant qu'invité", connectedAuth:"Connecté en tant que",
    joinedTable:'Rejoint la table', leftTable:'quitte la table', joinedGame:'rejoint la table',
    waitingPlayers:'En attente des joueurs…', startingGame:'Partie en cours de démarrage…',
    tableClosed:'Table fermée.', botsStarting:'▶ Démarrage avec bots…',
    humansWaiting:'humains en attente…', humansSendBots:'humains — envoi des bots…',
    chatRejected:'Chat refusé', chatRejectedLAN:'Chat refusé — en mode LAN nécessite un compte.',
    errorVersion:'Version incompatible', errorFull:'Serveur plein', errorAuth:'Auth échouée',
    errorBlocked:'IP temporairement bloquée', errorName:'Pseudo déjà pris',
    retrying:'Pseudo déjà pris — nouvel essai avec', reconnecting:'Déconnecté — reconnexion dans 3s…',
    disconnected:'Déconnecté. Reconnectez-vous.',
    enterNick:'Entrez un pseudo.', nickTooShort:'Pseudo trop court (min 3 chars).',
    searching:'⚡ Recherche…', joining:'Tentative de rejoindre', creating:'Création',
    noTableCreating:'⚡ Aucune table — création de', tableFound:'⚡ Table trouvée — rejoindre',
    raiseEvery:'Augment. toutes les', raiseN:'N', blindRaise:'Mode augment.',
    blindDouble:'Doubler', blindToValue:'Vers valeur', blindKeepLast:'Garder dernière',
    targetBlind:'Blind cible', speed:'Vitesse (1-10)', delayHands:'Délai (mains)',
    gameType:'Type de partie', gameNormal:'Normale', gameRegistered:'Inscrits seulement', gameInvite:'Sur invitation',
    'nHands':'N main(s)',
    'nMinutes':'N minute(s)',
    errNotAllowed:'Rejoindre non autorisé', errNameUsed:'Nom déjà utilisé', errInProgress:'Partie déjà démarrée',
    errWrongPassword:'Mot de passe incorrect', errPlayerLocked:'Joueur bloqué',
    errNotInvited:'Table sur invitation — vous avez besoin d\'une invitation de l\'hôte',
    errGuestsNotAllowed:'Comptes enregistrés uniquement — les invités ne peuvent pas rejoindre',
    errInvalidGame:'Impossible de rejoindre cette partie',
    moreOptions:'Plus d\'options', lessOptions:'Moins d\'options',
    addPassword:'Ajouter un mot de passe (optionnel)', tablePassword:'Mot de passe :',
    rememberMe:'Mémoriser le pseudo (mot de passe non mémorisé)',
    tlsLabel:'TLS — requis pour pokerth.net, décocher pour LAN',
    privateGuestStatus:'✅ Chat et réactions disponibles sur serveur privé.',
    enterNickFree:'Pseudo (libre, min 3 chars)',
    enterNickGuest:'Pseudo invité (Guest + 5 chiffres)',
    enterAccount:'Nom du compte pokerth.net',
    enterCredentials:'Entrez vos identifiants pokerth.net.',
    chatAvailPrivate:'✅ Chat et réactions disponibles sur serveur privé.',
    connProxy:'Connexion au proxy...',
    connDirect:'Connexion directe à pokerth.net...',
    fillFields:'Remplissez tous les champs.',
    enterPassword:'Entrez votre mot de passe.',
    lanModeNote:'Mode LAN : chat en jeu limité.',
    urlProxy:'URL du Proxy WebSocket', pokerServer:'Serveur PokerTH', port:'Port',
    loginMode:'Mode de connexion', nickLabel:'Pseudo', passLabel:'Mot de passe',
      waitingStart:'En attente du démarrage',
    waitingPlayerCount:'Joueurs :',
    waitingEnough:'Prêt à jouer — l\'admin peut démarrer',
    waitingNeedMore:'Il manque {n} joueur(s) pour démarrer',
    waitingHintAdmin:'Vous êtes l\'admin — lancez la partie ou remplissez avec des bots',
    waitingHintGuest:'L\'admin lancera la partie quand il y aura assez de joueurs',
    waitingYou:'Vous',
    endGameTitleEnd:'Partie terminée',
    endGameTitleWin:'Vous avez gagné !',
    endGameWinner:'Vainqueur',
    endGameYouWon:'Vous avez gagné !',
    endGameYourStats:'Votre session',
    endGameHandsPlayed:'Mains jouées',
    endGameHandsWon:'Mains gagnées',
    endGameFinalStack:'Stack final',
    endGameNetGain:'Solde net',
    endGameBestWin:'Meilleur gain',
    endGameWorstLoss:'Pire perte',
    endGameClose:'Fermer',
    endGameBackToLobby:'Retour au lobby',
    gameRanking:'Classée',
    allowSpectators:'Spectateurs',
    allowOn:'Autorisés',
    allowOff:'Interdits',
    waitingReadyForBots:'Prêt — {n} humain(s) présent(s), vous pouvez remplir avec des bots',
    waitingStartNow:'Lancer maintenant',
    autoCheckLabel:'Auto-check au prochain tour',
    autoFoldLabel:'Auto-fold au prochain tour',
    autoChecked:'Auto-check effectué',
    autoFolded:'Auto-fold effectué',
    initializing:'Initialisation…',
    preparingConnection:'Préparation de la nouvelle connexion ({n}s)…',
    closingPrevious:'Fermeture de la connexion précédente…',
    spectatorBanner:'Mode spectateur — vous regardez la partie',
    spectatorActionMsg:'Vous regardez en spectateur. Les joueurs sont en train de décider…',
    leaveDialogTitle:'Quitter la partie\u00a0?',
    leaveDialogBody:'Vous perdrez votre place et reviendrez au lobby.',
    leaveQuit:'Quitter',
    leaveCancel:'Annuler',
}
};


let _lang = (function(){
    try { return localStorage.getItem('pth_lang') || 'en'; }
    catch(e) { return 'en'; }
})();

function t(k) {
    return (LANG[_lang] || LANG.en)[k] || (LANG.en[k]) || k;
}

function setLang(l) {
  _lang = l;
  try { localStorage.setItem('pth_lang', l); } catch(e) {}
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-i18n');
    el.textContent = t(k);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  // Update select options
  var lm = document.getElementById('login-mode');
  if (lm) {
    lm.options[0].text = t('lan');
    lm.options[1].text = t('privateGuest');
    if (lm.options[2]) lm.options[2].text = t('guest');
    if (lm.options[3]) lm.options[3].text = t('auth');
  }
  // Update create form selects
  var rm = document.getElementById('cf-raise-mode');
  if (rm && rm.options.length >= 2) { rm.options[0].text = t('raiseEvery')+' N '+t('raiseN')+' main(s)'; rm.options[1].text = t('raiseEvery')+' N min'; }
  var er = document.getElementById('cf-end-raise');
  if (er && er.options.length >= 3) { er.options[0].text = t('blindDouble'); er.options[1].text = t('blindToValue'); er.options[2].text = t('blindKeepLast'); }
  var gt = document.getElementById('cf-game-type');
  if (gt && gt.options.length >= 3) { gt.options[0].text = t('gameNormal'); gt.options[1].text = t('gameRegistered'); gt.options[2].text = t('gameInvite'); }
  // Re-render aide si elle est ouverte
  var ho = document.getElementById('hands-overlay');
  if (ho && ho.style.display !== 'none') renderHandsHelp();
  // Refresh game screen dynamic elements if in game
  var gRound = document.getElementById('g-round');
  if (gRound && typeof gameState !== 'undefined') {
    var rMap = [t('preflop'),t('flop'),t('turn'),t('river'),t('preflop')+' (SB)',t('preflop')+' (BB)'];
    gRound.textContent = rMap[gameState] || gRound.textContent;
  }
  // Sync bouton toggle unique sur tous les écrans
  var flag = _lang === 'fr' ? '🇫🇷' : '🇬🇧';
  ['lang-toggle-connect','lang-toggle-lobby','lang-toggle-game','lang-toggle-game-mob'].forEach(function(id){
    var b = document.getElementById(id);
    if (b) b.textContent = flag;
  });
  // Update more/less options label
  var ml = document.getElementById('cf-more-label');
  if (ml) { var cfOpen = document.getElementById('cf-more-opts'); ml.textContent = (cfOpen && cfOpen.style.display !== 'none') ? t('lessOptions') : t('moreOptions'); }
  // Update lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.classList.toggle('active', b.dataset.lang === _lang);
  });
}


function toggleLang() {
    setLang(_lang === 'en' ? 'fr' : 'en');
}

function getLang() {
    return _lang;
}

// ─── Modern ES module exports ───────────────────────────────────────────
export { LANG, t, setLang, toggleLang, getLang };

// ─── Legacy global compatibility ────────────────────────────────────────
// pokerth.js (the un-refactored majority) still references these as bare
// names in the global scope. Until every reference is migrated to an
// `import`, mirror them on window so the existing code keeps working
// unchanged.
//   - `_lang` is special: it is read AND written from pokerth.js, so we
//     expose it as a getter/setter property that reflects the internal
//     module state in both directions.
window.LANG = LANG;
window.t = t;
window.setLang = setLang;
window.toggleLang = toggleLang;
Object.defineProperty(window, '_lang', {
    configurable: true,
    get() { return _lang; },
    set(v) { _lang = v; },
});

// Also expose a single namespaced object for the migration-aware code
// that wants a clean entry point.
window.I18N = { LANG, t, setLang, toggleLang, getLang };
