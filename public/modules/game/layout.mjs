// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/game/layout.mjs
//
// Géométrie officielle du client QML PokerTH 2.1.3 (port 1:1 de GamePage.qml,
// build 2026-06-28 + delta 2.1.3) :
//   • _qmlLandscapeLayout — ellipse paysage : boxScale par bisection de
//     faisabilité (14 itérations, plancher 0.55), buildLandscapeSlots avec
//     TOUS les correctifs (lowerSquash, sideGravity 0.25, topCosSquash 1.4,
//     lowerGravity, pairSpread, maxBottomY = morsure 55 % de la self-box),
//     angles TL/TR 230°/310°, TLo/TRo 200°/340°, radiusX ∈ [0.22, 0.36]·W.
//   • _qmlPortraitScale — bisection portrait (slots fixes, nudges ±14/−4).
//   • _officialSeatPix — mapping [self, opp…] → px (portrait slots fixes /
//     paysage ellipse), out._boxScale + out._zoomHeadroom.
//   • _applyQmlBgCenter — fond « center » calé sur communityCenterY
//     (cache de tailles naturelles via window._bgNatCache, comme avant).
//
// Fonctions PURES (les trois premières) — testées en node contre les valeurs
// de la Bible/DELTA (scripts/test-layout.mjs). Historique : extraites de
// l'IIFE App de public/pokerth.js (étape 9a du plan docs/ESM_PLAN.md), au
// verbatim modulo dédentation ; _qmlLandscapeLayout et _qmlPortraitScale
// étaient déjà attachées à window par le code d'origine.
// ─────────────────────────────────────────────────────────────────────────

