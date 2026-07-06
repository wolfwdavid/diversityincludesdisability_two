---
phase: 06-verification-polish
plan: 04
type: execute
wave: 4
depends_on: ["06-03"]
files_modified:
  - tests/a11y-keyboard.e2e.ts
  - tests/sr-parity.e2e.ts (NEW)
autonomous: true
requirements: [QA-03]
must_haves:
  truths:
    - "Every existing keyboard-operability behavior (skip link moves focus, disclosure Enter/Escape+focus-restore, switch keyboard toggle) is proven in BOTH modes, not just Accessible"
    - "For every route, the aria snapshot of #main is IDENTICAL in Premium and Accessible mode — machine proof that the WebGL canvas is silent to assistive tech (D-03)"
    - "An automated test asserts the aria-live region announces 'Premium mode enabled' / 'Accessible mode enabled' on toggle (D-04 automated half)"
  artifacts:
    - path: "tests/a11y-keyboard.e2e.ts"
      provides: "3 keyboard behaviors x 2 modes = 6 tests"
      contains: "did2:mode"
    - path: "tests/sr-parity.e2e.ts"
      provides: "5 per-route cross-mode aria-snapshot parity tests + 1 aria-live announcement test"
      contains: "ariaSnapshot"
      min_lines: 60
  key_links:
    - from: "tests/sr-parity.e2e.ts"
      to: "src/lib/components/ModeToggle.svelte aria-live region"
      via: "locator('[aria-live=\"polite\"]') text assertion after dispatchEvent('click')"
      pattern: "aria-live"
    - from: "tests/sr-parity.e2e.ts"
      to: "src/lib/premium/PremiumLayer.svelte"
      via: "premium-backdrop aria-hidden='true' assertion (canvas invisible to the a11y tree)"
      pattern: "aria-hidden"
---

<objective>
Build the automated half of QA-03 (D-01): CI-provable screen-reader proxies — landmark/heading/name parity across modes via aria snapshots, the aria-live toggle announcement, and both-modes keyboard operability — so the one-time human NVDA walkthrough (plan 06-05) verifies perception, not regressions.

Purpose: D-03's specific claim needs machine proof: an NVDA user in Premium mode gets the exact same experience as in Accessible mode because the canvas is silent. Cross-mode aria-snapshot equality of #main is that proof, permanently gated.
Output: tests/a11y-keyboard.e2e.ts parameterized over both modes (6 tests) + new tests/sr-parity.e2e.ts (6 tests).
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
@tests/a11y-keyboard.e2e.ts
@tests/premium.e2e.ts
@src/lib/components/ModeToggle.svelte
@src/routes/+layout.svelte

<interfaces>
From src/lib/components/ModeToggle.svelte — the exact announcement contract (D-04):
```svelte
<button type="button" role="switch" aria-checked={isPremium()} onclick={onToggle} class="mode-toggle">
	<span class="mode-toggle__label">Premium 3D mode</span>
	...
<span class="visually-hidden" aria-live="polite">{announce}</span>
<!-- announce = next === 'premium' ? 'Premium mode enabled' : 'Accessible mode enabled' -->
```

From src/routes/+layout.svelte — the landmark skeleton BOTH modes share (identical DOM; premium only appends the aria-hidden backdrop after the footer):
```svelte
<SkipLinks />                                        <!-- first focusable content -->
<header class="site-header">                         <!-- role=banner -->
	<nav id="nav" tabindex="-1" aria-label="Primary">  <!-- role=navigation, name "Primary" -->
	<ModeToggle />
</header>
<main id="main" tabindex="-1" class="site-main">     <!-- role=main, skip-link target -->
<footer class="site-footer">                         <!-- role=contentinfo -->
<!-- premium only: .premium-backdrop (aria-hidden="true") containing the ONE canvas -->
```

From tests/premium.e2e.ts — conventions:
- BASE = 'http://localhost:4173/diversityincludesdisability_two'; trailing-slash routes
- premium settle: `expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 })`
- toggle: `page.getByRole('switch').dispatchEvent('click')`

