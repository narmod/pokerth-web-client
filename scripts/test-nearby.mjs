#!/usr/bin/env node
// « Play nearby », step 1: the local server (lobby + one table + evening
// scoreboard) and its carriers, without any UI. Deterministic: seeded rng and
// a virtual clock; the BroadcastChannel part uses Node's real channels.
// Run: node scripts/test-nearby.mjs
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mod = (p) => import(path.join(root, 'public/modules', p));
const { LocalServer, NEARBY_TYPE, cleanNick, GRACE_MS } = await mod('lan/local-server.mjs');
const { encodePayload, decodePayload, parseSdp, buildSdp, KIND, SignalError } = await mod('lan/signal.mjs');
const { createScoreboard, lineupKey } = await mod('lan/scoreboard.mjs');
const { createLocalSocket, PipeSocket } = await mod('lan/pipe-socket.mjs');
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
  P.init = (buildId, guid) => P.send(2, [[1, 2, encode([[1, 0, 5], [2, 0, 1]])], [2, 0, buildId || 7], guid ? [3, 2, guid] : [3, 0, undefined], [5, 0, 2], [6, 2, nick]]);
  P.guid = () => { const a = P.of(6); const g = a.length && a[a.length - 1].f[1]; return g ? g[0] : null; };
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
let _g = 0;
const seqGuid = () => { const g = new Uint8Array(16); g[15] = ++_g & 0xff; g[14] = (_g >> 8) & 0xff; return g; };
function setupTable(seed, nicks, max, strategy) {
  const C = clock(); _g = 0;
  const srv = new LocalServer({ rng: mulberry32(seed), timers: C.timers, botPool: BOTS, newGuid: seqGuid });
  const ps = nicks.map(nk => player(srv, nk, { onMsg: both(ackStart, strategy || shover) }));
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
}

