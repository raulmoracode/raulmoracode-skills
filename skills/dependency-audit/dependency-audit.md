---
name: dependency-audit
description: "Reviews the third-party code a project resolves and ships: direct and transitive packages, pinned versions, licenses, maintenance state, vulnerability exposure and provenance. Use when adding, upgrading, pinning or removing a dependency, when a lockfile or base image changes, when an advisory names a package in the tree, or when a license or supply-chain question needs evidence, ending with a per-dependency decision and the sources behind it."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`security-first`, `research-first`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Dependency audit

Third-party code runs in the project's process under the project's name, fails on the
vendor's schedule, and carries license and maintenance obligations the project inherits
the moment it is installed. This skill reads what actually resolves, at the exact
version that would execute, and turns that reading into one decision per dependency
that a reviewer can check against named evidence.

**Core rule:** audit what resolves and ships, not what the manifest claims, and never
leave a dependency without a recorded decision or a recorded, owned acceptance.

## When to use

Use when:

- A manifest, lockfile, vendored directory or container base image is added or changed.
- A security advisory names a package the project resolves, directly or transitively.
- A license, attribution or redistribution question reaches the review.
- A package looks unmaintained, oversized, duplicated or too privileged for its job.
- Provenance is unclear: who published it, from which source, through what process.

Do not use to:

- Threat-model the application's own surface → `security-first`.
- Compare candidate libraries and weigh trade-offs → `research-first`.
- Confirm a version's documented API, deprecation or support window → `read-the-f-docs`.
- Repair the job that installs, caches or publishes dependencies → `ci-cd`.

## Process

### 1. Resolve the tree instead of reading the manifest

Ask the package manager to print the resolved graph — `npm ls --all`, `pnpm why`,
`pipdeptree`, `cargo tree`, `go mod graph`, `mvn dependency:tree` — and read the
lockfile, not the range syntax someone typed. Record the registry, the resolved
versions and the platform the resolution targets. A manifest with one entry can hide
hundreds of packages; a lockfile can hide a second major version of something already
in use.

### 2. Classify each package by role and exposure

Sort entries into direct runtime, direct build or test, transitive, vendored, and
non-package artifacts such as base images, binaries and downloaded toolchains. Mark
which ones ship to users, which run only on developer or CI machines, and which touch
credentials, the network or the filesystem. Exposure decides review depth; a package
count alone decides nothing.

### 3. Pin versions and check compatibility

State the exact version each range resolves to and whether the code was written
against it, rather than against a newer major. Treat two versions of one library in a
single tree, unpinned runtime ranges, and git-URL or prerelease dependencies as
findings, not as noise. Check the supported runtime, operating system and architecture
against what the project actually deploys, and note when a package has silently stopped
supporting one of them.

### 4. Read the maintenance state

Gather signals rather than vibes: last release date, cadence over the past year,
unresolved security issues, whether the maintainer responds, deprecation notices, and
whether a maintained fork has become the successor. A finished library with a small,
stable surface is not the same as an abandoned one whose queue is untouched. Name the
signal that decided the judgment.

### 5. Read the license text

Read the actual license file for each package, including transitive ones, plus the base
image license and any bundled binary. Identify the obligations that travel with
distribution: attribution, copyleft reach into linked or modified code, source
disclosure, patent terms, trademark limits. Compare them with how the project is
distributed and with the project's own license. A registry label is a hint; the license
text is the evidence.

### 6. Scan for known vulnerabilities, then read each hit

Run the ecosystem's advisory source and read every match instead of the summary count.
For each, establish the affected range, the fixed version, whether the vulnerable path
is reachable from this project, and whether the deployed artifact includes it.
Separate reachable, present-but-unreachable, and no-fix-available findings. A clean
scan is evidence about the database and the resolver, not proof that the tree is safe.

### 7. Judge provenance and install-time behavior

Establish who publishes the package, from which repository, with what release process.
Prefer verified publishers, signed releases, reproducible builds and public CI. Treat
install-time scripts, code fetched during installation, a sudden maintainer change,
names one keystroke from a popular package, and artifacts that do not match their
published source as findings that need justification, not footnotes.

### 8. Decide, record and schedule the re-check

For each finding write: package, resolved version, the evidence and its source, the
decision — keep, pin, upgrade, replace, remove, or accept with a reason — plus an owner
and a date to revisit. Removing beats replacing; adopting a maintained successor beats
patching around a dead one. An accepted risk is legitimate only when it is written down
with its expiry.

## Interaction with other skills

- `security-first` — owns threat modeling of the application's own surface; this skill
  owns the risk carried by code the project did not write.
- `research-first` — supplies the evidence-based comparison when a dependency must be
  replaced rather than fixed.
- `ci-cd` — runs installs and scans in the pipeline; this skill interprets what they
  report and decides what changes.
- `read-the-f-docs` — settles version-specific behavior, deprecation and support windows
  from primary sources instead of memory.

## Anti-patterns

- Auditing the manifest while the lockfile resolves something else entirely.
- Judging reachability from an advisory title instead of the vulnerable call path.
- Silencing an alert by jumping to the newest major without reading its changelog.
- Treating a badge, a README claim or a marketplace page as license evidence.
- Keeping an abandoned package because it still works on today's runtime.
- Adding a dependency for what a few lines of the standard library would do.
- Reporting a finding without the version and the source that produced it.
- Recording an acceptance with no owner, no reason and no review date.

## Definition of done

Every dependency in the resolved tree is classified, pinned to the version that ships,
and cleared against licenses, advisories, maintenance state and provenance. Each
finding names its evidence and its source, carries a decision and an owner, and any
accepted risk has a reason and an expiry. The report separates what was run from what
was read, so the next reviewer can reproduce the audit instead of trusting its
conclusion.