// ── QML_LANDSCAPE_LAYOUT_BEGIN ──
// Port 1:1 de GamePage.qml (build officiel 2026-06-28) : boxScale par
// BISECTION de faisabilité (14 itérations, plancher 0.55, plafond
// fillCap(compact?1.7:1.4)) + buildLandscapeSlots() avec les rayons
// s-dépendants et TOUS les correctifs (lowerSquash, sideGravity,
// topCosSquash, lowerGravity, pairSpread, vMaxLower/maxBottomY,
// selfClearX). pairSpread est DÉLIBÉRÉMENT absent de feasibleAt(),
// comme dans le QML (sinon la bisection remplirait l'écart créé).
// Fonction PURE (aucun DOM) → testée en Node (window._qmlLandscapeLayout).
function _qmlLandscapeLayout(oppCnt, zW, zH, compact, zoomMul, spectating) {
  var oppBaseW = 114, oppBaseH = 84, selfBaseH = compact ? 94 : 96; // QML 2.1.3 §4.2
  // selfBaseWidth QML : 2*4 + min(cH,60) + 4 + 2*round(cH*120/168) + 4, cH = selfH-12-32 (paysage)
  var _scH = selfBaseH - 44, selfBaseW = 8 + Math.min(_scH, 60) + 4 + 2 * Math.round(_scH * 120 / 168) + 4;
  // STRICT QML : la géométrie (radiusX/Y, bande verticale, selfClearX)
  // utilise les BASES du client officiel, jamais les dimensions DOM
  // mesurées — sinon la FORME de l'ellipse diverge (constaté chez narmod :
  // dims 94×77 → rayons différents à bisection égale). Le CSS des packs
  // pokerth tient les plaques au gabarit ~114×84/96 ; un léger écart de
  // contenu est accepté, comme dans le client officiel.
  var opponentGapBase = 10, selfBadgeGapBase = 8, sideBadgeGapBase = 48;
  var gap = 4;   // STRICT QML : slack de paire de la bisection (gap = 4, les deux modes)
  // 2.1.3 (buildLandscapeSlots) : selfWeight 0.3 en wide (l'anneau se
  // resserre autour de la self, TL/TR tombent a ~230/310 au lieu de
  // 240/300) ; le landscapeCompact GARDE 0.5 (layout separe, inchange).
  // Zuschauer (QML 2.1.3) : Sitz 0 est une perle NORMALE (poids 1.0) ->
  // anneau uniforme de N sieges, sitz 0 exactement au point bas (90 deg).
  var selfWeight = spectating ? 1.0 : (compact ? 0.5 : 0.3);
  var stepDeg = oppCnt >= 1 ? 360 / (oppCnt + selfWeight) : 360;
  var firstAngle = 90 + (selfWeight * stepDeg + stepDeg) / 2;
  // Paires de l'anneau (feasibleAt QML) : en spectateur l'anneau commence au
  // siege du bas (90 deg) et compte oppCnt+1 sieges -> la paire opp0<->opp1
  // est verifiee (le wrap oppN<->opp0 est symetrique, donc couvert).
  var ringFirst = spectating ? 90 : firstAngle;
  var ringSeats = spectating ? oppCnt + 1 : oppCnt;

  // Plafond dépendant du nombre de joueurs + croissance plein écran
  // (√(w·h)) + rétreint dense sur fenêtres très larges — port exact.
  function fillCap(maxScale) {
    var base = 0.95;
    var t = Math.max(0, Math.min(1, (oppCnt - 1) / 5));
    var countCap = base + (maxScale - base) * t;
    var grow = (1 - t) * Math.max(0, (Math.sqrt(zW * zH) - 760) / 700);
    var denseShrink = t * Math.min(0.15, Math.max(0, (zW - 1024) / 4000));
    return Math.min(2.2, countCap * (1 + grow) - denseShrink);
  }

  // Géométrie s-dépendante (mêmes formules pour la bisection ET les slots).
  function geom(s, feas) {
    var visualW = oppBaseW * s, visualH = oppBaseH * s;
    // Zuschauer : pas de self-box sous l'ellipse -- son point bas EST le
    // centre du siege du bas (selfVisualH = 0, selfGapY = 0, QML verbatim).
    var selfVisualH = spectating ? 0 : selfBaseH * s;
    var sideMargin = Math.max(18, zW * 0.025) + sideBadgeGapBase * s;
    var selfGapY = spectating ? 0
        : (compact ? Math.max(8, selfBadgeGapBase * s * 0.5) : selfBadgeGapBase * s);
    var sideX = (sideMargin + visualW / 2) / Math.max(zW, 1);
    var radiusX = Math.min(0.36, Math.max(0.22, 0.5 - sideX));
    // STRICT QML : la BISECTION (feasibleAt) réserve le surplomb badge haut
    // (topBadgeExt 39·s en compact), mais buildLandscapeSlots trace les
    // slots SANS cette réserve (deux ellipses distinctes, comme le source).
    var topBadgeExt = compact ? 39 : 0;
    var topY = ((compact ? 0 : 12) + visualH / 2 + (feas ? topBadgeExt * s : 0)) / Math.max(zH, 1);
    var selfTop = zH - 4 - selfVisualH;
    var bottomY = (selfTop - selfGapY - visualH / 2) / Math.max(zH, 1);
    var centerY = (topY + bottomY) / 2;
    var radiusY = (bottomY - topY) / 2;
    var maxBottomY = (selfTop + selfVisualH * 0.55 - visualH / 2) / Math.max(zH, 1);
    var vMaxLower = radiusY > 0 ? (maxBottomY - centerY) / radiusY : 1.0;
    var selfClearX = (selfBaseW * s / 2 + visualW / 2 + 12) / Math.max(zW, 1);
    return { visualW: visualW, visualH: visualH, selfVisualH: selfVisualH,
             radiusX: radiusX, radiusY: radiusY, centerY: centerY, selfTop: selfTop,
             vMaxLower: vMaxLower, selfClearX: selfClearX };
  }

  var lowerSquash = compact ? 0.2 : 1.0;
  var sideGravity = 0.25, topCosSquash = 1.4;
  // 2.1.3 : fenetre quasi carree (aspect -> 1.0) — les sieges lateraux
  // hauts sont souleves AU-DESSUS de la community (sinon overlap avec la
  // rangee de cartes). Pondere par |cos| ; nul sur fenetres larges.
  var sqLift = Math.max(0, Math.min(1, (1.6 - zW / Math.max(zH, 1)) / 0.6));
  var gravityUpperOnly = compact;
  var lowerGravity = compact ? 0.0 : 0.15;

  // withPairSpread=false pour la bisection (comme feasibleAt QML),
  // true pour les slots finaux (comme buildLandscapeSlots QML).
  function slotVec(g, deg, withPairSpread) {
    var rad = deg * Math.PI / 180;
    var sinV = Math.sin(rad), cosV = Math.cos(rad), sinOrig = sinV;
    if (sinV > 0 && lowerSquash !== 1.0) sinV = Math.pow(sinV, lowerSquash);
    if (sinV <= 0 && Math.abs(cosV) > 1e-9)
      cosV = (cosV < 0 ? -1 : 1) * Math.pow(Math.abs(cosV), topCosSquash);
    var vFactor = sinV
                + ((!gravityUpperOnly || sinV <= 0) ? sideGravity * Math.abs(cosV) : 0)
                + (sinV > 0 ? lowerGravity * sinV : 0);
    if (withPairSpread && !compact && Math.abs(cosV) > 1e-9) {
      var ps = 0.02 * Math.abs(cosV);
      vFactor += (sinOrig < 0 ? -ps : ps);
    }
    if (vFactor > 1.0) vFactor = 1.0;
    if (vFactor < -1.0) vFactor = -1.0;
    // 2.1.3 : arc superieur aplati en wide — sieges du haut tires de 18 %
    // vers le centre (top-bogen flacher, plus d'air sous la status bar).
    if (!compact && vFactor < 0) vFactor *= 0.82;
    if (compact && !spectating && sinV > 0 && Math.abs(g.radiusX * cosV) > g.selfClearX && g.vMaxLower > vFactor)
      vFactor = vFactor + (g.vMaxLower - vFactor) * sinOrig;
    // 2.1.3 : sqLift (fenetres quasi carrees) — cote haut seulement.
    if (!compact && sinV < 0 && sqLift > 0) {
      vFactor -= 0.3 * sqLift * Math.abs(cosV);
      if (vFactor < -1.0) vFactor = -1.0;
    }
    return [cosV, vFactor];
  }

  function feasibleAt(s) {
    if (oppCnt < 2) return true;
    var g = geom(s, true);
    if (g.radiusY <= 0 || g.radiusX <= 0) return false;
    var radiusXpix = g.radiusX * zW, radiusYpix = g.radiusY * zH;
    var centerYpix = g.centerY * zH;
    // Contrainte community (wide régulier) : la rangée de cartes + badge du
    // pot doivent tenir entre la plus basse box du haut et la self-box.
    if (!compact) {
      var topOppBottom = -1e9;
      for (var iC = 0; iC < oppCnt; iC++) {
        var vC = slotVec(g, firstAngle + iC * stepDeg, false);
        if (vC[1] >= 0) continue;
        var b = centerYpix + radiusYpix * vC[1] + g.visualH / 2
              + (Math.abs(vC[0]) < 0.25 ? s * 25 : 0);
        if (b > topOppBottom) topOppBottom = b;
      }
      // STRICT QML : réserve community proportionnelle à s (rangée 64 +
      // badge pot 40 + winner 20 = 124, à 0.72·s, + pad 28) — verbatim
      // GamePage.qml feasibleAt.
      // Oberkante du contenu du bas : self-box, ou -- en spectateur -- le
      // siege du bas de l'anneau lui-meme (QML : bottomYpix - visualH/2).
      var bottomContentTop = spectating
          ? (g.centerY + g.radiusY) * zH - g.visualH / 2
          : (zH - 12 - g.selfVisualH);
      if (topOppBottom > -1e9
          && bottomContentTop - topOppBottom < 0.72 * s * 124 + 28)
        return false;
    }
    // STRICT QML (feasibleAt verbatim) : les bet-badges latéraux SONT
    // budgétés horizontalement (+sideBadgeGapBase) ; verticalement, la
    // hauteur de box seule suffit.
    var xNeeded = s * (oppBaseW + sideBadgeGapBase) + gap;
    // AJUSTEMENT WEB (narmod 2026-07-19, carte blanche) : le QML ne garantit
    // que gap=4 px de jour vertical entre boxes voisines -> a s eleve
    // (fenetres larges, 8-9 adversaires) les paires laterales L_upper/
    // L_lower semblent fusionner (constate 1719x730 M=9 : 12 px de jour a
    // s=1.651). Slack vertical PROPORTIONNEL, min 4 px, strictement sans
    // effet quand la bisection n'est pas contrainte par les paires
    // (compact, petites fenetres, M<=5 : memes s qu'avant).
    // 2e passe (narmod 19/07) : 0.14·boxH (~12·s) ne suffisait pas au
    // BADGE GAGNANT (.seat-winner-badge : 16 px + offset 6, x s) — masque
    // entre paires serrees (constate 1883x963 M=9). Budget = badge 16 +
    // offset 6 + marge 4 = 26·s (~0.31·boxH), le badge du showdown tient
    // desormais entre deux boxes voisines. ~7 % de taille en moins dans
    // les configs denses concernees.
    var yNeeded = s * oppBaseH + Math.max(gap, 26 * s);
    for (var iPair = 1; iPair < ringSeats; iPair++) {
      var v1 = slotVec(g, ringFirst + (iPair - 1) * stepDeg, false);
      var v2 = slotVec(g, ringFirst + iPair * stepDeg, false);
      if (Math.abs(v1[0] - v2[0]) * radiusXpix < xNeeded
          && Math.abs(v1[1] - v2[1]) * radiusYpix < yNeeded)
        return false;
    }
    return true;
  }

  // Heads-up : pas de paire à tester, seule la community doit tenir.
  function feasibleHeadsUp(s) {
    if (s <= 0) return false;
    var visualH = oppBaseH * s, selfVisualH = selfBaseH * s;
    var topYband = (compact ? 0 : 4) + visualH / 2;
    var topOppBottom = topYband + visualH / 2 + s * 25;
    // STRICT QML (feasibleHeadsUp verbatim) : réserve proportionnelle à s.
    // Spectateur : le contenu du bas est le siege du bas (zH - 4 - visualH).
    var bottomContentTop = spectating ? (zH - 4 - visualH) : (zH - 12 - selfVisualH);
    return bottomContentTop - topOppBottom >= 0.72 * s * 124 + 28;
  }

  // Zoom « dans le layout » : sémantique s = base × zoom, bornée par la
  // faisabilité (murs / paires / community / self). Le plafond de bisection
  // n'est relevé que pour le zoom AVANT ; le dézoom réduit proportionnellement.
  var _zm = Math.max(0.3, Math.min(2, zoomMul || 1));
  var _capBase = fillCap(compact ? 2.3 : 1.9);
  var lo = 0.55, hi = _capBase * Math.max(1, _zm), sFin;   // A : plafond officiel 2.1.3 (× zoom avant seulement)
  if (hi < lo) hi = lo;
  if (oppCnt < 2) {
    if (!feasibleHeadsUp(lo)) sFin = lo;
    else if (feasibleHeadsUp(hi)) sFin = hi;
    else { for (var iH = 0; iH < 14; iH++) { var mH = (lo + hi) / 2; if (feasibleHeadsUp(mH)) lo = mH; else hi = mH; } sFin = lo; }
  } else if (!feasibleAt(lo)) {
    sFin = lo;
  } else if (feasibleAt(hi)) {
    sFin = hi;
  } else {
    for (var it = 0; it < 14; it++) { var mid = (lo + hi) / 2; if (feasibleAt(mid)) lo = mid; else hi = mid; }
    sFin = lo;
  }

  // Sémantique du zoom (voir en tête) : sMaxZ = sFin (faisabilité au plafond
  // étendu) ; s1 = référence zoom 1 = min(sMaxZ, plafond de base) — la
  // bisection est monotone, pas besoin d'un second passage.
  var sMaxZ = sFin;
  var s1 = Math.min(sMaxZ, _capBase);
  if (_zm <= 1.001) sFin = Math.max(0.55, s1 * _zm);
  else sFin = Math.max(s1, Math.min(s1 * _zm, sMaxZ));
  // Rabot WEB (demande narmod 2026-07-16) : en paysage compact SPECTATEUR,
  // l'ellipse recupere toute la hauteur (pas de self-box) et la bisection
  // monte plus haut qu'en mode assis -> boites trop grosses sur telephone.
  // -15 % sur le resultat, spectateur compact UNIQUEMENT (assis et desktop
  // restent strict QML). Les slots sont traces au s reduit (coherents).
  if (spectating && compact) sFin = Math.max(0.55, sFin * 0.85);
  // Slots finaux aux rayons du s retenu (pairSpread actif, comme le QML).
  var gF = geom(sFin, false);
  var slots = [], raw = [];
  // Zuschauer : sitz 0 = point(90), exactement au point bas de l'ellipse
  // (slots["opp0"] du QML). Expose via seat0 ; selfX/selfY inutilises.
  var seat0 = null;
  if (spectating) {
    var v90 = slotVec(gF, 90, true);
    seat0 = { x: zW * (0.5 + gF.radiusX * v90[0]), y: zH * (gF.centerY + gF.radiusY * v90[1]) };
  }
  for (var k = 0; k < oppCnt; k++) {
    var dK = firstAngle + k * stepDeg;
    var v = slotVec(gF, dK, true);
    slots.push({ x: zW * (0.5 + gF.radiusX * v[0]), y: zH * (gF.centerY + gF.radiusY * v[1]) });
    // Slots SANS pairSpread : l'invariant de séparation garanti par la
    // bisection (exposé pour les tests déterministes).
    var v0 = slotVec(gF, dK, false);
    raw.push({ x: zW * (0.5 + gF.radiusX * v0[0]), y: zH * (gF.centerY + gF.radiusY * v0[1]) });
  }
  // ── flankWide (QML seatNudge/slotForSeat, 2.1.3 vérifié dans le source
  // extrait) : en paysage NON-compact, les 2 sièges FLANQUANT la self
  // (premier et dernier de l'ordre) situés en moitié basse descendent de
  // 0.6·hauteur de box (ils mordent la bande self, coins libres) et sont
  // tirés horizontalement contre elle : centre ± (selfW/2 + 40 + oppW/2)·s
  // + 18. Appliqué au RENDU seulement (comme pairSpread), hors bisection. ──
  if (!compact && !spectating && oppCnt >= 1) {   // flankWide : jamais en spectateur (QML slotForSeat)
    var _fkIdx = oppCnt >= 2 ? [0, oppCnt - 1] : [0];
    for (var _fi2 = 0; _fi2 < _fkIdx.length; _fi2++) {
      var _sl = slots[_fkIdx[_fi2]];
      if (!_sl || _sl.y <= 0.5 * zH) continue;
      _sl.y += oppBaseH * sFin * 0.6;
      var _dir = _sl.x < 0.5 * zW ? -1 : 1;
      var _wantC = zW / 2 + _dir * (selfBaseW * sFin / 2 + 40 * sFin + oppBaseW * sFin / 2 + 18);
      var _dX = _wantC - _sl.x;
      _sl.x += (_dir < 0 ? Math.min(0, _dX) : Math.max(0, _dX));
    }
  }
  return { s: sFin, slots: slots, raw: raw, seat0: seat0,
           // Ancre de la selfBox : QML = anchors.bottomMargin 12 en paysage
           // (wide) ; ajustement WEB (demande narmod 2026-07-17) : marge
           // visuelle 24 pour décoller la self de la barre d'action flottante
           // (le panneau web monte plus haut que la barre QML). La réserve
           // interne de la bisection garde -4 (identique au QML).
           selfX: zW * 0.5, selfY: zH - 24 - gF.selfVisualH / 2 };
}
if (typeof window !== 'undefined') window._qmlLandscapeLayout = _qmlLandscapeLayout;  // garde node ajoutée à l'extraction
// ── QML_LANDSCAPE_LAYOUT_END ──

