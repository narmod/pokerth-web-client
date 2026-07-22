// ═══════════════════════════════════════════════════════════════════
// Rendu des sièges autour de la table (parité QML) — chantier ESM
// #9g-C6, dernière grande extraction. renderSeatsImmediate (999 l :
// rotation vue-joueur, avatars/drapeaux/badges, cartes adverses,
// mises/pucks D-SB-BB, timer de tour, estompage perdants /
// surbrillance gagnants, géométrie QML) + le wrapper débounce
// renderSeats (1 rendu par frame rAF) + getPlayerName / isBot /
// getPlayerInitial / getPlayerTypeBadge.
// Fonctions déplacées telles quelles. Adaptations comptées : imports
// (deck, fmt, misc, i18n, seats, layout, turn-timer, player-popup,
// table-cards) ; window.* pour _sdWinners/_sdLosers (vars top-level),
// _advGet/_getTableZoom/_tableZoomGate/_seatTraitsNow/getAvatarColor/
// _isIgnored/pkTerm (globaux script) et _timerSvg/_pthPuck (pontés
// deck.mjs, non exportés) ; 1× $( réécrit.
// ═══════════════════════════════════════════════════════════════════
import { S } from './state.mjs';
import { t } from '../i18n.mjs';
import { esc } from '../ui/misc.mjs';
import { fmtChips } from '../ui/fmt.mjs';
import { chipSvg, dealerChipSvg, cardHtml } from '../ui/deck.mjs';
import { autoScaleTable } from './seats.mjs';
import { _officialSeatPix, _applyQmlBgCenter } from './layout.mjs';
import { _timerRectSvg } from './turn-timer.mjs';
import { _ccToFlag, _pthAvatarFor, openPlayerInfoPopup } from '../ui/player-popup.mjs';
import { _ownCardsHidden } from '../ui/table-cards.mjs';

function getPlayerName(pid) { return S.players[pid] || (pid === S.myId ? S.myName : '#'+pid); }

// ── Détection bot vs humain (dans la closure = accès à players/myId/myName) ──
function isBot(pid) {
  var name = (S.players[pid] || '').toLowerCase();
  return name.startsWith('computer') || name.startsWith('bot') || name === 'bot';
}
function getPlayerInitial(pid) {
  if (pid === S.myId) {
    // Utiliser le cache ; recharger depuis localStorage si vide
    if (!S._myAvatarCache) {
      try { S._myAvatarCache = localStorage.getItem('pth_avatar') || ''; } catch(e) {}
    }
    // Never return the '__pth__' sentinel as an "initial". The seat
    // builder renders the result inside <span class="seat-initial">;
    // returning the raw sentinel surfaced as '_PTH_' on every seat
    // when the user picked the PokerTH avatar but had no image
    // downloaded yet (LAN, guest, etc). Falling back to the name's
    // first letter is the right text fallback; the image (real or
    // placeholder logo) is layered on top by the renderer.
    if (S._myAvatarCache && S._myAvatarCache !== '__pth__' && S._myAvatarCache !== '__img__') return S._myAvatarCache;
    return S.myName ? S.myName.charAt(0).toUpperCase() : '?';
  }
  // Mode local : un bot offline est identifié par la présence de son emoji
  // dans window._offlineBotAv (rempli par le serveur offline). NE PAS se
  // fier à isBot() ici : les bots offline ont des noms « humains » (The Rock,
  // Shark…) qui ne commencent pas par « bot »/« computer ».
  try { var _bavI = (pid !== S.myId) && window._offlineBotAv && window._offlineBotAv[pid]; if (_bavI) return _bavI; } catch (e) {}
  if (isBot(pid)) return '🤖';
  // Avatar reçu des autres joueurs via proxy
  if (S._playerAvatars[pid]) return S._playerAvatars[pid];
  var name = S.players[pid] || '';
  return name.charAt(0).toUpperCase() || '?';
}
function getPlayerTypeBadge(pid) {
  return ''; // Badges supprimés : 🤖 identifie les bots, pas de 👤 pour les humains
}

