// ═══════════════════════════════════════════════════════════════════
// Ace's Help — Ranking rules, pure functions (web extension, narmod 2026-09-30).
//
// No DOM, no state: unit-tested by scripts/test-guide-pick.mjs and written
// down in pseudo-code in docs/GUIDE.md, so the QML client can apply exactly
// the same rule and point every player at the SAME table.
// ═══════════════════════════════════════════════════════════════════

/** Game type of a Ranking game (NetGameInfo.netGameType). */
export const RANKED_TYPE = 4;
/** Game list modes (GameListNew / GameListUpdate): 1 open, 2 running, 3 closed. */
export const MODE_OPEN = 1;

/**
 * The Ranking table the Ace suggests: among Ranking tables that are open,
 * not started, not full and without a password, the FULLEST one; on a tie,
 * the oldest (lowest game id — the server numbers games in creation order).
 * Everyone converges on the same table, so it fills up and starts.
 * Guests can neither join nor create Ranking games: always null for them.
 * @param {{id:number, type:number, players:number, max:number, mode:number, started?:boolean, priv?:boolean}[]} games
 * @param {{ guest?: boolean }} [opts]
 * @returns the chosen game, or null
 */
export function pickRankingTable(games, opts = {}) {
  if (opts.guest || !Array.isArray(games)) return null;
  let best = null;
  for (const g of games) {
    if (!g || g.type !== RANKED_TYPE || g.mode !== MODE_OPEN || g.started || g.priv) continue;
    const max = g.max || 10, n = g.players | 0;
    if (n >= max) continue;
    if (!best || n > (best.players | 0) || (n === (best.players | 0) && g.id < best.id)) best = g;
  }
  return best;
}

/** Points by finishing place (pokerth.net ranking server): 15/9/6/4/3/2/1, then 0. */
export const POINTS = [15, 9, 6, 4, 3, 2, 1];
export function pointsFor(place) {
  return place >= 1 && place <= POINTS.length ? POINTS[place - 1] : 0;
}

/**
 * My finishing place, read from two snapshots of the stacks ({ pid: chips },
 * null = unknown) taken at two moments of a game:
 *  · I had chips before and none after → I am out: place = players still
 *    holding chips + 1. If someone else went out in the same step, the order
 *    between us is unknown → { place: null, tied: true } (no guessing).
 *  · I have chips and every other known stack is empty → I won: place 1.
 * @returns {{ place: number|null, tied?: boolean }|null} null = nothing decided yet
 */
export function finishPlace(before, after, me) {
  if (!before || !after || me == null) return null;
  const pids = Object.keys(after).filter((p) => String(p) !== String(me));
  const mineB = before[me], mineA = after[me];
  const known = (v) => typeof v === 'number' && Number.isFinite(v);
  if (known(mineB) && mineB > 0 && known(mineA) && mineA <= 0) {
    let alive = 0, tied = 0;
    for (const p of pids) {
      const a = after[p], b = before[p];
      if (!known(a) || a > 0) alive++;
      else if (known(b) && b > 0) tied++;
    }
    return tied ? { place: null, tied: true } : { place: alive + 1 };
  }
  if (known(mineA) && mineA > 0 && pids.length > 0 && pids.every((p) => known(after[p]) && after[p] <= 0)) {
    return { place: 1 };
  }
  return null;
}
