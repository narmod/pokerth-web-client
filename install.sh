#!/usr/bin/env bash
#
# PokerTH Web Client — installer / updater / uninstaller
#
#   Install:    curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh | bash
#   Update:     curl -sSL .../install.sh | bash -s -- update
#   Uninstall:  curl -sSL .../install.sh | bash -s -- uninstall
#   Status:     curl -sSL .../install.sh | bash -s -- status
#
# After a first install, a 'pokerth-web' command is added so you can simply run:
#   sudo pokerth-web update
#   sudo pokerth-web uninstall
#   pokerth-web status
#   sudo pokerth-web reset-stats
#   sudo pokerth-web set-period yearly
#
# Prefer to read before you run? (recommended for any curl|bash installer):
#   curl -sSL .../install.sh -o install.sh ; less install.sh ; bash install.sh
#
# Targets Debian/Ubuntu. Installs Node.js 20 (NodeSource), PM2, the project,
# and a boot-persistent PM2 service that runs as a NON-root user.
#
# Environment overrides (all optional):
#   PORT NO_TLS INSTALL_DIR RUN_USER APP_NAME SETUP_FIREWALL ASSUME_YES
#   REPO_URL BRANCH NODE_MAJOR
#
# Licensed under AGPL-3.0-or-later, same as the project.

set -euo pipefail

# ── Defaults (env wins; empty means "ask / detect / built-in default") ────────
REPO_URL="${REPO_URL:-https://github.com/narmod/pokerth-web-client.git}"
BRANCH="${BRANCH:-}"
NODE_MAJOR="${NODE_MAJOR:-20}"
PORT="${PORT:-}"
NO_TLS="${NO_TLS:-}"
INSTALL_DIR="${INSTALL_DIR:-}"
RUN_USER="${RUN_USER:-}"
APP_NAME="${APP_NAME:-}"
SETUP_FIREWALL="${SETUP_FIREWALL:-}"
ASSUME_YES="${ASSUME_YES:-}"
STATS_RESET_PERIOD="${STATS_RESET_PERIOD:-}"
STATS_ADMIN_TOKEN="${STATS_ADMIN_TOKEN:-}"
DEFAULT_APP_NAME="pokerth-web"
CONF="/etc/pokerth-web.conf"
CREATED_USER=""

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

trap 'errln "Command failed on line $LINENO. See the output above."' ERR

