---
phase: 04-accessible-section-components
plan: 03
type: tdd
wave: 2
depends_on: ["04-01"]
files_modified:
  - src/lib/components/sections/ServicesDetail.svelte
  - src/lib/components/sections/ServicesDetail.svelte.spec.ts
  - src/routes/services/+page.svelte
autonomous: true
requirements: [SECT-02]

must_haves:
  truths:
    - "The /services route renders all four service pillars (Trainings & Facilitation, Disability Consulting, Modeling for Representation, Speaker & Panelist), each as a labelled <section> with an <h2> and its summary (SECT-02)"
    - "Each pillar's content comes from $lib/content services — no hard-coded titles/summaries (CONT-01)"
    - "The route owns a single <h1> ('Services'); pillar sections use <h2>, no skipped level (A11Y-02)"
    - "The 04-01 placeholder stub at src/routes/services/+page.svelte is fully REPLACED by the real page (no TODO stub marker remains)"
    - "<svelte:head> sets title/description from seo.services (prerendered)"
    - "The route is reachable at /services/ (trailingSlash always) and prerenders"
  artifacts:
    - path: "src/lib/components/sections/ServicesDetail.svelte"
      provides: "List of 4 service pillars as aria-labelledby <section> + <h2>"
      contains: "aria-labelledby"
      min_lines: 15
    - path: "src/lib/components/sections/ServicesDetail.svelte.spec.ts"
      provides: "Client spec: 4 headings + 4 summaries render from the barrel"
      min_lines: 20
    - path: "src/routes/services/+page.svelte"
      provides: "Services route (replaces 04-01 stub): single h1 + <svelte:head> from seo.services + ServicesDetail"
      contains: "<h1"
  key_links:
    - from: "src/routes/services/+page.svelte"
      to: "$lib/components/sections/ServicesDetail.svelte + $lib/content (seo)"
      via: "import + compose"
      pattern: "ServicesDetail"
    - from: "src/lib/components/sections/ServicesDetail.svelte"
      to: "$lib/content (services)"
      via: "import { services }"
      pattern: "from '\\$lib/content'"
---

<objective>
Build the Services detail page (SECT-02): the `/services` route (which currently exists only as a 04-01
placeholder stub) renders all four service pillars from `$lib/content`, each as a `<section aria-labelledby>`
with an `<h2>` heading and its summary. The route owns a single `<h1>` and reads `seo.services` into
`<svelte:head>`. Content-driven (RESEARCH Pattern 4) so the four pillars are structurally sourced from the
barrel — no duplicated copy. This plan REPLACES the 04-01 stub with the real composed page.

Purpose: SECT-02 (four-pillar services detail) with an ordered heading tree (A11Y-02) and prerendered SEO.

Output: `src/lib/components/sections/ServicesDetail.svelte` (+ spec); real `src/routes/services/+page.svelte`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-accessible-section-components/04-RESEARCH.md
@src/lib/content/services.ts
@src/lib/content/seo.ts
@src/routes/+layout.ts

