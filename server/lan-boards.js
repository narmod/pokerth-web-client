'use strict';
// ═══════════════════════════════════════════════════════════════════
// Per-server LAN leaderboards (web extension, narmod 2026-10-14).
//
// The family leaderboard (/stats) used to be ONE board for the whole proxy:
// every LAN / private-server player of every server landed in it. Each server
// of the LAN directory (server/lan-directory.js) now has a board of its own,
// with its own reset period — chosen by whoever proposed the server, and
// changeable afterwards by the admin only (admin › LAN directory › Edit).
//
// The proxy's historical board (statsStore / stats.json, reset period of
// admin › Leaderboard) stays as the board of everything else: the install's
// own « Local server » and any address typed by hand. Its file, its MySQL
// mirror and its admin controls are untouched.
//
// Storage: LAN_BOARDS_FILE (lan-boards.json next to stats.json):
//   { "<entry id>": { "period": "<period key>", "players": { "<nick>": snapshot } } }
// Snapshots go through the proxy's own sanitizeSnapshot / mergeSnapshot, so a
// board behaves exactly like the historical one (monotonic merge, clamping).
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');

const RESET_PERIODS = Object.freeze(['off', 'daily', 'weekly', 'monthly', 'yearly']);
const ID_RE = /^lan_[a-f0-9]{6,32}$/;
const MAX_PLAYERS = 5000;

// deps:
//   file                      path of lan-boards.json
//   sanitize(d) / merge(a, b) the proxy's snapshot helpers
//   periodKey(period, date)   period marker ('2026-10', '2026-W42'…) or null for 'off'
//   entries()                 the approved directory entries ({ id, resetPeriod, … })
//   now()                     injectable clock (tests)
function createLanBoards(deps) {
  deps = deps || {};
  const now = deps.now || Date.now;
  let data = {};
  try { data = JSON.parse(fs.readFileSync(deps.file, 'utf8')) || {}; } catch (e) { data = {}; }
  if (typeof data !== 'object' || Array.isArray(data)) data = {};
  let saveTimer = null;

  function save() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      fs.writeFile(deps.file, JSON.stringify(data), function (err) {
        if (err) console.error('[lan-boards] write failed:', err.message);
      });
    }, 800);
    if (saveTimer.unref) saveTimer.unref();
  }
  function saveNow() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    try { fs.writeFileSync(deps.file, JSON.stringify(data)); } catch (e) { console.error('[lan-boards] write failed:', e.message); }
  }
  function entry(id) {
    if (!ID_RE.test(String(id || ''))) return null;
    const list = deps.entries ? deps.entries() : [];
    for (let i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }
  function board(id, create) {
    let b = data[id];
    if (!b || typeof b !== 'object' || !b.players || typeof b.players !== 'object') {
      if (!create) return null;
      const e = entry(id);
      b = data[id] = { kind: e ? e.resetPeriod : '', period: e ? (deps.periodKey(e.resetPeriod, new Date(now())) || '') : '', players: {} };
    }
    return b;
  }

  /** Is `id` a board players may read / write (an approved directory entry)? */
  function exists(id) { return !!entry(id); }

  /** { nick: snapshot } of one board ({} when empty or unknown). */
  function get(id) {
    if (!entry(id)) return {};
    const b = board(id, false);
    return b ? b.players : {};
  }
  /** Upsert one player's snapshot. false when the board does not exist. */
  function upsert(id, name, raw) {
    if (!entry(id)) return false;
    const b = board(id, true);
    if (!(name in b.players) && Object.keys(b.players).length >= MAX_PLAYERS) return false;
    b.players[name] = deps.merge(b.players[name], deps.sanitize(raw || {}));
    save();
    return true;
  }
  function remove(id, name) {
    const b = board(id, false);
    if (!b || !(name in b.players)) return false;
    delete b.players[name];
    save();
    return true;
  }
  /** Wipe one board now (admin), and restart its period from today. */
  function reset(id, reason) {
    const e = entry(id);
    if (!e) return false;
    data[id] = { kind: e.resetPeriod, period: deps.periodKey(e.resetPeriod, new Date(now())) || '', players: {} };
    saveNow();
    console.log('[lan-boards] ' + id + ' reset (' + (reason || 'manual') + ')');
    return true;
  }
  /** The entry left the directory: its board goes with it. */
  function drop(id) {
    if (!(id in data)) return;
    delete data[id];
    saveNow();
  }
  /** Hourly: wipe each board whose own period has rolled over. */
  function rotate() {
    const list = deps.entries ? deps.entries() : [];
    const live = new Set();
    let changed = false;
    list.forEach(function (e) {
      if (!e || !ID_RE.test(e.id)) return;
      live.add(e.id);
      const key = deps.periodKey(e.resetPeriod, new Date(now()));
      const b = data[e.id];
      if (!b) return;                                   // nothing recorded yet
      // The admin changed the period: restart the count from now, no wipe.
      if (b.kind !== e.resetPeriod) { b.kind = e.resetPeriod; b.period = key || ''; changed = true; return; }
      if (!key) { if (b.period) { b.period = ''; changed = true; } return; }   // 'off'
      if (!b.period) { b.period = key; changed = true; return; }               // first marker: no wipe
      if (b.period !== key) {
        data[e.id] = { kind: e.resetPeriod, period: key, players: {} };
        changed = true;
        console.log('[lan-boards] ' + e.id + ' reset (scheduled ' + e.resetPeriod + ')');
      }
    });
    // Boards of entries that no longer exist (removed while the proxy was down).
    Object.keys(data).forEach(function (id) { if (!live.has(id)) { delete data[id]; changed = true; } });
    if (changed) saveNow();
  }
  /** Admin summary: one row per directory entry with its player count. */
  function summary() {
    const list = deps.entries ? deps.entries() : [];
    return list.map(function (e) {
      const b = data[e.id];
      return { id: e.id, name: e.name, host: e.host, port: e.port, visible: e.visible !== false,
               resetPeriod: e.resetPeriod, players: b && b.players ? Object.keys(b.players).length : 0 };
    });
  }

  return { exists, get, upsert, remove, reset, drop, rotate, summary, _data: function () { return data; } };
}

module.exports = { createLanBoards, RESET_PERIODS };
