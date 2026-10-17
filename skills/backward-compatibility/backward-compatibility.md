---
name: backward-compatibility
description: "Compares current and proposed behavior across APIs, CLIs, configuration, schemas, files and persisted data formats to detect breaking changes before existing users, integrations or deployments fail. Use when changing an interface, a default, a validation rule, an output format or stored data, when refactoring with no intended behavior change, or when asked whether a release is still safe for existing callers."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`api-contracts`, `contract-and-migration`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Backward compatibility

Compatibility is a claim about two versions of a system, so it can only be checked
by running both and comparing what a caller observes. Reading the diff answers a
different question: how the change was written, not how existing users experience
it.

This skill runs a released baseline and a candidate build against identical inputs
across APIs, CLIs, configuration, schemas, files and stored formats, then
classifies every difference as harmless, intended or breaking. What to do about a
confirmed break — expand, deprecate, coordinate a cutover — is a separate decision.

**Core rule:** run the same inputs through both versions, compare the recorded
observable outputs, and classify every difference before calling anything
compatible.

## When to use

Use when:

- An interface changes: endpoint, flag, environment variable, config key, export,
  event, file layout or serialized record.
- A default, validation rule, error code, ordering, limit or normalization changes.
- A refactor or dependency upgrade claims to preserve behavior.
- A schema migrates and old readers, old writers or a downgrade must still work.
- A release is about to reach consumers this repository does not control.

Do not use to:

- Design the contract being compared → `api-contracts`.
- Choose the migration, deprecation or removal sequence → `contract-and-migration`.
- Enumerate every consequence and consumer of the change → `blast-radius`.
- Decide how converted data can be rolled back or repaired → `database-engineering`.
- Run the complete repository check suite → `test-before-finishing`.

## Process

### 1. Fix the two states

Pin the baseline to the last artifact consumers actually have: a released tag, a
published package, a deployed revision. Pin the candidate to the exact revision
under review. Record platform, dependency lockfiles, configuration and the data
snapshot; two versions compared under different conditions prove nothing. Keep both
artifacts so the comparison can be re-run as the change grows.

### 2. Enumerate the observable surfaces

List what a consumer can observe before judging any of it: request and response
schemas, status codes and error payloads, CLI flags, exit codes and stream formats,
configuration keys and defaults, environment variables, event payloads, exported
symbols, file and record formats, URL routes, permission checks, metric and log
names. "No public API here" is the sentence that precedes most compatibility
incidents; configuration, output and persistence are contracts too.

### 3. Run one corpus through both versions

Build a corpus and use it unchanged on both sides: representative valid inputs,
boundary values, invalid and empty values, unicode text, maximum sizes, error paths
and sequences where state accumulates. Record raw outputs rather than impressions:
status codes, headers, response bytes, exit codes, stdout and stderr, files and
rows written, messages published. Diff the recordings mechanically first, then
read the differences that matter. When an old client, SDK or consumer fixture
exists, run it untouched against the candidate; that outranks any schema reading.

### 4. Classify each difference

Give every difference a class: additive extension, narrowing, removal, rename,
changed default, stricter validation, shifted error mapping, changed ordering or
timing, changed precision or encoding. A tolerant consumer ignores fields it does
not know, a strict one rejects them, so an addition is safe only for consumers
that tolerate it — a fact to check, not to assume. Removal, renaming and narrowing
break outright; a changed default silently alters behavior for every caller that
omitted the value; stricter validation rejects input that used to pass.

### 5. Check the semantics callers rely on

Idempotency, retry safety, ordering, deduplication, pagination stability, timezone
handling, unicode normalization and collation, numeric precision, rounding, and
the distinction between null, missing and empty. These rarely show up in a schema
diff and still break integrations. Mark each one verified, unchanged or unknown.

### 6. Compare in both directions over stored data

Reading new data with old code and old data with new code are separate questions.
Cover everything that outlives a process: databases, caches, cookies, local files,
queues holding in-flight messages, backups scheduled for restore. If only one
direction survives, state which and what it forbids — for instance, a rollback
impossible after the first write in the new format.

### 7. Record the verdict with evidence

For each difference, write the surface, the observed old and new behavior, the
affected consumer class, the command or test that produced the evidence, and the
classification. List intended behavior changes separately from accidental drift,
and present intended ones as changes with consequences rather than as free wins.
Hand confirmed breaks to the evolution process instead of wording around them.

## Interaction with other skills

- `api-contracts` — defines the current contract and its version; this skill checks
  a candidate against what that contract promised.
- `contract-and-migration` — turns a confirmed break into expansion, deprecation or
  a staged rollout instead of a surprise.
- `blast-radius` — widens the picture from tested consumers to everyone the change
  can reach.
- `database-engineering` — owns schema, backfill and conversion mechanics once
  stored data is in play.
- `test-before-finishing` — runs the repository checks after the comparison drives
  fixes.

## Anti-patterns

- Comparing the candidate against whatever is on main instead of the last release.
- Declaring compatibility from the diff or a design conversation without running
  both versions.
- One example payload treated as coverage of the schema's whole range.
- Testing success responses while error payloads, headers and exit codes drift.
- Feeding new output through the new parser and calling the round trip proof.
- Assuming every consumer ignores unknown fields because one framework does.
- Dismissing timezone, collation, precision and ordering differences as cosmetic.
- Checking reads but never writes, or forward compatibility but never rollback.
- A passing local suite read as evidence that external consumers are safe.
- A verdict that lists no differences and cites no evidence for the claim.

## Definition of done

Every surface in scope was compared: the baseline and the candidate ran against
one recorded corpus, the raw outputs are kept alongside the verdict, and each
difference carries a classification, an affected consumer class and the check that
produced it. Intended behavior changes are labeled as such, breaks are handed over
with evidence instead of euphemism, and anything unverified is listed as an open
assumption.
