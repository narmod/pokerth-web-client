var _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) try { _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e) {}
  return _audioCtx;
}
function playTone(freq, dur, vol) {
  if (!_soundEnabled) return;
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol||0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch(e) {}
}
function notifyCard() {
  // Bruit de carte distribuée : bref clic
  playTone(1200, 0.04, 0.12);
}
function notifyAction() {
  // Action d'un joueur : thud sourd
  playTone(220, 0.1, 0.1);
}
function notifyMyTurn() {
  playTone(523, 0.15, 0.25);
  setTimeout(function(){ playTone(659, 0.2, 0.2); }, 120);
  if (_soundEnabled && navigator.vibrate) navigator.vibrate([80, 60, 80]);
  var mz = document.querySelector('.my-zone');
  if (mz) { mz.style.borderTopColor='gold'; setTimeout(function(){ mz.style.borderTopColor=''; }, 1200); }
}
function notifyWinner(isMine) {
  if (isMine) {
    [523,659,784,1047].forEach(function(f,i){ setTimeout(function(){ playTone(f,0.15,0.28-i*0.03); }, i*110); });
    if (_soundEnabled && navigator.vibrate) navigator.vibrate([100,50,100,50,200]);
  } else {
    playTone(440,0.15,0.15); setTimeout(function(){ playTone(349,0.2,0.1); },150);
    if (_soundEnabled && navigator.vibrate) navigator.vibrate([60]);
  }
}
function notifyChat() {
  playTone(880, 0.07, 0.1);
  if (_soundEnabled && navigator.vibrate) navigator.vibrate([25]);
}
// Mute state
var _soundEnabled = (function() {
  try { return localStorage.getItem('pth_sound') !== '0'; } catch(e) { return true; }
})();

function toggleSound() {
  _soundEnabled = !_soundEnabled;
  try { localStorage.setItem('pth_sound', _soundEnabled ? '1' : '0'); } catch(e) {}
  var btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.textContent  = _soundEnabled ? '🔊' : '🔇';
    btn.style.color  = _soundEnabled ? '' : 'rgba(255,255,255,0.35)';
    btn.style.borderColor = _soundEnabled ? '' : 'rgba(255,255,255,0.15)';
    btn.title = _soundEnabled ? 'Mute' : 'Unmute';
  }
}

// ══ i18n ══
var LANG = {
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
    rememberMe:'Se souvenir du pseudo / identifiants',
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
    rememberMe:'Se souvenir du pseudo / login et mot de passe',
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
  }
};
var _lang = (function(){ try { return localStorage.getItem('pth_lang')||'en'; } catch(e){ return 'en'; } })();
function t(k) { return (LANG[_lang]||LANG.en)[k] || (LANG.en[k]) || k; }
function _startIpBlockCountdown() {
  // Met à jour le statut toutes les secondes avec le temps restant
  var _blockInterval = setInterval(function() {
    var rem = Math.max(0, Math.ceil((_ipBlockUntil - Date.now()) / 1000));
    var mins = Math.floor(rem / 60), secs = rem % 60;
    var txt = '⏳ IP bloquée — ' + (mins > 0 ? mins + 'min ' : '') + secs + 's';
    // Mettre à jour seulement si on est sur l'écran de connexion
    var cs = document.getElementById('cstatus');
    if (cs) cs.textContent = rem > 0 ? txt : '✅ Vous pouvez vous reconnecter.';
    if (rem <= 0) {
      clearInterval(_blockInterval);
      _ipBlockUntil = 0;
      var cs2 = document.getElementById('cstatus');
      if (cs2) { cs2.textContent = '✅ Vous pouvez vous reconnecter.'; cs2.className = 'status ok'; }
    }
  }, 1000);
}

function _showBanner(msg) {
  var b = document.getElementById('reconnect-banner');
  var m = document.getElementById('reconnect-msg');
  if (b) b.classList.add('visible');
  if (m) m.textContent = msg;
}
function _hideBanner() {
  var b = document.getElementById('reconnect-banner');
  if (b) b.classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════
// ANIMATIONS DE JEU
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// NOUVELLES ANIMATIONS
// ═══════════════════════════════════════════════════════════

var _prevDealerPid = -1;

// Confetti rain
function launchConfetti(count) {
  var colors = ['#f0c040','#e74c3c','#3498db','#2ecc71','#9b59b6','#ff8c42','#fff'];
  var shapes = ['▲','●','■','♠','♥','♦','♣'];
  count = count || 60;
  for (var i = 0; i < count; i++) {
    (function(i) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.width  = (8 + Math.random() * 8) + 'px';
        el.style.height = (8 + Math.random() * 8) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 5000);
      }, i * 35);
    })(i);
  }
}

// Transition lobby → table
function animateTableEnter() {
  var sg = document.getElementById('s-game');
  if (!sg) return;
  sg.classList.remove('entering');
  void sg.offsetWidth;
  sg.classList.add('entering');
  setTimeout(function(){ sg.classList.remove('entering'); }, 500);
}

// Urgence timer (≤5s)
function setUrgentMode(active) {
  var sg = document.getElementById('s-game');
  if (sg) sg.classList.toggle('urgent', active);
}

// Élimination joueur
function animatePlayerEliminated(pid) {
  var seats = document.querySelectorAll('.seat');
  seats.forEach(function(s) {
    var name = s.querySelector('.seat-name');
    if (name && name.textContent.trim().startsWith(
      (window.players && window.players[pid]) ? window.players[pid].charAt(0) : '#'
    )) {
      s.classList.add('eliminated');
      setTimeout(function(){ s.classList.remove('eliminated'); }, 900);
    }
  });
}

// Pot énorme
function updatePotSize(potVal) {
  var maxStack = 3000; // valeur par défaut
  if (window.seats && window.seats.length > 0) {
    maxStack = Object.values(window.seatData || {})
      .reduce(function(acc, sd){ return Math.max(acc, (sd.money||0) + (sd.bet||0)); }, 3000);
  }
  var threshold = maxStack * 0.6;
  var el1 = document.getElementById('g-pot');
  var el2 = document.getElementById('g-potbar');
  [el1, el2].forEach(function(el) {
    if (!el) return;
    el.classList.toggle('pot-huge', potVal > threshold && potVal > 500);
  });
}

// Dealer badge volant
function animateDealerMove(fromPid, toPid) {
  if (fromPid < 0 || fromPid === toPid) return;
  // Trouver les positions des sièges
  var seatEls = document.querySelectorAll('.seat');
  var fromEl = null, toEl = null;
  // Utiliser les coords absolues des sièges
  // On crée le badge volant depuis la position du dealer précédent
  var allSeats = Array.from(seatEls);
  // Tenter de localiser par ordre dans rotated
  var fromIdx = -1, toIdx = -1;
  if (window.seats) {
    var myIdx = window.seats.indexOf(window.myId || -1);
    var rotated = myIdx >= 0
      ? window.seats.slice(myIdx).concat(window.seats.slice(0, myIdx))
      : window.seats;
    fromIdx = rotated.indexOf(fromPid);
    toIdx   = rotated.indexOf(toPid);
  }
  if (fromIdx < 0 || toIdx < 0 || !allSeats[fromIdx] || !allSeats[toIdx]) return;
  var fr = allSeats[fromIdx].getBoundingClientRect();
  var tr = allSeats[toIdx].getBoundingClientRect();

  var badge = document.createElement('div');
  badge.className = 'dealer-badge-fly';
  badge.textContent = 'D';
  badge.style.left = (fr.left + fr.width/2 - 9) + 'px';
  badge.style.top  = (fr.top  + fr.height/2 - 9) + 'px';
  document.body.appendChild(badge);

  requestAnimationFrame(function() { requestAnimationFrame(function() {
    badge.style.left = (tr.left + tr.width/2 - 9) + 'px';
    badge.style.top  = (tr.top  + tr.height/2 - 9) + 'px';
    setTimeout(function(){ badge.remove(); }, 900);
  }); });
}

// All-in chips explosion
function animateAllIn(fromPid) {
  var seatEls = document.querySelectorAll('.seat');
  if (window.seats) {
    var myIdx = window.seats.indexOf(window.myId || -1);
    var rotated = myIdx >= 0
      ? window.seats.slice(myIdx).concat(window.seats.slice(0, myIdx))
      : window.seats;
    var idx = rotated.indexOf(fromPid);
    if (idx < 0 || !seatEls[idx]) return;
    var sr = seatEls[idx].getBoundingClientRect();
    var sx = sr.left + sr.width/2;
    var sy = sr.top + sr.height/2;
    var colors = ['#f0c040','#c8a820','#ffe066','#b8960c'];
    for (var i = 0; i < 12; i++) {
      (function(i) {
        var el = document.createElement('div');
        el.className = 'allin-chip';
        var angle = (i / 12) * Math.PI * 2;
        var d1 = 40 + Math.random() * 30;
        var d2 = 80 + Math.random() * 60;
        el.style.setProperty('--ax', Math.cos(angle)*d1 + 'px');
        el.style.setProperty('--ay', Math.sin(angle)*d1 + 'px');
        el.style.setProperty('--bx', Math.cos(angle)*d2 + 'px');
        el.style.setProperty('--by', Math.sin(angle)*d2 + 'px');
        el.style.setProperty('--ar', (Math.random()*360) + 'deg');
        el.style.background = colors[i % colors.length];
        el.style.left = sx + 'px';
        el.style.top  = sy + 'px';
        el.style.animationDelay = (i * 0.03) + 's';
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 1000);
      })(i);
    }
  }
}

// Reset fade des actions entre mains
function fadeOutAllActions() {
  document.querySelectorAll('.seat-action-label').forEach(function(el) {
    el.classList.add('fading');
    setTimeout(function(){ el.classList.remove('fading'); el.textContent = ''; }, 450);
  });
}

// Showdown — flip cartes adversaires
function animateShowdownCards() {
  var delay = 0;
  document.querySelectorAll('.seat:not(.me) .pk.xsm').forEach(function(el) {
    el.classList.remove('pk-showdown');
    void el.offsetWidth;
    el.style.animationDelay = (delay) + 's';
    el.classList.add('pk-showdown');
    delay += 0.12;
  });
}

// Thinking dots (remplace le texte "réfléchit")
function thinkingHtml(name) {
  return name + '<span class="thinking-dots"><span></span><span></span><span></span></span>';
}


// Explosion d'étoiles sur victoire
function burstStars(x, y, count) {
  count = count || 12;
  var emojis = ['⭐','✨','🌟','💫','🎉','🃏','💰'];
  for (var i = 0; i < count; i++) {
    (function(i) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'win-star';
        var angle = (i / count) * 360 * Math.PI / 180;
        var dist = 80 + Math.random() * 120;
        var tx = Math.cos(angle) * dist + 'px';
        var ty = Math.sin(angle) * dist + 'px';
        var rot = (Math.random() * 720 - 360) + 'deg';
        el.style.setProperty('--tx', tx);
        el.style.setProperty('--ty', ty);
        el.style.setProperty('--rot', rot);
        el.style.left = (x || window.innerWidth/2) + 'px';
        el.style.top  = (y || window.innerHeight * 0.4) + 'px';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 1300);
      }, i * 55);
    })(i);
  }
}

// Animation pot (bump visuel quand le pot augmente)
function animatePot(newVal) {
  var els = [document.getElementById('g-pot'), document.getElementById('g-potbar')];
  els.forEach(function(el) {
    if (!el) return;
    el.classList.remove('pot-bump');
    void el.offsetWidth; // reflow
    el.classList.add('pot-bump');
    setTimeout(function(){ el.classList.remove('pot-bump'); }, 400);
  });
}

// Activer/désactiver l'animation "mon tour" sur my-zone
function setMyTurnActive(active) {
  var mz = document.querySelector('.my-zone');
  if (!mz) return;
  if (active) mz.classList.add('my-turn-active');
  else mz.classList.remove('my-turn-active');
}

// Animation des cartes de ma main (deal)
function animateDealMyCards() {
  var pb = document.getElementById('g-myseat-cards');
  if (!pb) return;
  pb.querySelectorAll('.pk').forEach(function(el) {
    el.classList.remove('pk-deal');
    void el.offsetWidth;
    el.classList.add('pk-deal');
  });
}

// Flash sur une action (badge seat)
function flashActionLabel(pid) {
  var seats = document.querySelectorAll('.seat');
  seats.forEach(function(s) {
    var lbl = s.querySelector('.seat-action-label');
    if (lbl) {
      lbl.classList.remove('flash');
      void lbl.offsetWidth;
      lbl.classList.add('flash');
    }
  });
}



// isBot/getPlayerInitial/getPlayerTypeBadge → déplacées dans la closure (voir renderSeats)

// Palette de couleurs pour les avatars joueurs (12 couleurs)
var AVATAR_PALETTE = [
  { bg: '#c0392b', border: '#e74c3c', text: '#fff' }, // rouge
  { bg: '#2471a3', border: '#3498db', text: '#fff' }, // bleu
  { bg: '#1e8449', border: '#27ae60', text: '#fff' }, // vert
  { bg: '#d68910', border: '#f39c12', text: '#fff' }, // orange
  { bg: '#7d3c98', border: '#9b59b6', text: '#fff' }, // violet
  { bg: '#1a5276', border: '#2980b9', text: '#fff' }, // bleu foncé
  { bg: '#a04000', border: '#ca6f1e', text: '#fff' }, // brun
  { bg: '#117a65', border: '#1abc9c', text: '#fff' }, // turquoise
  { bg: '#943126', border: '#c0392b', text: '#fff' }, // bordeaux
  { bg: '#1f618d', border: '#2e86c1', text: '#fff' }, // cobalt
  { bg: '#616a6b', border: '#95a5a6', text: '#fff' }, // gris
  { bg: '#b7950b', border: '#d4ac0d', text: '#fff' }, // or
];
function getAvatarColor(pid) {
  return AVATAR_PALETTE[Math.abs(pid || 0) % AVATAR_PALETTE.length];
}


// ═══════════════════════════════════════════════════════════
// RACCOURCIS CLAVIER
// F=Fold  C/Space=Call/Check  R=Raise  A=All-in  Esc=annule
// ═══════════════════════════════════════════════════════════
document.addEventListener('keydown', function(e) {
  // Ne pas intercepter si on tape dans un input/textarea
  var tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
  // Seulement en jeu et si c'est mon tour
  if (typeof amInGame === 'undefined' || !amInGame) return;
  if (typeof turnPid !== 'undefined' && turnPid !== myId) return;

  var key = e.key.toLowerCase();

  if (key === 'f') {
    // Fold
    var btn = document.querySelector('.btn-fold:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); showKeyHint('F — Fold'); }
  } else if (key === 'c' || key === ' ') {
    // Call ou Check
    e.preventDefault();
    var btn = document.querySelector('.btn-call:not([disabled]), .btn-check:not([disabled])');
    if (btn) { btn.click(); showKeyHint(btn.classList.contains('btn-check') ? 'C — Check' : 'C — Call'); }
  } else if (key === 'r') {
    // Raise — focus sur l'input
    var inp = document.getElementById('raise-amt');
    var btn = document.querySelector('.btn-raise:not([disabled])');
    if (inp && !inp.disabled) {
      e.preventDefault();
      if (window.innerWidth >= 640) {
        inp.focus(); inp.select();
        showKeyHint('R — Raise (ajustez le montant)');
      } else if (btn) {
        btn.click(); showKeyHint('R — Raise');
      }
    }
  } else if (key === 'a') {
    // All-in
    var btn = document.querySelector('.btn-allin:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); showKeyHint('A — All-In'); }
  } else if (key === 'enter') {
    // Confirmer la relance si l'input est focusé
    var inp = document.getElementById('raise-amt');
    if (document.activeElement === inp) {
      e.preventDefault();
      var btn2 = document.querySelector('.btn-raise:not([disabled])');
      if (btn2) btn2.click();
    }
  }
});

// Petit toast d'indication du raccourci
function showKeyHint(text) {
  var existing = document.getElementById('key-hint');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = 'key-hint';
  el.textContent = '⌨ ' + text;
  el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
    'background:rgba(200,168,74,0.9);color:#1a0a00;padding:5px 14px;border-radius:20px;' +
    'font-family:monospace;font-size:0.75rem;font-weight:700;z-index:999;' +
    'animation:fadeIn 0.15s ease;pointer-events:none;';
  document.body.appendChild(el);
  setTimeout(function(){ el.style.opacity='0'; el.style.transition='opacity 0.4s'; setTimeout(function(){ el.remove(); }, 400); }, 1200);
}


// Rafraîchit immédiatement l'avatar du joueur local dans l'UI
window.refreshMyAvatar = function() {
  var av = '';
  try { av = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
  var display = av || (typeof myName !== 'undefined' ? (myName||'').charAt(0).toUpperCase() : '?');
  // Player-bar
  var pbAv = document.getElementById('g-myseat-av');
  if (pbAv) pbAv.textContent = display;
  // Siège autour de la table
  var seatEls = document.querySelectorAll('#g-seats .seat');
  seatEls.forEach(function(seat) {
    if (seat.classList.contains('me')) {
      var ini = seat.querySelector('.seat-initial');
      if (ini) ini.textContent = display;
      seat.querySelector('.seat-avatar') && (function(av2){
        var avatarEl = seat.querySelector('.seat-avatar');
        if (av2) avatarEl.classList.add('emoji-av');
        else avatarEl.classList.remove('emoji-av');
      })(av);
    }
  });
};

window.toggleAvatarPopup = function() {
  var popup = document.getElementById('avatar-popup');
  if (!popup) return;
  var open = popup.style.display === 'none' || popup.style.display === '';
  popup.style.display = open ? 'block' : 'none';
};

window.selectAvatarPopup = function selectAvatarPopup(emoji) {
  // Sauvegarder
  try { localStorage.setItem('pth_avatar', emoji); } catch(e) {}
  // Mettre à jour les boutons du popup
  document.querySelectorAll('.avp-btn').forEach(function(b) {
    b.classList.toggle('selected', b.dataset.av === emoji);
  });
  // Mettre à jour le bouton déclencheur
  var trigger = document.getElementById('av-trigger');
  if (trigger) {
    trigger.textContent = emoji || '🎭';
    trigger.classList.toggle('has-avatar', !!emoji);
  }
  // Fermer le popup
  var popup = document.getElementById('avatar-popup');
  if (popup) popup.style.display = 'none';
}

function toggleLang() { setLang(_lang === 'en' ? 'fr' : 'en'); }

// ═══════════════════════════════════════════════════════════
// ÉVALUATEUR DE MAIN POKER — Texas Hold'em
// Cards encodées 0-51 : suit=floor(n/13), rank=n%13
// ranks: 0=2 … 12=A  |  suits: 0=♦ 1=♣ 2=♠ 3=♥
// ═══════════════════════════════════════════════════════════
function _getCombos(arr, k) {
  if (k === arr.length) return [arr.slice()];
  if (k === 1) return arr.map(function(x){ return [x]; });
  var res = [];
  for (var i = 0; i <= arr.length - k; i++) {
    var rest = _getCombos(arr.slice(i+1), k-1);
    for (var j = 0; j < rest.length; j++) res.push([arr[i]].concat(rest[j]));
  }
  return res;
}

function _evalFive(cards) {
  var RANK_NAMES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  var ranks = cards.map(function(c){ return c % 13; }).sort(function(a,b){ return b-a; });
  var suits = cards.map(function(c){ return Math.floor(c/13); });
  var isFlush = suits.every(function(s){ return s === suits[0]; });
  var rankSet = ranks.filter(function(v,i,a){ return a.indexOf(v)===i; }).sort(function(a,b){return b-a;});
  var isStraight = false, straightHigh = ranks[0];
  if (rankSet.length === 5) {
    if (ranks[0] - ranks[4] === 4) { isStraight = true; straightHigh = ranks[0]; }
    // Roue : A-2-3-4-5
    else if (ranks[0]===12 && ranks[1]===3 && ranks[2]===2 && ranks[3]===1 && ranks[4]===0) {
      isStraight = true; straightHigh = 3;
    }
  }
  var counts = {};
  ranks.forEach(function(r){ counts[r] = (counts[r]||0)+1; });
  var freq = Object.values(counts).sort(function(a,b){return b-a;});
  var byFreq = Object.keys(counts).map(Number).sort(function(a,b){
    return counts[b]!==counts[a] ? counts[b]-counts[a] : b-a;
  });
  var top = byFreq[0];
  var top2 = byFreq[1];
  var rn = RANK_NAMES;
  if (isFlush && isStraight) {
    if (straightHigh===12) return { r:9, fr:'⭐ Quinte Flush Royale', en:'⭐ Royal Flush' };
    return { r:8, fr:'🃏 Quinte Flush '+rn[straightHigh], en:'🃏 Straight Flush '+rn[straightHigh] };
  }
  if (freq[0]===4) return { r:7, fr:'🟥 Carré '+rn[top], en:'🟥 Four '+rn[top]+'s' };
  if (freq[0]===3 && freq[1]===2) return { r:6, fr:'🔴 Full '+rn[top]+'/'+rn[top2], en:'🔴 Full House '+rn[top]+'/'+rn[top2] };
  if (isFlush) return { r:5, fr:'🟠 Couleur', en:'🟠 Flush' };
  if (isStraight) return { r:4, fr:'🟡 Suite '+rn[straightHigh], en:'🟡 Straight '+rn[straightHigh] };
  if (freq[0]===3) return { r:3, fr:'🟢 Brelan '+rn[top], en:'🟢 Three '+rn[top]+'s' };
  if (freq[0]===2 && freq[1]===2) {
    var p1=rn[top], p2=rn[top2];
    return { r:2, fr:'🔵 Deux paires '+p1+'/'+p2, en:'🔵 Two Pair '+p1+'/'+p2 };
  }
  if (freq[0]===2) return { r:1, fr:'⚪ Paire '+rn[top], en:'⚪ Pair of '+rn[top]+'s' };
  return { r:0, fr:'— Carte haute '+rn[ranks[0]], en:'— High Card '+rn[ranks[0]] };
}

// Convertit une hole card vers l'encodage canonique des comm cards.
//
// Encodages PokerTH (tous 0-indexés, 0-51) :
//   Hole cards : suit=['♣','♠','♥','♦'] → ♣=0, ♠=1, ♥=2, ♦=3
//   Comm cards : suit=['♦','♣','♠','♥'] → ♦=0, ♣=1, ♠=2, ♥=3
//
// Remap hole→comm : ♣(0)→1, ♠(1)→2, ♥(2)→3, ♦(3)→0
// Vérification : n=7  → si=0(♣), ri=7(9) → 9♣ → canonical 1*13+7=20 (9♣ comm) ✓
//               n=40 → si=3(♦), ri=1(3) → 3♦ → canonical 0*13+1=1  (3♦ comm) ✓

// ═══════════════════════════════════════════════════════════
// RÉACTIONS RAPIDES
// ═══════════════════════════════════════════════════════════
var _reactionCounts = {}; // { emoji: count }
var _reactionTimers = {}; // timers de reset des compteurs

// Affiche un emoji flottant qui monte depuis le bas de l'écran
function showFloatingReaction(emoji, fromX, fromY) {
  var el = document.createElement('div');
  el.className = 'floating-reaction';
  el.textContent = emoji;
  // Position de départ : bas de l'écran, position aléatoire si pas de coords
  var x = fromX || (window.innerWidth * 0.3 + Math.random() * window.innerWidth * 0.4);
  var y = fromY || (window.innerHeight * 0.75);
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); }, 2400);
}

