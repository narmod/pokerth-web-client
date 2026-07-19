#!/usr/bin/env node
// Test d'intégration BOOT (ESM hotfix 0.3.849) : reproduit l'ordre navigateur
// (modules ES de pokerth-client.html, puis chat-emotes.js + pokerth.js en
// classique dans le contexte jsdom), puis exerce App.onServerOrGuestChange()
// pour chaque mode serveur. Aurait attrapé la disparition de `$` (0.3.848).
// Nécessite jsdom (devDependency) : npm i --no-save jsdom si absent.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import vm from 'vm';

const html = readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://pokerth.ddns.net/', pretendToBeVisual: true, runScripts: 'outside-only' });
const w = dom.window;
globalThis.window = w;
for (const k of ['document','localStorage','location','requestAnimationFrame','getComputedStyle','CustomEvent','Event']) {
  try { globalThis[k] = w[k]; } catch (e) {}
}
w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, addEventListener() {} }));
w.speechSynthesis = { getVoices: () => [], addEventListener() {}, cancel() {}, speak() {} };
w.SpeechSynthesisUtterance = function (t) { this.text = t; };
globalThis.WebSocket = w.WebSocket;
globalThis.fetch = () => Promise.reject(new Error('fetch stub')); w.fetch = globalThis.fetch;

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// 1) Modules dans l'ordre du HTML
const mods = [...html.matchAll(/<script type="module" src="(modules\/[^"]+)"><\/script>/g)].map(m => m[1]);
let modFails = 0;
for (const m of mods) { try { await import('../public/' + m); } catch (e) { modFails++; console.error('    module', m, '→', e.message); } }
ok(mods.length >= 25 && modFails === 0, mods.length + ' modules évalués sans erreur');

// Pont de fidélité : les modules chargés par node résolvent leurs identifiants
// nus dans le global node — recopier les propriétés window (sauf performance).
for (const k of Object.getOwnPropertyNames(w)) {
  if (k === 'performance' || k in globalThis) continue;
  try { globalThis[k] = w[k]; } catch (e) {}
}

// 2) Scripts classiques dans le contexte jsdom (le global EST window)
const ctx = dom.getInternalVMContext();
let bootErr = null;
try {
  vm.runInContext(readFileSync('public/chat-emotes.js', 'utf8'), ctx, { filename: 'chat-emotes.js' });
  vm.runInContext(readFileSync('public/pokerth.js', 'utf8'), ctx, { filename: 'pokerth.js' });
} catch (e) { bootErr = e; }
ok(!bootErr, 'pokerth.js évalué sans exception' + (bootErr ? ' — ' + bootErr.message : ''));
ok(vm.runInContext('typeof App', ctx) === 'object' || vm.runInContext('typeof App', ctx) === 'string'
   ? vm.runInContext("typeof App === 'object' && App !== null", ctx) : false, 'App défini (objet)');

// 3) Cycle de vie DOM
try {
  w.document.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
  w.dispatchEvent(new w.Event('load'));
  ok(true, 'DOMContentLoaded + load sans exception fatale');
} catch (e) { ok(false, 'DOMContentLoaded/load → ' + e.message); }
await new Promise(r => setTimeout(r, 60));

// 4) Le handler du sélecteur de serveur passe pour CHAQUE mode et le select tient
const srv = w.document.getElementById('server-mode');
ok(!!srv && srv.options.length >= 3, '#server-mode présent (' + (srv ? [...srv.options].map(o => o.value).join(',') : '∅') + ')');
for (const v of [...srv.options].map(o => o.value)) {
  let err = null;
  srv.value = v;
  try { vm.runInContext('App.onServerOrGuestChange()', ctx); } catch (e) { err = e; }
  await new Promise(r => setTimeout(r, 60));
  ok(!err && srv.value === v, 'mode ' + v + ' : handler OK et le select tient'
     + (err ? ' — ' + err.message : (srv.value !== v ? ' — FLIP vers ' + srv.value : '')));
}
// 5) Le garde de restauration (polling) ne rebascule pas
await new Promise(r => setTimeout(r, 700));
const last = [...srv.options].map(o => o.value).pop();
ok(srv.value === last, 'après 700 ms le select tient toujours (' + srv.value + ')');

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
