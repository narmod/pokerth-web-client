// ── keynav.mjs — Escape = annuler/fermer, Enter = valider (opt-in) ──────────
//
// Parité QML : « Global (mainWindow) : Escape, Back (Android), Alt+S »
// (bible 2.1.4 §6). Escape est donc actif PARTOUT, écran de jeu compris, où il
// ferme les surfaces ouvertes par-dessus la table (chat, log, menus, popups)
// sans jamais toucher au jeu lui-même : s'il n'y a rien d'ouvert, il ne se
// passe rien — on ne quitte JAMAIS une partie sur un appui d'Escape.
//
// Escape annule, donc il est toujours sûr. Enter valide, donc il est en
// OPT-IN STRICT : seul un bouton portant data-kn-primary est déclenché, et
// aucun dialogue destructif (quitter, déconnexion, kick, ban, signalement)
// n'en porte. Aucune heuristique ne devine l'action primaire d'un dialogue.
//
// Option : « pth_keynav » (Interface → Raccourcis clavier), activée par défaut.

// Surfaces fermables, DANS L'ORDRE DE PRIORITÉ : la première visible gagne.
// Les confirmations passent avant le dialogue qui les a ouvertes, sinon
// Escape fermerait le parent en laissant la confirmation orpheline.
// Chaque action a été relevée sur le bouton d'annulation réel de la surface.
const SURFACES = [
  // — confirmations (toujours en tête) —
  ['kick-confirm-modal',   'App.cancelKickConfirm'],
  ['report-confirm-modal', 'App.cancelReportGame'],
  ['leave-dialog',         'App.cancelLeaveGame'],
  ['disconnect-dialog',    'App.cancelDisconnect'],
  ['quick-create-dialog',  'App.cancelQuickCreate'],
  // — menus contextuels / overflow —
  ['g-overflow-menu',      'closeHeaderOverflow'],
  ['l-overflow-menu',      'closeLobbyOverflow'],
  ['cr-overflow-menu',     'closeCreateOverflow'],
  ['connect-overflow-menu', 'closeConnectOverflow'],
  ['pv-overflow-menu',     'closePrivacyOverflow'],
  // — modales —
  ['invite-modal',         'App.closeInviteModal'],
  ['kick-modal',           'App.closeKickModal'],
  ['player-info-modal',    'closePlayerInfoPopup'],
  ['game-info-modal',      'closeGameInfoPopup'],
  ['ranking-modal',        'closeRankingModal'],
  ['tableranking-modal',   'closeTableRanking'],
  ['avatar-popup',         'toggleAvatarPopup'],
  ['install-popup',        'pwaInstallClose'],
  ['adv-modal',            'closeAdvancedOptions'],
  ['help-modal',           'closeHelp'],
  ['poll-modal',           'closePollModal'],
  ['about-page',           'closeAboutPage'],
  ['privacy-page',         'closePrivacyPage'],
  // Fin de partie : Escape la ferme et on reste à la table (endGameClose),
  // comme gameOverPopup du QML (b170786) — jamais « retour au lobby ».
  ['g-endgame-overlay',    'App.endGameClose'],
  // — panneaux flottants —
  ['hands-overlay',        'toggleHandsHelp'],
  ['music-panel',          'toggleMusicPanel'],
  ['g-reaction-panel',     'toggleReactionPanel'],
  ['g-log-panel',          'toggleLog'],
  ['g-chat-panel',         'toggleGameChat'],
  ['g-winner-overlay',     'App.dismissWinner'],
  // — étapes de page (dernier recours) —
  // Formulaire de connexion → choix du mode : le handleBack() du QML
  // (ServerConnectionDialog, b170786), pour Escape comme pour Retour Android.
  ['login-step2',          'loginBackToStep1']
];

// Surfaces volontairement ABSENTES : #lobby-chat-panel et #players-panel sont
// des colonnes intégrées au lobby (pas des overlays) — Escape ne doit pas les
// replier ; les panneaux emoji n'exposent aucune fermeture fiable.

const REG = [];   // surfaces enregistrées à chaud : {el, close}

function _enabled() {
  try { return localStorage.getItem('pth_keynav') !== '0'; } catch (e) { return true; }
}

