#!/usr/bin/env node
// Ace's Help — the local backup offer (web.20): on a blank browser storage
// modules/backup-autosave.mjs offers to create or restore the backup file, and
// the Ace says it in his bubble, tips OFF included (the one exception to D3).
// Drives the real page and modules/guide/index.mjs in jsdom against a stub of
// window._bakOffer: the Ace claims the offer, shows title / text / path with
// Create / Restore / Later, runs the module's actions, tells a failure in the
// bubble, and lets the first-launch offer wait for it.
// Run: node scripts/test-guide-backup.mjs   (needs jsdom)
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('  ✓ ' + label); } else { fail++; console.log('  ✗ ' + label); } }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 4000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await wait(50); } return !!fn(); }

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
// a French player: the real catalogue, loaded after boot (the case that left the banner in English)
w.localStorage.setItem('pth_lang', 'fr');
const T = (k) => (typeof w.t === 'function' ? w.t(k) : k);

// the module's side, stubbed
const calls = [];
let pending = true, claimed = false, next = 'nofile';
const tx = () => ({ title: T('bakBannerTitle'), body: T('bakBannerBody'), create: T('bakBannerCreate'), restore: T('bakBannerRestore'),
  later: T('bakBannerLater'), created: T('bakBannerCreated'), imported: T('backupImported'), busy: T('bakRestoreBusy') });
w._bakOffer = {
  pending: () => pending,
  claim: () => { if (!pending) return false; claimed = true; return true; },
  shown: () => calls.push('shown'),
  fallback: () => calls.push('fallback'),
  texts: tx,
  path: () => 'pokerth / pokerth-web-backup.json',
  why: (c) => 'WHY:' + c,
  show: () => calls.push('show'),
  hint: (bold) => { const b = (s) => (bold ? '**' + s + '**' : s); return T('bakLaterHint').replace('{path}', b([T('advTitle'), T('advCatReset'), T('advBakAutoSec')].join(' → '))).replace('{btn}', b(T('advPdbAutoPick'))); },
  create: () => { calls.push('create'); return Promise.resolve(next); },
  restore: () => { calls.push('restore'); return Promise.resolve(next); },
  done: (later) => { calls.push('done:' + !!later); pending = false; },
};
for (const k of Object.getOwnPropertyNames(w)) { if (k === 'performance' || k in globalThis) continue; try { globalThis[k] = w[k]; } catch (e) {} }

await import(pathToFileURL(path.resolve('public/modules/guide/index.mjs')).href);
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
await wait(50);
ok(claimed, 'the Ace claims the offer at boot (tips off)');
const bub = () => w.document.querySelector('#ace-dock .ad-bubble.ad-open');
ok(await until(() => bub() && bub().querySelector('.ad-bak-path')), 'his bubble shows the offer');
const b = bub();
ok(b && /Sauvegarde locale de tes réglages/.test(b.textContent) && /dossier de ton choix/.test(b.textContent) && /pokerth-web-backup\.json/.test(b.textContent)
  && /Créer une sauvegarde/.test(b.textContent), 'title, text, path and buttons in the player\'s language (French)');
const ids = b ? [...b.querySelectorAll('[data-ad-btn]')].map((x) => x.getAttribute('data-ad-btn')) : [];
ok(ids.join(',') === 'bakLater,bakRestore,bakCreate' && b.querySelector('.ad-primary').getAttribute('data-ad-btn') === 'bakCreate', 'Later / Restore / Create, Create first in line');
ok(calls.includes('shown') && !calls.includes('fallback'), 'reported shown, no banner');
ok(w.guideDebug().on === false, 'his tips stay off');
// a failure is told in the bubble, the buttons come back
b.querySelector('[data-ad-btn="bakRestore"]').click();
ok(calls.includes('restore'), 'Restore runs the module\'s restore in the click');
ok(await until(() => bub() && bub().querySelector('.ad-bak-err')), 'a failure is told in the bubble');
ok(/WHY:nofile/.test(bub().textContent) && bub().querySelectorAll('[data-ad-btn]').length === 3, 'with the reason, buttons back');
// language change under the bubble: the texts follow
const realT = w.t; w.t = (k, p) => (k === 'bakBannerTitle' ? 'Local backup' : realT(k, p));
w.document.dispatchEvent(new w.CustomEvent('pth:langchange', { detail: { lang: 'en' } }));
ok(/Local backup/.test(bub().textContent), 'a language change redraws it');
// Later: done(true), then where to find it later, then he leaves (tips off)
w.t = realT;
bub().querySelector('[data-ad-btn="bakLater"]').click();
ok(calls.includes('done:true'), 'Later closes the offer (writing resumes)');
const hb = bub();
ok(hb && /Options avancées → Sauvegarde et réinitialisation → Sauvegarde automatique/.test(hb.textContent) && /Choisir le dossier/.test(hb.textContent)
  && hb.querySelectorAll('b').length === 2, 'Later: he says where to find it (path and button in bold, in French)');
