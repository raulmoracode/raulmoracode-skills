---
name: test-before-finishing
description: "Runs the checks that apply to a change before declaring the work done, and reports honestly what executed. Use at the end of any implementation task: when about to say done, fixed, working, passing or ready, when asked to verify, confirm, build, lint or test, or before handing work over. Identifies the project's own check commands, runs the relevant subset, fixes failures the change caused, separates pre-existing failures, and states clearly which checks were skipped and why."
---

# Test before finishing

An unverified change is a hypothesis. The gap between "I wrote it" and "it works" is
exactly what the check suite exists to close, and closing it later costs more than
closing it now.

**Core rule:** verification is proportional to the task and to the environment you
actually have, and proportionality never means silently skipping.

**Honest environment rule:** if there is no test runner, if a command is missing, if the
sandbox blocks the build, or if a check was scoped out, that is reported as *not run*.
Never describe an unexecuted check as passing, and never let "should be fine" stand in
for a result.

## When to use

Use before saying done, fixed, working, ready, ready for review or ready to merge, and
before handing any implementation work to someone else.

Do not use to:

- Decide what to test or how to write a test → `dad-always-say-the-same`.
- Decide whether the evidence you gathered justifies a claim →
  `verify-before-claiming`.
- Inspect the finished diff for defects → `review-your-work`.
- Fix the underlying defect a failing test exposed → `debug-properly`.
- Report results to the user → `clear-final-report` (this skill supplies the facts).

## Process

### 1. Find the project's own check commands

Read them, do not invent them: `package.json` scripts, `Makefile` targets, `justfile`,
`pyproject.toml` task definitions, `Cargo.toml`, CI workflow files, `CONTRIBUTING.md`,
and the run instructions in the README. If the project defines `make check` or `npm
run verify`, that is the command to run. An ad-hoc command you invented can pass while
the real gate fails.

### 2. Scope the checks to the change

Run what the change can plausibly affect. A Markdown edit does not need the full
end-to-end suite; a change to an auth path needs it. Say what you chose and why, so the
scope is visible rather than implied.

### 3. Execute and read the output

Run the narrowest useful check first (the test file you touched, the type check for the
package you touched), then widen. Read the output rather than the exit code alone: a
suite with three tests filtered out is not a passing suite.

### 4. Fix what your change broke

Every failure the change caused is yours to fix. Fix the cause, then re-run. Do not
loosen an assertion, add a skip, or increase a timeout to turn red into green without
understanding why it was red; `dad-always-say-the-same` owns what a correct test is.

### 5. Separate pre-existing failures

If a check fails on code you did not touch, confirm that by running it before your
change if you can (a stash, a clean checkout, a separate worktree). Report those
separately and clearly: "failing before my change, still failing after". Do not silently
fix them, and do not hide them inside a success claim.

### 6. Re-run after every fix

A fix is a new claim and needs its own evidence. The last state you report must be a
state you actually observed, not the state before the last edit.

### 7. Report executed, not executed, and failed

State each check by name with what happened: passed with counts, failed with the
failing test names, or not run with the reason. Anything else is a guess.

## What to run

| The change touched | Run at minimum |
| --- | --- |
| Prose, comments, docs | The doc build or linter if one exists |
| One module, no public API | That module's tests, plus type check and lint |
| A shared library or public API | Its full suite, dependents' tests, build |
| A schema, migration or data model | Migration up and down, integration tests |
| An HTTP handler or UI flow | Integration or end-to-end tests for the path |
| Auth, payment or deletion path | Full suite, plus a manual check you describe |

When the repository has no tests, say so, report the checks that do exist (build, type
check, lint), and state plainly that behavioral verification did not happen. Writing the
missing tests is real work: estimate it or do it, but never imply it was covered.

## Reporting

- **Executed:** name the command, what it covered, the result. "Unit suite for
  `src/orders`: 128 passed."
- **Failed:** name the command, the failing cases, and whether you fixed them or left
  them with a reason.
- **Not run:** name the check and the reason — no runner configured, command absent,
  sandbox blocked the network, suite too long for the time available. Never omit this
  category; an absent line reads as a pass.
- Keep execution facts and conclusions separate: `verify-before-claiming` sets the
  evidence bar, `clear-final-report` writes the summary.

## Interaction with other skills

- `dad-always-say-the-same` — owns test design and quality. This skill only runs what
  that skill designed.
- `verify-before-claiming` — sets the bar a claim must meet; this skill produces the
  evidence.
- `no-made-up-results` — the absolute prohibition this skill exists to honor.
- `review-your-work` — inspects the diff; you run the checks.
- `debug-properly` — owns the diagnosis behind a failure you did not cause.
- `understand-before-acting` — inspects the environment, including how the project's
  checks are wired.
- `show-your-work` — surfaces a failure or a blocked check while the work is still in
  progress.
- `minimal-changes` — a failing check is a reason to read the diff, not to widen it.
- `clear-final-report` — turns your results into the final message.

## Anti-patterns

- Declaring done because the code is finished, without running anything.
- Describing a check that was skipped as if it had passed.
- Running one fast test file and implying the whole suite passed.
- Inventing a command the project does not define, and reporting its result.
- "Fixing" a failure by skipping the test, widening the timeout, or weakening the
  assertion.
- Leaving pre-existing failures folded into your own result.
- Reporting success without re-running after the last edit.
- Running checks on code you did not change, burning time that the change's own checks
  needed.

## Definition of done

Every check that applies to the change has been run against the current state of the
code, failures caused by the change are fixed and re-verified, pre-existing failures
are reported separately, and the report distinguishes checks that passed from checks
that were not run and says why.
