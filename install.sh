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
#   sudo pokerth-web deck-add ./mydeck.zip   # add a gallery card deck
#   sudo pokerth-web deck-list
#   sudo pokerth-web deck-remove <id>
#   sudo pokerth-web table-add ./mytable.zip # add a table style (felt + pucks)
#   sudo pokerth-web table-list
#   sudo pokerth-web table-remove <id>
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
ADMIN_ENABLED="${ADMIN_ENABLED:-}"
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
# Commands run as RUN_USER go through 'sudo -u', which resets PATH to sudo's
# secure_path. On some systems that omits /usr/local/bin — where 'npm i -g'
# puts the pm2 binary — so pm2 (and its '#!/usr/bin/env node' shebang) cannot be
# found. Forcing a known-good PATH makes pm2/node/git reachable regardless.
SAFE_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
as_root() { if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi; }
run_as()  { if [ "$RUN_USER" = "$(id -un)" ]; then "$@"; else sudo -u "$RUN_USER" -H env "PATH=$SAFE_PATH" "$@"; fi; }

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
    [ -n "$ADMIN_ENABLED" ]      || ADMIN_ENABLED="$(conf_get ADMIN_ENABLED)"
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
ADMIN_ENABLED=$ADMIN_ENABLED
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
  [ -n "$ADMIN_ENABLED" ]      && envv+=("ADMIN_ENABLED=$ADMIN_ENABLED")
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
  [ -n "$ADMIN_ENABLED" ]      && envv+=("ADMIN_ENABLED=$ADMIN_ENABLED")
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
  regen_decks_manifest 2>/dev/null || true
  regen_themes_manifest 2>/dev/null || true
  regen_tables_manifest 2>/dev/null || true
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
  regen_decks_manifest 2>/dev/null || true
  regen_themes_manifest 2>/dev/null || true
  regen_tables_manifest 2>/dev/null || true
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

# ── ENABLE / DISABLE ADMIN PANEL ──────────────────────────────────────────────
# Visibility switch, independent from the admin token. `off` makes /admin (and
# every /admin/* route) answer 404 — the panel is fully hidden, not just inert.
# `on` serves it again; actions still require a token set via set-token.
do_admin() {
  local val="${1:-}"
  case "$val" in
    on|enable|enabled)    val="1" ;;
    off|disable|disabled) val="0" ;;
    *) errln "Usage: pokerth-web admin <on|off>"; exit 1 ;;
  esac
  load_state
  [ -n "$RUN_USER" ] || RUN_USER="$(id -un)"
  [ -n "$INSTALL_DIR" ] || { errln "No install found (missing $CONF). Install first."; exit 1; }
  ADMIN_ENABLED="$val"
  step "PokerTH Web Client — admin panel: $([ "$val" = 1 ] && echo on || echo off)"
  write_state
  info "Applying and restarting"
  app_restart
  if [ "$val" = "1" ]; then
    ok "Admin panel enabled — reachable at /admin."
    [ -n "$STATS_ADMIN_TOKEN" ] || warn "No admin token set; actions stay locked. Run: pokerth-web set-token <token>"
  else
    ok "Admin panel disabled — /admin now returns 404."
  fi
}

# ── Card decks (gallery) management ──────────────────────────────────────────
# Gallery decks live as UNTRACKED folders in public/cards/<id>/ (so 'git pull'
# preserves them) and are advertised to the web client via a generated
# public/cards/decks.json. Built-in decks (classic, svg) are part of the app.
regen_decks_manifest() {
  local cards="$INSTALL_DIR/public/cards"
  [ -d "$cards" ] || return 0
  command -v node >/dev/null 2>&1 || { warn "node not found; skipping decks.json"; return 0; }
  [ -f "$INSTALL_DIR/scripts/decks-manifest.mjs" ] || return 0
  run_as node "$INSTALL_DIR/scripts/decks-manifest.mjs" "$cards" || warn "decks.json generation failed"
}

