---
phase: 02-content-source-of-truth
plan: 04
subsystem: content
tags: [typescript, barrel, single-surface, vitest, svelte-check, content-parity]

# Dependency graph
requires:
  - phase: 02-content-source-of-truth
    plan: 02
    provides: "site/nav/footer, services, seo real-copy modules"
  - phase: 02-content-source-of-truth
    plan: 03
    provides: "contact/socialLinks, engagements/testimonials/press, about modules"
provides:
  - "src/lib/content/index.ts — THE single content import surface ($lib/content) both modes consume"
  - "GREEN phase gate: all four content specs pass + whole content layer type-checks (pnpm check exit 0)"
affects: [phase-03-pages, phase-04-social-proof, content-authoring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "One barrel (src/lib/content/index.ts) re-exports every content module; duplicate/per-mode content is un-representable because there is no second import surface (CONT-01/02)"
    - "Slot-bearing arrays are annotated as their readonly Slot<T>[] union (not `as const`) so status-branching type-checks for BOTH variants — narrow `as const` would break every consumer"

key-files:
  created:
    - src/lib/content/index.ts
  modified:
    - src/lib/content/socialProof.ts
    - src/lib/content/contact.ts

key-decisions:
  - "The barrel re-exports types + site/nav/footer + services + about + contact/socialLinks + engagements/testimonials/press + seo — the single surface (CONT-01)"
  - "Widened engagements/testimonials/press/socialLinks from `as const satisfies` to a `readonly Slot<T>[]`/`SocialLink[]` annotation so both published and pending variants stay representable to the CONT-03 spec and every future renderer"

patterns-established:
  - "Content parity is structural, not procedural: both renderers import from $lib/content, so a string can never live in only one mode"
  - "Slot arrays carry their union type at the module boundary so consumers can branch on status without a tsc 'no overlap' error"

requirements-completed: [CONT-01, CONT-02, CONT-03]

# Metrics
duration: 27min
completed: 2026-07-05
---

# Phase 02 Plan 04: The Single Content Barrel (index.ts) Summary

**Created `src/lib/content/index.ts` — the one import surface (`$lib/content`) both the Accessible and Premium renderers consume — turning `content.spec.ts` GREEN, making the whole four-spec content suite (13/13) and the `pnpm check` type gate pass, and closing Phase 2 with content parity as a structural property.**

## Performance

- **Duration:** ~27 min (wall; most was context load + the phase type-gate fix)
- **Tasks:** 1 (TDD — the RED `content.spec.ts` was authored in plan 02-01)
- **Files created:** 1
- **Files modified:** 2

## Accomplishments

- Authored the barrel `src/lib/content/index.ts` re-exporting `export * from './types'` plus `site, nav, footer, services, about, contact, socialLinks, engagements, testimonials, press, seo` — the single content surface (CONT-01). There is now no second place to import copy from, so per-mode/duplicate content is un-representable (CONT-01/02 structural).
- Turned `content.spec.ts` GREEN: the barrel exposes every required section, every nav route (`/`, `/services`, `/about`, `/contact`, `/accessibility`) maps to a `seo` section (`home`/`services`/`about`/`contact`/`accessibility`), and the serialized surface carries no fabricated strings.
- Brought the entire Phase 2 content suite GREEN: `pnpm exec vitest run --project server src/lib/content` = 4 files / 13 tests passing.
- Made `pnpm check` exit 0 across the whole content layer (597 files, 0 errors) — the phase type-gate.

## Task Commits

Each task committed atomically:

1. **Task 1: Create the content barrel (index.ts)** — `05903ae` (feat)
2. **Deviation fix: widen Slot-bearing arrays for the phase type-gate** — `e666a0a` (fix)

## Files Created/Modified

- `src/lib/content/index.ts` — the single content surface; re-exports every content module (CONT-01).
- `src/lib/content/socialProof.ts` — `engagements`/`testimonials`/`press` re-typed as `readonly Slot<T>[]` (was `as const satisfies`).
- `src/lib/content/contact.ts` — `socialLinks` re-typed as `readonly SocialLink[]` (was `as const satisfies`).

## Decisions Made

- The barrel is authored in the Phase 1 `$lib`-barrel style and is resolved as `$lib/content`; both modes import named exports from it exclusively.
- Slot-bearing arrays are annotated with their union type rather than `as const` so a consumer (and the CONT-03 invariant) can narrow on `status` for both the `published` and `pending` arms. Immutability is unchanged — every field in `types.ts` is already `readonly`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Widened Slot-bearing arrays so the phase type-gate passes**
- **Found during:** Task 1 verification (`pnpm check`).
- **Issue:** With the barrel in place, `pnpm check` type-checks the whole content layer for the first time and surfaced 6 pre-existing errors in `fabrication.spec.ts`. `testimonials`, `press`, and `socialLinks` were declared `as const satisfies …`, which narrows each array to a single Slot variant (pending-only). The spec's defensive `if (s.status === 'published')` / `link.status === 'published'` branches then became "types have no overlap" errors, and `.attribution` / `.url` were reported missing. This is also a latent bug: every future phase-3 consumer that branches on `status` would hit the same error.
- **Fix:** Annotated the four arrays as `readonly Slot<Engagement>[]` / `Slot<Testimonial>[]` / `Slot<Press>[]` (socialProof.ts) and `readonly SocialLink[]` (contact.ts), preserving the full union so both variants stay representable. No test assertion was weakened; immutability is preserved by the `readonly` type fields.
- **Files modified:** `src/lib/content/socialProof.ts`, `src/lib/content/contact.ts`
- **Commit:** `e666a0a`
- **Rationale for scope:** This plan's explicit objective/success criterion is that `pnpm check` type-check the whole content layer cleanly as the phase gate. The erroring file was authored earlier, but greening the gate is the stated purpose of this closing plan, so the fix is in scope.

## Issues Encountered

None beyond the type-gate deviation documented above.

## Known Stubs

None introduced by this plan. The pre-existing honest `pending` slots (about.ts mission; the four contact.ts social links) carried over from plan 02-03 remain intentional CONT-03 outcomes awaiting a future human-capture pass — not silent stubs. They are typed and un-renderable-as-real by construction.

## User Setup Required

None for this plan. (Carried over from 02-03: a future pass should confirm Eman's on-site mission wording, bio, and real social handles, then flip the corresponding pending slots to `published`; the fabrication spec keeps that pass honest.)

## Next Phase Readiness

- Phase 3 (pages) and Phase 4 (social proof) now consume all content via one import: `import { services, about, nav, seo, contact, socialLinks, engagements, testimonials, press } from '$lib/content'`.
- Both renderers (Accessible + Premium) import from the same surface, so content parity (CONT-01/02) cannot regress into per-mode copy.
- Phase gate is green: `pnpm exec vitest run --project server src/lib/content` (13/13) and `pnpm check` (0 errors) both exit 0.

## Self-Check: PASSED

- `src/lib/content/index.ts` present on disk.
- Commits `05903ae` (barrel) and `e666a0a` (type-gate fix) exist in git history.
- Full content spec suite GREEN (4 files / 13 tests); `pnpm check` exits 0.

---
*Phase: 02-content-source-of-truth*
*Completed: 2026-07-05*