// Affiche la réaction sur l'avatar du joueur dans les sièges
function showSeatReaction(pid, emoji) {
  var seatEls = document.querySelectorAll('.seat');
  if (!window.seats) return;
  var myIdx = seats.indexOf(myId);
  var rotated = myIdx >= 0
    ? seats.slice(myIdx).concat(seats.slice(0, myIdx))
    : seats;
  var idx = rotated.indexOf(pid);
  if (idx < 0 || !seatEls[idx]) return;
  var existing = seatEls[idx].querySelector('.seat-reaction');
  if (existing) existing.remove();
  var badge = document.createElement('div');
  badge.className = 'seat-reaction';
  badge.textContent = emoji;
  seatEls[idx].style.overflow = 'visible';
  seatEls[idx].appendChild(badge);
  setTimeout(function(){ if (badge.parentNode) badge.remove(); }, 2700);
  // Position pour l'animation flottante
  var sr = seatEls[idx].getBoundingClientRect();
  showFloatingReaction(emoji, sr.left + sr.width/2, sr.top);
}

// Mettre à jour les compteurs affichés sur les boutons
function updateReactionCount(emoji) {
  var EMOJIS = ["👏", "😱", "🤣", "🤔", "🔥", "😎", "💰", "😤", "🤩", "💪", "👍", "😡", "💎", "🎰", "🍀", "🎉", "😂", "🙌", "🤦", "😴", "🤑", "💀", "👀", "😬", "🥳"];
  var idx = EMOJIS.indexOf(emoji);
  if (idx < 0) return;
  var count = _reactionCounts[emoji] || 0;
  // Mettre à jour dans le panneau principal (rcp-N)
  var el = document.getElementById('rcp-' + idx);
  if (el) el.textContent = count > 0 ? count : '';
  // Ancien panneau chat (rc-N) si encore présent
  var el2 = document.getElementById('rc-' + idx);
  if (el) el.textContent = count > 0 ? count : '';
  // Reset après 6 secondes d'inactivité
  clearTimeout(_reactionTimers[emoji]);
  _reactionTimers[emoji] = setTimeout(function() {
    _reactionCounts[emoji] = 0;
    if (el) el.textContent = '';
  }, 6000);
}

// Recevoir une réaction d'un autre joueur (via chat)
function handleIncomingReaction(pid, emoji) {
  _reactionCounts[emoji] = (_reactionCounts[emoji] || 0) + 1;
  updateReactionCount(emoji);
  showSeatReaction(pid, emoji);
  // Notif sonore légère
  if (typeof playTone === 'function') playTone(800, 0.05, 0.08);
}



// ═══════════════════════════════════════════════════════════
// FORCE DE MAIN PRÉ-FLOP
// Encodage hole cards : si=floor(n/13) ♣=0♠=1♥=2♦=3, ri=n%13 2=0..A=12
// ═══════════════════════════════════════════════════════════
function evaluatePreFlopHand(c1, c2) {
  if (c1 == null || c2 == null) return null;
  var r1 = c1 % 13, r2 = c2 % 13;
  var s1 = Math.floor(c1 / 13), s2 = Math.floor(c2 / 13);
  var hi = Math.max(r1, r2), lo = Math.min(r1, r2);
  var isPair    = r1 === r2;
  var isSuited  = s1 === s2;
  var gap       = hi - lo; // 0=pair, 1=connected, 2=1-gap, etc.

  // ─ Premium ★★★
  if (isPair && hi >= 10) // AA KK QQ JJ TT
    return { stars: 3, fr: 'Main premium', en: 'Premium hand',
             detail_fr: ['AA','KK','QQ','JJ','TT'][12-hi] + (hi>=10?'':' ') };
  if (hi===12 && lo===11) // AK
    return { stars: 3, fr: isSuited ? 'AK couleur ★★★' : 'AK bicolore ★★★', en: isSuited?'AKs Premium':'AKo Premium' };

  // ─ Très bonnes ★★☆
  if (isPair && hi >= 7) // 77 88 99
    return { stars: 2, fr: 'Paire intermédiaire', en: 'Mid pair' };
  if (hi===12 && lo>=9 && isSuited) // AQs AJs ATs
    return { stars: 2, fr: 'As couleur fort', en: 'Strong suited Ace' };
  if (hi===12 && lo>=9) // AQ AJ AT
    return { stars: 2, fr: 'As fort', en: 'Strong Ace' };
  if (hi===11 && lo===10 && isSuited) // KQs
    return { stars: 2, fr: 'KQ couleur', en: 'KQs' };
  if (hi===11 && lo===10) // KQ
    return { stars: 2, fr: 'KQ', en: 'KQo' };

  // ─ Bonnes ★☆☆
  if (isPair && hi >= 4) // 44 55 66
    return { stars: 1, fr: 'Petite paire', en: 'Small pair' };
  if (isSuited && gap === 1 && lo >= 7) // connecteurs couleur hauts
    return { stars: 1, fr: 'Connecteurs couleur', en: 'Suited connectors' };
  if (isSuited && hi >= 10 && lo >= 8)
    return { stars: 1, fr: 'Deux cartes hautes couleur', en: 'Suited broadways' };
  if (hi===12 && lo >= 6) // As faible
    return { stars: 1, fr: 'As avec kicker', en: 'Ace with kicker' };

  // ─ Moyennes — connecteurs
  if (gap <= 2 && lo >= 5 && isSuited)
    return { stars: 0, fr: 'Connecteurs couleur', en: 'Suited connectors' };
  if (gap <= 1 && lo >= 4)
    return { stars: 0, fr: 'Connecteurs', en: 'Connectors' };

  // ─ Faibles
  return { stars: -1, fr: 'Main faible', en: 'Weak hand' };
}



function normalizeHoleCard(n) {
  if (n == null || n < 0 || n > 51) return null;
  var si = Math.floor(n / 13);  // 0-indexé (♣=0, ♠=1, ♥=2, ♦=3)
  var ri = n % 13;
  var suitRemap = [1, 2, 3, 0]; // ♣→1, ♠→2, ♥→3, ♦→0 (ordre comm canonique)
  return suitRemap[si] * 13 + ri;
}

function evaluateBestHand(holeCards, commCards) {
  var all = holeCards.concat(commCards).filter(function(c){ return c != null && c >= 0 && c < 52; });
  if (all.length < 2) return null;
  var k = Math.min(5, all.length);
  var combos = _getCombos(all, k);
  var best = null;
  for (var i = 0; i < combos.length; i++) {
    var res = _evalFive(combos[i]);
    if (!best || res.r > best.r) best = res;
  }
  return best;
}


function animateChipToPot(pid, amount) {
  // Trouver la position du siège du joueur
  var seatEls = document.querySelectorAll('.seat');
  var fromEl = null;
  seatEls.forEach(function(el) {
    // Le siège actif est celui du pid en cours
    if (!fromEl && el.style.top) fromEl = el;
  });
  // Position cible : le pot-bar ou centre de l'écran
  var potBar = document.getElementById('g-potbar');
  var targetRect = potBar ? potBar.getBoundingClientRect() : null;
  if (!targetRect) return;
  var tx = targetRect.left + targetRect.width/2;
  var ty = targetRect.top + targetRect.height/2;

  // Position source : siège du joueur
  var zone = document.getElementById('g-table-zone');
  if (!zone) return;
  var myIdx = seats.indexOf(myId);
  var rotated = myIdx >= 0 ? [...seats.slice(myIdx), ...seats.slice(0,myIdx)] : seats;
  var seatIdx = rotated.indexOf(pid);
  var seatEl = seatEls[seatIdx];
  if (!seatEl) return;
  var sr = seatEl.getBoundingClientRect();
  var sx = sr.left + sr.width/2;
  var sy = sr.top + sr.height/2;

  // Créer le jeton volant
  var chip = document.createElement('div');
  chip.className = 'flying-chip';
  chip.textContent = amount > 0 ? (amount > 999 ? Math.round(amount/100)/10+'k' : amount) : '';
  chip.style.left = sx + 'px';
  chip.style.top  = sy + 'px';
  chip.style.transform = 'scale(0.7)';
  document.body.appendChild(chip);

  // Déclencher l'animation après un frame
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      chip.style.left = tx + 'px';
      chip.style.top  = ty + 'px';
      chip.style.transform = 'scale(1.1)';
      chip.style.opacity = '0';
      setTimeout(function(){ if(chip.parentNode) chip.parentNode.removeChild(chip); }, 700);
    });
  });
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

// ══ FULLSCREEN ══
function toggleFullscreen() {
  if (!document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement) {
    // Enter fullscreen
    var el = document.documentElement;
    if      (el.requestFullscreen)       el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
    else if (el.msRequestFullscreen)     el.msRequestFullscreen();
  } else {
    // Exit fullscreen
    if      (document.exitFullscreen)       document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
    else if (document.msExitFullscreen)     document.msExitFullscreen();
  }
}

function _updateFsButtons() {
  var isFs = !!(document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement);
  var icon = isFs ? '⊠' : '⛶';
  var title = isFs ? 'Exit fullscreen' : 'Fullscreen';
  ['fs-btn-connect','fs-btn-lobby','fs-btn-game'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) { btn.textContent = icon; btn.title = title; }
  });
}

// Listen for fullscreen change (user pressing Escape etc.)
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange']
  .forEach(function(evt) { document.addEventListener(evt, _updateFsButtons); });

// Unlock audio on first interaction
document.addEventListener('click', function() { getAudioCtx(); }, { once: true });

/* ═══════════════════ */

document.addEventListener("DOMContentLoaded", function() {
  // Auto-fill nick
  // Restore saved credentials
  try {
    var savedLogin   = localStorage.getItem('pth_login');
    var savedPass    = localStorage.getItem('pth_pass');
    var savedLanNick = localStorage.getItem('pth_lan_nick');
    var rmEl = document.getElementById('remember-me');
    if (savedLogin && savedPass) {
      window._savedLogin = savedLogin;
      window._savedPass  = savedPass;
      var passEl = document.getElementById('pass');
      if (passEl) passEl.value = savedPass;
      if (rmEl) rmEl.checked = true;
    }
    if (savedLanNick) {
      window._savedLanNick = savedLanNick;
      var nickEl = document.getElementById('nick');
      if (nickEl) nickEl.value = savedLanNick;
      if (rmEl) rmEl.checked = true;
    }
  } catch(e) {}
  // Restaurer l'avatar sauvegardé
  try {
    var savedAv = localStorage.getItem('pth_avatar') || '';
    selectAvatarPopup(savedAv);
  } catch(e) {}
  // Restore sound button state
  var sbtn = document.getElementById('sound-toggle-btn');
  if (sbtn && !_soundEnabled) {
    sbtn.textContent = '🔇';
    sbtn.style.color = 'rgba(255,255,255,0.35)';
    sbtn.title = 'Unmute';
  }
  var n = document.getElementById("nick");
  if (!n.value) n.value = "Guest" + Math.floor(10000 + Math.random()*90000);

  // Restaurer le serveur préféré sauvegardé
  try {
    var savedHost  = localStorage.getItem('pth_host');
    var savedPort  = localStorage.getItem('pth_port');
    var savedProxy = localStorage.getItem('pth_proxy');
    var savedMode  = localStorage.getItem('pth_login_mode');
    if (savedHost)  { var hi = document.getElementById('host');  if (hi) hi.value = savedHost; }
    if (savedPort)  { var pi = document.getElementById('port');  if (pi) pi.value = savedPort; }
    if (savedProxy) { var xi = document.getElementById('proxy'); if (xi) xi.value = savedProxy; }
    if (savedMode)  { var mi = document.getElementById('login-mode'); if (mi) { mi.value = savedMode; App.onLoginModeChange && App.onLoginModeChange(); } }
  } catch(e) {}

  // Auto-fill proxy URL from current page URL
  var proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  var host  = window.location.hostname;
  var port  = window.location.port || (proto === 'wss:' ? '443' : '80');
  var wsUrl = proto + '//' + host + ':' + port;
  var proxyInput = document.getElementById("proxy");
  if (proxyInput) proxyInput.value = wsUrl;

  // Auto-fill PokerTH server host (same machine by default on LAN)
  var hostInput = document.getElementById("host");
  if (hostInput && host !== 'localhost' && host !== '127.0.0.1') {
    // If accessing from another PC, the PokerTH server is likely on the same machine as the proxy
    hostInput.value = host;
    hostInput.dataset.autoHost = host; // remember the auto-detected value
  }
});

/* ═══════════════════ */

// ═══════════════════════════════════════════════════════════
//  PROTOBUF — encodeur/décodeur minimal (proto2 binaire)
// ═══════════════════════════════════════════════════════════
const Proto = (() => {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function encodeVarint(n) {
    n = n >>> 0;
    const out = [];
    while (n > 0x7F) {
      out.push((n & 0x7F) | 0x80);
      n >>>= 7;
    }
    out.push(n & 0x7F);
    return out;
  }

  function decodeVarint(buf, pos) {
    let result = 0, shift = 0;
    while (pos < buf.length) {
      const b = buf[pos++];
      result |= (b & 0x7F) << shift;
      if (!(b & 0x80)) break;
      shift += 7;
    }
    return { value: result >>> 0, pos };
  }

  // Décode un buffer en map { fieldNum: [valeurs] }
  // valeurs = number (varint) ou Uint8Array (length-delimited)
  function decode(buf) {
    const fields = {};
    let pos = 0;
    while (pos < buf.length) {
      const tagR = decodeVarint(buf, pos);
      pos = tagR.pos;
      const fn = tagR.value >>> 3;
      const wt = tagR.value & 0x7;
      if (!fields[fn]) fields[fn] = [];

      if (wt === 0) {
        const r = decodeVarint(buf, pos);
        pos = r.pos;
        fields[fn].push(r.value);
      } else if (wt === 2) {
        const lr = decodeVarint(buf, pos);
        pos = lr.pos;
        fields[fn].push(buf.slice(pos, pos + lr.value));
        pos += lr.value;
      } else if (wt === 1) { pos += 8; }
        else if (wt === 5) { pos += 4; }
        else break; // inconnu → stop
    }
    return fields;
  }

  // Encode un message à partir de specs [[fieldNum, wireType, valeur], ...]
  // wireType 0 = varint, 2 = string|Uint8Array|Array<number>
  function encode(specs) {
    const out = [];
    for (const [num, wt, val] of specs) {
      if (val === undefined || val === null) continue;
      out.push(...encodeVarint((num << 3) | wt));
      if (wt === 0) {
        out.push(...encodeVarint(val >>> 0));
      } else if (wt === 2) {
        const bytes = typeof val === 'string' ? enc.encode(val)
          : val instanceof Uint8Array ? val : new Uint8Array(val);
        out.push(...encodeVarint(bytes.length));
        out.push(...bytes);
      }
    }
    return new Uint8Array(out);
  }

  // Helpers d'accès aux champs
  const str  = (f, n) => f[n] ? dec.decode(f[n][0]) : '';
  const u32  = (f, n, d=0) => f[n] ? f[n][0] : d;
  const sub  = (f, n) => f[n] ? decode(f[n][0]) : {};
  const raw  = (f, n) => f[n] ? f[n][0] : null;

  return { encode, decode, encodeVarint, decodeVarint, str, u32, sub, raw };
})();


