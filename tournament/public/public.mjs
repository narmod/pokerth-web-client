// ═══════════════════════════════════════════════════════════════════
// /tournament — the players' page (2026-10-23).
//
//   /tournament            public tournaments: open, playing, coming, finished
//   /tournament/t/<key>    one tournament (also unlisted ones, by their link;
//                          a private one asks for its invitation code)
//
// Registration with a PokerTH nickname; the personal code it returns is kept
// in this browser (pth_td_regs) and is what unregistering asks for.
// Every language of the app: the list comes from /modules/lang-meta.mjs (the
// web client's), the texts from /tournament/lang/<code>.mjs, falling back
// to English, then to the key. Talks to /tournament/api/* (no token).
// ═══════════════════════════════════════════════════════════════════

import { initTheme } from './theme.mjs';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const RTL = ['ar', 'fa', 'he', 'ur'];
const REGS = 'pth_td_regs';

let EN = {}, L = {}, lang = 'en', meta = { en: { label: 'English' } };
function t(key, vars) {
  let s = L[key] != null ? L[key] : EN[key] != null ? EN[key] : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}
const T = (key, vars) => esc(t(key, vars));

function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function regsAll() { try { return JSON.parse(lsGet(REGS) || '{}') || {}; } catch (e) { return {}; } }
function regsFor(key) { return regsAll()[key] || []; }
function regsSave(key, list) { const a = regsAll(); if (list.length) a[key] = list; else delete a[key]; lsSet(REGS, JSON.stringify(a)); }

// ── language ───────────────────────────────────────────────────────
function pickLang(avail) {
  const has = (c) => avail.indexOf(c) >= 0;
  const norm = (c) => { if (!c) return null; if (has(c)) return c; const lc = c.toLowerCase(); const hit = avail.find((x) => x.toLowerCase() === lc); if (hit) return hit; const b = lc.split('-')[0]; return has(b) ? b : null; };
  let q = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  return norm(q) || norm(lsGet('pth_lang')) || norm(navigator.language) || 'en';
}
async function loadLang(code) {
  const file = String(code).toLowerCase();
  try { L = (await import('/tournament/lang/' + file + '.mjs')).strings || {}; } catch (e) { L = {}; }
  lang = code;
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.indexOf(code.split('-')[0]) >= 0 ? 'rtl' : 'ltr';
  document.title = t('title') + ' (' + t('beta') + ') · PokerTH';
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-t-title]').forEach((el) => { el.title = t(el.dataset.tTitle); });
  theme && theme.refresh();
}

// ── data ───────────────────────────────────────────────────────────
function api(path, body) {
  const o = { cache: 'no-store', headers: {} };
  if (body) { o.method = 'POST'; o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(body); }
  return fetch('/tournament/api' + path, o).then((r) => r.json().catch(() => ({ ok: false, code: 'error' })));
}
const fmtDate = (ts) => { try { return new Intl.DateTimeFormat(lang, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(ts)); } catch (e) { return new Date(ts).toLocaleString(); } };
const fmtTime = (ts) => { try { return new Intl.DateTimeFormat(lang, { timeStyle: 'short' }).format(new Date(ts)); } catch (e) { return new Date(ts).toLocaleTimeString(); } };
function chip(c) {
  if (c.phase === 'validated') return '<span class="chip done">' + T('stValidated') + '</span>';
  if (c.phase === 'finished') return '<span class="chip warn">' + T('stFinished') + '</span>';
  if (c.phase === 'table') return '<span class="chip live">' + T('stTable') + '</span>';
  return c.registration === 'open' ? '<span class="chip live">' + T('stRegOpen') + '</span>' : '<span class="chip">' + T('stRegClosed') + '</span>';
}
function keyFromPath() { const m = /^\/tournament\/t\/([A-Za-z0-9_-]{8,40})\/?$/.exec(location.pathname); return m ? m[1] : null; }
function inviteFromUrl() { try { return new URLSearchParams(location.search).get('invite') || ''; } catch (e) { return ''; } }
function go(path) { history.pushState(null, '', path); route(); }

