---
phase: 03-mode-state-system-toggle
plan: 01
subsystem: infra
tags: [mode-toggle, localStorage, webgl-detection, vitest, playwright, pnpm, precedence]

# Dependency graph
requires:
  - phase: 02-content-source-of-truth
    provides: house spec style (vitest describe/it/expect), readonly `as const` typing conventions
provides:
  - "resolveMode(signals): pure precedence source of truth (stored > reduced-motion > no-WebGL > premium)"
  - "constants.ts shared surface: STORAGE_KEY='did2:mode', DATA_ATTR='data-mode', MODES tuple, Mode type"
  - "hasWebGL() browser capability probe (safe-fails to false)"
  - "pnpm-consistent test/e2e tooling; playwright preview pinned to prod BASE_PATH subpath"
affects: [03-02 runes store, 03-03 inline no-flash script + toggle E2E, all Phase 3+ mode consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure signals-in/mode-out resolver isolates precedence for sub-second node unit tests"
    - "Single shared constants module is the sole source for the namespaced storage key + data attr"
    - "playwright webServer.env pins BASE_PATH so local preview mirrors the GH Pages subpath"

key-files:
  created:
    - src/lib/mode/constants.ts
    - src/lib/mode/resolve.ts
    - src/lib/mode/resolve.spec.ts
  modified:
    - package.json
    - playwright.config.ts

key-decisions:
  - "LOCKED default: capable + no-preference + no-stored visitor resolves to 'premium' (Open Q#1)"
  - "Storage key namespaced as 'did2:mode' to avoid cross-repo collision on the shared *.github.io origin"
  - "resolveMode kept DOM-free/pure; hasWebGL() split out as the only browser-touching function (tested in Plan 02)"

patterns-established:
  - "Precedence-as-truth-table: table-driven vitest spec pins each rung of the mode ladder"
  - "Tooling routed exclusively through pnpm; no bare `npm run` in scripts or config"

requirements-completed: [MODE-02, MODE-03, MODE-07]

# Metrics
duration: 4min
completed: 2026-07-05
---

# Phase 3 Plan 1: Mode Precedence Source of Truth Summary

**Pure, unit-tested `resolveMode()` encoding the locked precedence (stored > reduced-motion > no-WebGL > premium) plus the shared `did2:mode` constants surface, a `hasWebGL()` probe, and pnpm/BASE_PATH tooling fixes.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-05T02:31:47Z
- **Completed:** 2026-07-05T02:35:35Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments
- Locked the whole mode system's precedence in one pure, provable function with a 6-row truth-table spec (7/7 GREEN in the fast node project).
- Established `src/lib/mode/constants.ts` as the single shared surface for the namespaced `did2:mode` storage key and `data-mode` attribute that the store and inline script will reuse.
- Added `hasWebGL()` as the sole browser-touching probe, kept out of the node spec (exercised browser-side in Plan 02) and safe-failing to `false`.
- Routed test + e2e tooling through pnpm and pinned the Playwright preview server to `BASE_PATH=/diversityincludesdisability_two` so local E2E resolves the production subpath instead of 404ing at root.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix pnpm/npm tooling drift in test + e2e commands** - `f6166fd` (chore)
2. **Task 2 (RED): failing precedence truth-table spec** - `c138b48` (test)
3. **Task 2 (GREEN): constants + pure resolveMode + hasWebGL** - `9639724` (feat)

_TDD task 2 produced test → feat commits; no refactor commit needed (implementation clean on first pass)._

## Files Created/Modified
- `src/lib/mode/constants.ts` - Shared constants surface: `STORAGE_KEY='did2:mode'`, `DATA_ATTR`, `MODES` tuple, `Mode` type
- `src/lib/mode/resolve.ts` - Pure `resolveMode(signals)` precedence function + `hasWebGL()` browser probe; re-exports `STORAGE_KEY`/`Mode`
- `src/lib/mode/resolve.spec.ts` - 6-row precedence truth table + STORAGE_KEY assertion (server/node project)
- `package.json` - `test` script now uses `pnpm run` (was bare `npm run`)
- `playwright.config.ts` - webServer runs `pnpm run build && pnpm run preview`; `env.BASE_PATH` pins the prod subpath

## Decisions Made
- **LOCKED default = premium** for a capable, no-preference, no-stored visitor (Open Q#1 resolved); guarded by an explicit truth-table row.
- **Namespaced key `did2:mode`** rather than a bare `mode` key, because GitHub Pages serves sibling repos from a shared origin (Pitfall 3).
- **`resolveMode` kept pure** (no DOM/globals); `hasWebGL()` split out so the precedence logic stays unit-testable in the node project while the browser probe is validated in Plan 02.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- A `[WARN] The "pnpm" field in package.json is no longer read by pnpm ... pnpm.overrides ignored` message appears on pnpm invocations. This is **pre-existing** (documented in STATE.md: the effective `three@0.175.0` override lives in `pnpm-workspace.yaml`) and out of scope for this plan — not touched.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `resolveMode` + `constants.ts` are ready to be imported by the Plan 02 runes store and the Plan 03 inline no-flash head script.
- `hasWebGL()` is ready for its browser-side test in Plan 02.
- Playwright tooling is now consistent (pnpm) and subpath-correct for the Plan 03 E2E.

---
*Phase: 03-mode-state-system-toggle*
*Completed: 2026-07-05*

## Self-Check: PASSED

All created/modified files present on disk and all task commits (f6166fd, c138b48, 9639724) verified in git history.
