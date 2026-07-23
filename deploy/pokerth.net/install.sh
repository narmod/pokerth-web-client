#!/bin/sh
# ── PokerTH Web Client — pokerth.net clean (re)install ───────────────────────
# One-shot, idempotent deployment for the pokerth.net host. Run as a user with
# docker access, from anywhere:
#
#     sh deploy/pokerth.net/install.sh
#
# What it does, in order:
#   1. stops the compose stack (old containers)
#   2. syncs the checkout to origin/main (refspec-proof)
#   3. installs .env (from env.example, only if missing) and the network
#      override (only if missing) — existing files are NEVER overwritten
#   4. creates the shared docker network if it does not exist yet
#   5. pulls the latest image and recreates the container from scratch
#   6. verifies: container health + HTTP answer + self-update mode
#
# Safe to re-run at any time. Self-update (SELF_UPDATE=1) is the compose
# default: after this script, all future updates happen from /admin.

set -eu

# ── Locate the repo root (this script lives in deploy/pokerth.net/) ──────────
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$REPO_DIR"
echo "==> Repo: $REPO_DIR"

command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found in PATH"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "ERROR: docker compose v2 required"; exit 1; }

# ── 1. Stop the stack ────────────────────────────────────────────────────────
echo "==> Stopping existing stack (if any)"
docker compose down --remove-orphans 2>/dev/null || true

# Anything else still holding :8080? Warn, don't guess.
if command -v ss >/dev/null 2>&1 && ss -tln 2>/dev/null | grep -q ':8080 '; then
  echo "WARNING: something outside this compose still listens on :8080."
  echo "         Find it with: ss -tlnp | grep 8080   — then kill it and re-run."
fi

# ── 2. Sync the checkout ─────────────────────────────────────────────────────
echo "==> Syncing checkout to origin/main"
git fetch origin main
git merge --ff-only FETCH_HEAD || {
  echo "WARNING: fast-forward failed (local commits or diverged history)."
  echo "         Resolve manually, or: git reset --hard FETCH_HEAD  (discards local changes to tracked files)"
}
echo "    at $(git rev-parse --short HEAD)"

# ── 3. Config files (never overwrite existing ones) ──────────────────────────
if [ ! -f .env ]; then
  cp "$SCRIPT_DIR/env.example" .env
  chmod 600 .env
  echo "==> .env installed from template — EDIT IT to set STATS_ADMIN_TOKEN"
else
  echo "==> .env already present — left untouched"
  # Append the game-server allowlist only if absent (idempotent).
  grep -q '^ALLOWED_HOSTS=' .env || echo "ALLOWED_HOSTS=pthsrv.pokerth.net" >> .env
  grep -q '^ALLOWED_PORTS=' .env || echo "ALLOWED_PORTS=7234,7236" >> .env
fi

if [ ! -f docker-compose.override.yml ]; then
  cp "$SCRIPT_DIR/docker-compose.override.yml" docker-compose.override.yml
  echo "==> docker-compose.override.yml installed (shared nginx network)"
else
  echo "==> docker-compose.override.yml already present — left untouched"
  grep -q 'pokerth_web_net' docker-compose.override.yml || \
    echo "    NOTE: it does not mention pokerth_web_net — nginx may not reach the container by name."
fi

# ── 4. Shared network ────────────────────────────────────────────────────────
if ! docker network inspect pokerth_web_net >/dev/null 2>&1; then
  echo "==> Creating docker network pokerth_web_net"
  docker network create pokerth_web_net
else
  echo "==> Network pokerth_web_net exists"
fi

# ── 5. Fresh container ───────────────────────────────────────────────────────
echo "==> Pulling latest image"
docker compose pull
echo "==> Recreating container"
docker compose up -d --force-recreate

# ── 6. Verify ────────────────────────────────────────────────────────────────
echo "==> Waiting for the app to come up"
i=0
while [ $i -lt 30 ]; do
  if docker exec pokerth-web-client wget -qO- http://127.0.0.1:8080/__ver >/dev/null 2>&1; then
    break
  fi
  i=$((i+1)); sleep 2
done
docker compose ps
echo "==> /__ver: $(docker exec pokerth-web-client wget -qO- http://127.0.0.1:8080/__ver 2>/dev/null | head -c 120 || echo 'no answer yet')"
echo "==> entrypoint log (self-update provisioning):"
docker logs pokerth-web-client 2>&1 | grep -i '\[entrypoint\]' | tail -5 || true

cat << 'DONE'

──────────────────────────────────────────────────────────────────────────────
Done. Final checks:
  • https://webclient.pokerth.net/admin → Status must show:
        Install: docker-git        ← self-update active, Update button works
  • If nginx shows 502: its upstream must be  pokerth-web-client:8080  on the
    pokerth_web_net network (vhost already configured that way).
  • First boot clones the repo into the pokerth-app volume — needs outbound
    HTTPS to github.com. If offline it falls back to the image code
    ("Install: docker-image") and retries at next restart.
All future webclient updates: /admin → Update. No SSH needed.
──────────────────────────────────────────────────────────────────────────────
DONE
