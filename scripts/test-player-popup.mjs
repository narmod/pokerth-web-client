#!/usr/bin/env node
// Deterministic tests for public/modules/ui/player-popup.mjs (ESM #9f-7).
// Run: node scripts/test-player-popup.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  appendChild(c) { this.children.push(c); }, removeEventListener() {}, addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null, remove() {}, parentNode: null }; }
const els = {};
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [], querySelector: () => null,
  getElementById: (id) => (els[id] = els[id] || makeEl()), createElement: () => makeEl(),
  body: { appendChild() {} } };
window.isBot = (pid) => pid >= 900;
window.getPlayerName = (pid) => ({ 7: 'Alice' }[pid] || null);
window.updateLobbyPill = () => {};
window.send = () => {};
window._isIgnored = () => false;
window._petAsk = () => {};
window._statsBodySession = () => '<div>session</div>';
window._statsBodyLife = () => '<div>life</div>';
window.renderBoard = () => {};

const { S } = await import('../public/modules/game/state.mjs');
const P = await import('../public/modules/ui/player-popup.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// _ccToFlag : emoji drapeau depuis un code ISO
const fr = P._ccToFlag('FR', 'gp-flag');
ok(fr.includes('/flags/fr.svg') && fr.includes('gp-flag'), "_ccToFlag('FR') → <img /flags/fr.svg>");
ok(P._ccToFlag('zz9', 'x') === '', 'code non ISO-2 rejeté');
ok(P._ccToFlag('', 'x') === '' && P._ccToFlag(null, 'x') === '', '_ccToFlag vide → chaîne vide');

// _pthAvatarFor : null sans méta, Data URL si cache assemblé
S._pthAvatarHashes = {}; S._pthDataUrls = {};
ok(P._pthAvatarFor(7) === null, '_pthAvatarFor sans méta → null');
S._pthAvatarHashes[7] = { type: 1, hashHex: 'abcd' };
S._pthDataUrls['abcd'] = 'data:image/png;base64,AAA';
ok(P._pthAvatarFor(7) === 'data:image/png;base64,AAA', '_pthAvatarFor lit S._pthDataUrls');

// _avatarChipHtml : initiale en repli, image si avatar connu
S.myId = 1; S.myName = 'Moi';
const chipNoAv = P._avatarChipHtml(42, 'Zoé', 'gp-av');
ok(chipNoAv.includes('Z'), 'chip sans avatar → initiale');
const chipAv = P._avatarChipHtml(7, 'Alice', 'gp-av');
ok(chipAv.includes('data:image/png;base64,AAA'), 'chip avec avatar → image du cache');

// _otherPlayerInfoHtml : contient le pseudo et le bouton ignorer
S.players = { 7: 'Alice' };
const html = P._otherPlayerInfoHtml(7);
ok(html.includes('_toggleIgnore(7)'), '_otherPlayerInfoHtml câble le bouton ignorer');

// _cupsBlockHtml : mes coupes doivent être rendues comme celles des autres
// (bug remonté 23/07 : mon popup n'affichait que les stats de session).
els['login-mode'].value = 'auth';
S.myId = 3; S.myName = 'narmod';
S._playerRights = { 3: 2, 7: 2, 8: 1, 901: 2 };
const mine = P._cupsBlockHtml(3);
ok(mine.includes('pim-cups-btn') && mine.includes('_pimLoadCups(3)'),
   '_cupsBlockHtml : bouton « coupes » rendu pour MOI (joueur enregistré)');
ok(mine.includes('player?u=narmod'),
   '_cupsBlockHtml : le lien profil utilise S.myName (absent de getPlayerName)');
ok(P._cupsBlockHtml(7).includes('player?u=Alice'),
   '_cupsBlockHtml : adversaire enregistré inchangé');
ok(P._cupsBlockHtml(8) === '', '_cupsBlockHtml : invité (droits 1) → aucun bloc');
ok(P._cupsBlockHtml(901) === '', '_cupsBlockHtml : bot → aucun bloc');
els['login-mode'].value = 'lan-dedi';
ok(P._cupsBlockHtml(3) === '', '_cupsBlockHtml : hors réseau pokerth.net → aucun bloc');
els['login-mode'].value = 'auth';

// _pimSetTab pilote l'onglet du popup
S._statsEligible = true; S._pimTab = 'session';
P._pimSetTab('life');
ok(S._pimTab === 'life', "_pimSetTab bascule sur l'onglet lifetime");
S._statsEligible = false;
P._pimSetTab('life');
ok(S._pimTab === 'session', 'garde : hors éligibilité, retour forcé à session');

ok(window.openPlayerInfoPopup === P.openPlayerInfoPopup
   && window._renderProfileStats === P._renderProfileStats
   && window.closeAvatarPickerFromLobby === P.closeAvatarPickerFromLobby, 'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
