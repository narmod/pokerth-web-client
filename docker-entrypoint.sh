#!/bin/sh
# ── PokerTH Web Client — Docker entrypoint ───────────────────────────────────
#
# Two run modes, selected by SELF_UPDATE:
#
#   SELF_UPDATE unset/0  (default)
#       Run the code baked into the image, from /app. Immutable install:
#       updates are done from the host with `docker compose pull && up -d`.
#       This is the historical behaviour — nothing changes for existing users.
#
#   SELF_UPDATE=1
#       On first start, provision a real git checkout of the repo into
#       $LIVE_DIR (a named volume, /srv/app by default) and run the app from
#       there. Because /srv/app is a genuine git work tree, the admin page
#       reports install mode "docker-git" and its Update button works: git
#       fetch + resync + npm install + SIGTERM, and the container's restart
#       policy brings the process back on the new code. No host clone, no
#       bind-mount, no SSH.
#
#       Every boot re-syncs the checkout to origin/$GIT_BRANCH, so a plain
#       `docker restart` is also a valid way to update.
#
# The image code in /app is NEVER modified: if anything goes wrong (no network
# on first boot, read-only volume, git missing), we log a warning and fall back
# to running the baked-in code. The container always starts.
#
# Untracked files are preserved by design — gallery packs imported from the
# admin page land in public/{table,cards,themes,seats}/ and are untracked, so
# the resync never deletes them.

set -e

APP_DIR=/app
LIVE_DIR="${LIVE_DIR:-/srv/app}"
GIT_REPO="${GIT_REPO:-https://github.com/narmod/pokerth-web-client.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"

log()  { echo "[entrypoint] $*"; }
warn() { echo "[entrypoint] WARNING: $*" >&2; }

# Exec the CMD from $1. Never returns.
start_in() {
  _dir="$1"; shift
  cd "$_dir" || { warn "cannot cd to $_dir"; exit 1; }
  log "starting from $_dir"
  exec "$@"
}

case "${SELF_UPDATE:-0}" in
  1|true|TRUE|yes|YES|on|ON) ;;
  *) start_in "$APP_DIR" "$@" ;;
esac

command -v git >/dev/null 2>&1 || {
  warn "SELF_UPDATE=1 but git is not installed — falling back to the image code"
  start_in "$APP_DIR" "$@"
}

mkdir -p "$LIVE_DIR" 2>/dev/null || true
[ -w "$LIVE_DIR" ] || {
  warn "$LIVE_DIR is not writable by uid $(id -u) — falling back to the image code"
  warn "mount a named volume there (see docker-compose.selfupdate.example.yml)"
  start_in "$APP_DIR" "$@"
}

# Same uid owns the tree, but be explicit: some storage drivers report a
# different owner and git then refuses to operate ("dubious ownership").
git config --global --add safe.directory "$LIVE_DIR" >/dev/null 2>&1 || true

# ── 1. Provision the checkout (first boot only) ──────────────────────────────
if [ ! -e "$LIVE_DIR/.git" ]; then
  log "provisioning git checkout in $LIVE_DIR ($GIT_REPO, branch $GIT_BRANCH)"
  if [ -n "$(ls -A "$LIVE_DIR" 2>/dev/null)" ]; then
    warn "$LIVE_DIR is not empty and has no .git — leaving it alone, using the image code"
    start_in "$APP_DIR" "$@"
  fi
  if ! git clone --depth 1 --branch "$GIT_BRANCH" "$GIT_REPO" "$LIVE_DIR"; then
    warn "clone failed (no network?) — falling back to the image code"
    rm -rf "$LIVE_DIR"/.git 2>/dev/null || true
    start_in "$APP_DIR" "$@"
  fi
fi

# ── 2. Re-sync to origin/$GIT_BRANCH on every boot ───────────────────────────
# Hard resync rather than merge: the container is a deploy target, not a work
# tree, and two tracked manifests (themes.json / seats.json) are regenerated at
# runtime, so they are routinely "locally modified". Untracked files survive.
# Note: options stay BEFORE the revision — `git checkout -B b REV --quiet`
# would be parsed as a pathspec.
if git -C "$LIVE_DIR" fetch --quiet --depth 1 origin "$GIT_BRANCH"; then
  git -C "$LIVE_DIR" checkout -q -f -B "$GIT_BRANCH" FETCH_HEAD \
    || warn "resync to FETCH_HEAD failed — keeping the current checkout"
else
  warn "fetch failed (offline?) — keeping the current checkout"
fi
log "checkout at $(git -C "$LIVE_DIR" rev-parse --short HEAD 2>/dev/null || echo '?')"

# ── 3. Runtime dependencies ──────────────────────────────────────────────────
# Seed from the image (already installed, offline-safe), then reinstall only if
# the pulled code actually declares different dependencies.
if [ ! -d "$LIVE_DIR/node_modules" ] && [ -d "$APP_DIR/node_modules" ]; then
  log "seeding node_modules from the image"
  cp -a "$APP_DIR/node_modules" "$LIVE_DIR/node_modules" || warn "seeding node_modules failed"
fi
if ! cmp -s "$APP_DIR/package.json" "$LIVE_DIR/package.json"; then
  log "package.json differs from the image — npm install (runtime deps only)"
  (cd "$LIVE_DIR" && npm install --omit=dev --no-audit --no-fund) \
    || warn "npm install failed — starting with the dependencies already present"
fi

start_in "$LIVE_DIR" "$@"
