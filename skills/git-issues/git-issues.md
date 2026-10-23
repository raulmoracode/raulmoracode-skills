---
name: git-issues
description: "Creates, triages and updates repository issues when explicitly requested. Use when asked to file or draft a bug report, open a feature request, report a documentation error, raise technical debt, search for duplicates, or check on an existing issue. Identifies the issue type and prefixes the title with the workflow prefix the branch and the pull request will carry, checks for duplicates, follows repository issue templates and forms, supplies reproduction steps and acceptance criteria, respects private security disclosure, and verifies that an issue was really created or updated. For the complete code-change flow — issue, branch, implementation and pull request — use `git-workflow`, which owns that flow and its label policy; this skill owns the issue stage."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-1
max-depth: 1
supports: [`clear-final-report`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Git issues

An issue is a permanent, public record with a lifecycle other people depend on. Filing
one is an external action with a cost: a vague report burns a maintainer's time and
lowers the value of the next one you file.

**Core rule:** create an issue only when the user explicitly asks, or when a
`git-workflow` run calls for one. A request for a draft gets a draft, unpublished. An
improvement you noticed along the way is a suggestion in your report, not a new issue.

## When to use

- The user explicitly asks for an issue task on its own: file, draft, update, label,
  close or comment on an issue.
- The user asks whether a bug or request has already been reported.
- A task is blocked on a defect that needs tracking rather than a local fix.

A change that will be committed defaults to `git-workflow`, which runs the issue, the
branch, the implementation and the pull request as one flow. Invoke this skill directly
for an explicit issue-only request; inside the full flow this skill runs the issue stage,
but the flow and its label policy are `git-workflow`'s.

Do not use to: open a pull request → `git-pr`; run the reproduction → `debug-properly`;
decide whether the change is worth making → `blast-radius`.

## Hard rules

1. **Never create an issue on your own initiative.** Noticing that something is broken,
   missing or improvable is not a reason to open a ticket. Report it and let the user
   decide. The one exception is the full flow under `git-workflow`: there, the user's
   request for the change authorizes the issue. Everywhere else this rule stands.
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

The type also gives the title its mandatory prefix, from the same 16-prefix table
`git-branch` defines: `feat:`, `fix:`, `hotfix:`, `bugfix:`, `chore:`, `refactor:`,
`docs:`, `test:`, `style:`, `perf:`, `build:`, `ci:`, `revert:`, `release:`, `spike:`,
`experiment:`. The title reads `<prefix>: <short summary>`, and the prefix carries
through the workflow: `feat: User auth` becomes branch `feat/user-auth` — or
`feat/123-user-auth` once the full flow adds the issue number — and pull request
`feat: add user authentication`.

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

- `gh issue create --title "<prefix>: <summary>" --body-file <file>`
- Read the output for the issue URL. Do not report a number or link you did not see.
- Confirm with `gh issue view <number> --json number,url,state,title` if the link
  matters.

This skill does not create labels. The 29-label policy, its creation and its application
belong to `git-workflow` and its `references/labels.md`; when the full flow is running,
label application happens in the label stage of `git-workflow`. In an explicit issue-only
task, if the user asks for an existing label, apply only labels that already exist
(`gh label list`) and that you are authorized to apply. Never create a label, and never
invent a parallel schema. Never assign, close or reopen without being asked.

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

- `git-workflow` — owns the full code-change flow and the 29-label policy; this skill owns
  the issue stage inside that flow and every issue-only request outside it.
- `git-pr` — owns pull requests; this skill owns issues. Both enforce the same rule: no
  external state change and no status claim without authorization and verification.
- `git-branch` — owns branch naming; a branch born from an issue keeps the issue's title
  prefix (`feat: User auth` → `feat/user-auth` standalone, `feat/123-user-auth` in the
  full flow).
- `safe-git` — owns repository state and any destructive operation. Issue work never
  touches branches or history; if it appears to need to, that is a separate task.
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
- Filing with a bare title like `User auth` instead of `feat: User auth` — the branch
  and the pull request have nothing to keep.
- Inventing labels or creating a parallel label schema in an issue-only task.
- Treating issue creation as optional in the full flow — the issue number is what the
  branch and the `Closes` reference are built from.
- "Broken" as a description, with no steps, no version and no actual result.
- Inventing a version number, environment or error message to fill a required field.
- Assigning people, adding labels or closing issues that nobody authorized.
- Reporting an issue URL that no command actually returned.
- Padding a template with "N/A" instead of removing the section.

## Definition of done

The issue was asked for, or required by a `git-workflow` run — never inferred from
something you noticed; its type and template match the repository and its title carries
the workflow prefix the branch and the pull request will keep; the duplicates search
covered open and closed issues; a bug has reproduction steps, expected versus actual, and
a version; no private or sensitive data is included; and the reported number and URL come
from real command output — or the failure was reported instead. When the full flow is
running, the issue number is the input to the branch and to the pull request's `Closes`
line.
