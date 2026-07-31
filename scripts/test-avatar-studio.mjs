// Deterministic tests for public/modules/ui/avatar-studio.mjs.
// Run: node scripts/test-avatar-studio.mjs   (needs: npm i jsdom --no-save)
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(__dirname, '..', 'public');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  \u2713 ' + msg); }
  else { fail++; console.log('  \u2717 ' + msg); }
}

const dom = new JSDOM(`<!DOCTYPE html><body>
  <div id="avatar-popup">
    <div id="avp-pane-gallery"></div>
    <button id="avp-tab-gallery" class="selected"></button>
    <button id="avp-tab-create"></button>
    <button id="avp-tab-import"></button>
    <div id="avp-pane-create" style="display:none"></div>
    <div id="avp-pane-import" style="display:none"></div>
  </div></body>`, { url: 'https://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.Image = dom.window.Image;
window.t = (k) => k;

const src = fs.readFileSync(path.join(PUB, 'modules/ui/avatar-studio.mjs'), 'utf8');
// Strip ESM export tail so we can eval in this CJS-ish harness.
const body = src.replace(/export \{[^}]*\};?/, '');
(0, eval)(body.replace(/^'use strict';/m, ''));

// 1. API exposed
ok(typeof window.avStudioTab === 'function', 'avStudioTab exposed on window');
ok(typeof window.avStudioReset === 'function', 'avStudioReset exposed on window');

// 2. Catalogue coherence: 12 keys, files on disk for every non-null entry
const catMatch = src.match(/const AVM_CAT = \{([\s\S]*?)\};/);
ok(!!catMatch, 'AVM_CAT found in source');
const entries = [...catMatch[1].matchAll(/'([^']+)':\s*(?:'([^']+)'|null)/g)];
ok(entries.length === 12, 'AVM_CAT has 12 combinations (' + entries.length + ')');
let files = 0, missingOnDisk = [];
for (const [, key, file] of entries) {
  ok(/^[FH]\|(jeune|adulte|senior)\|(avec|sans)$/.test(key), 'key well-formed: ' + key);
  if (file) {
    files++;
    if (!fs.existsSync(path.join(PUB, 'avatars/people', file))) missingOnDisk.push(file);
  }
}
ok(files === 8, '8 portraits referenced (' + files + ')');
ok(missingOnDisk.length === 0, 'all referenced portraits exist on disk' + (missingOnDisk.length ? ' (missing: ' + missingOnDisk + ')' : ''));

// 3. Tab switching
window.avStudioTab('create');
ok(document.getElementById('avp-pane-create').style.display === '', 'create pane visible after avStudioTab(create)');
ok(document.getElementById('avp-pane-gallery').style.display === 'none', 'gallery pane hidden');
ok(document.getElementById('avm-rows').children.length === 3, 'create pane renders 3 axes');
window.avStudioTab('import');
ok(document.getElementById('avp-pane-import').style.display === '', 'import pane visible');
ok(!!document.getElementById('avi-drop'), 'import drop zone rendered');
window.avStudioReset();
ok(document.getElementById('avp-pane-gallery').style.display === '', 'reset returns to gallery');

// 4. Advanced option: hidden create tab falls back to gallery
document.body.classList.add('adv-no-avcreate');
window.avStudioTab('create');
ok(document.getElementById('avp-pane-gallery').style.display === '', 'adv-no-avcreate: create request lands on gallery');
document.body.classList.remove('adv-no-avcreate');

// 5. i18n keys present in every language file
const KEYS = ['avTabGallery','avTabCreate','avTabImport','avmRandom','avmMissing','avmUse',
  'avmGender','avmAge','avmGlasses','avmFemale','avmMale','avmYoung','avmAdult','avmSenior',
  'avmWith','avmWithout','avImportDrop','avImportOr','avImportBtn','avImportHint','advAvatarCreate'];
const langDir = path.join(PUB, 'modules/lang');
let langsOk = true;
for (const f of fs.readdirSync(langDir).filter(f => f.endsWith('.mjs'))) {
  const ls = fs.readFileSync(path.join(langDir, f), 'utf8');
  for (const k of KEYS) if (!ls.includes(k + ':')) { langsOk = false; console.log('    missing ' + k + ' in ' + f); }
}
ok(langsOk, 'all 21 keys present in all 36 language files');

console.log(fail === 0 ? 'ALL OK (' + pass + ')' : 'FAIL ' + fail + '/' + (pass + fail));
process.exit(fail === 0 ? 0 : 1);
