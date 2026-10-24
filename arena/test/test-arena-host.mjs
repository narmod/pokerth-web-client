#!/usr/bin/env node
// Tests of the director that OPENS a tournament table (arena/lib/host.mjs)
// against a scripted fake PokerTH server that behaves like the real one
// (src/net/servergame*.cpp): invite-only table, kicks before the start, the
// admin passing to the first player when the creator leaves, spectators.
// Then the whole chain through the service: open the table from the
// tournament, the director in its own process, the result carried into the
// tournament by itself.
// Run: node arena/test/test-arena-host.mjs
import { mkdtempSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { HostDirector, gameInfoFor, safeTableName } from '../lib/host.mjs';
import { botLangs, isBotLang, loadBotStrings, splitChat, BOT_EN, CHAT_MAX_BYTES, CHAT_PART_BYTES } from '../lib/botchat.mjs';
import { generateKeys, verifyJournal, verifyPayload } from '../lib/journal.mjs';
import { replayJournal } from '../lib/spectator.mjs';
import { createService } from '../lib/service.mjs';
import { TABLE_DEFAULTS, cleanTable } from '../lib/tournaments.mjs';
import { msg, fakeServer, wait } from './lib/arena-fake-server.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}
async function until(fn, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await wait(50); }
  return null;
}

const GID = 50, ME = 99;
const NAMES = { 21: 'Alice', 22: 'Bob', 23: 'Mallory', 24: 'Carol', 25: 'Dave', 26: 'Bob', 27: 'Alice', [ME]: 'TD-x' };
const info = (id) => msg(0, 'playerInfoReplyMessage', { playerId: id, playerInfoData: { playerName: NAMES[id], isHuman: true, playerRights: 1 } });
const M = {
  announce: () => msg(0, 'announceMessage', { protocolVersion: { majorVersion: 5, minorVersion: 1 }, latestGameVersion: { majorVersion: 2, minorVersion: 1 }, latestBetaRevision: 0, serverType: 1, numPlayersOnServer: 5 }),
  initAck: () => msg(0, 'initAckMessage', { yourSessionId: Buffer.alloc(16, 1), yourPlayerId: ME }),
  lobby: (id, left) => msg(0, 'playerListMessage', { playerId: id, playerListNotification: left ? 1 : 0 }),
  created: (gi) => msg(0, 'joinGameAckMessage', { gameId: GID, areYouGameAdmin: true, gameInfo: gi }),
  failed: (r) => msg(0, 'joinGameFailedMessage', { gameId: 0, joinGameFailureReason: r }),
  joined: (id, admin) => msg(0, 'gamePlayerJoinedMessage', { gameId: GID, playerId: id, isGameAdmin: !!admin }),
  left: (id, reason) => msg(0, 'gamePlayerLeftMessage', { gameId: GID, playerId: id, gamePlayerLeftReason: reason || 0 }),
  rejectInv: (id, busy) => msg(0, 'rejectInvNotifyMessage', { gameId: GID, playerId: id, playerRejectReason: busy ? 1 : 0 }),
  otherGameLeft: (id) => msg(0, 'gameListPlayerLeftMessage', { gameId: 3, playerId: id }),
  removed: () => msg(0, 'removedFromGameMessage', { gameId: GID, removedFromGameReason: 0 }),
  adminChanged: (id) => msg(0, 'gameListAdminChangedMessage', { gameId: GID, newAdminPlayerId: id }),
  specAck: (gi) => msg(0, 'joinGameAckMessage', { gameId: GID, areYouGameAdmin: false, gameInfo: gi, spectateOnly: true }),
  start: (seats) => msg(0, 'gameStartInitialMessage', { gameId: GID, startDealerPlayerId: seats[0], playerSeats: seats }),
  hand: (states, sb) => msg(0, 'handStartMessage', { gameId: GID, smallBlind: sb || 10, seatStates: states }),
  act: (id, money) => msg(0, 'playersActionDoneMessage', { gameId: GID, playerId: id, gameState: 0, playerAction: 6, totalPlayerBet: 0, playerMoney: money, highestSet: 0, minimumRaise: 0 }),
  hide: (id, money) => msg(0, 'endOfHandHideCardsMessage', { gameId: GID, playerId: id, moneyWon: 100, playerMoney: money }),
  end: (id) => msg(0, 'endOfGameMessage', { gameId: GID, winnerPlayerId: id }),
};

