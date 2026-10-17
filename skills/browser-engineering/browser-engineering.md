---
name: browser-engineering
description: "Explains and works with browser runtime behavior: the DOM, the event loop and task scheduling, the rendering pipeline, browser APIs, workers, storage, networking, permissions and sandboxing. Use when behavior depends on the platform itself, such as callback ordering, layout invalidation, quota eviction, lifecycle restoration or origin rules, rather than on application logic; the engine's observable behavior, not folklore, is the source of truth."
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

# Browser Engineering

A browser is not a passive host for code. It is a runtime with its own scheduler, its
own rendering pipeline and its own rules about identity, durability and trust. Defects
that look like application logic often resolve to platform mechanics: work queued
behind a long task, layout invalidated inside a loop, state evicted under storage
pressure, a request stopped at an origin boundary.

This skill builds an accurate model of that runtime and then designs the smallest
experiment that can confirm it. It sits downstream of the product code and upstream of
the fix: first explain what the engine actually did, then decide what the application
should do about it.

**Core rule:** explain browser behavior through a mechanism a minimal experiment can
confirm, never through remembered slogans or framework assumptions.

## When to use

Use when:

- Callback ordering surprises: tasks, microtasks, timers, animation frames, worker
  messages.
- Rendering work lands late or repeats: forced synchronous layout, invalidation loops,
  compositing surprises, frames that start late.
- Events reach unexpected targets, or nodes lose identity across moves and re-parenting.
- Page lifecycle matters: visibility changes, the back-forward cache, termination,
  memory-pressure eviction.
- Storage behaves inconsistently: quotas, eviction, partitioning, private browsing,
  cross-tab state.
- A platform API rejects, stalls or demands context: secure origins, user gestures,
  permission prompts, cross-origin requests.
- Worker, offline or background behavior is part of the feature.

Do not use to:

- Repair application state, event handlers or forms that misbehave → `frontend-engineering`.
- Run a root-cause debugging session with no platform-specific question → `debug-properly`.
- Retrieve exact signatures, defaults, flags or compatibility data for an API → `read-the-f-docs`.
- Survey an unfamiliar codebase or environment when no runtime question has been asked
  yet → `understand-before-acting`.

## Process

### 1. Pin the platform precisely

Record browser, version, engine, operating system, device class and any extension or
profile setting involved, and check whether the behavior reproduces in a clean profile.
A mechanism observed on one engine is a hypothesis for the others, not a law.

### 2. Name the layer before judging the symptom

Decide which layer can produce the behavior: application code, framework runtime,
build-time transform, polyfill, browser API, engine internals, operating system or
network. Write down what each alternative would look like; a fix applied one layer off
hides the real cause.

### 3. Place work on the event loop

Locate every callback in the queue where it actually runs: task, microtask, animation
frame, idle period, timer or message from another context. The ordering between a
promise continuation and a timer is observable, so verify with timestamps instead of
reasoning from framework abstractions.

### 4. Follow the rendering pipeline

Trace style, layout, paint and composite for the frame in question. Identify what forces
synchronous layout, what invalidates layers and which properties change without
relayout. Separate a frame that started late from work that took too long inside it.

### 5. Track where state actually lives

Enumerate the real stores: memory, session storage, local storage, IndexedDB, cache
storage, cookies, the service worker, the server. For each, know its quota, eviction
rule, partitioning scope and what clears it. Verify what survives reloads, restores and
privacy modes instead of assuming persistence.

### 6. Respect the boundaries the platform enforces

Secure context, user-gesture requirements, permission state, cross-origin isolation,
CORS and cookie rules decide whether a call may run at all. A call rejected by policy is
behaving correctly; the design, not the call, has the problem.

### 7. Confirm the mechanism with a minimal experiment

Reduce the case to the smallest page or snippet that still shows the behavior, then
instrument it with timestamps, performance marks or an observer. Confirm the mechanism
before proposing a fix, retest the fix on every engine the project supports, and label
as unverified any explanation that never reproduced.

## Interaction with other skills

- `understand-before-acting` — establishes the code, versions and environment context the runtime question is asked against.
- `debug-properly` — owns the root-cause loop; this skill contributes the platform model and the experiment that separates competing causes.
- `frontend-engineering` — owns application state, events and forms; this skill owns what the engine does with them once they reach the platform.
- `read-the-f-docs` — resolves documented behavior, defaults and compatibility when the question is about a specification rather than an observation.
- `web-performance` — uses the loading and rendering behavior this skill explains to
  reduce page weight and delay.

## Anti-patterns

- Explaining a symptom with an unverified story about how browsers supposedly behave.
- Generalizing one engine's behavior into a standard that other engines must share.
- Papering over scheduling or storage problems with arbitrary delays.
- Measuring layout inside a loop, then blaming the framework for the resulting stutter.
- Treating a permission rejection or blocked cross-origin request as a code defect.
- Assuming stored data is durable, unlimited or shared across private windows and
  partitions.
- Reloading or persisting through lifecycle events the platform is allowed to skip.
- Shipping a platform workaround without recording the engine and version that needed
  it.

## Definition of done

The platform and reproduction are pinned; the responsible layer is identified with the
alternatives explicitly excluded; scheduling, rendering, persistence and boundary rules
are described in engine terms; a minimal experiment confirms the mechanism and the fix
on every engine the project supports; and the record states versions, observations and
any behavior that remains unverified.
