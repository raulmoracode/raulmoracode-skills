---
name: api-contracts
description: "Designs and verifies HTTP, event, schema, CLI and service contracts, including field shapes, validation rules, error semantics and the compatibility each version promises. Use when defining or changing an endpoint, event, message or command, tightening validation, publishing or consuming a schema, aligning a producer with its consumers, or proving that code, schema, documentation and tests describe the same observable behavior."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `contract-and-migration`]
```

Operational metadata only; related skills are conceptual unless listed here.

# API contracts

An API contract is the observable agreement at a boundary: what a caller may send,
what it gets back, and what it may keep relying on. Integration failures are seldom
crashes; mostly they are two sides holding different pictures of a field, a default,
an error code or a limit that nobody wrote down.

This skill writes that agreement from the outside in and then verifies the running
producer against it. It owns the shape and behavior of the current contract across
HTTP endpoints, service and RPC methods, events, CLI surfaces, configuration keys
and schema documents. It does not own how a contract evolves over time.

**Core rule:** define the contract as the behavior a consumer can observe, keep one
artifact authoritative, and prove the running producer matches that artifact.

## When to use

Use when a change touches:

- An endpoint, method, event, message, command or configuration surface.
- Fields: types, optionality, nullability, enums, defaults, units or naming.
- Status codes, error codes, error payloads or validation diagnostics.
- A schema document, generated client, example payload or contract test.
- Alignment of a producer with consumers on different release schedules.
- Validation placement, coercion rules or handling of unknown fields.

Do not use to:

- Plan deprecation, staged rollout or removal → `contract-and-migration`.
- Model threats, authorization or hostile input → `security-first`.
- Enumerate every consumer that would feel the change → `blast-radius`.
- Design tables, indexes, constraints and transactions → `database-engineering`.
- Confirm what a protocol, platform or framework guarantees → `read-the-f-docs`.

## Process

### 1. Identify the parties and the version

Name the boundary, its producer, its consumers and who owns each side. Record the
transport, the call direction, and whether the exchange is synchronous or
asynchronous. Give the contract an identity: a path and media type, a package and
major version, a topic and envelope version. A contract without an identity cannot
say what changing it means.

### 2. Write the shape from the outside

Describe requests and responses as a consumer experiences them, not as the internal
model or the database row happens to look. Mark every field required, optional or
reserved, and say what null means separately from what a missing field means. Pin
types precisely: integer ranges, decimal precision, string formats, enum values and
their extension policy, array cardinality limits. Decide whether unknown fields are
ignored or rejected. Put units in the field name (amount_minor, duration_ms,
size_bytes) instead of leaving them in a comment nobody reads.

### 3. Fix the representation rules

Choose once and apply everywhere: naming style, timestamp format, timezone,
identifier opacity, money as integer minor units, booleans as booleans. State
pagination shape, sort stability, ordering guarantees and default limits. State
which fields are stable for the consumer and which are informational. Encoding,
compression and content type belong in the contract too, not in whichever client
happened to arrive first.

### 4. Specify validation and errors explicitly

Define one error envelope with a machine-readable code, a human message and the
offending field or parameter when the failure came from input. Map each failure
class to its status code and keep the mapping consistent across endpoints. Name
where validation happens: at the edge for untrusted input, in the domain for
business invariants, and never only in the client. Reject malformed values instead
of coercing them; silent coercion turns a caller bug into corrupted state.

### 5. Specify asynchronous and operator surfaces

For events, state the name, envelope, partitioning key, ordering guarantee,
delivery guarantee and what a consumer must do about duplicates, retries and
replays. Include schema identity in every message so a consumer can parse what it
receives without guessing. For CLI and operational surfaces, state exit codes,
stdout versus stderr, machine-readable output and how partial failure is reported.

### 6. Keep one authoritative artifact

Choose one source and derive the rest: a schema that generates code and
documentation, or code that emits the schema during the build. Two hand-maintained
copies drift within a release. Version the artifact with the code and keep its
changes inside the diff reviewers already read. When a contract change must ship
in stages, hand the sequencing to `contract-and-migration` rather than improvising
it here.

### 7. Verify the running producer

Contract tests must exercise the real producer, not a mock of it: send
representative requests and assert status codes, headers, body shape and error
payloads against the schema. Reuse documentation examples as fixtures so
examples, schema, code and tests cannot tell four different stories. Exercise
rejection paths with the same care as success paths, because consumers depend on
both.

## Interaction with other skills

- `contract-and-migration` — owns deprecation, staged rollout and removal criteria
  once the contract itself is defined.
- `security-first` — owns threat modeling and access control; this skill specifies
  the observable results, such as errors that do not leak internals.
- `blast-radius` — finds who consumes the boundary; this skill states what they may
  rely on.
- `database-engineering` — owns storage shape and integrity behind the boundary;
  this skill owns the representation crossing it.
- `read-the-f-docs` — confirms the protocol, framework and transport guarantees the
  contract assumes.

## Anti-patterns

- A schema that describes the last refactor instead of the deployed version.
- Error bodies invented per endpoint, each with its own shape and vocabulary.
- Fields that are required in the document and omitted in practice.
- Internal model names and nullable database columns leaking into the payload.
- Validation living only in the client because the happy path sends clean input.
- An enum documented as fixed while the server already returns a fourth value.
- Events with no schema identity, so consumers guess the payload vintage.
- Contract tests that assert a mock and never touch the running server.
- The word "compatible" used to mean nobody has complained yet.
- Timestamps without a timezone, floats for money, empty strings standing in for
  null.

## Definition of done

The boundary, its version, producer, consumers and owner are named; the shape,
representation rules, error envelope, delivery semantics and validation rules live
in one authoritative artifact; a contract test exercises the running producer and
passes; and the report states which parts are machine-verified, which are
documented but unverified, and which remain assumptions.
