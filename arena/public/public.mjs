// ═══════════════════════════════════════════════════════════════════
// /arena — the players' page (2026-10-23).
//
//   /arena            public tournaments: open, playing, coming, finished
//   /arena/t/<key>    one tournament (also unlisted ones, by their link;
//                          a private one asks for its invitation code)
//
// Registration with a PokerTH nickname; the personal code it returns is kept
// in this browser (pth_td_regs) and is what unregistering asks for — and the
// check-in, with the identity « code » (Official): in a window before the
// start each player confirms with that code; only they are invited.
// Every language of the app: the list comes from /modules/lang-meta.mjs (the
// web client's), the texts from /arena/lang/<code>.mjs, falling back
// to English, then to the key. Talks to /arena/api/* (no token).
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
  try { L = (await import('/arena/lang/' + file + '.mjs')).strings || {}; } catch (e) { L = {}; }
  lang = code;
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.indexOf(code.split('-')[0]) >= 0 ? 'rtl' : 'ltr';
  document.title = 'Arena (' + t('beta') + ') · PokerTH';
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-t-title]').forEach((el) => { el.title = t(el.dataset.tTitle); });
  theme && theme.refresh();
}

// ── data ───────────────────────────────────────────────────────────
function api(path, body) {
  const o = { cache: 'no-store', headers: {} };
  if (body) { o.method = 'POST'; o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(body); }
  return fetch('/arena/api' + path, o).then((r) => r.json().catch(() => ({ ok: false, code: 'error' })));
}
const fmtDate = (ts) => { try { return new Intl.DateTimeFormat(lang, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(ts)); } catch (e) { return new Date(ts).toLocaleString(); } };
const fmtTime = (ts) => { try { return new Intl.DateTimeFormat(lang, { timeStyle: 'short' }).format(new Date(ts)); } catch (e) { return new Date(ts).toLocaleTimeString(); } };
function chip(c) {
  if (c.phase === 'validated') return '<span class="chip done">' + T('stValidated') + '</span>';
  if (c.phase === 'finished') return '<span class="chip warn">' + T('stFinished') + '</span>';
  if (c.phase === 'table') return '<span class="chip live">' + T('stTable') + '</span>';
  return c.registration === 'open' ? '<span class="chip live">' + T('stRegOpen') + '</span>' : '<span class="chip">' + T('stRegClosed') + '</span>';
}
function playerFromPath() { const m = /^\/arena\/p\/([^/]{1,200})$/.exec(location.pathname); if (!m) return null; try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; } }
function cupKeyFromPath() { const m = /^\/arena\/c\/([A-Za-z0-9_-]{8,40})\/?$/.exec(location.pathname); return m ? m[1] : null; }
function keyFromPath() { const m = /^\/arena\/t\/([A-Za-z0-9_-]{8,40})\/?$/.exec(location.pathname); return m ? m[1] : null; }
function inviteFromUrl() { try { return new URLSearchParams(location.search).get('invite') || ''; } catch (e) { return ''; } }
function go(path) { history.pushState(null, '', path); route(); }

