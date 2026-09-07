#!/usr/bin/env node
// Menu contextuel d'un siège (ui/seat-menu.mjs) — parité GamePlayerBox.qml.
//
// Ce qui compte ici n'est pas le HTML mais les GARDES : chaque entrée doit
// reprendre exactement la condition du bouton correspondant dans la carte
// joueur. Un menu qui proposerait « Signaler l'avatar » à un joueur sans
// avatar, ou « Ignorer » sur ma propre ligne, mentirait sur ce qu'il peut
// faire. Et un menu sans aucune action ne doit pas s'ouvrir du tout, comme le
// hasContextActions du QML.
//
// Run: node scripts/test-seat-menu.mjs
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><select id="login-mode"><option value="auth" selected>auth</option></select></body></html>',
  { pretendToBeVisual: true, url: 'https://webclient.pokerth.net/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.requestAnimationFrame = (fn) => fn();
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.localStorage = dom.window.localStorage;

const { S } = await import('../public/modules/game/state.mjs');
const M = await import('../public/modules/ui/seat-menu.mjs');

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  \u2713 ' : '  \u2717 ') + label);
  if (!cond) fails++;
}

// ── Décor : un adversaire enregistré, avec avatar, en partie réseau ────────
S.myId = 1;
S._playerRights = { 1: 2, 2: 2, 3: 1 };     // 2 = enregistré, 3 = admin, 1 = invité
S._pthAvatarHashes = { 2: { hashHex: 'abc' } };
S.seatData = {};
window.isBot = (pid) => pid === 9;
window.getPlayerName = (pid) => ({ 1: 'Me', 2: 'Rival', 3: 'Guest42', 9: 'Bot' }[pid] || '');
window._isIgnored = () => false;
window._nvBlockHtml = () => '<div class="nv-block"></div>';
window._pimOpenStats = () => {};
window._toggleIgnore = () => {};
window._reportAvatar = () => {};
window._adminBanPlayer = () => {};

const labels = () => Array.from(document.querySelectorAll('#seat-ctx-menu [data-ctx-i]')).map((b) => b.textContent);

// ── Un adversaire ordinaire : note, profil, ignorer, signaler ──────────────
ok(M.openSeatMenu(2, 40, 40) === true, 'le menu s’ouvre sur un adversaire');
let items = labels();
ok(items.length === 4, 'quatre actions pour un adversaire enregistré avec avatar');
ok(/note/i.test(items[0]), 'la note vient en tête — c’est ce qu’on cherche par ce geste');
ok(document.querySelector('#seat-ctx-menu .ctx-hd').textContent === 'Rival',
   'le menu annonce sur qui il porte');
ok(M.isSeatMenuOpen(), 'l’état ouvert est exposé');

// ── Sur MOI : ni note, ni ignorer, ni signalement ──────────────────────────
M.closeSeatMenu();
ok(!M.isSeatMenuOpen(), 'fermeture');
M.openSeatMenu(1, 10, 10);
items = labels();
ok(!items.some((l) => /note/i.test(l)), 'pas de note sur soi-même');
ok(!items.some((l) => /ignor/i.test(l)), 'pas d’ignorance de soi-même');

// ── Sans avatar : pas de signalement (garde du bouton de la carte) ─────────
M.closeSeatMenu();
S._pthAvatarHashes = {};
M.openSeatMenu(2, 10, 10);
ok(!labels().some((l) => /avatar/i.test(l)), 'aucun avatar reçu → pas de signalement');
S._pthAvatarHashes = { 2: { hashHex: 'abc' } };

// ── Invité : pas de profil pokerth.net (droits 1) ──────────────────────────
M.closeSeatMenu();
M.openSeatMenu(3, 10, 10);
ok(!labels().some((l) => /profil|profile/i.test(l)), 'un invité n’a pas de profil à ouvrir');

// ── Kickban : administrateurs seulement ────────────────────────────────────
M.closeSeatMenu();
ok(!labels().some((l) => /kickban/i.test(l)), 'pas de kickban pour un joueur ordinaire');
S._playerRights[1] = 3;
M.openSeatMenu(2, 10, 10);
ok(labels().some((l) => /kickban/i.test(l)), 'kickban visible pour un admin');
ok(!!document.querySelector('#seat-ctx-menu .menu-sep'), 'le kickban est séparé du reste');
S._playerRights[1] = 2;

// ── Rien à proposer → rien ne s’ouvre (hasContextActions du QML) ───────────
M.closeSeatMenu();
const savedNv = window._nvBlockHtml;
window._nvBlockHtml = undefined;
S._pthAvatarHashes = {};
window.isBot = () => true;                  // bot : ni profil, ni ignorer
ok(M.openSeatMenu(9, 10, 10) === false, 'aucune action possible → pas de menu vide');
ok(!M.isSeatMenuOpen(), 'et rien n’est marqué ouvert');
window.isBot = (pid) => pid === 9;
window._nvBlockHtml = savedNv;

// ── Les déclencheurs, côté siège ───────────────────────────────────────────
const SRC = readFileSync(new URL('../public/modules/game/seat-render.mjs', import.meta.url), 'utf8');
ok(/addEventListener\('contextmenu'/.test(SRC) && /ev\.preventDefault\(\)/.test(SRC),
   'clic droit câblé, menu natif du navigateur supprimé');
ok(/ev\.pointerType !== 'touch'/.test(SRC),
   'l’appui long est réservé au tactile (un clic gauche tenu ne déclenche rien)');
ok(/> 10 \|\| Math\.abs\(ev\.clientY - _lpY\) > 10/.test(SRC),
   'un glissé de plus de 10 px annule l’appui long — le défilement reste au tapis');
ok(/if \(_lpFired\) \{[^}]*preventDefault/.test(SRC),
   'le clic qui suit un appui long est neutralisé (sinon la carte s’ouvre derrière)');
ok(/if \(window\._seatEditMode\) return null;/.test(SRC),
   'rien ne s’ouvre pendant l’édition des sièges');

console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
