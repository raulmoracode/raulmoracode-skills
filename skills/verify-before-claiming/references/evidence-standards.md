# Evidence standards

What each kind of claim requires before you may state it. Read this when deciding
whether a claim is supported, or whether one more check is worth running.

A claim at the wrong rung is not a style problem. It moves a decision the user was
going to make onto a false basis.

## Claim types and required evidence

| Claim | Required evidence | Acceptable phrasing |
| --- | --- | --- |
| "I changed X" | The file read after editing, or the diff naming it | "Changed `src/http/client.ts`; the diff shows the retry budget at lines 80-92." |
| "The tests pass" | The exact command and its actual result | "`npm test` exited 0: 412 passing, 0 failing." |
| "It builds" | The build command's exit status | "`pnpm build` exited 0. I did not build the docs target." |
| "This is the project convention" | A cited example that exists in this repo | "All four existing handlers in `src/http/` parse the body the same way." |
| "The docs say Y" | The source fetched, with its version | "In the 4.2 docs page for `retryAfter`, the value is capped at 60." |
| "Nothing else uses this" | A search actually run, and what it covered | "`rg parseStamp` matches only `src/util/stamp.ts` and its test." |
| "This is safe" | The threat considered, not a feeling | "The value is length-checked before the query, so no injection path here; the other two callers were not audited." |
| "Performance improved" | A measurement, with the conditions | "p95 40 ms → 12 ms, one local run, 1k rows. Not a benchmark." |
| "It works on Windows" | An actual run there | "Not verified — no Windows environment available." |
| "This is the root cause" | A reproduction that failed before and passes after | "Reproduced with the new test; it fails on `main` and passes with the fix." |
| "The docs need updating" | A comparison with the docs | "README still says `POST /v1/upload`; the route is now `POST /v2/uploads`." |
| "It is done" | Every acceptance criterion checked, plus the checks that ran | "Criteria 1-3 met; `npm test` and `npm run build` pass. Not verified: staging deploy." |

## Strengthening or weakening the claim

- **Observed and checked** — you ran it and looked. "The suite passes" is almost
  never this; it is usually a claim about one run, and it should be phrased as one.
- **Observed** — you saw the output but it covers less than the sentence claims.
  Bound the sentence to what you saw.
- **Inferred** — sound reasoning from an observed fact. Name the fact: "the parser
  runs before validation, so the webhook has the same crash."
- **Assumed** — unverified and load-bearing. Label it and state what breaks if it is
  false.
- **Unknown** — not established. Say so plainly; it is more useful than a guess.

## When to stop verifying

Verifying everything is not diligence; it is how a small task becomes a long one.

- **Raise the rung when the claim is load-bearing**: it is the reason the user asked,
  it is irreversible, or a wrong belief would be expensive to undo.
- **Stop when the check cannot change the decision.** A third confirmation of the same
  fact adds confidence, not information.
- **Stop at the project's own bar.** If CI runs lint, typecheck and unit tests, those
  passing is the bar; do not invent extra gates.
- **Stop when the remaining uncertainty is someone else's call** — a product decision,
  a production behavior only real traffic shows.
- **Never stop early to save time on a check that gates completion.** Skipping is
  `test-before-finishing`'s concern, not this one's.

## Reporting a check you could not run

Never omit it, and never let its absence imply it passed.

State four things: the command you would run, why you did not, what it would have
told you, and what the claim is therefore bounded to.

```
Could not run `pnpm test:e2e` — the suite needs a local Postgres and none is
available here. It would have covered the checkout flow I changed. So the change is
verified at the unit and build level only; the end-to-end path is unverified.
```

The same applies to a check that ran partially, was truncated, or errored: report the
partial result as partial, and say what remains unverified. Reporting it as a failure
when it did not fail is as inaccurate as claiming it passed.
