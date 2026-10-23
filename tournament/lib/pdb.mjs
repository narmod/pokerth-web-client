// ═══════════════════════════════════════════════════════════════════
// Tournament director — read a PokerTH game log (.pdb, SQLite).
//
// The official clients and the web client write the same schema (Session,
// Game, Player, Hand, Action — public/modules/handlog.mjs). One log may hold
// several games: the organizer picks one, so the « game_id=1 » trap of the
// log-analysis link never applies.
//
// Ranking rule = the BBC site's (LogFileController::get_player_list, MIT,
// pokerth/bbc): « wins game » first, then the last hand a player was dealt
// in (max HandID where Seat_N_Cash is set) descending, then his cash at the
// start of that hand descending; same hand and same cash = same place.
//
// The file comes from a player: it is parsed in memory by sql.js (WASM),
// read-only, size-capped by the caller. A log can be edited, so a result
// taken from one is marked as such and never weighs more than a director's.
// ═══════════════════════════════════════════════════════════════════

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const VENDOR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'vendor');
let sqlPromise = null;
function sql() {
  if (!sqlPromise) {
    const init = require(join(VENDOR, 'sql-wasm.js'));
    sqlPromise = init({ wasmBinary: readFileSync(join(VENDOR, 'sql-wasm.wasm')) });
  }
  return sqlPromise;
}

const SQLITE_MAGIC = 'SQLite format 3\u0000';

export function isPdb(buf) {
  return !!buf && buf.length > 100 && Buffer.from(buf.subarray(0, 16)).toString('latin1') === SQLITE_MAGIC;
}

function rows(db, q, params) {
  const st = db.prepare(q);
  try {
    if (params) st.bind(params);
    const out = [];
    while (st.step()) out.push(st.getAsObject());
    return out;
  } finally { st.free(); }
}

function open(SQL, buf) {
  const db = new SQL.Database(new Uint8Array(buf));
  const tables = new Set(rows(db, "SELECT name FROM sqlite_master WHERE type='table'").map((r) => String(r.name).toLowerCase()));
  for (const t of ['game', 'player', 'hand', 'action']) if (!tables.has(t)) { db.close(); throw new Error('not a PokerTH log (no ' + t + ' table)'); }
  return db;
}

/** Games found in a log: what the organizer picks from. */
export async function listPdbGames(buf) {
  if (!isPdb(buf)) throw new Error('not a .pdb file');
  const SQL = await sql();
  const db = open(SQL, buf);
  try {
    let session = null;
    try { const s = rows(db, 'SELECT Date, Time, PokerTH_Version FROM Session LIMIT 1')[0]; if (s) session = { date: String(s.Date), time: String(s.Time), version: String(s.PokerTH_Version) }; } catch (e) {}
    const games = rows(db, 'SELECT UniqueGameID, GameID, Startmoney FROM Game ORDER BY UniqueGameID');
    return {
      session,
      games: games.map((g) => {
        const u = Number(g.UniqueGameID);
        const players = rows(db, 'SELECT Seat, Player FROM Player WHERE UniqueGameID = ? ORDER BY Seat', [u]).map((p) => String(p.Player));
        const hands = Number((rows(db, 'SELECT COUNT(*) AS n FROM Hand WHERE UniqueGameID = ?', [u])[0] || {}).n || 0);
        const won = rows(db, "SELECT 1 FROM Action WHERE UniqueGameID = ? AND Action = 'wins game' LIMIT 1", [u]).length > 0;
        return { uniqueGameId: u, gameId: Number(g.GameID), startMoney: Number(g.Startmoney), players, hands, finished: won };
      }),
    };
  } finally { db.close(); }
}

/** Ranking of one game of the log, BBC rule. */
export async function rankPdbGame(buf, uniqueGameId) {
  if (!isPdb(buf)) throw new Error('not a .pdb file');
  const u = Number(uniqueGameId);
  const SQL = await sql();
  const db = open(SQL, buf);
  try {
    const seats = rows(db, 'SELECT Seat, Player FROM Player WHERE UniqueGameID = ? ORDER BY Seat', [u]);
    if (!seats.length) throw new Error('no such game in this log');
    const winner = rows(db, "SELECT Player AS Seat, HandID FROM Action WHERE UniqueGameID = ? AND Action = 'wins game' LIMIT 1", [u])[0];
    const list = seats.map((p) => {
      const seat = Number(p.Seat);
      if (!(seat >= 1 && seat <= 10)) return null;
      const col = 'Seat_' + seat + '_Cash';
      const last = rows(db, 'SELECT HandID, ' + col + ' AS Cash FROM Hand WHERE UniqueGameID = ? AND ' + col + ' IS NOT NULL ORDER BY HandID DESC LIMIT 1', [u])[0];
      return {
        seat, nick: String(p.Player),
        lastHand: last ? Number(last.HandID) : 0,
        cashAtHandStart: last ? Number(last.Cash) : 0,
        winner: !!winner && Number(winner.Seat) === seat,
      };
    }).filter(Boolean);
    list.sort((a, b) => (Number(b.winner) - Number(a.winner)) || (b.lastHand - a.lastHand) || (b.cashAtHandStart - a.cashAtHandStart) || (a.seat - b.seat));
    // Same hand and same cash: same place, as the BBC site counts it.
    const ranking = [];
    for (let i = 0; i < list.length; i++) {
      const r = list[i], prev = ranking[i - 1];
      const tied = prev && !r.winner && !prev.winner && prev.elimHand === r.lastHand && prev.stack === r.cashAtHandStart;
      ranking.push({ place: tied ? prev.place : i + 1, nick: r.nick, elimHand: r.winner ? null : r.lastHand, stack: r.winner ? null : r.cashAtHandStart, winner: r.winner, tie: !!tied });
      if (tied) prev.tie = true;
    }
    const hands = Number((rows(db, 'SELECT MAX(HandID) AS n FROM Hand WHERE UniqueGameID = ?', [u])[0] || {}).n || 0);
    return { uniqueGameId: u, finished: !!winner, hands, ranking };
  } finally { db.close(); }
}
