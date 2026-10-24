// ═══════════════════════════════════════════════════════════════════
// /arena/organize — the image of a tournament or a cup (service 0.17.0).
//
// A picker over the library (GET /admin/arena/images): the two images
// shipped with the service and those organizers added. Any organizer may add
// one: the image is made here into a JPEG of 800 px at most on its longer
// side and a thumbnail of 192 px, then sent (POST …/images/add). Used by the
// tournament and cup forms; English only, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

export function createImagePicker(deps) {
  const { api, esc } = deps;
  let list = null;
  const onPick = new Map();   // picker id → callback(imageId)

  function load() {
    return api('/admin/arena/images').then((d) => { if (d && d.ok) list = d.images; return list; });
  }
  // kind: 'tournament' | 'cup' (its default); sel: the image id, or null for the default.
  function html(id, kind, sel) {
    if (!list) return '<p class="small muted">Loading the images…</p>';
    const cur = sel || kind;
    return '<div class="impick" data-ip="' + esc(id) + '" data-kind="' + esc(kind) + '" data-sel="' + esc(sel || '') + '">' +
      '<div class="ip-grid" role="radiogroup" aria-label="Image">' + list.map((x) =>
        '<button type="button" class="ip-opt' + (x.id === cur ? ' on' : '') + '" role="radio" aria-checked="' + (x.id === cur) + '" data-img="' + esc(x.id) + '" title="' + esc(x.name + (x.id === kind ? ' (default)' : x.by ? ' — added by ' + x.by : '')) + '">' +
        '<img src="' + esc(x.thumb) + '" alt="" loading="lazy"><span>' + esc(x.name) + '</span></button>').join('') + '</div>' +
      '<details class="ip-add"><summary>Add an image to the library</summary><div class="row">' +
      '<div><label for="' + esc(id) + '_n">Name</label><input id="' + esc(id) + '_n" maxlength="40" placeholder="Spring league"></div>' +
      '<div><label for="' + esc(id) + '_f">Image</label><input id="' + esc(id) + '_f" type="file" accept="image/*"></div>' +
      '<button type="button" class="ghost" data-ipadd>Add</button></div>' +
      '<p class="small muted">Made here into a picture of 800 px at most (and a small one for the lists). Every organizer can then use it; it cannot be removed or replaced.</p>' +
      '<div class="msg" data-ipmsg role="status"></div></details></div>';
  }
  const box = (id) => document.querySelector('.impick[data-ip="' + id + '"]');
  function value(id) { const b = box(id); return b ? (b.dataset.sel || null) : undefined; }
  function setPick(id, fn) { onPick.set(id, fn); }
  function select(b, img) {
    b.dataset.sel = img;
    b.querySelectorAll('.ip-opt').forEach((x) => { const on = x.dataset.img === img; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
    const fn = onPick.get(b.dataset.ip);
    if (fn) fn(img);
  }
  // Fit into max×max, as a JPEG under the limit.
  function encode(img, max, limit) {
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
    const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    for (const q of [0.85, 0.75, 0.65, 0.5]) {
      const b64 = c.toDataURL('image/jpeg', q).replace(/^data:[^,]*,/, '');
      if (b64.length * 3 / 4 <= limit) return b64;
    }
    return null;
  }
  function add(b) {
    const id = b.dataset.ip;
    const say = (t, bad) => { const m = b.querySelector('[data-ipmsg]'); m.textContent = t || ''; m.className = 'msg' + (t ? (bad ? ' bad' : ' ok') : ''); };
    const name = (document.getElementById(id + '_n').value || '').trim();
    const f = document.getElementById(id + '_f').files[0];
    if (name.length < 2) return say('Give it a name (2 to 40 characters).', true);
    if (!f) return say('Choose an image.', true);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const full = encode(img, 800, 400 * 1024), thumb = encode(img, 192, 48 * 1024);
      if (!full || !thumb) return say('This image cannot be made small enough.', true);
      say('Sending…');
      api('/admin/arena/images/add', { name, full, thumb }).then((d) => {
        if (!d.ok) return say(d.error || 'Refused', true);
        return load().then(() => {
          // Every picker on the page gets the new image; this one takes it.
          document.querySelectorAll('.impick').forEach((x) => {
            const w = document.createElement('div');
            w.innerHTML = html(x.dataset.ip, x.dataset.kind, x === b ? d.image.id : (x.dataset.sel || null));
            x.replaceWith(w.firstChild);
          });
          const nb = box(id);
          if (nb) { select(nb, d.image.id); const m = nb.querySelector('[data-ipmsg]'); if (m) { m.textContent = 'Image added.'; m.className = 'msg ok'; } }
        });
      }).catch(() => say('Network error', true));
    };
    img.onerror = () => { URL.revokeObjectURL(url); say('Not an image.', true); };
    img.src = url;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.impick');
    if (!b) return;
    const o = e.target.closest('.ip-opt');
    if (o) return select(b, o.dataset.img);
    if (e.target.closest('[data-ipadd]')) add(b);
  });
  return { load, ready: () => !!list, html, value, setPick };
}
