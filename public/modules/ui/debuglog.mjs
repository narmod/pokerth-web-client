// ═══════════════════════════════════════════════════════════════════
// Debug log — an in-app view of what the client printed to the console,
// so a player can read it and paste it into a bug report.
//
// Port of the QML "Show debug log" viewer (pages/LogsPage.qml, LogStore
// .debugLogTail): on mobile the desktop client writes pokerth-debug.log
// into private storage the user cannot reach, so it added a reader. The
// web client has the same problem for a different reason — on a phone,
// and in a standalone PWA on any platform, there is no dev console at
// all. So we keep the console output in a ring buffer instead of a file.
//
// Like the QML client's pokerth-debug.log (opened std::ios::app in
// loghelper_client.cpp), the log now survives restarts: the ring buffer
// is saved to localStorage so the tail spans the last few sessions, each
// marked by its own "debug log started" line. Same 200 KB cap as the
// file tail the QML viewer shows. Nothing is uploaded. The player
// decides what to share, and secrets are masked on the way in (see
// _mask) because this text is meant to end up on a public forum.
// ═══════════════════════════════════════════════════════════════════
import { t } from '../i18n.mjs';

const MAX_CHARS = 200000;   // same tail size as LogStore.debugLogTail
const STORE_KEY = 'pth_debuglog';
const LINES = [];
let chars = 0;

// ── Previous sessions (QML parity: pokerth-debug.log is append-mode) ──
// Restore the saved tail before anything from this session is pushed.
// Content was already masked when it was first captured.
try {
  const prev = localStorage.getItem(STORE_KEY);
  if (prev) {
    for (const l of prev.split('\n')) { LINES.push(l); chars += l.length + 1; }
    while (chars > MAX_CHARS && LINES.length > 1) chars -= LINES.shift().length + 1;
  }
} catch (e) {}

let _saveT = null;
function _save() {
  _saveT = null;
  try { localStorage.setItem(STORE_KEY, LINES.join('\n')); } catch (e) {}
}
function _scheduleSave() {
  if (_saveT == null) _saveT = setTimeout(_save, 2000);
}
// Flush on tab hide/close so a crash-adjacent session still leaves its
// last lines behind — same spirit as the QML endl-flush per line.
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') { if (_saveT != null) clearTimeout(_saveT); _save(); }
});
window.addEventListener('pagehide', function () { if (_saveT != null) clearTimeout(_saveT); _save(); });

