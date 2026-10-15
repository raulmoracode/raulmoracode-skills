# Threat checklist

Threat surfaces to walk when a change touches untrusted input, identity, secrets, or the
dependency set. For each surface: the question to ask, where to look, and the failure
that usually shows up there. Read it before implementing the change, not after.

Skip a surface the change cannot reach. Walking all thirteen for a stylesheet is waste;
skipping injection on a query builder is negligence.

## 1. Input validation and boundaries

- **Ask:** what crosses a trust boundary here, and what is the allowlist of acceptable
  values?
- **Look at:** request bodies, query strings, path parameters, headers, cookies,
  webhooks, uploads, environment, queue messages, third-party responses, CLI arguments,
  and anything an LLM produced.
- **Common failure:** validating in the UI, the client, or a single handler while four
  other entry points skip it. Type-only validation that accepts a string of any length,
  a negative number, a nested object, or an unexpected enum value. Silent coercion.
- **Also:** validate structure, length, range, encoding and business rules. Reject, do
  not repair. Normalize before validating.

## 2. Injection

- **Ask:** does any untrusted value reach an interpreter — SQL, NoSQL, shell, LDAP,
  template, header, log format, or a deserializer?
- **Look at:** every query builder call, every `exec`/`system`/`spawn`/`eval`, every
  string-built HTML or template, every `printf`-style log line, every `ObjectInput` or
  `pickle`/`yaml.load`.
- **Common failure:** a parameterized query with one concatenated fragment; a template
  rendered with a user string instead of an escaping one; a shell command built by
  interpolating a filename; a template that compiles a user-provided expression; a log
  line where a user value contains a newline and fakes a second entry.
- **Also:** identifier and column names cannot be parameterized — allowlist them. Never
  deserializing an untrusted type from a language with polymorphic deserialization.

## 3. Output encoding and XSS

- **Ask:** where does untrusted data land, and is it encoded for that context?
- **Look at:** every interpolation into HTML, attributes, `href`/`src`, `javascript:`
  URLs, CSS, and unquoted attributes.
