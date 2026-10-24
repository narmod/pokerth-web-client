// ═══════════════════════════════════════════════════════════════════
// /arena — the players' app (2026-10-23; an installable app with its menu,
// service 0.30.0).
//
//   /arena/               home: the showcase of what is on (home.mjs)
//   /arena/tournaments    public tournaments: open, playing, coming, finished
//   /arena/cups           the cups
//   /arena/groups         the groups (join, ask, leave)
//   /arena/login          sign in, make an account, an invitation link
//   /arena/account        my account (password, nickname verified…)
//   /arena/t/<key>    one tournament (also unlisted ones, by their link;
//                          a private one asks for its invitation code)
//   /arena/c/<key>, /arena/p/<nick>   a cup, a player
//
// Registration with a PokerTH nickname; the personal code it returns is kept
// in this browser (pth_td_regs) and is what unregistering asks for — and the
// check-in, with the identity « code » (Official): in a window before the
// start each player confirms with that code; only they are invited.
// Every language of the app: the list and the flags come from
// /arena/lang-meta.mjs (served by the Arena: the web client's list), the
// texts from /arena/lang/<code>.mjs, falling back to English, then to the
// key. Talks to /arena/api/* (no token). Installable: manifest.json, sw.js.
// ═══════════════════════════════════════════════════════════════════

import { initTheme } from './theme.mjs';
import { homeHtml } from './home.mjs';

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
// ── who may register (service 0.26.0) ──
// The organizer's conditions, as a list; what is missing for a player.
function accessList(a) {
  if (!a) return [];
  const out = [];
  if (a.identity === 'account') out.push(t('acc_account'));
  if (a.identity === 'verified') out.push(t('acc_verified'));
  if (a.minTournaments) out.push(t('acc_minTournaments', { n: a.minTournaments }));
  if (a.maxTournaments != null) out.push(t('acc_maxTournaments', { n: a.maxTournaments }));
  if (a.minPoints) out.push(t('acc_minPoints', { n: a.minPoints }));
  if (a.medal === 'any') out.push(t('acc_medal'));
  if (a.medal === 'gold') out.push(t('acc_gold'));
  if (a.noMedal) out.push(t('acc_noMedal'));
  if (a.cup) out.push(t('acc_cup', { n: a.cup.top, name: a.cup.name || '' }));
  if (a.groups && a.groups.length) out.push(t('acc_group', { name: a.groups.map((g) => g.name).join(' / ') }));
  return out;
}
function missingText(miss) {
  return (miss || []).map((m) => {
    if (m.code === 'minTournaments' || m.code === 'maxTournaments' || m.code === 'minPoints' || m.code === 'noMedal') return t('miss_' + m.code, { need: m.need, have: m.have });
    if (m.code === 'cup') return t('miss_cup', { need: m.need, name: m.name || '', have: m.have || '—' });
    if (m.code === 'account' || m.code === 'medal' || m.code === 'gold' || m.code === 'verified') return t('acc_' + m.code);
    if (m.code === 'group') return t('acc_group', { name: m.name || '' });
    if (m.code === 'ticket') return t(m.pending ? 'miss_ticketPending' : 'miss_ticket', { name: m.name, have: m.have, pending: m.pending });
    return t('err_' + m.code);
  });
}
function accessCard(a, elig) {
  const list = accessList(a);
  if (!list.length) return '';
  let h = '<section class="card"><h2>' + T('accessTitle') + '</h2><ul class="how">' + list.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
  if (elig && me) h += elig.missing && elig.missing.length ? '<p class="msg bad">' + T('accessYouMiss') + ' ' + esc(missingText(elig.missing).join(' · ')) + '</p>' : '<p class="msg ok">' + T('accessYouOk') + '</p>';
  return h + '</section>';
}
const eligCache = {};
// Signed in: is this tournament or cup open to me? (asked once per view)
function askEligible(path, body, key, then) {
  if (!me) return;
  const k = key + '|' + me.nick;
  if (eligCache[k]) return;
  eligCache[k] = 'pending';
  api(path, Object.assign({ session: me.token, invite: inviteFromUrl() || undefined }, body)).then((d) => { eligCache[k] = d && d.ok ? d : null; then(); }).catch(() => {});
}

// ── the player's account (service 0.25.0) ──
// Signed in: the session stands for the personal code on every tournament
// and cup (kept in this browser under pth_arena_player).
const PSESS = 'pth_arena_player';
let me = null, signupMode = 'invite', acctFlash = null, vfServers = [], vf = null, vfTimer = null;
let grAll = [], grMine = { member: [], requested: [] }, grFlash = null, grOpen = null;   // groups (service 0.29.0)
function acctLoad() { try { const v = JSON.parse(lsGet(PSESS) || 'null'); return v && v.token ? v : null; } catch (e) { return null; } }
function acctSave(v) { try { if (v) localStorage.setItem(PSESS, JSON.stringify(v)); else localStorage.removeItem(PSESS); } catch (e) {} }
// What this browser can act with on a tournament: the codes kept here, and
// the signed-in account.
function myRegs(key) {
  const list = regsFor(key).slice();
  if (me && !list.some((r) => r.nick.toLowerCase() === me.nick.toLowerCase())) list.push({ nick: me.nick, code: null, session: me.token });
  return list.map((r) => (me && r.nick.toLowerCase() === me.nick.toLowerCase() ? Object.assign({}, r, { session: me.token }) : r));
}
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
  document.querySelectorAll('[data-t-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
  document.querySelectorAll('[data-t-ph]').forEach((el) => { el.placeholder = t(el.dataset.tPh); el.setAttribute('aria-label', t(el.dataset.tPh)); });
  langButton();
  theme && theme.refresh();
}

