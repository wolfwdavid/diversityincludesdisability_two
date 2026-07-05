---
phase: 04-accessible-section-components
plan: 06
subsystem: testing
tags: [playwright, axe-core, wcag22aa, e2e, a11y, reflow, keyboard, zero-webgl]

# Dependency graph
requires:
  - phase: 04-01
    provides: "layout chrome — SkipLinks, <nav id=nav aria-label=Primary>, <main id=main tabindex=-1>, ModeToggle; @axe-core/playwright installed"
  - phase: 04-02..04-05
    provides: "the five live routes (/, /services/, /about/, /contact/, /accessibility/) composed from the $lib/content barrel"
  - phase: 03
    provides: "playwright.config.ts base-path preview (BASE_PATH), tests/mode.e2e.ts conventions, mode switch role=switch"
provides:
  - "Automated phase gate proving the Core Value across the whole live site (WCAG 2.2 AA, zero WebGL)"
  - "tests/pages.e2e.ts — 5 routes reachable + nav linkage incl. Accessibility Statement (SECT-06)"
  - "tests/reflow.e2e.ts — no horizontal scroll at 320px on every route (SECT-07/A11Y-07)"
  - "tests/a11y.e2e.ts — @axe-core/playwright WCAG 2.2 AA = 0 violations on all 5 routes (A11Y-02/03)"
  - "tests/a11y-keyboard.e2e.ts — skip-link focus move, disclosure Enter/Escape, keyboard-operable switch (A11Y-01/05)"
  - "Reliable Windows E2E runs via playwright.config reuseExistingServer:true"
affects: [phase-05-premium-3d, phase-06-qa]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "E2E gate as data-driven loops over ROUTES against the base-path preview"
    - "axe WCAG 2.2 AA scan encoded as new AxeBuilder({page}).withTags([...]).analyze() → expect(violations).toEqual([])"
    - "reuseExistingServer:true so a manually-started preview backs the suite (avoids Windows SIGTERM teardown hang)"

key-files:
  created:
    - tests/pages.e2e.ts
    - tests/reflow.e2e.ts
    - tests/a11y.e2e.ts
    - tests/a11y-keyboard.e2e.ts
  modified:
    - playwright.config.ts

key-decisions:
  - "A11Y-08 zero-WebGL verified with a precise runtime-signature scan (WebGLRenderer|@threlte|'three'|THREE.) — the plan's naive grep 'three|threlte|webgl' false-positives on the accessibility statement's own prose ('ships zero WebGL')"
  - "Added reuseExistingServer:true to playwright.config so the suite reuses a running preview and can't hang on Windows webServer teardown"

patterns-established:
  - "Every route-level gate iterates the canonical ROUTES array with base-path + trailing-slash URLs (mirrors tests/mode.e2e.ts)"
  - "Keyboard proofs assert document.activeElement / aria-expanded / :focus rather than visual-only state"

requirements-completed: [SECT-06, SECT-07, A11Y-01, A11Y-02, A11Y-03, A11Y-05, A11Y-07, A11Y-08]

# Metrics
duration: 31min
completed: 2026-07-05
---

# Phase 4 Plan 06: A11y & Responsive Verification Summary

