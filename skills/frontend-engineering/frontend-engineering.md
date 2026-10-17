---
name: frontend-engineering
description: "Implements and reviews application-side user interface behavior: component state, rendering decisions, event handling, forms and validation, loading and error states, data-fetch integration and the technical tests that pin them. Use when a change must behave correctly under real data, timing, retries and failure, or when debugging why the interface shows the wrong thing at the wrong time; visual and aesthetic direction is explicitly out of scope."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `follow-project-conventions`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Frontend Engineering

An interface is a state machine that people can see. Most frontend defects are not style
questions; they are disagreements about which value is authoritative, when a render
happens and what an event is allowed to change. This skill works at that layer: the
model behind the screen, the transitions between states and the actions that drive
them.

It is scoped to behavior. Palette, spacing, typography and motion treatment are design
decisions and stay outside this boundary; when a visual specification exists, this skill
consumes it as a fixed input and builds the behavior around it.

**Core rule:** every value the user can see must come from one declared source of truth,
and every user action must be traceable to the state transition it causes.

## When to use

Use when:

- State and rendering disagree: stale values, flicker, duplicated content, lost input.
- Events fire twice, not at all, or against values captured earlier than expected.
- A form needs validation timing, submit lifecycle, duplicate-submit protection or
  errors that land next to the field that caused them.
- A view must define loading, empty, error and success states before styling begins.
- A fetch needs cancellation, sequencing or retry behavior that survives navigation.
- Component behavior needs technical tests that assert observable outcomes instead of
  markup snapshots.

Do not use to:

- Write general application code that the interface only calls → `code`.
- Decide test strategy, coverage or determinism rules → `dad-always-say-the-same`.
- Strip generated filler from components and copy → `unslop`.
- Choose the look of the interface: palette, layout, type and motion treatment are
  inputs this skill consumes, never outputs it produces.
- Own accessible semantics or keyboard behavior; markup accessibility is a separate
  discipline whose constraints this skill leaves room for.

## Process

### 1. Map the state before touching the view

List every value the component reads and writes: owned state, props, server data,
derived values, form input and transient UI flags. Name one source of truth for each
and mark which are computed. A value stored twice with no reconciliation rule is the
root of most disagreement bugs.

### 2. Enumerate states, not just the happy path

For each view, define loading, empty, partial, error, retry, disabled and success. State
which one renders at first paint and what the user sees while work is pending. A state
nobody designed is a state that renders as a blank screen or a stale one.

### 3. Trace events through to transition

Follow each handler from binding to state change to render. Look for handlers bound
twice, listeners or subscriptions without cleanup, reads of state taken through stale
closures and updates queued after the component or route has already gone away.

### 4. Make forms survive pressure

Decide when validation runs (on blur, on submit, from the server) and where each error
attaches. Guard submission against duplicate in-flight requests, keep entered values
when a submission fails, and map server errors back to the fields they concern.

### 5. Own the fetch lifecycle

A response is only valid for the request and view that asked for it. Cancel or ignore
outdated requests, sequence refresh and pagination, and give optimistic updates an
explicit rollback path. Keep raw server shapes at the boundary and render from view
models instead.

### 6. Pin behavior with technical tests

Assert what a user can observe: which states render, which events fire, which payload
submits, how errors recover. Prefer queries that mirror how a person finds a control;
avoid tests coupled to internal flags or incidental markup structure.

### 7. Keep the change proportional

Repair the wrong state or transition instead of rewriting the component around it.
Match the project's existing patterns for state, fetching and forms; a local improvement
that ignores those patterns is not an improvement to the product.

## Interaction with other skills

- `code` — owns general implementation quality and non-interface logic; this skill narrows those expectations to state, events, forms and rendering behavior.
- `follow-project-conventions` — supplies the repository's component, state-management, fetching and test idioms that the change must mirror.
- `dad-always-say-the-same` — owns test design and determinism; this skill names the interface behaviors those tests must pin.
- `unslop` — removes generated filler from components and copy without altering the behavioral contract established here.
- `browser-engineering` — explains the runtime this skill builds against: rendering
  pipeline, event loop, workers, storage, permissions and sandboxing.
- `web-performance` — measures and improves the loading and responsiveness of the UI
  this skill builds.
- `accessibility-engineering` — semantic markup, keyboard navigation, focus management,
  ARIA and screen-reader behavior: the accessible layer of this work.

## Anti-patterns

- Two sources of truth for the same value with no rule for which one wins.
- Rendering directly from an unstable server payload instead of a view model.
- A response applied after the user navigated away or started a newer request.
- A submit handler with no in-flight guard, producing duplicate writes.
- Loading and error states improvised after the fact, or replaced by an empty screen.
- State updates that fire after unmount because cleanup was skipped.
- Tests that assert internal flags instead of what a user can observe.
- Following a visual mock while silently dropping behavior the mock did not show.

## Definition of done

Each visible value has one declared source of truth; every view renders defined loading,
empty, error and success states; events produce the intended transitions with no
duplicates or stale writes; fetch lifecycles cancel, sequence and recover; forms
validate visibly and cannot double-submit; the behavior is covered by technical tests
that pass; and no visual or aesthetic decision was made by this skill along the way.
