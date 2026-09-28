// ═══════════════════════════════════════════════════════════════════
// Mascot test panel (hidden, web extension, narmod 2026-09-28).
//
// Opened with ?mascot=panel or mascotPanel() in the console — never linked
// from the UI. Plays any appearance right away instead of waiting for the
// idle timer: pick the entry, the action, the exit, a hat and a tool (or
// leave « auto »), slow it down or speed it up, chain appearances in a loop.
// It sits under the Ace (z-index 240 < 250) and fades while he plays.
// While the panel is open the idle timer is off and clicks inside it do not
// send the Ace away (clicks elsewhere still do, to test the dismissal).
// Settings are remembered in localStorage (pth_mascot_panel). English only:
// a developer tool, like the admin page.
// Loaded on demand by modules/mascot/index.mjs.
// ═══════════════════════════════════════════════════════════════════

const KEY = 'pth_mascot_panel';
const SPEEDS = [0.25, 0.5, 1, 1.5, 2];

const CSS = `
#mascot-panel{position:fixed;top:calc(52px + env(safe-area-inset-top,0px));right:10px;z-index:240;transition:opacity .25s;width:236px;max-width:calc(100vw - 20px);
  background:rgba(20,24,32,.94);color:#e8ecf2;border:1px solid #3a4456;border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.5);
  font:13px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
#mascot-panel .mp-head{display:flex;align-items:center;gap:6px;padding:7px 8px 7px 10px;cursor:grab;border-bottom:1px solid #2c3444}
#mascot-panel .mp-head b{flex:1;font-size:13px}
#mascot-panel .mp-head button{background:none;border:0;color:#aeb7c4;font-size:15px;width:26px;height:26px;border-radius:6px;cursor:pointer}
#mascot-panel .mp-head button:hover{background:#2c3444;color:#fff}
#mascot-panel .mp-body{padding:8px 10px 10px;display:grid;grid-template-columns:auto 1fr;gap:6px 8px;align-items:center;touch-action:auto}
#mascot-panel.mp-min .mp-body{display:none}
#mascot-panel label{color:#aeb7c4;font-size:12px}
#mascot-panel select{width:100%;min-width:0;background:#0f131a;color:#e8ecf2;border:1px solid #3a4456;border-radius:6px;padding:4px 6px;font-size:13px}
#mascot-panel .mp-row{grid-column:1/-1;display:flex;gap:6px;align-items:center}
#mascot-panel .mp-btn{flex:1;padding:7px 0;border-radius:8px;border:1px solid #3a4456;background:#232a37;color:#fff;font-weight:700;font-size:13px;cursor:pointer}
#mascot-panel .mp-btn:hover{background:#2c3444}
#mascot-panel .mp-play{background:#b3261e;border-color:#b3261e}
#mascot-panel .mp-play:hover{background:#c62828}
#mascot-panel .mp-quick{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:4px}
#mascot-panel .mp-quick button{padding:3px 7px;border-radius:999px;border:1px solid #3a4456;background:#171c26;color:#dfe4eb;font-size:12px;cursor:pointer}
#mascot-panel .mp-quick button:hover{border-color:#f5c518;color:#f5c518}
#mascot-panel .mp-status{grid-column:1/-1;color:#8f9bb0;font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;min-height:28px;word-break:break-word}
#mascot-panel.mp-busy{opacity:.35}
@media (hover:hover){#mascot-panel.mp-busy:hover{opacity:1}}
#mascot-panel.mp-busy:focus-within{opacity:1}
#mascot-panel .mp-loop{display:flex;align-items:center;gap:6px;color:#aeb7c4;font-size:12px}
`;

const LABELS = {
  door: 'Door', poof: 'Puff', edge: 'Screen edge', peek: 'Peek (window top)',
  moon: 'Moonwalk', climb: 'Climb & fall', magic: 'Magic', king: 'King', knight: 'Knight', grim: 'Grimaces',
  sleep: 'Nap', juggle: 'Juggling', none: '— greeting only —', duck: 'Duck (after peek)',
  tophat: 'Top hat', wizard: 'Wizard', crown: 'Crown', helmet: 'Helmet', fedora: 'Fedora', nightcap: 'Nightcap',
  wand: 'Wand', scepter: 'Scepter', sword: 'Sword', cane: 'Cane',
};

let el = null;
let api = null;       // { play(opts) → Promise<seq>, stop(), catalog, onClose() }
let looping = false;
let busy = false;
let loopTimer = 0;
let runId = 0;      // only the latest run updates the status and chains the loop

function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

function sel(name, list, auto) {
  const o = (auto ? ['<option value="">auto</option>'] : []).concat(list.map((v) =>
    `<option value="${v}">${LABELS[v] || v}</option>`));
  return `<label for="mp-${name}">${name[0].toUpperCase() + name.slice(1)}</label><select id="mp-${name}" data-k="${name}">${o.join('')}</select>`;
}

function read() {
  const v = (k) => el.querySelector('#mp-' + k).value;
  return { entry: v('entry'), action: v('action'), exit: v('exit'), hat: v('hat'), tool: v('tool'), speed: +v('speed') || 1, loop: el.querySelector('#mp-loop').checked };
}

function setBusy(on) { busy = on; if (el) el.classList.toggle('mp-busy', on); }

function status(t) { const s = el && el.querySelector('.mp-status'); if (s) s.textContent = t; }