// ═══════════════════════════════════════════════════════════
//  MESSAGES POKERTH
//  Types définis dans PokerTHMessage.PokerTHMessageType (proto)
// ═══════════════════════════════════════════════════════════
const MSG = (() => {
  // Type IDs → numéro de champ dans PokerTHMessage
  const TYPE_FIELD = {
    1:2, 2:3, 3:4, 4:5, 5:6, 6:7,           // Announce,Init,AuthChallenge,…,InitAck
    12:13,                                     // PlayerList
    13:14, 14:15, 15:16, 16:17, 17:18,        // GameList*
    18:19, 19:20,                              // PlayerInfo req/reply
    21:22, 22:23, 23:24, 24:25, 25:26,        // Join*
    26:27, 27:28, 28:29, 29:30,               // GamePlayer*
    36:37, 37:38, 38:39,                       // StartEvent, StartEventAck, GameStartInitial
    40:41, 41:42, 42:43,                       // HandStart, PlayersTurn, MyActionRequest
    44:45,                                     // PlayersActionDone
    45:46, 46:47, 47:48,                       // DealFlop, DealTurn, DealRiver
    48:49,                                     // AllInShowCards
    49:50, 50:51, 53:54,                       // EndOfHandShow, EndOfHandHide, EndOfGame
    62:63, 63:64, 64:65, 65:66,               // Statistics, Chat*
    67:68, 68:69,                              // TimeoutWarning, ResetTimeout
    73:74,                                     // Error
    78:79, 79:80, 80:81, 81:82,              // Spectator*
  };

  const T = {
    Announce:1, Init:2, AuthChallenge:3, AuthClientResp:4, AuthServerVerif:5, InitAck:6,
    PlayerList:12,
    GameListNew:13, GameListUpdate:14, GameListPlayerJoined:15, GameListPlayerLeft:16,
    GameListAdminChanged:17,
    PlayerInfoRequest:18, PlayerInfoReply:19,
    JoinExisting:21, JoinNew:22, RejoinExisting:23,
    JoinNew:22, JoinGameAck:24, JoinGameFailed:25,
    GamePlayerJoined:26, GamePlayerLeft:27, GameAdminChanged:28, RemovedFromGame:29,
    StartEvent:36, StartEventAck:37, GameStartInitial:38,
    HandStart:40, PlayersTurn:41, MyActionRequest:42,
    PlayersActionDone:44, DealFlop:45, DealTurn:46, DealRiver:47,
    AllInShowCards:48, EndOfHandShow:49, EndOfHandHide:50, EndOfGame:53,
    Statistics:62, ChatRequest:63, Chat:64, ChatReject:65,
    TimeoutWarning:67, ResetTimeout:68, Error:73,
    GameListSpectatorJoined:78, GameListSpectatorLeft:79,
  };

  // Parse un buffer en {type, sub: champs du sous-message}
  function parse(buf) {
    const fields = Proto.decode(buf);
    const type = Proto.u32(fields, 1);
    const fn = TYPE_FIELD[type];
    const sub = fn && fields[fn] ? Proto.decode(fields[fn][0]) : {};
    return { type, sub };
  }

  // Construit un InitMessage (connexion invité)
  // buildId = (CLIENT_TYPE_QT_WIDGET<<24)|(MAJOR<<16)|(MINOR<<8)|PATCH
  // = (0x01<<24)|(2<<16)|(0<<8)|6 = 0x01020006 = 16908294 (PokerTH 2.0.6)
  function buildInit(nick, major, minor, loginType, password) {
    loginType = loginType !== undefined ? loginType : 0;
    const BUILD_ID = 16908294; // 0x01020006 — source: pokerth-live/src/constants/gameDefs.js
    const ver = Proto.encode([[1,0,major],[2,0,minor]]);
    const init = Proto.encode([
      [1,2,ver],      // requestedVersion (= protocolVersion from Announce)
      [2,0,BUILD_ID], // buildId composite: (type<<24)|(major<<16)|(minor<<8)|patch
      [5,0,loginType],// login: 0=guestLogin, 2=unauthenticatedLogin
      [6,2,nick],     // nickName
    ]);
    return Proto.encode([[1,0,T.Init],[3,2,init]]);
  }

  // Chat lobby
  function buildChat(text) {
    const req = Proto.encode([[3,2,text]]);
    return Proto.encode([[1,0,T.ChatRequest],[64,2,req]]);
  }

  // Rejoindre une table existante
  function buildJoin(gameId) {
    const join = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,join]]);
  }


  // JoinExistingGameMessage: gameId=1, password=2, autoLeave=3, spectateOnly=4
  function buildJoinGame(gameId, spectateOnly) {
    const msg = Proto.encode([
      [1,0,gameId],
      [3,0,spectateOnly ? 1 : 0],   // autoLeave (use spectate mode for now)
      [4,0,spectateOnly ? 1 : 0],   // spectateOnly
    ]);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,msg]]);
  }

  // StartEventAckMessage: gameId=1
  function buildStartEventAck(gameId) {
    const msg = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,T.StartEventAck],[38,2,msg]]);
  }

  // MyActionRequestMessage: gameId=1, handNum=2, gameState=3, myAction=4, myRelativeBet=5
  function buildMyAction(gameId, handNum, gameState, action, bet) {
    const msg = Proto.encode([
      [1,0,gameId],
      [2,0,handNum],
      [3,0,gameState],
      [4,0,action],
      [5,0,bet || 0],
    ]);
    return Proto.encode([[1,0,T.MyActionRequest],[43,2,msg]]);
  }

  // Build create/join new game (JoinNewGameMessage, type 22)
  function buildCreateGame(name, maxPlayers, smallBlind, startMoney, timeout, opts) {
    opts = opts || {};
    const raiseMode    = opts.raiseMode    || 1;
    const raiseEvery   = opts.raiseEvery   || 7;
    const endRaiseMode = opts.endRaiseMode || 1;
    const endRaiseVal  = opts.endRaiseValue|| 0;
    const guiSpeed     = opts.guiSpeed     || 5;
    const delayHands   = opts.delayHands   || 7;
    const gameType     = opts.gameType     || 1;
    const gameInfo = Proto.encode([
      [1,  2, name || 'WebGame'],
      [2,  0, gameType],
      [3,  0, maxPlayers||2],
      [4,  0, raiseMode],
      raiseMode === 1 ? [5, 0, raiseEvery] : [6, 0, raiseEvery],
      [7,  0, endRaiseMode],
      ...(endRaiseMode === 2 ? [[8, 0, endRaiseVal]] : []),
      [9,  0, guiSpeed],
      [10, 0, delayHands],
      [11, 0, timeout||30],
      [12, 0, smallBlind||10],
      [13, 0, startMoney||3000],
    ]);
    const joinFields = [[1, 2, gameInfo]];
    if (opts.password) joinFields.push([2, 2, opts.password]);
    const msg = Proto.encode(joinFields);
    return Proto.encode([[1, 0, 22], [23, 2, msg]]);
  }

  function buildAuthResponse() {
    const msg = Proto.encode([[1, 2, new Uint8Array(0)]]);
    return Proto.encode([[1, 0, T.AuthClientResp], [5, 2, msg]]);
  }

  // StartEventMessage with fillWithComputerPlayers
  function buildStartWithBots(gameId, fill) {
    const msg = Proto.encode([[1,0,gameId],[2,0,0],[3,0,fill?1:0]]);
    return Proto.encode([[1,0,36],[37,2,msg]]);
  }

  // LeaveGameRequestMessage
  function buildLeaveGame(gameId) {
    const msg = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,31],[32,2,msg]]);
  }

  return { T, parse, buildInit, buildChat, buildJoin, buildJoinGame, buildStartEventAck, buildMyAction, buildCreateGame, buildLeaveGame, buildStartWithBots };
})();


