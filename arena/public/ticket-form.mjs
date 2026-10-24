// ═══════════════════════════════════════════════════════════════════
// /arena/organize — a tournament's tickets (service 0.27.0): what it needs
// to register, what its first earn, the places that keep their ticket, and
// whether it ends the season. Server: arena/lib/tickets.mjs. The kinds of
// tickets are made in Players › Tickets and seasons.
// English only, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

let kinds = [];
export function loadTicketKinds(api) {
  return api('/admin/arena/tickets').then((d) => { if (d && d.ok) kinds = d.types || []; return d; }).catch(() => null);
}
export const ticketKinds = () => kinds;

export function ticketHtml(p, r, esc) {
  r = r || {};
  if (!kinds.length) return '<p class="small muted">No kind of ticket yet: make them in Players › Tickets and seasons.</p>';
  const sel = (id, v) => '<select id="' + p + id + '"><option value="">— none —</option>' + kinds.map((k) => '<option value="' + esc(k.id) + '"' + (k.id === v ? ' selected' : '') + '>' + esc(k.name) + '</option>').join('') + '</select>';
  return '<div class="row"><div><label for="' + p + 'need">Needs a ticket to register</label>' + sel('need', r.need) + '</div>' +
    '<div><label for="' + p + 'keep">Places that keep it (e.g. 3)</label><input id="' + p + 'keep" value="' + esc((r.keep || []).join(', ')) + '" placeholder="none"></div></div>' +
    '<div class="row"><div><label for="' + p + 'earn">Its first earn a ticket</label>' + sel('earn', r.earn && r.earn.type) + '</div>' +
    '<div><label for="' + p + 'top">how many</label><input id="' + p + 'top" type="number" inputmode="numeric" min="1" max="40" value="' + esc((r.earn && r.earn.top) || 2) + '"></div></div>' +
    '<label class="ck"><input type="checkbox" id="' + p + 'ends"' + (r.endsSeason ? ' checked' : '') + '> Ends the season once validated: every ticket starts again from zero</label>' +
    '<p class="small muted">Tickets move once the tournament is validated: a ranked player spends the ticket it needed (unless his place keeps it), the first earn theirs. An absent player spends nothing.</p>';
}

export function readTickets(p) {
  const $ = (k) => document.getElementById(p + k);
  if (!$('need')) return undefined;
  const out = {};
  if ($('need').value) out.need = $('need').value;
  if ($('earn').value) out.earn = { type: $('earn').value, top: Number($('top').value) || 2 };
  const keep = $('keep').value.split(/[^0-9]+/).map(Number).filter((x) => x >= 1 && x <= 40);
  if (out.need && keep.length) out.keep = keep;
  if ($('ends').checked) out.endsSeason = true;
  return Object.keys(out).length ? out : null;
}

export function ticketSummary(r) {
  if (!r) return '';
  const nm = (id) => { const k = kinds.find((x) => x.id === id); return k ? k.name : '?'; };
  const out = [];
  if (r.need) out.push('needs « ' + nm(r.need) + ' »' + (r.keep ? ' (kept by ' + r.keep.join(', ') + ')' : ''));
  if (r.earn) out.push('first ' + r.earn.top + ' earn « ' + nm(r.earn.type) + ' »');
  if (r.endsSeason) out.push('ends the season');
  return out.join(' · ');
}
