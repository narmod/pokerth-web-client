// Theme switch shared by /arena and /arena/organize: the system's
// choice by default, or dark / light kept in this browser (pth_td_theme). The
// browser and installed-app bar colour follows (meta theme-color).
const KEY = 'pth_td_theme';
const ORDER = ['auto', 'dark', 'light'];

function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
function store(v) { try { if (v == null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, v); } catch (e) {} }

export function applyTheme(t, btn, label) {
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
  document.querySelectorAll('meta[name="theme-color"]').forEach((m, i) => {
    const light = t === 'light' || (t === 'auto' && i === 1);
    m.setAttribute('content', light ? '#ebe6da' : '#12161d');
    if (t === 'auto') m.setAttribute('media', i === 1 ? '(prefers-color-scheme: light)' : '(prefers-color-scheme: dark)');
    else m.removeAttribute('media');
  });
  if (btn) btn.textContent = label ? label(t) : 'Theme: ' + t;
}

/** Wires the header button; `label(t)` gives its text ('Theme: auto'…);
 *  `changed(t)` hears the player's own changes (the account keeps them). */
export function initTheme(btn, label, changed) {
  const cur = () => load() || 'auto';
  const set = (t, quiet) => { const v = ORDER.indexOf(t) >= 0 ? t : 'auto'; store(v === 'auto' ? null : v); applyTheme(v, btn, label); if (!quiet && changed) changed(v); };
  btn.addEventListener('click', () => set(ORDER[(ORDER.indexOf(cur()) + 1) % ORDER.length]));
  applyTheme(cur(), btn, label);
  return { refresh: () => applyTheme(cur(), btn, label), get: cur, set };
}