// ═══════════════════════════════════════════════════════════
//  APPLICATION
// ═══════════════════════════════════════════════════════════
const App = (() => {
  let ws        = null;
  let rxBuf     = new Uint8Array(0);
  let myId      = 0;
  // ── Game state ──
  let gId       = 0;   // current gameId
  let lastMajor = 5, lastMinor = 1, lastLoginType = 0; // for name-retry
  let smallBlind = 10;  // small blind value
  let handNum   = 0;   // hand counter
  let gameState = 0;   // preflop/flop/turn/river
  let _playerAvatars = {}; // pid → emoji avatar (reçu des autres joueurs via proxy)
  let seats     = [];  // player IDs in seat order (from GameStartInitial) — figé après 1ère main
  let seatData  = {};  // {pid: {money, bet, action, active, folded}}
  let myCards   = [null, null];
  let commCards = [];
  let highestBet= 0;
  let minRaise  = 0;
  let pot          = 0;
  let collectedPot = 0;  // bets accumulated from previous rounds
  let dealerPid = 0;
  let turnPid   = 0;
  let _timerID  = null;   // setInterval handle
  let _timerSec = 0;      // seconds remaining
  let _timerTot = 30;     // total seconds
  let gameTimeout = 15;   // timeout par joueur (depuis les settings de la partie)

  // ── Statistiques de session ──
  var _stats = { handsPlayed:0, handsWon:0, startMoney:0, peakMoney:0, totalGain:0,
                 bigWin:0, bigLoss:0, history:[] };
  var _statsInited = false;

  // ── Positions des sièges (pour les animations) ──
  var _lastPixPos = [];  // [{top, left}] dans l'ordre de rotated
  var _potCenter  = {x:0, y:0}; // centre du pot à l'écran
  let amInGame  = false;
  let myName    = '';
  let games     = {};   // gameId → {name, mode, players, maxPlayers, type, priv}
  let players   = {};   // playerId → name
  let loaded    = false;
  let autoAction = false;
  let amGameAdmin = false;  // true if we created this game
  let _lastConnectParams = null;
  let _currentLoginMode = 'lan';
  let _lastMsgWasReaction = false; // true si le dernier chat envoyé était une réaction
  let _chatRejectShown = false;    // n'afficher l'avertissement LAN qu'une seule fois // pour la reconnexion auto
  let _reconnectAttempts = 0;
  let _intentionalDisconnect = false;
  let _wasAuthenticated = false; // true seulement après InitAck réussi
  let _lastConnectTime = 0;      // timestamp de la dernière tentative
  let _lastConnectFailed = false; // true si la dernière tentative a échoué
  let _ipBlockUntil = 0;         // timestamp de fin de blocage IP
  const MIN_CONNECT_INTERVAL = 1500; // 1.5s minimum (anti double-clic) — espacer via proxy

  // ── DOM ──
  const $ = id => document.getElementById(id);

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }

  function setStatus(txt, cls='') {
    const el = $('cstatus');
    el.textContent = txt;
    el.className = 'status ' + cls;
  }

  // ── RÉSEAU ──
  function send(data) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (directWS) {
      // Direct WSS to pokerth.net: raw protobuf, no length prefix
      ws.send(data);
      return;
    }
    // Proxy mode: 4-byte big-endian length prefix + data
    const frame = new ArrayBuffer(4 + data.byteLength);
    new DataView(frame).setUint32(0, data.byteLength, false);
    new Uint8Array(frame).set(data, 4);
    ws.send(frame);
  }

  function onRawData(chunk) {
    if (typeof chunk === 'string') return; // ignore text frames
    if (directWS) {
      // Direct WSS: each WS message is one complete protobuf (no length prefix)
      handleMsg(new Uint8Array(chunk));
      return;
    }
    const tmp = new Uint8Array(rxBuf.length + chunk.byteLength);
    tmp.set(rxBuf);
    tmp.set(new Uint8Array(chunk), rxBuf.length);
    rxBuf = tmp;

    while (rxBuf.length >= 4) {
      const len = new DataView(rxBuf.buffer, rxBuf.byteOffset).getUint32(0, false);
      if (rxBuf.length < 4 + len) break;
      handleMsg(rxBuf.slice(4, 4 + len));
      rxBuf = rxBuf.slice(4 + len);
    }
  }

  // ── HANDLER DE MESSAGES ──
  function handleMsg(buf) {
    const { type, sub } = MSG.parse(buf);
    const T = MSG.T;

    switch (type) {

      // Le serveur s'annonce → on envoie notre Init
      case T.Announce: {
        const pv    = Proto.sub(sub, 1); // protocolVersion (réseau, ex: 5.1)
        const gv    = Proto.sub(sub, 2); // latestGameVersion (appli, ex: 2.0)
        const stype = Proto.u32(sub, 4); // 0=LAN, 1=NoAuth, 2=Auth
        const np    = Proto.u32(sub, 5);
        const pMaj  = Proto.u32(pv, 1), pMin = Proto.u32(pv, 2);
        const gMaj  = Proto.u32(gv, 1), gMin = Proto.u32(gv, 2);

        const loginMode = $('login-mode') ? $('login-mode').value : 'guest';
        if (stype === 2 && loginMode !== 'guest' && loginMode !== 'auth') {
          setStatus('This server requires authentication.', 'err');
          ws.close(); return;
        }
        let loginType;
        if (loginMode === 'unauth' || loginMode === 'guest') loginType = 2;
        else if (loginMode === 'auth') loginType = 1;
        else loginType = 0; // lan
        const typeLabel = ['LAN','Internet (no-auth)','Internet (auth)'][stype] || 'Serveur';
        setStatus('Connexion ' + typeLabel + ' v' + pMaj + '.' + pMin + ' — ' + np + ' joueur(s)...');
        lastMajor = pMaj; lastMinor = pMin; lastLoginType = loginType;
        const authPass = (loginType === 1) ? ($('pass') ? $('pass').value : '') : null;
        send(MSG.buildInit(myName, pMaj, pMin, loginType, authPass));
        break;
      }

      // Connexion acceptée
      case T.InitAck: {
        _wasAuthenticated = true;
        _lastConnectFailed = false; // connexion réussie
        _reconnectAttempts = 0;
        myId = Proto.u32(sub, 2);
        $('h-nick').textContent = '♠ ' + myName;
        show('s-lobby');
        // Demander la permission pour les notifications
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(function(){});
        }
        addChat(null, 'Connecté en tant qu\'invité "' + myName + '" (ID ' + myId + ')', 'sys');
        const cfName = document.getElementById('cf-name');
        if (cfName) cfName.value = 'Table de ' + myName;  // always update with current name
        break;
      }

      // Erreur serveur
      case T.AuthChallenge: {
        // SCRAM removed on server — reply with empty response
        setStatus('Vérification du compte...');
        send(MSG.buildAuthResponse());
        break;
      }

      case T.Error: {
        _lastConnectFailed = true;
        const codes = {1:'Version incompatible',2:'Serveur plein',3:'Auth échouée',
          4:'Pseudo déjà pris',5:'Pseudo invalide',6:'Maintenance',7:'Bloqué'};
        const r = Proto.u32(sub, 1);
        if (r === 3 && directWS) {
          setStatus('⚠ Login enregistré non supporté via WebSocket. Utilisez le mode Invité.', 'err');
          ws.close(); return;
        }
        if (r === 7) {
          _intentionalDisconnect = true;
          _wasAuthenticated = false;
          _hideBanner();
          _ipBlockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
          _startIpBlockCountdown();
          setStatus('⏳ IP bloquée — attendez 5 minutes puis réessayez.', 'err'); return;
        }
        if (r === 4) {
          // Name in use: auto-retry with random suffix
          const suffix = Math.floor(Math.random()*999)+1;
          myName = myName.replace(/_\d+$/, '') + '_' + suffix;
          setStatus('Pseudo déjà pris — nouvel essai avec "' + myName + '"…');
          setTimeout(() => {
            send(MSG.buildInit(myName, lastMajor || 5, lastMinor || 1, lastLoginType || 0));
          }, 400);
        } else {
          setStatus('Erreur : ' + (codes[r] || 'code ' + r), 'err');
        }
        break;
      }

      // Statistiques (nombre de joueurs connectés)
      case T.Statistics: {
        const arr = sub[1] || [];
        for (const d of arr) {
          const s = Proto.decode(d);
          if (Proto.u32(s,1) === 1) {
            $('h-players').textContent = `${Proto.u32(s,2)} joueurs en ligne`;
          }
        }
        break;
      }

      // Profil d'un joueur reçu
      case T.PlayerInfoReply: {
        const pid = Proto.u32(sub, 1);
        const info = Proto.sub(sub, 2);
        const name = Proto.str(info, 1);
        if (name) players[pid] = name;
        break;
      }

      // Nouvelle table dans la liste
      case T.GameListNew: {
        const id   = Proto.u32(sub, 1);
        const mode = Proto.u32(sub, 2); // 1=created,2=started,3=closed
        const priv = Proto.u32(sub, 3);
        const gi   = Proto.sub(sub, 6); // NetGameInfo
        const name = Proto.str(gi, 1) || `#${id}`;
        const gtype= Proto.u32(gi, 2);
        const maxp = Proto.u32(gi, 3);

        // Compter les joueurs (packed varints dans le champ 4)
        let pc = 0;
        if (sub[4]) {
          let pos = 0; const p = sub[4][0];
          while (pos < p.length) { const r = Proto.decodeVarint(p, pos); pos = r.pos; pc++; }
        }

        // Extraire le timeout depuis GameInfo (netTimeOutPlayerAction)
        var _ginfo = sub[13] ? Proto.decode(sub[13][0]) : (sub[5] ? Proto.decode(sub[5][0]) : null);
        var _gto = _ginfo ? (Proto.u32(_ginfo, 11) || Proto.u32(_ginfo, 9)) : 0;
        games[id] = { name, mode, players:pc, maxPlayers:maxp, type:gtype, priv:!!priv,
                      timeout: _gto || 15 };
        if (!loaded) { loaded = true; }
        renderGames();
        break;
      }

      // Mise à jour d'une table (état)
      case T.GameListUpdate: {
        const id   = Proto.u32(sub, 1);
        const mode = Proto.u32(sub, 2);
        if (games[id]) {
          if (mode === 3) delete games[id];
          else games[id].mode = mode;
          renderGames();
        }
        break;
      }

      // Un joueur rejoint / quitte une table
      case T.GameListPlayerJoined: {
        const id = Proto.u32(sub, 1);
        if (games[id]) { games[id].players++; renderGames(); }
        break;
      }
      case T.GameListPlayerLeft: {
        const id = Proto.u32(sub, 1);
        if (games[id] && games[id].players > 0) { games[id].players--; renderGames(); }
        break;
      }
      case T.GameListSpectatorJoined: {
        /* pas besoin de compter les spectateurs ici */ break;
      }
      case T.GameListSpectatorLeft: { break; }

      // Message de chat
      case T.Chat: {
        const pid  = Proto.u32(sub, 2);
        const ctype= Proto.u32(sub, 3);
        const text = Proto.str(sub, 4);
        const who  = players[pid] || (pid ? `#${pid}` : null);
        const cls  = ctype === 3 ? 'bc' : pid === myId ? 'mine' : '';
        // Logging de tous les messages chat (debug réactions)
        // Intercepter les réactions (préfixe ASCII [R])
        if (text && text.startsWith('[R]') && text.length < 12) {
          var reactEmoji = text.slice(3);
          if (pid !== myId) {
            handleIncomingReaction(pid, reactEmoji);
            // Pas d'affichage dans le chat — animation seule
          }
        } else {
          addChat(who, text, cls);
        }
        break;
      }
      case T.TimeoutWarning: {
        const sec = Proto.u32(sub, 2);
        _timerSec = sec; // Sync avec le serveur
        // Si le serveur donne plus de temps que prévu, ajuster le total
        if (sec > _timerTot) _timerTot = sec;
        addChat(null, '⏰ Délai: ' + sec + 's — jouez vite !', 'sys');
        // Auto-reset timeout
        const rtm = Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]]);
        send(rtm);
        break;
      }

      case T.ChatReject: {
        const rejText = Proto.str(sub, 1);
        if (_lastMsgWasReaction) {
          // Réaction rejetée (mode LAN/invité) — afficher badge local uniquement
          _lastMsgWasReaction = false;
          if (!_chatRejectShown) {
            _chatRejectShown = true;
            // Note discrète dans la barre de réactions
            var rb = document.getElementById('reaction-bar');
            if (rb) {
              var note = document.createElement('div');
              note.style.cssText = 'font-size:0.52rem;color:rgba(255,180,50,0.7);text-align:center;width:100%;margin-top:2px;font-style:italic';
              note.textContent = _currentLoginMode === 'lan'
                ? '⚠ Mode LAN : réactions locales. Utilisez Internet Invité pour les partager.'
                : '⚠ Réactions locales seulement (chat refusé par le serveur)';
              rb.appendChild(note);
              setTimeout(function(){ note.style.opacity='0'; note.style.transition='opacity 1s'; setTimeout(function(){ note.remove(); }, 1000); }, 5000);
            }
          }
        } else {
          _lastMsgWasReaction = false;
          if (!amInGame) addChat(null, '⚠ Chat refusé: ' + rejText, 'sys');
          else if (!_chatRejectShown) {
            _chatRejectShown = true;
            if (_currentLoginMode === 'lan') {
              addGameChat(null,
                '⚠ Mode LAN : chat en jeu désactivé. ' +
                'Connectez-vous en mode "Internet Invité" pour activer le chat et les réactions.',
                'sys');
            } else {
              addGameChat(null,
                '⚠ Chat refusé par le serveur. Vérifiez que ServerRestrictGuestLogin=0 dans la config.',
                'sys');
            }
          }
        }
        break;
      }

      case T.JoinGameAck: {
        gId = Proto.u32(sub, 1);
        const isAdmin = Proto.u32(sub, 2);
        // Appliquer le timeout de la partie (depuis games[] si on rejoint, sinon celui créé)
        if (games[gId] && games[gId].timeout) gameTimeout = games[gId].timeout;
        amGameAdmin = !!isAdmin;
        var acb = document.getElementById('admin-close-btn');
        if (acb) acb.style.display = amGameAdmin ? '' : 'none';
        var asb = document.getElementById('admin-start-btn');
        if (asb) asb.style.display = amGameAdmin ? '' : 'none';
        var acbm = document.getElementById('admin-close-mob');
        if (acbm) acbm.style.display = amGameAdmin ? '' : 'none';
        var asbm = document.getElementById('admin-start-mob');
        if (asbm) asbm.style.display = amGameAdmin ? '' : 'none';
        addChat(null, 'Rejoint la table ' + gId + (isAdmin ? ' (admin)' : '') + ' — attente du démarrage...', 'sys');
        show('s-game');
        document.body.classList.add('in-game');
        // Diffuser l'avatar aux autres joueurs via le proxy
        setTimeout(function() {
          try {
            var myAv = localStorage.getItem('pth_avatar') || '';
            if (ws && ws.readyState === WebSocket.OPEN && !directWS) {
              ws.send('AVATAR:' + myId + ':' + myAv);
            }
          } catch(e) {}
        }, 500);
        // Plusieurs tentatives pour s'assurer que la table s'affiche
        [100, 300, 600, 1200].forEach(function(d){
          setTimeout(function(){
            autoScaleTable();
            if (seats.length > 0) renderSeats();
          }, d);
        });
        setTimeout(animateTableEnter, 100);
        // Mettre à jour le label de la barre de réactions selon le mode
        var rbl = document.getElementById('reaction-bar-label');
        if (rbl) {
          if (_currentLoginMode === 'lan') {
            rbl.textContent = 'Réactions (locales — mode LAN)';
            rbl.style.color = 'rgba(255,180,50,0.6)';
          } else {
            rbl.textContent = 'Réactions';
            rbl.style.color = '';
          }
        }
        const admBadge = document.getElementById('g-admin-badge');
        if (admBadge) admBadge.style.display = amGameAdmin ? '' : 'none';
        setTimeout(function(){ autoScaleTable(); }, 200);
        renderGameWaiting('En attente du démarrage...');
        break;
      }

      case T.JoinGameFailed: {
        const failedGameId = Proto.u32(sub, 1);
        const failCode = Proto.u32(sub, 2);
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
        break;
      }

      case T.GamePlayerJoined: {
        const pid = Proto.u32(sub, 2);
        if (!seatData[pid]) seatData[pid] = {money:0,bet:0,action:'',active:false,folded:false};
        const name = players[pid] || '#'+pid;
        addChat(null, name + ' rejoint la table', 'sys');
        break;
      }

      case T.GamePlayerLeft: {
        const pid = Proto.u32(sub, 2);
        const name = players[pid] || '#'+pid;
        addChat(null, name + ' quitte la table', 'sys');
        if (seatData[pid]) seatData[pid].active = false;
        renderSeats();
        break;
      }

      case T.RemovedFromGame: {
        addChat(null, 'Vous avez été retiré de la partie.', 'sys');
        amInGame = false;
        gId = 0; seats = []; seatData = {}; _playerAvatars = {};
        show('s-lobby');
        break;
      }

      case T.StartEvent: {
        // Répondre avec StartEventAck
        const evGameId = Proto.u32(sub, 1);
        send(MSG.buildStartEventAck(evGameId));
        addChat(null, 'Partie en cours de démarrage...', 'sys');
        break;
      }

      case T.GameStartInitial: {
        // GameStartInitialMessage: gameId=1, startDealerPlayerId=2, playerSeats=3 (packed uint32)
        gId       = Proto.u32(sub, 1);
        dealerPid = Proto.u32(sub, 2);

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
        // potentiellement différent (rotation du dealer). On fige l'ordre de la
        // PREMIÈRE réception et on ne le change plus — évite que les joueurs
        // "tournent" visuellement autour de la table à chaque nouvelle main.
        const isFirstDeal = (seats.length === 0);
        if (isFirstDeal) {
          seats  = newSeats;
          handNum = 0;
          const scEl = document.getElementById('g-myseat-cards');
          if (scEl) scEl.innerHTML = '<div class="pk sm back"></div><div class="pk sm back"></div>';
        }
        // Late joins : ajouter les nouveaux joueurs à la fin
        for (const pid of newSeats) {
          if (!seats.includes(pid)) seats.push(pid);
        }
        // Marquer les joueurs qui ont quitté comme inactifs
        for (const pid of seats) {
          if (!newSeats.includes(pid)) {
            if (!seatData[pid]) seatData[pid] = {};
            seatData[pid].active = false;
          }
        }


        // Mettre à jour seatData pour tous les joueurs
        for (const pid of seats) {
          if (!seatData[pid]) seatData[pid] = {};
          if (isFirstDeal) {
            Object.assign(seatData[pid], {money:0, bet:0, action:'', active:true, folded:false});
          } else {
            // Conserver le stack, réinitialiser uniquement l'état de la main
            Object.assign(seatData[pid], {bet:0, action:'', active:true, folded:false});
          }
        }

        commCards = [null, null, null, null, null];
        amInGame  = true;
        $('g-round').textContent = t('gameStart');

        // Demander les infos des joueurs inconnus
        for (const pid of seats) {
          if (!players[pid]) {
            const req = Proto.encode([[1,0,pid]]);
            send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
          }
        }

        // Re-diffuser l'avatar à chaque début de main (pour les nouveaux connectés)
        try {
          var myAv2 = localStorage.getItem('pth_avatar') || '';
          if (ws && ws.readyState === WebSocket.OPEN && !directWS) {
            ws.send('AVATAR:' + myId + ':' + myAv2);
          }
        } catch(e) {}
        if (isFirstDeal) {
          setTimeout(function(){ renderSeats(); }, 120);
          renderGameWaiting('Partie démarrée ! En attente de la première main...');
        } else {
          // Animer le déplacement du dealer + fade des actions
          if (_prevDealerPid >= 0 && _prevDealerPid !== dealerPid) {
            setTimeout(function(){ animateDealerMove(_prevDealerPid, dealerPid); }, 200);
          }
          fadeOutAllActions();
          renderSeats();
        }
        _prevDealerPid = dealerPid;
        break;
      }

      case T.HandStart: {
        // HandStartMessage: gameId=1, plainCards=2 {card1:1, card2:2}, smallBlind=4, seatStates=5, dealerPlayerId=6
        handNum++;
        $('g-hand').textContent = t('handOf') + handNum;
        $('g-round').textContent = t('preflop');
        gameState = 0; // preflop
        commCards = [null, null, null, null, null];
        pot = 0; collectedPot = 0; highestBet = 0; minRaise = 0;

        // My cards (plainCards sub-message at field 2)
        const pc = sub[2] ? Proto.decode(sub[2][0]) : {};
        myCards = [Proto.u32(pc, 1), Proto.u32(pc, 2)];
        const hsFields = Object.keys(sub).sort((a,b)=>+a-+b).map(f=>f+':'+Proto.u32(sub,+f)).join(' ');

        const sb = Proto.u32(sub, 4);
        smallBlind = sb;
        dealerPid = Proto.u32(sub, 6) || dealerPid;

        // Reset seat data for new hand
        for (const pid of seats) {
          if (seatData[pid]) {
            seatData[pid].bet    = 0;
            seatData[pid].action = '';
            seatData[pid].folded = false;
            seatData[pid].active = true;
            seatData[pid].card1  = null;
            seatData[pid].card2  = null;
          }
        }

        clearTurnNotif();
        renderMyCards();
        renderComm();
        renderSeats();
        setTimeout(function(){ autoScaleTable(); renderSeats(); }, 100);
        setTimeout(animateCardDeal, 200);
        setTimeout(renderPreFlopStrength, 350);
        // Init stats
        var startMon = (seatData[myId]||{}).money || 0;
        if (!_statsInited && startMon > 0) initStats(startMon);
        // Sons + animations deal
        setTimeout(function(){
          notifyCard();
          setTimeout(notifyCard, 120);
          animateDealMyCards();
        }, 250);
        var hs = document.getElementById('hand-strength');
        if (hs) hs.style.display = 'none';
        renderGameWaiting(t('handOf') + ' ' + handNum + ' — Blinds: ' + sb + '/' + (sb*2));
        logAction('══ ' + t('handOf') + ' ' + handNum + ' — Blinds ' + sb + '/' + (sb*2) + ' ══');
        // Show my hole cards in log
        if (myCards[0] != null && myCards[1] != null) {
          logAction(t('myCards') + ' ' + cardName(myCards[0], false) + ' ' + cardName(myCards[1], false));
        }
        break;
      }

      case T.PlayersTurn: {
        // PlayersTurnMessage: gameId=1, playerId=2, gameState=3
        turnPid   = Proto.u32(sub, 2);
        gameState = Proto.u32(sub, 3);
        const rounds = [t('preflop'),t('flop'),t('turn'),t('river'),t('preflop')+' (SB)',t('preflop')+' (BB)'];
        $('g-round').textContent = rounds[gameState] || t('preflop');
        startTurnTimer();
        if (turnPid === myId) {
          renderMyTurnActions();
          setMyTurnActive(true);
          notifyMyTurn();
        } else {
          clearTurnNotif();
          setMyTurnActive(false);
          // isHtml=true : HTML interne sûr, pas du contenu utilisateur
          renderGameWaiting(
            '<span style="font-family:inherit">' + esc(getPlayerName(turnPid)) + '</span>'
            + '<span class="thinking-dots"><span></span><span></span><span></span></span>',
            true);
        }
        break;
      }

      case T.PlayersActionDone: {
        // gameId=1, playerId=2, gameState=3, playerAction=4, totalPlayerBet=5, playerMoney=6, highestSet=7, minimumRaise=8
        const pid    = Proto.u32(sub, 2);
        const action = Proto.u32(sub, 4);
        const bet    = Proto.u32(sub, 5);
        const money  = Proto.u32(sub, 6);
        highestBet   = Proto.u32(sub, 7);
        minRaise     = Proto.u32(sub, 8);
        const aLabels = ['','Fold','Check','Call','Bet','Raise','All-in'];
        const aLabel  = aLabels[action] || '?';
        if (seatData[pid]) {
          seatData[pid].bet    = bet;
          seatData[pid].money  = money;
          seatData[pid].folded = action === 1;
          seatData[pid].action = aLabel;
        }
        pot = 0;
        for (const p of seats) if (seatData[p]) pot += seatData[p].bet;
        pot = collectedPot;
        for (const p2 of seats) if (seatData[p2]) pot += seatData[p2].bet;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        logAction(getPlayerName(pid) + ': ' + aLabel + (bet ? ' ' + bet : ''));
        if (pid === myId) {
          const myMon = (seatData[myId] || {}).money || 0;
          if ($('g-mystack')) $('g-mystack').textContent = myMon > 0 ? myMon + ' ¥' : '';
        }
        renderSeats();
        notifyAction();
        flashActionLabel(pid);
        if (action === 6) animateAllIn(pid); // All-in
        if (bet > 0) {
          setTimeout(function(){ animateChipToPot(pid, bet); }, 80);
          setTimeout(function(){
            animatePot(pot);
            updatePotSize(pot);
          }, 550);
        }
        break;
      }
      case T.DealFlop: {
        // DealFlopCardsMessage: champs selon version proto
        // Essai A : gameId=1, card1=2, card2=3, card3=4 (proto officiel)
        const fA = [Proto.u32(sub,2), Proto.u32(sub,3), Proto.u32(sub,4)];
        // Essai B : sans gameId : card1=1, card2=2, card3=3 (ancienne version)
        const fB = [Proto.u32(sub,1), Proto.u32(sub,2), Proto.u32(sub,3)];
        const allFields = Object.keys(sub).sort((a,b)=>+a-+b);
        const allVals = allFields.map(f => f+'='+Proto.u32(sub,+f)).join(' ');
        // Choisir: si fA[0] correspond à une carte valide (1-52), utiliser A sinon B
        const isValidCard = n => n >= 1 && n <= 52;
        commCards = isValidCard(fA[0]) ? fA : fB;
        const dbg = 'FLOP sub:'+allVals+' →['+commCards.join(',')+']';
        if ($('g-debug')) $('g-debug').textContent = dbg;
        $('g-round').textContent = t('flop');
        gameState = 1;
        // Collect preflop bets into pot
        let flopBets = 0;
        for (const p of seats) if (seatData[p] && seatData[p].bet) { flopBets += seatData[p].bet; seatData[p].bet = 0; }
        collectedPot += flopBets;
        pot = collectedPot;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        const flopStr = commCards.filter(n=>n!=null).map(n=>cardName(n,true)).join(', ');
        renderComm(true); // flip animation
        renderSeats();
        logAction('--- Flop [' + flopStr + '] ---');
        notifyCard(); notifyCard(); notifyCard();
        break;
      }

      case T.DealTurn: {
        // Fix : utiliser sub[2] pour détecter la présence du champ
        const tv = sub[2] !== undefined ? Proto.u32(sub, 2) : Proto.u32(sub, 1);
        commCards.push(tv);
        $('g-round').textContent = t('turn');
        gameState = 2;
        let turnBets = 0;
        for (const p of seats) if (seatData[p] && seatData[p].bet) { turnBets += seatData[p].bet; seatData[p].bet = 0; }
        collectedPot += turnBets;
        pot = collectedPot;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        const tvCard = commCards[3]; const tvName = tvCard != null ? cardName(tvCard, true) : '?';
        logAction('--- ' + t('turn') + ' [' + tvName + '] ---');
        renderComm(true); // flip animation
        notifyCard();
        break;
      }

      case T.DealRiver: {
        // Fix : sub[2] présent ? utiliser field 2 ; sinon field 1
        // rv || fallback est FAUX pour rv=0 (carte 2♦)
        const rv = sub[2] !== undefined ? Proto.u32(sub, 2) : Proto.u32(sub, 1);
        commCards.push(rv);
        $('g-round').textContent = t('river');
        gameState = 3;
        let rvBets = 0;
        for (const p of seats) if (seatData[p] && seatData[p].bet) { rvBets += seatData[p].bet; seatData[p].bet = 0; }
        collectedPot += rvBets;
        pot = collectedPot;
        $('g-pot').textContent = t('pot') + ' ' + pot;
        if ($('g-potbar')) $('g-potbar').textContent = t('pot') + ' ' + pot;
        const rvCard = commCards[4]; const rvName = rvCard != null ? cardName(rvCard, true) : '?';
        logAction('--- ' + t('river') + ' [' + rvName + '] ---');
        renderComm(true, true); // flip animation + dramatic river
        playTone(350, 0.08, 0.08); setTimeout(function(){ notifyCard(); }, 200);

        break;
      }

      case T.AllInShowCards: {
        // Show cards of all-in players during the hand
        // AllInShowCardsMessage: gameId=1, playersAllIn=2 (repeated PlayerAllIn {playerId=1, allInCard1=2, allInCard2=3})
        const allIns = sub[2] || [];
        for (const ab of allIns) {
          const a   = Proto.decode(ab);
          const pid = Proto.u32(a, 1);
          const c1  = Proto.u32(a, 2);
          const c2  = Proto.u32(a, 3);
          if (seatData[pid]) { seatData[pid].card1 = c1; seatData[pid].card2 = c2; }
        }
        renderSeats();
        break;
      }

      case T.EndOfHandShow: {
        const results = sub[2] || [];
        const winners = [];
        for (const rb of results) {
          const r   = Proto.decode(rb);
          const pid = Proto.u32(r, 1);
          const c1  = Proto.u32(r, 2);
          const c2  = Proto.u32(r, 3);
          const won = Proto.u32(r, 5);
          const cash= Proto.u32(r, 6);
          if (seatData[pid]) {
            seatData[pid].money  = cash;
            seatData[pid].card1  = c1;
            seatData[pid].card2  = c2;
            seatData[pid].action = won ? '🏆 +' + won : '';
          }
          if (won > 0) {
            winners.push({ pid, won, cash, c1, c2 });
            // Stats si c'est moi
            if (pid === myId) {
              var prevMon = (_stats.startMoney || 0) + _stats.totalGain;
              var delta2 = won - (prevMon - cash);
              var myPair2 = myCards.map && myCards.map(function(c){ return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 }; });
              recordHand(true, won, myPair2);
            }
            addChat(null, '🏆 ' + getPlayerName(pid) + ' ' + t('wins') + ' ' + won + ' ¥!', 'sys');
            logAction('🏆 ' + getPlayerName(pid) + ' +' + won);
          }
        }
        pot = 0; $('g-pot').textContent = 'Pot: 0';
        if ($('g-potbar')) $('g-potbar').textContent = 'Pot: 0';
        renderSeats();
        // Animations de fin de main
        var iWon = winners.some(function(w){ return w.pid === myId; });
        var bigWin = winners.reduce(function(s,w){ return s + w.won; }, 0) > 500;
        if (iWon) {
          var ov = document.getElementById('g-winner-overlay');
          var cx = ov ? ov.getBoundingClientRect().left + ov.offsetWidth/2 : window.innerWidth/2;
          var cy = ov ? ov.getBoundingClientRect().top  + 80 : window.innerHeight * 0.3;
          burstStars(cx, cy, 16);
          setTimeout(function(){ burstStars(cx - 80, cy + 40, 8); }, 300);
          setTimeout(function(){ burstStars(cx + 80, cy + 40, 8); }, 500);
          if (bigWin) setTimeout(function(){ launchConfetti(70); }, 200);
        }
        // Showdown flip cartes adversaires
        setTimeout(animateShowdownCards, 300);
        // Reset glow pot
        setTimeout(function(){
          var p1 = document.getElementById('g-pot');
          var p2 = document.getElementById('g-potbar');
          if (p1) p1.classList.remove('pot-huge');
          if (p2) p2.classList.remove('pot-huge');
        }, 800);
        showWinnerOverlay(winners);
        renderGameWaiting('Prochaine main...');
        break;
      }

      case T.EndOfHandHide: {
        // playerId=2, moneyWon=3, playerMoney=4
        const pid  = Proto.u32(sub, 2);
        const won  = Proto.u32(sub, 3);
        const cash = Proto.u32(sub, 4);
        if (seatData[pid]) { seatData[pid].money = cash; if(won) seatData[pid].action = '+'+won; }
        if (won > 0) addChat(null, getPlayerName(pid) + ' gagne ' + won + ' jetons', 'sys');
        pot = 0; $('g-pot').textContent = 'Pot: 0';
        renderSeats();
        // Détection élimination (stack à 0)
        for (var _ep of seats) {
          if (_ep !== myId && seatData[_ep] && seatData[_ep].money === 0) {
            setTimeout(function(p){ animatePlayerEliminated(p); }, 600, _ep);
          }
        }
        if (won > 0) showWinnerOverlay([{pid, won, cash, c1:null, c2:null}]);
        break;
      }

      case T.GameAdminChanged: {
        const newAdminId = Proto.u32(sub, 2);
        if (newAdminId !== myId) amGameAdmin = false;
        else amGameAdmin = true;
        break;
      }

      case T.EndOfGame: {
        addChat(null, 'Partie terminée !', 'sys');
        amInGame = false;
        break;
      }
    }
  }

  // ── AFFICHAGE DES TABLES ──
  const MODE_DOT   = {1:'dot-open', 2:'dot-run', 3:'dot-closed'};
  const MODE_LABEL = {1:'En attente', 2:'En cours', 3:'Fermée'};
  const GTYPE      = {1:'Normal', 2:'Inscrits', 3:'Sur invitation', 4:'Classé'};

  function renderGames() {
    // Utiliser entries() pour avoir l'id ET l'objet
    const entries = Object.entries(games);
    entries.sort(([,a],[,b]) => a.mode - b.mode);
    $('g-count').textContent = entries.length + ' table(s)';

    if (entries.length === 0) {
      $('g-list').innerHTML = loaded
        ? '<div class="empty">Aucune table disponible actuellement.</div>'
        : '<div class="empty">Chargement des tables<br><span class="ld"><span>●</span><span>●</span><span>●</span></span></div>';
      return;
    }

    $('g-list').innerHTML = entries.map(([gid, g]) => {
      const dotcls = MODE_DOT[g.mode] || 'dot-closed';
      const label  = MODE_LABEL[g.mode] || '?';
      const type   = GTYPE[g.type] || '';
      const lock   = (g.priv || g.type === 3) ? '🔒 ' : '';
      const joinLabel = ((g.priv || g.type === 3) ? '🔒 ' : '▶ ') + (typeof t === 'function' ? t('joinBtn') || 'Join' : 'Join');
      const watchBtn = g.mode === 2
        ? '<button class="btn-xs btn-watch" onclick="App.spectateGame(' + gid + ')">👁 ' + t('watchBtn') + '</button>'
        : '';
      const joinBtn = g.mode !== 3
        ? '<button class="btn-join" onclick="event.stopPropagation();App.joinGame(' + parseInt(gid) + ')">' + joinLabel + '</button>'
        : '';
      return '<div class="game-row" onclick="App.joinGame(' + parseInt(gid) + ')">'
        + '<div class="game-info">'
        + '<div class="game-name">' + lock + esc(g.name) + '</div>'
        + '<div class="game-meta">'
        + '<span class="game-type">' + type + '</span>'
        + '<span> · </span>'
        + '<span>' + label + '</span>'
        + '</div></div>'
        + '<div style="display:flex;align-items:center;gap:10px">'
        + '<div class="game-count">' + g.players + (g.maxPlayers ? '/'+g.maxPlayers : '') + '</div>'
        + joinBtn + watchBtn
        + '</div></div>';
    }).join('');
  }

  // ── CHAT ──
  function addChat(sender, text, cls='') {
    if (typeof addGameChat === 'function') addGameChat(sender, text, cls);
    // Flash lobby chat button on new message
    var lcp = document.getElementById('lobby-chat-panel');
    var lcb = document.getElementById('lobby-chat-btn');
    if (lcb && (!lcp || lcp.style.display === 'none') && cls !== 'mine') {
      lcb.style.color = 'var(--gold)';
      clearTimeout(window._lobbyChatFlash);
      window._lobbyChatFlash = setTimeout(function(){ lcb.style.color=''; }, 3000);
    }
    const el = $('chat');
    const d  = document.createElement('div');
    d.className = 'msg ' + cls;
    if (sender) {
      d.innerHTML = `<span class="who">${esc(sender)}</span>: <span class="txt">${esc(text)}</span>`;
    } else {
      d.innerHTML = `<span class="txt">${esc(text)}</span>`;
    }
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  // ── API PUBLIQUE ──
  // ─── Card + render helpers ───
  // ─── Card rendering ───
  // Card name for log display
  function cardName(n, isComm) {
    // FIX: encodage unifié 0-indexé (PokerTH envoie 0–51 pour hole et comm cards)
    if (n == null) return '?';
    let si, ri;
    si = Math.floor(n / 13);
    ri = n % 13;
    const suits = isComm ? ['♦','♣','♠','♥'] : ['♣','♠','♥','♦'];
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    return (ranks[ri]||'?') + (suits[si]||'?');
  }

  // PokerTH card encoding:
  //   Hole cards (plainCards):  1-indexed, suits [♣,♠,♥,♦], card 1=2♣ … 52=A♦
  //   Community cards (flop…):  0-indexed, suits [♦,♣,♠,♥], card 0=2♦ … 51=A♥
  function cardToHtml(n, sm, isComm, extraCls) {
    extraCls = extraCls || '';
    const sz = sm ? ' sm' : '';
    if (n === null || n === undefined) return '<div class="pk' + sz + ' back' + extraCls + '"></div>';
    let si, ri;
    if (isComm) {
      si = Math.floor(n / 13);      // 0-indexed suits: ♦=0 ♣=1 ♠=2 ♥=3
      ri = n % 13;
    } else {
      si = Math.floor((n-1) / 13);  // 1-indexed suits: ♣=0 ♠=1 ♥=2 ♦=3
      ri = (n-1) % 13;
    }
    // Protection : si hors limites → dos de carte plutôt que '?'
    if (si < 0 || si > 3 || ri < 0 || ri > 12) return '<div class="pk' + sz + ' back' + extraCls + '"></div>';
    const suits = isComm ? ['♦','♣','♠','♥'] : ['♣','♠','♥','♦'];
    const suit  = suits[si] || '?';
    const rank  = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'][ri] || '?';
    const red   = (isComm ? (si===0||si===3) : (si>=2)) ? ' red' : '';
    return '<div class="pk' + sz + red + extraCls + '"><span class="c-rank">' + rank + '</span><span class="c-suit">' + suit + '</span></div>';
  }


  // ─── My cards ───
  function cardHtml(n, cls, isComm) {
    // FIX: if(!n) traitait 0 comme falsy → carte dos incorrecte ; encodage unifié 0-indexé
    if (n == null) return '<div class="pk '+cls+' back"></div>';
    var si, ri;
    si = Math.floor(n / 13);
    ri = n % 13;
    const suits = isComm ? ['♦','♣','♠','♥'] : ['♣','♠','♥','♦'];
    const rank=['2','3','4','5','6','7','8','9','10','J','Q','K','A'][ri]||'?';
    const red=(isComm?(si===0||si===3):(si>=2))?' red':'';
    return '<div class="pk '+cls+red+'"><span class="c-rank">'+rank+'</span><span class="c-suit">'+suits[si]+'</span></div>';
  }

  function renderMyCards() {
    const c1 = myCards[0] != null ? myCards[0] : null;
    const c2 = myCards[1] != null ? myCards[1] : null;
    // Only update player bar cards (small)
    const pb = document.getElementById('g-myseat-cards');
    if (pb) pb.innerHTML = cardHtml(c1,'md') + cardHtml(c2,'md');
  }



  // ═══════════════════════════════════════════════════════════
  // ANIMATIONS — Distribution, jetons, stats
  // ═══════════════════════════════════════════════════════════

  // ── Distribution des cartes ──
  function animateCardDeal() {
    if (!_lastPixPos.length) return;
    var cx = _potCenter.x, cy = _potCenter.y;
    if (!cx) return;
    var n = _lastPixPos.length; // nombre de joueurs
    var delay = 0;
    var STEP = 180; // ms entre chaque carte
    // 2 cartes par joueur, dealer en premier
    for (var card = 0; card < 2; card++) {
      for (var i = 0; i < n; i++) {
        (function(pos, d, isMe) {
          setTimeout(function() {
            var el = document.createElement('div');
            el.className = 'fly-card' + (isMe ? ' mine' : '');
            el.style.left = (cx - 13) + 'px';
            el.style.top  = (cy - 18) + 'px';
            el.style.transform = 'rotate(' + (Math.random()*16-8) + 'deg) scale(0.7)';
            el.style.opacity = '1';
            document.body.appendChild(el);
            requestAnimationFrame(function() {
              el.style.left = (pos.left - 13) + 'px';
              el.style.top  = (pos.top  - 18) + 'px';
              el.style.transform = 'rotate(0deg) scale(1)';
            });
            setTimeout(function() {
              el.style.opacity = '0';
              setTimeout(function() { el.remove(); }, 200);
            }, 380);
          }, d);
        })(_lastPixPos[i], delay, _lastPixPos[i] === _lastPixPos[0]);
        delay += STEP;
      }
    }
  }

  // ── Jeton qui glisse vers le pot ──
  function animateChipToPot(pid, amount) {
    var myIdx = seats.indexOf(myId);
    var rotated2 = myIdx >= 0 ? seats.slice(myIdx).concat(seats.slice(0,myIdx)) : seats;
    var seatIdx = rotated2.indexOf(pid);
    if (seatIdx < 0 || !_lastPixPos[seatIdx]) return;
    var from = _lastPixPos[seatIdx];
    var to   = _potCenter;
    if (!to.x) return;
    var el = document.createElement('div');
    el.className = 'fly-chip';
    el.textContent = amount > 999 ? (amount/1000).toFixed(1)+'k' : amount;
    el.style.left = (from.left - 10) + 'px';
    el.style.top  = (from.top  - 10) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(function() {
      el.style.left = (to.x - 10) + 'px';
      el.style.top  = (to.y - 10) + 'px';
      el.style.transform = 'scale(0.5)';
      el.style.opacity = '0';
    });
    setTimeout(function() { el.remove(); }, 600);
  }

  // ── Flip 3D des cartes communes ──
  function flipCommCards(startIdx, endIdx) {
    var els = document.querySelectorAll('#g-comm .pk');
    for (var i = startIdx; i <= endIdx && i < els.length; i++) {
      (function(el2, delay) {
        setTimeout(function() {
          el2.classList.remove('flip-reveal');
          void el2.offsetWidth; // force reflow
          el2.classList.add('flip-reveal');
        }, delay);
      })(els[i], (i - startIdx) * 120);
    }
  }

  // ── Panneau statistiques ──
  var _statsOpen = false;
  function toggleStats() {
    _statsOpen = !_statsOpen;
    var el = document.getElementById('stats-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'stats-overlay';
      document.body.appendChild(el);
    }
    el.style.display = _statsOpen ? '' : 'none';
    if (_statsOpen) renderStats();
  }

  function renderStats() {
    var el = document.getElementById('stats-overlay');
    if (!el) return;
    var s = _stats;
    var gain = s.totalGain;
    var gainCls = gain > 0 ? 'pos' : gain < 0 ? 'neg' : '';
    var wr = s.handsPlayed > 0 ? Math.round(s.handsWon/s.handsPlayed*100) : 0;
    var hist = s.history.slice().reverse().slice(0,5);
    var histHtml = hist.length ? hist.map(function(h2) {
      var dcls = h2.delta > 0 ? 'pos' : h2.delta < 0 ? 'neg' : '';
      return '<div class="hand-hist-item">'
        + '<div style="display:flex;justify-content:space-between">'
        + '<span style="color:var(--gold-dim);font-size:0.55rem">Main #'+h2.num+'</span>'
        + '<span class="hand-hist-result '+dcls+'">'+(h2.delta>0?'+':'')+h2.delta+' ¥</span>'
        + '</div>'
        + '<div class="hand-hist-cards">'
        + (h2.cards ? h2.cards.map(function(c){ return '<span style="background:#fff;color:'+(c.red?'#c0392b':'#111')+';border-radius:2px;padding:1px 3px;font-size:0.6rem;font-weight:700">'+c.r+c.s+'</span>'; }).join('') : '')
        + '</div>'
        + '</div>';
    }).join('') : '<div style="color:var(--text);font-size:0.62rem">Aucune main jouée</div>';

    var isFr = (_lang === 'fr');
    el.innerHTML = '<div class="stats-header">'
      + '<span>📊 ' + (isFr ? 'Session' : 'Session') + '</span>'
      + '<button onclick="toggleStats()" style="background:none;border:none;color:var(--text);cursor:pointer;font-size:0.9rem">✕</button>'
      + '</div>'
      + '<div class="stats-body">'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Mains jouées':'Hands played')+'</span><span class="stat-val">'+s.handsPlayed+'</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Victoires':'Wins')+'</span><span class="stat-val pos">'+s.handsWon+'</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Taux de victoire':'Win rate')+'</span><span class="stat-val">'+wr+'%</span></div>'
      + '<hr class="stat-divider">'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Gain/Perte net':'Net gain/loss')+'</span><span class="stat-val '+gainCls+'">'+(gain>0?'+':'')+gain+' ¥</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Meilleur gain':'Best win')+'</span><span class="stat-val pos">+'+s.bigWin+' ¥</span></div>'
      + '<div class="stat-row"><span class="stat-label">'+(isFr?'Pire perte':'Worst loss')+'</span><span class="stat-val neg">'+s.bigLoss+' ¥</span></div>'
      + '<hr class="stat-divider">'
      + '<div style="font-size:0.58rem;color:var(--gold-dim);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">'+(isFr?'Dernières mains':'Recent hands')+'</div>'
      + histHtml
      + '</div>';
  }

  // Initialiser les stats au début d'une partie
  function initStats(startMoney) {
    if (_statsInited) return;
    _stats.startMoney = startMoney;
    _stats.peakMoney  = startMoney;
    _statsInited = true;
  }

  // Enregistrer le résultat d'une main
  function recordHand(won, delta, myCardsPair) {
    _stats.handsPlayed++;
    if (won) _stats.handsWon++;
    _stats.totalGain += delta;
    if (delta > _stats.bigWin) _stats.bigWin = delta;
    if (delta < _stats.bigLoss) _stats.bigLoss = delta;
    _stats.history.push({ num: handNum, delta: delta, won: won,
      cards: myCardsPair });
    if (_stats.history.length > 20) _stats.history.shift();
    if (_statsOpen) renderStats();
  }

  // ── Probabilité de gain (Monte Carlo simplifié) ──
  function calcWinProb() {
    if (!myCards[0] || !myCards[1]) return -1;
    var comm = commCards.filter(function(c){ return c != null; });
    if (comm.length < 3) return -1; // seulement après le flop
    var known = [myCards[0], myCards[1]].concat(comm);
    // Deck restant
    var deck = [];
    for (var i = 0; i < 52; i++) { if (known.indexOf(i) < 0) deck.push(i); }
    var needed = 5 - comm.length;
    var nOpp = Math.max(1, seats.filter(function(p){ return p !== myId && seatData[p] && !seatData[p].folded; }).length);
    var wins = 0, total = 200;
    for (var t = 0; t < total; t++) {
      // Shuffle deck (Fisher-Yates partiel)
      var d = deck.slice();
      for (var i2 = d.length-1; i2 > 0; i2--) {
        var j = Math.floor(Math.random()*(i2+1));
        var tmp = d[i2]; d[i2] = d[j]; d[j] = tmp;
      }
      // Cartes communes restantes
      var extraComm = d.slice(0, needed);
      var fullComm = comm.concat(extraComm);
      var pos = needed;
      // Évaluer ma main
      var myScore = evaluateBestHand([myCards[0], myCards[1]], fullComm);
      // Évaluer les adversaires
      var iWin = true;
      for (var o = 0; o < nOpp; o++) {
        var oc1 = d[pos++], oc2 = d[pos++];
        if (oc1 === undefined || oc2 === undefined) { iWin = false; break; }
        var oppScore = evaluateBestHand([oc1, oc2], fullComm);
        if (oppScore && myScore && oppScore.rank > myScore.rank) { iWin = false; break; }
        if (oppScore && myScore && oppScore.rank === myScore.rank) {
          if ((oppScore.high||0) > (myScore.high||0)) { iWin = false; break; }
        }
      }
      if (iWin) wins++;
    }
    return Math.round(wins / total * 100);
  }

  // ─── Force de la main ───
  function renderPreFlopStrength() {
    var el = document.getElementById('hand-strength');
    if (!el) return;
    if (commCards.filter(function(c){ return c!=null; }).length > 0) return;
    if (myCards[0] == null || myCards[1] == null) { el.style.display='none'; return; }
    var res = evaluatePreFlopHand(myCards[0], myCards[1]);
    if (!res) { el.style.display='none'; return; }
    var label = (_lang==='fr' ? res.fr : res.en);
    var stars = res.stars >= 0
      ? ' ' + ('★'.repeat(res.stars+1) + '☆☆').slice(0,3)
      : '';
    el.textContent = label + stars;
    var cols = ['#aaa','#7ec8e3','#a8d8a8','#f0c040','#e74c3c'];
    el.style.color = cols[Math.max(0, res.stars+1)] || '#aaa';
    el.style.display = 'block';
  }

  // ─── Force de la main ───
  function renderHandStrength() {
    var el = document.getElementById('hand-strength');
    if (!el) return;
    var validComm = commCards.filter(function(c){ return c != null; });
    if (myCards[0] == null || myCards[1] == null || validComm.length === 0) {
      el.style.display = 'none';
      return;
    }
    // Normaliser les hole cards (1-indexed) vers l'encodage canonique (0-indexed)
    var holeNorm = [myCards[0], myCards[1]]
      .filter(function(c){ return c != null; })
      .map(normalizeHoleCard)
      .filter(function(c){ return c != null; });
    var result = evaluateBestHand(holeNorm, validComm);
    if (!result) { el.style.display = 'none'; return; }
    el.textContent = _lang === 'fr' ? result.fr : result.en;
    el.style.display = 'block';
    var colors = ['#aaa','#aaa','#7ec8e3','#7ec8e3','#a8d8a8','#6dbe6d','#f0c040','#f09030','#e07020','#e74c3c'];
    el.style.color = colors[result.r] || 'var(--gold)';
    el.style.borderColor = (colors[result.r]||'var(--gold)').replace(')',',0.25)').replace('rgb','rgba');
  }

  // ─── Community cards ───
  function renderComm(animate, isRiver) {
    const el = $('g-comm');
    let h = '';
    for (let i=0; i<5; i++) {
      const v = commCards[i];
      let cls = (animate && v != null) ? ' pk-flip' : '';
      // River (i=4) — révélation plus lente et dramatique
      if (isRiver && i === 4 && v != null) cls = ' pk-flip pk-river';
      h += cardToHtml(v != null ? v : null, false, true, cls);
    }
    el.innerHTML = h;
  
    renderHandStrength();
  }

  // ─── Seat positions (% of oval) — 10 max, starting from bottom going clockwise ───
  const SEAT_POS_10 = [
    [90,47],[79,76],[54,94],[24,82],[5,62],[5,38],[24,18],[54,5],[79,22],[90,47]
  ];

  // Hardcoded seat positions (% within oval): index 0 = ME (bottom center)
  // Seat positions OUTSIDE the oval (% of oval size, can be negative or >100)
  // Index 0 = ME always at bottom-center outside
  // Others = opponents clockwise from top-left
  const SEAT_LAYOUTS_DESK = {
    // Ellipse rx=55 ry=65 mine=75
     2: [[117, 45], [-23, 45]],
     3: [[117, 45], [ 10, 93], [ 10, -3]],
     4: [[117, 45], [ 42,100], [-23, 45], [ 42,-10]],
     5: [[117, 45], [ 62, 97], [-11, 77], [-11, 13], [ 62, -7]],
     6: [[117, 45], [ 74, 93], [ 10, 93], [-23, 45], [ 10, -3], [ 74, -3]],
     7: [[117, 45], [ 83, 88], [ 28, 99], [-17, 69], [-17, 21], [ 28, -9], [ 83,  2]],
     8: [[117, 45], [ 88, 84], [ 42,100], [ -4, 84], [-23, 45], [ -4,  6], [ 42,-10], [ 88,  6]],
     9: [[117, 45], [ 92, 80], [ 53, 99], [ 10, 93], [-19, 64], [-19, 26], [ 10, -3], [ 53, -9], [ 92, 10]],
    10: [[117, 45], [ 95, 77], [ 62, 97], [ 22, 97], [-11, 77], [-23, 45], [-11, 13], [ 22, -7], [ 62, -7], [ 95, 13]],
  };

  const SEAT_LAYOUTS_MOB = {
    // Mobile: rx=42 ry=45, mine=50 — fits in felt-oval
     2: [[ 92,45], [ -3,45]],
     3: [[ 92,45], [ 20,81], [ 20, 9]],
     4: [[ 92,45], [ 42,87], [ -3,45], [ 42, 3]],
     5: [[ 92,45], [ 56,85], [  6,70], [  6,20], [ 56, 5]],
     6: [[ 92,45], [ 64,81], [ 20,81], [ -3,45], [ 20, 9], [ 64, 9]],
     7: [[ 92,45], [ 70,78], [ 32,86], [  1,63], [  1,27], [ 32, 4], [ 70,12]],
     8: [[ 92,45], [ 74,75], [ 42,87], [ 10,75], [ -3,45], [ 10,15], [ 42, 3], [ 74,15]],
     9: [[ 92,45], [ 76,72], [ 50,86], [ 20,81], [  0,59], [  0,31], [ 20, 9], [ 50, 4], [ 76,18]],
    10: [[ 92,45], [ 78,70], [ 56,85], [ 28,85], [  6,70], [ -3,45], [  6,20], [ 28, 5], [ 56, 5], [ 78,20]],
  };
  function getSeatPositions(n) {
    var mob = window.innerWidth < 640;
    var layouts = mob ? SEAT_LAYOUTS_MOB : SEAT_LAYOUTS_DESK;
    return layouts[n] || layouts[10].slice(0, n);
  }

  // ─── Jeton de blind SVG (casino chip style) ───
  function chipSvg(label, bg, fg, edge) {
    var notches = '';
    for (var i = 0; i < 8; i++) {
      var rot = i * 45;
      notches += '<rect x="13" y="0.5" width="6" height="7" rx="2" fill="white"'
               + ' transform="rotate(' + rot + ' 16 16)" opacity="0.9"/>';
    }
    return '<svg class="blind-chip" viewBox="0 0 32 32" width="20" height="20" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="16" cy="16" r="15.5" fill="' + (edge||'#000') + '"/>'
      + '<circle cx="16" cy="16" r="13" fill="' + bg + '"/>'
      + notches
      + '<circle cx="16" cy="16" r="9" fill="' + bg + '" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>'
      + '<text x="16" y="16.5" text-anchor="middle" dominant-baseline="central"'
      + ' fill="' + fg + '" font-size="7" font-weight="900"'
      + ' font-family="Arial Black,Arial,sans-serif">' + label + '</text>'
      + '</svg>';
  }

  function dealerChipSvg() {
    var notches = '';
    for (var i = 0; i < 8; i++) {
      notches += '<rect x="13" y="0.5" width="6" height="7" rx="2" fill="#c8a850"'
               + ' transform="rotate(' + (i*45) + ' 16 16)" opacity="0.9"/>';
    }
    return '<svg class="dealer-chip" viewBox="0 0 32 32" width="20" height="20" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="16" cy="16" r="15.5" fill="#3d2b00"/>'
      + '<circle cx="16" cy="16" r="13" fill="#1a1a1a"/>'
      + notches
      + '<circle cx="16" cy="16" r="9" fill="#1a1a1a" stroke="#c8a850" stroke-width="1.5"/>'
      + '<text x="16" y="16.5" text-anchor="middle" dominant-baseline="central"'
      + ' fill="#ffd700" font-size="9" font-weight="900"'
      + ' font-family="Arial Black,Arial,sans-serif">D</text>'
      + '</svg>';
  }

  function getPlayerName(pid) { return players[pid] || (pid === myId ? myName : '#'+pid); }

  // ══ TURN TIMER ══
  function _timerSvg(secs, total) {
    var r = 20, cx = 25, cy = 25;
    var circ = 2 * Math.PI * r;
    var frac = Math.max(0, secs / (total || 30));
    var offset = (circ * (1 - frac)).toFixed(1);
    var urgent = secs <= 8;
    var col = urgent ? '#e74c3c' : '#f0c040';
    // Arc dessiné dans le sens des aiguilles d'une montre (rotation -90°)
    return '<svg class="seat-timer" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"'
      + ' style="transform:rotate(-90deg);overflow:visible">'
      // Fond de piste (anneau gris foncé)
      + '<circle class="bg" cx="'+cx+'" cy="'+cy+'" r="'+r+'"/>'
      // Arc de progression
      + '<circle class="arc" cx="'+cx+'" cy="'+cy+'" r="'+r+'"'
      + ' stroke="'+col+'"'
      + ' stroke-dasharray="'+circ.toFixed(1)+'"'
      + ' stroke-dashoffset="'+offset+'"/>'
      // Disque central opaque (masque l'initiale en dessous)
      + '<circle class="center-bg" cx="'+cx+'" cy="'+cy+'" r="13"/>'
      // Chiffre : contre-rotation pour rester droit
      + '<text x="'+cx+'" y="'+cy+'"'
      + ' fill="'+col+'"'
      + ' style="transform:rotate(90deg) translate(0px,-50px);font-size:11px;font-family:monospace;font-weight:900;text-anchor:middle;dominant-baseline:middle">'
      + (secs > 0 ? secs : '') + '</text>'
      + '</svg>';
  }

  function _updateTimer() {
    _timerSec = Math.max(0, _timerSec - 1);
    // Update SVG arcs in place — no full re-render
    var urgent = _timerSec <= 8;
    var col = urgent ? '#e74c3c' : '#f0c040';
    var r = 22, circ = 2 * Math.PI * r;
    var offset = (circ * (1 - _timerSec / (_timerTot || 30))).toFixed(1);
    document.querySelectorAll('.seat-timer .arc').forEach(function(el) {
      el.setAttribute('stroke', col);
      el.setAttribute('stroke-dashoffset', offset);
    });
    document.querySelectorAll('.seat-timer text').forEach(function(el) {
      el.setAttribute('fill', col);
      el.textContent = _timerSec > 0 ? _timerSec + 's' : '';
      el.style.transform = 'rotate(90deg) translate(0,-50px)';
    });
    // Player bar counter
    var pb = document.getElementById('pb-timer');
    if (pb && turnPid === myId) {
      pb.textContent = _timerSec > 0 ? _timerSec + 's' : '';
      pb.style.color = col;
    }
    // Flash my-zone border
    var mz = document.querySelector('.my-zone');
    if (mz && turnPid === myId) mz.style.borderTopColor = urgent ? '#e74c3c' : '';
    setUrgentMode(urgent && turnPid === myId);
    if (_timerSec <= 0) { clearInterval(_timerID); setUrgentMode(false); }
  }

  function startTurnTimer() {
    clearInterval(_timerID);
    _timerSec = _timerTot = (gameTimeout > 0 ? gameTimeout : 15);
    renderSeats();  // Draws the SVG
    _timerID = setInterval(_updateTimer, 1000);
  }

  function stopTurnTimer() {
    clearInterval(_timerID);
    _timerID = null;
    _timerSec = 0;
    // Clear timers from DOM
    document.querySelectorAll('.seat-timer').forEach(function(el){ el.remove(); });
    var pb = document.getElementById('pb-timer');
    if (pb) pb.textContent = '';
    var mz = document.querySelector('.my-zone');
    if (mz) mz.style.borderTopColor = '';
    setUrgentMode(false);
  }

  // ── Détection bot vs humain (dans la closure = accès à players/myId/myName) ──
  function isBot(pid) {
    var name = (players[pid] || '').toLowerCase();
    return name.startsWith('computer') || name.startsWith('bot') || name === 'bot';
  }
  function getPlayerInitial(pid) {
    if (pid === myId) {
      try { var av = localStorage.getItem('pth_avatar'); if (av) return av; } catch(e) {}
      return myName.charAt(0).toUpperCase();
    }
    if (isBot(pid)) return '🤖';
    // Avatar reçu des autres joueurs via proxy
    if (_playerAvatars[pid]) return _playerAvatars[pid];
    var name = players[pid] || '';
    return name.charAt(0).toUpperCase() || '?';
  }
  function getPlayerTypeBadge(pid) {
    return ''; // Badges supprimés : 🤖 identifie les bots, pas de 👤 pour les humains
  }

  function renderSeats() {
    const el = $('g-seats');
    if (!seats.length) { el.innerHTML = ''; return; }
    // Filtrer les joueurs actifs (ceux qui jouent cette main)
    const activeSeats = seats.filter(function(pid) {
      return !seatData[pid] || seatData[pid].active !== false;
    });
    const n = activeSeats.length;
    const myIdx = activeSeats.indexOf(myId);
    const rotated = myIdx >= 0 ? [...activeSeats.slice(myIdx), ...activeSeats.slice(0, myIdx)] : activeSeats;
    // Position seats using actual pixel coords from getBoundingClientRect
    const oval = document.querySelector('.felt-oval');
    const zone = document.getElementById('g-table-zone');
    if (!oval || !zone) return;
    const oRect = oval.getBoundingClientRect();
    const zRect = zone.getBoundingClientRect();
    const oCX  = oRect.left - zRect.left + oRect.width  / 2;
    const oCY  = oRect.top  - zRect.top  + oRect.height / 2;
    const isMob = window.innerWidth < 640;
    // On mobile: use larger vertical spread to prevent lateral player overlap
    // rx must clear oval half-width + 8px border + ~10px seat radius
    const borderClear = isMob ? 20 : 24; // px to add beyond oval half-size
    const rxRaw = oRect.width  / 2 + borderClear + (isMob ? oRect.width*0.06 : oRect.width*0.16);
    // ryRaw : distance verticale des joueurs haut/bas (réduite pour rapprocher de l'ovale)
    const ryRaw = oRect.height / 2 + borderClear + (isMob ? oRect.height*0.30 : oRect.height*0.18);
    // ryMeRaw : distance du joueur local en bas (réduite significativement)
    const ryMeRaw = oRect.height / 2 + borderClear + (isMob ? oRect.height*0.38 : oRect.height*0.22);
    // Clamp to zone boundaries
    const margin = isMob ? 24 : 36;
    const rxPx = Math.min(rxRaw, Math.min(oCX, zRect.width - oCX) - margin);
    const ryPx = Math.min(ryRaw, Math.min(oCY - margin, zRect.height - oCY - margin));
    const ryMe = Math.min(ryMeRaw, zRect.height - oCY - margin);
    const stepA = 360 / n;
    const pixPos = rotated.map(function(_, i) {
      var ang = (90 - i * stepA) * Math.PI / 180;
      var ry  = i === 0 ? ryMe : ryPx;
      return { top: oCY + ry*Math.sin(ang), left: oCX + rxPx*Math.cos(ang) };
    });
    // ── Calcul SB / BB à partir du dealer ──
    const dealerIdx = seats.indexOf(dealerPid);
    const sbPid = dealerIdx >= 0 && seats.length > 1
      ? seats[(dealerIdx + 1) % seats.length] : -1;
    const bbPid = dealerIdx >= 0 && seats.length > 2
      ? seats[(dealerIdx + 2) % seats.length]
      : (seats.length === 2 ? seats[dealerIdx] : -1); // heads-up: dealer = SB

    // Update player-bar
    const mySd = seatData[myId] || {};
    const pbAv   = document.getElementById('g-myseat-av');
    const pbName = document.getElementById('g-myseat-name');
    const pbMon  = document.getElementById('g-myseat-money');
    const pbAct  = document.getElementById('g-myseat-action');
    const pbBar  = document.querySelector('.player-bar');
    if (pbAv) {
      var _av = ''; try { _av = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
      pbAv.textContent = _av || myName.charAt(0).toUpperCase();
      // Garder le vert pour moi (pas de couleur palette)
    }
    // Chips SVG dans la player bar
    const myBlindChip = myId === sbPid
      ? chipSvg('SB','#1565c0','#fff','#0a3d7a')
      : (myId === bbPid ? chipSvg('BB','#b71c1c','#fff','#6d0c0c') : '');
    const myDealerBadge = myId === dealerPid ? dealerChipSvg().replace('class="dealer-chip"','style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5));vertical-align:middle"') : '';
    if (pbName) {
      pbName.textContent = myName;
      // Ajouter les badges après le texte via innerHTML (chips SVG + D badge)
      pbName.innerHTML = myName
        + (myDealerBadge ? '<span style="margin-left:4px;vertical-align:middle">' + myDealerBadge + '</span>' : '')
        + (myBlindChip   ? '<span style="margin-left:4px;vertical-align:middle;display:inline-block;position:relative;top:-1px">' + myBlindChip.replace('class="blind-chip"','style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.4));vertical-align:middle"') + '</span>' : '');
    }
    if (pbMon)  pbMon.textContent  = mySd.money != null ? mySd.money + ' ¥' : '—';
    if (pbAct)  pbAct.textContent  = mySd.action || '';
    if (pbBar)  pbBar.classList.toggle('pb-active', myId === turnPid);

    let h = '';
    rotated.forEach((pid, i) => {
      const px = pixPos[i];
      const isMe = pid === myId;
      const sd = seatData[pid] || {};
      const isDealer = pid === dealerPid;
      const isActive = pid === turnPid;
      const cls = ['seat', isMe?'me':'', isDealer?'dealer':'', isActive?'active':'', sd.folded?'folded':''].filter(Boolean).join(' ');
      const initial    = getPlayerInitial(pid);
      const typeBadge  = getPlayerTypeBadge(pid);
      var _hasEmojiAv = isMe
        ? (function(){ try { var av = localStorage.getItem('pth_avatar'); return !!av; } catch(e){ return false; } })()
        : !!_playerAvatars[pid];
      const avatarType = isMe
        ? (_hasEmojiAv ? ' emoji-av' : '')
        : (isBot(pid) ? ' is-bot' : (_hasEmojiAv ? ' emoji-av is-human' : ' is-human'));
      const moneyStr = sd.money != null && sd.money >= 0 ? sd.money + ' ¥' : '—';
      // Cartes sous le siège : uniquement les adversaires au showdown
      // (mes propres cartes sont déjà visibles dans la player-bar en bas)
      let cardStr = '';
      if (!isMe && sd.card1 != null && sd.card2 != null) {
        cardStr = '<div style="display:flex;gap:2px;margin-top:1px">'
          + cardHtml(sd.card1,'xsm') + cardHtml(sd.card2,'xsm') + '</div>';
      }
      h += '<div class="' + cls + '" style="position:absolute;top:' + px.top.toFixed(1) + 'px;left:' + px.left.toFixed(1) + 'px;transform:translate(-50%,-50%)">';
      const isSB = pid === sbPid;
      const isBB = pid === bbPid;
      let blindBadge = '';
      if (isSB) blindBadge = chipSvg('SB','#1565c0','#fff','#0a3d7a');
      else if (isBB) blindBadge = chipSvg('BB','#b71c1c','#fff','#6d0c0c');
      const timerSvg = isActive ? _timerSvg(_timerSec, _timerTot) : '';
      const avatarCls = 'seat-avatar' + (isActive ? ' timing' : '') + avatarType;
      // Couleur unique par joueur (basée sur pid)
      const aColor = isMe ? null : getAvatarColor(pid);
      const avatarStyle = aColor
        ? 'position:relative;background:' + aColor.bg + ';border-color:' + aColor.border + ';color:' + aColor.text + ';box-shadow:0 0 0 2px ' + aColor.border + '44'
        : 'position:relative';
      const dealerChip = isDealer ? dealerChipSvg() : '';
      h += '<div class="' + avatarCls + '" style="' + avatarStyle + '">'
        + '<span class="seat-initial">' + initial + '</span>'
        + timerSvg
        + blindBadge
        + dealerChip
        + typeBadge
        + '</div>';
      h += '<div class="seat-name">' + esc(isMe ? myName : getPlayerName(pid)) + '</div>';
      h += '<div class="seat-money">' + moneyStr + '</div>';
      if (sd.bet) h += '<div class="seat-bet">' + sd.bet + '</div>';
      if (sd.action) h += '<div class="seat-action-label">' + esc(sd.action) + '</div>';
      h += cardStr;
      h += '</div>';
    });
    el.innerHTML = h;
    _lastPixPos = pixPos;
    var _ov2 = document.querySelector('.felt-oval');
    if (_ov2) { var _or2 = _ov2.getBoundingClientRect();
      _potCenter = { x: _or2.left + _or2.width/2, y: _or2.top + _or2.height/2 }; }
    requestAnimationFrame(function() {
      autoScaleTable();
      setTimeout(autoScaleTable, 150);
    });
  }

  function renderGameWaiting(msg, isHtml) {
    // isHtml=true : msg contient du HTML interne sûr (généré par notre code)
    $('g-actions').innerHTML = '<div class="waiting-msg">' + (isHtml ? msg : esc(msg)) + '</div>';
    updateBottomLayout();
  }

  function updateBottomLayout() {
    var pb = document.querySelector('.player-bar');
    var mz = document.querySelector('.my-zone');
    if (pb && mz) {
      var pbH = pb.offsetHeight || 52;
      mz.style.bottom = pbH + 'px';
    }
  }

  // Track action history
  const actionLog = [];
  function logAction(txt) {
    actionLog.push(txt);
    if (actionLog.length > 50) actionLog.shift();
    const el = document.getElementById('g-log-body');
    if (el) el.innerHTML = actionLog.slice().reverse().map(function(l){ return '<div class="log-line">'+esc(l)+'</div>'; }).join('');
  }
  function setPct(v) {
    const el = document.getElementById('raise-amt');
    if (!el) return;
    el.value = v;
    if (window.innerWidth < 640) {
      // Mobile : appliquer directement, pas de clavier
      App.doRaise();
    } else {
      el.focus(); // Desktop : focus pour permettre l'ajustement
    }
  }
  window.setPct = setPct;
  // Exposer pour les animations + fonctions globales
  Object.defineProperty(window, 'seats',       {get: function(){ return seats; }});
  Object.defineProperty(window, 'seatData',    {get: function(){ return seatData; }});
  Object.defineProperty(window, 'myId',        {get: function(){ return myId; }});
  Object.defineProperty(window, 'players',     {get: function(){ return players; }});
  Object.defineProperty(window, '_ipBlockUntil',{
    get: function(){ return _ipBlockUntil; },
    set: function(v){ _ipBlockUntil = v; }
  });
  // Exposer pour les fonctions globales (avatar, etc.)
  // ── Notification + titre dynamique quand c'est mon tour ──
  var _origTitle = 'PokerTH Web';
  var _titleBlinkID = null;

  function notifyMyTurn() {
    var msg = _lang === 'fr' ? '⚡ TON TOUR !' : '⚡ YOUR TURN!';
    var sub = _lang === 'fr' ? 'C\'est à toi de jouer sur PokerTH' : 'It\'s your move on PokerTH';
    // Notification navigateur (si onglet en arrière-plan)
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(msg, { body: sub, icon: '/favicon.ico', tag: 'pokerth-turn', silent: false }); } catch(e) {}
    }
    // Titre d'onglet dynamique + clignotement
    clearInterval(_titleBlinkID);
    var blink = true;
    document.title = msg + ' — PokerTH';
    _titleBlinkID = setInterval(function() {
      document.title = blink ? (msg + ' — PokerTH') : _origTitle;
      blink = !blink;
    }, 900);
    // Arrêter quand l'onglet est de nouveau actif
    document.addEventListener('visibilitychange', function handler() {
      if (!document.hidden) {
        clearInterval(_titleBlinkID);
        document.title = _origTitle;
        document.removeEventListener('visibilitychange', handler);
      }
    });
  }

  function clearTurnNotif() {
    clearInterval(_titleBlinkID);
    document.title = _origTitle;
  }

  window._renderSeats = function() { if (seats.length) renderSeats(); };
  window.toggleStats  = toggleStats;
  window._toggleStats = toggleStats;
  window._broadcastMyAvatar = function(emoji) {
    if (ws && ws.readyState === WebSocket.OPEN && !directWS && myId) {
      ws.send('AVATAR:' + myId + ':' + (emoji || ''));
    }
  };

  function renderMyTurnActions() {
    const myMoney = (seatData[myId] || {}).money || 0;
    const myBet   = (seatData[myId] || {}).bet || 0;
    const toCall  = Math.max(0, highestBet - myBet);
    const canCheck = toCall === 0;
    const minBet  = minRaise > 0 ? minRaise : Math.max(highestBet > 0 ? highestBet : smallBlind * 2, smallBlind * 2);
    const p33  = Math.min(myMoney, Math.max(minBet, Math.round(pot * 0.33)));
    const p50  = Math.min(myMoney, Math.max(minBet, Math.round(pot * 0.5)));
    const p100 = Math.min(myMoney, Math.max(minBet, pot));
    // Pot odds : toCall / (pot + toCall) * 100
    var potOdds = '';
    if (!canCheck && toCall > 0 && pot + toCall > 0) {
      var oddsP = Math.round(toCall / (pot + toCall) * 100);
      potOdds = ' <span style="font-size:0.7em;opacity:0.8">(' + oddsP + '%)</span>';
    }
    const callLabel = canCheck ? 'Check' : ('Call <b>' + toCall + '</b>' + potOdds);
    const callAction = canCheck ? 'App.doAction(2,0)' : ('App.doAction(3,' + toCall + ')');
    const callClass  = canCheck ? 'btn-check' : 'btn-call';
    const raiseLabel = highestBet > 0 ? t('raise') : t('bet');

    // Peut relancer : doit avoir plus que le montant du call ET >= mise min
    const canRaise = myMoney > toCall && myMoney >= minBet;
    const da = canRaise ? '' : ' disabled'; // disabled attribute
    const allInOnly = myMoney <= toCall;    // ne peut que call ou all-in

    const h = '<div class="action-grid">'
      + '<div class="action-top-row">'
      +   '<button class="btn-action btn-fold" onclick="App.doAction(1,0)" title="Fold (F)">' + t('fold') + '</button>'
      +   '<button class="btn-action ' + callClass + '" onclick="' + callAction + '" title="Call/Check (C)">' + callLabel + '</button>'
      + '</div>'
      + '<div class="pct-row">'
      +   '<button class="btn-pct"' + da + ' onclick="setPct(' + p33  + ')">33%</button>'
      +   '<button class="btn-pct"' + da + ' onclick="setPct(' + p50  + ')">50%</button>'
      +   '<button class="btn-pct"' + da + ' onclick="setPct(' + p100 + ')">100%</button>'
      + '</div>'
      + '<div class="raise-row">'
      +   '<input class="raise-input" id="raise-amt" type="number" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '"' + da
      +   (window.innerWidth < 640 ? ' readonly style="cursor:default;opacity:0.7"' : '') + '>'
      +   '<button class="btn-action btn-raise raise-btn"' + da + ' onclick="App.doRaise()" title="Raise (R)">' + raiseLabel + '</button>'
      + '</div>'
      + '<button class="btn-action btn-allin" onclick="App.doAction(6,' + myMoney + ')" title="All-In (A)">All-In <b>' + myMoney + '</b></button>'
      + '</div>';

    $('g-actions').innerHTML = h;
    if (typeof notifyMyTurn === 'function') notifyMyTurn();
    // Tell server we're alive (avoid timeout)
    const rtm = Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]]);
    send(rtm);
  }

  // ─── Patch App with action methods ───

  function doAction(action, bet) {
    setMyTurnActive(false);
    send(MSG.buildMyAction(gId, handNum, gameState, action, bet));
    $('g-actions').innerHTML = '<div class="waiting-msg">' + t('actionSent') + '</div>';
    stopTurnTimer();
  }
  function doRaise() {
    const amt = parseInt((document.getElementById('raise-amt')||{}).value) || 0;
    doAction(highestBet > 0 ? 5 : 4, amt);
  }

  // ── Winner overlay ──
