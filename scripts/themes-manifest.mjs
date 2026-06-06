// Scans public/themes/<id>/theme.json -> public/themes/themes.json
// A theme package = { name, swatch, felt?, tokens:{...} } + optional felt image.
import { readdirSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'public', 'themes');
const OUT = join(DIR, 'themes.json');
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
      if (!cfg || !cfg.tokens || typeof cfg.tokens !== 'object') continue;
      const entry = { id: name, name: cfg.name || name, swatch: cfg.swatch || '#444444', tokens: cfg.tokens };
      if (cfg.felt && existsSync(join(dir, cfg.felt))) entry.felt = cfg.felt;
      out.push(entry);
    }
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log('themes.json:', out.length, 'theme(s)');
}
main();
