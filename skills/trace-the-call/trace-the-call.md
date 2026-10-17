---
name: trace-the-call
description: "Follows execution from a chosen entry point through every call, event, transformation, boundary and side effect until the observed behavior is explained. Use when a symptom appears far from its cause, when middleware, callbacks, events, queues or plugins sit between the two, when it is unclear which branch actually ran, or before changing a shared function whose real call surface is unknown."
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

# Trace the call

Reading a function explains what it could do; only a trace shows what actually
ran. In layered systems the symptom and the cause sit several hops apart —
behind middleware, a callback, an event subscriber, a worker dequeue or a retry
— and inspecting the first visible function produces a confident wrong answer.

This utility walks one execution path from a chosen entry point to its side
effects and writes down the chain: each call, event, transformation and
boundary crossing, in the order the runtime took them, with evidence for every
link. The chain ends where the behavior is explained, or where the trace
stopped and why.

**Core rule:** never explain behavior from the first visible function; follow
the full path until every step between entry point and observed effect is named
and evidenced.

## When to use

Use when:

- A symptom surfaces in one place while the cause is suspected in another.
- Execution flows through middleware, hooks, callbacks, events, queues or plugins.
- It is unclear which branch, handler or implementation actually ran.
- A value, error or side effect must be connected to the code that produced it.
- A shared function is about to change and its real call surface is unknown.
- An intermittent failure appears only under async or concurrent execution.

Do not use to:

- Design and test a root-cause hypothesis → `debug-properly`.
- Explain design intent or historical choices → `how`.
- Decide what a production system should record → `observability`.
- Investigate DOM, event-loop, worker or rendering behavior as such →
  `browser-engineering`.
- Gather repository context and conventions before a change →
  `understand-before-acting`.

## Process

### 1. Fix the entry point and the symptom

Name the exact entry: a route, command, handler, scheduled job, message consumer
or failing test. Record the observed symptom with a concrete value — the log
line, the status code, the wrong field. If several entries could produce it,
trace them one at a time; merging two paths hides the one that mattered.

### 2. Walk the forward path in execution order

Follow the sequence the runtime actually invoked: calls, awaited calls,
callbacks, listeners, middleware and work queued for later. Record the order of
execution, not the order files appear in or imports suggest. Follow dynamic
dispatch — interfaces, injection, plugins, overrides — to the concrete
implementation that ran.

### 3. Record every transformation

At each hop note what the data was and what it became: argument values, types,
units, defaults, validation, normalization, serialization. Mark the points
where meaning changes — undefined becomes a default, a string becomes a number,
a user id becomes a storage key, milliseconds become seconds. Include returned
values and error shapes; a happy-path-only trace explains half the behavior.

### 4. Mark the boundaries

Write down each crossing of a process, network, protocol, queue, file, database,
thread or worker. At every crossing ask what is preserved and what is lost:
types, precision, ordering, identity, encoding, timing, the caller's
credentials. Check the failure side too; a crossing that behaves only while the
far side is healthy is not fully traced.

### 5. Name the side effects

The trace is incomplete until it lists what the path changed: rows written,
messages published, caches invalidated, files touched, external calls made,
state mutated. Note when each effect lands relative to the return value, and
whether it is deferred to a queue or a retry. Note what stays behind if the path
dies partway.

### 6. Report the chain with evidence

Write the result as an ordered chain — entry, calls, transformations,
boundaries, effects — and tag each link as confirmed by a runtime observation
or inferred from reading code. State where the trace stops and why. Hand a
localized defect to `debug-properly` to test; this utility supplies the path,
not the verdict.

## Interaction with other skills

- `debug-properly` — owns hypothesis testing and root-cause experiments; this
  utility supplies the ordered path those experiments must explain.
- `understand-before-acting` — gathers repository facts and conventions; this
  utility narrows them to one execution path.
- `observability` — owns what production records and alerts on; this utility
  reads those signals and names the hops they cannot show.
- `browser-engineering` — owns DOM, event-loop, worker and rendering behavior
  when a trace enters the browser.
- `how` — explains design intent and history; this utility explains execution
  order and data flow.

## Anti-patterns

- Stopping at the first function that looks connected to the symptom.
- Presenting the import graph or call-hierarchy view as the executed path.
- Tracing only the success branch and skipping error, retry and cancel paths.
- Treating an inferred hop as confirmed because the code compiles and looks
  right.
- Assuming listeners fire in registration order without observing the scheduler.
- A trace that reaches a boundary and never says what crossed it.
- Side effects listed without checking when they commit relative to failure.
- Absence of a log line treated as proof that the hop did not run.
- A handoff chain that omits where it stopped and what it never covered.

## Definition of done

The chain names the entry point and the symptom, lists every executed call and
transformation in order, marks each boundary and side effect, and separates
links confirmed at runtime from links inferred by reading. The report states
where the trace stops and hands the localizable defect to the skill that owns
testing it.
