// @ts-check
// ─────────────────────────────────────────────────────────────────────────
// public/modules/ui/chatlog-tint.mjs — colours of the floating game windows
// (chat, log, odds/stats) as the table style defines them.
//
// The table style XML has carried <ChatLog*> tags for the BOX itself
// (background, surface, border, three text weights) since 2.1.4. Upstream
// e90593e ("qml: table theme ivoire fine-tuning") added the colours of what is
// written INSIDE those boxes — accent, the winner/side-pot/board roles of the
// hand history, the send glyph — and, more importantly, made the DEFAULTS
// depend on how bright the box background is.
//
// That second half is the reason this module exists. Until "Ivoire & Chene"
// every table style was dark, so one bundled dark default set was enough. A
// light style takes gold-on-cream and orange-on-cream, which is exactly the
// pair the eye loses first. StyleProvider::applyChatLogColors() therefore
// picks the light set when <ChatLogBackground> is bright, and the same rule is
// implemented here — same threshold, same hex values, so a style pack written
// against the QML client lands on the same colours in the browser.
//
// Deliberate divergence from upstream: only the SIX new keys fall back to the
// bundled defaults. The six older ones (bg/su/bo/tx/se/mu) are still posted
// only when the style actually sets them, because pokerth.css already falls
// back to the palette for those — filling them in here would repaint the
// panels of every imported palette that sets a background and nothing else.
//
// Pure module: no DOM, no storage, no import. theme.mjs owns the injection.
// ─────────────────────────────────────────────────────────────────────────

// Tint key → CSS custom property. `a` is PlayerBoxAccent (seat plates), kept
// here because it travels with the same object and is what `ac` falls back to.
export const CHATLOG_VARS = {
  bg:  '--chatlog-bg',
  su:  '--chatlog-surface',
  bo:  '--chatlog-border',
  tx:  '--chatlog-text',
  se:  '--chatlog-text2',
  mu:  '--chatlog-muted',
  ac:  '--chatlog-accent',
  act: '--chatlog-accent-text',
  wi:  '--chatlog-winner',
  ws:  '--chatlog-winner-side',
  bd:  '--chatlog-board',
  sd:  '--chatlog-send',
  a:   '--box-accent',
};

// The six keys that get a bundled default. Order matters for nothing, but the
// list is what tells resolveChatLogTint which half of the object to fill in.
export const CHATLOG_CONTENT_KEYS = ['ac', 'act', 'wi', 'ws', 'bd', 'sd'];

// Bundled defaults, verbatim from StyleProvider::applyChatLogColors (upstream
// e90593e): the dark set is the client's historical palette plus the gold and
// orange the Qt-Widgets log has always used; the light set is their darkened
// counterparts, measured at >= 4.3:1 on #f5eee1.
export const CHATLOG_DARK  = { ac: '#E3C800', wi: '#FFFF00', ws: '#FFFFCC', bd: '#FF6633', sd: '#4ade80' };
export const CHATLOG_LIGHT = { ac: '#7a6000', wi: '#6b5400', ws: '#8a6a2a', bd: '#a8431a', sd: '#0e7a37' };

// Perceived brightness, 0..1, weighted as in QML colorBrightness(). Returns
// null for anything that is not a #rgb / #rrggbb literal — rgba() and named
// colours are legal in a style pack, and guessing their luminance wrong would
// flip the whole default set.
export function chatLogBrightness(color) {
  if (typeof color !== 'string') return null;
  const m = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Which default set applies. Upstream compares > 0.5 against the panel
// background and treats an unreadable colour as dark, which is what an
// unparsable value gets here too.
export function isLightChatLog(background) {
  const b = chatLogBrightness(background);
  return b !== null && b > 0.5;
}

// Readable text on a filled accent (selection chips), upstream contrastTextOn:
// the switch sits at 0.6, higher than the 0.5 above, because the question is
// not "is this a light theme" but "is this swatch bright enough that black
// wins".
export function contrastTextOn(color) {
  const b = chatLogBrightness(color);
  return (b !== null && b > 0.6) ? '#101010' : '#FFFFFF';
}

/**
 * Completes a tint object with the colours the style left unspecified.
 *
 * @param {Object|null} tint raw per-table tint (see _SKIN_TINT in theme.mjs)
 * @returns {Object|null} a copy with ac/act/wi/ws/bd/sd filled in, or null
 */
export function resolveChatLogTint(tint) {
  if (!tint) return null;
  const def = isLightChatLog(tint.bg) ? CHATLOG_LIGHT : CHATLOG_DARK;
  const out = {};
  for (const k in CHATLOG_VARS) if (tint[k]) out[k] = tint[k];
  // The chat accent falls back to the seat-plate accent BEFORE the bundled
  // default: the built-in styles have carried a per-table accent since 2.1.4
  // and the chat has always used it, so taking upstream's fixed gold here
  // would repaint the mention and the active tab on all twenty-one of them.
  out.ac = tint.ac || tint.a || def.ac;
  for (const k of ['wi', 'ws', 'bd', 'sd']) out[k] = tint[k] || def[k];
  // Text on the accent follows the accent in force, not the default set.
  out.act = tint.act || contrastTextOn(out.ac);
  return out;
}
