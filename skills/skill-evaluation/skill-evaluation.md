---
name: skill-evaluation
description: "Evaluates whether the catalog routes work to the right skills and composes them economically. Use when adding, revising or diagnosing skills, when routing feels arbitrary, or when evidence is needed about token and tool cost, outcome quality, regressions and catalog gaps. It designs representative tasks, records observed routes and results, and turns evidence into bounded catalog refinements without pretending to enforce runtime behavior."
---

## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0
max-depth: 0
supports: []
```

Operational metadata only; this skill evaluates composition rather than loading other
skills to enforce a route.

# Skill evaluation

Routing is a hypothesis about useful work, not a claim that a table or description is
correct. Evaluate the hypothesis with representative tasks and observed evidence.

**Core rule:** measure the route that actually happened, the result it produced and the
cost it consumed; refine the catalog only when the evidence identifies a repeatable
problem.

## When to use

Use when:

- A new or changed skill needs evidence that its scope and neighbors are coherent.
- Several skills appear plausible and the catalog needs a primary/support/forbidden
  decision grounded in examples.
- A route feels too expensive, too shallow, duplicated or prone to regressions.
- A catalog change needs a before-and-after comparison rather than a prose argument.

Do not use to:

- Enforce which skills a runtime loads; this skill produces evidence and recommendations.
- Replace `raulmoracode-mode`, which owns normal task routing.
- Design a test suite for product code; `dad-always-say-the-same` owns test design.
- Assert that a route worked because it was intended; record what was observed.

## Define the evaluation question

Start with one decision the evidence must settle:

- Does this task family have one clear primary skill?
- Is a support skill necessary for a stated risk, or merely related?
- Does a new skill reduce confusion without stealing work from an existing owner?
- Did a catalog change improve quality enough to justify its token and tool cost?

Write the baseline and the candidate change before running tasks. Keep the scope bounded:
one skill, one route boundary, or one small family of closely related tasks. If the
question cannot be answered by a comparison, narrow it until it can.

## Build a representative task set

Use tasks that resemble real requests, not prompts written to flatter the candidate.
Include enough variation to expose neighboring boundaries:

1. **Canonical tasks** — ordinary requests the proposed primary skill should own.
2. **Boundary tasks** — requests that could plausibly select a neighboring skill.
3. **Negative tasks** — requests the skill must not own, including a clear forbidden
   skill or route.
4. **Risk variants** — the same intent with a verification, security or public-change
   constraint when those constraints could justify support.
5. **Regression tasks** — previously representative requests whose route must remain
   stable unless the change intentionally moves it.

For every task, record the expected primary skill, expected support skills and forbidden
skills before observing the route. Expectations are hypotheses, not labels to edit after
the fact.

## Observe the complete run

For each task, capture the smallest evidence set that makes comparison possible:

| Field | Record |
| --- | --- |
| Task | Stable identifier and exact prompt |
| Expected route | Primary, support skills and forbidden skills |
| Observed route | Skills actually loaded or invoked, in order |
| Cost | Input/output tokens, tool calls and relevant elapsed time |
| Outcome | Whether the task reached its requested result |
| Quality | Correctness, completeness, unnecessary work and user-visible defects |
| Regression | Any change from the baseline route or result |
| Evidence | Links, logs, diffs, command output or other reproducible artifacts |

Do not infer token or tool cost from skill length. Use the runtime's actual accounting
when available; otherwise mark the field unavailable instead of estimating it. Separate
route correctness from outcome quality: a plausible route can still produce a poor
result, and a useful result can hide unnecessary cost.

## Judge routing and composition

Classify each task with explicit outcomes:

- **Route match** — the observed primary and support set matches the expectation.
- **Route drift** — the wrong owner, an unjustified support, a missing support or a
  forbidden skill appeared.
- **Cost regression** — the result stayed equivalent while tokens or tool calls rose
  materially; state the comparison and threshold used.
- **Quality regression** — correctness, completeness or clarity worsened.
- **Catalog ambiguity** — multiple routes are defensible because ownership or
  boundaries are underspecified.

A support skill earns its place only when the task's risk or missing capability explains
the improvement. A skill that is merely related is not evidence for composition. A
forbidden skill is a boundary probe, not a recommendation to add more routing rules.

## Refine from evidence

Make the smallest catalog change that addresses a repeated, evidenced problem:

- Clarify a description or routing table when the owner is ambiguous.
- Narrow a skill when it repeatedly captures boundary or negative tasks.
- Add or remove an operational support declaration only when observed risk and outcome
  data justify it.
- Add a new skill only when the task set shows a durable concern with no clear owner.
- Preserve a stable route when a change only increases ceremony without improving quality.

Re-run canonical, boundary, negative and regression tasks after every refinement. Keep
the evidence with the change review, and state unresolved ambiguity rather than
encoding a speculative rule.

## Interaction with other skills

- `raulmoracode-mode` owns ordinary runtime routing; this skill supplies empirical
  feedback about whether that routing is coherent.
- `review-your-work` helps inspect the catalog diff after a refinement.
- `dad-always-say-the-same` owns test design when the evaluation needs product tests.
- `test-before-finishing` runs the repository checks; it does not judge route quality.
- `verify-before-claiming` sets the evidence bar for reporting evaluation results.
- `no-made-up-results` forbids invented observations, costs and outcomes.
- `blast-radius` helps identify catalog surfaces that a route change may affect.

## Anti-patterns

- Writing the task set around the candidate skill's best examples and calling it
  representative.
- Setting expectations after observing the route, so every run counts as a match.
- Estimating token or tool cost from file length instead of the runtime's accounting.
- Treating a plausible route as a good outcome, or a good outcome as an efficient route.
- Loading extra skills to exercise composition and counting the ceremony as a finding.
- Turning one bad run into a catalog rule; refinements need a repeated, evidenced problem.
- Writing a rule that only pretends to constrain which skills a runtime loads.
- Keeping a costlier change that showed no measurable quality gain.

## Definition of done

The evaluation question is explicit; representative canonical, boundary, negative and
regression tasks were run; expected and observed routes are recorded; token and tool
costs are measured or marked unavailable; outcome quality and regressions are evidenced;
and any catalog refinement is the smallest change supported by the results. The report
distinguishes observation from recommendation and does not claim runtime enforcement.
