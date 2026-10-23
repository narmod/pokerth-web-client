// Admin shell: side menu drawer, page title, section routes (#traffic, #keys…)
// and group badges.
//
// The inline dashboard script owns the sections: a click on .tab[data-t]
// shows panel-<t> and runs its loaders, and .gtab[data-g] opens a group. This
// module only follows those clicks — it never opens a panel by itself other
// than by clicking the section's own button, so the loaders, the scope rules
// and the unsaved-edit tracking all apply exactly as for a click by hand.

const $ = (id) => document.getElementById(id);
const BASE_TITLE = 'PokerTH Web Client — Admin';
const NARROW = window.matchMedia('(max-width: 899px)');

const dash = $('dash');
const side = $('side');
const menuBtn = $('menuBtn');

// ── Drawer (under 900px) ─────────────────────────────────────────────────
function isOpen() { return !!dash && dash.classList.contains('open'); }
function openMenu() {
  if (!dash || !NARROW.matches) return;
  dash.classList.add('open');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  const cur = side && (side.querySelector('.tab.on') || side.querySelector('.gtab'));
  if (cur) { try { cur.focus({ preventScroll: true }); } catch (e) { cur.focus(); } }
}
function closeMenu(refocus) {
  if (!isOpen()) return;
  dash.classList.remove('open');
  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', 'false');
    if (refocus) menuBtn.focus();
  }
}
if (menuBtn) menuBtn.addEventListener('click', () => (isOpen() ? closeMenu(true) : openMenu()));
const closeBtn = $('sideClose');
if (closeBtn) closeBtn.addEventListener('click', () => closeMenu(true));
const scrim = $('sideScrim');
if (scrim) scrim.addEventListener('click', () => closeMenu(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeMenu(true); });
// Back to a wide window: the menu is part of the page again, not a drawer.
const onWidth = () => { if (!NARROW.matches) closeMenu(false); };
if (NARROW.addEventListener) NARROW.addEventListener('change', onWidth); else if (NARROW.addListener) NARROW.addListener(onWidth);

// ── Page title ───────────────────────────────────────────────────────────
function label(el) {
  if (!el) return '';
  const c = el.cloneNode(true);
  c.querySelectorAll('.tbadge,.tbeta,.gbadge,svg').forEach((x) => x.remove());
  return (c.textContent || '').trim();
}
function paintTitle(tab) {
  if (!tab) return;
  const grp = tab.closest('.sgrp');
  const gb = grp && grp.querySelector('.gtab');
  const t = label(tab), g = label(gb);
  const h = $('pageTitle'), e = $('pageGroup');
  if (h) {
    h.textContent = t;
    // A section still being built keeps its « beta » badge in the title too.
    const beta = tab.querySelector('.tbeta');
    if (beta) h.appendChild(beta.cloneNode(true));
  }
  // A section alone in its group (Overview) would only repeat its own name.
  if (e) e.textContent = g && g !== t ? g : 'PokerTH Admin';
  document.title = t ? t + ' · ' + BASE_TITLE : BASE_TITLE;
}

// ── Routes: #<section> ───────────────────────────────────────────────────
// The address names the open section, so a reload, a bookmark or the back
// button lands on it. A section the key may not open is ignored.
// A section is named by its tab, and by its page for a tab that has several
// (Statistics: traffic/summary, traffic/world…). Summary is the page kept as
// "overview" inside the dashboard; its address says what the menu says, and
// the old #traffic/overview still lands on it.
const TS_ADDR = { overview: 'summary' };
const TS_PAGE = { summary: 'overview', data: 'overview' };   // Data's cards moved out (web.184)
function idOf(b) { return b.dataset.t + (b.dataset.ts ? '/' + (TS_ADDR[b.dataset.ts] || b.dataset.ts) : ''); }
function tabFor(t) {
  const m = /^([a-z]+)(?:\/([a-z]+))?$/.exec(t || '');
  if (!m) return null;
  const ts = m[2] && (TS_PAGE[m[2]] || m[2]);
  const b = document.querySelector('.tab[data-t="' + m[1] + '"]' + (ts ? '[data-ts="' + ts + '"]' : ''));
  return b && b.style.display !== 'none' ? b : null;
}
function hashName() { return decodeURIComponent((location.hash || '').replace(/^#\/?/, '')); }
function openFromHash() {
  const b = tabFor(hashName());
  if (b && !b.classList.contains('on')) b.click();
}
window.addEventListener('hashchange', openFromHash);

// Every section pick — by hand, by a group, or from code — passes here after
// the dashboard's own handler has run (that one sits on the button itself).
// A group picked by hand opens its first section from code, inside the same
// click: that section counts as picked by hand too.
let groupByHand = false;
document.addEventListener('click', (e) => {
  if (e.isTrusted && e.target && e.target.closest && e.target.closest('.side .gtab')) {
    groupByHand = true;
    setTimeout(() => { groupByHand = false; }, 0);
  }
}, true);
document.addEventListener('click', (e) => {
  const b = e.target && e.target.closest ? e.target.closest('.tab[data-t]') : null;
  if (!b || !side || !side.contains(b)) return;
  paintTitle(b);
  const t = idOf(b);
  if (hashName() !== t) {
    // A pick by hand is a step the back button should undo; one made by code
    // (a group choosing its first section, the landing section) is not.
    if (e.isTrusted || groupByHand) location.hash = t;
    else { try { history.replaceState(history.state, '', '#' + t); } catch (err) {} }
  }
  if (e.isTrusted) closeMenu(false);
});
// A group with a single section opens it straight away: the drawer has done
// its job and closes as for a section.
document.addEventListener('click', (e) => {
  const g = e.isTrusted && e.target && e.target.closest ? e.target.closest('.sgrp.one .gtab') : null;
  if (g) closeMenu(false);
});

// The dashboard appears once the key is checked; its visible sections are
// only known then, so the route is applied at that moment.
let routed = false;
function onShown() {
  if (!dash || dash.style.display === 'none') { routed = false; return; }
  if (routed) return;
  routed = true;
  openFromHash();
  const cur = document.querySelector('.side .tab.on');
  paintTitle(cur);
  // The landing section gets its name in the address too, so the back button
  // can come back to it.
  if (cur && !hashName()) { try { history.replaceState(history.state, '', '#' + idOf(cur)); } catch (err) {} }
}
if (dash) {
  new MutationObserver(onShown).observe(dash, { attributes: true, attributeFilter: ['style'] });
  onShown();
}

// ── Group badges ─────────────────────────────────────────────────────────
// A section badge (LAN requests waiting…) is inside a folded group most of
// the time; the group shows the total while it is closed.
function paintBadges() {
  document.querySelectorAll('.side .sgrp').forEach((g) => {
    let n = 0;
    g.querySelectorAll('.tbadge').forEach((x) => {
      if (x.style.display === 'none') return;
      const v = parseInt(x.textContent, 10);
      if (v > 0) n += v;
    });
    const gb = g.querySelector('.gbadge');
    const txt = n > 0 ? String(n) : '';
    if (gb && gb.textContent !== txt) gb.textContent = txt;   // unchanged → no write, so the observer settles
  });
}
if (side) {
  new MutationObserver(paintBadges).observe(side, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style'] });
  paintBadges();
}
