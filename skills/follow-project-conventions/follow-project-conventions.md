---
name: follow-project-conventions
description: "Matches the way an existing project already does things: architecture, file layout, naming and casing, module and export style, data flow, error handling, dependency policy, test placement and documentation. Use before writing or modifying code in an unfamiliar codebase, when the closest existing analog has not been identified, or when a change might be consistent in isolation but alien to the repository. Includes the rule for deviating deliberately when a convention is unsafe."
---

# Follow project conventions

Consistency is not politeness. It is what lets the next person predict your code, find
the thing they need, and change it without fear. A change that is technically correct
and structurally foreign costs more than it saves.

**Core rule:** a new file that does not look like its siblings is a defect, even when it
works.

## When to use

Use before writing or changing code whenever the repository's idiom is not already in
your head, and always when you create a new file, module, package, endpoint or test.

Do not use to:

- Decide what to build and in what order → `plan-before-coding`.
- Gather raw context about an unfamiliar area → `understand-before-acting`.
- Evaluate whether the architecture itself is right → `software-architect`.
- Decide how well the code is written → `code`.

Read `references/discovery-questions.md` when you are about to write code in a
repository whose conventions you have not confirmed, when you cannot name the closest
existing analog for the change, or when you are unsure where a new file belongs.

## What to match

- **Architecture.** Where responsibility lives, which layer owns what, how modules
  depend on each other, where the seams are.
- **Layout.** Folder structure, colocation of tests and styles, barrel or index files,
  generated code markers, the file set a feature is expected to produce.
- **Naming and casing.** Files, directories, types, functions, constants, booleans,
  events, environment variables, branches, and the suffixes in use (`*.test.*`,
  `*.types.*`, `-service.ts`).
- **Modules and exports.** Default versus named, one export per file or many, public
  entry points, index/manifest files that must be updated.
- **Style.** Formatter and linter configuration, line width, quote style, import order,
  comment density and tone, type strictness, null handling.
- **State and data flow.** Where state lives, how it is passed, how it is updated,
  where derived values come from, how async is expressed.
- **Error handling.** Throw, return a result, log, or emit an event. The project's
  idiom, its wrapping and cause preservation, its user-facing message style, and where
  errors cross a boundary.
- **Dependencies.** What is already used and accepted, whether new libraries are
  allowed, whether there are internal or vendored equivalents.
- **Testing.** Framework, runner, file placement, naming, assertion and mocking
  strategy, fixtures, coverage expectations.
- **Documentation.** Doc comment style, README sections, changelog policy, examples.
- **User-facing conventions.** Accessibility, internationalization, design tokens —
  only where the project already has them.

## Finding the analog

The fastest way to learn a convention is to copy the code that already follows it.

1. Search for the two or three existing implementations of the same kind of thing.
2. Read them fully, including their tests and their file siblings.
3. Mirror their structure exactly: same file set, same export shape, same ordering of
   concerns, same error handling, same comment density.
4. Where they disagree with each other, the more recent and more numerous one wins;
   if that is unclear, ask.

## When to deviate deliberately

Consistency is not a command to reproduce a defect. Deviate when a convention is
demonstrably unsafe, incompatible with the requirement, or superseded by the platform.

- **Do it in writing.** Say which convention you are breaking and why, in the same
  breath as the change — in the plan, in the report, or in a comment where a future
  reader will look.
- **Then follow the convention everywhere else.** One deliberate deviation, not a
  silent new house style.
- **Never deviate silently.** A reviewer who cannot tell whether it was an oversight
  or an argument will assume the worst.
- **Never deviate to show off.** Introducing a newer pattern in an old codebase is a
  refactor, and it belongs in its own change — see `minimal-changes`.

Security overrides consistency without discussion: if the project's pattern is
insecure, do not reproduce it. Say so and call `security-first`.

## Interaction with other skills

- `understand-before-acting` — reads the environment and the project's own
  instructions; this skill turns that reading into a style to match.
- `code` — the implementation craft; it applies these conventions once they are known.
- `plan-before-coding` — sequences the work, including any migration a convention
  change would require.
- `software-architect` — evaluates boundaries and coupling when no existing pattern
  fits.
- `blast-radius` — the forward cost of restructuring to match, or to break, a
  convention.
- `dad-always-say-the-same` — owns test placement and style in practice.
- `unslop` — removes the artifacts of generated code, including conventions invented
  because nobody read the repository first.
- `minimal-changes` — keeps a convention-driven fix from becoming a sweeping cleanup.
- `project-structure` — exposes the folder organization this skill turns into rules:
  where a new file belongs, which directory owns what. Use its tree as the input when
  the layout has to be described rather than changed.

## Anti-patterns

- Writing the first file and reading conventions afterward.
- Introducing a second way to do something the project already has a way to do.
- Guessing file placement from ecosystem convention instead of the repository's.
- Following an inconsistent majority over the dominant local pattern.
- Using a library the project already replaced, or one it deliberately avoids.
- Coupling new code to internals the project keeps private.
- Silently "modernizing" a module in the middle of an unrelated change.
- Adding a config option, flag or abstraction the project has no precedent for.
- Deviating without saying so.

## Definition of done

The change is structurally indistinguishable from the code around it — same layout,
naming, export shape, state flow, error idiom and test style — or every deliberate
deviation is stated explicitly with its reason.
