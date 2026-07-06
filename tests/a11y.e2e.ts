import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Phase-6 QA-01 gate (D-05 raised bar): axe WCAG 2.2 AA must report STRICT ZERO violations
// of ANY severity in BOTH modes on every primary route — 5 routes x 2 modes = 10 gated
// steady-state combinations — plus one scan immediately after toggling INTO each mode on
// the home page (D-07: catches skin/scrim application races). One quality standard, not
// two: the Premium dark skin + rgb(7 28 51 / 0.94) scrims were contrast-gated in Phase 5
// precisely to make this achievable. The wcag22aa tag set covers the automatable success
// criteria — page-has-heading-one, heading-order, link-name, and colour contrast.
//
// URLs carry the production base subpath + trailing slash (trailingSlash:'always'),
// mirroring tests/mode.e2e.ts; the preview is served under BASE_PATH.
//
// A fresh Playwright context has no stored did2:mode, so every test seeds the mode via
// addInitScript before any document script runs (tests/premium.e2e.ts pattern). All 12
// titles carry @ci so the D-08 CI subset can select them.
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/'];
const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// A) Steady-state matrix — 10 tests (D-05: strict 0 on every route in every mode).
for (const mode of ['accessible', 'premium'] as const) {
	for (const route of ROUTES) {
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
	}
}

// B) Post-toggle scans — 2 tests (D-07: the scan fires immediately after the mode flip's
// settle signal, catching skin/scrim application races on the landing page).
test('axe = 0 violations immediately after toggling INTO premium on / @ci', async ({ page }) => {
	await page.addInitScript(() => {
		try {
			localStorage.setItem('did2:mode', 'accessible');
		} catch {
			/* ignore sandboxed storage */
		}
	});
	await page.goto(BASE + '/');
	// dispatchEvent bypasses Playwright's actionability auto-scroll (sticky header —
	// Phase-3 convention), invoking the toggle handler directly.
	await page.getByRole('switch').dispatchEvent('click');
	await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });
	// No extra settle: scan the frame the canvas became visible in.
	const results = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
	expect(results.violations).toEqual([]);
});

test('axe = 0 violations immediately after toggling INTO accessible on / @ci', async ({ page }) => {
	await page.addInitScript(() => {
		try {
			localStorage.setItem('did2:mode', 'premium');
		} catch {
			/* ignore sandboxed storage */
		}
	});
	await page.goto(BASE + '/');
	await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });
	await page.getByRole('switch').dispatchEvent('click');
	// The premium subtree unmounts on exit — zero canvas is the accessible settle signal.
	await expect(page.locator('canvas')).toHaveCount(0);
	const results = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
	expect(results.violations).toEqual([]);
});
