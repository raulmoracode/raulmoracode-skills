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

## Precedence

The catalog schema is authoritative. A repository that already uses `bug`, `enhancement`
or a vocabulary of its own does not change what this policy applies. A schema that defers
to each repository's existing labels never converges: every repository keeps a different
set and nothing can be filtered across them.

1. **Apply the catalog label, never an equivalent.** `type:fix`, not `bug`; `type:feat`,
   not `enhancement`. An equivalent is not used — it is retired by Convergence below.
2. **Replace, do not add.** Remove the labels outside the 29 from the issue or pull
   request being worked, then apply the catalog labels. An object carrying `bug` and
   `type:fix` at the same time is a parallel schema, which is what this rule exists to
   prevent.
3. **Create the missing definitions so the vocabulary is complete.** On first contact with
   a repository, create every label of the 29 it lacks, not only the two or three this
   change needs. A repository with half the vocabulary cannot be filtered like the others.
4. **Never delete a label definition as a side effect.** Deleting a definition is not a
   change to one issue: GitHub strips it from every issue and pull request in the
   repository, including closed history, and recreating the label does not restore those
   assignments. Convergence retires definitions as its own authorized action, and only
   after the objects have been rewritten.
5. **Report what you could not do.** A label that automation re-adds, a definition the
   token cannot create, a removal the API rejected — say so. A report claiming the
   vocabulary converged when it did not is worse than one that shows the gap.

## Convergence

Convergence makes a repository match the catalog: every label of the 29 present, and
nothing outside them in use. It covers existing issues and pull requests too — an old
object still carrying `bug` keeps the old vocabulary alive in every filter and every
report. It is a repository-wide write, separate from opening one issue or one pull
request, and it runs only when the user asks for it.

**Order is not optional.** Snapshot, inventory, rewrite the objects, verify, and only then
retire the definitions. Deleting a definition first destroys the only record of which
objects carried it, and the new labels can no longer be derived from anything.

### 1. Snapshot before the first write

```sh
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" \
  --jq '[.[] | {number, isPR: has("pull_request"), labels: [.labels[].name]}]' \
  > labels-backup.json
```

This file is the only undo record. Keep it until the user accepts the result. Without it a
wrong mapping cannot be reversed, because the original assignments are gone.

### 2. Inventory and mapping

```sh
gh label list --limit 200 --json name,color,description
gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" \
  --jq '.[].labels[].name' | sort | uniq -c | sort -rn
```

The second command counts issues and pull requests together, because GitHub's issues
endpoint returns both. Build an explicit table and show it to the user:

| Existing | Becomes | Note |
| --- | --- | --- |
| `bug` | `type:fix` | released defects; `type:bugfix` only for unreleased work |
| `enhancement` | `type:feat` | |
| `documentation` | `type:docs` | |
| `duplicate`, `invalid`, `question`, `wontfix`, `help wanted`, `good first issue` | — | no catalog equivalent; see below |

- **Do not infer a type the object never had.** An object with no type label stays without
  one and is reported as untyped. Inventing `type:feat` from a title rewrites a record
  nobody classified.
- **`area:`, `risk:` and marks are never derived from an old label.** They require the
  diff, the title prefix or a declaration. A migration carries across the type only.
- **State labels are not schema.** `duplicate`, `invalid`, `wontfix`, `question`,
  `help wanted` and `good first issue` record what happened to an object, not what kind of
  change it is. Dropping them loses the reason an issue was closed. Keep them unless the
  user explicitly asks for exactly the 29; if they do, name what will be lost first.

### 3. Dry run

Report before writing: the mapping table, the number of objects per old label, the objects
that would end up with no type, and the old labels that would be left with no object. Get
explicit confirmation. A migration over thousands of objects is not something to discover
halfway through.

### 4. Rewrite the objects

`PUT /repos/{owner}/{repo}/issues/{n}/labels` replaces the whole label set in one call,
which is atomic per object and idempotent: running the migration twice produces the same
result. The endpoint covers pull requests too, because GitHub models them as issues. Do
not use add/remove pairs, which can half-apply.

```sh
gh api -X PUT "repos/{owner}/{repo}/issues/<n>/labels" --input - <<'JSON'
{"labels":["type:fix","duplicate"]}
JSON
```

- One request per object, sequential, about one per second. A burst trips GitHub's
  secondary rate limits and leaves the migration half done.
- Retry `403` and `429` with backoff; report objects that still failed instead of claiming
  a clean run.
- Re-read the objects at the end and compare counts against the plan.
- Never rewrite an object whose labels already equal the target set; that is what makes the
  run resumable.

### 5. Retire the definitions, last

Only after step 4 verified:

- **Rename** when the meaning matches and the user wants the assignments preserved.
- **Delete** when nothing maps. This is the step that strips the label from every object,
  and by now nothing depends on it: the objects were already rewritten.
- **Never retire a label whose name suggests automation** — `dependencies`, `stale`,
  `release`, `automerge`, `do-not-merge` — without finding the workflow that consumes it.
  Search `.github/workflows/`, `.github/labeler.yml`, `release-drafter.yml` and `stale.yml`
  for the name, and report every hit.

A repository is converged when `gh label list` shows the 29, every issue and pull request
carries only catalog labels (or the state labels the user chose to keep), and the report
names every definition left outside the 29 with its usage count.

## Creating labels

Creating a label is a repository-configuration write. The full flow authorizes it; the
final report names every label created.

- Create every label of the 29 that is missing, in any repository, on first contact.
  Uniform vocabulary is the point; a repository that receives only this change's labels
  stays unsearchable next to the others.
- Never modify or delete an existing definition here. If a catalog label exists with a
  different color or description, report the difference and leave it alone; retiring it is
  Convergence's decision, not this step's.
- Never use `--force`.
- Never create a label outside the 29.

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

### Removing the repository's labels from the object

Removal here is an assignment change on one issue or pull request, not a definition
change:

```sh
gh issue edit <number> --remove-label "bug" --remove-label "enhancement"
gh pr edit <number> --remove-label "bug"
```

Remove every label outside the 29 from the object, add the catalog labels, then re-read
`labels` and confirm. A label still present was not removed. If repository automation
re-adds it, report that instead of claiming it is gone: the label counts as removed only
when a later read still shows it absent.

Never run `gh label delete` from here. Removing the definition would strip the label from
every other issue and pull request in the repository; that is Convergence's authorized
action, not a step in applying labels to one object.

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
- `Labels removed: ...` or `Labels removed: none`, and any label still present because
  automation re-added it.
- Any existing label whose color or description differs from this table, with the
  difference and the fact that it was left unchanged.
- For a Convergence run: the mapping table, how many objects were rewritten, how many were
  already correct, how many failed, and every definition left outside the 29 with its
  usage count.

A label is reported as applied only after `gh issue view` or `gh pr view` returned it.
