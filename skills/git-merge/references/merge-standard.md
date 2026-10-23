# Merge standard

This is the canonical standard for remote pull request merges performed by `git-merge`.
It defines the gates, the method selection, the message shape, the race handling and the
evidence a merge report needs. The entry skill is the operator; this file is the rule it
applies.

## Authority and scope

- The standard is mandatory for every PR `git-merge` merges. A repository may document
  stricter rules, and may override the default method or branch cleanup, but it may not
  waive the hard gates below.
- It covers GitHub pull requests merged through `gh`. It does not cover local `git
  merge`, rebase, cherry-pick, conflict resolution, branch deletion, release tagging or
  deployment. Those belong to `safe-git`, `git-branch` and `release-engineering`.
- It does not approve reviews, close or reopen issues, delete branches or deploy. Those
  are separate actions with separate authorization; the merge verifies the issue's state
  and reports deployment triggers, nothing more.
- Repository settings are read, never written. Only a repository administrator can
  change protection, merge methods, auto-merge or branch cleanup. This skill reports
  what it finds and merges under it.
- A merge is a public record. The merge commit, the PR and the issue remain after the
  branch is gone; the standard exists so that record is complete without asking anyone
  who was in the review.

## Standard profile

| Dimension | Standard |
| --- | --- |
| PR identity | One named PR: number, URL or a branch that resolves to exactly one PR, plus the repository, head branch and base branch. Ambiguity stops the merge. |
| Profile | Catalog profile when the repository documents this catalog's flow or uses the `type:`, `area:` or `risk:` dimensions; otherwise the repository's documented profile. State which one was applied. |
| Labels | Catalog profile: one type matching the title, and the branch prefix except in the documented post-push type change; zero to two areas, risk only at 2/3, marks only with evidence. Verify only; never create or apply. Other profiles: verify their documented labels. |
| Checks | Every check required by branch protection, a ruleset or the merge queue passes. No required check is pending, failing or skipped. A repository with no required checks is a setup gap, not a pass. |
| Reviews | Every required approval is present; no reviewer's latest state is `CHANGES_REQUESTED`; `reviewDecision` is `APPROVED` where reviews are required; the approval covers the current head. Where the repository requires reviews, the catalog profile expects real approvals; a repository with no review requirement is a setup gap to report, never an implied approval. |
| Mergeability | `mergeable` is `MERGEABLE` and there are no conflicts. `mergeStateStatus` is `CLEAN` or `HAS_HOOKS`; `DIRTY`, `BLOCKED`, `UNSTABLE`, `DRAFT` or a persistent `UNKNOWN` stops. `BEHIND` stops where the repository requires up to date; otherwise re-read mergeability and record that the base moved. |
| Method | Merge commit by default. Squash, rebase or a merge queue only when documented repository policy requires it. Auto-merge only for an explicit deferred request. |
| Message | Merge commit subject is the PR title; body is the PR body, including summary, testing, risk and `Closes #N`. Squash follows the same shape. Rebase cannot rewrite messages at merge, so every landed commit must already comply. |
| Issue | `Closes #N` for each issue the PR actually closes; `Refs #N` for related issues that stay open. Closure is verified after the merge, never performed by hand. |
| Branch | This skill never deletes a branch and never passes `--delete-branch`. It reports `delete_branch_on_merge`; a remote branch that disappears is checked against that setting, a local branch is left untouched. |
| Local state | No fetch, pull, switch, merge, rebase or reset. The local repository is reported as untouched; `safe-git` owns it. |
| Post-merge | Verify PR state, merge commit, message, parents, issue closure, checks on the merge SHA, deploy triggers, branch state and local state. |
| Exceptions | Only with explicit authorization, a documented reason and a written record. Never for a hard gate, never silent, never a repeated convenience. |

## Precedence

1. **Hard safety gates.** Authorization, PR identity, open non-draft state, correct base,
   no conflicts, required checks, required reviews, pinned head and no bypass. These
   cannot be overridden. A failing hard gate is fixed, not excepted.
