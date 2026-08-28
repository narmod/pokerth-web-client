# Web-client emoji reactions — FX catalog (for QML porting)

90 reactions across 3 themed pages (😀 Emotions / 👏 Mood & gestures / ♠️ Poker & luck).
Wire protocol is unchanged: every reaction still travels as `/emoji <char>` in the
game chat (same convention as `/me`). This file describes the visual choreography
the web client plays, so the QML client can mirror it.

## Emoji animations (played on the big floating emoji)

All rise to ~-150% of their start position and fade out; duration 1.4-1.7 s.

| anim | motion |
|---|---|
| `pop` | scale-in overshoot, small hop, rise |
| `shake` | rotational left/right shake while rising |
| `beat` | double pulse (scale up/down twice) while rising |
| `shine` | scale-in + brightness/glow flash mid-way |
| `spin` | 720° rotation while rising |
| `fire` | flame-like sway (±4°) while rising |
| `flex` | two strong pumps (scale 1.5/1.1/1.45) |
| `launch` | lifts off upward (to ~-260%), slight -8° tilt, fire trail via particles |
| `drop` | falls from above, bounces twice, settles, fades (no rise) |
| `wobble` | damped pendulum rotation (±16° → 0°) while rising |
| `flip` | 3D rotateY 0→900° (card flip) while rising |
| `zoomout` | appears huge (scale 3), shrinks to 1 with a small bounce, rises |
| `heartbeat` | fast double-thump pairs (boom-boom) while rising |
| `shiver` | high-frequency ±2% horizontal jitter while rising |
| `tilt` | leans progressively then spirals (560°) while rising |

## Particle presets

| preset | effect |
|---|---|
| `sparkle` | 7 gold ✦/✧ in all directions |
| `shock` | expanding ring + 💥✦ burst |
| `confetti` | 24 colored paper pieces with gravity |
| `boom` | 420 ms delay (bomb lands first), then TWO orange shockwave rings (2nd delayed 120 ms) + 14× 💥🔥✦ burst, dist 95 |

## Per-emoji table

Particle spec fields: chars (glyphs) or color dots, count, size px, a0..a1 spread
angle in degrees (0=right, -90=up), dist px, g = gravity px (negative = floats up),
life ms, rot = random rotation.

### Page 1 — 😀 Emotions

| # | emoji | anim | particles |
|---|---|---|---|
| 0 | 😂 | `shake` | `{chars:['💧'],count:7,size:13,a0:-30,a1:210,dist:55,g:36,life:850}` |
| 1 | 🤣 | `shake` | `{chars:['💧'],count:7,size:13,a0:-30,a1:210,dist:55,g:36,life:850}` |
| 2 | 😅 | `shake` | `{chars:['💧'],count:5,size:12,a0:-40,a1:220,dist:48,g:40,life:800}` |
| 3 | 😭 | `shake` | `{chars:['💧'],count:11,size:14,a0:-20,a1:200,dist:60,g:70,life:1000}` |
| 4 | 🥺 | `heartbeat` | `{chars:['✨','💖'],count:8,size:13,a0:0,a1:360,dist:56,life:850}` |
| 5 | 😢 | `wobble` | `{chars:['💧'],count:6,size:13,a0:-30,a1:210,dist:50,g:55,life:900}` |
| 6 | 😏 | `pop` | `'sparkle'` |
| 7 | 🙄 | `tilt` | `{chars:['✦'],count:5,size:11,a0:0,a1:360,dist:44,life:650}` |
| 8 | 😳 | `zoomout` | `'sparkle'` |
| 9 | 🤪 | `wobble` | `{chars:['✦','✧'],count:8,size:12,a0:0,a1:360,dist:58,life:800,rot:1}` |
| 10 | 😇 | `shine` | `{chars:['✨'],count:8,color:'var(--gold)',size:13,a0:-160,a1:-20,dist:58,g:-26,life:900}` |
| 11 | 😍 | `heartbeat` | `{chars:['❤️','💖'],count:8,size:16,a0:-160,a1:-20,dist:64,g:-30,life:1100}` |
| 12 | 🥰 | `heartbeat` | `{chars:['💕','💖'],count:9,size:15,a0:-170,a1:-10,dist:62,g:-28,life:1050}` |
| 13 | 😘 | `heartbeat` | `{chars:['💋','❤️'],count:7,size:15,a0:-150,a1:-30,dist:60,g:-32,life:1000}` |
| 14 | 😬 | `shiver` | `{chars:['💦'],count:4,size:11,a0:-120,a1:-60,dist:40,g:44,life:700}` |
| 15 | 😴 | `drop` | `{chars:['💤'],count:5,size:14,a0:-120,a1:-60,dist:52,g:-40,life:1100}` |
| 16 | 🤔 | `wobble` | `{chars:['✦'],count:5,size:11,a0:0,a1:360,dist:42,life:650}` |
| 17 | 👀 | `zoomout` | `'sparkle'` |
| 18 | 😮 | `zoomout` | `{chars:['✦'],count:6,size:12,a0:0,a1:360,dist:50,life:700}` |
| 19 | 😱 | `shake` | `{chars:['💦'],count:6,size:12,a0:-120,a1:-60,dist:48,g:50,life:780}` |
| 20 | 🤯 | `tilt` | `'shock'` |
| 21 | 😡 | `shiver` | `{chars:['💢','🔥'],count:7,size:13,a0:0,a1:360,dist:54,life:800}` |
| 22 | 😤 | `flex` | `{chars:['💨'],count:6,size:14,a0:-190,a1:10,dist:52,life:750}` |
| 23 | 🤢 | `wobble` | `{count:8,color:'#7ee37e',size:7,a0:0,a1:360,dist:50,life:750}` |
| 24 | 🥴 | `wobble` | `{chars:['🌀','✦'],count:6,size:12,a0:0,a1:360,dist:52,life:850,rot:1}` |
| 25 | 🙃 | `flip` | `'sparkle'` |
| 26 | 🫣 | `pop` | `{chars:['✦'],count:5,size:11,a0:0,a1:360,dist:44,life:650}` |
| 27 | 😐 | `pop` | `{chars:['✦'],count:3,size:10,a0:0,a1:360,dist:36,life:600}` |
| 28 | 🥱 | `wobble` | `{chars:['💤'],count:5,size:14,a0:-130,a1:-50,dist:52,g:-42,life:1100}` |
| 29 | 🙈 | `shake` | `{chars:['✦'],count:6,size:11,a0:0,a1:360,dist:48,life:700}` |

