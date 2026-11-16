// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The mini-games' Hall of Fame, client side (design note
// claude/CONCEPTION_HALL_OF_FAME.md, narmod 2026-11-16; server:
// server/hall-of-fame.js and the /__hof routes of proxy.js). Pilot: Ace Runner.
//
//   hofOn(g)                 is the Hall of Fame on (the admin's setting is
//                            not 'off', the default)? false offline
//   hofStart(g, m)           a run starts: a ticket signed by the server
//                            (null offline or off: the run is simply not ranked)
//   hofEnd(shell, o)         on the end screen (end.mjs), a line under the
//                            score: the rank, the name to type (3 letters or
//                            a free nickname), or « log in once with your
//                            pokerth.net account »; o = { g, m, s, run, day }
//   hofPanel(shell, o)       the boards on the title, as on an arcade
//                            machine; o = { g, name, modes: [{ id, label }],
//                            sel, onBack } — a tab per mode, the keys and the
//                            pad move between the tabs as on the end screen
//
// The name shown is the admin's setting (account / initials / free), given by
// every answer of the server. The account key (HOFTOK:, kept by pokerth.js in
// pth_hof_tok) is sent as « Authorization: Bearer ». A typed name is kept for
// the next time (pth_hof_name: { initials, free }).
// ═══════════════════════════════════════════════════════════════════

import { fmt } from './common.mjs';
import { ensureCss as endCss } from './end.mjs';

const TOK_KEY = 'pth_hof_tok', NAME_KEY = 'pth_hof_name';
const loadJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
/** The account key the proxy gave at an authenticated login: { t, n } or null. */
export function hofAccount() { const a = loadJ(TOK_KEY); return a && typeof a.t === 'string' && typeof a.n === 'string' ? a : null; }
/** The name typed last time for this setting ('' none). */
export function hofSavedName(names) { const o = loadJ(NAME_KEY); return o && typeof o[names] === 'string' ? o[names] : ''; }
function saveName(names, n) { try { const o = loadJ(NAME_KEY) || {}; o[names] = n; localStorage.setItem(NAME_KEY, JSON.stringify(o)); } catch (e) {} }

const CSS = `
#pth-game .gm-hof{margin:9px 0 0;padding:8px 10px;border-radius:12px;background:rgba(232,184,74,.1);border:1px solid rgba(232,184,74,.35);font:600 13px/1.35 'Inter',system-ui,sans-serif;color:#f1e9d4}
#pth-game .gm-hof:empty{display:none}
#pth-game .gm-hof b{color:#ffd27a}
#pth-game .gm-hof .gm-hform{display:flex;gap:6px;justify-content:center;align-items:center;margin-top:6px}
#pth-game .gm-hof input{width:9em;min-width:0;padding:7px 9px;border-radius:9px;border:1.5px solid rgba(255,255,255,.25);background:rgba(0,0,0,.35);color:#f5f0e3;font:700 15px 'Inconsolata',ui-monospace,monospace;text-align:center}
#pth-game .gm-hof input.gm-h3{width:4.2em;letter-spacing:.3em;text-transform:uppercase}
#pth-game .gm-hof button{appearance:none;border:0;border-radius:9px;padding:8px 12px;background:linear-gradient(180deg,#ffd27a,#d8a93e);color:#1b1408;font:800 13px 'Inter',system-ui,sans-serif;cursor:pointer}
#pth-game .gm-hof .gm-hedit{background:none;color:#cfd8d2;padding:0 0 0 6px;font:600 12px 'Inter',system-ui,sans-serif;text-decoration:underline}
#pth-game .gm-hof .gm-hbad{display:block;margin-top:4px;color:#ff8a80;font-size:12px}
#pth-game .pg-panel.gm-hofp .gm-endc{width:min(460px,100%)}
#pth-game .gm-htabs{display:flex;gap:5px;justify-content:center;margin:10px 0 8px;flex-wrap:wrap}
#pth-game .gm-htabs button{appearance:none;border:1.5px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 11px;background:rgba(255,255,255,.06);color:#e9e4d6;font:700 12px 'Inter',system-ui,sans-serif;cursor:pointer}
#pth-game .gm-htabs button.on{background:linear-gradient(180deg,#ffd27a,#d8a93e);color:#1b1408;border-color:transparent}
#pth-game .gm-hlist{margin:0;padding:0;list-style:none;font:700 14px/1.75 'Inconsolata',ui-monospace,monospace;text-align:left;max-height:min(52vh,470px);overflow:auto}
#pth-game .gm-hlist li{display:grid;grid-template-columns:2.4em 1fr auto 5.6em;gap:8px;padding:0 8px;border-radius:7px;color:#e9e4d6}
#pth-game .gm-hlist li:nth-child(-n+3){color:#ffd27a}
#pth-game .gm-hlist li.me{background:rgba(232,184,74,.2);outline:1px solid rgba(232,184,74,.6)}
#pth-game .gm-hlist li span:first-child{text-align:right;color:#9fb0a6}
#pth-game .gm-hlist li span:nth-child(2){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pth-game .gm-hlist li span:nth-child(3){text-align:right}
#pth-game .gm-hlist li small{text-align:right;font:600 11px/2.3 'Inter',system-ui,sans-serif;color:#9fb0a6}
#pth-game .gm-hnone{padding:18px 6px;font:600 13px 'Inter',system-ui,sans-serif;color:#cfd8d2}
`;
function ensureCss() {
  if (document.getElementById('pth-game-hof-css')) return;
  const st = document.createElement('style'); st.id = 'pth-game-hof-css'; st.textContent = CSS;
  document.head.appendChild(st);
}

