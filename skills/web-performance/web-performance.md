---
name: web-performance
description: "Measures and improves how web pages load and respond: Core Web Vitals, bundle size, loading order, caching, code splitting, resource priority and network waterfalls. Use when a page loads slowly, feels unresponsive or shifts while loading, when bundle or transfer size keeps growing, when caching or splitting is being changed, or when field data or an audit flags a failing vital."
---
## Composition

```yaml
role: specialist
direct-invocation: yes
support-limit: 0-2
max-depth: 1
supports: [`performance-engineering`, `browser-engineering`]
```

Operational metadata only; related skills are conceptual unless listed here.

# Web Performance

A page is experienced before it is understood: while it loads, the user sees what the
network and the main thread have produced so far. This skill covers that surface — how
a web application loads, becomes interactive and stays visually stable: Core Web
Vitals, bundle contents, resource order, caching and main-thread work.

Every decision starts from evidence about real users; lab tools explain a failure but
never declare it solved. A synthetic score is a diagnostic, not the outcome.

**Core rule:** let field data decide which metric is failing, fix the subpart of the
critical path that gates it, and leave a budget so the fix cannot silently regress.

## When to use

Use when:

- A vital is failing or trending wrong: LCP, INP, CLS or the TTFB beneath them.
- A page loads slowly on real devices, or shifts while assets and fonts arrive.
- Bundle size, transfer weight or request count keeps growing.
- Code splitting, lazy loading, preloading or resource priority is being designed or
  changed.
- Caching, content hashing, CDN rules or invalidation for assets and documents are
  being revised.
- Third-party scripts consume bandwidth and main-thread time before the page settles.

Do not use to:

- Change component state, event handling or form logic → `frontend-engineering`.
- Explain rendering, scheduling or API behavior seen in a trace → `browser-engineering`.
- Measure server, query, job or service performance → `performance-engineering`.
- Build RUM pipelines, dashboards or alerting → `observability`.
- Design the tests that protect behavior when loading changes → `dad-always-say-the-same`.

## Process

### 1. Pick the metric and the population

Decide which vital the complaint maps to: LCP for loading, INP for responsiveness,
CLS for visual stability, with TTFB as the common upstream suspect. Name the
population that matters — device classes, network profiles, cold versus repeat
visits — because a page can pass for one group and fail another.

### 2. Read the waterfall before touching code

List the critical-path requests with sizes, priorities, start times and dependencies.
Look for serial chains (document, stylesheet, font, text), render-blocking resources,
redirects, oversized payloads, and third parties that start early and finish late.

Measure the page a real user receives: production build, compression on, CDN in the
path, cache state stated. A development server describes a different system.

### 3. Break the largest paint into subparts

Treat the largest contentful paint as four costs: time to first byte, delay before the
resource is discovered, its transfer time, and render delay after it arrives. Fix the
largest subpart; preloading a font will not rescue a slow origin, and a faster origin
will not rescue an image discovered late behind a script.

Common wins: the hero image loaded with priority instead of lazy, critical CSS inlined
or ordered correctly, fonts with a display strategy and fallback metrics, and third
parties pushed out of the critical window.

### 4. Attack the bundle with measurements

Read the build output rather than the source tree: per-route chunks, their compressed
sizes, and what the entry route pulls in. Look for dependencies duplicated across
chunks, barrel files that defeat tree shaking, polyfills shipped to browsers that do
not need them, and debug code or source maps reaching production.

Split by route and by interaction, but only where the split removes bytes from the
first load. A lazy chunk fetched during startup has moved the cost, not reduced it.

### 5. Prioritize the network and cache deliberately

Give the earliest visible element the strongest early signal: preload what is
discovered late, preconnect only to origins used in the first moments, and keep
low-value scripts from competing with the content that gates the metric.

Cache content-hashed assets aggressively and immutably; keep documents short-lived or
revalidating, and never let a mutable API response inherit an asset cache policy by
accident. State the invalidation story: how a new deployment reaches a user who still
holds old chunks.

### 6. Keep the main thread free for interaction

INP measures the gap between a gesture and the visible reaction, so long tasks,
hydration cost, heavy handlers and forced synchronous layout all land in it. Break
work into yielding chunks, move non-UI computation off the main thread, and reserve
space for late arrivals — banners, embeds, swapping fonts — so they shift nothing.

Watch for layout thrash where measurement and mutation alternate within a frame, and
for DOM trees so large that every recalculation becomes expensive.

### 7. Lock in budgets and detection

Set budgets where a regression is caught before users feel it: entry-route bundle
size, total transfer weight, request count, and the vitals from the field. Wire the
budgets into the pipeline and the vitals into monitoring; a budget nobody runs is
documentation, not protection.

## Interaction with other skills

- `performance-engineering` — owns the general measurement discipline, backend
  latency and any workload outside the browser.
- `browser-engineering` — explains rendering, scheduling and API behavior observed in
  a trace or profile.
- `frontend-engineering` — owns the component, state and rendering changes an
  optimization requires.
- `observability` — carries field metrics, dashboards and alerting for the vitals.
- `dad-always-say-the-same` — designs tests that keep loading behavior from breaking
  silently.

## Anti-patterns

- Chasing a synthetic score in a throttled lab profile while field data tells a
  different story.
- Shrinking a monitored bundle by moving code into a chunk that loads on first paint.
- Preloading everything, which ranks the real critical resource as one of many.
- Marking the hero image lazy, then wondering why the largest paint arrives late.
- Caching the HTML shell for a year, then repairing invalidation with query strings.
- Optimizing on a fast laptop and office network and calling it the user experience.
- Reserving layout space with a transform hack instead of the dimensions content needs.

## Definition of done

Field and lab evidence agree on which vital is failing and which subpart dominates;
the change shortens the critical path rather than rearranging it; before-and-after
numbers for the affected route come from the same measurement conditions; cache and
invalidation behavior is stated for every layer touched; and a budget check or field
alert can catch the same regression coming back.
