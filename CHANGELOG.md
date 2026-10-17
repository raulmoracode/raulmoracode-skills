# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Reworked `raulmoracode-mode` to cut the task down first and then hand it to a single
  owning skill, and made routing cheap enough to do from the entry alone.
  - The request-shape routing table moved out of `references/skill-selection.md` and into
    the entry, so routing no longer requires a second read. The reference keeps the full
    inventory, risk tiers, uncertainty tiers and overlap pairs, and gains a section for
    what the table cannot decide.
  - Simplification is applied inline as the first step rather than by loading `simplify`
    on every task. `simplify` states that it is "a lens, not a phase" and should not be
    invoked per task, and loading it unconditionally is measurably more expensive.
  - One owning skill is now the default; a second is added only when listed risk
    conditions force it, and the orchestrator must name what it skips.
  - Measured: routing a task now costs the entry alone, ~2,300 tokens, against ~3,870 for
    the previous entry-plus-reference path and ~5,570 for loading `simplify`
    unconditionally. `raulmoracode-mode` bumped to `1.0.2`.
- Integrated `project-structure` into the skill graph so it is not an orphan. Every link
  is reciprocal: the entry already named six siblings, and each now names it back.
  - `raulmoracode-mode` — added to the interaction list, plus a routing row ("show me
    the project structure" / "what does each folder do"), two entries in the overlap
    table (`project-structure` vs `how`, and vs `understand-before-acting`), and an
    inventory line in `references/skill-selection.md`.
  - `understand-before-acting` — names it as the skill that produces a written map when
    the task needs one, as distinct from holding context in your head.
  - `how` — the map of what lives where, against `how`'s what happens there; a layout
    question starts from the tree, a behavior question from a trace.
  - `software-architect` — consumes the tree as evidence about current boundaries, and
    must not treat it as a verdict on them.
  - `follow-project-conventions` — the tree is the input when the layout has to be
    described rather than changed.
  - `why` — a surprising name in the map is usually the `why` question worth asking.
  - `software-engineer` — its routing table gains an orientation row pointing at
    `understand-before-acting` and `project-structure`.
- Fixed a cohesion gap found while integrating: `software-engineer` was the one skill no
  other entry pointed at. `raulmoracode-mode` now names it alongside `software-architect`.
  Every skill in the catalog is now referenced by at least one sibling.
- Versions: the six skills above are bumped to `1.0.1`; `software-engineer` to `1.0.2`.
- Note on reciprocity: 53% of the catalog's cross-references are one-way, which is the
  established convention — a skill points at the owner of a concern without requiring the
  owner to point back. Reciprocity was added for `project-structure` because those pairs
  are the genuinely confusable ones, not to symmetrize the graph.

### Fixed

- Corrected defects found in an adversarial read of all 50 catalog files. Eight skills
  were changed after the initial import and are bumped to `1.0.1`: `clear-final-report`,
  `verify-before-claiming`, `how-was-last-night`, `git-issues`, `dont-dance-for-me`,
  `dont-f-my-tokens`, `software-engineer` and `subagent-task-as-crazy`.
  - `clear-final-report` — the "what not to include" list was duplicated in both the
    entry and `references/report-templates.md`; the entry now owns it and the
    reference points at it.
  - `verify-before-claiming` — `references/evidence-standards.md` redefined the five
    evidence rungs the entry already defines; it now applies them instead.
  - `how-was-last-night` — `references/recovery-commands.md` offered an unquoted
    `git log --format=%h %ad %s` that the shell would split into four arguments, and
    repeated `revert` twice in a `--grep` pattern.
  - `git-issues` — the `safe-git` cross-reference routed branch work to itself,
    contradicting both `safe-git` and `git-branch`.
  - `dont-dance-for-me` — an "anti-pattern" bullet told the reader to do the thing the
    section exists to forbid.
  - `dont-f-my-tokens` — stated the don't-re-read rule twice in adjacent bullets and
    misrouted working-tree inspection to `safe-git`.
  - `software-engineer` — repeated one sentence in its intro and interaction section.
  - `subagent-task-as-crazy` — described `explore` and `general` as "two modes"; they
    are built-in agents.
  - `security-first` — `references/threat-checklist.md` described the checklist as
    having twelve surfaces when it has thirteen. Fixed before the initial import, so
    no bump was required.

### Added

- `catalog-version.json` (`1.0.1`) — a separately served semver identifier for the
  published catalog, preserving the strict OpenCode-compatible `index.json`
  shape while allowing consumers to record the catalog version they resolved.
- `project-structure` skill (`1.0.0`) — reads the project it is in and produces an
  annotated directory tree, with an inline `#` comment on every listed folder and file,
  drawn from evidence rather than from names. Read-only, excludes generated and vendored
  directories by default, controls depth on large repositories, and never prints secret
  values. Ships `references/tree-format.md` (root detection, read-only enumeration,
  exclusion policy, rendering and truncation) and `references/description-guidelines.md`
  (evidence sources per kind of element, phrasing calibration, and how to state an
  unknown purpose honestly).
- 36 agent-behavior skills, organized in seven categories:
  - **Orchestration** — `raulmoracode-mode` (entry point, task classification, skill
    selection), with a `references/skill-selection.md` routing table.
  - **Understanding and planning** — `understand-before-acting`,
    `plan-before-coding`, `research-first`, `read-the-f-docs`,
    `follow-project-conventions`, `how-was-last-night`, `blast-radius`,
    `project-structure`, `how`, `why`.
  - **Personas** — `software-architect`, `software-engineer`.
  - **Behavior, autonomy and efficiency** — `dont-dance-for-me`, `dont-f-my-tokens`,
    `subagent-task-as-crazy`, `dont-ask-shit`, `show-your-work`, `simplify`.
  - **Development and code quality** — `code`, `minimal-changes`, `debug-properly`,
    `security-first`, `mom-always-say-the-same`, `unslop`.
  - **Testing, verification and review** — `dad-always-say-the-same`,
    `test-before-finishing`, `break-the-edge`, `review-your-work`,
    `no-made-up-results`, `verify-before-claiming`, `clear-final-report`.
  - **Git and repository** — `safe-git`, `git-branch`, `git-pr`, `git-issues`.
- 17 `references/` files for lookup material (skill-selection, discovery questions,
  recovery commands, impact surfaces, tree format, description guidelines, architecture
  decision criteria, threat checklist, slop catalog, test quality, edge catalog, review
  passes, severity guide, evidence standards, report templates, PR template, issue
  templates).

- `git-tree` skill (`1.0.0`) — renders local and remote branches as a tree grouped by
  naming prefixes, distinct from commit ancestry.
- Wiring: `git-branch` (`1.0.2`) now names `git-tree` for the branch landscape, and
  `raulmoracode-mode` gains its routing row.

- `low-level-engineering` skill (`1.0.0`) — investigates execution below application
  code: memory, CPU, GPU, ABI, compilers, loaders and runtimes.
- Wiring: `debug-properly` (`1.0.2`) names it for causes below application code.

### Removed

- `frontend-design`, `code-review` and `create-component`. The catalog is now a
  single, coherent system of 35 agent-behavior skills instead of a mix of domain
  tutorials and behavioral skills.
  - The `code-review` review passes and severity guide were absorbed into
    `review-your-work`.
  - The `create-component` convention-discovery discipline was absorbed into
    `code` and `follow-project-conventions`.
  - The `frontend-design` visual-direction guidance has no equivalent in the new
    inventory and was **not** carried over. Accessibility, state handling and
    convention rules that were general engineering guidance were folded into `code`.

### Changed

- `README.md`: catalog table and repository structure updated to the 35-skill
  inventory.

## [1.0.0] - 2026-10-15

### Added

- Initial catalog published at
  <https://raulmoracode.github.io/raulmoracode-skills/>.
- `frontend-design` skill (1.0.0) — high-quality frontend interface design and
  implementation guidance, with a per-screen review checklist reference.
- `code-review` skill (1.0.0) — language-agnostic code review focused on
  correctness, security, maintainability and architecture, with a severity
  guide reference.
- `create-component` skill (1.0.0) — convention-first component creation with
  a discovery-questions reference.
- Catalog tooling: `scripts/validate.mjs`, `scripts/build-site.mjs` and
  `scripts/check-version-bump.mjs` (all zero-dependency Node ESM).
- GitHub Actions workflows: Pages deployment on `main` and PR validation with
  a mandatory version-bump guard.

[Unreleased]: https://github.com/raulmoracode/raulmoracode-skills/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/raulmoracode/raulmoracode-skills/releases/tag/v1.0.0