// ── data ───────────────────────────────────────────────────────────
function api(path, body) {
  const o = { cache: 'no-store', headers: {} };
  if (body) { o.method = 'POST'; o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(body); }
  return fetch('/arena/api' + path, o).then((r) => r.json().catch(() => ({ ok: false, code: 'error' }))).then((d) => {
    // The account's session has ended: signed out here too.
    if (d && d.code === 'session' && me) { me = null; acctSave(null); renderAcct(); }
    return d;
  });
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
// The home page: what is on (GET /arena/api/showcase, drawn by home.mjs),
// again every minute while it is open.
async function showHome() {
  curKey = 'home';
  $('heroTitle').textContent = 'PokerTH Arena';
  $('heroText').textContent = t('homeIntro');
  if (!$('view').querySelector('.card')) $('view').innerHTML = '<p class="empty">' + T('loading') + '</p>';
  const d = await api('/showcase').catch(() => null);
  if (curKey !== 'home') return;
  if (!d || !d.ok) { $('view').innerHTML = '<p class="msg bad">' + T('err_error') + '</p>'; return; }
  $('view').innerHTML = homeHtml(d, { esc, t, T, lang, card, nickLink });
  fillMedals();
  clearTimeout(pollTimer);
  pollTimer = setTimeout(() => { if (curKey === 'home' && !document.hidden) showHome(); }, 60000);
}

// which: 'home' (all of it), 'tournaments', 'cups' or 'groups' — the menu's views.
async function showList(which) {
  which = which || 'home';
  const mine = 'list:' + which;
  curKey = mine;
  $('view').innerHTML = '<p class="empty">' + T('loading') + '</p>';
  const [d, dc] = await Promise.all([which === 'cups' || which === 'groups' ? Promise.resolve({ ok: true, tournaments: [] }) : api('/list'), which === 'tournaments' || which === 'groups' ? Promise.resolve({ ok: true, cups: [] }) : api('/cups')]);
  if (curKey !== mine) return;
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
  const tourHtml = groups.length ? groups.map((g) => '<section class="card"><h2>' + T(g[0]) + '</h2><ul class="tlist">' + g[1].map(card).join('') + '</ul></section>').join('')
    : '<section class="card"><p class="empty">' + T('none') + '</p></section>';
  const grHtml = '<div id="grBox">' + groupsHtml() + '</div>';
  if (which === 'tournaments') $('view').innerHTML = tourHtml;
  else if (which === 'cups') $('view').innerHTML = cupsHtml || '<section class="card"><p class="empty">' + T('none') + '</p></section>';
  else if (which === 'groups') $('view').innerHTML = grAll.length ? grHtml : '<section class="card"><p class="empty">' + T('grHint') + '</p></section>';
  else $('view').innerHTML = tourHtml + cupsHtml + grHtml;
  wireGroups();
}

// ── groups (service 0.29.0): every group is public; join, ask, leave ──
const GR_MODE = { invite: 'grModeInvite', request: 'grModeRequest', code: 'grModeCode', open: 'grModeOpen' };
function groupsHtml() {
  if (!grAll.length) return '';
  let h = '<section class="card"><h2>' + T('grTitle') + '</h2><p class="small muted">' + T('grHint') + '</p>';
  if (grFlash) { h += '<div class="msg ' + (grFlash.bad ? 'bad' : 'ok') + '" role="status">' + grFlash.html + '</div>'; grFlash = null; }
  if (!me && grAll.some((g) => g.join !== 'invite')) h += '<p class="small">' + T('grSignIn') + ' <a href="' + loginHref() + '" data-go>' + T('navSignIn') + '</a></p>';
  h += '<ul class="glist">' + grAll.map((g) => {
    const id = esc(g.id), isIn = grMine.member.indexOf(g.id) >= 0, asked = grMine.requested.indexOf(g.id) >= 0;
    let a = '';
    if (me && isIn) a = '<span class="chip done">✓ ' + T('grMember') + '</span> <button type="button" class="ghost mini" data-grop="leave" data-id="' + id + '">' + T('grLeave') + '</button>';
    else if (me && asked) a = '<span class="small muted">' + T('grAsked') + '</span> <button type="button" class="ghost mini" data-grop="leave" data-id="' + id + '">' + T('grCancelAsk') + '</button>';
    else if (g.join === 'invite') a = '<span class="small muted">' + T('grInviteOnly') + '</span>';
    else if (me && g.join === 'open') a = '<button type="button" data-grop="join" data-id="' + id + '">' + T('grJoin') + '</button>';
    else if (me && g.join === 'request') a = '<button type="button" data-grop="join" data-id="' + id + '">' + T('grAsk') + '</button>';
    else if (me && g.join === 'code') a = '<form data-grop="code" data-id="' + id + '"><label class="sr" for="grc_' + id + '">' + T('grCode') + '</label><input id="grc_' + id + '" maxlength="12" autocapitalize="characters" spellcheck="false" placeholder="' + T('grCode') + '" required><button type="submit">' + T('grJoin') + '</button></form>';
    return '<li><div class="gname"><b>' + esc(g.name) + '</b> <span class="chip">' + T(GR_MODE[g.join] || 'grModeInvite') + '</span>' + (g.about ? '<br><span class="small">' + esc(g.about) + '</span>' : '') +
      (g.members.length ? '<details class="sub"' + (grOpen === g.id ? ' open' : '') + ' data-grid="' + id + '"><summary class="small">' + T('grMembers', { n: g.members.length }) + '</summary><p class="small">' + g.members.map(nickLink).join(', ') + '</p></details>' : '<br><span class="small muted">' + T('grMembers', { n: 0 }) + '</span>') +
      '</div><div>' + a + '</div></li>';
  }).join('') + '</ul></section>';
  return h;
}
function wireGroups() {
  const box = $('grBox');
  if (!box) return;
  fillMedals();
  const after = (d) => {
    if (!d.ok) grFlash = { bad: true, html: errText(d) };
    else {
      grMine = d.mine || grMine;
      const i = grAll.findIndex((g) => g.id === d.group.id); if (i >= 0) grAll[i] = d.group;
      grFlash = { html: d.status === 'member' ? T('grJoined', { name: d.group.name }) : d.status === 'requested' ? T('grAsked') : T('grLeft', { name: d.group.name }) };
    }
    box.innerHTML = groupsHtml(); fillMedals();
  };
  box.onclick = (ev) => {
    const b = ev.target.closest('button[data-grop]');
    if (!b || !me) return;
    api('/players/' + (b.dataset.grop === 'leave' ? 'groupleave' : 'groupjoin'), { session: me.token, id: b.dataset.id }).then(after).catch(() => {});
  };
  box.onsubmit = (ev) => {
    const f = ev.target.closest('form[data-grop="code"]');
    if (!f || !me) return;
    ev.preventDefault();
    api('/players/groupjoin', { session: me.token, id: f.dataset.id, code: $('grc_' + f.dataset.id).value.trim().toUpperCase() }).then(after).catch(() => {});
  };
  box.addEventListener('toggle', (ev) => { const d = ev.target; if (d.dataset && d.dataset.grid) grOpen = d.open ? d.dataset.grid : (grOpen === d.dataset.grid ? null : grOpen); }, true);
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
    $('view').innerHTML = '<p><a href="/arena/tournaments" data-go>← ' + T('allTournaments') + '</a></p><section class="card"><p class="msg bad">' + T('err_' + (d.code === 'notFound' ? 'notFound' : 'error')) + '</p></section>';
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
  $('view').innerHTML = '<p><a href="/arena/tournaments" data-go>← ' + T('allTournaments') + '</a></p><section class="card"><h2>' + T('privateTitle') + '</h2>' +
    '<p>' + T('privateText') + '</p>' + (tried ? '<p class="msg bad">' + T('err_notFound') + '</p>' : '') +
    '<form id="invForm" class="row"><div><label for="invIn">' + T('inviteCode') + '</label><input id="invIn" autocomplete="off" required></div><button type="submit" class="primary">' + T('open') + '</button></form></section>';
  $('invForm').addEventListener('submit', (ev) => { ev.preventDefault(); go((base || '/arena/t/') + key + '?invite=' + encodeURIComponent($('invIn').value.trim())); });
}
function tableLine(tb) {
  if (!tb) return '';
  return T(tb.raiseMode === 'minutes' ? 'tableSettingsMin' : 'tableSettings', { stack: tb.startMoney, sb: tb.firstSmallBlind, bb: tb.firstSmallBlind * 2, n: tb.raiseEvery, t: tb.actionTimeout });
}
function renderOne() {
  const c = cur, mine = myRegs(c.key);
  const mineSet = new Set(mine.map((r) => r.nick.toLowerCase()));
  let h = '<p><a href="/arena/tournaments" data-go>← ' + T('allTournaments') + '</a></p>';
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

  // The table password (service 0.24.0): only to a registered player, with
  // his personal code; never in the table chat.
  if (c.tablePassword && c.phase === 'table' && lv) {
    const codes = mine.concat(c.parent ? myRegs(c.parent.key) : []).filter((r) => c.playerList.some((p) => p.nick.toLowerCase() === r.nick.toLowerCase() && !p.absent));
    const uniq = codes.filter((r, i) => codes.findIndex((x) => x.nick.toLowerCase() === r.nick.toLowerCase()) === i);
    h += '<section class="card" id="tpCard"><h2>' + T('tpTitle') + '</h2><p>' + T('tpText') + '</p>';
    for (const r of uniq) {
      const pw = shownPass[c.key + '|' + r.nick.toLowerCase()];
      h += pw ? '<p>' + esc(r.nick) + ' — <b class="mono">' + esc(T('tpIs', { password: pw })) + '</b> <button type="button" class="mini" data-copy="' + esc(pw) + '">' + T('copy') + '</button></p>'
        : '<div class="actions"><button type="button" class="primary" data-tpshow="' + esc(r.nick) + '">' + T('tpShow') + ' · ' + esc(r.nick) + '</button></div>';
    }
    h += '<form id="tpForm" class="row"><div><label for="tpNick">' + T('nickname') + '</label><input id="tpNick" maxlength="64" autocomplete="nickname" required></div>' +
      '<div><label for="tpCode">' + T('code') + '</label><input id="tpCode" maxlength="16" autocomplete="off" required></div>' +
      '<button type="submit"' + (uniq.length ? '' : ' class="primary"') + '>' + T('tpShow') + '</button></form></section>';
  }

  if (c.phase === 'upcoming' || c.phase === 'table') {
    const at = c.autoOpen && c.startsAt ? c.startsAt - (c.openBefore || 0) * 60000 : null;
    const ck = c.checkIn && c.checkIn.needed ? '<li>' + (c.checkIn.opensAt ? T('checkInHow', { time: fmtTime(c.checkIn.opensAt) }) : T('checkInHowNoTime')) + '</li>' : '';
    const mt = c.multi ? '<li>' + T('howMulti', { n: c.multi.finalists }) + '</li>' : '';
    h += '<section class="card"><h2>' + T('howTitle') + '</h2><ol class="how"><li>' + T('how1') + '</li>' + ck + mt + '<li>' +
      (at ? T('how2At', { time: fmtTime(at) }) : T('how2')) + '</li><li>' + T('how3') + '</li><li>' + T('how4') + '</li>' +
      (c.witnesses ? '<li>' + T('howWitness') + '</li>' : '') + (c.tablePassword && c.phase === 'upcoming' ? '<li>' + T('tpLater') + '</li>' : '') + '</ol></section>';
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

  // Who may register, and whether the signed-in player may.
  if (!c.result && c.access) {
    const ek = 't:' + c.key + '|' + (me ? me.nick : '');
    h += accessCard(c.access, eligCache[ek] && eligCache[ek] !== 'pending' ? eligCache[ek] : null);
    askEligible('/t/' + c.key + '/eligible', {}, 't:' + c.key, () => { if (cur && cur.key === c.key) renderOne(); });
  }
  // Tickets: what it needs, what its first earn, whether it ends the season.
  const ti = c.ticketInfo;
  if (ti && (ti.need || ti.earn || ti.endsSeason) && c.phase !== 'validated') {
    h += '<section class="card"><h2>' + T('tkTitle') + '</h2><ul class="how">' + (ti.need ? '<li>' + T('tkNeed', { name: ti.need }) + (ti.keep && ti.keep.length ? ' ' + T('tkKeep', { list: ti.keep.join(', ') }) : '') + '</li>' : '') +
      (ti.earn ? '<li>' + T('tkEarn', { n: ti.earn.top, name: ti.earn.name }) + '</li>' : '') + (ti.endsSeason ? '<li>' + T('tkEnds', { season: ti.season }) + '</li>' : '') + '</ul></section>';
  }
  // Registration.
  if (!c.result) {
    h += '<section class="card"><h2>' + T('regTitle') + '</h2>';
    const viaCup = (c.cups || []).find((cp) => cp.register);
    if (c.closedBecause === 'organizer' && viaCup) h += '<p><a href="/arena/c/' + esc(viaCup.key) + '" data-go>' + T('regViaCup', { name: viaCup.name }) + '</a></p>';
    else if (c.closedBecause) h += '<p>' + T('closed_' + c.closedBecause) + '</p>';
    else if (c.identity === 'accounts' && !me) h += '<p>' + T('accNeededLogin') + ' <a class="btn" href="' + loginHref() + '" data-go>' + T('navSignIn') + '</a></p>';
    else if (me) {
      if (!c.playerList.some((p) => p.nick.toLowerCase() === me.nick.toLowerCase())) h += '<form id="regForm" class="row"><p>' + T('accRegisterAs', { nick: me.nick }) + '</p><button type="submit" class="primary">' + T('register') + '</button></form>';
    } else {
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
function errText(d) {
  if (d && d.code === 'access') return T('accessYouMiss') + ' ' + esc(missingText(d.missing).join(' · '));
  return T('err_' + (['badNick', 'taken', 'badCode', 'tooMany', 'notFound', 'checkInNotYet', 'checkInClosed', 'noCheckIn', 'alreadyIn', 'notPdb', 'noGame', 'noLogWitness', 'notPlayer', 'tooLarge', 'noTablePass', 'tableNotOpen', 'absentPlayer', 'notCheckedIn', 'nickClaimed', 'banned', 'accountNeeded', 'session', 'signupClosed', 'badLogin', 'shortPassword', 'passwordIsNick', 'badInvite', 'badPassword', 'groupUnknown', 'groupInvite', 'groupCode'].indexOf(d.code) >= 0 ? d.code : 'error'));
}
// Table passwords already shown in this page (they stay through the refreshes).
const shownPass = {};
function wire() {
  const getPass = async (nick, code, session) => {
    const d = await api('/t/' + cur.key + '/tablepass', { nick, code, session, invite: inviteFromUrl() || undefined });
    if (!d.ok) { flash = { bad: true, html: errText(d) }; renderOne(); return; }
    shownPass[cur.key + '|' + d.nick.toLowerCase()] = d.password;
    renderOne();
  };
  document.querySelectorAll('[data-tpshow]').forEach((b) => b.addEventListener('click', () => {
    const lo = b.dataset.tpshow.toLowerCase();
    const r = myRegs(cur.key).concat(cur.parent ? myRegs(cur.parent.key) : []).find((x) => x.nick.toLowerCase() === lo);
    if (r) getPass(r.nick, r.code, r.session);
  }));
  const tp = $('tpForm');
  if (tp) tp.addEventListener('submit', (ev) => { ev.preventDefault(); getPass($('tpNick').value.trim(), $('tpCode').value.trim().toUpperCase()); });
  const reg = $('regForm');
  if (reg) reg.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const nick = $('regNick') ? $('regNick').value.trim() : undefined;
    const btn = reg.querySelector('button'); btn.disabled = true;
    const d = await api('/t/' + cur.key + '/register', { nick, session: me ? me.token : undefined, invite: inviteFromUrl() || undefined });
    btn.disabled = false;
    if (!d.ok) { flash = { bad: true, html: /^closed_/.test(d.code || '') ? T(d.code) : errText(d) }; renderOne(); return; }
    regsSave(cur.key, regsFor(cur.key).filter((r) => r.nick.toLowerCase() !== d.nick.toLowerCase()).concat([{ nick: d.nick, code: d.code }]));
    cur = d.tournament;
    flash = { html: T('registered', { nick: d.nick }) + '<br><b>' + T('yourCode', { code: d.code }) + '</b> <button type="button" class="mini" data-copy="' + esc(d.code) + '">' + T('copy') + '</button><br><span class="small">' + T(cur.checkIn && cur.checkIn.needed ? 'codeKeepCheckIn' : 'codeKeep') + '</span>' };
    renderOne();
  });
  const doUnreg = async (nick, code, session) => {
    const d = await api('/t/' + cur.key + '/unregister', { nick, code, session, invite: inviteFromUrl() || undefined });
    if (!d.ok) { flash = { bad: true, html: /^closed_/.test(d.code || '') ? T(d.code) : errText(d) }; renderOne(); return; }
    regsSave(cur.key, regsFor(cur.key).filter((r) => r.nick.toLowerCase() !== d.nick.toLowerCase()));
    cur = d.tournament;
    flash = { html: T('unregistered', { nick: d.nick }) };
    renderOne();
  };
  document.querySelectorAll('[data-unreg]').forEach((b) => b.addEventListener('click', () => {
    const r = myRegs(cur.key).find((x) => x.nick === b.dataset.unreg);
    if (r) doUnreg(r.nick, r.code, r.session);
  }));
  const doCheckIn = async (nick, code, session) => {
    const d = await api('/t/' + cur.key + '/checkin', { nick, code, session, invite: inviteFromUrl() || undefined });
    if (!d.ok) { flash = { bad: true, html: errText(d) }; renderOne(); return; }
    // The code typed here is kept too: the web client sends it with its
    // witness report, so that the report counts.
    if (code && !regsFor(cur.key).some((r) => r.nick.toLowerCase() === d.nick.toLowerCase())) regsSave(cur.key, regsFor(cur.key).concat([{ nick: d.nick, code: String(code).toUpperCase() }]));
    cur = d.tournament;
    flash = { html: T('checkedInDone', { nick: d.nick }) };
    renderOne();
  };
  document.querySelectorAll('[data-ckin]').forEach((b) => b.addEventListener('click', () => {
    const r = myRegs(cur.key).find((x) => x.nick === b.dataset.ckin);
    if (r) { b.disabled = true; doCheckIn(r.nick, r.code, r.session); }
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
  let h = '<p><a href="/arena/tournaments" data-go>← ' + T('allTournaments') + '</a>' + (d.account ? ' <span class="chip done" title="' + T('accBadgeTitle') + '">✓ ' + T('accBadge') + '</span>' : '') + (d.verified || []).map((v) => ' <span class="chip live">✓ ' + T('vfBadge', { server: v.server }) + '</span>').join('') + '</p>';
  h += '<section class="card"><h2>' + T('medalsTitle') + '</h2>';
  h += '<p class="medals">' + ['gold', 'silver', 'bronze'].map((k) => '<span class="medal ' + k + '"><span aria-hidden="true">' + MEDAL[k] + '</span> ' + T('medal_' + k) + ' <b>' + d.counts[k] + '</b></span>').join('') + '</p>';
  h += d.medals.length ? '<ul class="tlist">' + d.medals.map((m) => '<li class="medalrow"><span class="big" aria-hidden="true">' + MEDAL[m.medal] + '</span><span><b>' + link(m) + '</b><br><span class="muted small">' + T(m.kind === 'cup' ? 'kindCup' : 'kindTournament') + ' · ' + T('placeOf', { place: m.place, of: m.of }) + (m.at ? ' · ' + day(m.at) : '') + '</span></span></li>').join('') + '</ul>'
    : '<p class="empty">' + T('noMedal') + '</p>';
  h += '<p class="small muted">' + T('medalRules') + '</p></section>';
  if (d.groups && d.groups.length) h += '<section class="card"><h2>' + T('grTitle') + '</h2><ul class="chips">' + d.groups.map((g) => '<li>' + esc(g.name) + '</li>').join('') + '</ul></section>';
  if (d.tickets && d.tickets.length) h += '<section class="card"><h2>' + T('tkMine', { season: d.season || '' }) + '</h2><ul class="chips">' + d.tickets.map((x) => '<li>' + esc(x.name) + ' <b>×' + esc(x.count) + '</b></li>').join('') + '</ul></section>';
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
    $('view').innerHTML = '<p><a href="/arena/cups" data-go>← ' + T('navCups') + '</a></p><section class="card"><p class="msg bad">' + T('err_notFound') + '</p></section>';
    return;
  }
  const fmt = (x) => (Math.round(x * 10) / 10).toLocaleString(lang);
  let h = '<p><a href="/arena/cups" data-go>← ' + T('navCups') + '</a></p>';
  h += '<section class="card"><h2>' + esc(d.name) + '</h2><p><span class="chip ' + (d.status === 'closed' ? 'done' : 'live') + '">' + T(d.status === 'closed' ? 'cupStatusClosed' : 'cupStatusOpen') + '</span></p>' +
    (d.description ? '<p>' + esc(d.description) + '</p>' : '') +
    '<p class="small">' + T('cupRulesPoints') + ' ' + (d.bestOf ? T('cupBest', { n: d.bestOf }) : T('cupAll')) + ' ' + T('cupTies') + '</p></section>';
  if (d.plan) h += cupPlanHtml(d, key);
  // Its tournaments (a cup with a programme shows them there).
  if (!d.plan) h += '<section class="card"><h2>' + T('cupTournaments') + '</h2><ul class="tlist">' + d.events.map((e) => {
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
  if (d.plan) wireCup(d, key);
}

// ── a cup's programme, and registering once for the whole cup ───────
// The personal code of the cup is kept here under « c:<cup> » and under each
// of its tournaments the player is in, so their pages (and the witness of
// the web client) know it too.
let cupFlash = null;
const cupRegKey = (key) => 'c:' + key;
function slotText(s) {
  if (s.kind === 'final') return t('cupFinal');
  if (s.kind === 'series') return '#' + s.n;
  if (s.kind === 'step') return t('cupStepN', { step: s.step, n: s.n });
  return '';
}
function entryKeys(d, choice) {
  return d.plan.slots.filter((s) => s.tournament && (s.kind === 'series' || s.kind === 'single' || (s.kind === 'step' && s.step === 1)) &&
    !(d.plan.stageEntry === 'choose' && d.plan.format === 'stages' && s.key !== choice)).map((s) => s.tournament.key);
}
// A code of the cup copied to its tournaments (made since, or picked since).
function cupCodesToTournaments(d, key) {
  for (const r of regsFor(cupRegKey(key))) {
    for (const tk of entryKeys(d, r.choice)) {
      if (!regsFor(tk).some((x) => x.nick.toLowerCase() === r.nick.toLowerCase())) regsSave(tk, regsFor(tk).concat([{ nick: r.nick, code: r.code }]));
    }
  }
}
function cupPlanHtml(d, key) {
  const p = d.plan, rs = p.registrationState || {};
  let h = '<section class="card"><h2>' + T('cupProgramme') + '</h2><p>' + T('cupFormat_' + p.format) + '</p>';
  if (d.from) h += '<p class="small">' + (d.from === d.to ? T('startsAt', { date: fmtDate(d.from) }) : T('cupFromTo', { from: fmtDate(d.from), to: fmtDate(d.to) })) + '</p>';
  const next = p.slots.find((s) => s.key === p.next);
  if (next && d.status !== 'closed') h += '<p><b>' + T('cupNext', { date: fmtDate(next.at) }) + '</b></p>';
  h += '<ul class="tlist">' + p.slots.map((s) => {
    const tt = s.tournament;
    const head = '<span class="tc-top"><span class="tname">' + esc(fmtDate(s.at)) + (slotText(s) ? ' · ' + esc(slotText(s)) : '') + '</span>' +
      (tt && (tt.status === 'validated' || tt.started) ? '<span class="chip ' + (tt.status === 'validated' ? 'done' : 'live') + '">' + T(tt.status === 'validated' ? 'stValidated' : 'stTable') + '</span>' : '') + '</span>' +
      '<span class="muted small">' + (tt ? T('cupPlayers', { n: tt.players }) : T('cupToCome')) + (s.qualify ? ' · ' + T('cupFirstGoOn', { n: s.qualify }) : '') + '</span>';
    return '<li>' + (tt ? '<a class="tcard" href="/arena/t/' + esc(tt.key) + invQs('?') + '" data-go>' + head + '</a>' : '<div class="tcard">' + head + '</div>') + '</li>';
  }).join('') + '</ul></section>';
  if (rs.mode !== 'cup') return h;
  // Who may register, and whether the signed-in player may.
  if (p.access && d.status !== 'closed') {
    const ek = 'c:' + key + '|' + (me ? me.nick : '');
    h += accessCard(p.access, eligCache[ek] && eligCache[ek] !== 'pending' ? eligCache[ek] : null);
    askEligible('/c/' + key, { op: 'eligible' }, 'c:' + key, () => { if (curKey === key) showCup(key); });
  }
  // Registering for the cup.
  cupCodesToTournaments(d, key);
  const mine = myRegs(cupRegKey(key)).filter((r) => (rs.players || []).some((n) => n.toLowerCase() === r.nick.toLowerCase()));
  const choices = rs.choose ? (rs.choices || []).filter((c) => !c.started) : [];
  const choiceSel = (id, sel) => '<div><label for="' + id + '">' + T('cupPickDate') + '</label><select id="' + id + '" required><option value="">—</option>' +
    choices.map((c) => '<option value="' + esc(c.key) + '"' + (c.key === sel ? ' selected' : '') + (c.taken >= c.cap && c.key !== sel ? ' disabled' : '') + '>' + esc(fmtDate(c.at)) + ' · ' + T('cupPlayers', { n: c.taken }) + '/' + esc(c.cap) + '</option>').join('') + '</select></div>';
  h += '<section class="card"><h2>' + T('cupRegTitle') + ' <span class="muted small">' + T('cupRegCount', { n: rs.count, max: rs.cap }) + '</span></h2>';
  if (cupFlash) { h += '<div class="msg ' + (cupFlash.bad ? 'bad' : 'ok') + '" role="status">' + cupFlash.html + '</div>'; cupFlash = null; }
  h += '<p class="small">' + T('cupRegHint') + (rs.choose ? ' ' + T('cupRegHintChoose') : '') + '</p>';
  for (const r of mine) {
    h += '<div class="cupme"><p>' + T('cupRegistered', { nick: r.nick }) + '</p>';
    if (rs.choose && choices.length) h += '<form class="row" data-cupchoose="' + esc(r.nick) + '">' + choiceSel('cc_' + esc(r.nick), r.choice) + '<button type="submit">' + T('cupChange') + '</button></form>';
    h += '<div class="actions"><button type="button" data-cupleave="' + esc(r.nick) + '">' + T('cupLeave') + ' · ' + esc(r.nick) + '</button></div></div>';
  }
  if (rs.open && me && mine.some((r) => r.session)) { /* signed in and in the cup already */ }
  else if (rs.open && me) {
    h += '<form id="cupRegForm" class="row"><p>' + T('accRegisterAs', { nick: me.nick }) + '</p>' + (rs.choose ? choiceSel('cupChoice', '') : '') + '<button type="submit" class="primary">' + T('register') + '</button></form>';
  } else if (rs.open) {
    h += '<form id="cupRegForm" class="row"><div><label for="cupNick">' + T('nickname') + '</label><input id="cupNick" maxlength="64" autocomplete="nickname" required></div>' +
      (rs.choose ? choiceSel('cupChoice', '') : '') + '<button type="submit" class="primary">' + T('register') + '</button></form><p class="small muted">' + T('nickHint') + '</p>';
  } else h += '<p>' + T('cupClosed_' + (rs.closed || 'started')) + '</p>';
  if (rs.players && rs.players.length) h += '<ul class="chips">' + rs.players.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul>';
  if (rs.count) h += '<details class="sub"><summary>' + T('unregTitle') + '</summary><p class="small muted">' + T('unregHint') + '</p><form id="cupUnForm" class="row">' +
    '<div><label for="cupUnNick">' + T('nickname') + '</label><input id="cupUnNick" maxlength="64" required></div>' +
    '<div><label for="cupUnCode">' + T('code') + '</label><input id="cupUnCode" maxlength="16" autocomplete="off" required></div>' +
    '<button type="submit">' + T('cupLeave') + '</button></form></details>';
  return h + '</section>';
}
function cupErr(d) {
  if (/^closed_/.test(d.code || '')) return T('cupClosed_' + d.code.slice(7));
  if (['pickDate', 'dateFull', 'dateStarted'].indexOf(d.code) >= 0) return T('err_' + d.code);
  return errText(d);
}
function wireCup(d, key) {
  const inv = inviteFromUrl() || undefined;
  const post = (b) => api('/c/' + key, Object.assign({ invite: inv }, b));
  const again = () => showCup(key);
  const forget = (nick) => {
    const lo = nick.toLowerCase();
    const cups = regsFor(cupRegKey(key));
    const r = cups.find((x) => x.nick.toLowerCase() === lo);
    regsSave(cupRegKey(key), cups.filter((x) => x !== r));
    for (const s of d.plan.slots) if (s.tournament) regsSave(s.tournament.key, regsFor(s.tournament.key).filter((x) => !(x.nick.toLowerCase() === lo && r && x.code === r.code)));
  };
  const f = $('cupRegForm');
  if (f) f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const b = f.querySelector('button'); b.disabled = true;
    const r = await post({ op: 'register', nick: $('cupNick') ? $('cupNick').value.trim() : undefined, session: me ? me.token : undefined, choice: $('cupChoice') ? $('cupChoice').value : undefined });
    b.disabled = false;
    if (!r.ok) { cupFlash = { bad: true, html: cupErr(r) }; return again(); }
    regsSave(cupRegKey(key), regsFor(cupRegKey(key)).filter((x) => x.nick.toLowerCase() !== r.nick.toLowerCase()).concat([{ nick: r.nick, code: r.code, choice: $('cupChoice') ? $('cupChoice').value : null }]));
    cupFlash = { html: T('cupRegistered', { nick: r.nick }) + '<br><b>' + T('yourCode', { code: r.code }) + '</b> <button type="button" class="mini" data-copy="' + esc(r.code) + '">' + T('copy') + '</button><br><span class="small">' + T('codeKeep') + '</span>' };
    again();
  });
  document.querySelectorAll('[data-cupleave]').forEach((b) => b.addEventListener('click', async () => {
    const reg = myRegs(cupRegKey(key)).find((x) => x.nick === b.dataset.cupleave);
    if (!reg) return;
    const r = await post({ op: 'unregister', nick: reg.nick, code: reg.code, session: reg.session });
    if (!r.ok) { cupFlash = { bad: true, html: cupErr(r) }; return again(); }
    forget(reg.nick); cupFlash = { html: T('cupLeft', { nick: r.nick }) }; again();
  }));
  document.querySelectorAll('[data-cupchoose]').forEach((fm) => fm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const nick = fm.dataset.cupchoose;
    const reg = myRegs(cupRegKey(key)).find((x) => x.nick === nick);
    const choice = fm.querySelector('select').value;
    if (!reg) return;
    const r = await post({ op: 'choose', nick: reg.nick, code: reg.code, session: reg.session, choice });
    if (!r.ok) { cupFlash = { bad: true, html: cupErr(r) }; return again(); }
    // The code leaves the old tournament's list here, joins the new one.
    const old = d.plan.slots.find((s) => s.key === reg.choice);
    if (old && old.tournament) regsSave(old.tournament.key, regsFor(old.tournament.key).filter((x) => x.code !== reg.code));
    regsSave(cupRegKey(key), regsFor(cupRegKey(key)).map((x) => (x === reg || (x.nick === reg.nick && x.code === reg.code) ? Object.assign({}, x, { choice }) : x)));
    const now = (rs) => rs.find((c) => c.key === choice);
    const c = now(d.plan.registrationState.choices || []);
    cupFlash = { html: T('cupChanged', { nick: r.nick, date: c ? fmtDate(c.at) : '' }) }; again();
  }));
  const un = $('cupUnForm');
  if (un) un.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const r = await post({ op: 'unregister', nick: $('cupUnNick').value.trim(), code: $('cupUnCode').value.trim().toUpperCase() });
    if (!r.ok) { cupFlash = { bad: true, html: cupErr(r) }; return again(); }
    forget(r.nick); cupFlash = { html: T('cupLeft', { nick: r.nick }) }; again();
  });
}

// ── the player's account: the sign-in page and « My account » (0.30.0) ──
function pinviteFromHash() { const m = /[#&]pinvite=([A-Za-z0-9_-]{20,80})/.exec(location.hash || ''); return m ? m[1] : null; }
function acctMsg() { if (!acctFlash) return ''; const h = '<div class="msg ' + (acctFlash.bad ? 'bad' : 'ok') + '" role="status">' + acctFlash.html + '</div>'; acctFlash = null; return h; }
// The sign-in page, coming back here afterwards.
function loginHref() {
  const here = location.pathname + location.search;
  return '/arena/login' + (/^\/arena\/(?:login|account)/.test(here) || here === '/arena/' || here === '/arena' ? '' : '?next=' + encodeURIComponent(here));
}
function nextAfterLogin() {
  let n = null;
  try { n = new URLSearchParams(location.search).get('next'); } catch (e) {}
  return n && /^\/arena\/[A-Za-z0-9/_%.@-]*$/.test(n) && n.indexOf('//') < 0 ? n : '/arena/account';
}
// The menu: who is signed in, which view is open.
function navKey() {
  const p = location.pathname.replace(/\/+$/, '');
  if (p === '/arena' || p === '/arena.html') return 'home';
  const m = /^\/arena\/(tournaments|cups|groups|login|account|t|c|p)(?:\/|$)/.exec(location.pathname);
  if (!m) return '';
  const map = { t: 'tournaments', c: 'cups', p: '', login: 'account' };
  return Object.prototype.hasOwnProperty.call(map, m[1]) ? map[m[1]] : m[1];
}
function updateNav() {
  const a = $('navAcct'), s = $('navAcctTxt');
  if (a) a.setAttribute('href', me ? '/arena/account' : '/arena/login');
  if (s) { if (me) { delete s.dataset.t; s.textContent = me.nick; } else { s.dataset.t = 'navSignIn'; s.textContent = t('navSignIn'); } }
  const k = navKey();
  document.querySelectorAll('#mainNav a[data-nav]').forEach((x) => { if (x.dataset.nav === k) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
}
let acctView = null;   // 'login' | 'account' while one of them is shown
function renderAcct() {
  updateNav();
  if (acctView) renderAcctView();
}
function renderAcctView() {
  const box = $('view');
  if (!box) return;
  if (acctView === 'login' && me && !pinviteFromHash()) return go(nextAfterLogin());
  if (acctView === 'account' && !me) return go('/arena/login');
  const inv = pinviteFromHash();
  let h = '';
  if (acctView === 'login') {
    $('heroTitle').textContent = t('navSignIn');
    if (inv) {
      h = '<section class="card"><h2>' + T('accInviteTitle') + '</h2><p class="small">' + T('accInviteHint') + '</p>' + acctMsg() +
        '<form id="accInvForm" class="row"><div><label for="accInvPw">' + T('accPassword') + '</label><input id="accInvPw" type="password" autocomplete="new-password" minlength="8" required></div>' +
        '<button type="submit" class="primary">' + T('accChoose') + '</button></form></section>';
    } else {
      h = '<p class="lead">' + T('acctWhy') + '</p><div class="logingrid"><section class="card narrow"><h2>' + T('accSignIn') + '</h2>' + acctMsg() +
        '<form id="accInForm"><label for="accNick">' + T('nickname') + '</label><input id="accNick" maxlength="64" autocomplete="username" autocapitalize="none" spellcheck="false" required>' +
        '<label for="accPw">' + T('accPassword') + '</label><input id="accPw" type="password" autocomplete="current-password" required><div class="actions"><button type="submit" class="primary">' + T('accSignIn') + '</button></div></form>' +
        '<p class="small muted">' + T('acctForgot') + '</p></section>' +
        (signupMode === 'open'
          ? '<section class="card narrow"><h2>' + T('accCreateTitle') + '</h2><p class="small muted">' + T('accCreateHint') + '</p><form id="accUpForm"><label for="accUpNick">' + T('nickname') + '</label><input id="accUpNick" maxlength="64" autocomplete="nickname" autocapitalize="none" spellcheck="false" required>' +
            '<label for="accUpPw">' + T('accPassword') + '</label><input id="accUpPw" type="password" autocomplete="new-password" minlength="8" required><div class="actions"><button type="submit">' + T('accCreate') + '</button></div></form></section>'
          : '<section class="card narrow"><p class="small muted">' + T('accInviteOnly') + '</p></section>') + '</div>';
    }
  } else {
    $('heroTitle').textContent = t('navAccount');
    h = acctAccountHtml();
  }
  box.innerHTML = h;
  const signedIn = (d) => {
    me = { token: d.token, nick: d.player.nick }; acctSave(me); acctFlash = { html: T('accWelcome', { nick: d.player.nick }) };
    if (pinviteFromHash()) history.replaceState(null, '', location.pathname + location.search);
    // My groups and my preferences (language, theme), then where I was going.
    api('/players/me', { session: d.token }).then(async (w) => { if (w && w.ok) { grMine = w.groups || grMine; await applyPrefs(w.prefs); } }).catch(() => {}).then(() => { if (vfServers.length) vfPoll(); go(nextAfterLogin()); });
  };
  const bad = (d) => { acctFlash = { bad: true, html: errText(d) }; renderAcctView(); };
  const f1 = $('accInForm');
  if (f1) f1.addEventListener('submit', async (ev) => { ev.preventDefault(); const d = await api('/players/login', { nick: $('accNick').value.trim(), password: $('accPw').value }); if (d.ok) signedIn(d); else bad(d); });
  const f2 = $('accUpForm');
  if (f2) f2.addEventListener('submit', async (ev) => { ev.preventDefault(); const d = await api('/players/signup', { nick: $('accUpNick').value.trim(), password: $('accUpPw').value }); if (d.ok) signedIn(d); else bad(d); });
  const f3 = $('accInvForm');
  if (f3) f3.addEventListener('submit', async (ev) => { ev.preventDefault(); const d = await api('/players/invite', { token: pinviteFromHash(), password: $('accInvPw').value }); if (d.ok) signedIn(d); else bad(d); });
  const f4 = $('accPwForm');
  if (f4) f4.addEventListener('submit', async (ev) => { ev.preventDefault(); const d = await api('/players/password', { session: me.token, old: $('accPwOld').value, password: $('accPwNew').value }); acctFlash = d.ok ? { html: T('accPwChanged') } : { bad: true, html: errText(d) }; renderAcctView(); });
  const vg = $('vfForm');
  if (vg) vg.addEventListener('submit', async (ev) => { ev.preventDefault(); const d = await api('/players/verify', { session: me.token, ref: $('vfSrv').value }); if (!d.ok) { acctFlash = { bad: true, html: errText(d) }; return renderAcctView(); } vf = { pending: Object.assign({ done: false }, d), verified: (vf && vf.verified) || [] }; renderAcctView(); vfPoll(); });
  wireAccount();
  const o = $('accOut');
  if (o) o.addEventListener('click', async () => { const tk = me && me.token; me = null; acctSave(null); grMine = { member: [], requested: [] }; vf = null; acctData = null; if (tk) api('/players/logout', { session: tk }).catch(() => {}); go('/arena/'); });
}

// ── « My account » (service 0.32.0): my tournaments, tickets, groups,
// preferences kept with the account, devices, closing the account ──
let acctData = null, acctLoading = false;   // { profile, mine } of the signed-in player
function loadAccount() {
  if (!me || acctLoading) return;
  acctLoading = true;
  const tk = me.token;
  Promise.all([api('/players/profile', { session: tk }), api('/players/mine', { session: tk })]).then(([pr, mi]) => {
    if (!me || me.token !== tk) return;
    acctData = { profile: pr && pr.ok ? pr : null, mine: mi && mi.ok ? mi : null };
    if (mi && mi.ok && mi.groups) grMine = mi.groups;
    if (acctView === 'account') renderAcctView();
  }).catch(() => {}).then(() => { acctLoading = false; });
}
// The language and the theme of the account, on this device too.
async function applyPrefs(p) {
  if (!p) return;
  if (p.theme && theme && theme.get() !== p.theme) theme.set(p.theme, true);
  if (p.lang && p.lang !== lang && meta[p.lang]) { lsSet('pth_lang', p.lang); await loadLang(p.lang); }
}
function savePrefs(patch) {
  if (!me) return Promise.resolve(null);
  return api('/players/prefs', Object.assign({ session: me.token }, patch)).then((d) => { if (d && d.ok && acctData && acctData.profile) acctData.profile.prefs = d.prefs; return d; }).catch(() => null);
}
function acctAccountHtml() {
  const day = (ts) => { try { return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(ts)); } catch (e) { return new Date(ts).toLocaleDateString(); } };
  const pr = acctData && acctData.profile, mi = acctData && acctData.mine;
  if (!acctData) loadAccount();
  let h = '<section class="card"><h2>' + esc(me.nick) + '</h2>' + (acctData ? acctMsg() : '') +
    (pr ? '<p class="small muted">' + T('acctSince', { date: day(pr.accountSince) }) + '</p>' : '') +
    '<div class="actions"><a class="btn" href="/arena/p/' + encodeURIComponent(me.nick) + '" data-go>' + T('accMyPage') + '</a><button type="button" class="ghost" id="accOut">' + T('accSignOut') + '</button></div></section>';
  // My tournaments: coming and playing, then the last ones finished; my cups.
  h += '<section class="card"><h2>' + T('acctMyTournaments') + '</h2>';
  if (!mi) h += '<p class="empty">' + T('loading') + '</p>';
  else {
    if (mi.now.length) h += '<h3>' + T('acctNow') + '</h3><ul class="tlist">' + mi.now.map((c) => card(c).replace('</span></span></a></li>', (c.checkedIn ? ' · <b>' + T('acctCheckedIn') + '</b>' : '') + '</span></span></a></li>')).join('') + '</ul>';
    else h += '<p class="small muted">' + T('acctNoReg') + ' <a href="/arena/tournaments" data-go>' + T('allTournaments') + ' →</a></p>';
    if (mi.past.length) h += '<h3>' + T('acctPast') + '</h3><ul class="evl">' + mi.past.map((c) => '<li><a class="evr" href="/arena/t/' + esc(c.key) + '" data-go><span class="evm"><span class="evt">' + esc(c.name) + '</span><span class="evs">' + esc(day(c.at)) + '</span></span><span class="evw">' +
      (c.place ? T('placeOf', { place: c.place, of: c.players }) : c.absent ? '—' : '') + '</span></a></li>').join('') + '</ul>';
    if (mi.cups.length) h += '<h3>' + T('acctCupsReg') + '</h3><ul class="evl">' + mi.cups.map((c) => '<li><a class="evr" href="/arena/c/' + esc(c.key) + '" data-go><span class="evm"><span class="evt">' + esc(c.name) + '</span></span><span class="evw"><span class="chip ' + (c.status === 'closed' ? 'done' : 'live') + '">' + T(c.status === 'closed' ? 'cupStatusClosed' : 'cupStatusOpen') + '</span></span></a></li>').join('') + '</ul>';
  }
  h += '</section>';
  // Tickets of the season, my groups.
  if (mi && mi.tickets.length) h += '<section class="card"><h2>' + T('tkMine', { season: mi.season || '' }) + '</h2><ul class="chips">' + mi.tickets.map((x) => '<li>' + esc(x.name) + ' <b>×' + esc(x.count) + '</b></li>').join('') + '</ul></section>';
  const mineG = grAll.filter((g) => grMine.member.indexOf(g.id) >= 0), askedG = grAll.filter((g) => grMine.requested.indexOf(g.id) >= 0);
  h += '<section class="card"><h2>' + T('grTitle') + '</h2>' + (mineG.length ? '<ul class="chips">' + mineG.map((g) => '<li>' + esc(g.name) + '</li>').join('') + '</ul>' : '<p class="small muted">' + T('grHint') + '</p>') +
    (askedG.length ? '<p class="small">' + T('grAsked') + ' ' + askedG.map((g) => esc(g.name)).join(', ') + '</p>' : '') +
    '<p class="small"><a href="/arena/groups" data-go>' + T('navGroups') + ' →</a></p></section>';
  h += vfHtml();
  // Preferences, kept with the account.
  const pf = (pr && pr.prefs) || {};
  h += '<section class="card"><h2>' + T('acctPrefs') + '</h2><p class="small muted">' + T('acctPrefsHint') + '</p><div class="row">' +
    '<div><label for="acPfLang">' + T('language') + '</label><select id="acPfLang">' + langAvail.map((c) => '<option value="' + esc(c) + '"' + (c === (pf.lang || lang) ? ' selected' : '') + '>' + esc((meta[c] || {}).label || c) + '</option>').join('') + '</select></div>' +
    '<div><label for="acPfTheme">' + T('acctTheme') + '</label><select id="acPfTheme">' + [['auto', 'themeAuto'], ['dark', 'themeDark'], ['light', 'themeLight']].map((o) => '<option value="' + o[0] + '"' + (o[0] === (pf.theme || (theme ? theme.get() : 'auto')) ? ' selected' : '') + '>' + T(o[1]) + '</option>').join('') + '</select></div></div></section>';
  // Security: the password, the devices signed in, closing the account.
  h += '<section class="card"><h2>' + T('acctSecurity') + '</h2>' +
    '<form id="accPwForm"><h3>' + T('accChangePw') + '</h3><div class="row"><div><label for="accPwOld">' + T('accCurPassword') + '</label><input id="accPwOld" type="password" autocomplete="current-password" required></div>' +
    '<div><label for="accPwNew">' + T('accNewPassword') + '</label><input id="accPwNew" type="password" autocomplete="new-password" minlength="8" required></div></div><div class="actions"><button type="submit">' + T('accChangePw') + '</button></div></form>';
  if (pr) {
    h += '<h3>' + T('acctDevices', { n: pr.sessions.length }) + '</h3><ul class="small">' + pr.sessions.map((x) => '<li>' + T('acctSignedInAt', { date: day(x.created) }) + (x.current ? ' — <b>' + T('acctThisDevice') + '</b>' : '') + '</li>').join('') + '</ul>' +
      (pr.sessions.length > 1 ? '<div class="actions"><button type="button" class="ghost" id="acOthersOut">' + T('acctOthersOut') + '</button></div>' : '');
  }
  h += '<details class="sub"><summary>' + T('acctClose') + '</summary><p class="small">' + T('acctCloseHint') + '</p><form id="acCloseForm" class="row"><div><label for="acClosePw">' + T('accCurPassword') + '</label><input id="acClosePw" type="password" autocomplete="current-password" required></div>' +
    '<button type="submit" class="danger">' + T('acctCloseBtn') + '</button></form></details></section>';
  return h;
}
function wireAccount() {
  const pl = $('acPfLang'), pt = $('acPfTheme');
  if (pl) pl.addEventListener('change', async () => { await savePrefs({ lang: pl.value }); lsSet('pth_lang', pl.value); await loadLang(pl.value); acctFlash = { html: T('acctSaved') }; renderAcctView(); });
  if (pt) pt.addEventListener('change', async () => { if (theme) theme.set(pt.value, true); await savePrefs({ theme: pt.value }); acctFlash = { html: T('acctSaved') }; renderAcctView(); });
  const oo = $('acOthersOut');
  if (oo) oo.addEventListener('click', async () => { const d = await api('/players/logoutothers', { session: me.token }); acctFlash = d.ok ? { html: T('acctOthersDone', { n: d.ended }) } : { bad: true, html: errText(d) }; acctData = null; renderAcctView(); });
  const cf = $('acCloseForm');
  if (cf) cf.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!window.confirm(t('acctCloseHint'))) return;
    const d = await api('/players/close', { session: me.token, password: $('acClosePw').value });
    if (!d.ok) { acctFlash = { bad: true, html: errText(d) }; return renderAcctView(); }
    me = null; acctSave(null); acctData = null; grMine = { member: [], requested: [] }; vf = null;
    acctFlash = { html: T('acctClosed') }; go('/arena/login');
  });
}

// ── proving the nickname on a game server (service 0.28.0) ──────────
function vfHtml() {
  if (!me || !vfServers.length) return '';
  const p = vf && vf.pending, done = vf && vf.verified && vf.verified.length;
  let h = '<section class="card"><h2>' + T('vfTitle') + (done ? ' ✓' : '') + '</h2>';
  if (done) h += '<p class="small">' + T('vfList', { list: vf.verified.map((v) => v.server).join(', ') }) + '</p>';
  if (p && p.done) h += '<p class="msg ok">' + T('vfOk', { server: p.server }) + '</p>';
  else if (p && p.error) h += '<p class="msg bad">' + T('vfError', { error: p.error }) + '</p>';
  else if (p) {
    const s = vfServers.find((x) => x.name === p.server) || {};
    h += '<p>' + T('vfHow', { server: p.server, host: (s.host || '') + (s.port ? ':' + s.port : ''), nick: me.nick, code: p.code, bot: p.bot || 'TD-check' }) + '</p><p class="small muted">' + T('vfWaiting') + '</p>';
  }
  h += '<p class="small muted">' + T('vfHint') + '</p><form id="vfForm" class="row"><div><label for="vfSrv">' + T('vfServer') + '</label><select id="vfSrv">' +
    vfServers.map((s) => '<option value="' + esc(s.ref) + '">' + esc(s.name) + '</option>').join('') + '</select></div><button type="submit">' + T('vfGet') + '</button></form>';
  return h + '</section>';
}
function vfPoll() {
  clearTimeout(vfTimer);
  if (!me) return;
  api('/players/verifystatus', { session: me.token }).then((d) => {
    if (!d || !d.ok) return;
    const was = vf && vf.pending && vf.pending.done;
    vf = { pending: d.pending, verified: d.verified || [] };
    if (!was) renderAcct();
    if (d.pending && !d.pending.done && !d.pending.error) vfTimer = setTimeout(vfPoll, 3000);
  }).catch(() => {});
}

// ── routing ────────────────────────────────────────────────────────
const VIEW_TITLE = { tournaments: 'navTournaments', cups: 'navCups', groups: 'navGroups' };
function route() {
  clearTimeout(pollTimer);
  curKey = null; cur = null; acctView = null;
  closeLangPop();
  // An old invitation link (/arena#pinvite=…): the sign-in page takes it.
  if (pinviteFromHash() && !/^\/arena\/login\/?$/.test(location.pathname)) { history.replaceState(null, '', '/arena/login' + location.hash); }
  $('heroTitle').textContent = t('title');
  $('heroText').textContent = t('intro');
  heroImage(null);
  const vm = /^\/arena\/(tournaments|cups|groups|login|account)\/?$/.exec(location.pathname);
  const view = vm ? vm[1] : null;
  document.body.classList.toggle('inner', navKey() !== 'home');
  updateNav();
  const key = keyFromPath(), ckey = cupKeyFromPath(), pnick = playerFromPath();
  if (key) showOne(key); else if (ckey) showCup(ckey); else if (pnick) showPlayer(pnick);
  else if (view === 'login' || view === 'account') { acctView = view; if (view === 'account') acctData = null; renderAcctView(); }
  else if (view) { $('heroTitle').textContent = t(VIEW_TITLE[view]); showList(view); }
  else showHome();
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
  try { meta = (await import('/arena/lang-meta.mjs')).LANG_META || meta; } catch (e) {}
  const avail = Object.keys(meta);
  const code = pickLang(avail);
  initLangPick(avail, async (c) => {
    lsSet('pth_lang', c);   // the same choice as the app's
    savePrefs({ lang: c });   // and the account's, when signed in
    await loadLang(c);
    renderAcct();
    if (cur) renderOne(); else route();
  });
  theme = initTheme($('themeBtn'), (m) => t(m === 'dark' ? 'themeDark' : m === 'light' ? 'themeLight' : 'themeAuto'), (m) => savePrefs({ theme: m }));
  await loadLang(code);
  // The account: the session kept here, still valid? How accounts are made.
  const saved = acctLoad();
  const [st, who] = await Promise.all([api('/players').catch(() => ({})), saved ? api('/players/me', { session: saved.token }).catch(() => ({})) : Promise.resolve(null)]);
  signupMode = (st && st.signup) || 'invite';
  vfServers = (st && st.servers) || [];
  grAll = (st && st.groups) || [];
  if (saved && who && who.ok) { me = { token: saved.token, nick: who.player.nick }; grMine = who.groups || grMine; await applyPrefs(who.prefs); } else if (saved && who && who.code === 'session') acctSave(null);
  renderAcct();
  if (me) vfPoll();
  route();
  // Installable, and still opens without the network (sw.js, scope /arena/).
  try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/arena/sw.js', { scope: '/arena/' }).catch(() => {}); } catch (e) {}
  const net = () => { const o = $('offline'); if (o) o.hidden = navigator.onLine !== false; };
  window.addEventListener('online', () => { net(); route(); });
  window.addEventListener('offline', net);
  net();
})();