function describe(seq) {
  if (!seq) return '';
  const acts = seq.actions && seq.actions.length ? seq.actions.join(' + ') : '—';
  const c = seq.costume || {};
  let t = `${seq.entry} → ${acts} → ${seq.exit} · hat ${c.hat}, tool ${c.tool}`;
  if (seq.peekable === false) t += ' · no panel to peek from';
  if (seq.climbable === false) t += ' · no panel to climb';
  return t;
}

async function run(over) {
  if (!el) return;
  clearTimeout(loopTimer);
  const s = Object.assign(read(), over || {});
  const o = { speed: s.speed };
  ['entry', 'action', 'exit', 'hat', 'tool'].forEach((k) => { if (s[k]) o[k] = s[k]; });
  const id = ++runId;
  setBusy(true);
  status('playing…');
  let seq = null;
  try { seq = await api.play(o); } catch (e) { status('error: ' + (e && e.message)); }
  if (id !== runId) return;   // superseded by a newer run
  setBusy(false);
  if (!el) return;
  if (seq) status(describe(seq));
  if (looping) loopTimer = setTimeout(() => { if (looping && el) run(); }, 700);
}

function stop() {
  runId++;
  setBusy(false);
  looping = false;
  clearTimeout(loopTimer);
  const c = el && el.querySelector('#mp-loop');
  if (c) c.checked = false;
  api.stop();
  status('stopped');
}

function dragHead(head) {
  let sx = 0, sy = 0, ox = 0, oy = 0, on = false;
  head.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = el.getBoundingClientRect();
    on = true; sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
    head.setPointerCapture(e.pointerId);
  });
  head.addEventListener('pointermove', (e) => {
    if (!on) return;
    const x = Math.max(0, Math.min(window.innerWidth - 60, ox + e.clientX - sx));
    const y = Math.max(0, Math.min(window.innerHeight - 40, oy + e.clientY - sy));
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.right = 'auto';
  });
  const end = () => { on = false; };
  head.addEventListener('pointerup', end);
  head.addEventListener('pointercancel', end);
}

/** Opens the panel (idempotent). a = { play, stop, catalog, onClose }. */
export function open(a) {
  api = a;
  if (el) return el;
  if (!document.getElementById('mascot-panel-css')) {
    const st = document.createElement('style');
    st.id = 'mascot-panel-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const C = a.catalog;
  el = document.createElement('div');
  el.id = 'mascot-panel';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Mascot test panel');
  el.innerHTML = `<div class="mp-head"><b>🂡 Mascot test</b><button type="button" class="mp-min-b" title="Minimise">▁</button><button type="button" class="mp-x" title="Close">✕</button></div>
<div class="mp-body">
<div class="mp-quick">${C.actions.filter((x) => x !== 'none').map((x) => `<button type="button" data-a="${x}">${LABELS[x]}</button>`).join('')}<button type="button" data-e="peek">Peek</button></div>
${sel('entry', C.entries, true)}${sel('action', C.actions, true)}${sel('exit', C.exits, true)}${sel('hat', C.hats, true)}${sel('tool', C.tools, true)}
<label for="mp-speed">Speed</label><select id="mp-speed" data-k="speed">${SPEEDS.map((v) => `<option value="${v}">×${v}</option>`).join('')}</select>
<div class="mp-row"><button type="button" class="mp-btn mp-play">▶ Play</button><button type="button" class="mp-btn mp-rnd" title="Everything on auto">🎲</button><button type="button" class="mp-btn mp-stop">■</button></div>
<div class="mp-row"><label class="mp-loop"><input type="checkbox" id="mp-loop"> Loop (chain appearances)</label></div>
<div class="mp-status">Ready. Quick buttons play one act now.</div>
</div>`;
  document.body.appendChild(el);
  const s = load();
  ['entry', 'action', 'exit', 'hat', 'tool', 'speed'].forEach((k) => {
    const f = el.querySelector('#mp-' + k);
    if (s[k] !== undefined && [...f.options].some((o) => o.value === String(s[k]))) f.value = String(s[k]);
    else if (k === 'speed') f.value = '1';
  });
  if (s.min) el.classList.add('mp-min');
  el.addEventListener('change', (e) => {
    if (e.target.id === 'mp-loop') { looping = e.target.checked; if (looping && !busy) run(); return; }
    const r = read(); delete r.loop; r.min = el.classList.contains('mp-min'); save(r);
  });
  el.querySelector('.mp-play').addEventListener('click', () => run());
  el.querySelector('.mp-rnd').addEventListener('click', () => run({ entry: '', action: '', exit: '', hat: '', tool: '' }));
  el.querySelector('.mp-stop').addEventListener('click', stop);
  el.querySelector('.mp-quick').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.a) run({ action: b.dataset.a, entry: '', exit: '', hat: '', tool: '' });
    else if (b.dataset.e) run({ entry: b.dataset.e, action: '', exit: '', hat: '', tool: '' });
  });
  el.querySelector('.mp-min-b').addEventListener('click', () => {
    el.classList.toggle('mp-min');
    const r = read(); delete r.loop; r.min = el.classList.contains('mp-min'); save(r);
  });
  el.querySelector('.mp-x').addEventListener('click', close);
  dragHead(el.querySelector('.mp-head'));
  return el;
}

export function close() {
  if (!el) return;
  looping = false;
  clearTimeout(loopTimer);
  try { api.stop(); } catch (e) {}
  el.remove();
  el = null;
  try { api.onClose(); } catch (e) {}
}

export function isOpen() { return !!el; }
