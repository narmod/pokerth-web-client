#!/usr/bin/env node
// Deterministic tests for public/modules/ui/odds-panel.mjs (ESM #9g-B2).
// Run: node scripts/test-odds-panel.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  appendChild(c) { this.children.push(c); }, addEventListener() {}, remove() {},
  querySelector: () => null, querySelectorAll: () => [] }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  documentElement: { getAttribute: () => null },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl() };
globalThis.getComputedStyle = () => ({ backgroundColor: 'rgb(20, 24, 32)' }); // panneau sombre
window._advGet = () => true;
window._oddsSeq = 0;

const { S } = await import('../public/modules/game/state.mjs');
const O = await import('../public/modules/ui/odds-panel.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _hsPanelIsLight : fond sombre mesuré → false ; fond clair → true
ok(O._hsPanelIsLight() === false, '_hsPanelIsLight : fond sombre → false');
globalThis.getComputedStyle = () => ({ backgroundColor: 'rgb(240, 243, 248)' });
ok(O._hsPanelIsLight() === true, '_hsPanelIsLight : fond clair → true');

// _hsContrastCol : couleur claire foncée sur panneau clair, inchangée sur sombre
const darkened = O._hsContrastCol('#E3C800');
ok(darkened !== '#E3C800' && darkened.startsWith('rgb('), '_hsContrastCol fonce l\'or sur fond clair');
globalThis.getComputedStyle = () => ({ backgroundColor: 'rgb(20, 24, 32)' });
ok(O._hsContrastCol('#E3C800') === '#E3C800', '_hsContrastCol inchangé sur fond sombre');

// _hsSet / _hsHide : label + barre + visibilité, _gipAssistSync appelé
S._assistOn = true;
store['pth_gip_tab'] = 'odds';
els['g-log-panel'].style.display = '';
const hsEl = makeEl();
const fillEl = makeEl();
hsEl.querySelector = (sel) => (sel === '.hs-fill' ? fillEl : null);
const txtEl = makeEl();
els['hs-lbl'] = makeEl();
els['hs-lbl'].querySelector = (sel) => (sel === '.hs-txt' ? txtEl : null);
O._hsSet(hsEl, 'Flush · 62%', 62, '#50b840');
ok(fillEl.style.width === '62%', '_hsSet : largeur de barre 62%');
ok(txtEl.textContent === 'Flush · 62%', '_hsSet : label écrit');
ok(els['gip-assist'].style.display === '', '_gipAssistSync : bloc visible (panneau ouvert, onglet odds, contenu)');
O._hsHide(hsEl);
ok(hsEl.style.display === 'none' && txtEl.textContent === '', '_hsHide masque et vide');
ok(els['gip-assist'].style.display === 'none', '_gipAssistSync : bloc masqué sans contenu');

// _hsSet borne le pourcentage
O._hsSet(hsEl, 'x', 250, '#fff');
ok(fillEl.style.width === '100%', '_hsSet : pct borné à 100');
O._hsSet(hsEl, 'x', NaN, '#fff');
ok(fillEl.style.width === '0%', '_hsSet : NaN → 0');

// calcWinProb : cas dégénérés puis nuts
S.myCards = [null, null];
ok(O.calcWinProb() === -1, 'calcWinProb : pas de cartes → -1');
S.myCards = [12, 25]; S.commCards = [null, null, null, null, null];
ok(O.calcWinProb() === -1, 'calcWinProb : préflop → -1');
// Cas déterministe : je tiens la meilleure main possible (nuts absolus).
// Encodage identité 0-51, rang = n % 13 (as = 12), couleur = ⌊n/13⌋ (♦=0).
S.myCards = [12, 11]; // A♦ K♦
S.commCards = [10, 9, 8, 20, 33]; // Q♦ J♦ 10♦ + 2 hors couleur → royal flush ♦
S.seats = [1, 2]; S.myId = 1;
S.seatData = { 1: { folded: false }, 2: { folded: false } };
const p = O.calcWinProb();
ok(p === 100, 'calcWinProb : royal flush → 100% (' + p + ')');

// renderPreFlopStrength : paire d'as → libellé + étoiles
S._assistOn = true;
S.myCards = [12, 25]; S.commCards = [null, null, null, null, null]; // A♦ A♥
els['hand-strength'] = hsEl; hsEl.style.display = 'none';
O.renderPreFlopStrength();
ok(hsEl.style.display === 'block', 'renderPreFlopStrength : bandeau affiché');
ok(txtEl.textContent.includes('★'), 'renderPreFlopStrength : étoiles rendues');
S._assistOn = false;
O.renderPreFlopStrength();
ok(hsEl.style.display === 'none', 'renderPreFlopStrength : assistance off → masqué');

// renderHandStrength : label immédiat de la main faite
S._assistOn = true;
S.myCards = [12, 11]; S.commCards = [10, 9, 8, null, null]; // royal flush au flop
O.renderHandStrength();
ok(hsEl.style.display === 'block' && txtEl.textContent.length > 0,
   'renderHandStrength : label immédiat (' + txtEl.textContent + ')');

// renderOddsMonitor : onglet fermé → rien ; ouvert → en-tête construit
els['g-odds-body'] = makeEl();
store['pth_gip_tab'] = 'log';
O.renderOddsMonitor();
ok(els['g-odds-body']._built === undefined, 'renderOddsMonitor : onglet log → aucun rendu');
store['pth_gip_tab'] = 'odds';
S.myCards = [12, 11]; S.commCards = [10, 9, 8, null, null]; // royal flush au flop
window._oddsSeq = 0;
await new Promise((res) => { O.renderOddsMonitor(); setTimeout(res, 400); });
ok(els['g-odds-body'].innerHTML.includes('odds-row'), 'renderOddsMonitor : 10 catégories rendues');
ok(els['g-odds-body'].innerHTML.includes('/img/hands/royalflush.svg'), 'renderOddsMonitor : icônes SVG officielles');

// Ponts window + alias
ok(window.renderHandStrength === O.renderHandStrength &&
   window.renderOddsMonitor === O.renderOddsMonitor &&
   window._gipAssistSync === O._gipAssistSync &&
   window._renderOdds === O.renderOddsMonitor,
   'ponts window.* et alias _renderOdds en place');

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
