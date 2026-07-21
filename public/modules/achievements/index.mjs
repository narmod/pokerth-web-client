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
    unlocked: store.unlockedList().length,
    total: ACHIEVEMENTS.length,
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