<interfaces>
```typescript
export const services: readonly { id: string; title: string; summary: string }[]; // 4 pillars: trainings, consulting, modeling, speaking
export const seo: { services: { title: string; description: string }, ... };
```
Global route config (src/routes/+layout.ts): `prerender = true; trailingSlash = 'always'` — inherited by /services; the route file needs NO extra prerender export.
The `/services` route already exists as a 04-01 placeholder stub (`<h1>Services</h1>` + `TODO(04-03)` comment).
This plan REPLACES that stub file entirely — do not create a second file, overwrite the existing one.
CSS: --color-* tokens only; :focus-visible global; mobile-first responsive (SECT-07); no non-essential motion (A11Y-08).
RESEARCH Pattern 4 (ServicesDetail): each pillar `<section aria-labelledby={\`svc-${s.id}\`}><h2 id=...>{s.title}</h2><p>{s.summary}</p></section>`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: ServicesDetail.svelte (4 pillars as labelled regions)</name>
  <files>src/lib/components/sections/ServicesDetail.svelte, src/lib/components/sections/ServicesDetail.svelte.spec.ts</files>
  <read_first>
    - src/lib/content/services.ts (exact 4 titles/summaries + ids)
    - src/lib/components/ModeToggle.svelte.spec.ts (client-spec conventions + requireAssertions)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 4"
  </read_first>
  <behavior>
    - Renders one region per service (4 total), each with an <h2> equal to the service title and a <p> with the summary.
    - Each region is an <section aria-labelledby> whose target id matches its <h2> id.
    - No <h1> in the component (route owns it).
  </behavior>
  <action>
    Write `ServicesDetail.svelte.spec.ts` FIRST (RED): mount, assert `page.getByRole('heading', { level: 2 })` count is 4, assert all four titles present ("Trainings & Facilitation","Disability Consulting","Modeling for Representation","Speaker & Panelist"), and assert one summary substring. Every `it` has an assertion.
    Implement `src/lib/components/sections/ServicesDetail.svelte` per RESEARCH Pattern 4:
    - `import { services } from '$lib/content';`
    - `<ul class="service-list">{#each services as s (s.id)}<li><section aria-labelledby={\`svc-${s.id}\`}><h2 id={\`svc-${s.id}\`}>{s.title}</h2><p>{s.summary}</p></section></li>{/each}</ul>`
    - Scoped `<style>`: `.service-list{ list-style:none; padding:0; display:grid; gap:1.5rem; }` single column default; `@media (min-width:48rem){ .service-list{ grid-template-columns:repeat(2,1fr); } }`. Headings/text via `--color-heading`/`--color-text`. No raw hex; no non-essential motion.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest run --project client src/lib/components/sections/ServicesDetail.svelte.spec.ts` GREEN.
    - `grep -c '<h2' src/lib/components/sections/ServicesDetail.svelte` shows the h2 is emitted in the loop (present) AND `grep -q 'aria-labelledby' src/lib/components/sections/ServicesDetail.svelte`.
    - `grep -q "from '\\$lib/content'" src/lib/components/sections/ServicesDetail.svelte` AND NO hard-coded pillar title literal outside the loop: `grep -ni 'Disability Consulting' src/lib/components/sections/ServicesDetail.svelte` returns nothing (titles come from data).
    - `grep -ni '<h1' src/lib/components/sections/ServicesDetail.svelte` returns nothing.
    - `pnpm check` 0/0.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run --project client src/lib/components/sections/ServicesDetail.svelte.spec.ts</automated>
  </verify>
  <done>ServicesDetail renders 4 barrel-sourced pillars as h2 labelled regions; spec GREEN; pnpm check 0/0.</done>
</task>

<task type="auto">
  <name>Task 2: Replace the /services stub with the real route (+page.svelte)</name>
  <files>src/routes/services/+page.svelte</files>
  <read_first>
    - src/routes/services/+page.svelte (the 04-01 placeholder stub: `<h1>Services</h1>` + `TODO(04-03)` comment — REPLACE it entirely with the real composition)
    - src/lib/content/seo.ts (seo.services)
    - src/lib/components/sections/ServicesDetail.svelte (Task 1)
  </read_first>
  <action>
    REPLACE the existing 04-01 placeholder stub `src/routes/services/+page.svelte` entirely (it currently holds only `<h1>Services</h1>` + a `TODO(04-03)` comment — no leftover TODO or bare stub may remain):
    - `<script lang="ts"> import ServicesDetail from '$lib/components/sections/ServicesDetail.svelte'; import { seo } from '$lib/content'; const meta = seo.services; </script>`
    - `<svelte:head><title>{meta.title}</title><meta name="description" content={meta.description} /></svelte:head>`
    - `<h1>Services</h1>` (the single route h1) followed by `<ServicesDetail />`.
    - No `+page.ts` needed — prerender/trailingSlash inherit from the root `+layout.ts`. No inline styles.
  </action>
  <acceptance_criteria>
    - `src/routes/services/+page.svelte` is the real page (stub replaced); `grep -c '<h1' src/routes/services/+page.svelte` equals 1 AND `grep -ni 'TODO(04-03)' src/routes/services/+page.svelte` returns nothing (stub marker gone).
    - `grep -q 'seo.services\|meta.title' src/routes/services/+page.svelte` AND `<svelte:head>` present.
    - `grep -q 'ServicesDetail' src/routes/services/+page.svelte`.
    - `grep -n 'style=' src/routes/services/+page.svelte` returns nothing (no inline styles).
    - `pnpm check` 0/0 AND `pnpm exec vitest run --project client src/lib/components/sections/ServicesDetail.svelte.spec.ts` GREEN.
  </acceptance_criteria>
  <verify>
    <automated>pnpm check && pnpm exec vitest run --project client src/lib/components/sections/ServicesDetail.svelte.spec.ts</automated>
  </verify>
  <done>/services stub replaced by real page: single h1 + ServicesDetail + seo.services head; check + spec GREEN.</done>
</task>

</tasks>

<verification>
- `pnpm exec vitest run --project client src/lib/components/sections/ServicesDetail.svelte.spec.ts` GREEN.
- `pnpm check` 0/0; `pnpm exec eslint .` clean.
- Route reachability + axe over /services/ verified in 04-06 (pages.e2e.ts + a11y.e2e.ts).
</verification>

<success_criteria>
- `/services/` renders all four pillars (barrel-sourced), each an h2 region, under one h1, with prerendered SEO — the 04-01 stub is fully replaced.
</success_criteria>

<output>
After completion, create `.planning/phases/04-accessible-section-components/04-03-SUMMARY.md`.
</output>
</output>
</content>
