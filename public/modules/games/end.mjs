// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The mini-games' end screen — one template for every game (web.67,
// narmod: « the end screens are not great: no button to play again or to
// go back to the game's menu, the scores are not pretty and you don't see
// the levels you reached »). The partner of title.mjs.
//
//   endScreen(shell, {
//     title, sub,   the heading and a line under it (plain text)
//     cards,        the hand shown (card numbers): dealt face down, then
//                   turned one by one; [] or none for no hand
//     dim,          cards of `cards` not in the best five (shown dimmed)
//     hand,         the hand's line, shown once the cards are turned
//     hero,         HTML instead of the cards (a game without a hand)
//     score, prev,  the score and the record before this game: a new record
//                   gets the « new record » ribbon (when there was one to beat);
//                   prev null: no record line (a game between two players)
//     unit,         a word after the score, optional (« credits »…)
//     calc,         [[label, value]]: how the score was made, as chips
//     levels,       { title, right, html }: what was reached (a game's own
//                   HTML: the stages, the floors…), optional
//     stats,        [[value, label]]: up to three tiles, optional
//     onAgain,      « Play again » (A, Space / Enter)
//     onMenu,       « Game menu »: the game's title screen (B, Escape)
//     btnA, btnB,   other words on the two buttons (the rebuy: « rebuy »,
//                   « no thanks »), optional
//     instant,      the cards shown at once (no showdown), optional
//     note,         a line over the chips (the rebuy's question), optional
//     count,        seconds: a ring that empties, then onMenu by itself
//     foot,         a small line under the buttons (the keys), hidden on
//                   touch screens and with a pad, optional
//     keys,         ↑/↓ left to the game (the rebuy's « ↓ no thanks »)
//   })
//
// The panel gets the class gm-end: the shell reads the pad as on a menu
// (A plays again, B goes to the game's menu) and Escape calls onMenu.
// A new game: build these fields from its result — that is all.
// ═══════════════════════════════════════════════════════════════════

import { cardHtml, fmt } from './common.mjs';

