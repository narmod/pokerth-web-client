// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/reactions.mjs
//
// Réactions emoji en jeu : compteurs par emoji, dé-duplication d'une même
// réaction reçue par deux canaux (REACT: legacy + convention /emoji partagée
// avec le client QML de sp0ck — fenêtre 1,5 s), rendu flottant/siège,
// presets de particules (playReactionFx), mute (parité DisableEmojiReactions)
// et épingle du panneau. INTEROP sp0ck : aucun changement de protocole ni de
// timing dans cette extraction.
//
// Historique : extrait de public/pokerth.js (extraction #6 du plan
// docs/ESM_PLAN.md), au verbatim. Dépendances à runtime via les globaux :
// window.seats, playTone (gardé par typeof). _reactMuted / _reactPinned sont
// lus ET écrits en assignation nue par le monolithe (boutons mute/pin) →
// ponts defineProperty (gabarit _lang d'i18n.mjs, mode sloppy côté monolithe).
// ─────────────────────────────────────────────────────────────────────────

function t(key, opts) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, opts) : key;
}

// ═══════════════════════════════════════════════════════════
// RÉACTIONS RAPIDES
// ═══════════════════════════════════════════════════════════
var _reactionCounts = {}; // { emoji: count }
var _reactionTimers = {}; // timers de reset des compteurs
var _reactSeen = {};      // { 'pid|emoji': {t, via} } -- de-dup d'une reaction recue par 2 canaux (REACT: + /emoji)
// Mute local des reactions (preference utilisateur, persistee). ON => rien envoye ni recu, grille grisee.
var _reactMuted = (function(){ try { return localStorage.getItem('pth_react_muted') === '1'; } catch(e){ return false; } })();
// Épingle du panneau réactions (demande narmod 2026-07-18) : par défaut la
// fenêtre se FERME après chaque réaction envoyée, comme le ReactionPicker du
// client QML. Épinglée (📌 or), elle reste ouverte.
var _reactPinned = (function(){ try { return localStorage.getItem('pth_react_pin') === '1'; } catch(e){ return false; } })();
function _applyReactPinUI() {
  var btn = document.getElementById('react-pin-toggle');
  if (btn) {
    btn.classList.toggle('pinned', _reactPinned);
    btn.setAttribute('aria-pressed', _reactPinned ? 'true' : 'false');
  }
}

// ── Catalogue des effets animés par réaction ──
// a = animation de l'emoji ; p = particules (objet, ou preset 'sparkle'/'shock'/'confetti')
var REACTION_FX = {
  '🎉':{a:'pop',p:'confetti'}, '🥳':{a:'pop',p:'confetti'}, '🎊':{a:'pop',p:'confetti'},
  '🔥':{a:'fire',p:{chars:['🔥','✦'],count:9,size:14,a0:-150,a1:-30,dist:70,g:-24,life:1000,rot:1}},
  '💰':{a:'pop',p:{chars:['🪙','💵','✦'],count:12,size:16,a0:-170,a1:-10,dist:72,g:90,life:1200,rot:1}},
  '🤑':{a:'pop',p:{chars:['🪙','💵'],count:10,size:16,a0:-170,a1:-10,dist:70,g:90,life:1100,rot:1}},
  '💎':{a:'shine',p:{chars:['✨','✦'],count:9,size:13,a0:0,a1:360,dist:64,life:850,rot:1}},
  '🤩':{a:'shine',p:{chars:['✨'],count:8,size:13,a0:0,a1:360,dist:60,life:800,rot:1}},
  '😂':{a:'shake',p:{chars:['💧'],count:7,size:13,a0:-30,a1:210,dist:55,g:36,life:850}},
  '🤣':{a:'shake',p:{chars:['💧'],count:7,size:13,a0:-30,a1:210,dist:55,g:36,life:850}},
  '👏':{a:'beat',p:{chars:['✦','✧'],count:9,color:'var(--gold)',size:13,a0:0,a1:360,dist:60,life:750}},
  '🙌':{a:'beat',p:{chars:['✦','✧'],count:9,color:'var(--gold)',size:13,a0:0,a1:360,dist:62,life:780}},
  '💪':{a:'flex',p:{chars:['✦'],count:6,color:'var(--gold)',size:13,a0:0,a1:360,dist:50,life:700}},
  '😱':{a:'shake',p:{chars:['💦'],count:6,size:12,a0:-120,a1:-60,dist:48,g:50,life:780}},
  '🤯':{a:'pop',p:'shock'},
  '🍀':{a:'spin',p:{chars:['✨','🍀'],count:8,color:'#7ee37e',size:13,a0:0,a1:360,dist:62,life:950,rot:1}},
  '🎰':{a:'spin',p:{chars:['✨','🪙'],count:9,size:14,a0:0,a1:360,dist:66,life:950,rot:1}},
  '👑':{a:'shine',p:{chars:['✨','⭐'],count:10,color:'var(--gold)',size:14,a0:0,a1:360,dist:70,life:1000,rot:1}},
  '😎':{a:'pop',p:'sparkle'}, '👍':{a:'beat',p:'sparkle'}, '🫡':{a:'pop',p:'sparkle'},
  '😍':{a:'beat',p:{chars:['❤️','💖'],count:8,size:16,a0:-160,a1:-20,dist:64,g:-30,life:1100}}
};
function _rfxDefault(){ return { a:'pop', p:'sparkle' }; }

