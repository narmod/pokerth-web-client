#!/usr/bin/env node
// Tests déterministes pour la fenêtre « range » passée au système générique
// (_rangeSetupFloat, public/modules/handlog.mjs). Run: node scripts/test-range-window.mjs
//
// Périmètre : le SEUIL fenêtre/feuille et les options passées à
// _enableFloating, plus les invariants de surface (pas de voile sombre, bande
// de z-index dialogue, présence dans le z-order des fenêtres). Le rendu de la
// grille 13×13 n'est pas couvert ici.
import { readFileSync } from 'node:fs';

let mql = { matches: true };
const calls = [];
globalThis.window = globalThis;
globalThis.innerWidth = 1280;
globalThis.innerHeight = 800;
globalThis.matchMedia = () => mql;
globalThis.addEventListener = () => {};
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: () => null, createElement: () => ({ style: {} }),
  body: { appendChild() {} } };
globalThis._enableFloating = (card, opt) => calls.push({ kind: 'enable', card, opt });
globalThis._disableFloating = (card) => calls.push({ kind: 'disable', card });

const { _rangeSetupFloat } = await import('../public/modules/handlog.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const TITLE = { tag: 'range-title' };
const CARD = { tag: 'range-card' };
const modal = { querySelector: (sel) => (sel === '.range-card' ? CARD : null) };
CARD.querySelector = (sel) => (sel === '.range-title' ? TITLE : null);

// ── Au-dessus du seuil : fenêtre flottante ────────────────────────────────
calls.length = 0; mql = { matches: true };
_rangeSetupFloat(modal);
ok(calls.length === 1 && calls[0].kind === 'enable', '≥600 px → promotion en fenêtre flottante');
{
  const o = calls[0].opt;
  ok(calls[0].card === CARD, 'c’est la carte qui flotte, pas le conteneur');
  ok(o.key === 'pth_win_range', 'géométrie mémorisée sous une clé dédiée');
  ok(o.handle === TITLE, 'la poignée est la barre de titre (pas l’en-tête : il contient les filtres)');
  ok(o.resizable === true, 'redimensionnable');
  ok(o.zoom === true, 'zoom de contenu actif comme les autres fenêtres');
  ok(o.minW >= 360 && o.minH >= 320, 'taille minimale suffisante pour la grille 13×13');
  ok(o.openW <= o.maxW && o.openH <= o.maxH, 'taille d’ouverture bornée par les maxima');
  ok(o.defLeft >= 8 && o.defTop >= 8, 'position par défaut dans l’écran');
}

// ── Fenêtre étroite : les maxima suivent le viewport ──────────────────────
calls.length = 0; globalThis.innerWidth = 640; globalThis.innerHeight = 500;
_rangeSetupFloat(modal);
{
  const o = calls[0].opt;
  ok(o.maxW <= 640 && o.maxH <= 500, 'maxima bornés au viewport courant');
  ok(o.openW <= 640 - 16 && o.openH >= 320, 'ouverture tenant dans l’écran sans passer sous le minimum');
}
globalThis.innerWidth = 1280; globalThis.innerHeight = 800;

// ── Sous le seuil : feuille, pas de flottement ────────────────────────────
calls.length = 0; mql = { matches: false };
_rangeSetupFloat(modal);
ok(calls.length === 1 && calls[0].kind === 'disable', '<600 px → repli en feuille plein écran');
ok(calls[0].card === CARD, 'le repli vise bien la carte');

// ── Absence de carte : aucun effet, aucune exception ──────────────────────
calls.length = 0; mql = { matches: true };
_rangeSetupFloat({ querySelector: () => null });
ok(calls.length === 0, 'conteneur sans carte → no-op');

// ── Invariants de surface (CSS) ───────────────────────────────────────────
{
  const css = readFileSync(new URL('../public/pokerth.css', import.meta.url), 'utf8');
  const block = css.slice(css.indexOf('#range-modal{'), css.indexOf('#range-modal{') + 400);
  ok(!/background:rgba\(0,0,0/.test(block), 'plus aucun voile sombre sur le conteneur');
  ok(/pointer-events:none/.test(block), 'le conteneur laisse passer les clics vers le jeu');
  ok(/z-index:1200/.test(block), 'bande de z-index dialogue, comme #adv-modal et #help-modal');
  ok(/#range-modal \.range-card\{pointer-events:auto/.test(css), 'la carte, elle, reste cliquable');
  ok(/#range-modal \.range-card\.floating-win\{position:fixed/.test(css), 'règle de fenêtre flottante présente');
}

// ── Intégration au z-order des fenêtres ───────────────────────────────────
{
  const z = readFileSync(new URL('../public/modules/ui/z-order.mjs', import.meta.url), 'utf8');
  const hosts = (z.match(/^const HOSTS = '(.*)';$/m) || [])[1] || '';
  ok(hosts.split(',').includes('#range-modal'),
    '#range-modal est dans HOSTS → la dernière fenêtre touchée passe devant');
}

console.log(fail ? `FAIL ${n - fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
