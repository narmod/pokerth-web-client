// ═══════════════════════════════════════════════════════════════════
// Arena — a cup's programme (service 0.23.0, 2026-10-24). Pure: no file,
// no clock; cups.mjs stores the programme and acts on it.
//
// The organizer says how the cup runs when he makes it:
//   series       N tournaments, points (best of N)
//   seriesFinal  N tournaments, then a final for the top K of the standings
//                (more than 10: a final on several tables)
//   stages       2 to 4 steps, the last one the final; the first Q of each
//                tournament go on (tournament n of a step feeds tournament
//                n mod k of the next one)
//   single       one tournament (one table or several)
// The dates come from a repetition the page works out in the organizer's own
// time (summer time included), then each one can be moved, added or taken
// off. The cup makes the tournaments itself (« auto ») or the organizer makes
// each one from a dated slot (« organizer »). Players register once for the
// cup (« cup ») or for each tournament (« tournament »); with steps and cup
// registration, a player is in every tournament of the first step (« all »)
// or in the one he picks (« choose »).
//
// A slot: { key, kind: series|step|final|single, step, n, at, qualify,
//           tournamentId, auto }. A slot whose tournament has started keeps
// its date; taking it off the programme is refused.
// ═══════════════════════════════════════════════════════════════════

export const PLAN_FORMATS = Object.freeze(['series', 'seriesFinal', 'stages', 'single']);
export const ONE_TABLE = 10;
export const SEVERAL_TABLES = 40;   // tournaments.mjs: 4 tables of 10
const MAX_SERIES = 30, MAX_PER_STEP = 12, MAX_SLOTS = 60;
const EVERY = ['day', 'week', '2weeks', 'month'];

const int = (v, min, max, d) => { const x = parseInt(v, 10); return Number.isInteger(x) ? Math.min(max, Math.max(min, x)) : d; };
const ts = (v) => { const x = Number(v); return Number.isFinite(x) && x > 946684800000 && x < 4102444800000 ? Math.round(x / 60000) * 60000 : null; };
const capOf = (tables) => (tables === 'several' ? SEVERAL_TABLES : ONE_TABLE);

/**
 * The programme as the organizer sent it, checked and put in order.
 * input: { format, create, registration, stageEntry, tables, rule,
 *          series: [ts], final: { at, top }, steps: [{ dates: [ts], qualify }],
 *          single: { at }, common: {…} }
 * old: the programme stored before (its slots keep their tournaments).
 * isStarted(tournamentId) → bool. Throws refuse(message).
 */