const CSS = `
#pth-game .pg-panel.gm-end{background:radial-gradient(ellipse at center,rgba(6,9,14,.55),rgba(6,9,14,.82));pointer-events:auto;overflow:auto}
#pth-game .pg-panel.gm-end>div{max-width:none;width:100%;align-items:center}
#pth-game .gm-endc{width:min(420px,100%);box-sizing:border-box;margin:auto;background:linear-gradient(180deg,rgba(24,30,40,.97),rgba(14,18,25,.98));border:1.5px solid rgba(232,184,74,.55);border-radius:20px;padding:14px 14px 12px;color:#f1e9d4;box-shadow:0 12px 40px rgba(0,0,0,.55);text-align:center}
#pth-game .gm-endc h2{margin:0;font:700 clamp(20px,5.2vw,26px)/1.1 'Cinzel',Georgia,serif;font-variant:small-caps;letter-spacing:.04em;color:#f5f0e3}
#pth-game.pg-light .pg-panel .gm-endc h2,#pth-game .pg-panel .gm-endc h2{color:#f5f0e3}
#pth-game .gm-esub{margin-top:3px;font:600 11.5px 'Inter',system-ui,sans-serif;color:#9fb0a6;letter-spacing:.06em;text-transform:uppercase}
#pth-game .gm-ecards{display:flex;justify-content:center;gap:4px;margin:10px 0 2px}
#pth-game .gm-ecards .pk{margin:0}
#pth-game .gm-ecards .gm-edim{opacity:.38}
#pth-game .gm-ehand{min-height:16px;font:700 13px 'Inter',system-ui,sans-serif;color:#e8b84a}
#pth-game .gm-ehero{margin:10px 0 2px}
#pth-game .gm-erest{transition:opacity .35s}
#pth-game .gm-erest.gm-ewait{opacity:0}
#pth-game .gm-escore{margin:8px 0 0;font:800 clamp(34px,10vw,46px)/1 'Inconsolata',ui-monospace,monospace;color:#ffd27a;text-shadow:0 0 18px rgba(232,184,74,.35)}
#pth-game .gm-escore small{margin-left:6px;font:700 13px 'Inter',system-ui,sans-serif;color:#cfd8d2;text-shadow:none}
#pth-game .gm-enew{display:inline-block;margin:6px 0 0;padding:3px 12px;border-radius:999px;background:linear-gradient(90deg,#c2303a,#e8573f);color:#fff;font:800 11px 'Inter',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
#pth-game .gm-ecount{position:relative;width:46px;height:46px;margin:8px auto 2px}
#pth-game .gm-ecount svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
#pth-game .gm-ecount circle{fill:none;stroke-width:4;stroke:rgba(255,255,255,.14)}
#pth-game .gm-ecount .gm-ering{stroke:#d8b25a;stroke-linecap:round;stroke-dasharray:119.4;animation:gmERing var(--s) linear forwards}
#pth-game .gm-ecount b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 18px 'Inter',system-ui,sans-serif;color:#f1e9d4}
@keyframes gmERing{to{stroke-dashoffset:119.4}}
#pth-game .gm-enote{margin:6px 0 2px;font:600 14px 'Inter',system-ui,sans-serif;color:#f1e9d4}
#pth-game .gm-efoot{margin-top:8px;font:500 11px 'Inter',system-ui,sans-serif;color:#9fb0a6}
body.has-gamepad #pth-game .gm-efoot,.pth-touch #pth-game .gm-efoot{display:none}
@media (pointer:coarse){#pth-game .gm-efoot{display:none}}
@media (prefers-reduced-motion:reduce){#pth-game .gm-ecount .gm-ering{animation:none}}
#pth-game .gm-erec{margin-top:4px;font:600 12px 'Inter',system-ui,sans-serif;color:#9fb0a6}
#pth-game .gm-ecalc{display:flex;flex-wrap:wrap;justify-content:center;gap:5px;margin:9px 0 0}
#pth-game .gm-ecalc span{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:3px 9px;font:600 11.5px 'Inter',system-ui,sans-serif;color:#e9e4d6}
#pth-game .gm-ecalc b{color:#ffd27a}
#pth-game .gm-elv{margin:10px 0 0;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.08);text-align:left}
#pth-game .gm-elv .gm-elt{display:flex;justify-content:space-between;gap:8px;font:700 10.5px 'Inter',system-ui,sans-serif;letter-spacing:.1em;color:#9fb0a6;text-transform:uppercase;margin-bottom:6px}
#pth-game .gm-elv .gm-elt b{color:#f1e9d4;letter-spacing:0;text-transform:none}
#pth-game .gm-esteps{display:flex;gap:4px}
#pth-game .gm-esteps i{flex:1;min-width:0;height:22px;border-radius:5px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font:700 10px 'Inter',system-ui,sans-serif;color:#6d7a73;font-style:normal;overflow:hidden;white-space:nowrap}
#pth-game .gm-esteps i.ok{background:linear-gradient(180deg,#e8b84a,#b8862a);color:#1b1408}
#pth-game .gm-esteps i.hard{background:linear-gradient(180deg,#e8573f,#a8312a);color:#fff}
#pth-game .gm-esteps i.cur{outline:2px solid #ffd27a;outline-offset:1px}
#pth-game .gm-ebars{display:flex;align-items:flex-end;gap:2px;height:44px}
#pth-game .gm-ebars i{flex:1;min-width:2px;border-radius:2px 2px 0 0;background:linear-gradient(180deg,#fbf7ee,#cfc4ad);font-style:normal}
#pth-game .gm-ebars i.gold{background:linear-gradient(180deg,#ffd27a,#b8862a)}
#pth-game .gm-ebars i.no{background:rgba(255,255,255,.12)}
#pth-game .gm-elist{display:flex;flex-direction:column;gap:1px}
#pth-game .gm-elist div{display:flex;justify-content:space-between;gap:8px;font:600 12px/1.6 'Inter',system-ui,sans-serif;color:#f1e9d4}
#pth-game .gm-elist span{color:#ff5d7a;letter-spacing:1px;white-space:nowrap}
#pth-game .gm-elist span.no{color:#5d666e}
#pth-game .gm-elist span.gold{color:#e8b84a}
#pth-game .gm-estats{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:6px;margin-top:9px}
#pth-game .gm-estats div{background:rgba(255,255,255,.05);border-radius:10px;padding:6px 4px;min-width:0}
#pth-game .gm-estats b{display:block;font:800 17px 'Inconsolata',ui-monospace,monospace;color:#f5f0e3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pth-game .gm-estats small{display:block;font:600 9.5px 'Inter',system-ui,sans-serif;color:#9fb0a6;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pth-game .gm-ebtns{display:flex;gap:8px;margin-top:12px}
#pth-game .gm-ebtns button{flex:1;min-width:0;appearance:none;border:0;border-radius:12px;padding:11px 8px;font:800 14px 'Inter',system-ui,sans-serif;cursor:pointer}
#pth-game .gm-ebtns .gm-eA{background:linear-gradient(180deg,#ffd27a,#d8a93e);color:#1b1408;box-shadow:0 3px 0 #8a6a1f}
#pth-game .gm-ebtns .gm-eB{background:rgba(255,255,255,.08);color:#f1e9d4;border:1.5px solid rgba(255,255,255,.18)}
#pth-game .gm-ebtns button:focus-visible{outline:3px solid #ffd27a;outline-offset:2px}
#pth-game .gm-ebtns kbd{display:none;margin-right:6px;min-width:16px;padding:0 4px;border-radius:5px;background:rgba(0,0,0,.2);font:800 10px 'Inter',system-ui,sans-serif;line-height:16px}
body.has-gamepad #pth-game .gm-ebtns kbd{display:inline-block}
@media (max-height:560px){#pth-game .gm-endc{padding:10px 12px 10px}#pth-game .gm-escore{font-size:32px}#pth-game .gm-elv{margin-top:7px}}
`;

