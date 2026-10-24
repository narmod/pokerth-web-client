// Builds PokerTH game logs (.pdb, the clients' SQLite schema — see
// public/modules/handlog.mjs) for the tournament director tests.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SQL_VENDOR_DIR as VENDOR } from '../../lib/platform.mjs';

const require = createRequire(import.meta.url);

// games: [{ uniqueGameId, gameId, startMoney, seats: [nick…], hands: [{ cash: {seat: cash}, actions: [[seat, 'action']] }] }]
export async function buildPdb(games) {
  const SQL = await require(join(VENDOR, 'sql-wasm.js'))({ wasmBinary: readFileSync(join(VENDOR, 'sql-wasm.wasm')) });
  const db = new SQL.Database();
  db.run('CREATE TABLE Session (PokerTH_Version TEXT NOT NULL, Date TEXT NOT NULL, Time TEXT NOT NULL, LogVersion INTEGER NOT NULL, PRIMARY KEY(Date,Time));');
  db.run('CREATE TABLE Game (UniqueGameID INTEGER PRIMARY KEY, GameID INTEGER NOT NULL, Startmoney INTEGER NOT NULL, StartSb INTEGER NOT NULL, DealerPos INTEGER NOT NULL, Winner_Seat INTEGER);');
  db.run('CREATE TABLE Player (UniqueGameID INTEGER NOT NULL, Seat INTEGER NOT NULL, Player TEXT NOT NULL, PRIMARY KEY(UniqueGameID,Seat));');
  const cols = ['HandID INTEGER NOT NULL', 'UniqueGameID INTEGER NOT NULL', 'Dealer_Seat INTEGER', 'Sb_Amount INTEGER', 'Sb_Seat INTEGER', 'Bb_Amount INTEGER', 'Bb_Seat INTEGER'];
  for (let i = 1; i <= 10; i++) cols.push('Seat_' + i + '_Cash INTEGER', 'Seat_' + i + '_Card_1 INTEGER', 'Seat_' + i + '_Card_2 INTEGER', 'Seat_' + i + '_Hand_text TEXT', 'Seat_' + i + '_Hand_int INTEGER');
  for (let i = 1; i <= 5; i++) cols.push('BoardCard_' + i + ' INTEGER');
  db.run('CREATE TABLE Hand (' + cols.join(', ') + ', PRIMARY KEY(HandID,UniqueGameID));');
  db.run('CREATE TABLE Action (ActionID INTEGER PRIMARY KEY AUTOINCREMENT, HandID INTEGER NOT NULL, UniqueGameID INTEGER NOT NULL, BeRo INTEGER NOT NULL, Player INTEGER NOT NULL, Action TEXT NOT NULL, Amount INTEGER);');
  db.run("INSERT INTO Session VALUES ('2.1.10', '2026-10-23', '20:00:00', 1)");
  for (const g of games) {
    db.run('INSERT INTO Game VALUES (?, ?, ?, 10, 1, NULL)', [g.uniqueGameId, g.gameId, g.startMoney]);
    g.seats.forEach((nick, i) => db.run('INSERT INTO Player VALUES (?, ?, ?)', [g.uniqueGameId, i + 1, nick]));
    g.hands.forEach((h, hi) => {
      const names = ['HandID', 'UniqueGameID'], vals = [hi + 1, g.uniqueGameId];
      for (const [seat, cash] of Object.entries(h.cash)) { names.push('Seat_' + seat + '_Cash'); vals.push(cash); }
      db.run('INSERT INTO Hand (' + names.join(',') + ') VALUES (' + names.map(() => '?').join(',') + ')', vals);
      for (const [seat, action] of h.actions || []) db.run('INSERT INTO Action (HandID, UniqueGameID, BeRo, Player, Action, Amount) VALUES (?, ?, 4, ?, ?, 0)', [hi + 1, g.uniqueGameId, seat, action]);
    });
  }
  const bytes = Buffer.from(db.export());
  db.close();
  return bytes;
}

// The usual scenario: Alice, Bob, Carol, Dave; Dave out in hand 1, Bob (600)
// and Carol (400) out together in hand 2, Alice wins. Plus a training game first.
export function sampleGames() {
  return [
    { uniqueGameId: 1, gameId: 1, startMoney: 5000, seats: ['Me', 'Bot 1'], hands: [{ cash: { 1: 5000, 2: 5000 }, actions: [[1, 'wins game']] }] },
    { uniqueGameId: 2, gameId: 7, startMoney: 1000, seats: ['Alice', 'Bob', 'Carol', 'Dave'], hands: [
      { cash: { 1: 1000, 2: 1000, 3: 1000, 4: 1000 }, actions: [[4, 'sits out']] },
      { cash: { 1: 2000, 2: 600, 3: 400 }, actions: [[2, 'sits out'], [3, 'sits out'], [1, 'wins game']] },
    ] },
  ];
}
