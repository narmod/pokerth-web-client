// ═══════════════════════════════════════════════════════════════════
// Timer de tour (anneau + cadre rectangulaire + barre QML) — ESM #9f-3.
// Fonctions déplacées telles quelles depuis l'IIFE App. Adaptations de
// portée module uniquement : setUrgentMode (anim.mjs), notifyTick* 
// (sounds.mjs) et renderSeats (pont ajouté côté monolithe) via window.*.
// ═══════════════════════════════════════════════════════════════════
import { S } from '../game/state.mjs';

// Countdown RECTANGULAIRE (style de siege 'pokerth') : cadre depletif autour
// de la .seat-plate au lieu de l'anneau rond. pathLength=100 -> depletion
// uniforme quelle que soit la taille/aspect de la boite. Couleurs officielles
// 2.1.1 : self #6E9CEC / adversaires #4070D0 / piste #0e1a30.
function _timerRectSvg(secs, total, isMe) {
  var frac = Math.max(0, secs / (total || 30));
  var off = (100 * (1 - frac)).toFixed(1);
  var col = isMe ? '#6E9CEC' : '#4070D0';
  return '<svg class="seat-timer-rect" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">'
    + '<rect class="rt-bg"  x="2" y="2" width="96" height="96" rx="7" pathLength="100"/>'
    + '<rect class="rt-arc" x="2" y="2" width="96" height="96" rx="7" pathLength="100"'
    + ' style="stroke:' + col + '" stroke-dasharray="100" stroke-dashoffset="' + off + '"/>'
    + '</svg>';
}

function _updateTimer() {
  S._timerSec = Math.max(0, S._timerSec - 1);
  // Update SVG arcs in place — no full re-render
  var urgent = S._timerSec <= 8;
  var col = urgent ? 'var(--timer-urgent, #e74c3c)' : 'var(--timer-normal, #f0c040)';
  // Radius MUST match _timerSvg() (r=20): dashoffset is computed against the
  // same circumference as the stroke-dasharray drawn there, otherwise the
  // ring depletes on a different circle and empties ~1s early.
  var r = 20, circ = 2 * Math.PI * r;
  var offset = (circ * (1 - S._timerSec / (S._timerTot || 30))).toFixed(1);
  document.querySelectorAll('.seat-timer .arc').forEach(function(el) {
    el.style.stroke = col;
    el.setAttribute('stroke-dashoffset', offset);
  });
  // Countdown rectangulaire (style pokerth) : depletion sur pathLength=100.
  var _roff = (100 * (1 - S._timerSec / (S._timerTot || 30))).toFixed(1);
  document.querySelectorAll('.seat-timer-rect .rt-arc').forEach(function(el) {
    el.setAttribute('stroke-dashoffset', _roff);
  });
  // Barre de timeout QML (bloc F) : remplissage décompté linéairement.
  var _tw = (100 * Math.max(0, S._timerSec / (S._timerTot || 30))).toFixed(1) + '%';
  document.querySelectorAll('.seat-timeout-bar .stb-fill').forEach(function(el) {
    el.style.width = _tw;
  });
  // No <text> inside .seat-timer — the countdown number is rendered in the
  // seat badge (stb-*) and the player-bar below, not in the SVG.
  // Badge timer sous chaque siège
  var stb = document.getElementById('stb-' + S.turnPid);
  if (stb) { stb.textContent = S._timerSec > 0 ? S._timerSec + 's' : ''; stb.style.color = col; }
  // Player bar counter
  var pb = document.getElementById('pb-timer');
  if (pb && S.turnPid === S.myId) {
    pb.textContent = S._timerSec > 0 ? S._timerSec + 's' : '';
    pb.style.color = col;
  }
  // Flash my-zone border
  var mz = document.querySelector('.my-zone');
  if (mz && S.turnPid === S.myId) mz.style.borderTopColor = urgent ? '#e74c3c' : '';
  window.setUrgentMode(urgent && S.turnPid === S.myId);
  // Alerte sonore du décompte — uniquement MON tour, et seulement si le
  // timeout de la table laisse de la marge (>= 10 s) pour ne pas harceler
  // sur les parties très rapides. Le mute global est respecté par playTone().
  // Tic léger à 5-4-3-2, bip marqué sur la dernière seconde.
  if (S.turnPid === S.myId && S.gameTimeout >= 10) {
    if (S._timerSec >= 2 && S._timerSec <= 5) {
      if (typeof window.notifyTick === 'function') window.notifyTick();
    } else if (S._timerSec === 1) {
      if (typeof window.notifyTickFinal === 'function') window.notifyTickFinal();
    }
  }
  if (S._timerSec <= 0) { clearInterval(S._timerID); window.setUrgentMode(false); }
}

function startTurnTimer() {
  clearInterval(S._timerID);
  S._timerSec = S._timerTot = (S.gameTimeout > 0 ? S.gameTimeout : 15);
  window.renderSeats();  // Draws the SVG
  S._timerID = setInterval(_updateTimer, 1000);
}

function stopTurnTimer() {
  clearInterval(S._timerID);
  S._timerID = null;
  S._timerSec = 0;
  // Clear timers from DOM
  document.querySelectorAll('.seat-timer, .seat-timer-rect').forEach(function(el){ el.remove(); });
  var pb = document.getElementById('pb-timer');
  if (pb) pb.textContent = '';
  var mz = document.querySelector('.my-zone');
  if (mz) mz.style.borderTopColor = '';
  window.setUrgentMode(false);
}

export { _timerRectSvg, _updateTimer, startTurnTimer, stopTurnTimer };

window._timerRectSvg = _timerRectSvg;
window._updateTimer = _updateTimer;
window.startTurnTimer = startTurnTimer;
window.stopTurnTimer = stopTurnTimer;