function ensureCss() {
  if (document.getElementById('pth-game-end-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-end-css'; st.textContent = CSS;
  document.head.appendChild(st);
}

/** The steps of a course: [{ label, cls }] → a row of tiles (cls: ok, hard, cur, '' not reached). */
export function stepsHtml(esc, steps) {
  return '<div class="gm-esteps">' + steps.map((s) => '<i class="' + (s.cls || '') + '">' + esc(s.label || '') + '</i>').join('') + '</div>';
}
/** Bars, growing: [{ h: 0…1, cls }] (cls: gold, no). */
export function barsHtml(bars) {
  return '<div class="gm-ebars">' + bars.map((b) => '<i class="' + (b.cls || '') + '" style="height:' + Math.round(Math.max(0.06, Math.min(1, b.h)) * 100) + '%"></i>').join('') + '</div>';
}
/** A list of lines with a mark on the right: [[text, mark, ok]] (ok false: dimmed; 'gold': gold). */
export function listHtml(esc, rows) {
  return '<div class="gm-elist">' + rows.map((r) => '<div>' + esc(r[0]) + '<span class="' + (r[2] === false ? 'no' : typeof r[2] === 'string' ? r[2] : '') + '">' + esc(r[1]) + '</span></div>').join('') + '</div>';
}

export function endScreen(shell, o) {
  ensureCss();
  const { esc, t } = shell;
  const cards = o.cards || [], dim = new Set(o.dim || []);
  const instant = !cards.length || shell.reduced || !!o.instant;
  const isNew = o.score > (o.prev || 0) && (o.prev || 0) > 0;
  const best = Math.max(o.score || 0, o.prev || 0);
  const calc = (o.calc || []).filter(Boolean).map((c) => '<span>' + esc(c[0]) + ' <b>' + esc(String(c[1])) + '</b></span>').join('');
  const lv = o.levels ? '<div class="gm-elv"><div class="gm-elt">' + esc(o.levels.title || '') + '<b>' + esc(o.levels.right || '') + '</b></div>' + (o.levels.html || '') + '</div>' : '';
  const stats = (o.stats || []).filter(Boolean).slice(0, 3).map((s) => '<div><b>' + esc(String(s[0])) + '</b><small>' + esc(s[1]) + '</small></div>').join('');
  const hero = cards.length
    ? '<div class="gm-ecards">' + cards.map((c, i) => '<span class="gm-ec' + (dim.has(c) ? ' gm-edim' : '') + '" data-i="' + i + '"><div class="pk lg back"></div></span>').join('') + '</div><div class="gm-ehand">&nbsp;</div>'
    : o.hero ? '<div class="gm-ehero">' + o.hero + '</div>' : '';
  shell.panel('<div class="gm-endc" role="dialog" aria-label="' + esc(o.title || '') + '"><h2>' + esc(o.title || '') + '</h2>'
    + (o.sub ? '<div class="gm-esub">' + esc(o.sub) + '</div>' : '') + hero
    + '<div class="gm-erest' + (instant ? '' : ' gm-ewait') + '">'
    + '<div class="gm-escore"><span class="gm-esv">' + esc(fmt(instant ? o.score || 0 : 0)) + '</span>' + (o.unit ? '<small>' + esc(o.unit) + '</small>' : '') + '</div>'
    + (isNew ? '<div class="gm-enew">' + esc(t('arNewRecord').replace(/\s*!$/, '')) + '</div>' : o.prev == null || !best ? '' : '<div class="gm-erec">' + esc(t('arRecord', { n: fmt(best) })) + '</div>')
    + (o.count ? '<div class="gm-ecount" style="--s:' + o.count + 's"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/><circle class="gm-ering" cx="22" cy="22" r="19"/></svg><b>' + o.count + '</b></div>' : '')
    + (o.note ? '<div class="gm-enote">' + esc(o.note) + '</div>' : '')
    + (calc ? '<div class="gm-ecalc">' + calc + '</div>' : '') + lv + (stats ? '<div class="gm-estats">' + stats + '</div>' : '')
    + '<div class="gm-ebtns"><button type="button" class="gm-eA" data-e="again"><kbd>A</kbd>' + esc(o.btnA || t('gmReplay')) + '</button>'
    + '<button type="button" class="gm-eB" data-e="menu"><kbd>B</kbd>' + esc(o.btnB || t('gmGameMenu')) + '</button></div>'
    + (o.foot ? '<div class="gm-efoot">' + esc(o.foot) + '</div>' : '') + '</div></div>');
  const panel = /** @type {HTMLElement|null} */ (shell.root.querySelector('.pg-panel'));
  if (!panel) return;
  panel.classList.add('gm-end');
  panel.classList.toggle('gm-ekeys', !!o.keys);
  shell.endBack = o.onMenu || null;
  let done = false;
  const go = (what) => { if (done) return; done = true; shell.endBack = null; (what === 'menu' ? o.onMenu : o.onAgain)(); };
  panel.querySelectorAll('[data-e]').forEach((b) => {
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    b.addEventListener('click', (e) => { e.stopPropagation(); go(b.getAttribute('data-e')); });
  });
  // Showdown: the cards turn one by one, then the rest shows and the score counts up.
  const rest = /** @type {HTMLElement} */ (panel.querySelector('.gm-erest')), sv = panel.querySelector('.gm-esv');
  const focusA = () => { try { /** @type {HTMLElement} */ (panel.querySelector('.gm-eA')).focus({ preventScroll: true }); } catch (e) {} };
  const timers = [];
  shell.endTimers = timers;
  const later = (f, ms) => timers.push(setTimeout(() => { if (shell.endTimers === timers) f(); }, ms));
  const count = () => {
    const to = o.score || 0, t0 = performance.now(), dur = Math.min(900, 300 + to / 20);
    const step = () => {
      if (shell.endTimers !== timers || !sv) return;
      const p = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      sv.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    };
    step();
  };
  // A countdown (the rebuy): a ring that empties, then « B » by itself.
  if (o.count) {
    const b = panel.querySelector('.gm-ecount b');
    for (let k = 1; k <= o.count; k++) later(() => { if (b) b.textContent = String(o.count - k); if (k === o.count) go('menu'); else if (o.count - k <= 3) shell.sound('notifyTick'); }, k * 1000);
  }
  const finish = () => { rest.classList.remove('gm-ewait'); count(); focusA(); if (isNew) shell.sound('notifyBigWin'); };
  if (instant) {
    panel.querySelectorAll('.gm-ec').forEach((s, i) => { s.innerHTML = cardHtml(cards[i], 'lg'); });
    const h = panel.querySelector('.gm-ehand'); if (h) h.textContent = o.hand || '';
    focusA(); if (isNew) shell.sound('notifyBigWin');
    return;
  }
  cards.forEach((c, i) => later(() => {
    const s = panel.querySelector('.gm-ec[data-i="' + i + '"]'); if (s) s.innerHTML = cardHtml(c, 'lg');
    shell.sound('notifyCard');
    if (i === cards.length - 1) { const h = panel.querySelector('.gm-ehand'); if (h) h.textContent = o.hand || ''; later(finish, 220); }
  }, 450 + i * 260));
}
