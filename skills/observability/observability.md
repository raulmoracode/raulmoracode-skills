---
name: observability
description: "Designs and uses structured logs, metrics, traces, correlation identifiers and alerts so production behavior can be diagnosed from evidence instead of guesswork. Use when adding or reviewing logging, metrics or tracing, when a production question cannot be answered from current signals, when logs are noisy or unstructured, when alerts are missing or unactionable, or when deciding what a service must emit."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `debug-properly`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Observability

A production failure usually starts as a question nobody can answer: which request
failed, for which tenant, on which version, since when and how often. Observability is
the property that those questions already have answers sitting inside the system. It is
not a dashboard collection or a vendor choice; it is a set of deliberate signals —
structured logs, metrics, traces, correlation identifiers and alerts — designed together
and kept honest while the system changes underneath them.

**Core rule:** instrument for the question that will be asked during the worst hour, and
treat a signal nobody would query as cost without value.

## When to use

Use when:

- Adding logging, metrics or tracing to new or existing code.
- A production question cannot be answered from what the system currently emits.
- Logs are noisy, unstructured, unaffordable or impossible to filter by field.
- Requests, jobs or messages cross processes and lose their identity on the way.
- Alerts fire without an action, or user-visible failures produce no alert at all.
- An incident review finds signals that should have existed before the incident.

Do not use to:

- Establish the root cause of a reproduced defect → `debug-properly`.
- Decide what may be recorded, redacted or exposed → `security-first`.
- Log pipeline runs, deployment steps or build evidence → `ci-cd`.
- Map call paths and boundaries before instrumenting them → `understand-before-acting`.

## Process

### 1. Name the questions before choosing signals

List the operational questions the system must answer: which request was slow, which
version raised the error rate, how many jobs are retrying, whether the last deploy
changed behavior. Signals are chosen to serve those questions. A signal nobody queries
is monitoring for its own sake; a question no signal can answer is a blind spot to close
on purpose, before an incident finds it first.

### 2. Structure events and keep field names stable

Emit logs as structured events with stable field names rather than concatenated prose.
At minimum: timestamp, severity, service, version, environment, event name, outcome and
correlation identifiers. The message stays readable for a human; the fields stay
filterable for a machine. Field names are an interface — renaming one silently breaks
every saved query — so treat a rename like a contract change and carry both names
through the transition.

### 3. Pick the signal that fits the question

- Metrics answer how many, how fast and how full; they are cheap to keep and natural to
  alert on, but expensive to make specific.
- Traces answer where the time went and which hop failed inside one request or job.
- Logs answer what exactly happened at one moment: the value, the response, the
  decision that was taken.

Keep identifiers of users, orders and requests in logs and traces, where search
tolerates them; a metric label holding those values multiplies series and breaks
aggregation. Decide sampling per signal up front, and state what a sampled stream can
no longer prove.

### 4. Carry correlation across every boundary

Mint the identifier at the entry point — HTTP request, queue message, scheduled run,
CLI invocation — and propagate it through outbound calls, background work and retries.
It must survive serialization, appear in every event tied to that unit of work, and be
safe to show an operator. It is a lookup key for diagnosis, never proof of identity,
and a value chosen by a client is a value not to trust.

### 5. Make failure, degradation and recovery visible

Log the decision and the reason, not only the outcome: which branch was taken, which
threshold was crossed, how many attempts remain, which fallback answered. Separate
expected rejections from unexpected faults so ordinary traffic does not drown the signal
that matters. Record recovery and resumption as well, or the timeline stops in the
middle of the failure it was supposed to explain.

### 6. Bound cost, cardinality and retention

Estimate volume as events per request times request rate before shipping a new signal.
High-cardinality attributes belong in logs and traces, where search tolerates them, not
in metric labels, where they multiply series without bound. Set retention by what
reopens an old incident: recent raw detail, older aggregates. Provide a way to raise
detail temporarily for one subsystem, and make that raise expire on its own.

### 7. Design alerts as promises to act

Every alert names what it detects, its threshold and window, its severity, its owner and
the first action to take. Prefer symptoms users feel — errors, latency, saturation,
stuck queues — over internal causes. Page only for conditions that cannot wait until
morning. An alert that is routinely muted is a defect in the alert: fix it or delete it
rather than training people to ignore it.

### 8. Verify signals by generating the condition

A signal is not done until it has been observed. Induce the failure, slowdown or retry
in a safe environment and confirm the event arrives with the expected fields and
identifiers. Then answer one realistic question end to end — find an error from last
week by its correlation identifier and establish request, version and path — using
nothing but emitted signals. Close every gap that exercise reveals; coverage claimed
without that run is a guess.

## Interaction with other skills

- `debug-properly` — owns the hypothesis loop; this skill supplies the evidence that
  loop consumes.
- `ci-cd` — owns pipeline logs, artifacts and delivery evidence; service runtime
  signals belong here.
- `security-first` — owns what may be recorded, redacted, retained or shown, including
  secrets and personal data.
- `understand-before-acting` — maps call paths, boundaries and existing tooling before
  new instrumentation is placed.
- `performance-engineering` — turns the signals this skill collects into measured
  bottlenecks and regression checks.

## Anti-patterns

- Log lines assembled by concatenation, so nothing can be filtered by field.
- A correlation identifier minted at every hop, which correlates nothing.
- Metric labels holding user, order or request identifiers.
- Alerts with no owner, no threshold rationale and no first action.
- Info-level logging inside a hot loop with no sampling and no expiry.
- Dashboards presented as proof of health while the failing path emits nothing.
- Instrumentation applied directly in production instead of as a reviewed change.
- Calling a signal designed when it has never been observed once.

## Definition of done

The operational questions are written down; every signal carries stable structured
fields and an identifier that survives each boundary it crosses; cardinality, sampling
and retention are bounded and stated; alerts name an owner, a threshold and an action;
what may be recorded follows the security boundary; and each signal was verified by
generating the condition and answering a real question from the emitted data alone.
