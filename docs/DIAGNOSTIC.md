# 🩺 Diagnosing a problem

How to collect useful information when something goes wrong
(invisible hole cards, stuck connection, wrong version displayed…).

## 1. The build number

At the bottom of the login screen: `PokerTH Web Client x.y.z · build x.y.z`.
If the displayed build does not match the latest deployed version, force a
refresh (the "new version" banner or the ↺ button) before testing again.

## 2. Opening the browser console

| Platform | How |
|---|---|
| Desktop (Edge, Chrome, Firefox) | `F12` → **Console** tab |
| macOS Safari | Settings → Advanced → "Show Develop menu", then `⌥⌘C` |
| iPhone / iPad | No local console. Either plug the device into a Mac (Safari → Develop → \<device\>), or use the visible diagnostics described below |

## 3. Diagnostic commands

### `pthDiag()` — general snapshot

Type it in the console at any time (ideally while the problem is happening):

```js
pthDiag()
```

Returns and logs a JSON snapshot: build, browser, screen, language, service
worker, WebSocket state, login mode (`guest` / `auth` / `unauth` / `lan`),
nickname, current game and hand, own-card presence, decryption-key presence,
and the latest card diagnostics. **Paste the whole block into your report.**

### `window._pthCardDiag` — hole-card pipeline

Filled at the start of every hand. Traces how your two hole cards were
received:

```js
window._pthCardDiag
// { hand: 12, plain: false, enc: 16, encU8: true, key: true, dec: true, cleared: false, money: 2980 }
```

| Field | Meaning |
|---|---|
| `plain` | cards received in plaintext (`plainCards`) — guest/LAN mode |
| `enc` | byte length of the encrypted cards (`encryptedCards`, pokerth.net accounts); `-1` = absent |
| `encU8` | the encrypted bytes were extracted correctly |
| `key` | AES key derived from the password is present |
| `dec` | decryption succeeded |
| `cleared` | cards wiped by the "busted stack" guard |
| `money` | stack seen at the start of the hand |

Typical cases: `key:false` → password not captured at login;
`dec:false` → decryption failed; `cleared:true` → stack badly initialized.

### Chat commands (work on mobile)

All commands below can be typed in the lobby or game chat. Replies are shown
**locally in your chat only** — nothing is sent to the server or other
players. This is the easiest way to collect diagnostics on a phone, where no
console is available: long-press a reply to copy it.

| Command | What it does |
|---|---|
| `/help` | Lists all local commands |
| `/diag` | `pthDiag()` snapshot (build, connection, game state, card pipeline) |
| `/update` | Compares your build to the server's; if newer, clears the cache and reloads |
| `/netdbg` | Transport (direct/proxy, ws/wss), WebSocket state, reconnect count, protocol messages/10 s, then HTTP round-trip time |
| `/carddbg` | Hole-card pipeline trace of the last 10 hands (see field table above) |
| `/msglog` | Names of the last 30 protocol messages received |
| `/fps` | On-screen FPS meter for 5 seconds, then average/minimum in the chat |
| `/lang <code>` | Switches the UI language (e.g. `/lang fr`); without a code, lists available codes |
| `/sound on\|off` | Toggles game sounds |
| `/seatdbg` | Seat-layout metrics (game chat only) |

Unknown `/commands` are sent as normal chat (so server-side commands like
`/me` or `/emoji` still work).

### Visible diagnostics without a console (mobile)

If your hole cards stay hidden even though the server sent card data, a red
status line is shown during the first two affected hands:

```
cards diag: plain=false enc=16 u8=true key=true dec=false clr=false $=3000
```

Take a screenshot or copy it verbatim into your report.

## 4. What to include in a bug report

1. The full `pthDiag()` output (or the red line on mobile).
2. Browser + OS (e.g. Safari iOS 19, Edge Windows 11).
3. The displayed build number.
4. Login mode (guest, pokerth.net account, private server, training).
5. What you were doing and what you expected.

Then open an issue: <https://github.com/narmod/pokerth-web-client/issues>.
