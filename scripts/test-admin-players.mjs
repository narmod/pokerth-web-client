// Admin › Player experience in a real DOM. Run: node scripts/test-admin-players.mjs   (needs jsdom)
//
// Since web.157 the section follows the player: Login screen, Lobby & tables,
// First visit, Features. The LAN / dedicated server moved to Infrastructure ›
// Game servers, next to the Internet button it mirrors. Every call is stubbed;
// what is checked is what each page shows and what each save sends.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public', 'admin.html'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));

const LOGIN = { mode: 'lan-dedi', lanMode: 'forced', host: 'game.example.com', lanPort: 7300, lanTls: true, proxyUrl: '', hideProxy: false };
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.10-web.157', uptimeSec: 60, sockets: 0, modes: { offline: true, lan: false, pokerthnet: true }, update: {},
    loginDefaults: LOGIN, defaultTheme: 'officiallight', defaults: { haptic: '0' }, liveDefaults: { theme: 'casino', sound: '0', chat: '0' },
    tableDefaults: { players: 6, blind: 20 }, tableNames: { lan: 'Family night' }, serverName: 'Home <b>poker</b>', serverTagline: '',
    lobbyClockTz: '', lobbyClockEff: 'Europe/Berlin', clockZones: ['Europe/Paris', 'Asia/Tokyo'], clockRef: 'UTC', seo: { enabled: false, aiCrawlers: false } },
  '/admin/config': { ok: true,
    featureSwitches: [{ key: 'hud_on', label: 'Stats HUD' }, { key: 'show_odds', label: 'Odds <i>tab</i>' }, { key: 'polls', label: 'Product polls' },
      { key: 'ace_dance', label: 'The Ace dances' }, { key: 'err_report', label: 'Error reporting' }, { key: 'zz_new', label: 'Something new' }],
    featureOff: ['ace_dance'], liveStats: { on: true, sec: 90 }, communityEvents: { on: false, sec: 300 } },
};
const posts = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', url: 'https://example.org/admin', virtualConsole: vc, pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url, opts) => {
      const p = String(url).split('?')[0];
      if (opts && opts.method === 'POST') {
        try { posts.push({ url: p, body: JSON.parse(opts.body) }); } catch (e) {}
        // The server stores what it is sent: the next /admin/status reads it back.
        const last = posts[posts.length - 1];
        if (last && last.body && last.body.loginDefaults) CANNED['/admin/status'].loginDefaults = last.body.loginDefaults;
        return Promise.resolve({ ok: true, status: 200, clone() { return this; }, json: () => Promise.resolve({ ok: true }), text: () => Promise.resolve('') });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(CANNED[p] || { ok: true }), text: () => Promise.resolve('') });
    };
    w.confirm = () => true;
    w.localStorage.setItem('pth_admin_tok', 'test-token');
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
  },
});
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);
const tiles = (id) => [...doc.querySelectorAll('#' + id + ' .ovmode')].map((m) => [...m.children].map((c) => c.textContent.trim()).join(' ')).join(' | ');
const tick = (ms) => new Promise((r) => setTimeout(r, ms || 60));
const open = async (t) => { doc.querySelector('.tab[data-t="' + t + '"]').click(); await tick(250); };
const lastPost = (key) => [...posts].reverse().find((p) => p.url === '/admin/config' && p.body && key in p.body);
const typeIn = (id, v) => { const el = $(id); el.value = v; el.dispatchEvent(new window.Event('input', { bubbles: true })); };
await tick(400);

// ── Menu ──────────────────────────────────────────────────────────────────
const tabs = [...doc.querySelectorAll('.subtabs[data-g="players"] .tab')].map((b) => b.dataset.t + '=' + b.textContent.trim());
ok(tabs.join(',') === 'login=Login screen,lobby=Lobby & tables,firstvisit=First visit,features=Features', 'Player experience follows the player: ' + tabs.join(', '));
ok(!doc.querySelector('[data-t="clients"],[data-t="defaults"],#panel-clients,#panel-defaults'), 'the old Modes & features / Defaults pages are gone');

