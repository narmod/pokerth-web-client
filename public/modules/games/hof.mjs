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
//
// Taking part is the player's choice (web.97, narmod: « some people will not
// want to take part, be more explicit »): nothing is sent without a yes.
// pth_hof_opt = 'ask' (default: when a score gets in, « N° 7! Enter it? Your
// name, score and date are visible to everyone » — Enter / No thanks, and
// « remember my choice »), 'yes' (sent by itself) or 'no' (nothing asked, nothing
// sent); also in Advanced options › Community (synced with the account). Every
// score carries a random key of this browser (pth_hof_dev, kept hashed by the
// server), so « Remove my scores » on the boards takes them all back — and the
// next score that gets in asks again, as the first time (web.103); a player who
// said « never » finds « Take part again » on the boards.
// ═══════════════════════════════════════════════════════════════════

import { fmt } from './common.mjs';
import { ensureCss as endCss } from './end.mjs';

const TOK_KEY = 'pth_hof_tok', NAME_KEY = 'pth_hof_name', OPT_KEY = 'pth_hof_opt', DEV_KEY = 'pth_hof_dev';
const loadJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
/** The account key the proxy gave at an authenticated login: { t, n } or null. */
export function hofAccount() { const a = loadJ(TOK_KEY); return a && typeof a.t === 'string' && typeof a.n === 'string' ? a : null; }
/** The name typed last time for this setting ('' none). */
export function hofSavedName(names) { const o = loadJ(NAME_KEY); return o && typeof o[names] === 'string' ? o[names] : ''; }
function saveName(names, n) { try { const o = loadJ(NAME_KEY) || {}; o[names] = n; localStorage.setItem(NAME_KEY, JSON.stringify(o)); } catch (e) {} }
/** Taking part: 'ask' (default), 'yes' or 'no' (Advanced options › Community too). */
export function hofOpt() { try { const v = localStorage.getItem(OPT_KEY); return v === 'yes' || v === 'no' ? v : 'ask'; } catch (e) { return 'ask'; } }
export function setHofOpt(v) {
  try { localStorage.setItem(OPT_KEY, v === 'yes' || v === 'no' ? v : 'ask'); } catch (e) {}
  try { const el = /** @type {HTMLSelectElement|null} */ (document.getElementById('adv-hofopt')); if (el) el.value = hofOpt(); } catch (e) {}
  try { if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark('hof_opt'); } catch (e) {}
}
/** This browser's key, made at its first score (so it can take its scores back). */
function devKey(make) {
  try {
    let k = localStorage.getItem(DEV_KEY) || '';
    if (!k && make) {
      const a = new Uint8Array(16); crypto.getRandomValues(a);
      k = Array.from(a, (x) => x.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(DEV_KEY, k);
    }
    return k;
  } catch (e) { return ''; }
}
/** Takes back every score of this browser (and of the account): { removed } or null. */
export async function hofForget() {
  const acct = hofAccount();
  try { const d = await call('/__hof/forget', { dev: devKey(false) }, acct ? acct.t : ''); return d && d.ok ? d : null; } catch (e) { return null; }
}

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
#pth-game .gm-hof .gm-hpub,#pth-game .gm-hinfo{display:block;margin-top:4px;font:500 11.5px/1.35 'Inter',system-ui,sans-serif;color:#cfd8d2}
#pth-game .gm-hof .gm-hno{background:rgba(255,255,255,.1);color:#f1e9d4;border:1.5px solid rgba(255,255,255,.2)}
#pth-game .gm-hof label{display:flex;gap:6px;justify-content:center;align-items:center;margin-top:6px;font:600 12px 'Inter',system-ui,sans-serif;color:#cfd8d2;cursor:pointer}
#pth-game .gm-hinfo{margin:0 4px 8px;text-align:center}
#pth-game .gm-hforget{appearance:none;margin-top:8px;border:0;background:none;color:#ff9b8f;font:600 12px 'Inter',system-ui,sans-serif;text-decoration:underline;cursor:pointer}
#pth-game .gm-hrejoin{appearance:none;display:block;margin:8px auto 0;border:0;border-radius:9px;padding:7px 12px;background:linear-gradient(180deg,#ffd27a,#d8a93e);color:#1b1408;font:800 12.5px 'Inter',system-ui,sans-serif;cursor:pointer}
#pth-game .gm-hmsg{margin-top:6px;font:600 12px 'Inter',system-ui,sans-serif;color:#9fe3b0}
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

/**
 * Keeps a field above the phone's keyboard (web.103, narmod: « the keyboard
 * comes over the field I type my name in »): the game area is fixed, so the
 * browser does not scroll it into view. While the field has the focus, the card
 * moves up (or down) by what the visual viewport hides of it, then back.
 */
const KV = new WeakSet();
function keepVisible(inp) {
  const vv = window.visualViewport;
  const card = /** @type {HTMLElement|null} */ (inp.closest('.gm-endc'));
  if (!vv || !card || KV.has(inp)) return;
  KV.add(inp);
  let shift = 0, raf = 0;
  const set = (v) => { shift = v; card.style.transform = v ? 'translateY(' + (-v) + 'px)' : ''; };
  const upd = () => {
    raf = 0;
    if (!inp.isConnected || document.activeElement !== inp) return off();
    const r = inp.getBoundingClientRect(), z = parseFloat(getComputedStyle(card).zoom || '1') || 1;
    const top = vv.offsetTop + 8, bot = vv.offsetTop + vv.height - 12;
    // The whole question (its buttons, « remember my choice ») when it fits, else the field.
    const box = inp.closest('.gm-hof'), rb = box ? box.getBoundingClientRect() : r;
    const low = rb.bottom - r.top <= bot - top ? rb.bottom : r.bottom;
    let d = 0;
    if (low > bot) d = low - bot;
    else if (r.top < top) d = r.top - top;
    if (Math.abs(d) > 1) set(Math.max(0, shift + d / z));
  };
  const later = () => { if (!raf) raf = requestAnimationFrame(upd); };
  const timers = [later, later, later].map((f, i) => setTimeout(f, 120 + i * 220));
  function off() {
    vv.removeEventListener('resize', later); vv.removeEventListener('scroll', later);
    inp.removeEventListener('blur', blur); timers.forEach(clearTimeout); set(0); KV.delete(inp);
  }
  function blur() { setTimeout(() => { if (document.activeElement !== inp) off(); }, 60); }
  vv.addEventListener('resize', later); vv.addEventListener('scroll', later);
  inp.addEventListener('blur', blur);
  later();
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
 * Nothing is sent without the player's yes (hofOpt).
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
  let run = null;
  const send = async (name) => {
    const acct = run.names === 'account' ? hofAccount() : null;
    try { return await call('/__hof/score', { g: o.g, m: o.m, s: o.s, ticket: run.ticket, day: o.day, name, dev: devKey(true) }, acct ? acct.t : ''); } catch (e) { return null; }
  };
  const ranked = (d, editable) => {
    if (d.rank > 0) show('🏆 <b>' + esc(t('hofRank', { n: d.rank })) + '</b> · ' + esc(d.name) + (editable ? '<button type="button" class="gm-hedit">✎</button>' : ''));
    else { const cut = cutOf(d, o.m, o.daily); show(cut ? esc(t('hofOut', { s: fmt(cut + 1) })) : ''); }
    const ed = box.querySelector('.gm-hedit');
    if (ed) ed.addEventListener('click', (e) => { e.stopPropagation(); ask(d.name, false, 0); });
  };
  /** Sends with this name (account: none) and shows the rank; a refused name asks again. */
  const enter = async (name) => {
    show('🏆 …');
    const d = await send(name);
    if (!d || !alive()) return show('');
    if (d.ok) { if (run.names !== 'account') saveName(run.names, d.name); return ranked(d, run.names !== 'account'); }
    if (d.error === 'name' || d.error === 'banned') return ask(name, true, 0);
    show('');
  };
  /**
   * The question (rank > 0: « N° 7! Enter it? », with what everyone will see),
   * or the name alone (rank 0: changing a name already entered). Initials and free
   * nicknames type their name in it; « remember my choice » sets hofOpt.
   */
  const ask = (prev, bad, rank) => {
    const acct = run.names === 'account', three = run.names === 'initials';
    const field = acct ? '' : '<input class="' + (three ? 'gm-h3' : '') + '" maxlength="' + (three ? 3 : 12) + '" autocomplete="off" autocapitalize="' + (three ? 'characters' : 'off') + '" spellcheck="false" enterkeyhint="done" placeholder="' + esc(t(three ? 'hofName3' : 'hofNameFree')) + '" aria-label="' + esc(t(three ? 'hofName3' : 'hofNameFree')) + '" value="' + esc(prev || '') + '">';
    show('🏆 ' + (rank ? '<b>' + esc(t('hofAsk', { r: rank })) + '</b>' : esc(t(three ? 'hofName3' : 'hofNameFree')))
      + (rank ? '<span class="gm-hpub">' + esc(t('hofPublic')) + (acct ? ' (' + esc((hofAccount() || { n: '' }).n) + ')' : '') + '</span>' : '')
      + '<div class="gm-hform">' + field + '<button type="button" class="gm-hyes">' + esc(rank ? t('hofYes') : 'OK') + '</button>'
      + (rank ? '<button type="button" class="gm-hno">' + esc(t('hofNo')) + '</button>' : '') + '</div>'
      + (rank ? '<label><input type="checkbox" class="gm-hrem"> ' + esc(t('hofRemember')) + '</label>' : '')
      + (bad ? '<span class="gm-hbad">' + esc(t('hofBad')) + '</span>' : ''));
    const yes = box.querySelector('.gm-hyes'), no = box.querySelector('.gm-hno'), inp = /** @type {HTMLInputElement|null} */ (box.querySelector('.gm-hform input'));
    const rem = /** @type {HTMLInputElement|null} */ (box.querySelector('.gm-hrem'));
    if (!yes) return;
    if (inp) inp.addEventListener('focus', () => keepVisible(inp));
    if (inp && three) inp.addEventListener('input', () => { const v = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3); if (v !== inp.value) inp.value = v; });
    let busy = false;
    const go = () => {
      if (busy) return;
      const name = inp ? inp.value.trim() : '';
      if (inp && (three ? name.length !== 3 : name.length < 2)) { try { inp.focus({ preventScroll: true }); } catch (e) {} return; }
      busy = true;
      if (rem && rem.checked) setHofOpt('yes');
      enter(name);
    };
    // Enter in the field (the page's own key handlers may keep a form from submitting) or the button.
    if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); go(); } });
    yes.addEventListener('click', (e) => { e.stopPropagation(); go(); });
    if (no) no.addEventListener('click', (e) => { e.stopPropagation(); if (rem && rem.checked) setHofOpt('no'); show(''); });
    if (inp && !rank) { try { inp.focus({ preventScroll: true }); } catch (e) {} }
  };
  (async () => {
    run = await o.run;
    if (!alive() || !run || !run.ticket) return show('');
    const opt = hofOpt();
    if (opt === 'no') return show('');
    // Does the score get in? Nothing is sent to find out: the board is read.
    const v = await hofBoards(o.g);
    if (!alive() || !v || v.names === 'off') return show('');
    const rows = (v.boards && v.boards[o.m]) || [], max = o.daily ? v.topDay : v.top;
    const rank = rows.filter((r) => r.s >= o.s).length + 1;
    if (rank > max) { const cut = cutOf(v, o.m, o.daily); return show(cut ? esc(t('hofOut', { s: fmt(cut + 1) })) : ''); }
    if (run.names === 'account' && !hofAccount()) return show('🏆 ' + esc(t('hofLogin')));
    const saved = run.names === 'account' ? '' : hofSavedName(run.names);
    if (opt === 'yes' && (run.names === 'account' || saved)) return enter(saved);
    ask(saved, false, rank);
  })();
}

