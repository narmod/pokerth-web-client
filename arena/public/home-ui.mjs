// ═══════════════════════════════════════════════════════════════════
// /arena/organize — « Home page » (service 0.31.0), the super admin only.
//
// What the players' home page shows, and in which order: a message from the
// site, the tables live on the LAN servers, this site's tournaments, the
// community sites' events (BBC, WEC, Monthly Cup), the latest results, the
// cups, the groups; how many rows each shows. Server: arena/lib/showcase.mjs
// (GET / POST /admin/arena/showcase).
// ═══════════════════════════════════════════════════════════════════

const TEXT = {
  message: ['A message from the site', 'a title and a few lines at the top of the page'],
  live: ['Live on the LAN servers', 'the tables open right now (each server\'s lobby, read at most once a minute)'],
  tournaments: ['Tournaments', 'this site\'s tournaments playing, open for registration and coming'],
  community: ['Community events', 'BBC steps, the WEC game of every evening and its finals, the Monthly Cup, the last winners — the web client\'s Events relay'],
  results: ['Latest results', 'this site\'s last validated tournaments, with their podium'],
  cups: ['Cups', 'the cups running, with their leader'],
  groups: ['Groups', 'the biggest groups and how to get in'],
};

export function createHomeView(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let data = null;
  const msg = (text, bad) => { const m = $('hMsg'); if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? (bad ? ' bad' : ' ok') : ''); } };
  function render() {
    if (!data) return;
    const n = data.sections.length;
    $('hList').innerHTML = data.sections.map((s, i) => '<li class="hrow"><label class="ck"><input type="checkbox" data-hon="' + esc(s.id) + '"' + (s.on ? ' checked' : '') + '> <span><b>' + esc(TEXT[s.id][0]) + '</b><br><span class="small muted">' + esc(TEXT[s.id][1]) +
      (s.id === 'community' && !data.community ? ' — not available on this install (no Events relay)' : '') + '</span></span></label>' +
      '<span class="hmove"><button type="button" class="mini ghost" data-hup="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move ' + esc(TEXT[s.id][0]) + ' up">↑</button><button type="button" class="mini ghost" data-hdown="' + i + '"' + (i === n - 1 ? ' disabled' : '') + ' aria-label="Move ' + esc(TEXT[s.id][0]) + ' down">↓</button></span></li>').join('');
    $('hTitle').value = data.message.title || '';
    $('hText').value = data.message.text || '';
    $('hMax').value = data.max || 6;
  }
  function refresh() { return api('/admin/arena/showcase').then((d) => { if (d.ok) { data = d; render(); } }).catch(() => {}); }
  const read = () => { data.sections.forEach((s) => { const c = document.querySelector('input[data-hon="' + s.id + '"]'); if (c) s.on = c.checked; }); data.message = { title: $('hTitle').value.trim(), text: $('hText').value.trim() }; data.max = Number($('hMax').value) || 6; };
  $('hList').addEventListener('click', (ev) => {
    const up = ev.target.closest('button[data-hup]'), down = ev.target.closest('button[data-hdown]');
    if (!up && !down) return;
    read();
    const i = Number((up || down).dataset[up ? 'hup' : 'hdown']), j = up ? i - 1 : i + 1;
    const s = data.sections; [s[i], s[j]] = [s[j], s[i]];
    render();
  });
  $('hForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    read();
    api('/admin/arena/showcase', { sections: data.sections, message: data.message, max: data.max }).then((d) => {
      if (!d.ok) return msg(d.error || 'Refused', true);
      data = Object.assign({ community: data.community }, d); render(); msg('Saved: the home page shows it at once.');
    }).catch((e) => msg(e.message || 'Network error', true));
  });
  return { refresh };
}
