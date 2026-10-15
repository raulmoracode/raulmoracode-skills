# Skill selection

Routing aid for `raulmoracode-mode`. Read it when the task is not obvious, spans several
concerns, or you are choosing between skills that sound similar.

## Routing by request shape

| The request looks like | Load |
| --- | --- |
| "Explain how X works" / "walk me through the flow" | `how` |
| "Why is it done this way?" / "why does this exist?" | `why` |
| "Fix this bug" / "it is broken" / "it crashes" | `debug-properly`, then `code` |
| "Add a feature" / "implement X" / "change behavior" | `understand-before-acting`, `code` |
| "Refactor this" / "clean this up" | `unslop`, `simplify`, `minimal-changes` |
| "Should we use approach A or B?" / design decision | `software-architect`, `blast-radius` |
| "What would break if I change this?" | `blast-radius` |
| "Review my changes" / "is this PR good?" | `review-your-work` |
| "Write tests" / "how should I test this?" | `dad-always-say-the-same` |
| "Run the tests" / "does it build?" | `test-before-finishing` |
| "Find edge cases" / "what could break?" | `break-the-edge` |
| "Is this safe?" / auth, secrets, untrusted input | `security-first` |
| "Which library should I use?" / library is unknown or version matters | `research-first`, `read-the-f-docs` |
| "What does this API do?" / exact flags, config keys, version behavior | `read-the-f-docs` |
| "Open a PR" / "prepare a pull request" | `git-pr` |
| "Create an issue" / "file a bug report" | `git-issues` |
| "Switch branches" / "move this work to a branch" | `git-branch`, `safe-git` |
| "Reset / rebase / undo / clean up git state" | `safe-git` |
| "What did we do last time?" / resuming after a break | `how-was-last-night` |
| "Docs are wrong" / "update the README" | `mom-always-say-the-same` |
| The request is broad or crosses several of the above | this skill, plus the core ones |

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
