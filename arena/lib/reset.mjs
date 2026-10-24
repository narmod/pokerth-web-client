// ═══════════════════════════════════════════════════════════════════
// Arena — start again from zero (service 0.22.0, 2026-10-24).
//
// The super admin (the master key) only, on /arena/organize › Reset: takes
// away, in one go, any of
//   watches      the Table check watches (journals, results, logs)
//   tournaments  every tournament, with its tables, players, results,
//                journals and witnesses
//   cups         every cup and its standings
//   images       the images organizers added (the shipped ones stay)
// Nothing is thrown away: it all moves to <dir>/reset-<date>/ (one folder per
// reset), where it can be fetched back by hand on the server.
//
// What is kept is never left broken: when tournaments stay, the watches
// their results came from stay too; when tournaments or cups stay, the
// images they show stay too. Medals follow by themselves (derived from the
// results). Accounts, the install key and the module settings never move.
// Refused while a table it would take is still open or watched: stop it first.
// Each reset is a line of <dir>/resets.jsonl.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';

export const RESET_PARTS = Object.freeze(['watches', 'tournaments', 'cups', 'images']);
export const RESET_CONFIRM = 'RESET';
const ID_RE = /^[a-z0-9]{6,32}$/;   // a watch (manager.mjs)
const IMG_FILE_RE = /^(u[0-9a-f]{6,32})(\.t)?\.jpg$/;

/**
 * o: { dir, watches: () => [{ id, status, tournamentId, gameName }], live: string[],
 *      tournaments: () => [tournament], cups: () => [cup], now? }
 */
