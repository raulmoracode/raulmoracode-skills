---
name: release-engineering
description: "Plans and executes versioned releases: version numbers, changelogs, tags, reproducible artifacts, package publication, staged rollout and rollback. Use when cutting a release, choosing major, minor or patch, writing release notes, tagging a revision, publishing a package or image, preparing a rollout plan, or repairing a release that shipped the wrong content."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`ci-cd`, `safe-git`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Release engineering

A release is an identity that people install, cite in bug reports and depend on for
months. The work is to make that identity real: a version derived from the change, an
artifact built once from a known revision, notes that describe it honestly, a path to
users and a path back. A pipeline executes releases; this skill decides what a release
means and proves that each one is what it claims to be before anyone consumes it.

**Core rule:** every release is one immutable artifact built from one known revision,
and nothing about it may require reconstructing the workspace afterwards.

## When to use

Use when:

- Choosing the next version number from the change surface: breaking, additive or fix.
- Writing, generating or reviewing a changelog or release notes.
- Tagging a revision, attaching assets or publishing a package, image or binary.
- Making a build reproducible so two builds from one revision agree.
- Staging a release through candidate channels, pre-release versions or draft releases.
- Planning rollout order, observation windows and gates for a release.
- Preparing, testing or documenting a rollback path.
- Repairing a bad release: yanking, superseding or reissuing a version.

Do not use to:

- Design or debug the workflow that performs the release → `ci-cd`.
- Review, merge or authorize the change the release carries → `git-pr`.
- Choose environment values and secret sources → `configuration-management`.
- Judge licenses and vulnerabilities of what is about to ship → `dependency-audit`.
- Reconcile package metadata, README and install docs with the release →
  `mom-always-say-the-same`.

## Process

### 1. Fix the release identity first

Write down the version, the target revision, the tag name, the package names and the
artifact names before building anything. Every later step refers to this identity: the
changelog, the checksums, the registry entry, the rollout and the rollback. An identity
invented after the build describes whatever happened; it does not constitute a release.

### 2. Derive the version from the diff

Read what changed since the previous tag — removed or incompatible behavior is major,
new capability is minor, corrected behavior is patch — and check the public surface
rather than trusting commit messages. When the classification is genuinely ambiguous,
choose the stronger change and document the reasoning. The version scheme is a contract
with consumers, and pre-release ordering follows the ecosystem's rules.

### 3. Build once, reproducibly, from the tagged revision

Refuse to release from a dirty tree. Pin the toolchain, lock dependencies, set flags
and environment explicitly, and rebuild from the recorded inputs to confirm that the
output matches. Record the revision, toolchain and lockfile state next to the artifact.
A difference between two builds is either explained or it blocks the release.

### 4. Inspect the artifact before publishing

Compare the artifact's contents against its manifest: entry points, types, licenses,
notices, assets, generated files. Install or execute it in a clean environment instead
of the build tree, and check the install-time behavior a consumer will actually hit.
Metadata that disagrees with the contents is a defect of the release, not a
documentation chore. A missing file that a user finds is a broken version.

### 5. Write the changelog from evidence

Group entries by user-visible effect — added, changed, fixed, removed, security — and
write them in the vocabulary of someone who installs the software. Link the issues and
pull requests behind each entry. Give breaking changes their own section with the
migration or the workaround, and state known limitations rather than leaving them for
the first bug report to discover.

### 6. Stage, then publish without rewriting

Publish a candidate channel or pre-release when the ecosystem supports it, run install
and smoke checks against that candidate, then promote the same bytes to the stable
channel. Never rebuild during promotion. Published versions are immutable: a mistake is
corrected by a new version, never by overwriting an artifact or moving a tag. When a
release must be withdrawn, leave a note where consumers will find it.

### 7. Plan the rollout and the rollback together

State how the release reaches users — all at once, canary, percentage, scheduled window
— what evidence widens it and what stops it. For rollback, name the target version,
where its artifact remains available, who can execute the reversal and how success is
verified. Exercise the rollback path while the release is still healthy, because the
worst time to learn that a channel cannot go back is during an incident.

### 8. Record and verify the release

The record holds the version, revision, artifact checksums, changelog, approvals,
rollout state and verification results. Then verify from outside: install from the
published source, confirm the reported version, check that registry metadata and docs
point at this release, and confirm that the previous version is still installable. The
record is what someone reconstructs the release from once memory has moved on.

## Interaction with other skills

- `ci-cd` — owns the pipeline that builds, tests and publishes; this skill owns release
  identity, versioning, rollout and rollback.
- `git-pr` — owns the review, merge and authorization flow that precedes a tagged
  revision.
- `mom-always-say-the-same` — keeps package metadata, README, install docs and the
  changelog agreeing with the shipped version.
- `configuration-management` — owns environment values and secret references the
  release reads; nothing environment-specific is baked into the artifact.
- `dependency-audit` — supplies license and vulnerability findings that may block or
  annotate a release.

## Anti-patterns

- Tagging a revision other than the one the artifact was built from.
- A changelog that repeats commit subjects and omits breaking changes.
- Publishing from a dirty working tree or an unpinned toolchain.
- Reusing or overwriting a version because the first publication was wrong.
- Rollback instructions that say redeploy the previous commit and nothing more.
- An install path that has only ever run on the author's machine.
- Treating a green pipeline as proof that the published package is correct.
- Shipping an untested dependency upgrade because the suite passed before it.

## Definition of done

The version, tag, artifact names and package metadata agree on one identity; the number
matches the change it carries under the project's scheme; two builds from the recorded
inputs agreed; the artifact was inspected and installed from the published source; the
changelog describes user-visible and breaking changes in the consumer's vocabulary; the
rollout gates and the rollback path are stated and tried; and one written record
reconstructs the release without asking anyone who was there.
