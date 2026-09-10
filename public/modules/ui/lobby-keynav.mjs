// ── lobby-keynav.mjs — liste des tables du lobby au clavier ─────────────────
//
// Parité QML b170786 (LobbyPage.qml, gameListView) : Tab entre dans la liste,
// les flèches changent de table, Entrée l'active comme le double-clic —
// rejoindre en disposition large, afficher les infos de partie en compacte.
// La sélection au clavier n'ouvre PAS le panneau d'infos glissant du mode
// compact (seule l'activation le fait), comme selectRow()/activateRow() du
// QML. Les boutons internes d'une ligne (Rejoindre, Spectateur, ▾) gardent
// leur comportement natif : seules les touches reçues par la liste elle-même
// sont traitées. Suit l'option pth_keynav (Raccourcis clavier).

function _enabled() {
  try { return localStorage.getItem('pth_keynav') !== '0'; } catch (e) { return true; }
}

// Table suivante pour une touche, dans l'ordre affiché (filtre appliqué).
// undefined = touche non gérée ; null = liste vide.
export function stepGid(gids, current, key) {
  var n = gids.length;
  var i = current == null ? -1 : gids.indexOf(String(current));
  switch (key) {
    case 'ArrowDown': return n ? gids[i < 0 ? 0 : Math.min(i + 1, n - 1)] : null;
    case 'ArrowUp':   return n ? gids[i < 0 ? n - 1 : Math.max(i - 1, 0)] : null;
    case 'Home':      return n ? gids[0] : null;
    case 'End':       return n ? gids[n - 1] : null;
  }
  return undefined;
}

// opts : { listId, current() → gid|null, select(gid), activate() }
export function bindLobbyKeynav(opts) {
  document.addEventListener('keydown', function (e) {
    var list = e.target;
    if (!list || list.id !== opts.listId) return;
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!_enabled()) return;
    var rows = list.querySelectorAll('.game-row[data-gid]');
    var gids = Array.prototype.map.call(rows, function (r) { return r.getAttribute('data-gid'); });
    if (e.key === 'Enter') {
      var cur = opts.current();
      if (cur == null || gids.indexOf(String(cur)) < 0) return;   // table filtrée : rien
      e.preventDefault();
      opts.activate();
      return;
    }
    var next = stepGid(gids, opts.current(), e.key);
    if (next === undefined) return;
    e.preventDefault();                       // pas de défilement natif en plus
    if (next == null) return;
    if (String(next) !== String(opts.current())) opts.select(next);
    var row = list.querySelector('.game-row[data-gid="' + next + '"]');
    if (row && typeof row.scrollIntoView === 'function') {
      try { row.scrollIntoView({ block: 'nearest' }); } catch (err) {}
    }
  });
}
