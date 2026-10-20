#!/usr/bin/env node
// Statistics filters, maquette A (2.1.10-web.140): a summary bar on every
// section and one Filters panel (a drawer, a bottom sheet on a phone).
// Run: node scripts/test-admin-filters.mjs
//
// The controls moved into the panel with their ids and handlers, so what is
// guarded here is the new shell: what the bar says, the pills that undo a
// filter, the panel's way in and out, and the mode colours.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const admin = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'admin.html'), 'utf8');
let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }
function body(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}
const bar = admin.slice(admin.indexOf('<section class="card trafhead statbar"'), admin.indexOf('<div class="fsheet"'));
const sheet = admin.slice(admin.indexOf('<div class="fsheet"'), admin.indexOf('</section>', admin.indexOf('<div class="fsheet"')));

// ── The bar ───────────────────────────────────────────────────────────────
ok(/id="fsPer"[^>]*aria-haspopup="dialog"/.test(bar) && /id="fsPerLab"/.test(bar), 'the period, as a button that opens the panel');
ok(/id="btnTrafRefresh"[^>]*aria-label="Refresh"/.test(bar), 'Refresh beside it, an icon with its name');
ok(/id="fsOpen"[^>]*aria-controls="fsSheet" aria-expanded="false"/.test(bar) && /id="fsCount" hidden/.test(bar), 'Filters, with a count shown only when something is on');
ok(/id="fsChips"/.test(bar) && /id="trafRange" class="headnote fsmeta"/.test(bar), 'the active filters as pills, then the dates read');
const paint = body(admin, '_fsPaint');
ok(/_trafModeSel\.length<MODE48\.length/.test(paint) && /NARROW_DIMS\.forEach/.test(paint) && /if\(_trafBots\) pills\.push/.test(paint),
  'a pill per active filter: entry modes, each narrowing, bots shown');
