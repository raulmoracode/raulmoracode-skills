---
name: git-tree
description: "Shows a repository's full branch landscape as a tree grouped by naming prefixes such as feat, fix, chore, docs and test. Use when asked to list, show or organize branches, when the branch list is too long to read linearly, when you need to see what is in flight locally and on the remotes, or before triaging stale, merged or orphaned branches. Inspects local and remote branches with read-only commands and treats the grouping as a naming convention, never as commit ancestry."
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

# Git tree

A branch listing is a flat wall of names. In a repository with forty branches, that
wall answers one question — does this name exist — and hides the rest: what is
merged, what upstreams have vanished, what lives only on the remote. This skill
turns the ref inventory into a tree grouped by the prefixes the repository uses.

The grouping reflects naming, and that distance from commit ancestry is the whole
point: a branch under a feat group is not a child of another branch, and no edge of
the drawing implies a parent. Parentage, merge bases and history come from Git
commands, never from the shape of this report.

**Core rule:** the tree describes how branches are named, never how commits are
related; any ancestry claim must be traceable to a Git command, not to indentation.

## When to use

Use when:

- The user asks to list, show, map or organize branches, or asks what is in flight.
- The listing has outgrown a linear read: dozens of refs, several prefixes, more
  than one remote, or a triage of merged, gone and remote-only branches.

Do not use to:

- Create, name, switch, rename, rebase or delete a branch → `git-branch`.
- Reconstruct what previous work changed or where it stopped → `how-was-last-night`.
- Remove branches, prune refs or force-update anything → `safe-git`.
- Decide whether a branch's diff is the change that was asked for → `minimal-changes`.

## Process

### 1. Read the refs; mutate nothing

Two read-only commands cover the inventory:

- `git branch --all` — local branches, remote-tracking branches and the current
  branch, which carries a star.
- `git for-each-ref --format='%(refname:short) %(objectname:short) %(committerdate:short) %(upstream:short) %(upstream:track)' refs/heads refs/remotes`
  — the same set with the metadata a plain listing hides.

Neither command touches the index, the working tree or any ref. Fetching updates
remote-tracking refs and pruning deletes them, so run those only when asked, and
record when the last fetch happened: a stale view describes the past, and must say
which past.

### 2. Separate local branches from remote-tracking refs

A local branch is something this clone can check out; a remote-tracking ref is a
snapshot from the last fetch, and the branch may have been deleted on the server
since. A name present in both halves is one line of development seen from two places
— label it once and mark where it lives. Leave the symbolic remote HEAD pointer out
of the tree; it is not a branch, and counting it muddies the base.

### 3. Derive the grouping from the names

The grouping key is the first path segment of each branch name — feat, fix, chore,
docs, test, or whatever this repository actually uses. Do not impose a taxonomy the
repository does not follow, and do not invent a prefix for branches that have none;
collect those under an explicit unprefixed label and leave their names unedited. Cut
only on the first separator: feat/PROJ-412/backoff belongs under feat, not in a
second-level tree. Read at least five existing names before declaring a convention;
a prefix used once is a branch, not a convention.

### 4. Render the tree so it cannot be read as ancestry

Indent; never draw the connector glyphs that `git log --graph` prints, because a
box-drawn edge between branch names reads as a parent link whether one exists. One
line per branch — name, short commit, age of the tip, tracking state:

```text
feat/
  retry-backoff            8a2f6c1  today        ahead 2 of origin/retry-backoff
  session-refresh          0d9e3aa  yesterday    local only
fix/
  null-pointer-on-empty    f1a9d02  1 week ago   upstream gone
docs/
  install-notes            b77e014  3 weeks ago  merged into main
```

Order the groups deliberately — alphabetical, by size, or by recent activity — and
keep one order throughout. A mixed order makes the tree look richer than it is.

### 5. Mark states precisely

- Merged: `git branch --merged <base>` and its --no-merged twin. Name the base;
  "merged" against the wrong base is misinformation.
- Upstream gone: `git branch -vv` prints [gone] when the recorded upstream ref no
  longer exists locally. That means the branch is absent from this clone's view —
  not that its work is finished or disposable.
- Local only: no upstream configured. The branch may hold the only copy of its
  commits; say that instead of implying it is spare.
- Ahead or behind: counts are relative to the recorded upstream, not to the default
  branch. Do not relabel them.

### 6. State the view, then hand off

Close the report by naming the remote, the fetch time and the base the merged checks
used, then list only what the tree establishes — exists locally, exists only
remotely, merged, upstream gone, unprefixed — and stop. Acting on those findings is
branch lifecycle work or a destructive ref change, each with its own checks.

## Interaction with other skills

- `git-branch` — owns every change to a branch: creating, switching, renaming,
  rebasing, deleting. This skill only reads the refs those operations leave behind.
- `how-was-last-night` — reconstructs what was done and where work stopped; this
  skill answers what exists, not what happened.
- `safe-git` — owns repository safety and destructive commands; nothing in a tree
  report authorizes deleting or pruning a ref.
- `minimal-changes` — owns the scope of a diff; membership in the tree never argues
  that one branch's diff belongs in the current change.

## Anti-patterns

- Drawing connector glyphs and letting branch names hang off one another like commits.
- Calling a branch stale from its age alone, with no merged, gone or ownership check.
- Presenting a fetched snapshot as the live state of a remote.
- Inventing prefixes a repository does not use, or relabeling unprefixed branches to
  fill a tidier taxonomy.
- Counting the remote HEAD pointer as a branch, or a local/remote pair as two findings.
- Claiming no work is in flight from a listing that was never fetched.

## Definition of done

Every local branch and every remote-tracking branch in the recorded view appears
once, grouped by a prefix the repository actually uses or under an explicit
unprefixed label; local and remote are distinguished, the current branch and gone
upstreams are marked, and the report states which remote, fetch and base the view
came from. Nothing in the text implies ancestry from the grouping, and any change to
a branch is left to `git-branch` and `safe-git`.
