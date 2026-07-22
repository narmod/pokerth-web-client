// ═══════════════════════════════════════════════════════════════════
// Assistance — séparateur redimensionnable (Assistance / Cotes) dans
// l'onglet « Chances », + détachement de l'Assistance dans sa propre
// fenêtre flottante redimensionnable (système _enableFloating partagé).
// Chantier ESM #9g-B3. Tout le câblage vit ici (rien ajouté au monolithe) ;
// odds-panel.mjs::_gipAssistSync appelle window._assistPaneSync et gère la
// visibilité du bloc en mode détaché (S._assistDetached).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';

var LS_H   = 'pth_gip_assist_h';      // hauteur du bloc Assistance (px, mode attaché)
var LS_DET = 'pth_assist_detached';   // '1' quand l'Assistance est détachée en fenêtre
var MIN_H = 40, MIN_ODDS = 60;

function _lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
function _lsSet(k,v){ try { localStorage.setItem(k, v); } catch(e){} }
function _lsDel(k){ try { localStorage.removeItem(k); } catch(e){} }

// ── Applique la hauteur mémorisée du bloc Assistance (uniquement attaché) ──
function _applyAssistHeight() {
  var box = document.getElementById('gip-assist');
  if (!box) return;
  if (S._assistDetached) { box.style.flex=''; box.style.height=''; box.style.overflowY=''; return; }
  var h = parseInt(_lsGet(LS_H), 10);
  if (h > 0) { box.style.flex='0 0 auto'; box.style.height=h+'px'; box.style.overflowY='auto'; }
  else       { box.style.flex='';         box.style.height='';     box.style.overflowY=''; }
}

// ── Appelé par _gipAssistSync : poignée de séparation + hauteur ──
function _assistPaneSync() {
  var split = document.getElementById('gip-split');
  var box   = document.getElementById('gip-assist');
  var odds  = document.getElementById('g-odds-body');
  var attachedVisible = !!(box && box.style.display !== 'none' && !S._assistDetached
     && odds && odds.style.display !== 'none');
  if (split) split.style.display = attachedVisible ? '' : 'none';
  if (!S._assistDetached) _applyAssistHeight();
}

// ── Poignée de séparation (drag vertical entre Assistance et Cotes) ──
function _wireSplit() {
  var box = document.getElementById('gip-assist');
  if (!box || document.getElementById('gip-split')) return;
  var split = document.createElement('div');
  split.id = 'gip-split';
  split.className = 'gip-split';
  split.style.display = 'none';
  split.setAttribute('aria-hidden', 'true');
  split.innerHTML = '<span class="gip-split-grip"></span>';
  box.parentNode.insertBefore(split, box.nextSibling);   // → [box, split, odds]
  var drag = false, sy = 0, sh = 0;
  split.addEventListener('pointerdown', function(e){
    drag = true; sy = e.clientY; sh = box.offsetHeight;
    try { split.setPointerCapture(e.pointerId); } catch(_){}
    e.preventDefault();
  });
  split.addEventListener('pointermove', function(e){
    if (!drag) return;
    var panel = document.getElementById('g-log-panel');
    var maxH = panel ? (panel.clientHeight - MIN_ODDS - 60) : 400;
    if (maxH < MIN_H) maxH = MIN_H;
    var h = Math.max(MIN_H, Math.min(maxH, sh + (e.clientY - sy)));
    box.style.flex = '0 0 auto'; box.style.height = h + 'px'; box.style.overflowY = 'auto';
  });
  function end(e){
    if (!drag) return; drag = false;
    try { split.releasePointerCapture(e.pointerId); } catch(_){}
    if (box.style.height) _lsSet(LS_H, parseInt(box.style.height, 10));
  }
  split.addEventListener('pointerup', end);
  split.addEventListener('pointercancel', end);
}

