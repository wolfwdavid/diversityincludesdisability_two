---
phase: 06-verification-polish
plan: 02
type: execute
wave: 2
depends_on: ["06-01"]
files_modified:
  - tests/a11y.e2e.ts
  - src/lib/tokens/tokens.css (CONDITIONAL — only if premium axe violations require scrim/token fixes)
  - src/lib/tokens/pairs.ts (CONDITIONAL — only if a token hex changes)
  - src/app.css (CONDITIONAL — only if premium axe violations require markup/scrim fixes)
autonomous: true
requirements: [QA-01]
must_haves:
  truths:
    - "axe (WCAG 2.2 AA tag set) reports ZERO violations of ANY severity on all 5 routes in Accessible mode AND all 5 routes in Premium mode (D-05: 10 gated combinations)"
    - "axe reports zero violations immediately after toggling INTO each mode on the home page (D-07 post-toggle race scans)"
    - "Every axe test title carries the @ci tag so the D-08 CI subset can select it"
  artifacts:
    - path: "tests/a11y.e2e.ts"
      provides: "12-test both-modes axe gate (5 routes x 2 modes + 2 post-toggle)"
      contains: "@ci"
      min_lines: 60
  key_links:
    - from: "tests/a11y.e2e.ts"
      to: "src/lib/mode/constants.ts STORAGE_KEY"
      via: "addInitScript seeding localStorage 'did2:mode' (premium.e2e.ts pattern)"
      pattern: "did2:mode"
    - from: "tests/a11y.e2e.ts"
      to: "src/lib/premium/PremiumLayer.svelte"
      via: "premium settle wait on .premium-backdrop canvas before scanning"
      pattern: "premium-backdrop canvas"
---

<objective>
Convert the existing 5-route Accessible-only axe gate into the QA-01 gate: strict 0 axe violations (WCAG 2.2 AA rule set, ANY severity) across both modes on every route, plus one scan immediately after toggling on each mode's landing page. Fix any Premium violations in-phase until the gate is 0 (D-06 — no triage-and-defer).

Purpose: QA-01 with the D-05 raised bar — one quality standard, not two. The Phase-5 scrims were contrast-gated at rgb(7 28 51 / 0.94) precisely to make this achievable.
Output: tests/a11y.e2e.ts as a 12-test @ci-tagged matrix, green.
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
@tests/a11y.e2e.ts
@tests/premium.e2e.ts

<interfaces>
From src/lib/mode/constants.ts (do NOT re-derive — this is the single constants surface):
```typescript
export const STORAGE_KEY = 'did2:mode';
export const DATA_ATTR = 'data-mode';
export const MODES = ['premium', 'accessible'] as const;
```

From tests/premium.e2e.ts — the established E2E mode-seeding pattern (reuse verbatim):
```typescript
await page.addInitScript(() => {
	try {
		localStorage.setItem('did2:mode', 'premium');
	} catch {
		/* ignore sandboxed storage */
	}
});
```
Premium settle signal: `await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });`
Toggle without actionability auto-scroll: `await page.getByRole('switch').dispatchEvent('click');`

From tests/a11y.e2e.ts (current file being replaced):
```typescript
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/'];
const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
// scan: new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze(); expect(results.violations).toEqual([]);
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Parameterize tests/a11y.e2e.ts over both modes + add the two D-07 post-toggle scans</name>
  <files>tests/a11y.e2e.ts</files>
  <read_first>
    - tests/a11y.e2e.ts (the file being rewritten — keep BASE, ROUTES, WCAG_22_AA and the violations-toEqual-[] assertion style exactly)
    - tests/premium.e2e.ts (the mode-seeding addInitScript pattern, the .premium-backdrop canvas settle wait, and the dispatchEvent('click') toggle convention — reuse all three verbatim)
    - src/lib/mode/constants.ts (STORAGE_KEY = 'did2:mode' — the literal the init script writes)
  </read_first>
  <action>
    Rewrite tests/a11y.e2e.ts (per D-10: extend THIS file, no separate audit script, no new tooling) to produce exactly 12 tests, all titles ending in `@ci`:

    A) Steady-state matrix — 10 tests. Loop `for (const mode of ['accessible', 'premium'] as const)` outer, `for (const route of ROUTES)` inner:
    ```typescript
    test(`axe WCAG 2.2 AA = 0 violations [${mode}] ${route} @ci`, async ({ page }) => {
    	await page.addInitScript((m) => {
    		try {
    			localStorage.setItem('did2:mode', m);
    		} catch {
    			/* ignore sandboxed storage */
    		}
    	}, mode);
    	await page.goto(BASE + route);
    	if (mode === 'premium') {
    		// settle: scan the REAL premium presentation (dark skin + canvas), not a mid-load frame
    		await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });
    	} else {
    		// accessible steady state ships zero canvas (A11Y-08) — guard the scan's premise
    		expect(await page.locator('canvas').count()).toBe(0);
    	}
    	const results = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
    	expect(results.violations).toEqual([]);
    });
    ```
    (`addInitScript(fn, arg)` passes `mode` as the serialized argument — supported since Playwright 1.x.)

    B) Post-toggle scans — 2 tests (D-07: catches skin/scrim application races on each mode's landing page `/`):
    1. `'axe = 0 violations immediately after toggling INTO premium on / @ci'` — seed 'accessible', goto BASE + '/', `await page.getByRole('switch').dispatchEvent('click')`, wait `.premium-backdrop canvas` visible (timeout 15000), then scan immediately (no extra settle) and expect `[]`.
    2. `'axe = 0 violations immediately after toggling INTO accessible on / @ci'` — seed 'premium', goto BASE + '/', wait canvas visible, dispatchEvent('click'), `await expect(page.locator('canvas')).toHaveCount(0)` (premium subtree unmounted), then scan and expect `[]`.

    Keep the header comment explaining the gate (update it: this IS the Phase-6 QA-01 gate now, D-05 strict-0 both modes). Keep import lines: `@playwright/test` + `AxeBuilder from '@axe-core/playwright'`. File must be prettier-clean (`pnpm lint` is a standing gate after 06-01).
  </action>
  <verify>
    <automated>pnpm lint && pnpm exec playwright test tests/a11y.e2e.ts --list</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/a11y.e2e.ts --list` lists exactly 12 tests
    - Every listed title contains the literal `@ci`
    - `grep -c "did2:mode" tests/a11y.e2e.ts` >= 1 and `grep -c "premium-backdrop canvas" tests/a11y.e2e.ts` >= 1
    - `grep -c "withTags(WCAG_22_AA)" tests/a11y.e2e.ts` >= 1 (rule set unchanged)
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>tests/a11y.e2e.ts defines the full 12-scan QA-01 matrix, @ci-tagged, lint-clean. (Green run is Task 2 — violations found there are fixed there.)</done>
</task>

