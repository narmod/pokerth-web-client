// ═══════════════════════════════════════════════════════════════════
// Advanced options search — one field, every setting.
//
// Same shell as the Help window search (modules/help/index.mjs): a field
// under the title, and a flat result list that takes the place of the
// category panels while typing. Picking a result puts the reader back on
// the setting itself — right category, right sub-tab, section unfolded,
// scrolled into view and briefly highlighted.
//
// Unlike the Help window, there is no corpus to index: the settings are
// static markup in pokerth-client.html. The index is therefore built from
// the DOM of #adv-modal on every keystroke, which has two upsides — the
// labels are already in the current language (nothing to translate twice,
// nothing to keep in sync when a setting is added), and panels that are
// only filled in at open time (theme host, ignore list…) are picked up
// like any other.
//
// Matched, per row: its own label, the section it sits in, its category,
// and the labels of its <select> choices — so "Portrait" finds "Seat
// placement". Rows whose category is greyed out in the current context
// (lobby vs. in-game) are left out, since advSelectCat() would refuse to
// go there anyway.
// ═══════════════════════════════════════════════════════════════════
import { t, onLangChange } from '../i18n.mjs';

const MIN_Q = 2;          // same threshold as the Help search
const MAX_HITS = 60;
const ROW_SEL = '.adv-row, .adv-keyrow, .adv-link-btn';

let HITS = [];

function $(id) { return document.getElementById(id); }

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Diacritics-insensitive, like the Help search (é→e).
function fold(s) {
  try { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  catch (e) { return String(s).toLowerCase(); }
}

function txt(el) {
  return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : '';
}

// ── Index ──
function catLabel(modal, cat) {
  const btn = modal.querySelector('.adv-cat[data-cat="' + cat + '"]');
  return btn ? txt(btn.querySelector('.adv-cat-lbl')) : '';
}

// Section title: the <details> the row belongs to, or the closest plain
// .adv-sec heading above it (categories that don't use folds).
function secLabel(el) {
  const d = el.closest('details.adv-fold');
  if (d) {
    const s = d.querySelector('summary [data-i18n]') || d.querySelector('summary');
    return txt(s);
  }
  let n = el;
  while (n && !n.classList.contains('adv-panel')) {
    let p = n.previousElementSibling;
    while (p) {
      if (p.classList && p.classList.contains('adv-sec')) return txt(p);
      p = p.previousElementSibling;
    }
    n = n.parentElement;
  }
  return '';
}

function rowLabel(el) {
  if (el.classList.contains('adv-link-btn')) return txt(el);
  const s = el.querySelector(':scope > span');
  return s ? txt(s) : txt(el);
}

function buildIndex(modal) {
  const out = [];
  const panels = modal.querySelectorAll('.adv-panel');
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const cat = panel.getAttribute('data-cat') || '';
    const btn = modal.querySelector('.adv-cat[data-cat="' + cat + '"]');
    if (btn && btn.hasAttribute('disabled')) continue;   // inert in this context
    const cl = catLabel(modal, cat);
    const rows = panel.querySelectorAll(ROW_SEL);
    for (let j = 0; j < rows.length; j++) {
      const el = rows[j];
      const label = rowLabel(el);
      if (!label) continue;
      const opts = el.querySelectorAll('option');
      let extra = '';
      for (let k = 0; k < opts.length; k++) extra += ' ' + txt(opts[k]);
      const sec = secLabel(el);
      const tab = el.closest('.adv-uipanel');
      out.push({
        el: el,
        cat: cat,
        uitab: tab ? (tab.getAttribute('data-uitab') || '') : '',
        catLbl: cl,
        secLbl: sec,
        label: label,
        lbl: fold(label),
        hay: fold(label + ' ' + sec + ' ' + cl + extra),
      });
    }
  }
  return out;
}

// ── Search ──
function clear() {
  const inp = $('adv-search-in');
  if (inp) inp.value = '';
  const res = $('adv-results');
  if (res) { res.style.display = 'none'; res.innerHTML = ''; }
  const panels = document.querySelector('#adv-modal .adv-panels');
  if (panels) panels.classList.remove('is-searching');
  HITS = [];
}

function advSearch() {
  const modal = $('adv-modal');
  const inp = $('adv-search-in');
  const res = $('adv-results');
  const panels = modal ? modal.querySelector('.adv-panels') : null;
  if (!modal || !inp || !res || !panels) return;
  const q = fold(inp.value.trim());
  if (q.length < MIN_Q) {
    res.style.display = 'none';
    res.innerHTML = '';
    panels.classList.remove('is-searching');
    HITS = [];
    return;
  }
  // Label matches first, then matches found through section / category /
  // choice labels — the setting the reader typed the name of comes first.
  const strong = [], weak = [];
  const all = buildIndex(modal);
  for (let i = 0; i < all.length; i++) {
    const it = all[i];
    if (it.lbl.indexOf(q) >= 0) strong.push(it);
    else if (it.hay.indexOf(q) >= 0) weak.push(it);
    if (strong.length + weak.length >= MAX_HITS) break;
  }
  HITS = strong.concat(weak);
  let h = '';
  for (let i = 0; i < HITS.length; i++) {
    const it = HITS[i];
    const path = it.secLbl ? (it.catLbl + ' \u203a ' + it.secLbl) : it.catLbl;
    h += '<button type="button" class="help-result" onclick="window._advSearchGo(' + i + ')">'
      + '<span class="help-result-ch">' + esc(path) + '</span>'
      + '<span class="help-result-t">' + esc(it.label) + '</span></button>';
  }
  if (!h) h = '<p class="help-p help-wip">' + esc(t('helpNoResults')) + '</p>';
  res.innerHTML = h;
  res.style.display = '';
  panels.classList.add('is-searching');
}

// ── Go to a result ──
function advSearchGo(i) {
  const it = HITS[i];
  if (!it) return;
  const el = it.el;
  clear();                                   // panels visible again
  try { if (it.cat && window.advSelectCat) window.advSelectCat(it.cat); } catch (e) {}
  try { if (it.uitab && window.advUiTab) window.advUiTab(it.uitab); } catch (e) {}
  let d = el.closest('details.adv-fold');
  while (d) {
    d.open = true;
    d = d.parentElement ? d.parentElement.closest('details.adv-fold') : null;
  }
  try { el.scrollIntoView({ block: 'center' }); } catch (e) { try { el.scrollIntoView(); } catch (e2) {} }
  el.classList.add('adv-hit');
  setTimeout(function () { el.classList.remove('adv-hit'); }, 1600);
}

window._advSearch = advSearch;
window._advSearchGo = advSearchGo;
window._advSearchReset = clear;

// Language switched while the window is open: labels are re-read from the
// DOM, so it is enough to run the current query again.
onLangChange(function () {
  const inp = $('adv-search-in');
  if (inp && inp.value.trim().length >= MIN_Q) advSearch();
});
