// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/scoreboard.mjs — « Play nearby » evening scoreboard
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// The host of a nearby game keeps ONE scoreboard for the evening and sends it
// to every player. It works like the LAN leaderboard, without a proxy and
// without persistence:
//
//   · columns: the LAN leaderboard's own (handsPlayed, handsWon, net, bigWin,
//     bigLoss, gamesPlayed, gamesWon, bestStreak, streak), so the existing
//     board view can show it;
//   · it adds up from one game to the next while the SAME humans play: the
//     line-up is the set of human nicknames seated when a game starts. Bots
//     are ignored, both in that comparison and on the board;
//   · a game that starts with a different line-up wipes it;
//   · nothing is stored: it lives in the host's memory and is gone when the
//     host leaves.
//
// Pure: no DOM, no network, no clock. Tested by scripts/test-nearby.mjs.
// ─────────────────────────────────────────────────────────────────────────

/** Version of the snapshot sent to the players (bumped on any shape change). */
export const SCOREBOARD_VERSION = 1;

function blank() {
  return { handsPlayed: 0, handsWon: 0, net: 0, bigWin: 0, bigLoss: 0,
           gamesPlayed: 0, gamesWon: 0, bestStreak: 0, streak: 0 };
}

/** Canonical line-up key: the human nicknames, sorted, case kept. */
export function lineupKey(names) {
  return (names || []).map(String).slice().sort().join('\u0000');
}

export function createScoreboard() {
  /** @type {string|null} */
  let lineup = null;
  /** @type {string[]} */
  let lineupNames = [];
  /** @type {Map<string, ReturnType<typeof blank>>} */
  let rows = new Map();

  function row(name) {
    let r = rows.get(name);
    if (!r) { r = blank(); rows.set(name, r); }
    return r;
  }

  return {
    /**
     * A game starts with these humans seated. Returns true when the board
     * was wiped (first game, or a different line-up).
     * @param {string[]} humanNames
     */
    startGame(humanNames) {
      const key = lineupKey(humanNames);
      const reset = key !== lineup;
      if (reset) {
        rows = new Map();
        lineup = key;
        lineupNames = (humanNames || []).map(String).slice().sort();
        for (const n of lineupNames) row(n);
      }
      return reset;
    },
    /**
     * One hand played by a human. `won` = took (part of) a pot; `delta` =
     * stack after the hand minus stack before it.
     * @param {string} name @param {boolean} won @param {number} delta
     */
    recordHand(name, won, delta) {
      if (!lineup || !rows.has(name)) return;
      const s = row(name);
      const d = Number(delta) || 0;
      s.handsPlayed++;
      if (won) { s.handsWon++; s.streak++; if (s.streak > s.bestStreak) s.bestStreak = s.streak; }
      else s.streak = 0;
      s.net += d;
      if (d > s.bigWin) s.bigWin = d;
      if (d < s.bigLoss) s.bigLoss = d;
    },
    /** End of a game for one human of the line-up. @param {string} name @param {boolean} won */
    recordGame(name, won) {
      if (!lineup || !rows.has(name)) return;
      const s = row(name);
      s.gamesPlayed++;
      if (won) s.gamesWon++;
    },
    reset() { rows = new Map(); lineup = null; lineupNames = []; },
    /** Plain object sent to the players: games won, then net, then name. */
    snapshot() {
      const list = [];
      for (const [name, s] of rows) list.push(Object.assign({ name }, s));
      list.sort((a, b) => (b.gamesWon - a.gamesWon) || (b.net - a.net) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
      return { v: SCOREBOARD_VERSION, lineup: lineupNames.slice(), rows: list };
    },
  };
}
