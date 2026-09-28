# Notes for Claude

## Git: author vs committer

Commits made from a Claude session must stay **Verified** on GitHub. GitHub checks
the signature against the **committer**, and the session signs with Claude's own
SSH key, so:

- **Author** = narmod: pass `--author="narmod <arnaud.obscur@gmail.com>"` on every commit.
- **Committer** = keep the session default (`Claude <noreply@anthropic.com>`).
  Never override it: do not change `user.name` / `user.email`, and do not set
  `GIT_COMMITTER_NAME` / `GIT_COMMITTER_EMAIL`.
- Keep commit signing on (`commit.gpgsign=true`, the session default).

If the committer is set to narmod while the commit is signed with the session key,
GitHub shows **Unverified** (`unknown_key`).

Example:

```sh
git commit --author="narmod <arnaud.obscur@gmail.com>" -m "…"
```