// ── list ───────────────────────────────────────────────────────────
function card(c) {
  return '<li><a class="tcard" href="/tournament/t/' + esc(c.key) + '" data-go>' +
    '<span class="tc-top"><span class="tname">' + esc(c.name) + '</span>' + chip(c) + '</span>' +
    '<span class="muted small">' + (c.startsAt ? T('startsAt', { date: fmtDate(c.startsAt) }) : T('noDate')) +
    (c.server ? ' · ' + T('onServer', { server: c.server }) : '') + ' · ' + T('players', { n: c.players, max: c.maxPlayers }) +
    (c.winner ? ' · ' + T('winner', { nick: c.winner }) : '') + '</span></a></li>';
}
async function showList() {
  $('view').innerHTML = '<p class="empty">' + T('loading') + '</p>';
  const d = await api('/list');
  if (!d.ok) { $('view').innerHTML = '<p class="msg bad">' + T('err_error') + '</p>'; return; }
  const all = d.tournaments || [];
  const groups = [
    ['secLive', all.filter((c) => c.phase === 'table')],
    ['secOpen', all.filter((c) => c.phase === 'upcoming' && c.registration === 'open')],
    ['secUpcoming', all.filter((c) => c.phase === 'upcoming' && c.registration !== 'open')],
    ['secDone', all.filter((c) => c.phase === 'finished' || c.phase === 'validated')],
  ].filter((g) => g[1].length);
  // Coming soonest first; finished ones, latest first (as sent).
  for (const g of groups) if (g[0] !== 'secDone') g[1].sort((a, b) => (a.startsAt || Infinity) - (b.startsAt || Infinity));
  $('view').innerHTML = groups.length ? groups.map((g) => '<section class="card"><h2>' + T(g[0]) + '</h2><ul class="tlist">' + g[1].map(card).join('') + '</ul></section>').join('')
    : '<section class="card"><p class="empty">' + T('none') + '</p></section>';
}

