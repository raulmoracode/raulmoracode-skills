---
name: minimal-changes
description: "Keeps a change limited to what the request actually requires. Use when editing existing code, fixing a bug, or adding a feature: avoids unrelated refactoring, reformatting, file moves and opportunistic dependency upgrades, preserves uncommitted user work and existing behavior, separates necessary changes from optional ones, notes improvements instead of bundling them, and widens the diff only when correctness or a security fix demands it."
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

# Minimal changes

Every hunk in a diff is a claim that the task required it. Reviewers pay for each
claim, and untested claims age badly. This skill governs the size of the change, not
the quality of the code inside it.

**Core rule:** change only what the request requires. When you notice something else
that is wrong, note it — do not bundle it into this diff.

## When to use

Use on every change to an existing repository: a bug fix, a feature, a refactor someone
asked for, a dependency bump, a config edit. It matters most when the surrounding code
has problems that tempt you, when the working tree already carries uncommitted work,
and when the request sounds like an invitation to clean up while you are in there.

Do not use to:

- Decide how well the changed code is written → `code`.
- Decide whether the design is right → `software-architect`.
- Look forward at what a change breaks → `blast-radius`.
- Review the finished diff for defects → `review-your-work`.

## Draw the boundary before editing

Write down what done means, and which files must change to reach it. Everything outside
that list is out of scope, including the things you are certain about.

Then classify what you encounter:

- **Required** — the request itself, a correctness need, or a breakage your change
  introduces.
- **Consequential** — something the required change touches and cannot be left behind: a
  call site of a renamed function, the migration a new column demands, the branch your
  edit orphaned.
- **Optional** — anything merely better: a cleaner abstraction, a missing test, an old
  dependency, a formatting sweep.

Required and consequential changes go in the diff. Optional findings go in your report.

## Preserve what is already there

- **Uncommitted work belongs to the user.** Read the status and the diff before you
  edit. If a file you must touch already has changes, keep them and add yours on top.
  Never restore, stash, check out, or run a formatter over them. See `safe-git` before
  anything destructive.
- **Existing behavior survives** unless the request changes it. Do not improve error
  messages, rename parameters, swap a library call for an equivalent one, or change a
  default nobody asked you to change.
- **Public contracts stay put.** A signature, response shape, CLI flag, config key or
  database column is a contract. Changing it is a breaking change, owned by
  `blast-radius`, not a drive-by edit.
- **Do not move files.** A tidier path layout is its own change with its own review and
  its own risk.
- **Do not touch dependencies.** Upgrading a package, adding one while you are here, or
  regenerating a lockfile inflates the diff, changes behavior you were not asked to
  change, and can break the build in ways you will not test.

## When widening scope is correct

Minimal does not mean incomplete. A fix that leaves the same hole open is not a fix.
Widen when:

- **A security fix must be complete.** Patching one vulnerable call site while three
  keep the same flaw is worse than not starting. Say which surfaces you covered.
- **A rename reaches every call site.** If the request requires the rename, every
  reference moves with it, including tests and docs. That is consequential, not creep.
- **The change requires a migration.** New column, new config key, new state: the
  migration and the backfill are part of the change, not a follow-up.
- **Your change orphans code.** If nothing can reach the old function after your edit,
  deleting it is how you finish the change. A dead branch left behind makes the live
  path ambiguous.
- **The fix only works at a higher level.** If one shared cause produces the symptom in
  five callers, fix the cause. One diff, not five patches.

When you widen, state it: what you included, why the request required it, and where you
stopped.

## Check the diff before you finish

Read the diff and ask of every hunk: did the request require this?

- Revert anything you cannot answer for.
- Look for whitespace-only hunks in files you did not mean to touch.
- Look for a whole-file rewrite where you intended a few lines — a line-ending or
  encoding change presents as the entire file.
- Confirm nothing unrelated appeared in the status list, and that no lockfile, snapshot,
  or generated artifact changed by accident.

`review-your-work` runs a full pass over the finished diff. This check is narrower: did
anything unrelated get in.

## Note it, do not do it

Optional findings still have value; they just belong outside this diff. Collect them for
the final report, one line each, saying what it is and where it lives: the dead code,
the leaky abstraction, the stale dependency, the missing test.

That way the user decides, and the diff stays reviewable. Applying an improvement
silently hides a decision you made on their behalf.

## Interaction with other skills

- `code` — owns how well the changed code is written; this skill owns how much of it
  there is.
- `simplify` — reduces complexity in the result and the process; when simplification
  would widen the diff, say so and let the user choose.
- `unslop` — removes low-quality generated output from your own work; do that inside the
  files you are already changing.
- `blast-radius` — owns forward-looking impact when a change must legitimately reach
  beyond the request.
- `follow-project-conventions` — owns the local idiom; matching it never authorizes
  reformatting files you were not asked to touch.
- `mom-always-say-the-same` — owns cross-artifact consistency; a documentation sweep a
  change forces is required work, and it still ships in this diff.
- `safe-git` — owns protecting uncommitted work and any destructive git operation.
- `review-your-work` — owns the full review of the finished diff.

## Anti-patterns

- Fixing the bug and modernizing the module in the same change.
- Reformatting a file because you opened it.
- Upgrading a dependency because it is old. Report a security advisory; let the bump be
  its own change.
- Renaming, moving or reorganizing files for tidiness during a bug fix.
- `git checkout -- <file>`, or a formatter run over a tree with uncommitted work.
- Hiding an improvement inside the diff so the reviewer cannot evaluate it separately.
- Shrinking the change until the fix is incomplete.

## Definition of done

Every hunk traces to the request, to a correctness need, or to a consequence of the
change; optional findings are listed in the report instead of applied; the user's
uncommitted work is intact; and you can say in one sentence why each changed file is
in the diff.
