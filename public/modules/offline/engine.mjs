/**
 * PokerTH Web Client — Offline engine (pure logic, no DOM / no protocol).
 *
 * Models a Sit'n'Go (single-table tournament): fixed buy-in stacks, rising
 * blinds, players eliminated on bust, last one standing wins. The engine is
 * transport-agnostic: it emits abstract events via onEvent(ev) and receives
 * decisions via act(playerId, action, amount). A separate adapter maps these
 * to the PokerTH protobuf messages the existing UI already understands.
 *
 * Card encoding matches the client (pokerth.js): 0..51, rank = n%13
 * (0=2 … 12=A), suit = floor(n/13).  Actions: 0=fold 1=check/call 2=(bet/raise)
 * — mapped to NetPlayerAction in the adapter, not here.
 */

export const ACT = { FOLD: 'fold', CHECK: 'check', CALL: 'call', BET: 'bet', RAISE: 'raise', ALLIN: 'allin' };

// ---- Hand evaluation: best 5 of up to 7 cards -> comparable score array ----
function rankOf(c){ return c % 13; }
function suitOf(c){ return Math.floor(c / 13); }

function score5(cards){ // returns [category, tiebreakers...] higher = better
  const ranks = cards.map(rankOf).sort((a,b)=>b-a);
  const suits = cards.map(suitOf);
  const flush = suits.every(s=>s===suits[0]);
  const counts = {};
  ranks.forEach(r=>counts[r]=(counts[r]||0)+1);
  // group by count desc, then rank desc
  const groups = Object.keys(counts).map(Number)
    .sort((a,b)=> counts[b]-counts[a] || b-a);
  const uniq = [...new Set(ranks)].sort((a,b)=>b-a);
  let straightHigh = -1;
  if (uniq.length === 5){
    if (uniq[0]-uniq[4]===4) straightHigh = uniq[0];
    else if (uniq[0]===12 && uniq[1]===3 && uniq[2]===2 && uniq[3]===1 && uniq[4]===0) straightHigh = 3; // wheel A-5
  }
  if (flush && straightHigh>=0) return [8, straightHigh];
  if (counts[groups[0]]===4) return [7, groups[0], groups[1]];
  if (counts[groups[0]]===3 && counts[groups[1]]===2) return [6, groups[0], groups[1]];
  if (flush) return [5, ...ranks];
  if (straightHigh>=0) return [4, straightHigh];
  if (counts[groups[0]]===3) return [3, groups[0], ...uniq.filter(r=>r!==groups[0])];
  if (counts[groups[0]]===2 && counts[groups[1]]===2)
    return [2, Math.max(groups[0],groups[1]), Math.min(groups[0],groups[1]), uniq.find(r=>r!==groups[0]&&r!==groups[1])];
  if (counts[groups[0]]===2) return [1, groups[0], ...uniq.filter(r=>r!==groups[0])];
  return [0, ...ranks];
}
function cmpScore(a,b){ for(let i=0;i<Math.max(a.length,b.length);i++){ const x=a[i]||0,y=b[i]||0; if(x!==y) return x-y; } return 0; }
function combos(arr,k){ const r=[]; (function go(s,c){ if(c.length===k){r.push(c.slice());return;} for(let i=s;i<arr.length;i++){c.push(arr[i]);go(i+1,c);c.pop();} })(0,[]); return r; }
export function bestHand(cards){ // cards: up to 7 ints
  const cs = cards.filter(c=>c!=null && c>=0 && c<52);
  let best=null; for(const five of combos(cs,5)){ const s=score5(five); if(!best||cmpScore(s,best)>0) best=s; } return best;
}

