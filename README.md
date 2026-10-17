# raulmoracode-skills

A central catalog of skills for **OpenCode** (v2). The catalog is served as
static files from GitHub Pages and consumed natively by OpenCode over HTTP — no
package, no install step, no build tooling for consumers.

## Catalog URL

```
https://raulmoracode.github.io/raulmoracode-skills/
```

The default URL always serves the latest catalog. The same site also exposes
`catalog-version.json`, whose exact shape is:

```json
{
  "version": "1.0.2"
}
```

The catalog version is a semver identifier for the published catalog as a
whole. Bump it when the catalog contract, skill inventory, or published layout
changes. A skill-only content change keeps the catalog version stable and
bumps that skill's `version` in `index.json` instead. Consumers can record the
catalog version alongside their generated configuration to identify the exact
catalog they resolved from the default URL; release tags use the same
`v<catalog-version>` identifier for repository-level pinning.

The same site also serves `catalogue.html`: a browsable page that lists every
skill with its name, version and description. It is generated during the site
build from `index.json` and the frontmatter descriptions, so it cannot drift
from the published catalog. The `raulmoracode-catalogue` skill opens it in the
browser.

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

65 skills, organized in nine categories. `raulmoracode-mode` is the entry point; the
rest own one responsibility each.

| Skill | Version | Category | What it does |
| --- | --- | --- | --- |
| `raulmoracode-mode` | 1.0.28 | Orchestration +1 ref | Central orchestrator for AI-assisted work |
| `raulmoracode-catalogue` | 1.0.0 | Orchestration | Opens the published catalogue page listing every skill, with install and reload instructions |
| `understand-before-acting` | 1.0.2 | Understanding and planning | Investigates the environment before any change is made |
| `plan-before-coding` | 1.0.2 | Understanding and planning | Produces a practical implementation plan before non-trivial code is written |
| `research-first` | 1.0.2 | Understanding and planning | Answers open questions with evidence before a decision is made |
| `read-the-f-docs` | 1.0.1 | Understanding and planning | Consults authoritative documentation for a specific technology at a specific version |
| `follow-project-conventions` | 1.0.2 | Understanding and planning +1 ref | Matches the way an existing project already does things |
| `how-was-last-night` | 1.0.2 | Understanding and planning +1 ref | Reconstructs context from previous work by reading version-control and repository artifacts |
| `blast-radius` | 1.0.2 | Understanding and planning +1 ref | Evaluates the forward-looking impact of a proposed change before and during it |
| `project-structure` | 1.0.1 | Understanding and planning +2 ref | Reads the project it is in and produces an annotated directory tree |
| `how` | 1.0.3 | Understanding and planning | Explains how a system, component or process works |
| `why` | 1.0.2 | Understanding and planning | Investigates why a decision, implementation or behavior exists |
| `software-architect` | 1.0.2 | Personas +1 ref | Evaluates system design and architectural decisions before they are built |
| `software-engineer` | 1.0.4 | Personas | Practical working posture for day-to-day engineering |
| `dont-dance-for-me` | 1.0.2 | Behavior and efficiency | Agrees with nobody by default |
| `dont-f-my-tokens` | 1.0.2 | Behavior and efficiency | Spends tokens, time and tool calls deliberately while working |
| `subagent-task-as-crazy` | 1.0.2 | Behavior and efficiency | Runs independent parts of a task in parallel with subagents instead of one at a time |
| `dont-ask-shit` | 1.0.1 | Behavior and efficiency | Investigates and infers before asking, and asks only when a wrong guess would be expensive |
| `show-your-work` | 1.0.1 | Behavior and efficiency | Makes important decisions, assumptions, findings and verification results visible while the work happens |
| `simplify` | 1.0.1 | Behavior and efficiency | Removes unnecessary complexity from the solution and from the way the solution is reached |
| `code` | 1.0.2 | Development and code quality | Writes implementations that are correct, readable, maintainable and secure |
| `minimal-changes` | 1.0.1 | Development and code quality | Keeps a change limited to what the request actually requires |
| `debug-properly` | 1.0.5 | Development and code quality | Diagnoses and fixes the root cause of a defect instead of its symptom |
| `security-first` | 1.0.4 | Development and code quality +1 ref | Folds security into the decisions a change makes, at a scale that matches the risk |
| `mom-always-say-the-same` | 1.0.1 | Development and code quality | Keeps code, comments, documentation, examples and configuration telling the same story |
| `unslop` | 1.0.1 | Development and code quality +1 ref | Detects and removes low-quality AI-generated code and prose |
| `dad-always-say-the-same` | 1.0.2 | Testing and verification +1 ref | Designs tests that are useful, deterministic and maintainable |
| `test-before-finishing` | 1.0.2 | Testing and verification | Runs the checks that apply to a change before declaring the work done, and reports honestly what executed |
| `break-the-edge` | 1.0.1 | Testing and verification +1 ref | Hunts the edge cases, unusual inputs and failure conditions that could break a change |
| `review-your-work` | 1.0.1 | Testing and verification +2 ref | Reviews the changes you just made before treating the task as finished |
| `no-made-up-results` | 1.0.1 | Testing and verification | Forbids fabricating evidence |
| `verify-before-claiming` | 1.0.2 | Testing and verification +1 ref | Sets the evidence standard a claim must clear before it is stated |
| `clear-final-report` | 1.0.2 | Testing and verification +1 ref | Produces the final report the user reads |
| `safe-git` | 1.0.1 | Git and repository | Protects repository state and uncommitted work during any Git operation |
| `git-branch` | 1.0.3 | Git and repository | Manages Git branches; every branch it creates uses a fixed prefix table |
| `git-pr` | 1.0.1 | Git and repository +1 ref | Prepares, opens and manages pull requests |
| `git-issues` | 1.0.2 | Git and repository +1 ref | Creates, triages and updates repository issues when explicitly requested |
| `define-the-outcome` | 1.0.1 | Understanding and planning | Turns an ambiguous request into a precise, testable outcome before implementation |
| `contract-and-migration` | 1.0.4 | Understanding and planning | Guides safe evolution of API, CLI, configuration, schema and persisted contracts |
| `skill-evaluation` | 1.0.0 | Orchestration | Evaluates catalog routing and composition with representative tasks and evidence |
| `ci-cd` | 1.0.4 | Engineering domains | Designs, reviews and troubleshoots provider-agnostic CI/CD workflows |
| `git-tree` | 1.0.0 | Git and repository | Inspects all local and remote branches and groups them into a tree by naming prefixes |
| `low-level-engineering` | 1.0.1 | Engineering domains | Investigates how software executes through memory, CPU, ABI, compilers and runtimes |
| `database-engineering` | 1.0.1 | Engineering domains | Analyzes schemas, queries, migrations, indexes, transactions, locks and integrity |
| `api-contracts` | 1.0.2 | Engineering domains | Designs and verifies HTTP, event, schema, CLI and service contracts |
| `backward-compatibility` | 1.0.0 | Engineering domains | Compares current and proposed behavior across APIs, configuration, schemas and data formats |
| `dependency-audit` | 1.0.0 | Engineering domains | Reviews direct and transitive dependencies: versions, licenses, vulnerabilities, provenance |
| `observability` | 1.0.1 | Engineering domains | Designs and uses structured logs, metrics, traces, correlation identifiers and alerts |
| `configuration-management` | 1.0.2 | Engineering domains | Manages configuration sources, defaults, validation, precedence and secret references |
| `release-engineering` | 1.0.2 | Engineering domains | Plans and executes versioned releases, artifacts, tags, publication and rollback |
| `performance-engineering` | 1.0.2 | Engineering domains | Measures and improves performance with profiling, benchmarks and regression checks |
| `frontend-engineering` | 1.0.3 | Engineering domains | Handles frontend state, rendering, events, forms, loading and error states and API integration |
| `browser-engineering` | 1.0.1 | Engineering domains | Analyzes the DOM, event loop, rendering pipeline, workers, storage and permissions |
| `web-performance` | 1.0.0 | Engineering domains | Measures and improves Core Web Vitals, bundles, caching and network waterfalls |
| `accessibility-engineering` | 1.0.0 | Engineering domains | Implements and verifies semantic HTML, keyboard navigation, focus, ARIA and screen-reader behavior |
| `low-level-engineer` | 1.0.0 | Personas | Applies a systems-level perspective to memory, CPU, ABI, compilers, runtimes and operating systems |
| `database-engineer` | 1.0.0 | Personas | Applies database expertise to modeling, SQL, transactions, indexes, locks and migrations |
| `performance-engineer` | 1.0.0 | Personas | Focuses on measurement, profiling, benchmarks, latency, throughput and regressions |
| `release-engineer` | 1.0.0 | Personas | Focuses on versions, changelogs, artifacts, tags, publishing and reproducibility |
| `platform-engineer` | 1.0.1 | Personas | Focuses on CI/CD, environments, developer tooling and development infrastructure |
| `project-manager` | 1.0.0 | Personas | Organizes objectives, scope, priorities, dependencies, risks and blockers |
| `trace-the-call` | 1.0.0 | Utilities | Follows execution from an entry point through calls, events, transformations and side effects |
| `check-the-boundary` | 1.0.0 | Utilities | Reviews contracts and failure behavior at module, process, service and database boundaries |
| `inspect-the-artifact` | 1.0.0 | Utilities | Inspects the contents, metadata and reproducibility of builds, packages, images and bundles |
| `compare-environments` | 1.0.0 | Utilities | Compares local, CI, staging and production versions, configuration and permissions |

