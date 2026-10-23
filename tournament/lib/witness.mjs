// ═══════════════════════════════════════════════════════════════════
// Tournament director — witnesses (service 0.7.0, 2026-10-24).
//
// A web client seated at a tournament table sends, when the game ends or when
// it leaves the table, a PUBLIC summary of what it saw: for each hand, the
// stack of every player still in at the start of the hand, and the winner.
// Never its cards. Design: docs/TOURNAMENT_DIRECTOR.md (Witnesses).
//
// Witnesses check, they never decide: a report is compared with the
// director's own journal (what the server told the spectator) hand by hand,
// or — in manual mode, without a director — with the ranking the organizer
// set. Verdict: « agrees », « disagrees » (with the first difference), or
// « nothing to compare » (no hand in common).
// ═══════════════════════════════════════════════════════════════════

import { GameTracker } from './tracker.mjs';

export const MAX_HANDS = 3000;
const MAX_STACK = 1e12;
const low = (s) => String(s == null ? '' : s).toLowerCase();

function cleanNick(s) {
  let n = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  while (Buffer.byteLength(n, 'utf8') > 64) n = n.slice(0, -1);
  return n;
}

/**
 * A report as received (untrusted): kept to what can be compared.
 * { hands: [{ h, s: { nick: stack } }], winner } — throws on garbage.
 */
export function cleanReport(input) {
  const r = Object.assign({}, input || {});
  // Compact form sent by the web client (fits a keepalive request, 64 KB):
  // { players: [nick…], hands: [[h, stack0, stack1…]] } — null: not in the hand.
  if (Array.isArray(r.players) && Array.isArray(r.hands) && r.hands.every((x) => Array.isArray(x))) {
    const P = r.players.slice(0, 10);
    r.hands = r.hands.map((x) => {
      const s = {};
      P.forEach((nick, i) => { const v = x[i + 1]; if (v != null) s[nick] = v; });
      return { h: x[0], s };
    });
  }
  if (!Array.isArray(r.hands)) throw new Error('no hands');
  if (r.hands.length > MAX_HANDS) throw new Error('too many hands');
  const seen = new Set();
  const hands = [];
  for (const x of r.hands) {
    const h = Number(x && x.h);
    if (!Number.isInteger(h) || h < 1 || h > 100000 || seen.has(h)) continue;
    const s = x.s && typeof x.s === 'object' ? x.s : null;
    if (!s) continue;
    const keys = Object.keys(s);
    if (!keys.length || keys.length > 10) continue;
    const stacks = {};
    let bad = false;
    for (const k of keys) {
      const nick = cleanNick(k), v = Number(s[k]);
      if (!nick || !Number.isInteger(v) || v < 0 || v > MAX_STACK) { bad = true; break; }
      stacks[nick] = v;
    }
    if (bad) continue;
    seen.add(h);
    hands.push({ h, s: stacks });
  }
  hands.sort((a, b) => a.h - b.h);
  const winner = r.winner != null && r.winner !== '' ? cleanNick(r.winner) || null : null;
  return { hands, winner, complete: !!r.complete };
}

/** What the director saw, from its journal: stacks at the start of each hand, by name. */
export function directorFacts(entries) {
  const t = new GameTracker();
  const hands = new Map();
  for (const e of entries || []) {
    if (!e || e.type !== 'game') continue;
    t.apply(e.data);
    if (e.data && e.data.type === 'handStart') {
      const m = new Map();
      for (const [id, stack] of t.startStacks) {
        const name = t.names.get(id);
        if (name) m.set(low(name), { nick: name, stack });
      }
      hands.set(t.hand, m);
    }
  }
  const winner = t.finished && t.winnerId != null ? (t.names.get(t.winnerId) || null) : null;
  return { hands, winner, finished: t.finished, lastHand: t.hand };
}

/** A report against the director's journal. */
export function compareWithDirector(report, facts) {
  let common = 0;
  for (const x of report.hands) {
    const d = facts.hands.get(x.h);
    if (!d) continue;
    common++;
    const w = new Map(Object.keys(x.s).map((k) => [low(k), { nick: k, stack: x.s[k] }]));
    for (const [k, v] of d) {
      const o = w.get(k);
      if (!o) return { verdict: 'disagrees', common, diff: { hand: x.h, nick: v.nick, director: v.stack, witness: null } };
      if (o.stack !== v.stack) return { verdict: 'disagrees', common, diff: { hand: x.h, nick: v.nick, director: v.stack, witness: o.stack } };
    }
    for (const [k, o] of w) if (!d.has(k)) return { verdict: 'disagrees', common, diff: { hand: x.h, nick: o.nick, director: null, witness: o.stack } };
  }
  if (report.winner && facts.winner && low(report.winner) !== low(facts.winner)) {
    return { verdict: 'disagrees', common, diff: { winner: true, director: facts.winner, witness: report.winner } };
  }
  return { verdict: common || (report.winner && facts.winner) ? 'agrees' : 'nothing', common };
}

/**
 * A report against a ranking set without a director (manual, log): the
 * winner, and the order of the eliminations the witness saw (a player still
 * in at hand N was not out before one who left at hand M < N).
 */
export function compareWithRanking(report, ranking) {
  const place = new Map((ranking || []).map((r) => [low(r.nick), r.place]));
  const winnerRow = (ranking || []).find((r) => r.place === 1);
  if (report.winner && winnerRow && low(report.winner) !== low(winnerRow.nick)) {
    return { verdict: 'disagrees', common: report.hands.length, diff: { winner: true, director: winnerRow.nick, witness: report.winner } };
  }
  // Last hand each player was seen in, with chips.
  const last = new Map();
  for (const x of report.hands) for (const k of Object.keys(x.s)) if (x.s[k] > 0) last.set(low(k), { nick: k, hand: x.h });
  const lastHand = report.hands.length ? report.hands[report.hands.length - 1].h : 0;
  const out = [...last.values()].filter((v) => v.hand < lastHand || (report.complete && report.winner && low(v.nick) !== low(report.winner)));
  for (const a of out) {
    for (const b of last.values()) {
      if (b.hand <= a.hand) continue;
      const pa = place.get(low(a.nick)), pb = place.get(low(b.nick));
      if (pa == null || pb == null) continue;
      if (pa < pb) return { verdict: 'disagrees', common: report.hands.length, diff: { order: true, before: a.nick, after: b.nick } };
    }
  }
  return { verdict: report.hands.length || report.winner ? 'agrees' : 'nothing', common: report.hands.length };
}
