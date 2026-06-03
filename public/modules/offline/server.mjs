/**
 * Offline "fake server" — lobby model. Behaves like a LAN/dedicated server:
 *   Announce -> (Init) -> InitAck + PlayerList                 [land in lobby]
 *   (JoinNewGame, type22, with NetGameInfo) -> JoinGameAck(admin) + GameListNew
 *                                              + GamePlayerJoined(me)   [waiting room]
 *   (StartEvent, type36, fillWithComputerPlayers — "+ Bots") -> fill empty seats
 *        with bots (GamePlayerJoined + PlayerInfoReply) -> StartEvent(go)
 *   (StartEventAck, type37) -> GameStartInitial -> HandStart loop...
 * The user's create-form settings (NetGameInfo) drive the table.
 */
import { OfflineTable, ACT } from './engine.mjs';
import { decide } from './bots.mjs';
import { buildMessage, parseClientFrame, encode, packed, readFields, TYPE } from './proto.mjs';

const GS  = { preflop:0, flop:1, turn:2, river:3 };
const NPA = { fold:1, check:2, call:3, bet:4, raise:5, allin:6 };

export class FakeServer {
  constructor(opts){
    this.deliver = opts.deliver;
    this.pace    = opts.pace || ((fn)=>fn());
    this.rng     = opts.rng  || Math.random;
    this.botPool = opts.botPool || [];
    this.cfg = Object.assign({ startMoney:3000, smallBlind:10, raiseEvery:8, maxPlayers:6, timeout:30, gameName:'Offline', raiseMode:1, endRaiseMode:1, endRaiseValue:0, guiSpeed:5, delayHands:2 }, opts.config||{});
    this.meId = 1; this.gameId = 1;
    this.players = [{ id:1, name:(opts.me&&opts.me.name)||'You', isBot:false }];
    this.botCfg = {}; this._used = new Set();
    this.started = false; this.stopped = false; this.rawGameInfo = null;
  }

  _send(name, spec){ if(!this.stopped) this.deliver(buildMessage(name, spec)); }
  ver(maj,min){ return encode([[1,0,maj],[2,0,min]]); }
  gameInfo(){
    const c=this.cfg;
    return encode([[1,2,c.gameName],[2,0,1],[3,0,c.maxPlayers],[4,0,1],[5,0,c.raiseEvery],
      [7,0,1],[9,0,5],[10,0,0],[11,0,c.timeout],[12,0,c.smallBlind],[13,0,c.startMoney],[15,0,1]]);
  }
  _applyGameInfo(gi){
    const f=readFields(gi); const n=(k,d)=> (f[k]&&f[k][0]!=null)?f[k][0]:d;
    this.cfg.maxPlayers = Math.max(2, Math.min(10, n(3, this.cfg.maxPlayers)));
    this.cfg.raiseMode  = n(4, this.cfg.raiseMode) || 1;
    // field 5 = raise every N hands (mode 1); field 6 = every N minutes (mode 2)
    this.cfg.raiseEvery = (this.cfg.raiseMode === 2 ? n(6, this.cfg.raiseEvery) : n(5, this.cfg.raiseEvery)) || this.cfg.raiseEvery;
    this.cfg.endRaiseMode  = n(7, this.cfg.endRaiseMode) || 1;
    this.cfg.endRaiseValue = n(8, this.cfg.endRaiseValue) || 0;
    this.cfg.guiSpeed   = Math.max(1, Math.min(10, n(9, this.cfg.guiSpeed) || 5));
    this.cfg.delayHands = n(10, this.cfg.delayHands);
    this.cfg.timeout    = n(11, this.cfg.timeout);
    this.cfg.smallBlind = n(12, this.cfg.smallBlind);
    this.cfg.startMoney = n(13, this.cfg.startMoney);
  }

  begin(){ this._send('Announce', [[1,2,this.ver(5,1)],[2,2,this.ver(2,0)],[3,0,0],[4,0,0],[5,0,1]]); }

