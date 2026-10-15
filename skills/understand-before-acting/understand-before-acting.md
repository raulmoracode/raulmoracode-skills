---
name: understand-before-acting
description: "Investigates the environment before any change is made: reads the files, project instructions, architecture and conventions the task touches, and checks the repository's current state including uncommitted work. Use when opening an unfamiliar repository or module, before editing, refactoring or running commands that mutate state; when the request names something by role rather than location ('the exporter', 'the auth flow', 'the config loader') and you must locate it; and whenever you are about to assume structure, entry points, build tooling or data flow that a read would settle."
---

# Understand before acting

Most damage an agent does comes from changing something without knowing what it was
connected to. A read costs seconds. A wrong assumption costs a broken build, a lost
change, or an explanation you cannot support with evidence afterwards.

**Core rule:** do not assume anything that a few minutes of reading would settle.

## When to use

Use when:

- You are about to edit, create, move, rename or delete anything.
- You are new to this repository, or to the part of it the task touches.
- The request names something by role rather than by location ("the exporter", "the
  billing job", "the settings loader") and you have to find it first.
- A command will mutate state: install, generate, migrate, format-all, rebase, delete.
- You are resuming in a tree you did not create — see `how-was-last-night`.

Do not use to:

- Decide what to build and in what order → `plan-before-coding`.
- Explain an existing system to someone → `how`.
- Investigate why a decision was made → `why`.
- Look up an API or tool's authoritative behavior → `read-the-f-docs`.
- Judge whether a design is sound → `software-architect`.

## Process

### 1. Read the project's own instructions

Repositories state their own rules. Read what is present, before reading code:

- `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `CONTRIBUTING.md` — how work is done here.
- `README.md` — what the project is, how it runs, what is out of scope.
- `docs/` — architecture notes, decision records, style guides, runbooks.
- The root manifest and task runner: `package.json`, `pyproject.toml`, `go.mod`,
  `Cargo.toml`, `Makefile`, `justfile`. CI workflow files show what actually gates a
  change.

These are authoritative. They outrank your habits and your memory of how similar
projects work.

### 2. Map the territory the task touches

- Locate the modules in question. Search by symbol, by string literal, by route, by
  config key, by import path.
- Read the two or three closest analogs: existing code that already solves this
  problem. That is your template for file set, structure and error handling.
- Follow the edges: who calls this, what this calls, what reads what it writes, what
  registers it at startup.
- Learn the build and test wiring, so you know which files matter at runtime and
  which are dead.

### 3. Identify conventions and dependencies

Note the casing, the layout, the module and export style, the error idiom, the test
placement, and which libraries are already accepted. `follow-project-conventions` owns
the detailed discovery; this step decides whether you need it.

### 4. Check the current state of the tree

Know what you are standing on before you build on it:

- Uncommitted changes, staged, unstaged and untracked. These are someone's work —
  yours or the user's. Never discard, stash away or overwrite them to simplify your
  own task; `safe-git` owns that protection.
- The current branch, whether the tree is ahead or behind, and whether a rebase, merge
  or cherry-pick is in progress.
- Whether the tree was already broken. Run the project's check command once, so you
  can tell your breakage from pre-existing breakage.

An uncommitted diff in a file you need to modify is information. Read it: it shows
what is in flight and whether your change collides with work already done.

### 5. Name the unknowns that would change your approach

List the few things you do not know that would alter what you do, and resolve those
only. Questions the local tree cannot answer go to `research-first` for comparison and
`read-the-f-docs` for authoritative facts. Expensive guesses go to `dont-ask-shit` to
weigh.

## Scale the investigation

Understanding is not a survey. Depth is proportional to the change:

- **One-line fix in a file you just read**: re-read the function, edit, done.
- **Change inside one module you know**: that module plus its direct callers.
- **New feature or unfamiliar area**: the subsystem, its analog, and the tests that
  describe its intended behavior.
- **Cross-cutting or public change**: consumers, configuration, tests and docs that
  reference it.

Stop when the next read would not change what you do next.

## Questions you should be able to answer

Before you start editing:

- Which files I will touch, and why those and not others.
- What the affected code does today, and what it must do after.
- What this project requires for a change of this kind.
- Which checks must pass, and the exact commands.
- Whether anything is already modified, staged or untracked.

If an answer is a guess, either it is cheap to verify — verify it — or it is costly
to get wrong, in which case investigate or ask before editing.

## Interaction with other skills

- `raulmoracode-mode` — sizes the task and decides whether this skill applies at all.
- `follow-project-conventions` — owns the detailed discovery of naming, layout,
  patterns, error idiom and tooling.
- `plan-before-coding` — converts what you learned into ordered steps and criteria.
- `research-first` — owns open questions the local tree cannot answer.
- `read-the-f-docs` — owns authoritative version-specific API and tool behavior.
- `how` — explains a system's mechanism once you are deep in it.
- `why` — explains the rationale behind code you have just read.
- `project-structure` — when the task needs a written map of what lives where, rather
  than context held in your head. It produces the tree; this skill gathers enough to act.
- `safe-git` — owns protection of uncommitted work and destructive operations.
- `code` — the implementation craft, once the context is in hand.

## Anti-patterns

- Editing first and reading the surrounding code afterward as a review.
- Reading the whole repository when the task touches six files.
- Ignoring `AGENTS.md` because the pattern you already know feels right.
- Running a repo-wide formatter, codemod or "fix everything" script before knowing
  what it would touch.
- Treating an uncommitted diff as noise and resetting it away.
- Assuming the suite was green before you started, then claiming a pre-existing failure
  as your own — or the reverse.
- Reading only the happy path and skipping the tests that state the intended behavior.
- Confirming the directory exists instead of confirming what is in it.

## Definition of done

You can name the files you will change and the commands that must pass; this
project's instructions for a change of this kind are read; the tree's current state,
including uncommitted work, is known and untouched; and no assumption behind your plan
is one that a read would have settled.