`+N ref` marks a skill that ships `references/` lookup files next to its entry markdown.
The "What it does" column is abbreviated; the full `description` in each skill's
frontmatter is the authoritative text and the activation surface.

## Composition model

`raulmoracode-mode` chooses one primary specialist for a request and may add zero to two
justified support skills. Composition is operationally shallow: support skills do not load
other support skills, the maximum composition depth is one, and related skills are not
loaded merely because they are conceptually adjacent. Each entry declares one layer-1
role — `orchestrator`, `specialist`, `support`, or `policy` — plus direct invocation,
support budget, depth, and explicit operational targets in its compact `## Composition`
metadata. The `## Interaction with other skills` section remains explanatory only.

## Repository structure

```
.
├── index.json                  # Catalog manifest consumed by OpenCode
├── skills/
│   └── <skill-name>/
│       ├── <skill-name>.md     # Entry markdown (frontmatter + content)
│       └── references/         # Optional lookup files, loaded on demand
├── scripts/
│   ├── validate.mjs            # Catalog validation (zero dependencies)
│   ├── build-site.mjs          # Builds _site/ for GitHub Pages
│   ├── build-catalogue.mjs     # Generates _site/catalogue.html from the catalog
│   └── check-version-bump.mjs  # Guard: a changed skill must bump its version
├── Dockerfile                  # Builds and serves the catalog image
└── docker-compose.yml          # Runs a redundant local catalog service
└── .github/workflows/
    ├── deploy.yml              # Validate + version guard + build + deploy on push
    └── validate.yml            # PR validation + version-bump guard
```

