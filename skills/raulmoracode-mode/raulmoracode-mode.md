---
name: raulmoracode-mode
description: "Central orchestrator for AI-assisted work: interprets the request, judges its size, risk and uncertainty, picks the smallest useful set of skills, sequences them, and reports a verified result. Use at the start of any non-trivial request, when a task spans several concerns, when you are unsure which skills apply, or when work needs to be split across subagents. Keeps effort proportional to the task instead of activating the whole catalog."
---

# raulmoracode-mode

The entry point for non-trivial work. It decides *how much process this task deserves*
and *which skills earn their place*, then gets out of the way.

**Core rule:** use the minimum process that produces a reliable result. More skills is
not better; the failure mode is a small task buried under ceremony, or a risky task
rushed through with no verification.

## What this skill is not

It does not contain the instructions of the skills it selects. Planning rules live in
`plan-before-coding`, architecture trade-offs in `software-architect`, tests in
`dad-always-say-the-same`. If you find yourself implementing a concern here, that
concern belongs to a skill — load it instead.

## Process

### 1. Read the request for the actual outcome

Restate in one sentence what will be true when this is done. Distinguish the *outcome*
from the *activity* requested. "Make the export faster" is an outcome; "rewrite the
exporter" is a guess at the solution that may not be the bottleneck.

Note the constraints the user stated, and any they implied but did not write down
(do not touch this file, do not change the public API, keep it backward compatible).

### 2. Judge size, risk and uncertainty

Three axes, quickly:

- **Size** — one file or a dozen; a few minutes or a few hours.
- **Risk** — what breaks if this is wrong. A docs typo is low. Anything touching auth,
  payments, data deletion, migrations, concurrency or the public API is high.
- **Uncertainty** — how much you do not yet know. Unknown unknowns argue for
  understanding first; known unknowns argue for research.

Most tasks are low on all three. Do not inflate them.

### 3. Pick the smallest useful set of skills

Always ask two questions: what must happen for this to be correct, and what is merely
nice to have?

- Pick the **core** skills the task cannot be done well without.
- Add **verification** skills the risk justifies: anything above low risk earns
  `test-before-finishing` and `review-your-work`.
- Add **support** skills only when they change the outcome: `blast-radius` when the
  change is public or hard to reverse, `security-first` when untrusted input or secrets
  are involved, `research-first` when a decision depends on facts you do not have.
- Actively name what you are **skipping**, so over-application is a visible choice.

Load a skill when it applies. Naming a skill in prose does nothing — either load it with
the `skill` tool or leave it out.

Read `references/skill-selection.md` for the task-to-skill routing table, the risk
tiers and the full inventory with each skill's one-line trigger.

### 4. Scale the workflow

- **Small and clear** (a typo, a one-line fix, a known command): just do it, then check
  the result. No plan, no todo list.
- **Medium** (a few files, one subsystem): a short plan in your head or three bullets,
  then implement.
- **Large or risky** (many files, several subsystems, migrations, public API, security):
  write a plan with acceptance criteria, consider delegating independent parts, verify
  properly.

See `plan-before-coding` for how to build the plan, and `simplify` for stripping it back
to what the task actually needs.

### 5. Execute, coordinating as needed

Work in dependency order: understand before changing, plan before coding, implement,
then verify. When parts are genuinely independent, `subagent-task-as-crazy` applies;
when they touch the same files or share an unresolved decision, do them yourself.

Keep the user informed of decisions that change the shape of the work
(`show-your-work`), not of every step.

### 6. Verify before reporting

Evidence standard: `verify-before-claiming`. Running the checks:
`test-before-finishing`. Fabrication is never acceptable: `no-made-up-results`.

### 7. Report

`clear-final-report`. Proportionate to the task: two lines for a two-line change.

## Interaction with other skills

This skill selects; it does not contain the rules of what it selects. The authoritative
owners of each concern are:

- `understand-before-acting` — inspecting the environment before anything changes.
- `project-structure` — mapping what lives where, when a repository has to be explained
  or documented rather than changed.
- `plan-before-coding` — sequencing a multi-step task and defining acceptance criteria.
- `software-architect` — whether the design itself is right.
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

- Activating every skill whose description loosely matches the prompt.
- Producing a ten-step plan for a one-line fix.
- Treating the orchestrator as a substitute for the skills it selects.
- Delegating work that is faster to do directly.
- Skipping verification because the change "looks obviously correct".
- Announcing the process instead of doing the work.

## Definition of done

The right skills were used, effort matched the risk, the task's acceptance criteria are
met, the applicable checks actually ran, and the report states what happened — including
what was not verified.
