#!/usr/bin/env bash
#
# PokerTH Web Client — one-line installer
#
#   curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh | bash
#
# Prefer to read before you run? (recommended for any curl|bash installer):
#
#   curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh -o install.sh
#   less install.sh        # inspect it
#   bash install.sh        # then run it
#
# Installs and starts the PokerTH Web Client proxy on a fresh Debian/Ubuntu
# machine: Node.js 20 (NodeSource), PM2, the project, and a PM2 service that
# survives reboots. PM2 runs as a NON-root user.
#
# The script asks a few questions when run in a terminal. When piped without a
# terminal (CI/automation) it uses defaults, which you can override with env
# vars:
#
#   PORT          HTTP/WebSocket port            (default: 8080)
#   NO_TLS        set to 1 for LAN mode (--notls)(default: TLS on)
#   INSTALL_DIR   install location               (default: <run-user home>/pokerth-web-client)
#   RUN_USER      user that runs PM2             (default: invoking user, or 'pokerth' if run as root)
#   APP_NAME      PM2 process name               (default: pokerth-web)
#   SETUP_FIREWALL set to 1 to open the port in ufw (default: ask / no)
#   REPO_URL      git URL to clone               (default: official repo)
#   BRANCH        branch/ref to check out        (default: repo default)
#   NODE_MAJOR    Node.js major version          (default: 20)
#   ASSUME_YES    set to 1 to skip the final confirmation
#
# Licensed under AGPL-3.0-or-later, same as the project.

set -euo pipefail

# ── Defaults (env overrides win; empty means "ask or use built-in default") ───
REPO_URL="${REPO_URL:-https://github.com/narmod/pokerth-web-client.git}"
BRANCH="${BRANCH:-}"
APP_NAME="${APP_NAME:-pokerth-web}"
NODE_MAJOR="${NODE_MAJOR:-20}"
PORT="${PORT:-}"
NO_TLS="${NO_TLS:-}"
INSTALL_DIR="${INSTALL_DIR:-}"
RUN_USER="${RUN_USER:-}"
SETUP_FIREWALL="${SETUP_FIREWALL:-}"
ASSUME_YES="${ASSUME_YES:-}"

# ── Pretty output ─────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'; C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'; C_RED=$'\033[31m'; C_CYAN=$'\033[36m'
else
  C_RESET=""; C_BOLD=""; C_DIM=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_CYAN=""
fi
info()  { printf '%s▶%s %s\n' "$C_CYAN"   "$C_RESET" "$*"; }
ok()    { printf '%s✓%s %s\n' "$C_GREEN"  "$C_RESET" "$*"; }
warn()  { printf '%s!%s %s\n' "$C_YELLOW" "$C_RESET" "$*"; }
errln() { printf '%s✗%s %s\n' "$C_RED"    "$C_RESET" "$*" >&2; }
step()  { printf '\n%s== %s ==%s\n' "$C_BOLD" "$*" "$C_RESET"; }

trap 'errln "Installation failed on line $LINENO. See the output above."' ERR

# ── Prompt helpers (read from the terminal even when piped via curl|bash) ─────
HAS_TTY=0
if [ -e /dev/tty ] && [ -r /dev/tty ] && [ -w /dev/tty ]; then HAS_TTY=1; fi

ask() { # ask "Question" "default" -> echoes the answer (or default)
  local prompt="$1" default="$2" answer=""
  if [ "$HAS_TTY" -eq 1 ]; then
    printf '%s%s%s [%s]: ' "$C_BOLD" "$prompt" "$C_RESET" "$default" > /dev/tty
    read -r answer < /dev/tty || answer=""
  fi
  printf '%s' "${answer:-$default}"
}

ask_yn() { # ask_yn "Question" "Y|N" -> returns 0 for yes, 1 for no
  local prompt="$1" default="$2" answer="" hint="[Y/n]"
  [ "$default" = "N" ] && hint="[y/N]"
  if [ "$HAS_TTY" -eq 1 ]; then
    printf '%s%s%s %s: ' "$C_BOLD" "$prompt" "$C_RESET" "$hint" > /dev/tty
    read -r answer < /dev/tty || answer=""
  fi
  answer="${answer:-$default}"
  case "$answer" in [Yy]*) return 0 ;; *) return 1 ;; esac
}

# ── Privilege helpers ─────────────────────────────────────────────────────────
as_root() { # run a command with root privileges
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}
run_as() { # run a command as the (non-root) service user
  if [ "$RUN_USER" = "$(id -un)" ]; then "$@"; else sudo -u "$RUN_USER" -H "$@"; fi
}

# ── Intro banner ──────────────────────────────────────────────────────────────
cat <<BANNER

