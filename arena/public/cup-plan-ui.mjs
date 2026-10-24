// ═══════════════════════════════════════════════════════════════════
// /arena/organize — a cup's « Programme » (service 0.23.0).
//
// How the cup runs (series, series + final, steps, one tournament), its dates
// (a repetition worked out here, in the organizer's own time, then each date
// moved, added or taken off), who makes the tournaments (the cup or the
// organizer), how players register (once for the cup or per tournament), and
// the settings every tournament of the cup gets. Then the dated slots with
// their tournaments. Server side: arena/lib/cupplan.mjs, cups.mjs.
// English only, like the rest of the organizer side.
// ═══════════════════════════════════════════════════════════════════

import { absenceFields, readAbsence } from './tournaments-ui.mjs';

export const FORMAT_TEXT = {
  series: ['Series', 'several tournaments, points for each player (best N results)'],
  seriesFinal: ['Series + final', 'several tournaments, then a final for the top of the standings'],
  stages: ['Steps', 'the first of each tournament go on to the next step, up to the final'],
  single: ['One tournament', 'the cup is played in one tournament (one table or several)'],
};
const EVERY = [['day', 'every day'], ['week', 'every week'], ['2weeks', 'every two weeks'], ['month', 'every month']];
const DAY = 24 * 3600e3;

const pad = (n) => String(n).padStart(2, '0');
export function localInput(ts) { if (!ts) return ''; const d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
const fromInput = (v) => { const t = v ? new Date(v).getTime() : NaN; return t > 0 ? t : null; };
// The dates of a repetition, in the organizer's own time (summer time kept).
export function repeatDates(from, every, count) {
  const out = [];
  const d = new Date(from);
  const day = d.getDate();
  for (let i = 0; i < count; i++) {
    const x = new Date(d.getTime());
    if (every === 'day') x.setDate(day + i);
    else if (every === 'week') x.setDate(day + 7 * i);
    else if (every === '2weeks') x.setDate(day + 14 * i);
    else { x.setDate(1); x.setMonth(d.getMonth() + i); x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate())); }
    out.push(x.getTime());
  }
  return out;
}