// Génère les particules d'un effet dans le conteneur c (centré sur 0,0 du conteneur)
function _rfxSpawn(c, spec){
  if (spec === 'sparkle') spec = {chars:['✦','✧'],count:7,color:'var(--gold)',size:12,a0:0,a1:360,dist:54,life:700};
  if (spec === 'confetti'){ _rfxConfetti(c); return; }
  if (spec === 'shock'){
    var r = document.createElement('div'); r.className = 'rfx-ring';
    c.appendChild(r); setTimeout(function(){ r.remove(); }, 800);
    spec = {chars:['💥','✦'],count:8,size:15,a0:0,a1:360,dist:70,life:800};
  }
  if (!spec || typeof spec !== 'object') return;
  for (var i = 0; i < spec.count; i++){
    var p = document.createElement('span'); p.className = 'rfx-pt';
    if (spec.chars){ p.textContent = spec.chars[(Math.random()*spec.chars.length)|0]; p.style.fontSize = (spec.size||14)+'px'; }
    else { p.style.width = p.style.height = (spec.size||7)+'px'; p.style.background = spec.color||'var(--gold)'; p.style.borderRadius = spec.square?'1px':'50%'; }
    c.appendChild(p);
    var ang = (spec.a0 + Math.random()*(spec.a1 - spec.a0)) * Math.PI/180;
    var d = spec.dist * (0.55 + Math.random()*0.6);
    var dx = Math.cos(ang)*d, dy = Math.sin(ang)*d, g = spec.g||0;
    var rot = spec.rot ? (Math.random()*720 - 360) : 0, life = spec.life||1000;
    p.animate([
      {transform:'translate(-50%,-50%)', opacity:1, offset:0},
      {transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) rotate('+rot+'deg)', opacity:1, offset:.65},
      {transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+(dy+g)+'px)) rotate('+rot+'deg)', opacity:0, offset:1}
    ], {duration: life, easing:'cubic-bezier(.15,.7,.4,1)'});
    (function(el){ setTimeout(function(){ el.remove(); }, life + 60); })(p);
  }
}
function _rfxConfetti(c){
  var cols = ['#9b59b6','#e84393','#27ae60','#c0392b','#7ec8e3','#e67e22','#ffffff'];
  for (var i = 0; i < 24; i++){
    var p = document.createElement('span'); p.className = 'rfx-pt';
    p.style.width = (5 + Math.random()*4)+'px'; p.style.height = (7 + Math.random()*4)+'px';
    p.style.background = cols[(Math.random()*cols.length)|0]; p.style.borderRadius = '1px';
    c.appendChild(p);
    var ang = (-170 + Math.random()*160) * Math.PI/180, d = 70 + Math.random()*60;
    var dx = Math.cos(ang)*d, dy = Math.sin(ang)*d, rot = Math.random()*720 - 360, life = 1300 + Math.random()*400;
    p.animate([
      {transform:'translate(-50%,-50%)', opacity:1, offset:0},
      {transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) rotate('+rot+'deg)', opacity:1, offset:.5},
      {transform:'translate(calc(-50% + '+(dx*1.1)+'px), calc(-50% + '+(dy+130)+'px)) rotate('+(rot+120)+'deg)', opacity:0, offset:1}
    ], {duration: life, easing:'cubic-bezier(.2,.6,.4,1)'});
    (function(el){ setTimeout(function(){ el.remove(); }, life + 80); })(p);
  }
}

