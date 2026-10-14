// Ace's Help — is this table a cup game? (web.65)
//
// Cup games (BBC, WEC, Monthly Cup, special cups) are opened by the cup
// admins, who invite the players: invite-only or password tables whose name
// says which cup it is (« WEC 22:00 », « BBC Step 2 », « Monthly Cup Gold »…).
// The protocol carries no cup flag, so the name decides — only for an
// explanation in the Ace's bubble, never to allow or refuse anything.
// Returns the name to show (cleaned, at most 40 characters) or ''.

const CUP_RE = /(^|[^a-z0-9])(bbc|wec|we ?cup|cup|coupe|pokal|copa|coppa|puchar|kupa)([^a-z0-9]|$)/i;

export function cupName(g) {
  if (!g || !(g.type === 3 || g.priv)) return '';
  const raw = typeof g.name === 'string' ? g.name : '';
  if (!CUP_RE.test(raw)) return '';
  return tableName(g);
}

/** A table's name as plain text for the bubble: no control characters, no ** (bold markers), 40 characters at most. */
export function tableName(g) {
  const raw = g && typeof g.name === 'string' ? g.name : '';
  const clean = raw.replace(/[\u0000-\u001f\u007f*]+/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > 40 ? clean.slice(0, 39) + '…' : clean;
}
