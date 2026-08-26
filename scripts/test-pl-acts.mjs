// Colonne d'actions de la liste des joueurs : la piste de grille doit suivre
// le nombre de pastilles reellement affichees, sinon l'en-tete (qui utilise le
// gabarit COMPLET) se desaligne des lignes. 3 pastilles pour tous, 4 pour un
// admin serveur (marteau / kickban, parite QML canAdminModerate).
import { readFileSync } from 'fs';
const src = readFileSync('public/pokerth.js', 'utf8');

const grab = (re, what) => {
  const m = src.match(re);
  if (!m) { console.log('NOT FOUND: ' + what); process.exit(1); }
  return m[0];
};
const code = [
  grab(/var _PL_ACTS_W = \{[\s\S]*?\};/, '_PL_ACTS_W'),
  grab(/function _plActsTrack\(\) \{[\s\S]*?\n\}/, '_plActsTrack'),
  grab(/var _PL_TRACK = \{[^\n]*\};/, '_PL_TRACK'),
  grab(/function _plTrack\(k\)[^\n]*\n/, '_plTrack'),
  grab(/function _plCanKickban\(r\) \{[\s\S]*?\n\}/, '_plCanKickban'),
].join('\n');

const make = (admin, isBot) => new Function('window', code +
  '\nreturn { track: _plTrack, acts: _plActsTrack, kick: _plCanKickban };')(
  { _amServerAdmin: () => admin, isBot: (p) => !!isBot });

let bad = 0;
const eq = (got, want, label) => {
  const ok = got === want;
  console.log('  ' + (ok ? 'OK  ' : 'FAIL') + ' ' + label + ' -> ' + got + (ok ? '' : ' (attendu ' + want + ')'));
  if (!ok) bad++;
};

console.log('non-admin:');
let a = make(false);
eq(a.acts(), '70px', 'piste acts');
eq(a.track('acts'), '70px', '_plTrack(acts)');
eq(a.track('flag'), '48px', '_plTrack(flag) inchange');
eq(a.kick({ pid: 7, isMe: false }), false, 'marteau sur un autre');

console.log('admin:');
let b = make(true);
eq(b.acts(), '90px', 'piste acts');
eq(b.track('acts'), '90px', '_plTrack(acts)');
eq(b.kick({ pid: 7, isMe: false }), true,  'marteau sur un autre');
eq(b.kick({ pid: 1, isMe: true }),  false, 'jamais sur ma ligne');
eq(make(true, true).kick({ pid: 7, isMe: false }), false, 'jamais sur un bot');

// La piste doit etre relue a chaque appel : un admin qui perd/gagne ses droits
// en cours de session doit voir la colonne changer sans rechargement.
let dyn = false;
const live = new Function('window', code + '\nreturn _plActsTrack;')({ _amServerAdmin: () => dyn });
const before = live(); dyn = true; const after = live();
console.log('dynamique:');
eq(before + '->' + after, '70px->90px', 'relue a chaque appel');

// _PL_TRACK ne doit plus etre lu directement pour acts.
if (/_PL_TRACK\[k\]/.test(src) && !/function _plTrack/.test(src)) { console.log('  FAIL lecture directe'); bad++; }
console.log(bad === 0 ? 'PL ACTS TRACK OK' : 'ERRORS ' + bad);
process.exit(bad ? 1 : 0);
