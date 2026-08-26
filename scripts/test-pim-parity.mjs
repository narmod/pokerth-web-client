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
// Les <script> INLINE de la page (classement, coupes, fenetre de stats...)
// ne sont pas executes par jsdom en mode outside-only : sans eux
// window.openPlayerProfile et rkLoadPlayerCups n'existent pas et le test
// mesurerait un client amputé.
for (const m of html.matchAll(/<script(?![^>]*\ssrc=)(?![^>]*type="module")[^>]*>([\s\S]*?)<\/script>/g)) {
  try { vm.runInContext(m[1], ctx, { filename: 'inline.js' }); } catch (e) {}
}
for (const k of Object.getOwnPropertyNames(w)) { if (k === 'performance' || k in globalThis) continue; try { globalThis[k] = w[k]; } catch (e) {} }
w.document.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
await new Promise(r => setTimeout(r, 40));
// Mode reseau : _cupsBlockHtml ne rend son bouton que sur pokerth.net.
try { w.document.getElementById('login-mode').value = 'auth'; } catch (e) {}

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

// ── Separation carte / fenetre de statistiques ──
// Cliquer le NOM ouvre la carte (identite + actions) ; les statistiques
// vivent dans leur propre fenetre. La carte ne doit donc plus rendre ni les
// stats de session ni le bloc coupes.
// Les assertions de role ci-dessus ont laisse mes droits sur « invite » ;
// _cupsBlockHtml n'emet rien pour un invite (a raison). On repasse
// enregistre avant d'examiner les boutons.
S._playerRights[1] = 2;
w.openPlayerInfoPopup();   // re-rendu maintenant que login-mode = auth
const statsBox = w.document.getElementById('pim-stats');
ok(statsBox.innerHTML === '' && statsBox.style.display === 'none',
   'carte : plus de stats de session en ligne');
ok(w.document.getElementById('pim-cups') === null,
   'carte : plus de bloc coupes en ligne');
const infoBox = w.document.getElementById('pim-info');
const _nb = (infoBox.innerHTML.match(/pim-cups-btn/g) || []).length;
ok(_nb === 1, 'carte : un SEUL bouton vers les statistiques (trouve ' + _nb + ')');
ok(/openPlayerProfile/.test(infoBox.innerHTML), 'carte : ce bouton ouvre la fenetre');

// La pastille de la liste mene directement a la fenetre, pas a la carte.
w.document.getElementById('player-info-modal').style.display = 'none';
w.document.getElementById('pp-modal').style.display = 'none';
w._plOpenStats(2);
ok(w.document.getElementById('pp-modal').style.display === 'flex',
   'pastille stats : ouvre la fenetre de statistiques');
ok(w.document.getElementById('player-info-modal').style.display !== 'flex',
   'pastille stats : n ouvre PAS la carte');
ok((w.document.getElementById('pp-who') || {}).textContent === 'autre',
   'fenetre : le nom du joueur est repris dans le titre');
ok(w.document.getElementById('pp-cups') !== null, 'fenetre : conteneur des coupes');
ok(w.document.getElementById('pp-session') === null,
   'fenetre (autre joueur) : pas de stats de session — elles sont locales a moi');

// Pour MOI, la fenetre porte en plus mes stats de session.
w._plOpenStats(1);
ok(w.document.getElementById('pp-session') !== null,
   'fenetre (moi) : mes stats de session sont presentes');
ok(typeof w._pimRenderSessionStats === 'function',
   'rendu des stats de session adressable a un conteneur au choix');

// Une seule source pour les deux branches.
const src = readFileSync('public/modules/ui/player-popup.mjs', 'utf8');
ok((src.match(/piRoleAdmin/g) || []).length === 1,
   'un seul endroit calcule le role (les branches ne peuvent plus diverger)');

console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