2. **Documented repository policy.** `CONTRIBUTING.md`, `AGENTS.md`, `.github/`, branch
   protection, rulesets and repository settings. Policy can override the default method
   and branch cleanup, and can add checks or review rules. It must be written down; a
   setting that silently allows three methods is not a policy for choosing among them.
3. **Catalog default.** Used when the repository is silent: merge commit, PR title as
   subject, PR body as body, `Closes #N`, and the 29-label policy where that profile
   applies.

A user request is authorization, not policy. It cannot invent a repository method, waive
a required check or turn a red review into an approval. If the request asks for squash
while the repository documents merge commits, the answer is no; if the repository
documents squash, squash is the correct method even when the request is silent. A policy
that says a method is "preferred" but not required is ambiguous; ask instead of choosing.

## Method matrix

| Method | When it is allowed | Command shape | Message | Notes |
| --- | --- | --- | --- | --- |
| Merge commit | Default when the base allows merge commits and no policy overrides it. | `gh pr merge <n> --merge --match-head-commit <sha> --subject "<PR title>" --body-file <body>` | Subject = PR title; body = PR body. | Preserves the branch commits and the merge topology. The merge commit records the integration point. |
| Squash | Repository policy explicitly requires squash, usually because settings allow only squash or `CONTRIBUTING.md` says so. | `gh pr merge <n> --squash --match-head-commit <sha> --subject "<PR title>" --body-file <body>` | Subject = PR title; body = PR body. | Collapses the branch into one commit. Individual commits, their authors and the merge topology are not preserved; the PR title and body must carry the whole record. |
| Rebase | Repository policy explicitly requires rebase. Never a default and never chosen for tidiness. | `gh pr merge <n> --rebase --match-head-commit <sha>` | Individual commit messages; no subject or body override at merge. | Rewrites commit SHAs, drops merge commits, can drop signatures and replays conflicts. Every landed commit must already satisfy the commit-message standard before the merge starts. |
| Merge queue | The base branch requires a queue, and the repository documents the queue path. | `gh pr merge <n>` (the CLI may enqueue, or enable auto-merge until required checks pass) | Determined by the queue and the repository's merge settings. | The CLI's internal auto-merge while queueing is the queue mechanism, not the auto-merge method. Never bypass with `--admin` or a direct merge. Enqueued is not merged. Record the head SHA at enqueue and confirm it did not change before the queue lands; verify the queue entry, the landed commit and its message. |
| Auto-merge | The user explicitly asks to defer the named PR, for example "enable auto-merge". | `gh pr merge <n> --auto --merge --match-head-commit <sha>` (or the policy method) | Same as the selected method. | Not the default for "merge when ready". If the installed CLI refuses `--match-head-commit` with `--auto`, do not enable auto-merge: the head-pin gate cannot be met. Offer a synchronous merge or the queue, or report the limitation. Report enabled, not merged, unless it merged immediately. |

The merge commit and squash commands above assume the PR title and body have been read
from the PR, not retyped from memory. `gh pr merge --body-file` accepts a file; writing
the body to a temporary file avoids shell quoting damage to markdown, `#` references and
newlines.

Issue closure is triggered by the PR body, not by the merge commit message. Copying the
body into the commit message preserves the record; it does not close anything by itself.
A `Closes` line that GitHub did not parse into `closingIssuesReferences` is a gate
failure before the merge, not something to repair afterwards.

## Preflight

Run the checks in this order. Each one narrows what the merge command is allowed to do.

### 1. Repository profile

Start with the settings and the protection that will judge the merge:

```sh
gh repo view --json nameWithOwner,defaultBranchRef,viewerPermission
gh api repos/{owner}/{repo} \
  --jq '{merge: .allow_merge_commit, squash: .allow_squash_merge, rebase: .allow_rebase_merge, auto: .allow_auto_merge, delete: .delete_branch_on_merge}'
gh api repos/{owner}/{repo}/branches/{base}/protection
gh api "repos/{owner}/{repo}/rulesets?includes_parents=true"
```

