// Test déterministe de modules/ui/lobby-keynav.mjs
//   liste des tables au clavier : flèches / Début / Fin, Entrée = activer
//   (parité QML b170786, LobbyPage gameListView).
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2713 ' + label); }
  else { fail++; console.log('  \u2717 ' + label); }
}

const dom = new JSDOM(`<!doctype html><body>
  <div id="g-list" tabindex="0">
    <div class="game-row" data-gid="7"><button id="join7">Join</button></div>
    <div class="game-row" data-gid="3"></div>
    <div class="game-row" data-gid="12"></div>
  </div>
</body>`, { url: 'https://pokerth.local/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'KeyboardEvent']) globalThis[k] = w[k];
globalThis.window = w;

const { stepGid, bindLobbyKeynav } = await import('../public/modules/ui/lobby-keynav.mjs');

console.log('lobby-keynav');

// stepGid : logique pure
const G = ['7', '3', '12'];
ok(stepGid(G, null, 'ArrowDown') === '7', 'rien de sélectionné : ↓ prend la première table');
ok(stepGid(G, null, 'ArrowUp') === '12', 'rien de sélectionné : ↑ prend la dernière table');
ok(stepGid(G, 7, 'ArrowDown') === '3' && stepGid(G, 3, 'ArrowUp') === '7', '↓ / ↑ : table suivante / précédente (gid numérique ou texte)');
ok(stepGid(G, 12, 'ArrowDown') === '12' && stepGid(G, 7, 'ArrowUp') === '7', 'bords : pas de bouclage');
ok(stepGid(G, 3, 'Home') === '7' && stepGid(G, 3, 'End') === '12', 'Début / Fin');
ok(stepGid(G, 99, 'ArrowDown') === '7', 'sélection hors liste (filtrée) : repart de la première');
ok(stepGid([], null, 'ArrowDown') === null, 'liste vide : null');
ok(stepGid(G, 7, 'a') === undefined, 'autre touche : non gérée');

// Liaison DOM
let cur = null; const calls = [];
bindLobbyKeynav({
  listId: 'g-list',
  current: () => cur,
  select: (gid) => { cur = parseInt(gid, 10); calls.push('sel' + gid); },
  activate: () => calls.push('act' + cur)
});
const list = w.document.getElementById('g-list');
const key = (k, target, extra) => {
  const ev = new w.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, extra || {}));
  (target || list).dispatchEvent(ev);
  return ev;
};

let ev = key('ArrowDown');
ok(calls.join() === 'sel7' && ev.defaultPrevented, '↓ sur la liste : sélectionne la première table, sans défilement natif');
calls.length = 0; key('ArrowDown'); key('ArrowDown'); key('ArrowDown');
ok(calls.join() === 'sel3,sel12', '↓ répété : avance puis s\u2019arrête en bas (pas de re-sélection)');
calls.length = 0; key('Enter');
ok(calls.join() === 'act12', 'Entrée : active la table sélectionnée');
calls.length = 0; key('Enter', w.document.getElementById('join7'));
ok(calls.length === 0, 'touche reçue par un bouton de ligne : laissée au bouton');
calls.length = 0; ev = key('ArrowDown', null, { shiftKey: true });
ok(calls.length === 0 && !ev.defaultPrevented, 'Maj+↓ : ignoré');
cur = 99; calls.length = 0; ev = key('Enter');
ok(calls.length === 0 && !ev.defaultPrevented, 'Entrée sur une table sortie du filtre : rien');
w.localStorage.setItem('pth_keynav', '0');
cur = 7; calls.length = 0; ev = key('ArrowDown');
ok(calls.length === 0 && !ev.defaultPrevented, 'option clavier coupée : inerte');

console.log(fail ? `FAIL ${fail}/${pass + fail}` : `PASS ${pass}/${pass}`);
process.exit(fail ? 1 : 0);
