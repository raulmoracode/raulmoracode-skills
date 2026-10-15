# Issue templates

Fill-in structures for the issue types this skill files, plus a duplicate-search guide and
an actionability checklist. Read it when drafting a bug report, feature request, debt or
documentation issue, and before searching for duplicates. If the repository ships
`.github/ISSUE_TEMPLATE/` or a configured form, that form wins — fill its fields instead.

Delete sections that genuinely do not apply rather than writing "N/A" under them.

## Bug report

```markdown
**Summary**: one sentence naming the symptom and the component.

**Version**: package version, commit SHA, or build date. Say "main @ <sha>" when there
is no release.

**Environment**: OS, runtime and version, relevant configuration. Only what is needed
to reproduce — not your full machine.

**Steps to reproduce**:
1. <action>
2. <action>
3. <action>

**Expected**: what should have happened.
**Actual**: what happened instead, verbatim error text.

**Evidence**: minimal — stack trace, log line, failing test, screenshot. Trim to the
frames that matter; redact tokens and customer names.

**Severity and impact**: who is affected, how often, workaround if any, data loss or
security exposure if any. If it is a security problem, do not file it publicly —
follow SECURITY.md.

**Additional context**: related errors, when it started, what you already tried.
```

## Feature request

```markdown
**Problem**: who has it, what they are trying to do, why the current behavior blocks
them. Not "add feature X".

**Proposed outcome**: the behavior you want, from the user's point of view.

**Use cases**: two or three concrete scenarios that this would serve.

**Alternatives considered**: a workaround, a configuration option, a different design.
What is wrong with each.

**Scope**: the minimum that would be useful, and what is explicitly out of scope.
Rough effort if you can estimate it honestly; say "unknown" rather than guess.

**Additional context**: related issues, prior art, ecosystem equivalents.
```

## Technical debt or cleanup

```markdown
**Current state**: what the code does today, with file and line references.

**Why it matters**: the concrete cost — maintenance burden, incidents it enables,
onboarding friction, blocked changes, dependency risk. No "this is messy" alone.

**Proposal**: the specific end state, and what it would roughly involve.

**Effort and risk**: small/medium/large, and what could break. Migration, consumer,
or compatibility risk called out explicitly.

**Alternatives**: cheaper options, including deliberately leaving it as is.

**Related**: linked issues, PRs, or prior attempts that stalled.
```

## Documentation issue

```markdown
**What is wrong**: the inaccurate or missing statement, quoted.

**Where**: file path and section or anchor, plus a permalink to the line when possible.

**Correct information**: what it should say instead, and how you know.

**How to verify**: the command, doc, or source of truth that confirms your correction.

**Impact**: who is misled, and how badly — a wrong install command versus a typo.
```

## Duplicate search

Run before writing, and again before filing. Closed issues count: a fixed bug that
regressed is a reopen, not a new report.

```sh
gh issue list --state all --search "PORT empty" --limit 30
gh issue list --state all --search "config loader" --limit 30
gh issue list --state all --search "in:title,body ValueError bind" --limit 30
gh issue list --state all --search "label:bug loader" --limit 50
gh pr list --state all --search "config loader" --limit 30
```

- Search by **symptom** in the user's own words, then by **component**, module or file
  name, then by a distinctive **error string**.
- Check labels for a component or area filter (`label:area-config`) and follow it.
- Check for a linked or open **PR**: the issue may already be fixed in a branch.
- Found a match? Link it ("Duplicate of #123"), or reopen and add your evidence to the
  existing issue instead of filing again.

## Actionable checklist

An issue is ready when someone else could act on it without asking you a question:

- [ ] The problem or request is stated in the first two lines, without reading the code.
- [ ] For a bug: numbered steps that start from a known state, plus expected and actual.
- [ ] Version or commit identified.
- [ ] Evidence is minimal, verbatim, and free of secrets and customer data.
- [ ] Scope and non-goals are explicit for anything larger than a fix.
- [ ] Acceptance criteria are present for requests and bug fixes.
- [ ] Not a security vulnerability, or routed privately instead of filed.
- [ ] Searched open and closed issues; no closer match found.
- [ ] Every section left in is filled with real information.
