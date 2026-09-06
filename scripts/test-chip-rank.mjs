#!/usr/bin/env node
// Tests déterministes pour public/modules/game/stack-rank.mjs.
// Run: node scripts/test-chip-rank.mjs
//
// Périmètre : le CALCUL (rankRows), pur et injectable, puis la forme HTML du
// panneau (sans navigateur : DOM stub minimal) et le câblage dans le client.
globalThis.window = globalThis;
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } };
})();

// DOM stub : createElement rend un élément-mémoire suffisant pour _build().
function stubEl() {
  return {
    style: {}, children: [], _handlers: {},
    setAttribute() {}, getAttribute() { return null; },
    addEventListener(ev, fn) { (this._handlers[ev] = this._handlers[ev] || []).push(fn); },
    removeEventListener() {},
    querySelector() { return stubEl(); },
    querySelectorAll() { return []; },
    appendChild(c) { this.children.push(c); },
    closest() { return null; },
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html || ''; },
    offsetLeft: 0, offsetTop: 0,
  };
}
let _byId = {};
globalThis.document = {
  readyState: 'complete', addEventListener() {},
  getElementById: (id) => _byId[id] || null,
  createElement: () => stubEl(),
  querySelector: () => null, querySelectorAll: () => [],
  body: { appendChild(el) { if (el.id) _byId[el.id] = el; } },
};
globalThis.innerWidth = 1200; globalThis.innerHeight = 800;

const { rankRows, openChipRank, closeChipRank, renderChipRank } =
  await import('../public/modules/game/stack-rank.mjs');
const { S } = await import('../public/modules/game/state.mjs');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

const name = (pid) => 'P' + pid;
const st = (seats, seatData, myId) => ({ seats, seatData, myId });

// ── Tri : tapis + mise, pas le tapis seul ─────────────────────────────────
{
  const r = rankRows(st([1, 2], {
    1: { money: 900, bet: 0, active: true },
    2: { money: 700, bet: 300, active: true },   // 1000 au total
  }), name);
  ok(r.rows[0].pid === 2, 'la mise posée compte dans le classement (700+300 > 900)');
  ok(r.rows[0].total === 1000 && r.rows[1].total === 900, 'totaux tapis+mise corrects');
}

// ── Rangs sportifs : ex æquo partagés, rang suivant sauté ─────────────────
{
  const r = rankRows(st([1, 2, 3, 4], {
    1: { money: 500, bet: 0, active: true },
    2: { money: 800, bet: 0, active: true },
    3: { money: 800, bet: 0, active: true },
    4: { money: 200, bet: 0, active: true },
  }), name);
  const ranks = r.rows.map((x) => x.rank);
  ok(JSON.stringify(ranks) === '[1,1,3,4]', 'ex æquo 1,1,3,4 (classement sportif)');
}

// ── Hors jeu : sans rang, en fin de liste ─────────────────────────────────
{
  const r = rankRows(st([1, 2, 3, 4], {
    1: { money: 100, bet: 0, active: true },
    2: { money: 0, bet: 0, active: false },       // éliminé
    3: { money: 0, bet: 0, active: true, gone: true },  // parti
    4: { money: 900, bet: 0, active: true },
  }), name);
  ok(r.rows.length === 4, 'tout le monde est listé');
  ok(r.rows[2].state === 'out' && r.rows[3].state === 'out', 'les hors-jeu ferment la liste');
  ok(r.rows[2].rank === null && r.rows[3].rank === null, 'les hors-jeu ne portent pas de rang');
  ok(r.left === 2, 'left ne compte que les joueurs en course');
  ok(r.rows[0].rank === 1 && r.rows[0].pid === 4, 'le classement ne concerne que les vivants');
}

// ── États all-in / couché ─────────────────────────────────────────────────
{
  const r = rankRows(st([1, 2, 3], {
    1: { money: 0, bet: 600, active: true, action: 'All-in' },
    2: { money: 500, bet: 0, active: true, folded: true },
    3: { money: 400, bet: 0, active: true },
  }), name);
  const by = Object.fromEntries(r.rows.map((x) => [x.pid, x]));
  ok(by[1].state === 'allin', 'action All-in → état all-in');
  ok(by[2].state === 'folded', 'folded → état couché');
  ok(by[3].state === '', 'joueur ordinaire → aucun état');
  ok(by[1].rank === 1, 'un all-in reste classé (600 en jeu)');
}

