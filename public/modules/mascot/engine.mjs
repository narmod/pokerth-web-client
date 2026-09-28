// ═══════════════════════════════════════════════════════════════════
// Mascot engine (web extension, narmod 2026-09-27) — « the Ace ».
//
// A playing card with arms and legs that shows up now and then on the home
// screen and in the lobby while nobody touches the screen. Front: the ace of
// spades with a face; back: the PokerTH chip. Loaded on demand by
// modules/mascot/index.mjs (never while the option is off, never at a table).
//
// Everything is SVG + Web Animations: no library, no canvas, no network.
// One appearance = entry (door / poof / edge / peek over a panel's top edge)
// → greeting → one action (moonwalk, climb & fall, magic, king, knight,
// grimaces, nap, juggling) → exit. A short peek visit just says hello from
// behind the panel and ducks back down.
// Positions come from modules/mascot/plan.mjs and scale with the screen.
// The overlay never takes a click (pointer-events: none); any input makes
// the Ace vanish in a puff (index.mjs calls dismiss()).
// ═══════════════════════════════════════════════════════════════════

import {
  BASE_W, BASE_H, stageOf, clampX, xAt, pickPanel, pickPeek, pickSequence, costumeFor,
  walkMs, stepCycles, fallMs, ledgePlan, hangPlan, pickWith,
} from './plan.mjs';
import { EXTRA } from './acts-extra.mjs';

const tr = (k, d) => { try { const s = window.t ? window.t(k) : d; return s && s !== k ? s : d; } catch (e) { return d; } };

// ── Static CSS (injected once) ───────────────────────────────────────
const CSS = `
#mascot-root{position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:395;overflow:hidden}
#mascot-root .mc-pos{position:absolute;left:0;top:0;will-change:transform,opacity}
#mascot-root .mc-scale{position:absolute;left:0;top:0;width:${BASE_W}px;height:${BASE_H}px;transform-origin:0 0}
#mascot-root .mc-lean,#mascot-root .mc-flip,#mascot-root .mc-squash,#mascot-root .mc-bob,#mascot-root .mc-breath{position:absolute;left:0;top:0;width:${BASE_W}px;height:${BASE_H}px;transform-origin:84px 212px}
#mascot-root .mc-layer{position:absolute;left:0;top:0;overflow:visible}
#mascot-root .mc-cardwrap{position:absolute;left:42px;top:36px;width:84px;height:120px;perspective:520px}
#mascot-root .mc-card3d{position:absolute;left:0;top:0;width:84px;height:120px;transform-style:preserve-3d}
#mascot-root .mc-face,#mascot-root .mc-back{position:absolute;left:0;top:0;width:84px;height:120px;border-radius:11px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}
#mascot-root .mc-back{transform:rotateY(180deg);box-sizing:border-box;background:#b3261e;border:3px solid #141414;display:flex;align-items:center;justify-content:center}
#mascot-root .mc-back i{position:absolute;left:4px;top:4px;right:4px;bottom:4px;border:2px solid #fbf7ee;border-radius:7px;background:repeating-linear-gradient(45deg,rgba(255,255,255,.08) 0 4px,rgba(255,255,255,0) 4px 9px)}
#mascot-root .mc-back img{position:relative;width:62px;height:62px}
#mascot-root .mc-legL,#mascot-root .mc-legR,#mascot-root .mc-armL,#mascot-root .mc-armR,#mascot-root .mc-hat,#mascot-root .mc-stars-rot{transform-box:view-box}
#mascot-root .mc-legL{transform-origin:58px 128px}#mascot-root .mc-legR{transform-origin:82px 128px}
#mascot-root .mc-armL{transform-origin:36px 84px}#mascot-root .mc-armR{transform-origin:104px 84px}
#mascot-root .mc-hat{transform-origin:70px 32px}#mascot-root .mc-stars-rot{transform-origin:84px 14px}
#mascot-root .mc-f-eo,#mascot-root .mc-tw,#mascot-root .mc-z{transform-box:fill-box;transform-origin:center}
#mascot-root .mc-f,#mascot-root .mc-fx,#mascot-root .mc-chip,#mascot-root .mc-suit,#mascot-root .mc-rope{opacity:0}
#mascot-root .mc-suit-S{opacity:1}
#mascot-root .mc-rope{transform-box:view-box;transform-origin:70px 113px}
#mascot-root .mc-bang{transform-box:fill-box;transform-origin:0% 50%;opacity:0}
#mascot-root .mc-gun{transform-box:view-box}
#mascot-root .mc-m-smile .mc-f-eo,#mascot-root .mc-m-smile .mc-f-ms,
#mascot-root .mc-m-cool .mc-f-gl,#mascot-root .mc-m-cool .mc-f-ms,
#mascot-root .mc-m-fierce .mc-f-eo,#mascot-root .mc-m-fierce .mc-f-br,#mascot-root .mc-m-fierce .mc-f-mf{opacity:1}
#mascot-root .mc-h,#mascot-root .mc-t{display:none}
#mascot-root .mc-hat-tophat .mc-h-tophat,#mascot-root .mc-hat-wizard .mc-h-wizard,#mascot-root .mc-hat-crown .mc-h-crown,
#mascot-root .mc-hat-helmet .mc-h-helmet,#mascot-root .mc-hat-fedora .mc-h-fedora,#mascot-root .mc-hat-nightcap .mc-h-nightcap,#mascot-root .mc-hat-cowboy .mc-h-cowboy,#mascot-root .mc-tool-pistol .mc-t-pistol,
#mascot-root .mc-tool-wand .mc-t-wand,#mascot-root .mc-tool-scepter .mc-t-scepter,#mascot-root .mc-tool-sword .mc-t-sword,#mascot-root .mc-tool-cane .mc-t-cane{display:inline}
#mascot-root .mc-bubble{position:absolute;left:0;top:0;opacity:0;white-space:nowrap;background:#fbf7ee;color:#141414;font:800 15px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:7px 12px;border-radius:14px;box-shadow:0 6px 16px rgba(0,0,0,.4);transform-origin:0 100%}
#mascot-root .mc-bubble::after{content:"";position:absolute;left:12px;bottom:-7px;border-style:solid;border-width:8px 8px 0 0;border-color:#fbf7ee transparent transparent transparent}
#mascot-root .mc-bubble.mc-bubble-r{transform-origin:100% 100%}
#mascot-root .mc-bubble.mc-bubble-r::after{left:auto;right:12px;border-width:8px 0 0 8px}
#mascot-root .mc-door{position:absolute;width:120px;height:220px;transform-origin:0 100%}
#mascot-root .mc-door-grow{position:absolute;left:0;top:0;width:120px;height:220px;perspective:700px;transform-origin:50% 100%}
#mascot-root .mc-door-in{position:absolute;left:0;top:0;width:120px;height:220px;box-sizing:border-box;border:6px solid #3a2616;border-bottom:none;border-radius:12px 12px 0 0;background:radial-gradient(80% 60% at 50% 72%,#f2b35a 0%,#8a4614 45%,#1a0e06 100%)}
#mascot-root .mc-door-panel{position:absolute;left:6px;top:6px;width:108px;height:214px;border-radius:7px 7px 0 0;background:#7a4a28;box-shadow:inset 0 0 0 2px #5b3419}
#mascot-root .mc-door-rec{position:absolute;left:14px;width:80px;border-radius:4px;box-shadow:inset 0 0 0 2px #5b3419,inset 0 3px 6px rgba(0,0,0,.25)}
#mascot-root .mc-door-knob{position:absolute;top:118px;width:11px;height:11px;border-radius:50%;background:#f5c518;box-shadow:0 1px 2px #000}
#mascot-root .mc-puff{position:absolute;width:190px;height:150px;opacity:0;transform-origin:50% 100%}
#mascot-root .mc-puff i{position:absolute;border-radius:50%;background:#dfe3ea;box-shadow:inset -6px -8px 0 rgba(0,0,0,.12)}
#mascot-root .mc-dust{position:absolute;width:140px;height:52px;opacity:0;transform-origin:50% 100%}
#mascot-root .mc-dust i{position:absolute;border-radius:50%;background:#8a93a3}
`;

// ── The Ace (base 168 × 228 px, SVG viewBox 0 0 140 190) ────────────
const SPADE = 'M0 -6 C2.5 -2.5 6.5 -0.5 5 3 C4 5.2 1.6 5 0.7 3.4 L1.8 6.5 L-1.8 6.5 L-0.7 3.4 C-1.6 5 -4 5.2 -5 3 C-6.5 -0.5 -2.5 -2.5 0 -6Z';
const HEART = 'M0 5.5 C-6.5 1 -6.5 -4.5 -3.2 -5 C-1.4 -5.3 0 -4 0 -2.6 C0 -4 1.4 -5.3 3.2 -5 C6.5 -4.5 6.5 1 0 5.5Z';
const DIAMOND = 'M0 -6.2 L4.6 0 L0 6.2 L-4.6 0Z';
const CLUB = 'M-2.8 -3.4 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0Z M-5.8 1 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0Z M0.2 1 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0Z M-0.8 1.5 L0.8 1.5 L1.9 6.5 L-1.9 6.5Z';
const STAR4 = 'M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8Z';
const SW = (w) => `style="stroke-width:${w}px;stroke-linecap:round;stroke-linejoin:round"`;
const K = '#141414';

