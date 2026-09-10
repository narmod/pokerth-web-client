/* test-live-chrome — what /live must not carry, and what its header shows.
 *
 * A spectator tool embedded on the site is not the web client's shop window:
 * no local backups of settings nobody made, no operator broadcasts aimed at
 * players, no music slider for a player that does not ship, no build string.
 * The header keeps the guest name on the left and everything actionable hard
 * right, with light / dark / automatic among it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = p => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const css = R('public/pokerth.css');
const html = R('public/pokerth-client.html');
const live = R('public/modules/live/index.mjs');
const backup = R('public/modules/backup-autosave.mjs');
const sounds = R('public/modules/sounds.mjs');
const social = R('public/modules/net/msg-social.mjs');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-chrome');

// Backups: off at the root, so no banner, no folder handle, no IndexedDB.
check('no backup feature at all on /live',
  /function _supported\(\) \{[\s\S]{0,320}window\.LIVE_MODE\) return false;/.test(backup));

// Broadcasts: dropped before they reach any pane.
check('operator broadcasts never reach a spectator',
  /if \(ctype === 3 && window\.LIVE_MODE\) return;/.test(social));
check('and other chat types still do',
  !/window\.LIVE_MODE[\s\S]{0,40}ctype === 0/.test(social));

// Sound: game sound only.
check('no music slider in the sound popover',
  /!window\._musicOff && !window\.LIVE_MODE/.test(sounds));

// Header.
check('the build string is hidden', /:root\[data-live="1"\] \.live-ver \{ display: none/.test(css));
check('the buttons are pushed hard right',
  /:root\[data-live="1"\] #lang-toggle-lobby,[\s\S]{0,80}margin-left: auto/.test(css));
for (const id of ['live-mode-lobby', 'live-mode-game', 'live-mode-connect']) {
  check('a light/dark button in ' + id.replace('live-mode-', ''),
    new RegExp('id="' + id + '"').test(html));
}
check('it cycles automatic, light, dark',
  /MODES = \['auto', 'pokerth-light', 'pokerth'\]/.test(live));
check('it reuses the palette axis rather than adding a setting',
  /window\.setTheme\(next\)/.test(live) && /window\.getTheme\(\)/.test(live));
check('an unrelated palette falls back to automatic',
  /MODES\[\(i < 0 \? -1 : i\) \+ 1\] \|\| MODES\[0\]/.test(live));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