export function cleanPlan(input, old, isStarted, refuse) {
  input = input || {};
  const format = PLAN_FORMATS.indexOf(input.format) >= 0 ? input.format : refuse('pick how the cup runs');
  const create = input.create === 'organizer' ? 'organizer' : 'auto';
  const registration = input.registration === 'tournament' ? 'tournament' : 'cup';
  const stageEntry = input.stageEntry === 'choose' ? 'choose' : 'all';
  const tables = input.tables === 'several' ? 'several' : 'one';
  const rule = input.rule && EVERY.indexOf(input.rule.every) >= 0 ? { every: input.rule.every, count: int(input.rule.count, 1, MAX_SERIES, 1), from: ts(input.rule.from) } : null;
  const dates = (arr, what, max) => {
    if (!Array.isArray(arr) || !arr.length) refuse(what + ': at least one date');
    if (arr.length > max) refuse(what + ': at most ' + max + ' dates');
    const out = arr.map((x) => ts(x) || refuse(what + ': a date is not understood'));
    for (let i = 1; i < out.length; i++) if (out[i] <= out[i - 1]) refuse(what + ': the dates must follow one another');
    return out;
  };
  const slots = [];
  let top = 0;
  if (format === 'series' || format === 'seriesFinal') {
    dates(input.series, 'tournaments', MAX_SERIES).forEach((at, i) => slots.push({ key: '1-' + (i + 1), kind: 'series', step: 1, n: i + 1, at, qualify: 0 }));
  }
  if (format === 'seriesFinal') {
    const f = input.final || {};
    const at = ts(f.at) || refuse('the final: its date');
    if (at <= slots[slots.length - 1].at) refuse('the final comes after the last tournament');
    top = int(f.top, 2, SEVERAL_TABLES, 0);
    if (!top) refuse('the final: how many players of the standings (2 to ' + SEVERAL_TABLES + ')');
    slots.push({ key: 'final', kind: 'final', step: 2, n: 1, at, qualify: 0 });
  }
  if (format === 'stages') {
    const steps = Array.isArray(input.steps) ? input.steps : [];
    if (steps.length < 2 || steps.length > 4) refuse('steps: 2 to 4, the last one the final');
    let prevLast = 0;
    steps.forEach((s, i) => {
      const last = i === steps.length - 1;
      const ds = dates(s && s.dates, last ? 'the final' : 'step ' + (i + 1), last ? 1 : MAX_PER_STEP);
      if (ds[0] <= prevLast) refuse((last ? 'the final' : 'step ' + (i + 1)) + ' comes after the step before');
      prevLast = ds[ds.length - 1];
      const q = last ? 0 : int(s.qualify, 1, ONE_TABLE, 0);
      if (!last && !q) refuse('step ' + (i + 1) + ': how many go on (1 to ' + ONE_TABLE + ')');
      ds.forEach((at, j) => slots.push(last ? { key: 'final', kind: 'final', step: i + 1, n: 1, at, qualify: 0 } : { key: (i + 1) + '-' + (j + 1), kind: 'step', step: i + 1, n: j + 1, at, qualify: q }));
    });
    // Seats: what a tournament of the next step receives at most.
    const per = (k) => slots.filter((x) => x.step === k);
    for (let k = 1; k < steps.length; k++) {
      const from = per(k), to = per(k + 1);
      const incoming = from[0].qualify * Math.ceil(from.length / to.length);
      const toFinal = to[0].kind === 'final';
      const cap = toFinal ? SEVERAL_TABLES : capOf(tables);
      if (incoming > cap) refuse((toFinal ? 'the final' : 'a tournament of step ' + (k + 1)) + ' would receive ' + incoming + ' players: ' + cap + ' at most');
    }
  }
  if (format === 'single') {
    const at = ts(input.single && input.single.at) || refuse('the tournament: its date');
    slots.push({ key: 'single', kind: 'single', step: 1, n: 1, at, qualify: 0 });
  }
  if (slots.length > MAX_SLOTS) refuse('at most ' + MAX_SLOTS + ' tournaments in a cup');

  // What the organizer had before: tournaments stay with their slot.
  const before = new Map(((old && old.slots) || []).map((s) => [s.key, s]));
  for (const s of slots) {
    const o = before.get(s.key);
    s.tournamentId = o ? o.tournamentId || null : null;
    s.auto = o ? !!o.auto : false;
    if (o && o.tournamentId && isStarted(o.tournamentId) && o.at !== s.at) refuse('« ' + slotLabel(o) + ' » has started: its date stays');
    before.delete(s.key);
  }
  const gone = [...before.values()].filter((s) => s.tournamentId);
  for (const s of gone) if (isStarted(s.tournamentId)) refuse('« ' + slotLabel(s) + ' » has started: it stays in the programme');
  return {
    plan: { v: 1, format, create, registration, stageEntry, tables, rule, top, common: cleanCommon(input.common), slots },
    gone,
  };
}

// Settings every tournament of the cup is made with (tournaments.mjs cleans
// each of them again when it makes the tournament).
export function cleanCommon(c) {
  c = c || {};
  const sv = c.server && c.server.ref ? { ref: String(c.server.ref).slice(0, 80), name: String(c.server.name || '').slice(0, 80), host: String(c.server.host || '').slice(0, 253), port: Number(c.server.port) || null } : null;
  return {
    profile: ['friendly', 'club', 'official', 'custom'].indexOf(c.profile) >= 0 ? c.profile : 'club',
    settings: c.settings && typeof c.settings === 'object' ? c.settings : null,
    server: sv,
    table: c.table && typeof c.table === 'object' ? c.table : null,
    autoOpen: c.autoOpen !== false,
    openBefore: int(c.openBefore, 0, 120, 10),
    announce: c.announce !== false,
    chatLang: typeof c.chatLang === 'string' ? c.chatLang.slice(0, 12) : 'en',
    absence: c.absence && typeof c.absence === 'object' ? c.absence : null,
  };
}

