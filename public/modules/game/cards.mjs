// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/game/cards.mjs
//
// Évaluation de mains Texas Hold'em : évaluateur 5 cartes historique
// (_evalFive + départage _cmpHand), meilleure main sur 5-7 cartes
// (evaluateBestHand), force pré-flop (evaluatePreFlopHand), validation
// d'encodage (normalizeHoleCard), libellé de main gagnante QML
// (_qmlWinningHandText) et distribution d'équité du moniteur d'odds
// (_oddsCompute, accéléré par le module phe vendoré, chargé paresseusement
// avec repli sur _evalFive).
//
// Historique : extrait de public/pokerth.js (extraction #1 du plan
// docs/ESM_PLAN.md). Le code legacy appelle encore ces fonctions par leurs
// noms globaux, d'où les alias window.* en fin de fichier — à retirer quand
// le dernier appelant aura migré vers les imports ES.
//
// Encodage cartes (unique, hole + community) : 0..51,
// suit = floor(n/13) (0=♦ 1=♥ 2=♠ 3=♣), rank = n % 13 (0=2 … 12=A).
// ─────────────────────────────────────────────────────────────────────────

// i18n : t() vit dans modules/i18n.mjs (chargé avant nous dans le HTML).
// Ce shim garde le module utilisable en node (tests) et robuste si i18n
// manque : on rend alors la clé brute, comme le repli de t() lui-même.
function t(key, opts) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, opts) : key;
}

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

// ── winningHandText QML (GameHandler C++, chaînes extraites du binaire
// 2.1.3) : libellé anglais de la main gagnante, format Qt-Widgets 1:1 —
// « Two Pair, Aces and Queens », « Full House, Aces full of Kings »,
// « Straight, King high »… Prend le résultat de _evalFive/_evaluateBestHand.
function _qmlWinningHandText(res) {
  // Multilingue (demande narmod 2026-07-18) : clés wh* traduites dans les 36
  // langues (format QML, rangs en lettres universelles A/K/Q/J/10…, comme les
  // faces des cartes). Repli t() : langue active → anglais → clé brute.
  if (!res) return '';
  var RN = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  var tb = res.tb || [];
  var a = RN[tb[0] != null ? tb[0] : 12], b = RN[tb[1] != null ? tb[1] : 0];
  switch (res.r) {
    case 0: return t('whHigh', { r: a });
    case 1: return t('whPair', { r: a });
    case 2: return t('whTwoPair', { a: a, b: b });
    case 3: return t('whThree', { r: a });
    case 4: return t('whStraight', { r: a });
    case 5: return t('whFlush', { r: a });
    case 6: return t('whFull', { a: a, b: b });
    case 7: return t('whFour', { r: a });
    case 8: return t('whSF', { r: a });
    case 9: return t('whRoyal');
  }
  return '';
}

// Encodage PokerTH UNIQUE pour toutes les cartes (0-indexé, 0..51) :
//   suit=['♦','♥','♠','♣'] → ♦=0, ♥=1, ♠=2, ♣=3
//   rank=['2','3',…,'K','A'] → 0..12
// Vérifié sur les assets PNG officiels (data/gfx/cards/default/*.png) :
//   0=2♦  12=A♦  13=2♥  25=A♥  26=2♠  38=A♠  39=2♣  51=A♣
// normalizeHoleCard() est désormais l'identité (validation seule).

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

// ── phe (évaluateur vendoré, public/vendor/phe.mjs) ──
// Chargé paresseusement (dynamic import) ; s'il est indisponible (très vieux
// navigateur, échec réseau au premier chargement), _phe reste null et le
// moniteur d'odds retombe sur l'évaluateur historique _evalFive — mêmes
// résultats, juste plus lent. _pheMap[n] = code phe de la carte PokerTH n
// (0..12=♦, 13..25=♥, 26..38=♠, 39..51=♣ ; valeur = n % 13, 0=2 … 12=A).
var _phe = null, _pheLoad = null, _pheMap = null;
function _ensurePhe() {
  if (_phe || _pheLoad) return _pheLoad;
  _pheLoad = import('../../vendor/phe.mjs').then(function (m) {
    var suits = ['d', 'h', 's', 'c'];
    var rk = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    var map = new Array(52);
    for (var n = 0; n < 52; n++) map[n] = m.cardCode(rk[n % 13], suits[(n / 13) | 0]);  // signature (rank, suit)
    _pheMap = map; _phe = m;
    return m;
  }).catch(function () { _pheLoad = null; return null; });
  return _pheLoad;
}
// Catégorie 0..9 (0=Höchste Karte … 8=Straight Flush, 9=Royal) pour 5 à 7
// cartes PokerTH — même échelle que _evalFive().r et GameTable.cardsChance QML.
function _pheCat(cards) {
  var codes = [];
  for (var i = 0; i < cards.length; i++) codes.push(_pheMap[cards[i]]);
  var st = _phe.evaluateCardCodes(codes);
  return st === 1 ? 9 : 8 - _phe.handRank(st);
}

