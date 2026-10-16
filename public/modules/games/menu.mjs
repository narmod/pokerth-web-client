// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The arcade's home — a page game (no stage) shown in the arcade page
// (web extension, narmod 2026-10-16; a page since web.88). One card per game
// of the registry (index.mjs GAMES): its best score on this device, « Play »
// and « Rules » (the rules sheet of the shell), under its cover picture
// (art.mjs, repainted when the theme changes). ←/→ (keys, pad) pick a card,
// Space / A plays it, ↓ shows its rules. Colours from the theme's tokens.
// The Ace waves from the top of the page.
// ═══════════════════════════════════════════════════════════════════

import { GAMES, HOME, gameName } from './index.mjs';
import { aceActor, fmt } from './common.mjs';
import { art } from './art.mjs';

const CSS = `
#pth-game .gm-hub{max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
#pth-game .gm-head{display:flex;align-items:center;gap:14px}
#pth-game .gm-ace{position:relative;flex:none;width:76px;height:96px}
#pth-game .gm-head h2{margin:0;font:700 clamp(24px,5vw,34px)/1.1 'Cinzel',Georgia,serif;letter-spacing:.04em;color:var(--text-hi)}
#pth-game .gm-head p{margin:4px 0 0;color:var(--text);font-size:14px;line-height:1.45;max-width:60ch}
#pth-game .gm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:14px}
#pth-game .gm-card{display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:14px;background:var(--panel);border:1px solid var(--border);
  box-shadow:0 2px 10px rgba(0,0,0,.12);cursor:pointer;min-width:0}
#pth-game .gm-card.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 4px 16px rgba(0,0,0,.18)}
#pth-game .gm-card{overflow:hidden}
#pth-game .gm-card .gm-art{margin:-16px -16px 4px;aspect-ratio:320/140;max-height:170px;overflow:hidden;border-bottom:1px solid var(--border);background:var(--field-bg)}
#pth-game .gm-card .gm-art svg{display:block;width:100%;height:100%}
#pth-game .gm-card .gm-ico{font-size:.9em;margin-right:6px}
#pth-game .gm-card h3{margin:0;font:700 19px/1.2 'Cinzel',Georgia,serif;letter-spacing:.02em;color:var(--text-hi)}
#pth-game .gm-card .gm-rec{margin:0;font:500 12px 'Inconsolata',monospace;color:var(--text);min-height:1.2em}
#pth-game .gm-card .gm-btns{display:flex;gap:8px;margin-top:auto;flex-wrap:wrap}
#pth-game .gm-keys{margin:0;color:var(--text);font-size:12px;opacity:.8}
#pth-game .gm-keys .pg-k{color:var(--gold);border-color:var(--border-hi)}
`;

export function create(shell) {
  const { t, esc } = shell;
  if (!document.getElementById('pth-game-hub-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-hub-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  // Every game, in the registry's order.
  const games = GAMES.filter((g) => g.id !== HOME).map((g) => Object.assign({}, g, { name: gameName(g, t) }));
  let sel = 0;
  const best = (id) => { try { return parseInt(localStorage.getItem('pth_game_best_' + id) || '0', 10) || 0; } catch (e) { return 0; } };

  shell.view.innerHTML = '<div class="gm-hub"><div class="gm-head"><div class="gm-ace"></div><div><h2>' + esc(t('gmTitle')) + '</h2><p>' + esc(t('gmIntro')) + '</p></div></div>'
    + '<div class="gm-grid">' + games.map((g, i) => '<article class="gm-card" data-i="' + i + '">'
      + '<div class="gm-art" data-art="' + esc(g.id) + '">' + art(g.id, shell.theme.light) + '</div>'
      + '<h3>' + '<span class="gm-ico" aria-hidden="true">' + g.icon + '</span>' + esc(g.name) + '</h3>'
      + '<p class="gm-rec">' + (best(g.id) ? esc(t('arRecord', { n: fmt(best(g.id)) })) : '&nbsp;') + '</p>'
      + '<div class="gm-btns"><button type="button" class="pg-btn" data-play="' + i + '">' + esc(t('gmPlay')) + '</button>'
      + '<button type="button" class="pg-btn pg-ghost" data-rules="' + i + '">' + esc(t('gmRules')) + '</button></div></article>').join('')
    + '</div>'
    + '<p class="gm-keys"><span class="pg-k">←</span> <span class="pg-k">→</span> · <span class="pg-k">Space</span> · <span class="pg-k">↓</span> ' + esc(t('gmRules')) + '</p></div>';
  const cards = Array.from(shell.view.querySelectorAll('.gm-card'));
  const mark = () => cards.forEach((c, i) => c.classList.toggle('on', i === sel));
  mark();
  const play = (i) => shell.open(games[i].id);
  const rules = (i) => shell.rules(games[i], () => play(i));
  shell.view.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); play(+(b.getAttribute('data-play') || 0)); }));
  shell.view.querySelectorAll('[data-rules]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); rules(+(b.getAttribute('data-rules') || 0)); }));
  cards.forEach((c, i) => c.addEventListener('click', () => { sel = i; mark(); }));
  // The cover picture plays too.
  shell.view.querySelectorAll('.gm-art').forEach((a, i) => a.addEventListener('click', (e) => { e.stopPropagation(); play(i); }));
  // Light / dark theme switched while on the page: repaint the covers.
  function theme() {
    shell.view.querySelectorAll('.gm-art').forEach((a) => { a.innerHTML = art(a.getAttribute('data-art') || '', shell.theme.light); });
  }

  // The Ace waves from the top of the page.
  const aceBox = /** @type {HTMLElement} */ (shell.view.querySelector('.gm-ace'));
  const ace = aceActor(aceBox);
  ace.pose('wave');
  ace.place(38, 94, 0.42, 1);

  function input(a, down) {
    if (!down) return;
    if (a === 'left' || a === 'right') { sel = (sel + (a === 'left' ? -1 : 1) + games.length) % games.length; mark(); cards[sel].scrollIntoView({ block: 'nearest' }); }
    else if (a === 'jump') play(sel);
    else if (a === 'duck') rules(sel);
  }
  return { update() {}, draw() {}, input, theme, running: () => false, destroy() { ace.remove(); } };
}
