# Pull request template

Fill-in structure and a worked example for a pull request body. Read it when writing or
rewriting a PR description, and when reconstructing a PR for someone who was not in the
session. If the repository ships `.github/pull_request_template.md`, use that instead —
its headings win.

## Template

Delete sections that genuinely do not apply. A short, accurate PR beats a padded one
with "N/A" under every heading.

```markdown
## Summary

One paragraph: what changes and what a reviewer will see. No "this PR refactors..."

## Motivation

The problem, the failing case, the request, or the incident. Link the issue:
Closes #123. Say why the obvious alternative was rejected.

## Implementation

What changed and where. The non-obvious decisions, the paths that matter
(`src/config/loader.ts`), and anything surprising a reviewer will need explained.

## Scope

Deliberately excluded: known limitations left in, follow-ups filed or deferred,
things a reviewer might expect to find here and should not look for.

## Testing and validation

Commands actually run and their real results:

- `npm test` — 412 passed, 0 failed
- `npm run lint` — clean
- Manual: reproduced the original failure on 3.10 and confirmed the fix

State plainly what was NOT run and why. Untested surfaces belong in Scope, not implied
away.

## Acceptance criteria

- [ ] Criterion from the request or issue, checked
- [ ] Second criterion, checked

## Security and compatibility

Auth, secrets, untrusted input, data migrations, public API or wire-format changes,
dependency additions, backward compatibility. "No change to" is a real answer when you
checked.

## Risks and limitations

What could break, what is unverified, what you would want a second pair of eyes on.
Empty only when the change genuinely carries none.

## Related work

Linked issues and the follow-up issue filed for the part that did not fit here. Other
pull requests this builds on or supersedes may be referenced by number (`See #480`).
```

## Title

The title repeats the branch's prefix: `feat/...` gets `feat: ...`, `fix/...` gets
`fix: ...`. The prefix is mandatory and never chosen freely — it comes from the branch.
If the change type changed after the branch was pushed, the branch keeps its published
prefix and the title carries the new type; record the mismatch in the body.

| Prefix | Purpose | Example PR title |
| --- | --- | --- |
| `feat:` | Add a new feature | `feat: add user profile page` |
| `fix:` | Fix a bug | `fix: prevent login with expired tokens` |
| `hotfix:` | Fix a critical production issue | `hotfix: fix payment processing failure` |
| `bugfix:` | Fix a bug in an unreleased change | `bugfix: correct avatar upload validation` |
| `refactor:` | Improve code structure without changing behavior | `refactor: simplify authentication service` |
| `chore:` | Perform maintenance tasks | `chore: update project dependencies` |
| `docs:` | Update documentation | `docs: document REST API endpoints` |
| `test:` | Add or update tests | `test: add authentication integration tests` |
| `style:` | Make formatting or stylistic changes | `style: apply consistent code formatting` |
| `perf:` | Improve performance | `perf: optimize user database queries` |
| `build:` | Modify build configuration or dependencies | `build: upgrade Vite to latest version` |
| `ci:` | Modify CI/CD pipelines | `ci: add automated test workflow` |
| `revert:` | Revert a previous change | `revert: remove user authentication changes` |
| `release:` | Prepare or publish a new release | `release: prepare version 1.2.0` |
| `spike:` | Investigate a technical approach or assess feasibility | `spike: evaluate Redis for session storage` |
| `experiment:` | Experiment with a new approach or implementation | `experiment: test a new caching strategy` |

- Everything is written in English — the title and the body, always.
- Around 70 characters. Reviewers read a list of titles, not full sentences.
- Name the symptom, not the implementation: `fix: treat empty env vars as unset in
  config loader`, not `refactor: rewrite read_env`.

## Worked example

**Branch:** `fix/empty-env-vars`

**Title:** `fix: treat empty env vars as unset in config loader`

**Body:**

```markdown
## Summary

`load_config` read `PORT` from the environment with `os.environ["PORT"]` semantics,
so an exported-but-empty `PORT` became the string `""` and the server tried to bind
to an invalid port. Empty is now equivalent to unset, so the documented default
applies.

## Motivation

Issue #482: a container image that exports `PORT=` for templating fails at startup
with `ValueError: invalid port`. The docs say an unset variable falls back to 8080,
which is what the code does for a missing variable but not for an empty one.
Closes #482.

## Implementation

- `src/config/loader.py`: read through a helper that maps empty strings to the
  default, applied to the four optional variables documented as defaultable.
- `tests/test_config_loader.py`: cases for missing, empty, whitespace-only and
  populated values.
- Deliberately not changed: variables documented as required, which now raise a
  clearer error naming the variable.

## Scope

The numeric coercion of `PORT` is untouched; `PORT=abc` still fails at bind time.
Not refactoring the loader's overall structure, which issue #470 covers separately.

## Testing and validation

- `pytest tests/test_config_loader.py` — 18 passed
- `pytest` — 604 passed, 1 skipped (marked `integration`, needs Docker)
- Manual: `PORT= python -m server` now starts on 8080; confirmed on Python 3.10 and 3.12

## Acceptance criteria

- [x] An exported-but-empty defaultable variable resolves to its documented default
- [x] A missing variable is unchanged
- [x] A populated variable is unchanged
- [x] Regression test covers the empty case

## Security and compatibility

No change to auth, secrets handling, or network exposure. Not a public API change:
`load_config`'s signature and return type are unchanged, and empty variables now
resolve to defaults, which is a behavior change for anyone who depended on `""`
surviving.

## Risks and limitations

Only the four documented defaultable variables are covered. A future variable added
without going through the helper keeps the old behavior; the helper is deliberately
explicit rather than applied by reflection. Full integration suite not run locally.

## Related work

Closes #482. Supersedes the first attempt, #479. Follow-up for the coercion behavior:
#485.
```

## Before you submit

- Title carries the branch's prefix; after a post-push type change, it carries the new
  type and the body records the old prefix. The title and the body are in English.
- Summary says what a reviewer will see, not what you intend to do.
- Body claims match the diff and the command output you actually have.
- `Closes #N` names only issues this PR actually closes; `Fixes` is not used.
- Every checklist item is either checked or the reason it is not.
- No secrets, internal hostnames or customer data in examples.
