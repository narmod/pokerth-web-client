// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The mini-games' Hall of Fame in the Ranking window (web.105, narmod: « a new
// tab next to Trophies, Mini-games, with the Hall of Fame in it »). The same
// boards as the 🏆 on each game's title (hof.mjs), every game in one place:
// a game to pick, a tab per ranked mode, the top 20 (the top 10 of the day for
// a daily challenge). Read only: entering a score and « Remove my scores »
// stay at the end of a run and on the game's own boards.
//
//   hofTabOn()            is the Hall of Fame on (the admin's setting is not
//                         'off')? false offline; the answer is kept for the session
//   renderHofTab(el)      draws the tab in `el` (the game chosen last time,
//                         pth_hof_view: { g, m })
// ═══════════════════════════════════════════════════════════════════

import { GAMES, gameName, allUnlocked } from './index.mjs';
import { hofBoards, hofAccount, hofSavedName } from './hof.mjs';
import { fmt } from './common.mjs';

const tr = (k, p) => { try { const s = typeof window.t === 'function' ? window.t(k, p) : k; return s && s !== k ? s : k; } catch (e) { return k; } };
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c));

const VP = [['jacks', 'vpVarJacks'], ['bonus', 'vpVarBonus'], ['deuces', 'vpVarDeuces'], ['joker', 'vpVarJoker']];
/** The ranked modes of each game, as on their own boards (server/hall-of-fame.js GAMES). */
export const HOF_VIEW = {
  'ace-runner': [['free', 'adModeFree'], ['daily', 'psDaily'], ['time', 'adModeTime']],
  tapis: [['classic', 'tpClassic'], ['folie', 'tpFolie'], ['daily', 'psDaily'], ['zen', 'hcModeZen']],
  'ace-dash': [['free', 'adModeFree'], ['daily', 'psDaily'], ['time', 'adModeTime']],
  'poker-run': [['free', 'adModeFree'], ['queen', 'prQueen'], ['daily', 'psDaily']],
  videopoker: VP.concat(VP.map(([id, k]) => ['day-' + id, k, 'psDaily'])),
  whowins: [['tv', 'wwModeTv'], ['endless', 'wwModeEndless'], ['daily', 'wwModeDaily']],
  hilo: [['hand', 'hlModeHand'], ['tourney', 'hlModeTourney'], ['both', 'hlModeBoth']],
  solitaire: [['daily', 'psDaily'], ['free', 'psFree']],
  bluff: [['free', 'psFree'], ['daily', 'psDaily'], ['tourney', 'hlModeTourney']],
  house: [['free', 'psFree'], ['daily', 'psDaily'], ['zen', 'hcModeZen']],
};
/** The games shown, in the arcade's order; the hidden House of Cards once it is found. */
export const hofGames = () => GAMES.filter((g) => HOF_VIEW[g.id] && (!g.bonus || allUnlocked()));

let on = null;
/** Is the Hall of Fame on? (one read of a board, kept for the session once it is true). */
export async function hofTabOn() {
  if (on) return true;
  const v = await hofBoards('ace-runner');
  on = !!(v && v.names && v.names !== 'off');
  return on;
}

