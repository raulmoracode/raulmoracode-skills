---
name: platform-engineer
description: "Working posture for platform and developer-infrastructure work: CI/CD, build and run environments, developer tooling, configuration plumbing and the path from a clean checkout to production. Use when a task touches pipelines, runners, build images, devcontainers, task runners, bootstrap scripts, environment parity, pinned tool versions, caches, or any step a developer repeats by hand, so the platform is fixed instead of the person working around it."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`ci-cd`, `configuration-management`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Platform engineer

Platform engineering is a working posture, not a checklist: the delivery path, the
environments around it and the tooling developers touch are treated as a product with
users. The measure of the posture is whether someone on a clean machine reaches the
same verified result as the pipeline, without tribal knowledge, manual steps or local
state that only one person happens to have.

This skill holds the stance and the routing. The rules for designing a pipeline,
governing configuration or hardening credentials live in the skills that own those
concerns, and they get loaded when the concern appears.

**Core rule:** every manual step a developer repeats is a defect in the platform; fix
the platform rather than the person who works around it.

## When to use

Use when:

- A pipeline, runner, build image or reusable workflow is added, repaired or replaced.
- Local setup, onboarding or "works on my machine" failures are the complaint.
- Developer tooling drifts between repositories: task runners, scripts, hooks,
  linters, devcontainers, version managers.
- Environment parity, pinned tool versions, caches or bootstrap steps are in question.
- A shared internal tool, template or script needs a change, a deprecation or a
  replacement.
- The path from a clean checkout to a running system is longer or more manual than
  the team can tolerate.

Do not use to:

- Design job graphs, promotion rules, artifact flow or rollback in a pipeline → `ci-cd`.
- Decide configuration sources, precedence, defaults or secret references →
  `configuration-management`.
- Threat-model runners, credentials or third-party tool installation → `security-first`.
- Design logs, metrics, traces or alerts for the platform → `observability`.
- Decide versions, changelogs, publication or deprecation of shipped artifacts →
  `release-engineering`.

## Process

### 1. Walk the path as a newcomer

Read the repository's scripts, workflow files, container and devcontainer definitions,
version files and setup documentation before changing any of them. Then follow the
path literally: clone, bootstrap, build, test, run. Note every step that needed memory,
a global install or a file that is not in the repository. The files are evidence; a
setup page nobody has run this year is only a claim.

### 2. Pin the environment, not the person

Declare what the work needs and keep it in the repository: language runtimes, package
managers, compilers, CLIs and base images. A tool that must be installed by hand is
missing or wrong on someone's machine eventually. Prefer project-scoped pinning over
global installs, one source of truth over version strings copied into several files,
and a bootstrap that is safe to run twice in a row.

### 3. Make the local loop and the pipeline run the same commands

The developer-facing entry point should call the same commands, under the same
environment assumptions, as the pipeline does. Keep the fast loop honest: same
versions, same variables, same working directory, same exit codes. Caches are welcome
when they can be deleted and rebuilt; they are a shortcut, never a hidden input.

### 4. Automate a step only after running it by hand

Do the manual step once and watch its edge cases: ordering, cleanup, partial failure,
credentials, reruns. Then give the automation a discoverable name and real help text,
list it where teammates look for tasks, and make failures explain the next action. One
readable command beats a wrapper nobody can debug.

### 5. Treat shared tooling changes as migrations

Anything the whole team executes has users and its own blast radius. Ship the
replacement path first, keep the old path working for a stated window, announce the
change where its users actually look, and schedule the removal instead of letting it
happen by accident. Keep a fallback: the previous pinned tool state, not an improvised
rollback under time pressure.

### 6. Watch the platform with numbers

Track pipeline duration, queue time, failure rate per job, cache hit rate and flaky
test count as product metrics. Instrument them where the platform already reports,
choose thresholds someone will act on, and fix the slowest or least reliable step
first rather than the one complained about most recently.

## Interaction with other skills

- `ci-cd` — owns workflow design, job boundaries, artifacts, promotion and rollback.
- `configuration-management` — owns configuration sources, precedence, defaults and
  secret references.
- `observability` — owns log, metric, trace and alert design, including delivery
  signals.
- `release-engineering` — owns version identity, changelogs, publication and
  deprecation of what the platform produces.
- `security-first` — owns threat modeling for runners, credentials and anything the
  platform installs or executes.
- `compare-environments` — compares the environments this posture is responsible for,
  surfacing drift between them.

## Anti-patterns

- Answering a friction report with a longer command instead of a better default.
- Local scripts and pipeline steps that quietly diverge until only the pipeline can
  build the project.
- Setup knowledge that lives in one person's shell history or an unmaintained page.
- Global, mutable tool installs on shared machines and runners.
- Replacing shared tooling without a migration window, an announcement or a fallback.
- Credentials baked into images, runner definitions, caches or committed env files.
- Automating a step that was never understood, then maintaining the automation's bugs.
- Adding a platform layer where a pipeline or configuration change was the real fix.
- Measuring nothing and learning about platform degradation from user complaints.

## Definition of done

A newcomer can reach the same verified result as the pipeline from a clean machine
using only what the repository documents; tool versions and environment assumptions
are pinned in the repository; repeated manual steps have been replaced by discoverable,
versioned commands; shared changes carry a migration window and a fallback; the
platform reports the numbers that would reveal its own degradation; and the report
states what changed, what was pinned and what is still manual.