# ── Prompt helpers (read the terminal even when piped via curl|bash) ──────────
HAS_TTY=0
if [ -e /dev/tty ] && [ -r /dev/tty ] && [ -w /dev/tty ]; then HAS_TTY=1; fi
ask() {
  local prompt="$1" default="$2" answer=""
  if [ "$HAS_TTY" -eq 1 ]; then
    printf '%s%s%s [%s]: ' "$C_BOLD" "$prompt" "$C_RESET" "$default" > /dev/tty
    read -r answer < /dev/tty || answer=""
  fi
  printf '%s' "${answer:-$default}"
}
ask_yn() {
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
as_root() { if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi; }
run_as()  { if [ "$RUN_USER" = "$(id -un)" ]; then "$@"; else sudo -u "$RUN_USER" -H "$@"; fi; }

require_apt() {
  if ! command -v apt-get >/dev/null 2>&1; then
    errln "This installer targets Debian/Ubuntu (apt-get not found)."
    errln "On other systems, follow the manual steps in the README instead."
    exit 1
  fi
  if [ "$(id -u)" -ne 0 ] && ! command -v sudo >/dev/null 2>&1; then
    errln "Need root for apt, but neither root nor sudo is available."
    exit 1
  fi
}

run_home_of() { getent passwd "$1" 2>/dev/null | cut -d: -f6; }

# ── State file (written on install, read on update/uninstall) ─────────────────
conf_get() { sed -n "s/^$1=//p" "$CONF" 2>/dev/null | head -n1; }
load_state() {
  if [ -f "$CONF" ]; then
    [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$(conf_get INSTALL_DIR)"
    [ -n "$RUN_USER" ]    || RUN_USER="$(conf_get RUN_USER)"
    [ -n "$APP_NAME" ]    || APP_NAME="$(conf_get APP_NAME)"
    [ -n "$PORT" ]        || PORT="$(conf_get PORT)"
    [ -n "$NO_TLS" ]      || NO_TLS="$(conf_get NO_TLS)"
    [ -n "$CREATED_USER" ] || CREATED_USER="$(conf_get CREATED_USER)"
    [ -n "$STATS_RESET_PERIOD" ] || STATS_RESET_PERIOD="$(conf_get STATS_RESET_PERIOD)"
    [ -n "$STATS_ADMIN_TOKEN" ]  || STATS_ADMIN_TOKEN="$(conf_get STATS_ADMIN_TOKEN)"
  fi
  APP_NAME="${APP_NAME:-$DEFAULT_APP_NAME}"
}
write_state() {
  as_root tee "$CONF" >/dev/null <<EOF
# PokerTH Web Client — installer state (managed automatically; do not edit)
INSTALL_DIR=$INSTALL_DIR
RUN_USER=$RUN_USER
APP_NAME=$APP_NAME
PORT=$PORT
NO_TLS=$NO_TLS
CREATED_USER=$CREATED_USER
STATS_RESET_PERIOD=$STATS_RESET_PERIOD
STATS_ADMIN_TOKEN=$STATS_ADMIN_TOKEN
EOF
}

# ── Management wrapper: /usr/local/bin/pokerth-web ────────────────────────────
install_wrapper() {
  as_root tee /usr/local/bin/pokerth-web >/dev/null <<'WRAP'
#!/usr/bin/env bash
# Thin management wrapper for the PokerTH Web Client installer.
CONF=/etc/pokerth-web.conf
DIR=""
[ -f "$CONF" ] && DIR="$(sed -n 's/^INSTALL_DIR=//p' "$CONF" | head -n1)"
if [ -n "$DIR" ] && [ -f "$DIR/install.sh" ]; then
  exec bash "$DIR/install.sh" "$@"
fi
echo "pokerth-web: local install.sh not found; fetching from GitHub." >&2
exec bash -c "$(curl -sSL https://raw.githubusercontent.com/narmod/pokerth-web-client/HEAD/install.sh)" -- "$@"
WRAP
  as_root chmod +x /usr/local/bin/pokerth-web
}

# ── (Re)start the PM2 app with the persisted env applied, then save ───────────
# Used by install / update / set-period / set-token so STATS_RESET_PERIOD and
# STATS_ADMIN_TOKEN always follow the process — across updates and reboots.
app_restart() {
  local envv=()
  [ -n "$STATS_RESET_PERIOD" ] && envv+=("STATS_RESET_PERIOD=$STATS_RESET_PERIOD")
  [ -n "$STATS_ADMIN_TOKEN" ]  && envv+=("STATS_ADMIN_TOKEN=$STATS_ADMIN_TOKEN")
  if run_as pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    run_as env "${envv[@]}" pm2 restart "$APP_NAME" --update-env
  else
    local pm2_args=("proxy.js" --name "$APP_NAME" -- "${PORT:-8080}")
    [ -n "$NO_TLS" ] && pm2_args+=("--notls")
    ( cd "$INSTALL_DIR" && run_as env "${envv[@]}" pm2 start "${pm2_args[@]}" )
  fi
  run_as pm2 save >/dev/null 2>&1 || true
}

# ── INSTALL ───────────────────────────────────────────────────────────────────
do_install() {
  cat <<BANNER

${C_BOLD}${C_GREEN}  PokerTH Web Client — installer${C_RESET}
${C_DIM}  A modern browser client for PokerTH. AGPL-3.0-or-later.${C_RESET}

  This script will:
    • install git, curl, build tools, Node.js ${NODE_MAJOR} and PM2 (system-wide, via apt)
    • download the project and its runtime dependencies
    • run the proxy under PM2 as a ${C_BOLD}non-root${C_RESET} user, with start-on-boot
    • add a 'pokerth-web' command for updates and uninstall

  Source: ${REPO_URL}
  ${C_DIM}Tip: you can inspect this script first — download it and open it before running.${C_RESET}
BANNER

  step "Preflight"
  require_apt
  ok "Debian/Ubuntu detected."

  # Decide the non-root run user
  if [ -z "$RUN_USER" ]; then
    if [ "$(id -u)" -eq 0 ]; then
      if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
        RUN_USER="$SUDO_USER"
      else
        RUN_USER="$(ask 'Running as root. Non-root user to run PokerTH' 'pokerth')"
      fi
    else
      RUN_USER="$(id -un)"
    fi
  fi
  if [ "$RUN_USER" = "root" ]; then
    warn "PM2 should not run as root."
    RUN_USER="$(ask 'Non-root user to run PokerTH' 'pokerth')"
    [ "$RUN_USER" = "root" ] && { errln "Refusing to run PM2 as root."; exit 1; }
  fi
  if id -u "$RUN_USER" >/dev/null 2>&1; then RUN_HOME="$(run_home_of "$RUN_USER")"; else RUN_HOME="/home/$RUN_USER"; fi
  [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$RUN_HOME/pokerth-web-client"
  APP_NAME="${APP_NAME:-$DEFAULT_APP_NAME}"

  step "Configuration"
  [ -n "$PORT" ] || PORT="$(ask 'HTTP/WebSocket port' '8080')"
  case "$PORT" in ''|*[!0-9]*) warn "Invalid port, using 8080"; PORT=8080 ;; esac
  { [ "$PORT" -ge 1 ] && [ "$PORT" -le 65535 ]; } || { warn "Port out of range, using 8080"; PORT=8080; }
  if [ -z "$NO_TLS" ]; then ask_yn 'LAN-only mode (disable TLS)?' 'N' && NO_TLS=1 || NO_TLS=""; fi
  INSTALL_DIR="$(ask 'Install directory' "$INSTALL_DIR")"
  if [ -z "$SETUP_FIREWALL" ] && command -v ufw >/dev/null 2>&1; then
    ask_yn "Open port ${PORT} in ufw?" 'N' && SETUP_FIREWALL=1 || SETUP_FIREWALL=""
  fi

  local tls_state="enabled" fw_state="no"
  [ -n "$NO_TLS" ] && tls_state="disabled (LAN)"
  [ -n "$SETUP_FIREWALL" ] && fw_state="yes (ufw, port $PORT)"
  cat <<SUMMARY

${C_BOLD}  Please confirm:${C_RESET}
    Run-as user  : ${RUN_USER}
    Install dir  : ${INSTALL_DIR}
    Port         : ${PORT}
    TLS          : ${tls_state}
    PM2 name     : ${APP_NAME}
    Open firewall: ${fw_state}
SUMMARY
  if [ -z "$ASSUME_YES" ] && [ "$HAS_TTY" -eq 1 ]; then
    ask_yn 'Proceed with installation?' 'Y' || { info "Aborted. Nothing was changed."; exit 0; }
  else
    info "Non-interactive mode — proceeding with the settings above."
  fi

  step "Installing base packages"
  export DEBIAN_FRONTEND=noninteractive
  as_root apt-get update -y
  as_root apt-get install -y ca-certificates curl git build-essential
  ok "Base packages ready."

  step "Ensuring user '${RUN_USER}' exists"
  if id -u "$RUN_USER" >/dev/null 2>&1; then
    ok "User '${RUN_USER}' already exists."
  else
    info "Creating system user '${RUN_USER}'"
    as_root useradd --create-home --shell /bin/bash "$RUN_USER"
    CREATED_USER=1
    ok "User '${RUN_USER}' created."
  fi
  RUN_HOME="$(run_home_of "$RUN_USER")"

  step "Ensuring Node.js >= ${NODE_MAJOR}"
  local need_node=1 cur
  if command -v node >/dev/null 2>&1; then
    cur="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
    if [ "$cur" -ge "$NODE_MAJOR" ] 2>/dev/null; then ok "Node.js $(node -v) already installed."; need_node=0
    else warn "Node.js $(node -v) older than v${NODE_MAJOR}; upgrading."; fi
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

  step "Ensuring PM2"
  if command -v pm2 >/dev/null 2>&1; then ok "PM2 already installed ($(pm2 -v))."
  else as_root npm install -g pm2; ok "PM2 $(pm2 -v) installed."; fi

  step "Fetching the project into ${INSTALL_DIR}"
  if [ -d "$INSTALL_DIR/.git" ]; then
    info "Existing checkout — updating with git pull"
    run_as git -C "$INSTALL_DIR" pull --ff-only
  else
    if [ -e "$INSTALL_DIR" ] && [ -n "$(ls -A "$INSTALL_DIR" 2>/dev/null)" ]; then
      errln "$INSTALL_DIR exists and is not empty (and not a git checkout). Aborting."
      exit 1
    fi
    as_root mkdir -p "$(dirname "$INSTALL_DIR")"
    as_root chown "$RUN_USER":"$RUN_USER" "$(dirname "$INSTALL_DIR")" 2>/dev/null || true
    run_as git clone "$REPO_URL" "$INSTALL_DIR"
  fi
  [ -n "$BRANCH" ] && run_as git -C "$INSTALL_DIR" checkout "$BRANCH"
  ok "Source ready."

  step "Installing npm dependencies (runtime only)"
  ( cd "$INSTALL_DIR" && run_as npm install --omit=dev )
  ok "Dependencies installed."

  step "Starting the proxy under PM2 (port ${PORT}, user ${RUN_USER})"
  if run_as pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    info "Process '$APP_NAME' exists — recreating it"
    run_as pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  fi
  local envv=()
  [ -n "$STATS_RESET_PERIOD" ] && envv+=("STATS_RESET_PERIOD=$STATS_RESET_PERIOD")
  [ -n "$STATS_ADMIN_TOKEN" ]  && envv+=("STATS_ADMIN_TOKEN=$STATS_ADMIN_TOKEN")
  local pm2_args=("proxy.js" --name "$APP_NAME" -- "$PORT")
  [ -n "$NO_TLS" ] && pm2_args+=("--notls")
  ( cd "$INSTALL_DIR" && run_as env "${envv[@]}" pm2 start "${pm2_args[@]}" )
  run_as pm2 save
  ok "Proxy running as PM2 process '$APP_NAME'."

  step "Enabling start on boot"
  if command -v systemctl >/dev/null 2>&1; then
    local node_bin_dir; node_bin_dir="$(dirname "$(command -v node)")"
    if as_root env "PATH=$PATH:$node_bin_dir" pm2 startup systemd -u "$RUN_USER" --hp "$RUN_HOME" >/dev/null 2>&1; then
      run_as pm2 save >/dev/null 2>&1 || true
      ok "PM2 will restart the proxy after a reboot."
    else
      warn "Could not auto-configure boot startup. Run 'pm2 startup' as ${RUN_USER} manually."
    fi
  else
    warn "systemd not detected — skipping boot persistence."
  fi

  if [ -n "$SETUP_FIREWALL" ] && command -v ufw >/dev/null 2>&1; then
    step "Opening port ${PORT} in ufw"
    as_root ufw allow "${PORT}/tcp" || warn "Could not add ufw rule (is ufw enabled?)."
    ok "Firewall rule added."
  fi

  step "Finishing up"
  write_state
  install_wrapper
  ok "Saved state to ${CONF} and installed the 'pokerth-web' command."

  local ip_guess; ip_guess="$(hostname -I 2>/dev/null | awk '{print $1}')"; [ -z "$ip_guess" ] && ip_guess="<server-ip>"
  step "Done!"
  ok "PokerTH Web Client is installed and running."
  cat <<DONE

  ${C_BOLD}Local:${C_RESET}   http://localhost:${PORT}
  ${C_BOLD}LAN:${C_RESET}     http://${ip_guess}:${PORT}

  Manage it:
    sudo pokerth-web update      # pull latest + restart
    sudo pokerth-web uninstall   # remove the service
    pokerth-web status           # show status
    sudo pokerth-web reset-stats # reset the family leaderboard
    sudo pokerth-web set-period yearly   # off | daily | monthly | yearly

  ${C_YELLOW}Recommended:${C_RESET} put Nginx + Let's Encrypt in front for HTTPS (many mobile
  browsers block plain ws://). See the README 'Manual installation' section.
DONE
}

# ── UPDATE ──────────────────────────────────────────────────────────────────--
do_update() {
  step "PokerTH Web Client — update"
  require_apt
  load_state
  if [ -z "$INSTALL_DIR" ] || [ ! -d "$INSTALL_DIR/.git" ]; then
    INSTALL_DIR="$(ask 'Path to the existing install' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  fi
  [ -d "$INSTALL_DIR/.git" ] || { errln "No git checkout at $INSTALL_DIR. Cannot update."; exit 1; }
  [ -n "$RUN_USER" ] || RUN_USER="$(ask 'User that runs the service' "$(id -un)")"
  ok "Updating '$APP_NAME' in $INSTALL_DIR (user $RUN_USER)"

  info "git pull"
  run_as git -C "$INSTALL_DIR" pull --ff-only
  info "npm install (runtime only)"
  ( cd "$INSTALL_DIR" && run_as npm install --omit=dev )
  info "Restarting PM2 process (re-applying saved settings)"
  app_restart
  # refresh the wrapper + state in case paths changed
  install_wrapper 2>/dev/null || true
  write_state 2>/dev/null || true
  ok "Update complete. Current commit:"
  run_as git -C "$INSTALL_DIR" --no-pager log -1 --oneline || true
}

# ── UNINSTALL ─────────────────────────────────────────────────────────────────
do_uninstall() {
  step "PokerTH Web Client — uninstall"
  load_state
  [ -n "$RUN_USER" ] || RUN_USER="$(ask 'User that runs the service' "$(id -un)")"
  RUN_HOME="$(run_home_of "$RUN_USER")"; [ -n "$RUN_HOME" ] || RUN_HOME="/home/$RUN_USER"

  cat <<WARN

  This will stop and remove the PM2 service '${APP_NAME}' (user ${RUN_USER})
  and its boot entry. It will NOT remove Node.js, PM2, or apt packages.
WARN
  if [ -z "$ASSUME_YES" ]; then
    if [ "$HAS_TTY" -eq 1 ]; then
      ask_yn 'Proceed with uninstall?' 'N' || { info "Aborted. Nothing was changed."; exit 0; }
    else
      errln "Refusing to uninstall non-interactively. Re-run with ASSUME_YES=1 to force."
      exit 1
    fi
  fi

  info "Stopping and deleting the PM2 process"
  run_as pm2 delete "$APP_NAME" >/dev/null 2>&1 || warn "Process '$APP_NAME' was not running."
  run_as pm2 save >/dev/null 2>&1 || true

  info "Removing boot entry"
  if command -v systemctl >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
    as_root env "PATH=$PATH:$(dirname "$(command -v node)")" pm2 unstartup systemd -u "$RUN_USER" --hp "$RUN_HOME" >/dev/null 2>&1 \
      || warn "Could not remove the boot entry automatically."
  fi

  # Optional: install directory
  if [ -n "$INSTALL_DIR" ] && [ -d "$INSTALL_DIR" ]; then
    if { [ "$HAS_TTY" -eq 1 ] && ask_yn "Delete the install directory ${INSTALL_DIR}?" 'N'; } || [ "$ASSUME_YES" = "purge" ]; then
      as_root rm -rf "$INSTALL_DIR"
      ok "Removed $INSTALL_DIR."
    else
      info "Kept $INSTALL_DIR."
    fi
  fi

  # Optional: the dedicated user we created
  if [ "$CREATED_USER" = "1" ] && [ "$RUN_USER" != "$(id -un)" ] && id -u "$RUN_USER" >/dev/null 2>&1; then
    if { [ "$HAS_TTY" -eq 1 ] && ask_yn "Delete the service user '${RUN_USER}' and its home?" 'N'; } || [ "$ASSUME_YES" = "purge" ]; then
      as_root userdel --remove "$RUN_USER" 2>/dev/null || warn "Could not delete user '$RUN_USER'."
      ok "Removed user '$RUN_USER'."
    else
      info "Kept user '$RUN_USER'."
    fi
  fi

  info "Removing the 'pokerth-web' command and state file"
  as_root rm -f /usr/local/bin/pokerth-web "$CONF" 2>/dev/null || true

  step "Done"
  ok "PokerTH Web Client has been uninstalled."
  info "Node.js and PM2 were left installed. Remove them manually if unused:"
  printf '    sudo npm remove -g pm2\n    sudo apt-get remove nodejs\n'
}

# ── STATUS ──────────────────────────────────────────────────────────────────--
do_status() {
  load_state
  [ -n "$RUN_USER" ] || RUN_USER="$(id -un)"
  step "PokerTH Web Client — status"
  printf '  Install dir : %s\n  Run-as user : %s\n  PM2 name    : %s\n  Port        : %s\n\n' \
    "${INSTALL_DIR:-?}" "$RUN_USER" "$APP_NAME" "${PORT:-?}"
  if command -v pm2 >/dev/null 2>&1; then
    run_as pm2 describe "$APP_NAME" 2>/dev/null || warn "Process '$APP_NAME' not found in PM2."
  else
    warn "PM2 is not installed."
  fi
}

# ── RESET STATS ───────────────────────────────────────────────────────────────
do_reset_stats() {
  step "PokerTH Web Client — reset leaderboard"
  load_state
  [ -n "$RUN_USER" ] || RUN_USER="$(id -un)"
  if [ -z "$INSTALL_DIR" ] || [ ! -f "$INSTALL_DIR/scripts/reset-stats.mjs" ]; then
    INSTALL_DIR="$(ask 'Path to the existing install' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  fi
  [ -f "$INSTALL_DIR/scripts/reset-stats.mjs" ] || {
    errln "reset-stats.mjs not found in $INSTALL_DIR — run 'pokerth-web update' first."; exit 1; }
  warn "This wipes the shared family leaderboard (stats.json)."
  warn "Per-device session stats (in each browser) are NOT affected."
  if [ "${ASSUME_YES:-}" = "1" ]; then
    :
  elif [ "$HAS_TTY" -eq 1 ]; then
    ask_yn 'Reset the leaderboard now?' 'N' || { info "Aborted. Nothing was changed."; exit 0; }
  else
    errln "Refusing to reset non-interactively. Re-run with ASSUME_YES=1 to force."
    exit 1
  fi
  info "Clearing the leaderboard"
  run_as node "$INSTALL_DIR/scripts/reset-stats.mjs"
  info "Restarting PM2 process so the running proxy drops its in-memory copy"
  if command -v pm2 >/dev/null 2>&1 && run_as pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    run_as pm2 restart "$APP_NAME" --update-env
  else
    warn "PM2 process '$APP_NAME' not found — restart the proxy manually if it is running."
  fi
  ok "Leaderboard reset."
}

# ── SET RESET PERIOD ──────────────────────────────────────────────────────────
do_set_period() {
  local val="${1:-}"
  case "$val" in
    off|daily|monthly|yearly) ;;
    *) errln "Usage: pokerth-web set-period <off|daily|monthly|yearly>"; exit 1 ;;
  esac
  load_state
  [ -n "$RUN_USER" ] || RUN_USER="$(id -un)"
  [ -n "$INSTALL_DIR" ] || { errln "No install found (missing $CONF). Install first."; exit 1; }
  step "PokerTH Web Client — set reset period: $val"
  STATS_RESET_PERIOD="$val"
  write_state
  info "Applying and restarting"
  app_restart
  ok "Leaderboard reset period is now '$val'."
}

