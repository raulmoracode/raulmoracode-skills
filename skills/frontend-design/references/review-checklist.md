# Frontend review checklist

Run this per screen or component before shipping. Answer every item honestly;
"not applicable" is a valid answer, "skip" is not.

## Structure and content

- [ ] Reading order makes sense with styles disabled.
- [ ] Headings form a sensible outline; no skipped levels.
- [ ] Primary action per screen is unambiguous.
- [ ] Copy is specific to the product; no placeholder or lorem text remains.
- [ ] Lists, tables and forms use the semantically correct elements.

## Typography

- [ ] Type scale is deliberate; no arbitrary font sizes.
- [ ] Body measure is roughly 45–75 characters where text runs long.
- [ ] Line height is appropriate per size: tighter for display, relaxed for body.
- [ ] Numeric data uses tabular figures where alignment matters.
- [ ] Fonts load without visible layout shift; only used weights are loaded.

## Color and contrast

- [ ] Text contrast is at least 4.5:1 for body text and 3:1 for large text, in every
      theme.
- [ ] Color is never the only carrier of meaning.
- [ ] Focus, hover, active, disabled and selected states are mutually
      distinguishable.
- [ ] Both themes are verified when the project supports light and dark.

## Layout and spacing

- [ ] Spacing follows the project scale; no magic numbers.
- [ ] Elements align to a grid that can be named.
- [ ] Proximity groups related content; borders appear only where meaningful.
- [ ] Layout survives long words, empty states and 10,000-item lists.
- [ ] Tested at small and large viewports and at 200% zoom.

## Interaction and motion

- [ ] The full path is operable with a keyboard only.
- [ ] Focus indicator is visible and high-contrast on every interactive element.
- [ ] Hover and active feedback exists and is not identical to focus.
- [ ] Feedback animations stay short (roughly ≤250ms) and explain change rather
      than decorate.
- [ ] `prefers-reduced-motion` is respected.

## States

- [ ] Loading state matches the final layout (no shift when data resolves).
- [ ] Empty state explains what will appear and how to create it.
- [ ] Error state states cause and recovery in plain language.
- [ ] Disabled controls explain why they are disabled.
- [ ] Error messages are associated with their fields programmatically.

## Accessibility spot checks

- [ ] Interactive controls are real buttons or links, not styled container
      elements.
- [ ] Icon-only controls have accessible names.
- [ ] Meaningful images have text alternatives; decorative ones are ignored
      properly.
- [ ] Touch targets are roughly 44×44px, or follow the platform convention.
- [ ] Dynamic updates are announced appropriately (status messages, live regions).

## Performance

- [ ] No layout shift from fonts, images or async content.
- [ ] Images are sized, compressed and served in appropriate responsive variants.
- [ ] Third-party scripts are justified and loaded with intent.
- [ ] The page becomes interactive quickly on a throttled connection.

## Consistency

- [ ] Uses existing tokens and components; no local one-offs.
- [ ] Matches sibling screens in density, tone and interaction patterns.
- [ ] Dead styles left behind by the change are removed.
