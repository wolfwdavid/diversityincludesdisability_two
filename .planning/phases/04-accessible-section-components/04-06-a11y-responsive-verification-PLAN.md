---
phase: 04-accessible-section-components
plan: 06
type: execute
wave: 3
depends_on: ["04-01", "04-02", "04-03", "04-04", "04-05"]
files_modified:
  - tests/pages.e2e.ts
  - tests/reflow.e2e.ts
  - tests/a11y.e2e.ts
  - tests/a11y-keyboard.e2e.ts
autonomous: true
requirements: [SECT-06, SECT-07, A11Y-01, A11Y-02, A11Y-03, A11Y-05, A11Y-07, A11Y-08]

must_haves:
  truths:
    - "All five routes (/, /services/, /about/, /contact/, /accessibility/) load without 404 and each is reachable from the primary nav (SECT-06)"
    - "Each of the five routes passes @axe-core/playwright with the wcag22aa tag = 0 violations, including page-has-heading-one, heading-order, and link-name (A11Y-02, A11Y-03)"
    - "A keyboard-only user can Tab to the skip link and activate it to move focus to #main; all nav links + the mode switch are reachable and operable by keyboard with a visible focus state (A11Y-01, A11Y-05)"
    - "At a 320px CSS width every route reflows to a single column with no horizontal scroll (document.scrollWidth <= clientWidth) (SECT-07, A11Y-07)"
    - "Accessible mode ships zero WebGL: eslint no-restricted-imports is clean and the built bundle contains no three/threlte/webgl chunk (A11Y-08)"
  artifacts:
    - path: "tests/pages.e2e.ts"
      provides: "Reachability: 5 routes load 200 + nav contains all 5 links incl. Accessibility Statement"
      min_lines: 20
    - path: "tests/reflow.e2e.ts"
      provides: "320px reflow: no horizontal scroll on any route"
      min_lines: 20
    - path: "tests/a11y.e2e.ts"
      provides: "axe WCAG 2.2 AA scan of all 5 routes = 0 violations"
      min_lines: 20
    - path: "tests/a11y-keyboard.e2e.ts"
      provides: "Skip-link focus move + keyboard operability of nav/toggle"
      min_lines: 20
  key_links:
    - from: "tests/a11y.e2e.ts"
      to: "@axe-core/playwright (installed in 04-01)"
      via: "new AxeBuilder({ page }).withTags([...wcag22aa]).analyze()"
      pattern: "AxeBuilder"
    - from: "tests/a11y-keyboard.e2e.ts"
      to: "the live layout (#main skip target from 04-01)"
      via: "Tab → Enter → document.activeElement.id === 'main'"
      pattern: "activeElement"
---

<objective>
Prove the Core Value across the whole live site with the automated gates enumerated in 04-VALIDATION.md. This
plan adds four Playwright E2E specs that run against the built preview (served under the production base path
by `playwright.config.ts`): `pages.e2e.ts` (all 5 routes reachable + present in the nav — SECT-06),
`reflow.e2e.ts` (320px single-column, no horizontal scroll — SECT-07/A11Y-07), `a11y.e2e.ts`
(`@axe-core/playwright` WCAG 2.2 AA = 0 violations on every route, covering single-h1/heading-order/link-name —
A11Y-02/03), and `a11y-keyboard.e2e.ts` (skip link moves focus to `#main`, nav + toggle keyboard-operable —
A11Y-05). A11Y-08 (zero WebGL) is proven by `eslint` clean + grepping the build output for `three`/webgl.

Purpose: SECT-06, SECT-07, A11Y-02, A11Y-03, A11Y-05, A11Y-07, A11Y-08 — the phase gate that declares the
Core Value met (a complete, live, WCAG 2.2 AA site with zero WebGL). Runs after all pages exist (Wave 3).

Output: `tests/{pages,reflow,a11y,a11y-keyboard}.e2e.ts`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-accessible-section-components/04-RESEARCH.md
@.planning/phases/04-accessible-section-components/04-VALIDATION.md
@tests/mode.e2e.ts
@playwright.config.ts