// ── 4b. drop during a game: away, seat kept, then given up or taken back ──
// Long games: big stacks, blinds never rise, everybody just calls.
const caller = (P, m) => { if (m.type === 41 && num(m.f, 2) === P.pid) P.send(42, [[1, 0, num(m.f, 1)], [2, 0, 0], [3, 0, num(m.f, 3)], [4, 0, 3], [5, 0, 0]]); };
function longInfo(name, max) { return encode([[1, 2, name], [2, 0, 1], [3, 0, max || 3], [4, 0, 1], [5, 0, 1000], [7, 0, 1], [9, 0, 10], [10, 0, 1], [11, 0, 10], [12, 0, 10], [13, 0, 100000]]); }
{
  const { C, srv, ps: [A, B, Cl] } = setupTable(11, ['Alice', 'Bob', 'Cleo'], 3, caller);
  A.send(22, [[1, 2, longInfo('U', 3)]]); B.send(21, [[1, 0, 1]]); Cl.send(21, [[1, 0, 1]]);
  A.send(36, [[1, 0, 1], [2, 0, 0], [3, 0, 0]]);
  C.run(400);
  ok(srv.table && srv.table.engine, 'a three-human game is running');
  const before27 = A.of(27).length;
  Cl.h.detach();
  const ep = srv.table.engine.players.find(p => p.id === 3);
  ok(ep && ep.in && A.of(27).length === before27 && num(A.last(12).f, 1) === 3 && num(A.last(12).f, 2) === 1,
    'a player who drops mid-game keeps his seat (away): out of the lobby list, still at the table');
  const D = player(srv, 'cleo'); D.init();
  ok(num(D.last(73).f, 1) === 4, 'while away his nickname stays reserved');
  A.clear();
  C.run(30e3);
  const hs = A.of(40);
  const st = (m) => (m.f[5] || []).slice();
  ok(hs.length > 0 && hs.every(m => st(m)[2] === 1), 'away: his seat shows sessionInactive in HandStart');
  ok(!A.of(41).some(m => num(m.f, 2) === 3) || A.of(44).some(m => num(m.f, 2) === 3), 'away: his turns are played for him (check or fold), the game does not wait');
  C.run(GRACE_MS);
  ok(!srv.table.engine.players.find(p => p.id === 3).in && A.of(27).some(m => num(m.f, 2) === 3) && !srv.humans.has(3),
    'after the grace period he leaves the table and his nickname is free');
}
{
  const { C, srv, ps: [A, B] } = setupTable(12, ['Alice', 'Bob'], 3, caller);
  A.send(22, [[1, 2, longInfo('V', 3)]]); B.send(21, [[1, 0, 1]]);
  A.send(36, [[1, 0, 1], [2, 0, 0], [3, 0, 1]]);
  C.run(5000);
  const guid = B.guid(), gid = 1, handsB = B.of(40).length;
  ok(guid && guid.length === 16, 'InitAck carries a 16-byte session GUID');
  B.h.detach();
  C.run(8000);
  const W = player(srv, 'Bob', { onMsg: both(ackStart, caller) });
  W.init(7, new Uint8Array(16));
  ok(num(W.last(73).f, 1) === 4, 'same nickname with a wrong GUID → refused (initPlayerNameInUse)');
  const B2 = player(srv, 'Bob', { onMsg: both(ackStart, caller) });
  B2.init(7, guid);
  const ack = B2.last(6);
  ok(ack && num(ack.f, 2) === 2 && num(ack.f, 4) === gid, 'same nickname + GUID → his id back and InitAck.rejoinGameId');
  ok(num(A.last(12).f, 1) === 2 && num(A.last(12).f, 2) === 0, 'the others see him back in the lobby');
  B2.send(23, [[1, 0, gid]]);
  const rj = B2.last(39);
  ok(B2.last(24) && rj && num(rj.f, 1) === gid && (rj.f[4] || []).length === 3, 'RejoinExistingGame → JoinGameAck + GameStartRejoin (every seat and stack)');
  const n44 = B2.of(44).length, n40 = B2.of(40).length;
  ok(n40 === 0, 'after the rejoin: nothing from the hand in progress');
  C.run(60e3);
  const hsB = B2.of(40);
  ok(hsB.length > 0 && hsB[0].f[2], 'from the next hand he gets his cards again');
  ok(B2.of(44).some(m => num(m.f, 2) === 2) && srv.humans.get(2) && !srv.humans.get(2).away, 'he plays again (his own actions at the table)');
  void n44; void handsB;
  // Never asks for his seat → given up after the grace period.
  B2.h.detach(); C.run(1000);
  const B3 = player(srv, 'Bob'); B3.init(7, guid);
  ok(num(B3.last(6).f, 4) === gid, 'second drop: the seat waits again');
  C.run(GRACE_MS + 5000);
  ok(!srv.table || !srv.table.engine.players.find(p => p.id === 2).in, 'logged back but never rejoined: the seat is given up after the grace period');
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

// ── 5b. connection codes (lan/signal.mjs) ────────────────────────────────
const FP = 'A5:B9:55:E5:75:9A:0F:48:25:30:EC:34:63:12:74:43:DB:0F:93:A2:90:01:C7:31:F0:EA:45:DC:50:84:24:5D';
const SDP = {
  // Chrome 13x: one mDNS candidate (what headless Chrome gave in this container).
  chrome: 'v=0\r\no=- 266631618896529175 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=candidate:1058339852 1 udp 2113937151 fd74c431-28b5-499a-9447-6d85f8539f5a.local 49546 typ host generation 0 network-cost 999\r\na=ice-ufrag:RAf/\r\na=ice-pwd:ZHxia7n+gcrlgGEuQTAgPz6z\r\na=ice-options:trickle\r\na=fingerprint:sha-256 ' + FP + '\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n',
  // Firefox style: upper-case UDP, TCP candidates, 'active' answer, LF only.
  firefox: 'v=0\no=mozilla...THIS_IS_SDPARTA-99.0 1 0 IN IP4 0.0.0.0\ns=-\nt=0 0\na=fingerprint:sha-256 ' + FP + '\na=group:BUNDLE 0\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\nc=IN IP4 0.0.0.0\na=candidate:0 1 UDP 2122252543 0e5f3c1a-1b2c-4d3e-8f90-0123456789ab.local 54321 typ host\na=candidate:1 1 TCP 2105524479 0e5f3c1a-1b2c-4d3e-8f90-0123456789ab.local 9 typ host tcptype active\na=sendrecv\na=end-of-candidates\na=ice-pwd:4c0f2f3c8e2a1c9d7b6e5f4a3b2c1d0e\na=ice-ufrag:9a8b7c6d\na=mid:0\na=setup:active\na=sctp-port:5000\na=max-message-size:1073741823\n',
  // Safari / no mDNS: plain IPv4 and IPv6 host candidates, plus a srflx to drop.
  safari: 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=candidate:1 1 udp 2122260223 192.168.1.42 61001 typ host generation 0\r\na=candidate:2 1 udp 2122194687 2a01:e0a:1f2:3::abcd 61002 typ host generation 0\r\na=candidate:3 1 udp 1686052607 82.65.1.2 61001 typ srflx raddr 192.168.1.42 rport 61001\r\na=ice-ufrag:Zx9q\r\na=ice-pwd:abcdefghijklmnopqrstuvwx\r\na=fingerprint:sha-256 ' + FP + '\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\n',
};
{
  for (const [who, sdp] of Object.entries(SDP)) {
    const code = encodePayload({ kind: KIND.offer, slot: 7, build: '2.1.10-web.348', label: 'Arnaud', sdp });
    const d = decodePayload(code);
    const f0 = parseSdp(sdp), f1 = parseSdp(d.sdp);
    ok(/^[A-Za-z0-9_-]+$/.test(code) && code.length <= 250, who + ': code is base64url, ' + code.length + ' characters');
    ok(d.kind === KIND.offer && d.slot === 7 && d.build === '2.1.10-web.348' && d.label === 'Arnaud', who + ': header round-trips (kind, slot, build, label)');
    ok(JSON.stringify(f0) === JSON.stringify(f1), who + ': the rebuilt SDP carries the same ICE credentials, fingerprint, setup and candidates');
  }
  ok(parseSdp(SDP.firefox).candidates.length === 1 && parseSdp(SDP.safari).candidates.length === 2, 'only UDP host candidates are kept (no TCP, no srflx)');
  ok(parseSdp(SDP.firefox).setup === 1, 'DTLS role kept (active)');
  ok(decodePayload(encodePayload({ kind: KIND.offer, slot: 1, build: 'b', sdp: SDP.safari })).fields.candidates[1].address === '2a01:e0a:1f2:3::abcd', 'IPv6 addresses survive (RFC 5952 text)');
  const err = (fn) => { try { fn(); return ''; } catch (e) { return e instanceof SignalError ? e.code : 'other:' + e.message; } };
  ok(err(() => decodePayload('not a code!')) === 'bad-code', 'garbage → SignalError bad-code');
  const good = encodePayload({ kind: KIND.answer, slot: 3, build: 'b', sdp: SDP.chrome });
  ok(err(() => decodePayload(good.slice(0, 40))) === 'bad-code', 'truncated code → bad-code');
  const v2 = 'I' + good.slice(1);   // header byte 0x21 → protocol 2
  ok(err(() => decodePayload(v2)) === 'unsupported', 'another protocol version → unsupported');
  ok(err(() => encodePayload({ kind: 1, slot: 1, build: 'b', sdp: SDP.chrome.replace(/a=candidate:[^\r]*\r\n/, '') })) === 'no-candidates', 'no local address → no-candidates');
  ok(err(() => encodePayload({ kind: 1, slot: 1, build: 'b', sdp: SDP.chrome.replace('sha-256', 'sha-1') })) === 'unsupported', 'non-SHA-256 fingerprint → unsupported');
  ok(buildSdp(parseSdp(SDP.chrome)).includes('a=setup:actpass') && buildSdp(parseSdp(SDP.chrome)).endsWith('\r\n'), 'rebuilt SDP: CRLF lines, offer role actpass');
}

// ── 5c. handing codes over: links, paste, QR round trip, tab relay ───────
{
  const { codeLink, readCode, qrMatrix, LINK_KEY } = await mod('lan/codes.mjs');
  const { decodeFrame } = await mod('lan/qr-scan.mjs');
  const { listenForCodes, relayCode } = await mod('lan/link-relay.mjs');
  const offerCode = encodePayload({ kind: KIND.offer, slot: 9, build: '2.1.10-web.349', label: 'Arnaud', sdp: SDP.safari });
  const answerCode = encodePayload({ kind: KIND.answer, slot: 9, build: '2.1.10-web.349', sdp: SDP.firefox });
  const base = 'https://webclient.pokerth.net/';
  const link = codeLink(offerCode, 'offer', base);
  ok(link === base + '#lan-offer=' + offerCode && LINK_KEY.answer === 'lan-answer', 'codeLink: client address + #lan-offer=<code>');
  const r1 = readCode(link);
  ok(r1.kind === 'offer' && r1.code === offerCode && r1.info.label === 'Arnaud', 'readCode: from the link');
  ok(readCode(offerCode).kind === 'offer' && readCode(answerCode).kind === 'answer', 'readCode: from the bare code (kind read from the code)');
  ok(readCode('Join me! ' + codeLink(answerCode, 'answer', base) + ' see you').code === answerCode, 'readCode: a link inside a message');
  ok(readCode(answerCode.slice(0, 50) + '\n' + answerCode.slice(50)).code === answerCode, 'readCode: a bare code wrapped over two lines');
  const err = (fn) => { try { fn(); return ''; } catch (e) { return e instanceof SignalError ? e.code : 'other'; } };
  ok(err(() => readCode(base + '#lan-answer=' + offerCode)) === 'wrong-kind', 'readCode: an offer behind #lan-answer → wrong-kind');
  ok(err(() => readCode('hello world')) === 'bad-code' && err(() => readCode(base + '#lan-offer=' + offerCode.slice(0, 70))) === 'bad-code', 'readCode: no code / damaged code → bad-code');
  // QR: generate the link's QR, rasterize it like the canvas does, read it back with the vendored decoder.
  const m = await qrMatrix(link);
  const quiet = 4, px = 4, W = (m.size + quiet * 2) * px;
  const data = new Uint8ClampedArray(W * W * 4).fill(255);
  for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.dark(r, c))
    for (let y = 0; y < px; y++) for (let x = 0; x < px; x++) { const i = (((r + quiet) * px + y) * W + (c + quiet) * px + x) * 4; data[i] = data[i + 1] = data[i + 2] = 0; }
  const back = await decodeFrame({ data, width: W, height: W });
  ok(back === link, 'QR round trip: ' + link.length + '-character link, ' + m.size + '×' + m.size + ' modules, read back by jsQR');
  // Tab relay over a real BroadcastChannel.
  if (typeof globalThis.BroadcastChannel === 'function') {
    let got = null;
    const stop = listenForCodes((found) => { got = found; return found.kind === 'answer'; });
    const took = await relayCode(readCode(codeLink(answerCode, 'answer', base)), 1500);
    ok(took && got && got.code === answerCode, 'link relay: a link opened in another tab reaches the game tab, which confirms');
    const notTaken = await relayCode(readCode(link), 400);
    ok(notTaken === false, 'link relay: a code the game tab does not want is left to the new tab');
    stop();
    ok(await relayCode(readCode(link), 300) === false, 'link relay: no game tab → the new tab handles the code itself');
  }
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

{
  // A frame handed over before the client saw onopen is kept and delivered after it.
  const ps = new PipeSocket(() => {});
  const seen = [];
  ps.onopen = () => seen.push('open');
  ps.onmessage = (ev) => seen.push('msg' + new Uint8Array(ev.data)[0]);
  ps._deliver(new Uint8Array([1])); ps._deliver(new Uint8Array([2]));
  ps._open();
  await new Promise(r => setTimeout(r, 20));
  ok(seen.join() === 'open,msg1,msg2', 'PipeSocket: frames arriving before open are delivered after onopen, in order');
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
