#!/usr/bin/env node
// Ace's Help — first visit, the order of the questions (web.265). On a blank
// browser with no backup folder remembered, « First time on PokerTH? » comes
// first and the local backup offer waits for its answer (kept from its
// fallback banner):
//   · « I already play » → the backup offer at once, as « Had a backup of
//     your settings? », Restore first, counted backup.returning;
//   · « Show me » → the backup offer is put off to a later visit (defer), the
//     help turns on with a short welcome that goes by itself.
// Drives the real page and modules/guide/index.mjs in jsdom against a stub of
// window._bakOffer, one scenario per process (fresh module state).
// Run: node scripts/test-guide-offer-order.mjs   (needs jsdom)
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { pathToFileURL, fileURLToPath } from 'url';

const SCENARIO = process.argv[2];
if (!SCENARIO) {
  let failed = 0;
  for (const s of ['returning', 'newcomer']) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), s], { encoding: 'utf8', timeout: 120000 });
    process.stdout.write(`── ${s}\n` + (r.stdout || '') + (r.stderr || ''));
    if (r.status !== 0) failed++;
  }
  // wiring of the module side (backup-autosave.mjs)
  const bk = fs.readFileSync('public/modules/backup-autosave.mjs', 'utf8');
  const wire = [
    [/keep: _offerKeep,\s*defer: _offerDefer,\s*known: \(\) => !!_state\.dirName,/.test(bk), 'the module hands keep / defer / known to the Ace'],
    [/!_offer\.shown && !_offer\.kept\) _offerFallback\(\); \}, WATCH_MS\)/.test(bk), 'a kept offer gets no fallback banner'],
    [/const next = !_FRESH_AT_BOOT && _nextOffer\(\);/.test(bk) && /!\(_FRESH_AT_BOOT \|\| \(next && !_state\.dirName\)\)/.test(bk), 'put off: offered again at the next visit, unless a folder was picked'],
    [/_offer\.shown = true;\s*_setNext\(false\);/.test(bk), 'shown once: no more « next visit »'],
  ];
  // web.268: « Create an account » → back with an account
  const gi = fs.readFileSync('public/modules/guide/index.mjs', 'utf8');
  const en = fs.readFileSync('public/modules/guide/lang/en.mjs', 'utf8');
  wire.push([/else if \(id === 'signup'\) \{ window\.open\(SIGNUP_URL, '_blank', 'noopener'\); signedUp\(cid\); \}/.test(gi), 'signup: the device remembers it, the Ace says how to come back']);
  wire.push([/if \(!w \|\| !w\.net \|\| w\.guest \|\| \(w\.screen !== 'lobby' && w\.screen !== 'wait'\)\) return;/.test(gi) && /beacon\(rec\.c, 'account'\)/.test(gi) && /try \{ trackSignup\(w\); \} catch/.test(gi), 'back in the lobby with an account: <ctx>.account, once']);
  wire.push([/signupThen: '[^']*\*\*Internet\*\*[^']*\*\*Guest mode\*\*/.test(en) && /c1Guest: '[^']*seasonal ranking/.test(en), 'texts: what the account brings, how to come back (Internet, Guest mode)']);
  let pass = 0;
  for (const [c, label] of wire) { console.log((c ? '  ✓ ' : '  ✗ ') + label); if (c) pass++; else failed++; }
  console.log(`\nwiring: ${pass}/${wire.length} · scenarios failed: ${failed}`);
  process.exit(failed ? 1 : 0);
}

const { JSDOM } = await import('jsdom');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('  ✓ ' + label); } else { fail++; console.log('  ✗ ' + label); } }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 6000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await wait(50); } return !!fn(); }

const html = fs.readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://webclient.pokerth.net/', pretendToBeVisual: true });
const w = dom.window;
globalThis.window = w;
for (const k of ['document', 'localStorage', 'location', 'navigator', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'CustomEvent', 'Event',
  'MutationObserver', 'Node', 'HTMLElement', 'Element']) { try { globalThis[k] = w[k]; } catch (e) {} }
