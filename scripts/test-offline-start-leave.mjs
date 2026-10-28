#!/usr/bin/env node
// Training: leaving the table (or re-creating it) within the 300 ms between
// StartEventAck and the first hand made the paced start read this.table after
// _closeAndReset had set it to null: « Cannot read properties of null
// (reading 'start') » (offline/server.mjs, ChromeOS · Chrome 156, web.338).
// Run: node scripts/test-offline-start-leave.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
for (const k of ['window', 'document', 'localStorage', 'navigator', 'CustomEvent', 'Event']) { try { globalThis[k] = k === 'window' ? dom.window : dom.window[k]; } catch (e) {} }
const { FakeServer } = await import(path.join(root, 'public/modules/offline/server.mjs'));

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (c) console.log('  ✓ ' + m); else { fail++; console.log('  ✗ ' + m); } };

function rig() {
  const q = [];
  const srv = new FakeServer({ me: { name: 'Me' }, botPool: [['B1', 'x', 'rock'], ['B2', 'y', 'tag']],
    rng: Math.random, pace: (fn) => { q.push(fn); } });
  srv.deliver = () => {};
  srv.players = [srv.players[0] || { id: 1, name: 'Me', isBot: false }, { id: 2, name: 'B1', isBot: true }];
  return { srv, q, run() { const fs = q.splice(0); let e = null; for (const f of fs) { try { f(); } catch (x) { e = e || x; } } return e; } };
}

{ // leave before the paced start
  const R = rig();
  R.srv._onStartAck();
  ok(!!R.srv.table && R.q.length === 1, 'StartEventAck builds the table and paces its start');
  R.srv._closeAndReset();
  const e = R.run();
  ok(!e, 'leaving within the delay: the paced start does not throw' + (e ? ' (' + e.message + ')' : ''));
}
{ // normal path still starts the hand
  const R = rig();
  R.srv._onStartAck();
  const tb = R.srv.table; let started = 0; const orig = tb.start.bind(tb); tb.start = () => { started++; };
  const e = R.run();
  ok(!e && started === 1, 'no leave: the table starts once');
  tb.start = orig;
}
{ // stopped server: nothing starts
  const R = rig();
  R.srv._onStartAck();
  const tb = R.srv.table; let started = 0; tb.start = () => { started++; };
  R.srv.stopped = true;
  ok(!R.run() && started === 0, 'stopped server: the paced start is dropped');
}

console.log((n - fail) + '/' + n + ' passed');
process.exit(fail ? 1 : 0);
