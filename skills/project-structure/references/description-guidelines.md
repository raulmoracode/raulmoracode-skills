# Description guidelines

How to establish what a folder or file is for, and how to phrase it. Read this when a
description is not already obvious from the name, in an unfamiliar stack, or when you
notice yourself writing something vague.

## Where to look, cheapest first

Stop as soon as the purpose is settled. Most elements are settled in the first step or
two.

1. **The name, in the context of its siblings.** `src/routes/` beside `src/models/`
   needs no reading. This is evidence, not a guess, only when the surrounding structure
   agrees.
2. **The manifest and scripts.** `package.json` scripts, `Makefile` targets,
   `pyproject.toml` entry points, `Cargo.toml` bins, CI workflow steps — these name
   commands, which name responsibilities.
3. **Imports and references.** What imports this, and what it imports, fixes its layer.
   `git grep -n "<symbol>"` or a search for the module path answers "who uses it".
4. **The head of the file.** The first twenty lines usually carry the exported names,
   the module docstring, the class or route definitions.
5. **Targeted bodies.** A function signature, a decorator, a config key, a migration's
   `up`/`down`. Rarely the whole file.
6. **The file in full.** Only when the above left the purpose genuinely unclear, and
   never for a file that looks like it holds credentials.

## Evidence by kind of element

| The element is | Establish its purpose from |
| --- | --- |
| Entry point (`main.*`, `index.*`, `app.*`) | What it imports, constructs and starts; the manifest's `main`/`bin` |
| Router or route module | The paths it registers, the handlers it binds |
| Component | Its props/inputs, what it renders, where it is imported |
| Service or client module | The external system it talks to: base URLs, SDK it constructs |
| Model or schema | The table or collection it maps, its fields and relations |
| Migration | The schema change in `up`, and whether `down` is reversible |
| Config file | The keys it sets and the tool that reads it (`tsconfig`, `postcss`, `eslint`) |
| Build or bundler config | The tool, its entry and output paths, its plugins |
| Test directory | The framework, the layer under test (unit/integration/e2e), the fixtures |
| Fixtures or seed data | Which tests or commands consume them |
| Script | Its shebang, its CLI arguments, what `package.json` calls it from |
| Component library directory | Whether it is published or internal: `main`/`exports` in its manifest |
| Infrastructure or deployment | The platform it targets, read from file names and resource blocks |
| Documentation directory | What it documents, and whether it is generated |
| Static assets | What consumes them: a route, a build step, a template |
| Lockfile | The package manager, and that it is generated |

If two pieces of evidence disagree, report the one the runtime uses and note the
conflict — a README that describes a directory the code no longer uses is worth one
line.

## Phrasing

A description answers "why does this exist", not "what is in it". Aim for the sentence a
new maintainer needs, and nothing more.

Weak, and why:

- `# Utility functions.` — every directory claims this; it excludes nothing.
- `# Contains the components.` — restates the path.
- `# Configuration file.` — true of a hundred files, useful for none.
- `# Main application code.` — says nothing about what the application is.
- `# Types.` — which types, for whom.
- `# Helper for the thing.` — vague enough to be unfalsifiable.

Calibrated in place:

```text
├── api/                        # HTTP handlers grouped by resource; no business logic.
├── domain/                     # Entities and invariants; imports nothing from api/ or db/.
├── db/                         # Query layer and migrations; the only writer to Postgres.
├── jobs/                       # Scheduled workers, each idempotent and safe to re-run.
├── lib/retry.ts                # Exponential backoff with jitter; used by outbound calls.
├── lib/money.ts                # Integer-cent arithmetic; no floats anywhere in this file.
├── config/app.yaml             # Runtime settings read at boot; per-environment overrides.
├── scripts/seed.ts             # Loads fixture rows; run by `npm run seed` in dev only.
└── tests/contract/             # Pins request and response shapes against recorded fixtures.
```

The pattern: name the responsibility, the boundary it respects, or the constraint it
enforces. Anything true of most files in the project is not a description.

## Structure-specific notes

- **A directory's description covers the whole subtree**, so its children need less. Do
  not repeat the parent's sentence in every child.
- **Barrel and index files** (`index.ts`, `__init__.py`, `mod.rs`) re-export their
  directory. Say so, and do not enumerate what they re-export.
- **Near-identical siblings** — twenty route modules, thirty migrations — get one line
  with a count and a shared pattern, or an individual line each if the request is to
  document them. Not both.
- **Generated files** get `# Generated by <tool>; do not edit.` and no more.
- **Empty directories** get their intended purpose if the project states it, and
  `# Empty.` if it does not. Never `...`.
- **Language-agnostic:** describe what the code does, not what the language calls it. Do
  not explain what a class or a module is.

## When the purpose cannot be established

Write `# Purpose unclear from available evidence.` and move on. Add one clue when you
have a weak one, in the same line:

```text
├── legacy/importer.rb          # Purpose unclear; no references found and no tests.
├── data/snapshot-2019.bin      # Purpose unclear; binary, unreferenced, last modified 2019.
```

Do not soften it into a hedge that reads as knowledge ("appears to be some kind of
utility"). Do not resolve it by guessing from the extension. An honest gap is a finding
the reader can act on; a confident invention is a defect they will act on wrongly.

## Secret-bearing files

Describe by role, never by content, and never by reading it:

```text
├── .env                        # Local environment values; contents not displayed.
├── .env.example                # Required variable names with placeholder values.
├── secrets/                    # Deployment credentials; not read.
└── config/oauth-clients.json   # Client registrations; identifiers only, no secrets shown.
```

If a secret has already been seen in the output of a command — a key echoed in a log, a
token in a `.env` you opened by accident — do not repeat it in the tree, and say that you
saw one. `security-first` owns what to do next.
