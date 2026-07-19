// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/anim.mjs
//
// Animations de l'écran de jeu : confetti, entrée de table, mode urgent,
// élimination d'un joueur, taille du pot, déplacement du bouton dealer,
// flash All-In, fondu des badges d'action, révélation showdown, étoiles,
// pop du pot, activation « mon tour » (setMyTurnActive), deal de mes cartes
// et flash du libellé d'action. Respecte la discipline thermique iOS du
// projet : rien ici n'anime de box-shadow (opacity/transform seulement).
//
// Historique : extrait de public/pokerth.js (extraction #7 du plan
// docs/ESM_PLAN.md), au verbatim, en trois plages contiguës — l'indicateur
// de ping, les réglages avancés et l'état showdown (_sdLosers…) restent dans
// le monolithe. Dépendances à runtime via les getters exposés par l'App
// (window.seats / seatData / myId) et t() (shim). _prevDealerPid est écrit
// en nu par le monolithe (reset à HandStart) → pont defineProperty.
// ─────────────────────────────────────────────────────────────────────────

function t(key, opts) {
  return (typeof window !== 'undefined' && window.t) ? window.t(key, opts) : key;
}

var _prevDealerPid = -1;

// Confetti rain
function launchConfetti(count) {
  var colors = ['#f0c040','#e74c3c','#3498db','#2ecc71','#9b59b6','#ff8c42','#fff'];
  var shapes = ['▲','●','■','♠','♥','♦','♣'];
  count = count || 60;
  for (var i = 0; i < count; i++) {
    (function(i) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.width  = (8 + Math.random() * 8) + 'px';
        el.style.height = (8 + Math.random() * 8) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 5000);
      }, i * 35);
    })(i);
  }
}

// Transition lobby → table
function animateTableEnter() {
  var sg = document.getElementById('s-game');
  if (!sg) return;
  sg.classList.remove('entering');
  void sg.offsetWidth;
  sg.classList.add('entering');
  setTimeout(function(){ sg.classList.remove('entering'); }, 500);
}

// Urgence timer (≤5s)
function setUrgentMode(active) {
  var sg = document.getElementById('s-game');
  if (sg) sg.classList.toggle('urgent', active);
}

// Élimination joueur
function animatePlayerEliminated(pid) {
  // Cibler le siège via data-pid (fiable même si deux joueurs ont la même initiale)
  var seatEl = document.querySelector('#g-seats [data-pid="' + pid + '"]');
  if (seatEl) {
    seatEl.classList.add('eliminated');
    setTimeout(function(){ seatEl.classList.remove('eliminated'); }, 900);
  }
}

// Pot énorme

function updatePotSize(potVal) {
  var maxStack = 3000; // valeur par défaut
  if (window.seats && window.seats.length > 0) {
    maxStack = Object.values(window.seatData || {})
      .reduce(function(acc, sd){ return Math.max(acc, (sd.money||0) + (sd.bet||0)); }, 3000);
  }
  var threshold = maxStack * 0.6;
  var el1 = document.getElementById('g-pot');
  var el2 = document.getElementById('g-potbar');
  [el1, el2].forEach(function(el) {
    if (!el) return;
    el.classList.toggle('pot-huge', potVal > threshold && potVal > 500);
  });
}

