---
name: configuration-management
description: "Manages how an application declares, defaults, validates and overrides its configuration across environments. Use when adding or renaming a config key or environment variable, choosing defaults, resolving precedence between file, environment, flag and secret sources, referencing credentials without committing them, or diagnosing a value that differs between local, CI and production; makes every effective value explainable and fails loudly when one is missing or malformed."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `security-first`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Configuration management

Configuration is the interface between one build artifact and every environment it
runs in. When it is implicit, the same artifact behaves differently in two places for
reasons nobody can name, and the difference is discovered under pressure. This skill
makes the sources, defaults, precedence and validation of configuration explicit
enough that any effective value can be explained on demand.

**Core rule:** a running system must be able to say where each effective value came
from, why it won, and what happens when it is missing or malformed.

## When to use

Use when:

- A setting, flag or environment variable is introduced, renamed or retired.
- Defaults, allowed ranges or accepted formats must be chosen for a value.
- Several sources can supply the same value and precedence is implicit.
- Local, CI and production runs disagree about a value nobody changed.
- A credential must reach the process without entering the repository.
- Onboarding or deployment asks which keys are required and who owns them.

Do not use to:

- Choose credential storage or threat-model secret access → `security-first`.
- Shape the pipeline stages and promotion order that inject values → `ci-cd`.
- Reconcile the docs, examples and comments that describe keys → `mom-always-say-the-same`.
- Design runtime logging, metrics or alerts → `observability`.

## Process

### 1. Inventory every source the loader reads

List them for real: compiled defaults, files such as `.env`, YAML, JSON, TOML or INI,
environment variables, CLI flags, secret managers, platform-injected values, database
rows. Note which sources exist only in some environments. A source the loader reads is
a source whether or not anyone documented it, and a file that is gitignored is still
part of the contract on the machines that have it.

### 2. Name, type and document each value

For every key record: name, environment variable spelling, type, unit, allowed range or
set, whether it is required, its default, and the file that documents it. Treat the
name as a shipped interface — a rename breaks every deployment script, dashboard and
runbook that sets it — so prefer adding a new key beside a deprecated one over
repurposing it.

### 3. Write precedence down as a rule

Order the sources and encode the order in the loader, not in someone's recollection:
typically flag over environment over file over compiled default. Make resolution
deterministic and identical across environments, and never let a fallback quietly mask
a malformed higher-priority value. When the loader logs which sources it consulted,
log names and outcomes, not secret contents.

### 4. Choose defaults that are safe with nobody watching

A default is a decision made on the operator's behalf, so pick one that is safe at
worst: no wildcard origins, no debug mode, no skipped verification, no empty credential
accepted, no unbounded timeout or size. Values that cannot be defaulted sensibly are
required and have no default. A wrong-but-plausible default is the failure this step
exists to prevent.

### 5. Validate at startup, fail fast and loud

Check presence, type, range, format and cross-field consistency before the process
serves traffic. Report every invalid value in one message, naming the key and the
reason, and refuse to start while something required is missing or malformed. Do not
coerce a surprising string into a plausible one, and do not defer validation to the
first request that needs the value.

### 6. Reference secrets without embedding them

Supply credentials through the environment or a secret manager, addressed by key or
path. Never commit a value, bake one into an image or build argument, or let one appear
in an error, a log line or a debug dump. Keep an example file whose placeholders are
obviously fake, and remember that where a value is read from is a configuration
decision while the standard for handling it belongs to `security-first`.

### 7. Make the effective configuration inspectable

Expose what is actually in force: a startup summary of keys and their winning sources,
a diagnostic command, or a protected endpoint. When a value surprises someone, the
first question is which source won, and the answer must be obtainable without
redeploying. Redact secret values by construction rather than by remembering to.

### 8. Test resolution and compare environments

Cover the default path, each source winning, precedence with several sources present,
malformed input rejected, and missing required values failing. Then compare what local,
CI and production resolve — drift between two environments with identical artifacts is
the symptom this skill exists to eliminate.

## Interaction with other skills

- `security-first` — owns credential handling and access decisions; this skill only
  names where a value is read from and how it is validated.
- `ci-cd` — owns pipeline injection and promotion order; this skill defines what an
  injected value means once it arrives.
- `mom-always-say-the-same` — keeps the docs, examples and comments that describe keys
  true when a key changes.
- `observability` — turns configuration state and failures into signals without
  exposing secret values.
- `platform-engineer` — the working posture that applies this skill across environments,
  tooling and developer infrastructure.
- `compare-environments` — diffs local, CI, staging and production versions,
  configuration and permissions to locate drift.

## Anti-patterns

- One value spelled three ways across three environments, with no owner.
- Defaults that enable debug output, accept any origin or skip TLS checks.
- Reading configuration per request so a change applies to part of the traffic.
- Falling back quietly when a variable is empty or malformed.
- Printing the whole configuration at startup to prove it loaded, secrets included.
- Committing real credentials in a file, fixture, snapshot or example.
- Documenting keys in a README while the code reads different names.
- Treating a missing variable as an empty string because the language allowed it.

## Definition of done

Every key has one documented home, a type, a deliberate default and a startup check;
precedence is written down and behaves identically in every environment; secrets are
referenced, never committed, logged or echoed; missing or malformed required values
stop the process with a message that names the key and the reason; and an operator can
determine which source supplied any effective value without reading the source code.
