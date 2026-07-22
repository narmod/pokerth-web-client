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
  ['poll-modal',           'closePollModal'],
  ['about-page',           'closeAboutPage'],
  ['privacy-page',         'closePrivacyPage'],
  // — panneaux flottants —
  ['hands-overlay',        'toggleHandsHelp'],
  ['music-panel',          'toggleMusicPanel'],
  ['g-reaction-panel',     'App.toggleReactionsPin'],
  ['g-log-panel',          'toggleLog'],
  ['g-chat-panel',         'toggleGameChat'],
  ['g-winner-overlay',     'App.dismissWinner']
];

// Surfaces volontairement ABSENTES : #lobby-chat-panel et #players-panel sont
// des colonnes intégrées au lobby (pas des overlays) — Escape ne doit pas les
// replier ; les panneaux emoji et les overlays de fin de partie n'exposent
// aucune fermeture fiable.

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

  if (e.key === 'Escape') {
    var s = _topSurface();
    if (!s) return;                       // rien d'ouvert → on laisse passer
    try { s.close(); } catch (err) { return; }
    e.preventDefault();
    e.stopPropagation();                  // évite la double fermeture des
    return;                               // surfaces qui gèrent déjà Escape
  }

  if (e.key === 'Enter') {
    if (e.shiftKey || _inEditable(e.target)) return;
    var s2 = _topSurface();
    if (!s2 || !s2.el) return;
    var btn = s2.el.querySelector('[data-kn-primary]');
    if (!btn || btn.disabled || !_visible(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    btn.click();
  }
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

document.addEventListener('keydown', _onKey, true);   // capture : avant les
                                                      // handlers locaux
window.keynavRegisterOverlay = registerOverlay;
