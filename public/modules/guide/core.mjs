// ═══════════════════════════════════════════════════════════════════
// Ace's Help — context engine (web extension, narmod 2026-09-30).
//
// No DOM, no mascot, no storage: the page describes where the player is
// (a `where` snapshot, built by modules/guide/index.mjs), the contexts are
// plain data (modules/guide/contexts/*.mjs), and this file decides which
// context speaks, if any. The same rules can be ported to the QML client
// (docs/GUIDE.md). Unit-tested by scripts/test-guide-core.mjs.
//
// where = {
//   helpOn:  boolean   the player turned Ace's Help on
//   screen:  'connect' | 'lobby' | 'wait' | 'create' | 'game' | 'other'
//            ('wait' = seated at a table that has not started, in the lobby)
//   playing: boolean   a hand is being played (the game has started)
//   online:  boolean   connected to a server (not the offline training mode)
//   guest:   boolean   logged in as a guest on pokerth.net
//   ranked:  boolean   the table the player sits at is a Ranking game
//   windows: string[]  ids of the windows open right now (help, ranking…)
// }
//
// context = {
//   id:       'lobby-ranking'           stable key (saved progress, statistics)
//   priority: number                     higher speaks first
//   screens:  ['lobby', …]               where it may speak (or…)
//   window:   'ranking'                  …on the first opening of that window
//   needs:    { online: true, guest: false, ranked: true }   exact matches
//   when:     (where) => boolean         extra condition (optional)
//   manual:   true                       only when asked (never picked here)
//   repeat:   true                       may speak again after being seen
//                                        (an event, e.g. the result of a game)
//   live:     true                       re-rendered when the game list changes
//   fold:     ms                         unanswered bubble folds into the badge
//   steps:    [{ text: 'key', vars?, target?, buttons?: [...], auto?: ms,
//                when?: (where) => boolean, optional?: true }]
//             vars / target may be functions of `where`; target may list
//             several selectors (the first one visible wins); auto = next step
//             after that many ms (waiting-room facts); when = the step exists
//             only then; optional = left out when its target is not on the page
//   tour:     true                       a walk through a form (web.287): the page
//                                        brings each target into view (even off
//                                        screen), « n/N » counter, « Back » button,
//                                        « Later » resumes at the same step
//   row:      '.cf-row'                  tour: outline the target's closest `row`
//   locked:   { sel, text }              tour: when the target sits in `sel`
//                                        (a greyed-out field), `text` is added
// }
// Extra snapshot fields used by the Ranking contexts (L2):
//   net (pokerth.net login), rankPick (ranking-pick.mjs choice, or null),
//   gamesLoaded, waitCount / waitMax (my table), result (my last ranked game)
// ═══════════════════════════════════════════════════════════════════

export const SCREENS = ['connect', 'lobby', 'wait', 'create', 'game', 'other'];
/** Screens where the Ace may speak at all (never during play — D8). */
export const TALK_SCREENS = ['connect', 'lobby', 'wait', 'create'];

/** Can the Ace speak in this situation (whatever the context)? */
export function canSpeak(where) {
  if (!where || !where.helpOn) return false;
  if (where.playing) return false;
  return TALK_SCREENS.indexOf(where.screen) >= 0;
}

/** Does this context apply to this situation (ignoring saved progress)? */
export function applies(ctx, where) {
  if (!ctx || !where) return false;
  if (ctx.window) {
    if (!Array.isArray(where.windows) || where.windows.indexOf(ctx.window) < 0) return false;
  } else if (!Array.isArray(ctx.screens) || ctx.screens.indexOf(where.screen) < 0) {
    return false;
  }
  const needs = ctx.needs || {};
  for (const k of Object.keys(needs)) {
    if (!!where[k] !== !!needs[k]) return false;
  }
  if (typeof ctx.when === 'function') {
    try { if (!ctx.when(where)) return false; } catch (e) { return false; }
  }
  return true;
}

/**
 * The context to show now, or null.
 * @param {object} where
 * @param {object[]} contexts
 * @param {{ seen?: (id: string) => boolean, snoozed?: (id: string) => boolean }} [progress]
 */
export function pickContext(where, contexts, progress = {}) {
  if (!canSpeak(where) || !Array.isArray(contexts)) return null;
  const seen = progress.seen || (() => false);
  const snoozed = progress.snoozed || (() => false);
  let best = null, bestP = -Infinity;
  for (const ctx of contexts) {
    if (!ctx || ctx.manual) continue;
    if (!applies(ctx, where)) continue;
    if ((!ctx.repeat && seen(ctx.id)) || snoozed(ctx.id)) continue;
    const p = Number(ctx.priority) || 0;
    if (p > bestP) { best = ctx; bestP = p; }
  }
  return best;
}

/**
 * The context a tap on the Ace replays: the best one that applies here,
 * already seen or not (snoozed ones included — the player asked).
 */
export function replayContext(where, contexts) {
  return pickContext(where, contexts, {});
}

/**
 * Walks through the steps of one context.
 * run.step() → current step · run.next() → next step or null when finished ·
 * run.prev() → previous step (stays on the first) · run.go(i) → step i.
 * With `where`, steps whose own `when(where)` is false are left out (a tour
 * step that only exists for training, say); `keep(step)` can leave out more
 * (the page decides: a step whose field is not on this screen).
 */
export function createRun(ctx, where, keep) {
  let steps = (ctx && Array.isArray(ctx.steps)) ? ctx.steps : [];
  if (where || keep) {
    steps = steps.filter((s) => {
      if (where && s && typeof s.when === 'function') { try { if (!s.when(where)) return false; } catch (e) { return false; } }
      if (keep) { try { return !!keep(s); } catch (e) { return false; } }
      return true;
    });
  }
  let i = 0;
  return {
    ctx,
    get index() { return i; },
    get count() { return steps.length; },
    step: () => steps[i] || null,
    isLast: () => i >= steps.length - 1,
    next() { i++; return steps[i] || null; },
    prev() { if (i > 0) i--; return steps[i] || null; },
    go(n) { i = Math.max(0, Math.min(steps.length - 1, n | 0)); return steps[i] || null; },
  };
}

/** Fills {name} placeholders; unknown ones are left as they are. */
export function fill(text, vars) {
  if (!vars) return String(text);
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}
