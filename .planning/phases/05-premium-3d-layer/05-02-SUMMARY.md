---
phase: 05-premium-3d-layer
plan: 02
subsystem: premium-3d
tags: [eslint, no-restricted-syntax, svelte5-runes, vitest, tdd, threlte-prep]

# Dependency graph
requires:
  - phase: 01-foundation-tokens-live-deploy
    provides: ESLint premium fence (no-restricted-imports) this plan hardens
  - phase: 03-mode-toggle
    provides: runes-module house style (mode.svelte.ts) the motion authority mirrors
provides:
  - Dynamic-import fence guard — no-restricted-syntax on ImportExpression > Literal[value=/premium/] (PREM-03 now covers import() everywhere; single gate exception deferred to 05-03)
  - resolveTier(signals) pure two-tier device heuristic + detectTier() browser wrapper (D-08/D-12)
  - computeMotion pure truth table — animating = !reduced && !hidden, parallax = !reduced && !touch (PREM-04/PREM-06)
  - motion.svelte.ts runes motion authority — idempotent initMotion() + motion.{animating,parallax,reduced} getters
  - WORLD_CONFIGS (5 routes incl. /accessibility quiet room) + normalizeRoute (base+trailing-slash, Pitfall 8) + configFor fallback
affects: [05-03-premium-world-entry-gate, 05-04-budget-gate-ci, 05-05-premium-e2e]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Premium-internal sibling imports are RELATIVE ('./motion-logic') — the fence forbids the aliased premium path even inside src/lib/premium/"
    - "Pure-logic module + thin runes/browser wrapper split so policy is node-provable (tier.ts/motion-logic.ts pure, motion.svelte.ts/detectTier browser)"
    - "no-restricted-syntax ImportExpression selector closes the dynamic-import hole no-restricted-imports cannot see"

key-files:
  created:
    - src/lib/premium/state/tier.ts
    - src/lib/premium/state/tier.spec.ts
    - src/lib/premium/state/motion-logic.ts
    - src/lib/premium/state/motion-logic.spec.ts
    - src/lib/premium/state/motion.svelte.ts
    - src/lib/premium/state/worldState.ts
    - src/lib/premium/state/worldState.spec.ts
  modified:
    - eslint.config.js

key-decisions:
  - "Fence guard uses ImportExpression > Literal[value=/premium/] selector (research-verified: core no-restricted-imports is blind to import()); the ONE sanctioned crossing gets a scoped eslint-disable in 05-03"
  - "initMotion() guarded by a module flag so repeated Premium re-entry never double-subscribes listeners"
  - "worldState.ts kept 100% SvelteKit-free (no app-state/app-paths imports) — the runes wrapper reading page/base arrives in 05-03"

patterns-established:
  - "Pattern: acceptance-criteria purity greps also match comments — keep forbidden literals (aliased premium path, app-runtime module names) out of doc comments in fenced modules"

requirements-completed: [PREM-02, PREM-03, PREM-04, PREM-06]

# Metrics
duration: 13min
completed: 2026-07-06
---

# Phase 5 Plan 02: Fence Guard + State Modules Summary

**ESLint no-restricted-syntax guard closes the dynamic-import fence hole, plus three node-proven pure premium contracts: two-tier device heuristic, PREM-04/06 motion truth table with runes authority, and the 5-route world config map with base-path normalizer**

## Performance

- **Duration:** 13 min
- **Started:** 2026-07-06T10:39:56Z
- **Completed:** 2026-07-06T10:53:19Z
- **Tasks:** 3 (2 TDD)
- **Files modified:** 9 (8 code + deferred-items.md note)

## Accomplishments