export function createCupPlan(deps) {
  const { api, esc } = deps;
  const $ = (id) => document.getElementById(id);
  let cup = null, ed = null, locked = new Set();

  function fresh(c) {
    const next = new Date(Date.now() + 7 * DAY); next.setHours(21, 0, 0, 0);
    const p = c.planView;
    if (!p) return { format: 'series', create: 'auto', registration: 'cup', stageEntry: 'all', tables: 'one', every: 'week', count: 4, from: next.getTime(),
      series: [], final: { at: null, top: 10 }, steps: [{ dates: [], qualify: 3 }, { dates: [] }], single: { at: next.getTime() }, common: { profile: 'club', autoOpen: true, openBefore: 10, announce: true, chatLang: 'en' } };
    const per = (k) => p.slots.filter((s) => s.step === k && s.kind !== 'final');
    const fin = p.slots.find((s) => s.kind === 'final');
    const stepCount = p.format === 'stages' ? Math.max(...p.slots.map((s) => s.step)) : 2;
    return { format: p.format, create: p.create, registration: p.registration, stageEntry: p.stageEntry, tables: p.tables,
      every: (p.rule && p.rule.every) || 'week', count: (p.rule && p.rule.count) || 4, from: (p.rule && p.rule.from) || (p.slots[0] && p.slots[0].at) || next.getTime(),
      series: p.format === 'series' || p.format === 'seriesFinal' ? per(1).map((s) => s.at) : [],
      final: { at: fin ? fin.at : null, top: p.top || 10 },
      steps: p.format === 'stages' ? Array.from({ length: stepCount }, (_, i) => (i === stepCount - 1 ? { dates: fin ? [fin.at] : [] } : { dates: per(i + 1).map((s) => s.at), qualify: (per(i + 1)[0] || {}).qualify || 3 })) : [{ dates: [], qualify: 3 }, { dates: [] }],
      single: { at: (p.slots.find((s) => s.kind === 'single') || {}).at || next.getTime() }, common: Object.assign({}, p.common || {}) };
  }

  const dateRow = (id, ts, key) => {
    const lock = locked.has(key);
    return '<li class="pdate"><input type="datetime-local" id="' + id + '" value="' + esc(localInput(ts)) + '"' + (lock ? ' disabled title="played or under way: its date stays"' : '') + ' data-key="' + esc(key) + '">' +
      (lock ? '<span class="chip done">started</span>' : '<button type="button" class="ghost" data-pact="rmdate" data-list="' + esc(id.replace(/_\d+$/, '')) + '" data-i="' + esc(id.replace(/^.*_/, '')) + '" aria-label="Take this date off">×</button>') + '</li>';
  };
  const dateList = (list, dates, keyOf) => '<ol class="pdates" id="' + list + '">' + dates.map((ts, i) => dateRow(list + '_' + i, ts, keyOf(i))).join('') + '</ol>' +
    '<div class="actions"><button type="button" class="ghost" data-pact="adddate" data-list="' + list + '">+ Add a date</button></div>';
  const generator = (list) => '<div class="row pgen"><div><label for="' + list + 'From">First date</label><input type="datetime-local" id="' + list + 'From" value="' + esc(localInput(ed.from)) + '"></div>' +
    '<div><label for="' + list + 'Every">Then</label><select id="' + list + 'Every">' + EVERY.map((x) => '<option value="' + x[0] + '"' + (x[0] === ed.every ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></div>' +
    '<div><label for="' + list + 'Count">How many</label><input type="number" inputmode="numeric" min="1" max="30" id="' + list + 'Count" value="' + esc(ed.count) + '"></div>' +
    '<button type="button" data-pact="gen" data-list="' + list + '">Make the dates</button></div>';

  function html() {
    const f = ed.format;
    const radio = (name, v, cur, label) => '<label class="ck"><input type="radio" name="' + name + '" value="' + v + '"' + (v === cur ? ' checked' : '') + '> ' + label + '</label>';
    let h = '<div class="pform">';
    h += '<div class="row"><div><label for="pFormat">How the cup runs</label><select id="pFormat">' + Object.keys(FORMAT_TEXT).map((k) => '<option value="' + k + '"' + (k === f ? ' selected' : '') + '>' + esc(FORMAT_TEXT[k][0] + ' — ' + FORMAT_TEXT[k][1]) + '</option>').join('') + '</select></div></div>';
    h += '<p class="small muted tf-lbl">Dates</p>';
    if (f === 'series' || f === 'seriesFinal') {
      h += generator('pSer') + dateList('pSer', ed.series, (i) => '1-' + (i + 1));
      if (f === 'seriesFinal') h += '<div class="row"><div><label for="pFinAt">The final</label><input type="datetime-local" id="pFinAt" value="' + esc(localInput(ed.final.at)) + '"' + (locked.has('final') ? ' disabled' : '') + '></div>' +
        '<div><label for="pTop">Players of the standings in the final</label><input type="number" inputmode="numeric" min="2" max="40" id="pTop" value="' + esc(ed.final.top) + '"></div></div>' +
        '<p class="small muted">More than 10: the final is played on several tables. The top of the standings go in once every tournament of the series is validated, or an hour before the final at the latest.</p>';
    }
    if (f === 'stages') {
      h += '<div class="row"><div><label for="pSteps">Steps (the last one is the final)</label><select id="pSteps">' + [2, 3, 4].map((n) => '<option' + (n === ed.steps.length ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div></div>';
      ed.steps.forEach((s, i) => {
        const last = i === ed.steps.length - 1;
        if (last) { h += '<div class="pstep"><b>Final</b><div class="row"><div><label for="pStepF">Date</label><input type="datetime-local" id="pStepF" value="' + esc(localInput(s.dates[0])) + '"' + (locked.has('final') ? ' disabled' : '') + '></div></div></div>'; return; }
        h += '<div class="pstep"><b>Step ' + (i + 1) + '</b><div class="row"><div><label for="pQ' + i + '">The first … of each tournament go on</label><input type="number" inputmode="numeric" min="1" max="10" id="pQ' + i + '" value="' + esc(s.qualify || 3) + '"></div></div>' +
          (i === 0 ? generator('pSt0') : '') + dateList('pSt' + i, s.dates, (j) => (i + 1) + '-' + (j + 1)) + '</div>';
      });
      h += '<p class="small muted">Tournament 1 of a step sends its qualifiers to tournament 1 of the next step, tournament 2 to tournament 2, and so on round again.</p>';
    }
    if (f === 'single') h += '<div class="row"><div><label for="pOne">Date</label><input type="datetime-local" id="pOne" value="' + esc(localInput(ed.single.at)) + '"' + (locked.has('single') ? ' disabled' : '') + '></div></div>';
    h += '<p class="small muted tf-lbl">Tournaments</p><div class="tf-inline">' + radio('pCreate', 'auto', ed.create, 'made by the cup, opened by the director at their time') + radio('pCreate', 'organizer', ed.create, 'made by the organizer, date by date') + '</div>';
    h += '<div class="tf-inline">' + radio('pTables', 'one', ed.tables, 'one table each (10 players)') + radio('pTables', 'several', ed.tables, 'several tables each (up to 40)') + '</div>';
    h += '<p class="small muted tf-lbl">Registration</p><div class="tf-inline">' + radio('pReg', 'cup', ed.registration, 'once for the whole cup') + radio('pReg', 'tournament', ed.registration, 'for each tournament') + '</div>';
    if (f === 'stages') h += '<div class="tf-inline" id="pEntry"' + (ed.registration === 'cup' ? '' : ' hidden') + '>' + radio('pEntryR', 'all', ed.stageEntry, 'in every tournament of step 1') + radio('pEntryR', 'choose', ed.stageEntry, 'the player picks his tournament of step 1') + '</div>';
    // Settings every tournament of the cup gets.
    const c = ed.common || {};
    const servers = deps.servers();
    h += '<details class="sub"' + (cup.planView ? '' : ' open') + '><summary>Settings of every tournament</summary>' +
      '<div class="row"><div><label for="pSrv">LAN server</label><select id="pSrv"><option value="">— not said —</option>' + servers.map((s) => '<option value="' + esc(s.ref) + '"' + (c.server && c.server.ref === s.ref ? ' selected' : '') + '>' + esc(s.name) + ' — ' + esc(s.host) + ':' + esc(s.port) + '</option>').join('') + '</select></div>' +
      '<div><label for="pProfile">Profile</label><select id="pProfile">' + ['friendly', 'club', 'official'].map((x) => '<option' + (x === (c.profile || 'club') ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></div></div>' +
      '<div class="row"><label class="ck"><input type="checkbox" id="pAuto"' + (c.autoOpen !== false ? ' checked' : '') + '> The director opens each table by itself</label><div><label for="pBefore">minutes before the start</label><input id="pBefore" type="number" inputmode="numeric" min="0" max="120" value="' + esc(c.openBefore != null ? c.openBefore : 10) + '"></div></div>' +
      '<label class="ck"><input type="checkbox" id="pAnn"' + (c.announce !== false ? ' checked' : '') + '> Announcements in the table chat</label>' +
      '<div class="row"><div><label for="pLang">Language of the director in the chat</label><select id="pLang">' + deps.langOptions(c.chatLang || 'en') + '</select></div></div>' +
      absenceFields('pa_', c.absence, esc) +
      '<p class="small muted">Table settings</p>' + deps.TF().html('pt_', c.table || undefined) + '</details>';
    h += '<div class="actions"><button type="button" class="primary" data-pact="save">' + (cup.planView ? 'Save the programme' : 'Set the programme') + '</button></div>';
    h += '<p class="small muted">Saving again later changes only the tournaments that have not started: their date and their settings. A date taken off takes its tournament away when the cup made it and nothing has started.</p>';
    return h + '</div>';
  }
  const readList = (list) => Array.from(document.querySelectorAll('#' + list + ' input[type=datetime-local]')).map((i) => fromInput(i.value));
  const radioVal = (n, d) => { const e = document.querySelector('input[name="' + n + '"]:checked'); return e ? e.value : d; };
  function collect() {
    if (!$('pFormat')) return;
    ed.format = $('pFormat').value;
    ed.create = radioVal('pCreate', ed.create); ed.tables = radioVal('pTables', ed.tables); ed.registration = radioVal('pReg', ed.registration); ed.stageEntry = radioVal('pEntryR', ed.stageEntry);
    for (const g of ['pSer', 'pSt0']) if ($(g + 'From')) { ed.from = fromInput($(g + 'From').value) || ed.from; ed.every = $(g + 'Every').value; ed.count = Number($(g + 'Count').value) || ed.count; }
    if ($('pSer')) ed.series = readList('pSer');
    if ($('pFinAt')) { ed.final.at = fromInput($('pFinAt').value); ed.final.top = Number($('pTop').value) || ed.final.top; }
    if ($('pSteps')) ed.steps.forEach((s, i) => { if (i === ed.steps.length - 1) s.dates = [fromInput($('pStepF').value)].filter(Boolean); else { s.dates = readList('pSt' + i); s.qualify = Number($('pQ' + i).value) || s.qualify; } });
    if ($('pOne')) ed.single.at = fromInput($('pOne').value);
    const srv = deps.servers().find((s) => s.ref === ($('pSrv') && $('pSrv').value));
    ed.common = { profile: $('pProfile').value, server: srv ? { ref: srv.ref, name: srv.name, host: srv.host, port: srv.port } : null, autoOpen: $('pAuto').checked, openBefore: Number($('pBefore').value),
      announce: $('pAnn').checked, chatLang: $('pLang').value || 'en', absence: readAbsence('pa_'), table: deps.TF().read('pt_') };
  }
  function render() { $('cPlanEd').innerHTML = html(); }
  function body() {
    const f = ed.format;
    const b = { format: f, create: ed.create, registration: ed.registration, stageEntry: ed.stageEntry, tables: ed.tables, rule: { every: ed.every, count: ed.count, from: ed.from }, common: ed.common };
    if (f === 'series' || f === 'seriesFinal') b.series = ed.series.filter(Boolean);
    if (f === 'seriesFinal') b.final = { at: ed.final.at, top: ed.final.top };
    if (f === 'stages') b.steps = ed.steps.map((s, i) => (i === ed.steps.length - 1 ? { dates: s.dates } : { dates: s.dates.filter(Boolean), qualify: s.qualify }));
    if (f === 'single') b.single = { at: ed.single.at };
    return b;
  }

  // The slots and their tournaments (once the programme is set).
  function slotsHtml(c) {
    const p = c.planView;
    if (!p) return '';
    const when = (ts) => new Date(ts).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const own = deps.tournaments().filter((t) => !t.cup && !p.slots.some((s) => s.tournamentId === t.id));
    const closed = c.status === 'closed';
    let h = '<ul class="rank pslots">' + p.slots.map((s) => {
      const t = s.tournament;
      let line = '<li' + (p.next === s.key ? ' class="next"' : '') + '><span class="nk"><b>' + esc(when(s.at)) + '</b> · ' + esc(s.label) + (s.qualify ? ' <span class="muted small">first ' + esc(s.qualify) + ' go on</span>' : '') +
        (p.next === s.key ? ' <span class="chip live">next</span>' : '') + '<br><span class="small muted">' +
        (t ? esc(t.name) + ' · ' + esc(t.status) + ' · ' + esc(t.players) + ' player' + (t.players === 1 ? '' : 's') + (t.format === 'multi' ? ' · several tables' : '') + (s.auto ? '' : ' · made by the organizer') : 'no tournament yet') + '</span></span><span class="pact">';
      if (!closed && !t && (p.create === 'organizer' || !s.tournamentId)) {
        line += '<button type="button" data-pact="make" data-key="' + esc(s.key) + '">Make this tournament</button>';
        if (own.length) line += '<select id="pAtt_' + esc(s.key) + '" aria-label="A tournament of yours for this date">' + own.map((o) => '<option value="' + esc(o.id) + '">' + esc(o.name) + '</option>').join('') + '</select><button type="button" class="ghost" data-pact="attach" data-key="' + esc(s.key) + '">Attach</button>';
      }
      if (!closed && t) line += '<button type="button" class="ghost" data-pact="goto" data-id="' + esc(s.tournamentId) + '">Open</button>' + (t.status !== 'validated' ? '<button type="button" class="ghost" data-pact="detach" data-key="' + esc(s.key) + '">Detach</button>' : '');
      return line + '</span></li>';
    }).join('') + '</ul>';
    const rs = p.registrationState;
    if (rs && rs.mode === 'cup') h += '<p class="small">Registered for the cup: <b>' + esc(rs.count) + '</b> / ' + esc(rs.cap) + (rs.closed ? ' · closed (' + esc(rs.closed) + ')' : ' · open') + (rs.players.length ? ' — ' + rs.players.map(esc).join(', ') : '') + '</p>';
    else h += '<p class="small muted">Players register on each tournament\'s page.</p>';
    return h;
  }

  // The « Programme » block of the cup's detail.
  function blockHtml(c) {
    cup = c;
    locked = new Set(((c.planView && c.planView.slots) || []).filter((s) => s.tournament && s.tournament.started).map((s) => s.key));
    ed = fresh(c);
    const p = c.planView;
    const canHave = !!p || !c.events.length;
    if (!canHave) return '';
    return '<h3>Programme ' + (p ? '<span class="muted small">' + esc(FORMAT_TEXT[p.format][0]) + ' · ' + p.slots.length + ' date' + (p.slots.length === 1 ? '' : 's') + '</span>' : '') + '</h3>' +
      (p ? slotsHtml(c) : '<p class="small muted">Say how the cup runs: its dates, its tournaments, how players register. The director then applies it.</p>') +
      (c.status === 'closed' ? '' : '<details class="sub org-only"' + (p ? '' : ' open') + ' id="cPlanBox"><summary>' + (p ? 'Change the programme' : 'Set the programme') + '</summary><div id="cPlanEd"></div></details>');
  }
  function mount() { if ($('cPlanEd')) render(); }

  function act(path, b, okText) {
    return api(path, Object.assign({ id: cup.id }, b)).then((d) => {
      if (!d.ok) return deps.say(d.error || 'Refused', true);
      deps.shown(d, okText);
    }).catch((e) => deps.say(e.message || 'Network error', true));
  }
  // Clicks and changes inside the cup's detail.
  function onClick(ev) {
    const b = ev.target.closest('[data-pact]');
    if (!b || !cup) return false;
    const a = b.dataset.pact;
    if (a === 'make') { act('/admin/arena/cups/slot/create', { key: b.dataset.key }, 'Tournament made.'); return true; }
    if (a === 'attach') { const s = $('pAtt_' + b.dataset.key); if (s) act('/admin/arena/cups/slot/attach', { key: b.dataset.key, tournamentId: s.value }, 'Tournament attached.'); return true; }
    if (a === 'detach') { if (window.confirm('Take this tournament out of the cup? It stays, out of the programme.')) act('/admin/arena/cups/slot/detach', { key: b.dataset.key }, 'Detached.'); return true; }
    if (a === 'goto') { if (deps.openTournament) deps.openTournament(b.dataset.id); return true; }
    collect();
    if (a === 'gen') {
      const dates = repeatDates(ed.from, ed.every, Math.max(1, Math.min(30, ed.count)));
      if (b.dataset.list === 'pSer') ed.series = dates; else ed.steps[0].dates = dates;
      if (ed.format === 'seriesFinal' && !ed.final.at) ed.final.at = dates[dates.length - 1] + 7 * DAY;
      // Steps after the first: enough tournaments for the qualifiers (10 a
      // table), a week after the step before, a day apart.
      if (ed.format === 'stages') {
        let last = dates[dates.length - 1], prev = dates.length;
        ed.steps.forEach((s, i) => {
          if (i === 0) return;
          const finalStep = i === ed.steps.length - 1;
          const k = finalStep ? 1 : Math.max(1, Math.ceil(prev * (ed.steps[i - 1].qualify || 3) / 10));
          last += 7 * DAY;
          s.dates = Array.from({ length: k }, (_, j) => last + j * DAY);
          last = s.dates[s.dates.length - 1]; prev = k;
        });
      }
      render(); return true;
    }
    if (a === 'adddate' || a === 'rmdate') {
      const list = b.dataset.list;
      const arr = list === 'pSer' ? ed.series : ed.steps[Number(list.slice(3))].dates;
      if (a === 'adddate') { const lastTs = arr.filter(Boolean).slice(-1)[0]; arr.push(lastTs ? lastTs + 7 * DAY : ed.from); }
      else arr.splice(Number(b.dataset.i), 1);
      render(); return true;
    }
    if (a === 'save') {
      act('/admin/arena/cups/plan', { plan: body() }, cup.planView ? 'Programme saved.' : 'Programme set.');
      return true;
    }
    return false;
  }
  function onChange(ev) {
    const id = ev.target && ev.target.id;
    if (!cup || !id) return false;
    if (id === 'pFormat' || id === 'pSteps') {
      collect();
      if (id === 'pSteps') {
        const n = Number(ev.target.value);
        while (ed.steps.length < n) ed.steps.splice(ed.steps.length - 1, 0, { dates: [], qualify: 3 });
        while (ed.steps.length > n) ed.steps.splice(ed.steps.length - 2, 1);
      }
      render(); return true;
    }
    if (ev.target.name === 'pReg' && $('pEntry')) { $('pEntry').hidden = ev.target.value !== 'cup'; return true; }
    return false;
  }
  return { blockHtml, mount, onClick, onChange };
}
