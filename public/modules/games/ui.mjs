// @ts-check
// ═══════════════════════════════════════════════════════════════════
// The card table of the arcade's card games (web extension, narmod
// 2026-10-16): Video Poker, Who Wins?, Higher or Lower, the Ace's Bluff.
// The felt (a lighter one in the light theme), the card back of the
// player's deck, buttons drawn on the canvas (tap, or the keys the game
// gives them), the Ace's speech bubble and floating texts. The games draw
// in world px (height 360, width shell.W, narrow in portrait: down to about
// 215 px) and lay themselves out from shell.W.
// ═══════════════════════════════════════════════════════════════════

import { rr, backUrl } from './common.mjs';

/** The green felt over the whole stage. */
export function felt(g, W, H, light) {
  const bg = g.createRadialGradient(W / 2, H * 0.45, 30, W / 2, H * 0.45, Math.max(W, H) * 0.8);
  if (light) { bg.addColorStop(0, '#3f9e6d'); bg.addColorStop(1, '#1f6b46'); }
  else { bg.addColorStop(0, '#24774e'); bg.addColorStop(1, '#0f3a26'); }
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
}

/** A card back centred on (x, y): the player's back image, else the red pattern. */
export function drawBackCard(g, img, x, y, w, h) {
  const im = img(backUrl());
  g.save(); g.translate(x, y);
  rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1));
  if (im) { g.save(); g.clip(); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore(); rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1)); }
  else {
    g.fillStyle = '#a3262a'; g.fill();
    rr(g, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 2); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.stroke();
    rr(g, -w / 2, -h / 2, w, h, Math.max(2, w * 0.1));
  }
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1; g.stroke();
  g.restore();
}

/** An empty place for a card on the felt. */
export function drawPlace(g, x, y, w, h) {
  rr(g, x - w / 2, y - h / 2, w, h, Math.max(2, w * 0.1));
  g.fillStyle = 'rgba(0,0,0,.16)'; g.fill(); g.strokeStyle = 'rgba(245,240,227,.16)'; g.lineWidth = 1; g.stroke();
}

/** Shrink the font until `s` fits in maxW; returns the size used. */
export function fitFont(g, s, maxW, size, weight = 700, family = 'Inter, system-ui, sans-serif') {
  let px = size;
  g.font = weight + ' ' + px + 'px ' + family;
  while (px > 7 && g.measureText(s).width > maxW) { px -= 1; g.font = weight + ' ' + px + 'px ' + family; }
  return px;
}

/**
 * Buttons drawn on the canvas. add({ id, x, y, w, h, label, kind, key, off })
 * — x, y the centre; kind 'gold' | 'ghost' | 'red'; key a hint shown under
 * the label on a keyboard device (Space, ↓…). hit(x, y) → id or null.
 */
export function buttons() {
  let list = [];
  return {
    reset() { list = []; },
    add(b) { list.push(b); return b; },
    get list() { return list; },
    hit(x, y) {
      for (let i = list.length - 1; i >= 0; i--) {
        const b = list[i];
        if (!b.off && Math.abs(x - b.x) <= b.w / 2 + 3 && Math.abs(y - b.y) <= b.h / 2 + 3) return b.id;
      }
      return null;
    },
    draw(g, showKeys, focus) {
      for (const b of list) {
        g.save();
        g.globalAlpha = b.off ? 0.4 : 1;
        rr(g, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, Math.min(10, b.h / 2.4));
        const gold = b.kind !== 'ghost' && b.kind !== 'red';
        g.fillStyle = b.kind === 'red' ? '#b3261e' : gold ? '#d8b25a' : 'rgba(11,18,16,.55)';
        g.fill();
        g.strokeStyle = gold ? '#8a6510' : 'rgba(245,240,227,.55)'; g.lineWidth = 1; g.stroke();
        if (focus === b.id) { rr(g, b.x - b.w / 2 - 3, b.y - b.h / 2 - 3, b.w + 6, b.h + 6, Math.min(12, b.h / 2.2)); g.strokeStyle = '#f5f0e3'; g.lineWidth = 1.5; g.stroke(); }
        const sub = showKeys && b.key ? b.key : '';
        g.fillStyle = gold ? '#141414' : '#f5f0e3';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        fitFont(g, b.label, b.w - 10, Math.min(14, b.h * 0.42));
        g.fillText(b.label, b.x, b.y - (sub ? 5 : 0));
        if (sub) {
          g.font = '600 8px Inconsolata, monospace'; g.globalAlpha *= 0.75;
          g.fillText(sub, b.x, b.y + b.h * 0.27);
        }
        g.restore();
      }
    },
  };
}

/** The Ace's speech bubble above (x, y), its tail pointing down at (x, y). */
export function bubble(g, s, x, y, W, alpha = 1, maxW = 170) {
  if (!s) return;
  g.save(); g.globalAlpha = alpha;
  g.font = '600 11px Inter, system-ui, sans-serif';
  const tw = Math.min(maxW, g.measureText(s).width + 18);
  const bx = Math.max(4, Math.min(W - tw - 4, x - tw / 2)), by = y - 30;
  rr(g, bx, by, tw, 24, 9); g.fillStyle = '#f5f0e3'; g.fill();
  g.beginPath(); g.moveTo(x - 5, by + 23); g.lineTo(x + 5, by + 23); g.lineTo(x, y - 1); g.closePath(); g.fill();
  g.fillStyle = '#141414'; g.textAlign = 'center'; g.textBaseline = 'middle';
  fitFont(g, s, tw - 12, 11, 600);
  g.fillText(s, bx + tw / 2, by + 12);
  g.restore();
}

/** Floating texts: push({ s, x, y, t: 0, life, gold, red, big }); draw them rising. */
export function drawFloaters(g, list) {
  for (const p of list) {
    const a = Math.max(0, 1 - p.t / p.life);
    g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = p.big ? '700 22px Cinzel, Georgia, serif' : p.gold ? '700 14px Cinzel, Georgia, serif' : '700 13px Inconsolata, monospace';
    g.fillStyle = p.red ? '#ff8a80' : p.gold ? '#f5d77a' : '#f5f0e3';
    g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 3;
    g.fillText(p.s, p.x, p.y - p.t * 24);
    g.restore();
  }
}
export function stepFloaters(list, dt) { for (let i = list.length - 1; i >= 0; i--) { list[i].t += dt; if (list[i].t > list[i].life) list.splice(i, 1); } }

/** Is the player on a keyboard device (key hints on the buttons)? */
export function keyboardFirst() {
  try { return !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) { return true; }
}
