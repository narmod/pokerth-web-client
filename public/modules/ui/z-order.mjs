// ── z-order.mjs — « la dernière surface ouverte ou sélectionnée passe devant » ─
//
// Jusqu'ici chaque panneau avait un z-index figé en CSS (chat 100, log 99,
// assistance 99, réactions 101, combinaisons 201, musique 900…) : l'ordre
// d'empilement ne dépendait pas de ce que le joueur venait d'ouvrir ou de
// toucher. Résultat visible : un menu du header ouvert par-dessus la fenêtre
// musique passait dessous, et cliquer une fenêtre ne la ramenait jamais devant.
//
// Règle générale appliquée ici : ouvrir une surface OU la toucher la place
// au-dessus des autres surfaces du même type. Rien d'autre ne bouge — la bande
// utilisée (300–390) reste au-dessus des overlays statiques (≤ 201) et sous les
// animations de jeu (400+), les toasts (950), les bannières (999+) et les
// modales (1200+), dont la priorité absolue est voulue.

// Surfaces concernées : fenêtres flottantes, panneaux et menus déroulants.
// Volontairement absents : #players-panel / #lobby-gameinfo (colonnes du lobby,
// pas des overlays), les scrims, et tout ce qui doit rester au-dessus par
// nature (modales, toasts, bannières).
const SEL = [
  '.floating-win',
  '#g-chat-panel', '#lobby-chat-panel', '#g-log-panel', '#g-assist-panel',
  '#g-reaction-panel', '#music-panel', '#hands-overlay', '#stats-overlay',
  '#odds-monitor', '#assist-win',
  '#g-overflow-menu', '#l-overflow-menu', '#cr-overflow-menu',
  '#connect-overflow-menu', '#pv-overflow-menu'
].join(',');

const BASE = 300, TOP = 390;
let _z = BASE;
const stack = [];          // surfaces déjà remontées, de la plus ancienne à la plus récente

function _matches(el) {
  return !!(el && el.nodeType === 1 && el.matches && el.matches(SEL));
}

function _visible(el) {
  if (!el || el.hidden) return false;
  let st;
  try { st = window.getComputedStyle(el); } catch (e) { return false; }
  return st.display !== 'none' && st.visibility !== 'hidden';
}

// Renumérote de BASE en haut quand le plafond est atteint : l'ordre relatif est
// conservé, on ne dérive jamais au-dessus de la bande.
function _renumber() {
  _z = BASE;
  for (const el of stack) {
    try { el.style.zIndex = String(++_z); } catch (e) {}
  }
}

// Place `el` au-dessus des autres surfaces gérées.
export function raise(el) {
  if (!_matches(el)) return false;
  if (stack.length && stack[stack.length - 1] === el) return true;   // déjà devant
  const i = stack.indexOf(el);
  if (i >= 0) stack.splice(i, 1);
  stack.push(el);
  if (++_z > TOP) _renumber();
  else { try { el.style.zIndex = String(_z); } catch (e) {} }
  return true;
}

// Sélection : toucher une surface la ramène devant (capture = avant les
// handlers locaux, et même si l'un d'eux fait stopPropagation).
function _onDown(e) {
  const el = e.target && e.target.closest && e.target.closest(SEL);
  if (el) raise(el);
}

// Ouverture : une surface qui (re)devient visible passe devant.
const _obs = new MutationObserver((muts) => {
  for (const m of muts) {
    if (m.type === 'childList') {
      for (const n of m.addedNodes) if (_matches(n) && _visible(n)) raise(n);
      continue;
    }
    const t = m.target;
    if (_matches(t) && _visible(t)) raise(t);
  }
});

function _watch(el) {
  if (!el || el._zWatched) return;
  el._zWatched = true;
  _obs.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
}

export function initZOrder() {
  if (window._zOrderWired) return;
  window._zOrderWired = true;
  document.addEventListener('pointerdown', _onDown, true);
  try { document.querySelectorAll(SEL).forEach(_watch); } catch (e) {}
  // Les fenêtres créées à chaud (assistance détachée, musique…) sont ajoutées
  // à <body> : on surveille ses enfants directs pour les prendre en charge.
  try { _obs.observe(document.body, { childList: true }); } catch (e) {}
  // Une surface ajoutée après coup doit aussi être observée en attributs.
  try {
    new MutationObserver(() => {
      try { document.querySelectorAll(SEL).forEach(_watch); } catch (e) {}
    }).observe(document.body, { childList: true });
  } catch (e) {}
}

window.zRaise = raise;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initZOrder);
} else {
  initZOrder();
}