// A server for one hosted table. `lobbyIds` are connected; `plan` reacts to
// the director's invitations (who sits, who is busy, who is not registered).
function tableServer({ lobbyIds, onInvite, startWith, nameInUse = 0, game = true }) {
  const state = { gi: null, seats: [], admin: ME, chats: [], pms: [], invites: [], kicks: [], leaves: 0, specJoin: 0, creates: [] };
  return fakeServer((conn) => {
    const w = (b) => conn.sock.write(b);
    let inUse = nameInUse;
    conn.onMsg = async (m) => {
      if (m.initMessage) {
        w(M.initAck());
        for (const id of lobbyIds) w(M.lobby(id));
      }
      if (m.playerInfoRequestMessage) for (const id of m.playerInfoRequestMessage.playerId) if (NAMES[id]) w(info(id));
      if (m.joinNewGameMessage) {
        state.creates.push(m.joinNewGameMessage);
        if (inUse > 0) { inUse -= 1; return w(M.failed(7)); }
        state.gi = m.joinNewGameMessage.gameInfo;
        w(M.created(state.gi));
        w(M.joined(ME, true));
      }
      if (m.invitePlayerToGameMessage) {
        state.invites.push(m.invitePlayerToGameMessage.playerId);
        if (onInvite) onInvite(m.invitePlayerToGameMessage.playerId, { w, state, M });
      }
      if (m.kickPlayerRequestMessage) {
        const id = m.kickPlayerRequestMessage.playerId;
        state.kicks.push(id);
        state.seats = state.seats.filter((x) => x !== id);
        w(M.left(id, 1));
      }
      if (m.chatRequestMessage) {
        const c = m.chatRequestMessage;
        if (c.targetPlayerId) state.pms.push({ to: c.targetPlayerId, text: c.chatText, started: !!state.started });
        else state.chats.push(c.chatText);
      }
      if (m.leaveGameRequestMessage) {
        state.leaves += 1;
        if (!state.specJoin) state.leavesBeforeSpec = state.leaves;
        // The server: the first player becomes admin; the lobby is told.
        state.admin = state.seats[0];
        w(M.removed());
        w(M.adminChanged(state.admin));
      }
      if (m.joinExistingGameMessage && m.joinExistingGameMessage.spectateOnly) {
        state.specJoin += 1;
        w(M.specAck(state.gi));
        for (const id of state.seats) w(M.joined(id, id === state.admin));
        if (game) {
          await wait(80);
          const seats = startWith || state.seats;
          const total = state.gi.startMoney * seats.length;
          state.started = true;
          w(M.start(seats));
          // One player out per hand, from the last seat; the first seat wins.
          const out = new Set();
          for (let i = seats.length - 1; i >= 1; i--) {
            w(M.hand(seats.map((id) => (out.has(id) ? 2 : 0)), 10 * (seats.length - i)));
            w(M.act(seats[i], 0));
            out.add(seats[i]);
            w(M.hide(seats[0], i === 1 ? total : state.gi.startMoney));
            await wait(150);
          }
          w(M.end(seats[0]));
        }
      }
    };
    w(M.announce());
  }).then((f) => Object.assign(f, { state }));
}

// A seat, as the server announces it after an invitation.
const sit = (id, { w, state }) => setTimeout(() => { state.seats.push(id); w(M.joined(id, false)); }, 20);

