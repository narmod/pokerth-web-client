// Scans public/themes/<id>/theme.json -> public/themes/themes.json
// A package may declare any of: palette, table, felt, buttons (colour tokens),
// buttonImages (9-slice action-button images), pucks (dealer/SB/BB images).
import { readdirSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'public', 'themes');
const OUT = join(DIR, 'themes.json');
function imgSet(dir, obj, keys) {
  const o = {};
  for (const k of keys) if (obj[k] && existsSync(join(dir, obj[k]))) o[k] = obj[k];
  return Object.keys(o).length ? o : null;
}
function main() {
  const out = [];
  if (existsSync(DIR)) {
    for (const name of readdirSync(DIR).sort()) {
      const dir = join(DIR, name);
      let st; try { st = statSync(dir); } catch { continue; }
      if (!st.isDirectory()) continue;
      const cfgPath = join(dir, 'theme.json');
      if (!existsSync(cfgPath)) continue;
      let cfg; try { cfg = JSON.parse(readFileSync(cfgPath, 'utf8')); } catch { continue; }
      if (!cfg) continue;
      const e = { id: name, name: cfg.name || name, swatch: cfg.swatch || '#444444' };
      if (cfg.felt && existsSync(join(dir, cfg.felt))) e.felt = cfg.felt;
      if (cfg.palette && typeof cfg.palette === 'object') e.palette = cfg.palette;
      if (cfg.table && typeof cfg.table === 'object') e.table = cfg.table;
      if (cfg.buttons && typeof cfg.buttons === 'object') e.buttons = cfg.buttons;
      if (cfg.buttonImages && typeof cfg.buttonImages === 'object') {
        const bi = imgSet(dir, cfg.buttonImages, ['fold', 'check', 'call', 'raise', 'allin']);
        if (bi) e.buttonImages = bi;
      }
      if (cfg.pucks && typeof cfg.pucks === 'object') {
        const pk = imgSet(dir, cfg.pucks, ['dealer', 'sb', 'bb']);
        if (pk) e.pucks = pk;
      }
      if (e.palette || e.table || e.felt || e.buttons || e.buttonImages || e.pucks) out.push(e);
    }
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log('themes.json:', out.length, 'theme(s)');
}
main();
