// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/game/seats.mjs
//
// Placement personnalisé des sièges (mode 'custom') : positions en FRACTIONS
// de #g-table-zone, par orientation (p/l) et par nombre de joueurs, slot 0 =
// moi ; mode édition glisser-déposer (Pointer Events), bannière d'aide,
// bascule du zoom de mes cartes, et autoScaleTable (autofit du scaler,
// composé avec le zoom via window._tableAutofit / _applyZoomTransforms).
//
// Historique : extrait de public/pokerth.js (extraction #8 du plan
// docs/ESM_PLAN.md), au verbatim — le bloc le plus intriqué du plan. État
// partagé DÉJÀ véhiculé par window dans le code d'origine (window._seatEditMode,
// window._seatCount, window._tableAutofit, window._seatCustomGet,
// window._seatEditExit, window.toggleSeatEdit, window.toggleOwnCardZoom) :
// aucun pont supplémentaire à inventer, on conserve tel quel. Dépendances à
// runtime via les globaux : applyTableZoom, _getTableZoom (gardé par typeof),
// window._renderSeats (gardé). Les listeners DOMContentLoaded/resize
// s'enregistrent au chargement du module, comme avant à l'exécution du
// monolithe (DOMContentLoaded tombe après la file defer → applyTableZoom et
// autoScaleTable sont définis au moment du tir).
// ─────────────────────────────────────────────────────────────────────────

// Placement personnalise des sieges (mode 'custom') -- glisser-deposer en jeu.
// Positions stockees en FRACTIONS de #g-table-zone, par orientation (p/l) et
// par nombre de joueurs, indexees par slot (0 = moi, toujours). Le rendu
// (renderSeatsImmediate) applique ces fractions en surcouche, avec repli sur
// la position classique si un slot n'a pas encore ete place. Le zoom agit sur
// le conteneur #g-seats -> les fractions se composent avec le zoom.
// ════════════════════════════════════════════════════════════════════════
function _seatCustOri(){ return (window.innerHeight > window.innerWidth) ? 'p' : 'l'; }
function _seatCustAll(){
  try { var raw = localStorage.getItem('pth_seat_custom'); var o = raw ? JSON.parse(raw) : null;
        return (o && typeof o === 'object') ? o : {}; } catch (e) { return {}; }
}
window._seatCustomGet = function(n){
  var all = _seatCustAll(), byN = all[_seatCustOri()];
  return (byN && byN[String(n)]) ? byN[String(n)] : null;
};
function _seatCustomSet(n, slot, fx, fy){
  var all = _seatCustAll(), ori = _seatCustOri();
  if (!all[ori]) all[ori] = {};
  if (!all[ori][String(n)]) all[ori][String(n)] = {};
  all[ori][String(n)][String(slot)] = { fx: fx, fy: fy };
  try { localStorage.setItem('pth_seat_custom', JSON.stringify(all)); } catch (e) {}
}
function _seatCustomReset(n){
  var all = _seatCustAll(), ori = _seatCustOri();
  if (all[ori] && all[ori][String(n)]) { delete all[ori][String(n)];
    try { localStorage.setItem('pth_seat_custom', JSON.stringify(all)); } catch (e) {} }
}

var _seatEditPrevZoom = null;
window._seatEditMode = false;

function _seatEditActive(){
  try { return localStorage.getItem('pth_seat_layout') === 'custom'; } catch (e) { return false; }
}
// Re-rend proprement les sieges meme en mode edition (contourne le gel).
function _seatEditRerender(){
  var was = window._seatEditMode; window._seatEditMode = false;
  try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
  window._seatEditMode = was;
}
function toggleSeatEdit(){
  if (!_seatEditActive()) return;                        // dispo uniquement en mode custom
  if (window._seatEditMode) { _seatEditExit(); return; }
  if (!document.querySelector('#g-seats .seat')) return; // aucune table affichee
  _seatEditEnter();
}
window.toggleSeatEdit = toggleSeatEdit;
// Bouton "Agrandir mes cartes" (a cote des zooms) : bascule persistante de la
// taille de MES cartes dans le siege (style pokerth). Defaut off = boite comme
// les adversaires ; l'utilisateur agrandit ses cartes s'il le souhaite.
function toggleOwnCardZoom(){
  var lvl=0; try{ lvl = Math.min(3, Math.max(0, parseInt(localStorage.getItem('pth_big_own_cards'),10) || 0)); }catch(e){}
  lvl = (lvl + 1) % 4;   // cycle : base QML (85% riviere) -> 90% -> 95% -> 100% (riviere) -> base
  try{ localStorage.setItem('pth_big_own_cards', String(lvl)); }catch(e){}
  var b=document.getElementById('g-cardzoom');
  if(b){ b.classList.toggle('active', lvl>0); b.setAttribute('data-lvl', String(lvl)); }
  try{ if(typeof window._renderSeats==='function') window._renderSeats(); }catch(e){}
}
window.toggleOwnCardZoom = toggleOwnCardZoom;
window._seatEditExit = _seatEditExit;

