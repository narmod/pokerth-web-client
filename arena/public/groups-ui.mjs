// ═══════════════════════════════════════════════════════════════════
// /arena/organize — Players › Groups (service 0.29.0): clubs, teams, lists.
//
// Make a group (a name, a line about it, how a player gets in: invitation,
// request, code, open), add or take out a nickname, accept or decline the
// requests, show or renew the code, delete a group nothing asks for any more.
// Every group is public on the players' page. A tournament or a cup can be
// kept for the members of one of several groups (Who may register).
// Server: arena/lib/groups.mjs. English only, like the organizer side.
// ═══════════════════════════════════════════════════════════════════

const JOIN = {
  invite: ['by invitation', 'an organizer adds each member'],
  request: ['on request', 'a signed-in player asks, an organizer accepts'],
  code: ['with a code', 'a signed-in player types the group\'s code'],
  open: ['open', 'any signed-in player joins'],
};

export function createGroupsView(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let groups = [], openId = null;
  const msg = (text, bad) => { const m = $('grMsg'); if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? (bad ? ' bad' : ' ok') : ''); } };
  const when = (ts) => (ts ? new Date(ts).toLocaleDateString() : '—');
  const canAct = () => ['admin', 'organizer'].indexOf(deps.role()) >= 0;
  const joinSel = (id, v) => '<select id="' + id + '">' + Object.keys(JOIN).map((k) => '<option value="' + k + '"' + (k === v ? ' selected' : '') + '>' + esc(JOIN[k][0]) + ' — ' + esc(JOIN[k][1]) + '</option>').join('') + '</select>';

  function render() {
    const act = canAct();
    document.querySelectorAll('.gr-act').forEach((e) => { e.hidden = !act; });
    $('grList').innerHTML = groups.length ? groups.map((g) => {
      const open = openId === g.id;
      let h = '<li class="acc"><div><b>' + esc(g.name) + '</b> <span class="chip">' + esc(JOIN[g.join][0]) + '</span>' +
        (g.requests.length ? ' <span class="chip live">' + g.requests.length + ' waiting</span>' : '') +
        '<br><span class="small muted">' + g.members.length + ' member' + (g.members.length === 1 ? '' : 's') + (g.about ? ' · ' + esc(g.about) : '') +
        (g.usedBy && g.usedBy.length ? ' · asked for by ' + g.usedBy.map((n) => '« ' + esc(n) + ' »').join(', ') : '') + '</span>' +
        (g.join === 'code' && g.code ? '<br><span class="small">Code: <code>' + esc(g.code) + '</code>' + (act ? ' <button type="button" class="mini ghost" data-gract="newcode" data-id="' + esc(g.id) + '">New code</button>' : '') + '</span>' : '') +
        '</div><div class="row pl-row"><button type="button" class="ghost" data-gract="toggle" data-id="' + esc(g.id) + '" aria-expanded="' + open + '">' + (open ? 'Close' : 'Members') + '</button></div>';
      if (open) {
        h += '<div class="grbody">';
        if (g.requests.length) h += '<p class="small"><b>Asking to join</b></p><ul class="small">' + g.requests.map((r) => '<li>' + esc(r.nick) + ' <span class="muted">' + esc(when(r.at)) + '</span>' +
          (act ? ' <button type="button" class="mini" data-gract="approve" data-id="' + esc(g.id) + '" data-nick="' + esc(r.nick) + '">Accept</button> <button type="button" class="mini ghost" data-gract="decline" data-id="' + esc(g.id) + '" data-nick="' + esc(r.nick) + '">Decline</button>' : '') + '</li>').join('') + '</ul>';
        h += g.members.length ? '<ul class="chips">' + g.members.map((m) => '<li title="' + esc(when(m.at)) + (m.by ? ' · ' + esc(m.by) : '') + '">' + esc(m.nick) +
          (act ? ' <button type="button" class="mini ghost" data-gract="take" data-id="' + esc(g.id) + '" data-nick="' + esc(m.nick) + '" aria-label="Take ' + esc(m.nick) + ' out">×</button>' : '') + '</li>').join('') + '</ul>' : '<p class="small muted">No member yet.</p>';
        if (act) {
          h += '<form class="row gr-add" data-id="' + esc(g.id) + '"><div><label for="grAdd_' + esc(g.id) + '">Add a nickname</label><input id="grAdd_' + esc(g.id) + '" maxlength="64" required autocapitalize="none" spellcheck="false"></div><button type="submit">Add</button></form>' +
            '<form class="gr-edit" data-id="' + esc(g.id) + '"><div class="row"><div><label for="grEN_' + esc(g.id) + '">Name</label><input id="grEN_' + esc(g.id) + '" maxlength="40" required value="' + esc(g.name) + '"></div>' +
            '<div><label for="grEJ_' + esc(g.id) + '">How a player gets in</label>' + joinSel('grEJ_' + esc(g.id), g.join) + '</div></div>' +
            '<label for="grEA_' + esc(g.id) + '">About (public)</label><input id="grEA_' + esc(g.id) + '" maxlength="200" value="' + esc(g.about || '') + '">' +
            '<div class="actions"><button type="submit">Save</button><button type="button" class="danger" data-gract="remove" data-id="' + esc(g.id) + '">Delete the group</button></div></form>';
        }
        h += '</div>';
      }
      return h + '</li>';
    }).join('') : '<li class="empty">No group yet.</li>';
  }
  function refresh() {
    return api('/admin/arena/groups').then((d) => { if (d.ok) { groups = d.groups || []; render(); } }).catch(() => {});
  }
  const done = (text) => (d) => { if (!d.ok) return msg(d.error || 'Refused', true); msg(text); refresh(); };
  const fail = (e) => msg(e.message || 'Network error', true);

  $('grForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    api('/admin/arena/groups/create', { name: $('grName').value.trim(), about: $('grAbout').value.trim(), join: $('grJoin').value }).then((d) => {
      if (d.ok) { $('grName').value = ''; $('grAbout').value = ''; openId = d.group.id; }
      done(d.ok ? 'Group « ' + d.group.name + ' » made.' : '')(d);
    }).catch(fail);
  });
  $('grList').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-gract]');
    if (!b) return;
    const a = b.dataset.gract, id = b.dataset.id, nick = b.dataset.nick;
    if (a === 'toggle') { openId = openId === id ? null : id; return render(); }
    if (a === 'newcode') { if (!window.confirm('Make a new code? The old one stops working (members stay).')) return; return api('/admin/arena/groups/update', { id, patch: { newCode: true } }).then(done('New code made.')).catch(fail); }
    if (a === 'approve') return api('/admin/arena/groups/approve', { id, nick }).then(done(nick + ' is in.')).catch(fail);
    if (a === 'decline') return api('/admin/arena/groups/decline', { id, nick }).then(done('Request of ' + nick + ' declined.')).catch(fail);
    if (a === 'take') return api('/admin/arena/groups/take', { id, nick }).then(done(nick + ' taken out.')).catch(fail);
    if (a === 'remove') { if (!window.confirm('Delete this group and its list of members?')) return; return api('/admin/arena/groups/remove', { id }).then((d) => { if (d.ok) openId = null; done('Group deleted.')(d); }).catch(fail); }
  });
  $('grList').addEventListener('submit', (ev) => {
    const f = ev.target.closest('form');
    if (!f) return;
    ev.preventDefault();
    const id = f.dataset.id;
    if (f.classList.contains('gr-add')) { const n = $('grAdd_' + id).value.trim(); return api('/admin/arena/groups/add', { id, nick: n }).then(done(n + ' added.')).catch(fail); }
    if (f.classList.contains('gr-edit')) return api('/admin/arena/groups/update', { id, patch: { name: $('grEN_' + id).value.trim(), join: $('grEJ_' + id).value, about: $('grEA_' + id).value.trim() } }).then(done('Group saved.')).catch(fail);
  });
  return { refresh };
}
