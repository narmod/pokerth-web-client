// ═══════════════════════════════════════════════════════════════════
// Ace's Help — the « ? » mode map (C6, L6, web.264).
//
// In « ? » mode a tap on an element does not act: the Ace says what it does
// (key of modules/guide/lang/<code>.mjs); a second tap on the same element
// lets it through. [selector, text key, dynamic?] — the FIRST entry whose
// selector matches the tapped element or one of its ancestors wins, so the
// specific ones (a Join button) come before the generic ones (its game row).
// `dynamic` = drawn by script (game rows, waiting-room buttons…): not in the
// static page, scripts/test-guide-ask.mjs skips it when checking selectors.
// ═══════════════════════════════════════════════════════════════════

export const HOTSPOTS = [
  // ── the Ace himself / his own entries ──
  ['.guide-menu-btn, .guide-login-btn', 'hsGuide'],
  // ── headers (every screen) ──
  ['#forum-btn-lobby, #forum-btn-connect', 'hsForum'],
  ['#ranking-btn-lobby, #ranking-btn-connect', 'hsRanking'],
  ['#pm-btn-lobby', 'hsPm'],
  ['#lobby-chat-btn', 'hsChatBtn'],
  ['.accessibility-entry', 'hsAccess'],
  ['#install-btn', 'hsInstall'],
  ['#fs-btn-lobby', 'hsFullscreen'],
  ['#s-lobby .header [onclick*="confirmDisconnect"]', 'hsDisconnect'],
  ['#l-overflow-btn, #connect-overflow-btn, #cr-overflow-btn', 'hsMenu'],
  ['.help-menu-btn', 'hsHelp'],
  ['#adv-opts-lobby-mob, #adv-opts-connect-mob', 'hsAdv'],
  ['#music-toggle-lobby-mob, #music-toggle-connect-mob', 'hsMusic'],
  // ── login screen ──
  ['#login-step1 .login-card', 'hsLoginCard'],
  ['#av-trigger', 'hsAvatar'],
  ['#nick', 'hsNick'],
  ['#guest-mode-row', 'hsGuestMode'],
  ['#register-link-row a', 'hsRegister'],
  ['.login-back', 'hsLoginBack'],
  ['#login-step2 .btn-primary[data-i18n="connect"]', 'hsConnect'],
  // ── lobby ──
  ['#g-filter-select', 'hsFilter'],
  ['#g-list .btn-spectate, #lobby-foot-spec', 'hsSpectate', true],
  ['#g-list .btn-join, #lobby-foot-join', 'hsJoin', true],
  ['#g-list .gcard-caret', 'hsCaret', true],
  ['#g-list .game-row', 'hsGameRow', true],
  ['#h-players', 'hsPlayersPill'],
  ['#players-search-in', 'hsPlayerSearch'],
  ['#pl-sort-select', 'hsPlayerSort'],
  ['#chat-in', 'hsChatIn'],
  ['#l-chat-mute-toggle', 'hsMute'],
  ['#l-chat-emoji-toggle', 'hsEmoji'],
  ['[onclick*="clearChatPanel(\'lobby\')"]', 'hsClearChat'],
  ['#lsb-clock', 'hsClock'],
  ['.lobby-statsbar a', 'hsPthLink'],
  ['.lfb-create, #create-toggle-btn', 'hsCreate'],
  // ── waiting room ──
  ['#lobby-wait-actions .wp-btn-start', 'hsStart', true],
  ['#lobby-wait-actions .wp-btn-invite', 'hsInvite', true],
  ['#lobby-wait-actions .wp-btn-leave', 'hsLeaveTable', true],
  ['#lobby-wait-actions .wp-fillbots', 'hsFillBots', true],
  // ── game creation page ──
  ['#cf-gtype-btn', 'hsGameType'],
  ['.cf-preset[data-preset]', 'hsPreset'],
  ['#cf-preset-perso', 'hsPresetPerso'],
  ['#cf-name', 'hsGameName'],
  ['#cf-players', 'hsSeats'],
  ['#cf-use-password', 'hsPassword'],
  ['#cf-prefs-save-btn', 'hsSavePrefs'],
  ['.cf-create-btn', 'hsCreateTable'],
];

/** The hotspot of a tapped element: { el, key } (el = the matched element), or null. */
export function hotspotFor(target) {
  if (!target || typeof target.closest !== 'function') return null;
  for (const [sel, key] of HOTSPOTS) {
    let el = null;
    try { el = target.closest(sel); } catch (e) { el = null; }
    if (el) return { el, key };
  }
  return null;
}

/** Something one can tap, without an entry in the map (explained generically). */
export function tappableFor(target) {
  if (!target || typeof target.closest !== 'function') return null;
  try { return target.closest('button, a[href], input, select, textarea, label, summary, [role="button"], [onclick]'); } catch (e) { return null; }
}
