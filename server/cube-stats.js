'use strict';
// Cross-tabulated session counts for the admin Statistics « Narrow to » row.
// Design note: claude/CONCEPTION_CUBE_STATS.md (project docs).
//
// Each game session start (mode ping) and each confirmed login (login ping)
// adds 1 to ONE key that holds all its dimensions at once, in `fx` of the day
// bucket and of the hour cell:
//
//   c|<mode>|<cc>|<dev>|<app>|<new>|<lan>     a connection
//   l|<acc>|<cc>|<dev>|<app>|<new>            a login on pokerth.net
//
// Only counts per combination: no device id, no address, no time zone. Every
// value is one of a closed set (or a 2-letter country code, or a LAN
// directory id), so a forged ping cannot write free text. A bucket holds at
// most KEY_CAP keys; past it, new combinations go to the overflow key '*'.

const MODES = ['pokerthnet', 'lan', 'offline', 'live'];
const ACCOUNTS = ['guest', 'auth'];
const KEY_CAP = 2000;
const OVERFLOW = '*';
const DIMS = Object.freeze({
  c: ['mode', 'cc', 'dev', 'app', 'new', 'lan'],
  l: ['acc', 'cc', 'dev', 'app', 'new'],
});

// The value a dimension may hold, or null when the fact is not valid.
function clean(dim, v) {
  switch (dim) {
    case 'mode': return MODES.indexOf(v) >= 0 ? v : null;
    case 'acc': return ACCOUNTS.indexOf(v) >= 0 ? v : null;
    case 'cc': return (typeof v === 'string' && /^[A-Z]{2}$/.test(v)) ? v : 'ZZ';
    case 'dev': return v === 'm' ? 'm' : 'd';
    case 'app': return v === 'p' ? 'p' : '-';
    case 'new': return (v === 'n' || v === 'r') ? v : '-';
    case 'lan': return (typeof v === 'string' && /^(lan_[a-z0-9]{1,32}|other)$/i.test(v)) ? v : '-';
    default: return null;
  }
}

function factKey(type, o) {
  const dims = DIMS[type];
  if (!dims || !o) return null;
  const parts = [type];
  for (const d of dims) {
    const v = clean(d, o[d]);
    if (v === null) return null;
    parts.push(v);
  }
  return parts.join('|');
}

function add(bucket, key, cap) {
  if (!bucket || !key) return;
  if (!bucket.fx) bucket.fx = {};
  const fx = bucket.fx;
  const k = (fx[key] === undefined && Object.keys(fx).length >= (cap || KEY_CAP)) ? OVERFLOW : key;
  fx[k] = (fx[k] || 0) + 1;
}

function parse(key) {
  const p = String(key || '').split('|');
  const dims = DIMS[p[0]];
  if (!dims || p.length !== dims.length + 1) return null;
  const o = { type: p[0] };
  dims.forEach(function (d, i) { o[d] = p[i + 1]; });
  return o;
}

// Sum the facts of one type over a list of buckets (or hour cells), keeping
// those that pass every filter ({ dim: [values] }), broken down by one
// dimension. `overflow` is what the '*' key holds: it cannot be filtered,
// so it is reported apart, never folded into a figure.
function query(list, type, filters, by) {
  const dims = DIMS[type] || [];
  const f = {};
  for (const d in (filters || {})) if (dims.indexOf(d) >= 0 && Array.isArray(filters[d]) && filters[d].length) f[d] = filters[d];
  const out = { total: 0, by: {}, overflow: 0 };
  (list || []).forEach(function (b) {
    const fx = b && b.fx;
    if (!fx) return;
    for (const k in fx) {
      const n = fx[k] || 0;
      if (k === OVERFLOW) { out.overflow += n; continue; }
      const o = parse(k);
      if (!o || o.type !== type) continue;
      let pass = true;
      for (const d in f) if (f[d].indexOf(o[d]) < 0) { pass = false; break; }
      if (!pass) continue;
      out.total += n;
      if (by && dims.indexOf(by) >= 0) out.by[o[by]] = (out.by[o[by]] || 0) + n;
    }
  });
  return out;
}

// The values each dimension takes over a list of buckets, with their counts:
// what a « Narrow to » list can offer, largest first.
function values(list, type) {
  const dims = DIMS[type] || [];
  const out = {};
  dims.forEach(function (d) { out[d] = {}; });
  (list || []).forEach(function (b) {
    const fx = b && b.fx;
    if (!fx) return;
    for (const k in fx) {
      const o = parse(k);
      if (!o || o.type !== type) continue;
      dims.forEach(function (d) { out[d][o[d]] = (out[d][o[d]] || 0) + (fx[k] || 0); });
    }
  });
  return out;
}

// Filters from a query string: "mode:lan|pokerthnet,cc:DE". Only dimensions
// of the type, and only values a fact can hold (checked by clean(): a value
// it would rewrite is refused, not silently turned into another one).
function parseFilters(type, str) {
  const dims = DIMS[type] || [];
  const out = {};
  String(str || '').slice(0, 600).split(',').forEach(function (part) {
    const i = part.indexOf(':');
    if (i <= 0) return;
    const d = part.slice(0, i).trim();
    if (dims.indexOf(d) < 0) return;
    const vals = part.slice(i + 1).split('|').map(function (v) { return v.trim(); })
      .filter(function (v) { return v && clean(d, v) === v; }).slice(0, 40);
    if (vals.length) out[d] = (out[d] || []).concat(vals.filter(function (v) { return (out[d] || []).indexOf(v) < 0; }));
  });
  return out;
}

// Small cells: a count of 1 or 2 in a cell defined by two dimensions or more
// (filters plus the breakdown) is shown as "<3". A total under two filters or
// more is such a cell too; a total under one filter, or none, stays exact.
const SMALL = 3;
function maskN(n, dimsInCell) { return (dimsInCell >= 2 && n > 0 && n < SMALL) ? '<' + SMALL : n; }
function mask(byMap, dimsInCell) {
  if (dimsInCell < 2) return byMap;
  const out = {};
  for (const k in byMap) out[k] = (byMap[k] > 0 && byMap[k] < SMALL) ? '<' + SMALL : byMap[k];
  return out;
}

module.exports = { DIMS, MODES, ACCOUNTS, KEY_CAP, OVERFLOW, SMALL, clean, factKey, add, parse, query, values, parseFilters, mask, maskN };
