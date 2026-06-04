/** Heuristic + Monte-Carlo bot decision for the offline (Training-mode) engine.
 *  Pure & deterministic given bot.rng.
 *
 *  Strength is a real win-probability (equity) estimated by Monte-Carlo rollout
 *  against the *actual number of opponents still in the hand*, reusing the
 *  engine's bestHand() evaluator — so draws, board texture and multiway spots
 *  are all valued correctly. On top of that:
 *    • short stacks (<= ~8 BB-equiv) switch to correct shove-or-fold play;
 *    • a difficulty level (bot.skill) tunes MC precision, hand-reading noise,
 *      whether push/fold is used, and bluff frequency.
 */
import { ACT, bestHand } from './engine.mjs';

// Small fast PRNG (mulberry32). Seeded once per decision from bot.rng so the
// rollout is reproducible AND we touch the engine's shared rng only once,
// instead of draining hundreds of values from the deck-shuffling stream.
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cmpScore(a,b){ for(let i=0;i<Math.max(a.length,b.length);i++){ const x=a[i]||0,y=b[i]||0; if(x!==y) return x-y; } return 0; }

/**
 * Win probability of `hole` vs `opp` random opponents given `board`
 * (0/3/4/5 community cards already known). Ties split the pot fairly.
 * Deterministic given `rng`.
 */
export function equityMC(hole, board, opp, samples, rng){
  opp = Math.max(1, Math.min(opp, 5));        // cap opponents modelled (bounds cost)
  const known = new Set([...hole, ...board]);
  const deck = [];
  for(let c=0;c<52;c++) if(!known.has(c)) deck.push(c);
  const needBoard = 5 - board.length;
  const need = needBoard + opp*2;
  let equity = 0;
  for(let s=0;s<samples;s++){
    // partial Fisher–Yates: only shuffle the cards we consume this sample
    const d = deck;
    for(let i=0;i<need;i++){
      const j = i + Math.floor(rng()*(d.length-i));
      const tmp=d[i]; d[i]=d[j]; d[j]=tmp;
    }
    const fullBoard = needBoard ? board.concat(d.slice(0, needBoard)) : board;
    let k = needBoard;
    const my = bestHand(hole.concat(fullBoard));
    let beat = true, tied = 0;
    for(let o=0;o<opp;o++){
      const os = bestHand([d[k++], d[k++]].concat(fullBoard));
      const c = cmpScore(os, my);
      if(c>0){ beat=false; break; }
      if(c===0) tied++;
    }
    if(beat) equity += tied>0 ? 1/(tied+1) : 1;   // split fairly on ties
  }
  return equity / samples;
}

// Difficulty presets. samples = MC precision; noise = hand-reading error
// (beginner bots misjudge equity); pushfold = use correct short-stack play;
// bluffMul = bluff-frequency multiplier.
const SKILLS = {
  easy:   { samples: 60,  noise: 0.20, pushfold: false, bluffMul: 0.5 },
  normal: { samples: 260, noise: 0.06, pushfold: true,  bluffMul: 1.0 },
  hard:   { samples: 650, noise: 0.00, pushfold: true,  bluffMul: 1.4 },
};
export function skillOf(s){ return (s && SKILLS[s]) ? SKILLS[s] : SKILLS.normal; }

// Player archetypes — a *style* layer orthogonal to skill. Skill tunes how well
// a bot reads equity; the archetype tunes how it plays:
//   aggrLo/aggrHi = range the per-bot aggression is drawn from;
//   callMargin    = equity cushion required to call a bet (default 0.04);
//   bluffMul      = style bluff-frequency multiplier (on top of skill.bluffMul);
//   weight        = relative frequency at a freshly filled table.
export const ARCHETYPES = {
  rock:    { weight: 15, aggrLo: 0.15, aggrHi: 0.30, callMargin:  0.10, bluffMul: 0.2, entryEq: 0.63, openMul: 1.30 },
  tag:     { weight: 30, aggrLo: 0.55, aggrHi: 0.75, callMargin:  0.05, bluffMul: 1.0, entryEq: 0.55, openMul: 1.80 },
  lag:     { weight: 20, aggrLo: 0.70, aggrHi: 0.95, callMargin:  0.00, bluffMul: 1.6, entryEq: 0.45, openMul: 0.65 },
  station: { weight: 20, aggrLo: 0.10, aggrHi: 0.25, callMargin: -0.06, bluffMul: 0.3, entryEq: 0.00, openMul: 0.03 },
  maniac:  { weight: 15, aggrLo: 0.85, aggrHi: 1.00, callMargin: -0.02, bluffMul: 2.4, entryEq: 0.08, openMul: 0.55 },
};

// Deterministic weighted archetype pick. Consumes exactly two rng() values
// (one for the profile, one for the aggression draw). Returns a ready-to-use
// style bundle to merge into a bot config.
export function pickArchetype(rng){
  const r = rng || Math.random;
  const names = Object.keys(ARCHETYPES);
  let total = 0; for (const n of names) total += ARCHETYPES[n].weight;
  let x = r() * total, name = names[names.length - 1];
  for (const n of names){ x -= ARCHETYPES[n].weight; if (x < 0){ name = n; break; } }
  const A = ARCHETYPES[name];
  const aggr = A.aggrLo + r() * (A.aggrHi - A.aggrLo);
  return { arch: name, aggr, callMargin: A.callMargin, bluffMul: A.bluffMul, entryEq: A.entryEq, openMul: A.openMul };
}

