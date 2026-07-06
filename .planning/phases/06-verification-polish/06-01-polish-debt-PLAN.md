---
phase: 06-verification-polish
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/routes/demo/+page.svelte (DELETED)
  - src/routes/demo/playwright/+page.svelte (DELETED)
  - src/routes/demo/playwright/page.svelte.e2e.ts (DELETED)
  - .prettierignore
  - 'repo-wide mechanical prettier pass (~80 drifted files, incl. CLAUDE.md, src/app.html, src/lib/components/ModeToggle.svelte, tests/mode.e2e.ts, several *.spec.ts)'
autonomous: true
requirements: [QA-01, QA-02, QA-03]
must_haves:
  truths:
    - "A bare `pnpm exec playwright test` run is fully green — no pre-existing demo-route failure taints any QA gate"
    - "`pnpm lint` (prettier --check . && eslint .) exits 0 at HEAD and is a standing gate again"
    - "No route or test referencing /demo/playwright exists anywhere in src/ or tests/"
  artifacts:
    - path: ".prettierignore"
      provides: ".planning/ exclusion so GSD docs never fail the format gate"
      contains: ".planning/"
  key_links:
    - from: ".prettierignore"
      to: "pnpm lint"
      via: "prettier --check . honoring the ignore file"
      pattern: "\\.planning/"
---

<objective>
Clear the two logged Phase-5 debt items (CONTEXT D-11, D-12) so the verification gates built in plans 06-02..06-05 certify against a green baseline: delete the SvelteKit scaffold demo route and its broken base-path E2E, re-baseline repo-wide prettier drift, and prove the full bare test suite is green.

Purpose: QA-01/QA-02/QA-03 are all "the suite passes" claims — they cannot be certified while a known-red test (src/routes/demo/playwright) sits in the Playwright glob and `pnpm lint` fails on ~80 pre-existing drifted files. This plan is the enabler for all three requirement IDs; the gates themselves land in later plans.

Output: deleted src/routes/demo/ tree, .planning/ prettier-ignored, one mechanical format commit, and a proven-green `vitest` + `playwright` baseline.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-verification-polish/06-CONTEXT.md
@.planning/phases/05-premium-3d-layer/deferred-items.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Delete the scaffold demo route tree and its broken base-path E2E (D-12)</name>
  <files>src/routes/demo/+page.svelte, src/routes/demo/playwright/+page.svelte, src/routes/demo/playwright/page.svelte.e2e.ts</files>
  <read_first>
    - src/routes/demo/+page.svelte (contains `resolve('/demo/playwright')` — typed RouteId link; leaving this file after deleting the child route breaks `pnpm check`)
    - src/routes/demo/playwright/page.svelte.e2e.ts (the broken test: `page.goto('/demo/playwright')` has no BASE URL and no subpath, so it 404s against the preview served under /diversityincludesdisability_two — this is the Phase-4/5 logged 28/29 failure)
    - playwright.config.ts (testMatch `**/*.e2e.{ts,js}` — this glob is WHY a file inside src/routes is picked up as an E2E test)
  </read_first>
  <action>
    Delete the ENTIRE `src/routes/demo/` directory — all three files. D-12 names `src/routes/demo/playwright`, but the parent `src/routes/demo/+page.svelte` exists only to link to it via typed `resolve('/demo/playwright')`; once the child route is gone, SvelteKit's regenerated RouteId union no longer contains '/demo/playwright' and the parent fails `pnpm check`. Both are `sv` scaffold leftovers with zero references from real site code (verified: the only 'demo/playwright' matches in the repo are inside these files themselves).

    Steps:
    1. `rm -rf src/routes/demo`
    2. `pnpm check` — svelte-kit sync regenerates route types; expect exit 0 with no dangling-RouteId error.
    3. `pnpm exec eslint .` — expect exit 0 (no orphaned-import fallout).

    Do NOT touch playwright.config.ts's testMatch glob — after deletion every `*.e2e.ts` lives under tests/ and the glob is correct as-is.
  </action>
  <verify>
    <automated>pnpm check && pnpm exec eslint . && bash -c '! ls src/routes/demo 2>/dev/null && ! grep -rn "demo/playwright" src tests'</automated>
  </verify>
  <acceptance_criteria>
    - `ls src/routes/demo` fails (directory absent)
    - `grep -rn "demo/playwright" src tests` returns 0 matches
    - `pnpm check` exits 0 (typed resolve() union rebuilt without the route)
    - `pnpm exec eslint .` exits 0
  </acceptance_criteria>
  <done>src/routes/demo/ no longer exists, no reference to it survives in src/ or tests/, and type + lint checks are green.</done>
</task>

