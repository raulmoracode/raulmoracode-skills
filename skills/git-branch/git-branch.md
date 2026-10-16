---
name: git-branch
description: "Manages Git branches according to the repository's own workflow. Use when creating, switching, renaming, rebasing or deleting a branch, when asked to move work onto a branch, to isolate a change, or to start from an up-to-date base. Discovers the naming convention and base branch from CONTRIBUTING, AGENTS.md and existing branch names, keeps one logical change per branch, checks status before switching, and avoids creating branches the task or repository does not require."
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

### 1. Discover the convention before naming anything

The repository already answers this. Read it instead of guessing:

- `CONTRIBUTING.md`, `AGENTS.md`, `README.md`, `.github/` — a stated branching policy, a
  PR template, or a merge strategy that implies one.
- `git branch -a` and `git log --oneline --no-merges --all -30` — repeated prefixes are
  the convention: `feat/`, `fix/`, `chore/`, `docs/`, `release/`, or ticket IDs like
  `PROJ-123-`.
- `gh repo view --json defaultBranchRef` — the actual default branch, which is not always
  `main` and not always what the README says.
- `gh pr list --state all --limit 30` — what kinds of branches actually get merged here.

When the convention is invisible and being wrong is costly, ask. A wrong prefix is a
rename; a wrong base branch is a rewrite.

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

### 4. Name it

- Prefix by kind when the repository does: `feat/`, `fix/`, `chore/`, `docs/`,
  `refactor/`.
- Otherwise use short kebab-case describing the outcome: `fix-empty-env-lookup`.
- One logical change per branch. If the name needs an "and", it is two branches.
- Match the existing case and separator style exactly. Consistency beats correctness.

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
  it is applied to branch naming and the base.
- `minimal-changes` — owns diff scope; this skill owns the isolation boundary.

## Anti-patterns

- Creating a branch because it feels safer, then abandoning it half-finished.
- Guessing a prefix instead of reading five existing branch names.
- Branching from a stale base and opening a PR full of noise.
- Folding a drive-by fix into a feature branch.
- Piling unrelated experiments onto one branch until it has no describable purpose.
- Deleting a branch with `-D` because `-d` refused; `-d` was right.
- Switching with a dirty tree and not noticing what traveled along.
- Reformatting the whole repository on a feature branch "while I was in there".

## Definition of done

The base branch and naming convention came from the repository rather than a guess; the
branch starts from an updated base with no unaccounted working-tree changes; and
`git log <base>..HEAD` contains exactly the commits this change is meant to contain.