function showWinnerOverlay(winners) {
  var ov = document.getElementById('g-winner-overlay');
  if (!ov || !winners || winners.length === 0) return;

  var mainWinner = winners[0];
  var isMyWin = winners.some(function(w){ return w.pid === myId; });
  if (typeof notifyWinner === 'function') notifyWinner(isMyWin);
  var trophy = isMyWin ? "🎉" : "🏆";

  // Build header
  var winnerNames = winners.map(function(w){ return esc(getPlayerName(w.pid)); }).join(" & ");
  var totalWon = winners.reduce(function(s,w){ return s+w.won; }, 0);

  var html = '<div class="winner-card" onclick="event.stopPropagation()">';

  // ── Header ──
  html += '<div class="wc-header">';
  html += '<div class="wc-trophy">' + trophy + '</div>';
  html += '<div class="wc-titles">';
  html += '<div class="wc-label">' + (isMyWin ? t('youWon') : t('handWinner')) + '</div>';
  html += '<div class="wc-name">' + winnerNames + '</div>';
  html += '</div>';
  html += '<div class="wc-gain">+' + totalWon + ' ¥</div>';
  html += '</div>';

  // ── Stats ──
  html += '<div class="wc-stats">';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('handOf') + '</div><div class="wc-stat-value">' + handNum + '</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('totalPot') + '</div><div class="wc-stat-value">' + totalWon + ' ¥</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('players') + '</div><div class="wc-stat-value">' + seats.length + '</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('blinds') + '</div><div class="wc-stat-value">' + smallBlind + '/' + (smallBlind*2) + '</div></div>';
  html += '</div>';

  // ── Board (community cards) ──
  var comm = commCards.filter(function(n){ return n != null; });
  if (comm.length) {
    html += '<div class="wc-section">' + t('commCards') + '</div>';
    html += '<div class="wc-cards-row">';
    comm.forEach(function(n){ html += cardHtml(n, "sm", true); });
    html += '</div>';
  }

  // ── Players results ──
  html += '<div class="wc-section">' + t('results') + '</div>';
  html += '<div class="wc-players">';

  // Sort: winners first, then by money desc
  var allPids = seats.length ? seats : Object.keys(seatData).map(Number);
  var winnerPids = winners.map(function(w){ return w.pid; });
  allPids.sort(function(a,b){
    var aW = winnerPids.indexOf(a) >= 0 ? 1 : 0;
    var bW = winnerPids.indexOf(b) >= 0 ? 1 : 0;
    if (aW !== bW) return bW - aW;
    return ((seatData[b]||{}).money||0) - ((seatData[a]||{}).money||0);
  });

  allPids.forEach(function(pid) {
    var sd    = seatData[pid] || {};
    var isW   = winnerPids.indexOf(pid) >= 0;
    var isMe  = pid === myId;
    var name  = getPlayerName(pid);
    var wObj  = winners.find(function(w){ return w.pid === pid; });
    var delta = isW ? (wObj ? wObj.won : 0) : "";
    var deltaClass = isW ? "pos" : "neg";
    var rowClass = "wc-player-row" + (isW ? " wc-winner" : "") + (isMe ? " wc-me-row" : "");

    html += '<div class="' + rowClass + '">';
    html += '<div class="wc-player-av">' + name.charAt(0).toUpperCase() + '</div>';
    html += '<div class="wc-player-info">';
    html += '<div class="wc-player-name">' + esc(name) + (isW ? " 🏆" : "") + (isMe ? " 👤" : "") + '</div>';
    html += '<div class="wc-player-stack">' + (sd.money != null ? sd.money + " ¥" : "—") + '</div>';
    html += '</div>';
    // Show cards if revealed
    if (sd.card1 != null || sd.card2 != null) { // FIX: || test falsy ratait les cartes à valeur 0
      html += '<div class="wc-player-cards">';
      html += cardHtml(sd.card1 != null ? sd.card1 : null,"xsm",false) + cardHtml(sd.card2 != null ? sd.card2 : null,"xsm",false);
      html += '</div>';
    } else if (isMe && myCards[0] != null) { // FIX: idem, valeur 0 = falsy
      html += '<div class="wc-player-cards">';
      html += cardHtml(myCards[0],"xsm",false) + cardHtml(myCards[1],"xsm",false);
      html += '</div>';
    }
    html += '<div class="wc-player-delta ' + deltaClass + '">' + (isW ? "+" + delta + " ¥" : "") + '</div>';
    html += '</div>';
  });

  html += '</div>';
  html += '<button class="winner-dismiss" onclick="App.dismissWinner()">' + t('continue') + '</button>';
  html += '</div>';

  ov.innerHTML = html;
  ov.style.display = 'flex';
  clearTimeout(window._winnerTimer);
  window._winnerTimer = setTimeout(function(){ App.dismissWinner(); }, 12000);
}

