---
name: compare-environments
description: "Compares local, CI, staging and production environments across tool and dependency versions, configuration, permissions, resource limits and starting state. Use when the same revision behaves differently across environments, when a build, test or deploy works locally and fails elsewhere, or before attributing a works-locally failure to the code."
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

# Compare environments

A passing run on one machine and a failing run on another are not two
observations about the code; they are one observation about a difference
between two environments. The difference is usually findable, but only if it is
hunted with the same commands on both sides — manifests, documentation and
memory describe intended state, not the state that executed.

This utility builds a structured comparison of the environments in scope, and
then reduces the difference list until one variable explains the symptom or the
residue is listed as unchecked. It is evidence gathering, not repair: the
skills that own configuration and platform work act on what it finds.

**Core rule:** compare environments by running the same commands in each one; a
written or remembered value is a claim about an environment, never evidence of
it.

## When to use

Use when:

- The same revision behaves differently across local, CI, staging or production.
- A build, test, migration or deploy fails in one environment and passes in
  another.
- A toolchain, runtime or dependency version is suspected of drifting.
- Behavior depends on locale, time zone, architecture, filesystem or network
  reach.
- Configuration, flags or feature toggles are suspected of differing.
- An incident review needs to know what was different about the machine or
  image involved.

Do not use to:

- Design or validate configuration sources, precedence and defaults →
  `configuration-management`.
- Reconstruct the timeline of what changed most recently →
  `how-was-last-night`.
- Form and test a root-cause hypothesis about application code →
  `debug-properly`.
- Decide which production signals to record or alert on → `observability`.
- Provision, pin or repair runners and developer tooling → `platform-engineer`.

## Process

### 1. Name the environments and the difference

Identify each environment well enough to reproduce a comparison: machine and OS
build, container image digest, runner label, cluster and node pool, service
revision. Record the observable difference with a concrete value — the failing
command, its output, the moment it happened. Compare two environments at a
time; a global diff against production adds noise without attribution.

### 2. Capture versions by running commands

In every environment run the same version commands: kernel and OS, CPU
architecture, language runtime, package manager, resolved dependency tree,
compiler and toolchain, container base image, client or browser. Lockfiles
describe intent where they apply; installed artifacts are the fact. Run the
commands on the remote side too — the local checkout says nothing about CI.

### 3. Diff configuration and defaults

Compare environment variable names and presence first, then values with secrets
redacted. Continue with config file resolution order, feature flags, defaults
that apply only when a variable is absent, working directory assumptions,
locale and time zone, path separators and filename case sensitivity. A variable
missing on one side and silently defaulted on the other is a difference even
when both environments appear configured.

### 4. Compare permissions and limits

Check capabilities rather than contents: what the process may read, write,
mount or reach over the network, DNS and proxy behavior, service account
scopes, database grants, container capabilities, CPU, memory and file
descriptor limits, whether it runs as root. The same binary under different
permissions fails differently, and these differences rarely appear in any
manifest.

### 5. Compare starting state

Databases, caches, queues, mounted volumes and local directories differ between
environments: schema version, seed data, row counts, clock skew, warm caches,
leftover build output, half-applied migrations. Record what each side starts
from before the failing command runs. An environment called fresh is an
assumption until its state is checked.

### 6. Reduce to one variable and reproduce

When the diff list is long, isolate the smallest difference that reproduces the
symptom: change, unset or emulate one variable at a time and rerun the same
command. Report the comparison as a table of dimension against environment,
marking which side matches the failing behavior, and list what remains
unchecked. Hand the reduced reproduction to `debug-properly` when application
code is still the suspect.

## Interaction with other skills

- `configuration-management` — owns how values are declared, defaulted and
  resolved; this utility reports the effective differences between running
  environments.
- `platform-engineer` — owns runner, tool and platform consistency; this
  utility supplies the drift evidence those decisions rest on.
- `observability` — owns production signals; this utility explains whether a
  signal difference comes from the environment or from the code.
- `debug-properly` — owns root-cause investigation once the environment
  differences are reduced.
- `how-was-last-night` — reconstructs recent change history; this utility
  compares the environments that history produced.

## Anti-patterns

- Comparing manifests or lockfiles instead of running version commands on each
  side.
- Treating documented or remembered environment state as the actual state.
- Printing secret values to compare them instead of comparing whether they are
  set.
- Ignoring limits and permissions because the application code is identical.
- Comparing one pair of environments and generalizing the result to the others.
- Blaming the environment without tying a difference to the reproduced symptom.
- Changing several suspected variables at once and losing the attribution.
- Emulating a remote environment locally and presenting the emulation as remote.

## Definition of done

The comparison names each environment in scope, records tool, dependency,
configuration, permission and state differences using the same commands on
every side, compares secrets only for presence, and either isolates the
smallest difference that reproduces the symptom or states honestly what remains
unchecked. Each remaining difference is reported with what it could affect, so
the owning skill can act on it.