// ── the language picker: each language with its flag (lang-meta) ──
let langAvail = [], langPicked = null;
function langButton() {
  const m = meta[lang] || {};
  if ($('langFlag')) $('langFlag').innerHTML = m.flag || '';
  if ($('langName')) $('langName').textContent = m.label || lang;
  if ($('langBtn')) $('langBtn').setAttribute('aria-label', t('language') + ': ' + (m.label || lang));
}
function langListHtml(q) {
  const f = String(q || '').trim().toLowerCase();
  return langAvail.filter((c) => !f || c.toLowerCase().indexOf(f) === 0 || String((meta[c] || {}).label || '').toLowerCase().indexOf(f) >= 0)
    .map((c) => '<li role="option" tabindex="-1" data-lang="' + esc(c) + '"' + (c === lang ? ' aria-selected="true"' : '') + '><span class="lp-flag">' + ((meta[c] || {}).flag || '') + '</span><span>' + esc((meta[c] || {}).label || c) + '</span></li>').join('');
}
function closeLangPop() {
  const p = $('langPop'); if (!p || p.hidden) return;
  p.hidden = true; $('langBtn').setAttribute('aria-expanded', 'false');
}
function initLangPick(avail, onPick) {
  langAvail = avail; langPicked = onPick;
  const btn = $('langBtn'), pop = $('langPop'), list = $('langList'), find = $('langFind');
  if (!btn) return;
  const open = () => {
    find.value = ''; list.innerHTML = langListHtml('');
    pop.hidden = false; btn.setAttribute('aria-expanded', 'true');
    const cur = list.querySelector('[aria-selected="true"]');
    if (cur) cur.scrollIntoView({ block: 'center' });
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) find.focus(); else if (cur) cur.focus();
  };
  btn.addEventListener('click', () => (pop.hidden ? open() : closeLangPop()));
  find.addEventListener('input', () => { list.innerHTML = langListHtml(find.value); });
  const pick = (li) => { if (!li) return; closeLangPop(); btn.focus(); if (li.dataset.lang !== lang) langPicked(li.dataset.lang); };
  list.addEventListener('click', (ev) => pick(ev.target.closest('li[data-lang]')));
  pop.addEventListener('keydown', (ev) => {
    const items = [...list.querySelectorAll('li[data-lang]')];
    const i = items.indexOf(document.activeElement);
    if (ev.key === 'Escape') { ev.preventDefault(); closeLangPop(); btn.focus(); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); (items[i + 1] || items[0] || find).focus(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); (i > 0 ? items[i - 1] : find).focus(); }
    else if (ev.key === 'Enter' && i >= 0) { ev.preventDefault(); pick(items[i]); }
    else if (ev.key === 'Enter' && document.activeElement === find && items.length === 1) { ev.preventDefault(); pick(items[0]); }
  });
  document.addEventListener('click', (ev) => { if (!pop.hidden && !ev.target.closest('#langPick')) closeLangPop(); });
}
