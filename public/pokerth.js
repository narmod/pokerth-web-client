// [Phase 2] audio (AudioContext, playTone, notify*, toggleSound) moved to public/modules/sounds.mjs

// ══ i18n ══
// [Phase 2] i18n moved to public/modules/i18n.mjs (LANG, _lang, t)
var _ipBlockInterval = null;
function _stopIpBlockCountdown() {
  if (_ipBlockInterval) { clearInterval(_ipBlockInterval); _ipBlockInterval = null; }
}
function _startIpBlockCountdown() {
  _stopIpBlockCountdown(); // ne jamais empiler deux minuteurs
  // Met à jour le statut toutes les secondes avec le temps restant
  _ipBlockInterval = setInterval(function() {
    // Le mode entraînement n'a pas de réseau → aucun blocage IP ne s'y applique.
    if (window._offlineMode) { _stopIpBlockCountdown(); return; }
    var rem = Math.max(0, Math.ceil((_ipBlockUntil - Date.now()) / 1000));
    var mins = Math.floor(rem / 60), secs = rem % 60;
    var txt = t('ipBlockedPrefix') + (mins > 0 ? mins + 'min ' : '') + secs + 's';
    // Mettre à jour seulement si on est sur l'écran de connexion
    var cs = document.getElementById('cstatus');
    if (cs) cs.textContent = rem > 0 ? txt : t('canReconnect');
    if (rem <= 0) {
      _stopIpBlockCountdown();
      _ipBlockUntil = 0;
      var cs2 = document.getElementById('cstatus');
      if (cs2) { cs2.textContent = t('canReconnect'); cs2.className = 'status ok'; }
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
  // Cibler le siège via data-pid (fiable même si deux joueurs ont la même initiale)
  var seatEl = document.querySelector('#g-seats [data-pid="' + pid + '"]');
  if (seatEl) {
    seatEl.classList.add('eliminated');
    setTimeout(function(){ seatEl.classList.remove('eliminated'); }, 900);
  }
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
  // Options avancées : focus auto du champ de mise à mon tour (opt-in).
  if (active) {
    try {
      if (localStorage.getItem('pth_focus_bet') === '1') {
        var _ri = document.getElementById('raise-amt');
        if (_ri) setTimeout(function () { try { _ri.focus(); } catch (e) {} }, 60);
      }
    } catch (e) {}
  }
}

// ── Options avancées (fenêtre de parité QML) ────────────────────────────────
// Réglages persistés en localStorage (pth_*). Les bascules « présentation »
// sont appliquées via des classes sur <body> (CSS) pour rester additif et sûr.
// Les lignes grisées « bientôt » dépendent d'un travail backend/moteur à venir.
// Sièges « perdants » au showdown (pids) → cartes estompées (fadeOutLosingCards).
// Rempli dans EndOfHandShow (si pth_fade_losers != '0'), vidé à HandStart.
var _sdLosers = new Set();
// Option "révéler mes cartes au tap" (pth_own_click) : quand activée, mes cartes
// sont face cachée tant que _ownReveal est faux ; un tap sur la player-bar bascule.
// Remis à faux à chaque nouvelle main (confidentialité), forcé à vrai au showdown.
var _ownReveal = false;
// Anti-Call accidentel (pth_guard_call) : suit le montant "à suivre" vu à ma
// dernière décision sur la street courante (reset par street). Si une grosse
// relance fait bondir ce montant, le bouton Call exige une confirmation (2e tap).
var _lastCallSeen = -1;
var _callConfirmArmed = false;
var _callConfirmTimer = null;
var _lastBoardCount = -1; // nb de cartes du board au dernier rendu (détecte la street)
var _oddsSeq = 0; // jeton du moniteur d'odds : abandonne tout calcul périmé
function _advStripEmoji(s) {
  s = String(s == null ? '' : s);
  try { s = s.replace(/\p{Extended_Pictographic}/gu, ''); } catch (e) {}
  s = s.replace(/[\uFE0F\u200D\u20E3]/g, '').replace(/[ \t]{2,}/g, ' ').trim();
  return s;
}
function _advGet(key, defOn) {
  try {
    var v = localStorage.getItem('pth_' + key);
    if (v === null) return !!defOn;
    return v === '1';
  } catch (e) { return !!defOn; }
}
// ── Joueurs ignorés (préférence locale, par nom). Le chat du joueur est masqué
//    et son avatar anonymisé (sauf si « ne pas masquer les avatars ignorés »
//    est activée). Voir _ignHide (sièges), addChat/addGameChat (filtre) et
//    window._toggleIgnore (carte joueur). ──
var _ignoredSet = (function(){ try { return new Set(JSON.parse(localStorage.getItem('pth_ignored') || '[]')); } catch (e) { return new Set(); } })();
function _isIgnored(name){ return !!name && _ignoredSet.has(String(name)); }
function _setIgnoredName(name, on){
  name = String(name || ''); if (!name) return;
  if (on) _ignoredSet.add(name); else _ignoredSet.delete(name);
  try { localStorage.setItem('pth_ignored', JSON.stringify(Array.from(_ignoredSet))); } catch (e) {}
  if (on) {
    ['chat', 'g-chat-msgs'].forEach(function(id){
      var box = document.getElementById(id);
      if (!box) return;
      box.querySelectorAll('.msg').forEach(function(m){
        var w = m.querySelector('.who');
        if (w && w.textContent === name && !m.classList.contains('mine')) m.remove();
      });
    });
  }
}
function applyAdvOpts() {
  try {
    var b = document.body;
    b.classList.toggle('adv-no-cardanim', !_advGet('anim_cards', true));
    b.classList.toggle('adv-no-blinds', !_advGet('show_blinds', true));
    b.classList.toggle('adv-no-community', !_advGet('show_community', true));
    b.classList.toggle('adv-no-flag', !_advGet('show_flag', true));
    b.classList.toggle('adv-hide-pbar', _advGet('hide_pbar', true));
    try { var _slm = localStorage.getItem('pth_seat_layout'); _slm = (_slm === 'pokerth-official' || _slm === 'pokerth-ellipse') ? _slm : 'auto'; document.documentElement.setAttribute('data-seat-layout', _slm); } catch (e) {}
    try { if (typeof window._refreshOwnCards === 'function') window._refreshOwnCards(); } catch (e) {}
    try { if (typeof window._renderOdds === 'function') window._renderOdds(); } catch (e) {}
    try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
  } catch (e) {}
}
window.applyAdvOpts = applyAdvOpts;
function setAdvOpt(key, on) {
  try { localStorage.setItem('pth_' + key, on ? '1' : '0'); } catch (e) {}
  applyAdvOpts();
}
window.setAdvOpt = setAdvOpt;
// Croix de fermeture des fenetres flottantes : coupe l'option et masque.
window.closeOddsWin = function () {
  try { setAdvOpt('odds_monitor', false); } catch (e) {}
  var cb = document.getElementById('adv-odds'); if (cb) cb.checked = false;
};
window.closeAssistWin = function () {
  try { if (typeof window.setAssist === 'function') window.setAssist(false); } catch (e) {}
  var cb = document.getElementById('adv-assist'); if (cb) cb.checked = false;
};
// Options avancees : sur desktop + tablette (>640px) la carte devient
// redimensionnable (resize:both cote CSS). Un modal centre en flexbox "fuit" la
// poignee ; on ancre donc la carte en absolu et on la centre a l'ouverture pour
// un redimensionnement 1:1 stable. Taille memorisee (pth_adv_size). Sur mobile :
// centrage flex natif, aucun resize.
// Options avancees deplacables (desktop + tablette uniquement) : drag depuis la
// barre de titre seulement, pour ne pas gener les controles du formulaire ni la
// poignee de resize. Position memorisee (pth_adv_pos), bornee a l'ecran.
function _advAttachDrag(card) {
  if (card._advDrag) return;
  card._advDrag = true;
  var drag = null;
  function apply(left, top) {
    var w = card.offsetWidth, h = card.offsetHeight;
    var maxL = Math.max(8, window.innerWidth - w), maxT = Math.max(8, window.innerHeight - h);
    card.style.left = Math.max(8, Math.min(left, maxL)) + 'px';
    card.style.top = Math.max(8, Math.min(top, maxT)) + 'px';
  }
  card.addEventListener('pointerdown', function (e) {
    var ok = false; try { ok = window.matchMedia('(min-width:641px)').matches; } catch (ex) {}
    if (!ok) return;
    var t = e.target;
    if (!t || !t.closest || !t.closest('.km-title')) return;
    var r = card.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    try { card.setPointerCapture(e.pointerId); } catch (_) {}
    card.classList.add('adv-dragging');
    e.preventDefault();
  });
  card.addEventListener('pointermove', function (e) {
    if (!drag) return; e.preventDefault();
    apply(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  function end(e) {
    if (!drag) return; drag = null; card.classList.remove('adv-dragging');
    try { card.releasePointerCapture(e.pointerId); } catch (_) {}
    try { var r = card.getBoundingClientRect(); localStorage.setItem('pth_adv_pos', JSON.stringify({ left: Math.round(r.left), top: Math.round(r.top) })); } catch (_) {}
  }
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}
function _advSetupResize() {
  var card = document.querySelector('#adv-modal .adv-card');
  if (!card) return;
  var canResize = false;
  try { canResize = window.matchMedia('(min-width:641px)').matches; } catch (e) {}
  if (!canResize) {
    card.style.position = ''; card.style.left = ''; card.style.top = '';
    card.style.width = ''; card.style.height = '';
    return;
  }
  try {
    var sz = JSON.parse(localStorage.getItem('pth_adv_size') || 'null');
    if (sz && sz.w) { card.style.width = sz.w + 'px'; if (sz.h) card.style.height = sz.h + 'px'; }
  } catch (e) {}
  card.style.position = 'absolute';
  var w = card.offsetWidth, h = card.offsetHeight;
  // Position : restaurer celle memorisee (apres deplacement), sinon centrer.
  // Toujours bornee a l'ecran au cas ou le viewport aurait change.
  var L, T, sp = null;
  try { sp = JSON.parse(localStorage.getItem('pth_adv_pos') || 'null'); } catch (e) {}
  if (sp && typeof sp.left === 'number') { L = sp.left; T = sp.top; }
  else { L = Math.round((window.innerWidth - w) / 2); T = Math.round((window.innerHeight - h) / 2); }
  L = Math.max(8, Math.min(L, Math.max(8, window.innerWidth - w)));
  T = Math.max(8, Math.min(T, Math.max(8, window.innerHeight - h)));
  card.style.left = L + 'px';
  card.style.top = T + 'px';
  _advAttachDrag(card);
  if (!card._advRO && typeof ResizeObserver === 'function') {
    var _t = null;
    card._advRO = new ResizeObserver(function () {
      if (!card.offsetWidth) return;
      clearTimeout(_t);
      _t = setTimeout(function () {
        if (!card.offsetWidth) return;
        try { localStorage.setItem('pth_adv_size', JSON.stringify({ w: Math.round(card.offsetWidth), h: Math.round(card.offsetHeight) })); } catch (e) {}
      }, 250);
    });
    try { card._advRO.observe(card); } catch (e) {}
  }
}
function openAdvancedOptions() {
  var m = document.getElementById('adv-modal');
  if (!m) return;
  var sync = function (id, key, defOn) {
    var el = document.getElementById(id);
    if (el) el.checked = _advGet(key, defOn);
  };
  sync('adv-anim', 'anim_cards', true);
  sync('adv-blinds', 'show_blinds', true);
  sync('adv-hidepbar', 'hide_pbar', true);
  sync('adv-community', 'show_community', true);
  sync('adv-focusbet', 'focus_bet', false);
  sync('adv-noemoji', 'chat_noemoji', false);
  sync('adv-fadelosers', 'fade_losers', true);
  sync('adv-flag', 'show_flag', true);
  sync('adv-ownclick', 'own_click', false);
  sync('adv-guardcall', 'guard_call', false);
  sync('adv-assist', 'assist', true);
  sync('adv-odds', 'odds_monitor', false);
  sync('adv-autobtn', 'show_auto', true);
  sync('adv-quickbet', 'show_pct', true);
  sync('adv-voice', 'voice', false);
  sync('adv-displaybb', 'display_bb', false);
  sync('adv-nohideignored', 'no_hide_ignored', false);
  try { var _sl = document.getElementById('adv-seatlayout'); if (_sl) { var _slv = localStorage.getItem('pth_seat_layout'); _sl.value = (_slv === 'pokerth-official' || _slv === 'pokerth-ellipse') ? _slv : 'auto'; } } catch (e) {}
  try { _rebindAction = null; _renderKeyButtons(); } catch (e) {}
  try { advSelectCat('ui'); } catch (e) {}
  try { _advSyncContext(); } catch (e) {}
  m.style.display = '';
  try { _advSetupResize(); } catch (e) {}
}
window.openAdvancedOptions = openAdvancedOptions;
function closeAdvancedOptions() {
  var m = document.getElementById('adv-modal');
  if (m) m.style.display = 'none';
  _rebindAction = null;
}
window.closeAdvancedOptions = closeAdvancedOptions;
// Options avancées : navigation par catégories (parité du dialogue officiel
// PokerTH QML). Sidebar icône+texte en tablette/desktop ; barre d'icônes seules
// en haut sur téléphone (géré en CSS). Les catégories hors « Interface » relient
// l'UI existante (thème, son, avatar, journal, connexion…), elles ne dupliquent
// rien. advSelectCat() bascule l'onglet actif ; les catégories grisées sont
// inertes.
function advSelectCat(cat) {
  var modal = document.getElementById('adv-modal');
  if (!modal) return;
  var btn = modal.querySelector('.adv-cat[data-cat="' + cat + '"]');
  if (btn && btn.hasAttribute('disabled')) return;   // catégorie sans objet : on ignore
  var cats = modal.querySelectorAll('.adv-cat');
  for (var i = 0; i < cats.length; i++) {
    var on = cats[i].getAttribute('data-cat') === cat;
    cats[i].classList.toggle('is-active', on);
    cats[i].setAttribute('aria-selected', on ? 'true' : 'false');
  }
  var panels = modal.querySelectorAll('.adv-panel');
  for (var j = 0; j < panels.length; j++) {
    panels[j].classList.toggle('is-active', panels[j].getAttribute('data-cat') === cat);
  }
  try { var pn = modal.querySelector('.adv-panels'); if (pn) pn.scrollTop = 0; } catch (e) {}
}
window.advSelectCat = advSelectCat;

// Grise les catégories sans objet dans le contexte courant (lobby vs partie) et
// renseigne le serveur courant dans l'onglet « Jeu Internet ».
function _advSyncContext() {
  var modal = document.getElementById('adv-modal');
  if (!modal) return;
  var inGame = false;
  try { inGame = document.body.classList.contains('in-game'); } catch (e) {}
  var setEnabled = function (cat, enabled) {
    var b = modal.querySelector('.adv-cat[data-cat="' + cat + '"]');
    if (b) {
      if (enabled) { b.removeAttribute('disabled'); b.removeAttribute('aria-disabled'); }
      else { b.setAttribute('disabled', ''); b.setAttribute('aria-disabled', 'true'); }
    }
    var p = modal.querySelector('.adv-panel[data-cat="' + cat + '"]');
    if (p) p.classList.toggle('adv-panel-off', !enabled);
  };
  var onConnect = false;            // page de login (pré-connexion : pas encore de profil ni serveur)
  try { var _sc = document.getElementById('s-connect'); onConnect = !!(_sc && _sc.classList.contains('active')); } catch (e) {}
  var connected = !onConnect;       // lobby ou partie = contexte de jeu connecté
  setEnabled('local', inGame);      // « Remplir avec des bots » : seulement à une table
  setEnabled('log', inGame);        // Journal : seulement en partie
  setEnabled('network', false);     // Jeu en réseau (LAN) : pas encore disponible
  setEnabled('internet', connected);// pas de serveur à quitter avant connexion
  setEnabled('avatar', connected);  // profil / avatar indisponible avant connexion
  try {
    var host = (window._pthNetServer && window._pthNetServer.host) ? window._pthNetServer.host : null;
    var el = modal.querySelector('#adv-srv-host');
    if (el) el.textContent = host || (typeof window.t === 'function' ? window.t('advSrvUnknown') : '\u2014');
  } catch (e) {}
}

// « Paramètres par défaut » : réinitialise options + raccourcis (avec confirmation).
function resetAdvDefaults() {
  var msg = (typeof window.t === 'function' && window.t('advResetConfirm') !== 'advResetConfirm')
    ? window.t('advResetConfirm')
    : 'Reset all options and keyboard shortcuts to their defaults?';
  if (!window.confirm(msg)) return;
  var defs = {
    anim_cards: true, show_blinds: true, hide_pbar: true, show_community: true,
    focus_bet: false, chat_noemoji: false, fade_losers: true, show_flag: true,
    own_click: false, guard_call: false, odds_monitor: false, no_hide_ignored: false
  };
  try { for (var k in defs) setAdvOpt(k, defs[k]); } catch (e) {}
  try { setSeatLayout('official'); } catch (e) {}
  try { if (typeof window.setAutoBtn === 'function') window.setAutoBtn(true); } catch (e) {}
  try { if (typeof window.setQuickBet === 'function') window.setQuickBet(true); } catch (e) {}
  try { resetKeys(); } catch (e) {}
  try { openAdvancedOptions(); } catch (e) {}   // re-sync des cases + retour onglet Interface
}
window.resetAdvDefaults = resetAdvDefaults;
// Placement des sièges (Options avancées) : 'auto' | 'pokerth-official' | 'pokerth-ellipse'. Persiste +
// re-rend les sièges via le hook global window._renderSeats.
function setSeatLayout(v) {
  v = (v === 'pokerth-official' || v === 'pokerth-ellipse') ? v : 'auto';
  try { localStorage.setItem('pth_seat_layout', v); } catch (e) {}
  try { document.documentElement.setAttribute('data-seat-layout', v); } catch (e) {}
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
}
window.setSeatLayout = setSeatLayout;
// Appliquer les classes body dès l'init (les prefs sont reflétées au chargement).
try {
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', applyAdvOpts);
  else applyAdvOpts();
} catch (e) {}

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
// Detection d'un clavier physique (pour afficher les paves de raccourci).
// Aucune API ne dit "un clavier est branche". Heuristique fiable : un keydown
// alors qu'AUCUN champ texte n'est focalise ne peut pas venir d'un clavier a
// l'ecran (ceux-ci n'apparaissent que pour un input focalise). Des qu'on en voit
// un, on revele les paves (classe sur <body>) et on memorise. Desktop : deja
// affiche via le gate hover/pointer. Tablette/tel. AVEC clavier : apparait des la
// 1re frappe, puis memorise.
(function(){
  function _markKb(){
    try{ if(document.body) document.body.classList.add('has-keyboard'); }catch(e){}
    try{ localStorage.setItem('pth_has_keyboard','1'); }catch(e){}
  }
  function _applyKb(){ try{ if(localStorage.getItem('pth_has_keyboard')==='1') _markKb(); }catch(e){} }
  if(document.body) _applyKb(); else document.addEventListener('DOMContentLoaded', _applyKb);
  document.addEventListener('keydown', function(e){
    try{ if(document.body && document.body.classList.contains('has-keyboard')) return; }catch(_){}
    var tg=e.target||{}, tag=(tg.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea'||tg.isContentEditable) return;
    _markKb();
  }, true);
})();

// ── Raccourcis clavier d'action personnalisables ──
// Bindings par défaut (rétro-compatibles avec l'historique f/c/r/a + 1/2/3).
// Espace (=Call) et Entrée (=valider la relance) restent fixes, non remappables.
var _KEY_DEFAULTS = { fold: 'f', call: 'c', raise: 'r', allin: 'a', bet1: '1', bet2: '2', bet3: '3' };
function _keyBindings() {
  var kb = {}; for (var k in _KEY_DEFAULTS) kb[k] = _KEY_DEFAULTS[k];
  try { var s = localStorage.getItem('pth_keys'); if (s) { var o = JSON.parse(s) || {}; for (var k2 in kb) if (typeof o[k2] === 'string' && o[k2]) kb[k2] = o[k2].toLowerCase(); } } catch (e) {}
  return kb;
}
function _saveKeyBindings(kb) { try { localStorage.setItem('pth_keys', JSON.stringify(kb)); } catch (e) {} }
var _rebindAction = null; // action en cours de réassignation (clic sur un bouton de touche)
function _renderKeyButtons() {
  var kb = _keyBindings();
  var rows = document.querySelectorAll('#adv-modal .adv-keyrow');
  for (var i = 0; i < rows.length; i++) {
    var act = rows[i].getAttribute('data-act');
    var btn = rows[i].querySelector('.kb-btn');
    if (!btn) continue;
    if (_rebindAction === act) { btn.textContent = '…'; btn.classList.add('kb-active'); }
    else { btn.textContent = (kb[act] || '—').toUpperCase(); btn.classList.remove('kb-active'); }
  }
}
function rebindKey(act) { _rebindAction = (_rebindAction === act) ? null : act; _renderKeyButtons(); } // re-clic = annule
window.rebindKey = rebindKey;
function resetKeys() { var d = {}; for (var k in _KEY_DEFAULTS) d[k] = _KEY_DEFAULTS[k]; _saveKeyBindings(d); _rebindAction = null; _renderKeyButtons(); }
window.resetKeys = resetKeys;
// Capture des touches en mode réassignation (phase capturing -> avant le handler de
// jeu, qu'on neutralise via stopPropagation). Échap annule ; lettre/chiffre valide.
document.addEventListener('keydown', function (e) {
  if (!_rebindAction) return;
  e.preventDefault(); e.stopPropagation();
  var k = (e.key || '').toLowerCase();
  if (k === 'escape') { _rebindAction = null; _renderKeyButtons(); return; }
  if (k.length !== 1 || !/[a-z0-9]/.test(k)) return; // on attend une lettre/chiffre
  var kb = _keyBindings();
  var old = kb[_rebindAction];
  for (var a in kb) { if (kb[a] === k && a !== _rebindAction) kb[a] = old; } // conflit -> échange
  kb[_rebindAction] = k;
  _saveKeyBindings(kb);
  _rebindAction = null;
  _renderKeyButtons();
}, true);

document.addEventListener('keydown', function(e) {
  // Ne pas intercepter si on tape dans un input/textarea
  var tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
  // C'est mon tour SSI le vrai panneau d'action interactif est present : #g-actions
  // contient la grille reelle en ENFANT DIRECT (.action-grid), ou l'apercu hors-tour
  // enveloppe dans .actions-preview, ou un message d'attente. (Les anciennes gardes
  // amInGame / turnPid / myId etaient hors de portee de ce handler : il est au niveau
  // module, alors que ces let vivent dans l'IIFE App -> elles ne s'evaluaient jamais
  // et le handler sortait toujours.)
  var _ap = document.querySelector('#g-actions > .action-grid');
  if (!_ap) return;

  var key = e.key.toLowerCase();
  var KB = _keyBindings();
  var act = null;
  if (key === KB.fold) act = 'fold';
  else if (key === KB.call || key === ' ') act = 'call'; // Espace = alias Call (fixe)
  else if (key === KB.raise) act = 'raise';
  else if (key === KB.allin) act = 'allin';
  else if (key === KB.bet1) act = 'bet1';
  else if (key === KB.bet2) act = 'bet2';
  else if (key === KB.bet3) act = 'bet3';
  else if (key === 'enter') act = 'enter'; // Entrée = valider la relance (fixe)
  if (!act) return;

  if (act === 'fold') {
    // Fold
    var btn = document.querySelector('.btn-fold:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); showKeyHint(t('hintFold')); }
  } else if (act === 'call') {
    // Call ou Check
    e.preventDefault();
    var btn = document.querySelector('.btn-call:not([disabled]), .btn-check:not([disabled])');
    if (btn) { btn.click(); showKeyHint(btn.classList.contains('btn-check') ? t('hintCheck') : t('hintCall')); }
  } else if (act === 'raise') {
    // Raise — clique directement le bouton de relance (au montant courant de l'input).
    var btn = document.querySelector('.btn-raise:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); showKeyHint(t('hintRaise')); }
  } else if (act === 'allin') {
    // All-in
    var btn = document.querySelector('.btn-allin:not([disabled])');
    if (btn) { e.preventDefault(); btn.click(); showKeyHint(t('hintAllin')); }
  } else if (act === 'bet1' || act === 'bet2' || act === 'bet3') {
    // Mises rapides : remplit le champ via .btn-pct puis retire le focus (sinon R/Entrée
    // seraient ignorés, le champ montant étant focalisé). Valider ensuite par Raise.
    var _pb = _ap.querySelectorAll('.btn-pct:not([disabled])');
    var _i = act === 'bet1' ? 0 : (act === 'bet2' ? 1 : 2);
    if (_pb && _pb[_i]) {
      e.preventDefault();
      _pb[_i].click();
      var _ri = document.getElementById('raise-amt');
      if (_ri) _ri.blur();
      var _frac = act === 'bet1' ? '1/3' : (act === 'bet2' ? '1/2' : 'Pot');
      showKeyHint(_frac + ' — ' + t('hintBetConfirm'));
    }
  } else if (act === 'enter') {
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
    'background:var(--gold);color:var(--on-gold);padding:5px 14px;border-radius:20px;' +
    'font-family:monospace;font-size:0.75rem;font-weight:700;z-index:999;' +
    'animation:fadeIn 0.15s ease;pointer-events:none;';
  document.body.appendChild(el);
  setTimeout(function(){ el.style.opacity='0'; el.style.transition='opacity 0.4s'; setTimeout(function(){ el.remove(); }, 400); }, 1200);
}

// Affichage du bandeau "blinds" (alerte au changement OU explication au tap).
// Le contenu HTML est préparé dans le handler HandStart (où l'on a accès au
// small blind, au mode de montée, etc.) et stocké dans window._blindsInfoHtml.
// withSound=true → alerte (son), false → simple info au clic.
function _showBlindsToast(html, withSound) {
  if (!html) return;
  var prev = document.getElementById('blinds-up-toast');
  if (prev) prev.remove();
  var el = document.createElement('div');
  el.id = 'blinds-up-toast';
  el.className = 'blinds-up-toast';
  el.innerHTML = html;
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('show'); });
  setTimeout(function(){
    el.classList.remove('show');
    setTimeout(function(){ if (el.parentNode) el.remove(); }, 450);
  }, withSound ? 3000 : 2400);
  if (withSound && typeof notifyBlindsUp === 'function') notifyBlindsUp();
}
window._showBlindsToast = _showBlindsToast;
// Appelé au tap sur la pastille du bandeau (pas de son).
window.showBlindsInfo = function() { _showBlindsToast(window._blindsInfoHtml, false); };

// ── Reusable toast ────────────────────────────────────────────────────────
// Small transient confirmation, styled like the header ••• menu (.app-toast
// in pokerth.css). Generic on purpose so any feature can call it:
//   showToast(t('fieldsReset'));
//   showToast('Copié', { icon: '📋', duration: 1200 });
// Text is set via textContent (never innerHTML) so a translated/dynamic
// message can never inject markup.
function showToast(msg, opts) {
  opts = opts || {};
  var prev = document.getElementById('app-toast');
  if (prev) prev.remove();
  var el = document.createElement('div');
  el.id = 'app-toast';
  el.className = 'app-toast' + (opts.tone === 'error' ? ' app-toast--error' : '');
  if (opts.icon !== '') {
    var tick = document.createElement('span');
    tick.className = 'app-toast-tick';
    tick.textContent = opts.icon || '\u2713'; // ✓
    el.appendChild(tick);
  }
  var txt = document.createElement('span');
  txt.textContent = msg;
  el.appendChild(txt);
  document.body.appendChild(el);
  requestAnimationFrame(function() { el.classList.add('show'); });
  var dur = opts.duration || 1800;
  setTimeout(function() {
    el.classList.remove('show');
    setTimeout(function() { if (el.parentNode) el.remove(); }, 300);
  }, dur);
}
window.showToast = showToast;

// ── Scheduled server restart/update notice (dismissible toast) ─────────────
// Driven by a single "NOTICE:RESTART:<deadlineMs>:<kind>:<note>" proxy frame.
// No live countdown (by design): shows the restart clock time, which stays
// accurate, plus an optional admin note. Localised via t(); note is shown with
// textContent so it can never inject markup.
function _fmtRestartTime(ms) {
  var d = new Date(ms);
  var sameDay = d.toDateString() === new Date().toDateString();
  try {
    return sameDay ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                   : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return d.toLocaleTimeString(); }
}
function hideRestartNotice() { var el = document.getElementById('srv-restart-notice'); if (el) el.remove(); }
function showRestartNotice(deadlineMs, kind, note) {
  hideRestartNotice();
  var msg = (kind === 'restart' ? t('srvRestartOnly') : t('srvRestartUpdate')).replace('{t}', _fmtRestartTime(deadlineMs));
  if (note) msg += '\n' + note;
  var el = document.createElement('div');
  el.id = 'srv-restart-notice';
  el.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);max-width:92%;z-index:10000;display:flex;align-items:flex-start;gap:10px;background:rgba(var(--red-rgb),.96);color:#fff;padding:10px 13px;border-radius:10px;box-shadow:0 6px 22px rgba(0,0,0,.45);font-size:.85rem;line-height:1.4;white-space:pre-line;';
  var span = document.createElement('span');
  span.textContent = msg;
  el.appendChild(span);
  var x = document.createElement('button');
  x.setAttribute('aria-label', 'Close');
  x.textContent = '\u00d7';
  x.style.cssText = 'flex:none;background:transparent;border:0;color:#fff;font-size:1.25rem;line-height:1;cursor:pointer;padding:0 2px;opacity:.85;';
  x.addEventListener('click', hideRestartNotice);
  el.appendChild(x);
  document.body.appendChild(el);
}
window.showRestartNotice = showRestartNotice;
window.hideRestartNotice = hideRestartNotice;

// ── Information broadcast (admin → all clients) ────────────────────────────
// Gold toast matching the blinds announcement palette; dismissible (×); stays
// until closed; a newer message replaces the previous one. Sits just below the
// restart notice when both are showing. Message is linkified (safe HTML).
// Operator announcements (broadcasts + welcome) may include links. We escape
// the text (XSS/layout-safe even though the author is the admin), then linkify
//   [label](https://url)  ·  bare http(s):// or mailto: URLs
// Only http/https/mailto are linked; links open in a new tab, rel-protected.
function _escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function _annLink(url, label) {
  return '<a href="' + url + '" target="_blank" rel="noopener noreferrer nofollow"'
       + ' style="color:inherit;text-decoration:underline">' + label + '</a>';
}
function _linkifyAnnounce(text) {
  var esc = _escHtml(text);
  // single pass, alternation: markdown link OR bare URL (avoids double-linking)
  var RE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)|((?:https?:\/\/|mailto:)[^\s<)\]]+)/g;
  return esc.replace(RE, function (whole, mdLabel, mdUrl, bareUrl) {
    if (mdUrl) return _annLink(mdUrl, mdLabel);
    var trail = '', m = bareUrl.match(/[.,!?]+$/);
    if (m) { trail = m[0]; bareUrl = bareUrl.slice(0, -trail.length); }
    return _annLink(bareUrl, bareUrl) + trail;
  });
}
function hideInfoToast() { var el = document.getElementById('srv-info-toast'); if (el) el.remove(); }
function showInfoToast(message, icon) {
  hideInfoToast();
  var top = document.getElementById('srv-restart-notice') ? 76 : 16;
  var el = document.createElement('div');
  el.id = 'srv-info-toast';
  el.style.cssText = 'position:fixed;top:' + top + 'px;left:50%;transform:translateX(-50%);max-width:min(92vw,420px);z-index:9999;display:flex;align-items:flex-start;gap:10px;background:var(--gold);color:var(--on-gold);padding:11px 15px;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.25) inset;font-weight:600;font-size:.9rem;line-height:1.4;white-space:pre-line;';
  if (icon) { var ic = document.createElement('span'); ic.textContent = icon; ic.style.cssText = 'flex:none;font-size:1.1rem;line-height:1.3;'; el.appendChild(ic); }
  var span = document.createElement('span'); span.innerHTML = _linkifyAnnounce(message); el.appendChild(span);
  var x = document.createElement('button');
  x.setAttribute('aria-label', 'Close'); x.textContent = '\u00d7';
  x.style.cssText = 'flex:none;background:transparent;border:0;color:var(--on-gold);font-size:1.25rem;line-height:1;cursor:pointer;padding:0 2px;opacity:.7;';
  x.addEventListener('click', hideInfoToast);
  el.appendChild(x);
  document.body.appendChild(el);
}
window.showInfoToast = showInfoToast;
window.hideInfoToast = hideInfoToast;

// ── On-device translation (browser Translator API, progressive enhancement) ──
// Free, on-device, no server/key. Chromium-only; everywhere else these helpers
// resolve null and callers fall back to the operator's original text.
function _apiLang(code) {
  if (!code) return '';
  var c = String(code).toLowerCase();
  if (c === 'zh-tw') return 'zh-Hant';
  if (c === 'zh-cn') return 'zh';
  if (c === 'pt-br' || c === 'pt-pt') return 'pt';
  return c.split('-')[0];
}
function _makeTranslator(fromCode, toCode) {
  if (typeof Translator === 'undefined') return Promise.resolve(null);
  var from = _apiLang(fromCode), to = _apiLang(toCode);
  if (!from || !to || from === to) return Promise.resolve(null);
  return Promise.resolve(Translator.availability({ sourceLanguage: from, targetLanguage: to }))
    .then(function (av) { if (!av || av === 'unavailable') return null; return Translator.create({ sourceLanguage: from, targetLanguage: to }); })
    .catch(function () { return null; });
}
// The on-device Translator collapses line breaks (it treats the input as one
// segment), which flattened the operator's layout. Translate each line on its
// own and re-join with the original newlines; empty/whitespace lines pass
// through untouched, and a per-line failure falls back to the source line.
function _translateLines(tr, text) {
  if (text == null) return Promise.resolve('');
  var parts = String(text).split('\n');
  return parts.reduce(function (acc, line) {
    return acc.then(function (out) {
      if (!line.trim()) { out.push(line); return out; }
      return Promise.resolve(tr.translate(line))
        .then(function (t) { out.push(t); return out; })
        .catch(function () { out.push(line); return out; });
    });
  }, Promise.resolve([])).then(function (out) { return out.join('\n'); });
}
function _translateEntry(title, body, fromCode, toCode) {
  return _makeTranslator(fromCode, toCode).then(function (tr) {
    if (!tr) return null;
    function one(s) { return s ? _translateLines(tr, s) : Promise.resolve(''); }
    return one(title).then(function (t) { return one(body).then(function (b) { return { title: t, body: b }; }); });
  }).catch(function () { return null; });
}
function _detectLang(text) {
  if (!text || typeof LanguageDetector === 'undefined') return Promise.resolve(null);
  return Promise.resolve(LanguageDetector.availability())
    .then(function (av) { if (!av || av === 'unavailable') return null; return LanguageDetector.create(); })
    .then(function (det) { return det ? det.detect(text) : null; })
    .then(function (res) { return (res && res.length && res[0].confidence > 0.5) ? res[0].detectedLanguage : null; })
    .catch(function () { return null; });
}
function _detectTranslate(text) {
  var target = (typeof _lang !== 'undefined' && _lang) ? _lang : '';
  if (!text || !target || typeof Translator === 'undefined') return Promise.resolve(null);
  return _detectLang(text).then(function (src) {
    if (!src || _apiLang(src) === _apiLang(target)) return null;
    return _makeTranslator(src, target).then(function (tr) { return tr ? _translateLines(tr, text) : null; });
  }).catch(function () { return null; });
}

// ── First-visit welcome / rules modal (admin-authored, per language) ────────
// Picks the operator's text for the client's active UI language (_lang), with
// fallback: exact code → primary subtag (pt-br → pt) → configured default → any.
// `exact` is true when the operator actually provided the client's language.
function _welcomeChoose(w) {
  var langs = (w && w.langs) || {};
  var keys = Object.keys(langs);
  if (!keys.length) return null;
  var code = (typeof _lang !== 'undefined' && _lang) ? String(_lang).toLowerCase() : '';
  var def = (w && w['default']) ? String(w['default']).toLowerCase() : 'fr';
  var prim = code.split('-')[0];
  function findBy(pred) { for (var i = 0; i < keys.length; i++) { if (pred(keys[i].toLowerCase())) return keys[i]; } return null; }
  var exact = code && findBy(function (x) { return x === code; });
  var sub = !exact && prim ? findBy(function (x) { return x.split('-')[0] === prim; }) : null;
  var chosen = exact || sub || findBy(function (x) { return x === def; }) || keys[0];
  var v = langs[chosen] || {};
  return { lang: chosen, title: v.title || '', body: v.body || '', exact: !!(exact || sub) };
}
function _welcomePick(w) { var c = _welcomeChoose(w); return c ? { title: c.title, body: c.body } : null; }
function hideWelcomeModal() { var el = document.getElementById('welcome-modal'); if (el) el.remove(); }
function showWelcomeModal(title, body, version) {
  hideWelcomeModal();
  var back = document.createElement('div');
  back.id = 'welcome-modal';
  back.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.62);backdrop-filter:blur(2px);';
  var card = document.createElement('div');
  card.style.cssText = 'max-width:480px;width:100%;max-height:84vh;display:flex;flex-direction:column;background:var(--modal-bg);color:var(--text);border:1px solid var(--border);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.6);overflow:hidden;';
  if (title) {
    var h = document.createElement('div');
    h.textContent = title;
    h.style.cssText = "padding:16px 20px;font-family:var(--ff-display);font-weight:700;font-size:1.15rem;color:var(--text-hi);border-bottom:1px solid var(--border);";
    card.appendChild(h);
  }
  var p = document.createElement('div');
  p.innerHTML = _linkifyAnnounce(body || '');
  p.style.cssText = 'padding:16px 20px;overflow:auto;white-space:pre-line;line-height:1.55;font-size:.95rem;';
  card.appendChild(p);
  var foot = document.createElement('div');
  foot.style.cssText = 'padding:12px 20px 16px;display:flex;justify-content:flex-end;border-top:1px solid var(--border);';
  var btn = document.createElement('button');
  btn.textContent = (typeof window.t === 'function' ? window.t('welcomeAck') : '') || 'I understand';
  btn.style.cssText = 'padding:9px 18px;border-radius:10px;border:0;cursor:pointer;font-weight:700;background:var(--gold);color:var(--on-gold);';
  btn.addEventListener('click', function () { try { localStorage.setItem('pth_welcome_seen', String(version)); } catch (e) {} hideWelcomeModal(); });
  foot.appendChild(btn);
  card.appendChild(foot);
  back.appendChild(card);
  document.body.appendChild(back);
}
function maybeShowWelcome(w) {
  if (!w || !w.enabled) return;
  try { if (String(localStorage.getItem('pth_welcome_seen')) === String(w.updatedAt)) return; } catch (e) {}
  var c = _welcomeChoose(w);
  if (!c || (!c.title && !c.body)) return;
  showWelcomeModal(c.title, c.body, w.updatedAt); // operator text shows immediately
  if (!c.exact) {
    // No operator version for the client's language → try on-device translation
    // and swap it in if the modal is still open.
    var target = (typeof _lang !== 'undefined' && _lang) ? _lang : c.lang;
    _translateEntry(c.title, c.body, c.lang, target).then(function (tr) {
      if (tr && (tr.title || tr.body) && document.getElementById('welcome-modal')) showWelcomeModal(tr.title || c.title, tr.body || c.body, w.updatedAt);
    }).catch(function () {});
  }
}
// Broadcast info toast: show immediately, then (on supported browsers) detect
// the message language and replace it with an on-device translation if needed.
var _bcSeq = 0;
function _showBroadcast(message, icon) {
  _bcSeq++; var seq = _bcSeq;
  showInfoToast(message, icon);
  _detectTranslate(message).then(function (tr) {
    if (tr && tr !== message && seq === _bcSeq && document.getElementById('srv-info-toast')) showInfoToast(tr, icon);
  }).catch(function () {});
}
window.maybeShowWelcome = maybeShowWelcome;
window.showWelcomeModal = showWelcomeModal;
window.hideWelcomeModal = hideWelcomeModal;
window._showBroadcast = _showBroadcast;


// Rafraîchit immédiatement l'avatar du joueur local dans l'UI
window.refreshMyAvatar = function() {
  // Resolve which avatar to use for ME (the local player).
  // Step 4 introduced a 3-way choice stored in localStorage.pth_avatar:
  //   '__pth__'  -> use the official PokerTH avatar image
  //   ''         -> use the initial letter
  //   anything else (e.g. '🦊') -> use that emoji
  // First-login auto-pick (Q2=c): if the user never expressed a choice
  // (key missing from localStorage, NOT just empty) AND we already have a
  // PokerTH avatar downloaded, default to the official one. Once the user
  // makes any selection in the popup, this auto-pick stops kicking in.
  var pthUrl = (typeof window._pthAvatarFor === 'function' && typeof myId !== 'undefined')
    ? window._pthAvatarFor(myId)
    : null;
  var stored = null;
  try { stored = localStorage.getItem('pth_avatar'); } catch(e) {}
  if (stored === null && pthUrl) {
    // First-login auto-pick: persist the sentinel.
    try { localStorage.setItem('pth_avatar', '__pth__'); } catch(e) {}
    stored = '__pth__';
    // Reflect the choice on the trigger and selected button if the popup
    // already exists. Safe no-ops if elements aren't there yet.
    var btnPth = document.getElementById('avp-btn-pth');
    if (btnPth) {
      btnPth.style.display = '';
      document.querySelectorAll('.avp-btn').forEach(function(b){
        b.classList.toggle('selected', b.dataset.av === '__pth__');
      });
    }
    var trig = document.getElementById('av-trigger');
    if (trig) {
      // Match the head selectAvatarPopup behaviour: trigger shows the
      // PokerTH chip logo, not the id-card emoji.
      trig.innerHTML = '<img src="/favicon.svg" alt="PokerTH" draggable="false" style="width:26px;height:26px;object-fit:contain;pointer-events:none">';
      trig.classList.add('has-avatar');
    }
  }
  // Image perso choisie par l'utilisateur (sentinelle '__img__') : le client
  // web ne peut PAS récupérer l'avatar serveur d'un compte (le serveur ne le
  // stocke pas par compte — il le reçoit du client à la connexion). On laisse
  // donc l'utilisateur fournir sa propre image, stockée localement en data URL.
  var customImg = (stored === '__img__')
    ? (function(){ try { return localStorage.getItem('pth_avatar_img') || null; } catch(e){ return null; } })()
    : null;
  // PokerTH avatar UPLOAD: render WHATEVER avatar was picked (custom image,
  // emoji, or initial letter) to a PNG so official clients see it. '__pth__'
  // uploads nothing -> the official default avatar is kept.
  try { _pthRefreshUpload(stored, (typeof myName !== 'undefined' ? (myName || '') : '')); } catch(e) {}
  // Effective choice: 'pth' | 'img' | 'initial' | 'emoji-xxx'
  var usePth   = (stored === '__pth__') && !!pthUrl;
  var emojiAv  = (stored && stored !== '__pth__' && stored !== '__img__') ? stored : '';
  var av = emojiAv; // back-compat var name used in the rest of the function
  _myAvatarCache = av;
  var display = av || (typeof myName !== 'undefined' ? (myName||'').charAt(0).toUpperCase() : '?');
  // Player-bar
  var pbAv = document.getElementById('g-myseat-av');
  if (pbAv) {
    if (usePth) {
      pbAv.innerHTML = '<img class="pb-pth-img" src="' + pthUrl + '" alt="" draggable="false">';
      pbAv.classList.add('has-pth-avatar');
    } else if (customImg) {
      pbAv.innerHTML = '<img class="pb-pth-img" src="' + customImg + '" alt="" draggable="false">';
      pbAv.classList.add('has-pth-avatar');
    } else if (stored === '__pth__') {
      // Q2=b: user picked the PokerTH avatar but no image is available
      // (e.g. they're a LAN player, or a pokerth.net guest, or the
      // avatar hasn't been downloaded yet). Show the official PokerTH
      // chip logo as a graceful placeholder instead of an initial.
      pbAv.innerHTML = '<img class="pb-pth-img" src="/favicon.svg" alt="" draggable="false">';
      pbAv.classList.add('has-pth-avatar');
    } else {
      pbAv.textContent = display;
      pbAv.classList.remove('has-pth-avatar');
    }
  }
  // Siège autour de la table
  var seatEls = document.querySelectorAll('#g-seats .seat');
  seatEls.forEach(function(seat) {
    if (seat.classList.contains('me')) {
      var avatarEl = seat.querySelector('.seat-avatar');
      if (!avatarEl) return;
      var img = avatarEl.querySelector('.seat-pth-img');
      // Decide which URL to use, in order of preference:
      //   1) the player's actual downloaded pokerth.net avatar
      //   2) the PokerTH chip logo (placeholder if the user picked
      //      '__pth__' but nothing is available yet -- Q2=b)
      //   3) nothing (fall back to emoji or initial)
      var effectiveUrl = usePth ? pthUrl
                       : (customImg ? customImg
                       : (stored === '__pth__' ? '/favicon.svg' : null));
      if (effectiveUrl) {
        if (!img) {
          img = document.createElement('img');
          img.className = 'seat-pth-img';
          img.draggable = false;
          img.alt = '';
          avatarEl.insertBefore(img, avatarEl.firstChild);
        }
        if (img.getAttribute('src') !== effectiveUrl) img.src = effectiveUrl;
        avatarEl.classList.add('has-pth-avatar');
      } else {
        if (img) img.remove();
        avatarEl.classList.remove('has-pth-avatar');
      }
      var ini = avatarEl.querySelector('.seat-initial');
      if (ini) ini.textContent = display;
      if (av) avatarEl.classList.add('emoji-av');
      else avatarEl.classList.remove('emoji-av');
    }
  });
  // Option (i): the PokerTH button stays visible in the popup at all
  // times (even before connect / for LAN users). If the user clicks it
  // but no avatar is ever downloaded, usePth ends up false (because the
  // && !!pthUrl guard above) and the rendering falls back gracefully to
  // the initial. This makes the popup behave consistently across all
  // login modes and lets users pre-pick "PokerTH avatar" before they
  // even connect.
};

  // ──────────────────────────────────────────────────────────────────
  // PokerTH avatar UPLOAD (scope A) — make the local *custom image* avatar
  // visible to official QML/desktop clients. Normalize to a small PNG,
  // compute its MD5, advertise the hash in InitMessage (field 8), and stream
  // the bytes back when the server asks (AvatarRequest handler). Chunks MUST
  // be <= 256 bytes (MAX_FILE_DATA_SIZE; server validates avatarblock 1..256).
  // Emoji / initial avatars are NOT uploaded (scope A).
  // ──────────────────────────────────────────────────────────────────

  // Compact MD5 (RFC 1321) over a Uint8Array -> Uint8Array(16). Pure JS:
  // SubtleCrypto offers SHA but not MD5, and PokerTH keys avatars by MD5.
  function _md5bytes(input) {
    function rol(x, c) { return (x << c) | (x >>> (32 - c)); }
    function add(a, b) { return (a + b) | 0; }
    var S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    var K = [], i;
    for (i = 0; i < 64; i++) K[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)) | 0;
    var msgLen = input.length;
    var withOne = msgLen + 1;
    var padZeros = ((withOne % 64) <= 56) ? (56 - (withOne % 64)) : (120 - (withOne % 64));
    var total = withOne + padZeros + 8;
    var buf = new Uint8Array(total);
    buf.set(input, 0);
    buf[msgLen] = 0x80;
    var bitLen = msgLen * 8;
    buf[total - 8] = bitLen & 0xff;
    buf[total - 7] = (bitLen >>> 8) & 0xff;
    buf[total - 6] = (bitLen >>> 16) & 0xff;
    buf[total - 5] = (bitLen >>> 24) & 0xff;
    var a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    var off;
    for (off = 0; off < total; off += 64) {
      var M = [], j;
      for (j = 0; j < 16; j++) {
        M[j] = (buf[off + j*4]) | (buf[off + j*4 + 1] << 8) | (buf[off + j*4 + 2] << 16) | (buf[off + j*4 + 3] << 24);
      }
      var A = a0, B = b0, C = c0, D = d0, k;
      for (k = 0; k < 64; k++) {
        var F, g;
        if (k < 16) { F = (B & C) | ((~B) & D); g = k; }
        else if (k < 32) { F = (D & B) | ((~D) & C); g = (5*k + 1) % 16; }
        else if (k < 48) { F = B ^ C ^ D; g = (3*k + 5) % 16; }
        else { F = C ^ (B | (~D)); g = (7*k) % 16; }
        F = add(add(add(F, A), K[k]), M[g]);
        A = D; D = C; C = B;
        B = add(B, rol(F, S[k]));
      }
      a0 = add(a0, A); b0 = add(b0, B); c0 = add(c0, C); d0 = add(d0, D);
    }
    var out = new Uint8Array(16), w, words = [a0, b0, c0, d0];
    for (w = 0; w < 4; w++) {
      out[w*4]     = words[w] & 0xff;
      out[w*4 + 1] = (words[w] >>> 8) & 0xff;
      out[w*4 + 2] = (words[w] >>> 16) & 0xff;
      out[w*4 + 3] = (words[w] >>> 24) & 0xff;
    }
    return out;
  }

  var _pthUploadSrc = null;
  var _pthUploadKey = null;
  function _pthClearMyUpload() {
    _pthUploadSrc = null;
    _pthUploadKey = null;
    try { window._pthMyUpload = null; } catch(e) {}
  }
  function _pthPrepareMyUpload(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') { _pthClearMyUpload(); return; }
    if (dataUrl === _pthUploadSrc && window._pthMyUpload) return;
    _pthUploadSrc = dataUrl;
    var img = new Image();
    img.onload = function() {
      try {
        var SZ = 96;
        var cv = document.createElement('canvas');
        cv.width = SZ; cv.height = SZ;
        var ctx = cv.getContext('2d');
        var s = Math.min(img.width, img.height) || SZ;
        var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, SZ, SZ);
        cv.toBlob(function(blob) {
          if (!blob) { _pthClearMyUpload(); return; }
          blob.arrayBuffer().then(function(ab) {
            var bytes = new Uint8Array(ab);
            // PokerTH server limits: MIN_AVATAR_FILE_SIZE=32, MAX_AVATAR_FILE_SIZE=30720.
            // Outside that range the server rejects -> only announce when valid.
            if (bytes.length < 32 || bytes.length > 30720) { _pthClearMyUpload(); return; }
            window._pthMyUpload = { bytes: bytes, hashBytes: _md5bytes(bytes), type: 1, size: bytes.length };
          }).catch(function() { _pthClearMyUpload(); });
        }, 'image/png');
      } catch(e) { _pthClearMyUpload(); }
    };
    img.onerror = function() { _pthClearMyUpload(); };
    img.src = dataUrl;
  }


  // Shared tail for the avatar-upload feature: take a 96x96 canvas, encode it
  // as PNG, enforce the server's size window [32, 30720], compute the MD5 and
  // publish window._pthMyUpload (consumed by buildInit + the AvatarRequest
  // handler). Out-of-range -> no announce (never a broken connection).
  function _pthCanvasToUpload(cv) {
    cv.toBlob(function(blob) {
      if (!blob) { _pthClearMyUpload(); return; }
      blob.arrayBuffer().then(function(ab) {
        var bytes = new Uint8Array(ab);
        if (bytes.length < 32 || bytes.length > 30720) { _pthClearMyUpload(); return; }
        window._pthMyUpload = { bytes: bytes, hashBytes: _md5bytes(bytes), type: 1, size: bytes.length };
      }).catch(function() { _pthClearMyUpload(); });
    }, 'image/png');
  }
  // Render an EMOJI avatar to a PNG (dark PokerTH disc + the emoji centered),
  // so official clients see the same thing shown on the web seat.
  function _pthPrepareEmojiUpload(emoji) {
    try {
      var SZ = 96;
      var cv = document.createElement('canvas'); cv.width = SZ; cv.height = SZ;
      var ctx = cv.getContext('2d');
      ctx.beginPath(); ctx.arc(SZ/2, SZ/2, SZ/2, 0, Math.PI*2); ctx.closePath();
      ctx.fillStyle = '#1d222b'; ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = "60px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla',sans-serif";
      ctx.fillText(emoji, SZ/2, SZ/2 + 2);
      _pthCanvasToUpload(cv);
    } catch(e) { _pthClearMyUpload(); }
  }
  // Render the INITIAL-letter avatar to a PNG (dark disc + gold bold letter).
  function _pthPrepareLetterUpload(letter) {
    try {
      var SZ = 96;
      var cv = document.createElement('canvas'); cv.width = SZ; cv.height = SZ;
      var ctx = cv.getContext('2d');
      ctx.beginPath(); ctx.arc(SZ/2, SZ/2, SZ/2, 0, Math.PI*2); ctx.closePath();
      ctx.fillStyle = '#1d222b'; ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#E3C800';
      ctx.font = "bold 52px system-ui,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
      ctx.fillText(letter, SZ/2, SZ/2 + 4);
      _pthCanvasToUpload(cv);
    } catch(e) { _pthClearMyUpload(); }
  }
  // Dispatcher: prepare the upload for WHATEVER avatar is selected.
  //   '__img__' -> custom image ; '__pth__' -> nothing (official default kept)
  //   non-empty  -> emoji string ; '' -> initial letter from the player name.
  // De-duped by key so we don't re-render on every avatar refresh.
  function _pthRefreshUpload(stored, name) {
    try {
      if (stored === '__img__') {
        var url = null; try { url = localStorage.getItem('pth_avatar_img') || null; } catch(e) {}
        if (!url) { _pthClearMyUpload(); return; }
        var ki = 'img:' + url;
        if (ki === _pthUploadKey && window._pthMyUpload) return;
        _pthUploadKey = ki; _pthPrepareMyUpload(url);
      } else if (stored === '__pth__') {
        _pthClearMyUpload();
      } else if (stored) {
        var ke = 'emoji:' + stored;
        if (ke === _pthUploadKey && window._pthMyUpload) return;
        _pthUploadKey = ke; _pthPrepareEmojiUpload(stored);
      } else {
        var letter = ((name && name.charAt(0)) || '?').toUpperCase();
        var kl = 'letter:' + letter;
        if (kl === _pthUploadKey && window._pthMyUpload) return;
        _pthUploadKey = kl; _pthPrepareLetterUpload(letter);
      }
    } catch(e) { _pthClearMyUpload(); }
  }

window.toggleAvatarPopup = function() {
  var popup = document.getElementById('avatar-popup');
  if (!popup) return;
  var open = popup.style.display === 'none' || popup.style.display === '';
  popup.style.display = open ? 'block' : 'none';
};

// selectAvatarPopup() lives in the <head> of pokerth-client.html. It
// must be defined inline so that buttons with onclick="selectAvatarPopup()"
// in the connect screen can call it before pokerth.js has loaded. A
// duplicate copy used to live here; it shadowed the head version and
// didn't know about the '__pth__' sentinel, leading to the visible
// '__pth__' string leaking into the trigger button. Removed.

// [Phase 2] toggleLang moved to public/modules/i18n.mjs (still global via window.toggleLang)

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
    if (straightHigh===12) return { r:9, label: t('hsRoyal'), tb:[] };
    return { r:8, label: t('hsSF', { r: rn[straightHigh] }), tb:[straightHigh] };
  }
  if (freq[0]===4) return { r:7, label: t('hsFour', { r: rn[top] }), tb: byFreq };
  if (freq[0]===3 && freq[1]===2) return { r:6, label: t('hsFull', { a: rn[top], b: rn[top2] }), tb: byFreq };
  if (isFlush) return { r:5, label: t('hsFlush'), tb: byFreq };
  if (isStraight) return { r:4, label: t('hsStraight', { r: rn[straightHigh] }), tb:[straightHigh] };
  if (freq[0]===3) return { r:3, label: t('hsThree', { r: rn[top] }), tb: byFreq };
  if (freq[0]===2 && freq[1]===2) {
    var p1=rn[top], p2=rn[top2];
    return { r:2, label: t('hsTwoPair', { a: p1, b: p2 }), tb: byFreq };
  }
  if (freq[0]===2) return { r:1, label: t('hsPair', { r: rn[top] }), tb: byFreq };
  return { r:0, label: t('hsHigh', { r: rn[ranks[0]] }), tb: byFreq };
}

// Comparaison de deux mains évaluées : >0 si a bat b, <0 si a perd, 0 si égalité
// stricte (split). Compare d'abord la catégorie (r 0-9) puis le départage (tb,
// rangs ordonnés par importance : paires/brelans d'abord, puis kickers).
function _cmpHand(a, b) {
  if (!a || !b) return 0;
  if (a.r !== b.r) return a.r - b.r;
  var ta = a.tb || [], tbb = b.tb || [];
  var n = Math.max(ta.length, tbb.length);
  for (var i = 0; i < n; i++) {
    var x = (ta[i] == null ? -1 : ta[i]);
    var y = (tbb[i] == null ? -1 : tbb[i]);
    if (x !== y) return x - y;
  }
  return 0;
}

// Encodage PokerTH UNIQUE pour toutes les cartes (0-indexé, 0..51) :
//   suit=['♦','♥','♠','♣'] → ♦=0, ♥=1, ♠=2, ♣=3
//   rank=['2','3',…,'K','A'] → 0..12
// Vérifié sur les assets PNG officiels (data/gfx/cards/default/*.png) :
//   0=2♦  12=A♦  13=2♥  25=A♥  26=2♠  38=A♠  39=2♣  51=A♣
// normalizeHoleCard() est désormais l'identité (validation seule).

// ═══════════════════════════════════════════════════════════
// RÉACTIONS RAPIDES
// ═══════════════════════════════════════════════════════════
var _reactionCounts = {}; // { emoji: count }
var _reactionTimers = {}; // timers de reset des compteurs
var _reactSeen = {};      // { 'pid|emoji': {t, via} } -- de-dup d'une reaction recue par 2 canaux (REACT: + /emoji)
// Mute local des reactions (preference utilisateur, persistee). ON => rien envoye ni recu, grille grisee.
var _reactMuted = (function(){ try { return localStorage.getItem('pth_react_muted') === '1'; } catch(e){ return false; } })();

// ── Catalogue des effets animés par réaction ──
// a = animation de l'emoji ; p = particules (objet, ou preset 'sparkle'/'shock'/'confetti')
var REACTION_FX = {
  '🎉':{a:'pop',p:'confetti'}, '🥳':{a:'pop',p:'confetti'}, '🎊':{a:'pop',p:'confetti'},
  '🔥':{a:'fire',p:{chars:['🔥','✦'],count:9,size:14,a0:-150,a1:-30,dist:70,g:-24,life:1000,rot:1}},
  '💰':{a:'pop',p:{chars:['🪙','💵','✦'],count:12,size:16,a0:-170,a1:-10,dist:72,g:90,life:1200,rot:1}},
  '🤑':{a:'pop',p:{chars:['🪙','💵'],count:10,size:16,a0:-170,a1:-10,dist:70,g:90,life:1100,rot:1}},
  '💎':{a:'shine',p:{chars:['✨','✦'],count:9,size:13,a0:0,a1:360,dist:64,life:850,rot:1}},
  '🤩':{a:'shine',p:{chars:['✨'],count:8,size:13,a0:0,a1:360,dist:60,life:800,rot:1}},
  '😂':{a:'shake',p:{chars:['💧'],count:7,size:13,a0:-30,a1:210,dist:55,g:36,life:850}},
  '🤣':{a:'shake',p:{chars:['💧'],count:7,size:13,a0:-30,a1:210,dist:55,g:36,life:850}},
  '👏':{a:'beat',p:{chars:['✦','✧'],count:9,color:'var(--gold)',size:13,a0:0,a1:360,dist:60,life:750}},
  '🙌':{a:'beat',p:{chars:['✦','✧'],count:9,color:'var(--gold)',size:13,a0:0,a1:360,dist:62,life:780}},
  '💪':{a:'flex',p:{chars:['✦'],count:6,color:'var(--gold)',size:13,a0:0,a1:360,dist:50,life:700}},
  '😱':{a:'shake',p:{chars:['💦'],count:6,size:12,a0:-120,a1:-60,dist:48,g:50,life:780}},
  '🤯':{a:'pop',p:'shock'},
  '🍀':{a:'spin',p:{chars:['✨','🍀'],count:8,color:'#7ee37e',size:13,a0:0,a1:360,dist:62,life:950,rot:1}},
  '🎰':{a:'spin',p:{chars:['✨','🪙'],count:9,size:14,a0:0,a1:360,dist:66,life:950,rot:1}},
  '👑':{a:'shine',p:{chars:['✨','⭐'],count:10,color:'var(--gold)',size:14,a0:0,a1:360,dist:70,life:1000,rot:1}},
  '😎':{a:'pop',p:'sparkle'}, '👍':{a:'beat',p:'sparkle'}, '🫡':{a:'pop',p:'sparkle'},
  '😍':{a:'beat',p:{chars:['❤️','💖'],count:8,size:16,a0:-160,a1:-20,dist:64,g:-30,life:1100}}
};
function _rfxDefault(){ return { a:'pop', p:'sparkle' }; }

// Génère les particules d'un effet dans le conteneur c (centré sur 0,0 du conteneur)
function _rfxSpawn(c, spec){
  if (spec === 'sparkle') spec = {chars:['✦','✧'],count:7,color:'var(--gold)',size:12,a0:0,a1:360,dist:54,life:700};
  if (spec === 'confetti'){ _rfxConfetti(c); return; }
  if (spec === 'shock'){
    var r = document.createElement('div'); r.className = 'rfx-ring';
    c.appendChild(r); setTimeout(function(){ r.remove(); }, 800);
    spec = {chars:['💥','✦'],count:8,size:15,a0:0,a1:360,dist:70,life:800};
  }
  if (!spec || typeof spec !== 'object') return;
  for (var i = 0; i < spec.count; i++){
    var p = document.createElement('span'); p.className = 'rfx-pt';
    if (spec.chars){ p.textContent = spec.chars[(Math.random()*spec.chars.length)|0]; p.style.fontSize = (spec.size||14)+'px'; }
    else { p.style.width = p.style.height = (spec.size||7)+'px'; p.style.background = spec.color||'var(--gold)'; p.style.borderRadius = spec.square?'1px':'50%'; }
    c.appendChild(p);
    var ang = (spec.a0 + Math.random()*(spec.a1 - spec.a0)) * Math.PI/180;
    var d = spec.dist * (0.55 + Math.random()*0.6);
    var dx = Math.cos(ang)*d, dy = Math.sin(ang)*d, g = spec.g||0;
    var rot = spec.rot ? (Math.random()*720 - 360) : 0, life = spec.life||1000;
    p.animate([
      {transform:'translate(-50%,-50%)', opacity:1, offset:0},
      {transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) rotate('+rot+'deg)', opacity:1, offset:.65},
      {transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+(dy+g)+'px)) rotate('+rot+'deg)', opacity:0, offset:1}
    ], {duration: life, easing:'cubic-bezier(.15,.7,.4,1)'});
    (function(el){ setTimeout(function(){ el.remove(); }, life + 60); })(p);
  }
}
function _rfxConfetti(c){
  var cols = ['#9b59b6','#e84393','#27ae60','#c0392b','#7ec8e3','#e67e22','#ffffff'];
  for (var i = 0; i < 24; i++){
    var p = document.createElement('span'); p.className = 'rfx-pt';
    p.style.width = (5 + Math.random()*4)+'px'; p.style.height = (7 + Math.random()*4)+'px';
    p.style.background = cols[(Math.random()*cols.length)|0]; p.style.borderRadius = '1px';
    c.appendChild(p);
    var ang = (-170 + Math.random()*160) * Math.PI/180, d = 70 + Math.random()*60;
    var dx = Math.cos(ang)*d, dy = Math.sin(ang)*d, rot = Math.random()*720 - 360, life = 1300 + Math.random()*400;
    p.animate([
      {transform:'translate(-50%,-50%)', opacity:1, offset:0},
      {transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) rotate('+rot+'deg)', opacity:1, offset:.5},
      {transform:'translate(calc(-50% + '+(dx*1.1)+'px), calc(-50% + '+(dy+130)+'px)) rotate('+(rot+120)+'deg)', opacity:0, offset:1}
    ], {duration: life, easing:'cubic-bezier(.2,.6,.4,1)'});
    (function(el){ setTimeout(function(){ el.remove(); }, life + 80); })(p);
  }
}

// Joue la chorégraphie animée d'une réaction à la position (x,y) — le siège du joueur
function playReactionFx(emoji, x, y){
  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var fx = REACTION_FX[emoji] || _rfxDefault();
  var c = document.createElement('div'); c.className = 'rfx';
  c.style.left = (x || window.innerWidth * 0.5) + 'px';
  c.style.top  = (y || window.innerHeight * 0.7) + 'px';
  document.body.appendChild(c);
  var big = document.createElement('span');
  big.className = 'rfx-big rfx-anim-' + (reduce ? 'pop' : fx.a);
  big.textContent = emoji;
  c.appendChild(big);
  if (!reduce) _rfxSpawn(c, fx.p);
  setTimeout(function(){ if (c.parentNode) c.remove(); }, 1800);
}

// Affiche la réaction animée (chorégraphie) à la position fournie (siège du joueur).
// Conserve la signature historique : appelée par showSeatReaction avec les coords du siège.
function showFloatingReaction(emoji, fromX, fromY) {
  playReactionFx(emoji, fromX, fromY);
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
  var EMOJIS = ["🎉", "🥳", "👏", "🙌", "💪", "🤣", "😂", "😬", "🤦", "😴", "👍", "😎", "🤩", "👀", "🤔", "😱", "😡", "😤", "🔥", "😮", "💰", "💎", "🎰", "🍀", "🃏", "💀", "🤑", "🫵", "🫡", "🤫"];
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

// Recevoir une réaction d'un autre joueur (via chat).
// IMPORTANT: the proxy broadcasts REACT:pid:emoji messages to EVERY
// connected client, regardless of which table they sit at. Until we
// route reactions through the actual PokerTH game-chat (which is
// table-scoped), we filter here client-side: if the sender is not at
// our table, ignore the reaction completely — no counter increment,
// no seat badge, no sound. Without this filter, reactions from another
// table would silently bump our counters and play the `playTone` chime,
// which is what the user reported hearing.
function handleIncomingReaction(pid, emoji, via) {
  if (_reactMuted) return;                       // reactions coupees localement : aucun rendu, badge ni son
  if (!window.seats || seats.indexOf(pid) < 0) return;
  via = via || 'react';
  var _k = pid + '|' + emoji, _now = Date.now(), _p = _reactSeen[_k];
  if (_p && _p.via !== via && _now - _p.t < 1500) { _reactSeen[_k] = { t: _now, via: via }; return; }
  _reactSeen[_k] = { t: _now, via: via };
  _reactionCounts[emoji] = (_reactionCounts[emoji] || 0) + 1;
  updateReactionCount(emoji);
  showSeatReaction(pid, emoji);
  // Notif sonore légère
  if (typeof playTone === 'function') playTone(800, 0.05, 0.08);
}

// Reflete l'etat "couper les reactions" : bouton barre + grille grisee/inerte.
function _applyReactMuteUI() {
  var grid = document.querySelector('#g-reaction-panel .react-grid');
  if (grid) grid.classList.toggle('react-muted', _reactMuted);
  var btn = document.getElementById('react-mute-toggle');
  if (btn) {
    btn.classList.toggle('muted', _reactMuted);
    btn.setAttribute('aria-pressed', _reactMuted ? 'true' : 'false');
  }
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
  if (isPair && hi >= 8) // TT JJ QQ KK AA
    return { stars: 3, label: t('pfPremium') };
  if (hi===12 && lo===11) // AK
    return { stars: 3, label: isSuited ? t('pfAKs') : t('pfAKo') };

  // ─ Très bonnes ★★☆
  if (isPair && hi >= 5) // 77 88 99
    return { stars: 2, label: t('pfMidPair') };
  if (hi===12 && lo>=8 && isSuited) // ATs AJs AQs
    return { stars: 2, label: t('pfStrongAceS') };
  if (hi===12 && lo>=8) // AT AJ AQ
    return { stars: 2, label: t('pfStrongAce') };
  if (hi===11 && lo===10 && isSuited) // KQs
    return { stars: 2, label: t('pfKQs') };
  if (hi===11 && lo===10) // KQ
    return { stars: 2, label: t('pfKQo') };

  // ─ Bonnes ★☆☆
  if (isPair && hi >= 2) // 44 55 66
    return { stars: 1, label: t('pfSmallPair') };
  if (isSuited && gap === 1 && lo >= 7) // connecteurs couleur hauts
    return { stars: 1, label: t('pfSuitedConn') };
  if (isSuited && hi >= 10 && lo >= 8)
    return { stars: 1, label: t('pfSuitedBroad') };
  if (hi===12 && lo >= 4) // As avec kicker moyen
    return { stars: 1, label: t('pfAceKicker') };

  // ─ Moyennes — connecteurs
  if (gap <= 2 && lo >= 5 && isSuited)
    return { stars: 0, label: t('pfSuitedConn') };
  if (gap <= 1 && lo >= 4)
    return { stars: 0, label: t('pfConnectors') };

  // ─ Faibles
  return { stars: -1, label: t('pfWeak') };
}



function normalizeHoleCard(n) {
  // FIX 2024-XX : suppression du remap suits → l'encodage est UNIQUE pour
  // hole et comm cards (vérifié sur les assets PNG officiels PokerTH :
  // 0..12=♦, 13..25=♥, 26..38=♠, 39..51=♣). La fonction reste pour
  // compat. binaire (les call sites passent toujours par .map(normalizeHoleCard))
  // mais devient une simple validation + identité.
  if (n == null || !Number.isInteger(n) || n < 0 || n > 51) return null;
  return n;
}

function evaluateBestHand(holeCards, commCards) {
  var all = holeCards.concat(commCards).filter(function(c){ return c != null && c >= 0 && c < 52; });
  if (all.length < 2) return null;
  var k = Math.min(5, all.length);
  var combos = _getCombos(all, k);
  var best = null;
  for (var i = 0; i < combos.length; i++) {
    var res = _evalFive(combos[i]);
    if (!best || _cmpHand(res, best) > 0) best = res;
  }
  return best;
}

// Distribution d'équité : probabilité d'obtenir chaque catégorie de main (rang
// 0..9) au showdown, à partir de mes 2 cartes + le board connu (0 à 5 cartes).
// Énumère EXACTEMENT quand il reste <= 2 cartes (flop : C(47,2)=1081 ; turn : 46 ;
// river : 1), sinon Monte-Carlo (préflop). Calcul DÉCOUPÉ en tranches ~10 ms via
// setTimeout pour ne jamais geler l'UI ; onDone({pct:[p0..p9], exact}) ou null.
// isStale() (optionnel) : si vrai entre deux tranches, on abandonne sans callback.
function _oddsCompute(hole, board, onDone, isStale) {
  function done(v) { try { onDone(v); } catch (e) {} }
  if (!hole || hole[0] == null || hole[1] == null) { done(null); return; }
  var b = (board || []).filter(function (c) { return c != null && c >= 0 && c < 52; });
  var seen = {}; seen[hole[0]] = true; seen[hole[1]] = true;
  for (var i = 0; i < b.length; i++) seen[b[i]] = true;
  var deck = []; for (var c = 0; c < 52; c++) if (!seen[c]) deck.push(c);
  var need = 5 - b.length; if (need < 0) need = 0;
  var hole2 = [hole[0], hole[1]];
  var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], total = 0;
  if (need === 0) {
    var r0 = evaluateBestHand(hole2, b);
    if (r0) { counts[r0.r]++; total = 1; }
    done(total ? { pct: counts.map(function (c) { return c / total; }), exact: true } : null);
    return;
  }
  var exact = (need <= 2);
  var combos = exact ? _getCombos(deck, need) : null;
  var TRIALS = exact ? combos.length : 1500;
  var n = deck.length, idx = 0;
  function now() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function chunk() {
    if (isStale && isStale()) return; // une street plus récente a pris le relais
    var start = now();
    while (idx < TRIALS) {
      var extra;
      if (exact) { extra = combos[idx]; }
      else { var picked = [], used = {}; while (picked.length < need) { var ri = (Math.random() * n) | 0; if (!used[ri]) { used[ri] = true; picked.push(deck[ri]); } } extra = picked; }
      var res = evaluateBestHand(hole2, b.concat(extra));
      if (res) { counts[res.r]++; total++; }
      idx++;
      if ((idx & 31) === 0 && (now() - start) > 10) break; // rendre la main toutes les ~10 ms
    }
    if (idx < TRIALS) { setTimeout(chunk, 0); }
    else { done(total ? { pct: counts.map(function (c) { return c / total; }), exact: exact } : null); }
  }
  chunk();
}


function animateChipToPot(pid, amount) {
  // Source : siège du joueur localisé via data-pid (fiable indépendamment de l'ordre DOM)
  var seatEl = document.querySelector('#g-seats [data-pid="' + pid + '"]');
  if (!seatEl) return;
  var sr = seatEl.getBoundingClientRect();
  var sx = sr.left + sr.width  / 2;
  var sy = sr.top  + sr.height / 2;

  // Cible : libellé du pot (#g-pot dans le pot-strip)
  var potEl = document.getElementById('g-pot');
  var zone  = document.getElementById('g-table-zone');
  var tx, ty;
  if (potEl) {
    var pr = potEl.getBoundingClientRect();
    tx = pr.left + pr.width  / 2;
    ty = pr.top  + pr.height / 2;
  } else if (zone) {
    var zr = zone.getBoundingClientRect();
    tx = zr.left + zr.width  / 2;
    ty = zr.top  + zr.height / 2;
  } else {
    return;
  }

  // Créer le jeton volant
  var chip = document.createElement('div');
  chip.className = 'flying-chip';
  chip.textContent = amount > 0 ? (amount > 999 ? Math.round(amount / 100) / 10 + 'k' : amount) : '';
  chip.style.left      = sx + 'px';
  chip.style.top       = sy + 'px';
  chip.style.transform = 'scale(0.7)';
  document.body.appendChild(chip);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      chip.style.left      = tx + 'px';
      chip.style.top       = ty + 'px';
      chip.style.transform = 'scale(1.1)';
      chip.style.opacity   = '0';
      setTimeout(function() { if (chip.parentNode) chip.parentNode.removeChild(chip); }, 700);
    });
  });
}



// [Phase 2] setLang moved to public/modules/i18n.mjs (still global via window.setLang)

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

// iOS (iPhone) Safari n'expose AUCUNE API Fullscreen sur les éléments : le
// bouton ⛶ ne faisait donc rien. On masque toutes les commandes plein écran
// quand l'API est absente (détection de capacité, pas de sniff d'UA → on
// garde le bouton sur desktop / Android / iPad qui, eux, le supportent).
function _hideFullscreenIfUnsupported() {
  var de = document.documentElement;
  var supported = !!(de.requestFullscreen || de.webkitRequestFullscreen
                     || de.mozRequestFullScreen || de.msRequestFullscreen);
  if (supported) return;
  try {
    document.querySelectorAll('[onclick*="toggleFullscreen"]').forEach(function(el) {
      el.style.display = 'none';
    });
  } catch(e) {}
}
_hideFullscreenIfUnsupported();

/* ═══════════════════ PWA INSTALL ═══════════════════
   Chromium (Android, desktop Chrome/Edge) fires `beforeinstallprompt`,
   giving a native one-tap install flow. iOS Safari exposes NO such API,
   so we show manual "Add to Home Screen" instructions in a popup. Other
   browsers fall back to the same manual popup once they expose the event.
   The control stays hidden whenever the app already runs standalone
   (i.e. it's already installed). */
(function () {
  var _deferredPrompt = null;

  function _isStandalone() {
    return (window.navigator && window.navigator.standalone === true)
      || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }
  function _isIOS() {
    var ua = navigator.userAgent || '';
    // iPadOS 13+ masquerades as Macintosh → detect via touch points.
    return /iP(hone|ad|od)/.test(ua)
      || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  }
  function _showBtn() { var b = document.getElementById('install-btn'); if (b) b.style.display = ''; }
  function _hideBtn() { var b = document.getElementById('install-btn'); if (b) b.style.display = 'none'; }

  function _tr(k, fallback) {
    try { if (typeof window.t === 'function') { var v = window.t(k); if (v && v !== k) return v; } } catch (e) {}
    return fallback;
  }

  // Capture Chromium's install event (suppress its own banner, defer to our button).
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    _deferredPrompt = e;
    if (!_isStandalone()) _showBtn();
  });

  // Once installed, retire the control.
  window.addEventListener('appinstalled', function () {
    _deferredPrompt = null;
    _hideBtn();
  });

  function _initInstallUI() {
    if (_isStandalone()) { _hideBtn(); return; }   // already installed → nothing to do
    if (_deferredPrompt)  { _showBtn(); return; }   // native prompt ready
    if (_isIOS())         { _showBtn(); return; }   // manual path (Safari has no event)
    // Other browsers: button is revealed by beforeinstallprompt above when it fires.
  }

  function _openManualPopup() {
    var body = document.getElementById('install-popup-body');
    var pop  = document.getElementById('install-popup');
    if (!body || !pop) return;
    var html;
    if (_isIOS()) {
      html =
        '<div class="ip-step"><span class="ip-ico">1.</span><span>' +
          _tr('installIosStep1', 'Tap the Share button <b>\u2191\u25A1</b> in Safari\u2019s toolbar.') + '</span></div>' +
        '<div class="ip-step"><span class="ip-ico">2.</span><span>' +
          _tr('installIosStep2', 'Choose <b>\u201CAdd to Home Screen\u201D</b>.') + '</span></div>' +
        '<div class="ip-step"><span class="ip-ico">3.</span><span>' +
          _tr('installIosStep3', 'Confirm with <b>Add</b> — the app lands on your home screen.') + '</span></div>';
    } else {
      html =
        '<div class="ip-step"><span class="ip-ico">\u22EE</span><span>' +
          _tr('installGenericStep1', 'Open your browser menu (\u22EE or \u22EF).') + '</span></div>' +
        '<div class="ip-step"><span class="ip-ico">\uFF0B</span><span>' +
          _tr('installGenericStep2', 'Choose <b>\u201CInstall app\u201D</b> or <b>\u201CAdd to Home Screen\u201D</b>.') + '</span></div>';
    }
    body.innerHTML = html;
    pop.style.display = 'flex';
  }

  // Wired to the install button in the connect icon bar.
  window.pwaInstall = function () {
    if (_deferredPrompt) {
      var dp = _deferredPrompt;
      _deferredPrompt = null;
      try { dp.prompt(); } catch (e) {}
      if (dp.userChoice && dp.userChoice.then) {
        dp.userChoice.then(function (res) {
          if (res && res.outcome === 'accepted') _hideBtn();
        }).catch(function () {});
      }
      return;
    }
    _openManualPopup();   // no native prompt → manual instructions
  };
  window.pwaInstallClose = function () {
    var pop = document.getElementById('install-popup');
    if (pop) pop.style.display = 'none';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initInstallUI);
  } else {
    _initInstallUI();
  }
})();

// Unlock audio on first interaction
// [Phase 2] AudioContext warm-up moved to public/modules/sounds.mjs

/* ═══════════════════ */

document.addEventListener("DOMContentLoaded", function() {
  // Auto-fill nick
  // One-time housekeeping: scrub the legacy 'pth_pass' key in case
  // it's still in localStorage from an older client version. The
  // password is NEVER persisted by this app — only the browser's
  // own keychain (via the <input autocomplete='current-password'>
  // attribute) holds it.
  try { localStorage.removeItem('pth_pass'); } catch(e) {}
  // Note: nickname restore for all modes is handled inside
  // App.onLoginModeChange(), which fires below once the saved mode
  // is reapplied. This gives us a single source of truth for the
  // 'which nickname to show for this mode' logic.
  // Restaurer l'avatar sauvegardé
  try {
    var savedAv = localStorage.getItem('pth_avatar') || '';
    selectAvatarPopup(savedAv);
  } catch(e) {}
  // Initialiser l'apparence du bouton d'assistance (état mémorisé).
  try { if (typeof window._applyAssistUI === 'function') window._applyAssistUI(); } catch(e) {}
  // Restore sound button state
  var sbtn = document.getElementById('sound-toggle-btn');
  if (sbtn && !_soundEnabled) {
    sbtn.textContent = '🔇';
    sbtn.style.color = 'var(--gold-dim)';
    sbtn.title = 'Unmute';
  }
  /**
   * Returns a stable Guest-XXXXX name persisted in localStorage.
   *
   * Without this, each tab / reload would generate a different random
   * Guest name. When several tabs of the same browser hit the server
   * within a few seconds (or worse: a desktop tab + a phone tab + a
   * PWA), the PokerTH server sees the same IP sending different Init
   * messages back-to-back and flags it as a brute-force attempt,
   * returning initBlocked for ~1 minute.
   *
   * By persisting one name per browser, all simultaneous sessions
   * from the same machine identify themselves with the same string,
   * which the server doesn't flag.
   *
   * Falls through to a fresh random name if localStorage is unavailable
   * (private mode under some browsers, disabled storage policy, etc.).
   */
  window.getOrCreateGuestName = function() {
    try {
      var k = 'pth_guest_name';
      var existing = localStorage.getItem(k);
      if (existing && /^Guest\d{5}$/.test(existing)) return existing;
      var fresh = 'Guest' + Math.floor(10000 + Math.random()*90000);
      localStorage.setItem(k, fresh);
      return fresh;
    } catch (e) {
      return 'Guest' + Math.floor(10000 + Math.random()*90000);
    }
  };

  var n = document.getElementById("nick");
  if (!n.value) n.value = window.getOrCreateGuestName();

  // Filter the avatar grid to a single category on load (otherwise the
  // connect-screen picker would show every category's emojis at once).
  try { if (typeof avpApplyDefaultCat === 'function') avpApplyDefaultCat(); } catch(e) {}

  // ── Share-link parameters (?host=&port=&tls=&table=) ──────────
  // If the page was opened from a "copy table link", prefill the
  // connect form with the encoded server params and remember which
  // table to auto-join once the lobby has loaded.
  // NOTE: this DOMContentLoaded block runs at GLOBAL scope (it is NOT
  // inside the App IIFE that contains handleMsg). So we publish the
  // pending table id on window._pendingAutoJoin, which the GameListNew
  // handler inside the IIFE reads. A bare `let _pendingAutoJoin` here
  // would be invisible to handleMsg and throw 'ReferenceError'.
  // window._shareLinkActive records that we arrived from a share link,
  // so the saved-prefs restore block below knows NOT to clobber the
  // host/port/mode we just prefilled, and so we can auto-connect.
  window._shareLinkActive = false;
  (function parseShareLink() {
    try {
      var sp = new URLSearchParams(window.location.search);
      var h = sp.get('host'), p = sp.get('port'),
          tls = sp.get('tls'), table = sp.get('table'),
          go = sp.get('go');
      // PWA manifest shortcuts open /?go=play or /?go=create. Remember the
      // intent on window so show('s-lobby') can fire it once the user has
      // connected and the lobby is visible. Read at GLOBAL scope (the App
      // IIFE's show() reads window._pendingGo).
      if (go === 'play' || go === 'create') window._pendingGo = go;
      if (h) { var hi = document.getElementById('host'); if (hi) hi.value = h; }
      if (p) { var pi = document.getElementById('port'); if (pi) pi.value = p; }
      if (tls !== null) {
        var ti = document.getElementById('use-tls');
        if (ti) ti.checked = (tls === '1');
      }
      if (table) {
        var t = parseInt(table, 10);
        // Published on window because parseShareLink runs at GLOBAL
        // scope (outside the App IIFE) — the GameListNew handler
        // inside the IIFE reads window._pendingAutoJoin.
        if (t > 0) window._pendingAutoJoin = t;
      }
      // When a share link targets a specific server, the most likely
      // intent is "join my friend's private server as an internet
      // guest". Pre-select that login mode so the guest doesn't have
      // to fiddle with the dropdown. Only override if a table was
      // actually specified (a bare host link could be anything).
      if (table) {
        var lm = document.getElementById('login-mode');
        if (lm && lm.value === 'auth') { /* keep credentialed if chosen */ }
        else if (lm) { lm.value = 'unauth'; if (App && App.onLoginModeChange) App.onLoginModeChange(); }
      }
      if (h || p || table || go) {
        // Only treat as a "share link" (which suppresses saved-prefs
        // restore of host/port/mode) when a server/table was actually
        // encoded. A bare ?go= shortcut must keep the user's saved server.
        if (h || p || table) window._shareLinkActive = true;
        // Clean the URL so a manual refresh doesn't re-trigger auto-join
        // (and so the link doesn't linger in the address bar). We keep
        // the pending join in memory (window._pendingAutoJoin).
        try { window.history.replaceState({}, '', window.location.pathname); } catch(e) {}
      }
    } catch(e) {}
  })();

  // Detect the page's own host/port FIRST, before restoring the saved mode
  // (which triggers onLoginModeChange). onLoginModeChange's LAN/private
  // branches read hostInput.dataset.autoHost to reset the server host back to
  // this machine; if autoHost isn't set yet, switching from a pokerth.net
  // mode to LAN/private wouldn't restore the local host and the form kept
  // pokerth.net:7234 — which is exactly why it only worked after a refresh.
  (function () {
    var _h = window.location.hostname;
    var _hi = document.getElementById('host');
    if (_hi && _h && _h !== 'localhost' && _h !== '127.0.0.1') {
      _hi.dataset.autoHost = _h;
    }
  })();

  // Snapshot "premier visiteur ?" de façon SYNCHRONE, AVANT que le handler
  // window.load (-> onServerOrGuestChange) n'écrive pth_server_mode avec la
  // valeur par défaut du menu. Sans ce snapshot, _applyLoginDefaults (async,
  // via /app-config) verrait la clé déjà écrite et croirait à un visiteur
  // existant -> le mode par défaut admin (ex. pokerth.net) ne s'appliquait jamais.
  try { window._pthHadServerMode = (localStorage.getItem('pth_server_mode') !== null); }
  catch (e) { window._pthHadServerMode = true; }

  // Restaurer le serveur préféré sauvegardé — SAUF si on arrive d'un
  // lien de partage, auquel cas les paramètres du lien doivent gagner
  // (sinon le host sauvegardé d'une session précédente écrase celui
  // du lien d'invitation).
  try {
    if (!window._shareLinkActive) {
      var savedHost  = localStorage.getItem('pth_host');
      var savedPort  = localStorage.getItem('pth_port');
      var savedProxy = localStorage.getItem('pth_proxy');
      var savedMode  = localStorage.getItem('pth_login_mode');
      if (savedHost)  { var hi = document.getElementById('host');  if (hi) hi.value = savedHost; }
      if (savedPort)  { var pi = document.getElementById('port');  if (pi) pi.value = savedPort; }
      if (savedProxy) { var xi = document.getElementById('proxy'); if (xi) xi.value = savedProxy; }
      if (savedMode)  { var mi = document.getElementById('login-mode'); if (mi) { mi.value = savedMode; App.onLoginModeChange && App.onLoginModeChange(); } }
      // Restore the visible server-mode (incl. 'offline' = training) and re-derive
      // the WHOLE connect UI from it, so the hint + shown/hidden fields always match
      // the dropdown — even when the browser restored the <select> by itself without
      // firing onchange (the bug where training showed the LAN/unauth hint).
      var savedSrv = localStorage.getItem('pth_server_mode');
      var smEl = document.getElementById('server-mode');
      if (savedSrv && smEl) smEl.value = savedSrv;
      if (App.onServerOrGuestChange && smEl && (savedSrv || savedMode || smEl.value === 'offline')) {
        App.onServerOrGuestChange();
      }
    }
  } catch(e) {}

  // Back/forward cache (bfcache) restores form state (incl. the server-mode
  // <select>) without firing onchange — re-sync the connect UI when shown.
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) {
      try { if (!window._shareLinkActive && App && App.onServerOrGuestChange) App.onServerOrGuestChange(); } catch (e) {}
    }
  });

  // Some browsers (notably iOS Safari) restore the server-mode <select> value
  // AFTER deferred scripts run — i.e. after our restore above — without firing
  // onchange. Re-sync once more on window 'load', when the select holds its final
  // restored value, so the hint / label / nick always match the visible dropdown
  // (incl. training, which would otherwise keep the previous mode's UI).
  window.addEventListener('load', function () {
    try { if (!window._shareLinkActive && App && App.onServerOrGuestChange) App.onServerOrGuestChange(); } catch (e) {}
  });

  // ── App-mode gating (admin → /app-config). The connect screen offers three
  //    entry modes via #server-mode: lan-dedi (LAN), pokerthnet, offline (bots).
  //    The admin can disable any; we hide the matching <option> here. fetch() is
  //    async so this lands AFTER the synchronous restore above. The 400 ms watcher
  //    treats localStorage('pth_server_mode') as the single source of truth, so if
  //    the mode we'd land on is disabled we rewrite that key to the first enabled
  //    mode — otherwise the watcher would keep forcing the disabled choice back.
  (function () {
    var MAP = { 'lan-dedi': 'lan', 'pokerthnet': 'pokerthnet', 'offline': 'offline' };
    function applyModes(modes) {
      var sm = document.getElementById('server-mode');
      if (!sm || !sm.options || !sm.options.length) return;
      var firstEnabled = null;
      for (var i = 0; i < sm.options.length; i++) {
        var opt = sm.options[i], key = MAP[opt.value], off = key && modes[key] === false;
        if (off) { opt.hidden = true; opt.disabled = true; opt.style.display = 'none'; }
        else if (firstEnabled === null) firstEnabled = opt.value;
      }
      if (firstEnabled === null) return;
      var want = null; try { want = localStorage.getItem('pth_server_mode'); } catch (e) {}
      var effective = want || sm.value;
      if (MAP[effective] && modes[MAP[effective]] === false) {
        try { localStorage.setItem('pth_server_mode', firstEnabled); } catch (e) {}
        sm.value = firstEnabled;
        try { if (window.App && App.onServerOrGuestChange) App.onServerOrGuestChange(); } catch (e) {}
      }
    }
    // First-visit default theme (admin → /app-config.defaultTheme). Applied ONCE,
    // and only when this browser has no theme picked yet — existing users keep
    // theirs. window.applyThemePreset comes from modules/theme.mjs (a module loaded
    // async), so we poll briefly for it. The preset writes the axis localStorage
    // keys, so on the next visit the early <head> applier restores it (zero flash)
    // and this guard short-circuits — it never re-applies.
    function _applyDefaultTheme(presetId) {
      if (!presetId) return;
      try {
        var keys = ['pth_theme', 'pth_table', 'pth_deck', 'pth_buttons', 'pth_pucks', 'pth_seat'];
        for (var i = 0; i < keys.length; i++) { if (localStorage.getItem(keys[i]) !== null) return; }
      } catch (e) { return; }
      var tries = 0;
      (function waitApply() {
        if (typeof window.applyThemePreset === 'function') { try { window.applyThemePreset(presetId); } catch (e) {} return; }
        if (tries++ < 60) setTimeout(waitApply, 50);
      })();
    }
    // First-visit default in-game settings (admin → /app-config.defaults). Same
    // first-visit-only rule as the theme, applied per toggle: we write each flag
    // ONLY when this browser has never set it, so a player's own choice is never
    // overridden, and once written it is never re-applied. Values are '0'/'1'
    // ('1' = on/active), matching the in-game toggles. Note: the menu reflects
    // these the moment it is opened; "Vibration"/"Assistance" read their flag once
    // at load, so on a brand-new browser those two settle on the next reload.
    function _applyDefaultSettings(defaults) {
      if (!defaults || typeof defaults !== 'object') return;
      var MAP = { haptic: 'pth_haptic', voice: 'pth_voice', assist: 'pth_assist', autobtn: 'pth_show_auto', quickbet: 'pth_show_pct', displaybb: 'pth_display_bb' };
      Object.keys(MAP).forEach(function (k) {
        var v = defaults[k];
        if (v !== '0' && v !== '1') return;
        try { if (localStorage.getItem(MAP[k]) === null) localStorage.setItem(MAP[k], v); } catch (e) {}
      });
    }
    // Default login form (admin → /app-config.loginDefaults). Two knobs:
    //  • mode — pre-selects the entry screen on a FIRST visit only (a returning player
    //           keeps whatever they last chose);
    //  • host — points LAN / dedicated at a specific server. The LAN/unauth branches
    //           derive BOTH host and proxy from hostInput.dataset.autoHost and rebuild
    //           them on every (re)connect, so the proxy auto-follows the host and can
    //           never go stale — the client always reconnects to this server.
    // A share link still wins; we re-derive the connect UI once at the end.
    function _applyLoginDefaults(login) {
      if (!login || typeof login !== 'object' || window._shareLinkActive) return;
      if (login.host) { try { var _hi = document.getElementById('host'); if (_hi) _hi.dataset.autoHost = login.host; } catch (e) {} }
      // Default entry mode: pre-select it on a first visit only if it's an enabled option.
      if (login.mode) {
        var hadMode = (window._pthHadServerMode !== false); // snapshot pris au chargement, avant que load n'écrive la clé
        if (!hadMode) {
          var sm = document.getElementById('server-mode');
          if (sm) {
            var okOpt = false;
            for (var i = 0; i < sm.options.length; i++) { if (sm.options[i].value === login.mode && !sm.options[i].disabled) { okOpt = true; break; } }
            if (okOpt) {
              sm.value = login.mode;
              var gc = document.getElementById('guest-mode-cb'); if (gc) gc.checked = (login.mode === 'pokerthnet'); // pokerth.net → Guest (no friction)
            }
          }
        }
      }
      try { if (window.App && App.onServerOrGuestChange) App.onServerOrGuestChange(); } catch (e) {}
    }
    // Server identity + admin table defaults pushed from /app-config.
    function _applyBranding(c) {
      if (!c) return;
      if (c.tableDefaults && typeof c.tableDefaults === 'object') window._adminTableDefaults = c.tableDefaults;
      if (c.tableNames && typeof c.tableNames === 'object') window._adminTableNames = c.tableNames;
      if (c.serverName) {
        var tn = document.querySelector('#s-connect .card-title-big');
        if (tn) tn.textContent = c.serverName;
        try { document.title = c.serverName; } catch (e) {}
      }
      if (c.serverTagline) {
        var ts = document.querySelector('#s-connect .card-subtitle');
        if (ts) ts.textContent = c.serverTagline;
      }
    }
    window._setSrvSourceTag = function (show) {
      var el = document.getElementById('srv-source-tag');
      if (!el) return;
      if (!show || window._pthNetSource !== 'auto') { el.style.display = 'none'; el.textContent = ''; el.removeAttribute('title'); return; }
      var resolved = !!(window._pthNetServer && window._pthNetServer.host);
      el.style.display = 'inline-block';
      if (resolved) {
        el.textContent = '\uD83C\uDF10 auto \u00b7 serverlist';
        el.style.color = 'var(--ok, #4ade80)';
        el.title = 'Server taken from the official PokerTH serverlist (auto-updating)';
      } else {
        el.textContent = '\uD83C\uDF10 auto \u00b7 serverlist \u26a0';
        el.style.color = 'var(--warn, #f59e0b)';
        el.title = 'Serverlist unreachable — using the built-in pokerth.net fallback';
      }
    };
    function go() {
      fetch('/app-config', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (c) { if (c) { window._pthNetServer = (c.pokerthnetServer && c.pokerthnetServer.host) ? c.pokerthnetServer : null; window._pthNetSource = (c.pokerthnetSource === 'auto') ? 'auto' : 'manual'; } if (c && c.modes) applyModes(c.modes); if (c && c.loginDefaults) _applyLoginDefaults(c.loginDefaults); if (c && c.welcome && c.welcome.enabled && typeof window.maybeShowWelcome === 'function') window.maybeShowWelcome(c.welcome); if (c && typeof c.defaultTheme === 'string') _applyDefaultTheme(c.defaultTheme); if (c && c.defaults) _applyDefaultSettings(c.defaults); _applyBranding(c); try { if (!window._shareLinkActive && window.App && App.onServerOrGuestChange) App.onServerOrGuestChange(); } catch (e) {} })
        .catch(function () {});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  })();

  // iOS Safari restores <select> values at an UNPREDICTABLE time — sometimes
  // even after 'load' — and WITHOUT firing onchange, silently desyncing the
  // connect UI from the visible dropdown (e.g. menu shows training but the hint
  // /label/nick stay on the previous mode). autocomplete=off is ignored there,
  // so we can't prevent it; instead we briefly watch the server-mode value after
  // load and re-derive the UI whenever it changes — whenever iOS lands it.
  (function () {
    var sm = document.getElementById('server-mode');
    if (!sm) return;
    // iOS Safari restores <select> values at unpredictable times — and keeps
    // FLIP-FLOPPING them — WITHOUT firing onchange, so the visible dropdown can
    // silently disagree with the user's real choice; re-deriving the UI off that
    // wrong value is exactly what rewrote the training screen with the previous
    // mode's pseudo / label / hint. So treat localStorage (pth_server_mode, written
    // on every REAL onchange) as the SINGLE SOURCE OF TRUTH: whenever the <select>
    // drifts from it, force it back and re-derive the whole connect UI. Permanent
    // and cheap (one compare / 400 ms); never fights the native picker (focused).
    setInterval(function () {
      if (window._shareLinkActive) return;
      // Ce contournement ne concerne QUE l'écran de connexion : ne rien faire
      // ailleurs (lobby/table) évite un réveil CPU ~2,5x/s inutile à vie (batterie).
      var _sc = document.getElementById('s-connect');
      if (!_sc || !_sc.classList.contains('active')) return;
      var want = null; try { want = localStorage.getItem('pth_server_mode'); } catch (e) {}
      if (want && sm.value !== want && document.activeElement !== sm) {
        sm.value = want;
        try { if (App && App.onServerOrGuestChange) App.onServerOrGuestChange(); } catch (e) {}
      }
      // While in training, hold the isolated training UI against late restoration:
      // login-mode on a no-account value (so setLang can't print the account label
      // and connect() can't demand a password), re-assert the free-nick label, and
      // restore the isolated pseudo (never while the user is actively typing).
      if (window._offlineMode || sm.value === 'offline') {
        var _lmf = document.getElementById('login-mode'); if (_lmf && _lmf.value !== 'unauth') _lmf.value = 'unauth';
        var _lblf = document.getElementById('nick-label');
        try { if (_lblf && window.I18N && window.I18N.t) _lblf.textContent = window.I18N.t('enterNickFree'); } catch (e) {}
        var _nf = document.getElementById('nick');
        var _w = ''; try { _w = localStorage.getItem('pth_offline_nick') || ''; } catch (e) {}
        if (_nf && document.activeElement !== _nf && _nf.value !== _w) _nf.value = _w;
        // The hint (#cstatus) isn't reasserted above, so a network-mode hint that
        // leaked in from a previous mode ('Chat… serveur privé', 'Entrez vos
        // identifiants pokerth.net', LAN note, guest hint) would persist in
        // training. Repair it — but ONLY when it currently shows one of those
        // KNOWN network hints, never a transient message (Initialisation…, errors),
        // so legitimate status text is left untouched.
        try {
          var T = (window.I18N && window.I18N.t) ? window.I18N.t : null;
          var _cs = document.getElementById('cstatus');
          if (T && _cs && window._forceOfflineHint) {
            var _t = _cs.textContent;
            if (_t === T('chatAvailPrivate') || _t === T('enterCredentials') ||
                _t === T('lanModeNote') || _t === T('guestHint')) {
              window._forceOfflineHint();
            }
          }
        } catch (e) {}
      }
    }, 800);
  })();

  // Keep the training pseudo fully isolated from the LAN / pokerth.net nicknames:
  // persist it on every keystroke while in offline mode. Combined with reading
  // pth_offline_nick only (no LAN fallback), the training name never mirrors nor
  // gets overwritten by a network nick, and survives mode switches reliably.
  (function () {
    var _nk = document.getElementById('nick');
    if (_nk) _nk.addEventListener('input', function () {
      if (window._offlineMode) { try { localStorage.setItem('pth_offline_nick', _nk.value.trim()); } catch (e) {} }
    });
  })();

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
    hostInput.dataset.autoHost = host; // remember the auto-detected value
    // Do NOT override the host if the current login mode targets pokerth.net
    // (onLoginModeChange already set it correctly above) — and NOT if we
    // arrived from a share link (its host param must win).
    var __modeEl = document.getElementById('login-mode');
    var __currentMode = __modeEl ? __modeEl.value : '';
    if (!window._shareLinkActive && __currentMode !== 'guest' && __currentMode !== 'auth') {
      hostInput.value = host;
    }
  }

  // ── Auto-connect from a share link ────────────────────────────
  // If we arrived via a "copy table link", connect automatically so
  // the guest lands straight in the lobby (and then auto-joins the
  // shared table via window._pendingAutoJoin). The nick field is
  // already populated — either a saved per-mode nick or a generated
  // guest name — so connect() has everything it needs. If for some
  // reason the nick is empty, we focus it instead and let the user
  // hit Connect themselves.
  if (window._shareLinkActive) {
    setTimeout(function() {
      try {
        var nickEl = document.getElementById('nick');
        var hasNick = nickEl && nickEl.value.trim();
        if (!hasNick) {
          // No usable nick — focus the field so the user just types
          // a name and hits enter/Connect.
          if (nickEl) { nickEl.focus(); }
          return;
        }
        if (App && typeof App.connect === 'function') {
          App.connect();
        }
      } catch(e) {}
    }, 350); // small delay so the SW-ready gate + form are settled
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
  // FIX bug "card=0 fantôme" : distingue champ absent (null) vs valeur 0 (carte 2♣/2♦)
  const u32orNull = (f, n) => f[n] ? f[n][0] : null;
  const sub  = (f, n) => f[n] ? decode(f[n][0]) : {};
  const raw  = (f, n) => f[n] ? f[n][0] : null;

  return { encode, decode, encodeVarint, decodeVarint, str, u32, u32orNull, sub, raw };
})();


// ═══════════════════════════════════════════════════════════
//  PTHCrypto — déchiffrement des cartes (comptes pokerth.net)
//
//  Sur pokerth.net, un joueur AUTHENTIFIÉ (compte enregistré + mot de
//  passe) reçoit ses deux cartes dans HandStartMessage.encryptedCards
//  (champ 3) au lieu de plainCards (champ 2). Le serveur les chiffre en
//  AES-128-CBC avec une clé/IV dérivés du mot de passe (SHA-1, sans sel),
//  exactement comme CryptHelper::BytesToKey + AES128Encrypt côté serveur.
//  Le plaintext déchiffré est : "uniqueId gameId handId card0 card1".
//
//  Implémentation AES pure-JS (déchiffrement seul) — Web Crypto ne sait
//  pas déchiffrer du CBC zéro-paddé (il exige du padding PKCS#7).
//  Validé contre un vecteur NIST + des vecteurs de référence générés
//  avec le même schéma que le serveur PokerTH.
// ═══════════════════════════════════════════════════════════
const PTHCrypto = (function () {
  // S-box / inverse S-box AES
  const _sb = (function () {
    const p = new Uint8Array(256), inv = new Uint8Array(256);
    let pp = 1;
    do {
      pp = (pp ^ (pp << 1) ^ ((pp & 0x80) ? 0x11b : 0)) & 0xff;
      // approche par table : on recalcule via l'affine standard
    } while (false);
    // Construction directe de la S-box (méthode classique log/exp GF(2^8))
    const log = new Uint8Array(256), exp = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) { exp[i] = x; log[x] = i; x ^= ((x << 1) ^ ((x & 0x80) ? 0x11b : 0)) & 0xff; x &= 0xff; }
    function inverse(a){ return a === 0 ? 0 : exp[(255 - log[a]) % 255]; }
    for (let i = 0; i < 256; i++) {
      let s = inverse(i), y = s;
      for (let k = 0; k < 4; k++) { y = (y << 1) | (y >>> 7); s ^= (y & 0xff); }
      s = (s ^ 0x63) & 0xff;
      p[i] = s; inv[s] = i;
    }
    return { box: p, inv };
  })();
  const SBOX_F = _sb.box, INV_SBOX = _sb.inv;

  function mul(a, b){ let r = 0; for (let i = 0; i < 8; i++){ if (b & 1) r ^= a; const hi = a & 0x80; a = (a << 1) & 0xff; if (hi) a ^= 0x1b; b >>= 1; } return r & 0xff; }
  const RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

  function expandKey(key){
    const w = new Uint8Array(176);
    w.set(key.subarray(0, 16));
    let n = 16, rc = 0; const t = new Uint8Array(4);
    while (n < 176){
      for (let i = 0; i < 4; i++) t[i] = w[n - 4 + i];
      if (n % 16 === 0){
        const tmp = t[0]; t[0] = t[1]; t[1] = t[2]; t[2] = t[3]; t[3] = tmp;
        for (let i = 0; i < 4; i++) t[i] = SBOX_F[t[i]];
        t[0] ^= RCON[rc++];
      }
      for (let i = 0; i < 4; i++){ w[n] = w[n - 16] ^ t[i]; n++; }
    }
    return w;
  }
  function invShiftRows(s){
    let t;
    t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
  }
  function invMixColumns(s){
    for (let c = 0; c < 4; c++){
      const i = c * 4, a0 = s[i], a1 = s[i+1], a2 = s[i+2], a3 = s[i+3];
      s[i]   = mul(a0,14)^mul(a1,11)^mul(a2,13)^mul(a3,9);
      s[i+1] = mul(a0,9)^mul(a1,14)^mul(a2,11)^mul(a3,13);
      s[i+2] = mul(a0,13)^mul(a1,9)^mul(a2,14)^mul(a3,11);
      s[i+3] = mul(a0,11)^mul(a1,13)^mul(a2,9)^mul(a3,14);
    }
  }
  function decryptBlock(rk, inB, off, out){
    const s = new Uint8Array(16);
    for (let i = 0; i < 16; i++) s[i] = inB[off + i];
    for (let i = 0; i < 16; i++) s[i] ^= rk[160 + i];
    for (let round = 9; round >= 1; round--){
      invShiftRows(s);
      for (let i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
      for (let i = 0; i < 16; i++) s[i] ^= rk[round * 16 + i];
      invMixColumns(s);
    }
    invShiftRows(s);
    for (let i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
    for (let i = 0; i < 16; i++) out[i] = s[i] ^ rk[i];
  }
  function cbcDecrypt(cipher, key, iv){
    const rk = expandKey(key);
    const out = new Uint8Array(cipher.length);
    const block = new Uint8Array(16);
    let prev = iv;
    for (let off = 0; off + 16 <= cipher.length; off += 16){
      decryptBlock(rk, cipher, off, block);
      for (let i = 0; i < 16; i++) out[off + i] = block[i] ^ prev[i];
      prev = cipher.subarray(off, off + 16);
    }
    return out;
  }

  async function _sha1(bytes){ return new Uint8Array(await crypto.subtle.digest('SHA-1', bytes)); }
  // BytesToKey de PokerTH (SHA-1, sans sel) :
  //   key = SHA1(SHA1(pwd))[0:16]
  //   iv  = SHA1(SHA1(pwd))[16:20] ++ SHA1(SHA1( SHA1(SHA1(pwd))++pwd ))[0:12]
  async function deriveKeyIv(pwdBytes){
    const keyBuf1 = await _sha1(await _sha1(pwdBytes));
    const cat = new Uint8Array(20 + pwdBytes.length);
    cat.set(keyBuf1, 0); cat.set(pwdBytes, 20);
    const keyBuf2 = await _sha1(await _sha1(cat));
    const key = new Uint8Array(keyBuf1.subarray(0, 16));
    const iv = new Uint8Array(16);
    iv.set(keyBuf1.subarray(16, 20), 0);
    iv.set(keyBuf2.subarray(0, 12), 4);
    return { key, iv };
  }

  // Déchiffre encryptedCards -> [card0, card1] (ou null si échec)
  function decryptCards(cipherBytes, key, iv){
    try {
      if (!cipherBytes || !key || !iv) return null;
      if (cipherBytes.length === 0 || (cipherBytes.length % 16) !== 0) return null;
      const plain = cbcDecrypt(cipherBytes, key, iv);
      let end = plain.length;
      while (end > 0 && plain[end - 1] === 0) end--;        // retire le zéro-padding
      const txt = new TextDecoder().decode(plain.subarray(0, end));
      const toks = txt.trim().split(/\s+/);                  // uniqueId gameId handId card0 card1
      if (toks.length < 5) return null;
      const c0 = parseInt(toks[toks.length - 2], 10);
      const c1 = parseInt(toks[toks.length - 1], 10);
      if (!Number.isFinite(c0) || !Number.isFinite(c1) || c0 < 0 || c0 > 51 || c1 < 0 || c1 > 51) return null;
      return [c0, c1];
    } catch (e) { return null; }
  }

  return { deriveKeyIv, decryptCards, cbcDecrypt };
})();


// ═══════════════════════════════════════════════════════════
//  MESSAGES POKERTH
//  Types définis dans PokerTHMessage.PokerTHMessageType (proto)
// ═══════════════════════════════════════════════════════════
const MSG = (() => {
  // Type IDs → numéro de champ dans PokerTHMessage
  const TYPE_FIELD = {
    1:2, 2:3, 3:4, 4:5, 5:6, 6:7,           // Announce,Init,AuthChallenge,…,InitAck
    7:8, 8:9, 9:10, 10:11, 11:12,             // AvatarRequest, AvatarHeader, AvatarData, AvatarEnd, UnknownAvatar
    12:13,                                     // PlayerList
    13:14, 14:15, 15:16, 16:17, 17:18,        // GameList*
    18:19, 19:20,                              // PlayerInfo req/reply
    21:22, 22:23, 23:24, 24:25, 25:26,        // Join*
    26:27, 27:28, 28:29, 29:30,               // GamePlayer*
    32:33, 33:34, 34:35, 35:36,                // Invite*: InvitePlayerToGame, InviteNotify, RejectGameInvitation, RejectInvNotify
    36:37, 37:38, 38:39,                       // StartEvent, StartEventAck, GameStartInitial
    40:41, 41:42, 42:43,                       // HandStart, PlayersTurn, MyActionRequest
    43:44,                                     // YourActionRejected
    44:45,                                     // PlayersActionDone
    45:46, 46:47, 47:48,                       // DealFlop, DealTurn, DealRiver
    48:49,                                     // AllInShowCards
    49:50, 50:51, 53:54,                       // EndOfHandShow, EndOfHandHide, EndOfGame
    62:63, 63:64, 64:65, 65:66,               // Statistics, Chat*
    67:68, 68:69,                              // TimeoutWarning, ResetTimeout
    73:74,                                     // Error
    78:79, 79:80, 80:81, 81:82, 55:56, 56:57, 57:58, 58:59, 59:60, 60:61, 61:62,              // Spectator*
  };

  const T = {
    Announce:1, Init:2, AuthChallenge:3, AuthClientResp:4, AuthServerVerif:5, InitAck:6,
    // Avatar download flow (step 2 of pokerth.net avatar feature):
    // client sends AvatarRequest with a unique requestId + 16-byte hash,
    // server replies with AvatarHeader (size+type), then 1..N
    // AvatarData chunks (~256 bytes each), then AvatarEnd. If the server
    // does not have the avatar, it replies with UnknownAvatar instead.
    AvatarRequest:7, AvatarHeader:8, AvatarData:9, AvatarEnd:10, UnknownAvatar:11,
    PlayerList:12,
    GameListNew:13, GameListUpdate:14, GameListPlayerJoined:15, GameListPlayerLeft:16,
    GameListAdminChanged:17,
    PlayerInfoRequest:18, PlayerInfoReply:19,
    JoinExisting:21, JoinNew:22, RejoinExisting:23,
    JoinNew:22, JoinGameAck:24, JoinGameFailed:25,
    GamePlayerJoined:26, GamePlayerLeft:27, GameAdminChanged:28, RemovedFromGame:29,
    InvitePlayerToGame:32, InviteNotify:33, RejectGameInvitation:34, RejectInvNotify:35,
    StartEvent:36, StartEventAck:37, GameStartInitial:38,
    HandStart:40, PlayersTurn:41, MyActionRequest:42,
    YourActionRejected:43,
    PlayersActionDone:44, DealFlop:45, DealTurn:46, DealRiver:47,
    AllInShowCards:48, EndOfHandShow:49, EndOfHandHide:50, EndOfGame:53,
    Statistics:62, ChatRequest:63, Chat:64, ChatReject:65,
    TimeoutWarning:67, ResetTimeout:68, Error:73,
    GameListSpectatorJoined:78, GameListSpectatorLeft:79,
    // Spectators on the table we're currently in (or watching).
    // Type 80/81 — separate from the lobby-level 78/79 which track
    // spectator counts across all tables.
    GameSpectatorJoined:80, GameSpectatorLeft:81,
    AskKickPlayer:55, AskKickDenied:56, StartKickPetition:57, VoteKickRequest:58,
    VoteKickReply:59, KickPetitionUpdate:60, EndKickPetition:61,
  };

  // Parse un buffer en {type, sub: champs du sous-message}
  function parse(buf) {
    const fields = Proto.decode(buf);
    const type = Proto.u32(fields, 1);
    const fn = TYPE_FIELD[type];
    const sub = fn && fields[fn] ? Proto.decode(fields[fn][0]) : {};
    return { type, sub };
  }

  // ─── SCRAM-SHA-1 (RFC 5802) — authenticated login to pokerth.net ──────
  // The official client authenticates via libgsasl SCRAM-SHA-1
  // (SessionData::CreateClientAuthSession(Gsasl*, user, password)). We reproduce
  // the same exchange with Web Crypto so account login is instant like the
  // native client, instead of the old empty-response shortcut that pokerth.net
  // no longer accepts directly:
  //   InitMessage.clientUserData = client-first-message  "n,,n=user,r=cnonce"
  //   AuthServerChallengeMessage = server-first-message  "r=..,s=..,i=.."
  //   AuthClientResponseMessage  = client-final-message  "c=biws,r=..,p=proof"
  // Maths: PBKDF2-SHA1 / HMAC-SHA1 / SHA1 (all in SubtleCrypto). Password is used
  // as-is; SASLprep of non-ASCII passwords is not implemented yet.
  const _scEnc = new TextEncoder();
  const _scDec = new TextDecoder();
  function _scNonce() {
    const r = new Uint8Array(18); crypto.getRandomValues(r);
    let bin = ''; for (let i = 0; i < r.length; i++) bin += String.fromCharCode(r[i]);
    return btoa(bin); // base64 is SCRAM-safe (contains no comma)
  }
  function _scName(x) { return String(x).replace(/=/g, '=3D').replace(/,/g, '=2C'); }
  function _scB64ToBytes(b64) {
    const bin = atob(b64); const o = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i); return o;
  }
  function _scBytesToB64(b) {
    let bin = ''; for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]); return btoa(bin);
  }
  async function _scHmac(keyBytes, dataBytes) {
    const k = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', k, dataBytes));
  }
  async function _scSha1(b) { return new Uint8Array(await crypto.subtle.digest('SHA-1', b)); }
  async function _scPbkdf2(passBytes, saltBytes, iters) {
    const k = await crypto.subtle.importKey('raw', passBytes, 'PBKDF2', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBytes, iterations: iters, hash: 'SHA-1' }, k, 160));
  }
  function scramClientFirst(username) {
    const cnonce = _scNonce();
    const bare = 'n=' + _scName(username) + ',r=' + cnonce;
    return { clientFirst: 'n,,' + bare, clientFirstBare: bare, cnonce: cnonce };
  }
  // Find the server-first-message among a decoded message's fields, so we don't
  // depend on its exact field number (it looks like "r=..,s=..,i=..").
  function scramFindServerFirst(subObj) {
    for (const k in subObj) {
      if (!Object.prototype.hasOwnProperty.call(subObj, k)) continue;
      const v = subObj[k] && subObj[k][0];
      if (v instanceof Uint8Array) {
        try {
          const t = _scDec.decode(v);
          if (/(^|,)r=/.test(t) && /,s=/.test(t) && /,i=\d/.test(t)) return t;
        } catch (e) {}
      }
    }
    return '';
  }
  async function scramClientFinal(password, clientFirstBare, serverFirst) {
    const a = {};
    serverFirst.split(',').forEach(function (kv) {
      const i = kv.indexOf('='); if (i > 0) a[kv.slice(0, i)] = kv.slice(i + 1);
    });
    const rnonce = a.r || '';
    const salt = _scB64ToBytes(a.s || '');
    const iters = parseInt(a.i || '0', 10);
    if (!rnonce || !salt.length || !(iters > 0)) throw new Error('bad SCRAM server-first');
    const finalBare = 'c=biws,r=' + rnonce;            // biws = base64("n,,")
    const authMsg = _scEnc.encode(clientFirstBare + ',' + serverFirst + ',' + finalBare);
    const salted = await _scPbkdf2(_scEnc.encode(String(password)), salt, iters);
    const clientKey = await _scHmac(salted, _scEnc.encode('Client Key'));
    const storedKey = await _scSha1(clientKey);
    const clientSig = await _scHmac(storedKey, authMsg);
    const proof = new Uint8Array(clientKey.length);
    for (let i = 0; i < proof.length; i++) proof[i] = clientKey[i] ^ clientSig[i];
    const serverKey = await _scHmac(salted, _scEnc.encode('Server Key'));
    const serverSig = await _scHmac(serverKey, authMsg);
    return { clientFinal: finalBare + ',p=' + _scBytesToB64(proof), serverSignatureB64: _scBytesToB64(serverSig) };
  }

  // Construit un InitMessage (guest, unauth ou authenticated user)
  // buildId = (CLIENT_TYPE_QT_WIDGET<<24)|(MAJOR<<16)|(MINOR<<8)|PATCH
  // = (0x01<<24)|(2<<16)|(0<<8)|6 = 0x01020006 = 16908294 (PokerTH 2.0.6)
  // Auth (loginType=1) : password en clair dans clientUserData (tag 7),
  //   sécurisé par TLS (mandatory côté serveur v2.0+).
  //   Ref: pokerth/src/net/clientstate.cpp:1465-1469 + serverlobbythread.cpp:1255-1256
  function buildInit(nick, major, minor, loginType, password, serverPass) {
    loginType = loginType !== undefined ? loginType : 0;
    const BUILD_ID = 16908294; // 0x01020006 — source: pokerth-live/src/constants/gameDefs.js
    const ver = Proto.encode([[1,0,major],[2,0,minor]]);
    const fields = [
      [1,2,ver],       // requestedVersion (= protocolVersion from Announce)
      [2,0,BUILD_ID],  // buildId composite: (type<<24)|(major<<16)|(minor<<8)|patch
      [5,0,loginType], // login: 0=guestLogin, 1=authenticatedLogin, 2=unauthenticatedLogin
      [6,2,nick],      // nickName (utilisé aussi pour authenticated login)
    ];
    // Mot de passe SERVEUR (authServerPassword, champ 4, string). Le serveur
    // le vérifie pour TOUS les types de login sur un build non-officiel
    // (config ServerPassword) — cf. serverlobbythread.cpp HandleNetPacketInit,
    // AVANT la branche guest/unauth/auth. Vide/absent → champ totalement omis,
    // pour qu'un serveur sans mot de passe voie "" == "" et accepte. Ignoré
    // par pokerth.net (build officiel : tout le bloc est compilé out).
    if (serverPass) {
      fields.push([4, 2, String(serverPass)]); // authServerPassword
    }
    // Authenticated login : clientUserData (tag 7) carries the SCRAM-SHA-1
    // *client-first-message*. NOTE: real SCRAM is temporarily DISABLED — our
    // proof was rejected by pokerth.net (the password->secret derivation needs
    // to be matched against the PokerTH source). Until then we use the legacy
    // path that connects (password in clientUserData + empty AuthClientResponse).
    if (loginType === 1 && password) {
      try { window._pthScram = null; } catch (e) {}
      let pwd = String(password);
      const enc = new TextEncoder().encode(pwd);
      if (enc.length > 256) {
        console.warn('[buildInit] password > 256 bytes UTF-8, truncated');
        pwd = new TextDecoder().decode(enc.slice(0, 256));
      }
      fields.push([7, 2, pwd]); // clientUserData = password (legacy)
    }
    // PokerTH avatar UPLOAD (scope A): advertise the prepared custom image's
    // MD5 so the server requests the bytes and relays the avatar to official
    // clients. InitMessage field 8 (avatarHash).
    try {
      var _up = (typeof window !== 'undefined') ? window._pthMyUpload : null;
      if (_up && _up.hashBytes && _up.hashBytes.length === 16) fields.push([8, 2, _up.hashBytes]);
    } catch(e) {}
    const init = Proto.encode(fields);
    return Proto.encode([[1,0,T.Init],[3,2,init]]);
  }

  // Chat lobby
  function buildChat(text) {
    const req = Proto.encode([[3,2,text]]);
    return Proto.encode([[1,0,T.ChatRequest],[64,2,req]]);
  }

  // Chat scoped to a specific table (targetGameId = field 1). The
  // server admin bot uses this scoping to know whether to interpret
  // a leading "/" as a game-admin command (notably /kick <name>).
  function buildGameChat(gameId, text) {
    const req = Proto.encode([[1,0,gameId],[3,2,text]]);
    return Proto.encode([[1,0,T.ChatRequest],[64,2,req]]);
  }

  // Rejoindre une table existante
  function buildJoin(gameId) {
    const join = Proto.encode([[1,0,gameId]]);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,join]]);
  }


  // JoinExistingGameMessage: gameId=1, password=2, autoLeave=3, spectateOnly=4
  function buildJoinGame(gameId, spectateOnly, password) {
    // JoinExistingGameMessage per proto:
    //   field 1: gameId       (required uint32)
    //   field 2: password     (optional string)
    //   field 3: autoLeave    (optional bool, default false)
    //   field 4: spectateOnly (optional bool, default false)
    //
    // The previous version set autoLeave=true whenever the caller asked
    // for spectate. That's wrong: autoLeave has nothing to do with
    // spectator mode (it tells the server 'kick me out of any other
    // games I'm in'). Sending autoLeave=true alongside a spectate request
    // was confusing the server enough that it never replied with
    // JoinGameAck — the 'Joining…' status hung forever.
    //
    // Emit only the fields the caller actually requested:
    const fields = [[1, 0, gameId]];
    if (password) fields.push([2, 2, password]);
    if (spectateOnly) fields.push([4, 0, 1]);
    const msg = Proto.encode(fields);
    return Proto.encode([[1,0,T.JoinExisting],[22,2,msg]]);
  }

  // RejoinExistingGameMessage: gameId=1, autoLeave=2 — message type 23,
  // envelope field 24. Reclaims the seat the server held after we dropped
  // (restores stack/position) instead of joining the table fresh.
  function buildRejoinGame(gameId) {
    const msg = Proto.encode([[1, 0, gameId]]);
    return Proto.encode([[1,0,T.RejoinExisting],[24,2,msg]]);
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
    // allowSpectators: proto field 15, optional bool, default true server-side.
    // We forward the bit explicitly so the UI can flip it.
    // - When opts.allowSpectators is undefined (older callers): omit the
    //   field so the server's default of true applies.
    // - When opts.allowSpectators is false: emit [15, 0, 0].
    // - When opts.allowSpectators is true: emit [15, 0, 1] (explicit, in
    //   case a future server changes the default).
    const allowSpec    = (typeof opts.allowSpectators === 'boolean')
                         ? (opts.allowSpectators ? 1 : 0)
                         : null;
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
      ...(allowSpec !== null ? [[15, 0, allowSpec]] : []),
    ]);
    const joinFields = [[1, 2, gameInfo]];
    if (opts.password) joinFields.push([2, 2, opts.password]);
    const msg = Proto.encode(joinFields);
    return Proto.encode([[1, 0, 22], [23, 2, msg]]);
  }

  function buildAuthResponse(token) {
    const tok = (token instanceof Uint8Array) ? token
              : (typeof token === 'string') ? _scEnc.encode(token)
              : new Uint8Array(0);
    const msg = Proto.encode([[1, 2, tok]]);
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

  // KickPlayerRequestMessage (type 30, sub-field 31). Admin only.
  // The server replies with GamePlayerLeft (leftKicked) broadcast to
  // all clients and a RemovedFromGame (kickedFromGame) to the kicked
  // player. We don't need to await a direct ack — the existing handlers
  // already update the seat list when they see GamePlayerLeft.
  function buildKickPlayer(gameId, playerId) {
    const msg = Proto.encode([[1,0,gameId],[2,0,playerId]]);
    return Proto.encode([[1,0,30],[31,2,msg]]);
  }

  // AskKickPlayerMessage (type 55, env field 56): gameId=1, playerId=2.
  // Asks the server to open a community vote-kick petition. The server
  // answers AskKickDenied if not allowed, else broadcasts StartKickPetition.
  function buildAskKickPlayer(gameId, playerId) {
    const msg = Proto.encode([[1,0,gameId],[2,0,playerId]]);
    return Proto.encode([[1,0,T.AskKickPlayer],[56,2,msg]]);
  }
  // VoteKickRequestMessage (type 58, env field 59): gameId=1, petitionId=2,
  // voteKick=3 (bool). Casts our vote on a running petition.
  function buildVoteKick(gameId, petitionId, voteYes) {
    const msg = Proto.encode([[1,0,gameId],[2,0,petitionId],[3,0,voteYes?1:0]]);
    return Proto.encode([[1,0,T.VoteKickRequest],[59,2,msg]]);
  }

  // RejectGameInvitationMessage (type 34, env field 35): gameId=1, myRejectReason=2.
  //   reason: 0 = rejectReasonNo (polite decline), 1 = rejectReasonBusy.
  function buildRejectInvite(gameId, reason) {
    const msg = Proto.encode([[1,0,gameId],[2,0,reason?reason:0]]);
    return Proto.encode([[1,0,T.RejectGameInvitation],[35,2,msg]]);
  }
  // InvitePlayerToGameMessage (type 32, env field 33): gameId=1, playerId=2.
  // Outgoing invite — ask the server to invite <playerId> to <gameId>.
  function buildInvitePlayer(gameId, playerId) {
    const msg = Proto.encode([[1,0,gameId],[2,0,playerId]]);
    return Proto.encode([[1,0,T.InvitePlayerToGame],[33,2,msg]]);
  }
  return { T, parse, scramClientFirst, scramClientFinal, scramFindServerFirst, buildInit, buildChat, buildGameChat, buildJoin, buildJoinGame, buildRejoinGame, buildStartEventAck, buildMyAction, buildCreateGame, buildLeaveGame, buildStartWithBots, buildKickPlayer, buildAskKickPlayer, buildVoteKick, buildRejectInvite, buildInvitePlayer };
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

  // ── Blind-raise schedule (forum: "better notification of blind increases") ──
  // Captured from NetGameInfo at JoinGameAck. _raiseMode: 1=every N hands,
  // 2=every N minutes. _raiseEvery: N (hands or minutes per mode).
  // _lastBlindsUpHand dedupes the "blinds up" toast per hand.
  let _raiseMode = 1;
  let _raiseEvery = 0;
  let _lastBlindsUpHand = 0;
  // endRaiseMode: 1=doubler, 2=ajouter _endRaiseValue, 3=garder la dernière.
  // Sert à prédire la PROCHAINE valeur de blind affichée dans l'explication.
  let _endRaiseMode = 1;
  let _endRaiseValue = 0;

  // ── Chip display mode: absolute value (¥) or big blinds (BB) ──
  // Pure display feature, no protocol impact. Toggled from the in-game
  // overflow menu and persisted. fmtChips() is the single formatter used
  // everywhere a live game amount is shown (pot, stacks, bets, action
  // buttons) so the whole table switches consistently.
  let _displayBB = false;
  try { _displayBB = (localStorage.getItem('pth_display_bb') === '1'); } catch (e) {}
  // Format a raw chip amount as either "1234 ¥" or "61,7 BB" depending on
  // the current mode. The big blind is smallBlind*2; if it's not known yet
  // (0, before the first hand) we fall back to the raw value to avoid a
  // divide-by-zero. One decimal, shown only when non-zero, with the decimal
  // separator following the active language.
  // Group a whole number with thousands separators following the active
  // language: French (and most others) use a thin/regular space — 1 000 000;
  // English uses a comma — 1,000,000. Improves readability of big stacks/pots.
  function _groupThousands(n) {
    var neg = n < 0;
    var s = String(Math.abs(Math.round(n)));
    var sep = (typeof _lang !== 'undefined' && _lang === 'en') ? ',' : '\u202F'; // narrow no-break space
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return (neg ? '-' : '') + s;
  }
  function fmtChips(amount) {
    var v = (typeof amount === 'number') ? amount : parseInt(amount, 10) || 0;
    if (!_displayBB) return _groupThousands(v) + ' ¥';
    var bb = (smallBlind || 0) * 2;
    if (!bb) return _groupThousands(v) + ' ¥';
    var n = v / bb;
    // Round to 1 decimal, drop a trailing .0
    var r = Math.round(n * 10) / 10;
    var s = (Math.abs(r % 1) < 1e-9) ? String(Math.round(r)) : r.toFixed(1);
    // Localised decimal separator: comma for every language except English.
    if (typeof _lang !== 'undefined' && _lang !== 'en') s = s.replace('.', ',');
    return s + ' BB';
  }
  // Amount formatted for SPEECH. Mirrors fmtChips' BB mode (already TTS-clean,
  // e.g. "12,5 BB"), but in chip mode returns the bare integer WITHOUT the
  // thousands separator: the narrow no-break space in _groupThousands makes
  // engines read "12 345" as two numbers. No ¥ glyph (its reading varies).
  function fmtChipsVoice(amount) {
    var v = (typeof amount === 'number') ? amount : parseInt(amount, 10) || 0;
    var bb = (smallBlind || 0) * 2;
    if (_displayBB && bb) {
      var n = v / bb;
      var r = Math.round(n * 10) / 10;
      var s = (Math.abs(r % 1) < 1e-9) ? String(Math.round(r)) : r.toFixed(1);
      if (typeof _lang !== 'undefined' && _lang !== 'en') s = s.replace('.', ',');
      return s + ' BB';
    }
    return String(v);
  }

  let gameState = 0;   // preflop/flop/turn/river
  let _playerAvatars = {}; // pid → emoji avatar (reçu des autres joueurs via proxy)
  let _playerImgAvatars = {}; // pid → data URL (avatar image perso diffusé via proxy)
  // Assistance (aide « force de la main » affichée au-dessus des actions) :
  // activée par défaut, mémorisée localement. '0' = désactivée.
  let _assistOn = true;
  try { _assistOn = (localStorage.getItem('pth_assist') !== '0'); } catch(e) {}
  // Step 1 of "PokerTH official avatar" feature: when PlayerInfoReply
  // arrives for a registered player who uploaded an avatar on pokerth.net,
  // it carries an AvatarData sub-message (field 5) with the hash + format.
  // We just record what we see here; downloading + displaying come later.
  //   _pthAvatarHashes[pid] = { type: 1|2|3, hashHex: 'a3f5...' }
  //   type: NetAvatarType from proto -- 1=PNG, 2=JPG, 3=GIF
  //   hashHex: lower-case hex string (easy logging & future cache keys)
  let _pthAvatarHashes = {};
  // pid -> code pays ISO 3166-1 alpha-2 (ex. 'FR'), reçu via PlayerInfoReply
  // (champ 4). Vide sur LAN / serveur privé qui ne le renseignent pas.
  let _playerCountries = {};
  // pid -> droits PokerTH (1=invité, 2=enregistré, 3=admin), via PlayerInfoReply.
  let _playerRights = {};
  // Step 2: outgoing AvatarRequest tracking. Keyed by hashHex so the same
  // avatar shared by N players is downloaded ONCE (Q2=A, dedup by hash).
  //   _pthAvatarsByHash[hex] = {
  //     status: 'pending' | 'done' | 'unknown' | 'error',
  //     type:   1|2|3,
  //     expectedSize: <bytes from AvatarHeader>,
  //     chunks: [Uint8Array, ...],   // not concatenated yet (step 3)
  //     received: <running total>,
  //   }
  let _pthAvatarsByHash = {};
  // requestId -> hashHex, so AvatarHeader/Data/End handlers can map
  // their requestId back to the right entry (the server's reply does
  // NOT echo the hash, only the requestId we chose).
  let _pthAvatarReqIdToHash = {};
  // Monotonic counter for AvatarRequest.requestId. Starts at 1 because
  // some servers refuse 0. Wraps around at 2^32 (we'll be long dead).
  let _pthNextAvatarReqId = 1;
  // Step 3: assembled Data URLs keyed by hashHex (the actual displayable
  // image, e.g. 'data:image/png;base64,iVBORw0KG...'). Built from chunks
  // at AvatarEnd, or restored from localStorage cache on startup.
  let _pthDataUrls = {};

  // LRU cache in localStorage (Q3=B, capped at 200 entries).
  // Keys:
  //   pthAv:<hashHex>  -> '<typeNum>|<dataUrl>'   (one entry per avatar)
  //   pthAv:_lru       -> JSON array of hashHex, most-recent first
  // 200 entries * ~5KB ~= 1MB which is comfortable within 5MB quota.
  const PTH_AV_MAX = 200;
  const PTH_AV_KEY = function(h) { return 'pthAv:' + h; };
  const PTH_AV_LRU_KEY = 'pthAv:_lru';

  function _pthLoadLruList() {
    try {
      const raw = localStorage.getItem(PTH_AV_LRU_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch(e) { return []; }
  }
  function _pthSaveLruList(list) {
    try { localStorage.setItem(PTH_AV_LRU_KEY, JSON.stringify(list)); }
    catch(e) { /* quota -- best-effort */ }
  }
  function _pthCacheGet(hashHex) {
    try {
      const raw = localStorage.getItem(PTH_AV_KEY(hashHex));
      if (!raw) return null;
      const i = raw.indexOf('|');
      if (i < 0) return null;
      const type = parseInt(raw.slice(0, i), 10) || 1;
      const dataUrl = raw.slice(i + 1);
      // Touch LRU: move this hash to the front.
      let lru = _pthLoadLruList().filter(function(h){ return h !== hashHex; });
      lru.unshift(hashHex);
      _pthSaveLruList(lru);
      return { type: type, dataUrl: dataUrl };
    } catch(e) { return null; }
  }
  function _pthCachePut(hashHex, type, dataUrl) {
    try {
      localStorage.setItem(PTH_AV_KEY(hashHex), type + '|' + dataUrl);
      let lru = _pthLoadLruList().filter(function(h){ return h !== hashHex; });
      lru.unshift(hashHex);
      // Evict oldest beyond cap.
      while (lru.length > PTH_AV_MAX) {
        const drop = lru.pop();
        try { localStorage.removeItem(PTH_AV_KEY(drop)); } catch(e) {}
      }
      _pthSaveLruList(lru);
    } catch(e) {
      // Quota exceeded or storage disabled. Try to evict half the cache
      // and retry once. If it still fails, just give up silently --
      // the avatar will simply be re-downloaded next time.
      try {
        let lru = _pthLoadLruList();
        const evictCount = Math.max(1, Math.floor(lru.length / 2));
        for (let i = 0; i < evictCount && lru.length > 0; i++) {
          const drop = lru.pop();
          try { localStorage.removeItem(PTH_AV_KEY(drop)); } catch(e2) {}
        }
        _pthSaveLruList(lru);
        localStorage.setItem(PTH_AV_KEY(hashHex), type + '|' + dataUrl);
        lru.unshift(hashHex);
        _pthSaveLruList(lru);
      } catch(e3) { /* really give up */ }
    }
  }

  // Concatenate the per-request Uint8Array chunks and convert to a
  // data: URL the browser can render directly as <img src>.
  function _pthAssembleDataUrl(chunks, type) {
    let total = 0;
    for (let i = 0; i < chunks.length; i++) total += chunks[i].length;
    const merged = new Uint8Array(total);
    let off = 0;
    for (let i = 0; i < chunks.length; i++) {
      merged.set(chunks[i], off);
      off += chunks[i].length;
    }
    // btoa needs a binary string. Build it in batches to avoid the
    // "Maximum call stack size exceeded" trap on String.fromCharCode(...arr).
    let bin = '';
    const STEP = 4096;
    for (let i = 0; i < merged.length; i += STEP) {
      const slice = merged.subarray(i, Math.min(i + STEP, merged.length));
      bin += String.fromCharCode.apply(null, slice);
    }
    const mime = type === 2 ? 'image/jpeg' : type === 3 ? 'image/gif' : 'image/png';
    return 'data:' + mime + ';base64,' + btoa(bin);
  }

  // Public helper used by the renderer: returns a Data URL for the
  // player or null. Considers cache + freshly assembled images.
  function _pthAvatarFor(pid) {
    const meta = _pthAvatarHashes[pid];
    if (!meta) return null;
    return _pthDataUrls[meta.hashHex] || null;
  }
  // Expose for refreshMyAvatar (defined at module top level)
  window._pthAvatarFor = _pthAvatarFor;
  let _myAvatarCache  = ''; // cache de l'avatar local (évite les lectures localStorage répétées)
  // Avatar feature: returns the emoji to display for the local player,
  // or '' if there is none. Crucially treats the '__pth__' sentinel as
  // "no emoji" so the literal string never leaks into the UI as text.
  // Use this everywhere we want an avatar-as-string (player-bar text
  // fallback, waiting list, winner overlay, etc.) -- do NOT read
  // localStorage.pth_avatar directly for display purposes.
  function _myAvatarDisplay() {
    var v = _myAvatarCache;
    if (!v) {
      try { v = localStorage.getItem('pth_avatar') || ''; } catch(e) { v = ''; }
    }
    return (v === '__pth__' || v === '__img__') ? '' : v;
  }
  // Same idea for broadcasting to other players: don't send the
  // sentinel over the wire (it would show as 4 weird chars on their
  // seat). When the local player picked '__pth__', they get the real
  // PokerTH avatar through their own PlayerInfoReply flow.
  function _myAvatarToBroadcast() {
    var v = '';
    try { v = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
    return (v === '__pth__' || v === '__img__') ? '' : v;
  }

  // Unified avatar-chip renderer for compact UI lists (waiting room,
  // winner banner, end-of-hand results table, etc.). Returns a single
  // HTML <span> -- already escaped where needed. The caller wraps it
  // in whatever container they want (no <li> / <div> assumed here).
  //
  // Decision tree per player (same priority order as the table seats):
  //   1. Real PokerTH avatar image downloaded for this pid -> <img>
  //   2. For me + I chose '__pth__' but image not downloaded ->
  //      placeholder /favicon.svg
  //   3. Emoji (mine from localStorage, others' from _playerAvatars)
  //   4. Bot fallback -> 🤖
  //   5. Final fallback -> first letter of the pseudo
  //
  // Args:
  //   pid        : player id (number)
  //   nick       : pseudo to use for the initial-letter fallback
  //   chipClass  : the CSS class on the wrapping <span>. Caller-defined
  //                because the 3 surfaces (wp-av, eg-winner-av,
  //                wc-player-av) have different sizes and colors.
  function _avatarChipHtml(pid, nick, chipClass) {
    var isMe = (pid === myId);
    // 1) real image?
    var pthUrl = (typeof _pthAvatarFor === 'function') ? _pthAvatarFor(pid) : null;
    // For me, honour the explicit choice (so picking an emoji or
    // initial suppresses my real downloaded image on these surfaces
    // too, same as on the table seat).
    if (pthUrl && isMe) {
      var myChoice = null;
      try { myChoice = localStorage.getItem('pth_avatar'); } catch(e) {}
      if (myChoice !== null && myChoice !== '__pth__') pthUrl = null;
    }
    // 2) placeholder logo for me when I chose __pth__ but no image yet
    if (!pthUrl && isMe) {
      var myChoice2 = null;
      try { myChoice2 = localStorage.getItem('pth_avatar'); } catch(e) {}
      if (myChoice2 === '__img__') {
        try { pthUrl = localStorage.getItem('pth_avatar_img') || null; } catch(e) { pthUrl = null; }
      }
      if (!pthUrl && myChoice2 === '__pth__') pthUrl = '/favicon.svg';
    }
    // Autres joueurs : image perso reçue via le proxy (prioritaire sur l'emoji).
    if (!isMe && _playerImgAvatars[pid]) pthUrl = _playerImgAvatars[pid];
    if (pthUrl) {
      return '<span class="' + chipClass + ' has-pth-avatar">'
           + '<img class="chip-pth-img" src="' + pthUrl + '" alt="" draggable="false">'
           + '</span>';
    }
    // 3) emoji? (mine via the sentinel-aware helper, others via _playerAvatars)
    var emoji = isMe ? _myAvatarDisplay() : (_playerAvatars[pid] || '');
    if (emoji) {
      return '<span class="' + chipClass + ' emoji-av">' + esc(emoji) + '</span>';
    }
    // 4) bots
    if (isBot(pid)) {
      return '<span class="' + chipClass + ' emoji-av">🤖</span>';
    }
    // 5) initial-letter fallback
    var letter = ((nick && nick[0]) || '?').toUpperCase();
    return '<span class="' + chipClass + ' letter">' + esc(letter) + '</span>';
  }
  // Expose so tests / debug can call it.
  window._avatarChipHtml = _avatarChipHtml;

  // Re-evaluate visibility of the "▶ Start" (no-bots) button based on
  // how many humans are currently at the table. Called from the
  // waiting-panel renderer on every refresh so the button appears as
  // soon as the second human arrives and disappears if they leave.
  //
  // Safety: only ever shows the button to the game admin. If the
  // admin button is hidden (we're not the admin) the function does
  // nothing — extra cheap-guard before counting.
  function refreshStartNoBotsVisibility() {
    if (!amGameAdmin || _gameStarted) {
      // Hide explicitly once the game has started — the renderer's
      // early-return otherwise leaves the button stuck on screen.
      var b1 = document.getElementById('admin-startnobots-btn');
      var b2 = document.getElementById('admin-startnobots-mob');
      if (b1) b1.style.display = 'none';
      if (b2) b2.style.display = 'none';
      return;
    }
    // Build the same pid set as renderWaitingPanel(): pids present in
    // seatData with .gone falsy, PLUS myId if missing (myId only
    // enters seatData via GamePlayerJoined for ourselves, which the
    // server sometimes elides — the renderer compensates the same way).
    var pids = Object.keys(seatData)
      .map(function(s){ return parseInt(s,10); })
      .filter(function(p){ return seatData[p] && !seatData[p].gone; });
    if (myId && pids.indexOf(myId) === -1) pids.push(myId);
    var showIt = pids.length >= 2;
    var btn  = document.getElementById('admin-startnobots-btn');
    var btnM = document.getElementById('admin-startnobots-mob');
    if (btn)  btn.style.display  = showIt ? '' : 'none';
    if (btnM) btnM.style.display = showIt ? '' : 'none';
  }
  window._refreshStartNoBotsVisibility = refreshStartNoBotsVisibility;

  // ──────────────────────────────────────────────────────────────
  // Lobby pseudo pill: avatar + name, click opens the player-info
  // modal (which has a 'Change avatar' button).
  // ──────────────────────────────────────────────────────────────
  function updateLobbyPill() {
    var el = document.getElementById('h-nick');
    if (!el) return;
    if (!myName) { el.textContent = '—'; return; }
    // The unified avatar chip helper handles all 5 fallback cases
    // (real PokerTH image / placeholder logo / emoji / bot / initial).
    // Wrap it in a tiny span so the CSS can size it independently of
    // whatever the chip class would normally enforce.
    var chip = _avatarChipHtml(myId, myName, 'h-nick-av');
    // Build: <span class="h-nick-av"...>...</span> <name>
    el.innerHTML = chip + ' ' + esc(myName);
  }
  window.updateLobbyPill = updateLobbyPill;

  // Code pays ISO 3166-1 alpha-2 -> balise <img> vers un drapeau SVG
  // auto-hébergé (/flags/<cc>.svg). On utilise une image plutôt que l'emoji
  // indicateur régional pour un rendu identique sur TOUS les OS (Windows
  // n'a pas les glyphes drapeau). Renvoie '' si le code est invalide.
  // `cls` : classe CSS optionnelle pour dimensionner selon le contexte.
  function _ccToFlag(cc, cls) {
    if (!cc || typeof cc !== 'string') return '';
    cc = cc.trim().toLowerCase();
    if (!/^[a-z]{2}$/.test(cc)) return '';
    return '<img class="cc-flag' + (cls ? ' ' + cls : '') + '" src="/flags/' + cc
         + '.svg" alt="' + cc.toUpperCase() + '" title="' + cc.toUpperCase()
         + '" draggable="false" loading="lazy" onerror="this.style.display=\'none\'">';
  }

  // ──────────────────────────────────────────────────────────────
  // Player-info modal -- shows the local player's avatar + name,
  // plus a 'Change avatar' button that opens the avatar picker.
  // ──────────────────────────────────────────────────────────────
  function openPlayerInfoPopup(pid) {
    var modal = document.getElementById('player-info-modal');
    if (!modal) return;
    // pid omis (ou === moi) → MON profil (comportement historique : stats +
    // changer d'avatar). Sinon → profil en LECTURE d'un adversaire.
    var targetPid = (pid == null) ? myId : pid;
    var isSelf = (targetPid === myId);
    _pimPid = targetPid;
    var avEl    = document.getElementById('pim-avatar');
    var nameEl  = document.getElementById('pim-name');
    var statsEl = document.getElementById('pim-stats');
    var infoEl  = document.getElementById('pim-info');
    // ── Grand avatar (cercle 96px). Pour MOI : on respecte le choix local
    //    (même ordre que la barre joueur). Pour un autre : même priorité que
    //    les sièges (image réelle > emoji reçu > 🤖 si bot > initiale). ──
    if (avEl) {
      avEl.classList.remove('is-letter');
      var url = null, emoji = null;
      if (isSelf) {
        var realPth = (typeof _pthAvatarFor === 'function') ? _pthAvatarFor(myId) : null;
        var stored = null;
        try { stored = localStorage.getItem('pth_avatar'); } catch(e) {}
        if (stored === '__pth__') {
          url = realPth || '/favicon.svg';   // vrai avatar sinon logo
        } else if (stored === '__img__') {
          try { url = localStorage.getItem('pth_avatar_img') || null; } catch(e) { url = null; }
        } else if (stored && stored !== '__pth__' && stored !== '__img__') {
          emoji = stored;
        }
      } else {
        url = (typeof _pthAvatarFor === 'function') ? _pthAvatarFor(targetPid) : null;
        if (_playerImgAvatars[targetPid]) url = _playerImgAvatars[targetPid];
        if (!url) emoji = _playerAvatars[targetPid] || (isBot(targetPid) ? '🤖' : '');
      }
      if (url) {
        avEl.innerHTML = '<img src="' + url + '" alt="" draggable="false">';
      } else if (emoji) {
        avEl.textContent = emoji;
      } else {
        avEl.classList.add('is-letter');
        var nm0 = isSelf ? myName : getPlayerName(targetPid);
        avEl.textContent = (nm0 && nm0[0] ? nm0[0] : '?').toUpperCase();
      }
      // Cliquable (→ sélecteur d'avatar) UNIQUEMENT pour mon propre profil.
      if (isSelf) {
        avEl.classList.add('pim-avatar-clickable');
        avEl.setAttribute('role', 'button');
        avEl.setAttribute('tabindex', '0');
        var _chTip = (typeof t === 'function') ? t('changeAvatar') : 'Change avatar';
        avEl.title = _chTip; avEl.setAttribute('aria-label', _chTip);
        avEl.onclick = function() { openAvatarPickerFromLobby(); };
        avEl.onkeydown = function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAvatarPickerFromLobby(); } };
      } else {
        avEl.classList.remove('pim-avatar-clickable');
        avEl.removeAttribute('role'); avEl.removeAttribute('tabindex');
        avEl.removeAttribute('title'); avEl.removeAttribute('aria-label');
        avEl.onclick = null; avEl.onkeydown = null;
      }
    }
    if (nameEl) nameEl.textContent = (isSelf ? myName : getPlayerName(targetPid)) || '';
    // Drapeau du pays (sous l'avatar) — code reçu via PlayerInfoReply.
    // Surtout présent sur pokerth.net ; masqué si inconnu.
    var flagEl = document.getElementById('pim-flag');
    if (flagEl) {
      var cc = _playerCountries[targetPid];
      var flagImg = _ccToFlag(cc, 'cc-flag-lg');
      if (flagImg) {
        flagEl.innerHTML = flagImg + '<span class="pim-flag-code">' + String(cc).toUpperCase() + '</span>';
        flagEl.style.display = '';
      } else {
        flagEl.innerHTML = '';
        flagEl.style.display = 'none';
      }
    }
    if (isSelf) {
      // Mon profil : onglets stats (l'avatar du popup est cliquable pour le changer).
      if (infoEl)    { infoEl.style.display = 'none'; infoEl.innerHTML = ''; }
      if (statsEl)   statsEl.style.display = '';
      _pimTab = 'session';
      _renderProfileStats();
    } else {
      // Adversaire : rôle + infos en jeu, pas de stats ni de bouton avatar.
      if (statsEl)   { statsEl.style.display = 'none'; statsEl.innerHTML = ''; }
      if (infoEl) {
        infoEl.innerHTML = _otherPlayerInfoHtml(targetPid);
        infoEl.style.display = '';
        // Community vote-kick entry — live (online) game only, seated
        // opponent, when we're seated and not the host (the host has the
        // direct kick). The server still arbitrates via AskKickDenied.
        try {
          if (!window._offlineMode && gId && targetPid !== myId && !amGameAdmin &&
              !_amSpectator && seatData[targetPid] && !seatData[targetPid].gone) {
            var _vkBtn = document.createElement('button');
            _vkBtn.className = 'pim-votekick-btn';
            _vkBtn.textContent = t('petitionAsk');
            _vkBtn.style.cssText = 'display:block;width:100%;margin-top:10px;padding:8px 0;' +
              'border:1px solid var(--gold,#E3C800);border-radius:8px;cursor:pointer;' +
              'background:transparent;color:var(--text,#eff1f5);font-weight:600';
            _vkBtn.addEventListener('click', function(){ _petAsk(targetPid); });
            infoEl.appendChild(_vkBtn);
          }
        } catch(e) {}
      }
    }
    modal.style.display = 'flex';
  }
  window.openPlayerInfoPopup = openPlayerInfoPopup;
  // Basculer l'ignorance d'un joueur (par nom) puis rafraîchir sièges + popup.
  window._toggleIgnore = function(pid){
    var nm = (typeof getPlayerName === 'function') ? getPlayerName(pid) : null;
    if (!nm) return;
    _setIgnoredName(nm, !_isIgnored(nm));
    try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
    try { openPlayerInfoPopup(pid); } catch (e) {}
  };

  // Contenu du popup pour un AUTRE joueur : rôle (🤖 Bot / Invité / Enregistré
  // / Admin), puis — s'il est attablé — ses jetons / mise / statut / position
  // (pastilles D-SB-BB), et un lien vers son profil pokerth.net s'il est
  // enregistré et qu'on est bien sur pokerth.net. Tout passe par t() → traduit.
  function _otherPlayerInfoHtml(pid) {
    function tt(k, fb) { var v = (typeof t === 'function') ? t(k) : null; return (v && v !== k) ? v : fb; }
    var html = '';
    // Rôle
    var roleTxt;
    if (isBot(pid)) {
      roleTxt = '🤖 ' + tt('piRoleBot', 'Bot');
    } else {
      var rg = _playerRights[pid] || 0;
      roleTxt = (rg === 3) ? tt('piRoleAdmin', 'Admin')
              : (rg === 2) ? tt('piRoleRegistered', 'Registered')
              : tt('piRoleGuest', 'Guest');
    }
    html += '<div class="pim-role">' + esc(roleTxt) + '</div>';
    // Infos en jeu (uniquement si le joueur est attablé / a des données siège).
    var sd = seatData[pid];
    if (sd) {
      var rows = '';
      function row(k, v) {
        return '<div class="pim-ig-row"><span class="pim-ig-k">' + esc(k) + '</span>'
             + '<span class="pim-ig-v">' + esc(v) + '</span></div>';
      }
      if (sd.money != null && sd.money >= 0) rows += row(tt('stack', 'Stack'), fmtChips(sd.money));
      if (sd.bet) rows += row(tt('piBet', 'Bet'), fmtChips(sd.bet));
      // Statut (un seul, par ordre de priorité).
      var st = '';
      if (sd.folded) st = tt('piStatusFolded', 'Folded');
      else if (sd.active === false) st = (sd.money != null && sd.money <= 0) ? tt('piStatusEliminated', 'Eliminated') : tt('piStatusSittingOut', 'Sitting out');
      else if (sd.money === 0) st = tt('piStatusAllIn', 'All-in');
      else if (pid === turnPid) st = tt('piStatusToAct', 'To act');
      // Position : pastilles universelles D / SB / BB (pas de traduction).
      var pos = '';
      if (pid === dealerPid)  pos += '<span class="pim-pos pim-pos-d">D</span>';
      if (pid === _lastSbPid) pos += '<span class="pim-pos pim-pos-sb">SB</span>';
      if (pid === _lastBbPid) pos += '<span class="pim-pos pim-pos-bb">BB</span>';
      var foot = '';
      if (st)  foot += '<span class="pim-status">' + esc(st) + '</span>';
      if (pos) foot += '<span class="pim-pos-wrap">' + pos + '</span>';
      html += '<div class="pim-ig">' + rows + (foot ? ('<div class="pim-ig-foot">' + foot + '</div>') : '') + '</div>';
    }
    // Lien vers le profil pokerth.net (joueurs enregistrés, mode guest/auth).
    var rg2 = _playerRights[pid] || 0;
    var modeEl = document.getElementById('login-mode');
    var onNet = !!(modeEl && (modeEl.value === 'guest' || modeEl.value === 'auth'));
    if (!isBot(pid) && onNet && (rg2 === 2 || rg2 === 3)) {
      // Coupes À LA DEMANDE : aucun réseau à l'ouverture. Le bouton déclenche
      // window._pimLoadCups(pid) → rkLoadPlayerCups remplit #pim-cups (1 fois).
      html += '<button type="button" id="pim-cups-btn" class="pim-cups-btn" onclick="window._pimLoadCups(' + pid + ')">🏆 '
            + esc(tt('piShowCups', 'Show cups')) + '</button>';
      html += '<div id="pim-cups" class="pim-cups"></div>';
      var nm = getPlayerName(pid);
      html += '<a class="pim-profile-link" href="https://www.pokerth.net/app.php/player?u='
            + encodeURIComponent(nm) + '" target="_blank" rel="noopener noreferrer">'
            + esc(tt('piViewProfile', 'View pokerth.net profile')) + '</a>';
    }
    var _ignNm = getPlayerName(pid);
    html += '<button type="button" class="pim-ignore-btn" onclick="window._toggleIgnore(' + pid + ')" '
          + 'style="display:block;width:100%;margin-top:10px;padding:8px 0;border:1px solid var(--border-hi,rgba(200,168,74,.4));border-radius:8px;cursor:pointer;background:transparent;color:var(--text,#eff1f5);font-weight:600">'
          + (_isIgnored(_ignNm) ? '🔔 ' + esc(tt('piUnignore', 'Unignore')) : '🔕 ' + esc(tt('piIgnore', 'Ignore'))) + '</button>';
    return html;
  }

  // Bloc stats du popup de profil — mêmes onglets que le panneau en jeu :
  // SESSION (toujours) / TOTAL (à vie, + bouton reset) / CLASSEMENT (proxy).
  // Les onglets TOTAL et CLASSEMENT n'apparaissent qu'en mode réseau (LAN +
  // serveur privé, _statsEligible) : sur pokerth.net direct, seul SESSION.
  // Réutilise _statsBodySession / _statsBodyLife / renderBoard pour rester
  // strictement identique au jeu (y compris le reset).
  var _pimTab = 'session';
  var _pimPid = 0; // pid actuellement affiché dans le popup (0 / myId = mon profil)
  function _pimSetTab(tab) { _pimTab = tab; _renderProfileStats(); }
  window._pimSetTab = _pimSetTab;

  function _renderProfileStats() {
    var box = document.getElementById('pim-stats');
    if (!box) return;
    var eligible = _statsEligible;
    var board    = _boardEligible;
    if (!eligible && _pimTab !== 'session') _pimTab = 'session';
    if (!board && _pimTab === 'board') _pimTab = 'session';
    function tb(id, label) {
      return '<button class="stats-tab'+(_pimTab===id?' active':'')+'" onclick="window._pimSetTab(\''+id+'\')">'+label+'</button>';
    }
    var tabs = eligible
      ? '<div class="stats-tabs">'+tb('session',t('statTabSession'))+tb('life',t('statTabLife'))
        + (board ? tb('board',t('statTabBoard')) : '') + '</div>'
      : '';
    var body;
    if (_pimTab === 'life')       body = _statsBodyLife();
    else if (_pimTab === 'board') body = '<div id="pim-board-body" class="stats-body"><div class="stat-empty">…</div></div>';
    else                          body = _statsBodySession();
    box.innerHTML = tabs + body;
    if (_pimTab === 'board') renderBoard('pim-board-body');
  }

  function closePlayerInfoPopup() {
    var modal = document.getElementById('player-info-modal');
    if (modal) modal.style.display = 'none';
  }
  window.closePlayerInfoPopup = closePlayerInfoPopup;

  // Coupes à la demande : appelé par le bouton « Voir les coupes » du popup.
  // Masque le bouton et lance le chargement (3 requêtes /api/player) une seule
  // fois, sur action explicite — jamais en automatique à l'ouverture.
  function _pimLoadCups(pid) {
    var btn = document.getElementById('pim-cups-btn');
    if (btn) btn.style.display = 'none';
    if (document.getElementById('pim-cups') && typeof window.rkLoadPlayerCups === 'function') {
      try { window.rkLoadPlayerCups(getPlayerName(pid), 'pim-cups'); } catch(e) {}
    }
  }
  window._pimLoadCups = _pimLoadCups;

  // ──────────────────────────────────────────────────────────────
  // Open the existing avatar-popup as a floating modal, from the
  // lobby (i.e. from inside the player-info modal). Difference vs
  // the connect-screen behaviour: we add .avatar-popup-as-modal so
  // the CSS positions it fixed/centered with a backdrop, and we
  // hook a one-shot click handler to close everything once the
  // user picks an avatar.
  // ──────────────────────────────────────────────────────────────
  // Track where the popup originally lived so we can put it back when
  // the user is done. The popup is statically defined inside #s-connect
  // (so the connect-screen avatar trigger can use it in flow), but when
  // we open it from the lobby #s-connect is display:none which would
  // hide the popup along with all its other descendants. So we move
  // the popup to <body> while showing it as a modal, then move it back.
  var _avatarPopupOrigParent = null;
  var _avatarPopupOrigNextSibling = null;
  var _avatarPickerBackdropHandler = null;
  var _avatarPickerBtnHandler = null;

  function openAvatarPickerFromLobby() {
    var picker = document.getElementById('avatar-popup');
    if (!picker) return;
    // Remember the original location so closeAvatarPickerFromLobby
    // can put the popup back exactly where it was.
    if (!_avatarPopupOrigParent) {
      _avatarPopupOrigParent = picker.parentNode;
      _avatarPopupOrigNextSibling = picker.nextSibling;
    }
    // Detach + re-attach to body so the parent's display:none can't
    // hide us. We do this every open in case the DOM was changed by
    // something else in between.
    if (picker.parentNode !== document.body) {
      document.body.appendChild(picker);
    }
    picker.classList.add('avatar-popup-as-modal');
    picker.style.display = 'block';
    // Apply the default/saved emoji category so the grid is filtered
    // (otherwise every category's emojis would show at once on first
    // open from the lobby). avpApplyDefaultCat is defined in the HTML
    // <head> script; guard in case of load-order differences.
    try { if (typeof avpApplyDefaultCat === 'function') avpApplyDefaultCat(); } catch(e) {}
    // Close-on-backdrop: a click on the popup background (NOT on any
    // child like the avatar buttons or the header) closes the picker.
    _avatarPickerBackdropHandler = function(e) {
      if (e.target === picker) {
        closeAvatarPickerFromLobby();
      }
    };
    picker.addEventListener('click', _avatarPickerBackdropHandler);
    // When the user picks an avatar, the existing selectAvatarPopup()
    // (attached as an inline onclick on each .avp-btn) sets the popup's
    // inline display:'none'. We piggy-back on that to also strip the
    // modal class and put the popup back in its original place. Using
    // capture phase + once:true so we run exactly once before the
    // onclick attribute fires (or right after, both are fine here).
    _avatarPickerBtnHandler = function(e) {
      var btn = e.target.closest('.avp-btn');
      if (!btn) return;
      // Let the inline onclick run first (it saves + closes), then
      // we clean up and refresh on the next tick.
      setTimeout(function() {
        closeAvatarPickerFromLobby();
        openPlayerInfoPopup();
        updateLobbyPill();
      }, 0);
    };
    picker.addEventListener('click', _avatarPickerBtnHandler, { once: true, capture: true });
  }
  window.openAvatarPickerFromLobby = openAvatarPickerFromLobby;

  function closeAvatarPickerFromLobby() {
    var picker = document.getElementById('avatar-popup');
    if (!picker) return;
    picker.classList.remove('avatar-popup-as-modal');
    picker.style.display = 'none';
    // Detach our backdrop handler. The btn handler is once:true, but it is
    // only consumed when an avatar is actually clicked — closing via the
    // backdrop (or the X) leaves it attached, so repeated open/close cycles
    // would stack dangling capture handlers. Remove it here too (matching the
    // capture flag it was added with). removeEventListener is a no-op if it
    // already fired.
    if (_avatarPickerBackdropHandler) {
      picker.removeEventListener('click', _avatarPickerBackdropHandler);
      _avatarPickerBackdropHandler = null;
    }
    if (_avatarPickerBtnHandler) {
      picker.removeEventListener('click', _avatarPickerBtnHandler, { capture: true });
      _avatarPickerBtnHandler = null;
    }
    // Put the popup back into its original parent so the connect
    // screen's static layout keeps working.
    if (_avatarPopupOrigParent && picker.parentNode !== _avatarPopupOrigParent) {
      if (_avatarPopupOrigNextSibling && _avatarPopupOrigNextSibling.parentNode === _avatarPopupOrigParent) {
        _avatarPopupOrigParent.insertBefore(picker, _avatarPopupOrigNextSibling);
      } else {
        _avatarPopupOrigParent.appendChild(picker);
      }
    }
  }
  window.closeAvatarPickerFromLobby = closeAvatarPickerFromLobby;

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
      case 2: return (_lang === 'fr') ? 'Inscrits seulement' : 'Registered only';
      case 3: return (_lang === 'fr') ? 'Sur invitation' : 'Invite only';
      default: return (_lang === 'fr') ? 'Partie normale' : 'Normal game';
    }
  }

  function openGameInfoPopup() {
    var modal = document.getElementById('game-info-modal');
    if (!modal) return;
    var titleEl = document.getElementById('gim-title');
    var subEl   = document.getElementById('gim-subtitle');
    var bodyEl  = document.getElementById('gim-body');
    if (!titleEl || !bodyEl) return;

    var fr   = (_lang === 'fr');
    var meta = _gameMeta || {
      id: gId, name: '—', type: 1, maxPlayers: 0,
      priv: false, timeout: gameTimeout, startMoney: gameStartMoney,
    };

    titleEl.textContent = meta.name + ' · #' + meta.id;

    // Subtitle: row of badges (admin / private). Hidden if both false.
    var badges = [];
    if (amGameAdmin) {
      badges.push('<span class="gim-badge">👑 ' + (fr ? 'Admin' : 'Admin') + '</span>');
    }
    if (meta.priv) {
      badges.push('<span class="gim-badge">🔒 ' + t('piPrivate') + '</span>');
    } else {
      badges.push('<span class="gim-badge">🌐 ' + t('piPublic') + '</span>');
    }
    subEl.innerHTML = badges.join(' ');

    // Body: 3 sections of label/value rows.
    var pot = 0;
    var potEl = document.getElementById('g-pot');
    if (potEl) {
      // Extract numeric part from "POT: 1234" / "Pot : 1234"
      var m = String(potEl.textContent || '').match(/[\d]+/);
      pot = m ? parseInt(m[0], 10) : 0;
    }
    var round = '—';
    var roundEl = document.getElementById('g-round');
    if (roundEl) round = (roundEl.textContent || '—').trim();

    // Count current players from seatData / seats. Spectators don't
    // count, only seated players that the server told us about.
    var activeCount = 0;
    if (Array.isArray(seats) && seats.length) {
      seats.forEach(function(pid){
        var sd = seatData[pid] || {};
        // Eliminated/sitting-out players still "exist" at the table but
        // are not actively playing this hand. We count them as joined
        // (they're at the table) but mark eliminated ones separately.
        if (sd.active !== false || sd.money > 0) activeCount++;
        else activeCount++; // count them anyway -- they're seated
      });
    }
    if (!activeCount) activeCount = Object.keys(seatData || {}).length;

    var sections = [];

    // ── Section 1: General info ──
    sections.push({
      title: t('piInformation'),
      rows: [
        [t('piType'),          _gameTypeLabel(meta.type)],
      ],
    });

    // ── Section 2: Configuration ──
    sections.push({
      title: t('piConfiguration'),
      rows: [
        [t('blinds'),
            (smallBlind || 0) + ' / ' + ((smallBlind || 0) * 2) + ' ¥'],
        [t('piStartingStack'),
            _groupThousands(meta.startMoney || 0) + ' ¥'],
        [t('piActionTimer'),
            (meta.timeout || gameTimeout || 15) + ' s'],
      ],
    });

    // ── Section 3: État de la partie ──
    sections.push({
      title: t('piGameState'),
      rows: [
        [t('players'),
            activeCount + ' / ' + (meta.maxPlayers || '?')],
        [t('piHandNo'),
            (handNum > 0) ? ('H#' + handNum) : t('piNotStarted')],
        [t('piPot'),
            _groupThousands(pot) + ' ¥'],
        [t('piPhase'),
            round],
      ],
    });

    // ── Section 4: Spectateurs (only if any) ──
    // Built from _specPids, populated by GameSpectatorJoined handlers.
    // Each row gets the same avatar treatment as the kick / players
    // list (via _avatarChipHtml: PokerTH image > emoji > initial > 🤖).
    // The user themselves is filtered out (we don't add ourselves to
    // _specPids in the join handler) so the list shows OTHER specs.
    // When the local user is themselves a spectator, we add a "(vous)"
    // entry up top so they see they're not invisible.
    var specRows = [];
    if (_amSpectator && myId) {
      // Show ourselves first, marked as such.
      var meName = (myName || ('#' + myId)) + ' ' +
                   '<span class="gim-spec-me">' +
                   t('piYou') +
                   '</span>';
      specRows.push({ pid: myId, html: meName });
    }
    _specPids.forEach(function(sp) {
      specRows.push({
        pid: sp,
        html: players[sp] ? esc(players[sp]) : ('#' + sp),
      });
    });

    var html = '';
    sections.forEach(function(s){
      html += '<div class="gim-section">';
      html += '<div class="gim-section-title">' + esc(s.title) + '</div>';
      s.rows.forEach(function(r){
        html += '<div class="gim-row">'
              + '<span class="gim-row-label">' + esc(r[0]) + '</span>'
              + '<span class="gim-row-value">' + esc(r[1]) + '</span>'
              + '</div>';
      });
      html += '</div>';
    });

    // Spectators section: rendered separately because it uses a
    // different row layout (avatar chip + name, like the kick modal).
    if (specRows.length) {
      html += '<div class="gim-section">';
      html += '<div class="gim-section-title">' +
              '👁 ' + esc(t('piSpectators')) +
              ' <span class="gim-section-count">(' + specRows.length + ')</span>' +
              '</div>';
      html += '<div class="gim-spec-list">';
      specRows.forEach(function(r) {
        var avChip = (typeof window._avatarChipHtml === 'function')
          ? window._avatarChipHtml(r.pid, players[r.pid] || ('#' + r.pid), 'gim-spec-av')
          : '<span class="gim-spec-av letter">?</span>';
        html += '<div class="gim-spec-row">' + avChip +
                '<span class="gim-spec-name">' + r.html + '</span></div>';
      });
      html += '</div></div>';
    }

    // ── Share / copy-link action ──
    // A full-width button at the bottom of the modal that copies a
    // deep link to this table (server + port + tls + table id). See
    // App.copyTableLink(). Only shown while actually in a game.
    if (gId) {
      html += '<div class="gim-section gim-share-section">' +
                '<button id="gim-copy-link-btn" class="gim-copy-link-btn" type="button" ' +
                  'onclick="App.copyTableLink()">' +
                  '🔗 ' + esc(fr ? 'Copier le lien d\'invitation' : 'Copy invite link') +
                '</button>' +
                '<div class="gim-share-hint">' +
                  esc(fr
                    ? 'Le destinataire rejoindra directement cette table.'
                    : 'The recipient will join this table directly.') +
                '</div>' +
              '</div>';
    }

    bodyEl.innerHTML = html;

    // Also add a "👁 N" badge to the subtitle when there's at least
    // one spectator (besides ourselves). Tiny detail but it makes
    // the spectator presence visible WITHOUT having to scroll the
    // modal — the badges are right under the title.
    if (_specPids.size > 0) {
      var specBadge = '<span class="gim-badge gim-badge-spec">👁 ' +
                      _specPids.size + '</span>';
      subEl.innerHTML = subEl.innerHTML + ' ' + specBadge;
    }

    modal.style.display = 'flex';
  }
  window.openGameInfoPopup = openGameInfoPopup;

  function closeGameInfoPopup() {
    var modal = document.getElementById('game-info-modal');
    if (modal) modal.style.display = 'none';
  }
  window.closeGameInfoPopup = closeGameInfoPopup;
  let seats     = [];  // player IDs in seat order (from GameStartInitial) — figé après 1ère main
  let seatData  = {};  // {pid: {money, bet, action, active, folded}}
  let _invSent = {}; // pids invited during the current invite-modal session
  let myCards   = [null, null];
  let commCards = [];
  // Clé/IV AES dérivés du mot de passe pour déchiffrer les cartes envoyées
  // chiffrées par pokerth.net aux comptes authentifiés (encryptedCards,
  // HandStart champ 3). Renseignés au moment de l'Init (mode 'auth'),
  // nuls sinon (LAN / invité → plainCards en clair).
  let _cardKey  = null;
  let _cardIV   = null;
  let highestBet= 0;
  let minRaise  = 0;
  let pot          = 0;
  let collectedPot = 0;  // bets accumulated from previous rounds
  let dealerPid = 0;
  let turnPid   = 0;
  let _lastSbPid = 0;   // SB/BB du dernier rendu, lus par le popup d'info joueur
  let _lastBbPid = 0;
  let _timerID  = null;   // setInterval handle
  let _timerSec = 0;      // seconds remaining
  let _timerTot = 30;     // total seconds
  let gameTimeout = 15;   // timeout par joueur (depuis les settings de la partie)
  // Starting stack for this table. Pulled from NetGameInfo.startMoney
  // (field 13, written by buildCreateGame) or set directly by the table
  // creator. Used as the default money value when GameStartInitial
  // initializes seatData — without this the stacks all start at 0 and the
  // Call button mis-fires as "Call 0 (All-In)" before any action lands.
  let gameStartMoney = 3000;

  // ── Statistiques de session ──
  var _stats = { handsPlayed:0, handsWon:0, startMoney:0, peakMoney:0, totalGain:0,
                 bigWin:0, bigLoss:0, history:[] };
  var _statsInited = false;

  // ── Lifetime stats + family leaderboard ───────────────────────────────
  // Persisted per nickname in localStorage; pushed to the proxy (/stats) so
  // every device sees the same board. Recorded ONLY on private-server / LAN
  // connections (set true at connect) — pokerth.net modes are never tracked.
  var _statsEligible = false;        // record lifetime stats at all (training OR private/LAN)
  var _boardEligible = false;        // shared family leaderboard + /stats push (private/LAN only)
  var _statsOffline  = false;        // training (vs bots) → isolated lifetime store, no board
  var _gameCounted = false;          // guard: count each finished game once
  // Training (vs bots) keeps its OWN persistent lifetime store, isolated from the
  // real private-server / LAN stats — they must never mix nor leak to the board.
  function _lifeKey()       { return _statsOffline ? 'pth_life_offline' : 'pth_life'; }
  function _lifeAll()       { try { return JSON.parse(localStorage.getItem(_lifeKey()) || '{}') || {}; } catch(e) { return {}; } }
  function _lifeSaveAll(o)  { try { localStorage.setItem(_lifeKey(), JSON.stringify(o)); } catch(e) {} }
  function _lifeBlank()     { return { handsPlayed:0, handsWon:0, net:0, bigWin:0, bigLoss:0, gamesPlayed:0, gamesWon:0, bestStreak:0, streak:0 }; }
  function _lifeGet(name)   { var a=_lifeAll(); return a[name] || _lifeBlank(); }
  var _lifePushTimer = null;
  function _pushStats() {
    if (!_boardEligible || !myName) return;   // training never touches the family board
    if (_lifePushTimer) clearTimeout(_lifePushTimer);
    _lifePushTimer = setTimeout(function() {
      var s = _lifeGet(myName);
      var av = ''; try { av = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
      if (av === '__pth__' || av === '__img__') av = ''; // ne pas envoyer le sentinelle
      fetch('/stats', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:myName, avatar:av,
          handsPlayed:s.handsPlayed, handsWon:s.handsWon, net:s.net, bigWin:s.bigWin,
          bigLoss:s.bigLoss, gamesPlayed:s.gamesPlayed, gamesWon:s.gamesWon, bestStreak:s.bestStreak })
      }).catch(function(){});
    }, 1500);
  }
  function _lifeRecordHand(won, delta) {
    if (!_statsEligible || !myName) return;
    var a = _lifeAll(); var s = a[myName] || _lifeBlank();
    s.handsPlayed++;
    if (won) { s.handsWon++; s.streak = (s.streak||0)+1; if (s.streak > s.bestStreak) s.bestStreak = s.streak; }
    else { s.streak = 0; }
    s.net += delta;
    if (delta > s.bigWin)  s.bigWin  = delta;
    if (delta < s.bigLoss) s.bigLoss = delta;
    a[myName] = s; _lifeSaveAll(a); _pushStats();
  }
  function _lifeRecordGame(won) {
    if (!_statsEligible || !myName) return;
    var a = _lifeAll(); var s = a[myName] || _lifeBlank();
    s.gamesPlayed++; if (won) s.gamesWon++;
    a[myName] = s; _lifeSaveAll(a); _pushStats();
  }
  function _lifeReset() {
    if (!myName) return;
    var a = _lifeAll(); delete a[myName]; _lifeSaveAll(a);
    if (_boardEligible) {
      try { fetch('/stats', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:myName, _delete:true }) }).catch(function(){}); } catch(e) {}
    }
  }
  // Merge two lifetime records keeping the better of each (mirrors the proxy's
  // monotonic merge): counters never regress, net follows the more complete
  // record. Preserves the local current `streak` (not stored server-side).
  function _lifeMerge(loc, srv) {
    var hp = Math.max(loc.handsPlayed||0, srv.handsPlayed||0);
    var gp = Math.max(loc.gamesPlayed||0, srv.gamesPlayed||0);
    var srvFresher = (srv.handsPlayed||0) > (loc.handsPlayed||0);
    return {
      handsPlayed: hp, gamesPlayed: gp,
      handsWon: Math.min(Math.max(loc.handsWon||0, srv.handsWon||0), hp),
      gamesWon: Math.min(Math.max(loc.gamesWon||0, srv.gamesWon||0), gp),
      bestStreak: Math.max(loc.bestStreak||0, srv.bestStreak||0),
      bigWin: Math.max(loc.bigWin||0, srv.bigWin||0),
      bigLoss: Math.min(loc.bigLoss||0, srv.bigLoss||0),
      net: srvFresher ? (srv.net||0) : (loc.net||0),
      streak: loc.streak||0
    };
  }
  // Reseed this device's lifetime totals from the shared board at connect, so a
  // fresh browser/device doesn't keep pushing a near-blank snapshot. The proxy
  // would reject the regression anyway, but reseeding also fixes the TOTAL tab
  // display on the new device. Runs once per connect when eligible.
  function _lifeSeedFromServer() {
    if (!_boardEligible || !myName) return;
    fetch('/stats', { cache:'no-store' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if (!data || !data[myName]) return;
        var a = _lifeAll();
        a[myName] = _lifeMerge(a[myName] || _lifeBlank(), data[myName]);
        _lifeSaveAll(a);
        if (_statsOpen) renderStats();
      }).catch(function(){});
  }
  var _myStackAtHandStart = null;    // mon stack réel au début de la main (avant blinds)
  var _seatStackAtHandStart = {};    // {pid: stack début de main} → net exact de chaque joueur
  // Snapshot des résultats figés à la FIN de la main (avant que la main
  // suivante ne réinitialise les stacks). Lu par showWinnerOverlay() pour
  // afficher des nets corrects, même si la donne suivante a déjà démarré.
  // {pid: {money, net, card1, card2, folded, inHand}}
  var _handResultSnapshot = {};

  // ── Positions des sièges (pour les animations) ──
  var _lastPixPos = [];  // [{top, left}] dans l'ordre de rotated
  var _potCenter  = {x:0, y:0}; // centre du pot à l'écran
  let amInGame  = false;
  let myName    = '';

  // Nom de table par défaut localisé (FR: "Table de X", EN: "X's table").
  function _localDefaultName() {
    var tpl = (typeof t === 'function' && t('tableNameDefault')) || 'Table {name}';
    return tpl.replace('{name}', myName || 'PokerTH');
  }
  // Nom de table imposé par l'admin pour le mode de connexion courant
  // (admin -> /app-config.tableNames). Renvoie null si l'admin n'a rien fixé
  // pour ce mode -> on retombe alors sur le nom auto localisé. Mapping :
  // offline -> 'offline' ; pokerth.net (guest/auth) -> 'pokerthnet' ;
  // LAN / serveur privé (lan/unauth) -> 'lan'.
  function _adminNameForMode() {
    var a = window._adminTableNames;
    if (!a || typeof a !== 'object') return null;
    var key = window._offlineMode ? 'offline'
            : (_currentLoginMode === 'guest' || _currentLoginMode === 'auth') ? 'pokerthnet'
            : 'lan';
    var v = a[key];
    return (typeof v === 'string' && v.trim()) ? v.trim() : null;
  }
  // Nom par défaut effectif du champ « nom de la table » : nom admin du mode
  // courant s'il existe, sinon le défaut auto localisé (« Table {nom} »).
  function _defaultNameForMode() {
    return _adminNameForMode() || _localDefaultName();
  }
  // Make a game name the PokerTH server will accept. Server rule
  // (serverlobbythread.cpp): the name is trimmed, then rejected as
  // badGameName if it is empty OR isprint() is false for its first *byte*.
  // In the server's C locale isprint() is false for bytes >127, so a name
  // whose first character is non-ASCII (Cyrillic, Arabic, CJK, an emoji…)
  // is refused — e.g. the Russian default "Стол…" starts with 0xD0. We
  // guarantee a printable-ASCII leading character; the rest may be any
  // script (only the first byte is checked server-side).
  // Max game-name length accepted, aligned with the official PokerTH client
  // (createInternetGameDialog uses maxLength=48). The web client refuses to
  // create a table when the typed name exceeds it, with a translated message.
  const MAX_GAME_NAME = 48;
  function _safeGameName(raw) {
    var s = (raw || '').trim();
    var leadOk = function(str) {
      if (!str) return false;
      var c = str.charCodeAt(0);
      return c >= 0x20 && c <= 0x7E;
    };
    if (leadOk(s)) return s;
    if (!s) {                              // empty after trim
      var nm = (myName || '').trim();
      return leadOk(nm) ? nm : 'PokerTH';
    }
    return 'PokerTH - ' + s;               // keep the user's text, ASCII lead
  }
  // Re-localise le champ "nom de la table" au changement de langue, MAIS seulement
  // s'il est vide ou contient encore un nom par défaut connu (on ne touche jamais à
  // un nom personnalisé par l'utilisateur). Appelé depuis setLang (i18n.mjs).
  window._localizeCreateNameField = function() {
    var el = document.getElementById('cf-name');
    if (!el) return;
    var cur = (el.value || '').trim();
    var nm = myName || 'PokerTH';
    var known = ['Table de ' + nm, nm + "'s table", 'Table ' + nm, 'My table', ''];
    var adminN = _adminNameForMode();
    if (adminN) known.push(adminN);
    if (known.indexOf(cur) >= 0) el.value = _defaultNameForMode();
  };
  let games     = {};   // gameId → {name, mode, players, maxPlayers, type, priv}
  let players   = {};   // playerId → name
  let _openTables = new Set(); // gids whose lobby player-list panel is expanded
  let loaded    = false;
  // Table-list filter (design A chips): 'all' | 'open' | 'nopass' | 'live'.
  // Persisted so the choice survives reloads, like other lobby prefs.
  let _tableFilter = (function(){
    try { return localStorage.getItem('pth_table_filter') || 'all'; } catch(e) { return 'all'; }
  })();
  let autoAction = false;
  let amGameAdmin = false;  // true if we created this game

  // Snapshot of the current table's settings, captured at JoinGameAck.
  // games[gId] is deleted from the lobby dict when the table closes
  // (GameListUpdate with mode === 3), so we keep our own copy. Used
  // by openGameInfoPopup() to populate the table-info modal even
  // after the table no longer appears in the lobby list.
  let _gameMeta = null;
  let _gameStarted = false; // flips true on GameStartInitial; freezes waiting-panel updates
  let _seatsFrozen = false; // one-way latch: true once the original seating order is set, never unset until leave/closeTable
  let _amSpectator = false; // true when we joined via 'Regarder' / spectateGame() — disables actions, shows banner

  // ── Haptic feedback (mobile) ──────────────────────────────────
  // Vibrates the device when it becomes the user's turn. Especially
  // useful when the app is backgrounded (sound may be muted by the
  // OS but vibration still fires). Gated by a persisted flag so the
  // user can turn it off; defaults ON. navigator.vibrate is a no-op
  // / undefined on desktop browsers and iOS Safari (which doesn't
  // support the Vibration API), so we feature-detect every call.
  let _hapticEnabled = (function() {
    try { return localStorage.getItem('pth_haptic') !== '0'; } catch(e) { return true; }
  })();
  function hapticBuzz(pattern) {
    if (!_hapticEnabled) return;
    try {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern || 60);
      }
    } catch(e) {}
  }
  function toggleHaptic() {
    _hapticEnabled = !_hapticEnabled;
    try { localStorage.setItem('pth_haptic', _hapticEnabled ? '1' : '0'); } catch(e) {}
    // Give immediate tactile + textual confirmation.
    if (_hapticEnabled) hapticBuzz(40);
    else { try { if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(0); } catch(e) {} } // cancel any queued buzz
    var label = _hapticEnabled
      ? t('hapticOn')
      : t('hapticOff');
    if (typeof showKeyHint === 'function') showKeyHint(label);
    // Direct header twin (tablet/desktop): icon-only.
    var bd = document.getElementById('haptic-toggle-btn');
    if (bd) bd.textContent = (_hapticEnabled ? '📳' : '📴');
    return _hapticEnabled;
  }
  window.toggleHaptic = toggleHaptic;

  // ── Toggle chip display between absolute value (¥) and big blinds (BB) ──
  function toggleDisplayBB() {
    _displayBB = !_displayBB;
    try { localStorage.setItem('pth_display_bb', _displayBB ? '1' : '0'); } catch (e) {}
    // Repaint everything that shows a live amount.
    try { if (typeof renderSeats === 'function' && seats.length) renderSeats(); } catch (e) {}
    // Re-render the action buttons only if they're currently showing (i.e.
    // it's our turn — the bar holds a raise input). Otherwise they'll be
    // rebuilt with the right unit on the next turn anyway.
    try {
      if (typeof renderMyTurnActions === 'function' &&
          document.getElementById('raise-amt')) renderMyTurnActions();
    } catch (e) {}
    try { repaintPot(); } catch (e) {}
    if (typeof showKeyHint === 'function') showKeyHint(_displayBB ? t('displayBB') : t('displayChips'));
    return _displayBB;
  }
  // Re-render the pot label from the last known pot value, in the current
  // mode. We keep the last numeric pot in _lastPotValue (set by setPot) so a
  // mode switch can repaint without a server message.
  var _lastPotValue = null;
  function setPot(pot) {
    _lastPotValue = (typeof pot === 'number') ? pot : (parseInt(pot, 10) || 0);
    var a = document.getElementById('g-pot');
    var b = document.getElementById('g-potbar');
    if (a) a.textContent = t('pot') + ' ' + fmtChips(_lastPotValue);
    if (b) b.textContent = t('pot') + ' ' + fmtChips(_lastPotValue);
  }
  function repaintPot() {
    if (typeof _lastPotValue !== 'number') return;
    setPot(_lastPotValue);
  }
  window.toggleDisplayBB = toggleDisplayBB;

  // Speaks game events (player actions, your turn, winner) in the active
  // language. Opt-in (default OFF), persisted, toggled from the ••• menu.
  // No-ops gracefully where speechSynthesis is unavailable.
  let _voiceEnabled = (function() {
    try { return localStorage.getItem('pth_voice') === '1'; } catch(e) { return false; }
  })();
  // Maps a UI language code (i18n catalogue key, e.g. 'fr', 'pt-BR',
  // 'zh-TW') onto a BCP-47 tag for the speech engine, so each of the 36
  // languages is voiced in its own tongue rather than always fr-FR/en-US.
  // Unknown codes pass through; the picker then matches by primary subtag,
  // falling back to the browser default voice.
  function _voiceLangTag(code) {
    var c = String(code || 'fr').toLowerCase();
    var M = {
      af:'af-ZA', bg:'bg-BG', ca:'ca-ES', cs:'cs-CZ', da:'da-DK', de:'de-DE',
      el:'el-GR', en:'en-US', es:'es-ES', fi:'fi-FI', fr:'fr-FR', gd:'gd-GB',
      gl:'gl-ES', hi:'hi-IN', hr:'hr-HR', hu:'hu-HU', it:'it-IT', ja:'ja-JP',
      ko:'ko-KR', lt:'lt-LT', nb:'nb-NO', nl:'nl-NL', pl:'pl-PL',
      'pt-br':'pt-BR', 'pt-pt':'pt-PT', ro:'ro-RO', ru:'ru-RU', sk:'sk-SK',
      sr:'sr-RS', sv:'sv-SE', ta:'ta-IN', tr:'tr-TR', uk:'uk-UA', vi:'vi-VN',
      'zh-tw':'zh-TW', zh:'zh-CN'
    };
    return M[c] || c;
  }
  // Build a configured utterance for `text` in the active UI language.
  // Voice list is async on Chrome (getVoices() is empty until 'voiceschanged'),
  // so cache it and refresh on that event — otherwise the first announcement
  // gets no matching voice and the engine falls back to a default.
  var _voices = [];
  function _loadVoices() { try { _voices = window.speechSynthesis.getVoices() || []; } catch(e) {} }
  if ('speechSynthesis' in window) {
    _loadVoices();
    try { window.speechSynthesis.addEventListener('voiceschanged', _loadVoices); }
    catch(e) { try { window.speechSynthesis.onvoiceschanged = _loadVoices; } catch(e2) {} }
  }
  // Choose the best voice for a BCP-47 tag: prefer an offline (localService)
  // voice for low latency and to keep the offline training mode working,
  // matching the exact region first, then the primary subtag.
  function _pickVoice(tag) {
    var vs = _voices.length ? _voices : (function(){ try { return window.speechSynthesis.getVoices() || []; } catch(e) { return []; } })();
    var lc = String(tag || '').toLowerCase(), prim = lc.split('-')[0];
    var exact = vs.filter(function(v){ return v.lang && v.lang.toLowerCase() === lc; });
    var prims = vs.filter(function(v){ return v.lang && v.lang.toLowerCase().split('-')[0] === prim; });
    function best(list) {
      if (!list.length) return null;
      var local = list.filter(function(v){ return v.localService; });
      return local[0] || list[0];
    }
    return best(exact) || best(prims) || null;
  }
  function _voiceUtterance(text) {
    var lang = (typeof _lang !== 'undefined' && _lang) ? _lang : 'fr';
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = _voiceLangTag(lang);
    u.rate = 1.05;
    try { var pick = _pickVoice(u.lang); if (pick) u.voice = pick; } catch(e) {}
    return u;
  }
  // Announcements play one after another instead of cutting each other off:
  // on a fast street (several quick folds) you now hear the sequence rather
  // than only the last action. _curU tags the in-flight utterance so a stale
  // onend from a cancelled one can't advance the queue (Web Speech race).
  var _speakQ = [];      // pending texts
  var _speaking = false; // an utterance is currently playing
  var _curU = null;      // the live utterance (identity guard)
  var _SPEAK_MAX = 4;    // cap the backlog so the voice can't lag far behind play
  function _speakNext() {
    if (!_voiceEnabled) { _speakQ = []; _curU = null; _speaking = false; return; }
    if (_speaking || !_speakQ.length) return;
    if (!('speechSynthesis' in window)) { _speakQ = []; return; }
    var text = _speakQ.shift();
    var u;
    try { u = _voiceUtterance(text); } catch(e) { _speakNext(); return; }
    _curU = u; _speaking = true;
    u.onend = u.onerror = function() {
      if (_curU !== u) return;            // stale handler (cancelled) — ignore
      _curU = null; _speaking = false; _speakNext();
    };
    try { window.speechSynthesis.speak(u); }
    catch(e) { if (_curU === u) { _curU = null; _speaking = false; } _speakNext(); }
  }
  // Queue an announcement. Pass { interrupt:true } for the urgent "your turn"
  // cue: it drops any backlog and cuts off the current line so the player
  // hears it promptly rather than after a queue of past actions.
  function speak(text, opts) {
    if (!_voiceEnabled || !text) return;
    if (!('speechSynthesis' in window)) return;
    if (opts && opts.interrupt) {
      _speakQ = []; _curU = null; _speaking = false;
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    _speakQ.push(String(text));
    if (_speakQ.length > _SPEAK_MAX) _speakQ = _speakQ.slice(-_SPEAK_MAX);
    _speakNext();
  }
  // Localized verb for a server action code (1=Fold … 6=All-in).
  function voiceActionPhrase(action, pid, bet) {
    var verbs = ['', t('vFold'), t('vCheck'), t('vCall'), t('vBet'), t('vRaise'), t('vAllin')];
    var verb = verbs[action] || '';
    if (!verb) return '';
    var amt = (action >= 3 && bet) ? ' ' + fmtChipsVoice(bet) : '';   // call/bet/raise/all-in carry the amount
    return getPlayerName(pid) + ' ' + verb + amt;
  }
  function toggleVoice() {
    _voiceEnabled = !_voiceEnabled;
    try { localStorage.setItem('pth_voice', _voiceEnabled ? '1' : '0'); } catch(e) {}
    var label = _voiceEnabled ? t('voiceOn') : t('voiceOff');
    if (typeof showKeyHint === 'function') showKeyHint(label);
    // Direct header twin (tablet/desktop): icon-only.
    var vd = document.getElementById('voice-toggle-btn');
    if (vd) vd.textContent = (_voiceEnabled ? '🗣️' : '🤐');
    // Spoken confirmation (also primes the engine on first user gesture).
    if (_voiceEnabled) speak(t('voiceOn'));
    else if ('speechSynthesis' in window) { _speakQ = []; _curU = null; _speaking = false; try { window.speechSynthesis.cancel(); } catch(e) {} }
    return _voiceEnabled;
  }
  window.toggleVoice = toggleVoice;
  // Sync the direct (tablet/desktop) header toggle icons with the persisted
  // state on load, so 📳/📴 and 🗣️/🤐 reflect reality before any toggle.
  function _syncMediaToggleButtons() {
    try {
      var hb = document.getElementById('haptic-toggle-btn');
      if (hb) hb.textContent = (_hapticEnabled ? '📳' : '📴');
      var vb = document.getElementById('voice-toggle-btn');
      if (vb) vb.textContent = (_voiceEnabled ? '🗣️' : '🤐');
    } catch(e) {}
  }
  window._syncMediaToggleButtons = _syncMediaToggleButtons;
  _syncMediaToggleButtons();
  // Spectators present on the current table. Populated by
  // GameSpectatorJoined messages from the server (one is sent per
  // existing spectator when we ourselves join, plus live updates
  // as people come and go). Reset on JoinGameAck / closeTable.
  let _specPids = new Set();
  let _lobbyPlayerCount = 0; // running tally of players online; updated by PlayerListMessage + StatisticsMessage
  let _hasStatistics = false; // true once we've seen a StatisticsMessage; takes precedence over the PlayerList tally
  let _lobbyPids = new Set(); // pids currently online in the lobby (driven by PlayerList add/remove events)
  let _pendingNameRequests = new Set(); // pids we've already asked the server about, to avoid spamming PlayerInfoRequest
  // ── Feature flag: auto-check / auto-fold next-turn checkbox ────────
  // When true, the action bar shows a checkbox above the action buttons
  // that arms an automatic fold (or check, if currently free) for the
  // user's next turn this hand. When false, the checkbox is not rendered
  // at all but the underlying logic stays intact — flipping this back to
  // `true` reinstates the feature without touching anything else.
  const FEATURE_AUTO_CHECK_FOLD = true;
  // Mode de jeu PERSISTANT (comme le client officiel) : 0 = Manuel,
  // 1 = Auto Check/Call, 2 = Auto Check/Fold. Reste actif jusqu'a un clic
  // manuel sur une action ou un changement de dropdown (pas de reset par main).
  let _playingMode = 0;
  // Joue l'action du mode auto courant a NOTRE tour (sans afficher les boutons).
  // Retourne true si une action auto a ete declenchee.
  function _playAutoMode() {
    if (_playingMode === 0 || turnPid !== myId) return false;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    var myBet0    = (seatData[myId] || {}).bet || 0;
    var toCall0   = Math.max(0, highestBet - myBet0);
    var canCheck0 = toCall0 === 0;
    var act = canCheck0 ? 2 : (_playingMode === 1 ? 3 : 1); // 2=check, 3=call, 1=fold
    var amt = (act === 3) ? toCall0 : 0;
    renderGameWaiting('\u23e9 ' + t(act === 2 ? 'autoChecked' : act === 3 ? 'autoCalled' : 'autoFolded'));
    setMyTurnActive(true);
    setTimeout(function () { doAction(act, amt); }, 60);
    return true;
  }
  // Panneau "aperçu des actions" ouvert en tapant ses cartes hors de son tour.
  // Le sélecteur de mode (Manuel/Auto Check-Call/Auto Check-Fold) y reste
  // activable. Les boutons d'action y sont affichés en APERÇU seulement
  // (non cliquables). Se ferme automatiquement quand c'est notre tour.
  let _preActionOpen = false;
  // Verrou anti-fermeture du picker natif (iOS) du selecteur de mode : tant
  // que l'utilisateur manipule #mode-sel, on differe les reconstructions
  // d'apercu (renderMyTurnActions(true)) pour ne pas detruire le <select> ouvert.
  let _modeSelBusy = false, _modeSelPendingPreview = false, _modeSelHoldTimer = null;
  // Epingle : garder le panneau d'apercu ouvert en permanence hors-tour
  // (au lieu de retaper ses cartes a chaque main). Memorise entre sessions.
  let _actionBarPinned = (function(){ try { return localStorage.getItem('pth_pin_actionbar') === '1'; } catch(e){ return false; } })();
  let _lastWaitingMsg = '', _lastWaitingIsHtml = false;
  // User preference: show the compact auto check/fold button in the action
  // bar. OFF by default (some players — e.g. kids — found it confusing).
  // Toggled from the header ••• menu and remembered in localStorage. The
  // button is always rendered but hidden via a <body> class when off, so the
  // toggle takes effect instantly without re-rendering the action bar.
  let _showAutoBtn = true;
  try { _showAutoBtn = localStorage.getItem('pth_show_auto') !== '0'; } catch (e) {}
  try { document.body.classList.toggle('hide-auto-btn', !_showAutoBtn); } catch (e) {}
  function toggleAutoBtnPref() {
    _showAutoBtn = !_showAutoBtn;
    try { localStorage.setItem('pth_show_auto', _showAutoBtn ? '1' : '0'); } catch (e) {}
    if (!_showAutoBtn) _playingMode = 0; // repasse en Manuel si l'UI auto est masquée
    try { document.body.classList.toggle('hide-auto-btn', !_showAutoBtn); } catch (e) {}
    if (typeof showKeyHint === 'function') showKeyHint(t('autoBtnLabel') + (_showAutoBtn ? ' \u2713' : ''));
    return _showAutoBtn;
  }
  window.toggleAutoBtnPref = toggleAutoBtnPref;
  // User preference: show the 33% / 50% / 100% quick-bet buttons in the
  // action bar. OFF by default (like the auto button); players who want them
  // enable it from the ••• menu and the choice is remembered in localStorage.
  // The row is always rendered and hidden via a <body> class so the toggle
  // applies instantly without re-rendering the action bar.
  let _showPctBtns = true;
  try { _showPctBtns = localStorage.getItem('pth_show_pct') !== '0'; } catch (e) {}
  try { document.body.classList.toggle('hide-pct-btns', !_showPctBtns); } catch (e) {}
  function toggleQuickBetPref() {
    _showPctBtns = !_showPctBtns;
    try { localStorage.setItem('pth_show_pct', _showPctBtns ? '1' : '0'); } catch (e) {}
    try { document.body.classList.toggle('hide-pct-btns', !_showPctBtns); } catch (e) {}
    if (typeof showKeyHint === 'function') showKeyHint(t('quickBetLabel') + (_showPctBtns ? ' \u2713' : ''));
    return _showPctBtns;
  }
  window.toggleQuickBetPref = toggleQuickBetPref;
  // Setters (etat precis) pour les cases des Options avancees : bascule le toggle
  // existant seulement si l'etat courant differe de la valeur voulue, ce qui
  // reutilise toute la logique d'application + retour visuel des toggles.
  window.setVoice = function (on) { if (!!on !== _voiceEnabled) toggleVoice(); };
  window.setAutoBtn = function (on) { if (!!on !== _showAutoBtn) toggleAutoBtnPref(); };
  window.setQuickBet = function (on) { if (!!on !== _showPctBtns) toggleQuickBetPref(); };
  window.setDisplayBB = function (on) { if (!!on !== _displayBB) toggleDisplayBB(); };
  window.setHaptic = function (on) { if (!!on !== _hapticEnabled) toggleHaptic(); };
  let _lastConnectParams = null;
  // Track mode + name of last Init sent so we can detect 'rapid mode swap'
  // patterns that the PokerTH server's anti-brute-force flags as
  // suspicious. When the user switches between login modes (guest /
  // unauth / auth / LAN) without enough time between Init messages, the
  // server temporarily blocks the IP. We enforce a minimum gap if the
  // mode or nickname changes between two connect() calls.
  let _lastInitMode = null;     // string: 'lan' / 'unauth' / 'guest' / 'auth'
  let _lastInitNick = null;     // user-typed nickname at time of last Init
  let _lastInitTime = 0;        // timestamp of last Init sent
  let _connectingNow = false;   // re-entrancy guard to ignore double-clicks
  let _connectTimeout = null;   // safety net so the connect button never stays stuck
  let _connectBtnLabel = null;  // saved label restored on _endConnecting
  function _connectBtnEl(){ return document.querySelector('#s-connect .btn-primary'); }
  function _beginConnecting(){
    // Lock the WHOLE connection attempt (click → success OR failure), not just
    // the short pre-flight waits. Otherwise a re-click DURING the slow auth
    // handshake tears down the in-flight socket and reopens a fresh one — a
    // connect/close storm that makes the PokerTH server block the IP (err 7).
    _connectingNow = true;
    var _fr = (typeof _lang === 'undefined' || _lang !== 'en');
    var b = _connectBtnEl();
    if (b) {
      if (_connectBtnLabel === null) _connectBtnLabel = b.textContent;
      b.disabled = true;
      b.textContent = _fr ? '⏳ Connexion…' : '⏳ Connecting…';
    }
    if (_connectTimeout) clearTimeout(_connectTimeout);
    _connectTimeout = setTimeout(function(){
      // If auth never resolves, free the button so the user isn't stuck. We do
      // NOT close the socket: it may still complete, and a manual re-click will
      // now cleanly close+reopen (single cycle) via the lingering-WS path.
      if (!_connectingNow) return;
      _endConnecting();
      try { setStatus(_fr ? 'La connexion prend du temps… réessaie si besoin.' : 'Connection is taking a while… retry if needed.', 'err'); } catch(e) {}
    }, 20000);
  }
  function _endConnecting(){
    _connectingNow = false;
    if (_connectTimeout) { clearTimeout(_connectTimeout); _connectTimeout = null; }
    var b = _connectBtnEl();
    if (b) {
      b.disabled = false;
      if (_connectBtnLabel !== null) { b.textContent = _connectBtnLabel; _connectBtnLabel = null; }
    }
  }
  const MODE_SWAP_MIN_GAP = 3000;  // ms — server blocks below ~2s in tests
  let _currentLoginMode = 'lan';
  let _lastMsgWasReaction = false; // true si le dernier chat envoyé était une réaction
  let _chatRejectShown = false;    // n'afficher l'avertissement LAN qu'une seule fois // pour la reconnexion auto
  let _reconnectAttempts = 0;
  let _lastRxTime = Date.now();  // horodatage du dernier message reçu (watchdog liveness)
  let _intentionalDisconnect = false;
  let _pendingRejoin = 0;        // gameId to auto-rejoin after reconnect (0 = none)
  let _rejoinNickRetries = 0;    // retries waiting for our ghost's nick to free up
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
    // Ranking window is lobby-only AND Internet-PokerTH-only: close it on any
    // screen change (never lingers in-game), and show its lobby header button
    // only when connected to pokerth.net (server-mode 'pokerthnet', not offline).
    if (window.closeRankingModal) window.closeRankingModal();
    try {
      var _rkb = $('ranking-btn-lobby');
      if (_rkb) {
        var _smv = '';
        try { _smv = localStorage.getItem('pth_server_mode') || ''; } catch (e) {}
        if (!_smv && $('server-mode')) _smv = $('server-mode').value || '';
        _rkb.style.display = (id === 's-lobby' && !window._offlineMode && _smv === 'pokerthnet') ? '' : 'none';
      }
    } catch (e) {}
    if (window._syncOverlayTop) window._syncOverlayTop();
    // Keep the screen awake only while at the table.
    if (id === 's-game') acquireWakeLock(); else releaseWakeLock();
    // PWA shortcut intent (?go=play|create): fire ONCE when the lobby first
    // appears (i.e. right after a successful connect). Cleared immediately so
    // later returns to the lobby (e.g. leaving a game) don't re-trigger it.
    if (id === 's-lobby' && window._pendingGo) {
      var _go = window._pendingGo; window._pendingGo = null;
      setTimeout(function () {
        try {
          if (_go === 'create') {
            if (App && App.toggleCreateForm) App.toggleCreateForm();
          } else if (App && App.autoJoinOrCreate) {
            App.autoJoinOrCreate();
          }
        } catch (e) {}
      }, 700);
    }
  }

  // ── Screen Wake Lock ──────────────────────────────────────────────────
  // Keeps the phone screen from dimming/locking while seated at a table (a
  // turn-based game means long idle waits). The OS releases the lock when the
  // tab is hidden, so we re-acquire it when the game screen regains focus.
  // No-ops gracefully where the API is unavailable (older browsers).
  var _wakeLock = null;
  function acquireWakeLock() {
    if (!('wakeLock' in navigator) || _wakeLock) return;
    navigator.wakeLock.request('screen').then(function (wl) {
      _wakeLock = wl;
      wl.addEventListener('release', function () { _wakeLock = null; });
    }).catch(function () { /* denied or not visible — ignore */ });
  }
  function releaseWakeLock() {
    if (_wakeLock) { try { _wakeLock.release(); } catch (e) {} _wakeLock = null; }
  }
  // ── Reconnexion immédiate au retour au premier plan ───────────────────
  // iOS suspend la page en arrière-plan et FERME le WebSocket. Sans ça, on ne
  // se reconnectait qu'au bout du backoff (5–30 s) → table « gelée » plusieurs
  // secondes au retour. Dès qu'on redevient visible (ou qu'on récupère le
  // réseau), si on est en session et que le socket n'est plus OPEN, on annule
  // le backoff et on relance la connexion tout de suite (même chemin que la
  // reconnexion auto, donc même re-join de table — juste sans l'attente).
  // Avant TOUTE reconnexion en cours de partie : mémoriser la table où l'on
  // était (gId). Sans ça _pendingRejoin reste à 0 et, au pseudo « déjà pris »
  // (Error 4, fantôme encore assis), le client se renomme et ABANDONNE la
  // table au lieu de la réclamer. Avec _pendingRejoin armé, le handler Error(4)
  // attend que le fantôme tombe (heartbeat proxy) puis réessaie le MÊME pseudo
  // → InitAck → buildRejoinGame → on récupère notre siège.
  // ── Identifiant de session proxy (persistance réseau) ─────────────────
  // Choix du stockage selon le contexte :
  //  • PWA « standalone » (ajoutée à l'écran d'accueil — iOS notamment) : une
  //    seule instance, mais iOS vide sessionStorage quand il tue/relance l'app.
  //    → localStorage, pour que le sid survive au relancement et que le client
  //    se REBRANCHE sur sa session vivante (sinon : nouvel Init qui se heurte à
  //    son propre fantôme → initPlayerNameInUse → collision → initBlocked).
  //  • Onglet de navigateur classique (desktop multi-onglets) : on veut un sid
  //    PAR ONGLET pour que chaque onglet soit une session/joueur distinct.
  //    → sessionStorage (unique par onglet, survit au rechargement de l'onglet).
  function _sidStore() {
    try {
      var standalone = (window.navigator && window.navigator.standalone === true)
        || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      return standalone ? window.localStorage : window.sessionStorage;
    } catch (e) {
      return window.sessionStorage;
    }
  }
  function _getSessionId() {
    try {
      var store = _sidStore();
      var s = store.getItem('pth_sid');
      if (!s) {
        s = (window.crypto && crypto.randomUUID)
          ? crypto.randomUUID()
          : (Date.now() + '-' + Math.random().toString(36).slice(2));
        store.setItem('pth_sid', s);
      }
      return s;
    } catch (e) {
      return 'sid-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    }
  }

  function _armRejoin() {
    if (_intentionalDisconnect) return;
    var sgEl = document.getElementById('s-game');
    if (gId && sgEl && sgEl.classList.contains('active')) _pendingRejoin = gId;
  }

  function _maybeReconnectOnResume() {
    if (_intentionalDisconnect) return;
    if (!_lastConnectParams) return;                      // jamais connecté cette session
    if (ws && ws.readyState === WebSocket.OPEN) return;   // socket encore vivant
    var sg = document.getElementById('s-game');
    var sl = document.getElementById('s-lobby');
    var inSession = (sg && sg.classList.contains('active'))
                 || (sl && sl.classList.contains('active'));
    if (!inSession) return;
    _armRejoin();
    // Annuler tout backoff déjà programmé par un onclose.
    clearTimeout(window._reconnectTimer);
    clearInterval(window._reconnectCountdown);
    _reconnectAttempts = 0;
    // Refermer proprement un éventuel socket zombie avant de rouvrir.
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      try { ws.onclose = null; ws.onerror = null; ws.onmessage = null; ws.close(); } catch(e) {}
      ws = null;
    }
    try { _showBanner(t('reconnInProgress')); } catch(e) {}
    // preserve:true → on garde l'état de la table ; le proxy rebranche le
    // WebSocket sur la session PokerTH toujours vivante (même sid) → la partie
    // continue sans nouvel Init (pas de collision de pseudo, pas de blocage IP).
    try { App.connect({ preserve: true }); } catch(e) {}
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    var sg = document.getElementById('s-game');
    if (sg && sg.classList.contains('active')) acquireWakeLock();
    _maybeReconnectOnResume();
  });
  window.addEventListener('pageshow', _maybeReconnectOnResume);
  // 'focus' : certains navigateurs mobiles déclenchent 'focus' (et pas toujours
  // 'visibilitychange') quand on revient sur l'onglet après une autre appli.
  // Idempotent : _maybeReconnectOnResume ne fait rien si le socket est vivant.
  window.addEventListener('focus', _maybeReconnectOnResume);

  // ── Détection d'un socket MORT (bascule réseau, ex. wifi → 5G) ─────────
  // Sur un changement de réseau, l'ancien WebSocket peut rester readyState
  // === OPEN tout en étant un « zombie » (TCP mort). _maybeReconnectOnResume
  // ne suffit pas (il fait confiance à OPEN). Ici on FORCE : on démonte le
  // socket quel que soit son état, puis on relance une connexion propre
  // (même chemin que la reconnexion auto → même re-join de table).
  function _forceReconnect() {
    if (_intentionalDisconnect || !_lastConnectParams) return;
    var sg = document.getElementById('s-game');
    var sl = document.getElementById('s-lobby');
    if (!((sg && sg.classList.contains('active')) || (sl && sl.classList.contains('active')))) return;
    _armRejoin();
    clearTimeout(window._reconnectTimer);
    clearInterval(window._reconnectCountdown);
    _reconnectAttempts = 0;
    if (ws) {
      try { ws.onclose = null; ws.onerror = null; ws.onmessage = null; ws.onopen = null; ws.close(); } catch(e) {}
      ws = null;
    }
    _lastRxTime = Date.now(); // éviter que le watchdog ne re-déclenche aussitôt
    try { _showBanner(t('reconnInProgress')); } catch(e) {}
    try { App.connect({ preserve: true }); } catch(e) {}
  }

  // 'online' : la route réseau a changé (wifi→5G…) → l'ancien socket est quasi
  // sûrement mort même s'il affiche OPEN → on force la reconnexion.
  window.addEventListener('online', _forceReconnect);
  // 'offline' : on prévient l'utilisateur ; la reconnexion se fera au retour du
  // réseau ('online') ou via le watchdog ci-dessous.
  window.addEventListener('offline', function () {
    if (_intentionalDisconnect || !_lastConnectParams) return;
    var sg = document.getElementById('s-game');
    var sl = document.getElementById('s-lobby');
    if (!((sg && sg.classList.contains('active')) || (sl && sl.classList.contains('active')))) return;
    try { _showBanner(t('reconnInProgress')); } catch(e) {}
  });

  // Watchdog liveness : si AUCUN message reçu depuis le seuil alors qu'on est à
  // une table, visible et « en ligne », le socket est présumé mort (cas d'une
  // bascule réseau « transparente » où online/offline ne se déclenchent pas).
  // ⚠ Le seuil DOIT rester supérieur au timeout d'action de la table : pendant
  // TON tour, le serveur n'envoie rien tant que tu n'as pas joué, donc un seuil
  // trop court déclencherait une reconnexion à tort si tu réfléchis longtemps.
  // → Seuil ADAPTATIF : max(45 s, timeout_table + 20 s de marge). gameTimeout
  // est renseigné depuis NetGameInfo au JoinGameAck (défaut 15 s). C'est un
  // filet de sécurité ; les vrais déclencheurs rapides sont
  // online/focus/visibilitychange (et le rebranchement proxy est transparent).
  var _RX_WATCHDOG_MIN_MS = 45000;
  setInterval(function () {
    if (_intentionalDisconnect || !_lastConnectParams) return;
    if (document.hidden) return;                                            // arrière-plan : timers gelés
    if (typeof navigator.onLine === 'boolean' && !navigator.onLine) return; // hors-ligne géré ailleurs
    var sg = document.getElementById('s-game');
    if (!(sg && sg.classList.contains('active'))) return;                   // seulement à une table
    if (!ws || ws.readyState !== WebSocket.OPEN) return;                    // sinon déjà géré
    var _tt  = (typeof gameTimeout === 'number' && gameTimeout > 0) ? gameTimeout : 15;
    var _thr = Math.max(_RX_WATCHDOG_MIN_MS, (_tt + 20) * 1000);            // > timeout d'action de la table
    if (Date.now() - _lastRxTime > _thr) _forceReconnect();
  }, 5000);

  var _statusKey = null;
  function setStatus(txt, cls='', key) {
    // Mémorise la clé i18n du message courant (null pour les messages
    // transitoires : erreurs, « Initialisation… »), afin que _refreshConnectStatus
    // puisse le retraduire à la volée lors d'un changement de langue.
    _statusKey = key || null;
    const el = $('cstatus');
    el.textContent = txt;
    el.className = 'status ' + cls;
  }
  // Re-pose le hint « 🤖 mode entraînement ». Exposé pour que la veille (portée
  // globale) puisse RÉPARER un hint réseau qui aurait fui en entraînement, sans
  // jamais toucher un message transitoire. setStatus + t sont en portée ici.
  window._forceOfflineHint = function () {
    try { setStatus(t('offlineHint'), '', 'offlineHint'); } catch (e) {}
  };
  // Re-applique le statut de l'écran de connexion dans la langue courante.
  // Le hint dépend du mode (clé mémorisée par setStatus) ; posé impérativement
  // (sans data-i18n) il restait figé dans la langue précédente. Les messages
  // transitoires (sans clé) ne sont jamais réécrasés. Appelé par setLang().
  window._refreshConnectStatus = function() {
    try {
      if (!_statusKey) return;
      var sc = document.getElementById('s-connect');
      if (!sc || !sc.classList.contains('active')) return;
      var el = document.getElementById('cstatus');
      if (el) el.textContent = t(_statusKey);
    } catch (e) {}
  };

  // ── Régulation d'envoi des réactions /emoji ──────────────────────────
  // Le chat de partie du serveur PokerTH applique un anti-flood : en envoyant
  // plusieurs /emoji trop vite, le serveur les rejette (ChatReject) et les
  // AUTRES clients ne reçoivent plus nos réactions (le badge local, lui, reste
  // affiché car purement côté client). Sur pokerth.net il n'y a pas de proxy :
  // les réactions passent UNIQUEMENT par /emoji, donc soumises au throttle. On
  // espace donc les envois /emoji via une petite file. Le badge local et le
  // canal proxy REACT (web↔web, qui contourne le throttle) restent immédiats —
  // seule la trame /emoji serveur est régulée. NB : doit vivre DANS l'IIFE App
  // pour voir ws/gId/send/MSG/_lastMsgWasReaction (cf. avertissement en tête).
  let _reactEmojiQueue = [];
  let _reactEmojiTimer = null;
  let _reactEmojiLastSent = 0;
  const REACT_EMOJI_MIN_GAP = 1500;   // ms minimum entre deux /emoji (sous le seuil serveur)
  const REACT_EMOJI_QUEUE_MAX = 4;    // file bornée : au-delà on abandonne l'envoi réseau (badge déjà montré)

  function _flushReactEmoji() {
    _reactEmojiTimer = null;
    if (!_reactEmojiQueue.length) return;
    if (!ws || !gId || ws.readyState !== WebSocket.OPEN) { _reactEmojiQueue.length = 0; return; }
    const now = Date.now();
    const wait = REACT_EMOJI_MIN_GAP - (now - _reactEmojiLastSent);
    if (wait > 0) { _reactEmojiTimer = setTimeout(_flushReactEmoji, wait); return; }
    const emoji = _reactEmojiQueue.shift();
    _reactEmojiLastSent = now;
    _lastMsgWasReaction = true;
    try { send(MSG.buildGameChat(gId, '/emoji ' + emoji)); } catch (e) {}
    if (_reactEmojiQueue.length) _reactEmojiTimer = setTimeout(_flushReactEmoji, REACT_EMOJI_MIN_GAP);
  }

  function _queueReactEmoji(emoji) {
    _reactEmojiQueue.push(emoji);
    while (_reactEmojiQueue.length > REACT_EMOJI_QUEUE_MAX) _reactEmojiQueue.shift(); // garde les plus récentes
    if (!_reactEmojiTimer) _flushReactEmoji();
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
    _lastRxTime = Date.now();              // liveness : un message reçu = socket vivant
    // Données qui arrivent = lien rétabli. Sur un rebranchement transparent
    // (le proxy a gardé la session PokerTH vivante), il n'y a NI Announce NI
    // InitAck → aucun handler ne masquerait la bannière « reconnexion ». On la
    // masque donc dès la 1ʳᵉ frame reçue.
    try {
      var _rb = document.getElementById('reconnect-banner');
      if (_rb && _rb.classList.contains('visible')) _hideBanner();
    } catch (e) {}
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
  // ══════════════════════════════════════════════════════════════════
  //  Vote-kick / kick petitions (pokerth.net & dedicated servers)
  //  The host kicks directly (KickPlayerRequest, see doKickConfirmed).
  //  Any seated player can instead open a COMMUNITY petition: everyone
  //  votes within a deadline and the server removes the target if enough
  //  YES votes are gathered. The official Qt client has had this for years;
  //  the web client used to ignore the whole message family. Gated to live
  //  games (meaningless offline vs bots).
  // ══════════════════════════════════════════════════════════════════
  var _pet = null; // { petitionId, target, endsAt, timer, voted } | null
  function _petName(pid) { return players[pid] || ('#' + pid); }
  function _petClear() {
    if (_pet && _pet.timer) { try { clearInterval(_pet.timer); } catch(e) {} }
    _pet = null;
    var b = document.getElementById('kick-petition-banner');
    if (b) b.remove();
  }
  function _petStart(o) {
    if (window._offlineMode) return;
    if (gId && o.gameId && o.gameId !== gId) return;
    _petClear();
    var amTarget = (o.target === myId);
    _pet = { petitionId: o.petitionId, target: o.target,
             endsAt: Date.now() + (o.timeout > 0 ? o.timeout : 30) * 1000,
             timer: null, voted: amTarget };
    var b = document.createElement('div');
    b.id = 'kick-petition-banner';
    b.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);' +
      'z-index:9000;max-width:min(94vw,460px);padding:10px 14px;border-radius:12px;' +
      'background:var(--modal-bg,#222a36);color:var(--text,#eff1f5);' +
      'border:1px solid var(--gold,#E3C800);box-shadow:0 6px 24px rgba(0,0,0,.45);' +
      'font-family:var(--ff-display,inherit);text-align:center';
    var title = amTarget ? ('\u26A0 ' + t('petitionAgainstYou'))
                         : ('\u26A0 ' + t('petitionTitle', { name: _petName(o.target) }));
    b.innerHTML =
      '<div style="font-weight:700;margin-bottom:4px">' + esc(title) + '</div>' +
      '<div id="kp-tally" style="font-size:.82em;opacity:.85;margin-bottom:6px"></div>' +
      '<div id="kp-time" style="font-size:.78em;opacity:.7;margin-bottom:8px"></div>' +
      (amTarget ? '' :
        '<div style="display:flex;gap:8px;justify-content:center">' +
          '<button id="kp-yes" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
            'font-weight:700;cursor:pointer;background:rgba(var(--red-rgb,217,64,64),1);color:#fff">' +
            esc(t('petitionVoteYes')) + '</button>' +
          '<button id="kp-no" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
            'font-weight:700;cursor:pointer;background:var(--green,#3fae5a);color:#06210e">' +
            esc(t('petitionVoteNo')) + '</button>' +
        '</div>');
    document.body.appendChild(b);
    if (!amTarget) {
      var y = document.getElementById('kp-yes'), n = document.getElementById('kp-no');
      if (y) y.addEventListener('click', function(){ _petVote(true); });
      if (n) n.addEventListener('click', function(){ _petVote(false); });
    }
    _petTick();
    _pet.timer = setInterval(_petTick, 500);
  }
  function _petTick() {
    if (!_pet) return;
    if (!gId) { _petClear(); return; } // left the table → dismiss
    var el = document.getElementById('kp-time');
    var left = Math.max(0, Math.round((_pet.endsAt - Date.now()) / 1000));
    if (el) el.textContent = t('petitionTimeLeft', { s: left });
    if (left <= 0) {
      var y = document.getElementById('kp-yes'), n = document.getElementById('kp-no');
      if (y) y.disabled = true;
      if (n) n.disabled = true;
      if (_pet.timer) { try { clearInterval(_pet.timer); } catch(e) {} _pet.timer = null; }
    }
  }
  function _petUpdate(petitionId, against, inFavour, needed) {
    if (!_pet || _pet.petitionId !== petitionId) return;
    var el = document.getElementById('kp-tally');
    if (el) el.textContent = t('petitionTally', { y: inFavour, n: against, k: needed });
  }
  function _petVote(yes) {
    if (!_pet || _pet.voted) return;
    try { send(MSG.buildVoteKick(gId, _pet.petitionId, yes)); } catch(e) {}
    _pet.voted = true;
    var y = document.getElementById('kp-yes'), n = document.getElementById('kp-no');
    if (y) y.disabled = true;
    if (n) n.disabled = true;
    var tEl = document.getElementById('kp-time');
    if (tEl) tEl.textContent = t('petitionVoted');
  }
  function _petVoteReply(petitionId, replyType) {
    if (replyType === 2 && typeof showToast === 'function') showToast(t('petitionAlreadyVoted'));
  }
  function _petEnd(petitionId, kicked, reason) {
    if (!_pet || _pet.petitionId !== petitionId) return;
    var target = _pet.target;
    if (_pet.timer) { try { clearInterval(_pet.timer); } catch(e) {} _pet.timer = null; }
    var msg;
    if (kicked) msg = t('petitionResultKicked', { name: _petName(target) });
    else if (reason === 3) msg = t('petitionEndTimeout');
    else if (reason === 2) msg = t('petitionEndLeft');
    else if (reason === 1) msg = t('petitionEndFew');
    else msg = t('petitionResultRejected');
    var b = document.getElementById('kick-petition-banner');
    if (b) {
      b.innerHTML = '<div style="font-weight:700">' + esc(msg) + '</div>';
      setTimeout(function(){ var x = document.getElementById('kick-petition-banner'); if (x) x.remove(); }, 3500);
    }
    _pet = null;
  }
  function _petAskDenied(reason) {
    if (typeof showToast === 'function') showToast(t('petitionDenied'));
  }
  // Open a petition against an opponent (from the profile popup).
  function _petAsk(pid) {
    if (window._offlineMode || !gId || pid === myId) return;
    try { send(MSG.buildAskKickPlayer(gId, pid)); } catch(e) {}
    if (typeof closePlayerInfoPopup === 'function') closePlayerInfoPopup();
    if (typeof showToast === 'function') showToast(t('petitionStarted', { name: _petName(pid) }));
  }
  window._petAsk = _petAsk;

  // ─────────────────────────────────────────────────────────────
  //  Game invitations (InviteNotifyMessage — pokerth.net & dedicated)
  //  The host invites us to a (possibly invite-only) table; the server
  //  forwards an InviteNotify. We surface an Accept/Decline banner,
  //  mirroring the Qt client's invitation dialog. Accept = join the
  //  table exactly like a lobby click; Decline = RejectGameInvitation.
  // ─────────────────────────────────────────────────────────────
  var _inv = null; // { gameId } | null
  function _inviteClear() {
    _inv = null;
    var b = document.getElementById('game-invite-banner');
    if (b) b.remove();
  }
  function _inviteShow(o) {
    if (window._offlineMode) return;
    // Same invite already up → keep it (server may resend on reconnect).
    if (_inv && _inv.gameId === o.gameId && document.getElementById('game-invite-banner')) return;
    _inviteClear();
    _inv = { gameId: o.gameId };
    var host = _petName(o.byWhom);
    var tbl  = (games[o.gameId] && games[o.gameId].name) || ('#' + o.gameId);
    var b = document.createElement('div');
    b.id = 'game-invite-banner';
    b.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);' +
      'z-index:9000;max-width:min(94vw,460px);padding:10px 14px;border-radius:12px;' +
      'background:var(--modal-bg,#222a36);color:var(--text,#eff1f5);' +
      'border:1px solid var(--gold,#E3C800);box-shadow:0 6px 24px rgba(0,0,0,.45);' +
      'font-family:var(--ff-display,inherit);text-align:center';
    b.innerHTML =
      '<div style="font-weight:700;margin-bottom:8px">\u2709 ' +
        esc(t('inviteTitle', { name: host, table: tbl })) + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:center">' +
        '<button id="gi-yes" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
          'font-weight:700;cursor:pointer;background:var(--green,#3fae5a);color:#06210e">' +
          esc(t('inviteAccept')) + '</button>' +
        '<button id="gi-no" style="flex:1;max-width:140px;padding:8px 0;border:0;border-radius:8px;' +
          'font-weight:700;cursor:pointer;background:rgba(var(--red-rgb,217,64,64),1);color:#fff">' +
          esc(t('inviteDecline')) + '</button>' +
      '</div>';
    document.body.appendChild(b);
    var y = document.getElementById('gi-yes'), n = document.getElementById('gi-no');
    if (y) y.addEventListener('click', _inviteAccept);
    if (n) n.addEventListener('click', _inviteDecline);
  }
  function _inviteAccept() {
    if (!_inv) return;
    var gid = _inv.gameId;
    _inviteClear();
    try { send(MSG.buildJoinGame(gid, false)); } catch(e) {}
    if (typeof addChat === 'function') addChat(null, t('inviteAccepted'), 'sys', { key: 'inviteAccepted' });
  }
  function _inviteDecline() {
    if (!_inv) return;
    var gid = _inv.gameId;
    _inviteClear();
    try { send(MSG.buildRejectInvite(gid, 0)); } catch(e) {}
  }

  function handleMsg(buf) {
    const { type, sub } = MSG.parse(buf);
    const T = MSG.T;

    switch (type) {

      // Le serveur s'annonce → on envoie notre Init
      // ── Kick petitions / vote-kick ──
      case T.StartKickPetition: {
        _petStart({
          gameId:     Proto.u32(sub, 1),
          petitionId: Proto.u32(sub, 2),
          proposer:   Proto.u32(sub, 3),
          target:     Proto.u32(sub, 4),
          timeout:    Proto.u32(sub, 5),
          needed:     Proto.u32(sub, 6),
        });
        break;
      }
      case T.KickPetitionUpdate: {
        _petUpdate(Proto.u32(sub, 2), Proto.u32(sub, 3), Proto.u32(sub, 4), Proto.u32(sub, 5));
        break;
      }
      case T.VoteKickReply: {
        _petVoteReply(Proto.u32(sub, 2), Proto.u32(sub, 3));
        break;
      }
      case T.EndKickPetition: {
        _petEnd(Proto.u32(sub, 2), Proto.u32(sub, 5), Proto.u32(sub, 6));
        break;
      }
      case T.AskKickDenied: {
        _petAskDenied(Proto.u32(sub, 3));
        break;
      }

      // ── Game invitation: the host invited us to a table ──
      case T.InviteNotify: {
        // InviteNotify: gameId=1, playerIdWho=2 (invitee), playerIdByWhom=3 (host)
        if (Proto.u32(sub, 2) === myId) {
          _inviteShow({ gameId: Proto.u32(sub, 1), byWhom: Proto.u32(sub, 3) });
        }
        break;
      }
      // Someone declined an invite WE sent — outgoing invites not yet a
      // web feature, so nothing to surface; swallow to avoid the default.
      case T.RejectInvNotify: { break; }

      case T.Announce: {
        const pv    = Proto.sub(sub, 1); // protocolVersion (réseau, ex: 5.1)
        const gv    = Proto.sub(sub, 2); // latestGameVersion (appli, ex: 2.0)
        const stype = Proto.u32(sub, 4); // 0=LAN, 1=NoAuth, 2=Auth
        const np    = Proto.u32(sub, 5);
        const pMaj  = Proto.u32(pv, 1), pMin = Proto.u32(pv, 2);
        const gMaj  = Proto.u32(gv, 1), gMin = Proto.u32(gv, 2);

        const loginMode = $('login-mode') ? $('login-mode').value : 'guest';
        // Mot de passe de COMPTE optionnel sur serveur dédié / LAN : s'il est
        // saisi (champ user-pass de la roue crantée), on bascule en
        // authenticatedLogin pour l'envoyer dans clientUserData — permet à un
        // serveur dédié avec gestion de comptes d'authentifier l'utilisateur.
        // Vide ⇒ on garde le login normal du mode (unauthenticated / guest).
        const userAcctPass = ((loginMode === 'unauth' || loginMode === 'lan') && $('user-pass'))
          ? $('user-pass').value.trim() : '';
        const useAcctAuth = !!userAcctPass;
        if (stype === 2 && loginMode !== 'guest' && loginMode !== 'auth' && !useAcctAuth) {
          setStatus(t('serverRequiresAuth'), 'err');
          _intentionalDisconnect = true; // fatal config error — don't auto-retry
          ws.close(); return;
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
        _statsOffline  = !!window._offlineMode;
        _boardEligible = !_statsOffline && (loginMode === 'unauth' || loginMode === 'lan');
        _statsEligible = _statsOffline || _boardEligible;
        if (_boardEligible) _lifeSeedFromServer();
        const typeLabel = ['LAN','Internet (no-auth)','Internet (auth)'][stype] || 'Serveur';
        setStatus(t('connectingPlayers', { type: typeLabel, ver: pMaj + '.' + pMin, n: np }));
        lastMajor = pMaj; lastMinor = pMin; lastLoginType = loginType;
        const authPass = (loginType === 1)
          ? (useAcctAuth ? userAcctPass : ($('pass') ? $('pass').value : ''))
          : null;
        // Compte authentifié : pokerth.net chiffre nos cartes (encryptedCards)
        // avec une clé dérivée du mot de passe. On la pré-calcule maintenant
        // (async, SHA-1) — prête bien avant le 1er HandStart. Sinon on efface
        // toute clé résiduelle (passage auth → invité sans recharger la page).
        _cardKey = null; _cardIV = null;
        if (loginType === 1 && authPass) {
          PTHCrypto.deriveKeyIv(new TextEncoder().encode(authPass))
            .then(function (r) { _cardKey = r.key; _cardIV = r.iv; })
            .catch(function () { _cardKey = null; _cardIV = null; });
        }
        // Pré-armer le rejoin AVANT d'envoyer Init : si une partie récente est
        // mémorisée (pth_resume, même pseudo, < 5 min), on note _pendingRejoin
        // pour que le handler Error(4) « pseudo pris » RÉCLAME le siège (attend
        // que le fantôme tombe, réessaie le même pseudo) au lieu de renommer.
        // Couvre le rechargement complet ; la coupure transitoire est déjà
        // couverte par _armRejoin().
        if (!_pendingRejoin) {
          try {
            var _rs0 = JSON.parse(localStorage.getItem('pth_resume') || 'null');
            if (_rs0 && _rs0.n === myName && (Date.now() - _rs0.t) < 5 * 60 * 1000) _pendingRejoin = _rs0.g;
          } catch (e) {}
        }
        // Mot de passe serveur (optionnel, masqué sous « plus d'options »).
        // Trimmé ; vide → null donc omis de l'InitMessage. Lu directement ici
        // (comme authPass) pour couvrir aussi les reconnexions automatiques.
        const srvPass = ($('server-pass') ? $('server-pass').value.trim() : '') || null;
        send(MSG.buildInit(myName, pMaj, pMin, loginType, authPass, srvPass));
        break;
      }

      // Connexion acceptée
      case T.InitAck: {
        _wasAuthenticated = true;
        _lastConnectFailed = false; // connexion réussie
        _endConnecting();           // login OK → unlock the connect button
        _reconnectAttempts = 0;
        myId = Proto.u32(sub, 2);
        _rejoinNickRetries = 0;
        // Demander NOTRE PROPRE PlayerInfo : le serveur n'écho pas toujours
        // notre arrivée dans PlayerList, donc sans ça on n'apprend jamais le
        // hash de notre avatar pokerth.net. Le handler PlayerInfoReply
        // déclenche ensuite le téléchargement/cache/rendu de l'avatar (et
        // confirme notre pseudo canonique). Inoffensif pour invité/LAN
        // (la réponse n'aura simplement pas de champ avatar).
        try {
          _pendingNameRequests.add(myId);
          const _selfReq = Proto.encode([[1, 0, myId]]);
          send(Proto.encode([[1, 0, T.PlayerInfoRequest], [19, 2, _selfReq]]));
        } catch (e) {}
        // Auto-rejoin the table we dropped from, if any. Source: the in-memory
        // flag (transient drop) or a recent persisted marker (full reload).
        // Same nickname required so we don't hijack another player's seat.
        var _rt = _pendingRejoin;
        if (!_rt) {
          try {
            var _rs = JSON.parse(localStorage.getItem('pth_resume') || 'null');
            if (_rs && _rs.n === myName && (Date.now() - _rs.t) < 5 * 60 * 1000) _rt = _rs.g;
          } catch (e) {}
        }
        if (_rt) {
          _pendingRejoin = _rt;
          _showBanner(t('rejoinInProgress'));
          try { send(MSG.buildRejoinGame(_rt)); } catch (e) {}
          break;   // JoinGameAck → game screen; JoinGameFailed → lobby fallback
        }
        updateLobbyPill();
        App._resetGameState();   // ensure a clean lobby baseline (no-op on first connect)
        show('s-lobby');
        // Demander la permission pour les notifications
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(function(){});
        }
        addChat(null, t('connectedAsGuest', { name: myName, id: myId }), 'sys', { key: 'connectedAsGuest', params: { name: myName, id: myId } });
        const cfName = document.getElementById('cf-name');
        if (cfName) cfName.value = _defaultNameForMode();  // nom par défaut (mode courant / admin)
        break;
      }

      // Erreur serveur
      case T.AuthChallenge: {
        // Legacy auth (SCRAM temporarily disabled): empty AuthClientResponse.
        setStatus(t('verifyingAccount'));
        send(MSG.buildAuthResponse());
        break;
      }

      case T.Error: {
        _endConnecting();   // server rejected → free the button now
        _lastConnectFailed = true;
        const codes = {1:t('connErrVersion'),2:t('connErrFull'),3:t('connErrAuth'),
          4:t('connErrNickTaken'),5:t('connErrNickInvalid'),6:t('connErrMaintenance'),7:t('connErrBlocked')};
        const r = Proto.u32(sub, 1);
        if (r === 3) {
          // initAuthFailure: login/password rejected by server
          setStatus(t('errBadCreds'), 'err');
          _intentionalDisconnect = true; // bad credentials — retrying won't help
          ws.close(); return;
        }
        if (r === 7) {
          _intentionalDisconnect = true;
          _wasAuthenticated = false;
          _hideBanner();
          _ipBlockUntil = Date.now() + 1 * 60 * 1000; // 1 minute (was 5 — server usually clears earlier)
          _startIpBlockCountdown();
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
          _pendingRejoin = 0; _rejoinNickRetries = 0;
          _wasAuthenticated = false;
          _intentionalDisconnect = true;             // stoppe toute reconnexion auto
          try { localStorage.removeItem('pth_resume'); } catch (e) {}
          _hideBanner();
          var _fr = (typeof _lang === 'undefined' || _lang !== 'en');
          var _msg = _fr
            ? '« ' + myName + ' » est déjà utilisé. Une session précédente est peut-être encore active : patiente ~2 min, ou choisis un autre pseudo, puis reconnecte.'
            : '“' + myName + '” is already in use. A previous session may still be active: wait ~2 min, or pick another nickname, then reconnect.';
          setStatus(_msg, 'err');
        } else {
          setStatus(t('errGeneric', { code: codes[r] || ('code ' + r) }), 'err');
        }
        break;
      }

      // ── Lobby player roster (PlayerListMessage) ──
      // Sent by the server when a player joins or leaves the lobby.
      // We maintain a local _lobbyPlayerCount fallback for servers
      // (typical of LAN / private deployments) that don't send the
      // periodic StatisticsMessage. If StatisticsMessage IS received,
      // its value takes precedence — see _hasStatistics flag.
      case T.PlayerList: {
        // PlayerListMessage: playerId=1, notification=2 (0=new, 1=left)
        const _pid_pl = Proto.u32(sub, 1);
        const notif = Proto.u32(sub, 2);
        if (notif === 0) {
          _lobbyPlayerCount++;
          _lobbyPids.add(_pid_pl);
          // Fetch the player's name so the players-online panel can
          // show something better than '#42'. Skip if we already
          // know the name OR have already asked.
          if (!players[_pid_pl] && !_pendingNameRequests.has(_pid_pl)) {
            _pendingNameRequests.add(_pid_pl);
            try {
              const req = Proto.encode([[1,0,_pid_pl]]);
              send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
            } catch(e) {}
          }
        } else if (notif === 1) {
          _lobbyPlayerCount = Math.max(0, _lobbyPlayerCount - 1);
          _lobbyPids.delete(_pid_pl);
          _pendingNameRequests.delete(_pid_pl);
        }
        if (!_hasStatistics) {
          $('h-players').textContent = _lobbyPlayerCount + ' ' + t('playersOnline');
        }
        // Refresh the panel if it's open.
        var _pp = document.getElementById('players-panel');
        if (_pp && _pp.style.display !== 'none' && typeof renderPlayersList === 'function') renderPlayersList();
        break;
      }

      // Statistiques (nombre de joueurs connectés)
      case T.Statistics: {
        const arr = sub[1] || [];
        for (const d of arr) {
          const s = Proto.decode(d);
          if (Proto.u32(s,1) === 1) {
            // Server-authoritative count. Mark the flag so PlayerList
            // updates stop overriding the header pill from below.
            _hasStatistics = true;
            _lobbyPlayerCount = Proto.u32(s,2);
            $('h-players').textContent = _lobbyPlayerCount + ' ' + t('playersOnline');
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
        // Rafraîchir un panneau « joueurs à cette table » en attente de ce pseudo.
        if (name && _openTables.size && _tableHasPid(pid)) renderGames();
        // Code pays (champ 4, optionnel) — présent surtout sur pokerth.net.
        var cc = Proto.str(info, 4);
        if (cc) _playerCountries[pid] = cc.toUpperCase();
        // Droits (champ 3) : 1=invité, 2=enregistré, 3=admin. Sert à ne
        // rendre cliquables que les joueurs ayant un compte pokerth.net.
        var rights = Proto.u32(info, 3);
        if (rights) _playerRights[pid] = rights;
        _pendingNameRequests.delete(pid); // got the reply, free for retry if needed
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
            _pthAvatarHashes[pid] = { type: avType, hashHex: hashHex };
            // ── Step 3: cache hit?
            // If the same hash has been downloaded in a previous session
            // and is still in localStorage, restore it immediately --
            // no network round-trip, no AvatarRequest, no waiting.
            if (!_pthAvatarsByHash[hashHex] && !_pthDataUrls[hashHex]) {
              const cached = _pthCacheGet(hashHex);
              if (cached) {
                _pthAvatarsByHash[hashHex] = {
                  status: 'done', type: cached.type, expectedSize: 0,
                  chunks: [], received: 0,
                };
                _pthDataUrls[hashHex] = cached.dataUrl;
                // Re-render so the seat picks up the image right away.
                if (typeof window._renderSeats === 'function') window._renderSeats();
                if (typeof window.refreshMyAvatar === 'function') window.refreshMyAvatar();
                if (_openTables.size) renderGames();
              }
            }
            // ── Step 2: cache miss -> kick off an AvatarRequest. Dedup
            // by hash so two players sharing an avatar download once.
            if (!_pthAvatarsByHash[hashHex]) {
              _pthAvatarsByHash[hashHex] = {
                status: 'pending', // 'pending' | 'done' | 'unknown' | 'error'
                type:   avType,
                expectedSize: 0,   // filled by AvatarHeader
                chunks: [],        // Uint8Array[] -- joined at AvatarEnd
                received: 0,       // running total bytes
              };
              const reqId = _pthNextAvatarReqId++;
              _pthAvatarReqIdToHash[reqId] = hashHex;
              const reqMsg = Proto.encode([
                [1, 0, reqId],
                [2, 2, avHashBytes],
              ]);
              send(Proto.encode([[1, 0, T.AvatarRequest], [8, 2, reqMsg]]));
            } else if (_pthAvatarsByHash[hashHex].status === 'done') {
              // Already cached this session -- nothing to do, the
              // re-render path will pick it up.
            }
          }
        }
        // If the waiting panel is visible, update it so the new pseudo
        // appears in place of the temporary '#<pid>' placeholder.
        if (!_gameStarted && amInGame) renderWaitingPanel();
        // Same idea for the lobby players panel.
        var _pp2 = document.getElementById('players-panel');
        if (_pp2 && _pp2.style.display !== 'none' && typeof renderPlayersList === 'function') renderPlayersList();
        break;
      }

      // ──────────────────────────────────────────────────────────────
      // PokerTH avatar download flow -- STEP 2: parse server replies.
      // No assembly into a Blob/Data URL yet, no display. Just log so
      // we can verify the server actually streams the bytes back.
      // ──────────────────────────────────────────────────────────────
      // ── PokerTH avatar UPLOAD (scope A): the server got our hash from Init,
      // lacks the file, and asks US for it. Stream it back, chunked at 256
      // (MAX_FILE_DATA_SIZE — server rejects avatarblock > 256). Hash-matched.
      case T.AvatarRequest: {
        const reqId = Proto.u32(sub, 1);
        const want = Proto.raw(sub, 2);
        const up = (typeof window !== 'undefined') ? window._pthMyUpload : null;
        const ok = up && up.hashBytes && up.bytes && up.bytes.length && want &&
                   want.length === up.hashBytes.length &&
                   up.hashBytes.every(function(b, i) { return b === want[i]; });
        if (ok) {
          send(Proto.encode([[1, 0, T.AvatarHeader], [9, 2,
            Proto.encode([[1, 0, reqId], [2, 0, up.type || 1], [3, 0, up.bytes.length]])]]));
          const CK = 256; // MAX_FILE_DATA_SIZE
          for (let o = 0; o < up.bytes.length; o += CK) {
            const part = up.bytes.slice(o, Math.min(o + CK, up.bytes.length));
            send(Proto.encode([[1, 0, T.AvatarData], [10, 2,
              Proto.encode([[1, 0, reqId], [2, 2, part]])]]));
          }
          send(Proto.encode([[1, 0, T.AvatarEnd], [11, 2, Proto.encode([[1, 0, reqId]])]]));
        } else {
          send(Proto.encode([[1, 0, T.UnknownAvatar], [12, 2, Proto.encode([[1, 0, reqId]])]]));
        }
        break;
      }

      case T.AvatarHeader: {
        const reqId = Proto.u32(sub, 1);
        const avType = Proto.u32(sub, 2);
        const size = Proto.u32(sub, 3);
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.expectedSize = size;
          // Server may correct the type vs what PlayerInfoReply said
          if (avType) entry.type = avType;
        }
        break;
      }
      case T.AvatarData: {
        const reqId = Proto.u32(sub, 1);
        const block = Proto.raw(sub, 2); // Uint8Array of this chunk
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry && block) {
          entry.chunks.push(block);
          entry.received += block.length;
        }
        break;
      }
      case T.AvatarEnd: {
        const reqId = Proto.u32(sub, 1);
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.status = 'done';
          // ── Step 3: assemble chunks into a Data URL, cache it,
          // free the chunk buffers, then trigger a re-render so the
          // freshly arrived image appears at the table.
          try {
            const dataUrl = _pthAssembleDataUrl(entry.chunks, entry.type);
            _pthDataUrls[hashHex] = dataUrl;
            _pthCachePut(hashHex, entry.type, dataUrl);
            // Release chunk references so the GC can reclaim them.
            entry.chunks = [];
          } catch(e) {
            console.warn('[pth-avatar] assembly failed for hash=' + hashHex, e);
            entry.status = 'error';
          }
        }
        // Re-render: seats around the table + my own seat in the bar.
        if (typeof window._renderSeats === 'function') window._renderSeats();
        if (typeof window.refreshMyAvatar === 'function') window.refreshMyAvatar();
        // Rafraîchir aussi un panneau « joueurs à cette table » ouvert.
        if (_openTables.size) renderGames();
        if (hashHex) delete _pthAvatarReqIdToHash[reqId];
        break;
      }
      case T.UnknownAvatar: {
        const reqId = Proto.u32(sub, 1);
        const hashHex = _pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? _pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.status = 'unknown';
        }
        if (hashHex) delete _pthAvatarReqIdToHash[reqId];
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

        // Liste des joueurs présents (varints packed, champ 4 =
        // playerIds). On garde les IDs pour le panneau dépliable
        // « joueurs à cette table » ; le compteur en découle.
        let _seats = [];
        if (sub[4]) {
          let pos = 0; const p = sub[4][0];
          while (pos < p.length) { const r = Proto.decodeVarint(p, pos); pos = r.pos; _seats.push(r.value); }
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
        games[id] = { name, mode, players:pc, seats:_seats, maxPlayers:maxp, type:gtype, priv:!!priv,
                      timeout: _gto || 15, startMoney: _gsm || 3000,
                      raiseMode: _grmode, raiseHands: _grhands, raiseMins: _grmins, smallBlind: _gsb,
                      endRaiseMode: _germode, endRaiseValue: _gerval };
        if (!loaded) { loaded = true; }
        renderGames();
        // ── Auto-join from a share link ──
        // If we arrived via a "copy table link" URL and this is the
        // table it pointed to, join it now (the lobby has just told
        // us it exists). Clear the pending id so we only do it once.
        // window._pendingAutoJoin is set by parseShareLink() which
        // runs at global scope (outside this IIFE).
        if (window._pendingAutoJoin && id === window._pendingAutoJoin && !amInGame) {
          var _aj = window._pendingAutoJoin;
          window._pendingAutoJoin = 0;
          var fr = (typeof _lang === 'undefined' || _lang !== 'en');
          addChat(null, t('sharedTableJoining'), 'sys', { key: 'sharedTableJoining' });
          // Defer slightly so renderGames() has painted and games[id]
          // is fully populated before joinGame reads it.
          setTimeout(function(){
            try { if (App && App.joinGame) App.joinGame(_aj); } catch(e) {}
          }, 150);
        }
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
        const id  = Proto.u32(sub, 1);
        const pid = Proto.u32(sub, 2);
        if (games[id]) {
          if (!games[id].seats) games[id].seats = [];
          if (pid && games[id].seats.indexOf(pid) === -1) games[id].seats.push(pid);
          games[id].players = games[id].seats.length;
          if (pid && !players[pid] && _openTables.has(String(id)) && !_pendingNameRequests.has(pid)) {
            _pendingNameRequests.add(pid);
            try { send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
          }
          renderGames();
        }
        break;
      }
      case T.GameListPlayerLeft: {
        const id  = Proto.u32(sub, 1);
        const pid = Proto.u32(sub, 2);
        if (games[id]) {
          if (games[id].seats) {
            const _ix = games[id].seats.indexOf(pid);
            if (_ix !== -1) games[id].seats.splice(_ix, 1);
            games[id].players = games[id].seats.length;
          } else if (games[id].players > 0) { games[id].players--; }
          renderGames();
        }
        break;
      }
      case T.GameListSpectatorJoined: {
        /* pas besoin de compter les spectateurs ici */ break;
      }
      case T.GameListSpectatorLeft: { break; }

      // ── Spectator events SCOPED to the current game ──
      // Type 80/81. The lobby-level 78/79 above are different (they
      // tick a spectator count on each table card in the games list).
      // 80/81 only arrive while we're inside a game (player OR
      // spectator) and refer to OTHER spectators watching the same
      // table. The server replays Joined for each existing spectator
      // right after our JoinGameAck, so we don't need a separate
      // "fetch initial list" round-trip.
      case T.GameSpectatorJoined: {
        const spid = Proto.u32(sub, 2);
        if (spid && spid !== myId) {
          _specPids.add(spid);
          // Request the pseudo if we don't have it yet. PlayerInfoReply
          // will populate players[spid] and the modal renderer reads
          // straight from there, so the row updates next time the modal
          // is opened (or right now if it's already open).
          if (!players[spid]) {
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
        break;
      }
      case T.GameSpectatorLeft: {
        const spid = Proto.u32(sub, 2);
        if (spid) {
          _specPids.delete(spid);
          var _gim2 = document.getElementById('game-info-modal');
          if (_gim2 && _gim2.style.display === 'flex') {
            try { openGameInfoPopup(); } catch(e) {}
          }
        }
        break;
      }

      // Message de chat
      case T.Chat: {
        const pid  = Proto.u32(sub, 2);
        const ctype= Proto.u32(sub, 3);
        const text = Proto.str(sub, 4);
        const who  = players[pid] || (pid ? `#${pid}` : null);
        const cls  = ctype === 3 ? 'bc' : pid === myId ? 'mine' : '';
        // Logging de tous les messages chat (debug réactions)
        // Intercepter les réactions (préfixe ASCII [R])
        var _reEmoji = null;
        if (text && text.startsWith('[R]') && text.length < 12) _reEmoji = text.slice(3);
        else if (text && text.startsWith('/emoji ') && text.length < 18) _reEmoji = text.slice(7).trim();
        if (_reEmoji) {
          if (pid !== myId) {
            handleIncomingReaction(pid, _reEmoji, 'chat');
            // Pas d'affichage dans le chat — animation seule
          }
        } else if (!(pid === myId && ctype !== 3)) {
          // Mon propre message : déjà affiché en optimiste à l'envoi (classe 'mine').
          // Le serveur le rediffuse à tous, expéditeur compris → on ignore l'écho
          // pour ne pas afficher la ligne en double (broadcast ctype===3 conservé).
          addChat(who, text, cls);
        }
        break;
      }
      case T.TimeoutWarning: {
        const sec = Proto.u32(sub, 2);
        _timerSec = sec; // Sync avec le serveur
        // Si le serveur donne plus de temps que prévu, ajuster le total
        if (sec > _timerTot) _timerTot = sec;
        addChat(null, t('timerHurry', { s: sec }), 'sys', { key: 'timerHurry', params: { s: sec } });
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
              note.style.cssText = 'font-size:0.52rem;color:var(--orange);text-align:center;width:100%;margin-top:2px;font-style:italic';
              note.textContent = _currentLoginMode === 'lan'
                ? t('reactLanLocalNote')
                : t('reactLocalOnlyNote');
              rb.appendChild(note);
              setTimeout(function(){ note.style.opacity='0'; note.style.transition='opacity 1s'; setTimeout(function(){ note.remove(); }, 1000); }, 5000);
            }
          }
        } else {
          _lastMsgWasReaction = false;
          if (!amInGame) addChat(null, t('chatRefusedReason', { r: rejText }), 'sys', { key: 'chatRefusedReason', params: { r: rejText } });
          else if (!_chatRejectShown) {
            _chatRejectShown = true;
            if (_currentLoginMode === 'lan') {
              addGameChat(null, t('chatLanDisabled'), 'sys', { key: 'chatLanDisabled' });
            } else {
              addGameChat(null, t('chatServerRefused'), 'sys', { key: 'chatServerRefused' });
            }
          }
        }
        break;
      }

      case T.JoinGameAck: {
        gId = Proto.u32(sub, 1);
        // Back at the table — clear the transient pending-rejoin flag and the
        // banner, mais ÉCRIRE un marqueur durable « je suis dans la partie gId »
        // (pth_resume) : il permet de réintégrer la table après une coupure
        // suivie d'un rechargement complet (page rechargée → DOM neuf). Pour une
        // coupure transitoire (l'écran de jeu reste affiché), c'est _armRejoin()
        // qui réarme _pendingRejoin au moment de la reconnexion.
        _pendingRejoin = 0; _rejoinNickRetries = 0;
        try { localStorage.setItem('pth_resume', JSON.stringify({ n: myName, g: gId, t: Date.now() })); } catch(e) {}
        _hideBanner();
        // Fresh game = empty spectator set. The server will replay
        // GameSpectatorJoined for each existing spectator so we'll
        // rebuild the set within milliseconds.
        _specPids = new Set();
        const isAdmin = Proto.u32(sub, 2);
        // Appliquer le timeout de la partie (depuis games[] si on rejoint, sinon celui créé)
        if (games[gId] && games[gId].timeout) gameTimeout = games[gId].timeout;
        // Same for starting stack so the seat-data init (line ~1770) uses
        // the real configured value instead of 0. When *we* are the
        // creator, createGame() already wrote gameStartMoney directly —
        // this branch handles the case where we joined someone else's
        // table and discovered the settings via GameListNew.
        if (games[gId] && games[gId].startMoney) gameStartMoney = games[gId].startMoney;
        // Blind-raise schedule for the "blinds up" counter/alert.
        _raiseMode  = (games[gId] && games[gId].raiseMode)  || 1;
        _raiseEvery = (games[gId] && (_raiseMode === 2 ? games[gId].raiseMins : games[gId].raiseHands)) || 0;
        _endRaiseMode  = (games[gId] && games[gId].endRaiseMode)  || 1;
        _endRaiseValue = (games[gId] && games[gId].endRaiseValue) || 0;
        _lastBlindsUpHand = 0;
        amGameAdmin = !!isAdmin;
        // Replay hors-ligne en un tap : une fois recréée la table (on est admin),
        // enchaîner automatiquement le démarrage avec bots. Différé en microtâche
        // pour laisser ce handler finir son installation d'état.
        if (window._offlineMode && window._offlineAutoReplay && amGameAdmin) {
          window._offlineAutoReplay = false;
          setTimeout(function(){ try { App.startWithBots(); } catch (e) {} }, 0);
        }
        // Snapshot the lobby's view of this table for openGameInfoPopup.
        // Fields we care about: name, type, maxPlayers, priv, timeout,
        // startMoney. All of these come from NetGameInfo when the table
        // was originally listed. Default the name to "#<gId>" if missing.
        var _gm = (games[gId] || {});
        _gameMeta = {
          id:         gId,
          name:       _gm.name || ('#' + gId),
          type:       _gm.type || 1,       // 1=NoLimit Hold'em (default)
          maxPlayers: _gm.maxPlayers || 0,
          priv:       !!_gm.priv,
          timeout:    _gm.timeout || gameTimeout || 15,
          startMoney: _gm.startMoney || gameStartMoney || 3000,
        };
        // Note: we intentionally keep the static "TABLE" label in the
        // header rather than swapping in _gameMeta.name. Long table
        // names like "WebGame-Nono le rigolo" overflow the header on
        // mobile and hide the admin badge + control buttons. The full
        // name is still shown as the title of the game-info modal
        // when the user clicks "TABLE".
        var acb = document.getElementById('admin-close-btn');
        if (acb) acb.style.display = amGameAdmin ? '' : 'none';
        var asb = document.getElementById('admin-start-btn');
        if (asb) asb.style.display = amGameAdmin ? '' : 'none';
        var acbm = document.getElementById('admin-close-mob');
        if (acbm) acbm.style.display = amGameAdmin ? '' : 'none';
        // Kick button: shown only to admins (server ignores non-admin
        // KickPlayerRequest anyway, but exposing it would be confusing).
        var akb = document.getElementById('admin-kick-btn');
        if (akb) akb.style.display = amGameAdmin ? '' : 'none';
        var akbm = document.getElementById('admin-kick-mob');
        if (akbm) akbm.style.display = amGameAdmin ? '' : 'none';
        var asbm = document.getElementById('admin-start-mob');
        if (asbm) asbm.style.display = amGameAdmin ? '' : 'none';
        // Invite-players entry (menu ≡): any seated, non-spectator player
        // online may invite others; the server arbitrates. Hidden offline
        // and for spectators.
        var _imb = document.getElementById('invite-players-mob');
        var _ims = document.getElementById('invite-sep-mob');
        var _canInv = !window._offlineMode && !_amSpectator;
        if (_imb) _imb.style.display = _canInv ? '' : 'none';
        if (_ims) _ims.style.display = _canInv ? '' : 'none';
        addChat(null, t('joinedTableWaiting', { gid: gId, admin: isAdmin ? ' (admin)' : '' }), 'sys', { key: 'joinedTableWaiting', params: { gid: gId, admin: isAdmin ? ' (admin)' : '' } });
        show('s-game');
        // Clear any leftover felt from a previously-viewed table. After
        // leaveGame the rendered seats / pot / community stay in the DOM,
        // and since seats[] is empty on entry renderSeats() won't redraw —
        // so the previous hand would remain visible behind the waiting
        // panel. The server replays the real state right after JoinGameAck,
        // so starting from a clean felt is always correct (and a harmless
        // no-op when joining a genuinely fresh table).
        try {
          pot = 0; collectedPot = 0;
          if ($('g-pot'))    $('g-pot').textContent = 'Pot: 0';
          if ($('g-potbar')) $('g-potbar').textContent = 'Pot: 0';
          commCards = [];
          var _czComm  = document.getElementById('g-comm');  if (_czComm)  _czComm.innerHTML  = '';
          var _czSeats = document.getElementById('g-seats'); if (_czSeats) _czSeats.innerHTML = '';
        } catch(e) {}
        // ── Spectator UI mode ──
        // If we joined via spectateGame(), flip the banner up top and put
        // a 'You are watching' message in place of the action bar. Player
        // join paths leave _amSpectator untouched (still false) so this
        // branch is skipped and the regular waiting panel logic applies.
        var _specBan = document.getElementById('g-spectator-banner');
        if (_amSpectator) {
          if (_specBan) _specBan.style.display = '';
          // Replace action area with a static spectator message.
          // renderGameWaiting() targets #g-actions, perfect for this.
          renderGameWaiting(
            '<div class="spectator-message">' +
              '<span class="sm-icon">👁</span>' +
              t('spectatorActionMsg') +
            '</div>',
            true
          );
        } else {
          if (_specBan) _specBan.style.display = 'none';
        }
        document.body.classList.add('in-game');
        // Diffuser l'avatar aux autres joueurs via le proxy. We use
        // _myAvatarToBroadcast() which collapses the '__pth__' sentinel
        // to '' -- the other players will then receive an empty avatar
        // and render our initial. They'll still get our real PokerTH
        // avatar (if any) through their own PlayerInfoReply flow, so
        // sending the sentinel would just produce visual garbage.
        setTimeout(function() { _rebroadcastAvatar(); }, 500);
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
            rbl.textContent = t('reactionsLanLocal');
            rbl.style.color = 'var(--orange)';
          } else {
            rbl.textContent = t('reactionsLabel');
            rbl.style.color = '';
          }
        }
        const admBadge = document.getElementById('g-admin-badge');
        if (admBadge) admBadge.style.display = amGameAdmin ? '' : 'none';
        setTimeout(function(){ autoScaleTable(); }, 200);
        renderWaitingPanel();
        // The list of already-present players arrives via subsequent
        // GamePlayerJoined messages from the server. Schedule a few
        // refreshes so the panel populates as those messages land,
        // and so PlayerInfoRequest replies catch up.
        [200, 600, 1200, 2500].forEach(function(d){
          setTimeout(function(){ if (!_gameStarted) renderWaitingPanel(); }, d);
        });
        break;
      }

      case T.JoinGameFailed: {
        const failedGameId = Proto.u32(sub, 1);
        const failCode = Proto.u32(sub, 2);
        if (_pendingRejoin) {
          // We were reclaiming our seat but it's gone (grace window elapsed)
          // or the rejoin was refused — drop cleanly to the lobby. Clear the
          // in-game/admin state too, otherwise the client still thinks it's
          // in (and admin of) the dead table, which blocks creating a new one.
          _pendingRejoin = 0; _rejoinNickRetries = 0;
          try { localStorage.removeItem('pth_resume'); } catch(e) {}
          App._resetGameState();
          _hideBanner();
          updateLobbyPill();
          show('s-lobby');
          setStatus(t('rejoinFailed'), 'err');
          break;
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
        break;
      }

      case T.GamePlayerJoined: {
        const pid = Proto.u32(sub, 2);
        if (!seatData[pid]) seatData[pid] = {money:0,bet:0,action:'',active:false,folded:false};
        // 'gone' means the player has been seen leaving (GamePlayerLeft).
        // We reset it to false here because the same pid can rejoin (rare,
        // but possible if the player closes and reopens the tab fast).
        seatData[pid].gone = false;
        // ── SPECTATOR LATE-ARRIVAL FIX ──
        // When the game has already started (HandStart was processed), we
        // append late-arriving pids straight to seats[] so they appear
        // visually around the felt. For player mode this is a no-op
        // (GameStartInitial populated seats[] before the first
        // GamePlayerJoined, and the includes() check skips the duplicate).
        // For spectator mode it's the only path that learns about
        // newcomers after our HandStart bootstrap.
        if (_gameStarted && !seats.includes(pid)) {
          seats.push(pid);
          renderSeats();
        }
        const name = players[pid] || '#'+pid;
        addChat(null, name + ' ' + t('joinedGame'), 'sys', { prefix: name + ' ', key: 'joinedGame' });
        // Ask the server for this player's name if we don't have it yet,
        // so the waiting panel can display a real pseudo rather than '#42'.
        if (!players[pid]) {
          try {
            const req = Proto.encode([[1,0,pid]]);
            send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,req]]));
          } catch(e) {}
        }
        // Refresh the waiting panel if the game hasn't started yet.
        if (!_gameStarted) renderWaitingPanel();
        break;
      }

      case T.GamePlayerLeft: {
        const pid = Proto.u32(sub, 2);
        const name = players[pid] || '#'+pid;
        addChat(null, t('playerLeftTable', { name: name }), 'sys', { key: 'playerLeftTable', params: { name: name } });
        if (seatData[pid]) { seatData[pid].active = false; seatData[pid].gone = true; }
        renderSeats();
        // Refresh the waiting panel if the game hasn't started yet.
        if (!_gameStarted) renderWaitingPanel();
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
        if (_gameStarted) {
          var stillIn = seats.filter(function(p) {
            return seatData[p] && !seatData[p].gone;
          });
          if (stillIn.length <= 1) {
            // Don't re-trigger if an end-game overlay is already up.
            var _egoEl = document.getElementById('g-endgame-overlay');
            var alreadyShown = _egoEl && _egoEl.style.display !== 'none' && _egoEl.style.display !== '';
            // (empty string defaults to block via CSS; treat that as visible)
            // Stricter check: simply look at the offsetParent.
            var visible = _egoEl && _egoEl.offsetParent !== null;
            if (!visible) {
              var winnerPid = stillIn[0] || myId;
              addChat(null, '⚠ ' + t('onePlayerLeft'), 'sys', { prefix: '⚠ ', key: 'onePlayerLeft' });
              stopTurnTimer();
              dismissWinner();
              showEndGameOverlay(winnerPid);
            }
          }
        }
        break;
      }

      case T.RemovedFromGame: { _gameMeta = null;
        addChat(null, t('youWereRemoved'), 'sys', { key: 'youWereRemoved' });
        _pendingRejoin = 0; try { localStorage.removeItem('pth_resume'); } catch(e) {}
        App._resetGameState();
        show('s-lobby');
        break;
      }

      case T.StartEvent: {
        // Répondre avec StartEventAck
        const evGameId = Proto.u32(sub, 1);
        send(MSG.buildStartEventAck(evGameId));
        addChat(null, t('gameStarting'), 'sys', { key: 'gameStarting' });
        _eliminatedLogged.clear();
        break;
      }

      case T.GameStartInitial: {
        _gameStarted = true;
        // Reset de l'escalade des sons de montee de blinds (nouvelle partie).
        if (typeof resetBlindRaises === 'function') resetBlindRaises();
        // Clear the waiting panel ("EN ATTENTE…") immediately when the
        // game starts. It used to linger until our first MyActionRequest
        // because that's the next thing that writes to #g-actions —
        // meaning if another player goes first, the user sees the
        // start-now banner and the live table at the same time.
        var _ga = document.getElementById('g-actions');
        if (_ga) _ga.innerHTML = '';
        // Same goes for the "▶ Start" / "▶ Bots" admin buttons in the
        // header: once the game has started they no longer make sense.
        // Hide all four (desktop + mobile-overflow variants) defensively.
        ['admin-start-btn','admin-start-mob','admin-startnobots-btn','admin-startnobots-mob'].forEach(function(id){
          var el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
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
        const isFirstDeal = !_seatsFrozen;
        if (isFirstDeal) {
          seats  = newSeats.slice(); // copy, defensive
          _seatsFrozen = true;
          handNum = 0;
          // Nouvelle table → repartir de zéro pour les stats de session
          // (sinon le stack de départ et l'historique de la table précédente
          // persistent et faussent le « gain net »).
          _stats.handsPlayed = 0; _stats.handsWon = 0; _stats.startMoney = 0;
          _stats.peakMoney = 0; _stats.totalGain = 0; _stats.bigWin = 0;
          _stats.bigLoss = 0; _stats.history = [];
          _statsInited = false;
          _gameCounted = false;
          _myStackAtHandStart = null; _seatStackAtHandStart = {};
          if (_statsOpen) renderStats();
          const scEl = document.getElementById('g-myseat-cards');
          if (scEl) scEl.innerHTML = '<div class="pk sm back"></div><div class="pk sm back"></div>';
        }
        // Late joins : ajouter les nouveaux joueurs à la fin
        for (const pid of newSeats) {
          if (!seats.includes(pid)) seats.push(pid);
        }

        // Mettre à jour seatData pour tous les joueurs
        // active = vrai UNIQUEMENT si le joueur est dans newSeats (cette main)
        for (const pid of seats) {
          const inGame = newSeats.includes(pid);
          if (!seatData[pid]) seatData[pid] = {};
          if (isFirstDeal) {
            // Use the table's configured startMoney as the initial stack
            // for every seat. The server only sends per-player money in
            // PlayersActionDone, which means a seat that has NOT acted yet
            // (everyone except SB/BB on hand #1) keeps its 0 default —
            // which then makes the Call button mis-route to All-In once
            // toCall >= 0. Seeding with the real startMoney fixes that
            // misfire until PlayersActionDone corrects each seat's value.
            Object.assign(seatData[pid], {money: gameStartMoney || 3000, bet:0, action:'', active:inGame, folded:false});
          } else {
            // Conserver le stack, réinitialiser uniquement l'état de la main
            Object.assign(seatData[pid], {bet:0, action:'', active:inGame, folded:false});
          }
        }

        // Mémoriser le stack de chaque joueur AU DÉBUT de la main (avant blinds),
        // pour calculer le gain/perte NET exact (mien + bonus popup gagnant).
        _seatStackAtHandStart = {};
        for (const _sp of seats) {
          if (seatData[_sp] && seatData[_sp].money != null) _seatStackAtHandStart[_sp] = seatData[_sp].money;
        }
        _myStackAtHandStart = (_seatStackAtHandStart[myId] != null) ? _seatStackAtHandStart[myId] : null;

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

        // Re-diffuser l'avatar à chaque début de main (pour les nouveaux
        // connectés). Respecte le choix image / emoji / initiale.
        _rebroadcastAvatar();
        if (isFirstDeal) {
          setTimeout(function(){ renderSeats(); }, 120);
          renderGameWaiting(t('gameStartedWaitHand'));
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
        // Mode de jeu PERSISTANT entre les mains (comme le client officiel) :
        // pas de reset par main. Le joueur le change via le dropdown ou un
        // clic manuel sur une action.
        _preActionOpen = false; // referme tout panneau "aperçu" à chaque main
        try { _sdLosers = new Set(); } catch (e) {} // reset estompage perdants (nouvelle main)
        _ownReveal = false; // cartes propres re-masquées à chaque main (si option active)
        _lastCallSeen = -1; _callConfirmArmed = false; // reset anti-Call (nouvelle main)

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
        if (!_gameStarted) {
          _gameStarted = true;
          _seatsFrozen = true;
        }
        if (seats.length === 0) {
          seats = Object.keys(seatData)
            .map(Number)
            .filter(function(pid) { return !seatData[pid].gone; });
        }
        // Re-snapshot de chaque stack AU DÉBUT de cette main (avant blinds).
        // GameStartInitial le fait déjà sur le vrai serveur (il précède CHAQUE
        // main) ; mais le moteur offline n'envoie GameStartInitial qu'une fois
        // par partie, puis un simple HandStart à chaque main. Sans ce re-snapshot,
        // _myStackAtHandStart restait figé au buy-in initial → « solde net » de
        // session gonflé et « pire perte » jamais enregistrée. En ligne : idempotent
        // (seatData porte déjà la même valeur que celle figée par GameStartInitial).
        _seatStackAtHandStart = {};
        for (const _sp2 of seats) {
          if (seatData[_sp2] && seatData[_sp2].money != null) _seatStackAtHandStart[_sp2] = seatData[_sp2].money;
        }
        _myStackAtHandStart = (_seatStackAtHandStart[myId] != null) ? _seatStackAtHandStart[myId] : null;
        $('g-hand').textContent = t('handOf') + handNum;
        $('g-round').textContent = t('preflop');
        gameState = 0; // preflop
        commCards = [null, null, null, null, null];
        pot = 0; collectedPot = 0; highestBet = 0; minRaise = 0;

        // My cards (plainCards sub-message at field 2)
        // FIX : pour un SPECTATEUR le serveur peut envoyer plainCards vide ou sans les champs 1/2.
        // u32orNull distingue "champ absent" (null → carte cachée) de "valeur 0" (carte 2♣ valide).
        const pc = sub[2] ? Proto.decode(sub[2][0]) : {};
        myCards = [Proto.u32orNull(pc, 1), Proto.u32orNull(pc, 2)];
        // Comptes pokerth.net authentifiés : pas de plainCards (champ 2),
        // les cartes arrivent dans encryptedCards (champ 3), chiffrées AES-128
        // avec une clé dérivée du mot de passe. On les déchiffre ici. Le
        // déchiffrement est synchrone (clé/IV déjà dérivés à l'Init).
        if ((myCards[0] == null || myCards[1] == null) && sub[3] && _cardKey && _cardIV) {
          const cipher = (sub[3][0] instanceof Uint8Array) ? sub[3][0] : null;
          const dec = cipher ? PTHCrypto.decryptCards(cipher, _cardKey, _cardIV) : null;
          if (dec) myCards = [dec[0], dec[1]];
        }
        // If I'm bust (lost my whole stack last hand), the server may
        // still echo cards for the deal but I'm not actually in the
        // hand. Force-clear so the player bar shows card backs and
        // matches the eliminated state shown on my seat.
        if (seatData[myId] && seatData[myId].money <= 0 && !seatData[myId].gone) {
          myCards = [null, null];
        }
        const hsFields = Object.keys(sub).sort((a,b)=>+a-+b).map(f=>f+':'+Proto.u32(sub,+f)).join(' ');

        const sb = Proto.u32(sub, 4);
        var _prevSB = smallBlind;
        smallBlind = sb;
        // ── Compteur + explication "blinds" ──
        // On (re)construit à chaque main : la pastille compacte du bandeau
        // (cliquable) et le texte d'explication détaillé stocké pour le tap.
        try {
          var grp = (typeof _groupThousands === 'function') ? _groupThousands : function(n){ return String(n); };
          // Prochaine valeur de small blind selon le mode de fin de montée.
          var _nextSB = null;
          if (_endRaiseMode === 2 && _endRaiseValue > 0) _nextSB = sb + _endRaiseValue; // +valeur
          else if (_endRaiseMode === 3) _nextSB = null;                                 // garde la dernière
          else _nextSB = sb * 2;                                                         // doubler (défaut)

          // Le "quand" + la pastille compacte selon le mode d'intervalle.
          var _whenTxt = '', _chip = '';
          if (_raiseMode === 1 && _raiseEvery > 0) {
            var _left = _raiseEvery - ((handNum - 1) % _raiseEvery);
            _whenTxt = t('blindsNextTip', { n: _left });
            _chip = '↑\u202F' + _left;
          } else if (_raiseMode === 2 && _raiseEvery > 0) {
            _whenTxt = t('blindsEveryMin', { n: _raiseEvery });
            _chip = '↑';
          }

          // Texte d'explication (affiché au tap et lors de la montée).
          // Ex : "Blinds 1600/3200 → 3200/6400 · dans 1 main".
          var _curStr  = grp(sb) + '/' + grp(sb * 2);
          var _nextStr = (_nextSB != null) ? (grp(_nextSB) + '/' + grp(_nextSB * 2)) : null;
          window._blindsInfoHtml =
            '<span class="bu-icon">↑</span>'
            + '<span class="bu-text">' + t('blinds') + '</span>'
            + '<span class="bu-val">' + _curStr + (_nextStr ? '<span class="bu-arrow">→</span>' + _nextStr : '') + '</span>'
            + (_whenTxt ? '<span class="bu-when">' + _whenTxt + '</span>' : '');

          // Pastille du bandeau : cliquable → affiche l'explication.
          if (_chip) {
            var _tip = (_whenTxt || '').replace(/"/g, '');
            $('g-hand').insertAdjacentHTML('beforeend',
              ' <span class="blinds-next" role="button" tabindex="0" title="' + _tip + '"'
              + ' onclick="window.showBlindsInfo&&window.showBlindsInfo()">' + _chip + '</span>');
          }
        } catch (e) {}
        // ── Alerte au moment de la montée (les 2 modes) ──
        // Si le small blind a augmenté (hors 1ʳᵉ main) : bandeau + son, en
        // réutilisant l'explication qu'on vient de préparer.
        if (handNum > 1 && _prevSB > 0 && sb > _prevSB && _lastBlindsUpHand !== handNum) {
          _lastBlindsUpHand = handNum;
          if (typeof _showBlindsToast === 'function') _showBlindsToast(window._blindsInfoHtml, true);
        }
        dealerPid = Proto.u32(sub, 6) || dealerPid;

        // Reset seat data for new hand. IMPORTANT exclusions:
        //  - .gone pids (player left voluntarily, GamePlayerLeft set
        //    this) → keep as ghost seats forever.
        //  - players with money <= 0 (eliminated last hand by losing
        //    their stack, e.g. lost an all-in) → keep .active = false
        //    so renderSeats keeps the .seat-out greyed-out class and
        //    OUT badge, and skip them in the dealer rotation. The
        //    server doesn't deal them cards anyway; this just prevents
        //    the UI from showing them as live + clearing their stale
        //    cards from the previous hand.
        for (const pid of seats) {
          var __sd = seatData[pid];
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
        renderSeats();
        // Fix #3: was 'autoScaleTable + renderSeats' — the second renderSeats
        // here was redundant (we just called it 100ms earlier) and produced
        // a brief flicker as the same DOM was rebuilt twice in quick
        // succession. autoScaleTable() is enough — it adjusts the CSS
        // transform of the parent without touching the seat DOM at all.
        setTimeout(autoScaleTable, 100);
        setTimeout(animateCardDeal, 200);
        setTimeout(renderPreFlopStrength, 350);
        setTimeout(renderOddsMonitor, 400); // moniteur d'odds (préflop)
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
        if (hs) _hsHide(hs);
        renderGameWaiting(t('handOf') + ' ' + handNum + ' — Blinds: ' + sb + '/' + (sb*2));
        const _lhN = handNum, _lhSB = sb;
        logAction(function(){ return '══ ' + t('handOf') + ' ' + _lhN + ' — ' + t('blinds') + ' ' + _lhSB + '/' + (_lhSB*2) + ' ══'; });
        // Donneur (bouton) de la main — dealerPid déjà résolu plus haut (champ 6).
        if (dealerPid && getPlayerName(dealerPid)) {
          const _lhD = dealerPid;
          logAction(function(){ return '\uD83D\uDD18 ' + t('logDealer', { name: getPlayerName(_lhD) }); });
        }
        // Show my hole cards in log
        if (myCards[0] != null && myCards[1] != null) {
          const _lhMy0 = myCards[0], _lhMy1 = myCards[1];
          logAction(function(){ return t('myCards') + ' ' + cardName(_lhMy0, false) + ' ' + cardName(_lhMy1, false); });
        }
        break;
      }

      case T.PlayersTurn: {
        // PlayersTurnMessage: gameId=1, playerId=2, gameState=3
        turnPid   = Proto.u32(sub, 2);
        gameState = Proto.u32(sub, 3);
        // Defensive guard: if the server (older PokerTH versions, e.g.
        // the Debian 1.1.2-2 package) mistakenly sends PlayersTurn for
        // a player who has already left the table, ignore it. The
        // server should normally skip gone pids and assign the turn to
        // the next live one. We still set turnPid above (for any UI
        // consistency code that may inspect it) but bail out of the
        // turn-handling logic so we don't render a ghost as active.
        if (turnPid && seatData[turnPid] && seatData[turnPid].gone) {
          console.warn('[PlayersTurn] server assigned turn to a gone pid', turnPid, '— ignoring');
          renderSeats();
          break;
        }
        // A seat whose turn the server just assigned is by definition
        // in the hand — force active=true. Safety net for spectators
        // who joined mid-hand and missed the HandStart reset.
        if (turnPid && seatData[turnPid]) seatData[turnPid].active = true;
        const rounds = [t('preflop'),t('flop'),t('turn'),t('river'),t('preflop')+' (SB)',t('preflop')+' (BB)'];
        $('g-round').textContent = rounds[gameState] || t('preflop');
        startTurnTimer();
        if (turnPid === myId) {
          // C'est notre tour : on referme tout panneau "aperçu" pour ne pas
          // interférer avec la barre d'actions normale (et tous ses effets).
          _preActionOpen = false;
          // Mode auto PERSISTANT (Manuel/Auto Check-Call/Auto Check-Fold) :
          // si un mode auto est actif, jouer l'action sans afficher les boutons.
          // Le mode reste actif (pas de désarmement), comme le client officiel.
          if (_playAutoMode()) break;
          renderMyTurnActions();
          setMyTurnActive(true);
          // Play the audio ding-dong (from sounds.mjs, attached to window)
          // AND trigger the visual cue (tab title blink, browser notification).
          // These used to be one call but the visual function shadowed the
          // audio one, silencing the chime entirely.
          if (typeof window.notifyMyTurn === 'function') window.notifyMyTurn();
          notifyMyTurnVisuals();
          hapticBuzz([90, 50, 90]); // "your turn" double-buzz
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
        pot = collectedPot;
        for (const p of seats) if (seatData[p]) pot += seatData[p].bet;
        setPot(pot);
        logAction(getPlayerName(pid) + ': ' + aLabel + (bet ? ' ' + bet : ''));
        speak(voiceActionPhrase(action, pid, bet));
        if (pid === myId) {
          const myMon = (seatData[myId] || {}).money || 0;
          if ($('g-mystack')) $('g-mystack').textContent = myMon > 0 ? fmtChips(myMon) : '';
        }
        renderSeats();
        // Sons d'action : 6 sons PokerTH distincts (fold/check/call/bet/raise/
        // all-in) via playActionSound(), repli automatique sur les bips
        // synthetises si un sample n'est pas charge. La pop visuelle
        // animateAllIn() reste appairee a l'audio pour l'all-in.
        if (typeof playActionSound === 'function') {
          playActionSound(action);
        } else if (action === 6) {
          if (typeof notifyAllIn === 'function') notifyAllIn();
        } else {
          notifyAction();
        }
        flashActionLabel(pid);
        if (action === 6) animateAllIn(pid); // All-in
        if (bet > 0) {
          // Fix #2: chip starts moving immediately (was 80ms) so the
          // user's click → visual response loop feels instant.
          animateChipToPot(pid, bet);
          // Fix #1: pot updates 200ms after instead of 550ms. The chip
          // animation lasts ~700ms so the pot grows roughly as the
          // chip arrives — looks coherent without the long lag that
          // made rapid bot turns feel choppy.
          setTimeout(function(){
            animatePot(pot);
            updatePotSize(pot);
          }, 200);
        }
        break;
      }
      case T.DealFlop: {
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
        commCards = allValid(fA) ? fA : (allValid(fB) ? fB : fA);
        const dbg = 'FLOP sub:'+allVals+' →['+commCards.join(',')+']';
        if ($('g-debug')) $('g-debug').textContent = dbg;
        $('g-round').textContent = t('flop');
        gameState = 1;
        // Collect preflop bets into pot
        let flopBets = 0;
        for (const p of seats) if (seatData[p] && seatData[p].bet) { flopBets += seatData[p].bet; seatData[p].bet = 0; }
        collectedPot += flopBets;
        pot = collectedPot;
        // FIX 2024-XX : reset des stats par round.
        // Sans ce reset, le premier joueur à parler au flop voyait son
        // bouton afficher "Call X" (X étant la mise du round précédent)
        // alors que personne n'avait encore misé → le serveur rejetait
        // (rejectedActionNotAllowed) et le joueur restait coincé.
        highestBet = 0;
        minRaise   = 0;
        setPot(pot);
        const flopStr = commCards.filter(n=>n!=null).map(n=>cardName(n,true)).join(', ');
        renderComm(true); // flip animation
        renderSeats();
        setTimeout(renderHandStrength, 150); // force de la main au flop (was 500ms)
        setTimeout(renderOddsMonitor, 220); // moniteur d'odds (flop)
        const _lhPotF = pot;
        logAction(function(){ return '--- ' + t('flop') + ' [' + flopStr + '] · ' + t('pot') + ' ' + _groupThousands(_lhPotF) + ' ---'; });
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
        // Voir DealFlop pour le commentaire — reset des stats par round
        // pour éviter que le bouton Call affiche un montant périmé.
        highestBet = 0;
        minRaise   = 0;
        setPot(pot);
        const tvCard = commCards[3]; const tvName = tvCard != null ? cardName(tvCard, true) : '?';
        const _lhPotT = pot;
        logAction(function(){ return '--- ' + t('turn') + ' [' + tvName + '] · ' + t('pot') + ' ' + _groupThousands(_lhPotT) + ' ---'; });
        renderComm(true); // flip animation
        setTimeout(renderHandStrength, 150); // force de la main au turn (was 500ms)
        setTimeout(renderOddsMonitor, 220); // moniteur d'odds (turn)
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
        // Voir DealFlop pour le commentaire — reset des stats par round
        // pour éviter que le bouton Call affiche un montant périmé.
        highestBet = 0;
        minRaise   = 0;
        setPot(pot);
        const rvCard = commCards[4]; const rvName = rvCard != null ? cardName(rvCard, true) : '?';
        const _lhPotR = pot;
        logAction(function(){ return '--- ' + t('river') + ' [' + rvName + '] · ' + t('pot') + ' ' + _groupThousands(_lhPotR) + ' ---'; });
        renderComm(true, true); // flip animation + dramatic river
        setTimeout(renderHandStrength, 200); // force de la main à la river (was 600ms)
        setTimeout(renderOddsMonitor, 240); // moniteur d'odds (river)
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
          // FIX : un joueur sans carte révélée → null (pas 0 qui serait le 2♣)
          const c1  = Proto.u32orNull(a, 2);
          const c2  = Proto.u32orNull(a, 3);
          if (seatData[pid]) { seatData[pid].card1 = c1; seatData[pid].card2 = c2; }
        }
        renderSeats();
        break;
      }

      case T.EndOfHandShow: {
        _ownReveal = true; // showdown : mes cartes sont publiques, on les montre
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
          if (seatData[pid]) {
            seatData[pid].money  = cash;
            seatData[pid].card1  = c1;
            seatData[pid].card2  = c2;
            seatData[pid].action = won ? '🏆 +' + won : '';
          }
          // Abattage : cartes révélées + nom de la combinaison. Le label vient
          // de evaluateBestHand (clés hs* déjà traduites dans les 36 langues).
          // Joueurs couchés avant l'abattage : c1/c2 == null → pas de ligne.
          if (c1 != null && c2 != null) {
            const _bd = commCards.slice(); // fige le board de CETTE main
            logAction(function(){
              var ev = (typeof evaluateBestHand === 'function') ? evaluateBestHand([c1, c2], _bd) : null;
              return t('logShowdown', {
                name:  getPlayerName(pid),
                cards: cardName(c1, false) + ' ' + cardName(c2, false),
                hand:  ev ? ev.label : ''
              });
            });
          }
          if (won > 0) {
            winners.push({ pid, won, cash, c1, c2 });
            // Stats si c'est moi
            if (pid === myId) {
              // Gain NET de la main = stack final − stack au début de la main
              // (et NON le pot brut « won », qui inclut ma propre mise).
              var myStartHand = (_myStackAtHandStart != null) ? _myStackAtHandStart : ((_stats.startMoney || 0) + _stats.totalGain);
              var netWin = cash - myStartHand;
              var myPair2 = myCards.map && myCards.map(function(c){ return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 }; });
              recordHand(true, netWin, myPair2);
            }
            // Gain affiché dans le Journal 📋 (pas dans le chat, pour ne pas le noyer)
            logAction('🏆 ' + getPlayerName(pid) + ' +' + _groupThousands(won));
        speak(t('voiceWins', { name: getPlayerName(pid), n: fmtChipsVoice(won) }));
          }
        }
        // Enregistrer la perte si je ne suis pas dans les gagnants
        if (!winners.some(function(w){ return w.pid === myId; })) {
          var myEndMon = (seatData[myId] || {}).money;
          if (myEndMon != null) {
            var myStartMon = (_myStackAtHandStart != null) ? _myStackAtHandStart : ((_stats.startMoney || 0) + _stats.totalGain);
            var myLoss = myEndMon - myStartMon;
            var myPairLoss = myCards.map && myCards.map(function(c){
              return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 };
            });
            recordHand(false, myLoss, myPairLoss);
          }
        }
        // Options avancées : marquer les perdants du showdown (cartes révélées
        // mais pas gagnantes) pour estomper leurs cartes (fadeOutLosingCards, ON par défaut).
        try {
          _sdLosers = new Set();
          if (localStorage.getItem('pth_fade_losers') !== '0') {
            var _winPids = {};
            winners.forEach(function (w) { _winPids[w.pid] = 1; });
            for (var _lp in seatData) {
              var _ls = seatData[_lp];
              if (_ls && _ls.card1 != null && _ls.card2 != null && !_winPids[_lp])
                _sdLosers.add(parseInt(_lp, 10));
            }
          }
        } catch (e) {}
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
        logEliminations();
        _snapshotHandResults();
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
        if (won > 0) logAction('🏆 ' + getPlayerName(pid) + ' +' + _groupThousands(won));
        // Enregistrer le résultat de la main pour moi (fin sans abattage).
        var myHideMon = (seatData[myId] || {}).money;
        if (myHideMon != null) {
          var myHideStart = (_myStackAtHandStart != null) ? _myStackAtHandStart : ((_stats.startMoney || 0) + _stats.totalGain);
          var myHideNet   = myHideMon - myHideStart;
          var myPairHide  = myCards.map && myCards.map(function(c){
            return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 };
          });
          if (pid === myId) {
            // J'ai gagné sans abattage (tout le monde s'est couché) → victoire comptée.
            recordHand(true, myHideNet, myPairHide);
          } else if (myHideNet < 0) {
            // Quelqu'un d'autre a gagné et j'ai perdu des jetons (blinds/mise).
            recordHand(false, myHideNet, myPairHide);
          }
        }
        pot = 0; $('g-pot').textContent = 'Pot: 0';
        renderSeats();
        // Détection élimination (stack à 0)
        for (var _ep of seats) {
          if (_ep !== myId && seatData[_ep] && seatData[_ep].money === 0) {
            setTimeout(function(p){ animatePlayerEliminated(p); }, 600, _ep);
          }
        }
        logEliminations();
        if (won > 0) { _snapshotHandResults(); showWinnerOverlay([{pid, won, cash, c1:null, c2:null}]); }
        break;
      }

      case T.GameAdminChanged: {
        const newAdminId = Proto.u32(sub, 2);
        if (newAdminId !== myId) amGameAdmin = false;
        else amGameAdmin = true;
        break;
      }

      case T.YourActionRejected: {
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
        logAction(function(){
          var rl = { 1: t('rejInvalidState'), 2: t('rejNotYourTurn'), 3: t('rejNotAllowed') };
          var rs = rl[reason] || ('code ' + reason);
          return '⚠ ' + actStr + (rejBet ? ' ' + rejBet : '') + ' — ' + rs;
        });
        addGameChat(null, '⚠ ' + t('actionRejected') +
                          ' (' + actStr + ') — ' + reasonStr, 'sys', { prefix: '⚠ ', key: 'actionRejected', suffix: ' (' + actStr + ') — ' + reasonStr });
        // If we're still the active player according to the local state,
        // the server may give us a second chance — re-render the action
        // buttons so the user can retry. The local turn timer was already
        // stopped by doAction; restart it so the user has the full delay
        // again instead of a stale countdown.
        if (turnPid === myId && !_amSpectator) {
          renderMyTurnActions();
          startTurnTimer();
        }
        break;
      }

      case T.EndOfGame: {
        const winnerPid = Proto.u32(sub, 2);
        const _egPlace = Proto.u32(sub, 3);    // offline: classement à l'élimination (0 si absent)
        const _egElim  = !!Proto.u32(sub, 4);  // offline: joueur humain éliminé
        addChat(null, t('gameOverMsg'), 'sys', { key: 'gameOverMsg' });
        // Keep amInGame true until the user dismisses the overlay, so the
        // table screen stays visible behind it. Stop the turn timer and
        // suppress any further winner pop-ups.
        stopTurnTimer();
        dismissWinner();
        showEndGameOverlay(winnerPid, { eliminated: _egElim, place: _egPlace });
        break;
      }
    }
  }

  // ── AFFICHAGE DES TABLES ──
  const MODE_DOT   = {1:'dot-open', 2:'dot-run', 3:'dot-closed'};
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
    var prot = g.priv || g.type === 3;
    switch (filter) {
      case 'open':   return g.mode === 1 && g.players < (g.maxPlayers || 0);
      case 'nopass': return !prot;
      case 'live':   return g.mode === 2;
      default:       return true; // 'all'
    }
  }
  function _refreshFilterChips(entries) {
    // Counts are computed on the FULL set so each chip shows how many
    // tables it would reveal, regardless of the currently active filter.
    var ids = ['all', 'open', 'nopass', 'live'];
    ids.forEach(function(f) {
      var el = document.getElementById('fc-' + f);
      if (el) el.textContent = '(' + entries.filter(function(e){ return _tableMatches(e[1], f); }).length + ')';
    });
    document.querySelectorAll('#g-filter-bar .filter-chip').forEach(function(b) {
      b.classList.toggle('active', b.dataset.filter === _tableFilter);
    });
  }

  // ── Liste dépliable des joueurs par table (lobby) ─────────────
  // GameListNew fournit l'ENSEMBLE des IDs joueurs de chaque table
  // (champ 4, playerIds) — pas leur position de siège — donc on liste
  // qui est présent et on demande à la volée les pseudos inconnus
  // (même déduplication que le roster des joueurs en ligne).
  function renderTablePlayers(gid) {
    const g = games[gid];
    if (!g) return '';
    const seats = (g.seats || []);
    if (!seats.length) return '<div class="gp-empty">' + t('tablePlayersEmpty') + '</div>';
    return seats.map(function(pid){
      const nm = players[pid];
      if (!nm && !_pendingNameRequests.has(pid)) {
        _pendingNameRequests.add(pid);
        try { send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
      }
      const flag = _ccToFlag(_playerCountries[pid], 'gp-flag');
      const label = nm ? esc(nm) : '#' + pid;
      const av = _avatarChipHtml(pid, label, 'gp-av');
      return '<span class="gp-player' + (nm ? '' : ' gp-pending') + '">' + av + '<span class="gp-name">' + label + '</span>' + flag + '</span>';
    }).join('');
  }
  function _tableHasPid(pid) {
    for (const k of _openTables) {
      const g = games[k];
      if (g && g.seats && g.seats.indexOf(pid) !== -1) return true;
    }
    return false;
  }

  function renderGames() {
    // Utiliser entries() pour avoir l'id ET l'objet
    const entries = Object.entries(games);
    entries.sort(([,a],[,b]) => a.mode - b.mode);

    // Per-chip counts + active highlight (on the full set).
    _refreshFilterChips(entries);

    if (entries.length === 0) {
      $('g-count').textContent = '0 table(s)';
      $('g-list').innerHTML = loaded
        ? '<div class="empty">' + t('noTablesAvailable') + '</div>'
        : '<div class="empty">Chargement des tables<br><span class="ld"><span>●</span><span>●</span><span>●</span></span></div>';
      return;
    }

    // Apply the active filter.
    const shown = entries.filter(function(e){ return _tableMatches(e[1], _tableFilter); });
    $('g-count').textContent = shown.length + ' table(s)';

    if (shown.length === 0) {
      $('g-list').innerHTML = '<div class="empty">' + t('noTablesForFilter') + '</div>';
      return;
    }

    $('g-list').innerHTML = shown.map(([gid, g]) => {
      const label  = MODE_LABEL(g.mode);
      const type   = GTYPE(g.type) || '';
      const lock   = (g.priv || g.type === 3) ? '🔒 ' : '';
      const badgeCls = g.mode === 2 ? 'live' : (g.mode === 3 ? 'closed' : 'wait');
      var rawJoin = (typeof t === 'function' ? t('joinBtn') || '\u25B6 Join' : '\u25B6 Join');
      const joinLabel = (g.priv || g.type === 3)
        ? '🔒 ' + rawJoin.replace(/^\u25B6\s*/, '')
        : rawJoin.replace(/^\u25B6\s*/, '');
      const watchBtn = g.mode === 2
        ? '<button class="btn-xs btn-watch" title="' + t('watchTitle') + '" onclick="event.stopPropagation();App.spectateGame(' + gid + ')">👁</button>'
        : '';
      const joinBtn = g.mode !== 3
        ? '<button class="btn-join" onclick="event.stopPropagation();App.joinGame(' + parseInt(gid) + ')">' + joinLabel + '</button>'
        : '';
      // Seat dots from the REAL lobby counts (filled = taken, hollow =
      // free). The lobby list gives only player counts — no per-seat
      // identities — so we visualise occupancy, never fake avatars.
      var seatDots = '';
      var cap = Math.min(g.maxPlayers || 0, 10);
      for (var s = 0; s < cap; s++) seatDots += '<span class="seat-dot' + (s < g.players ? ' on' : '') + '"></span>';
      var metaBits = [];
      if (type) metaBits.push('<span class="game-type">' + type + '</span>');
      metaBits.push('<span>👥 ' + g.players + (g.maxPlayers ? '/' + g.maxPlayers : '') + '</span>');
      if (g.startMoney) metaBits.push('<span>🪙 ' + _groupThousands(g.startMoney) + '</span>');
      if (g.smallBlind) metaBits.push('<span>🃏 ' + _groupThousands(g.smallBlind) + '/' + _groupThousands(g.smallBlind * 2) + '</span>');
      var _blUp = (g.raiseMode === 2) ? (g.raiseMins > 0 ? t('blindsUpMins', { n: g.raiseMins }) : '') : (g.raiseHands > 0 ? t('blindsUpHands', { n: g.raiseHands }) : '');
      if (_blUp) metaBits.push('<span>\u2B06 ' + _blUp + '</span>');
      if (g.timeout)    metaBits.push('<span>\u23F1 ' + g.timeout + 's</span>');
      return '<div class="game-row gcard" onclick="App.toggleTablePlayers(' + parseInt(gid) + ')">'
        + '<div class="gcard-main">'
        + '<div class="game-name">' + lock + esc(g.name)
        + ' <span class="game-badge ' + badgeCls + '">' + label + '</span></div>'
        + '<div class="game-meta">' + metaBits.join('') + '</div>'
        + (seatDots ? '<div class="game-seats">' + seatDots + '</div>' : '')
        + '</div>'
        + '<div class="gcard-btns">' + joinBtn + watchBtn + '</div>'
        + '</div>'
        + '<div class="game-players' + (_openTables.has(String(gid)) ? ' open' : '') + '" id="gp-' + parseInt(gid) + '"' + (_openTables.has(String(gid)) ? '' : ' hidden') + '>'
        + (_openTables.has(String(gid)) ? renderTablePlayers(gid) : '')
        + '</div>';
    }).join('');
  }

  // ── CHAT ──
  function addChat(sender, text, cls='', spec) {
    if (sender && cls !== 'mine' && _isIgnored(sender)) return; // joueur ignoré : aucun rendu
    if (typeof addGameChat === 'function') addGameChat(sender, text, cls, spec);
    // Flash lobby chat button on new message
    var lcp = document.getElementById('lobby-chat-panel');
    var lcb = document.getElementById('lobby-chat-btn');
    if (lcb && (!lcp || lcp.style.display === 'none') && cls !== 'mine') {
      lcb.style.color = 'var(--gold)';
      clearTimeout(window._lobbyChatFlash);
      window._lobbyChatFlash = setTimeout(function(){ lcb.style.color=''; }, 3000);
    }
    if (sender) { try { if (localStorage.getItem('pth_chat_noemoji') === '1') text = _advStripEmoji(text); } catch (e) {} }
    const el = $('chat');
    const d  = document.createElement('div');
    d.className = 'msg ' + cls;
    if (sender) {
      d.innerHTML = `<span class="who">${esc(sender)}</span>: <span class="txt">${esc(text)}</span>`;
    } else {
      d.innerHTML = `<span class="txt">${esc(text)}</span>`;
    }
    if (spec && !sender) { try { d.dataset.sys = JSON.stringify(spec); } catch(e){} }
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
    // FIX 2024-XX : encodage PokerTH UNIQUE pour hole et comm cards.
    // Vérifié sur les assets PNG officiels (data/gfx/cards/default/*.png) :
    //   0..12  = ♦ 2..A     13..25 = ♥ 2..A
    //   26..38 = ♠ 2..A     39..51 = ♣ 2..A
    // Le paramètre isComm est ignoré (conservé pour compat. binaire).
    if (n == null) return '?';
    if (!Number.isInteger(n) || n < 0 || n > 51) return '?';
    var si = Math.floor(n / 13);
    var ri = n % 13;
    const suits = ['♦','♥','♠','♣'];
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    return (ranks[ri]||'?') + (suits[si]||'?');
  }

  // PokerTH card encoding — UNIQUE et 0-indexé pour TOUTES les cartes
  // (hole cards, flop, turn, river, all-in show, end-of-hand show).
  // Vérifié sur les assets officiels data/gfx/cards/default/*.png :
  //   0..12  = ♦ 2..A      13..25 = ♥ 2..A
  //   26..38 = ♠ 2..A      39..51 = ♣ 2..A
  // Le paramètre isComm est conservé pour compat binaire mais ignoré pour le mapping.
  // ── Card deck resolution (deck-aware) ──
  // data-deck '' = classic glyphs; 'svg' = official vector deck (rank+suit
  // filenames); anything else = a gallery deck at /cards/<id>/<n>.png (listed in
  // /cards/decks.json, managed by install.sh deck-add). The face path is posed as
  // the inline --cf var on each .pk; the back via --card-back on <html>.
  // _refreshDeck re-applies both when the deck changes (no re-render needed).
  function _deckFace(n) {
    var d = document.documentElement.getAttribute('data-deck') || '';
    if (!d) return '';
    var ext = document.documentElement.getAttribute('data-deck-ext') || 'png';
    return '/cards/' + d + '/' + n + '.' + ext;
  }
  function _deckBack() {
    var d = document.documentElement.getAttribute('data-deck') || '';
    if (!d) return '';
    var ext = document.documentElement.getAttribute('data-deck-ext') || 'png';
    // Le dos est servi en stale-while-revalidate par le SW (sans cache:'reload'),
    // donc sans suffixe un flipside.svg modifie ne s'affiche qu'au chargement
    // suivant. Le ?v=<build> force une URL neuve a chaque deploiement.
    return '/cards/' + d + '/flipside.' + ext + '?v=' + (window.BUILD_VERSION || '0');
  }
  function _refreshDeck() {
    try {
      var els = document.querySelectorAll('.pk[data-c]');
      for (var i = 0; i < els.length; i++) {
        var n = parseInt(els[i].getAttribute('data-c'), 10);
        els[i].style.setProperty('--cf', 'url(' + _deckFace(n) + ')');
      }
      var bk = _deckBack();
      if (bk) document.documentElement.style.setProperty('--card-back', 'url(' + bk + ')');
      else document.documentElement.style.removeProperty('--card-back');
    } catch (e) {}
  }
  try { window._refreshDeck = _refreshDeck; } catch (e) {}

  function cardToHtml(n, sm, isComm, extraCls) {
    extraCls = extraCls || '';
    const sz = sm ? ' sm' : '';
    if (n === null || n === undefined) return '<div class="pk' + sz + ' back' + extraCls + '"></div>';
    if (!Number.isInteger(n) || n < 0 || n > 51) {
      return '<div class="pk' + sz + ' back' + extraCls + '"></div>';
    }
    var si = Math.floor(n / 13);
    var ri = n % 13;
    const suits = ['♦','♥','♠','♣'];
    const suit  = suits[si] || '?';
    const rank  = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'][ri] || '?';
    // si: 0=♦ carreau, 1=♥ cœur, 2=♠ pique, 3=♣ trèfle
    // Les deux rouges (♦/♥) reçoivent des classes différentes pour
    // permettre au CSS d'utiliser des nuances de rouge distinctes
    // (narmod: confusion ♥/♦ à cause d'une couleur identique).
    const red   = (si === 0) ? ' red diamond' : (si === 1 ? ' red' : '');
    const spade = (si === 2) ? ' spade' : ''; // ♠ (2)
    return '<div class="pk' + sz + red + spade + extraCls + '" data-c="' + n + '" style="--cf:url(' + _deckFace(n) + ')"><span class="c-rank">' + rank + '</span><span class="c-suit">' + suit + '</span></div>';
  }


  // ─── My cards ───
  // Même encodage unique que cardToHtml — voir commentaire ci-dessus.
  function cardHtml(n, cls, isComm) {
    if (n == null) return '<div class="pk '+cls+' back"></div>';
    if (!Number.isInteger(n) || n < 0 || n > 51) {
      return '<div class="pk '+cls+' back"></div>';
    }
    var si = Math.floor(n / 13);
    var ri = n % 13;
    const suits = ['♦','♥','♠','♣'];
    const rank = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'][ri] || '?';
    const suit = suits[si] || '?';
    // ♦ et ♥ partagent la classe .red ; ♦ ajoute .diamond pour
    // une teinte vermillon différente du rouge profond du ♥.
    const red = (si === 0) ? ' red diamond' : (si === 1 ? ' red' : '');
    const spade2 = (si === 2) ? ' spade' : ''; // ♠ (2)
    return '<div class="pk '+cls+red+spade2+'" data-c="'+n+'" style="--cf:url('+_deckFace(n)+')"><span class="c-rank">'+rank+'</span><span class="c-suit">'+suit+'</span></div>';
  }

  // Cartes propres masquées ? (option pth_own_click active ET pas encore révélées)
  function _ownCardsHidden() {
    try { return localStorage.getItem('pth_own_click') === '1' && !_ownReveal; } catch (e) { return false; }
  }
  function renderMyCards() {
    const pb = document.getElementById('g-myseat-cards');
    if (!pb) return;
    var optOn = false; try { optOn = (localStorage.getItem('pth_own_click') === '1'); } catch (e) {}
    var hide = optOn && !_ownReveal;
    const c1 = hide ? null : (myCards[0] != null ? myCards[0] : null);
    const c2 = hide ? null : (myCards[1] != null ? myCards[1] : null);
    pb.innerHTML = cardHtml(c1, 'md') + cardHtml(c2, 'md');
    pb.classList.toggle('own-peek', hide);
    pb.style.cursor = optOn ? 'pointer' : '';
    // Tap sur la player-bar = bascule la révélation (uniquement si l'option est active).
    if (!pb._revealBound) {
      pb._revealBound = true;
      pb.addEventListener('click', function () {
        var on = false; try { on = (localStorage.getItem('pth_own_click') === '1'); } catch (e) {}
        if (!on) return;
        _ownReveal = !_ownReveal;
        renderMyCards();
        try { if (seats.length) renderSeats(); } catch (e) {}
      });
    }
  }
  // Re-rendu des cartes propres (player-bar + sièges) après bascule de l'option.
  window._refreshOwnCards = function () {
    try { renderMyCards(); } catch (e) {}
    try { if (seats.length) renderSeats(); } catch (e) {}
  };



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

  var _statsTab = 'session';
  function _statsSetTab(tab) { _statsTab = tab; renderStats(); }
  window._statsSetTab = _statsSetTab;

  function _statsRow(label, val, cls) {
    return '<div class="stat-row"><span class="stat-label">'+label+'</span><span class="stat-val '+(cls||'')+'">'+val+'</span></div>';
  }

  function renderStats() {
    var el = document.getElementById('stats-overlay');
    if (!el) return;
    // Onglets TOTAL (à vie) et CLASSEMENT (proxy) seulement dans les deux modes
    // réseau (LAN + serveur privé) : sur pokerth.net direct il n'y a ni stats
    // persistantes ni proxy de classement → seul SESSION a du sens.
    var eligible = _statsEligible;       // SESSION + TOTAL available
    var board    = _boardEligible;       // CLASSEMENT (proxy) available — private/LAN only
    if (!eligible && _statsTab !== 'session') _statsTab = 'session';
    if (!board && _statsTab === 'board') _statsTab = 'session';
    var titles = { session: t('statSession'), life: t('statTabLife'), board: t('statTabBoard') };
    function tb(id, label) {
      return '<button class="stats-tab'+(_statsTab===id?' active':'')+'" onclick="window._statsSetTab(\''+id+'\')">'+label+'</button>';
    }
    // pokerth.net direct (not eligible) → no tab bar (session only). Training shows
    // SESSION + TOTAL but no CLASSEMENT. Private/LAN shows all three.
    var tabs = eligible
      ? '<div class="stats-tabs">'+tb('session',t('statTabSession'))+tb('life',t('statTabLife'))
        + (board ? tb('board',t('statTabBoard')) : '') + '</div>'
      : '';
    var body;
    if (_statsTab === 'life')       body = _statsBodyLife();
    else if (_statsTab === 'board') body = '<div id="stats-board-body" class="stats-body"><div class="stat-empty">…</div></div>';
    else                            body = _statsBodySession();
    el.innerHTML = '<div class="stats-header"><span>📊 '+titles[_statsTab]+'</span>'
      + '<button onclick="toggleStats()" style="background:none;border:none;color:var(--text);cursor:pointer;font-size:0.9rem">✕</button>'
      + '</div>' + tabs + body;
    if (_statsTab === 'board') renderBoard();
  }

  function _statsBodySession() {
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
        + '<span class="hand-hist-result '+dcls+'">'+(h2.delta>0?'+':'')+_groupThousands(h2.delta)+' ¥</span>'
        + '</div>'
        + '<div class="hand-hist-cards">'
        + (h2.cards ? h2.cards.map(function(c){ return '<span style="background:#fff;color:'+(c.red?'#c0392b':'#111')+';border-radius:2px;padding:1px 3px;font-size:0.6rem;font-weight:700">'+c.r+c.s+'</span>'; }).join('') : '')
        + '</div>'
        + '</div>';
    }).join('') : '<div style="color:var(--text);font-size:0.62rem">' + t('noHandsPlayed') + '</div>';
    return '<div class="stats-body">'
      + _statsRow(t('statHandsPlayed'), s.handsPlayed)
      + _statsRow(t('statWins'), s.handsWon, 'pos')
      + _statsRow(t('statWinRate'), wr+'%')
      + '<hr class="stat-divider">'
      + _statsRow(t('statNet'), (gain>0?'+':'')+_groupThousands(gain)+' ¥', gainCls)
      + _statsRow(t('statBestWin'), '+'+_groupThousands(s.bigWin)+' ¥', 'pos')
      + _statsRow(t('statWorstLoss'), _groupThousands(s.bigLoss)+' ¥', 'neg')
      + '<hr class="stat-divider">'
      + '<div style="font-size:0.58rem;color:var(--gold-dim);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">'+t('statRecentHands')+'</div>'
      + histHtml
      + '</div>';
  }

  function _statsBodyLife() {
    var s = _lifeGet(myName);
    var gain = s.net;
    var gainCls = gain > 0 ? 'pos' : gain < 0 ? 'neg' : '';
    var wr = s.handsPlayed > 0 ? Math.round(s.handsWon/s.handsPlayed*100) : 0;
    var note = _statsOffline
      ? '<div class="stat-note">'+t('statLifeTraining')+'</div>'
      : (_statsEligible ? '' : '<div class="stat-note">'+t('statLifeOnlyPrivate')+'</div>');
    return '<div class="stats-body">'
      + note
      + _statsRow(t('statGamesPlayed'), s.gamesPlayed)
      + _statsRow(t('statGamesWon'), s.gamesWon, 'pos')
      + _statsRow(t('statStreak'), s.bestStreak, 'pos')
      + '<hr class="stat-divider">'
      + _statsRow(t('statHandsPlayed'), s.handsPlayed)
      + _statsRow(t('statWins'), s.handsWon, 'pos')
      + _statsRow(t('statWinRate'), wr+'%')
      + '<hr class="stat-divider">'
      + _statsRow(t('statNet'), (gain>0?'+':'')+_groupThousands(gain)+' ¥', gainCls)
      + _statsRow(t('statBestWin'), '+'+_groupThousands(s.bigWin)+' ¥', 'pos')
      + _statsRow(t('statWorstLoss'), _groupThousands(s.bigLoss)+' ¥', 'neg')
      + '<hr class="stat-divider">'
      + '<button class="stats-reset" onclick="window._statsReset()">'+t('statReset')+'</button>'
      + '</div>';
  }
  function _statsReset() {
    if (!confirm(t('statResetConfirm'))) return;
    _lifeReset();
    renderStats();
    // Rafraîchir aussi le popup de profil s'il est ouvert (il partage le
    // même onglet TOTAL avec son bouton reset).
    try {
      var pim = document.getElementById('player-info-modal');
      if (pim && pim.style.display !== 'none') _renderProfileStats();
    } catch (e) {}
  }
  window._statsReset = _statsReset;

  // Ranking criterion (persisted). net | per100 | winrate | games | streak.
  var _boardSort = 'net';
  try { _boardSort = localStorage.getItem('pth_board_sort') || 'net'; } catch(e) {}
  function _boardPer100(p) { return (p.handsPlayed>0) ? (p.net||0)*100/p.handsPlayed : 0; }
  function _boardWinRate(p){ return (p.handsPlayed>0) ? (p.handsWon||0)/p.handsPlayed : 0; }
  function _boardCmp(key) {
    if (key === 'per100')  return function(a,b){ return _boardPer100(b)-_boardPer100(a) || (b.net||0)-(a.net||0); };
    if (key === 'winrate') return function(a,b){ return _boardWinRate(b)-_boardWinRate(a) || (b.handsPlayed||0)-(a.handsPlayed||0); };
    if (key === 'games')   return function(a,b){ return (b.gamesWon||0)-(a.gamesWon||0) || (b.net||0)-(a.net||0); };
    if (key === 'streak')  return function(a,b){ return (b.bestStreak||0)-(a.bestStreak||0) || (b.net||0)-(a.net||0); };
    return function(a,b){ return (b.net||0)-(a.net||0); };
  }
  function _boardSetSort(k) {
    _boardSort = k;
    try { localStorage.setItem('pth_board_sort', k); } catch(e) {}
    if (document.getElementById('stats-board-body')) renderBoard('stats-board-body');
    if (document.getElementById('pim-board-body'))   renderBoard('pim-board-body');
  }
  window._boardSetSort = _boardSetSort;

  function renderBoard(targetId) {
    var boxId = targetId || 'stats-board-body';
    fetch('/stats', { cache:'no-store' })
      .then(function(r){ return r.ok ? r.json() : {}; })
      .then(function(data){
        var box = document.getElementById(boxId);
        if (!box) return;
        var arr = Object.keys(data || {}).map(function(name){ var v = data[name] || {}; v.name = name; return v; });
        arr.sort(_boardCmp(_boardSort));
        // Sort selector (↕). Labels reuse existing stat keys; only net/100 is new.
        var opt = function(id, lbl){ return '<option value="'+id+'"'+(_boardSort===id?' selected':'')+'>'+esc(lbl)+'</option>'; };
        var sortUI = '<div class="board-sort"><span>↕</span><select onchange="window._boardSetSort(this.value)">'
          + opt('net', t('statNet'))
          + opt('per100', t('boardPer100'))
          + opt('winrate', t('statWinRate'))
          + opt('games', t('statGamesWon'))
          + opt('streak', t('statStreak'))
          + '</select></div>';
        if (!arr.length) { box.innerHTML = sortUI + '<div class="stat-empty">'+t('boardEmpty')+'</div>'; return; }
        // My rank under the current criterion — shown even if far down the list.
        var myIdx = -1;
        for (var k=0;k<arr.length;k++){ if (arr[k].name===myName){ myIdx=k; break; } }
        var rankLine = (myIdx>=0)
          ? '<div class="board-myrank">'+t('boardYourRank', { n: myIdx+1, m: arr.length })+'</div>' : '';
        var rows = arr.map(function(p, i){
          var net = p.net||0, ncls = net>0?'pos':net<0?'neg':'';
          var mine = (p.name === myName) ? ' me' : '';
          var av = p.avatar ? p.avatar : (p.name ? p.name.charAt(0).toUpperCase() : '?');
          var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':('#'+(i+1));
          var hp = p.handsPlayed||0;
          var p100 = hp>0 ? Math.round(net*100/hp) : 0;
          var wrp  = hp>0 ? Math.round((p.handsWon||0)/hp*100) : 0;
          // Secondary line adapts to the active criterion so the ranked value is visible.
          var sub;
          if (_boardSort==='per100')       sub = (p100>0?'+':'')+_groupThousands(p100)+' ¥/100 · '+hp;
          else if (_boardSort==='winrate') sub = wrp+'% · '+hp;
          else if (_boardSort==='streak')  sub = '🔥 '+(p.bestStreak||0);
          else                             sub = '🏆'+(p.gamesWon||0)+' · '+(p.handsWon||0);
          return '<div class="board-row'+mine+'">'
            + '<span class="board-rank">'+medal+'</span>'
            + '<span class="board-av">'+esc(av)+'</span>'
            + '<span class="board-name">'+esc(p.name)+'</span>'
            + '<span class="board-net '+ncls+'">'+(net>0?'+':'')+_groupThousands(net)+' ¥</span>'
            + '<span class="board-sub">'+sub+'</span>'
            + '</div>';
        }).join('');
        box.innerHTML = sortUI + rankLine + '<div class="board-list">'+rows+'</div>';
      })
      .catch(function(){
        var box = document.getElementById(boxId);
        if (box) box.innerHTML = '<div class="stat-empty">'+t('boardEmpty')+'</div>';
      });
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
    _lifeRecordHand(won, delta);
    if (_statsOpen) renderStats();
  }

  // ── Probabilité de gain (Monte Carlo simplifié) ──
  function calcWinProb() {
    if (myCards[0] == null || myCards[1] == null) return -1;
    var comm = commCards.filter(function(c){ return c != null; });
    if (comm.length < 3) return -1; // seulement après le flop
    // Normaliser mes hole cards vers comm encoding (même échelle que commCards)
    var myNorm = [myCards[0], myCards[1]].map(normalizeHoleCard).filter(function(c){ return c != null; });
    if (myNorm.length < 2) return -1;
    // Le deck est en comm encoding (0-51). On exclut mes cartes normalisées + comm cards.
    var known = myNorm.concat(comm);
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
      // Cartes communes restantes (en comm encoding)
      var extraComm = d.slice(0, needed);
      var fullComm = comm.concat(extraComm);
      var pos = needed;
      // Évaluer ma main (myNorm est déjà en comm encoding)
      var myScore = evaluateBestHand(myNorm, fullComm);
      // Évaluer les adversaires (cartes piochées dans le deck comm)
      var myBest = true;   // je bats strictement tout le monde jusqu'ici
      var tied   = false;  // au moins une égalité (split) avec le meilleur adversaire
      for (var o = 0; o < nOpp; o++) {
        var oc1 = d[pos++], oc2 = d[pos++];
        if (oc1 === undefined || oc2 === undefined) break;
        // Les cartes adverses simulées sont en comm encoding (piochées du deck comm)
        var oppScore = evaluateBestHand([oc1, oc2], fullComm);
        // Départage complet sur la meilleure main à 5 cartes (catégorie + kickers)
        var cmp = _cmpHand(myScore, oppScore);
        if (cmp < 0) { myBest = false; break; } // un adversaire me bat → perdu
        if (cmp === 0) tied = true;             // égalité → split potentiel
      }
      if (myBest) wins += tied ? 0.5 : 1;       // split compté pour un demi-pot
    }
    return Math.round(wins / total * 100);
  }

  // ─── Force de la main ───
  // Sur le theme clair, les couleurs de force de main sont claires (prevues pour
  // fond sombre) et deviennent illisibles sur le panneau quasi-blanc. On les
  // fonce a luminance ~0.30 en conservant la teinte (texte + barre). Autres
  // themes (sombres) : inchange.
  function _hsContrastCol(col) {
    var isLight = false;
    try { isLight = (document.documentElement.getAttribute('data-theme') === 'pokerth-light'); } catch (e) {}
    if (!isLight) return col;
    var m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(col || '');
    if (!m) return col;
    var hx = m[1];
    if (hx.length === 3) hx = hx[0]+hx[0]+hx[1]+hx[1]+hx[2]+hx[2];
    var r = parseInt(hx.slice(0,2),16), g = parseInt(hx.slice(2,4),16), b = parseInt(hx.slice(4,6),16);
    var lum = (0.299*r + 0.587*g + 0.114*b) / 255;
    if (lum <= 0.33) return col;
    var f = 0.27 / lum;
    return 'rgb(' + Math.round(r*f) + ',' + Math.round(g*f) + ',' + Math.round(b*f) + ')';
  }
  function _hsSet(el, text, pct, col) {
    if (!el) return;
    col = _hsContrastCol(col);
    var p = (pct == null || isNaN(pct)) ? 0 : Math.max(0, Math.min(100, pct));
    var fill = el.querySelector('.hs-fill');
    if (fill) { fill.style.width = p + '%'; if (col) fill.style.background = col; }
    var lbl = document.getElementById('hs-lbl');
    if (lbl) { var txt = lbl.querySelector('.hs-txt') || lbl; txt.textContent = text; if (col) txt.style.color = col; lbl.style.display = ''; }
    // Fenetre flottante de l'assistance (meme modele que #odds-monitor) : drag + show.
    var aw = document.getElementById('assist-win');
    if (aw) { aw.style.display = ''; if (!aw._drag && typeof _attachPanelDrag === 'function') { _attachPanelDrag(aw, 'pth_assist_pos', 'hsw-drag'); aw._drag = true; } }
  }
  function _hsHide(el) {
    if (el) el.style.display = 'none';
    var lbl = document.getElementById('hs-lbl');
    if (lbl) { lbl.style.display = 'none'; var txt = lbl.querySelector('.hs-txt'); if (txt) txt.textContent = ''; }
    var aw = document.getElementById('assist-win');
    if (aw) aw.style.display = 'none';
  }
  function renderPreFlopStrength() {
    var el = document.getElementById('hand-strength');
    if (!el) return;
    if (!_assistOn) { _hsHide(el); return; } // assistance désactivée
    if (commCards.filter(function(c){ return c!=null; }).length > 0) return;
    if (myCards[0] == null || myCards[1] == null) { _hsHide(el); return; }
    var res = evaluatePreFlopHand(myCards[0], myCards[1]);
    if (!res) { _hsHide(el); return; }
    var label = res.label;
    var stars = res.stars >= 0
      ? ' ' + ('★'.repeat(res.stars+1) + '☆☆').slice(0,3)
      : '';
    var pfIdx = Math.max(0, Math.min(4, res.stars + 1));
    var pfCols = ['#a0acc4','#4080d8','#50b840','#E3C800','#e05050'];
    _hsSet(el, label + stars, Math.round(pfIdx / 4 * 100), pfCols[pfIdx]);
    el.style.display = 'block';
  }

  // ─── Force de la main ───
  function renderHandStrength() {
    var el = document.getElementById('hand-strength');
    if (!el) return;
    if (!_assistOn) { _hsHide(el); return; } // assistance désactivée
    var validComm = commCards.filter(function(c){ return c != null; });
    if (myCards[0] == null || myCards[1] == null || validComm.length === 0) { _hsHide(el); return; }
    // Normaliser les hole cards (1-indexed) vers l'encodage canonique (0-indexed)
    var holeNorm = [myCards[0], myCards[1]]
      .filter(function(c){ return c != null; })
      .map(normalizeHoleCard)
      .filter(function(c){ return c != null; });
    var result = evaluateBestHand(holeNorm, validComm);
    if (!result) { _hsHide(el); return; }
    var handLabel = result.label;
    var colors = ['#a0acc4','#a0acc4','#6aa0e8','#4080d8','#50c878','#50b840','#E3C800','#FFC107','#FF6D00','#e05050'];
    var handColor = colors[result.r] || 'var(--gold)';
    // Afficher le nom immédiatement, calcul win% en async
    _hsSet(el, handLabel + (validComm.length >= 3 ? ' …' : ''), Math.round(result.r / 9 * 100), handColor);
    el.style.display = 'block';
    // Monte Carlo win% seulement si >= 3 cartes communes
    if (validComm.length >= 3) {
      var _captureComm = validComm.slice();
      var _captureHole = [myCards[0], myCards[1]];
      setTimeout(function() {
        // Vérifier que le contexte n'a pas changé (nouvelle main, fold…)
        var currComm = commCards.filter(function(c){ return c != null; });
        if (currComm.length !== _captureComm.length) return;
        var pct = calcWinProb();
        if (pct < 0) return;
        var elNow = document.getElementById('hand-strength');
        if (!elNow) return;
        // Indicateur couleur : vert brillant ≥71%, vert 51-70%, jaune 36-50%, orange 26-35%, rouge ≤25%
        var pctCol = pct >= 60 ? '#50c878' : pct >= 45 ? '#E3C800' : pct >= 30 ? '#FF6D00' : '#e05050';
        _hsSet(elNow, handLabel + ' · ' + pct + '%', pct, pctCol);
      }, 0);
    }
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
  function _pthPuck(varName){
    if (!varName) return null;
    // iOS WebKit can return a STALE getComputedStyle value for a custom property after
    // a JS setProperty, which froze the puck on the previous theme. theme.mjs publishes
    // the current puck URLs directly (always fresh) -> read those first.
    try {
      var _k = varName === '--puck-sb' ? 'sb' : (varName === '--puck-bb' ? 'bb' : (varName === '--puck-dealer' ? 'dealer' : null));
      if (_k && window._pthPuckUrls && Object.prototype.hasOwnProperty.call(window._pthPuckUrls, _k)) {
        return window._pthPuckUrls[_k] || null;
      }
    } catch (e) {}
    try{
      var v = getComputedStyle(document.documentElement).getPropertyValue(varName);
      if (!v) return null; v = v.trim();
      if (!v || v === 'none') return null;
      var i = v.indexOf('url('); if (i < 0) return null;
      var s = v.slice(i + 4); var j = s.indexOf(')'); if (j < 0) return null;
      s = s.slice(0, j).trim().replace(/^["']|["']$/g, '');
      return s || null;
    }catch(e){ return null; }
  }
  function chipSvg(label, bg, fg, edge) {
    var _pk = _pthPuck(label === 'SB' ? '--puck-sb' : (label === 'BB' ? '--puck-bb' : ''));
    if (_pk) return '<img class="blind-chip" src="' + _pk + '" alt="' + label + '" width="20" height="20" onerror="this.outerHTML=window._pthChip(\'' + label + '\')">';
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
    var _pk = _pthPuck('--puck-dealer');
    if (_pk) return '<img class="dealer-chip" src="' + _pk + '" alt="D" width="20" height="20" onerror="this.outerHTML=window._pthChip(\'D\')">';
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
  // Fallback used by the puck <img onerror>: rebuild the built-in SVG chip so a
  // missing/removed puck image (e.g. a stale --puck-* left in localStorage by a
  // gallery theme that was later deleted) shows a proper D/SB/BB chip instead of
  // a broken-image square.
  window._pthChip = function (label) {
    var d = (label === 'D');
    var bg = d ? '#1a1a1a' : (label === 'SB' ? '#1565c0' : '#b71c1c');
    var fg = d ? '#ffd700' : '#fff';
    var edge = d ? '#3d2b00' : (label === 'SB' ? '#0a3d7a' : '#6d0c0c');
    var nf = d ? '#c8a850' : 'white';
    var ringStroke = d ? '#c8a850' : 'rgba(255,255,255,0.7)';
    var cls = d ? 'dealer-chip' : 'blind-chip';
    var txt = d ? 'D' : label;
    var fs = d ? 9 : 7;
    var notches = '';
    for (var i = 0; i < 8; i++) {
      notches += '<rect x="13" y="0.5" width="6" height="7" rx="2" fill="' + nf + '"'
               + ' transform="rotate(' + (i * 45) + ' 16 16)" opacity="0.9"/>';
    }
    return '<svg class="' + cls + '" viewBox="0 0 32 32" width="20" height="20" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="16" cy="16" r="15.5" fill="' + edge + '"/>'
      + '<circle cx="16" cy="16" r="13" fill="' + bg + '"/>'
      + notches
      + '<circle cx="16" cy="16" r="9" fill="' + bg + '" stroke="' + ringStroke + '" stroke-width="1.5"/>'
      + '<text x="16" y="16.5" text-anchor="middle" dominant-baseline="central"'
      + ' fill="' + fg + '" font-size="' + fs + '" font-weight="900"'
      + ' font-family="Arial Black,Arial,sans-serif">' + txt + '</text>'
      + '</svg>';
  };
  // Variante inline du jeton integre pour la barre heros (.player-bar) : pas de
  // classe blind-chip/dealer-chip (position:absolute -> se calerait sur le coin
  // de la barre fixe et partirait hors ecran), mais un rendu inline-block.
  window._pthBarChip = function (label) {
    return String(window._pthChip(label) || '')
      .replace(/class="(?:blind|dealer)-chip"/,
        'style="display:inline-block;width:18px;height:18px;vertical-align:middle;flex:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))"');
  };

  function getPlayerName(pid) { return players[pid] || (pid === myId ? myName : '#'+pid); }

  // ══ TURN TIMER ══
  function _timerSvg(secs, total) {
    var r = 20, cx = 25, cy = 25;
    var circ = 2 * Math.PI * r;
    var frac = Math.max(0, secs / (total || 30));
    var offset = (circ * (1 - frac)).toFixed(1);
    var urgent = secs <= 8;
    var col = urgent ? 'var(--timer-urgent, #e74c3c)' : 'var(--timer-normal, #f0c040)';
    // Arc dessiné dans le sens des aiguilles d'une montre (rotation -90°)
    return '<svg class="seat-timer" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"'
      + ' style="transform:rotate(-90deg);overflow:visible">'
      // Fond de piste (anneau gris foncé)
      + '<circle class="bg" cx="'+cx+'" cy="'+cy+'" r="'+r+'"/>'
      // Arc de progression
      + '<circle class="arc" cx="'+cx+'" cy="'+cy+'" r="'+r+'"'
      + ' style="stroke:'+col+'"'
      + ' stroke-dasharray="'+circ.toFixed(1)+'"'
      + ' stroke-dashoffset="'+offset+'"/>'
      // Pas de disque central ni de texte : le chiffre est affiché hors du cercle
      + '</svg>';
  }

  function _updateTimer() {
    _timerSec = Math.max(0, _timerSec - 1);
    // Update SVG arcs in place — no full re-render
    var urgent = _timerSec <= 8;
    var col = urgent ? 'var(--timer-urgent, #e74c3c)' : 'var(--timer-normal, #f0c040)';
    // Radius MUST match _timerSvg() (r=20): dashoffset is computed against the
    // same circumference as the stroke-dasharray drawn there, otherwise the
    // ring depletes on a different circle and empties ~1s early.
    var r = 20, circ = 2 * Math.PI * r;
    var offset = (circ * (1 - _timerSec / (_timerTot || 30))).toFixed(1);
    document.querySelectorAll('.seat-timer .arc').forEach(function(el) {
      el.style.stroke = col;
      el.setAttribute('stroke-dashoffset', offset);
    });
    // No <text> inside .seat-timer — the countdown number is rendered in the
    // seat badge (stb-*) and the player-bar below, not in the SVG.
    // Badge timer sous chaque siège
    var stb = document.getElementById('stb-' + turnPid);
    if (stb) { stb.textContent = _timerSec > 0 ? _timerSec + 's' : ''; stb.style.color = col; }
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
    // Alerte sonore du décompte — uniquement MON tour, et seulement si le
    // timeout de la table laisse de la marge (>= 10 s) pour ne pas harceler
    // sur les parties très rapides. Le mute global est respecté par playTone().
    // Tic léger à 5-4-3-2, bip marqué sur la dernière seconde.
    if (turnPid === myId && gameTimeout >= 10) {
      if (_timerSec >= 2 && _timerSec <= 5) {
        if (typeof notifyTick === 'function') notifyTick();
      } else if (_timerSec === 1) {
        if (typeof notifyTickFinal === 'function') notifyTickFinal();
      }
    }
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
      // Utiliser le cache ; recharger depuis localStorage si vide
      if (!_myAvatarCache) {
        try { _myAvatarCache = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
      }
      // Never return the '__pth__' sentinel as an "initial". The seat
      // builder renders the result inside <span class="seat-initial">;
      // returning the raw sentinel surfaced as '_PTH_' on every seat
      // when the user picked the PokerTH avatar but had no image
      // downloaded yet (LAN, guest, etc). Falling back to the name's
      // first letter is the right text fallback; the image (real or
      // placeholder logo) is layered on top by the renderer.
      if (_myAvatarCache && _myAvatarCache !== '__pth__' && _myAvatarCache !== '__img__') return _myAvatarCache;
      return myName ? myName.charAt(0).toUpperCase() : '?';
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

  // Positions des sièges en mode 'official' (slots fixes du client PokerTH).
  // Retourne [self, opp1, opp2, …] en px relatifs à la zone (top/left = CENTRE
  // du siège, cf. transform translate(-50%,-50%)). Index 0 = null : la self
  // garde sa position classique. Les adversaires (ordre de table depuis la self)
  // sont mappés sur les slots, séquence symétrique par nombre d'adversaires.
  //   Portrait : 2 colonnes G/D + rangée haute (client QML — cf. capture).
  //   Paysage  : grille périmètre, 5 sièges en haut + sièges bas (client desktop).
  // Fractions = part de la zone (x: 0=gauche..1=droite, y: 0=haut..1=bas).
  // Hors plage (>9 adversaires) : retourne null -> calcul classique conservé.
  function _officialSeatPix(n, isPortrait, zW, zH, oCX, oCY, oRect, boxScale) {
    var M = n - 1; // adversaires
    if (M < 1) return null;
    var _small = (boxScale || 1) < 0.99; // petit ecran : resserrer l'anneau vers le feutre
    // ── PORTRAIT : slots officiels QML (GameTable.qml slotPosPortrait) ──
    // Valeurs alignees 1:1 sur le client officiel + nudge px (slotForSeat) :
    // sieges du bas +14px, sieges du haut -4px (px de la zone de jeu).
    if (isPortrait) {
      var SLOTS_P = {
        L_bottom:[0.15,0.785], L_lower:[0.15,0.65], L_upper:[0.15,0.345],
        TL:[0.15,0.21], TC:[0.50,0.075], TR:[0.85,0.21],
        R_upper:[0.85,0.345], R_lower:[0.85,0.65], R_bottom:[0.85,0.785]
      };
      var SEQ_P = {
        1:['TC'], 2:['TL','TR'], 3:['TL','TC','TR'],
        4:['L_upper','TL','TR','R_upper'], 5:['L_upper','TL','TC','TR','R_upper'],
        6:['L_lower','L_upper','TL','TR','R_upper','R_lower'],
        7:['L_lower','L_upper','TL','TC','TR','R_upper','R_lower'],
        8:['L_bottom','L_lower','L_upper','TL','TR','R_upper','R_lower','R_bottom'],
        9:['L_bottom','L_lower','L_upper','TL','TC','TR','R_upper','R_lower','R_bottom']
      };
      var seqP = SEQ_P[M];
      if (!seqP) return null;
      var outP = [null]; // index 0 = self -> position classique
      // Repartir chaque colonne UNIFORMEMENT le long du feutre + TC au-dessus, sur TOUS
      // les ecrans. _slotRx borne (zW/2-66) pour garder les box dans l'ecran (pas de coupe
      // sur les bords). Espacement vertical borne (barre Pot en haut / zone d'action en bas).
      var _slotRx = Math.min(oRect.width / 2 + Math.max(75, oRect.width * 0.12), zW / 2 - (58 * (boxScale || 1) + 8));
      var _halfH = oRect.height / 2;
      var lanes = { L: [], R: [], T: [] };
      for (var i = 0; i < seqP.length; i++) {
        var nm = seqP[i];
        var lane = (nm === 'TC') ? 'T' : ((nm.charAt(0) === 'L' || nm === 'TL') ? 'L' : 'R');
        lanes[lane].push({ idx: i + 1, vy: SLOTS_P[nm][1] });
        outP.push(null);
      }
      var vRange = Math.min(oCY - 96, (zH - oCY) - 110);
      if (vRange < 70) vRange = 70;
      var sides = ['L', 'R'];
      for (var si = 0; si < 2; si++) {
        var arr = lanes[sides[si]];
        arr.sort(function(a, b){ return a.vy - b.vy; });
        var k = arr.length, lx = oCX + (sides[si] === 'L' ? -_slotRx : _slotRx);
        var sp = (k <= 1) ? 0 : Math.min(_small ? 106 : 175, (2 * vRange) / (k - 1));
        var y0 = oCY - sp * (k - 1) / 2;
        for (var j = 0; j < k; j++) outP[arr[j].idx] = { top: y0 + j * sp, left: lx };
      }
      if (lanes.T.length) outP[lanes.T[0].idx] = { top: oCY - (_halfH + (_small ? 60 : 84)), left: oCX };
      return outP;
    }
    // ── PAYSAGE : ellipse officielle (GameTable.qml buildLandscapeSlots) ──
    // Modele "collier" : self = grosse perle au point bas (90deg), les N
    // adversaires se repartissent sur le reste de l'arc (selfWeight). point()
    // applique le modelage vertical officiel (squash / gravity / pairSpread).
    // Le web n'a pas la bisection boxScale -> tailles de box de base QML (wide),
    // s = 1. Les fractions resultantes pourront etre calees visuellement.
    var compact = zH < 600;
    var s = 1;
    var oppBaseH = 84, oppBaseW = 114, selfBaseH = 84, selfBaseW = 114;
    var visualW = oppBaseW * s, visualH = oppBaseH * s, selfVisualH = selfBaseH * s;
    var sideBadgeGapBase = 48, selfBadgeGapBase = 8;
    var sideMargin = Math.max(18, zW * 0.025) + sideBadgeGapBase * s;
    var sideX = (sideMargin + visualW / 2) / Math.max(zW, 1);
    var radiusX = Math.max(0.22, 0.5 - sideX);
    var topY = ((compact ? 0 : 4) + visualH / 2) / Math.max(zH, 1);
    var selfTop = zH - 4 - selfVisualH;
    var selfGapY = compact ? Math.max(8, selfBadgeGapBase * s * 0.5) : selfBadgeGapBase * s;
    var bottomY = (selfTop - selfGapY - visualH / 2) / Math.max(zH, 1);
    var centerY = (topY + bottomY) / 2;
    var radiusY = (bottomY - topY) / 2;
    var lowerSquash = compact ? 0.2 : 1.0;
    var sideGravity = 0.25, topCosSquash = 1.4;
    var gravityUpperOnly = compact;
    var lowerGravity = compact ? 0.0 : 0.15;
    var maxBottomY = (selfTop + selfVisualH * 0.35 - visualH / 2) / Math.max(zH, 1);
    var vMaxLower = radiusY > 0 ? (maxBottomY - centerY) / radiusY : 1.0;
    var selfClearX = (selfBaseW * s / 2 + visualW / 2 + 12) / Math.max(zW, 1);
    function point(deg) {
      var rad = deg * Math.PI / 180;
      var sinV = Math.sin(rad), cosV = Math.cos(rad), sinOrig = sinV;
      if (sinV > 0 && lowerSquash !== 1.0) sinV = Math.pow(sinV, lowerSquash);
      if (sinV <= 0 && cosV !== 0) cosV = (cosV < 0 ? -1 : 1) * Math.pow(Math.abs(cosV), topCosSquash);
      var vFactor = sinV
                  + ((!gravityUpperOnly || sinV <= 0) ? sideGravity * Math.abs(cosV) : 0)
                  + (sinV > 0 ? lowerGravity * sinV : 0);
      if (!compact && cosV !== 0) {
        var ps = 0.02 * Math.abs(cosV);
        vFactor += (sinOrig < 0 ? -ps : ps);
      }
      if (vFactor > 1.0) vFactor = 1.0;
      if (vFactor < -1.0) vFactor = -1.0;
      if (compact && sinV > 0 && Math.abs(radiusX * cosV) > selfClearX && vMaxLower > vFactor)
        vFactor = vFactor + (vMaxLower - vFactor) * sinOrig;
      return [0.5 + radiusX * cosV, centerY + radiusY * vFactor];
    }
    var opps = Math.max(1, M);
    var selfWeight = compact ? 0.5 : 0.3;
    var dOpp = 360 / (opps + selfWeight);
    var dSelf = selfWeight * dOpp;
    var firstOppAngle = 90 + (dSelf + dOpp) / 2;
    // Cale l'ellipse QML sur l'ovale de feutre : on normalise les fractions
    // QML (cosV, vFactor in [-1,1]) puis on les mappe sur les rayons du feutre
    // (oRect) + marge, pour que les sieges epousent la table au lieu de s'etaler
    // sur toute la largeur (la zone est bien plus large que le feutre en paysage).
    var out = [null]; // index 0 = self -> position classique (bas)
    // Ovale regulier (repartition par angle) sur TOUS les ecrans. _erx borne (zW/2-66)
    // pour garder les box dans l'ecran ; _ery borne haut (barre Pot) / bas (actions).
    var _erx = Math.min(oRect.width / 2 + Math.max(75, oRect.width * 0.12), zW / 2 - (58 * (boxScale || 1) + 8));
    var _eryFloor = _small ? (64 + Math.max(0, M - 4) * 15) : 120; // resserre a peu de joueurs, evite le chevauchement de l'arc a table pleine
    var _ery = Math.max(70, Math.min(oRect.height / 2 + Math.max(_eryFloor, oRect.height * 0.45), oCY - 98, (zH - oCY) - 110));
    for (var ke = 1; ke <= opps; ke++) {
      var ang = (firstOppAngle + (ke - 1) * dOpp) * Math.PI / 180;
      out.push({ top: oCY + Math.sin(ang) * _ery, left: oCX + Math.cos(ang) * _erx });
    }
    return out;
  }

  function renderSeatsImmediate() {
    const el = $('g-seats');
    // Clic/tap sur un siège → popup d'info du joueur. Délégation posée une
    // seule fois : #g-seats persiste, seul son contenu est recréé à chaque
    // rendu. Les sièges deviennent cliquables via CSS (.seat { pointer-events }).
    if (el && !el._seatClickBound) {
      el._seatClickBound = true;
      el.addEventListener('click', function(ev) {
        var seat = (ev.target && ev.target.closest) ? ev.target.closest('.seat[data-pid]') : null;
        if (!seat || seat.classList.contains('seat-ghost')) return; // siège vide / joueur parti
        var sp = parseInt(seat.getAttribute('data-pid'), 10);
        if (!isNaN(sp)) openPlayerInfoPopup(sp);
      });
    }
    if (!seats.length) { el.innerHTML = ''; return; }
    // Keep ALL original seats when computing pixel positions. Previously
    // we filtered to active-only seats here, which caused the remaining
    // players to visually rotate / re-space themselves around the felt
    // every time someone got eliminated. Users found that disorienting:
    // "the players keep moving around between hands". Now we always
    // place against the original seating order and mark the eliminated
    // ones as .seat-out so they render visually faded but in place.
    const n = seats.length;
    const myIdx = seats.indexOf(myId);
    const rotated = myIdx >= 0 ? [...seats.slice(myIdx), ...seats.slice(0, myIdx)] : seats;
    // Position seats using actual pixel coords from getBoundingClientRect
    const oval = document.querySelector('.felt-oval');
    const zone = document.getElementById('g-table-zone');
    if (!oval || !zone) return;
    // Echelle de zoom courante (tablette/desktop) : chaque siege est reduit du
    // meme facteur que le feutre -> zoom uniforme. Mobile / zoom 1 -> 1 (no-op).
    var _seatZoom = 1;
    try { if (typeof _getTableZoom === 'function' && typeof _tableZoomGate === 'function' && _tableZoomGate()) _seatZoom = _getTableZoom(); } catch (e) {}
    // Petits ecrans : reduire la taille des box (avatars + texte) pour qu'elles tiennent
    // autour du feutre sans le chevaucher (le client officiel fait pareil via boxScale).
    var _seatBoxScale = 1;
    try { var _sbw = window.innerWidth, _sbh = window.innerHeight; if (Math.min(_sbw, _sbh) < 540) _seatBoxScale = (_sbh > _sbw) ? 0.78 : 0.86; } catch (e) {}
    // Placement des sièges : 'classic' (ellipse maison, défaut) ou 'official'
    // (slots fixes du client PokerTH : grille périmètre en paysage façon client
    // desktop, colonnes G/D + rangée haute en portrait façon client QML). Les
    // positions officielles sont appliquées en surcouche après la passe classique
    // (voir _officialSeatPix + le bloc de surcouche plus bas).
    var _seatModeV = 'auto';
    try { var _sm = localStorage.getItem('pth_seat_layout'); _seatModeV = (_sm === 'pokerth-official' || _sm === 'pokerth-ellipse') ? _sm : 'auto'; } catch (e) {}
    var _seatPortrait = (window.innerHeight > window.innerWidth);
    var _isPhone = Math.min(window.innerWidth, window.innerHeight) < 540;
    // auto : tel -> geometrie officielle (portrait=slots / paysage=ellipse) ; grand ecran -> layout maison.
    // pokerth-official = slots forces partout ; pokerth-ellipse = ellipse forcee partout.
    var _applyOfficial, _forceSeatPortrait;
    if (_seatModeV === 'pokerth-official') { _applyOfficial = true; _forceSeatPortrait = true; }
    else if (_seatModeV === 'pokerth-ellipse') { _applyOfficial = true; _forceSeatPortrait = false; }
    else { _applyOfficial = _isPhone; _forceSeatPortrait = _seatPortrait; }
    const oRect = oval.getBoundingClientRect();
    const zRect = zone.getBoundingClientRect();
    const oCX  = oRect.left - zRect.left + oRect.width  / 2;
    const oCY  = oRect.top  - zRect.top  + oRect.height / 2;
    const isMob = window.innerWidth < 640;       // phone (kept for reference)
    const isSmall = window.innerWidth < 900;     // phone + tablet : same tight layout
    // Small screens (phone + tablet) tighten the spread so players sit close to
    // the felt; desktop (>=900) keeps the wider, original layout.
    // rx must clear oval half-width + 8px border + ~10px seat radius
    const borderClear = isSmall ? 20 : 24; // px to add beyond oval half-size
    const rxRaw = oRect.width  / 2 + borderClear + (isSmall ? oRect.width*0.06 : oRect.width*0.16);
    // Vertical-spread multipliers. On mobile we tighten BOTTOM seats a lot
    // and TOP seats moderately, to bring the players visually closer to the
    // table on small screens. Desktop (>=900) keeps the original (symmetric)
    // multipliers; tablet now shares the small-screen (mobile) values below.
    //   yMulBot : seats whose angle places them in the lower half (sin>0)
    //   yMulTop : seats in the upper half (sin<=0)
    //   yMulMe  : the local player (i=0), kept slightly lower than the other
    //             bottom seats to leave breathing room above the player-bar.
    // The two bottom side-seats (the opponents flanking the local player)
    // were overlapping the felt rim on phones, so on MOBILE ONLY we push
    // them a little lower by raising yMulBot. The local player uses yMulMe
    // and is unaffected. Desktop keeps its values; tablet uses the small-screen ones.
    const yMulBot   = isSmall ? 0.20 : 0.18;
    const yMulTop   = isSmall ? 0.20 : 0.18;
    // The seat sitting EXACTLY at the top-centre (sinAng ≈ -1, exists only
    // when n is even: 4, 6, 8, 10…) is lowered slightly toward the table
    // because the latitude angle gives it the maximum vertical projection.
    // For all other top-half seats (sinAng > -0.95), we keep yMulTop so the
    // lateral pairs don't drift horizontally toward each other.
    const yMulTopC  = isSmall ? 0.14 : 0.18;
    const yMulMe    = isSmall ? 0.16 : 0.22;
    const ryBotRaw  = oRect.height / 2 + borderClear + oRect.height * yMulBot;
    const ryTopRaw  = oRect.height / 2 + borderClear + oRect.height * yMulTop;
    const ryTopCRaw = oRect.height / 2 + borderClear + oRect.height * yMulTopC;
    const ryMeRaw   = oRect.height / 2 + borderClear + oRect.height * yMulMe;
    // Clamp to zone boundaries (top seats clamped against space ABOVE the
    // oval, bottom seats clamped against space BELOW)
    const margin = isSmall ? 24 : 36;
    const rxPx  = Math.min(rxRaw,    Math.min(oCX, zRect.width - oCX) - margin);
    const ryTop = Math.min(ryTopRaw,  oCY - margin);
    const ryTopC= Math.min(ryTopCRaw, oCY - margin);
    const ryBot = Math.min(ryBotRaw,  zRect.height - oCY - margin);
    const ryMe  = Math.min(ryMeRaw,   zRect.height - oCY - margin);
    const stepA = 360 / n;
    // Lowest allowed vertical centre for a bottom seat (same floor the local
    // player's clamp already enforces): keeps seats above the player-bar.
    const botFloor = zRect.height - margin;
    const pixPos = rotated.map(function(_, i) {
      var ang = (90 - i * stepA) * Math.PI / 180;
      var sinAng = Math.sin(ang);
      // i === 0 is the local player (sin=1 by construction).
      // sinAng > 0       → bottom half → ryBot
      // sinAng < -0.95   → exact top-centre seat → ryTopC (only when n even)
      // otherwise        → top-half lateral pairs → ryTop
      var ry;
      if      (i === 0)         ry = ryMe;
      else if (sinAng > 0)      ry = ryBot;
      else if (sinAng < -0.95)  ry = ryTopC;
      else                      ry = ryTop;
      var topPos = oCY + ry * sinAng;
      // MOBILE ONLY: the two bottom side-seats (opponents flanking the local
      // player) only project sinAng (~0.5) of the radius downward, so the
      // radius-level clamp on ryBot keeps them too high — overlapping the felt
      // rim. Recompute them from the UNCLAMPED bottom radius and clamp the
      // final position instead, so they drop just outside the rim. The local
      // player (i===0) and the top seats are left exactly as before, and so
      // are tablet/desktop.
      if (isSmall && i !== 0 && sinAng > 0) {
        topPos = Math.min(oCY + ryBotRaw * sinAng, botFloor);
      }
      var leftPos = oCX + rxPx*Math.cos(ang);
      // MOBILE + n===4 ONLY: the two lateral seats (i=1 right, i=3 left) land
      // exactly at cos=±1, i.e. the maximum horizontal amplitude, so their
      // name label (max-width 84px, centre-anchored) spills past the screen
      // edge on phones. Lift them just above the top rim (still BELOW the
      // top-centre seat i=2) and pull them slightly toward the centre. The
      // local player (i===0) and the top-centre seat (i===2) are untouched,
      // as are all other player counts and tablet/desktop.
      if (isSmall && n === 4 && (i === 1 || i === 3)) {
        var dir = (i === 1) ? 1 : -1;
        topPos  = oCY - oRect.height / 2 - 26;   // remontée au-dessus du rebord
        leftPos = oCX + dir * rxPx * 0.81;       // rentrée vers le centre
      }
      return { top: topPos, left: leftPos };
    });
    // ── Placement officiel : surcouche slots fixes (portrait + paysage) ──
    // Remplace les positions des ADVERSAIRES par les slots du client PokerTH
    // (grille périmètre en paysage / colonnes G-D en portrait). La self (index 0)
    // garde sa position classique. Désactivé si la self n'est pas assise (myIdx<0)
    // ou hors plage (>9 adversaires) : on conserve alors le calcul classique.
    if (_applyOfficial && myIdx >= 0) {
      try {
        var _offPos = _officialSeatPix(rotated.length, _forceSeatPortrait, zRect.width, zRect.height, oCX, oCY, oRect, _seatBoxScale);
        if (_offPos) { for (var _op = 1; _op < pixPos.length; _op++) { if (_offPos[_op]) pixPos[_op] = _offPos[_op]; } }
      } catch (e) {}
    }
    // ── Calcul SB / BB à partir du dealer ──
    // We must SKIP seats whose player has left (.gone) -- otherwise
    // the SB/BB chips get assigned to a ghost seat that hides all
    // its badges via CSS, leaving the table with no visible blinds.
    // Walk around the table until we find a non-gone seat.
    const dealerIdx = seats.indexOf(dealerPid);
    function nextActiveSeat(fromIdx, offset) {
      if (fromIdx < 0 || !seats.length) return -1;
      var n = seats.length;
      // At most n steps — if everyone is gone/out we give up gracefully.
      var idx = fromIdx;
      var stepped = 0;
      for (var k = 0; k < n; k++) {
        idx = (idx + 1) % n;
        var __sd2 = seatData[seats[idx]];
        // Skip seats that are either:
        //   - gone (player left voluntarily), or
        //   - eliminated (money <= 0 and not playing this hand,
        //     i.e. active=false) — narmod reported SB chip landing
        //     on an OUT seat. The dealer chip should walk past them.
        var __skip = !__sd2 || __sd2.gone || (__sd2.active === false) || (__sd2.money != null && __sd2.money <= 0);
        if (!__skip) {
          stepped++;
          if (stepped === offset) return seats[idx];
        }
      }
      return -1;
    }
    const sbPid = dealerIdx >= 0 && seats.length > 1
      ? nextActiveSeat(dealerIdx, 1)
      : -1;
    const bbPid = dealerIdx >= 0 && seats.length > 2
      ? nextActiveSeat(dealerIdx, 2)
      : (seats.length === 2 ? seats[dealerIdx] : -1); // heads-up: dealer = SB
    // Mémorise SB/BB pour le popup d'info joueur (lu hors de renderSeats).
    _lastSbPid = sbPid; _lastBbPid = bbPid;

    // Update player-bar
    const mySd = seatData[myId] || {};
    const pbAv   = document.getElementById('g-myseat-av');
    const pbName = document.getElementById('g-myseat-name');
    const pbMon  = document.getElementById('g-myseat-money');
    const pbAct  = document.getElementById('g-myseat-action');
    const pbBar  = document.querySelector('.player-bar');
    if (pbAv) {
      // Don't write to pbAv directly here -- refreshMyAvatar() owns
      // the player-bar avatar rendering and knows about the '__pth__'
      // sentinel, the PokerTH logo placeholder (Q2=b), and the real
      // downloaded image. Calling it keeps a single source of truth
      // and prevents this update path from clobbering our <img>.
      try { window.refreshMyAvatar && window.refreshMyAvatar(); } catch(e) {}
      // Garder le vert pour moi (pas de couleur palette)
    }
    // Chips SVG dans la player bar
    const myBlindChip = myId === sbPid
      ? chipSvg('SB','#1565c0','#fff','#0a3d7a')
      : (myId === bbPid ? chipSvg('BB','#b71c1c','#fff','#6d0c0c') : '');
    var _barPuckStyle = 'style="display:inline-block;width:18px;height:18px;vertical-align:middle;flex:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.45))"';
    const myDealerBadge = myId === dealerPid
      ? dealerChipSvg().replace('class="dealer-chip"', _barPuckStyle).replace("window._pthChip('", "window._pthBarChip('")
      : '';
    const myBlindBadge = myBlindChip
      ? myBlindChip.replace('class="blind-chip"', _barPuckStyle).replace("window._pthChip('", "window._pthBarChip('")
      : '';
    if (pbName) {
      pbName.textContent = myName;
      // D + blind regroupés dans un seul conteneur inline-flex centré, pour
      // qu'ils soient parfaitement alignés entre eux (avant : deux <span> au
      // calage vertical différent — le jeton de blind avait un top:-1px).
      pbName.innerHTML = myName
        + ((myDealerBadge || myBlindBadge)
            ? '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;vertical-align:middle">'
              + myDealerBadge + myBlindBadge + '</span>'
            : '');
    }
    // Je suis "OUT" (éliminé) UNIQUEMENT si je n'ai plus de jetons ET que je
    // ne suis plus dans la donne (active === false, posé au début de la main
    // suivante en cas de bust). Un all-in laisse active === true → on NE grise
    // PAS pendant l'all-in, on attend que la main soit résolue et que je sois
    // réellement éliminé. Cohérent avec le critère des autres sièges (seat-out).
    var __amOut = !!(mySd && mySd.money != null && mySd.money <= 0
                     && mySd.active === false && !mySd.gone && !_amSpectator);
    if (pbMon) {
      pbMon.textContent = mySd.money != null ? fmtChips(mySd.money) : '—';
      if (__amOut) {
        pbMon.innerHTML = '<span class="pb-out-tag">OUT</span> · ' + pbMon.innerHTML;
      }
    }
    if (pbAct)  pbAct.textContent  = mySd.action || '';
    if (pbBar)  {
      pbBar.classList.toggle('pb-active', myId === turnPid);
      pbBar.classList.toggle('pb-out', __amOut);
    }

    var _pkHole = (document.documentElement.getAttribute('data-seat') === 'pokerth');
    var _maskMode = _advGet('hide_pbar', true); // mode masqué : self-box = siège
    let h = '';
    rotated.forEach((pid, i) => {
      const px = pixPos[i];
      const isMe = pid === myId;
      const sd = seatData[pid] || {};
      const isDealer = pid === dealerPid;
      const isActive = pid === turnPid;
      const isOut  = sd.active === false; // eliminated or sitting out this hand
      const isGone = !!sd.gone; // player left the table — ghost seat
      // Ghost seats take precedence over eliminated: a gone player gets
      // the minimal-visibility .seat-ghost class instead of .seat-out.
      // The two are mutually exclusive (gone implies active=false), but
      // we still gate the seat-out class on !isGone to be explicit.
      const cls = ['seat', isMe?'me':'', isDealer?'dealer':'', isActive?'active':'',
                   sd.folded && !isGone ? 'folded' : '',
                   isOut && !isGone ? 'seat-out' : '',
                   isGone ? 'seat-ghost' : ''].filter(Boolean).join(' ');
      var _ignHide = !isMe && _isIgnored(getPlayerName(pid)) && !_advGet('no_hide_ignored', false);
      const initial    = _ignHide ? ((getPlayerName(pid) || '?').charAt(0).toUpperCase() || '?') : getPlayerInitial(pid);
      const typeBadge  = getPlayerTypeBadge(pid);
      var _hasEmojiAv = isMe
        ? (function(){ try { var av = localStorage.getItem('pth_avatar'); return !!av && av !== '__pth__' && av !== '__img__'; } catch(e){ return false; } })()
        : (_ignHide ? false : !!_playerAvatars[pid]);
      const avatarType = isMe
        ? (_hasEmojiAv ? ' emoji-av' : '')
        : (isBot(pid) && !_ignHide ? ' is-bot emoji-av' : (_hasEmojiAv ? ' emoji-av is-human' : ' is-human'));
      const moneyStr = sd.money != null && sd.money >= 0 ? fmtChips(sd.money) : '—';
      // Cartes sous le siège : uniquement les adversaires au showdown
      // (mes propres cartes sont déjà visibles dans la player-bar en bas)
      let cardStr = '';
      if (!_pkHole && !isMe && sd.card1 != null && sd.card2 != null) {
        cardStr = '<div style="display:flex;gap:2px;margin-top:1px">'
          + cardHtml(sd.card1,'xsm') + cardHtml(sd.card2,'xsm') + '</div>';
      }
      h += '<div class="' + cls + ((!isMe && _sdLosers && _sdLosers.has(pid)) ? ' loser-fade' : '') + '" data-pid="' + pid + '" style="position:absolute;top:' + px.top.toFixed(1) + 'px;left:' + px.left.toFixed(1) + 'px;transform:translate(-50%,-50%) scale(' + (_seatZoom * _seatBoxScale) + ')">';
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
      // Drapeau du pays sur l'avatar (coin bas-droite, comme un badge).
      // Vide si pays inconnu → rien affiché.
      const seatFlag = _ccToFlag(_playerCountries[pid]);
      const flagBadge = seatFlag ? '<span class="seat-flag">' + seatFlag + '</span>' : '';
      // ── Step 3 display: if we have a downloaded PokerTH avatar for
      // this pid, slot it in as <img> on top of the initial/emoji.
      // Q1=A: official PokerTH avatar takes precedence over emoji custom
      // -- BUT only for OTHER players. For MY OWN seat, step 4 lets the
      // user choose explicitly (popup, sentinel '__pth__'). If they
      // picked an emoji or initial, we honour that here.
      let pthAvUrl = _pthAvatarFor(pid);
      if (isMe) {
        let myChoice = null;
        try { myChoice = localStorage.getItem('pth_avatar'); } catch(e) {}
        // If the user picked an emoji (or initial), suppress the
        // real avatar image for the local seat only.
        if (pthAvUrl && myChoice !== null && myChoice !== '__pth__') {
          pthAvUrl = null;
        }
        // Q2=b: user picked '__pth__' but no real image is available.
        // Show the local PokerTH chip logo as a placeholder so the
        // seat reflects their stated preference instead of falling
        // back to a bare initial letter.
        if (!pthAvUrl && myChoice === '__pth__') {
          pthAvUrl = '/favicon.svg';
        }
        // Image perso choisie localement : l'afficher sur mon siège.
        if (myChoice === '__img__') {
          try { pthAvUrl = localStorage.getItem('pth_avatar_img') || pthAvUrl; } catch(e) {}
        }
      }
      // Autres joueurs : image perso reçue via le proxy (prioritaire sur l'emoji).
      if (!isMe && _playerImgAvatars[pid]) pthAvUrl = _playerImgAvatars[pid];
      if (_ignHide) pthAvUrl = null;
      const pthImg = pthAvUrl
        ? '<img class="seat-pth-img" src="' + pthAvUrl + '" alt="" draggable="false">'
        : '';
      const avCls2 = avatarCls + (pthAvUrl ? ' has-pth-avatar' : '');
      h += '<div class="seat-plate">'; // pack siege : avatar + (nom/tapis) -- display:contents en classique
      h += '<div class="' + avCls2 + '" style="' + avatarStyle + '">'
        + pthImg
        + '<span class="seat-initial">' + initial + '</span>'
        + timerSvg
        + blindBadge
        + dealerChip
        + flagBadge
        + typeBadge
        + '</div>';
      // Mode masqué : MES cartes en grand dans le siège (self-box), quel que
      // soit le style de siège. Sinon, comportement habituel (style pokerth = xsm).
      var _selfBig = isMe && _maskMode && !isGone && !isOut;
      if ((_pkHole || _selfBig) && !isGone && !isOut) {
        var _ownHide = isMe && _ownCardsHidden();
        var _phc1 = isMe ? (_ownHide ? null : myCards[0]) : sd.card1;
        var _phc2 = isMe ? (_ownHide ? null : myCards[1]) : sd.card2;
        var _hcCls = _selfBig ? 'seat-holecards shc-big' : 'seat-holecards';
        var _hcSz  = _selfBig ? '' : 'xsm';
        h += '<div class="' + _hcCls + '">' + cardHtml(_phc1,_hcSz) + cardHtml(_phc2,_hcSz) + '</div>';
      }
      // Badge timer sous l'avatar (visible et non confondu avec l'emoji)
      if (isActive) h += '<div class="seat-timer-badge" id="stb-'+pid+'">'
        + ((_timerSec > 0) ? _timerSec + 's' : '') + '</div>';
      h += '<div class="seat-info">';
      h += '<div class="seat-name">' + esc(isMe ? myName : getPlayerName(pid)) + '</div>';
      h += '<div class="seat-money">' + moneyStr + '</div>';
      h += '</div>';   // ferme .seat-info
      h += '</div>';   // ferme .seat-plate
      h += '<div class="seat-foot">'; // pied : mise / action / cartes
      if (sd.bet) h += '<div class="seat-bet">' + fmtChips(sd.bet) + '</div>';
      if (sd.action) h += '<div class="seat-action-label">' + esc(sd.action) + '</div>';
      h += cardStr;
      h += '</div>'; // ferme .seat-foot
      h += '</div>'; // ferme .seat
    });
    el.innerHTML = h;
    _lastPixPos = pixPos;
    // Patcher l'avatar du joueur local immédiatement après le rendu.
    // Anti-flicker safety net: re-applies the emoji to .seat-initial
    // after a renderSeats() in case it lost it. Skipped entirely when
    // the user picked the PokerTH avatar -- in that case the renderer
    // already put an <img> in place and the .seat-initial is hidden
    // by .has-pth-avatar > .seat-initial { display:none } anyway.
    if (_myAvatarCache && _myAvatarCache !== '__pth__' && _myAvatarCache !== '__img__') {
      requestAnimationFrame(function() {
        var mySeats = document.querySelectorAll('#g-seats .seat.me');
        mySeats.forEach(function(seat) {
          var ini = seat.querySelector('.seat-initial');
          if (ini && ini.textContent !== _myAvatarCache) {
            ini.textContent = _myAvatarCache;
            var av2 = seat.querySelector('.seat-avatar');
            if (av2) av2.classList.add('emoji-av');
          }
        });
      });
    }
    var _ov2 = document.querySelector('.felt-oval');
    if (_ov2) { var _or2 = _ov2.getBoundingClientRect();
      _potCenter = { x: _or2.left + _or2.width/2, y: _or2.top + _or2.height/2 }; }
    requestAnimationFrame(function() {
      autoScaleTable();
      setTimeout(autoScaleTable, 150);
    });
  }

  // ── Coalesced public entry point ──
  // Multiple back-to-back renderSeats() calls (bot bursts, PlayersActionDone
  // floods, server replays) used to each trigger a full DOM rebuild + reflow.
  // With this wrapper, all calls within the same animation frame share ONE
  // actual render at the next rAF tick (~16 ms). The DOM still reflects the
  // latest game state — we never skip data, we just batch the paint.
  let _seatsRenderPending = false;
  function renderSeats() {
    if (_seatsRenderPending) return;
    _seatsRenderPending = true;
    requestAnimationFrame(function() {
      _seatsRenderPending = false;
      renderSeatsImmediate();
    });
  }

  function renderGameWaiting(msg, isHtml) {
    // Si le panneau "aperçu" est ouvert et que ce n'est pas notre tour, on
    // affiche le panneau au lieu du message d'attente (et on le garde sticky
    // face aux mises à jour serveur — tour d'un autre joueur, etc.).
    _lastWaitingMsg = msg; _lastWaitingIsHtml = !!isHtml;
    var _pinShow = (_actionBarPinned || _advGet('hide_pbar', true)) && !_amSpectator && _gameStarted && !(myCards[0] == null && myCards[1] == null);
    if ((_preActionOpen || _pinShow) && turnPid !== myId) { _renderPreActionPanel(); updateBottomLayout(); return; }
    // isHtml=true : msg contient du HTML interne sûr (généré par notre code)
    $('g-actions').innerHTML = '<div class="waiting-msg">' + (isHtml ? msg : esc(msg)) + '</div>';
    updateBottomLayout();
  }

  // Rendu du panneau "aperçu des actions" (cartes tapées hors de notre tour).
  // Boutons d'action en APERÇU (désactivés) + le seul réglage activable :
  // l'auto-check/fold. Toujours rendu dans #g-actions.
  function _flushPreviewIfPending() {
    if (!_modeSelPendingPreview) return;
    _modeSelPendingPreview = false;
    if (_preActionOpen && turnPid !== myId) renderMyTurnActions(true);
  }

  function _updatePinBtn() {
    var b = document.getElementById('g-pin-btn'); if (!b) return;
    var ga = document.getElementById('g-actions');
    // Resynchronise la visibilite a chaque changement de contenu de #g-actions
    // (attente / demarrage / showdown / barre d'action...). Pose une seule fois.
    if (ga && !ga._pinObs) { ga._pinObs = 1; try { new MutationObserver(_updatePinBtn).observe(ga, { childList: true }); } catch(e){} }
    // L'epingle n'apparait QUE quand les touches d'action sont affichees (live ou apercu).
    var hasActions = !!(ga && ga.querySelector('.action-grid'));
    // Mode masqué : la barre d'action est deja affichee en permanence par l'option
    // (independamment du pin) -> le bouton pin devient inutile, on le cache.
    var _maskMode = _advGet('hide_pbar', true);
    b.style.display = (hasActions && !_maskMode) ? 'flex' : 'none';
    if (!hasActions || _maskMode) return;
    var on = _actionBarPinned || _advGet('hide_pbar', true);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.style.opacity = on ? '1' : '0.5';
    b.style.borderColor = on ? 'var(--gold)' : 'var(--border)';
    b.style.boxShadow = on ? '0 0 8px var(--border-hi)' : '0 1px 4px rgba(0,0,0,0.28)';
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
    _preActionOpen = false;
    if (turnPid && turnPid !== myId && seatData[turnPid]) {
      renderGameWaiting(
        '<span style="font-family:inherit">' + esc(getPlayerName(turnPid)) + '</span>'
        + '<span class="thinking-dots"><span></span><span></span><span></span></span>', true);
    } else {
      $('g-actions').innerHTML = '';
      updateBottomLayout();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Waiting-room panel — shown between JoinGameAck and GameStartInitial.
  // Displays:
  //   * current/max player count + progress bar
  //   * minimum-to-start indicator (poker needs 2 humans/bots)
  //   * the list of players currently in the room, each with their
  //     avatar (cached emoji or '?') and pseudo
  //   * admin-vs-guest action hint
  // Refreshed automatically by GamePlayerJoined, GamePlayerLeft and
  // PlayerInfoReply handlers; frozen once GameStartInitial fires.
  // ─────────────────────────────────────────────────────────────────
  function renderWaitingPanel() {
    if (_gameStarted) return;
    const g = games[gId] || {};
    const maxP    = g.maxPlayers || 5;
    const minToStart = 2;

    // Collect the pids currently AT THE TABLE. We can't use seatData.active
    // because that flag is per-hand (it's set true on HandStart, false when
    // the player folds or sits out). Before the first hand has even started,
    // every newly-joined player is created with active=false by design — so
    // filtering on 'active' would hide them all in the waiting panel.
    //
    // Instead we use a dedicated 'gone' flag, set by the GamePlayerLeft
    // handler and reset by GamePlayerJoined. A pid is at the table iff its
    // seatData entry exists AND .gone is not true.
    const pids = Object.keys(seatData)
      .map(Number)
      .filter(function(pid) {
        return seatData[pid] && !seatData[pid].gone;
      });
    if (!_amSpectator && !pids.includes(myId) && myId) pids.push(myId); // spectators aren't seated

    // 'current' MUST come from the same source as the player list below
    // so the two can't disagree visually. We tried using games[gId].players
    // as a fallback (commit 6e03ed1) and as a 'safety net' value here, but
    // both lead to inconsistencies:
    //
    //   * games[gId].players is the LOBBY counter, only updated by
    //     GameListPlayerJoined / Left. Once a client enters a game, the
    //     server stops sending those messages to it, so this counter
    //     freezes at its last value — typically reflecting the state
    //     when the user joined.
    //
    //   * Combining it via Math.max with pids.length produces:
    //         lobby counter=2 (stale), pids.length=1 (real)  → shows 2
    //     even though the list right below only has 1 pseudo. This was
    //     visible after a user disconnected and reconnected.
    //
    // pids is the same array we iterate to build the list below. By
    // anchoring current on pids.length we guarantee count and list
    // always agree.
    const current = Math.max(pids.length, 1);

    // Build the player list rows
    let rows = '';
    for (const pid of pids) {
      const isMe = pid === myId;
      const nick = isMe
        ? (document.getElementById('nick') ? document.getElementById('nick').value : (players[pid] || ''))
        : (players[pid] || ('#' + pid));
      // Unified chip: real PokerTH image > placeholder logo > emoji >
      // bot icon > initial letter. Same decision tree as the seat.
      const avChip = _avatarChipHtml(pid, nick, 'wp-av');
      const meTag  = isMe ? ' <span class="wp-me">' + t('waitingYou') + '</span>' : '';
      rows += '<li class="wp-player">' + avChip + '<span class="wp-name">' + esc(nick) + '</span>' + meTag + '</li>';
    }

    // Progress bar (filled circles for present, empty for missing)
    let dots = '';
    for (let i = 0; i < maxP; i++) {
      dots += (i < current) ? '<span class="wp-dot wp-dot-on"></span>'
                            : '<span class="wp-dot wp-dot-off"></span>';
    }

    // Minimum-to-start message
    const enough = current >= minToStart;
    const statusLine = enough
      ? '<div class="wp-ok">' + t('waitingEnough') + '</div>'
      : '<div class="wp-need">' + t('waitingNeedMore', { n: (minToStart - current) }) + '</div>';

    // Admin hint
    const hint = amGameAdmin
      ? '<div class="wp-hint wp-hint-admin">' + t('waitingHintAdmin') + '</div>'
      : '<div class="wp-hint">' + t(_amSpectator ? 'waitingHintSpectator' : 'waitingHintGuest') + '</div>';

    // Start-now banner: shown to the ADMIN only, when the table was
    // created with the 'fill with bots' option AND the configured minimum
    // number of humans is reached. The banner contains a pulsing button
    // that triggers the existing App.startWithBots() flow. It replaces the
    // implicit (and broken) auto-start that the original code seemed to
    // promise but never wired up: window._minHumansNeeded was written but
    // never read anywhere.
    //
    // We re-evaluate the threshold every render (panel refreshes on join/
    // leave/PlayerInfoReply), so the banner appears/disappears as people
    // come and go.
    // Side-effect: refresh the standalone "▶ Start (no bots)" admin
    // button visibility. We do it here rather than in the JoinGameAck
    // handler because admins typically have count=1 at JoinGameAck
    // (just themselves) — the second human is what makes the button
    // useful, and that join triggers a re-render of this panel.
    try { refreshStartNoBotsVisibility(); } catch(e) {}

    // ── Admin start panel ─────────────────────────────────────
    //
    // Shown to the admin whenever there are >= 2 humans at the table
    // (the minimum required by the server to start a hand). It used
    // to require _createWithBots + _minHumansNeeded — those gates are
    // gone now because the panel offers BOTH choices side by side:
    //
    //   ▶ Démarrer      → App.startNoBots()    (humans only)
    //   ▶ + Bots        → App.startWithBots()  (fill empty seats)
    //
    // We use the existing wp-ready-* style language for visual
    // continuity (green theme, soft pulse), and label them concisely
    // so they fit on one row even on the smallest mobile widths.
    // The same buttons also exist in the header (▶ Start / ▶ Bots)
    // and one click on either path is enough — duplicating them in
    // the waiting panel is a deliberate UX choice: that's where the
    // admin is already looking, especially on mobile where the
    // header buttons are tucked into the ••• overflow.
    let readyBlock = '';
    // Show "+ Bots" whenever the admin has empty seats to fill (works even
    // with a single human, e.g. offline mode). "Start" (humans only) still
    // requires the server minimum of 2 humans.
    if (!_amSpectator && amGameAdmin && (current >= 2 || current < maxP)) {
      var startNoBotsBtn = (current >= 2)
        ? '<button class="wp-ready-btn" onclick="App.startNoBots()" title="' + t('wpStartHumansTip') + '">▶ ' + t('wpStart') + '</button>'
        : '';
      var fillBotsBtn = (current < maxP)
        ? '<button class="wp-ready-btn wp-ready-btn-bots" onclick="App.startWithBots()" title="' + t('wpFillBotsTip') + '">▶ + Bots</button>'
        : '';
      readyBlock =
        '<div class="wp-ready-row">' +
          '<div class="wp-ready-label">✓ ' + t('wpReady') + '</div>' +
          '<div class="wp-ready-btn-row">' + startNoBotsBtn + fillBotsBtn + '</div>' +
        '</div>';
    }

    const html =
      '<div class="waiting-panel">' +
        '<div class="wp-title">⏳ ' + t('waitingStart') + '</div>' +
        '<div class="wp-count">' + t('waitingPlayerCount') + ' <b>' + current + '</b> / ' + maxP + '</div>' +
        '<div class="wp-bar">' + dots + '</div>' +
        statusLine +
        '<ul class="wp-list">' + rows + '</ul>' +
        readyBlock +
        hint +
      '</div>';
    renderGameWaiting(html, true);
  }

  // ─────────────────────────────────────────────────────────────────
  // End-of-game overlay — shown when EndOfGame fires (server signals
  // the tournament is over). Displays:
  //   * 🏆 trophy + 'TOURNAMENT ENDED' headline
  //   * winner avatar + nickname (with 'YOU WON' styling if winner === me)
  //   * the local player's session-stats card
  //   * two buttons: 'Close' (dismiss overlay, stay on table view) and
  //     'Back to lobby' (full leaveGame).
  // The user must click one of the two buttons — no auto-dismiss, no
  // background click escape.
  // ─────────────────────────────────────────────────────────────────
  function showEndGameOverlay(winnerPid, opts) {
    const el = document.getElementById('g-endgame-overlay');
    if (!el) return;

    opts = opts || {};
    const eliminated = !!opts.eliminated;
    const place = opts.place || 0;
    const isMyWin = (winnerPid === myId) && !eliminated;
    if (!_gameCounted) { _gameCounted = true; _lifeRecordGame(isMyWin); }
    const winnerName = players[winnerPid] || (isMyWin
      ? (document.getElementById('nick') ? document.getElementById('nick').value : 'You')
      : ('#' + winnerPid));
    // Build winner avatar via the unified helper. Same priority order
    // everywhere: real PokerTH image > placeholder logo > emoji > 🤖 >
    // initial letter. (Aucun avatar en mode éliminé : on affiche la place.)
    const avChip = eliminated ? '' : _avatarChipHtml(winnerPid, winnerName, 'eg-winner-av');
    const winnerCls = 'eg-winner' + (isMyWin ? ' me' : '');
    const winnerLabel = eliminated ? ''
                      : (isMyWin ? t('endGameYouWon') : t('endGameWinner'));
    const winnerNameDisp = eliminated ? (place ? t('endGamePlace', { n: place }) : '')
                      : esc(winnerName);

    // Stats — reuse the _stats object that was already being maintained
    const s = _stats || { handsPlayed:0, handsWon:0, totalGain:0, bigWin:0, bigLoss:0, startMoney:0 };
    const wr = s.handsPlayed > 0 ? Math.round(s.handsWon / s.handsPlayed * 100) : 0;
    const _realStk = (seatData[myId] && seatData[myId].money != null) ? seatData[myId].money : null;
    const finalStack = (_realStk != null) ? _realStk : ((s.startMoney || 0) + (s.totalGain || 0));
    const gainCls = (s.totalGain > 0) ? 'pos' : (s.totalGain < 0) ? 'neg' : '';

    // Outcome icon: 🏆 trophy when the local player wins, otherwise a
    // fan of the four aces (♣ ♦ ♥ ♠) — far more on-theme for poker
    // than the old 🎲 dice. Inline SVG so it's crisp at any size and
    // identical across platforms (the dice/emoji rendered differently
    // per OS). The aces use a neutral, theme-driven card-border (currentColor).
    const ACES_SVG =
      '<svg viewBox="0 0 120 96" width="92" height="74" xmlns="http://www.w3.org/2000/svg" class="eg-aces" style="color:var(--gold-dim)" aria-hidden="true">' +
        '<defs><filter id="egAceSh" x="-20%" y="-20%" width="140%" height="140%">' +
          '<feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity="0.5"/>' +
        '</filter></defs>' +
        '<g filter="url(#egAceSh)">' +
          '<g transform="rotate(-26 60 74)">' +
            '<rect x="41" y="32" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
            '<text x="44.5" y="43" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#1a1a1a">A</text>' +
            '<text x="53.5" y="58" font-family="serif" font-size="14" fill="#1a1a1a" text-anchor="middle">\u2663</text>' +
          '</g>' +
          '<g transform="rotate(-9 60 74)">' +
            '<rect x="46" y="26" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
            '<text x="49.5" y="37" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#c0392b">A</text>' +
            '<text x="58.5" y="52" font-family="serif" font-size="14" fill="#c0392b" text-anchor="middle">\u2666</text>' +
          '</g>' +
          '<g transform="rotate(9 60 74)">' +
            '<rect x="49" y="26" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
            '<text x="52.5" y="37" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#c0392b">A</text>' +
            '<text x="58.5" y="52" font-family="serif" font-size="14" fill="#c0392b" text-anchor="middle">\u2665</text>' +
          '</g>' +
          '<g transform="rotate(26 60 74)">' +
            '<rect x="54" y="32" width="25" height="37" rx="3.4" fill="#fdfdf8" stroke="currentColor" stroke-width="1"/>' +
            '<text x="57.5" y="43" font-family="Georgia, serif" font-size="8.5" font-weight="bold" fill="#1a1a1a">A</text>' +
            '<text x="66.5" y="58" font-family="serif" font-size="14" fill="#1a1a1a" text-anchor="middle">\u2660</text>' +
          '</g>' +
        '</g>' +
      '</svg>';
    const trophy = isMyWin ? '🏆' : ACES_SVG;
    const titleKey = eliminated ? 'endGameTitleEliminated' : (isMyWin ? 'endGameTitleWin' : 'endGameTitleEnd');

    el.innerHTML =
      '<div class="endgame-card" onclick="event.stopPropagation()">' +
        '<div class="eg-trophy">' + trophy + '</div>' +
        '<div class="eg-title">' + t(titleKey) + '</div>' +
        '<div class="' + winnerCls + '">' +
          avChip +
          '<div>' +
            '<div class="eg-winner-label">' + winnerLabel + '</div>' +
            '<div class="eg-winner-name">' + winnerNameDisp + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="eg-stats-section">' +
          '<div class="eg-stats-title">📊 ' + t('endGameYourStats') + '</div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameHandsPlayed') + '</span><span class="eg-stat-val">' + s.handsPlayed + '</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameHandsWon') + '</span><span class="eg-stat-val pos">' + s.handsWon + ' (' + wr + '%)</span></div>' +
          '<hr class="eg-stat-divider">' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameFinalStack') + '</span><span class="eg-stat-val">' + _groupThousands(finalStack) + ' ¥</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameNetGain') + '</span><span class="eg-stat-val ' + gainCls + '">' + (s.totalGain > 0 ? '+' : '') + _groupThousands(s.totalGain) + ' ¥</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameBestWin') + '</span><span class="eg-stat-val pos">+' + _groupThousands(s.bigWin) + ' ¥</span></div>' +
          '<div class="eg-stat-row"><span class="eg-stat-label">' + t('endGameWorstLoss') + '</span><span class="eg-stat-val neg">' + _groupThousands(s.bigLoss) + ' ¥</span></div>' +
        '</div>' +
        '<div class="eg-actions">' +
          (window._offlineMode ? '<button class="eg-btn primary" onclick="App.offlineReplay()">' + t('endGameReplay') + '</button>' : '') +
          '<button class="eg-btn" onclick="App.endGameClose()">' + t('endGameClose') + '</button>' +
          '<button class="eg-btn' + (window._offlineMode ? '' : ' primary') + '" onclick="App.endGameLeave()">' + t('endGameBackToLobby') + '</button>' +
        '</div>' +
      '</div>';
    el.style.display = '';

    // Audio cue: winner fanfare for the local player, neutral chime otherwise
    if (typeof notifyWinner === 'function') {
      setTimeout(function(){ notifyWinner(isMyWin); }, 200);
    }
  }

  function updateBottomLayout() {
    _updatePinBtn();
    var pb = document.querySelector('.player-bar');
    var mz = document.querySelector('.my-zone');
    var ga = document.querySelector('.game-area');
    if (pb && mz) {
      var _masked = document.body.classList.contains('adv-hide-pbar');
      // Player-bar masquee : elle est display:none (offsetHeight=0 -> le fallback
      // 52 ferait flotter la barre d'action). On la colle a bottom:0 et on reserve
      // SA hauteur sous les sieges pour que la self-box reste visible (pas de
      // chevauchement avec la barre d'action epinglee).
      var pbH = _masked ? 0 : (pb.offsetHeight || 52);
      mz.style.bottom = pbH + 'px';
      // En paysage, le bas d'ecran est en FLUX (gere par le CSS) : aucune
      // reserve a poser ici. Ailleurs (barres position:fixed), le CSS (clamp)
      // gere la reserve sous les barres. On nettoie toute reserve inline
      // eventuellement posee par une version precedente.
      if (ga) {
        if (_masked) ga.style.paddingBottom = (mz.offsetHeight || 0) + 'px';
        else ga.style.removeProperty('padding-bottom');
      }
    }
  }

  // Track action history
  // Le journal stocke des FONCTIONS de rendu (thunks), pas des chaînes figées :
  // chaque entrée est rejouée à chaque rendu, donc les appels à t() reflètent
  // la langue active. renderLog() est exposé en window._retranslateLog et
  // rappelé par _retranslateSysChat() (lui-même appelé par setLang) → le journal
  // se re-traduit instantanément au changement de langue. Une chaîne passée
  // directement (lignes sans terme traduisible) est simplement figée.
  const actionLog = [];
  function logAction(entry) {
    var fn = (typeof entry === 'function') ? entry : function(){ return entry; };
    actionLog.push(fn);
    if (actionLog.length > 500) actionLog.shift();
    renderLog();
  }
  function renderLog() {
    const el = document.getElementById('g-log-body');
    if (!el) return;
    el.innerHTML = actionLog.slice().reverse().map(function(fn){
      var s; try { s = fn(); } catch (_e) { s = ''; }
      return '<div class="log-line">'+esc(s)+'</div>';
    }).join('');
  }
  window._retranslateLog = renderLog;
  // Texte brut du journal (ordre chronologique) pour l'export.
  function _buildLogText() {
    return actionLog.map(function(fn){ var s; try { s = fn(); } catch (_e) { s = ''; } return s; }).join('\n');
  }
  window._buildLogText = _buildLogText;
  // Joueurs déjà signalés comme éliminés (stack à 0) — évite de re-logguer à
  // chaque main suivante tant qu'ils n'ont pas quitté la table. Vidé au début
  // de chaque nouvelle partie (StartEvent).
  const _eliminatedLogged = new Set();
  function logEliminations() {
    for (var _i = 0; _i < seats.length; _i++) {
      var _ep = seats[_i];
      var _sd = seatData[_ep];
      if (_sd && !_sd.gone && _sd.money === 0 && !_eliminatedLogged.has(_ep)) {
        _eliminatedLogged.add(_ep);
        const _ce = _ep;
        logAction(function(){ return '\u2620 ' + t('logEliminated', { name: getPlayerName(_ce) }); });
      }
    }
  }
  function setPct(v) {
    const el = document.getElementById('raise-amt');
    if (!el) return;
    el.value = v;
    if (window.innerWidth < 640) {
      // Mobile : synchroniser slider + display, l'utilisateur valide avec le bouton Raise
      var slider  = document.getElementById('raise-slider');
      var display = document.getElementById('raise-display');
      if (slider)  slider.value       = v;
      if (display) display.textContent = v;
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
      try { new Notification(msg, { body: sub, icon: '/favicon.ico', tag: 'pokerth-turn', silent: false, vibrate: _hapticEnabled ? [90, 50, 90] : [] }); } catch(e) {}
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
    window._badgeTurn = false;
    if (window.refreshAppBadge) window.refreshAppBadge();
  }

  window._renderSeats = function() { if (seats.length) renderSeats(); };
  // Repeindre la pastille "N joueur(s)" du header lobby dans la langue
  // courante. Posée imperativement à la réception des messages serveur
  // (PlayerList / Statistics), elle n'a pas de data-i18n et restait donc
  // figée dans la langue précédente lors d'un changement de langue.
  // Appelée par setLang() (i18n.mjs).
  window._refreshPlayersPill = function() {
    try {
      var el = document.getElementById('h-players');
      if (el && el.textContent !== '—') {
        el.textContent = _lobbyPlayerCount + ' ' + t('playersOnline');
      }
    } catch (e) {}
  };
  // Retraduire les panneaux/popups OUVERTS dont le contenu est posé
  // impérativement (donc sans data-i18n, invisibles pour setLang). Si l'un
  // d'eux est affiché au moment d'un changement de langue, son texte resterait
  // figé dans la langue précédente jusqu'à fermeture/réouverture. Appelé par
  // setLang() (i18n.mjs). Chaque bloc est gardé : on ne re-rend que si ouvert.
  window._refreshOpenPanels = function() {
    // Panneau statistiques de session
    try { if (_statsOpen && typeof renderStats === 'function') renderStats(); } catch (e) {}
    // Liste des joueurs en ligne (lobby)
    try {
      var pp = document.getElementById('players-panel');
      if (pp && pp.style.display !== 'none' && typeof renderPlayersList === 'function') renderPlayersList();
    } catch (e) {}
    // Détails de la partie
    try {
      var gim = document.getElementById('game-info-modal');
      if (gim && gim.style.display !== 'none' && typeof openGameInfoPopup === 'function') openGameInfoPopup();
    } catch (e) {}
    // Profil / avatar
    try {
      var pim = document.getElementById('player-info-modal');
      if (pim && pim.style.display !== 'none' && typeof openPlayerInfoPopup === 'function') openPlayerInfoPopup(_pimPid);
    } catch (e) {}
  };
  window.renderGames = renderGames;
  window.toggleStats  = toggleStats;
  window._toggleStats = toggleStats;
  window._broadcastMyAvatar = function(emoji) {
    _myAvatarCache = (emoji && emoji !== '__img__' && emoji !== '__pth__') ? emoji : '';
    if (ws && ws.readyState === WebSocket.OPEN && !directWS && myId) {
      if (emoji === '__img__') {
        // Diffuser l'image perso (data URL) aux autres clients du proxy.
        var img = ''; try { img = localStorage.getItem('pth_avatar_img') || ''; } catch(e) {}
        if (img) ws.send('AVATARIMG:' + myId + ':' + img);
      } else {
        // Emoji / initiale : diffuser l'emoji ET purger toute image perso
        // précédemment diffusée chez les autres (sinon elle resterait affichée).
        ws.send('AVATAR:' + myId + ':' + (_myAvatarToBroadcast()));
        ws.send('AVATARIMG:' + myId + ':');
      }
    }
    // Lobby pill is now an avatar+name combo (clickable, opens the
    // player-info modal). Refresh it so the user sees their pick
    // immediately, both when picking from the connect screen popup
    // AND when picking from the in-lobby popup.
    try { if (typeof updateLobbyPill === 'function') updateLobbyPill(); } catch(e) {}
  };
  // Re-diffusion de l'avatar (appelée au début de chaque main et à l'entrée
  // en partie, pour les joueurs qui viennent d'arriver). Respecte le choix
  // image / emoji / initiale courant.
  function _rebroadcastAvatar() {
    try {
      if (!(ws && ws.readyState === WebSocket.OPEN && !directWS && myId)) return;
      var choice = ''; try { choice = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
      if (choice === '__img__') {
        var img = ''; try { img = localStorage.getItem('pth_avatar_img') || ''; } catch(e) {}
        if (img) ws.send('AVATARIMG:' + myId + ':' + img);
      } else {
        ws.send('AVATAR:' + myId + ':' + _myAvatarToBroadcast());
      }
    } catch(e) {}
  }
  window._rebroadcastAvatar = _rebroadcastAvatar;

  // ── Assistance (aide « force de la main ») : entrée du menu •••  ──
  // Met à jour l'indicateur d'état du menu et affiche/masque l'aide.
  function _applyAssistUI() {
    var st = document.getElementById('assist-state-mob');
    if (st) {
      st.textContent = _assistOn ? '\u2713' : '';
      st.style.color = 'var(--green)';
    }
    var hs = document.getElementById('hand-strength');
    if (!_assistOn) {
      if (hs) _hsHide(hs);
    } else {
      // Réafficher l'aide adaptée à la phase courante.
      var nComm = (commCards || []).filter(function(c){ return c != null; }).length;
      if (nComm > 0) renderHandStrength(); else renderPreFlopStrength();
    }
  }
  window._applyAssistUI = _applyAssistUI;
  window.toggleAssist = function() {
    _assistOn = !_assistOn;
    try { localStorage.setItem('pth_assist', _assistOn ? '1' : '0'); } catch(e) {}
    _applyAssistUI();
    if (typeof showKeyHint === 'function') showKeyHint(t('assist') + (_assistOn ? ' \u2713' : ''));
  };
  // Variante setter (pour la case a cocher des options avancees) : pose l'etat
  // exact au lieu de basculer, puis rafraichit la fenetre d'assistance.
  window.setAssist = function(on) {
    _assistOn = !!on;
    try { localStorage.setItem('pth_assist', _assistOn ? '1' : '0'); } catch(e) {}
    _applyAssistUI();
  };

  // Moniteur d'odds (option pth_odds_monitor) : panneau compact listant la
  // probabilité d'obtenir chaque catégorie de main au showdown. Calcul découpé
  // (voir _oddsCompute) et abandonné si une street plus récente survient. Les
  // anciennes valeurs restent affichées pendant le recalcul (pas de clignotement).
  // Rend le moniteur d'odds déplaçable sur tous les appareils (souris + tactile +
  // stylet) via la Pointer Events API. Position mémorisée (pth_odds_pos) et bornée à
  // l'écran. Attaché à #odds-monitor lui-même -> survit aux reconstructions d'innerHTML.
  function _attachPanelDrag(el, posKey, dragClass) {
    var drag = null;
    var BASE_W = (el.id === 'odds-monitor') ? 132 : 150;
    var SZKEY = posKey.replace('_pos', '_w');
    function _canResize() { try { return window.matchMedia('(min-width:561px)').matches; } catch (e) { return false; } }
    function applyWs() {
      if (!_canResize()) { el.style.removeProperty('--ws'); el.style.removeProperty('width'); return; }
      var w = el.offsetWidth || BASE_W;
      el.style.setProperty('--ws', (w / BASE_W).toFixed(3));
    }
    function clampPos(left, top) {
      var w = el.offsetWidth || 132, h = el.offsetHeight || 60;
      var maxL = Math.max(0, window.innerWidth - w), maxT = Math.max(0, window.innerHeight - h);
      return [Math.max(0, Math.min(left, maxL)), Math.max(0, Math.min(top, maxT))];
    }
    function applyPos(left, top) {
      var c = clampPos(left, top);
      el.style.left = c[0] + 'px'; el.style.top = c[1] + 'px';
      el.style.right = 'auto'; el.style.bottom = 'auto';
    }
    try { var s = localStorage.getItem(posKey); if (s) { var o = JSON.parse(s); if (o && typeof o.left === 'number') applyPos(o.left, o.top); } } catch (e) {}
    // Redimensionnement (desktop) : restaurer la largeur sauvee + ancrer a gauche
    // (left/top) pour que resize:horizontal fonctionne meme si l'ancrage CSS etait a droite.
    if (_canResize()) {
      try { var sw0 = localStorage.getItem(SZKEY); if (sw0) { var wv = parseInt(sw0, 10); if (wv > 0) el.style.width = wv + 'px'; } } catch (e) {}
      if (!el.style.left) { var rr = el.getBoundingClientRect(); el.style.left = Math.round(rr.left) + 'px'; el.style.top = Math.round(rr.top) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; }
    }
    applyWs();
    if (typeof ResizeObserver === 'function') {
      var _rt = null;
      var _ro = new ResizeObserver(function () {
        applyWs();
        if (_canResize()) { clearTimeout(_rt); _rt = setTimeout(function () { try { localStorage.setItem(SZKEY, String(Math.round(el.offsetWidth))); } catch (e) {} }, 250); }
      });
      try { _ro.observe(el); } catch (e) {}
    }
    el.addEventListener('pointerdown', function (e) {
      if (e.target && e.target.closest && e.target.closest('.win-x')) return;
      var r = el.getBoundingClientRect();
      if (_canResize() && (r.right - e.clientX) <= 18 && (r.bottom - e.clientY) <= 18) return;
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      el.classList.add(dragClass); e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return; e.preventDefault();
      applyPos(e.clientX - drag.dx, e.clientY - drag.dy);
    });
    function end(e) {
      if (!drag) return; drag = null; el.classList.remove(dragClass);
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      try { var r = el.getBoundingClientRect(); localStorage.setItem(posKey, JSON.stringify({ left: Math.round(r.left), top: Math.round(r.top) })); } catch (_) {}
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    window.addEventListener('resize', function () { applyWs(); var r = el.getBoundingClientRect(); applyPos(r.left, r.top); });
  }

  function renderOddsMonitor() {
    var el = document.getElementById('odds-monitor');
    if (!el) return;
    var on = false; try { on = (localStorage.getItem('pth_odds_monitor') === '1'); } catch (e) {}
    if (!on || myCards[0] == null || myCards[1] == null) { el.style.display = 'none'; el.innerHTML = ''; el._built = false; return; }
    el.style.display = '';
    if (!el._drag) { _attachPanelDrag(el, 'pth_odds_pos', 'odds-drag'); el._drag = true; }
    if (!el._built) { el.innerHTML = '<button class="win-x" type="button" onclick="closeOddsWin()" title="' + esc(t('closeTooltip')) + '" aria-label="X">\u2715</button>' + '<div class="odds-hd">' + esc(t('oddsTitle')) + '</div><div class="odds-body odds-wait">…</div>'; el._built = true; }
    var seq = ++_oddsSeq;
    var hole = [myCards[0], myCards[1]];
    var board = commCards.slice();
    _oddsCompute(hole, board, function (r) {
      if (seq !== _oddsSeq) return;
      if (!r) { el.style.display = 'none'; el.innerHTML = ''; el._built = false; return; }
      var CATS = [
        [9, t('oddsRoyal')], [8, t('oddsSF')], [7, t('oddsQuads')], [6, t('oddsFull')],
        [5, t('oddsFlush')], [4, t('oddsStraight')], [3, t('oddsTrips')], [2, t('oddsTwoPair')],
        [1, t('oddsPair')], [0, t('oddsHigh')]
      ];
      var rows = '';
      for (var i = 0; i < CATS.length; i++) {
        var ri = CATS[i][0], p = r.pct[ri] * 100, pw = Math.max(0, Math.min(100, p));
        var ptxt = p >= 0.5 ? Math.round(p) + '%' : (p > 0 ? '<1%' : '0%');
        var cls = pw >= 50 ? ' hot' : (pw >= 15 ? ' warm' : '');
        rows += '<div class="odds-row' + cls + '"><span class="odds-cat">' + esc(CATS[i][1])
          + '</span><span class="odds-bar"><i style="width:' + pw.toFixed(1) + '%"></i></span>'
          + '<span class="odds-pct">' + ptxt + '</span></div>';
      }
      el.innerHTML = '<button class="win-x" type="button" onclick="closeOddsWin()" title="' + esc(t('closeTooltip')) + '" aria-label="X">\u2715</button>' + '<div class="odds-hd">' + esc(t('oddsTitle')) + (r.exact ? '' : ' <span class="odds-approx">≈</span>')
        + '</div><div class="odds-body">' + rows + '</div>';
      el._built = true;
    }, function () { return seq !== _oddsSeq; });
  }
  window._renderOdds = renderOddsMonitor;

  function renderMyTurnActions(preview) {
    // iOS/Android : ne pas detruire #mode-sel pendant que l'utilisateur le
    // manipule (le picker natif se fermerait). On differe le rafraichissement
    // de l'apercu hors-tour jusqu'a la fin de l'interaction (voir _modeSelHold).
    if (preview && _modeSelBusy && document.getElementById('mode-sel')) {
      _modeSelPendingPreview = true;
      return;
    }
    // Defensive: never render action buttons in spectator mode. The
    // server normally won't send PlayersTurn to spectators, but we
    // guard against it anyway so a stray message can't accidentally
    // give the user an action UI they shouldn't have.
    if (_amSpectator) {
      renderGameWaiting(
        '<div class="spectator-message">' +
          '<span class="sm-icon">👁</span>' +
          t('spectatorActionMsg') +
        '</div>',
        true
      );
      return;
    }
    const myMoney = (seatData[myId] || {}).money || 0;
    const myBet   = (seatData[myId] || {}).bet || 0;
    const toCall  = Math.max(0, highestBet - myBet);
    const canCheck = toCall === 0;
    // ── Anti-Call accidentel : grosse relance ? ──
    // Vrai si "à suivre" a au moins DOUBLÉ et bondi de >= 2 BB depuis ma dernière
    // décision sur CETTE street (suivi remis à zéro par street via le nombre de
    // cartes du board). Si vrai, le clic Call passera par App.confirmCall (2e tap).
    var _bigRaise = false;
    if (!preview) {
      var _gc = false; try { _gc = (localStorage.getItem('pth_guard_call') === '1'); } catch (e) {}
      var _ncomm = (commCards || []).filter(function (c) { return c != null; }).length;
      if (_ncomm !== _lastBoardCount) { _lastCallSeen = -1; _lastBoardCount = _ncomm; }
      if (_gc && !canCheck && toCall > 0) {
        var _bb = Math.max(1, smallBlind * 2);
        var _base = (_lastCallSeen >= 0) ? _lastCallSeen : _bb;
        if (toCall >= 2 * _base && (toCall - _base) >= 2 * _bb) _bigRaise = true;
      }
      _lastCallSeen = toCall;
      _callConfirmArmed = false; // panneau frais : aucune confirmation en attente
    }
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
    // Si toCall >= myMoney, le call consommerait tout le stack — c'est
    // un all-in implicite. On route vers action=6 (All-in) au lieu de
    // action=3 (Call), sinon le serveur rejette (montant > stack).
    // Le label affiche le montant disponible avec un indicateur "(All-In)".
    let callLabel, callAction, callClass;
    if (canCheck) {
      callLabel  = t('check');
      callAction = 'App.doAction(2,0)';
      callClass  = 'btn-check';
    } else if (toCall >= myMoney) {
      callLabel  = t('call') + ' <b>' + fmtChips(myMoney) + '</b> <span style="font-size:0.75em;opacity:0.85">(' + t('allin') + ')</span>';
      callAction = 'App.doAction(6,' + myMoney + ')';
      callClass  = 'btn-call';
    } else {
      callLabel  = t('call') + ' <b>' + fmtChips(toCall) + '</b>' + potOdds;
      callAction = 'App.doAction(3,' + toCall + ')';
      callClass  = 'btn-call';
    }
    // Anti-Call accidentel : si grosse relance + option active, exiger un 2e tap.
    if (_bigRaise && callClass === 'btn-call') {
      var _ca   = (toCall >= myMoney) ? 6 : 3;
      var _camt = (toCall >= myMoney) ? myMoney : toCall;
      callAction = 'App.confirmCall(' + _ca + ',' + _camt + ')';
    }
    const raiseLabel = highestBet > 0 ? t('raise') : t('bet');

    // Peut relancer : doit avoir plus que le montant du call ET >= mise min
    const canRaise = myMoney > toCall && myMoney >= minBet;
    const da = canRaise ? '' : ' disabled'; // disabled attribute
    const allInOnly = myMoney <= toCall;    // ne peut que call ou all-in

    var KB = _keyBindings(); // touches liées (badges des boutons)
    const betRowHtml = '<div class="bet-row">'
      + '<input class="raise-amt-field" id="raise-amt" type="number" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '"' + da
      + ' oninput="var s=document.getElementById(\'raise-slider\');if(s)s.value=this.value">'
      + '<input class="raise-slider" id="raise-slider" type="range" min="' + minBet + '" max="' + myMoney + '" value="' + minBet + '" step="1"' + da
      + ' oninput="var a=document.getElementById(\'raise-amt\');if(a)a.value=this.value">'
      + '</div>';

    // Sélecteur de mode PERSISTANT (remplace l'ancien bouton AUTO, même emplacement) :
    // Manuel / Auto Check-Call / Auto Check-Fold. Piloté par App.setPlayingMode.
    const modeSel = '<div class="sel-wrap mode-sel-wrap">'
      + '<select id="mode-sel" autocomplete="off" onfocus="App._modeSelHold(true)" onblur="App._modeSelHold(false)" onchange="App.setPlayingMode(this.selectedIndex)">'
      +   '<option' + (_playingMode === 0 ? ' selected' : '') + '>' + t('modeManual') + '</option>'
      +   '<option' + (_playingMode === 1 ? ' selected' : '') + '>' + t('modeAutoCheckCall') + '</option>'
      +   '<option' + (_playingMode === 2 ? ' selected' : '') + '>' + t('modeAutoCheckFold') + '</option>'
      + '</select><span class="sel-arr">▾</span></div>';

    const h = '<div class="action-grid">'
      + betRowHtml
      + '<div class="mid-row">'
      +   '<div class="pct-row">'
      +     '<button class="btn-pct"' + da + ' onclick="setPct(' + p33  + ')"><span class="pct-p">1/3</span><span class="pct-amt">' + fmtChips(p33) + '</span><span class="act-key">' + KB.bet1.toUpperCase() + '</span></button>'
      +     '<button class="btn-pct"' + da + ' onclick="setPct(' + p50  + ')"><span class="pct-p">1/2</span><span class="pct-amt">' + fmtChips(p50) + '</span><span class="act-key">' + KB.bet2.toUpperCase() + '</span></button>'
      +     '<button class="btn-pct"' + da + ' onclick="setPct(' + p100 + ')"><span class="pct-p">Pot</span><span class="pct-amt">' + fmtChips(p100) + '</span><span class="act-key">' + KB.bet3.toUpperCase() + '</span></button>'
      +   '</div>'
      +   '<button class="btn-action btn-allin" onclick="App.doAction(6,' + myMoney + ')" title="All-In (A)">' + t('allin') + ' <b>' + fmtChips(myMoney) + '</b><span class="act-key">' + KB.allin.toUpperCase() + '</span></button>'
      +   modeSel
      + '</div>'
      + '<div class="act-buttons-row">'
      +   '<button class="btn-action btn-fold" onclick="App.doAction(1,0)" title="Fold (F)">' + t('fold') + '<span class="act-key">' + KB.fold.toUpperCase() + '</span></button>'
      +   '<button class="btn-action ' + callClass + '" onclick="' + callAction + '" title="Call/Check (C)">' + callLabel + '<span class="act-key">' + KB.call.toUpperCase() + '</span></button>'
      +   '<button class="btn-action btn-raise raise-btn"' + da + ' onclick="App.doRaise()" title="Raise (R)">' + raiseLabel + '<span class="act-key">' + KB.raise.toUpperCase() + '</span></button>'
      + '</div>'
      + '</div>';

    if (preview) {
      // Aperçu hors-tour : EXACTEMENT le même panneau, mais non interactif
      // (la classe .actions-preview coupe pointer-events sauf sur AUTO).
      // Aucun son, aucune vibration, aucun keepalive serveur.
      // Mode masqué (player-bar cachée) : le narrateur de tour ("X ●●●"),
      // normalement affiché À LA PLACE de l'aperçu, est ré-injecté AU-DESSUS
      // des boutons pour conserver l'info "à qui le tour".
      var _narr = '';
      if (_advGet('hide_pbar', true) && turnPid && turnPid !== myId && seatData[turnPid]) {
        _narr = '<div class="act-narrator"><span style="font-family:inherit">'
              + esc(getPlayerName(turnPid)) + '</span>'
              + '<span class="thinking-dots"><span></span><span></span><span></span></span></div>';
      }
      $('g-actions').innerHTML = _narr +
        '<div class="actions-preview" data-cap="' + esc(t('preActionTitle')) + '">' + h + '</div>';
      updateBottomLayout();
      return;
    }
    $('g-actions').innerHTML = h;
    updateBottomLayout(); // paysage : recalcule la reserve sous la table apres le rendu live
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
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      $('g-actions').innerHTML = '<div class="waiting-msg" style="color:#e74c3c">⚠ '
        + t('wsLostAction')
        + '</div>';
      logAction(function(){ return '⚠ ' + t('wsSendFailed'); });
      return;
    }
    setMyTurnActive(false);
    send(MSG.buildMyAction(gId, handNum, gameState, action, bet));
    $('g-actions').innerHTML = '<div class="waiting-msg">' + t('actionSent') + '</div>';
    stopTurnTimer();
  }
  // Anti-Call accidentel : 1er tap arme la confirmation (le bouton Call devient
  // ambre « Confirm $X ? »), un 2e tap dans les 3 s valide l'action. Au-delà, ou
  // sur un nouveau panneau, l'armement retombe (cf. reset dans renderMyTurnActions).
  function confirmCall(action, amount) {
    var btn = document.querySelector('#g-actions .btn-action.btn-call');
    if (!_callConfirmArmed) {
      _callConfirmArmed = true;
      if (btn) {
        if (btn._origCall == null) btn._origCall = btn.innerHTML;
        btn.classList.add('confirm-call');
        btn.innerHTML = t('confirmCall') + ' <b>' + fmtChips(amount) + '</b> ?<span class="act-key">' + KB.call.toUpperCase() + '</span>';
      }
      try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {}
      if (_callConfirmTimer) clearTimeout(_callConfirmTimer);
      _callConfirmTimer = setTimeout(function () {
        _callConfirmArmed = false;
        var b = document.querySelector('#g-actions .btn-action.btn-call.confirm-call');
        if (b) { b.classList.remove('confirm-call'); if (b._origCall != null) { b.innerHTML = b._origCall; b._origCall = null; } }
      }, 3000);
      return;
    }
    _callConfirmArmed = false;
    if (_callConfirmTimer) { clearTimeout(_callConfirmTimer); _callConfirmTimer = null; }
    doAction(action, amount);
  }
  function doRaise() {
    // Validation préventive du montant avant envoi : sans ce clamp, un
    // input édité hors-bornes (valeur < minBet, > stack, vide ou non
    // numérique) provoquait un rejet serveur YourActionRejected. Les
    // attributs HTML min/max ne sont qu'indicatifs et ne bloquent pas
    // la soumission programmatique.
    const myMoney = (seatData[myId] || {}).money || 0;
    const myBet   = (seatData[myId] || {}).bet   || 0;
    const minBet  = minRaise > 0
      ? minRaise
      : Math.max(highestBet > 0 ? highestBet : smallBlind * 2, smallBlind * 2);
    let amt = parseInt((document.getElementById('raise-amt')||{}).value, 10);
    if (!Number.isFinite(amt) || amt <= 0) amt = minBet;
    // Clamp dans [minBet, myMoney]. Si le résultat atteint le stack,
    // on bascule explicitement en All-in (action=6) — sémantiquement
    // plus juste et évite tout doute sur l'interprétation serveur.
    amt = Math.max(minBet, Math.min(amt, myMoney));
    if (amt >= myMoney) {
      doAction(6, myMoney);
    } else {
      doAction(highestBet > 0 ? 5 : 4, amt);
    }
  }

  // ── Snapshot de fin de main ──
// Capture, au moment où la main se termine (EndOfHandShow / EndOfHandHide),
// le stack final et le net EXACT de chaque joueur AVANT que la main suivante
// ne réinitialise seatData/_seatStackAtHandStart. Sans ça, l'overlay (souvent
// rendu après le démarrage de la donne suivante) afficherait des montants
// faussés. On garde les joueurs couchés ; on marque hors-jeu les éliminés.
function _snapshotHandResults() {
  var snap = {};
  var pids = seats.length ? seats.slice() : Object.keys(seatData).map(Number);
  pids.forEach(function(pid) {
    var sd    = seatData[pid] || {};
    var start = _seatStackAtHandStart[pid];
    var net   = (start != null && sd.money != null) ? (sd.money - start) : null;
    // "Dans cette main" = avait des jetons au début de CE coup (start > 0),
    // donc a bel et bien été distribué. Conséquences voulues :
    //  • éliminé une main PRÉCÉDENTE → start = 0 → exclu ;
    //  • busté PENDANT la main (all-in perdu) → start > 0 → conservé, avec sa
    //    perte nette affichée ;
    //  • couché (fold) → start > 0 → conservé.
    var inHand = (start != null) && (start > 0);
    snap[pid] = {
      money:  sd.money,
      net:    net,
      card1:  sd.card1,
      card2:  sd.card2,
      folded: !!sd.folded,
      inHand: inHand
    };
  });
  _handResultSnapshot = snap;
}

  // ── Winner overlay ──
function showWinnerOverlay(winners) {
  var ov = document.getElementById('g-winner-overlay');
  if (!ov || !winners || winners.length === 0) return;

  var mainWinner = winners[0];
  var isMyWin = winners.some(function(w){ return w.pid === myId; });
  // Big-win sound trigger: when *I* win, decide between a regular winner
  // chirp and the full confetti-pop. Threshold is intentionally generous
  // (>= 30 × small blind) so the fanfare doesn't fire on every micro pot
  // but does on anything meaningful. Falls back to plain notifyWinner if
  // notifyBigWin isn't loaded for any reason (defensive against old SW
  // caches serving an older sounds.mjs).
  var _totalWon = winners.reduce(function(s,w){ return s + (w.won||0); }, 0);
  var BIG_WIN_THRESHOLD = Math.max(300, smallBlind * 30);
  if (isMyWin && _totalWon >= BIG_WIN_THRESHOLD && typeof notifyBigWin === 'function') {
    notifyBigWin();
  } else if (typeof notifyWinner === 'function') {
    notifyWinner(isMyWin);
  }
  var trophy = isMyWin ? "🎉" : "🏆";

  // Snapshot figé à la fin de la main (montants + qui était réellement engagé).
  var snap = _handResultSnapshot || {};
  var winnerPidsEarly = winners.map(function(w){ return w.pid; });
  // Joueurs encore EN JEU dans cette main (couchés inclus, éliminés exclus).
  var _playersInHand = Object.keys(snap).filter(function(k){
    return (snap[k] && snap[k].inHand) || winnerPidsEarly.indexOf(Number(k)) >= 0;
  }).length;
  if (!_playersInHand) _playersInHand = seats.length; // garde-fou si snapshot vide

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
  html += '<div class="wc-gain">+' + _groupThousands(totalWon) + ' ¥</div>';
  html += '</div>';

  // ── Stats ──
  html += '<div class="wc-stats">';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('handOf') + '</div><div class="wc-stat-value">' + handNum + '</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('totalPot') + '</div><div class="wc-stat-value">' + _groupThousands(totalWon) + ' ¥</div></div>';
  html += '<div class="wc-stat"><div class="wc-stat-label">' + t('players') + '</div><div class="wc-stat-value">' + _playersInHand + '</div></div>';
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

  // ── Combinaison gagnante ──
  if (comm.length >= 3) {
    // Chercher la meilleure main parmi les gagnants (cartes connues)
    var bestHandLabel = '';
    for (var _wi = 0; _wi < winners.length && !bestHandLabel; _wi++) {
      var _wpid = winners[_wi].pid;
      var _wsd  = seatData[_wpid] || {};
      var _hc1  = (_wpid === myId) ? myCards[0] : _wsd.card1;
      var _hc2  = (_wpid === myId) ? myCards[1] : _wsd.card2;
      if (_hc1 != null && _hc2 != null) {
        var _holeNorm = [_hc1, _hc2].map(normalizeHoleCard).filter(function(c){ return c != null; });
        if (_holeNorm.length === 2) {
          var _res = evaluateBestHand(_holeNorm, comm);
          if (_res) bestHandLabel = _res.label;
        }
      }
    }
    if (bestHandLabel) {
      html += '<div class="wc-best-hand">' + bestHandLabel + '</div>';
    }
  }

  // ── Players results ──
  html += '<div class="wc-section">' + t('results') + '</div>';
  html += '<div class="wc-players">';

  // Sort: winners first, then by money desc
  // CRITICAL: .slice() to clone seats — otherwise allPids.sort() below
  // mutates the global seats array IN PLACE (since assignment shares the
  // reference), rotating every player's visual position around the table
  // after each showdown. The bug looked like 'seats randomly reordered
  // every few hands' and was masked by _seatsFrozen which only guarded
  // against GameStartInitial rewrites, not external mutations.
  var allPids = seats.length ? seats.slice() : Object.keys(seatData).map(Number);
  var winnerPids = winners.map(function(w){ return w.pid; });
  function _snapMoney(pid){ var s = snap[pid]; return (s && s.money != null) ? s.money : ((seatData[pid]||{}).money||0); }
  allPids.sort(function(a,b){
    var aW = winnerPids.indexOf(a) >= 0 ? 1 : 0;
    var bW = winnerPids.indexOf(b) >= 0 ? 1 : 0;
    if (aW !== bW) return bW - aW;
    return _snapMoney(b) - _snapMoney(a);
  });

  allPids.forEach(function(pid) {
    var sd    = seatData[pid] || {};
    var snp   = snap[pid] || null;
    var isW   = winnerPids.indexOf(pid) >= 0;
    var isMe  = pid === myId;
    // Ne lister que les joueurs réellement engagés dans CETTE main : on garde
    // les couchés (fold), mais on retire les joueurs éliminés/sortis lors d'une
    // main précédente (ils n'ont pas participé). Le(s) gagnant(s) restent
    // toujours, par sécurité.
    var _inHand = snp ? snp.inHand : ((_seatStackAtHandStart[pid] || 0) > 0);
    if (!isW && !_inHand) return;

    var name  = getPlayerName(pid);
    var wObj  = winners.find(function(w){ return w.pid === pid; });
    // Montants figés à la fin de la main (snapshot) pour éviter que le
    // démarrage de la main suivante ne fausse stack/net affichés.
    var _money = (snp && snp.money != null) ? snp.money : sd.money;
    var _net;
    if (snp) {
      _net = snp.net;
    } else {
      var _startStk = _seatStackAtHandStart[pid];
      _net = (_startStk != null && sd.money != null) ? (sd.money - _startStk) : null;
    }
    var _c1 = (snp && snp.card1 != null) ? snp.card1 : sd.card1;
    var _c2 = (snp && snp.card2 != null) ? snp.card2 : sd.card2;
    var deltaClass, deltaTxt;
    if (isW) {
      // Gagnant : on affiche le pot ramassé (cohérent avec l'en-tête).
      deltaClass = "pos";
      deltaTxt = "+" + _groupThousands(wObj ? wObj.won : 0) + " ¥";
    } else if (_net != null && _net < 0) {
      // Perdant : perte nette de la main, en rouge.
      deltaClass = "neg";
      deltaTxt = _groupThousands(_net) + " ¥";
    } else if (_net != null && _net > 0) {
      // Gain net positif sans être « le » gagnant (split pot / side pot).
      deltaClass = "pos";
      deltaTxt = "+" + _groupThousands(_net) + " ¥";
    } else {
      deltaClass = "";
      deltaTxt = "";
    }
    var rowClass = "wc-player-row" + (isW ? " wc-winner" : "") + (isMe ? " wc-me-row" : "");

    html += '<div class="' + rowClass + '">';
    html += _avatarChipHtml(pid, name, 'wc-player-av');
    html += '<div class="wc-player-info">';
    html += '<div class="wc-player-name">' + esc(name) + (isW ? " 🏆" : "") + (isMe ? " 👤" : "") + '</div>';
    html += '<div class="wc-player-stack">' + (_money != null ? _groupThousands(_money) + " ¥" : "—") + '</div>';
    html += '</div>';
    // Cartes : on rend TOUJOURS le conteneur (avec 2 cartes ou 2 dos en
    // placeholder), sinon la ligne n'aurait que 3 colonnes et la grille
    // décalerait les cartes des autres lignes.
    html += '<div class="wc-player-cards">';
    if (_c1 != null || _c2 != null) { // FIX: || test falsy ratait les cartes à valeur 0
      html += cardHtml(_c1 != null ? _c1 : null,"xsm",false) + cardHtml(_c2 != null ? _c2 : null,"xsm",false);
    } else if (isMe && myCards[0] != null) { // FIX: idem, valeur 0 = falsy
      html += cardHtml(myCards[0],"xsm",false) + cardHtml(myCards[1],"xsm",false);
    } else {
      // Joueur couché / cartes non révélées : 2 dos estompés, juste pour
      // réserver la largeur de la colonne et garder l'alignement.
      html += '<div class="pk xsm back placeholder"></div><div class="pk xsm back placeholder"></div>';
    }
    html += '</div>';
    html += '<div class="wc-player-delta ' + deltaClass + '">' + deltaTxt + '</div>';
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
      // Offline (training) mode has no network login. Keep the training hint
      // and skip BOTH the network-mode field wiring and the server-mode
      // reverse-sync at the tail (which would otherwise flip the dropdown back
      // to LAN and overwrite the hint with the 'private server' message — the
      // bug where offline showed 'Chat et réactions… serveur privé').
      if (window._offlineMode || ($('server-mode') && $('server-mode').value === 'offline')) {
        // Fully restore the training-mode UI here too, so this stays correct
        // no matter which function ran last: free-nick label, placeholder, and
        // the training hint (never the pokerth.net account label / auth hint).
        var _oln = $('nick-label'); if (_oln) _oln.textContent = t('enterNickFree');
        var _oni = $('nick'); if (_oni) { _oni.removeAttribute('readonly'); _oni.placeholder = t('nickPlaceholder'); }
        if (typeof _stopIpBlockCountdown === 'function') _stopIpBlockCountdown();
        setStatus(t('offlineHint'), '', 'offlineHint');
        var _offReg = document.getElementById('register-link-row'); if (_offReg) _offReg.style.display = 'none';
        try { if (window._setSrvSourceTag) window._setSrvSourceTag(false); } catch (e) {}
        return;
      }
      const mode = $('login-mode').value;
      $('f-pass').style.display = mode === 'auth' ? '' : 'none';
      // Lien d'inscription pokerth.net : visible uniquement en Internet/PokerTH.net
      // (modes internes guest/auth) — l'inscription n'a de sens que sur le serveur
      // officiel. Le libellé est déjà traduit par data-i18n (retraduit par setLang).
      var _regRow = document.getElementById('register-link-row');
      if (_regRow) _regRow.style.display = (mode === 'guest' || mode === 'auth') ? '' : 'none';
      // TLS is only ever meaningful when connecting to pokerth.net
      // (which mandates it). On LAN / private servers it's almost
      // always uncheck-and-forget, so we just hide the row there to
      // declutter the form. The setting itself stays in the DOM —
      // each branch below still sets $('use-tls').checked appropriately.
      var tlsRow = document.getElementById('tls-row');
      // TLS : option avancée dans TOUS les modes — visible uniquement quand la
      // roue crantée est ouverte. La case ($('use-tls').checked) garde la valeur
      // fixée par mode plus bas (TLS reste actif pour pokerth.net même masqué,
      // d'autant que guest/auth passent par une connexion wss directe).
      if (tlsRow) {
        var advBtn = document.getElementById('conn-adv-btn');
        tlsRow.style.display = (advBtn && advBtn.classList.contains('open')) ? '' : 'none';
      }

      // Champ mot de passe SERVEUR : seuls les serveurs auto-hébergés
      // (LAN / dédié privé) peuvent en exiger un. pokerth.net est le build
      // officiel et l'ignore, donc on masque le champ dans les modes
      // guest/auth. Il vit dans le bloc « roue crantée » (conn-advanced) :
      // doublement masqué tant que la roue n'est pas ouverte.
      var advWrap = document.getElementById('f-server-pass');
      if (advWrap) advWrap.style.display = (mode === 'lan' || mode === 'unauth') ? '' : 'none';
      // URL du proxy WebSocket : en mode pokerth.net (guest/auth) le pont est
      // toujours le meme (celui qui sert l'app), donc l'exposer prete a confusion.
      // Masque dans ces modes ; visible en LAN / dedie (ou l'on peut pointer vers
      // un autre pont). La valeur reste fixee par mode plus bas, connexion inchangee.
      var proxyWrap = document.getElementById('f-proxy');
      if (proxyWrap) proxyWrap.style.display = (mode === 'lan' || mode === 'unauth') ? '' : 'none';
      // Mot de passe UTILISATEUR (compte) : option avancée placée sous le login.
      // En mode LAN / dédié il suit l'état de la roue crantée (comme le TLS) ;
      // sinon caché. Seul le login (pseudo) reste toujours visible.
      var userWrap = document.getElementById('f-user-pass');
      if (userWrap) {
        if (mode === 'lan' || mode === 'unauth') {
          var advBtnU = document.getElementById('conn-adv-btn');
          userWrap.style.display = (advBtnU && advBtnU.classList.contains('open')) ? '' : 'none';
        } else {
          userWrap.style.display = 'none';
        }
      }
      // Roue crantee (options avancees) : visible seulement en LAN / dedie, ou
      // l'on peut devoir saisir un hote personnalise. En Internet/PokerTH.net,
      // l'hote/port/TLS sont geres automatiquement -> on cache la roue ET on
      // referme le bloc avance (rien d'editable n'est expose au joueur).
      var gearBtn = document.getElementById('conn-adv-btn');
      var advBlock = document.getElementById('conn-advanced');
      if (mode === 'lan' || mode === 'unauth') {
        if (gearBtn) gearBtn.style.display = '';
      } else {
        if (gearBtn) { gearBtn.style.display = 'none'; gearBtn.classList.remove('open'); gearBtn.setAttribute('aria-expanded', 'false'); }
        if (advBlock) advBlock.style.display = 'none';
      }

      const hostInput  = $('host');
      const proxyInput = $('proxy');
      const autoHost   = hostInput ? (hostInput.dataset.autoHost || window.location.hostname) : '';
      const proto      = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Match the page-load auto-fill: when served on a standard port (e.g.
      // 443 behind an HTTPS reverse proxy) window.location.port is EMPTY, so
      // fall back to the scheme default (443/80), NOT 8080. Falling back to
      // 8080 rebuilt wss://host:8080 on every mode change — a direct-TLS URL
      // to a plain-HTTP port — which failed until a refresh restored :443.
      const port       = window.location.port || (proto === 'wss:' ? '443' : '80');

      // Helper: read a string from localStorage with try/catch so private
      // browsing modes that disable storage don't crash the page.
      var lsGet = function(k) {
        try { return localStorage.getItem(k); } catch(e) { return null; }
      };

      // Nick field state machine. Per the user spec:
      //   LAN     → editable, prefilled from pth_lan_nick (per-mode key)
      //   unauth  → editable, prefilled from pth_unauth_nick (per-mode key)
      //   guest   → READONLY, always set to the persistent GuestXXXXX
      //   auth    → editable, prefilled from pth_auth_login (login only,
      //             never the password — browser keychain handles that)
      var nickEl = $('nick');
      // Always reset the readonly flag first; only Guest re-applies it.
      if (nickEl) nickEl.removeAttribute('readonly');

      if (mode === 'lan') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = t('nickPlaceholder');
        // Restore the per-mode saved pseudo (overrides whatever was
        // typed under another mode — same UX as switching profiles).
        if (nickEl) nickEl.value = lsGet('pth_lan_nick') || '';
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput && autoHost) hostInput.value = autoHost;
        if ($('port')) $('port').value = (lsGet('pth_lan_port') || '7234');
        setStatus(t('lanModeNote'), '', 'lanModeNote');
      } else if (mode === 'unauth') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = t('nickPlaceholder');
        if (nickEl) nickEl.value = lsGet('pth_unauth_nick') || '';
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput && autoHost) hostInput.value = autoHost;
        if ($('port')) $('port').value = (lsGet('pth_lan_port') || '7234');
        setStatus(t('chatAvailPrivate'), '', 'chatAvailPrivate');
      } else if (mode === 'guest') {
        $('nick-label').textContent = t('enterNickGuest');
        // Compute the stable GuestXXXXX name, put it in the field,
        // and lock it. The user CAN'T change a Guest nick — the
        // server-issued IDs are not user-controllable anyway.
        var guestName = (window.getOrCreateGuestName && window.getOrCreateGuestName())
                       || ('Guest' + String(Math.floor(10000 + Math.random()*90000)));
        if (nickEl) {
          nickEl.value = guestName;
          nickEl.setAttribute('readonly', 'readonly');
          nickEl.placeholder = guestName;
        }
        // Internet / PokerTH.net target: admin-selected server (from /app-config)
        // or the built-in pokerth.net:7234 default. Guest follows the server's
        // own TLS flag (set in the /app-config handler -> window._pthNetServer).
        var _ps = window._pthNetServer;
        $('use-tls').checked = _ps ? !!_ps.tls : false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput) hostInput.value = _ps ? _ps.host : 'pokerth.net';
        if ($('port')) $('port').value = String(_ps ? _ps.port : 7234);
        setStatus(t('guestHint'), '', 'guestHint');
      } else {
        // mode === 'auth'  (pokerth.net registered account)
        $('nick-label').textContent = t('enterAccount');
        $('nick').placeholder = 'MyAccount';
        // Prefill the login if we saved one previously. The password
        // is NEVER persisted in localStorage — that's what the browser
        // keychain (via autocomplete='current-password') is for.
        if (nickEl) nickEl.value = lsGet('pth_auth_login') || '';
        // Internet / PokerTH.net target: admin-selected server (from /app-config)
        // or the built-in pokerth.net:7234 default. Credentialed login always TLS.
        var _ps2 = window._pthNetServer;
        $('use-tls').checked = true;   // TLS is mandatory for credentialed login
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput) hostInput.value = _ps2 ? _ps2.host : 'pokerth.net';
        if ($('port')) $('port').value = String(_ps2 ? _ps2.port : 7234);
        setStatus(t('enterCredentials'), '', 'enterCredentials');
      }

      // Garder les 2 contrôles visibles (serveur + case « Mode invité ») en
      // phase avec le mode interne, quel que soit le chemin ayant fixé
      // login-mode.value (choix utilisateur, restauration, lien partagé…).
      try {
        var _sm = $('server-mode'), _gc = $('guest-mode-cb');
        if (_sm && _gc) {
          if (mode === 'guest' || mode === 'auth') { _sm.value = 'pokerthnet'; _gc.checked = (mode === 'guest'); }
          else { _sm.value = 'lan-dedi'; _gc.checked = (mode === 'lan'); }
        }
      } catch (e) {}
      try { if (window._setSrvSourceTag) window._setSrvSourceTag(mode === 'guest' || mode === 'auth'); } catch (e) {}
    },

    // Mappe (serveur visible × case « Mode invité ») vers l'un des 4 modes
    // internes, puis délègue à onLoginModeChange() — inchangé.
    //   LAN/dédié + invité  → lan (type 0, sans chat)  |  sans invité → unauth (type 2, avec chat)
    //   pokerth.net + invité → guest                    |  sans invité → auth
    onServerOrGuestChange() {
      var srvEl = $('server-mode'), gcEl = $('guest-mode-cb'), lmEl = $('login-mode');
      // NB: the training pseudo is persisted LIVE by the #nick 'input' listener
      // (every keystroke while offline) and on Connect — we deliberately do NOT
      // snapshot the field here on mode change: iOS form-restoration can briefly
      // drop a network pseudo into the field while still offline, and snapshotting
      // that would corrupt pth_offline_nick (the bug where the LAN / pokerth.net
      // name overwrote the training pseudo).
      // Offline (vs bots) mode: no network. Drive a local fake server.
      var off = !!(srvEl && srvEl.value === 'offline');
      window._offlineMode = off;
      try { if (srvEl) localStorage.setItem('pth_server_mode', srvEl.value); } catch (e) {}
      // Connection-detail fields that only make sense for a real network
      // connection. In offline mode none of them apply, so hide them all
      // (and the advanced gear) — the screen keeps just nickname + Connect.
      var _connDetailIds = ['conn-adv-btn','conn-advanced','tls-row','guest-mode-row','f-pass','f-server-pass','f-user-pass','register-link-row'];
      if (off) {
        // login-mode is irrelevant offline; force a no-password value so a
        // stale 'auth' (left by a previous pokerth.net selection) can't make
        // connect() demand a password.
        if (lmEl) lmEl.value = 'unauth';
        // Keep #server-mode on 'offline'. Do NOT call onLoginModeChange():
        // its tail reverse-syncs the visible select back to 'lan-dedi'.
        var _gear = $('conn-adv-btn');
        if (_gear) { _gear.classList.remove('open'); _gear.setAttribute('aria-expanded', 'false'); }
        for (var _i = 0; _i < _connDetailIds.length; _i++) {
          var _el = document.getElementById(_connDetailIds[_i]);
          if (_el) _el.style.display = 'none';
        }
        // Offline keeps its OWN nickname (pth_offline_nick), isolated from the
        // network modes — editing a pokerth.net login / LAN pseudo never leaks
        // into it, and vice-versa. Seed once from a network nick if unset.
        var _onk = $('nick');
        if (_onk) {
          _onk.removeAttribute('readonly');
          _onk.placeholder = t('nickPlaceholder');
          _onk.value = (lsGet('pth_offline_nick') || '');   // pseudo entraînement INDÉPENDANT (aucun repli sur le pseudo LAN)
        }
        var _onl = $('nick-label'); if (_onl) _onl.textContent = t('enterNickFree');
        if (typeof _stopIpBlockCountdown === 'function') _stopIpBlockCountdown();
        setStatus(t('offlineHint'), '', 'offlineHint');
        import('/modules/offline/index.mjs').catch(function(){});
        return;
      }
      // Leaving offline -> bring back the advanced gear + guest toggle; the
      // remaining fields (TLS / passwords / advanced block) are re-derived
      // from the mode + gear state by onLoginModeChange() just below.
      var _gearOn = $('conn-adv-btn'); if (_gearOn) _gearOn.style.display = '';
      var _guestRow = $('guest-mode-row'); if (_guestRow) _guestRow.style.display = '';
      if (srvEl && gcEl && lmEl) {
        var guest = gcEl.checked;
        lmEl.value = (srvEl.value === 'pokerthnet')
          ? (guest ? 'guest' : 'auth')
          : (guest ? 'lan' : 'unauth');
      }
      this.onLoginModeChange();
    },

    connect(opts) {
      opts = opts || {};
      var _preserve = !!opts.preserve;
      // ── Fix 2 + 3: re-entrancy guard ──
      // Disable double-clicks: if a connect() is already in progress
      // (either waiting on SW, waiting on previous WS to close, or
      // waiting for mode-swap gap), ignore the new click.
      if (_connectingNow) {
        return;
      }
      // ── SW-ready gate (one-shot per page lifetime) ──
      // First-time visitors trigger a Service Worker install on page load.
      // The SW does skipWaiting() + clients.claim(), which can take control
      // of the page WHILE our first WebSocket is being established. The
      // takeover kills the in-flight WS (browser closes it with code 1005),
      // and the PokerTH server interprets that as a suspicious connect-then-
      // immediately-drop pattern, blocking the IP for a few minutes.
      //
      // Fix: on the FIRST call only, wait until the SW is settled before
      // actually opening the upstream. Uses navigator.serviceWorker.ready,
      // which resolves the moment the SW has reached the 'activated' state
      // — usually <100ms when already installed, up to a second on first
      // visit while the SW caches assets.
      if (!window._swReadyOnce && 'serviceWorker' in navigator) {
        window._swReadyOnce = true;
        var self = this;
        var fired = false;
        var go = function() {
          if (fired) return; fired = true;
          self.connect();
        };
        setStatus('⏳ ' + (t('initializing') || 'Initialisation…'));
        navigator.serviceWorker.ready.then(go);
        setTimeout(go, 1500);   // safety timeout
        return;
      }

      // ── Fix 1: anti-blocage 'rapid mode swap' ──
      // Read the current mode + nickname BEFORE doing any rate-limit check
      // so we can decide whether this call needs the extra mode-swap delay.
      const _curMode = $('login-mode') ? $('login-mode').value : 'guest';
      const _curNick = ($('nick') ? $('nick').value.trim() : '');
      const _modeChanged = (_lastInitMode !== null) &&
                           (_curMode !== _lastInitMode || _curNick !== _lastInitNick);
      const _gapNow = Date.now() - _lastInitTime;
      if (_modeChanged && _gapNow < MODE_SWAP_MIN_GAP) {
        const wait_ms = MODE_SWAP_MIN_GAP - _gapNow;
        const wait_s = Math.ceil(wait_ms / 1000);
        const that = this;
        // Disable the connect button so the user can't pile clicks
        _connectingNow = true;
        var btn = document.querySelector('#s-connect .btn-primary');
        if (btn) btn.disabled = true;
        // Live countdown so the user understands what's happening
        var remain = wait_s;
        setStatus('⏳ ' + t('preparingConnection', { n: remain }));
        var iv = setInterval(function(){
          remain--;
          if (remain > 0) setStatus('⏳ ' + t('preparingConnection', { n: remain }));
        }, 1000);
        setTimeout(function() {
          clearInterval(iv);
          if (btn) btn.disabled = false;
          _connectingNow = false;
          that.connect();
        }, wait_ms);
        return;
      }

      // ── Fix 2: properly close any lingering WebSocket before reopening ──
      // The original code did `ws.close()` then immediately created a new
      // one. That works most of the time, but `ws.close()` is async — the
      // socket can stay in CLOSING state for a few hundred ms. If we open
      // the new one immediately, the server briefly sees two active
      // connections from the same IP, which can also trigger initBlocked.
      // Defer the rest of connect() until the old WS reaches CLOSED, with
      // a 500ms hard cap so we never hang.
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        _connectingNow = true;
        var that2 = this;
        var btn2 = document.querySelector('#s-connect .btn-primary');
        if (btn2) btn2.disabled = true;
        setStatus('⏳ ' + (t('closingPrevious') || 'Fermeture de la connexion précédente…'));
        // Detach the old onclose to avoid the disconnect handler kicking in
        var prevWs = ws;
        prevWs.onclose = null;
        prevWs.onerror = null;
        try { prevWs.close(); } catch(e) {}
        ws = null;
        var done = false;
        var resume = function() {
          if (done) return; done = true;
          if (btn2) btn2.disabled = false;
          _connectingNow = false;
          that2.connect();
        };
        // The CLOSING → CLOSED transition is typically <50ms. We poll for
        // it instead of relying on an event because we removed the
        // listeners above.
        var poll = setInterval(function() {
          if (!prevWs || prevWs.readyState === WebSocket.CLOSED) {
            clearInterval(poll); resume();
          }
        }, 30);
        setTimeout(function(){ clearInterval(poll); resume(); }, 500);
        return;
      }

      // ── Rate limiter : éviter le spam qui provoque le blocage IP ──
      const now = Date.now();
      var _gateOffline = !!(window._offlineMode || ($('server-mode') && $('server-mode').value === 'offline'));
      if (!_gateOffline && _ipBlockUntil > now) {
        const remaining = Math.ceil((_ipBlockUntil - now) / 1000);
        const mins = Math.floor(remaining / 60), secs = remaining % 60;
        setStatus(t('ipBlockedWaitPrefix') + (mins > 0 ? mins + 'min ' : '') + secs + 's', 'err');
        _startIpBlockCountdown();
        return;
      }
      // Rate limiter seulement après un échec (pas après une déco normale)
      if (_lastConnectFailed && now - _lastConnectTime < MIN_CONNECT_INTERVAL) {
        const wait = Math.ceil((MIN_CONNECT_INTERVAL - (now - _lastConnectTime)) / 1000);
        setStatus(t('waitBeforeRetry', { n: wait }), 'err');
        return;
      }
      _lastConnectTime = now;
      // Sauvegarder le serveur préféré
      try {
        var lm2 = $('login-mode'); var hv = $('host'); var pv = $('port'); var xv = $('proxy');
        if (lm2) localStorage.setItem('pth_login_mode', lm2.value);
        if (hv)  localStorage.setItem('pth_host',  hv.value.trim());
        if (pv)  localStorage.setItem('pth_port',  pv.value.trim());
        if (pv && lm2 && (lm2.value === 'lan' || lm2.value === 'unauth')) localStorage.setItem('pth_lan_port', pv.value.trim());
        if (xv)  localStorage.setItem('pth_proxy', xv.value.trim());
        // Auto-save the nickname per-mode (no Remember-me checkbox
        // needed — silent persistence is the new default). Guest is
        // skipped because it manages its own pth_guest_name key, and
        // auth saves only the LOGIN (never the password — that's the
        // browser keychain's job via autocomplete='current-password').
        var nickVal = ($('nick') && $('nick').value || '').trim();
        if (nickVal) {
          var _smEl = $('server-mode');
          if (_smEl && _smEl.value === 'offline') {
            // Offline nickname lives under its own key — never touches the
            // LAN / unauth / auth pseudos.
            localStorage.setItem('pth_offline_nick', nickVal);
          } else if (lm2) {
            var mv = lm2.value;
            if      (mv === 'lan')    localStorage.setItem('pth_lan_nick',    nickVal);
            else if (mv === 'unauth') localStorage.setItem('pth_unauth_nick', nickVal);
            else if (mv === 'auth')   localStorage.setItem('pth_auth_login',  nickVal);
          }
        }
      } catch(e) {}
      const proxyUrl  = $('proxy').value.trim();
      const host      = $('host').value.trim();
      const port      = $('port').value.trim() || '7234';
      const loginMode = $('login-mode') ? $('login-mode').value : 'guest';
      const _off = !!($('server-mode') && $('server-mode').value === 'offline');
      myName          = $('nick').value.trim();

      if (!myName && loginMode === 'guest') {
        // Persistent Guest name: re-use the same identifier across tabs
        // and reloads so the server doesn't see different pseudos flooding
        // from the same IP (a key trigger of the initBlocked behaviour).
        myName = (window.getOrCreateGuestName && window.getOrCreateGuestName())
                 || ('Guest' + String(Math.floor(10000 + Math.random()*90000)));
        $('nick').value = myName;
      }
      if (!myName) { setStatus(t('enterNick'), 'err'); return; }
      if (myName.length < 3) { setStatus(t('nickTooShort'), 'err'); return; }
      if (!_off && (!proxyUrl || !host)) { setStatus(t('fillFields'), 'err'); return; }

      if (!_off && loginMode === 'auth' && (!$('pass') || !$('pass').value.trim())) {
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
      // En reconnexion « preserve » (bascule réseau), on NE vide PAS l'état de
      // la table / du lobby : le proxy rebranche le WebSocket sur la session
      // PokerTH déjà en cours (pas de nouvel Announce/Init), donc le serveur ne
      // renvoie pas la liste des joueurs/avatars — il faut les garder en mémoire
      // pour ne pas afficher des sièges vides. Repli (session expirée) : on
      // recevra un Announce → le flux normal repeuplera tout.
      if (!_preserve) {
        games   = {};
        players = {};
        _playerCountries = {};
        _playerRights = {};
        _raiseMode = 1; _raiseEvery = 0; _lastBlindsUpHand = 0;
        _endRaiseMode = 1; _endRaiseValue = 0;
        // Avatars : indexés par pid (stables tant que la session lobby dure) ou
        // par hash (cache réutilisable). Donc même cycle de vie que 'players' :
        // on ne les vide qu'à la déconnexion complète, pas en quittant une partie
        // (sinon les avatars disparaissent au retour au lobby — les hashes/emojis
        // ne sont re-reçus qu'une fois).
        _playerAvatars = {}; _playerImgAvatars = {};
        _pthAvatarHashes = {}; _pthAvatarsByHash = {}; _pthAvatarReqIdToHash = {}; _pthDataUrls = {};
        loaded  = false;
        // Repeindre tout de suite la liste (désormais vide) : sinon, dans un
        // lobby calme/vide (ex. retour de l'entraînement vers un serveur en
        // ligne sans table), aucun GameListNew n'arrive pour déclencher un
        // redraw et les tables de l'ancien mode RESTENT affichées jusqu'à un
        // clic sur une pastille filtre. renderGames() rétablit l'état « en
        // chargement » jusqu'au premier GameListNew qui repeuplera la liste.
        renderGames();
      }

      // Direct WSS for any pokerth.net mode (guest or authenticated). The
      // /pthlive endpoint is the only one publicly exposed by pokerth.net
      // (port 7234 is not reachable in TLS from the outside). It accepts
      // authenticated logins as long as the InitMessage carries the password
      // in clientUserData.
      const isPokerThDirect = (loginMode === 'guest' || loginMode === 'auth');
      const targetIsPokerTH = host.includes('pokerth.net');
      directWS = isPokerThDirect && targetIsPokerTH;
      const finalUrl = directWS
        ? 'wss://www.pokerth.net:443/pthlive'
        : proxyUrl + '?host=' + encodeURIComponent(host) + '&port=' + encodeURIComponent(port) + '&tls=' + tlsParam + '&sid=' + encodeURIComponent(_getSessionId());

      setStatus(directWS ? t('connDirect') : t('connProxy'));

      // Réactions emoji : relayées partout via la convention /emoji dans le chat
      // de partie (interop web <-> Qt/QML, y compris pokerth.net). Le bouton
      // reste donc toujours visible quel que soit le mode de connexion.
      window._directWS = directWS;
      // Marqueur de mode pour le CSS : drapeaux agrandis uniquement sur pokerth.net.
      try { document.body.classList.toggle('pth-net', !!directWS); } catch (e) {}
      try {
        var _rtb = document.getElementById('react-toggle-btn');
        if (_rtb) _rtb.style.display = '';
      } catch (e) {}

      // Sauvegarder les paramètres pour la reconnexion auto
      // Record this Init's identity so the NEXT connect() can compare
      // and apply the mode-swap delay if needed.
      _lastInitMode = loginMode;
      _lastInitNick = myName;
      _lastInitTime = Date.now();
      _lastConnectParams = { host, port, loginMode, finalUrl, myName,
        pass: $('pass') ? $('pass').value : '' };
      _reconnectAttempts = 0;
      _intentionalDisconnect = false;
      _wasAuthenticated = false;
      _currentLoginMode = loginMode; // sauvegarder pour ChatReject
      // The CreateGame form defaults depend on this mode. Refresh them
      // now so the values are correct the first time the user opens it.
      try { App._applyCreateFormDefaults(true); } catch (e) {}
      if ($('server-mode') && $('server-mode').value === 'offline') {
        // ── OFFLINE vs BOTS ── swap the transport for a local fake server.
        directWS = false;
        if (!(window.PokerOffline && window.PokerOffline.createSocket)) {
          setStatus('Chargement du mode hors-ligne…');
          import('/modules/offline/index.mjs')
            .then(function(){ App.connect(); })
            .catch(function(){ setStatus('Offline init failed', 'err'); });
          return;
        }
        try {
          ws = window.PokerOffline.createSocket({ nick: myName,
            botSkill: (function(){ try { return localStorage.getItem('pth_offline_skill') || 'mixed'; } catch (e) { return 'mixed'; } })() });
        } catch (e) {
          setStatus('Offline init failed: ' + e.message, 'err');
          return;
        }
      } else {
        try {
          ws = new WebSocket(finalUrl);
        } catch (e) {
          setStatus(t('invalidUrl', { msg: e.message }), 'err');
          return;
        }
      }

      _beginConnecting();   // lock button for the whole attempt (anti IP-block)
      ws.binaryType = 'arraybuffer';
      ws.onopen    = () => { _lastRxTime = Date.now(); setStatus(t('proxyConnectedWait')); try { window._pthCountConnect && window._pthCountConnect(directWS ? 'pokerthnet' : ((window._offlineMode || ($('server-mode') && $('server-mode').value === 'offline')) ? 'offline' : 'lan')); } catch (e) {} };
      ws.onerror   = () => { _lastConnectFailed = true; _endConnecting(); setStatus(t('wsError'), 'err'); };
      ws.onmessage = function(e) {
        if (typeof e.data === 'string') {
          // Message texte = protocole proxy (réactions)
          if (e.data.startsWith('NOTICE:')) {
            var nbody = e.data.slice(7);
            if (nbody === 'CANCEL') { if (typeof hideRestartNotice === 'function') hideRestartNotice(); if (typeof showToast === 'function') showToast(t('srvRestartCancelled'), { icon: '', duration: 4000 }); return; }
            if (nbody.startsWith('RESTART:')) {
              var nr = nbody.slice(8), ns1 = nr.indexOf(':');
              if (ns1 > 0) {
                var ndead = parseInt(nr.slice(0, ns1), 10), nrest = nr.slice(ns1 + 1), ns2 = nrest.indexOf(':');
                var nkind = ns2 >= 0 ? nrest.slice(0, ns2) : nrest, nnote = ns2 >= 0 ? nrest.slice(ns2 + 1) : '';
                if (ndead && typeof showRestartNotice === 'function') showRestartNotice(ndead, nkind, nnote);
              }
            }
            return;
          }
          if (e.data.startsWith('INFO:')) {
            var ib = e.data.slice(5), is1 = ib.indexOf(':');
            var iicon = is1 >= 0 ? ib.slice(0, is1) : '';
            var imsg = is1 >= 0 ? ib.slice(is1 + 1) : ib;
            if (imsg && typeof _showBroadcast === 'function') _showBroadcast(imsg, iicon);
            return;
          }
          // Avatar IMAGE perso diffusé via le proxy. Le data URL contient
          // des ':' -> on découpe uniquement sur le 1er séparateur après le pid.
          if (e.data.startsWith('AVATARIMG:')) {
            var imgRest = e.data.slice(10); // après "AVATARIMG:"
            var imgSep  = imgRest.indexOf(':');
            if (imgSep > 0) {
              var imgPid = parseInt(imgRest.slice(0, imgSep), 10);
              var imgUrl = imgRest.slice(imgSep + 1);
              if (imgPid && imgPid !== myId) {
                if (imgUrl && imgUrl.slice(0, 5) === 'data:') _playerImgAvatars[imgPid] = imgUrl;
                else delete _playerImgAvatars[imgPid]; // vide = effacer l'image
                if (typeof renderSeats === 'function' && seats.length) renderSeats();
              }
            }
            return;
          }
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
              handleIncomingReaction(fromPid, reactEmoji, 'react');
              // Pas d'affichage dans le chat — uniquement animation flottante
            }
          }
          return;
        }
        onRawData(e.data);
      };
      ws.onclose = function(e) {
        _endConnecting();   // free the connect button on any close
        ws = null;
        clearTimeout(window._reconnectTimer);
        clearInterval(window._reconnectCountdown);
        _hideBanner();

        // User asked to leave (clicked ✕ / disconnect): do NOT auto-reconnect.
        // Without this guard, ws.close() from disconnect() falls through to the
        // reconnect scheduler below and drops the user back into the lobby a few
        // seconds after they returned to the home screen.
        if (_intentionalDisconnect) {
          return;
        }

        // Mémoriser la table pour réclamer le siège à la reconnexion (sinon on
        // se ferait renommer au pseudo « déjà pris »).
        _armRejoin();

        // --- RECONNEXION AUTO (limitée pour éviter le blocage IP) ---
        _reconnectAttempts++;
        var maxAttempts = 3; // max 3 tentatives pour éviter le blocage IP
        if (_reconnectAttempts > maxAttempts) {
          _hideBanner();
          _wasAuthenticated = false;
          show('s-connect');
          setStatus(t('reconnFailed', { n: maxAttempts }), 'err');
          return;
        }
        // Délai croissant : 5s, 15s, 30s — assez long pour ne pas spammer
        var delay = [5000, 15000, 30000][_reconnectAttempts - 1] || 30000;
        var secs = Math.round(delay/1000);
        _showBanner(t('reconnIn') + secs + 's… (' + _reconnectAttempts + '/' + maxAttempts + ')');
        window._reconnectTimer = setTimeout(function() {
          if (ws) return; // déjà reconnecté
          _showBanner(t('reconnInProgress'));
          try {
            ws = new WebSocket(_lastConnectParams.finalUrl);
            ws.binaryType = 'arraybuffer';
            ws.onopen = function() {
              _showBanner(t('reauthBanner'));
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
      // Relancer le processus de reconnexion — backoff exponentiel
      if (!_lastConnectParams || _intentionalDisconnect) return;
      _reconnectAttempts++;
      var maxAttempts = 6;
      if (_reconnectAttempts > maxAttempts) {
        _hideBanner();
        show('s-connect');
        setStatus(t('reconnFailed', { n: maxAttempts }), 'err');
        return;
      }
      // Exponentiel : 3s → 6s → 12s → 24s → 30s → 30s
      var delay = Math.min(3000 * Math.pow(2, _reconnectAttempts - 1), 30000);
      var secsTotal = Math.round(delay / 1000);
      // Countdown live dans le banner
      clearInterval(window._reconnectCountdown);
      var secsLeft = secsTotal;
      function _updateBannerCountdown() {
        var pfx = t('reconnIn');
        var sfx = ' ('+_reconnectAttempts+'/'+maxAttempts+')';
        _showBanner(pfx + secsLeft + 's' + sfx);
        if (secsLeft > 0) secsLeft--;
      }
      _updateBannerCountdown();
      window._reconnectCountdown = setInterval(_updateBannerCountdown, 1000);
      window._reconnectTimer = setTimeout(function() {
        clearInterval(window._reconnectCountdown);
        App.connect();
      }, delay);
    },

    confirmDisconnect() {
      // Public entry point for the lobby ✕ button. Opens a small
      // confirmation modal — clicking 'Disconnect' then routes to the
      // existing disconnect() flow; clicking 'Cancel' just closes the
      // modal and leaves the user in the lobby.
      var dd = document.getElementById('disconnect-dialog');
      if (dd) dd.style.display = 'flex';
    },

    confirmDisconnectQuit() {
      // Confirmed — hide the modal and disconnect normally. The user
      // lands on the login screen via the ws.onclose handler.
      var dd = document.getElementById('disconnect-dialog');
      if (dd) dd.style.display = 'none';
      this.disconnect();
    },

    cancelDisconnect() {
      // Cancelled — just dismiss the modal. The connection stays open.
      var dd = document.getElementById('disconnect-dialog');
      if (dd) dd.style.display = 'none';
    },

    // Clean teardown before an intentional page reload (version update ONLY):
    // close the proxy WebSocket with code 4001 so the proxy frees the PokerTH
    // player right away — no 2-min grace, no server-side zombie. The sid is
    // deliberately kept, so if the close frame doesn't flush before navigation
    // the reloaded page can still rebind to the grace session rather than
    // collide with it. NOT used by the ↺ refresh button, which keeps the
    // session alive via grace + sid rebind.
    teardownForReload() {
      try {
        if (ws) {
          ws.onclose = null; ws.onerror = null; ws.onmessage = null; ws.onopen = null;
          ws.close(4001, 'reload');
          ws = null;
        }
      } catch (e) {}
    },
    disconnect() {
      _intentionalDisconnect = true;
      _wasAuthenticated = false;
      _lastConnectFailed = false; // déco propre → pas de rate limit
      // Déconnexion volontaire → faire tourner le sid : la prochaine connexion
      // doit créer une session PokerTH NEUVE (pseudo éventuellement changé), et
      // non se rebrancher sur l'ancienne que le proxy garde ~2 min. On vide les
      // deux stockages (le contexte standalone/onglet ne change pas, mais c'est
      // sans risque et robuste).
      try { localStorage.removeItem('pth_sid'); } catch (e) {}
      try { sessionStorage.removeItem('pth_sid'); } catch (e) {}
      document.body.classList.remove('in-game');
      _hideBanner();
      // Cancel any pending auto-reconnect that a previous onclose may have
      // scheduled, so it can't fire after we're back on the home screen.
      clearTimeout(window._reconnectTimer);
      clearInterval(window._reconnectCountdown);
      _reconnectAttempts = 0;
      if (ws) {
        // Detach handlers BEFORE closing: ws.close() triggers onclose
        // synchronously-ish, and we don't want the reconnect scheduler to run.
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.onopen = null;
        // Intentional disconnect → close with code 4001 so the proxy frees the
        // PokerTH player immediately (no 2-min reconnect grace → no zombie).
        try { ws.close(4001, 'user disconnect'); } catch (e) {}
        ws = null;
      }
      games = {};
      // Reset lobby counters so the next connect starts at 0 instead
      // of inheriting the previous session's tally.
      _lobbyPlayerCount = 0;
      _hasStatistics = false;
      _lobbyPids.clear();
      _pendingNameRequests.clear();
      show('s-connect');
    },


    // ──────────────────────────────────────────────────────────
    // Kick player flow (admin only). See pokerth.proto:
    //   KickPlayerRequestMessage (type 30) → server broadcasts
    //   GamePlayerLeft(leftKicked) to all + RemovedFromGame to victim.
    //   Existing handlers in this file already remove the player
    //   from seats[] on receipt, so the UI updates itself.
    // ──────────────────────────────────────────────────────────
    openKickModal() {
      if (!amGameAdmin) return; // double-check; button shouldn't be visible
      var modal = document.getElementById('kick-modal');
      var list  = document.getElementById('km-list');
      if (!modal || !list) return;
      // Build the list from seatData (covers both pre-game and in-game
      // phases; GamePlayerJoined writes here on first sight). Filter out
      // pids the server has marked as gone, just in case.
      var pids = Object.keys(seatData).map(function(s){ return parseInt(s,10); })
                       .filter(function(p){ return !seatData[p].gone; });
      // Sort: me first, then alphabetical by name.
      pids.sort(function(a, b) {
        if (a === myId && b !== myId) return -1;
        if (b === myId && a !== myId) return 1;
        var na = (players[a] || ('#' + a)).toLowerCase();
        var nb = (players[b] || ('#' + b)).toLowerCase();
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
      if (!pids.length) {
        list.innerHTML = '<div class="km-empty">— ' + t('kickNoPlayers') + ' —</div>';
      } else {
        var html = pids.map(function(pid) {
          var name = players[pid] || ('#' + pid);
          var sd   = seatData[pid] || {};
          var stack= (typeof sd.money === 'number') ? fmtChips(sd.money) : '';
          var isMe = (pid === myId);
          var avChip = (typeof window._avatarChipHtml === 'function')
            ? window._avatarChipHtml(pid, name, 'km-av')
            : '<span class="km-av letter">' + (name[0] || '?').toUpperCase() + '</span>';
          // No kick button for self (admin can't kick themselves; the
          // server would reject it anyway).
          var rowCls = 'km-row' + (isMe ? ' km-self' : '');
          // Escape name for safe HTML injection
          var escName = String(name).replace(/[<>&"]/g, function(c){
            return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];
          });
          var btn = isMe ? '' :
            '<button class="km-kick" type="button" ' +
              'onclick="App.askConfirmKick(' + pid + ')" ' +
              'title="' + t('kickTooltip') + '" ' +
              'aria-label="Kick">🗑️</button>';
          return '<div class="' + rowCls + '">' +
                   avChip +
                   '<div class="km-info">' +
                     '<div class="km-name">' + escName + '</div>' +
                     (stack ? '<div class="km-meta">' + stack + '</div>' : '') +
                   '</div>' +
                   btn +
                 '</div>';
        }).join('');
        list.innerHTML = html;
      }
      modal.style.display = 'flex';
    },
    closeKickModal() {
      var modal = document.getElementById('kick-modal');
      if (modal) modal.style.display = 'none';
    },
    // ── Send invitations (InvitePlayerToGame) — opened from the ≡ menu ──
    // Lists online lobby players who aren't already at this table; each
    // row sends an invite for the current gId. The recipient gets the
    // Accept/Decline banner (handled by InviteNotify on their side).
    openInviteModal() {
      if (window._offlineMode || _amSpectator || !gId) return;
      var modal = document.getElementById('invite-modal');
      var list  = document.getElementById('im-list');
      if (!modal || !list) return;
      _invSent = {}; // fresh session
      App._renderInviteList(App._inviteEligiblePids());
      modal.style.display = 'flex';
    },
    _inviteEligiblePids() {
      var seated = {};
      Object.keys(seatData).forEach(function(s){ seated[parseInt(s,10)] = true; });
      var pids = [];
      _lobbyPids.forEach(function(p){ if (p !== myId && !seated[p]) pids.push(p); });
      pids.sort(function(a,b){
        var na=(players[a]||('#'+a)).toLowerCase(), nb=(players[b]||('#'+b)).toLowerCase();
        return na<nb?-1:na>nb?1:0;
      });
      return pids;
    },
    _renderInviteList(pids) {
      var list = document.getElementById('im-list');
      if (!list) return;
      if (!pids.length) {
        list.innerHTML = '<div class="km-empty">— ' + t('inviteNoPlayers') + ' —</div>';
        return;
      }
      list.innerHTML = pids.map(function(pid) {
        var name = players[pid] || ('#' + pid);
        var avChip = (typeof window._avatarChipHtml === 'function')
          ? window._avatarChipHtml(pid, name, 'km-av')
          : '<span class="km-av letter">' + (name[0]||'?').toUpperCase() + '</span>';
        var escName = String(name).replace(/[<>&"]/g, function(c){
          return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];
        });
        var btn = _invSent[pid]
          ? '<button class="im-invite" type="button" disabled style="opacity:.55;border:1px solid var(--border,#444);background:transparent;color:var(--text,#eff1f5);border-radius:8px;padding:6px 12px;font-weight:600">' + t('inviteSent') + '</button>'
          : '<button class="im-invite" type="button" onclick="App.sendInvite(' + pid + ')" style="border:1px solid var(--green,#3fae5a);background:transparent;color:var(--text,#eff1f5);border-radius:8px;padding:6px 12px;font-weight:600;cursor:pointer">' + t('inviteBtn') + '</button>';
        return '<div class="km-row">' +
                 avChip +
                 '<div class="km-info"><div class="km-name">' + escName + '</div></div>' +
                 btn +
               '</div>';
      }).join('');
    },
    sendInvite(pid) {
      if (window._offlineMode || !gId || pid === myId) return;
      try { send(MSG.buildInvitePlayer(gId, pid)); } catch(e) {}
      _invSent[pid] = true;
      App._renderInviteList(App._inviteEligiblePids());
      if (typeof showToast === 'function') showToast(t('inviteSentToast', { name: players[pid] || ('#'+pid) }));
    },
    closeInviteModal() {
      var modal = document.getElementById('invite-modal');
      if (modal) modal.style.display = 'none';
    },
    // Step 2: ask confirmation before sending the kick.
    askConfirmKick(pid) {
      if (!amGameAdmin) return;
      var name = players[pid] || ('#' + pid);
      var msgEl = document.getElementById('kcm-msg');
      var titleEl = document.getElementById('kcm-title');
      if (titleEl) {
        titleEl.textContent = t('kickThisPlayer');
      }
      if (msgEl) {
        msgEl.textContent = t('kickConfirmMsg', { name: name });
      }
      // Stash the target pid for the confirm button.
      window._pendingKickPid = pid;
      var modal = document.getElementById('kick-confirm-modal');
      if (modal) modal.style.display = 'flex';
    },
    cancelKickConfirm() {
      window._pendingKickPid = null;
      var modal = document.getElementById('kick-confirm-modal');
      if (modal) modal.style.display = 'none';
    },
    doKickConfirmed() {
      var pid = window._pendingKickPid;
      var modal = document.getElementById('kick-confirm-modal');
      if (modal) modal.style.display = 'none';
      if (!pid || !amGameAdmin || !gId) {
        window._pendingKickPid = null;
        return;
      }
      var name = players[pid] || ('#' + pid);
      // Try BOTH paths so we work with both server implementations:
      //   1. KickPlayerRequestMessage (type 30) — the proto-level
      //      admin action. Some PokerTH servers honour this, others
      //      ignore it for non-real-player pids (e.g. bots) or have
      //      it disabled for stability reasons (see ChangeLog v2.0.6
      //      "admin actions functional again" — i.e. it was broken).
      //   2. "/kick <name>" via game-scoped chat — the canonical
      //      path documented on the PokerTH forum ("the game admin
      //      can kick a user by typing /kick username at the chat").
      //      The server's admin bot / chatcleaner parses this.
      // Whichever the server supports, one of the two will work; the
      // other is a no-op (server ignores it).
      try { send(MSG.buildKickPlayer(gId, pid)); } catch(e) {}
      try { send(MSG.buildGameChat(gId, '/kick ' + name)); } catch(e) {}
      // Optimistic log so the admin gets immediate feedback even
      // before the server broadcasts GamePlayerLeft. Localised.
      var fr = (typeof _lang === 'undefined' || _lang !== 'en');
      addGameChat(null, '🗑️ ' + t('kickRequested', { name: name }), 'sys', { prefix: '🗑️ ', key: 'kickRequested', params: { name: name } });
      // Watchdog: if the server hasn't broadcast a GamePlayerLeft
      // within 3s, the kick has almost certainly failed silently.
      // This happens on PokerTH servers older than v2.0.6 (March 2026,
      // changelog: "admin actions functional again"). Warn the admin.
      // Skipped in training mode (offline): the FakeServer applies a kick
      // as a deferred removal at end-of-hand, which can legitimately take
      // longer than 3s — the bot WILL leave, so no warning is warranted.
      if (!window._offlineMode)
      (function(targetPid, targetName, gameAtRequest) {
        setTimeout(function() {
          // Bail if we left the table / changed game in the meantime.
          if (gId !== gameAtRequest) return;
          // Player still present means the kick was not honoured.
          if (seatData[targetPid] && !seatData[targetPid].gone) {
            addGameChat(null, '⚠ ' + t('kickNotProcessed', { name: targetName }), 'sys', { prefix: '⚠ ', key: 'kickNotProcessed', params: { name: targetName } });
          }
        }, 3000);
      })(pid, name, gId);
      window._pendingKickPid = null;
      // Refresh the kick list so the row disappears once the server
      // confirms. We don't close the modal automatically: if the admin
      // wants to kick several players in a row, they can.
      // (We do trigger a re-render after a short delay to give the
      // GamePlayerLeft message time to arrive.)
      setTimeout(function() {
        var m = document.getElementById('kick-modal');
        if (m && m.style.display === 'flex') {
          // Re-open / re-render with the (hopefully) updated seatData
          App.openKickModal();
        }
      }, 600);
    },

    closeTable() {
      // Admin closes table: send leave, server closes game for all
      if (ws && gId) { try { send(MSG.buildLeaveGame(gId)); } catch(e) {} }
      _pendingRejoin = 0; _rejoinNickRetries = 0;
      try { localStorage.removeItem('pth_resume'); } catch(e) {}
      amInGame = false; amGameAdmin = false; _gameStarted = false; _seatsFrozen = false; _amSpectator = false; var _sb2 = document.getElementById('g-spectator-banner'); if (_sb2) _sb2.style.display = 'none';
      gId = 0; seats = []; seatData = {}; _specPids = new Set();
      var _ego = document.getElementById('g-endgame-overlay');
      if (_ego) _ego.style.display = 'none';
      myCards = [null,null]; commCards = [];
      stopTurnTimer();
      dismissWinner();
      _chatRejectShown = false;
      _lastMsgWasReaction = false;
      document.body.classList.remove('in-game');
      var acb = document.getElementById('admin-close-btn');
      if (acb) acb.style.display = 'none';
      var akb = document.getElementById('admin-kick-btn');
      if (akb) akb.style.display = 'none';
      var akbm = document.getElementById('admin-kick-mob');
      if (akbm) akbm.style.display = 'none';
      var asnb = document.getElementById('admin-startnobots-btn');
      if (asnb) asnb.style.display = 'none';
      var asnbm = document.getElementById('admin-startnobots-mob');
      if (asnbm) asnbm.style.display = 'none';
      var badge = document.getElementById('g-admin-badge');
      if (badge) badge.style.display = 'none';
      show('s-lobby');
      addChat(null, t('tableClosedMsg'), 'sys', { key: 'tableClosedMsg' });
    },

    endGameClose() {
      // Just dismiss the end-of-game overlay; the user stays on the
      // table view (final stacks visible, chat still readable).
      var el = document.getElementById('g-endgame-overlay');
      if (el) el.style.display = 'none';
    },

    endGameLeave() {
      // Dismiss the overlay then perform the normal leaveGame() flow:
      // send a LeaveGame to the server, reset client state, and return
      // to the lobby. Reuses everything leaveGame() already does so
      // there's no special-case cleanup path to maintain.
      var el = document.getElementById('g-endgame-overlay');
      if (el) el.style.display = 'none';
      this.leaveGame();
    },

    offlineReplay() {
      // Mode entraînement uniquement : relancer une partie avec les mêmes
      // réglages, en place. On revient au lobby (la socket hors-ligne reste
      // ouverte), on recrée la table depuis le formulaire, puis startWithBots()
      // est déclenché par le hook JoinGameAck dès que gId est connu (événementiel,
      // pas de minuteur fragile).
      if (!window._offlineMode) { this.endGameLeave(); return; }
      var el = document.getElementById('g-endgame-overlay');
      if (el) el.style.display = 'none';
      window._offlineAutoReplay = true;
      this.leaveGame();    // -> lobby, FakeServer remis à zéro, socket conservée
      try { this.createGame(); } catch (e) { window._offlineAutoReplay = false; }
    },

    // Sélecteur de mode de jeu PERSISTANT (officiel) : 0=Manuel,
    // 1=Auto Check/Call, 2=Auto Check/Fold. Si on choisit un mode auto alors
    // que c'est déjà notre tour, l'action est jouée immédiatement.
    _modeSelHold(on){
      // Pose/leve le verrou anti-fermeture du picker de mode (#mode-sel).
      _modeSelBusy = !!on;
      clearTimeout(_modeSelHoldTimer); _modeSelHoldTimer = null;
      if (on) _modeSelHoldTimer = setTimeout(function(){ _modeSelBusy = false; _flushPreviewIfPending(); }, 8000);
      else _flushPreviewIfPending();
    },

    toggleActionPin() {
      _actionBarPinned = !_actionBarPinned;
      try { localStorage.setItem('pth_pin_actionbar', _actionBarPinned ? '1' : '0'); } catch(e){}
      _updatePinBtn();
      // rafraichit immediatement l'UI hors-tour pour refleter le nouvel etat
      if (turnPid !== myId && _gameStarted) renderGameWaiting(_lastWaitingMsg, _lastWaitingIsHtml);
    },

    setPlayingMode(idx) {
      var n = parseInt(idx, 10);
      if (!(n === 1 || n === 2)) n = 0;
      _playingMode = n;
      var sel = document.getElementById('mode-sel');
      if (sel && sel.selectedIndex !== n) sel.selectedIndex = n;
      if (n !== 0 && turnPid === myId) _playAutoMode();
    },

    // Ouvre/ferme le panneau "aperçu" en tapant ses cartes. Volontairement
    // sans effet à NOTRE tour (on ne change rien au fonctionnement actuel) ;
    // requiert une main en cours avec des cartes, hors mode spectateur.
    togglePreActionPanel() {
      if (turnPid === myId) return;                 // à notre tour : inchangé
      if (_amSpectator || !_gameStarted) return;
      if (myCards[0] == null && myCards[1] == null) return; // pas de cartes
      _preActionOpen = !_preActionOpen;
      if (_preActionOpen) _renderPreActionPanel();
      else _closePreActionPanel();
    },

    // Bascule rapide du mode depuis le panneau aperçu : Manuel <-> Auto Check/Fold.
    // (Conservé pour compat ; le dropdown du panneau pilote App.setPlayingMode.)
    togglePreAuto() {
      _playingMode = (_playingMode === 0) ? 2 : 0;
      if (_preActionOpen) _renderPreActionPanel();
    },

    confirmLeaveGame() {
      // Public entry point for the header ✕ button. Opens the quit
      // confirmation modal — clicking 'Quit' will then call leaveGame()
      // as usual; clicking 'Cancel' just dismisses the modal.
      closeHeaderOverflow();
      var ld = document.getElementById('leave-dialog');
      if (ld) ld.style.display = 'flex';
    },

    confirmLeaveQuit() {
      // Confirmed — close the modal and perform the standard leave
      // flow (send LeaveGame, reset client state, back to lobby).
      var ld = document.getElementById('leave-dialog');
      if (ld) ld.style.display = 'none';
      this.leaveGame();
    },

    cancelLeaveGame() {
      // Cancelled — just hide the modal, user stays in the game.
      var ld = document.getElementById('leave-dialog');
      if (ld) ld.style.display = 'none';
    },

    // Reset all in-game / table state back to a clean lobby baseline.
    // Pure local cleanup: it sends nothing on the wire, does NOT touch
    // _pendingRejoin/pth_resume (each caller manages those), and does NOT
    // navigate (each caller decides where to go). Used by every path that
    // lands back in the lobby — leaving, being removed, a failed rejoin, or
    // a fresh InitAck — so they all clear the same state and none can leave
    // a stale "still in my game / still admin" flag that blocks creating a
    // new table.
    _resetGameState() {
      amInGame = false; amGameAdmin = false; _gameStarted = false;
      _seatsFrozen = false; _amSpectator = false;
      gId = 0; seats = []; seatData = {};
      try { stopTurnTimer(); } catch (e) {}
      try { dismissWinner(); } catch (e) {}
      try { if (typeof clearUnreadChat === 'function') clearUnreadChat(); } catch (e) {}
      document.body.classList.remove('in-game');
      [ 'admin-close-btn', 'admin-close-mob',
        'admin-start-btn', 'admin-start-mob',
        'admin-kick-btn', 'admin-kick-mob',
        'g-admin-badge', 'g-spectator-banner', 'g-endgame-overlay'
      ].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
    },

    leaveGame() {
      // Offline (vs bots) returns to the lobby just like online: the fake
      // server closes the current game (GameListUpdate=closed) on leave, so the
      // lobby ends up clean and the user can create another table.
      // Send proper leave request then stay connected (return to lobby)
      if (ws && gId) { try { send(MSG.buildLeaveGame(gId)); } catch(e) {} }
      // Départ volontaire : oublier le marqueur de reprise (sinon on serait
      // ré-aspiré dans la table à la prochaine reconnexion/réouverture).
      _pendingRejoin = 0; _rejoinNickRetries = 0;
      try { localStorage.removeItem('pth_resume'); } catch(e) {}
      amInGame = false; amGameAdmin = false; _gameStarted = false; _seatsFrozen = false; _amSpectator = false; var _sb2 = document.getElementById('g-spectator-banner'); if (_sb2) _sb2.style.display = 'none';
      gId = 0; seats = []; seatData = {}; _specPids = new Set();
      var _ego = document.getElementById('g-endgame-overlay');
      if (_ego) _ego.style.display = 'none';
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
      if (_reactMuted) return;                    // reactions coupees : on n'envoie rien
      if (!ws || !gId) return;
      // Affichage immediat pour moi.
      handleIncomingReaction(myId, emoji, 'self');
      // Canal rapide web<->web via le proxy (trame texte, contourne le throttle chat serveur).
      if (!directWS && ws.readyState === WebSocket.OPEN) {
        try { ws.send('REACT:' + myId + ':' + emoji); } catch (e) {}
      }
      // Canal partage cross-client : commande /emoji interpretee comme une reaction par
      // tous les clients (convention sp0ck, facon /me) -> interop web <-> Qt/QML (dont pokerth.net).
      // Régulé via une file (anti-flood chat serveur) : voir _queueReactEmoji.
      _queueReactEmoji(emoji);
    },

    // Bascule le mute local des reactions (bouton barre dans le panneau).
    toggleReactionsMute() {
      _reactMuted = !_reactMuted;
      try { localStorage.setItem('pth_react_muted', _reactMuted ? '1' : '0'); } catch (e) {}
      _applyReactMuteUI();
    },

    sendGameChat() {
      var input = document.getElementById('g-chat-in');
      if (!input) return;
      var text = input.value.trim();
      if (!text || !ws) return;
      input.value = '';
      _lastMsgWasReaction = false;
      send(gId ? MSG.buildGameChat(gId, text) : MSG.buildChat(text));
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
    // ── Copy a shareable link to the current table ──────────────
    // Produces a URL like:
    //   https://<thispage>/?host=your-server.example&port=7234&tls=0&table=72
    // When a guest opens it, parseShareLink() (run at load) prefills
    // the connect form with host/port/tls and stashes the table id;
    // after the lobby loads we auto-join that table (see the
    // _pendingAutoJoin logic in the GameListNew handler).
    //
    // The link is copied to the clipboard via the async Clipboard
    // API with a legacy execCommand fallback for older / insecure
    // (non-HTTPS) contexts where navigator.clipboard is unavailable.
    copyTableLink() {
      var fr = (typeof _lang === 'undefined' || _lang !== 'en');
      if (!gId) {
        if (typeof showKeyHint === 'function')
          showKeyHint(t('noActiveTable'));
        return;
      }
      // Pull the connection params the user actually connected with.
      var host = '', port = '', tls = '0';
      try { host = (document.getElementById('host')  || {}).value || ''; } catch(e) {}
      try { port = (document.getElementById('port')  || {}).value || ''; } catch(e) {}
      try { tls  = (document.getElementById('use-tls') && document.getElementById('use-tls').checked) ? '1' : '0'; } catch(e) {}
      host = String(host).trim();
      port = String(port).trim();
      // Build the URL from the current page origin + path (so it works
      // whatever domain the client is served from), with our params.
      var base = window.location.origin + window.location.pathname;
      var qs = 'host=' + encodeURIComponent(host) +
               '&port=' + encodeURIComponent(port) +
               '&tls=' + tls +
               '&table=' + encodeURIComponent(gId);
      var url = base + '?' + qs;

      // Copy with graceful fallbacks.
      function done(ok) {
        if (typeof showKeyHint === 'function') {
          showKeyHint(ok
            ? t('linkCopied')
            : t('linkCopyFailed'));
        }
        // Reflect status on the modal button if present.
        var btn = document.getElementById('gim-copy-link-btn');
        if (btn) {
          var orig = btn.getAttribute('data-orig') || btn.innerHTML;
          btn.setAttribute('data-orig', orig);
          btn.innerHTML = ok ? '✓ ' + t('copiedShort') : '⚠';
          setTimeout(function(){ btn.innerHTML = orig; }, 1800);
        }
        if (!ok) {
          // Last resort: show the URL so the user can copy by hand.
          try { window.prompt(t('copyThisLink'), url); } catch(e) {}
        }
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function(){ done(true); }, function(){ legacyCopy(); });
        } else {
          legacyCopy();
        }
      } catch(e) { legacyCopy(); }

      function legacyCopy() {
        try {
          var ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus(); ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          done(!!ok);
        } catch(e) { done(false); }
      }
    },

    spectateGame(gameId) {
      var g = games[gameId];
      if (!g) return;
      // Remember that we joined as spectator. Used by JoinGameAck to flip
      // the UI into 'watch only' mode (banner up top, action area replaced
      // with a message instead of fold/call buttons).
      _amSpectator = true;
      addChat(null, '👁 ' + t('spectatingTable') + (g.name||('#'+gameId)) + '…', 'sys', { prefix: '👁 ', key: 'spectatingTable', suffix: (g.name||('#'+gameId)) + '…' });
      // Use the shared MSG.buildJoinGame helper which now correctly
      // encodes spectateOnly into field 4. The previous hand-rolled
      // message set field 3 (autoLeave) instead, which the server did
      // not interpret as spectate, and silently dropped the request —
      // the user saw 'Joining…' but never got a JoinGameAck back.
      send(MSG.buildJoinGame(gameId, true));
    },

    autoJoinOrCreate() {
      // ⚡ Quick Game button. Two paths:
      //   1) A joinable table (not started, not full) exists → join it
      //      directly, no questions asked.
      //   2) No joinable table → ask the user how many players the new
      //      table should support via the quick-create modal. Avoids
      //      the previous behaviour of silently creating a 2-player
      //      table (too restrictive on busy servers).
      let target = null;
      for (const id of Object.keys(games)) {
        const g = games[id];
        if (g && !g.started && g.players < g.maxPlayers) { target = id; break; }
      }
      if (target) {
        autoAction = true;
        const btn = document.getElementById('btn-autojoin');
        if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }
        addChat(null, t('autoTableFound', { n: target }), 'sys', { key: 'autoTableFound', params: { n: target } });
        send(MSG.buildJoinGame(parseInt(target), false));
      } else {
        // No table — show the player-count dialog. The actual CreateGame
        // is dispatched by confirmQuickCreate() if the user confirms.
        // Pre-fill the player-count field with the per-mode default (2
        // for LAN/private, 5 for pokerth.net public).
        this._applyCreateFormDefaults(false);
        var qc = document.getElementById('quick-create-dialog');
        if (qc) qc.style.display = 'flex';
      }
    },

    confirmQuickCreate() {
      // 'Create' clicked in the quick-create dialog. Read the player
      // count, clamp to the allowed range 2..10, and dispatch the
      // CreateGame request with the same other defaults the previous
      // hardcoded path used (10s blind / 3000 stack / 30s timeout).
      var qc = document.getElementById('quick-create-dialog');
      var inp = document.getElementById('qc-players');
      var n = parseInt(inp && inp.value, 10);
      if (!Number.isFinite(n)) n = 5;
      if (n < 2) n = 2;
      if (n > 10) n = 10;
      if (qc) qc.style.display = 'none';
      autoAction = true;
      const btn = document.getElementById('btn-autojoin');
      if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }
      addChat(null, t('autoNoTable'), 'sys', { key: 'autoNoTable' });
      // Use the per-login-mode defaults so a Quick Game on pokerth.net
      // behaves like the public server (30s timeout) and a Quick Game on
      // a LAN/private box stays snappy (15s).
      var d = this._getCreateDefaults();
      // Suffixe court aléatoire : évite la collision avec une table du même nom
      // qui traînerait encore (session « fantôme » gardée par la grâce proxy),
      // ce qui ferait échouer/fermer la création côté serveur.
      var _autoName = 'WebGame-' + myName + '-' + Math.random().toString(36).slice(2, 5);
      send(MSG.buildCreateGame(_safeGameName(_autoName), n, d.blind, d.stack, d.timeout));
    },

    cancelQuickCreate() {
      // 'Cancel' clicked — just close the dialog and leave the lobby
      // alone. The Quick Game button is NOT disabled in this path, so
      // the user can try again right away.
      var qc = document.getElementById('quick-create-dialog');
      if (qc) qc.style.display = 'none';
    },

    joinGameWithPassword(gameId, pass) {
      var g = games[gameId];
      var gName = g ? g.name : '#' + gameId;
      addChat(null, 'Joining "' + esc(gName) + '"...', 'sys');
      // JoinExistingGameMessage: gameId=1, password=2
      var msg = Proto.encode([[1,0,gameId],[2,2,pass||'']]);
      send(Proto.encode([[1,0,21],[22,2,msg]]));
    },
    toggleTablePlayers(gid) {
      const key = String(gid);
      if (_openTables.has(key)) _openTables.delete(key); else _openTables.add(key);
      renderGames();
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
    setTableFilter(f) {
      if (['all','open','nopass','live'].indexOf(f) === -1) f = 'all';
      _tableFilter = f;
      try { localStorage.setItem('pth_table_filter', f); } catch(e) {}
      renderGames();
    },
    dismissWinner() { dismissWinner(); },
    doAction(action, bet) { doAction(action, bet); },
    confirmCall(action, amount) { confirmCall(action, amount); },
    doRaise() { doRaise(); },

    // ── Per-login-mode CreateGame defaults ───────────────────────────────
    //
    // The form should feel different depending on who's likely to be on the
    // other side of the table:
    //   • LAN / Private server (unauth) → friends & family. Small table (5
    //     seats), short 15s timeout, "fill with bots" pre-checked so you
    //     can start dealing as soon as 2 humans have joined.
    //   • pokerth.net (guest / registered) → public strangers. Standard 8-
    //     seat full ring, longer 30s timeout to give players time to think,
    //     blinds rise every 10 hands (slower), bots OFF by default and the
    //     minimum-humans-before-bots fallback set higher (5).
    //
    // Returns an object whose keys map 1:1 to the form's element ids (minus
    // the 'cf-' prefix). _applyCreateFormDefaults() walks this object and
    // writes each value into the corresponding input.
    _getCreateDefaults(skipSaved) {
      var mode = _currentLoginMode || 'unauth';
      var isPublic = (mode === 'guest' || mode === 'auth');
      // Last-used settings (saved by createGame) take priority over the
      // per-mode baseline, so the form re-opens with what the user actually
      // used last time. The table name is never restored — always fresh.
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem('pth_last_create') || 'null'); } catch (e) { saved = null; }
      var withSaved = function (base) {
        if (saved && typeof saved === 'object') {
          for (var k in saved) {
            // Copy every saved key except the table name (always fresh).
            // Advanced keys (raiseMode, gameType…) aren't in the baseline
            // object, so we must NOT require hasOwnProperty here.
            if (k !== 'name' && saved[k] != null) base[k] = saved[k];
          }
        }
        return base;
      };
      // Admin-set table defaults (from /app-config) override the per-mode baseline,
      // but a player's own last-used settings still win (withSaved runs after this).
      var withAdmin = function (base) {
        var a = window._adminTableDefaults;
        if (a && typeof a === 'object') ['players', 'blind', 'stack', 'timeout'].forEach(function (k) { if (a[k] != null && a[k] !== '') base[k] = a[k]; });
        return base;
      };
      if (isPublic) {
        // Defaults for pokerth.net (guest + registered). 10 max players
        // and 3000-stack/blind-10/raise-every-7 follow the desktop
        // client recommendation, BUT narmod requested a SHORT 5s
        // turn timer on pokerth.net so public games keep moving (real
        // strangers, can't afford long thinking turns).
        var basePublic = {
          name: _defaultNameForMode(),
          players: 10,
          blind: 10,
          stack: 3000,
          timeout: 5,
          raiseEvery: 7,
          guiSpeed: 5,
          delayHands: 7,
          bots: false,
          minHumans: 5,
          tag: 'public', // for the QuickGame dialog
        };
        return skipSaved ? withAdmin(basePublic) : withSaved(withAdmin(basePublic));
      }
      // LAN / private-server profile (covers both the 'lan' login mode
      // and the 'unauth' private-server-guest mode). 10 max players
      // like everywhere, but a more relaxed 15s turn timer than the
      // pokerth.net public profile — narmod wants more thinking time
      // when playing among friends. Bots default ON so a small group
      // can start a hand fast.
      var baseLan = {
        name: _defaultNameForMode(),
        players: 10,
        blind: 10,
        stack: 3000,
        timeout: 15,
        raiseEvery: 7,
        guiSpeed: 5,
        delayHands: 7,
        bots: true,
        minHumans: 2,
        tag: 'lan',
      };
      return skipSaved ? withAdmin(baseLan) : withSaved(withAdmin(baseLan));
    },

    // Apply the per-mode defaults to the create-form inputs. We only
    // overwrite empty fields (or fields still holding the previous mode's
    // default) so a user who already typed a custom value isn't surprised
    // by their input being clobbered.
    _applyCreateFormDefaults(force, skipSaved) {
      var d = this._getCreateDefaults(skipSaved);
      var set = function(id, val, options) {
        var el = document.getElementById(id);
        if (!el) return;
        var isCheckbox = el.type === 'checkbox';
        var current = isCheckbox ? el.checked : el.value;
        var defaultMarker = el.dataset.modeDefault; // last value we wrote ourselves
        // Don't overwrite if the user typed something different from our
        // previous default. Force=true (form just opened) always rewrites.
        if (!force && defaultMarker !== undefined && current !== defaultMarker) return;
        if (isCheckbox) {
          el.checked = !!val;
        } else {
          el.value = val;
          el.dispatchEvent(new Event('input'));
        }
        el.dataset.modeDefault = isCheckbox ? (!!val) : String(val);
      };
      set('cf-name',        d.name);
      set('cf-players',     d.players);
      set('cf-blind',       d.blind);
      set('cf-stack',       d.stack);
      set('cf-timeout',     d.timeout);
      set('cf-raise-every', d.raiseEvery);
      set('cf-gui-speed',   d.guiSpeed);
      set('cf-delay',       d.delayHands);
      set('cf-bots',        d.bots);
      set('cf-min-humans',  d.minHumans);
      // Advanced options: only present in `d` when restored from a saved
      // session (withSaved copies them in). Apply them when available so the
      // "More options" panel also reflects the last-used config.
      if (d.raiseMode     != null) set('cf-raise-mode',   d.raiseMode);
      if (d.endRaiseMode  != null) set('cf-end-raise',    d.endRaiseMode);
      if (d.endRaiseValue != null) set('cf-end-raise-val',d.endRaiseValue);
      if (d.gameType      != null) set('cf-game-type',    d.gameType);
      if (d.allowSpectators != null) {
        var asEl = document.getElementById('cf-allow-spectators');
        if (asEl) asEl.value = d.allowSpectators ? '1' : '0';
      }
      // Sync the "min humans before bots" row visibility with the checkbox.
      var mhRow = document.getElementById('cf-min-humans-row');
      if (mhRow) mhRow.style.display = d.bots ? 'flex' : 'none';
      // Same for the QuickGame dialog default
      var qc = document.getElementById('qc-players');
      if (qc) {
        var qcCurrent = qc.value;
        var qcMarker = qc.dataset.modeDefault;
        if (force || qcMarker === undefined || qcCurrent === qcMarker) {
          // narmod wants 10 max players by default everywhere, so the
          // quick-game dialog mirrors d.players (the per-mode default).
          qc.value = d.players;
          qc.dataset.modeDefault = qc.value;
        }
      }
      // Bot difficulty is only meaningful in Training (offline) mode — show the
      // pills there and highlight the saved choice.
      var skRow = document.getElementById('cf-skill-row');
      if (skRow) {
        skRow.style.display = window._offlineMode ? '' : 'none';
        if (window._offlineMode && this.setBotSkill) {
          var _sk = 'mixed';
          try { _sk = localStorage.getItem('pth_offline_skill') || 'mixed'; } catch (e) {}
          this.setBotSkill(_sk);
        }
      }
    },

    toggleCreateForm() {
      var f = document.getElementById('create-form');
      if (!f) return;
      var open = !f.classList.contains('open');
      f.classList.toggle('open', open);
      f.style.display = open ? 'block' : 'none';
      // Apply per-login-mode defaults the first time the form opens (or
      // whenever the user has not yet customized a field).
      if (open) this._applyCreateFormDefaults(false);
      // Rotate the header toggle arrow / square off its bottom corners.
      var btn = document.getElementById('create-toggle-btn');
      if (btn) btn.classList.toggle('open', open);
    },
    // Quick-style presets: fill the create-form numeric fields in one tap.
    // The full form stays fully editable afterwards — presets are just a
    // friendly starting point (kid-friendly: Relaxed / Normal / Fast).
    // Difficulty pills (Training mode): persist the choice and highlight it.
    setBotSkill(v, btn) {
      try { localStorage.setItem('pth_offline_skill', v); } catch (e) {}
      var all = document.querySelectorAll('#cf-skill-pills .cf-preset');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      var sel = btn || document.querySelector('#cf-skill-pills .cf-preset[data-skill="' + v + '"]');
      if (sel) sel.classList.add('active');
    },

    applyPreset(name, btn) {
      var P = {
        tranquille: { players:8, stack:5000, blind:10, timeout:30 },
        normal:     { players:6, stack:3000, blind:10, timeout:15 },
        rapide:     { players:6, stack:1500, blind:25, timeout:5  }
      };
      var v = P[name];
      if (!v) return;
      var set = function(id, val){ var e = document.getElementById(id); if (e) { e.value = val; e.dispatchEvent(new Event('input')); } };
      set('cf-players', v.players);
      set('cf-stack',   v.stack);
      set('cf-blind',   v.blind);
      set('cf-timeout', v.timeout);
      var all = document.querySelectorAll('.cf-preset');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      var sel = btn || document.querySelector('.cf-preset[data-preset="' + name + '"]');
      if (sel) sel.classList.add('active');
    },
    // ── Synchronisation curseur ↔ champ chiffré éditable ──
    // Le champ chiffré (id cf-players / cf-stack) est la valeur lue par
    // createGame ; le curseur (…-range) le pilote et inversement.
    numFromRange(numId, rangeEl) {
      var n = document.getElementById(numId);
      if (n) n.value = rangeEl.value;
    },
    rangeFromNum(rangeId, numEl) {
      var r = document.getElementById(rangeId);
      if (!r) return;
      var v = parseInt(numEl.value, 10);
      if (!isNaN(v)) r.value = v;   // le curseur borne tout seul l'affichage
    },
    clampNum(el) {
      var v = parseInt(el.value, 10);
      var mn = parseInt(el.min, 10), mx = parseInt(el.max, 10);
      if (isNaN(v)) v = isNaN(mn) ? 0 : mn;
      if (!isNaN(mn) && v < mn) v = mn;
      if (!isNaN(mx) && v > mx) v = mx;
      el.value = v;
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
    // Reset the create-table form to its FACTORY defaults: the per-mode
    // baseline (LAN vs pokerth.net), explicitly IGNORING the last-used
    // settings saved in localStorage (skipSaved=true). Resets every field —
    // visible and hidden — plus the collapsible panels, presets and password
    // section, then confirms with a toast styled like the header ••• menu.
    resetCreateForm() {
      // Core + numeric fields (and their linked range sliders, via the
      // 'input' event dispatched inside _applyCreateFormDefaults).
      this._applyCreateFormDefaults(true, true);
      // Advanced options aren't part of the baseline object, so restore their
      // markup defaults explicitly.
      var setVal = function(id, v) {
        var e = document.getElementById(id);
        if (e) { e.value = v; e.dispatchEvent(new Event('input')); }
      };
      setVal('cf-raise-mode',       '1');
      setVal('cf-end-raise',        '1');
      setVal('cf-end-raise-val',    '200');
      setVal('cf-game-type',        '1');
      setVal('cf-allow-spectators', '1');
      // Password section back to off / empty / hidden.
      var pw  = document.getElementById('cf-use-password'); if (pw)  pw.checked = false;
      var pwv = document.getElementById('cf-password');     if (pwv) pwv.value = '';
      var pwr = document.getElementById('cf-password-row'); if (pwr) pwr.style.display = 'none';
      // Collapse "More options" back to its default closed state.
      var mo  = document.getElementById('cf-more-opts');   if (mo)  mo.style.display = 'none';
      var moa = document.getElementById('cf-more-arrow');  if (moa) moa.textContent = '\u25B6';
      var mol = document.getElementById('cf-more-label');  if (mol) mol.textContent = (t('moreOptions') || 'More options');
      // Hide the conditional "target blind" row.
      var erv = document.getElementById('cf-end-raise-val-row'); if (erv) erv.style.display = 'none';
      // Clear any highlighted style preset.
      var presets = document.querySelectorAll('.cf-preset');
      for (var i = 0; i < presets.length; i++) presets[i].classList.remove('active');
      // Confirmation toast.
      if (typeof showToast === 'function') showToast(t('fieldsReset') || 'Fields reset');
    },
    startWithBots() {
      if (!gId) return;
      addGameChat(null, '▶ Starting with bots…', 'sys');
      send(MSG.buildStartWithBots(gId, true));
    },
    // Start the game with the humans currently at the table and NO
    // auto-filling with bots. Same StartEventMessage as startWithBots,
    // just with fillWithComputerPlayers = false.
    //
    // Per the user-validated design (Q1=b): button is only shown when
    // there are at least 2 humans at the table — startWithoutBotsButtonVisible()
    // updates its visibility on every join / leave / player-info event.
    // We re-check the count here defensively because the visibility
    // is just UI gating, not enforcement.
    startNoBots() {
      if (!gId) return;
      // Same counting heuristic as refreshStartNoBotsVisibility() AND
      // renderWaitingPanel(): seatData pids with .gone falsy, PLUS myId
      // if missing (the server doesn't always echo GamePlayerJoined for
      // ourselves, especially when we're the admin who just created the
      // table — myId never enters seatData via that path).
      // BUG FIX: previously this counted only seatData and refused with
      // "At least 2 players are needed" even though the visible panel
      // showed "Joueurs: 2/5" (because the renderer DID inject myId).
      var pids = Object.keys(seatData)
        .map(function(s){ return parseInt(s,10); })
        .filter(function(p){ return seatData[p] && !seatData[p].gone; });
      if (myId && pids.indexOf(myId) === -1) pids.push(myId);
      if (pids.length < 2) {
        // Should never reach here because the button is hidden when
        // pids.length < 2, but catch it anyway so a stray click on a
        // stale UI can't send a bad request to the server.
        var fr = (typeof _lang === 'undefined' || _lang !== 'en');
        addGameChat(null, '⚠ ' + t('kickAtLeast2'), 'sys', { prefix: '⚠ ', key: 'kickAtLeast2' });
        return;
      }
      addGameChat(null, '▶ Starting (humans only)…', 'sys');
      send(MSG.buildStartWithBots(gId, false));
    },
    createGame() {
      const g = id => document.getElementById(id);
      const iv = (id, def) => parseInt(g(id)?.value) || def;
      const sv = (id, def) => parseInt(g(id)?.value) || def;
      // Guard rail: align with the PokerTH game-name length limit. Refuse to
      // create (with a clear, translated message) when the typed name is too
      // long, instead of letting the server reject it.
      const rawName = (g('cf-name')?.value || '').trim();
      if (rawName.length > MAX_GAME_NAME) {
        if (typeof showToast === 'function') {
          showToast(t('nameTooLong', { max: MAX_GAME_NAME }), { icon: '\u26A0', tone: 'error', duration: 3500 });
        }
        return;
      }
      const name    = _safeGameName(rawName || _defaultNameForMode());
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
      gameStartMoney = stack;  // same idea for the starting stack: the
                               // GameListNew message will eventually echo
                               // this back, but writing it here ensures
                               // it's available immediately for our own
                               // JoinGameAck → GameStartInitial pipeline.
      const tablePass = (document.getElementById('cf-use-password')?.checked) ? (document.getElementById('cf-password')?.value || '') : '';
      // Spectators are allowed by default (true) when the field is missing
      // (older clients, or when the form hasn't been opened) — matches the
      // proto's default. The UI dropdown sends '1' = allowed, '0' = blocked.
      const allowSpecRaw = document.getElementById('cf-allow-spectators');
      const allowSpec = allowSpecRaw ? (allowSpecRaw.value !== '0') : true;
      const opts = {
        raiseMode:       sv('cf-raise-mode',    1),
        raiseEvery:      iv('cf-raise-every',   7),
        endRaiseMode:    sv('cf-end-raise',     1),
        endRaiseValue:   iv('cf-end-raise-val', 200),
        guiSpeed:        iv('cf-gui-speed',     5),
        delayHands:      iv('cf-delay',         7),
        gameType:        sv('cf-game-type',     1),
        allowSpectators: allowSpec,
        password:        tablePass,
      };
      addChat(null, '+ Creating "' + name + '" (' + nplayers + 'p' + (bots ? ' + bots' : '') + ')...', 'sys');
      send(MSG.buildCreateGame(name, nplayers, blind, stack, timeout, opts));
      // Remember these settings so the next time the create form opens it
      // starts from what the user actually used last (not just the per-mode
      // default). Display-only convenience; the name itself is intentionally
      // NOT saved (it's re-generated fresh each time via _localDefaultName).
      try {
        localStorage.setItem('pth_last_create', JSON.stringify({
          players: nplayers, blind: blind, stack: stack, timeout: timeout,
          raiseEvery: opts.raiseEvery, guiSpeed: opts.guiSpeed,
          delayHands: opts.delayHands, bots: bots, minHumans: minHuman,
          raiseMode: opts.raiseMode, endRaiseMode: opts.endRaiseMode,
          endRaiseValue: opts.endRaiseValue, gameType: opts.gameType,
          allowSpectators: opts.allowSpectators,
        }));
      } catch (e) {}
      var f = document.getElementById('create-form');
      if (f) { f.style.display = 'none'; f.classList.remove('open'); }
    },
    getLobbyState() {
      // Read-only snapshot of the bits the players-panel renderer
      // needs. Returning a fresh object each time so the consumer
      // can sort/filter freely without affecting our internal state.
      return {
        pids:    Array.from(_lobbyPids),
        players: players,
        myId:    myId,
        countries: _playerCountries,
        rights:    _playerRights,
        flagOf:  function(pid) { return _ccToFlag(_playerCountries[pid]); },
      };
    },

    onRememberMe() {
      // Legacy no-op. The 'Remember nickname' checkbox was removed
      // in favour of automatic per-mode persistence. Kept as a stub
      // so any older HTML cached by a Service Worker doesn't 500
      // when its onchange handler fires.
    },
  };
})();

// Bridge: window-scope getters so the players-panel renderer
// (defined outside the IIFE) can read the IIFE-private state.
// Defined right after the IIFE so the closures capture the latest
// references. The renderer falls back to empty data if these
// haven't been set up yet.
window._readLobbyPids = function() {
  // We can't access _lobbyPids directly from out here. Instead we
  // proxy through App.getLobbyState() which the IIFE will expose.
  if (typeof App !== 'undefined' && App.getLobbyState) {
    var s = App.getLobbyState();
    return s.pids || [];
  }
  return [];
};
window._readPlayers = function() {
  if (typeof App !== 'undefined' && App.getLobbyState) {
    var s = App.getLobbyState();
    return s.players || {};
  }
  return {};
};
window._readMyId = function() {
  if (typeof App !== 'undefined' && App.getLobbyState) {
    var s = App.getLobbyState();
    return s.myId || 0;
  }
  return 0;
};


// ── Game chat (mirrors lobby addChat) ──
function addGameChat(sender, text, cls, spec) {
  if (sender && cls !== 'mine' && _isIgnored(sender)) return; // joueur ignoré
  var el = document.getElementById('g-chat-msgs');
  if (!el) return;
  if (sender) { try { if (localStorage.getItem('pth_chat_noemoji') === '1') text = _advStripEmoji(text); } catch (e) {} }
  var d = document.createElement('div');
  d.className = 'msg ' + (cls || '');
  function e(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  if (sender) {
    d.innerHTML = '<span class="who">'+e(sender)+'</span>: <span class="txt">'+e(text)+'</span>';
  } else {
    d.innerHTML = '<span class="txt">'+e(text)+'</span>';
  }
  if (spec && !sender) { try { d.dataset.sys = JSON.stringify(spec); } catch(_e){} }
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
  var cBtn = document.getElementById('chat-toggle-btn');
  var cPan = document.getElementById('g-chat-panel');
  if (cBtn && cls !== 'mine' && (!cPan || cPan.style.display === 'none')) {
    cBtn.style.color = 'var(--gold)';
    cBtn.style.borderColor = 'var(--gold-dim)';
    if (typeof bumpUnreadChat === 'function') bumpUnreadChat();
    clearTimeout(window._chatFlashTimer);
    window._chatFlashTimer = setTimeout(function(){
      if (!cPan || cPan.style.display === 'none') { cBtn.style.color=''; cBtn.style.borderColor=''; }
    }, 3000);
    if (typeof notifyChat === 'function') notifyChat();
  }
}

// Re-traduit en direct les messages systeme (cls 'sys') deja affiches dans
// les deux panneaux de chat quand la langue change. Les messages tapes par
// les joueurs (texte libre) ne sont pas touches. Appele depuis setLang().
window._retranslateSysChat = function() {
  ['chat', 'g-chat-msgs'].forEach(function(id) {
    var c = document.getElementById(id); if (!c) return;
    c.querySelectorAll('.msg[data-sys]').forEach(function(d) {
      var s; try { s = JSON.parse(d.dataset.sys); } catch (e) { return; }
      if (!s || !s.key) return;
      var tr = (typeof window.t === 'function') ? window.t(s.key, s.params || {}) : s.key;
      var txt = (s.prefix || '') + tr + (s.suffix || '');
      var span = d.querySelector('.txt');
      if (span) span.textContent = txt;
    });
  });
  // Le journal se re-traduit aussi : ses lignes sont des thunks rejoués ici.
  if (typeof window._retranslateLog === 'function') { try { window._retranslateLog(); } catch (_e) {} }
};

// click handled via inline onclick on game-row

window.addEventListener('resize', function() {
  if (typeof updateBottomLayout === 'function') updateBottomLayout();
  autoScaleTable();
  setTimeout(function(){ if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 100);
});
window.addEventListener('orientationchange', function() {
  setTimeout(function(){ autoScaleTable(); if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 300);
});

// ── Zoom de la table (tablette/desktop) ─────────────────────
// Deux boutons +/- en haut a droite reduisent/re-agrandissent #g-table-zone
// (feutre + cartes communes + adversaires) via transform:scale. La barre
// joueur (.player-bar) et la barre d'action (#g-actions) sont DEHORS de
// #g-table-zone -> elles ne bougent pas. Contrainte : max = taille actuelle
// (1.0) ; on ne peut que reduire puis re-agrandir jusqu'a 1.0, donc jamais de
// depassement (ni clip ni pan). transform:scale est purement visuel -> se
// compose avec autoScaleTable (qui agit sur #g-table-scaler) et survit aux
// re-rendus de sieges. Neutralise + masque sur mobile.
var TABLE_ZOOM_MIN = 0.6, TABLE_ZOOM_MAX = 1, TABLE_ZOOM_STEP = 0.1;
function _tableZoomGate() {
  return !!(window.matchMedia && window.matchMedia('(min-width: 900px) and (min-height: 600px)').matches);
}
function _getTableZoom() {
  var z = NaN;
  try { z = parseFloat(localStorage.getItem('pth_table_zoom')); } catch (e) {}
  if (isNaN(z)) z = TABLE_ZOOM_MAX;
  return Math.max(TABLE_ZOOM_MIN, Math.min(TABLE_ZOOM_MAX, z));
}
function applyTableZoom() {
  // Le zoom n'est PAS un transform sur #g-table-zone : renderSeats mesure
  // #g-table-zone via getBoundingClientRect (valeurs scalees par un transform),
  // donc scaler ici laissait les sieges ecartes (positions pleine taille). A la
  // place : autoScaleTable multiplie l'echelle du FEUTRE par le zoom (feutre +
  // cartes), et renderSeats replace les sieges autour du feutre reduit ET met
  // chaque siege a l'echelle du zoom (avatars). Resultat : zoom uniforme, les
  // sieges suivent. On purge tout transform residuel sur #g-table-zone.
  var tz = document.getElementById('g-table-zone');
  if (tz && tz.style.transform) tz.style.transform = '';
  try { if (typeof autoScaleTable === 'function') autoScaleTable(); } catch (e) {}
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
  var z = _tableZoomGate() ? _getTableZoom() : TABLE_ZOOM_MAX;
  var bOut = document.getElementById('g-zoom-out');
  var bIn  = document.getElementById('g-zoom-in');
  if (bOut) bOut.disabled = (z <= TABLE_ZOOM_MIN + 0.001);
  if (bIn)  bIn.disabled  = (z >= TABLE_ZOOM_MAX - 0.001);
}
function tableZoomStep(dir) {
  var z = _getTableZoom() + (dir > 0 ? TABLE_ZOOM_STEP : -TABLE_ZOOM_STEP);
  z = Math.round(z * 100) / 100;
  z = Math.max(TABLE_ZOOM_MIN, Math.min(TABLE_ZOOM_MAX, z));
  try { localStorage.setItem('pth_table_zoom', String(z)); } catch (e) {}
  applyTableZoom();
}
window.tableZoomStep = tableZoomStep;
window.applyTableZoom = applyTableZoom;
document.addEventListener('DOMContentLoaded', function() { setTimeout(applyTableZoom, 500); });
window.addEventListener('resize', function() { applyTableZoom(); });

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
  // Sur desktop, on autorise jusqu'à 1.4 max
  // Sur mobile, on peut réduire en dessous de 1 pour tout faire tenir
  var isDeskScale = window.innerWidth >= 900 && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var _narrowPortrait = window.innerWidth < 540 && window.innerHeight > window.innerWidth;
  var scaleMax = isDeskScale ? 1.4 : (_narrowPortrait ? 0.74 : 1);
  var scale = Math.min(scaleMax, tzW / scW, tzH / scH);
  if (scale < 0.05) scale = 0.5; // fallback visible
  var _ztab = (typeof _getTableZoom === 'function' && typeof _tableZoomGate === 'function' && _tableZoomGate()) ? _getTableZoom() : 1;
  sc.style.transform = 'scale(' + (scale * _ztab).toFixed(3) + ')';
  sc.style.transformOrigin = 'center center';
}
document.addEventListener('DOMContentLoaded', function() { setTimeout(autoScaleTable, 400); });

// ── Chat redimensionnable au doigt ──────────────────────────────
// Ajoute une poignée en bas du panneau. Le glissement (Pointer Events
// = tactile + souris) ajuste la hauteur de la zone messages, bornée à
// [50px, 75% de l'écran]. Le chat s'ouvre à sa taille par défaut ; pas
// de restauration entre sessions (les styles inline posés au glissement
// persistent tant que la page vit, puis repartent au défaut au reload).
// Idempotent : la poignée n'est créée qu'une fois (guard _resizable).
// Marge entre le bas d'un panneau overlay du lobby (chat / joueurs) et le
// début de la carte « Créer une table ».
var LOBBY_PANEL_GAP = 14;

/* ════════════════════════════════════════════════════════════════════════
   FENETRES FLOTTANTES (deplacables / redimensionnables) — chat, journal,
   reactions. Active UNIQUEMENT par les gates :
     _winGate()  : largeur >= 900 px (tablette + desktop)  -> journal/reactions
     _chatGate() : >= 900 px ET souris (pointer:fine)       -> chat (desktop only)
   Sous le seuil, les panneaux restent en bandeau pleine largeur (inchange) et
   chat/journal y gardent leur resize vertical historique (makeChatResizable).
   Patron pointeur calque sur makeChatResizable (setPointerCapture).
   ════════════════════════════════════════════════════════════════════════ */
function _winGate(){ try{ return window.matchMedia('(min-width:900px) and (min-height:600px)').matches; }catch(e){ return false; } }
function _chatGate(){ try{ return window.matchMedia('(min-width:900px) and (hover:hover) and (pointer:fine)').matches; }catch(e){ return false; } }
function _placeWin(panel, left, top){
  // right/bottom:auto AVANT de mesurer : un panneau encore en base CSS
  // (left:0;right:0) mesurerait une largeur pleine et se collerait au bord.
  panel.style.right='auto';   panel.style.bottom='auto';
  var w=panel.offsetWidth, h=panel.offsetHeight, vw=window.innerWidth, vh=window.innerHeight;
  left=Math.max(4, Math.min(left, vw-w-4));
  top =Math.max(4, Math.min(top,  vh-h-4));
  panel.style.left=left+'px'; panel.style.top=top+'px';
}
function _saveWin(panel, key){
  if(!key) return;
  try{
    var r=panel.getBoundingClientRect(), d={left:Math.round(r.left), top:Math.round(r.top)};
    if(panel._winResizable){ d.width=Math.round(r.width); d.height=Math.round(r.height); }
    localStorage.setItem(key, JSON.stringify(d));
  }catch(e){}
}
function _restoreWin(panel, key){
  if(!key) return false;
  try{
    var raw=localStorage.getItem(key); if(!raw) return false;
    var d=JSON.parse(raw); if(!d || typeof d.left!=='number') return false;
    if(d.width)  panel.style.width =d.width +'px';
    if(d.height) panel.style.height=d.height+'px';
    _placeWin(panel, d.left, d.top);
    return true;
  }catch(e){ return false; }
}
function makeWinDraggable(panel, handle, key){
  if(!panel || !handle) return;
  handle.style.cursor='move'; handle.style.touchAction='none';
  if(panel._winDragWired) return;            // une seule fois par element
  panel._winDragWired=true;
  var sx=0, sy=0, sl=0, st=0, drag=false;
  handle.addEventListener('pointerdown', function(e){
    if(panel._winDrag===false) return;       // inerte hors mode flottant
    if(e.target.closest && e.target.closest('button')) return; // boutons d'en-tete
    _ensureFloating(panel, e);
    drag=true;
    var r=panel.getBoundingClientRect();
    sx=e.clientX; sy=e.clientY; sl=r.left; st=r.top;
    handle.classList.add('win-dragging');
    try{ handle.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  handle.addEventListener('pointermove', function(e){
    if(!drag) return;
    _placeWin(panel, sl+(e.clientX-sx), st+(e.clientY-sy));
  });
  function end(e){
    if(!drag) return; drag=false;
    handle.classList.remove('win-dragging');
    try{ handle.releasePointerCapture(e.pointerId); }catch(_){}
    _saveWin(panel, key);
  }
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}
function makeWinResizable(panel, key, minW, minH){
  if(!panel || panel._winRszWired) return;
  panel._winRszWired=true;
  minW=minW||240; minH=minH||140;
  ['n','s','e','w','ne','nw','se','sw'].forEach(function(dir){
    var h=document.createElement('div');
    h.className='win-rsz win-rsz-'+dir;
    panel.appendChild(h);
    var sx=0, sy=0, sw=0, sh=0, sl=0, st=0, on=false;
    h.addEventListener('pointerdown', function(e){
      _ensureFloating(panel);
      on=true;
      var r=panel.getBoundingClientRect();
      sx=e.clientX; sy=e.clientY; sw=r.width; sh=r.height; sl=r.left; st=r.top;
      panel.classList.add('win-resizing');
      try{ h.setPointerCapture(e.pointerId); }catch(_){}
      e.preventDefault(); e.stopPropagation();
    });
    h.addEventListener('pointermove', function(e){
      if(!on) return;
      var dx=e.clientX-sx, dy=e.clientY-sy, nl=sl, nt=st, nw=sw, nh=sh;
      if(dir.indexOf('e')>=0) nw=sw+dx;
      if(dir.indexOf('s')>=0) nh=sh+dy;
      if(dir.indexOf('w')>=0){ nw=sw-dx; nl=sl+dx; }
      if(dir.indexOf('n')>=0){ nh=sh-dy; nt=st+dy; }
      if(nw<minW){ if(dir.indexOf('w')>=0) nl-=(minW-nw); nw=minW; }
      if(nh<minH){ if(dir.indexOf('n')>=0) nt-=(minH-nh); nh=minH; }
      var vw=window.innerWidth, vh=window.innerHeight;
      nw=Math.min(nw, vw-8); nh=Math.min(nh, vh-8);
      panel.style.width=nw+'px'; panel.style.height=nh+'px';
      _placeWin(panel, nl, nt);
    });
    function end(e){
      if(!on) return; on=false;
      panel.classList.remove('win-resizing');
      try{ h.releasePointerCapture(e.pointerId); }catch(_){}
      _saveWin(panel, key);
    }
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
  });
}
function _enableFloating(panel, opt){
  if(!panel) return; opt=opt||{};
  panel.classList.add('floating-win');
  panel._winDrag=true; panel._winResizable=!!opt.resizable;
  panel.style.setProperty('max-height','none','important');
  var restored=_restoreWin(panel, opt.key);
  if(!restored){
    if(opt.resizable){
      if(!panel.style.width) panel.style.width=(opt.defW||340)+'px';
      panel.style.height=(opt.defH||300)+'px';
    }
    _placeWin(panel, (opt.defLeft!=null?opt.defLeft:16), (opt.defTop!=null?opt.defTop:56));
  }
  if(opt.handle) makeWinDraggable(panel, opt.handle, opt.key);
  if(opt.resizable) makeWinResizable(panel, opt.key, opt.minW, opt.minH);
}
function _disableFloating(panel){
  if(!panel || !panel.classList.contains('floating-win')) return;
  panel.classList.remove('floating-win');
  panel._winDrag=false; panel._winResizable=false;
  panel.style.removeProperty('max-height');
  ['left','top','right','bottom','width','height'].forEach(function(p){ panel.style[p]=''; });
  var hs=panel.querySelectorAll('.win-rsz');
  for(var i=0;i<hs.length;i++) hs[i].remove();
  panel._winRszWired=false;   // re-injectable si on repasse en flottant
}
window.addEventListener('resize', function(){
  ['g-chat-panel','lobby-chat-panel','g-log-panel','g-reaction-panel'].forEach(function(id){
    var p=document.getElementById(id);
    if(p && p.classList.contains('floating-win') && p.style.display!=='none'){
      var r=p.getBoundingClientRect(); _placeWin(p, r.left, r.top);
    }
  });
});

function _ensureFloating(panel, dragEv){
  // Promotion bandeau -> fenetre flottante au 1er drag/resize. No-op si deja
  // flottant ou si l'element n'a pas opte (panel._winOpt absent, ex. carte mains).
  if (!panel || panel.classList.contains('floating-win') || !panel._winOpt) return;
  var opt=panel._winOpt, r=panel.getBoundingClientRect();
  panel.classList.add('floating-win');
  panel._winDrag=true; panel._winResizable=!!opt.resizable;
  panel.style.setProperty('max-height','none','important');
  var newW=Math.round(r.width), newH=Math.round(r.height), left=r.left, top=r.top;
  // Detachement en TIRANT la barre de titre (dragEv present) : on retrecit en
  // vraie fenetre compacte, recentree sous le curseur (comme restaurer une
  // fenetre maximisee). Le resize (dragEv absent) garde la taille courante.
  if (dragEv){
    var dw=opt.defW||340, dh=opt.defH||300;
    // On FIXE les deux dimensions (et non "reduire si plus grand") : un bandeau
    // court comme reactions (1 rangee, ~120px) doit s'AGRANDIR a sa taille fenetre
    // pour montrer tous les emojis d'un coup.
    var relX=r.width ? (dragEv.clientX-r.left)/r.width : 0.5;
    left=Math.round(dragEv.clientX - relX*dw);
    newW=dw; newH=dh;
  }
  panel.style.width=newW+'px';
  panel.style.height=newH+'px';
  _placeWin(panel, left, top);
  if (opt.resizable) makeWinResizable(panel, opt.key, opt.minW, opt.minH);
  _saveWin(panel, opt.key);
}
function _attachFloatControls(panel, opt){
  // Ouvre "comme avant" (le bandeau garde sa position CSS) mais cable le drag +
  // les poignees de resize ; le panneau se detache en flottant au 1er geste.
  // Si une position a deja ete memorisee, rouvre directement en flottant.
  if (!panel) return;
  opt=opt||{}; panel._winOpt=opt;
  var hasSaved=false;
  try{ hasSaved=!!(opt.key && localStorage.getItem(opt.key)); }catch(e){}
  if (hasSaved){ _enableFloating(panel, opt); return; }
  panel._winDrag=true;
  if (opt.handle) makeWinDraggable(panel, opt.handle, opt.key);
  if (opt.resizable) makeWinResizable(panel, opt.key, opt.minW, opt.minH);
}
function _makeHandsDraggable(card){
  // Carte des combinaisons (memo des mains) : deplacable via son titre. Le
  // listener est pose sur la carte (persistante) car renderHandsHelp reconstruit
  // son innerHTML a chaque ouverture.
  if (!card || card._handsDragWired) return;
  card._handsDragWired=true;
  var sx=0, sy=0, sl=0, st=0, drag=false;
  card.addEventListener('pointerdown', function(e){
    if (!card.classList.contains('hands-floatable')) return;
    if (!(e.target.closest && e.target.closest('.hands-title'))) return;
    drag=true;
    var r=card.getBoundingClientRect();
    sx=e.clientX; sy=e.clientY; sl=r.left; st=r.top;
    try{ card.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  card.addEventListener('pointermove', function(e){
    if(!drag) return;
    _placeWin(card, sl+(e.clientX-sx), st+(e.clientY-sy));
  });
  function end(e){
    if(!drag) return; drag=false;
    try{ card.releasePointerCapture(e.pointerId); }catch(_){}
    _saveWin(card, 'pth_winpos_hands');
  }
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}
function resetWindows(){
  // Bouton reset du header (≥900px) : efface TOUTES les positions/tailles
  // memorisees et remet chaque fenetre a son etat par defaut (bandeau, ou
  // position CSS d'origine pour les fenetres flottantes).
  ['pth_winpos_chat','pth_winpos_lobbychat','pth_winpos_log2','pth_winpos_react','pth_winpos_theme','pth_winpos_hands','pth_winpos_music','pth_odds_pos','pth_odds_w','pth_assist_pos','pth_assist_w','pth_adv_pos','pth_adv_size'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
  ['g-chat-panel','lobby-chat-panel','g-log-panel','g-reaction-panel','music-panel'].forEach(function(id){ var p=document.getElementById(id); if(p) _disableFloating(p); });
  // Fenetres flottantes odds/assist : retire les styles inline -> retour aux defauts CSS.
  ['odds-monitor','assist-win'].forEach(function(id){ var el=document.getElementById(id); if(el){ ['left','top','right','bottom','width'].forEach(function(pr){ el.style[pr]=''; }); el.style.removeProperty('--ws'); } });
  var card=document.getElementById('hands-card-inner');
  if(card){
    card.classList.remove('hands-floatable');
    card._winResizable=false;
    var hs=card.querySelectorAll('.win-rsz'); for(var i=0;i<hs.length;i++) hs[i].remove();
    card._winRszWired=false;
    ['position','left','top','right','bottom','width','height'].forEach(function(p){ card.style[p]=''; });
  }
  try{ if (typeof window.closeThemePanel==='function') window.closeThemePanel(); }catch(e){}
}
function makeChatResizable(panel, msgs, onResize) {
  if (!panel || !msgs) return;
  panel._onResize = onResize || null;   // callback de suivi (mis à jour à chaque appel)
  if (panel._resizable) return;
  panel._resizable = true;
  // Mémorise les valeurs par défaut (styles inline d'origine) pour pouvoir
  // réinitialiser à la taille d'ouverture (cf. resetChatSize).
  panel._origMaxH = panel.style.maxHeight || '';
  msgs._origMaxH  = msgs.style.maxHeight || '';
  msgs._origFlex  = msgs.style.flex || '';

  var handle = document.createElement('div');
  handle.className = 'chat-resize-handle';
  handle.title = 'Glisser pour redimensionner';
  var grip = document.createElement('div');
  grip.className = 'crh-grip';
  handle.appendChild(grip);
  panel.appendChild(handle);

  var dragging = false, startY = 0, startH = 0;
  function maxH() { return Math.round(window.innerHeight * 0.6); } // 60% écran
  function clamp(h) { return Math.max(50, Math.min(maxH(), h)); }

  handle.addEventListener('pointerdown', function(e) {
    dragging = true;
    startY = e.clientY;
    startH = msgs.getBoundingClientRect().height;
    handle.classList.add('dragging');
    // Lève les plafonds (max-height CSS !important du chat en jeu,
    // max-height inline du chat lobby) pour laisser grandir le panneau.
    panel.style.setProperty('max-height', 'none', 'important');
    msgs.style.setProperty('max-height', 'none', 'important');
    msgs.style.flex = 'none';
    try { handle.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });
  handle.addEventListener('pointermove', function(e) {
    if (!dragging) return;
    msgs.style.height = clamp(startH + (e.clientY - startY)) + 'px';
    if (panel._onResize) panel._onResize();
  });
  function end(e) {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
    if (panel._onResize) panel._onResize();
  }
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
  // Re-borne si l'écran tourne / change de taille.
  window.addEventListener('resize', function() {
    if (msgs.style.height) msgs.style.height = clamp(parseInt(msgs.style.height, 10) || 0) + 'px';
  });
}

// Réinitialise un chat à sa taille d'ouverture par défaut (annule un
// éventuel glissement précédent) en restaurant les styles inline d'origine.
function resetChatSize(panel, msgs) {
  if (!panel || !msgs) return;
  panel.style.removeProperty('max-height');
  if (panel._origMaxH) panel.style.maxHeight = panel._origMaxH;
  msgs.style.height = '';
  msgs.style.removeProperty('max-height');
  if (msgs._origMaxH) msgs.style.maxHeight = msgs._origMaxH;
  msgs.style.flex = msgs._origFlex || '';
}

function toggleLobbyChat() {
  var panel = document.getElementById('lobby-chat-panel');
  var btn   = document.getElementById('lobby-chat-btn');
  if (!panel) return;
  var open = panel.style.display === 'none';
  panel.style.display = open ? 'flex' : 'none';
  if (btn) {
    btn.style.background  = open ? 'rgba(var(--gold-rgb),0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  var _lb = document.querySelector('#s-lobby .lobby-body');
  if (open) {
    var _pp = document.getElementById('players-panel');
    if (_pp) _pp.style.display = 'none';          // un seul panneau ouvert à la fois
    var _hdr = document.querySelector('#s-lobby .header');
    if (_hdr) panel.style.top = Math.round(_hdr.getBoundingClientRect().bottom) + 'px';
    var _chat = document.getElementById('chat');
    if (_chatGate()) {
      // Desktop souris : fenetre flottante (drag + resize + detachement), comme le
      // chat en jeu. Pas de reservation d'espace : elle flotte au-dessus des tables.
      if (_lb) _lb.style.paddingTop = '';
      _attachFloatControls(panel, { key:'pth_winpos_lobbychat', handle: panel.querySelector('.g-chat-panel-header'), resizable:true, minW:240, minH:160 });
      if (typeof clearUnreadChat === 'function') clearUnreadChat();
      if (_chat) _chat.scrollTop = _chat.scrollHeight;
      setTimeout(function(){ var ci = document.getElementById('chat-in'); if(ci) ci.focus(); }, 80);
      return;
    }
    _disableFloating(panel);
    var _defReserve = 0;
    // Overlay : les tables suivent le panneau quand il rétrécit, mais restent
    // en place (recouvertes) quand il dépasse sa taille d'ouverture.
    makeChatResizable(panel, _chat, function(){
      if (_lb) _lb.style.paddingTop = (Math.min(panel.offsetHeight, _defReserve) + LOBBY_PANEL_GAP) + 'px';
    });
    resetChatSize(panel, _chat);              // toujours rouvrir à la taille par défaut
    _defReserve = panel.offsetHeight;
    if (_lb) _lb.style.paddingTop = (_defReserve + LOBBY_PANEL_GAP) + 'px';
    if (typeof clearUnreadChat === 'function') clearUnreadChat();
    if (_chat) _chat.scrollTop = _chat.scrollHeight;
    setTimeout(function(){ var ci = document.getElementById('chat-in'); if(ci) ci.focus(); }, 80);
  } else {
    if (_lb) _lb.style.paddingTop = '';        // libère l'espace
  }
}


function renderHandsHelp() {
  // Icône + couleur de force (vert fort → gris faible) par combinaison
  var ICONS = ['👑','🔥','🎯','🏠','💧','🪜','✦','✌️','👥','⬆️'];
  var RAMP  = ['#2ecc71','#4cc56a','#79c25c','#a6bd4f','#c9b144','#d09a3c','#cf8038','#b86a37','#946035','#6f6353'];
  // c = cartes [valeur, couleur] ; k = 1 si la carte COMPTE (éclairée), 0 si inutile (estompée)
  var hands = [
    { c:[['A','♠'],['K','♠'],['Q','♠'],['J','♠'],['10','♠']], k:[1,1,1,1,1], n:'h1n', d:'h1d' },
    { c:[['9','♣'],['8','♣'],['7','♣'],['6','♣'],['5','♣']],   k:[1,1,1,1,1], n:'h2n', d:'h2d' },
    { c:[['K','♠'],['K','♥'],['K','♦'],['K','♣'],['8','♣']],   k:[1,1,1,1,0], n:'h3n', d:'h3d' },
    { c:[['Q','♣'],['Q','♥'],['Q','♠'],['J','♦'],['J','♣']],   k:[1,1,1,1,1], n:'h4n', d:'h4d' },
    { c:[['A','♦'],['J','♦'],['8','♦'],['5','♦'],['2','♦']],   k:[1,1,1,1,1], n:'h5n', d:'h5d' },
    { c:[['9','♠'],['8','♥'],['7','♣'],['6','♦'],['5','♠']],   k:[1,1,1,1,1], n:'h6n', d:'h6d' },
    { c:[['7','♠'],['7','♦'],['7','♣'],['K','♠'],['4','♥']],   k:[1,1,1,0,0], n:'h7n', d:'h7d' },
    { c:[['J','♣'],['J','♥'],['5','♦'],['5','♠'],['A','♣']],   k:[1,1,1,1,0], n:'h8n', d:'h8d' },
    { c:[['A','♥'],['A','♠'],['9','♦'],['6','♣'],['3','♠']],   k:[1,1,0,0,0], n:'h9n', d:'h9d' },
    { c:[['A','♠'],['K','♦'],['9','♣'],['5','♥'],['2','♠']],   k:[1,0,0,0,0], n:'h10n', d:'h10d' },
  ];
  var inner = document.getElementById('hands-card-inner');
  if (!inner) return;
  function cardHtml(card, isKey) {
    var suit = card[1];
    var red  = (suit === '♥' || suit === '♦');
    var cls  = 'hc' + (red ? ' r' : '') + (isKey ? ' key' : ' kick');
    return '<div class="' + cls + '">' + card[0] + '<br>' + suit + '</div>';
  }
  var rows = hands.map(function(h, i) {
    var cards = h.c.map(function(card, j) { return cardHtml(card, h.k[j]); }).join('');
    // Description : "base||exemple" → l'exemple est mis en valeur (or)
    var parts = String(t(h.d)).split('||');
    var desc  = parts[0] + (parts[1] ? ' <span class="hand-ex">' + parts[1] + '</span>' : '');
    return '<div class="hand-row">'
      + '<div class="hand-rail" style="background:' + RAMP[i] + '"></div>'
      + '<div class="hand-rank" style="color:' + RAMP[i] + '">' + (i + 1) + '</div>'
      + '<div class="hand-cards">' + cards + '</div>'
      + '<div class="hand-info">'
      +   '<div class="hand-name"><span class="hand-ico">' + ICONS[i] + '</span>' + t(h.n) + '</div>'
      +   '<div class="hand-desc">' + desc + '</div>'
      + '</div></div>';
  }).join('');
  var legend = '<div class="hands-legend">'
    + '<span class="hl"><span class="hl-mini bright"></span>' + t('handsLegOk') + '</span>'
    + '<span class="hl"><span class="hl-mini dim"></span>' + t('handsLegNo') + '</span>'
    + '<span class="hl"><span class="hl-grad"></span>' + t('handsLegForce') + '</span>'
    + '</div>';
  inner.innerHTML = '<div class="hands-title">' + t('handsTitle') + '</div>'
    + '<div class="hands-scroll">'
    + legend
    + rows
    + '<button class="hands-close" onclick="toggleHandsHelp()">' + t('handsClose') + '</button>'
    + '</div>';
}

// Indicateur d'état uniforme pour les bascules du menu •••  : ✓ vert quand
// l'option est active, rien quand elle est inactive (pas de croix). Centralisé
// ici pour que toutes les entrées (assistance, vibration, voix, auto,
// quick-bet…) partagent exactement la même visualisation.
function _menuTick(on) {
  return on ? ' <span class="menu-tick">\u2713</span>' : '';
}
window._menuTick = _menuTick;

function toggleHeaderOverflow(e) {
  if (e) e.stopPropagation();
  var m = document.getElementById('g-overflow-menu');
  if (!m) return;
  // ADMIN section divider: mirror the admin buttons' visibility (use the
  // Close-table item as proxy — it's shown whenever the user is admin).
  try {
    var asep = document.getElementById('admin-sep-mob');
    var aref = document.getElementById('admin-close-mob');
    if (asep && aref) {
      var adminOn = (aref.style.display !== 'none');
      asep.style.display = adminOn ? '' : 'none';
    }
  } catch(e13) {}
  m.classList.toggle('open');
}
function closeHeaderOverflow() {
  var m = document.getElementById('g-overflow-menu');
  if (m) m.classList.remove('open');
}
// Lobby twin: identical behaviour but targets the lobby overflow menu.
// Kept as a separate pair of functions so the inline onclick handlers in
// the lobby HTML stay self-explanatory ('Lobby' in the name), and so we
// don't have to thread a menu id through every callsite.
function toggleLobbyOverflow(e) {
  if (e) e.stopPropagation();
  var m = document.getElementById('l-overflow-menu');
  if (!m) return;
  m.classList.toggle('open');
}
function closeLobbyOverflow() {
  var m = document.getElementById('l-overflow-menu');
  if (m) m.classList.remove('open');
}
function toggleConnectOverflow(e) {
  if (e) e.stopPropagation();
  var m = document.getElementById('connect-overflow-menu');
  if (!m) return;
  m.classList.toggle('open');
}
function closeConnectOverflow() {
  var m = document.getElementById('connect-overflow-menu');
  if (m) m.classList.remove('open');
}
// Lobby brand: tap the ♠ to slide the POKERTH word in/out. Only matters on
// narrow screens (CSS keeps the word always visible on wide ones). Auto-folds
// again after a few seconds so it doesn't permanently re-crowd the header.
var _brandFoldTimer = null;
function toggleBrandName() {
  var b = document.getElementById('lobby-brand');
  if (!b) return;
  var nowOpen = b.classList.toggle('brand-open');
  clearTimeout(_brandFoldTimer);
  if (nowOpen) {
    _brandFoldTimer = setTimeout(function () {
      b.classList.remove('brand-open');
    }, 4000);
  }
}
// Fermer le menu si on clique ailleurs (game + lobby)
document.addEventListener('click', function(e) {
  var btn = document.getElementById('g-overflow-btn');
  var menu = document.getElementById('g-overflow-menu');
  if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
  var lbtn = document.getElementById('l-overflow-btn');
  var lmenu = document.getElementById('l-overflow-menu');
  if (lmenu && lbtn && !lbtn.contains(e.target) && !lmenu.contains(e.target)) {
    lmenu.classList.remove('open');
  }
  var cbtn = document.getElementById('connect-overflow-btn');
  var cmenu = document.getElementById('connect-overflow-menu');
  if (cmenu && cbtn && !cbtn.contains(e.target) && !cmenu.contains(e.target)) {
    cmenu.classList.remove('open');
  }
});

function toggleHandsHelp() {
  var ov = document.getElementById('hands-overlay');
  if (!ov) return;
  var opening = ov.style.display === 'none';
  var card = document.getElementById('hands-card-inner');
  if (opening) {
    renderHandsHelp();
    ov.style.display = 'flex';
    if (card && window.matchMedia && window.matchMedia('(min-width:900px) and (min-height:600px)').matches) {
      card.classList.add('hands-floatable');
      card._winResizable = true;
      var _r = _restoreWin(card, 'pth_winpos_hands');
      if (!_r) _placeWin(card, (window.innerWidth - card.offsetWidth) / 2, (window.innerHeight - card.offsetHeight) / 2);
      card._winRszWired = false;                       // innerHTML reconstruit -> re-injecter les poignees
      makeWinResizable(card, 'pth_winpos_hands', 300, 220);
      _makeHandsDraggable(card);
    } else if (card) {
      card.classList.remove('hands-floatable');
      card._winResizable = false;
      var _hs = card.querySelectorAll('.win-rsz'); for (var _i = 0; _i < _hs.length; _i++) _hs[_i].remove();
      ['position','left','top','right','bottom','width','height'].forEach(function (p) { card.style[p] = ''; });
    }
  } else {
    if (card && card.classList.contains('hands-floatable')) _saveWin(card, 'pth_winpos_hands');
    ov.style.display = 'none';
  }
}

// ── Unread-chat badge ──────────────────────────────────────────────
// A small red counter on the 💬 buttons (game header, lobby header, and
// the floating FAB) so a closed chat panel never hides incoming messages.
// Incremented from addGameChat/addChat when the relevant panel is closed,
// and cleared when the user opens the chat.
window._unreadChat = 0;
function _chatBadgeHtml(n) {
  return '<span class="chat-badge">' + (n > 99 ? '99+' : n) + '</span>';
}
function _renderChatBadge() {
  var n = window._unreadChat || 0;
  ['chat-toggle-btn', 'lobby-chat-btn', 'gchat-fab'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    var old = btn.querySelector('.chat-badge');
    if (old) old.remove();
    if (n > 0) {
      btn.insertAdjacentHTML('beforeend', _chatBadgeHtml(n));
    }
  });
}
function bumpUnreadChat() {
  window._unreadChat = (window._unreadChat || 0) + 1;
  _renderChatBadge();
  refreshAppBadge();
}
function clearUnreadChat() {
  window._unreadChat = 0;
  _renderChatBadge();
  refreshAppBadge();
}

// ── App-icon badge (PWA Badging API) ────────────────────────────────
// Shows a count on the installed app icon = unread chat + (1 if it's your
// turn). Feature-detected: Chrome/Edge desktop+Android and installed
// Safari/iOS support it; Firefox does not, so it silently no-ops there.
window._badgeTurn = false;
function refreshAppBadge() {
  try {
    if (!('setAppBadge' in navigator)) return;
    var n = (window._unreadChat || 0) + (window._badgeTurn ? 1 : 0);
    if (n > 0) navigator.setAppBadge(n);
    else if ('clearAppBadge' in navigator) navigator.clearAppBadge();
  } catch (e) { /* badge unavailable — ignore */ }
}
window.refreshAppBadge = refreshAppBadge;

// ── Selecteur d'emoji pour le chat de jeu (desktop) ──────────────
// Bouton dans la barre de saisie (visible seulement sur appareil a souris) qui
// ouvre une grille d'emojis ; un clic insere l'emoji a la position du curseur
// dans #g-chat-in. sendGameChat envoie le texte tel quel (les emojis sont du
// simple texte unicode -> aucun changement de protocole). Equivalent des
// emoticones du chat du client officiel.
var CHAT_EMOJIS = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','🙂','😉','😍','😘','😋','😎','🤩','🥳','🤔','😐','😏','😒','😞','😢','😭','😤','😠','😡','🥺','😱','😬','🙄','😴','🤗','🤫','👍','👎','👏','🙌','🙏','💪','🤝','👋','❤️','🔥','⭐','✨','🎉','💯','✅','❌','🃏','♠️','♥️','♦️','♣️'];
function _populateChatEmojis(panel, inputId) {
  if (!panel || panel._filled) return;
  panel._filled = true;
  var h = '';
  for (var i = 0; i < CHAT_EMOJIS.length; i++) {
    var e = CHAT_EMOJIS[i];
    h += '<button type="button" class="chat-emoji-btn" data-emo="' + e + '" title="' + e + '">' + e + '</button>';
  }
  panel.innerHTML = h;
  panel.addEventListener('click', function(ev) {
    var b = (ev.target && ev.target.closest) ? ev.target.closest('.chat-emoji-btn') : null;
    if (b && b.getAttribute('data-emo')) insertChatEmoji(b.getAttribute('data-emo'), inputId);
  });
}
function insertChatEmoji(emo, inputId) {
  var inp = document.getElementById(inputId || 'g-chat-in');
  if (!inp) return;
  var s = (inp.selectionStart != null) ? inp.selectionStart : inp.value.length;
  var e = (inp.selectionEnd   != null) ? inp.selectionEnd   : inp.value.length;
  inp.value = inp.value.slice(0, s) + emo + inp.value.slice(e);
  var pos = s + emo.length;
  inp.focus();
  try { inp.setSelectionRange(pos, pos); } catch (err) {}
}
function toggleChatEmojiPicker(btn) {
  // btn porte data-panel (id de la grille) + data-input (id du champ de saisie).
  // Sans argument -> chat de jeu (compat).
  var panelId = (btn && btn.getAttribute && btn.getAttribute('data-panel')) || 'g-chat-emoji-panel';
  var inputId = (btn && btn.getAttribute && btn.getAttribute('data-input')) || 'g-chat-in';
  var panel = document.getElementById(panelId);
  if (!panel) return;
  _populateChatEmojis(panel, inputId);
  var open = (panel.style.display === 'none' || panel.style.display === '');
  panel.style.display = open ? 'grid' : 'none';
  if (btn && btn.classList) btn.classList.toggle('active', open);
  if (open) { var inp = document.getElementById(inputId); if (inp) inp.focus(); }
}
window.toggleChatEmojiPicker = toggleChatEmojiPicker;
window.insertChatEmoji = insertChatEmoji;

function toggleGameChat() {
  var panel = document.getElementById('g-chat-panel');
  var btn   = document.getElementById('chat-toggle-btn');
  if (!panel) return;
  var open = panel.style.display === 'none';
  panel.style.display = open ? 'flex' : 'none';
  setTimeout(function(){ autoScaleTable(); if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 50);
  if (btn) {
    btn.style.background  = open ? 'rgba(var(--gold-rgb),0.2)' : '';
    btn.style.borderColor = open ? 'var(--gold-dim)' : '';
    btn.style.color       = open ? 'var(--gold)' : '';
  }
  if (open) {
    if (_chatGate()) { _attachFloatControls(panel, { key:'pth_winpos_chat', handle: panel.querySelector('.g-chat-panel-header'), resizable:true, minW:240, minH:160 }); }
    else { _disableFloating(panel); makeChatResizable(panel, document.getElementById('g-chat-msgs')); }
    if (typeof clearUnreadChat === 'function') clearUnreadChat();
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

function toggleMusicPanel() {
  var panel = document.getElementById('music-panel');
  if (!panel) return;
  var open = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = open ? 'flex' : 'none';
  if (open) {
    // (Re-)render the player and refresh the auto-updating track list on every
    // open — tracks added later then appear without a reload.
    try { if (window.Music && window.Music.mount) window.Music.mount(document.getElementById('music-body')); } catch (e) {}
    // Reflet de l'etat vibration sur la case Vibration (deplacee ici depuis le
    // menu crantee). Defaut ON : pth_haptic absent => coche.
    try { var _hb = document.getElementById('music-haptic'); if (_hb) _hb.checked = (localStorage.getItem('pth_haptic') !== '0'); } catch (e) {}
    // Draggable + resizable on desktop/tablet; fixed bottom-sheet on phones —
    // same window system as the chat / log / reaction panels.
    if (_winGate()) {
      _attachFloatControls(panel, { key: 'pth_winpos_music', handle: panel.querySelector('.music-panel-title'), resizable: true, minW: 260, minH: 200 });
    } else {
      _disableFloating(panel);
    }
  }
  // Reflect open/closed state on the entry buttons (active = gold).
  ['music-btn-connect', 'music-toggle-lobby-mob', 'music-toggle-game-mob', 'music-toggle-connect-mob'].forEach(function (id) {
    var b = document.getElementById(id);
    if (!b) return;
    b.style.background  = open ? 'rgba(var(--gold-rgb),0.2)' : '';
    b.style.borderColor = open ? 'var(--gold-dim)' : '';
    b.style.color       = open ? 'var(--gold)' : '';
  });
}
window.toggleMusicPanel = toggleMusicPanel;

function toggleReactionPanel() {
  // Réactions actives partout, y compris pokerth.net : sendReaction() relaie
  // via la commande /emoji dans le chat de partie (interop web <-> Qt/QML).
  // L'ancien garde-fou _directWS masquait le bouton sur pokerth.net (régression).
  var panel = document.getElementById('g-reaction-panel');
  var btn   = document.getElementById('react-toggle-btn');
  if (!panel) return;
  var open = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = open ? 'flex' : 'none';
  if (open) _applyReactMuteUI();
  if (open) { if (_winGate()) { _attachFloatControls(panel, { key:'pth_winpos_react', handle: panel.querySelector('.react-panel-title'), resizable:true, minW:240, minH:160, defW:330, defH:340 }); } else { _disableFloating(panel); } }
  if (btn) {
    btn.style.background  = open ? 'rgba(var(--gold-rgb),0.2)' : '';
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
  if (btn) btn.style.background = isHidden ? 'rgba(var(--gold-rgb),0.2)' : '';
  if (btn) btn.style.borderColor = isHidden ? 'var(--gold-dim)' : '';
  if (btn) btn.style.color       = isHidden ? 'var(--gold)' : '';
  if (isHidden) {
    // Poignée de redimensionnement, identique au chat (glisser pour étendre).
    if (_winGate()) { _attachFloatControls(panel, { key:'pth_winpos_log2', handle: panel.querySelector('.g-chat-panel-header'), resizable:true, minW:240, minH:140, defW: window.innerWidth >= 1400 ? 340 : 280 }); }
    else { _disableFloating(panel); makeChatResizable(panel, document.getElementById('g-log-body')); }
    var lb = document.getElementById('g-log-body');
    if (lb) lb.scrollTop = 0; // le plus récent est en haut (liste inversée)
  }
}

// Exporte le journal : feuille de partage native si dispo (iOS/Android),
// sinon copie dans le presse-papier (avec repli execCommand). Ordre
// chronologique, dans la langue active, précédé d'un en-tête table + date.
function exportLog() {
  var body = (typeof window._buildLogText === 'function') ? window._buildLogText() : '';
  if (!body || !body.trim()) {
    if (typeof showToast === 'function') showToast(t('logEmpty'), { tone: 'error', icon: '' });
    return;
  }
  var table = (((document.getElementById('g-name') || {}).textContent) || 'PokerTH').trim();
  var title = (typeof t === 'function') ? t('logPanelTitle') : 'Log';
  var full = title + ' — ' + table + ' — ' + new Date().toLocaleString() + '\n' +
             '────────────────────\n' + body + '\n';
  function copied() { if (typeof showToast === 'function') showToast(t('logCopied')); }
  function fallback() {
    try {
      var ta = document.createElement('textarea');
      ta.value = full; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand('copy'); ta.remove(); copied();
    } catch (e) {}
  }
  if (navigator.share) {
    navigator.share({ title: 'PokerTH — ' + title, text: full }).catch(function(){});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(full).then(copied).catch(fallback);
  } else {
    fallback();
  }
}
window.exportLog = exportLog;

// Vide l'historique visible d'un chat (local uniquement — pas d'effet serveur).
// 'lobby' -> #chat ; 'game' -> #g-chat-msgs. Le chat n'a pas de store séparé
// (_retranslateSysChat relit le DOM), donc vider le conteneur suffit.
function clearChatPanel(which){
  var el = document.getElementById(which === 'lobby' ? 'chat' : 'g-chat-msgs');
  if (el) el.innerHTML = '';
}
window.clearChatPanel = clearChatPanel;

// ── Players online panel ──
// Wired to the #h-players pill in the lobby header. Toggles a
// dropdown that lists every pid in _lobbyPids with its name (or
// '#<pid>' if the PlayerInfoReply hasn't arrived yet).
function togglePlayersPanel() {
  var panel = document.getElementById('players-panel');
  if (!panel) return;
  var isHidden = panel.style.display === 'none';
  if (isHidden) {
    // Close sibling dropdowns so only one is open at a time.
    ['lobby-chat-panel'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Position the panel right below the header. The CSS rule uses
    // a hard-coded top:36px, but the header padding is clamp()-based
    // and produces 36–52 px depending on viewport. Measure the actual
    // bottom of the lobby header at open time so the panel always
    // starts flush against it, never overlapping or leaving a gap.
    var hdr = document.querySelector('#s-lobby .header');
    if (hdr) {
      var rect = hdr.getBoundingClientRect();
      panel.style.top = Math.round(rect.bottom) + 'px';
    }
    panel.style.display = '';
    renderPlayersList();
    var _list = document.getElementById('players-list-body');
    var _lb = document.querySelector('#s-lobby .lobby-body');
    var _defReserve = 0;
    // Overlay : les tables suivent quand le panneau rétrécit, restent en
    // place (recouvertes) quand il dépasse sa taille d'ouverture.
    makeChatResizable(panel, _list, function(){
      if (_lb) _lb.style.paddingTop = (Math.min(panel.offsetHeight, _defReserve) + LOBBY_PANEL_GAP) + 'px';
    });
    resetChatSize(panel, _list);                 // rouvrir à la taille par défaut
    _defReserve = panel.offsetHeight;
    if (_lb) _lb.style.paddingTop = (_defReserve + LOBBY_PANEL_GAP) + 'px';
    // Focus the search input so the user can type right away.
    var inp = document.getElementById('players-search-in');
    if (inp) setTimeout(function(){ inp.focus(); }, 50);
  } else {
    panel.style.display = 'none';
    var _lb2 = document.querySelector('#s-lobby .lobby-body');
    if (_lb2) _lb2.style.paddingTop = '';         // libère l'espace
  }
}

function renderPlayersList() {
  var body = document.getElementById('players-list-body');
  var countEl = document.getElementById('players-panel-count');
  var titleEl = document.getElementById('players-panel-title');
  if (!body) return;
  // Rebuild the title from scratch so it stays in sync with the
  // active language and the running count. Structure mirrors the
  // game-chat panel header (single inline span).
  if (titleEl) {
    var lbl = (typeof t === 'function') ? t('playersOnlineTitle') : 'Players online';
    titleEl.innerHTML = '👥 ' + lbl + ' — <span id="players-panel-count">0</span>';
    countEl = document.getElementById('players-panel-count'); // re-resolve after innerHTML
  }
  // Build the list of {pid, name} from _lobbyPids (defined inside
  // the IIFE; we read it via window-level references).
  var pids = window._readLobbyPids ? window._readLobbyPids() : [];
  var nameMap = window._readPlayers ? window._readPlayers() : {};
  var myId = window._readMyId ? window._readMyId() : 0;
  // Snapshot complet pour accéder aux drapeaux (flagOf) sans multiplier les ponts.
  var _ls = (typeof App !== 'undefined' && App.getLobbyState) ? App.getLobbyState() : {};
  var _flagOf = (_ls && typeof _ls.flagOf === 'function') ? _ls.flagOf : function() { return ''; };
  // Build display rows
  var rows = pids.map(function(pid) {
    return { pid: pid, name: nameMap[pid] || ('#' + pid), isMe: pid === myId };
  });
  // Filter by search input
  var q = (document.getElementById('players-search-in') || {}).value || '';
  q = q.toLowerCase().trim();
  if (q) rows = rows.filter(function(r) { return r.name.toLowerCase().includes(q); });
  // Sort: me first, then alphabetical
  rows.sort(function(a, b) {
    if (a.isMe && !b.isMe) return -1;
    if (b.isMe && !a.isMe) return 1;
    return a.name.localeCompare(b.name);
  });
  if (countEl) countEl.textContent = pids.length;
  if (rows.length === 0) {
    body.innerHTML = '<div class="pl-empty">' + (q ? '— ' : '—') + '</div>';
    return;
  }
  body.innerHTML = rows.map(function(r) {
    var esc = function(s) { return String(s).replace(/[<>&"]/g, function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); };
    // Avatar chip via the unified helper (same priority order as
    // every other compact list in the app: real PokerTH image >
    // placeholder logo > emoji > 🤖 > initial letter).
    var avChip = (typeof window._avatarChipHtml === 'function')
      ? window._avatarChipHtml(r.pid, r.name, 'pl-av')
      : '<span class="pl-av letter">' + esc((r.name[0] || '?').toUpperCase()) + '</span>';
    // Drapeau du pays + code ISO à 2 lettres à sa droite (certains drapeaux
    // se ressemblent). Code lu depuis countries[pid]. Sans pays → rien.
    var flag = _flagOf(r.pid) || '';
    var _ccRaw = (_ls.countries && _ls.countries[r.pid]) ? String(_ls.countries[r.pid]).trim().toUpperCase() : '';
    var cc = /^[A-Z]{2}$/.test(_ccRaw) ? _ccRaw : '';
    // Nom cliquable → ouvre le popup joueur (rôle, drapeau, cups, lien profil).
    // Tous les joueurs (enregistrés ET invités) ; le popup gère le contenu.
    var nameHtml = '<span class="pl-name-link" role="button" tabindex="0"'
      + ' onclick="window.openPlayerInfoPopup(' + r.pid + ')"'
      + ' onkeydown="if(event.key===\'Enter\')window.openPlayerInfoPopup(' + r.pid + ')">'
      + esc(r.name) + '</span>';
    return '<div class="pl-row' + (r.isMe ? ' pl-me' : '') + '">' +
             avChip +
             '<span class="pl-name">' + nameHtml + '</span>' +
             '<span class="pl-flag">' + flag + (cc ? '<span class="pl-cc">' + cc + '</span>' : '') + '</span>' +
             '<span class="pl-star">' + (r.isMe ? '★' : '') + '</span>' +
             '<span class="pl-id">#' + r.pid + '</span>' +
           '</div>';
  }).join('');
}

;(function(){ window.BUILD_VERSION='0.3.130-beta'; try{ var b=document.getElementById('cf-build'); if(b) b.textContent='\u00b7 build '+window.BUILD_VERSION; }catch(e){} })();

/* theme-color du navigateur : suit le thème actif (Android, Safari, iOS
   standalone récent). Lit --theme-color (défini par thème dans la CSS) et met
   à jour le meta au chargement + à chaque changement de data-theme. rAF pour
   lire après recalcul de style (fiabilité iOS). */
;(function(){
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  function upd(){
    requestAnimationFrame(function(){
      try{
        var c = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim();
        if (c) meta.setAttribute('content', c);
      }catch(e){}
    });
  }
  upd();
  try{ new MutationObserver(upd).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] }); }catch(e){}
})();

/* ── Overlay dropdowns (chat / réactions / journal + lobby) ────────────────
   Les panneaux déroulants sont position:fixed et doivent s'ouvrir JUSTE sous
   le header. Le header n'a pas de hauteur fixe (clamp + paddings + variations
   portrait/paysage + breakpoints) : on mesure sa hauteur réelle et on la
   publie dans --ovl-top, consommée par le CSS (top:var(--ovl-top)). On lit le
   header de l'écran ACTIF (lobby ou jeu). Mesure via getBoundingClientRect
   (fiable iOS, contrairement à getComputedStyle sur les custom properties).
   Mis à jour : resize, orientationchange, changement d'écran (show()), et
   ResizeObserver pour tout changement de contenu du header. */
;(function(){
  function syncOverlayTop(){
    try{
      var scr = document.querySelector('.screen.active');
      var h = scr && scr.querySelector('.header');
      if(!h) return;
      var px = Math.round(h.getBoundingClientRect().height);
      if(px > 0) document.documentElement.style.setProperty('--ovl-top', px + 'px');
    }catch(e){}
  }
  window._syncOverlayTop = syncOverlayTop;
  try{
    if(typeof ResizeObserver !== 'undefined'){
      var ro = new ResizeObserver(function(){ syncOverlayTop(); });
      var hs = document.querySelectorAll('.screen > .header');
      for(var i=0;i<hs.length;i++) ro.observe(hs[i]);
    }
  }catch(e){}
  window.addEventListener('resize', syncOverlayTop, { passive:true });
  window.addEventListener('orientationchange', function(){ setTimeout(syncOverlayTop, 80); });
  requestAnimationFrame(syncOverlayTop);
})();


;(function(){
  // ── Anonymous visit ping (traffic counter) ──
  // Fires once per browser session: total visits = sessions, unique visitors =
  // distinct persistent random ids. No IP, no PII. Aggregated server-side.
  try { if (sessionStorage.getItem('pth_visit_sent')) return; } catch (e) { return; }
  var fire = function () {
    try {
      try { sessionStorage.setItem('pth_visit_sent', '1'); } catch (e) {}
      var vid = '';
      try { vid = localStorage.getItem('pth_vid') || ''; } catch (e) {}
      if (!vid) {
        vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
            : (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
        try { localStorage.setItem('pth_vid', vid); } catch (e) {}
      }
      var body = JSON.stringify({ vid: vid });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/__visit', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/__visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* never let the counter break the app */ }
  };
  try {
    if (document.readyState === 'complete' || document.readyState === 'interactive') fire();
    else window.addEventListener('load', fire, { once: true });
  } catch (e) { fire(); }
})();

;(function(){
  // ── Per-mode connection counter ──
  // Fires once per session per mode when a connection opens. Reports to OUR
  // proxy (/__visit) even when the game socket is a direct WSS to pokerth.net —
  // the count-ping is independent of the game transport. No IP, no PII.
  window._pthCountConnect = function (mode) {
    try {
      if (['pokerthnet', 'lan', 'offline'].indexOf(mode) < 0) return;
      var k = 'pth_conn_' + mode;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, '1');
    } catch (e) { /* sessionStorage blocked — fall through and send once */ }
    try {
      var vid = '';
      try { vid = localStorage.getItem('pth_vid') || ''; } catch (e) {}
      var body = JSON.stringify({ mode: mode, vid: vid });
      if (navigator.sendBeacon) navigator.sendBeacon('/__visit', new Blob([body], { type: 'application/json' }));
      else fetch('/__visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  };
})();
