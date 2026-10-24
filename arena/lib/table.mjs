// ═══════════════════════════════════════════════════════════════════
// Tournament director — table settings (service 0.16.0, 2026-10-24).
//
// The settings the director opens a table with (PokerTH NetGameInfo), with
// the same lists and limits as the web client's « Create a table » form:
// both read public/modules/create-presets.mjs (styles, community templates,
// limits), so a change there reaches the organizer page by itself (served by
// GET /admin/arena/table-presets). The limits stay inside what the game
// server accepts (netpacketvalidator ValidateGameInfo), so a stored table
// that was set with older, wider limits is brought back inside them.
// ═══════════════════════════════════════════════════════════════════

import { LIMITS, STYLES, TEMPLATES, TEMPLATE_DELAY, DEFAULT_STYLE, createPresets } from '../../public/modules/create-presets.mjs';

const N = STYLES.find((s) => s.id === DEFAULT_STYLE) || STYLES[0];
// The web client's default style (Normal), plus the blinds order.
export const TABLE_DEFAULTS = Object.freeze({
  startMoney: N.stack, firstSmallBlind: N.blind, raiseMode: N.raiseMode === 2 ? 'minutes' : 'hands', raiseEvery: N.raiseEvery,
  endRaiseMode: 'double', endRaiseValue: 0, actionTimeout: N.timeout, delayBetweenHands: N.delay,
  manualBlinds: Object.freeze([]), preset: 'style:' + N.id,
});
const END_MODES = ['double', 'value', 'keep'];

// A preset as table settings: 'style:<id>' or 'template:<name>'.
export function presetTable(ref) {
  const m = /^(style|template):(.+)$/.exec(String(ref || ''));
  if (!m) return null;
  if (m[1] === 'style') {
    const s = STYLES.find((x) => x.id === m[2]);
    return s ? { startMoney: s.stack, firstSmallBlind: s.blind, raiseMode: s.raiseMode === 2 ? 'minutes' : 'hands', raiseEvery: s.raiseEvery,
      actionTimeout: s.timeout, delayBetweenHands: s.delay, manualBlinds: [], endRaiseMode: 'double', endRaiseValue: 0, preset: ref } : null;
  }
  const p = TEMPLATES.find((x) => x.name === m[2]);
  return p ? { startMoney: p.startCash, firstSmallBlind: p.firstSmallBlind, raiseMode: p.raiseOnHands ? 'hands' : 'minutes',
    raiseEvery: p.raiseOnHands ? p.raiseEveryHands : p.raiseEveryMinutes, actionTimeout: p.playerActionTimeout,
    delayBetweenHands: TEMPLATE_DELAY, manualBlinds: p.blinds.slice(), endRaiseMode: 'double', endRaiseValue: 0, preset: ref } : null;
}

const clampTo = (x, L) => Math.min(L.max, Math.max(L.min, x));
export function cleanTable(t, base) {
  const b = Object.assign({}, TABLE_DEFAULTS, base || {});
  t = t || {};
  const int = (v, L, d) => { const x = parseInt(v, 10); return Number.isInteger(x) && x >= L.min && x <= L.max ? x : clampTo(parseInt(d, 10) || L.min, L); };
  const o = {};
  o.startMoney = int(t.startMoney, LIMITS.stack, b.startMoney);
  const blindL = { min: LIMITS.blind.min, max: Math.max(LIMITS.blind.min, Math.min(LIMITS.blind.max, Math.floor(o.startMoney / 2))) };
  o.firstSmallBlind = int(t.firstSmallBlind, blindL, b.firstSmallBlind);
  o.raiseMode = ['hands', 'minutes'].indexOf(t.raiseMode) >= 0 ? t.raiseMode : (b.raiseMode === 'minutes' ? 'minutes' : 'hands');
  o.raiseEvery = int(t.raiseEvery, LIMITS.raiseEvery, b.raiseEvery);
  // Manual blinds order: ascending, no duplicates (as the form keeps it).
  const src = Array.isArray(t.manualBlinds) ? t.manualBlinds : (t.manualBlinds === undefined ? b.manualBlinds || [] : []);
  const mb = [...new Set(src.map((x) => parseInt(x, 10)).filter((x) => Number.isInteger(x) && x >= LIMITS.blindValue.min && x <= LIMITS.blindValue.max))]
    .sort((x, y) => x - y).slice(0, LIMITS.manualBlinds.max);
  o.manualBlinds = mb;
  // « Afterwards » only means something after a manual list (as on the form).
  const em = t.endRaiseMode !== undefined ? t.endRaiseMode : b.endRaiseMode;
  o.endRaiseMode = mb.length && END_MODES.indexOf(em) >= 0 ? em : 'double';
  o.endRaiseValue = o.endRaiseMode === 'value' ? int(t.endRaiseValue, LIMITS.endRaiseValue, b.endRaiseValue || o.firstSmallBlind * 2) : 0;
  o.actionTimeout = int(t.actionTimeout, LIMITS.timeout, b.actionTimeout);
  o.delayBetweenHands = int(t.delayBetweenHands, LIMITS.delay, b.delayBetweenHands);
  // The preset it came from (a label): kept only while the values still match it.
  const ref = t.preset !== undefined ? t.preset : b.preset;
  const p = presetTable(ref);
  o.preset = p && ['startMoney', 'firstSmallBlind', 'raiseMode', 'raiseEvery', 'actionTimeout', 'delayBetweenHands'].every((k) => p[k] === o[k]) && p.manualBlinds.join(',') === mb.join(',') ? ref : null;
  return o;
}

// Served to the organizer page: the web client's lists, plus the director's defaults.
export function tablePresets() {
  return Object.assign(createPresets(), { defaults: TABLE_DEFAULTS });
}
