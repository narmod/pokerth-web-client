// Test déterministe de modules/ui/z-order.mjs
//   « la dernière surface ouverte ou touchée passe devant », bande 300–390,
//   renumérotation au plafond, surfaces non gérées ignorées.
// Run: node scripts/test-z-order.mjs
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2713 ' + label); }
  else { fail++; console.log('  \u2717 ' + label); }
}

const dom = new JSDOM(`<!doctype html><head><style>#ranking-modal{z-index:1200} .connect-header{position:absolute;z-index:20}</style></head><body>
  <div class="header connect-header"><div class="hdr-left"><details class="cl-links" id="cl-links-connect"><summary>☰</summary><div class="cl-menu"></div></details></div><span><div id="connect-overflow-menu" style="display:none"></div></span></div>
  <div id="g-chat-panel" style="display:none"></div>
  <div id="g-log-panel" style="display:none"></div>
  <div id="music-panel" style="display:none"></div>
  <div id="g-overflow-menu" style="display:none"><button id="ovf-btn">x</button></div>
  <div id="players-panel"></div>
  <!-- Fenêtres flottantes imbriquées : le z effectif est porté par le conteneur -->
  <div id="ranking-modal" style="display:none"><div class="rk-card"><div id="rk-title"></div></div></div>
  <div id="adv-modal" style="display:none"><div class="km-card"></div></div>
  <div id="jr-modal" style="display:none"><div class="km-card jr-card"></div></div>
</body>`, { pretendToBeVisual: true, url: 'https://pokerth.local/' });

const w = dom.window;
for (const k of ['document', 'getComputedStyle', 'MutationObserver', 'Event', 'HTMLElement']) {
  globalThis[k] = w[k];
}
globalThis.window = w;

const Z = await import('../public/modules/ui/z-order.mjs');
const $ = (id) => w.document.getElementById(id);
const z = (id) => parseInt($(id).style.zIndex || '0', 10);
const tick = () => new Promise(r => setTimeout(r, 5));   // MutationObserver = microtâche

// ── Ouverture : la surface qui devient visible passe devant ──
$('g-chat-panel').style.display = 'block';
await tick();
ok(z('g-chat-panel') === 301, 'ouverture du chat : premier de la bande (301)');

$('g-log-panel').style.display = 'block';
await tick();
ok(z('g-log-panel') > z('g-chat-panel'), 'journal ouvert après le chat : passe devant');

// Cas signalé : un menu du header ouvert par-dessus une fenêtre.
$('music-panel').style.display = 'block';
await tick();
$('g-overflow-menu').style.display = 'block';
await tick();
ok(z('g-overflow-menu') > z('music-panel'),
   'menu du header ouvert après la fenêtre musique : passe devant');

// ── Sélection : toucher une fenêtre la ramène devant ──
Z.raise($('g-chat-panel'));
ok(z('g-chat-panel') > z('g-overflow-menu'), 'chat sélectionné : revient au premier plan');

// Re-sélectionner la surface déjà devant ne consomme pas de niveau.
const before = z('g-chat-panel');
Z.raise($('g-chat-panel'));
ok(z('g-chat-panel') === before, 'surface déjà devant : aucun changement');

// ── Surface non gérée : ignorée ──
ok(Z.raise($('players-panel')) === false && !$('players-panel').style.zIndex,
   'colonne du lobby (#players-panel) : non gérée, jamais modifiée');

// ── Plafond : renumérotation en conservant l'ordre relatif ──
for (let i = 0; i < 120; i++) {
  Z.raise($(i % 2 ? 'g-log-panel' : 'g-chat-panel'));
}
const vals = ['g-chat-panel', 'g-log-panel', 'music-panel', 'g-overflow-menu'].map(z);
ok(vals.every(v => v >= 300 && v <= 390), 'après 120 remontées : tout reste dans la bande 300–390');
ok(z('g-log-panel') > z('g-chat-panel'),
   'renumérotation : l\'ordre relatif est conservé (dernière remontée devant)');

// ── Fenêtres imbriquées (audit du 22/07 : classement, classement de table,
//    options avancées — le z effectif est celui du conteneur, pas de la carte) ──
const rk = $('ranking-modal'), rkCard = rk.querySelector('.rk-card');
rk.style.display = 'flex';
rkCard.classList.add('floating-win');          // mode fenêtre (desktop/tablette)
await tick();
ok(z('ranking-modal') > z('g-chat-panel'),
   'classement ouvert en fenêtre : le CONTENEUR passe devant les autres fenêtres');
