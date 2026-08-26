#!/usr/bin/env node
// Alignement de la colonne d'actions de la liste des joueurs.
// La cellule .pl-acts est alignee a DROITE : si une ligne porte moins de
// pastilles que la piste n'en reserve, ses icones glissent d'un cran et ne
// tombent plus sous la bonne pastille d'en-tete. Chaque ligne doit donc
// contenir exactement le meme nombre d'emplacements (pastille ou cale) :
// 3 pour tous, 4 quand je suis admin serveur (marteau).
// Rend la vraie liste via renderPlayersList dans jsdom -- pas de logique
// reimplementee ici.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import vm from 'vm';

const html = readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://pokerth.ddns.net/', pretendToBeVisual: true, runScripts: 'outside-only' });
const w = dom.window;
globalThis.window = w;
for (const k of ['document','localStorage','location','requestAnimationFrame','getComputedStyle','CustomEvent','Event',
                 'MutationObserver','IntersectionObserver','ResizeObserver','NodeFilter','Node','HTMLElement']) {
  try { globalThis[k] = w[k]; } catch (e) {}
}
w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, addEventListener() {} }));
w.speechSynthesis = { getVoices: () => [], addEventListener() {}, cancel() {}, speak() {} };
w.SpeechSynthesisUtterance = function (t) { this.text = t; };
globalThis.WebSocket = w.WebSocket;
globalThis.fetch = () => Promise.reject(new Error('fetch stub')); w.fetch = globalThis.fetch;

const mods = [...html.matchAll(/<script type="module" src="(modules\/[^"]+)"><\/script>/g)].map(m => m[1]);
for (const m of mods) { try { await import('../public/' + m); } catch (e) {} }
for (const k of Object.getOwnPropertyNames(w)) {
  if (k === 'performance' || k in globalThis) continue;
  try { globalThis[k] = w[k]; } catch (e) {}
}
const ctx = dom.getInternalVMContext();
vm.runInContext(readFileSync('public/chat-emotes.js', 'utf8'), ctx, { filename: 'chat-emotes.js' });
vm.runInContext("(function(){'use strict';\n" + readFileSync('public/pokerth.js', 'utf8') + "\n})();", ctx, { filename: 'pokerth.js' });
w.document.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
await new Promise(r => setTimeout(r, 40));

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  \u2717', m); } else console.log('  \u2713', m); };

// Faux lobby : moi (#1), un autre joueur (#2), un joueur en partie lancee (#3).
const PLAYERS = { 1: 'me', 2: 'other', 3: 'seated' };
w._readLobbyPids = () => [1, 2, 3];
w._readPlayers   = () => PLAYERS;
w._readMyId      = () => 1;
w.getPlayerName  = (p) => PLAYERS[p];
w.isBot          = () => false;
w._isIgnored     = () => false;
w._playerActivity = (p) => (p === 3 ? 'table' : '');
w._playerInRunningGame = (p) => p === 3;
w._amGuestMode = () => false;
w._avatarChipHtml = () => '<span class="pl-av"></span>';

function render(admin) {
  w._amServerAdmin = () => admin;
  vm.runInContext('window.renderPlayersList()', ctx);
  return [...w.document.querySelectorAll('#players-list-body .pl-row')];
}

for (const admin of [false, true]) {
  const want = admin ? 4 : 3;
  const rows = render(admin);
  ok(rows.length === 3, (admin ? 'admin' : 'non-admin') + ' : 3 lignes rendues (' + rows.length + ')');
  let allSame = rows.length > 0;
  const counts = [];
  for (const row of rows) {
    const acts = row.querySelector('.pl-acts');
    const slots = acts ? acts.children.length : -1;
    counts.push(slots);
    if (slots !== want) allSame = false;
  }
  ok(allSame, (admin ? 'admin' : 'non-admin') + ' : chaque ligne a ' + want + ' emplacements [' + counts.join(',') + ']');
  // La piste de grille doit reserver la meme chose.
  const body = w.document.getElementById('players-list-body');
  const tmpl = body.style.getPropertyValue('--pl-cols') || '';
  ok(tmpl.includes(admin ? '90px' : '70px'),
     (admin ? 'admin' : 'non-admin') + ' : piste acts = ' + (admin ? '90px' : '70px') + ' (' + tmpl.trim() + ')');
  // Le marteau n'apparait que pour un admin, et jamais sur ma propre ligne.
  const gavels = w.document.querySelectorAll('#players-list-body .pl-act-gavel').length;
  ok(gavels === (admin ? 2 : 0), (admin ? 'admin' : 'non-admin') + ' : ' + gavels + ' marteau(x) (attendu ' + (admin ? 2 : 0) + ')');
}

console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
