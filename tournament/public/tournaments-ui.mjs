// ═══════════════════════════════════════════════════════════════════
// /tournament — « Tournaments » view (2026-10-23).
//
// Create a tournament, add the players by hand, then either let the director
// open the table on the LAN server (invitations, seat check, hand-over,
// result recorded by itself) or set the result in one of three ways: typed
// (ordered list), a finished Table check's sealed result, or a PokerTH log
// (.pdb) with the game picked. Validation signs it; a correction is added to
// the journal, never written over.
// Talks to /admin/tournaments/t/*; server: tournament/lib/tournaments.mjs.
// English only for now, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

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
// Table settings (tournament/lib/tournaments.mjs TABLE_DEFAULTS).
const TABLE_DEFAULTS = { startMoney: 3000, firstSmallBlind: 10, raiseMode: 'hands', raiseEvery: 7, endRaiseMode: 'double', endRaiseValue: 0, actionTimeout: 30, delayBetweenHands: 7 };
const TABLE_FIELDS = [
  ['startMoney', 'Starting stack', 100, 1000000],
  ['firstSmallBlind', 'First small blind', 1, 500000],
  ['raiseMode', 'Blinds rise', [['hands', 'every N hands'], ['minutes', 'every N minutes']]],
  ['raiseEvery', 'N (hands or minutes)', 1, 100],
  ['endRaiseMode', 'After the last level', [['double', 'double the blinds'], ['value', 'raise by a fixed value'], ['keep', 'keep the last blinds']]],
  ['endRaiseValue', 'Fixed raise (small blind)', 0, 1000000],
  ['actionTimeout', 'Time to act (s)', 5, 120],
  ['delayBetweenHands', 'Pause between hands (s)', 3, 20],
];
const HOST_PHASE = {
  create: 'Opening the table…', seated: 'Table open: inviting the registered players and checking every seat',
  handover: 'Handing the table over…', watch: 'Handed over: the director watches as a spectator',
};
const PLAYER_STATUS = { seated: ['seated', 'done'], invited: ['invited', 'live'], online: ['connected', ''], offline: ['not connected', 'warn'],
  absent: ['absent', 'bad'], 'declined-no': ['declined', 'bad'], 'declined-busy': ['in another game', 'warn'] };
const SOURCE = { manual: 'typed in', watch: 'Table check', pdb: 'log (.pdb)' };