${C_BOLD}${C_GREEN}  PokerTH Web Client — installer${C_RESET}
${C_DIM}  A modern browser client for PokerTH. AGPL-3.0-or-later.${C_RESET}

  This script will:
    • install git, curl, build tools, Node.js ${NODE_MAJOR} and PM2 (system-wide, via apt)
    • download the project and its runtime dependencies
    • run the proxy under PM2 as a ${C_BOLD}non-root${C_RESET} user, with start-on-boot

  Source: ${REPO_URL}
  ${C_DIM}Tip: you can inspect this script first — download it and open it before running.${C_RESET}
BANNER

# ── Preflight ─────────────────────────────────────────────────────────────────
step "Preflight"
if ! command -v apt-get >/dev/null 2>&1; then
  errln "This installer targets Debian/Ubuntu (apt-get not found)."
  errln "On other systems, follow the manual steps in the README instead."
  exit 1
fi
ok "Debian/Ubuntu detected."

if [ "$(id -u)" -ne 0 ] && ! command -v sudo >/dev/null 2>&1; then
  errln "Need root for apt, but neither root nor sudo is available."
  exit 1
fi

# ── Decide which (non-root) user will run PM2 ─────────────────────────────────
if [ -z "$RUN_USER" ]; then
  if [ "$(id -u)" -eq 0 ]; then
    if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
      RUN_USER="$SUDO_USER"   # invoked via sudo by a normal user
    else
      RUN_USER="$(ask 'Running as root. Name of the non-root user to run PokerTH' 'pokerth')"
    fi
  else
    RUN_USER="$(id -un)"      # normal user runs it for themselves
  fi
fi
if [ "$RUN_USER" = "root" ]; then
  warn "PM2 would run as root. For safety, pick a non-root user instead."
  RUN_USER="$(ask 'Non-root user to run PokerTH' 'pokerth')"
  [ "$RUN_USER" = "root" ] && { errln "Refusing to run PM2 as root."; exit 1; }
fi

# Predicted home (real value re-read after the user is ensured to exist)
if id -u "$RUN_USER" >/dev/null 2>&1; then
  RUN_HOME="$(getent passwd "$RUN_USER" | cut -d: -f6)"
else
  RUN_HOME="/home/$RUN_USER"
fi
[ -n "$INSTALL_DIR" ] || INSTALL_DIR="$RUN_HOME/pokerth-web-client"

# ── Gather the remaining options ──────────────────────────────────────────────
step "Configuration"
[ -n "$PORT" ] || PORT="$(ask 'HTTP/WebSocket port' '8080')"
case "$PORT" in ''|*[!0-9]*) warn "Invalid port, using 8080"; PORT=8080 ;; esac
{ [ "$PORT" -ge 1 ] && [ "$PORT" -le 65535 ]; } || { warn "Port out of range, using 8080"; PORT=8080; }

if [ -z "$NO_TLS" ]; then
  if ask_yn 'LAN-only mode (disable TLS)?' 'N'; then NO_TLS=1; fi
fi

INSTALL_DIR="$(ask 'Install directory' "$INSTALL_DIR")"

if [ -z "$SETUP_FIREWALL" ] && command -v ufw >/dev/null 2>&1; then
  if ask_yn "Open port ${PORT} in ufw?" 'N'; then SETUP_FIREWALL=1; fi
fi

# ── Summary + confirmation (before any change) ────────────────────────────────
tls_state="enabled"; [ -n "$NO_TLS" ] && tls_state="disabled (LAN)"
fw_state="no"; [ -n "$SETUP_FIREWALL" ] && fw_state="yes (ufw, port $PORT)"
cat <<SUMMARY

${C_BOLD}  Please confirm:${C_RESET}
    Run-as user : ${RUN_USER}
    Install dir : ${INSTALL_DIR}
    Port        : ${PORT}
    TLS         : ${tls_state}
    PM2 name    : ${APP_NAME}
    Open firewall: ${fw_state}
SUMMARY

if [ -z "$ASSUME_YES" ] && [ "$HAS_TTY" -eq 1 ]; then
  ask_yn 'Proceed with installation?' 'Y' || { info "Aborted. Nothing was changed."; exit 0; }
else
  info "Non-interactive mode — proceeding with the settings above."
fi

# ── 1. Base packages ──────────────────────────────────────────────────────────
step "Installing base packages"
export DEBIAN_FRONTEND=noninteractive
as_root apt-get update -y
as_root apt-get install -y ca-certificates curl git build-essential
ok "Base packages ready."

# ── 2. Ensure the service user exists ─────────────────────────────────────────
step "Ensuring user '${RUN_USER}' exists"
if id -u "$RUN_USER" >/dev/null 2>&1; then
  ok "User '${RUN_USER}' already exists."
else
  info "Creating system user '${RUN_USER}' (no password; login via su/sudo only)"
  as_root useradd --create-home --shell /bin/bash "$RUN_USER"
  ok "User '${RUN_USER}' created."
fi
RUN_HOME="$(getent passwd "$RUN_USER" | cut -d: -f6)"