function dismissWinner() {
  var ov = document.getElementById('g-winner-overlay');
  if (ov) ov.style.display = 'none';
  clearTimeout(window._winnerTimer);
}

  return {
    onLoginModeChange() {
      const mode = $('login-mode').value;
      $('f-pass').style.display = mode === 'auth' ? '' : 'none';

      const hostInput  = $('host');
      const proxyInput = $('proxy');
      const autoHost   = hostInput ? (hostInput.dataset.autoHost || window.location.hostname) : '';
      const proto      = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const port       = window.location.port || '8080';

      if (mode === 'lan') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = 'VotrePrenom';
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput && autoHost) hostInput.value = autoHost;
        setStatus(t('lanModeNote'));
      } else if (mode === 'unauth') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = 'VotrePrenom';
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput && autoHost) hostInput.value = autoHost;
        setStatus(t('chatAvailPrivate'));
      } else if (mode === 'guest') {
        $('nick-label').textContent = t('enterNickGuest');
        $('nick').placeholder = 'Guest' + String(Math.floor(10000 + Math.random()*90000));
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput) hostInput.value = 'pokerth.net';
        setStatus('');
      } else {
        $('nick-label').textContent = t('enterAccount');
        $('nick').placeholder = 'MonCompte';
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput) hostInput.value = 'pokerth.net';
        setStatus(t('enterCredentials'));
      }
    },

    connect() {
      // ── Rate limiter : éviter le spam qui provoque le blocage IP ──
      const now = Date.now();
      if (_ipBlockUntil > now) {
        const remaining = Math.ceil((_ipBlockUntil - now) / 1000);
        const mins = Math.floor(remaining / 60), secs = remaining % 60;
        setStatus('⏳ IP bloquée — attendre encore ' + (mins > 0 ? mins + 'min ' : '') + secs + 's', 'err');
        _startIpBlockCountdown();
        return;
      }
      // Rate limiter seulement après un échec (pas après une déco normale)
      if (_lastConnectFailed && now - _lastConnectTime < MIN_CONNECT_INTERVAL) {
        const wait = Math.ceil((MIN_CONNECT_INTERVAL - (now - _lastConnectTime)) / 1000);
        setStatus('⏸ Attendez ' + wait + 's avant de retenter…', 'err');
        return;
      }
      _lastConnectTime = now;
      // Sauvegarder le serveur préféré
      try {
        var lm2 = $('login-mode'); var hv = $('host'); var pv = $('port'); var xv = $('proxy');
        if (lm2) localStorage.setItem('pth_login_mode', lm2.value);
        if (hv)  localStorage.setItem('pth_host',  hv.value.trim());
        if (pv)  localStorage.setItem('pth_port',  pv.value.trim());
        if (xv)  localStorage.setItem('pth_proxy', xv.value.trim());
      } catch(e) {}
      const proxyUrl  = $('proxy').value.trim();
      const host      = $('host').value.trim();
      const port      = $('port').value.trim() || '7234';
      const loginMode = $('login-mode') ? $('login-mode').value : 'guest';
      myName          = $('nick').value.trim();

      if (!myName && loginMode === 'guest') {
        myName = 'Guest' + String(Math.floor(10000 + Math.random()*90000));
        $('nick').value = myName;
      }
      if (!myName) { setStatus(t('enterNick'), 'err'); return; }
      if (myName.length < 3) { setStatus(t('nickTooShort'), 'err'); return; }
      if (!proxyUrl || !host) { setStatus(t('fillFields'), 'err'); return; }

      if (loginMode === 'auth' && (!$('pass') || !$('pass').value.trim())) {
        setStatus(t('enterPassword'), 'err');
        return;
      }

      const useTls   = $('use-tls').checked;
      const tlsParam = useTls ? '1' : '0';
      // Close any existing connection first
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.onclose = null; // don't trigger the disconnect handler
        ws.close();
        ws = null;
      }
      rxBuf   = new Uint8Array(0);
      games   = {};
      players = {};
      loaded  = false;

      // Direct WSS for Internet modes (guest/auth to pokerth.net)
      // directWS uniquement pour les modes pokerth.net (guest/auth)
      // unauth (serveur privé) passe toujours par le proxy
      const isPokerThDirect = (loginMode === 'guest' || loginMode === 'auth');
      const targetIsPokerTH = host.includes('pokerth.net');
      directWS = isPokerThDirect && targetIsPokerTH;
      const finalUrl = directWS
        ? 'wss://www.pokerth.net:443/pthlive'
        : proxyUrl + '?host=' + encodeURIComponent(host) + '&port=' + encodeURIComponent(port) + '&tls=' + tlsParam;

      setStatus(directWS ? t('connDirect') : t('connProxy'));

      // Sauvegarder les paramètres pour la reconnexion auto
      _lastConnectParams = { host, port, loginMode, finalUrl, myName,
        pass: $('pass') ? $('pass').value : '' };
      _reconnectAttempts = 0;
      _intentionalDisconnect = false;
      _wasAuthenticated = false;
      _currentLoginMode = loginMode; // sauvegarder pour ChatReject
      try {
        ws = new WebSocket(finalUrl);
      } catch (e) {
        setStatus('URL invalide: ' + e.message, 'err');
        return;
      }

      ws.binaryType = 'arraybuffer';
      ws.onopen    = () => setStatus('Proxy connecté — attente du serveur PokerTH...');
      ws.onerror   = () => { _lastConnectFailed = true; setStatus('Erreur WebSocket. Le proxy est-il lancé ?', 'err'); };
      ws.onmessage = function(e) {
        if (typeof e.data === 'string') {
          // Message texte = protocole proxy (réactions)
          if (e.data.startsWith('AVATAR:')) {
            var avParts = e.data.split(':');
            var avPid = parseInt(avParts[1]);
            var avEmoji = avParts[2] || '';
            if (avPid && avPid !== myId) {
              _playerAvatars[avPid] = avEmoji;
              if (typeof renderSeats === 'function' && seats.length) renderSeats();
            }
            return;
          }
          if (e.data.startsWith('REACT:')) {
            var parts = e.data.split(':');
            var fromPid = parseInt(parts[1]);
            var reactEmoji = parts[2];
            if (fromPid !== myId) {
              handleIncomingReaction(fromPid, reactEmoji);
              // Pas d'affichage dans le chat — uniquement animation flottante
            }
          }
          return;
        }
        onRawData(e.data);
      };
      ws.onclose = function(e) {
        ws = null;
        clearTimeout(window._reconnectTimer);
        _hideBanner();
        _wasAuthenticated = false;
        show('s-connect');
        // Reconnexion automatique désactivée pour éviter le blocage IP
        // L'utilisateur peut se reconnecter manuellement après 8 secondes
        if (_intentionalDisconnect) {
          setStatus(t('disconnected') || 'Déconnecté.');
        } else {
          setStatus('Connexion perdue. Vous pouvez vous reconnecter dans quelques secondes.', 'err');
        }
        return;
        // --- RECONNEXION AUTO DÉSACTIVÉE (risque blocage IP) ---
        _reconnectAttempts++;
        var maxAttempts = 3; // max 3 tentatives pour éviter le blocage IP
        if (_reconnectAttempts > maxAttempts) {
          _hideBanner();
          _wasAuthenticated = false;
          show('s-connect');
          setStatus('Reconnexion échouée après ' + maxAttempts + ' tentatives. Reconnectez-vous manuellement.', 'err');
          return;
        }
        // Délai croissant : 5s, 15s, 30s — assez long pour ne pas spammer
        var delay = [5000, 15000, 30000][_reconnectAttempts - 1] || 30000;
        var secs = Math.round(delay/1000);
        _showBanner((_lang==='fr'?'Reconnexion dans ':'Reconnecting in ') + secs + 's… (' + _reconnectAttempts + '/' + maxAttempts + ')');
        window._reconnectTimer = setTimeout(function() {
          if (ws) return; // déjà reconnecté
          _showBanner((_lang==='fr'?'Reconnexion en cours…':'Reconnecting…'));
          try {
            ws = new WebSocket(_lastConnectParams.finalUrl);
            ws.binaryType = 'arraybuffer';
            ws.onopen = function() {
              _showBanner((_lang==='fr'?'Connecté — ré-authentification…':'Connected — re-authenticating…'));
            };
            ws.onerror = function() {
              ws = null;
              // Déclencher onclose pour retenter
              var fakeClose = new Event('close');
              ws && ws.dispatchEvent(fakeClose);
            };
            ws.onmessage = function(e) {
              onRawData(e.data);
              // Si on reçoit des données, la connexion est OK
              if (_reconnectAttempts > 0) {
                _reconnectAttempts = 0;
                setTimeout(_hideBanner, 1500);
              }
            };
            ws.onclose = arguments.callee.caller || function(){};
            // Réutiliser le même handler onclose pour les tentatives suivantes
            ws.onclose = function() {
              ws = null;
              clearTimeout(window._reconnectTimer);
              // Relancer le processus de reconnexion
              App && App.connect && App._reconnectContinue && App._reconnectContinue();
            };
          } catch(err) {
            _showBanner('Erreur: ' + err.message);
          }
        }, delay);
      };
    },

    _reconnectContinue() {
      // Relancer le processus de reconnexion (appelé depuis le handler onclose)
      if (!_lastConnectParams || _intentionalDisconnect) return;
      _reconnectAttempts++;
      var maxAttempts = 8;
      if (_reconnectAttempts > maxAttempts) {
        _hideBanner();
        show('s-connect');
        setStatus('Reconnexion échouée.', 'err');
        return;
      }
      var delay = Math.min(2000 * _reconnectAttempts, 12000);
      _showBanner((_lang==='fr'?'Reconnexion dans ':'Reconnecting in ') + Math.round(delay/1000) + 's…');
      window._reconnectTimer = setTimeout(function() { App.connect(); }, delay);
    },

    disconnect() {
      _intentionalDisconnect = true;
      _wasAuthenticated = false;
      _lastConnectFailed = false; // déco propre → pas de rate limit
      document.body.classList.remove('in-game');
      _hideBanner();
      if (ws) { ws.close(); ws = null; }
      games = {};
      show('s-connect');
    },

    closeTable() {
      // Admin closes table: send leave, server closes game for all
      if (ws && gId) { try { send(MSG.buildLeaveGame(gId)); } catch(e) {} }
      amInGame = false; amGameAdmin = false;
      gId = 0; seats = []; seatData = {};
      myCards = [null,null]; commCards = [];
      stopTurnTimer();
      dismissWinner();
      _chatRejectShown = false;
      _lastMsgWasReaction = false;
      document.body.classList.remove('in-game');
      var acb = document.getElementById('admin-close-btn');
      if (acb) acb.style.display = 'none';
      var badge = document.getElementById('g-admin-badge');
      if (badge) badge.style.display = 'none';
      show('s-lobby');
      addChat(null, '🔒 Table fermée.', 'sys');
    },

    leaveGame() {
      // Send proper leave request then stay connected (return to lobby)
      if (ws && gId) { try { send(MSG.buildLeaveGame(gId)); } catch(e) {} }
      amInGame = false; amGameAdmin = false;
      gId = 0; seats = []; seatData = {};
      myCards = [null,null]; commCards = [];
      stopTurnTimer();
      dismissWinner();
      closeHeaderOverflow();
      // Hide admin badge + close button
      var acb = document.getElementById('admin-close-btn');
      if (acb) acb.style.display = 'none';
      var acbm = document.getElementById('admin-close-mob');
      if (acbm) acbm.style.display = 'none';
      var badge = document.getElementById('g-admin-badge');
      if (badge) badge.style.display = 'none';
      show('s-lobby');  // back to lobby, stay connected
    },

    sendReaction(emoji) {
      if (!ws || !gId) return;
      // Envoyer via le proxy en message TEXTE WebSocket (pas PokerTH protocol)
      // → contourne les restrictions chat du serveur PokerTH
      if (ws && !directWS && ws.readyState === WebSocket.OPEN) {
        var reactMsg = 'REACT:' + myId + ':' + emoji;
        ws.send(reactMsg); // text frame, pas binaire
      } else {
        // Fallback directWS : tenter via PokerTH chat
        _lastMsgWasReaction = true;
        send(MSG.buildChat('[R]' + emoji, gId || 0));
      }
      // Afficher immédiatement pour moi
      handleIncomingReaction(myId, emoji);
      _reactionCounts[emoji] = (_reactionCounts[emoji] || 0); // déjà incrémenté dans handleIncomingReaction
    },

    sendGameChat() {
      var input = document.getElementById('g-chat-in');
      if (!input) return;
      var text = input.value.trim();
      if (!text || !ws) return;
      input.value = '';
      _lastMsgWasReaction = false;
      send(MSG.buildChat(text, gId || 0));
      addGameChat(myName, text, 'mine');
    },
    sendChat() {
      const input = $('chat-in');
      const text  = input.value.trim();
      if (!text || !ws) return;
      input.value = '';
      send(MSG.buildChat(text, 0));
      // Affichage optimiste
      addChat(myName, text, 'mine');
    },
    spectateGame(gameId) {
      var g = games[gameId];
      if (!g) return;
      addChat(null, '👁 ' + (_lang==='fr'?'Observation de la table ':'Spectating table ') + (g.name||('#'+gameId)) + '…', 'sys');
      // JoinExistingGame avec flag spectateur (field 3 = spectator dans proto PokerTH)
      var msg = Proto.encode([[1,0,gameId],[3,0,1]]);
      send(Proto.encode([[1,0,21],[22,2,msg]]));
    },

    autoJoinOrCreate() {
      autoAction = true;
      const btn = document.getElementById('btn-autojoin');
      if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }
      // Find first open (not started, not full) table
      let target = null;
      for (const id of Object.keys(games)) {
        const g = games[id];
        if (g && !g.started && g.players < g.maxPlayers) { target = id; break; }
      }
      if (target) {
        addChat(null, '⚡ Table trouvée — rejoindre #' + target, 'sys');
        send(MSG.buildJoinGame(parseInt(target), false));
      } else {
        addChat(null, '⚡ Aucune table — création en cours...', 'sys');
        send(MSG.buildCreateGame('WebGame-' + myName, 2, 10, 3000, 30));
      }
    },

    joinGameWithPassword(gameId, pass) {
      var g = games[gameId];
      var gName = g ? g.name : '#' + gameId;
      addChat(null, 'Joining "' + esc(gName) + '"...', 'sys');
      // JoinExistingGameMessage: gameId=1, password=2
      var msg = Proto.encode([[1,0,gameId],[2,2,pass||'']]);
      send(Proto.encode([[1,0,21],[22,2,msg]]));
    },
    joinGame(gameId) {
      const g = games[gameId];
      if (!g) return;
      if (g.mode === 3) { addChat(null, 'Table closed.', 'sys'); return; }
      if (g.priv || g.type === 3) {
        if (g.type === 3 && !g.priv) { setStatus(typeof t==='function'?t('errNotInvited')||'Invite-only table':'Invite-only table', 'err'); return; }
        const pp = document.getElementById('password-prompt');
        if (pp) {
          var ppName = document.getElementById('pp-table-name');
          var ppPass = document.getElementById('pp-pass');
          if (ppName) ppName.textContent = '🔒 ' + g.name;
          if (ppPass) ppPass.value = '';
          pp.dataset.gameId = gameId;
          pp.style.display = 'flex';
          setTimeout(function(){ if (ppPass) ppPass.focus(); }, 100);
        }
        return;
      }
      addChat(null, 'Joining "' + esc(g.name) + '"...', 'sys');
      send(MSG.buildJoinGame(parseInt(gameId), false));
    },
    dismissWinner() { dismissWinner(); },
    doAction(action, bet) { doAction(action, bet); },
    doRaise() { doRaise(); },

    toggleCreateForm() {
      var f = document.getElementById('create-form');
      if (!f) return;
      var open = !f.classList.contains('open');
      f.classList.toggle('open', open);
      f.style.display = open ? 'block' : 'none';
      var btn = document.querySelector('.btn-create-manual');
      if (btn) { btn.style.background = open ? 'rgba(200,168,74,0.15)' : ''; btn.style.borderColor = open ? 'var(--gold-dim)' : ''; btn.style.color = open ? 'var(--gold)' : ''; }
    },
    toggleMoreOptions() {
      var el = document.getElementById('cf-more-opts');
      var arrow = document.getElementById('cf-more-arrow');
      var lbl = document.getElementById('cf-more-label');
      if (!el) return;
      var open = el.style.display === 'none';
      el.style.display = open ? '' : 'none';
      if (arrow) arrow.textContent = open ? '▼' : '▶';
      if (lbl) lbl.textContent = open ? (t('lessOptions')||'Less options') : (t('moreOptions')||'More options');
    },
    toggleMinHumans() {
      var cb = document.getElementById('cf-bots');
      var row = document.getElementById('cf-min-humans-row');
      if (row) row.style.display = (cb && cb.checked) ? 'flex' : 'none';
    },
    startWithBots() {
      if (!gId) return;
      addGameChat(null, '▶ Starting with bots…', 'sys');
      send(MSG.buildStartWithBots(gId, true));
    },
    createGame() {
      const g = id => document.getElementById(id);
      const iv = (id, def) => parseInt(g(id)?.value) || def;
      const sv = (id, def) => parseInt(g(id)?.value) || def;
      const name    = (g('cf-name')?.value.trim()) || ('Table ' + myName);
      const nplayers= iv('cf-players', 2);
      const blind   = iv('cf-blind',   10);
      const stack   = iv('cf-stack',   3000);
      const timeout = iv('cf-timeout', 30);
      const bots    = g('cf-bots')?.checked || false;
      const minHuman= iv('cf-min-humans', 1);
      window._createWithBots  = bots;
      window._minHumansNeeded = bots ? minHuman : 0;
      window._humansJoined    = 1;
      gameTimeout = timeout; // mémoriser le timeout pour le timer
      const tablePass = (document.getElementById('cf-use-password')?.checked) ? (document.getElementById('cf-password')?.value || '') : '';
      const opts = {
        raiseMode:    sv('cf-raise-mode',    1),
        raiseEvery:   iv('cf-raise-every',   7),
        endRaiseMode: sv('cf-end-raise',     1),
        endRaiseValue:iv('cf-end-raise-val', 200),
        guiSpeed:     iv('cf-gui-speed',     5),
        delayHands:   iv('cf-delay',         7),
        gameType:     sv('cf-game-type',     1),
        password:     tablePass,
      };
      addChat(null, '+ Creating "' + name + '" (' + nplayers + 'p' + (bots ? ' + bots' : '') + ')...', 'sys');
      send(MSG.buildCreateGame(name, nplayers, blind, stack, timeout, opts));
      var f = document.getElementById('create-form');
      if (f) { f.style.display = 'none'; f.classList.remove('open'); }
    },
    onRememberMe() {
      var cb = document.getElementById('remember-me');
      if (cb && !cb.checked) {
        try { localStorage.removeItem('pth_login'); localStorage.removeItem('pth_pass'); localStorage.removeItem('pth_lan_nick'); window._savedLogin=null; window._savedPass=null; window._savedLanNick=null; } catch(e) {}
      }
    },
  };
})();


