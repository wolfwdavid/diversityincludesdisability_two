---
phase: 06-verification-polish
plan: 04
subsystem: testing
tags: [playwright, e2e, accessibility, aria-snapshot, aria-live, keyboard, screen-reader, wcag]

# Dependency graph
requires:
  - phase: 06-verification-polish (06-03)
    provides: "frozen 14-test @ci subset + deploy.yml blocking gate; premium.e2e.ts conventions (BASE, canvas settle, dispatchEvent toggle)"
  - phase: 05-premium-3d-layer
    provides: "one shared aria-hidden .premium-backdrop canvas behind the same barrel-sourced DOM"
provides:
  - "QA-03 automated half: keyboard operability proven in BOTH modes (6 tests)"
  - "Cross-mode #main aria-snapshot parity on all 5 routes — machine proof the WebGL canvas is silent to assistive tech (D-03)"
  - "aria-live toggle-announcement gate asserting the verbatim 'Premium/Accessible mode enabled' strings + switch-state flip (D-04 automated half)"
affects: [06-05 (human NVDA/VoiceOver UAT verifies perception, not regressions)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cross-mode aria parity via page.locator('#main').ariaSnapshot() equality (CSS-difference-stable a11y-tree probe)"
    - "Mode reseeding via direct localStorage.setItem between reloads (NOT addInitScript, which re-runs on every navigation and clobbers the second mode)"
    - "Mode dimension added by a describe(`[${mode}]`) loop wrapping existing behavior tests"

key-files:
  created:
    - tests/sr-parity.e2e.ts
  modified:
    - tests/a11y-keyboard.e2e.ts

key-decisions:
  - "Snapshots scoped to #main (not body): the header switch's aria-checked legitimately differs between modes, so a body-scoped snapshot would diverge by design; #main is the mode-invariant content region an SR walks"
  - "Reseed the mode with direct localStorage.setItem between reloads rather than addInitScript (which re-runs on each navigation and would overwrite the second mode's key)"
  - "New tests intentionally NOT tagged @ci — the CI subset stays frozen at 14 (06-03); these are full-suite (local) gates"

patterns-established:
  - "Behavior x mode parameterization: wrap correct single-mode tests in a MODES describe loop, gating premium runs on the live canvas"
  - "aria-live announcement assertion pattern: capture LOCKED default, flip, assert verbatim text + aria-checked, flip back to reach both messages"

requirements-completed: [QA-03]

# Metrics
duration: 13 min
completed: 2026-07-06
---

# Phase 6 Plan 4: SR & Keyboard Parity Summary

**CI-provable screen-reader proxies for QA-03: cross-mode #main aria-snapshot equality on every route (machine proof the WebGL canvas is silent to AT), the verbatim aria-live toggle announcement, and keyboard operability re-proven in both modes.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-07-06T19:12:09Z
- **Completed:** 2026-07-06T19:25:51Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- Parameterized `tests/a11y-keyboard.e2e.ts` over both modes: skip-link focus move, mobile-disclosure Enter/Escape+focus-restore, and switch keyboard toggle are now each proven in Accessible AND Premium (with the live WebGL layer mounted) — 6 tests, all green.
- New `tests/sr-parity.e2e.ts` (6 tests): per-route cross-mode `#main` aria-snapshot equality proves D-03 — an NVDA user in Premium gets the identical accessible tree they get in Accessible because the canvas is silent. Also asserts the `.premium-backdrop` is `aria-hidden`, all four landmarks survive the premium skin, and heading structure is identical across modes.
- aria-live announcement gate (D-04 automated half): asserts the toggle emits `Premium mode enabled` / `Accessible mode enabled` verbatim and flips `aria-checked`, exercising both messages.
- The frozen `@ci` subset stayed at exactly 14 tests (06-03 acceptance held); combined new suite runs 12/12 green; `pnpm lint` green.

## Task Commits

Each task was committed atomically:

1. **Task 1: Parameterize keyboard tests over both modes** - `d6a529c` (test)
2. **Task 2: New cross-mode SR-parity + aria-live announcement gate** - `3846ca7` (test)

**Plan metadata:** _(final docs commit — see below)_

## Files Created/Modified

- `tests/sr-parity.e2e.ts` - NEW; 5 per-route cross-mode aria-snapshot parity tests + 1 aria-live announcement test
- `tests/a11y-keyboard.e2e.ts` - Wrapped the 3 existing keyboard behaviors in a `[accessible]`/`[premium]` describe loop (3 → 6 tests), premium runs gated on the live canvas

## Decisions Made

- **Snapshots scoped to `#main`, not `body`:** the header switch's `aria-checked` legitimately differs between modes, so a body-scoped snapshot would diverge by design. `#main` is the mode-invariant content region an SR actually walks — the correct parity probe.
- **Reseed via direct `localStorage.setItem` between reloads** (not `addInitScript`): `addInitScript` re-runs on every navigation and would overwrite the second mode's key on reload, defeating the two-pass comparison.
- **Not `@ci`-tagged:** the CI subset is frozen at 14 by 06-03; these richer both-modes gates run in the full local suite.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Both new test files passed on first run against the pre-built preview; prettier reflowed one long `test(...)` signature in `sr-parity.e2e.ts` (expected format normalization, applied before commit).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- QA-03's automated half is complete and permanently gated. Only human perception remains: the one-time NVDA/VoiceOver walkthrough (plan 06-05 / 06-HUMAN-UAT.md) now verifies perception, not regressions.
- No blockers introduced. `@ci` subset unchanged at 14; deploy gate unaffected.

## Self-Check: PASSED

- FOUND: tests/sr-parity.e2e.ts
- FOUND: tests/a11y-keyboard.e2e.ts
- FOUND: .planning/phases/06-verification-polish/06-04-SUMMARY.md
- FOUND: commit d6a529c (Task 1)
- FOUND: commit 3846ca7 (Task 2)

---
*Phase: 06-verification-polish*
*Completed: 2026-07-06*