// Positions des sièges en mode 'official' (slots fixes du client PokerTH).
// Retourne [self, opp1, opp2, …] en px relatifs à la zone (top/left = CENTRE
// du siège, cf. transform translate(-50%,-50%)). Index 0 = null : la self
// garde sa position classique. Les adversaires (ordre de table depuis la self)
// sont mappés sur les slots, séquence symétrique par nombre d'adversaires.
//   Portrait : 2 colonnes G/D + rangée haute (client QML — cf. capture).
//   Paysage  : grille périmètre, 5 sièges en haut + sièges bas (client desktop).
// Fractions = part de la zone (x: 0=gauche..1=droite, y: 0=haut..1=bas).
// Hors plage (>9 adversaires) : retourne null -> calcul classique conservé.
// ── Échelle PORTRAIT officielle (GamePage.qml boxScale, branche Hochformat) :
// bisection de faisabilité — murs (0.15·W / 0.075·H), self-box vs rangée
// bottom (opp >= 8, nudge +14 intégré : 0.215·H − 26), séparation de paires
// (voisins de slotSeqPortrait : dx OU dy >= boîte·s + 8). Plafond fillCap(1.85),
// plancher 0.55, 14 itérations. Fonction PURE (window._qmlPortraitScale).
function _qmlPortraitScale(oppCnt, zW, zH, zoomMul, spectating) {
  var oppW = 121, oppH = 71, selfH = 82;   // bases QML 2.1.3 (portrait) — STRICT : jamais les dims mesurées
  var SLOTS = { L_bottom:[0.15,0.785], L_lower:[0.15,0.65], L_upper:[0.15,0.345],
                TL:[0.15,0.21], TC:[0.50,0.075], TR:[0.85,0.21],
                R_upper:[0.85,0.345], R_lower:[0.85,0.65], R_bottom:[0.85,0.785],
                BC:[0.50,0.90] };   // BC : uniquement en spectateur (QML 2.1.3)
  var SEQ = {
    1:['TC'], 2:['TL','TR'], 3:['TL','TC','TR'],
    4:['L_upper','TL','TR','R_upper'], 5:['L_upper','TL','TC','TR','R_upper'],
    6:['L_lower','L_upper','TL','TR','R_upper','R_lower'],
    7:['L_lower','L_upper','TL','TC','TR','R_upper','R_lower'],
    8:['L_bottom','L_lower','L_upper','TL','TR','R_upper','R_lower','R_bottom'],
    9:['L_bottom','L_lower','L_upper','TL','TC','TR','R_upper','R_lower','R_bottom']
  };
  var seq = SEQ[oppCnt] || [];
  // Zuschauer (slotSeqSpectate QML) : sitz 0 prend BC (0.50, 0.90) et les
  // oppCnt suivants la sequence portrait normale -> anneau de oppCnt+1.
  if (spectating) seq = ['BC'].concat(seq);
  var gapP = 8;
  var _zm = Math.max(0.3, Math.min(2, zoomMul || 1));
  // zoomed = bisection du ZOOM AVANT : les marges de confort tombent —
  // seules restent les règles dures demandées : rester DANS le tapis
  // (murs au bord exact), ne pas se CHEVAUCHER (2 px de contact mini) et
  // ne pas recouvrir la rivière (bande médiane >= 88 px). Au repos (zoom 1),
  // les marges QML historiques (8 px, murs -4) restent inchangées.
  function feas(sT, zoomed) {
    if (sT <= 0) return false;
    var vW = oppW * sT, vH = oppH * sT, sH = selfH * sT;
    var wallM = zoomed ? 0 : 4;
    var gapC  = zoomed ? 2 : gapP;
    if (vW > 2 * (0.15 * zW - wallM)) return false;
    if (vH > 2 * (0.075 * zH - wallM)) return false;
    if (spectating) {
      // Mur bas : le siege BC (y=0.90) ne doit pas toucher le bord bas ;
      // pas de self-box a proteger (QML feasibleAtP verbatim).
      if (0.90 * zH + vH / 2 > zH - wallM) return false;
    } else if (oppCnt >= 8 && 0.215 * zH - (zoomed ? 16 : 26) - sH - vH / 2 < gapC) return false;
    if (zoomed && (0.65 - 0.345) * zH - vH < 88) return false;
    var xN = vW + gapC, yN = vH + gapC;
    for (var i = 0; i < seq.length - 1; i++) {
      var a = SLOTS[seq[i]], b = SLOTS[seq[i + 1]];
      if (!a || !b) continue;
      var dx = Math.abs(a[0] - b[0]) * zW, dy = Math.abs(a[1] - b[1]) * zH;
      if (dx < xN && dy < yN) return false;
    }
    return true;
  }
  function bisectP(hiB, commGuard) {
    var loB = 0.55; if (hiB < loB) hiB = loB;
    if (!feas(loB, commGuard)) return loB;
    if (feas(hiB, commGuard)) return hiB;
    for (var it = 0; it < 14; it++) { var mP = (loB + hiB) / 2; if (feas(mP, commGuard)) loB = mP; else hiB = mP; }
    return loB;
  }
  var base = 0.95, t = Math.max(0, Math.min(1, (oppCnt - 1) / 5));
  var countCap = base + (1.85 - base) * t;
  var grow = (1 - t) * Math.max(0, (Math.sqrt(zW * zH) - 760) / 700);
  var denseShrink = t * Math.min(0.15, Math.max(0, (zW - 1024) / 4000));
  var hiCap = Math.min(2.2, countCap * (1 + grow) - denseShrink);
  // Sémantique du zoom : s = base × zoom, BORNÉ par la faisabilité.
  //   zoom <= 1 : réduction proportionnelle directe (toujours faisable) ;
  //   zoom > 1  : croissance proportionnelle plafonnée par la bisection
  //               étendue (garde community incluse), jamais sous la base.
  var s1 = bisectP(hiCap, false);
  var sP;
  if (_zm <= 1.001) sP = s1 * _zm;
  else sP = Math.max(s1, Math.min(s1 * _zm, bisectP(hiCap * _zm, true)));
  return Math.max(0.55, sP);
}
if (typeof window !== 'undefined') window._qmlPortraitScale = _qmlPortraitScale;  // garde node ajoutée à l'extraction

