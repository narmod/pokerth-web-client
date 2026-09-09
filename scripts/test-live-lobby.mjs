/* test-live-lobby — the /live table list renders, expands and spectates.
 *
 * Runs the real module against a jsdom document with a stubbed S, so the
 * column order, the mode gating on Spectate and the repaint hook are checked
 * for real rather than by pattern-matching the source.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!DOCTYPE html><body>' +
  '<div id="live-lobby"><div id="live-lobby-list"></div>' +
  '<div id="live-chat-resizer"></div><div id="live-chat-side"></div></div>' +
  '<div id="lobby-chat-panel"><div id="chat"></div></div>' +
  '<div id="g-list"></div></body>',
  { url: 'https://pokerth.net/live' });
global.window = dom.window;
global.document = dom.window.document;

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

window.PthState = {
  players: { 11: 'velt', 12: 'indios', 13: 'gehawe' },
  games: {
    7: { name: 'My Online Game123', mode: 2, players: 3, maxPlayers: 10, type: 4,
         priv: false, timeout: 5, delay: 5, startMoney: 10000, smallBlind: 50,
         raiseMode: 1, raiseHands: 11, seats: [11, 12, 13], watchers: [99] },
    9: { name: 'Waiting table', mode: 1, players: 1, maxPlayers: 10, type: 3,
         priv: true, timeout: 10, delay: 7, startMoney: 3000, smallBlind: 25,
         seats: [11] }
  }
};
let spectated = null;
window.App = { spectateGame: function (id) { spectated = id; } };
let origCalls = 0;
window.renderGames = function () { origCalls++; };

console.log('test-live-lobby');

const { initLiveLobby } = await import('../public/modules/live/lobby.mjs');
initLiveLobby();

const host = document.getElementById('live-lobby-list');
// The state bridge is window.PthState, not window.S — reading the wrong one
// is what made the list show "no tables" on a full server (web.69).
check('the list reads the real state bridge',
  host.querySelectorAll('.llb-row').length === 2 && !('S' in window));
check('both tables are listed', host.querySelectorAll('.llb-row').length === 2);
check('running table is sorted first',
  host.querySelector('.llb-row .llb-c-name').textContent === 'Waiting table');
check('seat count is shown as x/max',
  /1\/10/.test(host.textContent) && /3\/10/.test(host.textContent));
const runningCells = [...host.querySelectorAll('.llb-row')]
  .find(r => r.textContent.includes('My Online Game123'))
  .querySelector('.llb-line').children;
check('spectator count is shown in its own column, with the eye',
  /\u{1F441}\s*1/u.test(runningCells[5].textContent));
check('private table shows the lock', host.innerHTML.includes('\u{1F512}'));
check('timeouts are shown as Xs/Ys', /5s\/5s/.test(host.textContent));
check('header row is present', !!host.querySelector('.llb-head'));

// The original renderGames must still run — the live list is additive.
window.renderGames();
check('the wrapped renderGames still calls through', origCalls === 1);

// The real repaint path: msg-lobby.mjs calls the ESM binding, not the global,
// so the list has to follow the ordinary list's DOM instead.
const repaint = async function () {
  document.getElementById('g-list').appendChild(document.createElement('i'));
  await new Promise(function (r) { setTimeout(r, 0); });
};
window.PthState.games[12] = { name: 'Third table', mode: 2, players: 5, maxPlayers: 10,
  type: 1, priv: false, timeout: 5, delay: 5, seats: [], watchers: [] };
await repaint();
check('a table added without the global still appears',
  /Third table/.test(host.textContent));

// Expanding a running table exposes the seated players and Spectate.
const running = [...host.querySelectorAll('.llb-line')]
  .find(function (l) { return l.textContent.includes('My Online Game123'); });
running.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
check('expanded row lists the seated players',
  /velt/.test(host.textContent) && /indios/.test(host.textContent));
check('expanded row shows the stake settings', /10\u202F000/.test(host.textContent));
check('Spectate is offered on a running table', !!host.querySelector('[data-spec]'));

host.querySelector('[data-spec]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
check('Spectate calls App.spectateGame with the game id', spectated === 7);

// A table still waiting for players cannot be spectated.
const waiting = [...host.querySelectorAll('.llb-line')]
  .find(function (l) { return l.textContent.includes('Waiting table'); });
waiting.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
const waitingRow = [...host.querySelectorAll('.llb-row')]
  .find(function (r) { return r.textContent.includes('Waiting table'); });
check('no Spectate button on a table that has not started',
  !waitingRow.querySelector('[data-spec]'));

// Names are escaped, never injected.
window.PthState.games[7].name = '<img src=x onerror=alert(1)>';
window.renderGames();
check('table names are escaped',
  host.innerHTML.includes('&lt;img') && !host.querySelector('img'));

// Empty list falls back to a message instead of a bare header.
window.PthState.games = {};
window.renderGames();
check('empty list shows a placeholder', !!host.querySelector('.llb-empty'));

// ── Tabs and the players pane ──
// The empty-list check above cleared the games, so put a running table back.
window.PthState.games = {
  7: { name: 'My Online Game123', mode: 2, players: 3, maxPlayers: 10, type: 4,
       priv: false, timeout: 5, delay: 5, startMoney: 10000, smallBlind: 50,
       raiseMode: 1, raiseHands: 11, seats: [11, 12, 13], watchers: [99] }
};
await repaint();
check('a tab bar sits above the list', !!host.querySelector('.llb-tabs'));
check('the games tab is active by default',
  host.querySelector('.llb-tab.on').getAttribute('data-tab') === 'games');
check('the tabs carry their counts',
  /^1 /.test(host.querySelector('[data-tab="games"]').textContent.trim()) &&
  /^3 /.test(host.querySelector('[data-tab="players"]').textContent.trim()));

host.querySelector('[data-tab="players"]')
  .dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
check('the players tab lists everyone online',
  /velt/.test(host.textContent) && /gehawe/.test(host.textContent));
check('the players tab replaces the table list',
  !host.querySelector('.llb-row'));
check('each player row carries an avatar chip',
  !!host.querySelector('.llb-pl .llb-pl-av'));
check('clicking a name opens the client player card',
  /openPlayerInfoPopup\(11\)/.test(host.innerHTML));
check('a player at a running table can be spectated from their row',
  !!host.querySelector('.llb-pl [data-spec]'));

spectated = null;
host.querySelector('.llb-pl [data-spec]')
  .dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
check('spectating from the players tab opens their table', spectated === 7);

host.querySelector('[data-tab="games"]')
  .dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
check('switching back restores the table list', !!host.querySelector('.llb-row'));

// ── Chat column ──
const { initLiveChatPane } = await import('../public/modules/live/chat-pane.mjs');
const lobby = document.getElementById('live-lobby');
const side = document.getElementById('live-chat-side');
initLiveChatPane();

check('the real chat panel is docked in the strip',
  document.getElementById('lobby-chat-panel').parentNode === side);
check('the chat panel keeps its own message node',
  !!side.querySelector('#chat'));
check('a height is set on the container',
  /px$/.test(lobby.style.getPropertyValue('--live-chat-h')));

// Keyboard resizing, since the grip is focusable.
const grip = document.getElementById('live-chat-resizer');
const before = parseInt(lobby.style.getPropertyValue('--live-chat-h'), 10);
grip.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
check('ArrowDown shrinks the chat strip',
  parseInt(lobby.style.getPropertyValue('--live-chat-h'), 10) < before);
check('the new height is persisted',
  parseInt(dom.window.localStorage.getItem('pth_live_chat_h'), 10) ===
  parseInt(lobby.style.getPropertyValue('--live-chat-h'), 10));

// The floor must hold however hard the user drags.
for (let i = 0; i < 60; i++) {
  grip.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
}
check('the chat strip never collapses below its floor',
  parseInt(lobby.style.getPropertyValue('--live-chat-h'), 10) >= 110);

// pokerth.js re-parents the chat panel whenever the lobby re-lays itself out;
// the strip has to take it back rather than sit empty.
document.getElementById('g-list').appendChild(document.getElementById('lobby-chat-panel'));
await repaint();
check('the chat is re-docked after the client steals it back',
  document.getElementById('lobby-chat-panel').parentNode === side);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
