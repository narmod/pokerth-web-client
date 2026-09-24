#!/usr/bin/env node
// Deterministic guards for the lobby server clock (modules/ui/lobby-clock.mjs).
// Run: node scripts/test-lobby-clock.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lcCity, lcOffsetMin, lcFmtOffset, lcSkew } from '../public/modules/ui/lobby-clock.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const html = readFileSync(join(root, 'public', 'pokerth-client.html'), 'utf8');
const sw = readFileSync(join(root, 'public', 'sw.js'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  \u2717', msg); } else console.log('  \u2713', msg); }

// Pure helpers
ok(lcCity('Europe/Berlin') === 'Berlin' && lcCity('America/New_York') === 'New York' && lcCity('UTC') === 'UTC', 'city names come from the zone id');
const summer = Date.UTC(2026, 6, 1, 12, 0), winter = Date.UTC(2026, 0, 15, 12, 0);
ok(lcOffsetMin('Europe/Berlin', summer) === 120 && lcOffsetMin('Europe/Berlin', winter) === 60, 'Berlin follows daylight saving (UTC+2 / UTC+1)');
ok(lcOffsetMin('Asia/Kolkata', summer) === 330 && lcOffsetMin('UTC', summer) === 0, 'half-hour and zero offsets');
ok(lcOffsetMin('America/Los_Angeles', summer) === -420, 'negative offsets');
ok(lcFmtOffset(120) === '+2' && lcFmtOffset(-330) === '\u22125:30' && lcFmtOffset(0) === '0', 'offset formatting');
ok(lcSkew(10500, 1000, 2000) === 9000, 'skew is taken against the middle of the round trip');

// Server side: nothing hard-coded, admin > SERVER_TZ > host zone
ok(/reqPathOnly === '\/__time'/.test(proxy), 'the proxy serves /__time');
ok(/now: Date\.now\(\), tz: _lobbyClockTz\(\)/.test(proxy), 'with the server instant and the lobby zone');
ok(/_adminConfig\.lobbyClockTz[\s\S]{0,120}process\.env\.SERVER_TZ[\s\S]{0,120}_serverTz\(\)/.test(proxy), 'zone order: admin, then SERVER_TZ, then the host');
ok(/if \(lz && !_validTz\(lz\)\) return adminJson\(res, 400/.test(proxy), 'an unknown zone is refused by the admin API');
ok(/'lobbyClockTz',/.test(proxy), 'the setting survives an export -> import round-trip');
ok(/key: 'lobby_clock'/.test(proxy), 'the admin can kill-switch it');

// Client wiring
ok(/id="lsb-clock"[^>]*hidden/.test(html), 'the chip starts hidden until a sync succeeded');
ok(/src="modules\/ui\/lobby-clock\.mjs"/.test(html), 'the module is loaded');
ok(/id="adv-lobbyclock"/.test(html), 'players can turn it off in the advanced options');
ok(/__ver\|__time\|/.test(sw), 'the service worker never caches /__time');
ok(/'\/modules\/ui\/lobby-clock\.mjs'/.test(sw), 'the module is precached');

console.log('\n' + (n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
