---
name: performance-engineering
description: "Measures and improves application performance using profiles, benchmarks, resource analysis and regression checks. Use when something is slow, CPU-bound, memory-heavy or throughput-limited, when a change claims a speedup, when a benchmark or profile has to be designed or interpreted, or when a performance regression must be caught before release."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`observability`, `debug-properly`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Performance Engineering

Performance work begins with a quantity, not an opinion. This skill covers the general
practice of improving how software spends time and resources: choosing a metric that
matches the user experience, building a workload that resembles production, profiling
until the dominant cost is located, and proving a change moved the number without
moving something else.

The approach covers services, batch jobs and long-running processes; browser surfaces
have narrower metrics, but the same discipline transfers: measure, compare, then guard.

**Core rule:** measure before and after, optimize the bottleneck the measurement finds,
and keep only changes whose effect survives the noise.

## When to use

Use when:

- A task reports slowness, high latency, low throughput, memory pressure, CPU burn or
  rising cost, with or without numbers attached.
- A change claims to improve performance and needs an honest before-and-after.
- A benchmark, load test or profile has to be designed, run or interpreted.
- A hot path, allocation pattern, lock or query plan is suspected but unproven.
- A performance regression must be caught before release or detected in a pipeline.

Do not use to:

- Diagnose a failure whose cause is unknown → `debug-properly`.
- Explain hardware, allocator, compiler or runtime mechanisms behind a cost →
  `low-level-engineering`.
- Tune schemas, indexes, query plans or transaction scope → `database-engineering`.
- Build metrics, traces, dashboards and alerts → `observability`.
- Read a repository and its conventions before touching it → `understand-before-acting`.

## Process

### 1. Turn the complaint into a quantity

Name the operation, the workload, the audience and the resource being judged. Slow
becomes p95 latency of a named request at a stated concurrency, or the wall time of one
batch stage at a stated input size. Record the budget that makes the effort worthwhile
and what the user pays while it is met — time, memory, energy or money.

State what is excluded: cold versus warm runs, cache state, debug builds, debuggers,
other load on the machine. Unstated conditions are how a measurement turns into a story.

### 2. Collect a baseline worth trusting

Run the workload at its real size, concurrency and input distribution. Keep the
revision, build flags, machine or instance type, runtime version and configuration with
the numbers. Repeat runs and report a distribution: medians describe typical behavior,
and the tail — p95 or p99 — is usually the experience that produced the complaint. If a
five percent delta sits inside a twenty percent spread, there is no result yet.

When the system cannot be measured directly, say so and measure the closest honest
substitute. Never invent a baseline or compare numbers from incomparable conditions.

### 3. Find where the cost actually lives

Profile with tools that sample reality: a CPU profiler for time, allocation or heap
profiling for memory, blocking and event-loop inspection for waiting, I/O accounting
for external cost. Read flame graphs by width rather than depth, because the wide
frames are where the time went even when the interesting code lies deeper.

Do the arithmetic first: the step that owns most of the time is the candidate, and
doubling the speed of a five percent step disappears into noise. Determine whether the
cost is saturation, contention, dependency latency or repeated wasted work.

### 4. State a hypothesis that can fail

Write the predicted effect before editing: which resource, which operation, the
expected delta and the mechanism linking the change to the number. Removing a duplicate
parse from a request path should cut its CPU by roughly the share that step owns; that
is a hypothesis. Something should feel faster is a wish.

If the prediction misses, the model is wrong. Return to the profile instead of stacking
another change on an unexplained result.

### 5. Change one variable and verify with the same harness

Keep workload, environment and build flags identical to the baseline so the delta
isolates the change. Re-measure and compare distributions, not only means, then check
the resources the change did not target: speed bought with memory, startup time, energy
or another endpoint's latency is a trade, not a win.

If the effect is inside the noise, remove the change. Complexity no measurement
justifies is a recurring cost, not an optimization.

### 6. Guard the result

Turn the number into something that can fail later: a benchmark with a tolerance
threshold, a budget check in the pipeline, an alert on the production signal. Timing
checks on shared infrastructure are noisy, so set thresholds where a real regression
trips them and ordinary variance does not.

Store the harness, the workload description and the profile next to the change so the
next investigation starts from evidence rather than rebuilding the setup.

## Interaction with other skills

- `observability` — supplies production metrics and traces; this skill reads them but
  does not design the instrumentation.
- `debug-properly` — owns hypothesis testing when the symptom is incorrect behavior
  rather than resource consumption.
- `low-level-engineering` — explains costs that originate in hardware, allocators,
  runtime scheduling or compiler output.
- `database-engineering` — owns query plans, index design and transaction behavior,
  which the profile may flag as the dominant cost.
- `understand-before-acting` — gathers the build, run and convention context that
  makes a benchmark valid.
- `web-performance` — the web-specific measurement surface: Core Web Vitals, bundle
  size, loading order, caching and network waterfalls.
- `performance-engineer` — the working posture that applies this skill: measurement,
  profiling, benchmarks and regression discipline.

## Anti-patterns

- Optimizing the code that is easy to change instead of the code the profile flagged.
- Quoting one run, or a mean of two runs, as if the number were reproducible.
- Reducing the workload until it no longer represents the traffic that matters.
- Adding a cache, thread pool or batching layer before its hit rate and contention are
  measured.
- Comparing timings gathered on different revisions, machines or input sizes and
  calling it a delta.
- Keeping an optimization after a later change removed the bottleneck it addressed.
- Timing work shorter than the timer resolution or the noise floor of the machine.
- Trading correctness, memory growth or maintainability for an unverified gain.

## Definition of done

The bottleneck is identified by measurement, not suspicion; baseline and result share
one workload, revision and environment; the gain exceeds measured noise; resources
traded away were checked; a guard exists where future regressions are plausible; and
the report states what was measured, how, and what remains unproven.