ok(!rkCard.style.zIndex, 'classement : aucun z posé sur la carte (sans effet)');

Z.raise($('g-chat-panel'));
ok(z('g-chat-panel') > z('ranking-modal'), 'chat sélectionné : repasse devant le classement');
Z.raise(rkCard);
ok(z('ranking-modal') > z('g-chat-panel'),
   'toucher la carte du classement remonte le conteneur');

// Options avancées : même mécanique.
const adv = $('adv-modal'), advCard = adv.querySelector('.km-card');
adv.style.display = 'flex';
advCard.classList.add('floating-win');
await tick();
ok(z('adv-modal') > z('ranking-modal'), 'options avancées ouvertes après : devant le classement');

// Journal (Gérer les logs) : même mécanique — la dernière ouverte passe devant.
const jr = $('jr-modal'), jrCard = jr.querySelector('.jr-card');
jr.style.display = 'flex';
jrCard.classList.add('floating-win');
await tick();
ok(z('jr-modal') > z('adv-modal'), 'logs ouverts après : devant les options avancées');
Z.raise(advCard);
ok(z('adv-modal') > z('jr-modal'), 'toucher les options avancées : repassent devant les logs');
jr.style.display = 'none';
await tick();
ok(!$('jr-modal').style.zIndex, 'fermeture des logs : z-index CSS rendu');
jr.style.display = 'flex'; jrCard.classList.remove('floating-win');

// Fermeture → le conteneur récupère son z-index CSS de dialogue.
adv.style.display = 'none';
await tick();
ok(!$('adv-modal').style.zIndex, 'fermeture : le conteneur rend son z-index CSS (priorité dialogue)');

// Mode modale (mobile, pas de .floating-win) : jamais touché.
rkCard.classList.remove('floating-win');
rk.style.display = 'none'; await tick();
rk.style.display = 'flex'; await tick();
ok(!$('ranking-modal').style.zIndex,
   'mode modale (sans .floating-win) : le conteneur garde son z CSS 1200');

// Mobile : un menu du header ouvert pendant qu'une fenêtre est en mode modale
// (z CSS 1200, hors bande) doit passer devant elle (rapport narmod 29/09).
const ovf = $('g-overflow-menu');
ovf.style.display = 'none'; await tick();
ovf.style.display = 'block'; await tick();
ok(z('g-overflow-menu') > 1200, 'menu du header ouvert sur le classement en modale : passe devant (> 1200)');
Z.raise(ovf);
ok(z('g-overflow-menu') > 1200, 'menu déjà devant, re-sélectionné : reste au-dessus de la modale');
ok(!$('ranking-modal').style.zIndex, 'la modale garde son z CSS (non modifiée)');
// Écran de connexion : le menu est enfermé dans l'en-tête (contexte z 20) →
// c'est l'en-tête qui passe au-dessus de la modale, puis reprend son z.
const hdr = w.document.querySelector('.connect-header'), cov = $('connect-overflow-menu');
cov.style.display = 'block'; await tick();
ok(parseInt(hdr.style.zIndex, 10) > 1200, 'login : l\'en-tête du menu passe au-dessus de la modale');
cov.style.display = 'none'; await tick();
ok(hdr.style.zIndex === '' && getComputedStyle(hdr).zIndex === '20', 'login : menu fermé, l\'en-tête reprend son z CSS (20)');
// Menu ☰ du login (<details>) : même règle que ⚙ (rapport narmod 03/10).
const cl = $('cl-links-connect');
cl.open = true; await tick();
ok(parseInt(hdr.style.zIndex, 10) > 1200 && z('cl-links-connect') > 1200,
   'login : menu ☰ ouvert sur le classement en modale : passe devant (> 1200)');
cl.open = false; await tick();
ok(hdr.style.zIndex === '' && getComputedStyle(hdr).zIndex === '20', 'login : menu ☰ fermé, l\'en-tête reprend son z CSS (20)');
rk.style.display = 'none'; jr.style.display = 'none'; await tick();
ovf.style.display = 'none'; await tick();
ovf.style.display = 'block'; await tick();
ok(z('g-overflow-menu') >= 300 && z('g-overflow-menu') <= 390, 'sans modale visible : le menu reste dans la bande 300–390');

console.log(fail ? `\nFAIL ${pass}/${pass + fail}` : `\nPASS ${pass}/${pass}`);
process.exit(fail ? 1 : 0);
