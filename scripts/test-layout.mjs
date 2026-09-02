#!/usr/bin/env node
// Deterministic tests for public/modules/game/layout.mjs (step 9a of
// docs/ESM_PLAN.md). These lock the OFFICIAL QML 2.1.3 geometry (Bible
// 2026-06-28 + DELTA_QML_2_1_3) with exact and structural invariants:
// portrait slot fractions and sequences, nudges, bisection bounds, landscape
// ellipse symmetry and self anchoring. Pure math — no DOM stubs needed for
// the three pure functions.
// Run: node scripts/test-layout.mjs
import {
  _qmlLandscapeLayout, _qmlPortraitScale, _qmlPortraitLayout, _officialSeatPix,
} from '../public/modules/game/layout.mjs';

// Géométrie héritée (Bible 2.1.3/2.1.4) : épinglée sur classic + desktop —
// les valeurs attendues ci-dessous ont été établies AVANT le socle inset dans
// les bases (upstream 414a89c3) et les rangées mobiles (06db9866).
const LEGACY = { inset: false, mobile: false };

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const близко = (a, b, eps) => Math.abs(a - b) <= (eps == null ? 0.51 : eps);

const zW = 600, zH = 1000;   // tableZone portrait
const seat = (n, portrait) => _officialSeatPix(n, portrait, portrait ? zW : 1200, portrait ? zH : 560,
  (portrait ? zW : 1200) / 2, (portrait ? zH : 560) / 2, null, 1, 1, false, LEGACY);

// ── PORTRAIT : slots officiels (Bible §3.1/§3.2) ──
// 1) M=1 -> TC (0.50, 0.075) ; nudge TC = 0
const p2 = seat(2, true);            // n=2 joueurs -> M=1 adversaire
ok(p2 && p2.length === 2 && p2[0] === null, 'portrait: index 0 (self) = null (position classique)');
ok(близко(p2[1].left, 0.50 * zW) && близко(p2[1].top, 0.075 * zH),
   'portrait M=1: TC = (0.50, 0.075) sans nudge — ' + p2[1].left + ',' + p2[1].top);

// 2) M=2 -> TL/TR (0.15/0.85, 0.21) avec nudge −4 px
const p3 = seat(3, true);
ok(близко(p3[1].left, 0.15 * zW) && близко(p3[1].top, 0.21 * zH - 4),
   'portrait M=2: TL = (0.15, 0.21·H − 4)');
ok(близко(p3[2].left, 0.85 * zW) && близко(p3[2].top, 0.21 * zH - 4),
   'portrait M=2: TR symétrique');

// 3) M=9 -> séquence complète, L_bottom (0.785) avec nudge +14
const p10 = seat(10, true);
ok(p10 && p10.length === 10, 'portrait M=9: 10 entrées');
ok(близко(p10[1].left, 0.15 * zW) && близко(p10[1].top, 0.785 * zH + 14),
   'portrait M=9: L_bottom = (0.15, 0.785·H + 14)');
ok(близко(p10[5].left, 0.50 * zW) && близко(p10[5].top, 0.075 * zH),
   'portrait M=9: TC en 5e position (séquence officielle)');

// 4) Symétrie G/D systématique pour tous les M pairs et impairs
for (const n of [3, 4, 5, 6, 7, 8, 9, 10]) {
  const p = seat(n, true), M = n - 1;
  let sym = true;
  for (let i = 1; i <= M; i++) {
    const j = M + 1 - i;
    if (!близко(p[i].left + p[j].left, zW, 1.1)) sym = false;
    if (!близко(p[i].top, p[j].top, 1.1)) sym = false;
  }
  ok(sym, `portrait M=${M}: symétrie gauche/droite exacte`);
}

// 5) TC seulement pour M impair (Bible : jamais pour un nombre pair)
for (const n of [3, 5, 7, 9, 11]) {
  const p = seat(n, true); if (!p) continue;
  const hasTC = p.slice(1).some((q) => близко(q.left, zW / 2, 1.1));
  ok(hasTC === ((n - 1) % 2 === 1), `portrait M=${n - 1}: TC ${((n - 1) % 2 === 1) ? 'présent' : 'absent'}`);
}

// 6) Hors plage : M > 9 -> null (repli calcul classique)
ok(seat(11, true) === null, 'portrait M=10: null (hors plage officielle)');

