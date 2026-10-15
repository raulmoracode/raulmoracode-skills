# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 35 agent-behavior skills (all at `1.0.0`), organized in seven categories:
  - **Orchestration** — `raulmoracode-mode` (entry point, task classification, skill
    selection), with a `references/skill-selection.md` routing table.
  - **Understanding and planning** — `understand-before-acting`,
    `plan-before-coding`, `research-first`, `read-the-f-docs`,
    `follow-project-conventions`, `how-was-last-night`, `blast-radius`, `how`, `why`.
  - **Personas** — `software-architect`, `software-engineer`.
  - **Behavior, autonomy and efficiency** — `dont-dance-for-me`, `dont-f-my-tokens`,
    `subagent-task-as-crazy`, `dont-ask-shit`, `show-your-work`, `simplify`.
  - **Development and code quality** — `code`, `minimal-changes`, `debug-properly`,
    `security-first`, `mom-always-say-the-same`, `unslop`.
  - **Testing, verification and review** — `dad-always-say-the-same`,
    `test-before-finishing`, `break-the-edge`, `review-your-work`,
    `no-made-up-results`, `verify-before-claiming`, `clear-final-report`.
  - **Git and repository** — `safe-git`, `git-branch`, `git-pr`, `git-issues`.
- 15 `references/` files for lookup material (skill-selection, discovery questions,
  recovery commands, impact surfaces, architecture decision criteria, threat checklist,
  slop catalog, test quality, edge catalog, review passes, severity guide, evidence
  standards, report templates, PR template, issue templates).

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
