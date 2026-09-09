/* test-live-route — /live (embedded spectator mode) wiring.
 *
 * Static assertions only: proxy.js is too large to import here, and the
 * properties we care about are structural. Checks that the route exists, that
 * the client HTML carries the boot placeholder, that live mode is excluded
 * from SEO and from service-worker registration, and that the framing header
 * is defined.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const proxy = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'pokerth-client.html'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) { console.log('  ok   ' + name); return; }
  console.log('  FAIL ' + name); failed++;
}

console.log('test-live-route');

check('/live route present', /reqPathOnly === '\/live'/.test(proxy));
check('/live serves the client with live=true', /sendClientHtml\(req, res, true\)/.test(proxy));
check('sendClientHtml takes the live flag', /function sendClientHtml\(req, res, live\)/.test(proxy));
check('live is excluded from SEO', /const on = !live && seoEnabled\(\)/.test(proxy));
check('live has its own cache key', /const key = \(live \? 'live:' : ''\)/.test(proxy));
check('LIVE_BOOT placeholder is substituted', /__LIVE_BOOT__-->', live\s/.test(proxy));
check('frame-ancestors constant defined', /LIVE_FRAME_ANCESTORS = "frame-ancestors 'self'/.test(proxy));
check('frame-ancestors sent only in live mode', /if \(live\) headers\['Content-Security-Policy'\] = LIVE_FRAME_ANCESTORS;/.test(proxy));
check('no X-Frame-Options header is set', !/['"]X-Frame-Options['"]/.test(proxy));

check('client HTML has exactly one LIVE_BOOT placeholder',
  (html.match(/<!--__LIVE_BOOT__-->/g) || []).length === 1);
check('LIVE_BOOT sits before the first <script>',
  html.indexOf('<!--__LIVE_BOOT__-->') < html.indexOf('<script'));
check('service worker is skipped in live mode',
  /if \('serviceWorker' in navigator && !window\.LIVE_MODE\)/.test(html));

// ── Slim header (2.1.8-web.66) ──
const css = fs.readFileSync(path.join(root, 'public', 'pokerth.css'), 'utf8');
const live = fs.readFileSync(path.join(root, 'public', 'modules', 'live', 'index.mjs'), 'utf8');

check('LIVE_BOOT flags the root element', /setAttribute\("data-live","1"\)/.test(proxy));
check('LIVE_BOOT loads the live module', /modules\/live\/index\.mjs/.test(proxy));
check('live module is guarded by LIVE_MODE', /if \(window\.LIVE_MODE\)/.test(live));
check('live-only is hidden by default', /\.live-only \{ display: none; \}/.test(css));
check('live-only is revealed under data-live', /:root\[data-live="1"\] \.live-only/.test(css));
check('identity slot in the lobby header', /class="live-only live-id" id="live-id"/.test(html));
check('appearance button in both headers',
  /id="live-theme-lobby"/.test(html) && /id="live-theme-game"/.test(html));
check('appearance reuses openThemePanel',
  (html.match(/onclick="openThemePanel\(event\)"/g) || []).length === 2);
check('version slot in both headers',
  /id="live-ver-lobby"/.test(html) && /id="live-ver-game"/.test(html));
for (const id of ['fs-btn-lobby', 'pm-btn-lobby', 'forum-btn-lobby', 'lobby-chat-btn',
                  'haptic-toggle-btn', 'voice-toggle-btn', 'install-btn']) {
  check('hidden in live mode: #' + id,
    new RegExp(':root\\[data-live="1"\\] #' + id + '[,\\s]').test(css));
}
check('sound button is kept at the table', !/:root\[data-live="1"\] #sound-toggle-btn/.test(css));
check('CSS braces balanced',
  (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length);

// ── Login card (2.1.8-web.74) ──
check('a host for the server figures sits in the login card',
  /class="live-only live-stats-host" id="live-stats-host"/.test(html));
check('the card is retitled for the spectator tool',
  /'Live \/ Spectator Tool'/.test(live));
check('the figures node is moved, not rebuilt',
  /getElementById\('lc-live'\)/.test(live) && !/lcl'/.test(live));
check('the moved figures are styled where they land',
  /:root\[data-live="1"\] \.live-stats-host/.test(css));

// ── Guest-only login screen (2.1.8-web.67) ──
check('step 1 is skipped in live mode', /:root\[data-live="1"\] #login-step1 \{ display: none/.test(css));
check('step 2 is forced visible', /:root\[data-live="1"\] #login-step2 \{ display: block/.test(css));
for (const sel of ['#login-form', '#tls-row', '#register-link-row', '#server-mode-seg', '#invite-banner']) {
  check('hidden on the live connect screen: ' + sel,
    new RegExp(':root\\[data-live="1"\\] ' + sel + '[,\\s]').test(css));
}
check('the real CONNECT button is kept', !/:root\[data-live="1"\][^{]*\.btn-primary[^{]*\{ display: none/.test(css));
// Idle notes go, anything that reports stays: only keyed messages are hidden.
check('idle status notes are hidden',
  /#cstatus\[data-status-key\]:not\(\[data-status-key=""\]\) \{ display: none/.test(css));
check('errors and progress keep the status line',
  !/:root\[data-live="1"\] #cstatus \{ display: none/.test(css));
check('the status key reaches the DOM',
  /if \(el\.dataset\) el\.dataset\.statusKey = key \|\| '';/.test(
    fs.readFileSync(path.join(root, 'public', 'modules', 'net', 'session.mjs'), 'utf8')));
check('the figures sit below the button, where the hint was',
  html.indexOf('id="cstatus"') < html.indexOf('id="live-stats-host"'));
check('each figure carries its translated wording',
  /tx\.className = 'lcl-x'/.test(
    fs.readFileSync(path.join(root, 'public', 'modules', 'ui', 'live-stats.mjs'), 'utf8')));
check('the wording is hidden in the ordinary client', /\.lcl-x \{ display: none; \}/.test(css));
// It was hidden with display and only re-shown with opacity, so it never
// appeared at all — the whole point of the row.
check('the wording is actually displayed in live mode',
  /:root\[data-live="1"\] \.live-stats-host \.lcl-x \{ display: inline/.test(css));

// ── Language, and the lobby frame (2.1.8-web.76) ──
check('a language button in each header, on the ids i18n already syncs',
  /id="lang-toggle-lobby"/.test(html) && /id="lang-toggle-game"/.test(html) &&
  /id="lang-toggle-connect"/.test(html));
// The Advanced-options control uses the same entry point, hence four in all.
check('the language buttons open the existing picker',
  ['lang-toggle-lobby', 'lang-toggle-game', 'lang-toggle-connect'].every(function (id) {
    return new RegExp('id="' + id + '" onclick="openLangMenu\\(event\\)"').test(html);
  }));
check('the columns wear the lobby panel frame',
  /:root\[data-live="1"\] \.live-lobby \.llb-main,[\s\S]{0,120}border-radius: 8px;[\s\S]{0,80}var\(--panel\)/.test(css));
check('the tab bar is a panel header',
  /\.live-lobby \.llb-tabs \{[\s\S]{0,140}var\(--chrome-tint\)/.test(css));
check('login is forced to pokerth.net', /sm\.value = 'pokerthnet'/.test(live));
check('guest mode is forced on', /gc\.checked = true/.test(live));
check('guest state re-asserted on click capture', /addEventListener\('click'[\s\S]{0,200}, true\)/.test(live));
check('nickname is left empty for the persistent guest name', !/getElementById\('nick'\)/.test(live));

// ── Live lobby (2.1.8-web.68) ──
check('live lobby container in the lobby screen', /class="live-only live-lobby" id="live-lobby"/.test(html));
check('the full lobby body is replaced', /:root\[data-live="1"\] \.lobby-body[,\s]/.test(css));
check('leave button comes before the guest name',
  html.indexOf('id="live-leave-anchor"') < html.indexOf('id="live-id"'));
check('chat column and grip exist in the lobby',
  /id="live-chat-side"/.test(html) && /id="live-chat-resizer"/.test(html));
check('the chat composer is hidden in live mode',
  /:root\[data-live="1"\] \.live-lobby #lobby-chat-panel \.chat-input/.test(css));
check('chat height is a custom property', /--live-chat-h/.test(css));
check('the chat sits at the bottom, full width',
  /:root\[data-live="1"\] \.live-lobby \{[\s\S]{0,120}flex-direction: column/.test(css));
check('the grip resizes vertically', /cursor: row-resize/.test(css));
check('the dock is re-asserted, not set once',
  /export function keepDocked/.test(
    fs.readFileSync(path.join(root, 'public', 'modules', 'live', 'chat-pane.mjs'), 'utf8')) &&
  /keepDocked\(\);/.test(
    fs.readFileSync(path.join(root, 'public', 'modules', 'live', 'lobby.mjs'), 'utf8')));
// If the dock fails for any reason, the chat must disappear rather than smear
// itself across the top of the lobby: the panel is a child of #s-lobby, not of
// the .lobby-body that live mode hides.
check('an undocked chat panel is hidden, not left loose',
  /:root\[data-live="1"\] #s-lobby > #lobby-chat-panel \{ display: none !important; \}/.test(css));
check('the lobby layout cannot be overridden into a row',
  /flex-direction: column !important/.test(css));
check('the language buttons have visible content of their own',
  (html.match(/data-i18n-title="advLanguage">\u{1F310}<\/button>/gu) || []).length === 3);
check('the flag has a size in the header buttons',
  /\[id\^="lang-toggle-"\] svg \{[\s\S]{0,80}width: 22px/.test(css));
check('chat pane is wired from the live entry point',
  /initLiveChatPane\(\)/.test(live) && /from '\.\/chat-pane\.mjs'/.test(live));
check('the leave-lobby button is kept in live mode',
  !/confirmDisconnect/.test(css));
check('live lobby is wired from the live entry point',
  /initLiveLobby\(\)/.test(live) && /from '\.\/lobby\.mjs'/.test(live));

// Version triple must stay in lockstep — three files, one value.
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const sw = /const CACHE_VERSION = 'pokerth-v([^']+)'/.exec(
  fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8'));
const build = /window\.BUILD_VERSION='([^']+)'/.exec(
  fs.readFileSync(path.join(root, 'public', 'pokerth.js'), 'utf8'));
check('sw.js version matches package.json', sw && sw[1] === pkg);
check('BUILD_VERSION matches package.json', build && build[1] === pkg);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
