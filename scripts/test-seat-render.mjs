#!/usr/bin/env node
import { readFileSync } from 'node:fs';
// Deterministic tests for public/modules/game/seat-render.mjs (ESM #9g-C6).
// Run: node scripts/test-seat-render.mjs
globalThis.window = globalThis;
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null),
  setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
function makeEl(tag) {
  const el = { tagName: (tag || 'div').toUpperCase(), style: {}, children: [], attrs: {},
    textContent: '', _html: '', value: '', dataset: {}, offsetWidth: 100, offsetHeight: 40,
    clientWidth: 800, clientHeight: 600,
    appendChild(c) { this.children.push(c); return c; }, removeChild() {}, remove() {},
    addEventListener() {}, removeEventListener() {},
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] ?? null; },
    classList: { _s: new Set(), add(...c) { c.forEach((x) => this._s.add(x)); },
      remove(...c) { c.forEach((x) => this._s.delete(x)); },
      toggle(c, f) { (f ?? !this._s.has(c)) ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); } },
    querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40 }) };
  Object.defineProperty(el, 'innerHTML', { get() { return this._html; },
    set(v) { this._html = v; this.children = []; } });
  return el;
}
const els = {};
const feltOval = null; // rempli après makeEl
globalThis.document = { readyState: 'complete', addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [],
  querySelector: (sel) => (sel === '.felt-oval' ? (els['__felt'] = els['__felt'] || makeEl()) : null),
  documentElement: { getAttribute: () => null, style: { setProperty() {} } },
  body: { appendChild() {}, classList: { add() {}, remove() {}, contains: () => false } },
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: (t) => makeEl(t) };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.requestAnimationFrame = (fn) => { rafQueue.push(fn); return rafQueue.length; };
const rafQueue = [];
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
globalThis.WebSocket = { OPEN: 1 };
window._offlineMode = false; window._lang = 'en';
window.innerWidth = 1024; window.innerHeight = 768;
// Globaux consommés
window._sdWinners = new Set(); window._sdLosers = new Set();
window._advGet = () => true;
window._getTableZoom = () => 1; window._tableZoomGate = () => 1;
window._seatTraitsNow = () => ({});
window.getAvatarColor = () => '#446688';
window._isIgnored = () => false;
window.pkTerm = (b) => b;
window._timerSvg = () => '<svg class="tsvg"></svg>';
window._pthPuck = (k) => '<svg class="puck-' + k + '"></svg>';
window._deckCardUrl = null; window._pthPuckUrls = null;

