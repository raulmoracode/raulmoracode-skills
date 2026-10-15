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

36 skills, organized in seven categories. `raulmoracode-mode` is the entry point; the
rest own one responsibility each.

| Skill | Version | Category | What it does |
| --- | --- | --- | --- |
| `raulmoracode-mode` | 1.0.1 | Orchestration +1 ref | Central orchestrator for AI-assisted work |
| `understand-before-acting` | 1.0.1 | Understanding and planning | Investigates the environment before any change is made |
| `plan-before-coding` | 1.0.0 | Understanding and planning | Produces a practical implementation plan before non-trivial code is written |
| `research-first` | 1.0.0 | Understanding and planning | Answers open questions with evidence before a decision is made |
| `read-the-f-docs` | 1.0.0 | Understanding and planning | Consults authoritative documentation for a specific technology at a specific version |
| `follow-project-conventions` | 1.0.1 | Understanding and planning +1 ref | Matches the way an existing project already does things |
| `how-was-last-night` | 1.0.1 | Understanding and planning +1 ref | Reconstructs context from previous work by reading version-control and repository artifacts |
| `blast-radius` | 1.0.0 | Understanding and planning +1 ref | Evaluates the forward-looking impact of a proposed change before and during it |
| `project-structure` | 1.0.0 | Understanding and planning +2 ref | Reads the project it is in and produces an annotated directory tree |
| `how` | 1.0.1 | Understanding and planning | Explains how a system, component or process works |
| `why` | 1.0.1 | Understanding and planning | Investigates why a decision, implementation or behavior exists |
| `software-architect` | 1.0.1 | Personas +1 ref | Evaluates system design and architectural decisions before they are built |
| `software-engineer` | 1.0.1 | Personas | Practical working posture for day-to-day engineering |
| `dont-dance-for-me` | 1.0.1 | Behavior and efficiency | Agrees with nobody by default |
| `dont-f-my-tokens` | 1.0.1 | Behavior and efficiency | Spends tokens, time and tool calls deliberately while working |
| `subagent-task-as-crazy` | 1.0.1 | Behavior and efficiency | Runs independent parts of a task in parallel with subagents instead of one at a time |
| `dont-ask-shit` | 1.0.0 | Behavior and efficiency | Investigates and infers before asking, and asks only when a wrong guess would be expensive |
| `show-your-work` | 1.0.0 | Behavior and efficiency | Makes important decisions, assumptions, findings and verification results visible while the work happens |
| `simplify` | 1.0.0 | Behavior and efficiency | Removes unnecessary complexity from the solution and from the way the solution is reached |
| `code` | 1.0.0 | Development and code quality | Writes implementations that are correct, readable, maintainable and secure |
| `minimal-changes` | 1.0.0 | Development and code quality | Keeps a change limited to what the request actually requires |
| `debug-properly` | 1.0.0 | Development and code quality | Diagnoses and fixes the root cause of a defect instead of its symptom |
| `security-first` | 1.0.0 | Development and code quality +1 ref | Folds security into the decisions a change makes, at a scale that matches the risk |
| `mom-always-say-the-same` | 1.0.0 | Development and code quality | Keeps code, comments, documentation, examples and configuration telling the same story |
| `unslop` | 1.0.0 | Development and code quality +1 ref | Detects and removes low-quality AI-generated code and prose |
| `dad-always-say-the-same` | 1.0.0 | Testing and verification +1 ref | Designs tests that are useful, deterministic and maintainable |
| `test-before-finishing` | 1.0.0 | Testing and verification | Runs the checks that apply to a change before declaring the work done, and reports honestly what executed |
| `break-the-edge` | 1.0.0 | Testing and verification +1 ref | Hunts the edge cases, unusual inputs and failure conditions that could break a change |
| `review-your-work` | 1.0.0 | Testing and verification +2 ref | Reviews the changes you just made before treating the task as finished |
| `no-made-up-results` | 1.0.0 | Testing and verification | Forbids fabricating evidence |
| `verify-before-claiming` | 1.0.1 | Testing and verification +1 ref | Sets the evidence standard a claim must clear before it is stated |
| `clear-final-report` | 1.0.1 | Testing and verification +1 ref | Produces the final report the user reads |
| `safe-git` | 1.0.0 | Git and repository | Protects repository state and uncommitted work during any Git operation |
| `git-branch` | 1.0.0 | Git and repository | Manages Git branches according to the repository's own workflow |
| `git-pr` | 1.0.0 | Git and repository +1 ref | Prepares, opens and manages pull requests |
| `git-issues` | 1.0.1 | Git and repository +1 ref | Creates, triages and updates repository issues when explicitly requested |

`+N ref` marks a skill that ships `references/` lookup files next to its entry markdown.
The "What it does" column is abbreviated; the full `description` in each skill's
frontmatter is the authoritative text and the activation surface.

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
│   └── check-version-bump.mjs  # PR guard: changed skill => version bump
└── .github/workflows/
    ├── deploy.yml              # Validate + build + deploy to Pages on push to main
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
- No directory under `skills/` is missing from `index.json`.
- Every listed support file is named by its relative path somewhere in the skill
  body. OpenCode does not auto-load support files, so an unreferenced one is dead
  weight the agent will never read.
- The entry markdown has an `## Interaction with other skills` section, and the
  sibling names it mentions exist in the catalog. This catches references to
  renamed or retired skills.
- No long prose block is duplicated across skills, which catches the copy-paste
  drift that shared guidance is prone to.

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
