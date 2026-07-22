/**
 * Offline mode — minimal protobuf wire codec + PokerTH framing.
 * Mirrors exactly the wire format the existing client speaks:
 *  - varint (wire 0) and length-delimited (wire 2) fields,
 *  - a PokerTHMessage envelope: field 1 = message type id, plus ONE
 *    length-delimited field (the sub-message) whose number is given by WRAP,
 *  - transport framing: 4-byte BIG-ENDIAN length prefix + body (proxy mode).
 * Only the subset needed for an offline Sit'n'Go is implemented.
 */

// message-type id -> envelope (wrapper) field number  (from the client's map)
export const WRAP = {
  Announce:2, Init:3, InitAck:7, PlayerList:13,
  GameListNew:14, GameListUpdate:15, GamePlayerJoined:27, GamePlayerLeft:28, PlayerInfoReply:20,
  JoinGameAck:25, JoinGameFailed:26,
  StartEvent:37, GameStartInitial:39,
  HandStart:41, PlayersTurn:42, MyActionRequest:43, PlayersActionDone:45,
  DealFlop:46, DealTurn:47, DealRiver:48, AllInShowCards:49,
  EndOfHandShow:50, EndOfHandHide:51, EndOfGame:54,
  Chat:65,
};
// type name -> type id
export const TYPE = {
  Announce:1, Init:2, InitAck:6, PlayerList:12, GameListNew:13,
  GamePlayerJoined:26, GamePlayerLeft:27, PlayerInfoReply:19, JoinGameAck:24, JoinGameFailed:25,
  StartEvent:36, StartEventAck:37, GameStartInitial:38,
  HandStart:40, PlayersTurn:41, MyActionRequest:42, PlayersActionDone:44,
  DealFlop:45, DealTurn:46, DealRiver:47, AllInShowCards:48,
  EndOfHandShow:49, EndOfHandHide:50, EndOfGame:53,
  JoinExisting:21, JoinNew:22, PlayerInfoRequest:18, LeaveGame:31,
  GameListUpdate:14, RemovedFromGame:29,
  Chat:64,
};

function varintBytes(n){ const o=[]; n=n>>>0 ? n : Math.max(0,Math.floor(n)); let v=n; do{ let b=v&0x7f; v=Math.floor(v/128); if(v>0) b|=0x80; o.push(b);}while(v>0); return o; }

// spec: array of [fieldNum, wireType, value]
//   wire 0 -> value is a number (uint)
//   wire 2 -> value is Uint8Array | number[] (raw bytes) | string
export function encode(spec){
  const out=[];
  for(const [f,w,v] of spec){
    if(v===undefined||v===null) continue;
    out.push(...varintBytes((f<<3)|w));
    if(w===0){ out.push(...varintBytes(v)); }
    else if(w===2){
      let bytes;
      if(typeof v==='string'){ bytes=[...new TextEncoder().encode(v)]; }
      else if(v instanceof Uint8Array){ bytes=[...v]; }
      else { bytes=[...v]; }
      out.push(...varintBytes(bytes.length)); out.push(...bytes);
    }
  }
  return new Uint8Array(out);
}

// Build a framed PokerTHMessage ready to hand to the client's onmessage.
export function buildMessage(typeName, subSpec){
  const sub = encode(subSpec);
  const env = encode([[1,0,TYPE[typeName]],[WRAP[typeName],2,sub]]);
  return frame(env);
}
export function frame(bytes){
  const out=new Uint8Array(4+bytes.length);
  new DataView(out.buffer).setUint32(0, bytes.length, false); // big-endian
  out.set(bytes,4);
  return out;
}

// packed repeated uint32 -> Uint8Array (concatenated varints), used as a wire-2 value
export function packed(arr){ const o=[]; for(let n of arr){ let v=n; do{ let b=v&0x7f; v=Math.floor(v/128); if(v>0) b|=0x80; o.push(b);}while(v>0);} return new Uint8Array(o); }

// ---- parsing (client -> server messages) ----
export function readFields(buf){ // -> { field: [values...] } ; varint=Number, len-delim=Uint8Array
  const map={}; let i=0;
  const rv=()=>{ let s=0,r=0,b; do{ b=buf[i++]; r+=(b&0x7f)*Math.pow(2,s); s+=7; }while(b&0x80); return r; };
  while(i<buf.length){
    const key=rv(), f=key>>>3, w=key&7;
    let val;
    if(w===0) val=rv();
    else if(w===2){ const len=rv(); val=buf.slice(i,i+len); i+=len; }
    else if(w===5){ val=new DataView(buf.buffer,buf.byteOffset+i,4).getUint32(0,true); i+=4; }
    else if(w===1){ i+=8; val=0; }
    else continue;
    (map[f]||(map[f]=[])).push(val);
  }
  return map;
}
// deframe + unwrap an OUTGOING client frame -> { typeId, sub: Uint8Array, fields }
export function parseClientFrame(frameBytes){
  // strip 4-byte BE length prefix
  const len=new DataView(frameBytes.buffer,frameBytes.byteOffset).getUint32(0,false);
  const body=frameBytes.slice(4,4+len);
  const top=readFields(body);
  const typeId=top[1] ? top[1][0] : 0;
  // sub = the single len-delim field that isn't field 1
  let sub=null; for(const k in top){ if(+k!==1 && top[k][0] instanceof Uint8Array){ sub=top[k][0]; break; } }
  return { typeId, sub, fields: sub?readFields(sub):{} };
}
