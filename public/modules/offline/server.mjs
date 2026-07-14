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
import { OfflineTable, ACT, bestHand } from './engine.mjs';
import { decide, pickArchetype } from './bots.mjs';
import { buildMessage, parseClientFrame, encode, packed, readFields, TYPE } from './proto.mjs';

const GS  = { preflop:0, flop:1, turn:2, river:3 };
const NPA = { fold:1, check:2, call:3, bet:4, raise:5, allin:6 };

// PRNG dédié aux réactions cosmétiques des bots — volontairement SÉPARÉ du
// this.rng du jeu (deck + IA) pour ne jamais décaler le flux déterministe.
function _mulberry32(a){ return function(){ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }

// Réactions « intelligentes » : chaque archétype a une FRÉQUENCE (multiplicateur
// de probabilité) et des PALETTES contextuelles. kinds : happy (gain normal),
// big (gros pot / monstre), sad (perte banale), bad (perte avec grosse main).
const ARCH_REACT = {
  rock:    { freq:0.35, happy:['👍','😎','🙂'],      sad:['😕','😴'],      big:['😏','💰','😎'],        bad:['😑','🫤','😮'],   shove:['💪','😤','😳'] },
  tag:     { freq:0.75, happy:['😎','🎯','👏','😏'], sad:['😤','😬'],      big:['🤑','💰','🥳'],        bad:['😱','😣','🤦'],   shove:['😎','💪','🔥'] },
  lag:     { freq:1.20, happy:['🔥','😈','💪','😎'], sad:['😤','🤬'],      big:['🤑','🚀','🥳','🔥'],   bad:['😱','🤯','🤬'],   shove:['🔥','😈','💪','🚀'] },
  station: { freq:0.55, happy:['🍀','🙂','👀'],      sad:['🤷','😅'],      big:['🤩','🍀','🥳'],        bad:['😮','😬','😅'],   shove:['🤞','🍀','😅'] },
  maniac:  { freq:1.50, happy:['🔥','😈','🤪','🚀'], sad:['🤬','💀','😤'], big:['🤑','🎰','🚀','🥳'],   bad:['🤯','💀','🤬'],   shove:['🔥','😈','🤪','🚀','🎰'] },
};
const RX_ENVY    = ['👀','😤','😒','🫡'];   // un gros coup du joueur humain
const RX_STEAL   = ['😎','😏','🫡','😈'];   // vol de pot sans abattage
const RX_THINK   = ['🤔','👀','😬','🫤'];   // gros call difficile / face à une grosse mise
const RX_LAYDOWN = ['😒','😤','🫤','🙄','😑']; // fold face à une vraie mise

export class FakeServer {
  constructor(opts){
    this.deliver = opts.deliver;
    this.pace    = opts.pace || ((fn)=>fn());
    this.rng     = opts.rng  || Math.random;
    this.botPool = opts.botPool || [];
    this.botSkill = opts.botSkill || 'mixed';   // 'easy'|'normal'|'hard'|'mixed'
    // Pause entre les mains (parité QML PauseBetweenHands) : callback LU EN
    // DIRECT à chaque fin de main (l'option peut être basculée en cours de
    // partie). Quand elle rend vrai, nextHand attend resumeNextHand().
    this.pauseGate = (typeof opts.pauseGate === 'function') ? opts.pauseGate : null;
    this._pendingNext = null;
    this.cfg = Object.assign({ startMoney:3000, smallBlind:10, raiseEvery:8, maxPlayers:6, timeout:30, gameName:'Offline', raiseMode:1, endRaiseMode:1, endRaiseValue:0, guiSpeed:5, delayHands:2 }, opts.config||{});
    this.meId = 1; this.gameId = 1;
    this.players = [{ id:1, name:(opts.me&&opts.me.name)||'You', isBot:false }];
    this.botCfg = {}; this._used = new Set();
    this.started = false; this.stopped = false; this.rawGameInfo = null;
    this._humanTimer = null;
    this._roAcc = 0;   // run-out pacing accumulator (ms), reset between hands
    this._meBusted = false;   // joueur humain éliminé du tournoi (fin immédiate)
    this._rrng = _mulberry32(0x9e3779b1);   // réactions cosmétiques (rng dédié)
    this._reactedHand = new Set();   // bots ayant déjà réagi dans la main courante
    this._reactN = 0;                // nombre de réactions dans la main (plafond)
    this._lastEmoji = '';            // éviter de répéter le même emoji
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
      case 30 /*KickPlayer req*/: return this._onKick(m.fields);
      default: return;
    }
  }

  _onInit(){
    this._send('InitAck',   [[1,2,new Uint8Array([1,2,3,4])],[2,0,this.meId]]);
    this._send('PlayerList',[[1,0,this.meId],[2,0,0]]);   // -> client lands in the lobby
  }

  _onCreate(f){
    // Replay / re-création alors qu'une partie tourne déjà : repartir propre
    // (mêmes id de partie, stacks neufs). leaveGame précède normalement, mais
    // on reste défensif pour un restart en place.
    if(this.started || this.table){
      this._clearHumanTimer();
      const me0 = this.players[0];
      this.players = [me0]; this.botCfg = {}; this._used = new Set();
      this.started = false; this.table = null;
      this._meBusted = false; this._roAcc = 0;
    }
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
    this._clearHumanTimer();
    this._meBusted = false; this._roAcc = 0;
    if(this._closed) return; this._closed = true;
    this._send('GameListUpdate',[[1,0,this.gameId],[2,0,3]]);  // netGameClosed -> client deletes it
    const me = this.players[0];
    this.players = [me]; this.botCfg = {}; this._used = new Set();
    this.started = false; this.table = null; this.rawGameInfo = null;
  }
  _onLeave(){ this._closeAndReset(); }

  // ── Kick a bot (admin action, type 30) ──────────────────────────────────
  // The client sends KickPlayerRequest { gameId, playerId }. We only ever kick
  // BOTS (never the human). Hybrid removal: fold + remove the bot immediately,
  // EXCEPT an all-in bot — its committed chips are owed a showdown, so that one
  // is deferred to end-of-hand. Between hands / before start, removal is also
  // immediate. We always broadcast GamePlayerLeft so the UI drops the seat, and
  // the engine ends the game if only the human remains.
  _onKick(f){
    const pid = (f && f[2] && f[2][0]!=null) ? f[2][0] : null;
    if(pid==null || pid===this.meId) return;                  // never the human
    const p = this.players.find(x=>x.id===pid && x.isBot);
    if(!p) return;                                            // unknown / not a bot
    if(!this.started || !this.table){ this._finishKick(pid); return; }  // waiting room → now
    const r = this.table.removePlayer(pid);                   // fold + flag out (engine)
    if(r === 'allin'){ (this._kickPending || (this._kickPending=new Set())).add(pid); return; } // owed a showdown
    this._finishKick(pid);                                    // idle / folded → drop now
  }
  // Effective removal: flag out of the engine (idempotent), drop lobby/config
  // state, and tell the UI. Used both for immediate kicks and deferred all-ins.
  _finishKick(pid){
    if(this.table){ const ep=this.table.players.find(x=>x.id===pid); if(ep) ep.in=false; }
    const lp=this.players.find(x=>x.id===pid);
    this.players=this.players.filter(x=>x.id!==pid);
    delete this.botCfg[pid]; if(lp) this._used.delete(lp.name);
    this._send('GamePlayerLeft',[[1,0,this.gameId],[2,0,pid],[3,0,3]]);   // 3 = leftKicked
  }
  // Apply deferred all-in kicks between hands (after the showdown has paid out).
  _applyKicks(){
    if(!this._kickPending || !this._kickPending.size) return;
    for(const pid of this._kickPending) this._finishKick(pid);
    this._kickPending.clear();
  }

  _pickBot(){
    const id = this.players.length + 1;
    // Prefer the live create-form choice (persisted to localStorage) so the lobby
    // selector applies at bot-fill time; fall back to the connect-time value.
    let skill = this.botSkill;
    try { if (typeof localStorage !== 'undefined') { const s = localStorage.getItem('pth_offline_skill'); if (s) skill = s; } } catch (e) {}
    if (skill === 'mixed' || (skill!=='easy' && skill!=='normal' && skill!=='hard')){
      const r = this.rng();                          // varied table: ~30% easy, ~50% normal, ~20% hard
      skill = r < 0.30 ? 'easy' : (r < 0.80 ? 'normal' : 'hard');
    }
    const style = pickArchetype(this.rng);
    // Pick a name that MATCHES the drawn archetype (entry[2]); fall back to any
    // free name, then to the whole pool if everything's taken.
    let entry;
    if(this.botPool.length){
      const match = this.botPool.filter(b=>!this._used.has(b[0]) && b[2]===style.arch);
      const free  = this.botPool.filter(b=>!this._used.has(b[0]));
      const pool  = match.length ? match : (free.length ? free : this.botPool);
      const picked = pool[Math.floor(this.rng()*pool.length)];
      // When the table is larger than the unique-name pool we fall back to the
      // whole pool, which can re-pick an already-used name. Suffix the seat id
      // so two bots never share the exact same name at one table.
      let name = picked[0];
      if (this._used.has(name)) name = name + ' ' + id;
      this._used.add(name);
      entry = [name, picked[1], picked[2]];
    } else entry = ['Bot '+id, '🤖'];
    return { id, name:entry[0], avatar:entry[1], isBot:true, skill,
             aggr:style.aggr, arch:style.arch, callMargin:style.callMargin, bluffMul:style.bluffMul, entryEq:style.entryEq, openMul:style.openMul };
  }

  _onStartRequest(){
    if(this.started) return;
    const target = Math.max(2, this.cfg.maxPlayers || 2);
    while(this.players.length < target){
      const b = this._pickBot();
      this.players.push(b);
      this.botCfg[b.id] = { aggr:b.aggr, rng:this.rng, skill:b.skill, arch:b.arch, callMargin:b.callMargin, bluffMul:b.bluffMul, entryEq:b.entryEq, openMul:b.openMul };
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
    this._meBusted = false; this._roAcc = 0;
    this.seatIds = this.players.map(p=>p.id);
    this._send('GameStartInitial',[[1,0,this.gameId],[2,0,this.seatIds[0]],[3,2,packed(this.seatIds)]]);
    const ps = this.players.map(p=>({ id:p.id, name:p.name, isBot:p.isBot, stack:this.cfg.startMoney }));
    this.table = new OfflineTable({ players:ps, smallBlind:this.cfg.smallBlind, raiseEvery:this.cfg.raiseEvery,
      raiseMode:this.cfg.raiseMode, endRaiseMode:this.cfg.endRaiseMode, endRaiseValue:this.cfg.endRaiseValue,
      rng:this.rng, gameId:this.gameId, onEvent:(ev)=>this._onEngine(ev) });
    this.pace(()=>this.table.start(), 300);
  }
  _clearHumanTimer(){ if(this._humanTimer){ clearTimeout(this._humanTimer); this._humanTimer=null; } }
  // Reprise après une pause entre les mains. Idempotent : sans continuation
  // en attente, ne fait rien (appelé aussi par le Continuer du popup gagnant
  // quand la pause n'est pas active).
  resumeNextHand(){ var f=this._pendingNext; this._pendingNext=null; if(f && !this.stopped) this.pace(f, 200); }
  // Pas de temporisation entre cartes du run-out, modulé par la vitesse de jeu.
  _roStep(){ return Math.max(450, 1100 - (this.cfg.guiSpeed||5)*70); }
  // Envoi d'une distribution de board : immédiat en jeu normal ; en run-out
  // (tous all-in, plus de décision), on révèle carte par carte avec un délai
  // croissant pour le suspense, comme le vrai serveur.
  _board(name, spec, runOut){
    if(!runOut){ this._roAcc = 0; this._send(name, spec); return; }
    this._roAcc += this._roStep();
    var off = this._roAcc;
    this.pace(()=>{ if(!this.stopped) this._send(name, spec); }, off);
  }
  // ── Réactions cosmétiques des bots (rng dédié, n'affecte pas le jeu) ──
  // Transport : message Chat « [R]<emoji> », que le client interprète déjà
  // comme une réaction (préfixe ASCII [R]) sans l'afficher dans le tchat.
  _botReact(botId, emoji, base, extra){
    var off = (base||0) + (extra==null?500:extra) + Math.round(this._rrng()*600);
    this.pace(()=>{ if(!this.stopped) this._send('Chat',[[1,0,this.gameId],[2,0,botId],[3,0,1],[4,2,'[R]'+emoji]]); }, off);
  }
  // Dispatcher central des réactions : applique personnalité (archétype) +
  // anti-spam (1 par bot/main, plafond 2/main, pas de répétition d'emoji).
  // kind ∈ {happy,big,sad,bad,envy,steal,shove,think,laydown}. baseProb modulé
  // par la fréquence de l'archétype. Utilise exclusivement le rng dédié (_rrng).
  // extra = délai additif personnalisé (cours de main : ~0 pour coller à l'action).
  _react(botId, kind, baseProb, base, extra){
    if(this.stopped || botId===this.meId || botId==null) return;
    if(this._reactedHand.has(botId)) return;
    if(this._reactN >= 2) return;
    const arch=(this.botCfg[botId] && this.botCfg[botId].arch) || 'tag';
    const cfg=ARCH_REACT[arch] || ARCH_REACT.tag;
    if(this._rrng() >= Math.min(0.95, baseProb*cfg.freq)) return;
    const pool = kind==='envy' ? RX_ENVY : kind==='steal' ? RX_STEAL
               : kind==='think' ? RX_THINK : kind==='laydown' ? RX_LAYDOWN
               : (cfg[kind] || cfg.happy);
    let emoji = pool[Math.floor(this._rrng()*pool.length)];
    if(emoji===this._lastEmoji && pool.length>1) emoji = pool[Math.floor(this._rrng()*pool.length)];
    this._lastEmoji = emoji;
    this._reactedHand.add(botId); this._reactN++;
    this._botReact(botId, emoji, base||0, extra);
  }
  // Réaction d'un bot pendant son propre tour, d'après la décision calculée
  // (n'utilise QUE le rng dédié — pas de consommation du rng de jeu).
  _reactBotTurn(ev, d, think){
    const L=ev.legal||{}; const pot=L.pot||0, toCall=L.callAmt||0, bb=L.bb||1, maxTo=L.maxRaiseTo||0;
    if(d.action===ACT.RAISE){
      const allIn = (maxTo>0 && d.amountTo>=maxTo);
      const bigRaise = (d.amountTo >= pot && pot>0);
      if(allIn)       this._react(ev.playerId,'shove',0.45, Math.round(think*0.75), 0);
      else if(bigRaise) this._react(ev.playerId,'shove',0.20, Math.round(think*0.6), 0);
    } else if(d.action===ACT.CALL && toCall >= 3*bb && toCall >= 0.55*pot){
      this._react(ev.playerId,'think',0.22, Math.round(think*0.35), 0);   // gros call qui « fait réfléchir »
    } else if(d.action===ACT.FOLD && toCall >= 2*bb){
      const p = Math.min(0.22, 0.10 + (toCall/Math.max(1,pot))*0.10);
      this._react(ev.playerId,'laydown',p, Math.round(think*0.45), 0);
    }
  }
  _reactShowdown(results, board, base){
    const bb=(this.table && this.table.bb) || (this.cfg.smallBlind*2) || 20;
    let pot=0; (results||[]).forEach(r=>pot+=(r.won||0));
    const big = pot >= 14*bb;
    const catOf=(r)=> (r && r.cards && r.cards.length>=2) ? ((bestHand(r.cards.concat(board||[]))||[0])[0]) : 0;
    for(const r of (results||[])){
      if(r.playerId===this.meId){
        // gros coup du joueur humain -> un bot perdant, jaloux
        if(r.won>0 && big){ const loser=(results.find(x=>x.playerId!==this.meId && x.won===0)||{}).playerId; if(loser!=null) this._react(loser,'envy',0.6,base); }
        continue;
      }
      if(r.won>0){ this._react(r.playerId, (big || catOf(r)>=6) ? 'big' : 'happy', 0.5, base); }
      else if(catOf(r)>=4){ this._react(r.playerId, 'bad', 0.6, base); }  // bad beat : grosse main battue
      else { this._react(r.playerId, 'sad', 0.18, base); }
    }
  }
  _onMyAction(f){
    if(!this.table || this.stopped) return;
    this._clearHumanTimer();
    const action=f[4]?f[4][0]:0, relBet=f[5]?f[5][0]:0;
    let a, amt;
    if(action===NPA.fold) a=ACT.FOLD;
    else if(action===NPA.check||action===NPA.call) a=ACT.CALL;
    else { a=ACT.RAISE; amt=relBet; }
    // Ton agression notable -> un bot encore en jeu te jauge (👀😬).
    if(a===ACT.RAISE && this.table.h){
      var _bb=this.table.bb || (this.cfg.smallBlind*2) || 20;
      if(relBet >= 6*_bb){
        var H=this.table.h, ord=(H._order||this.table.players||[]);
        for(const q of ord){
          if(q.id!==this.meId && H.inHand && H.inHand[q.id] && !(H.folded&&H.folded[q.id]) && !(H.allin&&H.allin[q.id])){
            this._react(q.id,'think',0.40,600,0); break;
          }
        }
      }
    }
    this.table.act(this.meId, a, amt);
  }
  _stackOf(id){ const p=this.table.players.find(x=>x.id===id); return p?p.stack:0; }

  _onEngine(ev){
    if(this.stopped) return; const G=this.gameId;
    switch(ev.type){
      case 'handStart': {
        this._roAcc = 0;   // nouvelle main : repartir d'un accumulateur vierge
        this._reactedHand = new Set(); this._reactN = 0;
        const hole = ev.holeByPlayer[this.meId] || [0,0];
        const spec=[[1,0,G],[2,2, encode([[1,0,hole[0]],[2,0,hole[1]]])],[4,0,ev.sb]];
        ev.seats.forEach(()=>spec.push([5,0,0]));
        spec.push([6,0,ev.dealerId]);
        this._send('HandStart', spec); break;
      }
      case 'turn': {
        this._roAcc = 0;   // un tour signifie qu'on n'est pas en run-out
        this._clearHumanTimer();
        // ── Temps mort entre les tours ─────────────────────────────────────
        // Avant de passer la main au joueur suivant, on laisse un vrai « blanc »
        // (aucun siège allumé) pour bien VOIR l'action qui vient d'être jouée,
        // puis on allume le joueur suivant. Fixe (pas de rng) → déterminisme
        // intact : l'ordre des tirages this.rng (deck + decide) est inchangé.
        var _sp=this.cfg.guiSpeed||5;
        var _gap=Math.max(450, 900-_sp*45);   // ~0,45 s (rapide) … ~0,85 s (lent)
        var _ptSpec=[[1,0,G],[2,0,ev.playerId],[3,0,GS[ev.gameState]]];
        this.pace(()=>{ if(!this.stopped && this.table) this._send('PlayersTurn', _ptSpec); }, _gap);
        if(ev.playerId!==this.meId){
          // Temps de réflexion "humain" APRÈS le temps mort, modulé par le TYPE
          // de décision : fold/check vif, call standard, relance « fait réfléchir ».
          // Le jitter this.rng() est tiré AVANT decide() (1 appel, même ordre
          // qu'avant) → décisions des bots et tests déterministes inchangés.
          // Plancher 0,65 s, plafond 4 s ; pente guiSpeed adoucie.
          var _r=this.rng();
          var d=decide(ev,this.botCfg[ev.playerId]);
          var _base=Math.max(750, 1900-_sp*100);
          var _mult=(d.action==='fold'||d.action==='check') ? 0.7
                  : (d.action==='raise')                    ? 1.5
                  :                                           1.05;
          var _think=Math.max(650, Math.min(4000, Math.round(_base*_mult + _r*_base*0.6)));
          this._reactBotTurn(ev, d, _gap + _think);   // réaction calée sur le highlight différé
          this.pace(()=>{ if(this.stopped||!this.table) return; this.table.act(ev.playerId,d.action,d.amountTo); }, _gap + _think);
        } else {
          // Tour du joueur humain : armer un délai d'expiration (comme un vrai
          // serveur PokerTH), décompté APRÈS le temps mort. setTimeout direct →
          // délai mur réel, ne touche pas l'ordre des tirages rng.
          var _to = (this.cfg.timeout > 0 ? this.cfg.timeout : 15);
          var _canCheck = !!(ev.legal && ev.legal.canCheck);
          this._humanTimer = setTimeout(()=>{
            this._humanTimer = null;
            if(this.stopped || !this.table) return;
            this.table.act(this.meId, _canCheck ? ACT.CHECK : ACT.FOLD, 0);
          }, _gap + _to * 1000);
        }
        break;
      }
      case 'actionDone':
        this._send('PlayersActionDone',[[1,0,G],[2,0,ev.playerId],[3,0,GS[ev.gameState]],[4,0,NPA[ev.action]||0],
          [5,0,ev.totalStreetBet],[6,0,ev.stack],[7,0,ev.currentBet],[8,0,ev.minRaise]]); break;
      case 'dealFlop':  this._board('DealFlop',[[1,0,G],[2,0,ev.cards[0]],[3,0,ev.cards[1]],[4,0,ev.cards[2]]], ev.runOut); break;
      case 'dealTurn':  this._board('DealTurn',[[1,0,G],[2,0,ev.card]], ev.runOut); break;
      case 'dealRiver': this._board('DealRiver',[[1,0,G],[2,0,ev.card]], ev.runOut); break;
      case 'showdown': {
        const spec=[[1,0,G]];
        ev.results.forEach(r=>spec.push([2,2, encode([[1,0,r.playerId],[2,0,r.cards[0]],[3,0,r.cards[1]],[5,0,r.won],[6,0,this._stackOf(r.playerId)]])]));
        var _base=0;
        if(ev.runOut){ this._roAcc += this._roStep(); _base=this._roAcc; this.pace(()=>{ if(!this.stopped) this._send('EndOfHandShow', spec); }, _base); }
        else { this._send('EndOfHandShow', spec); }
        this._reactShowdown(ev.results, ev.board, _base);
        break;
      }
      case 'eliminated':
        if(ev.playerId===this.meId) this._meBusted = true;
        else this._react(ev.playerId, 'bad', 0.55, this._roAcc);
        break;
      case 'endOfHandHide': {
        this._send('EndOfHandHide',[[1,0,G],[2,0,ev.playerId],[3,0,ev.moneyWon],[4,0,ev.playerMoney]]);
        // Vol de pot sans abattage : l'agresseur (bot) rafle une mise non triviale.
        var _bb=(this.table && this.table.bb) || 20;
        if(ev.playerId!==this.meId && this.table && this.table.h && this.table.h.aggressorId===ev.playerId && (ev.moneyWon||0) > 3*_bb)
          this._react(ev.playerId, 'steal', 0.5, 0);
        break;
      }
      case 'handComplete': {
        if(this._meBusted){
          // Joueur humain éliminé : fin immédiate (on ne déroule pas les mains
          // restantes entre bots). Place = nombre de survivants + 1.
          var _pl=(this.table?this.table.players.filter(p=>p.in).length:0)+1;
          var _oe=this._roAcc + 600; this._roAcc=0;
          this.pace(()=>{ if(!this.stopped) this._send('EndOfGame',[[1,0,G],[2,0,this.meId],[3,0,_pl],[4,0,1]]); }, _oe);
          break;   // ne pas enchaîner nextHand
        }
        var _dh=Math.max(600, Math.min(4000, (this.cfg.delayHands||2)*380)); var _o=_dh + this._roAcc; this._roAcc = 0;
        var _next=()=>{ if(!this.stopped && this.table){ this._applyKicks(); this.table.nextHand(); } };
        // Pause entre les mains : on retient la continuation au lieu de la
        // programmer — la reprise vient de resumeNextHand() (bouton Continuer
        // de la fenêtre du gagnant ou bouton « Main suivante »). Le temps
        // d'attente est purement mural : aucune influence sur le rng/moteur.
        if (this.pauseGate && this.pauseGate()) { this._pendingNext = _next; }
        else this.pace(_next, _o);
        break;
      }
      case 'gameOver': {
        this._clearHumanTimer();
        var _go=this._roAcc; this._roAcc = 0;
        if(this._meBusted){
          var _pl2=(this.table?this.table.players.filter(p=>p.in).length:0)+1;
          this.pace(()=>{ if(!this.stopped) this._send('EndOfGame',[[1,0,G],[2,0,ev.winnerId||this.meId],[3,0,_pl2],[4,0,1]]); }, _go + 200);
        } else {
          this.pace(()=>{ if(!this.stopped) this._send('EndOfGame',[[1,0,G],[2,0,ev.winnerId||this.meId]]); }, _go + 200);  // close happens on return-to-lobby (leave)
        }
        break;
      }
      default: break;
    }
  }
}