Most skills are a single file. A `references/` directory exists only where the detail is
a lookup table or worked examples that would bloat the entry markdown. A single-file
skill is a deliberate outcome, not an unfinished one.

> **Supporting files are not loaded automatically.** OpenCode advertises a skill by its
> `name`, `description` and path-derived ID; the agent then loads the body with the
> `skill` tool. The body must name any support file it wants read — every reference in
> this catalog is pointed at by an explicit relative path in its skill's markdown.

## Writing a skill for this catalog

- **The name is the ID.** OpenCode derives the skill ID from the path
> (`skills/<name>/<name>.md` -> `git-release` -> ID `git-release`). Frontmatter `name`
> must equal the catalog name.
- **The description is the activation surface.** At each model step the model sees only
> the ID, name and description — not the body. Write what the skill does, when to use it,
> and the words a user would actually type. Descriptions of adjacent skills must be
> clearly distinguishable, because that text is the only thing the model uses to choose.
- **Each skill owns one responsibility.** Overlapping topics are resolved with explicit
> ownership, and each skill names the siblings that own what it does not. Restating a
> sibling's rules is a defect: the copies drift.
- **Do not invent platform capabilities.** OpenCode exposes no lifecycle hooks to skills,
> so no skill can promise to run automatically after a session reset, and a script's
> existence does not mean the platform runs it. State such limits plainly instead.

## Catalog format

`index.json` remains the whole external OpenCode contract. Composition metadata lives in
the skill markdowns and is validation infrastructure for the catalog; it does not add
keys to `index.json`:

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
- No directory under `skills/` is missing from `index.json`.
- Every listed support file is named by its relative path somewhere in the skill
  body. OpenCode does not auto-load support files, so an unreferenced one is dead
  weight the agent will never read.
- Every skill has a `## Composition` section with parseable role, invocation, budget,
  depth and operational-reference metadata. The normal check is strict; the explicit
  `node scripts/validate.mjs --strict-composition` form is retained as a clear CI and
  local-validation command.
- The entry markdown has an `## Interaction with other skills` section, and the
  sibling names it mentions exist in the catalog. This catches references to
  renamed or retired skills.
- No long prose block is duplicated across skills, which catches the copy-paste
  drift that shared guidance is prone to.

## Adding or updating a skill

1. Create or edit `skills/<name>/<name>.md` (plus optional reference files), including
   its compact `## Composition` contract.
2. Update `index.json`: add or edit the entry and **bump its `version`**.
3. Run `node scripts/validate.mjs` locally and fix anything it reports.
4. Open a pull request. CI runs the same validation plus a version-bump guard
   that fails if a skill changed without a version bump.
5. Merge to `main`. The deploy workflow validates, runs the version-bump guard
   again, builds `_site/` and publishes it to GitHub Pages automatically. The
   guard runs on both paths, so a commit pushed straight to `main` is checked
   too — it would stop the catalog from being republished rather than shipping a
   changed skill under its old version.
6. Consumers run `opencode reload` (or restart OpenCode) to pull the new
   version.

## Local commands

```sh
node scripts/validate.mjs                    # validate the catalog
node scripts/validate.mjs --strict-composition # explicit strict composition validation
node scripts/build-site.mjs                  # build _site/ exactly as deployed
node scripts/build-catalogue.mjs             # regenerate only _site/catalogue.html
python3 -m http.server 8000 --directory _site  # preview the deployed site
docker compose up --build -d                  # run the catalog locally on port 8080
```

The local Docker service serves the same `_site/` output deployed to GitHub Pages.
It validates the catalog and builds the site inside the image, then serves the
static files with Nginx. Set `SKILLS_SITE_PORT` to use another host port, for
example `SKILLS_SITE_PORT=8081 docker compose up --build -d`.

The scripts are plain Node 24 ESM with zero dependencies.

## License

MIT — see [LICENSE](./LICENSE).