A `404` on the protection endpoint means no classic branch protection; read the
rulesets before concluding there is none. A `403` means the token cannot read the
protection, which is not evidence that none exists: report the unreadable gate and stop
if the merge cannot be shown to satisfy it. Then read `CONTRIBUTING.md`, `AGENTS.md`,
`.github/` and any release documentation for a written method, queue, review, label or
cleanup policy. Record the sources in the report.

Decide the profile here. The catalog profile applies when the repository documents this
catalog's flow or the PR or issue already uses the catalog label dimensions. Otherwise
verify the repository's own scheme and say that the catalog gates do not apply.

### 2. PR identity and state

```sh
gh pr view <n> --json number,url,state,isDraft,title,body,baseRefName,headRefName,headRefOid,headRepository,headRepositoryOwner,mergeable,mergeStateStatus,reviewDecision,labels,autoMergeRequest,closingIssuesReferences
```

Check:

- `state` is `OPEN`; `isDraft` is false. A merged or closed PR is reported, not merged
  again.
- `baseRefName` is the default branch, a documented integration branch, or a stacked
  sibling allowed by policy. A PR retargeted after authorization is a new decision.
- `headRepository` and `headRepositoryOwner` are the expected source. A fork needs the
  repository's fork policy and maintainer approval.
- `headRefOid` is recorded as the candidate head. It is not yet the pinned head; the
  review and authorization comparison comes later.

### 3. Checks

```sh
gh pr checks <n> --required --json name,state,bucket,link
gh pr checks <n> --json name,state,bucket,link
```

`bucket` is the field to read: `pass`, `fail`, `pending`, `skipping` or `cancel`. Every
required check must be `pass`. A required check that is missing from the list is a
failure of the gate, not a pass. If the repository requires no checks, report that
plainly; do not translate an empty list into "all checks passed".

`gh pr view <n> --json statusCheckRollup` shows the full rollup, including checks that
are not required. A failing non-required check is still a stop under the catalog profile;
clearing it requires a recorded deviation, not a silent merge, because the PR body's
testing claim is part of the record.

### 4. Reviews

```sh
gh pr view <n> --json reviewDecision,reviews
gh api repos/{owner}/{repo}/pulls/<n>/reviews --paginate \
  --jq '.[] | {user: .user.login, state: .state, commit_id: .commit_id, submitted_at: .submitted_at}'
```

Read the latest non-comment review per reviewer. An approval followed by a later
`CHANGES_REQUESTED` from the same reviewer is a change request, not an approval.
`reviewDecision` must not be `CHANGES_REQUESTED`; where reviews are required it must be
`APPROVED`. If conversation resolution is required, `mergeStateStatus` will be `BLOCKED`
until it is satisfied; do not override it.

The approval must cover the current head. Compare the approving review's `commit_id`
with `headRefOid`. If the approval is on an older commit, the current head is not
reviewed, regardless of how green the checks are. Where the repository requires reviews,
those approvals must be real approvals; a repository that requires none has a setup gap
to report, not an implied approval.

### 5. Mergeability

- `mergeable` can be `UNKNOWN` while GitHub computes it. Re-read a bounded number of
  times with a short wait, then stop if it stays unknown. Do not poll indefinitely.
- `CONFLICTING` or `mergeStateStatus: DIRTY` means the merge would need conflict
  resolution. That is local history work, not a merge decision; stop and route it to
  `safe-git` or `git-branch`.
- `BEHIND` stops when the repository requires branches to be up to date. Updating the
  branch changes its head and requires a new review and authorization; do not update it
  here.
- `BLOCKED` means a protection rule is unsatisfied. Read which one; do not use
  administrator privileges to pass it.
- `UNSTABLE` means a non-required check failed or is pending. Stop and report it. A
  green required set does not make a red optional check disappear from the record.

### 6. Catalog gates

Apply these only when the catalog profile applies. Read the body and the diff with
`gh pr view <n> --json title,body,labels` and `gh pr diff <n>`; label names alone do not
prove the record, and the marks need the diff as evidence.

