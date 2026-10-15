---
name: subagent-task-as-crazy
description: "Runs independent parts of a task in parallel with subagents instead of one at a time. Use when a request has two or more parts that do not depend on each other, when the same investigation must be repeated across modules, when several files or areas need the same treatment, or when wall-clock time is the thing being optimized. Partitions work into disjoint scopes with one writer per file, writes delegation prompts that produce a usable deliverable, then reviews and integrates every result before reporting."
---

# Subagent task as crazy

Serial work is the default failure mode of a capable agent: doing one thing thoroughly
while three independent things sit untouched. This skill is about recognizing real
independence, delegating it precisely, and taking responsibility for what comes back.

**Core rule:** delegate every part that is genuinely independent, and never pay the
coordination cost for work you could finish faster by doing it yourself.

## When to use

Use when the request splits into two or more parts with no data, decision or file
overlap, when the same question must be answered in several places, or when a broad
survey is more useful answered in parallel.

Do not use to:

- Budget tokens and tool calls → `dont-f-my-tokens`.
- Sequence the overall task → `plan-before-coding` or `raulmoracode-mode`.
- Explore the repository before changing it → `understand-before-acting`.
- Split a design decision → that is `software-architect`, made once, not in pieces.

## What this platform actually offers

Be concrete about the tools; do not invent capabilities.

- **Subagents** come in two built-in forms: `explore` for read-only searching and
  answering questions about a repository, and `general` for scoped work that may write
  files. Neither shares your context, your session history or your unstated knowledge.
- **Worktrees** (`worktree_create`, `worktree_remove`) give a parallel task its own
  checkout when the work needs isolated git state.
- **Nothing runs automatically.** Each subagent starts from the prompt you wrote. Every
  fact it needs must be in that prompt or be discoverable by it in one or two reads.

## Process

### 1. Find the real independence

List the parts of the task and their dependencies. Two parts are independent when
finishing either one does not change what the other does, requires no decision from the
other, and writes to no shared file. Anything else is a sequence, not a fan-out.

### 2. Partition so nothing collides

Give each delegated part a disjoint file or directory ownership, with exactly one writer
per file. If two parts must touch the same file, they are not independent — merge them
into one part or run them in order.

### 3. Write the delegation prompt

A vague prompt produces a result you must redo, which costs more than doing the work.
See the prompt anatomy below.

### 4. Launch them together

Issue the independent calls in the same turn so they actually overlap. Sequential
launches buy nothing.

### 5. Review before you integrate

A returned result is a draft from someone who could not ask you a question. Read it,
run whatever checks apply, and confirm it matches the deliverable you specified.

### 6. Report honestly

State which parts were delegated, which you did yourself, and what came back.

## What a delegation prompt must contain

- **The deliverable**, named exactly: the files to create, the answer to give, the
  format to return.
- **The scope boundary**: which paths, directories or concerns are off limits.
- **The missing context**: paths, conventions, the project's commands, the constraints
  you were given.
- **The bar for done**: what makes this part finished and correct.
- **The escape hatch**: when blocked, report the blocker instead of guessing or
  expanding scope.

## The delegation decision test

Delegation pays when all four are true:

1. The parts are independent by the test in step 1.
2. Each part is large enough that a fresh context is worth it — small edits lose to
   simply doing them.
3. You can state the deliverable precisely enough to check the result without redoing it.
4. No two parts write the same file.

Count the cost side honestly: writing the prompt, waiting, reviewing, integrating,
repairing what came back wrong. If the whole task is minutes of work, if the partition
is fuzzy, or if you must read every line it produced anyway, do it directly.

Choose `explore` when the deliverable is knowledge and the files must not change. Choose
`general` when the deliverable is files. Use a worktree only when the parallel part
genuinely needs an isolated checkout; otherwise you are paying for state management you
do not need.

## Interaction with other skills

- `dont-f-my-tokens` — owns the token and call budget; this skill spends that budget on
  parallelism deliberately.
- `understand-before-acting` — inspect the environment yourself before delegating
  against it.
- `plan-before-coding` — sequence the work that has dependencies; fan out only the rest.
- `minimal-changes` — disjoint scopes here are how you avoid merge conflicts and
  unrelated edits.
- `review-your-work` — reviews the finished diff, including anything a subagent wrote.
- `verify-before-claiming` — delegated work needs the same evidence as your own.
- `no-made-up-results` — never describe a subagent as having produced something it did
  not.
- `show-your-work` — surfaces the partition and the integration decisions while working.

## Anti-patterns

- Delegating to avoid thinking rather than to run work in parallel.
- Two parts that both write the same file, resolved by whoever finished last.
- A prompt that says "look into X and tell me what you find".
- Splitting one design decision into five opinions.
- Fanning out three two-minute edits and then writing three longer prompts.
- Accepting returned work without reading it.
- Reporting "parallelized across subagents" when nothing was invoked.
- Spawning an agent to investigate something a single grep answers.

## Definition of done

Every part that was genuinely independent was delegated or done directly, and the
choice was made against the decision test rather than by reflex; no two parts shared a
file; each prompt named a checkable deliverable; every returned result was read and
integrated before it was used; and the report states what was delegated, what was done
in the main thread, and what remains unverified.
