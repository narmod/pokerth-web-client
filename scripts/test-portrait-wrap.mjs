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
// web.150 : le clamp DOIT vivre sur le span interne — pose sur le <button>
// (qui garde son rendu interne et ignore display:-webkit-box), il etait
// inoperant : 5 lignes coupees en plein mot sur iPhone.
ok(ab.indexOf('-webkit-line-clamp') === -1 && ab.indexOf('display:-webkit-box') === -1,
   'pas de clamp sur le <button> (inoperant)');
ok(ab.indexOf('text-align:center') !== -1, 'centrage explicite');
ok(ab.indexOf('flex:1 1 0') !== -1 && ab.indexOf('min-width:0') !== -1, 'geometrie d\'onglet inchangee');
const lbl = (css.match(/\.ab-tab-lbl \{[^}]*\}/) || [''])[0];
ok(lbl.indexOf('-webkit-line-clamp:2') !== -1 && lbl.indexOf('-webkit-box-orient:vertical') !== -1
   && lbl.indexOf('display:-webkit-box') !== -1 && lbl.indexOf('overflow:hidden') !== -1,
   'clamp 2 lignes complet sur .ab-tab-lbl (maximumLineCount:2 QML)');
ok(lbl.indexOf('hyphens:auto') !== -1, 'cesure typographique (plus de coupe seche en plein mot)');
ok(lbl.indexOf('overflow-wrap:break-word') !== -1, 'break-word garde en ultime repli');
ok(/@media \(max-width: ?560px\) \{ \.ab-tab \{ font-size:var\(--fs-sm\); \} \}/.test(css),
   'police reduite sous 560px');
const html = readFileSync('public/pokerth-client.html', 'utf8');
const tabs = html.match(/<button class="ab-tab[^"]*"[^>]*><span class="ab-tab-lbl" data-i18n="[^"]+">[^<]+<\/span><\/button>/g) || [];
ok(tabs.length === 6, 'les 6 onglets portent le span interne .ab-tab-lbl (' + tabs.length + ')');

console.log('.cf label:');
const cf = (css.match(/\.cf label \{[^}]*\}/) || [''])[0];
ok(cf.length > 0, 'regle presente');
ok(cf.indexOf('white-space: normal') !== -1, 'nowrap retire (WordWrap)');
ok(cf.indexOf('overflow-wrap: break-word') !== -1, 'coupe des mots tres longs');
ok(cf.indexOf('text-overflow') === -1 && cf.indexOf('overflow: hidden') === -1, 'plus de troncature');
ok(cf.indexOf('text-transform: uppercase') !== -1 && cf.indexOf('letter-spacing: 0.1em') !== -1, 'typographie inchangee');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('PORTRAIT WRAP OK');