- **Common failure:** `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `|safe`,
  `mark_safe`, or a Markdown renderer with HTML enabled. Encoding at render but not in
  attribute or URL context. Building HTML with string concatenation.
- **Also:** a sanitizing library that is applied to one sink and not the next. Prefer
  contextual auto-escaping from the template engine over manual escaping.

## 4. Authentication

- **Ask:** how is the requester proven to be who they claim, and what is the weakest
  link in that chain?
- **Look at:** session issuance, cookie flags (`HttpOnly`, `Secure`, `SameSite`), token
  storage and lifetime, refresh and revocation, password hashing parameters, reset and
  recovery flows, multi-factor handling, and the default behavior for an unknown user.
- **Common failure:** enumeration through different responses or timings for "no such
  user" versus "wrong password". User enumeration through the reset form. Tokens that
  never expire. Reset links that do not expire or can be replayed. Cookies without
  `HttpOnly`.

## 5. Authorization

- **Ask:** is access checked on the server, for this specific object, on this specific
  path, before the operation?
- **Look at:** every handler that reads or writes an object by id, every route group,
  every background job that runs with elevated rights, every admin check.
- **Common failure:** authorization enforced in the UI only, or only at the route level,
  so a sibling path under the same prefix skips it. Object-level access missing, so any
  authenticated user can fetch any record by changing the id (IDOR). A role, user id,
  or owner field accepted from the client. A check placed after the write. A privileged
  job trusting a payload field for its actor.
- **Test it:** call the endpoint as a different user with a different object id, and
  expect a denial.

## 6. Secrets and credentials

- **Ask:** where does each secret live at runtime, and can it reach a log, an error, a
  fixture, or the repository?
- **Look at:** source, comments, `.env*`, test fixtures, snapshots, example
  configuration, CI logs, and the client's bundle.
- **Common failure:** a key committed once and treated as fine; an error message
  echoing a connection string; a debug endpoint that dumps the environment; a default
  value that works in production.
- **Handle it:** environment or secret manager, redacted at the log and error boundary,
  rotated when exposed, absent from `.env.example` values.

## 7. Cryptography

- **Ask:** is this a standard primitive used as documented, with library-generated
  parameters?
- **Look at:** anything hand-rolled: ciphers, hashes, MACs, signature formats, key
  derivation, random number generation.
- **Common failure:** `Math.random` or `rand()` for a session or reset token; MD5 or
  SHA-1 for passwords or integrity; ECB mode; a fixed or reused IV/nonce; a static salt;
  a custom padding scheme; hand-rolled "encrypt then MAC".
- **Also:** password hashing with a fast hash instead of a memory-hard KDF. TLS
  verification disabled to work around a proxy.

## 8. Paths and URLs

- **Ask:** does user input steer a filesystem path, a network destination, or a redirect
  target?
- **Look at:** file reads and writes built from request data, archive extraction,
  image and document processors, outbound HTTP clients, and any redirect after login or
  logout.
- **Common failure:** traversal through `../` or an absolute path, including in archive
  entries; an outbound fetch to a user-supplied host (SSRF, reaching cloud metadata);
  an open redirect to a user-supplied URL; a download served from a user-controlled
  path.
- **Handle it:** resolve and verify the final path stays inside the intended root.
  Allowlist outbound destinations. Resolve redirect targets against a fixed origin.

## 9. Dependencies and supply chain

- **Ask:** where did this dependency come from, what does it pull in, and how much does
  the project now trust it?
- **Look at:** the manifest and lockfile for the change, new transitive packages,
  install scripts, postinstall hooks, unpinned versions, and registries.
- **Common failure:** a typo-squatted or unmaintained package that does almost the same
  thing as an existing one; a dependency added for a function the standard library has;
  versions floating; a fork used "temporarily"; an install script with network access.
- **Handle it:** prefer what is already installed. Verify the package name and
  maintainer. Pin versions and commit the lockfile. Run the project's audit tooling and
  report what it says.

## 10. Resource exhaustion and rate limiting

- **Ask:** what is the worst input a caller can send, and what does it cost?
- **Look at:** every list, search, upload, export, pagination parameter, batch size,
  concurrency limit, and any endpoint that triggers outbound work.
- **Common failure:** an unbounded query, a missing pagination limit, an upload with no
  size or type cap, a decompression step without an output bound (zip bomb), regex
  with catastrophic backtracking on user input, an expensive operation with no rate
  limit, an unauthenticated password-reset or send-email endpoint.
- **Handle it:** bound the input, cache or debounce the expensive path, and rate limit
  by identity and by address on anything that costs money or sends a message.

## 11. Error handling and information disclosure

- **Ask:** what does a caller learn when something fails?
- **Look at:** error responses, exception handlers, debug modes, stack traces, database
  errors, and third-party error passthrough.
- **Common failure:** returning the raw exception message, a stack trace, a SQL
  fragment, a filesystem path, a version number, or a username that does not exist;
  verbose errors enabled by an environment variable that defaults on; a generic message
  in the log but a detailed one to the user, or the reverse.
- **Handle it:** a stable error identifier for the user, the full detail in the log with
  secrets redacted, and nothing about internals in the response.

## 12. Fail-open versus fail-closed

- **Ask:** when this check, lookup, or dependency is unavailable, does the system deny
  or proceed?
- **Look at:** every try/catch around an auth or authorization check, every default
  branch of a permission function, every `if (!config)`, every retry, and every timeout.
- **Common failure:** an exception inside the permission check is caught and the request
  proceeds; an unset config value means "no restriction"; a retry drops a check; a
  circuit breaker opens straight to the protected operation; a cache miss means "allow".
- **Handle it:** fail closed for identity, access, money and data. Fail open only for
  low-impact degradation, and never for a security decision.

## 13. Logging and monitoring gaps

- **Ask:** if this were exploited, would the record exist, and would anyone see it?
- **Look at:** what is logged on authentication events, authorization denials, admin
  actions, configuration changes, and secret access.
- **Common failure:** denials logged at debug level and dropped in production; no
  correlation between a log entry and the user or request; sensitive values logged in
  full; no alert on repeated denials; audit events written to a log that rotates in a
  day.
- **Handle it:** log the event, the actor, the target, the outcome and the origin, with
  secrets redacted. Make denials visible at a level that is on by default.
