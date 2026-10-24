#!/usr/bin/env node
// The « Create a table » form and the tournament director share one source
// for their lists and limits (public/modules/create-presets.mjs). Checks that
// the form's min/max are those limits, that the styles and the community
// templates are no longer written anywhere else, and that the module is
// loaded (before pokerth.js) and precached.
// Run: node scripts/test-create-presets.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { LIMITS, STYLES, TEMPLATES } from '../public/modules/create-presets.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(path.join(root, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ✓ ' + l); } else { fail++; console.log('  ✗ ' + l); } };

const html = read('public/pokerth-client.html');
const attr = (id) => { const m = new RegExp('<input id="' + id + '"[^>]*>').exec(html); if (!m) return null; const g = (a) => { const x = new RegExp(' ' + a + '="(\\d+)"').exec(m[0]); return x ? Number(x[1]) : null; }; return { min: g('min'), max: g('max'), step: g('step') }; };
for (const [id, k] of [['cf-players', 'players'], ['cf-stack', 'stack'], ['cf-blind', 'blind'], ['cf-raise-every', 'raiseEvery'], ['cf-timeout', 'timeout'], ['cf-delay', 'delay'], ['cf-mb-val', 'blindValue'], ['cf-end-raise-val', 'endRaiseValue']]) {
  const a = attr(id);
  ok(a && a.min === LIMITS[k].min && a.max === LIMITS[k].max && (!LIMITS[k].step || a.step === LIMITS[k].step), id + ': min/max as LIMITS.' + k + ' (' + (a ? a.min + '–' + a.max : 'missing') + ')');
}
for (const s of STYLES) ok(new RegExp('data-preset="' + s.id + '"').test(html), 'style « ' + s.name + ' » has its button on the form');
const opts = [...html.matchAll(/<select id="cf-vorlage"[\s\S]*?<\/select>/g)][0][0];
ok(TEMPLATES.every((t, i) => new RegExp('<option value="' + (i + 1) + '">' + t.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</option>').test(opts)), 'community templates: the form\'s list in the same order');
const js = read('public/pokerth.js');
ok(!/tranquille:\s*\{\s*stack/.test(js) && /window\._createPresets\.style\(name\)/.test(js), 'pokerth.js reads the styles from the shared module');
const bs = read('public/modules/ui/botsuggest.mjs');
ok(/import \{ TEMPLATES \} from '\.\.\/create-presets\.mjs'/.test(bs) && !/startCash:\s*3000/.test(bs), 'botsuggest.mjs reads the templates from the shared module');
const iP = html.indexOf('src="modules/create-presets.mjs"'), iJ = html.indexOf('src="pokerth.js"');
ok(iP > 0 && iJ > iP, 'the module is loaded before pokerth.js');
ok(read('public/sw.js').includes("'/modules/create-presets.mjs'"), 'precached by the service worker');
ok(read('arena/lib/table.mjs').includes("'../../public/modules/create-presets.mjs'"), 'the tournament director reads the same file');
console.log((fail ? 'FAIL ' : 'OK ') + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
