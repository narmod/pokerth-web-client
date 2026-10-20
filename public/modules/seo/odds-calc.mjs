// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/seo/odds-calc.mjs — interactive poker odds calculator of the
// /poker-odds page (server-rendered by proxy.js, seoOddsPage).
//
// Pick your two cards, up to five board cards, and either an opponent's hand
// (heads-up) or a number of random opponents (1–9): the module deals out the
// rest and shows how often you win, tie or lose, and the hand you finish with.
//   · exact enumeration whenever the deals fit in EXACT_MAX (always with a
//     known opponent: at most C(48,5) = 1,712,304 boards; one random opponent
//     from the flop on), a SIM_DEALS-deal simulation otherwise;
//   · evaluation by the vendored phe (public/vendor/phe.mjs, the evaluator of
//     the in-game Odds tab, checked by scripts/test-phe.mjs);
//   · work cut into ~12 ms slices so the page never freezes; a newer request
//     cancels the running one.
//
// The texts (and the ten hand names, from the /hand-rankings translation of
// the same language) arrive in <script type="application/json"
// id="odds-calc-data">, so the calculator speaks the page's language. Without
// JavaScript the page keeps its tables; a <noscript> line says so.
//
// The pure part — computeOdds() — has no DOM and runs in node:
// scripts/test-odds-calc.mjs checks it against seo-i18n/odds-data.json.
// ─────────────────────────────────────────────────────────────────────────
import * as phe from '../../vendor/phe.mjs';

const RANKS = '23456789TJQKA';
const SUITS = 'shdc';                      // display rows: ♠ ♥ ♦ ♣
const SUIT_SYM = { s: '♠', h: '♥', d: '♦', c: '♣' };
export const EXACT_MAX = 2000000;          // deals enumerated exactly up to this
export const SIM_DEALS = 60000;            // deals simulated beyond it

// Card index 0..51 = suit * 13 + rank (rank 0 = 2 … 12 = A).
export const cardName = (i) => RANKS[i % 13] + SUITS[(i / 13) | 0];
const CODE = Array.from({ length: 52 }, (_, i) => phe.cardCode(RANKS[i % 13], SUITS[(i / 13) | 0]));

// Hand category 0 = high card … 8 = straight flush, 9 = royal flush.
function category(strength) { return strength === 1 ? 9 : 8 - phe.handRank(strength); }

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = r * (n - k + i) / i;
  return Math.round(r);
}

