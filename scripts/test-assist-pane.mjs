#!/usr/bin/env node
// Tests déterministes pour public/modules/ui/assist-pane.mjs (ESM #9g-B3).
// Séparateur redimensionnable Assistance/Cotes + détachement en fenêtre.
// Utilise jsdom (comme test-boot) pour un vrai DOM (insertBefore/parentNode…).
// Run: node scripts/test-assist-pane.mjs
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';

const html = readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://pokerth.ddns.net/', pretendToBeVisual: true, runScripts: 'outside-only' });
const w = dom.window;
globalThis.window = w;
for (const k of ['document','localStorage','location','getComputedStyle','CustomEvent','Event']) {
  try { globalThis[k] = w[k]; } catch (e) {}
}

// Stubs du système de fenêtres flottantes (défini dans le monolithe en prod).
let enableCalls = [], disableCalls = [];
w._enableFloating = (panel, opt) => { enableCalls.push({ id: panel && panel.id, opt }); panel.classList.add('floating-win'); };
w._disableFloating = (panel) => { disableCalls.push(panel && panel.id); panel.classList.remove('floating-win'); };

const { S } = await import('../public/modules/game/state.mjs');
await import('../public/modules/ui/odds-panel.mjs');      // fournit window._gipAssistSync
const AP = await import('../public/modules/ui/assist-pane.mjs'); // s'auto-initialise (readyState complete)

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const $ = (id) => w.document.getElementById(id);

// ── Init : rangée de titre + bouton détacher + poignée + fenêtre créés ──
ok(!!$('gip-assist-hd-row'), 'init : rangée de titre .gip-assist-hd-row créée');
ok(!!w.document.querySelector('#gip-assist-hd-row .gip-assist-pop'), 'init : bouton détacher présent dans la rangée');
ok(w.document.querySelector('#gip-assist-hd-row .odds-hd') != null, 'init : .odds-hd déplacé dans la rangée (data-i18n préservé)');
ok(!!$('gip-split'), 'init : poignée de séparation #gip-split créée');
ok($('gip-split').style.display === 'none', 'init : poignée masquée par défaut');
ok(!!$('g-assist-panel') && $('g-assist-panel').style.display === 'none', 'init : fenêtre #g-assist-panel créée et masquée');
ok($('gip-split').previousElementSibling === $('gip-assist'), 'init : ordre DOM [gip-assist, gip-split]');
ok($('gip-split').nextElementSibling === $('g-odds-body'), 'init : ordre DOM [gip-split, g-odds-body]');

// ── Détachement ──
S._assistOn = true;
AP.detachAssist();
ok(S._assistDetached === true, 'détach : S._assistDetached = true');
ok(localStorage.getItem('pth_assist_detached') === '1', 'détach : persistance pth_assist_detached=1');
ok($('gip-assist').parentElement === $('g-assist-host'), 'détach : #gip-assist déplacé dans la fenêtre');
ok($('gip-assist-hd-row').style.display === 'none', 'détach : titre interne masqué (en-tête fenêtre prend le relais)');
ok(enableCalls.length === 1 && enableCalls[0].id === 'g-assist-panel', 'détach : _enableFloating appelé sur la fenêtre');
ok(enableCalls[0].opt.resizable === true && enableCalls[0].opt.key === 'pth_winpos_assist', 'détach : options resizable + clé de position');
ok($('g-assist-panel').style.display === '' , 'détach : fenêtre affichée');
ok($('gip-split').style.display === 'none', 'détach : poignée masquée (plus d\'onglet à séparer)');

// _gipAssistSync en mode détaché : suit S._assistOn
S._assistOn = false; w._gipAssistSync();
ok($('gip-assist').style.display === 'none' && $('g-assist-panel').style.display === 'none', 'détaché : assist off → fenêtre masquée');
S._assistOn = true; w._gipAssistSync();
ok($('gip-assist').style.display === '' && $('g-assist-panel').style.display === '', 'détaché : assist on → fenêtre affichée');

// ── Rattachement ──
AP.dockAssist();
ok(S._assistDetached === false, 'rattach : S._assistDetached = false');
ok(localStorage.getItem('pth_assist_detached') === null, 'rattach : persistance effacée');
ok($('gip-assist').parentElement === $('g-log-panel'), 'rattach : #gip-assist re-parenté dans #g-log-panel');
ok($('gip-assist').nextElementSibling === $('gip-split'), 'rattach : ordre restauré [gip-assist, gip-split]');
ok($('gip-assist-hd-row').style.display === '', 'rattach : titre interne ré-affiché');
ok(disableCalls.length === 1 && disableCalls[0] === 'g-assist-panel', 'rattach : _disableFloating appelé');

// ── Toggle ──
AP.toggleAssistDetach();
ok(S._assistDetached === true, 'toggle : rattaché → détaché');
AP.toggleAssistDetach();
ok(S._assistDetached === false, 'toggle : détaché → rattaché');

// ── Hauteur mémorisée appliquée en mode attaché ──
localStorage.setItem('pth_gip_assist_h', '120');
w._assistPaneSync();
ok($('gip-assist').style.height === '120px', 'hauteur : pth_gip_assist_h appliqué au bloc attaché');

console.log(fail ? `\nFAIL ${n - fail}/${n}` : `\nPASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
