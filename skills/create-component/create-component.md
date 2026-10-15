---
name: create-component
description: "Creates reusable components that follow the target project's conventions, architecture and technology stack. Use when asked to add a component such as a UI element, service, module or utility: discovers existing conventions for naming, file layout, styling and testing first, then implements, tests, documents and integrates the component. Language and framework agnostic."
---

# Create Component

Add a new reusable component to an existing project without fighting its conventions.
The classic failure mode is a technically correct component that looks nothing like
the code around it; this skill exists to prevent that.

**Core rule:** discover first, define second, implement third. A component that is not
demanded by real use cases does not need to exist yet.

## Phase 1 — Discover the project

Spend real effort here; it determines the quality of everything after. Read code, do
not guess.

- Language, framework and version constraints (check lockfiles and manifests).
- File layout: colocation rules, folder naming, barrel or index files, test
  placement.
- Naming: casing and suffixes for files, types, tests and styles.
- Styling: tokens, theming, styling system, class naming, responsive conventions.
- State and data flow: how components get data, emit events, manage local state.
- Dependencies allowed: which libraries are already available and accepted.
- Testing: framework, runner, naming, mocking conventions, coverage expectations.
- Documentation: doc comments, READMEs, example catalogs, changelog requirements.
- Accessibility and internationalization conventions, if the project has them.
- Build and lint toolchain: the exact commands that must pass.

**Find the closest existing analog** — a component solving a similar problem — and
plan to mirror it. When the project is large, search for three usages of a similar
pattern before writing anything.

> `references/discovery-questions.md` contains a fuller question checklist.

## Phase 2 — Define the component

- One clear responsibility, stated in a sentence. If it needs "and", split it.
- Public surface: inputs, outputs, callbacks, slots or children, defaults. Keep it
  minimal; every option is a compatibility promise.
- States and variants: enumerate them (default, loading, disabled, error, …) and
  decide which belong to the component and which to the caller.
- Boundaries: what the component does not do (data fetching, routing, persistence),
  unless the project's conventions say otherwise.
- Composition: prefer small focused pieces over one configuration-heavy
  mega-component.
- If practical, name the behaviors the component must satisfy before implementing —
  a lightweight contract to test against.

## Phase 3 — Implement

- Follow the analog's structure: the same file set (implementation, styles, tests,
  docs), the same export style, the same patterns for inputs and types.
- Keep side effects isolated and injectable; avoid hidden global state.
- Handle every declared state explicitly; no silent no-ops.
- Surface errors in the project's idiomatic way (throw, return value, result object,
  error event) — match the surrounding code.
- Respect accessibility for anything user-facing: semantics, keyboard, labels,
  focus, announcements.
- Write doc comments in the project's style: purpose, parameters, return value, and
  an example for non-obvious input.
- No unrelated refactors in the same change. Note them for later instead.

## Phase 4 — Test

- Mirror the project's test layout and naming; use its runner and helpers.
- Test behavior, not implementation details: given inputs and states, assert
  outputs, rendered results or emitted events.
- Cover: default path, each variant, edge inputs, error paths, async timing,
  cleanup.
- For UI: test keyboard interaction and accessible roles and names, not pixel
  styling.
- For logic: test boundaries and failure modes, not trivial delegation.
- Run the project's full check command (lint, types, tests), not only the new test
  file.

## Phase 5 — Document

- Follow project conventions: doc comment, README section, example page, catalog
  entry or changelog note.
- Include a minimal usage example for the primary case, plus the important
  variants.
- Document non-obvious behavior, required setup and limitations.
- If the project publishes packages, update the public surface (export list, entry
  points) the way the project does.

## Phase 6 — Integrate and verify

- Use the component in at least one real call site (the case that motivated it), or
  add it to the project's showcase if that is the convention.
- Verify the full pipeline: build, typecheck, lint, tests, plus a manual smoke check
  where a UI is involved.
- Review your own diff with fresh eyes (or run the `code-review` skill): does it
  look like the rest of the project?

## Naming and layout guidance

- Prefer names that describe purpose, not appearance.
- Match casing exactly: if the project uses kebab-case folders and PascalCase
  files, do the same.
- Keep the file set symmetric with sibling components; a reviewer should not be
  able to tell yours apart structurally.
- Colocate styles and tests only if the project does; otherwise follow its global
  layout.

## When not to create a component

- Only one call site with no near-term reuse: inline it first.
- The abstraction would encode a guess about future requirements.
- The "component" would merely wrap an existing primitive with no added semantics.
- The need is better solved by configuring an existing component.

Prefer deferring structure until the second or third real use case.

## Checklist

- [ ] Conventions discovered from real code, not assumed.
- [ ] Closest existing analog identified and mirrored.
- [ ] Single responsibility; minimal public surface; states enumerated.
- [ ] Implementation matches project patterns and dependency policy.
- [ ] Accessibility and i18n conventions respected (if user-facing).
- [ ] Tests added in the project's style; edge and error paths covered.
- [ ] Documentation or examples added where the project expects them.
- [ ] Exports updated and the component used (or showcased) somewhere real.
- [ ] Lint, typecheck, tests and build pass.
- [ ] No unrelated changes in the same diff.

## Definition of done

A reviewer familiar with the project cannot tell the new component apart from the
hand-written ones; it does one thing, behaves correctly in all its states, is tested
and documented per convention, and integrates through the project's normal build and
check pipeline.