// Dealer badge volant
function animateDealerMove(fromPid, toPid) {
  if (fromPid < 0 || fromPid === toPid) return;
  // Trouver les positions des sièges
  var seatEls = document.querySelectorAll('.seat');
  var fromEl = null, toEl = null;
  // Utiliser les coords absolues des sièges
  // On crée le badge volant depuis la position du dealer précédent
  var allSeats = Array.from(seatEls);
  // Tenter de localiser par ordre dans rotated
  var fromIdx = -1, toIdx = -1;
  if (window.seats) {
    var myIdx = window.seats.indexOf(window.myId || -1);
    var rotated = myIdx >= 0
      ? window.seats.slice(myIdx).concat(window.seats.slice(0, myIdx))
      : window.seats;
    fromIdx = rotated.indexOf(fromPid);
    toIdx   = rotated.indexOf(toPid);
  }
  if (fromIdx < 0 || toIdx < 0 || !allSeats[fromIdx] || !allSeats[toIdx]) return;
  var fr = allSeats[fromIdx].getBoundingClientRect();
  var tr = allSeats[toIdx].getBoundingClientRect();

  var badge = document.createElement('div');
  badge.className = 'dealer-badge-fly';
  badge.textContent = 'D';
  badge.style.left = (fr.left + fr.width/2 - 9) + 'px';
  badge.style.top  = (fr.top  + fr.height/2 - 9) + 'px';
  document.body.appendChild(badge);

  requestAnimationFrame(function() { requestAnimationFrame(function() {
    badge.style.left = (tr.left + tr.width/2 - 9) + 'px';
    badge.style.top  = (tr.top  + tr.height/2 - 9) + 'px';
    setTimeout(function(){ badge.remove(); }, 900);
  }); });
}

// All-in chips explosion
function animateAllIn(fromPid) {
  var seatEls = document.querySelectorAll('.seat');
  if (window.seats) {
    var myIdx = window.seats.indexOf(window.myId || -1);
    var rotated = myIdx >= 0
      ? window.seats.slice(myIdx).concat(window.seats.slice(0, myIdx))
      : window.seats;
    var idx = rotated.indexOf(fromPid);
    if (idx < 0 || !seatEls[idx]) return;
    var sr = seatEls[idx].getBoundingClientRect();
    var sx = sr.left + sr.width/2;
    var sy = sr.top + sr.height/2;
    var colors = ['#f0c040','#c8a820','#ffe066','#b8960c'];
    for (var i = 0; i < 12; i++) {
      (function(i) {
        var el = document.createElement('div');
        el.className = 'allin-chip';
        var angle = (i / 12) * Math.PI * 2;
        var d1 = 40 + Math.random() * 30;
        var d2 = 80 + Math.random() * 60;
        el.style.setProperty('--ax', Math.cos(angle)*d1 + 'px');
        el.style.setProperty('--ay', Math.sin(angle)*d1 + 'px');
        el.style.setProperty('--bx', Math.cos(angle)*d2 + 'px');
        el.style.setProperty('--by', Math.sin(angle)*d2 + 'px');
        el.style.setProperty('--ar', (Math.random()*360) + 'deg');
        el.style.background = colors[i % colors.length];
        el.style.left = sx + 'px';
        el.style.top  = sy + 'px';
        el.style.animationDelay = (i * 0.03) + 's';
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 1000);
      })(i);
    }
  }
}

// Reset fade des actions entre mains
function fadeOutAllActions() {
  document.querySelectorAll('.seat-action-label').forEach(function(el) {
    el.classList.add('fading');
    setTimeout(function(){ el.classList.remove('fading'); el.textContent = ''; }, 450);
  });
}

// Showdown — flip cartes adversaires
function animateShowdownCards() {
  var delay = 0;
  document.querySelectorAll('.seat:not(.me) .pk.xsm').forEach(function(el) {
    el.classList.remove('pk-showdown');
    void el.offsetWidth;
    el.style.animationDelay = (delay) + 's';
    el.classList.add('pk-showdown');
    delay += 0.12;
  });
}

// Thinking dots (remplace le texte "réfléchit")
function thinkingHtml(name) {
  return name + '<span class="thinking-dots"><span></span><span></span><span></span></span>';
}