# ── SET ADMIN TOKEN ───────────────────────────────────────────────────────────
do_set_token() {
  load_state
  [ -n "$RUN_USER" ] || RUN_USER="$(id -un)"
  [ -n "$INSTALL_DIR" ] || { errln "No install found (missing $CONF). Install first."; exit 1; }
  STATS_ADMIN_TOKEN="${1:-}"
  step "PokerTH Web Client — set admin token"
  write_state
  info "Applying and restarting"
  app_restart
  if [ -n "$STATS_ADMIN_TOKEN" ]; then ok "Admin token set — remote reset endpoint enabled."
  else ok "Admin token cleared — remote reset endpoint disabled."; fi
}

usage() {
  cat <<USAGE
PokerTH Web Client installer

Usage: install.sh [command]

Commands:
  install     Install and start (default)
  update      Pull the latest version and restart
  uninstall   Stop and remove the service
  status      Show the current status
  reset-stats Reset the shared family leaderboard (stats.json)
  set-period  Set auto-reset period: off | daily | monthly | yearly
  set-token   Set (or clear) the admin token for the remote reset endpoint
  help        Show this help

Via the one-liner, pass a command after '-- ':
  curl -sSL .../install.sh | bash -s -- update

You can also choose the reset period at install time, e.g.:
  curl -sSL .../install.sh | STATS_RESET_PERIOD=yearly bash
USAGE
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
CMD="${1:-install}"
case "$CMD" in
  install)        do_install ;;
  update)         do_update ;;
  uninstall)      do_uninstall ;;
  status)         do_status ;;
  reset-stats|stats-reset) do_reset_stats ;;
  set-period)     do_set_period "$2" ;;
  set-token)      do_set_token "$2" ;;
  help|-h|--help) usage ;;
  *) errln "Unknown command: $CMD"; echo; usage; exit 1 ;;
esac
