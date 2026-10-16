---
name: read-the-f-docs
description: "Consults authoritative documentation for a specific technology at a specific version. Use when you need an exact API signature, default value, flag name, config key, error behavior, deprecation, migration path, rate limit or platform requirement, and guessing would produce code that does not run: version skew, a snippet copied from the wrong release, or a question about what a tool or API actually does. Pins the version in use, finds the official reference, checks migration and deprecation notes, and separates documented behavior from interpretation."
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

# Read the f-docs

Half the wrong calls in a codebase come from code written against how a library used
to work. This skill produces one narrow, trustworthy answer: what a specific version
of a specific technology actually does.

**Core rule:** no version, no fact. If the answer depends on the version and you do
not know the version, you do not have an answer yet.

## When to use

Use when the question has a precise, checkable answer about a technology:

- The exact signature, parameters, types and return value of a function or endpoint.
- The default value of a flag, option or configuration key.
- The error, exception or rejection behavior, and what is thrown versus returned.
- Whether something is deprecated, removed in a named release, or needs a migration.
- Rate limits, quotas, payload sizes, timeouts, platform or runtime support.

Do not use to:

- Compare libraries or weigh trade-offs → `research-first`.
- Learn what this codebase uses or how it is wired → `understand-before-acting`.
- Check whether a snippet still matches local conventions → `follow-project-conventions`.
- Decide whether the design is right → `software-architect`.
- Find out whether a failure is a defect or intended behavior → `debug-properly`,
  which can call back here for the documented contract.

## Process

### 1. Pin the technology and the exact version

- Read the manifest and the lockfile, not the version range someone typed.
- For a CLI: `which <tool>` and `<tool> --version`.
- For a library already installed: read the vendored copy, the lockfile resolution, or
  the installed distribution's own metadata.
- For a hosted service or API: the region, plan and the API version in the URL or
  header. These are separate versions and they interact.
- If you cannot determine the version, stop and say so. The honest answer is
  "behavior for version X is unverified", not a guess from the latest docs.

### 2. Find the authoritative source for that version

In order of authority:

1. Documentation shipped inside the installed package, or the vendored source.
2. The official documentation page for the exact version, with the version selector
   set to it and the version visible in the URL.
3. The official "latest" page, used only when your version is current — label it as
   such in what you report.
4. The source code itself: signatures, type definitions, stubs, default values.
5. Release notes, changelogs and migration guides for the versions between yours and
   the next one.
6. Maintainer statements in issues, release announcements or talks.
7. Everything else: blogs, comparisons, tutorials, community answers. Useful for
   orientation, never the basis of a claim about behavior.

### 3. Go to the section that owns the behavior

API reference over tutorials: reference pages carry defaults, error conditions and
edge cases; tutorials omit them and smooth over the awkward parts. Check the page's
version selector before reading a sentence that sounds like an answer.

### 4. Read for the details that change code

- The full signature: arity, optional versus required, nullability, generics.
- The default, and whether the default changed between versions.
- What happens on invalid input: exception type, error code, rejected promise, or
  silent fallback. Silent fallback is the one that costs the most.
- Concurrency, reentrancy and idempotency guarantees.
- Timeouts, retries and backoff defaults.
- Deprecations: the replacement, the first deprecated version, the removal version.
- Limits and quotas that a test or a plan could exceed.

### 5. Cross-check against local reality

- Type definitions and stubs in the installed package describe the version you have.
- Run a minimal probe in a scratch file or a REPL when behavior is cheap to observe.
- When shipped code and documentation disagree, the shipped artifact decides what the
  code does and the documentation is a bug. Report both.

### 6. Record the fact

One line per fact: the claim, the version it holds for, the source you opened, the
date, and whether it is documented or inferred. This is the output; a fact you
cannot cite later was not worth the lookup.

## Documented versus inferred

- **Documented** — a source states it. Quote or paraphrase it closely.
- **Inferred** — you reasoned from documented facts. Say which ones and how.
- **Uncertain** — sources conflict or are silent. Say so, and say what you will
  assume in the meantime.

Never let inference wear the clothes of documentation. "The docs do not say whether
the connection is reused, so it is probably per-request" is an assumption, and it
belongs in a different sentence.

## Interaction with other skills

- `research-first` — owns the investigation loop when several sources must be
  compared or a decision weighed. This skill returns one authoritative fact for one
  version and stops there.
- `debug-properly` — establishes what the contract is before deciding a symptom is a
  defect.
- `how` — explains how this repository actually uses the technology; this skill says
  what the technology does.
- `why` — explains why this project pinned or bypassed a version.
- `minimal-changes` — owns the diff; a version-specific correction is still scoped to
  what the task needs.
- `mom-always-say-the-same` — when the docs, the comment and the code disagree about a
  version or a flag, one authoritative source has to win.
- `no-made-up-results` — a behavior you did not read or run is not a documented
  behavior.

## Anti-patterns

- Reading the latest documentation page for a project pinned three majors back.
- Quoting a tutorial and calling it the API contract.
- Copying a snippet without checking which release it was written for.
- Citing documentation you did not open.
- Reading docs for a technology the task does not use.
- Treating undocumented behavior as nonexistent rather than as unspecified.
- Assuming a signature is unchanged because it "looks stable".
- Reading past the deprecation and migration notes to reach the reference page first.
- Reporting a lookup you skipped because the answer felt obvious.

## Definition of done

The version is pinned from an artifact, the answer comes from the official source for
that version, defaults, errors, limits and deprecations were checked, any conflict
between docs and shipped code is reported, and every fact is written down with its
version, source and date so the next reader can re-verify it.
