---
name: project-structure
description: "Reads the project it is in and produces an annotated directory tree: every listed folder and file gets an inline `#` comment describing its actual responsibility, established from evidence in the code, imports, manifests and config rather than guessed from names. Use when asked to show the project structure, generate or explain a directory tree, explain what each folder or file is for, produce an onboarding map of a repository, document the layout, or save the tree to a file. Excludes generated, vendored and cached directories by default, controls depth on large repositories, never prints secret values, and is read-only unless explicitly asked to save."
---

# Project structure

A tree that is confidently wrong is worse than no tree, because it is believed. This
skill reads the project and produces a map where every listed folder and file carries a
`#` comment describing what it actually does, drawn from evidence rather than from what
the name suggests.

**Core rule:** describe what you inspected, not what the name implies. A path you did
not open gets `# Purpose unclear from available evidence.`

## When to use

- "Show me the project structure", "generate a tree", "draw the tree".
- "What does each folder do?", "explain the layout", "where does X live?".
- Orienting yourself or the user in an unfamiliar repository.
- Documenting a repository's organization, or saving that map to a file.

Do not use to:

- Explain how a system behaves at runtime → `how`.
- Gather the context needed before editing → `understand-before-acting`.
- Judge whether the organization is good → `software-architect`.
- Learn why the layout came to be this way → `why`.

## The contract

Two obligations, and they are the whole skill:

1. **Whatever you list, you describe.** Every folder and every file in the output has a
   `#` comment.
2. **You list what is useful, not everything.** "Every file" is impossible on a real
   repository and unreadable if attempted. Listing fewer things and describing them
   accurately is the correct trade, and it satisfies obligation 1.

The tension between these is the skill. Resolve it toward usefulness.

## Process

### 1. Find the real project root

