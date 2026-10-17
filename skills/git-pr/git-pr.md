---
name: git-pr
description: "Prepares, opens and manages pull requests. Use when asked to create, open, update, describe or check a PR, to push a branch for review, or to interpret CI and review status on one. Inspects the branch and its real diff against the correct base, follows the repository's PR template, writes a title repeating the branch's prefix and a body covering motivation, implementation, testing and risk, both in English, verifies the actual result of the create command, and never merges without explicit authorization."
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

# Git pull request

A pull request is a set of claims to a reviewer: this is the scope, here is why, here is
what was checked, here is what is not. Most weak PRs are not weak code; they are claims
nobody can verify.

**Core rule:** never claim a PR exists without reading the result of the command that
created it, and never merge one without explicit authorization.

## When to use

- The user asks to open, update, describe or check a pull request.
- Work is finished and reviewed locally and ready for someone else's eyes.
- A PR needs its body rewritten, its scope narrowed, or its CI status interpreted.

Do not use to: branch lifecycle → `git-branch`; repository safety → `safe-git`;
reviewing the diff for defects → `review-your-work`; filing a bug or feature request →
`git-issues`.

## Authorization

- **Pushing a branch and opening a PR are external actions.** The user asking for a PR
  authorizes those. It does not authorize anything beyond them.
- **Never merge**, enable auto-merge, close, reopen, or convert to draft after review
  without explicit instruction naming that action. Green checks are not authorization.
- **Never approve your own PR**, request review from someone who did not ask, or edit
  another person's PR.
- The same rule governs `git-issues`: no external state change without authorization, and
  no status claim without reading the actual result.

## Process

### 1. Inspect what the PR will actually contain

- `git status --short --branch` — clean tree, and whether the branch is pushed.
- `git log --oneline <base>..HEAD` — every commit being proposed. Anything unrelated
  here is scope creep.
- `git diff --stat <base>...HEAD`, then `git diff <base>...HEAD` — the real content.
  Read it. A body written from commit messages alone will describe something the diff
  does not do.
- Establish `<base>` from `gh repo view --json defaultBranchRef` or the repository's
  documented default. Guessing it produces a 3,000-line PR full of reverts.
- The one exception: a branch stacked on an unmerged sibling targets that sibling as its
  PR base, not the default branch. Once the sibling merges, retarget the PR —
  `gh pr edit <pr> --base <default>` — so the comparison stays meaningful.
- If the base has moved or the branch is behind, say so and propose the update rather
  than rebasing silently.

### 2. Check for an existing PR

`gh pr list --head <branch> --state all`. Creating a second PR for the same branch
sometimes fails and sometimes does not — and when it does not, two PRs now describe one
change. If one exists, update that one.

### 3. Follow the repository's template

Look for `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/`, or a
template set in repository settings. Its headings are the structure, in its order. If
none exists, use `references/pr-template.md`.

Read `references/pr-template.md` when writing or rewriting a title and body, and when
reconstructing a PR for someone who was not in this session.

### 4. Write the title and body

- The title repeats the branch's prefix — `feat/...` gets `feat: ...` — and states the
  outcome, around 70 characters or fewer. The table of prefixes is in
  `references/pr-template.md`.
- The title and the body are written in English — always.
- The body is not a commit-message generator. It answers why this change exists, what it
  does, what was actually verified, and what a reviewer should be careful about.
- Name the checks you really ran, as commands, with their real results.
- State limitations plainly. A known gap disclosed in the body is information; the same
  gap found in review costs the team's trust.

### 5. Create it, then read the output

- Push the branch only because the user asked for a PR.
- `gh pr create --base <base> --head <branch> --title "<title>" --body-file <file>`
- Read what the command actually printed. If it fails, report the failure and its
  message; do not describe the PR as open. If it cannot be created — no push access, a
  fork workflow, branch protection, a missing scope — explain what stopped it and what
  the user must do instead.
- Confirm independently before reporting a URL: `gh pr view --json number,url,state,
  baseRefName` and check that the number, URL and base match what you are about to say.

### 6. Report status as observed

- Read CI with `gh pr checks` or `gh pr view --json statusCheckRollup`. Never say checks
  passed unless you saw them pass; "CI has not reported yet" is a valid status, and so is
  "the run failed in a step unrelated to this change" with the step named.
- Read feedback with `gh pr view --json comments,reviews` when asked about it.
- Never restate CI, review or merge state you did not read in this session.

## Interaction with other skills

- `safe-git` — owns repository state and the history behind the branch; force-pushing a
  PR branch is its territory, not this skill's.
- `git-branch` — owns branch naming and base selection; this skill assumes the branch
  exists, is clean and is based on the right line.
- `git-issues` — shares the external-action authorization rule; it owns issue creation,
  triage and updates.
- `review-your-work` — inspects the finished diff for defects before it is proposed.
- `test-before-finishing` — runs the checks the PR body then reports.
- `blast-radius` — assesses what the change does to consumers before it ships.
- `mom-always-say-the-same` — the body must describe what the diff actually does.
- `no-made-up-results` — states the prohibition this skill's verify rule enforces.

## Anti-patterns

- Reporting "PR created" after a command that failed or was never run.
- Claiming CI is green because the previous run was green.
- Pushing to a branch someone else owns, or force-pushing a PR branch (`safe-git`).
- Merging because checks passed.
- Building the body by concatenating commit messages.
- A title whose prefix does not match the branch, or a title or body not in English.
- A 3,000-line diff described as a small refactor.
- Opening a duplicate PR without checking for an existing one.
- A stacked PR pointed at the default branch while its sibling is unmerged, or still
  pointed at the sibling after it merges.
- Leaving tokens, internal hostnames or customer data in the body.
- Expanding the diff to make the PR look tidier.

## Definition of done

The base, the commit list and the diff were read, and the PR carries only this task's
scope; the title repeats the branch's prefix, the title and body are in English and
follow the repository template, naming the checks actually run; and the PR number, URL
and CI status in the report all come from real command output.
