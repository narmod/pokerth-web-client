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
//    or more(el) → 'chapter:section' (the BBC / We Cup preset → its own section);
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
  ['#fs-btn-lobby, [onclick*="toggleFullscreen"]', 'hsFullscreen'],
  ['[onclick*="confirmDisconnect"]', 'hsDisconnect'],
  ['#l-overflow-btn, #connect-overflow-btn, #cr-overflow-btn, #g-overflow-btn, #pv-overflow-btn', 'hsMenu'],
  ['#adv-opts-lobby-mob, #adv-opts-connect-mob, [onclick*="toggleAdvancedOptions"]', 'hsAdv', false, 'options:where'],
  ['[onclick*="liveCycleThemeMode"]', 'hsThemeMode', true, 'style:themes'],
  ['[onclick*="openThemePanel"]', 'hsThemeBtn', false, 'style:tablelook'],
  ['#music-toggle-lobby-mob, #music-toggle-connect-mob, [onclick*="toggleMusicPanel"]:not(.music-panel-close)', 'hsMusic', false, 'style:music'],
  // ── login screen ──
  ['#login-step1 .login-card', 'hsLoginCard', false, 'start:modes'],
  ['#av-trigger', 'hsAvatar', false, 'start:avatar'],
  ['#nick, #nick-label', 'hsNick', false, 'start:avatar'],
  ['#pass', 'hsPass', false, 'pthnet:account'],
  ['#forgot-pw-link', 'hsForgotPw', false, 'pthnet:account'],
  ['#conn-adv-btn', 'hsConnAdv', false, 'start:lan'],
  ['#guest-mode-row', 'hsGuestMode', false, 'pthnet:account'],
  ['#register-link-row a', 'hsRegister', false, 'pthnet:account'],
  ['.login-back', 'hsLoginBack'],
  ['#login-step2 .btn-primary[data-i18n="connect"]', 'hsConnect', false, 'start:modes'],
  ['[onclick*="openAboutPage"]', 'hsAbout'],
  ['#lang-menu button', 'hsLangPick', true, 'start:language'],
  ['#about-page .ab-tab', 'hsAbTab', false],
  ['#about-page .ab-back, #privacy-page [onclick*="closePrivacyPage"]', 'hsPageBack'],
  ['a[href*="github.com/narmod"]', 'hsSource'],
  ['[onclick*="openPrivacyPage"]', 'hsPrivacy'],
  ['.cf-social', 'hsSocial'],
  ['#s-connect details > summary', 'hsLinks'],
  // ── lobby ──
  ['#g-filter-select', 'hsFilter', false, 'lobby:list'],
  ['#g-list .btn-spectate, #lobby-foot-spec', 'hsSpectate', true, 'lobby:join'],
  ['#g-list .btn-join, #lobby-foot-join', 'hsJoin', true, 'lobby:join'],
  ['#g-list .gcard-caret', 'hsCaret', true, 'lobby:gameinfo'],
  ['#g-list .game-row', 'hsGameRow', true, 'lobby:list'],
  ['#g-list', 'hsGameList', false, 'lobby:list'],
  ['#h-players, .fbar-players', 'hsPlayersPill', false, 'chat:social'],
  ['.lgi-report', 'hsReport', true],
  ['#lobby-gameinfo .lgi-prow', 'hsLgiPlayer', true, 'chat:social'],
  ['.pl-act-inv', 'hsPlInvite', true, 'lobby:invites'],
  ['#players-search-in', 'hsPlayerSearch', false, 'chat:social'],
  ['#pl-sort-select', 'hsPlayerSort', false, 'chat:social'],
  ['.pl-colh-chip', 'hsPlCols', true],
  ['.pl-act-ban, #seat-ctx-menu [data-ctx-k="ignore"]', 'hsPlIgnore', true, 'chat:social'],
  ['.pl-act-stats', 'hsPlStats', true, 'pthnet:rankings'],
  ['.pl-act-pm', 'hsPlPm', true, 'chat:privatemsg'],
  ['.pl-name-link', 'hsPlName', true, 'chat:social'],
  ['#lobby-foot-name', 'hsMyProfile', false, 'start:avatar'],
  ['#chat-in', 'hsChatIn', false, 'chat:typing'],
  ['.chat-send, #pm-send', 'hsChatSend', false, 'chat:typing'],
  ['#l-chat-mute-toggle, #g-chat-mute-toggle', 'hsMute', false, 'chat:panels'],
  ['#l-chat-emoji-toggle, #g-chat-emoji-toggle', 'hsEmoji', false, 'chat:emotes'],
  ['[onclick*="clearChatPanel"]', 'hsClearChat', false, 'chat:panels'],
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
  ['#cf-preset-perso', 'hsPresetPerso', false, 'lobby:create'],     // before .cf-preset: it is one too (web.276)
  // the bot level pills (training): what each level does, Mixed draws them (web.291)
  ['.cf-preset[data-skill="easy"]', 'hsBotEasy', false, 'offline:setup'],
  ['.cf-preset[data-skill="mixed"]', 'hsBotMixed', false, 'offline:setup'],
  ['.cf-preset[data-skill="normal"]', 'hsBotNormal', false, 'offline:setup'],
  ['.cf-preset[data-skill="hard"]', 'hsBotHard', false, 'offline:setup'],
  ['.cf-preset[data-preset]', 'hsPreset', false, (el) => ({ bbc: 'pthnet:bbc', wecup: 'pthnet:wec' }[el.getAttribute('data-preset')] || 'pthnet:cups')],
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
  ['#cf-prefs-save-btn', 'hsSavePrefs', false, 'lobby:create'],     // before .btn-cf-reset: it has that class too (web.276)
  ['.btn-cf-reset', 'hsCfReset'],
  ['.cf-create-btn', 'hsCreateTable', false, 'lobby:create'],
  ['#s-create [onclick*="closeCreatePage"]', 'hsCreateBack'],
  // ── at the table (H3, web.269) ──
  ['#s-game [onclick*="confirmLeaveGame"]', 'hsQuit'],
  ['.g-brand-click', 'hsGameDetails', false, 'lobby:gameinfo'],
  ['#sound-toggle-btn, #adv-sound-btn', 'hsSound', false, 'style:sounds'],
  ['.sound-pop-mute', 'hsSoundMute', true, 'style:sounds'],
  ['.sound-pop-range.sp-music-range', 'hsMusicVol', true, 'style:music'],
  ['.sound-pop-range', 'hsSoundVol', true, 'style:sounds'],
  ['#gim-copy-link-btn', 'hsCopyLink', true, 'lobby:invites'],
  ['[onclick*="endGameLeave"]', 'hsEgLeave', true],
  ['[onclick*="endGameClose"]', 'hsEgClose', true],
  ['.endgame-card', 'hsEgCard', true, 'info:stats'],
  ['.stats-export-btn', 'hsStatsExport', true, 'info:journal'],
  ['.stats-range-btn', 'hsStatsRange', true, 'info:stats'],
  ['.stats-scope-btn', 'hsStatsScope', true, 'info:stats'],
  ['#jr-split', 'hsJrSplit', true, 'info:journal'],
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
  ['.km-close, .rk-close, .pim-close, .gim-close, .music-panel-close, #pm-close, #jr-close, #g-chat-close, #g-log-close, #accessibility-close, #avatar-popup [onclick="toggleAvatarPopup()"], #players-panel [onclick*="togglePlayersPanel"], #hands-overlay [onclick*="toggleHandsHelp"], #theme-panel .tp-close', 'hsClose', true],
  ['[onclick*="location.reload"]', 'hsReload'],
  ['#theme-panel .tp-del', 'hsStyleDelete', true, 'style:tablelook'],
  ['#theme-panel .tp-import', 'hsStyleImport', true, 'style:tablelook'],
  ['#theme-panel .tp-tab', 'hsThemeTab', true, 'style:tablelook'],
  ['#theme-panel .tp-row, #adv-theme-host .tp-row', 'hsThemeRow', true, 'style:tablelook'],
  ['#seat-ctx-menu [data-ctx-k="note"]', 'hsCtxNote', true, 'chat:social'],
  ['#seat-ctx-menu [data-ctx-k="report"]', 'hsCtxReport', true, 'pthnet:avatars'],
  ['#seat-ctx-menu [data-ctx-k="kickban"]', 'hsCtxKickban', true],
  ['#s-connect .card-chip', 'hsChip'],
  ['#adv-snd-custom-host button', 'hsSndPlay', true, 'style:sounds'],
  // ── Advanced options ──
  ['#adv-lang-btn, [onclick*="openLangMenu"]', 'hsLang', false, 'start:language'],
  ['#adv-search-in', 'hsAdvSearch', false, 'options:where'],
  ['[onclick*="resetAdvDefaults"]', 'hsAdvReset', false, 'options:where'],
  ['#adv-theme-host button', 'hsAdvThemeBtn', true, 'style:themes'],
  ['#adv-modal .adv-link-btn', 'hsAdvLink', true, 'options:where', (el) => ({ label: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) })],
  ['#adv-modal .kb-reset', 'hsKeyReset', false, 'options:fkeys'],
  ['#adv-modal .kb-btn', 'hsKeyBind', false, 'options:fkeys'],
  ['#adv-modal .adv-cat, #adv-modal .adv-subtab', 'hsAdvCat', false, 'options:where'],
  ['#adv-modal summary.adv-sec', 'hsAdvSec', false, 'options:where'],
  ['#adv-modal .adv-row select', 'hsAdvSelect', false, 'options:where', optionVars],
  ['#adv-modal .adv-row input[type="checkbox"], #adv-modal label.adv-row', 'hsAdvOption', false, 'options:sync', optionVars],
  ['#adv-modal .adv-row', 'hsAdvField', false, 'options:where', optionVars],
  // ── Ranking ──
  // each ranking explained on its own tab: who runs it, what counts, how the score works (web.289)
  ['#ranking-modal .rk-tab[data-src="pth"], #tableranking-modal .rk-tab[data-src="pth"]', 'hsRkPth', false, 'pthnet:rankhow'],
  ['#ranking-modal .rk-tab[data-src="bbc"], #tableranking-modal .rk-tab[data-src="bbc"]', 'hsRkBbc', false, 'pthnet:bbc'],
  // also a WeC game or result in the forum's Events tab (web.308): what the We Cup is, and its section
  ['#ranking-modal .rk-tab[data-src="wec"], #tableranking-modal .rk-tab[data-src="wec"], #fn-events .ev-row[data-src="wec"]', 'hsRkWec', false, 'pthnet:wec'],
  ['#ranking-modal .rk-tab[data-src="lan"], #tableranking-modal .rk-tab[data-src="lan"]', 'hsRkLan', false, 'start:famboard'],
  ['#ranking-modal .rk-tab[data-src="ach"]', 'hsRkAch', false, 'offline:trophies'],
  ['#ranking-modal .rk-tab, #tableranking-modal .rk-tab', 'hsRkTab', false, (el) => (/'bbc'/.test(el.getAttribute('onclick') || '') ? 'pthnet:bbc' : 'pthnet:rankings')],
  ['#rk-season', 'hsRkSeason', false, 'pthnet:ranked'],
  ['#rk-alltime', 'hsRkAllTime', false, 'pthnet:ranked'],
  ['#rk-search', 'hsRkSearch', false, 'pthnet:rankings'],
  ['#ranking-modal select, #tableranking-modal select', 'hsRkSort', true, 'start:famboard'],
  ['.rk-back', 'hsRkBack'],
  // ── Forum ──
  ['#fn-bbcreg', 'hsBbcReg', false, 'pthnet:bbc'],
  // the Posts list (web.289): a post, its forum tag, ↗, the read mark
  ['#fn-list .fn-golink', 'hsFnGo', true, 'pthnet:forumnews'],
  ['#fn-list .fn-forum', 'hsFnTag', true, 'pthnet:forumnews'],
  ['#fn-list .fn-dot', 'hsFnDot', true, 'pthnet:forumnews'],
  ['#fn-list .fn-row', 'hsFnRow', true, 'pthnet:forumnews'],
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
  ['#avatar-popup .avm-preset', 'hsAvPreset', true, 'start:avatar'],
  ['#avm-dice', 'hsAvDice', true, 'start:avatar'],
  ['#avm-photo', 'hsAvPhoto', true, 'start:avatar'],
  ['#avm-reset', 'hsAvReset', true, 'start:avatar'],
  ['#avm-step-prev, #avm-step-next', 'hsAvStep', true, 'start:avatar'],
  ['#avm-use', 'hsAvUse', true, 'start:avatar'],
  ['#avi-pick, #avi-drop', 'hsAvFile', true, 'start:avatar'],
  // ── Accessibility ──
  ['#accessibility-modal input[type="radio"]', 'hsA11ySize', true],
  ['#accessibility-high-contrast', 'hsA11yContrast', true],
  ['#accessibility-browser-zoom', 'hsA11yZoom', true],
  ['#accessibility-reset', 'hsA11yReset', true],
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
  ['.pim-cups-btn, #seat-ctx-menu [data-ctx-k="profile"]', 'hsPimStats', true, 'pthnet:rankings'],
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
  ['#players-panel', 'hsPlayersWin', 'chat:social'],
  ['#g-log-panel', 'hsInfoWin', 'info:open'],
  ['#tableranking-modal', 'hsRankingWin', 'pthnet:rankings'],
  ['#accessibility-modal', 'hsA11yWin', null],
  ['#about-page', 'hsAboutWin', null],
  ['#privacy-page', 'hsPrivacyWin', null],
  ['#game-info-modal', 'hsGameInfoWin', 'lobby:gameinfo'],
  ['#g-endgame-overlay', 'hsEgWin', 'info:stats'],
  ['#g-chat-panel', 'hsGameChatWin', 'chat:panels'],
  ['#g-reaction-panel', 'hsReactWin', 'chat:reactions'],
  ['#hands-overlay', 'hsHandsWin', 'rules:hands'],
];