// ── one tournament ─────────────────────────────────────────────────
let cur = null, curKey = null, pollTimer = null, flash = null;
async function showOne(key) {
  curKey = key;
  const inv = inviteFromUrl();
  const d = await api('/t/' + key + (inv ? '?invite=' + encodeURIComponent(inv) : ''));
  if (curKey !== key) return;
  if (!d.ok) {
    if (d.code === 'private') return renderPrivate(key, !!inv);
    $('view').innerHTML = '<p><a href="/tournament" data-go>← ' + T('allTournaments') + '</a></p><section class="card"><p class="msg bad">' + T('err_' + (d.code === 'notFound' ? 'notFound' : 'error')) + '</p></section>';
    return;
  }
  cur = d;
  renderOne();
  clearTimeout(pollTimer);
  if (d.phase === 'table' || d.phase === 'upcoming') pollTimer = setTimeout(() => { if (curKey === key) showOne(key); }, d.phase === 'table' ? 5000 : 30000);
}
function renderPrivate(key, tried) {
  $('view').innerHTML = '<p><a href="/tournament" data-go>← ' + T('allTournaments') + '</a></p><section class="card"><h2>' + T('privateTitle') + '</h2>' +
    '<p>' + T('privateText') + '</p>' + (tried ? '<p class="msg bad">' + T('err_notFound') + '</p>' : '') +
    '<form id="invForm" class="row"><div><label for="invIn">' + T('inviteCode') + '</label><input id="invIn" autocomplete="off" required></div><button type="submit" class="primary">' + T('open') + '</button></form></section>';
  $('invForm').addEventListener('submit', (ev) => { ev.preventDefault(); go('/tournament/t/' + key + '?invite=' + encodeURIComponent($('invIn').value.trim())); });
}
function tableLine(tb) {
  if (!tb) return '';
  return T(tb.raiseMode === 'minutes' ? 'tableSettingsMin' : 'tableSettings', { stack: tb.startMoney, sb: tb.firstSmallBlind, bb: tb.firstSmallBlind * 2, n: tb.raiseEvery, t: tb.actionTimeout });
}
function renderOne() {
  const c = cur, mine = regsFor(c.key);
  const mineSet = new Set(mine.map((r) => r.nick.toLowerCase()));
  let h = '<p><a href="/tournament" data-go>← ' + T('allTournaments') + '</a></p>';
  h += '<section class="card"><h2>' + esc(c.name) + '</h2><p>' + chip(c) + '</p><p class="small">' +
    (c.startsAt ? T('startsAt', { date: fmtDate(c.startsAt) }) : T('noDate')) + (c.server ? ' · ' + T('onServer', { server: c.server }) : '') + '<br>' +
    T('format') + ' · ' + T('players', { n: c.players, max: c.maxPlayers }) + (c.table ? '<br>' + tableLine(c.table) : '') + '</p>';
  if (flash) { h += '<div class="msg ' + (flash.bad ? 'bad' : 'ok') + '" role="status">' + flash.html + '</div>'; flash = null; }
  // The table, once the director has opened it.
  const lv = c.table_live;
  if (c.phase === 'table' && lv) {
    h += '<p class="live">' + (lv.status === 'running' ? T('liveRunning', { hand: lv.hand || 1 })
      : lv.phase === 'watch' ? T('liveWait') : T('liveOpen', { table: lv.tableName || c.name, server: c.server || '' })) + '</p>';
  }
  h += '</section>';

  if (c.phase === 'upcoming' || c.phase === 'table') {
    const at = c.autoOpen && c.startsAt ? c.startsAt - (c.openBefore || 0) * 60000 : null;
    h += '<section class="card"><h2>' + T('howTitle') + '</h2><ol class="how"><li>' + T('how1') + '</li><li>' +
      (at ? T('how2At', { time: fmtTime(at) }) : T('how2')) + '</li><li>' + T('how3') + '</li><li>' + T('how4') + '</li></ol></section>';
  }

  // Players.
  h += '<section class="card"><h2>' + T('playersTitle') + ' <span class="muted small">' + T('players', { n: c.players, max: c.maxPlayers }) + '</span></h2>';
  h += c.playerList.length ? '<ul class="chips">' + c.playerList.map((p) => '<li>' + esc(p.nick) + (p.absent ? ' <span class="chip bad">' + T('absent') + '</span>' : '') +
    (mineSet.has(p.nick.toLowerCase()) ? ' <span class="chip done">' + T('you') + '</span>' : '') + '</li>').join('') + '</ul>' : '<p class="empty">' + T('noPlayers') + '</p>';
  h += '</section>';

  // Registration.
  if (!c.result) {
    h += '<section class="card"><h2>' + T('regTitle') + '</h2>';
    if (c.closedBecause) h += '<p>' + T('closed_' + c.closedBecause) + '</p>';
    else {
      h += '<form id="regForm" class="row"><div><label for="regNick">' + T('nickname') + '</label><input id="regNick" maxlength="64" autocomplete="nickname" required></div>' +
        '<button type="submit" class="primary">' + T('register') + '</button></form><p class="small muted">' + T('nickHint') + '</p>';
    }
    // Unregister: one button per registration kept here; otherwise by code.
    if (!c.closedBecause || c.closedBecause === 'full' || c.closedBecause === 'organizer') {
      const here = mine.filter((r) => c.playerList.some((p) => p.nick.toLowerCase() === r.nick.toLowerCase()));
      if (here.length) h += '<div class="actions">' + here.map((r) => '<button type="button" data-unreg="' + esc(r.nick) + '">' + T('unregister') + ' · ' + esc(r.nick) + '</button>').join('') + '</div>';
      h += '<details class="sub"><summary>' + T('unregTitle') + '</summary><p class="small muted">' + T('unregHint') + '</p><form id="unregForm" class="row">' +
        '<div><label for="unNick">' + T('nickname') + '</label><input id="unNick" maxlength="64" required></div>' +
        '<div><label for="unCode">' + T('code') + '</label><input id="unCode" maxlength="16" autocomplete="off" required></div>' +
        '<button type="submit">' + T('unregister') + '</button></form></details>';
    }
    h += '</section>';
  }

  // Result.
  if (c.result) {
    const r = c.result;
    h += '<section class="card"><h2>' + T('resultTitle') + '</h2><div class="tablewrap"><table><thead><tr><th class="num">' + T('colPlace') + '</th><th>' + T('colPlayer') + '</th><th class="num">' + T('colOut') + '</th></tr></thead><tbody>' +
      r.ranking.map((x) => '<tr><td class="num">' + x.place + '</td><td>' + esc(x.nick) + (x.winner ? ' <span class="chip done">♛</span>' : '') + '</td><td class="num">' + (x.winner ? '—' : x.elimHand != null ? x.elimHand : '') + '</td></tr>').join('') +
      '</tbody></table></div>';
    if (r.absent && r.absent.length) h += '<p class="small">' + T('absentList', { list: r.absent.map(esc).join(', ') }) + '</p>';
    h += '<p class="small">' + T(c.phase === 'validated' ? 'resValidated' : 'resWaiting') + (r.corrected ? ' ' + T('resCorrected') : '') + '</p>';
    for (const k of c.corrections || []) h += '<p class="small muted">' + T('correction', { reason: esc(k.reason) }) + '</p>';
    if (c.sealed) {
      h += '<details class="sub"><summary>' + T('checkTitle') + '</summary><p class="small mono">' + T('signedBy', { key: c.sealed.signedBy || '—' }) + ' (' + T(c.sealed.signature ? 'sigOk' : 'sigBad') + ')<br>' + T('head', { head: c.sealed.head }) + '</p>' +
        '<div class="actions"><a class="btn" href="/tournament/api/t/' + esc(c.key) + '/file?which=journal' + invQs('&') + '" download>' + T('dlJournal') + '</a>' +
        '<a class="btn" href="/tournament/api/t/' + esc(c.key) + '/file?which=result' + invQs('&') + '" download>' + T('dlResult') + '</a></div></details>';
    }
    h += '</section>';
  }
  $('view').innerHTML = h;
  $('heroTitle').textContent = c.name;
  wire();
}
function invQs(sep) { const i = inviteFromUrl(); return i ? sep + 'invite=' + encodeURIComponent(i) : ''; }
function errText(d) { return T('err_' + (['badNick', 'taken', 'badCode', 'tooMany', 'notFound'].indexOf(d.code) >= 0 ? d.code : 'error')); }
function wire() {
  const reg = $('regForm');
  if (reg) reg.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const nick = $('regNick').value.trim();
    const btn = reg.querySelector('button'); btn.disabled = true;
    const d = await api('/t/' + cur.key + '/register', { nick, invite: inviteFromUrl() || undefined });
    btn.disabled = false;
    if (!d.ok) { flash = { bad: true, html: /^closed_/.test(d.code || '') ? T(d.code) : errText(d) }; renderOne(); return; }
    regsSave(cur.key, regsFor(cur.key).filter((r) => r.nick.toLowerCase() !== d.nick.toLowerCase()).concat([{ nick: d.nick, code: d.code }]));
    cur = d.tournament;
    flash = { html: T('registered', { nick: d.nick }) + '<br><b>' + T('yourCode', { code: d.code }) + '</b> <button type="button" class="mini" data-copy="' + esc(d.code) + '">' + T('copy') + '</button><br><span class="small">' + T('codeKeep') + '</span>' };
    renderOne();
  });
  const doUnreg = async (nick, code) => {
    const d = await api('/t/' + cur.key + '/unregister', { nick, code, invite: inviteFromUrl() || undefined });
    if (!d.ok) { flash = { bad: true, html: /^closed_/.test(d.code || '') ? T(d.code) : errText(d) }; renderOne(); return; }
    regsSave(cur.key, regsFor(cur.key).filter((r) => r.nick.toLowerCase() !== d.nick.toLowerCase()));
    cur = d.tournament;
    flash = { html: T('unregistered', { nick: d.nick }) };
    renderOne();
  };
  document.querySelectorAll('[data-unreg]').forEach((b) => b.addEventListener('click', () => {
    const r = regsFor(cur.key).find((x) => x.nick === b.dataset.unreg);
    if (r) doUnreg(r.nick, r.code);
  }));
  const un = $('unregForm');
  if (un) un.addEventListener('submit', (ev) => { ev.preventDefault(); doUnreg($('unNick').value.trim(), $('unCode').value.trim()); });
}

