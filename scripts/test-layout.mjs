#!/usr/bin/env node
// Deterministic tests for public/modules/game/layout.mjs (step 9a of
// docs/ESM_PLAN.md). These lock the OFFICIAL QML 2.1.3 geometry (Bible
// 2026-06-28 + DELTA_QML_2_1_3) with exact and structural invariants:
// portrait slot fractions and sequences, nudges, bisection bounds, landscape
// ellipse symmetry and self anchoring. Pure math — no DOM stubs needed for
// the three pure functions.
// Run: node scripts/test-layout.mjs
import {
  _qmlLandscapeLayout, _qmlPortraitScale, _officialSeatPix,
} from '../public/modules/game/layout.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
const близко = (a, b, eps) => Math.abs(a - b) <= (eps == null ? 0.51 : eps);

const zW = 600, zH = 1000;   // tableZone portrait
const seat = (n, portrait) => _officialSeatPix(n, portrait, portrait ? zW : 1200, portrait ? zH : 560,
  (portrait ? zW : 1200) / 2, (portrait ? zH : 560) / 2, null, 1, 1, false);

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
const s3 = _qmlPortraitScale(3, zW, zH, 1, false);
const s9 = _qmlPortraitScale(9, zW, zH, 1, false);
ok(s3 >= 0.55 && s3 <= 1.85, 'portraitScale M=3 dans [0.55, 1.85] : ' + s3.toFixed(3));
// NB : pas de monotonie en portrait — chaque M a SON jeu de slots, la
// bisection peut donner s9 > s3 (M=3 est contraint par le trio TL/TC/TR).
ok(s9 >= 0.55 && s9 <= 1.85, 'portraitScale M=9 dans [0.55, 1.85] : ' + s9.toFixed(3));
ok(_qmlPortraitScale(3, zW, zH, 1, false) === s3, 'portraitScale déterministe');

// ── PAYSAGE : ellipse officielle (Bible §3.3 + DELTA) ──
const lW = 1200, lH = 560;
const lay5 = _qmlLandscapeLayout(5, lW, lH, false, 1, false);
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
const lay2 = _qmlLandscapeLayout(2, lW, lH, false, 1, false);
ok(близко(lay2.slots[0].y, lay2.slots[1].y, 2) && близко(lay2.slots[0].x + lay2.slots[1].x, lW, 2),
   'landscape M=2: TL/TR même y, x miroirs (angles 230/310 symétriques)');
// densité : s(9) <= s(3)
const l3 = _qmlLandscapeLayout(3, lW, lH, false, 1, false);
const l9 = _qmlLandscapeLayout(9, lW, lH, false, 1, false);
ok(l9.s <= l3.s + 1e-9, 'landscape: boxScale décroît avec la densité (' + l9.s.toFixed(3) + ' <= ' + l3.s.toFixed(3) + ')');
ok(_qmlLandscapeLayout(5, lW, lH, false, 1, false).s === lay5.s, 'landscape déterministe');
// compact : la moitié basse est écrasée vers la self (lowerSquash)
const layC = _qmlLandscapeLayout(5, lW, 480, true, 1, false);
ok(layC && layC.s >= 0.55, 'landscape compact: bisection valide (' + layC.s.toFixed(3) + ')');
// compact assis, zone tres plate (mobile landscape 844x227) : cap hauteur ->
// la self ne remplit plus toute la hauteur a faible effectif (narmod 2026-07-20).
const layFlat = _qmlLandscapeLayout(3, 844, 227, true, 1, false);
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
  const sp = _qmlLandscapeLayout(N, W, H, C, 1, true);
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
const spHU = _qmlLandscapeLayout(1, 1280, 620, false, 1, true);
ok(spHU.slots.length === 1 && spHU.slots[0].y < 0.5 * 620, 'spectateur heads-up: adversaire en haut, intact');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All layout tests passed.');