// ctx = the engine 'turn' event payload.
// bot = { aggr:0..1, rng, skill:'easy'|'normal'|'hard' }
export function decide(ctx, bot){
  bot = bot || {};
  const rng = bot.rng || Math.random;
  const a   = bot.aggr!=null ? bot.aggr : 0.5;
  const sk  = skillOf(bot.skill);
  const mc  = mulberry32((Math.floor(rng()*4294967296) ^ 0x9e3779b9) >>> 0); // isolated rollout rng
  const L = ctx.legal, pot = L.pot, toCall = L.callAmt;
  const board = ctx.board || [];
  const potOdds = toCall/(pot+toCall);

  // equity vs `opp` opponents, with difficulty-scaled precision + misjudgement
  const eq = (opp)=>{
    const n = Math.max(40, Math.round(sk.samples / Math.sqrt(Math.max(1,opp))));
    let e = equityMC(ctx.hole, board, opp, n, mc);
    if (sk.noise > 0){ e += (mc()*2-1)*sk.noise; e = Math.max(0, Math.min(1, e)); }
    return e;
  };

  const raiseTo = ()=>{ const t=Math.round(L.minRaiseTo + pot*(0.4+a*0.5)); return Math.max(L.minRaiseTo, Math.min(L.maxRaiseTo, t)); };
  const jam     = ()=> ({ action: ACT.RAISE, amountTo: L.maxRaiseTo });

  // ── Short-stack push/fold (skill-gated) ──────────────────────────────────
  // Below ~8 big-blind-equivalents, correct play is shove-or-fold, not limp.
  const M = ctx.mRatio!=null ? ctx.mRatio : 99;
  if (sk.pushfold && M <= 8 && L.canRaise){
    const shoveEq = eq(1);                                       // ~one caller assumed
    const late = (ctx.numPlayers && ctx.posFromButton!=null) ? (ctx.posFromButton <= 1) : false;
    let need = 0.50 + (M/8)*0.12 - (late?0.06:0) - a*0.04;        // looser when shorter / in position
    need = Math.max(0.42, Math.min(0.66, need));
    if (L.canCheck) return (shoveEq > need + 0.06) ? jam() : { action: ACT.CHECK };  // BB free option
    if (shoveEq > need) return jam();
    if (shoveEq > potOdds + 0.02) return { action: ACT.CALL };   // priced-in call
    return { action: ACT.FOLD };
  }

  // ── Normal play (equity vs the real field) ───────────────────────────────
  const opp = Math.max(1, (ctx.numActive || 2) - 1);
  const str = eq(opp);
  const cm  = bot.callMargin != null ? bot.callMargin : 0.04;
  const om  = bot.openMul    != null ? bot.openMul    : 1;
  const bm  = bot.bluffMul   != null ? bot.bluffMul   : 1;
  const preflop = ((L.street || ctx.gameState) === 'preflop');
  const pRaise  = Math.min(0.92, a * om);             // PRE-FLOP raise propensity (PFR), openMul-tuned
  const pPost   = Math.min(0.92, a * 0.9);            // POST-FLOP raise propensity, aggr-driven (decoupled)
  const bluff   = ()=> (L.canRaise && rng() < 0.05*a*sk.bluffMul*bm && L.maxRaiseTo > toCall*3);

  // Pre-flop: entryEq gates how wide a profile enters (VPIP); pRaise drives PFR.
  if (preflop){
    const entry = bot.entryEq != null ? bot.entryEq : 0;
    if (L.canCheck){                                  // free option (BB, unraised pot)
      if (str >= entry && L.canRaise && rng() < pRaise) return { action:ACT.RAISE, amountTo:raiseTo() };
      return { action:ACT.CHECK };
    }
    const floor = Math.max(entry, potOdds + cm);      // need the range OR the price to continue
    if (str < floor){
      if (bluff()) return { action:ACT.RAISE, amountTo:raiseTo() };   // rare light open
      return { action:ACT.FOLD };
    }
    if (L.canRaise && rng() < pRaise) return { action:ACT.RAISE, amountTo:raiseTo() };
    return { action:ACT.CALL };
  }

  // Post-flop: raise frequency scales with the same aggr×openMul lever.
  if (L.canCheck){
    if (str>0.85 && L.canRaise) return { action:ACT.RAISE, amountTo:raiseTo() };
    if (str>0.58 && L.canRaise && rng() < pPost) return { action:ACT.RAISE, amountTo:raiseTo() };
    return { action:ACT.CHECK };
  }
  // facing a bet — raise big hands, call when equity beats the price, else fold/bluff
  if (str>0.82 && L.canRaise) return rng()<0.75 ? { action:ACT.RAISE, amountTo:raiseTo() } : { action:ACT.CALL };
  if (str > potOdds + cm){
    if (str>0.6 && L.canRaise && rng() < pPost*0.7) return { action:ACT.RAISE, amountTo:raiseTo() };
    return { action:ACT.CALL };
  }
  if (bluff()) return { action:ACT.RAISE, amountTo:raiseTo() };
  return { action:ACT.FOLD };
}
