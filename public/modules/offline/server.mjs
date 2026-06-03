/**
 * Offline "fake server": speaks the PokerTH protocol to the existing client,
 * but runs the game locally (OfflineTable + bots). Drives the full sequence:
 *   Announce -> (Init) -> InitAck + PlayerList + GameListNew
 *            -> (JoinExisting) -> JoinGameAck + GamePlayerJoined* + PlayerInfoReply*
 *            -> StartEvent -> (StartEventAck) -> GameStartInitial -> HandStart loop...
 */
import { OfflineTable, ACT } from './engine.mjs';
import { decide } from './bots.mjs';
import { buildMessage, parseClientFrame, encode, packed, TYPE } from './proto.mjs';

const GS  = { preflop:0, flop:1, turn:2, river:3 };          // -> NetGameState
const NPA = { fold:1, check:2, call:3, bet:4, raise:5, allin:6 }; // -> NetPlayerAction

export class FakeServer {
  constructor(opts){
    this.deliver = opts.deliver;                       // (Uint8Array framed) -> client.onmessage
    this.pace    = opts.pace || ((fn)=>fn());          // (fn, ms) -> schedule
    this.rng     = opts.rng  || Math.random;
    this.cfg = Object.assign({ startMoney:1500, smallBlind:10, raiseEvery:6, maxPlayers:6, timeout:30, gameName:'Offline vs Bots' }, opts.config||{});
    this.meId = 1; this.gameId = 1;
    this.players = [{ id:1, name:(opts.me&&opts.me.name)||'You', isBot:false }];
    (opts.bots||[]).forEach((b,i)=> this.players.push({ id:i+2, name:b.name, isBot:true, aggr:b.aggr }));
    this.botCfg = {};
    this.players.forEach(p=>{ if(p.isBot) this.botCfg[p.id] = { aggr: p.aggr!=null?p.aggr:(0.35+this.rng()*0.45), rng:this.rng }; });
    this.started = false; this.stopped = false;
  }

  _send(name, spec){ if(!this.stopped) this.deliver(buildMessage(name, spec)); }
  ver(maj,min){ return encode([[1,0,maj],[2,0,min]]); }
  gameInfo(){
    const c=this.cfg;
    return encode([
      [1,2,c.gameName],[2,0,1],[3,0,c.maxPlayers],
      [4,0,1],[5,0,c.raiseEvery],[7,0,1],
      [9,0,5],[10,0,0],[11,0,c.timeout],
      [12,0,c.smallBlind],[13,0,c.startMoney],[15,0,1]
    ]);
  }

  // Kick off the handshake (client will reply with Init).
  begin(){ this._send('Announce', [[1,2,this.ver(5,1)],[2,2,this.ver(2,0)],[3,0,0],[4,0,0],[5,0,this.players.length]]); }

  // ---- client -> server ----
  onClientFrame(frame){
    let m; try { m = parseClientFrame(frame); } catch(e){ return; }
    switch(m.typeId){
      case TYPE.Init:             return this._onInit();
      case TYPE.JoinExisting:     return this._onJoin();
      case TYPE.StartEventAck:    return this._onStartAck();
      case TYPE.MyActionRequest:  return this._onMyAction(m.fields);
      case TYPE.PlayerInfoRequest:return this._onInfoReq(m.fields);
      case TYPE.LeaveGame:        this.stopped = true; return;
      default: return; // chat / acks / keepalive: ignored
    }
  }

  _onInit(){
    this._send('InitAck',   [[1,2,new Uint8Array([1,2,3,4])],[2,0,this.meId]]);
    this._send('PlayerList',[[1,0,this.meId],[2,0,0]]);          // playerListNew
    this._send('GameListNew',[
      [1,0,this.gameId],[2,0,1],[3,0,0],
      [4,2,packed([this.meId])],[5,0,this.meId],[6,2,this.gameInfo()]
    ]);
  }
  _onJoin(){
    this._send('JoinGameAck',[[1,0,this.gameId],[2,0,1],[3,2,this.gameInfo()]]);
    this._send('GamePlayerJoined',[[1,0,this.gameId],[2,0,this.meId],[3,0,1]]);
    this._info(this.meId);
    for(const p of this.players){ if(p.isBot){
      this._send('GamePlayerJoined',[[1,0,this.gameId],[2,0,p.id],[3,0,0]]);
      this._info(p.id);
    }}
    this.pace(()=> this._send('StartEvent',[[1,0,this.gameId],[2,0,0],[3,0,0]]), 500);
  }
  _info(id){
    const p=this.players.find(x=>x.id===id); if(!p) return;
    const data = encode([[1,2,p.name],[2,0,p.isBot?0:1],[3,0,p.isBot?2:1]]); // name, isHuman, rights
    this._send('PlayerInfoReply',[[1,0,id],[2,2,data]]);
  }
  _onInfoReq(f){ (f[1]||[]).forEach(id=>this._info(id)); }