function _seatEditEnter(){
  // Rendu propre a zoom 1 AVANT de geler (drag 1:1, sieges alignes sur le feutre)
  try { _seatEditPrevZoom = window._getTableZoom ? window._getTableZoom() : 1; } catch (e) { _seatEditPrevZoom = 1; }
  try { localStorage.setItem('pth_table_zoom', '1'); } catch (e) {}  // TABLE_ZOOM_DEFAULT du monolithe
  _applyTableZoomSafe();
  window._seatEditMode = true;                           // gele les re-rendus
  document.documentElement.setAttribute('data-seat-edit', '1');
  var b = document.getElementById('g-seat-edit'); if (b) b.classList.add('active');
  _seatEditBindDrag();
  _seatEditBanner(true);
}
function _seatEditExit(){
  window._seatEditMode = false;
  document.documentElement.removeAttribute('data-seat-edit');
  var b = document.getElementById('g-seat-edit'); if (b) b.classList.remove('active');
  _seatEditBanner(false);
  if (_seatEditPrevZoom != null) {
    try { localStorage.setItem('pth_table_zoom', String(_seatEditPrevZoom)); } catch (e) {}
    _seatEditPrevZoom = null;
  }
  _applyTableZoomSafe();                                  // rend + transforms au zoom restaure
}

