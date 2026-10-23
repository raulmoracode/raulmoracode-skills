---
name: safe-git
description: "Protects repository state and uncommitted work during any Git operation. Use before or after a reset, rebase, checkout, restore, clean, stash, branch deletion, history rewrite or force push, and whenever the working tree is dirty or you are unsure what a command will destroy. Inspects status first, makes work safe before acting, triages destructive commands, verifies the result of each operation, and recovers losses through the reflog, stash and ORIG_HEAD."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0
max-depth: 0
supports: []
```

Operational metadata only; related skills are conceptual unless listed here.

# Safe git

Every state-changing Git command is a bet on what the repository currently looks like.
Most data loss in agent sessions comes from a command that was reasonable against the
state you believed existed and catastrophic against the state that did.

**Core rule:** uncommitted changes and untracked files are the user's work, not yours
to discard. Preserve first, act second.

## When to use

Load this before any operation that can lose content or rewrite history, and any time
you touch a tree that is not yours:

- The working tree is dirty and you want to switch branches, rebase, pull or reset.
- The request contains reset, checkout, restore, clean, rebase, revert, filter-branch,
  branch -D, am -D, force push, or gc/prune.
- A local `git merge`, pull or rebase left conflicts, or a local sync, reset, rebase or
  undo must be settled. A remote PR merge belongs to `git-merge`, not here.
- You are unsure whether a file is tracked, ignored, staged, or safe to overwrite.
- A destructive command already ran and content is missing.

Do not use to: decide branch lifecycle → `git-branch`; open the PR → `git-pr`; merge a
remote PR or authorize one → `git-merge`; choose what to build → `plan-before-coding`;
assess what a change breaks → `blast-radius`.

## Know the state before you touch it

Never run a state-changing command against an assumed repository. Collect the facts in
one read-only pass:

- `git status --short --branch` — staged, unstaged and untracked work, plus how far
  ahead or behind the upstream is.
- `git stash list` — parked work you are about to duplicate, overwrite or misattribute.
- `git log --branches --not --remotes --oneline` — commits that exist only here. These
  are the ones a reset erases without any warning.
- `git worktree list` — other checkouts sharing this repository's objects.
- `git diff --stat` and `git diff --cached --stat` — modified versus staged.
- `git remote -v` — whether this is even the repository you think it is.

## Make the work safe before the operation

Pick the least invasive option that makes the current state recoverable, in this order:

1. **Commit it.** The strongest safety: a commit survives any destructive command and can
   still be reset, amended or dropped.
2. **Branch it.** `git switch -c rescue/<what>` carries a dirty tree to a new branch and
   gives the work a name.
3. **Stash it, with a message.** `git stash push -u -m "wip: <what> and why"`. The `-u`
   includes untracked files, which a plain `git stash` leaves behind in the tree. A
   described stash is recoverable; an anonymous one you must interpret later is not.
4. **Do not act.** If the user's work blocks the operation, report the state and ask.

## Destructive command triage

Know what each of these takes before running it. None runs without explicit
authorization:

| Command | What it destroys | Recovery |
| --- | --- | --- |
| `checkout -- <path>`, `restore <path>` | uncommitted edits in those paths | nothing unless committed or stashed |
| `reset --hard` | every uncommitted tracked change | commits via `ORIG_HEAD`; the uncommitted edits are gone |
| `reset` (mixed) | commit position; index unstaged | `ORIG_HEAD`, `reflog` |
| `clean -fd` | untracked files and directories, including ones Git never saw | almost none; already-deleted files are gone |
| `rebase` | commit hashes and identities of every replayed commit | `ORIG_HEAD` holds the pre-rebase tip |
| `rebase -i` with `drop` | the dropped commits | `reflog`, until `gc` expires them |
| `branch -D` | commits reachable only from that branch | `git branch <name> <sha>` while the reflog holds it |
| `push --force` | remote commits you do not have locally | remote reflog or another clone; often unrecoverable |
| `push --force-with-lease` | the same, but refuses when the remote moved | same, and the retry is still safe |
| `am -D`, `am --abort` | the patch series and in-progress conflict state | rarely |
| `filter-branch`, `filter-repo` | history across every ref | only a backup ref you made first |
| `gc --prune=now`, `prune` | unreachable objects, the last recovery path for all of the above | nothing; they are expired |
| `push --delete <branch>` | the remote branch and its pull request | sometimes the remote reflog; assume not |

Authorization is not a blank check. Before running one, state what it destroys, how it
recovers, and whether that recovery path is real. "The reflog probably has it" is not a
recovery path; say that it is a hope, not a plan.

## Verify after every state-changing operation

No output and no error does not mean the command did what you meant. Re-read the state:

- `git status --short --branch` — the tree is what you expect, nothing new untracked.
- `git log --oneline --decorate -5` and `git reflog -5` — history and `HEAD` moved as
  intended, and `ORIG_HEAD` exists after a reset, rebase or merge.
- `git diff --stat <base>...HEAD` — the change set matches the task's scope.
- `git stash list` — anything stashed is still there, with the message you gave it.
- After a rebase, merge or am: resolve or abort deliberately. An unfinished operation
  leaves the repository in a state where every other command behaves oddly.

## Recover when something is already gone

Work down this list before retyping anything:

1. **`git reflog`** — every position `HEAD` has held, including commits no branch
   points at. Then `git switch -c recovered/<sha> <sha>` to bring one back by name.
   This is the first move for a bad rebase, reset or deleted branch.
2. **`git stash list`** — `git stash show -p stash@{2}`, then `git stash pop`, or
   `apply` to keep it parked. Applies only onto a compatible tree.
3. **`ORIG_HEAD`** — set by reset, rebase, merge and pull; the direct before-pointer.
4. **Remote or another clone** — commits a force push removed can often be recovered
   from a colleague's clone or a fork. Ask rather than assume.
5. **Untracked files deleted by `git clean`** — normally unrecoverable. Editor local
   history, OS snapshots or backups sometimes hold a copy; say plainly when they do not.

## Interaction with other skills

- `git-workflow` — owns the full flow for committed changes; this skill owns repository
  safety, dirty-tree resolution, rebase/reset/undo and destructive operations inside the
  flow.
- `git-branch` — owns branch lifecycle; it defers here for any dirty-tree or rewrite step.
- `git-pr` — owns pull requests and external actions; this skill owns the local state
  underneath them, including force pushes.
- `git-merge` — owns remote PR merging and its authorization; this skill owns local merge
  conflicts, local sync, reset/rebase/undo and history recovery. A remote merge is not a
  local history operation.
- `minimal-changes` — owns the size of the diff; this skill owns not losing what is
  already in the tree.
- `understand-before-acting` — inspects the repository before changing it; this is the
  Git-specific safety pass.
- `verify-before-claiming` — sets the evidence bar, including the evidence that an
  operation succeeded.
- `dont-ask-shit` — owns when to interrupt the user rather than infer; a destructive
  command is one of those moments.

## Anti-patterns

- `git reset --hard` or `git checkout -- .` to "clean up" a tree you did not create.
- `git restore .` to dismiss a conflict you have not actually read.
- Anonymous `git stash`, then popping the wrong entry later.
- `git clean -fd` without a dry run first (`git clean -nd`).
- `git push --force` where `--force-with-lease` would do, or on a shared branch.
- Assuming the tree is clean because your own edits have vanished from it.
- Rewriting published history without checking who else built on it.
- Declaring work lost or recovered without looking at the reflog.
- Silently stashing a user's work and never restoring it.
- Treating a remote PR merge as a local history operation, or a local conflict as
  `git-merge`'s problem.

## Definition of done

The state before and after each operation was read rather than assumed; every
destructive command carried explicit authorization and a stated recovery path; nothing
the user created was discarded; and anything parked in a stash or branch is retrievable
by name.