// ── list ───────────────────────────────────────────────────────────
// The image of a tournament or a cup: its thumbnail on the cards, the
// picture at the top of its page (the director's avatar elsewhere).
const thumb = (c) => (c.thumb ? '<img class="tc-img" src="' + esc(c.thumb) + '" alt="" loading="lazy" width="64" height="64">' : '');
function heroImage(url) {
  const i = $('heroImg');
  if (!i) return;
  if (url) { if (i.getAttribute('src') !== url) i.src = url; i.classList.add('evimg'); }
  else { if (i.getAttribute('src') !== '/arena/avatar') i.src = '/arena/avatar'; i.classList.remove('evimg'); }
}
function card(c) {
  return '<li><a class="tcard' + (c.thumb ? ' has-img' : '') + '" href="/arena/t/' + esc(c.key) + '" data-go>' + thumb(c) + '<span class="tc-body">' +
    '<span class="tc-top"><span class="tname">' + esc(c.name) + '</span>' + chip(c) + '</span>' +
    '<span class="muted small">' + (c.startsAt ? T('startsAt', { date: fmtDate(c.startsAt) }) : T('noDate')) +
    (c.server ? ' · ' + T('onServer', { server: c.server }) : '') + ' · ' + T('players', { n: c.players, max: c.maxPlayers }) +
    (c.winner ? ' · ' + T('winner', { nick: c.winner }) : '') + '</span></span></a></li>';
}
async function showList() {
  $('view').innerHTML = '<p class="empty">' + T('loading') + '</p>';
  const [d, dc] = await Promise.all([api('/list'), api('/cups')]);
  if (!d.ok) { $('view').innerHTML = '<p class="msg bad">' + T('err_error') + '</p>'; return; }
  const all = d.tournaments || [];
  const cupList = (dc && dc.ok && dc.cups) || [];
  const groups = [
    ['secLive', all.filter((c) => c.phase === 'table')],
    ['secOpen', all.filter((c) => c.phase === 'upcoming' && c.registration === 'open')],
    ['secUpcoming', all.filter((c) => c.phase === 'upcoming' && c.registration !== 'open')],
    ['secDone', all.filter((c) => c.phase === 'finished' || c.phase === 'validated')],
  ].filter((g) => g[1].length);
  // Coming soonest first; finished ones, latest first (as sent).
  for (const g of groups) if (g[0] !== 'secDone') g[1].sort((a, b) => (a.startsAt || Infinity) - (b.startsAt || Infinity));
  const cupsHtml = cupList.length ? '<section class="card"><h2>' + T('secCups') + '</h2><ul class="tlist">' + cupList.map((c) => '<li><a class="tcard' + (c.thumb ? ' has-img' : '') + '" href="/arena/c/' + esc(c.key) + '" data-go>' + thumb(c) + '<span class="tc-body">' +
    '<span class="tc-top"><span class="tname">' + esc(c.name) + '</span><span class="chip ' + (c.status === 'closed' ? 'done' : 'live') + '">' + T(c.status === 'closed' ? 'cupStatusClosed' : 'cupStatusOpen') + '</span></span>' +
    '<span class="muted small">' + T('cupEvents', { n: c.events }) + (c.leader ? ' · ' + T('cupLeader', { nick: esc(c.leader) }) : '') + '</span></span></a></li>').join('') + '</ul></section>' : '';
  $('view').innerHTML = (groups.length ? groups.map((g) => '<section class="card"><h2>' + T(g[0]) + '</h2><ul class="tlist">' + g[1].map(card).join('') + '</ul></section>').join('')
    : '<section class="card"><p class="empty">' + T('none') + '</p></section>') + cupsHtml;
}

