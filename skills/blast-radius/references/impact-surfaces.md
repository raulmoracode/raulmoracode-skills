# Impact surfaces

A lookup of the places a change can travel, used by `blast-radius`. Walk each surface
and mark it **clear**, **affected** or **not found**. "Not found" means no evidence in
this repository; other services, clients and humans are still consumers.

Read the row, run the hints, record what the change does to it. Most rows take under
two minutes. Do not skip a row because it looks unlikely; that assumption is the
reason these surfaces exist.

## Contract and interface surfaces

- **Public API and exported symbols** — grep for the exported name and for imports of
  the defining module: `git grep -n 'from.*<module>'`, or search the barrel/index
  file for what it re-exports. Check the signature, parameter order, nullability and
  return type.
- **HTTP and RPC endpoints** — search the route strings, not the handlers: path
  segments, method names, request and response field names. Check status codes,
  error shapes and whether the field is optional in the old contract.
- **CLI surface** — flag names, positional argument order, exit codes, stdout format.
  Anything a script parses from stdout is a contract.
- **Plugin, hook and event interfaces** — search the event or hook name and every
  registration site. Ordering guarantees between hooks are part of the contract.
- **Types and generics** — changing a type changes every consumer at compile time.
  Note whether the project builds types into a published package.

## Data surfaces

- **Schemas and migrations** — search table and column names, migration directories,
  and the ORM models that mirror them. Adding a nullable column is usually safe;
  dropping or renaming one is a breaking migration.
- **Stored and serialized formats** — anything persisted, cached, queued or hashed:
  session payloads, cache keys and values, message bodies, file formats, cookies,
  signed URLs. Changing the shape invalidates what is already stored.
- **Idempotency and backfill** — ask what happens to rows written before the change,
  and whether the change can run twice. Backfills are migrations with no rollback.
- **Derived artifacts** — snapshots, golden files, fixtures, generated clients,
  lockfiles and vendored copies. They will be stale until regenerated, and a stale
  one fails in a confusing place.

## Configuration and environment

- **Config keys and environment variables** — grep the key name, and grep for the
  loader pattern (`process.env`, `os.environ`, `viper`, `config.get`). A renamed key
  breaks every deployment that still sets the old one, silently.
- **Defaults and precedence** — changing a default changes behavior for everyone who
  never set the value. Note which deployments rely on the old default implicitly.
- **Secrets and credentials** — never read secret values into the report. Note only
  that a secret is required, and whether the change needs a new one provisioned.

## Dependencies and consumers

- **Internal consumers** — grep the symbol, the module path, the class name and the
  string literal. Include tests, fixtures, examples and documentation.
- **External consumers** — other repositories, mobile and desktop clients pinned to
  an older version, scripts in CI, and anything reading your output. Version skew is
  the normal case, not the exception.
- **Downstream operations** — dashboards, alerts, reports and support runbooks that
  assume the old shape. They break quietly, usually days later.

## Integrations

- **Outbound calls** — search URLs, hostnames, endpoint constants and SDK client
  constructors. Rate limits, quotas and timeouts belong to the integration, not you.
- **Inbound webhooks** — signature verification, retry policy, idempotency keys, and
  the order in which providers send events. Providers resend; handlers must be
  repeatable.
- **Third-party and marketplace boundaries** — plugin permissions, scoped tokens,
  sandboxing. Changing what leaves your process changes the security surface.

## Deployment and runtime

- **Build and toolchain** — runtime version, transpilation target, bundler config,
  container base image, minimum supported platform.
- **Infrastructure requirements** — new services, queues, caches, buckets, IAM
  roles, network rules. State who provisions them and when; a missing role fails at
  deploy, not at review.
- **Rollout mechanics** — rolling versus recreate deploys, connection draining,
  long-running jobs that span the deploy, blue-green cutover.
- **Rollback** — what the rollback actually restores, and whether the data written
  after the deploy makes the code rollback wrong rather than merely old.

## Observability

- **Metrics and dashboards** — search metric names, tags and label sets. A changed
  label set silently breaks dashboards and alerts.
- **Logs and errors** — search the log message and error code strings. Parsers,
  alert rules and runbooks match on them exactly.
- **Tracing and spans** — span names and attribute keys are contracts with the
  dashboards that query them.
- **Alerts and thresholds** — a fix that lowers an error rate usually leaves an alert
  with no signal; decide whether the alert should be removed in the same change.

## Documentation and discoverability

- **README, examples, tutorials and sample code** — anything copyable is a promise.
  Search for the symbol and the old usage pattern in prose as well as code.
- **Reference and API docs** — often generated; regenerate rather than hand-edit, and
  check the generated output into the same commit.
- **Changelog** — breaking changes need an entry, in the format the project uses.

## Flags and rollout control

- **Feature flags** — search for the flag key and the evaluation site. Name the
  default, who owns it, and the condition for removing it. A flag with no removal
  condition is permanent complexity.
- **Kill switches** — can the change be disabled at runtime without a deploy? If not,
  say so; it raises the cost of getting it wrong.

## Performance and resources

- **Hot paths** — is the changed code on a request path, a render path or a loop? What
  is the added cost per call: allocation, query, serialization, network round trip.
- **Complexity and cardinality** — added work inside a loop or an N+1 query changes
  the shape, not the constant. New metric label values can explode cardinality.
- **Capacity** — memory, connection pool, queue depth, payload size, page weight.
- **Timeouts and budgets** — does the added work fit inside the existing deadline,
  and what happens when it does not.

## Security and access control

- **Authentication and authorization** — does the change alter who can reach this?
  Grep the permission checks and role names around the changed code.
- **Secrets and sensitive data** — does new data cross a boundary, enter logs, or get
  cached? Search the changed code for logging of the new field.
- **Input handling** — new external input is new validation work, owned by
  `security-first`. Injection surfaces: query, shell, template, path, deserialization.
- **Audit and retention** — does the change affect what is recorded, who can read it,
  or how long it is kept.

## Recording the result

One line per surface: the surface, **clear / affected / not found**, the consumer
you found, and — when affected — the reversal cost and the detection path. A short
table is enough; the value is in having written down that you looked.
