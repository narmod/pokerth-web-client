// Messages privés par compte — parité QML 9bccf3a ("pm dialog persistence
// fine-tuning", stable, 28/08/2026) : le carnet appartient au pseudo
// connecté (setPrivateMessageOwner). Sans login, boîte vide et rien n'est
// persisté ; deux comptes du même navigateur ne se lisent plus.
//
// Node n'a pas d'IndexedDB : c'est volontairement le chemin de repli
// mémoire qui est testé ici — mêmes portes (owner vide = no-op), même
// isolation par compte. Le câblage réseau (InitAck / PlayerInfoReply) est
// vérifié par lecture du source, comme test-pm-send-icon.mjs.
import { readFileSync } from 'fs';
import * as store from '../public/modules/pm/store.mjs';

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '\u2713' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

console.log('store (repli mémoire, sans IndexedDB):');

// Personne de connecté : tout est fermé.
ok(store.owner() === '', 'owner vide au départ');
await store.append('bob', 'hello', true);
ok(store.partners().length === 0, 'append sans owner = no-op (rien à attribuer)');
ok(store.unreadCount() === 0, 'badge à zéro sans owner');
ok((await store.prune()) === 0, 'prune sans owner = no-op');
ok((await store.remove('bob')) === false, 'remove sans owner = no-op');

// Login alice : son carnet s'ouvre.
ok((await store.setOwner('alice')) === true, 'setOwner(alice) accepté');
ok((await store.setOwner('alice')) === false, 'setOwner idempotent (même compte)');
await store.append('bob', 'hi bob', true);
await store.append('bob', 'hi alice', false);
ok(store.partners().length === 1 && store.partners()[0].name === 'bob', 'conversation alice↔bob créée');
ok(store.unreadCount() === 1, 'entrant non lu compté');
await store.markRead('bob');
ok(store.unreadCount() === 0, 'markRead remet le badge à zéro');
ok(store.conversation('bob').length === 2, 'deux messages dans le fil');

// Changement de compte : rien ne filtre.
await store.setOwner('carol');
ok(store.partners().length === 0, 'carol ne voit PAS le carnet d\u2019alice');
ok(store.conversation('bob').length === 0, 'fil alice↔bob invisible pour carol');
await store.append('dave', 'yo', false);
ok(store.partners().length === 1 && store.partners()[0].name === 'dave', 'carol a son propre carnet');

// Déconnexion (owner vide) : boîte vide, rien ne s'écrit.
await store.setOwner('');
ok(store.partners().length === 0, 'déconnecté = boîte vide');
await store.append('dave', 'lost', false);
ok(store.partners().length === 0, 'rien ne se persiste déconnecté');

// Retour d'alice : son historique de session est toujours là.
await store.setOwner('alice');
ok(store.conversation('bob').length === 2, 'le carnet d\u2019alice survit au changement de compte');

// dropLast ne retire que le sortant qui correspond.
await store.dropLast('bob', 'hi alice');
ok(store.conversation('bob').length === 2, 'dropLast ignore un entrant au même texte');
await store.dropLast('bob', 'hi bob');
ok(store.conversation('bob').length === 1, 'dropLast retire le sortant refusé');

// remove borné au compte courant.
await store.remove('bob');
ok(store.partners().length === 0, 'remove vide le fil d\u2019alice');
await store.setOwner('carol');
ok(store.conversation('dave').length === 1, 'le carnet de carol est intact');

console.log('store.mjs (source):');
const src = readFileSync('public/modules/pm/store.mjs', 'utf8');
ok(src.indexOf('DB_VERSION = 2') !== -1, 'IndexedDB migré en v2 (colonne owner)');
ok(src.indexOf("keyPath: ['owner', 'name']") !== -1, 'clé primaire composite (owner, partner) — parité pm_thread');
ok(src.indexOf('_adopt') !== -1 && src.indexOf("v.owner === ''") !== -1, 'adoption des lignes sans owner au premier login');

console.log('câblage réseau (msg-lobby.mjs):');
const lob = readFileSync('public/modules/net/msg-lobby.mjs', 'utf8');
ok(/onInitAck[\s\S]{0,1400}_pmSetOwner && window\._pmSetOwner\(''\)/.test(lob), 'InitAck vide le owner (parité setSession)');
ok(/pid === S\.myId && name[\s\S]{0,120}_pmSetOwner\(name\)/.test(lob), 'PlayerInfoReply(soi) fixe le owner (parité setMyPlayerInfo)');

console.log('dialogue (pm.mjs):');
const pm = readFileSync('public/modules/ui/pm.mjs', 'utf8');
ok(/function setOwner\(name\)[\s\S]{0,900}_current = list\.length \? list\[0\]\.name : ''/.test(pm), 'partenaire actif disparu \u2192 premier de la liste ou vide (parité onPartnersChanged)');
ok(pm.indexOf('window._pmSetOwner   = setOwner') !== -1, 'pont window._pmSetOwner exposé');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('OK');