### Page 2 — 👏 Mood & gestures

| # | emoji | anim | particles |
|---|---|---|---|
| 30 | 🎉 | `pop` | `'confetti'` |
| 31 | 🥳 | `pop` | `'confetti'` |
| 32 | 🍿 | `beat` | `{chars:['🍿'],count:9,size:13,a0:-160,a1:-20,dist:60,g:70,life:1000,rot:1}` |
| 33 | 👏 | `beat` | `{chars:['✦','✧'],count:9,color:'var(--gold)',size:13,a0:0,a1:360,dist:60,life:750}` |
| 34 | 🙌 | `beat` | `{chars:['✦','✧'],count:9,color:'var(--gold)',size:13,a0:0,a1:360,dist:62,life:780}` |
| 35 | 💪 | `flex` | `{chars:['✦'],count:6,color:'var(--gold)',size:13,a0:0,a1:360,dist:50,life:700}` |
| 36 | 👍 | `beat` | `'sparkle'` |
| 37 | 👎 | `drop` | `{count:7,color:'#9aa0a6',size:6,a0:20,a1:160,dist:48,g:60,life:800}` |
| 38 | 🤝 | `pop` | `'sparkle'` |
| 39 | 👊 | `flex` | `'shock'` |
| 40 | 🙏 | `shine` | `{chars:['✨'],count:9,color:'var(--gold)',size:13,a0:-160,a1:-20,dist:60,g:-24,life:950}` |
| 41 | 🤞 | `beat` | `{chars:['🍀','✨'],count:8,size:13,a0:0,a1:360,dist:58,life:850,rot:1}` |
| 42 | 🫵 | `zoomout` | `'sparkle'` |
| 43 | 🫡 | `pop` | `'sparkle'` |
| 44 | 🤫 | `pop` | `{chars:['✦'],count:4,size:10,a0:0,a1:360,dist:38,life:600}` |
| 45 | 🤦 | `drop` | `{chars:['💧'],count:4,size:12,a0:-120,a1:-60,dist:42,g:46,life:700}` |
| 46 | 😎 | `pop` | `'sparkle'` |
| 47 | 🤩 | `shine` | `{chars:['✨'],count:8,size:13,a0:0,a1:360,dist:60,life:800,rot:1}` |
| 48 | 💤 | `drop` | `{chars:['💤'],count:6,size:15,a0:-130,a1:-50,dist:56,g:-44,life:1200}` |
| 49 | ⏳ | `flip` | `{chars:['✦'],count:6,size:11,a0:0,a1:360,dist:48,life:700}` |
| 50 | 🍺 | `wobble` | `{chars:['🫧'],count:9,size:12,a0:-140,a1:-40,dist:58,g:-50,life:1100}` |
| 51 | ☕ | `pop` | `{chars:['💨'],count:5,size:13,a0:-120,a1:-60,dist:50,g:-40,life:1000}` |
| 52 | 🤡 | `wobble` | `'confetti'` |
| 53 | 😈 | `tilt` | `{chars:['🔥','✦'],count:8,size:13,a0:0,a1:360,dist:58,life:850,rot:1}` |
| 54 | 💣 | `drop` | `'boom'` |
| 55 | 🚀 | `launch` | `{chars:['🔥','✨'],count:10,size:13,a0:60,a1:120,dist:80,g:60,life:900}` |
| 56 | ⚡ | `zoomout` | `{chars:['⚡','✦'],count:8,size:14,a0:0,a1:360,dist:66,life:750,rot:1}` |
| 57 | 🫠 | `wobble` | `{chars:['💧'],count:6,size:12,a0:40,a1:140,dist:44,g:70,life:950}` |
| 58 | 🥶 | `shiver` | `{chars:['❄️','🧊'],count:8,size:13,a0:0,a1:360,dist:56,life:900,rot:1}` |
| 59 | 🥵 | `fire` | `{chars:['🔥','💦'],count:8,size:13,a0:-160,a1:-20,dist:60,g:-20,life:900}` |

