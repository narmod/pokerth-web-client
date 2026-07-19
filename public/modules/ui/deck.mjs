// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/deck.mjs
//
// Rendu des cartes et jetons : nom lisible (cardName, encodage PokerTH
// unique 0..51), résolution deck-aware des faces/dos (_deckFace/_deckBack,
// galerie /cards/<id>/ + imports via window._deckCardUrl), _refreshDeck
// (ré-application au changement de deck, sans re-render), fabrique HTML
// (cardToHtml/cardHtml), flip 3D des community cards, pucks SVG casino
// (D/SB/BB via window._pthPuckUrls des styles), et l'anneau du turn timer
// (_timerSvg).
//
// Historique : extrait de l'IIFE App de public/pokerth.js (étape 9b du plan
// docs/ESM_PLAN.md), au verbatim modulo dédentation, en quatre plages —
// renderMyCards/animateCardDeal/animateChipToPot/getSeatPositions restent
// dans l'App (état de closure). Dépendances déjà véhiculées par window
// dans le code d'origine (window._deckCardUrl, window._pthPuckUrls,
// window._refreshDeck auto-attaché dans un try node-safe).
// ─────────────────────────────────────────────────────────────────────────

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
  try { var _imp = window._deckCardUrl && window._deckCardUrl(d, n); if (_imp) return _imp; } catch (e) {}
  var ext = document.documentElement.getAttribute('data-deck-ext') || 'png';
  return '/cards/' + d + '/' + n + '.' + ext;
}
function _deckBack() {
  // Axe « Dos de carte » indépendant (theme.mjs) : 'custom' = image importée
  // (dataURL), '<deckId>' = flipside de ce deck ; '' = assorti au deck courant.
  try {
    var _ov = localStorage.getItem('pth_cardback') || '';
    if (_ov === 'custom') {
      var _im = localStorage.getItem('pth_cardback_img');
      if (_im) return _im;
    } else if (_ov) {
      try { var _imo = window._deckCardUrl && window._deckCardUrl(_ov, 'flipside'); if (_imo) return _imo; } catch (e) {}
      var _oe = localStorage.getItem('pth_cardback_ext') || 'png';
      return '/cards/' + _ov + '/flipside.' + _oe + '?v=' + (window.BUILD_VERSION || '0');
    }
  } catch (e) {}
  var d = document.documentElement.getAttribute('data-deck') || '';
  if (!d) return '';
  try { var _impb = window._deckCardUrl && window._deckCardUrl(d, 'flipside'); if (_impb) return _impb; } catch (e) {}
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
  // Cartes communes : slot vide = placeholder QML (rectangle noir 30 % +
  // bord blanc 38 %, Bible §9) au lieu d'un dos de carte. Les dos restent
  // pour les cartes adverses (isComm=false).
  const emptyCls = isComm ? ' comm-slot' : ' back';
  if (n === null || n === undefined) return '<div class="pk' + sz + emptyCls + extraCls + '"></div>';
  if (!Number.isInteger(n) || n < 0 || n > 51) {
    return '<div class="pk' + sz + emptyCls + extraCls + '"></div>';
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

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export { cardName, cardToHtml, cardHtml, flipCommCards, chipSvg, dealerChipSvg };
if (typeof window !== 'undefined') {
  // window._refreshDeck déjà attaché par le bloc (verbatim, try node-safe).
  window.cardName = cardName;
  window.cardToHtml = cardToHtml;
  window.cardHtml = cardHtml;
  window.flipCommCards = flipCommCards;
  window._pthPuck = _pthPuck;
  window.chipSvg = chipSvg;
  window.dealerChipSvg = dealerChipSvg;
  window._timerSvg = _timerSvg;
  window.Deck = { cardName, cardToHtml, cardHtml, chipSvg, dealerChipSvg };
}
