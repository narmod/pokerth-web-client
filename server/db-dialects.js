'use strict';
// SQL dialects of the optional database mirror (web.192).
//
// The mirror copies three tables — traffic_daily, leaderboard, broadcasts —
// out of the JSON files, which stay the source of truth. Between MySQL /
// MariaDB and PostgreSQL only the driver, the column types and the upsert
// differ, so they live here and proxy.js keeps one code path.
//
// Every statement is written with ? placeholders; the PostgreSQL client turns
// them into $1, $2… before sending (no ? ever appears inside a literal here).
// The MySQL statements are byte for byte those of the inline code they
// replace (scripts/test-db-dialects.mjs checks it).

const TYPES = ['mysql', 'postgres'];

function normType(t) {
  const s = String(t || '').toLowerCase();
  return (s === 'postgres' || s === 'postgresql' || s === 'pg') ? 'postgres' : 'mysql';
}
function defaultPort(t) { return normType(t) === 'postgres' ? 5432 : 3306; }
function label(t) { return normType(t) === 'postgres' ? 'PostgreSQL' : 'MySQL / MariaDB'; }
function driverName(t) { return normType(t) === 'postgres' ? 'pg' : 'mysql2'; }

const MYSQL_SCHEMA = [
  'CREATE TABLE IF NOT EXISTS traffic_daily (' +
    'day DATE PRIMARY KEY, visits INT NOT NULL DEFAULT 0, unique_visitors INT NOT NULL DEFAULT 0, ' +
    'new_visitors INT NOT NULL DEFAULT 0, returning_visitors INT NOT NULL DEFAULT 0, ' +
    'conn_pokerthnet INT NOT NULL DEFAULT 0, conn_lan INT NOT NULL DEFAULT 0, conn_offline INT NOT NULL DEFAULT 0, conn_live INT NOT NULL DEFAULT 0, live_visits INT NOT NULL DEFAULT 0, live_unique_visitors INT NOT NULL DEFAULT 0, ' +
    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
  'CREATE TABLE IF NOT EXISTS leaderboard (' +
    'player VARCHAR(190) PRIMARY KEY, hands_played INT NOT NULL DEFAULT 0, hands_won INT NOT NULL DEFAULT 0, ' +
    'games_played INT NOT NULL DEFAULT 0, games_won INT NOT NULL DEFAULT 0, best_streak INT NOT NULL DEFAULT 0, ' +
    'net BIGINT NOT NULL DEFAULT 0, big_win BIGINT NOT NULL DEFAULT 0, big_loss BIGINT NOT NULL DEFAULT 0, ' +
    'avatar VARCHAR(16) DEFAULT NULL, ts BIGINT NOT NULL DEFAULT 0, ' +
    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
  'CREATE TABLE IF NOT EXISTS broadcasts (' +
    'id VARCHAR(64) PRIMARY KEY, message TEXT, icon VARCHAR(32) DEFAULT NULL, schedule_json TEXT, ' +
    'enabled TINYINT(1) NOT NULL DEFAULT 0, start_at BIGINT DEFAULT NULL, end_at BIGINT DEFAULT NULL, countdown_at BIGINT DEFAULT NULL, max_runs INT DEFAULT NULL, ' +
    'created_at BIGINT DEFAULT NULL, last_run BIGINT DEFAULT NULL, run_count INT NOT NULL DEFAULT 0, ' +
    "target VARCHAR(48) NOT NULL DEFAULT 'all', " +
    'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
];
// Gentle migrations of tables created by older versions (MariaDB; a server
// without IF NOT EXISTS errors on a duplicate column, which is ignored).
const MYSQL_MIGRATIONS = [
  "ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS target VARCHAR(16) NOT NULL DEFAULT 'all'",
  "ALTER TABLE broadcasts MODIFY COLUMN target VARCHAR(48) NOT NULL DEFAULT 'all'",   // 'lan:<id>' targets
  'ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS start_at BIGINT DEFAULT NULL',
  'ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS countdown_at BIGINT DEFAULT NULL',
  'ALTER TABLE traffic_daily ADD COLUMN IF NOT EXISTS conn_live INT NOT NULL DEFAULT 0',
  'ALTER TABLE traffic_daily ADD COLUMN IF NOT EXISTS live_visits INT NOT NULL DEFAULT 0',
  'ALTER TABLE traffic_daily ADD COLUMN IF NOT EXISTS live_unique_visitors INT NOT NULL DEFAULT 0'
];

