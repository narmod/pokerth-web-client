/* test-live-quiet — /live shows none of the web client's own notices.
 *
 * "All the informal popups with info about webclient etc. are not really
 * necessary for the spectator tool" — sp0ck, 2026-09-10, after reviewing
 * pokerth2.ddns.net/live.
 *
 * What must stay: anything that reports rather than informs — connection
 * errors, the inactivity warning, and the spectate dialog the viewer asked
 * for by clicking Spectate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8');
const poll = fs.readFileSync(path.join(root, 'public', 'modules', 'ui', 'poll.mjs'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'pokerth.css'), 'utf8');
const social = fs.readFileSync(
  path.join(root, 'public', 'modules', 'net', 'msg-social.mjs'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-quiet');

// Silenced — and silenced at the entry point, so every call site is covered.
check('no welcome modal',
  /function maybeShowWelcome\(w\) \{[\s\S]{0,260}if \(window\.LIVE_MODE\) return;/.test(client));
check('no auth notice',
  /function maybeShowAuthNotice\(\) \{[\s\S]{0,260}if \(window\.LIVE_MODE\) return;/.test(client));
check('no poll',
  /window\._pollOnScreen = function \(id\) \{[\s\S]{0,200}if \(window\.LIVE_MODE\) \{ _close\(\); return; \}/.test(poll));
check('nothing under the button but the figures',
  /:root\[data-live="1"\] #cstatus \{ display: none; \}/.test(css));
check('no install prompt', /:root\[data-live="1"\] #install-btn/.test(css));

// Kept: these report, they do not advertise.
check('the inactivity warning still reaches a spectator',
  /function onTimeoutWarning/.test(social) && !/onTimeoutWarning[\s\S]{0,200}LIVE_MODE/.test(social));
check('a spectator who cannot connect is still told why',
  /:root\[data-live="1"\] #cstatus\.err \{ display: block; \}/.test(css));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
