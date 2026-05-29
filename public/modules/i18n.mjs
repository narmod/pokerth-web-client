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
    quickGameBtn:'⚡ Join / Quick Game', configure:'⚙', createTable:'＋ Create table',
    tableName:'Table name', tableNameDefault:"{name}'s table", maxPlayers:'Max players', smallBlind:'Small blind',
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
    h1n:'Royal Flush', h1d:'A K Q J 10, all the same suit||the unbeatable hand!',
    h2n:'Straight Flush', h2d:'5 cards in a row, same suit',
    h3n:'Four of a Kind', h3d:'4 matching cards||here 4 Kings',
    h4n:'Full House', h4d:'3 matching + 2 matching||here 3 Queens + 2 Jacks',
    h5n:'Flush', h5d:'5 cards of the same suit||(no need to be in order)',
    h6n:'Straight', h6d:'5 cards in a row||mixed suits',
    h7n:'Three of a Kind', h7d:'3 matching cards||here three 7s',
    h8n:'Two Pair', h8d:'Two pairs at once||here two Jacks + two 5s',
    h9n:'One Pair', h9d:'2 matching cards||here two Aces',
    h10n:'High Card', h10d:'No combination||highest card plays (here the Ace)',
    handsLegOk:'count', handsLegNo:'ignored', handsLegForce:'strong → weak',
    handsClose:'Close ✕', watchBtn:'Watch', watchTitle:'Watch without playing',
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
    chooseAvatar:'Choose an avatar',
    modeUnauth:'Private server — Internet Guest \u2713',
    modeGuest:'pokerth.net — Guest',
    modeAuth:'pokerth.net — Registered account',
    nickPlaceholder:'YourName',
    quitTooltip:'Quit',
    reconnectInProgress:'Reconnecting\u2026',
    connectingPlayers:'Connecting {type} v{ver} \u2014 {n} player(s)\u2026',
    connectedAsGuest:'Connected as guest \u201c{name}\u201d (ID {id})',
    errBadCreds:'\u26a0 Invalid pokerth.net credentials (username or password).',
    errNickTakenRetry:'Nickname already taken \u2014 retrying with \u201c{name}\u201d\u2026',
    errGeneric:'Error: {code}',
    joinedTableWaiting:'Joined table {gid}{admin} \u2014 waiting for start\u2026',
    playerLeftTable:'{name} left the table',
    youWereRemoved:'You were removed from the game.',
    gameStarting:'Game is starting\u2026',
    gameStartedWaitHand:'Game started! Waiting for the first hand\u2026',
    modeWaiting:'Waiting',
    modeInProgress:'In progress',
    modeClosed:'Closed',
    noTablesAvailable:'No tables available right now.',
    createTableHdr:'Create a table', gameStyle:'Game style',
    presetCalmName:'Relaxed', presetCalmDesc:'long games',
    presetNormalName:'Normal', presetNormalDesc:'balanced',
    presetFastName:'Fast', presetFastDesc:'fast-paced!',
    proxyConnectedWait:'Proxy connected \u2014 waiting for PokerTH server\u2026',
    errConnLost:'Connection lost. You can reconnect in a few seconds.',
    autoTableFound:'\u26a1 Table found \u2014 joining #{n}',
    autoNoTable:'\u26a1 No tables \u2014 creating one\u2026',
    quickCreateTitle:'Create a new table',
    quickCreateBody:'No tables found. How many players?',
    quickCreateLabel:'Players:',
    quickCreateBtn:'Create',
    logPanelTitle:'Log',
    disconnectDialogTitle:'Disconnect?',
    disconnectDialogBody:'You will be returned to the login screen.',
    disconnectQuit:'Disconnect',
    disconnectTooltip:'Disconnect',
    playersOnline:'player(s)',
    playersOnlineTitle:'Players online',
    playersSearchPlaceholder:'Search\u2026',
    tableCount:'table(s)',
},
  fr: {
    connect:'Se connecter', disconnect:'✕ Déconnecter', connecting:'Connexion en cours…',
    nickname:'Pseudo', password:'Mot de passe', useTLS:'Utiliser TLS',
    lan:'LAN (pseudo libre)', privateGuest:'Serveur privé — Invité Internet ✓',
    guest:'pokerth.net — Invité', auth:'pokerth.net — Compte enregistré',
    loginMode:'Mode de connexion', server:'Serveur PokerTH', proxy:'Proxy WebSocket', port:'Port',
    quickGameBtn:'⚡ Rejoindre partie / Partie rapide', configure:'⚙', createTable:'＋ Créer cette table',
    tableName:'Nom de la table', tableNameDefault:'Table de {name}', maxPlayers:'Joueurs max', smallBlind:'Petite blind',
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
    h1n:'Quinte Flush Royale', h1d:'A K Q J 10, tous de la même couleur||la main imbattable !',
    h2n:'Quinte Flush', h2d:'5 qui se suivent, même couleur',
    h3n:'Carré', h3d:'4 cartes pareilles||ici 4 Rois',
    h4n:'Full House', h4d:'3 pareilles + 2 pareilles||ici 3 Dames + 2 Valets',
    h5n:'Couleur (Flush)', h5d:'5 cartes de la même couleur||(pas besoin de se suivre)',
    h6n:'Suite (Straight)', h6d:'5 qui se suivent||couleurs mélangées',
    h7n:'Brelan', h7d:'3 cartes pareilles||ici 3 Sept',
    h8n:'Deux Paires', h8d:'2 paires en même temps||ici 2 Valets + 2 Cinq',
    h9n:'Paire', h9d:'2 cartes pareilles||ici 2 As',
    h10n:'Carte Haute', h10d:'Aucune combinaison||la plus haute joue (ici l\'As)',
    handsLegOk:'comptent', handsLegNo:'ignorées', handsLegForce:'fort → faible',
    handsClose:'Fermer ✕', watchBtn:'Regarder', watchTitle:'Regarder sans jouer',
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
    chooseAvatar:'Choisir un avatar',
    modeUnauth:'Serveur priv\u00e9 \u2014 Invit\u00e9 Internet \u2713',
    modeGuest:'pokerth.net \u2014 Invit\u00e9',
    modeAuth:'pokerth.net \u2014 Compte enregistr\u00e9',
    nickPlaceholder:'VotrePr\u00e9nom',
    quitTooltip:'Quitter',
    reconnectInProgress:'Reconnexion en cours\u2026',
    connectingPlayers:'Connexion {type} v{ver} \u2014 {n} joueur(s)\u2026',
    connectedAsGuest:'Connect\u00e9 en tant qu\u2019invit\u00e9 \u00ab\u202f{name}\u202f\u00bb (ID {id})',
    errBadCreds:'\u26a0 Identifiants pokerth.net invalides (utilisateur ou mot de passe).',
    errNickTakenRetry:'Pseudo d\u00e9j\u00e0 pris \u2014 nouvel essai avec \u00ab\u202f{name}\u202f\u00bb\u2026',
    errGeneric:'Erreur\u00a0: {code}',
    joinedTableWaiting:'Rejoint la table {gid}{admin} \u2014 attente du d\u00e9marrage\u2026',
    playerLeftTable:'{name} quitte la table',
    youWereRemoved:'Vous avez \u00e9t\u00e9 retir\u00e9 de la partie.',
    gameStarting:'Partie en cours de d\u00e9marrage\u2026',
    gameStartedWaitHand:'Partie d\u00e9marr\u00e9e\u00a0! En attente de la premi\u00e8re main\u2026',
    modeWaiting:'En attente',
    modeInProgress:'En cours',
    modeClosed:'Ferm\u00e9e',
    noTablesAvailable:'Aucune table disponible actuellement.',
    createTableHdr:'Créer une table', gameStyle:'Style de partie',
    presetCalmName:'Tranquille', presetCalmDesc:'parties longues',
    presetNormalName:'Normal', presetNormalDesc:'équilibré',
    presetFastName:'Rapide', presetFastDesc:'ça va vite !',
    proxyConnectedWait:'Proxy connect\u00e9 \u2014 attente du serveur PokerTH\u2026',
    errConnLost:'Connexion perdue. Vous pouvez vous reconnecter dans quelques secondes.',
    autoTableFound:'\u26a1 Table trouv\u00e9e \u2014 rejoindre la #{n}',
    autoNoTable:'\u26a1 Aucune table \u2014 cr\u00e9ation en cours\u2026',
    quickCreateTitle:'Cr\u00e9er une nouvelle table',
    quickCreateBody:'Aucune table trouv\u00e9e. Combien de joueurs\u00a0?',
    quickCreateLabel:'Joueurs\u00a0:',
    quickCreateBtn:'Cr\u00e9er',
    logPanelTitle:'Journal',
    disconnectDialogTitle:'Se d\u00e9connecter\u00a0?',
    disconnectDialogBody:'Vous reviendrez \u00e0 l\u2019\u00e9cran de connexion.',
    disconnectQuit:'Se d\u00e9connecter',
    disconnectTooltip:'Se d\u00e9connecter',
    playersOnline:'joueur(s)',
    playersOnlineTitle:'Joueurs en ligne',
    playersSearchPlaceholder:'Rechercher\u2026',
    tableCount:'table(s)',
}
};


