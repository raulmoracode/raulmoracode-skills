---
name: how-was-last-night
description: "Reconstructs context from previous work by reading version-control and repository artifacts. Use when resuming after a break, when a session starts with no context, or when the user asks what was done, where things stand, what happened last time or to continue where we left off. Recovers decisions and their evidence, the last verified state, unfinished work, blockers and open questions from history, reflog, stash, branches, plan files, recent tests and changelogs. Cannot detect a session reset automatically; recovery is always explicit."
---

# How was last night

Sessions end without a summary and the reasoning inside them is gone. The
repository is the durable record, and it is readable. This skill reconstructs what
was done, what was decided, what was verified and what was left open, so the next
step is a continuation rather than a restart.

**Core rule:** reconstruct state from artifacts, never from memory or assumption. If
an artifact does not support a claim, the claim is unavailable — say so.

## What this cannot do

OpenCode does not expose lifecycle hooks to skills. Nothing about this skill is
automatic:

- It cannot detect that a session was reset, ended or compacted.
- It cannot run at session start; there is no "before you begin" callback.
- It receives no notification that previous work happened.
- It cannot recover conversation content that was never written to a file.

Recovery is explicit: it happens when the user asks ("where were we?", "what did we
do last time?", "continue where we left off"), when the request assumes context you
do not have, or when you choose to reconstruct state before touching a dirty tree.
If someone expects automatic detection, tell them plainly that the platform does not
provide it.

## When to use

- Resuming work after a break with a dirty working tree or an unfinished branch.
- A new session on an existing repository where no one restated the goal.
- The user asks what changed, what was decided, what is left, or why something looks
  half-done.
- You are about to make a change on top of work you did not write and cannot see the
  reasoning for.

Do not use to:

- Decide what to do next → `plan-before-coding`.
- Learn how the code works → `how`; learn why it is that way → `why`.
- Inspect the current environment before a clean change → `understand-before-acting`.
- Look up a technology's documentation → `read-the-f-docs`.

## Process

### 1. Establish the state of the tree

Branch, HEAD, and the status of the working tree. Uncommitted changes are work in
progress from someone, including possibly a previous session of yours. Never clear
them to get a clean view.

### 2. Find the last verified state

What is committed, what the commits claim, and what evidence exists that it worked.
The reflog shows movements that may not survive as commits, including work that was
committed and later moved. A commit message saying tests pass is a claim; the last
state you can defend is the newest commit you have evidence for.

### 3. Recover decisions and their evidence

Commit messages and bodies, plan and checklist files, ADRs, comments that explain a
constraint, test names that encode the intended behavior, changelog entries, and
issue references. Record each decision with where it came from, so a later reader can
tell a decision from a convention.

### 4. Identify unfinished work

Markers introduced recently, partial implementations, skipped or disabled tests,
stashes, branches ahead of the current one, unresolved merge conflicts, half-applied
migrations, a dependency added but never used.

### 5. Name blockers and open questions

What the previous session was waiting on: an unanswered question, a failing test, a
pending review, a missing credential, an external dependency, a decision deferred to
the user. Distinguish "blocked on someone else" from "not started".

### 6. State the resume point, then proceed

Report in this order: where the work stands, what was verified and how, what is
left, what is blocked, and the single next step you propose. Do not start editing
until the next step is unambiguous, or the user has confirmed it.

Read `references/recovery-commands.md` when you need the actual commands — git log,
diff, show, reflog, status, branch comparison, stash inspection, TODO and plan-file
searches, recent test files, changelogs and session artifacts, each with a note on
what it tells you. Every command listed there is read-only.

## Interaction with other skills

- `safe-git` — owns repository safety. This skill only reads; never reset, checkout
  over, restore, stash-pop or clean in order to reconstruct history.
- `understand-before-acting` — inspects the environment when the change is clean;
  this one reconstructs where prior work stopped.
- `plan-before-coding` — turns the recovered state into ordered work with acceptance
  criteria.
- `blast-radius` — forward-looking impact of resuming or extending that work.
- `why` — explains the rationale behind a decision once you have located it.
- `dont-ask-shit` — infer the rest of the state from artifacts; ask only what the
  artifacts cannot answer.
- `show-your-work` and `clear-final-report` — the resume report and the final report
  are different moments; do not merge them.
- `dont-f-my-tokens` — reconstruction is expensive; stop once the state is clear.
- `no-made-up-results` — never report inferred intent as a recovered decision.

## Anti-patterns

- Claiming to have recovered context that no artifact supports.
- Running a destructive git command to inspect history.
- Treating uncommitted changes as garbage and clearing them.
- Re-doing work that is already committed and verified.
- Restarting from zero when the user asked to resume.
- Reading reflog churn and reporting it as decisions.
- Guessing the intent of an abandoned change instead of reporting it as abandoned.
- Reading the entire repository history to answer a question about the last commit.
- Reporting "the previous session did X" when only a comment implies X.

## Definition of done

The tree state, the last verified state and the unfinished work are each backed by a
specific artifact you can point to. Decisions are listed with their source, blockers
and open questions are named as open, and the report ends with one concrete next
step. Anything the artifacts do not support is reported as unavailable, not guessed.
