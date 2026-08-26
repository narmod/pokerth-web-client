#!/usr/bin/env node
// Parite entre MA fiche joueur et celle des autres. Les deux branches de
// openPlayerInfoPopup ont diverge : le role (Bot / Admin / Enregistre /
// Invite) n'etait rendu que pour les adversaires, ma propre fiche ne le
// montrait pas. On ouvre reellement le popup dans jsdom, pour moi puis pour
// un autre, et on compare ce qui apparait.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import vm from 'vm';

const html = readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://pokerth.ddns.net/', pretendToBeVisual: true, runScripts: 'outside-only' });
const w = dom.window;
globalThis.window = w;
for (const k of ['document','localStorage','location','requestAnimationFrame','getComputedStyle','CustomEvent','Event',
                 'MutationObserver','IntersectionObserver','ResizeObserver','NodeFilter','Node','HTMLElement'])
  try { globalThis[k] = w[k]; } catch (e) {}
w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, addEventListener() {} }));
w.speechSynthesis = { getVoices: () => [], addEventListener() {}, cancel() {}, speak() {} };
w.SpeechSynthesisUtterance = function (t) { this.text = t; };
globalThis.WebSocket = w.WebSocket;
globalThis.fetch = () => Promise.reject(new Error('stub')); w.fetch = globalThis.fetch;
const mods = [...html.matchAll(/<script type="module" src="(modules\/[^"]+)"><\/script>/g)].map(m => m[1]);
for (const m of mods) { try { await import('../public/' + m); } catch (e) {} }
for (const k of Object.getOwnPropertyNames(w)) { if (k === 'performance' || k in globalThis) continue; try { globalThis[k] = w[k]; } catch (e) {} }
const ctx = dom.getInternalVMContext();
vm.runInContext(readFileSync('public/chat-emotes.js', 'utf8'), ctx, { filename: 'chat-emotes.js' });
vm.runInContext("(function(){'use strict';\n" + readFileSync('public/pokerth.js', 'utf8') + "\n})();", ctx, { filename: 'pokerth.js' });
w.document.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
await new Promise(r => setTimeout(r, 40));

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  \u2717', m); } else console.log('  \u2713', m); };

const S = w.PthState;
S.myId = 1; S.myName = 'moi';
S.players = { 1: 'moi', 2: 'autre' };
S._playerRights = { 1: 2, 2: 3 };          // moi enregistre, l'autre admin
S._playerCountries = {}; S._playerAvatars = {}; S._playerImgAvatars = {};
S._pthAvatarHashes = {};
w.getPlayerName = (p) => S.players[p];
w.isBot = () => false;
w._isIgnored = () => false;

const roleOf = () => { const el = w.document.querySelector('#player-info-modal .pim-role'); return el ? el.textContent.trim() : null; };

w.openPlayerInfoPopup(2);
const other = roleOf();
ok(other === 'Admin', 'fiche d un autre : role affiche (' + other + ')');

w.openPlayerInfoPopup();          // sans pid => MA fiche
const self = roleOf();
ok(self !== null, 'MA fiche : le role est affiche (etait absent)');
ok(self === 'Registered', 'MA fiche : role correct (' + self + ')');

// Le role doit suivre MES droits, pas ceux du dernier joueur consulte.
S._playerRights[1] = 3;
w.openPlayerInfoPopup();
ok(roleOf() === 'Admin', 'MA fiche : admin reconnu quand le serveur me donne les droits');
S._playerRights[1] = 1;
w.openPlayerInfoPopup();
ok(roleOf() === 'Guest', 'MA fiche : invite reconnu');

// ── Stats de session derriere un bouton ──
S._pimStatsShown = false;
w.openPlayerInfoPopup();
const statsBox = w.document.getElementById('pim-stats');
ok(/piShowStats|Show session stats|Voir mes statistiques/.test(statsBox.innerHTML)
   || statsBox.querySelector('.pim-cups-btn') !== null,
   'MA fiche : les stats sont repliees derriere un bouton');
// Assertion robuste : les onglets sont absents quand le compte n'est pas
// eligible, le corps des stats non — c'est donc lui qu'il faut regarder.
const statsShown = () => statsBox.querySelector('.stats-body, .stats-tabs') !== null;
ok(!statsShown(), 'MA fiche : le corps des stats n est pas rendu d office');
if (typeof w._pimToggleStats !== 'function') {
  ok(false, 'bascule des stats disponible (window._pimToggleStats)');
} else {
  w._pimToggleStats();
  ok(statsShown(), 'apres ouverture : les stats apparaissent');
  ok(statsBox.querySelector('.pim-cups-btn') !== null,
     'apres ouverture : le bouton reste (il sert a replier)');
  w._pimToggleStats();
  ok(!statsShown(), 'repli : les stats disparaissent');
}

// ── Le bouton « Profil du joueur » doit passer DEVANT la carte ──
const ppSrc = readFileSync('public/pokerth-client.html', 'utf8');
const openFn = (ppSrc.match(/window\.openPlayerProfile = function[\s\S]*?\n  \};/) || [''])[0];
ok(/zRaise/.test(openFn),
   'profil : la fenetre est remontee devant (sinon masquee par la carte joueur)');

// Une seule source pour les deux branches.
const src = readFileSync('public/modules/ui/player-popup.mjs', 'utf8');
ok((src.match(/piRoleAdmin/g) || []).length === 1,
   'un seul endroit calcule le role (les branches ne peuvent plus diverger)');

console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
