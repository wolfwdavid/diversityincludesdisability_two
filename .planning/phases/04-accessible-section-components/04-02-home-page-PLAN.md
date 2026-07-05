---
phase: 04-accessible-section-components
plan: 02
type: tdd
wave: 2
depends_on: ["04-01"]
files_modified:
  - src/lib/components/sections/Hero.svelte
  - src/lib/components/sections/Hero.svelte.spec.ts
  - src/lib/components/sections/Mission.svelte
  - src/lib/components/sections/ServicesOverview.svelte
  - src/lib/components/sections/ServicesOverview.svelte.spec.ts
  - src/routes/+page.svelte
autonomous: true
requirements: [SECT-01, A11Y-02]

must_haves:
  truths:
    - "The Home route renders a hero (site.tagline / about.intro headline + a primary 'Let's Connect' mailto CTA), a mission section, a services overview, all sourced from $lib/content (SECT-01)"
    - "The primary CTA is a real mailto:emanrimawi@gmail.com link built from the contact barrel, with descriptive text 'Let's Connect' (SECT-01, A11Y-03)"
    - "The services overview lists all four service titles and links to the Services detail page via resolve('/services') (SECT-01)"
    - "The route has exactly ONE <h1> (owned by the route/hero); every section component starts at <h2> — no second h1, no skipped level (A11Y-02)"
    - "The mission slot is honored: about.mission is pending, so no fabricated mission statement is rendered — either omitted or shown as a neutral note (CONT-03)"
    - "<svelte:head> sets title/description from seo.home (prerendered)"
  artifacts:
    - path: "src/lib/components/sections/Hero.svelte"
      provides: "Hero headline + intro + primary mailto CTA"
      contains: "mailto:"
      min_lines: 15
    - path: "src/lib/components/sections/Mission.svelte"
      provides: "Mission section branching on about.mission status (no fabrication)"
      contains: "status"
    - path: "src/lib/components/sections/ServicesOverview.svelte"
      provides: "Overview of 4 services + link to /services"
      contains: "resolve"
    - path: "src/routes/+page.svelte"
      provides: "Home composition + <svelte:head> from seo.home, single <h1>"
      contains: "<h1"
  key_links:
    - from: "src/routes/+page.svelte"
      to: "$lib/components/sections/{Hero,Mission,ServicesOverview}.svelte + $lib/content (seo)"
      via: "import + compose"
      pattern: "Hero"
    - from: "src/lib/components/sections/Hero.svelte"
      to: "$lib/content (contact, site, about)"
      via: "import { contact, site, about }"
      pattern: "from '\\$lib/content'"
---