// PostgreSQL has no ON UPDATE for a column: the upsert sets updated_at.
const PG_SCHEMA = [
  'CREATE TABLE IF NOT EXISTS traffic_daily (' +
    'day DATE PRIMARY KEY, visits INT NOT NULL DEFAULT 0, unique_visitors INT NOT NULL DEFAULT 0, ' +
    'new_visitors INT NOT NULL DEFAULT 0, returning_visitors INT NOT NULL DEFAULT 0, ' +
    'conn_pokerthnet INT NOT NULL DEFAULT 0, conn_lan INT NOT NULL DEFAULT 0, conn_offline INT NOT NULL DEFAULT 0, conn_live INT NOT NULL DEFAULT 0, live_visits INT NOT NULL DEFAULT 0, live_unique_visitors INT NOT NULL DEFAULT 0, ' +
    'updated_at TIMESTAMPTZ NOT NULL DEFAULT now())',
  'CREATE TABLE IF NOT EXISTS leaderboard (' +
    'player VARCHAR(190) PRIMARY KEY, hands_played INT NOT NULL DEFAULT 0, hands_won INT NOT NULL DEFAULT 0, ' +
    'games_played INT NOT NULL DEFAULT 0, games_won INT NOT NULL DEFAULT 0, best_streak INT NOT NULL DEFAULT 0, ' +
    'net BIGINT NOT NULL DEFAULT 0, big_win BIGINT NOT NULL DEFAULT 0, big_loss BIGINT NOT NULL DEFAULT 0, ' +
    'avatar VARCHAR(16) DEFAULT NULL, ts BIGINT NOT NULL DEFAULT 0, ' +
    'updated_at TIMESTAMPTZ NOT NULL DEFAULT now())',
  'CREATE TABLE IF NOT EXISTS broadcasts (' +
    'id VARCHAR(64) PRIMARY KEY, message TEXT, icon VARCHAR(32) DEFAULT NULL, schedule_json TEXT, ' +
    'enabled SMALLINT NOT NULL DEFAULT 0, start_at BIGINT DEFAULT NULL, end_at BIGINT DEFAULT NULL, countdown_at BIGINT DEFAULT NULL, max_runs INT DEFAULT NULL, ' +
    'created_at BIGINT DEFAULT NULL, last_run BIGINT DEFAULT NULL, run_count INT NOT NULL DEFAULT 0, ' +
    "target VARCHAR(48) NOT NULL DEFAULT 'all', " +
    'updated_at TIMESTAMPTZ NOT NULL DEFAULT now())'
];
const PG_MIGRATIONS = [];

function schema(t) { return normType(t) === 'postgres' ? PG_SCHEMA.slice() : MYSQL_SCHEMA.slice(); }
function migrations(t) { return normType(t) === 'postgres' ? PG_MIGRATIONS.slice() : MYSQL_MIGRATIONS.slice(); }

// INSERT … or update the row of the same key.
function upsert(t, table, cols, key) {
  const head = 'INSERT INTO ' + table + ' (' + cols.join(', ') + ') VALUES (' + cols.map(function () { return '?'; }).join(',') + ') ';
  const rest = cols.filter(function (c) { return c !== key; });
  if (normType(t) === 'postgres') {
    return head + 'ON CONFLICT (' + key + ') DO UPDATE SET ' + rest.map(function (c) { return c + '=EXCLUDED.' + c; }).join(', ') + ', updated_at=now()';
  }
  return head + 'ON DUPLICATE KEY UPDATE ' + rest.map(function (c) { return c + '=VALUES(' + c + ')'; }).join(', ');
}

// ? → $1, $2… for PostgreSQL.
function toPg(sql) { let n = 0; return String(sql).replace(/\?/g, function () { n += 1; return '$' + n; }); }

function loadDriver(t) {
  try { return require(normType(t) === 'postgres' ? 'pg' : 'mysql2/promise'); }
  catch (e) { const err = new Error(driverName(t) + ' not installed — run npm install'); err.code = 'NO_DRIVER'; throw err; }
}

// A pool with one shape for both: query(sql, params) and end().
function connect(t, cfg) {
  const kind = normType(t), drv = loadDriver(kind);
  if (kind === 'postgres') {
    const pool = new drv.Pool({ host: cfg.host, port: cfg.port, user: cfg.user || 'postgres', password: cfg.password || '', database: cfg.database, max: 4, connectionTimeoutMillis: 8000 });
    // An idle client that loses its server emits 'error' on the pool; left
    // unhandled it would bring the whole proxy down.
    pool.on('error', function (e) { if (cfg.onError) cfg.onError(e); });
    return { kind: kind, query: function (sql, params) { return pool.query(toPg(sql), params || []); }, end: function () { return pool.end(); } };
  }
  const pool = drv.createPool({
    host: cfg.host, port: cfg.port, user: cfg.user || 'root', password: cfg.password || '', database: cfg.database,
    waitForConnections: true, connectionLimit: 4, connectTimeout: 8000, charset: 'utf8mb4'
  });
  return { kind: kind, query: function (sql, params) { return pool.query(sql, params); }, end: function () { return pool.end(); } };
}

// One connection, SELECT 1, closed — for the admin's « Test connection ».
async function testConnection(t, cfg) {
  const kind = normType(t), drv = loadDriver(kind);
  if (kind === 'postgres') {
    const c = new drv.Client({ host: cfg.host, port: cfg.port, user: cfg.user || 'postgres', password: cfg.password || '', database: cfg.database, connectionTimeoutMillis: 8000 });
    try { await c.connect(); await c.query('SELECT 1'); } finally { try { await c.end(); } catch (e) {} }
    return true;
  }
  let conn;
  try {
    conn = await drv.createConnection({ host: cfg.host, port: cfg.port, user: cfg.user || 'root', password: cfg.password || '', database: cfg.database, connectTimeout: 8000 });
    await conn.query('SELECT 1');
  } finally { try { if (conn) await conn.end(); } catch (e) {} }
  return true;
}

module.exports = { TYPES, normType, defaultPort, label, driverName, schema, migrations, upsert, toPg, connect, testConnection };
