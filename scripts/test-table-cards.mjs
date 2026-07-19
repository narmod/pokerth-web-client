#!/usr/bin/env node
// Deterministic tests for public/modules/ui/table-cards.mjs (ESM #9g-B3).
// Run: node scripts/test-table-cards.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, _cls: new Set(), _handlers: {},
  classList: { add() {}, remove() {}, toggle(c, on) { on ? this._s.add(c) : this._s.delete(c); }, _s: null },
  appendChild(c) { this.children.push(c); }, remove() {},
  addEventListener(ev, fn) { this._handlers[ev] = fn; },
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
const bodyKids = [];
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  body: { appendChild(el) { bodyKids.push(el); } },
  getElementById: (id) => (els[id] = els[id] || (() => { const e = makeEl(); e.classList._s = e._cls; return e; })()),
  createElement: () => { const e = makeEl(); e.classList._s = e._cls; return e; } };
globalThis.requestAnimationFrame = (fn) => fn();
window._ownReveal = false;
let seatsRendered = 0, actionsRendered = 0;
window.renderSeats = () => seatsRendered++;
window.renderMyTurnActions = () => actionsRendered++;
window.renderHandStrength = () => {}; // écrasé par l'import réel ensuite — voir note

const { S } = await import('../public/modules/game/state.mjs');
const T = await import('../public/modules/ui/table-cards.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _setCanShow : arme window._canShowCards + re-rend la barre d'action
window._canShowCards = false;
T._setCanShow(true);
ok(window._canShowCards === true, '_setCanShow(true) arme window._canShowCards');
ok(actionsRendered === 1, '_setCanShow re-rend la barre (window.renderMyTurnActions)');
ok(els['g-show-btn'].style.display === 'none', '_setCanShow masque le bouton legacy');
T._setCanShow(false);
ok(window._canShowCards === false, '_setCanShow(false) désarme');

// _ownCardsHidden : option + révélation
store['pth_own_click'] = '1'; window._ownReveal = false;
ok(T._ownCardsHidden() === true, '_ownCardsHidden : option active, non révélé → true');
window._ownReveal = true;
ok(T._ownCardsHidden() === false, '_ownCardsHidden : révélé → false');
store['pth_own_click'] = '0';
ok(T._ownCardsHidden() === false, '_ownCardsHidden : option off → false');

// renderMyCards : cartes visibles / masquées + bascule au clic
S.myCards = [12, 25];
store['pth_own_click'] = '0'; window._ownReveal = false;
T.renderMyCards();
const pb = els['g-myseat-cards'];
ok(pb.innerHTML.length > 0 && !pb.innerHTML.includes('back'), 'renderMyCards : cartes visibles (option off)');
store['pth_own_click'] = '1';
T.renderMyCards();
ok(pb._cls.has('own-peek'), 'renderMyCards : own-peek quand masquées');
ok(pb.style.cursor === 'pointer', 'renderMyCards : curseur pointer (option active)');
// bascule via le handler de clic
S.seats = [1]; seatsRendered = 0;
pb._handlers['click']();
ok(window._ownReveal === true, 'clic player-bar : bascule window._ownReveal');
ok(seatsRendered === 1, 'clic : re-rend les sièges (window.renderSeats)');

// window._refreshOwnCards : re-rendu groupé
seatsRendered = 0;
window._refreshOwnCards();
ok(seatsRendered === 1, '_refreshOwnCards : renderMyCards + window.renderSeats');

// renderComm : 5 slots, flip river
S.commCards = [10, 9, 8, 20, 33];
T.renderComm(true, true);
const comm = els['g-comm'];
ok((comm.innerHTML.match(/class="pk[ "]/g) || []).length === 5, 'renderComm : 5 emplacements rendus');
ok(comm.innerHTML.includes('pk-river'), 'renderComm : classe pk-river sur la 5e carte');

// animateCardDeal : cartes volantes ajoutées au body puis nettoyées
S._lastPixPos = [{ left: 100, top: 200 }, { left: 300, top: 200 }];
S._potCenter = { x: 250, y: 150 };
bodyKids.length = 0;
T.animateCardDeal();
await new Promise((r) => setTimeout(r, 1500));
ok(bodyKids.length === 4, 'animateCardDeal : 2 joueurs × 2 cartes volantes (' + bodyKids.length + ')');
ok(bodyKids[0].className.includes('fly-card'), 'animateCardDeal : classe fly-card');

// animateChipToPot : jeton depuis le siège du joueur, montant formaté
S.seats = [1, 2]; S.myId = 1;
bodyKids.length = 0;
T.animateChipToPot(2, 1500);
ok(bodyKids.length === 1 && bodyKids[0].className === 'fly-chip', 'animateChipToPot : jeton créé');
ok(bodyKids[0].textContent === '1.5k', 'animateChipToPot : montant > 999 → 1.5k');
bodyKids.length = 0;
T.animateChipToPot(99, 100);
ok(bodyKids.length === 0, 'animateChipToPot : pid inconnu → aucun jeton');

// Ponts window
ok(window.renderComm === T.renderComm && window.renderMyCards === T.renderMyCards &&
   window.animateCardDeal === T.animateCardDeal && window._setCanShow === T._setCanShow,
   'ponts window.* en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