const VIEW_KEY = 'pth_hof_view';
const CSS = `
.hofv-pick{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}
.hofv-pick select{flex:1 1 12em;min-width:0}
.hofv-modes{display:flex;gap:5px;flex-wrap:wrap;margin:0 0 8px}
.hofv-modes button{appearance:none;border:1px solid var(--border);border-radius:999px;padding:4px 10px;background:var(--inset);color:var(--text);font:600 var(--fs-xs,12px) var(--ff-mono,monospace);cursor:pointer}
.hofv-modes button.on{background:rgba(var(--sel-rgb,var(--gold-rgb)),.18);border-color:var(--sel,var(--gold));color:var(--sel-hi,var(--gold-hi))}
.hofv-info{margin:0 0 8px;font-size:var(--fs-xs,12px);color:var(--text-dim);line-height:1.35}
.hofv .rk-table td:first-child,.hofv .rk-table th:first-child{width:2.6em;text-align:right}
.hofv .rk-table td:nth-child(3),.hofv .rk-table th:nth-child(3){text-align:right}
.hofv .rk-table td:nth-child(4){color:var(--text-dim);white-space:nowrap;text-align:right}
.hofv .rk-table tr.top td{color:var(--gold-hi,var(--gold))}
.hofv .rk-table tr.me td{background:rgba(var(--gold-rgb),.16)}
.hofv .rk-table td:nth-child(2){max-width:11em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;
function ensureCss() {
  if (document.getElementById('hofv-css')) return;
  const st = document.createElement('style'); st.id = 'hofv-css'; st.textContent = CSS;
  document.head.appendChild(st);
}
function loadSel() { try { return JSON.parse(localStorage.getItem(VIEW_KEY) || 'null') || {}; } catch (e) { return {}; } }
function saveSel(g, m) { try { localStorage.setItem(VIEW_KEY, JSON.stringify({ g, m })); } catch (e) {} }

/** Draws the tab in `el`: a game, its modes, its board. */
export function renderHofTab(el) {
  if (!el) return;
  ensureCss();
  const games = hofGames(), saved = loadSel();
  let g = games.some((x) => x.id === saved.g) ? saved.g : games[0].id;
  let m = '', view = null, seq = 0;
  const modesOf = (id) => HOF_VIEW[id];
  const pickMode = () => { const ms = modesOf(g); m = ms.some(([id]) => id === m) ? m : ms.some(([id]) => id === saved.m) ? saved.m : ms[0][0]; };
  const me = () => {
    if (!view) return '';
    if (view.names === 'account') { const a = hofAccount(); return a ? a.n : ''; }
    return hofSavedName(view.names);
  };
  const draw = () => {
    if (!el.isConnected) return;
    const ms = modesOf(g), daily = /^(day-|daily$)/.test(m), rows = view && view.boards ? view.boards[m] || [] : null, mine = String(me()).toLowerCase();
    const lang = document.documentElement.lang || undefined;
    const list = rows == null ? '<div class="rk-msg">' + esc(tr('rankingLoading')) + '</div>'
      : !view.names || view.names === 'off' ? '<div class="rk-msg">' + esc(tr('rankingError')) + '</div>'
      : !rows.length ? '<div class="rk-msg">' + esc(tr('hofEmpty')) + '</div>'
      : '<table class="rk-table"><thead><tr><th>#</th><th>' + esc(tr('rankingColPlayer')) + '</th><th>' + esc(tr('rankingColScore')) + '</th><th></th></tr></thead><tbody>'
        + rows.map((r, i) => '<tr class="' + (i < 3 ? 'top' : '') + (mine && String(r.n).toLowerCase() === mine ? ' me' : '') + '"><td>' + (i + 1) + '</td><td>' + esc(r.n) + '</td><td>' + esc(fmt(r.s)) + '</td><td>'
          + esc(daily ? new Date(r.ts).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) : new Date(r.ts).toLocaleDateString(lang, { day: 'numeric', month: 'short' })) + '</td></tr>').join('')
        + '</tbody></table>';
    el.innerHTML = '<div class="hofv">'
      + '<div class="hofv-pick"><select class="rk-season" aria-label="' + esc(tr('gmTitle')) + '">'
      + games.map((x) => '<option value="' + esc(x.id) + '"' + (x.id === g ? ' selected' : '') + '>' + esc((x.icon ? x.icon + ' ' : '') + gameName(x, tr)) + '</option>').join('') + '</select></div>'
      + '<div class="hofv-modes" role="tablist">' + ms.map(([id, k, k2]) => '<button type="button" role="tab" aria-selected="' + (id === m) + '" data-m="' + esc(id) + '" class="' + (id === m ? 'on' : '') + '">'
        + esc(tr(k) + (k2 ? ' · ' + tr(k2) : '')) + '</button>').join('') + '</div>'
      + '<p class="hofv-info">ⓘ ' + esc(tr('hofInfo', { w: tr('advTitle') + ' › ' + tr('advSecCommunity') })) + '</p>'
      + list + '</div>';
    const sel = /** @type {HTMLSelectElement|null} */ (el.querySelector('select'));
    if (sel) sel.addEventListener('change', () => { g = sel.value; pickMode(); saveSel(g, m); load(); });
    el.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { m = b.getAttribute('data-m') || m; saveSel(g, m); draw(); }));
  };
  const load = () => {
    const my = ++seq; view = null; draw();
    hofBoards(g).then((v) => { if (my !== seq) return; view = v || { names: '', boards: {} }; draw(); });
  };
  pickMode();
  load();
}
