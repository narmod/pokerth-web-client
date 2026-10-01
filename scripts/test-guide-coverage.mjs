#!/usr/bin/env node
// Ace's Help « ? » coverage (web.272): a real browser (desktop + phone) walks
// through every screen and state — login (3 modes), menus, language menu,
// accessibility, About, privacy, lobby (row, chat, players), Advanced options
// (every category, every section open), theme, music, ranking (every tab),
// forum, avatar studio (3 tabs), private messages, logs, a player's card,
// game creation (all styles), the waiting room, the table (others' turn, my
// turn, header menu, game details, sound, table ranking, chat, reactions,
// hands, info panel tabs, a seat's menu, the end of the game) — and lists
// every visible, tappable, top-most element that « ? » cannot explain.
// Fails if any is left with no answer at all (a window's own text counts).
// Run: node scripts/test-guide-coverage.mjs [report.txt]
import fs from 'fs';
import { chromium, devices } from 'playwright';
import { startServer, openTable, enterTable, turnTo, ME } from './lib/mobile-harness.mjs';
const OUT = process.argv[2] || '';
const { server, base } = await startServer();
const browser = await chromium.launch();
const all = {};
const DUMP = async (page, state) => page.evaluate(async (state) => {
  const H = await import('/modules/guide/hotspots.mjs');
  const res = [];
  const sel = 'button,a[href],input,select,textarea,summary,label,[role=button],[role=tab],[role=link],[onclick],.seat,[tabindex="0"]';
  const seen = new Set();
  const cands = Array.from(document.querySelectorAll(sel));
  // drawn by script with a click listener: a hand cursor, not inside a control already listed
  document.querySelectorAll('body *').forEach((e) => { try { if (!e.closest(sel) && getComputedStyle(e).cursor === 'pointer' && !(e.parentElement && getComputedStyle(e.parentElement).cursor === 'pointer')) cands.push(e); } catch (x) {} });
  cands.forEach((e) => {
    if (e.closest('#ace-dock') || seen.has(e)) return;
    const r = e.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return;
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' || +cs.opacity === 0) return;
    const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 2), y = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 2);
    const top = document.elementFromPoint(x, y);
    if (!top || !(top === e || e.contains(top))) return;
    seen.add(e);
    const hs = H.hotspotFor(top) || H.hotspotFor(e);
    const w = hs ? null : H.windowFor(top);
    const kind = hs ? 'ok' : w ? 'win:' + w.key : 'none';
    if (kind === 'ok') return;
    const cls = typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter((c) => !/^(active|selected|on|is-|open|armed|sel|gip-on|win-open)/.test(c)).slice(0, 3).join('.') : '';
    const anc = []; for (let n = e.parentElement; n && anc.length < 3; n = n.parentElement) if (n.id) anc.push('#' + n.id);
    res.push({ state, kind, sig: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (cls ? '.' + cls : '') + (e.type && e.tagName === 'INPUT' ? '[' + e.type + ']' : ''), anc: anc.join(' < '),
      txt: (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || e.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 50),
      i18n: e.getAttribute('data-i18n') || e.getAttribute('data-i18n-title') || (e.querySelector && e.querySelector('[data-i18n]') ? e.querySelector('[data-i18n]').getAttribute('data-i18n') : '') || '',
      on: (e.getAttribute('onclick') || '').slice(0, 70) });
  });
  return res;
}, state);
const ev = async (page, fn, arg) => { try { await page.evaluate(fn, arg); } catch (e) { console.log('  ! ' + String(e.message).split('\n')[0]); } await page.waitForTimeout(700); };
const close = (page) => page.evaluate(() => { for (const f of ['closeAdvancedOptions', 'closeRankingModal', 'closeForumModal', 'closePlayerInfoPopup', 'closeGameInfoPopup', 'closeTableRanking', 'closePrivacyPage', 'closeAboutPage', '_closeJournal', 'closeSeatMenu']) { try { window[f] && window[f](); } catch (e) {} }
  ['#avatar-popup', '#music-panel', '#theme-panel', '#pm-modal', '#hands-overlay', '#g-reaction-panel', '#acc-panel'].forEach((s) => { const el = document.querySelector(s); if (el && getComputedStyle(el).display !== 'none') { try { if (s === '#avatar-popup') window.toggleAvatarPopup(); else if (s === '#music-panel') window.toggleMusicPanel(); else if (s === '#pm-modal') window.togglePmModal(); else el.style.display = 'none'; } catch (e) {} } });
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
async function run(name, desc) {
  const ctx = await browser.newContext({ ...desc, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('pth_guide_on', '0'); localStorage.setItem('pth_guide_offered', '1'); localStorage.setItem('pth_bak_dismiss', String(Date.now())); } catch (_e) {} });
  const page = await ctx.newPage(); page.on('pageerror', (e) => console.log('ERR', e.message));
  const snap = async (state) => { for (const r of await DUMP(page, name + ':' + state)) { const k = r.kind + ' | ' + r.sig; (all[k] = all[k] || { ...r, n: 0, states: new Set() }).n++; all[k].states.add(state); } };
  await openTable(page, base, { stopAt: 'login' }); await page.waitForTimeout(800);
  try { const b = page.locator('#bak-restore-banner button').last(); if (await b.count()) await b.click({ timeout: 1500 }); } catch (e) {}
  await snap('login1');
  for (const ov of ['toggleConnectOverflow']) { await ev(page, (f) => window[f](new MouseEvent('click')), ov); await snap('login1+menu'); await close(page); }
  await ev(page, () => window.openLangMenu && window.openLangMenu(new MouseEvent('click'))); await snap('langmenu'); await close(page);
  await ev(page, () => window.openAccessibility && window.openAccessibility()); await snap('accessibility'); await close(page);
  await ev(page, () => window.openAboutPage && window.openAboutPage()); await snap('about'); await close(page);
  await ev(page, () => window.openPrivacyPage && window.openPrivacyPage()); await snap('privacy');
  await ev(page, () => window.togglePrivacyOverflow && window.togglePrivacyOverflow(new MouseEvent('click'))); await snap('privacy+menu'); await close(page);
  for (let i = 0; i < 3; i++) { await openTable(page, base, { stopAt: 'login' }); await page.waitForTimeout(500); await page.locator('#login-step1 .login-card').nth(i).click().catch(() => {}); await page.waitForTimeout(600); await snap('login2-' + i); }
  await openTable(page, base, { stopAt: 'lobby', seats: 6 }); await page.waitForTimeout(800);
  await snap('lobby');
  await ev(page, () => window.toggleLobbyOverflow(new MouseEvent('click'))); await snap('lobby+menu'); await close(page);
  await ev(page, () => { const r = document.querySelector('#g-list .game-row'); r && r.click(); }); await snap('lobby+row');
  await ev(page, () => window.toggleLobbyChat && window.toggleLobbyChat()); await snap('lobby+chat');
  await ev(page, () => window.togglePlayersPanel && window.togglePlayersPanel()); await snap('lobby+players'); await ev(page, () => window.togglePlayersPanel && window.togglePlayersPanel());
  await ev(page, () => window.toggleAdvancedOptions()); await snap('adv');
  for (const c of ['ui', 'style', 'sound', 'local', 'network', 'internet', 'avatar', 'log', 'reset']) { await ev(page, (c) => window.advSelectCat(c), c); await page.evaluate(() => document.querySelectorAll('#adv-modal details').forEach((d) => { d.open = true; })); await snap('adv-' + c); }
  await ev(page, () => window.advUiTab && window.advUiTab('network')); await snap('adv-ui-network');
  await close(page);
  await ev(page, () => window.openThemePanel(new MouseEvent('click'))); await snap('theme'); await close(page);
  await ev(page, () => window.toggleMusicPanel()); await snap('music'); await close(page);
  await ev(page, () => window.toggleRankingModal()); await snap('ranking');
  for (const t of ['bbc', 'wec', 'lan', 'ach']) { await ev(page, (t) => window.rankingSelect(t), t); await snap('ranking-' + t); }
  await close(page);
  await ev(page, () => window.toggleForumModal()); await snap('forum'); await ev(page, () => window.forumSelectTab('posts')); await snap('forum-posts'); await close(page);
  await ev(page, () => window.toggleAvatarPopup()); await snap('avatar');
  for (const t of ['create', 'import']) { await ev(page, (t) => window.avStudioTab(t), t); await snap('avatar-' + t); }
  await close(page);
  await ev(page, () => window.togglePmModal()); await snap('pm'); await close(page);
  await ev(page, () => window._openJournal()); await snap('logs'); await close(page);
  await ev(page, () => window.openPlayerInfoPopup()); await snap('playerinfo'); await close(page);
  await ev(page, () => window.App.openCreatePage()); await snap('create');
  await ev(page, () => window.App.toggleStyleGrid && window.App.toggleStyleGrid()); await snap('create+styles');
  await ev(page, () => window.toggleCreateOverflow(new MouseEvent('click'))); await snap('create+menu'); await close(page);
  await ev(page, () => window.App.closeCreatePage()); 
  await page.evaluate(() => { const f = window.__fx; f.socket.receive(f.envelope(f.MSG.T.JoinGameAck, 25, [[1, 0, f.GAME], [2, 0, 0]])); }).catch(() => {});
  await page.waitForTimeout(900); await snap('wait');
  await enterTable(page, { seats: 6, turn: 'other' }); await page.waitForTimeout(900);
  await snap('table-other');
  await ev(page, () => window.toggleHeaderOverflow(new MouseEvent('click'))); await snap('table+menu'); await close(page);
  await ev(page, () => window.openGameInfoPopup()); await snap('table+gameinfo'); await close(page);
  await ev(page, () => window.toggleSoundPopover(document.getElementById('sound-toggle-btn'))); await snap('table+sound'); await close(page);
  await ev(page, () => window.toggleTableRanking && window.toggleTableRanking()); await snap('table+tableranking'); await close(page);
  await ev(page, () => window.toggleGameChat(document.getElementById('chat-toggle-btn'))); await snap('table+chat'); await ev(page, () => window.toggleGameChat(document.getElementById('chat-toggle-btn')));
  await ev(page, () => window.toggleReactionPanel(document.getElementById('react-toggle-btn'))); await snap('table+react'); await ev(page, () => window.toggleReactionPanel(document.getElementById('react-toggle-btn')));
  await ev(page, () => window.toggleHandsHelp(document.getElementById('hands-toggle-btn'))); await snap('table+hands'); await ev(page, () => window.toggleHandsHelp(document.getElementById('hands-toggle-btn')));
  await ev(page, () => window.toggleLog(document.getElementById('log-toggle-btn'))); await snap('table+log');
  for (const t of ['odds', 'stats']) { await ev(page, (t) => window.gipShowTab(t), t); await snap('table+log-' + t); }
  await ev(page, () => window.toggleLog(document.getElementById('log-toggle-btn')));
  await ev(page, () => { const s = window.PthState; const pid = (s.seats || []).find((p) => p !== s.myId); window.openSeatMenu && window.openSeatMenu(pid, 300, 300); }); await snap('table+seatmenu'); await close(page);
  await turnTo(page, ME); await page.waitForTimeout(900); await snap('table-mine');
  await ev(page, () => window.showEndGameOverlay && window.showEndGameOverlay(window.PthState.myId)); await snap('table+endgame');
  await ctx.close();
}
await run('desk', { viewport: { width: 1280, height: 800 } });
await run('phone', devices['Pixel 7']);
const rows = Object.values(all).sort((a, b) => a.kind.localeCompare(b.kind) || a.sig.localeCompare(b.sig));
const lines = rows.map((r) => `${r.kind} | ${r.sig} ×${r.n} | ${r.anc} | ${r.i18n} | ${r.txt} | ${r.on} | ${[...r.states].slice(0, 4).join(',')}`);
if (OUT) fs.writeFileSync(OUT, lines.join('\n'));
const none = rows.filter((r) => r.kind === 'none');
console.log(lines.map((l) => '  · ' + l.slice(0, 200)).join('\n'));
console.log(`\n${rows.length - none.length} explained only by their window, ${none.length} with no answer`);
await browser.close(); server.close();
process.exit(none.length ? 1 : 0);
