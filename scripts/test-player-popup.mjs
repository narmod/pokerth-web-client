#!/usr/bin/env node
// Deterministic tests for public/modules/ui/player-popup.mjs (ESM #9f-7).
// Run: node scripts/test-player-popup.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
  appendChild(c) { this.children.push(c); }, removeEventListener() {}, addEventListener() {},
  setAttribute() {}, removeAttribute() {}, getAttribute: () => null,
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

// _cupsBlockHtml : mon accès aux coupes doit être rendu comme celui des autres
// (bug remonté 23/07 : mon popup n'affichait que les stats de session).
// Depuis 2.1.7-web.112 le bloc n'est plus rendu en ligne dans la carte : le
// bouton ouvre la fenêtre de statistiques. L'intention testée est la même —
// ma carte doit offrir le même chemin que celle des autres.
els['login-mode'].value = 'auth';
S.myId = 3; S.myName = 'narmod';
S._playerRights = { 3: 2, 7: 2, 8: 1, 901: 2 };
const mine = P._cupsBlockHtml(3);
ok(mine.includes('pim-cups-btn') && mine.includes('_pimOpenStats(3)'),
   '_cupsBlockHtml : accès aux statistiques rendu pour MOI (joueur enregistré)');
// Chaque onclick doit etre un appel COMPLET : un guillemet double interpole
// dedans fermerait l'attribut et tronquerait l'appel (bug 2.1.7-web.112).
const _onclicks = [...mine.matchAll(/onclick="([^"]*)"/g)].map((m) => m[1]);
ok(_onclicks.length > 0 && _onclicks.every((c) => /^[\w.$]+\([^"]*\)$/.test(c)),
   '_cupsBlockHtml : chaque onclick est un appel complet [' + _onclicks.join(' | ') + ']');
ok(_onclicks.length === 1,
   '_cupsBlockHtml : un seul bouton (le second menait au meme endroit)');
ok(!mine.includes('id="pim-cups"'),
   '_cupsBlockHtml : plus de bloc coupes en ligne dans la carte');
ok(mine.includes('player?u=narmod'),
   '_cupsBlockHtml : le lien profil utilise S.myName (absent de getPlayerName)');
ok(P._cupsBlockHtml(7).includes('player?u=Alice'),
   '_cupsBlockHtml : adversaire enregistré inchangé');
ok(P._cupsBlockHtml(8) === '', '_cupsBlockHtml : invité (droits 1) → aucun bloc');
ok(P._cupsBlockHtml(901) === '', '_cupsBlockHtml : bot → aucun bloc');
els['login-mode'].value = 'lan-dedi';
ok(P._cupsBlockHtml(3) === '', '_cupsBlockHtml : hors réseau pokerth.net → aucun bloc');
// En LAN / serveur prive, MOI reste ouvert des que mes stats sont eligibles
// (S._statsEligible) : c'est justement la que vivent mon score et mon reset
// hors pokerth.net (remonte narmod — sans ca, aucun acces depuis mon avatar).
S._statsEligible = true;
const mineLan = P._cupsBlockHtml(3);
ok(mineLan.includes('pim-cups-btn') && mineLan.includes('_pimOpenStats(3)'),
   '_cupsBlockHtml : MOI en LAN, stats eligibles → bouton stats present');
ok(!mineLan.includes('pim-profile-link'),
   '_cupsBlockHtml : MOI en LAN → pas de lien profil pokerth.net (sans objet)');
ok(P._cupsBlockHtml(7) === '',
   '_cupsBlockHtml : adversaire en LAN reste ferme (donnees pas les miennes)');
S._statsEligible = false;
els['login-mode'].value = 'auth';

// Pastille 📊 de la liste : depuis 2.1.7-web.112 elle ouvre la FENETRE de
// statistiques (qui charge les coupes) au lieu de les injecter dans la carte.
// L'intention testee est inchangee : la liste passe '' pour moi, mes coupes
// doivent s'ouvrir comme celles des autres.
let statsFor = null;
window.openPlayerProfile = (nm, pid) => { statsFor = nm; };
statsFor = null;
window._plOpenStats('');
ok(statsFor === 'narmod', "_plOpenStats('') : ouvre MES statistiques (pastille 📊)");
statsFor = null;
window._plOpenStats(7);
ok(statsFor === 'Alice', '_plOpenStats(pid) : ouvre les statistiques de l\'adversaire');

// La carte elle-meme ne charge plus jamais les coupes : elles vivent dans la
// fenetre. autoStats ne doit donc plus rien declencher cote reseau.
let cupsFor = null;
window.rkLoadPlayerCups = (nm) => { cupsFor = nm; };
cupsFor = null;
P.openPlayerInfoPopup(7, true);
ok(cupsFor === null, 'carte : aucun chargement de coupes, meme avec autoStats');

// _pimSetTab pilote l'onglet du popup — Total reste desormais accessible
// QUEL QUE SOIT le mode (S._statsEligible) : Local/Entrainement lit toujours
// le store d'entrainement explicite, plus de repli force sur Session hors
// eligibilite (narmod 11/09 : consultable/reinitialisable depuis n'importe
// quel mode).
S._statsEligible = true; S._pimTab = 'session';
P._pimSetTab('life');
ok(S._pimTab === 'life', "_pimSetTab bascule sur l'onglet lifetime");
S._statsEligible = false;
P._pimSetTab('life');
ok(S._pimTab === 'life', 'Total reste accessible hors eligibilite (plus de repli force sur Session)');
S._statsEligible = true;
// Meme logique cote LAN : le sous-onglet Classement reste selectionnable
// meme sans connexion LAN/serveur prive (S._boardEligible faux).
S._boardEligible = false;
P._pimSetLanTab('board');
ok(S._pimLanTab === 'board', 'onglet LAN : Classement reste accessible hors connexion LAN/serveur prive');
S._boardEligible = true;

// ── Fenetre a largeur figee ───────────────────────────────────────────────
// La carte est une colonne centree : etiree, elle laissait deux marges vides.
// Seule la hauteur reste ajustable, et le zoom du contenu est coupe (a largeur
// fixe il ne dependrait plus que de la hauteur).
{
  const src = await import('node:fs').then((m) => m.readFileSync('public/modules/ui/player-popup.mjs', 'utf8'));
  const optBlock = src.slice(src.indexOf('window._enableFloating(card, {'));
  ok(/minW:\s*g\.w/.test(optBlock) && /maxW:\s*g\.w/.test(optBlock),
     'largeur verrouillee : minW == maxW == la largeur calculee');
  ok(/zoom:\s*false/.test(optBlock.slice(0, optBlock.indexOf('});'))),
     'zoom du contenu coupe avec la largeur figee');
  ok(/card\.style\.width = g\.w/.test(src),
     'largeur reimposee apres restauration d’une geometrie memorisee');
  const css = await import('node:fs').then((m) => m.readFileSync('public/pokerth.css', 'utf8'));
  const hidden = ['e', 'w', 'ne', 'nw', 'se', 'sw'].every(
    (d) => css.includes('.pim-card.floating-win .win-rsz-' + d));
  ok(hidden, 'poignees horizontales et coins masques (seules n/s subsistent)');
}

ok(window.openPlayerInfoPopup === P.openPlayerInfoPopup
   && window._renderProfileStats === P._renderProfileStats
   && window._pimSetLanTab === P._pimSetLanTab
   && window._renderLanProfileStats === P._renderLanProfileStats
   && window.closeAvatarPickerFromLobby === P.closeAvatarPickerFromLobby, 'ponts window en place');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
