#!/usr/bin/env node
// Deterministic tests for public/modules/ui/deck.mjs (step 9b of
// docs/ESM_PLAN.md). Locks the unique PokerTH card encoding (0..12=d,
// 13..25=h, 26..38=s, 39..51=c; verified against official PNG assets per the
// in-code comment), the deck-aware face resolution hooks, and the SVG
// factories for pucks and the turn timer.
// Run: node scripts/test-deck.mjs

const attrs = new Map([['data-deck', ''], ['data-deck-ext', 'png']]);
const de = {
  getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
  setAttribute: (k, v) => attrs.set(k, String(v)),
  style: { setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } },
};
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = {
  documentElement: de,
  body: { classList: { add() {}, remove() {}, contains() { return false; } } },
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add() {} }, setAttribute() {}, remove() {} }),
  addEventListener() {},
};
globalThis.window = globalThis;
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });

const M = await import('../public/modules/ui/deck.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// 1) cardName : encodage PokerTH unique, valeurs exactes aux quatre coins
ok(M.cardName(0) === '2♦', 'cardName(0) = 2♦');
ok(M.cardName(12) === 'A♦', 'cardName(12) = A♦');
ok(M.cardName(13) === '2♥', 'cardName(13) = 2♥');
ok(M.cardName(25) === 'A♥', 'cardName(25) = A♥');
ok(M.cardName(26) === '2♠', 'cardName(26) = 2♠');
ok(M.cardName(38) === 'A♠', 'cardName(38) = A♠');
ok(M.cardName(39) === '2♣', 'cardName(39) = 2♣');
ok(M.cardName(51) === 'A♣', 'cardName(51) = A♣');
ok(M.cardName(21) === '10♥', 'cardName(21) = 10♥ (dix en toutes lettres chiffrées)');

// 2) Garde universelle de validité (mémo projet : entier 0..51)
ok(M.cardName(null) === '?' && M.cardName(52) === '?' && M.cardName(-1) === '?' && M.cardName(3.5) === '?',
   'cardName invalides -> ?');

// 3) cardHtml : structure .pk avec data-c et --cf inline
const h = M.cardHtml(25);
ok(typeof h === 'string' && h.indexOf('data-c="25"') !== -1, 'cardHtml(25) pose data-c');
ok(h.indexOf('--cf:url(') !== -1, 'cardHtml pose la face en --cf inline');
ok(/c-rank/.test(h) && /c-suit/.test(h), 'cardHtml contient rank + suit');
ok(/red/.test(M.cardHtml(5)) && !/red/.test(M.cardHtml(30)), 'rouge pour ♦, pas pour ♠');

// 4) Résolution deck-aware : le hook window._deckCardUrl est prioritaire
window._deckCardUrl = (deck, n) => (deck === 'monpack' ? '/imported/' + n + '.png' : null);
attrs.set('data-deck', 'monpack');
const hi = M.cardHtml(7);
ok(hi.indexOf('/imported/7.png') !== -1, '_deckCardUrl (import ZIP) prioritaire sur la galerie');
attrs.set('data-deck', 'galerie');
const hg = M.cardHtml(7);
ok(hg.indexOf('/cards/galerie/') !== -1, 'galerie: /cards/<id>/<n>.<ext>');
attrs.set('data-deck', '');
window._deckCardUrl = null;

// 5) chipSvg / dealerChipSvg / _timerSvg : fabriques SVG autonomes
const chip = M.chipSvg(150, 'sb');
ok(typeof chip === 'string' && chip.indexOf('<svg') !== -1, 'chipSvg retourne un SVG');
const dc = M.dealerChipSvg();
ok(typeof dc === 'string' && dc.indexOf('<svg') !== -1, 'dealerChipSvg retourne un SVG');
ok(typeof window._timerSvg(5, 15) === 'string' && window._timerSvg(5, 15).indexOf('circle') !== -1,
   '_timerSvg retourne un anneau SVG');
ok(window._timerSvg(5, 15) === window._timerSvg(5, 15), '_timerSvg déterministe');

// 6) flipCommCards sans DOM : no-op silencieux ; alias legacy présents
M.flipCommCards(0, 2);
ok(true, 'flipCommCards sans community DOM = no-op');
ok(['cardName', 'cardToHtml', 'cardHtml', '_pthPuck', 'chipSvg', 'dealerChipSvg', '_timerSvg', '_refreshDeck']
   .every((n) => typeof window[n] === 'function'), 'alias legacy complets');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
console.log('All deck tests passed.');