const keys = generateKeys();
const table = cleanTable({ startMoney: 2000, firstSmallBlind: 20, raiseMode: 'minutes', raiseEvery: 5, actionTimeout: 25, delayBetweenHands: 5 });

// ── settings ───────────────────────────────────────────────────────
{
  const gi = gameInfoFor(table, 'Cup', 4);
  ok(gi.netGameType === 3 && gi.allowSpectators === true && gi.maxNumPlayers === 4, 'table: invite-only, spectators allowed');
  ok(gi.raiseIntervalMode === 2 && gi.raiseEveryMinutes === 5 && gi.raiseEveryHands === undefined && gi.startMoney === 2000 && gi.firstSmallBlind === 20 && gi.playerActionTimeout === 25, 'table: the tournament settings');
  ok(cleanTable({ startMoney: 5, actionTimeout: 1, raiseMode: 'x' }).startMoney === TABLE_DEFAULTS.startMoney && cleanTable({ actionTimeout: 1 }).actionTimeout === TABLE_DEFAULTS.actionTimeout && cleanTable({ raiseMode: 'x' }).raiseMode === 'hands', 'table: values out of range fall back');
  ok(safeTableName('  \u0001 été cup') === 'Tournament été cup' && safeTableName('Friday') === 'Friday', 'table name: first byte printable, as the server checks');
}

function director(f, registered, extra) {
  return new HostDirector(Object.assign({
    host: '127.0.0.1', port: f.port, nick: 'TD-x', tableName: 'Friday cup', table, registered,
    privateKeyPem: keys.privateKeyPem, version: '2.1.10-web.298', handoverDelayMs: 0, nameWaitMs: 0, reconnects: 0, chatGapMs: 20, pmGapMs: 5, adminNoticeDelayMs: 20,
  }, extra || {}));
}

