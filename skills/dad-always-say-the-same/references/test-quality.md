# Test quality

Practical guidance for deciding what to test and how to write it. Read it when starting
tests in a codebase that has none, when choosing the level to test at, when a suite is
slow or flaky, or when judging whether an existing test is worth keeping.

## Build a pyramid where there is none

Most codebases without tests should grow from the bottom up.

- Start with one real behavior end to end through the pure logic, not a test framework
  template. A handful of good tests beats a scaffold of empty suites.
- Add fast unit tests around the parts that will actually be changed next.
- Add integration tests only where the boundary is real: database constraints, queue
  publish, HTTP client serialization.
- Keep one or two end-to-end tests for the critical path, and run them on a schedule
  rather than every commit if they cost minutes.
- Do not write a test file per source file by default. Test by behavior; the file count
  will fall out of what exists.

## Contract tests or implementation tests

- **Contract test:** asserts what a caller may rely on — return value, error type,
  persisted effect, emitted event. Survives a rewrite of the internals.
- **Implementation test:** asserts how it gets there — internal calls, private state,
  specific algorithms. Fails on every refactor and forces you to update it in the same
  commit, which is how tests become the thing nobody touches.
- Default to contract tests. Keep implementation tests only where the algorithm itself
  is the risk, such as a rounding or retry schedule.
- When you must pin an internal seam, pin one boundary, not the whole call tree.

## Property-based testing

Use it when the input space is large and a hand-written example proves one point.

- State the property: "for any list of valid invoices, the total is the sum of the
  lines", not "the total of these three invoices is 412".
- Generate values inside the valid domain, then generate boundaries and near-boundaries.
- Keep the generator deterministic: fix the seed in the test config so a failure is
  reproducible.
- Shrink failures before reporting them; a counterexample of 40 items is not usable.
- The classic targets: round-trips (encode then decode), order independence,
  idempotence, and invariants preserved across a transformation.
- Property tests complement examples; they do not replace them. A property with no
  readable failure message is worse than no property.

## State machines and transitions

When the unit under test is a state machine, a workflow or a lifecycle:

- Enumerate the states and the legal transitions from the code or the spec.
- Write one test per legal transition asserting the new state and the emitted effect.
- Write one test per illegal transition asserting it is rejected, and assert on the
  error, not on the fact that nothing happened.
- Test the terminal states explicitly: completed, cancelled, expired, failed.
- Test recovery: what happens on resume after a crash mid-transition, and whether the
  machine can reach a state it cannot leave.

## Error paths

- Test the error the system is contractually required to produce, not every branch.
- Include the dependency failure the caller most likely hits: timeout, 500, malformed
  response, disk full in the realistic case for that dependency.
- Assert that the error carries its cause and enough context to act on, and that no
  partial state was committed.
- A swallowed error needs a test that fails when the swallowing starts.

## Boundary values

- Test exactly at the limit, one below it and one above it: `0`, `1`, `max`, `max + 1`,
  `len - 1`.
- Test the empty case and the single-element case separately; they break different code.
- For lists and strings: empty, whitespace-only, one element, very large.
- For numbers: zero, negative, the smallest and largest representable, and one value
  where floating point rounding shows.

## Concurrency tests

Concurrency tests are usually flaky, and a flaky test is worse than none.

- Prefer testing the synchronization logic directly: a shared lock, an atomic compare,
  an idempotency key, a state transition that is already serialized.
- If you must test real concurrency, run the interleaving many times with a barrier or
  a seeded scheduler, and assert on the invariant (no lost update, no duplicate effect)
  rather than on a specific interleaving.
- Never assert on timing, never sleep to "let the other thread run", never depend on
  which thread finishes first.
- If a concurrency bug cannot be tested deterministically, test the guard that prevents
  it and say in the report that the race itself is unverified.

## Integration and end-to-end

- Integration tests are worth their cost when the thing that breaks lives at the
  boundary: schema constraints, serialization, transaction rollback, auth headers.
- End-to-end tests should cover critical paths only. Each one should be independent of
  the others in ordering and share no mutable fixture state.
- Measure and publish the runtime. A suite that takes 40 minutes will be skipped; one
  that takes 3 minutes will be run.
- Seed data through a fixture or factory with deterministic values, not through a
  shared mutable database other tests write to.

## Test data hygiene

- No real personal data: no real names, addresses, emails or phone numbers. Use
  obviously synthetic values (`test_user_1`, `example.invalid`).
- No real secrets, tokens, keys or account identifiers, in fixtures or in snapshots.
- Fixtures are deterministic: fixed timestamps, fixed ids, fixed seeds, fixed ordering.
- Build data in the test or in a factory function, not in a checked-in dump that nobody
  remembers updating.
- Delete or anonymize data captured from production before it enters the repository.

## Naming and structure

- Name the test after the behavior and condition: `rejects deletion of a user verified
  after the request date`, not `test_delete_user_2`.
- One behavior per test. Shared setup goes in a fixture or helper that returns data, not
  in a mutable module-level object.
- Keep the test next to the code it covers, following the repository's existing layout.
- Use the framework's conventions for arrange, act, assert; do not invent a house style
  over one that already exists.

## This test is bad, here is why

| Smell | Why it hurts |
| --- | --- |
| Asserts only that no exception was raised | Catches nothing |
| Mocks the unit under test | Asserts the mock, not the code |
| Asserts internal calls or private state | Breaks on every refactor |
| Uses wall-clock time, randomness, or a live network | Fails for environmental reasons |
| Sleeps, polls, or retries | Hides races; the failure is intermittent |
| Depends on another test or on execution order | Fails alone, passes in the suite |
| Giant shared setup, unrelated assertions | A failure names nothing |
| Asserts an exact message nobody consumes | Brittleness with no contract behind it |
| Covers a getter, a constructor, or framework glue | Costs maintenance, catches nothing |
| Exists to raise coverage of one uncovered line | Executes code and asserts nothing |
| Skipped with a "flaky, fix later" comment | Reports green while testing nothing |
