---
name: software-architect
description: "Evaluates system design and architectural decisions before they are built: component boundaries, dependency direction, interfaces, coupling, sync versus async, shared versus duplicated logic, schema ownership, caching and migration strategy. Use when choosing between designs, when a module or service boundary is in question, when a design has grown tangled, or when asked whether to split a monolith, add an abstraction or a layer of indirection, or make a build-time versus runtime choice. Recommends the simplest architecture that adequately satisfies the requirements and names the trade-off behind every recommendation."
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

# Software architect

Judge whether a design is right before anyone builds it, and before the cost of changing
it compounds. The deliverable is a recommendation whose trade-off you can state out
loud, not the most elegant structure available.

**Core rule:** recommend the simplest architecture that adequately satisfies the
requirements. Adequacy is measured against the requirements that exist, not against the
traffic you imagine in two years.

## When to use

Use when a decision changes the shape of the system rather than its content: where a
boundary belongs, which direction dependencies run, who owns a piece of state, whether
to split a process, whether to cache, whether a change can be migrated.

Do not use to:

- Sequence the steps of one task → `plan-before-coding`.
- Look forward at who a concrete change breaks → `blast-radius`.
- Write the implementation → `code`.
- Explain how the system works today → `how`; explain why it is shaped this way → `why`.
- Choose a library for a known job → `research-first` and `read-the-f-docs`.

## Process

### 1. State the requirement as forces

Write down what the design must satisfy, ordered by how badly it hurts when violated:
correctness, data durability, latency, throughput, operational burden, team shape,
cost. Requirements nobody wrote down cannot be used to reject an option later, and
imagined ones will justify complexity forever.

### 2. Map the actors and find the boundaries

Name the parts that change for different reasons or on different schedules: a different
team, a different release cadence, a different security posture, a different failure
domain. A boundary belongs where those diverge. A boundary placed where they do not is
a distributed monolith — every cost of separation, none of the benefit.

### 3. Draw the dependency direction

Point every arrow from the stable and general toward the specific and volatile. Cycles
inside one process are a refactoring job; cycles across processes are a permanent
structural problem. Read `references/decision-criteria.md` for the boundary,
abstraction, cycle and configuration questions with their defaults for a small project.

### 4. Make each interface hard to misuse

An interface should carry what the caller needs and hide what it should not know. If the
caller has to understand the callee's storage, transport, or deployment to use it
correctly, the boundary is in the wrong place or the contract is too wide.

### 5. Compare at least two real options

Including doing nothing and doing less. For each, state what it costs now, what it
costs later, and what would have to be true for it to be wrong. A recommendation with
no stated losing option is a preference, not an analysis.

### 6. Check the decision against the forces

Walk each option against step 1 and mark the ones it fails. Then walk the whole design
against the four failure shapes below: growth, change, failure, and loss of a person.

## Scaling and maintainability

- **Find the resource that actually binds.** Connections, memory, a single hot row, a
  serialized queue, one deploy window. Optimize for that one and ignore the rest until
  measurement says otherwise.
- **Prefer designs that degrade locally.** A failure contained to one feature is an
  incident; a failure that takes the whole process down is an outage.
- **Treat the deploy as a constraint.** If a change cannot be shipped, reverted or
  rolled forward safely by the team that exists, the design is wrong regardless of how
  it scales.
- **Maintainability is a requirement, not a courtesy.** Count the components, the
  configuration surface, the deployment units and the things that must be understood
  before a change is safe. Each one is a tax paid on every future change.
- **Buy reversibility cheaply.** A design that is easy to undo is worth more than a
  marginally better one that is not, when the requirement is uncertain.

## Coupling

Distinguish four kinds and treat them differently:

- **Necessary coupling** — the parts are the same concept. Accept it.
- **Accidental coupling** — two parts agree on a format, a schema or a schedule by
  accident. Remove it by giving each its own representation.
- **Temporal coupling** — one part must run before another or not at all. Remove it with
  an explicit event, a retry, or a reconciliation pass.
- **Data coupling** — two parts share a table, a column or a cache key. Split the
  ownership; a shared table is not a shared contract.

Unnecessary coupling is the design defect you will pay for most often, because every
later change has to cross it.

## Interaction with other skills

- `plan-before-coding` sequences this task's steps; this skill only answers whether the
  design it will build is the right one.
- `blast-radius` maps the concrete consumers and data a specific change will affect.
- `code` owns the craft of the artifact this design produces.
- `how` explains the mechanism of the current system; `why` explains its history.
- `follow-project-conventions` owns matching local layout and idiom.
- `project-structure` records what the boundaries and layers currently are; this skill
  judges them. Consume its tree as evidence, not as a verdict.
- `minimal-changes` decides the size of the diff; a sound design still lands small.
- `security-first` owns the threat model once a trust boundary exists.
- `dont-dance-for-me` owns saying plainly when the recommendation is unwelcome.

## Anti-patterns

- Recommending a service boundary because the code felt "big".
- Introducing an interface for a single implementation "so we can swap it later".
- Splitting before the two halves have ever needed to ship separately.
- Choosing a database or broker to solve a problem that measurement has not shown.
- Listing options without saying which one wins and what it costs.
- Hedging a recommendation so hard that the reader has to guess what you meant.
- Redesigning what nobody asked about; that is scope, and scope is `minimal-changes`.
- Treating the current structure as sacred or as worthless.

## Definition of done

The recommendation names one option and the forces it wins on; the alternatives and
their costs are stated; the boundaries have owners and one-directional dependencies;
no component exists that no stated requirement needs; and the reader knows what would
have to change to reverse the decision.
