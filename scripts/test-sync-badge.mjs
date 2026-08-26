// L'indicateur de synchro (.hdr-sync) se place a gauche de l'enveloppe des
// messages prives quand le header en a une, sinon a gauche du menu « Plus ».
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
const html = readFileSync('public/pokerth-client.html', 'utf8');
const src  = readFileSync('public/pokerth.js', 'utf8');
const dom = new JSDOM(html);
const { document } = dom.window;

// On extrait _SYNC_ICON + _syncBadgeMount du bundle et on les evalue seuls.
const icon = src.match(/var _SYNC_ICON = [\s\S]*?<\/svg>';/)[0];
const fn   = src.match(/function _syncBadgeMount\(\) \{[\s\S]*?\n\}/)[0];
const run = new Function('document', 't', '_syncBusy',
  icon + '\n' + fn + '\nreturn _syncBadgeMount;');
const mount = run(document, () => 'Syncing…', 0);

mount();
let bad = 0;
const wraps = document.querySelectorAll('.hdr-ovf-wrap');
console.log('headers:', wraps.length);
for (const w of wraps) {
  const hdr = w.parentNode;
  const sync = hdr.querySelector(':scope > .hdr-sync');
  const pm   = hdr.querySelector('[id^="pm-btn-"]');
  const id   = w.querySelector('button') ? w.querySelector('button').id : '?';
  if (!sync) { console.log('  MISSING .hdr-sync in header of', id); bad++; continue; }
  const nxt = sync.nextElementSibling;
  const okAnchor = pm ? (nxt === pm) : (nxt === w);
  console.log('  ' + id.padEnd(24), 'pm=' + (pm ? pm.id : '-'), 'next=' + (nxt ? (nxt.id || nxt.className) : 'null'), okAnchor ? 'OK' : 'WRONG');
  if (!okAnchor) bad++;
}
// idempotence : un second montage ne doit ni dupliquer ni deplacer
const before = document.querySelectorAll('.hdr-sync').length;
mount(); mount();
const after = document.querySelectorAll('.hdr-sync').length;
if (before !== after) { console.log('DUPLICATED:', before, '->', after); bad++; }
console.log(bad === 0 ? 'SYNC BADGE PLACEMENT OK' : 'ERRORS ' + bad);
process.exit(bad ? 1 : 0);