  onClientFrame(frame){
    let m; try { m = parseClientFrame(frame); } catch(e){ return; }
    switch(m.typeId){
      case TYPE.Init:             return this._onInit();
      case TYPE.JoinNew:          return this._onCreate(m.fields);
      case TYPE.JoinExisting:     return this._onCreate(m.fields);   // fallback
      case 36 /*StartEvent req*/: return this._onStartRequest(m.fields);
      case TYPE.StartEventAck:    return this._onStartAck();
      case TYPE.MyActionRequest:  return this._onMyAction(m.fields);
      case TYPE.PlayerInfoRequest:return this._onInfoReq(m.fields);
      case TYPE.LeaveGame:        return this._onLeave();
      default: return;
    }
  }

  _onInit(){
    this._send('InitAck',   [[1,2,new Uint8Array([1,2,3,4])],[2,0,this.meId]]);
    this._send('PlayerList',[[1,0,this.meId],[2,0,0]]);   // -> client lands in the lobby
  }

  _onCreate(f){
    this._closed = false;   // new game -> not closed
    const gi = (f[1] && f[1][0] instanceof Uint8Array) ? f[1][0] : null;
    if(gi){ this.rawGameInfo = gi; this._applyGameInfo(gi); }
    const info = this.rawGameInfo || this.gameInfo();
    // GameListNew first: the client's JoinGameAck handler reads games[gId]
    // (timeout / startMoney / blind schedule) which GameListNew populates.
    this._send('GameListNew',[[1,0,this.gameId],[2,0,1],[3,0,0],[4,2,packed([this.meId])],[5,0,this.meId],[6,2,info]]);
    this._send('JoinGameAck',[[1,0,this.gameId],[2,0,1],[3,2,info]]);
    this._send('GamePlayerJoined',[[1,0,this.gameId],[2,0,this.meId],[3,0,1]]);
    this._info(this.meId);
  }

  // Close the current game and reset to a fresh state so the user can create
  // another from the lobby. Removes the table from the lobby list.
  _closeAndReset(){
    if(this._closed) return; this._closed = true;
    this._send('GameListUpdate',[[1,0,this.gameId],[2,0,3]]);  // netGameClosed -> client deletes it
    const me = this.players[0];
    this.players = [me]; this.botCfg = {}; this._used = new Set();
    this.started = false; this.table = null; this.rawGameInfo = null;
  }
  _onLeave(){ this._closeAndReset(); }

  _pickBot(){
    const id = this.players.length + 1;
    let entry;
    if(this.botPool.length){
      const avail = this.botPool.filter(b=>!this._used.has(b[0]));
      const pool = avail.length ? avail : this.botPool;
      entry = pool[Math.floor(this.rng()*pool.length)];
      this._used.add(entry[0]);
    } else entry = ['Bot '+id, '🤖'];
    return { id, name:entry[0], avatar:entry[1], isBot:true, aggr:0.3+this.rng()*0.5 };
  }

  _onStartRequest(){
    if(this.started) return;
    const target = Math.max(2, this.cfg.maxPlayers || 2);
    while(this.players.length < target){
      const b = this._pickBot();
      this.players.push(b);
      this.botCfg[b.id] = { aggr:b.aggr, rng:this.rng };
      this._send('GamePlayerJoined',[[1,0,this.gameId],[2,0,b.id],[3,0,0]]);
      this._info(b.id);
    }
    this.pace(()=> this._send('StartEvent',[[1,0,this.gameId],[2,0,0],[3,0,0]]), 300);
  }

  _info(id){
    const p=this.players.find(x=>x.id===id); if(!p) return;
    const data = encode([[1,2,p.name],[2,0,p.isBot?0:1],[3,0,p.isBot?2:1]]);
    this._send('PlayerInfoReply',[[1,0,id],[2,2,data]]);
  }
  _onInfoReq(f){ (f[1]||[]).forEach(id=>this._info(id)); }