// ── Login screen ──────────────────────────────────────────────────────────
await open('login');
ok(errors.length === 0, 'opening Login screen throws nothing' + (errors.length ? ': ' + errors[0] : ''));
let t = tiles('lgTiles');
ok(/Entry modes 2 \/ 3 Training \(bots\), Internet \(pokerth\.net\)/.test(t), 'the modes tile counts and names what is offered (' + t + ')');
ok(/Opens on LAN this mode is hidden from the login screen/.test(t), 'a first visit opening on a hidden mode is flagged');
ok(/Server name Home <b>poker<\/b>/.test(t) && !doc.querySelector('#lgTiles b b') && /Live figures On read every 90 s/.test(t), 'server name (as text) and live figures tiles');
const modes = [...doc.querySelectorAll('#modes .pxmode')];
ok(modes.length === 3 && modes.every((r) => r.querySelector('.lvdot') && r.style.getPropertyValue('--mc')), 'each mode row has its colour');
ok(modes[1].classList.contains('off') && /hidden from the login screen/.test(modes[1].textContent), 'a mode switched off says so in words');
const lanOpt = [...$('defMode').options].find((o) => o.value === 'lan-dedi');
ok(lanOpt.disabled && /\(hidden\)$/.test(lanOpt.textContent), 'a hidden mode cannot be picked as the first-visit mode');
ok($('defMode').closest('#panel-login') && $('srvName').closest('#panel-login') && $('lsUrl').closest('#panel-login'), 'entry modes, server identity and live figures live on Login screen');
const notices = ['wcEnabled', 'gwEnabled', 'lwEnabled', 'awEnabled'];
ok(notices.every((k) => $(k).closest('.card').parentNode === $('panel-login')), 'the four popups are on Login screen too');
ok(doc.querySelectorAll('#panel-login > .card').length === 7, 'Login screen holds its three cards and the four popups');
typeIn('wcTitle', 'Hello, unsaved');
await open('broadcast');
ok(notices.every((k) => $(k).closest('.card').parentNode === $('panel-broadcast')) && $('wcTitle').value === 'Hello, unsaved',
  'back in Broadcasts it is the same editor, unsaved text included');
ok(doc.querySelectorAll('[id="wcTitle"]').length === 1, 'one editor per popup, never a copy');
await open('login');
ok($('wcEnabled').closest('#panel-login'), 'and it follows the operator back to Login screen');
const chip = (k) => { const c = $(k).closest('.card').querySelector('h2 .hchip'); return c ? c.textContent : ''; };
ok(['wcEnabled', 'gwEnabled', 'lwEnabled', 'awEnabled'].every((k) => /^(On|Off)$/.test(chip(k))), 'each popup title says On or Off, folded or not');
ok(doc.querySelectorAll('#wcEnabled').length === 1 && $('wcEnabled').closest('.card').querySelectorAll('h2 .hchip').length === 1, 'one chip per title, however often it is repainted');

// An unsaved LAN edit on Game servers is never sent by the mode select.
typeIn('defHost', 'typed.but.unsaved');
$('defMode').value = 'offline';
$('defMode').dispatchEvent(new window.Event('change', { bubbles: true }));
await tick(120);
let p = lastPost('loginDefaults');
ok(p && p.body.loginDefaults.mode === 'offline', 'changing the first-visit mode saves at once');
ok(p && p.body.loginDefaults.host === 'game.example.com' && p.body.loginDefaults.lanMode === 'forced' && p.body.loginDefaults.lanPort === 7300,
  'and keeps the stored LAN server, not the unsaved edit (' + (p && p.body.loginDefaults.host) + ')');
ok(/opens on Training/.test($('modesmsg').textContent), 'the card says what was saved');
ok(!$('defMode').closest('.card').classList.contains('unsaved'), 'a select saved on change leaves its card clean');

// ── Lobby & tables ────────────────────────────────────────────────────────
await open('lobby');
ok(errors.length === 0, 'opening Lobby & tables throws nothing' + (errors.length ? ': ' + errors[0] : ''));
t = tiles('ltTiles');
ok(/Table values 2 \/ 4 6 players · 20 blind/.test(t) && /Table names 1 \/ 3 custom: LAN/.test(t), 'table tiles count what is set (' + t + ')');
ok(/Lobby clock Europe\/Berlin default zone/.test(t) && /Events tab Off no Events tab/.test(t), 'lobby clock and Events tab tiles');
ok([['tdPlayers', '2', '10'], ['tdBlind', '5', '20000'], ['tdStack', '1000', '1000000'], ['tdTimeout', '5', '60']].every(([id, lo, hi]) => $(id).min === lo && $(id).max === hi && $(id).placeholder === 'app default'),
  'the table fields carry the limits of the players\' own form, and no single default number');