const { S } = await import('../public/modules/game/state.mjs');
const M = await import('../public/modules/game/seat-render.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

S.myId = 5; S.myName = 'Moi';
S.players = { 5: 'Moi', 9: 'Bob', 11: 'computer3', 13: 'Zoé' };

// ── getPlayerName / isBot / getPlayerInitial / getPlayerTypeBadge
ok(M.getPlayerName(9) === 'Bob', 'getPlayerName : nom connu');
ok(M.getPlayerName(77) === '#77', 'getPlayerName : inconnu → #pid');
ok(M.isBot(11) === true && M.isBot(9) === false, 'isBot : préfixe computer détecté');
store['pth_avatar'] = '__pth__'; S._myAvatarCache = '';
const init = M.getPlayerInitial(5);
ok(init !== '__pth__' && !String(init).includes('__pth__'),
   'getPlayerInitial : la sentinelle __pth__ ne fuit jamais');
ok(typeof M.getPlayerTypeBadge(11) === 'string', 'getPlayerTypeBadge : renvoie du HTML');

// ── renderSeatsImmediate : rendu de base, rotation vue-joueur
S.gId = 12; S.seats = [9, 5, 11, 13];
S.seatData = { 5: { money: 3000, bet: 0 }, 9: { money: 2500, bet: 50 },
  11: { money: 1000, bet: 0, folded: true }, 13: { money: 4000, bet: 100 } };
S.dealerPid = 9; S.turnPid = 13; S.commCards = [null, null, null, null, null];
S._gameStarted = true; S._amSpectator = false; S.smallBlind = 50;
document.getElementById('g-seats'); // le conteneur cible réel
let threw = null;
try { M.renderSeatsImmediate(); } catch (e) { threw = e; }
ok(!threw, 'renderSeatsImmediate : rendu 4 sièges sans exception' + (threw ? ' — ' + threw.message : ''));
ok((els['g-seats'].innerHTML || '').length > 0 || els['g-seats'].children.length > 0,
   'renderSeatsImmediate : #g-seats rempli');
ok((els['g-seats'].innerHTML || '').includes('Bob'),
   'renderSeatsImmediate : le siège de Bob est rendu');

// ── renderSeats : débounce rAF — N appels, 1 rendu
rafQueue.length = 0; S._seatsRenderPending = false;
M.renderSeats(); M.renderSeats(); M.renderSeats();
ok(rafQueue.length === 1, 'renderSeats : 3 appels → 1 seul rAF planifié');
threw = null;
try { rafQueue[0](); } catch (e) { threw = e; }
ok(!threw && S._seatsRenderPending === false,
   'renderSeats : le tick rAF rend et libère le verrou');

// ── Estompage perdants / surbrillance gagnants consommés sans crash
window._sdLosers.add(11); window._sdWinners.add(13);
threw = null;
try { M.renderSeatsImmediate(); } catch (e) { threw = e; }
ok(!threw, 'renderSeatsImmediate : _sdLosers/_sdWinners consommés sans exception');

// ── Spectateur : rendu sans mon siège dans seats[]
S._amSpectator = true; S.seats = [9, 11, 13];
threw = null;
try { M.renderSeatsImmediate(); } catch (e) { threw = e; }
ok(!threw, 'renderSeatsImmediate : mode spectateur sans exception');
S._amSpectator = false;

// Ponts window
ok(window.renderSeatsImmediate === M.renderSeatsImmediate && window.renderSeats === M.renderSeats &&
   window.getPlayerName === M.getPlayerName && window.isBot === M.isBot,
   'ponts window.* en place');

// ── Style de mise « inset » (parité QML SeatStyle/PlayerBetStrip 414a89c) ──
// Pack à politique betside (betOut) + variante 'inset' -> socle .seat-bet-socle
// dans la plaque + classe .socle-open sur les sièges avec mise ; pas de jeton
// .seat-bet dans le pied. Variante 'classic' -> aucun socle, jeton du pied
// inchangé. Ne s'applique PAS aux packs sans le trait betOut.
S._amSpectator = false; S.seats = [9, 5, 11, 13];
window._seatTraitsNow = () => ({ betOut: true, qmlStruct: true, pucksSide: true, selfStrip: true });
window._betStyleVariant = () => 'inset';
window._seatDomPrev = null; window._seatAnimPrev = null;
threw = null;
try { M.renderSeatsImmediate(); } catch (e) { threw = e; }
const insetHtml = els['g-seats'].innerHTML || '';
ok(!threw, 'inset : rendu sans exception' + (threw ? ' — ' + threw.message : ''));
ok(insetHtml.includes('seat-bet-socle'), 'inset : socle rendu pour les mises');
ok(insetHtml.includes('socle-open'), 'inset : classe socle-open posée sur le siège misant');
ok(!/seat-foot"><div class="seat-bet/.test(insetHtml), 'inset : plus de jeton de mise dans le pied');
window._betStyleVariant = () => 'classic';
window._seatDomPrev = null; window._seatAnimPrev = null;
M.renderSeatsImmediate();
const classicHtml = els['g-seats'].innerHTML || '';
ok(!classicHtml.includes('seat-bet-socle') && !classicHtml.includes('socle-open'),
   'classic : aucun socle, aucune classe socle-open');
window._seatTraitsNow = () => ({});
window._seatDomPrev = null; window._seatAnimPrev = null;
window._betStyleVariant = () => 'inset';
M.renderSeatsImmediate();
ok(!(els['g-seats'].innerHTML || '').includes('seat-bet-socle'),
   'pack sans betOut : le style inset est sans effet');
window._betStyleVariant = undefined;

// Garde de régression : une boîte fantôme mesure BIEN MOINS HAUT qu'une vraie
// (le CSS y masque la rangée nom/cash en display:none). Prendre son rect brut
// pour étalon fausserait la géométrie ; l'IGNORER complètement fait sauter le
// barycentre dès qu'un joueur quitte la table, donc l'échelle des cartes
// communes (rapport forum 05/08). La seule forme correcte : mesurer les
// fantômes en leur substituant le gabarit médian des plates normales. On
// vérifie donc sur la source que tout échantillon incluant les fantômes est
// accompagné de cette normalisation. Le DOM stubé ici ne rejoue pas la mesure.
const SRC = readFileSync(new URL('../public/modules/game/seat-render.mjs', import.meta.url), 'utf8');
const ghostSel = SRC.match(/querySelector(?:All)?\('\.seat:not\(\.me\)(?!:not\(\.seat-ghost\))[^']*'\)/g);
const hasNorm = /_gh3\s*&&\s*_refH3\s*>\s*4/.test(SRC) && /_refH3\s*=\s*_med3\(/.test(SRC);
ok(!ghostSel || hasNorm,
   'les mesures incluant les sièges fantômes normalisent leur gabarit'
   + (ghostSel && !hasNorm ? ' — trouvé sans normalisation : ' + ghostSel.join(', ') : ''));

// Garde de régression : la géométrie (bisection + slots) se cale sur le PIC
// d'effectif de la partie (parité QML _peakSeatCount), pas sur l'effectif
// courant — sinon les boîtes ET les cartes communes changent de taille à
// chaque élimination.
ok(/_officialSeatPix\(_geomSeatN,/.test(SRC) && /S\._peakSeatCount/.test(SRC),
   'le placement officiel utilise le pic d\'effectif (_geomSeatN)');

// Badge de note en étoiles : rendu à l'AUTRE bout de la ligne du pseudo
// (upstream d72d109), et la ligne ne passe en flex que lorsqu'il y a un badge
// — sans note en étoiles, le pseudo doit garder son rendu d'avant.
{
  const nameRow = SRC.slice(SRC.indexOf("_nvStars = ''"), SRC.indexOf("ferme .seat-info"));
  ok(/_nvSeatDot/.test(nameRow) && /_nvSeatStars/.test(nameRow),
     'le siège demande la pastille et le badge séparément');
  ok(/class="seat-name has-nv"/.test(nameRow) && /seat-name-txt/.test(nameRow),
     'avec badges : ligne .has-nv et pseudo dans son propre span (élision)');
  // Les deux marques partent ENSEMBLE, dans le même groupe, APRÈS le pseudo.
  ok(/<span class="seat-nv">' \+ _nvTag \+ _nvStars/.test(nameRow),
     'pastille et étoiles réunies dans un seul groupe après le pseudo');
  ok(/class="seat-name">' \+ esc\(/.test(nameRow),
     'sans marque : la ligne du pseudo est inchangée (aucun span en plus)');
  const CSS = readFileSync(new URL('../public/pokerth.css', import.meta.url), 'utf8');
  ok(/\.seat-name\.has-nv \{ display: flex/.test(CSS)
     && /seat-struct="qml"\] \.seat-name\.has-nv \.seat-nv \{ margin-left: auto/.test(CSS),
     'CSS : le groupe est collé au bord droit dans la structure QML');
  // Liste des joueurs : mêmes marques, du même côté, et hors du lien pour que
  // l'ellipse du pseudo ne les mange pas.
  const JS = readFileSync(new URL('../public/pokerth.js', import.meta.url), 'utf8');
  const plRow = JS.slice(JS.indexOf('var nameHtml ='), JS.indexOf('var nameHtml =') + 800);
  ok(/esc\(r\.name\) \+ '<\/span>'\s*\+ \(_nvTag \? '<span class="seat-nv">'/.test(plRow),
     'liste : la pastille suit le pseudo, hors du lien');
  ok(/\.players-list \.pl-name\.has-nv \{ display: flex/.test(CSS),
     'CSS : la ligne de liste ne passe en flex que si elle porte une pastille');
  // Les étoiles, elles, vont dans la colonne ★ — jamais en double avec elle.
  ok(/case 'star':\s+return '<span class="pl-star">' \+ \(r\.isMe \? '★' : _nvStars\)/.test(JS),
     'liste : la colonne ★ porte mon étoile OU la note de l’autre');
  ok(/star:'26px'/.test(JS), 'la piste ★ est élargie pour loger « ★N »');
  // L'or des étoiles ne suit plus --gold : le thème pokerth y met du blanc.
  ok(/--star:\s+var\(--gold\)/.test(CSS) && (CSS.match(/--star:\s+var\(--sel\)/g) || []).length === 2,
     'CSS : --star vaut l’or du thème (--sel dans les deux thèmes pokerth)');
  ok(/\.pl-star \{[^}]*color: var\(--star\)/.test(CSS) && /\.seat-note-stars \{[^}]*color: var\(--star\)/.test(CSS),
     'CSS : étoile « moi » et badge ★N prennent --star');
}

console.log(fail ? `\n${fail}/${n} ÉCHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