  _onStartAck(){
    if(this.started) return; this.started=true;
    this.seatIds = this.players.map(p=>p.id);
    this._send('GameStartInitial',[[1,0,this.gameId],[2,0,this.seatIds[0]],[3,2,packed(this.seatIds)]]);
    const ps = this.players.map(p=>({ id:p.id, name:p.name, isBot:p.isBot, stack:this.cfg.startMoney }));
    this.table = new OfflineTable({ players:ps, smallBlind:this.cfg.smallBlind, raiseEvery:this.cfg.raiseEvery,
      raiseMode:this.cfg.raiseMode, endRaiseMode:this.cfg.endRaiseMode, endRaiseValue:this.cfg.endRaiseValue,
      rng:this.rng, gameId:this.gameId, onEvent:(ev)=>this._onEngine(ev) });
    this.pace(()=>this.table.start(), 300);
  }
  _onMyAction(f){
    if(!this.table || this.stopped) return;
    const action=f[4]?f[4][0]:0, relBet=f[5]?f[5][0]:0;
    let a, amt;
    if(action===NPA.fold) a=ACT.FOLD;
    else if(action===NPA.check||action===NPA.call) a=ACT.CALL;
    else { a=ACT.RAISE; amt=relBet; }
    this.table.act(this.meId, a, amt);
  }
  _stackOf(id){ const p=this.table.players.find(x=>x.id===id); return p?p.stack:0; }

  _onEngine(ev){
    if(this.stopped) return; const G=this.gameId;
    switch(ev.type){
      case 'handStart': {
        const hole = ev.holeByPlayer[this.meId] || [0,0];
        const spec=[[1,0,G],[2,2, encode([[1,0,hole[0]],[2,0,hole[1]]])],[4,0,ev.sb]];
        ev.seats.forEach(()=>spec.push([5,0,0]));
        spec.push([6,0,ev.dealerId]);
        this._send('HandStart', spec); break;
      }
      case 'turn': {
        this._send('PlayersTurn',[[1,0,G],[2,0,ev.playerId],[3,0,GS[ev.gameState]]]);
        if(ev.playerId!==this.meId){
          var _sp=this.cfg.guiSpeed||5; var _think=Math.max(180, 1000-_sp*80);
          this.pace(()=>{ if(this.stopped||!this.table) return; const d=decide(ev,this.botCfg[ev.playerId]); this.table.act(ev.playerId,d.action,d.amountTo); }, _think+Math.floor(this.rng()*_think*0.6));
        } break;
      }
      case 'actionDone':
        this._send('PlayersActionDone',[[1,0,G],[2,0,ev.playerId],[3,0,GS[ev.gameState]],[4,0,NPA[ev.action]||0],
          [5,0,ev.totalStreetBet],[6,0,ev.stack],[7,0,ev.currentBet],[8,0,ev.minRaise]]); break;
      case 'dealFlop':  this._send('DealFlop',[[1,0,G],[2,0,ev.cards[0]],[3,0,ev.cards[1]],[4,0,ev.cards[2]]]); break;
      case 'dealTurn':  this._send('DealTurn',[[1,0,G],[2,0,ev.card]]); break;
      case 'dealRiver': this._send('DealRiver',[[1,0,G],[2,0,ev.card]]); break;
      case 'showdown': {
        const spec=[[1,0,G]];
        ev.results.forEach(r=>spec.push([2,2, encode([[1,0,r.playerId],[2,0,r.cards[0]],[3,0,r.cards[1]],[5,0,r.won],[6,0,this._stackOf(r.playerId)]])]));
        this._send('EndOfHandShow', spec); break;
      }
      case 'endOfHandHide': this._send('EndOfHandHide',[[1,0,G],[2,0,ev.playerId],[3,0,ev.moneyWon],[4,0,ev.playerMoney]]); break;
      case 'handComplete':  { var _dh=Math.max(600, Math.min(4000, (this.cfg.delayHands||2)*380)); this.pace(()=>{ if(!this.stopped && this.table) this.table.nextHand(); }, _dh); break; }
      case 'gameOver':      this._send('EndOfGame',[[1,0,G],[2,0,ev.winnerId||this.meId]]); break;  // close happens on return-to-lobby (leave)
      default: break;
    }
  }
}
