// @ts-check
// ═══════════════════════════════════════════════════════════════════
// Storage on this device (Advanced options › Reset & backup, web.29; web
// extension, not in the official QML client).
//
// What the web client keeps in this browser, to check a device where things
// are not kept (an iPhone home-screen app has its own storage, apart from
// Safari, and a full or blocked storage silently drops every new trophy and
// setting):
//   - settings and progress: the size of the pth_* entries of localStorage
//     (UTF-16, 2 bytes a character) and the largest of them, grouped (avatar
//     cache, best scores… one line each);
//   - whether saving works: a small entry written, read back and removed;
//   - other data (hand history, offline files): navigator.storage.estimate().
// Read only: nothing is cleared from here. Shown when the section scrolls into
// view, again with « Refresh ».
// ═══════════════════════════════════════════════════════════════════

const tr = (k, p) => { try { return typeof window.t === 'function' ? window.t(k, p) : k; } catch (e) { return k; } };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

/** 1234567 → « 1.2 MB » (decimal units, as the systems show them). */
export function fmtBytes(n) {
  const v = Math.max(0, n || 0);
  if (v < 1000) return v + ' B';
  if (v < 1e6) return (v / 1e3).toFixed(v < 1e4 ? 1 : 0) + ' KB';
  if (v < 1e9) return (v / 1e6).toFixed(1) + ' MB';
  return (v / 1e9).toFixed(1) + ' GB';
}

/** A key's group: entries that differ only by an id are one line. */
export function group(k) {
  return k.replace(/^(pth_game_best_|pth_av_|pth_winpos_|pth_win_)[^]*$/, '$1*').replace(/[_.-]?[0-9a-f]{8,}$/i, '_*');
}

/** { total, items: [{ key, bytes, n }] largest first } of the pth_* entries. */
export function localUsage(store) {
  const groups = new Map();
  let total = 0;
  try {
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (!k || k.indexOf('pth_') !== 0) continue;
      const v = store.getItem(k) || '';
      const b = 2 * (k.length + v.length);
      total += b;
      const g = group(k);
      const e = groups.get(g) || { key: g, bytes: 0, n: 0 };
      e.bytes += b; e.n++;
      groups.set(g, e);
    }
  } catch (e) {}
  return { total, items: [...groups.values()].sort((a, b) => b.bytes - a.bytes) };
}

/** Can this device keep a new entry? Written, read back, removed. */
export function canSave(store) {
  const k = 'pth__probe', v = String(Date.now());
  try { store.setItem(k, v); const ok = store.getItem(k) === v; store.removeItem(k); return ok; } catch (e) { return false; }
}

export async function render(el) {
  if (!el) return;
  const ls = (() => { try { return window.localStorage; } catch (e) { return null; } })();
  const u = ls ? localUsage(ls) : { total: 0, items: [] };
  const ok = !!ls && canSave(ls);
  let other = '';
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      if (est && est.quota) other = tr('advStorageOther', { u: fmtBytes(est.usage || 0), q: fmtBytes(est.quota) });
    }
  } catch (e) {}
  const top = u.items.slice(0, 5).map((it) => '<li><code>' + esc(it.key) + '</code>' + (it.n > 1 ? ' ×' + it.n : '') + ' — ' + fmtBytes(it.bytes) + '</li>').join('');
  el.innerHTML = '<div class="adv-store-st ' + (ok ? 'ok' : 'ko') + '">' + esc(tr(ok ? 'advStorageOk' : 'advStorageFail')) + '</div>'
    + '<div>' + esc(tr('advStorageLocal', { n: fmtBytes(u.total) })) + '</div>'
    + (other ? '<div>' + esc(other) + '</div>' : '')
    + (top ? '<div class="adv-store-top">' + esc(tr('advStorageTop')) + '</div><ul class="adv-store-list">' + top + '</ul>' : '');
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const go = () => {
    const el = document.getElementById('adv-storage');
    const btn = document.getElementById('adv-storage-refresh');
    if (!el) return;
    if (btn) btn.addEventListener('click', () => { render(el); });
    // Measured each time the section comes into view.
    if (window.IntersectionObserver) {
      new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) render(el); }).observe(el);
    } else render(el);
    // The language changes: re-worded.
    try { new MutationObserver(() => { if (el.innerHTML) render(el); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
}
