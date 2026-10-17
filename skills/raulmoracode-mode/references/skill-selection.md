# Skill selection

The deep lookup for `raulmoracode-mode`. Routing for the common request shapes lives in
the entry's table, so that routing is cheap; read this file only when that table does not
decide, or when you need the full inventory, the risk tiers, or the pairs that get
confused.

## When the entry's table does not decide

Work from the shape of the request, not from a skill you already had in mind:

- **It spans several concerns at once.** Find the one that owns the *outcome*, load it,
  then add others only under the rules in the entry's step 3. Read "Working the pairs that
  overlap" below before loading two skills that sound similar.
- **It is a request to build something new that no skill names.** Start with
  `understand-before-acting`, then `software-engineer`, which routes onward from there.
- **It is really a question, not a task.** `how` if the answer is in the code, `why` if it
  is in the history, `research-first` if it is in the world, `read-the-f-docs` if it is in
  the documentation, `project-structure` if it is in the layout.
- **It is mostly a conversation.** Explaining, reviewing an idea, answering "what do you
  think" — do that directly. Not every request needs a skill, and loading one to have an
  opinion is the failure this catalog is most prone to.
- **None of it fits.** Say so and do the task. A wrong skill is worse than no skill.

## Conceptual interaction versus operational composition

The `## Interaction with other skills` section is conceptual: it names neighboring
responsibilities and ownership boundaries for readers. Those names do not cause a skill
to load and are not operational dependencies.

The `## Composition` section is operational: its compact metadata declares the skill's
role, whether it may be invoked directly, its support budget and depth, and the skills it
may compose. Only those declarations affect composition validation. A primary specialist
may load zero to two justified support skills; support skills must not compose further
support skills, and composition depth is at most one. Do not load a related skill merely
because it is relevant, and do not reload a skill already active.

## Risk tiers

Risk sets the floor of process. It never sets the ceiling.

**Tier 0 — cosmetic.** Docs, comments, formatting, a typo. Read the file, make the
change, confirm the file reads correctly. No plan, no test run beyond a glance.

**Tier 1 — contained.** A bug fix or feature inside one module, no public API change, no
schema change. Understand the neighborhood, implement, run the relevant tests.

**Tier 2 — consequential.** Public API or schema changes, migrations, concurrency,
performance, third-party integrations, anything a consumer depends on. Everything in
Tier 1, plus `blast-radius` before the change and `review-your-work` after it.

**Tier 3 — sensitive.** Authentication, authorization, payments, personal data, deletion,
anything where a defect is a security incident or an irreversible loss. Everything in
Tier 2, plus `security-first`, deliberate authorization before any external action, and
verification that would catch a silent failure.

## Uncertainty tiers

- **Known unknowns** (the answer exists, you do not have it) → `read-the-f-docs` for
  authoritative specifics, `research-first` when the answer requires comparing options.
- **Known surfaces** (you can read the code) → `how`, `why`, `understand-before-acting`.
  Reading beats searching.
- **Unknown unknowns** → do a small, reversible probe first: read, run, observe. Do not
  plan work whose shape depends on unanswered questions.

## Working the pairs that overlap

These get confused most often. When two apply, load both — they do different work.

| Confused pair | Split |
| --- | --- |
| `plan-before-coding` / `software-architect` | Plan sequences this task. Architecture evaluates the design. |
| `research-first` / `read-the-f-docs` | Research compares and concludes. Docs lookup returns an authoritative fact for a version. |
| `blast-radius` / `review-your-work` | Impact looks forward before and during. Review looks back at the finished diff. |
| `review-your-work` / `break-the-edge` | Review finds defects in the change. Edge hunting attacks the change's assumptions. |
| `code` / `minimal-changes` | Code decides how well it is written. Minimal changes decides how much of it there is. |
| `code` / `unslop` | Code is the craft. Unslop detects and removes the artifacts of low-quality generated output. |
| `dad-always-say-the-same` / `test-before-finishing` | Design the test. Run the checks. |
| `test-before-finishing` / `verify-before-claiming` | Execute checks. Decide what evidence a claim requires. |
| `verify-before-claiming` / `no-made-up-results` | Set the bar. State the prohibition. |
| `simplify` / `dont-f-my-tokens` | Simplify is about complexity in the result and the process. Efficiency is about resources spent getting there. |
| `show-your-work` / `clear-final-report` | Transparency during the work. The outcome at the end. |
| `how` / `why` | Mechanism. Rationale. |
| `project-structure` / `how` | Structure is the map: what lives where. How is the mechanism: what happens, in what order. |
| `project-structure` / `understand-before-acting` | Both read the repository. Structure ends in an artifact someone reads; understanding ends in readiness to change. |