export function slotLabel(s, cupName) {
  const pre = cupName ? cupName + ' ' : '';
  if (s.kind === 'single') return cupName || 'the tournament';
  if (s.kind === 'final') return pre + (cupName ? '– final' : 'the final');
  if (s.kind === 'series') return pre + '#' + s.n;
  return pre + (cupName ? '– ' : '') + 'step ' + s.step + ' #' + s.n;
}
// The tournament's name: the cup's name cut so the whole fits in 60.
export function slotName(cupName, s) {
  const tail = s.kind === 'single' ? '' : s.kind === 'final' ? ' – final' : s.kind === 'series' ? ' #' + s.n : ' – step ' + s.step + ' #' + s.n;
  return String(cupName).slice(0, 60 - tail.length).trim() + tail;
}
// The slots a player registered for the cup is put into.
export function entrySlots(plan) {
  if (!plan) return [];
  return plan.slots.filter((s) => s.kind === 'series' || s.kind === 'single' || (s.kind === 'step' && s.step === 1));
}
// How many players the cup takes when they register for the cup itself.
export function cupCapacity(plan) {
  const cap = capOf(plan.tables);
  if (plan.format === 'stages' && plan.stageEntry === 'choose') return entrySlots(plan).length * cap;
  return cap;
}
// Several tables: always when the organizer said so; a final that receives
// more than 10 players too.
export function slotFormat(plan, s) {
  if (plan.tables === 'several') return 'multi';
  if (s.kind === 'final') {
    if (plan.format === 'seriesFinal') return plan.top > ONE_TABLE ? 'multi' : 'sitngo';
    if (plan.format === 'stages') {
      const prev = plan.slots.filter((x) => x.step === s.step - 1);
      return prev.length && prev[0].qualify * prev.length > ONE_TABLE ? 'multi' : 'sitngo';
    }
  }
  return 'sitngo';
}

/**
 * What tournaments.mjs gets to make the tournament of a slot.
 * cup: { name, visibility, image }
 */
export function tournamentInput(cup, plan, s) {
  const c = plan.common || {};
  const entry = entrySlots(plan).indexOf(s) >= 0;
  return {
    name: slotName(cup.name, s), profile: c.profile, settings: c.settings || undefined,
    // A private cup: its tournaments are reached by their link only.
    visibility: cup.visibility === 'private' ? 'unlisted' : cup.visibility,
    format: slotFormat(plan, s), server: c.server, table: c.table || undefined, image: cup.image || null, startsAt: s.at,
    run: { autoOpen: !!c.autoOpen, openBefore: c.openBefore, announce: c.announce, chatLang: c.chatLang, absence: c.absence || undefined,
      selfRegister: entry && plan.registration === 'tournament' },
  };
}

/**
 * The cup's events (cups.mjs) from the slots that have a tournament: points,
 * stages (who feeds whom), the final. old: the events before (what has gone
 * on already stays).
 */
export function eventsOf(plan, oldEvents) {
  const has = plan.slots.filter((s) => s.tournamentId);
  const idx = new Map(has.map((s, i) => [s.key, i]));
  const prevAdvanced = new Map((oldEvents || []).filter((e) => e.advanced).map((e) => [e.tournamentId, e.advanced]));
  return has.map((s) => {
    const e = { tournamentId: s.tournamentId, label: slotLabel(s), slot: s.key, counts: true, qualify: 0, next: null, final: false, fromStandings: 0 };
    if (s.kind === 'final') { e.final = true; e.counts = false; if (plan.format === 'seriesFinal') e.fromStandings = plan.top; }
    if (s.kind === 'single') e.final = true;
    if (s.kind === 'step') {
      e.qualify = s.qualify;
      const nextStep = plan.slots.filter((x) => x.step === s.step + 1);
      const target = nextStep[(s.n - 1) % nextStep.length];
      if (target && idx.has(target.key)) e.next = idx.get(target.key);
    }
    if (prevAdvanced.has(s.tournamentId)) e.advanced = prevAdvanced.get(s.tournamentId);
    return e;
  });
}
