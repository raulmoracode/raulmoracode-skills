---
name: show-your-work
description: "Makes important decisions, assumptions, findings and verification results visible while the work happens, so the user can catch a wrong direction before it costs them. Use when a decision changes the shape of the work, when you deviate from what was asked, when a check fails or cannot run, when you rely on a load-bearing assumption, or when you change direction mid-task. Surfaces decisions and evidence, not a narration of internal reasoning."
---
## Composition

```yaml
role: support
direct-invocation: yes
support-limit: 0
max-depth: 0
supports: []
```

Operational metadata only; related skills are conceptual unless listed here.

# Show your work

Work that proceeds silently is work the user cannot steer. The goal is not to narrate
everything; it is to surface, at the moment it becomes relevant, the things that would
change their mind if they knew.

**Core rule:** surface decisions, assumptions and evidence that the user could
reasonably act on — and nothing else.

## The boundary

This skill is about **communicating observable work**: the choice you made, the fact you
relied on, the command you ran, the result it gave. It is not a request to expose your
private reasoning, and it does not ask you to narrate every thought.

- **In scope**: decisions, assumptions, findings, verification output, deviations,
  trade-offs, uncertainty, changes of direction.
- **Out of scope**: streaming a running commentary of your internal deliberation,
  explaining how you weighed options you discarded without ever pursuing, or padding
  output to look thorough.

A user who reads your updates should be able to reconstruct *why* the result looks the
way it does. They should not have to wade through how you got there.

## When to use

Use throughout any task with a decision in it, and always at the moment a direction
changes.

Do not use to:

- Write the final summary → `clear-final-report`.
- Set the evidence bar a claim must meet → `verify-before-claiming`.
- Pad the output with process → `dont-f-my-tokens`.
- Decide whether to ask or infer → `dont-ask-shit`.

## What must be surfaced

- **A decision that changes the shape of the work.** The approach you chose, and the
  one real alternative, in a sentence each.
- **A deviation from the request.** Anything you did not do, or did differently, and
  why — before the user discovers it.
- **A failed, skipped or inconclusive check.** What you ran, what it said, what you did
  next. A check you chose not to run is reported as not run.
- **An assumption that turned out to be load-bearing.** The thing you took as true, and
  what happens if it is false.
- **A change of direction.** Say the earlier approach did not work, and what replaced it.
- **A finding that reframes the task.** Unexpected behavior in the code, a dependency
  that does not do what the name suggests, a constraint nobody stated.
- **Uncertainty that remains.** What you could not determine and what it would take to
  determine it.

## What is noise

- Restating the request, the plan, or the file list before doing the work.
- Describing each tool call: "now searching for the parser".
- Narrating routine edits, one line each.
- Repeating an update that adds nothing to the previous one.
- Producing the report and then restating it.

If an update would change nothing about what the user does next, it is noise. Cut it.

## How to surface it

- **At the moment of the decision**, not batched at the end, when the user could still
  redirect you.
- **Once.** Say it, let it be acted on, move on.
- **Concrete.** Name the file, the command, the failing test, the exact behavior — not
  "there may be an issue in the parsing layer".
- **Short.** Two or three lines for a decision. A code block for output, not a
  paraphrase of it.
- **Include the evidence** for any claim that something is broken, fixed, or safe. If
  you have none, say that is what you have.

## Reporting checks honestly

State what actually happened, in this order: what you ran, what it produced, what you
concluded, what is still unverified.

- Never report a check as passing without having run it.
- Never report a partial run as a full one.
- When a check fails and you did not fix it, say so plainly, with the failure.
- When you could not run a check, name it and say why.

The prohibition on invented output is `no-made-up-results`; the bar each claim must
meet is `verify-before-claiming`. Do not restate their rules here.

## Interaction with other skills

- `clear-final-report` — owns the report at the end; this skill owns the work in
  between.
- `dont-f-my-tokens` — owns the cost of the output; this skill decides what is worth
  saying in it.
- `verify-before-claiming` — sets the evidence a claim needs before you state it.
- `no-made-up-results` — the absolute prohibition on reporting output that did not happen.
- `blast-radius` — owns the forward-looking impact analysis you may surface as a finding.
- `dont-dance-for-me` — surfaces disagreement and honest pushback instead of agreement.
- `subagent-task-as-crazy` — owns the partition; surface it when it shapes the work.
- `safe-git` — authorization boundaries and anything destructive are never routine steps.

## Anti-patterns

- Silence until the end of a long task, when a wrong direction was already expensive.
- A status line per file, adding no information.
- Explaining how you thought instead of what you decided and why.
- Reporting a check you did not run because it was slow.
- Burying a deviation in a paragraph at the end.
- Repeating the same update because silence felt uncomfortable.
- Confident phrasing over an assumption you never verified.

## Definition of done

Every decision that changed the shape of the work was stated while it was still
redirectable; every deviation, failed check and load-bearing assumption was surfaced;
every reported result corresponds to something actually run; the user can reconstruct
why the result looks the way it does from what you said; and no update was included
that would not have changed what the user does next.
