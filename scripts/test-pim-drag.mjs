#!/usr/bin/env node
// La carte joueur doit etre REELLEMENT deplacable en mode fenetre : on ne se
// contente pas de verifier qu'un handle est passe, on simule un glisser sur la
// poignee et on regarde si la carte a bouge. Sert de garde contre une poignee
// mal choisie (2.1.7-web.104 utilisait #pim-name, une ligne centree au milieu
// de la carte, que personne ne pense a saisir).
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import vm from 'vm';

const html = readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://pokerth.ddns.net/', pretendToBeVisual: true, runScripts: 'outside-only' });
const w = dom.window;
globalThis.window = w;
for (const k of ['document','localStorage','location','requestAnimationFrame','getComputedStyle','CustomEvent','Event',
                 'MutationObserver','IntersectionObserver','ResizeObserver','NodeFilter','Node','HTMLElement','PointerEvent'])
  try { globalThis[k] = w[k]; } catch (e) {}
// Fenetre large : au-dessus du seuil _winGate (>=900x600).
w.matchMedia = (q) => ({ matches: /min-width:\s*900px/.test(q) && /min-height:\s*600px/.test(q),
                         addListener() {}, addEventListener() {} });
w.speechSynthesis = { getVoices: () => [], addEventListener() {}, cancel() {}, speak() {} };
w.SpeechSynthesisUtterance = function (t) { this.text = t; };
globalThis.WebSocket = w.WebSocket;
globalThis.fetch = () => Promise.reject(new Error('stub')); w.fetch = globalThis.fetch;

const mods = [...html.matchAll(/<script type="module" src="(modules\/[^"]+)"><\/script>/g)].map(m => m[1]);
for (const m of mods) { try { await import('../public/' + m); } catch (e) {} }
for (const k of Object.getOwnPropertyNames(w)) { if (k === 'performance' || k in globalThis) continue; try { globalThis[k] = w[k]; } catch (e) {} }
const ctx = dom.getInternalVMContext();
vm.runInContext(readFileSync('public/chat-emotes.js', 'utf8'), ctx, { filename: 'chat-emotes.js' });
vm.runInContext("(function(){'use strict';\n" + readFileSync('public/pokerth.js', 'utf8') + "\n})();", ctx, { filename: 'pokerth.js' });
w.document.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
await new Promise(r => setTimeout(r, 40));

let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.error('  \u2717', m); } else console.log('  \u2713', m); };

ok(typeof w._winGate === 'function' && w._winGate(), 'seuil fenetre atteint (viewport large simule)');
ok(typeof w._enableFloating === 'function', '_enableFloating disponible');

const card = w.document.querySelector('#player-info-modal .pim-card');
const grip = w.document.getElementById('pim-grip');
ok(!!card && !!grip, 'carte et poignee presentes dans le markup');

// Passage en mode fenetre, comme le fait openPlayerInfoPopup.
w._enableFloating(card, { handle: grip, resizable: true, key: 'pth-pim-win-test',
                          defW: 400, defH: 500, defLeft: 100, defTop: 80, minW: 260, minH: 260 });
ok(card.classList.contains('floating-win'), 'carte passee en mode fenetre');
ok(grip.style.cursor === 'move', 'poignee cablee (curseur move pose par makeWinDraggable)');

// Glisser : pointerdown sur la poignee, deplacement, relachement.
const before = { left: card.style.left, top: card.style.top };
const pe = (type, x, y) => { const e = new w.Event(type, { bubbles: true, cancelable: true });
  e.clientX = x; e.clientY = y; e.pointerId = 1; return e; };
card.getBoundingClientRect = () => ({ left: parseFloat(card.style.left) || 100, top: parseFloat(card.style.top) || 80,
                                      width: 400, height: 500, right: 500, bottom: 580 });
grip.setPointerCapture = () => {}; grip.releasePointerCapture = () => {};
grip.dispatchEvent(pe('pointerdown', 200, 100));
grip.dispatchEvent(pe('pointermove', 320, 190));
grip.dispatchEvent(pe('pointerup',   320, 190));
const after = { left: card.style.left, top: card.style.top };
ok(after.left !== before.left || after.top !== before.top,
   'la carte a BOUGE en tirant la poignee (' + before.left + ',' + before.top + ' -> ' + after.left + ',' + after.top + ')');

