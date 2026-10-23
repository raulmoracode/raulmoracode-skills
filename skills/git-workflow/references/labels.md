# Label policy

This file owns the catalog's label policy: the 29 labels, when each one applies, how they
are created in a repository that lacks them, and how they are applied to issues and pull
requests. `git-workflow` reads it at the issue and pull-request stages. Stage skills point
here; they do not keep a second copy.

## The 29 labels

Exactly 29 labels: 16 `type:`, 8 `area:`, 2 `risk:` and 3 marks. No other dimension is
added. A repository with its own schema may use an existing equivalent label; that does
not add a dimension.

### Type labels (16)

| Label | Color | Description | Applies to |
| --- | --- | --- | --- |
| `type:feat` | `a2eeef` | New functionality | Issue and PR |
| `type:fix` | `d73a4a` | Fix a bug | Issue and PR |
| `type:hotfix` | `b60205` | Urgent fix for a production failure | Issue and PR |
| `type:bugfix` | `e99695` | Fix a bug in an unreleased change | Issue and PR |
| `type:refactor` | `5319e7` | Restructure code without changing behavior | Issue and PR |
| `type:chore` | `cfd3d7` | Maintenance with no functional change | Issue and PR |
| `type:docs` | `0075ca` | Documentation only | Issue and PR |
| `type:test` | `0e8a16` | Add or modify tests | Issue and PR |
| `type:style` | `bfd4f2` | Formatting or style, no logic change | Issue and PR |
| `type:perf` | `d4c5f9` | Measured performance improvement | Issue and PR |
| `type:build` | `006b75` | Build system or dependencies | Issue and PR |
| `type:ci` | `0052cc` | CI/CD configuration | Issue and PR |
| `type:revert` | `fef2c0` | Revert a previous change | Issue and PR |
| `type:release` | `1d76db` | Prepare or publish a release | Issue and PR |
| `type:spike` | `d876e3` | Research or feasibility; the deliverable is the answer | Issue and PR |
| `type:experiment` | `7057ff` | Try a new approach | Issue and PR |

The title prefix after the colon is the label suffix: `feat:` becomes `type:feat`. The
pull request inherits the issue's type. One type per issue and per pull request; if the
two disagree, update both. Use `fix` for a defect in released code, `bugfix` for a defect
in a change that has not shipped, and `hotfix` only for an urgent production failure.

### Area labels (8)

| Label | Color | Description | Applies to |
| --- | --- | --- | --- |
| `area:api` | `c5def5` | HTTP, event, CLI and service-schema contracts | Issue and PR |
| `area:database` | `008672` | Schema, queries, migrations, indexes, transactions | Issue and PR |
| `area:frontend` | `84b6eb` | UI, state, rendering, DOM, browser | Issue and PR |
| `area:accessibility` | `c2e0c6` | Keyboard, focus, ARIA, screen readers | Issue and PR |
| `area:security` | `cc317c` | Hardening, auth, secrets, validation (no exploitable detail) | Issue and PR |
| `area:observability` | `e4e669` | Logs, metrics, traces, alerts | Issue and PR |
| `area:configuration` | `c8914a` | Configuration sources, defaults, precedence | Issue and PR |
| `area:dependencies` | `b6d686` | Versions, licenses, provenance, vulnerabilities | Issue and PR |

Use zero to two area labels. A repository-specific `area:*` label is preferred over the
catalog label when it already describes the same surface. If the diff touches more than
two areas, pick the two with the largest blast radius and name the rest in the pull request
body. If none fits, apply no area label.

### Risk labels (2)

Risk labels apply to the pull request only, never to the issue.

| Label | Color | Description | Level |
| --- | --- | --- | --- |
| `risk:consequential` | `fbca04` | Public API, schema, migrations, concurrency, integrations | 2 |
| `risk:sensitive` | `d93f0b` | Authentication, payments, personal data, deletion | 3 |

`risk:sensitive` implies level 2. At level 3 apply only `risk:sensitive`, never both
labels. A filter on `risk:consequential` therefore does not show level-3 work; filter on
`risk:sensitive` as well when the question is "everything at level 2 or above". Level 0
and level 1 carry no risk label. When the level is genuinely uncertain, choose the higher
one and say why in the report.

### Marks (3)

| Label | Color | Description | Applies to |
| --- | --- | --- | --- |
| `breaking-change` | `e11d21` | The diff breaks compatibility with existing consumers | PR only |
| `needs-migration` | `f9d0c4` | Changes schema or persisted data and requires a migration | PR only |
| `ai-assisted` | `bfdadc` | The PR was prepared by an agent | PR only |

Marks are evidence labels, not intentions. Apply `breaking-change` only when the diff
removes or renames a public API, changes a wire format or a default consumers rely on, or
drops supported behavior. Apply `needs-migration` only when the diff contains a schema or
persisted-data change that requires a migration, backfill or dual-write. Apply
`ai-assisted` only when the user asks for it or declares it, or when `CONTRIBUTING.md`
requires declaring agent use; it is off by default.

## New repository or existing schema

A repository is new when all three conditions hold:

