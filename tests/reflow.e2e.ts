import { test, expect } from '@playwright/test';

// Reflow gate (SECT-07, A11Y-07 / WCAG 1.4.10): at a 320px CSS width — the WCAG reflow
// baseline, equivalent to 400% zoom on a 1280px viewport — every route must present a
// single column with NO horizontal scroll (content never requires two-dimensional
// scrolling). URLs carry the production base subpath + trailing slash, matching
// tests/mode.e2e.ts; the preview is served under BASE_PATH.
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/'];

test.use({ viewport: { width: 320, height: 800 } });

for (const route of ROUTES) {
	test(`no horizontal scroll at 320px: ${route}`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 800 });
		await page.goto(BASE + route);
		// The document must not overflow its own viewport width.
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth
		);
		expect(overflow).toBe(false);
	});
}