- **Title and branch.** The title is a Conventional Commit title. The branch prefix is the
  segment before the first `/`; the title prefix is the token before the first `:`. They
  must match. The documented post-push type-change exception applies: the title carries
  the new type and the body records the old branch prefix and why it was not renamed. A
  branch with no prefix fails the gate.
- **Body.** English, and it answers what changed, what was tested and what risk remains.
  A repository template with different headings is fine if those three questions are
  answered. A risk level of 2 or 3 with no risk statement fails the gate.
- **Issue link.** `Closes #N` for each issue the PR actually closes, one line per issue;
  `Refs #N` for related open issues. `closingIssuesReferences` must contain the same
  issues. A `Fixes` line is a failure of the catalog convention. Under the catalog
  profile, a PR with no issue at all is a gap to report unless the repository documents
  issue-free changes.
- **Labels.** Read `gh pr view <n> --json labels` and the issue's labels. One `type:`
  matching the title and, except in the documented post-push type change, the branch
  prefix; zero to two `area:`; a `risk:` label only at level 2 or 3 and never both risk
  labels; marks only with evidence. The evidence for
  `breaking-change` and `needs-migration` is in the diff; `ai-assisted` needs an explicit
  declaration or a repository requirement. Do not re-grade the risk level; verify that a
  risk label is one of the two, that only one is present, and that the diff does not
  contradict it. The authoritative definitions and creation rules are in
  `skills/git-workflow/references/labels.md`; this skill only verifies. It stops when the
  set is wrong and never creates, adds or removes a label.

If a gate fails, name the exact missing or contradictory label, title or body line. The
owner of the fix is `git-workflow` for labels and `git-pr` for title and body. A merge
does not proceed while the record is wrong.

### 7. Authorization and head pin

Before the merge, three values must agree:

1. The head SHA the user's request covers. When the request is accepted, read
   `headRefOid` and treat that value as authorized; record it in the report.
2. The head SHA the approving review covers, where reviews are required.
3. The current `headRefOid`.

If the values available do not agree, stop. A new commit after review is unreviewed
content; a new commit after authorization is a different merge. Neither is covered by the
earlier approval or request. Re-run preflight after the new head has whatever review the
repository requires and a new authorization covers it.

Base movement is different: the head can stay the same while the base advances. That
does not void the authorization by itself, but it reopens mergeability and may make the
branch behind. Re-read the state; if the repository requires up to date, stop and route
the update to `git-branch` and `safe-git`; the update changes the head, so reauthorize
afterwards.

## Head SHA pinning and race handling

`--match-head-commit <sha>` is the server-side guard: the merge fails if the PR head no
longer matches. Use it on every direct merge, and on auto-merge when the CLI supports
the combination.

- Record the pinned SHA in the report before running the merge.
- Re-read `headRefOid` immediately before the command. Do not trust the value from
  several steps ago.
- Pass the same SHA to `--match-head-commit`. If the command refuses because the head
  moved, that is the guard working: re-run preflight, do not drop the flag.
- A base race is not covered by the head pin. If the base advanced and the repository
  requires up to date, stop. If it did not, then for a merge commit the first parent is
  the new base tip; verify the second parent is the pinned head after the merge.
- A merge timeout is ambiguous. Re-read the PR before retrying. It may have merged. If
  it is `MERGED`, move to verification. If it is still `OPEN`, re-run the full preflight;
  if the state cannot be read, stop and report.
- Batch merges race by design: each merge can move the base for the next PR. Re-run the
  entire preflight after each one. Never run a loop that merges several PRs without a
  per-PR gate.

## Merge execution

1. Read the title and body from the PR, not from memory. Write the body to a temporary
   file so markdown, `#` and newlines survive.
2. Re-read `headRefOid`, `mergeable`, `mergeStateStatus`, `reviewDecision` and the
   required check buckets. Compare them with the values recorded at preflight.