function _officialSeatPix(n, isPortrait, zW, zH, oCX, oCY, oRect, boxScale, zoomMul, spectating) {
  var M = n - 1; // adversaires
  if (M < 1) return null;
  var _small = (boxScale || 1) < 0.99; // petit ecran : resserrer l'anneau vers le feutre
  // ── PORTRAIT : slots officiels QML (GameTable.qml slotPosPortrait) ──
  // Valeurs alignees 1:1 sur le client officiel + nudge px (slotForSeat) :
  // sieges du bas +14px, sieges du haut -4px (px de la zone de jeu).
  if (isPortrait) {
    var SLOTS_P = {
      L_bottom:[0.15,0.785], L_lower:[0.15,0.65], L_upper:[0.15,0.345],
      TL:[0.15,0.21], TC:[0.50,0.075], TR:[0.85,0.21],
      R_upper:[0.85,0.345], R_lower:[0.85,0.65], R_bottom:[0.85,0.785]
    };
    var SEQ_P = {
      1:['TC'], 2:['TL','TR'], 3:['TL','TC','TR'],
      4:['L_upper','TL','TR','R_upper'], 5:['L_upper','TL','TC','TR','R_upper'],
      6:['L_lower','L_upper','TL','TR','R_upper','R_lower'],
      7:['L_lower','L_upper','TL','TC','TR','R_upper','R_lower'],
      8:['L_bottom','L_lower','L_upper','TL','TR','R_upper','R_lower','R_bottom'],
      9:['L_bottom','L_lower','L_upper','TL','TC','TR','R_upper','R_lower','R_bottom']
    };
    var seqP = SEQ_P[M];
    if (!seqP) return null;
    // CALQUE 1:1 du QML officiel (slotForSeat) : position = FRACTIONS de la
    // tableZone (x*zW, y*zH), plus le nudge vertical px du build 28/06 :
    // +14 px pour L/R_lower et L/R_bottom, -4 px pour TL/TR et L/R_upper,
    // TC sans nudge. Plus aucune redistribution maison le long du feutre —
    // les sieges tombent exactement ou le client QML les met en portrait.
    var NUDGE_P = { L_bottom:14, R_bottom:14, L_lower:14, R_lower:14,
                    TL:-4, TR:-4, L_upper:-4, R_upper:-4, TC:0 };
    // Spectateur (slotSeqSpectate QML) : le joueur d'index 0 prend le slot
    // BC (0.50, 0.90, nudge 0) -- il n'y a pas de self-box -- et les M
    // suivants gardent la sequence portrait normale.
    var outP = [ spectating ? { left: 0.50 * zW, top: 0.90 * zH } : null ];
    for (var i = 0; i < seqP.length; i++) {
      var nm = seqP[i];
      outP.push({ left: SLOTS_P[nm][0] * zW, top: SLOTS_P[nm][1] * zH + (NUDGE_P[nm] || 0) });
    }
    // Échelle bisectée QML (Hochformat) : les slots sont fixes, seule
    // l'échelle empêche les chevauchements — comme le client officiel.
    outP._boxScale = _qmlPortraitScale(M, zW, zH, zoomMul, spectating);
    // Marge de zoom restante (grise le bouton + au plafond de faisabilité) :
    // l'échelle bouge-t-elle encore au cran de zoom suivant ?
    var _znP = Math.min(2, (zoomMul || 1) + 0.1);
    outP._zoomHeadroom = _qmlPortraitScale(M, zW, zH, _znP, spectating) > outP._boxScale + 0.004;
    return outP;
  }
  // ── PAYSAGE : ellipse officielle — DÉLÉGUÉE au port 1:1 du QML ──
  // (_qmlLandscapeLayout ci-dessus : bisection boxScale + rayons
  // s-dépendants + correctifs). compact = landscapeCompact QML
  // (paysage && hauteur fenêtre < 600, bible §2). L'échelle retournée
  // est propagée via out._boxScale (appliquée en transform scale sur
  // chaque siège, comme le boxScale du client officiel).
  // landscapeCompact complet (bible §2, build 28/06) : mobile = hauteur
  // < 600 ; desktop = ratio > 2.1 ET hauteur < 1300 (un 16:9 MAXIMISE,
  // ratio ~1.91, n'est PAS compact — aligne sur le client officiel 2.1.1). Union des
  // deux règles : couvre téléphones ET fenêtres desktop très aplaties.
  var _wH = (typeof window !== 'undefined') ? window.innerHeight : zH;
  var _wW = (typeof window !== 'undefined') ? window.innerWidth  : zW;
  // Adaptation WEB du landscapeCompact desktop : le QML utilise
  // ratio>2.1 && h<1300 en mesurant SA fenetre ; dans un navigateur la
  // chrome + barres systeme mangent la hauteur et gonflent le ratio ->
  // une fenetre desktop banale (ex. 1920x950, ratio 2.02-2.2) passait
  // compact a tort et ecrasait les paires de sieges laterales. On exige
  // une fenetre REELLEMENT aplatie : h < 800.
  var compact = _wH < 600 || (_wW / Math.max(_wH, 1) > 2.1 && _wH < 800);
  var lay = _qmlLandscapeLayout(M, zW, zH, compact, zoomMul, spectating);
  // Spectateur : le joueur d'index 0 est une perle normale au point bas de
  // l'ellipse (opp0 = point(90) du QML) ; sinon null (self geree a part).
  var out = [ (spectating && lay.seat0) ? { top: lay.seat0.y, left: lay.seat0.x } : null ];
  for (var ke = 0; ke < M; ke++) out.push({ top: lay.slots[ke].y, left: lay.slots[ke].x });
  out._boxScale = lay.s;
  // Marge de zoom restante (bouton +) au cran suivant — bisection pure, ~gratuit.
  var _znL = Math.min(2, (zoomMul || 1) + 0.1);
  out._zoomHeadroom = _qmlLandscapeLayout(M, zW, zH, compact, _znL, spectating).s > lay.s + 0.004;
  // Position officielle de la self = "grosse perle" au point bas de l'ellipse
  // (appliquée par l'appelant quand la player-bar est masquée). out[0] reste
  // null pour ne pas perturber le cas spectateur.
  out._self = { top: lay.selfY, left: lay.selfX };
  return out;
}