// Explosion d'étoiles sur victoire
function burstStars(x, y, count) {
  count = count || 12;
  var emojis = ['⭐','✨','🌟','💫','🎉','🃏','💰'];
  for (var i = 0; i < count; i++) {
    (function(i) {
      setTimeout(function() {
        var el = document.createElement('div');
        el.className = 'win-star';
        var angle = (i / count) * 360 * Math.PI / 180;
        var dist = 80 + Math.random() * 120;
        var tx = Math.cos(angle) * dist + 'px';
        var ty = Math.sin(angle) * dist + 'px';
        var rot = (Math.random() * 720 - 360) + 'deg';
        el.style.setProperty('--tx', tx);
        el.style.setProperty('--ty', ty);
        el.style.setProperty('--rot', rot);
        el.style.left = (x || window.innerWidth/2) + 'px';
        el.style.top  = (y || window.innerHeight * 0.4) + 'px';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(el);
        setTimeout(function(){ el.remove(); }, 1300);
      }, i * 55);
    })(i);
  }
}

// Animation pot (bump visuel quand le pot augmente)
function animatePot(newVal) {
  var els = [document.getElementById('g-pot'), document.getElementById('g-potbar')];
  els.forEach(function(el) {
    if (!el) return;
    el.classList.remove('pot-bump');
    void el.offsetWidth; // reflow
    el.classList.add('pot-bump');
    setTimeout(function(){ el.classList.remove('pot-bump'); }, 400);
  });
}

// Activer/désactiver l'animation "mon tour" sur my-zone
function setMyTurnActive(active) {
  var mz = document.querySelector('.my-zone');
  if (!mz) return;
  if (active) mz.classList.add('my-turn-active');
  else mz.classList.remove('my-turn-active');
  // Options avancées : focus auto du champ de mise à mon tour (opt-in).
  if (active) {
    try {
      if (localStorage.getItem('pth_focus_bet') === '1') {
        var _ri = document.getElementById('raise-amt');
        if (_ri) setTimeout(function () { try { _ri.focus(); } catch (e) {} }, 60);
      }
    } catch (e) {}
  }
}

// ── Options avancées (fenêtre de parité QML) ────────────────────────────────

// Animation des cartes de ma main (deal)
function animateDealMyCards() {
  var pb = document.getElementById('g-myseat-cards');
  if (!pb) return;
  pb.querySelectorAll('.pk').forEach(function(el) {
    el.classList.remove('pk-deal');
    void el.offsetWidth;
    el.classList.add('pk-deal');
  });
}

// Flash sur une action (badge seat)
function flashActionLabel(pid) {
  var seats = document.querySelectorAll('.seat');
  seats.forEach(function(s) {
    var lbl = s.querySelector('.seat-action-label');
    if (lbl) {
      lbl.classList.remove('flash');
      void lbl.offsetWidth;
      lbl.classList.add('flash');
    }
  });
}




// ─── Exports ES + alias legacy ───────────────────────────────────────────
export {
  launchConfetti, animateTableEnter, setUrgentMode, animatePlayerEliminated,
  updatePotSize, animateDealerMove, animateAllIn, fadeOutAllActions,
  animateShowdownCards, thinkingHtml, burstStars, animatePot, setMyTurnActive,
  animateDealMyCards, flashActionLabel,
};
if (typeof window !== 'undefined') {
  window.launchConfetti = launchConfetti;
  window.animateTableEnter = animateTableEnter;
  window.setUrgentMode = setUrgentMode;
  window.animatePlayerEliminated = animatePlayerEliminated;
  window.updatePotSize = updatePotSize;
  window.animateDealerMove = animateDealerMove;
  window.animateAllIn = animateAllIn;
  window.fadeOutAllActions = fadeOutAllActions;
  window.animateShowdownCards = animateShowdownCards;
  window.thinkingHtml = thinkingHtml;
  window.burstStars = burstStars;
  window.animatePot = animatePot;
  window.setMyTurnActive = setMyTurnActive;
  window.animateDealMyCards = animateDealMyCards;
  window.flashActionLabel = flashActionLabel;
  Object.defineProperty(window, '_prevDealerPid', {
    configurable: true,
    get() { return _prevDealerPid; },
    set(v) { _prevDealerPid = v; },
  });
  window.Anim = { launchConfetti, burstStars, animatePot, setMyTurnActive };
}
