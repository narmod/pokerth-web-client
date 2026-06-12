# Security notes

This describes the security model of the proxy (`proxy.js`): the hardening that
is already in place, and what an operator should add before exposing an instance
on the open Internet. The proxy is designed primarily for LAN / private use.

## What the proxy already enforces

- **Upstream host allowlist (anti open-relay).** The proxy only dials servers on
  a configured allowlist (`ALLOWED_HOSTS`, plus a small built-in default covering
  `pokerth.net` and localhost). Any other destination is refused. Without this, a
  public WebSocket would let anyone tunnel TCP to arbitrary hosts.
- **Upstream port allowlist (anti-SSRF).** Connections are also restricted to an
  allowed port list (`ALLOWED_PORTS`, default `7234`). Because localhost is in the
  host allowlist, this stops a request such as `host=127.0.0.1&port=22` from
  reaching local services (SSH, MySQL, ...).
- **TLS verification on by default.** Certificate verification is enabled for
  upstream TLS connections. The `--insecure` flag disables it and must only be
  used for development or trusted local testing.
- **Token-gated admin API.** Every `/admin/*` action requires a secret token,
  sent in an `Authorization: Bearer <token>` header so it never lands in URLs or
  logs. With no token configured, all admin actions are refused.
- **Hideable admin surface.** When `ADMIN_ENABLED` is off (or after
  `pokerth-web admin off`), `/admin` and every `/admin/*` route return a plain
  `404` -- the panel is fully hidden, not merely inert.
- **Relay frame-size cap.** The custom broadcast relays drop oversized frames
  (over 32 KB, mainly large image avatars) before fan-out, and relays are scoped
  per upstream so they only reach players on the same server.
- **Bounded in-memory logging.** A capped ring buffer of recent log lines is kept
  and exposed only through the token-gated `/admin/logs` endpoint.

## Additional hardening to add before public exposure

The proxy does not do these itself; put it behind a reverse proxy and add:

- **Origin checks** on the WebSocket upgrade.
- **Rate limiting** for connections and HTTP endpoints.
- **TLS termination** at a reverse proxy (e.g. Nginx + Let's Encrypt -- see the
  README), which also provides the `wss://` many mobile browsers require.
- **Process isolation** -- run as a dedicated non-root user (the one-liner
  installer already does this under PM2).

## Password storage

For production use the web client should avoid persisting account passwords in
browser storage; prefer short-lived sessions or no persistence. Registered-account
passwords are only ever sent to the server over TLS.

## Protocol validation

The PokerTH wire protocol now ships as a generated Protobuf bundle in
`public/proto/` (built from `pokerth.proto`). Migrating the client's remaining
hand-written codec paths fully onto the generated classes -- with encode/decode
tests -- is in progress, and further reduces the risk of mishandling malformed
messages.

## Reporting a vulnerability

Please report security issues privately to the maintainer (or via a minimal,
non-public issue) rather than disclosing details publicly until a fix is
available.