// ── one tournament ─────────────────────────────────────────────────
let cur = null, curKey = null, pollTimer = null, flash = null, logOpen = false;
async function showOne(key) {
  curKey = key;
  const inv = inviteFromUrl();
  const d = await api('/t/' + key + (inv ? '?invite=' + encodeURIComponent(inv) : ''));
  if (curKey !== key) return;
  if (!d.ok) {
    if (d.code === 'private') return renderPrivate(key, !!inv);
    $('view').innerHTML = '<p><a href="/arena" data-go>← ' + T('allTournaments') + '</a></p><section class="card"><p class="msg bad">' + T('err_' + (d.code === 'notFound' ? 'notFound' : 'error')) + '</p></section>';
    return;
  }
  cur = d;
  renderOne();
  clearTimeout(pollTimer);
  if (d.phase === 'table' || d.phase === 'upcoming') pollTimer = setTimeout(function tick() {
    if (curKey !== key) return;
    // Not while the player is typing in a form: try again a bit later.
    const a = document.activeElement;
    if ((a && a.tagName === 'INPUT' && $('view').contains(a) && a.value) || ($('logBox') && $('logBox').open)) { pollTimer = setTimeout(tick, 5000); return; }
    showOne(key);
  }, d.phase === 'table' ? 5000 : 30000);
}
function renderPrivate(key, tried, base) {
  $('view').innerHTML = '<p><a href="/arena" data-go>← ' + T('allTournaments') + '</a></p><section class="card"><h2>' + T('privateTitle') + '</h2>' +
    '<p>' + T('privateText') + '</p>' + (tried ? '<p class="msg bad">' + T('err_notFound') + '</p>' : '') +
    '<form id="invForm" class="row"><div><label for="invIn">' + T('inviteCode') + '</label><input id="invIn" autocomplete="off" required></div><button type="submit" class="primary">' + T('open') + '</button></form></section>';
  $('invForm').addEventListener('submit', (ev) => { ev.preventDefault(); go((base || '/arena/t/') + key + '?invite=' + encodeURIComponent($('invIn').value.trim())); });
}
function tableLine(tb) {
  if (!tb) return '';
  return T(tb.raiseMode === 'minutes' ? 'tableSettingsMin' : 'tableSettings', { stack: tb.startMoney, sb: tb.firstSmallBlind, bb: tb.firstSmallBlind * 2, n: tb.raiseEvery, t: tb.actionTimeout });
}
function renderOne() {
  const c = cur, mine = regsFor(c.key);
  const mineSet = new Set(mine.map((r) => r.nick.toLowerCase()));
  let h = '<p><a href="/arena" data-go>← ' + T('allTournaments') + '</a></p>';
  h += '<section class="card"><h2>' + esc(c.name) + '</h2><p>' + chip(c) + '</p><p class="small">' +
    (c.startsAt ? T('startsAt', { date: fmtDate(c.startsAt) }) : T('noDate')) + (c.server ? ' · ' + T('onServer', { server: c.server }) : '') + '<br>' +
    T('format') + ' · ' + T('players', { n: c.players, max: c.maxPlayers }) + (c.table ? '<br>' + tableLine(c.table) : '') + '</p>';
  for (const cp of c.cups || []) h += '<p class="small"><a href="/arena/c/' + esc(cp.key) + '" data-go>' + T('partOfCup', { name: esc(cp.name) }) + '</a></p>';
  if (c.parent) h += '<p class="small"><a href="/arena/t/' + esc(c.parent.key) + invQs('?') + '" data-go>' + (c.stage && c.stage.kind === 'final' ? T('finalOf', { name: esc(c.parent.name) }) : T('tableOf', { n: c.stage ? c.stage.index : '', name: esc(c.parent.name) })) + '</a></p>';
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
    const ck = c.checkIn && c.checkIn.needed ? '<li>' + (c.checkIn.opensAt ? T('checkInHow', { time: fmtTime(c.checkIn.opensAt) }) : T('checkInHowNoTime')) + '</li>' : '';
    const mt = c.multi ? '<li>' + T('howMulti', { n: c.multi.finalists }) + '</li>' : '';
    h += '<section class="card"><h2>' + T('howTitle') + '</h2><ol class="how"><li>' + T('how1') + '</li>' + ck + mt + '<li>' +
      (at ? T('how2At', { time: fmtTime(at) }) : T('how2')) + '</li><li>' + T('how3') + '</li><li>' + T('how4') + '</li>' +
      (c.witnesses ? '<li>' + T('howWitness') + '</li>' : '') + '</ol></section>';
  }

  // Several tables: the tables and the final, each with its own page.
  if (c.multi && c.multi.tables) {
    const fin = new Set((c.multi.finalistsSoFar || []).map((x) => x.toLowerCase()));
    const row = (x, label) => '<li><a class="tcard" href="/arena/t/' + esc(x.key) + invQs('?') + '" data-go><span class="tc-top"><span class="tname">' + label + '</span>' + chip(x) + '</span>' +
      '<span class="muted small">' + x.playerList.map((n) => esc(n) + (fin.has(n.toLowerCase()) && !(c.multi.final && x.key === c.multi.final.key) ? ' ✓' : '')).join(', ') + (x.winner ? ' · ' + T('winner', { nick: esc(x.winner) }) : '') + '</span></a></li>';
    h += '<section class="card"><h2>' + T('tablesTitle') + '</h2><ul class="tlist">' + c.multi.tables.map((x) => row(x, T('tableN', { n: x.index }))).join('') +
      (c.multi.final ? row(c.multi.final, '<b>' + T('finalTable') + '</b>') : '') + '</ul>' +
      (!c.multi.final ? '<p class="small muted">' + T('howMulti', { n: c.multi.finalists }) + ' ✓ = ' + T('qualified') + '</p>' : '') + '</section>';
  }

  // Players.
  h += '<section class="card"><h2>' + T('playersTitle') + ' <span class="muted small">' + T('players', { n: c.players, max: c.maxPlayers }) + '</span></h2>';
  const ckOn = !!(c.checkIn && c.checkIn.needed && !c.result);
  h += c.playerList.length ? '<ul class="chips">' + c.playerList.map((p) => '<li>' + esc(p.nick) + (p.absent ? ' <span class="chip bad">' + T('absent') + '</span>' : '') +
    (ckOn && p.checkedIn && !p.absent ? ' <span class="chip live">' + T('checkedIn') + '</span>' : '') +
    (mineSet.has(p.nick.toLowerCase()) ? ' <span class="chip done">' + T('you') + '</span>' : '') + '</li>').join('') + '</ul>' : '<p class="empty">' + T('noPlayers') + '</p>';
  h += '</section>';

  // Check-in (identity « code »): a window before the start, then closed.
  if (ckOn && !c.checkIn.closed) {
    const ci = c.checkIn;
    h += '<section class="card" id="ckCard"><h2>' + T('checkInTitle') + ' <span class="muted small">' + T('checkInCount', { n: ci.count, of: ci.of }) + '</span></h2>';
    if (!ci.open) h += '<p>' + T('checkInOpensAt', { date: fmtDate(ci.opensAt) }) + '</p>';
    else {
      h += '<p>' + T('checkInOpen') + '</p>';
      const todo = mine.filter((r) => c.playerList.some((p) => p.nick.toLowerCase() === r.nick.toLowerCase() && !p.checkedIn));
      if (todo.length) h += '<div class="actions">' + todo.map((r) => '<button type="button" class="primary" data-ckin="' + esc(r.nick) + '">' + T('checkIn') + ' · ' + esc(r.nick) + '</button>').join('') + '</div>';
      h += '<form id="ckForm" class="row"><div><label for="ckNick">' + T('nickname') + '</label><input id="ckNick" maxlength="64" autocomplete="nickname" required></div>' +
        '<div><label for="ckCode">' + T('code') + '</label><input id="ckCode" maxlength="16" autocomplete="off" required></div>' +
        '<button type="submit"' + (todo.length ? '' : ' class="primary"') + '>' + T('checkIn') + '</button></form><p class="small muted">' + T('checkInCodeHint') + '</p>';
    }
    h += '</section>';
  }

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

  // Witnesses: what the web clients at the table saw, against the director.
  const W = c.witnesses;
  if (W && (W.total || c.result || c.phase === 'table')) {
    const VK = { agrees: ['wAgrees', 'live'], disagrees: ['wDisagrees', 'bad'], nothing: ['wNothing', ''], pending: ['wPending', 'warn'] };
    h += '<section class="card"><h2>' + T('witnessTitle') + (W.total ? ' <span class="muted small">' + T('witnessCount', { agree: W.agree, disagree: W.disagree }) + '</span>' : '') + '</h2>';
    h += W.list.length ? '<ul class="chips">' + W.list.map((w) => { const v = VK[w.verdict] || [w.verdict, '']; return '<li>' + esc(w.nick) + ' <span class="chip ' + v[1] + '">' + T(v[0]) + '</span>' + (w.log ? ' <span class="chip">' + T('wLog') + '</span>' : '') + (w.counts ? '' : ' <span class="chip">' + T('wNoCode') + '</span>') + '</li>'; }).join('') + '</ul>'
      : '<p class="empty">' + T('witnessNone') + '</p>';
    if (W.mode === 'required' && !W.override && c.phase !== 'validated') h += '<p class="small muted">' + T('witnessRequired') + '</p>';
    if (W.override) h += '<p class="small">' + T('witnessOverride', { reason: esc(W.override.reason) }) + '</p>';
    // QML players: their log (.pdb), after the game, when the tournament takes it.
    if (W.logs && (c.phase === 'table' || c.phase === 'finished')) {
      h += '<details class="sub" id="logBox"' + (logOpen ? ' open' : '') + '><summary>' + T('logTitle') + '</summary><p class="small">' + T('logText') + '</p><p class="small muted">' + T('logWhere') + '</p>' +
        '<form id="logForm" class="row"><div><label for="logNick">' + T('nickname') + '</label><input id="logNick" maxlength="64" autocomplete="nickname" required></div>' +
        (c.identity === 'code' ? '<div><label for="logCode">' + T('code') + '</label><input id="logCode" maxlength="16" autocomplete="off"></div>' : '') +
        '<div><label for="logFile">' + T('logFile') + '</label><input id="logFile" type="file" accept=".pdb,application/octet-stream" required></div>' +
        '<button type="submit">' + T('logSend') + '</button></form></details>';
    }
    h += '</section>';
  }

  // Result.
  if (c.result) {
    const r = c.result;
    h += '<section class="card"><h2>' + T('resultTitle') + '</h2><div class="tablewrap"><table><thead><tr><th class="num">' + T('colPlace') + '</th><th>' + T('colPlayer') + '</th><th class="num">' + T('colOut') + '</th></tr></thead><tbody>' +
      r.ranking.map((x) => '<tr><td class="num">' + x.place + '</td><td>' + nickLink(x.nick) + (x.winner ? ' <span class="chip done">♛</span>' : '') + '</td><td class="num">' + (x.winner ? '—' : x.elimHand != null ? x.elimHand : '') + '</td></tr>').join('') +
      '</tbody></table></div>';
    if (r.absent && r.absent.length) h += '<p class="small">' + T('absentList', { list: r.absent.map(esc).join(', ') }) + '</p>';
    h += '<p class="small">' + T(c.phase === 'validated' ? 'resValidated' : 'resWaiting') + (r.corrected ? ' ' + T('resCorrected') : '') + '</p>';
    for (const k of c.corrections || []) h += '<p class="small muted">' + T('correction', { reason: esc(k.reason) }) + '</p>';
    if (c.sealed) {
      h += '<details class="sub"><summary>' + T('checkTitle') + '</summary><p class="small mono">' + T('signedBy', { key: c.sealed.signedBy || '—' }) + ' (' + T(c.sealed.signature ? 'sigOk' : 'sigBad') + ')<br>' + T('head', { head: c.sealed.head }) + '</p>' +
        '<div class="actions"><a class="btn" href="/arena/api/t/' + esc(c.key) + '/file?which=journal' + invQs('&') + '" download>' + T('dlJournal') + '</a>' +
        '<a class="btn" href="/arena/api/t/' + esc(c.key) + '/file?which=result' + invQs('&') + '" download>' + T('dlResult') + '</a></div></details>';
    }
    h += '</section>';
  }
  $('view').innerHTML = h;
  $('heroTitle').textContent = c.name;
  heroImage(c.image);
  fillMedals();
  wire();
}
// The invitation code, carried to the pages of a private tournament's tables.
function invQs(sep) { const i = inviteFromUrl(); return i ? sep + 'invite=' + encodeURIComponent(i) : ''; }
function errText(d) { return T('err_' + (['badNick', 'taken', 'badCode', 'tooMany', 'notFound', 'checkInNotYet', 'checkInClosed', 'noCheckIn', 'alreadyIn', 'notPdb', 'noGame', 'noLogWitness', 'notPlayer', 'tooLarge'].indexOf(d.code) >= 0 ? d.code : 'error')); }
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
    flash = { html: T('registered', { nick: d.nick }) + '<br><b>' + T('yourCode', { code: d.code }) + '</b> <button type="button" class="mini" data-copy="' + esc(d.code) + '">' + T('copy') + '</button><br><span class="small">' + T(cur.checkIn && cur.checkIn.needed ? 'codeKeepCheckIn' : 'codeKeep') + '</span>' };
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
  const doCheckIn = async (nick, code) => {
    const d = await api('/t/' + cur.key + '/checkin', { nick, code, invite: inviteFromUrl() || undefined });
    if (!d.ok) { flash = { bad: true, html: errText(d) }; renderOne(); return; }
    // The code typed here is kept too: the web client sends it with its
    // witness report, so that the report counts.
    if (!regsFor(cur.key).some((r) => r.nick.toLowerCase() === d.nick.toLowerCase())) regsSave(cur.key, regsFor(cur.key).concat([{ nick: d.nick, code: String(code).toUpperCase() }]));
    cur = d.tournament;
    flash = { html: T('checkedInDone', { nick: d.nick }) };
    renderOne();
  };
  document.querySelectorAll('[data-ckin]').forEach((b) => b.addEventListener('click', () => {
    const r = regsFor(cur.key).find((x) => x.nick === b.dataset.ckin);
    if (r) { b.disabled = true; doCheckIn(r.nick, r.code); }
  }));
  const ck = $('ckForm');
  if (ck) ck.addEventListener('submit', (ev) => { ev.preventDefault(); doCheckIn($('ckNick').value.trim(), $('ckCode').value.trim()); });
  const lf = $('logForm');
  if (lf) lf.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const file = $('logFile').files && $('logFile').files[0];
    if (!file) return;
    logOpen = true;
    if (file.size > 10 * 1024 * 1024) { flash = { bad: true, html: T('err_tooLarge') }; renderOne(); return; }
    const btn = lf.querySelector('button'); btn.disabled = true;
    const rd = new FileReader();
    rd.onload = async () => {
      const b64 = String(rd.result || '').replace(/^data:[^,]*,/, '');
      const nick = $('logNick').value.trim(), code = $('logCode') ? $('logCode').value.trim() : '';
      const known = regsFor(cur.key).find((r) => r.nick.toLowerCase() === nick.toLowerCase());
      const d = await api('/t/' + cur.key + '/witnesslog', { nick, code: code || (known && known.code) || undefined, invite: inviteFromUrl() || undefined, log: b64 });
      if (!d.ok) { flash = { bad: true, html: /^closed_/.test(d.code || '') ? T(d.code) : errText(d) }; renderOne(); return; }
      const VK = { agrees: 'wAgrees', disagrees: 'wDisagrees', nothing: 'wNothing', pending: 'wPending' };
      flash = { html: T('logSent', { nick: d.nick, verdict: T(VK[d.verdict] || 'wNothing') }) };
      showOne(cur.key);
    };
    rd.onerror = () => { btn.disabled = false; flash = { bad: true, html: T('err_error') }; renderOne(); };
    rd.readAsDataURL(file);
  });
  const un = $('unregForm');
  if (un) un.addEventListener('submit', (ev) => { ev.preventDefault(); doUnreg($('unNick').value.trim(), $('unCode').value.trim()); });
}

