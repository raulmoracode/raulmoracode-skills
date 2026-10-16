---
name: verify-before-claiming
description: "Sets the evidence standard a claim must clear before it is stated. Every claim about completed work or observed behavior is placed on the evidence ladder — observed and checked, observed, inferred, assumed, unknown — and its language is raised or lowered to match: what the build command actually exited, what the test run actually printed, what was read versus deduced. Use before asserting that something works, is fixed, passes, is the convention, is safe, or is done, and when deciding whether one more check is worth running."
---
## Composition

```yaml
role: policy
direct-invocation: yes
support-limit: 0
max-depth: 0
supports: []
```

Operational metadata only; related skills are conceptual unless listed here.

# Verify before claiming

Most wrong agent work is not a bad edit. It is a confident sentence attached to a
guess. The edit may be fine; the claim that it is finished, safe or correct is what
misleads the user, and once believed it is never re-examined.

**Core rule:** before you state a claim, decide which rung of evidence you are standing
on, and write the claim at that height — not higher because it sounds better.

## When to use

Every time you are about to assert something about work or behavior: that a change
works, is fixed, passes, builds, matches convention, is secure, is faster, or is
complete. Also when deciding whether a claim is worth one more check.

Do not use to:

- Run the checks → `test-before-finishing` decides and runs them.
- Review the diff → `review-your-work`.
- Fabricate is never permitted → `no-made-up-results` is the floor under this skill.

## The evidence ladder

Every claim sits on one of these five rungs. Name the rung mentally before you write
the sentence; the wording follows from it.

| Rung | What it means | Language it licenses |
| --- | --- | --- |
| **Observed and checked** | You ran it and examined the output | "The build passes: `npm run build` exited 0." |
| **Observed** | You saw the output, but it does not cover the whole claim | "The four tests I added pass; I did not run the full suite." |
| **Inferred** | Deduced from something you did observe | "Since the parser runs before validation, the same crash applies to the webhook." |
| **Assumed** | Taken as true, unchecked | "Assuming the worker is single-consumer, this ordering is safe." |
| **Unknown** | Not established | "I did not check whether the migration is reversible." |

Moving up a rung is work: reading the file, running the command, asking the user.
Moving down is free, and honest. Most claims are legitimate at Observed or Inferred;
the failure is stating an Observed claim in Critical language.

## Process

### 1. List the claims you are about to make

Write them out before writing prose. A report usually contains three to eight claims,
mixed together: one about a code change, several about checks, one about behavior,
one about something you could not determine. Listing them separates them.

### 2. Place each one on the ladder

For each claim, ask: what did I actually run, read or see? If the answer is "nothing
specific", it is Assumed or Unknown, whatever it feels like.

### 3. Decide whether to raise the rung

Some rungs are cheap to raise. A claim about a file's contents moves from Assumed to
Observed with one read. A claim that a check passed moves from Inferred to Observed
and checked by running it. Do that when the claim is load-bearing, and skip it when
the cost clearly exceeds the risk of being wrong.

Read `references/evidence-standards.md` for the evidence each common kind of claim
requires, and for when to stop verifying.

### 4. Write the claim at its rung

State what you observed, name the command, and bound the claim. "All tests pass" is
almost never accurate; "the full suite passed on my run: 412 passed, 0 failed" is
both accurate and useful.

## Accurate hedging

Hedging is not weakness. A precisely bounded claim is more trustworthy than an
unbounded one, and it tells the user exactly where to look if they disagree.

| Instead of | Say |
| --- | --- |
| "The tests pass." | "`npm test` exited 0: 412 passing, 0 failing." |
| "It builds." | "`pnpm build` exited 0 in my run; I did not build for other targets." |
| "This follows the project convention." | "`follow-project-conventions`: every existing handler under `src/http/` parses the body the same way." |
| "It's fixed." | "The reproduction I added now returns 200; I did not test inputs other than the reported one." |
| "This is safe." | "No untrusted input reaches the query on this path; I did not audit the other three callers." |
| "It's faster." | "p95 went from 40 ms to 12 ms over one local run; not a benchmark." |
| "Nothing else uses this." | "`rg deprecatedField` returns only this file and its test." |
| "This should be fine on Windows." | "I did not run on Windows; the code uses posix path separators." |

Words that do real work: **in my run**, **the full suite**, **I did not check**,
**assuming**, **based on X**, **not verified**. Words that do not: **obviously**,
**clearly**, **should**, **of course**, **presumably**, **no doubt**.

## Claiming a task is complete

"Done" is a claim, and it is the strongest one you will make. It requires:

- The applicable checks actually run, each named by command, with their real outcome.
  A check you chose not to run is reported as not run, not as passing.
- The acceptance criteria of the task satisfied, or explicitly listed as not satisfied.
- Nothing in the working tree left half-edited, and nothing you changed still failing
  that you did not know about.
- Known limitations named: what you did not test, what you assumed, what is left for
  someone else.

A partial result reported as partial is a good outcome. A partial result reported as
complete is the failure this skill exists to prevent.

## Interaction with other skills

- `no-made-up-results` — the prohibition this skill sits inside: no invented output,
  ever, at any rung.
- `test-before-finishing` — owns executing the checks; this skill decides what
  evidence a claim about their result requires.
- `clear-final-report` — owns the final summary; it inherits the rung of every claim
  you hand it.
- `review-your-work` — produces the findings a claim about the change rests on.
- `show-your-work` — surfaces claims and their evidence while the work is still
  running.
- `debug-properly` — owns producing real evidence for a root cause instead of a
  plausible story.
- `research-first` and `read-the-f-docs` — supply the observed evidence behind claims
  about external facts and version-specific APIs.
- `dont-f-my-tokens` — decides when a further check is worth its cost; this skill
  decides what a claim needs before it is stated.

## Anti-patterns

- Claiming "works" from code that reads correctly.
- Reporting a check you skipped because you expected it to pass.
- Hedging so vaguely that the sentence carries no information at all.
- Upgrading "I read the file" into "I verified the behavior".
- Burying the one Unknown in the middle of a paragraph of confident claims.
- Re-checking the same thing three times while an unverified load-bearing claim sits
  untouched.
- Treating a high rung as required for every sentence, including ones that do not
  matter.

## Definition of done

Every claim in the output sits on a named rung; anything load-bearing is at Observed
and checked, or stated as bounded; completion claims name the checks that ran and
their outcomes; assumptions and unknowns are labeled as such; and the language of
each sentence matches the strength of the evidence behind it.
