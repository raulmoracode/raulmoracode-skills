---
name: accessibility-engineering
description: "Implements and verifies accessibility at the code level: semantic HTML, accessible names and roles, keyboard operation, focus management, ARIA usage, screen-reader behavior and automated checks. Use when building or reviewing interactive UI such as forms, dialogs, menus, navigation, tables or dynamic updates, and when an audit must produce concrete code changes and recorded checks rather than general advice."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`frontend-engineering`, `dad-always-say-the-same`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Accessibility Engineering

Accessibility succeeds or fails in the markup and the keyboard, not in the intention
behind the screen. A styled div can look like a button, respond to a pointer and still
be absent from the accessibility tree, unreachable from a keyboard and unusable with a
screen reader. Inspecting pixels cannot reveal that difference.

This skill works on the code that produces semantics: elements, names, states, focus
behavior and the keyboard contract behind every control. Automated tooling is a floor
rather than a certificate, so the work continues with checks that only operating the
interface without a pointer can prove.

**Core rule:** use the native element that already carries the needed semantics before
reaching for ARIA, and never ship a custom control without its full keyboard contract.

## When to use

Use when:

- A control is interactive but not a native element, or a native element is repurposed
  for behavior it does not carry.
- Keyboard users cannot reach, operate or escape a component such as a dialog, menu,
  combobox, tab set or grid.
- Focus must move or return: opening and closing overlays, route changes, content that
  disappears while focused.
- Dynamic updates need announcement: validation errors, status messages, async results,
  counters.
- Forms need labels, instructions, error association or grouped structure.
- ARIA already present may be overriding, contradicting or under-describing the native
  semantics.
- A release gate, audit or ticket requires accessibility checks with recorded results.

Do not use to:

- Build the underlying state, event and rendering behavior the UI needs → `frontend-engineering`.
- Explain platform mechanics such as focus delivery or lifecycle restoration that no
  markup change affects → `browser-engineering`.
- Design the test suite's structure, assertions or determinism rules → `dad-always-say-the-same`.
- Call accessibility verified without running the selected checks → `test-before-finishing`.
- Choose the visual treatment; contrast ratios and focus visibility are verified here,
  but palette and type are designed elsewhere.

## Process

### 1. Inspect the accessibility tree, not the screenshot

Read what assistive technology receives: roles, accessible names, states, values and
relationships for every control in the flow. A control missing from that tree is
invisible no matter how it looks, and a control announced with the wrong role misleads
the people who depend on the tree the most.

### 2. Reach for native elements first

Map each intent to the closest semantic element: button, link, label, input, select,
textarea, fieldset and legend, heading, table header, dialog. Native elements arrive
with a role, keyboard behavior, focusability and state handling already correct, while
custom replacements must rebuild all of it by hand.

### 3. Give every control an accurate name

Prefer visible text, then a real label, then aria-label or aria-labelledby, and keep the
spoken name agreeing with the visible one. Icon-only buttons describe their action,
decorative images stay silent, informative images describe their purpose, and hints or
errors attach through aria-describedby instead of visual proximity alone.

### 4. Specify the keyboard contract before building

For every composite, define how it is tabbed into, which keys move within it, how it is
activated and escaped, and where focus returns when it closes. Dialogs hold focus while
open and restore it to the trigger; menus, comboboxes and tab sets follow the
established pattern for their role; positive tabindex values are absent.

### 5. Move focus deliberately through change

Route changes, replaced panels and async results either move focus into the changed
region or announce without moving it. Focus never starts on an arbitrary element, never
stays on a removed node, and never leaves an overlay without returning somewhere
predictable.

### 6. Use ARIA only where no element fits

When a custom widget is unavoidable, supply the role plus every state and property it
promises, and keep them updated as the component changes. A role such as menu, listbox
or grid is a behavioral contract; if the implementation cannot honor it, choose a
weaker one or use a native element instead.

### 7. Verify with automation, then prove the rest by use

Run the project's own accessibility tooling and treat its findings as a floor rather
than a pass. Automated rules miss focus order, keyboard traps and announcement quality,
so add a keyboard-only pass and a screen-reader spot check of the changed surface, then
record which checks ran and which were skipped. When a specific failure can be checked
mechanically, leave a regression check behind; otherwise document the manual protocol.

## Interaction with other skills

- `frontend-engineering` — owns state, events and rendering; this skill constrains the markup and interaction semantics through which those behaviors reach users.
- `browser-engineering` — explains platform-level behavior such as focus delivery, shadow-DOM retargeting and lifecycle restoration that markup changes cannot alter.
- `dad-always-say-the-same` — owns test design and determinism; this skill names the accessibility behaviors that deserve automated or documented checks.
- `test-before-finishing` — runs the repository checks before completion and records which accessibility checks passed, failed or were skipped.

## Anti-patterns

- Clickable divs and spans without role, name, focusability or key handling.
- ARIA attributes laid on the wrong element or contradicting the visible text.
- aria-hidden applied to content that can still receive focus.
- Focus outlines removed globally with no equally visible replacement.
- Dialogs that neither contain focus nor return it when dismissed.
- Live regions that announce every keystroke, or that unmount before speaking.
- Errors conveyed only by color, position or an icon without text.
- An automated scan score reported as proof that the interface is accessible.
- Roles that promise behavior the implementation never delivers.

## Definition of done

Every interactive control exposes a correct role, accessible name and state; native
elements are used wherever one exists; each composite follows a stated keyboard contract
with visible focus; focus moves and returns deliberately across overlays, route changes
and replaced content; updates are announced or focus-managed; the project's automated
checks ran with results recorded; a keyboard-only pass covered every changed flow; and
remaining issues are listed with their user impact instead of being hidden behind a
score.
