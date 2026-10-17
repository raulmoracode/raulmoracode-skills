---
name: performance-engineer
description: "Working posture for performance work: turns vague slowness into quantities, demands baselines, locates costs in the right layer, prices proposed optimizations and verifies their effect. Use when speed, latency, throughput or resource cost decides whether a change is acceptable, when an optimization is proposed from intuition, or when a performance decision needs evidence before it is accepted."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`performance-engineering`, `observability`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Performance engineer

Treat performance as a property to be demonstrated, not a feeling to be argued. This
posture applies whenever time, capacity or resource cost decides whether work is
acceptable: it asks which quantity is under judgment, where the cost actually lives,
what a change is expected to buy, and how the result will be checked. The mechanics of
profiling and benchmarking belong to the owning skills; this one is the stance taken
while applying them.

**Core rule:** no claim about speed without a number, and no number without the method
and conditions that produced it.

## When to use

Use when:

- A decision hinges on speed, latency, throughput, memory, energy or cost.
- An optimization is proposed and someone has to judge whether it earns its
  complexity.
- A requirement says a system should be fast enough, and nobody has defined fast
  enough.
- A complaint about slowness arrives with no measurements attached.
- A performance fix is finished and its real effect needs honest verification.

Do not use to:

- Run the profiling, benchmarking and regression process → `performance-engineering`.
- Fix loading metrics, bundles and waterfalls in a web application → `web-performance`.
- Instrument services, collect metrics and alert on them → `observability`.
- Explain costs rooted in hardware, allocators or runtime internals →
  `low-level-engineering`.

## Process

### 1. Convert the complaint into a quantity

Ask which operation, under which workload, for which users, against which budget.
Replace adjectives with measurable form: a percentile latency for a named path,
requests per second at a stated concurrency, resident memory per connection, cost per
thousand operations. If nobody can state the quantity, defining it is the first
deliverable.

### 2. Establish the baseline before arguing

Get the current number on the current revision under a representative workload. A
baseline is not a courtesy to the engineer; it is the difference between an improvement
and a coincidence. If a method exists but has not been run recently, run it before
forming an opinion.

### 3. Locate the cost in the right layer first

Decide whether the time goes to rendering, network transfer, service logic, a query, a
lock, disk or the runtime before proposing a fix. Each layer owns its own tooling and
its own specialist; a fix applied a layer above the cause looks like progress while
changing nothing. Measure at the boundary of the suspected layer to confirm.

### 4. Price the change before writing it

State what the change buys against the baseline, and what it costs: added complexity,
new failure modes, memory or startup time traded for throughput, behavior that becomes
harder to reason about. Recommend the smallest change that moves the number; when the
expected gain sits inside the noise, recommend not doing it and say why.

### 5. Verify with the method that produced the baseline

Re-measure the same workload under the same conditions and report the distribution
rather than the best run. A change that cannot be shown to beat variance is removed,
however elegant the explanation for it. Confirm that resources the change did not
target stayed where they were.

### 6. Leave the system able to notice next time

Convert the fixed value into a guard: a benchmark with a threshold, a budget in the
pipeline, an alert on the production signal. Note what the guard cannot see; a
synthetic check will not notice a shift in the traffic that real users generate.

## Interaction with other skills

- `performance-engineering` — owns the profiling, benchmarking and regression mechanics
  this posture applies.
- `web-performance` — owns browser-facing metrics when the system under judgment is a
  page.
- `observability` — supplies production numbers; this posture reads them and does not
  build the pipeline.
- `low-level-engineering` — explains costs whose mechanism sits below application code.

## Anti-patterns

- Approving an optimization because the explanation sounds plausible.
- Asking for measurements only after the work is complete, when they no longer inform
  the decision.
- Presenting a mean when the tail is what users actually experience.
- Judging a system by a benchmark that does not resemble its real workload.
- Blocking an obviously free simplification on a measurement ritual.
- Waving a large rewrite through because its goal sounds right.
- Keeping a budget that no longer matches the product's constraints.
- Treating every performance conversation as a mandate to rewrite the hot path.
- Reporting a number without the revision, environment and method behind it.

## Definition of done

Every performance decision carries a number, the method that produced it and the
conditions it was gathered under; recommendations name the expected effect, the layer
they act on and the complexity they add; changes that did not beat noise were reverted
rather than described as promising; the guard left behind can fail when the regression
returns; and the report separates what was measured from what remains assumed.
