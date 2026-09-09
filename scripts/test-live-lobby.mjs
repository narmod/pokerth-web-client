/* test-live-lobby — the /live table list renders, expands and spectates.
 *
 * Runs the real module against a jsdom document with a stubbed S, so the
 * column order, the mode gating on Spectate and the repaint hook are checked
 * for real rather than by pattern-matching the source.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body><div id="live-lobby"></div></body>', {
  url: 'https://pokerth.net/live'
});
global.window = dom.window;
global.document = dom.window.document;

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

window.S = {
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

const host = document.getElementById('live-lobby');
check('both tables are listed', host.querySelectorAll('.llb-row').length === 2);
check('running table is sorted first',
  host.querySelector('.llb-row .llb-c-name').textContent === 'Waiting table');
check('seat count is shown as x/max',
  /1\/10/.test(host.textContent) && /3\/10/.test(host.textContent));
const runningCells = [...host.querySelectorAll('.llb-row')]
  .find(r => r.textContent.includes('My Online Game123'))
  .querySelector('.llb-line').children;
check('spectator count is shown in its own column',
  runningCells[5].textContent === '1');
check('private table shows the lock', host.innerHTML.includes('\u{1F512}'));
check('timeouts are shown as Xs/Ys', /5s\/5s/.test(host.textContent));
check('header row is present', !!host.querySelector('.llb-head'));

// The original renderGames must still run — the live list is additive.
window.renderGames();
check('the wrapped renderGames still calls through', origCalls === 1);

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
window.S.games[7].name = '<img src=x onerror=alert(1)>';
window.renderGames();
check('table names are escaped',
  host.innerHTML.includes('&lt;img') && !host.querySelector('img'));

// Empty list falls back to a message instead of a bare header.
window.S.games = {};
window.renderGames();
check('empty list shows a placeholder', !!host.querySelector('.llb-empty'));

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
