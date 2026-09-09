/* test-live-embed — ?embed=1, the layer that makes /live usable in an iframe.
 *
 * Three things change and nothing else: the host is told how tall the content
 * is, sound starts off, and nothing offers to install a page that is not the
 * destination. Everything else is plain /live.
 */
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'public', 'pokerth.css'), 'utf8');
const lobbyMsg = fs.readFileSync(
  path.join(root, 'public', 'modules', 'net', 'msg-lobby.mjs'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-embed');

// ── Without the flag, nothing happens ──
let dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'https://pokerth.net/live' });
global.window = dom.window; global.document = dom.window.document;
let mod = await import('../public/modules/live/embed.mjs');
check('a plain /live visit is not an embed', mod.isEmbedded() === false);
mod.initEmbed();
check('no embed flag on a plain visit',
  !document.documentElement.hasAttribute('data-embed'));

// ── With the flag ──
dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'https://pokerth.net/live?embed=1' });
global.window = dom.window; global.document = dom.window.document;
const posted = [];
dom.window.parent.postMessage = function (m) { posted.push(m); };

mod = await import('../public/modules/live/embed.mjs?v=2');
check('the flag is read from the query', mod.isEmbedded() === true);
mod.initEmbed();
check('the embed flag lands on <html>',
  document.documentElement.getAttribute('data-embed') === '1');
check('sound starts off', dom.window.localStorage.getItem('pth_sound') === '0');
check('the host is told we are ready',
  posted.some(m => m && m.channel === 'pokerth-live' && m.type === 'ready'));
check('the host is told how tall we are',
  posted.some(m => m && m.type === 'height' && typeof m.height === 'number'));

// A visitor who already chose keeps their choice — this sets a default only.
dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'https://pokerth.net/live?embed=1' });
global.window = dom.window; global.document = dom.window.document;
dom.window.parent.postMessage = function () {};
dom.window.localStorage.setItem('pth_sound', '1');
mod = await import('../public/modules/live/embed.mjs?v=3');
mod.initEmbed();
check('a visitor who turned sound on keeps it',
  dom.window.localStorage.getItem('pth_sound') === '1');

// ── Deep link ──
check('?table= spectates in live mode instead of taking a seat',
  /window\.LIVE_MODE && App && App\.spectateGame/.test(lobbyMsg));
check('the seated client still joins as before',
  /else if \(App && App\.joinGame\) App\.joinGame\(_aj\)/.test(lobbyMsg));

// ── Stylesheet ──
check('the frame does not grow its own scrollbar',
  /:root\[data-embed="1"\], :root\[data-embed="1"\] body \{ overflow: hidden; \}/.test(css));
check('nothing offers to install an embedded page',
  /:root\[data-embed="1"\] #install-btn/.test(css));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
