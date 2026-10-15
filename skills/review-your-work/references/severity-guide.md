# Severity guide

Calibration aid for review findings. Severity describes the impact on users if this
change ships as written — not how hard the fix is, not how long the line took to
write, and not how much you trust yourself.

Self-review makes this harder, not different. You wrote the code, so you know what you
meant; severity asks what it will do, which is a different question.

## Definitions

### Critical

Data loss, security breach, crash or corruption reachable in realistic conditions;
anything that breaks existing users irrecoverably.

Signals:

- Writes or deletes user data without validation or a recovery path.
- Authentication or authorization bypass; an injection with a real exploit path.
- An unhandled failure that corrupts state or moves money incorrectly.
- A regression that takes a system down, or that is unrecoverable without manual
  repair.

### High

A real bug or security weakness reachable in normal use, or a decision that will be
expensive to reverse.

Signals:

- Common inputs produce wrong results; the primary path fails.
- Race conditions or resource leaks that manifest under normal load.
- Authorization checked on some paths but not others.
- Secrets committed to the repository (Critical if the secret is live).
- A schema or API change that breaks existing clients with no migration.
- A bug fix whose own fix has no regression test and no verification.

### Medium

Correctness or maintainability issues with limited current impact. Should be fixed;
scheduling is acceptable.

Signals:

- Edge cases mishandled: empty input, unicode, extreme sizes, timezone edges.
- Error handling that loses context or hides failures from operators.
- Missing tests for new behavior.
- Structure that will slow the next change.
- Performance problems that only appear as data grows.
- Changes outside the requested scope that happen to be harmless.

### Low

Polish and preference, roughly in priority order:

- Naming and readability.
- Documentation, comments, examples.
- Minor simplifications and dead code.
- An alternative implementation of equal cost.

Never block on Low findings. State them once, together, and move on.

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
[Critical] Refund amount comes from the request, not the charge
Location: src/billing/refund.ts:112
Problem: The refund amount is read from the request body and never compared against
the recorded charge.
Impact: Any authenticated client can refund an arbitrary amount against any of its
own charges; direct financial loss.
Fix: Compute the refund from the stored charge record and cap it at the remaining
balance.
```

**High**

```
[High] Import job swallows every row error
Location: src/jobs/import.ts:44
Problem: The per-row loop catches and ignores all errors, then commits the batch.
Impact: A mid-file parse failure yields a silently truncated dataset while operators
see success.
Fix: Propagate the error, abort the transaction, and report the failing row.
```

**Medium**

```
[Medium] Date parsing assumes UTC
Location: src/utils/parse-date.ts:19
Problem: The parser treats its input as UTC while the Shopify webhook caller sends
local timestamps.
Impact: Users in negative UTC offsets see off-by-one-day dates around midnight.
Fix: Parse with an explicit offset and normalize to UTC at the boundary.
```

**Low**

```
[Low] Name does not say what the value is
Location: src/http/client.ts:87
Problem: The variable data2 obscures what it holds.
Impact: Slows comprehension and invites misuse during later edits.
Fix: Rename it to retryPayload.
```

## Calibration notes

- Severity is about impact, not effort. A one-character fix can be Critical.
- You wrote this line, so your confidence in it is not evidence about it. If you find
  yourself reasoning "I was careful there", re-read the line.
- If unsure between two levels, pick the lower one and spell out the worst case on the
  Impact line. Over-claiming erodes trust in the review, including your own.
- "It works on my machine" is not evidence. Name the failing scenario, or reproduce
  it.
- "The tests pass" is not evidence the change is correct. Say which test covers which
  behavior, and what remains uncovered.
- One finding per distinct problem. Never bundle three issues into one comment.
- Test gaps are findings: if no test would catch this bug class, say so explicitly.
- A missing change is a finding. "Nothing else uses this constant" is a claim that
  needs a search you actually ran, not an impression.
- Absence of findings is a finding too. If you found nothing, say what you looked at
  and where your confidence stops.