export function createReset(o) {
  const dir = o.dir;
  const now = o.now || (() => Date.now());
  const Refusal = o.Refusal || class extends Error {};
  const refuse = (m) => { throw new Refusal(m); };
  const live = (s) => (o.live || []).indexOf(s) >= 0;
  let count = 0;   // resets done by this process: part of the medals' stamp

  const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };
  const ls = (d) => { try { return fs.readdirSync(d); } catch (e) { return []; } };
  const imgDir = path.join(dir, 'images');
  const imgIndex = () => { const a = readJson(path.join(imgDir, 'images.json')); return Array.isArray(a) ? a : []; };

  // What would go and what would stay, for a set of parts.
  function plan(parts) {
    const want = (p) => parts.indexOf(p) >= 0;
    const ts = o.tournaments(), cs = o.cups(), ws = o.watches();
    const keptT = want('tournaments') ? [] : ts;
    const keptC = want('cups') ? [] : cs;
    // Watches a kept tournament stands on (its table, its result, a stage).
    const tIds = new Set(keptT.map((t) => t.id));
    const usedW = new Set();
    for (const t of keptT) {
      if (t.host && t.host.watchId) usedW.add(t.host.watchId);
      if (t.result && t.result.watchId) usedW.add(t.result.watchId);
    }
    for (const w of ws) if (w.tournamentId && tIds.has(w.tournamentId)) usedW.add(w.id);
    const goW = want('watches') ? ws.filter((w) => !usedW.has(w.id)) : [];
    // Images a kept tournament or cup shows.
    const usedI = new Set(keptT.concat(keptC).map((x) => x.image).filter(Boolean));
    const imgs = imgIndex();
    const goI = want('images') ? imgs.filter((x) => !usedI.has(x.id)) : [];
    // What is still running among what would go.
    const busy = [];
    for (const w of goW) if (live(w.status)) busy.push('the Table check of « ' + (w.gameName || w.id) + ' »');
    if (want('tournaments')) {
      for (const t of ts) if (t.host && t.host.status === 'open') busy.push('the table of « ' + t.name + ' »');
      for (const w of ws) if (w.tournamentId && live(w.status) && !goW.some((g) => g.id === w.id)) busy.push('the table watched for a tournament (' + (w.gameName || w.id) + ')');
    }
    return {
      go: { watches: goW, tournaments: want('tournaments') ? ts : [], cups: want('cups') ? cs : [], images: goI },
      kept: { watches: ws.length - goW.length, tournaments: keptT.length, cups: keptC.length, images: imgs.length - goI.length },
      busy,
    };
  }

  function archives() {
    return ls(dir).filter((n) => /^reset-\d{8}-\d{6}(-\d+)?$/.test(n)).sort().reverse().slice(0, 20);
  }
  function summary() {
    const ts = o.tournaments(), cs = o.cups(), ws = o.watches();
    const p = plan(RESET_PARTS.slice());
    const last = ls(dir).indexOf('resets.jsonl') >= 0
      ? (fs.readFileSync(path.join(dir, 'resets.jsonl'), 'utf8').trim().split('\n').filter(Boolean).slice(-1).map((l) => { try { return JSON.parse(l); } catch (e) { return null; } })[0] || null)
      : null;
    return {
      counts: { watches: ws.length, tournaments: ts.filter((t) => !t.parentId).length, tables: ts.filter((t) => t.parentId).length, cups: cs.length, images: imgIndex().length },
      running: p.busy, archives: archives(), last, parts: RESET_PARTS, confirm: RESET_CONFIRM,
    };
  }

  function stampName() {
    const d = new Date(now());
    const z = (n) => String(n).padStart(2, '0');
    const base = 'reset-' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
    let name = base, i = 1;
    while (fs.existsSync(path.join(dir, name))) name = base + '-' + (++i);
    return name;
  }
  const move = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.renameSync(from, to); };

  function run(input, by) {
    const parts = Array.isArray(input && input.parts) ? RESET_PARTS.filter((p) => input.parts.indexOf(p) >= 0) : [];
    if (!parts.length) refuse('pick what to take away');
    if (String((input && input.confirm) || '').trim() !== RESET_CONFIRM) refuse('type ' + RESET_CONFIRM + ' to confirm');
    const p = plan(parts);
    if (p.busy.length) refuse('still running: ' + p.busy.join(', ') + '. Stop or close it first.');
    const name = stampName();
    const arc = path.join(dir, name);
    fs.mkdirSync(arc, { recursive: true });
    const done = { watches: 0, tournaments: 0, cups: 0, images: 0 };
    // Tournaments and cups: their whole folder (tables, deletion logs) goes.
    for (const part of ['tournaments', 'cups']) {
      if (parts.indexOf(part) < 0) continue;
      const src = path.join(dir, part);
      if (fs.existsSync(src)) move(src, path.join(arc, part));
      done[part] = p.go[part].filter((x) => !x.parentId).length;
    }
    for (const w of p.go.watches) {
      if (!ID_RE.test(w.id)) continue;
      const src = path.join(dir, 'watches', w.id);
      if (fs.existsSync(src)) { move(src, path.join(arc, 'watches', w.id)); done.watches++; }
    }
    if (p.go.images.length) {
      const gone = new Set(p.go.images.map((x) => x.id));
      for (const f of ls(imgDir)) {
        const m = IMG_FILE_RE.exec(f);
        if (m && gone.has(m[1])) move(path.join(imgDir, f), path.join(arc, 'images', f));
      }
      const idx = path.join(imgDir, 'images.json');
      fs.mkdirSync(path.join(arc, 'images'), { recursive: true });
      try { fs.copyFileSync(idx, path.join(arc, 'images', 'images.json')); } catch (e) {}
      const tmp = idx + '.' + process.pid + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(imgIndex().filter((x) => !gone.has(x.id))));
      fs.renameSync(tmp, idx);
      done.images = gone.size;
    }
    count++;
    const line = { at: now(), by: by || 'admin', parts, done, kept: p.kept, archive: name };
    fs.appendFileSync(path.join(dir, 'resets.jsonl'), JSON.stringify(line) + '\n');
    return line;
  }

  return { summary, run, plan, count: () => count };
}