// Joue la chorégraphie animée d'une réaction à la position (x,y) — le siège du joueur
function playReactionFx(emoji, x, y){
  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var fx = REACTION_FX[emoji] || _rfxDefault();
  var c = document.createElement('div'); c.className = 'rfx';
  c.style.left = (x || window.innerWidth * 0.5) + 'px';
  c.style.top  = (y || window.innerHeight * 0.7) + 'px';
  document.body.appendChild(c);
  var big = document.createElement('span');
  big.className = 'rfx-big rfx-anim-' + (reduce ? 'pop' : fx.a);
  big.textContent = emoji;
  c.appendChild(big);
  if (!reduce) _rfxSpawn(c, fx.p);
  setTimeout(function(){ if (c.parentNode) c.remove(); }, 1800);
}

// Affiche la réaction animée (chorégraphie) à la position fournie (siège du joueur).
// Conserve la signature historique : appelée par showSeatReaction avec les coords du siège.
function showFloatingReaction(emoji, fromX, fromY) {
  playReactionFx(emoji, fromX, fromY);
}

// Affiche la réaction sur l'avatar du joueur dans les sièges
function showSeatReaction(pid, emoji) {
  var seatEls = document.querySelectorAll('.seat');
  if (!window.seats) return;
  var myIdx = seats.indexOf(myId);
  var rotated = myIdx >= 0
    ? seats.slice(myIdx).concat(seats.slice(0, myIdx))
    : seats;
  var idx = rotated.indexOf(pid);
  if (idx < 0 || !seatEls[idx]) return;
  var existing = seatEls[idx].querySelector('.seat-reaction');
  if (existing) existing.remove();
  var badge = document.createElement('div');
  badge.className = 'seat-reaction';
  badge.textContent = emoji;
  seatEls[idx].style.overflow = 'visible';
  seatEls[idx].appendChild(badge);
  setTimeout(function(){ if (badge.parentNode) badge.remove(); }, 2700);
  // Position pour l'animation flottante
  var sr = seatEls[idx].getBoundingClientRect();
  showFloatingReaction(emoji, sr.left + sr.width/2, sr.top);
}

// Mettre à jour les compteurs affichés sur les boutons
function updateReactionCount(emoji) {
  var EMOJIS = ["🎉", "🥳", "👏", "🙌", "💪", "🤣", "😂", "😬", "🤦", "😴", "👍", "😎", "🤩", "👀", "🤔", "😱", "😡", "😤", "🔥", "😮", "💰", "💎", "🎰", "🍀", "🃏", "💀", "🤑", "🫵", "🫡", "🤫"];
  var idx = EMOJIS.indexOf(emoji);
  if (idx < 0) return;
  var count = _reactionCounts[emoji] || 0;
  // Mettre à jour dans le panneau principal (rcp-N)
  var el = document.getElementById('rcp-' + idx);
  if (el) el.textContent = count > 0 ? count : '';
  // Ancien panneau chat (rc-N) si encore présent
  var el2 = document.getElementById('rc-' + idx);
  if (el) el.textContent = count > 0 ? count : '';
  // Reset après 6 secondes d'inactivité
  clearTimeout(_reactionTimers[emoji]);
  _reactionTimers[emoji] = setTimeout(function() {
    _reactionCounts[emoji] = 0;
    if (el) el.textContent = '';
  }, 6000);
}

