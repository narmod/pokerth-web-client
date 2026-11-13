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

import { GAMES, HOME, gameName, arcadeState, allUnlocked } from './index.mjs';
import { createAchievements } from '../achievements/index.mjs';
import { aceActor, fmt } from './common.mjs';
import { art } from './art.mjs';
import { backlight, motionOff } from '../ui/backlight.mjs';

// The games already revealed on this device (a game newly opened by the
// trophies is revealed once, in the light, the next time this page opens).
const REVEALED_KEY = 'pth_arcade_revealed';
function revealedSet() { try { return new Set(JSON.parse(localStorage.getItem(REVEALED_KEY) || '[]')); } catch (e) { return new Set(); } }
function saveRevealed(set) { try { localStorage.setItem(REVEALED_KEY, JSON.stringify([...set])); } catch (e) {} }

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
#pth-game .gm-count{margin:6px 0 0;font:600 13px/1.35 'Inter',system-ui,sans-serif;color:var(--gold)}
#pth-game .gm-card h3{display:flex;align-items:center;gap:8px}
#pth-game .gm-card .gm-ico{margin-right:0}
#pth-game .gm-step{flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;
  background:var(--field-bg);border:1px solid var(--border-hi);color:var(--gold);font:700 13px/1 'Inter',system-ui,sans-serif;letter-spacing:0}