const LEGS = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228">
<ellipse cx="70" cy="180" rx="36" ry="5" fill="#000" opacity=".4"/>
<g class="mc-legL"><path d="M58 126 Q57 150 52 166" fill="none" stroke="${K}" ${SW(5)}/><ellipse cx="47" cy="169" rx="11.5" ry="6.2" fill="#1b1b1b"/><ellipse cx="44" cy="167" rx="4" ry="1.6" fill="#4a4a4a"/></g>
<g class="mc-legR"><path d="M82 126 Q83 150 88 166" fill="none" stroke="${K}" ${SW(5)}/><ellipse cx="93" cy="169" rx="11.5" ry="6.2" fill="#1b1b1b"/><ellipse cx="96" cy="167" rx="4" ry="1.6" fill="#4a4a4a"/></g>
</svg>`;

const SUIT_D = { S: SPADE, H: HEART, D: DIAMOND, C: CLUB };
const corner = (k) => { const c = k === 'H' || k === 'D' ? '#c62828' : K;
  const one = `<text x="41" y="46" fill="${c}" style="font:700 13px Georgia,serif">A</text><path transform="translate(45.5 56)" fill="${c}" d="${SUIT_D[k]}"/>`;
  return `<g class="mc-suit mc-suit-${k}">${one}<g transform="rotate(180 70 80)">${one}</g></g>`; };
const SUITS = ['S', 'H', 'D', 'C'].map(corner).join('');

const FACE = `<svg viewBox="35 30 70 100" width="84" height="120">
<defs><linearGradient id="mc-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#b9a98a" stop-opacity=".25"/></linearGradient></defs>
<rect x="36.5" y="31.5" width="67" height="97" rx="8" fill="#fbf7ee" stroke="${K}" style="stroke-width:3px"/>
<rect x="36.5" y="31.5" width="67" height="97" rx="8" fill="url(#mc-sheen)"/>
${SUITS}
<g class="mc-f mc-f-fl"><rect x="36.5" y="31.5" width="67" height="97" rx="8" fill="#e53935" opacity=".22"/></g>
<circle cx="54" cy="84" r="4" fill="#f28b82" opacity=".55"/><circle cx="86" cy="84" r="4" fill="#f28b82" opacity=".55"/>
<g class="mc-f mc-f-eo"><ellipse cx="61" cy="72" rx="4" ry="5.5" fill="${K}"/><ellipse cx="79" cy="72" rx="4" ry="5.5" fill="${K}"/><circle cx="62.4" cy="70" r="1.4" fill="#fff"/><circle cx="80.4" cy="70" r="1.4" fill="#fff"/></g>
<g class="mc-f mc-f-ec" fill="none" stroke="${K}" ${SW(2.8)}><path d="M56 73 Q61 66 66 73"/><path d="M74 73 Q79 66 84 73"/></g>
<g class="mc-f mc-f-ew"><ellipse cx="61" cy="72" rx="4" ry="5.5" fill="${K}"/><circle cx="62.4" cy="70" r="1.4" fill="#fff"/><path d="M74 72 Q79 67 84 72" fill="none" stroke="${K}" ${SW(2.8)}/></g>
<g class="mc-f mc-f-eh" fill="#e0245e"><path transform="translate(61 72) scale(1.25)" d="${HEART}"/><path transform="translate(79 72) scale(1.25)" d="${HEART}"/></g>
<g class="mc-f mc-f-et" fill="#6ec6ff" stroke="#2b7bb9" style="stroke-width:.8px"><path d="M58 77 C55.5 81 55.5 84 58 84 C60.5 84 60.5 81 58 77Z"/><path d="M82 77 C79.5 81 79.5 84 82 84 C84.5 84 84.5 81 82 77Z"/></g>
<g class="mc-f mc-f-el"><ellipse cx="61" cy="72" rx="4.6" ry="5.8" fill="#fff" stroke="${K}" style="stroke-width:1.4px"/><ellipse cx="79" cy="72" rx="4.6" ry="5.8" fill="#fff" stroke="${K}" style="stroke-width:1.4px"/><circle cx="58.2" cy="73" r="2.6" fill="${K}"/><circle cx="76.2" cy="73" r="2.6" fill="${K}"/><path d="M55 65 L66 67 M73 67 L84 65" stroke="${K}" ${SW(2.2)}/></g>
<g class="mc-f mc-f-er"><ellipse cx="61" cy="72" rx="4.6" ry="5.8" fill="#fff" stroke="${K}" style="stroke-width:1.4px"/><ellipse cx="79" cy="72" rx="4.6" ry="5.8" fill="#fff" stroke="${K}" style="stroke-width:1.4px"/><circle cx="63.8" cy="73" r="2.6" fill="${K}"/><circle cx="81.8" cy="73" r="2.6" fill="${K}"/><path d="M55 65 L66 67 M73 67 L84 65" stroke="${K}" ${SW(2.2)}/></g>
<g class="mc-f mc-f-ez" fill="none" stroke="${K}" ${SW(2.8)}><path d="M56 72 Q61 77 66 72"/><path d="M74 72 Q79 77 84 72"/></g>
<g class="mc-f mc-f-ed" fill="none" stroke="${K}" ${SW(2.6)}><path d="M57 67 L65 76 M65 67 L57 76"/><path d="M75 67 L83 76 M83 67 L75 76"/></g>
<g class="mc-f mc-f-ex"><circle cx="61" cy="72" r="6" fill="#fff" stroke="${K}" style="stroke-width:1.6px"/><circle cx="79" cy="72" r="6" fill="#fff" stroke="${K}" style="stroke-width:1.6px"/><circle cx="64.4" cy="72.5" r="2.8" fill="${K}"/><circle cx="75.6" cy="72.5" r="2.8" fill="${K}"/></g>
<g class="mc-f mc-f-es"><circle cx="61" cy="71" r="7" fill="#fff" stroke="${K}" style="stroke-width:1.6px"/><circle cx="79" cy="71" r="7" fill="#fff" stroke="${K}" style="stroke-width:1.6px"/><circle cx="61" cy="71" r="2" fill="${K}"/><circle cx="79" cy="71" r="2" fill="${K}"/></g>
<g class="mc-f mc-f-gl"><rect x="52.5" y="65" width="15.5" height="10" rx="4" fill="${K}"/><rect x="72" y="65" width="15.5" height="10" rx="4" fill="${K}"/><path d="M68 68 L72 68" stroke="${K}" style="stroke-width:2.4px"/><path d="M55.5 67.5 L59 67.5 M75 67.5 L78.5 67.5" stroke="#8fa3c0" ${SW(1.4)}/></g>
<g class="mc-f mc-f-br" stroke="${K}" ${SW(3)}><path d="M54 61 L66 65.5"/><path d="M86 61 L74 65.5"/></g>
<path class="mc-f mc-f-ms" d="M62 85 Q70 93 78 85" fill="none" stroke="${K}" ${SW(3)}/>
<g class="mc-f mc-f-mo"><path d="M60 84 Q70 99 80 84Z" fill="${K}" stroke="${K}" ${SW(2)}/><ellipse cx="70" cy="91" rx="4.5" ry="2.6" fill="#e0625c"/></g>
<g class="mc-f mc-f-mt"><path d="M66 87 Q66 98 70.5 98 Q75 98 75 87Z" fill="#e0625c" stroke="${K}" style="stroke-width:1.6px"/><path d="M70.5 89 L70.5 94" stroke="#b8433e" style="stroke-width:1.2px"/><path d="M62 86 Q70 90 78 86" fill="none" stroke="${K}" ${SW(3)}/></g>
<ellipse class="mc-f mc-f-mu" cx="70" cy="88" rx="4" ry="5.5" fill="${K}"/>
<path class="mc-f mc-f-mw" d="M60 88 Q63 85 66 88 Q69 91 72 88 Q75 85 78 88 Q80 90 81 88" fill="none" stroke="${K}" ${SW(2.5)}/>
<path class="mc-f mc-f-mf" d="M63 88 L77 86" stroke="${K}" ${SW(3)}/>
<g class="mc-f mc-f-mg"><rect x="61" y="84" width="18" height="8" rx="2.5" fill="#fff" stroke="${K}" style="stroke-width:1.8px"/><path d="M61 88 L79 88 M65.5 84 L65.5 92 M70 84 L70 92 M74.5 84 L74.5 92" stroke="${K}" style="stroke-width:1px"/></g>
</svg>`;

const ARMS = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228">
<g class="mc-armL"><path d="M36 84 Q22 94 18 110" fill="none" stroke="${K}" ${SW(5)}/><g class="mc-hl"></g><circle cx="17" cy="113" r="7.5" fill="#fff" stroke="${K}" style="stroke-width:2.5px"/></g>
<g class="mc-armR"><path d="M104 84 Q118 94 122 110" fill="none" stroke="${K}" ${SW(5)}/>
<g class="mc-t mc-t-wand" transform="translate(123 113) rotate(-33.3)"><path d="M0 -4 L0 34" stroke="${K}" ${SW(4)}/><path d="M0 27 L0 34" stroke="#fbf7ee" ${SW(4)}/></g>
<g class="mc-t mc-t-scepter" transform="translate(123 113) rotate(-33.3)"><path d="M0 -8 L0 46" stroke="#b8860b" ${SW(4)}/><circle cx="0" cy="51" r="6" fill="#f5c518" stroke="${K}" style="stroke-width:1.5px"/><path d="M0 57 L0 64 M-3.5 60.5 L3.5 60.5" stroke="#f5c518" ${SW(2.2)}/><circle cx="0" cy="-9" r="2.8" fill="#f5c518" stroke="${K}" style="stroke-width:1px"/></g>
<g class="mc-t mc-t-sword" transform="translate(123 113) rotate(-33.3)"><circle cx="0" cy="-9" r="3" fill="#f5c518" stroke="${K}" style="stroke-width:1.2px"/><rect x="-2" y="-7" width="4" height="13" fill="#6b3d22"/><rect x="-10" y="6" width="20" height="4" rx="2" fill="#f5c518" stroke="${K}" style="stroke-width:1.2px"/><path d="M-3 10 L3 10 L3 58 L0 65 L-3 58Z" fill="#dfe4eb" stroke="${K}" ${SW(1.4)}/><path d="M0 12 L0 57" stroke="#9aa3ae" style="stroke-width:1px"/></g>
<g class="mc-t mc-t-pistol"><g class="mc-gun" transform="translate(123 113) rotate(55) scale(1.25)">
<path d="M-3 -2 L5 -2 L2 11 L-6 10Z" fill="#6b3d22" stroke="${K}" ${SW(1.3)}/>
<rect x="-5" y="-9" width="25" height="7" rx="1.5" fill="#4a4f57" stroke="${K}" style="stroke-width:1.3px"/>
<rect x="19" y="-8" width="9" height="4.5" rx="1" fill="#6b717b" stroke="${K}" style="stroke-width:1.1px"/>
<circle cx="5" cy="-5.5" r="4.2" fill="#8b929c" stroke="${K}" style="stroke-width:1.1px"/><path d="M3 -2 Q6 5 10 -2" fill="none" stroke="${K}" ${SW(1.3)}/>
<g class="mc-bang"><path d="M28 -5.8 L50 -5.8" stroke="#8a5a2b" ${SW(1.6)}/><rect x="50" y="-15" width="38" height="17" rx="1.5" fill="#fff" stroke="${K}" style="stroke-width:1.2px"/><text class="mc-bang-t" x="69" y="-2.4" text-anchor="middle" fill="#c62828" style="font:900 11px Impact,'Arial Black',sans-serif">BANG!</text></g>
</g></g>
<g class="mc-t mc-t-cane"><path d="M125 114 L131 176" stroke="${K}" ${SW(3.6)}/><path d="M125 114 Q122 103 114 106" fill="none" stroke="${K}" ${SW(3.6)}/><path d="M130.6 171 L131 176" stroke="#fbf7ee" ${SW(3.6)}/></g>
<g class="mc-hr"></g><circle cx="123" cy="113" r="7.5" fill="#fff" stroke="${K}" style="stroke-width:2.5px"/></g>
</svg>`;

