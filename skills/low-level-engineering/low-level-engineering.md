---
name: low-level-engineering
description: "Investigates how software actually executes through memory layout, CPU and GPU behavior, ABIs, assembly, compilers, loaders, runtimes and operating systems. Use when a crash, stall, linking failure, miscompilation or cross-platform difference cannot be explained from application source: faults and memory corruption, costs below the profiler frames, optimization that never lands, syscall and scheduler effects, GC or JIT pauses, driver and device behavior. Produces a mechanism-level account backed by counters, disassembly or a discriminating experiment, and labels what remains unproven."
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

# Low-level engineering

Application source describes intent; what runs is a compiled or interpreted form of it,
on one specific machine, ABI, kernel and driver. When observed behavior diverges from
the source-level model, the explanation lives one or more layers down: in an instruction
sequence, an allocation, a call convention, a syscall, a scheduler decision or a device
transfer.

This skill is the descent: it takes a symptom that survived source-level reasoning and
follows it to the mechanism producing it, with a measurement at every step.

**Core rule:** descend to the layer that actually produces the observed behavior, and
prove the explanation with a measurement rather than with plausibility.

## When to use

Use when:

- Crashes and memory faults: segmentation faults, misaligned access, stack exhaustion,
  heap corruption, use-after-free, double free, buffer overrun, sanitizer findings.
- Costs the profiler cannot attribute to application code: branch and cache misses,
  false sharing, page faults, context switches, syscall storms, GC or JIT pauses, GPU
  occupancy and transfer overhead.
- Behavior that changes across architectures, compilers, optimization levels, libc,
  kernel, driver, endianness or word size.
- ABI and linkage work: name mangling, calling conventions, struct layout and alignment,
  vtable layout, versioned symbols, load-time failures.
- Verifying what a build actually emitted: whether an expected optimization landed, and
  what the generated code does with the values it was given.
- Runtime and OS interaction: signals, memory mapping, thread affinity, cgroup limits,
  NUMA placement, container runtimes.
- GPU diagnosis: kernel occupancy, memory coalescing, shader compilation, host-device
  synchronization, driver scheduling.

Do not use to:

- Diagnose a defect whose cause is not yet known → `debug-properly`.
- Explain source-level flow and responsibilities for a reader → `how`.
- Confirm a compiler flag or kernel option from memory → `read-the-f-docs`.
- Gather repository context and constraints before a change →
  `understand-before-acting`.

## Process

### 1. Exclude the mundane explanation first

State what the application-level model predicts and test that prediction cheaply. Many
so-called low-level symptoms have ordinary causes: an unbounded loop, a lock held across
IO, a retry storm, a payload larger than the endpoint allows. Descent is justified once
the dull alternatives are eliminated with evidence, and the eliminations are worth
recording alongside the finding.

### 2. Observe the running process, not the code

Collect from the artifact that actually executed: a core dump with symbols, stack traces
resolved to frames, hardware counters, event logs. Attach with the platform's own tools
— a sampling profiler, a syscall tracer, a sanitizer, a heap profiler, GC or JIT
diagnostics, an on-CPU and off-CPU profile. Predicting cost from source is a hypothesis
source here, never the result.

### 3. Read what the toolchain generated

Inspect disassembly or intermediate representation at the same optimization level and
flag set as production: inlining decisions, vector width and alignment, bounds-check
elimination, branch layout, atomic fences, structure padding. Restate the question as a
minimal reproduction built with identical flags, so the build difference is the only
variable left.

### 4. Check the ABI and the memory contract

- Calling convention and return-value handling across a foreign-function or plugin
  boundary.
- Struct size, alignment, padding and packing; which ABI is stable between library
  versions and which is not.
- Ownership and lifetime: who allocates, who frees, which aliasing the optimizer is
  permitted to assume.
- Memory model: acquire and release pairs, fences, torn reads, data races, and the
  places where undefined behavior lets one build differ from the next.
- Allocator behavior: alignment guarantees, fragmentation, relocation effects in a
  moving collector.

### 5. Follow the question to the system boundary

Dynamic linking and symbol resolution, syscall latency and error paths, page faults,
scheduling and priority, cgroup and NUMA limits, the IO path, kernel version and
configuration, GPU driver and firmware. When the mechanism requires the kernel or the
device, say so and capture the exact versions involved.

### 6. Design the discriminating experiment

Change one variable and hold the rest still: optimization level, target architecture,
allocator, a kernel parameter, affinity, or one replacement in the input. State the
prediction the proposed mechanism makes before running it. If the run contradicts it,
the mechanism is not established, however neatly it explained the original symptom.

### 7. Write the mechanism with its scope

One paragraph: the mechanism, the measurement that showed it, the versions that bound
it — toolchain and flags, runtime, libc, kernel, driver, CPU or GPU model — and the
alternatives already eliminated. Anything past that evidence is a hypothesis, written
with the probe that would confirm it.

## Interaction with other skills

- `debug-properly` — owns the diagnosis and fix loop for a defect; this skill supplies
  the machine-level mechanism when source-level hypotheses run out.
- `understand-before-acting` — reads the build wiring and constraints the investigation
  depends on; a probe run against the wrong configuration proves nothing.
- `how` — explains the system at source level; this skill continues below it into
  instructions, memory, scheduling and the runtime.
- `read-the-f-docs` — owns version-specific documentation for compilers, runtimes,
  kernels and drivers; a flag semantic recalled from memory is not evidence.
- `low-level-engineer` — the working posture that applies this skill: systems-level
  reasoning about memory, CPU, GPU, ABI, compilers, runtimes and operating systems.

## Anti-patterns

- Inferring machine behavior from source and presenting the inference as the mechanism.
- Profiling a debug build and generalizing the numbers to a production release.
- Reading optimized disassembly without matching symbols, then crediting the wrong line.
- Blaming the GC, the cache or the scheduler without a counter that shows it.
- Assuming one architecture, endianness or word size and reporting the result as general.
- Relying on undefined behavior, then treating a different build result as a compiler bug.
- Benchmarks whose loop body resembles the real workload only in name.
- Changing several flags or kernel parameters at once, then crediting the one hoped for.
- Stopping at plausible: shipping a mechanism story whose discriminating test never ran.

## Definition of done

The observed behavior is tied to one named mechanism — an instruction sequence,
allocation pattern, syscall, scheduling effect or driver behavior — and a discriminating
measurement supports it; earlier and cheaper explanations were ruled out with evidence;
the toolchain, flags, runtime, kernel, driver and hardware versions that bound the
finding are recorded; and everything past the evidence is labeled unproven with the
probe that would close it.
