---
name: unslop
description: "Detects and removes low-quality AI-generated code and prose: pass-through wrappers, abstractions with one caller, helpers nobody parameterized, comments that restate the code, swallowed exceptions, defensive checks of internal invariants, magic numbers, dead code, placeholder text, filler markup and padded sentences. Use when reviewing or cleaning generated output, when a diff or file looks finished but thin, or when asked to tighten, clean up, de-slop or de-bloat code, comments, docs or UI copy. Removes volume that carries no information while preserving behavior, error handling, validation and tests."
---

# Unslop

AI slop is output that looks finished and carries no information: a wrapper with one
caller, a helper nobody parameterized, a comment restating the line below it, an
exception swallowed whole, placeholder text, a paragraph padded to look substantial.
It is worse than an obvious mistake, because a glance review accepts it and the next
maintainer pays for it forever.

**Core rule:** cut what adds no information and keep what does. This is a quality
pass, not a length target. A long file with a clear job is not slop.

## When to use

Use when you are about to hand over generated code, docs, comments, markup or UI copy,
or when cleaning existing material: reviewing a diff, sweeping a file or a module, or
answering "this looks bloated", "why is this file 800 lines", "make this tighter",
"clean this up", "de-slop this".

Do not use to:

- Decide how much of the file to touch → `minimal-changes`.
- Reduce complexity of a design or a process → `simplify`.
- Write new code well in the first place → `code`.
- Find defects in the change → `review-your-work`.
- Make docs agree with the code → `mom-always-say-the-same`.

## Process

### 1. Fix what must survive

State in one sentence what the material must still do: for code, the inputs, outputs,
side effects and error cases; for prose, the claims a reader must be able to trust.
Everything else is a candidate. If you cannot state it, you are not ready to cut — that
is `code` or `plan-before-coding` work, not cleanup.

### 2. Scan for volume without information

Read `references/slop-catalog.md` when you need to recognize a pattern or see its
before and after. It covers wrappers, over-generalized helpers, restating comments,
docstrings on trivial functions, swallowed exceptions, defensive validation of internal
invariants, unnamed constants, speculative interfaces, near-duplicate logic, dead code,
placeholder text, inflated prose and filler markup.

### 3. Judge each candidate as slop or structure

Use the distinction below. Cleanups usually fail not because the wrong lines were cut
but because a real boundary was mistaken for a wrapper, or a wrapper was mistaken for
one.

### 4. Delete before you rewrite

Remove whole members first: dead code, unused parameters, restating comments,
commented-out blocks, placeholders. Run the checks. Only then collapse what is left,
one function at a time, keeping the change small enough to reason about. Collapsing is
a rewrite and it needs the deletions to have already proven the behavior.

### 5. Leave the protections alone

Never let this pass remove error handling, input validation at a trust boundary, an
authorization check, or a test. A candidate that looks like one of those is out of
scope: keep it and say so in the report instead of quietly editing it.

### 6. Report the removals and the kept suspects

List what you deleted and collapsed, by category and count. Name anything you left in
place that looked suspicious, and why. If the cleanup changes a public name, signature,
export or documented behavior, stop: that is a deliberate change and belongs to
`blast-radius` and the user, not to a tidy-up pass.

## Slop or structure

The question is not "is this layer thin" but "does it make a decision".

**Structure.** A repository over raw query code. An adapter over a foreign protocol. A
seam that isolates a volatile dependency so a test can substitute it. A validator that
owns an invariant and is called by two callers with different needs. Each holds a
decision the caller would otherwise have to make for itself, and the interface is where
that decision lives.

**Slop.** A function that forwards its arguments and returns the result, with one
caller. A helper whose third parameter has two callers and always passes `false`. A
class with one instance and no state. An interface with one implementation and one
caller. Each adds a hop in every stack trace, a name to keep in sync and a place for
the code to drift, in exchange for nothing.

Both look like indirection from a distance. Count the callers, then look for a decision.
Two callers and a real seam is structure. One caller and no semantics is slop.

## What must survive

- Error handling. Every caught exception either handles it or rethrows with its cause.
- Input validation where data enters the system. Interior checks of your own
  invariants, with no path that can reach the bad state, are slop — delete those.
- Authorization checks. A filter that looks redundant because every caller already
  filters is still the last wall; leave it.
- Tests. A cleanup that makes tests fail is not a cleanup until you know why.
- Comments carrying a constraint, a workaround, a rejected alternative or a link.

## Interaction with other skills

- `code` — the craft of writing an implementation well; unslop removes the artifacts of
  writing it badly.
- `minimal-changes` — owns the size of the diff; unslop owns what each remaining line is
  worth.
- `simplify` — owns complexity in the solution and in the process.
- `review-your-work` — finds defects in the finished diff; unslop removes what in it
  carries no information.
- `mom-always-say-the-same` — keeps code, docs, comments and examples consistent with
  one source; unslop removes the ones that are not.
- `blast-radius` — decides whether a public name or signature may change during a
  cleanup.
- `dad-always-say-the-same` — owns test design if a cleanup forces a test to change.

## Anti-patterns

- Chasing line count and compressing clear code into something clever.
- "Simplifying" a guard clause, a validator or an error message to save three lines.
- Deleting a test because it now fails instead of understanding the failure.
- Replacing one abstraction with three small ones and calling it a cleanup.
- Rewriting prose in a different voice to prove the pass happened.
- Folding an unrelated refactor into a tidy-up commit.

## Definition of done

Every line left in the touched material makes a decision, enforces a boundary, or
carries information the reader cannot derive from the code; error handling, boundary
validation, authorization and tests are intact; the project's checks pass; and the
report lists what was removed, what was kept and why.
