---
name: code
description: "Writes implementations that are correct, readable, maintainable and secure. Use when creating or modifying application code in any language: new features, bug fixes, functions, modules, API endpoints, components or scripts. Discovers the project's existing conventions and closest analog before writing, mirrors their structure, handles errors and edge states explicitly, and keeps the implementation proportional to the requirement instead of building speculative abstractions."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `follow-project-conventions`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Code

Produce code that a maintainer can change safely six months from now. The measure is not
cleverness: it is whether the next person can read it, trust it, and change it without
fear.

**Core rule:** write code that looks like the code around it, and make it do exactly what
was asked — no more.

## When to use

Use when you are about to create or modify executable code: a function, class, module,
endpoint, component, script, migration or configuration that changes behavior.

Do not use to:

- Explain how existing code works → `how`.
- Find out why existing code is the way it is → `why`.
- Review someone else's diff → `review-your-work`.
- Diagnose a defect whose cause is unknown → `debug-properly`.
- Evaluate whether the design itself is right → `software-architect`.

## Before writing

Never write the first line before reading the neighborhood.

1. **Find the closest analog.** Locate code solving a similar problem and mirror its
   structure: same file set, same export style, same naming, same error handling, same
   comment density. A new file that does not look like its siblings is a defect even when
   it works.
2. **Learn the conventions.** Naming and casing, folder and colocation rules, module and
   export style, how errors propagate, how dependencies are injected, how tests are
   laid out, which libraries are already accepted, and the exact commands that must pass.
   Use the `follow-project-conventions` skill; its
   `references/discovery-questions.md` is a usable checklist.
3. **Confirm the requirement.** State the intended behavior in one sentence, including how
   it fails. If you cannot, that is a question for the user or an item for
   `plan-before-coding` — not a guess.
4. **Check the working tree.** Uncommitted changes in the files you are about to touch are
   someone's work. Use `understand-before-acting` first.

## Writing the implementation

- **Smallest thing that fully solves the requirement.** Every line must trace to the
  request or to a correctness need. If you cannot say why a line exists, delete it.
- **Types and interfaces over convention.** Make illegal states unrepresentable where
  practical: model the variants explicitly rather than scattering sentinel values.
  Use the project's existing type vocabulary, not a parallel one.
- **Handle failure explicitly.** No swallowed exceptions, no ignored return values, no
  empty catch blocks. Fail in the idiom the project already uses: throw, return a result,
  or emit an error. Preserve the cause when wrapping.
- **Release what you acquire.** Files, sockets, locks, subscriptions and temporary state
  must be released on every path, including the failure path.
- **Enumerate the states.** Default, loading, empty, error, disabled, permission-denied,
  partial. Handling only the happy path is the most common cause of production incidents.
- **Validate untrusted input at the boundary.** Trust internal callers, distrust anything
  from a user, a network, a file or another service. See `security-first` for the
  security-specific pass; do not duplicate its checklist here.
- **Name for meaning.** Names state what a thing is or does. No `data`, `temp`, `value2`,
  `handleStuff`. Abbreviations require a reason that survives review.
- **Keep functions honest.** One job per function. Prefer early returns over nested
  conditionals. Extract only when it clarifies or when the same logic would otherwise be
  duplicated.
- **Comment the why, not the what.** A comment restating the code is noise. A comment
  explaining a constraint, a workaround, or a rejected alternative is valuable. A stale
  comment is worse than none — see `mom-always-say-the-same`.
- **No speculative generality.** Do not add parameters, options, hooks, strategies or
  configuration for requirements that do not exist yet. The cost is permanent; the
  benefit is hypothetical.
- **Performance where it matters.** Fix algorithmic problems (N+1 queries, unbounded
  growth, work repeated in a loop, blocking I/O on a hot path). Ignore micro-optimization
  that only matters in theory.

## User-facing code

If the change touches anything a person sees or operates:

- Use semantic elements and correct roles; labels persist, placeholders do not substitute.
- Every interactive element is reachable and operable by keyboard with a visible focus
  state, and has an accessible name.
- Honor `prefers-reduced-motion` when you add animation; never animate for decoration alone.
- Do not encode meaning in color alone.
- Reserve space for async content, images and fonts so nothing shifts unexpectedly.

## Interaction with other skills

- **Scope is `minimal-changes`:** touch only what the task requires; leave unrelated
  refactors, formatting sweeps and dependency upgrades out of the diff, and note them
  instead.
- **Quality of generated code is `unslop`:** if your own output has a wrapper with no
  behavior, a comment that restates the code, or an abstraction with one caller, clean it
  before handing over.
- **Conventions are `follow-project-conventions`.** When a project convention is
  demonstrably unsafe or incompatible with the requirement, say so explicitly and deviate
  deliberately rather than silently.
- **The frontend surface is `frontend-engineering`:** state, rendering, event handling,
  forms, validation, loading and error states, and the technical tests around them.

## Anti-patterns

- Writing code before reading the two closest existing examples.
- Inventing a helper, util or base class that the codebase already has.
- A new dependency when the standard library or an existing dependency does the job.
- Optional parameters everywhere "for flexibility", each one a compatibility promise.
- Catching an exception and logging it, then continuing as if nothing happened.
- Reformatting or renaming untouched code inside the same change.
- A comment that will be wrong the moment the code changes.
- Passing an untrusted value straight into a query, shell, template or filesystem path.
- Tests that assert the implementation restated back, so they pass forever and catch nothing.

## Definition of done

The behavior matches the stated requirement and its error paths are handled deliberately;
the change reads like the code around it; nothing speculative was added; the project's
checks pass; and every line in the diff can be justified against the request.
