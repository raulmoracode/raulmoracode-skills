---
name: clear-final-report
description: "Produces the final report the user reads: the result, the important changes, the significant decisions, the checks that actually ran with their real outcomes, the limitations and the outstanding work. Scales to the task instead of padding a two-line fix into a multi-section document, and contains only what happened. Use when work is finished and needs handing over, when reporting back after a long task, after an investigation or diagnosis, or when a partial result has to be reported honestly."
---

# Clear final report

The last message is the only part of the work most users read. It should let them
decide what to do next without re-deriving anything: what changed, what proves it,
what is still open.

**Core rule:** the report is proportionate to the task. Two lines for a two-line
change. Never pad a small change into a multi-section document, and never hide a
small change inside a long one.

## When to use

At the end of any task with an outcome the user has to know about — implementation,
bug fix, investigation, diagnosis, or a result that came back incomplete.

Do not use to:

- Report progress while working → `show-your-work`.
- Run the checks the report describes → `test-before-finishing`.
- Judge what evidence a claim needs → `verify-before-claiming`.

## Size the report to the task

| The change was | The report is |
| --- | --- |
| A typo, one line, an obvious fix | One line: what you did, done. |
| A small change in one or two files | What changed, checks run, one caveat. |
| A substantial change | Summary, changes and why, checks with outcomes, what was not verified, remaining work, risks. |
| An investigation or diagnosis | The question, what was examined, what was found with evidence, the conclusion and its confidence. |

Read `references/report-templates.md` before writing the report of anything that is not
a one-liner, and use the template that matches the size of the work. Include only the
sections that carry information; a section with nothing real in it is deleted, not
filled.

If the task turned out to be bigger than the report suggests, the report is wrong, not
the task. Add the sections the change now deserves.

## What the report must contain

- **The result**, in the first sentence. What is true now that was not true before.
  If the result is partial, say that in the first sentence too.
- **The changes that matter.** Which files and which behaviors, not a file-by-file
  narration. A reader should be able to tell what to look at.
- **Decisions worth knowing.** Choices you made that the user could reasonably have
  made differently, and the constraint that drove them.
- **The checks that ran**, by command, with their real outcomes. "Passed" without a
  name is not a check.
- **What was not verified**, and the assumptions you relied on. This is the section
  that keeps the rest trustworthy; never delete it to look tidier.
- **Outstanding work**, if any: what is left, why, and what it needs.

Everything in the report must come from something that actually happened. Check the
ladder before you write: a claim you did not verify is stated as unverified, not
softened into vagueness.

## Honesty in the report

- Report only what ran. A check that could not be executed is named as not run, with
  the reason.
- Report partial results as partial. "Ran the unit suite; the e2e suite needs a
  database" is accurate; "tests pass" is not.
- Report failures plainly, with the failure, even when the rest of the work succeeded.
- Report a task that did not get finished as unfinished, and say what remains.
- Never fill a results section with plausible output you did not observe. If a command
  produced nothing useful, that is the finding.
- Never soften a bad result into a vague one. "There may be some edge cases" means
  nothing; "empty input still returns 500" is a fact the user can act on.

## What not to include

- A restatement of the request. The user wrote it.
- A narration of steps that need no comment: files opened, functions read, edits
  made.
- Praise, reassurance, or an invitation to ask follow-up questions.
- Invented results, invented next steps, invented commit references.
- Hedging so vague the sentence survives regardless of the truth.
- Advice the user did not ask for, unless a real risk is being left unmentioned.
- Emotional framing about difficulty, effort or the state of the code.
- A section kept only for symmetry with a template.

## Interaction with other skills

- `verify-before-claiming` — every claim in the report sits on the evidence ladder it
  defines; a report cannot be more certain than its evidence.
- `no-made-up-results` — the floor: nothing in the report exists unless it happened.
- `test-before-finishing` — produces the check results the report states.
- `review-your-work` — produces the findings and residual risk the report carries.
- `show-your-work` — owns the updates during the work; this is the outcome, not the
  running commentary.
- `simplify` — owns the removal of padding; length is set by the task, not by habit.
- `blast-radius` — produces the impact and migration risks a substantial report
  states.
- `minimal-changes` — defines the scope the report describes; an unrelated change in
  the diff is reported as such.

## Anti-patterns

- A nine-section report for a one-line fix.
- "All tests pass" when only some ran.
- Reporting the plan as the result.
- Hiding a failing check in the middle of a paragraph of success.
- Listing every file you touched as though each were a decision.
- Claiming completeness while a known limitation is unmentioned.
- Closing with a summary of the summary.
- Writing the report before the work is finished.

## Definition of done

The first sentence states the real result; the sections match the size of the change;
every check named is one that ran, with its actual outcome; what was not verified and
what remains are stated; nothing in the report was invented or inferred beyond its
evidence; and a reader can act on it without asking a follow-up question.
