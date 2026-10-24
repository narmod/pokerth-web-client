// ═══════════════════════════════════════════════════════════════════
// Tournament director — collusion check (service 0.10.0, 2026-10-24).
//
// From the director's journal (« handLog » events: who did what in each hand,
// who won it, with or without a showdown — public facts, never hole cards),
// look for pairs of players who spare each other or pass chips to each other.
// It SIGNALS, with the numbers behind each signal, for an organizer to judge:
// it never changes a result nor sanctions anyone. Small samples prove
// nothing, so every signal has a minimum number of occasions.
//
// Signals, for a pair A–B:
//   soft play     post-flop heads-up between A and B checked down to the
//                 end, again and again (while they bet against the others)
//   no pressure   A almost never raises B, but raises the others
//   folds to B    A folds to B's bets far more often than to the others'
//   chip passing  A puts much of his stack in, then folds to B, who takes
//                 the pot without a showdown
// Design: docs/ARENA.md (Collusion check).
// ═══════════════════════════════════════════════════════════════════

import { GameTracker } from './tracker.mjs';

const FOLD = 1, CHECK = 2, CALL = 3, BET = 4, RAISE = 5, ALLIN = 6;
const AGGR = new Set([BET, RAISE, ALLIN]);

// Thresholds: kept here, explained in the docs, shown with each signal.
export const LIMITS = Object.freeze({
  softMin: 3, softShare: 0.8,           // heads-up post-flop hands, share checked down
  pressMin: 8, pressOthersMin: 0.2,      // facing B's bets: occasions; A's raise rate against the others
  foldMin: 6, foldShare: 0.85, foldOthersMax: 0.5,
  dumpShare: 0.4, dumpBig: 0.6,          // share of A's stack put in before folding to B
});

function key(a, b) { return a < b ? a + '\u0000' + b : b + '\u0000' + a; }

/**
 * entries: the director's journal. Returns { hands, players, pairs: [...], flags }.
 * pairs: [{ a, b, signals: [{ kind, level: 'flag'|'note', text, n, … }] }] — only pairs with something.
 */