## Full inventory

### Orchestration

- **raulmoracode-mode** — entry point: classify, select, sequence, report.

### Understanding and planning

- **understand-before-acting** — inspect the environment and current state before changing
  anything; never assume what a read would tell you.
- **plan-before-coding** — steps, dependencies, acceptance criteria for work that needs
  more than a few edits.
- **research-first** — answer open questions with evidence, compare alternatives, stop when
  sufficient.
- **read-the-f-docs** — authoritative, version-specific documentation for a technology,
  API or tool.
- **follow-project-conventions** — match the project's naming, layout, patterns, error
  style and tooling.
- **how-was-last-night** — recover prior context, decisions, last verified state and
  open threads from a previous session or run.
- **blast-radius** — forward-looking impact: consumers, interfaces, data, operations,
  migrations.
- **project-structure** — read the project and produce an annotated directory tree, with
  every listed folder and file described from evidence rather than from its name. The
  output is the deliverable.
- **how** — explain mechanism, components and flows.
- **why** — explain rationale and history; separate documented from inferred.

### Personas

- **software-architect** — evaluate boundaries, coupling and trade-offs; recommend the
  simplest architecture that fits.
- **software-engineer** — the practical working posture across implement, debug, maintain
  and validate; routes to the specific skills.

### Behavior, autonomy, efficiency

- **dont-dance-for-me** — independent judgment; disagree with evidence instead of
  agreeing.
- **dont-f-my-tokens** — spend tokens, time and tool calls deliberately; no redundant
  reads or restating.
- **subagent-task-as-crazy** — parallelize genuinely independent work; integrate and review
  the results.
- **dont-ask-shit** — investigate and infer first; ask only when a wrong guess is costly.
- **show-your-work** — surface decisions, evidence and failed checks while working.
- **simplify** — remove unnecessary complexity from the solution and the process.

### Development and code quality

- **code** — the implementation craft: correct, conventional, proportionate, secure.
- **minimal-changes** — keep the diff to the scope of the request; preserve user work.
- **debug-properly** — reproduce, hypothesize, isolate the root cause, fix, add coverage.
- **security-first** — threats, validation, auth, secrets, injection, dependencies.
- **mom-always-say-the-same** — keep code, comments, docs, examples and config consistent
  with one authoritative source.
- **unslop** — detect and remove low-quality generated code and prose.

### Engineering domains

- **low-level-engineering** — investigate execution below the application: memory, CPU,
  ABI, compilers, loaders, runtimes and operating systems.

- **database-engineering** — schema, query, transaction, lock, migration and integrity
  analysis with evidence from real plans.

- **api-contracts** — design and verify HTTP, event, schema, CLI and service contracts,
  including validation and compatibility rules.

- **backward-compatibility** — compare released and candidate behavior to detect breaking
  changes before consumers hit them.

- **dependency-audit** — review direct and transitive dependencies: versions, licenses,
  vulnerabilities, provenance and supply-chain risk.

- **observability** — design and use logs, metrics, traces, correlation identifiers and
  alerts so production behavior is diagnosable.

- **configuration-management** — sources, defaults, precedence, validation and secret
  references; make any effective value explainable.

- **release-engineering** — versioned releases: identity, changelog, tags, artifacts,
  publication, rollout and rollback.

- **performance-engineering** — measurement, profiling, benchmarks, resource analysis and
  regression checks.

- **frontend-engineering** — UI state, rendering, events, forms, loading and error states,
  API integration and technical tests.

- **browser-engineering** — DOM, event loop, rendering pipeline, workers, storage,
  permissions and sandboxing behavior.

### Testing, verification, review

- **dad-always-say-the-same** — test design: meaningful behavior, real edge cases,
  maintainable and deterministic.
- **test-before-finishing** — run the applicable checks and report what ran.
- **break-the-edge** — adversarial hunt for boundary, failure, race and abuse cases.
- **review-your-work** — inspect the finished diff for defects, regressions and noise.
- **no-made-up-results** — never fabricate output, results, citations or completion.
- **verify-before-claiming** — the evidence standard a claim must meet.
- **clear-final-report** — the final report: result, checks, limits, remaining work.

### Git and repository

- **safe-git** — protect repository state and uncommitted work; destructive operations need
  authorization.
- **git-branch** — branch lifecycle and isolation, following the repository's workflow.
- **git-pr** — prepare, verify and manage pull requests.
- **git-issues** — create, triage and update issues on explicit request.
- **git-tree** — render local and remote branches as a tree grouped by naming prefixes;
  grouping is organizational, never commit ancestry.
