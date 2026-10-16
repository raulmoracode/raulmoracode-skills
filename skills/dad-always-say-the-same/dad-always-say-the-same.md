---
name: dad-always-say-the-same
description: "Designs tests that are useful, deterministic and maintainable. Use when writing, fixing or improving tests: choosing what to cover, asserting behavior instead of internals, deciding between unit, integration and end-to-end tests, adding a regression test for a fixed bug, or repairing a flaky, slow or noisy suite. Keeps tests deterministic, free of wall-clock, randomness, network and ordering dependence, and focused on observable contracts rather than coverage numbers."
---
## Composition

```yaml
role: support
direct-invocation: yes
support-limit: 0
max-depth: 0
supports: []
```

Operational metadata only; related skills are conceptual unless listed here.

# Dad always says the same

A test suite is worth exactly what a reader can conclude from a failure. If a test can
pass while the feature is broken, or fail for reasons unrelated to the code, the suite
is teaching the team to ignore it — and the one day it would have caught a real defect
is the day nobody reads it.

**Core rule:** a test that cannot fail is worse than no test. It costs maintenance
forever and buys false confidence. Write assertions that would break if the behavior
broke.

## When to use

Use when writing or changing tests, reviewing tests someone else wrote, deciding what
a change needs covered, or repairing a suite that is slow, flaky or noisy.

Do not use to:

- Run the tests or report the result → `test-before-finishing`.
- Hunt for failure conditions in a change → `break-the-edge`.
- Fix the bug the test should have caught → `debug-properly`.
- Decide whether the evidence you have supports a claim → `verify-before-claiming`.
- Remove test bloat and meaningless assertions → `unslop`.

## Process

### 1. Name the behavior in one sentence

Write the sentence the test asserts before writing the test: "a user with a
verification date in the future cannot be deleted". If you cannot phrase it without
describing steps, you are testing implementation, not behavior.

### 2. Decide what deserves a test

Test what the system promises, what broke before, what is easy to get wrong, and what
is expensive to check by hand. Do not test the language, the framework, or a private
helper whose only purpose is to make a public function testable. When a codebase has no
tests, build the pyramid from the bottom up around one real behavior rather than
scaffolding an empty suite.

Read `references/test-quality.md` when you are deciding the shape of a suite rather than
writing a single assertion: it covers the pyramid in a codebase without one, contract
versus implementation assertions, property-based and state-machine testing, concurrency,
test data hygiene, and a checklist for spotting a bad test.

### 3. Assert the observable result

Assert on what a caller can see: the returned value, the persisted or emitted state,
the error type and message contract, the call to an external system at its boundary.
Avoid asserting on internal variables, call order to private functions, or the
structure of an intermediate value.

### 4. Make it deterministic

A test that can fail for environmental reasons is worse than no test, because the team
learns to re-run instead of read. See "Determinism" below.

### 5. Write the regression test before the fix

Every bug you fix gets a test that fails on the old code and passes on the new one.
If it passes on the old code, it does not reproduce the bug and proves nothing.

### 6. Read the failure honestly

When a test fails, decide whether it caught a real defect before changing the test. A
test edited to pass without understanding the failure is a deleted test.

## What to assert

- **Return values and state**, at the level the caller consumes them.
- **Error behavior**: the error type, and the message only when the message is part of
  the contract. Asserting the full text of an error nobody consumes is brittleness.
- **Side effects at a boundary**: the record written, the event emitted, the request
  sent to a dependency. Not the internal helper that produced it.
- **Invariants that the type or schema cannot express**, when they are the thing most
  likely to break.
- **Nothing else.** A test that asserts five things fails for five reasons and names
  none of them.

## Determinism

A test is deterministic when it produces the same result on every run, on every
machine, at any hour. Remove:

- Wall-clock time. Inject a clock, freeze time, or assert on a duration rather than a
  timestamp.
- Randomness and generated ids. Seed the generator in the test, or inject the values.
- Network calls, real clocks, real files outside a temp directory, and real user data.
- Dependence on execution order, on tests that ran before, or on shared mutable state.
  Give each test its own fixtures and clean up what it creates.
- Dependence on locale, timezone, currency formatting, or filesystem case sensitivity
  when the behavior under test does not require them.

## Brittleness

- Assert the exact string only when the string is the contract. When the contract is
  "contains the user's name", assert that.
- Never mock the unit under test. Mocking the thing you are testing asserts that it
  calls what you told it to call, which is a test of the mock.
- Do not test private helpers directly. If a private helper has behavior worth
  protecting, it is usually worth exposing or worth covering through its public caller.
- Keep mocks shallow: one seam at a dependency boundary, returning the smallest useful
  shape. A deep mock tree is a copy of the implementation that must be updated with it.
- Avoid snapshot or golden files for anything a formatter will change; use them for
  large stable structures, and update them deliberately when the output legitimately
  changes.

## Coverage is not the goal

Coverage measures which lines ran, not which behaviors are protected. A number chased
to a threshold produces tests that execute code and assert nothing. Raise coverage only
by adding tests that would fail if the behavior broke, and report what a new test
actually protects. Coverage tooling that runs on every change is fine; coverage as the
definition of done is not.

## Regression rule

For every bug fixed in this session:

1. Write the test first, against the unfixed code.
2. Confirm it fails, and confirm it fails for the expected reason.
3. Apply the fix; confirm it passes.
4. If a fix arrives without a regression test, say so, and add the test if the suite
   exists. A bug fixed with no test will be reintroduced.

## Interaction with other skills

- `test-before-finishing` — runs the checks this skill designs and reports what
  actually executed.
- `verify-before-claiming` — sets the evidence bar a "tested" claim must meet.
- `break-the-edge` — hunts the edge cases worth a test; you decide how to write them.
- `debug-properly` — owns the root cause; this skill owns the test that keeps it fixed.
- `code` — owns the seams and error contracts the tests assert on.
- `unslop` — removes bloat and meaningless assertions from test files.
- `security-first` — owns sensitive fixtures: no real credentials or personal data.
- `minimal-changes` — owns whether a test file may be reorganized while adding a test.

## Anti-patterns

- A test that asserts only "no exception was raised" for a function that can fail
  silently.
- Asserting a mock was called with arguments the function just passed to it.
- Sleeping, polling, or retrying to work around a race in a test.
- One giant setup block shared by unrelated tests, so a failure does not say which case
  broke.
- Fixing a test to match a behavior change without deciding whether the change was
  intended.
- Raising a coverage threshold and calling the suite done.
- Skipping a test to make the suite green, without reporting the skip.

## Definition of done

Each new or changed test fails when the behavior it describes breaks, passes reliably
on repeated runs, asserts only what a caller can observe, and leaves no shared state
behind; every bug fixed in the session has a regression test that was seen failing
first; and the report says what the tests actually protect.