**Four Playwright E2E specs that turn the Core Value into an automated phase gate: all five routes load with a single h1 and are nav-reachable, axe reports 0 WCAG 2.2 AA violations everywhere, every route reflows to one column at 320px, the keyboard walkthrough (skip link → #main, disclosure Enter/Escape, switch) works, and the accessible build ships zero WebGL runtime.**

## Performance

- **Duration:** 31 min
- **Started:** 2026-07-05T10:03:00Z
- **Completed:** 2026-07-05T10:33:45Z
- **Tasks:** 3
- **Files modified:** 5 (4 created, 1 modified)

## Accomplishments
- **SECT-06 / SECT-07:** `pages.e2e.ts` (6 tests) proves all 5 routes load `<400` with exactly one `<h1>` and the primary nav links to all five incl. the Accessibility Statement; `reflow.e2e.ts` (5 tests) proves no `scrollWidth > clientWidth` at 320px on every route.
- **A11Y-02 / A11Y-03:** `a11y.e2e.ts` (5 tests) runs `@axe-core/playwright` with the full WCAG 2.2 AA tag set → **0 violations** on `/`, `/services/`, `/about/`, `/contact/`, `/accessibility/` (covers `page-has-heading-one`, `heading-order`, `link-name`, contrast).
- **A11Y-01 / A11Y-05:** `a11y-keyboard.e2e.ts` (3 tests) proves the first Tab lands on a visible `.skip-link`, Enter moves `document.activeElement` to `#main`, the mobile disclosure opens on Enter and Escape closes it + restores focus to the toggle, and the mode switch is keyboard-focusable and flips via Space.
- **A11Y-08:** `eslint` clean (no `$lib/premium` import) **and** the built `build/_app/immutable/` contains no `three`/`@threlte`/`WebGLRenderer`/`THREE.` runtime code — zero WebGL shipped.
- **Whole-suite health:** `pnpm check` 0 errors / 0 warnings; `vitest run` 74/74; the four plan-owned E2E specs 19/19 GREEN (mode.e2e.ts also 3/3).

## Task Commits

Each task was committed atomically:

1. **Task 1: pages.e2e.ts (reachability) + reflow.e2e.ts (320px)** - `f7495ad` (test)
2. **Task 2: a11y.e2e.ts (axe WCAG 2.2 AA on all 5 routes)** - `1cc3b59` (test)
3. **Task 3: a11y-keyboard.e2e.ts (skip link + keyboard) + reuseExistingServer + zero-WebGL** - `e6349da` (test)

**Plan metadata:** _(final docs commit)_

## Files Created/Modified
- `tests/pages.e2e.ts` - 5-route reachability + single-h1 + primary-nav linkage (SECT-06)
- `tests/reflow.e2e.ts` - 320px single-column / no horizontal scroll on every route (SECT-07/A11Y-07)
- `tests/a11y.e2e.ts` - `@axe-core/playwright` WCAG 2.2 AA = 0 violations on all 5 routes (A11Y-02/03)
- `tests/a11y-keyboard.e2e.ts` - skip-link focus move, disclosure Enter/Escape+focus-restore, switch keyboard-operability (A11Y-01/05)
- `playwright.config.ts` - added `reuseExistingServer: true` for reliable local/Windows runs

## Decisions Made
- **Zero-WebGL assertion refined (from the plan's grep):** the plan's `grep -rli 'three|threlte|webgl' build/_app/immutable/` returns a false positive because the Accessibility Statement page literally renders the words "zero WebGL" in its copy. The true A11Y-08 requirement is no WebGL *runtime*, so verification used a precise signature scan `grep -rlE 'WebGLRenderer|@threlte|["'\'']three["'\'']|THREE\.'` → nothing found. The only case-insensitive hit in the whole build is the prose string.
- **`reuseExistingServer: true`:** lets a manually-started `pnpm run preview` back the suite and prevents the observed Windows `pnpm run build && pnpm run preview` webServer teardown from hanging the run; when no server is up, Playwright still builds+previews (CI unaffected).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Made the E2E webServer reliable on Windows via reuseExistingServer**
- **Found during:** Task 3 (running a11y + keyboard specs)
- **Issue:** Playwright refused to run against a preview already on port 4173 (`http://localhost:4173 is already used`), and its own `build && preview` webServer hung on SIGTERM teardown on Windows (Task 1 only completed after orphaned preview processes were killed, though it still exited 0 with correct results).
- **Fix:** Added `reuseExistingServer: true` to `playwright.config.ts` `webServer`, so the suite reuses a running preview (fast, streamed output, no teardown hang) and still self-starts one when none is up.
- **Files modified:** `playwright.config.ts`
- **Verification:** Full E2E suite ran green against the reused preview; a11y+keyboard 8/8, full plan-owned set 19/19.
- **Committed in:** `e6349da` (Task 3 commit)

**2. [Rule 1 - Verification correctness] Replaced the plan's naive zero-WebGL grep with a runtime-signature scan**
- **Found during:** Task 3 (A11Y-08 build assertion)
- **Issue:** The plan's `grep -rli 'three|threlte|webgl'` flags `build/_app/immutable/nodes/4.*.js` — but the sole match is the Accessibility Statement's own prose ("ships **zero WebGL**"), not runtime code. As written the gate would fail on legitimate content.
- **Fix:** Used `grep -rlE 'WebGLRenderer|@threlte|["'\'']three["'\'']|THREE\.'` (real three/threlte runtime signatures) → zero matches, confirming no WebGL runtime ships. No code change to app files; the accessible build genuinely imports no `three`.
- **Files modified:** none (verification method only)
- **Verification:** precise scan returns nothing; `eslint` clean.
- **Committed in:** n/a (assertion refinement, documented here)

---

**Total deviations:** 2 (1 blocking infra fix, 1 verification-correctness refinement)
**Impact on plan:** Both make the phase gate correct and reliable; no scope creep. All eight target requirements are proven by automated tests.

## Issues Encountered
- **Windows webServer teardown hang / port contention:** stale `vite preview` processes on 4173 from prior runs blocked new runs and Playwright's own webServer buffered output until exit, appearing to hang. Resolved by clearing orphaned listeners and adopting `reuseExistingServer: true` + a manually managed preview for streamed, fast runs.
- **MSYS path mangling:** in Git Bash, `BASE_PATH=/diversityincludesdisability_two` was rewritten to a Windows path, breaking the manual build (`paths.base must … start … with '/'`). Fixed by exporting `MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*'` for the manual build/preview (Playwright's own webServer passes env via Node, so it was never affected).

## Known Stubs
None — this plan authors verification only; no application stubs were introduced.

## Deferred Issues (out of scope)
- **Pre-existing scaffold E2E `src/routes/demo/playwright/page.svelte.e2e.ts` fails under the base-path preview** (navigates to base-less `/demo/playwright`, no `<h1>`). Leftover `sv create` boilerplate, unrelated to this plan; logged to `deferred-items.md`. The four plan-owned specs are GREEN (19/19); a bare `pnpm exec playwright test` therefore reports 22 passed / 1 failed. Suggested: delete the `demo/` scaffold route+test as a `/gsd:quick` cleanup or in Phase 6 QA.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The Core Value is now automatically enforced: a complete, live, WCAG 2.2 AA accessible site with zero WebGL. This is the Phase 4 gate.
- Phase 5 (Premium 3D) can build against these gates; Phase 6 QA will add the manual screen-reader walkthrough (QA-03) and the Premium-mode axe pass (QA-01) plus the network-level zero-WebGL assertion (QA-02).
- Recommend clearing the `demo/` scaffold before the full suite is used as a CI gate.

## Self-Check: PASSED

All four created specs + `playwright.config.ts` + this SUMMARY exist on disk; all three task commits (`f7495ad`, `1cc3b59`, `e6349da`) are present in git history.

---
*Phase: 04-accessible-section-components*
*Completed: 2026-07-05*