ok(hb && [...hb.querySelectorAll('[data-ad-btn]')].map((x) => x.getAttribute('data-ad-btn')).join(',') === 'bakShowMe,gotIt'
  && hb.querySelector('.ad-primary').getAttribute('data-ad-btn') === 'gotIt', 'two buttons: Show me, then Got it');
ok(hb && /Me montrer/.test(hb.querySelector('[data-ad-btn="bakShowMe"]').textContent), '« Show me » in the player\'s language');
hb.querySelector('[data-ad-btn="bakShowMe"]').click();
ok(calls.includes('show'), '« Show me » opens the place');
ok(await until(() => !w.document.getElementById('ace-dock')), 'tips off: he leaves');

// statistics (admin, Ace's Help card): no server here, so the events wait in the offline queue
await wait(100);
const q = (() => { try { return JSON.parse(w.localStorage.getItem('pth_guide_q') || '[]'); } catch (e) { return []; } })()
  .filter((e) => e[0] === 'backup').map((e) => e[1]);
ok(['shown', 'restore', 'dismissed', 'showme'].every((e) => q.includes(e)) && q.filter((e) => e === 'shown').length === 1,
  'counted: shown (once), restore tapped, Later, Show me — ' + q.join(','));

// the module side of « Show me », on the real page: Advanced options, Backup & reset tab, the row flashed
const opened = [];
w.openAdvancedOptions = () => opened.push('open');
w.advSelectCat = (c) => opened.push('cat:' + c);
globalThis.openAdvancedOptions = w.openAdvancedOptions; globalThis.advSelectCat = w.advSelectCat;
await import(pathToFileURL(path.resolve('public/modules/backup-autosave.mjs')).href);
w._bakOffer.show();
ok(opened.join(',') === 'open,cat:reset', 'show(): opens Advanced options on Backup & reset');
const row = w.document.getElementById('adv-bakauto-pick').closest('.adv-row');
ok(await until(() => row.classList.contains('adv-hit'), 1000), 'show(): the « Choose folder… » row is flashed');

// wiring of the module side
const bk = fs.readFileSync('public/modules/backup-autosave.mjs', 'utf8');
ok(/window\._bakOffer = \{/.test(bk) && /dispatchEvent\(new CustomEvent\('pth:bakoffer'\)\)/.test(bk), 'backup-autosave hands the offer over (window._bakOffer, pth:bakoffer)');
ok(/if \(_automated\(\)\) \{ _offerFallback\(\); return; \}/.test(bk), 'automated browsers keep the banner (the browser tests close it)');
ok(/_later\(\(\) => \{ if \(_offer && !_offer\.claimed\) _offerFallback\(\); \}, CLAIM_MS\)/.test(bk) && /!_offer\.shown\) _offerFallback\(\); \}, WATCH_MS\)/.test(bk), 'the banner as a safety net: not claimed, or not shown in time');
ok(/addEventListener\('pth:langchange', relabel\)/.test(bk), 'the banner follows the language too');
ok(/_toast\(_offerHint\(false\), \{ icon: '', duration: 7000 \}\)/.test(bk), 'the banner\'s Later / ✕ tell where to find it too (toast)');
const idx = fs.readFileSync('public/modules/guide/index.mjs', 'utf8');
ok(/function bannerUp\(\) \{\s*if \(bakPending\(\)\) return true;/.test(idx), 'the first-launch offer waits for it');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