ok(/var _bl = _tdInt\(td\.blind, +5, 20000\)/.test(readFileSync(join(root, 'proxy.js'), 'utf8')) && /_tdInt\(td\.timeout, 5, 60\)/.test(readFileSync(join(root, 'proxy.js'), 'utf8')), 'and the server accepts the same limits');
ok($('lobbyClk').closest('#panel-lobby') && $('ceOn').closest('#panel-lobby') && $('tnLanMode').closest('#panel-lobby'), 'lobby clock, Events tab and table names live here');
typeIn('tdPlayers', '8');
const tCard = $('tdPlayers').closest('.card');
ok(tCard.classList.contains('unsaved'), 'an edited card is marked unsaved');
$('tnNetMode').value = 'custom'; $('tnNetMode').dispatchEvent(new window.Event('change', { bubbles: true }));
ok($('tnNetName').style.display === '', 'Custom shows the name field');
$('tnNetName').value = 'Friday game';
$('saveTable').click();
await tick(120);
p = lastPost('tableDefaults');
ok(p && p.body.tableDefaults.players === '8' && p.body.tableNames && p.body.tableNames.pokerthnet === 'Friday game', 'one Save sends the values and the names together');
ok(!tCard.classList.contains('unsaved'), 'and the card is clean again');
ok($('saveTable').hasAttribute('data-save') && /\.card\.unsaved \[data-save\]\{/.test(html), 'the unsaved mark follows data-save, in every section');
ok(['savePx', 'saveSeo', 'wcSave', 'ldSetSave', 'mzSaveEnabled', 'saveLogin'].every((id) => $(id).hasAttribute('data-save')), 'Save buttons outside Player experience carry it too');

// ── First visit ───────────────────────────────────────────────────────────
await open('firstvisit');
ok(errors.length === 0, 'opening First visit throws nothing' + (errors.length ? ': ' + errors[0] : ''));
t = tiles('fvTiles');
ok(/Palette PokerTH Light/.test(t) && /Settings 1 \/ 4 Vibration off/.test(t), 'palette and settings tiles (' + t + ')');
ok(/\/live palette Green Casino/.test(t) && /\/live sound Off lobby chat strip hidden/.test(t), 'spectator tiles');
ok(doc.querySelectorAll('#panel-firstvisit > .card').length === 2, 'palette and in-game settings are one card, /live the other');
$('defTheme').value = 'casino'; $('defVoice').value = '1';
$('saveDefaults').click();
await tick(120);
p = lastPost('defaults');
ok(p && p.body.defaultTheme === 'casino' && p.body.defaults.voice === '1' && p.body.defaults.haptic === '0', 'one Save sends the palette and the settings');
ok(!/In-game settings/.test(html.match(/DEFAULT_FOLDED = \[[^\]]*\]/)[0]), 'no player card starts folded');

// ── Features ──────────────────────────────────────────────────────────────
await open('features');
ok(errors.length === 0, 'opening Features throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const groups = [...doc.querySelectorAll('#fsList h3.subhd')].map((h) => h.firstChild.textContent);
ok(groups.join('|') === 'At the table|Lobby & community|App & the Ace|Data on the device|Other', 'switches grouped by where players meet them, unknown keys under Other: ' + groups.join(', '));
t = tiles('ftTiles');
ok(/At the table 2 \/ 2 all on/.test(t) && /App & the Ace 0 \/ 1 off: The Ace dances/.test(t), 'one tile per group (' + t + ')');
const row = (k) => doc.querySelector('#fsList .ftrow[data-k="' + k + '"]');
ok(row('ace_dance').classList.contains('off') && row('ace_dance').querySelector('.toggle').textContent === 'Off', 'a feature off for everyone shows Off');
ok(row('show_odds').querySelector('b').textContent === 'Odds <i>tab</i>' && !doc.querySelector('#fsList i'), 'labels are text, never markup');
ok(!doc.querySelector('#fsList input[type=checkbox]'), 'no inverted checkbox left: On means on');
row('show_odds').querySelector('.toggle').click();
await tick(120);
p = lastPost('featureOff');
ok(p && p.body.featureOff.includes('show_odds') && p.body.featureOff.includes('ace_dance'), 'a switch applies at once and sends the whole list');
ok(row('show_odds').classList.contains('off') && /off for everyone/.test($('fsMsg').textContent), 'the row and the message follow');
row('ace_dance').querySelector('.toggle').click();
await tick(120);
p = lastPost('featureOff');
ok(p && !p.body.featureOff.includes('ace_dance') && /back on/.test($('fsMsg').textContent), 'switching back on removes it from the list');

// ── Infrastructure: LAN button, Identity & reach ──────────────────────────
await open('servers');
ok(errors.length === 0, 'opening Game servers throws nothing' + (errors.length ? ': ' + errors[0] : ''));
ok($('lanCard') && $('lanCard').closest('#panel-servers') && $('defHost').closest('#lanCard'), 'the LAN / dedicated button card sits in Game servers');
$('defHost').value = 'lan.example.com';
$('saveLogin').click();
await tick(120);
p = lastPost('loginDefaults');
ok(p && p.body.loginDefaults.host === 'lan.example.com' && p.body.loginDefaults.mode === 'offline', 'the LAN save keeps the first-visit mode saved earlier');
await open('identity');
ok(!doc.querySelector('#panel-identity #srvName,#panel-identity #lobbyClk'), 'server identity and lobby clock left Identity & reach');
t = tiles('idTiles');
ok(/World clock 2 regions around UTC/.test(t) && /AI crawlers Refused/.test(t), 'Identity & reach tiles follow what stayed (' + t + ')');

// ── Bare fields ───────────────────────────────────────────────────────────
ok(/:where\(\.card\) input:where\(:not\(\[type\]\),\[type=text\],\[type=number\]/.test(html), 'a text or number field without a class gets the base field style');
ok(/:where\(:root\[data-admin-theme="light"\] \.card\) input:where\(/.test(html), 'with its light-theme background');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