<interfaces>
<!-- E2E conventions (from tests/mode.e2e.ts) — reuse verbatim. -->
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // installed in 04-01
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/']; // trailingSlash:'always'
```
playwright.config.ts: webServer runs `pnpm run build && pnpm run preview`, port 4173, env BASE_PATH=/diversityincludesdisability_two. testMatch '**/*.e2e.{ts,js}' — new files auto-included.
axe tags for WCAG 2.2 AA: `['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']`.
Skip target: layout exposes `<main id="main" tabindex="-1">` and `<nav id="nav" tabindex="-1">` (04-01).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: pages.e2e.ts (reachability) + reflow.e2e.ts (320px)</name>
  <files>tests/pages.e2e.ts, tests/reflow.e2e.ts</files>
  <read_first>
    - tests/mode.e2e.ts (base-path URL convention, trailing slash, do-not-switch-to-root note)
    - src/lib/content/site.ts (the 5 nav routes/labels to assert in the nav)
    - .planning/phases/04-accessible-section-components/04-VALIDATION.md (SECT-06, SECT-07 rows)
  </read_first>
  <action>
    Create `tests/pages.e2e.ts`:
    - For each route in ROUTES: `const resp = await page.goto(BASE + route); expect(resp?.status()).toBeLessThan(400);` and assert exactly one h1: `expect(await page.locator('h1').count()).toBe(1);`
    - One test asserting the primary nav contains all five links: navigate to `/`, then for each expected label ("Home","Services","About","Contact","Accessibility Statement") assert `page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name })` is visible (this proves SECT-06 nav linkage). NOTE: on narrow default viewport the disclosure may hide the menu — set a desktop viewport `await page.setViewportSize({ width: 1280, height: 800 })` before asserting, OR open the disclosure first.
    Create `tests/reflow.e2e.ts` (SECT-07, A11Y-07):
    - `await page.setViewportSize({ width: 320, height: 800 });`
    - For each route: goto, then assert no horizontal scroll: `const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth); expect(overflow).toBe(false);`
    - Every test has an assertion (requireAssertions is off for playwright config, but keep explicit expects).
  </action>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/pages.e2e.ts` passes (5 routes load, each with one h1, nav has 5 links).
    - `pnpm exec playwright test tests/reflow.e2e.ts` passes (no horizontal scroll at 320px on any route).
    - `grep -q 'Accessibility Statement' tests/pages.e2e.ts` (SECT-06 nav assertion present).
    - `grep -q 'scrollWidth' tests/reflow.e2e.ts`.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec playwright test tests/pages.e2e.ts tests/reflow.e2e.ts</automated>
  </verify>
  <done>All 5 routes reachable with a single h1 + present in nav; all reflow to one column at 320px; both specs GREEN.</done>
</task>