<task type="auto">
  <name>Task 2: Prettier re-baseline — ignore .planning/, one mechanical format commit, lint gate restored (D-11)</name>
  <files>.prettierignore, ~80 drifted files repo-wide (mechanical `pnpm format` output only)</files>
  <read_first>
    - .prettierignore (current content: lockfile ignores + `/static/` under "# Miscellaneous" — the new entry goes in this section)
    - .planning/phases/05-premium-3d-layer/deferred-items.md (item 1: the drift inventory and the exact suggested fix this task implements)
    - package.json (scripts: `lint` = `prettier --check . && eslint .`, `format` = `prettier --write .` — use these, never bare npx/npm)
  </read_first>
  <action>
    Implement deferred-items.md item 1 exactly, IN THIS ORDER (order matters — formatting before ignoring would rewrite every GSD planning doc):

    1. Edit `.prettierignore`: under the existing `# Miscellaneous` section, add a line containing exactly:
       ```
       .planning/
       ```
       (planning docs are not shipped code; GSD writes them unformatted by design).
    2. Run `pnpm format` (prettier --write .). This is a MECHANICAL pass — do not hand-edit any file it touches, do not "improve" anything while in there. Expect roughly 80 files rewritten (prettier@3.x + prettier-plugin-svelte@4.x drift: multi-attribute .svelte wrapping, markdown tables in CLAUDE.md, src/app.html, ModeToggle.svelte, tests/mode.e2e.ts, assorted *.spec.ts).
    3. Run `pnpm lint` — must exit 0 (prettier --check . clean AND eslint . clean).
    4. Run `pnpm check` and `pnpm exec vitest --run` — formatting must not have changed behavior (expect 93/93 unit tests, same as the Phase-5 verification baseline).
    5. Commit everything (the .prettierignore edit + all formatted files) as ONE commit: `chore(06-01): prettier re-baseline — ignore .planning/, mechanical repo format`.

    From this commit forward, `pnpm lint` is a standing gate: every later Phase-6 task runs it in its verify.
  </action>
  <verify>
    <automated>pnpm lint && pnpm check && pnpm exec vitest --run</automated>
  </verify>
  <acceptance_criteria>
    - `grep -n "^\.planning/" .prettierignore` matches exactly one line
    - `pnpm lint` exits 0 (both prettier --check . and eslint .)
    - `pnpm exec vitest --run` reports all tests passing (93 passed expected; count must not DECREASE)
    - `git log -1 --stat` shows a single mechanical commit touching .prettierignore plus the formatted files
  </acceptance_criteria>
  <done>`pnpm lint` exits 0 at HEAD; .planning/ is permanently excluded from the format gate; one mechanical commit holds the entire re-baseline.</done>
</task>

<task type="auto">
  <name>Task 3: Prove the fully-green bare-suite baseline (kill stale 4173 first)</name>
  <files>none modified — verification-only task</files>
  <read_first>
    - playwright.config.ts (reuseExistingServer: true — the KNOWN TRAP: a stale preview on 4173, even one bound IPv6-only to [::1], gets silently reused and poisons the run with an old build)
    - tests/ directory listing (post-Task-1 the suite is exactly: mode.e2e.ts (3), pages.e2e.ts (6), reflow.e2e.ts (5), a11y.e2e.ts (5), a11y-keyboard.e2e.ts (3), premium.e2e.ts (6) = 28 tests)
  </read_first>
  <action>
    Establish the green baseline every later gate extends:

    1. Kill any stale preview server on port 4173 (Windows dev box):
       ```
       powershell -Command "Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
       ```
    2. Run the full E2E suite single-shot: `pnpm exec playwright test`
       (Playwright's webServer runs `pnpm run build && pnpm run preview` with BASE_PATH pinned to /diversityincludesdisability_two).
    3. Expect exactly 28 passed, 0 failed — the historical 29th (demo/playwright) was deleted in Task 1.

    If ANY test fails: this is a regression surfaced by the format pass or deletion — fix it in this task (root cause, not skip) before marking done. Do not proceed to Wave 2 on a red baseline.
  </action>
  <verify>
    <automated>powershell -Command "Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" ; pnpm exec playwright test</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm exec playwright test` output contains "28 passed" and zero "failed"
    - No test file outside tests/ appears in the run report
  </acceptance_criteria>
  <done>A bare `pnpm exec playwright test` at HEAD is 28/28 green — the substrate all three QA gates certify against.</done>
</task>

</tasks>

<verification>
- `pnpm lint` exit 0 (standing gate restored)
- `pnpm check` exit 0, `pnpm exec vitest --run` all green
- `pnpm exec playwright test` 28/28 green with no demo route in the repo
</verification>

<success_criteria>
Both Phase-5 deferred debt items are closed: the demo route + broken E2E no longer exist, prettier drift is re-baselined behind a .planning/ ignore, and the full bare test suite is proven green — enabling QA-01/02/03 certification in Waves 2-5.
</success_criteria>

<output>
After completion, create `.planning/phases/06-verification-polish/06-01-SUMMARY.md`
</output>