# ── 3. Node.js ────────────────────────────────────────────────────────────────
step "Ensuring Node.js >= ${NODE_MAJOR}"
need_node=1
if command -v node >/dev/null 2>&1; then
  cur="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$cur" -ge "$NODE_MAJOR" ] 2>/dev/null; then
    ok "Node.js $(node -v) already installed."; need_node=0
  else
    warn "Node.js $(node -v) is older than v${NODE_MAJOR}; upgrading."
  fi
fi
if [ "$need_node" -eq 1 ]; then
  if [ "$(id -u)" -eq 0 ]; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  else
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  fi
  as_root apt-get install -y nodejs
  ok "Node.js $(node -v) installed."
fi

# ── 4. PM2 ────────────────────────────────────────────────────────────────────
step "Ensuring PM2"
if command -v pm2 >/dev/null 2>&1; then
  ok "PM2 already installed ($(pm2 -v))."
else
  as_root npm install -g pm2
  ok "PM2 $(pm2 -v) installed."
fi

# ── 5. Clone or update the project (as the service user) ──────────────────────
step "Fetching the project into ${INSTALL_DIR}"
if [ -d "$INSTALL_DIR/.git" ]; then
  info "Existing checkout — updating with git pull"
  run_as git -C "$INSTALL_DIR" pull --ff-only
else
  if [ -e "$INSTALL_DIR" ] && [ -n "$(ls -A "$INSTALL_DIR" 2>/dev/null)" ]; then
    errln "$INSTALL_DIR exists and is not empty (and not a git checkout)."
    errln "Move it aside or set INSTALL_DIR to a different path, then re-run."
    exit 1
  fi
  as_root mkdir -p "$(dirname "$INSTALL_DIR")"
  as_root chown "$RUN_USER":"$RUN_USER" "$(dirname "$INSTALL_DIR")" 2>/dev/null || true
  run_as git clone "$REPO_URL" "$INSTALL_DIR"
fi
[ -n "$BRANCH" ] && run_as git -C "$INSTALL_DIR" checkout "$BRANCH"
ok "Source ready."

# ── 6. Dependencies ───────────────────────────────────────────────────────────
step "Installing npm dependencies (runtime only)"
( cd "$INSTALL_DIR" && run_as npm install --omit=dev )
ok "Dependencies installed."

# ── 7. Start under PM2 (as the service user) ──────────────────────────────────
step "Starting the proxy under PM2 (port ${PORT}, user ${RUN_USER})"
if run_as pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  info "Process '$APP_NAME' exists — recreating it"
  run_as pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
fi
pm2_args=("proxy.js" --name "$APP_NAME" -- "$PORT")
[ -n "$NO_TLS" ] && pm2_args+=("--notls")
( cd "$INSTALL_DIR" && run_as pm2 start "${pm2_args[@]}" )
run_as pm2 save
ok "Proxy running as PM2 process '$APP_NAME' (user ${RUN_USER})."

# ── 8. Boot persistence ───────────────────────────────────────────────────────
step "Enabling start on boot"
if command -v systemctl >/dev/null 2>&1; then
  node_bin_dir="$(dirname "$(command -v node)")"
  if as_root env "PATH=$PATH:$node_bin_dir" pm2 startup systemd -u "$RUN_USER" --hp "$RUN_HOME" >/dev/null 2>&1; then
    run_as pm2 save >/dev/null 2>&1 || true
    ok "PM2 will restart the proxy after a reboot."
  else
    warn "Could not auto-configure boot startup. Run 'pm2 startup' as ${RUN_USER} and follow its instructions."
  fi
else
  warn "systemd not detected — skipping boot persistence."
fi

# ── 9. Firewall (optional) ────────────────────────────────────────────────────
if [ -n "$SETUP_FIREWALL" ] && command -v ufw >/dev/null 2>&1; then
  step "Opening port ${PORT} in ufw"
  as_root ufw allow "${PORT}/tcp" || warn "Could not add ufw rule (is ufw enabled?)."
  ok "Firewall rule added."
fi

# ── Summary ───────────────────────────────────────────────────────────────────
ip_guess="$(hostname -I 2>/dev/null | awk '{print $1}')"
[ -z "$ip_guess" ] && ip_guess="<server-ip>"

step "Done!"
ok "PokerTH Web Client is installed and running."
cat <<DONE

  ${C_BOLD}Local:${C_RESET}   http://localhost:${PORT}
  ${C_BOLD}LAN:${C_RESET}     http://${ip_guess}:${PORT}

  Manage it (as ${RUN_USER}):
    sudo -u ${RUN_USER} pm2 status
    sudo -u ${RUN_USER} pm2 logs ${APP_NAME}
    sudo -u ${RUN_USER} pm2 restart ${APP_NAME}

  ${C_YELLOW}Recommended:${C_RESET} put Nginx + Let's Encrypt in front for HTTPS — many mobile
  browsers block plain ws://. See the README 'Installation' section:
    https://github.com/narmod/pokerth-web-client#readme
DONE
