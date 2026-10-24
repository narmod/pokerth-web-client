// ═══════════════════════════════════════════════════════════════════
// /arena/organize — « Who may register » (service 0.26.0): the conditions
// of a tournament or a cup, the same form for both (tournaments-ui.mjs,
// cup-plan-ui.mjs). Server: arena/lib/access.mjs. All conditions hold
// together; the organizer adding a player, and qualifiers, are not held back.
// English only, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

let cups = [];
export function loadAccessCups(api) {
  return api('/admin/arena/cups/list').then((d) => { if (d && d.ok) cups = d.cups || []; }).catch(() => {});
}

export function accessHtml(p, a, esc) {
  a = a || {};
  const num = (k, label, v, ph) => '<div><label for="' + p + k + '">' + label + '</label><input id="' + p + k + '" type="number" inputmode="numeric" min="0" max="1000" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(ph || '') + '"></div>';
  const cupOpts = '<option value="">— no cup —</option>' + cups.map((c) => '<option value="' + esc(c.id) + '"' + (a.cup && a.cup.id === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') +
    (a.cup && !cups.some((c) => c.id === a.cup.id) ? '<option value="' + esc(a.cup.id) + '" selected>' + esc(a.cup.name || a.cup.id) + '</option>' : '');
  return '<div class="accessf" data-access="' + esc(p) + '">' +
    '<label class="ck"><input type="checkbox" id="' + p + 'acct"' + (a.identity === 'account' ? ' checked' : '') + '> A player account (signed in)</label>' +
    '<div class="row">' + num('min', 'At least … tournaments played here', a.minTournaments || '', '0') + num('max', 'At most … (beginners; empty: no limit)', a.maxTournaments != null ? a.maxTournaments : '', '') + num('pts', 'At least … points here', a.minPoints || '', '0') + '</div>' +
    '<div class="row"><div><label for="' + p + 'medal">Medals</label><select id="' + p + 'medal">' +
      [['', 'no condition'], ['any', 'at least one medal'], ['gold', 'at least one gold medal'], ['none', 'no medal yet (beginners)']].map((o) => '<option value="' + o[0] + '"' + ((a.noMedal ? 'none' : a.medal || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div>' +
    '<div><label for="' + p + 'cup">A place in a cup</label><select id="' + p + 'cup">' + cupOpts + '</select></div>' + num('top', 'within the first …', a.cup ? a.cup.top : '', '8') + '</div>' +
    '<p class="small muted">Points: each validated tournament (not Friendly) gives the players finished behind + 1, as in cups. Counted from this site\'s validated results only. A player refused is told what is missing; you can still add him yourself.</p></div>';
}

export function readAccess(p) {
  const $ = (k) => document.getElementById(p + k);
  if (!$('min')) return undefined;
  const n = (k) => ($(k).value === '' ? null : Number($(k).value));
  const medal = $('medal').value;
  const cupId = $('cup').value;
  const c = cups.find((x) => x.id === cupId);
  const out = { identity: $('acct').checked ? 'account' : undefined, minTournaments: n('min') || undefined, maxTournaments: n('max') == null ? undefined : n('max'), minPoints: n('pts') || undefined,
    medal: medal === 'any' || medal === 'gold' ? medal : undefined, noMedal: medal === 'none' ? true : undefined,
    cup: cupId ? { id: cupId, top: n('top') || 8, name: c ? c.name : '' } : undefined };
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
}

// One line for the organizer's summaries.
export function accessSummary(a) {
  if (!a) return 'anyone';
  const out = [];
  if (a.identity === 'account') out.push('player account');
  if (a.minTournaments) out.push('≥ ' + a.minTournaments + ' tournaments');
  if (a.maxTournaments != null) out.push('≤ ' + a.maxTournaments + ' tournaments');
  if (a.minPoints) out.push('≥ ' + a.minPoints + ' points');
  if (a.medal === 'any') out.push('a medal');
  if (a.medal === 'gold') out.push('a gold medal');
  if (a.noMedal) out.push('no medal');
  if (a.cup) out.push('top ' + a.cup.top + ' of « ' + (a.cup.name || '?') + ' »');
  return out.join(' · ') || 'anyone';
}
