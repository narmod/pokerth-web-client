// ═══════════════════════════════════════════════════════════════════
// Cartes à table : cartes propres (player-bar, option « révéler au
// clic »), community cards, « Show » post-main, animations de
// distribution et de jeton vers le pot — chantier ESM #9g-B3.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations :
// cardHtml/cardToHtml (deck.mjs) et renderHandStrength (odds-panel.mjs)
// importés ; _ownReveal → window._ownReveal (4×, var top-level du
// script, écrite aussi par handleMsg) ; renderSeats →
// window.renderSeats (2×) et renderMyTurnActions →
// window.renderMyTurnActions (1×, pont ajouté au monolithe) ;
// 1× $( réécrit. window._refreshOwnCards (closure window) déplacé
// avec son cluster.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';
import { cardHtml, cardToHtml } from './deck.mjs';
import { renderHandStrength } from './odds-panel.mjs';

// ── « Show » volontaire post-main (feedback communauté : bouton AU-DESSUS
// des cartes, pas à la place du All-In comme le QML). Fenêtre : de
// EndOfHandHide (main gagnée sans abattage → mes cartes non révélées)
// jusqu'au HandStart suivant. One-shot. ──
function _setCanShow(on) {
  window._canShowCards = !!on;
  // Parité QML : plus de bouton flottant au-dessus des cartes — le All-In
  // de la barre devient « Show » (voir renderMyTurnActions). Le bouton
  // legacy reste masqué (F5 route via window._canShowCards).
  var b = document.getElementById('g-show-btn');
  if (b) b.style.display = 'none';
  try { window.renderMyTurnActions(true); } catch (e) {}
}

// Cartes propres masquées ? (option pth_own_click active ET pas encore révélées)
function _ownCardsHidden() {
  try { return localStorage.getItem('pth_own_click') === '1' && !window._ownReveal; } catch (e) { return false; }
}
function renderMyCards() {
  const pb = document.getElementById('g-myseat-cards');
  if (!pb) return;
  var optOn = false; try { optOn = (localStorage.getItem('pth_own_click') === '1'); } catch (e) {}
  var hide = optOn && !window._ownReveal;
  const c1 = hide ? null : (S.myCards[0] != null ? S.myCards[0] : null);
  const c2 = hide ? null : (S.myCards[1] != null ? S.myCards[1] : null);
  pb.innerHTML = cardHtml(c1, 'md') + cardHtml(c2, 'md');
  pb.classList.toggle('own-peek', hide);
  pb.style.cursor = optOn ? 'pointer' : '';
  // Tap sur la player-bar = bascule la révélation (uniquement si l'option est active).
  if (!pb._revealBound) {
    pb._revealBound = true;
    pb.addEventListener('click', function () {
      var on = false; try { on = (localStorage.getItem('pth_own_click') === '1'); } catch (e) {}
      if (!on) return;
      window._ownReveal = !window._ownReveal;
      renderMyCards();
      try { if (S.seats.length) window.renderSeats(); } catch (e) {}
    });
  }
}
// Re-rendu des cartes propres (player-bar + sièges) après bascule de l'option.
window._refreshOwnCards = function () {
  try { renderMyCards(); } catch (e) {}
  try { if (S.seats.length) window.renderSeats(); } catch (e) {}
};

// ── Distribution des cartes ──
function animateCardDeal() {
  // Option avancée « Animation de la distribution » (web, défaut ON) —
  // désactivable, demande du forum : le va-et-vient des cartes distrait.
  try { if (localStorage.getItem('pth_deal_anim') === '0') return; } catch (e) {}
  if (!S._lastPixPos.length) return;
  var cx = S._potCenter.x, cy = S._potCenter.y;
  if (!cx) return;
  // Cibles : uniquement les sièges réellement servis cette main. pixPos est
  // aligné 1:1 sur la liste de pids publiée par le renderer (_lastPixPids) ;
  // un siège parti, éliminé ou inactif ne reçoit pas de cartes — le même
  // rapport signalait des cartes volant vers les places des joueurs sortis.
  // Sans liste de pids (rendu antérieur), on garde l'ancien comportement.
  var pids = (S._lastPixPids && S._lastPixPids.length === S._lastPixPos.length) ? S._lastPixPids : null;
  var targets = [];
  for (var ti = 0; ti < S._lastPixPos.length; ti++) {
    if (pids) {
      var sd = S.seatData[pids[ti]];
      if (!sd || sd.gone || sd.active === false || (sd.money != null && sd.money <= 0)) continue;
      targets.push({ pos: S._lastPixPos[ti], me: pids[ti] === S.myId });
    } else {
      targets.push({ pos: S._lastPixPos[ti], me: ti === 0 });
    }
  }
  var n = targets.length; // nombre de joueurs servis
  if (!n) return;
  var delay = 0;
  var STEP = 180; // ms entre chaque carte
  // 2 cartes par joueur, dealer en premier
  for (var card = 0; card < 2; card++) {
    for (var i = 0; i < n; i++) {
      (function(pos, d, isMe) {
        setTimeout(function() {
          var el = document.createElement('div');
          el.className = 'fly-card' + (isMe ? ' mine' : '');
          el.style.left = (cx - 13) + 'px';
          el.style.top  = (cy - 18) + 'px';
          el.style.transform = 'rotate(' + (Math.random()*16-8) + 'deg) scale(0.7)';
          el.style.opacity = '1';
          document.body.appendChild(el);
          requestAnimationFrame(function() {
            el.style.left = (pos.left - 13) + 'px';
            el.style.top  = (pos.top  - 18) + 'px';
            el.style.transform = 'rotate(0deg) scale(1)';
          });
          setTimeout(function() {
            el.style.opacity = '0';
            setTimeout(function() { el.remove(); }, 200);
          }, 380);
        }, d);
      })(targets[i].pos, delay, targets[i].me);
      delay += STEP;
    }
  }
}

