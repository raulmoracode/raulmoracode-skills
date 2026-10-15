# Convention discovery questions

Answer these from the codebase before writing a component. Every "ask a human"
answer is a last resort; the repository usually already answers.

## Stack and constraints

- Which language and version? Which package manager and lockfile?
- Which framework(s) and major versions?
- Any lint, format or type configuration that constrains style?

## File layout

- Where do components live? Flat, nested, or grouped by domain?
- Are implementation, styles and tests colocated, or separated?
- Are there barrel or index files? Hand-written or generated?
- What is the test directory convention (mirrored tree, `__tests__`, adjacent
  files)?

## Naming

- File naming: `kebab-case`, `PascalCase`, or both depending on kind?
- Suffix conventions: `*.test.*`, `*.spec.*`, `*.styles.*`, `*.types.*`?
- Type and interface naming; export style (named, default, both).

## Styling

- Styling system: utility classes, CSS modules, styled APIs, plain CSS?
- Where do design tokens come from? How are themes applied?
- Are global styles allowed? Which file owns them?
- Responsive conventions: breakpoints, container queries, mobile-first?

## Composition and state

- How do components receive data (properties, context, stores, hooks, signals)?
- How are events emitted or callbacks passed?
- Local-state conventions and limits; where does shared state live?
- How are loading and error states represented?

## Dependencies

- Which UI or utility libraries are already available?
- Is adding a dependency acceptable? Who reviews that decision?
- Are there internal or vendored packages preferred over ecosystem ones?

## Testing

- Runner, test framework, assertion style, mocking strategy.
- How are user interactions tested, if at all?
- Coverage expectations; are snapshot tests used, and where?
- What tests would a reviewer expect for this component?

## Documentation

- Doc comment convention for public APIs.
- READMEs per package or module? Example catalogs? Storybook-like tools?
- Changelog requirements for user-visible changes.

## Accessibility and internationalization

- ARIA or component-library conventions already in use.
- Focus-management patterns for overlays, dialogs and menus.
- Where do user-facing strings live? Any RTL or pluralization concerns?

## Integration

- How is a new component exported and consumed?
- Is there a registry, catalog or manifest to update?
- Which build and check commands must pass? List the exact commands.