const HATS = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228"><g class="mc-hat">
<g class="mc-h mc-h-tophat" transform="rotate(-6 70 32)"><rect x="53" y="-2" width="34" height="33" rx="2" fill="#1b1b1b" stroke="${K}" style="stroke-width:2px"/><rect x="53" y="21" width="34" height="6" fill="#b3261e"/><path d="M58 2 L58 18" stroke="#3a3a3a" ${SW(3)}/><ellipse cx="70" cy="32" rx="29" ry="5" fill="#1b1b1b" stroke="${K}" style="stroke-width:2px"/></g>
<g class="mc-h mc-h-wizard"><path d="M47 33 Q58 8 76 -26 Q82 -6 94 33Z" fill="#2a44a8" stroke="${K}" ${SW(2)}/><path transform="translate(68 4) scale(.85)" fill="#f5c518" d="${STAR4}"/><path transform="translate(80 20) scale(.65)" fill="#f5c518" d="${STAR4}"/><path transform="translate(59 22) scale(.6)" fill="#f5c518" d="${STAR4}"/><ellipse cx="70" cy="33" rx="32" ry="6" fill="#22398f" stroke="${K}" style="stroke-width:2px"/></g>
<g class="mc-h mc-h-crown"><path d="M49 34 L51 13 L61 23 L70 7 L79 23 L89 13 L91 34Z" fill="#f5c518" stroke="${K}" ${SW(2.2)}/><rect x="49" y="28" width="42" height="6" fill="#d4a017" stroke="${K}" style="stroke-width:1.5px"/><circle cx="70" cy="21" r="3" fill="#c62828"/><circle cx="58" cy="31" r="2" fill="#2a6fdb"/><circle cx="82" cy="31" r="2" fill="#2a6fdb"/><circle cx="51" cy="12" r="2.4" fill="#f5c518" stroke="${K}" style="stroke-width:1px"/><circle cx="89" cy="12" r="2.4" fill="#f5c518" stroke="${K}" style="stroke-width:1px"/><circle cx="70" cy="6" r="2.6" fill="#f5c518" stroke="${K}" style="stroke-width:1px"/></g>
<g class="mc-h mc-h-helmet"><path d="M70 7 Q76 -16 94 -17 Q86 -5 81 6Z" fill="#c62828" stroke="${K}" style="stroke-width:1.6px"/><path d="M37 50 L37 42 Q37 8 70 6 Q103 8 103 42 L103 50Z" fill="#b8c0cc" stroke="${K}" style="stroke-width:2px"/><rect x="37" y="43" width="66" height="7" fill="#8b95a5" stroke="${K}" style="stroke-width:1.5px"/><rect x="68" y="47" width="4" height="15" rx="1.5" fill="#8b95a5" stroke="${K}" style="stroke-width:1.3px"/><path d="M50 16 Q58 10 66 10" fill="none" stroke="#e8ecf2" ${SW(3)}/><circle cx="44" cy="46.5" r="1.3" fill="${K}"/><circle cx="96" cy="46.5" r="1.3" fill="${K}"/></g>
<g class="mc-h mc-h-fedora" transform="rotate(-8 70 32)"><path d="M51 30 Q50 9 58 6 Q70 12 82 6 Q90 9 89 30Z" fill="#1b1b1b" stroke="${K}" style="stroke-width:2px"/><rect x="51" y="21" width="38" height="5" fill="#f4f1ea"/><ellipse cx="70" cy="31" rx="33" ry="5" fill="#1b1b1b" stroke="${K}" style="stroke-width:2px"/></g>
<g class="mc-h mc-h-cowboy"><path d="M52 31 Q49 9 61 9 Q70 15 79 9 Q91 9 88 31Z" fill="#9a6532" stroke="${K}" ${SW(2)}/><path d="M53 25 Q70 28 87 25 L87 30 Q70 33 53 30Z" fill="#3b2412"/><path d="M30 26 Q38 36 70 36 Q102 36 110 26 Q104 40 70 41 Q36 40 30 26Z" fill="#9a6532" stroke="${K}" ${SW(2)}/></g>
<g class="mc-h mc-h-nightcap"><path d="M47 33 C48 12 64 2 84 5 C100 8 110 20 113 36 L106 37 C103 27 96 20 88 19 C92 24 93 29 93 33Z" fill="#3b5bdb" stroke="${K}" ${SW(2)}/><path d="M60 12 L66 26 M74 6 L78 22 M90 10 L90 20" stroke="#dbe4ff" ${SW(2.4)}/><rect x="45" y="27" width="50" height="8" rx="4" fill="#f4f1ea" stroke="${K}" style="stroke-width:1.8px"/><circle cx="110" cy="40" r="5.5" fill="#f4f1ea" stroke="${K}" style="stroke-width:1.6px"/></g>
</g></svg>`;

const FX_STAR = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="mc-tw" fill="${c}" d="${STAR4}"/></g>`;
const FX = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228">
<g class="mc-fx mc-fx-stars"><g class="mc-stars-rot">
<path transform="translate(62 12)" fill="#f5c518" d="${STAR4}"/><path transform="translate(106 14)" fill="#f5c518" d="${STAR4}"/>
<path transform="translate(84 2) scale(.85)" fill="#fff" d="${STAR4}"/><path transform="translate(84 26) scale(.85)" fill="#f5c518" d="${STAR4}"/>
</g></g>
<g class="mc-fx mc-fx-spark">${FX_STAR(120, 20, 1.3, '#f5c518')}${FX_STAR(142, 44, 1, '#fff')}${FX_STAR(100, -4, 1, '#9fd3ff')}${FX_STAR(132, 4, .85, '#f5c518')}
<circle cx="112" cy="36" r="2.2" fill="#fff"/><circle cx="150" cy="22" r="1.8" fill="#f5c518"/><circle cx="90" cy="12" r="1.6" fill="#fff"/></g>
<g class="mc-fx mc-fx-notes" style="font:900 20px Georgia,serif" fill="#f5c518" stroke="${K}" stroke-width="1" paint-order="stroke">
<text class="mc-z" x="104" y="44">♪</text><text class="mc-z" x="104" y="44">♫</text><text class="mc-z" x="104" y="44">♪</text></g>
<g class="mc-fx mc-fx-zz" style="font:900 24px Georgia,serif" fill="#fbf7ee" stroke="${K}" stroke-width="1.2" paint-order="stroke">
<text class="mc-z" x="108" y="34">Z</text><text class="mc-z" x="108" y="34" style="font-size:19px">z</text><text class="mc-z" x="108" y="34" style="font-size:15px">z</text></g>
</svg>`;
// Poker chips for the juggling act (each one animated on its own path).
const CHIP = '<g class="mc-chip"><circle r="10.5" fill="#b3261e" stroke="#141414" style="stroke-width:1.6px"/><circle r="7.8" fill="none" stroke="#fbf7ee" style="stroke-width:3px;stroke-dasharray:4.4 3.6"/><circle r="4.2" fill="#f5c518"/></g>';
const CHIPS = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228">${CHIP}${CHIP}${CHIP}</svg>`;
// Knight effects live inside the flip wrapper (mirrored with the Ace).
const FX2 = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228">
<path class="mc-fx mc-fx-slash" d="M84 -18 Q176 10 166 120" fill="none" stroke="#e8f0ff" ${SW(7)}/>
<g class="mc-fx mc-fx-thrust" stroke="#e8f0ff" ${SW(3)}><path d="M170 58 L205 58"/><path d="M166 70 L196 70"/><path d="M172 82 L200 82"/></g>
</svg>`;

// Skipping rope: the same loop drawn behind him (upper half of its turn) and
// in front of him (lower half), flipped around the hands' height.
const ROPE_D = 'M17 113 C8 206 132 206 123 113';
const ROPE_B = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228"><g class="mc-rope mc-rope-b" fill="none"><path d="${ROPE_D}" stroke="${K}" ${SW(4.6)}/><path d="${ROPE_D}" stroke="#f5c518" ${SW(2.4)}/></g></svg>`;
const ROPE_F = `<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228"><g class="mc-rope mc-rope-f" fill="none"><path d="${ROPE_D}" stroke="${K}" ${SW(4.6)}/><path d="${ROPE_D}" stroke="#f5c518" ${SW(2.4)}/></g></svg>`;

const ACTOR = `<div class="mc-scale"><div class="mc-lean"><div class="mc-flip">
<div class="mc-squash"><div class="mc-bob"><div class="mc-breath">
${ROPE_B}<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228"><g class="mc-backp"></g></svg>${LEGS}
<div class="mc-cardwrap"><div class="mc-card3d"><div class="mc-face">${FACE}</div><div class="mc-back"><i></i><img src="/logo-chip.png" alt=""></div></div></div>
${ARMS}${ROPE_F}${HATS}${CHIPS}<svg class="mc-layer" viewBox="0 0 140 190" width="168" height="228"><g class="mc-bodyp"></g></svg>
</div></div></div>${FX2}
</div></div>${FX}</div><div class="mc-bubble"></div>`;

const PUFF = '<i style="left:20px;top:70px;width:70px;height:70px"></i><i style="left:70px;top:40px;width:80px;height:80px"></i><i style="left:110px;top:72px;width:66px;height:66px"></i><i style="left:50px;top:96px;width:90px;height:50px"></i><i style="left:88px;top:14px;width:44px;height:44px"></i>';
const DUST = '<i style="left:0;top:26px;width:34px;height:24px"></i><i style="left:26px;top:12px;width:40px;height:36px"></i><i style="left:64px;top:16px;width:42px;height:32px"></i><i style="left:100px;top:28px;width:36px;height:22px"></i>';
const DOOR = '<div class="mc-door-grow"><div class="mc-door-in"></div><div class="mc-door-panel"><div class="mc-door-rec" style="top:14px;height:78px"></div><div class="mc-door-rec" style="top:108px;height:90px"></div><div class="mc-door-knob"></div></div></div>';

// ── Motion cycles (keyframes of one loop) ────────────────────────────
const EIO = 'ease-in-out';
const rot = (d) => ({ transform: `rotate(${d}deg)` });
const cyc4 = (a, b) => [{ transform: 'rotate(0deg)', easing: EIO }, { offset: 0.25, transform: `rotate(${a}deg)`, easing: EIO }, { offset: 0.75, transform: `rotate(${b}deg)`, easing: EIO }, { transform: 'rotate(0deg)' }];
const STEP_F = cyc4(22, -22), STEP_B = cyc4(-22, 22);
const SWING_F = cyc4(16, -16), SWING_B = cyc4(-16, 16);
const KICK_F = cyc4(28, -12), KICK_B = cyc4(-12, -28);
const CLIMB_L = cyc4(150, 70), CLIMB_R = cyc4(-70, -150);
const FLAIL_L = [rot(70), { offset: 0.5, ...rot(160) }, rot(70)];
const FLAIL_R = [rot(-160), { offset: 0.5, ...rot(-70) }, rot(-160)];
const HOP = [{ transform: 'translateY(0px)', easing: EIO }, { offset: 0.5, transform: 'translateY(-5px)', easing: EIO }, { transform: 'translateY(0px)' }];
const BLINK = [{ transform: 'scaleY(1)' }, { offset: 0.92, transform: 'scaleY(1)' }, { offset: 0.95, transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }];
const BREATHE = [{ transform: 'scale(1,1)', easing: EIO }, { offset: 0.5, transform: 'scale(.99,1.025)', easing: EIO }, { transform: 'scale(1,1)' }];
const TWINKLE = [{ transform: 'scale(.4)', opacity: 0.3 }, { offset: 0.5, transform: 'scale(1.2)', opacity: 1 }, { transform: 'scale(.4)', opacity: 0.3 }];
const mwFrames = (D) => { const a = -9 * D, b = 7 * D;   // flat foot slides with the body, the other rides on its toe
  return [
    { transform: `translate(${a}px,0px) rotate(0deg)` }, { offset: 0.46, transform: `translate(${b}px,0px) rotate(0deg)` },
    { offset: 0.54, transform: `translate(${b}px,-5px) rotate(${14 * D}deg)` }, { offset: 0.92, transform: `translate(${a}px,-5px) rotate(${14 * D}deg)` },
    { transform: `translate(${a}px,0px) rotate(0deg)` }]; };
const mwFramesB = (D) => { const f = mwFrames(D); return [f[2], { ...f[3], offset: 0.42 }, { ...f[4], offset: 0.5 }, { ...f[1], offset: 0.96 }, { ...f[2], offset: 1 }].map((o, i) => (i === 0 ? { transform: o.transform } : o)); };

const FACES = ['eo', 'ec', 'ew', 'ez', 'el', 'er', 'eh', 'et', 'ed', 'ex', 'es', 'gl', 'br', 'fl', 'ms', 'mo', 'mt', 'mu', 'mw', 'mf', 'mg'];
const GRIN = ['ec', 'mo'], SURPRISED = ['es', 'mu'], DIZZY = ['ed', 'mw'], WINK = ['ew', 'ms'];
const YAWN = ['ec', 'mu'], ASLEEP = ['ez', 'mf'], FOCUS = ['eo', 'mt'];
const LOVE = ['eh', 'ms'], ANGRY = ['eo', 'br', 'mg', 'fl'], CRY = ['ez', 'et', 'mw'], TEETH = ['ec', 'mg'];

// ── Appearance state ─────────────────────────────────────────────────
let cur = null;   // { root, st, E, anims, timers, dead, x, costume }
let speed = 1;    // playback speed (test panel: slow motion / fast forward)

class Aborted extends Error {}