- The premium fence now blocks BOTH static and dynamic imports of premium code everywhere — probe-proven: a scratch file with `import("$lib/premium/...")` fails eslint with no-restricted-syntax, and the real repo lints clean (PREM-03 structural enforcement restored)
- `resolveTier`: coarse pointer OR ≤4GB deviceMemory → 'low', unknown memory → 'full' — 4 node specs green (D-08/D-12)
- `computeMotion`: full 8-row truth table green — reduced dominates both flags, hidden kills animation only, touch kills parallax only (PREM-04/PREM-06 logic core)
- `motion.svelte.ts`: the ONE runes motion authority — module-level $state signals wired idempotently to the PRM matchMedia change listener (live OS flips honored, Pitfall 4), visibilitychange, and the coarse-pointer probe; getters delegate to computeMotion so Wave 2's `useTask` running gates consume a proven table
- `WORLD_CONFIGS`: all 5 routes as configurations of ONE evolving world (D-04), `/accessibility` as the quiet room (spread 0.2, glow 0.15, D-14); `normalizeRoute` strips base path + trailing slash so dev (`base=''`) and prod subpath shapes both resolve (Pitfall 8) — 7 node specs green
- Node suite: 45/45 (3 new spec files, 15 new tests); `pnpm check` 0/0; `pnpm exec eslint .` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: ESLint dynamic-import guard + probe verification** - `372b1ca` (feat)
2. **Task 2 RED: failing tier + motion truth-table specs** - `941fbfa` (test)
3. **Task 2 GREEN: tier heuristic, motion truth table, runes motion authority** - `099ea9f` (feat)
4. **Task 3 RED: failing worldState spec** - `e8fcac7` (test)
5. **Task 3 GREEN: route→world config map + normalizer** - `be411d0` (feat)

No REFACTOR commits — GREEN implementations were already minimal (exact interface contracts from the plan).

## Files Created/Modified

- `eslint.config.js` - no-restricted-syntax ImportExpression guard added beside the existing no-restricted-imports fence; comment now documents the dual (static+dynamic) invariant and the 05-03 gate exception
- `src/lib/premium/state/tier.ts` - pure `resolveTier` + browser `detectTier` wrapper
- `src/lib/premium/state/tier.spec.ts` - 4-case heuristic spec (node project)
- `src/lib/premium/state/motion-logic.ts` - pure `computeMotion` truth table
- `src/lib/premium/state/motion-logic.spec.ts` - full 8-row truth-table spec
- `src/lib/premium/state/motion.svelte.ts` - runes motion authority (`initMotion` + `motion` getters)
- `src/lib/premium/state/worldState.ts` - `WORLD_CONFIGS` + `normalizeRoute` + `configFor`, zero SvelteKit imports
- `src/lib/premium/state/worldState.spec.ts` - 7-case normalizer/config spec
- `.planning/phases/05-premium-3d-layer/deferred-items.md` - appended 05-02 confirmation to the pre-existing prettier-drift item

## Decisions Made

- Guard selector taken verbatim from research Pattern 1b (`ImportExpression > Literal[value=/premium/]`) — verified live by probe before commit
- `initMotion` idempotency via a plain module boolean (not listener teardown) — double-init is the realistic hazard on Premium re-entry; unsubscription is unnecessary since the module is app-lifetime
- Kept forbidden literal strings (the aliased premium path, app-runtime module names) out of comments in fenced modules so purity greps stay meaningful

## Deviations from Plan

None - plan executed exactly as written. (Two comment rewordings during Tasks 2/3 were pre-commit iteration: doc comments initially contained the literal aliased-premium-path / app-module strings, tripping the plan's own purity greps; reworded before committing.)

## Issues Encountered

- `pnpm lint` (prettier --check) fails repo-wide on ~77 files at HEAD — **pre-existing** drift, already logged in `deferred-items.md` by 05-01 and independently confirmed here: all 8 files this plan touched pass `prettier --check`, and `pnpm exec eslint .` exits 0 repo-wide. Out of scope per the executor scope boundary; a single `/gsd:quick` format pass is the suggested fix.

## Known Stubs

None — every exported function is fully implemented and spec-covered; no placeholder values or unwired data.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wave 2 (05-03) can now implement against proven contracts: `motion.{animating,parallax,reduced}` for `useTask` running gates, `detectTier()` for Canvas dpr, `normalizeRoute`/`configFor` for the route→world runes wrapper
- The single sanctioned fence crossing in `src/routes/+layout.svelte` must carry `eslint-disable-next-line no-restricted-syntax` (documented in the eslint.config.js comment)

## Self-Check: PASSED

All 7 created files + SUMMARY exist on disk; all 5 task commits (372b1ca, 941fbfa, 099ea9f, e8fcac7, be411d0) present in git log.

---
*Phase: 05-premium-3d-layer*
*Completed: 2026-07-06*
