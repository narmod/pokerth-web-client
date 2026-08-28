// « Joue actuellement dans … » — parité QML PlayerListItem (stable, 27/08/2026).
// Trois garanties :
//   1. les deux clés (plPlayingInFull / plNotPlayingFull) existent dans les 45
//      langues et contiennent bien les gabarits %1 (nom) — %2 requis seulement
//      pour la variante « joue » ;
//   2. renderPlayersList pose la phrase complète en tooltip (title) du NOM,
//      sourcée sur r.act, SANS toucher au title existant de la manette de
//      statut (nom de table seul) ;
//   3. le popup joueur (pendant tactile, pas de hover au doigt) porte la même
//      ligne via _playerActivity, jamais pour un bot.
import { readFileSync, readdirSync } from 'fs';

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '\u2713' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

// ── 1. Couverture i18n : 45 langues, les deux clés, gabarits présents ──
console.log('i18n:');
const langDir = 'public/modules/lang';
const files = readdirSync(langDir).filter((f) => f.endsWith('.mjs'));
ok(files.length === 45, '45 fichiers de langue (' + files.length + ')');
let missing = [];
for (const f of files) {
  const m = await import('../' + langDir + '/' + f);
  const s = m.strings || {};
  const p = s.plPlayingInFull, n = s.plNotPlayingFull;
  if (!p || !n || p.indexOf('%1') === -1 || p.indexOf('%2') === -1 || n.indexOf('%1') === -1) {
    missing.push(f);
  }
}
ok(missing.length === 0, 'clés + gabarits %1/%2 partout' + (missing.length ? ' (manque: ' + missing.join(', ') + ')' : ''));

// ── 2. Liste des joueurs : tooltip sur le nom, LED intacte ──
console.log('renderPlayersList:');
const src = readFileSync('public/pokerth.js', 'utf8');
const fn = (src.match(/function renderPlayersList\(\) \{[\s\S]*?\nwindow\.renderPlayersList/) || [''])[0];
ok(fn.length > 0, 'fonction trouvée');
ok(/var _actTtl = r\.act\s*\n?\s*\? _tt\('plPlayingInFull'/.test(fn), '_actTtl sourcé sur r.act + plPlayingInFull');
ok(fn.indexOf("_tt('plNotPlayingFull'") !== -1, 'variante « ne joue pas »');
ok(fn.indexOf("+ ' title=\"' + esc(_actTtl) + '\"'") !== -1, 'title posé sur pl-name-link (échappé)');
// La manette de statut garde son title court (nom de table seul) :
ok(/pl-status[^\n]*title="' \+ \(r\.act \? esc\(r\.act\)/.test(fn), 'title de la manette de statut inchangé');

// ── 3. Popup joueur : ligne tactile, jamais pour un bot ──
console.log('player-popup:');
const pp = readFileSync('public/modules/ui/player-popup.mjs', 'utf8');
const oh = (pp.match(/function _otherPlayerInfoHtml\(pid\) \{[\s\S]*?\n\}/) || [''])[0];
ok(oh.length > 0, '_otherPlayerInfoHtml trouvé');
ok(oh.indexOf('window._playerActivity') !== -1, 'sourcé sur _playerActivity');
ok(oh.indexOf('!window.isBot(pid)') !== -1, 'garde bots');
ok(oh.indexOf("tt('plPlayingInFull'") !== -1 && oh.indexOf("tt('plNotPlayingFull'") !== -1, 'les deux clés utilisées');
ok(oh.indexOf('pim-activity') !== -1, 'ligne .pim-activity émise');
ok(/pim-activity[^\n]*' \+ esc\(_aline\) \+ '/.test(oh), 'contenu échappé (esc)');

if (bad) { console.log('FAIL ' + bad); process.exit(1); }
console.log('PL PLAYING-IN OK');
