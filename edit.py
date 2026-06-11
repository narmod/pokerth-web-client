# -*- coding: utf-8 -*-
import io
def read(p): return io.open(p,'r',encoding='utf-8').read()
def write(p,s): io.open(p,'w',encoding='utf-8').write(s)
JS='public/pokerth.js'; CSS='public/pokerth.css'
edits=[]
edits.append((JS,
r"""        // Compter les joueurs (packed varints dans le champ 4)
        let pc = 0;
        if (sub[4]) {
          let pos = 0; const p = sub[4][0];
          while (pos < p.length) { const r = Proto.decodeVarint(p, pos); pos = r.pos; pc++; }
        }""",
r"""        // Liste des joueurs présents (varints packed, champ 4 =
        // playerIds). On garde les IDs pour le panneau dépliable
        // « joueurs à cette table » ; le compteur en découle.
        let _seats = [];
        if (sub[4]) {
          let pos = 0; const p = sub[4][0];
          while (pos < p.length) { const r = Proto.decodeVarint(p, pos); pos = r.pos; _seats.push(r.value); }
        }
        let pc = _seats.length;"""))
edits.append((JS,r"""players:pc, maxPlayers:maxp,""",r"""players:pc, seats:_seats, maxPlayers:maxp,"""))
edits.append((JS,
r"""      case T.GameListPlayerJoined: {
        const id = Proto.u32(sub, 1);
        if (games[id]) { games[id].players++; renderGames(); }
        break;
      }""",
r"""      case T.GameListPlayerJoined: {
        const id  = Proto.u32(sub, 1);
        const pid = Proto.u32(sub, 2);
        if (games[id]) {
          if (!games[id].seats) games[id].seats = [];
          if (pid && games[id].seats.indexOf(pid) === -1) games[id].seats.push(pid);
          games[id].players = games[id].seats.length;
          if (pid && !players[pid] && _openTables.has(String(id)) && !_pendingNameRequests.has(pid)) {
            _pendingNameRequests.add(pid);
            try { send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
          }
          renderGames();
        }
        break;
      }"""))
edits.append((JS,
r"""      case T.GameListPlayerLeft: {
        const id = Proto.u32(sub, 1);
        if (games[id] && games[id].players > 0) { games[id].players--; renderGames(); }
        break;
      }""",
r"""      case T.GameListPlayerLeft: {
        const id  = Proto.u32(sub, 1);
        const pid = Proto.u32(sub, 2);
        if (games[id]) {
          if (games[id].seats) {
            const _ix = games[id].seats.indexOf(pid);
            if (_ix !== -1) games[id].seats.splice(_ix, 1);
            games[id].players = games[id].seats.length;
          } else if (games[id].players > 0) { games[id].players--; }
          renderGames();
        }
        break;
      }"""))
edits.append((JS,
r"""        const name = Proto.str(info, 1);
        if (name) players[pid] = name;""",
r"""        const name = Proto.str(info, 1);
        if (name) players[pid] = name;
        // Rafraîchir un panneau « joueurs à cette table » en attente de ce pseudo.
        if (name && _openTables.size && _tableHasPid(pid)) renderGames();"""))
edits.append((JS,r"""  let loaded    = false;""",
r"""  let _openTables = new Set(); // gids whose lobby player-list panel is expanded
  let loaded    = false;"""))
edits.append((JS,r"""  function renderGames() {""",
r"""  // ── Liste dépliable des joueurs par table (lobby) ─────────────
  // GameListNew fournit l'ENSEMBLE des IDs joueurs de chaque table
  // (champ 4, playerIds) — pas leur position de siège — donc on liste
  // qui est présent et on demande à la volée les pseudos inconnus
  // (même déduplication que le roster des joueurs en ligne).
  function renderTablePlayers(gid) {
    const g = games[gid];
    if (!g) return '';
    const seats = (g.seats || []);
    if (!seats.length) return '<div class="gp-empty">' + t('tablePlayersEmpty') + '</div>';
    return seats.map(function(pid){
      const nm = players[pid];
      if (!nm && !_pendingNameRequests.has(pid)) {
        _pendingNameRequests.add(pid);
        try { send(Proto.encode([[1,0,T.PlayerInfoRequest],[19,2,Proto.encode([[1,0,pid]])]])); } catch(e) {}
      }
      const flag = _ccToFlag(_playerCountries[pid], 'gp-flag');
      const label = nm ? esc(nm) : '#' + pid;
      return '<span class="gp-player' + (nm ? '' : ' gp-pending') + '">' + flag + '<span class="gp-name">' + label + '</span></span>';
    }).join('');
  }
  function _tableHasPid(pid) {
    for (const k of _openTables) {
      const g = games[k];
      if (g && g.seats && g.seats.indexOf(pid) !== -1) return true;
    }
    return false;
  }

  function renderGames() {"""))