1. It has no labels, or every label it has appears in the fixed list below.
2. None of its labels starts with `type:`, `area:` or `risk:`.
3. None of the fixed-list labels is applied to an issue or a pull request.

The fixed list is deliberately explicit:

```text
accessibility
bug
documentation
duplicate
enhancement
good first issue
help wanted
invalid
question
wontfix
```

`accessibility` is included because it is present in this catalog's repository and is not
a custom schema by itself. Presence is not use: a repository that still has the default
labels unused is new and gets all 29. As soon as one of those labels is applied to an
issue or a pull request, the repository has an existing schema; follow it.

Read the labels and their usage with:

```sh
gh label list --limit 200 --json name,color,description
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" \
  --jq '.[].labels[].name' | sort -u
```

The second command includes pull requests because GitHub's issues endpoint returns them.

### Existing schema

Do not create a parallel system. If the repository already uses `bug` and `enhancement`,
a fix gets `bug` and a feature gets `enhancement`; do not add `type:fix` and `type:feat`
beside them. The same rule applies to area, risk and mark labels.

Known equivalents:

| Catalog label | Existing equivalent | Rule |
| --- | --- | --- |
| `type:feat` | `enhancement`, `feature` | Use the existing label |
| `type:fix`, `type:bugfix`, `type:hotfix` | `bug` | Use `bug`; describe urgency in the title and body |
| `type:docs` | `documentation` | Use `documentation` |
| `type:test` | `tests` | Use only when the repository documents it as the test type |
| `area:*` | A label with the same meaning | Read its description; use it instead of a parallel label |
| `risk:*` | A label with the same meaning | Read its description; do not map severity labels by name alone |
| Marks | A label with the same meaning | Use it only when the description matches |

An equivalent counts only when the label's description or `CONTRIBUTING.md` declares it.
If the meaning is ambiguous, ask instead of creating a second label. Create only the
labels this issue and this pull request need and that have no equivalent.

## Creating labels

Creating a label is a repository-configuration write. The full flow authorizes it; the
final report names every label created.

- New repository: create all 29.
- Existing repository: create only the missing labels needed by this issue and this pull
  request.
- Never modify or delete an existing label. If its color or description differs from the
  table, report the difference and leave it alone.
- Never use `--force`.
- Never create a label outside the 29 or an equivalent already in use.

Create one label at a time and read the result:

```sh
gh label create "type:feat" --color a2eeef --description "New functionality"
gh label create "area:api" --color c5def5 \
  --description "HTTP, event, CLI and service-schema contracts"
```

If the label already exists, `gh label create` fails; re-read `gh label list` and use the
existing label. If creation fails for a permission or API reason, report the failure and
do not claim the label was applied.

## Applying labels

Issue:

- One `type:` label, taken from the title prefix.
- Zero to two `area:` labels.
- No `risk:` label and no marks.

Pull request:

- The issue's `type:` label.
- The applicable `area:` labels, updated if the diff covers a different surface.
- `risk:consequential` or `risk:sensitive` for level 2 or 3.
- `breaking-change`, `needs-migration` and `ai-assisted` only under their evidence rules.

Apply and verify:

```sh
gh issue edit <number> --add-label "type:feat" --add-label "area:api"
gh pr edit <number> --add-label "type:feat" --add-label "risk:consequential"
gh issue view <number> --json labels,title,url
gh pr view <number> --json labels,title,url,baseRefName
```

Changing a label assignment on an issue or a pull request is allowed when the type or the
scope changes; removing the label definition from the repository is not. If the issue has
no type label because it was created outside the flow, add it before opening the pull
request.

## Type changes

The issue title is the source of truth.

- Before the branch is pushed: update the issue title and its `type:`, update the pull
  request title and its `type:` if one exists, and rename the branch to the new prefix.
- After the branch is pushed: leave the branch name alone. Update the issue and pull
  request titles and their `type:` labels, remove the old type label, add the new one, and
  record the old branch prefix and the reason it was not renamed in the pull request body.
- If the scope changed materially, create a new issue, branch and pull request. Close or
  supersede the old one only with explicit authorization.

## Closes #N

Use `Closes #N` in the pull request body for every issue the pull request actually closes.
One `Closes` line per issue. Use `Refs #N` for an issue that is related but must stay open.
Never use `Fixes`.

GitHub closes the issue when the pull request merges into the default branch. This skill
never merges, so the issue stays open until `git-merge` merges the PR with explicit
authorization.

## Security

A vulnerability is not a public issue. Follow `SECURITY.md` or the private advisory route;
do not put exploit detail, secrets, customer data or internal hostnames in a public issue
or pull request.

- Never apply a `security` label to a public vulnerability issue.
- `area:security` is for hardening, authentication, secrets and validation work that can
  be described without exploitable detail.

## Reporting

The report names:

- `Labels created: ...` or `Labels created: none`.
- `Labels applied: ...` for the issue and for the pull request.
- Any existing label whose color or description differs from this table, with the
  difference and the fact that it was left unchanged.

A label is reported as applied only after `gh issue view` or `gh pr view` returned it.
