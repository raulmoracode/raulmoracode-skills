---
name: raulmoracode-mode
description: "Entry point and orchestrator for non-trivial work. Use at the start of a request, when several skills seem to apply, when you are unsure which skill fits, or when a task looks larger than it is: cuts unearned scope and steps out of the task first, identifies the single skill most expert in it and loads that one, adds a second skill only when the risk forces verification, then reports what actually ran. Deliberately cheap: routing is decidable from this skill alone, so it spends as few tokens, loads and tool calls as the task allows."
---

# raulmoracode-mode

## Composition

```yaml
role: orchestrator
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: []
```

Composition is deliberate and shallow. Select one primary specialist first, then load zero
to two support skills only when a stated risk, uncertainty or verification need justifies
them. Support skills do not select or load other skills, and no skill is loaded merely
because it is related. Do not reload a skill already in context. Keep the active set
small enough that the task's useful work, not orchestration, gets the token budget.

The entry point for non-trivial work. It cuts the task down to what it actually needs,
hands it to the one skill that owns it, and gets out of the way.

**Core rule:** cut the task down first, then hand it to the single skill most expert in
it. More skills and more loaded files is the failure mode, not the safeguard — a small
task buried under ceremony, or a risky task rushed through unverified.

## What this skill is not

It does not contain the instructions of the skills it selects. Planning rules live in
`plan-before-coding`, architecture trade-offs in `software-architect`, tests in
`dad-always-say-the-same`. If you find yourself implementing a concern here, that concern
belongs to a skill — load it instead.

## Process

### 1. Cut the task down before routing it

Cheaper than any skill choice is a smaller task. Strip it first:

- Is every part of the request necessary, or is some of it optional?
- Is there a smaller version that fully satisfies the outcome? One function instead of a
  refactor, one file instead of a module, a config value instead of a feature.
- Which step in the imagined plan produces no artifact and settles no question?

Most tasks shrink here, and the rest of this skill gets shorter with them. On a one-line
fix this step is one sentence and you move on.

When a task is genuinely over-scoped — a sweeping refactor where one function would do, a
ten-step plan for a two-file change, an abstraction with one caller — load `simplify` for
the full treatment. Do not load it by reflex: it is a lens applied continuously, not a
phase to run on every request, and loading a skill has a cost.

Then restate the outcome in one sentence: what will be true when this is done. Distinguish
the *outcome* from the *activity* requested. "Make the export faster" is an outcome;
"rewrite the exporter" is a guess at the solution that may not be the bottleneck. Note
the constraints the user stated and the ones they implied.

### 2. Hand it to the one owner

Find the single skill most expert in this task and load that one. Most requests are owned
by exactly one skill; the table below decides them from this file alone, so routing does
not cost an extra read.

| The request is | The owner |
| --- | --- |
| "Show me the structure" / "what does each folder do" | `project-structure` |
| "How does X work?" / "trace this" / "walk me through it" | `how` |
| "Why is it like this?" / "why does this exist?" | `why` |
| "Fix this bug" / "it is broken" / "it crashes" | `debug-properly` |
| "Add X" / "implement X" / "change this behavior" | `code` |
| "Refactor" / "clean this up" / "this file is bloated" | `unslop` |
| "Should we use A or B?" / a design decision | `software-architect` |
| "What breaks if I change this?" | `blast-radius` |
| "Review my changes" / "is this diff good?" | `review-your-work` |
| "Write tests" / "how should I test this?" | `dad-always-say-the-same` |
| "Run the tests" / "does it build?" | `test-before-finishing` |
| "Find the edge cases" | `break-the-edge` |
| "Is this safe?" / auth, secrets, untrusted input | `security-first` |
| "Which library should I use?" / maintenance and fit | `research-first` |
| "What does this API do?" / exact flags, defaults, versions | `read-the-f-docs` |
| "Open a PR" / "prepare a pull request" | `git-pr` |
| "Create an issue" / "file a bug" | `git-issues` |
| "Start a branch" / "move this work aside" | `git-branch` |
| "Reset" / "rebase" / "undo" / "my git is a mess" | `safe-git` |
| "What did we do last time?" / resuming after a break | `how-was-last-night` |
| "The docs are wrong" / "update the README" | `mom-always-say-the-same` |
| "Show me the branch landscape" / what branches exist | `git-tree` |
| "This only breaks in production" / behavior below application code | `low-level-engineering` |
| "The query is slow" / schema, index, transaction or migration work | `database-engineering` |
| "Design or verify this API" / HTTP, event, schema or CLI contracts | `api-contracts` |
| "Will this break existing users?" / compare old and new behavior | `backward-compatibility` |
| "Is this dependency safe?" / versions, licenses, vulnerabilities, provenance | `dependency-audit` |
| "We cannot see why this fails in production" / logs, metrics, traces, alerts | `observability` |
| "This only works in one environment" / configuration sources, defaults, precedence | `configuration-management` |
| "Cut a release" / versions, tags, artifacts, changelog, rollback | `release-engineering` |
| "Make it faster" / profiling, benchmarks, regressions | `performance-engineering` |
| "Fix the frontend" / state, rendering, forms, loading and error states | `frontend-engineering` |
| "Only happens in the browser" / DOM, event loop, rendering, storage, workers | `browser-engineering` |
| "The page is slow" / Core Web Vitals, bundles, caching, waterfalls | `web-performance` |
| "Is this accessible?" / keyboard, focus, ARIA, screen readers | `accessibility-engineering` |
| Systems-level posture: memory, CPU, ABI, compilers, runtimes | `low-level-engineer` |
| Database posture: modeling, SQL, transactions, indexes, locks | `database-engineer` |
| Performance posture: measurement, profiling, benchmarks, regressions | `performance-engineer` |
| Release posture: versions, artifacts, tags, publishing, rollback | `release-engineer` |
| Platform posture: CI/CD, environments, tooling, developer infrastructure | `platform-engineer` |
| "Organize this work" / objectives, scope, priorities, dependencies, blockers | `project-manager` |
| "Follow this call" / trace an execution path end to end | `trace-the-call` |
| "Where does this break between services?" / boundary assumptions and failures | `check-the-boundary` |
| "What is actually inside this package?" / artifact contents and metadata | `inspect-the-artifact` |
| Routine engineering with no single named concern | `software-engineer` |

