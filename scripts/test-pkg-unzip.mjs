#!/usr/bin/env node
// Pack archives are unpacked in JS since web.343 (_unzipFlat in proxy.js): the
// Docker image's BusyBox unzip has no -Z to read sizes first (web.342 refused
// every pack there), and declared sizes can be forged. Checks: a real archive
// (folders, deflated + stored members) unpacks flat; a symlink member is not
// written; a zip bomb stops at the 200 MB budget even with a forged size;
// more than 400 entries is refused; garbage is refused.
// Run: node scripts/test-pkg-unzip.mjs   (~3 s; the zip CLI cases are skipped without `zip`)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let n = 0, fail = 0;
function ok(c, m) { n++; if (!c) { fail++; console.error('  ✗', m); } else console.log('  ✓', m); }
const js = fs.readFileSync(path.join(root, 'proxy.js'), 'utf8');
function grab(sig) { const s = js.indexOf(sig); if (s < 0) throw new Error('missing ' + sig); let i = js.indexOf('{', s), d = 0; for (; ; i++) { if (js[i] === '{') d++; else if (js[i] === '}' && !--d) return js.slice(s, i + 1); } }
const consts = js.slice(js.indexOf('const PKG_MAX_ENTRIES'), js.indexOf('\n', js.indexOf('const PKG_MAX_ENTRIES')));
const ctx = { fs, path, zlib, Buffer };
vm.runInNewContext(consts.replace(/^const /, 'var ') + '\n' + grab('function _unzipFlat(buf, exDir)') + '; this.U = _unzipFlat;', ctx);
ok(!/spawnSync\('unzip'/.test(js), 'importPackage no longer calls the system unzip');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pkgunzip-'));
const fresh = (name) => { const d = path.join(tmp, name); fs.mkdirSync(d); return d; };

// Hand-built archive: one central directory entry per member.
function makeZip(members) {
  const locals = [], cds = []; let off = 0;
  for (const m of members) {
    const name = Buffer.from(m.name);
    const data = m.method === 8 ? zlib.deflateRawSync(m.data) : m.data;
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(m.method, 8);
    lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(m.declared != null ? m.declared : m.data.length, 22); lh.writeUInt16LE(name.length, 26);
    const cd = Buffer.alloc(46); cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(0x0314, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(m.method, 10);
    cd.writeUInt32LE(data.length, 20); cd.writeUInt32LE(m.declared != null ? m.declared : m.data.length, 24); cd.writeUInt16LE(name.length, 28);
    cd.writeUInt32LE(((m.mode || 0o100644) << 16) >>> 0, 38); cd.writeUInt32LE(off, 42);
    locals.push(lh, name, data); cds.push(cd, name); off += 30 + name.length + data.length;
  }
  const cdBuf = Buffer.concat(cds);
  const e = Buffer.alloc(22); e.writeUInt32LE(0x06054b50, 0); e.writeUInt16LE(members.length, 8); e.writeUInt16LE(members.length, 10);
  e.writeUInt32LE(cdBuf.length, 12); e.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cdBuf, e]);
}

let d = fresh('a');
let err = ctx.U(makeZip([{ name: 'deck/0.png', method: 8, data: Buffer.from('PNGDATA'.repeat(50)) }, { name: 'deck/', method: 0, data: Buffer.alloc(0), mode: 0o40755 }, { name: 'flipside.svg', method: 0, data: Buffer.from('<svg/>') }]), d);
ok(err === null && fs.readFileSync(path.join(d, '0.png'), 'utf8') === 'PNGDATA'.repeat(50) && fs.readFileSync(path.join(d, 'flipside.svg'), 'utf8') === '<svg/>', 'deflated and stored members unpacked flat (folders dropped)');
d = fresh('b');
err = ctx.U(makeZip([{ name: 'felt.png', method: 0, data: Buffer.from('/etc/passwd'), mode: 0o120777 }, { name: '../../x.png', method: 0, data: Buffer.from('x') }]), d);
ok(err === null && fs.readdirSync(d).join() === 'x.png' && !fs.lstatSync(path.join(d, 'x.png')).isSymbolicLink(), 'symlink member not written; « ../../x.png » lands as x.png inside the folder');
d = fresh('c');
err = ctx.U(makeZip([{ name: 'bomb.png', method: 8, data: Buffer.alloc(260 * 1024 * 1024), declared: 1000 }]), d);
ok(/too large/.test(err || '') && fs.readdirSync(d).length === 0, 'zip bomb with a forged size: stopped at the budget, nothing written (' + err + ')');
d = fresh('d');
err = ctx.U(makeZip(Array.from({ length: 401 }, (_, i) => ({ name: i + '.png', method: 0, data: Buffer.from('x') }))), d);
ok(/too large/.test(err || ''), 'more than 400 entries: refused');
ok(/not a valid/.test(ctx.U(Buffer.from('not a zip at all, just text'), fresh('e')) || ''), 'garbage: refused');

if (spawnSync('zip', ['-v'], { stdio: 'ignore' }).status === 0) {
  const src = fresh('src'); fs.mkdirSync(path.join(src, 'pack')); fs.writeFileSync(path.join(src, 'pack', 'felt.png'), Buffer.alloc(5000, 7)); fs.writeFileSync(path.join(src, 'pack', 'info.json'), '{"name":"Test"}');
  spawnSync('zip', ['-qr', path.join(tmp, 'real.zip'), 'pack'], { cwd: src });
  spawnSync('zip', ['-q', '-fd', path.join(tmp, 'stream.zip'), 'felt.png'], { cwd: path.join(src, 'pack') });
  d = fresh('f');
  err = ctx.U(fs.readFileSync(path.join(tmp, 'real.zip')), d);
  ok(err === null && fs.readFileSync(path.join(d, 'felt.png')).equals(Buffer.alloc(5000, 7)) && fs.existsSync(path.join(d, 'info.json')), 'an archive made by `zip -r` unpacks like unzip -j');
  d = fresh('g');
  err = ctx.U(fs.readFileSync(path.join(tmp, 'stream.zip')), d);
  ok(err === null && fs.readFileSync(path.join(d, 'felt.png')).equals(Buffer.alloc(5000, 7)), 'an archive with data descriptors (zip -fd) unpacks too');
} else console.log('  · zip unavailable here: CLI-built archives skipped');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? 'FAIL ' + fail + '/' + n : 'OK ' + n + '/' + n);
process.exit(fail ? 1 : 0);