// ── medals ─────────────────────────────────────────────────────────
// A nickname links to its player's page, with its medals after it (one
// request per page for every name on it: /arena/api/badges?nicks=…).
const MEDAL = { gold: '🥇', silver: '🥈', bronze: '🥉' };
function nickLink(nick) { return '<a class="nick" href="/arena/p/' + encodeURIComponent(nick) + '" data-go>' + esc(nick) + '</a><span class="md" data-nick="' + esc(nick) + '"></span>'; }
const medalCache = new Map();
async function fillMedals() {
  const slots = [...document.querySelectorAll('#view .md[data-nick]')];
  const want = [...new Set(slots.map((s) => s.dataset.nick))].filter((n) => !medalCache.has(n.toLowerCase()));
  if (want.length) {
    const d = await api('/badges?nicks=' + encodeURIComponent(want.slice(0, 100).join(',')));
    for (const n of want) medalCache.set(n.toLowerCase(), null);
    if (d && d.ok) for (const [n, v] of Object.entries(d.players || {})) medalCache.set(n.toLowerCase(), v.counts);
  }
  for (const s of slots) {
    const c = medalCache.get(s.dataset.nick.toLowerCase());
    if (!c) continue;
    const parts = ['gold', 'silver', 'bronze'].filter((k) => c[k]).map((k) => MEDAL[k] + (c[k] > 1 ? '×' + c[k] : ''));
    s.textContent = parts.length ? ' ' + parts.join(' ') : '';
    s.title = T('medalsOf', { gold: c.gold, silver: c.silver, bronze: c.bronze });
  }
}
// A player's page: medals, then every tournament and cup with a place.
async function showPlayer(nick) {
  curKey = 'p:' + nick;
  const d = await api('/players/' + encodeURIComponent(nick));
  if (curKey !== 'p:' + nick) return;
  if (!d.ok) { $('view').innerHTML = '<p class="msg bad">' + T('err_error') + '</p>'; return; }
  const day = (ts) => { try { return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(ts)); } catch (e) { return new Date(ts).toLocaleDateString(); } };
  const link = (x) => (x.key ? '<a href="/arena/' + (x.kind === 'cup' ? 'c/' : 't/') + esc(x.key) + '" data-go>' + esc(x.name) + '</a>' : esc(x.name));
  let h = '<p><a href="/arena" data-go>← ' + T('allTournaments') + '</a></p>';
  h += '<section class="card"><h2>' + T('medalsTitle') + '</h2>';
  h += '<p class="medals">' + ['gold', 'silver', 'bronze'].map((k) => '<span class="medal ' + k + '"><span aria-hidden="true">' + MEDAL[k] + '</span> ' + T('medal_' + k) + ' <b>' + d.counts[k] + '</b></span>').join('') + '</p>';
  h += d.medals.length ? '<ul class="tlist">' + d.medals.map((m) => '<li class="medalrow"><span class="big" aria-hidden="true">' + MEDAL[m.medal] + '</span><span><b>' + link(m) + '</b><br><span class="muted small">' + T(m.kind === 'cup' ? 'kindCup' : 'kindTournament') + ' · ' + T('placeOf', { place: m.place, of: m.of }) + (m.at ? ' · ' + day(m.at) : '') + '</span></span></li>').join('') + '</ul>'
    : '<p class="empty">' + T('noMedal') + '</p>';
  h += '<p class="small muted">' + T('medalRules') + '</p></section>';
  if (d.results.length) {
    h += '<section class="card"><h2>' + T('resultsTitle') + '</h2><div class="tablewrap"><table><thead><tr><th>' + T('colDate') + '</th><th>' + T('colEvent') + '</th><th class="num">' + T('colPlace') + '</th></tr></thead><tbody>' +
      d.results.map((x) => '<tr><td>' + (x.at ? day(x.at) : '') + '</td><td>' + link(x) + ' <span class="muted small">' + T(x.kind === 'cup' ? 'kindCup' : 'kindTournament') + '</span></td><td class="num">' + T('placeOf', { place: x.place, of: x.of }) + '</td></tr>').join('') + '</tbody></table></div></section>';
  }
  $('view').innerHTML = h;
  $('heroTitle').textContent = d.nick;
}

