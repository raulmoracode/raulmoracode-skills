# Severity guide

Calibration aid for code review findings. Severity describes impact if the code
ships as-is — not how hard it is to fix, and not how strongly the reviewer feels
about it.

## Definitions

### Critical

Data loss, security breach, crash or corruption reachable in realistic conditions;
anything that breaks existing users irrecoverably.

Signals:

- Writes or deletes user data without validation or recovery path.
- Authentication or authorization bypass; an injection with a real exploit path.
- Unhandled failure that corrupts state or moves money incorrectly.
- A regression that takes a system down or is unrecoverable without manual repair.

### High

A real bug or security weakness reachable in normal use, or an architectural
decision that will be expensive to reverse.

Signals:

- Common inputs produce wrong results; the happy path fails.
- Race conditions or resource leaks that manifest under normal load.
- Missing authorization checks on some, but not all, paths.
- Secrets committed to the repository (Critical if the secret is live).
- Schema or API change that breaks existing clients without a migration.

### Medium

Correctness or maintainability issues with limited current impact. Should be fixed;
scheduling is acceptable.

Signals:

- Edge cases mishandled (empty input, unicode, extreme sizes, timezone edges).
- Error handling that loses context or hides failures from operators.
- Missing tests for new behavior.
- Unclear structure that will slow future changes.
- Performance problems that only appear with growth.

### Low

Polish and preference, roughly in priority order:

- Naming and readability.
- Documentation, comments, examples.
- Minor simplifications and dead code.
- Alternative implementations of equal cost.

Never block a merge on Low findings; state them once and move on.

## Finding format

```
[Severity] Short title
Location: path/to/file.ext:line, or symbol name
Problem: what is wrong or risky, in one factual sentence.
Impact: what happens, under which conditions, to whom.
Fix: the smallest concrete change; sketch code only if it clarifies.
```

## Examples

**Critical**

```
Location: src/payments/refund.ext:112
Problem: The refund amount is taken from the request body without comparing it to
the recorded charge.
Impact: Any authenticated client can refund arbitrary amounts; direct financial
loss.
Fix: Compute the refund from the stored charge record and cap it at the remaining
balance.
```

**High**

```
Location: src/jobs/import.ext:44
Problem: The import loop catches and ignores all errors, then commits.
Impact: A mid-file parse failure yields a silently truncated dataset and operators
see success.
Fix: Propagate the error, abort the transaction, and report the failing row.
```

**Medium**

```
Location: src/utils/parse-date.ext:19
Problem: Date parsing assumes UTC but receives local timestamps from one caller.
Impact: Users in negative UTC offsets see off-by-one-day dates around midnight.
Fix: Parse with an explicit timezone and normalize at the boundary.
```

**Low**

```
Location: src/http/client.ext:87
Problem: The variable name data2 obscures what the value represents.
Impact: Slows comprehension and invites misuse during edits.
Fix: Rename it to retryPayload.
```

## Calibration notes

- Severity is about impact, not effort. A one-character fix can still be Critical.
- If unsure between two levels, pick the lower one and spell out the worst case in
  the Impact line; over-claiming erodes trust in the review.
- "It works on my machine" is not evidence. Ask for the failing scenario or supply
  one.
- One finding per distinct problem. Do not bundle several issues into one comment.
- Test gaps are findings: if no test would catch the bug class, say so explicitly.
