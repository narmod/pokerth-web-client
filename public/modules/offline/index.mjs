/**
 * Offline mode entry point. Exposes a WebSocket-compatible FakeSocket the
 * client uses in place of `new WebSocket(...)`. The local FakeServer behaves
 * like a LAN server: you land in the lobby, create a table via the normal
 * form, and "+ Bots" fills empty seats. No network, no proxy.
 */
import { FakeServer } from './server.mjs';

export const BOT_POOL = [
  ['Botzilla','🦖'],['Bluff Bot','🤖'],['Sir Raise-a-lot','👑'],['All-in Annie','🎰'],
  ['Nit Nelson','🧊'],['Calling Carl','📞'],['Shark','🦈'],['Lucky Luna','🍀'],
  ['The Rock','🪨'],['Maniac Max','🔥'],['Fold Freddy','🍃'],['Donk Kong','🦍'],
];

class FakeSocket {
  constructor(server){
    this.CONNECTING=0; this.OPEN=1; this.CLOSING=2; this.CLOSED=3;
    this.readyState=0; this.binaryType='arraybuffer';
    this.onopen=null; this.onmessage=null; this.onerror=null; this.onclose=null;
    this._server=server;
    server.deliver=(framed)=>{ setTimeout(()=>{ if(this.readyState===1 && this.onmessage)
      this.onmessage({ data: framed.buffer.slice(framed.byteOffset, framed.byteOffset+framed.byteLength) }); }, 0); };
    setTimeout(()=>{ this.readyState=1; if(this.onopen) this.onopen({}); this._server.begin(); }, 0);
  }
  send(data){ const u8 = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer||data);
    try { this._server.onClientFrame(u8); } catch(e){} }
  close(){ this.readyState=3; this._server.stopped=true; if(this.onclose) this.onclose({ code:1000, reason:'offline' }); }
}

export function createSocket(config){
  config = config || {};
  const rng = config.rng || Math.random;
  const server = new FakeServer({ me:{ name: config.nick || 'You' }, botPool: BOT_POOL, rng,
    botSkill: config.botSkill || 'mixed',
    pace: (fn, ms)=> setTimeout(fn, ms||0) });
  return new FakeSocket(server);
}

if (typeof window !== 'undefined') window.PokerOffline = { createSocket, BOT_POOL };
