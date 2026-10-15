---
name: break-the-edge
description: "Hunts the edge cases, unusual inputs and failure conditions that could break a change, and turns each plausible one into a targeted test or mitigation. Use when implementing or reviewing anything with boundary conditions, parsing, user input, retries, caching, concurrency, limits, time, money, permissions or external dependencies: enumerates assumptions, scans boundary, emptiness, scale, state, time, concurrency, failure, integration and abuse cases, ranks them by likelihood and impact, and reports only findings tied to a realistic trigger."
---

# Break the edge

Happy-path code is the easy half. The half that breaks is where the input is empty, the
limit is one row away, the clock moves, two requests arrive together, or a dependency is
slow instead of down.

**Core rule:** report only edge cases you can tie to a realistic trigger. A checklist
dump for a one-line change is noise, and an invented scenario costs the reader more than
it saves.

## When to use

Use while implementing or reviewing a change that touches boundaries: input parsing and
validation, limits and quotas, retries and timeouts, caching, concurrency and
transactions, money and dates, permissions, external dependencies, file and network
input, or anything whose failure is hard to reverse.

Do not use to:

- Find defects in the finished diff → `review-your-work`.
- Decide whether the design tolerates this class of failure → `software-architect`.
- Estimate who else is affected → `blast-radius`.
- Write the tests → `dad-always-say-the-same`.
- Run them → `test-before-finishing`.
- Full threat modeling of auth, secrets and injection → `security-first` (this skill
  cross-references it and does not duplicate its checklist).

## Process

### 1. List the assumptions the change rests on

Write them down in one line each, in the shape "this is true because ...". The usual
ones: the input is well-formed, it has one writer, the dependency is available, the size
is bounded, the ordering is fixed, it is called once, the values fit in the type, the
clock is sane, nobody else reads this field.

Every edge case is a way one of those assumptions turns out to be false.

### 2. Scan the classes

Read `references/edge-catalog.md` when you need the full class list with the question
each class asks and how to turn a finding into a test or a mitigation. It covers
boundaries, emptiness, scale, state, time, concurrency, failure, integration and abuse.

### 3. Keep only the plausible ones

For each candidate, answer: what realistic input or event triggers this? If you cannot
name one, drop it. Theoretical inputs that no caller, client or schedule can produce are
not edge cases; they are noise. Keep the ones that are ugly but possible.

### 4. Write each finding as a chain

Trigger → what the code does → what the user or system experiences. "If the list is
empty, the pagination helper returns page 1 of 0 and the UI shows a blank table with a
Next button that does nothing." The chain is what makes a finding actionable; the class
name alone is not.

### 5. Rank by likelihood times impact

High likelihood and high impact first. Say which findings are reachable in normal
operation and which need an unusual sequence. A real but unlikely finding belongs at the
bottom, not deleted and not first.

### 6. Recommend a test or a mitigation, not both vaguely

For each finding, name the concrete next step: the test that would catch it, the check
that would reject it, the timeout, the lock, the clamp, the retry limit, or "documented,
accepted, no action". A finding with no proposed handling is an open worry, not a
result.

## Boundaries of this skill

`break-the-edge` attacks the change's **assumptions**. `review-your-work` inspects the
**finished diff** for defects. Use edge hunting while the design is still movable,
and review after the code exists; running both on the same diff at the same time
produces the same findings twice and no additional coverage.

## What a finding must contain

- The class of edge case, and the specific input or event.
- The trigger: who or what can produce it, and how easily.
- The observed or predicted behavior, stated concretely.
- The impact on the user, the data or the system, with severity.
- A proposed test, mitigation or accepted-risk decision, owned by a named place in the
  code.

## Interaction with other skills

- `review-your-work` — finds defects in the finished diff; this skill attacks the
  assumptions behind the change.
- `software-architect` — decides whether the design can tolerate the failure class you
  found; you find it.
- `blast-radius` — estimates forward impact on consumers, data and operations.
- `dad-always-say-the-same` — turns each finding into a deterministic test.
- `test-before-finishing` — runs the tests this skill motivates.
- `security-first` — owns abuse, enumeration, privilege and injection analysis; hand the
  finding there rather than expanding its checklist.
- `debug-properly` — takes over once a finding reproduces as a real defect.
- `minimal-changes` — decides whether a mitigation is in scope for this change or a
  follow-up.
- `simplify` — strips the parts of the plan that a full edge-case sweep does not
  justify.

## Anti-patterns

- Producing all nine classes for a change that touches two lines.
- Reporting an edge case with no realistic trigger.
- Stopping at the input layer and ignoring what happens after a partial failure.
- Naming a mitigation as "add validation" without saying where and what it rejects.
- Ranking by how interesting the scenario is rather than by likelihood and impact.
- Duplicating the security checklist instead of handing abuse findings to
  `security-first`.
- Reporting twenty findings where three would have been read.

## Definition of done

Every plausible finding names a realistic trigger, the behavior it produces, the impact
it has, and a concrete test or mitigation; findings are ranked by likelihood and
impact; nothing is listed that no caller, client or schedule can produce; and the
security-specific ones are handed to `security-first`.