// ── full run: invitations, a stranger kicked, a busy player, handover ──
{
  const f = await tableServer({
    lobbyIds: [21, 22, 23, 24],
    onInvite: (id, ctx) => {
      if (id === 21) { sit(21, ctx); setTimeout(() => { ctx.state.seats.push(23); ctx.w(M.joined(23)); }, 40); }   // Alice, and Mallory slips in
      if (id === 24 && !ctx.state.carolBusy) { ctx.state.carolBusy = true; ctx.w(M.rejectInv(24, true)); setTimeout(() => ctx.w(M.otherGameLeft(24)), 150); }
      else if (id === 24) sit(24, ctx);
      if (id === 22) setTimeout(() => sit(22, ctx), 250);
    },
  });
  const d = director(f, ['Alice', 'Bob', 'Carol']);
  const states = [];
  d.on('host', (h) => states.push(h.phase));
  let sealed = null;
  d.on('result', (s) => { sealed = s; });
  d.start();
  await until(() => sealed, 5000);
  const st = f.state;
  const cr = st.creates[0];
  ok(cr && cr.gameInfo.gameName === 'Friday cup' && cr.gameInfo.netGameType === 3 && cr.gameInfo.maxNumPlayers === 4, 'creates an invite-only table, one seat more than the players');
  ok(st.invites.indexOf(21) >= 0 && st.invites.indexOf(22) >= 0 && st.invites.indexOf(23) < 0, 'invites the registered players in the lobby, nobody else');
  ok(st.kicks.length === 1 && st.kicks[0] === 23 && d.kicked.join() === 'Mallory', 'kicks a player who is not registered');
  ok(st.invites.filter((x) => x === 24).length === 2, 'a busy player is invited again once back in the lobby');
  ok(st.leavesBeforeSpec === 1 && st.specJoin === 1, 'all seated: leaves its seat, comes back as a spectator');
  ok(states.indexOf('seated') >= 0 && states.indexOf('handover') >= 0 && states.indexOf('watch') >= 0, 'phases: seated → handover → watch');
  const pm = (to, re) => st.pms.some((p) => p.to === to && re.test(p.text));
  ok(pm(21, /^welcome Alice, you are seated \(1 of 3\)/) && pm(23, /^you are not registered for this tournament/), 'before the start: welcome and the reason of the kick as private messages (the waiting room shows the lobby chat)');
  ok(pm(21, /^you are the table admin now: please start the game/) && pm(24, /^Alice is now the table admin/) && pm(22, /^Alice is now the table admin/), 'hand-over: the new admin asked to start, the others told who starts, privately');
  {
    const es = d.journal.entries, iStart = es.findIndex((e) => e.type === 'game' && e.data.type === 'gameStart');
    ok(iStart > 0 && !es.slice(iStart).some((e) => e.type === 'chat' && e.data.to != null), 'no private message once the director sees the game running (the server refuses them)');
  }
  ok(!st.chats.some((c) => /welcome|registered|table admin/.test(c)), 'nothing for the waiting room goes to the table chat');
  ok(st.chats.concat(st.pms.map((p) => p.text)).every((c) => !/https?:|www\./i.test(c) && c.replace(/[^A-Z]/g, '').length <= 2), 'chat: no links, no capitals (chatcleaner)');
  ok(new Set(st.chats).size === st.chats.length, 'chat: never the same line twice');
  ok(st.chats.some((c) => c === 'Bob is out, 2 players left.') && st.chats.some((c) => c === 'heads-up: Alice against Carol.'), 'announces: who is out, players left, heads-up');
  ok(!st.chats.some((c) => /blinds/.test(c)), 'announces: not the blinds (every client shows them)');
  ok(st.chats.some((c) => /^Alice wins the tournament, Carol second\. congratulations/.test(c)), 'announces: the winner and the second');
  ok(sealed && sealed.payload.result.status === 'complete' && sealed.payload.result.ranking.map((r) => r.name).join() === 'Alice,Carol,Bob', 'result: sealed ranking of the registered players');
  ok(sealed && verifyPayload(sealed.payload, sealed.signature, sealed.publicKeyPem), 'result: signed');
  const entries = d.journal.entries;
  ok(verifyJournal(entries).ok && JSON.stringify(replayJournal(entries)) === JSON.stringify(sealed.payload.result), 'journal: intact, replays to the same ranking');
  const types = entries.map((e) => e.type);
  ok(['tableCreated', 'invited', 'kicked', 'seated', 'handover', 'leftSeat', 'seatCheck'].every((t) => types.indexOf(t) >= 0), 'journal: every step of the table recorded');
  const hl = entries.filter((e) => e.type === 'game' && e.data.type === 'handLog');
  ok(hl.length >= 1 && hl.every((e) => Array.isArray(e.data.actions) && Array.isArray(e.data.winners) && e.data.hand >= 1) && hl.some((e) => e.data.actions.length > 0), 'journal: one hand log per hand (actions, winners) for the collusion check');
  const sc = entries.find((e) => e.type === 'seatCheck');
  ok(sc && sc.data.ok === true, 'seat check at the start: only registered players');
  ok(!entries.some((e) => e.type === 'game' && e.data.type === 'playerName' && e.data.name === 'Mallory'), 'journal: names of players who never played stay out of the game facts');
  f.server.close();
}

