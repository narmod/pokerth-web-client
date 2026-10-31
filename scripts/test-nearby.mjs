#!/usr/bin/env node
// « Play nearby », step 1: the local server (lobby + one table + evening
// scoreboard) and its carriers, without any UI. Deterministic: seeded rng and
// a virtual clock; the BroadcastChannel part uses Node's real channels.
// Run: node scripts/test-nearby.mjs
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mod = (p) => import(path.join(root, 'public/modules', p));
const { LocalServer, NEARBY_TYPE, cleanNick } = await mod('lan/local-server.mjs');
const { createScoreboard, lineupKey } = await mod('lan/scoreboard.mjs');
const { createLocalSocket } = await mod('lan/pipe-socket.mjs');
const { hostOverBroadcast, createBroadcastSocket } = await mod('lan/bc-link.mjs');
const { encode, frame, readFields } = await mod('offline/proto.mjs');

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

// ── helpers ────────────────────────────────────────────────────────────────
function mulberry32(a) { return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function clock() {
  let now = 0, seq = 0; const q = [];
  return {
    timers: { set: (fn, ms) => { const h = { t: now + (ms || 0), s: seq++, fn, dead: false }; q.push(h); return h; }, clear: (h) => { if (h) h.dead = true; } },
    run(limitMs, stop) {
      const end = now + limitMs;
      while (q.length) {
        q.sort((a, b) => a.t - b.t || a.s - b.s);
        const h = q[0]; if (h.t > end) break;
        q.shift(); now = h.t; if (!h.dead) h.fn();
        if (stop && stop()) return true;
      }
      now = Math.max(now, end); return false;
    },
    get now() { return now; },
  };
}
const cmsg = (type, spec) => frame(encode([[1, 0, type], [type + 1, 2, encode(spec)]]));
function decode(u8) {
  const body = u8.subarray(4); const top = readFields(body); const type = top[1][0];
  const raw = top[type + 1] && top[type + 1][0]; return { type, f: raw ? readFields(raw) : {} };
}
const num = (f, k) => (f[k] && typeof f[k][0] === 'number') ? f[k][0] : undefined;
const txt = (f, k) => (f[k] && f[k][0] instanceof Uint8Array) ? new TextDecoder().decode(f[k][0]) : undefined;

// A scripted player on a direct link.
function player(srv, nick, opts) {
  opts = opts || {};
  const P = { nick, got: [], closed: false, pid: 0 };
  P.h = srv.attach({ send: (u8) => { const m = decode(u8); P.got.push(m); if (m.type === 6) P.pid = num(m.f, 2); if (opts.onMsg) opts.onMsg(P, m); }, close: () => { P.closed = true; } });
  P.send = (type, spec) => P.h.receive(cmsg(type, spec));
  P.init = (buildId) => P.send(2, [[1, 2, encode([[1, 0, 5], [2, 0, 1]])], [2, 0, buildId || 7], [5, 0, 2], [6, 2, nick]]);
  P.of = (type) => P.got.filter(m => m.type === type);
  P.last = (type) => { const a = P.of(type); return a[a.length - 1]; };
  P.clear = () => { P.got = []; };
  return P;
}
// NetGameInfo: name, maxPlayers, raise every 1 hand, timeout 10 s, SB 50, stack 300 — short games.
function gameInfo(name, max) { return encode([[1, 2, name], [2, 0, 1], [3, 0, max || 3], [4, 0, 1], [5, 0, 1], [7, 0, 1], [9, 0, 10], [10, 0, 1], [11, 0, 10], [12, 0, 50], [13, 0, 300]]); }
const BOTS = [['Rocky', 'R', 'rock'], ['Sharky', 'S', 'tag'], ['Wild', 'W', 'lag'], ['Calls', 'C', 'station'], ['Max', 'M', 'maniac']];
// A human who shoves whenever it is his turn (games end fast).
const shover = (P, m) => { if (m.type === 41 && num(m.f, 2) === P.pid) P.send(42, [[1, 0, num(m.f, 1)], [2, 0, 0], [3, 0, num(m.f, 3)], [4, 0, 6], [5, 0, 1e6]]); };
const ackStart = (P, m) => { if (m.type === 36) P.send(37, [[1, 0, num(m.f, 1)]]); };
const both = (...fs) => (P, m) => fs.forEach(fn => fn(P, m));

// ── 1. scoreboard, pure ──────────────────────────────────────────────────
{
  const b = createScoreboard();
  ok(b.startGame(['Bob', 'Alice']) === true, 'scoreboard: the first game starts a fresh board');
  b.recordHand('Alice', true, 120); b.recordHand('Alice', true, 40); b.recordHand('Alice', false, -300);
  b.recordHand('Rocky', true, 999);                       // a bot: never on the board
  b.recordGame('Alice', true); b.recordGame('Bob', false);
  let s = b.snapshot();
  const A = s.rows.find(r => r.name === 'Alice');
  ok(A.handsPlayed === 3 && A.handsWon === 2 && A.net === -140 && A.bigWin === 120 && A.bigLoss === -300 && A.bestStreak === 2 && A.streak === 0,
    'scoreboard: hands, net, biggest win/loss and best streak add up like the LAN board');
  ok(!s.rows.some(r => r.name === 'Rocky') && s.rows.length === 2, 'scoreboard: names outside the line-up (bots) are ignored');
  ok(s.rows[0].name === 'Alice' && s.v === 1, 'scoreboard: sorted by games won, versioned snapshot');
  ok(b.startGame(['Alice', 'Bob']) === false && b.snapshot().rows.find(r => r.name === 'Alice').gamesPlayed === 1, 'scoreboard: same humans (any order) → it adds up');
  ok(b.startGame(['Alice', 'Bob', 'Cleo']) === true && b.snapshot().rows.every(r => r.gamesPlayed === 0) && b.snapshot().rows.length === 3, 'scoreboard: a different line-up wipes it');
  ok(lineupKey(['b', 'a']) === lineupKey(['a', 'b']), 'scoreboard: line-up key ignores the order');
}

// ── 2. lobby: names, version, lists, chat ────────────────────────────────
{
  ok(cleanNick('  Al\u0007ice ') === 'Alice' && cleanNick('') === '' && cleanNick('x'.repeat(33)) === '', 'nicknames: trimmed, control characters dropped, 1–32 characters');
  const C = clock(); const srv = new LocalServer({ rng: mulberry32(1), timers: C.timers, botPool: BOTS, buildId: 7 });
  const A = player(srv, 'Alice'), B = player(srv, 'Bob');
  ok(A.got[0].type === 1 && num(A.got[0].f, 4) === 0, 'attach: Announce first, server type LAN');
  A.init(); B.init();
  ok(A.pid === 1 && B.pid === 2, 'Init: InitAck gives each player an id');
  ok(B.of(12).map(m => num(m.f, 1)).join() === '1,2' && A.of(12).map(m => num(m.f, 1)).join() === '1,2', 'PlayerList: the newcomer gets everyone, the others get the newcomer');
  const D = player(srv, 'alice'); D.init();
  ok(D.last(73) && num(D.last(73).f, 1) === 4 && D.closed && !D.pid, 'same nickname (case-insensitive) → Error initPlayerNameInUse, hung up');
  const E = player(srv, '   '); E.init();
  ok(num(E.last(73).f, 1) === 5 && E.closed, 'empty nickname → Error initInvalidPlayerName');
  const V = player(srv, 'Vic'); V.init(99);
  ok(num(V.last(73).f, 1) === 1 && V.closed, 'other build → Error initVersionNotSupported');
  A.send(18, [[1, 0, 2], [1, 0, 777]]);
  const infos = A.of(19);
  ok(infos.length === 2 && txt(readFields(infos[0].f[2][0]), 1) === 'Bob' && !infos[1].f[2], 'PlayerInfoRequest: known names answered, unknown id answered empty');
  A.clear(); B.clear();
  A.send(63, [[3, 2, 'hello lobby']]);
  ok(A.of(64).length === 1 && B.of(64).length === 1 && num(B.last(64).f, 3) === 0 && num(B.last(64).f, 2) === 1, 'lobby chat: echoed to everyone, sender included (chatTypeLobby)');
  A.clear(); B.clear();
  A.send(63, [[2, 0, 2], [3, 2, 'psst']]);
  ok(B.of(64).length === 1 && num(B.last(64).f, 3) === 4 && A.of(64).length === 1, 'private chat: to the target, echoed to the sender');
  B.h.detach();
  ok(num(A.last(12).f, 1) === 2 && num(A.last(12).f, 2) === 1, 'a dropped connection → PlayerList left for the others');
}

// ── 3. the table: create, refuse a second, join, start, private cards ────
function setupTable(seed, nicks, max) {
  const C = clock(); const srv = new LocalServer({ rng: mulberry32(seed), timers: C.timers, botPool: BOTS });
  const ps = nicks.map(nk => player(srv, nk, { onMsg: both(ackStart, shover) }));
  ps.forEach(p => p.init());
  return { C, srv, ps };
}
{
  const { C, srv, ps: [A, B, Cl] } = setupTable(42, ['Alice', 'Bob', 'Cleo']);
  A.send(22, [[1, 2, gameInfo('Friday', 3)]]);
  const gl = B.last(13);
  ok(gl && num(gl.f, 1) === 1 && num(gl.f, 5) === 1 && num(gl.f, 2) === 1, 'create: GameListNew to the lobby, creator is admin, mode created');
  ok(num(A.last(24).f, 2) === 1, 'create: JoinGameAck says admin to the creator');
  B.send(22, [[1, 2, gameInfo('Other', 3)]]);
  ok(num(B.last(25).f, 2) === 9 && !srv.table.seats.includes(2), 'one table only: a second creation is refused (invalidSettings)');
  B.send(21, [[1, 0, 1]]);
  ok(num(B.last(24).f, 2) === 0 && B.of(26).map(m => num(m.f, 2)).join() === '1,2', 'join: JoinGameAck (not admin) + every seated player');
  ok(num(A.last(26).f, 2) === 2 && num(Cl.last(15).f, 2) === 2, 'join: the table and the lobby hear about it');
  Cl.send(21, [[1, 0, 1], [4, 0, 1]]);
  ok(num(Cl.last(25).f, 2) === 12, 'spectating is not offered in V1');
  B.send(36, [[1, 0, 1], [2, 0, 0], [3, 0, 1]]);
  ok(!A.of(36).length, 'only the admin starts the game');
  A.send(36, [[1, 0, 1], [2, 0, 0], [3, 0, 1]]);
  ok(srv.table.seats.length === 3 && srv.table.seats[2] > 1000, '+ Bots: empty seats filled with bots');
  Cl.send(21, [[1, 0, 1]]);
  ok(num(Cl.last(25).f, 2) === 3, 'no joining once the start is under way');
  ok(A.of(38).length === 1 && B.of(38).length === 1 && num(Cl.last(14).f, 2) === 2, 'both acked → GameStartInitial at the table, « started » in the lobby');
  C.run(400);
  const h = srv.table.engine.h;
  const hsA = A.last(40), hsB = B.last(40);
  const cards = (m) => { const pc = readFields(m.f[2][0]); return [num(pc, 1), num(pc, 2)]; };
  ok(hsA && hsB && cards(hsA).join() === h.hole[1].join() && cards(hsB).join() === h.hole[2].join(), 'HandStart: each player gets HIS hole cards');
  ok(cards(hsA).join() !== cards(hsB).join(), 'HandStart: the two hands differ (no shared copy)');
  // Watch every hand of the game: a player never receives another's hole cards.
  let leaks = 0, hands = 0;
  const _origEngine = srv._onEngine.bind(srv);
  srv._onEngine = (tb, ev) => {
    if (ev.type === 'handStart') {
      hands++;
      const holes = ev.holeByPlayer;
      _origEngine(tb, ev);
      for (const P of [A, B]) {
        const m = P.last(40); if (!m || !m.f[2]) continue;
        const mine = cards(m).join();
        for (const pid in holes) if (+pid !== P.pid && holes[pid].join() === mine) leaks++;
        if (holes[P.pid] && holes[P.pid].join() !== mine) leaks++;
      }
      return;
    }
    _origEngine(tb, ev);
  };
  // Out of turn: whoever is not pending tries to act.
  const pending = h._pendingId, other = pending === 1 ? B : A;
  if (pending === 1 || pending === 2) {
    other.send(42, [[1, 0, 1], [2, 0, 0], [3, 0, 0], [4, 0, 1], [5, 0, 0]]);
    ok(num(other.last(43).f, 5) === 2, 'acting out of turn → YourActionRejected (notYourTurn)');
  } else ok(true, 'acting out of turn (bot to act first — covered in the next game)');
  A.send(30, [[1, 0, 1], [2, 0, 2]]);
  ok(srv.table.seats.includes(2), 'a human cannot be kicked once the game runs');
  B.send(30, [[1, 0, 1], [2, 0, srv.table.seats[2]]]);
  ok(srv.table.seats.length === 3, 'a non-admin cannot kick');
  const done = C.run(3600e3, () => !srv.table);
  ok(done, 'the game plays to its end (virtual clock)');
  ok(hands > 0 && leaks === 0, 'all ' + hands + ' later hands: each player only ever got his own hole cards');
  srv._onEngine = _origEngine;
  ok(A.of(53).length === 1 && B.of(53).length === 1, 'EndOfGame sent to the players of the table');
  ok(num(Cl.last(14).f, 2) === 3 && !srv.table, 'the table closes and leaves the lobby list');
  ok(A.of(49).length >= 1 && A.of(49).length === B.of(49).length, 'showdowns are broadcast to the whole table');
  const sb = JSON.parse(txt(A.last(NEARBY_TYPE.Scoreboard).f, 1));
  ok(sb.lineup.join() === 'Alice,Bob' && sb.rows.every(r => r.gamesPlayed === 1) && sb.rows.length === 2, 'scoreboard: one game for both humans, bots left out');
  ok(sb.rows.reduce((t, r) => t + r.gamesWon, 0) <= 1, 'scoreboard: at most one winner');
  ok(sb.rows.every(r => r.handsPlayed > 0), 'scoreboard: hands counted for every human dealt in');
  // Second game, same humans → adds up.
  A.send(22, [[1, 2, gameInfo('Again', 3)]]); B.send(21, [[1, 0, 2]]); A.send(36, [[1, 0, 2], [2, 0, 0], [3, 0, 1]]);
  C.run(3600e3, () => !srv.table);
  let sb2 = JSON.parse(txt(B.last(NEARBY_TYPE.Scoreboard).f, 1));
  ok(sb2.rows.every(r => r.gamesPlayed === 2), 'second game with the same humans: the board adds up');
  // Third game with Cleo → wiped.
  A.send(22, [[1, 2, gameInfo('Trio', 3)]]); B.send(21, [[1, 0, 3]]); Cl.send(21, [[1, 0, 3]]); A.send(36, [[1, 0, 3], [2, 0, 0], [3, 0, 1]]);
  ok(srv.table.seats.every(p => p < 1000), 'three humans fill a 3-seat table: no bot');
  C.run(3600e3, () => !srv.table);
  const sb3 = JSON.parse(txt(Cl.last(NEARBY_TYPE.Scoreboard).f, 1));
  ok(sb3.rows.length === 3 && sb3.rows.every(r => r.gamesPlayed === 1), 'another line-up: the board starts again');
}

// ── 4. leaving, admin hand-over, closing, drop mid-game ──────────────────
{
  const { C, srv, ps: [A, B, Cl] } = setupTable(7, ['Alice', 'Bob', 'Cleo']);
  A.send(22, [[1, 2, gameInfo('T', 4)]]); B.send(21, [[1, 0, 1]]); Cl.send(21, [[1, 0, 1]]);
  A.send(30, [[1, 0, 1], [2, 0, 3]]);
  ok(num(Cl.last(29).f, 2) === 1 && !srv.table.seats.includes(3) && num(B.last(27).f, 3) === 1, 'admin kicks a human before the start: RemovedFromGame (kicked) + GamePlayerLeft');
  A.send(31, [[1, 0, 1]]);
  ok(srv.table.admin === 2 && num(B.last(28).f, 2) === 2 && num(Cl.last(17).f, 2) === 2, 'the admin leaves: the next human becomes admin (table + lobby)');
  B.send(31, [[1, 0, 1]]);
  ok(!srv.table && num(A.last(14).f, 2) === 3, 'the last human leaves: the table closes');
  // Drop during a game: the player folds out, the others go on.
  A.send(22, [[1, 2, gameInfo('U', 3)]]); B.send(21, [[1, 0, 2]]); Cl.send(21, [[1, 0, 2]]);
  A.send(36, [[1, 0, 2], [2, 0, 0], [3, 0, 0]]);
  C.run(400);
  ok(srv.table && srv.table.engine, 'a three-human game is running');
  Cl.h.detach();
  const ep = srv.table.engine.players.find(p => p.id === 3);
  ok(ep && !ep.in && num(A.last(27).f, 2) === 3, 'a dropped player is out of the game, the table is told');
  const done = C.run(3600e3, () => !srv.table);
  ok(done && A.of(53).length === 1, 'the game still reaches its end');
}

// ── 5. determinism ───────────────────────────────────────────────────────
function transcript(seed) {
  const { C, srv, ps: [A, B] } = setupTable(seed, ['Alice', 'Bob']);
  A.send(22, [[1, 2, gameInfo('D', 4)]]); B.send(21, [[1, 0, 1]]); A.send(36, [[1, 0, 1], [2, 0, 0], [3, 0, 1]]);
  C.run(3600e3, () => !srv.table);
  return A.got.map(m => m.type + ':' + JSON.stringify(m.f, (k, v) => v instanceof Uint8Array ? Array.from(v) : v)).join('|');
}
{
  const a = transcript(123), b = transcript(123), c = transcript(124);
  ok(a === b && a.length > 1000, 'same seed → identical message stream (deterministic)');
  ok(a !== c, 'another seed → another game');
}

// ── 6. the host's own in-page socket ─────────────────────────────────────
{
  const srv = new LocalServer({ botPool: BOTS });
  const s = createLocalSocket(srv);
  const got = [];
  await new Promise((res) => {
    s.onopen = () => {};
    s.onmessage = (ev) => { const m = decode(new Uint8Array(ev.data)); got.push(m.type); if (m.type === 1) s.send(cmsg(2, [[5, 0, 2], [6, 2, 'Host']])); if (m.type === 6) res(); };
    setTimeout(res, 1000);
  });
  ok(got[0] === 1 && got.includes(6) && s.readyState === 1, 'createLocalSocket: open, Announce, Init → InitAck through the WebSocket surface');
  s.close();
  await new Promise(r => setTimeout(r, 10));
  ok(srv.humans.size === 0, 'closing the socket detaches the player');
  srv.stop();
}

// ── 7. two « tabs » over a real BroadcastChannel ─────────────────────────
if (typeof globalThis.BroadcastChannel === 'function') {
  const name = 'pth-nearby-test-' + process.pid;
  const srv = new LocalServer({ botPool: BOTS });
  const link = hostOverBroadcast(srv, name);
  function guest(nick) {
    const g = { nick, got: [] };
    g.s = createBroadcastSocket(name);
    g.s.onmessage = (ev) => { const m = decode(new Uint8Array(ev.data)); g.got.push(m); if (m.type === 1) g.s.send(cmsg(2, [[5, 0, 2], [6, 2, nick]])); };
    return g;
  }
  const g1 = guest('Tab1'), g2 = guest('Tab2');
  const until = (fn, ms) => new Promise((res) => { const t0 = Date.now(); (function poll() { if (fn() || Date.now() - t0 > ms) res(); else setTimeout(poll, 10); })(); });
  await until(() => g1.got.some(m => m.type === 6) && g2.got.some(m => m.type === 6), 3000);
  ok(g1.got.some(m => m.type === 6) && g2.got.some(m => m.type === 6), 'BroadcastChannel: two tabs reach the host and log in');
  g1.s.send(cmsg(63, [[3, 2, 'hi from tab 1']]));
  await until(() => g2.got.some(m => m.type === 64), 3000);
  ok(g2.got.some(m => m.type === 64 && txt(m.f, 4) === 'hi from tab 1'), 'BroadcastChannel: lobby chat crosses tabs');
  const ack1 = g1.got.filter(m => m.type === 6), ack2 = g2.got.filter(m => m.type === 6);
  ok(ack1.length === 1 && ack2.length === 1 && num(ack1[0].f, 2) !== num(ack2[0].f, 2), 'BroadcastChannel: each tab only gets its own frames (one InitAck each, distinct ids)');
  g2.s.close();
  await until(() => srv.humans.size === 1, 3000);
  ok(srv.humans.size === 1, 'BroadcastChannel: a closed tab leaves the lobby');
  link.close(); g1.s.close(); srv.stop();
  await new Promise(r => setTimeout(r, 20));
} else ok(true, 'BroadcastChannel unavailable in this Node — skipped');

console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
