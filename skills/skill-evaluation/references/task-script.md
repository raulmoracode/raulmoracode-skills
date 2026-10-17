# Starter task script

Ten representative tasks for running the `skill-evaluation` flow. Use it as a
ready-to-adapt starting point, not a fixed test suite: adjust the prompts to the
repository under evaluation and keep the type mix.

The expectations below are hypotheses to confirm or falsify. Record the observed route,
cost and outcome for every task with the evidence table in the entry markdown, then
classify each row under "Judge routing and composition". Run each prompt as a fresh
request — one per session — so earlier tasks do not influence the route.

| # | Type | Task | Expected primary | Expected support | Forbidden |
| --- | --- | --- | --- | --- | --- |
| 1 | Canonical | "Fix the crash in the `export` command when the output path contains spaces." | `debug-properly` | `test-before-finishing` | `software-architect` |
| 2 | Canonical | "The onboarding flow works but feels clunky. Rework it so it feels better." | `define-the-outcome` | — | `code`, `frontend-engineering` |
| 3 | Boundary | "We need to change the response shape of `/users`. Clients are already in production." | `contract-and-migration` | `api-contracts` | `code` |
| 4 | Boundary | "Add a manual approval gate to the deploy workflow." | `ci-cd` | — | `platform-engineer` |
| 5 | Boundary | "The CI job fails on a missing environment variable, but the same command passes locally." | `compare-environments` | — | `ci-cd` |
| 6 | Negative | "What do you think of our current architecture?" | — (answer directly) | — | `software-architect`, `review-your-work` |
| 7 | Canonical | "Open the pull request for this branch." | `git-pr` | — | `safe-git` |
| 8 | Negative | "Write a design document for a system we might build next year." | — (cut scope first) | — | `software-architect`, `plan-before-coding` |
| 9 | Risk | "Add password reset by email." | `code` | `security-first`, `test-before-finishing` | — |
| 10 | Regression | "Start a branch for issue #12." | `git-branch` | — | `safe-git` |

## Coverage notes

- Type mix: three canonical, three boundary, two negative, one risk variant and one
  regression probe.
- Tasks 3–5 probe recently rebuilt overlap pairs (`api-contracts`/`contract-and-migration`,
  `platform-engineer`/`ci-cd`, `compare-environments`/`ci-cd`); tasks 7 and 10 are
  regression probes for the git workflow chain (`git-pr`, `git-branch`).
- Route drift here is a finding for the evaluation record, not by itself a reason to
  change the catalog.
