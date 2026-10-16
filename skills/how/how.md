---
name: how
description: "Explains how a system, component or process works: its architecture, the responsibilities of each part, the data and control flows, and the execution path of a request, job or event. Use for questions like 'how does this work', 'walk me through this', 'what calls this', 'where does the data go', 'trace this request', or when onboarding to an unfamiliar subsystem. Traces from code and configuration, and labels what is observed versus inferred."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-1
max-depth: 1
supports: [`understand-before-acting`]
```

Operational metadata only; related skills are conceptual unless listed here.

# How

An explanation is only useful if it is true and checkable. Every claim about a system
should point at a file, a line, a log line or a document — and anything you could not
verify must be labeled as inference rather than presented as fact.

**Core rule:** explain mechanism from evidence, and say plainly where the evidence
stops.

## How this differs from `why`

`how` describes the machine: what the parts are and what happens between them, in
order, every time. `why` describes the reasoning: why this design was chosen over the
alternatives, and what happened historically. A trace of the request pipeline is `how`;
the decision to make that pipeline synchronous is `why`. Both are common in one
question — answer the mechanism first, then offer the rationale if you have evidence
for it, or hand it to `why`.

## When to use

- "How does this work?", "walk me through this", "what does this module do?"
- "Where does this value come from?", "what happens when this endpoint is called?"
- "What calls this function?", "what reads this table?", "what writes this file?"
- Onboarding to a subsystem before changing it — `understand-before-acting` covers the
  gathering, this covers the telling.

Do not use to:

- Find out why a decision was made → `why`.
- Compare external options or resolve an open question → `research-first`.
- Look up an API's authoritative documented behavior → `read-the-f-docs`.
- Sequence work you are about to do → `plan-before-coding`.

## Process

### 1. Bound the question

Restate what is being asked in one sentence, at a specific level. "How does auth
work" is a library; "how does a request become an authenticated user in this service" is
answerable. Ask for the level when the scope is genuinely ambiguous, or answer the
narrowest useful version and say which one you answered.

### 2. Find the parts

List the components involved: entry points, routers, handlers, services, stores,
adapters, queues, background jobs, migrations, configuration. Name the file for each.
If a part has no file, say so — it may be external, generated or simply absent.

### 3. Trace the path

Follow one concrete instance end to end: a request, a job, a click, a row. Record the
order of calls, the data at each hop, the branches taken, the state read and written,
and every external boundary crossed. Read the body of each function you traverse, not
just its signature.

### 4. Map the edges

What calls this, what this calls, what it depends on at runtime, which configuration
keys and environment variables change its behavior, which data it reads and which it
writes. Note the boundaries where control leaves the process.

### 5. Check the tests and the docs

Tests often state the intended behavior more precisely than the code does, and they
are executable. READMEs, architecture notes and ADRs state the intended design. Where
they disagree with the implementation, say so — that disagreement is usually the most
valuable part of the answer.

### 6. Separate what you saw from what you think

Label each part of the answer:

- **Observed** — read directly in the code, a test, a config file or a log.
- **Documented** — stated in a comment, README, ADR or issue reference, which may or
  not match the code.
- **Inferred** — your conclusion from the evidence, with the reasoning given in one
  line so the reader can disagree.

## Shape of a good answer

- **One sentence first.** What the thing does, for whom, before any detail.
- **The cast list.** Components and their one-line responsibilities, each with a file.
- **The trace.** The ordered path of one real instance, with branches and data.
- **The edges.** What depends on what, and what crosses a process or network boundary.
- **The oddities.** Timeouts, retries, caches, locks, background work, ordering
  assumptions — the parts that surprise people.
- **Where I looked.** The files you actually read, so the answer can be checked.

Match the depth to the question. A one-line question gets one sentence plus the file
name, not an architecture document. Stop when the next level of detail would not change
the reader's next action.

## Handling what you cannot see

State the limit instead of filling it. You may not be able to run the system, observe a
queue, inspect a third-party service, or know which configuration value a deployment
actually uses. Say "the config defaults to X; whether production overrides it I could
not determine from the repository" — that is a useful sentence, and a confident guess
is not. Use `research-first` when the gap is worth closing, or ask the user when only
they know.

## Interaction with other skills

- `why` — the other half of any good explanation: rationale and history instead of
  mechanism and flow.
- `understand-before-acting` — the same reading, done to prepare for a change; `how`
  has no change behind it, it ends in an explanation.
- `project-structure` — the map of what lives where; `how` is what happens there. Start
  from the tree for a layout question and from a trace for a behavior question.
- `research-first` — owns open questions that local code cannot settle, and comparing
  alternatives.
- `read-the-f-docs` — owns authoritative, version-specific behavior of external tools
  and libraries, which is often where a trace dead-ends.
- `how-was-last-night` — for what happened in a previous session, not what the code
  does.
- `follow-project-conventions` — explains the idiom the code follows; `how` explains
  what the code does.
- `review-your-work` — reviews a change; `how` explains the system it lands in.
- `show-your-work` — surfaces the evidence trail while you gather it.
- `clear-final-report` — for delivering a change, not an explanation.

## Anti-patterns

- Explaining from file names and imports without reading the bodies.
- Guessing at a step you could not find, and writing it as if you had.
- Describing the framework's usual behavior instead of this codebase's behavior.
- Producing an exhaustive architecture tour when one question was asked.
- Presenting inference in the same voice as observation.
- Stopping at the first hop because the answer is already "obvious".
- Explaining the ideal design rather than the code that exists.

## Definition of done

The answer states the components and the ordered flow with a file behind each claim,
labels observed, documented and inferred separately, names the files you actually read,
and is no more detailed than the question required.
