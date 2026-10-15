# Decision criteria

Architectural choices that recur in real projects: the question to ask, the pull toward
each side, what reversal costs, and the default for a small project. Read it when a
design decision is contested, before committing to a boundary or a pattern.

Reversibility scale used below: **cheap** (hours, no data movement), **moderate** (days,
coordinated change), **expensive** (weeks, data or contract migration, every consumer
affected).

## 1. Where the boundary belongs

- **Ask:** do these parts change for different reasons, ship on different schedules, or
  need different levels of access or failure isolation?
- **Toward splitting:** independent teams, independent cadence, real load imbalance, a
  genuine security or compliance boundary.
- **Toward one process:** shared transactions, shared type vocabulary, changes that
  always land together, no owner for another deploy.
- **Reversibility:** expensive. Moving a module into a service touches every caller.
- **Default:** split at the module or package boundary inside one process and one
  deployment. Name the seam so extraction stays possible.

## 2. Introducing an abstraction

- **Ask:** is there a second real implementation, a second caller with different needs,
  or something volatile to isolate (clock, filesystem, network, randomness)?
- **Toward the abstraction:** the dependency is known to change, a test needs a seam, two
  callers already disagree about behavior.
- **Against it:** one implementation, one caller, no volatility. The interface becomes
  a second place to keep in sync for no proven benefit.
- **Reversibility:** cheap. Delete the interface and inline the implementation.
- **Default:** none. Extract an abstraction when the second caller appears.

## 3. Adding a layer of indirection

- **Ask:** does this layer hold a decision the caller would otherwise have to make?
- **Toward the layer:** repository over query code, handler over transport specifics,
  adapter over a foreign protocol, orchestration over scattered calls.
- **Against it:** a pass-through wrapper, a manager that only forwards, a factory that
  never chooses anything.
- **Reversibility:** cheap to remove, but callers may already depend on the seam.
- **Default:** add a layer only where it owns a decision. Name the decision.

## 4. Synchronous or asynchronous

- **Ask:** must the caller know the outcome before it responds, and how long may it wait?
- **Toward sync:** the caller needs the result, the caller's transaction includes it, the
  latency budget is tight, failures should surface at the call site.
- **Toward async:** work outlives the request, callers are many and independent, load
  must be smoothed, the consumer is another team.
- **Reversibility:** expensive once a queue, retry and dead-letter policy exist; every
  consumer then needs a staleness story.
- **Default:** synchronous. Go async when you can name the queue depth you tolerate.

## 5. Shared code or duplicated code

- **Ask:** will both copies change together, and who is allowed to change them?
- **Toward sharing:** one owner, same release train, duplication already drifting.
- **Toward duplication:** different owners, different cadence, a "shared" module that
  would need options for every consumer.
- **Reversibility:** cheap either way, which is why it is usually decided by habit.
- **Default:** duplicate first, share when drift cost exceeds coupling cost.

## 6. Schema and state ownership

- **Ask:** which component is the only writer, and which components read?
- **Toward one owner:** a single writer plus read-only consumers keeps invariants
  enforceable and the truth unambiguous.
- **Toward a shared schema:** convenience and immediate consistency inside one process.
- **Reversibility:** expensive. Data outlives the decision that created it.
- **Default:** inside one process, one owner and one migration path. Across boundaries,
  publish a contract and let consumers keep their own representation.

## 7. Dependency direction and cycles

- **Ask:** which side is stable and general, which side is specific and volatile?
- **Toward inversion:** putting the interface on the stable side removes the consumer's
  need to know the concrete implementation.
- **Toward convenience:** importing the concrete type directly is less code today.
- **Reversibility:** cheap inside a process; expensive once layers or services have
  compiled the direction in.
- **Default:** arrows point inward, to the domain, from transport and framework. Break a
  cycle by extracting the shared concept, not by moving an import.

## 8. Build-time or runtime configuration

- **Ask:** does the value change between deployments, or between requests?
- **Toward build-time:** compile-time safety, no runtime lookup path, no secrets baked
  into a bundle.
- **Toward runtime:** feature flags, per-environment values, anything that must change
  without a redeploy.
- **Reversibility:** cheap for either, but every runtime knob is permanent surface you
  must support, document and test.
- **Default:** build-time for anything structural; runtime only for values that genuinely
  change per environment or need a kill switch.

## 9. Monolith or split services

- **Ask:** is there one team, one deploy cadence and one database, or several?
- **Toward splitting:** independent teams, independent scaling, fault isolation,
  different compliance boundaries.
- **Toward one process:** shared transactions, tight release coupling, no platform team
  to run extra infrastructure.
- **Reversibility:** very expensive both ways. Splitting costs distributed systems;
  merging costs a coordinated rewrite.
- **Default:** a modular monolith. Split the process only when a named requirement,
  usually team ownership, demands it.

## 10. Caching and consistency

- **Ask:** how stale may this be, who invalidates it, what happens on a cold miss?
- **Toward caching:** read-heavy, expensive to recompute, tolerant of staleness.
- **Toward no cache:** correctness-critical, cheap to compute, low read volume.
- **Reversibility:** cheap to add, expensive to remove once callers expect freshness.
- **Default:** no cache until a measurement shows the cost. When you add one, define the
  invalidation rule and the staleness bound before you define the key.

## 11. Migration or big-bang

- **Ask:** can both shapes coexist during the change, and for how long?
- **Toward migration:** live data, external consumers, no maintenance window, any change
  that must be revertible.
- **Toward big-bang:** no production data, a small codebase, a short-lived branch, a
  change cheaper to redo than to interleave.
- **Reversibility:** big-bang is cheap while nothing is live and catastrophic after it
  lands; migration is always available and always slow.
- **Default:** incremental. Ship the new shape alongside the old, move consumers in small
  steps, delete the old path in a separate change.

## 12. Failure handling across a boundary

- **Ask:** when the dependency is slow, down or wrong, what does this component do?
- **Toward defensive design:** timeouts, bounded retries with backoff, circuit breakers,
  degraded responses, queues for work that can be replayed.
- **Against it:** defensive code in paths nobody has seen fail and nobody can reach today.
- **Reversibility:** cheap to add, but adding it late means inventing the policy during an
  incident.
- **Default:** every outbound call gets a timeout, nothing retries silently more than
  twice, and degradation behavior is decided, not discovered.
