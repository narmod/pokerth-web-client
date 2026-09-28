# Notes for Claude

## Git: commits show narmod only

On GitHub, every commit must appear as made by **narmod alone** (no "narmod and claude").

- **Author and committer** = `narmod <arnaud.obscur@gmail.com>`.
- **No `Co-Authored-By:` trailer** in commit messages (it adds Claude as a co-author).
- **No signing**: the session key is Claude's, so a commit signed with it under
  narmod's identity shows **Unverified**. Unsigned commits show no badge.

Commit like this:

```sh
git -c user.name=narmod -c user.email=arnaud.obscur@gmail.com -c commit.gpgsign=false \
  commit -m "…"
```