function makeDeck(rng){
  const d=[]; for(let i=0;i<52;i++) d.push(i);
  for(let i=51;i>0;i--){ const j=Math.floor(rng()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
  return d;
}

// Blind schedule is computed per-level by OfflineTable._sbForLevel(),
// honouring the table's raise interval (hands/minutes) and end-raise mode.

export class OfflineTable {
  constructor(opts){
    // Use the caller's objects directly (live references) — augment, don't clone.
    this.players = opts.players;
    this.players.forEach(p=>{ p.isBot=!!p.isBot; if(p.in===undefined) p.in=true; });
    this.baseSB = opts.smallBlind || 10;
    this.raiseEvery = opts.raiseEvery || 7;       // every N hands (mode 1) or N minutes (mode 2)
    this.raiseMode    = opts.raiseMode    || 1;   // 1 = every N hands, 2 = every N minutes
    this.endRaiseMode = opts.endRaiseMode || 1;   // 1 = double, 2 = raise up to value, 3 = keep last (constant)
    this.endRaiseValue= opts.endRaiseValue|| 0;   // target small blind for mode 2
    this.now = opts.now || (()=>Date.now());      // injectable clock (minutes mode / tests)
    this.t0 = 0;
    this.onEvent = opts.onEvent || (()=>{});
    this.rng = opts.rng || Math.random;
    this.gameId = opts.gameId || 1;
    this.handNum = 0;
    this.button = -1;
    this.level = 0;
  }
  livePlayers(){ return this.players.filter(p=>p.in); }

  start(){ this.onEvent({type:'gameStart', players:this.players.map(p=>({id:p.id,name:p.name,stack:p.stack,isBot:p.isBot}))}); this.t0=this.now(); this.nextHand(); }

  // Small blind for a given (0-based) level, honouring endRaiseMode:
  //   1 = double each level · 2 = double but capped at endRaiseValue · 3 = constant.
  _sbForLevel(level){
    const base = this.baseSB;
    if (this.endRaiseMode === 3) return base;                 // keep last -> never escalate
    let sb = Math.round(base * Math.pow(2, Math.min(level, 30)));
    if (this.endRaiseMode === 2 && this.endRaiseValue > 0) sb = Math.min(sb, this.endRaiseValue);
    return Math.max(base, sb);
  }

  nextHand(){
    const live = this.players.filter(p=>p.in);
    if (live.length<=1){ this.onEvent({type:'gameOver', winnerId: live[0] && live[0].id}); return; }
    this.handNum++;
    if (this.raiseMode === 2) {                       // rise every N minutes of wall-clock
      const mins = Math.max(0, (this.now() - this.t0) / 60000);
      this.level = this.raiseEvery > 0 ? Math.floor(mins / this.raiseEvery) : 0;
    } else {                                          // rise every N hands
      this.level = this.raiseEvery > 0 ? Math.floor((this.handNum-1) / this.raiseEvery) : 0;
    }
    const sb = this._sbForLevel(this.level); const bb = sb*2;
    this.sb=sb; this.bb=bb;
    // advance button to next live player
    do { this.button=(this.button+1)%this.players.length; } while(!this.players[this.button].in);
    const order = this._orderFrom(this.button); // live players starting at button
    const n = order.length;
    // blinds
    const sbPos = n===2 ? 0 : 1;        // heads-up: button is SB
    const bbPos = n===2 ? 1 : 2 % n;
    const sbP = order[sbPos % n], bbP = order[(bbPos)%n];
    this.h = {
      board:[], deck:makeDeck(this.rng), hole:{}, street:'preflop',
      committed:{}, streetCommit:{}, folded:{}, allin:{}, inHand:{},
      currentBet:0, minRaise:bb, sbP, bbP, results:null,
      aggressorId: bbP.id   // last player to bet/raise; BB is the preflop aggressor by default
    };
    order.forEach(p=>{ this.h.inHand[p.id]=true; this.h.committed[p.id]=0; this.h.streetCommit[p.id]=0; });
    // deal hole cards
    order.forEach(p=>{ this.h.hole[p.id]=[this.h.deck.pop(), this.h.deck.pop()]; });
    this._post(sbP, Math.min(sb, sbP.stack));
    this._post(bbP, Math.min(bb, bbP.stack));
    this.h.currentBet = bb; this.h.minRaise = bb;
    this.onEvent({ type:'handStart', handNum:this.handNum, sb, bb, dealerId:order[0].id,
      seats: order.map(p=>({id:p.id, stack:p.stack})), holeByPlayer: this.h.hole, sbId:sbP.id, bbId:bbP.id });
    // first to act
    const firstPos = n===2 ? 0 : (3 % n);   // HU: SB(button) acts first preflop; else UTG = left of BB
    this._beginStreet('preflop', order, firstPos);
  }

  _orderFrom(start){ const out=[]; const N=this.players.length; for(let i=0;i<N;i++){ const p=this.players[(start+i)%N]; if(p.in) out.push(p); } return out; }
  _post(p, amt){ p.stack-=amt; this.h.committed[p.id]+=amt; this.h.streetCommit[p.id]+=amt; if(p.stack===0) this.h.allin[p.id]=true; }

  _beginStreet(street, order, firstPos){
    this.h.street = street;
    this.h._order = order;
    // needsToAct = all in-hand, not folded, not all-in
    this.h.needsToAct = new Set(order.filter(p=>this.h.inHand[p.id] && !this.h.folded[p.id] && !this.h.allin[p.id]).map(p=>p.id));
    this.h._actPos = firstPos % order.length;
    this._advanceTurn(true);
  }

  _activeNotFolded(){ return this.h._order.filter(p=>this.h.inHand[p.id] && !this.h.folded[p.id]); }
  _canStillBet(){ return this._activeNotFolded().filter(p=>!this.h.allin[p.id]); }

  _advanceTurn(first){
    const order=this.h._order, N=order.length;
    // hand ends if only one not folded
    if (this._activeNotFolded().length<=1){ return this._endHand(); }
    // if <=1 player can still bet and all matched -> run out remaining streets
    // (checked BEFORE the "street complete" test so the FIRST run-out street is
    //  itself flagged as run-out and revealed with suspense, not instantly).
    if (this._canStillBet().length<=1 && this._allMatched()){ return this._nextStreet(true); }
    // street ends if nobody needs to act
    if (this.h.needsToAct.size===0){ return this._nextStreet(); }
    // find next player (from _actPos) who needs to act
    let pos = this.h._actPos; let guard=0;
    while(guard++<=N){ const p=order[pos % N]; if(this.h.needsToAct.has(p.id)){ this.h._actPos=pos; this._requestAction(p); return; } pos++; }
    return this._nextStreet();
  }
  _allMatched(){ return this._activeNotFolded().every(p=> this.h.allin[p.id] || this.h.streetCommit[p.id]===this.h.currentBet); }

  _requestAction(p){
    const toCall = this.h.currentBet - this.h.streetCommit[p.id];
    const legal = {
      canFold: toCall>0,
      canCheck: toCall===0,
      canCall: toCall>0 && p.stack>0,
      callAmt: Math.min(toCall, p.stack),
      canRaise: p.stack > toCall,
      minRaiseTo: this.h.currentBet + this.h.minRaise,
      maxRaiseTo: this.h.streetCommit[p.id] + p.stack,
      bb:this.bb, pot:this._pot(), street:this.h.street
    };
    this.h._pendingId = p.id;
    const order = this.h._order;
    const numActive = this._activeNotFolded().length;          // players still contesting the pot
    const posFromButton = order.findIndex(x=>x.id===p.id);     // 0 = dealer/button (acts last postflop)
    this.onEvent({ type:'turn', playerId:p.id, isBot:p.isBot, gameState:this.h.street, legal,
      board:this.h.board.slice(), hole:this.h.hole[p.id].slice(), stack:p.stack,
      numActive, numPlayers: order.length, posFromButton,
      stackBB: this.bb>0 ? p.stack/this.bb : 0,
      mRatio: (this.sb+this.bb)>0 ? p.stack/(this.sb+this.bb) : 0,
      aggressorId: this.h.aggressorId!=null ? this.h.aggressorId : null });
  }
  _pot(){ let s=0; for(const id in this.h.committed) s+=this.h.committed[id]; return s; }

  // Public: apply an action for the player whose turn it is.
  act(playerId, action, amountTo){
    if (!this.h || this.h._pendingId!==playerId) return false;
    const p = this.players.find(x=>x.id===playerId);
    const toCall = this.h.currentBet - this.h.streetCommit[p.id];
    let kind=action, paid=0;
    if (action===ACT.FOLD){ this.h.folded[p.id]=true; this.h.needsToAct.delete(p.id); }
    else if (action===ACT.CHECK || (action===ACT.CALL && toCall===0)){ kind=ACT.CHECK; this.h.needsToAct.delete(p.id); }
    else if (action===ACT.CALL){ paid=Math.min(toCall,p.stack); this._put(p,paid); this.h.needsToAct.delete(p.id); }
    else { // bet/raise/allin -> amountTo is target streetCommit
      let target = amountTo;
      const maxTo = this.h.streetCommit[p.id]+p.stack;
      if (target>maxTo) target=maxTo;
      const minTo = this.h.currentBet + this.h.minRaise;
      if (target<minTo && target<maxTo) target=minTo;        // clamp up unless all-in short
      const inc = target - this.h.streetCommit[p.id];
      paid = inc; this._put(p, inc);
      const raiseBy = target - this.h.currentBet;
      if (raiseBy>0){
        if (raiseBy>=this.h.minRaise) this.h.minRaise = raiseBy;  // full raise resets minRaise
        this.h.currentBet = target;
        this.h.aggressorId = p.id;                                // remember last aggressor
        // everyone else still in & able must respond
        this.h._order.forEach(q=>{ if(q.id!==p.id && this.h.inHand[q.id] && !this.h.folded[q.id] && !this.h.allin[q.id]) this.h.needsToAct.add(q.id); });
      }
      this.h.needsToAct.delete(p.id);
      kind = this.h.allin[p.id] ? ACT.ALLIN : (toCall>0?ACT.RAISE:ACT.BET);
    }
    this.onEvent({ type:'actionDone', playerId:p.id, action:kind, paid,
      totalStreetBet:this.h.streetCommit[p.id], stack:p.stack,
      currentBet:this.h.currentBet, minRaise:this.h.minRaise, gameState:this.h.street });
    this.h._actPos++;
    this._advanceTurn();
    return true;
  }
  _put(p,amt){ amt=Math.min(amt,p.stack); p.stack-=amt; this.h.committed[p.id]+=amt; this.h.streetCommit[p.id]+=amt; if(p.stack===0) this.h.allin[p.id]=true; }

  _nextStreet(runOut){
    const order=this.h._order;
    order.forEach(p=>this.h.streetCommit[p.id]=0);
    this.h.currentBet=0; this.h.minRaise=this.bb;
    const seq=['preflop','flop','turn','river'];
    const idx=seq.indexOf(this.h.street);
    if (idx>=3){ return this._showdown(); }
    const next=seq[idx+1];
    if (next==='flop'){ const c=[this.h.deck.pop(),this.h.deck.pop(),this.h.deck.pop()]; this.h.board.push(...c); this.onEvent({type:'dealFlop',cards:c, runOut:!!runOut}); }
    if (next==='turn'){ const c=this.h.deck.pop(); this.h.board.push(c); this.onEvent({type:'dealTurn',card:c, runOut:!!runOut}); }
    if (next==='river'){ const c=this.h.deck.pop(); this.h.board.push(c); this.onEvent({type:'dealRiver',card:c, runOut:!!runOut}); }
    this.h.street = next;                                   // advance label BEFORE any recursion
    if (runOut || this._canStillBet().length<=1){
      if (next==='river') return this._showdown(true);
      return this._nextStreet(true);
    }
    // postflop: first to act = first live, not folded, not all-in, LEFT of button (index 1+)
    let firstPos=0;
    for(let i=1;i<=order.length;i++){ const p=order[i%order.length]; if(this.h.inHand[p.id]&&!this.h.folded[p.id]&&!this.h.allin[p.id]){ firstPos=i%order.length; break; } }
    this._beginStreet(next, order, firstPos);
  }

  _endHand(){ // everyone folded but one
    const winner=this._activeNotFolded()[0];
    const pot=this._pot();
    winner.stack+=pot;
    this.h.results=[{playerId:winner.id, won:pot, cards:null}];
    this.onEvent({type:'endOfHandHide', playerId:winner.id, moneyWon:pot, playerMoney:winner.stack});
    this._finishHand();
  }

  _showdown(runOut){
    const contenders=this._activeNotFolded();
    // side pots
    const commits = {}; this.h._order.forEach(p=>commits[p.id]=this.h.committed[p.id]);
    const levels=[...new Set(Object.values(commits).filter(v=>v>0))].sort((a,b)=>a-b);
    let prev=0; const pots=[];
    for(const L of levels){
      const contributors=this.h._order.filter(p=>commits[p.id]>=L);
      const amt=(L-prev)*contributors.length;
      const elig=contributors.filter(p=>!this.h.folded[p.id]).map(p=>p.id);
      if(amt>0) pots.push({amt, elig});
      prev=L;
    }
    // evaluate
    const sc={}; contenders.forEach(p=>sc[p.id]=bestHand(this.h.hole[p.id].concat(this.h.board)));
    const won={}; contenders.forEach(p=>won[p.id]=0);
    for(const pot of pots){
      const eligScores=pot.elig.map(id=>({id,s:sc[id]})).filter(e=>e.s);
      if(!eligScores.length) continue;
      let best=eligScores[0].s; eligScores.forEach(e=>{ if(cmpScore(e.s,best)>0) best=e.s; });
      const winners=eligScores.filter(e=>cmpScore(e.s,best)===0).map(e=>e.id);
      const share=Math.floor(pot.amt/winners.length); let rem=pot.amt-share*winners.length;
      winners.forEach((id,i)=>{ won[id]+=share+(i<rem?1:0); });
    }
    for(const id in won){ this.players.find(p=>p.id===+id).stack+=won[+id]; }
    const results=contenders.map(p=>({playerId:p.id, won:won[p.id]||0, cards:this.h.hole[p.id].slice()}));
    this.h.results=results;
    this.onEvent({type:'showdown', board:this.h.board.slice(), results, runOut:!!runOut});
    this._finishHand();
  }

  _finishHand(){
    const busted=this.players.filter(p=>p.in && p.stack<=0);
    busted.forEach(p=>{ p.in=false; this.onEvent({type:'eliminated', playerId:p.id}); });
    const live=this.players.filter(p=>p.in);
    if (live.length<=1){ this.onEvent({type:'gameOver', winnerId: live[0] && live[0].id}); return; }
    this.onEvent({type:'handComplete'});   // driver/adapter decides when to call nextHand()
  }
}