function _mask(s) {
  // Anything that looks like a credential never reaches the buffer: the
  // whole point of this view is that its content gets pasted in public.
  return s
    .replace(/((?:password|passwd|pwd|token|secret|apikey|api_key|pat)\s*[:=]\s*)("[^"]*"|'[^']*'|\S+)/gi, '$1***')
    .replace(/(github_pat_|ghp_)[A-Za-z0-9_]+/g, '$1***');
}

function _fmt(v) {
  if (typeof v === 'string') return v;
  if (v instanceof Error) return (v.stack || (v.name + ': ' + v.message));
  try {
    const s = JSON.stringify(v);
    return s === undefined ? String(v) : (s.length > 2000 ? s.slice(0, 2000) + '…' : s);
  } catch (e) { return String(v); }
}

function _stamp() {
  const d = new Date();
  const p = (n, w) => String(n).padStart(w || 2, '0');
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + '.' + p(d.getMilliseconds(), 3);
}

function push(level, args) {
  let line;
  try {
    line = _stamp() + ' [' + level + '] ' + Array.prototype.map.call(args, _fmt).join(' ');
  } catch (e) { return; }
  line = _mask(line);
  LINES.push(line);
  chars += line.length + 1;
  // Ring buffer: drop from the front, never let the tab's memory grow
  // without bound during a long session.
  while (chars > MAX_CHARS && LINES.length > 1) chars -= LINES.shift().length + 1;
  _scheduleSave();
}

function tail(n) {
  const s = LINES.join('\n');
  return (typeof n === 'number' && s.length > n) ? s.slice(s.length - n) : s;
}

// ── Capture ────────────────────────────────────────────────────────
// The originals are kept and still called: the console keeps working
// exactly as before for anyone who does have devtools open.
['log', 'info', 'warn', 'error', 'debug'].forEach(function (lvl) {
  const orig = console[lvl];
  if (typeof orig !== 'function') return;
  console[lvl] = function () {
    push(lvl.toUpperCase(), arguments);
    try { orig.apply(console, arguments); } catch (e) {}
  };
});
window.addEventListener('error', function (e) {
  push('UNCAUGHT', [(e && e.message) || 'error', (e && e.filename) || '', (e && e.lineno) || '']);
});
window.addEventListener('unhandledrejection', function (e) {
  push('REJECTION', [(e && e.reason) || 'unknown']);
});
// Header de session : BUILD_VERSION est défini en fin de pokerth.js, APRÈS
// l'évaluation des modules importés. Un setTimeout(0) perdait la course si
// pokerth.js arrivait lentement du réseau (forum : « build ? ») → on ATTEND
// la valeur (poll court), en gardant l'horodatage réel du démarrage.
(function () {
  const startedAt = _stamp();
  let tries = 0;
  (function waitBuild() {
    if (window.BUILD_VERSION || ++tries > 100) {   // ~10 s max
      LINES_pushHeader();
    } else {
      setTimeout(waitBuild, 100);
    }
  })();
  function LINES_pushHeader() {
    const line = _mask(startedAt + ' [INFO] debug log started — build ' +
                       (window.BUILD_VERSION || '?') + ' — ' + navigator.userAgent);
    LINES.push(line);
    chars += line.length + 1;
    _scheduleSave();
  }
})();

// ── Viewer ─────────────────────────────────────────────────────────
const CSS =
  '#dbg-modal{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center}' +
  '#dbg-modal .dbg-card{width:min(92vw,680px);height:min(88vh,680px);display:flex;flex-direction:column;gap:8px}' +
  '#dbg-text{flex:1;min-height:0;width:100%;box-sizing:border-box;resize:none;white-space:pre;overflow:auto;' +
    'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.45;' +
    'color:var(--chatlog-text,var(--text));background:var(--chatlog-bg,var(--field-bg));' +
    'border:1px solid var(--border);border-radius:var(--r-xs);padding:6px}' +
  '#dbg-modal .dbg-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
  '#dbg-text.dbg-wrap{white-space:pre-wrap;word-break:break-all}' +
  '#dbg-modal .dbg-sp{flex:1}';

function _modal() {
  let m = document.getElementById('dbg-modal');
  if (m) return m;
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  m = document.createElement('div');
  m.id = 'dbg-modal';
  m.style.display = 'none';
  m.innerHTML =
    '<div class="km-backdrop"></div>' +
    '<div class="km-card dbg-card" role="dialog" aria-labelledby="dbg-title">' +
      '<button class="km-close" type="button" id="dbg-close" data-i18n-aria="closeTooltip" aria-label="Close">\u2715</button>' +
      '<div class="km-title" id="dbg-title"></div>' +
      '<textarea id="dbg-text" readonly spellcheck="false"></textarea>' +
      '<div class="dbg-row">' +
        '<button type="button" class="btn-sm" id="dbg-refresh"></button>' +
        '<button type="button" class="btn-sm" id="dbg-copy"></button>' +
        '<button type="button" class="btn-sm" id="dbg-save"></button>' +
        '<label class="dbg-wrap-lbl"><input type="checkbox" id="dbg-wrap"> <span id="dbg-wrap-txt"></span></label>' +
        '<span class="dbg-sp"></span>' +
      '</div>' +
    '</div>';
  document.body.appendChild(m);

  const close = function () { m.style.display = 'none'; };
  m.querySelector('#dbg-close').addEventListener('click', close);
  m.querySelector('.km-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && m.style.display !== 'none') close();
  });
  m.querySelector('#dbg-refresh').addEventListener('click', fill);
  // Retour à la ligne (forum : lignes longues illisibles sans scroll
  // horizontal sur mobile). Préférence mémorisée.
  const wrapCb = m.querySelector('#dbg-wrap');
  try { wrapCb.checked = localStorage.getItem('pth_debuglog_wrap') === '1'; } catch (e) {}
  const applyWrap = function () {
    document.getElementById('dbg-text').classList.toggle('dbg-wrap', wrapCb.checked);
    try { localStorage.setItem('pth_debuglog_wrap', wrapCb.checked ? '1' : '0'); } catch (e) {}
  };
  wrapCb.addEventListener('change', applyWrap);
  applyWrap();
  m.querySelector('#dbg-copy').addEventListener('click', function () {
    const ta = document.getElementById('dbg-text');
    const btn = document.getElementById('dbg-copy');
    const done = function () { btn.textContent = t('copiedShort'); setTimeout(function () { btn.textContent = t('dbgLogCopy'); }, 1400); };
    try {
      navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
    } catch (e) { try { ta.select(); document.execCommand('copy'); done(); } catch (e2) {} }
  });
  m.querySelector('#dbg-save').addEventListener('click', function () {
    const blob = new Blob([tail(MAX_CHARS)], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pokerth-web-debug-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '') + '.log';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  });
  return m;
}

function fill() {
  const ta = document.getElementById('dbg-text');
  if (!ta) return;
  const s = tail(MAX_CHARS);
  ta.value = s || t('dbgLogEmpty');
  ta.scrollTop = ta.scrollHeight;   // newest at the bottom, like the file
}

function openDebugLog() {
  const m = _modal();
  m.querySelector('#dbg-title').textContent = t('dbgLogTitle');
  m.querySelector('#dbg-refresh').textContent = t('refreshTooltip');
  m.querySelector('#dbg-copy').textContent = t('dbgLogCopy');
  m.querySelector('#dbg-save').textContent = t('jrSaveAs');
  m.querySelector('#dbg-wrap-txt').textContent = t('dbgLogWrap');
  fill();
  m.style.display = 'flex';
}

export { openDebugLog, tail as debugLogTail };

window._openDebugLog = openDebugLog;
window._debugLogTail = tail;