w.matchMedia = () => ({ matches: true, addListener() {}, addEventListener() {} });   // reduced motion: the plain bubble
globalThis.matchMedia = w.matchMedia;
w.document.documentElement.classList.add('reduce-fx');
const sp = w.document.getElementById('boot-splash'); if (sp) sp.classList.add('bs-hide');
for (const id of ['s-connect', 's-lobby', 's-create', 's-game']) { const el = w.document.getElementById(id); if (el) el.classList.toggle('active', id === 's-connect'); }
w.localStorage.setItem('pth_lang', 'fr');
const T = (k) => (typeof w.t === 'function' ? w.t(k) : k);

// the module's side, stubbed: a blank browser, no backup folder remembered
const calls = [];
let pending = true;
w._bakOffer = {
  pending: () => pending,
  claim: () => pending,
  shown: () => calls.push('shown'),
  fallback: () => calls.push('fallback'),
  texts: () => ({ title: T('bakBannerTitle'), body: T('bakBannerBody'), create: T('bakBannerCreate'), restore: T('bakBannerRestore'),
    later: T('bakBannerLater'), created: T('bakBannerCreated'), imported: T('backupImported'), busy: T('bakRestoreBusy') }),
  path: () => 'pokerth-web-backup.json',
  why: (c) => 'WHY:' + c, hint: () => 'hint', show: () => calls.push('show'),
  create: () => Promise.resolve('abort'), restore: () => Promise.resolve('abort'),
  done: (later) => { calls.push('done:' + !!later); pending = false; },
  known: () => false,
  keep: () => calls.push('keep'),
  defer: () => { calls.push('defer'); pending = false; },
};
for (const k of Object.getOwnPropertyNames(w)) { if (k === 'performance' || k in globalThis) continue; try { globalThis[k] = w[k]; } catch (e) {} }

await import(pathToFileURL(path.resolve('public/modules/guide/index.mjs')).href);
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
const bub = () => w.document.querySelector('#ace-dock .ad-bubble.ad-open');
const ids = () => (bub() ? [...bub().querySelectorAll('[data-ad-btn]')].map((x) => x.getAttribute('data-ad-btn')) : []);
const queue = () => { try { return JSON.parse(w.localStorage.getItem('pth_guide_q') || '[]'); } catch (e) { return []; } };

ok(await until(() => bub() && /Première fois sur PokerTH/.test(bub().textContent)), 'first: « Première fois sur PokerTH ? »');
ok(!bub().querySelector('.ad-bak-path') && calls.includes('keep') && !calls.includes('shown') && !calls.includes('fallback'), 'the backup offer waits, kept from its banner');
ok(ids().join(',') === 'offerNo,offerYes' && /Je connais déjà/.test(bub().textContent) && /Montre-moi/.test(bub().textContent), 'buttons « Je connais déjà » / « Montre-moi »');

if (SCENARIO === 'returning') {
  bub().querySelector('[data-ad-btn="offerNo"]').click();
  ok(await until(() => bub() && bub().querySelector('.ad-bak-path')), '« Je connais déjà » → the backup offer at once');
  ok(/Tu avais une sauvegarde de tes réglages/.test(bub().textContent), 'asked as « Tu avais une sauvegarde de tes réglages ? »');
  ok(ids().join(',') === 'bakLater,bakRestore,bakCreate' && bub().querySelector('.ad-primary').getAttribute('data-ad-btn') === 'bakRestore', 'Restore first in line');
  ok(!calls.includes('defer') && w.localStorage.getItem('pth_guide_on') !== '1', 'not put off, the tips stay off');
  await wait(100);
  const q = queue().map((e) => e.join('.'));
  ok(q.includes('offer.dismissed') && q.includes('backup.shown') && q.includes('backup.returning'), 'counted: offer.dismissed, backup.shown, backup.returning');
} else {
  bub().querySelector('[data-ad-btn="offerYes"]').click();
  ok(await until(() => calls.includes('defer')), '« Montre-moi » → the backup offer is put off to a later visit');
  ok(await until(() => bub() && /je reste en bas à droite/.test(bub().textContent)), 'a short welcome');
  ok(!bub().querySelector('.ad-bak-path') && w.localStorage.getItem('pth_guide_on') === '1', 'no backup offer, the tips are on');
  ok(await until(() => /"welcome"/.test(w.localStorage.getItem('pth_guide_seen') || ''), 8000), 'the welcome goes by itself (6 s)');
  await wait(100);
  const q = queue().map((e) => e.join('.'));
  ok(q.includes('offer.accepted') && !q.includes('backup.shown'), 'counted: offer.accepted, no backup shown');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
