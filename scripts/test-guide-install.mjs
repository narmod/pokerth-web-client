#!/usr/bin/env node
// Ace's Help — « Want PokerTH on your home screen? » after a finished game
// (web.269). Drives the real page and modules/guide/index.mjs in jsdom, tips
// OFF (the question is for everyone), one scenario per process:
//   · prompt   — Chromium's install prompt available: after a game played and
//                left, the question in the lobby, Later / Install now; Install
//                now runs window.pwaInstall(); counted shown / install, then
//                installed on appinstalled; asked once per page;
//   · ios      — no prompt on an iPhone: « Show me » → the steps (Share → Add
//                to Home Screen), counted howto;
//   · twice    — already asked twice on this device: never again;
//   · watcher  — a game only watched (spectator): no question;
//   · desktop  — a desktop browser without the prompt (Firefox): no question.
// Run: node scripts/test-guide-install.mjs   (needs jsdom)
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { pathToFileURL, fileURLToPath } from 'url';

const SCENARIO = process.argv[2];
if (!SCENARIO) {
  let failed = 0;
  for (const s of ['prompt', 'ios', 'twice', 'watcher', 'desktop']) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), s], { encoding: 'utf8', timeout: 120000 });
    process.stdout.write(`── ${s}\n` + (r.stdout || '') + (r.stderr || ''));
    if (r.status !== 0) failed++;
  }
  console.log(`\nscenarios failed: ${failed}`);
  process.exit(failed ? 1 : 0);
}

const { JSDOM } = await import('jsdom');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('  ✓ ' + label); } else { fail++; console.log('  ✗ ' + label); } }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 6000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await wait(50); } return !!fn(); }

const UA = {
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
  prompt: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
};
const html = fs.readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://webclient.pokerth.net/', pretendToBeVisual: true });
const w = dom.window;
globalThis.window = w;
for (const k of ['document', 'localStorage', 'location', 'navigator', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'CustomEvent', 'Event',
  'MutationObserver', 'Node', 'HTMLElement', 'Element']) { try { globalThis[k] = w[k]; } catch (e) {} }
// Node 22 has its own read-only navigator: the page's one (its user agent) must win; jsdom
// ignores the userAgent option without a resource loader, so it is set on navigator itself
Object.defineProperty(w.navigator, 'userAgent', { get: () => UA[SCENARIO] || UA.prompt, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true, writable: true });
w.matchMedia = (q) => ({ matches: !/standalone/.test(q), addListener() {}, addEventListener() {} });   // reduced motion, not installed
globalThis.matchMedia = w.matchMedia;
w.document.documentElement.classList.add('reduce-fx');
const sp = w.document.getElementById('boot-splash'); if (sp) sp.classList.add('bs-hide');
const screen = (id) => { for (const s of ['s-connect', 's-lobby', 's-create', 's-game']) { const el = w.document.getElementById(s); if (el) el.classList.toggle('active', s === id); } };
screen('s-lobby');
w.localStorage.setItem('pth_lang', 'fr');
w.localStorage.setItem('pth_guide_offered', '1');            // « First time on PokerTH? » answered « I already play »: tips off
if (SCENARIO === 'twice') { w.localStorage.setItem('pth_inst_n', '2'); w.localStorage.setItem('pth_inst_at', '1'); }
const calls = [];
w.PthState = { _currentLoginMode: 'guest', loaded: true, games: {}, seats: [], seatData: {} };
w.pwaInstalled = () => false;
w.pwaCanPrompt = () => SCENARIO !== 'ios' && SCENARIO !== 'desktop';
w.pwaInstall = () => calls.push('pwaInstall');
for (const k of Object.getOwnPropertyNames(w)) { if (k === 'performance' || k in globalThis) continue; try { globalThis[k] = w[k]; } catch (e) {} }

await import(pathToFileURL(path.resolve('public/modules/guide/index.mjs')).href);
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
const bub = () => w.document.querySelector('#ace-dock .ad-bubble.ad-open');
const ids = () => (bub() ? [...bub().querySelectorAll('[data-ad-btn]')].map((x) => x.getAttribute('data-ad-btn')) : []);
const queue = () => { try { return JSON.parse(w.localStorage.getItem('pth_guide_q') || '[]').map((e) => e.join('.')); } catch (e) { return []; } };
const asked = () => !!(bub() && /écran d’accueil/.test(bub().textContent));

await wait(600);
ok(!asked(), 'nothing before a game');
// a game: the table, hands played (or only watched), then back to the lobby
w.PthState._amSpectator = SCENARIO === 'watcher';
w.PthState._gameStarted = true;
screen('s-game');
await wait(900);
w.PthState._gameStarted = false;
screen('s-lobby');

if (SCENARIO === 'twice' || SCENARIO === 'watcher' || SCENARIO === 'desktop') {
  await wait(3500);
  ok(!asked() && !queue().includes('install.shown'), SCENARIO === 'twice' ? 'asked twice already: never again' : SCENARIO === 'watcher' ? 'a game only watched: no question' : 'a desktop browser that cannot install: no question');
} else {
  ok(await until(asked), 'back in the lobby after a game: « Tu veux PokerTH sur ton écran d’accueil ? »');
  ok(/plein écran/.test(bub().textContent), 'with the reasons (full screen, own icon, offline training)');
  ok(w.localStorage.getItem('pth_inst_n') === '1' && Number(w.localStorage.getItem('pth_inst_at')) > 0, 'counted on the device (1st time)');
  if (SCENARIO === 'prompt') {
    ok(ids().join(',') === 'later,instNow' && bub().querySelector('.ad-primary').getAttribute('data-ad-btn') === 'instNow', 'Later / Install now');
    bub().querySelector('[data-ad-btn="instNow"]').click();
    ok(calls.includes('pwaInstall'), 'Install now → the browser\'s own prompt');
    w.dispatchEvent(new w.Event('appinstalled'));
    await wait(200);
    const q = queue();
    ok(q.includes('install.shown') && q.includes('install.install') && q.includes('install.installed'), 'counted: shown, install, installed — ' + q.filter((e) => e.startsWith('install')).join(','));
    // another game on the same page: not asked again
    w.PthState._gameStarted = true; screen('s-game'); await wait(900); w.PthState._gameStarted = false; screen('s-lobby');
    await wait(3000);
    ok(!asked(), 'asked once per page');
  } else {
    ok(ids().join(',') === 'later,offerYes' && /Montre-moi/.test(bub().textContent), 'no prompt on iPhone: Later / Show me');
    bub().querySelector('[data-ad-btn="offerYes"]').click();
    ok(await until(() => bub() && /Sur l’écran d’accueil|écran d’accueil/.test(bub().textContent) && /Partager/.test(bub().textContent)), 'Show me → the steps on iPhone (Share → Add to Home Screen)');
    await wait(200);
    ok(queue().includes('install.howto'), 'counted: howto');
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
