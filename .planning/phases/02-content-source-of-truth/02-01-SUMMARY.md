---
phase: 02-content-source-of-truth
plan: 01
subsystem: content
tags: [typescript, vitest, discriminated-union, content-model, invariants]

# Dependency graph
requires:
  - phase: 01-foundation-tokens-live-deploy
    provides: typed `as const` module + barrel house style (tokens/colors.ts, lib/index.ts), vitest two-project config (server/client)
provides:
  - "Slot<T> = Published<T> | ContentPending discriminated union (compiler-enforced no-fabrication contract)"
  - "Content type shapes: Service, Testimonial, Engagement, Press, SocialLink, NavItem, PageMeta, Mission"
  - "Four RED invariant specs: fabrication (CONT-03), nav-parity (CONT-02), SEO bounds, single-surface barrel (CONT-01/02)"
affects: [02-02, 02-03, 02-04, phase-04-social-proof, content-authoring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Slot<T> discriminated union: published items carry required attribution; pending items carry only a reason (unrepresentable fabrication)"
    - "Nyquist RED harness: invariant specs authored before target modules exist, going GREEN as later waves land data"
    - "Pure-node content specs run under vitest `server` project (no chromium)"

key-files:
  created:
    - src/lib/content/types.ts
    - src/lib/content/fabrication.spec.ts
    - src/lib/content/nav.spec.ts
    - src/lib/content/seo.spec.ts
    - src/lib/content/content.spec.ts
  modified: []

key-decisions:
  - "Attribution is required (non-optional) on Engagement/Testimonial/Press via Published<T> intersection — CONT-03 enforced by tsc, not reviewer vigilance"
  - "SocialLink.link is Slot<{url}> so a published social link cannot exist without an https URL and a pending one carries only a reason"
  - "Iterate each typed social-proof array separately in fabrication.spec to keep status-narrowing clean and avoid a mixed-array tsc error on `source`"

patterns-established:
  - "Content contract lives in a types-only module (fully type-erased, no runtime code, no imports)"
  - "Invariant specs use extensionless relative imports (moduleResolution: bundler) and each `it` calls expect() (global requireAssertions on)"

requirements-completed: [CONT-01, CONT-02, CONT-03]

# Metrics
duration: 3min
completed: 2026-07-05
---

# Phase 02 Plan 01: Content Type Contract & RED Invariant Harness Summary

**Slot<T>=Published<T>|ContentPending discriminated union making "a quote without a source" unrepresentable, plus four RED vitest specs encoding the no-fabrication, nav-parity, SEO-bounds, and single-surface invariants.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-05T00:07:49Z
- **Completed:** 2026-07-05T00:10:41Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments
- Authored `types.ts` — the load-bearing content contract where `Published<T>` forces required `attribution`/`url` and `ContentPending` carries only a reason, so CONT-03 is a compiler guarantee.
- Authored the four-file Nyquist invariant harness (fabrication, nav, seo, content) that is intentionally RED now and turns GREEN as Waves 2/3 author the content modules.
- Confirmed `types.ts` type-checks with exit 0 in isolation; confirmed all four specs fail on unresolved imports to not-yet-authored modules (intended RED state).

## Task Commits

Each task was committed atomically:

1. **Task 1: Author the content type contract (types.ts)** - `9273508` (feat)
2. **Task 2: Author the four invariant spec files (RED harness)** - `abace9e` (test)

_Note: Task 2 is a TDD RED task — the "GREEN" completion belongs to Waves 2/3 (plans 02-02..02-04), so it is a single RED commit here by design._

## Files Created/Modified
- `src/lib/content/types.ts` - Slot<T> discriminated union + all content shapes; attribution required on social-proof types (types-only, no runtime).
- `src/lib/content/fabrication.spec.ts` - CONT-03: published-item attribution, pending-slot reason, https social URLs, placeholder/lorem/fake-number denylist.
- `src/lib/content/nav.spec.ts` - CONT-02: required routes present, no "Log In" label, non-empty route+label.
- `src/lib/content/seo.spec.ts` - SEO field bounds: title 1..60, description 50..160, meta for every page.
- `src/lib/content/content.spec.ts` - CONT-01/02: barrel single-surface re-export + nav→seo route parity + surface-wide denylist.

## Decisions Made
- Kept `attribution` non-optional through the `Published<T>` intersection so fabrication is a type error, not a lint rule.
- Modeled `SocialLink.link` as `Slot<{url}>` so a published link without a URL is unrepresentable.
- In `fabrication.spec`, iterated `engagements`, `testimonials`, `press` in separate loops (asserting only `attribution`) to preserve clean `status` narrowing and avoid a `s.source` tsc error under the future Wave-3 `pnpm check` gate.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The plan's Task 2 automated grep verify uses `log\\s?in`, which mis-fires under POSIX grep escaping due to the literal `?`. Confirmed via the Grep tool that `nav.spec.ts` contains `/log\s?in/i` exactly as specified — a verify-command escaping artifact, not a content defect.

## Known Stubs

None. This plan intentionally authors specs whose target modules (`./socialProof`, `./contact`, `./site`, `./seo`, `./index`) do not exist yet — that is the designed Nyquist RED state, not a stub. Those modules are delivered by plans 02-02 through 02-04.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Downstream plans (02-02 nav/site + seo, 02-03 socialProof/contact, 02-04 barrel/index) now have the exact type shapes to import and the exact tests they must satisfy.
- `pnpm check` is expected to remain non-green for the specs until Wave 3 (plan 02-04) lands the barrel — no error originates from `types.ts` itself.
- The four content specs run under the vitest `server` project: `pnpm exec vitest run --project server src/lib/content`.

## Self-Check: PASSED

All 5 created files present on disk and both task commits (`9273508`, `abace9e`) exist in git history.

---
*Phase: 02-content-source-of-truth*
*Completed: 2026-07-05*
