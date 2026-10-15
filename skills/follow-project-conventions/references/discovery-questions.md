# Convention discovery questions

Answer these from the repository before you write. Every question has a cheap, concrete
way to answer it. The repository almost always knows; asking a human is the last
resort.

## Toolchain and constraints

- Which language and version do the sources target? Check manifests, lockfiles and CI
  images, not README prose.
- Which package manager and lockfile? Which registries, mirrors or vendored sources?
- Which framework, runtime or major dependency versions are actually installed?
- Which linter, formatter and type checker, and what configuration file governs them?
  What strictness level does the type checker enforce?
- Which CI workflow gates a merge, and what does it actually run?

## File layout and colocation

- Where does code of this kind live? Flat, nested by feature, or grouped by layer?
- Are tests and styles colocated with the source or separated into their own trees?
- Does the project use barrel, index or `__init__` files? Are they hand-written,
  generated, or lint-forbidden?
- Is there generated code in the tree, and what marks it as generated?
- Which directories are off limits — vendored, archived, frozen, deprecated?

## Naming and casing

- File and directory casing: `kebab-case`, `snake_case`, `PascalCase`, `camelCase`,
  and does the choice vary by kind of file?
- Type, interface, constant and boolean naming: prefixes, suffixes, singular or plural?
- Suffix conventions in use: `*.test.*`, `*.spec.*`, `*.types.*`, `*.styles.*`,
  `-service`, `-repo`, `-utils`?
- Environment variables, feature flags, API paths, event names, database tables —
  what case and separator does each use?

## Modules and exports

- Named exports, default exports, or both? One export per file or many?
- What is the public entry point, and what must be added to expose a new module?
- How are symbols imported — namespace, named, deep path? Does an alias exist?
- Are types exported alongside values, or from a separate declaration file?
- Is there a public API surface, barrel or manifest that breaks when it changes?

## State and data flow

- Where does state live: globals, stores, context, hooks, parameters, a database?
- How is data passed between layers — arguments, return values, events, dependency
  injection?
- How is async expressed: promises, generators, callbacks, `async`/`await`, a task
  runner? How are cancellation and timeouts handled?
- How is derived state computed, cached or memoized? Is caching a project pattern or
  forbidden?
- How are immutability and shared mutation handled in this codebase?
- What is the project's convention for logging and tracing: logger instance, structured
  fields, levels, redaction?

## Errors and failure

- Throw, return a result object, or return an error code? Which layer decides?
- How is an underlying cause wrapped and preserved?
- What is the user-facing message convention, and where are messages defined?
- Which errors are expected and handled, which are logged, which propagate?
- How are panics, crashes or non-zero exits signaled in scripts and CLIs?

## Dependencies

- Which libraries are already used for this kind of problem?
- Is adding a dependency acceptable, and who approves it? Is there a vendored or
  internal equivalent?
- Is there a banned or recently replaced dependency list?
- How are versions pinned, and does the lockfile have to be updated by hand?

## Testing

- Which runner and framework, and which assertion style?
- Where do tests live, and what are they named?
- How is mocking done — library, hand-written doubles, dependency injection at seams?
  Which kinds of unit are never mocked?
- Are fixtures, factories, builders or shared helpers defined, and where?
- Are snapshot or golden tests used, and where do the snapshots live?
- What must a new change add: a unit test, an integration test, both?
- How are slow, flaky, network-dependent or time-dependent tests handled?

## Documentation and comments

- Doc comment convention for public functions, types and modules. Which section order?
- README per package or module? Examples directory or runnable examples?
- Changelog or release-note requirement for user-visible changes, and its exact format?
- Which docs describe the architecture, and are they expected to be updated with code?

## User-facing conventions

- Accessibility: roles, focus management, keyboard handling, announcement patterns.
  Which base components or primitives must be used?
- Internationalization: where strings live, how they are keyed, pluralization, RTL and
  date or number formatting.
- Design tokens: where they are defined and how they are referenced. Are raw values
  acceptable?

## Compatibility

- What must stay backward compatible: public API, data formats, config keys, CLI
  flags, database schema, serialized state?
- Is there a deprecation policy — annotation, changelog entry, removal version?
- Does the project pin minimum versions for clients or consumers?

## Commands that must pass

List the exact commands, copyable, before you start. Typical set:

- Install: the project's own install command.
- Build: the build or compile target.
- Type check: the type checker invocation.
- Lint and format check: both, separately if they are separate.
- Tests: the fast suite, and the full suite.
- Anything else this repository defines as a check target.

Confirm each one runs in the project, and confirm its result on the unmodified tree, so
a pre-existing failure is not later reported as yours.

## Closest existing analog

Before writing, identify the code that already solves this problem:

- Which two or three files most resemble what you are about to create?
- What is their full file set — source, types, tests, styles, docs?
- What structure do they share: ordering of concerns, export shape, internal helpers?
- Where do they disagree with each other, and which is newer and more common?
- Is there a pattern they follow that is written down somewhere you have not read?
