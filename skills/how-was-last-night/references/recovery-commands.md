# Recovery commands

Read-only commands for reconstructing prior context, used by `how-was-last-night`.
Run what the step needs, read the output, and stop when the state is clear. Every
command here is non-destructive: none writes, none moves a ref, none touches the
working tree. Anything that does is the job of `safe-git`, with authorization.

## Start here

- `git status` — what is modified, staged or untracked. These are unfinished work,
  not noise.
- `git rev-parse --abbrev-ref HEAD` — which branch you are on.
- `git log -1 --format=%H%n%an%n%ad%n%s%n%b` — the last commit in full, message and
  body.
- `git diff --stat` — the shape of uncommitted work without reading it yet.

## Find the last verified state

- `git log --oneline -20` — the recent sequence of changes.
- `git show --stat HEAD` — what the last commit touched, and how large it was.
- `git log -20 --format=%h %ad %s --date=short` — when the work happened, which
  separates active threads from abandoned ones.
- `git reflog -20` — recent HEAD movements, including commits that were made and then
  moved, reset or rebased away. Read-only; it never restores anything.
- `git log -20 --grep='fix\|revert\|hotfix' -i` — corrections, which often explain
  why the current code looks the way it does.
- `git log --oneline -- tests/` or the project's test path — whether the recent work
  shipped with tests.

## Read what changed

- `git show <sha>` — one commit in full, with its message.
- `git show <sha> --stat` — the same commit, files only.
- `git diff <a>..<b>` — everything between two states.
- `git diff HEAD~1 -- <path>` — what the last commit did to one file.
- `git diff --staged` — work that was ready to commit but not committed.
- `git diff` — work in progress that was never staged.

## Branch comparisons

- `git branch -vv` — every local branch, its upstream, and how far ahead or behind it
  is.
- `git log --oneline --left-right main...HEAD` — commits on your branch that are not
  on main, and the reverse. This is the shape of unpublished work.
- `git log --oneline main..HEAD` — only your branch's commits.
- `git log --oneline HEAD..main` — commits you are missing.
- `git branch --sort=-committerdate --format='%(refname:short) %(committerdate:short)'`
  — every branch with its last activity, which finds abandoned threads.

## Stashes

- `git stash list` — how many stashes exist and when each was made.
- `git stash show -p stash@{0}` — the contents of one stash, without applying it.
- Never `git stash pop`, `drop` or `apply` to inspect. Recovery is read-only.

## Unfinished work markers

Search recent history first so the noise stays bounded; use `-S` when you want every
commit that touched a marker.

- `git grep -n -E 'TODO|FIXME|HACK|XXX' -- <path>` — open markers in the tree.
- `git log -S 'TODO' --oneline -10` — when markers were added or removed, which
  separates live work from years-old leftovers.
- `git grep -n -E '\.skip|\.only|xit\(|xdescribe\(|@Ignore' -- tests/` — disabled or
  focused tests, a common sign work stopped mid-verification.
- `rg -n 'merge conflict|<<<<<<<|>>>>>>>' --hidden -g '!.git'` — unresolved conflicts.
- `ls plan.md TODO.md tasks.md CHECKLIST.md notes/ docs/adr 2>/dev/null` — plan,
  checklist and decision records, under whatever name this project uses.

## Artifacts and intent

- `git log -5 --format='%H%n%B%n---'` — the last few commits with full bodies, which
  is where decisions and reasons usually live.
- `cat CHANGELOG.md` — what the project itself considers notable, in its own words.
- `ls docs/adr docs/decisions 2>/dev/null` — architecture decision records.
- `ls -lt .opencode .claude .cursor 2>/dev/null` — local agent or session artifacts
  that may hold plans or notes.
- `find . -path ./.git -prune -o -newermt '-3 days' -type f -print | head -50` —
  files touched in the last three days, which is often the fastest way to find where
  someone actually stopped.

## Keep it cheap

Start with `git status` and `git log --oneline -20`. Add a command only because a
specific question is unanswered. Recovery that reads the whole repository history is
a different task from resuming, and usually a sign the real question belongs in
`git log -- <path>`.
