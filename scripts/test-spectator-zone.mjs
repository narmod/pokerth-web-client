/* test-spectator-zone — the table zone keeps its height while spectating.
 *
 * A seated player keeps an always-present action bar so #g-actions never
 * collapses and the table is not re-scaled between hands (_pinShow in
 * renderGameWaiting). That guard is explicitly off for spectators, and a
 * spectator has no bar to show — so the box went from one waiting line to
 * nothing and back, the zone lost 23px, and every seat and the community row
 * were recomputed. Reported with figures: zone 1263x764 -> 1263x741,
 * boxScale 1.579 -> 1.531, commScale 1.775 -> 1.719.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'public', 'pokerth.css'), 'utf8');
const client = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-spectator-zone');

check('the always-present bar is still off for spectators',
  /_pinShow = !S\._amSpectator && S\._gameStarted/.test(client));
check('the spectator marker is still the one the rule keys off',
  /classList\.toggle\('spectator-nosend', _noSend\)/.test(client));
check('#g-actions keeps a reserved height while spectating',
  /body\.spectator-nosend #g-actions \{[\s\S]{0,120}min-height:/.test(css));
check('the reservation is one waiting line, not a magic number',
  /min-height: calc\(var\(--fs-sm\) \* 1\.4 \+ 8px\)/.test(css));
check('the waiting line it mirrors still has that padding',
  /\.waiting-msg \{[\s\S]{0,120}padding: 4px 0;/.test(css));
check('spectators are still given no action controls',
  /function clearSpectatorActions\(\)[\s\S]{0,120}innerHTML = '';/.test(client));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
