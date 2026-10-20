// Free TCP port for a test proxy (or any test server), handed out by the OS.
//
// Tests used to pick « 18000 + random(900) » or a fixed port. Two tests running
// at the same time (npm scripts in parallel, CI matrix, a full-suite run) or a
// proxy left over by a previous test could then share a port: the second proxy
// failed to bind (stdio ignored, so silently) and the test talked to the OTHER
// one, with another allowlist and other data files — a rare, unexplained
// failure. Binding port 0 asks the OS for a port that is free right now.
import net from 'node:net';

export function freePort(host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, host, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

// Wait until the server at `base` answers HTTP, instead of a fixed sleep: a
// fixed 2.5 s was either wasted or too short on a loaded machine (CI runners,
// a full-suite run). If `proc` (the spawned child) exits first, fail at once
// with a clear message rather than letting the test hit someone else's port.
export async function waitForServer(base, proc, timeoutMs = 30000, path = '/__ver') {
  let exited = false, how = '';
  if (proc && typeof proc.once === 'function') proc.once('exit', (code, sig) => { exited = true; how = sig || ('code ' + code); });
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (exited) throw new Error('server exited before answering (' + how + ') at ' + base);
    try { const r = await fetch(base + path, { cache: 'no-store' }); if (r.status < 500) return; } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('server did not answer within ' + timeoutMs + ' ms at ' + base);
}