// ── Flag SVGs ─────────────────────────────────────────────────────────
// Tiny inline SVGs used by the language toggle buttons. Rendering through
// SVG avoids the Windows-Segoe-UI-Emoji limitation, which doesn't include
// regional-indicator pairs (the 🇬🇧 / 🇫🇷 emoji render as plain "GB" / "FR"
// letters on Windows 10/11 because the system font has no glyphs for them).
const FLAG_GB_SVG = '<svg class="lang-flag" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-label="English"><clipPath id="ujt"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath><path d="M0,0v30h60V0z" fill="#012169"/><path d="M0,0 60,30M60,0 0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 60,30M60,0 0,30" clip-path="url(#ujt)" stroke="#C8102E" stroke-width="4"/><path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/><path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/></svg>';
const FLAG_FR_SVG = '<svg class="lang-flag" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-label="Français"><rect width="20" height="30" fill="#0055A4"/><rect x="20" width="20" height="30" fill="#fff"/><rect x="40" width="20" height="30" fill="#EF4135"/></svg>';

let _lang = (function(){
    try {
        // 1. The user has manually picked a language before — respect that.
        var saved = localStorage.getItem('pth_lang');
        if (saved === 'en' || saved === 'fr') return saved;
        // 2. First visit: auto-detect from the browser locale. Any French
        //    locale (fr-FR / fr-BE / fr-CA / fr-CH / fr) → French UI.
        //    Everything else → English (the project's default reach).
        //    This avoids serving English UI to a French speaker (which
        //    triggers the browser's "Translate this page?" banner) while
        //    still defaulting to English for the international audience.
        var bl = (navigator.language || '').toLowerCase();
        return bl.startsWith('fr') ? 'fr' : 'en';
    } catch (e) {
        return 'en';
    }
})();

