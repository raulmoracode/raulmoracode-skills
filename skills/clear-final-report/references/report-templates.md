# Report templates

Four templates, scaled to the size of the task. Read this before writing the report of
anything that is not a one-liner. Pick the one that matches the work, then delete any
section you cannot fill with something real.

A section with nothing true to put in it is removed, not padded.

## 1. One-line result

For: a typo, a rename, an obvious one-line fix, a single command the user asked for.

```
Fixed the off-by-one in `parse_window` that dropped the final element. `pytest
tests/test_window.py` exits 0.
```

Nothing else. No summary, no sections, no list of files.

## 2. Small change

For: one or two files, contained behavior, low risk. Three blocks, three or four lines
each at most.

```
**What changed** — Added the `Retry-After` header to the 429 path in
`src/http/client.ts`; the retry budget was previously ignored.

**Checks** — `npm test` exits 0 (412 passing). `npm run lint` exits 0.

**Caveat** — I did not exercise the retry against a real 429; the test covers the
header parsing only.
```

## 3. Substantial change

For: several files, new behavior, a public interface, or anything with a migration.

Keep only sections that carry information.

```
**Summary** — Invoice totals are now computed from stored line items rather than the
request payload, so a later edit to an invoice cannot silently change what was
already billed. Existing invoices are unaffected; new ones use the stored value.

**What changed and why**
- `src/billing/total.ts` — computation moved out of the request handler so it can be
  reused by the PDF renderer, which had been recomputing it slightly differently.
- `src/billing/invoice.ts` — the total is now read from the stored invoice at render
  time. This is what makes the value stable.
- `db/migrations/0042_store_invoice_total.sql` — adds the column, backfilled from the
  current computation, and backfilled rows are flagged so a later audit can compare.

**Checks**
- `npm test` exits 0 (418 passing, 2 new for the stored-total path).
- `npm run build` exits 0.
- `npx prisma migrate status` against a local copy: up to date.

**Not verified**
- The backfill has only run on a local database with ~50 invoices; I did not run it
  against production-shaped data.
- I did not test concurrent edits to one invoice, which the stored total now makes
  observable.

**Remaining work** — Decide whether the two render paths should share code before the
PDF renderer is touched again.

**Risk** — Medium. The backfill writes to every existing invoice row; the rollback
path is the migration's `down`, which drops the column and restores nothing.
```

## 4. Investigation or diagnosis

For: "why is X slow", "where does this go wrong", "is this safe to change". The
conclusion carries its own confidence.

```
**Question** — Why does the report page take 20+ seconds in production but under a
second locally?

**Examined** — Slow-query log for the last 24h; `src/reports/list.ts`; the
`invoices` and `line_items` schema; the production plan output for the two queries it
issues.

**Found**
- The list query joins `line_items` per row: 200 invoices produce 201 queries, each
  returning 8 rows (`reports/list.ts:34`).
- Those queries are not cached and run twice per page load — once for the total, once
  for the table (`reports/list.ts:61`).
- Locally the dataset is 12 invoices, which is why it never reproduces there.

**Conclusion** — N+1 plus a duplicated count, and the gap scales with invoice count
rather than with load. Confidence: high for the cause, medium for the magnitude, which
I estimated from the query count rather than measuring.

**Suggested next step** — Single aggregate query for the totals, run once per page.
Not implemented; say so if you want it.
```

## What not to include

- A restatement of the request or of the plan.
- A file-by-file narration of what you did.
- Praise, reassurance, or "let me know if you need anything else".
- Invented output, invented next steps, invented commit or PR references.
- Hedging so vague the sentence is true either way: "results look reasonable".
- Advice nobody asked for, unless it leaves a real risk unmentioned.
- A section kept only for symmetry with a template.
