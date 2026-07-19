#!/usr/bin/env node
// Deterministic tests for public/modules/ui/chat.mjs (ESM #9f-6).
// Run: node scripts/test-chat.mjs
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
function makeEl() { return { style: {}, children: [], textContent: '', innerHTML: '',
  className: '', dataset: {}, scrollTop: 0, scrollHeight: 100,
  classList: { add() {}, remove() {} },
  appendChild(c) { this.children.push(c); }, remove() {} }; }
const chatEl = makeEl();
globalThis.document = { readyState: 'complete', addEventListener() {},
  querySelectorAll: () => [],
  getElementById: (id) => (id === 'chat' ? chatEl : makeEl()),
  createElement: () => makeEl() };
window._isIgnored = (name) => name === 'Ignoré';
window.addGameChat = () => {};
window._advStripEmoji = (s) => s;
window._chatTs = () => '12:00';

const { S } = await import('../public/modules/game/state.mjs');
const C = await import('../public/modules/ui/chat.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

// addChat : ajoute une ligne au panneau
const before = chatEl.children.length;
C.addChat('Alice', 'salut', '');
ok(chatEl.children.length === before + 1, 'addChat ajoute une ligne');
ok(chatEl.scrollTop === chatEl.scrollHeight, 'addChat scrolle en bas');

// joueur ignoré filtré
C.addChat('Ignoré', 'spam', '');
ok(chatEl.children.length === before + 1, 'message d\'un joueur ignoré filtré');

// messages système : volontairement retirés du chat (demande narmod)
C.addChat(null, 'info', 'sys');
ok(chatEl.children.length === before + 1, "message 'sys' filtré (comportement voulu)");
// garde addGameChat adaptée à la portée module : le hook window est bien appelé
let hooked = 0; window.addGameChat = () => hooked++;
C.addChat('Bob', 'yo', '');
ok(hooked === 1 && chatEl.children.length === before + 2, 'hook window.addGameChat appelé');

// _chatLocalCmd(text, echo) : echo(name, text) rend la réponse localement
const echoed = [];
const echo = (name, txt) => echoed.push(String(txt));
ok(C._chatLocalCmd('bonjour tout le monde', echo) === false, 'texte normal → pas une commande');
ok(C._chatLocalCmd('/nope-cette-commande-n-existe-pas', echo) === false, 'commande inconnue → false');
ok(echoed.length === 0, 'aucun echo pour les non-commandes');
ok(C._chatLocalCmd('/help', echo) === true && echoed.length === 1
   && echoed[0].includes('/diag'), '/help traité localement avec echo');

ok(window.addChat === C.addChat && window._chatLocalCmd === C._chatLocalCmd, 'ponts window en place');
console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
