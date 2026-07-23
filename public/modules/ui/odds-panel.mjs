// ═══════════════════════════════════════════════════════════════════
// Panneau force de main & moniteur d'odds (onglet « Chances » du
// panneau info, parité QML GameInfoPanel) — chantier ESM #9g-B2.
// calcWinProb (Monte Carlo), _hs* (bandeau force de main + contraste
// thème clair), _gipAssistSync (visibilité du bloc d'assistance),
// renderPreFlopStrength / renderHandStrength / renderOddsMonitor.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// t (i18n.mjs), esc (misc.mjs), normalizeHoleCard/evaluateBestHand/
// _cmpHand/evaluatePreFlopHand/_oddsCompute (game/cards.mjs) importés ;
// _advGet → window._advGet (1×) et _oddsSeq → window._oddsSeq (3×,
// globaux top-level du script) ; alias window._renderOdds conservé.
// NB : le `var t` de boucle dans calcWinProb masque localement l'import
// t() (légal, aucune traduction utilisée dans cette fonction).
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { t } from '../i18n.mjs';
import { esc } from './misc.mjs';
import { normalizeHoleCard, evaluateBestHand, _cmpHand,
         evaluatePreFlopHand, _oddsCompute } from '../game/cards.mjs';

// ── Probabilité de gain (Monte Carlo simplifié) ──
function calcWinProb() {
  if (S.myCards[0] == null || S.myCards[1] == null) return -1;
  var comm = S.commCards.filter(function(c){ return c != null; });
  if (comm.length < 3) return -1; // seulement après le flop
  // Normaliser mes hole cards vers comm encoding (même échelle que commCards)
  var myNorm = [S.myCards[0], S.myCards[1]].map(normalizeHoleCard).filter(function(c){ return c != null; });
  if (myNorm.length < 2) return -1;
  // Le deck est en comm encoding (0-51). On exclut mes cartes normalisées + comm cards.
  var known = myNorm.concat(comm);
  var deck = [];
  for (var i = 0; i < 52; i++) { if (known.indexOf(i) < 0) deck.push(i); }
  var needed = 5 - comm.length;
  var nOpp = Math.max(1, S.seats.filter(function(p){ return p !== S.myId && S.seatData[p] && !S.seatData[p].folded; }).length);
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
// Fond REEL du panneau info : chatlog-bg d'un style/palette importee, sinon
// --panel du theme. La palette QML claire rend le panneau clair SANS changer
// data-theme -> on mesure la couleur calculee au lieu de deviner par le theme.
function _hsPanelIsLight() {
  try {
    var panel = document.getElementById('g-log-panel');
    var bg = panel ? getComputedStyle(panel).backgroundColor : '';
    var m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s\/]+([\d.]+))?\)/.exec(bg || '');
    if (m && (m[4] == null || parseFloat(m[4]) > 0.5)) {
      return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) > 140;
    }
  } catch (e) {}
  try { return document.documentElement.getAttribute('data-theme') === 'pokerth-light'; } catch (e) { return false; }
}
function _hsContrastCol(col) {
  if (!_hsPanelIsLight()) return col;
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
  // Style « Segments » : 10 blocs, un par tranche de 10 %. La couleur passe par
  // une variable CSS pour que le style actif (data-assist-style) decide seul de
  // ce qui s'affiche — le calcul reste unique quel que soit le rendu.
  var gip = document.getElementById('gip-assist');
  if (gip) {
    if (col) gip.style.setProperty('--hs-col', col);
    var segs = gip.querySelectorAll('.hs-segs i');
    var lit = Math.round(p / 10);
    for (var i = 0; i < segs.length; i++) {
      if (i < lit) segs[i].classList.add('on'); else segs[i].classList.remove('on');
    }
  }
  var lbl = document.getElementById('hs-lbl');
  if (lbl) { var txt = lbl.querySelector('.hs-txt') || lbl; txt.textContent = text; txt.style.color = ''; lbl.style.display = ''; }
  // L'assistance vit dans l'onglet « Chances » du panneau info : on met juste
  // a jour le contenu ; la visibilite du bloc est geree par _gipAssistSync.
  _gipAssistSync();
}
function _hsHide(el) {
  if (el) el.style.display = 'none';
  var lbl = document.getElementById('hs-lbl');
  if (lbl) { lbl.style.display = 'none'; var txt = lbl.querySelector('.hs-txt'); if (txt) txt.textContent = ''; }
  _gipAssistSync();
}
// Visibilite du bloc d'assistance en tete de l'onglet « Chances » : la force de
// la main ne s'affiche que si le panneau info est ouvert sur l'onglet Chances,
// que l'assistance est active et qu'un resultat est disponible.
function _gipAssistSync() {
  var box = document.getElementById('gip-assist');
  if (!box) return;
  var lbl = document.getElementById('hs-lbl');
  var txt = lbl && lbl.querySelector('.hs-txt');
  var hasContent = !!(lbl && lbl.style.display !== 'none' && txt && txt.textContent);
  // Mode détaché : l'assistance vit dans sa propre fenêtre flottante et reste
  // visible tant que l'assistance est active, indépendamment du panneau info.
  if (S._assistDetached) {
    box.style.display = S._assistOn ? '' : 'none';
    // La fenêtre détachée ne s'affiche qu'EN JEU (écran #s-game actif) :
    // _gipAssistSync peut être appelé depuis n'importe quel écran (boot, i18n,
    // options) et ré-affichait la fenêtre sur la page de login (bug remonté).
    var ap = document.getElementById('g-assist-panel');
    var _sg = document.getElementById('s-game');
    var _inGame = !!(_sg && _sg.classList.contains('active'));
    if (ap) ap.style.display = (S._assistOn && _inGame) ? '' : 'none';
    try { if (typeof window._assistPaneSync === 'function') window._assistPaneSync(); } catch (e) {}
    return;
  }
  var panel = document.getElementById('g-log-panel');
  var open = !!(panel && panel.style.display !== 'none');
  var oddsTab = false;
  try { oddsTab = localStorage.getItem('pth_gip_tab') === 'odds'; } catch (e) {}
  box.style.display = (S._assistOn && open && oddsTab && hasContent) ? '' : 'none';
  try { if (typeof window._assistPaneSync === 'function') window._assistPaneSync(); } catch (e) {}
}