const TAPPABLE = 'button, a[href], input, select, textarea, label, summary, [role="button"], [onclick]';

function entry(e, el) {
  let vars = null;
  try { vars = typeof e[4] === 'function' ? e[4](el) : null; } catch (x) { vars = null; }
  let more = e[3] || null;
  try { if (typeof more === 'function') more = more(el) || null; } catch (x) { more = null; }
  return { el, key: e[1], more, vars };
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
    const CTL = 'input, select, textarea';
    // label[for], else the control inside it, else the control of its row (creation page « Game name », …)
    const ctl = f ? lab.ownerDocument.getElementById(f) : (lab.querySelector(CTL) || (lab.parentElement && lab.parentElement.querySelector(CTL)));
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
  let el = null;
  try { el = target.closest(TAPPABLE); } catch (e) { el = null; }
  if (el) return el;
  // drawn by script with a click listener: it shows a hand cursor (web.272)
  try {
    for (let n = target, i = 0; n && n.nodeType === 1 && i < 4; n = n.parentElement, i++) {
      if (n.id === 'ace-dock' || n === n.ownerDocument.body) break;
      if (getComputedStyle(n).cursor === 'pointer') return n;
    }
  } catch (e) {}
  return null;
}

/** An unlisted control inside a window: { el, key, more } of that window, or null. */
export function windowFor(target) {
  const el = tappableFor(target);
  if (!el) return null;
  for (const [sel, key, more] of WINDOWS) {
    let w = null;
    try { w = el.closest(sel); } catch (e) { w = null; }
    if (w) return { el, key, more: more || null, vars: null, win: true };
  }
  return null;
}
