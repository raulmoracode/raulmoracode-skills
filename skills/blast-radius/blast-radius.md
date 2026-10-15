---
name: blast-radius
description: "Evaluates the forward-looking impact of a proposed change before and during it. Use when asking what would break, who uses this, is this safe to change, will this need a migration, is this still backward compatible, or before altering a public API, schema, config key, dependency, integration or hot path. Traces consumers, interfaces, data and configuration, compatibility, security and operational implications, then recommends safeguards, rollout order and rollback proportionate to the risk."
---

# Blast radius

A change that looks local from inside the file is rarely local. The useful question
before editing is not "how hard is this line" but "who else is standing on it, and
how will they find out".

**Core rule:** name the consumers before you touch the thing. A change with no
identified consumers has not been assessed, it has only been written.

## When to use

- Before a change to anything public: an exported symbol, an endpoint, a schema, a
  config key, a serialized format, a CLI surface, a library's public type.
- Before a dependency upgrade, a migration, or a change to shared infrastructure.
- Before removing, renaming or narrowing anything that something else reads.
- Mid-change, when new call sites or consumers appear.
- When the user asks "what would break", "who uses this", "is this safe".

Do not use to:

- Inspect the finished diff for defects → `review-your-work`.
- Hunt failure conditions, abuse and boundaries → `break-the-edge`.
- Judge whether the design is right → `software-architect`.
- Keep the diff small → `minimal-changes`.

## Process

### 1. State the change as a consumer would see it

One sentence, naming the interface that changes: what is added, removed, narrowed,
renamed, reordered or reinterpreted. If you cannot state it from the outside, the
change is not scoped yet.

### 2. Trace the surfaces

Read `references/impact-surfaces.md` and walk each surface: public interfaces, data
schemas, stored formats, configuration, dependencies and consumers, integrations,
deployment and runtime, observability, docs and examples, feature flags,
performance, security. Two minutes per surface is enough to know whether it is
clear or unexplored.

### 3. Find consumers, do not assume there are none

Grep for the imported name, the exported symbol, the config key, the endpoint path,
the table name, the event name, the error string. "No matches" means no consumers
*found in this repository* — other services, scripts, clients and humans reading the
docs are still out of scope of the search, and you say so.

### 4. Classify each impact by reversibility and detection

- **Reversible** — revert the commit and the world is as it was. Private helpers,
  internal refactors.
- **Recoverable** — wrong behavior or wrong data can be corrected afterwards. Most
  application-level changes.
- **Irreversible** — deleted or overwritten data, published migrations, charges and
  outbound messages, externally visible contracts, state a rollback cannot restore.

Then ask how fast a consumer would notice: a type error, a startup crash or a failing
test tells you in seconds; a silently wrong value tells you next week. Detection speed
decides how much rollback machinery the change deserves.

### 5. Judge compatibility honestly

Backward compatible, forward compatible, or breaking. Name the breaking part even if
it is small: a removed optional field, a narrowed type, a reordered array, a changed
default, a stricter validation, a renamed environment variable. "Minor" and "nobody
uses it" are claims that require the grep from step 3.

### 6. Recommend proportionate safeguards

Roughly in order of cost:

- Narrow the change to the smallest public surface.
- Keep the old signature and add the new one; deprecate rather than remove.
- Add a compatibility shim at the boundary, not in every call site.
- Ship the consumer-side change first, then the producer.
- Add or update tests on the consuming side.
- Add a feature flag, and name who owns the flag and when it is removed.
- Stage the rollout, and add observability before the blast.

Every safeguard you add is itself surface. Do not add three when one is enough.

### 7. Decide and state the plan

Say who is affected, what breaks, how it will be detected, in what order it ships,
and how it is rolled back. If the answer is "this cannot be reversed", get explicit
authorization before proceeding; external actions belong to `git-pr`, `git-issues`
and `safe-git`.

### 8. Re-run the pass as the change grows

Mid-change, new consumers appear and old ones disappear. Re-check the two or three
surfaces that mattered most before you finish.

## What this does not cover

- It does not review the finished diff. `review-your-work` reads the diff and finds
  defects in what you wrote.
- It does not attack failure conditions. `break-the-edge` asks what breaks when the
  world misbehaves: empty, huge, concurrent, hostile, unavailable.
- Running this skill does not stand in for either of them, and neither replaces this
  one: a change can have zero blast radius and still be full of bugs.

## Interaction with other skills

- `review-your-work` — backward-looking inspection of the completed change.
- `break-the-edge` — adversarial hunt for failure and boundary cases.
- `minimal-changes` — owns diff scope; a wide blast radius is a reason to narrow it,
  not a reason to widen it.
- `software-architect` — owns the design judgment; this skill supplies what the
  decision costs.
- `security-first` — owns threats, auth, secrets and injection; consult it when a
  surface is access-control or untrusted input.
- `plan-before-coding` — sequences the rollout and rollback steps this pass produces.
- `read-the-f-docs` — confirms the real behavior of a dependency's public contract at
  the version you depend on.
- `how-was-last-night` — recovers why the current contract is what it is before you
  change it.
- `test-before-finishing` — executes the checks this pass argues are necessary.
- `mom-always-say-the-same` — keeps docs, comments and examples consistent with the
  interface you are changing.

## Anti-patterns

- Assuming no consumers because the repository has no matches.
- Calling a schema or config change internal.
- Recommending a rollback for something irreversible.
- Adding a compatibility shim for a call site that does not exist.
- Treating detection speed as irrelevant because the change is small.
- Shipping producer and consumer in the same deploy with no ordering.
- Running this pass once at the start and never again after the change grew.
- Using impact analysis to postpone a decision instead of making it.

## Definition of done

Every surface in `references/impact-surfaces.md` was walked and recorded as clear,
affected or not found. Each impact has a named consumer, a reversibility class and a
detection path. The breaking part, if any, is stated outright, with the rollout
order, the safeguards and the rollback written down before the change is made.
