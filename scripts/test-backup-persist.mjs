#!/usr/bin/env node
// Deterministic tests for the Firefox path of public/modules/backup-autosave.mjs
// (web.31): Firefox cannot write to a folder, so the module offers — through
// the Ace (window._bakOffer, kind 'persist') — to protect the settings with
// persistent storage, asked on the player's click.
//   - offered on Firefox only, when the storage is not persistent yet;
//   - at most PERSIST_MAX (3) showings per device, counted when shown;
//   - granted → never offered again; refused → final (Firefox remembers it);
//   - not offered under automation, nor on other browsers.
// Each scenario runs the module in a fresh child process (module state is
// per process). Run: node scripts/test-backup-persist.mjs
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOD = pathToFileURL(path.join(root, 'public/modules/backup-autosave.mjs')).href;
let pass = 0, fail = 0;
function check(label, cond) { if (cond) { pass++; console.log('ok  - ' + label); } else { fail++; console.log('FAIL - ' + label); } }

// One scenario: { ua, persisted, grant, n, webdriver, ask } → what the module did.
function run(o) {
  const code = `
    const store = new Map(Object.entries(${JSON.stringify(o.store || {})}));
    globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
    globalThis.window = globalThis;
    const events = [];
    globalThis.CustomEvent = class { constructor(t) { this.type = t; } };
    globalThis.document = { readyState: 'complete', addEventListener() {}, getElementById: () => null, querySelector: () => null,
      dispatchEvent: (e) => { events.push(e.type); return true; }, body: { appendChild() {} }, visibilityState: 'visible' };
    globalThis.addEventListener = () => {};
    globalThis.setInterval = () => 0;
    const calls = [];
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
      userAgent: ${JSON.stringify(o.ua)}, webdriver: ${!!o.webdriver},
      storage: { persisted: () => Promise.resolve(${!!o.persisted}), persist: () => { calls.push('persist'); return Promise.resolve(${!!o.grant}); } },
    } });
    await import(${JSON.stringify(MOD)});
    await new Promise((r) => setTimeout(r, 30));
    const B = globalThis._bakOffer;
    const out = { events, pending: B.pending(), kind: B.kind() };
    if (out.pending) {
      B.claim(); B.shown(); B.shown();   // shown twice in a page: counted once
      out.nAfterShow = store.get('pth_persist_n');
      if (${!!o.ask}) { out.res = await B.persist(); out.calls = calls; out.nAfterAsk = store.get('pth_persist_n'); }
    }
    console.log(JSON.stringify(out));
  `;
  const res = execFileSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8' });
  return JSON.parse(res.trim().split('\n').pop());
}

const FF = 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0';
const CH = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

let r = run({ ua: FF, persisted: false });
check('Firefox, not persistent: the offer is made (pth:bakoffer, kind persist)', r.events.includes('pth:bakoffer') && r.pending && r.kind === 'persist');
check('a showing is counted once per page', r.nAfterShow === '1');

r = run({ ua: FF, persisted: false, store: { pth_persist_n: '2' } });
check('third showing still offered', r.pending && r.nAfterShow === '3');
r = run({ ua: FF, persisted: false, store: { pth_persist_n: '3' } });
check('after 3 showings: no more offer', !r.pending && !r.events.includes('pth:bakoffer'));

r = run({ ua: FF, persisted: true });
check('already persistent: no offer', !r.pending && !r.events.includes('pth:bakoffer'));

r = run({ ua: FF, persisted: false, grant: true, ask: true });
check('granted: « ok », never offered again', r.res === 'ok' && r.calls.join() === 'persist' && r.nAfterAsk === '3');
r = run({ ua: FF, persisted: false, grant: false, ask: true });
check('refused: « no », final (Firefox remembers it)', r.res === 'no' && r.nAfterAsk === '3');

r = run({ ua: CH, persisted: false });
check('other browsers (no folder API here either): no protect offer', !r.pending && !r.events.includes('pth:bakoffer'));
r = run({ ua: FF, persisted: false, webdriver: true });
check('automated Firefox: no offer', !r.pending);
r = run({ ua: FF, persisted: false, store: { pth_bak_auto: '0' } });
check('automatic backup switched off in the options: no offer', !r.pending);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