function styleOnce() {
  if (document.getElementById('mascot-css')) return;
  const s = document.createElement('style');
  s.id = 'mascot-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

function safeBottom() {
  try {
    const p = document.createElement('div');
    p.style.cssText = 'position:fixed;left:0;bottom:0;width:0;height:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none';
    document.body.appendChild(p);
    const v = parseFloat(getComputedStyle(p).paddingBottom) || 0;
    p.remove();
    return v;
  } catch (e) { return 0; }
}

function build(st, costume) {
  styleOnce();
  const old = document.getElementById('mascot-root');
  if (old) old.remove();
  const root = document.createElement('div');
  root.id = 'mascot-root';
  root.setAttribute('aria-hidden', 'true');
  const pos = document.createElement('div');
  pos.className = `mc-pos mc-m-${costume.mood} mc-hat-${costume.hat} mc-tool-${costume.tool}`;
  pos.innerHTML = ACTOR;
  root.appendChild(pos);
  document.body.appendChild(root);
  const q = (s) => pos.querySelector(s);
  const E = {
    root, pos, scale: q('.mc-scale'), lean: q('.mc-lean'), flip: q('.mc-flip'), squash: q('.mc-squash'),
    bob: q('.mc-bob'), breath: q('.mc-breath'), card: q('.mc-card3d'), legL: q('.mc-legL'), legR: q('.mc-legR'),
    armL: q('.mc-armL'), armR: q('.mc-armR'), hat: q('.mc-hat'), bubble: q('.mc-bubble'),
    stars: q('.mc-fx-stars'), starsRot: q('.mc-stars-rot'), spark: q('.mc-fx-spark'),
    slash: q('.mc-fx-slash'), thrust: q('.mc-fx-thrust'), zz: q('.mc-fx-zz'),
    chips: Array.prototype.slice.call(pos.querySelectorAll('.mc-chip')), face: {}, suit: {},
    ropeB: q('.mc-rope-b'), ropeF: q('.mc-rope-f'), gun: q('.mc-gun'), bang: q('.mc-bang'),
    hl: q('.mc-hl'), hr: q('.mc-hr'), bodyp: q('.mc-bodyp'), backp: q('.mc-backp'), notes: q('.mc-fx-notes'),
    cardwrap: q('.mc-cardwrap'),
  };
  ['S', 'H', 'D', 'C'].forEach((k) => { E.suit[k] = q('.mc-suit-' + k); });
  FACES.forEach((f) => { E.face[f] = q('.mc-f-' + f); });
  E.scale.style.transform = `scale(${st.k})`;
  pos.style.opacity = '0';
  return E;
}

// ── Animation helpers ────────────────────────────────────────────────
function play(node, frames, opts) {
  if (!cur || !node || typeof node.animate !== 'function') return null;
  const a = node.animate(frames, opts);
  if (speed !== 1) a.playbackRate = speed;
  cur.anims.push(a);
  return a;
}
/** Track over `total` ms: pts = [[ms, props, easing?], …]; holds its end state. */
function track(node, total, pts, fill = 'forwards', delay = 0) {
  if (!pts.length) return null;
  const frames = pts.map(([ms, p, e]) => {
    const f = Object.assign({ offset: Math.max(0, Math.min(1, ms / total)) }, p);
    if (e) f.easing = e;
    return f;
  });
  for (let i = 1; i < frames.length; i++) if (frames[i].offset < frames[i - 1].offset) frames[i].offset = frames[i - 1].offset;
  if (frames[0].offset > 0) { const f0 = Object.assign({}, frames[0], { offset: 0 }); delete f0.easing; frames.unshift(f0); }
  if (frames[frames.length - 1].offset < 1) { const fl = Object.assign({}, frames[frames.length - 1], { offset: 1 }); delete fl.easing; frames.push(fl); }
  return play(node, frames, { duration: Math.max(1, total), fill, delay });
}
function cycle(node, frames, ms, delay, count) {
  return play(node, frames, { duration: Math.max(1, ms), delay: Math.max(0, delay), iterations: Math.max(1, count), easing: 'linear', fill: 'none' });
}
function wait(ms) {
  return new Promise((resolve, reject) => {
    if (!cur || cur.dead) { reject(new Aborted()); return; }
    const c = cur;
    const id = setTimeout(() => { c.timers.delete(id); if (c.dead) reject(new Aborted()); else resolve(); }, ms / speed);
    c.timers.add(id);
    c.rejects.add(reject);
  });
}
const P = (x, y, o) => (o === undefined ? { transform: `translate(${x}px,${y}px)` } : { transform: `translate(${x}px,${y}px)`, opacity: o });
const facing = (d) => ({ transform: `rotateY(${d * 30}deg)` });
const ry = (deg) => ({ transform: `rotateY(${deg}deg)` });
const sq = (sx, sy) => ({ transform: `scale(${sx},${sy})` });

function walkWin(t0, ms) {
  const E = cur.E, n = stepCycles(ms), c = ms / n;
  cycle(E.legL, STEP_F, c, t0, n); cycle(E.legR, STEP_B, c, t0, n);
  cycle(E.armL, SWING_B, c, t0, n); cycle(E.armR, SWING_F, c, t0, n);
  cycle(E.bob, HOP, c / 2, t0, 2 * n);
}
/** Face shown from t0 to t1 (overrides the costume's mood meanwhile). */
function faceWin(t0, t1, show) {
  for (const f of FACES) {
    const v = show.indexOf(f) >= 0 ? 1 : 0;
    play(cur.E.face[f], [{ opacity: v }, { opacity: v }], { duration: Math.max(1, t1 - t0), delay: t0, fill: 'none' });
  }
}
/** Suit shown in the card's corners from t0 to t1 (S ♠, H ♥, D ♦, C ♣). */
function suitWin(t0, t1, k) {
  for (const s of ['S', 'H', 'D', 'C']) {
    const v = s === k ? 1 : 0;
    play(cur.E.suit[s], [{ opacity: v }, { opacity: v }], { duration: Math.max(1, t1 - t0), delay: t0, fill: 'none' });
  }
}
function fxWin(node, t0, t1) {
  play(node, [{ opacity: 0 }, { offset: 0.08, opacity: 1 }, { offset: 0.9, opacity: 1 }, { opacity: 0 }], { duration: Math.max(1, t1 - t0), delay: t0, fill: 'none' });
}
function bubble(text, t0, t1) {
  const b = cur.E.bubble, st = cur.st;
  b.textContent = text;
  b.style.fontSize = Math.round(Math.max(12, Math.min(16, 15 * st.k + 4))) + 'px';
  const bw = b.offsetWidth, bh = b.offsetHeight;
  const right = cur.x + 0.72 * st.w + bw > st.vw - 6;
  b.classList.toggle('mc-bubble-r', right);
  b.style.left = (right ? 0.28 * st.w - bw : 0.72 * st.w) + 'px';
  b.style.top = (0.04 * st.h - bh) + 'px';
  play(b, [
    { opacity: 0, transform: 'translateY(8px) scale(.6)' }, { offset: 0.08, opacity: 1, transform: 'translateY(0px) scale(1.06)' },
    { offset: 0.12, opacity: 1, transform: 'translateY(0px) scale(1)' }, { offset: 0.9, opacity: 1, transform: 'translateY(0px) scale(1)' },
    { opacity: 0, transform: 'translateY(-6px) scale(.9)' }], { duration: Math.max(1, t1 - t0), delay: t0, fill: 'none' });
}
function floorFx(kind, cx, yBottom, t0, ms) {
  const st = cur.st, el = document.createElement('div');
  const big = kind === 'puff';
  el.className = big ? 'mc-puff' : 'mc-dust';
  el.innerHTML = big ? PUFF : DUST;
  const w = big ? 190 : 140, h = big ? 150 : 52;
  el.style.left = (cx - w / 2) + 'px';
  el.style.top = (yBottom - h) + 'px';
  cur.E.root.appendChild(el);
  const k = st.k;
  play(el, [
    { opacity: 0, transform: `scale(${0.3 * k})` }, { offset: 0.3, opacity: 1, transform: `scale(${k})` },
    { opacity: 0, transform: `scale(${1.4 * k})` }], { duration: ms, delay: t0, fill: 'both' });
}
function puffAt(x, y, t0, ms = 800) { const st = cur.st; floorFx('puff', x + st.w / 2, y + 196 * st.k, t0, ms); }
function makeDoor(side) {
  const st = cur.st, el = document.createElement('div');
  el.className = 'mc-door';
  el.innerHTML = DOOR;
  const margin = Math.max(8, st.vw * 0.05), dw = 120 * st.k;
  const left = side === 'L' ? margin : st.vw - margin - dw;
  el.style.left = left + 'px';
  el.style.top = (st.floor - 220) + 'px';
  el.style.transform = `scale(${st.k})`;
  const panel = el.querySelector('.mc-door-panel'), knob = el.querySelector('.mc-door-knob');
  panel.style.transformOrigin = side === 'L' ? '0 50%' : '100% 50%';
  knob.style[side === 'L' ? 'right' : 'left'] = '12px';
  cur.E.root.insertBefore(el, cur.E.pos);
  return { el, grow: el.querySelector('.mc-door-grow'), panel, open: side === 'L' ? -80 : 80, x: left + dw / 2 - st.w / 2 };
}
/** Door life: grows from the floor, opens, closes, sinks back. */
function doorAnim(d, tGrow, tOpen, tClose, tSink) {
  track(d.grow, tSink + 350, [[0, sq(1, 0)], [tGrow, sq(1, 0)], [tGrow + 300, sq(1, 1), 'cubic-bezier(.3,1.4,.5,1)'], [tSink, sq(1, 1)], [tSink + 300, sq(1, 0)]], 'both');
  track(d.panel, tClose + 450, [[0, ry(0)], [tOpen, ry(0), 'ease-out'], [tOpen + 400, ry(d.open)], [tClose, ry(d.open), 'ease-in'], [tClose + 330, ry(-d.open * 0.05)], [tClose + 450, ry(0)]], 'both');
}

// ── Segments: each starts and ends standing, facing front ────────────
function targetX(st, rnd, avoidX) {
  let x = clampX(st, xAt(st, st.vw * (0.3 + 0.4 * rnd())));
  if (avoidX !== undefined && Math.abs(x - avoidX) < 1.3 * st.w) {
    x = clampX(st, avoidX + (avoidX + st.w / 2 < st.vw / 2 ? 1 : -1) * 1.6 * st.w);
  }
  return x;
}

async function enterDoor(rnd) {
  const { st, E } = cur;
  const side = rnd() < 0.5 ? 'L' : 'R';
  const d = makeDoor(side);
  const x0 = d.x, xT = targetX(st, rnd, x0), dir = Math.sign(xT - x0) || 1;
  const wd = walkMs(st, x0, xT), tw = 900, tEnd = tw + wd;
  const tClose = tw + Math.min(wd * 0.5, 900);
  doorAnim(d, 0, 300, tClose, tClose + 500);
  track(E.pos, tEnd, [[0, P(x0, st.yF, 0)], [480, P(x0, st.yF, 0)], [tw, P(x0, st.yF, 1), 'ease-in-out'], [tEnd, P(xT, st.yF, 1)]]);
  track(E.squash, tw, [[0, sq(0.86, 0.86)], [480, sq(0.86, 0.86)], [tw, sq(1, 1)]]);
  track(E.card, tEnd + 350, [[0, facing(dir)], [tEnd - 80, facing(dir)], [tEnd + 350, ry(0)]]);
  track(E.lean, tEnd + 520, [[0, rot(0)], [tEnd, rot(0)], [tEnd + 160, rot(7 * dir)], [tEnd + 360, rot(-3 * dir)], [tEnd + 520, rot(0)]]);
  walkWin(tw, wd);
  cur.x = xT;
  await wait(Math.max(tEnd + 560, tClose + 850));
  d.el.remove();
}

async function enterPoof(rnd) {
  const { st, E } = cur;
  const x = targetX(st, rnd);
  puffAt(x, st.yF, 0, 800);
  track(E.pos, 10, [[0, P(x, st.yF, 1)]]);
  track(E.squash, 800, [[0, sq(0, 0)], [180, sq(0, 0)], [420, sq(1.15, 1.15)], [620, sq(0.95, 0.95)], [800, sq(1, 1)]]);
  cur.x = x;
  await wait(950);
}

async function enterEdge(rnd) {
  const { st, E } = cur;
  const side = rnd() < 0.5 ? 'L' : 'R';
  const x0 = side === 'L' ? -st.w - 12 : st.vw + 12, xT = targetX(st, rnd), dir = side === 'L' ? 1 : -1;
  const wd = walkMs(st, x0, xT);
  track(E.pos, wd, [[0, P(x0, st.yF, 1)], [wd, P(xT, st.yF, 1)]]);
  track(E.card, wd + 350, [[0, facing(dir)], [wd - 80, facing(dir)], [wd + 350, ry(0)]]);
  track(E.lean, wd + 520, [[0, rot(0)], [wd, rot(0)], [wd + 160, rot(7 * dir)], [wd + 360, rot(-3 * dir)], [wd + 520, rot(0)]]);
  walkWin(0, wd);
  cur.x = xT;
  await wait(wd + 560);
}

function waveArm(leftArm, t0, beats) {
  const s = leftArm ? -1 : 1, pts = [[0, rot(0)], [t0, rot(0)]];
  let t = t0 + 250;
  for (let i = 0; i < beats; i++) { pts.push([t, rot(-132 * s)]); pts.push([t + 250, rot(-100 * s)]); t += 500; }
  pts.push([t + 350, rot(0)]);
  track(leftArm ? cur.E.armL : cur.E.armR, t + 350, pts);
  return t + 350;
}

async function greet() {
  const { E, costume } = cur;
  const withTool = costume.tool !== 'none';
  const end = waveArm(withTool, 0, 3);
  if (!withTool && costume.hat !== 'none') {
    track(E.armL, 1800, [[0, rot(0)], [300, rot(158)], [1400, rot(158)], [1800, rot(0)]]);
    track(E.hat, 1750, [[0, { transform: 'translate(0px,0px) rotate(0deg)' }], [450, { transform: 'translate(-6px,-16px) rotate(-18deg)' }], [1350, { transform: 'translate(-6px,-16px) rotate(-18deg)' }], [1750, { transform: 'translate(0px,0px) rotate(0deg)' }]]);
  }
  bubble(tr('mascotHello', 'Hi!'), 150, 2300);
  if (costume.mood === 'smile') faceWin(200, 1800, GRIN);
  await wait(Math.max(end, 2400));
}

async function exitDoor() {
  const { st, E } = cur;
  const side = cur.x + st.w / 2 < st.vw / 2 ? 'L' : 'R';
  const withTool = cur.costume.tool !== 'none';
  waveArm(withTool, 0, 2);
  bubble(tr('mascotBye', 'See you!'), 100, 1700);
  const d = makeDoor(side);
  const x0 = cur.x, dir = Math.sign(d.x - x0) || -1, wd = walkMs(st, x0, d.x);
  const tw = 2000, ta = tw + wd;
  doorAnim(d, 1500, Math.max(1850, ta - 650), ta + 700, ta + 1150);
  track(E.card, ta, [[0, ry(0)], [1500, ry(0), 'ease-in-out'], [tw, ry(150 * dir)], [ta, ry(150 * dir)]]);
  track(E.pos, ta + 600, [[0, P(x0, st.yF, 1)], [tw, P(x0, st.yF, 1)], [ta, P(d.x, st.yF, 1)], [ta + 600, P(d.x, st.yF - 4 * st.k, 0)]]);
  track(E.squash, ta + 600, [[0, sq(1, 1)], [ta, sq(1, 1)], [ta + 600, sq(0.88, 0.88)]]);
  walkWin(tw, wd);
  await wait(ta + 1500);
  d.el.remove();
}

async function exitPoof() {
  const { st, E } = cur;
  faceWin(0, 420, WINK);
  track(E.squash, 460, [[0, sq(1, 1)], [260, sq(1.08, 0.9)], [320, sq(0.95, 1.1)], [460, sq(0, 0)]]);
  puffAt(cur.x, st.yF, 250, 800);
  await wait(1100);
}

async function exitEdge() {
  const { st, E } = cur;
  const side = cur.x + st.w / 2 < st.vw / 2 ? 'L' : 'R', dir = side === 'L' ? -1 : 1;
  const x1 = side === 'L' ? -st.w - 20 : st.vw + 20, wd = walkMs(st, cur.x, x1), t0 = 1500;
  waveArm(cur.costume.tool !== 'none', 0, 2);
  bubble(tr('mascotBye', 'See you!'), 100, 1500);
  track(E.card, t0 + 200, [[0, ry(0)], [t0 - 150, ry(0)], [t0 + 200, facing(dir)]]);
  track(E.pos, t0 + wd, [[0, P(cur.x, st.yF, 1)], [t0, P(cur.x, st.yF, 1)], [t0 + wd, P(x1, st.yF, 1)]]);
  walkWin(t0, wd);
  await wait(t0 + wd + 50);
}

// ── Actions ──────────────────────────────────────────────────────────
async function actMoon() {
  const { st, E } = cur;
  const x = cur.x, roomR = st.maxX - x, roomL = x - st.minX, D = roomR > roomL ? 1 : -1;
  const d = Math.min(260 * st.k, 0.9 * Math.max(roomR, roomL));
  if (d < 60 * st.k) return actGrim();
  const slide = d / (95 * st.k) * 1000, n = Math.max(2, Math.round(slide / 735)), cm = slide / n;
  const t1 = 400, t2 = t1 + slide, t3 = t2 + 450, tb = t3 + 100, wd = walkMs(st, x + D * d, x), tp = tb + wd, total = tp + 1000;
  const f = -D * 30, F2 = f - D * 360;
  track(E.pos, tp, [[0, P(x, st.yF)], [t1, P(x, st.yF), 'linear'], [t2, P(x + D * d, st.yF)], [tb, P(x + D * d, st.yF), 'ease-in-out'], [tp, P(x, st.yF)]]);
  track(E.card, total, [[0, ry(0)], [300, ry(f)], [t2, ry(f), 'ease-in-out'], [t3, ry(F2)], [tp, ry(F2)], [tp + 250, ry(F2 + D * 30)]]);
  track(E.lean, t2 + 300, [[0, rot(0)], [t1, rot(6 * D)], [t2, rot(6 * D)], [t2 + 300, rot(0)]]);
  const pose = (node, v) => track(node, total, [[0, rot(0)], [tp, rot(0)], [tp + 350, rot(v)], [tp + 800, rot(v)], [total, rot(0)]]);
  pose(E.legR, -14); pose(E.armR, -155); pose(E.armL, 40);
  track(E.squash, total, [[0, sq(1, 1)], [tp, sq(1, 1)], [tp + 350, sq(0.95, 1.07)], [tp + 800, sq(0.95, 1.07)], [total, sq(1, 1)]]);
  track(E.hat, total, [[0, { transform: 'translate(0px,0px) rotate(0deg)' }], [tp, { transform: 'translate(0px,0px) rotate(0deg)' }], [tp + 350, { transform: 'translate(-3px,1px) rotate(-12deg)' }], [tp + 800, { transform: 'translate(-3px,1px) rotate(-12deg)' }], [total, { transform: 'translate(0px,0px) rotate(0deg)' }]]);
  cycle(E.legL, mwFrames(D), cm, t1, n);
  cycle(E.legR, mwFramesB(D), cm, t1, n);
  cycle(E.armL, SWING_B, cm, t1, n); cycle(E.armR, SWING_F, cm, t1, n);
  walkWin(tb, wd);
  await wait(total + 50);
}

async function actClimb(plan) {
  const { st, E } = cur;
  if (!plan) return actGrim();
  const x0 = cur.x, S = plan.dir, k = st.k;
  const CL = plan.front ? 180 : 125 * S;   // side view on a panel's side, back to us on its front
  const pos = [[0, P(x0, st.yF)]], card = [[0, ry(0)]];
  let t = 0;
  // 1. walk to the foot of the panel
  const w1 = walkMs(st, x0, plan.xClimb), d1 = Math.sign(plan.xClimb - x0) || S;
  pos.push([w1, P(plan.xClimb, st.yF)]); card.push([120, facing(d1)], [w1, facing(d1)]);
  walkWin(0, w1);
  t = w1;
  // 2. jump to the panel side if it does not reach the floor
  let yStart = st.yF;
  const squashPts = [[0, sq(1, 1)]];
  if (plan.yHang < st.yF - 0.1 * st.h) {
    yStart = plan.yHang;
    squashPts.push([t, sq(1, 1)], [t + 250, sq(1.1, 0.88)], [t + 330, sq(0.92, 1.1)], [t + 650, sq(1, 1)]);
    pos.push([t + 250, P(plan.xClimb, st.yF), 'ease-out'], [t + 470, P(plan.xClimb, yStart - 0.12 * st.h), 'ease-in'], [t + 650, P(plan.xClimb, yStart)]);
    card.push([t + 300, ry(CL)]);
    t += 650;
  } else card.push([t + 300, ry(CL)]);
  // 3. climb, pull by pull
  const dy = yStart - plan.yGrab;
  const climbMs = Math.max(900, Math.min(3800, dy / (70 * k) * 1000));
  const nP = Math.max(2, Math.round(climbMs / 600)), cp = climbMs / nP;
  for (let i = 1; i <= nP; i++) {
    const y = yStart - dy * i / nP;
    pos.push([t + cp * (i - 1) + cp * 0.6, P(plan.xClimb, y)], [t + cp * i, P(plan.xClimb, y)]);
  }
  cycle(E.armL, CLIMB_L, cp, t, nP); cycle(E.armR, CLIMB_R, cp, t, nP);
  cycle(E.legL, KICK_F, cp, t, nP); cycle(E.legR, KICK_B, cp, t, nP);
  t += climbMs;
  card.push([t, ry(CL)]);
  // 4. mantle onto the top
  pos.push([t + 250, P((plan.xClimb + plan.xTop) / 2, plan.yP - 0.1 * st.h), 'ease-out'], [t + 450, P(plan.xTop, plan.yP)]);
  card.push([t + 450, facing(S)]);
  squashPts.push([t + 380, sq(1, 1)], [t + 450, sq(1.08, 0.92)], [t + 600, sq(1, 1)]);
  t += 450;
  // 5. walk to the far edge
  const w2 = walkMs(st, plan.xTop, plan.xEdge);
  pos.push([t + w2, P(plan.xEdge, plan.yP)]);
  walkWin(t, w2);
  t += w2;
  card.push([t, facing(S)], [t + 200, ry(0)]);
  // 6. wobble on the edge, 7. fall
  const tf = t + 800, fm = fallMs(st.yF - plan.yP), ti = tf + fm;
  pos.push([tf, P(plan.xEdge, plan.yP), 'cubic-bezier(.55,0,1,.45)'], [ti, P(plan.xLand, st.yF)]);
  const lean = [[0, rot(0)], [t, rot(0)], [t + 150, rot(9 * S)], [t + 300, rot(-7 * S)], [t + 500, rot(14 * S)], [tf, rot(18 * S)], [ti, rot(28 * S)], [ti + 30, rot(0)]];
  squashPts.push([tf, sq(1, 1)], [tf + fm * 0.5, sq(0.88, 1.16)], [ti - 10, sq(0.9, 1.14)], [ti + 60, sq(1.75, 0.28)], [ti + 1100, sq(1.7, 0.3)], [ti + 1350, sq(0.84, 1.22)], [ti + 1550, sq(1.1, 0.9)], [ti + 1750, sq(1, 1)]);
  faceWin(t, ti, SURPRISED);
  faceWin(ti, ti + 1750, DIZZY);
  fxWin(E.stars, ti, ti + 1750);
  // the stars spin just above the flattened card, then rise with him
  track(E.stars, ti + 1550, [[0, { transform: 'translate(0px,130px)' }], [ti + 1100, { transform: 'translate(0px,130px)' }], [ti + 1350, { transform: 'translate(0px,-6px)' }], [ti + 1550, { transform: 'translate(0px,0px)' }]]);
  cycle(E.armL, FLAIL_L, 225, t, Math.round((ti - t) / 225));
  cycle(E.armR, FLAIL_R, 225, t, Math.round((ti - t) / 225));
  cycle(E.legL, STEP_F, 270, tf, Math.max(1, Math.round(fm / 270)));
  cycle(E.legR, STEP_B, 270, tf, Math.max(1, Math.round(fm / 270)));
  track(E.hat, ti + 2000, [[0, { transform: 'translate(0px,0px) rotate(0deg)' }], [tf, { transform: 'translate(0px,0px) rotate(0deg)' }], [tf + fm * 0.7, { transform: `translate(${6 * S}px,-26px) rotate(${25 * S}deg)` }], [ti + 80, { transform: `translate(${4 * S}px,-4px) rotate(${12 * S}deg)` }], [ti + 1750, { transform: `translate(${4 * S}px,-4px) rotate(${12 * S}deg)` }], [ti + 2000, { transform: 'translate(0px,0px) rotate(0deg)' }]]);
  floorFx('dust', plan.xLand + st.w / 2, st.floor + 4 * k, ti, 900);
  // 8. shake it off, 9. walk back
  lean.push([ti + 1750, rot(0)], [ti + 1900, rot(-7)], [ti + 2050, rot(6)], [ti + 2200, rot(-3)], [ti + 2350, rot(0)]);
  const tw = ti + 2450, w3 = walkMs(st, plan.xLand, x0), d3 = Math.sign(x0 - plan.xLand) || -S;
  pos.push([tw, P(plan.xLand, st.yF)], [tw + w3, P(x0, st.yF)]);
  card.push([ti, ry(0)], [tw, facing(d3)], [tw + w3, facing(d3)], [tw + w3 + 300, ry(0)]);
  walkWin(tw, w3);
  const total = tw + w3 + 400;
  track(E.pos, total, pos); track(E.card, total, card); track(E.lean, total, lean); track(E.squash, total, squashPts);
  await wait(total + 50);
}

async function actMagic(plan) {
  const { st, E } = cur;
  const x = cur.x;
  let tx, ty;
  if (plan) { tx = Math.max(plan.rect.left - 0.25 * st.w, Math.min(plan.rect.right - 0.75 * st.w, (plan.rect.left + plan.rect.right) / 2 - st.w / 2)); ty = plan.yP; }
  else { tx = x + st.w / 2 < st.vw / 2 ? st.minX + (st.maxX - st.minX) * 0.8 : st.minX + (st.maxX - st.minX) * 0.2; ty = st.yF; }
  const total = 6700;
  track(E.pos, total, [[0, P(x, st.yF)], [3000, P(x, st.yF)], [3001, P(tx, ty)], [5800, P(tx, ty)], [5801, P(x, st.yF)]]);
  track(E.squash, total, [[0, sq(1, 1)], [560, sq(1.05, 0.9)], [980, sq(0.97, 1.05)], [1260, sq(1, 1)], [2660, sq(1, 1)], [2940, sq(0, 0)], [3500, sq(0, 0)], [3780, sq(1.15, 1.15)], [3990, sq(0.95, 0.95)], [4200, sq(1, 1)], [5320, sq(1, 1)], [5600, sq(0, 0)], [5950, sq(0, 0)], [6200, sq(1.15, 1.15)], [6400, sq(0.95, 0.95)], [6600, sq(1, 1)]]);
  track(E.lean, 1400, [[0, rot(0)], [560, rot(-5)], [1050, rot(4)], [1400, rot(0)]]);
  track(E.armR, total, [[0, rot(0)], [560, rot(38)], [1050, rot(-152)], [1330, rot(-136)], [1680, rot(-146)], [2100, rot(-140)], [2660, rot(-60)], [2940, rot(0)], [4300, rot(0)], [4550, rot(-130)], [4760, rot(-100)], [4970, rot(-130)], [5180, rot(-100)], [5400, rot(0)]]);
  track(E.armL, 2940, [[0, rot(0)], [700, rot(0)], [1120, rot(60)], [2520, rot(60)], [2940, rot(0)]]);
  fxWin(E.spark, 980, 2520);
  faceWin(1050, 2800, GRIN);
  puffAt(x, st.yF, 2590, 850);
  puffAt(tx, ty, 3290, 800);
  puffAt(tx, ty, 5110, 800);
  puffAt(x, st.yF, 5740, 750);
  const cx = cur.x; cur.x = tx;
  bubble(tr('mascotTada', 'Ta-da!'), 4060, 5180);
  cur.x = cx;
  await wait(total + 50);
}

async function actKing() {
  const { E } = cur;
  const total = 5500;
  track(E.squash, total, [[0, sq(1, 1)], [550, sq(1.03, 1.07)], [2750, sq(1.03, 1.07)], [3080, sq(1, 1)]]);
  track(E.armR, total, [[0, rot(0)], [660, rot(-160)], [880, rot(-146)], [2530, rot(-146)], [2970, rot(0)]]);
  track(E.armL, total, [[0, rot(0)], [550, rot(-48)], [2750, rot(-48)], [3080, rot(0)]]);
  track(E.legL, total, [[0, rot(0)], [3190, rot(0)], [3520, rot(24)], [4290, rot(24)], [4620, rot(0)]]);
  const bow = (x) => ({ transform: `rotateY(0deg) rotateX(${x}deg)` });
  track(E.card, total, [[0, bow(0)], [3190, bow(0)], [3630, bow(40)], [4180, bow(40)], [4620, bow(0)]]);
  track(E.hat, total, [[0, { transform: 'translate(0px,0px) scale(1,1)' }], [3190, { transform: 'translate(0px,0px) scale(1,1)' }], [3630, { transform: 'translate(0px,14px) scale(1,.8)' }], [4180, { transform: 'translate(0px,14px) scale(1,.8)' }], [4620, { transform: 'translate(0px,0px) scale(1,1)' }]]);
  bubble(tr('mascotKing', 'King of the felt!'), 770, 2640);
  faceWin(550, 2750, GRIN);
  await wait(total + 50);
}

async function actKnight() {
  const { st, E } = cur;
  const x = cur.x, D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, k = st.k, total = 5500;
  const lunge = Math.min(92 * k, D > 0 ? st.maxX - x : x - st.minX);
  track(E.flip, total, [[0, { transform: `scaleX(${D})` }], [total, { transform: `scaleX(${D})` }]], 'none');
  track(E.pos, total, [[0, P(x, st.yF)], [990, P(x, st.yF)], [1430, P(x - D * 38 * k, st.yF), 'cubic-bezier(.2,.9,.3,1)'], [1760, P(x + D * lunge, st.yF)], [2640, P(x + D * lunge, st.yF), 'ease-in-out'], [3190, P(x, st.yF)]]);
  track(E.lean, total, [[0, rot(0)], [550, rot(-4 * D)], [1430, rot(-11 * D)], [1760, rot(11 * D)], [2640, rot(9 * D)], [3190, rot(0)], [3520, rot(-6 * D)], [3850, rot(7 * D)], [4180, rot(0)]]);
  track(E.card, total, [[0, ry(0)], [440, ry(22)], [3190, ry(22)], [3520, ry(0)]]);
  track(E.legL, total, [[0, rot(0)], [440, rot(20)], [3190, rot(20)], [3520, rot(0)]]);
  track(E.legR, total, [[0, rot(0)], [440, rot(-20)], [3190, rot(-20)], [3520, rot(0)]]);
  track(E.armR, total, [[0, rot(0)], [550, rot(-72)], [1430, rot(-58)], [1760, rot(-94)], [2640, rot(-94)], [3190, rot(-72)], [3520, rot(-178)], [3800, rot(-16)], [4010, rot(-30)], [4510, rot(-165)], [5170, rot(-165)], [5500, rot(0)]]);
  track(E.armL, total, [[0, rot(0)], [550, rot(55)], [3190, rot(55)], [3520, rot(0)]]);
  fxWin(E.thrust, 1700, 2200);
  fxWin(E.slash, 3560, 4050);
  await wait(total + 50);
}

async function actGrim() {
  const { E } = cur;
  const seq = [['ew', 'mt'], ['ex', 'mt'], LOVE, ANGRY, CRY, TEETH, DIZZY, ['eo', 'ms']];
  const D = 6000 / seq.length;
  seq.forEach((f, i) => faceWin(i * D, (i + 1) * D, f));
  suitWin(2 * D, 3 * D, 'H');                  // in love: hearts in the corners
  suitWin(3 * D, 4 * D, 'C');                  // angry: clubs
  suitWin(4 * D, 5 * D, 'D');                  // tears: diamonds
  // big grin: the corners flick through the four suits
  ['H', 'D', 'C', 'S'].forEach((k, i) => suitWin(5 * D + i * D / 4, 5 * D + (i + 1) * D / 4, k));
  // heart eyes beat, angry shakes
  play(E.face.eh, [{ transform: 'scale(1)' }, { offset: 0.5, transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: D / 3, delay: 2 * D, iterations: 3, fill: 'none' });
  play(E.pos.querySelector('.mc-cardwrap'), [{ transform: 'translateX(0px)' }, { offset: 0.25, transform: 'translateX(-1.5px)' }, { offset: 0.75, transform: 'translateX(1.5px)' }, { transform: 'translateX(0px)' }], { duration: 90, delay: 3 * D + 150, iterations: Math.floor((D - 250) / 90), fill: 'none' });
  track(E.lean, 6000, [[0, rot(0)], [480, rot(-7)], [960, rot(0)], [1500, rot(7)], [1980, rot(0)], [2520, rot(-4)], [3000, rot(0)], [3480, rot(6)], [3960, rot(0)], [4500, rot(-8)], [4800, rot(8)], [5100, rot(0)]]);
  track(E.card, 6000, [[0, ry(0)], [720, ry(22)], [1680, ry(-18)], [2700, ry(0)], [3720, ry(16)], [4800, ry(-12)], [5400, ry(0)]]);
  track(E.squash, 6000, [[0, sq(1, 1)], [1980, sq(1, 1)], [2160, sq(0.92, 1.12)], [2640, sq(1, 1)], [3120, sq(1.08, 0.92)], [3600, sq(1, 1)]]);
  await wait(6050);
}

// ── Peek: hello from behind the top edge of a panel ─────────────────
// The overlay is clipped under the panel's top line, so the Ace seems to
// stand behind the panel: only his hat, face and waving hand show above it.
function clipAt(T) {
  const v = T === null ? '' : `inset(0px 0px ${Math.max(0, cur.st.vh - T)}px 0px)`;
  const r = cur.E.root.style;
  r.clipPath = v; r.webkitClipPath = v;
  cur.clipT = T;
}

async function enterPeek(plan) {
  const { st, E } = cur, k = st.k, x = plan.x;
  const yHalf = plan.T - 96 * k;   // hat and eyes above the line
  cur.x = x;
  clipAt(plan.T);
  track(E.pos, 2500, [[0, P(x, plan.yDown, 1)], [400, P(x, plan.yDown), 'ease-out'], [800, P(x, yHalf)],
    [2150, P(x, yHalf), 'cubic-bezier(.3,1.5,.5,1)'], [2500, P(x, plan.yUp)]]);
  // looks left, looks right… someone's there!
  track(E.card, 2100, [[0, ry(0)], [900, ry(0), EIO], [1150, facing(-1)], [1450, facing(-1), EIO], [1700, facing(1)], [1950, facing(1), EIO], [2100, ry(0)]]);
  track(E.squash, 2750, [[0, sq(1, 1)], [2150, sq(1, 1)], [2350, sq(0.9, 1.12)], [2600, sq(1.04, 0.97)], [2750, sq(1, 1)]]);
  faceWin(1950, 2550, SURPRISED);
  await wait(2600);
  await greet();
}

/** From the peek: climbs over the panel's top and jumps down in front of it. */
async function hopDown(plan) {
  const { st, E } = cur, k = st.k, x = plan.x;
  const up = 650;
  track(E.pos, up, [[0, P(x, plan.yUp)], [150, P(x, plan.yUp), 'ease-out'], [up, P(x, plan.yP)]]);
  track(E.armL, 900, [[0, rot(0)], [150, rot(150)], [up, rot(120)], [900, rot(0)]]);
  track(E.armR, 900, [[0, rot(0)], [150, rot(-150)], [up, rot(-120)], [900, rot(0)]]);
  cycle(E.legL, KICK_F, 250, 150, 2); cycle(E.legR, KICK_B, 250, 150, 2);
  track(E.squash, 850, [[0, sq(1, 1)], [150, sq(1.05, 0.93)], [300, sq(0.95, 1.06)], [up, sq(1, 1)], [up + 80, sq(1.08, 0.92)], [850, sq(1, 1)]]);
  await wait(up);
  clipAt(null);   // feet on the line: he is now standing on the panel
  // looks down (gulp), then jumps
  const t0 = 250, tj = t0 + 700, apex = plan.yP - 30 * k, fm = fallMs(st.yF - apex), ti = tj + 200 + fm;
  faceWin(t0, tj, SURPRISED);
  track(E.card, tj, [[0, ry(0)], [t0, ry(0)], [t0 + 200, { transform: 'rotateX(24deg)' }], [tj - 150, { transform: 'rotateX(24deg)' }], [tj, ry(0)]]);
  track(E.pos, ti, [[0, P(x, plan.yP)], [tj, P(x, plan.yP), 'ease-out'], [tj + 200, P(x, apex), 'ease-in'], [ti, P(x, st.yF)]]);
  track(E.squash, ti + 400, [[0, sq(1, 1)], [tj - 180, sq(1, 1)], [tj - 20, sq(1.12, 0.86)], [tj + 80, sq(0.9, 1.14)], [ti - 20, sq(0.94, 1.08)], [ti + 60, sq(1.3, 0.72)], [ti + 250, sq(0.96, 1.05)], [ti + 400, sq(1, 1)]]);
  track(E.armL, ti + 300, [[0, rot(0)], [tj, rot(0)], [tj + 120, rot(150)], [ti, rot(130)], [ti + 300, rot(0)]]);
  track(E.armR, ti + 300, [[0, rot(0)], [tj, rot(0)], [tj + 120, rot(-150)], [ti, rot(-130)], [ti + 300, rot(0)]]);
  track(E.hat, ti + 350, [[0, { transform: 'translate(0px,0px)' }], [tj + 200, { transform: 'translate(0px,0px)' }], [ti, { transform: 'translate(0px,-12px)' }], [ti + 350, { transform: 'translate(0px,0px)' }]]);
  floorFx('dust', x + st.w / 2, st.floor + 4 * k, ti, 800);
  cur.x = x;
  await wait(ti + 500);
}

/** Short peek visit: a wink, a little wave, and he ducks back behind the panel. */
async function exitDuck(plan) {
  const { E } = cur, x = plan.x;
  faceWin(0, 700, WINK);
  bubble(tr('mascotBye', 'See you!'), 100, 1200);
  waveArm(cur.costume.tool !== 'none', 0, 1);
  track(E.squash, 1500, [[0, sq(1, 1)], [1100, sq(1, 1)], [1200, sq(1.06, 0.94)], [1500, sq(0.94, 1.06)]]);
  track(E.pos, 1500, [[0, P(x, plan.yUp)], [1200, P(x, plan.yUp), 'cubic-bezier(.5,0,1,.5)'], [1500, P(x, plan.yDown)]]);
  track(E.hat, 1650, [[0, { transform: 'translate(0px,0px)' }], [1200, { transform: 'translate(0px,0px)' }], [1350, { transform: 'translate(0px,-14px)' }], [1650, { transform: 'translate(0px,0px)' }]]);
  await wait(1750);
}

// ── Nap: a big yawn, he sits down and dozes off (zZz), then wakes with a start
async function actSleep() {
  const { st, E } = cur, k = st.k, x = cur.x;
  const tS = 1700, tW = 6700, total = 8000;
  track(E.armL, total, [[0, rot(0)], [500, rot(150)], [1300, rot(150)], [tS, rot(14)], [tW, rot(14)], [tW + 150, rot(120)], [tW + 500, rot(0)]]);
  track(E.armR, total, [[0, rot(0)], [500, rot(-150)], [1300, rot(-150)], [tS, rot(-14)], [tW, rot(-14)], [tW + 150, rot(-120)], [tW + 500, rot(0)]]);
  track(E.squash, total, [[0, sq(1, 1)], [500, sq(0.95, 1.08)], [1300, sq(0.95, 1.08)], [tS, sq(1, 1)], [tW, sq(1, 1)], [tW + 120, sq(0.9, 1.15)], [tW + 350, sq(1.05, 0.95)], [tW + 500, sq(1, 1)]]);
  track(E.pos, total, [[0, P(x, st.yF)], [tS, P(x, st.yF), EIO], [tS + 400, P(x, st.yF + 30 * k)], [tW, P(x, st.yF + 30 * k), 'ease-out'], [tW + 200, P(x, st.yF - 18 * k), 'ease-in'], [tW + 400, P(x, st.yF)]]);
  track(E.legL, total, [[0, rot(0)], [tS, rot(0)], [tS + 400, rot(68)], [tW, rot(68)], [tW + 200, rot(0)]]);
  track(E.legR, total, [[0, rot(0)], [tS, rot(0)], [tS + 400, rot(-68)], [tW, rot(-68)], [tW + 200, rot(0)]]);
  track(E.hat, total, [[0, { transform: 'translate(0px,0px) rotate(0deg)' }], [tS + 400, { transform: 'translate(0px,0px) rotate(0deg)' }], [tS + 800, { transform: 'translate(2px,3px) rotate(8deg)' }], [tW, { transform: 'translate(2px,3px) rotate(8deg)' }], [tW + 200, { transform: 'translate(0px,-16px) rotate(-6deg)' }], [tW + 500, { transform: 'translate(0px,0px) rotate(0deg)' }]]);
  faceWin(200, 1450, YAWN);
  faceWin(1450, tW, ASLEEP);
  faceWin(tW, tW + 900, SURPRISED);
  // head nods while he snores
  cycle(E.lean, [{ transform: 'rotate(0deg)', easing: EIO }, { offset: 0.5, transform: 'rotate(5deg)', easing: EIO }, { transform: 'rotate(0deg)' }], 1800, tS + 500, Math.floor((tW - tS - 500) / 1800));
  fxWin(E.zz, tS + 500, tW - 100);
  E.zz.querySelectorAll('.mc-z').forEach((z, i) => play(z, [
    { transform: 'translate(0px,0px) scale(.5)', opacity: 0 }, { offset: 0.2, transform: 'translate(4px,-8px) scale(.8)', opacity: 1 },
    { transform: 'translate(22px,-44px) scale(1.25)', opacity: 0 }], { duration: 1800, delay: tS + 500 + i * 600, iterations: 3, fill: 'none' }));
  // shakes himself awake
  play(E.lean, [rot(0), { offset: 0.25, ...rot(-7) }, { offset: 0.5, ...rot(6) }, { offset: 0.75, ...rot(-3) }, rot(0)], { duration: 700, delay: tW + 450, fill: 'none' });
  await wait(total + 50);
}

// ── Juggling three poker chips (shower pattern), then « Ta-da! » ───────
function chipFrames() {
  const f = [];
  for (let i = 0; i <= 6; i++) {   // thrown from the right hand, over his head, caught left
    const u = i / 6, x = 123 - 106 * u, y = 110 - 640 * u * (1 - u);
    f.push({ offset: 0.7 * u, transform: `translate(${x}px,${y}px) rotate(${u * 540}deg)`, opacity: 1 });
  }
  f.push({ offset: 0.85, transform: 'translate(70px,121px) rotate(600deg)', opacity: 1 });
  f.push({ offset: 1, transform: 'translate(123px,110px) rotate(720deg)', opacity: 1 });
  return f;
}
async function actJuggle() {
  const { E } = cur;
  const Pd = 1200, N = 3, t0 = 500, beat = Pd / 3, tEnd = t0 + 2 * beat + N * Pd;
  const frames = chipFrames();
  E.chips.forEach((c, i) => play(c, frames, { duration: Pd, delay: t0 + i * beat, iterations: N, fill: 'none', easing: 'linear' }));
  const toss = (a) => [rot(0), { offset: 0.3, ...rot(a) }, rot(0)];
  cycle(E.armR, toss(-18), beat, t0 - 60, 3 * N);
  cycle(E.armL, toss(18), beat, t0 + 0.7 * Pd - 60, 3 * N - 1);
  cycle(E.bob, HOP, beat, t0, 3 * N);
  faceWin(t0, tEnd, FOCUS);
  track(E.card, tEnd, [[0, ry(0)], [t0, ry(0)], [t0 + 600, ry(10)], [t0 + 1800, ry(-10)], [t0 + 3000, ry(10)], [tEnd, ry(0)]]);
  // catches them all: arms up, ta-da
  const tt = tEnd + 100, total = tt + 1700;
  track(E.armL, total, [[0, rot(0)], [tt, rot(0)], [tt + 250, rot(150)], [tt + 1300, rot(150)], [total, rot(0)]], 'none');
  track(E.armR, total, [[0, rot(0)], [tt, rot(0)], [tt + 250, rot(-150)], [tt + 1300, rot(-150)], [total, rot(0)]], 'none');
  track(E.squash, total, [[0, sq(1, 1)], [tt, sq(1, 1)], [tt + 150, sq(1.08, 0.92)], [tt + 350, sq(0.96, 1.06)], [tt + 500, sq(1, 1)]]);
  faceWin(tt, tt + 1400, GRIN);
  bubble(tr('mascotTada', 'Ta-da!'), tt + 100, tt + 1500);
  await wait(total + 50);
}

// ── Cowboy: draws, twirls, aims… BANG! (a flag pops out of the barrel) ─
async function actPistol() {
  const { st, E } = cur;
  const x = cur.x, D = (st.maxX - x) >= (x - st.minX) ? 1 : -1, total = 6400;
  track(E.flip, total, [[0, { transform: `scaleX(${D})` }], [total, { transform: `scaleX(${D})` }]], 'none');
  // shooting to the left, the whole Ace is mirrored: un-mirror the flag's text
  const bt = E.bang.querySelector('.mc-bang-t');
  if (bt) { if (D < 0) bt.setAttribute('transform', 'translate(138 0) scale(-1 1)'); else bt.removeAttribute('transform'); }
  // quick draw: the arm flicks up and the revolver twirls twice
  track(E.armR, total, [[0, rot(0)], [300, rot(-150)], [900, rot(-150)], [1200, rot(-55)], [4300, rot(-55)], [4600, rot(-100)], [5100, rot(-100)], [5500, rot(0)]]);
  track(E.gun, 1100, [[0, { transform: 'rotate(0deg)' }], [300, { transform: 'rotate(0deg)' }], [900, { transform: 'rotate(720deg)' }], [1100, { transform: 'rotate(720deg)' }]], 'none');
  track(E.armL, total, [[0, rot(0)], [1200, rot(0)], [1500, rot(-40)], [2600, rot(-40)], [2700, rot(0)], [4600, rot(0)], [5000, rot(60)], [5300, rot(60)], [5600, rot(0)]]);
  track(E.card, total, [[0, ry(0)], [1200, ry(0)], [1500, ry(20)], [2600, ry(20)], [2900, ry(0)]]);
  track(E.lean, total, [[0, rot(0)], [1200, rot(0)], [1500, rot(-5)], [2550, rot(-5)], [2650, rot(-12), 'ease-out'], [3000, rot(0)], [4600, rot(0)], [4800, rot(-4)], [5100, rot(4)], [5400, rot(0)]]);
  track(E.legL, total, [[0, rot(0)], [1200, rot(0)], [1500, rot(14)], [2900, rot(14)], [3200, rot(0)]]);
  track(E.legR, total, [[0, rot(0)], [1200, rot(0)], [1500, rot(-14)], [2900, rot(-14)], [3200, rot(0)]]);
  faceWin(1300, 2550, ['ew', 'mf']);          // squints, takes aim
  faceWin(2550, 3500, SURPRISED);               // BANG?!
  faceWin(3500, 4600, ['ex', 'mo']);            // cross-eyed at the flag
  faceWin(4600, 5800, TEETH);                   // sheepish grin, shrug
  suitWin(2550, 3500, 'D');
  // the flag shoots out, wobbles, droops, then goes back in
  track(E.bang, 4400, [[0, { transform: 'scale(0,1) rotate(0deg)', opacity: 0 }], [2500, { transform: 'scale(0,1) rotate(0deg)', opacity: 0 }],
    [2560, { transform: 'scale(.2,1) rotate(0deg)', opacity: 1 }], [2700, { transform: 'scale(1.15,1.1) rotate(-6deg)', opacity: 1 }],
    [2850, { transform: 'scale(.95,1) rotate(4deg)', opacity: 1 }], [3000, { transform: 'scale(1,1) rotate(0deg)', opacity: 1 }],
    [3600, { transform: 'scale(1,1) rotate(0deg)', opacity: 1 }], [3900, { transform: 'scale(1,1) rotate(28deg)', opacity: 1 }],
    [4150, { transform: 'scale(1,1) rotate(28deg)', opacity: 1 }], [4400, { transform: 'scale(0,1) rotate(28deg)', opacity: 0 }]]);
  track(E.squash, total, [[0, sq(1, 1)], [2550, sq(1, 1)], [2650, sq(0.9, 1.12)], [2900, sq(1, 1)], [4700, sq(1, 1)], [4850, sq(1.05, 0.95)], [5000, sq(1, 1)]]);
  track(E.hat, total, [[0, { transform: 'translate(0px,0px) rotate(0deg)' }], [2550, { transform: 'translate(0px,0px) rotate(0deg)' }], [2700, { transform: 'translate(-2px,-16px) rotate(-14deg)' }], [2950, { transform: 'translate(0px,0px) rotate(-4deg)' }], [3200, { transform: 'translate(0px,0px) rotate(0deg)' }]]);
  await wait(total + 50);
}

// ── Skipping rope: a steady rhythm, faster and faster… then he trips ─
async function actRope() {
  const { st, E } = cur, k = st.k, x = cur.x;
  const slow = 640, nS = 6, fast = 400, nF = 4, t0 = 500;
  const tF = t0 + nS * slow, tT = tF + nF * fast;   // tT: the rope catches his feet
  const turn = [{ transform: 'scaleY(1)' }, { offset: 0.25, transform: 'scaleY(0)' }, { offset: 0.5, transform: 'scaleY(-1.4)' }, { offset: 0.75, transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }];
  const front = (on) => [{ opacity: on }, { offset: 0.25, opacity: on }, { offset: 0.2501, opacity: 1 - on }, { offset: 0.7499, opacity: 1 - on }, { offset: 0.75, opacity: on }, { opacity: on }];
  const jump = [{ transform: 'translateY(-15px)', easing: 'ease-in' }, { offset: 0.5, transform: 'translateY(0px)', easing: 'ease-out' }, { transform: 'translateY(-15px)' }];
  const tuck = (a) => [rot(a), { offset: 0.5, ...rot(0) }, rot(a)];
  const turnArm = (a) => [rot(a), { offset: 0.5, ...rot(-a) }, rot(a)];
  // the rope appears in his hands (start: lying behind his heels, up and over)
  play(E.ropeB, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 150, fill: 'none' });
  for (const [ms, n, d] of [[slow, nS, t0], [fast, nF, tF]]) {
    cycle(E.ropeF, turn, ms, d, n); cycle(E.ropeB, turn, ms, d, n);
    play(E.ropeF, front(1), { duration: ms, delay: d, iterations: n, fill: 'none' });
    play(E.ropeB, front(0), { duration: ms, delay: d, iterations: n, fill: 'none' });
    cycle(E.bob, jump, ms, d, n);
    cycle(E.legL, tuck(12), ms, d, n); cycle(E.legR, tuck(-12), ms, d, n);
    cycle(E.armL, turnArm(10), ms, d, n); cycle(E.armR, turnArm(-10), ms, d, n);
  }
  faceWin(t0, tF, ['eo', 'ms']);
  faceWin(tF, tT, SURPRISED);
  // tripped: the rope stays under his feet, he goes flat on his face
  const ti = tT + 260, total = ti + 2300;
  play(E.ropeF, [{ opacity: 1, transform: 'scaleY(1)' }, { opacity: 1, transform: 'scaleY(1)' }], { duration: ti + 1500 - tT, delay: tT, fill: 'none' });
  track(E.pos, total, [[0, P(x, st.yF)], [tT, P(x, st.yF), 'ease-in'], [ti, P(x, st.yF + 6 * k)], [ti + 1400, P(x, st.yF + 6 * k), 'ease-out'], [ti + 1700, P(x, st.yF)]]);
  track(E.lean, total, [[0, rot(0)], [tT, rot(0)], [tT + 120, rot(-10)], [ti, rot(8)], [ti + 60, rot(0)], [ti + 1700, rot(0)], [ti + 1850, rot(-7)], [ti + 2000, rot(6)], [ti + 2150, rot(0)]]);
  track(E.squash, total, [[0, sq(1, 1)], [tT, sq(1, 1)], [ti - 20, sq(0.95, 1.08)], [ti + 60, sq(1.7, 0.3)], [ti + 1350, sq(1.65, 0.32)], [ti + 1600, sq(0.86, 1.18)], [ti + 1800, sq(1.08, 0.92)], [ti + 1950, sq(1, 1)]]);
  track(E.armL, total, [[0, rot(0)], [tT, rot(0)], [tT + 150, rot(150)], [ti, rot(110)], [ti + 1500, rot(110)], [ti + 1800, rot(0)]], 'none');
  track(E.armR, total, [[0, rot(0)], [tT, rot(0)], [tT + 150, rot(-150)], [ti, rot(-110)], [ti + 1500, rot(-110)], [ti + 1800, rot(0)]], 'none');
  faceWin(ti, ti + 1700, DIZZY);
  fxWin(E.stars, ti, ti + 1700);
  track(E.stars, ti + 1600, [[0, { transform: 'translate(0px,130px)' }], [ti + 1350, { transform: 'translate(0px,130px)' }], [ti + 1600, { transform: 'translate(0px,0px)' }]]);
  floorFx('dust', x + st.w / 2, st.floor + 4 * k, ti, 800);
  await wait(total + 50);
}

// ── Toolkit handed to the extra acts (modules/mascot/acts-extra.mjs) ─
/** A prop drawn in the Ace's own scale (× s), placed in the page (viewport px). */
function worldProp(vbW, vbH, inner, x, y, front = true, s = 1) {
  const st = cur.st, el = document.createElement('div');
  const w = vbW * 1.2 * st.k * s, h = vbH * 1.2 * st.k * s;
  el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:50% 100%`;
  el.innerHTML = `<svg viewBox="0 0 ${vbW} ${vbH}" width="${w}" height="${h}" style="overflow:visible;display:block">${inner}</svg>`;
  if (front) cur.E.root.appendChild(el); else cur.E.root.insertBefore(el, cur.E.pos);
  return el;
}
/** Empties the hand / body prop groups and puts the lean origin back. */
function clearProps() {
  const E = cur.E;
  [E.hl, E.hr, E.bodyp, E.backp].forEach((g) => { g.innerHTML = ''; });
  E.lean.style.transformOrigin = '';
}
function notesWin(t0, t1) {
  const E = cur.E;
  fxWin(E.notes, t0, t1);
  const n = Math.max(1, Math.floor((t1 - t0) / 1500));
  E.notes.querySelectorAll('.mc-z').forEach((z, i) => play(z, [
    { transform: 'translate(0px,0px) rotate(0deg)', opacity: 0 }, { offset: 0.2, transform: 'translate(3px,-8px) rotate(-8deg)', opacity: 1 },
    { transform: `translate(${12 + i * 5}px,-38px) rotate(12deg)`, opacity: 0 }], { duration: 1500, delay: t0 + i * 500, iterations: n, fill: 'none' }));
}
const H = {
  get cur() { return cur; }, get E() { return cur.E; }, get st() { return cur.st; },
  play, track, cycle, wait, faceWin, suitWin, fxWin, bubble, floorFx, puffAt, walkWin, notesWin, worldProp, clearProps,
  walkMs, stepCycles, fallMs, clampX, tr,
  P, rot, sq, ry, facing, K, SW, EIO, HOP, STEP_F, STEP_B, SWING_F, SWING_B, KICK_F, KICK_B, FLAIL_L, FLAIL_R,
  SPADE, HEART, DIAMOND, CLUB,
  F: { GRIN, SURPRISED, DIZZY, WINK, YAWN, ASLEEP, FOCUS, LOVE, ANGRY, CRY, TEETH },
  grim: () => actGrim(),
};

// ── Public API ───────────────────────────────────────────────────────
function panelRects() {
  const scr = document.querySelector('.screen.active');
  if (!scr) return [];
  const list = scr.id === 's-connect'
    ? scr.querySelectorAll('.card')
    : scr.querySelectorAll(':scope > *, :scope > * > *, :scope > * > * > *');
  const out = [];
  for (const el of list) {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 60) continue;
    if (scr.id !== 's-connect') {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor || '';
      const m = bg.match(/rgba?\(([^)]+)\)/);
      const alpha = m ? (m[1].split(',')[3] !== undefined ? parseFloat(m[1].split(',')[3]) : 1) : 0;
      if (alpha < 0.5 && cs.borderTopStyle === 'none') continue;
    }
    out.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
  }
  // Open floating windows (ranking, forum, private messages, player info…):
  // he climbs them, peeks over them and teleports onto them first.
  for (const el of document.querySelectorAll('.floating-win')) {
    if (el.closest('#mascot-panel')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 60) continue;
    try { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; } catch (e) { continue; }
    out.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, win: true });
  }
  return out;
}

export function isPlaying() { return !!(cur && !cur.dead); }

function teardown() {
  if (!cur) return;
  const c = cur;
  c.dead = true;
  c.timers.forEach((id) => clearTimeout(id));
  c.rejects.forEach((rj) => { try { rj(new Aborted()); } catch (e) {} });
  c.anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
  try { c.E.root.remove(); } catch (e) {}
  if (cur === c) cur = null;
}

/** Stops everything at once, no animation. */
export function abort() { teardown(); }

/** Startled exit: a hop, big eyes, and he vanishes in a puff. */
export function dismiss() {
  if (!cur || cur.dead || cur.leaving) return;
  const c = cur;
  c.leaving = true;
  let x = c.x, y = c.st.yF;
  try {
    const m = new DOMMatrixReadOnly(getComputedStyle(c.E.pos).transform);
    x = m.m41; y = m.m42;
  } catch (e) {}
  c.timers.forEach((id) => clearTimeout(id));
  c.rejects.forEach((rj) => { try { rj(new Aborted()); } catch (e) {} });
  c.timers.clear(); c.rejects.clear();
  c.anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
  c.anims = [];
  c.E.root.querySelectorAll('.mc-door').forEach((d) => d.remove());
  c.E.pos.style.opacity = '1';
  c.E.pos.style.transform = `translate(${x}px,${y}px)`;
  faceWin(0, 700, SURPRISED);
  track(c.E.squash, 480, [[0, sq(1, 1)], [120, sq(0.9, 1.18)], [260, sq(1.05, 0.95)], [330, sq(1.05, 0.95)], [480, sq(0, 0)]]);
  track(c.E.bob, 330, [[0, { transform: 'translateY(0px)' }], [130, { transform: 'translateY(-14px)' }], [330, { transform: 'translateY(0px)' }]]);
  if (c.clipT !== undefined && c.clipT !== null) floorFx('puff', x + c.st.w / 2, c.clipT + 30 * c.st.k, 300, 700);
  else puffAt(x, y, 300, 700);
  const id = setTimeout(() => { if (cur === c) teardown(); }, 1050 / speed);
  c.timers.add(id);
}

/** Entries, actions, exits, hats and tools the test panel can offer. */
export const CATALOG = {
  entries: ['door', 'poof', 'edge', 'peek'],
  actions: ['moon', 'climb', 'magic', 'king', 'knight', 'grim', 'sleep', 'juggle', 'pistol', 'rope',
    'banana', 'bluff', 'ledge', 'hang', 'knock', 'push', 'none'],
  exits: ['door', 'poof', 'edge', 'duck'],
  hats: ['none', 'tophat', 'wizard', 'crown', 'helmet', 'fedora', 'nightcap', 'cowboy'],
  tools: ['none', 'wand', 'scepter', 'sword', 'cane', 'pistol'],
};

/**
 * One appearance. Resolves when he is gone (or was dismissed / aborted).
 * Test options: action 'none' (greeting only), hat / tool (costume override),
 * speed (0.25–4, slows down or speeds up the whole appearance).
 * @param {{ action?: string, entry?: string, exit?: string, hat?: string, tool?: string, speed?: number, rnd?: () => number }} [opts]
 */
export async function appear(opts = {}) {
  if (cur) teardown();
  speed = Math.max(0.1, Math.min(4, +opts.speed || 1));
  const rnd = opts.rnd || Math.random;
  const st = stageOf(window.innerWidth, window.innerHeight, safeBottom());
  const rects = panelRects();
  const wins = rects.filter((r) => r.win);
  const plan = pickPanel(st, wins) || pickPanel(st, rects);
  const peek = pickPeek(st, wins, rnd) || pickPeek(st, rects, rnd);
  const ledge = pickWith(ledgePlan, st, rects, rnd);
  const hang = pickWith(hangPlan, st, rects, rnd);
  const none = opts.action === 'none';
  const seq = pickSequence(rnd, { climb: !!plan, peek: !!peek, ledge: !!ledge, hang: !!hang, force: none ? undefined : opts.action });
  if (none) seq.actions = [];
  if (opts.entry && (opts.entry !== 'peek' || peek)) seq.entry = opts.entry;
  if (opts.exit && (opts.exit !== 'duck' || seq.entry === 'peek')) seq.exit = opts.exit;
  if (seq.entry === 'peek' && opts.entry === 'peek' && !opts.action && !seq.actions.length && !opts.exit) seq.exit = 'duck';
  if (seq.entry !== 'peek' && seq.exit === 'duck') seq.exit = 'poof';
  if (seq.exit === 'duck') seq.actions = [];
  if (opts.action && seq.actions[0] !== opts.action && opts.action !== 'climb') seq.actions = [opts.action];
  seq.costume = costumeFor(seq.actions[0] || 'peek', rnd);
  if (opts.hat) seq.costume.hat = opts.hat;
  if (opts.tool) seq.costume.tool = opts.tool;
  seq.peekable = !!peek; seq.climbable = !!plan;
  cur = { st, anims: [], timers: new Set(), rejects: new Set(), dead: false, leaving: false, x: st.vw / 2, costume: seq.costume, E: null, clipT: null };
  const c = cur;
  c.E = build(st, seq.costume);
  const E = c.E;
  E.pos.style.opacity = '';
  // Always-on life: breathing, blinking, spinning stars, twinkles.
  play(E.breath, BREATHE, { duration: 3400, iterations: Infinity });
  play(E.face.eo, BLINK, { duration: 4200, iterations: Infinity, delay: 900 });
  play(E.starsRot, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 1100, iterations: Infinity });
  E.spark.querySelectorAll('.mc-tw').forEach((s, i) => play(s, TWINKLE, { duration: 600, delay: i * 130, iterations: Infinity }));
  const ENTRY = { door: enterDoor, poof: enterPoof, edge: enterEdge, peek: () => enterPeek(peek) };
  const ACT = { moon: actMoon, climb: () => actClimb(plan), magic: () => actMagic(plan), king: actKing, knight: actKnight, grim: actGrim, sleep: actSleep, juggle: actJuggle, pistol: actPistol, rope: actRope };
  const where = { plan, peek, ledge, hang, rects };
  Object.keys(EXTRA).forEach((a) => { ACT[a] = async () => { try { await EXTRA[a](H, where); } finally { if (cur === c) clearProps(); } }; });
  const EXIT = { door: exitDoor, poof: exitPoof, edge: exitEdge, duck: () => exitDuck(peek) };
  try {
    await ENTRY[seq.entry](rnd);
    if (seq.entry !== 'peek') await greet();
    else if (seq.exit !== 'duck') await hopDown(peek);
    for (const a of seq.actions) { await ACT[a](); if (c.gone) break; await wait(350); }
    if (!c.gone) await EXIT[seq.exit]();   // an act may leave the screen by itself
  } catch (e) {
    if (!(e instanceof Aborted)) { try { console.warn('[mascot]', e); } catch (e2) {} }
    // dismissed: let the puff finish
    if (c.leaving) await new Promise((r) => setTimeout(r, 1100 / speed));
  } finally {
    if (cur === c) teardown();
  }
  return seq;
}