// ── Bisection portrait (_qmlPortraitScale, Bible §3.3 adaptée portrait) ──
const s3 = _qmlPortraitScale(3, zW, zH, 1, false, LEGACY);
const s9 = _qmlPortraitScale(9, zW, zH, 1, false, LEGACY);
ok(s3 >= 0.55 && s3 <= 1.85, 'portraitScale M=3 dans [0.55, 1.85] : ' + s3.toFixed(3));
// NB : pas de monotonie en portrait — chaque M a SON jeu de slots, la
// bisection peut donner s9 > s3 (M=3 est contraint par le trio TL/TC/TR).
ok(s9 >= 0.55 && s9 <= 1.85, 'portraitScale M=9 dans [0.55, 1.85] : ' + s9.toFixed(3));
ok(_qmlPortraitScale(3, zW, zH, 1, false, LEGACY) === s3, 'portraitScale déterministe');

// ── PAYSAGE : ellipse officielle (Bible §3.3 + DELTA) ──
const lW = 1200, lH = 560;
const lay5 = _qmlLandscapeLayout(5, lW, lH, false, 1, false, LEGACY);
ok(lay5 && Array.isArray(lay5.slots) && lay5.slots.length === 5, 'landscape M=5: 5 slots');
ok(lay5.s >= 0.55, 'landscape M=5: boxScale >= plancher 0.55 (' + lay5.s.toFixed(3) + ')');
ok(близко(lay5.selfX, lW / 2, 0.6), 'landscape: self ancrée au centre horizontal');
ok(lay5.selfY > lH * 0.6, 'landscape: self dans la moitié basse');
// symétrie des adversaires autour du centre + tous dans la zone
let symL = true, inZone = true;
for (let i = 0; i < 5; i++) {
  const a = lay5.slots[i], b = lay5.slots[4 - i];
  if (!близко(a.x + b.x, lW, 2)) symL = false;
  if (!близко(a.y, b.y, 2)) symL = false;
  if (a.x < 0 || a.x > lW || a.y < 0 || a.y > lH) inZone = false;
}
ok(symL, 'landscape M=5: adversaires symétriques autour du centre');
ok(inZone, 'landscape M=5: tous les slots dans la zone');
// M=2 -> TL/TR : même hauteur (angles 230°/310° du delta 2.1.3, symétriques)
const lay2 = _qmlLandscapeLayout(2, lW, lH, false, 1, false, LEGACY);
ok(близко(lay2.slots[0].y, lay2.slots[1].y, 2) && близко(lay2.slots[0].x + lay2.slots[1].x, lW, 2),
   'landscape M=2: TL/TR même y, x miroirs (angles 230/310 symétriques)');
// densité : s(9) <= s(3)
const l3 = _qmlLandscapeLayout(3, lW, lH, false, 1, false, LEGACY);
const l9 = _qmlLandscapeLayout(9, lW, lH, false, 1, false, LEGACY);
ok(l9.s <= l3.s + 1e-9, 'landscape: boxScale décroît avec la densité (' + l9.s.toFixed(3) + ' <= ' + l3.s.toFixed(3) + ')');
ok(_qmlLandscapeLayout(5, lW, lH, false, 1, false, LEGACY).s === lay5.s, 'landscape déterministe');
// compact : la moitié basse est écrasée vers la self (lowerSquash)
const layC = _qmlLandscapeLayout(5, lW, 480, true, 1, false, LEGACY);
ok(layC && layC.s >= 0.55, 'landscape compact: bisection valide (' + layC.s.toFixed(3) + ')');
// compact assis, zone tres plate (mobile landscape 844x227) : cap hauteur ->
// la self ne remplit plus toute la hauteur a faible effectif (narmod 2026-07-20).
const layFlat = _qmlLandscapeLayout(3, 844, 227, true, 1, false, LEGACY);
ok(layFlat.s <= 0.28 * 227 / 94 + 1e-6, 'landscape compact plat: self plafonnee a 28% zH (' + layFlat.s.toFixed(3) + ')');

// ── _officialSeatPix paysage publie _boxScale + _zoomHeadroom ──
const lp = seat(6, false);
ok(lp && typeof lp._boxScale === 'number' && lp._boxScale >= 0.55, 'seatPix paysage: _boxScale publié');
ok(typeof lp._zoomHeadroom === 'boolean', 'seatPix paysage: _zoomHeadroom booléen');

