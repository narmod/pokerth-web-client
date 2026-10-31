// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/lan/bc-link.mjs — « Play nearby » over BroadcastChannel
// (web extension, no QML counterpart; narmod 2026-10-31).
//
// A TEST and development carrier: it links tabs of ONE browser (same origin),
// which is enough to play a nearby game with two tabs before the WebRTC
// carrier exists, and lets scripts/test-nearby.mjs run real channels in Node.
// Every tab on the channel sees every frame — hole cards included — so it is
// never offered to players; the real carrier (step 2) is one private
// DataChannel per guest.
//
//   host:  const link = hostOverBroadcast(server, 'pth-nearby');   link.close()
//   guest: S.ws = createBroadcastSocket('pth-nearby');
//
// Channel messages: { k: 'hi' | 'f' | 'bye', c: <guest id>, d: 'g' | 'h', b?: Uint8Array }
// (d = direction: 'g' guest→host, 'h' host→guest).
// ─────────────────────────────────────────────────────────────────────────

import { PipeSocket } from './pipe-socket.mjs';

function _bc(name) {
  const BC = /** @type {any} */ (globalThis).BroadcastChannel;
  if (typeof BC !== 'function') throw new Error('BroadcastChannel unavailable');
  return new BC(name);
}

/**
 * Serve a LocalServer to the guest tabs listening on `name`.
 * @param {import('./local-server.mjs').LocalServer} server
 * @param {string} name
 */
export function hostOverBroadcast(server, name) {
  const ch = _bc(name);
  /** @type {Map<string, any>} */ const guests = new Map();
  ch.onmessage = (ev) => {
    const m = ev && ev.data; if (!m || m.d !== 'g' || typeof m.c !== 'string') return;
    if (m.k === 'hi') {
      if (guests.has(m.c)) return;
      const c = m.c;
      const h = server.attach({
        send: (u8) => { try { ch.postMessage({ k: 'f', c, d: 'h', b: u8 }); } catch (e) {} },
        close: () => { guests.delete(c); try { ch.postMessage({ k: 'bye', c, d: 'h' }); } catch (e) {} },
      });
      guests.set(c, h);
    } else if (m.k === 'f') {
      const h = guests.get(m.c); if (h && m.b) h.receive(m.b instanceof Uint8Array ? m.b : new Uint8Array(m.b));
    } else if (m.k === 'bye') {
      const h = guests.get(m.c); if (h) { guests.delete(m.c); h.detach(); }
    }
  };
  return {
    close() {
      for (const [c, h] of guests) { try { ch.postMessage({ k: 'bye', c, d: 'h' }); } catch (e) {} h.detach(); }
      guests.clear();
      try { ch.close(); } catch (e) {}
    },
  };
}

/**
 * A guest's socket to the host serving on `name`.
 * @param {string} name
 * @param {string} [id] guest id on the channel (random by default)
 */
export function createBroadcastSocket(name, id) {
  const ch = _bc(name);
  const c = id || ('g' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
  const sock = new PipeSocket((u8) => { try { ch.postMessage({ k: 'f', c, d: 'g', b: u8 }); } catch (e) {} });
  ch.onmessage = (ev) => {
    const m = ev && ev.data; if (!m || m.d !== 'h' || m.c !== c) return;
    if (m.k === 'f' && m.b) sock._deliver(m.b instanceof Uint8Array ? m.b : new Uint8Array(m.b));
    else if (m.k === 'bye') { sock._remoteClosed('nearby-host-left'); try { ch.close(); } catch (e) {} }
  };
  sock.onLocalClose = () => { try { ch.postMessage({ k: 'bye', c, d: 'g' }); } catch (e) {} try { ch.close(); } catch (e) {} };
  sock._open();
  // Say hello once open (the host attaches and sends its Announce).
  setTimeout(() => { if (sock.readyState === 1) { try { ch.postMessage({ k: 'hi', c, d: 'g' }); } catch (e) {} } }, 0);
  return sock;
}
