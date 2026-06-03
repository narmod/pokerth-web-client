/** Heuristic bot decision for the offline engine. Pure & deterministic given rng. */
import { ACT, bestHand } from './engine.mjs';

function rankOf(c){ return c%13; }
function suitOf(c){ return Math.floor(c/13); }

function preflopStrength(hole){
  const r=[rankOf(hole[0]),rankOf(hole[1])].sort((a,b)=>b-a);
  const hi=r[0], lo=r[1], suited=suitOf(hole[0])===suitOf(hole[1]);
  let s=(hi+lo)/24*0.5;
  if(hi===lo) s+=0.34;                 // pocket pair
  if(suited) s+=0.06;
  const gap=hi-lo; if(gap===1) s+=0.05; else if(gap===2) s+=0.02;
  if(hi>=9) s+=0.05;                    // J+ kicker
  return Math.max(0,Math.min(1,s));
}
function strength(hole,board){
  if(!board.length) return preflopStrength(hole);
  const cat=bestHand(hole.concat(board))[0];  // 0..8
  let s=cat/8*0.9;
  if(cat<=1) s+=Math.max(...hole.map(rankOf))/12*0.12;  // weak made hand: kicker matters
  return Math.max(0,Math.min(1,s));
}

// ctx = the engine 'turn' event payload. bot = {aggr:0..1, rng}
export function decide(ctx, bot){
  const rng=bot.rng||Math.random, a=bot.aggr!=null?bot.aggr:0.5;
  const L=ctx.legal, pot=L.pot, toCall=L.callAmt;
  const str=strength(ctx.hole, ctx.board);
  const raiseTo=()=>{ const t=Math.round(L.minRaiseTo + pot*(0.4+a*0.5)); return Math.max(L.minRaiseTo, Math.min(L.maxRaiseTo, t)); };

  if (L.canCheck){
    if (str>0.62 && L.canRaise && rng()<a*0.9) return {action:ACT.RAISE, amountTo:raiseTo()};
    if (str>0.85 && L.canRaise) return {action:ACT.RAISE, amountTo:raiseTo()};
    return {action:ACT.CHECK};
  }
  // facing a bet
  const potOdds = toCall/(pot+toCall);
  if (str>0.82 && L.canRaise) return rng()<0.75 ? {action:ACT.RAISE, amountTo:raiseTo()} : {action:ACT.CALL};
  if (str > potOdds+0.04){
    if (str>0.6 && L.canRaise && rng()<a*0.55) return {action:ACT.RAISE, amountTo:raiseTo()};
    return {action:ACT.CALL};
  }
  // weak: occasional bluff-raise, else fold
  if (L.canRaise && rng()<0.05*a && L.maxRaiseTo>toCall*3) return {action:ACT.RAISE, amountTo:raiseTo()};
  return {action:ACT.FOLD};
}