async function call(path, body, auth) {
  const h = { 'Content-Type': 'application/json' };
  if (auth) h.Authorization = 'Bearer ' + auth;
  const r = await fetch(path, body ? { method: 'POST', headers: h, body: JSON.stringify(body) } : { cache: 'no-store' });
  return r.json();
}
/** A run starts: { ticket, names } from the server, or null (offline, refused). */
export async function hofStart(g, m) {
  try { const d = await call('/__hof/start', { g, m }); return d && d.ok ? { ticket: d.ticket, names: d.names } : null; } catch (e) { return null; }
}
/** Is the Hall of Fame on for this game (the admin's setting is not 'off')? */
export async function hofOn(g) { const v = await hofBoards(g); return !!(v && v.names && v.names !== 'off'); }
/** A game's boards: { names, day, top, topDay, boards } or null. */
export async function hofBoards(g) {
  try { const d = await call('/__hof?g=' + encodeURIComponent(g)); return d && d.ok ? d : null; } catch (e) { return null; }
}
/** The score of the board's last place when it is full (to get in, beat it), else 0. */
function cutOf(view, m, daily) {
  const b = (view && view.boards && view.boards[m]) || [], max = daily ? view.topDay : view.top;
  return b.length >= max ? b[b.length - 1].s : 0;
}

/**
 * The end screen's Hall of Fame line. o.run is the promise hofStart() gave
 * when the run began; o.daily: the mode is a daily challenge (its top 10).
 */
export function hofEnd(shell, o) {
  ensureCss();
  const { t, esc } = shell;
  const card = shell.root.querySelector('.pg-panel.gm-end .gm-erest');
  const btns = card && card.querySelector('.gm-ebtns');
  if (!card || !btns || !(o.s > 0)) return;
  const box = document.createElement('div');
  box.className = 'gm-hof';
  box.setAttribute('aria-live', 'polite');
  card.insertBefore(box, btns);
  box.addEventListener('pointerdown', (e) => e.stopPropagation());
  const alive = () => box.isConnected;
  const show = (html) => { if (alive()) box.innerHTML = html; };
  const send = async (run, name) => {
    const acct = run.names === 'account' ? hofAccount() : null;
    let d = null;
    try { d = await call('/__hof/score', { g: o.g, m: o.m, s: o.s, ticket: run.ticket, day: o.day, name }, acct ? acct.t : ''); } catch (e) { d = null; }
    return d;
  };
  const ranked = (d, editable) => {
    if (d.rank > 0) show('🏆 <b>' + esc(t('hofRank', { n: d.rank })) + '</b> · ' + esc(d.name) + (editable ? '<button type="button" class="gm-hedit">✎</button>' : ''));
    else { const cut = cutOf(d, o.m, o.daily); show(cut ? esc(t('hofOut', { s: fmt(cut + 1) })) : ''); }
    const ed = box.querySelector('.gm-hedit');
    if (ed) ed.addEventListener('click', (e) => { e.stopPropagation(); ask(d.names, d.name); });
  };
  let run = null;
  const ask = (names, prev, bad) => {
    const three = names === 'initials';
    show('🏆 ' + esc(t(three ? 'hofName3' : 'hofNameFree'))
      + '<div class="gm-hform"><input class="' + (three ? 'gm-h3' : '') + '" maxlength="' + (three ? 3 : 12) + '" autocomplete="off" autocapitalize="' + (three ? 'characters' : 'off') + '" spellcheck="false" enterkeyhint="done" aria-label="' + esc(t(three ? 'hofName3' : 'hofNameFree')) + '" value="' + esc(prev || '') + '"><button type="button">OK</button></div>'
      + (bad ? '<span class="gm-hbad">' + esc(t('hofBad')) + '</span>' : ''));
    const okb = box.querySelector('.gm-hform button'), inp = /** @type {HTMLInputElement|null} */ (box.querySelector('input'));
    if (!okb || !inp) return;
    if (three) inp.addEventListener('input', () => { const v = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3); if (v !== inp.value) inp.value = v; });
    try { inp.focus({ preventScroll: true }); } catch (e) {}
    // Enter in the field (the page's own key handlers may keep a form from submitting) or OK.
    let busy = false;
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submit(); } });
    okb.addEventListener('click', (e) => { e.stopPropagation(); submit(); });
    const submit = async () => {
      if (busy) return;
      const name = inp.value.trim();
      if (three ? name.length !== 3 : name.length < 2) return;
      busy = true;
      show('🏆 …');
      const d = await send(run || { names }, name);
      if (!d || !alive()) return show('');
      if (d.ok) { saveName(names, d.name); ranked(d, true); }
      else if (d.error === 'name' || d.error === 'banned') ask(names, name, true);
      else show('');
    };
  };
  (async () => {
    run = await o.run;
    if (!alive()) return;
    if (!run || !run.ticket) return show('');
    if (run.names === 'account') {
      const d = hofAccount() ? await send(run, '') : { ok: false, error: 'account' };
      if (d && d.ok) return ranked(d, false);
      if (!d || d.error !== 'account') return show('');
      // No key on this device (or an expired one): only worth saying when the score would get in.
      const v = await hofBoards(o.g), cut = v ? cutOf(v, o.m, o.daily) : 0;
      return show(!v || o.s > cut ? '🏆 ' + esc(t('hofLogin')) : '');
    }
    const saved = hofSavedName(run.names);
    if (saved) { const d = await send(run, saved); if (d && d.ok) return ranked(d, true); }
    // No name yet (or refused): ask for one only when the score gets in.
    const v = await hofBoards(o.g);
    if (!alive()) return;
    if (v && o.s <= cutOf(v, o.m, o.daily)) return show(esc(t('hofOut', { s: fmt(cutOf(v, o.m, o.daily) + 1) })));
    ask(run.names, saved, !!saved);
  })();
}

