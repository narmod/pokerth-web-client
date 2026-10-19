// Admin › Infrastructure (Game servers, Proxy, Identity & reach) in a real
// DOM, since web.132. Run: node scripts/test-admin-infra.mjs   (needs jsdom)
//
// Tiles from the saved values, the server steps without a card nested in a
// card, the allowlist as chips, warnings in the theme colour. Every call is
// stubbed.
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

const NOW = Date.now();
const CANNED = {
  '/admin/whoami': { ok: true, master: true, scopes: [] },
  '/admin/status': { ok: true, version: '2.1.10-web.132', uptimeSec: 60, sockets: 7, update: {},
    proxyCfg: { allowedHosts: ['game.example.org', 'lan.example.org'], allowedPorts: [7236], graceSec: 90, maxClients: 400, logLevel: 'quiet' },
    serverName: 'My <b>club</b>', serverTagline: '', lobbyClockTz: '', lobbyClockEff: 'Europe/Berlin', discordChatWebhookUrl: 'https://discord.com/api/webhooks/x',
    seo: { enabled: true, publicUrl: 'https://webclient.example.org' } },
  '/admin/servers': { ok: true, source: 'manual', transport: 'proxy', liveTransport: 'direct', proxyProtocol: true, activeServerId: 's1',
    servers: [{ id: 's1', name: 'Club <i>one</i>', host: 'game.example.org', port: 7236, tls: true }],
    effective: { host: 'game.example.org', port: 7236, tls: true, transport: 'proxy', from: 'manual', name: 'Club one' },
    allowlist: { hosts: ['pokerth.net', 'game.example.org', '<img src=x>'], ports: [7234, 7236] } },
};
const posts = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', url: 'https://example.org/admin', virtualConsole: vc, pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (url, opts) => {
      if (opts && opts.method === 'POST') { try { posts.push({ url: String(url), body: JSON.parse(opts.body) }); } catch (e) {} }
      const p = String(url).split('?')[0];
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
await tick(400);

// ── Game servers ──────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="servers"]').click();
await tick(250);
ok(errors.length === 0, 'opening Game servers throws nothing' + (errors.length ? ': ' + errors[0] : ''));
const g = tiles('gsTiles');
ok(/Target game\.example\.org:7236 the active server: Club <i>one<\/i>/.test(g) && !doc.querySelector('#gsTiles i i'), 'the target tile says what is dialled and why, names as text (' + g + ')');
ok(/Source Manual 1 registered server/.test(g) && /Transport Via proxy \/live: Direct WS · PROXY protocol/.test(g) && /Dial allowlist 3 hosts · 2 ports/.test(g), 'source, transport and allowlist tiles');
ok(!doc.querySelector('#panel-servers .card .card'), 'no card nested in a card any more');
ok(doc.querySelectorAll('#srvRows .gsrow').length === 1, 'one row per registered server');
ok(doc.querySelectorAll('#srvAllow .erchip').length === 5 && !doc.querySelector('#srvAllow img'), 'the allowlist as chips, as text');
ok(!/#FFC107/.test(html), 'no hard-coded warning colour left: the theme decides');

// ── Proxy ─────────────────────────────────────────────────────────────────
doc.querySelector('.tab[data-t="proxy"]').click();
await tick(250);
const p = tiles('prTiles');
ok(/Connected 7 cap 400 bridges/.test(p) && /Session grace 90 s/.test(p) && /Extra hosts 2 and 1 extra port/.test(p) && /Log quiet/.test(p), 'proxy tiles from the saved settings (' + p + ')');

// ── Search engines (Identity & reach until web.163) ───────────────────────
doc.querySelector('.tab[data-t="identity"]').click();
await tick(250);
ok(doc.querySelector('.tab[data-t="identity"]').textContent === 'Search engines', 'the page is called Search engines');
const t = tiles('idTiles');
ok(/^Search engines Indexed https:\/\/webclient\.example\.org/.test(t) && /Verification 0 \/ 3/.test(t) && /IndexNow /.test(t) && /AI crawlers /.test(t), 'four search-engine tiles (' + t + ')');
ok(doc.querySelectorAll('#panel-identity > .card').length === 1 && $('seoUrl').closest('#panel-identity'), 'the SEO card is alone on its page');
// The world clock is set from the strip it draws; the Discord relay sits with the messages.
ok($('clkCard').closest('#panel-overview') && $('clkCard').style.display === 'none', 'the world-clock settings live on Overview, closed');
$('clkEdit').click();
ok($('clkCard').style.display === '' && $('clkEdit').textContent === 'Done' && $('clkEdit').getAttribute('aria-expanded') === 'true', 'Customize the clocks opens them');
$('clkEdit').click();
ok($('clkCard').style.display === 'none' && $('clkEdit').textContent === 'Customize the clocks', 'and Done closes them');
ok($('discordHook').closest('#panel-broadcast') && $('discordHook').closest('.card').hasAttribute('data-master'), 'the Discord relay is in Broadcasts, master key only');
// Each LAN card points at the other.
const lanLinks = [...doc.querySelectorAll('[data-goto]')].map((a) => a.getAttribute('data-goto'));
ok(lanLinks.includes('servers') && lanLinks.includes('landir'), 'LAN directory and the LAN / dedicated button link to each other');
doc.querySelector('#lanCard [data-goto="landir"]').click();
await tick(150);
ok(doc.querySelector('.tab.on') && doc.querySelector('.tab.on').dataset.t === 'landir', 'a link opens the section it names');
ok(/\[id\^="panel-"\]>\.ovmodes\{column-span:all/.test(html), 'tiles span both columns of a two-column panel');
ok(/:where\(\.card\) textarea\{/.test(html), 'a bare textarea gets the base field style too');
ok(errors.length === 0, 'nothing threw' + (errors.length ? ': ' + errors[0] : ''));

console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