ok(/data-fsrm="'\+p\.k\+'" aria-label="Remove '/.test(paint), 'each pill has a remove button that says what it removes');
ok(/n\.hidden=!pills\.length/.test(paint), 'the count is the number of pills');
ok(/typeof _trafModeSel!=='undefined'/.test(paint) && /typeof _narrow==='object'/.test(paint), 'safe to paint before every filter is set up');
for (const f of ['_paintPeriod', '_paintBots', '_paintModeSel', '_paintNarrow']) ok(/_fsPaint\(\);/.test(body(admin, f)), f + ' repaints the bar');

// ── The panel ─────────────────────────────────────────────────────────────
ok(/class="fspanel" role="dialog" aria-modal="true" aria-labelledby="fsTitle"/.test(sheet), 'a modal dialog with a title');
ok(/id="fsSeg" role="group" aria-label="Period">(<button type="button" data-per="(1|7|14|30|60|90)">[^<]+<\/button>){6}<\/div>/.test(sheet), 'the six periods as one segmented control');
ok(/<select id="trafPeriod" class="use" tabindex="-1" aria-hidden="true"/.test(sheet), 'the period list stays as the one place the period is set, out of the way');
ok(/id="fsCustom"/.test(sheet) && /id="trafRangeBox" hidden/.test(sheet), 'Custom range opens the two dates');
for (const id of ['trafModeSel', 'trafBots', 'trafXpl', 'trafNarrow', 'trafNarrowPop', 'fsReset']) ok(sheet.includes('id="' + id + '"'), id + ' is in the panel');
ok(/class="fsgo" data-fsclose="1">Show results</.test(sheet) && /class="fsscrim" data-fsclose="1"/.test(sheet) && /class="fsx" data-fsclose="1" aria-label="Close"/.test(sheet),
  'Show results, the backdrop and × close it');
ok(/if\(e\.key==='Escape'\)\{ if\(_narrowOpen\) return;/.test(admin) && /\},true\);/.test(admin), 'Escape closes it, after an open Narrow list (capture)');
ok(/if\(e\.key==='Tab'\)/.test(admin) && /z\.focus\(\)/.test(admin), 'Tab stays inside');
ok(/try\{ if\(back\) back\.focus\(\); \}/.test(admin), 'and focus goes back to what opened it');
ok(/document\.body\.classList\.add\('fs-lock'\)/.test(admin) && /body\.fs-lock\{overflow:hidden\}/.test(admin), 'the page behind does not scroll');
ok(!/classList\.add\('fsopen'\)/.test(admin), 'the lock class is not the button class (it gave the page the button font)');
ok(/@media\(max-width:600px\)\{\n    \.fspanel\{top:auto;left:0;width:auto;height:92%/.test(admin), 'on a phone the panel rises from the bottom');
ok(/pop\.scrollIntoView\(\{block:'nearest'\}\)/.test(admin), 'a Narrow list opened in the panel comes into view');
const reset = admin.slice(admin.indexOf("var rs=$('fsReset')"), admin.indexOf("var chips=$('fsChips')"));
ok(/_trafPeriod=14/.test(reset) && /_trafBots=false/.test(reset) && /_narrow=\{\}/.test(reset) && /MODE48\.map/.test(reset) && /loadTraffic\(\);/.test(reset),
  'Reset: 14 days, every mode, bots hidden, nothing narrowed — one reload');

// ── Mode colours (narmod, web.140) ────────────────────────────────────────
ok(/--m-net:#3DBE86;--m-lan:#E8A93B;--m-off:#B48AE8;--m-live:#5AA3F0;--m-all:#E879A6;/.test(admin), 'dark: Internet green, Live/spectator tool blue, all modes rose');
ok(/--m-net:#1F8F5F;--m-lan:#B9770E;--m-off:#7A4FC0;--m-live:#2F6FC4;--m-all:#B83E78;/.test(admin), 'light: the same, darker');
ok(/data-mk="all"[\s\S]{0,120}style="--mc:var\(--m-all\)"/.test(body(admin, '_paintModeSel')) && /All modes/.test(body(admin, '_paintModeSel')), 'the All modes tile wears the total colour');
ok(/<span class="nrk">'\+x\[1\]\+'<span class="fsvh">: <\/span><\/span><span class="nrv">/.test(admin), 'a Narrow row still reads « Country: all » to a screen reader');

// ── The entry-mode filter reaches every figure split by mode (audit 2026-10-20, B3)
const act = body(admin, '_tsActivity'), m48 = body(admin, '_trafModes48'), pick = body(admin, '_pickMode');
ok(/on=_modesOn\(\); on\.forEach\(function\(md\)\{ cn\+=m\[md\.k\]\|\|0; \}\);/.test(act) && /_modesAll\(\)\?'every entry mode':on\.map/.test(act),
  'Activity › Connections today counts the modes picked and names them');
ok(/_tsActivity\(_trafLastD\)/.test(pick), 'and is drawn again when the modes change');
ok(!/\(all modes\)/.test(m48) && /'% of '\+all\.toLocaleString\(\)\+' across every mode'/.test(m48),
  'the 48 h note gives the sessions of the modes on show and their share, not every mode as if unfiltered');
ok(/return \(n&&_modeOn\(x\.k\)\)\?'<i style="display:block;width:'\+\(100\*n\/mt\)/.test(admin) && /'Sessions in the modes picked, out of every mode'/.test(admin),
  'the Countries list bars keep the modes picked, out of every mode');

// ── A filter a page does not use is greyed there, not hidden (audit 2026-10-20, B4)
ok(/var FS_PAGES=\{mode:\['world','activity'\], nd:\['world'\]\}, _trafCur='overview';/.test(admin),
  'entry modes act on World and Activity, Narrow on World; bots everywhere (no entry)');
ok(/_trafCur=k; _fsPaint\(\);/.test(body(admin, '_trafSub')), 'changing page repaints the pills');
const fsp = body(admin, '_fsPaint');
ok(/class="fspill'\+\(u\?'':' off'\)\+'"/.test(fsp) && /\(not used on this page\)/.test(fsp) && /data-fsrm="'\+p\.k\+'"/.test(fsp),
  'a pill not used here is greyed, says so to a screen reader, and can still be removed');
ok(/'not used on this page<\/span>'/.test(fsp) && /\.fspill\.off\{background:transparent;color:var\(--muted\)/.test(admin),
  'with one visible line saying what greyed means');

// ── Narrow: the list opens under its row; « Unknown » not centred (audit 2026-10-20, S8)
ok(/var chip=pop\.closest\('\.fsheet'\) && \$\('trafNarrow'\)\.querySelector\('\[data-nd="'\+dim\+'"\]'\);\n\s+if\(chip && chip\.nextSibling!==pop\) chip\.parentNode\.insertBefore\(pop, chip\.nextSibling\);/.test(body(admin, '_paintNarrowPop')),
  'in the Filters panel the list opens right under the row tapped');
ok(/var pop0=\$\('trafNarrowPop'\); if\(pop0 && box\.contains\(pop0\)\) box\.parentNode\.appendChild\(pop0\);\n\s+box\.innerHTML=NARROW_DIMS\.map/.test(body(admin, '_paintNarrow')),
  'and goes back home before the rows are drawn again, so it is never wiped with them');
ok(/\.nrlist label span\.ckf\{flex:none\}/.test(admin), 'the empty flag slot of « Unknown » no longer takes half the row');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
