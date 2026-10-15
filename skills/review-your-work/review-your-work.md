---
name: review-your-work
description: "Reviews the changes you just made before treating the task as finished. Reads the actual diff instead of your memory of it, and looks for defects, regressions, security problems, accidental modifications, unnecessary scope and missing tests or documentation. Use when you are about to report a change as done, when a diff is larger or stranger than you expected, after fixing a bug, or when you want a second adversarial pass over your own work. Produces findings ranked by severity, each with impact and a concrete fix."
---

# Review your work

You wrote this change. You know why every line exists, which parts you were unsure
about, and what you were aiming for. That familiarity is exactly what hides the
defect: you read your intent where you should be reading your code.

**Core rule:** review the diff as it exists on disk, not the change as you remember
writing it. If you cannot produce the diff, you have not reviewed anything.

## When to use

Use before reporting any change as complete, and always when the change touches more
than one file, alters behavior at a boundary, or is too large to hold in your head.

Do not use to:

- Run the checks → `test-before-finishing` decides which apply and runs them.
- Attack the change's assumptions adversarially → `break-the-edge`.
- Judge whether the design itself is right → `software-architect`.
- Predict who breaks → `blast-radius` looks forward; this looks backward.

## Get the real change first

Never review from a summary. Read the actual diff:

- `git status --porcelain` — every file touched, including untracked and deleted ones.
- `git diff` and `git diff --staged` — the unstaged and staged changes separately.
- `git diff --stat` — the shape of the change before the detail.
- For untracked files, read the file. A new file has no diff and is easy to forget.

If the change is uncommitted against a moving baseline, diff against the ref you
started from, and say which ref you used. Never guess which lines are yours.

A surprising result here is information, not noise. If the diff contains files you do
not remember touching, or is much larger than the task deserved, stop and understand
it before you review anything else. Something happened that you did not authorize;
`safe-git` decides what to do about repo state.

## Process

### 1. Reconstruct the intent before judging

Write the requirement in one sentence: what will be true when this change is done,
including how it fails. Then list what the change was explicitly *not* supposed to
touch. You cannot judge scope without a target.

### 2. Read the whole diff once, without commenting

Skim the entire change for shape before forming any opinion. Reviewing line by line
from the top produces a list of nits and reliably misses the things no single line
contains: the missing error path, the dropped test, the behavior that silently
changed.

### 3. Run the passes

Read `references/review-passes.md` now and work through the passes in order: intent and
scope, correctness at boundaries and malformed input, error paths and resource
lifecycle, security red flags, tests and observability, maintainability and
conventions, architecture and data model, and performance only where it matters.

Each pass is a list of concrete questions to ask of the diff. Do not skip a pass
because you feel good about that dimension — that is exactly the dimension where
self-confidence is least reliable.

### 4. Fix what is wrong, then read the diff again

A fix is a new change and gets no benefit of the doubt. Re-read the resulting diff
after fixing. Fixes introduce their own off-by-one, their own swallowed error, their
own missing cleanup.

### 5. Decide, in plain words

Say whether the change is complete, and what is not complete about it. A vague "looks
good" is not a decision; "the three acceptance criteria are met, the suite passes,
and I did not verify behavior on Windows" is.

## Ranking findings

Read `references/severity-guide.md` before you assign a severity to anything. The
short version:

- **Critical** — data loss, security breach, crash or corruption reachable in
  realistic conditions. Fix before shipping.
- **High** — a real bug reachable in normal use, or a decision expensive to reverse.
- **Medium** — a correctness or maintainability problem with limited current impact.
- **Low** — polish: naming, docs, minor simplification.

Every finding states severity, location, the problem, the impact, and the smallest
concrete fix. One finding per distinct problem.

## The self-review honesty rule

You are the only reviewer of this change. Nobody else will catch what you decide not
to look at.

- **Do not rubber-stamp.** "I wrote it, so it is fine" is the single most expensive
  response you can give. Re-read as if a stranger wrote it.
- **Severity is about impact on users, not about how hard the fix is or how much
  effort it took you to write the line.** A five-character mistake that deletes data
  is Critical. A taste disagreement is Low even if you are sure about it.
- **A test that passes is not proof the change is right.** It is evidence about one
  path. Say what is still unverified.
- **You cannot review what you did not read.** If you cannot produce the diff, say so
  instead of summarizing your intent.
- **"It looks right" is a finding about your reading, not about the code.** When you
  cannot verify a claim, that is the report.

## Interaction with other skills

- `test-before-finishing` — owns running the applicable checks; this skill reviews the
  diff and names the checks the change needs.
- `verify-before-claiming` — sets the evidence bar for every claim you make about the
  change after reviewing it.
- `no-made-up-results` — forbids invented output; this skill must not report a check
  result it did not observe.
- `break-the-edge` — adversarially attacks the assumptions behind the change; this one
  reads the change for defects in the change.
- `security-first` — owns the threat checklist; the security pass here points at those
  red flags, it does not restate the checklist.
- `minimal-changes` — owns diff scope; an unrelated-change finding belongs there.
- `dad-always-say-the-same` — owns test design; a missing-test finding here names the
  gap, that skill decides the test.
- `code` — owns the craft of the implementation; a finding about how it is written
  goes there.
- `unslop` — owns detection of low-quality generated output in your own diff.
- `safe-git` — owns what to do when the diff contains changes you did not intend.

## Anti-patterns

- Reviewing from memory of the change instead of from the diff.
- Reading only the files you remember editing and missing the one you do not.
- Passing on the pass you feel confident about.
- Filing a finding you cannot describe the impact of.
- Inflating severity because you are annoyed, or deflating it because the fix is
  awkward.
- Fixing a critical finding and shipping without re-reading the fix.
- Treating "it compiles" as the review.
- Ending the review with LGTM and no residual risk.

## Definition of done

The diff was read as written on disk; every pass was worked; every file in the change
was accounted for; each finding names a location, an impact and a fix, ranked by
severity; fixes were re-reviewed; the applicable checks were run and their real output
is what gets reported; and what remains unverified is stated plainly.
