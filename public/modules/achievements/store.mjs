// achievements/store.mjs
// Persistance : localStorage par défaut, backend injectable (tests déterministes).
// Clés stockées sous <prefix> : 'unlocked' (map id->timestamp), 'hands' (int),
// 'beatenSkills' (array). reset() n'efface QUE les succès (rien d'autre).

function memBackend() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, v); },
    removeItem: k => { m.delete(k); },
  };
}

function safeLocal() {
  try {
    if (typeof localStorage !== 'undefined') {
      const k = '__pth_ach_probe';
      localStorage.setItem(k, '1'); localStorage.removeItem(k);
      return localStorage;
    }
  } catch (e) { /* privé / indispo */ }
  return memBackend();
}

export function createStore(opts = {}) {
  const prefix = opts.prefix || 'pth_ach_';
  const be = opts.backend || safeLocal();
  const rd = (k, def) => {
    try { const s = be.getItem(prefix + k); return s == null ? def : JSON.parse(s); }
    catch (e) { return def; }
  };
  const wr = (k, v) => { try { be.setItem(prefix + k, JSON.stringify(v)); } catch (e) {} };

  return {
    isUnlocked: id => (rd('unlocked', {})[id] != null),
    unlock: id => {
      const u = rd('unlocked', {});
      if (u[id] == null) { u[id] = Date.now(); wr('unlocked', u); return true; }
      return false;
    },
    unlockedList: () => Object.keys(rd('unlocked', {})),
    get: k => rd(k, undefined),
    set: (k, v) => wr(k, v),
    bump: (k, d) => { const n = (rd(k, 0) || 0) + d; wr(k, n); return n; },
    reset: () => { ['unlocked', 'hands', 'gamesWon', 'beatenSkills'].forEach(k => { try { be.removeItem(prefix + k); } catch (e) {} }); },
  };
}