  _onStartAck(){
    if(this.started) return; this.started=true;
    this.seatIds = this.players.map(p=>p.id);
    this._send('GameStartInitial',[[1,0,this.gameId],[2,0,this.seatIds[0]],[3,2,packed(this.seatIds)]]);
    const ps = this.players.map(p=>({ id:p.id, name:p.name, isBot:p.isBot, stack:this.cfg.startMoney }));
    this.table = new OfflineTable({ players:ps, smallBlind:this.cfg.smallBlind, raiseEvery:this.cfg.raiseEvery,
      rng:this.rng, gameId:this.gameId, onEvent:(ev)=>this._onEngine(ev) });
    this.pace(()=>this.table.start(), 300);
  }
  _onMyAction(f){
    if(!this.table || this.stopped) return;
    const action = f[4]?f[4][0]:0, relBet = f[5]?f[5][0]:0;
    let a, amt;
    if(action===NPA.fold) a=ACT.FOLD;
    else if(action===NPA.check||action===NPA.call) a=ACT.CALL;       // engine resolves check vs call
    else { a=ACT.RAISE; amt=relBet; }                                // relBet = target street total
    this.table.act(this.meId, a, amt);
  }
  _stackOf(id){ const p=this.table.players.find(x=>x.id===id); return p?p.stack:0; }

  // ---- engine -> client ----
  _onEngine(ev){
    if(this.stopped) return;
    const G=this.gameId;
    switch(ev.type){
      case 'handStart': {
        const hole = ev.holeByPlayer[this.meId] || [0,0];
        const spec=[[1,0,G],[2,2, encode([[1,0,hole[0]],[2,0,hole[1]]])],[4,0,ev.sb]];
        ev.seats.forEach(()=>spec.push([5,0,0]));            // seatStates (repeated): all normal
        spec.push([6,0,ev.dealerId]);
        this._send('HandStart', spec);
        break;
      }
      case 'turn': {
        this._send('PlayersTurn',[[1,0,G],[2,0,ev.playerId],[3,0,GS[ev.gameState]]]);
        if(ev.playerId!==this.meId){
          this.pace(()=>{ if(this.stopped||!this.table) return; const d=decide(ev, this.botCfg[ev.playerId]); this.table.act(ev.playerId, d.action, d.amountTo); },
                    700 + Math.floor(this.rng()*700));
        }
        break;
      }
      case 'actionDone':
        this._send('PlayersActionDone',[
          [1,0,G],[2,0,ev.playerId],[3,0,GS[ev.gameState]],
          [4,0,NPA[ev.action]||0],[5,0,ev.totalStreetBet],[6,0,ev.stack],
          [7,0,ev.currentBet],[8,0,ev.minRaise]
        ]); break;
      case 'dealFlop':  this._send('DealFlop',[[1,0,G],[2,0,ev.cards[0]],[3,0,ev.cards[1]],[4,0,ev.cards[2]]]); break;
      case 'dealTurn':  this._send('DealTurn',[[1,0,G],[2,0,ev.card]]); break;
      case 'dealRiver': this._send('DealRiver',[[1,0,G],[2,0,ev.card]]); break;
      case 'showdown': {
        const spec=[[1,0,G]];
        ev.results.forEach(r=>{ spec.push([2,2, encode([
          [1,0,r.playerId],[2,0,r.cards[0]],[3,0,r.cards[1]],[5,0,r.won],[6,0,this._stackOf(r.playerId)]
        ])]); });
        this._send('EndOfHandShow', spec);
        break;
      }
      case 'endOfHandHide':
        this._send('EndOfHandHide',[[1,0,G],[2,0,ev.playerId],[3,0,ev.moneyWon],[4,0,ev.playerMoney]]); break;
      case 'handComplete':
        this.pace(()=>{ if(!this.stopped && this.table) this.table.nextHand(); }, 2500); break;
      case 'gameOver':
        this._send('EndOfGame',[[1,0,G],[2,0,ev.winnerId||this.meId]]); break;
      default: break;
    }
  }
}
