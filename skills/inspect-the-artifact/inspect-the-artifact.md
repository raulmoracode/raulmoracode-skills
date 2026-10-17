---
name: inspect-the-artifact
description: "Inspects the real contents, metadata and reproducibility of a built artifact before it ships: tarballs, packages, wheels, container images, binaries, bundles and generated files. Use when a release or handoff depends on what the artifact actually contains, when a digest, manifest or revision claim needs confirming, when a consumer reports a missing or unexpected file, or when reproducibility is claimed and must be tested by rebuilding and comparing, rather than trusting the pipeline that produced it."
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

# Inspect the artifact

An artifact becomes evidence only once it has been opened. Builds fail quietly: a
package omits its entry file, an image carries a revision label from an earlier run, a
tarball differs from the tagged source because an ignore rule swallowed a directory.
The pipeline and the filename describe intent; the bytes describe what was produced.

This skill inspects the produced bytes — contents, metadata and reproducibility —
without trusting the build that made them and without executing anything untrusted.

**Core rule:** inspect the artifact that will ship, not the build that claims to have
made it.

## When to use

Use when:

- A release, publish step or handoff depends on what a package, image or archive holds.
- A build reported success but nobody has listed what went into the output.
- An artifact's digest, revision, size or provenance needs confirming.
- A consumer reports a missing file, a wrong entry point, bad permissions or extra
  content.
- Reproducibility is claimed and must be tested by rebuilding and comparing.
- A binary, bundle or image must be checked before it is trusted, installed or run.

Do not use to:

- Design the pipeline, jobs or promotion that produce the artifact → `ci-cd`.
- Decide versions, tags, publication or rollback → `release-engineering`.
- Review dependency licenses, advisories or upstream trust → `dependency-audit`.
- Set the evidence standard for statements about the inspection →
  `verify-before-claiming`.
- Manage configuration sources or environment-specific values →
  `configuration-management`.

## Process

### 1. Identify the artifact before trusting it

Record where it came from and what it claims to be: repository, revision, producing
job, target platform, version. Compute a digest (`sha256sum`, `shasum -a 256`, a
registry-provided digest) and use it as the artifact's identity in every later
sentence; a filename, a tag or a movable release pointer is not an identity. Note the
size and timestamps, and keep extracted copies away from the original.

### 2. List contents without executing them

Prefer listing tools over extraction and execution: `tar -tvf` for archives, `unzip -l`
for zips, the package's own manifest for wheels and gems, `dpkg -c` or `rpm -qlp` for
system packages, a tree export for source archives. For images, read the manifest,
config and layer list before starting a container, and inspect layers with a dedicated
tool when their contents matter. When extraction is unavoidable, do it in a disposable
directory or container as a non-privileged user, and never run an artifact to find out
what it does.

### 3. Check required files, permissions and metadata

Compare what consumers need against what the artifact provides: entry points, bin
executables, license and notice files, documentation, declarations and resources the
runtime loads by path. Watch for the classic failures: files excluded by an ignore
rule, empty directories that archives drop, executable bits lost on scripts or granted
to everything, symlinks that point outside the archive, absolute paths sealed into
configuration, and path casing that breaks on case-sensitive filesystems.

### 4. Look for content that must not ship

Inspect what should never have been packed: secrets in dotfiles or environment dumps,
fixtures, coverage output, editor directories, build caches, source maps that expose
private sources, and development-only dependencies pulled into a bundle. In images,
remember that a later layer deleting a file does not remove it from the image: check
layer contents, history and build arguments for values that still travel with the
artifact.

### 5. Rebuild and compare against the source revision

Take the revision the artifact claims, check out a clean copy, build it with the
recorded toolchain and compare the digests. When they differ, find the cause before
calling the artifact unreproducible: embedded timestamps or version stamps, archive
metadata and file ordering, absolute build paths, locale or timezone influence,
dependency resolution that ignored the lockfile, or a build directory that was not
clean. Report the level reached honestly: byte-identical, identical contents with
different metadata, or not reproducible.

### 6. Verify provenance and state the limits

Confirm signatures, checksums, attestations or provenance records where the project
publishes them, and say what each check proves. A signature says who signed, not that
the contents are correct; a checksum shipped beside the artifact catches transfer
corruption, not a compromised build. Record whatever the platform supplies together
with the artifact identity, then separate what was listed from what was extracted,
what was rebuilt from what was assumed, and what remains unchecked.

## Interaction with other skills

- `release-engineering` — owns version identity, publication and rollback of what the
  artifact becomes.
- `ci-cd` — owns the pipeline that builds and hands over the artifact.
- `dependency-audit` — owns license, advisory and trust review of what is pulled in.
- `verify-before-claiming` — owns the language used for claims about the inspection.
- `configuration-management` — owns the configuration values and references the
  artifact expects at runtime.

## Anti-patterns

- Trusting a filename, tag or build log instead of the artifact's digest.
- Running an unverified binary or container to discover what is inside it.
- Checking the file list and skipping permissions, symlinks, paths and ownership.
- Treating a signature or a published checksum as proof that the contents are right.
- Claiming reproducibility from one successful rebuild on the same machine.
- Reporting that an artifact looks fine after a single listing of a large archive.
- Leaving extracted or rebuilt copies inside the repository or the build workspace.
- Confusing a missing entry in a listing with evidence that the file cannot exist.

## Definition of done

The artifact is identified by digest with its claimed revision and producing job; its
contents were listed or extracted in a disposable place and checked against what its
consumers need; metadata, permissions, symlinks and unwanted content were examined
rather than assumed; a rebuild comparison states the reproducibility level actually
achieved, or why it could not be tested; provenance checks are reported with what they
do and do not prove; and the report separates what was inspected from what was not.