// ── routing ────────────────────────────────────────────────────────
function route() {
  clearTimeout(pollTimer);
  curKey = null; cur = null;
  $('heroTitle').textContent = t('title');
  const key = keyFromPath();
  if (key) showOne(key); else showList();
  window.scrollTo(0, 0);
}
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[data-go]');
  if (a && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey) { ev.preventDefault(); go(a.getAttribute('href')); return; }
  const cp = ev.target.closest('[data-copy]');
  if (cp) { try { navigator.clipboard.writeText(cp.dataset.copy); cp.textContent = t('copied'); } catch (e) {} }
});
window.addEventListener('popstate', route);

// ── start ──────────────────────────────────────────────────────────
let theme = null;
(async function start() {
  try { EN = (await import('/tournament/lang/en.mjs')).strings || {}; } catch (e) { EN = {}; }
  try { meta = (await import('/modules/lang-meta.mjs')).LANG_META || meta; } catch (e) {}
  const avail = Object.keys(meta);
  const code = pickLang(avail);
  const sel = $('langSel');
  sel.innerHTML = avail.map((c) => '<option value="' + esc(c) + '">' + esc(meta[c].label || c) + '</option>').join('');
  sel.value = code;
  sel.addEventListener('change', async () => {
    lsSet('pth_lang', sel.value);   // the same choice as the app's
    await loadLang(sel.value);
    if (cur) renderOne(); else route();
  });
  theme = initTheme($('themeBtn'), (m) => t(m === 'dark' ? 'themeDark' : m === 'light' ? 'themeLight' : 'themeAuto'));
  await loadLang(code);
  route();
})();
