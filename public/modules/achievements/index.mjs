// achievements/index.mjs
// API publique du système de succès — mode-agnostique.
//
//   const ach = createAchievements({ onUnlock: a => toast(a) });
//   ach.observe(ev, { meId });      // ev = event du moteur (voir tracker.mjs)
//   ach.snapshot();                 // [{id,icon,cat,unlocked}]  (pour la page Trophées)
//   ach.reset();                    // efface la progression
//
// Aucune dépendance à l'offline ni au réseau : il suffit qu'une source émette
// le vocabulaire d'events décrit dans tracker.mjs.

import { ACHIEVEMENTS } from './defs.mjs';
import { createSession, reduce } from './tracker.mjs';
import { createStore } from './store.mjs';

export { ACHIEVEMENTS, CATS } from './defs.mjs';

// Succès « secret » (easter eggs) : exclus des compteurs unlocked/total pour
// que le méta-succès Collectionneur garde exactement sa sémantique d'avant.
const SECRET_IDS = new Set(ACHIEVEMENTS.filter(d => d.cat === 'secret').map(d => d.id));

export function createAchievements(opts = {}) {
  const store = opts.store || createStore(opts.storeOpts);
  const onUnlock = typeof opts.onUnlock === 'function' ? opts.onUnlock : () => {};
  const now = opts.now || (() => Date.now());
  const S = createSession();

  const buildView = () => ({
    counters: {
      hands: store.get('hands') || 0,
      gamesWon: store.get('gamesWon') || 0,
      beatenSkills: store.get('beatenSkills') || [],
      wonStyles: store.get('wonStyles') || [],
    },
    game: S.game,
    hand: S.hand,
    place: S.place,
    hour: S._hour,
    unlocked: store.unlockedList().filter(id => !SECRET_IDS.has(id)).length,
    total: ACHIEVEMENTS.length - SECRET_IDS.size,
  });

  function evaluate(when) {
    const v = buildView();
    for (const def of ACHIEVEMENTS) {
      if (def.when !== when || store.isUnlocked(def.id)) continue;
      let ok = false;
      try { ok = !!def.test(v); } catch (e) { ok = false; }
      if (ok && store.unlock(def.id)) onUnlock({ id: def.id, icon: def.icon, cat: def.cat });
    }
  }

  return {
    observe(ev, ctx) {
      const moments = reduce(S, ev, ctx && ctx.meId, store, now, ctx && ctx.style);
      for (const w of moments) evaluate(w);
      evaluate('always');   // méta-succès (ex. Collectionneur), après mise à jour du reste
    },
    snapshot() {
      return ACHIEVEMENTS.map(d => ({
        id: d.id, icon: d.icon, cat: d.cat, players: d.players || null,
        unlocked: store.isUnlocked(d.id),
      }));
    },
    unlockedCount() { return store.unlockedList().length; },
    total() { return ACHIEVEMENTS.length; },
    reset() { store.reset(); Object.assign(S, createSession()); },
  };
}

// Déblocage direct d'un succès SECRET (easter eggs — ex. code Konami), hors
// tracker : fonctionne dans TOUS les modes (le store est purement local).
// Renvoie { id, icon, cat } si le succès vient d'être débloqué, sinon null.
export function grantSecret(id, opts = {}) {
  const def = ACHIEVEMENTS.find(d => d.id === id && d.cat === 'secret');
  if (!def) return null;
  const store = opts.store || createStore(opts.storeOpts);
  return store.unlock(def.id) ? { id: def.id, icon: def.icon, cat: def.cat } : null;
}
