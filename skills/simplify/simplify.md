---
name: simplify
description: "Removes unnecessary complexity from the solution and from the way the solution is reached: fewer task subdivisions, fewer plan steps, fewer skills and tools, the straightforward implementation instead of a clever one, no duplicated instructions or repeated work, shorter docs and reports, no speculative structure. Minimize unnecessary complexity without reducing necessary rigor. Use when a task feels over-planned, when an abstraction has one caller, when the same work is done twice, or when reviewing your own output for cruft."
---

# Simplify

Complexity is the main tax on everything downstream: reading it, changing it, testing it,
reviewing it, and explaining it. Most of it is self-inflicted, added while working rather
than required by the problem.

**Core rule:** minimize unnecessary complexity, not necessary rigor. Remove the ceremony
that does not protect anything; keep every check that does.

## How this skill applies

This is a **cross-cutting principle, not a separate step**. Apply it continuously while
you work — to the plan, to the tools you reach for, to the code you write, to the docs
and the report you produce. You do not need to invoke it per task, and you should not
announce that you are doing it. It is a lens, not a phase.

## Unnecessary versus necessary

- **Unnecessary complexity**: structure that serves no stated requirement — extra
  indirection, a layer that forwards to one implementation, configuration for options
  nobody asked for, a plan step that produces no artifact, a skill loaded "just in case",
  documentation restating the code.
- **Necessary rigor**: the checks, boundaries and edge handling that make the result
  correct and safe. This is not complexity to be optimized away.

The mistake is treating the second as the first. A missing error path is not a
simplification; it is a defect with a shorter name.

## The complexity tax test

For any abstraction, plan step, tool call, skill, document or section, ask:

1. **What does it buy?** State the benefit in one sentence, concretely. If you cannot,
   it is not earning its cost.
2. **What does it cost?** Lines to read, states to hold, places to update when the
   requirement changes, failure modes, review attention, tokens to spend.
3. **Is the cost paid today?** If the benefit is hypothetical and the cost is real, cut
   it. This applies to process exactly as it applies to function parameters.

When a unit passes the test, keep it and stop revisiting it.

## Where to simplify

- **Task decomposition.** Do not split work into steps that produce no intermediate you
  will use. Three meaningful steps beat a nine-step plan.
- **Planning.** A plan exists to order dependent work and define done. If the work fits
  in your head, keep it there and write the acceptance criteria instead.
- **Skills and tools.** Load a skill when it changes the outcome. Two skills that
  produce the same action are one skill and one wasted load.
- **Implementation.** Prefer the direct expression of the requirement. Extract only when
  the logic repeats or the extraction genuinely clarifies. Delete wrappers that forward
  without deciding anything.
- **Duplicated work.** Do the analysis once and reuse it; do not re-read, re-derive or
  re-search for something already established. Repeated effort is the most reliable
  source of drift.
- **Instructions and docs.** One authoritative statement per fact. Do not restate a
  rule in three places hoping one stays right.
- **Reporting.** Report what changed and what was verified. Do not narrate the process,
  and do not pad a small change into a long account.
- **Structure.** No speculative directory, module, layer or configuration for a
  requirement that does not exist yet.

## What must never be simplified away

- **Security checks.** Validation, authentication, authorization boundaries, secret
  handling. `security-first` runs in full regardless of size.
- **Error handling.** The failure path is part of the feature. Swallowing an exception
  to look simpler is a regression.
- **Verification.** The checks that apply must run. Never skip one to save time or
  tokens, and never narrow its scope to make it pass.
- **Necessary edge cases.** The states the requirement actually names — empty, zero,
  concurrent, partial, permission-denied.
- **Evidence.** If you claim a result, the claim keeps the evidence
  `verify-before-claiming` requires, and invented output stays forbidden.
- **User authorization and repo state.** Never simplify away a confirmation before a
  destructive or external action → `safe-git`.

## Interaction with other skills

- `dont-f-my-tokens` — different axis: that skill is resources spent while working, this
  one is complexity in the result and in the path to it. A lean result reached expensively
  still needs this skill; a cheap path to a bloated result still needs that one.
- `minimal-changes` — different axis: that skill decides how much of the diff there is,
  this one decides whether the remaining complexity is necessary at all. Simplify may cut
  something you added; it may not cut something the request required.
- `raulmoracode-mode` — owns how much process the task earns; this skill trims that
  process further and continuously.
- `unslop` — owns detecting and removing low-quality generated output; use it for
  cleanup passes, apply this lens while producing.
- `code` — owns the craft of what remains after the cruft is gone.
- `software-architect` — decides boundaries and structure when the complexity is real
  and justified; this skill only removes what is not.
- `plan-before-coding` — owns sequencing; this skill deletes steps that sequence nothing.
- `verify-before-claiming` and `no-made-up-results` — set the bar this skill must not
  lower.

## Anti-patterns

- Deleting an error path because it adds lines.
- Collapsing two genuinely different cases into one branch that lies about both.
- Compressing a requirement out of the report instead of doing less work.
- Adding a wrapper "to keep it clean" that only forwards.
- Keeping a plan because writing it felt productive.
- Loading skills to be thorough rather than because they change the outcome.
- Rewriting working code to be "simpler" and shipping an unreviewed change.
- Using this skill as an excuse to ship less than was asked.

## Definition of done

Every remaining piece of the solution and every remaining step of the process has a
stated purpose and a cost worth paying; abstractions, plan steps, tool calls, skills and
documents that bought nothing have been removed; duplicated work has been collapsed to a
single authoritative version; and no security check, error path, verification run,
necessary edge case or authorization boundary was removed to achieve any of it.
