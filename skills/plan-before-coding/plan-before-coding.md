---
name: plan-before-coding
description: "Produces a practical implementation plan before non-trivial code is written: ordered steps, dependencies and sequencing, expected outcomes, acceptance criteria, risks, unknowns and a verification strategy. Use for multi-file changes, features, refactors, migrations, public API changes, and any task with unknowns or more than one plausible approach; also use when work has stalled, when two steps may conflict, or when you must decide what to build first. Explicitly skip it for one-line fixes and mechanical edits."
---

# Plan before coding

A plan is not paperwork before the work. It is the cheapest place to discover that a
task has a hidden dependency, two conflicting requirements, or no way to tell whether
it succeeded. Written after the code, it is a rationalization.

**Core rule:** plan when the work has more than one step or the cost of being wrong is
high; do not plan when neither is true.

## When planning earns its place

- The change touches more than a few files, or more than one layer.
- Steps have order dependencies: schema before queries, types before consumers,
  extraction before rewrite, deprecation before deletion.
- The approach is not settled and choosing wrong is expensive.
- Unknowns would change the shape of the work.
- Several people or agents will touch it, or it must survive this session.
- The work is hard to reverse: migrations, deletions, public APIs, production data.

## When to skip it

Do not write a plan for:

- A one-line or mechanical change whose approach is already known.
- A fix whose cause is known and whose correction is obvious — see `debug-properly`.
- A typo, a comment, a pure rename with no behavior change.
- Pure discovery. "Find out how X works" is a plan of length one; run `how`.

Skipping is a decision, not an omission — and `simplify` holds you to it. The
downside is one edit, not a migration.

## Process

### 1. State the outcome and the failure

One sentence for what will be true when this is done. One sentence for how you will
know it failed. "Speed up the exporter" is an activity; "the exporter no longer makes
a second network call for a batch ID it has already fetched in this process" is an
outcome.

If you cannot write the failure sentence, the requirement is still unclear. That is
`dont-ask-shit` territory, not a plan you can build on top of it.

### 2. Bound the solution with constraints

Public API stability, supported runtimes, performance budgets, memory ceilings, "do
not touch this file", "keep backward compatibility", data we cannot lose. Constraints
eliminate more options than preferences do; write them down before you choose.

### 3. Break the work into steps that end in something checkable

A step is finished when its output exists and can be inspected. "Add `RetryPolicy`
with its tests" is a step. "Handle retries properly" is a wish. Name the files each
step changes; a step that cannot name its files is either two steps or a fog.

### 4. Order by dependency, not by convenience

- Foundational before derived: schema and types before the code that consumes them.
- Additive before destructive: introduce, migrate, then remove.
- Rewrites last, behind a seam that keeps the system working throughout.
- Each step should leave the tree working. If a step requires the system to be broken
  in between, find a different decomposition or a feature flag.

### 5. Write acceptance criteria as observable checks

Not "works correctly" but "the existing suite passes", "the endpoint returns 422 for a
malformed body", "the migration is reversible and covered by a test". Prefer criteria
you can execute: `npm test`, `pytest`, `cargo build`, a manual smoke check. Write the
command here so it exists before it is needed.

### 6. Name the risks and the unknowns

- What can go wrong: data loss, a silent failure, a breaking change for consumers,
  lock contention, a dependency or platform capability that does not exist.
- What you do not know, and how you will find out: read the code, check the installed
  version, ask the user. Every unresolved unknown becomes an explicit task, never a
  silent assumption.
- What would make you stop and redesign: name the tripwire in advance — "if the
  migration needs a lock longer than one second, this approach is wrong".

### 7. Choose the verification strategy up front

Decide which checks this change needs and in what order: the tests that must be added,
the suites that must not regress, the manual check for what no test can cover, and the
build or typecheck that guards the edges. Test design belongs to
`dad-always-say-the-same`, forward impact to `blast-radius`, running the checks to
`test-before-finishing`. This step decides which are needed; it does not perform them.

## A plan or a checklist

A checklist lists things to do. A plan decides what goes first, what depends on what,
what "done" means, and what happens if a step fails. If your list can run in any order
and still produce the same result, it is a checklist — keep it to three bullets and
start coding.

A real plan contains at least one of: a dependency, a trade-off with a stated winner, a
rollback path, or a criterion that can fail. If none of those is present, you have a
task list, which may well be enough.

Keep the plan where you can see it, and revise it when reality diverges. A plan never
revised is a stale document. When you depart from it, say so — `show-your-work`.

## Interaction with other skills

- `raulmoracode-mode` — decides whether this task is large enough to deserve a plan,
  and where the plan sits in the workflow.
- `understand-before-acting` — supplies the facts the plan is built on; a plan written
  on assumptions is a plan built on sand.
- `software-architect` — evaluates whether the design is right; this skill sequences
  the task and does not re-litigate the design.
- `blast-radius` — owns forward-looking impact: consumers, data, operations.
- `dad-always-say-the-same` — owns test design; `test-before-finishing` runs them.
- `research-first` — resolves the unknowns this plan exposes.
- `minimal-changes` — trims the plan back to the scope that was actually requested.
- `simplify` — strips ceremony out of both the plan and the work.

## Anti-patterns

- A ten-step plan for a one-line fix.
- Steps that cannot be finished or checked on their own.
- An order that reflects habit rather than dependency.
- Acceptance criteria written as adjectives ("robust", "clean", "correct").
- Risks section listing "unknown unknowns" instead of named failure modes.
- A plan written after the code, describing the code.
- Quietly switching approach mid-task without recording the change.
- Planning work whose shape depends on a question nobody has answered yet.

## Definition of done

The plan states the outcome and its failure, the constraints, steps in dependency order
with their files named, criteria that can be executed, the real risks and unknowns with
tripwires, and the checks that will prove it — and its length is justified by the
change rather than by habit.