// Distribution d'équité : probabilité d'obtenir chaque catégorie de main (rang
// 0..9) au showdown, à partir de mes 2 cartes + le board connu (0 à 5 cartes).
// Énumère EXACTEMENT quand il reste <= 2 cartes (flop : C(47,2)=1081 ; turn : 46 ;
// river : 1), sinon Monte-Carlo préflop (10000 tirages avec phe, 1500 en repli
// _evalFive). L'évaluation par échantillon passe par phe (7 cartes directes,
// ~20× plus rapide que les 21 combos de _evalFive) quand le module est chargé. Calcul DÉCOUPÉ en tranches ~10 ms via
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
  _ensurePhe();                       // charge phe en arrière-plan pour les prochains appels
  var usePhe = !!(_phe && _pheMap);   // choix figé pour TOUTE cette passe (pas de mix)
  function catOf(all) {               // all = [hole0, hole1, ...board] -> catégorie 0..9
    if (usePhe) return _pheCat(all);
    var res = evaluateBestHand([all[0], all[1]], all.slice(2));
    return res ? res.r : null;
  }
  var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], total = 0;
  if (need === 0) {
    var c0 = catOf(hole2.concat(b));
    if (c0 != null) { counts[c0]++; total = 1; }
    done(total ? { pct: counts.map(function (c) { return c / total; }), exact: true } : null);
    return;
  }
  var exact = (need <= 2);
  var combos = exact ? _getCombos(deck, need) : null;
  var TRIALS = exact ? combos.length : (usePhe ? 10000 : 1500);
  var n = deck.length, idx = 0;
  function now() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function chunk() {
    if (isStale && isStale()) return; // une street plus récente a pris le relais
    var start = now();
    while (idx < TRIALS) {
      var extra;
      if (exact) { extra = combos[idx]; }
      else { var picked = [], used = {}; while (picked.length < need) { var ri = (Math.random() * n) | 0; if (!used[ri]) { used[ri] = true; picked.push(deck[ri]); } } extra = picked; }
      var cat = catOf(hole2.concat(b, extra));
      if (cat != null) { counts[cat]++; total++; }
      idx++;
      if ((idx & 31) === 0 && (now() - start) > 10) break; // rendre la main toutes les ~10 ms
    }
    if (idx < TRIALS) { setTimeout(chunk, 0); }
    else { done(total ? { pct: counts.map(function (c) { return c / total; }), exact: exact } : null); }
  }
  chunk();
}

// ─── Exports ES (pour les futurs imports et les tests node) ──────────────
export {
  _getCombos, _evalFive, _cmpHand, _qmlWinningHandText,
  evaluatePreFlopHand, normalizeHoleCard, evaluateBestHand, _oddsCompute,
};

// ─── Alias legacy : pokerth.js consomme encore ces noms via le global ────
if (typeof window !== 'undefined') {
  window._cmpHand = _cmpHand;
  window._qmlWinningHandText = _qmlWinningHandText;
  window.evaluatePreFlopHand = evaluatePreFlopHand;
  window.normalizeHoleCard = normalizeHoleCard;
  window.evaluateBestHand = evaluateBestHand;
  window._oddsCompute = _oddsCompute;
  // Namespace propre pour le code déjà migré.
  window.Cards = { evaluateBestHand, evaluatePreFlopHand, normalizeHoleCard,
                   cmpHand: _cmpHand, oddsCompute: _oddsCompute,
                   winningHandText: _qmlWinningHandText };
}
