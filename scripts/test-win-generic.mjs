#!/usr/bin/env node
// Fenetres de stats au modele generique : ni voile noir plein ecran, ni
// z-index hors bande, et mode fenetre flottante au-dessus du seuil _winGate.
// Concerne les deux cartes converties depuis l'ancien modele modal :
// #player-info-modal (carte joueur) et #game-info-modal (infos de partie).
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
const css  = readFileSync('public/pokerth.css', 'utf8');
const html = readFileSync('public/pokerth-client.html', 'utf8');
const zo   = readFileSync('public/modules/ui/z-order.mjs', 'utf8');
const pim  = readFileSync('public/modules/ui/player-popup.mjs', 'utf8');
const gim  = readFileSync('public/modules/ui/game-info.mjs', 'utf8');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  \u2717', m); } else console.log('  \u2713', m); };
const rule = (sel) => {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*\\}');
  return (css.match(re) || [''])[0];
};

for (const [name, host, card, back, src, key] of [
  ['carte joueur',     '#player-info-modal', '.pim-card', '.pim-backdrop', pim, 'pth-pim-win'],
  ['infos de partie',  '#game-info-modal',   '.gim-card', '.gim-backdrop', gim, 'pth-gim-win'],
]) {
  const h = rule(host);
  ok(/display:\s*none/.test(rule(back)), name + ' : voile noir retire');
  ok(!/rgba\(0,0,0,0\.65\)/.test(rule(back)), name + ' : plus de fond assombri');
  ok(/pointer-events:\s*none/.test(h), name + ' : conteneur transparent aux clics');
  ok(new RegExp(host.replace('#','#') + '\\s+\\' + card + '\\s*\\{[^}]*pointer-events:\\s*auto').test(css),
     name + ' : seule la carte intercepte les clics');
  const z = (h.match(/z-index:\s*(\d+)/) || [])[1];
  ok(z === '1200', name + ' : z-index dans la bande geree (' + z + ')');
  ok(zo.includes(host), name + ' : conteneur declare dans z-order');
  ok(new RegExp('\\' + card + '[^\\n]*floating-win|floating-win[^\\n]*\\' + card.slice(1)).test(css)
     || css.includes(card + '.floating-win'), name + ' : styles du mode flottant');
  ok(src.includes('_enableFloating'),  name + ' : passe en fenetre a l ouverture');
  ok(src.includes('_disableFloating'), name + ' : repasse en modale a la fermeture');
  ok(src.includes(key), name + ' : geometrie memorisee (' + key + ')');
  ok(/e\.key !== 'Escape'/.test(src), name + ' : Echap ferme (le voile ne le fait plus)');
}
// La carte interne doit etre surveillee par z-order, sinon la bascule
// modale <-> fenetre n'est jamais vue.
ok(/querySelectorAll\('[^']*\.pim-card[^']*\.gim-card/.test(zo),
   'z-order : cartes converties surveillees pour la bascule de classe');
// Le markup ne doit plus fermer au clic sur le voile (il n a plus de surface).
const dom = new JSDOM(html); const d = dom.window.document;
for (const [name, id] of [['carte joueur','player-info-modal'], ['infos de partie','game-info-modal']]) {
  const el = d.getElementById(id);
  ok(!!el && !!el.querySelector('.pim-close, .gim-close'), name + ' : croix de fermeture presente');
}
console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