// ── Game chat (mirrors lobby addChat) ──
function addGameChat(sender, text, cls) {
  var el = document.getElementById('g-chat-msgs');
  if (!el) return;
  var d = document.createElement('div');
  d.className = 'msg ' + (cls || '');
  function e(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  if (sender) {
    d.innerHTML = '<span class="who">'+e(sender)+'</span>: <span class="txt">'+e(text)+'</span>';
  } else {
    d.innerHTML = '<span class="txt">'+e(text)+'</span>';
  }
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
  var cBtn = document.getElementById('chat-toggle-btn');
  var cPan = document.getElementById('g-chat-panel');
  if (cBtn && cls !== 'mine' && (!cPan || cPan.style.display === 'none')) {
    cBtn.style.color = 'var(--gold)';
    cBtn.style.borderColor = 'var(--gold-dim)';
    clearTimeout(window._chatFlashTimer);
    window._chatFlashTimer = setTimeout(function(){
      if (!cPan || cPan.style.display === 'none') { cBtn.style.color=''; cBtn.style.borderColor=''; }
    }, 3000);
    if (typeof notifyChat === 'function') notifyChat();
  }
}

// click handled via inline onclick on game-row

window.addEventListener('resize', function() {
  if (typeof updateBottomLayout === 'function') updateBottomLayout();
  autoScaleTable();
  setTimeout(function(){ if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 100);
});
window.addEventListener('orientationchange', function() {
  setTimeout(function(){ autoScaleTable(); if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 300);
});

function autoScaleTable() {
  var tz = document.getElementById('g-table-zone');
  var sc = document.getElementById('g-table-scaler');
  if (!tz || !sc) return;
  sc.style.transform = 'scale(1)';
  // Forcer un reflow avant de lire les dimensions
  void sc.offsetWidth;
  var tzW = tz.clientWidth, tzH = tz.clientHeight;
  var scW = sc.scrollWidth, scH = sc.scrollHeight;
  var ov = document.querySelector('.felt-oval');
  var ga = document.querySelector('.game-area');
  if (!tzW || !scW || !tzH || !scH) {
    sc.style.transform = 'scale(1)';
    return;
  }
  // Scale to 68% of max: leaves 32% room for seat overflow around the oval
  // Sur desktop, on autorise jusqu'à 1.0 max
  // Sur mobile, on peut réduire en dessous de 1 pour tout faire tenir
  var isMobScale = window.innerWidth < 900;
  var scaleMax = isMobScale ? 1 : 1;
  var scale = Math.min(scaleMax, tzW / scW, tzH / scH);
  if (scale < 0.05) scale = 0.5; // fallback visible
  sc.style.transform = 'scale(' + scale.toFixed(3) + ')';
  sc.style.transformOrigin = 'center center';
}
document.addEventListener('DOMContentLoaded', function() { setTimeout(autoScaleTable, 400); });

function toggleLobbyChat() {
  var panel = document.getElementById('lobby-chat-panel');
  var btn   = document.getElementById('lobby-chat-btn');
  if (!panel) return;
  var open = panel.style.display === 'none';
  panel.style.display = open ? 'flex' : 'none';
  if (btn) {
    btn.style.background  = open ? 'rgba(200,168,74,0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  if (open) {
    var el = document.getElementById('chat');
    if (el) el.scrollTop = el.scrollHeight;
    setTimeout(function(){ var ci = document.getElementById('chat-in'); if(ci) ci.focus(); }, 80);
  }
}


function renderHandsHelp() {
  var hands = [
    { cards: '<div class="hc hi">A<br>♠</div><div class="hc hi">K<br>♠</div><div class="hc hi">Q<br>♠</div><div class="hc hi">J<br>♠</div><div class="hc hi">10<br>♠</div>', n:'h1n', d:'h1d' },
    { cards: '<div class="hc">9<br>♣</div><div class="hc">8<br>♣</div><div class="hc">7<br>♣</div><div class="hc">6<br>♣</div><div class="hc">5<br>♣</div>', n:'h2n', d:'h2d' },
    { cards: '<div class="hc">K<br>♠</div><div class="hc r">K<br>♥</div><div class="hc r">K<br>♦</div><div class="hc">K<br>♣</div><div class="hc">8<br>♣</div>', n:'h3n', d:'h3d' },
    { cards: '<div class="hc">Q<br>♣</div><div class="hc r">Q<br>♥</div><div class="hc">Q<br>♠</div><div class="hc r">J<br>♦</div><div class="hc">J<br>♣</div>', n:'h4n', d:'h4d' },
    { cards: '<div class="hc r">A<br>♦</div><div class="hc r">J<br>♦</div><div class="hc r">8<br>♦</div><div class="hc r">5<br>♦</div><div class="hc r">2<br>♦</div>', n:'h5n', d:'h5d' },
    { cards: '<div class="hc">9<br>♠</div><div class="hc r">8<br>♥</div><div class="hc">7<br>♣</div><div class="hc r">6<br>♦</div><div class="hc">5<br>♠</div>', n:'h6n', d:'h6d' },
    { cards: '<div class="hc">7<br>♠</div><div class="hc r">7<br>♦</div><div class="hc">7<br>♣</div><div class="hc">K<br>♠</div><div class="hc r">4<br>♥</div>', n:'h7n', d:'h7d' },
    { cards: '<div class="hc">J<br>♣</div><div class="hc r">J<br>♥</div><div class="hc r">5<br>♦</div><div class="hc">5<br>♠</div><div class="hc">A<br>♣</div>', n:'h8n', d:'h8d' },
    { cards: '<div class="hc r">A<br>♥</div><div class="hc">A<br>♠</div><div class="hc r">9<br>♦</div><div class="hc">6<br>♣</div><div class="hc">3<br>♠</div>', n:'h9n', d:'h9d' },
    { cards: '<div class="hc hi">A<br>♠</div><div class="hc r">K<br>♦</div><div class="hc">9<br>♣</div><div class="hc r">5<br>♥</div><div class="hc">2<br>♠</div>', n:'h10n', d:'h10d' },
  ];
  var inner = document.getElementById('hands-card-inner');
  if (!inner) return;
  var rows = hands.map(function(h, i) {
    return '<div class="hand-row">'
      + '<div class="hand-rank">' + (i+1) + '</div>'
      + '<div class="hand-cards">' + h.cards + '</div>'
      + '<div class="hand-info">'
      +   '<div class="hand-name">' + t(h.n) + '</div>'
      +   '<div class="hand-desc">' + t(h.d) + '</div>'
      + '</div></div>';
  }).join('');
  inner.innerHTML = '<div class="hands-title">' + t('handsTitle') + '</div>'
    + rows
    + '<button class="hands-close" onclick="toggleHandsHelp()">' + t('handsClose') + '</button>';
}

function toggleHeaderOverflow(e) {
  if (e) e.stopPropagation();
  var m = document.getElementById('g-overflow-menu');
  if (!m) return;
  m.classList.toggle('open');
}
function closeHeaderOverflow() {
  var m = document.getElementById('g-overflow-menu');
  if (m) m.classList.remove('open');
}
// Fermer le menu si on clique ailleurs
document.addEventListener('click', function(e) {
  var btn = document.getElementById('g-overflow-btn');
  var menu = document.getElementById('g-overflow-menu');
  if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
});

function toggleHandsHelp() {
  var ov = document.getElementById('hands-overlay');
  if (!ov) return;
  var opening = ov.style.display === 'none';
  if (opening) renderHandsHelp();
  ov.style.display = opening ? 'flex' : 'none';
}

function toggleGameChat() {
  var panel = document.getElementById('g-chat-panel');
  var btn   = document.getElementById('chat-toggle-btn');
  if (!panel) return;
  var open = panel.style.display === 'none';
  panel.style.display = open ? 'flex' : 'none';
  setTimeout(function(){ autoScaleTable(); if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 50);
  if (btn) {
    btn.style.background  = open ? 'rgba(200,168,74,0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  if (open) {
    var m = document.getElementById('g-chat-msgs');
    if (m) m.scrollTop = m.scrollHeight;
    var inp = document.getElementById('g-chat-in');
    if (inp) setTimeout(function(){ inp.focus(); }, 80);
  }
}
function joinWithPassword() {
  var pp = document.getElementById('password-prompt');
  if (!pp) return;
  var gameId = parseInt(pp.dataset.gameId);
  var pass   = (document.getElementById('pp-pass') || {}).value || '';
  pp.style.display = 'none';
  if (typeof App !== 'undefined' && App.joinGameWithPassword) {
    App.joinGameWithPassword(gameId, pass);
  }
}

function toggleReactionPanel() {
  var panel = document.getElementById('g-reaction-panel');
  var btn   = document.getElementById('react-toggle-btn');
  if (!panel) return;
  var open = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = open ? 'flex' : 'none';
  if (btn) {
    btn.style.background  = open ? 'rgba(200,168,74,0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  setTimeout(function(){
    autoScaleTable();
    if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length)
      renderSeats();
  }, 80);
}

function toggleLog() {
  var panel = document.getElementById('g-log-panel');
  var btn   = document.getElementById('log-toggle-btn');
  if (!panel) return;
  var isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? '' : 'none';
  if (btn) btn.style.background = isHidden ? 'rgba(200,168,74,0.2)' : '';
  if (btn) btn.style.borderColor = isHidden ? 'var(--gold-dim)' : '';
  if (btn) btn.style.color       = isHidden ? 'var(--gold)' : '';
}