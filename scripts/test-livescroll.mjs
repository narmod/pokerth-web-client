#!/usr/bin/env node
// Deterministic tests for public/modules/ui/livescroll.mjs.
// Run: node scripts/test-livescroll.mjs
//
// Covers both orientations of the "follow / paused" behaviour:
//   · newest on top    (game log, reversed list, full re-render)
//   · newest at bottom (chat panels, plain append)
// The stub element exposes writable scroll metrics so the anchoring maths
// can be checked without a layout engine.
globalThis.window = globalThis;

function makeEl() {
  const el = {
    children: [], _html: '', scrollTop: 0, clientHeight: 100, _rowH: 20,
    style: {}, className: '', dataset: {},
    _listeners: {},
    get scrollHeight() { return Math.max(this.clientHeight, this.children.length * this._rowH); },
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = v; if (v === '') this.children = []; },
    appendChild(c) { this.children.push(c); c.parentNode = this; },
    insertBefore(c) { this.children.push(c); },
    addEventListener(ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); },
    querySelector() { return makeEl(); },
    setAttribute() {}, remove() {},
    fire(ev) { (this._listeners[ev] || []).forEach((f) => f()); }
  };
  el.parentNode = { insertBefore() {} };
  return el;
}
const els = {};
globalThis.document = {
  readyState: 'complete', addEventListener() {},
  getElementById: (id) => (els[id] = els[id] || makeEl()),
  createElement: () => makeEl(),
  querySelectorAll: () => [], querySelector: () => null
};

const LS = await import('../public/modules/ui/livescroll.mjs');

let fails = 0;
function ok(cond, label) {
  if (!cond) { console.error('  ✗ ' + label); fails++; } else console.log('  ✓ ' + label);
}
function eq(a, b, label) { ok(a === b, label + '  (got ' + a + ', want ' + b + ')'); }

// Rows are 20 px tall, the viewport 100 px: 10 rows = 200 px of content.
function fill(el, n) { el.children = []; for (let i = 0; i < n; i++) el.appendChild({}); }

// ── 1. Newest on top (game log) ───────────────────────────────────
{
  const el = makeEl();
  LS.attachLiveScroll(el, { top: true });
  fill(el, 10);                       // scrollHeight 200
  el.scrollTop = 0;                   // live edge

  let s = LS.liveBefore(el);
  ok(s.live, 'log: sitting at the top counts as live');
  el.children.unshift({});            // a new line lands above
  LS.liveAfter(el, s);
  eq(el.scrollTop, 0, 'log: following keeps the newest line in view');

  // Reader scrolls down to an older hand, then two lines arrive.
  el.scrollTop = 80;
  el.fire('scroll');
  s = LS.liveBefore(el);
  ok(!s.live, 'log: leaving the top pauses the follow');
  el.children.unshift({}); el.children.unshift({});
  LS.liveAfter(el, s);
  eq(el.scrollTop, 120, 'log: the read line stays put (offset by the 2 new rows)');

  // Back to the live edge on their own.
  el.scrollTop = 0;
  el.fire('scroll');
  s = LS.liveBefore(el);
  ok(s.live, 'log: returning to the top resumes the follow');
}

// ── 2. Newest at bottom (chat) ────────────────────────────────────
{
  const el = makeEl();
  LS.attachLiveScroll(el, { top: false });
  fill(el, 10);                       // scrollHeight 200, clientHeight 100
  el.scrollTop = 100;                 // bottom = live edge

  let s = LS.liveBefore(el);
  ok(s.live, 'chat: sitting at the bottom counts as live');
  el.appendChild({});
  LS.liveAfter(el, s);
  eq(el.scrollTop, 220, 'chat: following scrolls down to the new message');

  // Reader scrolls up to re-read, then a message arrives.
  el.scrollTop = 40;
  el.fire('scroll');
  s = LS.liveBefore(el);
  ok(!s.live, 'chat: scrolling up pauses the follow');
  el.appendChild({});
  LS.liveAfter(el, s);
  eq(el.scrollTop, 40, 'chat: the view does not move while paused');

  // A tolerance of a few px still counts as the live edge.
  el.scrollTop = el.scrollHeight - el.clientHeight - 2;
  el.fire('scroll');
  ok(LS.liveBefore(el).live, 'chat: 2 px off the bottom still counts as live');
}

// ── 3. Reset (panel cleared / reopened) ───────────────────────────
{
  const el = makeEl();
  LS.attachLiveScroll(el, { top: false });
  fill(el, 10);
  el.scrollTop = 0;
  el.fire('scroll');
  ok(!LS.liveBefore(el).live, 'reset: paused beforehand');
  LS.liveReset(el);
  eq(el.scrollTop, 200, 'reset: jumps back to the live edge');
  ok(LS.liveBefore(el).live, 'reset: following again');
}

// ── 4. Shrinking list (chat cleared under a paused view) ──────────
{
  const el = makeEl();
  LS.attachLiveScroll(el, { top: false });
  fill(el, 10);
  el.scrollTop = 0; el.fire('scroll');
  const s = LS.liveBefore(el);
  el.innerHTML = '';                  // clearChatPanel
  LS.liveAfter(el, s);
  ok(LS.liveBefore(el).live, 'shrink: an emptied list goes back to following');
}

// ── 5. Bridges ────────────────────────────────────────────────────
ok(typeof window._liveBefore === 'function' && typeof window._liveAfter === 'function' &&
   typeof window._liveReset === 'function' && typeof window._liveAttach === 'function',
   'window.* bridges in place (used by the monolith)');

console.log(fails ? '\nFAIL ' + fails : '\nALL OK');
process.exit(fails ? 1 : 0);
