---
phase: 06-verification-polish
plan: 03
subsystem: testing
tags: [playwright, e2e, github-actions, ci, webgl, accessibility, threlte]

# Dependency graph
requires:
  - phase: 06-verification-polish (06-02)
    provides: "12 @ci-tagged axe scans (5 routes x 2 modes + 2 post-toggle), QA-01 both-modes gate"
  - phase: 05-premium-3d-layer (05-04)
    provides: "scripts/check-premium-budget.mjs SIG regex + byte-level zero-WebGL build gate"
provides:
  - "QA-02: network-level Playwright test proving Accessible mode downloads zero WebGL JS across all 5 routes, and the premium chunk arrives only on toggle"
  - "@ci E2E subset grown to 14 tests (12 axe + QA-02 + mode-toggle smoke)"
  - "deploy.yml blocking gate chain: three-pin -> contrast -> build -> premium-budget -> @ci E2E subset -> upload-pages-artifact (D-08/D-09)"
affects: [milestone-completion, future-deploy-changes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Network-level zero-WebGL proof: capture every .js response body, assert against the budget script's SIG regex (WebGLRenderer|@threlte|THREE.) — same signature set as the byte-level build gate"
    - "Behavioral lazy proof: assert a NEW .js URL is fetched on toggle (never assert hashed chunk names) + that fresh payload matches SIG"
    - "CI E2E gate reuses Playwright's own build+preview webServer with BASE_PATH pinned == repo name, so the build/ uploaded afterwards is byte-identical to the one tested"

key-files:
  created: []
  modified:
    - "tests/premium.e2e.ts — appended QA-02 @ci network-level zero-WebGL test over ROUTES (all 5)"
    - "tests/mode.e2e.ts — tagged the persistence test @ci as the D-08 mode-toggle smoke"
    - ".github/workflows/deploy.yml — Playwright browser cache + chromium install + blocking @ci E2E gate before Pages upload"

key-decisions:
  - "QA-02 network gate mirrors scripts/check-premium-budget.mjs SIG verbatim so the runtime and byte-level gates assert the identical minification-surviving signature set"
  - "chromium-only Playwright install in CI (config defines no projects -> default single-project run is chromium), keeping the cold browser cache small"
  - "E2E gate ordered AFTER premium-budget and BEFORE upload so the byte-level gate still fronts the same build the E2E run starts from; --grep \"@ci\" selects exactly 14 tests (~3-5 min warm), full ~30-min suite stays local"

patterns-established:
  - "Pattern: CI critical-path E2E = a small @ci-tagged subset gating deploy, not the full suite"
  - "Pattern: zero-WebGL is proven at TWO layers — byte-level (build scan) and network-level (Playwright response bodies) — against one shared SIG"

requirements-completed: [QA-02]

# Metrics
duration: 59min
completed: 2026-07-06
---

# Phase 6 Plan 03: Zero-WebGL CI Gate Summary

**QA-02 lands as a network-level Playwright test proving Accessible mode downloads zero WebGL JS across all 5 routes (asserting the budget script's exact SIG), and that test plus the 12 axe scans and a toggle smoke now block the GitHub Pages deploy as a 14-test @ci gate before upload.**

## Performance

- **Duration:** 59 min
- **Started:** 2026-07-06T18:03:53Z
- **Completed:** 2026-07-06T19:03:34Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- QA-02 network-level proof: a new `@ci` test captures every `.js` response body across all 5 routes in Accessible mode and asserts none match `/WebGLRenderer|@threlte|THREE\./` — the runtime counterpart to the byte-level build gate.
- Behavioral lazy proof retained (05-05 decision): toggling premium must fetch at least one `.js` URL the accessible surface never requested, and that fresh payload must itself match SIG — no hashed chunk names asserted.
- D-08 subset fully tagged: `@ci` now selects exactly 14 tests (12 axe from 06-02 + QA-02 + the mode-toggle persistence smoke).
- D-09 un-bypassable deploy gate: `deploy.yml` chain is now three-pin → contrast → build → premium-budget → blocking `@ci` E2E subset → upload-pages-artifact, with a Playwright browser cache and chromium-only install.

## Task Commits

Each task was committed atomically:

1. **Task 1: QA-02 network-level zero-WebGL test (all 5 routes) + tag toggle smoke @ci** - `87803d8` (test)
2. **Task 2: Wire blocking @ci E2E subset into deploy.yml before Pages upload** - `1a0f840` (ci)

**Plan metadata:** (this SUMMARY + STATE/ROADMAP/REQUIREMENTS) - see final docs commit

## Files Created/Modified
- `tests/premium.e2e.ts` - Appended the QA-02 `@ci` test (ROUTES const covering all 5 routes; SIG mirrored from the budget script with a source-naming comment); existing 6 premium tests untouched.
- `tests/mode.e2e.ts` - Tagged the first (persistence/reload) test `@ci` as the D-08 mode-toggle smoke; no other change.
- `.github/workflows/deploy.yml` - Added `Cache Playwright browsers` (`~/.cache/ms-playwright`), `Install Playwright browser (chromium)`, and `Critical E2E gate` (`playwright test --grep "@ci"`) between the premium-budget step and `upload-pages-artifact@v5`.

## Decisions Made
- Mirrored `scripts/check-premium-budget.mjs`'s `SIG = /WebGLRenderer|@threlte|THREE\./` verbatim into the E2E test so the network-level and byte-level zero-WebGL gates assert the same signature set (a naive `three|webgl` grep false-positives on the accessibility statement's own prose — Phase-4 decision).
- Installed chromium only in CI: `playwright.config.ts` defines no `projects`, so the default run is chromium; this keeps the cold cache small.
- Kept the E2E gate after the premium-budget gate and before upload so the byte-level gate still fronts the build the E2E run starts from, and the run's BASE_PATH-pinned rebuild produces a byte-identical `build/` for upload.

## Deviations from Plan
None - plan executed exactly as written. (No code deviations; the only friction was a testing-environment misdiagnosis documented under Issues Encountered.)

## Issues Encountered
- **False "hang" from a cold Playwright webServer + self-inflicted server kill.** The first `playwright test ... | tail -40` run buffered all output until process exit, so no incremental progress was visible. The cold `vite build && vite preview` webServer plus SwiftShader WebGL warm-up made the run slow (~20+ min wall), which was misread as a teardown hang; killing the preview server mid-run then poisoned every test (10/10 failed — no server → no canvas → timeouts). **Resolution:** started a preview server manually (owned locally, `BASE_PATH` guarded against MSYS mangling via `MSYS2_ENV_CONV_EXCL`), let `reuseExistingServer: true` reuse it, and ran Playwright with a direct file redirect (no `tail`) so per-test lines flushed live. Result: premium+mode suites 10/10 in 7.8s; full `@ci` subset 14/14 in 11.6s. Lesson for future waves: always pre-start the preview and never kill the server mid-run.

## Verification Evidence
- `pnpm exec playwright test tests/premium.e2e.ts tests/mode.e2e.ts` → **10 passed (7.8s)**
- `pnpm exec playwright test --grep "@ci" --list` → **Total: 14 tests in 3 files**
- `pnpm exec playwright test --grep "@ci"` → **14 passed (11.6s)**
- `awk` step-order assertion (budget < E2E gate < upload) → **exit 0 (ORDER OK)**
- `grep -c 'playwright test --grep "@ci"' deploy.yml` → 1; `grep -c ms-playwright deploy.yml` → 1
- `pnpm lint` (prettier --check + eslint) → **0** (both after Task 1 and Task 2)
- CI itself is not runnable locally; deploy.yml verified structurally (YAML indent/no-tabs, step ordering, correct `--grep "@ci"` invocation) per the plan's acceptance criteria.

## Next Phase Readiness
- QA-01 (both-modes axe) and QA-02 (network-level zero-WebGL) are now regression-gated in CI before every Pages deploy.
- Remaining Phase 6 work: QA-03 screen-reader (NVDA/VoiceOver) smoke walkthrough is a human task (04/05 plans), and any final polish. No blockers introduced.

## Self-Check: PASSED

- Files: tests/premium.e2e.ts, tests/mode.e2e.ts, .github/workflows/deploy.yml, 06-03-SUMMARY.md — all FOUND
- Commits: 87803d8, 1a0f840 — all FOUND

---
*Phase: 06-verification-polish*
*Completed: 2026-07-06*
