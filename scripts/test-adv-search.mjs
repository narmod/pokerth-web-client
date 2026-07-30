// Deterministic test for modules/ui/adv-search.mjs — the search field of the
// Advanced options window.
//   · the index is read from the DOM (labels already translated)
//   · label matches rank before section / category / <select> choice matches
//   · greyed-out categories are left out (advSelectCat would refuse them)
//   · picking a result restores the panels, switches category + sub-tab,
//     unfolds the section and highlights the row
// Run: node scripts/test-adv-search.mjs
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  \u2713 ' + label); }
  else { fail++; console.log('  \u2717 ' + label); }
}

const dom = new JSDOM(`<!doctype html><body>
<div id="adv-modal">
  <div class="km-card adv-card">
    <div class="help-search adv-search"><input id="adv-search-in" type="search"></div>
    <div class="adv-layout">
      <nav class="adv-nav">
        <button class="adv-cat is-active" data-cat="ui"><span class="adv-cat-lbl">User interface</span></button>
        <button class="adv-cat" data-cat="sound"><span class="adv-cat-lbl">Sound</span></button>
        <button class="adv-cat" data-cat="local" disabled><span class="adv-cat-lbl">Local game</span></button>
      </nav>
      <div class="adv-panels">
        <section class="adv-panel is-active" data-cat="ui">
          <div class="adv-body adv-uipanel is-active" data-uitab="general">
            <details class="adv-fold" open><summary class="adv-sec"><span class="adv-sec-ic"></span><span data-i18n="advSecAppearance">Appearance</span></summary>
              <div class="adv-row"><span data-i18n="advDarkMode">Dark mode</span>
                <select id="adv-darkmode"><option>Automatic</option><option>Light</option></select></div>
            </details>
            <details class="adv-fold"><summary class="adv-sec"><span class="adv-sec-ic"></span><span data-i18n="advSecCards">Cards</span></summary>
              <label class="adv-row"><input type="checkbox" id="adv-anim"><span data-i18n="advAnimCards">Card animations</span></label>
            </details>
          </div>
          <div class="adv-body adv-uipanel" data-uitab="network">
            <details class="adv-fold"><summary class="adv-sec"><span class="adv-sec-ic"></span><span data-i18n="advSecChat">Chat</span></summary>
              <label class="adv-row"><input type="checkbox" id="adv-lobbychat"><span data-i18n="advLobbyChat">Show the lobby chat</span></label>
            </details>
          </div>
        </section>
        <section class="adv-panel" data-cat="sound">
          <div class="adv-body">
            <div class="adv-sec">Backup</div>
            <div class="adv-link"><button type="button" class="adv-link-btn"><span>Export backup</span></button></div>
          </div>
        </section>
        <section class="adv-panel" data-cat="local">
          <div class="adv-body">
            <label class="adv-row"><input type="checkbox" id="adv-botskill"><span>Bot difficulty</span></label>
          </div>
        </section>
        <div class="help-body adv-results" id="adv-results" style="display:none"></div>
      </div>
    </div>
  </div>
</div>
</body>`, { pretendToBeVisual: true, url: 'https://pokerth.local/' });

const w = dom.window;
for (const k of ['document', 'localStorage', 'sessionStorage', 'getComputedStyle', 'HTMLElement', 'Event']) {
  globalThis[k] = w[k];
}
globalThis.window = w;
w.scrollIntoViewCalls = 0;
w.HTMLElement.prototype.scrollIntoView = function () { w.scrollIntoViewCalls++; };

// Stand-ins for the two navigation helpers living in pokerth.js.
let lastCat = '', lastTab = '';
w.advSelectCat = (c) => {
  lastCat = c;
  document.querySelectorAll('.adv-panel').forEach((p) => {
    p.classList.toggle('is-active', p.getAttribute('data-cat') === c);
  });
};
w.advUiTab = (n) => {
  lastTab = n;
  document.querySelectorAll('.adv-uipanel').forEach((p) => {
    p.classList.toggle('is-active', p.getAttribute('data-uitab') === n);
  });
};

await import('../public/modules/ui/adv-search.mjs');

const $ = (id) => document.getElementById(id);
const input = $('adv-search-in');
const results = $('adv-results');
const panels = document.querySelector('.adv-panels');
const labels = () => Array.from(results.querySelectorAll('.help-result-t')).map((e) => e.textContent);
const paths = () => Array.from(results.querySelectorAll('.help-result-ch')).map((e) => e.textContent);
function search(q) { input.value = q; w._advSearch(); }

// ── 1. Threshold and idle state ───────────────────────────────────
ok(typeof w._advSearch === 'function', 'window._advSearch exposed');
search('a');
ok(results.style.display === 'none', 'under 2 characters: no result list');
ok(!panels.classList.contains('is-searching'), 'under 2 characters: panels stay visible');

// ── 2. Label match ────────────────────────────────────────────────
search('dark');
ok(results.style.display !== 'none', 'result list shown');
ok(panels.classList.contains('is-searching'), 'panels hidden while searching');
ok(labels().length === 1 && labels()[0] === 'Dark mode', 'label match found');
ok(paths()[0] === 'User interface \u203a Appearance', 'result shows category \u203a section');

// ── 3. Accent- and case-insensitive ───────────────────────────────
search('DÄRK');
ok(labels()[0] === 'Dark mode', 'accent- and case-insensitive match');
search('Card Anim');
ok(labels()[0] === 'Card animations', 'match on a fragment spanning two words');
search('zzz');
ok(labels().length === 0 && /help-wip/.test(results.innerHTML), 'no match: empty-result notice');

// ── 4. Rows found through their section, category or choices ──────
search('appearance');
ok(labels().includes('Dark mode'), 'section title reaches its rows');
search('automatic');
ok(labels().includes('Dark mode'), '<select> choice reaches its row');

// ── 5. Label matches rank first ───────────────────────────────────
search('chat');
ok(labels()[0] === 'Show the lobby chat', 'label match ranks before section match');

// ── 6. Greyed-out categories are skipped ──────────────────────────
search('bot difficulty');
ok(labels().length === 0, 'row of a disabled category is not indexed');

// ── 7. Buttons of link rows are searchable ────────────────────────
search('export');
ok(labels()[0] === 'Export backup', 'adv-link-btn indexed');
ok(paths()[0] === 'Sound \u203a Backup', 'plain .adv-sec heading used as section');

// ── 8. Picking a result ───────────────────────────────────────────
search('lobby chat');
const before = w.scrollIntoViewCalls;
w._advSearchGo(0);
ok(lastCat === 'ui' && lastTab === 'network', 'switches to the right category and sub-tab');
ok(document.querySelector('label:has(#adv-lobbychat)').closest('details').open === true, 'section unfolded');
ok(w.scrollIntoViewCalls === before + 1, 'row scrolled into view');
ok(document.querySelector('label:has(#adv-lobbychat)').classList.contains('adv-hit'), 'row highlighted');
ok(input.value === '' && results.style.display === 'none', 'search cleared after picking');
ok(!panels.classList.contains('is-searching'), 'panels visible again');

// ── 9. Reset ──────────────────────────────────────────────────────
search('dark');
w._advSearchReset();
ok(input.value === '' && !panels.classList.contains('is-searching'), 'reset clears field and panels');

console.log('\n' + (fail ? '\u2717 ' : '\u2713 ') + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
