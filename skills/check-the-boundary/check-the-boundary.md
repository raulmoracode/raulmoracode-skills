---
name: check-the-boundary
description: "Reviews contracts and failure behavior at the seams where modules, processes, workers, services, APIs and databases meet: what each side sends, expects and guarantees, how data survives encoding, and what happens when the far side misbehaves. Use when a value or error crosses a component boundary, when data is serialized, queued or delivered out of order, when validation, timeouts, retries or error ownership are unclear, or when two sides of an integration disagree."
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

# Check the boundary

Every integration has two sides, and each side is read through its own
assumptions. The caller believes it sends valid data; the callee believes it
receives validated input. The queue promises at-least-once delivery; the handler
was written for exactly-once. Defects concentrate at these seams because
neither side's tests exercise the other side's behavior.

This utility audits seams one at a time: it writes the contract from each side,
compares the two versions, and probes the failure path with the same urgency as
the happy path. It reports mismatches with evidence and names the side that
should change; redefining published contracts or sequencing their evolution
belongs to the skills that own those decisions.

**Core rule:** describe each side of a boundary from its own sources, then
compare the descriptions; an agreement nobody wrote down is an assumption, and
assumptions fail silently.

## When to use

Use when:

- A change crosses a module, process, thread, worker, service, API or database
  boundary.
- A value or error is correct on one side of a seam and wrong on the other.
- Data is serialized, compressed, encoded or converted between runtimes or
  languages.
- Ownership of validation, timeouts, retries or error handling is unclear.
- A queue, event bus or worker adds deferred, repeated or out-of-order work.
- A partial failure may leave unknown state on one side of the seam.

Do not use to:

- Own the published shape and versioning of an API, event or schema →
  `api-contracts`.
- Plan a staged change where both sides cannot move at once →
  `contract-and-migration`.
- Review queries, indexes, locks and migration mechanics inside the engine →
  `database-engineering`.
- Decide whether a change breaks consumers that already exist →
  `backward-compatibility`.
- Threat-model untrusted input or credentials that cross the seam →
  `security-first`.

## Process

### 1. Enumerate the seams

List every place the flow crosses from one component to another: module
interfaces, thread or process handoffs, worker and queue pairs, container and
network hops, serialization formats, language boundaries, database connections,
browser-to-server calls, third-party services. Name both sides and their owners
for each. Seams are enumerable, and a seam nobody listed is the first defect.

### 2. Write the contract from each side

For one seam at a time, record what the caller believes it sends or expects and
what the callee promises to accept or return: types and nullability, units and
time zones, identifier formats, encodings, ordering, size limits, timeouts,
retry semantics, concurrency assumptions, error taxonomy. Compare the two
versions field by field. A contract written from one side only is a
description, not an agreement.

### 3. Check encoding fidelity

Anything crossing a process or machine line passes through an encoding. Check
what it does to the data: number precision, integer width, string encoding,
date formats, null against missing keys, empty arrays against absent ones,
binary payloads, schema-version negotiation, defaults injected by middle
layers. Exercise the seam through the real transport; an in-process call proves
none of this.

### 4. Interrogate the failure path

For each seam, ask what happens when the far side times out, closes early,
crashes mid-response, redelivers a message, delivers out of order or returns a
malformed payload. Find out who retries, who validates, who rejects, who logs,
and whether a retry can repeat a side effect. Separate definite failures from
indefinite ones: after a timeout or a lost acknowledgement the two sides can
hold different beliefs about the state.

### 5. Assign ownership per obligation

A seam needs exactly one owner for the contract shape, for inbound validation,
for the timeout budget, for retries and idempotency, and for the error
taxonomy. Write the owner next to each obligation. Two owners of one validator
will drift apart; zero owners trust whatever arrives. An unowned obligation is
a finding, not an open question.

### 6. Record findings per seam

Report each seam with its two sides, the mismatch or missing obligation, the
failure mode it produces, the evidence — a code path, a reproduction or the
contract location — and the side that should change. Order findings by what a
user would experience if the seam fails, not by the order they were discovered.
Keep unverified worries labeled as unverified.

## Interaction with other skills

- `api-contracts` — owns published API, event and schema shapes and their
  versioning; this utility checks whether a given seam honors them.
- `contract-and-migration` — owns staged transitions where the two sides of a
  boundary cannot change together.
- `security-first` — owns the threat model for untrusted data and credentials
  that cross the seam.
- `break-the-edge` — owns adversarial attempts to break edge behavior; this
  utility supplies the seam map those attempts target.
- `database-engineering` — owns everything inside the database; this utility
  reviews only what crosses its edge.
- `backward-compatibility` — owns the impact of a boundary change on consumers
  that already exist.

## Anti-patterns

- Reviewing the happy path and declaring the seam safe.
- Assuming shared names mean shared types, units or meanings.
- Proving a network or queue boundary with a mock that shares the caller's
  assumptions.
- A timeout treated as success or as failure without stating the remote state.
- Retries that can repeat a side effect the callee already applied.
- Validation assumed to happen on the other side, so it happens nowhere.
- A contract documented from one side and then treated as agreement.
- Findings that describe a mismatch without naming the side that changes.

## Definition of done

Every seam in the flow is listed with both sides; both versions of each contract
are written down and compared; encoding and failure behavior were exercised
through the real transport; every obligation has exactly one owner; and each
finding carries evidence and the side that should change. Assumptions that
could not be checked are reported as assumptions.