#pth-game .gm-kind{align-self:flex-start;display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 8px;border-radius:999px;font:600 12px/1.2 'Inter',system-ui,sans-serif}
#pth-game .gm-kind.learn{background:rgba(63,174,106,.16);color:#7ee2a0;box-shadow:inset 0 0 0 1px rgba(63,174,106,.45)}
#pth-game .gm-kind.fun{background:rgba(216,178,90,.16);color:#f5d77a;box-shadow:inset 0 0 0 1px rgba(216,178,90,.45)}
#pth-game.pg-light .gm-kind.learn{background:rgba(46,125,78,.12);color:#1f6b3e;box-shadow:inset 0 0 0 1px rgba(46,125,78,.4)}
#pth-game.pg-light .gm-kind.fun{background:rgba(160,110,10,.12);color:#7a5408;box-shadow:inset 0 0 0 1px rgba(160,110,10,.4)}
#pth-game .gm-card.lock{cursor:default}
#pth-game .gm-card.lock h3{color:var(--text)}
#pth-game .gm-myst{position:relative;background:#06080b}
#pth-game .gm-myst .gm-dk{height:100%;filter:blur(9px) grayscale(1) brightness(.35);transform:scale(1.12)}
#pth-game .gm-myst .gm-qm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 58px/1 'Cinzel',Georgia,serif;color:rgba(245,215,122,.9);text-shadow:0 2px 12px rgba(0,0,0,.9)}
#pth-game.pg-light .gm-myst{background:#cfd3da}
#pth-game.pg-light .gm-myst .gm-dk{filter:blur(9px) grayscale(1) brightness(.75) contrast(.8)}
#pth-game.pg-light .gm-myst .gm-qm{color:#5a4410;text-shadow:0 1px 8px rgba(255,255,255,.8)}
#pth-game .gm-need{display:flex;flex-direction:column;gap:5px;width:100%;font:600 13px 'Inter',system-ui,sans-serif;color:var(--text)}
#pth-game .gm-bar{height:6px;border-radius:3px;background:var(--field-bg);box-shadow:inset 0 0 0 1px var(--border);overflow:hidden}
#pth-game .gm-bar i{display:block;height:100%;background:var(--gold);border-radius:3px}
#pth-game .gm-card.gm-rv .gm-art svg{animation:gm-rv-art 1.3s cubic-bezier(.2,.7,.2,1) both}
#pth-game .gm-card.gm-rv{border-color:#f5d77a;box-shadow:0 0 0 1px #f5d77a,0 0 30px 8px rgba(255,236,170,.45)}
#pth-game .gm-card.gm-rv .gm-kind,#pth-game .gm-card.gm-rv .gm-ico,#pth-game .gm-card.gm-rv .gm-btns>*{animation:gm-rv-in .45s cubic-bezier(.3,1.5,.5,1) both}
#pth-game .gm-card.gm-rv .gm-kind{animation-delay:.9s}
#pth-game .gm-card.gm-rv .gm-btns>*{animation-delay:1.2s}
#pth-game .gm-card.gm-rv .gm-btns>*+*{animation-delay:1.3s}
#pth-game .gm-card.gm-rv-soft{animation:gm-rv-fade .8s ease-out both}
@keyframes gm-rv-art{from{filter:blur(9px) grayscale(.6) brightness(2.4);transform:scale(1.12)}to{filter:none;transform:none}}
@keyframes gm-rv-in{from{opacity:0;transform:translateY(8px) scale(.7)}to{opacity:1;transform:none}}
@keyframes gm-rv-fade{from{opacity:.3}to{opacity:1}}
#pth-game .gm-keys{margin:0;color:var(--text);font-size:12px;opacity:.8}
#pth-game .gm-keys .pg-k{color:var(--gold);border-color:var(--border-hi)}
`;

export function create(shell) {
  const { t, esc } = shell;
  if (!document.getElementById('pth-game-hub-css')) {
    const st = document.createElement('style'); st.id = 'pth-game-hub-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  // Every game, in the registry's order: a numbered path that alternates a
  // game to get better at poker (🎓) and a game for fun (🎉). The Mini-games
  // mode (web.23, claude/CONCEPTION_MODE_ARCADE.md): a game its trophies have
  // not opened yet is a « mystery game » — its cover blurred and darkened under
  // a « ? », no name, icon, kind or rules, only its number and the trophies
  // still to win. The secret word opens every game.
  let st = null;
  try {
    const owned = new Set(createAchievements({}).snapshot().filter((a) => a.unlocked).map((a) => a.id));
    st = arcadeState({ count: owned.size, owned }, allUnlocked());
  } catch (e) { st = null; }
  const games = GAMES.filter((g) => g.id !== HOME).map((g) => {
    const s = st ? st.games.find((x) => x.id === g.id) : null;
    return Object.assign({}, g, { name: gameName(g, t), locked: !!(s && !s.open), need: s ? s.need : 0 });
  });
  const count = st ? st.count : 0;
  // Newly opened games are first shown as mystery games, then revealed one
  // after the other (web.24). The secret word opens everything at once.
  const revealed = revealedSet();
  if (allUnlocked()) { games.forEach((g) => revealed.add(g.id)); saveRevealed(revealed); }
  const pending = games.map((g, i) => (!g.locked && !revealed.has(g.id) ? i : -1)).filter((i) => i >= 0);
  const nOpen = games.filter((g) => !g.locked).length, nMyst = games.length - nOpen;
  let sel = 0;
  const best = (id) => { try { return parseInt(localStorage.getItem('pth_game_best_' + id) || '0', 10) || 0; } catch (e) { return 0; } };
  const KIND = { learn: '🎓 ' + t('gmKindLearn'), fun: '🎉 ' + t('gmKindFun') };
  const countLine = '🕹️ ' + (nMyst ? t(nMyst === 1 ? 'gmCountOne' : 'gmCount', { o: nOpen, all: games.length, m: nMyst }) : t('gmCountAll', { all: games.length }));
  function openCard(g, i) {
    return '<article class="gm-card" data-i="' + i + '">'
      + '<div class="gm-art" data-art="' + esc(g.id) + '">' + art(g.id, shell.theme.light) + '</div>'
      + '<h3><span class="gm-step">' + (i + 1) + '</span><span class="gm-ico" aria-hidden="true">' + g.icon + '</span>' + esc(g.name) + '</h3>'
      + (g.kind ? '<span class="gm-kind ' + g.kind + '">' + esc(KIND[g.kind]) + '</span>' : '')
      + '<p class="gm-rec">' + (best(g.id) ? esc(t('arRecord', { n: fmt(best(g.id)) })) : '&nbsp;') + '</p>'
      + '<div class="gm-btns"><button type="button" class="pg-btn" data-play="' + i + '">' + esc(t('gmPlay')) + '</button>'
      + '<button type="button" class="pg-btn pg-ghost" data-rules="' + i + '">' + esc(t('gmRules')) + '</button></div></article>';
  }
  function lockedCard(g, i) {
    const left = g.need - count;
    const need = left > 0 ? t(left === 1 ? 'gmNeedOne' : 'gmNeed', { n: left, c: count, t: g.need }) : Math.min(count, g.need) + '/' + g.need;
    return '<article class="gm-card lock" data-i="' + i + '">'
      + '<div class="gm-art gm-myst" aria-hidden="true"><div class="gm-dk" data-mart="' + esc(g.id) + '">' + art(g.id, shell.theme.light) + '</div><b class="gm-qm">?</b></div>'
      + '<h3><span class="gm-step">' + (i + 1) + '</span><span class="gm-q">' + esc(t('gmMystery')) + '</span></h3>'
      + '<div class="gm-btns"><div class="gm-need"><span>🏆 ' + esc(need) + '</span>'
      + '<div class="gm-bar"><i style="width:' + Math.min(100, Math.round(100 * count / Math.max(1, g.need))) + '%"></i></div></div></div></article>';
  }

  shell.view.innerHTML = '<div class="gm-hub"><div class="gm-head"><div class="gm-ace"></div><div><h2>' + esc(t('gmTitle')) + '</h2><p>' + esc(t('gmIntro')) + '</p>'
    + '<p class="gm-count">' + esc(countLine) + '</p></div></div>'
    + '<div class="gm-grid">' + games.map((g, i) => (g.locked || pending.indexOf(i) >= 0 ? lockedCard(g, i) : openCard(g, i))).join('')
    + '</div>'
    + '<p class="gm-keys"><span class="pg-k">←</span> <span class="pg-k">→</span> · <span class="pg-k">Space</span> · <span class="pg-k">↓</span> ' + esc(t('gmRules')) + '</p></div>';
  const cards = Array.from(shell.view.querySelectorAll('.gm-card'));
  const mark = () => cards.forEach((c, i) => c.classList.toggle('on', i === sel));
  mark();
  const hidden = new Set(pending);   // shown as mystery games until revealed
  const play = (i) => { if (!games[i].locked && !hidden.has(i)) shell.open(games[i].id); };
  const rules = (i) => { if (!games[i].locked && !hidden.has(i)) shell.rules(games[i], () => play(i)); };
  function bind(c, i) {
    c.addEventListener('click', () => { sel = i; mark(); });
    c.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); play(i); }));
    c.querySelectorAll('[data-rules]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); rules(i); }));
    // The cover picture plays too.
    c.querySelectorAll('.gm-art[data-art]').forEach((a) => a.addEventListener('click', (e) => { e.stopPropagation(); play(i); }));
  }
  cards.forEach((c, i) => bind(c, i));

  // The reveal: in turn, each newly opened game is brought into view and
  // appears in a light from behind its card; its cover clears, its name is
  // written, its kind and buttons pop in.
  let gone = false;
  async function reveal() {
    for (const i of pending) {
      if (gone) return;
      const g = games[i];
      try { cards[i].scrollIntoView({ block: 'center', behavior: motionOff() ? 'auto' : 'smooth' }); } catch (e) {}
      await new Promise((r) => setTimeout(r, 650));
      if (gone) return;
      await backlight(cards[i], { flashAt: 0.75, total: 2.6, veil: 0.65, onFlash: () => {
        const box = document.createElement('div');
        box.innerHTML = openCard(g, i);
        const c = /** @type {HTMLElement} */ (box.firstElementChild);
        const soft = motionOff();
        c.classList.add(soft ? 'gm-rv-soft' : 'gm-rv');
        const h3 = c.querySelector('h3');
        const name = h3 && h3.lastChild && h3.lastChild.nodeType === 3 ? h3.lastChild : null;
        if (name && !soft) {
          const full = name.textContent || '';
          name.textContent = '';
          let k = 0;
          const tick = setInterval(() => { k++; name.textContent = full.slice(0, k); if (k >= full.length) clearInterval(tick); }, 45);
        }
        cards[i].replaceWith(c);
        cards[i] = c;
        hidden.delete(i);
        bind(c, i);
        mark();
        setTimeout(() => c.classList.remove('gm-rv', 'gm-rv-soft'), 2600);
        revealed.add(g.id);
        saveRevealed(revealed);
      } });
    }
  }
  if (pending.length) setTimeout(() => { reveal().catch(() => {}); }, 500);
  // Light / dark theme switched while on the page: repaint the covers (the
  // mystery ones under their blur too).
  function theme() {
    shell.view.querySelectorAll('.gm-art[data-art]').forEach((a) => { a.innerHTML = art(a.getAttribute('data-art') || '', shell.theme.light); });
    shell.view.querySelectorAll('[data-mart]').forEach((a) => { a.innerHTML = art(a.getAttribute('data-mart') || '', shell.theme.light); });
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
  return { update() {}, draw() {}, input, theme, running: () => false, destroy() { gone = true; ace.remove(); } };
}
