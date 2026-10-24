#!/bin/sh
# ═══════════════════════════════════════════════════════════════════
# PokerTH Arena — install or update on a Linux server, without Docker
# (service 0.37.0). Plain POSIX sh.
#
#   sudo ./install.sh            install, or update an install
#   sudo ./install.sh status     what runs, where
#
# What it does:
#   - checks Node.js 18 or later;
#   - copies the Arena to $PREFIX (default /opt/pokerth-arena), keeping the
#     data in $DATA (default /var/lib/pokerth-arena) untouched;
#   - makes a system user « pokerth-arena »;
#   - writes $ENVFILE (default /etc/pokerth-arena.env, mode 600) once, with a
#     new master key (ARENA_ADMIN_TOKEN) — an update never changes it;
#   - installs and starts the systemd service « pokerth-arena ».
# Then: put a reverse proxy with HTTPS in front of 127.0.0.1:8091, set
# ARENA_TRUST_PROXY=1 and ARENA_PUBLIC_URL in $ENVFILE, and link the web
# client (README.md, « Link with a web client »).
# Overrides for tests: PREFIX, DATA, ENVFILE, UNITDIR, NO_SYSTEMD=1, NO_USER=1.
# ═══════════════════════════════════════════════════════════════════
set -eu

PREFIX=${PREFIX:-/opt/pokerth-arena}
DATA=${DATA:-/var/lib/pokerth-arena}
ENVFILE=${ENVFILE:-/etc/pokerth-arena.env}
UNITDIR=${UNITDIR:-/etc/systemd/system}
SERVICE=pokerth-arena
RUNUSER=pokerth-arena
SRC=$(cd "$(dirname "$0")" && pwd)

say() { printf '%s\n' "$*"; }
die() { printf 'install.sh: %s\n' "$*" >&2; exit 1; }

status() {
  say "Arena in:   $PREFIX ($( [ -f "$PREFIX/package.json" ] && sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$PREFIX/package.json" | head -n 1 || echo 'not installed'))"
  say "Data in:    $DATA"
  say "Settings:   $ENVFILE"
  if command -v systemctl >/dev/null 2>&1 && [ "${NO_SYSTEMD:-0}" != 1 ]; then systemctl --no-pager status "$SERVICE" 2>/dev/null | head -n 5 || true; fi
}

if [ "${1:-install}" = status ]; then status; exit 0; fi
[ "${1:-install}" = install ] || die "unknown command: $1 (install, status)"

# ── checks ──
if [ "${NO_USER:-0}" != 1 ] && [ "$(id -u)" != 0 ]; then die "run it as root (sudo ./install.sh)"; fi
command -v node >/dev/null 2>&1 || die "Node.js 18 or later is needed (https://nodejs.org)"
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] || die "Node.js 18 or later is needed (found $(node -v))"
[ -f "$SRC/server.mjs" ] || die "run it from the Arena's folder"
[ -f "$SRC/shared/proto/pokerth-bundle.mjs" ] || die "shared/ is empty: run node scripts/sync-shared.mjs <web client folder> first"

# ── user ──
if [ "${NO_USER:-0}" != 1 ] && ! id "$RUNUSER" >/dev/null 2>&1; then
  if command -v useradd >/dev/null 2>&1; then useradd --system --home-dir "$DATA" --shell /usr/sbin/nologin "$RUNUSER"
  else adduser -S -H -h "$DATA" -s /sbin/nologin "$RUNUSER"; fi
  say "user $RUNUSER made"
fi

# ── files: the code replaced, the data kept ──
mkdir -p "$PREFIX" "$DATA"
for item in server.mjs package.json CHANGELOG.md README.md lib bin public shared scripts; do
  [ -e "$SRC/$item" ] || continue
  rm -rf "${PREFIX:?}/$item.new"
  cp -R "$SRC/$item" "$PREFIX/$item.new"
  rm -rf "${PREFIX:?}/$item"
  mv "$PREFIX/$item.new" "$PREFIX/$item"
done
if [ "${NO_USER:-0}" != 1 ]; then chown -R "$RUNUSER" "$DATA"; fi
chmod 700 "$DATA"
VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$PREFIX/package.json" | head -n 1)
say "Arena $VERSION copied to $PREFIX"

# ── settings, once ──
if [ ! -f "$ENVFILE" ]; then
  TOKEN=$(od -An -tx1 -N24 /dev/urandom | tr -d ' \n')
  umask 077
  cat > "$ENVFILE" <<EOF
# PokerTH Arena settings (install.sh). Restart after a change:
#   systemctl restart $SERVICE
# The super admin's master key (sign in on /arena/organize with it).
ARENA_ADMIN_TOKEN=$TOKEN
ARENA_DIR=$DATA
ARENA_HOST=127.0.0.1
ARENA_PORT=8091
# Behind a reverse proxy: the player's address from X-Forwarded-For.
ARENA_TRUST_PROXY=0
# The Arena's public address (pictures of shared links), e.g. https://arena.example.org
ARENA_PUBLIC_URL=
EOF
  chmod 600 "$ENVFILE"
  say "settings written to $ENVFILE (master key inside)"
else
  say "settings kept: $ENVFILE"
fi

# ── service ──
if [ "${NO_SYSTEMD:-0}" = 1 ] || ! command -v systemctl >/dev/null 2>&1; then
  say "no systemd: start it with   env \$(grep -v '^#' $ENVFILE | xargs) node $PREFIX/server.mjs"
  exit 0
fi
NODE_BIN=$(command -v node)
cat > "$UNITDIR/$SERVICE.service" <<EOF
[Unit]
Description=PokerTH Arena (tournaments, cups, medals)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$RUNUSER
EnvironmentFile=$ENVFILE
WorkingDirectory=$PREFIX
ExecStart=$NODE_BIN $PREFIX/server.mjs
Restart=on-failure
RestartSec=5
KillMode=process
NoNewPrivileges=true
ProtectSystem=full
ReadWritePaths=$DATA

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable "$SERVICE" >/dev/null 2>&1 || true
systemctl restart "$SERVICE"
say "service $SERVICE started — http://127.0.0.1:8091/arena"
say "next: HTTPS reverse proxy, then link the web client (README.md)"
