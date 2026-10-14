#!/usr/bin/env node
// Per-server LAN leaderboards (server/lan-boards.js): only approved directory
// entries have a board, each one resets on its own period, a period changed by
// the admin restarts the count without wiping, a removed server loses its
// board, and the board file survives a restart.
// Run: node scripts/test-lan-boards.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createLanBoards } = require('../server/lan-boards.js');

let fails = 0, checks = 0;
function ok(cond, label) { checks++; console.log((cond ? '  ✓ ' : '  ✗ ') + label); if (!cond) fails++; }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lan-boards-'));
const file = path.join(tmp, 'lan-boards.json');
let T = new Date(2026, 9, 14, 12, 0, 0).getTime();          // 14 Oct 2026, local time
const entries = [
  { id: 'lan_aaaaaa01', name: 'Club', host: 'club.example.org', port: 7234, resetPeriod: 'monthly', visible: true },
  { id: 'lan_aaaaaa02', name: 'Never', host: 'never.example.org', port: 7234, resetPeriod: 'off', visible: false }
];
const periodKey = (p, d) => p === 'monthly' ? d.getFullYear() + '-' + (d.getMonth() + 1) : p === 'daily' ? d.toDateString() : p === 'weekly' ? 'w' + Math.floor(d.getTime() / 6048e5) : p === 'yearly' ? String(d.getFullYear()) : null;
const sanitize = (d) => ({ handsPlayed: Math.max(0, d.handsPlayed | 0), net: d.net | 0 });
const merge = (a, b) => (!a ? b : { handsPlayed: Math.max(a.handsPlayed, b.handsPlayed), net: b.net });
const mk = () => createLanBoards({ file, sanitize, merge, periodKey, entries: () => entries, now: () => T });
let B = mk();

ok(!B.exists('lan_ffffff99') && !B.exists('../etc') && B.exists('lan_aaaaaa01'), 'only approved directory entries have a board');
ok(B.upsert('lan_ffffff99', 'bob', { handsPlayed: 3 }) === false && JSON.stringify(B.get('lan_ffffff99')) === '{}', 'an unknown board is never created');
ok(B.upsert('lan_aaaaaa01', 'bob', { handsPlayed: 10, net: 50 }), 'a player is recorded on a listed server');
B.upsert('lan_aaaaaa01', 'bob', { handsPlayed: 4, net: 70 });
ok(B.get('lan_aaaaaa01').bob.handsPlayed === 10 && B.get('lan_aaaaaa01').bob.net === 70, 'snapshots go through the proxy merge (counters never regress)');
ok(JSON.stringify(B.get('lan_aaaaaa02')) === '{}', 'boards are separate');
B.upsert('lan_aaaaaa02', 'ann', { handsPlayed: 2 });

B.rotate();
ok(B.get('lan_aaaaaa01').bob, 'same month: nothing wiped');
T = new Date(2026, 10, 2, 12, 0, 0).getTime();               // November
B.rotate();
ok(!B.get('lan_aaaaaa01').bob, 'next month: the monthly board is wiped');
ok(B.get('lan_aaaaaa02').ann, 'a board set to « never » is kept');

B.upsert('lan_aaaaaa01', 'carl', { handsPlayed: 1 });
entries[0].resetPeriod = 'weekly';
B.rotate();
ok(B.get('lan_aaaaaa01').carl, 'the admin changes the period: the count restarts, nothing is wiped');
T += 8 * 864e5;
B.rotate();
ok(!B.get('lan_aaaaaa01').carl, 'and the new period applies from then on');

B.upsert('lan_aaaaaa01', 'dan', { handsPlayed: 5 });
ok(B.remove('lan_aaaaaa01', 'dan') && !B.get('lan_aaaaaa01').dan, 'the admin removes a player from one board');
B.upsert('lan_aaaaaa01', 'eve', { handsPlayed: 5 });
ok(B.reset('lan_aaaaaa01') && JSON.stringify(B.get('lan_aaaaaa01')) === '{}', 'the admin resets one board');
B.upsert('lan_aaaaaa01', 'fay', { handsPlayed: 5 });

const sum = B.summary();
ok(sum.length === 2 && sum[0].players === 1 && sum[1].players === 1 && sum[1].visible === false && sum[0].resetPeriod === 'weekly', 'admin summary: one row per server with its players and period');

await new Promise((r) => setTimeout(r, 1000));               // debounced write
B = mk();
ok(B.get('lan_aaaaaa01').fay && B.get('lan_aaaaaa02').ann, 'boards survive a restart');
B.drop('lan_aaaaaa02');
ok(JSON.stringify(B.get('lan_aaaaaa02')) === '{}' && !('lan_aaaaaa02' in JSON.parse(fs.readFileSync(file, 'utf8'))), 'a removed server loses its board');
entries.splice(0, 1);
B.rotate();
ok(!('lan_aaaaaa01' in B._data()), 'boards of servers gone while the proxy was down are cleaned up');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('\n' + (fails ? fails + ' FAILED' : 'All ' + checks + ' checks passed'));
process.exit(fails ? 1 : 0);