function renderSeatsImmediate() {
  if (window._seatEditMode) { if (document.documentElement.getAttribute('data-seat-layout') === 'custom') return; window._seatEditMode = false; }   // gel pendant l'edition (custom seul) ; auto-degele si le mode a change
  const el = document.getElementById('g-seats');
  // Clic/tap sur un siège → popup d'info du joueur. Délégation posée une
  // seule fois : #g-seats persiste, seul son contenu est recréé à chaque
  // rendu. Les sièges deviennent cliquables via CSS (.seat { pointer-events }).
  if (el && !el._seatClickBound) {
    el._seatClickBound = true;
    el.addEventListener('click', function(ev) {
      if (window._seatEditMode) return;   // pas de popup pendant l'edition (clic = drag)
      var seat = (ev.target && ev.target.closest) ? ev.target.closest('.seat[data-pid]') : null;
      if (!seat || seat.classList.contains('seat-ghost')) return; // siège vide / joueur parti
      var sp = parseInt(seat.getAttribute('data-pid'), 10);
      if (!isNaN(sp)) openPlayerInfoPopup(sp);
    });
  }
  if (!S.seats.length) { el.innerHTML = ''; return; }
  // Keep ALL original seats when computing pixel positions. Previously
  // we filtered to active-only seats here, which caused the remaining
  // players to visually rotate / re-space themselves around the felt
  // every time someone got eliminated. Users found that disorienting:
  // "the players keep moving around between hands". Now we always
  // place against the original seating order and mark the eliminated
  // ones as .seat-out so they render visually faded but in place.
  const n = S.seats.length;
  const myIdx = S.seats.indexOf(S.myId);
  let rotated = myIdx >= 0 ? [...S.seats.slice(myIdx), ...S.seats.slice(0, myIdx)] : S.seats;
  // ── Option avancée « Retirer les joueurs partis » (défaut OFF : le siège
  // fantôme grisé reste, comportement historique). Activée : les partis
  // (.gone) sortent de la table et les joueurs restants sont REPLACÉS selon
  // la table de placement du nouveau compte (slots QML M→sièges + échelle
  // bisectée), exactement comme si la partie avait ce nombre de joueurs. ──
  if (window._advGet('remove_gone', false)) {
    var _kept = rotated.filter(function (p) { var _sg = S.seatData[p]; return !(_sg && _sg.gone); });
    if (_kept.length) rotated = _kept;
  }
  try { window._seatCount = rotated.length; } catch (e) {}
  // Position seats using actual pixel coords from getBoundingClientRect
  const oval = document.querySelector('.felt-oval');
  const zone = document.getElementById('g-table-zone');
  if (!oval || !zone) return;
  // Traits du pack de sièges actif (descripteur de pack, étape 3) —
  // résolus UNE fois par rendu ; remplacent les tests en dur sur l'id.
  var _seatTr = window._seatTraitsNow();
  // Echelle de zoom courante (tablette/desktop) : chaque siege est reduit du
  // meme facteur que le feutre -> zoom uniforme. Mobile / zoom 1 -> 1 (no-op).
  var _seatZoom = 1;
  try { if (typeof window._getTableZoom === 'function' && typeof window._tableZoomGate === 'function' && window._tableZoomGate()) _seatZoom = window._getTableZoom(); } catch (e) {}
  // Petits ecrans : reduire la taille des box (avatars + texte) pour qu'elles tiennent
  // autour du feutre sans le chevaucher (le client officiel fait pareil via boxScale).
  var _seatBoxScale = 1;
  try { var _sbw = window.innerWidth, _sbh = window.innerHeight; if (Math.min(_sbw, _sbh) < 540) { var _opp = Math.max(0, rotated.length - 1); _seatBoxScale = (_sbh > _sbw) ? Math.max(0.72, 0.90 - Math.max(0, _opp - 4) * 0.026) : Math.max(0.80, 0.98 - Math.max(0, _opp - 4) * 0.022); } } catch (e) {}
  // Rabot mesuré : appliqué à TOUS les modes de placement (l'officiel le
  // ré-applique après sa bisection ; classic/custom en profitent ici).
  _seatBoxScale *= (window._seatFitShave || 1);
  // Self-box PLUS GROSSE que les adversaires, comme le client officiel,
  // avec le ratio QML PAR APPAREIL (delta 2.1.3 §4.2 — selfBaseHeight /
  // oppBaseHeight) :
  //   portrait 82/71 = 1.155 · desktop/tablette wide 96/84 = 1.143 ·
  //   landscapeCompact 94/84 = 1.119 (la tableZone est « wide » en paysage
  //   compact → opp = 84, PAS 71 ; l'ancien 1.32 surdimensionnait la self).
  // C'est l'agrandissement de BASE (zoom 0) ; le cycle de zoom des cartes
  // (#g-cardzoom) reste independant et s'ajoute par-dessus.
  var SELF_BOX_MUL = 1.143;
  try {
    var _smw = window.innerWidth, _smh = window.innerHeight;
    if (_smh > _smw) SELF_BOX_MUL = 1.155;
    else if (_smh < 600) SELF_BOX_MUL = 1.15;
    // STRICT QML (packs pokerth) : GamePlayerSelfBox est scalée par
    // boxScale COMME les adversaires (scale: tableZone.boxScale) — sa
    // proéminence vient de ses dimensions de BASE (avatar 52, cartes
    // 37×52, déjà dans le CSS des packs). Le multiplicateur émulait ce
    // ratio quand la self partageait le CSS des adversaires ; le garder
    // ferait un double boost (+14 %) et sur-réserverait la bisection.
    // Les packs non-pokerth (plate/card/bar, CSS partagé) le conservent.
    if (_seatTr.qmlSelf) SELF_BOX_MUL = 1;
  } catch (e) {}
  // Placement des sièges : 'classic' (ellipse maison, défaut) ou 'official'
  // (slots fixes du client PokerTH : grille périmètre en paysage façon client
  // desktop, colonnes G/D + rangée haute en portrait façon client QML). Les
  // positions officielles sont appliquées en surcouche après la passe classique
  // (voir _officialSeatPix + le bloc de surcouche plus bas).
  var _seatModeV = 'auto';
  try { var _sm = localStorage.getItem('pth_seat_layout'); _seatModeV = (_sm === 'pokerth-official' || _sm === 'pokerth-ellipse' || _sm === 'custom') ? _sm : 'auto'; } catch (e) {}
  // Bascule portrait/paysage : le QML decide sur la TABLEZONE, pas la
  // fenetre (GamePage.qml:453 `wide: width >= height` — tableZone =
  // fenetre - status bar - action bar, self-box INCLUSE). Equivalent web :
  // #g-table-zone + la player-bar (la self y vit quand elle est visible).
  // Avant : window.innerHeight > innerWidth -> une fenetre 573x600
  // (portrait) prenait les slots colonnes alors que le QML, dont la
  // tableZone est large (573x~410), prend l'ellipse.
  // data-seat-orient posé dans la MÊME passe que la disposition ; raffiné
  // juste après, une fois _forceSeatPortrait connu (_applySeatOrient).
  try { if (typeof window._applySeatOrient === 'function') window._applySeatOrient(); } catch (e) {}
  var _seatPortrait = (typeof window._tableZonePortrait === 'function')
    ? window._tableZonePortrait()
    : (window.innerHeight > window.innerWidth);
  var _isPhone = Math.min(window.innerWidth, window.innerHeight) < 540;
  // auto : bascule entre les deux modes officiels selon l'orientation
  //   (portrait = slots officiels, paysage = ellipse officielle 2.1.1).
  // pokerth-official = slots QML officiels forces PARTOUT (meme en paysage).
  // pokerth-ellipse  = geometrie officielle orientation-respectee (slots en
  //   portrait, ellipse officielle en paysage) = base sur l'app officielle.
  // custom = ellipse maison + glisser-deposer.
  var _applyOfficial, _forceSeatPortrait;
  // ── 4 rendus VISIBLEMENT distincts (surtout en portrait, ou auto/official/
  //    ellipse etaient auparavant identiques) ──
  if (_seatModeV === 'pokerth-official') {
    // Slots QML officiels (grille portrait) forces PARTOUT : meme
    // disposition sur TOUS les peripheriques et orientations (choix
    // narmod). NB : les ecarts inegaux entre groupes de 2 (paires de
    // slots a 0.135, trou 0.305) sont inherents a cette grille QML.
    _applyOfficial = true; _forceSeatPortrait = true;
  } else if (_seatModeV === 'pokerth-ellipse') {
    // Ellipse « collier » officielle dans LES DEUX orientations (arc ouvert vers
    // le haut, self = perle du bas). En portrait -> ovale vertical, distinct des slots.
    _applyOfficial = true; _forceSeatPortrait = false;
  } else if (_seatModeV === 'custom') {
    // Placement perso : ellipse maison + positions sauvees (glisser-deposer).
    _applyOfficial = false; _forceSeatPortrait = _seatPortrait;
  } else {
    // auto : reproduit le client QML officiel (bible §3, layout unifie) —
    // PORTRAIT = slots officiels (grille pokerth-official) ;
    // PAYSAGE = ellipse officielle (pokerth-ellipse).
    if (_seatPortrait) { _applyOfficial = true; _forceSeatPortrait = true; }
    else               { _applyOfficial = true; _forceSeatPortrait = false; }
  }
  // La disposition retenue fait foi pour l'orientation des packs de sièges
  // (pokerth-official force la grille portrait même fenêtre en paysage).
  try { if (typeof window._applySeatOrient === 'function') window._applySeatOrient(_forceSeatPortrait); } catch (e) {}
  const oRect = oval.getBoundingClientRect();
  const zRect = zone.getBoundingClientRect();
  const oCX  = oRect.left - zRect.left + oRect.width  / 2;
  const oCY  = oRect.top  - zRect.top  + oRect.height / 2;
  const isMob = window.innerWidth < 640;       // phone (kept for reference)
  const isSmall = window.innerWidth < 900;     // phone + tablet : same tight layout
  // Small screens (phone + tablet) tighten the spread so players sit close to
  // the felt; desktop (>=900) keeps the wider, original layout.
  // rx must clear oval half-width + 8px border + ~10px seat radius
  const borderClear = isSmall ? 20 : 24; // px to add beyond oval half-size
  const rxRaw = oRect.width  / 2 + borderClear + (isSmall ? oRect.width*0.06 : oRect.width*0.16);
  // Vertical-spread multipliers. On mobile we tighten BOTTOM seats a lot
  // and TOP seats moderately, to bring the players visually closer to the
  // table on small screens. Desktop (>=900) keeps the original (symmetric)
  // multipliers; tablet now shares the small-screen (mobile) values below.
  //   yMulBot : seats whose angle places them in the lower half (sin>0)
  //   yMulTop : seats in the upper half (sin<=0)
  //   yMulMe  : the local player (i=0), kept slightly lower than the other
  //             bottom seats to leave breathing room above the player-bar.
  // The two bottom side-seats (the opponents flanking the local player)
  // were overlapping the felt rim on phones, so on MOBILE ONLY we push
  // them a little lower by raising yMulBot. The local player uses yMulMe
  // and is unaffected. Desktop keeps its values; tablet uses the small-screen ones.
  const yMulBot   = isSmall ? 0.20 : 0.18;
  const yMulTop   = isSmall ? 0.20 : 0.18;
  // The seat sitting EXACTLY at the top-centre (sinAng ≈ -1, exists only
  // when n is even: 4, 6, 8, 10…) is lowered slightly toward the table
  // because the latitude angle gives it the maximum vertical projection.
  // For all other top-half seats (sinAng > -0.95), we keep yMulTop so the
  // lateral pairs don't drift horizontally toward each other.
  const yMulTopC  = isSmall ? 0.14 : 0.18;
  const yMulMe    = isSmall ? 0.16 : 0.06; // barre joueur toujours masquee (option retiree) -> self pres du rebord
  const ryBotRaw  = oRect.height / 2 + borderClear + oRect.height * yMulBot;
  const ryTopRaw  = oRect.height / 2 + borderClear + oRect.height * yMulTop;
  const ryTopCRaw = oRect.height / 2 + borderClear + oRect.height * yMulTopC;
  const ryMeRaw   = oRect.height / 2 + borderClear + oRect.height * yMulMe;
  // Clamp to zone boundaries (top seats clamped against space ABOVE the
  // oval, bottom seats clamped against space BELOW)
  const margin = isSmall ? 24 : 36;
  const rxPx  = Math.min(rxRaw,    Math.min(oCX, zRect.width - oCX) - margin);
  const ryTop = Math.min(ryTopRaw,  oCY - margin);
  const ryTopC= Math.min(ryTopCRaw, oCY - margin);
  const ryBot = Math.min(ryBotRaw,  zRect.height - oCY - margin);
  const ryMe  = Math.min(ryMeRaw,   zRect.height - oCY - margin);
  const stepA = 360 / n;
  // Lowest allowed vertical centre for a bottom seat (same floor the local
  // player's clamp already enforces): keeps seats above the player-bar.
  const botFloor = zRect.height - margin;
  const pixPos = rotated.map(function(_, i) {
    var ang = (90 - i * stepA) * Math.PI / 180;
    var sinAng = Math.sin(ang);
    // i === 0 is the local player (sin=1 by construction).
    // sinAng > 0       → bottom half → ryBot
    // sinAng < -0.95   → exact top-centre seat → ryTopC (only when n even)
    // otherwise        → top-half lateral pairs → ryTop
    var ry;
    if      (i === 0)         ry = ryMe;
    else if (sinAng > 0)      ry = ryBot;
    else if (sinAng < -0.95)  ry = ryTopC;
    else                      ry = ryTop;
    var topPos = oCY + ry * sinAng;
    // MOBILE ONLY: the two bottom side-seats (opponents flanking the local
    // player) only project sinAng (~0.5) of the radius downward, so the
    // radius-level clamp on ryBot keeps them too high — overlapping the felt
    // rim. Recompute them from the UNCLAMPED bottom radius and clamp the
    // final position instead, so they drop just outside the rim. The local
    // player (i===0) and the top seats are left exactly as before, and so
    // are tablet/desktop.
    if (isSmall && i !== 0 && sinAng > 0) {
      topPos = Math.min(oCY + ryBotRaw * sinAng, botFloor);
    }
    var leftPos = oCX + rxPx*Math.cos(ang);
    // MOBILE + n===4 ONLY: the two lateral seats (i=1 right, i=3 left) land
    // exactly at cos=±1, i.e. the maximum horizontal amplitude, so their
    // name label (max-width 84px, centre-anchored) spills past the screen
    // edge on phones. Lift them just above the top rim (still BELOW the
    // top-centre seat i=2) and pull them slightly toward the centre. The
    // local player (i===0) and the top-centre seat (i===2) are untouched,
    // as are all other player counts and tablet/desktop.
    if (isSmall && n === 4 && (i === 1 || i === 3)) {
      var dir = (i === 1) ? 1 : -1;
      topPos  = oCY - oRect.height / 2 - 26;   // remontée au-dessus du rebord
      leftPos = oCX + dir * rxPx * 0.81;       // rentrée vers le centre
    }
    return { top: topPos, left: leftPos };
  });
  // ── Placement officiel : surcouche slots fixes (portrait + paysage) ──
  // Remplace les positions des ADVERSAIRES par les slots du client PokerTH
  // (grille périmètre en paysage / colonnes G-D en portrait). La self (index 0)
  // garde sa position classique. Désactivé si la self n'est pas assise (myIdx<0)
  // ou hors plage (>9 adversaires) : on conserve alors le calcul classique.
  // -- Placement personnalise (custom) : surcouche fractions sauvees --
  // Chaque slot (0 = moi inclus) prend sa fraction de #g-table-zone si
  // elle existe ; sinon on garde la position classique calculee (repli).
  // Exclusif avec le placement officiel ci-dessous (depend du mode).
  if (_seatModeV === 'custom') {
    try {
      var _cust = (typeof window._seatCustomGet === 'function') ? window._seatCustomGet(rotated.length) : null;
      if (_cust) {
        for (var _cs = 0; _cs < pixPos.length; _cs++) {
          var _cf = _cust[_cs];
          if (_cf && typeof _cf.fx === 'number' && typeof _cf.fy === 'number') {
            pixPos[_cs] = { left: _cf.fx * zRect.width, top: _cf.fy * zRect.height };
          }
        }
      }
    } catch (e) {}
  }
  // ── Self = "grosse perle" au point bas de l'ellipse (comme le client
  // officiel) ── Épinglée au sol de la zone EN PAYSAGE dès qu'aucune
  // player-bar n'est à protéger (barre masquée OU style "pokerth" où la self
  // EST un siège). INDÉPENDANT du mode de placement : vaut pour auto /
  // officiel / ellipse ET custom sans position self sauvée. On respecte une
  // self posée à la main (custom) et la player-bar réellement affichée.
  var _pkStyleNow = !!_seatTr.qmlSelf; // géométrie self QML (trait du pack)
  var _selfHasCustom = false;
  if (_seatModeV === 'custom' && myIdx >= 0) {
    try { var _cSelf = (typeof window._seatCustomGet === 'function') ? window._seatCustomGet(rotated.length) : null;
          _selfHasCustom = !!(_cSelf && _cSelf[0] && typeof _cSelf[0].fy === 'number'); } catch (e) {}
  }
  var _selfAtPearl = (myIdx >= 0 && !_forceSeatPortrait && !_selfHasCustom);
  // Diagnostic : dans la console, tape  _seatDbg  pour voir le build réellement
  // servi + le mode de placement + si la self est bien épinglée au point bas.
  try { window._seatDbg = { build: window.BUILD_VERSION, mode: _seatModeV,
    forcePortrait: _forceSeatPortrait, pkStyle: _pkStyleNow,
    selfHasCustom: _selfHasCustom,
    selfAtPearl: _selfAtPearl }; } catch (e) {}
  window._zoomInLayout = false;
  // Sémantique QML définitive (demande narmod) : le placement de BASE est la
  // bisection QML fidèle (zoom 1, jamais altérée par le réglage de zoom), et
  // le +/− est une LOUPE uniforme PAR-DESSUS (parité zoomLayer du client
  // officiel), sur tous les écrans. _zoomInLayout reste false : c'est
  // _applyZoomTransforms qui porte la loupe.
  if (_applyOfficial) {
    try {
      var _layoutZoom = 1;   // la bisection travaille TOUJOURS à zoom 1
      var _offPos = _officialSeatPix(rotated.length, _forceSeatPortrait, zRect.width, zRect.height, oCX, oCY, oRect, _seatBoxScale, _layoutZoom, myIdx < 0);
      // Diagnostic INCONDITIONNEL (le bloc interne peut être sauté si
      // _boxScale est NaN/absent — on veut voir pourquoi).
      try {
        window._seatDbg.zone = Math.round(zRect.width) + 'x' + Math.round(zRect.height);
        window._seatDbg.offPos = _offPos ? (_offPos._boxScale != null && _offPos._boxScale === _offPos._boxScale ? 'ok' : 'boxScale=' + _offPos._boxScale) : 'null';
        window._seatDbg.rawBoxScale = _offPos ? _offPos._boxScale : null;
        window._seatDbg.dims = window._seatDimsMeasured ? JSON.parse(JSON.stringify(window._seatDimsMeasured)) : null;
      } catch (eD) {}
      // Assis (myIdx>=0) : la self (slot 0) est gérée séparément (perle) ;
      // on ne remplace que les adversaires (1+). Spectateur (myIdx<0) : pas de
      // self -> on place TOUS les slots (0 inclus) pour que l'officiel s'applique.
      var _op0 = (myIdx >= 0) ? 1 : 0;
      if (_offPos) { for (var _op = _op0; _op < pixPos.length; _op++) { if (_offPos[_op]) pixPos[_op] = _offPos[_op]; } }
      // Échelle bisectée du QML (paysage seulement) : remplace l'heuristique
      // téléphone, chaque box adverse est mise à l'échelle comme l'officiel.
      if (_offPos && _offPos._boxScale) {
        // Portrait : bisection QML pure. Paysage : sièges volontairement plus
        // petits que la bisection — desktop -10%, MOBILE COMPACT -20% (la
        // hauteur d'écran est minuscule, les boîtes pleines paraissaient
        // énormes et se touchaient ; demande narmod). Le zoom + repart de
        // cette base réduite.
        // BUGFIX 0.3.559 : `compact` n'était PAS déclaré dans cette portée →
        // ReferenceError avalée par le try : l'échelle bisectée n'était JAMAIS
        // appliquée (sièges sur l'ancienne heuristique, plus petits que le QML)
        // et le commScale continu ne tournait jamais (barre étroite). Cause
        // unique des deux symptômes remontés par narmod.
        // STRICT QML : l'échelle appliquée EST la bisection (scale:
        // tableZone.oppScale) — l'ancien −10 % desktop (ajustement web)
        // faisait des boxes plus petites que le client officiel
        // (rawBoxScale 1.41 → 1.27 constaté chez narmod, 2026-07-15).
        _seatBoxScale = _offPos._boxScale;
        // Rabot anti-chevauchement MESURÉ (voir garde post-rendu) : corrige
        // sur écran ce que la bisection théorique aurait laissé passer.
        _seatBoxScale *= (window._seatFitShave || 1);
        window._tableZoomMaxed = false;   // loupe : le plafond est géré par applyTableZoom (maxFit)
        // Diagnostic croissance-fenêtre : échelle bisectée réellement
        // appliquée + zone mesurée (comparaison entre navigateurs/tailles).
        try {
          window._seatDbg = window._seatDbg || {};
          window._seatDbg.boxScale = _seatBoxScale;
          window._seatDbg.zone = Math.round(zRect.width) + 'x' + Math.round(zRect.height);
        } catch (e) {}
        // ── communityScale CONTINU (parité QML GamePage) : la rivière/pot
        // remplit la lacune verticale mesurée entre la rangée du haut et la
        // self (paysage : avail/84, compact 66, plafond 0.70·W/264) ; en
        // portrait 0.15·H − boîte/2 − 6 sur 62, plafond (W−16)/264. Bornes
        // 0.55–1.8. Injecté dans --comm-scale (:root, inline) → il REMPLACE
        // les paliers média : rivière, pot et largeur de la barre d'action
        // grossissent avec la fenêtre comme le client QML. ──
        try { window._commScalePending = true; } catch (e) {}
      }
      // Point bas exact de l'ellipse pour la self (quand l'officiel est actif).
      // L'ÉPINGLAGE mesuré au rendu (plus bas) reste la garantie finale, même
      // si l'officiel est désactivé (custom / classique).
      if (_selfAtPearl && _offPos && _offPos._self) pixPos[0] = _offPos._self;
    } catch (e) {}
  }
  // ── Calcul SB / BB à partir du dealer ──
  // We must SKIP seats whose player has left (.gone) -- otherwise
  // the SB/BB chips get assigned to a ghost seat that hides all
  // its badges via CSS, leaving the table with no visible blinds.
  // Walk around the table until we find a non-gone seat.
  const dealerIdx = S.seats.indexOf(S.dealerPid);
  function nextActiveSeat(fromIdx, offset) {
    if (fromIdx < 0 || !S.seats.length) return -1;
    var n = S.seats.length;
    // At most n steps — if everyone is gone/out we give up gracefully.
    var idx = fromIdx;
    var stepped = 0;
    for (var k = 0; k < n; k++) {
      idx = (idx + 1) % n;
      var __sd2 = S.seatData[S.seats[idx]];
      // Skip seats that are either:
      //   - gone (player left voluntarily), or
      //   - eliminated (money <= 0 and not playing this hand,
      //     i.e. active=false) — narmod reported SB chip landing
      //     on an OUT seat. The dealer chip should walk past them.
      // BUT an ALL-IN player has money 0 while STILL in the hand
      // (active === true) and KEEPS their blind position — never skip
      // them, otherwise the SB/BB puck walks past an all-in blind onto
      // the next seat (narmod all-in in the big blind → BB puck landed
      // on the next seat, and the self-seat BB badge went missing).
      var __skip = !__sd2 || __sd2.gone || (__sd2.active === false)
                 || (__sd2.active !== true && __sd2.money != null && __sd2.money <= 0);
      if (!__skip) {
        stepped++;
        if (stepped === offset) return S.seats[idx];
      }
    }
    return -1;
  }
  const sbPid = dealerIdx >= 0 && S.seats.length > 1
    ? nextActiveSeat(dealerIdx, 1)
    : -1;
  const bbPid = dealerIdx >= 0 && S.seats.length > 2
    ? nextActiveSeat(dealerIdx, 2)
    : (S.seats.length === 2 ? S.seats[dealerIdx] : -1); // heads-up: dealer = SB
  // Mémorise SB/BB pour le popup d'info joueur (lu hors de renderSeats).
  S._lastSbPid = sbPid; S._lastBbPid = bbPid;

  // Update player-bar
  const mySd = S.seatData[S.myId] || {};
  const pbAv   = document.getElementById('g-myseat-av');
  const pbName = document.getElementById('g-myseat-name');
  const pbMon  = document.getElementById('g-myseat-money');
  const pbAct  = document.getElementById('g-myseat-action');
  const pbBar  = document.querySelector('.player-bar');
  if (pbAv) {
    // Don't write to pbAv directly here -- refreshMyAvatar() owns
    // the player-bar avatar rendering and knows about the '__pth__'
    // sentinel, the PokerTH logo placeholder (Q2=b), and the real
    // downloaded image. Calling it keeps a single source of truth
    // and prevents this update path from clobbering our <img>.
    try { window.refreshMyAvatar && window.refreshMyAvatar(); } catch(e) {}
    // Garder le vert pour moi (pas de couleur palette)
  }
  // Chips SVG dans la player bar
  const myBlindChip = S.myId === sbPid
    ? chipSvg('SB','#1565c0','#fff','#0a3d7a')
    : (S.myId === bbPid ? chipSvg('BB','#b71c1c','#fff','#6d0c0c') : '');
  var _barPuckStyle = 'style="display:inline-block;width:18px;height:18px;vertical-align:middle;flex:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.45))"';
  const myDealerBadge = S.myId === S.dealerPid
    ? dealerChipSvg().replace('class="dealer-chip"', _barPuckStyle).replace("window._pthChip('", "window._pthBarChip('")
    : '';
  const myBlindBadge = myBlindChip
    ? myBlindChip.replace('class="blind-chip"', _barPuckStyle).replace("window._pthChip('", "window._pthBarChip('")
    : '';
  if (pbName) {
    pbName.textContent = S.myName;
    // D + blind regroupés dans un seul conteneur inline-flex centré, pour
    // qu'ils soient parfaitement alignés entre eux (avant : deux <span> au
    // calage vertical différent — le jeton de blind avait un top:-1px).
    pbName.innerHTML = S.myName
      + ((myDealerBadge || myBlindBadge)
          ? '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;vertical-align:middle">'
            + myDealerBadge + myBlindBadge + '</span>'
          : '');
  }
  // Je suis "OUT" (éliminé) UNIQUEMENT si je n'ai plus de jetons ET que je
  // ne suis plus dans la donne (active === false, posé au début de la main
  // suivante en cas de bust). Un all-in laisse active === true → on NE grise
  // PAS pendant l'all-in, on attend que la main soit résolue et que je sois
  // réellement éliminé. Cohérent avec le critère des autres sièges (seat-out).
  var __amOut = !!(mySd && mySd.money != null && mySd.money <= 0
                   && mySd.active === false && !mySd.gone && !S._amSpectator);
  if (pbMon) {
    pbMon.textContent = mySd.money != null ? fmtChips(mySd.money) : '—';
    if (__amOut) {
      pbMon.innerHTML = '<span class="pb-out-tag">OUT</span> · ' + pbMon.innerHTML;
    }
  }
  if (pbAct)  pbAct.textContent  = mySd.action || '';
  if (pbBar)  {
    pbBar.classList.toggle('pb-active', S.myId === S.turnPid);
    pbBar.classList.toggle('pb-out', __amOut);
  }

  var _seatStyleV = document.documentElement.getAttribute('data-seat') || '';
  var _pkHole = !!_seatTr.holePlate; // cartes dans la boîte (trait du pack)
  var _maskMode = true; // mode masqué permanent (option retirée) : self-box = siège
  var _ownLvl = 0; try { _ownLvl = Math.min(3, Math.max(0, parseInt(localStorage.getItem('pth_big_own_cards'), 10) || 0)); } catch (e) {} // niveau "agrandir mes cartes" 0-3 (plafond = riviere)
  let h = '';
  var _apNew = {}; // signatures pucks/drapeau/action du rendu courant (anti-replay)
  rotated.forEach((pid, i) => {
    const px = pixPos[i];
    const isMe = pid === S.myId;
    const sd = S.seatData[pid] || {};
    const isDealer = pid === S.dealerPid;
    const isActive = pid === S.turnPid;
    const isOut  = sd.active === false; // eliminated or sitting out this hand
    const isGone = !!sd.gone; // player left the table — ghost seat
    // Ghost seats take precedence over eliminated: a gone player gets
    // the minimal-visibility .seat-ghost class instead of .seat-out.
    // The two are mutually exclusive (gone implies active=false), but
    // we still gate the seat-out class on !isGone to be explicit.
    // Parité GamePlayerBox QML : le portrait (oppBaseHeight 71) est
    // TOUJOURS non-wide (1 ligne « nom · $tapis »), le paysage est wide
    // (2 lignes). Depuis la fusion des packs (0.3.691), le pack unique
    // « PokerTH » suit la DISPOSITION retenue : grille portrait -> box
    // narrow, ellipse paysage -> box wide (_forceSeatPortrait, même
    // source que html[data-seat-orient]). Gardé par le trait narrowByOrient.
    var _seatNarrow = _seatTr.narrowByOrient ? _forceSeatPortrait : false;
    // ── Mise « hors boîte » (packs PokerTH), placement fidèle au client
    //    officiel. Landscape : le jeton est TOUJOURS sur un côté HORIZONTAL
    //    (extérieur) — 'l' pour les sièges nettement à gauche du centre, 'r'
    //    pour le reste (haut-centre inclus, comme la capture officielle) ;
    //    seuil = 6% de la largeur de la tableZone. Portrait : côté INTÉRIEUR
    //    (vers le pot), axe dominant l/r/t/b (le haut-centre passe en 'b').
    //    Classe betside-* sur .seat ; le CSS positionne .seat-bet en absolu.
    //    Self exclue (sa mise est dans la barre d'action). ──
    var _betSideCls = '';
    if (_seatTr.betOut) {
      var _bdx = px.left - oCX, _bdy = px.top - oCY, _bs;
      // Cote INTERIEUR des jetons/pucks des que la DISPOSITION est la
      // grille portrait (et plus seulement quand le STYLE portrait est
      // choisi) : colonnes collees aux bords d'ecran -> mises et pucks
      // vers le feutre, jamais hors ecran (demande narmod, parite QML
      // betSide).
      if (_forceSeatPortrait) {
        // Parité QML exacte (GamePage Repeater) : en portrait SEUL X compte —
        // colonne gauche (x < 0.45) → mise/puck à DROITE (vers le feutre),
        // colonne droite (x > 0.55) → à GAUCHE, centre (TC) → DESSOUS.
        // (L'ancien choix par angle envoyait la mise AU-DESSUS pour les
        // sièges du bas → SB/BB entraient en collision avec le montant
        // et la boîte voisine.)
        var _fx = px.left / Math.max(zRect.width, 1);
        _bs = _fx < 0.45 ? 'r' : (_fx > 0.55 ? 'l' : 'b');
      } else {
        _bs = (_bdx > -zRect.width * 0.06) ? 'r' : 'l';
      }
      _betSideCls = 'betside-' + _bs;
    }
    const cls = ['seat', isMe?'me':'', isDealer?'dealer':'', isActive?'active':'',
                 sd.folded && !isGone ? 'folded' : '',
                 isOut && !isGone ? 'seat-out' : '',
                 _seatNarrow ? 'seat-narrow' : '',
                 isGone ? 'seat-ghost' : '', _betSideCls].filter(Boolean).join(' ');
    var _ignHide = !isMe && window._isIgnored(getPlayerName(pid)) && !window._advGet('no_hide_ignored', false);
    const initial    = _ignHide ? ((getPlayerName(pid) || '?').charAt(0).toUpperCase() || '?') : getPlayerInitial(pid);
    const typeBadge  = getPlayerTypeBadge(pid);
    var _offBotAv = false;
    try { _offBotAv = !isMe && !_ignHide && !!(window._offlineBotAv && window._offlineBotAv[pid]); } catch (e) {}
    var _hasEmojiAv = isMe
      ? (function(){ try { var av = localStorage.getItem('pth_avatar'); return !!av && av !== '__pth__' && av !== '__img__'; } catch(e){ return false; } })()
      : (_ignHide ? false : (!!S._playerAvatars[pid] || _offBotAv));
    const avatarType = isMe
      ? (_hasEmojiAv ? ' emoji-av' : '')
      : ((isBot(pid) || _offBotAv) && !_ignHide ? ' is-bot emoji-av' : (_hasEmojiAv ? ' emoji-av is-human' : ' is-human'));
    const moneyStr = sd.money != null && sd.money >= 0 ? fmtChips(sd.money) : '—';
    // Cartes sous le siège : uniquement les adversaires au showdown
    // (mes propres cartes sont déjà visibles dans la player-bar en bas)
    let cardStr = '';
    if (!_pkHole && !isMe && sd.card1 != null && sd.card2 != null) {
      cardStr = '<div style="display:flex;gap:2px;margin-top:1px">'
        + cardHtml(sd.card1,'xsm') + cardHtml(sd.card2,'xsm') + '</div>';
    }
    h += '<div class="' + cls + ((!isMe && window._sdLosers && window._sdLosers.has(pid)) ? ' loser-fade' : '') + ((window._sdWinners && window._sdWinners.has(pid)) ? ' winner' + (px.top < 70 ? ' winner-below' : '') : '') + '" data-pid="' + pid + '"' + (isMe ? ' data-base-top="' + px.top.toFixed(1) + '" data-base-left="' + px.left.toFixed(1) + '" data-base-scale="' + (_seatBoxScale * SELF_BOX_MUL).toFixed(4) + '"' : '') + ' style="position:absolute;top:' + px.top.toFixed(1) + 'px;left:' + px.left.toFixed(1) + 'px;--sscale:' + (isMe ? (_seatBoxScale * SELF_BOX_MUL).toFixed(4) : _seatBoxScale) + ';transform:translate(-50%,-50%) scale(' + (isMe ? (_seatBoxScale * SELF_BOX_MUL).toFixed(4) : _seatBoxScale) + ')">';
    const isSB = pid === sbPid;
    const isBB = pid === bbPid;
    let blindBadge = '';
    if (isSB) blindBadge = chipSvg('SB','#1565c0','#fff','#0a3d7a');
    else if (isBB) blindBadge = chipSvg('BB','#b71c1c','#fff','#6d0c0c');
    const timerSvg = isActive ? ((_seatTr.timerRect || _seatTr.timerBar) ? '' : window._timerSvg(S._timerSec, S._timerTot)) : ''; // anneau avatar : seulement pour les packs SANS cadre rect NI barre fine
    const avatarCls = 'seat-avatar' + (isActive ? ' timing' : '') + avatarType;
    let dealerChip = isDealer ? dealerChipSvg() : '';
    // Packs PokerTH : pucks = disques crème OFFICIELS (table par défaut QML :
    // tableDealerPuck/SmallBlind/BigBlind ~ /pucks/*.svg) au lieu des chips
    // dessinés (D sombre doré, SB bleu, BB rouge) qui ne correspondent pas.
    // Un puck de thème explicite (window._pthPuck) reste prioritaire.
    if (_seatTr.pucksSide) {
      // Fidélité table par défaut QML : Dealer = disque crème officiel ;
      // SB reste BLEU et BB reste ROUGE (chipSvg ci-dessus) -> on ne touche
      // qu'au dealer. Un puck de thème explicite reste prioritaire.
      if (isDealer) dealerChip = '<img class="dealer-chip" src="' + (window._pthPuck('--puck-dealer') || '/pucks/dealer.svg') + '" alt="D" width="20" height="20">';
    }
    // ── Anti-replay des pops (sp0ck 2026-07-17 : « petit flicker ») :
    // renderSeats reconstruit l'innerHTML à chaque update d'état, ce qui
    // rejouait chipPop/seatBadgePop même quand RIEN n'avait changé pour ce
    // siège. On mémorise la signature (pucks / drapeau / action) du rendu
    // précédent par pid ; si identique → classe .no-pop (animation: none).
    var _apPrev = (window._seatAnimPrev && window._seatAnimPrev.g === S.gId) ? window._seatAnimPrev.m[pid] : null;
    var _puckSig = (isDealer ? 'D' : '') + (isSB ? 'S' : (isBB ? 'B' : ''));
    if (_apPrev && _apPrev.p === _puckSig) {
      if (dealerChip) dealerChip = dealerChip.replace('dealer-chip', 'dealer-chip no-pop');
      if (blindBadge) blindBadge = blindBadge.replace('blind-chip', 'blind-chip no-pop');
    }
    // Même anti-replay pour la mise (.seat-bet a `animation: betChipPop`) :
    // sans ça le pop du BetChip rejoue à CHAQUE renderSeats (sp0ck 2026-07-21
    // « the bet amounts still flicker, the pucks don't anymore »). On ne
    // rejoue le pop QUE si la mise a réellement changé pour ce siège.
    var _betNoPop = (_apPrev && _apPrev.b === sd.bet) ? ' no-pop' : '';
    // Packs PokerTH : pucks posés sur le CÔTÉ de la boîte -> hors de l'avatar.
    var _avPucks = _seatTr.pucksSide ? '' : (blindBadge + dealerChip);
    // Drapeau du pays sur l'avatar (coin bas-droite, comme un badge).
    // Vide si pays inconnu → rien affiché.
    const seatFlag = _ccToFlag(S._playerCountries[pid]);
    const flagBadge = seatFlag ? '<span class="seat-flag' + (_apPrev && _apPrev.f ? ' no-pop' : '') + '">' + seatFlag + '</span>' : '';
    // ── Step 3 display: if we have a downloaded PokerTH avatar for
    // this pid, slot it in as <img> on top of the initial/emoji.
    // Q1=A: official PokerTH avatar takes precedence over emoji custom
    // -- BUT only for OTHER players. For MY OWN seat, step 4 lets the
    // user choose explicitly (popup, sentinel '__pth__'). If they
    // picked an emoji or initial, we honour that here.
    let pthAvUrl = _pthAvatarFor(pid);
    if (isMe) {
      let myChoice = null;
      try { myChoice = localStorage.getItem('pth_avatar'); } catch(e) {}
      // If the user picked an emoji (or initial), suppress the
      // real avatar image for the local seat only.
      if (pthAvUrl && myChoice !== null && myChoice !== '__pth__') {
        pthAvUrl = null;
      }
      // Q2=b: user picked '__pth__' but no real image is available.
      // Show the local PokerTH chip logo as a placeholder so the
      // seat reflects their stated preference instead of falling
      // back to a bare initial letter.
      if (!pthAvUrl && myChoice === '__pth__') {
        pthAvUrl = '/favicon.svg';
      }
      // Image perso choisie localement : l'afficher sur mon siège.
      if (myChoice === '__img__') {
        try { pthAvUrl = localStorage.getItem('pth_avatar_img') || pthAvUrl; } catch(e) {}
      }
    }
    // Autres joueurs : image perso reçue via le proxy (prioritaire sur l'emoji).
    if (!isMe && S._playerImgAvatars[pid]) pthAvUrl = S._playerImgAvatars[pid];
    if (_ignHide) pthAvUrl = null;
    // ── Avatar par défaut = jeton PokerTH (fidélité client officiel) ──
    // Aucun avatar perso (image) NI emoji choisi → on affiche le
    // logo-jeton plutôt qu'un carré-lettre coloré. Vaut pour moi, les
    // adversaires humains ET les bots (tous identiques, comme l'officiel).
    // Réutilise _hasEmojiAv déjà calculé plus haut (gère aussi _ignHide).
    let _isDefaultChip = false;
    if (!pthAvUrl && !_hasEmojiAv && !_ignHide) { pthAvUrl = '/favicon.svg'; _isDefaultChip = true; }
    // Couleur unique par joueur — neutralisée pour le jeton par défaut
    // (fond neutre derrière le jeton, comme mon siège / l'officiel).
    const aColor = (isMe || _isDefaultChip) ? null : window.getAvatarColor(pid);
    const avatarStyle = aColor
      ? 'position:relative;background:' + aColor.bg + ';border-color:' + aColor.border + ';color:' + aColor.text + ';box-shadow:0 0 0 2px ' + aColor.border + '44'
      : 'position:relative';
    const pthImg = pthAvUrl
      ? '<img class="seat-pth-img" src="' + pthAvUrl + '" alt="" draggable="false">'
      : '';
    const avCls2 = avatarCls + (pthAvUrl ? ' has-pth-avatar' : '');
    h += '<div class="seat-plate">'; // pack siege : avatar + (nom/tapis) -- display:contents en classique
    // Countdown rectangulaire (style pokerth) : cadre autour de la boite.
    if (isActive && _seatTr.timerRect) h += _timerRectSvg(S._timerSec, S._timerTot, isMe);
    // Packs pokerth : drapeau retiré du coin d'avatar — le QML l'affiche
    // 22×15 en bas-gauche de la zone info (wide) et pas du tout en portrait.
    h += '<div class="' + avCls2 + '" style="' + avatarStyle + '">'
      + pthImg
      + '<span class="seat-initial">' + initial + '</span>'
      + timerSvg
      + _avPucks
      + (_seatTr.flagInfo ? '' : flagBadge)
      + typeBadge
      + '</div>';
    // Cartes self GRANDES PAR DEFAUT (niveau 0 = taille de base QML :
    // shc-big ~ cartes communes, cf. GamePlayerSelfBox). Le cycle
    // #g-cardzoom (1-5) reste un reglage utilisateur par-dessus
    // (l1/l2 plus petites, l3/l4 plus grandes). Hors style pokerth,
    // les cartes self n'apparaissent dans le siege qu'en mode masque.
    var _selfBig = isMe && !isGone && !isOut && (_seatTr.selfBigCards || _maskMode);
    // ── Badge d'action (PlayerActionBadge QML) : construit AVANT les cartes
    // pour pouvoir être centré SUR la rangée de hole-cards dans les packs
    // pokerth (x/y = cardsCenter, comme le client officiel). Hors pokerth,
    // il reste rendu dans le pied du siège (comportement historique).
    var _acCode = ({'Fold':1,'Check':2,'Call':3,'Bet':4,'Raise':5,'All-in':6})[sd.action] || 0;
    // Au tour (isActive) : l'action de la street/du tour PRECEDENT ne doit
    // pas rester affichee sur les cartes — c'est la barre/cadre de decompte
    // qui prend la place (demande narmod 2026-07-18). Le badge reapparait
    // (avec pop) des que le joueur agit, le siege n'etant alors plus actif.
    var _acStale = isActive && _acCode;   // action perimee masquee au tour
    if (_acStale) _acCode = 0;
    var _acBadge = '', _acInCards = false;
    if (_acCode) {
      var _acBase = ['','fold','check','call','bet','raise','allin'][_acCode];
      var _acKey = ['','actBadgeFold','actBadgeCheck','actBadgeCall','actBadgeBet','actBadgeRaise','actBadgeAllin'][_acCode];
      _acBadge = '<div class="seat-action-badge' + (_apPrev && _apPrev.a === _acCode ? ' no-pop' : '') + ' act-c' + _acCode + '">' + esc(window.pkTerm(_acBase, _acKey)) + '</div>';
    }
    _apNew[pid] = { p: _puckSig, f: !!seatFlag, a: _acCode, b: sd.bet }; // signature du rendu courant
    // Bloc F — PlayerTimeoutBar QML : visible tant que le siège est au tour
    // SANS badge d'action ni état gagnant. Adversaires : centrée sur les
    // cartes. SELF avec strip (pack pokerth) : dans le bandeau AU-DESSUS de
    // la box, comme le QML 2.1.3 (demande narmod 2026-07-18). La largeur du
    // remplissage est tenue à jour chaque seconde par _updateTimer.
    var _tbar = '';
    if ((_seatTr.timerBar || _seatTr.timerRect) && isActive && !_acBadge && !(window._sdWinners && window._sdWinners.has(pid))) {
      var _tfrac = Math.max(0, Math.min(1, S._timerSec / (S._timerTot || 30)));
      _tbar = '<div class="seat-timeout-bar' + (isMe ? ' me' : '') + '"><div class="stb-fill" style="width:' + (_tfrac * 100).toFixed(1) + '%"></div></div>';
    }
    var _tbarInStrip = !!_tbar && isMe && _seatTr.selfStrip; // self pokerth : barre hors box
    if ((_pkHole || _selfBig) && !isGone && !isOut) {
      var _ownHide = isMe && _ownCardsHidden();
      var _phc1 = isMe ? (_ownHide ? null : S.myCards[0]) : sd.card1;
      var _phc2 = isMe ? (_ownHide ? null : S.myCards[1]) : sd.card2;
      var _hcBigCls = _selfBig ? (' shc-big' + (_ownLvl >= 1 && _ownLvl <= 3 ? ' shc-l' + _ownLvl : '')) : '';  // 0 = base QML (85% riviere) ; 1-3 croissants, plafond riviere
      var _hcCls = 'seat-holecards' + _hcBigCls;
      var _hcSz  = _selfBig ? '' : 'xsm';
      // Adversaires : badge centré sur les hole-cards (PlayerActionBadge QML).
      // SELF : depuis sp0ck 2026-07-17 (QML 2.1.4), le badge va AU-DESSUS de
      // la box (strip) pour ne pas masquer ses propres cartes — le self est
      // donc exclu ici quand le pack a un strip (repli cartes sinon).
      var _hcBadge = (_seatTr.badgeOnCards && _acBadge && !(isMe && _seatTr.selfStrip) && !(window._sdWinners && window._sdWinners.has(pid))) ? _acBadge : ''; // visible: actionText && !isWinner (QML)
      if (_hcBadge) _acInCards = true;
      h += '<div class="' + _hcCls + '">' + cardHtml(_phc1,_hcSz) + cardHtml(_phc2,_hcSz) + _hcBadge + (_tbarInStrip ? '' : _tbar) + '</div>';
    }
    // Badge timer sous l'avatar (visible et non confondu avec l'emoji)
    if (isActive) h += '<div class="seat-timer-badge" id="stb-'+pid+'">'
      + ((S._timerSec > 0) ? S._timerSec + 's' : '') + '</div>';
    h += '<div class="seat-info">';
    h += '<div class="seat-name">' + esc(isMe ? S.myName : getPlayerName(pid)) + '</div>';
    if (_seatTr.flagInfo && !_seatNarrow) {
      // infoBar QML (wideLayout) : drapeau 22×15 en bas-gauche + stack or à droite.
      h += '<div class="seat-info-row2">' + flagBadge + '<div class="seat-money">' + moneyStr + '</div></div>';
    } else {
      h += '<div class="seat-money">' + moneyStr + '</div>';
    }
    h += '</div>';   // ferme .seat-info
    h += '</div>';   // ferme .seat-plate
    // PlayerWinnerOverlay QML : badge « WINNER » (pilule or/vert sombre) ancré
    // au-dessus de la boîte (au-dessous via .winner-below pour la plus haute).
    if (_seatTr.winnerBadge && window._sdWinners && window._sdWinners.has(pid)) {
      h += '<div class="seat-winner-badge">' + esc(t('winnerBadge')) + '</div>';
    }
    // ── Strip self : mise (BetChip) + badge d'action au-dessus de la box
    // (sp0ck 2026-07-17, aligné QML 2.1.4 : les cartes propres restent
    // lisibles). La barre de décompte reste centrée sur les cartes.
    if (_seatTr.selfStrip && isMe) {
      var _stripBet = (sd.bet > 0) ? '<div class="seat-bet strip-bet' + _betNoPop + '">' + fmtChips(sd.bet) + '</div>' : '';
      // UNIQUEMENT pour les packs à structure pokerth/QML (badgeOnCards) :
      // c'est le badge qui était sur les cartes que sp0ck a déplacé vers le
      // strip. Les autres packs gardent leur badge dans le pied du siège
      // (correction narmod 2026-07-17 : la migration ne les concerne pas).
      var _stripBadge = (_seatTr.badgeOnCards && _acBadge && !(window._sdWinners && window._sdWinners.has(pid))) ? _acBadge : '';
      if (_stripBadge) _acInCards = true; // évite le doublon dans le pied
      var _stripTb = _tbarInStrip ? _tbar : ''; // barre de décompte AU-DESSUS de la box (QML 2.1.3)
      if (_stripBet || _stripBadge || _stripTb) {
        h += '<div class="seat-self-strip' + (_stripTb ? ' has-tb' : '') + '">' + _stripBet + _stripBadge + _stripTb + '</div>';
      }
    }
    if (_seatTr.pucksSide && (blindBadge || dealerChip)) h += '<div class="seat-pucks">' + blindBadge + dealerChip + '</div>';
    h += '<div class="seat-foot">'; // pied : mise / action / cartes
    if (sd.bet) h += '<div class="seat-bet' + _betNoPop + '">' + fmtChips(sd.bet) + '</div>';
    // Action → badge préparé plus haut (posé sur les cartes en pack pokerth,
    // sinon ici dans le pied). Le texte non-action (gains au showdown,
    // '+X'/'🏆') garde le libellé simple.
    if (_acCode) {
      if (!_acInCards) h += _acBadge;
    } else if (sd.action && !_acStale) {
      h += '<div class="seat-action-label">' + esc(sd.action) + '</div>';
    }
    h += cardStr;
    h += '</div>'; // ferme .seat-foot
    h += '</div>'; // ferme .seat
  });
  el.innerHTML = h;
  window._seatAnimPrev = { g: S.gId, m: _apNew }; // anti-replay : signatures de CE rendu
  // Loupe QML : suivi différé du siège actif + suspension showdown.
  try {
    if (typeof window._loupeOnRender === 'function') {
      var _actEl0 = el.querySelector('.seat.active:not(.me)');
      window._loupeOnRender(_actEl0, !!(window._sdWinners && window._sdWinners.size), (typeof S._timerTot !== 'undefined' ? S._timerTot : 30));
    }
  } catch (eLp) {}
  // ── Garde anti-chevauchement MESURÉE (placement officiel) : après CHAQUE
  // rendu, on vérifie les rects RÉELS des plates — débordement de la zone,
  // recouvrement entre sièges (> 4 px sur les 2 axes) ou siège sur la bande
  // des cartes communes (> 6 px). En cas de violation, l'échelle est rabotée
  // de 6 % (window._seatFitShave, plancher 0.6) et on re-rend : convergence
  // en quelques frames. Vérité écran → couvre zoom hérité, angles morts du
  // port compact, dimensions mesurées en retard, etc. Le rabot se remet à 1
  // quand le nombre de sièges ou la taille de zone change. ──
  try {
    var _fitKey = rotated.length + ':' + Math.round(zRect.width) + 'x' + Math.round(zRect.height) + ':' + (_forceSeatPortrait ? 'p' : 'l');
    if (window._seatFitKey !== _fitKey) { window._seatFitKey = _fitKey; window._seatFitShave = 1; }
    // STRICT QML : AUCUN rabot post-bisection en placement officiel — la
    // bisection (verbatim GamePage.qml, équivalence Node prouvée) est la
    // seule garantie, comme le client officiel. L'ancienne garde mobile
    // (<600 px de côté min) attrapait aussi les fenêtres desktop à mi-écran
    // et spiralait vers 0.5 dès que la community effleurait une plaque.
    var _fitMob = false;
    if (!_applyOfficial || !_fitMob) { window._seatFitShave = 1; }
    else if (!window._seatFitBusy) {
      var _zrG = zone.getBoundingClientRect();
      var _prs = [];
      el.querySelectorAll('.seat:not(.seat-ghost) .seat-plate').forEach(function (pl) {
        var rr = pl.getBoundingClientRect();
        if (rr.width > 4 && rr.height > 4) _prs.push(rr);
      });
      var _badFit = false;
      for (var _fi = 0; _fi < _prs.length && !_badFit; _fi++) {
        var rA = _prs[_fi];
        if (rA.left < _zrG.left - 4 || rA.right > _zrG.right + 4 || rA.top < _zrG.top - 4 || rA.bottom > _zrG.bottom + 4) { _badFit = true; break; }
        for (var _fj = _fi + 1; _fj < _prs.length; _fj++) {
          var rB = _prs[_fj];
          var ox = Math.min(rA.right, rB.right) - Math.max(rA.left, rB.left);
          var oy = Math.min(rA.bottom, rB.bottom) - Math.max(rA.top, rB.top);
          if (ox > 2 && oy > 2) { _badFit = true; break; }
        }
      }
      if (!_badFit) {
        var _cm = document.getElementById('g-comm');
        if (_cm) {
          var rC = _cm.getBoundingClientRect();
          if (rC.width > 10) for (var _fk = 0; _fk < _prs.length; _fk++) {
            var rS = _prs[_fk];
            var cx = Math.min(rS.right, rC.right) - Math.max(rS.left, rC.left);
            var cy = Math.min(rS.bottom, rC.bottom) - Math.max(rS.top, rC.top);
            if (cx > 4 && cy > 4) { _badFit = true; break; }
          }
        }
      }
      if (_badFit && (window._seatFitShave || 1) > 0.5) {
        window._seatFitShave = Math.max(0.5, (window._seatFitShave || 1) * 0.94);
        window._seatFitBusy = true;
        setTimeout(function () { window._seatFitBusy = false; try { renderSeats(); } catch (e) {} }, 30);
      }
      try { if (window._seatDbg) { window._seatDbg.fitShave = window._seatFitShave || 1; window._seatDbg.fitBad = _badFit; } } catch (e) {}
    }
  } catch (e) {}
  // ── communityScale continu (voir bloc _commScalePending) ──
  try {
    if (window._loupeK > 1) {
      // Loupe active : rects transformés ×2 — on FIGE commScale/shift/fond
      // (le QML calcule sa communityScale hors zoom, le zoom est au-dessus).
      window._commScalePending = false;
    } else if (window._commScalePending && _applyOfficial) {
      window._commScalePending = false;
      var _csComm, _zW3 = zRect.width, _zH3 = zRect.height;
      var _commTargetY = null; // centre Y cible (px zone) — parité anchors QML
      if (_forceSeatPortrait) {
        var _oppH3 = (window._seatDimsMeasured && window._seatDimsMeasured.h > 30) ? window._seatDimsMeasured.h : 71;
        var _vHalf = 0.15 * _zH3 - _oppH3 * _seatBoxScale / 2 - 6;
        _csComm = Math.max(0.55, Math.min(1.8, (_vHalf > 0 ? _vHalf / 62 : 0.55), Math.max(0, _zW3 - 16) / 264));
        // QML (GamePage communityArea, branche portrait) :
        // verticalCenterOffset = -height*0.0025 + 5 par rapport au centre.
        _commTargetY = _zH3 / 2 - 0.0025 * _zH3 + 5;
      } else {
        // Port EXACT de GamePage.qml communityScale (branche wide) — audit
        // 2026-07-15 contre pokerth/pokerth qt6-qml. Trois corrections vs
        // l'ancien port : (1) topB = bas de la box la plus HAUTE (QML :
        // min slot y + oppH/2), pas le bas maximal de l'arc haut ; (2)
        // centre = BARYCENTRE vertical de toutes les boxes self incluse
        // (le QML a abandonné le milieu (topB+selfTop)/2) ; (3) plancher
        // boxScale·0.72 (compact 1.1) et cap boxScale·2.0 (compact 2.6).
        var _zr3 = zone.getBoundingClientRect();
        var _selfPl3 = el.querySelector('.seat.me .seat-plate');
        var _selfR3 = _selfPl3 ? _selfPl3.getBoundingClientRect() : null;
        var _selfTop3 = _selfR3 ? (_selfR3.top - _zr3.top) : (_zH3 - 100);
        var _sumY3 = _selfR3 ? (_selfR3.top + _selfR3.height / 2 - _zr3.top) : (_zH3 - 100);
        var _n3 = 1, _minB3 = Infinity;
        var _botTop3 = -Infinity, _botC3 = -Infinity; // siege du BAS de l'anneau (spectateur)
        var _rects3 = []; // rects des plates (px zone) pour le cap horizontal community
        el.querySelectorAll('.seat:not(.me):not(.seat-ghost) .seat-plate').forEach(function (pl3) {
          var rr3 = pl3.getBoundingClientRect();
          var _b3 = rr3.bottom - _zr3.top;
          if (_b3 < _minB3) _minB3 = _b3;                       // box la plus haute
          var _t3 = rr3.top - _zr3.top, _c3 = _t3 + rr3.height / 2;
          if (_c3 > _botC3) { _botC3 = _c3; _botTop3 = _t3; }   // box la plus basse
          _sumY3 += _c3; _n3++;                                 // barycentre
          _rects3.push({ t: _t3, b: _b3, l: rr3.left - _zr3.left, r: rr3.right - _zr3.left });
        });
        var _isCmp3 = _zH3 < 520 || window.innerHeight < 600;
        var _commC3 = _sumY3 / _n3;
        // Zuschauer (QML communityCenterY) : sans self-box l'anneau est
        // symetrique autour du centre de zone -> les cartes vont au MILIEU
        // de l'anneau libre, (topOpponentBottomY + selfVisualTopY)/2, ou
        // selfVisualTopY = HAUT du siege du bas de l'anneau (opp0). Le
        // barycentre ne sert qu'au mode assis (self-box incluse).
        if (myIdx < 0 && _botTop3 > -Infinity && _minB3 < Infinity) {
          _selfTop3 = _botTop3;
          _commC3 = (_minB3 + _selfTop3) / 2;
        }
        var _topB3 = (_minB3 < Infinity ? _minB3 : 0) + (_isCmp3 ? 39 : 26) * _seatBoxScale;
        var _avail3 = Math.min(_commC3 - _topB3 - 6, _selfTop3 - _commC3 - 6);
        var _gapF3 = _avail3 > 0 ? _avail3 / (_isCmp3 ? 66 : 84) : 0;
        var _cap3 = Math.min(_isCmp3 ? 2.6 : 1.8, _seatBoxScale * 2.0, (0.70 * _zW3) / 264);
        var _floor3 = _seatBoxScale * (_isCmp3 ? 1.1 : 0.72);
        _csComm = Math.max(0.55, Math.min(_cap3, Math.max(_floor3, _gapF3)));
        // ── AJUSTEMENT WEB (narmod 2026-07-19) : CAP HORIZONTAL de la
        // rangée community. Le QML ne borne la communityScale que par la
        // hauteur libre et 0.70·largeur de ZONE — jamais par la largeur
        // libre ENTRE les plates latérales. Sur fenêtres quasi carrées /
        // compactes (scan Node : 682 configs, M=3–7, jusqu'à 112 px de
        // recouvrement à 700×500 M=3), la rangée mord les sièges de côté.
        // On mesure le corridor libre entre les plates qui coupent la bande
        // verticale de la rangée (± 8 px) et on rabote _csComm pour que la
        // demi-rangée (121·cs) + marge 8 px y tienne. Sans effet quand le
        // corridor est assez large (fenêtres 16:9 desktop : cs inchangé —
        // vérifié : 476/15008 configs touchées, −15 % en moyenne). ──
        try {
          // ÉCHELLE EFFECTIVE du scaler : #g-comm vit DANS #g-table-scaler
          // (transform scale(autofit·zoom)) alors que les plates sont hors
          // scaler — la largeur VISUELLE de la rangée est 242·cs·eff, pas
          // 242·cs (constaté chez narmod : 1110×968 M=8, autofit ≈ 1.3,
          // cs cappé mais rangée encore sur Aggro Ace). Mesure identique
          // au bloc shift : rect réel / offsetHeight de .felt-oval.
          var _fEffH = 1, _fElH = document.querySelector('.felt-oval');
          if (_fElH && _fElH.offsetHeight > 0) {
            var _frH = _fElH.getBoundingClientRect();
            var _eH = _frH.height / _fElH.offsetHeight;
            if (_eH > 0.05) _fEffH = _eH;
          }
          var _bandT3 = _commC3 - 32 * _csComm * _fEffH - 8, _bandB3 = _commC3 + 32 * _csComm * _fEffH + 8;
          var _freeL3 = 0, _freeR3 = _zW3;
          for (var _hc = 0; _hc < _rects3.length; _hc++) {
            var _rh = _rects3[_hc];
            if (_rh.b > _bandT3 && _rh.t < _bandB3) {
              if (_rh.r < _zW3 / 2 && _rh.r > _freeL3) _freeL3 = _rh.r;
              if (_rh.l > _zW3 / 2 && _rh.l < _freeR3) _freeR3 = _rh.l;
            }
          }
          var _freeH3 = Math.min(_zW3 / 2 - _freeL3, _freeR3 - _zW3 / 2) - 8;
          var _csMaxH3 = _freeH3 / (121 * _fEffH);
          if (_freeH3 > 0 && _csMaxH3 < _csComm) _csComm = Math.max(0.55, _csMaxH3);
          try { window._seatDbg.commCapH = +_csMaxH3.toFixed(3); window._seatDbg.commEff = +_fEffH.toFixed(3); } catch (eDbg) {}
        } catch (eHc) {}
        // QML (communityArea, branche wide) : verticalCenterOffset =
        // communityCenterY - height/2 -> centre de la rangee = barycentre.
        _commTargetY = _commC3;
      }
      document.documentElement.style.setProperty('--comm-scale', _csComm.toFixed(3));
      // ── Fond de table « center » (parité QML tableBackgroundImage) : image
      // agrandie pour couvrir, CENTRÉE sur (milieu zone, communityCenterY),
      // × TableBackgroundZoom — le tapis du visuel tombe au centre de
      // l'ellipse comme dans le client officiel. Ne s'applique qu'aux
      // thèmes align:center (pos 'center') en mode fullscreen ; les autres
      // gardent le cover ancré bas. ──
      try { _applyQmlBgCenter(zRect, _commTargetY); } catch (eBg) {}
      // ── Largeur du panneau d'action (parité GameActionBar.panelWidth) :
      // paysage = min(barre, max(largeur VISUELLE des cartes communes, 380)),
      // centré ; portrait = pleine largeur. --abar-w consommé par le CSS. ──
      try {
        if (!_forceSeatPortrait) {
          var _cmEl2 = document.getElementById('g-comm');
          var _cw2 = _cmEl2 ? _cmEl2.getBoundingClientRect().width : 0;
          document.documentElement.style.setProperty('--abar-w', Math.round(Math.max(_cw2 || 0, 380)) + 'px');
          document.documentElement.removeAttribute('data-abar');
        } else {
          document.documentElement.style.removeProperty('--abar-w');
          // Zone portrait : paddings/gaps QML compacts sur la barre
          // (raiseSection 4/8/2, spacing 3) — récupère ~25 px de zone.
          document.documentElement.setAttribute('data-abar', 'portrait');
        }
      } catch (eW) {}
      // ── Position verticale (parité anchors QML) : la rangée .comm-row est
      // ancrée à 50% du feutre ; on la décale de (cible − centre naturel du
      // feutre), converti en px LOCAUX du scaler (le transform d'autofit/zoom
      // multiplie tout décalage posé à l'intérieur). Clamp ±40% de la zone. ──
      try {
        var _fEl3 = document.querySelector('.felt-oval');
        if (_commTargetY !== null && _fEl3 && _fEl3.offsetHeight > 0) {
          var _fr3 = _fEl3.getBoundingClientRect();
          var _natC3 = _fr3.top - zRect.top + _fr3.height / 2;
          var _eff3 = _fr3.height / _fEl3.offsetHeight;
          if (!(_eff3 > 0.05)) _eff3 = 1;
          var _shift3 = (_commTargetY - _natC3) / _eff3;
          var _clamp3 = 0.40 * _zH3 / _eff3;
          if (_shift3 > _clamp3) _shift3 = _clamp3;
          if (_shift3 < -_clamp3) _shift3 = -_clamp3;
          if (Math.abs(_shift3) < 2) _shift3 = 0;
          document.documentElement.style.setProperty('--comm-shift-y', _shift3.toFixed(1) + 'px');
          try { window._seatDbg.commShiftY = Math.round(_shift3); } catch (e4) {}
        } else {
          document.documentElement.style.removeProperty('--comm-shift-y');
        }
      } catch (e5) { try { document.documentElement.style.removeProperty('--comm-shift-y'); } catch (e6) {} }
      try { window._seatDbg.commScale = _csComm; } catch (e3) {}
    } else if (window._commScalePending) {
      window._commScalePending = false;
      document.documentElement.style.removeProperty('--comm-scale');
      document.documentElement.style.removeProperty('--comm-shift-y');
      document.documentElement.style.removeProperty('--wallpaper-dyn-size');
      document.documentElement.style.removeProperty('--wallpaper-dyn-pos');
      document.documentElement.style.removeProperty('--abar-w');
      document.documentElement.removeAttribute('data-abar');
    }
  } catch (e) { try { window._seatDbg.commErr = String(e); } catch (e2) {} }
  // Self-box : remonter si son bas depasse la zone (tapis coupe en plein
  // ecran avec le boxScale de l'ellipse). Mesure reelle -> valable pour
  // tous les styles et tous les niveaux de zoom des cartes.
  try {
    var _meEl = el.querySelector('.seat.me');
    if (_meEl && _meEl.dataset.baseTop) {
      // Coordonnees LOCALES (offsetHeight n'est pas affecte par les transforms
      // de zoom, contrairement a getBoundingClientRect) -> clamp stable a tout zoom.
      var _bh2 = _meEl.offsetHeight * _seatBoxScale * SELF_BOX_MUL;
      var _bt2 = parseFloat(_meEl.dataset.baseTop) || 0;
      // Marge basse : QML = wide ? 12 : 4 ; DÉROGATION WEB (narmod 17/07
      // paysage, 19/07 portrait) : 24 px dans les DEUX orientations pour
      // décoller la self du panneau d'action flottant (plus haut que la
      // barre QML affleurante). Une self placée à la main (custom) garde la
      // simple garde anti-débordement QML à 4 px. La réserve interne des
      // bisections reste à -4 (identique au QML), comme en paysage.
      // AJUSTEMENT WEB (narmod 22/07) — PAYSAGE MOBILE UNIQUEMENT (fenetre
      // paysage ET hauteur < 600, = landscapeCompact mobile bible §2) : la
      // zone de table est minuscule et le panneau d'action flotte juste
      // dessous ; les 24 px laissaient un trou visible entre la self-box et
      // la barre d'action. On descend a 8 px DANS CETTE VUE SEULEMENT.
      // Portrait, tablette, desktop et self custom gardent 24 / 4 a l'identique.
      var _lsCompactSelf = (typeof window !== 'undefined')
        && window.innerWidth > window.innerHeight && window.innerHeight < 600;
      var _fm2 = _selfHasCustom ? 4 : (_lsCompactSelf ? 8 : 24);
      var _floor2 = zone.clientHeight - _fm2 - _bh2 / 2;
      // Portrait : la self est ANCRÉE bas-centre comme le QML (pas seulement
      // une garde anti-débordement) — pour TOUS les styles de sièges, plus
      // seulement les packs pokerth (demande narmod 19/07 ; la player-bar
      // étant toujours masquée, aucun conflit). Custom respecté.
      var _selfPinPortrait = _forceSeatPortrait && !_selfHasCustom;
      // Mode "perle" (paysage officiel, pas de player-bar) : on ÉPINGLE la
      // self au sol de la zone par MESURE réelle à chaque rendu — garantit le
      // point bas de l'ellipse quels que soient le boxScale et le style.
      // Sinon : simple garde anti-débordement (remonte si le bas dépasse).
      if (_selfAtPearl || _selfPinPortrait || _bt2 > _floor2) {
        _meEl.dataset.baseTop = _floor2.toFixed(1);
        _meEl.style.top = _floor2.toFixed(1) + 'px';
        if (pixPos[0]) pixPos[0].top = _floor2;
      }
    }
    if (typeof window._applySelfZoomCounter === 'function') window._applySelfZoomCounter();
  } catch (e) {}
  // Mesure des tailles REELLES de boxes pour le layout ellipse (voir
  // _qmlLandscapeLayout). ATTENTION : .seat a max-width:68px et son contenu
  // visuel DEBORDE (plaque avatar+cartes+nom+cash) -> offsetWidth mesurait
  // ~68px au lieu du contour (~150px) et aggravait les chevauchements.
  // On mesure donc l'UNION des rects des enfants structurels du siege,
  // en EXCLUANT les surcouches volatiles (badge d'action, label, timer :
  // le layout QML les budgete deja via sideBadgeGap/topBadgeExt), puis on
  // divise par l'echelle appliquee (scale du siege x zoom table) pour
  // retrouver la taille intrinseque. Re-rendu UNIQUE si la mesure change
  // de plus de 2px (garde anti-boucle : _seatDimsRerender + seuil).
  try {
    var _zoomEffM = window._tableZoomEff || 1;
    var _unionSeat = function (seatEl, appliedScale) {
      var div = appliedScale * _zoomEffM;
      if (!(div > 0.05)) return null;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, found = false;
      for (var ci = 0; ci < seatEl.children.length; ci++) {
        var kid = seatEl.children[ci];
        var kc = kid.className || '';
        if (typeof kc !== 'string') kc = '';
        // Exclusions = tout ce qui vit HORS de la boîte QML (121×71/84 = la
        // box SEULE) : pucks D/SB/BB, strip self, badge winner. Le layout
        // les budgète déjà (sideBadgeGapBase 48 / selfBadgeGapBase 8 /
        // topBadgeExt 39) — les compter ici les budgétait DEUX fois
        // (dims 164×101 au lieu de ~116×85 → commScale au plancher).
        if (kc.indexOf('seat-action-badge') !== -1 || kc.indexOf('seat-action-label') !== -1 || kc.indexOf('seat-timer-badge') !== -1
            || kc.indexOf('seat-pucks') !== -1 || kc.indexOf('seat-self-strip') !== -1 || kc.indexOf('seat-winner-badge') !== -1
            // Jeton de mise (.seat-bet dans .seat-foot) : surplomb LATÉRAL
            // absolu (~40 px) budgété par la bisection via sideBadgeGapBase
            // (48, xNeeded STRICT QML). Le mesurer le comptait DEUX fois →
            // dims ~150-160 dès qu'une mise est posée → boxes rapetissées
            // et échelle qui varie selon la street.
            || kc.indexOf('seat-foot') !== -1 || kc.indexOf('seat-bet') !== -1) continue;
        var kr = kid.getBoundingClientRect();
        if (!kr.width && !kr.height) continue;
        // .seat-info (nom + stack) : largeur VARIABLE — le montant change à
        // chaque action → la mesure jitterait → re-render + nouveau boxScale
        // = « flicker » de re-scale de la table (sp0ck 2026-07-17). Comme en
        // QML (box de taille fixe, le texte n'élargit jamais le layout), la
        // rangée texte ne compte que VERTICALEMENT.
        var _vOnly = kc.indexOf('seat-info') !== -1;
        if (!_vOnly) {
          found = true;
          if (kr.left < minX) minX = kr.left;
          if (kr.right > maxX) maxX = kr.right;
        }
        if (kr.top < minY) minY = kr.top;
        if (kr.bottom > maxY) maxY = kr.bottom;
      }
      if (!found) return null;
      return { w: Math.round((maxX - minX) / div), h: Math.round((maxY - minY) / div) };
    };
    var _s0m = (window._loupeK > 1) ? null : el.querySelector('.seat:not(.me)'); // loupe : mesure figée
    var _m0m = el.querySelector('.seat.me');
    var _dims = _s0m ? _unionSeat(_s0m, _seatBoxScale) : null;
    if (_dims && _dims.w > 40 && _dims.h > 30) {
      var _selfDims = _m0m ? _unionSeat(_m0m, _seatBoxScale * SELF_BOX_MUL) : null;
      var _nsh = _selfDims ? Math.round(_selfDims.h * SELF_BOX_MUL) : 0;
      var _pdm = window._seatDimsMeasured;
      if (!_pdm || Math.abs(_pdm.w - _dims.w) > 2 || Math.abs(_pdm.h - _dims.h) > 2 || Math.abs((_pdm.sh || 0) - _nsh) > 2) {
        window._seatDimsMeasured = { w: _dims.w, h: _dims.h, sh: _nsh };
        if (!window._seatDimsRerender) {
          window._seatDimsRerender = true;
          setTimeout(function () { window._seatDimsRerender = false; try { if (typeof renderSeats === 'function') renderSeats(); } catch (e) {} }, 30);
        }
      }
    }
  } catch (e) {}
  S._lastPixPos = pixPos;
  // Patcher l'avatar du joueur local immédiatement après le rendu.
  // Anti-flicker safety net: re-applies the emoji to .seat-initial
  // after a renderSeats() in case it lost it. Skipped entirely when
  // the user picked the PokerTH avatar -- in that case the renderer
  // already put an <img> in place and the .seat-initial is hidden
  // by .has-pth-avatar > .seat-initial { display:none } anyway.
  if (S._myAvatarCache && S._myAvatarCache !== '__pth__' && S._myAvatarCache !== '__img__') {
    requestAnimationFrame(function() {
      var mySeats = document.querySelectorAll('#g-seats .seat.me');
      mySeats.forEach(function(seat) {
        var ini = seat.querySelector('.seat-initial');
        if (ini && ini.textContent !== S._myAvatarCache) {
          ini.textContent = S._myAvatarCache;
          var av2 = seat.querySelector('.seat-avatar');
          if (av2) av2.classList.add('emoji-av');
        }
      });
    });
  }
  // ── Cible des animations de mise (jetons volants) : le POT BADGE
  // (#g-potbar, au-dessus des cartes — parité QML) et non plus le centre
  // du feutre, qui tombe au milieu de la rangée community (narmod 19/07 :
  // « les animations de mise vont vers les cartes de la rivière pas vers
  // le pot »). Replis : badge masqué (pot vide) → point juste au-dessus
  // de la rangée de cartes ; sinon → centre du feutre (historique). ──
  var _ov2 = document.querySelector('.felt-oval');
  var _pb2 = document.getElementById('g-potbar');
  if (_pb2 && _pb2.offsetParent !== null) {
    var _pbr2 = _pb2.getBoundingClientRect();
    if (_pbr2.width > 4) S._potCenter = { x: _pbr2.left + _pbr2.width / 2, y: _pbr2.top + _pbr2.height / 2 };
    else _pb2 = null;
  } else _pb2 = null;
  if (!_pb2) {
    var _cm2 = document.getElementById('g-comm');
    var _cmr2 = _cm2 ? _cm2.getBoundingClientRect() : null;
    if (_cmr2 && _cmr2.width > 10) S._potCenter = { x: _cmr2.left + _cmr2.width / 2, y: _cmr2.top - 14 };
    else if (_ov2) { var _or2 = _ov2.getBoundingClientRect();
      S._potCenter = { x: _or2.left + _or2.width / 2, y: _or2.top + _or2.height / 2 }; }
  }
  requestAnimationFrame(function() {
    autoScaleTable();
    setTimeout(autoScaleTable, 150);
    // Le badge « main gagnante » (s'il est visible) suit le repositionnement
    // des cartes communes recalculé ci-dessus (narmod 19/07).
    try { if (window._repositionWinHandBadge) window._repositionWinHandBadge(); } catch (e) {}
    setTimeout(function(){ try { if (window._repositionWinHandBadge) window._repositionWinHandBadge(); } catch (e) {} }, 160);
  });
}

// Multiple back-to-back renderSeats() calls (bot bursts, PlayersActionDone
// floods, server replays) used to each trigger a full DOM rebuild + reflow.
// With this wrapper, all calls within the same animation frame share ONE
// actual render at the next rAF tick (~16 ms). The DOM still reflects the
// latest game state — we never skip data, we just batch the paint.
function renderSeats() {
  if (S._seatsRenderPending) return;
  S._seatsRenderPending = true;
  requestAnimationFrame(function() {
    S._seatsRenderPending = false;
    renderSeatsImmediate();
  });
}

export { getPlayerName, isBot, getPlayerInitial, getPlayerTypeBadge,
         renderSeatsImmediate, renderSeats };

for (const [k, v] of Object.entries({ getPlayerName, isBot,
  getPlayerInitial, getPlayerTypeBadge, renderSeatsImmediate,
  renderSeats })) window[k] = v;
