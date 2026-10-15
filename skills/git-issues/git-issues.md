---
name: git-issues
description: "Creates, triages and updates repository issues when explicitly requested. Use when asked to file or draft a bug report, open a feature request, report a documentation error, raise technical debt, search for duplicates, or check on an existing issue. Identifies the issue type, checks for duplicates, follows repository issue templates and forms, supplies reproduction steps and acceptance criteria, respects private security disclosure, and verifies that an issue was really created or updated."
---

# Git issues

An issue is a permanent, public record with a lifecycle other people depend on. Filing
one is an external action with a cost: a vague report burns a maintainer's time and
lowers the value of the next one you file.

**Core rule:** create an issue only when the user explicitly asks. A request for a draft
gets a draft, unpublished. An improvement you noticed along the way is a suggestion in
your report, not a new issue.

## When to use

- The user asks to file, draft, update, label, close or comment on an issue.
- The user asks whether a bug or request has already been reported.
- A task is blocked on a defect that needs tracking rather than a local fix.

Do not use to: open a pull request → `git-pr`; run the reproduction → `debug-properly`;
decide whether the change is worth making → `blast-radius`.

## Hard rules

1. **Never create an issue on your own initiative.** Noticing that something is broken,
   missing or improvable is not a reason to open a ticket. Report it and let the user
   decide.
2. **A draft stays a draft.** When the user asks for a draft, produce the complete text
   in your response and stop. Do not run `gh issue create`. Offer to publish it.
3. **Security vulnerabilities are never public issues.** An unfixed vulnerability, an
   exposed secret, an authentication bypass or an injection is a private disclosure.
   Follow the repository's `SECURITY.md` or security policy — usually GitHub private
   advisories or a security contact address. If none exists, say so and tell the user to
   ask the maintainers privately, or open a public issue that contains no exploit
   detail and no vulnerability description, only a request for contact. Filing the
   detail publicly hands the attacker a head start and is unrecoverable once indexed.
   Handling the vulnerability class itself is `security-first`'s job.
4. **Verify the result.** Read the output of every create or update command. If it fails,
   report the failure. If it cannot run — no auth, no scope, the repo has issues
   disabled — explain that instead of claiming an issue exists.
5. **No external action without authorization.** The rule shared with `git-pr`: pushing,
   creating, commenting, labeling, closing or reopening happens because the user asked
   for that specific action, not because it seemed helpful.

## Process

### 1. Identify the type and the audience

Bug, feature request, improvement, technical debt, documentation, performance, or
security. The type determines the template and who reads it: a bug report needs
reproduction, a feature request needs a problem statement and use cases, debt needs an
effort and risk estimate. A security report goes to the private path above and never to
a public issue.

### 2. Check for duplicates before writing

Search both open and closed issues — a closed issue with the same symptom is still a
duplicate and a reopening target, not a new report. Search by symptom in the user's
words, then by component, module or file name, then by error string. Check for a linked
or open PR too; the bug may already be fixed. `references/issue-templates.md` has the
search commands and what makes an issue actionable.

### 3. Gather evidence, not impressions

For a bug: the exact reproduction steps, the actual result, the expected result, the
version or commit, environment, and the smallest piece of evidence that shows it — a
stack trace, a log line, a failing test. "It is broken" is not a report. If you have not
reproduced it, say so in the issue and in your report rather than implying you did.

For a request: the problem it solves, who has it, what success looks like, and the
alternatives already considered.

### 4. Follow the repository's template or form

Check `.github/ISSUE_TEMPLATE/`, `.github/ISSUE_TEMPLATE.md`, the configured templates,
and `CONTRIBUTING.md`. A form with required fields must be filled — if a required field
you cannot supply (version, environment) blocks creation, ask the user rather than
inventing a value. GitHub issue forms can also be supplied as a YAML body file for
`gh issue create --body-file`.

Read `references/issue-templates.md` when drafting a bug report, feature request, debt
or documentation issue, or when searching for duplicates.

### 5. Write it, then create it only if asked

Draft first and let the user read it when the issue is non-trivial, contains a security
adjacent concern, or names other people. When they say create it:

- `gh issue create --title "<type>: <summary>" --body-file <file> [--label ...]`
- Read the output for the issue URL. Do not report a number or link you did not see.
- Confirm with `gh issue view <number> --json number,url,state,title` if the link
  matters.

Label only with labels that exist (`gh label list`) and that you have authorization to
apply. Never assign, close or reopen without being asked.

### 6. Triage and update deliberately

When asked to triage: confirm the type is right, check whether reproduction steps are
present and sufficient, link duplicates rather than closing silently, and state what
information is missing rather than guessing it. Ask before changing an issue's state —
commenting, labeling and closing are writes to a shared record.

### 7. Respect privacy

Redact credentials, tokens, customer names, internal hostnames and personal data before
anything is written publicly. If the information is needed to reproduce, say how to
obtain it privately instead of pasting it.

## Interaction with other skills

- `git-pr` — owns pull requests; this skill owns issues. Both enforce the same rule: no
  external state change and no status claim without authorization and verification.
- `safe-git` — owns repository state; issue work that touches branches stays here.
- `debug-properly` — owns reproduction and root cause. A filed bug is the artifact, not
  the investigation.
- `security-first` — owns vulnerability assessment; this skill owns the private
  disclosure route and the rule that it is never public.
- `verify-before-claiming` — sets the evidence bar; an issue's claims about versions and
  failures must meet it.
- `mom-always-say-the-same` — an issue must describe the behavior the code actually has.

## Anti-patterns

- Filing an issue because you noticed something improvable.
- Publishing when the user asked for a draft.
- Posting vulnerability detail in a public issue.
- Filing a duplicate without searching closed issues.
- "Broken" as a description, with no steps, no version and no actual result.
- Inventing a version number, environment or error message to fill a required field.
- Assigning people, adding labels or closing issues that nobody authorized.
- Reporting an issue URL that no command actually returned.
- Padding a template with "N/A" instead of removing the section.

## Definition of done

The issue was asked for, not inferred; its type and template match the repository; the
duplicates search covered open and closed issues; a bug has reproduction steps, expected
versus actual, and a version; no private or sensitive data is included; and the reported
number and URL come from real command output — or the failure was reported instead.
