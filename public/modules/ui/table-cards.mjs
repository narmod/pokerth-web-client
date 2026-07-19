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
  if (!S._lastPixPos.length) return;
  var cx = S._potCenter.x, cy = S._potCenter.y;
  if (!cx) return;
  var n = S._lastPixPos.length; // nombre de joueurs
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
      })(S._lastPixPos[i], delay, S._lastPixPos[i] === S._lastPixPos[0]);
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
function renderComm(animate, isRiver) {
  const el = document.getElementById('g-comm');
  let h = '';
  for (let i=0; i<5; i++) {
    const v = S.commCards[i];
    let cls = (animate && v != null) ? ' pk-flip' : '';
    // River (i=4) — révélation plus lente et dramatique
    if (isRiver && i === 4 && v != null) cls = ' pk-flip pk-river';
    h += cardToHtml(v != null ? v : null, false, true, cls);
  }
  el.innerHTML = h;

  renderHandStrength();
}

export { _setCanShow, _ownCardsHidden, renderMyCards, animateCardDeal,
         animateChipToPot, renderComm };

for (const [k, v] of Object.entries({ _setCanShow, _ownCardsHidden,
  renderMyCards, animateCardDeal, animateChipToPot, renderComm }))
  window[k] = v;
