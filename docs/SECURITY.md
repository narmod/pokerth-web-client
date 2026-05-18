# Security notes

## TLS verification

TLS certificate verification is enabled by default in the proxy.

The `--insecure` flag disables certificate verification and must only be used for development or trusted local testing.

## Password storage

The web client should avoid storing passwords in browser local storage for production use. A future version should prefer short-lived sessions or avoid persistence entirely.

## Proxy exposure

Do not expose the proxy publicly without additional hardening. At minimum, consider:

- Origin checks
- Rate limiting
- Host allowlists
- Logging
- TLS termination
- Process isolation

## Protocol validation

The protocol layer should be migrated to generated Protobuf classes to reduce malformed message handling risks.
