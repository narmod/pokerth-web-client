// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Arcade menu — what the secret training nickname opens (web extension,
// narmod 2026-10-16). Lists every game of the registry (index.mjs GAMES) with
// its best score on this device; ←/→ (pad, keys, tap) pick, jump / tap opens
// it in the same overlay (shell.open). Esc from a game comes back here; Esc
// here closes. The Ace waves from the felt.
// ═══════════════════════════════════════════════════════════════════

import { GAMES, HOME, gameName } from './index.mjs';
import { aceActor, fmt } from './common.mjs';


export function create(shell) {
  const { t, esc } = shell;
  const games = GAMES.filter((g) => g.id !== HOME);
  let sel = 0, time = 0;
  const ace = aceActor(shell.layer);
  ace.pose('wave');

  const best = (id) => { try { return parseInt(localStorage.getItem('pth_game_best_' + id) || '0', 10) || 0; } catch (e) { return 0; } };
  function render() {
    shell.panel('<h2>Arcade</h2><p>' + esc(t('gmPick')) + '</p><div class="gm-tiles">'
      + games.map((g, i) => '<button type="button" class="gm-tile' + (i === sel ? ' on' : '') + '" data-i="' + i + '"><i>' + g.icon + '</i><b>'
        + esc(gameName(g, t)) + '</b><small>' + (best(g.id) ? esc(t('arRecord', { n: fmt(best(g.id)) })) : '&nbsp;') + '</small></button>').join('')
      + '</div><p class="pg-dim"><span class="pg-k">←</span> <span class="pg-k">→</span> · <span class="pg-k">Space</span></p>', true);
    shell.root.querySelectorAll('.gm-tile').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', () => { sel = +(b.getAttribute('data-i') || 0); go(); });
    });
  }
  const go = () => shell.open(games[sel].id);
  render();

  function input(a, down) {
    if (!down) return;
    if (a === 'left' || a === 'right') { sel = (sel + (a === 'left' ? -1 : 1) + games.length) % games.length; render(); }
    else if (a === 'jump') go();
  }
  function update(dt) { time += dt; }
  function draw(g) {
    const w = shell.W, h = shell.H, gy = h - 40;
    const sky = g.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, '#0a100e'); sky.addColorStop(1, '#16251e');
    g.fillStyle = sky; g.fillRect(0, 0, w, gy);
    const felt = g.createLinearGradient(0, gy, 0, h); felt.addColorStop(0, '#24774e'); felt.addColorStop(1, '#174f34');
    g.fillStyle = felt; g.fillRect(0, gy, w, h - gy);
    g.strokeStyle = 'rgba(216,178,90,.55)'; g.setLineDash([7, 6]); g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(0, gy + 11); g.lineTo(w, gy + 11); g.stroke(); g.setLineDash([]);
    // The Ace waves from the felt, left of the tiles (no room on a narrow stage).
    ace.show(w >= 600);
    ace.place(w / 2 - 240, gy + 4, 0.5, shell.k);
  }
  return { update, draw, input, running: () => false, destroy() { ace.remove(); } };
}
