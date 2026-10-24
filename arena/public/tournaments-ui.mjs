// ═══════════════════════════════════════════════════════════════════
// /arena — « Tournaments » view (2026-10-23).
//
// Create a tournament, add the players by hand, then either let the director
// open the table on the LAN server (invitations, seat check, hand-over,
// result recorded by itself) or set the result in one of three ways: typed
// (ordered list), a finished Table check's sealed result, or a PokerTH log
// (.pdb) with the game picked. Validation signs it; a correction is added to
// the journal, never written over.
// Talks to /admin/arena/t/*; server: arena/lib/tournaments.mjs.
// English only for now, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

import { createTableForm } from './table-form.mjs';

const PROFILE_TEXT = {
  friendly: 'Friendly — validated at once, corrections free, unlisted, kept 30 days.',
  club: 'Club — validated at once, corrections free, public, kept one year.',
  official: 'Official — an organizer validates, corrections need a second organizer, kept for good.',
  custom: 'Custom — your own choices below.',
};
const CHOICES = {
  identity: ['simple', 'code', 'accounts'],
  witnesses: ['off', 'informative', 'required'],
  validation: ['auto', 'organizer'],
  corrections: ['free', 'second'],
  collusion: ['off', 'report', 'separate', 'forbid'],
};
const SETTING_LABEL = { identity: 'Identity', witnesses: 'Witnesses', validation: 'Validation', corrections: 'Corrections', visibility: 'Visibility', archiveDays: 'Kept (days, 0 = for good)', collusion: 'Collusion check' };
const STATUS = { draft: 'draft', registration: 'players', running: 'table open', finished: 'to validate', validated: 'validated' };
// Table settings: ./table-form.mjs (the web client's create-game choices).
const HOST_PHASE = {
  create: 'Opening the table…', seated: 'Table open: inviting the registered players and checking every seat',
  handover: 'Handing the table over…', watch: 'Handed over: the director watches as a spectator',
};
const PLAYER_STATUS = { seated: ['seated', 'done'], invited: ['invited', 'live'], online: ['connected', ''], offline: ['not connected', 'warn'],
  absent: ['absent', 'bad'], 'declined-no': ['declined', 'bad'], 'declined-busy': ['in another game', 'warn'] };
