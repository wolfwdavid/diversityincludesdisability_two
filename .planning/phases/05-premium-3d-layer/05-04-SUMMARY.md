---
phase: 05-premium-3d-layer
plan: 04
subsystem: infra
tags: [ci, budget, code-split, gzip, webgl, github-actions, node-esm]

# Dependency graph
requires:
  - phase: 05-premium-3d-layer plan 03
    provides: single dynamic-import gate in +layout.svelte; premium graph emitted as a separate lazy chunk
  - phase: 04-accessible-sections plan 06
    provides: A11Y-08 zero-WebGL signature set (WebGLRenderer|@threlte|THREE.) proven manually
provides:
  - scripts/check-premium-budget.mjs — committed graph-partition gate (zero-WebGL accessible closure + non-empty premium graph + 500 KB gzip ceiling)
  - package.json check:premium-budget script entry
  - deploy.yml budget step between Build and upload-pages-artifact (regressions cannot deploy)
affects: [05-05, 06-qa, deploy, performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Build-artifact gates as plain node ESM scripts (fs+path+zlib only, no deps) mirroring check-contrast/check-three-pin house style"
    - "Static-import closure walk that treats dynamic import() as an intentional graph boundary"

key-files:
  created:
    - scripts/check-premium-budget.mjs
  modified:
    - package.json
    - .github/workflows/deploy.yml

key-decisions:
  - "Premium set expansion excludes accessible-closure members, so shared Svelte runtime chunks are never double-counted against the 500 KB budget"
  - "All three failure paths (WebGL leak, scan rot, budget overflow) were exercised against a mutated build copy before committing — the gate is proven to fail, not just to pass"

patterns-established:
  - "Graph partition: ROOTS = entry/+nodes/, accessible closure via STATIC_IMPORT regex BFS, premium = SIG matches outside closure + their closure minus closure"

requirements-completed: [PREM-03]

# Metrics
duration: 10min
completed: 2026-07-06
---

# Phase 5 Plan 04: Budget Gate CI Summary

**Committed CI gate proves the accessible chunk graph is WebGL-free and caps the lazy premium graph at 500 KB gzip — measured reality: 32 accessible files clean, premium graph = 1 chunk at 187,713 bytes gzip**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-06T11:21:48Z
- **Completed:** 2026-07-06T11:31:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `scripts/check-premium-budget.mjs` (node:fs/path/zlib only): BFS static-import closure from `build/_app/immutable/{entry,nodes}` that never follows dynamic `import()` (the premium boundary), asserts zero `WebGLRenderer|@threlte|THREE.` signatures in the accessible closure — the Phase-4 A11Y-08 scan is now a committed script, not a manual grep
- Premium graph derived as signature-matching chunks outside the closure, expanded by their own static closure minus accessible members; non-empty assertion guards against scan rot ("premium graph not found — did the entry gate change?")
- 500 KB gzip ceiling (D-07) with per-file raw/gzip table; real numbers: single premium chunk `kwbovLsO.js`, 719,882 raw / 187,713 gzip — squarely inside the researched 150–300 KB expectation, confirming no accidental `@threlte/extras` barrel pull-in (Open Question 2 answered by measurement)
- All three failure paths verified against a mutated build copy: SIG injected into a node → FAIL with offending file listed; premium chunk deleted → scan-rot FAIL; chunk inflated with 400 KB incompressible data → budget FAIL "over by 121629"
- `deploy.yml` gains exactly one step after Build and before `upload-pages-artifact@v5`; step order three-pin → contrast → Build → premium-budget → upload confirmed by awk; a WebGL leak or budget breach can never reach GitHub Pages

## Task Commits

Each task was committed atomically:

1. **Task 1: check-premium-budget.mjs — graph partition, zero-WebGL closure, gzip budget** - `9e30c89` (feat)
2. **Task 2: Wire the gate into CI (deploy.yml)** - `9b3dd6a` (ci)

## Files Created/Modified

- `scripts/check-premium-budget.mjs` - Graph-partition gate: accessible-closure zero-WebGL assertion, premium non-empty guard, 500_000-byte gzip budget with per-file table
- `package.json` - `check:premium-budget` script entry
- `.github/workflows/deploy.yml` - "Premium chunk budget + zero-WebGL gate (PREM-03, D-07)" step between Build and artifact upload

## Decisions Made

- Premium-set closure expansion excludes accessible-closure members (`closureOf(seeds, accessible)`), so shared runtime chunks the visitor already downloads are never double-counted against the budget
- Failure paths were proven by mutation testing on a build copy (leak / rot / overflow) rather than trusting the happy path — a gate that has never failed is unverified

## Deviations from Plan

None - plan executed exactly as written.

Note on Task 2's `pnpm lint` acceptance criterion: full-repo `pnpm lint` fails on the 79-file pre-existing prettier drift logged in `deferred-items.md` (out of scope per plan context). The criterion's intent — prettier validating the yml — was verified directly: `prettier --check .github/workflows/deploy.yml` passes, `prettier --check` passes on all three touched files, and repo-wide `eslint .` exits 0.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PREM-03 and D-07 are permanent deploy gates; 05-05 (and any future premium work) can grow the scene knowing the budget script measures every push, with 312 KB of gzip headroom remaining
- Ready for 05-05 (final Phase 5 plan)

## Self-Check: PASSED

- scripts/check-premium-budget.mjs — FOUND
- .github/workflows/deploy.yml gate step — FOUND
- Commit 9e30c89 — FOUND
- Commit 9b3dd6a — FOUND

---

*Phase: 05-premium-3d-layer*
*Completed: 2026-07-06*
