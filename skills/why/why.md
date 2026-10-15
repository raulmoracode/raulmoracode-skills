---
name: why
description: "Investigates why a decision, implementation or behavior exists: reads the code and its comments, the documentation and decision records, and the Git history, then separates documented rationale from inference and presents competing explanations when the evidence is inconclusive. Use for questions like 'why is it done this way', 'why this library', 'why does it retry three times', 'what was the intent here', or before changing something whose purpose you do not yet know."
---

# Why

Code records what was decided, and sometimes why. Your job is to recover the reason
with evidence, and to be honest when the evidence does not exist. A plausible story
about intent that nobody ever wrote down is a guess wearing the costume of history.

**Core rule:** never invent a historical decision. Report what is recorded, what you
infer, and what you could not determine.

## How this differs from `how`

`how` traces the machine — the components, the calls, the data. `why` explains the
reasoning behind one decision: what problem it solved, what alternatives were rejected,
what constraint forced it. `how` reads the code to describe it; `why` reads the code,
the comments, the docs and the history to reconstruct a choice. When asked both,
mechanism first, then rationale.

## When to use

- "Why is it built this way?", "why this library?", "why does it retry three times?"
- Before changing something whose purpose you do not understand.
- When a comment or naming implies a constraint you have not been told.
- When the same problem was solved two different ways in the same repository and you
  need to know whether that was deliberate.
- When deciding whether to preserve a strange-looking pattern.

Do not use to:

- Describe what the code does → `how`.
- Investigate an open question about the outside world → `research-first`.
- Get authoritative facts about a tool's documented behavior → `read-the-f-docs`.
- Decide whether a design is good → `software-architect`.

## Process

### 1. Frame the question precisely

"Why is this here" is not investigable. "Why does the retry count default to 3 with
exponential backoff, rather than a fixed delay" is. Name the specific decision, the
specific code, and the specific alternative you are contrasting it with.

### 2. Read the code and what it says about itself

- The implementation, and the configuration default next to it.
- Comments, doc comments, `TODO`, `FIXME`, `HACK`, `XXX`, `WORKAROUND`, `NOTE`,
  `DEPRECATED`. These are the highest-value local evidence and they are routinely
  skipped.
- Naming that implies history: `legacy_`, `v2_`, `_old`, `deprecated_`.
- Tests that encode the behavior as intentional, especially regression tests with
  names that describe the incident that caused them.

### 3. Look for the recorded decision

Search the repository for a decision record or discussion: `docs/adr`, `docs/decisions`,
`RFC`, design docs, the changelog, issue templates referenced in comments, PR numbers
in comments. A PR or issue reference is a pointer, not the content — reading the
discussion itself requires the user or a network fetch you are allowed to make.

### 4. Use history when it is available

Git is often the best witness:

- `git log --oneline -- <path>` for the file's life story.
- `git log -S'<string>' --pickaxe-regex` to find when a specific value or line
  appeared, and `git log -L <start>,<end>:<file>` to follow the evolution of a block.
- `git blame` for the line, then `git show <sha>` for the full commit message and
  diff.

Commit messages are the closest thing most projects have to a written rationale; a
message that says "revert, caused by prod incident 4821" is evidence. A message that
says "fix stuff" is not.

### 5. Separate documented from inferred from absent

- **Documented.** Someone wrote the reason down. Quote or cite it.
- **Inferred.** You derived it from evidence. State the evidence and the reasoning in
  one line.
- **Unknown.** No record survives. Say so.

When the evidence is thin, give the two or three explanations that survive it, say what
would distinguish them, and stop. An honest "the history was squashed before this line
was added" is more useful than a confident narrative.

## Honest limits

State these when they apply instead of working around them silently:

- **History may not exist.** Shallow clones, squashed merges, imported code and fresh
  repositories hide the intermediate reasoning. So does a file that predates the
  repository.
- **History may be unreadable.** The environment may not permit Git queries, or the
  directory may not be a repository at all. If `git log` does not run, say that; do
  not simulate its output.
- **You cannot see conversations.** PR reviews, issue threads, chat and design
  discussions live outside the checkout. You know a discussion happened; you do not
  know what was said. Refer to it; do not paraphrase it.
- **You cannot see session or deployment history.** What ran, when, and what a given
  environment was configured to do are not recoverable from the code.
- **Commit authors are not available to explain their work.** An author name in `blame`
  is not consent to speculate about their reasoning.

## Presenting the answer

- Lead with the answer, then the evidence. If the answer is "nobody recorded it", say
  that in the first sentence.
- Cite precisely: file and line, commit sha and subject, doc name.
- Quote the decisive comment or commit message rather than paraphrasing it.
- Mark inference inline: "probably", and the reason — not buried in a footnote.
- End with what would settle it if the question still matters: the person to ask, the
  ticket to read, the experiment that would distinguish two explanations.
- **Never attribute intent to a person or a team you have no record of.**

## Interaction with other skills

- `how` — the companion explanation: mechanism and flow instead of rationale. Answer
  mechanism first when the question needs both.
- `understand-before-acting` — the same evidence gathering, done before a change;
  `why` ends in an account of intent, not in a safe edit.
- `research-first` — owns comparison of external options and open questions the local
  tree cannot answer.
- `read-the-f-docs` — supplies authoritative version facts that often explain an odd
  local choice; a workaround usually exists because of a documented constraint.
- `how-was-last-night` — recovers what happened in a previous session; `why` recovers
  why something was built a certain way.
- `software-architect` — judges whether the decision still makes sense now; `why`
  establishes what it was answering at the time.
- `follow-project-conventions` — tells you when a pattern must be preserved; `why`
  explains the pattern, and can justify a deliberate deviation.
- `mom-always-say-the-same` — keeps code, comments and docs agreeing; `why` finds
  the disagreement.
- `blast-radius` — what changing this decision would break downstream.
- `project-structure` — maps what exists. A surprising name or directory in that map is
  usually the `why` question worth asking.
- `verify-before-claiming` — the evidence standard a "why" answer must meet before you
  assert it.

## Anti-patterns

- Inventing a plausible history for code nobody documented.
- Reading commit subjects as if they were design records.
- Presenting one theory as fact when two fit the evidence equally well.
- Assuming intent from the author's era, seniority, or nationality. None of it is
  evidence.
- Answering "why" with a description of "what" and calling it done.
- Speculating about a production incident you cannot see.
- Declaring a pattern accidental because you found no comment saying it was deliberate.
- Using history as authority: a decision being old makes it historical, not correct.

## Definition of done

The answer names the decision precisely, cites the code, comment, document or commit it
rests on, marks every inference and every unknown as such, offers competing
explanations where the evidence is thin, and never attributes a historical decision to
anyone without a record.