const SOURCE = { manual: 'typed in', watch: 'Table check', pdb: 'log (.pdb)' };
// Players who do not come to the table (arena/lib/tournaments.mjs ABSENCE_AUTO).
const ABSENCE_AUTO = { mode: 'auto', strikes: 3, retrySec: 60, graceMin: 10 };
const ABSENT_WHY = { failures: 'did not come', neverConnected: 'never connected', offline: 'not connected', notSeatedAtStart: 'not seated at the start' };
export function absenceFields(p, a, esc) {
  a = Object.assign({}, ABSENCE_AUTO, a || {});
  const num = (k, min, max, label) => '<div><label for="' + p + k + '">' + label + '</label><input id="' + p + k + '" type="number" inputmode="numeric" min="' + min + '" max="' + max + '" value="' + esc(a[k]) + '"></div>';
  return '<div class="row"><div><label for="' + p + 'mode">Players who do not come to the table</label><select id="' + p + 'mode" data-absmode="' + p + '">' +
    [['auto', 'Automatic — 3 failures, invited again every minute, absent from 10 min after the start'], ['custom', 'Custom — your numbers'], ['manual', 'Manual — the organizer decides (« Start without the absent »)']]
      .map((o) => '<option value="' + o[0] + '"' + (o[0] === a.mode ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></div></div>' +
    '<div class="row" id="' + p + 'custom"' + (a.mode === 'custom' ? '' : ' hidden') + '>' + num('strikes', 1, 10, 'Failures before absent') + num('retrySec', 20, 600, 'Seconds between invitations') + num('graceMin', 0, 120, 'Minutes after the start before anyone is absent') + '</div>' +
    '<p class="small muted">A refusal, an invitation left unanswered, « busy » in another game or a seat left before the start is a failure; a player who comes back to the server or leaves another game is invited at once. Not connected after the delay: absent too.</p>';
}
export function readAbsence(p) {
  const m = document.getElementById(p + 'mode');
  if (!m) return undefined;
  const o = { mode: m.value };
  if (m.value === 'custom') for (const k of ['strikes', 'retrySec', 'graceMin']) o[k] = Number(document.getElementById(p + k).value);
  return o;
}
document.addEventListener('change', (e) => {
  const p = e.target && e.target.dataset && e.target.dataset.absmode;
  if (p) { const c = document.getElementById(p + 'custom'); if (c) c.hidden = e.target.value !== 'custom'; }
});

export function createTournamentsView(deps) {
  const { api, esc, tok } = deps;
  const TF = createTableForm({ esc });
  const IP = deps.images;
  // The image of the open tournament: a click saves it (also once validated).
  IP.setPick('tim_cur', (img) => { if (cur) call('/admin/arena/t/update', { patch: { image: img } }, 'Image changed.'); });
  const $ = (id) => document.getElementById(id);
  let list = [];
  let cur = null;            // the open tournament (server view)
  let order = [];            // typed ranking being arranged
  let corrOrder = [];        // correction being arranged
  let source = 'manual';
  let flash = null;          // { text, bad } shown once in the detail

  // The director's chat language: every language of the app (the web
  // client's list), English until it has loaded.
  let LANGS = [['en', 'English']];
  const langName = (c) => { const x = LANGS.find((l) => l[0] === c); return x ? x[1] + ' (' + c + ')' : c; };
  const langOptions = (sel) => (sel && !LANGS.some((l) => l[0] === sel) ? LANGS.concat([[sel, sel]]) : LANGS).map((l) => '<option value="' + esc(l[0]) + '"' + (l[0] === sel ? ' selected' : '') + '>' + esc(l[1]) + ' (' + esc(l[0]) + ')</option>').join('');
  import('/modules/lang-meta.mjs').then((m) => {
    const meta = m.LANG_META || {};
    const all = Object.keys(meta).map((c) => [c.toLowerCase(), meta[c].label || c]);
    if (!all.length) return;
    LANGS = all;
    const sel = $('tChatLang'); const keep = sel.value || 'en';
    sel.innerHTML = langOptions(keep);
    if (cur) render();
  }).catch(() => {});

  // ── create form ──────────────────────────────────────────────────
  function fillServers() {
    const sel = $('tSrv');
    const keep = sel.value;
    sel.innerHTML = '<option value="">— not said —</option>' + (deps.servers() || []).map((s) => '<option value="' + esc(s.ref) + '">' + esc(s.name) + ' — ' + esc(s.host) + ':' + esc(s.port) + '</option>').join('');
    sel.value = keep;
  }
  $('tCustom').innerHTML = Object.keys(CHOICES).map((k) => '<div><label for="tc_' + k + '">' + esc(SETTING_LABEL[k]) + '</label><select id="tc_' + k + '">' +
    CHOICES[k].map((v) => '<option' + (v === { identity: 'simple', witnesses: 'informative', validation: 'auto', corrections: 'free', collusion: 'report' }[k] ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></div>').join('') +
    '<div><label for="tc_archiveDays">' + esc(SETTING_LABEL.archiveDays) + '</label><input id="tc_archiveDays" type="number" min="0" max="3650" value="365" inputmode="numeric"></div>';
  function profileNote() {
    const p = $('tProfile').value;
    $('tProfileNote').textContent = PROFILE_TEXT[p] || '';
    $('tCustom').hidden = p !== 'custom';
    // The table password: on by default with the identity « personal code ».
    const idc = p === 'official' || (p === 'custom' && $('tc_identity') && $('tc_identity').value === 'code');
    $('tTablePass').checked = idc;
  }
  document.addEventListener('change', (e) => { if (e.target && e.target.id === 'tc_identity') profileNote(); });
  $('tProfile').addEventListener('change', profileNote);
  const formatNote = () => { const m = $('tFormat').value === 'multi'; $('tFinalBox').hidden = !m; $('tFormatNote').hidden = !m; };
  $('tFormat').addEventListener('change', formatNote);
  formatNote();
  profileNote();

  $('tCreateForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const srv = (deps.servers() || []).find((s) => s.ref === $('tSrv').value);
    const body = { name: $('tName').value.trim(), profile: $('tProfile').value, format: $('tFormat').value === 'multi' ? 'multi' : 'sitngo' };
    if (srv) body.server = { ref: srv.ref, name: srv.name, host: srv.host, port: srv.port };
    if ($('tDate').value) { const ts = new Date($('tDate').value).getTime(); if (ts > 0) body.startsAt = ts; }
    if ($('tVis').value) body.visibility = $('tVis').value;
    body.table = readTable('tt_');
    const img = IP.value('tim_new'); if (img) body.image = img;
    body.run = { autoOpen: $('tAuto').checked, openBefore: Number($('tBefore').value), announce: $('tAnnounce').checked, selfRegister: $('tSelfReg').checked, chatLang: $('tChatLang').value || 'en', qmlWitnesses: $('tQmlWit').checked, finalists: Number($('tFinalists').value) || 2, absence: readAbsence('ta_'), tablePassword: $('tTablePass').checked };
    if (body.profile === 'custom') {
      body.settings = {};
      for (const k of Object.keys(CHOICES)) body.settings[k] = $('tc_' + k).value;
      body.settings.archiveDays = parseInt($('tc_archiveDays').value, 10);
    }
    msg('tCreateMsg', 'Creating…');
    api('/admin/arena/t/create', body).then((d) => {
      if (!d.ok) return msg('tCreateMsg', d.error || 'Refused', true);
      msg('tCreateMsg', 'Created.', false, 'ok');
      $('tName').value = ''; $('tDate').value = ''; $('tTable').innerHTML = TF.html('tt_'); $('tImg').innerHTML = IP.html('tim_new', 'tournament', null);
      show(d, 'Created. Add the players, then set the result.');
      refresh();
    }).catch((e) => msg('tCreateMsg', e.message === 'forbidden' ? '' : 'Network error', true));
  });

  const tableFields = (prefix, v) => TF.html(prefix, v);
  function runFields(r) {
    r = Object.assign({ autoOpen: false, openBefore: 10, announce: true, checkInBefore: 30, chatLang: 'en' }, r || {});
    return '<div class="row"><label class="ck"><input type="checkbox" id="te_auto"' + (r.autoOpen ? ' checked' : '') + '> Open the table by itself</label><div><label for="te_before">minutes before the start</label><input id="te_before" type="number" inputmode="numeric" min="0" max="120" value="' + esc(r.openBefore) + '"></div></div>' +
      '<label class="ck"><input type="checkbox" id="te_announce"' + (r.announce ? ' checked' : '') + '> Announcements in the table chat</label>' +
      '<div class="row"><div><label for="te_chatlang">Language of the director in the chat</label><select id="te_chatlang">' + langOptions(r.chatLang) + '</select></div></div>' +
      '<label class="ck"><input type="checkbox" id="te_selfreg"' + (r.selfRegister !== false ? ' checked' : '') + '> Players can register themselves on the public page</label>' +
      '<label class="ck"><input type="checkbox" id="te_tablepass"' + (r.tablePassword ? ' checked' : '') + '> Table password, given on the players\' page against the personal code (a nickname taken by someone else cannot sit)</label>' +
      '<label class="ck"><input type="checkbox" id="te_qmlwit"' + (r.qmlWitnesses ? ' checked' : '') + '> Accept QML players as witnesses (their game log)</label>' +
      absenceFields('tea_', r.absence, esc) +
      '<div class="row"><div><label for="te_checkin">Check-in opens, minutes before the start (identity « code »)</label><input id="te_checkin" type="number" inputmode="numeric" min="5" max="240" value="' + esc(r.checkInBefore) + '"></div></div>';
  }
  const readTable = (prefix) => TF.read(prefix);
  const tableSummary = (t) => TF.summary(t);
  $('tTable').innerHTML = TF.html('tt_');
  $('tAbsence').innerHTML = absenceFields('ta_', null, esc);

  function msg(id, text, bad, cls) { const el = $(id); if (!el) return; el.className = 'msg' + (bad ? ' bad' : cls ? ' ' + cls : ''); el.textContent = text || ''; }

  // ── list ─────────────────────────────────────────────────────────
  function chip(st) {
    const cls = st === 'validated' ? 'done' : st === 'finished' ? 'warn' : st === 'registration' || st === 'running' ? 'live' : '';
    return '<span class="chip ' + cls + '">' + esc(STATUS[st] || st) + '</span>';
  }
  function when(ts) { return ts ? new Date(ts).toLocaleString() : ''; }
  function refresh() {
    fillServers();
    // The create-game lists, once (from the web client, through the service).
    if (!TF.ready()) TF.load(api).then(() => { if (!TF.ready()) return; $('tTable').innerHTML = TF.html('tt_'); if (cur) show(cur); }).catch(() => {});
    if (!IP.ready()) IP.load().then(() => { if (!IP.ready()) return; $('tImg').innerHTML = IP.html('tim_new', 'tournament', null); if (cur) show(cur); }).catch(() => {});
    return api('/admin/arena/t/list').then((d) => {
      if (!d.ok) return;
      list = d.tournaments || [];
      // The tables of a tournament on several tables, under it.
      const kids = (pid) => list.filter((x) => x.parentId === pid).sort((a, b) => ((a.stage && a.stage.kind === 'final') ? 99 : (a.stage || {}).index || 0) - ((b.stage && b.stage.kind === 'final') ? 99 : (b.stage || {}).index || 0));
      const item = (t, sub) => '<li' + (sub ? ' class="sub"' : '') + '><button type="button" data-id="' + esc(t.id) + '"' + (cur && cur.id === t.id ? ' aria-current="true"' : '') + '>' +
        '<span class="wt">' + (sub ? '↳ ' : '') + esc(t.name) + ' <span class="muted small">· ' + (t.format === 'multi' ? 'several tables · ' : '') + esc(t.profile) + ' · ' + t.players + ' player' + (t.players === 1 ? '' : 's') + (t.startsAt ? ' · ' + esc(when(t.startsAt)) : '') + '</span></span>' + chip(t.status) + '</button></li>';
      const top = list.filter((x) => !x.parentId);
      $('tList').innerHTML = top.length ? top.map((t) => item(t, false) + kids(t.id).map((k) => item(k, true)).join('')).join('')
        : '<li class="empty">None yet.</li>';
    }).catch(() => {});
  }
  $('tList').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-id]');
    if (b) open(b.dataset.id);
  });
  let pollTimer = null;
  function open(id, quiet) {
    clearTimeout(pollTimer);
    api('/admin/arena/t/get?id=' + encodeURIComponent(id)).then((d) => {
      if (!d.ok) { $('tDetailEmpty').hidden = false; $('tDetailEmpty').textContent = d.error || 'Unknown tournament'; $('tDetailBody').hidden = true; return; }
      // While the director runs the table, refresh only its block, so what
      // the organizer is typing elsewhere stays put.
      if (quiet && cur && cur.id === d.id && cur.status === d.status && $('tHostBox')) {
        cur = d;
        $('tHostBox').innerHTML = hostLive(d);
      } else if (quiet && cur && cur.id === d.id && cur.status === d.status && $('tStagesBox')) {
        cur = d;
        $('tStagesBox').innerHTML = stagesBox(d);
      } else if (!quiet || !cur || cur.id === d.id) {
        show(d, quiet && cur && cur.status !== d.status ? statusNote(d) : null);
        if (quiet) refresh();
      }
      if (d.host && d.host.status === 'open' && cur && cur.id === d.id) pollTimer = setTimeout(() => open(d.id, true), 2000);
      else if (d.stagesInfo && d.status !== 'validated' && cur && cur.id === d.id) pollTimer = setTimeout(() => open(d.id, true), 5000);
    }).catch(() => { if (quiet) pollTimer = setTimeout(() => open(id, true), 5000); });
  }
  function statusNote(d) {
    if (d.status === 'validated') return 'The director recorded the result; it is validated and signed.';
    if (d.status === 'finished') return 'The director recorded the result: look at it and validate.';
    if (d.host && d.host.resultError) return 'The director could not record the result by itself — see below.';
    return null;
  }

  // ── detail ───────────────────────────────────────────────────────
  function show(t, note, bad) {
    const changed = !cur || cur.id !== t.id;
    if (changed) clearTimeout(pollTimer);
    cur = t;
    if (changed) source = t.pdb ? 'pdb' : 'manual';
    order = t.players.map((p) => p.nick);
    corrOrder = t.result ? t.result.ranking.map((r) => r.nick) : [];
    flash = note ? { text: note, bad: !!bad } : null;
    document.querySelectorAll('#tList button').forEach((b) => b.setAttribute('aria-current', b.dataset.id === t.id ? 'true' : 'false'));
    render();
  }
  function arrange(arr, act) {
    return arr.map((n, i) => '<li><span class="pl">' + (i + 1) + '</span><span class="nk">' + esc(n) + '</span>' +
      '<button type="button" data-act="' + act + 'up" data-i="' + i + '" aria-label="Move ' + esc(n) + ' up"' + (i ? '' : ' disabled') + '>↑</button>' +
      '<button type="button" data-act="' + act + 'down" data-i="' + i + '" aria-label="Move ' + esc(n) + ' down"' + (i < arr.length - 1 ? '' : ' disabled') + '>↓</button></li>').join('');
  }
  function render() {
    const t = cur;
    const st = t.settings || {};
    let h = '<p>' + chip(t.status) + ' <span class="tname">' + esc(t.name) + '</span><br><span class="muted small">' + (t.format === 'multi' ? 'Several tables + final (' + esc((t.run || {}).finalists || 2) + ' per table)' : 'Sit &amp; Go') + ' · ' + esc(t.profile) + ' · ' + esc(st.visibility) +
      (t.server ? ' · ' + esc(t.server.name) + ' (' + esc(t.server.host) + ':' + esc(t.server.port) + ')' : '') + (t.startsAt ? ' · ' + esc(when(t.startsAt)) : '') + '</span></p>';
    if (t.inviteCode) h += '<p class="small">Invitation code <span class="mono">' + esc(t.inviteCode) + '</span></p>';
    if (t.publicKey) {
      // Its page for the players: listed when public; the link is the way in
      // when unlisted; with the invitation code when private.
      const link = window.location.origin + '/arena/t/' + t.publicKey + (st.visibility === 'private' && t.inviteCode ? '?invite=' + encodeURIComponent(t.inviteCode) : '');
      h += '<p class="small">Players\' page (' + esc(st.visibility) + ', registration ' + ((t.run || {}).selfRegister === false ? 'by you only' : 'open to players') + '): <a class="mono" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(link) + '</a> <button type="button" class="mini" data-act="copyLink" data-link="' + esc(link) + '">Copy</button></p>';
    }
    h += '<p class="small muted">' + Object.keys(SETTING_LABEL).map((k) => esc(SETTING_LABEL[k].replace(/ \(.*\)/, '')) + ': ' + esc(k === 'archiveDays' ? (st[k] ? st[k] + ' days' : 'for good') : st[k])).join(' · ') +
      '<br>Identity, witnesses and the collusion check are recorded now; they apply once registration and witnesses arrive.</p>';
    h += '<p class="small">The director writes in the chat in ' + esc(langName((t.run && t.run.chatLang) || 'en')) + (t.run && t.run.announce === false ? ' (announcements off)' : '') + '.</p>';
    h += '<div class="msg' + (flash && flash.bad ? ' bad' : flash ? ' ok' : '') + '" id="tMsg" role="status">' + esc(flash ? flash.text : '') + '</div>';
    flash = null;

    // Players.
    // Check-in (identity « code », Official): who confirmed with their code.
    const ci = st.identity === 'code';
    const nIn = t.players.filter((p) => p.checkedIn).length;
    if (t.parent) h += '<p class="small">' + (t.stage && t.stage.kind === 'final' ? 'The final table' : 'Table ' + esc(t.stage && t.stage.index)) + ' of <button type="button" class="mini" data-act="goto" data-id="' + esc(t.parent.id) + '">' + esc(t.parent.name) + '</button> — its players come from the draw.</p>';
    h += '<h3>Players (' + t.players.length + '/' + (t.format === 'multi' ? 40 : 10) + ')' + (ci ? ' · checked in ' + nIn + '/' + t.players.length : '') + '</h3>';
    if (ci && !t.result) {
      const before = (t.run && t.run.checkInBefore) || 30;
      h += '<p class="small muted">Check-in: each player confirms on the players\' page with their personal code' +
        (t.startsAt ? ', from ' + esc(new Date(t.startsAt - before * 60000).toLocaleString()) + ' (' + esc(before) + ' min before the start)' : ' (open now: no start date)') +
        '. Only the players checked in are invited; the others are marked absent when the table opens. Players you add get a code here; « New code » replaces a lost one.</p>';
    }
    const ciChip = (p) => (ci ? (p.checkedIn ? ' <span class="chip live">checked in</span>' : ' <span class="chip">not checked in</span>') : '');
    if (!t.result && !(t.host && t.host.status === 'open') && !t.parent && !t.stagesInfo) {
      h += t.players.length ? '<ul class="rank">' + t.players.map((p) => '<li><span class="nk">' + esc(p.nick) + (p.self ? ' <span class="chip">self</span>' : '') + ciChip(p) + '</span>' +
        (ci && !p.checkedIn ? '<button type="button" data-act="ckin" data-nick="' + esc(p.nick) + '" aria-label="Check ' + esc(p.nick) + ' in">Check in</button>' : '') +
        (ci ? '<button type="button" data-act="code" data-nick="' + esc(p.nick) + '" aria-label="New code for ' + esc(p.nick) + '">New code</button>' : '') +
        '<button type="button" data-act="rm" data-nick="' + esc(p.nick) + '" aria-label="Remove ' + esc(p.nick) + '">Remove</button></li>').join('') + '</ul>'
        : '<p class="empty">No player yet — add them here, or let the result bring them (Table check or log).</p>';
      if (t.players.length < 10) h += '<div class="row"><div><label for="tPlayerIn">PokerTH nickname</label><input id="tPlayerIn" maxlength="64" autocomplete="off" enterkeyhint="done"></div><button type="button" data-act="add">Add</button></div>';
    } else {
      h += '<p class="small">' + t.players.map((p) => esc(p.nick) + (ci && !t.result ? (p.checkedIn ? ' ✓' : '') : '')).join(', ') + '</p>';
    }

    // The table on the server.
    h += t.format === 'multi' ? stagesSection(t) : hostSection(t);

    // Witnesses: what the web clients at the table saw.
    h += witnessSection(t);
    // Collusion check: signals from the director's journal (organizers only).
    h += collusionSection(t);

    // Result.
    if (t.result) {
      const r = t.result;
      h += '<h3>Result</h3><div class="tablewrap"><table><thead><tr><th class="num">#</th><th>Player</th><th class="num">Out in hand</th><th class="num">Stack at start of that hand</th><th></th></tr></thead><tbody>' +
        r.ranking.map((x) => '<tr><td class="num">' + x.place + '</td><td>' + esc(x.nick) + '</td><td class="num">' + (x.winner ? '—' : x.elimHand != null ? x.elimHand : '') + '</td><td class="num">' + (x.stack != null ? x.stack : '') + '</td><td>' +
          (x.winner ? '<span class="chip done">winner</span>' : '') + (x.tie ? '<span class="chip warn">tie</span>' : '') + (x.unknown ? '<span class="chip warn">hand unknown</span>' : '') + '</td></tr>').join('') + '</tbody></table></div>';
      if (r.absent && r.absent.length) h += '<p class="small">Absent (not ranked): ' + r.absent.map(esc).join(', ') + '</p>';
      h += '<p class="small muted">From: ' + (r.byDirector ? 'the director, who ran the table · ' : '') + esc(SOURCE[r.source] || r.source) + (r.watchId ? ' ' + esc(r.watchId) : '') + (r.uniqueGameId != null ? ', game ' + esc(r.uniqueGameId) : '') + ' · <b>' + esc(r.status) + '</b>' + (r.corrected ? ' · corrected' : '') + '</p>';
      if (t.status === 'finished') {
        const ws = t.witnessState || {};
        const needReason = st.witnesses === 'required' && !ws.ok;
        h += '<p class="small">' + (r.status !== 'complete' ? 'Look at the flags above (tie, unknown hand, game not finished) before validating. ' : st.validation === 'organizer' ? 'This profile wants an organizer to validate. ' : '') + 'Validating seals and signs the result.</p>';
        if (t.collusion && t.collusion.flags) h += '<p class="msg bad">The collusion check flags ' + esc(t.collusion.flags) + ' pair' + (t.collusion.flags === 1 ? '' : 's') + ' — see « Collusion check » above before validating.</p>';
        if (needReason) {
          h += '<p class="msg bad">Witnesses required: ' + (ws.disagree ? esc(ws.disagree) + ' disagree' : 'no witness agrees yet') + '. To validate anyway, say why — the reason is kept in the journal and shown on the players\' page.</p>' +
            '<div class="row"><div><label for="tOverride">Reason</label><input id="tOverride" maxlength="200" autocomplete="off"></div></div>';
        }
        h += '<div class="actions"><button type="button" class="primary" data-act="validate">' + (needReason ? 'Validate anyway and sign' : 'Validate and sign') + '</button></div>';
      }
    }
    if (t.status !== 'validated' && !(t.host && t.host.status === 'open')) h += sourcePanel(t);
    else if (t.pendingCorrection) {
      // Official: a correction waits for a second organizer.
      const pc = t.pendingCorrection, mine = String(pc.by).toLowerCase() === String(deps.you() || '').toLowerCase();
      h += '<h3>Correction waiting</h3><p class="small">Proposed by <b>' + esc(pc.by) + '</b> (' + esc(when(pc.at)) + '): ' + esc(pc.reason) + '<br><span class="muted">' + esc(pc.before.join(' > ')) + ' → ' + esc(pc.after.join(' > ')) + '</span></p>' +
        (mine ? '<p class="small muted">A second organizer must approve it — not you. Organizers sign in to this page with their own key (Admin › Keys, category « Tournaments »).</p><div class="actions"><button type="button" data-act="corrReject">Withdraw it</button></div>'
          : '<div class="row"><div><label for="tRejWhy">Reason (to reject)</label><input id="tRejWhy" maxlength="200" autocomplete="off"></div></div><div class="actions"><button type="button" class="primary" data-act="corrApprove">Approve and sign</button><button type="button" data-act="corrReject">Reject</button></div>');
    } else {
      const second = st.corrections === 'second';
      h += '<details class="sub"><summary>Correct the result</summary><p class="small muted">The validated result stays in the journal; the correction is added with your reason, and the result is signed again.' + (second ? ' This profile needs a second organizer: your correction waits until another organizer approves it.' : '') + '</p>' +
        '<ul class="rank">' + arrange(corrOrder, 'c') + '</ul><label for="tReason">Reason</label><input id="tReason" maxlength="200" autocomplete="off">' +
        '<div class="actions"><button type="button" class="primary" data-act="correct">' + (second ? 'Propose the correction' : 'Record the correction') + '</button></div></details>';
    }
    if (t.corrections && t.corrections.length) {
      h += '<h3>Corrections</h3><ul class="small">' + t.corrections.map((c) => '<li>' + esc(when(c.at)) + ' · ' + esc(c.author) + (c.approvedBy ? ', approved by ' + esc(c.approvedBy) : '') + ' — ' + esc(c.reason) + '<br><span class="muted">' + esc(c.before.join(' > ')) + ' → ' + esc(c.after.join(' > ')) + '</span></li>').join('') + '</ul>';
    }

    // Image (any time; the tables of a tournament on several tables take its image).
    if (!t.parentId) h += '<details class="sub"><summary>Image</summary>' + IP.html('tim_cur', 'tournament', t.image || null) + '</details>';
    // The super admin (master key) may delete the tournament and all its data.
    if (!t.parentId && deps.you && deps.you() === 'admin') {
      h += '<details class="sub"><summary>Delete this tournament</summary><p class="small">Deletes the tournament and all its data: players, result, journal, signed result, witnesses' + (t.format === 'multi' ? ', its tables' : '') + ' and the medals it gave. A cup that uses it shows it as missing. This cannot be undone.' + (t.host && t.host.status === 'open' ? ' Close the table first.' : '') + '</p>' +
        '<div class="row"><div><label for="tDelName">Type the name of the tournament to confirm</label><input id="tDelName" autocomplete="off" placeholder="' + esc(t.name) + '"></div>' +
        '<button type="button" class="danger" data-act="tDelete">Delete the tournament</button></div></details>';
    }
    // Edit (until validated).
    if (t.status !== 'validated') {
      h += '<details class="sub"><summary>Edit</summary><div class="row"><div><label for="tEName">Name</label><input id="tEName" maxlength="60" value="' + esc(t.name) + '"></div>' +
        '<div><label for="tEDate">Date</label><input id="tEDate" type="datetime-local" value="' + esc(localInput(t.startsAt)) + '"></div>' +
        '<div><label for="tEVis">Visibility</label><select id="tEVis">' + ['public', 'unlisted', 'private'].map((v) => '<option' + (v === st.visibility ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></div></div>' +
        (t.host && t.host.status === 'open' ? '' : '<div class="row"><div><label for="tESrv">LAN server</label><select id="tESrv"><option value="">— not said —</option>' +
          (deps.servers() || []).map((sv) => '<option value="' + esc(sv.ref) + '"' + (t.server && t.server.ref === sv.ref ? ' selected' : '') + '>' + esc(sv.name) + ' — ' + esc(sv.host) + ':' + esc(sv.port) + '</option>').join('') + '</select></div></div>' +
          '<p class="small muted">Table settings</p>' + tableFields('te_', t.table)) +
        runFields(t.run) +
        '<div class="actions"><button type="button" data-act="save">Save</button></div></details>';
    }

    // Checks, history, files.
    if (t.checks) {
      const c = t.checks;
      const li = (good, text) => '<li' + (good ? '' : ' class="no"') + '>' + text + '</li>';
      h += '<h3>Checks</h3><ul class="checks">' + li(c.chain, 'Journal chain intact (' + c.entries + ' entries)') +
        (t.sealedHead ? li(c.headMatches, 'Signed head is in the journal') + li(c.signature, 'Signature valid') : '') + '</ul>';
      if (c.signedBy) h += '<p class="small muted">Signed by <span class="mono">' + esc(c.signedBy) + '</span></p>';
    }
    if (t.history && t.history.length) {
      h += '<details class="sub"><summary>Journal (' + t.history.length + ')</summary><ol class="history">' + t.history.map((e) => '<li><span class="muted">' + esc(when(e.ts)) + ' · ' + esc(e.author || '') + '</span> — ' + esc(e.summary) + '</li>').join('') + '</ol></details>';
    }
    h += '<div class="actions"><button type="button" data-act="f-journal">Download journal</button>' + (t.sealedHead ? '<button type="button" data-act="f-result">Download signed result</button>' : '') + (t.pdb ? '<button type="button" data-act="f-pdb">Download the log</button>' : '') + '</div>';

    $('tDetailEmpty').hidden = true;
    $('tDetailBody').hidden = false;
    $('tDetailBody').innerHTML = h;
    if (t.status !== 'validated' && source === 'watch') loadWatches();
  }

  // ── the director at the table ──
  // Collusion check (service 0.10.0): pairs who spare each other or pass chips,
  // with the numbers behind each signal. It never decides: the organizer does.
  // Several tables: the draw, the tables (each a Sit & Go of its own, opened
  // here or one by one), the final table, and where each stands.
  function stagesSection(t) {
    if (t.result) return '';
    return '<h3>Tables</h3><div id="tStagesBox">' + stagesBox(t) + '</div>';
  }
  function stagesBox(t) {
    const S = t.stagesInfo;
    const N = (t.run && t.run.finalists) || 2;
    if (!S) {
      const code = (t.settings || {}).identity === 'code';
      const n = t.players.filter((p) => !p.absent && (!code || p.checkedIn)).length;
      const tables = Math.min(4, Math.ceil(n / 10));
      return '<p class="small muted">' + (n < 11 ? 'Ten players or fewer: one table is enough (format « Sit &amp; Go »).' : 'The draw seats the players' + ((t.settings || {}).identity === 'code' ? ' who checked in' : '') + ' on ' + tables + ' tables, at random' + ((t.settings || {}).collusion === 'separate' ? ', keeping apart the pairs the collusion check flagged before' : '') + '; the first ' + N + ' of each table play the final table.') +
        (t.run && t.run.autoOpen && t.startsAt ? ' The director draws and opens them by itself ' + esc(t.run.openBefore) + ' min before the start.' : '') + '</p>' +
        '<div class="actions"><button type="button" class="primary" data-act="draw"' + (n >= 11 ? '' : ' disabled') + '>Draw the tables</button></div>';
    }
    const row = (c, label) => '<li><span class="nk">' + label + ' ' + chip(c.status) + (c.host === 'open' ? ' <span class="chip live">director at the table</span>' : '') +
      '<br><span class="small muted">' + esc(c.players.join(', ')) + (c.winner ? ' · winner ' + esc(c.winner) : '') + '</span></span><button type="button" data-act="goto" data-id="' + esc(c.id) + '">Open</button></li>';
    let h = '<ul class="rank">' + S.tables.map((c) => row(c, 'Table ' + esc(c.index))).join('') + (S.final ? row(S.final, '<b>Final table</b>') : '') + '</ul>';
    const toOpen = S.tables.filter((c) => c.host !== 'open' && c.status !== 'finished' && c.status !== 'validated').length;
    if (toOpen) h += '<div class="actions"><button type="button" class="primary" data-act="stagesOpen">Open the tables (' + toOpen + ')</button></div><p class="small muted">The director opens every table on the tournament\'s server, as for a Sit &amp; Go; each result is validated at its table.</p>';
    if (!S.final) {
      h += '<p class="small">Final table: the first ' + esc(S.N) + ' of each table — ' + (S.allValidated ? '<b>' + esc(S.finalists.join(', ')) + '</b>' : esc(S.finalists.length) + ' known so far (every table must be validated)') + '.</p>';
      if (S.allValidated) h += '<div class="actions"><button type="button" class="primary" data-act="final">Open the final table</button></div>';
    } else h += '<p class="small muted">The tournament\'s ranking follows from the final table once it is validated: the final first, then the others by their place at their table.</p>';
    if (t.openErrors && t.openErrors.length) h += '<p class="msg bad">' + t.openErrors.map(esc).join('<br>') + '</p>';
    return h;
  }
  function collusionSection(t) {
    const st = t.settings || {};
    if (st.collusion === 'off') return '';
    const c = t.collusion;
    const live = t.host && t.host.status === 'open';
    let h = '<h3>Collusion check <span class="muted small">' + esc(st.collusion) + (c ? ' · ' + esc(c.hands) + ' hands read' : '') + '</span></h3>';
    if (!c) h += '<p class="small muted">Done by itself when the director\'s result arrives; it reads what every player did in each hand (never their cards). ' + (live ? 'You can run it now on the hands played so far.' : '') + '</p>';
    else if (!c.hands) h += '<p class="small muted">No hand to read: the director\'s journal has no actions (a table run before service 0.10.0, or no hand played).</p>';
    else if (!c.pairs.length) h += '<p class="small">Nothing to signal (' + esc(c.hands) + ' hands, ' + esc(when(c.at)) + ').</p>';
    else {
      h += '<p class="small muted">Signals, not proof: look at the hands, ask the players. ' + (st.collusion === 'separate' ? '« Separate » will keep flagged pairs apart once tournaments have several tables. ' : '') + 'Read ' + esc(when(c.at)) + '.</p>';
      h += '<ul class="rank">' + c.pairs.map((p) => '<li><span class="nk">' + esc(p.a) + ' — ' + esc(p.b) + ' <span class="chip ' + (p.level === 'flag' ? 'bad' : 'warn') + '">' + (p.level === 'flag' ? 'flagged' : 'note') + '</span>' +
        p.signals.map((x) => '<br><span class="small muted">' + esc(x.text) + '</span>').join('') + '</span></li>').join('') + '</ul>';
    }
    if (live || (c && t.status !== 'validated')) h += '<div class="actions"><button type="button" data-act="collusion">Check again</button></div>';
    return h;
  }
  // Witnesses (service 0.7.0): reports of the web clients at the table,
  // compared with the director's journal (or the ranking set by hand).
  const VERDICT = { agrees: ['agrees', 'live'], disagrees: ['disagrees', 'bad'], nothing: ['nothing to compare', ''], pending: ['waiting for the result', 'warn'] };
  function witnessSection(t) {
    const st = t.settings || {};
    if (st.witnesses === 'off') return '';
    const ws = t.witnessState || {};
    const list = t.witnesses || [];
    let h = '<h3>Witnesses <span class="muted small">' + esc(st.witnesses) + (list.length ? ' · ' + esc(ws.agree) + ' agree, ' + esc(ws.disagree) + ' disagree' : '') + '</span></h3>';
    if (t.witnessOverride) h += '<p class="small">Validated despite the witnesses (' + esc(t.witnessOverride.author) + '): ' + esc(t.witnessOverride.reason) + '</p>';
    if (!list.length) return h + '<p class="small muted">No report yet. Players with the web client send one when the game ends or when they leave the table: the stacks at the start of each hand and the winner, never their cards. ' +
      ((t.run && t.run.qmlWitnesses) ? 'QML players can send their game log on the players\' page. ' : '') +
      (st.witnesses === 'required' ? 'Validating needs one that agrees and none that disagrees (or a reason).' : 'Informative: they never block the result.') + '</p>';
    h += '<ul class="rank">' + list.map((w) => {
      const v = VERDICT[w.verdict] || [w.verdict, ''];
      const d = w.diff;
      const diff = !d ? '' : d.winner ? ' — winner: ' + esc(d.witness) + ' (director: ' + esc(d.director) + ')'
        : d.order ? ' — saw ' + esc(d.before) + ' out before ' + esc(d.after)
        : ' — hand ' + esc(d.hand) + ', ' + esc(d.nick) + ': ' + esc(d.witness == null ? 'absent' : d.witness) + ' (director: ' + esc(d.director == null ? 'absent' : d.director) + ')';
      return '<li><span class="nk">' + esc(w.nick) + ' <span class="chip ' + v[1] + '">' + esc(v[0]) + '</span>' + (w.source === 'log' ? ' <span class="chip">log</span>' : '') + (st.identity === 'code' ? (w.verified ? ' <span class="chip">code</span>' : ' <span class="chip warn">no code: does not count</span>') : '') +
        '<br><span class="small muted">hands ' + esc(w.from == null ? '—' : w.from + '–' + w.to) + ' (' + esc(w.common) + ' compared)' + (w.winner ? ' · winner ' + esc(w.winner) : '') + diff + '</span></span></li>';
    }).join('') + '</ul>';
    return h;
  }
  function hostSection(t) {
    if (t.status === 'validated' || (t.result && !(t.host && t.host.status === 'open'))) {
      return t.host ? '<p class="small muted">Table run by the director: ' + esc(t.host.status) + '.</p>' : '';
    }
    let h = '<h3>Table on the server</h3><p class="small muted">' + esc(tableSummary(t.table)) + '</p>';
    if (t.host && t.host.status === 'open') {
      return h + '<div class="hostbox" id="tHostBox" aria-live="polite">' + hostLive(t) + '</div>' +
        '<div class="row"><div><label for="tSay">Message to the table</label><input id="tSay" maxlength="200" autocomplete="off" enterkeyhint="send" placeholder="no links, no capitals"></div><button type="button" data-act="tSay">Send</button></div>';
    }
    const run = t.run || {};
    if (run.autoOpen && t.startsAt) {
      const at = t.startsAt - (run.openBefore || 0) * 60000;
      h += '<p class="small">The director opens the table by itself at ' + esc(new Date(at).toLocaleString()) + ' (' + esc(run.openBefore) + ' min before the start).</p>';
      if (t.autoTry && t.autoTry.reason) h += '<p class="msg bad">' + (t.autoTry.missed ? 'Not opened: ' : 'It could not open the table, it tries again every 2 minutes: ') + esc(t.autoTry.reason) + '</p>';
    }
    if (t.host && t.host.resultError) h += '<p class="msg bad">The director’s result could not be used by itself: ' + esc(t.host.resultError) + '. Set the result below — « From a Table check » offers its sealed result.</p>';
    else if (t.host) h += '<p class="small muted">Last table: ' + esc(t.host.status) + (t.host.error ? ' (' + esc(t.host.error) + ')' : '') + '.</p>';
    if (!t.server) return h + '<p class="small">Choose the tournament’s LAN server (Edit) so that the director can open the table.</p>';
    if (t.players.length < 2) return h + '<p class="small">Add at least two players: the director invites them to the table.</p>';
    return h + '<p class="small">The director opens an invite-only table on ' + esc(t.server.name) + ', invites each player as soon as they are connected, removes anyone who is not registered, then leaves its seat once everyone is seated: the first player becomes table admin and starts the game. It follows the game to the end and records the result here.</p>' +
      '<div class="actions"><button type="button" class="accent" data-act="tOpen">Open the table</button></div>';
  }
  function hostLive(t) {
    const L = t.hostLive || {}, H = L.host || {};
    const phase = L.status === 'running' ? 'Game running' + (L.hand ? ', hand ' + L.hand : '') : (HOST_PHASE[H.phase] || L.status || 'starting');
    let h = '<p><span class="chip live">' + esc(L.status || 'connecting') + '</span> ' + esc(phase) + '</p>';
    if (H.tableName) h += '<p class="small muted">Table « ' + esc(H.tableName) + ' »' + (H.gameId != null ? ' #' + esc(H.gameId) : '') + ' · director ' + esc(L.nick || '') + (H.admin ? ' · table admin ' + esc(H.admin) : '') + '</p>';
    if (t.tablePasswordNow) h += '<p class="small">Table password: <b class="mono">' + esc(t.tablePasswordNow) + '</b> <span class="muted">— players get it on their page with their personal code; give it by hand only to a player you know.</span></p>';
    if (H.registered && H.registered.length) {
      h += '<ul class="chips">' + H.registered.map((r) => { const s = PLAYER_STATUS[r.status] || [r.status, ''];
        const why = r.status === 'absent' && r.absentWhy ? ' — ' + (ABSENT_WHY[r.absentWhy] || r.absentWhy) : '';
        const f = r.failures && r.status !== 'seated' ? ' <span class="small muted">' + esc(r.failures) + ' failure' + (r.failures === 1 ? '' : 's') + '</span>' : '';
        return '<li>' + esc(r.nick) + ' <span class="chip ' + s[1] + '">' + esc(s[0] + why) + '</span>' + f + '</li>'; }).join('') + '</ul>';
      if (H.absence && H.absence.mode !== 'manual' && H.absence.deadline) h += '<p class="small muted">Absent players: ' + (H.absence.mode === 'auto' ? 'automatic' : 'custom') + ' — after ' + esc(H.absence.strikes) + ' failure' + (H.absence.strikes === 1 ? '' : 's') + ', invited again every ' + esc(H.absence.retrySec) + ' s, from ' + esc(when(H.absence.deadline)) + '.</p>';
      else if (H.absence && H.absence.mode === 'manual') h += '<p class="small muted">Absent players: manual — « Start without the absent » when you decide.</p>';
    }
    if (H.kicked && H.kicked.length) h += '<p class="small">Removed (not registered): ' + H.kicked.map(esc).join(', ') + '</p>';
    if (L.error) h += '<p class="msg bad">' + esc(L.error.code) + (L.error.data && L.error.data.reason ? ' (' + esc(L.error.data.reason) + ')' : '') + '</p>';
    if (L.logs && L.logs.length) h += '<details class="sub"><summary>Director log</summary><div class="log">' + L.logs.map(esc).join('\n') + '</div></details>';
    const seated = (H.registered || []).filter((r) => r.status === 'seated').length;
    h += '<div class="actions">' +
      (H.phase === 'seated' ? '<button type="button" class="primary" data-act="tGo"' + (seated >= 2 ? '' : ' disabled') + '>Start without the absent</button><button type="button" data-act="tReinvite">Invite again</button>' : '') +
      '<button type="button" class="danger" data-act="tClose">Close the table</button></div>';
    if (H.phase === 'seated') h += '<p class="small muted">« Start without the absent »: the players not seated are marked absent and not ranked; the director hands the table over. At least two seated players.</p>';
    return h;
  }

  function sourcePanel(t) {
    let h = '<h3>' + (t.result ? 'Set the result again' : 'Set the result') + '</h3><div class="seg" role="radiogroup" aria-label="Where the result comes from">' +
      Object.keys(SOURCE).map((k) => '<label><input type="radio" name="tSource" value="' + k + '"' + (k === source ? ' checked' : '') + '>' + esc({ manual: 'Type it', watch: 'From a Table check', pdb: 'From a log (.pdb)' }[k]) + '</label>').join('') + '</div>';
    if (source === 'manual') {
      if (t.players.length) h += '<p class="small muted">Arrange the players, winner first.</p><ul class="rank">' + arrange(order, 'm') + '</ul>';
      else h += '<label for="tManualTa">One nickname per line, winner first</label><textarea id="tManualTa" rows="6" autocomplete="off"></textarea>';
      h += '<div class="actions"><button type="button" class="accent" data-act="setManual">Use this ranking</button></div>';
    } else if (source === 'watch') {
      h += '<p class="small muted">The sealed result of a finished Table check: its signature is checked before it is used.</p>' +
        '<label for="tWatchSel">Finished watch</label><select id="tWatchSel"><option value="">Loading…</option></select>' +
        '<div class="actions"><button type="button" class="accent" data-act="setWatch">Use this result</button></div>';
    } else {
      h += '<p class="small muted">A PokerTH log of the game (Settings › Logs in the official client, or the web client’s log export). It is kept with the tournament as evidence. Ranking as on the BBC site: last hand played, then stack at its start.</p>';
      if (t.pdb) h += '<p class="small">Log imported · ' + esc(t.pdb.size) + ' bytes · sha256 <span class="mono">' + esc(String(t.pdb.sha256).slice(0, 16)) + '…</span></p>';
      h += '<div class="row"><div><label for="tPdbFile">' + (t.pdb ? 'Replace the log' : 'Log file') + '</label><input id="tPdbFile" type="file" accept=".pdb,application/octet-stream,application/x-sqlite3"></div><button type="button" data-act="upload">Import</button></div>';
      const games = t.pdb && t.pdb.games;
      if (games && games.length) {
        h += '<ul class="tables" aria-label="Games in this log">' + games.map((g, i) => '<li><label><input type="radio" name="tPdbGame" value="' + esc(g.uniqueGameId) + '"' + (games.length === 1 || (i === games.length - 1 && g.finished) ? ' checked' : '') + '>' +
          '<span><span class="tname">Game ' + esc(g.gameId) + '</span> <span class="chip ' + (g.finished ? 'done' : 'warn') + '">' + (g.finished ? 'finished' : 'not finished') + '</span><br><span class="muted small">' +
          esc(g.players.join(', ')) + ' · ' + esc(g.hands) + ' hand' + (g.hands === 1 ? '' : 's') + ' · stack ' + esc(g.startMoney) + '</span></span></label></li>').join('') + '</ul>' +
          '<div class="actions"><button type="button" class="accent" data-act="setPdb">Use this game</button></div>';
      }
    }
    return h;
  }

  function localInput(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function loadWatches() {
    api('/admin/arena/watches').then((d) => {
      const sel = $('tWatchSel');
      if (!sel || !d.ok) return;
      const done = (d.watches || []).filter((w) => w.status === 'finished');
      sel.innerHTML = done.length ? done.map((w) => '<option value="' + esc(w.id) + '">' + esc(w.gameName || ('#' + w.gameId)) + ' · ' + esc(w.server && w.server.name) + ' · ' + esc(when(w.startedAt)) + ' · ' + esc(w.resultStatus || '') + '</option>').join('')
        : '<option value="">No finished Table check yet</option>';
    }).catch(() => {});
  }

  // ── actions ──────────────────────────────────────────────────────
  function call(path, body, okText) {
    msg('tMsg', 'Working…');
    return api(path, Object.assign({ id: cur.id }, body)).then((d) => {
      if (!d.ok) return msg('tMsg', d.error || 'Refused', true);
      // A personal code is shown once: the organizer hands it to the player.
      if (d.issuedCode) okText = (okText ? okText + ' ' : '') + 'Personal code of ' + d.issuedCode.nick + ': ' + d.issuedCode.code + ' — give it to them for the check-in; it is not shown again.';
      show(d, okText);
      refresh();
    }).catch((e) => msg('tMsg', e.message === 'forbidden' ? '' : 'Network error', true));
  }
  function move(arr, i, dir) {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    const x = arr[i]; arr[i] = arr[j]; arr[j] = x;
  }
  $('tDetailBody').addEventListener('change', (ev) => {
    if (ev.target.name === 'tSource') { source = ev.target.value; render(); }
  });
  $('tDetailBody').addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target.id === 'tSay') { ev.preventDefault(); $('tDetailBody').querySelector('[data-act="tSay"]').click(); return; }
    if (ev.key === 'Enter' && ev.target.id === 'tPlayerIn') { ev.preventDefault(); $('tDetailBody').querySelector('[data-act="add"]').click(); }
  });
  $('tDetailBody').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-act]');
    if (!b || !cur) return;
    const a = b.dataset.act;
    const i = Number(b.dataset.i);
    if (a === 'mup' || a === 'mdown') { move(order, i, a === 'mup' ? -1 : 1); return rerankList('m', order); }
    if (a === 'cup' || a === 'cdown') { move(corrOrder, i, a === 'cup' ? -1 : 1); return rerankList('c', corrOrder); }
    if (a === 'add') {
      const nick = ($('tPlayerIn').value || '').trim();
      if (!nick) return;
      return call('/admin/arena/t/player', { action: 'add', nick }, nick + ' added.').then(() => { const el = $('tPlayerIn'); if (el) el.focus(); });
    }
    if (a === 'rm') return call('/admin/arena/t/player', { action: 'remove', nick: b.dataset.nick }, b.dataset.nick + ' removed.');
    if (a === 'ckin') return call('/admin/arena/t/checkin', { nick: b.dataset.nick }, b.dataset.nick + ' checked in.');
    if (a === 'code') {
      if (!window.confirm('A new personal code for ' + b.dataset.nick + '? The old one stops working.')) return;
      return call('/admin/arena/t/code', { nick: b.dataset.nick }, '');
    }
    if (a === 'setManual') {
      const ranking = cur.players.length ? order.slice() : ($('tManualTa').value || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (!ranking.length) return msg('tMsg', 'Type the ranking first.', true);
      return call('/admin/arena/t/result', { source: 'manual', ranking }, 'Result set.');
    }
    if (a === 'setWatch') {
      const w = $('tWatchSel').value;
      if (!w) return msg('tMsg', 'Pick a finished watch.', true);
      return call('/admin/arena/t/result', { source: 'watch', watchId: w }, 'Result taken from the Table check.');
    }
    if (a === 'setPdb') {
      const r = document.querySelector('input[name="tPdbGame"]:checked');
      if (!r) return msg('tMsg', 'Pick the game.', true);
      return call('/admin/arena/t/result', { source: 'pdb', uniqueGameId: Number(r.value) }, 'Result taken from the log.');
    }
    if (a === 'upload') return upload();
    if (a === 'validate') return call('/admin/arena/t/validate', $('tOverride') ? { override: ($('tOverride').value || '').trim() } : {}, 'Validated and signed.');
    if (a === 'correct') return call('/admin/arena/t/correct', { ranking: corrOrder.slice(), reason: ($('tReason').value || '').trim() }, (cur.settings || {}).corrections === 'second' ? 'Correction proposed: a second organizer must approve it.' : 'Correction recorded and signed.');
    if (a === 'collusion') return call('/admin/arena/t/collusion', {}, 'Collusion check done.');
    if (a === 'goto') return open(b.dataset.id);
    if (a === 'draw') { if (!window.confirm('Draw the tables now? The players can no longer change.')) return; return call('/admin/arena/t/draw', {}, 'Tables drawn.'); }
    if (a === 'stagesOpen') return call('/admin/arena/t/stages/open', {}, 'The director opens the tables.');
    if (a === 'final') return call('/admin/arena/t/final', {}, 'The director opens the final table.');
    if (a === 'corrApprove') return call('/admin/arena/t/correct/approve', {}, 'Correction approved and signed.');
    if (a === 'corrReject') return call('/admin/arena/t/correct/reject', { reason: $('tRejWhy') ? ($('tRejWhy').value || '').trim() : '' }, 'Correction set aside.');
    if (a === 'tDelete') {
      const name = ($('tDelName') && $('tDelName').value || '').trim();
      if (name !== cur.name) return msg('tMsg', 'Type the name of the tournament exactly to delete it.', true);
      return api('/admin/arena/t/delete', { id: cur.id, confirm: name }).then((d) => {
        if (!d.ok) return msg('tMsg', d.error || 'Refused', true);
        cur = null; $('tDetailBody').hidden = true; $('tDetailEmpty').hidden = false;
        msg('tCreateMsg', 'Tournament « ' + d.name + ' » deleted.', false, 'ok'); refresh();
      }).catch(() => msg('tMsg', 'Network error', true));
    }
    if (a === 'save') {
      const patch = {};
      const n = $('tEName').value.trim(); if (n && n !== cur.name) patch.name = n;
      const dv = $('tEDate').value; const ts = dv ? new Date(dv).getTime() : null;
      if ((ts || null) !== (cur.startsAt || null)) patch.startsAt = ts;
      const v = $('tEVis').value; if (v !== cur.settings.visibility) patch.visibility = v;
      if ($('tESrv')) {
        const ref = $('tESrv').value;
        if (ref !== ((cur.server && cur.server.ref) || '')) { const sv = (deps.servers() || []).find((x) => x.ref === ref); patch.server = sv ? { ref: sv.ref, name: sv.name, host: sv.host, port: sv.port } : null; }
        const tb = readTable('te_');
        if (tb && (!TF.same(tb, cur.table) || (tb.preset || null) !== ((cur.table && cur.table.preset) || null))) patch.table = tb;
      }
      if ($('te_auto')) {
        const run = { autoOpen: $('te_auto').checked, openBefore: Number($('te_before').value), announce: $('te_announce').checked, selfRegister: $('te_selfreg').checked, checkInBefore: Number($('te_checkin').value), chatLang: $('te_chatlang').value, qmlWitnesses: $('te_qmlwit').checked, absence: readAbsence('tea_'), tablePassword: $('te_tablepass').checked };
        const r0 = Object.assign({ autoOpen: false, openBefore: 10, announce: true, selfRegister: true, checkInBefore: 30, chatLang: 'en', qmlWitnesses: false }, cur.run || {});
        const a0 = Object.assign({}, ABSENCE_AUTO, r0.absence || {});
        const absChanged = run.absence && (run.absence.mode !== a0.mode || (run.absence.mode === 'custom' && ['strikes', 'retrySec', 'graceMin'].some((k) => run.absence[k] !== a0[k])));
        if (Object.keys(run).some((k) => k !== 'absence' && run[k] !== r0[k]) || absChanged) patch.run = run;
      }
      if (!Object.keys(patch).length) return msg('tMsg', 'Nothing changed.');
      return call('/admin/arena/t/update', { patch }, 'Saved.');
    }
    if (a === 'tOpen') {
      b.disabled = true;
      return call('/admin/arena/t/table/open', {}, 'The director is opening the table.').then(() => {
        if (cur && cur.host && cur.host.status === 'open') { clearTimeout(pollTimer); pollTimer = setTimeout(() => open(cur.id, true), 1500); } else b.disabled = false;
      });
    }
    if (a === 'tGo') {
      const absent = ((cur.hostLive && cur.hostLive.host && cur.hostLive.host.registered) || []).filter((r) => r.status !== 'seated').map((r) => r.nick);
      if (!window.confirm('Start without ' + (absent.join(', ') || 'the absent') + '? They will be marked absent and not ranked.')) return;
      return call('/admin/arena/t/table/go', {}, 'Going without the absent: the director hands the table over.');
    }
    if (a === 'copyLink') { try { navigator.clipboard.writeText(b.dataset.link); b.textContent = 'Copied'; } catch (e) {} return; }
    if (a === 'tSay') {
      const text = ($('tSay').value || '').trim();
      if (!text) return;
      return call('/admin/arena/t/table/say', { text }, 'Message sent to the table.');
    }
    if (a === 'tReinvite') return call('/admin/arena/t/table/reinvite', {}, 'Invitations sent again.');
    if (a === 'tClose') {
      if (!window.confirm('Close the table? The director leaves; a game already running goes on without it.')) return;
      return call('/admin/arena/t/table/close', {}, 'Table closed by the organizer.');
    }
    if (a.indexOf('f-') === 0) return download(a.slice(2));
  });
  // Re-draw only the list being arranged, so focus and the rest stay put.
  function rerankList(prefix, arr) {
    const btn = $('tDetailBody').querySelector('[data-act="' + prefix + 'up"]');
    const ul = btn && btn.closest('ul');
    if (ul) ul.innerHTML = arrange(arr, prefix);
  }

  function upload() {
    const f = $('tPdbFile').files && $('tPdbFile').files[0];
    if (!f) return msg('tMsg', 'Choose the .pdb file first.', true);
    if (f.size > 10 * 1024 * 1024) return msg('tMsg', 'Larger than 10 MB.', true);
    msg('tMsg', 'Importing…');
    const id = cur.id;
    f.arrayBuffer().then((buf) => fetch('/admin/arena/t/pdb?id=' + encodeURIComponent(id), {
      method: 'POST', cache: 'no-store', headers: { Authorization: 'Bearer ' + tok(), 'Content-Type': 'application/octet-stream' }, body: buf,
    })).then((r) => r.json().catch(() => ({ ok: false, error: 'HTTP ' + r.status }))).then((d) => {
      if (!d.ok) return msg('tMsg', d.error || 'Refused', true);
      source = 'pdb';
      show(d, 'Log imported: ' + d.pdbGames.length + ' game' + (d.pdbGames.length === 1 ? '' : 's') + '. Pick the tournament’s game.');
      refresh();
    }).catch(() => msg('tMsg', 'Network error', true));
  }

  function download(which) {
    const id = cur.id;
    fetch('/admin/arena/t/file?id=' + encodeURIComponent(id) + '&which=' + which, { headers: { Authorization: 'Bearer ' + tok() }, cache: 'no-store' })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tournament-' + id + (which === 'pdb' ? '.pdb' : '.' + which + '.json');
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }).catch(() => msg('tMsg', 'Download failed', true));
  }

  // Shared with the cups' programme: the table form, the chat languages, the servers.
  return { refresh, open, current: () => cur, TF, langOptions: (sel) => langOptions(sel), servers: () => deps.servers() || [] };
}
