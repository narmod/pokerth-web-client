// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/shortcuts.mjs
//
// Raccourcis clavier de l'écran de jeu : détection d'un clavier physique
// (classe has-keyboard), bindings personnalisables (pth_keys, réassignation
// par capture), mapping officiel PokerTH F1-F8 / Alt+M-K-F-C-L-I (bible QML
// §6, inversion pth_fkeys_alt) + lettres re-bindables et mises rapides,
// toast d'indication showKeyHint.
//
// Historique : extrait de public/pokerth.js (extraction #5 du plan
// docs/ESM_PLAN.md), au verbatim. Les listeners s'enregistrent à l'exécution
// du module (avant pokerth.js, même phase qu'avant : la capture de
// réassignation précède toujours le handler d'action). Dépendances résolues
// à runtime via les globaux : toggleGameChat, gipOpenTab, _advGet,
// window.App (gardé), window._canShowCards. t() passe par le shim ci-dessous.
// _rebindAction est partagé en écriture avec le monolithe → pont
// defineProperty (gabarit _lang d'i18n.mjs).
// ─────────────────────────────────────────────────────────────────────────

function t(key, opts) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, opts) : key;
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
  // ── Mapping officiel PokerTH (QML 28/06, bible §6) — actif sur tout l'écran de jeu ──
  // F6/F7/F8 = Manuel / Auto Check-Fold / Auto Check-Call ; Alt+M/K/F = modes
  // Manuel / Auto Check-Call / Auto Check-Fold ; Alt+C chat, Alt+L journal,
  // Alt+I moniteur d'odds (équivalent du panneau « Chancen »). F11 = plein
  // écran natif du navigateur (non intercepté). Fonctionne HORS tour, comme
  // les ApplicationShortcut du QML.
  var _sg = document.getElementById('s-game');
  if (_sg && _sg.classList.contains('active') && !e.ctrlKey && !e.metaKey) {
    if (e.altKey) {
      var ak = (e.key || '').toLowerCase();
      var _mode = ak === 'm' ? 0 : ak === 'k' ? 1 : ak === 'f' ? 2 : -1;
      if (_mode >= 0) { e.preventDefault(); try { if (window.App && App.setPlayingMode) App.setPlayingMode(_mode); } catch (_e) {} return; }
      if (ak === 'c') { e.preventDefault(); try { toggleGameChat(); } catch (_e) {} return; }
      // Panneau info unifié (QML GameInfoPanel) : Alt+L → onglet Historique,
      // Alt+I → onglet Chances.
      if (ak === 'l') { e.preventDefault(); try { gipOpenTab('log'); } catch (_e) {} return; }
      if (ak === 'i') { e.preventDefault(); try { gipOpenTab('odds'); } catch (_e) {} return; }
    } else if (e.key === 'F5') {
      // F5 officiel = « Show » — intercepté SEULEMENT quand le bouton est
      // visible (fenêtre post-main) ; sinon F5 garde son rôle navigateur.
      if (window._canShowCards) {
        e.preventDefault();
        try { if (window.App && App.showMyCards) App.showMyCards(); } catch (_e) {}
      }
      return;
    } else if (e.key === 'F6' || e.key === 'F7' || e.key === 'F8') {
      e.preventDefault();
      try { if (window.App && App.setPlayingMode) App.setPlayingMode(e.key === 'F6' ? 0 : e.key === 'F7' ? 2 : 1); } catch (_e) {}
      return;
    }
  }
  var _ap = document.querySelector('#g-actions > .action-grid');
  if (!_ap) return;

  var key = e.key.toLowerCase();
  var KB = _keyBindings();
  var act = null;
  // F1–F4 : ordre officiel Fold · Check/Call · Bet/Raise · All-In, inversé si
  // « pth_fkeys_alt » (équivalent AlternateFKeysUserActionMode du client Qt).
  var _fAlt = _advGet('fkeys_alt', false);
  if (e.key === 'F1') act = _fAlt ? 'allin' : 'fold';
  else if (e.key === 'F2') act = _fAlt ? 'raise' : 'call';
  else if (e.key === 'F3') act = _fAlt ? 'call' : 'raise';
  else if (e.key === 'F4') act = _fAlt ? 'fold' : 'allin';
  else if (key === KB.fold) act = 'fold';
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

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export { rebindKey, resetKeys, showKeyHint };
if (typeof window !== 'undefined') {
  // rebindKey / resetKeys sont déjà attachés par le bloc lui-même (verbatim).
  window._keyBindings = _keyBindings;
  window._renderKeyButtons = _renderKeyButtons;
  window.showKeyHint = showKeyHint;
  Object.defineProperty(window, '_rebindAction', {
    configurable: true,
    get() { return _rebindAction; },
    set(v) { _rebindAction = v; },
  });
  window.Shortcuts = { rebindKey, resetKeys, showKeyHint, keyBindings: _keyBindings };
}