function _visible(el) {
  if (!el) return false;
  if (el.hidden) return false;
  var st;
  try { st = window.getComputedStyle(el); } catch (e) { return false; }
  if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return false;
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// 'App.cancelKickConfirm' → la fonction, si elle existe à l'instant T.
function _resolve(path) {
  var cur = window;
  var parts = path.split('.');
  for (var i = 0; i < parts.length; i++) {
    if (cur == null) return null;
    cur = cur[parts[i]];
  }
  return (typeof cur === 'function') ? cur : null;
}

// Surface ouverte la plus prioritaire, ou null.
function _topSurface() {
  for (var i = REG.length - 1; i >= 0; i--) {          // les plus récentes d'abord
    if (_visible(REG[i].el)) return REG[i];
  }
  for (var j = 0; j < SURFACES.length; j++) {
    var el = document.getElementById(SURFACES[j][0]);
    if (!_visible(el)) continue;
    var fn = _resolve(SURFACES[j][1]);
    if (fn) return { el: el, close: fn };
  }
  return null;
}

// Un champ de saisie a-t-il le focus ? (Enter y a déjà un sens)
function _inEditable(t) {
  if (!t) return false;
  var tag = (t.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'select' || tag === 'button' || tag === 'a') return true;
  if (tag === 'input') {
    var ty = (t.type || 'text').toLowerCase();
    return ty !== 'checkbox' && ty !== 'radio';   // Enter y vaut déjà submit/rien
  }
  return t.isContentEditable === true;
}

function _onKey(e) {
  if (!_enabled()) return;
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  if (_tabsKey(e)) return;

  if (e.key === 'Escape') {
    var s = _topSurface();
    if (!s) return;                       // rien d'ouvert → on laisse passer
    try { s.close(); } catch (err) { return; }
    e.preventDefault();
    e.stopPropagation();                  // évite la double fermeture des
    return;                               // surfaces qui gèrent déjà Escape
  }

  if (e.key === 'Enter') {
    if (e.shiftKey || e.isComposing) return;
    if (_formDefault(e)) return;
    if (_inEditable(e.target)) return;
    var s2 = _topSurface();
    if (!s2 || !s2.el) return;
    var btn = s2.el.querySelector('[data-kn-primary]');
    if (!btn || btn.disabled || !_visible(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    btn.click();
  }
}

// ── Liste d'onglets au clavier — parité QML b170786 (SettingsPage) ─────────
// Catégories des réglages : « keyNavigationEnabled », les flèches changent
// de catégorie et le contenu suit (showCategory). Ici un conteneur
// data-kn-tabs de boutons role="tab" : flèches (les deux axes, la liste est
// verticale sur grand écran et horizontale en compact), Début / Fin ; le
// bouton atteint reçoit le focus et est cliqué. Onglets désactivés sautés.
const TAB_KEYS = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, Home: 'first', End: 'last' };
function _tabsKey(e) {
  var step = TAB_KEYS[e.key];
  if (!step || e.shiftKey) return false;
  var tg = e.target;
  if (!tg || tg.getAttribute('role') !== 'tab') return false;
  var box = tg.closest ? tg.closest('[data-kn-tabs]') : null;
  if (!box) return false;
  var tabs = Array.prototype.filter.call(box.querySelectorAll('[role="tab"]'), function (b) {
    return !b.disabled && !b.hasAttribute('disabled') && _visible(b);
  });
  var i = tabs.indexOf(tg);
  if (i < 0 || !tabs.length) return false;
  var j = step === 'first' ? 0 : step === 'last' ? tabs.length - 1
        : Math.max(0, Math.min(tabs.length - 1, i + step));
  e.preventDefault();
  e.stopPropagation();
  if (j === i) return true;
  try { tabs[j].focus({ preventScroll: true }); } catch (err) {}
  tabs[j].click();
  return true;
}

// ── Zone de lecture — parité QML b170786 (About, ForumPost, fiche joueur) ──
// Le QML met le focus sur le défilement pour lire sans souris (Pg préc. /
// Pg suiv. / Début / Fin). Un navigateur fait défiler nativement l'élément
// focalisé : il suffit de lui donner le focus (tabindex="-1" dans le HTML,
// data-kn-read pour masquer le cadre). Mêmes garde-fous que le reste.
export function focusReading(el) {
  if (!el || !_enabled() || _touchOnly() || !_visible(el)) return false;
  try { el.focus({ preventScroll: true }); } catch (e) { return false; }
  return true;
}

// ── Bouton par défaut d'un formulaire — parité QML b170786 ─────────────────
// LobbyCreateGamePage / LocalGamePage : « Keys.onReturnPressed:
// createBtn.clicked() » — Entrée crée la partie depuis n'importe quel champ.
// Ici : un conteneur data-kn-form et, dedans, son bouton data-kn-default.
// Seulement depuis un champ simple (texte, nombre, mot de passe, case,
// bouton radio, curseur) : un bouton, une liste déroulante, une zone de texte
// ou un lien focalisé garde sa propre touche Entrée, comme un bouton
// focalisé garde la priorité dans le QML. Rien si une surface est ouverte
// par-dessus (menu, modale).
const FORM_INPUTS = /^(text|search|email|url|tel|number|password|checkbox|radio|range)$/;
function _formDefault(e) {
  var tg = e.target;
  if (!tg || (tg.tagName || '').toLowerCase() !== 'input') return false;
  if (!FORM_INPUTS.test((tg.type || 'text').toLowerCase())) return false;
  var form = tg.closest ? tg.closest('[data-kn-form]') : null;
  if (!form || !_visible(form) || _topSurface()) return false;
  var btn = form.querySelector('[data-kn-default]');
  if (!btn || btn.disabled || !_visible(btn)) return false;
  e.preventDefault();
  e.stopPropagation();
  btn.click();
  return true;
}

// ── Focus au démarrage d'une page — parité QML b170786 ─────────────────────
// « StackView.onActivated: Qt.callLater(X.forceActiveFocus) » : chaque page
// met le focus sur son élément utile. Ici les candidats portent
// data-kn-start (valeur vide = toujours, « online » / « offline » = selon le
// mode entraînement). À l'affichage d'un écran (.screen.active) ou d'une
// étape de connexion, le focus va au premier candidat visible et actif qui
// est VIDE (champ), sinon au premier candidat visible : pseudo vide → pseudo,
// pseudo mémorisé → mot de passe, comme applyInitialFocus() du QML.
// Jamais sur un appareil tactile (clavier virtuel) ; jamais si le focus est
// déjà sur un élément visible hors de la page (fenêtre ouverte par-dessus,
// saisie en cours). Un bouton focalisé ainsi ne montre pas son cadre avant
// la première touche (data-kn-quiet) : le QML n'affiche le cadre qu'au Tab.
const START_WATCH = ['login-step1', 'login-step2'];

function _startCandidates(scope) {
  var off = !!window._offlineMode;
  return Array.prototype.filter.call(scope.querySelectorAll('[data-kn-start]'), function (el) {
    var m = el.getAttribute('data-kn-start');
    if ((m === 'online' && off) || (m === 'offline' && !off)) return false;
    return !el.disabled && _visible(el);
  });
}

function _quiet(el) {
  if ((el.tagName || '').toLowerCase() !== 'button') return;
  el.setAttribute('data-kn-quiet', '');
  var off = function () {
    el.removeAttribute('data-kn-quiet');
    document.removeEventListener('keydown', off, true);
    el.removeEventListener('blur', off);
  };
  document.addEventListener('keydown', off, true);
  el.addEventListener('blur', off);
}

// Vue /live (spectateur embarqué en iframe sur pokerth.net) ou page encadrée :
// pas de focus automatique, il volerait le focus — voire le défilement — de
// la page hôte au chargement.
function _embedded() {
  try {
    if (document.documentElement.getAttribute('data-live') === '1') return true;
    return window.self !== window.top;
  } catch (e) { return true; }
}

export function focusStart(scope) {
  if (!scope || !_enabled() || _touchOnly() || _embedded() || !_visible(scope)) return false;
  var ae = document.activeElement;
  if (ae && ae !== document.body && !scope.contains(ae) && _visible(ae)) return false;
  var list = _startCandidates(scope);
  if (!list.length) return false;
  var target = list[0];
  for (var i = 0; i < list.length; i++) {
    if ((list[i].tagName || '').toLowerCase() === 'input' && !list[i].value) { target = list[i]; break; }
  }
  if (target === ae) return false;
  try { target.focus({ preventScroll: true }); } catch (e) { return false; }
  _quiet(target);
  return true;
}

function _watchStart() {
  if (typeof MutationObserver !== 'function') return;
  var els = Array.prototype.slice.call(document.querySelectorAll('.screen'));
  START_WATCH.forEach(function (id) { var el = document.getElementById(id); if (el) els.push(el); });
  // Tous les écrans sont suivis : le formulaire de création n'est déplacé dans
  // #s-create qu'à sa première ouverture, ses candidats n'y sont pas encore.
  els.forEach(function (el) {
    var open = _visible(el);
    new MutationObserver(function () {
      var now = _visible(el);
      if (now === open) return;
      open = now;
      if (now) focusStart(el);
    }).observe(el, { attributes: true, attributeFilter: ['style', 'hidden', 'class'] });
  });
  // Premier affichage (chargement de la page) : l'écran d'accueil est déjà là.
  els.forEach(function (el) { if (el.id && START_WATCH.indexOf(el.id) >= 0) focusStart(el); });
}

// Ferme la surface ouverte la plus prioritaire. Renvoie true si quelque chose
// a été fermé. Utilisé par Escape (ci-dessus) ET par le bouton Retour Android
// (ui/back-guard.mjs) : parité QML « Escape, Back (Android) » (bible §6). Ne
// dépend PAS de l'option pth_keynav, qui ne concerne que le clavier.
export function closeTop() {
  var s = _topSurface();
  if (!s) return false;
  try { s.close(); } catch (err) { return false; }
  return true;
}

// Enregistrement à chaud, pour les surfaces créées dynamiquement.
// close() doit ANNULER (jamais valider).
export function registerOverlay(el, close) {
  if (!el || typeof close !== 'function') return function () {};
  var entry = { el: el, close: close };
  REG.push(entry);
  return function () {
    var i = REG.indexOf(entry);
    if (i >= 0) REG.splice(i, 1);
  };
}

// ── Focus initial des popups — parité QML b170786 ─────────────────────────
// Le client QML donne le focus clavier à un bouton précis à l'ouverture de
// chaque popup (onOpened: X.forceActiveFocus()) : l'action SÛRE quand le
// popup arrive sans prévenir ou garde une action lourde (Refuser une
// invitation, Annuler quitter / déconnexion), l'unique action sinon (OK).
// Exception voulue : les confirmations du ConfirmPopup QML (exclure,
// signaler) s'ouvrent sur CONFIRMER — parité retenue par narmod le
// 2026-09-10. Ce focus ne fait pas de ces dialogues des data-kn-primary :
// Entrée ne confirme que si le focus est encore sur ce bouton.
// Ici le bouton visé porte data-kn-focus dans le HTML — même principe
// d'opt-in que data-kn-primary, aucune heuristique. Enter/Espace sur un
// bouton focalisé sont natifs ; le cadre n'apparaît qu'au clavier
// (:focus-visible, l'équivalent de visualFocus). À la fermeture, le focus
// revient où il était, comme un Popup Qt. Rien sur un appareil tactile sans
// souris : pas de clavier à servir, et retirer le focus d'un champ fermerait
// le clavier virtuel. Suit l'option pth_keynav.
const FOCUS_WATCH = SURFACES.map(function (s) { return s[0]; })
  .concat(['timeout-warn-modal', 'conn-lost-modal',     // gèrent Escape eux-mêmes
           'rk-profile']);                             // fiche joueur du classement

function _touchOnly() {
  try { return !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches); }
  catch (e) { return false; }
}

// Focalise le [data-kn-focus] de el. Renvoie restore(), qui rend le focus à
// l'élément qui l'avait avant — sauf si l'utilisateur est allé ailleurs.
export function focusInitial(el) {
  var noop = function () {};
  if (!el || !_enabled() || _touchOnly()) return noop;
  // Premier candidat visible et actif, el compris (une page qui défile
  // elle-même) : le champ de recherche du classement s'il est affiché, sinon
  // la zone de lecture.
  var cands = (el.matches && el.matches('[data-kn-focus]') ? [el] : [])
    .concat(Array.prototype.slice.call(el.querySelectorAll('[data-kn-focus]')));
  var target = null;
  for (var ci = 0; ci < cands.length; ci++) {
    if (!cands[ci].disabled && _visible(cands[ci])) { target = cands[ci]; break; }
  }
  if (!target) return noop;
  var prev = document.activeElement;
  if (prev && el.contains(prev)) return noop;          // déjà dans le popup
  try { target.focus({ preventScroll: true }); } catch (e) { return noop; }
  return function restore() {
    var cur = document.activeElement;
    if (cur && cur !== document.body && !el.contains(cur)) return;
    if (!prev || prev === document.body || !prev.isConnected || !_visible(prev)) return;
    try { prev.focus({ preventScroll: true }); } catch (e) {}
  };
}

// Surfaces du HTML : suivies par leurs attributs (style.display, hidden,
// class), sans toucher aux fonctions qui les ouvrent.
function _watchFocus() {
  if (typeof MutationObserver !== 'function') return;
  FOCUS_WATCH.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;       // candidats lus à l'ouverture : contenu parfois injecté
    var open = _visible(el), restore = null;
    new MutationObserver(function () {
      var now = _visible(el);
      if (now === open) return;
      open = now;
      if (now) restore = focusInitial(el);
      else if (restore) { var r = restore; restore = null; r(); }
    }).observe(el, { attributes: true, attributeFilter: ['style', 'hidden', 'class'] });
  });
}
_watchFocus();
_watchStart();

document.addEventListener('keydown', _onKey, true);   // capture : avant les
                                                      // handlers locaux
window.keynavRegisterOverlay = registerOverlay;
window.keynavCloseTop = closeTop;
window.keynavFocusInitial = focusInitial;
window.keynavFocusStart = focusStart;
window.keynavFocusReading = focusReading;
