---
name: contract-and-migration
description: "Guides safe evolution of API, CLI, configuration, schema, event and persisted-format contracts. Use when a change can affect producers, consumers, stored data or operators, or when compatibility, deprecation, staged migration, rollout or rollback must be designed. Defines the transition states, sequencing, verification and removal criteria so a contract change can ship without guessing."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`blast-radius`, `plan-before-coding`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Contract and migration

Contracts are promises made by one release to another: a client to an API, a script
to a CLI, a deployment to its configuration, a reader to a schema, a consumer to an
event, or a process to data it already persisted. Change the promise deliberately.
The goal is not to prevent change; it is to make every intermediate version useful,
observable and recoverable.

**Core rule:** introduce compatibility before requiring it, migrate consumers before
removing the old contract, and keep rollback possible until the new state is proven.

## When to use

- Adding, removing, renaming, narrowing or reinterpreting an API, CLI flag, config key,
  schema field, event payload, queue topic, serialized format or persisted record.
- Changing defaults, validation, ordering, cardinality, units, error semantics or
  authentication requirements at a boundary.
- Migrating stored data, changing a reader/writer pair, or changing an event producer
  and its consumers on different release schedules.
- Introducing a deprecation, compatibility shim, dual-read, dual-write, adapter,
  versioned endpoint, feature flag or staged rollout.
- Planning rollback for a change that may have crossed a deployment or data boundary.

Do not use to:

- Discover every affected surface without proposing a migration → `blast-radius`.
- Choose component boundaries or the overall architecture → `software-architect`.
- Plan a general implementation with no contract transition → `plan-before-coding`.
- Hunt hostile inputs and failure boundaries → `break-the-edge`.
- Inspect the finished diff for defects → `review-your-work`.

## Process

### 1. Write the contract delta

Describe the old and new observable behavior, not the internal implementation. Name
the producer, consumer, owner and version for each contract. Record whether the change
is additive, behavior-changing, narrowing, removing or a format rewrite. State the
compatibility promise explicitly: old consumers with new producers, new consumers with
old producers, both, or neither.

Check details that are easy to miss:

- required versus optional fields, defaults, nullability and unknown-field handling;
- CLI exit codes, output shape, flag aliases, config precedence and environment names;
- schema constraints, indexes, backfills, readers, writers and downgrade behavior;
- event names, envelopes, ordering, replay behavior, idempotency and retry semantics;
- persisted bytes, encoding, timestamps, units, enum values and corruption handling.

### 2. Choose the transition shape

Prefer an additive path when consumers cannot all move together:

1. **Expand:** add the new field, version, reader or capability while preserving the
   old contract.
2. **Migrate:** update consumers and data in observable batches; allow mixed versions.
3. **Contract:** switch the producer or writer only after consumers accept both forms.
4. **Converge:** verify adoption, stop producing the old form and remove the shim,
   backfill path or alias only after its removal criteria are met.

Use an adapter, translation boundary, dual-read or dual-write only when it has a
named owner, a bounded lifetime and metrics that show when it can be removed. Prefer
one canonical representation; do not let compatibility logic spread through every
caller. If a breaking cutover is unavoidable, make the version boundary explicit and
coordinate the release order rather than disguising it as a refactor.

### 3. Sequence the migration safely

Order releases by what each version can understand:

- deploy readers before writers;
- deploy tolerant parsers before new producers;
- deploy schema additions before code that requires them;
- backfill before enforcing a new invariant;
- migrate consumers before removing an alias or old event;
- keep rollback readers and old writes available until rollback is no longer needed.

For data changes, define batch size, resumability, locking, retry behavior, duplicate
handling, partial progress and the source of truth. For events, define replay and
dead-letter behavior. For CLI and config changes, preserve a clear diagnostic and
document the replacement before rejecting the old input.

### 4. Define observability and gates

Name the evidence that permits each transition: compatibility tests, contract tests,
schema validation, migration counts, dual-read mismatches, parse failures, old-version
traffic, error rates, lag, data-quality checks and operator smoke tests. Add alerts
for silent divergence, not only crashes. A rollout gate must have an owner, a
threshold and a decision: continue, pause, repair or roll back.

### 5. Define deprecation and rollback

A deprecation is incomplete until it says who is affected, how they discover it, when
the warning starts, when the old path stops accepting traffic and what evidence allows
removal. Make warnings actionable and avoid breaking automation unexpectedly.

Write rollback as an executable sequence, not "revert the deploy." State whether the
old reader can consume new data, whether new writes are reversible, how to stop a
backfill, how to restore a snapshot or replay events, and what happens to mixed
versions. If the new format has already overwritten information the old format needs,
rollback may be impossible; stop and require an explicit recovery plan before shipping.

### 6. Close the migration

Verify the target contract with real consumers and representative old data. Remove
temporary compatibility code only after its usage is zero for an agreed observation
window and rollback no longer depends on it. Update the contract documentation,
examples, schemas, runbooks and tests together. Record the final version and the
evidence that the old path is gone.

## What this does not cover

- `blast-radius` identifies the surfaces and consumers affected by a change; this
  skill turns those findings into a compatibility and migration sequence.
- `software-architect` judges the system shape and ownership; this skill chooses how
  versions cross an existing boundary safely.
- This skill does not make irreversible data deletion safe by wording. It exposes
  when a rollback is impossible and requires a recovery decision.

## Interaction with other skills

- `blast-radius` identifies consumers, reversibility and detection speed before this
  skill selects the transition.
- `plan-before-coding` turns the chosen migration into ordered, checkable work.
- `software-architect` evaluates ownership, boundaries and representation choices.
- `how` explains the current contract; `why` recovers the history behind it.
- `read-the-f-docs` confirms dependency and platform compatibility guarantees.
- `break-the-edge` tests malformed, missing, duplicated, concurrent and partial data.
- `dad-always-say-the-same` designs the contract and migration tests.
- `test-before-finishing` runs the checks; `verify-before-claiming` sets the evidence
  required before calling the migration safe.
- `mom-always-say-the-same` keeps schemas, docs, examples and operator messages in
  sync.
- `database-engineering` — analyzes the schema, query, transaction and lock surface when
  a contract change touches stored data.

## Anti-patterns

- Deploying a new writer before old readers can tolerate its output.
- Calling a breaking change backward compatible because one repository still passes.
- Adding dual-write without a mismatch metric, repair path and removal date.
- Backfilling in one unbounded transaction with no resume or stop procedure.
- Enforcing a new invariant before existing records satisfy it.
- Removing a deprecated alias because the warning was emitted, without checking use.
- Treating rollback as a source-control revert after irreversible data conversion.
- Keeping compatibility code forever because nobody owns its removal.

## Definition of done

The old and new contracts, compatibility matrix, owner, release order, migration
state, gates, deprecation criteria and rollback or recovery procedure are written
down. Each transition has an observable check, mixed versions remain safe for the
supported window, and temporary compatibility code has a removal condition.
