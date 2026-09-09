/* test-live-subscription — /live drops the lobby feed while watching a table.
 *
 * The server takes SubscriptionRequestMessage (type 20): 1 = off, 2 = on. The
 * official spectator tool sends it on the way into a table and on the way
 * back; we never did, so every embedded viewer kept receiving every update of
 * every table while watching one hand.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!DOCTYPE html><body><div id="s-lobby" class="screen active"></div>' +
  '<div id="s-game" class="screen"></div></body>',
  { url: 'https://pokerth.net/live' });
global.window = dom.window;
global.document = dom.window.document;

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-subscription');

const sent = [];
const { S } = await import('../public/modules/game/state.mjs');
const session = await import('../public/modules/net/session.mjs');
// The module sends through session.send; stub the socket it writes to.
S.ws = { readyState: 1, send: function (frame) { sent.push(new Uint8Array(frame)); } };

const { _internals } = await import('../public/modules/live/subscription.mjs');

// session.send() prefixes a 4-byte length in proxy mode and sends the raw
// protobuf on a direct /pthlive socket. Framing is session.mjs's business and
// is covered there; here we want the message itself, so read it direct.
window.directWS = true;

// Decode helper: the frame is [field1 varint = type][field21 = submessage].
function typeOf(buf) { return buf[1]; }
function actionOf(buf) { return buf[buf.length - 1]; }

const game = document.getElementById('s-game');
const lobby = document.getElementById('s-lobby');

_internals.sync();
check('nothing is sent while sitting in the lobby', sent.length === 0);

game.classList.add('active'); lobby.classList.remove('active');
_internals.sync();
check('entering a table sends one request', sent.length === 1);
check('it is a SubscriptionRequest', typeOf(sent[0]) === 20);
check('asking to stop the lobby feed', actionOf(sent[0]) === 1);

_internals.sync();
check('it is not sent again while still at the table', sent.length === 1);

S.games = { 1: { name: 'gone' } };
game.classList.remove('active'); lobby.classList.add('active');
_internals.sync();
check('returning sends a second request', sent.length === 2);
check('asking for the lobby feed again', actionOf(sent[1]) === 2);
check('the stale game list is cleared before the server replays it',
  Object.keys(S.games).length === 0);

// A dropped socket forgets the subscription on the server too.
game.classList.add('active'); lobby.classList.remove('active');
_internals.sync();
check('unsubscribed again at the table', _internals.isUnsubscribed() === true);
S.ws.readyState = 3;
_internals.sync();
check('a dropped socket clears the flag', _internals.isUnsubscribed() === false);
S.ws.readyState = 1;
_internals.sync();
check('and the request goes out again on the new socket',
  sent.length === 4 && actionOf(sent[3]) === 1);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
