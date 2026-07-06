---
phase: 06-verification-polish
plan: 01
subsystem: testing
tags: [prettier, eslint, playwright, vitest, sveltekit, lint-gate]

# Dependency graph
requires:
  - phase: 05-premium-3d-layer
    provides: deferred-items.md debt inventory (D-11 prettier drift, D-12 demo-route red E2E) and the 93-unit / 28-real-E2E suite this plan re-baselines
provides:
  - Fully green bare `pnpm exec playwright test` baseline (28/28) with no demo route in the repo
  - "`pnpm lint` restored as a standing gate (prettier --check . && eslint . exit 0 at HEAD)"
  - .prettierignore excludes .planning/ so GSD docs never fail the format gate
affects: [06-02-axe-both-modes, 06-03-zero-webgl-ci-gate, 06-04-sr-keyboard-parity, 06-05-nvda-human-uat]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pnpm lint is a standing per-task gate from commit 0f600d4 forward"
    - "Drift-guard specs assert prettier-canonical literals (format gate defines the canonical source form)"

key-files:
  created: []
  modified:
    - .prettierignore
    - src/app.html
    - src/lib/mode/parity.spec.ts
    - src/lib/components/ModeToggle.svelte
    - tests/mode.e2e.ts
  deleted:
    - src/routes/demo/+page.svelte
    - src/routes/demo/playwright/+page.svelte
    - src/routes/demo/playwright/page.svelte.e2e.ts

key-decisions:
  - "parity.spec.ts drift-guard literal updated to the prettier-canonical no-flash expression (parens stripped from '(reduce || !webgl) ?'); semantics unchanged — the format gate now defines the canonical form the guard asserts"
  - "Mechanical format commit includes the parity.spec.ts literal fix so no intermediate commit is red"
  - "Task-3 E2E run used a fresh manual build+preview (BASE_PATH pinned) instead of Playwright's webServer to control the stale-4173 trap; suite reused it via reuseExistingServer"

patterns-established:
  - "Standing lint gate: every later Phase-6 task runs pnpm lint in its verify"
  - "Kill-then-probe port 4173 (IPv6 [::1] listeners included) before any Playwright run"

requirements-completed: [QA-01, QA-02, QA-03]

# Metrics
duration: 16min
completed: 2026-07-06
---

# Phase 6 Plan 01: Polish Debt Summary

**Phase-5 debt cleared: demo scaffold route + its broken base-path E2E deleted, repo prettier drift re-baselined behind a .planning/ ignore, and the bare suite proven green (93/93 unit, 28/28 E2E) as the substrate for all Phase-6 QA gates**

## Performance

- **Duration:** 16 min
- **Started:** 2026-07-06T15:04:37Z
- **Completed:** 2026-07-06T15:20:56Z
- **Tasks:** 3
- **Files modified:** 18 (3 deleted, 15 formatted/edited)

## Accomplishments

- D-12 closed: `src/routes/demo/` tree (sv scaffold leftover) deleted; the only red test in the suite — `page.goto('/demo/playwright')` with no Pages subpath — is gone; typed RouteId union rebuilt clean (`pnpm check` 0 errors)
- D-11 closed: `.planning/` added to `.prettierignore`, one mechanical `pnpm format` pass over 14 drifted files; `pnpm lint` exits 0 at HEAD and is a standing gate again
- Green baseline proven: bare `pnpm exec playwright test` = **28 passed, 0 failed** against a fresh subpath build; `pnpm exec vitest --run` = **93/93**
- The known stale-4173 trap was live and confirmed: an IPv6-only `[::1]` listener (PID 40252) was answering 404s on the port; killed before the run

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete scaffold demo route + broken base-path E2E** - `af87919` (chore)
2. **Task 2: Prettier re-baseline (ignore .planning/, mechanical format)** - `0f600d4` (chore)
3. **Task 3: Prove fully-green bare-suite baseline** - verification-only, no files modified, no commit

## Files Created/Modified

- `src/routes/demo/**` (DELETED) - scaffold route + the 404ing E2E that made the suite 28/29
- `.prettierignore` - `.planning/` added under `# Miscellaneous` (GSD docs excluded from the format gate)
- `src/app.html` - prettier stripped redundant ternary parens in the inline no-flash script (behavior identical)
- `src/lib/mode/parity.spec.ts` - drift-guard literal updated to the prettier-canonical expression
- 11 other files - mechanical prettier output only (CLAUDE.md, .prettierrc, .vscode/extensions.json, ModeToggle.svelte, content/types.ts, various specs, tests/mode.e2e.ts, accessibility route, check-three-pin.mjs)

## Decisions Made

- The format gate defines the canonical source form: rather than prettier-ignoring `app.html` to preserve the old parenthesized literal, the parity drift-guard was updated to assert the prettier-canonical expression `reduce || !webgl ? 'accessible' : 'premium'`
- Task 3 ran build + preview manually (BASE_PATH env, MSYS path-conversion disabled) and let `reuseExistingServer: true` pick up the fresh server — keeps the ~30-min webServer rebuild inside controllable foreground steps

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] parity.spec.ts drift guard broken by the mechanical format pass**

- **Found during:** Task 2 (prettier re-baseline), `pnpm exec vitest --run` step
- **Issue:** prettier rewrote `m = (reduce || !webgl) ? 'accessible' : 'premium'` in `src/app.html` to the paren-free form; the Pitfall-5 drift guard asserts that expression as a literal string, so vitest went 92/93
- **Fix:** updated the spec's expected literal (and test name) to the prettier-canonical form; expression semantics are identical (`||` binds tighter than `?:`)
- **Files modified:** src/lib/mode/parity.spec.ts
- **Verification:** `pnpm exec vitest --run` back to 93/93; `pnpm lint` still exit 0
- **Committed in:** 0f600d4 (folded into the Task-2 commit so no intermediate commit is red)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required for the plan's own "formatting must not change behavior / 93 tests must not decrease" criterion. No scope creep.

## Issues Encountered

- **Stale 4173 listener (predicted trap):** an IPv6-only `[::1]` node process (PID 40252) was serving 404s on port 4173 and invisible to a plain probe-by-default-filters; located via `Get-NetTCPConnection -LocalPort 4173` and force-killed before the E2E run
- **Git Bash MSYS path mangling:** `BASE_PATH=/diversityincludesdisability_two` was converted to a Windows path when spawning the build, failing svelte.config's base validation; fixed with `MSYS2_ENV_CONV_EXCL="BASE_PATH"`
- **`powershell` not on Git Bash PATH:** invoked via the absolute `System32\WindowsPowerShell\v1.0\powershell.exe` path
- Format pass touched 14 files, not ~80 — the bulk of the original 78-file drift inventory was `.planning/**` docs, which the new ignore line excludes rather than formats (intended outcome of deferred-items.md item 1)

## Known Stubs

None — this plan deleted code and reformatted; no data paths or components were introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Waves 2-5 (plans 06-02..06-05) certify against a proven-green substrate: bare `playwright test` 28/28, `vitest --run` 93/93, `pnpm lint` 0, `pnpm check` 0
- `pnpm lint` is a standing gate — every later Phase-6 task must keep it green
- No blockers

---

*Phase: 06-verification-polish*
*Completed: 2026-07-06*

## Self-Check: PASSED

- SUMMARY.md exists on disk
- `src/routes/demo/` absent; `.prettierignore` has exactly one `.planning/` line
- Commits `af87919` and `0f600d4` exist in history
