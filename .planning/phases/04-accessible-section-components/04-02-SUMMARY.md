---
phase: 04-accessible-section-components
plan: 02
subsystem: home-page
tags: [svelte, sveltekit, a11y, content-barrel, tdd, sections]
requires:
  - "04-01: /services route stub (makes resolve('/services') typecheck)"
  - "Phase 2: $lib/content barrel (site, about, contact, services, seo)"
provides:
  - "Hero.svelte — home hero: intro lead + primary mailto 'Let's Connect' CTA, hosts the route's single <h1>"
  - "Mission.svelte — mission section that branches on the mission Slot status (no fabrication)"
  - "ServicesOverview.svelte — 4-pillar overview + descriptive resolve('/services') link"
  - "Real src/routes/+page.svelte Home composition with seo.home <svelte:head>"
affects:
  - "src/routes/+page.svelte (Phase-1 placeholder replaced)"
tech-stack:
  added: []
  patterns:
    - "Text/CSS hero (no image dependency) for a zero-extra-bytes accessible baseline (RESEARCH Open Q#1)"
    - "Widen an `as const` barrel slot to its Slot<T> union in the consumer so the published arm type-checks (no cast)"
    - "Route owns the single <h1> via the hero; every section starts at <h2> (A11Y-02)"
key-files:
  created:
    - src/lib/components/sections/Hero.svelte
    - src/lib/components/sections/Hero.svelte.spec.ts
    - src/lib/components/sections/Mission.svelte
    - src/lib/components/sections/ServicesOverview.svelte
    - src/lib/components/sections/ServicesOverview.svelte.spec.ts
  modified:
    - src/routes/+page.svelte
decisions:
  - "Hero hosts the page <h1>; +page.svelte adds no second h1 (single ordered heading tree, A11Y-02)"
  - "Widened about.mission to Slot<Mission> in Mission.svelte (the `as const` export narrows it to the pending literal, breaking the published branch) — robust vs. inverting the branch on 'pending'"
  - "Pending mission renders a neutral 'coming soon' note, never a fabricated statement (CONT-03)"
metrics:
  duration_min: 17
  tasks: 3
  files: 6
  completed: 2026-07-05
---

# Phase 4 Plan 2: Home Page Summary

Real Home route (SECT-01) composed from three accessible section components — a text/CSS
hero with the primary `mailto:` "Let's Connect" CTA, an honest pending-aware mission section,
and a four-pillar services overview linking to `/services` — all sourced from the `$lib/content`
barrel, with the route owning exactly one `<h1>` (A11Y-02) and `<svelte:head>` fed by `seo.home`.

## What Was Built

- **Hero.svelte** (+ spec): a `<section aria-labelledby>` hosting the route's single `<h1>` (org
  name), the `about.intro` lead, and a real `<a href="mailto:emanrimawi@gmail.com?subject=…">`
  whose accessible name is `contact.ctaLabel` ("Let's Connect"). No `resolve` import (it only
  builds a mailto string — keeps the `no-unused-vars` eslint gate green). Fluid `clamp()` heading,
  token-only colors, no non-essential motion.
- **Mission.svelte**: branches on the mission Slot status; current data is `pending`, so it renders
  a neutral `role="note"` "Mission statement coming soon." — never an invented statement (CONT-03).
- **ServicesOverview.svelte** (+ spec): an `<h2>` region listing all four service titles as `<h3>`
  items with summaries, plus a descriptive `resolve('/services')` link ("See all services"). Single
  column by default, two columns at `≥48rem` (SECT-07 reflow).
- **src/routes/+page.svelte**: replaced the Phase-1 inline-styled placeholder entirely — imports and
  composes `<Hero /> <Mission /> <ServicesOverview />`, sets `<svelte:head>` title/description from
  `seo.home`, no inline styles, no second `<h1>`.

## Verification

- `pnpm exec vitest run --project client src/lib/components/sections` → 6 files / 30 tests GREEN
  (Hero 3/3 + ServicesOverview 3/3 for this plan; sibling wave-2 specs also passing).
- `pnpm check` → 0 errors / 0 warnings.
- `pnpm exec eslint` over the 4 plan files → clean (exit 0); Hero has no unused `resolve` import.
- Single-`<h1>` gate: `grep -c '<h1'` over `+page.svelte` + `Hero.svelte` sums to exactly 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Mission published-arm did not typecheck under the `as const` barrel export**
- **Found during:** Task 2
- **Issue:** The plan's suggested `{#if about.mission.status === 'published'}…{about.mission.statement}`
  does not compile: `about` is exported `as const satisfies { mission: Slot<Mission> }`, so
  `about.mission` is inferred as the narrow pending literal — the `=== 'published'` comparison is a
  "no overlap" type error and `.statement` does not exist on `ContentPending`. (The parallel
  `About.svelte` from a sibling wave-2 plan hit the identical error.)
- **Fix:** Widened in the consumer with a safe typed assignment `const mission: Slot<Mission> = about.mission;`
  (no `as` cast) and branched on `mission.status`. Robust and future-proof: when the mission is later
  published, both arms already type-check. Shared content layer untouched.
- **Files modified:** src/lib/components/sections/Mission.svelte
- **Commit:** 6b88e4c
- **Note:** Task acceptance greps for the literal `about.mission.status`; the widened alias reads
  `mission.status` instead. The must_haves artifact check (`contains: "status"`) and the intent
  ("branches on status — no fabrication") are fully satisfied.

**2. [Rule 3 - Blocking] Comment text tripped the literal single-`<h1>` grep**
- **Found during:** Task 3
- **Issue:** Explanatory comments in `+page.svelte` and `Hero.svelte` contained the literal string
  `<h1>`, inflating `grep -c '<h1'` (real markup is one `<h1>` element only).
- **Fix:** Reworded the comments to say "h1" / "heading-one" so the acceptance grep sums to exactly 1.
- **Files modified:** src/routes/+page.svelte, src/lib/components/sections/Hero.svelte
- **Commit:** a65c121

### Out of Scope (not fixed — logged to deferred-items.md)

- During execution, sibling wave-2 files (`About.svelte`, `Contact.svelte`, `ServicesDetail.svelte`,
  created concurrently by parallel agents) briefly reported svelte-check type errors. These are owned
  by other plans (04-03/04-04) and were resolved by their owners; the final `pnpm check` is 0/0.

## Known Stubs

None. Mission's "coming soon" note is an intentional, typed anti-fabrication branch (CONT-03) that
resolves automatically when Eman's mission wording is captured — not a hardcoded placeholder blocking
the plan's goal.

## Self-Check: PASSED

- Files: all 6 created/modified files FOUND on disk.
- Commits: b225acd (Hero), 6b88e4c (Mission+ServicesOverview), a65c121 (Home route) present in git log.