### Page 3 — ♠️ Poker & luck

| # | emoji | anim | particles |
|---|---|---|---|
| 60 | 💰 | `pop` | `{chars:['🪙','💵','✦'],count:12,size:16,a0:-170,a1:-10,dist:72,g:90,life:1200,rot:1}` |
| 61 | 🤑 | `pop` | `{chars:['🪙','💵'],count:10,size:16,a0:-170,a1:-10,dist:70,g:90,life:1100,rot:1}` |
| 62 | 💵 | `drop` | `{chars:['💵','🪙'],count:10,size:15,a0:-170,a1:-10,dist:70,g:85,life:1150,rot:1}` |
| 63 | 💎 | `shine` | `{chars:['✨','✦'],count:9,size:13,a0:0,a1:360,dist:64,life:850,rot:1}` |
| 64 | 🎰 | `spin` | `{chars:['✨','🪙'],count:9,size:14,a0:0,a1:360,dist:66,life:950,rot:1}` |
| 65 | 🍀 | `spin` | `{chars:['✨','🍀'],count:8,color:'#7ee37e',size:13,a0:0,a1:360,dist:62,life:950,rot:1}` |
| 66 | 🃏 | `flip` | `'sparkle'` |
| 67 | ♠️ | `flip` | `{chars:['♠️','♥️','♦️','♣️'],count:8,size:14,a0:0,a1:360,dist:62,life:900,rot:1}` |
| 68 | 🎲 | `spin` | `{chars:['✦','✧'],count:8,size:12,a0:0,a1:360,dist:58,life:800,rot:1}` |
| 69 | 🎯 | `zoomout` | `'sparkle'` |
| 70 | 🏆 | `shine` | `{chars:['⭐','✨'],count:10,color:'var(--gold)',size:14,a0:0,a1:360,dist:68,life:1000,rot:1}` |
| 71 | 🥇 | `shine` | `{chars:['✨'],count:8,color:'var(--gold)',size:13,a0:0,a1:360,dist:60,life:900}` |
| 72 | 💸 | `launch` | `{chars:['💵','🪙'],count:10,size:14,a0:-150,a1:-30,dist:75,g:-40,life:1100,rot:1}` |
| 73 | 🪤 | `drop` | `'shock'` |
| 74 | 👑 | `shine` | `{chars:['✨','⭐'],count:10,color:'var(--gold)',size:14,a0:0,a1:360,dist:70,life:1000,rot:1}` |
| 75 | 🔥 | `fire` | `{chars:['🔥','✦'],count:9,size:14,a0:-150,a1:-30,dist:70,g:-24,life:1000,rot:1}` |
| 76 | 💀 | `shiver` | `{count:8,color:'#9aa0a6',size:6,a0:0,a1:360,dist:52,life:800}` |
| 77 | 🦈 | `pop` | `{chars:['💦','🌊'],count:8,size:14,a0:-170,a1:-10,dist:62,g:40,life:900}` |
| 78 | 🐟 | `wobble` | `{chars:['🫧'],count:9,size:12,a0:-140,a1:-40,dist:58,g:-52,life:1150}` |
| 79 | 🐔 | `shake` | `{chars:['🪶'],count:8,size:14,a0:-30,a1:210,dist:56,g:60,life:1200,rot:1}` |
| 80 | 🫏 | `wobble` | `{chars:['✦'],count:6,size:11,a0:0,a1:360,dist:48,life:750}` |
| 81 | 🎩 | `flip` | `{chars:['✨'],count:7,size:12,a0:0,a1:360,dist:54,life:800}` |
| 82 | 🧊 | `shiver` | `{chars:['❄️'],count:7,size:12,a0:0,a1:360,dist:52,life:850}` |
| 83 | 🌪️ | `tilt` | `{chars:['🍃','💨'],count:10,size:13,a0:0,a1:360,dist:74,life:950,rot:1}` |
| 84 | 🧨 | `shake` | `'shock'` |
| 85 | 📈 | `launch` | `{count:8,color:'#7ee37e',size:6,a0:-120,a1:-60,dist:62,g:-30,life:850}` |
| 86 | 📉 | `drop` | `{count:8,color:'#e05252',size:6,a0:60,a1:120,dist:58,g:70,life:850}` |
| 87 | 🔮 | `shine` | `{chars:['✨','✦'],count:8,size:13,a0:0,a1:360,dist:60,life:900,rot:1}` |
| 88 | 💯 | `zoomout` | `{chars:['✦','💯'],count:6,size:13,a0:0,a1:360,dist:56,life:800}` |
| 89 | ⭐ | `shine` | `{chars:['⭐','✨'],count:9,size:13,a0:0,a1:360,dist:62,life:900,rot:1}` |