3. Run one merge command for one PR, with the selected method and the pinned SHA. Never
   pass `--admin`. Never pass `--delete-branch`. Use `-R <owner>/<repo>` when the current
   directory does not identify the repository unambiguously.
4. Read stdout, stderr and the exit status. A permission error, a protection error, a
   head mismatch or a queue rejection is a stop. Do not switch methods and try again to
   get past it.
5. If the command reports that the PR was added to a queue or that auto-merge was
   enabled, the PR is not merged yet. Report that state, and verify the final result only
   if the session is still responsible for it.

For a merge commit or squash:

```sh
title_file=$(mktemp)
body_file=$(mktemp)
gh pr view <n> --json title --jq .title > "$title_file"
gh pr view <n> --json body --jq .body > "$body_file"
gh pr merge <n> --merge --match-head-commit <sha> \
  --subject "$(cat "$title_file")" --body-file "$body_file"
rm -f "$title_file" "$body_file"
```

Use a temporary file owned by this command; do not commit it or leave it behind. For
rebase, omit `--subject` and `--body-file`; the individual commit messages are the
record. For a queue, use the repository's documented command, which may take no strategy
at all.

## Post-merge verification

```sh
gh pr view <n> --json number,state,mergedAt,mergeCommit,headRefOid,baseRefName,url
gh api repos/{owner}/{repo}/commits/<merge-sha> \
  --jq '{sha: .sha, message: .commit.message, parents: [.parents[].sha]}'
gh issue view <N> --json number,state,stateReason,closedAt,url
gh run list --commit <merge-sha> --limit 20 --json workflowName,event,status,conclusion,url
gh api repos/{owner}/{repo}/commits/<merge-sha>/check-runs \
  --jq '.check_runs[] | {name: name, status: status, conclusion: conclusion}'
```

Read each result:

- **PR state.** `state` is `MERGED`, `mergedAt` is set and `mergeCommit.oid` is
  non-null. An `OPEN` PR after a reported success is a failed claim, not a timing
  detail.
- **Message.** For a merge commit or squash, the landed commit subject equals the PR
  title, and its body carries the PR body's summary, testing, risk and `Closes` lines.
  For rebase, each landed commit's message is the record; verify those messages rather
  than a merge message. GitHub's own "Merge pull request #N" subject is not the standard
  subject when the policy is a merge commit with the PR title.
- **Parents.** A merge commit has two parents: the base tip and the pinned head. If the
  second parent is not the pinned head, stop and report the discrepancy.
- **Issues.** For each `Closes #N`, the issue is `CLOSED` with a completed state reason.
  A PR merged into a non-default base may not close it; report the issue as still open
  rather than claiming closure. Never close it manually.
- **Checks.** Read the check runs on the merge SHA. Queued or in-progress is not a
  success. A failing post-merge check is reported as failing; it may describe the merge
  result, not the PR's pre-merge state. For a repository that reports commit statuses
  instead of check runs, read `gh api repos/{owner}/{repo}/commits/<merge-sha>/status`.
- **Deploy triggers.** List runs associated with the merge SHA. Report workflow names,
  events, status and conclusion as observed. "No run observed" is a valid result; a
  queued run is not a deployment, and a successful run is not proof that the deployed
  service works.
- **Branch.** The skill passed no deletion flag. If the remote head branch is gone and
  `delete_branch_on_merge` was on, attribute it to that setting; if it was off, report the
  deletion as unexplained. If the branch remains, report that. The local branch is never
  deleted.
- **Local state.** No fetch, pull or switch was run. `git status --short --branch` is
  read-only, and its ahead/behind counts use the last fetch, not the merge. Report the
  local repository as untouched; `safe-git` owns any later sync.

## Exception and deviation record

A deviation is any departure from the standard that is not already covered by
documented repository policy. It needs all five fields:

```text
Deviation
- Rule: <the gate or default that is not being followed>
- Reason: <why the standard path does not fit this repository or change>
- Authorization: <who asked for it and the exact scope they authorized>
- Repository policy: <the documented source and the relevant sentence, or "none">
- Result: <what was done and what was observed>
```

