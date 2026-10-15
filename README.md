# raulmoracode-skills

A central catalog of skills for **OpenCode** (v2). The catalog is served as
static files from GitHub Pages and consumed natively by OpenCode over HTTP — no
package, no install step, no build tooling for consumers.

## Catalog URL

```
https://raulmoracode.github.io/raulmoracode-skills/
```

## How OpenCode consumes it

Add the base URL to the `skills` array in your OpenCode configuration
(`opencode.json` or `opencode.jsonc`):

```json
{
  "skills": ["https://raulmoracode.github.io/raulmoracode-skills/"]
}
```

OpenCode then:

1. Fetches `GET <base>/index.json`.
2. Downloads `GET <base>/<name>/<file>` for every file listed for each skill
   (same origin, safe relative paths only).
3. Caches the skills locally; a skill is only re-downloaded when its `version`
   changes.
4. Refreshes on `opencode reload` or restart.

## Skills

| Skill              | Version | What it does                                                                     |
| ------------------ | ------- | -------------------------------------------------------------------------------- |
| `frontend-design`  | 1.0.0   | High-quality frontend interface design, implementation and review guidance.      |
| `code-review`      | 1.0.0   | Severity-prioritized code review for correctness, security and maintainability.  |
| `create-component` | 1.0.0   | Convention-first creation of reusable components, including tests and docs.      |

## Repository structure

```
.
├── index.json                  # Catalog manifest consumed by OpenCode
├── skills/
│   ├── frontend-design/
│   │   ├── frontend-design.md          # Entry markdown (frontmatter + content)
│   │   └── references/review-checklist.md
│   ├── code-review/
│   │   ├── code-review.md
│   │   └── references/severity-guide.md
│   └── create-component/
│       ├── create-component.md
│       └── references/discovery-questions.md
├── scripts/
│   ├── validate.mjs            # Catalog validation (zero dependencies)
│   ├── build-site.mjs          # Builds _site/ for GitHub Pages
│   └── check-version-bump.mjs  # PR guard: changed skill => version bump
└── .github/workflows/
    ├── deploy.yml              # Validate + build + deploy to Pages on push to main
    └── validate.yml            # PR validation + version-bump guard
```

## Catalog format

`index.json` is the whole contract:

```json
{
  "skills": [
    {
      "name": "example-skill",
      "version": "1.0.0",
      "files": ["example-skill.md", "references/notes.md"]
    }
  ]
}
```

Rules (enforced by `scripts/validate.mjs`):

- The top level is exactly `{ "skills": [ ... ] }` — no other keys.
- `name` is kebab-case (`/^[a-z0-9]+(-[a-z0-9]+)*$/`).
- `version` is a non-empty string; use semver. **Any content change must bump
  it**, or OpenCode will keep serving the cached copy.
- `files` lists every file that belongs to the skill, as safe relative paths.
  It must include `<name>.md` (or `SKILL.md`); the skill ID derives from that
  filename.
- Each entry markdown starts with YAML frontmatter containing `name` and
  `description` (at most 1024 characters).

## Adding or updating a skill

1. Create or edit `skills/<name>/<name>.md` (plus optional reference files).
2. Update `index.json`: add or edit the entry and **bump its `version`**.
3. Run `node scripts/validate.mjs` locally and fix anything it reports.
4. Open a pull request. CI runs the same validation plus a version-bump guard
   that fails if a skill changed without a version bump.
5. Merge to `main`. The deploy workflow validates, builds `_site/` and publishes
   it to GitHub Pages automatically.
6. Consumers run `opencode reload` (or restart OpenCode) to pull the new
   version.

## Local commands

```sh
node scripts/validate.mjs                    # validate the catalog
node scripts/build-site.mjs                  # build _site/ exactly as deployed
python3 -m http.server 8000 --directory _site  # preview the deployed site
```

The scripts are plain Node 24 ESM with zero dependencies.

## License

MIT — see [LICENSE](./LICENSE).
