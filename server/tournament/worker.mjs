// ═══════════════════════════════════════════════════════════════════
// Tournament director — one watch, in its own detached process.
//
// Started by server/tournament-manager.js with an IPC channel used ONCE to
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
import { SpectatorDirector } from './spectator.mjs';

function writeAtomic(path, obj) {
  const tmp = path + '.' + process.pid + '.tmp';
  writeFileSync(tmp, JSON.stringify(obj));
  renameSync(tmp, path);
}

export function runWatch(task) {
  const dir = task.dir;
  let privateKeyPem = null;
  try { if (task.keyFile) privateKeyPem = readFileSync(task.keyFile, 'utf8'); } catch (e) {}
  const d = new SpectatorDirector(Object.assign({}, task.opts, { privateKeyPem, version: task.version }));
  const logs = [];
  const state = {
    id: task.id, pid: process.pid, status: 'connecting', startedAt: Date.now(), updatedAt: Date.now(),
    gameId: task.opts.gameId != null ? task.opts.gameId : null, gameName: task.opts.gameName || '',
    hand: 0, players: [], error: null, signed: !!privateKeyPem, logs,
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
    state.updatedAt = Date.now();
    writeAtomic(join(dir, 'state.json'), state);
    dirty = false;
  }
  function soon() { dirty = true; if (!timer) timer = setTimeout(() => { timer = null; if (dirty) snapshot(); }, 300); }
  function log(line) { logs.push(new Date().toISOString().slice(11, 19) + ' ' + line); if (logs.length > 30) logs.shift(); soon(); }
  function saveJournal() { writeAtomic(join(dir, 'journal.json'), d.journal.toJSON()); }

  d.on('log', log);
  d.on('event', (ev) => {
    if (ev.type === 'gameInfo') { state.status = 'waiting'; log('joined table « ' + ev.name + ' » as spectator'); }
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
  process.on('SIGTERM', () => { log('stopped by the organizer'); d.stop('stopped by the organizer'); });
  snapshot();
  d.start();
  return d;
}

// Entry point when forked by the manager.
if (process.send) {
  process.once('message', (task) => {
    try { process.disconnect(); } catch (e) {}
    try { runWatch(task); } catch (e) {
      try { writeAtomic(join(task.dir, 'state.json'), { id: task.id, pid: process.pid, status: 'failed', error: { code: 'startFailed', data: { message: e.message } }, updatedAt: Date.now(), logs: [] }); } catch (e2) {}
      process.exit(1);
    }
  });
}
