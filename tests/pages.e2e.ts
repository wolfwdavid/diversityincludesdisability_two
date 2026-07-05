import { test, expect } from '@playwright/test';

// Reachability gate (SECT-06): every primary route loads without a 4xx/5xx, carries a
// single <h1> (A11Y-02 heading tree), and is present in the primary navigation landmark
// — so no page is orphaned or reachable in only one mode. URLs carry the production base
// subpath + trailing slash (trailingSlash:'always'), mirroring tests/mode.e2e.ts; do NOT
// switch to a root path if it 404s — the preview is served under BASE_PATH.
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/'];

// The five primary-nav labels from the $lib/content barrel (site.ts `nav`). The
// Accessibility Statement MUST be in the primary nav (SECT-06).
const NAV_LABELS = ['Home', 'Services', 'About', 'Contact', 'Accessibility Statement'];

for (const route of ROUTES) {
	test(`route loads with exactly one h1: ${route}`, async ({ page }) => {
		const resp = await page.goto(BASE + route);
		expect(resp?.status()).toBeLessThan(400);
		expect(await page.locator('h1').count()).toBe(1);
	});
}

test('primary nav links to all five routes incl. the Accessibility Statement (SECT-06)', async ({
	page
}) => {
	// Desktop viewport so the disclosure menu is a visible flex row (the mobile toggle
	// hides it below 48rem); we are asserting nav linkage, not disclosure behavior.
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto(BASE + '/');

	const primary = page.getByRole('navigation', { name: /primary/i });
	for (const label of NAV_LABELS) {
		await expect(primary.getByRole('link', { name: label, exact: true })).toBeVisible();
	}
});