export function analyzeCollusion(entries) {
  const t = new GameTracker();
  const hands = [];
  let start = null;
  for (const e of entries || []) {
    if (!e || e.type !== 'game') continue;
    t.apply(e.data);
    if (e.data.type === 'handStart') start = new Map(t.startStacks);
    if (e.data.type === 'handLog' && Array.isArray(e.data.actions)) hands.push({ hand: e.data.hand, actions: e.data.actions, winners: e.data.winners || [], showdown: !!e.data.showdown, start: start || new Map() });
  }
  const name = (id) => t.names.get(id) || ('#' + id);
  const soft = new Map();     // pair → { n, checked }
  const softOthers = new Map();   // player → { n, checked } heads-up post-flop against anyone
  const facing = new Map();   // 'A>B' → { n, raise, fold }
  const facingAll = new Map(); // A → { n, raise, fold }
  const dumps = new Map();    // 'A>B' → [{ hand, share, amount }]
  const bump = (m, k, f) => { const o = m.get(k) || { n: 0, checked: 0, raise: 0, fold: 0 }; f(o); m.set(k, o); };

  for (const h of hands) {
    const acts = h.actions.filter((a) => Array.isArray(a) && a.length >= 4);
    const folded = new Set();
    const put = new Map();        // total put in by each player (rounds summed)
    const roundBet = new Map();
    let round = -1, lastAggr = null;
    let postflopAggr = false, inAtFlop = null;
    for (const [id, rd, act, bet] of acts) {
      if (rd !== round) {
        for (const [p, b] of roundBet) put.set(p, (put.get(p) || 0) + b);
        roundBet.clear();
        round = rd; lastAggr = null;
        if (rd >= 1 && inAtFlop == null) inAtFlop = [...h.start.keys()].filter((p) => !folded.has(p));
      }
      // Facing a bet: the last aggressor of the round, if any.
      if (lastAggr != null && lastAggr !== id && (act === FOLD || act === CALL || AGGR.has(act))) {
        const k = id + '>' + lastAggr;
        bump(facing, k, (o) => { o.n++; if (AGGR.has(act)) o.raise++; if (act === FOLD) o.fold++; });
        bump(facingAll, id, (o) => { o.n++; if (AGGR.has(act)) o.raise++; if (act === FOLD) o.fold++; });
        if (act === FOLD) {
          const invested = (put.get(id) || 0) + (roundBet.get(id) || 0);
          const st = h.start.get(id) || 0;
          const w = h.winners.length === 1 ? h.winners[0][0] : null;
          if (st > 0 && invested / st >= LIMITS.dumpShare && w === lastAggr && !h.showdown) {
            const k2 = id + '>' + lastAggr;
            const arr = dumps.get(k2) || []; arr.push({ hand: h.hand, share: invested / st, amount: invested }); dumps.set(k2, arr);
          }
        }
      }
      if (act === FOLD) folded.add(id);
      if (bet != null) roundBet.set(id, Math.max(roundBet.get(id) || 0, bet));
      if (AGGR.has(act)) { lastAggr = id; if (rd >= 1) postflopAggr = true; }
    }
    // Heads-up after the flop: exactly two players saw it, and acted on it.
    if (inAtFlop && inAtFlop.length === 2 && acts.some((a) => a[1] >= 1)) {
      const [a, b] = inAtFlop;
      bump(soft, key(a, b), (o) => { o.n++; if (!postflopAggr) o.checked++; o.a = a; o.b = b; });
      for (const p of [a, b]) bump(softOthers, p, (o) => { o.n++; if (!postflopAggr) o.checked++; });
    }
  }

  const pairs = new Map();
  const add = (a, b, sig) => {
    const k = key(a, b);
    const p = pairs.get(k) || { a: name(Math.min(a, b)), b: name(Math.max(a, b)), signals: [] };
    p.signals.push(sig); pairs.set(k, p);
  };
  const pct = (x) => Math.round(x * 100) + ' %';

  for (const o of soft.values()) {
    if (o.n < LIMITS.softMin) continue;
    const share = o.checked / o.n;
    if (share < LIMITS.softShare) continue;
    // Against everyone else: the same two players' heads-up hands minus these.
    const oa = softOthers.get(o.a), ob = softOthers.get(o.b);
    const restN = (oa.n - o.n) + (ob.n - o.n), restC = (oa.checked - o.checked) + (ob.checked - o.checked);
    const rest = restN ? restC / restN : null;
    add(o.a, o.b, { kind: 'softPlay', level: rest == null || rest <= 0.5 ? 'flag' : 'note', n: o.n, share, others: rest,
      text: 'heads-up after the flop ' + o.n + ' times, checked down to the end ' + pct(share) + (rest == null ? '' : ' (against the others: ' + pct(rest) + ')') });
  }
  for (const [k, o] of facing) {
    const [a, b] = k.split('>').map(Number);
    const all = facingAll.get(a);
    const othersN = all.n - o.n;
    if (o.n >= LIMITS.pressMin && othersN >= LIMITS.pressMin) {
      const rB = o.raise / o.n, rO = (all.raise - o.raise) / othersN;
      if (o.raise === 0 && rO >= LIMITS.pressOthersMin) {
        add(a, b, { kind: 'noPressure', level: 'note', from: name(a), to: name(b), n: o.n, rate: rB, others: rO,
          text: name(a) + ' never raised ' + name(b) + ' (' + o.n + ' times facing a bet) but raised the others ' + pct(rO) });
      }
    }
    if (o.n >= LIMITS.foldMin && othersN >= LIMITS.foldMin) {
      const fB = o.fold / o.n, fO = (all.fold - o.fold) / othersN;
      if (fB >= LIMITS.foldShare && fO <= LIMITS.foldOthersMax) {
        add(a, b, { kind: 'foldsTo', level: 'note', from: name(a), to: name(b), n: o.n, rate: fB, others: fO,
          text: name(a) + ' folded to ' + name(b) + ' ' + pct(fB) + ' of ' + o.n + ' times, to the others ' + pct(fO) });
      }
    }
  }
  for (const [k, arr] of dumps) {
    const [a, b] = k.split('>').map(Number);
    const big = arr.filter((x) => x.share >= LIMITS.dumpBig);
    if (arr.length >= 2 || big.length) {
      add(a, b, { kind: 'chipPassing', level: 'flag', from: name(a), to: name(b), n: arr.length, hands: arr.map((x) => x.hand),
        text: name(a) + ' put ' + arr.map((x) => pct(x.share)).join(', ') + ' of his stack in, then folded to ' + name(b) + ' (hand' + (arr.length > 1 ? 's ' : ' ') + arr.map((x) => x.hand).join(', ') + ', no showdown)' });
    }
  }
  // Two notes on the same pair (both directions, or two kinds) make a flag.
  const out = [...pairs.values()].map((p) => {
    const kinds = new Set(p.signals.map((s) => s.kind + ':' + (s.from || '')));
    const level = p.signals.some((s) => s.level === 'flag') || kinds.size >= 2 ? 'flag' : 'note';
    return { a: p.a, b: p.b, level, signals: p.signals };
  }).sort((x, y) => (x.level === y.level ? 0 : x.level === 'flag' ? -1 : 1));
  return { hands: hands.length, players: t.seats.length, pairs: out, flags: out.filter((p) => p.level === 'flag').length, limits: LIMITS };
}
