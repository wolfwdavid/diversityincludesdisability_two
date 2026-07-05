---
phase: 02-content-source-of-truth
plan: 02
subsystem: content
tags: [typescript, satisfies, content-model, nav, seo, vitest]

# Dependency graph
requires:
  - phase: 02-content-source-of-truth
    plan: 01
    provides: "Service, NavItem, PageMeta type contracts + RED nav/seo invariant specs"
provides:
  - "site.ts: org identity (name/founder/legalName/tagline), typed nav model (spine both modes render from), computed-year footer"
  - "services.ts: the four real DID service pillars as readonly Service[]"
  - "seo.ts: per-route PageMeta map (home/about/services/contact/accessibility), length-bounded"
affects: [02-03, 02-04, phase-03-pages, phase-04-social-proof]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Literal data + `as const satisfies readonly <Type>[]` (Phase 1 house style, mirrors tokens/colors.ts)"
    - "Nav modeled as data with route KEYS only (resolved downstream via resolve() from $app/paths — no base concatenation in data)"
    - "Copyright year computed via new Date().getFullYear() so it never goes stale (research Pitfall 5)"
    - "SEO as a typed Record<string, PageMeta> baked into static HTML by prerender; consumed via <svelte:head>, no head library"

key-files:
  created:
    - src/lib/content/site.ts
    - src/lib/content/services.ts
    - src/lib/content/seo.ts
  modified: []

key-decisions:
  - "Nav omits the Wix authentication item (out of scope) and includes the Accessibility Statement in the primary nav (SECT-06) — CONT-02 parity spine"
  - "Service summaries are truthful restatements of the four real, verbatim titles; no invented metrics or claims (CONT-03)"
  - "SEO descriptions authored to land in 50..160 chars by wording, not filler padding"

requirements-completed: [CONT-01, CONT-02]

# Metrics
duration: 4min
completed: 2026-07-05
---

# Phase 02 Plan 02: Site Identity, Nav Model & SEO Metadata Summary

**Authored the three HIGH-confidence real-copy modules — `site.ts` (org identity + typed nav spine + computed-year footer), `services.ts` (the four real DID pillars), and `seo.ts` (per-route length-bounded PageMeta) — turning `nav.spec.ts` and `seo.spec.ts` from the Nyquist RED harness GREEN.**

## Performance

- **Duration:** ~4 min
- **Tasks:** 2 (both TDD; RED specs pre-existing from plan 02-01)
- **Files created:** 3

## Accomplishments
- `site.ts` — single edit surface for org name, tagline, nav, and footer (CONT-01). Nav lists Home, Services, About, Contact, Accessibility Statement; never the Wix authentication item. Copyright year computed, not the stale "2024".
- `services.ts` — the four real service pillars (Trainings & Facilitation, Disability Consulting, Modeling for Representation, Speaker & Panelist) as `readonly Service[]`, sourced verbatim from the live site.
- `seo.ts` — typed per-route metadata for all five pages; every title <=60 chars, every description in the 50..160 snippet band.
- Turned `nav.spec.ts` (3/3) and `seo.spec.ts` (3/3) GREEN.

## Task Commits

Each task committed atomically:

1. **Task 1: Author site identity + nav model + services** — `8b38fee` (feat)
2. **Task 2: Author per-route SEO metadata** — `8d628fc` (feat)
3. **Refinement: reword nav comment to drop literal auth-item string** — `dbf623d` (refactor)

## Files Created/Modified
- `src/lib/content/site.ts` — org identity, typed nav model (spine both modes render from), computed-year footer.
- `src/lib/content/services.ts` — the four real service pillars as `readonly Service[]`.
- `src/lib/content/seo.ts` — per-route `PageMeta` map, length-bounded titles/descriptions.

## Decisions Made
- Kept the nav as pure route-key data (no `base` concatenation) so components resolve links via `resolve()` from `$app/paths`, per the Phase 1 convention.
- Authored SEO descriptions to satisfy the 50..160 bound through wording, not filler.
- Service summaries restate the real titles truthfully rather than inventing outcomes or metrics (CONT-03).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Acceptance-criterion adherence] Removed literal auth-item string from a code comment**
- **Found during:** Overall verification (Task 2 completion).
- **Issue:** The plan's Task 1 acceptance criterion requires `site.ts` to contain NO such literal string, but the explanatory nav comment quoted the Wix item verbatim. The `nav.spec.ts` invariant (which tests nav *labels*, not comments) already passed, but the literal in the comment tripped the plan's `grep -Lq` verification.
- **Fix:** Reworded the comment to "the Wix authentication item". Nav labels were never affected; `nav.spec.ts` stayed GREEN (3/3).
- **Files modified:** `src/lib/content/site.ts`
- **Commit:** `dbf623d`

## Issues Encountered
None beyond the comment-string adherence above.

## Known Stubs
None. `content.spec.ts` and `fabrication.spec.ts` remain RED by design — they import from `./socialProof`, `./contact`, and the barrel `./index`, which are delivered by plans 02-03 and 02-04. This is the intended Nyquist RED state, not a stub.

## User Setup Required
None.

## Next Phase Readiness
- Plan 02-03 (socialProof/contact) and 02-04 (barrel/index) now have `site`, `services`, and `seo` to re-export through the single import surface.
- `pnpm exec vitest run --project server src/lib/content/nav.spec.ts src/lib/content/seo.spec.ts` exits 0 (6/6).

## Self-Check: PASSED

All three created files present on disk; commits `8b38fee`, `8d628fc`, `dbf623d` exist in git history; both target specs GREEN.

---
*Phase: 02-content-source-of-truth*
*Completed: 2026-07-05*
