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
  /:root\[data-live="1"\] #fs-btn-lobby,[\s\S]{0,90}margin-left: auto/.test(css));
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

// Player aids on the felt: a log of a session the spectator has no part in,
// and a combinations reminder for someone deciding a move.
check('the log and combinations buttons are gone',
  /:root\[data-live="1"\] #hands-toggle-btn,[\s\S]{0,160}#log-toggle-btn/.test(css));
check('and their panels with them',
  /:root\[data-live="1"\] #g-log-panel,[\s\S]{0,80}#hands-overlay/.test(css));
check('their openers are stubbed, so nothing can build them',
  /\['toggleLog', 'toggleHandsHelp'\]/.test(live));

// The figures carry their wording as text, so a language change has to
// repaint them instead of leaving the old language up until the next poll.
const stats = R('public/modules/ui/live-stats.mjs');
check('the server figures follow a language change',
  /onLangChange\(function \(\) \{ if \(_lastData\) _render\(_lastData\); \}\)/.test(stats));
check('the last payload is kept for that repaint', /_lastData = d;/.test(stats));

// The player card: a spectator reads it, and that is all. Notes, ignore,
// avatar report and kickban all act on a session they are not part of.
const popup = R('public/modules/ui/player-popup.mjs');
check('the card is read-only in live mode', /const _readOnly = !!window\.LIVE_MODE;/.test(popup));
check('no notes block', /if \(!_readOnly && typeof window\._nvBlockHtml/.test(popup));
check('no ignore button', /if \(!_readOnly\) html \+= '<button type="button" class="pim-ignore-btn/.test(popup));
check('no avatar report', /if \(!_readOnly && !window\.isBot\(pid\) && pid !== S\.myId && S\._pthAvatarHashes/.test(popup));
check('no kickban', /if \(!_readOnly && !window\.isBot\(pid\) && pid !== S\.myId && \(S\._playerRights/.test(popup));

// Appearance dresses a table, so it has no place in the lobby.
check('no appearance button in the lobby',
  /:root\[data-live="1"\] #live-theme-lobby \{ display: none !important; \}/.test(css));
check('at the table it sits left of language and light\/dark',
  html.indexOf('id="live-theme-game"') < html.indexOf('id="lang-toggle-game"') &&
  html.indexOf('id="lang-toggle-game"') < html.indexOf('id="live-mode-game"'));
// Fullscreen comes out of the ••• menu into both headers. The ids already
// existed with their handler and translated title; they were hidden at all
// sizes since the move to that menu, so live mode wins those rules back.
check('fullscreen is shown in both headers',
  /:root\[data-live="1"\] #fs-btn-lobby,[\s\S]{0,200}display: inline-flex !important/.test(css));
check('including against the mobile rule',
  /:root\[data-live="1"\] #s-lobby #fs-btn-lobby/.test(css));
check('it is no longer hidden by the live rules',
  !/:root\[data-live="1"\] #fs-btn-lobby,\n:root\[data-live="1"\] #lobby-chat-btn/.test(css));
check('and it carries the margin that pushes the group right',
  /:root\[data-live="1"\] #fs-btn-lobby,[\s\S]{0,90}margin-left: auto !important/.test(css));

// A language change must land at once everywhere /live draws its own text.
const lobbyMod = R('public/modules/live/lobby.mjs');
check('the table list repaints on a language change',
  /onLangChange\(function \(\) \{ lastSig = null; render\(\); \}\)/.test(lobbyMod));
check('and it drops the guard that would have skipped it',
  /lastSig = null/.test(lobbyMod));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
