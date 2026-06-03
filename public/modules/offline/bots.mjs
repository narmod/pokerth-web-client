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

  if (L.canCheck){
    if (str>0.62 && L.canRaise && rng()<a*0.9) return { action:ACT.RAISE, amountTo:raiseTo() };
    if (str>0.85 && L.canRaise) return { action:ACT.RAISE, amountTo:raiseTo() };
    return { action:ACT.CHECK };
  }
  // facing a bet — call when equity beats the pot odds
  if (str>0.82 && L.canRaise) return rng()<0.75 ? { action:ACT.RAISE, amountTo:raiseTo() } : { action:ACT.CALL };
  if (str > potOdds+0.04){
    if (str>0.6 && L.canRaise && rng()<a*0.55) return { action:ACT.RAISE, amountTo:raiseTo() };
    return { action:ACT.CALL };
  }
  // weak: occasional bluff-raise (scaled by difficulty), else fold
  if (L.canRaise && rng()<0.05*a*sk.bluffMul && L.maxRaiseTo>toCall*3) return { action:ACT.RAISE, amountTo:raiseTo() };
  return { action:ACT.FOLD };
}