Rules:

- A hard gate is never a deviation. If authorization, identity, state, base, conflicts,
  checks, reviews or the head pin fail, the merge stops.
- A documented repository policy that selects squash, rebase, a queue or branch cleanup
  is precedence, not an exception. Record the policy source instead of writing a
  deviation.
- A missing label, a non-compliant title or a body without testing is not an exception
  either; it is a fix owned by another skill, and the merge waits.
- A one-off change of merge method with no repository policy behind it is refused, not
  recorded as an exception. A risk acceptance for a condition that is neither a hard gate
  nor a record defect may be recorded when it has explicit authorization, a stated reason
  and an observed result. The record exists to make a real deviation visible, not to
  launder a convenience.

## Repository setup checklist

A skill cannot standardize human merges by itself. The repository has to enforce the
standard mechanically, or every merge depends on whoever is at the keyboard. These are
administrator actions; `git-merge` reads them and does not perform them.

- [ ] Restrict the allowed merge methods on the default branch and on every protected
      integration branch, in repository settings or a ruleset. Allow merge commit alone
      by default; enable squash or rebase only when the team documents that choice.
- [ ] Require the real CI jobs as status checks. Select the jobs that prove the change,
      not a single aggregate that can pass without running them.
- [ ] Require at least one approving review. Dismiss stale approvals when new commits
      are pushed, require review from code owners where ownership exists, require
      conversation resolution, and require approval of the most recent reviewable push.
- [ ] Block force pushes and branch deletion on the protected branches. Administrators
      should not be the normal merge path.
- [ ] Decide `delete_branch_on_merge` explicitly and write the decision down. If it is
      on, remote branches disappear after merge; if it is off, `git-branch` owns cleanup.
- [ ] If the repository uses a merge queue, require it on the protected base and document
      the queue path. Do not leave a direct merge route open beside it.
- [ ] Decide whether auto-merge is allowed. If it is, restrict it to explicit deferred
      requests; if it is not, disable it so nobody mistakes a green PR for a merge.
- [ ] Document the standard in `CONTRIBUTING.md` or `AGENTS.md`: method, message shape,
      `Closes` convention, label policy, review and check requirements, branch cleanup
      and who may merge.
- [ ] Test the setup with a throwaway PR: a merge without the required check or review
      must be refused by the platform, not just by the reviewer's memory.

## Report template

```markdown
## Merge report

- PR: #<number> <title> — <url>
- Repository: <owner/repo>
- Base ← head: <base> ← <head-branch>
- Authorization: <what was asked and by whom, if known>
- Profile: catalog | repository | mixed (explain)
- Head SHA: <pinned-sha> (authorized at <authorized-sha>; reviewed at <reviewed-sha> where required)
- Method: merge commit | squash | rebase | merge queue | auto-merge
- Method source: <policy path and sentence, or "catalog default">
- Hard gates: <each gate and its observed value>
- Catalog gates: <title, body, Closes, labels — or "not applicable">
- Merge result: <state>, merge commit or landed commit <sha>, <timestamp>
- Commit message: <verified subject and body, or the discrepancy>
- Issues: #<n> <closed | still open> ...
- Checks on the merge commit: <observed status>
- Deploy triggers: <observed workflow runs | none observed>
- Branch: <remote present | removed by repository auto-delete>; local branch untouched
- Local repository: not fetched, not switched, not updated
- Deviations: none | <the five-field record>
- Not done: approval, label changes, branch deletion, local sync, deployment success
```

The report never contains a merge commit, issue state or workflow result that was not
read from a command. If a value could not be read, the field says so.

## Worked examples

### Normal merge commit

