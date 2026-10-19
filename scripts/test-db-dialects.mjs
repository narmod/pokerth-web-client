#!/usr/bin/env node
// Database mirror dialects (web.192): MySQL / MariaDB and PostgreSQL.
//  · the MySQL statements are byte for byte those of web.191 (frozen below),
//    so an existing MySQL / MariaDB mirror sees no change at all;
//  · the PostgreSQL ones use ON CONFLICT and $n placeholders;
//  · with PTH_TEST_PG=1 and the standard PG* variables, the PostgreSQL side
//    runs for real against a scratch database (schema twice, upserts twice).
// Run: node scripts/test-db-dialects.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DB = require('../server/db-dialects.js');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  \u2717', m); } else console.log('  \u2713', m); }
const REF = {
  "traffic_daily": "INSERT INTO traffic_daily (day, visits, unique_visitors, new_visitors, returning_visitors, conn_pokerthnet, conn_lan, conn_offline, conn_live, live_visits, live_unique_visitors) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE visits=VALUES(visits), unique_visitors=VALUES(unique_visitors), new_visitors=VALUES(new_visitors), returning_visitors=VALUES(returning_visitors), conn_pokerthnet=VALUES(conn_pokerthnet), conn_lan=VALUES(conn_lan), conn_offline=VALUES(conn_offline), conn_live=VALUES(conn_live), live_visits=VALUES(live_visits), live_unique_visitors=VALUES(live_unique_visitors)",
  "leaderboard": "INSERT INTO leaderboard (player, hands_played, hands_won, games_played, games_won, best_streak, net, big_win, big_loss, avatar, ts) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE hands_played=VALUES(hands_played), hands_won=VALUES(hands_won), games_played=VALUES(games_played), games_won=VALUES(games_won), best_streak=VALUES(best_streak), net=VALUES(net), big_win=VALUES(big_win), big_loss=VALUES(big_loss), avatar=VALUES(avatar), ts=VALUES(ts)",
  "broadcasts": "INSERT INTO broadcasts (id, message, icon, schedule_json, enabled, start_at, end_at, countdown_at, max_runs, created_at, last_run, run_count, target) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE message=VALUES(message), icon=VALUES(icon), schedule_json=VALUES(schedule_json), enabled=VALUES(enabled), start_at=VALUES(start_at), end_at=VALUES(end_at), countdown_at=VALUES(countdown_at), max_runs=VALUES(max_runs), created_at=VALUES(created_at), last_run=VALUES(last_run), run_count=VALUES(run_count), target=VALUES(target)",
  "schema": [
    "CREATE TABLE IF NOT EXISTS traffic_daily (day DATE PRIMARY KEY, visits INT NOT NULL DEFAULT 0, unique_visitors INT NOT NULL DEFAULT 0, new_visitors INT NOT NULL DEFAULT 0, returning_visitors INT NOT NULL DEFAULT 0, conn_pokerthnet INT NOT NULL DEFAULT 0, conn_lan INT NOT NULL DEFAULT 0, conn_offline INT NOT NULL DEFAULT 0, conn_live INT NOT NULL DEFAULT 0, live_visits INT NOT NULL DEFAULT 0, live_unique_visitors INT NOT NULL DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS leaderboard (player VARCHAR(190) PRIMARY KEY, hands_played INT NOT NULL DEFAULT 0, hands_won INT NOT NULL DEFAULT 0, games_played INT NOT NULL DEFAULT 0, games_won INT NOT NULL DEFAULT 0, best_streak INT NOT NULL DEFAULT 0, net BIGINT NOT NULL DEFAULT 0, big_win BIGINT NOT NULL DEFAULT 0, big_loss BIGINT NOT NULL DEFAULT 0, avatar VARCHAR(16) DEFAULT NULL, ts BIGINT NOT NULL DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS broadcasts (id VARCHAR(64) PRIMARY KEY, message TEXT, icon VARCHAR(32) DEFAULT NULL, schedule_json TEXT, enabled TINYINT(1) NOT NULL DEFAULT 0, start_at BIGINT DEFAULT NULL, end_at BIGINT DEFAULT NULL, countdown_at BIGINT DEFAULT NULL, max_runs INT DEFAULT NULL, created_at BIGINT DEFAULT NULL, last_run BIGINT DEFAULT NULL, run_count INT NOT NULL DEFAULT 0, target VARCHAR(48) NOT NULL DEFAULT 'all', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  ],
  "migrations": [
    "ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS target VARCHAR(16) NOT NULL DEFAULT 'all'",
    "ALTER TABLE broadcasts MODIFY COLUMN target VARCHAR(48) NOT NULL DEFAULT 'all'",
    "ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS start_at BIGINT DEFAULT NULL",
    "ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS countdown_at BIGINT DEFAULT NULL",
    "ALTER TABLE traffic_daily ADD COLUMN IF NOT EXISTS conn_live INT NOT NULL DEFAULT 0",
    "ALTER TABLE traffic_daily ADD COLUMN IF NOT EXISTS live_visits INT NOT NULL DEFAULT 0",
    "ALTER TABLE traffic_daily ADD COLUMN IF NOT EXISTS live_unique_visitors INT NOT NULL DEFAULT 0"
  ]
};
const COLS = {
  traffic_daily: ['day', 'visits', 'unique_visitors', 'new_visitors', 'returning_visitors', 'conn_pokerthnet', 'conn_lan', 'conn_offline', 'conn_live', 'live_visits', 'live_unique_visitors'],
  leaderboard: ['player', 'hands_played', 'hands_won', 'games_played', 'games_won', 'best_streak', 'net', 'big_win', 'big_loss', 'avatar', 'ts'],
  broadcasts: ['id', 'message', 'icon', 'schedule_json', 'enabled', 'start_at', 'end_at', 'countdown_at', 'max_runs', 'created_at', 'last_run', 'run_count', 'target']
};
for (const t of Object.keys(COLS)) ok(DB.upsert('mysql', t, COLS[t], COLS[t][0]) === REF[t], 'MySQL upsert of ' + t + ' unchanged');
ok(JSON.stringify(DB.schema('mysql')) === JSON.stringify(REF.schema), 'MySQL tables unchanged');
ok(JSON.stringify(DB.migrations('mysql')) === JSON.stringify(REF.migrations), 'MySQL migrations unchanged');
ok(DB.normType('postgresql') === 'postgres' && DB.normType('PG') === 'postgres' && DB.normType('') === 'mysql' && DB.normType('mariadb') === 'mysql', 'type names');
ok(DB.defaultPort('postgres') === 5432 && DB.defaultPort('mysql') === 3306, 'default ports');
ok(DB.toPg('a=? AND b IN (?,?)') === 'a=$1 AND b IN ($2,$3)', '? becomes $1, $2… for PostgreSQL');
const pu = DB.upsert('postgres', 'leaderboard', COLS.leaderboard, 'player');
ok(/ON CONFLICT \(player\) DO UPDATE SET hands_played=EXCLUDED\.hands_played, .*ts=EXCLUDED\.ts, updated_at=now\(\)$/.test(pu), 'PostgreSQL upsert');
ok(DB.schema('postgres').every((q) => !/ENGINE|TINYINT|ON UPDATE|utf8mb4/.test(q)) && DB.schema('postgres').length === 3, 'PostgreSQL tables use no MySQL-only syntax');
ok(DB.schema('postgres').concat(DB.migrations('mysql')).every((q) => !/'[^']*\?[^']*'/.test(q)), 'no ? inside a literal (the $n rewrite stays safe)');

if (process.env.PTH_TEST_PG === '1') {
  const cfg = { host: process.env.PGHOST || '127.0.0.1', port: Number(process.env.PGPORT) || 5432, user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || '', database: process.env.PGDATABASE || 'postgres' };
  ok(await DB.testConnection('postgres', cfg), 'live: test connection');
  const db = DB.connect('postgres', cfg);
  try {
    for (const q of ['DROP TABLE IF EXISTS traffic_daily', 'DROP TABLE IF EXISTS leaderboard', 'DROP TABLE IF EXISTS broadcasts']) await db.query(q);
    for (let i = 0; i < 2; i++) for (const q of DB.schema('postgres')) await db.query(q);
    ok(true, 'live: tables created, twice without error');
    const up = (t, v) => db.query(DB.upsert('postgres', t, COLS[t], COLS[t][0]), v);
    await up('traffic_daily', ['2026-10-19', 5, 4, 2, 2, 3, 1, 1, 0, 0, 0]);
    await up('traffic_daily', ['2026-10-19', 9, 6, 3, 3, 4, 2, 1, 1, 2, 1]);
    await up('leaderboard', ['Arnaud', 10, 4, 2, 1, 3, 1500, 800, -200, null, 1760000000000]);
    await up('broadcasts', ['b1', 'Hello', null, '{"every":"day"}', 1, null, null, null, null, 1760000000000, null, 0, 'all']);
    const td = (await db.query('SELECT visits, conn_live FROM traffic_daily WHERE day=?', ['2026-10-19'])).rows;
    ok(td.length === 1 && td[0].visits === 9 && td[0].conn_live === 1, 'live: a second write updates the day row');
    const lb = (await db.query('SELECT net FROM leaderboard WHERE player=?', ['Arnaud'])).rows;
    ok(lb.length === 1 && Number(lb[0].net) === 1500, 'live: leaderboard row (BIGINT)');
    await db.query('DELETE FROM broadcasts WHERE id NOT IN (?,?)', ['b9', 'b8']);
    ok((await db.query('SELECT count(*)::int AS c FROM broadcasts')).rows[0].c === 0, 'live: delete with a list of ids');
  } finally { await db.end(); }
} else console.log('  · live PostgreSQL part skipped (set PTH_TEST_PG=1 and PG* to run it)');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