// ── Ouverture : centree, et large ──
// Le media desktop impose `.pim-card { max-width: 400px !important }` : sans
// neutralisation explicite en mode fenetre, la carte refuse de s'elargir quel
// que soit le maxW passe a _enableFloating.
const cssAll = readFileSync('public/pokerth.css', 'utf8');
const floatRule = (cssAll.match(/#player-info-modal \.pim-card\.floating-win,[\s\S]*?\}/) || [''])[0];
ok(/max-width:\s*none\s*!important/.test(floatRule),
   'css : max-width neutralise en !important (bat la regle du media desktop)');
ok(/max-width:\s*400px\s*!important/.test(cssAll),
   'css : la regle bloquante existe bien (sinon ce garde-fou ne sert a rien)');
// L'avatar fait 112px de large dans une colonne flex : si la carte passe en
// align-items:stretch, il se colle au bord gauche. Tous les blocs larges
// portent deja width:100%, le stretch n'apportait donc rien.
const alignRule = (cssAll.match(/#player-info-modal \.pim-card\.floating-win \{[^}]*\}/) || [''])[0];
ok(/align-items:\s*center/.test(alignRule), 'css : contenu centre en mode fenetre (avatar compris)');
ok(!/align-items:\s*stretch/.test(alignRule), 'css : pas de stretch (decalerait l avatar)');

const srcPim = readFileSync('public/modules/ui/player-popup.mjs', 'utf8');
ok(/key:\s*'pth-pim-win2'/.test(srcPim),
   'cle de geometrie changee (une geometrie etroite memorisee ecraserait defW)');
// Geometrie calculee : centree horizontalement et verticalement.
const geomSrc = (srcPim.match(/function _pimGeom\(\) \{[\s\S]*?\n\}/) || [''])[0];
ok(!!geomSrc, 'geometrie d ouverture calculee');
const geom = new Function('window', geomSrc + '\nreturn _pimGeom;')({ innerWidth: 1600, innerHeight: 900 })();
ok(geom.left === Math.round((1600 - geom.w) / 2), 'ouverture centree horizontalement (left=' + geom.left + ')');
ok(geom.top === Math.round((900 - geom.h) / 2), 'ouverture centree verticalement (top=' + geom.top + ')');
ok(geom.w >= 560, 'ouverture large sur 1600px (' + geom.w + 'px)');
const small = new Function('window', geomSrc + '\nreturn _pimGeom;')({ innerWidth: 420, innerHeight: 700 })();
ok(small.w <= 420 && small.left >= 8, 'reste dans l ecran sur petite fenetre (' + small.w + 'px @' + small.left + ')');

// Le plafond d'agrandissement doit laisser de la place au bloc coupes.
const src = readFileSync('public/modules/ui/player-popup.mjs', 'utf8');
const mw = (src.match(/maxW = Math\.min\((\d+)/) || [])[1];
ok(Number(mw) >= 1200, 'plafond d agrandissement large (' + mw + 'px)');
ok(geom.w >= Math.round(1600 * 0.55), 'ouverture assez large (' + geom.w + 'px sur 1600)');

// ── Zones sures (iOS) ──
// La carte peut etre plus haute que l'ecran : sans marge de zone sure elle se
// colle au bord et passe sous la barre d'etat / l'encoche.
for (const [nm, sel] of [['carte joueur','#player-info-modal'], ['infos de partie','#game-info-modal']]) {
  const r = (cssAll.match(new RegExp(sel + ' \\{[^}]*\\}')) || [''])[0];
  ok(/padding:[^;]*env\(safe-area-inset-top\)/.test(r), nm + ' : marge haute de zone sure');
  ok(/env\(safe-area-inset-bottom\)/.test(r), nm + ' : marge basse de zone sure');
}
const pimCardRule = (cssAll.match(/\n\.pim-card \{[^}]*\}/) || [''])[0];
ok(!/max-height:\s*calc\(100dvh/.test(pimCardRule),
   'carte joueur : hauteur bornee au conteneur, pas au viewport (sinon le padding est ignore)');

// ── Badge « 1re place » lisible dans tous les themes ──
const l5win = (cssAll.match(/\.rk-l5\.win \{[^}]*\}/) || [''])[0];
ok(!/var\(--gold\)/.test(l5win),
   '5 dernieres : la 1re place n utilise pas --gold (quasi-noir en theme clair)');
ok(/#56e289/.test(l5win), '5 dernieres : vert de la 1re place, comme la legende');
// Sur un grand ecran, le plafond doit vraiment suivre la largeur disponible.
const big = new Function('window', geomSrc + '\nreturn _pimGeom;')({ innerWidth: 2560, innerHeight: 1440 })();
ok(big.maxW >= 1400, 'agrandissement possible jusqu a ' + big.maxW + 'px sur un 2560px');
ok(/handle:\s*document\.getElementById\('pim-grip'\)/.test(src), 'poignee = le bandeau, pas le nom du joueur');

console.log(fail ? `\n${fail}/${n} \u00c9CHECS` : `\n${n}/${n} OK`);
process.exit(fail ? 1 : 0);
