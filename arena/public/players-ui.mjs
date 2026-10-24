// ═══════════════════════════════════════════════════════════════════
// /arena/organize — the « Players » view (service 0.25.0).
//
// Every nickname of this install: those with an account, those an organizer
// added, those banned, and those of the results (tournaments played, wins,
// podiums). An organizer creates an account and hands over its invitation
// link, turns an account off, makes a new link, bans (a reason, a number of
// days or until lifted) and lifts a ban. The super admin chooses how
// accounts are made: by invitation only, or by the players themselves too.
// Server: arena/lib/players.mjs. English only, like the organizer side.
// ═══════════════════════════════════════════════════════════════════

export function createPlayersView(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let rows = [], signup = 'invite', filter = '', banning = null, tk = { types: [], balances: [], season: null, seasons: [] };
  const msg = (text, bad) => { const m = $('plMsg'); if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? (bad ? ' bad' : ' ok') : ''); } };
  const when = (ts) => (ts ? new Date(ts).toLocaleDateString() : '—');
  const linkOf = (t) => window.location.origin + '/arena#pinvite=' + encodeURIComponent(t);
  const ACC = { active: ['account', 'done'], invited: ['invited', 'live'], disabled: ['account off', 'bad'] };
  // A role on the organizer side (service 0.33.0): the super admin gives it to a player account.
  const ROLE = { organizer: 'organizer', referee: 'referee', viewer: 'read only' };

  function showLink(nick, t) {
    $('plLink').hidden = false;
    $('plLink').innerHTML = '<p><b>Invitation link for ' + esc(nick) + '</b> — valid 7 days, shown once: send it to the player; he chooses his password there.</p>' +
      '<p><input id="plLinkIn" readonly value="' + esc(linkOf(t)) + '" onclick="this.select()"></p><div class="actions"><button type="button" class="ghost" data-plact="copy">Copy the link</button></div>';
  }
  function render() {
    const admin = deps.role() === 'admin';
    const canAct = ['admin', 'organizer'].indexOf(deps.role()) >= 0;
    $('plSignup').hidden = !admin;
    $('plSignupSel').value = signup;
    $('plSignupNote').textContent = signup === 'open' ? 'Players make their own account on the players\' page; organizers can still invite.' : 'Only organizers make accounts, with an invitation link.';
    document.querySelectorAll('.pl-act').forEach((e) => { e.hidden = !canAct; });
    // Tickets and seasons.
    if (tk.season) $('plSeason').innerHTML = 'Current season: <b>' + esc(tk.season.name) + '</b> since ' + esc(when(tk.season.startedAt)) + (tk.seasons.length ? ' · ' + tk.seasons.length + ' before' : '');
    $('plKinds').innerHTML = tk.types.length ? tk.types.map((k) => '<li>' + esc(k.name) + ' <span class="muted">— ' + esc(k.max) + ' at most</span></li>').join('') : '<li class="muted">No kind of ticket yet.</li>';
    const balOf = new Map(tk.balances.map((b) => [b.nick, b.tickets]));
    const f = filter.toLowerCase();
    const list = rows.filter((r) => !f || r.nick.toLowerCase().indexOf(f) >= 0);
    $('plCount').textContent = list.length + ' of ' + rows.length;
    $('plList').innerHTML = list.length ? list.map((r) => {
      const a = r.account ? ACC[r.account] : null;
      const s = r.stats;
      let h = '<li class="acc"><div><b>' + esc(r.nick) + '</b> ' + (a ? '<span class="chip ' + a[1] + '">' + esc(a[0]) + '</span> ' : '') + (r.ban ? '<span class="chip bad">banned</span>' : '') +
        (r.role ? ' <span class="chip done">' + esc(ROLE[r.role] || r.role) + '</span>' : '') +
        (r.groups && r.groups.length ? r.groups.map((g) => ' <span class="chip">' + esc(g) + '</span>').join('') : '') +
        (r.verified && r.verified.length ? r.verified.map((v) => ' <span class="chip live" title="' + esc(when(v.at)) + '">verified on ' + esc(v.server) + '</span>').join('') : '') +
        '<br><span class="small muted">' + (s ? s.tournaments + ' tournament' + (s.tournaments === 1 ? '' : 's') + ' · ' + s.wins + ' won · ' + s.podiums + ' podium' + (s.podiums === 1 ? '' : 's') + ' · last ' + esc(when(s.last)) : 'no validated result') +
        (r.lastLoginAt ? ' · last sign-in ' + esc(when(r.lastLoginAt)) : '') + (r.account === 'invited' && r.inviteExpires ? ' · link valid until ' + esc(when(r.inviteExpires)) : '') + '</span>' +
        (r.ban ? '<br><span class="small">Banned ' + (r.ban.until ? 'until ' + esc(when(r.ban.until)) : 'until lifted') + ' by ' + esc(r.ban.by) + ': ' + esc(r.ban.reason) + '</span>' : '') +
        (r.note ? '<br><span class="small muted">Note: ' + esc(r.note) + '</span>' : '') +
        (tk.types.length ? '<br><span class="small">' + tk.types.map((k) => { const n = (balOf.get(r.nick.toLowerCase()) || {})[k.id] || 0;
          return '<span class="tkline">' + esc(k.name) + ' <b>' + n + '</b>' + (canAct ? ' <button type="button" class="mini ghost" data-plact="tk" data-nick="' + esc(r.nick) + '" data-type="' + esc(k.id) + '" data-d="-1" aria-label="Take a ' + esc(k.name) + ' ticket">−</button><button type="button" class="mini ghost" data-plact="tk" data-nick="' + esc(r.nick) + '" data-type="' + esc(k.id) + '" data-d="1" aria-label="Give a ' + esc(k.name) + ' ticket">+</button>' : '') + '</span>'; }).join(' · ') + '</span>' : '') + '</div>';
      if (canAct) {
        const k = esc(r.id || ''), n = esc(r.nick);
        h += '<div class="row pl-row">';
        if (!r.account) h += '<button type="button" data-plact="account" data-nick="' + n + '">Make an account</button>';
        else {
          h += '<button type="button" class="ghost" data-plact="reinvite" data-id="' + k + '">New invitation link</button>';
          h += r.account === 'disabled' ? '<button type="button" class="ghost" data-plact="enable" data-id="' + k + '">Turn on</button>' : '<button type="button" class="ghost" data-plact="disable" data-id="' + k + '">Turn off</button>';
        }
        if (admin && r.account) h += '<label class="sr" for="plRole_' + k + '">Role</label><select id="plRole_' + k + '" class="plrole" data-plrole="' + k + '" data-nick="' + n + '"><option value="">no role (player)</option>' +
          Object.keys(ROLE).map((x) => '<option value="' + x + '"' + (r.role === x ? ' selected' : '') + '>' + ROLE[x] + '</option>').join('') + '</select>';
        h += r.ban ? '<button type="button" data-plact="unban" data-id="' + k + '">Lift the ban</button>' : '<button type="button" class="danger" data-plact="ban" data-nick="' + n + '">Ban…</button>';
        h += '</div>';
        if (banning === r.nick) h += '<form class="row pl-ban" data-nick="' + n + '" data-id="' + k + '"><div><label for="plBanWhy">Why (shown to him)</label><input id="plBanWhy" maxlength="200" required minlength="3"></div>' +
          '<div><label for="plBanDays">Days (0: until lifted)</label><input id="plBanDays" type="number" inputmode="numeric" min="0" max="3650" value="30"></div>' +
          '<button type="submit" class="danger">Ban from every registration</button><button type="button" class="ghost" data-plact="bancancel">Cancel</button></form>';
      }
      return h + '</li>';
    }).join('') : '<li class="empty">' + (rows.length ? 'Nobody matches.' : 'No player yet: they appear with their first registration or result.') + '</li>';
  }
  function refresh() {
    return Promise.all([api('/admin/arena/players'), api('/admin/arena/tickets').catch(() => null)]).then(([d, k]) => {
      if (k && k.ok) tk = k;
      if (d.ok) { rows = d.players || []; signup = d.signup || 'invite'; render(); }
    }).catch(() => {});
  }
  const done = (text) => (d) => { if (!d.ok) return msg(d.error || 'Refused', true); msg(text); if (d.invite) showLink(d.player.nick, d.invite); refresh(); };
  const fail = (e) => msg(e.message || 'Network error', true);

  $('plKindForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    api('/admin/arena/tickets/type/add', { name: $('plKindName').value.trim(), max: Number($('plKindMax').value) || 10 }).then((d) => { if (d.ok) $('plKindName').value = ''; done('Kind of ticket added.')(d); }).catch(fail);
  });
  $('plSeasonForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!window.confirm('Start a new season? Every player\'s tickets go back to zero (the current season is kept in the history).')) return;
    api('/admin/arena/tickets/season', { name: $('plSeasonName').value.trim() }).then((d) => { if (d.ok) $('plSeasonName').value = ''; done(d.ok ? 'Season « ' + d.season.name + ' » started.' : '')(d); }).catch(fail);
  });
  $('plSearch').addEventListener('input', () => { filter = $('plSearch').value.trim(); render(); });
  $('plSignupSel').addEventListener('change', () => api('/admin/arena/players/settings', { signup: $('plSignupSel').value }).then(done('Sign-up: ' + $('plSignupSel').value + '.')).catch(fail));
  $('plCreateForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    api('/admin/arena/players/create', { nick: $('plNick').value.trim(), account: $('plWithAcc').checked, note: $('plNote').value.trim() }).then((d) => {
      if (!d.ok) return msg(d.error || 'Refused', true);
      $('plNick').value = ''; $('plNote').value = '';
      done(d.invite ? 'Account made for ' + d.player.nick + '.' : d.player.nick + ' added.')(d);
    }).catch(fail);
  });
  $('plList').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-plact]');
    if (!b) return;
    const a = b.dataset.plact, id = b.dataset.id, nick = b.dataset.nick;
    if (a === 'account') return api('/admin/arena/players/create', { nick, account: true }).then(done('Account made for ' + nick + '.')).catch(fail);
    if (a === 'reinvite') { if (!window.confirm('Make a new invitation link? The password is cleared and the player is signed out until he uses the link.')) return; return api('/admin/arena/players/reinvite', { id }).then(done('New invitation link made.')).catch(fail); }
    if (a === 'disable') return api('/admin/arena/players/disable', { id }).then(done('Account turned off: its sessions are ended.')).catch(fail);
    if (a === 'enable') return api('/admin/arena/players/enable', { id }).then(done('Account turned on.')).catch(fail);
    if (a === 'unban') return api('/admin/arena/players/unban', { id }).then(done('Ban lifted.')).catch(fail);
    if (a === 'tk') return api('/admin/arena/tickets/adjust', { nick, type: b.dataset.type, delta: Number(b.dataset.d) }).then(done('Tickets of ' + nick + ': ' + (Number(b.dataset.d) > 0 ? 'one given.' : 'one taken.'))).catch(fail);
    if (a === 'ban') { banning = nick; render(); const w = $('plBanWhy'); if (w) w.focus(); return; }
    if (a === 'bancancel') { banning = null; render(); }
  });
  $('plList').addEventListener('change', (ev) => {
    const sel = ev.target.closest('select[data-plrole]');
    if (!sel) return;
    const label = sel.value ? ROLE[sel.value] : 'no role';
    api('/admin/arena/players/role', { id: sel.dataset.plrole, role: sel.value || null }).then(done(sel.dataset.nick + ': ' + label + '.')).catch(fail);
  });
  $('plList').addEventListener('submit', (ev) => {
    const f = ev.target.closest('form.pl-ban');
    if (!f) return;
    ev.preventDefault();
    const body = { reason: $('plBanWhy').value.trim(), days: Number($('plBanDays').value) || 0 };
    if (f.dataset.id) body.id = f.dataset.id; else body.nick = f.dataset.nick;
    api('/admin/arena/players/ban', body).then((d) => { if (d.ok) banning = null; done(f.dataset.nick + ' is banned.')(d); }).catch(fail);
  });
  $('plLink').addEventListener('click', (ev) => {
    if (!ev.target.closest('[data-plact="copy"]')) return;
    const i = $('plLinkIn'); i.select();
    try { navigator.clipboard.writeText(i.value).then(() => msg('Link copied.')).catch(() => document.execCommand('copy')); } catch (e) { try { document.execCommand('copy'); } catch (e2) {} }
  });
  return { refresh };
}