Read `references/skill-selection.md` only when the table above does not decide: it holds
the full inventory, the risk tiers, the uncertainty tiers, and the pairs that get
confused with each other. It is a lookup, not a required part of routing.

### 3. Add a second skill only when the task forces it

One owner is the default. A second skill earns its place only when one of these is true:

- **Risk forces verification** — anything above low risk earns `test-before-finishing`,
  and anything that changes behavior earns `review-your-work`.
- **Untrusted input, authentication, secrets or a new dependency is involved** —
  `security-first`.
- **The change is public, or hard to reverse** — `blast-radius`.
- **You have not read the code you are about to change** — `understand-before-acting`.
- **The decision depends on facts you do not have** — `research-first`.
- **The work has more than a few steps, or a hidden dependency** — `plan-before-coding`.
- **Parts are genuinely independent** — `subagent-task-as-crazy`.

Name what you are deliberately skipping, so over-application is a visible choice rather
than an accident. Load a skill when it applies — naming one in prose does nothing.

### 4. Scale the process to the size

- **Small and clear** (a typo, a one-line fix, a known command): do it and check the
  result. No plan, no todo list, no skills beyond the owner.
- **Medium** (a few files, one subsystem): three bullets of plan at most, then implement.
- **Large or risky** (many files, migrations, public API, security): write the plan with
  acceptance criteria, consider delegating the independent parts, verify properly.

Effort should match the risk. Most tasks are small; do not inflate them.

### 5. Execute in dependency order

Understand before changing, plan before coding, implement, then verify. When parts are
genuinely independent, `subagent-task-as-crazy` applies; when they touch the same files or
share an unresolved decision, do them yourself.

Tell the user about decisions that change the shape of the work (`show-your-work`), not
about every step.

### 6. Verify, then report

Evidence standard: `verify-before-claiming`. Running the checks:
`test-before-finishing`. Fabrication is never acceptable: `no-made-up-results`. The report
is `clear-final-report` — two lines for a two-line change.

## Interaction with other skills

This skill selects; it does not contain the rules of what it selects. The authoritative
owners of each concern are:

- `understand-before-acting` — inspecting the environment before anything changes.
- `project-structure` — mapping what lives where, when a repository is to be explained
  rather than changed.
- `plan-before-coding` — sequencing a multi-step task and defining acceptance criteria.
- `simplify` — removing unnecessary complexity from the task and the solution. Applied
  continuously; loaded only when a task is genuinely over-scoped.
- `software-architect` — whether the design itself is right. `software-engineer` — the
  day-to-day working posture when no single concern is named.
- `code` — the implementation craft. `minimal-changes` — how much of it there is.
- `debug-properly` — a defect whose cause is not yet known.
- `security-first` — untrusted input, auth, secrets, dependencies.
- `dad-always-say-the-same` — designing tests. `test-before-finishing` — running them.
- `review-your-work` — inspecting the finished diff. `break-the-edge` — attacking its
  assumptions.
- `safe-git`, `git-branch`, `git-pr`, `git-issues` — repository and GitHub work, each
  within its own scope and authorization rules.

Standing rules that apply to orchestrated work without loading another skill:

- Preserve the user's uncommitted work. See `safe-git` before anything destructive.
- Never push, merge, publish, comment or close anything without explicit authorization.
- Report only what was executed. A check that could not run is reported as not run.
- Prefer the project's existing approach over a better-sounding one from outside it.

## Anti-patterns

- Cutting the task down and then loading five skills anyway.
- Loading `simplify` on a task that is already one line.
- Reading the routing reference to decide a case the table above already answers.
- Activating every skill whose description loosely matches the prompt.
- Producing a ten-step plan for a one-line fix.
- Treating the orchestrator as a substitute for the skill it selects.
- Delegating work that is faster to do directly.
- Skipping verification because the change "looks obviously correct".
- Announcing the process instead of doing the work.

## Definition of done

The task was cut down before it was routed; one owner was chosen and loaded; any second
skill was justified by risk rather than habit; the process matched the size of the work;
the applicable checks actually ran; and the report states what happened, including what
was not verified.
