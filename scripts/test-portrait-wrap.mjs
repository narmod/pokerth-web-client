// Libellés longs : retour à la ligne au lieu d'une troncature « … » — parité
// QML portrait fine-tuning (stable, 27/08/2026, b0d42ae) :
//   · onglets d'À propos (.ab-tab) = CustomTabBar : WordWrap + 2 lignes max,
//     la barre grandit avec (clamp -webkit-, tous moteurs actuels) ;
//   · labels du formulaire de création (.cf label) = Local/NetworkGameSettings :
//     WordWrap libre.
import { readFileSync } from 'fs';

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '\u2713' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

const css = readFileSync('public/pokerth.css', 'utf8');

console.log('.ab-tab:');
const ab = (css.match(/\.ab-tab \{[^}]*\}/) || [''])[0];
ok(ab.length > 0, 'regle presente');
ok(ab.indexOf('white-space:normal') !== -1, 'nowrap retire (WordWrap)');
ok(ab.indexOf('text-overflow') === -1, 'plus d\'ellipsis simple ligne');
ok(ab.indexOf('-webkit-line-clamp:2') !== -1 && ab.indexOf('-webkit-box-orient:vertical') !== -1
   && ab.indexOf('display:-webkit-box') !== -1 && ab.indexOf('overflow:hidden') !== -1,
   'clamp 2 lignes complet (maximumLineCount:2 QML)');
ok(ab.indexOf('text-align:center') !== -1, 'centrage explicite conserve sous -webkit-box');
ok(ab.indexOf('flex:1 1 0') !== -1 && ab.indexOf('min-width:0') !== -1, 'geometrie d\'onglet inchangee');

console.log('.cf label:');
const cf = (css.match(/\.cf label \{[^}]*\}/) || [''])[0];
ok(cf.length > 0, 'regle presente');
ok(cf.indexOf('white-space: normal') !== -1, 'nowrap retire (WordWrap)');
ok(cf.indexOf('overflow-wrap: break-word') !== -1, 'coupe des mots tres longs');
ok(cf.indexOf('text-overflow') === -1 && cf.indexOf('overflow: hidden') === -1, 'plus de troncature');
ok(cf.indexOf('text-transform: uppercase') !== -1 && cf.indexOf('letter-spacing: 0.1em') !== -1, 'typographie inchangee');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('PORTRAIT WRAP OK');