// ── Spectateur paysage : remontée additive des flancs de la perle (narmod
// 2026-07-20). Base QML inchangée pour les autres sièges ; slots[0] et
// slots[oppCnt-1] remontés sur l'ellipse (symétriques, sans chevauchement). ──
const oppBW = 114, oppBH = 84;
function overlapsAny(boxes, s) {
  const bw = oppBW * s, bh = oppBH * s;
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const ox = Math.min(a.x + bw / 2, b.x + bw / 2) - Math.max(a.x - bw / 2, b.x - bw / 2);
      const oy = Math.min(a.y + bh / 2, b.y + bh / 2) - Math.max(a.y - bh / 2, b.y - bh / 2);
      if (ox > 2 && oy > 2) return true;
    }
  return false;
}
[[7, 1920, 900, false], [9, 1920, 900, false], [7, 1366, 700, false], [7, 844, 390, true]].forEach(function (cfg) {
  const N = cfg[0], W = cfg[1], H = cfg[2], C = cfg[3];
  const sp = _qmlLandscapeLayout(N, W, H, C, 1, true, LEGACY);
  const first = sp.slots[0], last = sp.slots[N - 1];
  ok(sp.seat0 && близко(sp.seat0.x, W / 2, 2), 'spectateur N=' + N + ' @' + W + 'x' + H + ': perle centrée en bas');
  ok(first.y < sp.seat0.y - 1 && last.y < sp.seat0.y - 1,
     'spectateur N=' + N + ': flancs J1/J(N) remontés au-dessus de la perle');
  ok(близко(first.y, last.y, 1) && близко(first.x + last.x, W, 2),
     'spectateur N=' + N + ': remontée symétrique (même y, x miroirs)');
  const boxes = [sp.seat0].concat(sp.slots.map(function (p) { return { x: p.x, y: p.y }; }));
  ok(!overlapsAny(boxes, sp.s), 'spectateur N=' + N + ': aucun chevauchement après remontée');
});
// heads-up (2 joueurs) spectateur : l'unique adversaire est en haut, pas de remontée parasite
const spHU = _qmlLandscapeLayout(1, 1280, 620, false, 1, true, LEGACY);
ok(spHU.slots.length === 1 && spHU.slots[0].y < 0.5 * 620, 'spectateur heads-up: adversaire en haut, intact');
// ── Recentrage vertical du ring spectateur (QML stable) : marges haut/bas
// égales sur le ring fini (perle + sièges), à ±1 px. ──
[[7, 1920, 900, false], [9, 1920, 900, false], [5, 1366, 700, false], [7, 844, 390, true]].forEach(function (cfg) {
  const N = cfg[0], W = cfg[1], H = cfg[2], C = cfg[3];
  const sp = _qmlLandscapeLayout(N, W, H, C, 1, true, LEGACY);
  const half = oppBH * sp.s / 2;
  const all = [sp.seat0].concat(sp.slots);
  let mn = Infinity, mx = -Infinity;
  all.forEach(function (p) { if (p.y < mn) mn = p.y; if (p.y > mx) mx = p.y; });
  const topM = mn - half, botM = H - (mx + half);
  ok(близко(topM, botM, 1), 'spectateur N=' + N + ' @' + W + 'x' + H + ': ring recentré (marges ' +
     topM.toFixed(1) + '/' + botM.toFixed(1) + ')');
});

// ── 2.1.8 : socle inset dans les bases + rangées portrait mobiles ─────────
// (upstream 414a89c3 + 06db9866)
const IN_D = { inset: true, mobile: false };   // inset desktop
const IN_M = { inset: true, mobile: true };    // inset mobile (téléphone)
const CL_M = { inset: false, mobile: true };   // classic mobile

// 1) Le socle dans les bases : à espace égal, l'échelle inset <= classic
// (la box est 20 px plus haute, la bisection doit le payer).
for (const [M, W, H] of [[5, 600, 1000], [9, 600, 1000], [7, 390, 740]]) {
  const sc = _qmlPortraitScale(M, W, H, 1, false, LEGACY);
  const si = _qmlPortraitScale(M, W, H, 1, false, IN_D);
  ok(si <= sc + 1e-9, `2.1.8 inset desktop M=${M} @${W}x${H}: échelle <= classic (${si.toFixed(3)} <= ${sc.toFixed(3)})`);
}

// 2) Mobile portrait : rangées dynamiques — bande centrale publiée, positive,
// et assez haute pour la rangée community au s retenu (>= 124·0.55 + 20 hors
// frein d'urgence).
for (const [M, W, H, spec] of [[3, 390, 740, false], [6, 390, 740, false], [9, 430, 820, false], [6, 390, 740, true]]) {
  const lay = _qmlPortraitLayout(M, W, H, 1, spec, IN_M);
  ok(lay.mobile === true && lay.band && lay.band.length === 2,
     `2.1.8 mobile M=${M}${spec ? ' spectateur' : ''}: bande publiée`);
  ok(lay.band[1] - lay.band[0] >= 88,
     `2.1.8 mobile M=${M}${spec ? ' spectateur' : ''}: bande >= 88 px (${(lay.band[1] - lay.band[0]).toFixed(0)})`);
  // Symétrie G/D des colonnes dynamiques.
  ok(близко(lay.slots.TL[0] + lay.slots.TR[0], 1, 1e-6), `2.1.8 mobile M=${M}: colonnes symétriques`);
  // TC collé sous la bordure haute : 4 px + demi-box.
  ok(близко(lay.slots.TC[1] * H, 4 + lay.oppH * lay.s / 2, 0.6),
     `2.1.8 mobile M=${M}: TC = 4 px + boxH/2 (${(lay.slots.TC[1] * H).toFixed(1)})`);
}

