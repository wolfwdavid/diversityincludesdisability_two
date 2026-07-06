---
phase: 06-verification-polish
plan: 02
subsystem: testing
tags: [axe, playwright, a11y, wcag22aa, premium, accessible, contrast]

# Dependency graph
requires:
  - phase: 05-premium-3d-layer
    provides: "Premium dark skin + rgb(7 28 51 / 0.94) scrims, all 12 contrast pairs machine-gated; one shared .premium-backdrop canvas"
  - phase: 06-verification-polish (06-01)
    provides: "prettier re-baseline (pnpm lint standing green gate) + demo-route deletion (bare playwright run green)"
provides:
  - "QA-01 gate: 12-scan axe matrix (5 routes x 2 modes + 2 post-toggle) proving strict-0 WCAG 2.2 AA violations of any severity in BOTH modes"
  - "@ci-tagged axe test titles ready for the D-08 CI subset (plan 06-03)"
affects: [06-03-zero-webgl-ci-gate, 06-04-sr-keyboard-parity]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "axe both-modes matrix: outer mode loop x inner route loop, mode seeded via addInitScript(fn, arg) writing did2:mode before any document script"
    - "Mode-settle guards before every scan: premium waits on .premium-backdrop canvas visible; accessible asserts zero canvas (A11Y-08)"
    - "Post-toggle race scans (D-07): dispatchEvent('click') the switch, wait the settle signal, scan the same frame — no extra settle"

key-files:
  created: []
  modified:
    - tests/a11y.e2e.ts

key-decisions:
  - "Task 2 required 0 fixes: the Phase-5 contrast-gated scrims held Premium to strict-0 axe — no token/scrim/markup change (D-06 satisfied with nothing to defer)"
  - "addInitScript(fn, mode) passes the mode as a serialized arg so one loop body seeds both modes without per-mode init scripts"

patterns-established:
  - "Both-modes axe gate: parameterize a single test file over ['accessible','premium'] x ROUTES, each scan preceded by its mode-specific settle guard"

requirements-completed: [QA-01]

# Metrics
duration: 25min
completed: 2026-07-06
---

# Phase 6 Plan 02: axe Both Modes Summary

**QA-01 raised-bar gate: a 12-scan @ci-tagged axe matrix proves strict-0 WCAG 2.2 AA violations of any severity across all 5 routes in both Premium and Accessible mode plus 2 post-toggle scans — 0 in-phase fixes needed.**

## Performance

- **Duration:** ~25 min active (wall-clock spanned session resets)
- **Started:** 2026-07-06T15:26:53Z
- **Completed:** 2026-07-06T17:55:59Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Converted the Accessible-only 5-route axe gate into the QA-01 both-modes matrix: `for (mode of ['accessible','premium']) for (route of ROUTES)` → 10 steady-state scans.
- Added the 2 D-07 post-toggle scans on `/` (toggle INTO premium; toggle INTO accessible), each scanning the frame the mode-settle signal fires in — catching skin/scrim application races.
- Every one of the 12 test titles carries `@ci` so plan 06-03's D-08 CI subset can select the QA-01 gate by tag.
- Ran the full gate green: **12 passed, 0 failed** — Premium mode met the same strict-0 bar as Accessible with no token/scrim/markup change (D-05/D-06).
- Confirmed the machine-contrast authority stayed intact: `check-contrast.mjs` all 12 pairs PASS; `pnpm lint` and `pnpm check` (0 errors / 0 warnings) green.

## Task Commits

1. **Task 1: Parameterize a11y.e2e.ts over both modes + 2 post-toggle scans** - `29dbed2` (test)
2. **Task 2: Run the 12-scan gate; fix Premium violations in-phase** - no commit (0 fixes needed; gate passed 12/12 with the file already committed in Task 1)

**Plan metadata:** see final docs commit.

## Files Created/Modified

- `tests/a11y.e2e.ts` - Rewritten into the 12-test QA-01 matrix: 10 steady-state (5 routes x 2 modes, each with a mode-specific settle guard) + 2 post-toggle race scans, all `@ci`-tagged, `withTags(WCAG_22_AA)` rule set unchanged.

## Decisions Made

- **0 fixes needed in Task 2.** The Premium dark skin and `rgb(7 28 51 / 0.94)` scrims were contrast-gated in Phase 5 precisely so Premium could meet the Accessible bar; the 12-scan run confirmed that design held — no `--color-scrim` bump, no token hex change, no markup fix. D-06's "no triage-and-defer" is satisfied vacuously (nothing to fix).
- **Mode seeding via `addInitScript(fn, mode)`** — the serialized-argument form lets one loop body seed either mode before any document script runs, reusing the `premium.e2e.ts` `did2:mode` pattern verbatim.

## Deviations from Plan

None - plan executed exactly as written. Task 1 delivered the 12-scan matrix; Task 2's run passed 12/12 on the first execution, so the conditional token/scrim/markup fix surfaces (tokens.css, pairs.ts, app.css) were never touched.

## Issues Encountered

- The Playwright preview server had a habit of leaving a stale IPv6-only (`::1`) listener on port 4173 that poisons re-runs (the known Phase-6 trap). Resolved by killing the owning node PID before the run and confirming port 4173 clear. The suite then completed 12/12.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- QA-01 is now a green automated gate. The 12 `@ci`-tagged titles are the exact selection surface plan 06-03 (D-08) will wire into `deploy.yml` as a blocking pre-upload CI subset.
- No blockers. `check-contrast.mjs`, `pnpm lint`, `pnpm check` all green; the both-modes axe matrix is the authority for cross-mode WCAG 2.2 AA regression protection.

## Self-Check: PASSED

- FOUND: tests/a11y.e2e.ts
- FOUND: .planning/phases/06-verification-polish/06-02-SUMMARY.md
- FOUND commit: 29dbed2 (test(06-02) — axe both-modes matrix)

---
*Phase: 06-verification-polish*
*Completed: 2026-07-06*
