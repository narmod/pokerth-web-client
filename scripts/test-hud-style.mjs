#!/usr/bin/env node
// Tests déterministes pour la classification d'archétype du HUD
// (playerStyle, public/modules/handlog.mjs). Run: node scripts/test-hud-style.mjs
//
// Périmètre : les DEUX axes (serré/large sur VPIP, passif/agressif sur AF), les
// deux extrêmes, et le seuil de fiabilité. Le rendu SVG n'est pas couvert ici.
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => null, createElement: () => ({ style: {} }),
  body: { appendChild() {} } };

const H = await import('../public/modules/handlog.mjs');
const { playerStyle, STYLE_MIN_HANDS } = H;

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const S = (vpip, af, hands = 200) => ({ vpip, af, hands });

// ── Les quatre quadrants ──────────────────────────────────────────────────
ok(playerStyle(S(18, 1.0)).id === 'tightPassive', 'VPIP 18 / AF 1.0 → serré-passif');
ok(playerStyle(S(18, 2.5)).id === 'tightAggr', 'VPIP 18 / AF 2.5 → serré-agressif');
ok(playerStyle(S(35, 1.0)).id === 'loosePassive', 'VPIP 35 / AF 1.0 → large-passif');
ok(playerStyle(S(35, 2.5)).id === 'looseAggr', 'VPIP 35 / AF 2.5 → large-agressif');

// ── Frontières exactes (>= des deux côtés) ────────────────────────────────
ok(playerStyle(S(23.9, 1)).loose === false, 'VPIP 23,9 est encore serré');
ok(playerStyle(S(24, 1)).loose === true, 'VPIP 24 bascule en large');
ok(playerStyle(S(30, 1.99)).aggro === false, 'AF 1,99 est encore passif');
ok(playerStyle(S(30, 2)).aggro === true, 'AF 2 bascule en agressif');

// ── Extrêmes ──────────────────────────────────────────────────────────────
ok(playerStyle(S(12, 1)).id === 'veryTight', 'VPIP 12 → très serré');
ok(playerStyle(S(12, 3.5)).id === 'veryTight', 'très serré l’emporte même agressif');
ok(playerStyle(S(14.9, 1)).id === 'veryTight', 'VPIP 14,9 est encore très serré');
ok(playerStyle(S(15, 1)).id === 'tightPassive', 'VPIP 15 sort de très serré');
ok(playerStyle(S(50, 4)).id === 'hyperAggr', 'VPIP 50 / AF 4 → hyper-agressif');
ok(playerStyle(S(44, 4)).id === 'looseAggr', 'VPIP 44 : pas encore hyper-agressif');
ok(playerStyle(S(50, 2.9)).id === 'looseAggr', 'AF 2,9 : pas encore hyper-agressif');
ok(playerStyle(S(12, 1)).extreme === true && playerStyle(S(18, 1)).extreme === false,
  'seuls les deux extrêmes portent extreme=true');

// ── Quadrant du cadran : cohérent avec l’archétype, extrêmes compris ──────
{
  const vt = playerStyle(S(12, 1));
  ok(vt.loose === false && vt.aggro === false, 'très serré passif s’allume en bas à gauche');
  const ha = playerStyle(S(50, 4));
  ok(ha.loose === true && ha.aggro === true, 'hyper-agressif s’allume en haut à droite');
}

// ── AF infini (aucun call, que des mises) ─────────────────────────────────
ok(playerStyle({ vpip: 30, af: 'inf', hands: 200 }).aggro === true, 'AF « inf » compte comme agressif');
ok(playerStyle({ vpip: 12, af: 'inf', hands: 200 }).id === 'veryTight', 'AF « inf » ne casse pas l’extrême serré');

// ── Fiabilité ─────────────────────────────────────────────────────────────
ok(STYLE_MIN_HANDS === 25, 'seuil de fiabilité à 25 mains');
ok(playerStyle(S(30, 1, 24)).reliable === false, '24 mains → estimation (atténuée)');
ok(playerStyle(S(30, 1, 25)).reliable === true, '25 mains → fiable');
ok(playerStyle(S(30, 1, 1)) !== null, 'un badge est produit dès la 1re main');

// ── Entrées dégradées ─────────────────────────────────────────────────────
ok(playerStyle(null) === null, 'pas de stats → pas de badge');
ok(playerStyle({ vpip: null, af: 1, hands: 10 }) === null, 'VPIP absent → pas de badge');
ok(playerStyle({ vpip: 30, af: null, hands: 10 }).aggro === false, 'AF absent → traité comme passif');
ok(playerStyle({ vpip: '35', af: '2.5', hands: 100 }).id === 'looseAggr', 'valeurs en chaîne acceptées');

// ── Clé i18n dérivée de l’identifiant ─────────────────────────────────────
ok(playerStyle(S(35, 2.5)).key === 'hlStyleLooseAggr', 'clé i18n dérivée de l’id');
ok(playerStyle(S(12, 1)).key === 'hlStyleVeryTight', 'clé i18n de l’extrême serré');

console.log(fail ? `FAIL ${n - fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