// ── Jeton qui glisse vers le pot ──
function animateChipToPot(pid, amount) {
  var myIdx = S.seats.indexOf(S.myId);
  var rotated2 = myIdx >= 0 ? S.seats.slice(myIdx).concat(S.seats.slice(0,myIdx)) : S.seats;
  var seatIdx = rotated2.indexOf(pid);
  if (seatIdx < 0 || !S._lastPixPos[seatIdx]) return;
  var from = S._lastPixPos[seatIdx];
  var to   = S._potCenter;
  if (!to.x) return;
  var el = document.createElement('div');
  el.className = 'fly-chip';
  el.textContent = amount > 999 ? (amount/1000).toFixed(1)+'k' : amount;
  el.style.left = (from.left - 10) + 'px';
  el.style.top  = (from.top  - 10) + 'px';
  document.body.appendChild(el);
  requestAnimationFrame(function() {
    el.style.left = (to.x - 10) + 'px';
    el.style.top  = (to.y - 10) + 'px';
    el.style.transform = 'scale(0.5)';
    el.style.opacity = '0';
  });
  setTimeout(function() { el.remove(); }, 600);
}

// ─── Community cards ───
// Rendu incrémental : seuls les slots dont la carte a changé sont recréés.
// Avant, `el.innerHTML = h` rebâtissait les 5 slots à chaque street, donc
// les cartes déjà visibles repassaient par le flip (opacity 0 → rotateY 90°)
// au turn et à la river — clignotement + cartes "en retard" sur mobile.
// Désormais, comme le QML, une carte posée ne bouge plus ; seule la nouvelle
// carte flippe (flop échelonné 0/120/240 ms via :nth-child, turn/river à 0).
function _commSlotValue(node) {
  if (!node || node.classList.contains('comm-slot')) return null;
  var v = parseInt(node.getAttribute('data-c'), 10);
  return Number.isInteger(v) ? v : null;
}
function renderComm(animate, isRiver) {
  const el = document.getElementById('g-comm');
  if (!el) return;
  const kids = el.children;
  if (kids.length === 5) {
    for (let i = 0; i < 5; i++) {
      const v = S.commCards[i] != null ? S.commCards[i] : null;
      if (_commSlotValue(kids[i]) === v) continue; // slot inchangé : on ne touche pas
      let cls = (animate && v != null) ? ' pk-flip' : '';
      if (isRiver && i === 4 && v != null) cls = ' pk-flip pk-river';
      const tmp = document.createElement('div');
      tmp.innerHTML = cardToHtml(v, false, true, cls);
      el.replaceChild(tmp.firstChild, kids[i]);
    }
  } else {
    // Première pose (ou conteneur vidé par msg-game-join) : rendu complet.
    let h = '';
    for (let i = 0; i < 5; i++) {
      const v = S.commCards[i];
      let cls = (animate && v != null) ? ' pk-flip' : '';
      if (isRiver && i === 4 && v != null) cls = ' pk-flip pk-river';
      h += cardToHtml(v != null ? v : null, false, true, cls);
    }
    el.innerHTML = h;
  }

  renderHandStrength();
}

export { _setCanShow, _ownCardsHidden, renderMyCards, animateCardDeal,
         animateChipToPot, renderComm };

for (const [k, v] of Object.entries({ _setCanShow, _ownCardsHidden,
  renderMyCards, animateCardDeal, animateChipToPot, renderComm }))
  window[k] = v;
