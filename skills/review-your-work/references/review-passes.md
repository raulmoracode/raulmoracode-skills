# Review passes

Work through these in order against the diff, not the description of the diff. Read
this when you start reviewing a finished change. Each pass is a set of questions to
ask of the actual code; the passes are ordered so that finding a scope error first
saves you from grading details you should delete.

Stop the review and go back when a pass turns up something that changes what the
change is supposed to be.

## 1. Intent and scope match

- Does the change do what was asked, no more and no less?
- Is every file in the diff necessary to the requirement? Which file could go?
- Did anything get reformatted, renamed, reordered or upgraded that the requirement
  did not ask for?
- Does the change do something the user explicitly ruled out?
- Is a part of the requirement missing — a case, an export, a doc line, a migration?
- Does the change leave a second, older implementation of the same behavior behind?

Scope errors are usually the highest-value finding in a self-review, because you are
the only one who knows which lines were incidental.

## 2. Correctness at boundaries and malformed input

- Empty, single-element, maximum-size, and zero inputs.
- Null, undefined, missing, and explicitly-empty values; optional access on each.
- Off-by-one at every index, slice, page boundary and length comparison.
- Units and types: money as float, seconds versus milliseconds, percent as 0-1 or
  0-100, timezone-naive timestamps, character count versus byte length.
- Precision loss: rounding applied twice, float accumulation, truncation where the
  domain expects rounding.
- Ordering assumptions: results that depend on input order, map iteration, or a
  concurrent producer.
- Malformed input: what happens with a truncated file, a wrong content type, an
  unexpected schema version, a huge payload?
- Early return, break and continue paths: is any cleanup skipped?
- Did the change alter a default value, a timeout, a limit, or a retry count?

## 3. Error paths and resource lifecycle

- Every failure is handled deliberately — no swallowed exception, no ignored return
  value, no empty catch.
- Is the failure surfaced with enough context to act on, without leaking internals?
- Do retries stay idempotent, or can a retry double-write, double-charge, or
  double-send?
- Files, sockets, locks, subscriptions, database cursors and temporary files released
  on every path, including the failure path.
- Partial state: if step three of five fails, is the system left consistent?
- Fail-open versus fail-closed: on error, does the system deny access or grant it?
- Timeouts present on every network call; no unbounded wait.
- Are new error messages phrased so a user or operator can act on them?

## 4. Security red flags

Scan for these; `security-first` owns the full threat checklist and how to close them.

- Untrusted input reaching a query, shell, template, path, URL or deserializer
  without validation.
- Authorization checked on every path, not just the UI path; default deny.
- A secret, token, key or credential in code, fixtures, logs or error messages.
- Error messages or logs that leak internals, stack traces or user data.
- New dependency: is it justified, reputable, pinned, and does it carry known issues?
- Weak or hand-rolled crypto, fixed randomness, verification skipped.
- Path traversal, SSRF, open redirect, or an allowlist that was not validated.
- Permissions, CORS, cookie flags or CSP weakened by the change.

## 5. Tests and observability

- Which test would have failed before this change and passes now?
- Are new behaviors covered, or only the old ones? A bug fix without a regression
  test is an incomplete fix.
- Do the tests assert behavior, or do they restate the implementation back at
  themselves and pass forever?
- Are the edge and error paths covered, or only the happy path?
- Deterministic: no clock, randomness, network, ordering or shared state dependence.
- Will the suite still pass when run in a different order or in parallel?
- In production, will this be diagnosable: a log line, a metric, an actionable error?
- Do tests, comments and the implementation say the same thing about behavior?
  `mom-always-say-the-same` owns that consistency.

## 6. Maintainability and conventions

- Does it look like the code around it: naming, file placement, export style, error
  idiom, comment density? Cite the neighboring file that proves the convention.
- Names that say what the thing is; no `data`, `tmp`, `value2`, `handleStuff`.
- One job per function; nesting that wants early returns or extraction.
- Knowledge encoded in two places, which will drift.
- Dead code, leftover debugging, commented-out blocks, an unused new export.
- Comments explaining why; stale comments that contradict the new code.
- An abstraction with one caller, or a parameter nobody passes.
- Public API changed without a decision about compatibility.

## 7. Architecture and data model

- Does this logic belong in this layer, respecting existing boundaries and dependency
  direction?
- Does the change make an unrelated module depend on this one?
- Do type or schema changes make invalid states representable, or representable
  without a runtime check?
- Is an existing, proven pattern in this codebase bypassed for a new one?
- Backward compatibility: serialized data, stored rows, public signatures, existing
  callers — what happens to data written by the previous version?
- Migration path: how does existing data get to the new shape, and can it be rolled
  back?
- Is an abstraction earned by real use cases, or speculative?

## 8. Performance, only where it matters

Skip this pass unless data volume, traffic, latency or memory is part of the change.
When it is:

- N+1 queries, or a query inside a loop.
- Unbounded growth: a list, cache, table or file that only ever grows.
- Work repeated per item that could be hoisted, batched or precomputed.
- Blocking I/O on an async path, or an await inside a tight loop.
- Missing pagination on a collection endpoint.
- A new dependency whose weight is out of proportion to the work it does.
