#!/usr/bin/env node
// Tests of the table settings (service 0.16.0): the same lists and limits as
// the web client's « Create a table » form (public/modules/create-presets.mjs),
// kept inside what the game server accepts; styles and community templates
// (with their manual blinds order) as table settings; the table the director
// asks the server for; the organizer route that serves the lists.
// Run: node tournament/test/test-td-table.mjs
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import * as pb from '../../public/proto/pokerth-bundle.mjs';
import { LIMITS, STYLES, TEMPLATES, createPresets } from '../../public/modules/create-presets.mjs';
import { cleanTable, presetTable, TABLE_DEFAULTS } from '../lib/table.mjs';
import { gameInfoFor } from '../lib/host.mjs';
import { createService } from '../lib/service.mjs';
import { generateKeys } from '../lib/journal.mjs';

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('FAIL ' + label); fails++; }
  else console.log('ok   ' + label);
}

// ── limits: the server's (netpacketvalidator ValidateGameInfo) ─────
ok(LIMITS.players.min === 2 && LIMITS.players.max === 10 && LIMITS.delay.min === 5 && LIMITS.delay.max === 20 && LIMITS.timeout.max <= 60 &&
   LIMITS.blind.max <= 20000 && LIMITS.stack.max <= 1000000 && LIMITS.raiseEvery.max <= 1000 && LIMITS.manualBlinds.max <= 30 &&
   LIMITS.blindValue.max <= 1000000 && LIMITS.endRaiseValue.max <= 1000000, 'the shared limits stay inside what the server accepts');
const n = STYLES.find((s) => s.id === 'normal');
ok(TABLE_DEFAULTS.startMoney === n.stack && TABLE_DEFAULTS.actionTimeout === n.timeout && TABLE_DEFAULTS.raiseEvery === n.raiseEvery && TABLE_DEFAULTS.preset === 'style:normal', 'defaults: the web client\'s « Normal » style');
{
  const old = cleanTable({ startMoney: 500, firstSmallBlind: 1, actionTimeout: 120, delayBetweenHands: 3, raiseEvery: 5000 });
  ok(old.startMoney === LIMITS.stack.min || old.startMoney === TABLE_DEFAULTS.startMoney, 'stack under the form\'s minimum: not kept');
  const stored = cleanTable({}, { startMoney: 3000, firstSmallBlind: 10, actionTimeout: 120, delayBetweenHands: 3, raiseEvery: 7 });
  ok(stored.actionTimeout === 60 && stored.delayBetweenHands === 5, 'a table stored with the old limits (120 s, 3 s) is brought inside (60 s, 5 s)');
  const gi = gameInfoFor({ startMoney: 3000, firstSmallBlind: 10, actionTimeout: 120, delayBetweenHands: 3 }, 'T', 6);
  ok(gi.playerActionTimeout === 60 && gi.delayBetweenHands === 5, 'and the director never asks the server for more');
}
// ── styles and templates ───────────────────────────────────────────
{
  const bbc = cleanTable(presetTable('style:bbc'));
  ok(bbc.raiseMode === 'minutes' && bbc.raiseEvery === 5 && bbc.startMoney === 5000 && bbc.preset === 'style:bbc', 'style « BBC »: 5000, raise every 5 minutes');
  const s1 = cleanTable(presetTable('template:BBC Step 1'));
  const tpl = TEMPLATES.find((x) => x.name === 'BBC Step 1');
  ok(s1.manualBlinds.join(',') === tpl.blinds.join(',') && s1.firstSmallBlind === 15 && s1.delayBetweenHands === 7 && s1.preset === 'template:BBC Step 1', 'template « BBC Step 1 »: its 30 manual blinds, SB 15, 7 s between hands');
  const changed = cleanTable(Object.assign({}, s1, { actionTimeout: 15 }));
  ok(changed.preset === null, 'a value changed by hand: no longer the template');
  const mb = cleanTable({ manualBlinds: [80, 40, 40, 60, 0, 2000000], endRaiseMode: 'value', endRaiseValue: 500 });
  ok(mb.manualBlinds.join(',') === '40,60,80' && mb.endRaiseMode === 'value' && mb.endRaiseValue === 500, 'manual blinds: sorted, no duplicates, inside the limits; then « raise by »');
  ok(cleanTable({ manualBlinds: Array.from({ length: 40 }, (_, i) => 20 + i * 10) }).manualBlinds.length === 30, 'at most 30 levels (the server\'s limit)');
  ok(cleanTable({ endRaiseMode: 'keep' }).endRaiseMode === 'double', 'without a manual list, blinds double (as on the form)');
  const gi = gameInfoFor(s1, 'Step', 10);
  const back = pb.NetGameInfo.decode(pb.NetGameInfo.encode(pb.NetGameInfo.create(gi)).finish());
  ok(back.manualBlinds.join(',') === tpl.blinds.join(',') && back.raiseIntervalMode === 2 && back.raiseEveryMinutes === 5, 'the table asked for carries the manual blinds order (field 14), raise by time');
}
// ── the organizer route: the web client's lists, as they are ───────
{
  const dir = mkdtempSync(join(tmpdir(), 'td-tbl-'));
  writeFileSync(join(dir, 'td-key.pem'), generateKeys().privateKeyPem);
  const svc = createService({ dir, adminToken: 'master', version: '0.0.0', clientVersion: () => '2.1.10-web.313', sweepMs: 600000, servers: async () => [] });
  const srv = http.createServer(svc.handler);
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const A = { Authorization: 'Bearer master', 'Content-Type': 'application/json' };
  const d = await (await fetch(base + '/admin/tournaments/table-presets', { headers: A })).json();
  const want = JSON.parse(JSON.stringify(createPresets()));
  ok(d.ok && JSON.stringify(d.styles) === JSON.stringify(want.styles) && JSON.stringify(d.templates) === JSON.stringify(want.templates) && JSON.stringify(d.limits) === JSON.stringify(want.limits) && d.defaults.preset === 'style:normal', 'GET /admin/tournaments/table-presets: the web client\'s styles, templates and limits');
  ok((await fetch(base + '/admin/tournaments/table-presets')).status === 403, 'organizers only');
  const t = await (await fetch(base + '/admin/tournaments/t/create', { method: 'POST', headers: A, body: JSON.stringify({ name: 'Step night', profile: 'club', table: presetTable('template:BBC Step 2') }) })).json();
  ok(t.ok && t.table.preset === 'template:BBC Step 2' && t.table.manualBlinds.length === 30 && t.table.startMoney === 4000, 'a tournament created from a template keeps its settings and its name');
  svc.close(); srv.close();
  rmSync(dir, { recursive: true, force: true });
}
console.log(fails ? `\n${fails} FAILED` : '\nall td-table tests passed');
process.exit(fails ? 1 : 0);
