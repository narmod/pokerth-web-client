// ═══════════════════════════════════════════════════════════════════
// Tournament director — one watch, in its own detached process.
//
// Started by tournament/lib/manager.mjs with an IPC channel used ONCE to
// hand over the task (so the table password never touches the disk), then
// disconnected: the process lives on its own and survives a restart of the
// proxy (admin « Update »). Everything it knows goes to files in its own
// folder, written atomically:
//   state.json    live progress (status, hand, players, last lines of log)
//   journal.json  the sealed journal, rewritten at every hand and at the end
//   result.json   ranking + head hash + signature, at the end
// SIGTERM = « stop watching »: the journal is kept, the status says so.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync as readF, existsSync } from 'node:fs';
import { SpectatorDirector } from './spectator.mjs';
import { HostDirector, CLOSED_BY_ORGANIZER } from './host.mjs';

function writeAtomic(path, obj) {
  const tmp = path + '.' + process.pid + '.tmp';
  writeFileSync(tmp, JSON.stringify(obj));
  renameSync(tmp, path);
}

export function runWatch(task) {
  const dir = task.dir;
  let privateKeyPem = null;
  try { if (task.keyFile) privateKeyPem = readFileSync(task.keyFile, 'utf8'); } catch (e) {}
  const host = task.mode === 'host';
  const d = host
    ? new HostDirector(Object.assign({}, task.opts, { privateKeyPem, version: task.version }))
    : new SpectatorDirector(Object.assign({}, task.opts, { privateKeyPem, version: task.version }));
  const logs = [];
  const state = {
    id: task.id, pid: process.pid, status: 'connecting', startedAt: Date.now(), updatedAt: Date.now(),
    gameId: task.opts.gameId != null ? task.opts.gameId : null, gameName: task.opts.gameName || '',
    hand: 0, players: [], error: null, signed: !!privateKeyPem, logs,
    mode: host ? 'host' : 'watch', tournamentId: task.tournamentId || null, host: host ? d.hostState() : null,
  };
  let dirty = false, timer = null;
  function snapshot() {
    const t = d.tracker;
    state.hand = t.hand;
    if (t.gameName) state.gameName = t.gameName;
    if (t.gameId != null) state.gameId = t.gameId;
    state.gaps = t.gaps.slice();
    state.players = t.seats.map((id) => {
      const e = t.elim.get(id);
      return { id, name: t.names.get(id) || '', money: t.money.has(id) ? t.money.get(id) : null, out: e ? { hand: e.hand, unknown: !!e.unknown } : null };
    });
    if (host) { state.host = d.hostState(); if (state.host.gameId != null && state.gameId == null) state.gameId = state.host.gameId; state.gameName = state.gameName || state.host.tableName; }
    state.updatedAt = Date.now();
    writeAtomic(join(dir, 'state.json'), state);
    dirty = false;
  }
  function soon() { dirty = true; if (!timer) timer = setTimeout(() => { timer = null; if (dirty) snapshot(); }, 300); }
  function log(line) { logs.push(new Date().toISOString().slice(11, 19) + ' ' + line); if (logs.length > 30) logs.shift(); soon(); }
  function saveJournal() { writeAtomic(join(dir, 'journal.json'), d.journal.toJSON()); }

  d.on('log', log);
  d.on('host', () => soon());
  // Organizer commands (host mode): lines appended to commands.jsonl by the
  // service, read here once a second — the channel survives a restart of the
  // service, unlike IPC.
  if (host) {
    const cmdFile = join(dir, 'commands.jsonl');
    let seen = 0;
    const poll = setInterval(() => {
      if (!existsSync(cmdFile)) return;
      let lines;
      try { lines = readF(cmdFile, 'utf8').split('\n').filter(Boolean); } catch (e) { return; }
      for (; seen < lines.length; seen++) {
        let c = null;
        try { c = JSON.parse(lines[seen]); } catch (e) {}
        if (c) { log('organizer: ' + c.cmd); d.command(c); }
      }
    }, task.commandPollMs || 1000);
    poll.unref();
  }
  d.on('event', (ev) => {
    if (ev.type === 'gameInfo') { state.status = 'waiting'; if (!host || d.phase === 'watch') log('joined table « ' + ev.name + ' » as spectator'); }
    else if (ev.type === 'gameStart') { state.status = 'running'; log('game started, ' + ev.seats.length + ' players'); }
    else if (ev.type === 'rejoin') { state.status = 'running'; log('synchronised at hand ' + ev.handNum); }
    else if (ev.type === 'handStart') { state.status = 'running'; saveJournal(); }
    else if (ev.type === 'disconnected') log('connection lost');
    else if (ev.type === 'playerLeft') log('player ' + ev.id + ' left (' + ev.reason + ')');
    else if (ev.type === 'endOfGame') log('end of game');
    soon();
  });
  d.on('result', (sealed, journal) => {
    writeAtomic(join(dir, 'journal.json'), journal);
    writeAtomic(join(dir, 'result.json'), sealed);
    state.status = 'finished';
    state.resultStatus = sealed.payload.result.status;
    log('result sealed (' + sealed.payload.result.status + ')');
  });
  d.on('failed', (code, data) => {
    state.status = 'failed';
    state.error = { code, data };
    log('failed: ' + code + (data && data.reason ? ' (' + data.reason + ')' : ''));
  });
  d.on('stopped', (reason) => {
    if (state.status !== 'finished' && state.status !== 'failed') state.status = 'stopped';
    state.stopReason = reason;
    try { saveJournal(); } catch (e) {}
    snapshot();
    setTimeout(() => process.exit(0), 50);
  });
  process.on('SIGTERM', () => { log('stopped by the organizer'); d.stop(CLOSED_BY_ORGANIZER); });
  // Anything unexpected: say so in state.json (and the stack in worker.log),
  // keep the journal, then leave. Without this a crash left no trace but an
  // empty « crashed » watch.
  const die = (kind) => (e) => {
    console.error('[td-worker] ' + kind + ':', e && e.stack ? e.stack : e);
    state.status = 'failed';
    state.error = { code: kind, data: { message: String((e && e.message) || e).slice(0, 300) } };
    log(kind + ': ' + state.error.data.message);
    try { saveJournal(); } catch (e2) {}
    try { snapshot(); } catch (e2) {}
    setTimeout(() => process.exit(1), 50);
  };
  process.on('uncaughtException', die('uncaughtException'));
  process.on('unhandledRejection', die('unhandledRejection'));
  snapshot();
  d.start();
  return d;
}

// Entry point when forked by the manager.
if (process.send) {
  console.error('[td-worker] started, node ' + process.version + ', pid ' + process.pid);
  // No task within 30 s (the manager went away): leave instead of lingering.
  const idle = setTimeout(() => { console.error('[td-worker] no task received, leaving'); process.exit(1); }, 30000);
  process.once('message', (task) => {
    clearTimeout(idle);
    console.error('[td-worker] task ' + task.id + ' received: ' + task.opts.host + ':' + task.opts.port + (task.mode === 'host' ? ' open table « ' + task.opts.tableName + ' »' : ' game ' + task.opts.gameId));
    try { process.disconnect(); } catch (e) {}
    try { runWatch(task); } catch (e) {
      try { writeAtomic(join(task.dir, 'state.json'), { id: task.id, pid: process.pid, status: 'failed', error: { code: 'startFailed', data: { message: e.message } }, updatedAt: Date.now(), logs: [] }); } catch (e2) {}
      process.exit(1);
    }
  });
}