// Recevoir une réaction d'un autre joueur (via chat).
// IMPORTANT: the proxy broadcasts REACT:pid:emoji messages to EVERY
// connected client, regardless of which table they sit at. Until we
// route reactions through the actual PokerTH game-chat (which is
// table-scoped), we filter here client-side: if the sender is not at
// our table, ignore the reaction completely — no counter increment,
// no seat badge, no sound. Without this filter, reactions from another
// table would silently bump our counters and play the `playTone` chime,
// which is what the user reported hearing.
function handleIncomingReaction(pid, emoji, via) {
  if (_reactMuted) return;                       // reactions coupees localement : aucun rendu, badge ni son
  if (!window.seats || seats.indexOf(pid) < 0) return;
  via = via || 'react';
  var _k = pid + '|' + emoji, _now = Date.now(), _p = _reactSeen[_k];
  if (_p && _p.via !== via && _now - _p.t < 1500) { _reactSeen[_k] = { t: _now, via: via }; return; }
  _reactSeen[_k] = { t: _now, via: via };
  _reactionCounts[emoji] = (_reactionCounts[emoji] || 0) + 1;
  updateReactionCount(emoji);
  showSeatReaction(pid, emoji);
  // Notif sonore légère
  if (typeof playTone === 'function') playTone(800, 0.05, 0.08);
}

// Reflete l'etat "couper les reactions" : bouton barre + grille grisee/inerte.
function _applyReactMuteUI() {
  var grid = document.querySelector('#g-reaction-panel .react-grid');
  if (grid) grid.classList.toggle('react-muted', _reactMuted);
  var btn = document.getElementById('react-mute-toggle');
  if (btn) {
    btn.classList.toggle('muted', _reactMuted);
    btn.setAttribute('aria-pressed', _reactMuted ? 'true' : 'false');
  }
  // Bouton emoji sur le tapis : grisé quand les réactions sont coupées.
  var tbtn = document.getElementById('react-toggle-btn');
  if (tbtn) tbtn.classList.toggle('muted', _reactMuted);
}
// Options avancees : couper/retablir les reactions emoji (parite DisableEmojiReactions).
// Meme preference que le bouton « muet » du panneau de reactions (pth_react_muted).
function setReactMuted(on) {
  _reactMuted = !!on;
  try { localStorage.setItem('pth_react_muted', _reactMuted ? '1' : '0'); } catch (e) {}
  _applyReactMuteUI();
}
window.setReactMuted = setReactMuted;

// ─── Exports ES + alias legacy ───────────────────────────────────────────
export { handleIncomingReaction, setReactMuted, playReactionFx, showFloatingReaction };
if (typeof window !== 'undefined') {
  // setReactMuted est déjà attaché par le bloc lui-même (verbatim).
  window.handleIncomingReaction = handleIncomingReaction;
  window._applyReactMuteUI = _applyReactMuteUI;
  window._applyReactPinUI = _applyReactPinUI;
  Object.defineProperty(window, '_reactMuted', {
    configurable: true,
    get() { return _reactMuted; },
    set(v) { _reactMuted = v; },
  });
  Object.defineProperty(window, '_reactPinned', {
    configurable: true,
    get() { return _reactPinned; },
    set(v) { _reactPinned = v; },
  });
  window.Reactions = { handleIncomingReaction, setReactMuted, playReactionFx };
}
