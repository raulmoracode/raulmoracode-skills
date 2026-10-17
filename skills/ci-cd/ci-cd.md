---
name: ci-cd
description: "Designs, reviews and troubleshoots provider-agnostic continuous integration and delivery workflows. Use when a change introduces or changes pipelines, jobs, runners, artifacts, caches, secrets, environments, promotion, concurrency, rollback or post-deploy verification; it makes the delivery path explicit, safe and observable without claiming that the skill itself enforces runtime policy."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`debug-properly`, `test-before-finishing`]
```

Operational metadata only; related skills are conceptual unless listed here.

# CI/CD

CI/CD is a delivery system, not a YAML file. A useful pipeline makes the route from a
change to a verified release explicit: what is built, where it runs, what it may
publish, who or what may promote it, and how failure is contained. This skill is
provider-agnostic. It reasons about workflow intent and evidence; it does not enforce
permissions, approvals, deployment rules or runtime behavior by itself.

**Core rule:** make every transition from source to production observable, repeatable
and reversible, and never hide an operational decision inside an accidental default.

## When to use

Use when work adds, changes or diagnoses:

- Continuous integration checks, workflow graphs, job dependencies or gates.
- Runner selection, toolchain setup, permissions, isolation or self-hosted capacity.
- Build outputs, artifact naming, retention, provenance or handoff between jobs.
- Dependency, build or container caching and its invalidation rules.
- Secrets, credentials, variables, protected environments or approval boundaries.
- Deployment targets, promotion between environments, release strategies or freezes.
- Concurrency, cancellation, duplicate delivery, retries, timeouts or stuck runs.
- Rollback, forward-fix, recovery procedures or post-deploy verification.

Do not use to:

- Implement application behavior unrelated to delivery → `code`.
- Diagnose a failing job without a delivery-design question → `debug-properly`.
- Decide whether a change is safe across all consumers → `blast-radius`.
- Perform a general security review → `security-first`.
- Claim checks passed without running them → `test-before-finishing` and
  `verify-before-claiming`.

## Establish the delivery contract

Before editing a workflow, write down the intended contract in terms that survive a
provider change:

1. **Triggers** — which source, schedule, release event or manual action starts it, and
   which paths or branches are intentionally excluded.
2. **Stages** — the ordered transitions from checkout through validation, packaging,
   publication, deployment and verification.
3. **Promotion authority** — what evidence and approval permit each environment
   transition, and which transitions must never happen automatically.
4. **Outputs** — the immutable artifact, metadata and logs a later stage consumes.
5. **Failure behavior** — what stops, what can retry, what can be cancelled, and what
   state an operator should find after an interruption.
6. **Recovery** — the rollback or forward-fix path, its prerequisites and its proof of
   success.

If the repository already has conventions, read the workflow, scripts, manifests and
deployment documentation together. Treat existing names, status checks, environment
boundaries and release commands as evidence, not as disposable boilerplate.

## Shape jobs around responsibility

Keep jobs cohesive and make their boundaries explicit:

- **Prepare** resolves the revision and toolchain, records relevant metadata and
  avoids duplicating setup that belongs elsewhere.
- **Validate** runs formatting, linting, type checks, unit tests, integration tests and
  policy checks at the cheapest useful point. Separate independent checks when their
  failures need separate diagnosis.
- **Package** creates a deterministic, versioned output from a known revision. Do not
  rebuild an artifact during promotion; promote the tested artifact instead.
- **Publish** makes the artifact available with deliberate retention and access rules.
  Distinguish publishing a candidate from releasing it to users.
- **Deploy** changes one environment only after its prerequisites and approvals are
  satisfied. Keep target selection and credentials visible.
- **Verify** checks the deployed behavior from outside the deployment step, records the
  evidence and either permits promotion or starts recovery.

Use explicit dependencies for ordering and data handoff. A job that merely happens to
run after another job is not a dependency. Keep unrelated jobs parallel, but make
shared setup reproducible rather than copying subtly different commands.

## Runners and execution

Choose runners by trust, capability, locality and repeatability:

- Pin the required operating system, architecture and toolchain ranges where drift can
  change the result.
- Treat self-hosted runners as privileged infrastructure: isolate workloads, limit
  credentials, clean workspaces and document capacity and maintenance assumptions.
- Do not rely on files, processes, credentials or caches left by a previous job unless
  the handoff is explicit and verified.
- Bound retries, timeouts and matrix sizes. A retry must be safe for the operation it
  repeats, especially when it can publish or deploy.
- Record enough version and revision metadata to explain which code actually ran.

## Artifacts and caches

Artifacts carry work between jobs; caches accelerate repeat work. They are not
interchangeable:

- Give artifacts stable, unambiguous names that include the revision or release
  identity, and attach manifests, checksums or provenance when consumers need them.
- Set retention according to recovery, audit and storage needs. Never make rollback
  depend on an artifact that expires before the supported rollback window.
- Scope caches by inputs that affect their contents: lockfiles, compiler versions,
  platform, relevant configuration and dependency resolution. A cache hit is an
  optimization, not proof that the output is correct.
- Design cache misses and unavailable caches as normal paths. The pipeline must still
  produce a correct result from a clean workspace.
- Never place secrets or environment-specific mutable state in a reusable cache.

## Secrets and environments

Keep configuration and authority separate from the workflow's ordinary data:

- Reference secrets through the provider's protected mechanism; never print, interpolate
  into artifact names, or persist them in logs and build outputs.
- Grant each job only the credentials and permissions it needs, and keep build jobs
  from receiving production deployment authority unless that is an explicit boundary.
- Treat environment variables, deployment targets and approval gates as inputs to
  review. Make the production target impossible to select accidentally from a
  development event.
- Prefer short-lived, scoped credentials and record which identity performed a
  promotion without recording secret values.
- Make manual approvals and protected environments visible in the workflow contract;
  a skill can describe the gate, but cannot enforce the provider's policy.

## Promotion, concurrency and rollback

Promotion should move the same tested identity forward, not repeat an untracked build.
Define what qualifies a candidate, which evidence is required, and whether promotion is
automatic, scheduled or approved.

For concurrency, decide explicitly whether newer work cancels older work, queues behind
it, or may run in parallel. Serialize operations that share a mutable environment or
release pointer. Avoid cancellation that leaves a half-applied deployment without a
recovery path, and make duplicate events harmless where possible.

A rollback plan is part of the deployment design:

- Identify the last known-good artifact and how an operator selects it.
- State whether rollback restores code, configuration, schema or external state; these
  may have different reversibility and ordering constraints.
- Keep rollback credentials, commands and verification available to the people on call.
- Prefer a tested rollback or forward-fix procedure over an optimistic "redeploy the
  previous commit" instruction.

## Post-deploy verification

Deployment success means the delivery command completed, not that users received the
intended behavior. Verify from the target environment using checks appropriate to the
system:

- Confirm the expected revision, artifact identity and configuration are present.
- Exercise a low-risk health or smoke path that crosses the real routing boundary.
- Check service readiness, error rate, logs, migrations and key dependencies as
  applicable; keep checks bounded and actionable.
- Define the failure threshold and the response: stop promotion, rollback, alert or
  continue with an explicitly accepted limitation.
- Preserve evidence with the release record so an operator can reconstruct what happened.

Verification should be independent enough to catch a deployment that reported success
while serving old code, the wrong target or a broken dependency. Do not turn a
best-effort observation into a guarantee the provider or runtime cannot make.

## Debugging a pipeline

When a workflow fails, use `debug-properly`: reproduce the same revision and event,
capture the failing job's inputs and runner context, then test one hypothesis at a
time. Separate workflow semantics from application failures, runner drift, expired
credentials, unavailable services, flaky tests and artifact mismatches. Fix the
smallest causal boundary, rerun the original failing path, and add a focused check
when the failure can regress.

For a delivery incident, preserve the timeline: trigger, revision, jobs, artifact
identity, environment, approval, deployment result and verification evidence. A green
job is not evidence that a later deployment or post-deploy check succeeded.

## Interaction with other skills

- `understand-before-acting` — gathers repository and delivery context before editing a
  workflow.
- `follow-project-conventions` — identifies the repository's established scripts,
  naming, environments and workflow idioms.
- `security-first` — owns threat modeling for credentials, permissions, runners and
  untrusted build input.
- `debug-properly` — diagnoses failing, flaky or misleading pipeline behavior.
- `blast-radius` — maps the impact of changing a shared workflow or release path.
- `test-before-finishing` — runs the repository checks and records their actual result.
- `verify-before-claiming` — sets the evidence standard for claims about delivery,
  deployment and verification.
- `clear-final-report` — reports what ran, what shipped, residual risk and recovery
  limitations.
- `configuration-management` — validates environment-specific values, defaults and
  precedence used across pipeline environments.
- `release-engineering` — plans versioning, artifacts, tags, publication and rollback as
  a deliberate release path.

## Anti-patterns

- Rebuilding during deployment instead of promoting the tested artifact.
- A cache hit treated as proof of correctness, or a cache miss treated as failure.
- Production credentials available to every build or pull-request job.
- Implicit job ordering, hidden workspace state or unbounded retries.
- A mutable `latest`-style release pointer with no immutable identity or recovery path.
- A deployment marked successful because the command exited zero, without verification.
- A rollback plan that depends on expired artifacts, unavailable credentials or an
  untested operator guess.
- Describing a provider setting as enforced when this skill only documents intent.

## Definition of done

The delivery contract names triggers, jobs, dependencies, runners, artifacts, caches,
secrets, environments, promotion authority, concurrency and recovery; the tested
artifact is the one promoted; failure and rollback paths are explicit; post-deploy
verification produces actionable evidence; and the report distinguishes repository
checks from provider-enforced policy and runtime behavior.
