// ═══════════════════════════════════════════════════════════════════
// /arena/organize — « Accounts » view (service 0.21.0).
//
// The super admin (master key): the organizer accounts — create one (login,
// name, role) and hand over its invitation link, change a role or a name,
// turn an account off, make a new link (the password is cleared), delete.
// An account: its own password. Talks to /admin/arena/accounts/* and
// /admin/arena/me/password; server: arena/lib/accounts.mjs.
// English only, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

export const ROLE_TEXT = {
  organizer: 'Organizer — creates and runs tournaments and cups, validates, corrects',
  referee: 'Referee — validates, handles corrections and the collusion check; creates nothing',
  viewer: 'Read only — sees everything, changes nothing',
};

export function createAccountsView(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let list = [];
  const msg = (text, bad) => { const m = $('aMsg'); if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? (bad ? ' bad' : ' ok') : ''); } };
  const when = (ts) => (ts ? new Date(ts).toLocaleString() : '—');
  const linkOf = (t) => window.location.origin + '/arena/organize#invite=' + encodeURIComponent(t);
  const roleSel = (id, v) => '<select id="' + id + '">' + Object.keys(ROLE_TEXT).map((r) => '<option value="' + r + '"' + (r === v ? ' selected' : '') + '>' + esc(r === 'viewer' ? 'read only' : r) + '</option>').join('') + '</select>';

  function showLink(name, t) {
    $('aLink').hidden = false;
    $('aLink').innerHTML = '<p><b>Invitation link for ' + esc(name) + '</b> — valid 7 days, shown once: send it to them; they choose their password there.</p>' +
      '<p><input id="aLinkIn" readonly value="' + esc(linkOf(t)) + '" onclick="this.select()"></p><div class="actions"><button type="button" class="ghost" data-aact="copy">Copy the link</button></div>';
  }
  function render() {
    const me = deps.me();
    if (me.role === 'admin') {
      $('aAdmin').hidden = false; $('aMe').hidden = true;
      $('aList').innerHTML = list.length ? list.map((a) => '<li class="acc"><div><b>' + esc(a.name) + '</b> <span class="muted small">' + esc(a.login) + '</span> ' +
        '<span class="chip ' + (a.status === 'active' ? 'done' : a.status === 'invited' ? 'live' : 'bad') + '">' + esc(a.status === 'invited' ? 'invited' : a.status) + '</span>' +
        '<br><span class="small muted">' + esc(ROLE_TEXT[a.role] || a.role) + ' · created ' + esc(when(a.createdAt)) + ' by ' + esc(a.createdBy || '—') + ' · last sign-in ' + esc(when(a.lastLoginAt)) +
        (a.status === 'invited' && a.inviteExpires ? ' · link valid until ' + esc(when(a.inviteExpires)) : '') + '</span></div>' +
        '<div class="row"><div><label for="aRole_' + esc(a.id) + '">Role</label>' + roleSel('aRole_' + a.id, a.role) + '</div>' +
        '<button type="button" data-aact="role" data-id="' + esc(a.id) + '">Change the role</button>' +
        '<button type="button" class="ghost" data-aact="' + (a.status === 'disabled' ? 'enable' : 'disable') + '" data-id="' + esc(a.id) + '">' + (a.status === 'disabled' ? 'Turn on' : 'Turn off') + '</button>' +
        '<button type="button" class="ghost" data-aact="reinvite" data-id="' + esc(a.id) + '">New invitation link</button>' +
        '<button type="button" class="danger" data-aact="delete" data-id="' + esc(a.id) + '">Delete</button></div></li>').join('')
        : '<li class="empty">No account yet: create one above.</li>';
    } else {
      $('aAdmin').hidden = true; $('aMe').hidden = false;
      if (me.player) $('aMeWho').innerHTML = 'Your player account <b>' + esc(me.player.nick) + '</b> — ' + esc(ROLE_TEXT[me.role] || me.role) + '. Its password, devices and preferences: <a href="/arena/account">My account</a>.';
      else $('aMeWho').textContent = me.account ? me.account.name + ' (' + me.account.login + ') — ' + (ROLE_TEXT[me.role] || me.role) : 'Signed in with an organizer key: no account, no password to change.';
      $('aPwForm').hidden = !me.account;
    }
  }
  function refresh() {
    const me = deps.me();
    if (me.role !== 'admin') return render();
    return api('/admin/arena/accounts').then((d) => { if (d.ok) { list = d.accounts || []; render(); } }).catch(() => {});
  }
  $('aCreateForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    api('/admin/arena/accounts/create', { login: $('aLogin').value.trim(), name: $('aName').value.trim(), role: $('aRole').value }).then((d) => {
      if (!d.ok) return msg(d.error || 'Refused', true);
      msg('Account « ' + d.account.name + ' » created.');
      $('aLogin').value = ''; $('aName').value = '';
      showLink(d.account.name, d.invite);
      refresh();
    }).catch((e) => msg(e.message || 'Network error', true));
  });
  $('aList').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-aact]');
    if (!b) return;
    const id = b.dataset.id, a = list.find((x) => x.id === id);
    const done = (text) => (d) => { if (!d.ok) return msg(d.error || 'Refused', true); msg(text); if (d.invite) showLink(d.account.name, d.invite); refresh(); };
    const fail = (e) => msg(e.message || 'Network error', true);
    if (b.dataset.aact === 'role') return api('/admin/arena/accounts/update', { id, patch: { role: $('aRole_' + id).value } }).then(done('Role changed.')).catch(fail);
    if (b.dataset.aact === 'disable') return api('/admin/arena/accounts/update', { id, patch: { disabled: true } }).then(done('Account turned off: its sessions are ended.')).catch(fail);
    if (b.dataset.aact === 'enable') return api('/admin/arena/accounts/update', { id, patch: { disabled: false } }).then(done('Account turned on.')).catch(fail);
    if (b.dataset.aact === 'reinvite') { if (!window.confirm('Make a new invitation link for ' + (a ? a.name : 'this account') + '? Their password is cleared and they are signed out until they use the link.')) return; return api('/admin/arena/accounts/reinvite', { id }).then(done('New invitation link made.')).catch(fail); }
    if (b.dataset.aact === 'delete') { if (!window.confirm('Delete the account of ' + (a ? a.name : 'this organizer') + '? The journals keep their name.')) return; return api('/admin/arena/accounts/delete', { id }).then(done('Account deleted.')).catch(fail); }
  });
  $('aLink').addEventListener('click', (ev) => {
    if (!ev.target.closest('[data-aact="copy"]')) return;
    const i = $('aLinkIn'); i.select();
    try { navigator.clipboard.writeText(i.value).then(() => msg('Link copied.')).catch(() => document.execCommand('copy')); } catch (e) { try { document.execCommand('copy'); } catch (e2) {} }
  });
  $('aPwForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    if ($('aPwNew').value !== $('aPwNew2').value) return msg('The two new passwords differ.', true);
    api('/admin/arena/me/password', { old: $('aPwOld').value, password: $('aPwNew').value }).then((d) => {
      if (!d.ok) return msg(d.error || 'Refused', true);
      msg('Password changed.');
      for (const k of ['aPwOld', 'aPwNew', 'aPwNew2']) $(k).value = '';
    }).catch((e) => msg(e.message || 'Network error', true));
  });
  return { refresh };
}
