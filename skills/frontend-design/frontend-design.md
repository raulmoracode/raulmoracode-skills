---
name: frontend-design
description: "Designs and implements distinctive, high-quality frontend interfaces in any web project. Use when creating new UI, redesigning existing screens, or raising the quality of an interface: establishes visual direction, typography, color, layout and motion; enforces accessibility and consistency; and audits implementation quality. Inspects the project's existing framework, styling system, component patterns and design tokens first and adapts to them. Framework and language agnostic."
---

# Frontend Design

Produce interfaces that feel intentional and considered: clear hierarchy, confident
typography, honest usability, and no accidental "default template" look. This skill is
framework and language agnostic. It applies equally to a plain HTML page, a component
library, and a full application shell.

**Core principle:** every visual decision should be explainable. If you cannot say why
something looks the way it does, it is not a design decision yet.

## Process

### 1. Inspect the project before changing anything

Never design in a vacuum. Before writing markup or styles, determine:

- Framework and rendering model (server-rendered, client-rendered, static).
- Styling system (utility classes, CSS modules, preprocessors, CSS-in-JS, plain CSS).
- Design tokens already defined: colors, type scale, spacing, radii, shadows,
  z-indexes, breakpoints.
- Component patterns: naming, folder layout, composition style, variant conventions.
- Icon, image and illustration conventions.
- Existing accessibility baseline (focus treatment, ARIA patterns, test tooling).

If a token set or design system exists, extend it; do not invent a parallel one. When
a new token is truly needed, name it following the existing scheme and document it
where the others live.

### 2. State the design intent

Write one or two sentences describing what the interface should communicate, and for
whom. Generic example: "A dense operations dashboard used daily by engineers: calm,
scannable, minimal chrome, strong data hierarchy."

The intent drives everything else:

- Mood and density (airy marketing surface vs. dense working tool).
- The single primary action of each screen; everything else is secondary.
- What to remove. Interfaces usually fail from excess, not omission.

### 3. Commit to a direction

Choose a small number of strong decisions and carry them through:

- One dominant layout idea per surface.
- A type stance (see Typography below).
- A restrained palette anchored on token values.
- One density and spacing rhythm for the whole surface.

Three coherent decisions beat ten unrelated embellishments.

### 4. Build in passes

1. Structure — semantic, unstyled markup. Confirm the reading order makes sense
   without CSS.
2. Layout — flow, grid, alignment, spacing rhythm, container-level responsiveness.
3. Typography — hierarchy, scale, measure, rhythm.
4. Color and surfaces — background layers, borders, states.
5. Motion and detail — transitions, hover and focus feedback, micro-interactions.

After each later pass, re-check the earlier ones. Polish must never break structure.

## Typography

- Prefer the project's existing font stack. Only introduce fonts deliberately, and
  prefer one well-chosen family over several.
- Define a deliberate scale, typically 4 to 6 steps per screen. Avoid arbitrary
  one-off font sizes.
- Keep body measure around 45–75 characters; set line height per context (tighter at
  display sizes, looser for body text).
- Reach for weight, case and spacing before adding new sizes or colors.
- Use tabular numerals anywhere numbers are compared or aligned.
- Load only the weights and styles actually used; prevent layout shift when fonts
  load (loading strategy, reserved space, sensible fallbacks).

## Color

- Start from the existing palette. If none exists, derive a small system: background
  layers, text levels, one accent, plus semantic states (success, warning, danger).
- Define colors as semantic tokens (surface, border, text-muted, …), not raw hex
  values scattered across files.
- Check contrast deliberately: body text should meet WCAG AA (4.5:1); large or
  non-essential text at least 3:1.
- Never encode meaning in color alone; pair it with text, iconography or shape.
- Design light and dark surfaces together when the project supports both, and test
  both.

## Layout and spacing

- Use the project's spacing scale. When none exists, adopt a simple 4px/8px-based
  rhythm and apply it consistently.
- Align to a grid you can name (columns, container width, gutters). Intentional
  asymmetry is fine; accidental misalignment is not.
- Group related content with proximity, not boxes. Add borders and containers only
  when they carry meaning.
- Let hierarchy come from size, weight, spacing and position — in that order — before
  color.
- Handle content extremes: very long words, missing images, 10 items and 10,000
  items.
- Verify the layout at small and large viewports and at 200% zoom.

## Motion and interaction

- Animate to explain change (movement, hierarchy, continuity), not to decorate.
- Keep durations short: roughly 120–250ms for UI feedback; longer only for large
  spatial transitions.
- Respect `prefers-reduced-motion`; provide a non-animated equivalent.
- Prefer transform and opacity animations; avoid animating layout properties.
- Every interactive element needs visible hover, focus, active and disabled states.

## Accessibility

- Semantic elements first: buttons for actions, links for navigation, headings in
  order, lists for lists, labels for inputs.
- Full keyboard operability: reachable, operable, with a visible focus indicator of
  sufficient contrast.
- Form fields need persistent labels, clear error text tied to the field, and
  sensible autocomplete attributes.
- Announce dynamic changes appropriately (status messages, live regions) without
  spamming assistive technology.
- Provide text alternatives for meaningful images; mark purely decorative ones.
- Ensure touch targets are comfortably sized (roughly 44×44px, or the platform
  convention) and spaced.
- Test with a keyboard and, when available, a screen reader — not just visually.

## States and resilience

Design every state, not just the happy path:

- Loading (skeletons or placeholders that match the final layout to avoid shift).
- Empty (explain what will appear and how to create it).
- Error (plain-language cause and a recovery action).
- Partial or stale data.
- Disabled controls with an explanation of why.
- Long, short and localized text (some languages run much longer).

## Consistency and implementation quality

- Reuse existing primitives; create a new primitive only when the third use case
  appears.
- Keep component APIs stable and their styling variants named, not ad hoc.
- Follow the project's file, naming and export conventions exactly.
- Avoid layout shift: reserve space for media, sticky elements and async content.
- Keep DOM structure shallow and class usage purposeful; delete dead styles.
- Verify with the project's own tooling: lint, type checks, tests and a
  production-like build.

## Ship checklist

- [ ] Intent written down; design decisions traceable to it.
- [ ] Existing tokens, components and conventions reused where possible.
- [ ] Hierarchy clear at a glance; primary action obvious per screen.
- [ ] Typography scale deliberate; measure comfortable; no orphan sizes.
- [ ] Contrast checked in light and dark themes.
- [ ] Keyboard path works end to end; focus visible everywhere.
- [ ] All states designed: loading, empty, error, disabled, overflow.
- [ ] Responsive at small, medium and large viewports, and at 200% zoom.
- [ ] Reduced-motion path exists.
- [ ] No layout shift from fonts, images or async content.
- [ ] Lint, typecheck, tests and build pass.

## Anti-patterns

- One-off colors and spacing values that bypass the token system.
- Decorative gradients, shadows and animations with no functional role.
- Tiny low-contrast text used to make a layout "fit".
- Icon-only controls without accessible names.
- Centering everything, or stretching inputs across a whole screen without reason.
- Placeholder-only labels in forms.
- Copying a recognizable site's look wholesale instead of designing for the content.
- Shipping without checking the empty and error states.

## Definition of done

The interface communicates its intent, works with keyboard and assistive technology,
survives realistic content, follows the project's conventions and tokens, passes the
project's checks, and every visual decision has a reason.
