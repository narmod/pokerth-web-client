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

// Fenêtres flottantes IMBRIQUÉES : la carte porte .floating-win, mais le z-index
// effectif est celui du conteneur (position:fixed + z-index 1200), qui crée le
// contexte d'empilement — poser un z sur la carte n'aurait aucun effet. On cible
// donc le conteneur, et UNIQUEMENT quand la carte est en mode fenêtre : en mode
// modale (mobile, sous le seuil _winGate) ces conteneurs gardent leur z CSS et
// leur priorité de dialogue.
const HOSTS = '#ranking-modal,#tableranking-modal,#adv-modal';

const BASE = 300, TOP = 390;
let _z = BASE;
const stack = [];          // surfaces déjà remontées, de la plus ancienne à la plus récente

function _matches(el) {
  return !!(el && el.nodeType === 1 && el.matches && el.matches(SEL));
}

function _isHost(el) {
  return !!(el && el.nodeType === 1 && el.matches && el.matches(HOSTS));
}

// Le conteneur héberge-t-il une fenêtre réellement flottante ?
function _hostFloating(host) {
  try { return !!host.querySelector('.floating-win'); } catch (e) { return false; }
}

// Élément à qui appliquer le z-index : le conteneur pour une fenêtre imbriquée.
function _target(el) {
  if (!el) return null;
  try {
    if (el.classList && el.classList.contains('floating-win')) {
      const host = el.closest(HOSTS);
      if (host) return host;
    }
  } catch (e) {}
  return el;
}

// Rend son z-index CSS à un conteneur (fermeture, ou retour en mode modale) :
// sans cela il resterait figé dans la bande alors qu'il doit repasser dialogue.
function _release(el) {
  const i = stack.indexOf(el);
  // Garde anti-boucle : effacer style.zIndex est lui-même une mutation
  // d'attribut, que l'observateur nous re-signalerait indéfiniment.
  if (i < 0 && !(el.style && el.style.zIndex)) return;
  if (i >= 0) stack.splice(i, 1);
  try { el.style.zIndex = ''; } catch (e) {}
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
  el = _target(el);
  if (!(_matches(el) || (_isHost(el) && _hostFloating(el)))) return false;
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
  if (!e.target || !e.target.closest) return;
  const el = e.target.closest(SEL + ',' + HOSTS);
  if (el) raise(el);
}

// Écrire un z-index est LUI-MÊME une mutation de l'attribut style, que
// l'observateur nous re-signalerait : sans filtre, une renumérotation relance
// une remontée pour chaque élément, donc une nouvelle renumérotation — boucle
// infinie. On ne réagit donc qu'aux changements de VISIBILITÉ (et de classe).
const _vis = new WeakMap();
function _visChanged(el) {
  const now = _visible(el), prev = _vis.get(el);
  _vis.set(el, now);
  return now !== prev;
}

// Ouverture : une surface qui (re)devient visible passe devant.
const _obs = new MutationObserver((muts) => {
  for (const m of muts) {
    if (m.type === 'childList') {
      for (const n of m.addedNodes) if (_matches(n) && _visible(n)) raise(n);
      continue;
    }
    const t = m.target;
    // Bascule fenêtre ↔ modale d'une carte imbriquée (.floating-win posée ou
    // retirée sur .rk-card / .km-card) : c'est le conteneur qui suit.
    if (m.attributeName === 'class' && t.closest) {
      const host = t.closest(HOSTS);
      if (host && host !== t) {
        if (_visible(host) && _hostFloating(host)) raise(host);
        else _release(host);
        continue;
      }
    }
    if (_isHost(t)) {
      if (!_visChanged(t)) continue;
      // Ouverture en mode fenêtre → devant ; fermeture ou retour en mode
      // modale → on rend le z-index CSS (dialogue prioritaire).
      if (_visible(t) && _hostFloating(t)) raise(t);
      else _release(t);
      continue;
    }
    if (_matches(t) && _visChanged(t) && _visible(t)) raise(t);
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
  try { document.querySelectorAll(SEL + ',' + HOSTS).forEach(_watch); } catch (e) {}
  // La carte interne d'un conteneur ne porte .floating-win qu'à l'ouverture :
  // on surveille aussi sa classe pour réagir au basculement exact.
  try {
    document.querySelectorAll(HOSTS).forEach(function (h) {
      h.querySelectorAll('.rk-card,.km-card').forEach(function (c) {
        if (c._zWatched) return;
        c._zWatched = true;
        _obs.observe(c, { attributes: true, attributeFilter: ['class'] });
      });
    });
  } catch (e) {}
  // Les fenêtres créées à chaud (assistance détachée, musique…) sont ajoutées
  // à <body> : on surveille ses enfants directs pour les prendre en charge.
  try { _obs.observe(document.body, { childList: true }); } catch (e) {}
  // Une surface ajoutée après coup doit aussi être observée en attributs.
  try {
    new MutationObserver(() => {
      try { document.querySelectorAll(SEL + ',' + HOSTS).forEach(_watch); } catch (e) {}
    }).observe(document.body, { childList: true });
  } catch (e) {}
}

window.zRaise = raise;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initZOrder);
} else {
  initZOrder();
}
