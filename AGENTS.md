# AGENTS.md

Reference for this repository. It describes what lives here, how the published artifact is
assembled, and the constraints that artifact must satisfy. How to work — branches, commits,
pull requests, reviews — belongs to the skills catalog this repository publishes and is not
repeated here.

## What this repo is

The central skills catalog consumed natively by OpenCode v2 over HTTP from GitHub Pages
(<https://raulmoracode.github.io/raulmoracode-skills/>). It is a static-files repository:
Markdown skills plus `index.json` and the served `catalog-version.json`, validated and
published by zero-dependency Node scripts.

## Repository structure

- `index.json` — the catalog manifest; the only contract OpenCode reads.
- `catalog-version.json` — the published catalog version, served next to `index.json`.
- `skills/<name>/<name>.md` — skill entry markdown with YAML frontmatter
  (`name`, `description`); optional `skills/<name>/references/*.md` files.
- `.opencode/opencode.json` — project configuration that connects this checkout to the
  published catalog over HTTPS.
- `scripts/validate.mjs` — validates the whole catalog.
- `scripts/build-site.mjs` — builds `_site/` exactly as Pages serves it.
- `scripts/build-catalogue.mjs` — generates `catalogue.html` during the site build.
- `scripts/check-version-bump.mjs` — version-bump guard; compares against a base branch
  (`BASE_REF`) or an explicit commit (`BASE_SHA`).
- `.github/workflows/{deploy,validate}.yml` — Pages deploy and CI checks. Both run the
  version-bump guard.

## Connecting to the catalog

`.opencode/opencode.json` registers the published catalog for this checkout:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "skills": ["https://raulmoracode.github.io/raulmoracode-skills/"]
}
```

The value is the catalog **base URL**, not a file. OpenCode fetches `<base>/index.json`,
then `<base>/<name>/<file>` for every skill, and caches each one until its `version`
changes. The trailing `/` is required so relative paths resolve against the catalog root.
To test an unpublished build, point the same entry at the local `_site/` directory instead.

## Catalog invariants

Properties of the published artifact. `scripts/validate.mjs` enforces all of them.

1. **Version bump.** Any change to a file under `skills/<name>/` requires bumping that
   skill's `version` in `index.json`. OpenCode only re-downloads a skill when its version
   changes; without a bump, consumers keep serving the cached copy.
2. **`index.json` in sync.** Every file on disk that belongs to a skill must be listed in
   `files`, and the list must include `<name>.md` (the entry markdown). No keys beyond
   `name` / `version` / `files` — OpenCode v2 expects exactly that shape.
3. **Zero dependencies.** `scripts/*.mjs` use only Node built-ins and run on Node 24 with
   `node scripts/<file>.mjs`. There is no `package.json`, no npm package and no build step.
4. **Safe relative paths only** in `files`: no absolute paths, no `..`, no backslashes, no
   `?` or `#`. The same paths are copied verbatim into `_site/` and fetched by OpenCode.
5. **Frontmatter.** Each entry markdown carries `name` (equal to the skill name) and a
   third-person `description` of at most 1024 characters describing what the skill does
   and when to use it.
6. **Support files are linked from the skill body.** OpenCode does not auto-load them — for
   the flat `<name>.md` form it does not even list them — so every file in `files` beyond
   the entry markdown is named by its relative path in the body, at the point where it is
   needed. Each skill also has an `## Interaction with other skills` section naming real
   sibling skills, so a rename cannot leave a dangling reference behind.
7. **No duplicated instructions.** A shared rule belongs to one owning skill; the others
   point at it. `scripts/validate.mjs` fails on a long prose line or bullet repeated across
   skills, which is how shared guidance drifts.

## Published artifact

`_site/` is what GitHub Pages serves: `index.json`, `catalog-version.json`,
`catalogue.html` and every skill file listed in the manifest. `scripts/build-site.mjs`
produces it; it is generated rather than stored in the repository. Consumers reach it over
HTTPS at the base URL above, and OpenCode's cache is keyed by skill version, so a content
change reaches them only after a bump and an `opencode reload`.
