// Ghost sessions of a quick reconnect (forum report, 2026-10-16): the server
// briefly lists the same nickname under an old and a new pid; the old one
// rejects private messages. game/presence.mjs must route to the newest online
// session and flag the rest as ghosts, and pm.mjs must use it.
import { readFileSync } from 'fs';
import { onlinePidByName, ghostPids } from '../public/modules/game/presence.mjs';

let bad = 0;
const ok = (cond, label) => {
  console.log('  ' + (cond ? '✓' : 'FAIL') + ' ' + label);
  if (!cond) bad++;
};

const ME = 50;
const players = { 12: 'Teressa', 40: 'Bob', 50: 'Me', 77: 'Teressa', 9: 'Gone', 30: 'Me' };
const online = new Set([12, 40, 50, 77, 30]);

console.log('onlinePidByName:');
ok(onlinePidByName(players, online, ME, 'Teressa') === 77, 'homonyms: newest session (highest pid) wins');
ok(onlinePidByName(players, online, ME, 'Bob') === 40, 'single player resolved');
ok(onlinePidByName(players, online, ME, 'Gone') === 0, 'cached but offline player = 0 (not online)');
ok(onlinePidByName(players, online, ME, 'Nobody') === 0, 'unknown name = 0');
ok(onlinePidByName(players, online, ME, '') === 0, 'empty name = 0');
ok(onlinePidByName(players, online, ME, 'Me') === ME, 'my name resolves to my own session');
ok(onlinePidByName(players, new Set([12]), ME, 'Teressa') === 12, 'ghost gone, only session left is used');
ok(onlinePidByName(players, [12, 77], ME, 'Teressa') === 77, 'accepts an array of pids');

console.log('ghostPids:');
const g = ghostPids(players, online, ME);
ok(g.has(12) && !g.has(77), 'older Teressa is a ghost, newer kept');
ok(g.has(30) && !g.has(ME), 'my older homonym is a ghost, I am kept');
ok(!g.has(40), 'unique player is not a ghost');
ok(g.size === 2, 'exactly two ghosts');
ok(ghostPids({ 5: '#5', 6: '#5' }, new Set([5, 6]), 0).size === 0, 'unnamed placeholders never deduplicated');
ok(ghostPids(players, null, ME).size === 0, 'no online set = no ghost');

console.log('wiring:');
const pm = readFileSync(new URL('../public/modules/ui/pm.mjs', import.meta.url), 'utf8');
ok(/import \{ onlinePidByName \} from '\.\.\/game\/presence\.mjs'/.test(pm), 'pm.mjs imports onlinePidByName');
ok(/return onlinePidByName\(S\.players \|\| \{\}, S\._lobbyPids, S\.myId, name\)/.test(pm), 'playerIdByName delegates to it');
const main = readFileSync(new URL('../public/pokerth.js', import.meta.url), 'utf8');
ok(main.indexOf('window._pthGhostPids()') !== -1, 'players panel filters ghosts');
const live = readFileSync(new URL('../public/modules/live/lobby.mjs', import.meta.url), 'utf8');
ok(live.indexOf('ghostPids(players, online, S.myId)') !== -1, 'live list filters ghosts');
const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
ok(sw.indexOf("'/modules/game/presence.mjs'") !== -1, 'presence.mjs precached');

if (bad) { console.log('\n' + bad + ' FAIL'); process.exit(1); }
console.log('\nall ok');
