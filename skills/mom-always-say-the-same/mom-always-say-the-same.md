---
name: mom-always-say-the-same
description: "Keeps code, comments, documentation, examples and configuration telling the same story. Use when a change alters a signature, default, CLI flag, config key, environment variable, schema, error message or public behavior, or when a README, docstring, example, comment or .env file may now be wrong: sweeps every affected artifact, gives each important fact one authoritative home, and treats outdated documentation as a defect rather than cosmetics."
---

# Mom always says the same

Code is read through the documentation around it, and documentation is read by people
who cannot see the code. When the two disagree, one of them has already cost somebody an
hour.

**Core rule:** a change that makes a statement false must update the statement, or
delete it. Stale documentation is a defect, not a cosmetic issue.

## When to use

Use on any change that alters an interface a reader depends on: a function signature, a
default, a flag, a config key, an environment variable, a schema, an error message, a
response shape. Also use when you notice documentation contradicting the code while
working on something else.

Do not use to:

- Design the tests → `dad-always-say-the-same`.
- Judge the diff for defects and noise → `review-your-work`.
- Decide how much of the change to make → `minimal-changes`.
- Explain how the system works → `how`.

## Sweep triggers

Run the sweep when the change matches the left column. This list is the minimum, not the
maximum.

| The change | Must be checked |
| --- | --- |
| Function signature, parameters, return type | Its docstring, README snippets, API docs, every example that calls it, generated type output |
| Renamed or moved symbol | Every reference: imports, call sites, tests, comments, docs, config, re-export lists |
| Changed default value | README, config reference, `.env.example`, schema, CLI help text, fixtures that assume the old one |
| Config key added, renamed, removed | Config reference, `.env.example`, JSON schema, deployment manifests, `docker-compose`, CI workflow |
| New or changed CLI flag | `--help` text, README usage, shell completions, scripts shown in docs |
| Public API response or field | API docs, OpenAPI spec, client types, example payloads, frontend consumers, changelog entry |
| Changed error message or wording | User docs, runbooks, alert rules that match on the text, translations, screenshots |
| New or renamed environment variable | `.env.example`, deployment config, container definitions, local-setup docs |
| Schema or migration | Schema docs, seed data, queries and dashboards, migration notes |
| Performance or behavior change | Benchmark claims, README performance sections, architecture notes, capacity assumptions |

## Process

### 1. List what the change makes false

Before searching for documents, state the claims that are now wrong: "the default is 30
days", "pass `--force` to skip", "returns a list of ids". You cannot find what you have
not named.

### 2. Find every artifact that makes each claim

Search the repository for the literal: the old default, the old flag, the old symbol,
the old wording. Use grep, not memory. Include comments near the code, not only files
with `.md` in the name. Generated files count too — regenerate them rather than editing
by hand.

### 3. Check comments against behavior

A comment that describes a constraint, a workaround or an invariant is a claim about the
code next to it. If your change moved the boundary, the comment is now wrong even though
the sentence still reads well.

Delete comments that only restate the code, and let the code carry that. That is
`unslop`'s call on your own output.

### 4. Keep examples executable

An example that no longer runs is worse than no example, because it is trusted. Prefer
examples derived from the real interface: generate the CLI reference from `--help`,
generate the API docs from the schema, generate the parameter table from the signature.
When a manual example must stay, verify it by following it literally.

### 5. Follow the instructions as a stranger would

Read the changed instructions top to bottom and try to execute them: missing step, wrong
filename, wrong command, undefined term, wrong order. Fix what fails. This is the
cheapest verification available and it catches most drift.

## One authoritative home

Duplicated facts drift. When a fact appears in several places, decide once where it
lives and make the others derive from it or point at it.

- **Generate instead of copy** wherever the tooling allows: help text, API reference,
  parameter tables, version numbers, type signatures.
- **Link instead of restate** where generation is not possible: a README that describes
  configuration links to the schema or the config reference.
- **Never maintain the same fact by hand in two files.** If you must, expect the two to
  disagree and pick which one is wrong later.
- **Name the authority** when it is not obvious: the source of truth for a version, a
  default, a port or a limit should be identifiable from reading one file.

When you find two artifacts that disagree and the change did not cause it, that is a
defect to report — and see the rule below before fixing it.

## Correcting documentation you were not asked about

Documentation found to be wrong outside the scope of the current change is a real
finding, and it is still someone else's diff to approve.

- **Caused by your change** — fix it now, inside this change; your change made it false.
- **Unrelated but in a file you are already editing** — leave it, and report it.
- **Unrelated and elsewhere** — report it, do not edit it. Mention the file and line,
  what it says, and what the code says.

This is `minimal-changes` territory: an unrequested doc fix bundled into a feature diff
is invisible to the reviewer who can judge it. Flagging it costs one line.

## Interaction with other skills

- `dad-always-say-the-same` — owns test design and test quality. This skill owns the
  prose, comments, examples and config docs around the code; neither covers the other's
  territory. A stale docstring and a test that asserts the old default are different
  defects with different fixes.
- `code` — owns the implementation. This skill covers everything that describes it.
- `minimal-changes` — owns the size of the diff; a documentation sweep the change forces
  is required work and belongs in this diff.
- `follow-project-conventions` — owns where documentation lives and in what voice.
- `unslop` — removes low-quality generated prose and comments from your own output.
- `review-your-work` — owns reviewing the finished diff; a contradiction between code
  and docs is one of its findings, this skill is how you prevent it.
- `debug-properly` — owns root-cause diagnosis; when a comment misled the diagnosis, fix
  the cause and then the comment.
- `how` and `why` — own explaining mechanism and rationale; do not restate them in
  comments that will go stale.
- `clear-final-report` — carries documentation findings you chose not to fix.

## Anti-patterns

- Fixing the code and leaving the README describing the old behavior.
- A comment explaining an invariant that the change removed.
- Copying a value into the README and the config file instead of linking or generating.
- An example that was never run since the interface changed.
- Deleting the awkward documentation instead of updating it, when the content is still
  true somewhere else.
- A docstring that restates the signature and explains nothing.
- Bundling a drive-by documentation rewrite into a feature diff.
- Calling documentation updates out of scope and leaving the repo contradicting itself.

## Definition of done

Every statement the change invalidated has been updated or removed across code comments,
docs, examples and configuration; each important fact has exactly one authoritative home
and the rest derive from it; the changed instructions have been followed literally and
work; and any documentation defect outside the change is reported rather than applied.