// ── chat language and the server's 128-byte limit ─────────────────
{
  const fr = await loadBotStrings('fr');
  ok(fr.welcome !== BOT_EN.welcome && (await loadBotStrings('xx')).welcome === BOT_EN.welcome && (await loadBotStrings()).wins === BOT_EN.wins, 'chat language: its lines, English for an unknown one');
  const langs = botLangs();
  {
    // Every language of the players' page has its chat lines: same keys, same
    // placeholders, lowercase at the start of a line (the chat filter).
    const here = new URL('../lib/botlang/', import.meta.url);
    const pages = readdirSync(new URL('../public/lang/', import.meta.url)).filter((x) => x.endsWith('.mjs')).map((x) => x.slice(0, -4));
    const bad = [];
    for (const c of pages) {
      if (langs.indexOf(c) < 0) { bad.push(c + ' missing'); continue; }
      const L = (await import(new URL(c + '.mjs', here).href)).strings;
      for (const k of Object.keys(BOT_EN)) {
        const ph = (x) => (String(x).match(/\{\w+\}/g) || []).sort().join();
        if (typeof L[k] !== 'string' || !L[k].trim()) bad.push(c + '.' + k + ' missing');
        else if (ph(L[k]) !== ph(BOT_EN[k])) bad.push(c + '.' + k + ' placeholders');
        else if (/^[A-Z\u00c0-\u00de\u0391-\u03a9\u0410-\u042f]/.test(L[k])) bad.push(c + '.' + k + ' capital');
      }
      for (const k of Object.keys(L)) if (!(k in BOT_EN)) bad.push(c + '.' + k + ' unknown');
    }
    ok(bad.length === 0, 'chat catalogues: ' + pages.length + ' languages, every line, same placeholders, lowercase' + (bad.length ? ' — ' + bad.slice(0, 6).join(' | ') : ''));
  }
  ok(langs.indexOf('en') >= 0 && langs.indexOf('fr') >= 0 && isBotLang('FR') && !isBotLang('../en') && !isBotLang('xx'), 'chat languages: the catalogues there are, nothing else');
  const long = 'welcome ' + 'X'.repeat(64) + ', you are seated (10 of 10). the game starts once every registered player is here.';
  const parts = splitChat(long);
  ok(parts.length === 2 && parts.every((x) => Buffer.byteLength(x) <= CHAT_PART_BYTES) && parts.join(' ') === long, 'a line over the limit is split after a sentence, nothing lost');
  const th = splitChat('การแข่งขันเริ่มแล้ว ผู้อำนวยการติดตามจนจบและบันทึกผลการแข่งขัน ขอให้โชคดี การแข่งขันเริ่มแล้ว ผู้อำนวยการติดตามจนจบ');
  const zh = splitChat('比赛已经开始。主持人会一直跟进到结束并记录结果。祝你好运！比赛已经开始。主持人会一直跟进到结束并记录结果。祝你好运！');
  ok(th.length > 1 && zh.length > 1 && th.concat(zh).every((x) => Buffer.byteLength(x) <= CHAT_PART_BYTES) && zh[0].endsWith('。'), 'languages without spaces: split between words, after a sentence when it can');
  ok(splitChat('é'.repeat(200)).every((x) => Buffer.byteLength(x) <= CHAT_PART_BYTES && !x.includes('\ufffd')), 'never inside a character');
  // A whole run in French.
  const f = await tableServer({ lobbyIds: [21, 22, 24], onInvite: (id, ctx) => sit(id, ctx) });
  const d = director(f, ['Alice', 'Bob', 'Carol'], { chat: fr });
  let sealed = null;
  d.on('result', (s) => { sealed = s; });
  d.start();
  await until(() => sealed, 5000);
  const st = f.state;
  const all = st.chats.concat(st.pms.map((p) => p.text));
  ok(all.length > 0 && all.every((c) => Buffer.byteLength(c, 'utf8') <= CHAT_MAX_BYTES), 'every line the server gets is at most 128 bytes (' + Math.max(...all.map((c) => Buffer.byteLength(c))) + ')');
  ok(st.pms.some((p) => /^bienvenue Alice, vous êtes assis \(1 sur 3\)/.test(p.text)) && st.chats.some((c) => /^la partie a commencé/.test(c)), 'French: welcome and start in the chat language');
  ok(st.chats.some((c) => /^Alice gagne le tournoi/.test(c)) || st.chats.some((c) => /gagne le tournoi/.test(c)), 'French: the winner');
  const d2 = director(f, ['Alice', 'Bob'], { chat: fr });
  d2._chatTimer = 1;   // keep the queue as it is
  d2._tell([21, 22], 'merci à tous d’être venus ce soir, le prochain tournoi aura lieu vendredi prochain à vingt heures, même serveur, mêmes réglages, inscriptions ouvertes dès demain matin sur la page.');
  ok(d2.chatQueue.length === 4 && d2.chatQueue.every((e) => Buffer.byteLength(e.text) <= CHAT_PART_BYTES) && d2.chatQueue.filter((e) => e.to === 21).map((e) => e.text).join(' ').endsWith('sur la page.'), 'a long line goes in parts, to each player, nothing lost');
  f.server.close();
}

