// ═══════════════════════════════════════════════════════════════════
// Ace's Help — the « ? » mode map (C6, L6, web.264; H2, web.268).
//
// In « ? » mode a tap on an element does not act: the Ace says what it does
// (key of modules/guide/lang/<code>.mjs); a second tap on the same element
// lets it through. Entry = [selector, text key, dynamic?, more?, vars?]:
//  · the FIRST entry whose selector matches the tapped element or one of its
//    ancestors wins, so the specific ones (a Join button) come before the
//    generic ones (its game row);
//  · dynamic = drawn by script (game rows, windows built on demand…): not in
//    the static page, scripts/test-guide-ask.mjs skips it when checking;
//  · more = 'chapter:section' of the help (modules/help/content): the Ace
//    offers « More about it », which opens that section in his bubble (H2);
//  · vars(el) = the text's {placeholders} (an option's own label).
// A label pointing at a control (label[for]) is explained as that control.
// WINDOWS: what an unlisted control inside a window is about (H2).
// ═══════════════════════════════════════════════════════════════════

/** The label of an option row (Advanced options): its own first text. */
function rowLabel(el) {
  const row = el.closest('.adv-row, .adv-keyrow');
  if (!row) return '';
  const s = row.querySelector(':scope > span, :scope > label > span, span[data-i18n]');
  return ((s && s.textContent) || row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
}
const optionVars = (el) => ({ label: rowLabel(el) });

export const HOTSPOTS = [
  // ── the Ace himself / his own entries ──
  ['.guide-menu-btn, .guide-login-btn', 'hsGuide', false, 'start:acehelp'],
  // ── headers (every screen) ──
  ['#forum-btn-lobby, #forum-btn-connect, #forum-btn-create, #forum-btn-game', 'hsForum', false, 'pthnet:forumnews'],
  ['#ranking-btn-lobby, #ranking-btn-connect, #ranking-btn-create, #ranking-btn-game', 'hsRanking', false, 'pthnet:rankings'],
  ['#pm-btn-lobby', 'hsPm', false, 'chat:privatemsg'],
  ['#lobby-chat-btn', 'hsChatBtn', false, 'chat:panels'],
  ['.accessibility-entry', 'hsAccess'],
  ['#install-btn', 'hsInstall', false, 'start:pwa'],
  ['#fs-btn-lobby', 'hsFullscreen'],
  ['#s-lobby .header [onclick*="confirmDisconnect"]', 'hsDisconnect'],
  ['#l-overflow-btn, #connect-overflow-btn, #cr-overflow-btn, #g-overflow-btn', 'hsMenu'],
  ['.help-menu-btn', 'hsHelp'],
  ['#adv-opts-lobby-mob, #adv-opts-connect-mob', 'hsAdv', false, 'options:where'],
  ['#music-toggle-lobby-mob, #music-toggle-connect-mob', 'hsMusic', false, 'style:music'],
  // ── login screen ──
  ['#login-step1 .login-card', 'hsLoginCard', false, 'start:modes'],
  ['#av-trigger', 'hsAvatar', false, 'start:avatar'],
  ['#nick', 'hsNick', false, 'start:avatar'],
  ['#guest-mode-row', 'hsGuestMode', false, 'pthnet:account'],
  ['#register-link-row a', 'hsRegister', false, 'pthnet:account'],
  ['.login-back', 'hsLoginBack'],
  ['#login-step2 .btn-primary[data-i18n="connect"]', 'hsConnect', false, 'start:modes'],
  ['#s-connect [onclick*="openAbou"]', 'hsAbout'],
  ['[onclick*="openPrivacyPage"]', 'hsPrivacy'],
  ['.cf-social', 'hsSocial'],
  ['#s-connect details > summary', 'hsLinks'],
  // ── lobby ──
  ['#g-filter-select', 'hsFilter', false, 'lobby:list'],
  ['#g-list .btn-spectate, #lobby-foot-spec', 'hsSpectate', true, 'lobby:join'],
  ['#g-list .btn-join, #lobby-foot-join', 'hsJoin', true, 'lobby:join'],
  ['#g-list .gcard-caret', 'hsCaret', true, 'lobby:gameinfo'],
  ['#g-list .game-row', 'hsGameRow', true, 'lobby:list'],
  ['#h-players', 'hsPlayersPill', false, 'chat:social'],
  ['#players-search-in', 'hsPlayerSearch', false, 'chat:social'],
  ['#pl-sort-select', 'hsPlayerSort', false, 'chat:social'],
  ['.pl-colh-chip', 'hsPlCols', true],
  ['.pl-act-ban', 'hsPlIgnore', true, 'chat:social'],
  ['.pl-act-stats', 'hsPlStats', true, 'pthnet:rankings'],
  ['.pl-act-pm', 'hsPlPm', true, 'chat:privatemsg'],
  ['.pl-name-link', 'hsPlName', true, 'chat:social'],
  ['#lobby-foot-name', 'hsMyProfile', false, 'start:avatar'],
  ['#chat-in', 'hsChatIn', false, 'chat:typing'],
  ['.chat-send, #pm-send', 'hsChatSend', false, 'chat:typing'],
  ['#l-chat-mute-toggle, #g-chat-mute-toggle', 'hsMute', false, 'chat:panels'],
  ['#l-chat-emoji-toggle, #g-chat-emoji-toggle', 'hsEmoji', false, 'chat:emotes'],
  ['[onclick*="clearChatPanel(\'lobby\')"]', 'hsClearChat', false, 'chat:panels'],
  ['#lsb-clock', 'hsClock'],
  ['.lobby-statsbar a', 'hsPthLink'],
  ['.lfb-create, #create-toggle-btn', 'hsCreate', false, 'lobby:create'],
  // ── waiting room ──
  ['#lobby-wait-actions .wp-btn-start', 'hsStart', true, 'lobby:create'],
  ['#lobby-wait-actions .wp-btn-invite', 'hsInvite', true, 'lobby:invites'],
  ['#lobby-wait-actions .wp-btn-leave', 'hsLeaveTable', true],
  ['#lobby-wait-actions .wp-fillbots', 'hsFillBots', true, 'offline:setup'],
  // ── game creation page ──
  ['#cf-gtype-btn, #cf-game-type', 'hsGameType', false, 'pthnet:ranked'],
  ['.cf-preset[data-preset]', 'hsPreset', false, 'pthnet:cups'],
  ['#cf-preset-perso', 'hsPresetPerso', false, 'lobby:create'],
  ['#cf-style-toggle', 'hsCfStyle', false, 'lobby:create'],
  ['#cf-name', 'hsGameName', false, 'lobby:create'],
  ['#cf-players', 'hsSeats', false, 'lobby:create'],
  ['#cf-stack', 'hsStack', false, 'lobby:create'],
  ['#cf-blind', 'hsBlind', false, 'rules:blinds'],
  ['#cf-rm1, #cf-rm2, #cf-raise-every', 'hsRaiseEvery', false, 'rules:blinds'],
  ['#cf-mb0, #cf-mb1', 'hsRaiseMode', false, 'rules:blinds'],
  ['#cf-timeout', 'hsTimeout', false, 'lobby:create'],
  ['#cf-delay', 'hsDelay', false, 'lobby:create'],
  ['#cf-use-password', 'hsPassword', false, 'lobby:create'],
  ['#cf-allow-spectators', 'hsSpectators', false, 'lobby:join'],
  ['.cf-step-btn', 'hsStep'],
  ['.cf-switch', 'hsCfSwitch'],
  ['.btn-cf-reset', 'hsCfReset'],
  ['#cf-prefs-save-btn', 'hsSavePrefs', false, 'lobby:create'],
  ['.cf-create-btn', 'hsCreateTable', false, 'lobby:create'],
  ['#s-create [onclick*="closeCreatePage"]', 'hsCreateBack'],
  // ── at the table (H3, web.269) ──
  ['#s-game [onclick*="confirmLeaveGame"]', 'hsQuit'],
  ['.g-brand-click', 'hsGameDetails', false, 'lobby:gameinfo'],
  ['#sound-toggle-btn', 'hsSound', false, 'style:sounds'],
  ['#tableranking-btn-game', 'hsTableRank', false, 'pthnet:rankings'],
  ['.blinds-next, #g-blinds-slot', 'hsBlindsNext', true, 'rules:blinds'],
  ['#chat-toggle-btn', 'hsGameChatBtn', false, 'chat:panels'],
  ['#react-toggle-btn, #adaptive-reactions-toggle', 'hsReactBtn', false, 'chat:reactions'],
  ['#hands-toggle-btn, #adaptive-hands-toggle', 'hsHandsBtn', false, 'rules:hands'],
  ['#log-toggle-btn', 'hsLogBtn', false, 'info:open'],
  ['#g-zoom-toggle, .zoom-btn', 'hsZoom', false, 'game:zoom'],
  ['.btn-action.btn-fold', 'hsFold', true, 'rules:actions'],
  ['.btn-action.btn-check', 'hsCheck', true, 'rules:actions'],
  ['.btn-action.btn-raise', 'hsRaiseBtn', true, 'game:betctl'],
  ['.btn-action.btn-allin', 'hsAllIn', true, 'rules:actions'],
  ['#raise-amt', 'hsRaiseAmt', true, 'game:betctl'],
  ['#raise-slider', 'hsRaiseSlider', true, 'game:betctl'],
  ['.btn-pct', 'hsPct', true, 'game:betctl'],
  ['#mode-sel', 'hsAutoMode', true, 'game:automodes'],
  ['#g-chat-in', 'hsGameChatIn', false, 'chat:typing'],
  ['#react-mute-toggle', 'hsReactMute', false, 'chat:reactions'],
  ['#g-reaction-panel button', 'hsReactPick', true, 'chat:reactions'],
  ['#gip-tab-log', 'hsGipLog', false, 'info:log'],
  ['#gip-tab-odds', 'hsGipOdds', false, 'info:odds'],
  ['#gip-tab-stats', 'hsGipStats', false, 'info:stats'],
  ['#gip-export', 'hsGipExport', false, 'info:log'],
  ['#gip-assist', 'hsGipAssist', false, 'info:assist'],
  ['.seat.me', 'hsSeatMe', true, 'game:protections'],
  ['.seat', 'hsSeat', true, 'game:readtable'],
  ['#g-comm', 'hsBoard', false, 'rules:streets'],
  ['#pot-strip', 'hsPot', false, 'rules:showdown'],
  // ── every window: its close button ──
  ['.km-close, .rk-close, .pim-close, .music-panel-close, #pm-close, #jr-close, #g-chat-close, #g-log-close, #avatar-popup [onclick="toggleAvatarPopup()"]', 'hsClose', true],
  // ── Advanced options ──
  ['#adv-lang-btn', 'hsLang', false, 'start:language'],
  ['#adv-modal .kb-reset', 'hsKeyReset', false, 'options:fkeys'],
  ['#adv-modal .kb-btn', 'hsKeyBind', false, 'options:fkeys'],
  ['#adv-modal .adv-cat, #adv-modal .adv-subtab', 'hsAdvCat', false, 'options:where'],
  ['#adv-modal summary.adv-sec', 'hsAdvSec', false, 'options:where'],
  ['#adv-modal .adv-row select', 'hsAdvSelect', false, 'options:where', optionVars],
  ['#adv-modal .adv-row input[type="checkbox"], #adv-modal label.adv-row', 'hsAdvOption', false, 'options:sync', optionVars],
  ['#adv-modal .adv-row', 'hsAdvField', false, 'options:where', optionVars],
  // ── Ranking ──
  ['#ranking-modal .rk-tab', 'hsRkTab', false, 'pthnet:rankings'],
  ['#rk-season', 'hsRkSeason', false, 'pthnet:ranked'],
  ['#rk-alltime', 'hsRkAllTime', false, 'pthnet:ranked'],
  ['#rk-search', 'hsRkSearch', false, 'pthnet:rankings'],
  ['#ranking-modal select', 'hsRkSort', true, 'start:famboard'],
  ['.rk-back', 'hsRkBack'],
  // ── Forum ──
  ['#fn-bbcreg', 'hsBbcReg', false, 'pthnet:cups'],
  ['#fn-markread', 'hsFnRead', false, 'pthnet:forumnews'],
  ['#fn-open', 'hsFnOpen', false, 'pthnet:forumnews'],
  ['#fnp-translate', 'hsFnTranslate', false, 'pthnet:forumnews'],
  ['#fnp-openext', 'hsFnOpenPost', false, 'pthnet:forumnews'],
  ['#forum-modal .rk-tab', 'hsFnTab', false, 'pthnet:forumcups'],
  // ── Avatar studio ──
  ['#avatar-popup .avp-tab', 'hsAvTab', false, 'start:avatar'],
  ['#avatar-popup .avp-cat', 'hsAvCat', false, 'start:avatar'],
  ['#avp-btn-pth', 'hsAvPth', false, 'pthnet:avatars'],
  ['#avatar-popup .avp-none', 'hsAvNone', false, 'pthnet:avatars'],
  ['#avatar-popup .avp-btn', 'hsAvPick', false, 'pthnet:avatars'],
  // ── Private messages ──
  ['#pm-del', 'hsPmDel', false, 'chat:privatemsg'],
  ['#pm-in', 'hsPmIn', false, 'chat:privatemsg'],
  // ── Logs ──
  ['#jr-game', 'hsJrGame', true, 'info:journal'],
  ['#jr-search', 'hsJrSearch', true, 'info:journal'],
  ['#jr-exp-html, #jr-exp-txt, #jr-saveas', 'hsJrExport', true, 'info:journal'],
  ['#jr-import', 'hsJrImport', true, 'info:journal'],
  ['#jr-select', 'hsJrSelect', true, 'info:journal'],
  ['#jr-del, #jr-delall', 'hsJrDel', true, 'info:journal'],
  ['#jr-analyze', 'hsJrAnalyze', true, 'info:journal'],
  ['#jr-upload', 'hsJrUpload', true, 'info:journal'],
  ['#jr-keep, #jr-max', 'hsJrKeep', true, 'info:logopts'],
  // ── A player's card ──
  ['#pim-avatar', 'hsPimAvatar', false, 'start:avatar'],
  ['.pim-cups-btn', 'hsPimStats', true, 'pthnet:rankings'],
  // ── Music player ──
  ['.music-shade-btn', 'hsMusicShade', true, 'style:music'],
];

/**
 * What an unlisted control inside a window is about: [window, text key, more].
 * Only for something one can tap (plain text in a window is not stopped).
 */
export const WINDOWS = [
  ['#adv-modal', 'hsAdvWin', 'options:where'],
  ['#theme-panel', 'hsThemeWin', 'style:tablelook'],
  ['#music-panel', 'hsMusicWin', 'style:music'],
  ['#ranking-modal', 'hsRankingWin', 'pthnet:rankings'],
  ['#forum-modal', 'hsForumWin', 'pthnet:forumnews'],
  ['#avatar-popup', 'hsAvatarWin', 'start:avatar'],
  ['#pm-modal', 'hsPmWin', 'chat:privatemsg'],
  ['#jr-modal', 'hsLogsWin', 'info:journal'],
  ['#player-info-modal', 'hsPlayerWin', 'chat:social'],
  ['#help-modal', 'hsHelpWin', 'start:acehelp'],
  ['#players-panel', 'hsPlayersWin', 'chat:social'],
  ['#g-log-panel', 'hsInfoWin', 'info:open'],
  ['#tableranking-modal', 'hsRankingWin', 'pthnet:rankings'],
  ['#g-chat-panel', 'hsGameChatWin', 'chat:panels'],
  ['#g-reaction-panel', 'hsReactWin', 'chat:reactions'],
  ['#hands-overlay', 'hsHandsWin', 'rules:hands'],
];

const TAPPABLE = 'button, a[href], input, select, textarea, label, summary, [role="button"], [onclick]';

function entry(e, el) {
  let vars = null;
  try { vars = typeof e[4] === 'function' ? e[4](el) : null; } catch (x) { vars = null; }
  return { el, key: e[1], more: e[3] || null, vars };
}

function firstMatch(target) {
  for (const e of HOTSPOTS) {
    let el = null;
    try { el = target.closest(e[0]); } catch (x) { el = null; }
    if (el) return entry(e, el);
  }
  return null;
}

/** The hotspot of a tapped element: { el, key, more, vars } (el = the matched element), or null. */
export function hotspotFor(target) {
  if (!target || typeof target.closest !== 'function') return null;
  try { if (target.closest('#ace-dock')) return null; } catch (x) { return null; }
  // a label (its text, a switch's track) is explained as its control: label[for], or the control inside it
  let lab = null;
  try { lab = target.closest('label'); } catch (x) { lab = null; }
  if (lab && lab.ownerDocument) {
    const f = lab.getAttribute('for');
    const ctl = f ? lab.ownerDocument.getElementById(f) : lab.querySelector('input, select, textarea');
    if (ctl && ctl !== target) {
      const h = firstMatch(ctl);
      if (h) return Object.assign(h, { el: lab });
    }
  }
  return firstMatch(target);
}

/** Something one can tap, without an entry in the map (explained generically). */
export function tappableFor(target) {
  if (!target || typeof target.closest !== 'function') return null;
  try { return target.closest(TAPPABLE); } catch (e) { return null; }
}

/** An unlisted control inside a window: { el, key, more } of that window, or null. */
export function windowFor(target) {
  const el = tappableFor(target);
  if (!el) return null;
  for (const [sel, key, more] of WINDOWS) {
    let w = null;
    try { w = el.closest(sel); } catch (e) { w = null; }
    if (w) return { el, key, more: more || null, vars: null };
  }
  return null;
}