// ── Fenêtre flottante « Assistance » (mode détaché) ──
function _ensureAssistPanel() {
  var ap = document.getElementById('g-assist-panel');
  if (ap) return ap;
  ap = document.createElement('div');
  ap.id = 'g-assist-panel';
  ap.style.display = 'none';
  var hd = document.createElement('div');
  hd.className = 'g-chat-panel-header';
  var grip = document.createElement('span');
  grip.className = 'gip-grip'; grip.setAttribute('aria-hidden','true'); grip.textContent = '⠿';
  var title = document.createElement('span');
  title.className = 'gip-assist-wtitle'; title.setAttribute('data-i18n','assist'); title.textContent = t('assist');
  var dock = document.createElement('button');
  dock.type = 'button'; dock.className = 'gip-assist-dock';
  dock.setAttribute('data-i18n-title','assistDock'); dock.title = t('assistDock'); dock.textContent = '↩';
  dock.addEventListener('click', dockAssist);
  // Garde-fou : double-clic sur l'en-tête (hors bouton) = recentrer la fenêtre
  // (récupération si elle a été perdue hors écran).
  hd.title = t('assistDock');
  hd.addEventListener('dblclick', function(e){ if (e.target && e.target.closest && e.target.closest('button')) return; _recenterAssist(); });
  hd.appendChild(grip); hd.appendChild(title); hd.appendChild(dock);
  var host = document.createElement('div');
  host.id = 'g-assist-host';
  host.className = 'log-msgs';
  host.style.cssText = 'flex:1;min-height:0;overflow-y:auto;background:var(--chatlog-bg, var(--field-bg))';
  ap.appendChild(hd); ap.appendChild(host);
  document.body.appendChild(ap);
  ap._hd = hd;
  return ap;
}

// ── Garde-fou : reborne la fenêtre détachée dans le viewport (jamais hors écran) ──
function _ensureOnScreen(ap) {
  if (!ap) return;
  try {
    var r = ap.getBoundingClientRect();
    var w = r.width  || 240, h = r.height || 88;
    var vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
    var left, top;
    if (!r.width && !r.height) { left = 16; top = 56; }         // pas encore mesurable
    else {
      left = Math.min(Math.max(8, r.left), Math.max(8, vw - w - 8));
      top  = Math.min(Math.max(8, r.top ), Math.max(8, vh - h - 8));
    }
    ap.style.position = 'fixed'; ap.style.right = 'auto'; ap.style.bottom = 'auto';
    ap.style.left = left + 'px'; ap.style.top = top + 'px';
  } catch (e) {}
}

// ── Recentrer la fenêtre à un emplacement visible par défaut (et persister) ──
function _recenterAssist() {
  var ap = document.getElementById('g-assist-panel');
  if (!ap || ap.style.display === 'none') return;
  ap.style.position = 'fixed'; ap.style.right = 'auto'; ap.style.bottom = 'auto';
  ap.style.left = '16px'; ap.style.top = '56px';
  _ensureOnScreen(ap);
  try {
    var r = ap.getBoundingClientRect();
    var d = { left: Math.round(r.left) || 16, top: Math.round(r.top) || 56 };
    if (ap._winResizable) { d.width = Math.round(r.width) || 240; d.height = Math.round(r.height) || 88; }
    localStorage.setItem('pth_winpos_assist', JSON.stringify(d));
  } catch (e) {}
}

// ── La fenêtre détachée d'Assistance ne s'affiche qu'EN JEU (écran #s-game
//    actif). On garde l'état « détaché » mémorisé ; seul l'affichage suit
//    l'écran courant, pour ne pas polluer le lobby / les autres pages. ──
function _isGameScreenActive() {
  var g = document.getElementById('s-game');
  return !!(g && g.classList.contains('active'));
}
function _syncAssistWinScreen() {
  var ap = document.getElementById('g-assist-panel');
  if (!ap) return;
  ap.style.display = (S._assistDetached && S._assistOn !== false && _isGameScreenActive()) ? '' : 'none';
}

// ── Détacher : déplace #gip-assist dans la fenêtre flottante ──
function detachAssist() {
  var box = document.getElementById('gip-assist');
  if (!box) return;
  var ap = _ensureAssistPanel();
  var host = document.getElementById('g-assist-host');
  box.style.flex=''; box.style.height=''; box.style.overflowY='';   // réinit mise en page attachée
  var row = document.getElementById('gip-assist-hd-row');
  if (row) row.style.display = 'none';                              // titre géré par l'en-tête fenêtre
  host.appendChild(box);
  box.style.display = '';
  S._assistDetached = true; _lsSet(LS_DET, '1');
  ap.style.display = _isGameScreenActive() ? '' : 'none';   // n'apparaît qu'en jeu
  if (typeof window._enableFloating === 'function') {
    // zoom:true → le contenu (texte + barre) suit la taille de la fenêtre via
    // la propriété CSS `zoom: var(--wz)`. defW/defH ≈ taille réelle du contenu
    // pour que le zoom parte de 1× ; le contenu remplit + centré (CSS) évite
    // tout espace blanc quand on agrandit. Largeur/position/hauteur mémorisées.
    window._enableFloating(ap, { key:'pth_winpos_assist', handle: ap._hd,
      resizable:true, minW:150, minH:64, defW:240, defH:88, zoom:true });
  } else {
    // Garde-fou : système de fenêtres pas encore prêt → position visible.
    ap.style.position = 'fixed'; ap.style.right = 'auto'; ap.style.bottom = 'auto';
    ap.style.left = '16px'; ap.style.top = '56px';
  }
  _ensureOnScreen(ap);   // garde-fou : jamais hors écran
  try { if (typeof window._gipAssistSync === 'function') window._gipAssistSync(); } catch(e){}
}