// ── the organizer goes without an absent player; a name in use ──
{
  const f = await tableServer({ lobbyIds: [21, 22], nameInUse: 1, onInvite: (id, ctx) => sit(id, ctx) });
  const d = director(f, ['Alice', 'Bob', 'Dave']);
  let sealed = null;
  d.on('result', (s) => { sealed = s; });
  d.start();
  await until(() => d.seated.size === 2, 3000);
  ok(d.phase === 'seated' && d.hostState().registered.find((r) => r.nick === 'Dave').status === 'offline', 'waits for Dave, who is not connected');
  ok(f.state.creates.length === 2 && d.tableName === 'Friday cup #2', 'table name in use: a second name');
  d.command({ cmd: 'say', text: 'we start in five minutes, please stay close', author: 'admin' });
  const sayTo = () => f.state.pms.filter((p) => p.text === 'we start in five minutes, please stay close').map((p) => p.to).sort().join();
  await until(() => sayTo() === '21,22', 2000);
  ok(sayTo() === '21,22' && d.journal.entries.some((e) => e.type === 'organizerMessage'), 'say: before the start, the organizer\'s line reaches each seated player privately');
  d.command({ cmd: 'go', author: 'admin' });
  await until(() => sealed, 5000);
  ok(d.absent.join() === 'Dave' && d.hostState().registered.find((r) => r.nick === 'Dave').status === 'absent', 'go: Dave absent');
  ok(sealed && sealed.payload.result.ranking.length === 2, 'go: the game of the two present players');
  const h = d.journal.entries.find((e) => e.type === 'handover');
  ok(h && h.data.reason === 'organizer' && h.data.absent.join() === 'Dave', 'journal: who decided, who was absent');
  f.server.close();
}

// ── disconnections: invited again by itself ──
{
  // Bob drops before sitting and comes back with a new id (26); Alice sits,
  // leaves the table by mistake while still connected, and is invited again.
  const f = await tableServer({
    lobbyIds: [21, 22], game: false,
    onInvite: (id, ctx) => {
      const n = ctx.state.invites.filter((x) => x === id).length;
      if (id === 22) setTimeout(() => { ctx.w(M.lobby(22, true)); setTimeout(() => ctx.w(M.lobby(26)), 60); }, 30);
      if (id === 21 && n === 1) { sit(21, ctx); setTimeout(() => { ctx.state.seats = ctx.state.seats.filter((x) => x !== 21); ctx.w(M.left(21, 0)); }, 120); }
    },
  });
  const d = director(f, ['Alice', 'Bob']);
  d.start();
  await until(() => f.state.invites.indexOf(26) >= 0 && f.state.invites.filter((x) => x === 21).length === 2, 3000);
  ok(f.state.invites.indexOf(26) >= 0, 'a player who dropped is invited again when back (new id)');
  ok(f.state.invites.filter((x) => x === 21).length === 2, 'a player who left the table before the start is invited again');
  ok(d.journal.entries.some((e) => e.type === 'playerDisconnected' && e.data.nick === 'Bob'), 'journal: the drop is recorded');
  d.stop('test');
  f.server.close();
}

// ── a full table is never kept with the director seated ──
{
  // Two registered, table of 3: when it fills, the director leaves at once
  // (on a non-LAN server the full table would start by itself 6 s later).
  const f = await tableServer({ lobbyIds: [21, 22], game: false, onInvite: (id, ctx) => sit(id, ctx) });
  const d = director(f, ['Alice', 'Bob'], { handoverDelayMs: 5000 });
  d.start();
  await until(() => f.state.leaves === 1, 3000);
  ok(f.state.leaves === 1, 'full table: leaves at once, without the usual pause');
  d.stop('test');
  f.server.close();
}

