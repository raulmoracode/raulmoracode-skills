---
name: research-first
description: "Answers open questions with evidence before a decision is made. Use when a choice depends on facts you do not have: which library, tool or approach to use, whether something is supported, fast enough or still maintained, how prior art solved the same problem, or before asserting something you have not verified. Names the questions, ranks sources by authority, compares alternatives, separates fact from assumption, stops when the evidence is sufficient, and reports what the findings change."
---

# Research first

Some questions are answered by reading the repository. Others are not: whether a
library is maintained, whether an approach scales, what a protocol actually
guarantees, which failure someone already hit. This skill turns "I am not sure"
into a short list of answers, each traceable to a source, each ending in a
decision.

**Core rule:** answer the specific question with evidence, then stop. Research that
cannot change a decision is wasted effort.

## When to use

Use when a decision is blocked on something you do not know:

- Choosing between approaches, libraries or tools where fit matters.
- Checking whether something is possible, supported, maintained or fast enough.
- Establishing prior art, an upstream issue, or how a comparable project solved it.
- Testing a belief you formed from a fast read before building on top of it.
- The user asked you to look something up, compare something, or check the facts.

Do not use to:

- Look up a signature, flag, default or config key → `read-the-f-docs`.
- Learn how this repository works → `understand-before-acting`.
- Explain why the project already chose something → `why`.
- Judge whether a design is sound → `software-architect`.
- Sequence the work → `plan-before-coding`.

## Process

This skill owns the investigation loop: the questions, the sources, the comparison,
the stopping rule and the findings report.

### 1. Write the questions down

One line per question, phrased so it can be answered or declared unanswerable.
"Is this fast enough" is not a question; "does it sustain 50k writes per second
with 10% error" is. Next to each one, name the decision it unblocks. A question
that unblocks nothing gets deleted, not researched.

### 2. Pick sources by authority

Read `## Source quality` below and start as high on that list as the question
allows. Descend only when the higher tier does not answer it. Do not begin with a
search engine: begin with the thing that defines the behavior.

### 3. Gather, with a budget

Work the questions in order of decision impact, not of curiosity. For each one, stop
as soon as one good source answers it. Track what you have already read so you do
not read it twice, and do not open a third source for a question two sources already
agree on.

### 4. Compare alternatives on evidence

When the question is a choice, put the candidates in a table with the same columns:
fit for this codebase, maintenance state, cost of adoption, the risk if it is wrong,
and the evidence behind each cell. State which criterion decided it. If the
criterion is taste, say so instead of dressing it up as analysis.

### 5. Separate fact from assumption

Label every conclusion:

- **Documented** — a source states it, and you opened that source.
- **Observed** — you ran it and saw the result.
- **Inferred** — you reasoned from the two above. Say which reasoning.
- **Assumed** — nobody knows yet. Say what it would cost to be wrong.

An assumption presented as a fact is the failure this skill exists to prevent.

### 6. Report findings and their implications

Answer, evidence, confidence, and what changes. Details in `## Reporting findings`.

## Source quality

Consult in this order and stop descending as soon as the answer is solid:

1. **Primary and official** — specifications, upstream documentation, source code,
   release notes, the tool itself run locally (`--help`, `--version`, a probe).
2. **This repository** — lockfiles, existing dependencies, prior code, vendored
   copies, issue history. A dependency already installed and already used outranks
   anything you could download.
3. **Curated secondary** — maintainer posts, conference talks, technical articles
   that name their sources and carry a date.
4. **Community** — forum threads, issue comments, Q&A. Good for finding the symptom
   and the vocabulary; rarely authoritative for behavior. Treat as leads.
5. **Aggregated or generated summaries** — unverified until you find the claim in a
   primary source. They compress away exactly the caveats you need.

Prefer a dated primary source over an undated page. Prefer the maintainer over a
report about the maintainer. Check that a version number in the source matches the
one you will actually use.

## When to stop

- One primary source answers the question directly: stop.
- Two independent sources agree and you can name them: stop.
- The next source would be lower quality than the one that already answered it: stop.
- The answer would not change any decision you are going to make: stop.
- Three serious attempts have not produced a usable answer: stop, mark the question
  unknown, and name the cheapest next probe.
- Two sources disagree: do not average them. Report both, say which you trust and
  why, and state what you will do under each possibility.

Stopping is a decision, not running out of patience. Write down why you stopped.

## Reporting findings

Keep the report to what a decision-maker needs, in this order:

- **Answer** — one sentence per question, or "unresolved" with the reason.
- **Evidence** — what you read or ran, with version and date. Only sources you opened.
- **Confidence** — high, medium or low, with the reason it is not higher.
- **Implications** — what this changes in the plan, and what it does not change.
- **Still unknown** — remaining gaps and the specific probe that would close each.

State contradictions and abandoned lines of inquiry. A report that hides a dead end
is misleading about how settled the conclusion is.

## Interaction with other skills

- `read-the-f-docs` — narrow, version-specific lookups of authoritative API and tool
  documentation. It returns a fact; this skill decides what to do with the answers.
- `understand-before-acting` — the answer to "what does this codebase already
  contain" comes from reading code, not from searching.
- `why` — rationale and history of choices the project already made.
- `software-architect` — owns the design verdict; this skill supplies the evidence
  it weighs, and does not render the architecture decision.
- `plan-before-coding` — converts findings into ordered work with acceptance criteria.
- `blast-radius` — forward-looking consequences of acting on a finding.
- `dont-ask-shit` — when a gap is cheap to close by investigation, close it instead of
  asking the user.
- `no-made-up-results` and `verify-before-claiming` — never cite a source you did not
  open, or present an inference as a documented fact.

## Anti-patterns

- Researching a question the repository already answers.
- Starting at a search result instead of the primary source.
- Citing a page you skimmed or never opened.
- Treating a tutorial's omission as proof that a default does not exist.
- Applying advice written for a different version, language or scale.
- Collecting findings without saying which decision each one changes.
- Researching until the budget runs out instead of until the question is answered.
- Presenting a hedged, unresolved question as a settled conclusion.
- Using research to avoid implementing.

## Definition of done

Every question has an answer or a stated unknown. Every claim traces to a source you
actually opened, cited with its version and date. Conflicting sources are reported
rather than smoothed over. The report says which decisions change and which do not,
and the investigation stopped at the point where further reading would not have
changed the outcome.
