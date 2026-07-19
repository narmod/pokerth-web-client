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

// [Phase 2] Animations d'ambiance (launchConfetti, animateTableEnter,
// setUrgentMode, animatePlayerEliminated, état _prevDealerPid) déplacées dans
// public/modules/ui/anim.mjs (toujours globales via window.*).
// ── Indicateur de ping sur mon avatar (parité ShowPingStateInAvatar, bible
// §15) — OPT-IN. Mesure le RTT vers l'origine (fetch no-store de /__ver,
// l'endpoint mtime du proxy) toutes les 15 s, uniquement en jeu, onglet
// visible et partie réseau : le tick est un no-op quasi gratuit sinon
// (économie batterie iOS). Vert < 120 ms · jaune < 300 ms · rouge au-delà ·
// gris si la mesure échoue.
function _pingColor(ms) { return ms < 120 ? '#50c878' : ms < 300 ? '#FFC107' : '#e05050'; }
function _pingDotHide() { var d = document.getElementById('g-ping-dot'); if (d) d.style.display = 'none'; }
function _pingTick() {
  try {
    if (!_advGet('ping_avatar', true) || document.hidden || window._offlineMode) { _pingDotHide(); return; }
    var sg = document.getElementById('s-game');
    if (!sg || !sg.classList.contains('active')) { _pingDotHide(); return; }
    var t0 = performance.now();
    fetch('/__ver?ping=' + Date.now(), { cache: 'no-store' }).then(function () {
      var ms = Math.round(performance.now() - t0);
      var d = document.getElementById('g-ping-dot');
      if (!d) return;
      d.style.display = '';
      d.style.background = _pingColor(ms);
      d.title = ms + ' ms';
    }).catch(function () {
      var d = document.getElementById('g-ping-dot');
      if (d) { d.style.display = ''; d.style.background = '#8b93a7'; d.title = '\u2014'; }
    });
  } catch (e) {}
}
window._pingTick = _pingTick;
setInterval(_pingTick, 15000);
setTimeout(_pingTick, 3000);

// [Phase 2] Animations de jeu (updatePotSize, animateDealerMove, animateAllIn,
// fadeOutAllActions, animateShowdownCards, thinkingHtml, burstStars, animatePot,
// setMyTurnActive) déplacées dans public/modules/ui/anim.mjs (toujours
// globales via window.*).
// Réglages persistés en localStorage (pth_*). Les bascules « présentation »
// sont appliquées via des classes sur <body> (CSS) pour rester additif et sûr.
// Les lignes grisées « bientôt » dépendent d'un travail backend/moteur à venir.
// Sièges « perdants » au showdown (pids) → cartes estompées (fadeOutLosingCards).
// Rempli dans EndOfHandShow (si pth_fade_losers != '0'), vidé à HandStart.
var _sdLosers = new Set();
var _sdWinners = new Set();   // sièges gagnants du showdown (PlayerWinnerOverlay QML)
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
// ── Termes de poker (Fold/Check/Call/Bet/Raise/All-In) ───────────────────────
//    Option « ne pas traduire les termes de poker » (poker_en, cochée par
//    défaut = parité officielle PokerTH : DontTranslateInternationalPokerStrings).
//    Cochée  → terme anglais canonique. Décochée → traduction de la langue
//    active (transKey, comportement historique inchangé). base ∈
//    fold|check|call|bet|raise|allin.
var _POKER_EN_TERMS = { fold: 'Fold', check: 'Check', call: 'Call', bet: 'Bet', raise: 'Raise', allin: 'All-In' };
function pkTerm(base, transKey) {
  try {
    if (_advGet('poker_en', true)) return _POKER_EN_TERMS[base] || t(transKey || base);
    return t(transKey || base);
  } catch (e) { return t(transKey || base); }
}
window.pkTerm = pkTerm;
// ── Joueurs ignorés (préférence locale, par nom). Le chat du joueur est masqué
//    et son avatar anonymisé (sauf si « ne pas masquer les avatars ignorés »
//    est activée). Voir _ignHide (sièges), addChat/addGameChat (filtre) et
//    window._toggleIgnore (carte joueur). ──
var _ignoredSet = (function(){ try { return new Set(JSON.parse(localStorage.getItem('pth_ignored') || '[]')); } catch (e) { return new Set(); } })();
function _isIgnored(name){ return !!name && _ignoredSet.has(String(name)); }
// Liste centrale des ignorés (Options avancées > Partie Internet — parité
// QML Ignorierte Spieler) : rendu + bouton « Retirer » par joueur.
function renderIgnoredList(){
  var box = document.getElementById('adv-ignored-list');
  if (!box) return;
  var esc = function(v){ return String(v == null ? '' : v).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var tt = function(k, fb){ try { if (typeof window.t === 'function') { var v = window.t(k); if (v && v !== k) return v; } } catch (e) {} return fb; };
  var names = Array.from(_ignoredSet).sort(function(a, b){ return String(a).localeCompare(String(b)); });
  if (!names.length) { box.innerHTML = '<div class="adv-ign-empty">' + esc(tt('advIgnoredEmpty', '(no ignored players)')) + '</div>'; return; }
  box.innerHTML = names.map(function(n){
    return '<div class="adv-ign-row"><span class="adv-ign-name">' + esc(n) + '</span>'
         + '<button type="button" class="adv-ign-rm" data-name="' + esc(n) + '">' + esc(tt('advIgnoredRemove', 'Remove')) + '</button></div>';
  }).join('');
}
window.renderIgnoredList = renderIgnoredList;
document.addEventListener('click', function(e){
  var b = (e.target && e.target.closest) ? e.target.closest('.adv-ign-rm') : null;
  if (!b) return;
  _setIgnoredName(b.getAttribute('data-name'), false);
  renderIgnoredList();
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (err) {}
});
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
    b.classList.toggle('adv-no-potbtns', !_advGet('pot_btns', true)); // quick-bets 1/3·1/2·Pot (parite ShowPotPercentButtons)
    b.classList.toggle('adv-no-communitycontent', !_advGet('community_content', true)); // contenus communaute (parite showCommunityContent)
    b.classList.toggle('adv-no-blindsbadge', !_advGet('blinds_badge', true)); // pastille blinds du bandeau (extension web)
    b.classList.toggle('adv-no-community', !_advGet('show_community', true));
    b.classList.toggle('adv-no-flag', !_advGet('show_flag', true));
    try { if (typeof window._syncStatsTab === 'function') window._syncStatsTab(); } catch (e) {}
    try { if (typeof window._hudRefresh === 'function' && localStorage.getItem('pth_hud_on') === '1') window._hudRefresh(); else if (typeof window._hudRender === 'function') window._hudRender(); } catch (e) {}
    try {
      var _ex = document.querySelectorAll('.adv-export-btn');
      var _on = _advGet('stats_track', true);
      for (var _k = 0; _k < _ex.length; _k++) _ex[_k].disabled = !_on;
    } catch (e) {}
    b.classList.add('adv-hide-pbar'); // mode PokerTH permanent — option « barre joueur masquée » retirée (narmod 2026-07-17), le CSS reste keyé sur la classe
    b.classList.toggle('adv-no-tablezoom', !_advGet('table_zoom', true)); // interrupteur zoom (parite QML tableZoomEnabled)
    b.classList.toggle('adv-no-lobbychat', !_advGet('lobby_chat', true)); // chat du lobby (parite QML UseLobbyChat)
    b.classList.toggle('adv-no-chatts', !_advGet('chat_ts', true)); // heure [HH:MM:SS] devant les messages de chat (demande forum, extension web)
    b.classList.toggle('adv-no-handsbtn', !_advGet('hands_btn', true)); // icone combinaisons de poker sur le tapis (extension web)
    try { if (typeof window.applyTableZoom === 'function') window.applyTableZoom(); } catch (e) {}
    try { var _slm = localStorage.getItem('pth_seat_layout'); _slm = (_slm === 'pokerth-official' || _slm === 'pokerth-ellipse' || _slm === 'custom') ? _slm : 'auto'; document.documentElement.setAttribute('data-seat-layout', _slm); } catch (e) {}
    try { if (typeof window._refreshOwnCards === 'function') window._refreshOwnCards(); } catch (e) {}
    try { if (typeof window._renderOdds === 'function') window._renderOdds(); } catch (e) {}
    try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
  } catch (e) {}
}
window.applyAdvOpts = applyAdvOpts;
function setAdvOpt(key, on) {
  try { localStorage.setItem('pth_' + key, on ? '1' : '0'); } catch (e) {}
  applyAdvOpts();
  try { _cfgSyncMark(key); } catch (e) {}   // sync compte (no-op si désactivée)
}
window.setAdvOpt = setAdvOpt;
// Options avancees : infobulles natives (title). Off => on retire les title
// (ranges dans data-ttl) ; On => on les restaure. Applique au chargement et a
// chaque bascule. Les title ajoutes dynamiquement apres coupure gardent leur
// title jusqu'a la prochaine application (limite mineure, non bloquante).
function applyTooltips() {
  try {
    var on = _advGet('tooltips', true);
    if (on) {
      var r = document.querySelectorAll('[data-ttl]');
      for (var i = 0; i < r.length; i++) { r[i].setAttribute('title', r[i].getAttribute('data-ttl')); r[i].removeAttribute('data-ttl'); }
    } else {
      var t = document.querySelectorAll('[title]');
      for (var j = 0; j < t.length; j++) { t[j].setAttribute('data-ttl', t[j].getAttribute('title')); t[j].removeAttribute('title'); }
    }
  } catch (e) {}
}
window.applyTooltips = applyTooltips;
function setTooltips(on) {
  try { localStorage.setItem('pth_tooltips', on ? '1' : '0'); } catch (e) {}
  applyTooltips();
}
window.setTooltips = setTooltips;
// Options avancees : communaute par defaut du classement (pth/bbc/wec). Reutilise
// la preference existante pth_rank_src (derniere source ouverte = defaut). Si le
// classement est ouvert, applique tout de suite.
function setDefaultCommunity(v) {
  v = (v === 'bbc' || v === 'wec') ? v : 'pth';
  try { localStorage.setItem('pth_rank_src', v); } catch (e) {}
  try {
    var m = document.getElementById('ranking-modal');
    if (m && m.style.display !== 'none' && typeof window.rankingSelect === 'function') window.rankingSelect(v);
  } catch (e) {}
}
window.setDefaultCommunity = setDefaultCommunity;
// Intervalle du journal (parite QML LogInterval) : 'action' (chaque action)
// ou 'hand' (une entree par etape de main seulement). Persiste ; lu en direct
// par logAction via _getLogInterval.
function _getLogInterval() {
  // Défaut « par main » (parité QML : LogInterval=1, log.cpp 0=action/1=main).
  try { var v = localStorage.getItem('pth_log_interval'); return (v === 'action') ? 'action' : 'hand'; }
  catch (e) { return 'hand'; }
}
window._getLogInterval = _getLogInterval;
window.setLogInterval = function (v) {
  try { localStorage.setItem('pth_log_interval', (v === 'hand') ? 'hand' : 'action'); } catch (e) {}
};
// Croix de fermeture des fenetres flottantes : coupe l'option et masque.
window.closeOddsWin = function () {
  // Héritage : l'ancienne fenêtre flottante d'odds est devenue l'onglet
  // « Chances » du panneau info unifié — on ferme simplement le panneau.
  try { var p = document.getElementById('g-log-panel'); if (p && p.style.display !== 'none') toggleLog(); } catch (e) {}
};
window.closeAssistWin = function () {
  try { if (typeof window.setAssist === 'function') window.setAssist(false); } catch (e) {}
  var cb = document.getElementById('adv-assist'); if (cb) cb.checked = false;
};
// Options avancees : fenetre flottante via le SYSTEME GENERIQUE
// (_enableFloating — meme patron que chat, log, journaux). Largeur >= 600 px
// (seuil canonique QML : « compact » = largeur < 600) : deplacable par la barre
// de titre, redimensionnable (poignees
// .win-rsz), contenu zoome avec la taille (base 620x640), position/taille
// memorisees sous pth_win_adv. Sur mobile : modal centre flex, aucun resize.
// Remplace l'ancien systeme dedie (_advAttachDrag/_advApplyZoom/
// _advSetupResize, cles pth_adv_pos/pth_adv_size — migrees ci-dessous).
function _advSetupFloat() {
  var card = document.querySelector('#adv-modal .adv-card');
  if (!card) return;
  var wide = false;
  try { wide = window.matchMedia('(min-width:600px)').matches; } catch (e) {}
  if (!wide) { try { _disableFloating(card); } catch (e) {} return; }
  // Migration one-shot des anciennes cles vers la cle unique du systeme.
  try {
    if (!localStorage.getItem('pth_win_adv')) {
      var op = JSON.parse(localStorage.getItem('pth_adv_pos') || 'null');
      var os = JSON.parse(localStorage.getItem('pth_adv_size') || 'null');
      if ((op && typeof op.left === 'number') || (os && os.w)) {
        var d = { left: (op && op.left) || 16, top: (op && op.top) || 56 };
        if (os && os.w) { d.width = os.w; d.height = os.h || 640; }
        localStorage.setItem('pth_win_adv', JSON.stringify(d));
      }
    }
    localStorage.removeItem('pth_adv_pos'); localStorage.removeItem('pth_adv_size');
  } catch (e) {}
  var defW = Math.min(620, window.innerWidth - 16);
  var defH = Math.min(640, window.innerHeight - 16);
  _enableFloating(card, {
    key: 'pth_win_adv',
    handle: card.querySelector('.km-title'),
    resizable: true,
    zoom: true,
    defW: 620, defH: 640,          // base du zoom (inchangee vs _advApplyZoom)
    minW: 380, minH: 360,   // 524→380 : sous 600 px la sidebar devient barre d'icônes (container query), une fenêtre étroite « portrait » est légitime
    defLeft: Math.max(8, Math.round((window.innerWidth - defW) / 2)),
    defTop: Math.max(8, Math.round((window.innerHeight - defH) / 2)),
  });
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
  sync('adv-potbtns', 'pot_btns', true);
  sync('adv-communitycontent', 'community_content', true);
  sync('adv-splash', 'splash', true);          // parité QML : DisableSplashScreenOnStartup=0
  sync('adv-community', 'show_community', true);
  sync('adv-focusbet', 'focus_bet', false);
  sync('adv-noemoji', 'chat_noemoji', false);
  sync('adv-chatts', 'chat_ts', true);   // heure dans le chat, active par defaut (comportement historique)
  sync('adv-fadelosers', 'fade_losers', true);
  sync('adv-flag', 'show_flag', true);
  sync('adv-ownclick', 'own_click', false);
  sync('adv-guardcall', 'guard_call', true);   // défaut QML : AccidentallyCallBlocker=1
  sync('adv-assist', 'assist', true);
  sync('adv-showodds', 'show_odds', true);
  sync('adv-handsbtn', 'hands_btn', true);
  sync('adv-voice', 'voice', false);
  sync('adv-haptic', 'haptic', true);
  sync('adv-displaybb', 'display_bb', false);
  sync('adv-nohideignored', 'no_hide_ignored', false);
  sync('adv-fkeysalt', 'fkeys_alt', false);
  sync('adv-tablezoom', 'table_zoom', true);
  sync('adv-lobbychat', 'lobby_chat', true);
  sync('adv-pausehands', 'pause_hands', false);
  sync('adv-createdialog', 'create_dialog', true);
  sync('adv-cfgsync', 'cfg_sync', true);
  sync('adv-pokeren', 'poker_en', true);
  try { renderIgnoredList(); } catch (e) {}
  sync('adv-logon', 'log_on', true);
  sync('adv-statstrack', 'stats_track', true);
  sync('adv-hudon', 'hud_on', false);
  try { var _li = document.getElementById('adv-loginterval'); if (_li) _li.value = _getLogInterval(); } catch (e) {}
  sync('adv-zoomfollow', 'zoom_follow', true); // défaut QML : suivi actif quand le zoom l'est
  sync('adv-snd-actions', 'snd_actions', true);
  sync('adv-snd-lobby', 'snd_lobby', true);
  sync('adv-snd-net', 'snd_net', true);
  sync('adv-snd-blinds', 'snd_blinds', true);
  sync('adv-reducefx', 'reduce_fx', false);
  sync('adv-statusbar', 'status_bar', true);
  sync('adv-blindsbadge', 'blinds_badge', true);
  sync('adv-winnerpopup', 'winner_popup', true);
  sync('adv-removegone', 'remove_gone', false);
  try { var _dm = document.getElementById('adv-darkmode'); if (_dm && window.getTheme) _dm.value = window.getTheme() || 'auto'; } catch (e) {}
  sync('adv-pingavatar', 'ping_avatar', true); // défaut QML : ShowPingStateInAvatar=1
  sync('adv-autoleave', 'auto_leave', false);
  // Barre d'état de jeu (pot-strip : H#/G#, pot+bets, phase) masquable
  try {
    var _ps = document.getElementById('pot-strip');
    if (_ps) _ps.style.display = _advGet('status_bar', true) ? '' : 'none';
  } catch (e) {}
  // Mode « effets réduits » (parité QmlReduceEffects) : classe sur <html>,
  // le CSS coupe ombres / glow / backdrop-filter.
  try { document.documentElement.classList.toggle('reduce-fx', _advGet('reduce_fx', false)); } catch (e) {}
  try { var _sv = document.getElementById('adv-sndvol'); if (_sv && window.getSoundVolume) _sv.value = Math.round(window.getSoundVolume() * 10); } catch (e) {}
  try { var _sl = document.getElementById('adv-seatlayout'); if (_sl) { var _slv = localStorage.getItem('pth_seat_layout'); _sl.value = (_slv === 'pokerth-official' || _slv === 'pokerth-ellipse' || _slv === 'custom') ? _slv : 'auto'; } } catch (e) {}
  try { var _ctr = document.getElementById('adv-chattranslate'); if (_ctr) { _ctr.checked = (localStorage.getItem('pth_chat_translate') !== '0'); if (!window._chatTrSupported) { var _ctl = _ctr.closest('label'); if (_ctl) _ctl.style.opacity = '0.55'; } } } catch (e) {}
  try { _rebindAction = null; _renderKeyButtons(); } catch (e) {}
  sync('adv-tooltips', 'tooltips', true);
  try { var _nr = document.getElementById('adv-noreact'); if (_nr) _nr.checked = (localStorage.getItem('pth_react_muted') === '1'); } catch (e) {}
  try { var _dc = document.getElementById('adv-defcommunity'); if (_dc) _dc.value = (localStorage.getItem('pth_rank_src') || 'pth'); } catch (e) {}
  try { _advSyncPrefs(); } catch (e) {}
  try { _advSyncContext(); } catch (e) {}
  // Réouverture sur la DERNIÈRE catégorie visitée (demande narmod 2026-07-18) —
  // avant : retour systématique sur « Interface utilisateur ». Restauré APRÈS
  // _advSyncContext pour connaître les catégories grisées ; repli 'ui' si la
  // catégorie mémorisée est sans objet dans le contexte courant (lobby/partie).
  try {
    var _advCat = '';
    try { _advCat = localStorage.getItem('pth_adv_cat') || ''; } catch (e2) {}
    var _advBtn = _advCat ? m.querySelector('.adv-cat[data-cat="' + _advCat + '"]') : null;
    if (!_advBtn || _advBtn.hasAttribute('disabled')) _advCat = 'ui';
    advSelectCat(_advCat);
    var _advTab = '';
    try { _advTab = localStorage.getItem('pth_adv_uitab') || ''; } catch (e2) {}
    advUiTab(_advTab === 'network' ? 'network' : 'general');
  } catch (e) { try { advSelectCat('ui'); advUiTab('general'); } catch (e2) {} }
  m.style.display = '';
  try { _advSetupFloat(); } catch (e) {}
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
  try { if (cat === 'style' && window.renderThemeInto) window.renderThemeInto(document.getElementById('adv-theme-host')); } catch (e) {}
  try { localStorage.setItem('pth_adv_cat', cat); } catch (e) {}  // réouverture au même endroit
}
window.advSelectCat = advSelectCat;

// Options avancees : sous-onglets « General » / « Network » du panneau Interface
// (parite de la fenetre officielle : onglets General / Reseau).
function advUiTab(name) {
  var modal = document.getElementById('adv-modal');
  if (!modal) return;
  var tabs = modal.querySelectorAll('.adv-subtab');
  for (var i = 0; i < tabs.length; i++) {
    var on = tabs[i].getAttribute('data-uitab') === name;
    tabs[i].classList.toggle('is-active', on);
    tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
  }
  var ps = modal.querySelectorAll('.adv-uipanel');
  for (var j = 0; j < ps.length; j++) {
    ps[j].classList.toggle('is-active', ps[j].getAttribute('data-uitab') === name);
  }
  try { localStorage.setItem('pth_adv_uitab', name); } catch (e) {}  // réouverture au même endroit
}
window.advUiTab = advUiTab;

// Grise les catégories sans objet dans le contexte courant (lobby vs partie) et
// renseigne le serveur courant dans l'onglet « Jeu Internet ».
// ── Préférences de table par mode (passe G — parité QML LocalGameSettings /
// NetworkGameSettings / InternetGameSettings). Trois emplacements localStorage :
// pth_prefs_local / pth_prefs_lan / pth_prefs_internet. Édités champ par champ
// dans les Options avancées (persistance immédiate) ; la pastille 💾 du
// formulaire de création écrit l'instantané complet dans l'emplacement du mode
// courant et ⭐ Perso le recharge (App._createPrefsKey). ──
var _ADV_PREFS_KEYS = { local: 'pth_prefs_local', lan: 'pth_prefs_lan', net: 'pth_prefs_internet' };
function _advPrefsBaseline(mode) {
  var b = { players: 10, stack: 3000, blind: 10, raiseEvery: 7, timeout: 15, delayHands: 7 };
  if (mode === 'local') b.guiSpeed = 5;
  if (mode === 'net') { b.timeout = 5; b.name = ''; b.gameType = '1'; b.allowSpectators = true; }
  return b;
}
function _advPrefsRead(mode) {
  var d = null;
  try { d = JSON.parse(localStorage.getItem(_ADV_PREFS_KEYS[mode]) || 'null'); } catch (e) {}
  // Héritage pré-passe G : l'ancien instantané unique sert de repli en lecture.
  if (!d) { try { d = JSON.parse(localStorage.getItem('pth_create_prefs') || 'null'); } catch (e) {} }
  var b = _advPrefsBaseline(mode);
  if (d && typeof d === 'object') { for (var k in b) { if (d[k] != null) b[k] = d[k]; } }
  return b;
}
function advPrefSet(mode, field, el) {
  var key = _ADV_PREFS_KEYS[mode];
  if (!key || !el) return;
  var v;
  if (el.type === 'checkbox') v = !!el.checked;
  else if (el.type === 'number') {
    try { if (window.App && App.clampNum) App.clampNum(el); } catch (e) {}
    v = parseInt(el.value, 10);
    if (isNaN(v)) return;
  } else v = el.value;
  var d = null;
  try { d = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  // Premier réglage du mode : on fige l'état affiché (repli inclus) pour que
  // l'objet stocké soit cohérent avec ce que l'utilisateur voit.
  if (!d || typeof d !== 'object') d = _advPrefsRead(mode);
  d[field] = v;
  try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {}
  try { _cfgSyncMark(field); } catch (e) {}   // sync compte (no-op si désactivée)
}
window.advPrefSet = advPrefSet;
function _advSyncPrefs() {
  var fields = {
    local: ['players', 'stack', 'blind', 'raiseEvery', 'timeout', 'delayHands', 'guiSpeed'],
    lan:   ['players', 'stack', 'blind', 'raiseEvery', 'timeout', 'delayHands'],
    net:   ['name', 'gameType', 'allowSpectators', 'players', 'stack', 'blind', 'raiseEvery', 'timeout', 'delayHands']
  };
  var ids = { players: 'players', stack: 'stack', blind: 'blind', raiseEvery: 'raise', timeout: 'timeout', delayHands: 'delay', guiSpeed: 'speed', name: 'name', gameType: 'gtype', allowSpectators: 'spect' };
  for (var m in fields) {
    var d = _advPrefsRead(m);
    for (var i = 0; i < fields[m].length; i++) {
      var f = fields[m][i];
      var el = document.getElementById('advp-' + m + '-' + ids[f]);
      if (!el) continue;
      if (el.type === 'checkbox') el.checked = !!d[f];
      else el.value = (d[f] != null) ? d[f] : '';
    }
  }
}

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
  setEnabled('local', true);        // réglages persistants (pause entre les mains)
  // Journal et Partie Internet contiennent désormais des RÉGLAGES persistants
  // (journal on/off + intervalle ; liste des joueurs ignorés) → catégories
  // toujours accessibles. Seuls leurs liens contextuels (« Ouvrir le journal »,
  // serveur/déconnexion) sont masqués hors contexte.
  setEnabled('log', true);
  setEnabled('network', true);      // Jeu en réseau (LAN) : préférences de table éditables (l'hébergement reste « bientôt »)
  setEnabled('internet', true);
  setEnabled('avatar', connected);  // profil / avatar indisponible avant connexion
  try {
    var _lcLink = modal.querySelector('.adv-panel[data-cat="local"] .adv-link');
    if (_lcLink) _lcLink.style.display = inGame ? '' : 'none';
    var _lgLink = modal.querySelector('.adv-panel[data-cat="log"] .adv-link');
    if (_lgLink) _lgLink.style.display = inGame ? '' : 'none';
    var _inLink = modal.querySelector('.adv-panel[data-cat="internet"] .adv-link');
    if (_inLink) _inLink.style.display = connected ? '' : 'none';
  } catch (e) {}
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
    : 'Restore everything to factory defaults (options, styles, shortcuts, stats)? Nickname, avatar and account are kept. The app will reload.';
  if (!window.confirm(msg)) return;
  // ── Réinitialisation USINE (demande narmod 2026-07-18) ──
  // On efface TOUTES les préférences locales (préfixe pth_) : options,
  // styles/thèmes/tapis/decks/sièges, raccourcis, positions et tailles de
  // fenêtres, filtres, stats, journal, ignorés, config.xml importée… — comme
  // pour un NOUVEL utilisateur. Sont préservés UNIQUEMENT l'identité et la
  // connexion : pseudo(s), avatar, compte, serveur, session/reprise en cours.
  // Puis rechargement complet : tout se réinitialise proprement au boot
  // (styles injectés au chargement, modules, mémoires en RAM).
  var KEEP = {
    pth_auth_login: 1, pth_pass: 1, pth_sid: 1, pth_vid: 1, pth_resume: 1,
    pth_host: 1, pth_port: 1, pth_proxy: 1, pth_server_mode: 1, pth_login_mode: 1,
    pth_nick: 1, pth_lan_nick: 1, pth_lan_port: 1, pth_unauth_nick: 1, pth_offline_nick: 1,
    pth_avatar: 1, pth_avatar_img: 1
  };
  try {
    var doomed = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('pth_') === 0 && !KEEP[k]) doomed.push(k);
    }
    for (var j = 0; j < doomed.length; j++) { try { localStorage.removeItem(doomed[j]); } catch (e2) {} }
  } catch (e) {}
  try { location.reload(); } catch (e) {}
}
window.resetAdvDefaults = resetAdvDefaults;

// ── Import / Export « config.xml » PokerTH (interop clients Qt-Widgets & QML) ──
// Format (configfile.cpp, writeBuffer) :
//   <?xml version="1.0" encoding='utf-8'?>
//   <PokerTH><Configuration><Clé value="…"/><Liste type="list"><Sous value="…"/>…
// Politique : on n'écrit que les clés MAPPÉES + celles préservées d'un import
// précédent (round-trip, clé localStorage pth_qml_config_xml). Un fichier
// partiel est valide côté officiel : ConfigFile comble les absentes avec ses
// défauts et son writeBuffer() fusionne sans perdre les clés inconnues.
// Exclues (spécifiques machine) : AppDataDir, LogDir, UserDataDir, CacheDir,
// MyAvatar. Non mappée volontairement : Language (index Qt interne ≠ codes
// ISO du web) — préservée telle quelle par le round-trip.
var PTH_CFG_XML_KEY = 'pth_qml_config_xml';
var PTH_CFG_MACHINE_KEYS = { AppDataDir: 1, LogDir: 1, UserDataDir: 1, CacheDir: 1, MyAvatar: 1 };

function _cfgXmlEsc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function _cfgReadPrefs(storageKey) {
  var d = null;
  try { d = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch (e) {}
  if (!d) { try { d = JSON.parse(localStorage.getItem('pth_last_create') || 'null'); } catch (e) {} }
  return (d && typeof d === 'object') ? d : {};
}
function _cfgLs(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
// Traduit un objet de préférences de table web (players/stack/blind/raiseMode/
// raiseEvery/manualOrder/manualBlinds/endRaiseMode/endRaiseValue) vers les clés
// officielles, avec le préfixe '' (locale) ou 'Net' (réseau/Internet).
function _cfgBlindsKeys(p, net, out, lists) {
  var P = net ? 'Net' : '';
  if (p.players != null) out[P + 'NumberOfPlayers'] = parseInt(p.players, 10) || 10;
  if (p.stack   != null) out[P + 'StartCash']       = parseInt(p.stack, 10) || 3000;
  if (p.blind   != null) out[P + 'FirstSmallBlind'] = parseInt(p.blind, 10) || 10;
  if (p.raiseMode != null) {
    var byMin = String(p.raiseMode) === '2';
    out[P + 'RaiseBlindsAtHands']   = byMin ? 0 : 1;
    out[P + 'RaiseBlindsAtMinutes'] = byMin ? 1 : 0;
    if (p.raiseEvery != null) out[P + (byMin ? 'RaiseSmallBlindEveryMinutes' : 'RaiseSmallBlindEveryHands')] = parseInt(p.raiseEvery, 10) || 8;
  }
  if (p.manualOrder != null) {
    out[P + 'AlwaysDoubleBlinds'] = p.manualOrder ? 0 : 1;
    out[P + 'ManualBlindsOrder']  = p.manualOrder ? 1 : 0;
  }
  if (p.manualBlinds != null && String(p.manualBlinds) !== '') {
    var vals = String(p.manualBlinds).split(',').map(function (s) { return parseInt(s, 10); })
      .filter(function (n) { return Number.isInteger(n) && n > 0; });
    if (vals.length) lists[P + 'ManualBlindsList'] = { sub: P ? 'NetBlind' : 'Blind', values: vals };
  }
  if (p.endRaiseMode != null) {
    var m = parseInt(p.endRaiseMode, 10) || 1;
    out[P + 'AfterMBAlwaysDoubleBlinds'] = m === 1 ? 1 : 0;
    out[P + 'AfterMBAlwaysRaiseAbout']   = m === 2 ? 1 : 0;
    out[P + 'AfterMBStayAtLastBlind']    = m === 3 ? 1 : 0;
    if (m === 2 && p.endRaiseValue != null) out[P + 'AfterMBAlwaysRaiseValue'] = parseInt(p.endRaiseValue, 10) || 0;
  }
}
// Construit { scalars: {clé: valeur}, lists: {clé: {sub, values[]}} } depuis
// l'état web courant — la table de vérité du mapping web → officiel.
function _cfgCollectWebSettings() {
  var out = {}, lists = {};
  var B = function (advKey, def) { return _advGet(advKey, def) ? 1 : 0; };
  // Identité & connexion
  var nick = _cfgLs('pth_nick') || _cfgLs('pth_offline_nick') || _cfgLs('pth_lan_nick');
  if (nick) out.MyName = nick;
  var host = _cfgLs('pth_host'); if (host) out.InternetServerAddress = host;
  var port = parseInt(_cfgLs('pth_port') || '', 10); if (port) out.InternetServerPort = port;
  // Interface (défauts = ceux du web, mêmes que resetAdvDefaults)
  out.ShowFadeOutCardsAnimation = B('fade_losers', true);
  out.ShowFlipCardsAnimation    = B('anim_cards', true);
  out.AlternateFKeysUserActionMode = B('fkeys_alt', false);
  out.ShowBlindButtons          = B('show_blinds', true);
  out.ShowPotPercentButtons     = B('pot_btns', true);
  out.AntiPeekMode              = B('own_click', false);
  out.AccidentallyCallBlocker   = B('guard_call', true);
  out.EnableBetInputFocusSwitch = B('focus_bet', false);
  out.ShowCountryFlagInAvatar   = B('show_flag', true);
  out.ShowPingStateInAvatar     = B('ping_avatar', true);
  out.DontHideAvatarsOfIgnored  = B('no_hide_ignored', false);
  out.UseLobbyChat              = B('lobby_chat', true);
  out.DisableEmojiReactions     = B('react_muted', false);
  out.QmlReduceEffects          = B('reduce_fx', false);
  out.NetAutoLeaveGameAfterFinish = B('auto_leave', false);
  out.PauseBetweenHands         = B('pause_hands', false);
  out.DontTranslateInternationalPokerStringsFromStyle = B('poker_en', true);  // case « ne pas traduire » (parité)
  out.DisableSplashScreenOnStartup = B('splash', true) ? 0 : 1;  // clé officielle inversée (1 = pas de splash)
  // Sons (catégories officielles)
  out.PlayGameActions             = B('snd_actions', true);
  out.PlayLobbyChatNotification   = B('snd_lobby', true);
  out.PlayNetworkGameNotification = B('snd_net', true);
  out.PlayBlindRaiseNotification  = B('snd_blinds', true);
  out.PlaySoundEffects = (out.PlayGameActions || out.PlayLobbyChatNotification || out.PlayNetworkGameNotification || out.PlayBlindRaiseNotification) ? 1 : 0;
  // Styles (noms transportés tels quels — pas forcément identiques entre clients)
  var tbl = _cfgLs('pth_table');    if (tbl) out.QmlGameTableStyle = tbl;
  var dck = _cfgLs('pth_deck');     if (dck) out.QmlCardDeckStyle  = dck;
  var cbk = _cfgLs('pth_cardback'); if (cbk) out.QmlCardBackStyle  = cbk;
  // Préférences de table : locale + réseau/Internet
  var pl = _cfgReadPrefs('pth_prefs_local');
  _cfgBlindsKeys(pl, false, out, lists);
  if (pl.guiSpeed != null) out.GameSpeed = parseInt(pl.guiSpeed, 10) || 4;
  var pn = _cfgReadPrefs('pth_prefs_internet');
  _cfgBlindsKeys(pn, true, out, lists);
  if (pn.guiSpeed   != null) out.NetGameSpeed          = parseInt(pn.guiSpeed, 10) || 4;
  if (pn.timeout    != null) out.NetTimeOutPlayerAction = parseInt(pn.timeout, 10) || 20;
  if (pn.delayHands != null) out.NetDelayBetweenHands   = parseInt(pn.delayHands, 10) || 7;
  if (pn.name)               out.InternetGameName       = String(pn.name).slice(0, 60);
  if (pn.gameType   != null) out.InternetGameType       = parseInt(pn.gameType, 10) || 1;
  if (pn.allowSpectators != null) out.InternetGameAllowSpectators = pn.allowSpectators ? 1 : 0;
  if (pn.usePassword != null) out.UseInternetGamePassword = pn.usePassword ? 1 : 0;
  if (pn.usePassword && pn.password) out.InternetGamePassword = String(pn.password);
  return { scalars: out, lists: lists };
}
// Parse un config.xml (DOMParser) → { scalars, lists, order[] } ; jette si invalide.
function _cfgParseXml(text) {
  var doc = new DOMParser().parseFromString(text, 'text/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('invalid XML');
  var root = doc.documentElement;
  if (!root || root.tagName !== 'PokerTH') throw new Error('not a PokerTH config');
  var conf = root.getElementsByTagName('Configuration')[0];
  if (!conf) throw new Error('missing <Configuration>');
  var scalars = {}, lists = {}, order = [];
  for (var el = conf.firstElementChild; el; el = el.nextElementSibling) {
    var name = el.tagName;
    order.push(name);
    if (el.getAttribute('type') === 'list') {
      var values = [], sub = null;
      for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
        if (sub === null) sub = c.tagName;
        values.push(c.getAttribute('value') || '');
      }
      lists[name] = { sub: sub || el.getAttribute('value') || 'Entry', values: values };
    } else {
      scalars[name] = el.getAttribute('value') || '';
    }
  }
  return { scalars: scalars, lists: lists, order: order };
}
// Export : round-trip (XML importé précédemment) fusionné avec l'état web
// courant (le web gagne sur les clés mappées), sérialisé au format officiel.
function _cfgBuildXml() {
  var web = _cfgCollectWebSettings();
  var base = { scalars: {}, lists: {}, order: [] };
  var stored = _cfgLs(PTH_CFG_XML_KEY);
  if (stored) { try { base = _cfgParseXml(stored); } catch (e) { base = { scalars: {}, lists: {}, order: [] }; } }
  Object.keys(web.scalars).forEach(function (k) { base.scalars[k] = web.scalars[k]; });
  Object.keys(web.lists).forEach(function (k) { base.lists[k] = web.lists[k]; });
  if (base.scalars.ConfigRevision == null) base.scalars.ConfigRevision = 108;  // configfile.cpp actuel
  // Ordre : celui du fichier importé d'abord (diff lisible côté Qt), puis les nouvelles clés.
  var seen = {}, names = [];
  base.order.forEach(function (k) { if (!seen[k] && (k in base.scalars || k in base.lists)) { seen[k] = 1; names.push(k); } });
  Object.keys(base.scalars).concat(Object.keys(base.lists)).forEach(function (k) { if (!seen[k]) { seen[k] = 1; names.push(k); } });
  var xml = "<?xml version=\"1.0\" encoding='utf-8'?>\n<PokerTH>\n <Configuration>\n";
  names.forEach(function (k) {
    if (k in base.lists) {
      var L = base.lists[k];
      xml += '  <' + k + ' type="list" value="' + _cfgXmlEsc(L.sub) + '">\n';
      L.values.forEach(function (v) { xml += '   <' + L.sub + ' value="' + _cfgXmlEsc(v) + '"/>\n'; });
      xml += '  </' + k + '>\n';
    } else {
      xml += '  <' + k + ' value="' + _cfgXmlEsc(base.scalars[k]) + '"/>\n';
    }
  });
  xml += ' </Configuration>\n</PokerTH>\n';
  return xml;
}
function exportPokerthConfig() {
  var xml;
  try { xml = _cfgBuildXml(); } catch (e) {
    if (typeof showToast === 'function') showToast('Export failed: ' + e.message, { tone: 'error' });
    return;
  }
  try {
    var blob = new Blob([xml], { type: 'application/xml' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'config.xml';                     // nom attendu dans ~/.pokerth/
    document.body.appendChild(a); a.click();
    setTimeout(function () { try { URL.revokeObjectURL(a.href); a.remove(); } catch (e) {} }, 2000);
  } catch (e) {
    if (typeof showToast === 'function') showToast('Export failed: ' + e.message, { tone: 'error' });
    return;
  }
  if (typeof showToast === 'function') showToast(t('cfgXmlExported') || 'config.xml exported');
}
window.exportPokerthConfig = exportPokerthConfig;
// Import : applique les clés mappées à l'état web, conserve le XML complet
// pour le round-trip, puis propose de recharger (comme le redémarrage demandé
// par l'officiel après un reset).
function _cfgApplyImported(cfg) {
  var S = cfg.scalars, L = cfg.lists;
  var num = function (k) { var v = parseInt(S[k], 10); return isNaN(v) ? null : v; };
  var setB = function (advKey, cfgKey) { if (S[cfgKey] != null) setAdvOpt(advKey, num(cfgKey) !== 0); };
  if (S.MyName) {
    try { localStorage.setItem('pth_nick', S.MyName); } catch (e) {}
  }
  if (S.InternetServerAddress) { try { localStorage.setItem('pth_host', S.InternetServerAddress); } catch (e) {} }
  if (num('InternetServerPort')) { try { localStorage.setItem('pth_port', String(num('InternetServerPort'))); } catch (e) {} }
  setB('fade_losers', 'ShowFadeOutCardsAnimation');
  setB('anim_cards', 'ShowFlipCardsAnimation');
  setB('fkeys_alt', 'AlternateFKeysUserActionMode');
  setB('show_blinds', 'ShowBlindButtons');
  setB('own_click', 'AntiPeekMode');
  setB('guard_call', 'AccidentallyCallBlocker');
  setB('focus_bet', 'EnableBetInputFocusSwitch');
  setB('show_flag', 'ShowCountryFlagInAvatar');
  setB('pot_btns', 'ShowPotPercentButtons');
  setB('ping_avatar', 'ShowPingStateInAvatar');
  setB('no_hide_ignored', 'DontHideAvatarsOfIgnored');
  setB('lobby_chat', 'UseLobbyChat');
  setB('react_muted', 'DisableEmojiReactions');
  setB('reduce_fx', 'QmlReduceEffects');
  setB('auto_leave', 'NetAutoLeaveGameAfterFinish');
  setB('pause_hands', 'PauseBetweenHands');
  setB('poker_en', 'DontTranslateInternationalPokerStringsFromStyle');
  if (S.DisableSplashScreenOnStartup != null) setAdvOpt('splash', num('DisableSplashScreenOnStartup') === 0);  // inversée
  setB('snd_actions', 'PlayGameActions');
  setB('snd_lobby', 'PlayLobbyChatNotification');
  setB('snd_net', 'PlayNetworkGameNotification');
  setB('snd_blinds', 'PlayBlindRaiseNotification');
  // Styles : appliqués seulement si le nom existe côté web (sinon ignorés
  // silencieusement — les catalogues diffèrent entre clients).
  ['QmlGameTableStyle:pth_table', 'QmlCardDeckStyle:pth_deck', 'QmlCardBackStyle:pth_cardback'].forEach(function (pair) {
    var ck = pair.split(':')[0], lk = pair.split(':')[1];
    if (S[ck]) { try { localStorage.setItem(lk, S[ck]); } catch (e) {} }
  });
  // Préférences de table : fusion champ à champ dans les prefs web.
  var mergePrefs = function (storageKey, net) {
    var P = net ? 'Net' : '';
    var d = {};
    try { d = JSON.parse(localStorage.getItem(storageKey) || 'null') || {}; } catch (e) { d = {}; }
    var n = function (k) { var v = parseInt(S[P + k], 10); return isNaN(v) ? null : v; };
    if (n('NumberOfPlayers') != null) d.players = n('NumberOfPlayers');
    if (n('StartCash')       != null) d.stack   = n('StartCash');
    if (n('FirstSmallBlind') != null) d.blind   = n('FirstSmallBlind');
    if (S[P + 'RaiseBlindsAtMinutes'] != null || S[P + 'RaiseBlindsAtHands'] != null) {
      var byMin = n('RaiseBlindsAtMinutes') === 1;
      d.raiseMode = byMin ? '2' : '1';
      var ev = byMin ? n('RaiseSmallBlindEveryMinutes') : n('RaiseSmallBlindEveryHands');
      if (ev != null) d.raiseEvery = ev;
    }
    if (S[P + 'ManualBlindsOrder'] != null) d.manualOrder = n('ManualBlindsOrder') === 1;
    var ml = L[P + 'ManualBlindsList'];
    if (ml) d.manualBlinds = ml.values.map(function (v) { return parseInt(v, 10); })
      .filter(function (x) { return Number.isInteger(x) && x > 0; }).sort(function (a, b) { return a - b; }).join(',');
    if (S[P + 'AfterMBAlwaysRaiseAbout'] === '1')      d.endRaiseMode = '2';
    else if (S[P + 'AfterMBStayAtLastBlind'] === '1')  d.endRaiseMode = '3';
    else if (S[P + 'AfterMBAlwaysDoubleBlinds'] != null) d.endRaiseMode = '1';
    if (n('AfterMBAlwaysRaiseValue') != null) d.endRaiseValue = n('AfterMBAlwaysRaiseValue');
    if (net) {
      if (n('NetGameSpeed')           != null) d.guiSpeed   = n('NetGameSpeed');
      if (n('NetTimeOutPlayerAction') != null) d.timeout    = n('NetTimeOutPlayerAction');
      if (n('NetDelayBetweenHands')   != null) d.delayHands = n('NetDelayBetweenHands');
      if (S.InternetGameName)                  d.name       = String(S.InternetGameName).slice(0, 60);
      if (S.InternetGameType != null)          d.gameType   = String(parseInt(S.InternetGameType, 10) || 1);
      if (S.InternetGameAllowSpectators != null) d.allowSpectators = S.InternetGameAllowSpectators !== '0';
      if (S.UseInternetGamePassword != null)   d.usePassword = S.UseInternetGamePassword === '1';
      if (S.InternetGamePassword)              d.password    = String(S.InternetGamePassword);
    } else {
      if (n('GameSpeed') != null) d.guiSpeed = n('GameSpeed');
    }
    try { localStorage.setItem(storageKey, JSON.stringify(d)); } catch (e) {}
  };
  mergePrefs('pth_prefs_local', false);
  mergePrefs('pth_prefs_internet', true);
}
function importPokerthConfigPick() {
  var inp = document.getElementById('adv-cfgxml-file');
  if (!inp) return;
  inp.value = '';
  inp.onchange = function () {
    var f = inp.files && inp.files[0];
    if (!f) return;
    if (f.size > 512 * 1024) { if (typeof showToast === 'function') showToast(t('cfgXmlImportErr') || 'Import failed', { tone: 'error' }); return; }
    var r = new FileReader();
    r.onload = function () {
      try {
        var text = String(r.result || '');
        var cfg = _cfgParseXml(text);
        // Round-trip : garder le fichier ENTIER, machine-keys comprises (elles
        // seront réécrites telles quelles ; l'officiel corrige AppDataDir seul).
        try { localStorage.setItem(PTH_CFG_XML_KEY, text.slice(0, 400000)); } catch (e) {}
        Object.keys(PTH_CFG_MACHINE_KEYS).forEach(function (k) { delete cfg.scalars[k]; });
        _cfgApplyImported(cfg);
        var msg = t('cfgXmlImported') || 'config.xml imported';
        if (typeof showToast === 'function') showToast(msg);
        // Comme le « redémarre PokerTH » de l'officiel : proposer un rechargement
        // pour appliquer thèmes/decks et resynchroniser toute l'UI.
        setTimeout(function () {
          var q = t('cfgXmlReload') || 'Reload now to apply everything?';
          if (window.confirm(msg + '\n\n' + q)) { try { location.reload(); } catch (e) {} }
        }, 150);
      } catch (e) {
        if (typeof showToast === 'function') showToast((t('cfgXmlImportErr') || 'Import failed') + ' — ' + e.message, { tone: 'error' });
      }
    };
    r.readAsText(f);
  };
  inp.click();
}
window.importPokerthConfigPick = importPokerthConfigPick;

// ── Phase 2 : synchronisation du config.xml liée au COMPTE (opt-in) ─────────
// Réservée aux logins AUTHENTIFIÉS (compte pokerth enregistré) : le proxy
// n'émet un jeton de session (trame texte SYNCTOK:) qu'après l'InitAck d'un
// login SCRAM vérifié par le serveur. Invités / LAN non authentifiés : jamais
// de jeton, donc jamais de sync. Le blob synchronisé = exactement le même
// config.xml que l'export manuel (round-trip compris).
// Réconciliation : pth_cfg_sync_ts = updatedAt serveur du dernier état commun ;
// serveur plus récent → on applique ; local modifié (drapeau dirty posé par
// les hooks setAdvOpt/advPrefSet/saveCreatePrefs) → on pousse (debounce 5 s,
// et au pagehide en best-effort keepalive).
var _cfgSyncToken = null;
var _cfgSyncPushTimer = null;
function _cfgSyncEnabled() { return _advGet('cfg_sync', true); }
// ── Blob « web-only » : réglages SANS clé dans le config.xml officiel, poussés
// en JSON séparé (/prefs-web) pour couvrir 100 % des options sans jamais
// polluer le XML interopérable. Whitelist explicite (jamais de clés machine
// type pth_cfg_sync_ts, jetons, caches).
var _CFG_WEB_SYNC_KEYS = [
  // Toggles web-only (via setAdvOpt → pth_<clé>)
  'pth_show_community', 'pth_chat_noemoji', 'pth_chat_ts',
  'pth_assist', 'pth_show_odds', 'pth_hands_btn', 'pth_voice',
  'pth_haptic', 'pth_display_bb', 'pth_table_zoom', 'pth_zoom_follow',
  'pth_community_content', 'pth_sound_vol',
  'pth_log_on', 'pth_create_dialog', 'pth_status_bar', 'pth_blinds_badge',
  'pth_winner_popup', 'pth_remove_gone', 'pth_tooltips', 'pth_big_own_cards',
  'pth_chat_translate', 'pth_pin_actionbar',
  // Valeurs (thème web, sièges, clavier, langue, divers)
  'pth_theme', 'pth_buttons', 'pth_pucks', 'pth_seat', 'pth_seat_layout',
  'pth_seat_custom', 'pth_keys', 'pth_lang', 'pth_offline_skill',
  'pth_log_interval', 'pth_avatar', 'pth_ignored', 'pth_prefs_lan'
];
function _cfgWebCollect() {
  var o = {};
  _CFG_WEB_SYNC_KEYS.forEach(function (k) {
    var v = _cfgLs(k);
    if (v != null && v.length <= 20000) o[k] = v;   // skippe les valeurs énormes (ex. avatar image)
  });
  return o;
}
function _cfgWebDirty() {
  try { return JSON.stringify(_cfgWebCollect()) !== (_cfgLs('pth_cfg_sync_weblast') || ''); }
  catch (e) { return false; }
}
function _cfgWebPushNow(keepalive) {
  if (!_cfgSyncToken || !_cfgSyncEnabled()) return;
  var body; try { body = JSON.stringify(_cfgWebCollect()); } catch (e) { return; }
  if (body === (_cfgLs('pth_cfg_sync_weblast') || '')) return;   // rien de neuf
  fetch('/prefs-web',
        { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + _cfgSyncToken }, body: body, keepalive: !!keepalive })
    .then(function (r) {
      if (r.status === 429) { if (!keepalive) _cfgSyncPushSoon(6000); return null; }
      return r.json();
    })
    .then(function (d) {
      if (d && d.ok) {
        try { localStorage.setItem('pth_cfg_sync_weblast', body); } catch (e) {}
        try { localStorage.setItem('pth_cfg_sync_webts', String(d.updatedAt || Date.now())); } catch (e) {}
      }
    }).catch(function () {});
}
// Application silencieuse du blob reçu (mêmes chemins que les setters : les
// toggles avancés sont ré-appliqués live ; thème/langue prennent effet au
// prochain chargement, comme l'import de config.xml).
function _cfgWebApply(o) {
  if (!o || typeof o !== 'object') return;
  var changed = false;
  _CFG_WEB_SYNC_KEYS.forEach(function (k) {
    if (typeof o[k] === 'string' && o[k].length <= 20000) {
      try {
        if (localStorage.getItem(k) !== o[k]) { localStorage.setItem(k, o[k]); changed = true; }
      } catch (e) {}
    }
  });
  if (!changed) return;
  try { applyAdvOpts(); } catch (e) {}
  try { if (typeof applyTooltips === 'function') applyTooltips(); } catch (e) {}
  try {
    var sl = _cfgLs('pth_seat_layout'); if (sl) document.documentElement.setAttribute('data-seat-layout', sl);
    if (typeof window._renderSeatsNow === 'function') window._renderSeatsNow();
    else if (typeof window._renderSeats === 'function') window._renderSeats();
  } catch (e) {}
}
function _cfgSyncMark(key) {
  if (key === 'cfg_sync') return;                 // (dé)cocher la sync n'est pas une donnée à pousser
  try { localStorage.setItem('pth_cfg_sync_dirty', '1'); } catch (e) {}
  _cfgSyncPushSoon();
}
function _cfgSyncPushSoon(ms) {
  if (!_cfgSyncToken || !_cfgSyncEnabled()) return;
  clearTimeout(_cfgSyncPushTimer);
  _cfgSyncPushTimer = setTimeout(function () { _cfgSyncPushNow(); }, ms == null ? 5000 : ms);
}
function _cfgSyncPushNow(keepalive) {
  if (!_cfgSyncToken || !_cfgSyncEnabled()) return;
  var xml; try { xml = _cfgBuildXml(); } catch (e) { return; }
  fetch('/prefs',
        { method: 'PUT', headers: { 'Content-Type': 'application/xml', 'Authorization': 'Bearer ' + _cfgSyncToken }, body: xml, keepalive: !!keepalive })
    .then(function (r) {
      // 429 = rate-limit serveur (1 écriture/5 s par compte) : le drapeau dirty
      // reste posé, on re-tente un peu plus tard (pas au pagehide).
      if (r.status === 429) { if (!keepalive) _cfgSyncPushSoon(6000); return null; }
      return r.json();
    })
    .then(function (d) {
      if (d && d.ok) {
        try { localStorage.setItem('pth_cfg_sync_ts', String(d.updatedAt || Date.now())); } catch (e) {}
        try { localStorage.removeItem('pth_cfg_sync_dirty'); } catch (e) {}
      }
    }).catch(function () {});
  _cfgWebPushNow(keepalive);
}
function _cfgSyncPull() {
  if (!_cfgSyncToken || !_cfgSyncEnabled()) return;
  fetch('/prefs', { headers: { 'Authorization': 'Bearer ' + _cfgSyncToken } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.ok) return;
      var localTs = parseInt(_cfgLs('pth_cfg_sync_ts') || '0', 10) || 0;
      var dirty = _cfgLs('pth_cfg_sync_dirty') === '1';
      if (d.xml && (d.updatedAt || 0) > localTs) {
        // Le serveur a plus récent → appliquer ici (silencieux, pas de reload forcé).
        try {
          var cfg = _cfgParseXml(d.xml);
          try { localStorage.setItem(PTH_CFG_XML_KEY, String(d.xml).slice(0, 400000)); } catch (e) {}
          Object.keys(PTH_CFG_MACHINE_KEYS).forEach(function (k) { delete cfg.scalars[k]; });
          _cfgApplyImported(cfg);
          try { localStorage.setItem('pth_cfg_sync_ts', String(d.updatedAt)); } catch (e) {}
          try { localStorage.removeItem('pth_cfg_sync_dirty'); } catch (e) {}
          if (typeof showToast === 'function') showToast(t('cfgSyncApplied') || 'Settings synced from your account');
        } catch (e) {}
      } else if (!d.xml || dirty) {
        _cfgSyncPushSoon(500);                    // 1er appareil, ou modifs locales hors-ligne
      }
      // Blob web-only : même réconciliation, horodatage séparé.
      var webTs = parseInt(_cfgLs('pth_cfg_sync_webts') || '0', 10) || 0;
      if (d.web && typeof d.web === 'object' && (d.webUpdatedAt || 0) > webTs) {
        try {
          _cfgWebApply(d.web);
          localStorage.setItem('pth_cfg_sync_webts', String(d.webUpdatedAt));
          localStorage.setItem('pth_cfg_sync_weblast', JSON.stringify(_cfgWebCollect()));
        } catch (e) {}
      } else if (_cfgWebDirty()) {
        _cfgSyncPushSoon(500);
      }
    }).catch(function () {});
}
// Jeton reçu du proxy (trame SYNCTOK:) — appelé par le handler WS.
window._cfgSyncOnToken = function (tok) {
  _cfgSyncToken = String(tok || '') || null;
  if (_cfgSyncToken) _cfgSyncPull();
};
// Case à cocher : activer = tirer d'abord (l'état du compte gagne sur un
// appareil qui vient d'activer) ; _cfgSyncPull() pousse s'il n'y a rien côté serveur.
window.cfgSyncToggle = function (el) {
  setAdvOpt('cfg_sync', !!(el && el.checked));
  if (el && el.checked) _cfgSyncPull();
};
// Dernière chance avant fermeture/onglet caché : push best-effort.
window.addEventListener('pagehide', function () {
  try { if (_cfgLs('pth_cfg_sync_dirty') === '1' || _cfgWebDirty()) _cfgSyncPushNow(true); } catch (e) {}
});
// Placement des sièges (Options avancées) : 'auto' | 'pokerth-official' | 'pokerth-ellipse'. Persiste +
// re-rend les sièges via le hook global window._renderSeats.
function setSeatLayout(v) {
  v = (v === 'pokerth-official' || v === 'pokerth-ellipse' || v === 'custom') ? v : 'auto';
  try { localStorage.setItem('pth_seat_layout', v); } catch (e) {}
  try { document.documentElement.setAttribute('data-seat-layout', v); } catch (e) {}
  // Quitter le mode custom pendant l'edition doit TERMINER l'edition, sinon le
  // rendu reste gele (window._seatEditMode) et les autres modes semblent inertes.
  if (window._seatEditMode && v !== 'custom' && typeof window._seatEditExit === 'function') {
    try { window._seatEditExit(); } catch (e) {}   // re-rend au passage
  } else {
    // iOS : le re-rendu via requestAnimationFrame (window._renderSeats) peut ne
    // PAS s'appliquer a la partie en cours apres la fermeture du selecteur natif
    // (rAF gele pendant l'ouverture du picker) -> impression qu'il faut rejoindre
    // une partie. On force donc un rendu SYNCHRONE immediat (window._renderSeatsNow),
    // puis on repete via setTimeout (les timers ne sont pas geles) pour rattraper
    // tout etat de mesure transitoire. Desktop/tablette : deja instantane, inchange.
    var _applyNow = function () {
      try {
        if (typeof window._renderSeatsNow === 'function') window._renderSeatsNow();
        else if (typeof window._renderSeats === 'function') window._renderSeats();
      } catch (e) {}
    };
    _applyNow();
    setTimeout(_applyNow, 120);
    setTimeout(_applyNow, 400);
  }
}
window.setSeatLayout = setSeatLayout;
// ── Synchronisation automatique du PACK de sieges avec l'orientation
// (Options avancees, sous le placement) : si activee, ecran PORTRAIT ->
// sieges « PokerTH portrait », ecran PAYSAGE -> sieges « PokerTH
// landscape ». Force le pack (le choix manuel du panneau Style est
// remplace tant que l'option est active). Applique au demarrage, au
// resize et au changement d'orientation.
// Bascule portrait/paysage UNIQUE (parité GamePage.qml:453 `wide: width >=
// height` sur la tableZone). tableZone web = #g-table-zone + player-bar
// visible (le QML inclut la self-box dans sa zone). Repli : orientation
// fenêtre (zone absente/cachée, ex. lobby au démarrage).
function _tableZonePortrait() {
  try {
    var z = document.getElementById('g-table-zone');
    var r = z ? z.getBoundingClientRect() : null;
    if (r && r.width > 0) {
      var h = r.height;
      var pb = document.querySelector('.player-bar');
      if (pb && pb.offsetParent !== null) h += pb.getBoundingClientRect().height;
      return h > r.width;
    }
  } catch (e) {}
  return window.innerHeight > window.innerWidth;
}
window._tableZonePortrait = _tableZonePortrait;

function _applySeatOrient(portrait) {
  try {
    // Orientation générique des sièges (fusion des packs pokerth /
    // pokerth-portrait, 0.3.691) : html[data-seat-orient="portrait|landscape"],
    // que TOUT pack peut cibler en CSS. Suit la DISPOSITION réellement retenue
    // quand renderSeats la connaît (_forceSeatPortrait passé en argument),
    // sinon le ratio de la tableZone (parité QML : GamePlayerBox.wideLayout
    // décide sur la tableZone, pas la fenêtre).
    var p = (typeof portrait === 'boolean') ? portrait : _tableZonePortrait();
    var want = p ? 'portrait' : 'landscape';
    if (document.documentElement.getAttribute('data-seat-orient') !== want)
      document.documentElement.setAttribute('data-seat-orient', want);
  } catch (e) {}
}
// ── Traduction du chat par l'endpoint Google gtx (même méthode que le client
// QML de sp0ck : fetch direct depuis le navigateur → l'IP du joueur porte le
// quota, rien à installer côté serveur). Opt-in via Options avancées
// (pth_chat_translate). Bouton 🌐 par message reçu : 1er tap = traduire vers
// la langue du client, 2e tap = revenir à l'original. Cache par message
// (dataset.trText). Hors-ligne ou endpoint indisponible : le tap échoue
// proprement (tr-err), le reste de l'app reste jouable.
window._chatTrSupported = (function () {
  try { return typeof fetch === 'function'; } catch (e) { return false; }
})();
function _chatTrTarget() {
  // Langue cible = langue VIVANTE de l'i18n (window._lang), qui vaut aussi en
  // mode auto-détection. pth_lang n'existe que si l'utilisateur a choisi
  // manuellement une langue — s'y fier seul envoyait tl=en par défaut et
  // traduisait en anglais des messages déjà dans la langue du joueur.
  var l = '';
  try { l = String(window._lang || ''); } catch (e) {}
  if (!l) { try { l = localStorage.getItem('pth_lang') || ''; } catch (e) {} }
  if (!l) { try { l = document.documentElement.lang || navigator.language || 'en'; } catch (e) { l = 'en'; } }
  var low = l.toLowerCase();
  if (low === 'zh-tw') return 'zh-TW'; // gtx distingue trad./simplifié
  if (low === 'zh') return 'zh-CN';
  if (low === 'pt-pt') return 'pt-PT'; // gtx : pt = pt-BR
  return low.split('-')[0];
}
function _applyChatTranslateFlag() {
  // ACTIVE par defaut (demande narmod) : seul un '0' explicite desactive.
  var on = true;
  try { on = localStorage.getItem('pth_chat_translate') !== '0'; } catch (e) {}
  document.body.classList.toggle('chat-tr-on', !!(on && window._chatTrSupported));
}
function setChatTranslate(on) {
  try { localStorage.setItem('pth_chat_translate', on ? '1' : '0'); } catch (e) {}
  _applyChatTranslateFlag();
}
window.setChatTranslate = setChatTranslate;
window._chatTranslate = function (btn) {
  var msg = btn && btn.closest ? btn.closest('.msg') : null;
  var span = msg ? msg.querySelector('.txt') : null;
  if (!msg || !span) return;
  // Toggle retour a l'original
  if (msg.dataset.trShown === '1') {
    if (msg.dataset.origHtml) span.innerHTML = msg.dataset.origHtml;
    msg.dataset.trShown = '0'; btn.classList.remove('tr-active');
    return;
  }
  if (msg.dataset.trText) { // deja traduit : re-afficher depuis le cache
    if (!msg.dataset.origHtml) msg.dataset.origHtml = span.innerHTML;
    span.textContent = msg.dataset.trText;
    msg.dataset.trShown = '1'; btn.classList.add('tr-active');
    return;
  }
  var orig = msg.dataset.orig || span.textContent || '';
  if (!orig.trim() || !window._chatTrSupported) return;
  btn.disabled = true; btn.classList.add('tr-busy');
  var tgt = _chatTrTarget();
  var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
    encodeURIComponent(tgt) + '&dt=t&q=' + encodeURIComponent(orig);
  fetch(url).then(function (r) {
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }).then(function (data) {
    // Réponse gtx : [ [[traduit, original, ...], ...], null, langueDétectée, ... ]
    var src = (data && typeof data[2] === 'string') ? data[2].split('-')[0] : '';
    if (src && src === tgt) { // deja dans la langue du client
      btn.classList.add('tr-same');
      return;
    }
    var out = '';
    if (data && data[0] && data[0].length) {
      for (var i = 0; i < data[0].length; i++) {
        if (data[0][i] && typeof data[0][i][0] === 'string') out += data[0][i][0];
      }
    }
    if (out && out.trim()) {
      msg.dataset.trText = out;
      if (!msg.dataset.origHtml) msg.dataset.origHtml = span.innerHTML;
      span.textContent = out;
      msg.dataset.trShown = '1'; btn.classList.add('tr-active');
    }
  }).catch(function (e) {
    btn.classList.add('tr-err');
    try { btn.title = t('chatTranslateFailed'); } catch (_e) {}
  }).finally(function () {
    btn.disabled = false; btn.classList.remove('tr-busy');
  });
};
try { _applyChatTranslateFlag(); } catch (e) {}
window._applySeatOrient = _applySeatOrient;
// ── Descripteur de pack de sièges (étape 3) ────────────────────────────────
// Traits comportementaux du pack actif, résolus par le module theme
// (window._seatPackTraits : packs intégrés + "traits" du seat.json des packs
// importés). Repli avant chargement du module : traits QML complets — la
// structure commune est la norme (seul un pack importé peut s'en écarter
// via ses traits, résolus dès que le module theme est chargé).
function _seatTraitsNow() {
  var id = '';
  try { id = document.documentElement.getAttribute('data-seat') || ''; } catch (e) {}
  try { if (typeof window._seatPackTraits === 'function') { var t = window._seatPackTraits(id); if (t) return t; } } catch (e) {}
  return { holePlate: true, betOut: true, pucksSide: true, flagInfo: true, timerRect: false,
           timerBar: true, winnerBadge: true, selfStrip: true, selfBigCards: true,
           badgeOnCards: true, qmlSelf: true, narrowByOrient: true, qmlStruct: true };
}
setTimeout(function () { try { _applySeatOrient(); } catch (e) {} }, 800);
// Appliquer les classes body dès l'init (les prefs sont reflétées au chargement).
try {
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', applyAdvOpts);
  else applyAdvOpts();
} catch (e) {}
try {
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', applyTooltips);
  else applyTooltips();
} catch (e) {}

// [Phase 2] animateDealMyCards + flashActionLabel déplacées dans
// public/modules/ui/anim.mjs (toujours globales via window.*).
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


// [Phase 2] Raccourcis clavier (détection clavier physique, bindings
// personnalisables, handlers F1-F8/lettres, showKeyHint) déplacés dans
// public/modules/ui/shortcuts.mjs (toujours globaux via window.*).

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
// ── Liens cliquables dans le chat ──────────────────────────────────
// Rend cliquables les URLs http(s)/mailto d'un texte de chat DÉJÀ échappé HTML
// (pipeline chat : esc() + éventuel applyChatEmoteShortcuts, qui n'insère aucune
// balise — que du texte + emojis unicode). URLs nues uniquement ; la ponctuation
// de fin (.,!?) reste hors du lien ; les guillemets sont neutralisés pour l'attribut
// href (défense XSS : esc() côté chat n'échappe pas " / '). Ouvre dans un nouvel onglet.
function _linkifyChatHtml(html) {
  var RE = /((?:https?:\/\/|mailto:)[^\s<]+)/g;
  return String(html == null ? '' : html).replace(RE, function (url) {
    var trail = '', m = url.match(/[.,!?]+$/);
    if (m) { trail = m[0]; url = url.slice(0, -trail.length); }
    var href = url.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return _annLink(href, url) + trail;
  });
}
window._linkifyChatHtml = _linkifyChatHtml;
function hideInfoToast() { if (window._infoToastCdTimer) { clearInterval(window._infoToastCdTimer); window._infoToastCdTimer = null; } var el = document.getElementById('srv-info-toast'); if (el) el.remove(); }
// Format compact d'un temps restant : '2d 03:04:05', '1:02:03' ou '12:34'.
function _fmtCountdown(ms) {
  if (ms < 0) ms = 0;
  var t = Math.floor(ms / 1000);
  var d = Math.floor(t / 86400); t -= d * 86400;
  var h = Math.floor(t / 3600);  t -= h * 3600;
  var m = Math.floor(t / 60), sec = t - m * 60;
  function p(n) { return (n < 10 ? '0' : '') + n; }
  if (d > 0) return d + 'd ' + p(h) + ':' + p(m) + ':' + p(sec);
  if (h > 0) return h + ':' + p(m) + ':' + p(sec);
  return m + ':' + p(sec);
}
function showInfoToast(message, icon, cdAt) {
  hideInfoToast();
  var top = document.getElementById('srv-restart-notice') ? 76 : 16;
  var el = document.createElement('div');
  el.id = 'srv-info-toast';
  el.style.cssText = 'position:fixed;top:' + top + 'px;left:50%;transform:translateX(-50%);max-width:min(92vw,420px);z-index:9999;display:flex;align-items:flex-start;gap:10px;background:var(--gold);color:var(--on-gold);padding:11px 15px;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.25) inset;font-weight:600;font-size:.9rem;line-height:1.4;white-space:pre-line;';
  if (icon) { var ic = document.createElement('span'); ic.textContent = icon; ic.style.cssText = 'flex:none;font-size:1.1rem;line-height:1.3;'; el.appendChild(ic); }
  var span = document.createElement('span'); span.innerHTML = _linkifyAnnounce(message);
  // Compte à rebours optionnel (échéance en epoch ms) : ligne dédiée, tick 1 s,
  // s'arrête à 0:00. Timer nettoyé par hideInfoToast().
  if (cdAt && Number(cdAt) > 0) {
    var cdEl = document.createElement('span');
    cdEl.style.cssText = 'display:block;margin-top:4px;font-weight:700;font-variant-numeric:tabular-nums;';
    var _cdTick = function () {
      var left = Number(cdAt) - Date.now();
      cdEl.textContent = '\u23f3 ' + _fmtCountdown(left);
      if (left <= 0 && window._infoToastCdTimer) { clearInterval(window._infoToastCdTimer); window._infoToastCdTimer = null; }
    };
    _cdTick();
    window._infoToastCdTimer = setInterval(_cdTick, 1000);
    span.appendChild(cdEl);
  }
  el.appendChild(span);
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
function _showBroadcast(message, icon, cdAt) {
  _bcSeq++; var seq = _bcSeq;
  showInfoToast(message, icon, cdAt);
  _detectTranslate(message).then(function (tr) {
    if (tr && tr !== message && seq === _bcSeq && document.getElementById('srv-info-toast')) showInfoToast(tr, icon, cdAt);
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
  window._myAvatarCache = av; // global implicite historique (écrit-seul, ≠ cache S de l'IIFE — hors portée de S)
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
    } else if (!av) {
      // Aucun avatar/emoji choisi → jeton PokerTH par défaut (client officiel).
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
                       : (stored === '__pth__' ? '/favicon.svg'
                       : (av ? null : '/favicon.svg')));
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

// [Phase 2] Évaluateur de main (_getCombos, _evalFive, _cmpHand,
// _qmlWinningHandText) déplacé dans public/modules/game/cards.mjs
// (toujours global via window.*).

// [Phase 2] Réactions rapides /emoji (compteurs, dédup 2 canaux, FX,
// mute/pin) déplacées dans public/modules/ui/reactions.mjs (toujours
// globales via window.*).


// [Phase 2] Force pré-flop, normalizeHoleCard, evaluateBestHand, glue phe et
// _oddsCompute déplacés dans public/modules/game/cards.mjs (toujours globaux
// via window.*).


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
    sbtn.innerHTML = '<svg viewBox="0 0 24 24" style="display:block;width:22px;height:22px" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
    sbtn.style.opacity = '0.5';
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
  /* ── Pseudo PARTAGÉ entre modes (demande narmod 2026-07-18) ──
   * Un seul pseudo (clé pth_nick) synchronisé entre entraînement, LAN,
   * dédié et compte pokerth.net. Seul l'invité pokerth.net garde sa
   * propre règle (GuestXXXXX via pth_guest_name, champ verrouillé).
   * Migration : repli sur les anciennes clés par mode. */
  window._pthNick = {
    get: function () {
      try {
        return localStorage.getItem('pth_nick')
            || localStorage.getItem('pth_offline_nick')
            || localStorage.getItem('pth_lan_nick')
            || localStorage.getItem('pth_unauth_nick')
            || localStorage.getItem('pth_auth_login')
            || '';
      } catch (e) { return ''; }
    },
    set: function (v) {
      if (!v) return;
      try { localStorage.setItem('pth_nick', v); } catch (e) {}
    }
  };

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
        var keys = ['pth_theme', 'pth_table', 'pth_deck', 'pth_buttons', 'pth_pucks', 'pth_seat', 'pth_cardback', 'pth_cardback_img', 'pth_cardback_ext'];
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
      var MAP = { haptic: 'pth_haptic', voice: 'pth_voice', assist: 'pth_assist', displaybb: 'pth_display_bb' };
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
        .then(function (c) { if (c) { window._pthNetServer = (c.pokerthnetServer && c.pokerthnetServer.host) ? c.pokerthnetServer : null; window._pthNetSource = (c.pokerthnetSource === 'auto') ? 'auto' : 'manual'; window._pthNetTransport = (c.internetTransport === 'proxy') ? 'proxy' : 'direct'; } if (c && c.modes) applyModes(c.modes); if (c && c.loginDefaults) _applyLoginDefaults(c.loginDefaults); if (c && c.welcome && c.welcome.enabled && typeof window.maybeShowWelcome === 'function') window.maybeShowWelcome(c.welcome); if (c && typeof c.defaultTheme === 'string') _applyDefaultTheme(c.defaultTheme); if (c && c.defaults) _applyDefaultSettings(c.defaults); _applyBranding(c); try { if (!window._shareLinkActive && window.App && App.onServerOrGuestChange) App.onServerOrGuestChange(); } catch (e) {} })
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
        var _w = window._pthNick.get();
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

  // Pseudo PARTAGÉ : persisté à chaque frappe dans tous les modes éditables
  // (entraînement, LAN, dédié, compte pokerth.net). Le champ invité est
  // readonly → aucun événement 'input', le GuestXXXXX ne peut donc jamais
  // fuiter dans pth_nick.
  (function () {
    var _nk = document.getElementById('nick');
    if (_nk) _nk.addEventListener('input', function () {
      if (!_nk.hasAttribute('readonly')) window._pthNick.set(_nk.value.trim());
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

// [Phase 2] Proto (encodeur/décodeur protobuf minimal) déplacé dans
// public/modules/net/proto.mjs (toujours global via window.Proto).


// [Phase 2] PTHCrypto (déchiffrement AES des cartes pokerth.net) déplacé
// dans public/modules/net/crypto.mjs (toujours global via window.PTHCrypto).


// [Phase 2] MSG (constructeurs/parseur des messages PokerTH + SCRAM) déplacé
// dans public/modules/net/messages.mjs (toujours global via window.MSG).


// ═══════════════════════════════════════════════════════════
//  APPLICATION
// ═══════════════════════════════════════════════════════════
const App = (() => {
  const S = window.PthState; // état partagé — modules/game/state.mjs (ESM #9e)
  const $ = id => document.getElementById(id); // restauré (hotfix 0.3.849 — avalé par le segment 9f-10)
  // ── Game state ──

  // ── Blind-raise schedule (forum: "better notification of blind increases") ──
  // Captured from NetGameInfo at JoinGameAck. _raiseMode: 1=every N hands,
  // 2=every N minutes. _raiseEvery: N (hands or minutes per mode).
  // _lastBlindsUpHand dedupes the "blinds up" toast per hand.
  // endRaiseMode: 1=doubler, 2=ajouter _endRaiseValue, 3=garder la dernière.
  // Sert à prédire la PROCHAINE valeur de blind affichée dans l'explication.
  // [9g-B1] Minuteur de montée des blinds (_start/_stop/_fmtBlindsCountdown) déplacé dans public/modules/ui/game-info.mjs
  // (toujours global via window.*).


  // ── Chip display mode: absolute value ($) or big blinds (BB) ──
  // Pure display feature, no protocol impact. Toggled from the in-game
  // overflow menu and persisted. fmtChips() is the single formatter used
  // everywhere a live game amount is shown (pot, stacks, bets, action
  // buttons) so the whole table switches consistently.
  try { S._displayBB = (localStorage.getItem('pth_display_bb') === '1'); } catch (e) {}
  // Format a raw chip amount as either "$1234" or "61,7 BB" depending on
  // the current mode. The big blind is smallBlind*2; if it's not known yet
  // (0, before the first hand) we fall back to the raw value to avoid a
  // divide-by-zero. One decimal, shown only when non-zero, with the decimal
  // separator following the active language.
  // Group a whole number with thousands separators following the active
  // language: French (and most others) use a thin/regular space — 1 000 000;
  // English uses a comma — 1,000,000. Improves readability of big stacks/pots.
  // [9f-1] _groupThousands / fmtChips / fmtChipsVoice déplacés dans
  // public/modules/ui/fmt.mjs (toujours globaux via window.*).

  // Assistance (aide « force de la main » affichée au-dessus des actions) :
  // activée par défaut, mémorisée localement. '0' = désactivée.
  try { S._assistOn = (localStorage.getItem('pth_assist') !== '0'); } catch(e) {}
  // Step 1 of "PokerTH official avatar" feature: when PlayerInfoReply
  // arrives for a registered player who uploaded an avatar on pokerth.net,
  // it carries an AvatarData sub-message (field 5) with the hash + format.
  // We just record what we see here; downloading + displaying come later.
  //   S._pthAvatarHashes[pid] = { type: 1|2|3, hashHex: 'a3f5...' }
  //   type: NetAvatarType from proto -- 1=PNG, 2=JPG, 3=GIF
  //   hashHex: lower-case hex string (easy logging & future cache keys)
  // pid -> code pays ISO 3166-1 alpha-2 (ex. 'FR'), reçu via PlayerInfoReply
  // (champ 4). Vide sur LAN / serveur privé qui ne le renseignent pas.
  // pid -> droits PokerTH (1=invité, 2=enregistré, 3=admin), via PlayerInfoReply.
  // Step 2: outgoing AvatarRequest tracking. Keyed by hashHex so the same
  // avatar shared by N players is downloaded ONCE (Q2=A, dedup by hash).
  //   S._pthAvatarsByHash[hex] = {
  //     status: 'pending' | 'done' | 'unknown' | 'error',
  //     type:   1|2|3,
  //     expectedSize: <bytes from AvatarHeader>,
  //     chunks: [Uint8Array, ...],   // not concatenated yet (step 3)
  //     received: <running total>,
  //   }
  // requestId -> hashHex, so AvatarHeader/Data/End handlers can map
  // their requestId back to the right entry (the server's reply does
  // NOT echo the hash, only the requestId we chose).
  // Monotonic counter for AvatarRequest.requestId. Starts at 1 because
  // some servers refuse 0. Wraps around at 2^32 (we'll be long dead).
  // Step 3: assembled Data URLs keyed by hashHex (the actual displayable
  // image, e.g. 'data:image/png;base64,iVBORw0KG...'). Built from chunks
  // at AvatarEnd, or restored from localStorage cache on startup.

  // [Phase 2 / 9c] Cache LRU d'avatars (PTH_AV_*, _pthLoadLruList,
  // _pthSaveLruList, _pthCacheGet, _pthCachePut, _pthAssembleDataUrl)
  // déplacé dans public/modules/net/avatar-cache.mjs (toujours global via
  // window.*). L'état en mémoire (S._pthAvatarsByHash…) et _pthAvatarFor
  // restent ici (closure).

  // [9f-7] _pthAvatarFor / _myAvatarDisplay / _myAvatarToBroadcast /
  // _avatarChipHtml déplacés dans public/modules/ui/player-popup.mjs.
  // [9g-B1] refreshStartNoBotsVisibility déplacé dans public/modules/ui/game-info.mjs
  // (toujours global via window.*).


  // [9g-B1] updateLobbyPill (pill lobby) déplacé dans public/modules/ui/game-info.mjs
  // (toujours global via window.*).


  // [9f-7] Popup joueur (openPlayerInfoPopup, _renderProfileStats, picker
  // avatar lobby, _ccToFlag…) déplacé dans public/modules/ui/player-popup.mjs
  // (toujours global via window.*).

  // [9f-8] _gameTypeLabel / _updateGameHeader déplacés dans
  // public/modules/ui/lobby.mjs.
  window._updateGameHeader = _updateGameHeader;

  // [9g-B1] _resetGameHeader déplacé dans public/modules/ui/game-info.mjs
  // (toujours global via window.*).


  // [9g-B1] openGameInfoPopup / closeGameInfoPopup déplacé dans public/modules/ui/game-info.mjs
  // (toujours global via window.*).


  // ── Classement de la table (parité QML GameTableStatsPage) : contexte pour
  //    le modal de client.html — nom de la table + nicks dans l'ordre des
  //    sièges (GameTable.tableStatsNicks() côté officiel). Les pids sans nom
  //    connu sont omis (le serveur ignore de toute façon les nicks inconnus).
  //    null hors partie ou en mode entraînement (bots sans classement). ──
  window.getTableRankingCtx = function () {
    if (window._offlineMode || !S.gId) return null;
    var g = S.games[S.gId] || {};
    var order = (S.seats && S.seats.length) ? S.seats : (g.seats || []);
    var nicks = [];
    for (var i = 0; i < order.length && nicks.length < 10; i++) {
      var nm = S.players[order[i]];
      if (nm) nicks.push(nm);
    }
    return { name: g.name || '', nicks: nicks };
  };
  // Clé/IV AES dérivés du mot de passe pour déchiffrer les cartes envoyées
  // chiffrées par pokerth.net aux comptes authentifiés (encryptedCards,
  // HandStart champ 3). Renseignés au moment de l'Init (mode 'auth'),
  // nuls sinon (LAN / invité → plainCards en clair).
  // Starting stack for this table. Pulled from NetGameInfo.startMoney
  // (field 13, written by buildCreateGame) or set directly by the table
  // creator. Used as the default money value when GameStartInitial
  // initializes seatData — without this the stacks all start at 0 and the
  // Call button mis-fires as "Call 0 (All-In)" before any action lands.

  // ── Statistiques de session ──

  // [9f-4] Famille _life* / _pushStats / _lifeSeedFromServer déplacée dans
  // public/modules/game/stats.mjs (toujours globale via window.*).
  // Snapshot des résultats figés à la FIN de la main (avant que la main
  // suivante ne réinitialise les stacks). Lu par showWinnerOverlay() pour
  // afficher des nets corrects, même si la donne suivante a déjà démarré.
  // {pid: {money, net, card1, card2, folded, inHand}}

  // ── Positions des sièges (pour les animations) ──

  // Nom de table par défaut localisé (FR: "Table de X", EN: "X's table").
  function _localDefaultName() {
    var tpl = (typeof t === 'function' && t('tableNameDefault')) || 'Table {name}';
    return tpl.replace('{name}', S.myName || 'PokerTH');
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
            : (S._currentLoginMode === 'guest' || S._currentLoginMode === 'auth') ? 'pokerthnet'
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
  function _safeGameName(raw) {
    var s = (raw || '').trim();
    var leadOk = function(str) {
      if (!str) return false;
      var c = str.charCodeAt(0);
      return c >= 0x20 && c <= 0x7E;
    };
    if (leadOk(s)) return s;
    if (!s) {                              // empty after trim
      var nm = (S.myName || '').trim();
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
    var nm = S.myName || 'PokerTH';
    var known = ['Table de ' + nm, nm + "'s table", 'Table ' + nm, 'My table', ''];
    var adminN = _adminNameForMode();
    if (adminN) known.push(adminN);
    if (known.indexOf(cur) >= 0) el.value = _defaultNameForMode();
  };
  // Table-list filter (design A chips): 'all' | 'open' | 'nopass' | 'live'.
  // Persisted so the choice survives reloads, like other lobby prefs.

  // Snapshot of the current table's settings, captured at JoinGameAck.
  // games[gId] is deleted from the lobby dict when the table closes
  // (GameListUpdate with mode === 3), so we keep our own copy. Used
  // by openGameInfoPopup() to populate the table-info modal even
  // after the table no longer appears in the lobby list.

  // [9f-2] hapticBuzz / toggleHaptic déplacés dans public/modules/ui/media.mjs
  // (toujours globaux via window.*).

  // ── Toggle chip display between absolute value ($) and big blinds (BB) ──
  function toggleDisplayBB() {
    S._displayBB = !S._displayBB;
    try { localStorage.setItem('pth_display_bb', S._displayBB ? '1' : '0'); } catch (e) {}
    // Repaint everything that shows a live amount.
    try { if (typeof renderSeats === 'function' && S.seats.length) renderSeats(); } catch (e) {}
    // Re-render the action buttons only if they're currently showing (i.e.
    // it's our turn — the bar holds a raise input). Otherwise they'll be
    // rebuilt with the right unit on the next turn anyway.
    try {
      if (typeof renderMyTurnActions === 'function' &&
          document.getElementById('raise-amt')) renderMyTurnActions();
    } catch (e) {}
    try { repaintPot(); } catch (e) {}
    if (typeof showKeyHint === 'function') showKeyHint(S._displayBB ? t('displayBB') : t('displayChips'));
    return S._displayBB;
  }
  // Re-render the pot label from the last known pot value, in the current
  // mode. We keep the last numeric pot in _lastPotValue (set by setPot) so a
  // mode switch can repaint without a server message.
  function setPot(_potVal) {
    var _prevPot = (typeof S._lastPotValue === 'number') ? S._lastPotValue : 0;
    S._lastPotValue = (typeof _potVal === 'number') ? _potVal : (parseInt(_potVal, 10) || 0);
    window._lastPotTotal = S._lastPotValue;   // pot total (lu par le popup d'info)
    // Parité GameStatusBar QML §7 : « Total » = pot collecté des streets
    // précédentes (collectedPot), « Bets/Mises » = mises de la street en
    // cours (= totalPot − collecté). Le badge au-dessus des cartes
    // (#g-potbar) garde le pot TOTAL, comme le pot badge QML.
    var _cp    = (typeof S.collectedPot === 'number') ? Math.min(S.collectedPot, S._lastPotValue) : S._lastPotValue;
    var _bets  = Math.max(0, S._lastPotValue - _cp);
    var _potAmt = esc(fmtChips(S._lastPotValue));
    var a  = document.getElementById('g-pot');
    var eb = document.getElementById('g-bets');
    var b  = document.getElementById('g-potbar');
    if (a)  a.innerHTML  = esc(fmtChips(_cp));
    if (eb) eb.innerHTML = esc(fmtChips(_bets));
    if (b) { b.innerHTML = _potAmt; b.classList.toggle('has-pot', S._lastPotValue > 0); }
    // « Pop » à chaque hausse du pot (parité pot badge QML, bible §9) —
    // relance de l'animation par reflow, pas de listener à nettoyer.
    if (S._lastPotValue > _prevPot) {
      [a, b].forEach(function (el) {
        if (!el) return;
        el.classList.remove('pot-pop');
        void el.offsetWidth;
        el.classList.add('pot-pop');
      });
    }
  }
  // Statut spectateur dans le bandeau du pot (#pot-strip), en remplacement de
  // l'ancien bandeau séparé — parité GameStatusBar QML §7. Pastille « Spectating »
  // si je regarde, et œil + compteur de spectateurs (moi inclus) dès qu'au moins
  // un spectateur est présent. _specPids exclut le pid local, d'où le +1.
  function updateSpectatorStrip() {
    try {
      var badge = document.getElementById('g-spec-badge');
      var cnt   = document.getElementById('g-spec-count');
      var num   = document.getElementById('g-spec-n');
      if (badge) badge.classList.toggle('on', !!S._amSpectator);
      // Mobile (<640px, CSS) : la pastille texte est masquee et c'est l'oeil
      // qui prend le contour jaune quand JE regarde -> classe .me.
      if (cnt) cnt.classList.toggle('me', !!S._amSpectator);
      var n = (S._specPids ? S._specPids.size : 0) + (S._amSpectator ? 1 : 0);
      if (num) num.textContent = n;
      if (cnt) {
        cnt.classList.toggle('on', n > 0);
        // Tooltip = noms des spectateurs (parité ToolTip QML spectatorNames)
        var names = [];
        if (S._amSpectator) names.push(t('piYou'));
        if (S._specPids) S._specPids.forEach(function(pid) {
          var nm = (typeof getPlayerName === 'function') ? getPlayerName(pid) : null;
          names.push(nm || ('#' + pid));
        });
        cnt.title = names.join('\n');
      }
    } catch (e) {}
  }
  window.updateSpectatorStrip = updateSpectatorStrip;

  function repaintPot() {
    if (typeof S._lastPotValue !== 'number') return;
    setPot(S._lastPotValue);
  }
  window.toggleDisplayBB = toggleDisplayBB;

  // [9f-2] Voix (speak, _speakNext, _pickVoice, voiceActionPhrase, toggleVoice,
  // _syncMediaToggleButtons…) déplacée dans public/modules/ui/media.mjs.
  // Spectators present on the current table. Populated by
  // GameSpectatorJoined messages from the server (one is sent per
  // existing spectator when we ourselves join, plus live updates
  // as people come and go). Reset on JoinGameAck / closeTable.
  // ── Feature flag: auto-check / auto-fold next-turn checkbox ────────
  // When true, the action bar shows a checkbox above the action buttons
  // that arms an automatic fold (or check, if currently free) for the
  // user's next turn this hand. When false, the checkbox is not rendered
  // at all but the underlying logic stays intact — flipping this back to
  // `true` reinstates the feature without touching anything else.
  // Mode de jeu PERSISTANT (comme le client officiel) : 0 = Manuel,
  // 1 = Auto Check/Call, 2 = Auto Check/Fold. Reste actif jusqu'a un clic
  // manuel sur une action ou un changement de dropdown (pas de reset par main).
  // [9g-B4] _playAutoMode déplacé dans public/modules/ui/action-bar.mjs
  // (toujours global via window.*).

  // Panneau "aperçu des actions" ouvert en tapant ses cartes hors de son tour.
  // Le sélecteur de mode (Manuel/Auto Check-Call/Auto Check-Fold) y reste
  // activable. Les boutons d'action y sont affichés en APERÇU seulement
  // (non cliquables). Se ferme automatiquement quand c'est notre tour.
  // Pré-sélection d'action (comme le client officiel, bible §5.3) : on peut
  // armer Fold/Call/Raise/All-In avant son tour (bord or), recliquer pour
  // désarmer, et l'action s'exécute quand notre tour arrive. Invalidée si la
  // mise à suivre change, reset à chaque nouvelle main.
                              // à l'armement. Invalidation alignée sur l'officiel
                              // (onCallAmountChanged) : comparer le montant QUE JE DOIS,
                              // pas highestBet brut — sinon la pose des blinds ou ma
                              // propre mise comptabilisée désarmaient silencieusement la
                              // pré-action (bug « je dois re-sélectionner à mon tour »).
  // Verrou anti-fermeture du picker natif (iOS) du selecteur de mode : tant
  // que l'utilisateur manipule #mode-sel, on differe les reconstructions
  // d'apercu (renderMyTurnActions(true)) pour ne pas detruire le <select> ouvert.
  // Epingle : garder le panneau d'apercu ouvert en permanence hors-tour
  // (au lieu de retaper ses cartes a chaque main). Memorise entre sessions.
  // Sélecteur de mode auto & boutons quick-bet : toujours affichés dans la
  // barre d'action (les options de masquage ont été retirées des réglages).
  // On nettoie les classes héritées au cas où un ancien CSS serait encore en cache.
  try { document.body.classList.remove('hide-auto-btn', 'hide-pct-btns'); } catch (e) {}
  // Setters (etat precis) pour les cases des Options avancees : bascule le toggle
  // existant seulement si l'etat courant differe de la valeur voulue, ce qui
  // reutilise toute la logique d'application + retour visuel des toggles.
  window.setVoice = function (on) { if (!!on !== S._voiceEnabled) toggleVoice(); };
  window.setDisplayBB = function (on) { if (!!on !== S._displayBB) toggleDisplayBB(); };
  window.setHaptic = function (on) { if (!!on !== S._hapticEnabled) toggleHaptic(); };
  // [9f-10] Cycle de connexion (show, _beginConnecting/_endConnecting,
  // _armRejoin, _maybeReconnectOnResume, _forceReconnect) déplacé dans
  // public/modules/net/session.mjs (toujours global via window.*).

  // 'online' : la route réseau a changé (wifi→5G…) → l'ancien socket est quasi
  // sûrement mort même s'il affiche OPEN → on force la reconnexion.
  window.addEventListener('online', _forceReconnect);
  // 'offline' : on prévient l'utilisateur ; la reconnexion se fera au retour du
  // réseau ('online') ou via le watchdog ci-dessous.
  window.addEventListener('offline', function () {
    if (S._intentionalDisconnect || !S._lastConnectParams) return;
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
  setInterval(function () {
    if (S._intentionalDisconnect || !S._lastConnectParams) return;
    if (document.hidden) return;                                            // arrière-plan : timers gelés
    if (typeof navigator.onLine === 'boolean' && !navigator.onLine) return; // hors-ligne géré ailleurs
    var sg = document.getElementById('s-game');
    if (!(sg && sg.classList.contains('active'))) return;                   // seulement à une table
    if (!S.ws || S.ws.readyState !== WebSocket.OPEN) return;                    // sinon déjà géré
    var _tt  = (typeof S.gameTimeout === 'number' && S.gameTimeout > 0) ? S.gameTimeout : 15;
    var _thr = Math.max(S._RX_WATCHDOG_MIN_MS, (_tt + 20) * 1000);            // > timeout d'action de la table
    if (Date.now() - S._lastRxTime > _thr) _forceReconnect();
  }, 5000);

  // ── User diagnostics: type pthDiag() in the console ─────────────────────
  // Returns (and logs) a JSON snapshot of the client state, to paste into
  // a bug report. See docs/DIAGNOSTIC.md.
  window.pthDiag = function () {
    var d = {};
    try {
      d.build   = window.BUILD_VERSION || null;
      d.date    = new Date().toISOString();
      d.ua      = navigator.userAgent;
      d.screen  = window.innerWidth + 'x' + window.innerHeight +
                  ((window.matchMedia && window.matchMedia('(orientation: portrait)').matches) ? ' portrait' : ' landscape');
      try { d.lang = localStorage.getItem('pth_lang') || navigator.language; } catch (e) { d.lang = navigator.language; }
      d.sw      = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
      d.online  = navigator.onLine;
      d.offlineMode = !!window._offlineMode;
      d.loginMode = S._currentLoginMode;
      d.ws      = S.ws ? (['CONNECTING','OPEN','CLOSING','CLOSED'][S.ws.readyState] || S.ws.readyState) : null;
      d.nick    = S.myName || null;
      d.playerId = S.myId || 0;
      d.gameId  = S.gId || 0;
      d.hand    = S.handNum;
      d.phase   = S.gameState;
      d.sb      = S.smallBlind;
      d.seats   = S.seats.length;
      d.myCards = [S.myCards[0] != null, S.myCards[1] != null];
      d.cardKey = !!S._cardKey;
      d.cardDiag = window._pthCardDiag || null;
    } catch (e) { d.error = String(e); }
    try { console.log('[pthDiag]', JSON.stringify(d, null, 1)); } catch (e) {}
    return d;
  };

  // [9f-6] _chatLocalCmd déplacée dans public/modules/ui/chat.mjs.

  // [9f-10] setStatus déplacée dans public/modules/net/session.mjs.
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
      if (!S._statusKey) return;
      var sc = document.getElementById('s-connect');
      if (!sc || !sc.classList.contains('active')) return;
      var el = document.getElementById('cstatus');
      if (el) el.textContent = t(S._statusKey);
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
  // pour voir ws/gId/send/MSG/S._lastMsgWasReaction (cf. avertissement en tête).

  function _flushReactEmoji() {
    S._reactEmojiTimer = null;
    if (!S._reactEmojiQueue.length) return;
    if (!S.ws || !S.gId || S.ws.readyState !== WebSocket.OPEN) { S._reactEmojiQueue.length = 0; return; }
    const now = Date.now();
    const wait = S.REACT_EMOJI_MIN_GAP - (now - S._reactEmojiLastSent);
    if (wait > 0) { S._reactEmojiTimer = setTimeout(_flushReactEmoji, wait); return; }
    const emoji = S._reactEmojiQueue.shift();
    S._reactEmojiLastSent = now;
    S._lastMsgWasReaction = true;
    try { send(MSG.buildGameChat(S.gId, '/emoji ' + emoji)); } catch (e) {}
    if (S._reactEmojiQueue.length) S._reactEmojiTimer = setTimeout(_flushReactEmoji, S.REACT_EMOJI_MIN_GAP);
  }

  function _queueReactEmoji(emoji) {
    S._reactEmojiQueue.push(emoji);
    while (S._reactEmojiQueue.length > S.REACT_EMOJI_QUEUE_MAX) S._reactEmojiQueue.shift(); // garde les plus récentes
    if (!S._reactEmojiTimer) _flushReactEmoji();
  }

  // [Phase 2 / 9d] _handleCtrlFrame déplacée dans public/modules/ui/misc.mjs.

  // ── Canal notify-only (mode pokerth.net direct) ──────────────────────
  // En direct, la socket de jeu va droit sur wss://www.pokerth.net/pthlive :
  // elle ne traverse pas notre proxy, donc broadcastNotice() côté serveur ne
  // peut pas l'atteindre. On ouvre un second WebSocket minimal vers le proxy
  // (?notify=1) qui ne transporte QUE les trames texte NOTICE:/INFO:.
  // Reconnexion silencieuse (15 s) tant que le canal est demandé.
  function _closeNotifyWS() {
    S._notifyUrl = '';
    if (S._notifyTimer) { clearTimeout(S._notifyTimer); S._notifyTimer = null; }
    if (S._notifyWS) { try { S._notifyWS.onclose = null; S._notifyWS.close(); } catch (e) {} S._notifyWS = null; }
  }
  function _openNotifyWS(baseUrl, mode) {
    if (!baseUrl) return;
    const u = baseUrl + (baseUrl.indexOf('?') >= 0 ? '&' : '?') + 'notify=1&mode=' + (mode === 'offline' ? 'offline' : 'pthnet');
    if (S._notifyWS && S._notifyUrl === u) return; // déjà ouvert sur la bonne URL
    _closeNotifyWS();
    S._notifyUrl = u;
    (function dial() {
      if (!S._notifyUrl) return;
      var sck = null;
      try { sck = new WebSocket(S._notifyUrl); } catch (e) {}
      if (!sck) { S._notifyTimer = setTimeout(dial, 30000); return; }
      S._notifyWS = sck;
      sck.onmessage = function (e) { if (typeof e.data === 'string') _handleCtrlFrame(e.data); };
      sck.onerror = function () { try { sck.close(); } catch (e) {} };
      sck.onclose = function () {
        if (sck !== S._notifyWS) return;
        S._notifyWS = null;
        if (S._notifyUrl) S._notifyTimer = setTimeout(dial, 15000);
      };
    })();
  }

  // [9f-10] send déplacée dans public/modules/net/session.mjs (toujours
  // globale via window.send).

  function onRawData(chunk) {
    S._lastRxTime = Date.now();              // liveness : un message reçu = socket vivant
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
    const tmp = new Uint8Array(S.rxBuf.length + chunk.byteLength);
    tmp.set(S.rxBuf);
    tmp.set(new Uint8Array(chunk), S.rxBuf.length);
    S.rxBuf = tmp;

    while (S.rxBuf.length >= 4) {
      const len = new DataView(S.rxBuf.buffer, S.rxBuf.byteOffset).getUint32(0, false);
      if (S.rxBuf.length < 4 + len) break;
      handleMsg(S.rxBuf.slice(4, 4 + len));
      S.rxBuf = S.rxBuf.slice(4 + len);
    }
  }

  // ── HANDLER DE MESSAGES ──
  // [9f-5] Vote-kick (_pet*) et invitations (_invite*) déplacés dans
  // public/modules/net/petitions.mjs (toujours globaux via window.*).

  function handleMsg(buf) {
    const { type, sub } = MSG.parse(buf);
    const T = MSG.T;
    // ── /msglog & /netdbg: lightweight stats (total + ring of last 30 types) ──
    try {
      var _ms = window._pthMsgStats || (window._pthMsgStats = { total: 0, ring: [] });
      _ms.total++;
      _ms.ring.push({ t: type, ts: Date.now() });
      if (_ms.ring.length > 30) _ms.ring.shift();
      // /logdump: optional verbose capture (type + size + field numbers present)
      if (window._pthMsgVerbose) {
        var _vr = window._pthMsgVerboseRing || (window._pthMsgVerboseRing = []);
        _vr.push({ t: type, ts: Date.now(), len: buf.length, f: Object.keys(sub).join(',') });
        if (_vr.length > 50) _vr.shift();
      }
    } catch (_eMs) {}

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
        if (Proto.u32(sub, 2) === S.myId) {
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
          ? (useAcctAuth ? userAcctPass : ($('pass') ? $('pass').value : ''))
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
        const srvPass = ($('server-pass') ? $('server-pass').value.trim() : '') || null;
        send(MSG.buildInit(S.myName, pMaj, pMin, loginType, authPass, srvPass));
        break;
      }

      // Connexion acceptée
      case T.InitAck: {
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
          _showBanner(t('rejoinInProgress'));
          try { send(MSG.buildRejoinGame(_rt)); } catch (e) {}
          break;   // JoinGameAck → game screen; JoinGameFailed → lobby fallback
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

      case T.ReportGameAck: {
        // ReportGameAckMessage : reportedGameId=1, reportGameResult=2
        // (0 accepté · 1 déjà signalé · 2 invalide/erreur)
        var _rgRes = Proto.u32(sub, 2);
        if (_rgRes === 0) {
          showToast(t('reportGameAccepted'), { icon: '\u2713' });
        } else if (_rgRes === 1) {
          showToast(t('reportGameDup'), { icon: '\u2139' });
        } else {
          showToast(t('reportGameError'), { tone: 'error', icon: '\u2715' });
        }
        break;
      }

      case T.AdminBanPlayerAck: {
        // AdminBanPlayerAckMessage : banPlayerId=1, banPlayerResult=2
        // (0 accepté · 1 en attente · 2 pas de BDD · 3 erreur BDD · 4 invalide)
        var _kbPid = Proto.u32(sub, 1);
        var _kbRes = Proto.u32(sub, 2);
        var _kbNm = getPlayerName(_kbPid) || ('#' + _kbPid);
        if (_kbRes === 0 || _kbRes === 1) {
          showToast((typeof t === 'function' && t('kickbanOk') !== 'kickbanOk')
            ? t('kickbanOk', { name: _kbNm }) : ('Kickban: ' + _kbNm));
        } else {
          showToast(((typeof t === 'function' && t('kickbanFail') !== 'kickbanFail')
            ? t('kickbanFail') : 'Kickban failed') + ' (' + _kbRes + ')',
            { tone: 'error', icon: '\u2715' });
        }
        break;
      }

      case T.Error: {
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
          _hideBanner();
          S._ipBlockUntil = Date.now() + 1 * 60 * 1000; // 1 minute (was 5 — server usually clears earlier)
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
          S._pendingRejoin = 0; S._rejoinNickRetries = 0;
          S._wasAuthenticated = false;
          S._intentionalDisconnect = true;             // stoppe toute reconnexion auto
          try { localStorage.removeItem('pth_resume'); } catch (e) {}
          _hideBanner();
          var _fr = (typeof _lang === 'undefined' || _lang !== 'en');
          var _msg = _fr
            ? '« ' + S.myName + ' » est déjà utilisé. Une session précédente est peut-être encore active : patiente ~2 min, ou choisis un autre pseudo, puis reconnecte.'
            : '“' + S.myName + '” is already in use. A previous session may still be active: wait ~2 min, or pick another nickname, then reconnect.';
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
          $('h-players').textContent = S._lobbyPlayerCount + ' ' + t('playersOnline');
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
            S._hasStatistics = true;
            S._lobbyPlayerCount = Proto.u32(s,2);
            $('h-players').textContent = S._lobbyPlayerCount + ' ' + t('playersOnline');
            updateLobbyStatsBar();
          }
        }
        break;
      }

      // Profil d'un joueur reçu
      case T.PlayerInfoReply: {
        const pid = Proto.u32(sub, 1);
        const info = Proto.sub(sub, 2);
        const name = Proto.str(info, 1);
        if (name) S.players[pid] = name;
        // Rafraîchir un panneau « joueurs à cette table » en attente de ce pseudo.
        if (name && S._openTables.size && _tableHasPid(pid)) renderGames();
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
        if (!S._gameStarted && S.gId) renderWaitingPanel();
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
        const hashHex = S._pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
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
        const hashHex = S._pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
        if (entry && block) {
          entry.chunks.push(block);
          entry.received += block.length;
        }
        break;
      }
      case T.AvatarEnd: {
        const reqId = Proto.u32(sub, 1);
        const hashHex = S._pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.status = 'done';
          // ── Step 3: assemble chunks into a Data URL, cache it,
          // free the chunk buffers, then trigger a re-render so the
          // freshly arrived image appears at the table.
          try {
            const dataUrl = _pthAssembleDataUrl(entry.chunks, entry.type);
            S._pthDataUrls[hashHex] = dataUrl;
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
        if (S._openTables.size) renderGames();
        if (hashHex) delete S._pthAvatarReqIdToHash[reqId];
        break;
      }
      case T.UnknownAvatar: {
        const reqId = Proto.u32(sub, 1);
        const hashHex = S._pthAvatarReqIdToHash[reqId];
        const entry = hashHex ? S._pthAvatarsByHash[hashHex] : null;
        if (entry) {
          entry.status = 'unknown';
        }
        if (hashHex) delete S._pthAvatarReqIdToHash[reqId];
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
        if (S.games[id]) {
          if (mode === 3) delete S.games[id];
          else S.games[id].mode = mode;
          renderGames();
        }
        break;
      }

      // Un joueur rejoint / quitte une table
      case T.GameListPlayerJoined: {
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
        break;
      }
      case T.GameListPlayerLeft: {
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
        if (spid && spid !== S.myId) {
          S._specPids.add(spid);
          updateSpectatorStrip();
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
        break;
      }
      case T.GameSpectatorLeft: {
        const spid = Proto.u32(sub, 2);
        if (spid) {
          S._specPids.delete(spid);
          updateSpectatorStrip();
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
        const who  = S.players[pid] || (pid ? `#${pid}` : null);
        const cls  = ctype === 3 ? 'bc' : pid === S.myId ? 'mine' : '';
        // Logging de tous les messages chat (debug réactions)
        // Intercepter les réactions (préfixe ASCII [R])
        var _reEmoji = null;
        if (text && text.startsWith('[R]') && text.length < 12) _reEmoji = text.slice(3);
        else if (text && text.startsWith('/emoji ') && text.length < 18) _reEmoji = text.slice(7).trim();
        if (_reEmoji) {
          if (pid !== S.myId) {
            handleIncomingReaction(pid, _reEmoji, 'chat');
            // Pas d'affichage dans le chat — animation seule
          }
        } else if (!(pid === S.myId && ctype !== 3)) {
          // Son de notification du chat LOBBY (lobbychatnotify.wav) —
          // messages d'autrui uniquement (chatTypeLobby = 0)
          if (ctype === 0 && pid && pid !== S.myId) {
            try { if (typeof notifyLobbyChat === 'function') notifyLobbyChat(); } catch (_e) {}
          }
          // Mon propre message : déjà affiché en optimiste à l'envoi (classe 'mine').
          // Le serveur le rediffuse à tous, expéditeur compris → on ignore l'écho
          // pour ne pas afficher la ligne en double (broadcast ctype===3 conservé).
          addChat(who, text, cls);
        }
        break;
      }
      case T.TimeoutWarning: {
        const sec = Proto.u32(sub, 2);
        S._timerSec = sec; // Sync avec le serveur
        // Si le serveur donne plus de temps que prévu, ajuster le total
        if (sec > S._timerTot) S._timerTot = sec;
        addChat(null, t('timerHurry', { s: sec }), 'sys', { key: 'timerHurry', params: { s: sec } });
        // Auto-reset timeout
        const rtm = Proto.encode([[1,0,68],[69,2,new Uint8Array(0)]]);
        send(rtm);
        break;
      }

      case T.ChatReject: {
        const rejText = Proto.str(sub, 1);
        if (S._lastMsgWasReaction) {
          // Réaction rejetée (mode LAN/invité) — afficher badge local uniquement
          S._lastMsgWasReaction = false;
          if (!S._chatRejectShown) {
            S._chatRejectShown = true;
            // Note discrète dans la barre de réactions
            var rb = document.getElementById('reaction-bar');
            if (rb) {
              var note = document.createElement('div');
              note.style.cssText = 'font-size:0.52rem;color:var(--orange);text-align:center;width:100%;margin-top:2px;font-style:italic';
              note.textContent = S._currentLoginMode === 'lan'
                ? t('reactLanLocalNote')
                : t('reactLocalOnlyNote');
              rb.appendChild(note);
              setTimeout(function(){ note.style.opacity='0'; note.style.transition='opacity 1s'; setTimeout(function(){ note.remove(); }, 1000); }, 5000);
            }
          }
        } else {
          S._lastMsgWasReaction = false;
          if (!S.amInGame) addChat(null, t('chatRefusedReason', { r: rejText }), 'sys', { key: 'chatRefusedReason', params: { r: rejText } });
          else if (!S._chatRejectShown) {
            S._chatRejectShown = true;
            if (S._currentLoginMode === 'lan') {
              addGameChat(null, t('chatLanDisabled'), 'sys', { key: 'chatLanDisabled' });
            } else {
              addGameChat(null, t('chatServerRefused'), 'sys', { key: 'chatServerRefused' });
            }
          }
        }
        break;
      }

      case T.JoinGameAck: {
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
          try { localStorage.setItem('pth_resume', JSON.stringify({ n: S.myName, g: S.gId, t: Date.now() })); } catch(e) {}
        }
        _hideBanner();
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
        // and since seats[] is empty on entry renderSeats() won't redraw —
        // so the previous hand would remain visible behind the waiting
        // panel. The server replays the real state right after JoinGameAck,
        // so starting from a clean felt is always correct (and a harmless
        // no-op when joining a genuinely fresh table).
        try {
          S.pot = 0; S.collectedPot = 0;
          setPot(0);
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
          clearSpectatorActions();
        }
        document.body.classList.add('in-game');
        try { _applyReactMuteUI(); } catch(e) {}
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
            if (S.seats.length > 0) renderSeats();
          }, d);
        });
        setTimeout(animateTableEnter, 100);
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
        renderWaitingPanel();
        // The list of already-present players arrives via subsequent
        // GamePlayerJoined messages from the server. Schedule a few
        // refreshes so the panel populates as those messages land,
        // and so PlayerInfoRequest replies catch up.
        [200, 600, 1200, 2500].forEach(function(d){
          setTimeout(function(){ if (!S._gameStarted) renderWaitingPanel(); }, d);
        });
        break;
      }

      case T.JoinGameFailed: {
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
          renderSeats();
        }
        const name = S.players[pid] || '#'+pid;
        // Son « joueur connecté » (playerconnected.wav) — parties réseau seulement
        if (pid !== S.myId && !window._offlineMode) {
          try { if (typeof notifyPlayerConnected === 'function') notifyPlayerConnected(); } catch (_e) {}
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
        if (!S._gameStarted) renderWaitingPanel();
        break;
      }

      case T.GamePlayerLeft: {
        const pid = Proto.u32(sub, 2);
        const name = S.players[pid] || '#'+pid;
        addChat(null, t('playerLeftTable', { name: name }), 'sys', { key: 'playerLeftTable', params: { name: name } });
        if (S.seatData[pid]) { S.seatData[pid].active = false; S.seatData[pid].gone = true; }
        renderSeats();
        // Refresh the waiting panel if the game hasn't started yet.
        if (!S._gameStarted) renderWaitingPanel();
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
        break;
      }

      case T.RemovedFromGame: { S._gameMeta = null;
        addChat(null, t('youWereRemoved'), 'sys', { key: 'youWereRemoved' });
        S._pendingRejoin = 0; try { localStorage.removeItem('pth_resume'); } catch(e) {}
        App._resetGameState();
        show('s-lobby');
        break;
      }

      case T.StartEvent: {
        // Répondre avec StartEventAck
        const evGameId = Proto.u32(sub, 1);
        send(MSG.buildStartEventAck(evGameId));
        // Son « partie prête » (onlinegameready.wav) — parties réseau seulement
        if (!window._offlineMode) {
          try { if (typeof notifyGameReady === 'function') notifyGameReady(); } catch (_e) {}
        }
        S._eliminatedLogged.clear();
        break;
      }

      case T.GameStartInitial: {
        S._gameStarted = true;
        try { _updateLobbyWaitStatus(); } catch(e) {}
        // La partie démarre → on quitte la wait-page du lobby et on bascule
        // sur le gametable (le feutre a été préparé au JoinGameAck).
        try { show('s-game'); } catch(e) {}
        try { _renderLobbyWaitActions(); } catch(e) {}  // restaure « + Créer une partie » côté lobby
        // Reset de l'escalade des sons de montee de blinds (nouvelle partie).
        if (typeof resetBlindRaises === 'function') resetBlindRaises();
        // Clear the waiting panel ("EN ATTENTE…") immediately when the
        // game starts. It used to linger until our first MyActionRequest
        // because that's the next thing that writes to #g-actions —
        // meaning if another player goes first, the user sees the
        // start-now banner and the live table at the same time.
        var _ga = document.getElementById('g-actions');
        if (_ga) _ga.innerHTML = '';
        // La partie démarre → on masque la wait-page et on révèle le feutre.
        try { _wpHide(); } catch(e) {}
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
        $('g-round').textContent = t('gameStart');

        // Demander les infos des joueurs inconnus
        for (const pid of S.seats) {
          if (!S.players[pid]) {
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
          if (_prevDealerPid >= 0 && _prevDealerPid !== S.dealerPid) {
            setTimeout(function(){ animateDealerMove(_prevDealerPid, S.dealerPid); }, 200);
          }
          fadeOutAllActions();
          renderSeats();
        }
        _prevDealerPid = S.dealerPid;
        try {
          if (window._handlog && isFirstDeal) {
            var _hlSeatMap = S.seats.map(function(pid, i){
              return { pid: pid, seat: i + 1, name: getPlayerName(pid) };
            });
            window._handlog.onGameStart({
              gameID: S.gId, startMoney: S.gameStartMoney || 0,
              startSb: S.smallBlind || 0, dealerSeat: (S.seats.indexOf(S.dealerPid) + 1) || 0,
              seatMap: _hlSeatMap
            });
          }
        } catch (_e) {}
        break;
      }

      case T.HandStart: {
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
        try { _sdLosers = new Set(); } catch (e) {} // reset estompage perdants (nouvelle main)
        try { _sdWinners = new Set(); } catch (e) {} // reset surbrillance gagnants (nouvelle main)
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
        if (!S._gameStarted) {
          S._gameStarted = true;
          S._seatsFrozen = true;
          try { _wpHide(); } catch(e) {}
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
        $('g-round').textContent = t('preflop');
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
          if (typeof _showBlindsToast === 'function') _showBlindsToast(window._blindsInfoHtml, true);
        }
        S.dealerPid = Proto.u32(sub, 6) || S.dealerPid;

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
        var startMon = (S.seatData[S.myId]||{}).money || 0;
        if (!S._statsInited && startMon > 0) initStats(startMon);
        // Sons + animations deal
        setTimeout(function(){
          notifyCard();
          setTimeout(notifyCard, 120);
          animateDealMyCards();
        }, 250);
        var hs = document.getElementById('hand-strength');
        if (hs) _hsHide(hs);
        renderGameWaiting(t('handOf') + ' ' + S.handNum + ' — Blinds: ' + sb + '/' + (sb*2));
        const _lhN = S.handNum, _lhSB = sb;
        logAction(function(){ return '══ ' + t('handOf') + ' ' + _lhN + ' — ' + t('blinds') + ' ' + _lhSB + '/' + (_lhSB*2) + ' ══'; });
        // Donneur (bouton) de la main — dealerPid déjà résolu plus haut (champ 6).
        if (S.dealerPid && getPlayerName(S.dealerPid)) {
          const _lhD = S.dealerPid;
          logAction(function(){ return '\uD83D\uDD18 ' + t('logDealer', { name: getPlayerName(_lhD) }); });
        }
        // Show my hole cards in log
        if (S.myCards[0] != null && S.myCards[1] != null) {
          const _lhMy0 = S.myCards[0], _lhMy1 = S.myCards[1];
          logAction(function(){ return t('myCards') + ' ' + cardName(_lhMy0, false) + ' ' + cardName(_lhMy1, false); });
        }
        break;
      }

      case T.PlayersTurn: {
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
          renderSeats();
          break;
        }
        // A seat whose turn the server just assigned is by definition
        // in the hand — force active=true. Safety net for spectators
        // who joined mid-hand and missed the HandStart reset.
        if (S.turnPid && S.seatData[S.turnPid]) S.seatData[S.turnPid].active = true;
        const rounds = [t('preflop'),t('flop'),t('turn'),t('river'),t('preflop')+' (SB)',t('preflop')+' (BB)'];
        $('g-round').textContent = rounds[S.gameState] || t('preflop');
        startTurnTimer();
        if (S.turnPid === S.myId) {
          // C'est notre tour : on referme tout panneau "aperçu" pour ne pas
          // interférer avec la barre d'actions normale (et tous ses effets).
          S._preActionOpen = false;
          // Pré-action armée (comme l'officiel) : si une action a été armée avant
          // notre tour et qu'elle est encore valide, on la joue directement sans
          // afficher les boutons live.
          console.log('[prearm] MON TOUR — préAction=' + (S._preAction || '(vide)') + ' gameState=' + S.gameState);
          if (S._preAction) { var _pdid = _runPreAction(); console.log('[prearm] _runPreAction → ' + _pdid); S._preAction = ''; if (_pdid) break; }
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
          // Zoom-follow : planifie le cadrage du siège actif (parité QML §3.4)
          try { if (window._zoomFollowTurn) window._zoomFollowTurn(S.turnPid, S.gameTimeout); } catch (_e) {}
          // isHtml=true : HTML interne sûr, pas du contenu utilisateur
          renderGameWaiting(
            '<span style="font-family:inherit">' + esc(getPlayerName(S.turnPid)) + '</span>'
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
        setPot(S.pot);
        logAction(getPlayerName(pid) + ': ' + aLabel + (bet ? ' ' + bet : ''), true);
        speak(voiceActionPhrase(action, pid, bet));
        if (pid === S.myId) {
          const myMon = (S.seatData[S.myId] || {}).money || 0;
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
            animatePot(S.pot);
            updatePotSize(S.pot);
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
        S.commCards = allValid(fA) ? fA : (allValid(fB) ? fB : fA);
        const dbg = 'FLOP sub:'+allVals+' →['+S.commCards.join(',')+']';
        if ($('g-debug')) $('g-debug').textContent = dbg;
        try { if (window._handlog) window._handlog.onFlop(S.commCards.slice(0, 3)); } catch (_e) {}
        $('g-round').textContent = t('flop');
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
        setPot(S.pot);
        const flopStr = S.commCards.filter(n=>n!=null).map(n=>cardName(n,true)).join(', ');
        renderComm(true); // flip animation
        renderSeats();
        setTimeout(renderHandStrength, 150); // force de la main au flop (was 500ms)
        setTimeout(renderOddsMonitor, 220); // moniteur d'odds (flop)
        const _lhPotF = S.pot;
        logAction(function(){ return '--- ' + t('flop') + ' [' + flopStr + '] · ' + t('pot') + ' ' + _groupThousands(_lhPotF) + ' ---'; });
        notifyCard(); notifyCard(); notifyCard();
        break;
      }

      case T.DealTurn: {
        // Fix : utiliser sub[2] pour détecter la présence du champ
        const tv = sub[2] !== undefined ? Proto.u32(sub, 2) : Proto.u32(sub, 1);
        S.commCards.push(tv);
        try { if (window._handlog) window._handlog.onTurn(tv); } catch (_e) {}
        $('g-round').textContent = t('turn');
        S.gameState = 2;
        let turnBets = 0;
        for (const p of S.seats) if (S.seatData[p] && S.seatData[p].bet) { turnBets += S.seatData[p].bet; S.seatData[p].bet = 0; }
        S.collectedPot += turnBets;
        S.pot = S.collectedPot;
        // Voir DealFlop pour le commentaire — reset des stats par round
        // pour éviter que le bouton Call affiche un montant périmé.
        S.highestBet = 0;
        S.minRaise   = 0;
        setPot(S.pot);
        const tvCard = S.commCards[3]; const tvName = tvCard != null ? cardName(tvCard, true) : '?';
        const _lhPotT = S.pot;
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
        S.commCards.push(rv);
        try { if (window._handlog) window._handlog.onRiver(rv); } catch (_e) {}
        $('g-round').textContent = t('river');
        S.gameState = 3;
        let rvBets = 0;
        for (const p of S.seats) if (S.seatData[p] && S.seatData[p].bet) { rvBets += S.seatData[p].bet; S.seatData[p].bet = 0; }
        S.collectedPot += rvBets;
        S.pot = S.collectedPot;
        // Voir DealFlop pour le commentaire — reset des stats par round
        // pour éviter que le bouton Call affiche un montant périmé.
        S.highestBet = 0;
        S.minRaise   = 0;
        setPot(S.pot);
        const rvCard = S.commCards[4]; const rvName = rvCard != null ? cardName(rvCard, true) : '?';
        const _lhPotR = S.pot;
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
          if (S.seatData[pid]) { S.seatData[pid].card1 = c1; S.seatData[pid].card2 = c2; }
          try { if (window._handlog) window._handlog.onRevealCards([{ pid: pid, card1: c1, card2: c2 }]); } catch (_e) {}
        }
        renderSeats();
        break;
      }

      case T.EndOfHandShow: {
        _ownReveal = true; // showdown : mes cartes sont publiques, on les montre
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
            if (pid === S.myId) {
              // Gain NET de la main = stack final − stack au début de la main
              // (et NON le pot brut « won », qui inclut ma propre mise).
              var myStartHand = (S._myStackAtHandStart != null) ? S._myStackAtHandStart : ((S._stats.startMoney || 0) + S._stats.totalGain);
              var netWin = cash - myStartHand;
              var myPair2 = S.myCards.map && S.myCards.map(function(c){ return { r: cardName(c,false).slice(0,-1), s: cardName(c,false).slice(-1), red: ['♥','♦'].indexOf(cardName(c,false).slice(-1))>=0 }; });
              recordHand(true, netWin, myPair2);
            }
            // Gain affiché dans le Journal 📋 (pas dans le chat, pour ne pas le noyer)
            logAction('🏆 ' + getPlayerName(pid) + ' +' + _groupThousands(won));
        speak(t('voiceWins', { name: getPlayerName(pid), n: fmtChipsVoice(won) }));
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
          _sdLosers = new Set();
          if (localStorage.getItem('pth_fade_losers') !== '0') {
            var _winPids = {};
            winners.forEach(function (w) { _winPids[w.pid] = 1; });
            for (var _lp in S.seatData) {
              var _ls = S.seatData[_lp];
              if (_ls && _ls.card1 != null && _ls.card2 != null && !_winPids[_lp])
                _sdLosers.add(parseInt(_lp, 10));
            }
          }
        } catch (e) {}
        // PlayerWinnerOverlay QML : marquer les sièges gagnants jusqu'à la main suivante.
        try { _sdWinners = new Set(winners.map(function (w) { return w.pid; })); } catch (e) {}
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
        S.pot = 0; setPot(0);
        renderSeats();
        // Animations de fin de main
        var iWon = winners.some(function(w){ return w.pid === S.myId; });
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
        if (S.seatData[pid]) { S.seatData[pid].money = cash; if(won) S.seatData[pid].action = '+'+won; }
        if (won > 0) logAction('🏆 ' + getPlayerName(pid) + ' +' + _groupThousands(won));
        try { if (window._handlog) window._handlog.onHandHideEnd({ pid: pid, won: won, round: (typeof S.gameState === 'number' ? S.gameState : undefined), eliminated: _hlEliminatedPids(), gameOverPid: null }); } catch (_e) {}
        try { if (typeof window._hudRefresh === 'function') window._hudRefresh(); } catch (_e) {}
        try { _sdWinners = won > 0 ? new Set([pid]) : new Set(); } catch (e) {}
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
        S.pot = 0; setPot(0);
        renderSeats();
        // Détection élimination (stack à 0)
        for (var _ep of S.seats) {
          if (_ep !== S.myId && S.seatData[_ep] && S.seatData[_ep].money === 0) {
            setTimeout(function(p){ animatePlayerEliminated(p); }, 600, _ep);
          }
        }
        logEliminations();
        if (won > 0) { _snapshotHandResults(); showWinnerOverlay([{pid, won, cash, c1:null, c2:null}]); }
        // « Show » volontaire : main terminée SANS abattage → mes cartes
        // n'ont pas été révélées. Réseau seulement (le FakeServer offline
        // ignore le type 51) et jamais en spectateur.
        if (!S._amSpectator && !window._offlineMode && S.myCards[0] != null) _setCanShow(true);
        break;
      }

      case T.GameAdminChanged: {
        const newAdminId = Proto.u32(sub, 2);
        if (newAdminId !== S.myId) S.amGameAdmin = false;
        else S.amGameAdmin = true;
        try { _updateGameHeader(); } catch(e) {}
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
        if (S.turnPid === S.myId && !S._amSpectator) {
          renderMyTurnActions();
          startTurnTimer();
        }
        break;
      }

      case T.AfterHandShowCards: {
        // Show volontaire d'un joueur (rediffusion serveur du
        // ShowMyCardsRequest). PlayerResult : playerId=1, resultCard1=2,
        // resultCard2=3 (moneyWon/playerMoney ignorés : déjà appliqués par
        // EndOfHand*). Même chemin de révélation que le showdown :
        // seatData.card1/2 + renderSeats + ligne logShowdown.
        const _sPr  = Proto.sub(sub, 1);
        const _sPid = Proto.u32(_sPr, 1);
        const _sC1  = Proto.u32orNull(_sPr, 2);
        const _sC2  = Proto.u32orNull(_sPr, 3);
        if (_sPid && _sC1 != null && _sC2 != null) {
          if (S.seatData[_sPid]) { S.seatData[_sPid].card1 = _sC1; S.seatData[_sPid].card2 = _sC2; }
          if (_sPid === S.myId) { _ownReveal = true; try { renderMyCards(); } catch (e) {} _setCanShow(false); }
          try { renderSeats(); } catch (e) {}
          const _sBd = S.commCards.slice();
          logAction(function () {
            var ev = (typeof evaluateBestHand === 'function') ? evaluateBestHand([_sC1, _sC2], _sBd) : null;
            return t('logShowdown', {
              name:  getPlayerName(_sPid),
              cards: cardName(_sC1, false) + ' ' + cardName(_sC2, false),
              hand:  ev ? ev.label : ''
            });
          });
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
        try { _setCanShow(false); } catch (_e) {}
        showEndGameOverlay(winnerPid, { eliminated: _egElim, place: _egPlace });
        try { if (window._handlog) window._handlog.onGameOver(winnerPid); } catch (_e) {}
        // Retour automatique au lobby (parité NetAutoLeaveGameAfterFinish,
        // bible §15) — OPT-IN, parties réseau seulement. 12 s pour laisser
        // lire l'écran de fin ; annulé si l'utilisateur quitte avant
        // (leaveGame purge le timer).
        if (_advGet('auto_leave', false) && !window._offlineMode) {
          try { clearTimeout(window._autoLeaveTimer); } catch (_e) {}
          window._autoLeaveTimer = setTimeout(function () {
            try { if (S.amInGame && window.App && App.leaveGame) App.leaveGame(); } catch (_e) {}
          }, 12000);
        }
        break;
      }
    }
  }

  // [9f-8] Lobby (MODE_LABEL, GTYPE, filtres, renderTablePlayers, panneau
  // infos de partie, wait-actions) déplacé dans public/modules/ui/lobby.mjs.
  function _tableHasPid(pid) {
    for (const k of S._openTables) {
      const g = S.games[k];
      if (g && g.seats && g.seats.indexOf(pid) !== -1) return true;
    }
    return false;
  }

  // [9g-B3] _setCanShow (« Show » post-main) déplacé dans public/modules/ui/table-cards.mjs
  // (toujours global via window.*).


  // [9g-B1] _remainCount déplacé dans public/modules/ui/game-info.mjs
  // (toujours global via window.*).


  // [9f-8] updateLobbyStatsBar / renderGames déplacés dans
  // public/modules/ui/lobby.mjs (toujours globaux via window.*).

  // [9f-6] addChat déplacée dans public/modules/ui/chat.mjs (toujours
  // globale via window.addChat).

  // [Phase 2 / 9d] esc (échappement HTML) déplacée dans public/modules/ui/misc.mjs.

  // ── API PUBLIQUE ──
  // [Phase 2 / 9b] Rendu des cartes (cardName, _deckFace/_deckBack,
  // _refreshDeck, cardToHtml, cardHtml) déplacé dans
  // public/modules/ui/deck.mjs (toujours global via window.*).

  // [9g-B3] _ownCardsHidden / renderMyCards / window._refreshOwnCards déplacé dans public/modules/ui/table-cards.mjs
  // (toujours global via window.*).




  // ═══════════════════════════════════════════════════════════
  // ANIMATIONS — Distribution, jetons, stats
  // ═══════════════════════════════════════════════════════════

  // [9g-B3] animateCardDeal / animateChipToPot déplacé dans public/modules/ui/table-cards.mjs
  // (toujours global via window.*).


  // [Phase 2 / 9b] flipCommCards déplacée dans public/modules/ui/deck.mjs.

  // [9f-4] Panneau stats (toggleStats, renderStats, renderBoard, initStats,
  // recordHand…) déplacé dans public/modules/game/stats.mjs.

  // [9g-B2] Force de la main (calcWinProb, _hs*, _gipAssistSync, renderPreFlop/HandStrength) déplacé dans public/modules/ui/odds-panel.mjs
  // (toujours global via window.*).


  // [9g-B3] renderComm déplacé dans public/modules/ui/table-cards.mjs
  // (toujours global via window.*).


  // ─── Seat positions (% of oval) — 10 max, starting from bottom going clockwise ───

  // Hardcoded seat positions (% within oval): index 0 = ME (bottom center)
  // Seat positions OUTSIDE the oval (% of oval size, can be negative or >100)
  // Index 0 = ME always at bottom-center outside
  // Others = opponents clockwise from top-left

  function getSeatPositions(n) {
    var mob = window.innerWidth < 640;
    var layouts = mob ? S.SEAT_LAYOUTS_MOB : S.SEAT_LAYOUTS_DESK;
    return layouts[n] || layouts[10].slice(0, n);
  }

  // [Phase 2 / 9b] _pthPuck, chipSvg, dealerChipSvg déplacées dans
  // public/modules/ui/deck.mjs (toujours globales via window.*).
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

  function getPlayerName(pid) { return S.players[pid] || (pid === S.myId ? S.myName : '#'+pid); }
  window.getPlayerName = getPlayerName; // pont requis par ui/media.mjs (9f-2)
  // [9f-9] _hlEliminatedPids déplacée dans public/modules/game/showdown.mjs.
  // Liste des joueurs actuellement à la table (pour le panneau stats).
  window._statsTablePlayers = function () {
    try {
      return (S.seats || []).map(function (pid) { return { pid: pid, name: getPlayerName(pid) }; });
    } catch (_e) { return []; }
  };
  // URLs du moteur SQLite vendored (pour l'export .pdb).
  window._sqlJsUrl = '/vendor/sql-wasm.js';
  window._sqlJsWasmUrl = '/vendor/sql-wasm.wasm';
  // Export .pdb depuis les options avancées (bouton).
  window._advExportPdb = function (scope, btn) {
    if (typeof window._exportPdb !== 'function') return;
    var old = btn ? btn.innerHTML : null;
    if (btn) { btn.disabled = true; btn.innerHTML = '…'; }
    Promise.resolve(window._exportPdb(scope)).catch(function () {}).then(function () {
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
    });
  };

  // [Phase 2 / 9b] _timerSvg déplacée dans public/modules/ui/deck.mjs.

  // [9f-3] _timerRectSvg / _updateTimer / startTurnTimer / stopTurnTimer
  // déplacés dans public/modules/game/turn-timer.mjs (globaux via window.*).

  // ── Détection bot vs humain (dans la closure = accès à players/myId/myName) ──
  function isBot(pid) {
    var name = (S.players[pid] || '').toLowerCase();
    return name.startsWith('computer') || name.startsWith('bot') || name === 'bot';
  }
  window.isBot = isBot; // pont requis par ui/player-popup.mjs (9f-7)
  function getPlayerInitial(pid) {
    if (pid === S.myId) {
      // Utiliser le cache ; recharger depuis localStorage si vide
      if (!S._myAvatarCache) {
        try { S._myAvatarCache = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
      }
      // Never return the '__pth__' sentinel as an "initial". The seat
      // builder renders the result inside <span class="seat-initial">;
      // returning the raw sentinel surfaced as '_PTH_' on every seat
      // when the user picked the PokerTH avatar but had no image
      // downloaded yet (LAN, guest, etc). Falling back to the name's
      // first letter is the right text fallback; the image (real or
      // placeholder logo) is layered on top by the renderer.
      if (S._myAvatarCache && S._myAvatarCache !== '__pth__' && S._myAvatarCache !== '__img__') return S._myAvatarCache;
      return S.myName ? S.myName.charAt(0).toUpperCase() : '?';
    }
    if (isBot(pid)) return '🤖';
    // Avatar reçu des autres joueurs via proxy
    if (S._playerAvatars[pid]) return S._playerAvatars[pid];
    var name = S.players[pid] || '';
    return name.charAt(0).toUpperCase() || '?';
  }
  function getPlayerTypeBadge(pid) {
    return ''; // Badges supprimés : 🤖 identifie les bots, pas de 👤 pour les humains
  }

  // [Phase 2 / 9a] Géométrie officielle QML (_qmlLandscapeLayout,
  // _qmlPortraitScale, _officialSeatPix, _applyQmlBgCenter) déplacée dans
  // public/modules/game/layout.mjs (toujours globale via window.*). Les
  // appels nus ci-dessous résolvent via window, comme pour #1-#8.

  function renderSeatsImmediate() {
    if (window._seatEditMode) { if (document.documentElement.getAttribute('data-seat-layout') === 'custom') return; window._seatEditMode = false; }   // gel pendant l'edition (custom seul) ; auto-degele si le mode a change
    const el = $('g-seats');
    // Clic/tap sur un siège → popup d'info du joueur. Délégation posée une
    // seule fois : #g-seats persiste, seul son contenu est recréé à chaque
    // rendu. Les sièges deviennent cliquables via CSS (.seat { pointer-events }).
    if (el && !el._seatClickBound) {
      el._seatClickBound = true;
      el.addEventListener('click', function(ev) {
        if (window._seatEditMode) return;   // pas de popup pendant l'edition (clic = drag)
        var seat = (ev.target && ev.target.closest) ? ev.target.closest('.seat[data-pid]') : null;
        if (!seat || seat.classList.contains('seat-ghost')) return; // siège vide / joueur parti
        var sp = parseInt(seat.getAttribute('data-pid'), 10);
        if (!isNaN(sp)) openPlayerInfoPopup(sp);
      });
    }
    if (!S.seats.length) { el.innerHTML = ''; return; }
    // Keep ALL original seats when computing pixel positions. Previously
    // we filtered to active-only seats here, which caused the remaining
    // players to visually rotate / re-space themselves around the felt
    // every time someone got eliminated. Users found that disorienting:
    // "the players keep moving around between hands". Now we always
    // place against the original seating order and mark the eliminated
    // ones as .seat-out so they render visually faded but in place.
    const n = S.seats.length;
    const myIdx = S.seats.indexOf(S.myId);
    let rotated = myIdx >= 0 ? [...S.seats.slice(myIdx), ...S.seats.slice(0, myIdx)] : S.seats;
    // ── Option avancée « Retirer les joueurs partis » (défaut OFF : le siège
    // fantôme grisé reste, comportement historique). Activée : les partis
    // (.gone) sortent de la table et les joueurs restants sont REPLACÉS selon
    // la table de placement du nouveau compte (slots QML M→sièges + échelle
    // bisectée), exactement comme si la partie avait ce nombre de joueurs. ──
    if (_advGet('remove_gone', false)) {
      var _kept = rotated.filter(function (p) { var _sg = S.seatData[p]; return !(_sg && _sg.gone); });
      if (_kept.length) rotated = _kept;
    }
    try { window._seatCount = rotated.length; } catch (e) {}
    // Position seats using actual pixel coords from getBoundingClientRect
    const oval = document.querySelector('.felt-oval');
    const zone = document.getElementById('g-table-zone');
    if (!oval || !zone) return;
    // Traits du pack de sièges actif (descripteur de pack, étape 3) —
    // résolus UNE fois par rendu ; remplacent les tests en dur sur l'id.
    var _seatTr = _seatTraitsNow();
    // Echelle de zoom courante (tablette/desktop) : chaque siege est reduit du
    // meme facteur que le feutre -> zoom uniforme. Mobile / zoom 1 -> 1 (no-op).
    var _seatZoom = 1;
    try { if (typeof _getTableZoom === 'function' && typeof _tableZoomGate === 'function' && _tableZoomGate()) _seatZoom = _getTableZoom(); } catch (e) {}
    // Petits ecrans : reduire la taille des box (avatars + texte) pour qu'elles tiennent
    // autour du feutre sans le chevaucher (le client officiel fait pareil via boxScale).
    var _seatBoxScale = 1;
    try { var _sbw = window.innerWidth, _sbh = window.innerHeight; if (Math.min(_sbw, _sbh) < 540) { var _opp = Math.max(0, rotated.length - 1); _seatBoxScale = (_sbh > _sbw) ? Math.max(0.72, 0.90 - Math.max(0, _opp - 4) * 0.026) : Math.max(0.80, 0.98 - Math.max(0, _opp - 4) * 0.022); } } catch (e) {}
    // Rabot mesuré : appliqué à TOUS les modes de placement (l'officiel le
    // ré-applique après sa bisection ; classic/custom en profitent ici).
    _seatBoxScale *= (window._seatFitShave || 1);
    // Self-box PLUS GROSSE que les adversaires, comme le client officiel,
    // avec le ratio QML PAR APPAREIL (delta 2.1.3 §4.2 — selfBaseHeight /
    // oppBaseHeight) :
    //   portrait 82/71 = 1.155 · desktop/tablette wide 96/84 = 1.143 ·
    //   landscapeCompact 94/84 = 1.119 (la tableZone est « wide » en paysage
    //   compact → opp = 84, PAS 71 ; l'ancien 1.32 surdimensionnait la self).
    // C'est l'agrandissement de BASE (zoom 0) ; le cycle de zoom des cartes
    // (#g-cardzoom) reste independant et s'ajoute par-dessus.
    var SELF_BOX_MUL = 1.143;
    try {
      var _smw = window.innerWidth, _smh = window.innerHeight;
      if (_smh > _smw) SELF_BOX_MUL = 1.155;
      else if (_smh < 600) SELF_BOX_MUL = 1.15;
      // STRICT QML (packs pokerth) : GamePlayerSelfBox est scalée par
      // boxScale COMME les adversaires (scale: tableZone.boxScale) — sa
      // proéminence vient de ses dimensions de BASE (avatar 52, cartes
      // 37×52, déjà dans le CSS des packs). Le multiplicateur émulait ce
      // ratio quand la self partageait le CSS des adversaires ; le garder
      // ferait un double boost (+14 %) et sur-réserverait la bisection.
      // Les packs non-pokerth (plate/card/bar, CSS partagé) le conservent.
      if (_seatTr.qmlSelf) SELF_BOX_MUL = 1;
    } catch (e) {}
    // Placement des sièges : 'classic' (ellipse maison, défaut) ou 'official'
    // (slots fixes du client PokerTH : grille périmètre en paysage façon client
    // desktop, colonnes G/D + rangée haute en portrait façon client QML). Les
    // positions officielles sont appliquées en surcouche après la passe classique
    // (voir _officialSeatPix + le bloc de surcouche plus bas).
    var _seatModeV = 'auto';
    try { var _sm = localStorage.getItem('pth_seat_layout'); _seatModeV = (_sm === 'pokerth-official' || _sm === 'pokerth-ellipse' || _sm === 'custom') ? _sm : 'auto'; } catch (e) {}
    // Bascule portrait/paysage : le QML decide sur la TABLEZONE, pas la
    // fenetre (GamePage.qml:453 `wide: width >= height` — tableZone =
    // fenetre - status bar - action bar, self-box INCLUSE). Equivalent web :
    // #g-table-zone + la player-bar (la self y vit quand elle est visible).
    // Avant : window.innerHeight > innerWidth -> une fenetre 573x600
    // (portrait) prenait les slots colonnes alors que le QML, dont la
    // tableZone est large (573x~410), prend l'ellipse.
    // data-seat-orient posé dans la MÊME passe que la disposition ; raffiné
    // juste après, une fois _forceSeatPortrait connu (_applySeatOrient).
    try { if (typeof window._applySeatOrient === 'function') window._applySeatOrient(); } catch (e) {}
    var _seatPortrait = (typeof window._tableZonePortrait === 'function')
      ? window._tableZonePortrait()
      : (window.innerHeight > window.innerWidth);
    var _isPhone = Math.min(window.innerWidth, window.innerHeight) < 540;
    // auto : bascule entre les deux modes officiels selon l'orientation
    //   (portrait = slots officiels, paysage = ellipse officielle 2.1.1).
    // pokerth-official = slots QML officiels forces PARTOUT (meme en paysage).
    // pokerth-ellipse  = geometrie officielle orientation-respectee (slots en
    //   portrait, ellipse officielle en paysage) = base sur l'app officielle.
    // custom = ellipse maison + glisser-deposer.
    var _applyOfficial, _forceSeatPortrait;
    // ── 4 rendus VISIBLEMENT distincts (surtout en portrait, ou auto/official/
    //    ellipse etaient auparavant identiques) ──
    if (_seatModeV === 'pokerth-official') {
      // Slots QML officiels (grille portrait) forces PARTOUT : meme
      // disposition sur TOUS les peripheriques et orientations (choix
      // narmod). NB : les ecarts inegaux entre groupes de 2 (paires de
      // slots a 0.135, trou 0.305) sont inherents a cette grille QML.
      _applyOfficial = true; _forceSeatPortrait = true;
    } else if (_seatModeV === 'pokerth-ellipse') {
      // Ellipse « collier » officielle dans LES DEUX orientations (arc ouvert vers
      // le haut, self = perle du bas). En portrait -> ovale vertical, distinct des slots.
      _applyOfficial = true; _forceSeatPortrait = false;
    } else if (_seatModeV === 'custom') {
      // Placement perso : ellipse maison + positions sauvees (glisser-deposer).
      _applyOfficial = false; _forceSeatPortrait = _seatPortrait;
    } else {
      // auto : reproduit le client QML officiel (bible §3, layout unifie) —
      // PORTRAIT = slots officiels (grille pokerth-official) ;
      // PAYSAGE = ellipse officielle (pokerth-ellipse).
      if (_seatPortrait) { _applyOfficial = true; _forceSeatPortrait = true; }
      else               { _applyOfficial = true; _forceSeatPortrait = false; }
    }
    // La disposition retenue fait foi pour l'orientation des packs de sièges
    // (pokerth-official force la grille portrait même fenêtre en paysage).
    try { if (typeof window._applySeatOrient === 'function') window._applySeatOrient(_forceSeatPortrait); } catch (e) {}
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
    const yMulMe    = isSmall ? 0.16 : 0.06; // barre joueur toujours masquee (option retiree) -> self pres du rebord
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
    // -- Placement personnalise (custom) : surcouche fractions sauvees --
    // Chaque slot (0 = moi inclus) prend sa fraction de #g-table-zone si
    // elle existe ; sinon on garde la position classique calculee (repli).
    // Exclusif avec le placement officiel ci-dessous (depend du mode).
    if (_seatModeV === 'custom') {
      try {
        var _cust = (typeof window._seatCustomGet === 'function') ? window._seatCustomGet(rotated.length) : null;
        if (_cust) {
          for (var _cs = 0; _cs < pixPos.length; _cs++) {
            var _cf = _cust[_cs];
            if (_cf && typeof _cf.fx === 'number' && typeof _cf.fy === 'number') {
              pixPos[_cs] = { left: _cf.fx * zRect.width, top: _cf.fy * zRect.height };
            }
          }
        }
      } catch (e) {}
    }
    // ── Self = "grosse perle" au point bas de l'ellipse (comme le client
    // officiel) ── Épinglée au sol de la zone EN PAYSAGE dès qu'aucune
    // player-bar n'est à protéger (barre masquée OU style "pokerth" où la self
    // EST un siège). INDÉPENDANT du mode de placement : vaut pour auto /
    // officiel / ellipse ET custom sans position self sauvée. On respecte une
    // self posée à la main (custom) et la player-bar réellement affichée.
    var _pkStyleNow = !!_seatTr.qmlSelf; // géométrie self QML (trait du pack)
    var _selfHasCustom = false;
    if (_seatModeV === 'custom' && myIdx >= 0) {
      try { var _cSelf = (typeof window._seatCustomGet === 'function') ? window._seatCustomGet(rotated.length) : null;
            _selfHasCustom = !!(_cSelf && _cSelf[0] && typeof _cSelf[0].fy === 'number'); } catch (e) {}
    }
    var _selfAtPearl = (myIdx >= 0 && !_forceSeatPortrait && !_selfHasCustom);
    // Diagnostic : dans la console, tape  _seatDbg  pour voir le build réellement
    // servi + le mode de placement + si la self est bien épinglée au point bas.
    try { window._seatDbg = { build: window.BUILD_VERSION, mode: _seatModeV,
      forcePortrait: _forceSeatPortrait, pkStyle: _pkStyleNow,
      selfHasCustom: _selfHasCustom,
      selfAtPearl: _selfAtPearl }; } catch (e) {}
    window._zoomInLayout = false;
    // Sémantique QML définitive (demande narmod) : le placement de BASE est la
    // bisection QML fidèle (zoom 1, jamais altérée par le réglage de zoom), et
    // le +/− est une LOUPE uniforme PAR-DESSUS (parité zoomLayer du client
    // officiel), sur tous les écrans. _zoomInLayout reste false : c'est
    // _applyZoomTransforms qui porte la loupe.
    if (_applyOfficial) {
      try {
        var _layoutZoom = 1;   // la bisection travaille TOUJOURS à zoom 1
        var _offPos = _officialSeatPix(rotated.length, _forceSeatPortrait, zRect.width, zRect.height, oCX, oCY, oRect, _seatBoxScale, _layoutZoom, myIdx < 0);
        // Diagnostic INCONDITIONNEL (le bloc interne peut être sauté si
        // _boxScale est NaN/absent — on veut voir pourquoi).
        try {
          window._seatDbg.zone = Math.round(zRect.width) + 'x' + Math.round(zRect.height);
          window._seatDbg.offPos = _offPos ? (_offPos._boxScale != null && _offPos._boxScale === _offPos._boxScale ? 'ok' : 'boxScale=' + _offPos._boxScale) : 'null';
          window._seatDbg.rawBoxScale = _offPos ? _offPos._boxScale : null;
          window._seatDbg.dims = window._seatDimsMeasured ? JSON.parse(JSON.stringify(window._seatDimsMeasured)) : null;
        } catch (eD) {}
        // Assis (myIdx>=0) : la self (slot 0) est gérée séparément (perle) ;
        // on ne remplace que les adversaires (1+). Spectateur (myIdx<0) : pas de
        // self -> on place TOUS les slots (0 inclus) pour que l'officiel s'applique.
        var _op0 = (myIdx >= 0) ? 1 : 0;
        if (_offPos) { for (var _op = _op0; _op < pixPos.length; _op++) { if (_offPos[_op]) pixPos[_op] = _offPos[_op]; } }
        // Échelle bisectée du QML (paysage seulement) : remplace l'heuristique
        // téléphone, chaque box adverse est mise à l'échelle comme l'officiel.
        if (_offPos && _offPos._boxScale) {
          // Portrait : bisection QML pure. Paysage : sièges volontairement plus
          // petits que la bisection — desktop -10%, MOBILE COMPACT -20% (la
          // hauteur d'écran est minuscule, les boîtes pleines paraissaient
          // énormes et se touchaient ; demande narmod). Le zoom + repart de
          // cette base réduite.
          // BUGFIX 0.3.559 : `compact` n'était PAS déclaré dans cette portée →
          // ReferenceError avalée par le try : l'échelle bisectée n'était JAMAIS
          // appliquée (sièges sur l'ancienne heuristique, plus petits que le QML)
          // et le commScale continu ne tournait jamais (barre étroite). Cause
          // unique des deux symptômes remontés par narmod.
          // STRICT QML : l'échelle appliquée EST la bisection (scale:
          // tableZone.oppScale) — l'ancien −10 % desktop (ajustement web)
          // faisait des boxes plus petites que le client officiel
          // (rawBoxScale 1.41 → 1.27 constaté chez narmod, 2026-07-15).
          _seatBoxScale = _offPos._boxScale;
          // Rabot anti-chevauchement MESURÉ (voir garde post-rendu) : corrige
          // sur écran ce que la bisection théorique aurait laissé passer.
          _seatBoxScale *= (window._seatFitShave || 1);
          window._tableZoomMaxed = false;   // loupe : le plafond est géré par applyTableZoom (maxFit)
          // Diagnostic croissance-fenêtre : échelle bisectée réellement
          // appliquée + zone mesurée (comparaison entre navigateurs/tailles).
          try {
            window._seatDbg = window._seatDbg || {};
            window._seatDbg.boxScale = _seatBoxScale;
            window._seatDbg.zone = Math.round(zRect.width) + 'x' + Math.round(zRect.height);
          } catch (e) {}
          // ── communityScale CONTINU (parité QML GamePage) : la rivière/pot
          // remplit la lacune verticale mesurée entre la rangée du haut et la
          // self (paysage : avail/84, compact 66, plafond 0.70·W/264) ; en
          // portrait 0.15·H − boîte/2 − 6 sur 62, plafond (W−16)/264. Bornes
          // 0.55–1.8. Injecté dans --comm-scale (:root, inline) → il REMPLACE
          // les paliers média : rivière, pot et largeur de la barre d'action
          // grossissent avec la fenêtre comme le client QML. ──
          try { window._commScalePending = true; } catch (e) {}
        }
        // Point bas exact de l'ellipse pour la self (quand l'officiel est actif).
        // L'ÉPINGLAGE mesuré au rendu (plus bas) reste la garantie finale, même
        // si l'officiel est désactivé (custom / classique).
        if (_selfAtPearl && _offPos && _offPos._self) pixPos[0] = _offPos._self;
      } catch (e) {}
    }
    // ── Calcul SB / BB à partir du dealer ──
    // We must SKIP seats whose player has left (.gone) -- otherwise
    // the SB/BB chips get assigned to a ghost seat that hides all
    // its badges via CSS, leaving the table with no visible blinds.
    // Walk around the table until we find a non-gone seat.
    const dealerIdx = S.seats.indexOf(S.dealerPid);
    function nextActiveSeat(fromIdx, offset) {
      if (fromIdx < 0 || !S.seats.length) return -1;
      var n = S.seats.length;
      // At most n steps — if everyone is gone/out we give up gracefully.
      var idx = fromIdx;
      var stepped = 0;
      for (var k = 0; k < n; k++) {
        idx = (idx + 1) % n;
        var __sd2 = S.seatData[S.seats[idx]];
        // Skip seats that are either:
        //   - gone (player left voluntarily), or
        //   - eliminated (money <= 0 and not playing this hand,
        //     i.e. active=false) — narmod reported SB chip landing
        //     on an OUT seat. The dealer chip should walk past them.
        var __skip = !__sd2 || __sd2.gone || (__sd2.active === false) || (__sd2.money != null && __sd2.money <= 0);
        if (!__skip) {
          stepped++;
          if (stepped === offset) return S.seats[idx];
        }
      }
      return -1;
    }
    const sbPid = dealerIdx >= 0 && S.seats.length > 1
      ? nextActiveSeat(dealerIdx, 1)
      : -1;
    const bbPid = dealerIdx >= 0 && S.seats.length > 2
      ? nextActiveSeat(dealerIdx, 2)
      : (S.seats.length === 2 ? S.seats[dealerIdx] : -1); // heads-up: dealer = SB
    // Mémorise SB/BB pour le popup d'info joueur (lu hors de renderSeats).
    S._lastSbPid = sbPid; S._lastBbPid = bbPid;

    // Update player-bar
    const mySd = S.seatData[S.myId] || {};
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
    const myBlindChip = S.myId === sbPid
      ? chipSvg('SB','#1565c0','#fff','#0a3d7a')
      : (S.myId === bbPid ? chipSvg('BB','#b71c1c','#fff','#6d0c0c') : '');
    var _barPuckStyle = 'style="display:inline-block;width:18px;height:18px;vertical-align:middle;flex:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.45))"';
    const myDealerBadge = S.myId === S.dealerPid
      ? dealerChipSvg().replace('class="dealer-chip"', _barPuckStyle).replace("window._pthChip('", "window._pthBarChip('")
      : '';
    const myBlindBadge = myBlindChip
      ? myBlindChip.replace('class="blind-chip"', _barPuckStyle).replace("window._pthChip('", "window._pthBarChip('")
      : '';
    if (pbName) {
      pbName.textContent = S.myName;
      // D + blind regroupés dans un seul conteneur inline-flex centré, pour
      // qu'ils soient parfaitement alignés entre eux (avant : deux <span> au
      // calage vertical différent — le jeton de blind avait un top:-1px).
      pbName.innerHTML = S.myName
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
                     && mySd.active === false && !mySd.gone && !S._amSpectator);
    if (pbMon) {
      pbMon.textContent = mySd.money != null ? fmtChips(mySd.money) : '—';
      if (__amOut) {
        pbMon.innerHTML = '<span class="pb-out-tag">OUT</span> · ' + pbMon.innerHTML;
      }
    }
    if (pbAct)  pbAct.textContent  = mySd.action || '';
    if (pbBar)  {
      pbBar.classList.toggle('pb-active', S.myId === S.turnPid);
      pbBar.classList.toggle('pb-out', __amOut);
    }

    var _seatStyleV = document.documentElement.getAttribute('data-seat') || '';
    var _pkHole = !!_seatTr.holePlate; // cartes dans la boîte (trait du pack)
    var _maskMode = true; // mode masqué permanent (option retirée) : self-box = siège
    var _ownLvl = 0; try { _ownLvl = Math.min(3, Math.max(0, parseInt(localStorage.getItem('pth_big_own_cards'), 10) || 0)); } catch (e) {} // niveau "agrandir mes cartes" 0-3 (plafond = riviere)
    let h = '';
    var _apNew = {}; // signatures pucks/drapeau/action du rendu courant (anti-replay)
    rotated.forEach((pid, i) => {
      const px = pixPos[i];
      const isMe = pid === S.myId;
      const sd = S.seatData[pid] || {};
      const isDealer = pid === S.dealerPid;
      const isActive = pid === S.turnPid;
      const isOut  = sd.active === false; // eliminated or sitting out this hand
      const isGone = !!sd.gone; // player left the table — ghost seat
      // Ghost seats take precedence over eliminated: a gone player gets
      // the minimal-visibility .seat-ghost class instead of .seat-out.
      // The two are mutually exclusive (gone implies active=false), but
      // we still gate the seat-out class on !isGone to be explicit.
      // Parité GamePlayerBox QML : le portrait (oppBaseHeight 71) est
      // TOUJOURS non-wide (1 ligne « nom · $tapis »), le paysage est wide
      // (2 lignes). Depuis la fusion des packs (0.3.691), le pack unique
      // « PokerTH » suit la DISPOSITION retenue : grille portrait -> box
      // narrow, ellipse paysage -> box wide (_forceSeatPortrait, même
      // source que html[data-seat-orient]). Gardé par le trait narrowByOrient.
      var _seatNarrow = _seatTr.narrowByOrient ? _forceSeatPortrait : false;
      // ── Mise « hors boîte » (packs PokerTH), placement fidèle au client
      //    officiel. Landscape : le jeton est TOUJOURS sur un côté HORIZONTAL
      //    (extérieur) — 'l' pour les sièges nettement à gauche du centre, 'r'
      //    pour le reste (haut-centre inclus, comme la capture officielle) ;
      //    seuil = 6% de la largeur de la tableZone. Portrait : côté INTÉRIEUR
      //    (vers le pot), axe dominant l/r/t/b (le haut-centre passe en 'b').
      //    Classe betside-* sur .seat ; le CSS positionne .seat-bet en absolu.
      //    Self exclue (sa mise est dans la barre d'action). ──
      var _betSideCls = '';
      if (_seatTr.betOut) {
        var _bdx = px.left - oCX, _bdy = px.top - oCY, _bs;
        // Cote INTERIEUR des jetons/pucks des que la DISPOSITION est la
        // grille portrait (et plus seulement quand le STYLE portrait est
        // choisi) : colonnes collees aux bords d'ecran -> mises et pucks
        // vers le feutre, jamais hors ecran (demande narmod, parite QML
        // betSide).
        if (_forceSeatPortrait) {
          // Parité QML exacte (GamePage Repeater) : en portrait SEUL X compte —
          // colonne gauche (x < 0.45) → mise/puck à DROITE (vers le feutre),
          // colonne droite (x > 0.55) → à GAUCHE, centre (TC) → DESSOUS.
          // (L'ancien choix par angle envoyait la mise AU-DESSUS pour les
          // sièges du bas → SB/BB entraient en collision avec le montant
          // et la boîte voisine.)
          var _fx = px.left / Math.max(zRect.width, 1);
          _bs = _fx < 0.45 ? 'r' : (_fx > 0.55 ? 'l' : 'b');
        } else {
          _bs = (_bdx > -zRect.width * 0.06) ? 'r' : 'l';
        }
        _betSideCls = 'betside-' + _bs;
      }
      const cls = ['seat', isMe?'me':'', isDealer?'dealer':'', isActive?'active':'',
                   sd.folded && !isGone ? 'folded' : '',
                   isOut && !isGone ? 'seat-out' : '',
                   _seatNarrow ? 'seat-narrow' : '',
                   isGone ? 'seat-ghost' : '', _betSideCls].filter(Boolean).join(' ');
      var _ignHide = !isMe && _isIgnored(getPlayerName(pid)) && !_advGet('no_hide_ignored', false);
      const initial    = _ignHide ? ((getPlayerName(pid) || '?').charAt(0).toUpperCase() || '?') : getPlayerInitial(pid);
      const typeBadge  = getPlayerTypeBadge(pid);
      var _hasEmojiAv = isMe
        ? (function(){ try { var av = localStorage.getItem('pth_avatar'); return !!av && av !== '__pth__' && av !== '__img__'; } catch(e){ return false; } })()
        : (_ignHide ? false : !!S._playerAvatars[pid]);
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
      h += '<div class="' + cls + ((!isMe && _sdLosers && _sdLosers.has(pid)) ? ' loser-fade' : '') + ((_sdWinners && _sdWinners.has(pid)) ? ' winner' + (px.top < 70 ? ' winner-below' : '') : '') + '" data-pid="' + pid + '"' + (isMe ? ' data-base-top="' + px.top.toFixed(1) + '" data-base-left="' + px.left.toFixed(1) + '" data-base-scale="' + (_seatBoxScale * SELF_BOX_MUL).toFixed(4) + '"' : '') + ' style="position:absolute;top:' + px.top.toFixed(1) + 'px;left:' + px.left.toFixed(1) + 'px;--sscale:' + (isMe ? (_seatBoxScale * SELF_BOX_MUL).toFixed(4) : _seatBoxScale) + ';transform:translate(-50%,-50%) scale(' + (isMe ? (_seatBoxScale * SELF_BOX_MUL).toFixed(4) : _seatBoxScale) + ')">';
      const isSB = pid === sbPid;
      const isBB = pid === bbPid;
      let blindBadge = '';
      if (isSB) blindBadge = chipSvg('SB','#1565c0','#fff','#0a3d7a');
      else if (isBB) blindBadge = chipSvg('BB','#b71c1c','#fff','#6d0c0c');
      const timerSvg = isActive ? ((_seatTr.timerRect || _seatTr.timerBar) ? '' : _timerSvg(S._timerSec, S._timerTot)) : ''; // anneau avatar : seulement pour les packs SANS cadre rect NI barre fine
      const avatarCls = 'seat-avatar' + (isActive ? ' timing' : '') + avatarType;
      let dealerChip = isDealer ? dealerChipSvg() : '';
      // Packs PokerTH : pucks = disques crème OFFICIELS (table par défaut QML :
      // tableDealerPuck/SmallBlind/BigBlind ~ /pucks/*.svg) au lieu des chips
      // dessinés (D sombre doré, SB bleu, BB rouge) qui ne correspondent pas.
      // Un puck de thème explicite (_pthPuck) reste prioritaire.
      if (_seatTr.pucksSide) {
        // Fidélité table par défaut QML : Dealer = disque crème officiel ;
        // SB reste BLEU et BB reste ROUGE (chipSvg ci-dessus) -> on ne touche
        // qu'au dealer. Un puck de thème explicite reste prioritaire.
        if (isDealer) dealerChip = '<img class="dealer-chip" src="' + (_pthPuck('--puck-dealer') || '/pucks/dealer.svg') + '" alt="D" width="20" height="20">';
      }
      // ── Anti-replay des pops (sp0ck 2026-07-17 : « petit flicker ») :
      // renderSeats reconstruit l'innerHTML à chaque update d'état, ce qui
      // rejouait chipPop/seatBadgePop même quand RIEN n'avait changé pour ce
      // siège. On mémorise la signature (pucks / drapeau / action) du rendu
      // précédent par pid ; si identique → classe .no-pop (animation: none).
      var _apPrev = (window._seatAnimPrev && window._seatAnimPrev.g === S.gId) ? window._seatAnimPrev.m[pid] : null;
      var _puckSig = (isDealer ? 'D' : '') + (isSB ? 'S' : (isBB ? 'B' : ''));
      if (_apPrev && _apPrev.p === _puckSig) {
        if (dealerChip) dealerChip = dealerChip.replace('dealer-chip', 'dealer-chip no-pop');
        if (blindBadge) blindBadge = blindBadge.replace('blind-chip', 'blind-chip no-pop');
      }
      // Packs PokerTH : pucks posés sur le CÔTÉ de la boîte -> hors de l'avatar.
      var _avPucks = _seatTr.pucksSide ? '' : (blindBadge + dealerChip);
      // Drapeau du pays sur l'avatar (coin bas-droite, comme un badge).
      // Vide si pays inconnu → rien affiché.
      const seatFlag = _ccToFlag(S._playerCountries[pid]);
      const flagBadge = seatFlag ? '<span class="seat-flag' + (_apPrev && _apPrev.f ? ' no-pop' : '') + '">' + seatFlag + '</span>' : '';
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
      if (!isMe && S._playerImgAvatars[pid]) pthAvUrl = S._playerImgAvatars[pid];
      if (_ignHide) pthAvUrl = null;
      // ── Avatar par défaut = jeton PokerTH (fidélité client officiel) ──
      // Aucun avatar perso (image) NI emoji choisi → on affiche le
      // logo-jeton plutôt qu'un carré-lettre coloré. Vaut pour moi, les
      // adversaires humains ET les bots (tous identiques, comme l'officiel).
      // Réutilise _hasEmojiAv déjà calculé plus haut (gère aussi _ignHide).
      let _isDefaultChip = false;
      if (!pthAvUrl && !_hasEmojiAv && !_ignHide) { pthAvUrl = '/favicon.svg'; _isDefaultChip = true; }
      // Couleur unique par joueur — neutralisée pour le jeton par défaut
      // (fond neutre derrière le jeton, comme mon siège / l'officiel).
      const aColor = (isMe || _isDefaultChip) ? null : getAvatarColor(pid);
      const avatarStyle = aColor
        ? 'position:relative;background:' + aColor.bg + ';border-color:' + aColor.border + ';color:' + aColor.text + ';box-shadow:0 0 0 2px ' + aColor.border + '44'
        : 'position:relative';
      const pthImg = pthAvUrl
        ? '<img class="seat-pth-img" src="' + pthAvUrl + '" alt="" draggable="false">'
        : '';
      const avCls2 = avatarCls + (pthAvUrl ? ' has-pth-avatar' : '');
      h += '<div class="seat-plate">'; // pack siege : avatar + (nom/tapis) -- display:contents en classique
      // Countdown rectangulaire (style pokerth) : cadre autour de la boite.
      if (isActive && _seatTr.timerRect) h += _timerRectSvg(S._timerSec, S._timerTot, isMe);
      // Packs pokerth : drapeau retiré du coin d'avatar — le QML l'affiche
      // 22×15 en bas-gauche de la zone info (wide) et pas du tout en portrait.
      h += '<div class="' + avCls2 + '" style="' + avatarStyle + '">'
        + pthImg
        + '<span class="seat-initial">' + initial + '</span>'
        + timerSvg
        + _avPucks
        + (_seatTr.flagInfo ? '' : flagBadge)
        + typeBadge
        + '</div>';
      // Cartes self GRANDES PAR DEFAUT (niveau 0 = taille de base QML :
      // shc-big ~ cartes communes, cf. GamePlayerSelfBox). Le cycle
      // #g-cardzoom (1-5) reste un reglage utilisateur par-dessus
      // (l1/l2 plus petites, l3/l4 plus grandes). Hors style pokerth,
      // les cartes self n'apparaissent dans le siege qu'en mode masque.
      var _selfBig = isMe && !isGone && !isOut && (_seatTr.selfBigCards || _maskMode);
      // ── Badge d'action (PlayerActionBadge QML) : construit AVANT les cartes
      // pour pouvoir être centré SUR la rangée de hole-cards dans les packs
      // pokerth (x/y = cardsCenter, comme le client officiel). Hors pokerth,
      // il reste rendu dans le pied du siège (comportement historique).
      var _acCode = ({'Fold':1,'Check':2,'Call':3,'Bet':4,'Raise':5,'All-in':6})[sd.action] || 0;
      // Au tour (isActive) : l'action de la street/du tour PRECEDENT ne doit
      // pas rester affichee sur les cartes — c'est la barre/cadre de decompte
      // qui prend la place (demande narmod 2026-07-18). Le badge reapparait
      // (avec pop) des que le joueur agit, le siege n'etant alors plus actif.
      var _acStale = isActive && _acCode;   // action perimee masquee au tour
      if (_acStale) _acCode = 0;
      var _acBadge = '', _acInCards = false;
      if (_acCode) {
        var _acBase = ['','fold','check','call','bet','raise','allin'][_acCode];
        var _acKey = ['','actBadgeFold','actBadgeCheck','actBadgeCall','actBadgeBet','actBadgeRaise','actBadgeAllin'][_acCode];
        _acBadge = '<div class="seat-action-badge' + (_apPrev && _apPrev.a === _acCode ? ' no-pop' : '') + ' act-c' + _acCode + '">' + esc(pkTerm(_acBase, _acKey)) + '</div>';
      }
      _apNew[pid] = { p: _puckSig, f: !!seatFlag, a: _acCode }; // signature du rendu courant
      // Bloc F — PlayerTimeoutBar QML : visible tant que le siège est au tour
      // SANS badge d'action ni état gagnant. Adversaires : centrée sur les
      // cartes. SELF avec strip (pack pokerth) : dans le bandeau AU-DESSUS de
      // la box, comme le QML 2.1.3 (demande narmod 2026-07-18). La largeur du
      // remplissage est tenue à jour chaque seconde par _updateTimer.
      var _tbar = '';
      if ((_seatTr.timerBar || _seatTr.timerRect) && isActive && !_acBadge && !(_sdWinners && _sdWinners.has(pid))) {
        var _tfrac = Math.max(0, Math.min(1, S._timerSec / (S._timerTot || 30)));
        _tbar = '<div class="seat-timeout-bar' + (isMe ? ' me' : '') + '"><div class="stb-fill" style="width:' + (_tfrac * 100).toFixed(1) + '%"></div></div>';
      }
      var _tbarInStrip = !!_tbar && isMe && _seatTr.selfStrip; // self pokerth : barre hors box
      if ((_pkHole || _selfBig) && !isGone && !isOut) {
        var _ownHide = isMe && _ownCardsHidden();
        var _phc1 = isMe ? (_ownHide ? null : S.myCards[0]) : sd.card1;
        var _phc2 = isMe ? (_ownHide ? null : S.myCards[1]) : sd.card2;
        var _hcBigCls = _selfBig ? (' shc-big' + (_ownLvl >= 1 && _ownLvl <= 3 ? ' shc-l' + _ownLvl : '')) : '';  // 0 = base QML (85% riviere) ; 1-3 croissants, plafond riviere
        var _hcCls = 'seat-holecards' + _hcBigCls;
        var _hcSz  = _selfBig ? '' : 'xsm';
        // Adversaires : badge centré sur les hole-cards (PlayerActionBadge QML).
        // SELF : depuis sp0ck 2026-07-17 (QML 2.1.4), le badge va AU-DESSUS de
        // la box (strip) pour ne pas masquer ses propres cartes — le self est
        // donc exclu ici quand le pack a un strip (repli cartes sinon).
        var _hcBadge = (_seatTr.badgeOnCards && _acBadge && !(isMe && _seatTr.selfStrip) && !(_sdWinners && _sdWinners.has(pid))) ? _acBadge : ''; // visible: actionText && !isWinner (QML)
        if (_hcBadge) _acInCards = true;
        h += '<div class="' + _hcCls + '">' + cardHtml(_phc1,_hcSz) + cardHtml(_phc2,_hcSz) + _hcBadge + (_tbarInStrip ? '' : _tbar) + '</div>';
      }
      // Badge timer sous l'avatar (visible et non confondu avec l'emoji)
      if (isActive) h += '<div class="seat-timer-badge" id="stb-'+pid+'">'
        + ((S._timerSec > 0) ? S._timerSec + 's' : '') + '</div>';
      h += '<div class="seat-info">';
      h += '<div class="seat-name">' + esc(isMe ? S.myName : getPlayerName(pid)) + '</div>';
      if (_seatTr.flagInfo && !_seatNarrow) {
        // infoBar QML (wideLayout) : drapeau 22×15 en bas-gauche + stack or à droite.
        h += '<div class="seat-info-row2">' + flagBadge + '<div class="seat-money">' + moneyStr + '</div></div>';
      } else {
        h += '<div class="seat-money">' + moneyStr + '</div>';
      }
      h += '</div>';   // ferme .seat-info
      h += '</div>';   // ferme .seat-plate
      // PlayerWinnerOverlay QML : badge « WINNER » (pilule or/vert sombre) ancré
      // au-dessus de la boîte (au-dessous via .winner-below pour la plus haute).
      if (_seatTr.winnerBadge && _sdWinners && _sdWinners.has(pid)) {
        h += '<div class="seat-winner-badge">' + esc(t('winnerBadge')) + '</div>';
      }
      // ── Strip self : mise (BetChip) + badge d'action au-dessus de la box
      // (sp0ck 2026-07-17, aligné QML 2.1.4 : les cartes propres restent
      // lisibles). La barre de décompte reste centrée sur les cartes.
      if (_seatTr.selfStrip && isMe) {
        var _stripBet = (sd.bet > 0) ? '<div class="seat-bet strip-bet">' + fmtChips(sd.bet) + '</div>' : '';
        // UNIQUEMENT pour les packs à structure pokerth/QML (badgeOnCards) :
        // c'est le badge qui était sur les cartes que sp0ck a déplacé vers le
        // strip. Les autres packs gardent leur badge dans le pied du siège
        // (correction narmod 2026-07-17 : la migration ne les concerne pas).
        var _stripBadge = (_seatTr.badgeOnCards && _acBadge && !(_sdWinners && _sdWinners.has(pid))) ? _acBadge : '';
        if (_stripBadge) _acInCards = true; // évite le doublon dans le pied
        var _stripTb = _tbarInStrip ? _tbar : ''; // barre de décompte AU-DESSUS de la box (QML 2.1.3)
        if (_stripBet || _stripBadge || _stripTb) {
          h += '<div class="seat-self-strip' + (_stripTb ? ' has-tb' : '') + '">' + _stripBet + _stripBadge + _stripTb + '</div>';
        }
      }
      if (_seatTr.pucksSide && (blindBadge || dealerChip)) h += '<div class="seat-pucks">' + blindBadge + dealerChip + '</div>';
      h += '<div class="seat-foot">'; // pied : mise / action / cartes
      if (sd.bet) h += '<div class="seat-bet">' + fmtChips(sd.bet) + '</div>';
      // Action → badge préparé plus haut (posé sur les cartes en pack pokerth,
      // sinon ici dans le pied). Le texte non-action (gains au showdown,
      // '+X'/'🏆') garde le libellé simple.
      if (_acCode) {
        if (!_acInCards) h += _acBadge;
      } else if (sd.action && !_acStale) {
        h += '<div class="seat-action-label">' + esc(sd.action) + '</div>';
      }
      h += cardStr;
      h += '</div>'; // ferme .seat-foot
      h += '</div>'; // ferme .seat
    });
    el.innerHTML = h;
    window._seatAnimPrev = { g: S.gId, m: _apNew }; // anti-replay : signatures de CE rendu
    // Loupe QML : suivi différé du siège actif + suspension showdown.
    try {
      if (typeof window._loupeOnRender === 'function') {
        var _actEl0 = el.querySelector('.seat.active:not(.me)');
        window._loupeOnRender(_actEl0, !!(_sdWinners && _sdWinners.size), (typeof S._timerTot !== 'undefined' ? S._timerTot : 30));
      }
    } catch (eLp) {}
    // ── Garde anti-chevauchement MESURÉE (placement officiel) : après CHAQUE
    // rendu, on vérifie les rects RÉELS des plates — débordement de la zone,
    // recouvrement entre sièges (> 4 px sur les 2 axes) ou siège sur la bande
    // des cartes communes (> 6 px). En cas de violation, l'échelle est rabotée
    // de 6 % (window._seatFitShave, plancher 0.6) et on re-rend : convergence
    // en quelques frames. Vérité écran → couvre zoom hérité, angles morts du
    // port compact, dimensions mesurées en retard, etc. Le rabot se remet à 1
    // quand le nombre de sièges ou la taille de zone change. ──
    try {
      var _fitKey = rotated.length + ':' + Math.round(zRect.width) + 'x' + Math.round(zRect.height) + ':' + (_forceSeatPortrait ? 'p' : 'l');
      if (window._seatFitKey !== _fitKey) { window._seatFitKey = _fitKey; window._seatFitShave = 1; }
      // STRICT QML : AUCUN rabot post-bisection en placement officiel — la
      // bisection (verbatim GamePage.qml, équivalence Node prouvée) est la
      // seule garantie, comme le client officiel. L'ancienne garde mobile
      // (<600 px de côté min) attrapait aussi les fenêtres desktop à mi-écran
      // et spiralait vers 0.5 dès que la community effleurait une plaque.
      var _fitMob = false;
      if (!_applyOfficial || !_fitMob) { window._seatFitShave = 1; }
      else if (!window._seatFitBusy) {
        var _zrG = zone.getBoundingClientRect();
        var _prs = [];
        el.querySelectorAll('.seat:not(.seat-ghost) .seat-plate').forEach(function (pl) {
          var rr = pl.getBoundingClientRect();
          if (rr.width > 4 && rr.height > 4) _prs.push(rr);
        });
        var _badFit = false;
        for (var _fi = 0; _fi < _prs.length && !_badFit; _fi++) {
          var rA = _prs[_fi];
          if (rA.left < _zrG.left - 4 || rA.right > _zrG.right + 4 || rA.top < _zrG.top - 4 || rA.bottom > _zrG.bottom + 4) { _badFit = true; break; }
          for (var _fj = _fi + 1; _fj < _prs.length; _fj++) {
            var rB = _prs[_fj];
            var ox = Math.min(rA.right, rB.right) - Math.max(rA.left, rB.left);
            var oy = Math.min(rA.bottom, rB.bottom) - Math.max(rA.top, rB.top);
            if (ox > 2 && oy > 2) { _badFit = true; break; }
          }
        }
        if (!_badFit) {
          var _cm = document.getElementById('g-comm');
          if (_cm) {
            var rC = _cm.getBoundingClientRect();
            if (rC.width > 10) for (var _fk = 0; _fk < _prs.length; _fk++) {
              var rS = _prs[_fk];
              var cx = Math.min(rS.right, rC.right) - Math.max(rS.left, rC.left);
              var cy = Math.min(rS.bottom, rC.bottom) - Math.max(rS.top, rC.top);
              if (cx > 4 && cy > 4) { _badFit = true; break; }
            }
          }
        }
        if (_badFit && (window._seatFitShave || 1) > 0.5) {
          window._seatFitShave = Math.max(0.5, (window._seatFitShave || 1) * 0.94);
          window._seatFitBusy = true;
          setTimeout(function () { window._seatFitBusy = false; try { renderSeats(); } catch (e) {} }, 30);
        }
        try { if (window._seatDbg) { window._seatDbg.fitShave = window._seatFitShave || 1; window._seatDbg.fitBad = _badFit; } } catch (e) {}
      }
    } catch (e) {}
    // ── communityScale continu (voir bloc _commScalePending) ──
    try {
      if (window._loupeK > 1) {
        // Loupe active : rects transformés ×2 — on FIGE commScale/shift/fond
        // (le QML calcule sa communityScale hors zoom, le zoom est au-dessus).
        window._commScalePending = false;
      } else if (window._commScalePending && _applyOfficial) {
        window._commScalePending = false;
        var _csComm, _zW3 = zRect.width, _zH3 = zRect.height;
        var _commTargetY = null; // centre Y cible (px zone) — parité anchors QML
        if (_forceSeatPortrait) {
          var _oppH3 = (window._seatDimsMeasured && window._seatDimsMeasured.h > 30) ? window._seatDimsMeasured.h : 71;
          var _vHalf = 0.15 * _zH3 - _oppH3 * _seatBoxScale / 2 - 6;
          _csComm = Math.max(0.55, Math.min(1.8, (_vHalf > 0 ? _vHalf / 62 : 0.55), Math.max(0, _zW3 - 16) / 264));
          // QML (GamePage communityArea, branche portrait) :
          // verticalCenterOffset = -height*0.0025 + 5 par rapport au centre.
          _commTargetY = _zH3 / 2 - 0.0025 * _zH3 + 5;
        } else {
          // Port EXACT de GamePage.qml communityScale (branche wide) — audit
          // 2026-07-15 contre pokerth/pokerth qt6-qml. Trois corrections vs
          // l'ancien port : (1) topB = bas de la box la plus HAUTE (QML :
          // min slot y + oppH/2), pas le bas maximal de l'arc haut ; (2)
          // centre = BARYCENTRE vertical de toutes les boxes self incluse
          // (le QML a abandonné le milieu (topB+selfTop)/2) ; (3) plancher
          // boxScale·0.72 (compact 1.1) et cap boxScale·2.0 (compact 2.6).
          var _zr3 = zone.getBoundingClientRect();
          var _selfPl3 = el.querySelector('.seat.me .seat-plate');
          var _selfR3 = _selfPl3 ? _selfPl3.getBoundingClientRect() : null;
          var _selfTop3 = _selfR3 ? (_selfR3.top - _zr3.top) : (_zH3 - 100);
          var _sumY3 = _selfR3 ? (_selfR3.top + _selfR3.height / 2 - _zr3.top) : (_zH3 - 100);
          var _n3 = 1, _minB3 = Infinity;
          var _botTop3 = -Infinity, _botC3 = -Infinity; // siege du BAS de l'anneau (spectateur)
          el.querySelectorAll('.seat:not(.me):not(.seat-ghost) .seat-plate').forEach(function (pl3) {
            var rr3 = pl3.getBoundingClientRect();
            var _b3 = rr3.bottom - _zr3.top;
            if (_b3 < _minB3) _minB3 = _b3;                       // box la plus haute
            var _t3 = rr3.top - _zr3.top, _c3 = _t3 + rr3.height / 2;
            if (_c3 > _botC3) { _botC3 = _c3; _botTop3 = _t3; }   // box la plus basse
            _sumY3 += _c3; _n3++;                                 // barycentre
          });
          var _isCmp3 = _zH3 < 520 || window.innerHeight < 600;
          var _commC3 = _sumY3 / _n3;
          // Zuschauer (QML communityCenterY) : sans self-box l'anneau est
          // symetrique autour du centre de zone -> les cartes vont au MILIEU
          // de l'anneau libre, (topOpponentBottomY + selfVisualTopY)/2, ou
          // selfVisualTopY = HAUT du siege du bas de l'anneau (opp0). Le
          // barycentre ne sert qu'au mode assis (self-box incluse).
          if (myIdx < 0 && _botTop3 > -Infinity && _minB3 < Infinity) {
            _selfTop3 = _botTop3;
            _commC3 = (_minB3 + _selfTop3) / 2;
          }
          var _topB3 = (_minB3 < Infinity ? _minB3 : 0) + (_isCmp3 ? 39 : 26) * _seatBoxScale;
          var _avail3 = Math.min(_commC3 - _topB3 - 6, _selfTop3 - _commC3 - 6);
          var _gapF3 = _avail3 > 0 ? _avail3 / (_isCmp3 ? 66 : 84) : 0;
          var _cap3 = Math.min(_isCmp3 ? 2.6 : 1.8, _seatBoxScale * 2.0, (0.70 * _zW3) / 264);
          var _floor3 = _seatBoxScale * (_isCmp3 ? 1.1 : 0.72);
          _csComm = Math.max(0.55, Math.min(_cap3, Math.max(_floor3, _gapF3)));
          // QML (communityArea, branche wide) : verticalCenterOffset =
          // communityCenterY - height/2 -> centre de la rangee = barycentre.
          _commTargetY = _commC3;
        }
        document.documentElement.style.setProperty('--comm-scale', _csComm.toFixed(3));
        // ── Fond de table « center » (parité QML tableBackgroundImage) : image
        // agrandie pour couvrir, CENTRÉE sur (milieu zone, communityCenterY),
        // × TableBackgroundZoom — le tapis du visuel tombe au centre de
        // l'ellipse comme dans le client officiel. Ne s'applique qu'aux
        // thèmes align:center (pos 'center') en mode fullscreen ; les autres
        // gardent le cover ancré bas. ──
        try { _applyQmlBgCenter(zRect, _commTargetY); } catch (eBg) {}
        // ── Largeur du panneau d'action (parité GameActionBar.panelWidth) :
        // paysage = min(barre, max(largeur VISUELLE des cartes communes, 380)),
        // centré ; portrait = pleine largeur. --abar-w consommé par le CSS. ──
        try {
          if (!_forceSeatPortrait) {
            var _cmEl2 = document.getElementById('g-comm');
            var _cw2 = _cmEl2 ? _cmEl2.getBoundingClientRect().width : 0;
            document.documentElement.style.setProperty('--abar-w', Math.round(Math.max(_cw2 || 0, 380)) + 'px');
            document.documentElement.removeAttribute('data-abar');
          } else {
            document.documentElement.style.removeProperty('--abar-w');
            // Zone portrait : paddings/gaps QML compacts sur la barre
            // (raiseSection 4/8/2, spacing 3) — récupère ~25 px de zone.
            document.documentElement.setAttribute('data-abar', 'portrait');
          }
        } catch (eW) {}
        // ── Position verticale (parité anchors QML) : la rangée .comm-row est
        // ancrée à 50% du feutre ; on la décale de (cible − centre naturel du
        // feutre), converti en px LOCAUX du scaler (le transform d'autofit/zoom
        // multiplie tout décalage posé à l'intérieur). Clamp ±40% de la zone. ──
        try {
          var _fEl3 = document.querySelector('.felt-oval');
          if (_commTargetY !== null && _fEl3 && _fEl3.offsetHeight > 0) {
            var _fr3 = _fEl3.getBoundingClientRect();
            var _natC3 = _fr3.top - zRect.top + _fr3.height / 2;
            var _eff3 = _fr3.height / _fEl3.offsetHeight;
            if (!(_eff3 > 0.05)) _eff3 = 1;
            var _shift3 = (_commTargetY - _natC3) / _eff3;
            var _clamp3 = 0.40 * _zH3 / _eff3;
            if (_shift3 > _clamp3) _shift3 = _clamp3;
            if (_shift3 < -_clamp3) _shift3 = -_clamp3;
            if (Math.abs(_shift3) < 2) _shift3 = 0;
            document.documentElement.style.setProperty('--comm-shift-y', _shift3.toFixed(1) + 'px');
            try { window._seatDbg.commShiftY = Math.round(_shift3); } catch (e4) {}
          } else {
            document.documentElement.style.removeProperty('--comm-shift-y');
          }
        } catch (e5) { try { document.documentElement.style.removeProperty('--comm-shift-y'); } catch (e6) {} }
        try { window._seatDbg.commScale = _csComm; } catch (e3) {}
      } else if (window._commScalePending) {
        window._commScalePending = false;
        document.documentElement.style.removeProperty('--comm-scale');
        document.documentElement.style.removeProperty('--comm-shift-y');
        document.documentElement.style.removeProperty('--wallpaper-dyn-size');
        document.documentElement.style.removeProperty('--wallpaper-dyn-pos');
        document.documentElement.style.removeProperty('--abar-w');
        document.documentElement.removeAttribute('data-abar');
      }
    } catch (e) { try { window._seatDbg.commErr = String(e); } catch (e2) {} }
    // Self-box : remonter si son bas depasse la zone (tapis coupe en plein
    // ecran avec le boxScale de l'ellipse). Mesure reelle -> valable pour
    // tous les styles et tous les niveaux de zoom des cartes.
    try {
      var _meEl = el.querySelector('.seat.me');
      if (_meEl && _meEl.dataset.baseTop) {
        // Coordonnees LOCALES (offsetHeight n'est pas affecte par les transforms
        // de zoom, contrairement a getBoundingClientRect) -> clamp stable a tout zoom.
        var _bh2 = _meEl.offsetHeight * _seatBoxScale * SELF_BOX_MUL;
        var _bt2 = parseFloat(_meEl.dataset.baseTop) || 0;
        // Marge basse : QML = wide ? 12 : 4 ; en mode perle (paysage) la
        // marge web passe à 24 (même valeur que selfY de _qmlLandscapeLayout)
        // pour décoller la self du panneau d'action flottant (narmod 17/07).
        var _fm2 = _selfAtPearl ? 24 : 4;
        var _floor2 = zone.clientHeight - _fm2 - _bh2 / 2;
        // Portrait + pack pokerth : la self est ANCRÉE bas-centre comme le QML
        // (pas seulement une garde anti-débordement). Custom respecté.
        var _selfPinPortrait = _pkStyleNow && _forceSeatPortrait && !_selfHasCustom;
        // Mode "perle" (paysage officiel, pas de player-bar) : on ÉPINGLE la
        // self au sol de la zone par MESURE réelle à chaque rendu — garantit le
        // point bas de l'ellipse quels que soient le boxScale et le style.
        // Sinon : simple garde anti-débordement (remonte si le bas dépasse).
        if (_selfAtPearl || _selfPinPortrait || _bt2 > _floor2) {
          _meEl.dataset.baseTop = _floor2.toFixed(1);
          _meEl.style.top = _floor2.toFixed(1) + 'px';
          if (pixPos[0]) pixPos[0].top = _floor2;
        }
      }
      if (typeof window._applySelfZoomCounter === 'function') window._applySelfZoomCounter();
    } catch (e) {}
    // Mesure des tailles REELLES de boxes pour le layout ellipse (voir
    // _qmlLandscapeLayout). ATTENTION : .seat a max-width:68px et son contenu
    // visuel DEBORDE (plaque avatar+cartes+nom+cash) -> offsetWidth mesurait
    // ~68px au lieu du contour (~150px) et aggravait les chevauchements.
    // On mesure donc l'UNION des rects des enfants structurels du siege,
    // en EXCLUANT les surcouches volatiles (badge d'action, label, timer :
    // le layout QML les budgete deja via sideBadgeGap/topBadgeExt), puis on
    // divise par l'echelle appliquee (scale du siege x zoom table) pour
    // retrouver la taille intrinseque. Re-rendu UNIQUE si la mesure change
    // de plus de 2px (garde anti-boucle : _seatDimsRerender + seuil).
    try {
      var _zoomEffM = window._tableZoomEff || 1;
      var _unionSeat = function (seatEl, appliedScale) {
        var div = appliedScale * _zoomEffM;
        if (!(div > 0.05)) return null;
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, found = false;
        for (var ci = 0; ci < seatEl.children.length; ci++) {
          var kid = seatEl.children[ci];
          var kc = kid.className || '';
          if (typeof kc !== 'string') kc = '';
          // Exclusions = tout ce qui vit HORS de la boîte QML (121×71/84 = la
          // box SEULE) : pucks D/SB/BB, strip self, badge winner. Le layout
          // les budgète déjà (sideBadgeGapBase 48 / selfBadgeGapBase 8 /
          // topBadgeExt 39) — les compter ici les budgétait DEUX fois
          // (dims 164×101 au lieu de ~116×85 → commScale au plancher).
          if (kc.indexOf('seat-action-badge') !== -1 || kc.indexOf('seat-action-label') !== -1 || kc.indexOf('seat-timer-badge') !== -1
              || kc.indexOf('seat-pucks') !== -1 || kc.indexOf('seat-self-strip') !== -1 || kc.indexOf('seat-winner-badge') !== -1
              // Jeton de mise (.seat-bet dans .seat-foot) : surplomb LATÉRAL
              // absolu (~40 px) budgété par la bisection via sideBadgeGapBase
              // (48, xNeeded STRICT QML). Le mesurer le comptait DEUX fois →
              // dims ~150-160 dès qu'une mise est posée → boxes rapetissées
              // et échelle qui varie selon la street.
              || kc.indexOf('seat-foot') !== -1 || kc.indexOf('seat-bet') !== -1) continue;
          var kr = kid.getBoundingClientRect();
          if (!kr.width && !kr.height) continue;
          // .seat-info (nom + stack) : largeur VARIABLE — le montant change à
          // chaque action → la mesure jitterait → re-render + nouveau boxScale
          // = « flicker » de re-scale de la table (sp0ck 2026-07-17). Comme en
          // QML (box de taille fixe, le texte n'élargit jamais le layout), la
          // rangée texte ne compte que VERTICALEMENT.
          var _vOnly = kc.indexOf('seat-info') !== -1;
          if (!_vOnly) {
            found = true;
            if (kr.left < minX) minX = kr.left;
            if (kr.right > maxX) maxX = kr.right;
          }
          if (kr.top < minY) minY = kr.top;
          if (kr.bottom > maxY) maxY = kr.bottom;
        }
        if (!found) return null;
        return { w: Math.round((maxX - minX) / div), h: Math.round((maxY - minY) / div) };
      };
      var _s0m = (window._loupeK > 1) ? null : el.querySelector('.seat:not(.me)'); // loupe : mesure figée
      var _m0m = el.querySelector('.seat.me');
      var _dims = _s0m ? _unionSeat(_s0m, _seatBoxScale) : null;
      if (_dims && _dims.w > 40 && _dims.h > 30) {
        var _selfDims = _m0m ? _unionSeat(_m0m, _seatBoxScale * SELF_BOX_MUL) : null;
        var _nsh = _selfDims ? Math.round(_selfDims.h * SELF_BOX_MUL) : 0;
        var _pdm = window._seatDimsMeasured;
        if (!_pdm || Math.abs(_pdm.w - _dims.w) > 2 || Math.abs(_pdm.h - _dims.h) > 2 || Math.abs((_pdm.sh || 0) - _nsh) > 2) {
          window._seatDimsMeasured = { w: _dims.w, h: _dims.h, sh: _nsh };
          if (!window._seatDimsRerender) {
            window._seatDimsRerender = true;
            setTimeout(function () { window._seatDimsRerender = false; try { if (typeof renderSeats === 'function') renderSeats(); } catch (e) {} }, 30);
          }
        }
      }
    } catch (e) {}
    S._lastPixPos = pixPos;
    // Patcher l'avatar du joueur local immédiatement après le rendu.
    // Anti-flicker safety net: re-applies the emoji to .seat-initial
    // after a renderSeats() in case it lost it. Skipped entirely when
    // the user picked the PokerTH avatar -- in that case the renderer
    // already put an <img> in place and the .seat-initial is hidden
    // by .has-pth-avatar > .seat-initial { display:none } anyway.
    if (S._myAvatarCache && S._myAvatarCache !== '__pth__' && S._myAvatarCache !== '__img__') {
      requestAnimationFrame(function() {
        var mySeats = document.querySelectorAll('#g-seats .seat.me');
        mySeats.forEach(function(seat) {
          var ini = seat.querySelector('.seat-initial');
          if (ini && ini.textContent !== S._myAvatarCache) {
            ini.textContent = S._myAvatarCache;
            var av2 = seat.querySelector('.seat-avatar');
            if (av2) av2.classList.add('emoji-av');
          }
        });
      });
    }
    var _ov2 = document.querySelector('.felt-oval');
    if (_ov2) { var _or2 = _ov2.getBoundingClientRect();
      S._potCenter = { x: _or2.left + _or2.width/2, y: _or2.top + _or2.height/2 }; }
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
  function renderSeats() {
    if (S._seatsRenderPending) return;
    S._seatsRenderPending = true;
    requestAnimationFrame(function() {
      S._seatsRenderPending = false;
      renderSeatsImmediate();
    });
  }
  window.renderSeats = renderSeats; // pont requis par game/turn-timer.mjs (9f-3)

  // Mode spectateur : aucune barre d'action, comme le client QML officiel
  // (rien n'est affiché à la place des boutons). On vide simplement #g-actions.
  function clearSpectatorActions() {
    var ga = document.getElementById('g-actions');
    if (ga) ga.innerHTML = '';
    try { updateBottomLayout(); } catch (e) {}
  }
  window.clearSpectatorActions = clearSpectatorActions; // pont requis par ui/action-bar.mjs (9g-B4)

  function renderGameWaiting(msg, isHtml) {
    // Si le panneau "aperçu" est ouvert et que ce n'est pas notre tour, on
    // affiche le panneau au lieu du message d'attente (et on le garde sticky
    // face aux mises à jour serveur — tour d'un autre joueur, etc.).
    S._lastWaitingMsg = msg; S._lastWaitingIsHtml = !!isHtml;
    // Barre TOUJOURS présente pendant la partie (demande narmod 2026-07-17) :
    //  - plus de condition sur myCards : au showdown / entre les mains les
    //    cartes sont nulles mais la barre doit rester (boutons inertes) pour
    //    ne pas effondrer #g-actions → re-layout de la table (zoom/dézoom) ;
    //  - le garde « pas à notre tour » devient « pas notre tour LIVE » : en
    //    fin de main turnPid peut rester sur nous (dernier acteur) alors que
    //    setMyTurnActive(false) a déjà éteint le tour — la barre d'aperçu
    //    doit alors remplacer le message, pas l'inverse.
    var _liveTurn = false;
    try { var _mzL = document.querySelector('.my-zone'); _liveTurn = !!(_mzL && _mzL.classList.contains('my-turn-active')); } catch (e) {}
    var _pinShow = !S._amSpectator && S._gameStarted; // barre toujours affichée (mode masqué permanent)
    if ((S._preActionOpen || _pinShow) && !(S.turnPid === S.myId && _liveTurn)) { _renderPreActionPanel(); updateBottomLayout(); return; }
    // isHtml=true : msg contient du HTML interne sûr (généré par notre code)
    $('g-actions').innerHTML = '<div class="waiting-msg">' + (isHtml ? msg : esc(msg)) + '</div>';
    updateBottomLayout();
  }
  window.renderGameWaiting = renderGameWaiting; // pont requis par ui/action-bar.mjs (9g-B4)

  // Rendu du panneau "aperçu des actions" (cartes tapées hors de notre tour).
  // Boutons d'action en APERÇU (désactivés) + le seul réglage activable :
  // l'auto-check/fold. Toujours rendu dans #g-actions.
  function _flushPreviewIfPending() {
    if (!S._modeSelPendingPreview) return;
    S._modeSelPendingPreview = false;
    if (S._preActionOpen && S.turnPid !== S.myId) renderMyTurnActions(true);
  }

  // [9g-B4] _updatePinBtn / _renderPreActionPanel / _closePreActionPanel déplacé dans public/modules/ui/action-bar.mjs
  // (toujours global via window.*).


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
  // État de la case « Compléter avec des joueurs ordinateur » de la wait-page
  // (parité fillCpuCheck.checked côté QML). En mémoire de session seulement.
  window._wpFillBots = window._wpFillBots || false;
  // A été explicitement (dé)coché par l'utilisateur ? Tant que non, le défaut
  // suit le mode : coché en entraînement (offline), décoché ailleurs.
  window._wpFillBotsUserSet = window._wpFillBotsUserSet || false;
  window._wpSetFillBots = function(v) { window._wpFillBots = !!v; window._wpFillBotsUserSet = true; try { if (window._renderLobbyWaitActions) window._renderLobbyWaitActions(); } catch (e) {} };

  function renderWaitingPanel() {
    if (S._gameStarted) return;
    // Refonte « wait-page dans le lobby » : pendant l'attente on reste sur
    // s-lobby et c'est le panneau central #lobby-gameinfo qui porte les infos
    // de partie, la liste des joueurs et les options d'attente (case bots +
    // Démarrer / Quitter, selon admin ou joueur simple). On rafraîchit donc
    // simplement ce panneau à chaque join / leave / PlayerInfoReply.
    try {
      if (S.gId) {
        if (S._selectedGame !== S.gId) S._selectedGame = S.gId;
        renderGameInfoPanel(S.gId);
      }
    } catch (e) {}
    try { _updateLobbyWaitStatus(); } catch (e) {}
  }

  // [9f-8] _updateLobbyWaitStatus déplacée dans public/modules/ui/lobby.mjs.

  // Masque la wait-page et révèle le feutre. Appelé à GameStartInitial et
  // au départ de la table.
  function _wpHide() {
    var el = document.getElementById('g-wait-page');
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
    try { _updateLobbyWaitStatus(); } catch (e) {}
  }
  window._wpHide = _wpHide;
  window._renderWaitingPanel = renderWaitingPanel;

  // [9f-9] showEndGameOverlay déplacée dans public/modules/game/showdown.mjs
  // (toujours globale via window.*).

  function updateBottomLayout() {
    _updatePinBtn();
    // Echelle continue de la barre d'action (--bar-k) : suit la fenetre
    // comme le client QML, et ATTERRIT sur les valeurs du profil paysage
    // mobile a la frontiere (plus de « marche ») : a h=500, 54*k = 30px
    // pile (k plancher 0.55, h/900 et w/1300). Les polices suivent une
    // courbe plus douce (--bar-kf = 0.55 + 0.45k -> 0.8 a la frontiere,
    // soit 0.72rem = la valeur paysage). Pose partout : sur telephone les
    // blocs medias surchargent avec leurs valeurs fixes, sans effet.
    try {
      var _bw = window.innerWidth, _bh = window.innerHeight;
      // Échelle QML DISCRÈTE (GameActionBar 2.1.3) : le client officiel n'a
      // AUCUNE échelle continue — rangée 54 px constante, 56 si Theme.compact
      // (largeur < 600), 40 en landscapeCompact. k = rowHeight/54, police
      // kf = 12/15 = 0.8 en landscapeCompact, 1 sinon. (Remplace le rétreint
      // continu min(W/1300, H/900) qui faisait des boutons de 45 px sur des
      // fenêtres où le QML en affiche 54 — demande narmod 15/07.)
      // compactActions QML = landscapeCompact && isMobile : le desktop
      // ultrawide GARDE 54 px (« Auf dem Desktop bleiben die Buttons groß »).
      // isMobile web = pointer:coarse (une fenetre desktop basse restait
      // faussement « mobile » avec le seul critere h<600 -> boutons 40 px
      // la ou le QML en met 54). Theme.compact desktop = largeur < 900
      // (threeColumnMinWidth, bible §2) -> 56 px aussi entre 600 et 900.
      var _coarse = false;
      try { _coarse = window.matchMedia('(pointer: coarse)').matches; } catch (e2) {}
      var _lcB = _bw > _bh && _bh < 600 && _coarse;
      var _bk = _lcB ? 0.741 : (_bw < 900 ? 1.037 : 1);
      var _bkf = _lcB ? 0.8 : 1;
      if (window.__barK !== _bk) {
        window.__barK = _bk;
        document.documentElement.style.setProperty('--bar-k', _bk);
        document.documentElement.style.setProperty('--bar-kf', _bkf);
      }
    } catch (e) {}
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
      // Reserve EXACTE sous la table -> le tapis colle au-dessus de la barre
      // d'action (demande narmod). Quand les barres sont position:fixed
      // (portrait mobile, desktop), on MESURE leur hauteur reelle (dock +
      // barre d'action) au lieu du clamp CSS approximatif (110-140 px) qui
      // laissait un grand vide sous la self-box ou masquait le bas de zone.
      // En paysage court les barres sont en FLUX : le CSS force deja
      // padding-bottom:0 !important -> on nettoie l'inline.
      if (ga) {
        var _fixed = false;
        try { _fixed = getComputedStyle(mz).position === 'fixed'; } catch (e) {}
        if (_fixed) {
          var _res = pbH + (mz.offsetHeight || 0);
          var _cur = parseInt(ga.style.paddingBottom, 10) || 0;
          if (_cur !== _res) {
            ga.style.paddingBottom = _res + 'px';
            // La hauteur visible de la zone vient de changer : replacer les
            // sieges (guard _cur!==_res -> pas de boucle de re-rendu).
            setTimeout(function () { try { if (typeof renderSeats === 'function' && typeof S.seats !== 'undefined' && S.seats.length) renderSeats(); } catch (e) {} }, 50);
          }
        } else ga.style.removeProperty('padding-bottom');
      }
    }
  }
  window.updateBottomLayout = updateBottomLayout; // pont requis par ui/action-bar.mjs (9g-B4)

  // Track action history
  // Le journal stocke des FONCTIONS de rendu (thunks), pas des chaînes figées :
  // chaque entrée est rejouée à chaque rendu, donc les appels à t() reflètent
  // la langue active. renderLog() est exposé en window._retranslateLog et
  // rappelé par _retranslateSysChat() (lui-même appelé par setLang) → le journal
  // se re-traduit instantanément au changement de langue. Une chaîne passée
  // directement (lignes sans terme traduisible) est simplement figée.
  function logAction(entry, isAction) {
    // Parite QML LogsSettings : LogOnOff coupe la collecte (les entrees deja
    // enregistrees restent affichees) ; LogInterval 'hand' saute les lignes
    // d'action individuelles (isAction) et ne garde que les etapes de main.
    try {
      if (!_advGet('log_on', true)) return;
      if (isAction && _getLogInterval() === 'hand') return;
    } catch (e) {}
    var fn = (typeof entry === 'function') ? entry : function(){ return entry; };
    S.actionLog.push(fn);
    if (S.actionLog.length > 500) S.actionLog.shift();
    renderLog();
  }
  window.logAction = logAction; // pont requis par ui/action-bar.mjs (9g-B4)
  function renderLog() {
    const el = document.getElementById('g-log-body');
    if (!el) return;
    el.innerHTML = S.actionLog.slice().reverse().map(function(fn){
      var s; try { s = fn(); } catch (_e) { s = ''; }
      return '<div class="log-line">'+esc(s)+'</div>';
    }).join('');
  }
  window._retranslateLog = renderLog;
  // Texte brut du journal (ordre chronologique) pour l'export.
  function _buildLogText() {
    return S.actionLog.map(function(fn){ var s; try { s = fn(); } catch (_e) { s = ''; } return s; }).join('\n');
  }
  window._buildLogText = _buildLogText;
  // Joueurs déjà signalés comme éliminés (stack à 0) — évite de re-logguer à
  // chaque main suivante tant qu'ils n'ont pas quitté la table. Vidé au début
  // de chaque nouvelle partie (StartEvent).
  function logEliminations() {
    for (var _i = 0; _i < S.seats.length; _i++) {
      var _ep = S.seats[_i];
      var _sd = S.seatData[_ep];
      if (_sd && !_sd.gone && _sd.money === 0 && !S._eliminatedLogged.has(_ep)) {
        S._eliminatedLogged.add(_ep);
        const _ce = _ep;
        logAction(function(){ return '\u2620 ' + t('logEliminated', { name: getPlayerName(_ce) }); });
      }
    }
  }
  // [Phase 2 / 9d] setPct déplacée dans public/modules/ui/misc.mjs.
  window.setPct = setPct;
  // Exposer pour les animations + fonctions globales
  Object.defineProperty(window, 'seats',       {get: function(){ return S.seats; }});
  Object.defineProperty(window, 'seatData',    {get: function(){ return S.seatData; }});
  Object.defineProperty(window, 'myId',        {get: function(){ return S.myId; }});
  Object.defineProperty(window, 'players',     {get: function(){ return S.players; }});
  Object.defineProperty(window, '_ipBlockUntil',{
    get: function(){ return S._ipBlockUntil; },
    set: function(v){ S._ipBlockUntil = v; }
  });
  // Exposer pour les fonctions globales (avatar, etc.)
  // [9g-B4] notifyMyTurnVisuals / clearTurnNotif déplacé dans public/modules/ui/action-bar.mjs
  // (toujours global via window.*).


  window._renderSeats = function() { if (S.seats.length) renderSeats(); try { if (typeof window._hudRender === 'function') window._hudRender(); } catch (e) {} };
  // Variante SYNCHRONE (sans requestAnimationFrame) : rend immediatement, utilisee
  // par setSeatLayout sur iOS ou le rAF peut etre gele apres le selecteur natif.
  window._renderSeatsNow = function() { if (S.seats.length) { try { renderSeatsImmediate(); } catch (e) {} } try { if (typeof window._hudRender === 'function') window._hudRender(); } catch (e) {} };
  // Pseudos pour la complétion Tab du chat (parité ChatBox QML, bible §11) :
  // en jeu = les joueurs de la table ; au lobby = tous les joueurs connus.
  // Activité d'un joueur pour le panneau « Joueurs » (parité tooltip QML
  // 2.1) : nom de la table où il est assis — games[*].seats est tenu à jour
  // en continu par GameListNew / GameListPlayerJoined / GameListPlayerLeft —
  // ou '' s'il est au lobby.
  window._playerActivity = function (pid) {
    try {
      for (var id in S.games) {
        var g = S.games[id];
        if (g && g.mode !== 3 && g.seats && g.seats.indexOf(pid) !== -1) {
          return g.name || ('#' + id);
        }
      }
    } catch (e) {}
    return '';
  };
  window._chatNicks = function (gameScope) {
    try {
      if (gameScope && S.seats.length) {
        return S.seats.map(function (p) { return S.players[p] || ''; }).filter(Boolean);
      }
      return Object.values(S.players || {}).filter(Boolean);
    } catch (e) { return []; }
  };
  // Repeindre la pastille "N joueur(s)" du header lobby dans la langue
  // courante. Posée imperativement à la réception des messages serveur
  // (PlayerList / Statistics), elle n'a pas de data-i18n et restait donc
  // figée dans la langue précédente lors d'un changement de langue.
  // Appelée par setLang() (i18n.mjs).
  window._refreshPlayersPill = function() {
    try {
      var el = document.getElementById('h-players');
      if (el && el.textContent !== '—') {
        el.textContent = S._lobbyPlayerCount + ' ' + t('playersOnline');
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
    try { if (S._statsOpen && typeof renderStats === 'function') renderStats(); } catch (e) {}
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
      if (pim && pim.style.display !== 'none' && typeof openPlayerInfoPopup === 'function') openPlayerInfoPopup(S._pimPid);
    } catch (e) {}
  };
  window.renderGames = renderGames;
  window.toggleStats  = toggleStats;
  window._toggleStats = toggleStats;
  window._broadcastMyAvatar = function(emoji) {
    S._myAvatarCache = (emoji && emoji !== '__img__' && emoji !== '__pth__') ? emoji : '';
    if (S.ws && S.ws.readyState === WebSocket.OPEN && !directWS && S.myId) {
      if (emoji === '__img__') {
        // Diffuser l'image perso (data URL) aux autres clients du proxy.
        var img = ''; try { img = localStorage.getItem('pth_avatar_img') || ''; } catch(e) {}
        if (img) S.ws.send('AVATARIMG:' + S.myId + ':' + img);
      } else {
        // Emoji / initiale : diffuser l'emoji ET purger toute image perso
        // précédemment diffusée chez les autres (sinon elle resterait affichée).
        S.ws.send('AVATAR:' + S.myId + ':' + (_myAvatarToBroadcast()));
        S.ws.send('AVATARIMG:' + S.myId + ':');
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
      if (!(S.ws && S.ws.readyState === WebSocket.OPEN && !directWS && S.myId)) return;
      var choice = ''; try { choice = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
      if (choice === '__img__') {
        var img = ''; try { img = localStorage.getItem('pth_avatar_img') || ''; } catch(e) {}
        if (img) S.ws.send('AVATARIMG:' + S.myId + ':' + img);
      } else {
        S.ws.send('AVATAR:' + S.myId + ':' + _myAvatarToBroadcast());
      }
    } catch(e) {}
  }
  window._rebroadcastAvatar = _rebroadcastAvatar;

  // [9g-B4] _applyAssistUI + window.toggleAssist/setAssist (assistance) déplacé dans public/modules/ui/action-bar.mjs
  // (toujours global via window.*).


  // [Phase 2 / 9d] _attachPanelDrag déplacée dans public/modules/ui/misc.mjs.

  // [9g-B2] renderOddsMonitor (+ alias window._renderOdds) déplacé dans public/modules/ui/odds-panel.mjs
  // (toujours global via window.*).


  // [9g-B4] _runPreAction déplacé dans public/modules/ui/action-bar.mjs
  // (toujours global via window.*).


  // [9g-B4] renderMyTurnActions déplacé dans public/modules/ui/action-bar.mjs
  // (toujours global via window.*).


  // [9g-B4] doAction / confirmCall / doRaise déplacé dans public/modules/ui/action-bar.mjs
  // (toujours global via window.*).


// [9f-9] Showdown (snapshot des résultats, badge main gagnante, overlay
// vainqueur, dismissWinner, bouton main suivante) déplacé dans
// public/modules/game/showdown.mjs (toujours global via window.*).

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

      // Nick field state machine (spec narmod 2026-07-18) :
      //   lan / unauth / auth → éditables, préremplis depuis le pseudo
      //     PARTAGÉ pth_nick (un seul nom pour tous les modes ; en auth
      //     seul le login est stocké, jamais le mot de passe — le
      //     trousseau du navigateur s'en charge)
      //   guest → READONLY, toujours le GuestXXXXX persistant (règle à
      //     part, jamais synchronisé avec pth_nick)
      var nickEl = $('nick');
      // Always reset the readonly flag first; only Guest re-applies it.
      if (nickEl) nickEl.removeAttribute('readonly');

      if (mode === 'lan') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = t('nickPlaceholder');
        // Restore the per-mode saved pseudo (overrides whatever was
        // typed under another mode — same UX as switching profiles).
        if (nickEl) nickEl.value = window._pthNick.get();
        $('use-tls').checked = false;
        if (proxyInput) proxyInput.value = proto + '//' + (autoHost||'localhost') + ':' + port;
        if (hostInput && autoHost) hostInput.value = autoHost;
        if ($('port')) $('port').value = (lsGet('pth_lan_port') || '7234');
        setStatus(t('lanModeNote'), '', 'lanModeNote');
      } else if (mode === 'unauth') {
        $('nick-label').textContent = t('enterNickFree');
        $('nick').placeholder = t('nickPlaceholder');
        if (nickEl) nickEl.value = window._pthNick.get();
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
        if (nickEl) nickEl.value = window._pthNick.get();
        // Internet / PokerTH.net target: admin-selected server (from /app-config)
        // or the built-in pokerth.net:7234 default. Credentialed login always TLS.
        var _ps2 = window._pthNetServer;
        // TLS : en direct WS le flag est sans objet (wss:// de toute façon) et
        // on le laisse coché. Via le proxy (transport admin 'proxy' OU cible
        // hors pokerth.net, ex. loopback co-hébergé), suivre le flag TLS du
        // serveur actif : un serveur local sans TLS doit rester joignable — le
        // tronçon navigateur→proxy est déjà chiffré (WSS) et SCRAM protège le
        // mot de passe de bout en bout.
        var _viaProxy2 = (window._pthNetTransport === 'proxy') || (_ps2 && String(_ps2.host).indexOf('pokerth.net') < 0);
        $('use-tls').checked = _viaProxy2 ? (_ps2 ? !!_ps2.tls : true) : true;
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
        // Le mode entraînement utilise le pseudo PARTAGÉ pth_nick, comme
        // tous les modes réseau (sauf invité pokerth.net). Sync narmod
        // 2026-07-18 — l'ancienne isolation pth_offline_nick est retirée.
        var _onk = $('nick');
        if (_onk) {
          _onk.removeAttribute('readonly');
          _onk.placeholder = t('nickPlaceholder');
          _onk.value = window._pthNick.get();
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
      if (S._connectingNow) {
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
      const _modeChanged = (S._lastInitMode !== null) &&
                           (_curMode !== S._lastInitMode || _curNick !== S._lastInitNick);
      const _gapNow = Date.now() - S._lastInitTime;
      if (_modeChanged && _gapNow < S.MODE_SWAP_MIN_GAP) {
        const wait_ms = S.MODE_SWAP_MIN_GAP - _gapNow;
        const wait_s = Math.ceil(wait_ms / 1000);
        const that = this;
        // Disable the connect button so the user can't pile clicks
        S._connectingNow = true;
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
          S._connectingNow = false;
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
      if (S.ws && S.ws.readyState !== WebSocket.CLOSED) {
        S._connectingNow = true;
        var that2 = this;
        var btn2 = document.querySelector('#s-connect .btn-primary');
        if (btn2) btn2.disabled = true;
        setStatus('⏳ ' + (t('closingPrevious') || 'Fermeture de la connexion précédente…'));
        // Detach the old onclose to avoid the disconnect handler kicking in
        var prevWs = S.ws;
        prevWs.onclose = null;
        prevWs.onerror = null;
        try { prevWs.close(); } catch(e) {}
        S.ws = null;
        var done = false;
        var resume = function() {
          if (done) return; done = true;
          if (btn2) btn2.disabled = false;
          S._connectingNow = false;
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
      if (!_gateOffline && S._ipBlockUntil > now) {
        const remaining = Math.ceil((S._ipBlockUntil - now) / 1000);
        const mins = Math.floor(remaining / 60), secs = remaining % 60;
        setStatus(t('ipBlockedWaitPrefix') + (mins > 0 ? mins + 'min ' : '') + secs + 's', 'err');
        _startIpBlockCountdown();
        return;
      }
      // Rate limiter seulement après un échec (pas après une déco normale)
      if (S._lastConnectFailed && now - S._lastConnectTime < S.MIN_CONNECT_INTERVAL) {
        const wait = Math.ceil((S.MIN_CONNECT_INTERVAL - (now - S._lastConnectTime)) / 1000);
        setStatus(t('waitBeforeRetry', { n: wait }), 'err');
        return;
      }
      S._lastConnectTime = now;
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
          var _isOff2 = !!(_smEl && _smEl.value === 'offline');
          // Pseudo PARTAGÉ (pth_nick) pour tous les modes SAUF l'invité
          // pokerth.net, qui garde sa clé pth_guest_name dédiée.
          if ((_isOff2 || (lm2 && lm2.value !== 'guest')) && window._pthNick) {
            window._pthNick.set(nickVal);
          }
        }
      } catch(e) {}
      const proxyUrl  = $('proxy').value.trim();
      const host      = $('host').value.trim();
      const port      = $('port').value.trim() || '7234';
      const loginMode = $('login-mode') ? $('login-mode').value : 'guest';
      const _off = !!($('server-mode') && $('server-mode').value === 'offline');
      S.myName          = $('nick').value.trim();

      if (!S.myName && loginMode === 'guest') {
        // Persistent Guest name: re-use the same identifier across tabs
        // and reloads so the server doesn't see different pseudos flooding
        // from the same IP (a key trigger of the initBlocked behaviour).
        S.myName = (window.getOrCreateGuestName && window.getOrCreateGuestName())
                 || ('Guest' + String(Math.floor(10000 + Math.random()*90000)));
        $('nick').value = S.myName;
      }
      if (!S.myName) { setStatus(t('enterNick'), 'err'); return; }
      if (S.myName.length < 3) { setStatus(t('nickTooShort'), 'err'); return; }
      if (!_off && (!proxyUrl || !host)) { setStatus(t('fillFields'), 'err'); return; }

      if (!_off && loginMode === 'auth' && (!$('pass') || !$('pass').value.trim())) {
        setStatus(t('enterPassword'), 'err');
        return;
      }

      const useTls   = $('use-tls').checked;
      const tlsParam = useTls ? '1' : '0';
      // Close any existing connection first
      if (S.ws && S.ws.readyState !== WebSocket.CLOSED) {
        S.ws.onclose = null; // don't trigger the disconnect handler
        S.ws.close();
        S.ws = null;
      }
      S.rxBuf   = new Uint8Array(0);
      // En reconnexion « preserve » (bascule réseau), on NE vide PAS l'état de
      // la table / du lobby : le proxy rebranche le WebSocket sur la session
      // PokerTH déjà en cours (pas de nouvel Announce/Init), donc le serveur ne
      // renvoie pas la liste des joueurs/avatars — il faut les garder en mémoire
      // pour ne pas afficher des sièges vides. Repli (session expirée) : on
      // recevra un Announce → le flux normal repeuplera tout.
      if (!_preserve) {
        S.games   = {};
        S.players = {};
        S._playerCountries = {};
        S._playerRights = {};
        S._raiseMode = 1; S._raiseEvery = 0; S._lastBlindsUpHand = 0;
        S._blindsClockStart = 0; _stopBlindsCountdown();
        S._endRaiseMode = 1; S._endRaiseValue = 0; S._manualBlinds = [];
        // Avatars : indexés par pid (stables tant que la session lobby dure) ou
        // par hash (cache réutilisable). Donc même cycle de vie que 'players' :
        // on ne les vide qu'à la déconnexion complète, pas en quittant une partie
        // (sinon les avatars disparaissent au retour au lobby — les hashes/emojis
        // ne sont re-reçus qu'une fois).
        S._playerAvatars = {}; S._playerImgAvatars = {};
        S._pthAvatarHashes = {}; S._pthAvatarsByHash = {}; S._pthAvatarReqIdToHash = {}; S._pthDataUrls = {};
        S.loaded  = false;
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
      // Admin transport switch (/app-config.internetTransport) : 'proxy' routes
      // the Internet mode through our proxy (session grace on wifi drops,
      // buffered reconnect) even when the target is pokerth.net itself.
      // 'direct' (default) keeps the historical hostname-based behavior.
      directWS = isPokerThDirect && targetIsPokerTH && (window._pthNetTransport !== 'proxy');
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
      // Diffusions admin : quand la socket de jeu ne passe pas par le proxy
      // (direct pokerth.net OU entraînement offline), ouvrir le canal
      // notify-only. En mode proxy la socket principale les reçoit déjà.
      // Repli d'URL en offline (champ proxy potentiellement vide) : le site
      // qui sert l'app héberge aussi le proxy → dériver de location.
      try {
        if (directWS || _off) {
          var _nBase = proxyUrl || ((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
          _openNotifyWS(_nBase, _off ? 'offline' : 'pthnet');
        } else {
          _closeNotifyWS();
        }
      } catch (e) {}
      try {
        var _rtb = document.getElementById('react-toggle-btn');
        if (_rtb) _rtb.style.display = '';
      } catch (e) {}

      // Sauvegarder les paramètres pour la reconnexion auto
      // Record this Init's identity so the NEXT connect() can compare
      // and apply the mode-swap delay if needed.
      S._lastInitMode = loginMode;
      S._lastInitNick = S.myName;
      S._lastInitTime = Date.now();
      S._lastConnectParams = { host, port, loginMode, finalUrl, myName: S.myName,
        pass: $('pass') ? $('pass').value : '' };
      S._reconnectAttempts = 0;
      S._intentionalDisconnect = false;
      S._wasAuthenticated = false;
      S._currentLoginMode = loginMode; // sauvegarder pour ChatReject
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
          S.ws = window.PokerOffline.createSocket({ nick: S.myName,
            botSkill: (function(){ try { return localStorage.getItem('pth_offline_skill') || 'mixed'; } catch (e) { return 'mixed'; } })(),
            // Pause entre les mains (parité QML PauseBetweenHands) : lue en
            // direct pour être basculable en cours de partie.
            pauseGate: function () { return _advGet('pause_hands', false); } });
        } catch (e) {
          setStatus('Offline init failed: ' + e.message, 'err');
          return;
        }
      } else {
        try {
          S.ws = new WebSocket(finalUrl);
        } catch (e) {
          setStatus(t('invalidUrl', { msg: e.message }), 'err');
          return;
        }
      }

      _beginConnecting();   // lock button for the whole attempt (anti IP-block)
      S.ws.binaryType = 'arraybuffer';
      S.ws.onopen    = () => { S._lastRxTime = Date.now(); setStatus(t('proxyConnectedWait')); try { window._pthCountConnect && window._pthCountConnect(directWS ? 'pokerthnet' : ((window._offlineMode || ($('server-mode') && $('server-mode').value === 'offline')) ? 'offline' : 'lan')); } catch (e) {} };
      S.ws.onerror   = () => { S._lastConnectFailed = true; _endConnecting(); setStatus(t('wsError'), 'err'); };
      S.ws.onmessage = function(e) {
        if (typeof e.data === 'string') {
          // Message texte = protocole proxy (réactions)
          if (_handleCtrlFrame(e.data)) return;
          // Jeton de sync des préférences (émis à l'InitAck d'un login authentifié)
          if (e.data.startsWith('SYNCTOK:')) {
            try { if (window._cfgSyncOnToken) window._cfgSyncOnToken(e.data.slice(8)); } catch (_e) {}
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
              if (imgPid && imgPid !== S.myId) {
                if (imgUrl && imgUrl.slice(0, 5) === 'data:') S._playerImgAvatars[imgPid] = imgUrl;
                else delete S._playerImgAvatars[imgPid]; // vide = effacer l'image
                if (typeof renderSeats === 'function' && S.seats.length) renderSeats();
              }
            }
            return;
          }
          if (e.data.startsWith('AVATAR:')) {
            var avParts = e.data.split(':');
            var avPid = parseInt(avParts[1]);
            var avEmoji = avParts[2] || '';
            if (avPid && avPid !== S.myId) {
              S._playerAvatars[avPid] = avEmoji;
              if (typeof renderSeats === 'function' && S.seats.length) renderSeats();
            }
            return;
          }
          if (e.data.startsWith('REACT:')) {
            var parts = e.data.split(':');
            var fromPid = parseInt(parts[1]);
            var reactEmoji = parts[2];
            if (fromPid !== S.myId) {
              handleIncomingReaction(fromPid, reactEmoji, 'react');
              // Pas d'affichage dans le chat — uniquement animation flottante
            }
          }
          return;
        }
        onRawData(e.data);
      };
      S.ws.onclose = function(e) {
        _endConnecting();   // free the connect button on any close
        S.ws = null;
        clearTimeout(window._reconnectTimer);
        clearInterval(window._reconnectCountdown);
        _hideBanner();

        // User asked to leave (clicked ✕ / disconnect): do NOT auto-reconnect.
        // Without this guard, ws.close() from disconnect() falls through to the
        // reconnect scheduler below and drops the user back into the lobby a few
        // seconds after they returned to the home screen.
        if (S._intentionalDisconnect) {
          _closeNotifyWS();
          return;
        }

        // Mémoriser la table pour réclamer le siège à la reconnexion (sinon on
        // se ferait renommer au pseudo « déjà pris »).
        _armRejoin();

        // --- RECONNEXION AUTO (limitée pour éviter le blocage IP) ---
        S._reconnectAttempts++;
        var maxAttempts = 3; // max 3 tentatives pour éviter le blocage IP
        if (S._reconnectAttempts > maxAttempts) {
          _hideBanner();
          S._wasAuthenticated = false;
          show('s-connect');
          setStatus(t('reconnFailed', { n: maxAttempts }), 'err');
          return;
        }
        // Délai croissant : 5s, 15s, 30s — assez long pour ne pas spammer
        var delay = [5000, 15000, 30000][S._reconnectAttempts - 1] || 30000;
        var secs = Math.round(delay/1000);
        _showBanner(t('reconnIn') + secs + 's… (' + S._reconnectAttempts + '/' + maxAttempts + ')');
        window._reconnectTimer = setTimeout(function() {
          if (S.ws) return; // déjà reconnecté
          _showBanner(t('reconnInProgress'));
          try {
            S.ws = new WebSocket(S._lastConnectParams.finalUrl);
            S.ws.binaryType = 'arraybuffer';
            S.ws.onopen = function() {
              _showBanner(t('reauthBanner'));
            };
            S.ws.onerror = function() {
              S.ws = null;
              // Déclencher onclose pour retenter
              var fakeClose = new Event('close');
              S.ws && S.ws.dispatchEvent(fakeClose);
            };
            S.ws.onmessage = function(e) {
              onRawData(e.data);
              // Si on reçoit des données, la connexion est OK
              if (S._reconnectAttempts > 0) {
                S._reconnectAttempts = 0;
                setTimeout(_hideBanner, 1500);
              }
            };
            S.ws.onclose = arguments.callee.caller || function(){};
            // Réutiliser le même handler onclose pour les tentatives suivantes
            S.ws.onclose = function() {
              S.ws = null;
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
      if (!S._lastConnectParams || S._intentionalDisconnect) return;
      S._reconnectAttempts++;
      var maxAttempts = 6;
      if (S._reconnectAttempts > maxAttempts) {
        _hideBanner();
        show('s-connect');
        setStatus(t('reconnFailed', { n: maxAttempts }), 'err');
        return;
      }
      // Exponentiel : 3s → 6s → 12s → 24s → 30s → 30s
      var delay = Math.min(3000 * Math.pow(2, S._reconnectAttempts - 1), 30000);
      var secsTotal = Math.round(delay / 1000);
      // Countdown live dans le banner
      clearInterval(window._reconnectCountdown);
      var secsLeft = secsTotal;
      function _updateBannerCountdown() {
        var pfx = t('reconnIn');
        var sfx = ' ('+S._reconnectAttempts+'/'+maxAttempts+')';
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
        if (S.ws) {
          S.ws.onclose = null; S.ws.onerror = null; S.ws.onmessage = null; S.ws.onopen = null;
          S.ws.close(4001, 'reload');
          S.ws = null;
        }
      } catch (e) {}
    },
    disconnect() {
      S._intentionalDisconnect = true;
      _closeNotifyWS();
      S._wasAuthenticated = false;
      S._lastConnectFailed = false; // déco propre → pas de rate limit
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
      S._reconnectAttempts = 0;
      if (S.ws) {
        // Detach handlers BEFORE closing: ws.close() triggers onclose
        // synchronously-ish, and we don't want the reconnect scheduler to run.
        S.ws.onclose = null;
        S.ws.onerror = null;
        S.ws.onmessage = null;
        S.ws.onopen = null;
        // Intentional disconnect → close with code 4001 so the proxy frees the
        // PokerTH player immediately (no 2-min reconnect grace → no zombie).
        try { S.ws.close(4001, 'user disconnect'); } catch (e) {}
        S.ws = null;
      }
      S.games = {};
      // Reset lobby counters so the next connect starts at 0 instead
      // of inheriting the previous session's tally.
      S._lobbyPlayerCount = 0;
      S._hasStatistics = false;
      S._lobbyPids.clear();
      S._pendingNameRequests.clear();
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
      if (!S.amGameAdmin) return; // double-check; button shouldn't be visible
      var modal = document.getElementById('kick-modal');
      var list  = document.getElementById('km-list');
      if (!modal || !list) return;
      // Build the list from seatData (covers both pre-game and in-game
      // phases; GamePlayerJoined writes here on first sight). Filter out
      // pids the server has marked as gone, just in case.
      var pids = Object.keys(S.seatData).map(function(s){ return parseInt(s,10); })
                       .filter(function(p){ return !S.seatData[p].gone; });
      // Sort: me first, then alphabetical by name.
      pids.sort(function(a, b) {
        if (a === S.myId && b !== S.myId) return -1;
        if (b === S.myId && a !== S.myId) return 1;
        var na = (S.players[a] || ('#' + a)).toLowerCase();
        var nb = (S.players[b] || ('#' + b)).toLowerCase();
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
      if (!pids.length) {
        list.innerHTML = '<div class="km-empty">— ' + t('kickNoPlayers') + ' —</div>';
      } else {
        var html = pids.map(function(pid) {
          var name = S.players[pid] || ('#' + pid);
          var sd   = S.seatData[pid] || {};
          var stack= (typeof sd.money === 'number') ? fmtChips(sd.money) : '';
          var isMe = (pid === S.myId);
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
      if (window._offlineMode || S._amSpectator || !S.gId) return;
      var modal = document.getElementById('invite-modal');
      var list  = document.getElementById('im-list');
      if (!modal || !list) return;
      S._invSent = {}; // fresh session
      App._renderInviteList(App._inviteEligiblePids());
      modal.style.display = 'flex';
    },
    _inviteEligiblePids() {
      var seated = {};
      Object.keys(S.seatData).forEach(function(s){ seated[parseInt(s,10)] = true; });
      var pids = [];
      S._lobbyPids.forEach(function(p){ if (p !== S.myId && !seated[p]) pids.push(p); });
      pids.sort(function(a,b){
        var na=(S.players[a]||('#'+a)).toLowerCase(), nb=(S.players[b]||('#'+b)).toLowerCase();
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
        var name = S.players[pid] || ('#' + pid);
        var avChip = (typeof window._avatarChipHtml === 'function')
          ? window._avatarChipHtml(pid, name, 'km-av')
          : '<span class="km-av letter">' + (name[0]||'?').toUpperCase() + '</span>';
        var escName = String(name).replace(/[<>&"]/g, function(c){
          return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];
        });
        var btn = S._invSent[pid]
          ? '<button class="im-invite" type="button" disabled style="opacity:.55;border:1px solid var(--border,#444);background:transparent;color:var(--text,#eff1f5);border-radius:8px;padding:6px 12px;font-weight:600">' + t('inviteSent') + '</button>'
          : '<button class="im-invite" type="button" onclick="App.sendInvite(' + pid + ')" style="border:1px solid var(--green,#3fae5a);background:transparent;color:var(--text,#eff1f5);border-radius:8px;padding:6px 12px;font-weight:600;cursor:pointer">' + t('inviteBtn') + '</button>';
        return '<div class="km-row">' +
                 avChip +
                 '<div class="km-info"><div class="km-name">' + escName + '</div></div>' +
                 btn +
               '</div>';
      }).join('');
    },
    inviteSentTo(pid) { return !!S._invSent[pid]; },
    sendInvite(pid) {
      if (window._offlineMode || !S.gId || pid === S.myId) return;
      try { send(MSG.buildInvitePlayer(S.gId, pid)); } catch(e) {}
      S._invSent[pid] = true;
      App._renderInviteList(App._inviteEligiblePids());
      if (typeof showToast === 'function') showToast(t('inviteSentToast', { name: S.players[pid] || ('#'+pid) }));
    },
    closeInviteModal() {
      var modal = document.getElementById('invite-modal');
      if (modal) modal.style.display = 'none';
    },
    // Step 2: ask confirmation before sending the kick.
    askConfirmKick(pid) {
      if (!S.amGameAdmin) return;
      var name = S.players[pid] || ('#' + pid);
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
      if (!pid || !S.amGameAdmin || !S.gId) {
        window._pendingKickPid = null;
        return;
      }
      var name = S.players[pid] || ('#' + pid);
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
      try { send(MSG.buildKickPlayer(S.gId, pid)); } catch(e) {}
      try { send(MSG.buildGameChat(S.gId, '/kick ' + name)); } catch(e) {}
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
          if (S.gId !== gameAtRequest) return;
          // Player still present means the kick was not honoured.
          if (S.seatData[targetPid] && !S.seatData[targetPid].gone) {
            addGameChat(null, '⚠ ' + t('kickNotProcessed', { name: targetName }), 'sys', { prefix: '⚠ ', key: 'kickNotProcessed', params: { name: targetName } });
          }
        }, 3000);
      })(pid, name, S.gId);
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
      if (S.ws && S.gId) { try { send(MSG.buildLeaveGame(S.gId)); } catch(e) {} }
      S._pendingRejoin = 0; S._rejoinNickRetries = 0;
      try { localStorage.removeItem('pth_resume'); } catch(e) {}
      S.amInGame = false; S.amGameAdmin = false; S._gameStarted = false; S._seatsFrozen = false; S._amSpectator = false;
      S.gId = 0; S.seats = []; S.seatData = {}; S._specPids = new Set(); updateSpectatorStrip();
      var _ego = document.getElementById('g-endgame-overlay');
      if (_ego) _ego.style.display = 'none';
      try { _wpHide(); } catch(e) {}
      S._selectedGame = null; try { renderGameInfoPanel(null); } catch(e) {}
      S.myCards = [null,null]; S.commCards = [];
      stopTurnTimer();
      dismissWinner();
      S._chatRejectShown = false;
      S._lastMsgWasReaction = false;
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
      S._modeSelBusy = !!on;
      clearTimeout(S._modeSelHoldTimer); S._modeSelHoldTimer = null;
      if (on) S._modeSelHoldTimer = setTimeout(function(){ S._modeSelBusy = false; _flushPreviewIfPending(); }, 8000);
      else _flushPreviewIfPending();
    },

    toggleActionPin() {
      S._actionBarPinned = !S._actionBarPinned;
      try { localStorage.setItem('pth_pin_actionbar', S._actionBarPinned ? '1' : '0'); } catch(e){}
      _updatePinBtn();
      // rafraichit immediatement l'UI hors-tour pour refleter le nouvel etat
      if (S.turnPid !== S.myId && S._gameStarted) renderGameWaiting(S._lastWaitingMsg, S._lastWaitingIsHtml);
    },

    setPlayingMode(idx) {
      var n = parseInt(idx, 10);
      if (!(n === 1 || n === 2)) n = 0;
      S._playingMode = n;
      var sel = document.getElementById('mode-sel');
      if (sel && sel.selectedIndex !== n) sel.selectedIndex = n;
      // Cadre or immédiat sur le dropdown quand un mode auto est actif (QML).
      try { var _msw = sel && sel.closest ? sel.closest('.mode-sel-wrap') : null; if (_msw) _msw.classList.toggle('mode-auto', n !== 0); } catch (e) {}
      if (n !== 0 && S.turnPid === S.myId) _playAutoMode();
    },

    // Ouvre/ferme le panneau "aperçu" en tapant ses cartes. Volontairement
    // sans effet à NOTRE tour (on ne change rien au fonctionnement actuel) ;
    // requiert une main en cours avec des cartes, hors mode spectateur.
    togglePreActionPanel() {
      if (S.turnPid === S.myId) return;                 // à notre tour : inchangé
      if (S._amSpectator || !S._gameStarted) return;
      if (S.myCards[0] == null && S.myCards[1] == null) return; // pas de cartes
      S._preActionOpen = !S._preActionOpen;
      if (S._preActionOpen) _renderPreActionPanel();
      else _closePreActionPanel();
    },

    // Arme / désarme une pré-action (Fold/Call/Raise/All-In) avant notre tour,
    // comme le client officiel. Reclic sur la même = désarmement. Le bouton armé
    // est surligné en or ; l'action s'exécute quand notre tour arrive.
    armPreAction(name) {
      if (S.turnPid === S.myId) { console.log('[prearm] clic ignoré (mon tour) name=' + name); return; }  // à notre tour : inchangé (les boutons agissent)
      console.log('[prearm] armPreAction turnPid=' + S.turnPid + ' myId=' + S.myId);
      if (S._amSpectator || !S._gameStarted) return;
      if (S.myCards[0] == null && S.myCards[1] == null) return; // pas de cartes
      S._preAction = (S._preAction === name) ? '' : name;      // toggle
      S._preActionToCall = Math.max(0, S.highestBet - ((S.seatData[S.myId] || {}).bet || 0)); // onCallAmountChanged : MON à-suivre
      console.log('[prearm] ' + (S._preAction ? 'armé' : 'désarmé') + ' name=' + name + ' toCallMémo=' + S._preActionToCall + ' highestBet=' + S.highestBet + ' maMise=' + (((S.seatData[S.myId] || {}).bet) || 0));
      renderMyTurnActions(true);                            // re-render pour le surlignage or
    },

    // Bascule rapide du mode depuis le panneau aperçu : Manuel <-> Auto Check/Fold.
    // (Conservé pour compat ; le dropdown du panneau pilote App.setPlayingMode.)
    togglePreAuto() {
      S._playingMode = (S._playingMode === 0) ? 2 : 0;
      if (S._preActionOpen) _renderPreActionPanel();
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
      S.amInGame = false; S.amGameAdmin = false; S._gameStarted = false;
      S._seatsFrozen = false; S._amSpectator = false;
      S.gId = 0; S.seats = []; S.seatData = {};
      try { stopTurnTimer(); } catch (e) {}
      try { dismissWinner(); } catch (e) {}
      try { if (typeof clearUnreadChat === 'function') clearUnreadChat(); } catch (e) {}
      document.body.classList.remove('in-game');
      [ 'admin-close-btn', 'admin-close-mob',
        'admin-start-btn', 'admin-start-mob',
        'admin-kick-btn', 'admin-kick-mob',
        'g-admin-badge', 'g-public-badge', 'g-endgame-overlay'
      ].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      try { _resetGameHeader(); } catch (e) {}
    },

    leaveGame() {
      // Annuler tout auto-retour programmé + masquer le dot de ping + Show
      try { clearTimeout(window._autoLeaveTimer); } catch (e) {}
      try { _setCanShow(false); } catch (e) {}
      try { _pingDotHide(); } catch (e) {}
      // Offline (vs bots) returns to the lobby just like online: the fake
      // server closes the current game (GameListUpdate=closed) on leave, so the
      // lobby ends up clean and the user can create another table.
      // Send proper leave request then stay connected (return to lobby)
      if (S.ws && S.gId) { try { send(MSG.buildLeaveGame(S.gId)); } catch(e) {} }
      // Départ volontaire : oublier le marqueur de reprise (sinon on serait
      // ré-aspiré dans la table à la prochaine reconnexion/réouverture).
      S._pendingRejoin = 0; S._rejoinNickRetries = 0;
      try { localStorage.removeItem('pth_resume'); } catch(e) {}
      S.amInGame = false; S.amGameAdmin = false; S._gameStarted = false; S._seatsFrozen = false; S._amSpectator = false;
      S.gId = 0; S.seats = []; S.seatData = {}; S._specPids = new Set(); updateSpectatorStrip();
      var _ego = document.getElementById('g-endgame-overlay');
      if (_ego) _ego.style.display = 'none';
      try { _wpHide(); } catch(e) {}
      S._selectedGame = null; try { renderGameInfoPanel(null); } catch(e) {}
      S.myCards = [null,null]; S.commCards = [];
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
      // Mode entraînement : retour direct à la page de création de partie
      // (le lobby offline n'a pas d'intérêt). Exception : le replay auto
      // (offlineReplay) recrée la table immédiatement après — on garde alors
      // le passage lobby pour ne pas ré-initialiser le formulaire
      // (openCreatePage ré-applique le preset persisté).
      if (window._offlineMode && !window._offlineAutoReplay) { this.openCreatePage(); return; }
      show('s-lobby');  // back to lobby, stay connected
    },

    sendReaction(emoji) {
      if (_reactMuted) return;                    // reactions coupees : on n'envoie rien
      if (!S.ws || !S.gId) return;
      // Affichage immediat pour moi.
      handleIncomingReaction(S.myId, emoji, 'self');
      // Canal rapide web<->web via le proxy (trame texte, contourne le throttle chat serveur).
      if (!directWS && S.ws.readyState === WebSocket.OPEN) {
        try { S.ws.send('REACT:' + S.myId + ':' + emoji); } catch (e) {}
      }
      // Canal partage cross-client : commande /emoji interpretee comme une reaction par
      // tous les clients (convention sp0ck, facon /me) -> interop web <-> Qt/QML (dont pokerth.net).
      // Régulé via une file (anti-flood chat serveur) : voir _queueReactEmoji.
      _queueReactEmoji(emoji);
      // Parité QML (ReactionPicker) : la fenêtre se ferme après la réaction,
      // sauf si elle est épinglée (📌 dans la barre de titre).
      try {
        var _rp = document.getElementById('g-reaction-panel');
        if (!_reactPinned && _rp && _rp.style.display !== 'none' && _rp.style.display !== '')
          toggleReactionPanel();
      } catch (e) {}
    },

    // Bascule le mute local des reactions (bouton barre dans le panneau).
    toggleReactionsMute() {
      _reactMuted = !_reactMuted;
      try { localStorage.setItem('pth_react_muted', _reactMuted ? '1' : '0'); } catch (e) {}
      _applyReactMuteUI();
    },

    // Épingle la fenêtre de réactions : épinglée = ne se ferme plus après
    // l'envoi d'une réaction (le défaut suit le QML : fermeture immédiate).
    toggleReactionsPin() {
      _reactPinned = !_reactPinned;
      try { localStorage.setItem('pth_react_pin', _reactPinned ? '1' : '0'); } catch (e) {}
      _applyReactPinUI();
    },

    sendGameChat() {
      var input = document.getElementById('g-chat-in');
      if (!input) return;
      var text = input.value.trim();
      if (!text || !S.ws) return;
      input.value = '';
      S._lastMsgWasReaction = false;
      // ── /seatdbg : diagnostic LOCAL des sieges (rien n'est envoye) ──
      // Affiche dans le chat les mesures qui pilotent la bisection QML :
      // zone (tableZone px), boxScale applique, rawBoxScale (avant rabot),
      // dims mesurees (w/h adversaire, sh self), fenetre et reserves. Sert
      // au debug iPhone (pas de console) : tailles de sieges, self-box.
      if (text === '/seatdbg') {
        try {
          var _d = window._seatDbg || {};
          var _ga = document.querySelector('.game-area');
          var _mz = document.querySelector('.my-zone');
          var _hd = document.querySelector('#s-game .header');
          var _zn = document.getElementById('g-table-zone');
          var _zr = _zn ? _zn.getBoundingClientRect() : null;
          var _ga2 = _ga ? _ga.getBoundingClientRect() : null;
          var _me = document.querySelector('#g-seats .seat.me');
          var _mer = _me ? _me.getBoundingClientRect() : null;
          var _zoomV = 1;
          try { if (typeof _getTableZoom === 'function') _zoomV = _getTableZoom(); } catch (eZ) {}
          var _info = {
            win: window.innerWidth + 'x' + window.innerHeight,
            zone: _d.zone || (_zr ? Math.round(_zr.width) + 'x' + Math.round(_zr.height) : '?'),
            zoneLive: _zr ? Math.round(_zr.width) + 'x' + Math.round(_zr.height) + '@y' + Math.round(_zr.top) : null,
            gaRect: _ga2 ? Math.round(_ga2.width) + 'x' + Math.round(_ga2.height) + '@y' + Math.round(_ga2.top) : null,
            zoom: +(+_zoomV).toFixed(3),
            selfRect: _mer ? Math.round(_mer.width) + 'x' + Math.round(_mer.height) + '@y' + Math.round(_mer.top) : null,
            boxScale: _d.boxScale != null ? +(+_d.boxScale).toFixed(3) : null,
            rawBoxScale: _d.rawBoxScale != null ? +(+_d.rawBoxScale).toFixed(3) : null,
            fitShave: +((window._seatFitShave || 1)).toFixed(3),
            dims: _d.dims || window._seatDimsMeasured || null,
            commScale: _d.commScale != null ? +(+_d.commScale).toFixed(3) : null,
            headerH: _hd ? _hd.offsetHeight : null,
            barH: _mz ? _mz.offsetHeight : null,
            gaPadB: _ga ? (_ga.style.paddingBottom || getComputedStyle(_ga).paddingBottom) : null,
            seat: document.documentElement.getAttribute('data-seat') || '',
            layout: document.documentElement.getAttribute('data-seat-layout') || 'auto',
            players: (typeof S.seats !== 'undefined' && S.seats) ? S.seats.length : 0
          };
          // cls 'mine' (et pas 'sys' : les messages systeme sont filtres
          // d'addGameChat) — affichage local uniquement, rien n'est envoye.
          addGameChat('seatdbg', JSON.stringify(_info), 'mine');
        } catch (eDbg) { try { addGameChat('seatdbg', 'erreur: ' + eDbg, 'mine'); } catch (e2) {} }
        return;
      }
      // ── Local diagnostic/setting commands (/help /diag /update …) — nothing
      // is sent to the server. See _chatLocalCmd and docs/DIAGNOSTIC.md.
      if (text.charAt(0) === '/' && _chatLocalCmd(text, function (n, s2) { addGameChat(n, s2, 'mine'); })) return;
      try { if (window._chatPushHist) window._chatPushHist(text); } catch (e) {}
      send(S.gId ? MSG.buildGameChat(S.gId, text) : MSG.buildChat(text));
      addGameChat(S.myName, text, 'mine');
    },
    // « Show » : envoie ShowMyCardsRequest (type 51, corps vide) pendant la
    // fenêtre d'attente ; la rediffusion AfterHandShowCards rendra les cartes.
    showMyCards() {
      if (!window._canShowCards || !S.ws || !S.gId) return;
      try { send(MSG.buildShowMyCards()); } catch (e) {}
      _setCanShow(false);
    },
    sendChat() {
      const input = $('chat-in');
      const text  = input.value.trim();
      if (!text || !S.ws) return;
      input.value = '';
      // ── Local diagnostic/setting commands (/help /diag /update …) — nothing
      // is sent to the server. See _chatLocalCmd and docs/DIAGNOSTIC.md.
      if (text.charAt(0) === '/' && _chatLocalCmd(text, function (n, s2) { addChat(n, s2, 'mine'); })) return;
      try { if (window._chatPushHist) window._chatPushHist(text); } catch (e) {}
      send(MSG.buildChat(text, 0));
      // Affichage optimiste
      addChat(S.myName, text, 'mine');
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
      if (!S.gId) {
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
               '&table=' + encodeURIComponent(S.gId);
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
      var g = S.games[gameId];
      if (!g) return;
      // Remember that we joined as spectator. Used by JoinGameAck to flip
      // the UI into 'watch only' mode (banner up top, action area replaced
      // with a message instead of fold/call buttons).
      S._amSpectator = true; updateSpectatorStrip();
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
      for (const id of Object.keys(S.games)) {
        const g = S.games[id];
        if (g && !g.started && g.players < g.maxPlayers) { target = id; break; }
      }
      if (target) {
        S.autoAction = true;
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
      S.autoAction = true;
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
      var _autoName = 'WebGame-' + S.myName + '-' + Math.random().toString(36).slice(2, 5);
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
      var g = S.games[gameId];
      var gName = g ? g.name : '#' + gameId;
      addChat(null, 'Joining "' + esc(gName) + '"...', 'sys');
      // JoinExistingGameMessage: gameId=1, password=2
      var msg = Proto.encode([[1,0,gameId],[2,2,pass||'']]);
      send(Proto.encode([[1,0,21],[22,2,msg]]));
    },
    // Clic sur une ligne de partie → sélection + panneau « Infos de partie »
    // (remplace l'ancienne liste dépliable sous la ligne).
    // Rejoindre la partie sélectionnée depuis le bouton du bas (parité QML).
    joinSelectedGame() {
      if (S._selectedGame == null || typeof S.games === 'undefined') return;
      var g = S.games[S._selectedGame];
      if (g && g.mode === 1) this.joinGame(S._selectedGame);
    },
    // Regarder (spectateur) la partie en cours sélectionnée depuis le bouton du bas.
    spectateSelectedGame() {
      if (S._selectedGame == null || typeof S.games === 'undefined') return;
      var g = S.games[S._selectedGame];
      if (g && g.mode === 2) this.spectateGame(S._selectedGame);
    },
    selectGame(gid) {
      S._selectedGame = gid;
      renderGameInfoPanel(gid);
      renderGames();  // surbrillance de la ligne sélectionnée
      if (window._lobby3OpenInfo) window._lobby3OpenInfo();  // slide-in en compact
    },
    // Conservé pour rétro-compat éventuelle ; délègue à la sélection.
    // Déplie/replie la liste des joueurs d'une table dans la liste (accordéon).
    toggleTablePlayers(gid) {
      var k = String(gid);
      if (S._openTables.has(k)) { S._openTables.delete(k); }
      else {
        S._openTables.add(k);
        var g = S.games[gid];
        if (g && g.seats) g.seats.forEach(function(pid){
          if (pid && !S.players[pid] && !S._pendingNameRequests.has(pid)) {
            S._pendingNameRequests.add(pid);
            try { send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e){}
          }
        });
      }
      renderGames();
    },

    // ── Signaler le nom de la partie (parité officielle) ──
    reportGameName(gid) {
      var g = S.games[gid]; if (!g) return;
      this._reportGid = gid;
      var msg = document.getElementById('rcm-msg');
      if (msg) msg.textContent = t('reportGameMsg', { name: g.name || ('#' + gid) });
      var modal = document.getElementById('report-confirm-modal');
      if (modal) modal.style.display = 'flex';
    },
    cancelReportGame() {
      var modal = document.getElementById('report-confirm-modal');
      if (modal) modal.style.display = 'none';
      this._reportGid = null;
    },
    doReportGame() {
      var gid = this._reportGid;
      this.cancelReportGame();
      if (gid == null) return;
      // Envoi réel du ReportGameMessage (type 71) : le serveur crée une
      // entrée de modération (créateur + nom de table) et répond par un
      // ReportGameAck (accepté / déjà signalé / erreur) → toast ci-dessous.
      try {
        var _rg = Proto.encode([[1, 0, 71], [72, 2, Proto.encode([[1, 0, gid >>> 0]])]]);
        send(_rg);
      } catch(e) {}
      var btn = document.querySelector('#lobby-gameinfo .lgi-report');
      if (btn) { var o = btn.textContent; btn.textContent = '✅'; setTimeout(function(){ btn.textContent = o; }, 1800); }
    },
    joinGame(gameId) {
      const g = S.games[gameId];
      if (!g) return;
      if (g.mode === 3) { addChat(null, 'Table closed.', 'sys'); return; }
      if (_guestJoinBlocked(g)) { setStatus(t('guestJoinBlocked') || 'Guests can only join normal games.', 'err'); return; }
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
      var n = parseInt(f, 10); if (isNaN(n) || n < 0 || n > 5) n = 0;
      S._tableFilter = String(n);
      try { localStorage.setItem('pth_table_filter', S._tableFilter); } catch(e) {}
      renderGames();
    },
    dismissWinner() { dismissWinner(); },
    // Un clic MANUEL sur un bouton d'action (ou son raccourci clavier, qui
    // passe par btn.click()) repasse le mode a Manuel, comme le client
    // officiel (QML/Qt-Widgets, bible §5.2 ; demande sp0ck 2026-07-17).
    // Le mode auto (_playAutoMode) et la pre-action appellent le doAction
    // INTERNE et ne repassent donc pas le mode.
    doAction(action, bet) { if (S._playingMode !== 0) this.setPlayingMode(0); doAction(action, bet); },
    confirmCall(action, amount) { if (S._playingMode !== 0) this.setPlayingMode(0); confirmCall(action, amount); },
    doRaise() { if (S._playingMode !== 0) this.setPlayingMode(0); doRaise(); },

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
      var mode = S._currentLoginMode || 'unauth';
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
      // Mode entraînement : défauts du jeu LOCAL officiel (configfile.cpp
      // qt6-qml : StartCash 5000, GameSpeed 4, hausse toutes les 8 mains,
      // NetTimeOutPlayerAction 20). Aligné QML v0.3.686 (demande Arnaud).
      if (window._offlineMode) {
        var baseOffline = {
          name: _defaultNameForMode(),
          players: 10,
          blind: 10,
          stack: 5000,
          timeout: 20,
          raiseEvery: 8,
          guiSpeed: 4,
          delayHands: 7,
          bots: true,
          minHumans: 2,
          tag: 'offline',
        };
        return skipSaved ? withAdmin(baseOffline) : withSaved(withAdmin(baseOffline));
      }
      if (isPublic) {
        // Defaults for pokerth.net (guest + registered) — alignés 1:1 sur le
        // client QML (configfile.cpp : NetStartCash 3000, NetFirstSmallBlind
        // 10, NetRaiseSmallBlindEveryHands 8, NetTimeOutPlayerAction 20,
        // NetDelayBetweenHands 7). Les anciens timeouts courts (5 s public /
        // 15 s LAN) sont remplacés par le défaut officiel 20 s (v0.3.686).
        var basePublic = {
          name: _defaultNameForMode(),
          players: 10,
          blind: 10,
          stack: 3000,
          timeout: 20,
          raiseEvery: 8,
          guiSpeed: 4,
          delayHands: 7,
          bots: false,
          minHumans: 5,
          tag: 'public', // for the QuickGame dialog
        };
        return skipSaved ? withAdmin(basePublic) : withSaved(withAdmin(basePublic));
      }
      // LAN / private-server profile (covers both the 'lan' login mode
      // and the 'unauth' private-server-guest mode). Défauts réseau QML
      // officiels (3000 / SB 10 / hausse 8 mains / 20 s / délai 7).
      // Bots default ON so a small group can start a hand fast.
      var baseLan = {
        name: _defaultNameForMode(),
        players: 10,
        blind: 10,
        stack: 3000,
        timeout: 20,
        raiseEvery: 8,
        guiSpeed: 4,
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
      // Ordre manuel des blindes : restaurer liste + flag, puis resynchroniser
      // toute l'UI (radios auto/manuel, pastilles, radios « Ensuite »).
      if (d.manualBlinds  != null) set('cf-manual-blinds', d.manualBlinds);
      this._syncBlindsOrderUI(d.manualOrder != null ? !!d.manualOrder : null);
      if (d.gameType      != null) set('cf-game-type',    d.gameType);
      if (d.allowSpectators != null) {
        var asEl = document.getElementById('cf-allow-spectators');
        if (asEl) {
          if (asEl.type === 'checkbox') asEl.checked = !!d.allowSpectators;
          else asEl.value = d.allowSpectators ? '1' : '0';
        }
      }
      // Bornes QML : re-clampe les valeurs restaurées depuis une sauvegarde
      // antérieure aux nouvelles bornes (ex. délai 3 < min 5).
      var _dl = document.getElementById('cf-delay'); if (_dl) this.clampNum(_dl);
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
      // Conservé pour compat (intent PWA ?go=create) : ouvre la page dédiée.
      this.openCreatePage();
    },
    // Ouvre l'écran dédié « Créer une partie ». Le formulaire existant
    // (#create-form, tous ses champs/handlers) est déplacé une seule fois dans
    // la page, ce qui préserve toute la logique de createGame().
    openCreatePage() {
      // Parité officielle ShowGameSettingsDialogOnNewGame (startwindowimpl.cpp,
      // callNewGameDialog) : en mode entraînement, si l'option « afficher les
      // réglages à chaque nouvelle partie » est décochée, on saute l'écran de
      // création et on démarre immédiatement avec les derniers réglages
      // sauvegardés (« sonst mit gespeicherten Werten starten »), bots inclus
      // via le hook _offlineAutoReplay → startWithBots() au JoinGameAck.
      if (window._offlineMode && !_advGet('create_dialog', true)) {
        try {
          this._applyCreateFormDefaults(true);   // baseline + derniers réglages utilisés
          window._offlineAutoReplay = true;
          this.createGame();
          return;
        } catch (e) { window._offlineAutoReplay = false; }
      }
      var form = document.getElementById('create-form');
      var body = document.getElementById('create-page-body');
      if (form && body && form.parentNode !== body) body.appendChild(form);
      if (form) { form.style.display = 'block'; form.classList.add('open'); }
      this._rankSnap = null;      // jamais de restauration trans-session
      this._vorlageSnap = null;   // idem pour le modèle communautaire (non persisté, comme le QML)
      try { var _vs = document.getElementById('cf-vorlage'); if (_vs) _vs.value = '0'; } catch (e) {}
      try { this._applyCreateFormDefaults(false); } catch (e) {}
      // Pastille « Perso » (charger mes préférences) : visible seulement si
      // des préférences existent pour le MODE COURANT (pastille 💾 ou Options
      // avancées), avec l'ancien pth_create_prefs en repli.
      try { var _pp = document.getElementById('cf-preset-perso'); if (_pp) _pp.style.display = this.hasCreatePrefs() ? '' : 'none'; } catch (e) {}
      // Bloc « Style de partie » : replie par defaut, etat memorise.
      try { this.toggleStyleGrid(localStorage.getItem('pth_create_style_open') === '1'); } catch (e) {}
      // Mode entraînement : le style de partie mémorisé (« normal » par
      // défaut) est présélectionné à l'ouverture — valeurs ET surbrillance,
      // comme le niveau de bots (mixte) juste au-dessus.
      try {
        if (window._offlineMode) {
          var _st = 'normal';
          try { _st = localStorage.getItem('pth_create_style') || 'normal'; } catch (e) {}
          if (!/^(tranquille|normal|rapide|ranking|wecup|bbc)$/.test(_st)) _st = 'normal';
          this.applyPreset(_st);
        }
      } catch (e) {}
      // Invité pokerth.net : seule la création de parties « Normal » est
      // permise par le serveur — type forcé à 1, ligne visible mais
      // désactivée (parité QML enabled: !isGuest), nom imposé par
      // _syncGameTypeConstraints. Les verrous classé/mot de passe sont
      // resynchronisés dans la foulée.
      try {
        var _gtr = document.getElementById('cf-gtype-row');
        if (_gtr) _gtr.style.display = '';
        if (S._currentLoginMode === 'guest') { var _gts = document.getElementById('cf-game-type'); if (_gts) _gts.value = '1'; }
        if (window._gtypeDdRefresh) window._gtypeDdRefresh();
        this._syncGameTypeConstraints();
      } catch (e) {}
      show('s-create');
    },
    closeCreatePage() {
      // Mode entraînement : la page de création EST l'écran d'accueil après
      // connexion (pas de lobby offline) → Annuler/Retour ramène au login
      // via la déconnexion propre existante (teardown du FakeServer inclus).
      if (window._offlineMode) { this.disconnect(); return; }
      show('s-lobby');
    },
    // Développer / réduire les pastilles de style de partie (la barre « Perso »
    // reste toujours visible). État persisté ; replié par défaut.
    toggleStyleGrid(force) {
      var g = document.getElementById('cf-style-grid'), b = document.getElementById('cf-style-toggle');
      if (!g) return;
      var open = (force != null) ? !!force : (g.style.display === 'none');
      g.style.display = open ? '' : 'none';
      if (b) {
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        var tx = b.querySelector('.cfs-tx');
        if (tx) { tx.setAttribute('data-i18n', open ? 'styleCollapse' : 'styleExpand'); tx.textContent = t(open ? 'styleCollapse' : 'styleExpand'); }
        var ar = b.querySelector('.cfs-arr');
        if (ar) ar.textContent = open ? '\u25b4' : '\u25be';
      }
      try { localStorage.setItem('pth_create_style_open', open ? '1' : '0'); } catch (e) {}
    },
    // Stepper +/- (page « Créer une partie ») : incrémente/décrémente un champ
    // numérique selon son step/min/max. Réutilise les IDs existants.
    stepField(id, dir) {
      var el = document.getElementById(id); if (!el) return;
      var step = parseInt(el.step, 10) || 1;
      var min = (el.min !== '' && el.min != null) ? parseInt(el.min, 10) : -Infinity;
      var max = (el.max !== '' && el.max != null) ? parseInt(el.max, 10) :  Infinity;
      var v = (parseInt(el.value, 10) || 0) + dir * step;
      v = Math.max(min, Math.min(max, v));
      el.value = v;
    },
    // Intervalle de hausse des blindes : le radio mains/minutes pilote le champ
    // caché cf-raise-mode (1 = mains, 2 = minutes) lu par createGame().
    setRaiseMode(n) {
      var el = document.getElementById('cf-raise-mode'); if (el) el.value = n;
    },
    // ── Ordre manuel des blindes (parité QML LocalGameSettings/NetworkGameSettings) ──
    // La liste vit dans le champ caché cf-manual-blinds (CSV trié croissant) : c'est
    // la source lue par createGame(), _readCreateForm() et le rendu des pastilles.
    // Sémantique officielle (netpacket.cpp) : mode manuel = liste non vide dans
    // NetGameInfo champ 14 ; « Ensuite » (cf-end-raise 1/2/3) = APRÈS épuisement.
    _getManualBlinds() {
      var el = document.getElementById('cf-manual-blinds');
      if (!el || !el.value) return [];
      return el.value.split(',').map(function(s){ return parseInt(s, 10); })
        .filter(function(n){ return !isNaN(n) && n > 0; });
    },
    _setManualBlinds(arr) {
      arr = (arr || []).filter(function(n){ return Number.isInteger(n) && n > 0; });
      arr.sort(function(a, b){ return a - b; });
      // Dédoublonnage (le QML refuse les doublons dans addBlind)
      arr = arr.filter(function(n, i){ return arr.indexOf(n) === i; });
      var el = document.getElementById('cf-manual-blinds');
      if (el) el.value = arr.join(',');
      this._renderManualBlinds();
      return arr;
    },
    _renderManualBlinds() {
      var box = document.getElementById('cf-mb-list'); if (!box) return;
      var list = this._getManualBlinds();
      var h = '';
      for (var i = 0; i < list.length; i++) {
        h += '<button type="button" class="cf-preset" title="' + (t('blindsRemoveTip') || 'Remove') + '"'
           + ' onclick="App.removeManualBlind(' + list[i] + ')">'
           + '<span class="cfp-n">$' + list[i] + ' \u00d7</span></button>';
      }
      box.innerHTML = h;
      box.style.display = list.length ? '' : 'none';
    },
    setManualBlindsMode(on) {
      var ed = document.getElementById('cf-mb-editor');
      if (ed) ed.style.display = on ? '' : 'none';
      var r = document.getElementById(on ? 'cf-mb1' : 'cf-mb0'); if (r) r.checked = true;
      if (on) this._renderManualBlinds();
    },
    addManualBlind() {
      var inp = document.getElementById('cf-mb-val');
      var v = inp ? parseInt(inp.value, 10) : NaN;
      if (isNaN(v) || v <= 0) return;
      var list = this._getManualBlinds();
      list.push(v);
      list = this._setManualBlinds(list);
      // Confort : pré-remplir la prochaine valeur (double de la dernière),
      // comme point de départ raisonnable pour une structure de tournoi.
      if (inp && list.length) inp.value = Math.min(9999999, list[list.length - 1] * 2);
    },
    removeManualBlind(v) {
      this._setManualBlinds(this._getManualBlinds().filter(function(n){ return n !== v; }));
    },
    // « Ensuite : » — pilote le champ caché cf-end-raise (endRaiseMode 1/2/3,
    // NetGameInfo champ 7) ; le stepper de valeur n'apparaît qu'en mode 2.
    setAfterMB(mode) {
      var el = document.getElementById('cf-end-raise'); if (el) el.value = String(mode);
      var st = document.getElementById('cf-amb2-step'); if (st) st.style.display = (mode === 2) ? '' : 'none';
      var r = document.getElementById('cf-amb' + mode); if (r) r.checked = true;
    },
    // Resynchronise l'UI « ordre des blindes » depuis les champs cachés
    // (cf-manual-blinds, cf-end-raise) après une écriture programmatique
    // (defaults, préférences, reset). manualOn : true/false = imposé,
    // null = déduit (mode manuel si le radio l'était déjà OU liste non vide).
    _syncBlindsOrderUI(manualOn) {
      if (manualOn == null) {
        var r1 = document.getElementById('cf-mb1');
        manualOn = (r1 && r1.checked) || this._getManualBlinds().length > 0;
      }
      this.setManualBlindsMode(!!manualOn);
      var m = parseInt((document.getElementById('cf-end-raise') || {}).value, 10);
      this.setAfterMB(m >= 1 && m <= 3 ? m : 1);
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

    // ── Vorlagen communautaires (parité QML communityPresets, verbatim) ──
    // Réglages officiels des tournois pokerth.net. Visibles seulement pour
    // « Joueurs invités uniquement » ; remplissent ET verrouillent le
    // formulaire — SAUF le nom : pré-rempli mais éditable (suffixe d'heure
    // possible, ex. « BBC Step 1 23:15 ») ; « Paramètres personnalisés »
    // restaure les valeurs d'avant. Les BBC Steps imposent une liste fixe de 30 paliers
    // de blinds (hausse au temps, toutes les 5 min) ; MC/WEC doublent après
    // N mains. delayBetweenHands = 7 pour toutes (comme le QML).
    _communityVorlagen: [
      { name: 'BBC Step 1', startCash: 3000, firstSmallBlind: 15,
        raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
        blinds: [20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500,
                 600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000,
                 10000, 12000, 15000] },
      { name: 'BBC Step 2', startCash: 4000, firstSmallBlind: 20,
        raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
        blinds: [25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600,
                 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000,
                 12000, 15000, 20000] },
      { name: 'BBC Step 3', startCash: 5000, firstSmallBlind: 25,
        raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
        blinds: [30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800,
                 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000,
                 12000, 15000, 20000, 25000] },
      { name: 'BBC Step 4', startCash: 10000, firstSmallBlind: 50,
        raiseOnHands: false, raiseEveryHands: 11, raiseEveryMinutes: 5, playerActionTimeout: 10,
        blinds: [60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200,
                 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000,
                 20000, 25000, 30000, 40000, 50000] },
      { name: 'Monthly Cup', startCash: 10000, firstSmallBlind: 50,
        raiseOnHands: true, raiseEveryHands: 16, raiseEveryMinutes: 5, playerActionTimeout: 10,
        blinds: [] },
      { name: 'Monthly Cup Final', startCash: 10000, firstSmallBlind: 50,
        raiseOnHands: true, raiseEveryHands: 22, raiseEveryMinutes: 5, playerActionTimeout: 12,
        blinds: [] },
      { name: 'WEC', startCash: 10000, firstSmallBlind: 50,
        raiseOnHands: true, raiseEveryHands: 22, raiseEveryMinutes: 5, playerActionTimeout: 12,
        blinds: [] },
      { name: 'WEC Grand Final', startCash: 10000, firstSmallBlind: 50,
        raiseOnHands: true, raiseEveryHands: 35, raiseEveryMinutes: 5, playerActionTimeout: 25,
        blinds: [] }
    ],
    // Handler du combo « Modèle communautaire ». idx 0 = Paramètres
    // personnalisés (restauration) ; 1..8 = vorlage (remplit + verrouille).
    applyVorlage() {
      var g = function(id){ return document.getElementById(id); };
      var sel = g('cf-vorlage'); if (!sel) return;
      var idx = parseInt(sel.value, 10) || 0;
      var setv = function(id, v){ var e = g(id); if (e) { e.value = v; e.dispatchEvent(new Event('input')); } };
      if (idx <= 0 || !this._communityVorlagen[idx - 1]) {
        this._restoreVorlage();
        this._syncGameTypeConstraints();
        return;
      }
      // Snapshot des valeurs d'avant la première vorlage (une seule fois,
      // comme le verrou classé) — restauré par « Paramètres personnalisés »
      // ou en quittant le type invitation.
      if (!this._vorlageSnap) {
        this._vorlageSnap = {
          name:       g('cf-name')        ? g('cf-name').value        : '',
          players:    g('cf-players')     ? g('cf-players').value     : 10,
          stack:      g('cf-stack')       ? g('cf-stack').value       : 3000,
          blind:      g('cf-blind')       ? g('cf-blind').value       : 10,
          raiseEvery: g('cf-raise-every') ? g('cf-raise-every').value : 8,
          raiseMode:  (g('cf-rm2') && g('cf-rm2').checked) ? 2 : 1,
          timeout:    g('cf-timeout')     ? g('cf-timeout').value     : 20,
          delay:      g('cf-delay')       ? g('cf-delay').value       : 7,
          manual:     !!(g('cf-mb1') && g('cf-mb1').checked),
          manualStr:  g('cf-manual-blinds') ? g('cf-manual-blinds').value : ''
        };
      }
      var p = this._communityVorlagen[idx - 1];
      var nm = g('cf-name'); if (nm) nm.value = p.name;
      var ne = g('cf-name-err'); if (ne) ne.style.display = 'none';
      setv('cf-players', 10);
      setv('cf-stack',   p.startCash);
      setv('cf-blind',   p.firstSmallBlind);
      var rmode = p.raiseOnHands ? 1 : 2;
      this.setRaiseMode(rmode);
      var rr = g(rmode === 2 ? 'cf-rm2' : 'cf-rm1'); if (rr) rr.checked = true;
      setv('cf-raise-every', p.raiseOnHands ? p.raiseEveryHands : p.raiseEveryMinutes);
      setv('cf-timeout', p.playerActionTimeout);
      setv('cf-delay',   7);   // toutes les vorlagen : DelayBetweenHands = 7
      if (p.blinds.length) {
        this._setManualBlinds(p.blinds.slice());
        this.setManualBlindsMode(true);
      } else {
        setv('cf-manual-blinds', '');
        this.setManualBlindsMode(false);
        this._renderManualBlinds();
      }
      this._syncGameTypeConstraints();
    },
    // Restauration des valeurs d'avant vorlage (sans resynchroniser — les
    // appelants s'en chargent pour éviter toute récursion).
    _restoreVorlage() {
      if (!this._vorlageSnap) return;
      var g = function(id){ return document.getElementById(id); };
      var setv = function(id, v){ var e = g(id); if (e) { e.value = v; e.dispatchEvent(new Event('input')); } };
      var snap = this._vorlageSnap; this._vorlageSnap = null;
      var nm = g('cf-name'); if (nm) nm.value = snap.name;
      setv('cf-players', snap.players); setv('cf-stack', snap.stack);
      setv('cf-blind', snap.blind); setv('cf-raise-every', snap.raiseEvery);
      this.setRaiseMode(snap.raiseMode);
      var rr = g(snap.raiseMode === 2 ? 'cf-rm2' : 'cf-rm1'); if (rr) rr.checked = true;
      setv('cf-timeout', snap.timeout); setv('cf-delay', snap.delay);
      setv('cf-manual-blinds', snap.manualStr);
      this.setManualBlindsMode(snap.manual);
      this._renderManualBlinds();
    },
    // ── Parité QML LobbyCreateGamePage (2.1.3) : contraintes selon le type ──
    // passwordAllowed = Normal/Enregistrés seulement ; « Partie classée »
    // verrouille et force les constantes serveur (RANKING_GAME_*) ; invité =
    // nom imposé « Partie de %1 » + type figé (ligne visible mais désactivée,
    // comme le QML). Le mécanisme de sauvegarde (pastilles de style, 💾,
    // réinitialisation) n'est PAS modifié : le verrou n'agit que tant que le
    // type classé est sélectionné, avec restauration des valeurs à la sortie.
    _syncGameTypeConstraints() {
      var g = function(id){ return document.getElementById(id); };
      var sel = g('cf-game-type'); if (!sel) return;
      var isGuest = (S._currentLoginMode === 'guest');
      var type = parseInt(sel.value, 10) || 1;
      var isRanking = (type === 4);
      var isInvite  = (type === 3);
      var pwAllowed = (type === 1 || type === 2);
      // Modèle communautaire : visible seulement en invitation (parité QML) ;
      // quitter le type invitation remet la vorlage à zéro et restaure.
      var vSel = g('cf-vorlage');
      var vRow = g('cf-vorlage-row');
      var communityOn = _advGet('community_content', true);
      if (vRow) vRow.style.display = (isInvite && communityOn) ? '' : 'none';
      if (vSel && (!isInvite || !communityOn) && (parseInt(vSel.value, 10) || 0) > 0) {
        vSel.value = '0';
        this._restoreVorlage();
      }
      var vorlageActive = !!(isInvite && communityOn && vSel && (parseInt(vSel.value, 10) || 0) > 0);
      // fieldsLocked (parité QML) : classé OU vorlage active.
      var fieldsLocked = isRanking || vorlageActive;
      var lockRow = function(id, lock) {
        var el = g(id); if (!el) return;
        var row = el.closest('.cf-row') || el.parentNode;
        if (row) row.classList.toggle('cf-locked', !!lock);
        if ('disabled' in el) el.disabled = !!lock;
      };
      // Mot de passe : interdit en classé (serveur) et en invitation (accès
      // via l'invitation) — décoché automatiquement, comme applyGameType().
      var pwT = g('cf-use-password');
      if (pwT) {
        if (!pwAllowed && pwT.checked) pwT.checked = false;
        lockRow('cf-use-password', !pwAllowed);
        var pwRow = g('cf-password-row');
        if (pwRow) pwRow.style.display = (pwAllowed && pwT.checked) ? 'flex' : 'none';
      }
      // Invité : nom imposé (nom admin du mode s'il existe, sinon la
      // convention QML « %1's game ») + champ nom et choix du type désactivés.
      var nameEl = g('cf-name');
      if (nameEl) {
        // Vorlage : le nom est PRÉ-REMPLI (applyVorlage) mais reste ÉDITABLE —
        // divergence assumée vs QML (qui verrouille) : on veut pouvoir suffixer
        // « BBC Step 1 » en « BBC Step 1 23:15 » (demande narmod 2026-07-17).
        nameEl.disabled = isGuest;
        if (isGuest) {
          var tpl = (typeof t === 'function' && t('guestGameName') !== 'guestGameName')
            ? t('guestGameName') : "{name}'s game";
          nameEl.value = _adminNameForMode() || tpl.replace('{name}', S.myName || 'PokerTH');
        }
      }
      var ddBtn = g('cf-gtype-btn'); if (ddBtn) ddBtn.disabled = isGuest;
      // Classé : snapshot des valeurs courantes puis forçage des constantes
      // serveur ; restauration à la sortie du type classé.
      var setv = function(id, v){ var e = g(id); if (e) { e.value = v; e.dispatchEvent(new Event('input')); } };
      if (isRanking && !this._rankSnap) {
        this._rankSnap = {
          players:    g('cf-players')     ? g('cf-players').value     : 10,
          stack:      g('cf-stack')       ? g('cf-stack').value       : 3000,
          blind:      g('cf-blind')       ? g('cf-blind').value       : 10,
          raiseEvery: g('cf-raise-every') ? g('cf-raise-every').value : 8,
          raiseMode:  (g('cf-rm2') && g('cf-rm2').checked) ? 2 : 1,
          spect:      g('cf-allow-spectators') ? g('cf-allow-spectators').checked : true,
          manual:     !!(g('cf-mb1') && g('cf-mb1').checked)
        };
        setv('cf-players', 10); setv('cf-stack', 10000); setv('cf-blind', 50); setv('cf-raise-every', 11);
        this.setRaiseMode(1); var r1 = g('cf-rm1'); if (r1) r1.checked = true;
        var sp = g('cf-allow-spectators'); if (sp) sp.checked = true;
        var mb0 = g('cf-mb0'); if (mb0) mb0.checked = true;
        this.setManualBlindsMode(false);
      } else if (!isRanking && this._rankSnap) {
        var snap = this._rankSnap; this._rankSnap = null;
        setv('cf-players', snap.players); setv('cf-stack', snap.stack);
        setv('cf-blind', snap.blind); setv('cf-raise-every', snap.raiseEvery);
        this.setRaiseMode(snap.raiseMode);
        var rr = g(snap.raiseMode === 2 ? 'cf-rm2' : 'cf-rm1'); if (rr) rr.checked = true;
        var sp2 = g('cf-allow-spectators'); if (sp2) sp2.checked = snap.spect;
        var mbr = g(snap.manual ? 'cf-mb1' : 'cf-mb0'); if (mbr) mbr.checked = true;
        this.setManualBlindsMode(snap.manual);
      }
      ['cf-players','cf-stack','cf-blind'].forEach(function(id){ lockRow(id, fieldsLocked); });
      // Spectateurs : verrouillés par le classé seulement (QML enabled: !isRanking).
      lockRow('cf-allow-spectators', isRanking);
      var rm1 = g('cf-rm1');
      if (rm1) { var rmRow = rm1.closest('.cf-row-col'); if (rmRow) rmRow.classList.toggle('cf-locked', fieldsLocked); }
      var mb0b = g('cf-mb0');
      if (mb0b) { var mbRow = mb0b.closest('.cf-row-col'); if (mbRow) mbRow.classList.toggle('cf-locked', fieldsLocked); }
      // Timeout et délai entre mains : imposés par la vorlage seulement
      // (QML enabled: !presetActive — le classé les laisse libres).
      lockRow('cf-timeout', vorlageActive);
      lockRow('cf-delay',   vorlageActive);
      // Pastilles de STYLE (data-preset, « Perso » inclus) : inertes tant que
      // le classé ou une vorlage force les valeurs — les pastilles de bots
      // (data-skill) et les chips de blinds ne sont pas concernées.
      var pills = document.querySelectorAll('.cf-preset[data-preset]');
      for (var i = 0; i < pills.length; i++) {
        pills[i].disabled = fieldsLocked;
        pills[i].classList.toggle('cf-locked', fieldsLocked);
      }
    },
    applyPreset(name, btn) {
      // Rythme seulement : les styles ne touchent pas au nombre de joueurs
      // (choix indépendant du tempo, demande d'Arnaud v0.3.515).
      // Structures alignées sur les formats réellement joués (v0.3.516) :
      //   Tranquille = deepstack lent (250 BB, blindes qui montent peu)
      //   Normal     = défauts du client PokerTH desktop (150 BB, hausse/8 mains)
      //   Rapide     = turbo (30 BB, blindes rapides, timer court)
      // raiseEvery est en MAINS : le preset rebascule l'intervalle sur « mains ».
      // Formats pokerth.net alignés sur la source QML 2.1.3 (v0.3.685) —
      // vorlagen communityPresets extraites de LobbyCreateGamePage :
      //   Ranking = constantes serveur des parties classées (10k / SB 50 /
      //             double toutes les 11 mains) + 5 s — hyper-turbo assumé.
      //   WeCup   = format WEC officiel (double/22 mains, 12 s, délai 7 s).
      //   BBC     = BBC Step 3 officiel (5000 / SB 25, hausse AU TEMPS
      //             toutes les 5 min, 10 s, délai 7 s).
      // raiseMode : 1 = mains (défaut), 2 = minutes.
      var P = {
        tranquille: { stack:5000,  blind:10, timeout:30, raiseEvery:15, delay:10 },
        normal:     { stack:3000,  blind:10, timeout:20, raiseEvery:8,  delay:7  },
        rapide:     { stack:1500,  blind:25, timeout:7,  raiseEvery:4,  delay:5  },   // délai min 5 (borne QML 5–20)
        ranking:    { stack:10000, blind:50, timeout:5,  raiseEvery:11, delay:5  },
        wecup:      { stack:10000, blind:50, timeout:12, raiseEvery:22, delay:7  },
        bbc:        { stack:5000,  blind:25, timeout:10, raiseEvery:5,  delay:7, raiseMode:2 }
      };
      var v = P[name];
      if (!v) return;
      var set = function(id, val){ var e = document.getElementById(id); if (e) { e.value = val; e.dispatchEvent(new Event('input')); } };
      set('cf-stack',       v.stack);
      set('cf-blind',       v.blind);
      set('cf-timeout',     v.timeout);
      set('cf-raise-every', v.raiseEvery);
      set('cf-delay',       v.delay);
      // Cohérence : chaque preset fixe aussi l'unité de hausse (mains par
      // défaut, minutes pour BBC) → champ caché + radio.
      var rmode = v.raiseMode || 1;
      this.setRaiseMode(rmode);
      var rmEl = document.getElementById(rmode === 2 ? 'cf-rm2' : 'cf-rm1'); if (rmEl) rmEl.checked = true;
      // Seules les pastilles de STYLE (data-preset) sont concernées — surtout
      // pas celles de difficulté des bots (data-skill), sinon leur
      // présélection disparaît à chaque choix de style.
      var all = document.querySelectorAll('.cf-preset[data-preset]');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      var sel = btn || document.querySelector('.cf-preset[data-preset="' + name + '"]');
      if (sel) sel.classList.add('active');
      // Mémoriser le dernier style choisi (présélectionné à la prochaine
      // ouverture en mode entraînement ; « normal » par défaut).
      try { localStorage.setItem('pth_create_style', name); } catch (e) {}
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
    // ── Préférences personnelles de création, PAR MODE depuis la passe G :
    //    trois emplacements pth_prefs_local / pth_prefs_lan / pth_prefs_internet
    //    (parité QML LocalGameSettings / NetworkGameSettings / InternetGameSettings),
    //    également éditables champ par champ dans les Options avancées.
    //    saveCreatePrefs (pastille 💾) fige TOUT le formulaire dans l'emplacement
    //    du mode courant ; applyCreatePrefs (pastille ⭐ Perso) le réinjecte.
    //    L'ancien instantané unique pth_create_prefs reste un repli en lecture. ──
    _createPrefsKey() {
      if (window._offlineMode) return 'pth_prefs_local';
      var m = S._currentLoginMode || 'lan';
      return (m === 'guest' || m === 'auth') ? 'pth_prefs_internet' : 'pth_prefs_lan';
    },
    _readCreatePrefsRaw() {
      var d = null;
      try { d = JSON.parse(localStorage.getItem(this._createPrefsKey()) || 'null'); } catch (e) {}
      if (!d) { try { d = JSON.parse(localStorage.getItem('pth_create_prefs') || 'null'); } catch (e) {} }
      return (d && typeof d === 'object') ? d : null;
    },
    _readCreateForm() {
      var g = function(id){ return document.getElementById(id); };
      var iv = function(id, def){ var e = g(id); var v = e ? parseInt(e.value, 10) : NaN; return isNaN(v) ? def : v; };
      var svv = function(id, def){ var e = g(id); return (e && e.value != null && e.value !== '') ? e.value : def; };
      return {
        name:            (g('cf-name') ? g('cf-name').value : '').trim(),
        players:         iv('cf-players', 10),
        blind:           iv('cf-blind', 10),
        stack:           iv('cf-stack', 3000),
        timeout:         iv('cf-timeout', 15),
        raiseMode:       svv('cf-raise-mode', '1'),
        raiseEvery:      iv('cf-raise-every', 7),
        endRaiseMode:    svv('cf-end-raise', '1'),
        endRaiseValue:   iv('cf-end-raise-val', 200),
        manualOrder:     !!(g('cf-mb1') && g('cf-mb1').checked),
        manualBlinds:    svv('cf-manual-blinds', ''),
        guiSpeed:        iv('cf-gui-speed', 5),
        delayHands:      iv('cf-delay', 7),
        gameType:        svv('cf-game-type', '1'),
        allowSpectators: (function(){ var e = g('cf-allow-spectators'); if (!e) return true; return e.type === 'checkbox' ? e.checked : e.value !== '0'; })(),
        usePassword:     !!(g('cf-use-password') && g('cf-use-password').checked),
        password:        (g('cf-use-password') && g('cf-use-password').checked && g('cf-password')) ? g('cf-password').value : '',
        bots:            !!(g('cf-bots') && g('cf-bots').checked),
        minHumans:       iv('cf-min-humans', 2),
      };
    },
    saveCreatePrefs() {
      try { localStorage.setItem(this._createPrefsKey(), JSON.stringify(this._readCreateForm())); } catch (e) {}
      try { _cfgSyncMark('create_prefs'); } catch (e) {}
      try { var _pp = document.getElementById('cf-preset-perso'); if (_pp) _pp.style.display = ''; } catch (e) {}
      if (typeof showToast === 'function') showToast(t('createPrefsSaved') || 'Preferences saved');
    },
    hasCreatePrefs() {
      try { return !!(localStorage.getItem(this._createPrefsKey()) || localStorage.getItem('pth_create_prefs')); } catch (e) { return false; }
    },
    applyCreatePrefs(btn) {
      var d = this._readCreatePrefsRaw();
      if (!d) {
        if (typeof showToast === 'function') showToast(t('createPrefsNone') || 'No saved preferences yet', { tone: 'error' });
        return;
      }
      var set = function(id, val){ var e = document.getElementById(id); if (e == null || val == null) return; e.value = val; e.dispatchEvent(new Event('input')); };
      if (d.name) set('cf-name', d.name);
      set('cf-players',       d.players);
      set('cf-blind',         d.blind);
      set('cf-stack',         d.stack);
      set('cf-timeout',       d.timeout);
      set('cf-raise-mode',    d.raiseMode);
      set('cf-raise-every',   d.raiseEvery);
      set('cf-end-raise',     d.endRaiseMode);
      set('cf-end-raise-val', d.endRaiseValue);
      set('cf-manual-blinds', d.manualBlinds != null ? d.manualBlinds : '');
      this._syncBlindsOrderUI(d.manualOrder != null ? !!d.manualOrder : null);
      set('cf-gui-speed',     d.guiSpeed);
      set('cf-delay',         d.delayHands);
      set('cf-game-type',     d.gameType);
      var asp = document.getElementById('cf-allow-spectators');
      if (asp && d.allowSpectators != null) {
        if (asp.type === 'checkbox') asp.checked = !!d.allowSpectators;
        else { asp.value = d.allowSpectators ? '1' : '0'; asp.dispatchEvent(new Event('input')); }
      }
      var pw = document.getElementById('cf-use-password');
      if (pw) { pw.checked = !!d.usePassword; try { pw.dispatchEvent(new Event('change')); } catch (e) {} }
      var pwr = document.getElementById('cf-password-row');
      if (pwr) pwr.style.display = d.usePassword ? '' : 'none';
      var pwv = document.getElementById('cf-password');
      if (pwv) pwv.value = d.usePassword ? (d.password || '') : '';
      var bt = document.getElementById('cf-bots');
      if (bt && d.bots != null) { bt.checked = !!d.bots; try { this.toggleMinHumans(); } catch (e) {} }
      set('cf-min-humans', d.minHumans);
      // Les préférences remplacent tout style prédéfini : seule la pastille
      // « Perso » reste allumée.
      var presets = document.querySelectorAll('.cf-preset[data-preset]');
      for (var i = 0; i < presets.length; i++) presets[i].classList.remove('active');
      var perso = btn || document.getElementById('cf-preset-perso');
      if (perso) perso.classList.add('active');
      if (typeof showToast === 'function') showToast(t('createPrefsLoaded') || 'Preferences loaded');
    },
    // Reset the create-table form to its FACTORY defaults: the per-mode
    // baseline (LAN vs pokerth.net), explicitly IGNORING the last-used
    // settings saved in localStorage (skipSaved=true). Resets every field —
    // visible and hidden — plus the collapsible panels, presets and password
    // section, then confirms with a toast styled like the header ••• menu.
    resetCreateForm() {
      // Le verrou « classé » ne doit pas restaurer son snapshot par-dessus
      // les valeurs réinitialisées (le setVal cf-game-type → '1' plus bas
      // déclenche _syncGameTypeConstraints via l'événement input).
      this._rankSnap = null;
      this._vorlageSnap = null;
      var _vsr = document.getElementById('cf-vorlage'); if (_vsr) _vsr.value = '0';
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
      setVal('cf-manual-blinds',    '');
      this._syncBlindsOrderUI(false);   // retour à « toujours doubler »
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
      if (!S.gId) return;
      send(MSG.buildStartWithBots(S.gId, true));
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
      if (!S.gId) return;
      // Same counting heuristic as refreshStartNoBotsVisibility() AND
      // renderWaitingPanel(): seatData pids with .gone falsy, PLUS myId
      // if missing (the server doesn't always echo GamePlayerJoined for
      // ourselves, especially when we're the admin who just created the
      // table — myId never enters seatData via that path).
      // BUG FIX: previously this counted only seatData and refused with
      // "At least 2 players are needed" even though the visible panel
      // showed "Joueurs: 2/5" (because the renderer DID inject myId).
      var pids = Object.keys(S.seatData)
        .map(function(s){ return parseInt(s,10); })
        .filter(function(p){ return S.seatData[p] && !S.seatData[p].gone; });
      if (S.myId && pids.indexOf(S.myId) === -1) pids.push(S.myId);
      if (pids.length < 2) {
        // Should never reach here because the button is hidden when
        // pids.length < 2, but catch it anyway so a stray click on a
        // stale UI can't send a bad request to the server.
        var fr = (typeof _lang === 'undefined' || _lang !== 'en');
        addGameChat(null, '⚠ ' + t('kickAtLeast2'), 'sys', { prefix: '⚠ ', key: 'kickAtLeast2' });
        return;
      }
      send(MSG.buildStartWithBots(S.gId, false));
    },
    // Bouton unique « Démarrer la partie » de la wait-page (parité QML :
    // Lobby.startGame(fillCpuCheck.checked)). La case « Compléter avec des
    // joueurs ordinateur » décide du remplissage bots.
    startFromWait() {
      if (window._wpFillBots) this.startWithBots();
      else this.startNoBots();
    },
    createGame() {
      const g = id => document.getElementById(id);
      const iv = (id, def) => parseInt(g(id)?.value) || def;
      const sv = (id, def) => parseInt(g(id)?.value) || def;
      // Guard rail: align with the PokerTH game-name length limit. Refuse to
      // create (with a clear, translated message) when the typed name is too
      // long, instead of letting the server reject it.
      const rawName = (g('cf-name')?.value || '').trim();
      if (rawName.length > S.MAX_GAME_NAME) {
        if (typeof showToast === 'function') {
          showToast(t('nameTooLong', { max: S.MAX_GAME_NAME }), { icon: '\u26A0', tone: 'error', duration: 3500 });
        }
        return;
      }
      // Parité QML : nom vide → erreur inline et création bloquée, mais
      // seulement quand le formulaire est ouvert. Les chemins automatiques
      // (entraînement sans dialogue de création) gardent le nom par défaut.
      const _formOpen = !!document.querySelector('#create-form.open');
      if (!rawName && _formOpen) {
        var _ne = g('cf-name-err'); if (_ne) _ne.style.display = '';
        var _nf = g('cf-name'); if (_nf) _nf.focus();
        return;
      }
      // Type effectif (invité : Normal imposé par le serveur) et constantes
      // des parties classées, re-forcées à l'envoi comme le QML même si l'UI
      // a déjà verrouillé les champs (RANKING_GAME_NUMBER_OF_PLAYERS/START_
      // CASH/START_SBLIND/RAISE_EVERY_HAND, spectateurs oui, pas de mdp,
      // blindes toujours doublées).
      const _gtypeSel = (S._currentLoginMode === 'guest') ? 1 : sv('cf-game-type', 1);
      const _isRank   = (_gtypeSel === 4);
      const name    = _safeGameName(rawName || _defaultNameForMode());
      const nplayers= _isRank ? 10    : iv('cf-players', 2);
      const blind   = _isRank ? 50    : iv('cf-blind',   10);
      const stack   = _isRank ? 10000 : iv('cf-stack',   3000);
      const timeout = iv('cf-timeout', 30);
      const bots    = g('cf-bots')?.checked || false;
      const minHuman= iv('cf-min-humans', 1);
      window._createWithBots  = bots;
      window._minHumansNeeded = bots ? minHuman : 0;
      window._humansJoined    = 1;
      S.gameTimeout = timeout; // mémoriser le timeout pour le timer
      S.gameStartMoney = stack;  // same idea for the starting stack: the
                               // GameListNew message will eventually echo
                               // this back, but writing it here ensures
                               // it's available immediately for our own
                               // JoinGameAck → GameStartInitial pipeline.
      // Mot de passe : Normal/Enregistrés seulement (QML passwordAllowed) —
      // jamais en classé (interdit serveur) ni en invitation.
      const _pwAllowed = (_gtypeSel === 1 || _gtypeSel === 2);
      const tablePass = (_pwAllowed && document.getElementById('cf-use-password')?.checked) ? (document.getElementById('cf-password')?.value || '') : '';
      // Spectators are allowed by default (true) when the field is missing
      // (older clients, or when the form hasn't been opened) — matches the
      // proto's default. The UI dropdown sends '1' = allowed, '0' = blocked.
      const allowSpecRaw = document.getElementById('cf-allow-spectators');
      const allowSpec = _isRank ? true : (allowSpecRaw
        ? (allowSpecRaw.type === 'checkbox' ? allowSpecRaw.checked : allowSpecRaw.value !== '0')
        : true);
      // Ordre manuel des blindes : liste envoyée SEULEMENT si le radio
      // « liste manuelle » est coché (sémantique officielle : liste non vide
      // = mode manuel côté serveur, netpacket.cpp).
      const manualOn = !_isRank && !!(g('cf-mb1') && g('cf-mb1').checked);
      const manualBlinds = manualOn ? this._getManualBlinds() : [];
      const opts = {
        raiseMode:       _isRank ? 1  : sv('cf-raise-mode',    1),
        raiseEvery:      _isRank ? 11 : iv('cf-raise-every',   7),
        endRaiseMode:    sv('cf-end-raise',     1),
        endRaiseValue:   iv('cf-end-raise-val', 200),
        manualBlinds:    manualBlinds,
        guiSpeed:        iv('cf-gui-speed',     5),
        delayHands:      iv('cf-delay',         7),
        gameType:        _gtypeSel,
        allowSpectators: allowSpec,
        password:        tablePass,
      };
      send(MSG.buildCreateGame(name, nplayers, blind, stack, timeout, opts));
      // Entrainement : « Creer une table » lance directement la partie —
      // startWithBots() est declenche par le hook JoinGameAck des que gId
      // est connu (window._offlineAutoReplay, deja utilise par le replay).
      if (window._offlineMode) window._offlineAutoReplay = true;
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
          manualOrder: manualOn, manualBlinds: manualBlinds.join(','),
        }));
      } catch (e) {}
      var f = document.getElementById('create-form');
      if (f) { f.classList.remove('open'); }
    },
    getLobbyState() {
      // Read-only snapshot of the bits the players-panel renderer
      // needs. Returning a fresh object each time so the consumer
      // can sort/filter freely without affecting our internal state.
      return {
        pids:    Array.from(S._lobbyPids),
        players: S.players,
        myId:    S.myId,
        countries: S._playerCountries,
        rights:    S._playerRights,
        flagOf:  function(pid) { return _ccToFlag(S._playerCountries[pid]); },
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
// Heure locale [HH:MM:SS] préfixée aux messages de chat des joueurs (parité
// officielle). Les messages système (sans expéditeur) restent sans heure.
function _chatTs() {
  var d = new Date();
  function p(n){ return (n < 10 ? '0' : '') + n; }
  return '[' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ']';
}

function addGameChat(sender, text, cls, spec) {
  if (cls === 'sys') return; // messages systeme retires du chat (demande narmod)
  if (sender && cls !== 'mine' && _isIgnored(sender)) return; // joueur ignoré
  var el = document.getElementById('g-chat-msgs');
  if (!el) return;
  var _noEmo = false;
  try { _noEmo = (localStorage.getItem('pth_chat_noemoji') === '1'); } catch (e) {}
  if (sender && _noEmo) { try { text = _advStripEmoji(text); } catch (e) {} }
  var d = document.createElement('div');
  d.className = 'msg ' + (cls || '');
  function e(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  // Corps du message : shortcodes :nom: + émoticônes ASCII (port officiel),
  // sauf en mode « chat sans emoji ». Le nom d'expéditeur n'est jamais converti.
  function emT(s) { var h = e(s); if (!_noEmo && typeof window.applyChatEmoteShortcuts === 'function') { try { h = window.applyChatEmoteShortcuts(h); } catch (_e) {} } if (typeof window._linkifyChatHtml === 'function') { try { h = window._linkifyChatHtml(h); } catch (_e2) {} } return h; }
  if (sender) {
    d.innerHTML = '<span class="msg-time">'+_chatTs()+'</span> <span class="who">'+e(sender)+'</span>: <span class="txt">'+emT(text)+'</span>'
      // Traduction par message (API navigateur, opt-in Options avancees) :
      // bouton visible seulement si body.chat-tr-on (option + support).
      + (cls !== 'mine' ? '<button class="chat-tr-btn" title="Traduire" onclick="window._chatTranslate(this)" aria-label="Translate">\u{1F310}</button>' : '');
    try { d.dataset.orig = text; } catch (_e) {}
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
  if (typeof window._applySeatOrient === 'function') window._applySeatOrient();
  autoScaleTable();
  // Re-rendu PENDANT le drag de redimensionnement (parité QML : le layout
  // suit la fenêtre en continu, pas d'états intermédiaires faux). renderSeats
  // est déjà throttlé à la frame (garde rAF _seatsRenderPending) — l'appel
  // direct coûte au plus un rendu par frame. Le passage différé (100 ms)
  // reste pour l'état final une fois la fenêtre posée.
  try { if (typeof renderSeats === 'function' && typeof seats !== 'undefined' && seats.length) renderSeats(); } catch (e) {}
  setTimeout(function(){ if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats(); }, 100);
});
window.addEventListener('orientationchange', function() {
  setTimeout(function(){ if (typeof window._applySeatOrient === 'function') window._applySeatOrient(); autoScaleTable(); if(typeof renderSeats==='function' && typeof seats!=='undefined' && seats.length) renderSeats();
    // Zoom par orientation : appliquer la valeur mémorisée pour la nouvelle
    // orientation + rafraîchir l'état des boutons +/−/↺.
    try { if (typeof applyTableZoom === 'function') applyTableZoom(); } catch (e) {} }, 300);
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
var TABLE_ZOOM_MIN = 0.6, TABLE_ZOOM_MAX = 2.0, TABLE_ZOOM_STEP = 0.1, TABLE_ZOOM_DEFAULT = 1;
var _zoomPanX = 0, _zoomPanY = 0; // translation « suivi du siège actif » (px zone)
function _tableZoomGate() {
  // Parite QML tableZoomEnabled : interrupteur des Options avancees (defaut
  // vrai). Desactive -> boutons masques (body.adv-no-tablezoom) et zoom force
  // a 1 via _getTableZoom, sans effacer la valeur memorisee.
  try { return _advGet('table_zoom', true); } catch (e) { return true; }
}
// Zoom mémorisé PAR ORIENTATION (portrait / paysage séparés). Clés NEUVES
// pth_tz2_* : les anciennes valeurs (pth_table_zoom*) ne sont volontairement
// PAS migrées — elles ont été semées par les sémantiques précédentes du zoom
// et faussaient la taille de base. Tout le monde repart à 1.
function _tableZoomKey() {
  try { return (window.innerHeight > window.innerWidth) ? 'pth_tz2_p' : 'pth_tz2_l'; }
  catch (e) { return 'pth_tz2_l'; }
}
function _getTableZoom() {
  // Zoom de table RETIRÉ (demande narmod, 0.3.539) : le rendu variait selon
  // le navigateur/OS. Le placement reste STRICTEMENT celui du client QML sur
  // tous les écrans ; les valeurs mémorisées sont ignorées. Les boutons +/↺/−
  // et la loupe sont masqués côté CSS ; ✎ (édition) et le zoom de cartes
  // restent. Réintroduction éventuelle plus tard = loupe compact-only comme
  // le QML (Bible §3.4).
  return TABLE_ZOOM_DEFAULT;
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
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
  try { if (typeof autoScaleTable === 'function') autoScaleTable(); } catch (e) {}
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
  _applyZoomTransforms();
  var z = _getTableZoom();
  var maxFit = window._tableZoomMaxFit || TABLE_ZOOM_MAX;
  var bOut = document.getElementById('g-zoom-out');
  var bIn  = document.getElementById('g-zoom-in');
  var bRst = document.getElementById('g-zoom-reset');
  if (bOut) bOut.disabled = (z <= TABLE_ZOOM_MIN + 0.001);
  if (bIn)  bIn.disabled  = (z >= Math.min(TABLE_ZOOM_MAX, maxFit) - 0.001)
                          || (!!window._zoomInLayout && !!window._tableZoomMaxed);
  if (bRst) bRst.disabled = (Math.abs(z - TABLE_ZOOM_DEFAULT) < 0.001);
  var bCz = document.getElementById('g-cardzoom');
  if (bCz) { var _czl=0; try{ _czl=Math.min(5, Math.max(0, parseInt(localStorage.getItem('pth_big_own_cards'),10) || 0)); }catch(e){} bCz.classList.toggle('active', _czl>0); bCz.setAttribute('data-lvl', String(_czl)); }
}
// Agrandissement UNIFORME borne : le feutre (#g-table-scaler) et la couche des
// sieges (#g-seats) sont mis a l'echelle autour du centre du feutre. Le zoom
// effectif est plafonne (mesure des sieges) pour que TOUTE la table reste dans
// la zone -> rien hors-ecran. renderSeats reste neutre (zoom gere ici).
// Parite QML (bible §3.4) : le zoomLayer officiel = adversaires + cartes communes ;
// la SELF-BOX reste fixe. #g-seats etant scale en bloc, on contre-transforme la
// self : position p' telle que pan + c + eff*(p'-c) = position de base, et
// echelle base/eff. A eff<=1 on restaure simplement les valeurs de base.
function _applySelfZoomCounter() {
  // Zoom "grossir sur place" : ma self-box GROSSIT avec le zoom global, mais
  // sa position de BASE ne change PAS (ancree en bas-centre, jamais masquee
  // par la barre d'action). On contre uniquement la TRANSLATION de #g-seats
  // (position figee a la base) ; l'ECHELLE, elle, suit le zoom.
  try {
    var me = document.querySelector('#g-seats .seat.me');
    if (!me || !me.dataset.baseTop) return;
    var zone = document.getElementById('g-table-zone');
    var oval = document.querySelector('.felt-oval');
    if (!zone || !oval) return;
    var eff = window._tableZoomEff || 1;
    var bs = parseFloat(me.dataset.baseScale) || 1;
    var bt = parseFloat(me.dataset.baseTop) || 0;
    var bl = parseFloat(me.dataset.baseLeft) || 0;
    if (eff <= 1.001) {
      me.style.top = bt.toFixed(1) + 'px'; me.style.left = bl.toFixed(1) + 'px';
      me.style.transform = 'translate(-50%,-50%) scale(' + bs + ')';
      return;
    }
    var zr = zone.getBoundingClientRect(), orr = oval.getBoundingClientRect();
    var oCX = orr.left - zr.left + orr.width / 2 - _zoomPanX;
    var oCY = orr.top - zr.top + orr.height / 2 - _zoomPanY;
    // Position locale telle qu'apres le scale(eff) de #g-seats, le CENTRE de la
    // box retombe exactement sur sa position de base (bt,bl) -> ancrage fixe.
    var lx = oCX + (bl - _zoomPanX - oCX) / eff;
    var ly = oCY + (bt - _zoomPanY - oCY) / eff;
    me.style.left = lx.toFixed(1) + 'px';
    me.style.top = ly.toFixed(1) + 'px';
    // Echelle propre = bs ; #g-seats multiplie par eff -> net eff*bs : la box
    // GROSSIT sur place (avant : bs/eff = figee ; uniforme = base deplacee).
    me.style.transform = 'translate(-50%,-50%) scale(' + bs.toFixed(4) + ')';
  } catch (e) {}
}
window._applySelfZoomCounter = _applySelfZoomCounter;

function _applyZoomTransforms() {
  var sc = document.getElementById('g-table-scaler');
  var seats = document.getElementById('g-seats');
  var oval = document.querySelector('.felt-oval');
  var zone = document.getElementById('g-table-zone');
  if (!sc || !seats || !oval || !zone) return;
  var autofit = window._tableAutofit || 1;
  var zr = zone.getBoundingClientRect();
  var orr = oval.getBoundingClientRect();
  // centre du feutre en coords zone (invariant a l'echelle -> mesure directe ok)
  // Pan compensé : la mesure écran inclut la translation courante — on la
  // retire pour retrouver le centre du feutre en coordonnées LOCALES
  // (pré-transform), qui servent de transform-origin.
  var oCX = orr.left - zr.left + orr.width / 2 - _zoomPanX;
  var oCY = orr.top - zr.top + orr.height / 2 - _zoomPanY;
  // Chevauchement / debordement autorise : on applique le zoom demande tel quel
  // (plus de plafond "toujours visible"). Agrandissement UNIFORME du feutre, des
  // sieges et de mes cartes autour du centre du feutre.
  // Mode « zoom dans le layout » (placement officiel actif) : le +/− est déjà
  // consommé par la bisection de renderSeats — les joueurs grossissent SANS
  // sortir du cadre, se toucher ni recouvrir la rivière. Les couches ne sont
  // alors PAS re-scalées (eff = 1, ni pan ni loupe). La loupe uniforme reste
  // le comportement du placement classique/custom.
  var eff = window._zoomInLayout ? 1
          : Math.max(TABLE_ZOOM_MIN, Math.min(_getTableZoom(), TABLE_ZOOM_MAX));
  window._tableZoomEff = eff;
  window._tableZoomMaxFit = TABLE_ZOOM_MAX;
  // Pan du suivi du siège actif : clampé à l'excédent visible ((eff−1)·½zone,
  // comme le QML), nul dès qu'on repasse à zoom ≤ 1.
  if (eff <= 1.001) { _zoomPanX = 0; _zoomPanY = 0; }
  var _maxPX = Math.max(0, (eff - 1) * zr.width / 2);
  var _maxPY = Math.max(0, (eff - 1) * zr.height / 2);
  _zoomPanX = Math.max(-_maxPX, Math.min(_maxPX, _zoomPanX));
  _zoomPanY = Math.max(-_maxPY, Math.min(_maxPY, _zoomPanY));
  var _pan = (_zoomPanX || _zoomPanY)
    ? 'translate(' + _zoomPanX.toFixed(1) + 'px,' + _zoomPanY.toFixed(1) + 'px) ' : '';
  sc.style.transform = _pan + 'scale(' + (autofit * eff).toFixed(3) + ')';
  sc.style.transformOrigin = 'center center';
  seats.style.transformOrigin = oCX.toFixed(1) + 'px ' + oCY.toFixed(1) + 'px';
  seats.style.transform = _pan + 'scale(' + eff.toFixed(3) + ')';
  // mes cartes (player-bar) grandissent aussi au zoom-avant
  var myc = document.getElementById('g-myseat-cards');
  if (myc) { myc.style.transformOrigin = 'left center'; myc.style.transform = (eff > 1.001 ? 'scale(' + eff.toFixed(3) + ')' : ''); }
  // Cartes communes (#g-comm) : le scaler porte deja autofit*eff -> on neutralise
  // la compensation posee par autoScaleTable (sinon double facteur = eff^2).
  var _ccz = document.getElementById('g-comm');
  if (_ccz) _ccz.style.transform = '';
  _applySelfZoomCounter();
}
// Zoom repliable en mobile : une touche 🔍 qui déploie les boutons de zoom.
// ── Loupe QML (port de tableZone.zoomActive / zoomContent, source 2.1.3) ──
// Facteur fixe ×2.0 sur #g-zoom-layer (transformOrigin 0,0 ; x/y =
// (1−k)·zone/2 + pan) ; clip de la zone quand actif ; pan au pointeur ;
// transition 220 ms OutCubic hors drag. Self/action bar/fond : hors effet.
var _loupe = { on:false, k:2.0, panX:0, panY:0, susp:false, drag:false,
               followSeat:null, followTmr:null };
window._loupeK = 1;
function _loupeZone() { return document.getElementById('g-table-zone'); }
function _loupeClamp() {
  var z = _loupeZone(); if (!z) return;
  var k = _loupe.k, mX = (k - 1) / 2 * z.clientWidth, mY = (k - 1) / 2 * z.clientHeight;
  if (_loupe.panX >  mX) _loupe.panX =  mX;
  if (_loupe.panX < -mX) _loupe.panX = -mX;
  if (_loupe.panY >  mY) _loupe.panY =  mY;
  if (_loupe.panY < -mY) _loupe.panY = -mY;
}
function _loupeApply(anim) {
  var el = document.getElementById('g-zoom-layer'), z = _loupeZone();
  if (!el || !z) return;
  var act = _loupe.on && !_loupe.susp, k = act ? _loupe.k : 1;
  window._loupeK = k;
  el.style.transition = (anim === false || _loupe.drag) ? 'none'
    : 'transform 220ms cubic-bezier(0.215, 0.61, 0.355, 1)';
  el.style.transformOrigin = '0 0';
  el.style.transform = act
    ? 'translate(' + ((1 - k) * z.clientWidth / 2 + _loupe.panX) + 'px,'
                   + ((1 - k) * z.clientHeight / 2 + _loupe.panY) + 'px) scale(' + k + ')'
    : '';
  z.style.overflow = act ? 'hidden' : '';   // clip: tableZone.zoomActive
  var b = document.getElementById('g-zoom-toggle');
  if (b) { b.setAttribute('aria-pressed', _loupe.on ? 'true' : 'false');
           b.classList.toggle('active', _loupe.on); }
}
function toggleLoupe() {
  _loupe.on = !_loupe.on;
  if (!_loupe.on) { _loupe.panX = _loupe.panY = 0; _loupe.susp = false;
                    if (_loupe.followTmr) { clearTimeout(_loupe.followTmr); _loupe.followTmr = null; }
                    _loupe.followSeat = null; }
  _loupeClamp(); _loupeApply();
}
window.toggleLoupe = toggleLoupe;
// ── Visibilité STRICTE QML (GamePage 2.1.3:2291) :
//   visible = mobile (pointeur tactile) && Responsive.compact && tableZoomEnabled.
// Position : pastille 36 px en BAS-DROITE — paysage 8 px du bord, portrait
// 8 px AU-DESSUS de la barre d'action. Bouton caché => zoom coupé + pan reset
// (onVisibleChanged QML). Option : localStorage pth_table_zoom ('0' = off,
// défaut activé — parité Config.Parameters.tableZoomEnabled).
function _loupeBtnSync() {
  var b = document.getElementById('g-zoom-toggle'); if (!b) return;
  var coarse = false;
  try { coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) {}
  var w = window.innerWidth, h = window.innerHeight;
  var compact = w < 600 || (w >= h && h < 600);   // Responsive.compact (mobile)
  var enabled = true;
  try { enabled = localStorage.getItem('pth_table_zoom') !== '0'; } catch (e) {}
  var vis = coarse && compact && enabled;
  b.classList.toggle('loupe-avail', vis);
  if (!vis && (_loupe.on || _loupe.susp)) {
    _loupe.on = false; _loupe.susp = false; _loupe.panX = _loupe.panY = 0;
    if (_loupe.followTmr) { clearTimeout(_loupe.followTmr); _loupe.followTmr = null; }
    _loupe.followSeat = null;
    _loupeApply(false);
  }
  if (vis) {
    var portrait = (typeof _tableZonePortrait === 'function') ? _tableZonePortrait() : (h > w);
    var mz = document.querySelector('.my-zone');
    b.style.bottom = (!portrait ? 8 : 8 + (mz ? Math.round(mz.getBoundingClientRect().height) : 0)) + 'px';
  }
}
window._loupeBtnSync = _loupeBtnSync;
setTimeout(_loupeBtnSync, 900);
// Pan au pointeur (souris/tactile). Sièges et boutons restent cliquables :
// le drag ne démarre pas dessus (comme le DragHandler QML sous les items).
(function () {
  var sx = 0, sy = 0, px = 0, py = 0;
  document.addEventListener('pointerdown', function (e) {
    if (!(_loupe.on && !_loupe.susp)) return;
    var z = _loupeZone(); if (!z || !z.contains(e.target)) return;
    if (e.target.closest && (e.target.closest('.seat') || e.target.closest('button') || e.target.closest('select'))) return;
    _loupe.drag = true; sx = e.clientX; sy = e.clientY; px = _loupe.panX; py = _loupe.panY;
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (!_loupe.drag) return;
    _loupe.panX = px + (e.clientX - sx); _loupe.panY = py + (e.clientY - sy);
    _loupeClamp(); _loupeApply(false);
  });
  document.addEventListener('pointerup', function () {
    if (_loupe.drag) { _loupe.drag = false; _loupeApply(); }
  });
})();
// Hook appelé par renderSeats : suivi différé du siège actif + suspension au
// showdown (parité _scheduleFollow/_doFollow + _zoomSuspendedByShowdown).
window._loupeOnRender = function (activeEl, showdown, timerTot) {
  _loupeBtnSync();   // visibilité/position réévaluées à chaque rendu de table
  if (!_loupe.on) return;
  var z = _loupeZone(); if (!z) return;
  if (showdown) {   // dézoom pour la vue d'ensemble, réactivé main suivante
    if (!_loupe.susp) { _loupe.susp = true; _loupeApply(); }
    return;
  }
  if (_loupe.susp) { _loupe.susp = false; _loupeApply(); }
  var key = activeEl ? (activeEl.getAttribute('data-pid') || 'x') : null;
  if (!key || key === _loupe.followSeat) return;
  _loupe.followSeat = key;
  if (_loupe.followTmr) clearTimeout(_loupe.followTmr);
  var ms = Math.max(800, (timerTot || 30) * 250);
  _loupe.followTmr = setTimeout(function () {
    _loupe.followTmr = null;
    if (!_loupe.on || _loupe.susp || _loupe.drag) return;
    var el = document.querySelector('#g-seats .seat.active:not(.me)');
    var z2 = _loupeZone(); if (!el || !z2) return;
    // Coordonnées zone (style left/top posés par renderSeats, non transformés).
    var pxT = parseFloat(el.style.left) || 0, pyT = parseFloat(el.style.top) || 0;
    _loupe.panX = _loupe.k * (z2.clientWidth / 2 - pxT);
    _loupe.panY = _loupe.k * (z2.clientHeight / 2 - pyT);
    _loupeClamp(); _loupeApply();
  }, ms);
};
window.addEventListener('resize', function () { _loupeClamp(); _loupeApply(false); _loupeBtnSync(); });

function toggleZoomCtrl() {
  var el = document.getElementById('g-zoom-ctrl');
  if (!el) return;
  var open = el.classList.toggle('open');
  var t = document.getElementById('g-zoom-toggle');
  if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
}
window.toggleZoomCtrl = toggleZoomCtrl;

function tableZoomStep(dir) {
  var z = _getTableZoom() + (dir > 0 ? TABLE_ZOOM_STEP : -TABLE_ZOOM_STEP);
  z = Math.round(z * 100) / 100;
  z = Math.max(TABLE_ZOOM_MIN, Math.min(TABLE_ZOOM_MAX, z));
  try { localStorage.setItem(_tableZoomKey(), String(z)); } catch (e) {}
  applyTableZoom();
}
function tableZoomReset() {
  try { localStorage.setItem(_tableZoomKey(), String(TABLE_ZOOM_DEFAULT)); } catch (e) {}
  applyTableZoom();
}
window.tableZoomStep = tableZoomStep;
window.tableZoomReset = tableZoomReset;
window.applyTableZoom = applyTableZoom;

// ── Zoom-follow du siège actif + suspension au showdown (parité QML, bible §3.4) ──
// Quand un adversaire est au tour et que la table est zoomée (>1), le cadrage
// NE saute PAS tout de suite : on programme un pan différé
// (max(800 ms, timeout×250 ms ≈ ¼ du temps de réflexion)) et on pane
// immédiatement si le joueur agit (PlayersActionDone). Au showdown, le zoom se
// suspend (dézoom = vue d'ensemble) et se réactive automatiquement à la main
// suivante s'il était actif. Aucun suivi pendant l'édition des sièges.
var _zoomFollowTimer = null;
var _zoomPendingPid = -1, _zoomFollowedPid = -1;
var _zoomPreShowdown = null; // valeur de zoom sauvée pendant la suspension
function _zoomFollowOn() {
  return (window._tableZoomEff || _getTableZoom()) > 1.001 && !window._seatEditMode
    && _advGet('zoom_follow', true);   // actif par défaut (parité QML zoom-follow)
}
function _zoomPanToSeat(pid) {
  var zone = document.getElementById('g-table-zone');
  var oval = document.querySelector('.felt-oval');
  var seatEl = document.querySelector('#g-seats .seat[data-pid="' + pid + '"]');
  if (!zone || !oval || !seatEl) return;
  var eff = window._tableZoomEff || _getTableZoom();
  if (eff <= 1.001) return;
  // Coordonnées LOCALES (pré-transform) : offsetLeft/Top du siège (layout, non
  // transformé) + centre du feutre re-déduit de la mesure écran compensée du
  // pan courant. Cible : centre du siège → centre de la zone ;
  // t = c − o − (p−o)·eff, clampé ensuite par _applyZoomTransforms.
  var zr = zone.getBoundingClientRect();
  var orr = oval.getBoundingClientRect();
  var oX = orr.left - zr.left + orr.width / 2 - _zoomPanX;
  var oY = orr.top - zr.top + orr.height / 2 - _zoomPanY;
  var pX = seatEl.offsetLeft + seatEl.offsetWidth / 2;
  var pY = seatEl.offsetTop + seatEl.offsetHeight / 2;
  _zoomPanX = zr.width / 2 - oX - (pX - oX) * eff;
  _zoomPanY = zr.height / 2 - oY - (pY - oY) * eff;
  // Pan animé (220 ms OutCubic comme le QML) ; transition retirée ensuite pour
  // ne pas animer les resize / re-rendus ultérieurs.
  var sc = document.getElementById('g-table-scaler');
  var seats = document.getElementById('g-seats');
  [sc, seats].forEach(function (el) {
    if (el) el.style.transition = 'transform 220ms cubic-bezier(0.33, 1, 0.68, 1)';
  });
  try { _applyZoomTransforms(); } catch (e) {}
  setTimeout(function () {
    [sc, seats].forEach(function (el) { if (el) el.style.transition = ''; });
  }, 260);
}
function _zoomDoFollow() {
  if (_zoomFollowTimer) { clearTimeout(_zoomFollowTimer); _zoomFollowTimer = null; }
  if (!_zoomFollowOn()) { _zoomPendingPid = -1; return; }
  if (_zoomPendingPid <= 0) return;
  _zoomPanToSeat(_zoomPendingPid);
  _zoomFollowedPid = _zoomPendingPid;
  _zoomPendingPid = -1;
}
// Adversaire au tour → planifier le pan (jamais pour soi : parité QML,
// la self-box reste le point fixe du cadrage).
window._zoomFollowTurn = function (pid, sec) {
  if (!_zoomFollowOn() || !pid) return;
  if (pid === _zoomFollowedPid) return;                       // déjà cadré
  if (pid === _zoomPendingPid && _zoomFollowTimer) return;    // déjà planifié
  _zoomPendingPid = pid;
  if (_zoomFollowTimer) clearTimeout(_zoomFollowTimer);
  _zoomFollowTimer = setTimeout(_zoomDoFollow, Math.max(800, (sec > 0 ? sec : 8) * 250));
};
// Le joueur a agi → exécuter tout pan en attente immédiatement.
window._zoomFollowActed = function () { if (_zoomPendingPid > 0) _zoomDoFollow(); };
// Showdown → dézoom d'ensemble (zoom sauvé, restauré à la main suivante).
window._zoomShowdownSuspend = function () {
  if (!_advGet('zoom_follow', true)) return;   // option coupée → zoom intact au showdown
  if (_zoomFollowTimer) { clearTimeout(_zoomFollowTimer); _zoomFollowTimer = null; }
  _zoomPendingPid = -1; _zoomFollowedPid = -1;
  var z = _getTableZoom();
  if (z > 1.001 && _zoomPreShowdown == null) {
    _zoomPreShowdown = z;
    _zoomPanX = 0; _zoomPanY = 0;
    try { localStorage.setItem('pth_table_zoom', '1'); } catch (e) {}
    try { applyTableZoom(); } catch (e) {}
  }
};
// Nouvelle main → reset du suivi + restauration du zoom suspendu.
window._zoomHandStart = function () {
  if (_zoomFollowTimer) { clearTimeout(_zoomFollowTimer); _zoomFollowTimer = null; }
  _zoomPendingPid = -1; _zoomFollowedPid = -1;
  var need = (_zoomPreShowdown != null) || _zoomPanX || _zoomPanY;
  _zoomPanX = 0; _zoomPanY = 0;
  if (_zoomPreShowdown != null) {
    var z = _zoomPreShowdown; _zoomPreShowdown = null;
    try { localStorage.setItem('pth_table_zoom', String(z)); } catch (e) {}
  }
  if (need) { try { applyTableZoom(); } catch (e) {} }
};

// ════════════════════════════════════════════════════════════════════════
// [Phase 2] Placement custom des sièges (fractions par orientation/nb de
// joueurs, mode édition glisser-déposer, bannière, autoScaleTable) déplacé
// dans public/modules/game/seats.mjs (toujours global via window.*).

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
  var sx=0, sy=0, sl=0, st=0, drag=false, pend=false, sup=false;
  handle.addEventListener('pointerdown', function(e){
    if(panel._winDrag===false) return;       // inerte hors mode flottant
    var _b = e.target.closest && e.target.closest('button');
    // Boutons d'en-tete : pas de drag — SAUF les onglets .gip-tab, qui se
    // traînent « au seuil » (bougé > 7px = déplacement, tap simple = clic).
    if(_b && !(_b.classList && _b.classList.contains('gip-tab'))) return;
    var r=panel.getBoundingClientRect();
    sx=e.clientX; sy=e.clientY; sl=r.left; st=r.top; sup=false;
    if(_b){ pend=true; return; }             // pas de preventDefault : le clic d'onglet reste possible
    _ensureFloating(panel, e);
    drag=true;
    handle.classList.add('win-dragging');
    try{ handle.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  handle.addEventListener('pointermove', function(e){
    if(pend && !drag){
      if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy) <= 7) return;
      _ensureFloating(panel, e);
      var r2=panel.getBoundingClientRect(); sl=r2.left; st=r2.top;
      drag=true; sup=true; pend=false;
      handle.classList.add('win-dragging');
      try{ handle.setPointerCapture(e.pointerId); }catch(_){}
    }
    if(!drag) return;
    _placeWin(panel, sl+(e.clientX-sx), st+(e.clientY-sy));
  });
  // Un drag parti d'un onglet ne doit pas déclencher le changement d'onglet.
  handle.addEventListener('click', function(e){ if(sup){ sup=false; e.stopPropagation(); e.preventDefault(); } }, true);
  function end(e){
    pend=false;
    if(!drag) return; drag=false;
    handle.classList.remove('win-dragging');
    try{ handle.releasePointerCapture(e.pointerId); }catch(_){}
    _saveWin(panel, key);
  }
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}
// ── Zoom de fenêtre (demande narmod 2026-07-18) : le CONTENU (texte,
// contrôles, espacements) suit l'agrandissement/rétrécissement de la fenêtre.
// z = taille courante / taille par défaut (borné), multiplié par un facteur
// global d'app dérivé du viewport — les fenêtres/popups s'adaptent aussi à la
// taille de la fenêtre de l'app. Rendu via la propriété CSS `zoom`
// (standardisée) posée sur les enfants directs : le layout interne se fait en
// coordonnées locales puis est mis à l'échelle (flex/scroll restent corrects).
function _appWinZoom(){
  var z = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
  return Math.max(0.9, Math.min(1.25, z));
}
function _applyWinZoom(panel){
  if (!panel || !panel._winOpt || !panel._winOpt.zoom) return;
  try {
    var o = panel._winOpt;
    var w = panel.offsetWidth  || o.defW || 340;
    var h = panel.offsetHeight || o.defH || 300;
    var z = Math.min(w / (o.defW || 340), h / (o.defH || 300));
    z = Math.max(0.8, Math.min(1.8, z)) * _appWinZoom();
    panel.style.setProperty('--wz', z.toFixed(3));
    panel.classList.add('win-zoom');
  } catch (e) {}
}
function makeWinResizable(panel, key, minW, minH, maxW, maxH){
  if(!panel || panel._winRszWired) return;
  panel._winRszWired=true;
  minW=minW||240; minH=minH||140;
  // maxW/maxH optionnels : bornes hautes de la fenetre (0/undefined = illimite).
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
      if(maxW && nw>maxW){ if(dir.indexOf('w')>=0) nl+=(nw-maxW); nw=maxW; }
      if(maxH && nh>maxH){ if(dir.indexOf('n')>=0) nt+=(nh-maxH); nh=maxH; }
      var vw=window.innerWidth, vh=window.innerHeight;
      // Borne la TAILLE pour garder le bord opposé au coin tiré dans l'écran,
      // sans repousser le coin ancré (sinon la fenêtre « recule » en s'agrandissant).
      if(dir.indexOf('e')>=0) nw=Math.min(nw, vw-nl-6);
      if(dir.indexOf('s')>=0) nh=Math.min(nh, vh-nt-6);
      if(dir.indexOf('w')>=0 && nl<6){ nw-=(6-nl); nl=6; }
      if(dir.indexOf('n')>=0 && nt<6){ nh-=(6-nt); nt=6; }
      nw=Math.max(minW, Math.min(nw, vw-12)); nh=Math.max(minH, Math.min(nh, vh-12));
      if(maxW) nw=Math.min(nw, maxW); if(maxH) nh=Math.min(nh, maxH);
      panel.style.width=nw+'px'; panel.style.height=nh+'px';
      panel.style.right='auto'; panel.style.bottom='auto';
      panel.style.left=nl+'px'; panel.style.top=nt+'px';
      _applyWinZoom(panel);
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
function _clampWinToViewport(panel){
  // Borne la taille (si redimensionnable) puis la position d'une fenetre
  // flottante au viewport courant : taille memorisee sur un ecran plus
  // grand, ou navigateur retreci apres coup.
  try{
    var o=panel._winOpt||{};
    if(panel._winResizable){
      var mw=Math.max(o.minW||240, window.innerWidth-8);
      var mh=Math.max(o.minH||140, window.innerHeight-8);
      if(panel.offsetWidth >mw) panel.style.width =mw+'px';
      if(panel.offsetHeight>mh) panel.style.height=mh+'px';
    }
    var r=panel.getBoundingClientRect();
    _placeWin(panel, r.left, r.top);
  }catch(e){}
}
function _enableFloating(panel, opt){
  if(!panel) return; opt=opt||{};
  panel.classList.add('floating-win');
  panel._winDrag=true; panel._winResizable=!!opt.resizable;
  panel.style.setProperty('max-height','none','important');
  var restored=_restoreWin(panel, opt.key);
  if(restored){
    // Taille memorisee avant l'introduction des bornes maxi : on la re-borne.
    if(opt.maxW && panel.offsetWidth >opt.maxW) panel.style.width =opt.maxW+'px';
    if(opt.maxH && panel.offsetHeight>opt.maxH) panel.style.height=opt.maxH+'px';
  }
  if(!restored){
    if(opt.resizable){
      if(!panel.style.width) panel.style.width=(opt.defW||340)+'px';
      panel.style.height=(opt.defH||300)+'px';
    }
    _placeWin(panel, (opt.defLeft!=null?opt.defLeft:16), (opt.defTop!=null?opt.defTop:56));
  }
  if(opt.handle) makeWinDraggable(panel, opt.handle, opt.key);
  if(opt.resizable) makeWinResizable(panel, opt.key, opt.minW, opt.minH, opt.maxW, opt.maxH);
  panel._winOpt = panel._winOpt || opt;
  _clampWinToViewport(panel);
  _applyWinZoom(panel);
}
function _disableFloating(panel){
  if(!panel || !panel.classList.contains('floating-win')) return;
  panel.classList.remove('floating-win');
  panel.classList.remove('win-zoom');
  panel.style.removeProperty('--wz');
  panel._winDrag=false; panel._winResizable=false;
  panel.style.removeProperty('max-height');
  ['left','top','right','bottom','width','height'].forEach(function(p){ panel.style[p]=''; });
  var hs=panel.querySelectorAll('.win-rsz');
  for(var i=0;i<hs.length;i++) hs[i].remove();
  panel._winRszWired=false;   // re-injectable si on repasse en flottant
}
window.addEventListener('resize', function(){
  // TOUTES les fenetres flottantes (chat, log, reactions, musique, mains,
  // journaux, ...) : re-bornees en taille ET en position au viewport.
  var ps=document.querySelectorAll('.floating-win');
  for(var i=0;i<ps.length;i++){
    var p=ps[i];
    if(p.style.display==='none' || !p.offsetWidth) continue;
    _clampWinToViewport(p);
    _applyWinZoom(p);   // le facteur global d'app (viewport) a pu changer
  }
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
  if(opt.maxW) newW=Math.min(newW, opt.maxW);
  if(opt.maxH) newH=Math.min(newH, opt.maxH);
  panel.style.width=newW+'px';
  panel.style.height=newH+'px';
  _placeWin(panel, left, top);
  if (opt.resizable) makeWinResizable(panel, opt.key, opt.minW, opt.minH, opt.maxW, opt.maxH);
  _applyWinZoom(panel);
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
  if (opt.resizable) makeWinResizable(panel, opt.key, opt.minW, opt.minH, opt.maxW, opt.maxH);
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
  ['pth_winpos_chat','pth_winpos_lobbychat','pth_winpos_log2','pth_winpos_react','pth_winpos_theme','pth_winpos_hands','pth_winpos_music','pth_odds_pos','pth_odds_w','pth_assist_pos','pth_assist_w','pth_win_adv'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
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
  // Chat intégré au lobby (colonne en wide, sous les tables en compact)
  // → plus de fenêtre flottante ni d'overlay. No-op dans les deux modes.
  return;
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
      _attachFloatControls(panel, { key:'pth_winpos_lobbychat', handle: panel.querySelector('.g-chat-panel-header'), resizable:true, minW:240, minH:160, defW:300, defH:280, zoom:true });
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
  inner.innerHTML = '<div class="g-chat-panel-header"><span style="font-size:0.65rem;color:var(--gold-dim);letter-spacing:0.15em;text-transform:uppercase">' + t('handsTitle') + '</span>'
    + '<button onclick="toggleHandsHelp()" title="' + t('handsClose') + '" style="background:none;border:none;color:var(--text);cursor:pointer;font-size:0.85rem;padding:0 4px">\u2715</button></div>'
    + '<div class="hands-scroll">'
    + legend
    + rows
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
// Jumeau « Créer une partie » : même roue crantée + globe que le lobby
// (demande narmod : header uniforme sur la page de création).
function toggleCreateOverflow(e) {
  if (e) e.stopPropagation();
  var m = document.getElementById('cr-overflow-menu');
  if (!m) return;
  m.classList.toggle('open');
}
function closeCreateOverflow() {
  var m = document.getElementById('cr-overflow-menu');
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
  var crbtn = document.getElementById('cr-overflow-btn');
  var crmenu = document.getElementById('cr-overflow-menu');
  if (crmenu && crbtn && !crbtn.contains(e.target) && !crmenu.contains(e.target)) {
    crmenu.classList.remove('open');
  }
});

function toggleHandsHelp() {
  var ov = document.getElementById('hands-overlay');
  var card = document.getElementById('hands-card-inner');
  if (!ov || !card) return;
  var opening = ov.style.display === 'none';
  if (opening) {
    renderHandsHelp();
    ov.style.display = 'flex';
    card._winRszWired = false;   // innerHTML reconstruit -> re-injecter les poignees
    var btn = document.getElementById('hands-toggle-btn');
    // Même système de fenêtre que chat/journal/réactions (déplaçable + redimensionnable partout).
    _openFloatingNearBtn(card, btn, { key:'pth_winpos_hands', handle: card.querySelector('.g-chat-panel-header'), resizable:true, minW:280, minH:220, defW:380, defH:440, zoom:true }, 'right');
    // Mode compact selon la largeur réelle de la fenêtre (ResizeObserver).
    if (!card._cmpObs && typeof ResizeObserver !== 'undefined') {
      card._cmpObs = new ResizeObserver(function(){
        var w = card.offsetWidth;
        if (!w) return;
        card.classList.toggle('hands-cmp', w <= 380);
        card.classList.toggle('hands-cmp-xs', w <= 250);
      });
      card._cmpObs.observe(card);
    }
  } else {
    if (card.classList.contains('floating-win')) _saveWin(card, 'pth_winpos_hands');
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
  function row(list) {
    var s = '';
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      s += '<button type="button" class="chat-emoji-btn" data-emo="' + e + '" title="' + e + '">' + e + '</button>';
    }
    return s;
  }
  var tt = function (k, fb) { return (typeof t === 'function' && t(k) !== k) ? t(k) : fb; };
  var h = '<div class="chat-emoji-sec">' + tt('emoFrequent', 'Frequent') + '</div>' + row(CHAT_EMOJIS)
        + '<div class="chat-emoji-sec">' + tt('emoAll', 'All') + '</div>' + row(CHAT_EMOJIS_ALL);
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
// ── Chat : complétion Tab des pseudos + historique de saisie ↑/↓ ────────────
// (parité ChatBox QML, bible §11). Historique partagé jeu+lobby, en mémoire
// de session, plafonné. Toute frappe réinitialise l'itération Tab ET la
// navigation d'historique, comme le QML.
var _chatHist = [];
var _CHAT_HIST_MAX = 50;
window._chatPushHist = function (txt) {
  if (!txt) return;
  if (_chatHist[_chatHist.length - 1] === txt) return; // pas de doublon consécutif
  _chatHist.push(txt);
  if (_chatHist.length > _CHAT_HIST_MAX) _chatHist.shift();
};
function _attachChatKeys(id, gameScope) {
  var inp = document.getElementById(id);
  if (!inp || inp._keysAttached) return;
  inp._keysAttached = true;
  var tabMatches = null, tabIdx = 0, tabStart = 0, tabTail = '';
  var histIdx = -1, draft = '';
  function caretEnd() { try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {} }
  // L'envoi sur Entrée était câblé en attribut inline (onkeydown) : on le
  // reprend ici pour pouvoir intercepter Entrée quand le popup d'emotes est
  // ouvert (accepter la suggestion au lieu d'envoyer), comme le QML.
  var sendOnEnter = inp.onkeydown;
  inp.onkeydown = null;

  // ── Popup de suggestion d'emotes (":smi…" → 😄) — parité ChatBox QML ──
  // Codes = window.chatEmoteShortcodes() (chat-emotes.js), EXACTEMENT ce que
  // applyChatEmoteShortcuts remplace à l'affichage. Déclencheur : ":" (début
  // ou après espace) + ≥2 caractères [a-z0-9_+-] avant le curseur — le ":"
  // fermant fait disparaître le popup de lui-même. Préfixes d'abord, puis
  // sous-chaînes. Esc masque jusqu'à la prochaine frappe.
  var esMatches = [], esIdx = 0, esTokenStart = -1, esSuppressed = false;
  var esBox = null;
  function esEnsureBox() {
    if (esBox) return esBox;
    esBox = document.createElement('div');
    esBox.className = 'emote-suggest';
    (inp.parentElement || document.body).appendChild(esBox);
    return esBox;
  }
  function esOpen() { return esMatches.length > 0 && !esSuppressed && document.activeElement === inp; }
  function esRender() {
    var box = esEnsureBox();
    if (!esOpen()) { box.classList.remove('open'); return; }
    box.innerHTML = '';
    for (var i = 0; i < esMatches.length; i++) (function (i) {
      var row = document.createElement('div');
      row.className = 'es-row' + (i === esIdx ? ' sel' : '');
      var em = document.createElement('span'); em.className = 'es-emoji'; em.textContent = esMatches[i].emoji;
      var cd = document.createElement('span'); cd.className = 'es-code';  cd.textContent = ':' + esMatches[i].code + ':';
      row.appendChild(em); row.appendChild(cd);
      // mousedown neutralisé : le clic ne vole pas le focus du champ (parité TapHandler QML)
      row.addEventListener('mousedown', function (e) { e.preventDefault(); });
      row.addEventListener('mouseenter', function () { if (esIdx !== i) { esIdx = i; esRender(); } });
      row.addEventListener('click', function () { esIdx = i; esAccept(); inp.focus(); });
      box.appendChild(row);
    })(i);
    box.classList.add('open');
    var sel = box.children[esIdx];
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
  }
  function esUpdate() {
    var pos = (inp.selectionStart != null) ? inp.selectionStart : inp.value.length;
    var upto = inp.value.slice(0, pos);
    var m = upto.match(/(?:^|\s):([a-z0-9_+-]{2,})$/);
    if (!m || typeof window.chatEmoteShortcodes !== 'function') {
      if (esMatches.length) { esMatches = []; esRender(); }
      return;
    }
    var typed = m[1];
    esTokenStart = upto.length - typed.length - 1;
    var list = window.chatEmoteShortcodes();
    var pre = [], sub = [];
    for (var i = 0; i < list.length; i++) {
      var idx = list[i].code.indexOf(typed);
      if (idx === 0) pre.push(list[i]);
      else if (idx > 0) sub.push(list[i]);
    }
    esMatches = pre.concat(sub);
    esIdx = 0;
    esRender();
  }
  // Remplace le token tapé (":smi") par l'EMOJI du choix — WYSIWYG et moins
  // d'octets dans la limite serveur de 128, exactement comme le QML.
  function esAccept() {
    if (!esMatches.length) return;
    var e = esMatches[Math.min(esIdx, esMatches.length - 1)];
    var pos = (inp.selectionStart != null) ? inp.selectionStart : inp.value.length;
    inp.value = inp.value.slice(0, esTokenStart) + e.emoji + inp.value.slice(pos);
    var np = esTokenStart + e.emoji.length;
    try { inp.setSelectionRange(np, np); } catch (err) {}
    esMatches = [];
    esRender();
  }
  inp.addEventListener('input', function () { esSuppressed = false; esUpdate(); });
  inp.addEventListener('click', esUpdate);
  inp.addEventListener('focus', esUpdate);
  inp.addEventListener('blur', function () { esRender(); });
  inp.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') esUpdate();
  });

  inp.addEventListener('keydown', function (e) {
    // ── Popup d'emotes ouvert : ↑/↓ = sélection (circulaire), Tab/Enter =
    // accepter, Esc = masquer jusqu'à la prochaine frappe ──
    if (esOpen()) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        esIdx = (esIdx + esMatches.length - 1) % esMatches.length;
        esRender();
        return;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        esIdx = (esIdx + 1) % esMatches.length;
        esRender();
        return;
      } else if ((e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) || e.key === 'Enter') {
        e.preventDefault();
        esAccept();
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        esSuppressed = true;
        esRender();
        return;
      }
    }
    // ── Tab : complète un pseudo, re-Tab itère sur les correspondances ──
    if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (tabMatches && tabMatches.length) {
        tabIdx = (tabIdx + 1) % tabMatches.length;
      } else {
        var pos = (inp.selectionStart != null) ? inp.selectionStart : inp.value.length;
        var m = inp.value.slice(0, pos).match(/(\S+)$/);
        if (!m) return;                       // rien à compléter → Tab normal
        var prefix = m[1].toLowerCase();
        var nicks = (window._chatNicks ? window._chatNicks(gameScope) : []) || [];
        var seen = {};
        var matches = nicks.filter(function (n) {
          var k = n.toLowerCase();
          if (seen[k] || k.indexOf(prefix) !== 0) return false;
          seen[k] = 1; return true;
        });
        if (!matches.length) return;          // aucun pseudo → Tab normal
        tabMatches = matches; tabIdx = 0;
        tabStart = pos - m[1].length;
        tabTail = inp.value.slice((inp.selectionEnd != null) ? inp.selectionEnd : pos);
      }
      e.preventDefault();
      var nick = tabMatches[tabIdx];
      var suffix = (tabStart === 0) ? ': ' : ' '; // en tête de message : « nick: »
      inp.value = inp.value.slice(0, tabStart) + nick + suffix + tabTail;
      var np = tabStart + nick.length + suffix.length;
      try { inp.setSelectionRange(np, np); } catch (err) {}
      return;
    }
    // ── ↑ / ↓ : historique des messages envoyés ──
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!_chatHist.length) return;
      e.preventDefault();
      tabMatches = null;
      // Un token qui matche par hasard en fin d'entrée d'historique ne doit
      // pas ouvrir le popup d'emotes (parité QML).
      esSuppressed = true; esRender();
      if (e.key === 'ArrowUp') {
        if (histIdx === -1) { draft = inp.value; histIdx = _chatHist.length - 1; }
        else if (histIdx > 0) histIdx--;
        inp.value = _chatHist[histIdx]; caretEnd();
      } else {
        if (histIdx === -1) return;
        histIdx++;
        if (histIdx >= _chatHist.length) { histIdx = -1; inp.value = draft; }
        else inp.value = _chatHist[histIdx];
        caretEnd();
      }
      return;
    }
    // Toute autre frappe réinitialise Tab et la navigation d'historique
    tabMatches = null;
    histIdx = -1;
    // ── Entrée (popup fermé) : envoi — reprise du handler inline d'origine ──
    if (e.key === 'Enter' && typeof sendOnEnter === 'function') {
      sendOnEnter.call(inp, e);
      esMatches = []; esRender();
    }
  });
}
(function () {
  function _initChatKeys() {
    _attachChatKeys('chat-in', false);
    _attachChatKeys('g-chat-in', true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initChatKeys);
  else _initChatKeys();
})();

window.toggleChatEmojiPicker = toggleChatEmojiPicker;
window.insertChatEmoji = insertChatEmoji;

// ── Picker emoji COMPLET (parité EmojiPicker QML, bible §11) ────────────────
// ~1070 émojis générés par plages Unicode stables (≤ 12.0 pour un rendu
// natif fiable iOS/Android/desktop — pas de police embarquée, contrairement
// au NotoColorEmoji du QML). Affichés en 2 sections : « Fréquents »
// (CHAT_EMOJIS, la liste historique) puis « Tous ».
var CHAT_EMOJIS_ALL = ["😀","😁","😂","😃","😄","😅","😆","😇","😈","😉","😊","😋","😌","😍","😎","😏","😐","😑","😒","😓","😔","😕","😖","😗","😘","😙","😚","😛","😜","😝","😞","😟","😠","😡","😢","😣","😤","😥","😦","😧","😨","😩","😪","😫","😬","😭","😮","😯","😰","😱","😲","😳","😴","😵","😶","😷","😸","😹","😺","😻","😼","😽","😾","😿","🙀","🙁","🙂","🙃","🙄","🙅","🙆","🙇","🙈","🙉","🙊","🙋","🙌","🙍","🙎","🙏","🤏","🤐","🤑","🤒","🤓","🤔","🤕","🤖","🤗","🤘","🤙","🤚","🤛","🤜","🤝","🤞","🤟","🤠","🤡","🤢","🤣","🤤","🤥","🤦","🤧","🤨","🤩","🤪","🤫","🤬","🤭","🤮","🤯","🤰","🤱","🤲","🤳","🤴","🤵","🤶","🤷","🤸","🤹","🤺","🤼","🤽","🤾","🤿","🥀","🥁","🥂","🥃","🥄","🥅","🥇","🥈","🥉","🥊","🥋","🥌","🥍","🥎","🥏","🥐","🥑","🥒","🥓","🥔","🥕","🥖","🥗","🥘","🥙","🥚","🥛","🥜","🥝","🥞","🥟","🥠","🥡","🥢","🥣","🥤","🥥","🥦","🥧","🥨","🥩","🥪","🥫","🥬","🥭","🥮","🥯","🥰","🥱","🥳","🥴","🥵","🥶","🥺","🥻","🥼","🥽","🥾","🥿","🦀","🦁","🦂","🦃","🦄","🦅","🦆","🦇","🦈","🦉","🦊","🦋","🦌","🦍","🦎","🦏","🦐","🦑","🦒","🦓","🦔","🦕","🦖","🦗","🦘","🦙","🦚","🦛","🦜","🦝","🦞","🦟","🦠","🦡","🦢","🦣","🦤","🦥","🦦","🦧","🦨","🦩","🦪","🦫","🦬","🦭","🦮","🦯","🦰","🦱","🦲","🦳","🦴","🦵","🦶","🦷","🦸","🦹","🦺","🦻","🦼","🦽","🦾","🦿","🧀","🧁","🧂","🧃","🧄","🧅","🧆","🧇","🧈","🧉","🧊","🧍","🧎","🧏","🧐","🧑","🧒","🧓","🧔","🧕","🧖","🧗","🧘","🧙","🧚","🧛","🧜","🧝","🧞","🧟","🧠","🧡","🧢","🧣","🧤","🧥","🧦","🧧","🧨","🧩","🧪","🧫","🧬","🧭","🧮","🧯","🧰","🧱","🧲","🧳","🧴","🧵","🧶","🧷","🧸","🧹","🧺","🧻","🧼","🧽","🧾","🧿","🌀","🌁","🌂","🌃","🌄","🌅","🌆","🌇","🌈","🌉","🌊","🌋","🌌","🌍","🌎","🌏","🌐","🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","🌙","🌚","🌛","🌜","🌝","🌞","🌟","🌠","🌡","🌢","🌣","🌤","🌥","🌦","🌧","🌨","🌩","🌪","🌫","🌬","🌭","🌮","🌯","🌰","🌱","🌲","🌳","🌴","🌵","🌶","🌷","🌸","🌹","🌺","🌻","🌼","🌽","🌾","🌿","🍀","🍁","🍂","🍃","🍄","🍅","🍆","🍇","🍈","🍉","🍊","🍋","🍌","🍍","🍎","🍏","🍐","🍑","🍒","🍓","🍔","🍕","🍖","🍗","🍘","🍙","🍚","🍛","🍜","🍝","🍞","🍟","🍠","🍡","🍢","🍣","🍤","🍥","🍦","🍧","🍨","🍩","🍪","🍫","🍬","🍭","🍮","🍯","🍰","🍱","🍲","🍳","🍴","🍵","🍶","🍷","🍸","🍹","🍺","🍻","🍼","🍽","🍾","🍿","🎀","🎁","🎂","🎃","🎄","🎅","🎆","🎇","🎈","🎉","🎊","🎋","🎌","🎍","🎎","🎏","🎐","🎑","🎒","🎓","🎔","🎕","🎖","🎗","🎘","🎙","🎚","🎛","🎜","🎝","🎞","🎟","🎠","🎡","🎢","🎣","🎤","🎥","🎦","🎧","🎨","🎩","🎪","🎫","🎬","🎭","🎮","🎯","🎰","🎱","🎲","🎳","🎴","🎵","🎶","🎷","🎸","🎹","🎺","🎻","🎼","🎽","🎾","🎿","🏀","🏁","🏂","🏃","🏄","🏅","🏆","🏇","🏈","🏉","🏊","🏋","🏌","🏍","🏎","🏏","🏐","🏑","🏒","🏓","🏔","🏕","🏖","🏗","🏘","🏙","🏚","🏛","🏜","🏝","🏞","🏟","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏧","🏨","🏩","🏪","🏫","🏬","🏭","🏮","🏯","🏰","🏱","🏲","🏳","🏴","🏵","🏶","🏷","🏸","🏹","🏺","🐀","🐁","🐂","🐃","🐄","🐅","🐆","🐇","🐈","🐉","🐊","🐋","🐌","🐍","🐎","🐏","🐐","🐑","🐒","🐓","🐔","🐕","🐖","🐗","🐘","🐙","🐚","🐛","🐜","🐝","🐞","🐟","🐠","🐡","🐢","🐣","🐤","🐥","🐦","🐧","🐨","🐩","🐪","🐫","🐬","🐭","🐮","🐯","🐰","🐱","🐲","🐳","🐴","🐵","🐶","🐷","🐸","🐹","🐺","🐻","🐼","🐽","🐾","🐿","👀","👁","👂","👃","👄","👅","👆","👇","👈","👉","👊","👋","👌","👍","👎","👏","👐","👑","👒","👓","👔","👕","👖","👗","👘","👙","👚","👛","👜","👝","👞","👟","👠","👡","👢","👣","👤","👥","👦","👧","👨","👩","👪","👫","👬","👭","👮","👯","👰","👱","👲","👳","👴","👵","👶","👷","👸","👹","👺","👻","👼","👽","👾","👿","💀","💁","💂","💃","💄","💅","💆","💇","💈","💉","💊","💋","💌","💍","💎","💏","💐","💑","💒","💓","💔","💕","💖","💗","💘","💙","💚","💛","💜","💝","💞","💟","💠","💡","💢","💣","💤","💥","💦","💧","💨","💩","💪","💫","💬","💭","💮","💯","💰","💱","💲","💳","💴","💵","💶","💷","💸","💹","💺","💻","💼","💽","💾","💿","📀","📁","📂","📃","📄","📅","📆","📇","📈","📉","📊","📋","📌","📍","📎","📏","📐","📑","📒","📓","📔","📕","📖","📗","📘","📙","📚","📛","📜","📝","📞","📟","📠","📡","📢","📣","📤","📥","📦","📧","📨","📩","📪","📫","📬","📭","📮","📯","📰","📱","📲","📳","📴","📵","📶","📷","📸","📹","📺","📻","📼","📽","📾","📿","🔀","🔁","🔂","🔃","🔄","🔅","🔆","🔇","🔈","🔉","🔊","🔋","🔌","🔍","🔎","🔏","🔐","🔑","🔒","🔓","🔔","🔕","🔖","🔗","🔘","🔙","🔚","🔛","🔜","🔝","🔞","🔟","🔠","🔡","🔢","🔣","🔤","🔥","🔦","🔧","🔨","🔩","🔪","🔫","🔬","🔭","🔮","🔯","🔰","🔱","🔲","🔳","🔴","🔵","🔶","🔷","🔸","🔹","🔺","🔻","🔼","🔽","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛","🕜","🕝","🕞","🕟","🕠","🕡","🕢","🕣","🕤","🕥","🕦","🕧","🕺","🖕","🖖","🖤","🗻","🗼","🗽","🗾","🗿","🚀","🚁","🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚋","🚌","🚍","🚎","🚏","🚐","🚑","🚒","🚓","🚔","🚕","🚖","🚗","🚘","🚙","🚚","🚛","🚜","🚝","🚞","🚟","🚠","🚡","🚢","🚣","🚤","🚥","🚦","🚧","🚨","🚩","🚪","🚫","🚬","🚭","🚮","🚯","🚰","🚱","🚲","🚳","🚴","🚵","🚶","🚷","🚸","🚹","🚺","🚻","🚼","🚽","🚾","🚿","🛀","🛁","🛂","🛃","🛄","🛅","🛋","🛌","🛍","🛎","🛏","🛐","🛑","🛒","🛴","🛵","🛶","🛷","🛸","🛹","🛺","☀️","☁️","☂️","☃️","☄️","☎️","☔️","☕️","☘️","☠️","☢️","☣️","☦️","☪️","☮️","☯️","☸️","☹️","☺️","♈️","♉️","♊️","♋️","♌️","♍️","♎️","♏️","♐️","♑️","♒️","♓️","♠️","♣️","♥️","♦️","♨️","♻️","⚠️","⚡️","⚪","⚫","⚽","⚾","⛄","⛅","⛎","⛔","⛪","⛲","⛳","⛴","⛵","⛺","⛽","✂️","✈️","✉️","✊","✋","✨","✳️","✴️","❄️","❇️","❌","❗","❤️","⭐"];


// Ouvre un panneau DIRECTEMENT en fenêtre flottante compacte, ancrée près de son
// bouton (sous, aligné à gauche ou à droite) — sur tous les appareils. Si une
// position a déjà été mémorisée, _enableFloating la restaure.
function _openFloatingNearBtn(panel, btn, opt, side) {
  if (!panel) return;
  opt = opt || {};
  var defW = opt.defW || 300;
  var r = btn ? btn.getBoundingClientRect() : null;
  if (r) {
    opt.defTop  = Math.round(r.bottom + 6);
    opt.defLeft = (side === 'right')
      ? Math.max(6, Math.round(r.right - defW))
      : Math.max(6, Math.round(r.left));
  }
  _enableFloating(panel, opt);
}

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
    _openFloatingNearBtn(panel, btn, { key:'pth_winpos_chat', handle: panel.querySelector('.g-chat-panel-header'), resizable:true, minW:240, minH:160, defW:300, defH:280, zoom:true }, 'left');
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
    // Draggable + resizable on desktop/tablet; fixed bottom-sheet on phones —
    // same window system as the chat / log / reaction panels.
    if (_winGate()) {
      _attachFloatControls(panel, { key: 'pth_winpos_music', handle: panel.querySelector('.music-panel-title'), resizable: true, minW: 260, minH: 200, defW: 320, defH: 300, zoom: true });
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

// ── Grille de réactions auto-adaptative (fenêtre flottante) ──
// Les 30 émojis restent TOUS visibles : à chaque redimensionnement on choisit
// le découpage colonnes × lignes qui maximise la taille de case carrée, puis
// on borne la case entre 32 px (en dessous → la grille défile, très petites
// fenêtres) et 84 px (au-delà → cases plafonnées et grille centrée). La taille
// des émojis suit la case via la variable CSS --react-cell.
function _fitReactGrid(panel){
  panel = panel || document.getElementById('g-reaction-panel');
  if (!panel) return;
  var grid = panel.querySelector('.react-grid');
  if (!grid) return;
  if (!panel.classList.contains('floating-win')){
    // Retour bandeau (resetWindows) : rendre la main aux règles CSS.
    grid.style.gridTemplateColumns=''; grid.style.gridAutoRows='';
    grid.style.gap=''; grid.style.justifyContent=''; grid.style.alignContent='';
    grid.style.removeProperty('--react-cell');
    return;
  }
  if (panel.style.display === 'none') return;
  var n = grid.querySelectorAll('.react-btn').length;
  if (!n) return;
  var GAP = 4, MIN = 32, MAX = 84;
  var W = grid.clientWidth, H = grid.clientHeight;
  if (W < MIN || H < MIN) return;
  var bestCols = 1, bestCell = 0;
  for (var cols = 1; cols <= n; cols++){
    var rows = Math.ceil(n / cols);
    var cell = Math.min((W - GAP*(cols-1))/cols, (H - GAP*(rows-1))/rows);
    if (cell > bestCell){ bestCell = cell; bestCols = cols; }
  }
  var cell = Math.floor(Math.max(MIN, Math.min(MAX, bestCell)));
  var rows = Math.ceil(n / bestCols);
  grid.style.gridTemplateColumns = 'repeat(' + bestCols + ', ' + cell + 'px)';
  grid.style.gridAutoRows = cell + 'px';
  grid.style.gap = GAP + 'px';
  grid.style.justifyContent = 'center';
  // Centré verticalement quand tout tient ; ancré en haut si ça défile.
  grid.style.alignContent = (rows*(cell+GAP)-GAP > H) ? 'start' : 'center';
  grid.style.setProperty('--react-cell', cell + 'px');
}

function toggleReactionPanel() {
  // Réactions actives partout, y compris pokerth.net : sendReaction() relaie
  // via la commande /emoji dans le chat de partie (interop web <-> Qt/QML).
  // L'ancien garde-fou _directWS masquait le bouton sur pokerth.net (régression).
  var panel = document.getElementById('g-reaction-panel');
  var btn   = document.getElementById('react-toggle-btn');
  if (!panel) return;
  var open = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = open ? 'flex' : 'none';
  if (open) { _applyReactMuteUI(); try { _applyReactPinUI(); } catch (e) {} }
  if (open) {
    // minW/minH relevés : au minimum de fenêtre, les 30 émojis tiennent encore
    // à la borne basse de case (32 px) sans défilement.
    _openFloatingNearBtn(panel, btn, { key:'pth_winpos_react', handle: panel.querySelector('.react-panel-title'), resizable:true, minW:280, minH:230, maxW:760, maxH:520, defW:330, defH:340 }, 'left');
    if (!panel._reactFitRO && typeof ResizeObserver !== 'undefined'){
      panel._reactFitRO = new ResizeObserver(function(){ _fitReactGrid(panel); });
      panel._reactFitRO.observe(panel);
    }
    _fitReactGrid(panel);
  }
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

// ── Panneau info unifié (parité QML GameInfoPanel) : le journal et le
// moniteur d'odds partagent UNE fenêtre à deux onglets Historique/Chances. ──
function gipShowTab(tab) {
  if (tab !== 'log' && tab !== 'odds' && tab !== 'stats') tab = 'log';
  var lb = document.getElementById('g-log-body'),
      ob = document.getElementById('g-odds-body'),
      sb = document.getElementById('g-stats-body');
  var tl = document.getElementById('gip-tab-log'),
      to = document.getElementById('gip-tab-odds'),
      ts = document.getElementById('gip-tab-stats');
  if (lb) lb.style.display = tab === 'log' ? '' : 'none';
  if (ob) ob.style.display = tab === 'odds' ? '' : 'none';
  if (sb) sb.style.display = tab === 'stats' ? '' : 'none';
  if (tl) tl.classList.toggle('gip-on', tab === 'log');
  if (to) to.classList.toggle('gip-on', tab === 'odds');
  if (ts) ts.classList.toggle('gip-on', tab === 'stats');
  // L'assistance (hand-strength) n'a de sens que sur l'onglet Historique.
  var asg = document.getElementById('gip-assist');
  try { localStorage.setItem('pth_gip_tab', tab); } catch (e) {}
  if (tab === 'odds') { try { if (typeof window._renderOdds === 'function') window._renderOdds(); } catch (e) {} }
  if (tab === 'stats') { try { if (typeof window._renderStats === 'function') window._renderStats(); } catch (e) {} }
  try { if (typeof window._gipAssistSync === 'function') window._gipAssistSync(); } catch (e) {}
}
window.gipShowTab = gipShowTab;
// Ouvre le panneau sur un onglet précis (Alt+L → Historique, Alt+I → Chances) :
// fermé → ouvre sur l'onglet ; ouvert sur l'autre onglet → bascule ;
// ouvert sur le même onglet → ferme (comportement toggle du QML).
function gipOpenTab(tab) {
  var panel = document.getElementById('g-log-panel');
  if (!panel) return;
  var cur = 'log';
  try { cur = localStorage.getItem('pth_gip_tab') === 'odds' ? 'odds' : 'log'; } catch (e) {}
  if (panel.style.display === 'none') { toggleLog(); gipShowTab(tab); }
  else if (cur !== tab) gipShowTab(tab);
  else toggleLog();
}
window.gipOpenTab = gipOpenTab;

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
    _openFloatingNearBtn(panel, btn, { key:'pth_winpos_log2', handle: panel.querySelector('.g-chat-panel-header'), resizable:true, minW:240, minH:140, defW: window.innerWidth >= 1400 ? 340 : 300, defH:300, zoom:true }, 'right');
    var lb = document.getElementById('g-log-body');
    if (lb) lb.scrollTop = 0; // le plus récent est en haut (liste inversée)
    // Restaurer le dernier onglet consulté (Historique par défaut).
    try { gipShowTab((function(){try{var _t=localStorage.getItem('pth_gip_tab');return (_t==='odds'||_t==='stats')?_t:'log';}catch(_e){return 'log';}})()); } catch (e) {}
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
  // 3-colonnes (≥900) : la liste joueurs est une colonne persistante → pas de toggle.
  if (window._lobby3IsWide && window._lobby3IsWide()) return;
  // Compact (Phase 1b) : slide-in intégré au lobby (plus d'overlay flottant).
  if (window._lobby3TogglePlayers) { window._lobby3TogglePlayers(); return; }
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

// Bascule du tri du panneau Joueurs (A–Z / pays), persistée.
window.setPlSort = function (m) {
  try { localStorage.setItem('pth_pl_sort', m === 'cc' ? 'cc' : 'az'); } catch (e) {}
  try { renderPlayersList(); } catch (e) {}
};
// Déroulant de tri (parité officielle) : 'az' / 'cc' = mode de tri ;
// 'idle' = bascule l'affichage des joueurs inactifs (hors partie), puis le
// select revient sur le tri courant.
window.plSortSelect = function (val) {
  if (['az','cc','idle'].indexOf(val) === -1) val = 'az';
  try { localStorage.setItem('pth_pl_mode', val); } catch (e) {}
  if (val === 'az' || val === 'cc') { try { localStorage.setItem('pth_pl_sort', val); } catch (e) {} } // compat
  try { renderPlayersList(); } catch (e) {}
};
// Icônes d'action par joueur (colonne Joueurs connectés) : ⊘ ignorer + 📊 stats.
// Monochromes (currentColor) pour suivre le thème, comme l'officiel.
var _PL_BAN_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/></svg>';
var _PL_BAR_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><rect x="4" y="12" width="4" height="8" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="16" y="3" width="4" height="17" rx="1"/></svg>';
// Manette : statut « en partie » (colonne dédiée). Allumée si le joueur joue.
var _PL_PAD_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.5 7h11a4 4 0 0 1 4 4v3.1A2.9 2.9 0 0 1 16.3 16l-1-1.4H8.7l-1 1.4A2.9 2.9 0 0 1 2.5 14.1V11a4 4 0 0 1 4-4Zm.5 3v1.5H5.5V13H7v1.5h1.5V13H10v-1.5H8.5V10H7Zm8.6.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm1.9-1.9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>';
// Bascule ignorer depuis la LISTE (léger : toggle + re-render, sans ouvrir le
// popup — contrairement à window._toggleIgnore qui est pour la carte joueur).
window._plToggleIgnore = function(pid){
  try {
    var nm = (window._readPlayers ? window._readPlayers()[pid] : null);
    if (!nm) return;
    _setIgnoredName(nm, !_isIgnored(nm));
    if (typeof renderPlayersList === 'function') renderPlayersList();
  } catch(e){}
};

// ── Colonnes masquables de la liste « Joueurs en ligne » ───────────────
// Le Nom est verrouillé (toujours visible) ; les autres colonnes sont
// activables/désactivables depuis l'en-tête (#pl-colhead). Choix persisté
// dans localStorage 'pth_pl_cols' = liste des colonnes MASQUÉES (une
// nouvelle colonne future est donc visible par défaut).
var _PL_TRACK = { av:'22px', name:'minmax(0,1fr)', status:'22px', flag:'48px', star:'16px', inv:'26px', acts:'48px' };
var _PL_COL_ORDER   = ['av','name','star','status','flag','inv','acts'];
var _PL_TOGGLE_COLS = ['av','status','flag','star','acts']; // 'name' et 'inv' exclus
// Colonne « Inviter à la partie » (parité PlayerListItem QML) : présente
// UNIQUEMENT sur la page d'attente de démarrage (s-lobby.lobby-waiting).
// Réutilise la mécanique du modal d'invitation : App._inviteEligiblePids()
// pour l'éligibilité et App.sendInvite(pid) pour l'envoi.
var _PL_INVITE_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M15 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 1.8c-3.5 0-6.3 1.8-6.3 4V19h12.6v-1.2c0-2.2-2.8-4-6.3-4ZM6 9V6.6H4.4V9H2v1.6h2.4V13H6v-2.4h2.4V9H6Z"/></svg>';
function _plWaitingMode() { var s = document.getElementById('s-lobby'); return !!(s && s.classList.contains('lobby-waiting')); }
function _plColOrder() { return _plWaitingMode() ? _PL_COL_ORDER : _PL_COL_ORDER.filter(function(k){ return k !== 'inv'; }); }
window._plInvite = function(pid){
  try { if (typeof App !== 'undefined' && App.sendInvite) App.sendInvite(pid); } catch(e) {}
  try { renderPlayersList(); } catch(e) {}
};
function _plColsHidden() {
  try { return new Set((localStorage.getItem('pth_pl_cols') || '').split(',').filter(Boolean)); }
  catch (e) { return new Set(); }
}
function _plColVisible(k) { return k === 'name' || !_plColsHidden().has(k); }
function _plVisibleCols() { return _PL_COL_ORDER.filter(_plColVisible); }
window._plToggleCol = function (k) {
  if (_PL_TOGGLE_COLS.indexOf(k) === -1) return;
  try {
    var h = _plColsHidden();
    if (h.has(k)) h.delete(k); else h.add(k);
    localStorage.setItem('pth_pl_cols', Array.from(h).join(','));
  } catch (e) {}
  try { renderPlayersList(); } catch (e) {}
};
// Icônes de l'en-tête colonnes (monochromes, suivent le thème via currentColor).
var _PL_PERSON_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 1.6c-4 0-7.2 2-7.2 4.6V20h14.4v-1.8c0-2.6-3.2-4.6-7.2-4.6Z"/></svg>';
var _PL_FLAG_SVG   = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M6 21V4h11l-2.2 4L17 12H6"/></svg>';
// En-tête : une pastille-toggle par colonne masquable (icône + libellé en info-bulle).
// En-tête aligné sur les colonnes : une cellule par colonne (dans l'ordre de
// _PL_COL_ORDER), gabarit = gabarit COMPLET (toutes les colonnes masquables
// toujours présentes → les pastilles restent cliquables même une fois la
// colonne masquée). Le Nom = cellule vide (verrouillé, pas de pastille). Les
// pastilles remplissent leur cellule (width:100%) donc s'élargissent avec la
// colonne. En tout-visible, ce gabarit = --pl-cols des lignes → alignement 1:1.
function _plColHeadHtml() {
  var _tt = function (k, fb) { return (typeof t === 'function' && t(k) !== k) ? t(k) : fb; };
  var NAME_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="8" x2="19" y2="8"/><line x1="5" y1="12" x2="15" y2="12"/><line x1="5" y1="16" x2="17" y2="16"/></svg>';
  var ICON  = { av:_PL_PERSON_SVG, name:NAME_SVG, status:_PL_PAD_SVG, flag:_PL_FLAG_SVG, star:'<span class="pl-colh-star">\u2605</span>', inv:_PL_INVITE_SVG, acts:_PL_BAR_SVG };
  var LABEL = { av:_tt('plColAvatar','Avatar'), name:_tt('plColName','Name'), status:_tt('plColStatus','In game'), flag:_tt('plColCountry','Country'), star:_tt('plColMe','Me'), inv:_tt('inviteBtn','Invite'), acts:_tt('plColActions','Actions') };
  return _plColOrder().map(function (k) {
    if (k === 'name' || k === 'inv') {
      // Fausse pastille : colonne Nom toujours visible (non togglable),
      // même apparence carrée en état "on" mais non cliquable.
      return '<span class="pl-colh-chip on pl-colh-lock" title="' + LABEL[k] + '" aria-label="' + LABEL[k] + '">' + ICON[k] + '</span>';
    }
    var on = _plColVisible(k);
    return '<button type="button" class="pl-colh-chip' + (on ? ' on' : '') + '"'
      + ' title="' + LABEL[k] + '" aria-label="' + LABEL[k] + '" aria-pressed="' + on + '"'
      + ' onclick="window._plToggleCol(\'' + k + '\')">' + ICON[k] + '</button>';
  }).join('');
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
  // ── En-tête colonnes + gabarit de grille ──
  // rowHtml n'émet que les cellules visibles ; --pl-cols (posé sur la liste)
  // donne aux .pl-row le gabarit réduit correspondant → pas de piste vide.
  // L'en-tête (sticky, dans le corps scrollable pour partager exactement la
  // même largeur/gouttière que les lignes) utilise le gabarit COMPLET afin de
  // rester cliquable colonne masquée ou non ; en tout-visible les deux
  // gabarits coïncident → pastilles alignées 1:1 sur les colonnes.
  var _visCols = _plVisibleCols();
  var _fullTmpl = _plColOrder().map(function (k) { return _PL_TRACK[k]; }).join(' ');
  var _headHtml = '<div class="pl-colhead" style="grid-template-columns:' + _fullTmpl + '">'
                + _plColHeadHtml() + '</div>';
  try { body.style.setProperty('--pl-cols', _fullTmpl); } catch (e) {}
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
  // Déduplication de MON pseudo : le serveur peut lister plusieurs pids en
  // ligne portant exactement mon nom (fantôme d'une session précédente pas
  // encore purgée). On ne garde que MA session (marquée isMe / ★) et on retire
  // les homonymes. N'affecte pas les autres joueurs entre eux.
  (function(){
    var _mine = (myId && nameMap[myId] && String(nameMap[myId]).charAt(0) !== '#') ? nameMap[myId] : null;
    if (_mine) rows = rows.filter(function(r){ return r.isMe || r.name !== _mine; });
  })();
  // Filter by search input
  var q = (document.getElementById('players-search-in') || {}).value || '';
  q = q.toLowerCase().trim();
  if (q) rows = rows.filter(function(r) { return r.name.toLowerCase().includes(q); });
  // Tri : A–Z ou par pays (parité tri joueurs QML, bible §16) — je me
  // classe comme tout le monde selon le filtre actif (plus d'épinglage en
  // tête ; ★ suffit à me repérer). Persistant (pth_pl_sort) ; sans-pays en dernier.
  // Mode unique (single-select, parité officielle) : 'az' (alpha, tous) ·
  // 'cc' (par pays, tous) · 'idle' (n'affiche QUE les joueurs inactifs).
  var _plMode = 'az';
  try { _plMode = localStorage.getItem('pth_pl_mode') || localStorage.getItem('pth_pl_sort') || 'az'; } catch (e) {}
  if (['az','cc','idle'].indexOf(_plMode) === -1) _plMode = 'az';
  var _plSort = (_plMode === 'cc') ? 'cc' : 'az';
  rows.sort(function(a, b) {
    if (_plSort === 'cc') {
      // Codes pays via le pont App.getLobbyState().countries (la variable
      // _playerCountries vit dans l'IIFE App, inaccessible d'ici).
      var _ccs = (_ls && _ls.countries) || {};
      var ca = (_ccs[a.pid] || '\uffff');
      var cb = (_ccs[b.pid] || '\uffff');
      if (ca !== cb) return ca < cb ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  try {
    var _bAz = document.getElementById('pls-az'), _bCc = document.getElementById('pls-cc');
    if (_bAz) _bAz.classList.toggle('active', _plSort !== 'cc');
    if (_bCc) _bCc.classList.toggle('active', _plSort === 'cc');
  } catch (e) {}
  if (countEl) countEl.textContent = pids.length;
  if (rows.length === 0) {
    body.innerHTML = _headHtml + '<div class="pl-empty">' + (q ? '— ' : '—') + '</div>';
    return;
  }
  // ── Variante A : sections « En partie / Au lobby » (choix utilisateur
  // sur maquette). L'activité est calculée UNE fois par joueur, chaque
  // groupe garde le tri (moi d'abord, puis alphabétique) et la recherche
  // filtre les deux sections. Headers affichés seulement si les deux
  // groupes sont non vides (sinon liste plate, rien à séparer). ──
  rows.forEach(function(r) {
    r.act = (typeof window._playerActivity === 'function') ? window._playerActivity(r.pid) : '';
  });
  var _inGame = rows.filter(function(r) { return r.act; });
  var _atLobby = rows.filter(function(r) { return !r.act; });
  // Éligibilité d'invitation (page d'attente uniquement) : même source que le
  // modal (App._inviteEligiblePids) -> exclut moi et les joueurs déjà à ma table.
  var _invMode = _plWaitingMode() && (typeof App !== 'undefined') && App._inviteEligiblePids;
  var _invElig = {};
  if (_invMode) { try { App._inviteEligiblePids().forEach(function(p){ _invElig[p] = 1; }); } catch(e) { _invMode = false; } }
  var rowHtml = function(r) {
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
    // Pour MOI : appeler openPlayerInfoPopup() SANS argument → exactement la
    // même fenêtre que le bouton joueur du header. Pour les autres : avec pid.
    var _ppArg = r.isMe ? '' : String(r.pid);
    var nameHtml = '<span class="pl-name-link" role="button" tabindex="0"'
      + ' onclick="window.openPlayerInfoPopup(' + _ppArg + ')"'
      + ' onkeydown="if(event.key===\'Enter\')window.openPlayerInfoPopup(' + _ppArg + ')">'
      + esc(r.name) + '</span>';
    // Statut « en partie » : une seule manette dans sa colonne (allumée si le
    // joueur est dans une partie, éteinte sinon). Plus de nom de partie sous le pseudo.
    var _status = '<span class="pl-status' + (r.act ? ' on' : '') + '" title="' + (r.act ? esc(r.act) : _tt('plNotPlaying','Not playing')) + '"' + (r.act ? '' : ' data-i18n-title="plNotPlaying"') + '>' + _PL_PAD_SVG + '</span>';
    var _ign  = _isIgnored(r.name);
    var _acts = '<span class="pl-acts">'
      + '<button type="button" class="pl-act pl-act-ban' + (_ign ? ' on' : '') + '" title="' + _tt('plIgnore','Ignore') + '" data-i18n-title="plIgnore" aria-label="' + _tt('plIgnore','Ignore') + '" onclick="event.stopPropagation();window._plToggleIgnore(' + r.pid + ')">' + _PL_BAN_SVG + '</button>'
      + '<button type="button" class="pl-act pl-act-stats" title="' + _tt('plStats','Stats') + '" data-i18n-title="plStats" aria-label="' + _tt('plStats','Stats') + '" onclick="event.stopPropagation();window._plOpenStats(' + _ppArg + ')">' + _PL_BAR_SVG + '</button>'
      + '</span>';
    var _plCell = function (k) {
      switch (k) {
        case 'av':     return avChip;
        case 'name':   return '<span class="pl-name">' + nameHtml + '</span>';
        case 'status': return _status;
        case 'flag':   return '<span class="pl-flag">' + flag + (cc ? '<span class="pl-cc">' + cc + '</span>' : '') + '</span>';
        case 'star':   return '<span class="pl-star">' + (r.isMe ? '★' : '') + '</span>';
        case 'inv': {
          if (!_invMode || !_invElig[r.pid]) return '<span class="pl-cell-off"></span>';
          var _sent = (typeof App.inviteSentTo === 'function') && App.inviteSentTo(r.pid);
          return _sent
            ? '<span class="pl-act pl-act-inv sent" title="' + _tt('inviteSent','Invited') + '">' + _PL_INVITE_SVG + '</span>'
            : '<button type="button" class="pl-act pl-act-inv" title="' + _tt('inviteBtn','Invite') + '" aria-label="' + _tt('inviteBtn','Invite') + '" onclick="event.stopPropagation();window._plInvite(' + r.pid + ')">' + _PL_INVITE_SVG + '</button>';
        }
        case 'acts':   return _acts;
      }
      return '';
    };
    // Colonnes masquées : cellule VIDE (la piste reste présente) plutôt que
    // retirée → les colonnes restent alignées sous leurs pastilles quel que
    // soit l'état des toggles (l'en-tête utilise aussi le gabarit complet).
    return '<div class="pl-row' + (r.isMe ? ' pl-me' : '') + '">'
      + _plColOrder().map(function (k) { return _plColVisible(k) ? _plCell(k) : '<span class="pl-cell-off"></span>'; }).join('')
      + '</div>';
  };
  var _tt = function(k, fb) { return (typeof t === 'function' && t(k) !== k) ? t(k) : fb; };
  // Synchronise la valeur du déroulant sur le mode courant.
  try {
    var _sortSel = document.getElementById('pl-sort-select');
    if (_sortSel) _sortSel.value = _plMode;
  } catch (e) {}
  // Liste À PLAT (parité officielle). Mode 'idle' → n'affiche QUE les joueurs
  // inactifs (hors partie) ; sinon tous les joueurs, dans l'ordre de tri.
  var _shown = (_plMode === 'idle') ? rows.filter(function(r){ return !r.act; }) : rows;
  body.innerHTML = _headHtml + (_shown.length ? _shown.map(rowHtml).join('') : '<div class="pl-empty">—</div>');
}

/* ── Page Privacy in-app (même entête cp-header que les autres écrans) ── */
;(function(){
  function $(id){ return document.getElementById(id); }
  window.openPrivacyPage = function(){
    var p = $('privacy-page'); if (!p) return;
    p.style.display = 'flex';
  };
  window.closePrivacyPage = function(){
    window.closePrivacyOverflow();
    var p = $('privacy-page'); if (p) p.style.display = 'none';
  };
  window.togglePrivacyOverflow = function(e){
    if (e) e.stopPropagation();
    var m = $('pv-overflow-menu'); if (m) m.classList.toggle('open');
  };
  window.closePrivacyOverflow = function(){
    var m = $('pv-overflow-menu'); if (m) m.classList.remove('open');
  };
  document.addEventListener('click', function(e){
    var m = $('pv-overflow-menu'), b = $('pv-overflow-btn');
    if (m && m.classList.contains('open') && !m.contains(e.target) && e.target !== b && !(b && b.contains(e.target))) m.classList.remove('open');
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { var p = $('privacy-page'); if (p && p.style.display === 'flex') window.closePrivacyPage(); }
  });
})();

/* ── Page « À propos de PokerTH » (parité AboutPage QML) ── */
;(function(){
  function $(id){ return document.getElementById(id); }
  window.openAboutPage = function(){
    var p = $('about-page'); if (!p) return;
    p.style.display = 'flex';
    var v = $('ab-version');
    if (v) v.textContent = 'PokerTH Web Client ' + (window.BUILD_VERSION || '');
    window.abShowTab(0);
  };
  window.closeAboutPage = function(){ var p = $('about-page'); if (p) p.style.display = 'none'; };
  window.abShowTab = function(i){
    for (var k = 0; k < 5; k++) {
      var tb = $('ab-tab-' + k), pn = $('ab-pane-' + k);
      if (tb) tb.classList.toggle('active', k === i);
      if (pn) pn.style.display = (k === i) ? 'block' : 'none';
    }
  };
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { var p = $('about-page'); if (p && p.style.display !== 'none' && p.style.display !== '') window.closeAboutPage(); }
  });
})();

// ── Dropdown custom « Type de partie » (parité QML StyledCombo) ──────────────
// Le <select id="cf-game-type"> natif reste la source de vérité (caché) : tous
// les lecteurs/écrivains existants (sv/svv/set/setVal) continuent de marcher.
// Ce bloc ne fait que refléter sa valeur dans une UI à icônes (champ + liste).
;(function(){
  var sel  = document.getElementById('cf-game-type');
  var btn  = document.getElementById('cf-gtype-btn');
  var ico  = document.getElementById('cf-gtype-ico');
  var lbl  = document.getElementById('cf-gtype-lbl');
  var list = document.getElementById('cf-gtype-list');
  if (!sel || !btn || !ico || !lbl || !list) return;
  var KEY = { '1':'gameNormal', '2':'gameRegistered', '3':'gameInvite', '4':'gameRanking' };
  function refresh() {
    var v = String(sel.value || '1');
    if (!KEY[v]) v = '1';
    ico.className = 'gt-dd-ico gt-ico-' + v;
    lbl.setAttribute('data-i18n', KEY[v]);
    // Libellé : t() si dispo, sinon le texte de l'option native (déjà
    // traduite par la passe data-i18n-opt, ou l'anglais par défaut).
    var opt = sel.querySelector('option[value="' + v + '"]');
    lbl.textContent = (typeof window.t === 'function' && window.t(KEY[v]) !== KEY[v])
      ? window.t(KEY[v])
      : (opt ? opt.textContent : v);
    var items = list.children;
    for (var i = 0; i < items.length; i++)
      items[i].classList.toggle('sel', items[i].getAttribute('data-val') === v);
  }
  function close() { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = list.hidden;
    list.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) refresh();
  });
  list.addEventListener('click', function(e) {
    var it = e.target.closest('.gt-dd-item');
    if (!it) return;
    sel.value = it.getAttribute('data-val');
    sel.dispatchEvent(new Event('input'));
    sel.dispatchEvent(new Event('change'));
    refresh(); close();
  });
  document.addEventListener('click', function(e) {
    if (!list.hidden && !e.target.closest('#cf-gtype-dd')) close();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !list.hidden) close();
  });
  // set()/setVal() dispatchent 'input' sur le select → on suit, et on
  // resynchronise les contraintes QML (verrous classé, mot de passe…).
  function syncConstraints() {
    try { if (typeof App !== 'undefined' && App._syncGameTypeConstraints) App._syncGameTypeConstraints(); } catch (e) {}
  }
  sel.addEventListener('input',  function() { refresh(); syncConstraints(); });
  sel.addEventListener('change', function() { refresh(); syncConstraints(); });
  window._gtypeDdRefresh = refresh;
  refresh();
  // Erreur « nom requis » (parité QML nameError) : effacée dès la saisie.
  var nameEl = document.getElementById('cf-name');
  var nameErr = document.getElementById('cf-name-err');
  if (nameEl && nameErr) nameEl.addEventListener('input', function() {
    if (nameEl.value.trim().length > 0) nameErr.style.display = 'none';
  });
})();

;(function(){ window.BUILD_VERSION='0.3.855-beta'; try{ var b=document.getElementById('cf-build'); if(b) b.textContent='\u00b7 build '+window.BUILD_VERSION; }catch(e){} })();

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

/* ═══ Lobby responsive v2 — parité QML LobbyPage (Phase 1b) ═══
   Reparente les panneaux dans la grille, gère les poignées de resize (wide,
   voisins qui suivent), le chat intégré + slide-in Joueurs/Infos (compact),
   et la barre du bas. Purement additif. */
;(function lobby3col(){
  function W(){ try { return window.matchMedia('(min-width:900px)').matches; } catch(e){ return false; } }
  function grid(){ return document.querySelector('#s-lobby .lobby-grid'); }
  function sLobby(){ return document.getElementById('s-lobby'); }

  function reparent(){
    var g=grid(); if(!g) return;
    var pp=document.getElementById('players-panel');
    var cp=document.getElementById('lobby-chat-panel');
    if(pp && pp.parentNode!==g) g.appendChild(pp);
    if(cp && cp.parentNode!==g) g.appendChild(cp);
  }

  /* ── Barre du haut : recherche joueur (gauche) + filtre parties (droite),
        pleine largeur au-dessus des 3 colonnes — parité LobbyPage officielle. ── */
  function ensureTopbar(){
    var lb=document.querySelector('#s-lobby .lobby-body'), g=grid();
    if(!lb || !g) return;
    var tb=lb.querySelector('.lobby-topbar');
    if(!tb){ tb=document.createElement('div'); tb.className='lobby-topbar'; lb.insertBefore(tb, g); }
    var filt=document.getElementById('g-filter-bar');
    if(filt && filt.parentNode!==tb) tb.appendChild(filt);
  }
  // Recherche joueur : dans la barre du haut en wide (à gauche du filtre),
  // dans le panneau Joueurs en compact (parité officielle).
  function placeSearch(){
    var srch=document.querySelector('.players-search');
    var tb=document.querySelector('#s-lobby .lobby-topbar');
    var pp=document.getElementById('players-panel');
    var list=document.getElementById('players-list-body');
    if(!srch) return;
    if(W()){ if(tb && srch.parentNode!==tb) tb.insertBefore(srch, tb.firstChild); }
    else { if(pp && list && srch.parentNode!==pp) pp.insertBefore(srch, list); }
  }
  // Barre du bas (Joueur + Créer) : sous la colonne Parties en wide (largeur =
  // colonne centrale), tout en bas pleine largeur en compact.
  function placeFootbar(){
    var fb=document.querySelector('#s-lobby .lobby-footbar');
    var lb=document.querySelector('#s-lobby .lobby-body');
    var games=document.querySelector('#s-lobby .lobby-grid > .games-col');
    var stats=document.getElementById('lobby-statsbar');
    if(!fb) return;
    if(W()){
      var grid=document.querySelector('#s-lobby .lobby-grid');
      if(grid && fb.parentNode!==grid) grid.appendChild(fb);
    } else {
      if(lb && fb.parentNode!==lb){
        if(stats && stats.parentNode===lb) lb.insertBefore(fb, stats);
        else lb.appendChild(fb);
      }
    }
  }

  /* ── Poignées de redimensionnement (wide) ── */
  var MINC=280, MINL=160, MINR=200, MININFO=120, HW=12;
  function ensureHandles(){
    var g=grid(); if(!g) return;
    ['l','r','v'].forEach(function(k){
      if(g.querySelector('.lob-h-'+k)) return;
      var h=document.createElement('div');
      h.className='lob-h lob-h-'+k; h.dataset.lobh=k;
      h.addEventListener('pointerdown', startDrag);
      g.appendChild(h);
    });
    if(!g.querySelector('.lob-hm')){
      var hm=document.createElement('div');
      hm.className='lob-hm'; hm.dataset.lobh='m';
      hm.addEventListener('pointerdown', startDrag);
      g.appendChild(hm);
    }
    try{
      var L=localStorage.getItem('pth_lob_l'), R=localStorage.getItem('pth_lob_r'), I=localStorage.getItem('pth_lob_info'), M=localStorage.getItem('pth_lob_mgames');
      if(L) g.style.setProperty('--lc-l', parseInt(L,10)+'px');
      if(R) g.style.setProperty('--lc-r', parseInt(R,10)+'px');
      if(I) g.style.setProperty('--lc-info', parseInt(I,10)+'px');
      if(M) g.style.setProperty('--m-games-h', parseInt(M,10)+'px');
    }catch(e){}
  }
  function startDrag(e){
    var k=e.currentTarget.dataset.lobh;
    // Poignées l/r/v = wide uniquement ; poignée m = compact uniquement.
    if(k==='m'){ if(W()) return; } else { if(!W()) return; }
    var g=grid(); if(!g) return;
    var gr=g.getBoundingClientRect(), self=e.currentTarget;
    self.classList.add('drag');
    try{ self.setPointerCapture(e.pointerId); }catch(_){}
    function move(ev){
      if(k==='l'){
        var maxL=gr.width - MINC - MINR - 2*HW;
        g.style.setProperty('--lc-l', Math.round(Math.max(MINL, Math.min(ev.clientX-gr.left, maxL)))+'px');
      } else if(k==='r'){
        var maxR=gr.width - MINC - MINL - 2*HW;
        g.style.setProperty('--lc-r', Math.round(Math.max(MINR, Math.min(gr.right-ev.clientX, maxR)))+'px');
      } else if(k==='v'){
        var maxI=gr.height - MININFO - HW;
        g.style.setProperty('--lc-info', Math.round(Math.max(MININFO, Math.min(ev.clientY-gr.top, maxI)))+'px');
      } else { // 'm' : hauteur des Tables en compact (le Chat remplit le reste)
        var maxM=gr.height - 130 - 16;
        g.style.setProperty('--m-games-h', Math.round(Math.max(120, Math.min(ev.clientY-gr.top, maxM)))+'px');
      }
    }
    function up(){
      self.classList.remove('drag');
      document.removeEventListener('pointermove',move,true);
      document.removeEventListener('pointerup',up,true);
      try{
        var cs=getComputedStyle(g);
        if(k==='m'){
          localStorage.setItem('pth_lob_mgames', parseInt(cs.getPropertyValue('--m-games-h'))||0);
        } else {
          localStorage.setItem('pth_lob_l', parseInt(cs.getPropertyValue('--lc-l'))||240);
          localStorage.setItem('pth_lob_r', parseInt(cs.getPropertyValue('--lc-r'))||300);
          localStorage.setItem('pth_lob_info', parseInt(cs.getPropertyValue('--lc-info'))||220);
        }
      }catch(_){}
    }
    document.addEventListener('pointermove',move,true);
    document.addEventListener('pointerup',up,true);
    e.preventDefault();
  }

  /* ── Slide-in mobile (Joueurs / Infos) + scrim ── */
  function ensureScrim(){
    var s=sLobby(); if(!s) return null;
    var sc=s.querySelector('.lob-scrim');
    if(!sc){ sc=document.createElement('div'); sc.className='lob-scrim';
      sc.addEventListener('click', closeSlide); s.appendChild(sc); }
    return sc;
  }
  function setScrim(on){ var sc=ensureScrim(); if(sc) sc.classList.toggle('on', !!on && !W()); }
  function closeSlide(){ var s=sLobby(); if(s) s.classList.remove('pl-open','gi-open'); setScrim(false); }
  function togglePlayers(){
    if(W()) return;
    var s=sLobby(); if(!s) return;
    var open=!s.classList.contains('pl-open');
    s.classList.toggle('pl-open', open); s.classList.remove('gi-open');
    setScrim(open);
    if(open){ try{renderPlayersList();}catch(e){} var inp=document.getElementById('players-search-in'); if(inp) setTimeout(function(){inp.focus();},60); }
  }
  function openInfo(){
    if(W()) return;
    var s=sLobby(); if(!s) return;
    s.classList.add('gi-open'); s.classList.remove('pl-open'); setScrim(true);
  }

  function sync(){
    var pp=document.getElementById('players-panel');
    var cp=document.getElementById('lobby-chat-panel');
    var lb=document.querySelector('#s-lobby .lobby-body');
    if(pp) pp.style.display='flex';   // placement géré par le CSS (grille wide / slide-in compact)
    if(cp) cp.style.display='flex';
    if(lb) lb.style.paddingTop='';
    placeSearch();
    placeFootbar();
    if(W()) closeSlide();             // pas de slide-in résiduel en wide
    try{ renderPlayersList(); }catch(e){}
  }
  function foot(){
    var nm=(typeof myName!=='undefined' && myName)?myName:'';
    var el=document.getElementById('lobby-foot-name');
    if(el) el.textContent=nm||'—';
    var av=document.getElementById('lobby-foot-av');
    if(av){
      if(nm && typeof window._avatarChipHtml==='function'){
        var mid=(typeof window._readMyId==='function')?window._readMyId():0;
        av.innerHTML=window._avatarChipHtml(mid, nm, 'pl-av');
      } else av.innerHTML='';
    }
  }
  function boot(){ reparent(); ensureTopbar(); ensureHandles(); ensureScrim(); sync(); foot(); }
  if(document.readyState!=='loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
  var _rt;
  window.addEventListener('resize', function(){ clearTimeout(_rt); _rt=setTimeout(sync,120); });

  window._lobby3Foot         = foot;
  window._lobby3IsWide       = W;
  window._lobby3Sync         = sync;
  window._lobby3TogglePlayers= togglePlayers;
  window._lobby3OpenInfo     = openInfo;
  window._lobby3CloseSlide   = closeSlide;
})();