Do not assume the working directory is the root. Look for the nearest `.git`, a
manifest (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`), a
workspace or solution file, or project instructions such as `AGENTS.md`. When several
roots exist (a monorepo, a workspace), name them and say which one you are describing.

### 2. Fix the scope and the depth before enumerating

Decide what the request asked for and what the project can afford:

- **A single directory** — name it, show it, do not enumerate the repository around it.
- **Orientation (the default)** — directories plus the files that carry meaning:
  entry points, configuration, manifests, documentation, top-level scripts.
- **Everything** — expand the exclusions, keep the note, and warn that the result is a
  listing rather than a map.

Choose a maximum depth. For any repository over roughly a hundred source files, depth 3
with a deliberate expansion is more useful than depth 10.

### 3. Enumerate with the project's own rules

Prefer the repository's own view of itself over a raw filesystem walk: `git ls-files`
already honors `.gitignore`, which is the project's own statement about what is noise.
See `references/tree-format.md` for the read-only commands and the default exclusion
list, including the cases where an excluded-looking name such as `build/` holds real
source.

### 4. Establish each description from evidence

This is the work. For each element, find the cheapest evidence that settles its purpose.

Read `references/description-guidelines.md` before describing anything whose role is not
already obvious. It lists the evidence to look for per kind of element (an entry point,
a router, a service module, a migration, a config file, a test directory) and gives
vague-to-specific rewrites to calibrate the phrasing.

Budget the inspection: filenames, imports, `package.json` scripts, config keys and
framework conventions settle most of it. Open a file in full only when targeted
evidence left the purpose genuinely unclear, and never read a secret file's values.

### 5. Render the tree

Use `├──` for every entry with a sibling below it, `└──` for the last, `│` for a
continuing parent branch, a trailing `/` on directories, and `#` for the description.
Preserve the real nesting. Example:

```text
example-app/
├── src/                        # Application source code.
│   ├── components/             # Reusable UI components.
│   │   ├── Header.tsx          # Application header and primary navigation.
│   │   └── Footer.tsx          # Shared footer.
│   ├── services/               # Outbound API communication.
│   └── main.tsx                # Application entry point.
├── .env.example                # Example environment variables; no real values.
└── package.json                # Metadata, dependencies and scripts.
```

Optionally open with a short evidence-backed header — project, type, main technologies,
likely entry point. Omit any line you cannot support, and never infer a technology from
the project's name.

### 6. Report what you left out

State the exclusions in one line ("dependency directories, build output, caches and Git
internals excluded"). Where you truncated, say so at the branch, using `...` to mean
*content exists but is not shown* — never to mean empty. Then offer the next step:
expand a named directory, or go deeper on one.

## Descriptions

- Concise and specific: `# Retry and backoff policy for outbound HTTP calls`, not
  `# Utility functions`.
- Name the responsibility, not the contents, when the responsibility is knowable.
- Say what makes the element distinctive: which layer, which consumer, which lifecycle.
- Do not restate the path in different words. `src/utils/` described as "utility
  source directory" has told the reader nothing.
- Do not grade the code. This skill maps what exists; `software-architect` judges it.
- When the purpose cannot be established, write
  `# Purpose unclear from available evidence.` That is a correct output, not a failure.

## Read-only by default

Inspecting and describing must change nothing: no files created, moved, renamed or
deleted, no dependencies installed, no formatting run, no documentation rewritten.

Writing the tree to a file happens only because the user asked for it, and then it is
one file at a destination you have confirmed. Anything else the user asks to change is a
different task, with its own authorization — see `safe-git` and `minimal-changes`.

## Secrets

Naming a file is not exposing it. Describe a secret-bearing file by role and stop:

```text
.env                           # Local environment values; contents not displayed.
.env.example                   # Required variable names, with placeholder values.
```

Never print API keys, tokens, passwords, private keys or connection strings, even when
the file is small and even when it would make the description better. If a directory
looks like it exists to hold credentials, describe the directory and move on.

## Interaction with other skills

- `understand-before-acting` — gathers context in order to change something, and stops
  when it knows enough to act. This skill gathers context in order to **explain**, and
  its output is the deliverable.
- `how` — explains behavior, flows and execution paths. This skill explains **layout**:
  what lives where. A tree is the starting point for a `how` explanation, not a
  substitute for it.
- `software-architect` — judges boundaries and coupling. This skill records what the
  boundaries currently are and must not rank them.
- `follow-project-conventions` — turns the layout into rules for new code. This skill
  reports the layout.
- `why` — recovers the history behind a surprising name or directory. This skill reports
  the name.
- `raulmoracode-mode` — may select this skill for orientation or documentation work, not
  for every request.
- `no-made-up-results` — the prohibition this skill's core rule enforces: an invented
  description is a fabricated finding about a file you did not read.
- `security-first` — owns the full secret-handling policy; the rule above is its
  application here.
- `dont-f-my-tokens` — owns the inspection budget; describing 300 files exhaustively is
  the failure this skill most often commits.
- `minimal-changes` — owns write scope when the user asks for the tree to be saved.

## Anti-patterns

- Describing a directory you never listed, from its name alone.
- Enumerating `node_modules`, build output or caches, then describing them.
- A tree where every description is a restatement of the path.
- Emitting the eight file names from an example instead of the project's real ones.
- Using `...` under a directory that is actually empty.
- Flattening nesting to keep the alignment tidy.
- Reading `.env` to describe it better.
- Writing a `STRUCTURE.md` nobody asked for, then reporting the tree as a side effect.
- Presenting an inference as an observation in the header ("Type: React app" for a
  directory that merely contains JSX).
- Describing all 300 files when asked to orient, and describing none of them when asked
  for the whole tree.

## Definition of done

The root and scope are named and justified; every listed folder and file carries a `#`
description grounded in something you actually inspected; anything you could not
establish says so rather than guessing; exclusions and truncations are reported in one
line each; no secret value appears anywhere in the output; and nothing in the repository
was modified.