// 3) betSideOutset isolé (hauteur de box égale) : à strip constant, l'outset
// 40 (inset : puck seul) laisse des boxes >= outset 68 (classic : chip +
// montant). NB : inset complet vs classic complet ne se compare PAS de façon
// monotone — la box inset est 20 px plus haute et peut perdre quand la
// hauteur borne (M=9), c'est voulu.
for (const [M, W, H] of [[6, 390, 740], [9, 430, 820]]) {
  const s40 = _qmlPortraitScale(M, W, H, 1, false, { strip: 20, outset: 40, mobile: true });
  const s68 = _qmlPortraitScale(M, W, H, 1, false, { strip: 20, outset: 68, mobile: true });
  ok(s40 >= s68 - 1e-9, `2.1.8 betSideOutset M=${M}: outset 40 >= outset 68 (${s40.toFixed(3)} >= ${s68.toFixed(3)})`);
}

// 4) topBadgeExt supprimé sur mobile : paysage compact mobile >= desktop
// (même style), la réserve de 39 px sous la box du haut tombe.
for (const [M, W, H] of [[5, 844, 390], [8, 844, 390]]) {
  const sm = _qmlLandscapeLayout(M, W, H, true, 1, false, IN_M).s;
  const sd = _qmlLandscapeLayout(M, W, H, true, 1, false, IN_D).s;
  ok(sm >= sd - 1e-9, `2.1.8 topBadgeExt M=${M}: compact mobile >= desktop (${sm.toFixed(3)} >= ${sd.toFixed(3)})`);
}

// 5) Rangée bottom seulement à partir de 8 sièges d'anneau (mobile) :
// M=7 -> L_lower descend à la butée (yLower == yBottom), M=8 -> une rangée
// au-dessus.
{
  const l7 = _qmlPortraitLayout(7, 390, 740, 1, false, IN_M);
  const l8 = _qmlPortraitLayout(8, 390, 740, 1, false, IN_M);
  ok(близко(l7.slots.L_lower[1], l7.slots.L_bottom[1], 1e-9), '2.1.8 mobile M=7: lower à la butée basse');
  ok(l8.slots.L_lower[1] < l8.slots.L_bottom[1] - 1e-6, '2.1.8 mobile M=8: lower au-dessus de bottom');
}

// 6) _officialSeatPix mobile : nudge 0 (les valeurs de slot portent tout) et
// bande propagée ; déterminisme.
{
  const W = 390, H = 740;
  const p = _officialSeatPix(7, true, W, H, W / 2, H / 2, null, 1, 1, false, IN_M);
  const lay = _qmlPortraitLayout(6, W, H, 1, false, IN_M);
  ok(p && близко(p[1].top, lay.slots[['L_lower','L_upper','TL','TR','R_upper','R_lower'][0]][1] * H, 0.6),
     '2.1.8 seatPix mobile: position = slot dynamique sans nudge');
  ok(p._portraitBand && близко(p._portraitBand[0], lay.band[0], 0.6) && близко(p._portraitBand[1], lay.band[1], 0.6),
     '2.1.8 seatPix mobile: bande propagée');
  ok(_qmlPortraitLayout(6, W, H, 1, false, IN_M).s === lay.s, '2.1.8 mobile déterministe');
  ok(lay.s <= 2.2 + 1e-9 && lay.s >= 0.55, '2.1.8 mobile: échelle dans [0.55, 2.2] (' + lay.s.toFixed(3) + ')');
}

// 7) Frein d'urgence : zone minuscule — les groupes restent ordonnés
// (upper < lower), pas de NaN.
{
  const t = _qmlPortraitLayout(9, 320, 380, 1, false, IN_M);
  ok(t.slots.L_upper[1] < t.slots.L_lower[1], '2.1.8 frein: upper < lower sur zone minuscule');
  ok(isFinite(t.band[0]) && isFinite(t.band[1]), '2.1.8 frein: bande finie');
}

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All layout tests passed.');
