---
name: code-review
description: "Performs rigorous, language-agnostic code review focused on correctness, potential bugs, security, maintainability and architecture. Use when asked to review a diff, pull request, patch or existing code: produces findings prioritized by severity (critical, high, medium, low), each with concrete impact and a suggested fix, and finishes with an overall risk assessment and next steps."
---

# Code Review

Review code for defects first, design second, taste last. The goal is not to prove the
reviewer is clever — it is to raise the probability that the change is correct, safe
and maintainable when it ships, without blocking progress on personal preference.

**Rules of engagement**

- The author knows the domain better than the reviewer; ask questions before
  asserting.
- Prefer evidence (reproduction, failing test, spec, API contract) over opinion.
- Distinguish blocking defects from optional polish, and label them as such.
- Respect the project's conventions over your own style. Style is only a finding when
  the code contradicts the project itself.
- If the diff is too large or too unclear to review well, say so and propose slicing
  it.

## Process

### 1. Gather context

- Read the description, linked issue and acceptance criteria. What is this change
  trying to do?
- Note what is explicitly in scope and out of scope.
- Check the project's conventions: lint config, test layout, error-handling patterns,
  logging, dependency policy.
- Identify the blast radius: for each touched file, what depends on it?

### 2. Read the whole change once, without commenting

Skim for intent and shape before judging details. A comment list generated line by
line misses missing-code problems that no line contains.

### 3. Correctness pass

Look for logic that is wrong, not merely ugly:

- Boundary conditions: off-by-one, empty inputs, single element, maximum sizes.
- Null, undefined and missing values; optional access; default handling.
- Types and units: money, time, percentages, timezones, encodings, precision.
- Concurrency: races, shared mutable state, ordering assumptions, re-entrancy.
- Error handling: swallowed errors, wrong error type, cleanup skipped on failure,
  retries that are not idempotent.
- Resource lifecycle: files, sockets, subscriptions, caches, locks.
- State machines: unreachable states, transitions without guards.
- API misuse: wrong argument order, ignored return values, incorrect async
  semantics.
- Compatibility: schema changes, serialization, migration paths, feature flags.

### 4. Security pass

- Input validation: is untrusted data validated at the boundary?
- Injection: SQL/NoSQL, shell, template, header, log injection; unsafe
  deserialization.
- Output encoding: XSS in HTML, attribute, script and URL contexts.
- Authentication and authorization: checked on every path, not just the UI; default
  deny; no privilege escalation through parameters.
- Secrets: no credentials in code, logs, error messages or test fixtures.
- Cryptography: standard primitives, correct mode, no home-grown crypto, safe
  randomness.
- Dependencies: new packages are justified, reputable and pinned appropriately.
- Paths and URLs: traversal, SSRF, open redirects, unvalidated allowlists.
- Fail-open vs. fail-closed behavior in error paths.

### 5. Tests and observability pass

- Does a failing test exist that would have caught the defect class? If not, that is
  itself a finding.
- Are tests meaningful (asserting behavior) rather than restating the
  implementation?
- Are edge cases and error paths covered, not only the happy path?
- Do logs and metrics make this change diagnosable in production?
- Are new error messages actionable without leaking internals?

### 6. Maintainability pass

- Naming: does it say what the thing is or does?
- Complexity: functions doing several things; nested conditionals that want early
  returns or extraction.
- Duplication: the same knowledge encoded twice will drift.
- Dead code, leftover debug output, commented-out blocks.
- Comments: explain why, not what; stale comments are defects.
- Public API changes: documented, versioned, or deliberately internal.

### 7. Architecture and design pass

- Placement: is this logic in the right layer or module? Does it respect existing
  boundaries and dependency direction?
- Coupling: does the change make unrelated modules depend on each other?
- Data model: do schema or type changes make invalid states representable?
- Extensibility: is the abstraction earned by real use cases, or speculative?
- Consistency: is a similar problem already solved elsewhere, and if so, why is this
  different?

### 8. Performance, only where it matters

Skip micro-optimization; flag clear scaling risks: N+1 queries, unbounded growth,
repeated work in hot loops, unnecessary blocking I/O, missing pagination.

## Severity levels

- **Critical** — data loss, security breach, crash or corruption reachable in
  realistic conditions. Blocking: must be fixed before merge.
- **High** — a real bug or security weakness reachable in normal use, or a design
  flaw that will be expensive to reverse. Blocking unless explicitly waived.
- **Medium** — correctness or maintainability issue with limited current impact
  (edge cases, poor error handling, missing tests, unclear structure). Should be
  fixed; may be scheduled.
- **Low** — polish, naming, documentation, minor simplification. Optional.

Every finding states: severity, location, what is wrong, why it matters (impact), and
a concrete suggested fix. See `references/severity-guide.md` for calibration and
examples.

## Finding format

```
[Severity] Short title
Location: path/to/file.ext:line, or function/class name
Problem: What is wrong or risky.
Impact: What can happen, under which conditions, to whom.
Fix: The smallest concrete change that resolves it. Code sketch if helpful.
```

## Output template

1. Summary — what the change does, and an overall judgment (approve / approve with
   comments / request changes).
2. Blocking findings — critical and high severity, in order.
3. Non-blocking findings — medium and low, grouped by file or theme.
4. Tests and verification — what is covered, what is missing, what you ran.
5. Questions — genuine uncertainties for the author.
6. If approving: state the remaining risk plainly instead of "LGTM".

## Master checklist

- [ ] Change matches its stated intent; scope creep identified.
- [ ] Logic correct at boundaries and for malformed input.
- [ ] Error paths handled, resources released, failures are safe.
- [ ] No injection, authorization, secret or dependency red flags.
- [ ] Behavior changes covered by tests; flaky or missing tests called out.
- [ ] Names, structure and public APIs follow project conventions.
- [ ] Architecture boundaries respected; data model changes backward-compatible or
      migrated.
- [ ] Performance risks checked where data volume or traffic is involved.
- [ ] Findings prioritized, concrete and actionable; nothing vague left.

## What not to do

- Do not rewrite the change mentally and demand your version instead.
- Do not report a lint catch as critical, or bury a critical issue among nits.
- Do not leave drive-by comments without an owner or suggested resolution.
- Do not approve a change you did not understand; ask instead.

<!-- test change for PR workflow verification -->
