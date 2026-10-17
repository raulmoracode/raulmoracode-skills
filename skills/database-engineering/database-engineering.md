---
name: database-engineering
description: "Analyzes schemas, SQL, queries, migrations, indexes, transactions, concurrency, locks, integrity constraints and database performance, then shapes changes that stay safe under real data volumes and traffic. Use when a task touches a schema, adds or rewrites a query, introduces an index, backfill or migration, contends for rows or tables, or needs data correctness, lock behavior and recovery proven before shipping."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `blast-radius`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Database engineering

A database outlives the code deployed against it. Tables, constraints and rows survive
refactors, rollbacks and incidents, so the cost of a wrong decision here is measured in
data that must be restored or reconciled, not in a reverted commit. This skill reviews
and designs the data layer: schema shape, query plans, index coverage, transaction
boundaries, lock behavior, integrity rules and the migrations that move all of them
forward.

It reasons from the engine and the workload in front of it, not from ORM intuition or a
schema diagram. Every claim it makes about a query or a change should trace to a plan,
a row count, a lock mode or a measured timing.

**Core rule:** justify every schema, query, index and migration decision with the data,
access pattern and concurrency it will actually meet, and know what undoing it would
cost before the change starts.

## When to use

Use when:

- Designing or reviewing tables, columns, types, keys, constraints, defaults and owners.
- Writing, repairing or explaining SQL, ORM queries, views or stored routines.
- Adding, altering or dropping an index, or diagnosing a slow query or a lock wait.
- Writing or auditing a migration, backfill, batch update or destructive cleanup.
- Changing transaction boundaries, isolation level, retry behavior or write idempotency.
- Diagnosing deadlocks, contention, replication lag, connection exhaustion or corruption.
- Reconciling stored data against application expectations before trusting a report.

Do not use to:

- Decide version compatibility and rollout order for a contract change → `contract-and-migration`.
- Map every service, environment and stored surface a change can reach → `blast-radius`.
- Threat-model privileges, credentials, injected SQL or row-level access → `security-first`.
- Design the tests that prove data-layer correctness → `dad-always-say-the-same`.
- Explain page layout, write-ahead logging or storage-engine internals → `low-level-engineering`.

## Process

### 1. Establish the data reality

Measure before proposing: row counts and growth, read-to-write ratio, peak
concurrency, the queries that matter, latency budget, engine version and replication
topology. Read the statistics views instead of estimating from the schema. Mark each
number as measured or assumed, and treat the assumed ones as risk.

### 2. Read the plan, not the query text

Use the engine's real execution plan with actual row counts and buffer traffic.
Separate estimates from actuals and explain every large gap. Look for scans on hot
paths, misestimates, spills, nested-loop explosions and per-row function calls. Check
when statistics were last refreshed, because a stale plan is not evidence.

### 3. Review the schema as a long-lived contract

Types carry meaning: identifiers, money, instants and durations have canonical
representations. Decide nullability, defaults, uniqueness, foreign keys and delete
behavior deliberately. Enforce invariants in the store wherever feasible, because
migrations, scripts, replicas and other services write the same tables. Keep the DDL
reachable from a clean checkout so the current shape can be rebuilt.

### 4. Design DDL and backfills around locks

Name the lock each statement takes and what queues behind it. Prefer metadata-only
changes: a nullable column, a default that needs no rewrite, a concurrent index build.
Split validation from the structural change, and make long operations resumable with
batch sizes, pauses and stop conditions. Set a lock timeout so a blocked change fails
fast instead of freezing traffic behind it, and schedule it outside the hot window.

### 5. Control transactions and contention

Keep transactions short and free of outbound calls, sleeps and unbounded scans. State
the isolation level and the anomalies it permits. Retry serialization failures as whole
units with idempotent writes, and order writes consistently so deadlocks stay rare.
Treat long transactions as an operational hazard for cleanup and replicas, and size
connection pools against measured concurrency rather than thread count.

### 6. Optimize in a fixed order

Fix the query first: sargable filters, no N+1 access, keyset pagination over growing
offsets, and only the columns needed. Then match the index to the filter and sort order,
using included, partial or expression indexes only where the access pattern is stable.
Only then consider partitioning, denormalization or materialization, each with a refresh
strategy and an owner. Re-run the plan after every step and keep both timings.

### 7. Verify on representative data

Exercise the change against production-like volume and shape, never an empty
development database. Confirm row counts and invariants with queries that would fail
loudly, check that constraint validation covers existing rows, and exercise the
recovery path — restore, reverse migration or re-derivation — before it is needed.
Record what ran, on what data, and what remains unchecked.

## Interaction with other skills

- `contract-and-migration` — owns compatibility promises and staged evolution across
  releases; this skill owns lock-safe DDL, backfill mechanics and query correctness.
- `blast-radius` — maps the services, environments and data a change can reach, and how
  quickly a problem would surface.
- `security-first` — owns threat modeling for database credentials, privileges, injected
  SQL and row-level access rules.
- `dad-always-say-the-same` — designs the test set once this skill names what must hold
  about the data.
- `low-level-engineering` — explains buffer management, write-ahead logging and page
  behavior when a plan or a timing cannot be explained from SQL.
- `database-engineer` — the working posture that applies this skill: data modeling, SQL,
  transactions, indexes, locks and query performance.

## Anti-patterns

- Approving a migration from the schema alone, with no row counts, lock estimate or
  traffic window.
- Adding an index for every slow report and charging the write path for all of them.
- Trusting an ORM's generated SQL without reading the plan it produces.
- Editing a query until it looks indexable instead of measuring before and after.
- Wrapping a bulk change in one open transaction with no checkpoint, timeout or stop switch.
- Choosing nullability, types or uniqueness from what current code sends rather than
  what the column must guarantee.
- Enforcing integrity only in application code while other writers reach the same tables.
- Testing a migration on an empty or developer-sized database and calling it safe.
- Rolling a destructive change forward with no verified restore path.

## Definition of done

The schema, queries, indexes, transactions and migration are each justified by measured
data and access patterns; every structural change states its lock behavior, resumability
and recovery path; invariants are enforced where every writer passes; plans and timings
were compared before and after; and verification ran on data with production-like volume.