// Every k-subset of arr, in lexicographic order, without building them all.
function* subsets(arr, k) {
  const n = arr.length, idx = Array.from({ length: k }, (_, i) => i);
  if (k === 0) { yield []; return; }
  if (k > n) return;
  for (;;) {
    yield idx.map((i) => arr[i]);
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

/**
 * How the deals will be made for a request: exact or simulated, and how many.
 * @param {{hero:number[], board:number[], opp:number[], nOpp:number}} q
 */
export function plan(q) {
  const known = q.hero.length + q.board.length + q.opp.length;
  const rest = 52 - known, boardNeed = 5 - q.board.length;
  if (q.opp.length === 2) return { exact: true, deals: choose(rest, boardNeed) };
  if (q.nOpp === 1) {
    const deals = choose(rest, 2) * choose(rest - 2, boardNeed);
    if (deals <= EXACT_MAX) return { exact: true, deals };
  }
  return { exact: false, deals: SIM_DEALS };
}

/**
 * Win / tie / lose for `hero`, plus the distribution of hero's final hand.
 * Resolves through onDone({win, tie, lose, cats[10], deals, exact}); returns a
 * cancel function. `slice` (ms) bounds each synchronous run; Infinity = all
 * at once (node tests).
 * @param {{hero:number[], board:number[], opp:number[], nOpp:number}} q
 * @param {(r:object)=>void} onDone
 * @param {{slice?:number, random?:()=>number}} [opt]
 */
export function computeOdds(q, onDone, opt) {
  const slice = (opt && opt.slice) || 12;
  const random = (opt && opt.random) || Math.random;
  const used = new Set([...q.hero, ...q.board, ...q.opp]);
  const deck = [];
  for (let i = 0; i < 52; i++) if (!used.has(i)) deck.push(i);
  const need = 5 - q.board.length;
  const p = plan(q);
  const H = q.hero.map((i) => CODE[i]), B = q.board.map((i) => CODE[i]);
  let win = 0, tie = 0, lose = 0, n = 0, cancelled = false;
  const cats = new Array(10).fill(0);

  // One showdown: hero against the given opponents' hole codes.
  function score(board, opps) {
    const hs = phe.evaluateCardCodes(H.concat(board));
    cats[category(hs)]++;
    let best = Infinity;
    for (const o of opps) { const s = phe.evaluateCardCodes(o.concat(board)); if (s < best) best = s; }
    if (hs < best) win++; else if (hs === best) tie++; else lose++;
    n++;
  }

  let step;
  if (p.exact && q.opp.length === 2) {
    const O = [q.opp.map((i) => CODE[i])], it = subsets(deck, need);
    step = () => { const s = it.next(); if (s.done) return false; score(B.concat(s.value.map((i) => CODE[i])), O); return true; };
  } else if (p.exact) {
    const oppIt = subsets(deck, 2);
    let cur = oppIt.next(), boardIt = null;
    step = () => {
      for (;;) {
        if (cur.done) return false;
        if (!boardIt) boardIt = subsets(deck.filter((c) => c !== cur.value[0] && c !== cur.value[1]), need);
        const b = boardIt.next();
        if (b.done) { boardIt = null; cur = oppIt.next(); continue; }
        score(B.concat(b.value.map((i) => CODE[i])), [cur.value.map((i) => CODE[i])]);
        return true;
      }
    };
  } else {
    const k = need + 2 * q.nOpp, d = deck.slice();
    let left = p.deals;
    step = () => {
      if (left-- <= 0) return false;
      for (let i = 0; i < k; i++) { const j = i + Math.floor(random() * (d.length - i)); const t = d[i]; d[i] = d[j]; d[j] = t; }
      const opps = [];
      for (let o = 0; o < q.nOpp; o++) opps.push([CODE[d[need + 2 * o]], CODE[d[need + 2 * o + 1]]]);
      score(B.concat(d.slice(0, need).map((i) => CODE[i])), opps);
      return true;
    };
  }

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function run() {
    if (cancelled) return;
    const t0 = now();
    let more = true;
    while (more) {
      for (let i = 0; i < 256 && (more = step()); i++);
      if (more && now() - t0 > slice) break;
    }
    if (more) { setTimeout(run, 0); return; }
    onDone({ win: win / n, tie: tie / n, lose: lose / n, cats: cats.map((c) => c / n), deals: n, exact: p.exact });
  }
  run();
  return () => { cancelled = true; };
}

// ── DOM ─────────────────────────────────────────────────────────────────────
function mount(root, T) {
  const lang = T.lang || 'en';
  // One decimal; two below 1%; a possible but rarer-than-0.01% hand reads
  // « < 0.01% » rather than a misleading « 0.0% ».
  const fmtPct = (x, d) => { try { return new Intl.NumberFormat(lang, { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d }).format(x); } catch (e) { return (x * 100).toFixed(d) + '%'; } };
  const pct = (x) => (x > 0 && x < 0.0001) ? '< ' + fmtPct(0.0001, 2) : fmtPct(x, x > 0 && x < 0.01 ? 2 : 1);
  const num = (x) => { try { return new Intl.NumberFormat(lang).format(x); } catch (e) { return String(x); } };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const label = (i) => { const r = RANKS[i % 13], s = SUITS[(i / 13) | 0]; return (r === 'T' ? '10' : r) + SUIT_SYM[s]; };
  const red = (i) => { const s = SUITS[(i / 13) | 0]; return s === 'h' || s === 'd'; };

  // Slots: 0–1 your hand, 2–6 board, 7–8 opponent.
  const slots = new Array(9).fill(null);
  const GROUPS = [{ key: 'you', from: 0, to: 2 }, { key: 'board', from: 2, to: 7 }, { key: 'opp', from: 7, to: 9 }];
  let active = 0, cancel = null, timer = null;

  const style = document.createElement('style');
  style.textContent =
    '.oc{border:1px solid #30363d;border-radius:8px;padding:12px;margin:.6em 0 1.4em;background:#11161d}' +
    '.oc-row{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:10px}' +
    '.oc-g{display:flex;flex-direction:column;gap:4px}.oc-g>span{font-size:.85em;color:#9aa4b0}' +
    '.oc-slots{display:flex;gap:4px;direction:ltr}' +
    '.oc-slot{width:38px;height:50px;border:1px dashed #4b5563;border-radius:5px;background:#0d1117;color:#e6edf3;font:600 15px/1 system-ui,sans-serif;cursor:pointer;padding:0}' +
    '.oc-slot.f{border-style:solid;background:#f3f4f6;color:#111}.oc-slot.f.r{color:#c0392b}' +
    '.oc-slot.on{outline:2px solid #1f6feb;outline-offset:1px}' +
    '.oc-deck{display:grid;grid-template-columns:repeat(13,1fr);gap:3px;direction:ltr;margin:8px 0}' +
    '.oc-c{min-width:0;height:34px;border:1px solid #30363d;border-radius:4px;background:#f3f4f6;color:#111;font:600 13px/1 system-ui,sans-serif;cursor:pointer;padding:0}' +
    '.oc-c.r{color:#c0392b}.oc-c:disabled{opacity:.18;cursor:default}' +
    '.oc-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:.9em;color:#9aa4b0}' +
    '.oc-bar select,.oc-bar button{font:inherit;color:#e6edf3;background:#0d1117;border:1px solid #30363d;border-radius:5px;padding:4px 8px}' +
    '.oc-res{margin-top:10px}.oc-wtl{display:flex;height:12px;border-radius:6px;overflow:hidden;background:#30363d;margin:6px 0}' +
    '.oc-wtl i{display:block}.oc-w{background:#2ea043}.oc-t{background:#d29922}.oc-l{background:#da3633}' +
    '.oc-nums{display:flex;gap:16px;flex-wrap:wrap;font-variant-numeric:tabular-nums}.oc-nums b{font-size:1.15em}' +
    '.oc-cats{margin:.4em 0 0;padding:0;list-style:none;font-size:.9em;font-variant-numeric:tabular-nums}' +
    '.oc-cats li{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #21262d;padding:2px 0}' +
    '.oc-note{font-size:.85em;color:#9aa4b0}' +
    '@media (max-width:420px){.oc-slot{width:32px;height:44px;font-size:13px}.oc-c{height:30px;font-size:11px}}';
  document.head.appendChild(style);

  const box = el('div', 'oc');
  const row = el('div', 'oc-row');
  const slotBtns = [];
  for (const g of GROUPS) {
    const wrap = el('div', 'oc-g');
    wrap.appendChild(el('span', '', T[g.key]));
    const s = el('div', 'oc-slots');
    for (let i = g.from; i < g.to; i++) {
      const b = el('button', 'oc-slot');
      b.type = 'button';
      b.addEventListener('click', () => {
        if (slots[i] != null) slots[i] = null;
        active = i;
        render(); schedule();
      });
      slotBtns[i] = b; s.appendChild(b);
    }
    wrap.appendChild(s); row.appendChild(wrap);
  }
  box.appendChild(row);
  box.appendChild(el('div', 'oc-note', T.pick));

  const deck = el('div', 'oc-deck');
  const cardBtns = [];
  for (let s = 0; s < 4; s++) for (let r = 12; r >= 0; r--) {
    const i = s * 13 + r;
    const b = el('button', 'oc-c' + (red(i) ? ' r' : ''), label(i));
    b.type = 'button';
    b.setAttribute('aria-label', label(i));
    b.addEventListener('click', () => place(i));
    cardBtns[i] = b; deck.appendChild(b);
  }
  box.appendChild(deck);

  const bar = el('div', 'oc-bar');
  const oppLab = el('label', '', T.players + ' ');
  const sel = el('select');
  for (let k = 1; k <= 9; k++) { const o = el('option', '', String(k)); o.value = String(k); sel.appendChild(o); }
  sel.addEventListener('change', schedule);
  oppLab.appendChild(sel); bar.appendChild(oppLab);
  const clr = el('button', '', T.clear); clr.type = 'button';
  clr.addEventListener('click', () => { slots.fill(null); active = 0; render(); schedule(); });
  bar.appendChild(clr);
  box.appendChild(bar);

  const res = el('div', 'oc-res');
  res.setAttribute('aria-live', 'polite');
  box.appendChild(res);
  root.appendChild(box);

  function nextFree(from) {
    const order = [0, 1, 2, 3, 4, 5, 6];
    if (from >= 7) return slots[7] == null ? 7 : (slots[8] == null ? 8 : -1);
    for (const i of order) if (i >= from && slots[i] == null) return i;
    for (const i of order) if (slots[i] == null) return i;
    return -1;
  }
  function place(card) {
    if (slots.includes(card)) return;
    let at = slots[active] == null ? active : nextFree(active);
    if (at < 0) return;
    slots[at] = card;
    const nx = nextFree(at);
    active = nx < 0 ? at : nx;
    render(); schedule();
  }
  function render() {
    for (let i = 0; i < 9; i++) {
      const b = slotBtns[i], c = slots[i];
      b.textContent = c == null ? '' : label(c);
      b.className = 'oc-slot' + (c != null ? ' f' + (red(c) ? ' r' : '') : '') + (i === active ? ' on' : '');
      b.setAttribute('aria-label', c == null ? (i < 2 ? T.you : i < 7 ? T.board : T.opp) : label(c));
    }
    for (let i = 0; i < 52; i++) cardBtns[i].disabled = slots.includes(i);
    const oppSet = slots[7] != null || slots[8] != null;
    if (oppSet) sel.value = '1';
    sel.disabled = oppSet;
  }
  function query() {
    const hero = [slots[0], slots[1]].filter((c) => c != null);
    const board = slots.slice(2, 7).filter((c) => c != null);
    const opp = [slots[7], slots[8]].filter((c) => c != null);
    return { hero, board, opp, nOpp: Number(sel.value) || 1 };
  }
  function schedule() {
    if (cancel) { cancel(); cancel = null; }
    clearTimeout(timer);
    const q = query();
    if (q.hero.length < 2) { res.textContent = ''; res.appendChild(el('p', 'oc-note', T.need)); return; }
    if (q.board.length === 1 || q.board.length === 2) { res.textContent = ''; res.appendChild(el('p', 'oc-note', T.boardHint)); return; }
    if (q.opp.length === 1) { res.textContent = ''; res.appendChild(el('p', 'oc-note', T.oppHint)); return; }
    res.textContent = ''; res.appendChild(el('p', 'oc-note', T.working));
    timer = setTimeout(() => { cancel = computeOdds(q, show); }, 120);
  }
  function show(r) {
    cancel = null;
    res.textContent = '';
    const nums = el('div', 'oc-nums');
    [[T.win, r.win], [T.tie, r.tie], [T.lose, r.lose]].forEach(([k, v]) => {
      const d = el('div'); d.appendChild(el('span', '', k + ' ')); d.appendChild(el('b', '', pct(v))); nums.appendChild(d);
    });
    res.appendChild(nums);
    const bar = el('div', 'oc-wtl');
    [['oc-w', r.win], ['oc-t', r.tie], ['oc-l', r.lose]].forEach(([c, v]) => { const i = el('i', c); i.style.width = (v * 100) + '%'; bar.appendChild(i); });
    res.appendChild(bar);
    res.appendChild(el('p', 'oc-note', (r.exact ? T.exact : T.sim).replace('{n}', num(r.deals))));
    res.appendChild(el('div', '', T.final));
    const ul = el('ul', 'oc-cats');
    for (let c = 9; c >= 0; c--) {
      if (!r.cats[c]) continue;
      const li = el('li'); li.appendChild(el('span', '', T.cats[9 - c])); li.appendChild(el('span', '', pct(r.cats[c])));
      ul.appendChild(li);
    }
    res.appendChild(ul);
  }
  render(); schedule();
}

if (typeof document !== 'undefined') {
  const start = () => {
    const root = document.getElementById('odds-calc');
    const data = document.getElementById('odds-calc-data');
    if (!root || !data) return;
    try { mount(root, JSON.parse(data.textContent || '{}')); } catch (e) { /* the tables below still work */ }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
