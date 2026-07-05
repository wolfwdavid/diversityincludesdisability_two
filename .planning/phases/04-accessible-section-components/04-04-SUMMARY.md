---
phase: 04-accessible-section-components
plan: 04
subsystem: ui
tags: [svelte5, sveltekit, a11y, content-barrel, slot-union, tdd, seo]

# Dependency graph
requires:
  - phase: 02-content-layer
    provides: "$lib/content barrel (about, engagements, testimonials, press, seo) + Slot<T> union"
  - phase: 04-accessible-section-components (04-01)
    provides: "route stubs (incl. /about placeholder), layout shell, ModeToggle, tokens"
provides:
  - "About.svelte — barrel-driven bio section honoring the pending mission (no fabrication)"
  - "SocialProof.svelte — published MBP engagement + honest role=note pending markers, branching on Slot.status"
  - "Real /about route (replaces the 04-01 stub): single h1 + seo.about head + About + SocialProof"
  - "Content-layer fix: about.mission is now genuinely typed Slot<Mission> so every status guard compiles"
affects: [04-06 (route reachability + axe over /about/), phase-06 (QA a11y gates), phase-05 (premium peers)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pending-slot rendering: branch on Slot<T>.status; published arm renders attributable copy, pending arm renders role=note coming-soon note (never .reason)"
    - "Route owns the single <h1>; composed section components start at <h2> (A11Y-02)"
    - "Slot-bearing content values typed as explicit unions (not `as const`) so consumers can branch on status"

key-files:
  created:
    - src/lib/components/sections/About.svelte
    - src/lib/components/sections/About.svelte.spec.ts
    - src/lib/components/sections/SocialProof.svelte
    - src/lib/components/sections/SocialProof.svelte.spec.ts
  modified:
    - src/routes/about/+page.svelte
    - src/lib/content/about.ts

key-decisions:
  - "Typed `about` with an explicit annotation instead of `as const satisfies` so `about.mission` stays the wide `Slot<Mission>` union; `as const` collapsed it to its pending literal and made every `status === 'published'` guard an 'unintentional comparison' type error"
  - "Added each-block keys (bio by paragraph string, engagements by index) to satisfy svelte/require-each-key"

patterns-established:
  - "Pending-slot rendering via Slot.status branch — anti-fabrication guarantee made visible in the template (CONT-03)"
  - "Section components are h2-rooted and barrel-driven; the route composes them under one h1 with seo-driven <svelte:head>"

requirements-completed: [SECT-03, SECT-04]

# Metrics
duration: 20min
completed: 2026-07-05
---

# Phase 04 Plan 04: About + Social-Proof Summary

**Barrel-driven /about page — Eman Rimawi's attributable bio plus the one real Manhattan Borough President engagement, with all-pending testimonials/press shown as honest `role=note` markers, branching on `Slot<T>.status` so nothing is ever fabricated.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-07-05T09:34:00Z
- **Completed:** 2026-07-05T09:54:24Z
- **Tasks:** 3
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments
- `About.svelte` renders all three attributable bio paragraphs from `$lib/content`; the pending `about.mission` renders nothing (no invented mission statement).
- `SocialProof.svelte` branches on `Slot<T>.status`: renders the ONE published engagement (Disability equity & inclusion training for the Office of the Manhattan Borough President / Mark Levine) with its attribution, and renders the all-pending testimonials and press as explicit `role="note"` "coming soon" notes.
- The `/about` route stub (04-01 `TODO(04-04)` placeholder) is fully replaced by the real page: a single `<h1>` (`about.displayName`), `<svelte:head>` from `seo.about`, composing `About` + `SocialProof`.
- Root-caused and fixed a content-layer typing defect: `about.mission` is now a genuine `Slot<Mission>` union, unblocking every `status === 'published'` guard (this also unblocked a sibling wave-2 `Mission.svelte`).

## Task Commits

Each task was committed atomically (parallel executor — all commits `--no-verify`):

1. **Task 1: About.svelte (TDD)** — `90c0f1d` (test) → `298527a` (feat, incl. content fix)
2. **Task 2: SocialProof.svelte (TDD)** — `d51e1c7` (test) → `7f19ec3` (feat)
3. **Task 3: Replace /about stub with real route** — `3942d78` (feat, incl. each-key lint fixes)

**Plan metadata:** committed with STATE/ROADMAP update (docs).

## Files Created/Modified
- `src/lib/components/sections/About.svelte` — bio section; h2-rooted; branches on `about.mission.status`; 65ch measure, token colors.
- `src/lib/components/sections/About.svelte.spec.ts` — client spec: 3 bio facts render, pending mission not fabricated, no h1.
- `src/lib/components/sections/SocialProof.svelte` — engagement/testimonial/press section; branches on `Slot.status`; `role=note` pending markers.
- `src/lib/components/sections/SocialProof.svelte.spec.ts` — client spec: published MBP engagement + attribution, ≥2 pending notes, no reason leakage, no h1.
- `src/routes/about/+page.svelte` — real About route; single h1 (`about.displayName`) + `seo.about` head + composed sections.
- `src/lib/content/about.ts` — retyped with explicit annotation so `about.mission` stays `Slot<Mission>`; runtime value unchanged (still pending).

## Decisions Made
- **Explicit type over `as const` for `about`:** `as const satisfies {…}` (plus const control-flow narrowing) collapsed `about.mission` to its concrete pending literal, so `about.mission.status === 'published'` failed as an "unintentional comparison". Retyping `about` with an explicit annotation (mirroring how `socialProof.ts` types its `Slot<T>[]` unions) keeps the union intact. Runtime data is identical — the JSON blob still passes the Phase-2 CONT-01/02/03 invariant specs.
- **Each-block keys:** `svelte/require-each-key` requires keys; bio keyed by paragraph string, engagements keyed by index (static prerendered list, no reordering).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `about.mission` collapsed to a pending literal by `as const`, breaking the status guard**
- **Found during:** Task 1 (About.svelte)
- **Issue:** `src/lib/content/about.ts` authored `about` with `as const satisfies {…}`, which (with const CFA narrowing) typed `about.mission` as its concrete `{status:'pending'; reason}` literal. The plan's required `about.mission.status === 'published'` guard then failed `pnpm check` ("This comparison appears to be unintentional… no overlap"). A typed intermediate const did not help (CFA re-narrows). The same defect was independently blocking a sibling wave-2 `Mission.svelte`.
- **Fix:** Gave `about` an explicit type annotation (`{ … readonly mission: Slot<Mission> }`) instead of `as const satisfies`, so `about.mission` is the wide union. No cast; runtime value unchanged.
- **Files modified:** src/lib/content/about.ts
- **Verification:** `pnpm check` 0 errors / 0 warnings across 630 files; Phase-2 content invariant specs (`content.spec.ts`, `fabrication.spec.ts`) still 7/7 GREEN.
- **Committed in:** `298527a` (Task 1 feat commit)

**2. [Rule 3 - Blocking] `svelte/require-each-key` on the bio and engagements each-blocks**
- **Found during:** Task 3 (eslint gate)
- **Issue:** RESEARCH Pattern 5's verbatim `{#each …}` blocks had no key; `pnpm exec eslint` errored `svelte/require-each-key`.
- **Fix:** Keyed `about.bio` by paragraph string and `engagements` by index (static, non-reordering prerendered lists).
- **Files modified:** src/lib/components/sections/About.svelte, src/lib/components/sections/SocialProof.svelte
- **Verification:** eslint clean on touched files; specs still 13/13 GREEN.
- **Committed in:** `3942d78` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking)
**Impact on plan:** Both were required to make the plan's own acceptance gates (`pnpm check` 0/0, eslint clean) pass with the plan's specified guards. The content-layer retyping is minimal (types only; runtime data and all Phase-2 invariants unchanged) and additionally unblocked a sibling plan. No scope creep.

## Issues Encountered
- None beyond the two auto-fixed blocking type/lint issues above.

## Known Stubs
- None introduced. The pending testimonials/press and pending `about.mission` are intentional, honest `pending` `Slot` markers per PROJECT/CONT-03 — surfaced as `role=note` "coming soon" notes / omitted mission, not fabricated content. Their resolution is a future human content-capture pass (v2 SOCL-01/02), not this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `/about/` renders bio + the real MBP engagement + honest pending markers under one h1 with no fabrication — 04-01 stub fully replaced.
- Route reachability + `@axe-core/playwright` WCAG 2.2 AA scan over `/about/` is verified in 04-06 (per the plan's verification note).

---
*Phase: 04-accessible-section-components*
*Completed: 2026-07-05*

## Self-Check: PASSED

All 7 created/modified files present on disk; all 5 task commits (90c0f1d, 298527a, d51e1c7, 7f19ec3, 3942d78) present in git history.