PR #412, `feat: add user authentication`, is open against `main` from
`feat/412-user-authentication`. The repository allows all three methods but documents
none, so the catalog default applies: merge commit. Preflight shows a clean merge state,
the required checks passing, one approval on head `<head-sha>`, and the user's request
names #412 at that SHA. The title and body are written to a temporary body file, and the
merge runs with `--merge --match-head-commit <head-sha>`. The command returns success;
`gh pr view` then reports `MERGED` with merge commit `<merge-sha>`. The commit subject is
the PR title, the body carries summary, testing, risk and `Closes #412`, and the second
parent is `<head-sha>`. Issue #412 is `CLOSED`. A workflow run appears on the merge SHA
in `queued` state and is reported as queued, not as a deployment. Auto-delete is off, so
the remote branch remains; the local branch was never touched. The report records no
deviations.

### Documented squash override

`CONTRIBUTING.md` says "Squash and merge only", and the repository settings allow only
squash. The default merge commit is unavailable, so squash is the documented policy, not
an improvisation. The PR title and body are already in final form because they become
the squash commit's subject and body. The merge runs with `--squash --match-head-commit
<sha> --subject "<PR title>" --body-file <body>`. Post-merge verification reads the
squash commit's message and confirms the issue closed. The report names the policy
source and states that the branch's individual commits were not preserved.

### Missing labels stop

A catalog-profile PR carries `type:fix` while its branch is `feat/...` and its title is
`feat: ...`; the diff adds a migration but there is no `needs-migration` mark. Preflight
fails the label gate before any merge command runs. The report names the mismatched type
and the missing mark, and routes the fix to `git-workflow`. This skill does not apply
the label, does not edit the title and does not merge. The PR stays open.

### Head SHA changed stop

The user authorized the merge at `<sha-a>` and the approving review is also on
`<sha-a>`. A new commit `<sha-b>` arrives before the merge. The current `headRefOid` is
`<sha-b>`, so the authorized SHA, the reviewed SHA and the current head no longer
agree. The skill stops without running the merge. Passing `--match-head-commit <sha-a>`
would only make the command refuse; the correct action is a new review and a new
authorization for `<sha-b>`. The report says exactly which SHA was approved and which
one is now at the head.

### Batch merge

The user names #10, #11 and #12. #10 is preflighted and merged, then verified. #11 is
preflighted again from scratch: its base now contains #10, its checks may be pending and
its branch may conflict. If it is pending, wait; if it conflicts, stop and report #11 and
#12 untouched. #12 is not attempted until #11 has its own result. The report has one
section per PR, and each section carries its own pinned SHA, method, gates and merge
result. One successful merge never authorizes the next.

## Stop conditions

The merge does not start, or stops where it is, when:

- The request does not name a PR, or the name resolves to more than one.
- The PR is closed, already merged or a draft.
- The base is not the documented target, was retargeted after authorization, or is a
  stacked sibling without a policy that permits merging into it.
- `mergeable` is `CONFLICTING` or `UNKNOWN` after a bounded re-read; `mergeStateStatus`
  is `DIRTY`, `BLOCKED`, `UNSTABLE` or `DRAFT`; or it is `BEHIND` where the repository
  requires up to date.
- A required check is pending, failing, skipped or absent; or the repository requires no
  checks and the PR body offers no verification account under the catalog profile.
- A required review is missing; a reviewer's latest state is `CHANGES_REQUESTED`;
  `reviewDecision` is `REVIEW_REQUIRED`; or the approval is on an older commit.
- The authorized SHA and `headRefOid` do not agree, or a required approval is on an older
  commit.
- The catalog title, body, `Closes` line or label set fails.
- The repository's method or queue policy is unclear, or the requested method is not the
  documented one.
- Auto-merge is requested outside an explicit deferred request, or the repository
  disallows auto-merge.
- The merge command fails, times out, or its outcome stays ambiguous after re-reading.
- The request asks for `--admin`, a protection bypass, a force push, branch deletion,
  approval, an issue close, a label change or a local sync.
- The diff or body contains a secret, customer data or an internal hostname, or the head
  repository is an unexpected fork or changed after authorization.
- A post-merge verification finds a different merge commit, a different message, an open
  issue that was reported closed, or a head parent that is not the pinned SHA.