Playwright ^1.60 API used: `await page.locator('#main').ariaSnapshot()` returns a YAML string of the accessible tree (role/name/heading structure) — stable across pure-CSS differences, so it is the right cross-mode parity probe.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Parameterize tests/a11y-keyboard.e2e.ts over both modes (QA-03 keyboard half)</name>
  <files>tests/a11y-keyboard.e2e.ts</files>
  <read_first>
    - tests/a11y-keyboard.e2e.ts (the 3 existing tests — skip link, disclosure Enter/Escape, switch keyboard toggle; their assertions are correct and must survive unchanged inside the new loop)
    - tests/premium.e2e.ts (mode-seeding addInitScript pattern + premium canvas settle wait — reuse verbatim)
  </read_first>
  <action>
    Wrap the 3 existing tests in a mode loop so each behavior is proven in the REAL environment of both modes (Accessible baseline AND Premium with the live WebGL layer + dark skin):

    ```typescript
    const MODES = ['accessible', 'premium'] as const;

    for (const mode of MODES) {
    	test.describe(`keyboard [${mode}]`, () => {
    		test.beforeEach(async ({ page }) => {
    			await page.addInitScript((m) => {
    				try {
    					localStorage.setItem('did2:mode', m);
    				} catch {
    					/* ignore sandboxed storage */
    				}
    			}, mode);
    		});
    		// ...the 3 existing tests, bodies unchanged EXCEPT:
    		// immediately after each page.goto(...), add the premium settle guard:
    		//   if (mode === 'premium') {
    		//     await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });
    		//   }
    		// so keyboard operation is measured with the premium layer actually mounted.
    	});
    }
    ```

    Details:
    - Test titles keep their (A11Y-01)/(A11Y-05) suffixes; the describe block adds the [mode] dimension → 6 total tests.
    - The mobile-disclosure test keeps its 375x800 viewport line; the premium backdrop still mounts at mobile width (position:fixed), so the settle guard applies there too.
    - The switch-toggle test flips the seeded mode by design (Space activates it) — that is fine; it captures aria-checked BEFORE pressing Space, so it is start-mode-agnostic (Phase-3 convention: never assume a starting mode).
    - Do NOT tag these @ci (D-08 fixes the CI subset to axe + zero-WebGL + toggle smoke; the 14-test count asserted in 06-03 must not change).

    Run: kill stale 4173 (`powershell -Command "Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`), then `pnpm exec playwright test tests/a11y-keyboard.e2e.ts` → 6 passed.
  </action>
  <verify>
    <automated>pnpm lint && pnpm exec playwright test tests/a11y-keyboard.e2e.ts</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/a11y-keyboard.e2e.ts --list` lists exactly 6 tests, 3 containing "[accessible]" and 3 containing "[premium]" in the describe path
    - Run output contains "6 passed", zero failed
    - `grep -c "did2:mode" tests/a11y-keyboard.e2e.ts` >= 1; `grep -c "@ci" tests/a11y-keyboard.e2e.ts` == 0
    - `pnpm lint` exits 0
  </acceptance_criteria>
  <done>Skip links, disclosure keyboard handling, and switch keyboard operation are proven in both modes — the keyboard half of QA-03's "every page passes in both modes".</done>
</task>

<task type="auto">
  <name>Task 2: New tests/sr-parity.e2e.ts — cross-mode aria-snapshot parity + aria-live announcement (D-01/D-03/D-04)</name>
  <files>tests/sr-parity.e2e.ts</files>
  <read_first>
    - src/lib/components/ModeToggle.svelte (exact announcement strings 'Premium mode enabled' / 'Accessible mode enabled' and the `[aria-live="polite"]` span — assert these literals, do not invent variants)
    - src/routes/+layout.svelte (landmark skeleton + the premium backdrop rendered AFTER the footer, aria-hidden — this is why #main-scoped snapshots are mode-invariant while body-scoped ones are not: the header switch's aria-checked differs between modes)
    - tests/premium.e2e.ts (BASE/routes/settle/toggle conventions)
  </read_first>
  <action>
    Create tests/sr-parity.e2e.ts with exactly 6 tests. Header comment: this file is the automated half of QA-03/D-01 — SR proxies proving D-03's claim that the canvas is silent (an NVDA user in Premium gets the identical page as in Accessible); the human-ear half lives in 06-HUMAN-UAT.md.

    Constants: `const BASE = 'http://localhost:4173/diversityincludesdisability_two';` and `const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/'];`

    A) 5 per-route parity tests. IMPORTANT: do NOT use addInitScript for seeding here — it re-runs on every navigation and would overwrite the second mode's key on reload. Set localStorage directly between reloads:

    ```typescript
    for (const route of ROUTES) {
    	test(`SR parity: #main aria snapshot identical across modes ${route} (D-03)`, async ({
    		page
    	}) => {
    		await page.goto(BASE + route);

    		// ACCESSIBLE pass
    		await page.evaluate(() => localStorage.setItem('did2:mode', 'accessible'));
    		await page.reload();
    		expect(await page.locator('canvas').count()).toBe(0);
    		const accessibleSnapshot = await page.locator('#main').ariaSnapshot();
    		const accessibleHeadings = await page.evaluate(() =>
    			Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(
    				(h) => `${h.tagName}:${h.textContent?.trim()}`
    			)
    		);

    		// PREMIUM pass — same page, canvas live
    		await page.evaluate(() => localStorage.setItem('did2:mode', 'premium'));
    		await page.reload();
    		await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });

    		// the backdrop is invisible to the a11y tree...
    		await expect(page.locator('.premium-backdrop')).toHaveAttribute('aria-hidden', 'true');
    		// ...the four landmarks all survive the premium skin...
    		await expect(page.getByRole('banner')).toBeVisible();
    		await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    		await expect(page.getByRole('main')).toBeVisible();
    		await expect(page.getByRole('contentinfo')).toBeVisible();
    		// ...and the content an SR walks is IDENTICAL (roles, names, heading structure).
    		expect(await page.locator('#main').ariaSnapshot()).toBe(accessibleSnapshot);
    		expect(
    			await page.evaluate(() =>
    				Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(
    					(h) => `${h.tagName}:${h.textContent?.trim()}`
    				)
    			)
    		).toEqual(accessibleHeadings);
    	});
    }
    ```

    B) 1 announcement test (D-04 automated half):

    ```typescript
    test('toggle announces the new mode via aria-live and flips switch state (D-04, MODE-05)', async ({
    	page
    }) => {
    	await page.goto(BASE + '/');
    	const sw = page.getByRole('switch');
    	const live = page.locator('[aria-live="polite"]');
    	await expect(live).toHaveText(''); // silent until the user acts

    	// Fresh context resolves the LOCKED default — capture, never assume (Phase-3 rule).
    	const before = await page.evaluate(() => document.documentElement.dataset.mode);
    	const expected = (m: string | undefined) =>
    		m === 'premium' ? 'Premium mode enabled' : 'Accessible mode enabled';

    	await sw.dispatchEvent('click');
    	const first = await page.evaluate(() => document.documentElement.dataset.mode);
    	expect(first).not.toBe(before);
    	await expect(live).toHaveText(expected(first));
    	await expect(sw).toHaveAttribute('aria-checked', first === 'premium' ? 'true' : 'false');

    	// Both messages must be reachable — flip back.
    	await sw.dispatchEvent('click');
    	const second = await page.evaluate(() => document.documentElement.dataset.mode);
    	await expect(live).toHaveText(expected(second));
    });
    ```

    Do NOT tag any test @ci (the CI subset is frozen at 14 by 06-03's acceptance).

    Run: kill stale 4173, then `pnpm exec playwright test tests/sr-parity.e2e.ts` → 6 passed. If a parity snapshot mismatches, that is a REAL cross-mode divergence — fix the component (both modes share one DOM by architecture) rather than weakening the assertion.
  </action>
  <verify>
    <automated>pnpm lint && pnpm exec playwright test tests/sr-parity.e2e.ts tests/a11y-keyboard.e2e.ts</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm exec playwright test tests/sr-parity.e2e.ts --list` lists exactly 6 tests
    - Combined run output contains "12 passed" (6 sr-parity + 6 keyboard), zero failed
    - `grep -c "ariaSnapshot" tests/sr-parity.e2e.ts` >= 2 (capture + compare)
    - `grep -c "Premium mode enabled" tests/sr-parity.e2e.ts` >= 1 and `grep -c "Accessible mode enabled" tests/sr-parity.e2e.ts` >= 1
    - `grep -c "@ci" tests/sr-parity.e2e.ts` == 0; `pnpm exec playwright test --grep "@ci" --list` still lists exactly 14 tests
  </acceptance_criteria>
  <done>Machine-gated SR proxies exist: per-route cross-mode aria parity (canvas proven silent), landmark survival under the premium skin, and the exact aria-live announcement text — QA-03's automated half is green.</done>
</task>

</tasks>

<verification>
- `pnpm exec playwright test tests/a11y-keyboard.e2e.ts tests/sr-parity.e2e.ts` → 12/12 green
- @ci subset unchanged at 14 tests
- `pnpm lint` green
</verification>

<success_criteria>
QA-03's automated half is complete: keyboard operability proven in both modes, cross-mode aria-snapshot parity proves the WebGL canvas is invisible to assistive tech on every route, and the toggle announcement is asserted verbatim — leaving only human perception (NVDA walkthrough, plan 06-05) unautomated.
</success_criteria>

<output>
After completion, create `.planning/phases/06-verification-polish/06-04-SUMMARY.md`
</output>
