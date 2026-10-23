---
name: git-workflow
description: "Default owner of every change that will be committed. Use for any feat, fix, hotfix, bugfix, refactor, chore, docs, test, style, perf, build, ci, revert, release, spike or experiment, even when the request names only the change or the issue. Runs the full flow — issue, branch, implementation handoff, verification gate, pull request and the 29-label policy — with explicit authorization for every external write, `Closes #N`, and no direct commits to main. The flow ends at the open or updated PR and never merges: a merge is a separate explicit request routed to `git-merge`. For an explicit single-stage ask use `git-issues`, `git-branch`, `git-pr` or `git-merge`; for read-only work, do not use this skill."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-3
max-depth: 1
supports: [`git-issues`, `git-branch`, `git-pr`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Git workflow

A committed change is a public record: an issue that states what and why, a branch that
isolates it, a pull request that proves it, and labels that make it findable. Skipping a
stage does not remove the obligation; it moves the cost to whoever reads the history
later.

**Core rule:** every change that will be committed goes through issue → branch → pull
request. The process shrinks with risk; the flow does not. The flow ends at the open or
updated pull request, and this skill never merges: a merge is a separate explicit request
routed to `git-merge`.

## When to use

- Any change that will be committed: a feature, a fix, a hotfix, a bugfix, a refactor, a
  chore, documentation, tests, style, performance, build, CI, a revert, a release, a
  spike, or an experiment.
- The request names only the change, or only the issue, and the change will be committed.
- Work already in progress that still needs an issue, a branch, or a pull request.

Do not use to: an explicit issue-only request (`git-issues`), an explicit branch-only
request (`git-branch`), an explicit pull-request-only request (`git-pr`), read-only work,
or a merge request — that goes to `git-merge`. A defect whose cause is unknown is
diagnosed by `debug-properly` inside this flow, not by a separate route around it.

## Authorization

A request to make a committed change authorizes the full flow: creating or reusing the
issue, creating the branch, committing on it, pushing it, opening or updating the pull
request, and creating or applying the labels the flow requires. It does not authorize
anything else.

- Merge, auto-merge, approval, closing, reopening, branch deletion, force-push and
  repository-settings changes are separate actions with separate authorization. Merge
  execution goes to `git-merge`; it is not part of this flow.
- Creating labels is a repository-configuration write. Every label created is named in the
  final report.
- Never commit to the default branch. If the change is already there, stop and repair the
  state with `safe-git` before continuing.
- If a stage cannot be completed — no permission to create issues, issues disabled, no
  push access — stop and report. Never fall back silently to a branch without an issue
  number or to a pull request without an issue.
- If the user explicitly asks to skip a stage, treat that as a scope change: confirm it
  and do not claim the full flow ran.

## Process

### 1. Inspect the repository and classify the change

Read the state before writing anything:

- `git status --short --branch`, the current branch and the repository's actual default
  branch (`gh repo view --json defaultBranchRef`).
- `CONTRIBUTING.md`, `AGENTS.md`, `.github/` templates and `SECURITY.md` — the repository
  owns its branch policy, templates and disclosure route.
- Existing issues and pull requests for the same change. Reuse them instead of creating
  duplicates.
- `gh auth status`, so a missing scope or login fails before the first external write.

Classify the change: one type from the title prefix, zero to two affected areas, and a
risk level. If the working tree is dirty, settle it with `safe-git` before creating
anything.

### 2. Create or reuse the issue

Load `git-issues` for the issue stage.

- Search open and closed issues for duplicates before writing.
- Create or reuse an issue whose title is `<prefix>: <summary>`.
- Apply the issue labels defined in `references/labels.md`.
- Read the command output. If the issue cannot be created, stop and report; the flow does
  not continue with a branch that has no number.

The issue number is the input to the branch name and to `Closes`.

### 3. Create the branch

Load `git-branch` for the branch stage.

- Start from an updated default branch, or from the sibling branch the work genuinely
  depends on.
- Name it `<prefix>/<number>-<slug>` — for example `feat/123-user-auth`. A release branch
  keeps its version dots: `release/123-1.2.0`.
- Verify the name is free locally and remotely, is a valid ref, and fits the 50-character
  limit including the issue number.
- If the branch already exists for this issue, reuse it; do not create a second one.

Never commit on the default branch. The branch is the isolation boundary for everything
that follows.

### 4. Hand off the implementation

This skill does not implement the change. The implementation owner is `code` for a
feature or a behavior change, and `debug-properly` for a defect. Hand the work over and
keep the flow's scope intact:

- One logical change per branch. No drive-by fixes, formatting sweeps or dependency
  bumps.
- Commit on the branch with a Conventional Commit message that keeps the same prefix.
- Do not open the pull request until there is a real diff to propose. If no implementation
  owner is active, name it and stop; do not invent a change here.

### 5. Gate on verification

No pull request is opened on unverified work.

- `test-before-finishing` must have run. The evidence is the commands and their real
  results, not an assertion that the tests pass.
- If it did not run, stop and run it before continuing. If no check applies, say so
  explicitly in the report and in the pull request body.
- Read the real diff (`git diff`, `git log <base>..HEAD`) for scope, secrets, unrelated
  edits and noise.
- For risk level 2 or 3, `review-your-work`, `blast-radius` and `security-first` are
  handoffs that inform the change; they are not additional supports of this skill.

### 6. Open or update the pull request

Load `git-pr` for the pull-request stage.

- Check for an existing pull request for this branch and update it instead of opening a
  duplicate.
- Use the correct base: the default branch, or the sibling for stacked work.
- Write the title and body, including `Closes #N` for the issue this pull request actually
  closes.
- Push the branch and create the pull request only because the full flow authorized it.
- Read the command output and verify the number, URL and base with `gh pr view`. If the
  command fails, report the failure; do not describe the pull request as open.

### 7. Apply the labels

Read `references/labels.md` for the complete policy, the 29 labels, creation and
application rules.

- Issue: one `type:` label and zero to two `area:` labels.
- Pull request: the issue's `type:`, the applicable `area:` labels, a `risk:` label only
  at level 2 or 3, and marks only when the diff proves them.
- A new repository gets all 29 labels. An existing repository keeps its own schema and
  gets only the labels this issue and pull request need and do not already have an
  equivalent for.
- Apply the labels, verify them with `gh issue view` and `gh pr view`, and report every
  label created. Never modify or delete an existing label definition, and never use
  `--force`.

### 8. Report

The final report names the issue, the branch and the pull request with the URLs the
commands actually returned. It lists the labels applied, the labels created, the checks
that ran and their results, and what was not done — merge, approval, review. If the flow
stopped, it says at which step and why.

## Type changes

The issue title is the source of truth for the type. When the type changes, follow the
policy in `references/labels.md`:

- Before the branch is pushed, update the issue title and its `type:`, update the pull
  request title and its `type:` if one exists, and rename the branch to the new prefix.
- After the branch is pushed, leave the branch name alone. Update the issue and pull
  request titles and their `type:` labels, and record the old branch prefix and the reason
  it was not renamed in the pull request body.
- If the scope changed materially, create a new issue, branch and pull request. Close or
  supersede the old one only with explicit authorization.

## Security

A vulnerability is not a public issue. Follow the repository's `SECURITY.md` or private
advisory route through `git-issues` and `security-first`; do not include exploit detail,
secrets, customer data or internal hostnames in a public issue or pull request.

- Never apply a `security` label to a public vulnerability issue.
- `area:security` is for hardening, authentication, secrets and validation work that can
  be described without exploitable detail.
- Redact credentials, tokens, personal data and internal hostnames before anything is
  written publicly.

## Interaction with other skills

- `git-issues` — owns the issue stage: duplicate search, templates, the title prefix and
  private disclosure. This skill owns the flow around it.
- `git-branch` — owns branch creation, base selection and naming. This skill supplies the
  issue number and the full-flow format.
- `git-pr` — owns the pull request stage: base, title, body, CI status and verification.
  This skill owns the flow around it.
- `git-merge` — owns remote PR merges and their authorization. This flow prepares the PR
  and applies its labels; `git-merge` verifies the merge standard and merges.
- `safe-git` — owns repository safety, dirty trees, rebases, resets and history repair.
  Any destructive step in the flow defers to it.
- `code` — owns implementation for a feature or a behavior change inside this flow.
- `debug-properly` — owns diagnosis and the fix for a defect inside this flow.
- `test-before-finishing` — owns the verification gate this flow requires before the pull
  request.
- `review-your-work` — reviews the finished diff when the risk justifies it.
- `blast-radius` — looks forward at what the change affects before it ships.
- `security-first` — owns the vulnerability class and the security review.
- `minimal-changes` — owns the diff's scope boundary; this flow refuses drive-bys.
- `clear-final-report` — owns the shape of the final report.
- `raulmoracode-mode` — routes a committed change here. This skill is the default owner,
  not a second entry point: it does not select or route other work.

## Anti-patterns

- Committing directly to the default branch.
- Creating an issue, a branch or a pull request without authorization.
- Treating the full flow as optional because the change is small.
- Creating a branch without the issue number in the full flow.
- Falling back silently when the issue cannot be created.
- Inventing labels, adding a dimension, or creating a parallel schema next to an existing
  one.
- Applying a `risk:` label to an issue, or both risk labels at level 3.
- Applying `ai-assisted` automatically.
- Using `Fixes` instead of `Closes`.
- Claiming an issue or a pull request exists without reading the command output.
- Merging, enabling auto-merge or approving — a merge request goes to `git-merge`.
- Implementing the change inside this skill.
- Opening a pull request without verification evidence.
- Renaming a pushed branch to repair a type change.
- Applying a mark without diff evidence.

## Definition of done

The issue exists or was reused, carries one `type:` and zero to two `area:` labels, and its
number is known; the branch is `<prefix>/<number>-<slug>` from an updated base — release
branches keep their version dots — and no commit landed on the default branch; the
implementation was handed to its owner and the diff contains only this change;
`test-before-finishing` ran and its evidence is named; the
pull request is open or updated against the correct base, carries `Closes #N` and the
required labels, and every label created is listed in the report; and nothing was merged,
approved or closed by this skill — the PR was handed off unmerged to `git-merge`, which
owns the merge and its authorization.