// ── a cup ──────────────────────────────────────────────────────────
// Its tournaments (each with its page), how the points are counted, the
// standings (points per tournament, the ones not counted in brackets).
async function showCup(key) {
  curKey = key;
  const inv = inviteFromUrl();
  const d = await api('/c/' + key + (inv ? '?invite=' + encodeURIComponent(inv) : ''));
  if (curKey !== key) return;
  if (!d.ok) {
    if (d.code === 'private') return renderPrivate(key, !!inv, '/arena/c/');
    $('view').innerHTML = '<p><a href="/arena" data-go>← ' + T('allTournaments') + '</a></p><section class="card"><p class="msg bad">' + T('err_notFound') + '</p></section>';
    return;
  }
  const fmt = (x) => (Math.round(x * 10) / 10).toLocaleString(lang);
  let h = '<p><a href="/arena" data-go>← ' + T('allTournaments') + '</a></p>';
  h += '<section class="card"><h2>' + esc(d.name) + '</h2><p><span class="chip ' + (d.status === 'closed' ? 'done' : 'live') + '">' + T(d.status === 'closed' ? 'cupStatusClosed' : 'cupStatusOpen') + '</span></p>' +
    (d.description ? '<p>' + esc(d.description) + '</p>' : '') +
    '<p class="small">' + T('cupRulesPoints') + ' ' + (d.bestOf ? T('cupBest', { n: d.bestOf }) : T('cupAll')) + ' ' + T('cupTies') + '</p></section>';
  // Its tournaments.
  h += '<section class="card"><h2>' + T('cupTournaments') + '</h2><ul class="tlist">' + d.events.map((e) => {
    const extra = [];
    if (e.qualify && e.next != null && d.events[e.next]) extra.push(T('cupGoOn', { n: e.qualify, name: esc(d.events[e.next].label) }));
    if (e.final) extra.push(T('cupFinal') + (e.fromStandings ? ' · ' + T('cupFromStandings', { n: e.fromStandings }) : ''));
    if (!e.counts) extra.push(T('notCounted'));
    return '<li><a class="tcard" href="/arena/t/' + esc(e.key) + invQs('?') + '" data-go><span class="tc-top"><span class="tname">' + esc(e.label) + '</span>' +
      '<span class="chip ' + (e.validated ? 'done' : e.status === 'running' ? 'live' : '') + '">' + T(e.validated ? 'stValidated' : e.status === 'running' ? 'stTable' : 'cupStatusOpen') + '</span></span>' +
      '<span class="muted small">' + T('cupPlayers', { n: e.players }) + (extra.length ? ' · ' + extra.join(' · ') : '') + '</span></a></li>';
  }).join('') + '</ul></section>';
  // Standings.
  const evs = d.events.filter((e) => e.counts);
  h += '<section class="card"><h2>' + T('cupStandings') + '</h2>';
  if (d.standings.length) {
    h += '<div class="tablewrap"><table><thead><tr><th class="num">' + T('colPlace') + '</th><th>' + T('colPlayer') + '</th><th class="num">' + T('colPoints') + '</th>' +
      evs.map((e) => '<th class="num" title="' + esc(e.label) + '">' + (e.index + 1) + '</th>').join('') + '</tr></thead><tbody>' +
      d.standings.map((r) => '<tr><td class="num">' + r.place + (r.tie ? '=' : '') + '</td><td>' + nickLink(r.nick) + (r.place === 1 && d.status === 'closed' ? ' <span class="chip done">♛</span>' : '') + (r.final != null ? ' <span class="chip">' + T('cupFinal') + ' ' + r.final + '</span>' : '') + '</td><td class="num"><b>' + fmt(r.total) + '</b></td>' +
        evs.map((e) => { const x = r.results.find((y) => y.event === e.index); return '<td class="num">' + (x ? (x.counted ? fmt(x.points) : '<span class="muted" title="' + T('notCounted') + '">(' + fmt(x.points) + ')</span>') : '') + '</td>'; }).join('') + '</tr>').join('') +
      '</tbody></table></div><p class="small muted">' + evs.map((e) => (e.index + 1) + ' = ' + esc(e.label)).join(' · ') + '</p>';
  } else h += '<p class="empty">' + T('cupNoResult') + '</p>';
  if (d.sealed) h += '<p class="small">' + T('cupClosed') + ' <span class="mono">' + T('signedBy', { key: d.sealed.signedBy || '—' }) + ' (' + T(d.sealed.signature ? 'sigOk' : 'sigBad') + ')</span></p>';
  h += '</section>';
  $('view').innerHTML = h;
  $('heroTitle').textContent = d.name;
  heroImage(d.image);
  fillMedals();
}

// ── routing ────────────────────────────────────────────────────────
function route() {
  clearTimeout(pollTimer);
  curKey = null; cur = null;
  $('heroTitle').textContent = t('title');
  heroImage(null);
  const key = keyFromPath(), ckey = cupKeyFromPath(), pnick = playerFromPath();
  if (key) showOne(key); else if (ckey) showCup(ckey); else if (pnick) showPlayer(pnick); else showList();
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
  try { EN = (await import('/arena/lang/en.mjs')).strings || {}; } catch (e) { EN = {}; }
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