edits.append((JS,
r"""      return '<div class="game-row gcard" onclick="App.joinGame(' + parseInt(gid) + ')">'""",
r"""      return '<div class="game-row gcard" onclick="App.toggleTablePlayers(' + parseInt(gid) + ')">'"""))
edits.append((JS,
r"""        + '<div class="gcard-btns">' + joinBtn + watchBtn + '</div>'
        + '</div>';""",
r"""        + '<div class="gcard-btns">' + joinBtn + watchBtn + '</div>'
        + '</div>'
        + '<div class="game-players' + (_openTables.has(String(gid)) ? ' open' : '') + '" id="gp-' + parseInt(gid) + '"' + (_openTables.has(String(gid)) ? '' : ' hidden') + '>'
        + (_openTables.has(String(gid)) ? renderTablePlayers(gid) : '')
        + '</div>';"""))
edits.append((JS,
r"""    joinGame(gameId) {
      const g = games[gameId];
      if (!g) return;""",
r"""    toggleTablePlayers(gid) {
      const key = String(gid);
      if (_openTables.has(key)) _openTables.delete(key); else _openTables.add(key);
      renderGames();
    },
    joinGame(gameId) {
      const g = games[gameId];
      if (!g) return;"""))
edits.append((CSS,
r""".game-row.gcard .btn-join:hover { background: rgba(var(--green-rgb), 0.28); }""",
r""".game-row.gcard .btn-join:hover { background: rgba(var(--green-rgb), 0.28); }

/* Liste dépliable des joueurs d'une table (clic sur la carte) */
.game-players {
  margin: -7px 0 10px;
  padding: 9px 12px 11px;
  background: var(--inset);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  animation: gpReveal 0.18s ease;
}
.game-players[hidden] { display: none; }
.gp-player {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 4px 9px;
  background: var(--inset-hi);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.8rem;
  line-height: 1.2;
}
.gp-player .gp-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gp-player.gp-pending { opacity: 0.55; }
.cc-flag.gp-flag { width: 18px; height: auto; border-radius: 2px; flex: 0 0 auto; }
.gp-empty { opacity: 0.6; font-size: 0.8rem; padding: 2px 0; }
@keyframes gpReveal { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }"""))
edits.append(('public/modules/lang/en.mjs',
r"""    noTablesAvailable:'No tables available right now.',""",
r"""    noTablesAvailable:'No tables available right now.',
    tablePlayersEmpty:'No players seated.',"""))
edits.append(('public/modules/lang/fr.mjs',
r"""    noTablesAvailable:'Aucune table disponible actuellement.',""",
r"""    noTablesAvailable:'Aucune table disponible actuellement.',
    tablePlayersEmpty:'Aucun joueur assis.',"""))
edits.append(('public/sw.js',r"""const CACHE_VERSION = 'pokerth-v0.2.416';""",r"""const CACHE_VERSION = 'pokerth-v0.2.417';"""))
edits.append((JS,r"""window.BUILD_VERSION='0.2.416'""",r"""window.BUILD_VERSION='0.2.417'"""))
edits.append(('package.json',r""""version": "0.2.416",""",r""""version": "0.2.417","""))
cache={}
def getf(p):
    if p not in cache: cache[p]=read(p)
    return cache[p]
for i,(p,old,new) in enumerate(edits,1):
    s=getf(p); c=s.count(old)
    assert c==1, "EDIT %d FAIL %s count=%d"%(i,p,c)
    cache[p]=s.replace(old,new,1)
for p,s in cache.items(): write(p,s)
print("EDITS_OK")
