# Deployment kit — pokerth.net

Clean, one-shot (re)install of the webclient on the pokerth.net host:

```sh
sh deploy/pokerth.net/install.sh
```

Idempotent — safe to re-run. It stops the stack, syncs the checkout,
installs `.env` / the network override **only if missing**, creates the
`pokerth_web_net` network if needed, pulls the latest image and recreates
the container. Self-update is the compose default: afterwards, every
update is one click in `/admin` → Update.

Files:
- `install.sh` — the script
- `env.example` — `.env` template (set `STATS_ADMIN_TOKEN`!)
- `docker-compose.override.yml` — joins the shared nginx network
