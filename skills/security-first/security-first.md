---
name: security-first
description: "Folds security into the decisions a change makes, at a scale that matches the risk. Use when work touches untrusted input, authentication, authorization, sessions, payments, personal or regulated data, secrets, file uploads, outbound requests, dependencies, or public configuration: ranks the exposure, validates at the boundary, defaults to deny, protects credentials, and surfaces findings it cannot fix in scope. Runs a full threat model on an auth path and none at all on a stylesheet tweak."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`understand-before-acting`, `break-the-edge`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Security first

Security is a property of decisions, not a pass at the end. The two failure modes are
symmetrical: silently opening a hole while "just fixing a bug", and burning an hour
threat-modeling a CSS variable.

**Core rule:** spend security effort in proportion to exposure, and never weaken an
existing control without saying so out loud.

## When to use

Use whenever the change touches untrusted input, authentication, authorization,
sessions, tokens, payments, personal or regulated data, credentials, uploads, outbound
HTTP, deserialization, query construction, public configuration, or dependencies.

Do not use to:

- Review the whole diff for correctness → `review-your-work`.
- Decide whether the boundaries and coupling are right → `software-architect`.
- Write the code → `code`; this skill decides what the code must protect.

## Rank the exposure before doing anything

Answer these in order. The answers set how much process the change deserves.

- **Reachable by anyone who is not you?** Internet-facing, unauthenticated, or exposed
  to a third party or a partner. Highest priority.
- **Does it handle untrusted input?** Any value crossing a boundary from a user, a
  network, a file, a queue, another service, or an LLM output.
- **Does it touch identity, money, or personal data?** Auth, sessions, roles, payments,
  PII, health records, credentials.
- **Does it grant or withhold access?** Every authorization decision, including implicit
  ones inside a query filter.
- **Does it add a dependency or change configuration?** Supply chain, new defaults,
  debug flags left on, CORS, CSP, TLS verification disabled.
- **Local-only, single-user, no secrets, no network?** Then a glance is enough. Do not
  threat-model a documentation typo.

One high-rank answer earns a full pass. None means proportionality, not theater.

## Process

### 1. Name the assets and the adversary

What is worth stealing or damaging here: credentials, personal data, funds, compute,
reputation? Who wants it: a bored user, a competitor, a scripted attacker, an insider?

### 2. Mark the trust boundaries

List every point where data crosses from less trusted to more trusted: request bodies
and query strings, headers and cookies, uploads, webhooks, environment variables, rows
written by other services, third-party responses, CLI arguments, log lines.

Everything on that list is untrusted until validated, whatever the type system or the
caller name suggests.

### 3. Validate at the boundary, once

Parse and validate at entry against an allowlist, and reject everything else with a
clear error. Check structure, length, range, encoding and business rules — not just "is
it a string". Prefer the framework's schema or typed binding over ad hoc checks
scattered through the function, so internal code gets to trust its own types.

### 4. Run the checklist

Read `references/threat-checklist.md` and walk its threat surfaces for this change:
boundaries, injection, output encoding, authentication, authorization, secrets,
cryptography, paths and URLs, dependencies, resource exhaustion, error disclosure,
fail-open versus fail-closed, and logging gaps. Each entry names the question to ask
and the common failure behind it. Skipping it on a change that handles untrusted input
is how holes ship.

### 5. Choose the default

Deny by default: an unset, missing, unrecognized or malformed value means no access.
Allowlists over denylists. Least privilege for tokens, scopes, roles and file
permissions. Authenticate before authorizing, authorize on the server for every
request, and never trust a permission decided by the client, the UI, or a parameter.

### 6. Verify, do not assume

Read the paths that enforce the control and confirm they run before the sensitive
operation. A check that sits after the write is not a check. When it is cheap, add a
test that fails without the control; test design is `dad-always-say-the-same`.

### 7. Report the residual risk

State what you checked, what you could not, and what you are relying on. Say plainly
when a control is out of your reach.

## Fail-open or fail-closed

When a check, a lookup or a dependency is unavailable, decide which way the system fails
and make the safe side the default.

- **Fail closed** — authentication, authorization, payments, anything with a data or
  money impact: deny, error out, retry within a bound, then stop.
- **Fail open** — only for low-impact degradation where refusing is worse: a
  non-critical analytics call, a cache, a feed. Never for a security decision.

Timeouts, retries and circuit breakers keep the posture of the happy path. A retry that
drops an authorization check is a new hole.

## Secrets

- **Never hardcode.** No keys, tokens, passwords or connection strings in source,
  comments, fixtures, snapshots, example files or defaults.
- **Read from the environment or a secret manager**, fail loudly if missing, and fail
  without echoing the value.
- **Keep them out of output.** Never log them, never put them in error messages, stack
  traces, exception payloads, user-facing errors, analytics or crash reports. Redact at
  the boundary, not at each log call.
- **Fixtures use obvious fakes** that cannot work anywhere: `test-key-not-real`.
- **A committed secret is compromised.** Report it; do not quietly edit it out and leave
  the history intact.
- **`.env.example` documents the key, never the value.** Keeping that file in sync with
  the configuration docs is `mom-always-say-the-same`.

## Findings outside the requested scope

A security problem the task did not ask about should neither be quietly fixed nor
quietly left.

- **Inside the change's blast radius** — a vulnerable call site your change makes
  reachable, a control your change removes — fix it and say so.
- **Outside the change** — report what, where, why it matters, how urgent, then stop.
  Bundling an unrequested security refactor into a feature diff hides it from the
  reviewer who can judge it (`minimal-changes`).

Escalate rather than rationalize. "I am not sure this is safe" is a valid result.

## Interaction with other skills

- `code` — owns the implementation; this skill states what it must protect.
- `minimal-changes` — owns the size of the diff; a complete security fix may be wider
  than the request.
- `blast-radius` — owns forward-looking impact; use it when a fix must reach every call
  site of a shared flaw, or when a trust boundary needs to move.
- `debug-properly` — owns root-cause diagnosis; a vulnerability found through a
  defect is diagnosed there.
- `follow-project-conventions` — owns the local idiom; when a convention is
  demonstrably unsafe, deviate deliberately and say why.
- `read-the-f-docs` — owns authoritative behavior of crypto, auth and HTTP libraries; do
  not reason about their semantics from memory.
- `dad-always-say-the-same` — designs the tests that prove a control holds.
- `clear-final-report` — carries residual risk and out-of-scope findings to the user.
- `dependency-audit` — reviews direct and transitive dependencies for vulnerabilities,
  provenance and supply-chain risk before they reach production.

## Anti-patterns

- Validating in the UI, or only at the database layer, and trusting the rest.
- Interpolating a value into SQL, a shell command, a template or a log format string.
- Building an authorization check from a client-supplied role, user id or object id.
- `try/catch` around an auth check that then proceeds anyway.
- A wildcard CORS origin, `verify=False`, or a debug mode shipped enabled.
- Returning a raw exception or stack trace to the user.
- Home-grown crypto, or `Math.random` for a token.
- Running a full threat model on a cosmetic change, or skipping one on an auth path
  because the diff looked small.

## Definition of done

Every untrusted input crossing into this change is validated at its boundary with an
allowlist; every access decision denies by default and is enforced server-side; no
secret is hardcoded, logged or returned in an error; the checklist surfaces this change
touches were walked and their failures fixed; and any finding outside the change's
scope is reported rather than applied.
