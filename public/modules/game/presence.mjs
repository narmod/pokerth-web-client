// Who is really online under a given nickname.
//
// A player who reconnects too quickly can be listed twice by the server for a
// while: the dead session (ghost) keeps its old playerId next to the new one,
// under exactly the same name. The ghost refuses every private message with a
// bare ChatRejectMessage, so picking it means the PM is lost.
//
// Two facts make the choice safe:
//   · only the pids in the online set (S._lobbyPids, kept in sync with
//     PlayerList join/leave) are reachable — S.players is a pid->name cache
//     that is never purged when someone leaves, so it also holds every old pid
//     seen this session;
//   · the server hands out session ids in increasing order, so among online
//     homonyms the highest pid is the latest session. My own name is the
//     exception: my session is the one I am, whatever its pid.
//
// Pure functions over plain data (no DOM, no state import), so the rule is
// testable in Node and shared by the PM window and both player lists.

function _toSet(online) {
  if (!online) return new Set();
  if (online instanceof Set) return online;
  return new Set(Array.from(online, function (p) { return parseInt(p, 10); }));
}

function _known(name) {
  return !!name && String(name).charAt(0) !== '#';
}

// The pid to talk to for `name`, or 0 when nobody online carries it.
export function onlinePidByName(players, online, myId, name) {
  if (!name) return 0;
  const set = _toSet(online);
  let best = 0;
  set.forEach(function (pid) {
    if (!players || players[pid] !== name) return;
    if (pid === myId) { best = pid; return; }
    if (best !== myId && pid > best) best = pid;
  });
  return best;
}

// Pids seated at a RUNNING table (netGameStarted = 2). During a rejoin the
// seat keeps the old pid until the server performs it at the next hand, so
// that pid and the new session share a name for a while; both are real.
export function runningSeatPids(games) {
  const out = new Set();
  try {
    for (const id in (games || {})) {
      const g = games[id];
      if (g && g.mode === 2 && g.seats) g.seats.forEach(function (p) { out.add(parseInt(p, 10)); });
    }
  } catch (e) {}
  return out;
}

// The online pids that are only a stale copy of another online session with
// the same name (every homonym but the keeper chosen by onlinePidByName).
// A pid seated at a running table is never one: like upstream
// (LobbyHandler::removeStalePlayerListDuplicates, 31c0166), its session ends
// regularly with the game. `keep` = runningSeatPids(S.games), optional.
export function ghostPids(players, online, myId, keep) {
  const set = _toSet(online);
  const exempt = keep ? _toSet(keep) : new Set();
  const keeper = Object.create(null);
  set.forEach(function (pid) {
    const nm = players ? players[pid] : null;
    if (!_known(nm)) return;
    const cur = keeper[nm];
    if (cur === undefined || pid === myId || (cur !== myId && pid > cur)) keeper[nm] = pid;
  });
  const out = new Set();
  set.forEach(function (pid) {
    const nm = players ? players[pid] : null;
    if (_known(nm) && keeper[nm] !== pid && !exempt.has(pid)) out.add(pid);
  });
  return out;
}

// Bridge for renderPlayersList (pokerth.js, outside the ES modules): reads the
// shared state object at call time.
try {
  window._pthGhostPids = function () {
    const S = window.PthState || {};
    return ghostPids(S.players, S._lobbyPids, S.myId, runningSeatPids(S.games));
  };
} catch (e) {}