/** The boards on a game's title, as on an arcade machine: a tab per mode, « Game menu » back. */
export function hofPanel(shell, o) {
  ensureCss(); endCss();
  const { t, esc } = shell;
  let sel = Math.max(0, o.sel || 0), view = null, gone = false;
  const me = () => {
    if (!view) return '';
    if (view.names === 'account') { const a = hofAccount(); return a ? a.n : ''; }
    return hofSavedName(view.names);
  };
  const draw = (focusTab) => {
    if (gone) return;
    const m = o.modes[sel], rows = view ? view.boards[m.id] || [] : null, mine = String(me()).toLowerCase();
    const list = rows == null ? '<div class="gm-hnone">…</div>' : !rows.length ? '<div class="gm-hnone">' + esc(t('hofEmpty')) + '</div>'
      : '<ol class="gm-hlist">' + rows.map((r, i) => '<li class="' + (mine && String(r.n).toLowerCase() === mine ? 'me' : '') + '"><span>' + (i + 1) + '</span><span>' + esc(r.n) + '</span><span>' + esc(fmt(r.s)) + '</span><small>' + esc(new Date(r.ts).toLocaleDateString(document.documentElement.lang || undefined, { day: 'numeric', month: 'short' })) + '</small></li>').join('') + '</ol>';
    shell.panel('<div class="gm-endc" role="dialog" aria-label="' + esc(t('hofTitle')) + '"><h2>🏆 ' + esc(t('hofTitle')) + '</h2><div class="gm-esub">' + esc(o.name || '') + '</div>'
      + '<div class="gm-htabs">' + o.modes.map((x, i) => '<button type="button" data-e="tab" data-h="' + i + '" class="' + (i === sel ? 'on' : '') + '">' + esc(x.label) + '</button>').join('') + '</div>'
      + list + '<div class="gm-ebtns"><button type="button" class="gm-eB" data-e="menu"><kbd>B</kbd>' + esc(t('gmGameMenu')) + '</button></div></div>');
    const panel = /** @type {HTMLElement|null} */ (shell.root.querySelector('.pg-panel'));
    if (!panel) return;
    // As the end screen: the whole game area, Escape and the pad's B go back (shell.endBack).
    panel.classList.add('gm-end', 'gm-eout', 'gm-hofp');
    shell.root.insertBefore(panel, shell.root.firstChild);
    shell.endBack = back;
    panel.querySelectorAll('[data-h]').forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => { e.stopPropagation(); sel = +(b.getAttribute('data-h') || 0); draw(true); });
    });
    const bk = /** @type {HTMLElement|null} */ (panel.querySelector('[data-e="menu"]'));
    if (bk) { bk.addEventListener('pointerdown', (e) => e.stopPropagation()); bk.addEventListener('click', (e) => { e.stopPropagation(); back(); }); }
    const f = /** @type {HTMLElement|null} */ (focusTab ? panel.querySelector('[data-h="' + sel + '"]') : bk);
    try { if (f) f.focus({ preventScroll: true }); } catch (e) {}
  };
  function back() { if (gone) return; gone = true; shell.endBack = null; o.onBack(); }
  draw(false);
  hofBoards(o.g).then((v) => { view = v || { names: '', boards: {} }; if (!gone) draw(false); });
}
