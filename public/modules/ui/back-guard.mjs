// ── back-guard.mjs — bouton Retour Android / geste swipe-back ──────────────
//
// Parité QML : « Global (mainWindow) : Escape, Back (Android) » (bible 2.1.4
// §6) — le Back doit se comporter comme Escape, pas quitter l'application.
// Sans ce garde, un appui sur Retour pendant une partie ferme l'onglet (ou la
// PWA) et déconnecte le joueur de la table.
//
// Aucune page web ne peut DÉSACTIVER les boutons système : on piège
// l'historique. Une entrée « sentinelle » est empilée ; chaque Retour la
// dépile, on agit, puis on la ré-empile.
//
// Ordre de décision, du plus prioritaire au moins :
//   1. une surface est ouverte (chat, log, modale, menu…) → on la ferme ;
//   2. session active (jeu / lobby / création) → on reste, avec un message
//      « appuyez à nouveau pour quitter » ; un 2ᵉ appui sous 2 s sort ;
//   3. écran de connexion → comportement natif, on ne pièges rien.
//
// Option « pth_back_guard » (Options avancées → Interface), active par défaut.

import { t } from '../i18n.mjs';
import { closeTop } from './keynav.mjs';

var EXIT_WINDOW = 2000;   // ms : délai du double-appui « quitter »
var _lastAsk = 0;
var _armed = false;

function _enabled() {
  try { return localStorage.getItem('pth_back_guard') !== '0'; } catch (e) { return true; }
}

function _push() {
  try { window.history.pushState({ pthBack: 1 }, ''); _armed = true; } catch (e) { _armed = false; }
}

// Session active = un écran où quitter ferait perdre quelque chose.
function _inSession() {
  var ids = ['s-game', 's-lobby', 's-create'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el && el.classList.contains('active')) return true;
  }
  return false;
}

function _onPop() {
  if (!_enabled()) { _armed = false; return; }   // option décochée : natif

  // 1. Back = Escape : fermer la surface ouverte la plus prioritaire.
  var closed = false;
  try { closed = closeTop(); } catch (e) { closed = false; }
  if (closed) { _push(); return; }

  // 3. Hors session (écran de connexion) : on laisse sortir.
  if (!_inSession()) { _armed = false; return; }

  // 2. Double-appui pour quitter réellement.
  var now = Date.now();
  if (now - _lastAsk < EXIT_WINDOW) {
    _armed = false;
    // La sentinelle n'est pas ré-empilée : on est revenu sur l'entrée
    // d'origine. history.back() sort tout de suite s'il existe une entrée
    // antérieure ; sinon le prochain appui sortira (plus rien ne le piège).
    try { setTimeout(function () { window.history.back(); }, 0); } catch (e) {}
    return;
  }
  _lastAsk = now;
  _push();
  try {
    if (typeof window.showToast === 'function') {
      window.showToast(t('backAgainToExit'), { icon: '', duration: 1800 });
    }
  } catch (e) {}
}

export function initBackGuard() {
  if (window._backGuardWired) return;
  window._backGuardWired = true;
  window.addEventListener('popstate', _onPop);
  _push();
}

// Ré-arme la sentinelle après une réactivation de l'option (Options avancées).
export function refreshBackGuard() {
  if (_enabled() && !_armed) _push();
}

window.refreshBackGuard = refreshBackGuard;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackGuard);
} else {
  initBackGuard();
}
