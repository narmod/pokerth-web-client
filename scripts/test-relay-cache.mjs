// Deterministic checks for server/relay-cache.js (web.254): dedup, failure
// memory, stale-while-revalidate, purge. Fake clock, no network.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createRelayCache } = require('../server/relay-cache.js');

let fails = 0;
function ok(c, m) { if (c) console.log('  ✓ ' + m); else { fails++; console.log('  ✗ ' + m); } }

let T = 1000000;
const clock = () => T;
const mk = (o) => createRelayCache(Object.assign({ now: clock, failTtlMs: 60000, keepMs: 3600000, max: 5 }, o || {}));
function deferred() { let res, rej; const p = new Promise((a, b) => { res = a; rej = b; }); return { p, res, rej }; }

// 1. one upstream call per key at a time
{
  const R = mk(); let calls = 0; const d = deferred();
  const produce = () => { calls++; return d.p; };
  const a = R.get('k', 1000, produce), b = R.get('k', 1000, produce), c = R.get('k', 1000, produce);
  d.res({ status: 200, body: 'A' });
  const out = await Promise.all([a, b, c]);
  ok(calls === 1 && out.every(o => o.body === 'A' && o.note === 'miss'), 'three simultaneous requests share one upstream read');
  const h = await R.get('k', 1000, produce);
  ok(calls === 1 && h.note === 'hit', 'then served from cache');
}

// 2. failures remembered, good copy kept
{
  const R = mk(); let calls = 0;
  const bad = () => { calls++; return Promise.reject(new Error('down')); };
  const f1 = await R.get('x', 1000, bad);
  const f2 = await R.get('x', 1000, bad);
  ok(calls === 1 && f1.status === 502 && f2.note === 'fail' && JSON.parse(f2.body).error === 'relay_failed', 'a site that is down is not retried during the cool-down');
  T += 60001;
  await R.get('x', 1000, bad);
  ok(calls === 2, 'retried once the cool-down is over');

  let n = 0;
  await R.get('y', 1000, () => { n++; return Promise.resolve({ status: 200, body: 'GOOD' }); });
  T += 2000;
  const s = await R.get('y', 1000, () => { n++; return Promise.resolve({ status: 503, body: 'BAD' }); });
  ok(s.body === 'GOOD' && s.note === 'stale', 'a failed refresh falls back on the last good copy');
  const s2 = await R.get('y', 1000, () => { n++; return Promise.resolve({ status: 200, body: 'NEW' }); });
  ok(n === 2 && s2.body === 'GOOD' && s2.note === 'stale', 'no retry during the cool-down, the good copy keeps being served');
  const fb = await mk().get('z', 1000, () => Promise.reject(new Error('x')), { failBody: () => '{"ok":false,"sec":60}' });
  ok(JSON.parse(fb.body).sec === 60, 'custom failure body');
}

// 3. stale-while-revalidate
{
  const R = mk(); let calls = 0;
  await R.get('s', 1000, () => { calls++; return Promise.resolve({ status: 200, body: 'V1' }); }, { swr: true });
  T += 5000;
  const d = deferred();
  const o = await R.get('s', 1000, () => { calls++; return d.p; }, { swr: true });
  ok(o.body === 'V1' && o.note === 'stale' && calls === 2, 'expired copy served at once, refresh started behind it');
  const o2 = await R.get('s', 1000, () => { calls++; return d.p; }, { swr: true });
  ok(calls === 2 && o2.note === 'stale', 'no second refresh while one is running');
  d.res({ status: 200, body: 'V2' }); await d.p; await new Promise(r => setTimeout(r, 0));
  const o3 = await R.get('s', 1000, () => { calls++; return d.p; }, { swr: true });
  ok(o3.body === 'V2' && o3.note === 'hit', 'the refreshed copy is served afterwards');
  const w = mk(); let wc = 0;
  await w.warm('e', 1000, () => { wc++; return Promise.resolve({ status: 200, body: 'W' }); });
  ok(wc === 1 && (await w.get('e', 1000, () => Promise.resolve({ status: 200, body: '?' }))).body === 'W', 'warm-up fills the cache');
}

// 4. purge
{
  const R = mk({ pinned: ['pin'] });
  const put = (k) => R.get(k, 1000, () => Promise.resolve({ status: 200, body: k }));
  await put('pin'); await put('old');
  T += 3600001;
  await put('a'); await put('b');
  R.purge();
  ok(R.cache.has('pin') && !R.cache.has('old') && R.cache.has('a'), 'old copies purged, pinned kept');
  for (const k of ['c', 'd', 'e', 'f', 'g']) await put(k);
  R.purge();
  ok(R.cache.size === 5 && R.cache.has('pin') && !R.cache.has('a') && R.cache.has('g'), 'trimmed to max, oldest writes first, pinned kept');
}

console.log(fails ? '\n' + fails + ' FAILED' : '\nAll relay-cache checks passed');
process.exit(fails ? 1 : 0);