export function createTournamentsView(deps) {
  const { api, esc, tok } = deps;
  const $ = (id) => document.getElementById(id);
  let list = [];
  let cur = null;            // the open tournament (server view)
  let order = [];            // typed ranking being arranged
  let corrOrder = [];        // correction being arranged
  let source = 'manual';
  let flash = null;          // { text, bad } shown once in the detail

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
  }
  $('tProfile').addEventListener('change', profileNote);
  profileNote();

  $('tCreateForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const srv = (deps.servers() || []).find((s) => s.ref === $('tSrv').value);
    const body = { name: $('tName').value.trim(), profile: $('tProfile').value, format: 'sitngo' };
    if (srv) body.server = { ref: srv.ref, name: srv.name, host: srv.host, port: srv.port };
    if ($('tDate').value) { const ts = new Date($('tDate').value).getTime(); if (ts > 0) body.startsAt = ts; }
    if ($('tVis').value) body.visibility = $('tVis').value;
    body.table = readTable('tt_');
    if (body.profile === 'custom') {
      body.settings = {};
      for (const k of Object.keys(CHOICES)) body.settings[k] = $('tc_' + k).value;
      body.settings.archiveDays = parseInt($('tc_archiveDays').value, 10);
    }
    msg('tCreateMsg', 'Creating…');
    api('/admin/tournaments/t/create', body).then((d) => {
      if (!d.ok) return msg('tCreateMsg', d.error || 'Refused', true);
      msg('tCreateMsg', 'Created.', false, 'ok');
      $('tName').value = ''; $('tDate').value = ''; $('tTable').innerHTML = tableFields('tt_', TABLE_DEFAULTS);
      show(d, 'Created. Add the players, then set the result.');
      refresh();
    }).catch((e) => msg('tCreateMsg', e.message === 'forbidden' ? '' : 'Network error', true));
  });

  function tableFields(prefix, v) {
    v = Object.assign({}, TABLE_DEFAULTS, v || {});
    return TABLE_FIELDS.map((f) => {
      const id = prefix + f[0];
      const ctl = Array.isArray(f[2])
        ? '<select id="' + id + '">' + f[2].map((o) => '<option value="' + o[0] + '"' + (o[0] === v[f[0]] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>'
        : '<input id="' + id + '" type="number" inputmode="numeric" min="' + f[2] + '" max="' + f[3] + '" value="' + esc(v[f[0]]) + '">';
      return '<div><label for="' + id + '">' + esc(f[1]) + '</label>' + ctl + '</div>';
    }).join('');
  }
  function readTable(prefix) {
    const o = {};
    for (const f of TABLE_FIELDS) { const el = $(prefix + f[0]); if (el) o[f[0]] = Array.isArray(f[2]) ? el.value : Number(el.value); }
    return o;
  }
  function tableSummary(t) {
    t = Object.assign({}, TABLE_DEFAULTS, t || {});
    const end = { double: 'then doubled', value: 'then +' + t.endRaiseValue, keep: 'then kept' }[t.endRaiseMode] || '';
    return 'stack ' + t.startMoney + ' · blinds ' + t.firstSmallBlind + '/' + (t.firstSmallBlind * 2) + ', doubled every ' + t.raiseEvery + (t.raiseMode === 'minutes' ? ' min' : ' hands') + ' (' + end + ') · ' + t.actionTimeout + ' s to act · ' + t.delayBetweenHands + ' s between hands';
  }
  $('tTable').innerHTML = tableFields('tt_', TABLE_DEFAULTS);

  function msg(id, text, bad, cls) { const el = $(id); if (!el) return; el.className = 'msg' + (bad ? ' bad' : cls ? ' ' + cls : ''); el.textContent = text || ''; }

  // ── list ─────────────────────────────────────────────────────────
  function chip(st) {
    const cls = st === 'validated' ? 'done' : st === 'finished' ? 'warn' : st === 'registration' || st === 'running' ? 'live' : '';
    return '<span class="chip ' + cls + '">' + esc(STATUS[st] || st) + '</span>';
  }
  function when(ts) { return ts ? new Date(ts).toLocaleString() : ''; }
  function refresh() {
    fillServers();
    return api('/admin/tournaments/t/list').then((d) => {
      if (!d.ok) return;
      list = d.tournaments || [];
      $('tList').innerHTML = list.length ? list.map((t) => '<li><button type="button" data-id="' + esc(t.id) + '"' + (cur && cur.id === t.id ? ' aria-current="true"' : '') + '>' +
        '<span class="wt">' + esc(t.name) + ' <span class="muted small">· ' + esc(t.profile) + ' · ' + t.players + ' player' + (t.players === 1 ? '' : 's') + (t.startsAt ? ' · ' + esc(when(t.startsAt)) : '') + '</span></span>' + chip(t.status) + '</button></li>').join('')
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
    api('/admin/tournaments/t/get?id=' + encodeURIComponent(id)).then((d) => {
      if (!d.ok) { $('tDetailEmpty').hidden = false; $('tDetailEmpty').textContent = d.error || 'Unknown tournament'; $('tDetailBody').hidden = true; return; }
      // While the director runs the table, refresh only its block, so what
      // the organizer is typing elsewhere stays put.
      if (quiet && cur && cur.id === d.id && cur.status === d.status && $('tHostBox')) {
        cur = d;
        $('tHostBox').innerHTML = hostLive(d);
      } else if (!quiet || !cur || cur.id === d.id) {
        show(d, quiet && cur && cur.status !== d.status ? statusNote(d) : null);
        if (quiet) refresh();
      }
      if (d.host && d.host.status === 'open' && cur && cur.id === d.id) pollTimer = setTimeout(() => open(d.id, true), 2000);
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
    let h = '<p>' + chip(t.status) + ' <span class="tname">' + esc(t.name) + '</span><br><span class="muted small">Sit &amp; Go · ' + esc(t.profile) + ' · ' + esc(st.visibility) +
      (t.server ? ' · ' + esc(t.server.name) + ' (' + esc(t.server.host) + ':' + esc(t.server.port) + ')' : '') + (t.startsAt ? ' · ' + esc(when(t.startsAt)) : '') + '</span></p>';
    if (t.inviteCode) h += '<p class="small">Invitation code <span class="mono">' + esc(t.inviteCode) + '</span></p>';
    h += '<p class="small muted">' + Object.keys(SETTING_LABEL).map((k) => esc(SETTING_LABEL[k].replace(/ \(.*\)/, '')) + ': ' + esc(k === 'archiveDays' ? (st[k] ? st[k] + ' days' : 'for good') : st[k])).join(' · ') +
      '<br>Identity, witnesses and the collusion check are recorded now; they apply once registration and witnesses arrive.</p>';
    h += '<div class="msg' + (flash && flash.bad ? ' bad' : flash ? ' ok' : '') + '" id="tMsg" role="status">' + esc(flash ? flash.text : '') + '</div>';
    flash = null;

    // Players.
    h += '<h3>Players (' + t.players.length + '/10)</h3>';
    if (!t.result && !(t.host && t.host.status === 'open')) {
      h += t.players.length ? '<ul class="rank">' + t.players.map((p) => '<li><span class="nk">' + esc(p.nick) + '</span><button type="button" data-act="rm" data-nick="' + esc(p.nick) + '" aria-label="Remove ' + esc(p.nick) + '">Remove</button></li>').join('') + '</ul>'
        : '<p class="empty">No player yet — add them here, or let the result bring them (Table check or log).</p>';
      if (t.players.length < 10) h += '<div class="row"><div><label for="tPlayerIn">PokerTH nickname</label><input id="tPlayerIn" maxlength="64" autocomplete="off" enterkeyhint="done"></div><button type="button" data-act="add">Add</button></div>';
    } else {
      h += '<p class="small">' + t.players.map((p) => esc(p.nick)).join(', ') + '</p>';
    }

    // The table on the server.
    h += hostSection(t);

    // Result.
    if (t.result) {
      const r = t.result;
      h += '<h3>Result</h3><div class="tablewrap"><table><thead><tr><th class="num">#</th><th>Player</th><th class="num">Out in hand</th><th class="num">Stack at start of that hand</th><th></th></tr></thead><tbody>' +
        r.ranking.map((x) => '<tr><td class="num">' + x.place + '</td><td>' + esc(x.nick) + '</td><td class="num">' + (x.winner ? '—' : x.elimHand != null ? x.elimHand : '') + '</td><td class="num">' + (x.stack != null ? x.stack : '') + '</td><td>' +
          (x.winner ? '<span class="chip done">winner</span>' : '') + (x.tie ? '<span class="chip warn">tie</span>' : '') + (x.unknown ? '<span class="chip warn">hand unknown</span>' : '') + '</td></tr>').join('') + '</tbody></table></div>';
      if (r.absent && r.absent.length) h += '<p class="small">Absent (not ranked): ' + r.absent.map(esc).join(', ') + '</p>';
      h += '<p class="small muted">From: ' + (r.byDirector ? 'the director, who ran the table · ' : '') + esc(SOURCE[r.source] || r.source) + (r.watchId ? ' ' + esc(r.watchId) : '') + (r.uniqueGameId != null ? ', game ' + esc(r.uniqueGameId) : '') + ' · <b>' + esc(r.status) + '</b>' + (r.corrected ? ' · corrected' : '') + '</p>';
      if (t.status === 'finished') {
        h += '<p class="small">' + (r.status !== 'complete' ? 'Look at the flags above (tie, unknown hand, game not finished) before validating. ' : st.validation === 'organizer' ? 'This profile wants an organizer to validate. ' : '') + 'Validating seals and signs the result.</p>' +
          '<div class="actions"><button type="button" class="primary" data-act="validate">Validate and sign</button></div>';
      }
    }
    if (t.status !== 'validated' && !(t.host && t.host.status === 'open')) h += sourcePanel(t);
    else if (st.corrections === 'second') h += '<h3>Correction</h3><p class="small muted">This profile needs a second organizer to approve a correction. Organizer accounts come later.</p>';
    else {
      h += '<details class="sub"><summary>Correct the result</summary><p class="small muted">The validated result stays in the journal; the correction is added with your reason, and the result is signed again.</p>' +
        '<ul class="rank">' + arrange(corrOrder, 'c') + '</ul><label for="tReason">Reason</label><input id="tReason" maxlength="200" autocomplete="off">' +
        '<div class="actions"><button type="button" class="primary" data-act="correct">Record the correction</button></div></details>';
    }
    if (t.corrections && t.corrections.length) {
      h += '<h3>Corrections</h3><ul class="small">' + t.corrections.map((c) => '<li>' + esc(when(c.at)) + ' · ' + esc(c.author) + ' — ' + esc(c.reason) + '<br><span class="muted">' + esc(c.before.join(' > ')) + ' → ' + esc(c.after.join(' > ')) + '</span></li>').join('') + '</ul>';
    }

    // Edit (until validated).
    if (t.status !== 'validated') {
      h += '<details class="sub"><summary>Edit</summary><div class="row"><div><label for="tEName">Name</label><input id="tEName" maxlength="60" value="' + esc(t.name) + '"></div>' +
        '<div><label for="tEDate">Date</label><input id="tEDate" type="datetime-local" value="' + esc(localInput(t.startsAt)) + '"></div>' +
        '<div><label for="tEVis">Visibility</label><select id="tEVis">' + ['public', 'unlisted', 'private'].map((v) => '<option' + (v === st.visibility ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></div></div>' +
        (t.host && t.host.status === 'open' ? '' : '<div class="row"><div><label for="tESrv">LAN server</label><select id="tESrv"><option value="">— not said —</option>' +
          (deps.servers() || []).map((sv) => '<option value="' + esc(sv.ref) + '"' + (t.server && t.server.ref === sv.ref ? ' selected' : '') + '>' + esc(sv.name) + ' — ' + esc(sv.host) + ':' + esc(sv.port) + '</option>').join('') + '</select></div></div>' +
          '<p class="small muted">Table settings</p><div class="row">' + tableFields('te_', t.table) + '</div>') +
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
  function hostSection(t) {
    if (t.status === 'validated' || (t.result && !(t.host && t.host.status === 'open'))) {
      return t.host ? '<p class="small muted">Table run by the director: ' + esc(t.host.status) + '.</p>' : '';
    }
    let h = '<h3>Table on the server</h3><p class="small muted">' + esc(tableSummary(t.table)) + '</p>';
    if (t.host && t.host.status === 'open') return h + '<div class="hostbox" id="tHostBox" aria-live="polite">' + hostLive(t) + '</div>';
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
    if (H.registered && H.registered.length) {
      h += '<ul class="chips">' + H.registered.map((r) => { const s = PLAYER_STATUS[r.status] || [r.status, '']; return '<li>' + esc(r.nick) + ' <span class="chip ' + s[1] + '">' + esc(s[0]) + '</span></li>'; }).join('') + '</ul>';
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
    api('/admin/tournaments/watches').then((d) => {
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
      return call('/admin/tournaments/t/player', { action: 'add', nick }, nick + ' added.').then(() => { const el = $('tPlayerIn'); if (el) el.focus(); });
    }
    if (a === 'rm') return call('/admin/tournaments/t/player', { action: 'remove', nick: b.dataset.nick }, b.dataset.nick + ' removed.');
    if (a === 'setManual') {
      const ranking = cur.players.length ? order.slice() : ($('tManualTa').value || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (!ranking.length) return msg('tMsg', 'Type the ranking first.', true);
      return call('/admin/tournaments/t/result', { source: 'manual', ranking }, 'Result set.');
    }
    if (a === 'setWatch') {
      const w = $('tWatchSel').value;
      if (!w) return msg('tMsg', 'Pick a finished watch.', true);
      return call('/admin/tournaments/t/result', { source: 'watch', watchId: w }, 'Result taken from the Table check.');
    }
    if (a === 'setPdb') {
      const r = document.querySelector('input[name="tPdbGame"]:checked');
      if (!r) return msg('tMsg', 'Pick the game.', true);
      return call('/admin/tournaments/t/result', { source: 'pdb', uniqueGameId: Number(r.value) }, 'Result taken from the log.');
    }
    if (a === 'upload') return upload();
    if (a === 'validate') return call('/admin/tournaments/t/validate', {}, 'Validated and signed.');
    if (a === 'correct') return call('/admin/tournaments/t/correct', { ranking: corrOrder.slice(), reason: ($('tReason').value || '').trim() }, 'Correction recorded and signed.');
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
        const was = Object.assign({}, TABLE_DEFAULTS, cur.table || {});
        if (TABLE_FIELDS.some((f) => String(tb[f[0]]) !== String(was[f[0]]))) patch.table = tb;
      }
      if (!Object.keys(patch).length) return msg('tMsg', 'Nothing changed.');
      return call('/admin/tournaments/t/update', { patch }, 'Saved.');
    }
    if (a === 'tOpen') {
      b.disabled = true;
      return call('/admin/tournaments/t/table/open', {}, 'The director is opening the table.').then(() => {
        if (cur && cur.host && cur.host.status === 'open') { clearTimeout(pollTimer); pollTimer = setTimeout(() => open(cur.id, true), 1500); } else b.disabled = false;
      });
    }
    if (a === 'tGo') {
      const absent = ((cur.hostLive && cur.hostLive.host && cur.hostLive.host.registered) || []).filter((r) => r.status !== 'seated').map((r) => r.nick);
      if (!window.confirm('Start without ' + (absent.join(', ') || 'the absent') + '? They will be marked absent and not ranked.')) return;
      return call('/admin/tournaments/t/table/go', {}, 'Going without the absent: the director hands the table over.');
    }
    if (a === 'tReinvite') return call('/admin/tournaments/t/table/reinvite', {}, 'Invitations sent again.');
    if (a === 'tClose') {
      if (!window.confirm('Close the table? The director leaves; a game already running goes on without it.')) return;
      return call('/admin/tournaments/t/table/close', {}, 'Table closed by the organizer.');
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
    f.arrayBuffer().then((buf) => fetch('/admin/tournaments/t/pdb?id=' + encodeURIComponent(id), {
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
    fetch('/admin/tournaments/t/file?id=' + encodeURIComponent(id) + '&which=' + which, { headers: { Authorization: 'Bearer ' + tok() }, cache: 'no-store' })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tournament-' + id + (which === 'pdb' ? '.pdb' : '.' + which + '.json');
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }).catch(() => msg('tMsg', 'Download failed', true));
  }

  return { refresh, open, current: () => cur };
}
