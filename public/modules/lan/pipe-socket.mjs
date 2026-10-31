// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/pipe-socket.mjs — WebSocket look-alike for « Play nearby »
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// The client talks to its server through S.ws and only uses the WebSocket
// surface: readyState, binaryType, onopen / onmessage / onerror / onclose,
// send(), close(). PipeSocket offers exactly that over any carrier, so the
// client never knows it is not on the network:
//   · createLocalSocket(server)  — the host's own page, in memory, to its
//     LocalServer (like offline/index.mjs's FakeSocket for training);
//   · lan/bc-link.mjs            — another tab of the same browser (tests);
//   · the WebRTC DataChannel     — a guest's phone (step 2).
// Frames are the proxy's: [u32 BE length][PokerTHMessage], both directions.
// Deliveries are asynchronous (one task each), as from a real socket.
// ─────────────────────────────────────────────────────────────────────────

export class PipeSocket {
  /** @param {(u8: Uint8Array) => void} out  carries a frame from the client to the server */
  constructor(out) {
    this.CONNECTING = 0; this.OPEN = 1; this.CLOSING = 2; this.CLOSED = 3;
    this.readyState = 0; this.binaryType = 'arraybuffer';
    /** @type {any} */ this.onopen = null;
    /** @type {any} */ this.onmessage = null;
    /** @type {any} */ this.onerror = null;
    /** @type {any} */ this.onclose = null;
    this._out = out;
    /** @type {(() => void) | null} */ this.onLocalClose = null;   // carrier hook: the client hung up
  }
  send(data) {
    if (this.readyState !== 1) return;
    const u8 = data instanceof Uint8Array ? data : data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer || data);
    try { this._out(u8.slice()); } catch (e) {}
  }
  close(code, reason) {
    if (this.readyState >= 2) return;
    this.readyState = 3;
    try { if (this.onLocalClose) this.onLocalClose(); } catch (e) {}
    try { if (this.onclose) this.onclose({ code: code || 1000, reason: reason || 'closed', wasClean: true }); } catch (e) {}
  }
  // ── Carrier side ──
  _open() {
    setTimeout(() => {
      if (this.readyState !== 0) return;
      this.readyState = 1;
      try { if (this.onopen) this.onopen({}); } catch (e) {}
    }, 0);
  }
  /** @param {Uint8Array} u8 a frame from the server */
  _deliver(u8) {
    const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    setTimeout(() => {
      if (this.readyState !== 1) return;
      try { if (this.onmessage) this.onmessage({ data: buf }); } catch (e) {}
    }, 0);
  }
  /** The far end hung up. */
  _remoteClosed(reason) {
    setTimeout(() => {
      if (this.readyState >= 2) return;
      this.readyState = 3;
      try { if (this.onclose) this.onclose({ code: 1000, reason: reason || 'nearby-closed', wasClean: true }); } catch (e) {}
    }, 0);
  }
}

/**
 * The host's own connection to its LocalServer, in memory.
 * @param {import('./local-server.mjs').LocalServer} server
 */
export function createLocalSocket(server) {
  /** @type {any} */ let handle = null;
  const sock = new PipeSocket((u8) => { if (handle) handle.receive(u8); });
  sock.onLocalClose = () => { if (handle) { const h = handle; handle = null; h.detach(); } };
  const attachNow = () => {
    handle = server.attach({ send: (u8) => sock._deliver(u8), close: () => sock._remoteClosed('nearby-closed') });
  };
  // Attach once the client saw onopen, so the Announce lands after it.
  sock._open();
  setTimeout(() => { if (sock.readyState === 1) attachNow(); }, 0);
  return sock;
}
