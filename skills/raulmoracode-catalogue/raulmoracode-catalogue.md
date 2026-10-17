---
name: raulmoracode-catalogue
description: "Opens the raulmoracode catalogue page in the user's default browser: a browsable, searchable index of every skill in the catalog, with its name, version and description, plus install and reload instructions. Use when the user asks to open, view or browse the skill catalogue, or asks what the raulmoracode-skills catalog offers as a page rather than as chat."
---

## Composition

```yaml
role: support
direct-invocation: yes
support-limit: 0
max-depth: 0
supports: []
```

Operational metadata only; related skills are conceptual unless listed here.

# Raulmoracode catalogue

The catalog publishes a single-page index at
`https://raulmoracode.github.io/raulmoracode-skills/catalogue.html`: every skill with
its name, version and description, plus how to install and reload the catalog. The page
is generated on every deploy from `index.json` and the frontmatter descriptions, so it
cannot drift from the published catalog. Opening it is the whole job.

**Core rule:** open the page and report the URL. Never reproduce the catalogue in chat
from memory, and never claim the browser opened when it did not.

## When to use

Use when:

- The user asks to open, view or browse the catalogue of skills.
- The user wants to see everything the catalog contains as a page rather than as a chat
  answer.
- A skill's name, version or description is wanted in a clickable, searchable form.

Do not use to:

- Choose which skill a task should load → `raulmoracode-mode`.
- Evaluate whether routing chooses the right skill → `skill-evaluation`.

## Process

### 1. Open the published page

Run the opener for the current platform, with the URL above:

- macOS: `open https://raulmoracode.github.io/raulmoracode-skills/catalogue.html`
- Linux: `xdg-open https://raulmoracode.github.io/raulmoracode-skills/catalogue.html`
- Windows from `cmd`:
  `start "" https://raulmoracode.github.io/raulmoracode-skills/catalogue.html`
- Windows from PowerShell:
  `Start-Process https://raulmoracode.github.io/raulmoracode-skills/catalogue.html`

One command, then stop. Do not fetch the page first, do not summarize it back, and do
not open anything else.

### 2. Fail honestly

If the command fails, the shell is unavailable, or the session has no display — a remote
host, a container, a headless run — print the URL on its own line, say plainly that the
browser was not opened, and stop.

### 3. Report in one line

The page is open in the browser, plus the URL. The reply does not need to repeat what
the page contains; the page is the content.

## Interaction with other skills

- `raulmoracode-mode` — routes a task to the skill that owns it. The catalogue never
  influences what loads; it only shows what exists.
- `show-your-work` — the same honesty standard governs the side effect: say that the
  browser opened, or that it did not, and why.

## Anti-patterns

- Reproducing the catalogue in chat instead of opening the page.
- Claiming the browser opened without having run the opener.
- Fetching or scraping the page before opening it.
- Opening the URL in a headless or remote session and reporting success.
- Adding rankings or recommendations the page already answers.

## Definition of done

The correct opener for the platform ran against the published URL, or the URL was printed
after the open failed; the claim about the browser matches what actually ran; and the
reply stays at one line plus the URL.