/** The boards on a game's title, as on an arcade machine: a tab per mode, « Game menu » back. */
export function hofPanel(shell, o) {
  ensureCss(); endCss();
  const { t, esc } = shell;
  let sel = Math.max(0, o.sel || 0), view = null, gone = false, msg = '';
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
      + '<p class="gm-hinfo">ⓘ ' + esc(t('hofInfo', { w: t('advTitle') + ' › ' + t('advSecCommunity') })) + '</p>'
      + list + (msg ? '<div class="gm-hmsg">' + esc(msg) + '</div>' : '')
      + (view && view.names && view.names !== 'off' && hofOpt() === 'no' ? '<button type="button" class="gm-hrejoin" data-e="rejoin">' + esc(t('hofRejoin')) + '</button>' : '')
      + (devKey(false) || hofAccount() ? '<button type="button" class="gm-hforget" data-e="forget">' + esc(t('hofForget')) + '</button>' : '')
      + '<div class="gm-ebtns"><button type="button" class="gm-eB" data-e="menu"><kbd>B</kbd>' + esc(t('gmGameMenu')) + '</button></div></div>');
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
    const fg = panel.querySelector('[data-e="forget"]');
    if (fg) {
      fg.addEventListener('pointerdown', (e) => e.stopPropagation());
      fg.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!window.confirm(t('hofForgetQ'))) return;
        const d = await hofForget();
        // web.103 (narmod: « once out, I can't get back in but through the options »): asked again as the first time.
        setHofOpt('ask');
        msg = t('hofForgot', { n: d ? d.removed : 0 });
        view = (await hofBoards(o.g)) || view;
        draw(false);
      });
    }
    const rj = panel.querySelector('[data-e="rejoin"]');
    if (rj) {
      rj.addEventListener('pointerdown', (e) => e.stopPropagation());
      rj.addEventListener('click', (e) => { e.stopPropagation(); setHofOpt('ask'); msg = ''; draw(false); });
    }
    const bk = /** @type {HTMLElement|null} */ (panel.querySelector('[data-e="menu"]'));
    if (bk) { bk.addEventListener('pointerdown', (e) => e.stopPropagation()); bk.addEventListener('click', (e) => { e.stopPropagation(); back(); }); }
    const f = /** @type {HTMLElement|null} */ (focusTab ? panel.querySelector('[data-h="' + sel + '"]') : bk);
    try { if (f) f.focus({ preventScroll: true }); } catch (e) {}
  };
  function back() { if (gone) return; gone = true; shell.endBack = null; o.onBack(); }
  draw(false);
  hofBoards(o.g).then((v) => { view = v || { names: '', boards: {} }; if (!gone) draw(false); });
}
