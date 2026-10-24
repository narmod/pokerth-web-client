// ═══════════════════════════════════════════════════════════════════
// /tournament/organize — the « Cups » view (service 0.13.0).
//
// A cup gathers tournaments: points (players finished behind + 1, the best N
// results of each player), stages (the first Q of a tournament go on to the
// next one, up to a final), or both. The standings are computed by the
// service from the validated results; closing the cup signs them.
// Talks to /admin/tournaments/cups/* with the organizer's key.
// ═══════════════════════════════════════════════════════════════════

export function createCupsView(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let cur = null, tournaments = [];
  const fmt = (x) => (Math.round(x * 10) / 10).toString();
  const msg = (el, text, bad) => { const m = $(el); if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? (bad ? ' bad' : ' ok') : ''); } };

  function refresh() {
    api('/admin/tournaments/t/list').then((d) => { if (d.ok) tournaments = (d.tournaments || []).filter((t) => !t.parentId); }).catch(() => {});
    return api('/admin/tournaments/cups/list').then((d) => {
      if (!d.ok) return;
      const list = d.cups || [];
      $('cList').innerHTML = list.length ? list.map((c) => '<li><button type="button" data-cid="' + esc(c.id) + '"' + (cur && cur.id === c.id ? ' aria-current="true"' : '') + '><span class="wt">' + esc(c.name) +
        ' <span class="muted small">· ' + c.events + ' tournament' + (c.events === 1 ? '' : 's') + ' · ' + (c.bestOf ? 'best ' + c.bestOf : 'every result') + ' · ' + esc(c.visibility) + '</span></span><span class="chip ' + (c.status === 'closed' ? 'done' : 'live') + '">' + esc(c.status) + '</span></button></li>').join('')
        : '<li class="empty">None yet.</li>';
    }).catch(() => {});
  }
  $('cList').addEventListener('click', (ev) => { const b = ev.target.closest('button[data-cid]'); if (b) open(b.dataset.cid); });
  $('cCreateForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    api('/admin/tournaments/cups/create', { name: $('cName').value.trim(), bestOf: Number($('cBest').value) || 0, visibility: $('cVis').value, description: $('cDesc').value.trim() }).then((d) => {
      if (!d.ok) return msg('cMsg', d.error || 'Refused', true);
      msg('cMsg', 'Cup created.'); $('cName').value = ''; $('cDesc').value = '';
      show(d); refresh();
    }).catch(() => msg('cMsg', 'Network error', true));
  });
  function open(id, note) {
    return api('/admin/tournaments/cups/get?id=' + encodeURIComponent(id)).then((d) => { if (d.ok) show(d, note); }).catch(() => {});
  }
  function show(c, note, bad) {
    cur = c;
    $('cDetailEmpty').hidden = true; $('cDetailBody').hidden = false;
    const st = c.standings;
    const link = window.location.origin + '/tournament/c/' + c.publicKey + (c.visibility === 'private' && c.inviteCode ? '?invite=' + encodeURIComponent(c.inviteCode) : '');
    const closed = c.status === 'closed';
    let h = '<p><span class="chip ' + (closed ? 'done' : 'live') + '">' + esc(c.status) + '</span> <span class="tname">' + esc(c.name) + '</span><br><span class="muted small">' + (c.bestOf ? 'best ' + esc(c.bestOf) + ' results per player' : 'every result counts') + ' · ' + esc(c.visibility) + '</span></p>';
    if (c.description) h += '<p class="small">' + esc(c.description) + '</p>';
    h += '<p class="small">Players\' page: <a class="mono" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(link) + '</a></p>';
    h += '<div class="msg' + (note ? (bad ? ' bad' : ' ok') : '') + '" id="cDMsg" role="status">' + esc(note || '') + '</div>';
    // Tournaments of the cup.
    h += '<h3>Tournaments</h3>';
    h += st.events.length ? '<ul class="rank">' + st.events.map((e) => '<li><span class="nk">' + esc(e.label) + ' <span class="chip ' + (e.validated ? 'done' : '') + '">' + esc(e.validated ? 'validated' : e.status) + '</span>' +
      '<br><span class="small muted">stage ' + esc(e.stage) + ' · ' + esc(e.players) + ' players' + (e.counts ? ' · counts for points' : ' · no points') +
      (e.qualify && e.next != null ? ' · first ' + esc(e.qualify) + ' → ' + esc((st.events[e.next] || {}).label || '?') + (e.advanced ? ' (done: ' + esc(e.advanced.nicks.join(', ')) + ')' : '') : '') +
      (e.final ? ' · final' + (e.fromStandings ? ', top ' + esc(e.fromStandings) + ' of the standings' + (e.advanced ? ' (done)' : '') : '') : '') + '</span></span>' +
      (e.final && e.fromStandings && !e.advanced && !closed ? '<button type="button" data-cact="qualify" data-i="' + e.index + '">Qualify the top ' + esc(e.fromStandings) + '</button>' : '') +
      (!closed ? '<button type="button" data-cact="rm" data-i="' + e.index + '" aria-label="Remove ' + esc(e.label) + '">Remove</button>' : '') + '</li>').join('') + '</ul>'
      : '<p class="empty">No tournament yet: add them below.</p>';
    if (!closed) {
      const inCup = new Set(st.events.map((e) => e.tournamentId));
      const opts = tournaments.filter((t) => !inCup.has(t.id)).map((t) => '<option value="' + esc(t.id) + '">' + esc(t.name) + ' (' + esc(t.status) + ')</option>').join('');
      h += '<details class="sub"><summary>Add a tournament</summary><div class="row"><div><label for="ceT">Tournament</label><select id="ceT">' + (opts || '<option value="">— none left —</option>') + '</select></div>' +
        '<div><label for="ceLabel">Name in the cup (optional)</label><input id="ceLabel" maxlength="60"></div></div>' +
        '<label class="ck"><input type="checkbox" id="ceCounts" checked> Counts for points</label>' +
        '<div class="row"><div><label for="ceQ">First … go on (stages)</label><input id="ceQ" type="number" inputmode="numeric" min="0" max="10" value="0"></div>' +
        '<div><label for="ceNext">to</label><select id="ceNext"><option value="">—</option>' + st.events.map((e) => '<option value="' + e.index + '">' + esc(e.label) + '</option>').join('') + '</select></div></div>' +
        '<div class="row"><label class="ck"><input type="checkbox" id="ceFinal"> Final of the cup (its places come first)</label><div><label for="ceFrom">takes the top … of the standings (0: none)</label><input id="ceFrom" type="number" inputmode="numeric" min="0" max="40" value="0"></div></div>' +
        '<p class="small muted">Add the next tournament (e.g. the final) before those that send it their first players.</p>' +
        '<div class="actions"><button type="button" class="primary" data-cact="add">Add</button></div></details>';
    }
    // Standings.
    h += '<h3>Standings <span class="muted small">' + esc(st.validated) + ' of ' + esc(st.events.length) + ' validated</span></h3>';
    if (st.rows.length) {
      const evs = st.events.filter((e) => e.counts);
      h += '<div class="tablewrap"><table><thead><tr><th class="num">#</th><th>Player</th><th class="num">Points</th>' + evs.map((e) => '<th class="num" title="' + esc(e.label) + '">' + esc(e.label.slice(0, 10)) + '</th>').join('') + '<th class="num">Stage</th></tr></thead><tbody>' +
        st.rows.map((r) => '<tr><td class="num">' + r.place + (r.tie ? '=' : '') + '</td><td>' + esc(r.nick) + (r.final != null ? ' <span class="chip done">final ' + r.final + '</span>' : '') + '</td><td class="num"><b>' + fmt(r.total) + '</b></td>' +
          evs.map((e) => { const x = r.results.find((y) => y.event === e.index); return '<td class="num">' + (x ? (x.counted ? fmt(x.points) : '<span class="muted" title="not counted">(' + fmt(x.points) + ')</span>') : '') + '</td>'; }).join('') +
          '<td class="num">' + esc(r.stage) + '</td></tr>').join('') + '</tbody></table></div>';
      h += '<p class="small muted">Points: players behind + 1 (a shared place: the average). ' + (c.bestOf ? 'Only the best ' + esc(c.bestOf) + ' results count (others in brackets). ' : '') + 'Ties: the final first, then the furthest stage, the points, the best single results one by one.</p>';
    } else h += '<p class="empty">No validated result yet.</p>';
    if (!closed && st.events.length) h += '<div class="actions"><button type="button" data-cact="close">Close the cup and sign the standings</button></div>';
    if (closed) h += '<p class="small">Closed ' + esc(new Date(c.closedAt).toLocaleString()) + (c.checks && c.checks.signature ? ' · standings signed' : '') + '.</p>';
    h += '<details class="sub"><summary>Journal</summary><ul class="small">' + (c.history || []).map((x) => '<li>' + esc(new Date(x.ts).toLocaleString()) + ' · ' + esc(x.author || '') + ' — ' + esc(x.summary) + '</li>').join('') + '</ul></details>';
    $('cDetailBody').innerHTML = h;
  }
  function call(path, body, okText) {
    return api(path, Object.assign({ id: cur.id }, body)).then((d) => {
      if (!d.ok) return msg('cDMsg', d.error || 'Refused', true);
      show(d, okText); refresh();
    }).catch(() => msg('cDMsg', 'Network error', true));
  }
  $('cDetailBody').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-cact]');
    if (!b || !cur) return;
    const a = b.dataset.cact;
    if (a === 'add') {
      if (!$('ceT').value) return;
      return call('/admin/tournaments/cups/event', { tournamentId: $('ceT').value, label: $('ceLabel').value.trim(), counts: $('ceCounts').checked,
        qualify: Number($('ceQ').value) || 0, next: $('ceNext').value, final: $('ceFinal').checked, fromStandings: Number($('ceFrom').value) || 0 }, 'Tournament added.');
    }
    if (a === 'rm') return call('/admin/tournaments/cups/event/remove', { index: Number(b.dataset.i) }, 'Removed.');
    if (a === 'qualify') return call('/admin/tournaments/cups/qualify', { index: Number(b.dataset.i) }, 'Qualified: added to the final.');
    if (a === 'close') { if (!window.confirm('Close the cup? Its standings are signed and no tournament can be added.')) return; return call('/admin/tournaments/cups/close', {}, 'Cup closed, standings signed.'); }
  });
  return { refresh, open };
}