function t(k) {
    return (LANG[_lang] || LANG.en)[k] || (LANG.en[k]) || k;
}

function setLang(l) {
  _lang = l;
  try { localStorage.setItem('pth_lang', l); } catch(e) {}
  // Keep <html lang> in sync with the active UI language. The browser
  // uses this attribute to decide whether to offer a translation banner;
  // matching the user's locale here makes the banner disappear.
  try { document.documentElement.lang = l; } catch(e) {}
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
  // Same treatment for placeholder attributes — used by <input> elements
  // like the nickname field. Added alongside data-i18n-title for symmetry.
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
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
  // Sync language-toggle buttons across all screens.
  // We use an SVG flag rather than a regional-indicator emoji because
  // Windows lacks glyphs for those pairs (renders as plain "GB"/"FR").
  var flagSvg = _lang === 'fr' ? FLAG_FR_SVG : FLAG_GB_SVG;
  var langLabel = _lang === 'fr' ? 'Langue' : 'Language';
  ['lang-toggle-connect','lang-toggle-lobby','lang-toggle-game'].forEach(function(id){
    var b = document.getElementById(id);
    if (b) b.innerHTML = flagSvg;
  });
  // Mobile overflow-menu entries (one in the game header, one in the
  // lobby header) keep a text label alongside the flag.
  ['lang-toggle-game-mob', 'lang-toggle-lobby-mob'].forEach(function(id){
    var bMob = document.getElementById(id);
    if (bMob) bMob.innerHTML = flagSvg + ' ' + langLabel;
  });
  // Update more/less options label
  var ml = document.getElementById('cf-more-label');
  if (ml) { var cfOpen = document.getElementById('cf-more-opts'); ml.textContent = (cfOpen && cfOpen.style.display !== 'none') ? t('lessOptions') : t('moreOptions'); }
  // Re-render the lobby game list so badges/labels follow the language
  try { if (typeof window.renderGames === 'function') window.renderGames(); } catch(e) {}
  // Re-localise le nom de table par défaut s'il n'a pas été personnalisé
  try { if (typeof window._localizeCreateNameField === 'function') window._localizeCreateNameField(); } catch(e) {}
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

// ─── Auto-init: apply the current language on first DOM-ready ───────────
// Without this, the language-toggle buttons stay empty until the user
// clicks them (because setLang() is the function that injects the SVG
// flag). Run it as soon as the DOM is parsed.
function _initI18n() {
    try { setLang(_lang); } catch (e) { console.warn('[i18n] init failed:', e); }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initI18n, { once: true });
} else {
    // DOM already parsed (defer scripts, late module load) — run now.
    _initI18n();
}

