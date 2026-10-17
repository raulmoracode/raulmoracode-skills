---
name: git-branch
description: "Manages Git branches: creates, switches, renames, rebases and deletes them, following the repository's workflow for the base branch. Every branch it creates is named from a mandatory prefix table — feat/, fix/, hotfix/, bugfix/, chore/, refactor/, docs/, test/, style/, perf/, build/, ci/, revert/, release/, spike/, experiment/ — followed by a short, descriptive name. Use when asked to create or move work onto a branch, to isolate a change, to start from an up-to-date base, or to clean branches up. Keeps one logical change per branch and avoids creating branches the task or repository does not require."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-1
max-depth: 1
supports: [`safe-git`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Git branch

Branches are cheap to create and expensive to explain away. Most repositories want a
few well-named branches and a readable history; none of them want a pile of one-commit
branches nobody can classify or clean up.

**Core rule:** create a branch only when the task requires isolation or the
repository's workflow requires it. Every extra branch is permanent bookkeeping.

## When to use

- The user asked for a branch, or the change must be isolated from the current one.
- The repository's policy requires working on a branch: the default branch is protected,
  CI runs per PR, CONTRIBUTING says so.
- Work must be moved, split, or rebased onto a different line of development.

Do not use to: reset, clean or recover → `safe-git`. Open the PR → `git-pr`. Inspect
the repository before changing it → `understand-before-acting`.

## Process

### 1. Discover the base and the workflow first

The repository answers the parts it owns. Read it instead of guessing:

- `CONTRIBUTING.md`, `AGENTS.md`, `README.md`, `.github/` — a stated branching policy, a
  PR template, or a merge strategy that implies one.
- `gh repo view --json defaultBranchRef` — the actual default branch, which is not always
  `main` and not always what the README says.
- `gh pr list --state all --limit 30` — what kinds of branches actually get merged here.

Naming is not discovered: every branch this skill creates takes its prefix from the table
in step 4. If a repository's written policy explicitly requires a different naming scheme,
follow that policy and say so; otherwise the table is mandatory.

When the base is invisible and being wrong is costly, ask: a wrong base branch is a
rewrite.

### 2. Decide whether a branch is warranted

Create one when: the change is not going straight to the default branch, several changes
are in flight at once, the work is risky enough to deserve its own review surface, or
policy demands it.

Stay where you are when: the user asked for a commit here, you are on a branch someone
gave you and the work belongs on it, or a branch for this task already exists. Feeling
tidier is not a reason.

### 3. Start from a clean, current base

A branch cut from a stale base produces a PR full of unrelated reverts.

- `git fetch origin`, then `git switch <base>` and `git pull --ff-only`. `--ff-only`
  refuses to create a merge commit nobody asked for.
- If the tree is dirty, settle it with `safe-git` first: commit, stash with a message,
  or stop and report. Do not branch from a tree carrying work you have not accounted for.
- Create the branch from the updated base: `git switch -c <name> <base>`, or
  `git switch -c <name>` when you are already on it.

### 4. Name it from the mandatory prefix table

Every branch this skill creates must start with exactly one prefix from this table,
chosen by what the branch contains, followed by a short, descriptive name:

| Prefix | Purpose | Example |
| --- | --- | --- |
| `feat/` | New feature | `feat/user-authentication` |
| `fix/` | Bug fix | `fix/login-error` |
| `hotfix/` | Urgent production fix | `hotfix/payment-crash` |
| `bugfix/` | Bug correction | `bugfix/invalid-email` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `refactor/` | Code restructuring without changing behavior | `refactor/user-service` |
| `docs/` | Documentation changes | `docs/update-readme` |
| `test/` | Adding or modifying tests | `test/user-service` |
| `style/` | Code formatting and styling changes | `style/format-code` |
| `perf/` | Performance improvements | `perf/optimize-queries` |
| `build/` | Build system or dependency changes | `build/upgrade-vite` |
| `ci/` | CI/CD configuration changes | `ci/update-github-actions` |
| `revert/` | Reverting previous changes | `revert/add-user-auth` |
| `release/` | Preparing a new release | `release/1.2.0` |
| `spike/` | Research or feasibility investigation | `spike/new-search-engine` |
| `experiment/` | Experimenting with a new approach | `experiment/new-cache-strategy` |

Rules that keep the names usable:

- Exactly one prefix, never stacked (`feat/fix/...` is not a name).
- The part after the prefix is short and descriptive: a few words naming the outcome, not
  the activity — `fix/empty-env-lookup`, not `fix/editing-files`.
- Lowercase kebab-case, as in the examples. One logical change per branch: if the name
  needs an "and", it is two branches.
- When two prefixes both seem to fit, pick the one that is true: `hotfix/` only for an
  urgent production fix, `spike/` only when the deliverable is the answer rather than the
  change.

### 5. Keep it isolated

- Do not merge the default branch into a feature branch mid-work unless the repository
  says to; prefer rebasing before the PR opens.
- Do not add unrelated fixes, formatting sweeps or dependency bumps — `minimal-changes`
  owns that boundary.
- Watch `git log --oneline <base>..HEAD`: that is the list you are actually proposing.

## Check status before you switch

Run `git status --short --branch` before any checkout. A dirty tree either blocks the
switch or carries the changes onto the new branch, where they mix into a change set you
never intended. Settle it with `safe-git` first, or say explicitly what will happen to
those changes if you switch anyway.

## Use a worktree when isolation is genuinely needed

For two long-lived tasks that would otherwise share a checkout, a review that must not
touch your working tree, or a repro that needs to stay runnable:

- `git worktree add ../repo-review <branch>` gives a second checkout beside the
  repository with its own index, leaving the original's uncommitted work untouched.
- Remove it when finished: `git worktree remove ../repo-review`, plus
  `git worktree prune` for stale entries. Never delete the directory by hand; the
  metadata will disagree and later commands will refuse.
- A worktree is not a backup. Uncommitted work inside it is still uncommitted work.

## Interaction with other skills

- `safe-git` — owns repository safety and history recovery; every dirty-tree and rewrite
  step here defers to it. This skill owns branch lifecycle; safe-git owns what the
  repository state may be destroyed by.
- `git-pr` — owns opening and updating the pull request once the branch is ready.
- `git-issues` — owns the ticket itself; putting an issue number in a branch name is
  convention, not a reason to create an issue.
- `follow-project-conventions` — owns discovering repository conventions at large; here
  it is applied to the base branch and the workflow, not to naming — the prefix table
  fixes that.
- `minimal-changes` — owns diff scope; this skill owns the isolation boundary.
- `git-tree` — renders the branch landscape this skill navigates: prefix grouping is
  organizational, never commit ancestry; use it to see the whole picture before choosing
  a base or cleaning up.

## Anti-patterns

- Creating a branch because it feels safer, then abandoning it half-finished.
- Inventing a prefix outside the table, or stacking two, instead of the one that matches
  the change.
- Branching from a stale base and opening a PR full of noise.
- Folding a drive-by fix into a feature branch.
- Piling unrelated experiments onto one branch until it has no describable purpose.
- Deleting a branch with `-D` because `-d` refused; `-d` was right.
- Switching with a dirty tree and not noticing what traveled along.
- Reformatting the whole repository on a feature branch "while I was in there".

## Definition of done

The branch uses exactly one prefix from the mandatory table plus a short, descriptive
name; the base branch came from the repository rather than a guess; the branch starts
from an updated base with no unaccounted working-tree changes; and `git log <base>..HEAD`
contains exactly the commits this change is meant to contain.
