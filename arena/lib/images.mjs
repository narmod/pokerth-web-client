// ═══════════════════════════════════════════════════════════════════
// Tournament director — images of tournaments and cups (service 0.17.0).
//
// A small library: two images shipped with the service (public/img/events/:
// « tournament », the default of a tournament, and « cup », the default of a
// cup), plus the ones organizers add (ARENA_DIR/images/). Each image comes in
// two JPEGs, made in the organizer's browser: the picture (800 px at most on
// its longer side) and a thumbnail (192 px). Shown at the top of a
// tournament's or cup's page, on the cards of the players' page and as the
// picture of a shared link (og:image). Images are added, never replaced: an
// id always shows the same picture.
// ═══════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const IMG_RE = /^[a-z0-9_-]{1,40}$/;
export const BUILTIN = Object.freeze([
  { id: 'tournament', name: 'Tournament' },
  { id: 'cup', name: 'Cup' },
]);
export const DEFAULT_IMAGE = Object.freeze({ tournament: 'tournament', cup: 'cup' });
const MAX_FULL = 400 * 1024, MAX_THUMB = 48 * 1024, MAX_IMAGES = 200;
const isJpeg = (b) => b && b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
// Pixel size from the JPEG's frame header (SOF0–SOF15, not DHT/JPG/DAC).
export function jpegSize(b) {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
export const imageUrl = (id, thumb) => '/arena/img/' + id + (thumb ? '.t' : '') + '.jpg';

export function createImages(o) {
  const dir = path.join(o.dir, 'images');
  const builtinDir = o.builtinDir;
  const indexFile = path.join(dir, 'images.json');
  const now = o.now || (() => Date.now());
  const readIndex = () => { try { const a = JSON.parse(fs.readFileSync(indexFile, 'utf8')); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  const isBuiltin = (id) => BUILTIN.some((x) => x.id === id);

  function has(id) { return typeof id === 'string' && IMG_RE.test(id) && (isBuiltin(id) || readIndex().some((x) => x.id === id)); }
  function list() {
    return BUILTIN.map((x) => ({ id: x.id, name: x.name, builtin: true }))
      .concat(readIndex().map((x) => ({ id: x.id, name: x.name, builtin: false, by: x.by || null, at: x.at || null })))
      .map((x) => Object.assign(x, { url: imageUrl(x.id), thumb: imageUrl(x.id, true) }));
  }
  function file(id, thumb) {
    if (!has(id)) return null;
    const f = path.join(isBuiltin(id) ? builtinDir : dir, id + (thumb ? '.t' : '') + '.jpg');
    try { return fs.readFileSync(f); } catch (e) { return null; }
  }
  // { name, full: base64 JPEG, thumb: base64 JPEG }
  function add(input, by) {
    const name = String((input && input.name) || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40);
    if (name.length < 2) return { ok: false, error: 'name: 2 to 40 characters' };
    const full = Buffer.from(String((input && input.full) || ''), 'base64');
    const thumb = Buffer.from(String((input && input.thumb) || ''), 'base64');
    if (!isJpeg(full) || full.length > MAX_FULL) return { ok: false, error: 'the picture: a JPEG of 400 KB at most' };
    if (!isJpeg(thumb) || thumb.length > MAX_THUMB) return { ok: false, error: 'the thumbnail: a JPEG of 48 KB at most' };
    const sf = jpegSize(full), st = jpegSize(thumb);
    if (!sf || Math.max(sf.w, sf.h) > 1600 || !st || Math.max(st.w, st.h) > 400) return { ok: false, error: 'image too large (1600 px at most, thumbnail 400 px)' };
    const idx = readIndex();
    if (idx.length >= MAX_IMAGES) return { ok: false, error: 'the library is full (' + MAX_IMAGES + ' images)' };
    const id = 'u' + crypto.randomBytes(5).toString('hex');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, id + '.jpg'), full);
    fs.writeFileSync(path.join(dir, id + '.t.jpg'), thumb);
    idx.push({ id, name, by: by ? String(by).slice(0, 64) : null, at: now() });
    const tmp = indexFile + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(idx)); fs.renameSync(tmp, indexFile);
    return { ok: true, image: list().find((x) => x.id === id) };
  }
  return { has, list, file, add };
}
