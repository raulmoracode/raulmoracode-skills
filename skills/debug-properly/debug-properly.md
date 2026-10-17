---
name: debug-properly
description: "Diagnoses and fixes the root cause of a defect instead of its symptom. Use when something is broken, failing, flaky, crashing, slow or behaving unexpectedly: reproduces the failure when possible, gathers evidence, tests one hypothesis at a time, implements a targeted fix, proves it by re-running the original reproduction, adds regression coverage, and states plainly when the cause could not be established."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `test-before-finishing`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Debug properly

A fix that was never reproduced is a guess with a passing test attached. Diagnosis is
the work; the edit is the last step of it, and the smallest of the steps.

**Core rule:** do not change anything until you can say what causes the failure, and
prove that your change removes the cause rather than the symptom.

## When to use

Use when something behaves differently than it should: a test fails, a request 500s, an
intermittent job produces wrong output, data drifts, performance collapses, or a bug
report arrives with no obvious culprit.

Do not use to:

- Write code that works the first time → `code`.
- Review a finished diff for defects → `review-your-work`.
- Hunt for failure conditions in code you have not changed → `break-the-edge`.
- Decide whether the architecture caused the failure → `software-architect`.

## The hypothesis loop

### 1. Reproduce

Get a reliable way to make it fail. A failure you cannot reproduce cannot be proven
fixed, and a flaky reproduction tells you something valuable — that the failure depends
on state, timing, load, ordering or environment.

Record the exact command, the inputs, and the observable wrong output. Write it down;
you will run it again at the end.

If you truly cannot reproduce it, say so now, fix what the evidence supports, and state
the limit in your report.

### 2. Narrow

Bisect the space, not the file. Cut the problem in half repeatedly: function, module,
layer, environment, request shape, input value, time window, deployment. Use `git
bisect`, feature flags, conditional early returns, or a breakpoint.

Stop when you reach the smallest region where the failure still happens and no smaller.

### 3. Gather evidence

Instrument or inspect before theorizing. Read the actual values: the request body, the
arguments, the environment, the row, the response, the stack. Add a log line, a
breakpoint, a `dbg` statement, a focused test. Remove it once the cause is known.

Evidence beats reasoning about what the code must be doing. Most bugs are one surprising
value, one early return, one shared mutable object, one wrong assumption about the
environment.

### 4. Hypothesize

Write the hypothesis as a falsifiable sentence: "X fails because Y, and I would expect Z
to be true if so." One sentence, one mechanism. If you cannot state it that way, you do
not have a hypothesis yet — you have a feeling.

Rank by likelihood and by how cheap each is to test. Test the cheapest first.

### 5. Test the hypothesis with the smallest probe

Change one thing. Run the reproduction. Either the failure disappears or it does not.

- Disappeared: the cause is confirmed or narrowed. Go to step 6.
- Still there: the hypothesis is wrong. Revert the probe, form a new one, return to
  step 4.

Never change two things at once. You cannot attribute an effect you cannot separate.

### 6. Fix the cause

Change the thing that is actually wrong — not the thing closest to the symptom. Target
the level where the fault originates: fix the shared helper, not its five callers; fix
the validation at the boundary, not each invalid input downstream.

Keep the probe instrumentation out of the final diff.

### 7. Prove the fix

Re-run the original reproduction from step 1, unmodified. Then re-run the checks that
were passing before, so the fix did not move the problem elsewhere.

Both results are evidence. Record what you ran.

### 8. Lock it in

Add a regression test that fails without the fix and passes with it. That test is the
proof the bug is gone rather than merely quiet right now. For the design of that test,
use `dad-always-say-the-same`; for running the full suite, `test-before-finishing`.

## When the cause cannot be established

Sometimes the evidence runs out: the failure is gone, it never reproduces, or every
hypothesis is disproven. Say that, plainly and specifically.

- Report what you observed, what you ruled out, and what you changed — or that you
  changed nothing.
- Offer the next concrete probe: a log to add, a metric to watch, a flag to flip, an
  environment difference to compare.
- Do not ship a speculative fix dressed as a diagnosis. A plausible patch that hides a
  symptom is worse than an open issue, because it removes the signal.

Uncertainty is a result. Report it with `clear-final-report`, not with a guess.

## What is not a cause

These produce changes without understanding:

- **Fixing the symptom.** A null check where the null should never exist hides the bug
  and creates the next one.
- **Shotgun edits.** Scattering defensive checks until it stops crashing.
- **Changing several things at once**, then reporting that it now works.
- **Trusting a fix you did not reproduce.** If you never made it fail, you do not know
  that you made it pass.
- **Rewriting until it works**, especially in unfamiliar code. It replaces one unknown
  with a larger one.
- **Assuming the error message is accurate.** It is written by whoever wrote the throw
  site, and it is sometimes simply wrong.

## Interaction with other skills

- `code` — owns the craft of the fix once the cause is known.
- `minimal-changes` — owns the size of the diff; a fix that reaches every caller of a
  shared cause is still one change, not five.
- `how` — explains how the system works; use it when tracing the flow is the open
  question.
- `research-first` — owns the investigation loop when the question is external
  (framework behavior, a library bug, an upstream issue) rather than in this repo.
- `read-the-f-docs` — owns authoritative version-specific behavior; suspected
  misremembered API semantics are its lookup, not your recollection.
- `break-the-edge` — hunts for failure conditions adversarially; bring it in after the
  fix, not instead of the fix.
- `dad-always-say-the-same` — designs the regression test.
- `test-before-finishing` — runs the applicable checks.
- `verify-before-claiming` — sets the evidence bar for the statement "it is fixed".
- `show-your-work` — carries the hypothesis log while you work, so a long diagnosis is
  followable.
- `low-level-engineering` — takes over when the cause sits below application code:
  memory, CPU, ABI, compiler, loader or runtime behavior that source inspection cannot
  explain.
- `observability` — designs the logs, metrics and traces that make production behavior
  diagnosable; consult it when the defect only reproduces there.
- `browser-engineering` — explains browser-specific behavior: DOM, event loop,
  rendering, workers, storage and sandboxing, so a platform quirk is not treated as a
  generic application bug.

## Anti-patterns

- Editing before reproducing, then verifying only by inspection.
- Changing code, running the test, and stopping on the first green.
- Two changes in one commit, so neither effect can be attributed.
- Leaving a `console.log`, breakpoint, or temporary bypass in the final diff.
- Deleting a failing test instead of understanding why it fails.
- Asserting a fix works without re-running the original reproduction.
- Leaving a mystery commented-out block in the name of caution.

## Definition of done

The original reproduction, run unchanged, passes; the cause is stated in one falsifiable
sentence; the fix changed the cause rather than the symptom; a regression test fails
without the fix; the checks that passed before still pass; and any remaining uncertainty
is reported explicitly.
