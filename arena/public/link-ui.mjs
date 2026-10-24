// ═══════════════════════════════════════════════════════════════════
// /arena/organize — « Web client » view (service 0.34.0), the super admin only.
//
// When the Arena runs as an application of its own, it gets the servers it
// may use and the community events from a PokerTH web client it is linked
// to (arena/lib/link.mjs). This view shows the link key to paste in the web
// client (Admin › Community › Arena › « Its own app »), which web client is
// linked, when it last answered, and renews the key.
// Launched by the web client itself, there is nothing to link: it says so.
// Talks to /admin/arena/link.
// ═══════════════════════════════════════════════════════════════════

export function createLinkView(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let data = null, shown = false;
  const msg = (text, bad) => { const m = $('lkMsg'); if (m) { m.textContent = text || ''; m.className = 'msg' + (text ? (bad ? ' bad' : ' ok') : ''); } };
  const when = (t) => (t ? new Date(t).toLocaleString() : '—');

  function render() {
    if (!data) return;
    const emb = data.mode === 'embedded';
    $('lkEmbedded').hidden = !emb;
    $('lkStandalone').hidden = emb;
    if (emb) return;
    const k = String(data.key || '');
    $('lkKey').textContent = shown ? k : (k ? k.slice(0, 8) + '•'.repeat(24) : '—');
    $('lkShow').textContent = shown ? 'Hide' : 'Show';
    $('lkRotate').hidden = !!data.keyFromEnv;
    $('lkKeyNote').textContent = data.keyFromEnv ? 'This key comes from ARENA_LINK_KEY: change it there.' : 'Made by this Arena and kept in its data folder.';
    const linked = !!data.webClient;
    $('lkState').innerHTML = linked
      ? 'Linked to <b>' + esc(data.webClient) + '</b>' + (data.webClientVersion ? ' (' + esc(data.webClientVersion) + ')' : '') + (data.fixed ? ' — fixed by ARENA_WEBCLIENT_URL' : '') + '.'
      : 'Not linked yet. In the web client: Admin › Community › Arena › « Its own app », this Arena’s address and the key above, then « Test and save ».';
    $('lkPull').innerHTML = linked
      ? 'Linked: ' + esc(when(data.linkedAt)) + ' · last answer from the web client: ' + esc(when(data.lastPull)) + (data.lastError ? ' · <span class="bad">last error: ' + esc(data.lastError) + '</span>' : '')
      : '';
  }
  function refresh() {
    return api('/admin/arena/link').then((d) => { if (d && d.ok) { data = d; render(); } else msg((d && d.error) || 'Could not load', true); }).catch((e) => msg(e.message || 'Network error', true));
  }
  $('lkShow').addEventListener('click', () => { shown = !shown; render(); });
  $('lkCopy').addEventListener('click', () => {
    const k = data && data.key;
    if (!k) return;
    const done = () => msg('Key copied.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(k).then(done).catch(() => { shown = true; render(); msg('Copy it from the box.'); });
    else { shown = true; render(); msg('Copy it from the box.'); }
  });
  $('lkRotate').addEventListener('click', () => {
    if (!window.confirm('Make a new key? The web client linked now stops reaching this Arena until it is given the new key.')) return;
    msg('Working…');
    api('/admin/arena/link/rotate', {}).then((d) => {
      if (!d || !d.ok) return msg((d && d.error) || 'Refused', true);
      data = d; shown = true; render();
      msg('New key made: paste it in the web client.');
    }).catch((e) => msg(e.message || 'Network error', true));
  });
  return { refresh };
}
