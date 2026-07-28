#!/usr/bin/env node
// Deterministic tests for public/modules/ui/debuglog.mjs.
// Run: node scripts/test-debuglog.mjs
//
// The module patches the console at load and keeps a masked ring buffer.
// These checks cover what a bug report depends on: capture works, the
// originals still fire, credentials never reach the buffer, and the
// buffer cannot grow without bound.
globalThis.window = globalThis;
const seen = [];
['log', 'info', 'warn', 'error', 'debug'].forEach((l) => { console[l] = (...a) => seen.push(l + ':' + a.join(' ')); });
// Node 22 exposes a read-only navigator; the module only reads userAgent.
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'test-agent' }, configurable: true });
globalThis.document = {
  head: { appendChild() {} }, body: { appendChild() {} },
  getElementById: () => null, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
  addEventListener() {}, querySelectorAll: () => [], querySelector: () => null
};
window.addEventListener = () => {};

const D = await import('../public/modules/ui/debuglog.mjs');

let fails = 0;
const ok = (c, l) => { if (!c) { console.error('FAIL ' + l); fails++; } else seen.push('ok'), process.stdout.write('  ok   ' + l + '\n'); };

// 1) Capture + passthrough
console.log('hello world');
ok(D.debugLogTail().includes('hello world'), 'console.log lands in the buffer');
ok(seen.some((s) => s.startsWith('log:hello world')), 'the original console.log still fires');

console.error('boom');
ok(/\[ERROR\] boom/.test(D.debugLogTail()), 'level is recorded');
ok(/\d\d:\d\d:\d\d\.\d\d\d \[/.test(D.debugLogTail()), 'lines are timestamped');

// 2) Masking — this text is meant to be pasted in public
console.log('connecting with password: hunter2 now');
ok(!D.debugLogTail().includes('hunter2'), 'a password value never reaches the buffer');
console.log('token=abcdef123456');
ok(!D.debugLogTail().includes('abcdef123456'), 'a token value never reaches the buffer');
console.log('github_pat_ZZZZTESTZZZZ');
ok(!D.debugLogTail().includes('ZZZZTESTZZZZ'), 'a PAT never reaches the buffer');

// 3) Objects and errors are readable rather than [object Object]
console.log({ a: 1, b: 'two' });
ok(D.debugLogTail().includes('"b":"two"'), 'objects are serialised');
console.error(new Error('kaboom'));
ok(D.debugLogTail().includes('kaboom'), 'Error objects keep their message');

// 4) Ring buffer stays bounded
const big = 'x'.repeat(5000);
for (let i = 0; i < 60; i++) console.log(big);      // ~300 000 chars pushed
const len = D.debugLogTail().length;
ok(len <= 200000, 'buffer is capped at the tail size (' + len + ')');
ok(D.debugLogTail(500).length <= 500, 'debugLogTail(n) returns at most n chars');
ok(D.debugLogTail().endsWith(big), 'the newest line survives, the oldest are dropped');

// 5) Bridges used by the advanced-options button
ok(typeof window._openDebugLog === 'function' && typeof window._debugLogTail === 'function',
   'window._openDebugLog / _debugLogTail bridged');

if (fails) { console.error(fails + ' test(s) failed'); process.exit(1); }
process.stdout.write('All debug log tests passed.\n');