function renderPreFlopStrength() {
  var el = document.getElementById('hand-strength');
  if (!el) return;
  if (!S._assistOn) { _hsHide(el); return; } // assistance désactivée
  if (S.commCards.filter(function(c){ return c!=null; }).length > 0) return;
  if (S.myCards[0] == null || S.myCards[1] == null) { _hsHide(el); return; }
  var res = evaluatePreFlopHand(S.myCards[0], S.myCards[1]);
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
  if (!S._assistOn) { _hsHide(el); return; } // assistance désactivée
  var validComm = S.commCards.filter(function(c){ return c != null; });
  if (S.myCards[0] == null || S.myCards[1] == null || validComm.length === 0) { _hsHide(el); return; }
  // Normaliser les hole cards (1-indexed) vers l'encodage canonique (0-indexed)
  var holeNorm = [S.myCards[0], S.myCards[1]]
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
    var _captureHole = [S.myCards[0], S.myCards[1]];
    setTimeout(function() {
      // Vérifier que le contexte n'a pas changé (nouvelle main, fold…)
      var currComm = S.commCards.filter(function(c){ return c != null; });
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

function renderOddsMonitor() {
  // Onglet « Chances » du panneau info unifié (parité QML GameInfoPanel).
  var el = document.getElementById('g-odds-body');
  if (!el) return;
  var panel = document.getElementById('g-log-panel');
  var _open = !!(panel && panel.style.display !== 'none');
  var _oddsTab = false; try { _oddsTab = localStorage.getItem('pth_gip_tab') === 'odds'; } catch (e) {}
  if (!_open || !_oddsTab) return; // onglet Chances non affiché : rien à calculer
  // Option « Afficher les cotes » (defaut ON) : masque la liste des cotes sans
  // toucher au bloc d'assistance, qui a sa propre option.
  if (!window._advGet('show_odds', true)) { el.innerHTML = ''; el._built = false; el.style.display = 'none'; return; }
  el.style.display = '';
  if (S.myCards[0] == null || S.myCards[1] == null) { el.innerHTML = '<div class="odds-body odds-wait">…</div>'; el._built = false; return; }
  if (!el._built) { el.innerHTML = '<div class="odds-hd">' + esc(t('oddsTitle')) + '</div><div class="odds-body odds-wait">…</div>'; el._built = true; }
  var seq = ++window._oddsSeq;
  var hole = [S.myCards[0], S.myCards[1]];
  var board = S.commCards.slice();
  _oddsCompute(hole, board, function (r) {
    if (seq !== window._oddsSeq) return;
    if (!r) { el.innerHTML = ''; el._built = false; return; }
    // Icônes SVG officielles des 10 mains (resources/hands/ du client QML)
    var CATS = [
      [9, t('oddsRoyal'), 'royalflush'], [8, t('oddsSF'), 'straightflush'],
      [7, t('oddsQuads'), 'fourofakind'], [6, t('oddsFull'), 'fullhouse'],
      [5, t('oddsFlush'), 'flush'], [4, t('oddsStraight'), 'straight'],
      [3, t('oddsTrips'), 'threeofakind'], [2, t('oddsTwoPair'), 'twopair'],
      [1, t('oddsPair'), 'onepair'], [0, t('oddsHigh'), 'highcard']
    ];
    var rows = '';
    for (var i = 0; i < CATS.length; i++) {
      var ri = CATS[i][0], p = r.pct[ri] * 100, pw = Math.max(0, Math.min(100, p));
      var ptxt = p >= 0.5 ? Math.round(p) + '%' : (p > 0 ? '<1%' : '0%');
      var cls = pw >= 50 ? ' hot' : (pw >= 15 ? ' warm' : '');
      rows += '<div class="odds-row' + cls + '"><img class="odds-ico" src="/img/hands/' + CATS[i][2] + '.svg" alt="">'
        + '<span class="odds-cat">' + esc(CATS[i][1])
        + '</span><span class="odds-bar"><i style="width:' + pw.toFixed(1) + '%"></i></span>'
        + '<span class="odds-pct">' + ptxt + '</span></div>';
    }
    el.innerHTML = '<div class="odds-hd">' + esc(t('oddsTitle')) + (r.exact ? '' : ' <span class="odds-approx">≈</span>')
      + '</div><div class="odds-body">' + rows + '</div>';
    el._built = true;
  }, function () { return seq !== window._oddsSeq; });
}

export { calcWinProb, _hsPanelIsLight, _hsContrastCol, _hsSet, _hsHide,
         _gipAssistSync, renderPreFlopStrength, renderHandStrength,
         renderOddsMonitor };

for (const [k, v] of Object.entries({ calcWinProb, _hsPanelIsLight,
  _hsContrastCol, _hsSet, _hsHide, _gipAssistSync, renderPreFlopStrength,
  renderHandStrength, renderOddsMonitor })) window[k] = v;
window._renderOdds = renderOddsMonitor;