// ── Agrégats : moyenne, total en jeu, part du leader ──────────────────────
{
  const r = rankRows(st([1, 2, 3], {
    1: { money: 600, bet: 0, active: true },
    2: { money: 300, bet: 0, active: true },
    3: { money: 0, bet: 0, active: false },
  }), name);
  ok(r.total === 900 && r.avg === 450, 'total et moyenne sur les seuls vivants');
  ok(r.rows[0].share === 1 && Math.abs(r.rows[1].share - 0.5) < 1e-9, 'part relative au leader');
}

// ── Robustesse : entrées absentes / invalides ─────────────────────────────
{
  ok(rankRows(null, name).rows.length === 0, 'état nul → liste vide, pas d’exception');
  const r = rankRows(st([1, 2], { 1: { money: 'x', bet: -5, active: true } }), name);
  ok(r.rows.length === 1 && r.rows[0].total === 0, 'valeurs invalides bornées à 0, siège sans données ignoré');
  ok(rankRows(st([], {}), name).avg === 0, 'moyenne 0 sans joueurs (pas de division par zéro)');
}

// ── Marquage « moi » ──────────────────────────────────────────────────────
{
  const r = rankRows(st([7, 8], {
    7: { money: 100, bet: 0, active: true },
    8: { money: 200, bet: 0, active: true },
  }, 7), name);
  ok(r.rows.find((x) => x.pid === 7).me === true && r.rows.find((x) => x.pid === 8).me === false, 'ma ligne est marquée');
}

// ── Panneau : rendu HTML (stub DOM) ───────────────────────────────────────
{
  S.seats = [1, 2];
  S.seatData = { 1: { money: 500, bet: 0, active: true }, 2: { money: 900, bet: 100, active: true } };
  S.myId = 1; S.players = { 1: 'Moi', 2: 'Léa' };
  openChipRank();
  const host = _byId['chiprank-win'];
  ok(!!host, 'openChipRank crée le panneau');
  // Le rendu écrit dans .crk-list via querySelector → on lui donne une cible.
  const list = stubEl(); const sub = stubEl();
  host.querySelector = (sel) => (sel === '.crk-list' ? list : sel === '.crk-sub' ? sub : stubEl());
  renderChipRank();
  ok(list.innerHTML.includes('crk-row'), 'des lignes sont rendues');
  ok(list.innerHTML.indexOf('Léa') < list.innerHTML.indexOf('Moi'), 'le plus gros tapis (1000) passe devant');
  ok(list.innerHTML.includes('class="crk-row me'), 'ma ligne porte la classe me');
  ok(sub.innerHTML.includes('2'), 'le sous-titre compte les joueurs en course');
  // Échappement : pseudo hostile confiné.
  S.players[2] = 'a"><img src=x>';
  renderChipRank();
  ok(!list.innerHTML.includes('<img src=x>'), 'pseudo échappé dans la liste');
  closeChipRank();
  ok(host.style.display === 'none', 'closeChipRank masque le panneau');
}

// ── Câblage dans le client (analyse de source) ────────────────────────────
{
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const rd = (p) => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');

  ok(/window\._chipRankSync/.test(rd('public/modules/game/seat-render.mjs')), 'seat-render rafraîchit le classement en fin de rendu');
  ok(/'#chiprank-win'/.test(rd('public/modules/ui/z-order.mjs')), 'le panneau est dans la bande z-order');
  ok(/\['chiprank-win',\s*'closeChipRank'\]/.test(rd('public/modules/ui/keynav.mjs')), 'Escape ferme le panneau (keynav)');
  const html = rd('public/pokerth-client.html');
  ok(/id="chiprank-btn-game"/.test(html) && /modules\/game\/stack-rank\.mjs/.test(html), 'bouton d’en-tête + module chargés');
  ok(/'\/modules\/game\/stack-rank\.mjs'/.test(rd('public/sw.js')), 'module dans le cache offline');
  ok(/chiprank-win[\s\S]{0,80}chiprank-btn-game/.test(rd('public/pokerth.js')), 'état actif du bouton câblé (_WIN_BTN)');
}

console.log(fail ? `FAIL ${fail}/${n}` : `PASS ${n}/${n}`);
process.exit(fail ? 1 : 0);