<objective>
Replace the Phase-1 inline-styled placeholder `src/routes/+page.svelte` with the real Home page (SECT-01):
a text/CSS hero (headline from `site.tagline`/`about.intro` + a prominent `mailto` "Let's Connect" CTA), a
mission section that honors the pending `about.mission` slot without fabricating, and a services overview
listing the four pillars with a link to `/services`. The route owns the single `<h1>`; section components
start at `<h2>` (A11Y-02). No image dependency (accessible text/CSS hero per RESEARCH Open Q#1). All copy
comes from `$lib/content`; `<svelte:head>` reads `seo.home`.

Purpose: SECT-01 (home hero/mission/services/CTA) and A11Y-02 (single ordered heading tree) established on
the primary landing page. Anti-fabrication (CONT-03) enforced by branching on `about.mission.status`.

Output: `src/lib/components/sections/{Hero,Mission,ServicesOverview}.svelte` (+ Hero/ServicesOverview specs);
real `src/routes/+page.svelte`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-accessible-section-components/04-RESEARCH.md
@src/routes/+page.svelte
@src/lib/content/site.ts
@src/lib/content/about.ts
@src/lib/content/contact.ts
@src/lib/content/services.ts
@src/lib/content/seo.ts

<interfaces>
<!-- Barrel exports consumed (from $lib/content). Use directly. -->
```typescript
export const site: { name: string; founder: string; legalName: string; tagline: string }; // tagline = "My name is Eman Rimawi"
export const about: { displayName: string; legalName: string; intro: string; bio: readonly string[];
  mission: { status: 'published'; statement: string } | { status: 'pending'; reason: string } };  // mission is PENDING
export const contact: { email: string; mailtoSubject: string; ctaLabel: string }; // email emanrimawi@gmail.com, ctaLabel "Let's Connect"
export const services: readonly { id: string; title: string; summary: string }[]; // 4 items
export const seo: { home: { title: string; description: string }, ... };
```
```typescript
import { resolve } from '$app/paths';   // ServicesOverview ONLY: resolve('/services') for the overview link
```
The `/services` route already exists as a 04-01 placeholder stub, so `resolve('/services')` in ServicesOverview
typechecks against the closed RouteId union (04-03 later replaces that stub with the real page). Hero does NOT
call resolve — it only builds a `mailto:` link — so Hero MUST NOT import `resolve` (unused import fails the
`@typescript-eslint/no-unused-vars` eslint gate in 04-06).
CSS: use --color-* tokens only (see 04-01 interfaces). Global :focus-visible ring exists. No raw hex, no non-essential motion (A11Y-08).
mailto pattern (RESEARCH Pattern 6): `mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Hero.svelte (headline + primary mailto CTA)</name>
  <files>src/lib/components/sections/Hero.svelte, src/lib/components/sections/Hero.svelte.spec.ts</files>
  <read_first>
    - src/lib/content/{site,about,contact}.ts (exact fields)
    - src/lib/components/ModeToggle.svelte.spec.ts (client-spec conventions + requireAssertions)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 6: Contact mailto" and § Open Q#1 (text/CSS hero, no image)
  </read_first>
  <behavior>
    - Renders a heading (the ROUTE owns <h1>; Hero renders its lead content — the h1 lives in +page.svelte OR Hero exposes the h1 exactly once, decide in Task 3; here render an <h2> heading unless designated the h1 host).
    - Renders the intro text from `about.intro` / `site.tagline`.
    - Renders a CTA anchor whose href is `mailto:emanrimawi@gmail.com?subject=...` and whose visible text is `contact.ctaLabel` ("Let's Connect").
  </behavior>
  <action>
    Write `Hero.svelte.spec.ts` FIRST (RED): mount Hero, assert a link with accessible name /Let's Connect/i whose `href` starts with `mailto:emanrimawi@gmail.com`, and assert the intro text (`about.intro`) is present. Every `it` has an assertion.
    Then implement `src/lib/components/sections/Hero.svelte`:
    - `import { about, contact, site } from '$lib/content';` — do NOT import `resolve` from `$app/paths`: Hero only builds a `mailto:` string and never calls resolve; an unused `resolve` import fails the `no-unused-vars` eslint gate (04-06 WARNING).
    - `const mailto = \`mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}\`;`
    - Markup: a `<section class="hero" aria-labelledby="hero-h">` containing the lead heading (`id="hero-h"`), a `<p>` with `about.intro`/`site.tagline`, and `<a class="cta" href={mailto}>{contact.ctaLabel}</a>`.
    - IMPORTANT heading level: this component is composed under the route. If Task 3 assigns Hero to host the page `<h1>`, use `<h1 id="hero-h">`; otherwise `<h2>`. Coordinate so the page ends with exactly one `<h1>`. Default: Hero hosts the `<h1>` (it is the lead), and +page.svelte does NOT add another h1.
    - Scoped `<style>`: fluid heading `font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);`; `.cta` styled with `background:var(--color-accent); color:var(--did-ink); border:2px solid var(--color-accent-border); padding:.5rem 1rem; border-radius:.375rem; text-decoration:none; display:inline-block;`. rem units; no raw hex beyond the existing `--did-ink` token var; NO non-essential transition/animation.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest run --project client src/lib/components/sections/Hero.svelte.spec.ts` GREEN.
    - `grep -q 'mailto:' src/lib/components/sections/Hero.svelte` AND `grep -q 'ctaLabel' src/lib/components/sections/Hero.svelte`.
    - Hero does NOT import resolve (avoid no-unused-vars): `grep -n "from '\\$app/paths'" src/lib/components/sections/Hero.svelte` returns nothing.
    - `grep -q "from '\\$lib/content'" src/lib/components/sections/Hero.svelte` (no hard-coded copy).
    - No raw hex color literal in Hero.svelte style except token `var(--...)`: `grep -nE ':\s*#[0-9a-fA-F]{3,6}' src/lib/components/sections/Hero.svelte` returns nothing.
    - `pnpm check` 0/0 AND `pnpm exec eslint src/lib/components/sections/Hero.svelte` clean (no unused import).
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run --project client src/lib/components/sections/Hero.svelte.spec.ts</automated>
  </verify>
  <done>Hero renders intro + mailto "Let's Connect" CTA from the barrel (no resolve import); spec GREEN; pnpm check 0/0.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Mission.svelte + ServicesOverview.svelte</name>
  <files>src/lib/components/sections/Mission.svelte, src/lib/components/sections/ServicesOverview.svelte, src/lib/components/sections/ServicesOverview.svelte.spec.ts</files>
  <read_first>
    - src/lib/content/{about,services}.ts (about.mission is a pending Slot; services has 4 items)
    - src/routes/services/+page.svelte (the 04-01 stub — its existence is why `resolve('/services')` typechecks in ServicesOverview)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Pattern 5: Pending-slot rendering" and § "Pattern 4: content-driven section"
  </read_first>
  <behavior>
    - Mission: when `about.mission.status === 'published'` render `about.mission.statement` in a section; when `'pending'` render NO fabricated statement (either render nothing or a neutral note — never invent text). Current data is pending, so the spec asserts no invented mission copy appears.
    - ServicesOverview: renders all 4 `services` titles as `<h3>` items under an `<h2>` region, plus a descriptive link to the full Services page via `resolve('/services')` (text e.g. "See all services").
  </behavior>
  <action>
    Write `ServicesOverview.svelte.spec.ts` FIRST (RED): mount, assert all 4 service titles present, assert a link with href `resolve('/services')` (i.e. containing `/services`) and descriptive text (NOT "click here"). Assertions in every `it`.
    Implement `src/lib/components/sections/Mission.svelte`:
    - `import { about } from '$lib/content';`
    - `<section aria-labelledby="mission-h"><h2 id="mission-h">Mission</h2>{#if about.mission.status === 'published'}<p>{about.mission.statement}</p>{:else}<p class="pending" role="note">Mission statement coming soon.</p>{/if}</section>`
    Implement `src/lib/components/sections/ServicesOverview.svelte`:
    - `import { services } from '$lib/content'; import { resolve } from '$app/paths';` — `resolve('/services')` typechecks because 04-01 created the `/services` route stub (04-03 replaces it with the real page).
    - `<section aria-labelledby="svc-ov-h"><h2 id="svc-ov-h">Services</h2><ul>{#each services as s (s.id)}<li><h3>{s.title}</h3><p>{s.summary}</p></li>{/each}</ul><a href={resolve('/services')}>See all services</a></section>`
    - Scoped styles use `--color-*` tokens; responsive grid via `@media (min-width:48rem)` for multi-column, single column default (SECT-07). No non-essential motion.
  </action>
  <acceptance_criteria>
    - `pnpm exec vitest run --project client src/lib/components/sections/ServicesOverview.svelte.spec.ts` GREEN.
    - `grep -q 'about.mission.status' src/lib/components/sections/Mission.svelte` (branches on status — no fabrication).
    - Mission.svelte contains NO hard-coded mission sentence beyond the neutral "coming soon" note: `grep -niE 'diversity includes disability is|our mission is to' src/lib/components/sections/Mission.svelte` returns nothing.
    - `grep -q 'resolve' src/lib/components/sections/ServicesOverview.svelte` AND `grep -q '<h3' src/lib/components/sections/ServicesOverview.svelte` AND `grep -q '<h2' src/lib/components/sections/ServicesOverview.svelte` (no h1 in a section).
    - No `click here`: `grep -ni 'click here' src/lib/components/sections/ServicesOverview.svelte` returns nothing.
    - `pnpm check` 0/0.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run --project client src/lib/components/sections/ServicesOverview.svelte.spec.ts</automated>
  </verify>
  <done>Mission honors the pending slot; ServicesOverview lists 4 pillars + resolve('/services') link; spec GREEN; pnpm check 0/0.</done>
</task>

<task type="auto">
  <name>Task 3: Compose the Home route (+page.svelte)</name>
  <files>src/routes/+page.svelte</files>
  <read_first>
    - src/routes/+page.svelte (Phase-1 placeholder to REPLACE entirely — remove inline styles, RESEARCH Pitfall 6)
    - src/lib/components/sections/{Hero,Mission,ServicesOverview}.svelte (Tasks 1–2)
    - src/lib/content/seo.ts (seo.home)
  </read_first>
  <action>
    REPLACE `src/routes/+page.svelte` entirely (no leftover inline `style="..."`):
    - `<script lang="ts">` imports Hero, Mission, ServicesOverview from `$lib/components/sections/*`, and `import { seo } from '$lib/content'; const meta = seo.home;`
    - `<svelte:head><title>{meta.title}</title><meta name="description" content={meta.description} /></svelte:head>`
    - Body composes: `<Hero /> <Mission /> <ServicesOverview />` in that order.
    - Ensure exactly ONE `<h1>` on the rendered page: Hero hosts the `<h1>` (per Task 1 default); +page.svelte adds NO additional `<h1>`. If Task 1 chose an `<h2>` for Hero instead, add a single `<h1>` here before Hero. Net: exactly one h1.
    - No inline `style=` attributes; all presentation in the section components' scoped styles.
  </action>
  <acceptance_criteria>
    - `grep -c '<h1' src/routes/+page.svelte src/lib/components/sections/Hero.svelte` sums to exactly 1 across the two files (single h1 for the route — A11Y-02).
    - `grep -q 'seo.home\|meta.title' src/routes/+page.svelte` AND `<svelte:head>` present.
    - `grep -q 'Hero' src/routes/+page.svelte` AND `grep -q 'Mission' src/routes/+page.svelte` AND `grep -q 'ServicesOverview' src/routes/+page.svelte`.
    - No inline styles: `grep -n 'style=' src/routes/+page.svelte` returns nothing.
    - `pnpm check` 0/0 AND `pnpm exec vitest run --project client src/lib/components/sections` GREEN (Hero + ServicesOverview specs).
  </acceptance_criteria>
  <verify>
    <automated>pnpm check && pnpm exec vitest run --project client src/lib/components/sections</automated>
  </verify>
  <done>Home renders Hero+Mission+ServicesOverview from the barrel with seo.home head and a single h1; no inline styles; specs + check GREEN.</done>
</task>

</tasks>

<verification>
- `pnpm exec vitest run --project client src/lib/components/sections` → Hero + ServicesOverview specs GREEN.
- `pnpm check` 0/0.
- `pnpm exec eslint .` clean (no premium import; no unused `resolve` import in Hero).
- Heading/axe gate deferred to 04-06 (page-has-heading-one, heading-order over the live route).
</verification>

<success_criteria>
- Visiting `/` shows hero + mission + services overview + a working mailto CTA, all from the barrel.
- Exactly one h1; sections start at h2; pending mission not fabricated.
</success_criteria>

<output>
After completion, create `.planning/phases/04-accessible-section-components/04-02-SUMMARY.md`.
</output>
</output>
</content>