// Glisser un siege (self comprise). Delegation posee une seule fois sur
// #g-seats (persiste ; seul son contenu est recree). Ignore les sieges
// fantomes (joueur parti). Sauvegarde la fraction au relachement.
function _seatEditBindDrag(){
  var host = document.getElementById('g-seats');
  if (!host || host._seatEditBound) return;
  host._seatEditBound = true;
  var drag = null;
  host.addEventListener('pointerdown', function(ev){
    if (!window._seatEditMode) return;
    var seat = (ev.target && ev.target.closest) ? ev.target.closest('.seat[data-pid]') : null;
    if (!seat || seat.classList.contains('seat-ghost')) return;
    var zone = document.getElementById('g-table-zone'); if (!zone) return;
    ev.preventDefault(); ev.stopPropagation();
    var zr = zone.getBoundingClientRect();
    var curLeft = parseFloat(seat.style.left) || 0;
    var curTop  = parseFloat(seat.style.top)  || 0;
    drag = { seat: seat, zr: zr,
             slot: Array.prototype.indexOf.call(host.children, seat),
             offX: (ev.clientX - zr.left) - curLeft,
             offY: (ev.clientY - zr.top)  - curTop,
             nx: curLeft, ny: curTop };
    seat.classList.add('seat-dragging');
    try { host.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  host.addEventListener('pointermove', function(ev){
    if (!drag) return;
    ev.preventDefault();
    var zr = drag.zr;
    var nx = Math.max(8, Math.min((ev.clientX - zr.left) - drag.offX, zr.width  - 8));
    var ny = Math.max(8, Math.min((ev.clientY - zr.top)  - drag.offY, zr.height - 8));
    drag.nx = nx; drag.ny = ny;
    drag.seat.style.left = nx.toFixed(1) + 'px';
    drag.seat.style.top  = ny.toFixed(1) + 'px';
  });
  function _end(ev){
    if (!drag) return;
    var zr = drag.zr, n = window._seatCount || 0;
    if (n && drag.slot >= 0 && zr.width && zr.height) {
      _seatCustomSet(n, drag.slot, drag.nx / zr.width, drag.ny / zr.height);
    }
    drag.seat.classList.remove('seat-dragging');
    try { host.releasePointerCapture(ev.pointerId); } catch (e) {}
    drag = null;
  }
  host.addEventListener('pointerup', _end);
  host.addEventListener('pointercancel', _end);
}

// Banniere d'edition (hint + reinitialiser + termine).
function _seatEditBanner(show){
  var el = document.getElementById('seat-edit-banner');
  if (!show) { if (el) el.remove(); return; }
  if (el) return;
  var tr = (typeof window.t === 'function') ? window.t : function(k){ return k; };
  el = document.createElement('div');
  el.id = 'seat-edit-banner';
  el.className = 'seat-edit-banner';
  el.innerHTML = '<span class="seb-hint"></span>'
    + '<button type="button" class="seb-reset"></button>'
    + '<button type="button" class="seb-done"></button>';
  el.querySelector('.seb-hint').textContent  = tr('seatEditHint');
  el.querySelector('.seb-reset').textContent = tr('seatEditReset');
  el.querySelector('.seb-done').textContent  = tr('seatEditDone');
  el.querySelector('.seb-reset').addEventListener('click', function(){
    _seatCustomReset(window._seatCount || 0); _seatEditRerender();
  });
  el.querySelector('.seb-done').addEventListener('click', function(){ _seatEditExit(); });
  document.body.appendChild(el);
}

// applyTableZoom vit dans le monolithe (window.applyTableZoom, pose a la fin de
// pokerth.js). Meme garde que les 4 autres appels du fichier : sans elle, un
// echec d'evaluation du monolithe transformait CHAQUE resize en ReferenceError.
function _applyTableZoomSafe() {
  try { if (typeof window.applyTableZoom === 'function') window.applyTableZoom(); } catch (e) {}
}
document.addEventListener('DOMContentLoaded', function() { setTimeout(_applyTableZoomSafe, 500); });
window.addEventListener('resize', _applyTableZoomSafe);

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
  var _npOpp = Math.max(0, (window._seatCount || 6) - 1); // adversaires (pour le feutre)
  // Portrait etroit : plus il y a de joueurs, plus les boites sont petites,
  // donc plus le feutre peut etre grand sans chevaucher les sieges lateraux.
  var scaleMax = isDeskScale ? 1.4 : (_narrowPortrait ? Math.min(0.85, Math.max(0.74, 0.74 + (_npOpp - 6) * 0.034)) : 1);
  var scale = Math.min(scaleMax, tzW / scW, tzH / scH);
  if (scale < 0.05) scale = 0.5; // fallback visible
  window._tableAutofit = scale; // zoom applique separement (voir _applyZoomTransforms)
  sc.style.transform = 'scale(' + scale.toFixed(3) + ')';
  sc.style.transformOrigin = 'center center';
  // Cartes communes : ici le scaler est a autofit SANS le zoom. On compense
  // #g-comm par scale(zoom) pour qu'elles grossissent/retrecissent comme les
  // sieges (qui portent scale(eff) via #g-seats). Neutralise dans
  // _applyZoomTransforms ou le scaler porte deja autofit*eff (pas de double).
  var _cz = (typeof _getTableZoom === 'function') ? _getTableZoom() : 1;
  var _cc = document.getElementById('g-comm');
  if (_cc) { _cc.style.transformOrigin = 'center center'; _cc.style.transform = (Math.abs(_cz - 1) > 0.001 ? 'translate(-50%, -50%) scale(' + _cz.toFixed(3) + ')' : ''); }
}
document.addEventListener('DOMContentLoaded', function() { setTimeout(autoScaleTable, 400); });

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export { toggleSeatEdit, toggleOwnCardZoom, autoScaleTable };
if (typeof window !== 'undefined') {
  // toggleSeatEdit / toggleOwnCardZoom / _seatEditExit / _seatCustomGet sont
  // déjà attachés par le bloc lui-même (verbatim).
  window.autoScaleTable = autoScaleTable;   // appelé nu depuis l'IIFE App
  window.Seats = { toggleSeatEdit, toggleOwnCardZoom, autoScaleTable };
}
