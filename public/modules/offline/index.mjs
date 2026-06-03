/**
 * Offline mode entry point. Exposes a WebSocket-compatible FakeSocket that the
 * existing client uses in place of `new WebSocket(...)`. Behind it runs the
 * local FakeServer (engine + bots). No network, no proxy, no server.
 */
import { FakeServer } from './server.mjs';

const BOT_POOL = [
  ['Botzilla','🦖'],['Bluff Bot','🤖'],['Sir Raise-a-lot','👑'],['All-in Annie','🎰'],
  ['Nit Nelson','🧊'],['Calling Carl','📞'],['Shark','🦈'],['Lucky Luna','🍀'],
  ['The Rock','🪨'],['Maniac Max','🔥'],['Fold Freddy','🍃'],['Donk Kong','🦍'],
];

function pickBots(n, rng){
  const pool = BOT_POOL.slice();
  const out=[];
  for(let i=0;i<n && pool.length;i++){
    const j=Math.floor(rng()*pool.length);
    const [name,avatar]=pool.splice(j,1)[0];
    out.push({ name, avatar, aggr: 0.3 + rng()*0.5 });
  }
  return out;
}

// Minimal WebSocket-compatible transport backed by the local FakeServer.
class FakeSocket {
  constructor(server){
    this.CONNECTING=0; this.OPEN=1; this.CLOSING=2; this.CLOSED=3;
    this.readyState=0; this.binaryType='arraybuffer';
    this.onopen=null; this.onmessage=null; this.onerror=null; this.onclose=null;
    this._server=server;
    server.deliver = (framed)=>{
      // mimic async network delivery; pass an ArrayBuffer like a real WS binary frame
      setTimeout(()=>{ if(this.readyState===1 && this.onmessage) this.onmessage({ data: framed.buffer.slice(framed.byteOffset, framed.byteOffset+framed.byteLength) }); }, 0);
    };
    setTimeout(()=>{ this.readyState=1; if(this.onopen) this.onopen({}); this._server.begin(); }, 0);
  }
  send(data){
    const u8 = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer||data);
    try { this._server.onClientFrame(u8); } catch(e){ /* swallow */ }
  }
  close(){ this.readyState=3; this._server.stopped=true; if(this.onclose) this.onclose({ code:1000, reason:'offline' }); }
}

export function createSocket(config){
  config = config || {};
  const rng = config.rng || Math.random;
  const nBots = Math.max(1, Math.min(9, config.bots || 5));
  const server = new FakeServer({
    me: { name: config.nick || 'You' },
    bots: pickBots(nBots, rng),
    config: {
      startMoney: config.startMoney || 1500,
      smallBlind: config.smallBlind || 10,
      raiseEvery: config.raiseEvery || 6,
      maxPlayers: nBots + 1,
      timeout:    config.timeout || 30,
    },
    rng,
    pace: (fn, ms)=> setTimeout(fn, ms||0),
  });
  return new FakeSocket(server);
}

// Browser hook: expose for the classic-script client.
if (typeof window !== 'undefined') {
  window.PokerOffline = { createSocket, BOT_POOL };
}
