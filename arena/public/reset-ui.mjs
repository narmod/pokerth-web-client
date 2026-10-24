// ═══════════════════════════════════════════════════════════════════
// /arena/organize — « Reset » view (service 0.22.0), the super admin only.
//
// Start again from zero: pick what to take away (Table check, tournaments,
// cups, images added), type RESET, done. Everything moves to a dated folder
// on the server (<ARENA_DIR>/reset-<date>/), nothing is thrown away. What is
// kept stays whole (a kept tournament keeps its watches and its image).
// Talks to /admin/arena/reset; server: arena/lib/reset.mjs.
// ═══════════════════════════════════════════════════════════════════

const PART_TEXT = {
  watches: ['Table check', 'every watched table, its journal and its result'],
  tournaments: ['Tournaments', 'every tournament, with its tables, players, results, journals and witnesses — and the medals they gave'],
  cups: ['Cups', 'every cup and its standings — and the medals they gave'],
  images: ['Images added', 'the images organizers added (the two shipped images stay)'],
};

export function createResetView(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let data = null;
  const msg = (text, bad) => { const m = $('rMsg'); if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? (bad ? ' bad' : ' ok') : ''); } };
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

  function render() {
    if (!data) return;
    const c = data.counts || {};
    const n = { watches: plural(c.watches || 0, 'watch', 'watches'), tournaments: plural(c.tournaments || 0, 'tournament', 'tournaments') + (c.tables ? ' (+ ' + plural(c.tables, 'table', 'tables') + ')' : ''),
      cups: plural(c.cups || 0, 'cup', 'cups'), images: plural(c.images || 0, 'image', 'images') };
    $('rParts').innerHTML = (data.parts || []).map((p) => '<label class="chk"><input type="checkbox" name="rPart" value="' + esc(p) + '" checked> <b>' + esc(PART_TEXT[p][0]) + '</b> <span class="muted">(' + esc(n[p]) + ')</span><br><span class="small muted">' + esc(PART_TEXT[p][1]) + '</span></label>').join('');
    $('rRunning').hidden = !(data.running && data.running.length);
    $('rRunning').innerHTML = data.running && data.running.length ? '<b>Still running:</b> ' + data.running.map(esc).join(', ') + '. Stop or close it before taking it away.' : '';
    const last = data.last;
    $('rLast').innerHTML = last ? 'Last reset: ' + esc(new Date(last.at).toLocaleString()) + ' by ' + esc(last.by) + ' — ' + esc(last.parts.map((p) => PART_TEXT[p] ? PART_TEXT[p][0] : p).join(', ')) + ', kept in <code>' + esc(last.archive) + '</code>.' : 'No reset yet.';
  }
  function refresh() {
    return api('/admin/arena/reset').then((d) => { if (d.ok) { data = d; render(); } }).catch(() => {});
  }
  $('rForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const parts = Array.from(document.querySelectorAll('input[name="rPart"]:checked')).map((x) => x.value);
    if (!parts.length) return msg('Pick what to take away.', true);
    const confirm = $('rConfirm').value.trim();
    if (confirm !== 'RESET') return msg('Type RESET in capitals to confirm.', true);
    msg('Working…');
    api('/admin/arena/reset', { parts, confirm }).then((d) => {
      if (!d.ok) return msg(d.error || 'Refused', true);
      $('rConfirm').value = '';
      const r = d.reset, done = r.done || {};
      const said = parts.map((p) => PART_TEXT[p][0] + ' ' + (done[p] || 0)).join(', ');
      const kept = Object.keys(r.kept || {}).filter((k) => parts.indexOf(k) >= 0 && r.kept[k] > 0).map((k) => PART_TEXT[k][0].toLowerCase() + ' ' + r.kept[k]);
      msg('Done — taken away: ' + said + (kept.length ? '; kept because still in use: ' + kept.join(', ') : '') + '. Everything is in ' + r.archive + ' on the server.');
      data = d; render();
      if (deps.changed) deps.changed();
    }).catch((e) => msg(e.message || 'Network error', true));
  });
  return { refresh };
}
