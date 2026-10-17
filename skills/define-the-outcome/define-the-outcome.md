---
name: define-the-outcome
description: "Turns an ambiguous request into a precise outcome before implementation begins: states what will be true, how failure will appear, the constraints that bound the solution, and the observable evidence that will prove success. Use when a request describes activity rather than a result, when scope is drifting, when multiple interpretations are plausible, or when a task needs measurable acceptance criteria before planning or coding."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-1
max-depth: 1
supports: [`understand-before-acting`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Define the outcome

An implementation request is not yet a useful target. "Add an endpoint", "clean up
the module", or "make it faster" names an activity, not the state the user needs.
Define the smallest observable result that would make the request successful, then let
the implementation follow from that result.

**Core rule:** describe the changed reality before describing the work. If success
cannot be observed and failure cannot be recognized, the outcome is not defined yet.

## When to use

Use when:

- The request names a solution or activity but not the user-visible result.
- Several reasonable interpretations would produce different changes.
- Scope is expanding because nobody has stated what is out of scope.
- A feature, fix, migration or refactor needs acceptance criteria before work starts.
- A review or handoff needs a shared statement of what "done" means.

Do not use to:

- Inspect the repository or establish its conventions → `understand-before-acting`.
- Order implementation steps and dependencies → `plan-before-coding`.
- Choose between architectural designs → `software-architect`.
- Predict downstream breakage from a concrete change → `blast-radius`.
- Decide which tests to write or execute → `dad-always-say-the-same` and
  `test-before-finishing`.

## Process

### 1. State the desired reality

Write one sentence in the form:

> When [actor or trigger] occurs, [observable behavior or state] is true, so [user
> or system value] is achieved.

Prefer a result over a mechanism. "A user can recover an expired session without
losing unsaved work" is an outcome; "add refresh tokens" is one possible approach.
Name the actor, trigger, affected surface and meaningful benefit when they are known.

### 2. Write the failure sentence

State how the outcome would visibly fail. Include the boundary that matters:

- What remains broken or unavailable?
- Which wrong behavior would still count as failure?
- What must not regress while the change is made?

If the failure sentence is vague, the request still contains an unresolved decision.
Do not hide that uncertainty inside implementation tasks.

### 3. Bound the outcome

Record only constraints that change the solution:

- Interfaces, formats, runtimes or compatibility promises that must remain stable.
- Data, security, latency, cost or availability limits that cannot be traded away.
- Explicit exclusions: adjacent improvements that are not required for this outcome.

Separate confirmed constraints from assumptions. An assumption that could change the
implementation belongs in the unknowns, not in the acceptance criteria.

### 4. Turn success into evidence

Create a short set of observable checks. Each check should name a behavior, threshold
or artifact and how it will be inspected:

- A test or command proves the normal path.
- A focused check proves the stated boundary or failure behavior.
- A compatibility, migration or documentation check proves any stated constraint.

Do not prescribe tests merely because they are familiar. Choose evidence that could
distinguish the intended result from a plausible but incomplete implementation.

### 5. Cut and hand off

Remove work that does not contribute to the outcome or protect a named constraint.
List unresolved questions only when their answers would change the outcome; otherwise
make the smallest reasonable assumption explicit. Hand the result to
`plan-before-coding` for sequencing, or to the more specific owner when the next step
is already clear.

## Outcome template

Use this compact handoff:

```text
Outcome: When [trigger], [observable result] so [value].
Failure: It fails if [specific wrong behavior or unmet boundary].
Constraints: [compatibility, data, security, performance, scope limits].
Evidence:
- [observable check and how it will be inspected]
- [observable boundary or regression check]
Unknowns: [only decisions that could change the outcome]
```

Keep the template short. If the outcome needs a long explanation, separate the
essential contract from context and rationale so the implementation target remains
easy to find.

## Interaction with other skills

- `raulmoracode-mode` — routes ambiguous work here before a specialist is selected.
- `understand-before-acting` — supplies repository facts; this skill does not replace
  reading local instructions, code or current state.
- `plan-before-coding` — turns the defined outcome, constraints and evidence into
  ordered implementation steps.
- `software-architect` — evaluates design choices when the outcome admits multiple
  system shapes.
- `blast-radius` — evaluates who and what a concrete solution may affect.
- `dad-always-say-the-same` — owns test design once the outcome identifies the behavior
  that must be proved.
- `test-before-finishing` — runs the selected checks before the result is claimed.
- `minimal-changes` — keeps the implementation proportional to the defined outcome.
- `project-manager` — organizes objectives, priorities, dependencies and blockers around
  the outcome this skill defines.

## Anti-patterns

- Repeating the request as an outcome without naming a changed behavior.
- Treating a preferred implementation as the requirement.
- Calling "no errors" success without defining the expected result.
- Listing every imaginable constraint and making the outcome impossible to act on.
- Turning unknowns into silent assumptions because they are inconvenient.
- Adding adjacent improvements that have no connection to the outcome.
- Writing acceptance criteria that cannot be observed, reproduced or checked.
- Letting a plan invent new goals after the outcome has already bounded the work.

## Definition of done

The outcome names an observable changed reality and its value; failure names a concrete
wrong result; constraints distinguish requirements from assumptions; evidence can prove
success and the important boundary; scope is explicit; and the handoff identifies the
next owning skill without duplicating its instructions.
