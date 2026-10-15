# Edge catalog

Classes of edge case to scan against, each with the question it asks and what to do
when it finds something. Read it while designing or implementing a change with
boundaries, then keep only the findings you can tie to a realistic trigger.

## Boundaries

- **Ask:** what are the limits, and what happens at 0, 1, -1, `min`, `max`, one below
  the limit, exactly at the limit, one above it? Does an off-by-one make the last valid
  value illegal, or the first illegal value legal? Can a numeric value overflow or wrap?
- **Turn into:** a test at limit - 1, limit, and limit + 1. Name the constant that
  defines the limit; if there is none, that is the first finding.

## Emptiness

- **Ask:** what happens for `null`, `undefined`, empty string, whitespace-only string,
  empty collection, zero, and "present but zero"? Is empty treated as missing, or as a
  real value? Does an empty result render, paginate, sum or serialize without a special
  case?
- **Turn into:** one test per empty form the input can take. Cover the empty UI state
  when the input is user-visible.

## Size and scale

- **Ask:** what happens with far more data than expected — a 10 MB upload, a 100k-row
  result, a 50-level nested structure, one 10 MB token, a query without a limit? What
  about Unicode and right-to-left text, emoji and combining characters, long unbroken
  strings with no spaces, different locales and timezones, decimal precision, and
  floating point sums that should be exact money?
- **Turn into:** a test with a large generated fixture (not a checked-in dump), a
  truncation or length limit at the boundary, and a check that money uses integers or a
  decimal type rather than floats.

## State

- **Ask:** what does the code see when it is called before initialization, halfway
  through an update, after a partial failure, or with a stale cache? Can two parts of
  the system hold different values at once? Can a callback or hook re-enter the code
  that invoked it? Is the state ever read while it is being written?
- **Turn into:** a test that calls the function before its setup runs and asserts a
  defined behavior; make the update atomic or reorderable rather than leaving
  half-updated state reachable.

## Time

- **Ask:** what happens across clock skew between machines, a DST transition, a leap
  date, a timezone change, a token or cache entry that expires exactly at the boundary,
  an operation that takes longer than its own timeout, or a long-running process
  that outlives the deploy that started it? Does the code use a monotonic source for
  durations and a wall clock only for display?
- **Turn into:** inject a clock and test the expiry boundary at exactly `expires_at` and
  one second either side. Never test against the real clock.

## Concurrency

- **Ask:** what happens when two requests do the same thing at once — duplicate
  submission, double click, retried request, two workers on the same row? Can reads see
  an intermediate state? Can work be reordered or dropped? Can a lock be held across an
  await, and can it deadlock? What happens if the client disconnects mid-operation?
- **Turn into:** an idempotency key or a unique constraint plus a test that fires the
  operation twice and asserts one effect. Test the guard rather than the interleaving;
  real concurrency tests are flaky. See `dad-always-say-the-same`.

## Failure

- **Ask:** what is left behind when a step halfway through fails? Is the write partial,
  and is the rollback complete? Is a retry idempotent, or does it double-charge,
  double-send or double-insert? What does the code do when the dependency is down, slow,
  or returns a malformed response? What about disk full, out of memory, a dropped
  connection mid-upload, or a migration that fails halfway?
- **Turn into:** a failure-injection test with a stubbed dependency that fails at the
  worst step, asserting the rollback; a uniqueness constraint for retries; a test that
  the migration rolls back cleanly.

## Integration

- **Ask:** what happens with a dependency version outside the range the code was tested
  against, a deprecated field disappearing, a default changing upstream, a response
  gaining a new field, or an unexpected caller hitting an internal function? Is the
  change backward compatible with the versions still deployed, and forward compatible
  with the version being rolled out to?
- **Turn into:** a contract test pinned to the fields actually used, a compatibility
  check against the oldest supported client, and a feature flag with a default that
  matches current behavior.

## Abuse

- **Ask:** can someone exhaust a resource — CPU, memory, connections, queue depth,
  rate limit, storage — with a single request? Can they inject through a query, a
  filename, a template or a header? Can they enumerate other users' data or probe a
  privilege boundary by varying an id? Is anything expensive reachable without
  authentication?
- **Turn into:** hand these to `security-first` and do not restate its checklist.
  Implement the limits you find: caps, pagination, rate limits, parameterized queries,
  and authorization checks on every path that takes an identifier from the caller.