<task type="auto">
  <name>Task 2: Run the 12-scan gate; fix any Premium violations in-phase until strict 0 (D-05/D-06)</name>
  <files>src/lib/tokens/tokens.css (conditional), src/lib/tokens/pairs.ts (conditional), src/app.css (conditional)</files>
  <read_first>
    - tests/a11y.e2e.ts (the gate just written in Task 1)
    - src/lib/tokens/tokens.css (the premium override block `:root[data-mode='premium']:not([data-webgl='no'])` with `--color-scrim: rgb(7 28 51 / 0.94)` — the most likely fix surface for contrast violations)
    - src/lib/tokens/pairs.ts (the 12 machine-gated contrast pairs incl. 6 dark pairs — ANY token hex change MUST add/update its pair here so check-contrast.mjs stays the authority)
    - src/app.css (premium scrim panels / section stacking, all gated `:not([data-webgl='no'])` — the markup-level fix surface)
  </read_first>
  <action>
    1. Kill any stale 4173 preview first (KNOWN TRAP):
       `powershell -Command "Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`
    2. Run `pnpm exec playwright test tests/a11y.e2e.ts` (webServer builds + previews automatically).
    3. If all 12 pass: done — record "0 fixes needed" in the summary.
    4. If ANY premium-mode scan reports violations, fix them IN THIS TASK (D-06: Phase-6 work, no triage-and-defer), in this priority order:
       - color-contrast on scrim panels → raise scrim alpha in `--color-scrim` (tokens.css premium block) or darken the panel token; keep the rgb(7 28 51 / X) form so axe has a computable background.
       - color-contrast from a token pair → change the hex in src/lib/tokens/colors.ts + mirror in tokens.css custom property, AND add/update the pair in src/lib/tokens/pairs.ts so `node scripts/check-contrast.mjs` machine-gates the new value (12+ pairs must all PASS).
       - structural violations (landmark/name/aria) → fix the component markup; premium and accessible share the same DOM, so re-run the ACCESSIBLE scans too after any markup change.
    5. After every fix iteration re-run: `node scripts/check-contrast.mjs` (must stay all-PASS) then the 12-scan suite, until 12/12 green.
    6. `pnpm lint && pnpm check` before commit (standing gates).

    Constraint: NO visual redesign (D-13) — fixes are minimal token/scrim/markup corrections, not art direction. The Phase-5 art direction was approved as-is; if a fix would visibly change the approved look beyond a contrast nudge, stop and surface it instead of shipping it.
  </action>
  <verify>
    <automated>powershell -Command "Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" ; pnpm exec playwright test tests/a11y.e2e.ts && node scripts/check-contrast.mjs && pnpm lint</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/a11y.e2e.ts` output contains "12 passed", zero failed
    - `node scripts/check-contrast.mjs` exits 0 with every pair PASS
    - `pnpm lint` and `pnpm check` exit 0
    - If tokens changed: the same hex appears in BOTH colors.ts and tokens.css (grep the hex in both files)
  </acceptance_criteria>
  <done>QA-01 is a green automated gate: strict 0 axe violations across 10 steady-state combinations + 2 post-toggle scans, with the contrast script still machine-gating every token pair.</done>
</task>

</tasks>

<verification>
- `pnpm exec playwright test tests/a11y.e2e.ts` → 12/12 green
- All 12 titles @ci-tagged (feeds the D-08 CI subset in plan 06-03)
- `node scripts/check-contrast.mjs` all PASS; `pnpm lint`/`pnpm check` green
</verification>

<success_criteria>
QA-01 satisfied at the D-05 raised bar: automated axe reports strict 0 violations of any severity in both Premium and Accessible mode on every route, including immediately after mode toggles.
</success_criteria>

<output>
After completion, create `.planning/phases/06-verification-polish/06-02-SUMMARY.md`
</output>