// ── through the service: open the table from the tournament ──
{
  const f = await tableServer({ lobbyIds: [21, 22], onInvite: (id, ctx) => sit(id, ctx) });
  const dir = mkdtempSync(join(tmpdir(), 'arena-host-'));
  writeFileSync(join(dir, 'td-key.pem'), keys.privateKeyPem);
  const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.298', sweepMs: 300,
    servers: async () => [{ ref: 'local', kind: 'local', name: 'Fake', host: '127.0.0.1', port: f.port }] });
  const srv = http.createServer(svc.handler);
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const post = async (p, b) => (await fetch(base + '/admin/arena' + p, { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).json();
  const get = async (p) => (await fetch(base + '/admin/arena' + p, { headers: { Authorization: 'Bearer master' } })).json();
  const t = await post('/t/create', { name: 'Club night', profile: 'club', table: { startMoney: 1500 } });
  ok(t.ok && t.table.startMoney === 1500 && t.table.firstSmallBlind === TABLE_DEFAULTS.firstSmallBlind, 'create: table settings kept');
  const noSrv = await post('/t/table/open', { id: t.id });
  ok(!noSrv.ok && /LAN server/.test(noSrv.error), 'open: needs the tournament\'s server');
  await post('/t/update', { id: t.id, patch: { name: 'Club night' } }).catch(() => {});
  // The server is set at creation in the page; here directly.
  const t2 = await post('/t/create', { name: 'Club night', profile: 'club', server: { ref: 'local', name: 'Fake', host: '127.0.0.1', port: f.port }, table: { startMoney: 1500 } });
  ok(!(await post('/t/table/open', { id: t2.id })).ok, 'open: needs two players');
  await post('/t/player', { id: t2.id, nick: 'Alice' });
  await post('/t/player', { id: t2.id, nick: 'Bob' });
  const op = await post('/t/table/open', { id: t2.id });
  ok(op.ok && op.status === 'running' && op.host && op.host.status === 'open', 'open: the director is at work');
  ok(!(await post('/t/player', { id: t2.id, nick: 'Zed' })).ok, 'players frozen while the table is open');
  ok(!(await post('/t/result', { id: t2.id, source: 'manual', ranking: ['Alice', 'Bob'] })).ok, 'no typed result while the director runs the table');
  const done = await until(async () => { const v = await get('/t/get?id=' + t2.id); return v.status === 'validated' ? v : null; }, 15000);
  ok(!!done && done.result.byDirector && done.result.ranking.map((r) => r.nick).join() === 'Alice,Bob' && done.host.status === 'finished', 'the director\'s result reaches the tournament, validated (club)');
  ok(done && done.checks.signature && done.history.some((h) => /opens the table/.test(h.summary)) && done.history.some((h) => /table finished/.test(h.summary)), 'tournament journal: opened, finished, signed');
  ok(f.state.gi.startMoney === 1500, 'the table had the tournament\'s stack');
  // A line to the table goes through the chat filter's rules.
  const t3 = await post('/t/create', { name: 'Talk', profile: 'club', server: { ref: 'local', name: 'Fake', host: '127.0.0.1', port: f.port } });
  for (const nick of ['Alice', 'Bob']) await post('/t/player', { id: t3.id, nick });
  ok(!(await post('/t/table/say', { id: t3.id, text: 'hello' })).ok, 'say: only while the table is open');
  svc.close(); srv.close(); f.server.close();
  rmSync(dir, { recursive: true, force: true });
}

// ── the director opens the table by itself before the start ──
{
  const f = await tableServer({ lobbyIds: [21, 22], onInvite: (id, ctx) => sit(id, ctx) });
  const dir = mkdtempSync(join(tmpdir(), 'arena-auto-'));
  writeFileSync(join(dir, 'td-key.pem'), keys.privateKeyPem);
  const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.300', sweepMs: 200,
    servers: async () => [{ ref: 'local', kind: 'local', name: 'Fake', host: '127.0.0.1', port: f.port }] });
  const srv = http.createServer(svc.handler);
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const post = async (p, b) => (await fetch(base + '/admin/arena' + p, { method: 'POST', headers: { Authorization: 'Bearer master', 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).json();
  const get = async (p) => (await fetch(base + '/admin/arena' + p, { headers: { Authorization: 'Bearer master' } })).json();
  const srvLocal = { ref: 'local', name: 'Fake', host: '127.0.0.1', port: f.port };
  ok(!(await post('/t/create', { name: 'No date', run: { autoOpen: true } })).ok, 'auto: needs a start date');
  // Starts in an hour, opens 10 min before: not yet.
  const later = await post('/t/create', { name: 'Later', profile: 'club', server: srvLocal, startsAt: Date.now() + 3600000, run: { autoOpen: true, openBefore: 10 } });
  // Starts in 5 min, opens 10 min before: now.
  const soon = await post('/t/create', { name: 'Soon', profile: 'club', server: srvLocal, startsAt: Date.now() + 300000, run: { autoOpen: true, openBefore: 10, announce: false } });
  // An unknown server: it fails, says so once, tries again later.
  const bad = await post('/t/create', { name: 'Nowhere', profile: 'club', server: { ref: 'lan:gone', name: 'Gone', host: 'x', port: 1 }, startsAt: Date.now() + 60000, run: { autoOpen: true } });
  // Long past: never opened, said once.
  const past = await post('/t/create', { name: 'Past', profile: 'club', server: srvLocal, startsAt: Date.now() - 2 * 3600000, run: { autoOpen: true } });
  for (const t of [later, soon, bad, past]) for (const nick of ['Alice', 'Bob']) await post('/t/player', { id: t.id, nick });
  ok(soon.run.autoOpen === true && soon.run.openBefore === 10 && soon.run.announce === false, 'auto: run settings kept');
  const opened = await until(async () => { const v = await get('/t/get?id=' + soon.id); return v.host ? v : null; }, 5000);
  ok(opened && opened.host.by === 'scheduler' && opened.history.some((h) => h.type === 'tableOpened' && h.author === 'scheduler'), 'auto: opened by itself in its window, by « scheduler »');
  const done = await until(async () => { const v = await get('/t/get?id=' + soon.id); return v.status === 'validated' ? v : null; }, 15000);
  ok(!!done && done.result.byDirector, 'auto: played and recorded');
  ok(!f.state.chats.some((c) => /is out|wins the tournament/.test(c)), 'auto: announcements off when the organizer said so');
  await wait(1200);
  const l = await get('/t/get?id=' + later.id), b = await get('/t/get?id=' + bad.id), p = await get('/t/get?id=' + past.id);
  ok(!l.host, 'auto: not before its window');
  ok(!b.host && b.autoTry && /unknown server/.test(b.autoTry.reason) && b.history.filter((h) => h.type === 'autoOpenFailed').length === 1, 'auto: a failure said once, kept for the page');
  ok(!p.host && p.autoTry && p.autoTry.missed && p.history.filter((h) => h.type === 'autoOpenMissed').length === 1, 'auto: a start long past is not opened, said once');
  const ed = await post('/t/update', { id: later.id, patch: { run: { autoOpen: false } } });
  ok(ed.ok && ed.run.autoOpen === false && ed.run.openBefore === 10, 'auto: switched off in Edit');
  svc.close(); srv.close(); f.server.close();
  rmSync(dir, { recursive: true, force: true });
}

console.log(fails ? `\n${fails} FAILED` : '\nall arena-host tests passed');
process.exit(fails ? 1 : 0);
