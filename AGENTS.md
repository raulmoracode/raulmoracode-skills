# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

The central skills catalog consumed natively by OpenCode v2 over HTTP from
GitHub Pages (<https://raulmoracode.github.io/raulmoracode-skills/>). It is a
static-files repository: Markdown skills plus `index.json`, validated and
published by zero-dependency Node scripts.

## Repository structure

- `index.json` — the catalog manifest; the only contract OpenCode reads.
- `skills/<name>/<name>.md` — skill entry markdown with YAML frontmatter
  (`name`, `description`); optional `skills/<name>/references/*.md` files.
- `scripts/validate.mjs` — validates the whole catalog.
- `scripts/build-site.mjs` — builds `_site/` exactly as Pages serves it.
- `scripts/check-version-bump.mjs` — PR guard comparing against `origin/<base>`.
- `.github/workflows/{deploy,validate}.yml` — Pages deploy and PR checks.

## Hard rules

1. **Mandatory version bump.** Any change to a file under `skills/<name>/`
   requires bumping that skill's `version` in `index.json`. OpenCode only
   re-downloads a skill when its version changes; without a bump, consumers
   silently keep stale content. CI fails otherwise.
2. **Keep `index.json` in sync.** Every file on disk that belongs to a skill
   must be listed in `files`; the list must include `<name>.md` (the entry
   markdown). Do not add keys to `index.json` beyond
   `name` / `version` / `files` — OpenCode v2 expects exactly that shape.
3. **Zero dependencies in scripts.** `scripts/*.mjs` use only Node built-ins
   and run on Node 24 with `node scripts/<file>.mjs`. Do not add a
   `package.json`, npm packages, or build steps.
4. **Safe relative paths only** in `files`: no absolute paths, no `..`, no
   backslashes, no `?` or `#`. The same paths are copied verbatim into
   `_site/` and fetched by OpenCode.
5. **Frontmatter is required** on each entry markdown: `name` (must equal the
   skill name) and a third-person `description` of at most 1024 characters
   describing what the skill does and when to use it.
6. **Support files must be linked from the skill body.** OpenCode does not
   auto-load supporting files — for the flat `<name>.md` form it does not even
   list them — so every file in `files` beyond the entry markdown must be named
   by its relative path in the skill body, at the point where it is needed.
   Each skill also needs an `## Interaction with other skills` section naming
   real sibling skills, so a rename cannot leave a dangling reference behind.
7. **No duplicated instructions.** A shared rule belongs in one owning skill;
   the others point at it. `scripts/validate.mjs` fails on a long prose line or
   bullet repeated across skills, which is how shared guidance drifts.

## Before committing

Run:

```sh
node scripts/validate.mjs && node scripts/build-site.mjs
```

Both must pass. `_site/` is gitignored and never committed.

## Commits and PRs

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, …), one logical
  change per commit.
- New skills: `feat: add <skill-name> skill` (remember the `index.json` entry).
- Content updates: bump the version in the same commit as the content change,
  e.g. `feat: update <skill-name> skill to 1.0.1`.
- Workflow changes: verify the version-bump guard still matches PR behavior.

## Deploy flow

Push to `main` → `deploy.yml` runs validation, builds `_site/`, deploys to
GitHub Pages. No manual publishing step; merged is shipped (after Pages
finishes, users need `opencode reload` to refresh their cache).