// Port de GamePage.qml tableBackgroundImage (mode center) : taille et
// position du fond calculées pour couvrir la bande tableZone(+action bar en
// wide) en étant centré sur (zoneW/2, communityCenterY), × zoom du style.
// Pose --wallpaper-dyn-size/pos (prioritaires sur --wallpaper-size/pos).
function _applyQmlBgCenter(zRect, cY) {
  var de = document.documentElement;
  function _clr() { de.style.removeProperty('--wallpaper-dyn-size'); de.style.removeProperty('--wallpaper-dyn-pos'); }
  if (de.getAttribute('data-table-fs') !== '1' || cY == null) { _clr(); return; }
  var cs = getComputedStyle(de);
  var pos = (cs.getPropertyValue('--wallpaper-pos') || '').trim();
  if (pos && pos !== 'center') { _clr(); return; }   // seuls les styles align:center
  var wp = (cs.getPropertyValue('--wallpaper') || '').trim();
  var m = wp.match(/url\((['"]?)([^'")]+)\1\)/);
  if (!m) { _clr(); return; }
  var url = m[2];
  var zsRaw = (cs.getPropertyValue('--wallpaper-size') || '').trim();
  var zoom = 1, zm = zsRaw.match(/^([\d.]+)%$/);
  if (zm) zoom = Math.max(1, parseFloat(zm[1]) / 100);   // TableBackgroundZoom
  window._bgNatCache = window._bgNatCache || {};
  var nat = window._bgNatCache[url];
  if (!nat) {
    if (!window._bgNatLoading) window._bgNatLoading = {};
    if (!window._bgNatLoading[url]) {
      window._bgNatLoading[url] = true;
      var im = new Image();
      im.onload = function () {
        window._bgNatCache[url] = { w: im.naturalWidth || 1, h: im.naturalHeight || 1 };
        try { if (typeof window._renderSeats === 'function') window._renderSeats(); } catch (e) {}
      };
      im.src = url;
    }
    return; // taille inconnue pour l'instant : cover existant en attendant
  }
  var sg = document.getElementById('s-game');
  if (!sg) { _clr(); return; }
  var sgr = sg.getBoundingClientRect();
  var wide = !(typeof window._tableZonePortrait === 'function' && window._tableZonePortrait());
  var w, h, fs, x, y;
  if (wide) {
    // Paysage : couvre la bande tableZone (+ derrière l'action bar), centré
    // sur (milieu zone, communityCenterY). Comportement historique inchangé.
    var myz = document.querySelector('.my-zone');
    var coverExtra = myz ? myz.getBoundingClientRect().height : 0;
    var reqH = 2 * Math.max(cY, zRect.height + coverExtra - cY);
    fs = Math.max(zRect.width / nat.w, reqH / nat.h) * zoom;
    w = Math.round(nat.w * fs); h = Math.round(nat.h * fs);
    x = Math.round(zRect.left - sgr.left + zRect.width / 2 - w / 2);
    y = Math.round(zRect.top - sgr.top + cY - h / 2);
  } else {
    // Portrait : PreserveAspectCrop PLEIN ÉCRAN (#s-game entier) — comme le
    // gameBackground QML. La bande tableZone ne couvrait qu'un ruban central
    // (haut/bas laissaient voir le fond de repli). Centré horizontalement +
    // sur communityCenterY, × TableBackgroundZoom.
    var cYsg = (zRect.top - sgr.top) + cY;
    var reqHfull = 2 * Math.max(cYsg, sgr.height - cYsg);
    fs = Math.max(sgr.width / nat.w, reqHfull / nat.h) * zoom;
    w = Math.round(nat.w * fs); h = Math.round(nat.h * fs);
    x = Math.round(sgr.width / 2 - w / 2);
    y = Math.round(cYsg - h / 2);
  }
  de.style.setProperty('--wallpaper-dyn-size', w + 'px ' + h + 'px');
  de.style.setProperty('--wallpaper-dyn-pos', x + 'px ' + y + 'px');
}

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export { _qmlLandscapeLayout, _qmlPortraitScale, _officialSeatPix, _applyQmlBgCenter };
if (typeof window !== 'undefined') {
  // _qmlLandscapeLayout / _qmlPortraitScale déjà attachés par le bloc (verbatim).
  window._officialSeatPix = _officialSeatPix;
  window._applyQmlBgCenter = _applyQmlBgCenter;
  window.Layout = { landscape: _qmlLandscapeLayout, portraitScale: _qmlPortraitScale,
                    seatPix: _officialSeatPix };
}
