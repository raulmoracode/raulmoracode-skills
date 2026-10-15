---
name: dont-f-my-tokens
description: "Spends tokens, time and tool calls deliberately while working. Use on any long-running task, when context is filling, when a search has already failed once, when output is growing faster than the user needs it, or when asked to be faster, cheaper or more efficient. Finds the file once and reads it whole, batches independent calls, stops exploring as soon as you can act, and never buys speed by skipping verification."
---

# Don't f my tokens

Every tool call and every paragraph costs the user money, latency and attention. This
skill is about spending those resources where they change the result, and refusing to
spend them on repetition, ceremony or reassurance.

**Core rule:** spend tokens only where they change the outcome — never to recover
information you already have, restate what you already know, or skip a check that keeps
the result trustworthy.

## When to use

Use when the work is long, the context is filling, or you notice yourself repeating a
search, re-reading a file, or writing something you have already written.

Do not use to:

- Decide how much process a task deserves → `raulmoracode-mode`.
- Shrink the diff → `minimal-changes`.
- Remove complexity from the result → `simplify`.
- Split independent work across agents → `subagent-task-as-crazy`.
- Decide what evidence a claim needs → `verify-before-claiming`.

## What you are spending

Three resources, which fail differently:

- **Tokens** — context you fill, and context you cannot refill.
- **Time** — latency the user waits through.
- **Tool calls** — round trips, each carrying its own latency and failure chance.

Cutting tool calls usually cuts the other two, so it is the cheapest place to cut.
Cutting *reading* to save time is almost never a good trade.

## Tool-call discipline

- **Targeted search first, broad read second.** Grep for the symbol, filename or error
  string before opening anything. One grep returning three lines beats opening four
  files you guessed at.
- **Then read the file whole.** Once you know which file matters, read it completely
  instead of slicing it repeatedly or grepping inside it again. Two partial reads of a
  file you keep returning to cost more than one full read.
- **Batch independent calls.** Independent reads, greps and globs belong in one turn,
  not one turn each. They cost the user roughly one round trip instead of three.
- **Ask for less output.** Anchor greps and globs to a directory, extension or pattern
  that returns a handful of lines. An unscoped search returns the repository.
- **Never re-read what you just wrote.** You wrote it; it is already in context. Read
  it back only after an edit or a tool changed it on disk.
- **Never re-read what you already read** and nothing has modified since.
- **Run the command that answers the question.** A test, a type check or a build is
  cheaper than reasoning about what the output would be.
- **Derive before you fetch.** Exports, signatures and call sites are cheaper to learn
  from source than from a page describing them.

## Exploration stopping rules

- Stop when you can act. The moment you hold enough to make the next edit, make it.
- A second search with different wording is usually wasted. If the first targeted
  search found nothing, change the *question*, not the phrasing: search a directory you
  have not searched, or ask the codebase something else.
- Give exploration a budget before it starts and stop when the budget is spent. "Two
  searches" is a real budget.
- Never explore to relieve anxiety. Reading more files because you feel unsure is not
  a plan. Make the next decision and let its result be the evidence.

## Communication discipline

- No preamble. Do not announce what you are about to do; do the first thing.
- No restating the request. The user wrote it and you read it.
- No plan narration unless the plan changed the shape of the work — that belongs to
  `show-your-work`.
- Lead with the result. The first line answers the question or reports the change;
  detail follows only if it earns its place.
- One pass. Never draft a report and then write a better version of the same report.
- Length tracks the change. A one-line fix gets a one-line report.

## What is not negotiable

Efficiency is never a valid reason to skip any of these.

- **Verification.** Do not skip, narrow, sample or fake a check to save tokens.
  `no-made-up-results` and `verify-before-claiming` apply identically when you are
  short on budget.
- **Understanding before acting.** Reading the file you are about to change is not the
  expensive part of the task. Skipping it because reading "costs tokens" is how a wrong
  change ships → `understand-before-acting`.
- **Security and correctness concerns.** Never compress away a concern because it looked
  tangential. `security-first` gets its full pass at any budget.
- **Honesty about what you did.** Never claim to have read, run or verified something
  you did not. A short truthful report beats a complete-sounding false one.
- **The user's own work.** Never skip inspecting the working tree to save a call. That
  check is `safe-git`.

## Interaction with other skills

- `simplify` — complexity in the result; this skill is resources spent getting there.
- `minimal-changes` — the size of the diff, not the cost of producing it.
- `subagent-task-as-crazy` — delegation is a token decision; it owns when to parallelize.
- `show-your-work` — owns what transparency is worth communicating; this skill only says
  not to pad it with restatement.
- `verify-before-claiming` — sets the evidence bar that efficiency must not lower.
- `raulmoracode-mode` — owns how much process the task deserves in the first place.

## Anti-patterns

- Grepping the same directory three times with slightly different words.
- Reading a file in slices because you were not sure how long it was.
- Re-reading a file to confirm an edit you made seconds ago.
- Running a broad listing when a scoped pattern would answer the question.
- Describing the plan, the approach and the intended diff before doing any of it.
- Reporting the same result twice in two different lengths.
- Skipping a test because running it would "obviously pass".
- Declaring a task simple instead of checking the one file that would have disproved it.

## Definition of done

Each question was answered by the cheapest tool that could answer it; no file was read
twice without something having changed; independent calls were batched; exploration
stopped as soon as you could act; the report leads with the result and is no longer
than the change warrants; and every check the task required actually ran.