// ── Rattacher : remet #gip-assist dans le panneau info, avant les Cotes ──
function dockAssist() {
  var box   = document.getElementById('gip-assist');
  var panel = document.getElementById('g-log-panel');
  var odds  = document.getElementById('g-odds-body');
  var split = document.getElementById('gip-split');
  var ap    = document.getElementById('g-assist-panel');
  var ref   = split || odds;
  if (box && panel && ref) panel.insertBefore(box, ref);           // → [box, split, odds]
  var row = document.getElementById('gip-assist-hd-row');
  if (row) row.style.display = '';
  S._assistDetached = false; _lsDel(LS_DET);
  if (ap) {
    if (typeof window._disableFloating === 'function') window._disableFloating(ap);
    ap.style.display = 'none';
  }
  _applyAssistHeight();
  try { if (typeof window._gipAssistSync === 'function') window._gipAssistSync(); } catch(e){}
}

function toggleAssistDetach() { if (S._assistDetached) dockAssist(); else detachAssist(); }

// ── Bouton « détacher » dans l'en-tête du bloc Assistance ──
function _wireDetachBtn() {
  var box = document.getElementById('gip-assist');
  if (!box) return;
  var hd = box.querySelector('.odds-hd');
  if (!hd || document.getElementById('gip-assist-hd-row')) return;
  // Enrober le titre + bouton dans une rangée flex, SANS toucher au contenu de
  // .odds-hd (data-i18n réécrit uniquement son propre textContent → le bouton,
  // frère et non enfant, survit au changement de langue).
  var row = document.createElement('div');
  row.id = 'gip-assist-hd-row';
  row.className = 'gip-assist-hd-row';
  box.insertBefore(row, hd);
  row.appendChild(hd);
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'gip-assist-pop';
  btn.setAttribute('data-i18n-title','assistPopOut'); btn.title = t('assistPopOut'); btn.textContent = '⧉';
  btn.addEventListener('click', toggleAssistDetach);
  row.appendChild(btn);
}

// La restauration de l'état détaché a besoin de window._enableFloating, défini
// par le monolithe pokerth.js chargé APRÈS ce module (les deux sont des
// <script type="module">, exécutés dans l'ordre du document). Attendre qu'il
// soit prêt garantit le placement + le clamp au viewport → sinon la fenêtre
// restaurée se retrouve hors écran (bug remonté). Repli après ~1 s.
function _whenFloatingReady(cb, tries) {
  tries = tries || 0;
  if (typeof window._enableFloating === 'function' || tries > 60) { cb(); return; }
  setTimeout(function(){ _whenFloatingReady(cb, tries + 1); }, 16);
}
function _restoreDetached() {
  if (_lsGet(LS_DET) === '1') detachAssist();   // restaurer l'état détaché mémorisé
  else _applyAssistHeight();
}
function _initAssistPane() {
  if (!document.getElementById('gip-assist')) return;
  _wireDetachBtn();          // câblage UI : ne dépend pas du système de fenêtres
  _wireSplit();
  _ensureAssistPanel();
  _whenFloatingReady(_restoreDetached);
  // La fenêtre détachée d'Assistance ne doit apparaître qu'en jeu : on suit
  // l'activation/désactivation de l'écran #s-game.
  var _g = document.getElementById('s-game');
  if (_g && window.MutationObserver) {
    new window.MutationObserver(_syncAssistWinScreen).observe(_g, { attributes: true, attributeFilter: ['class'] });
  }
  _syncAssistWinScreen();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initAssistPane, { once: true });
else _initAssistPane();

// Reborne la fenêtre détachée au changement de taille du viewport (le monolithe
// le fait déjà pour toutes les .floating-win, mais ceci couvre aussi les cas où
// _enableFloating n'a pas encore été appliqué).
window.addEventListener('resize', function(){
  var ap = document.getElementById('g-assist-panel');
  if (ap && ap.style.display !== 'none') _ensureOnScreen(ap);
});

window._assistPaneSync = _assistPaneSync;
window.toggleAssistDetach = toggleAssistDetach;
window.detachAssist = detachAssist;
window.dockAssist = dockAssist;
window.recenterAssist = _recenterAssist;

export { _assistPaneSync, toggleAssistDetach, detachAssist, dockAssist, _recenterAssist };