<task type="auto">
  <name>Task 2: a11y.e2e.ts (axe WCAG 2.2 AA on all 5 routes)</name>
  <files>tests/a11y.e2e.ts</files>
  <read_first>
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Code Examples: axe WCAG 2.2 AA scan"
    - .planning/phases/04-accessible-section-components/04-VALIDATION.md (A11Y-02/03 rows)
    - tests/mode.e2e.ts (URL convention)
  </read_first>
  <action>
    Create `tests/a11y.e2e.ts` per RESEARCH Code Example:
    - `import AxeBuilder from '@axe-core/playwright';`
    - For each route in ROUTES: a test that `await page.goto(BASE + route)`, then
      `const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze(); expect(results.violations).toEqual([]);`
    - This covers single-h1 (`page-has-heading-one`), ordered headings (`heading-order`), descriptive links (`link-name`), and contrast — A11Y-02, A11Y-03 (and re-checks A11Y-06 inherited).
    - If a route is in the accessible baseline by default (fresh context resolves accessible when no WebGL/reduced-motion), that is the mode under test here; the Premium-mode axe pass is Phase 6 (QA-01).
  </action>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/a11y.e2e.ts` passes with 0 violations on all 5 routes.
    - `grep -q 'AxeBuilder' tests/a11y.e2e.ts` AND `grep -q 'wcag22aa' tests/a11y.e2e.ts`.
    - `grep -q 'violations' tests/a11y.e2e.ts`.
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec playwright test tests/a11y.e2e.ts</automated>
  </verify>
  <done>axe WCAG 2.2 AA reports 0 violations on /, /services/, /about/, /contact/, /accessibility/; spec GREEN.</done>
</task>

<task type="auto">
  <name>Task 3: a11y-keyboard.e2e.ts (skip link + keyboard) + zero-WebGL assertion</name>
  <files>tests/a11y-keyboard.e2e.ts</files>
  <read_first>
    - tests/mode.e2e.ts (keyboard + evaluate patterns, base URL)
    - .planning/phases/04-accessible-section-components/04-RESEARCH.md § "Code Examples: keyboard skip-link E2E" and § "Pattern 2" (disclosure Escape/blur)
    - eslint.config.js (the no-restricted-imports $lib/premium guard — A11Y-08)
  </read_first>
  <action>
    Create `tests/a11y-keyboard.e2e.ts` (A11Y-01/05):
    - Skip-link test: `await page.goto(BASE + '/'); await page.keyboard.press('Tab');` assert the focused element is a `.skip-link` (`await expect(page.locator('a.skip-link:focus')).toBeVisible();`), press Enter, then `const id = await page.evaluate(() => document.activeElement?.id); expect(id).toBe('main');`
    - Nav disclosure keyboard test (narrow viewport): `await page.setViewportSize({ width: 375, height: 800 });` goto '/', focus the menu toggle (`page.getByRole('button', { name: /menu/i })`), press Enter/Space to open (assert `aria-expanded='true'`), press Escape (assert `aria-expanded='false'` and focus returned to the toggle).
    - Mode-switch reachability: assert the `[role="switch"]` is keyboard-focusable and toggles via keyboard (reuse the ModeToggle behavior; do not duplicate all of mode.e2e.ts — one smoke assertion).
    Zero-WebGL (A11Y-08) assertion — add a test OR a scripted check:
    - After build, assert the client bundle has no WebGL: `pnpm exec eslint .` must be clean (structural guard) AND grep the built output for `three`: the check `! grep -rli "three\|threlte\|webgl" build/_app/immutable/ 2>/dev/null` should find nothing (no three/threlte/webgl chunk in the accessible build). Encode this as an npm-runnable step in the plan's verify (the formal network-level assertion is Phase 6 QA-02).
  </action>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/a11y-keyboard.e2e.ts` passes (skip link moves focus to #main; disclosure opens on Enter and Escape closes + returns focus; switch keyboard-operable).
    - `grep -q 'activeElement' tests/a11y-keyboard.e2e.ts` AND `grep -q 'skip-link' tests/a11y-keyboard.e2e.ts` AND `grep -q 'aria-expanded' tests/a11y-keyboard.e2e.ts`.
    - `pnpm exec eslint .` exits clean (no `$lib/premium` import anywhere — A11Y-08 structural).
    - Zero-WebGL in build: after `pnpm run build`, `grep -rli 'three\|threlte\|webgl' build/_app/immutable/ 2>/dev/null` returns nothing (no WebGL chunk shipped).
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec playwright test tests/a11y-keyboard.e2e.ts && pnpm exec eslint .</automated>
  </verify>
  <done>Keyboard walkthrough (skip link + disclosure + switch) GREEN; eslint clean; build ships zero WebGL chunk (A11Y-08).</done>
</task>

</tasks>

<verification>
- Full suite: `pnpm check && pnpm exec vitest run && pnpm exec playwright test` all GREEN.
- `@axe-core/playwright` WCAG 2.2 AA = 0 violations on all 5 routes.
- `pnpm exec eslint .` clean; built bundle has no three/threlte/webgl chunk.
- Manual residual (deferred to Phase 6 QA-03): one screen-reader (NVDA/VoiceOver) walkthrough of every page.
</verification>

<success_criteria>
- Every route loads, is nav-reachable, single-h1, axe-clean at WCAG 2.2 AA, reflows at 320px, and is keyboard-operable.
- Accessible mode demonstrably ships zero WebGL. The Core Value is met.
</success_criteria>

<output>
After completion, create `.planning/phases/04-accessible-section-components/04-06-SUMMARY.md`.
</output>