# Theme packages live under public/themes/<id>/ (theme.json + optional felt image)
# and are advertised to the web client via a generated public/themes/themes.json.
regen_themes_manifest() {
  local themes="$INSTALL_DIR/public/themes"
  [ -d "$themes" ] || return 0
  command -v node >/dev/null 2>&1 || { warn "node not found; skipping themes.json"; return 0; }
  [ -f "$INSTALL_DIR/scripts/themes-manifest.mjs" ] || return 0
  run_as node "$INSTALL_DIR/scripts/themes-manifest.mjs" || warn "themes.json generation failed"
}

do_deck_add() {
  local src="${1:-}"
  [ -n "$src" ] || { errln "Usage: pokerth-web deck-add <zip-file-or-URL>"; exit 1; }
  load_state
  [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$(ask 'Install directory' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  [ -d "$INSTALL_DIR/public/cards" ] || { errln "No public/cards under $INSTALL_DIR. Is that the install dir?"; exit 1; }
  [ -n "$RUN_USER" ] || RUN_USER="$(id -un)"
  command -v node >/dev/null 2>&1 || { errln "node is required"; exit 1; }
  command -v unzip >/dev/null 2>&1 || { info "Installing unzip"; as_root apt-get install -y -q unzip >/dev/null; }

  local tmp ref; tmp="$(mktemp -d)"
  local zip="$tmp/deck.zip"
  case "$src" in
    http://*|https://*)
      info "Downloading deck"
      ref="$(printf '%s' "$src" | sed -E 's#(https?://[^/]+).*#\1/#')"
      curl -fSL --retry 2 \
        -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' \
        -e "$ref" "$src" -o "$zip" \
        || { errln "Download failed. The site may block direct downloads (403). Download the .zip in your browser, copy it to the server, then run: pokerth-web deck-add /path/to/file.zip"; rm -rf "$tmp"; exit 1; } ;;
    *) [ -f "$src" ] || { errln "File not found: $src"; rm -rf "$tmp"; exit 1; }; cp "$src" "$zip" ;;
  esac

  info "Extracting"
  unzip -q -o "$zip" -d "$tmp/x" || { errln "Not a valid zip archive"; rm -rf "$tmp"; exit 1; }

  local root=""
  if [ -f "$tmp/x/0.png" ] && [ -f "$tmp/x/flipside.png" ]; then
    root="$tmp/x"
  else
    root="$(find "$tmp/x" -type f -name '0.png' -printf '%h\n' 2>/dev/null | head -n1)"
  fi
  if [ -z "$root" ] || [ ! -f "$root/flipside.png" ]; then
    errln "This is not a PokerTH card deck (need 0.png..51.png + flipside.png)."; rm -rf "$tmp"; exit 1
  fi
  local missing=0 i
  for i in $(seq 0 51); do [ -f "$root/$i.png" ] || missing=$((missing+1)); done
  [ "$missing" -eq 0 ] || { errln "Incomplete deck: $missing of 52 card images missing."; rm -rf "$tmp"; exit 1; }

  local base; base="$(basename "$root")"
  if [ "$base" = "x" ]; then base="$(basename "$src")"; base="${base%.zip}"; fi
  local id; id="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_-' '-' | sed 's/--*/-/g; s/^-//; s/-$//')"
  [ -n "$id" ] || id="deck-$(date +%s)"
  case "$id" in svg) id="svg-deck" ;; esac

  local dest="$INSTALL_DIR/public/cards/$id"
  info "Installing as '$id'"
  as_root rm -rf "$dest"
  as_root mkdir -p "$dest"
  as_root cp "$root"/*.png "$dest"/ 2>/dev/null || true
  local f; for f in "$root"/*.xml; do [ -f "$f" ] && as_root cp "$f" "$dest"/; done
  as_root chown -R "$RUN_USER":"$RUN_USER" "$dest"
  rm -rf "$tmp"

  regen_decks_manifest
  local nm; nm="$(node -e 'try{const a=JSON.parse(require("fs").readFileSync(process.argv[1]+"/public/cards/decks.json","utf8"));const d=a.find(x=>x.id===process.argv[2]);process.stdout.write(d?d.name:process.argv[2]);}catch(e){process.stdout.write(process.argv[2]);}' "$INSTALL_DIR" "$id" 2>/dev/null || printf '%s' "$id")"
  ok "Installed deck: ${nm}  (id: ${id})"
  ok "It now appears in Theme -> Cards. No restart needed (static assets)."
}

do_deck_list() {
  load_state
  [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$(ask 'Install directory' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  local mf="$INSTALL_DIR/public/cards/decks.json"
  step "Installed card decks"
  echo "  Built-in: classic, svg"
  if [ -f "$mf" ] && command -v node >/dev/null 2>&1; then
    node -e 'try{const a=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));if(!a.length){console.log("  (no gallery decks installed)");}else{for(const d of a)console.log("  "+d.id+"  --  "+d.name);}}catch(e){console.log("  (no gallery decks installed)");}' "$mf"
  else
    echo "  (no gallery decks installed)"
  fi
}

do_deck_remove() {
  local id="${1:-}"
  [ -n "$id" ] || { errln "Usage: pokerth-web deck-remove <id>"; exit 1; }
  case "$id" in
    svg|classic) errln "'$id' is a built-in deck and cannot be removed."; exit 1 ;;
    *[!a-z0-9_-]*) errln "Invalid deck id: $id"; exit 1 ;;
  esac
  load_state
  [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$(ask 'Install directory' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  local dest="$INSTALL_DIR/public/cards/$id"
  [ -d "$dest" ] || { errln "No such deck installed: $id"; exit 1; }
  as_root rm -rf "$dest"
  regen_decks_manifest
  ok "Removed deck '$id'."
}

regen_tables_manifest() {
  local tbl="$INSTALL_DIR/public/table"
  [ -d "$tbl" ] || return 0
  command -v node >/dev/null 2>&1 || { warn "node not found; skipping tables.json"; return 0; }
  [ -f "$INSTALL_DIR/scripts/tables-manifest.mjs" ] || return 0
  run_as node "$INSTALL_DIR/scripts/tables-manifest.mjs" "$tbl" || warn "tables.json generation failed"
}

do_table_add() {
  local src="${1:-}"
  [ -n "$src" ] || { errln "Usage: pokerth-web table-add <zip-file-or-URL>"; exit 1; }
  load_state
  [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$(ask 'Install directory' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  [ -d "$INSTALL_DIR/public/table" ] || { errln "No public/table under $INSTALL_DIR. Is that the install dir?"; exit 1; }
  [ -n "$RUN_USER" ] || RUN_USER="$(id -un)"
  command -v node >/dev/null 2>&1 || { errln "node is required"; exit 1; }
  command -v unzip >/dev/null 2>&1 || { info "Installing unzip"; as_root apt-get install -y -q unzip >/dev/null; }

  local tmp ref; tmp="$(mktemp -d)"
  local zip="$tmp/table.zip"
  case "$src" in
    http://*|https://*)
      info "Downloading table style"
      ref="$(printf '%s' "$src" | sed -E 's#(https?://[^/]+).*#\1/#')"
      curl -fSL --retry 2 \
        -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' \
        -e "$ref" "$src" -o "$zip" \
        || { errln "Download failed. The site may block direct downloads (403). Download the .zip in your browser, copy it to the server, then run: pokerth-web table-add /path/to/file.zip"; rm -rf "$tmp"; exit 1; } ;;
    *) [ -f "$src" ] || { errln "File not found: $src"; rm -rf "$tmp"; exit 1; }; cp "$src" "$zip" ;;
  esac

  info "Extracting"
  unzip -q -o "$zip" -d "$tmp/x" || { errln "Not a valid zip archive"; rm -rf "$tmp"; exit 1; }

  local root=""
  if [ -f "$tmp/x/table.png" ]; then root="$tmp/x"; else
    root="$(find "$tmp/x" -type f -name 'table.png' -printf '%h\n' 2>/dev/null | head -n1)"; fi
  if [ -z "$root" ] || [ ! -f "$root/table.png" ]; then
    errln "This is not a PokerTH table style (need table.png, usually with *tablestyle.xml + puck images)."; rm -rf "$tmp"; exit 1; fi

  local base; base="$(basename "$root")"
  if [ "$base" = "x" ]; then base="$(basename "$src")"; base="${base%.zip}"; fi
  local id; id="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_-' '-' | sed 's/--*/-/g; s/^-//; s/-$//')"
  [ -n "$id" ] || id="table-$(date +%s)"
  case "$id" in green|blue|bordeaux|slate|photo|table) id="table-$id" ;; esac

  local dest="$INSTALL_DIR/public/table/$id"
  info "Installing as '$id'"
  as_root rm -rf "$dest"; as_root mkdir -p "$dest"
  if command -v convert >/dev/null 2>&1; then
    as_root convert "$root/table.png" -resize '1280x720>' -strip -quality 82 "$dest/felt.jpg" 2>/dev/null \
      || as_root cp "$root/table.png" "$dest/felt.png"
  else
    as_root cp "$root/table.png" "$dest/felt.png"
  fi
  [ -f "$root/dealerPuck.png" ]     && as_root cp "$root/dealerPuck.png"     "$dest/dealer.png"
  [ -f "$root/smallblindPuck.png" ] && as_root cp "$root/smallblindPuck.png" "$dest/sb.png"
  [ -f "$root/bigblindPuck.png" ]   && as_root cp "$root/bigblindPuck.png"   "$dest/bb.png"
  [ -f "$root/preview.png" ]        && as_root cp "$root/preview.png"        "$dest/preview.png"
  local f; for f in "$root"/*tablestyle.xml "$root"/*.xml; do [ -f "$f" ] && { as_root cp "$f" "$dest/style.xml"; break; }; done
  as_root chown -R "$RUN_USER":"$RUN_USER" "$dest"
  rm -rf "$tmp"

  regen_tables_manifest
  local nm; nm="$(node -e 'try{const a=JSON.parse(require("fs").readFileSync(process.argv[1]+"/public/table/tables.json","utf8"));const d=a.find(x=>x.id===process.argv[2]);process.stdout.write(d?d.name:process.argv[2]);}catch(e){process.stdout.write(process.argv[2]);}' "$INSTALL_DIR" "$id" 2>/dev/null || printf '%s' "$id")"
  ok "Installed table style: ${nm}  (id: ${id})"
  ok "It now appears in Theme -> Table (felt + matching pucks). No restart needed (static assets)."
}

do_table_list() {
  load_state
  [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$(ask 'Install directory' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  local mf="$INSTALL_DIR/public/table/tables.json"
  step "Installed table styles"
  echo "  Built-in: green (default), blue, bordeaux, slate, photo"
  if [ -f "$mf" ] && command -v node >/dev/null 2>&1; then
    node -e 'try{const a=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));if(!a.length){console.log("  (no imported table styles)");}else{for(const d of a)console.log("  "+d.id+"  --  "+d.name);}}catch(e){console.log("  (no imported table styles)");}' "$mf"
  else
    echo "  (no imported table styles)"
  fi
}

do_table_remove() {
  local id="${1:-}"
  [ -n "$id" ] || { errln "Usage: pokerth-web table-remove <id>"; exit 1; }
  case "$id" in
    green|blue|bordeaux|slate|photo) errln "'$id' is a built-in table and cannot be removed."; exit 1 ;;
    *[!a-z0-9_-]*) errln "Invalid table id: $id"; exit 1 ;;
  esac
  load_state
  [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$(ask 'Install directory' "${INSTALL_DIR:-$HOME/pokerth-web-client}")"
  local dest="$INSTALL_DIR/public/table/$id"
  [ -d "$dest" ] || { errln "No such table style installed: $id"; exit 1; }
  as_root rm -rf "$dest"
  regen_tables_manifest
  ok "Removed table style '$id'."
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
  admin       Show or hide the admin panel: on | off
  deck-add    Install a gallery card deck from a .zip file or URL
  deck-list   List installed card decks
  deck-remove Remove an installed gallery deck by id
  table-add   Install a table style (felt + pucks) from a .zip file or URL
  table-list  List installed table styles
  table-remove Remove an installed table style by id
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
  admin)          do_admin "$2" ;;
  deck-add|deck-install)  do_deck_add "${2:-}" ;;
  deck-list|deck-ls)      do_deck_list ;;
  deck-remove|deck-rm)    do_deck_remove "${2:-}" ;;
  table-add|table-install) do_table_add "${2:-}" ;;
  table-list|table-ls)     do_table_list ;;
  table-remove|table-rm)   do_table_remove "${2:-}" ;;
  help|-h|--help) usage ;;
  *) errln "Unknown command: $CMD"; echo; usage; exit 1 ;;
esac
