import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// WCAG 2.2 AA gate (A11Y-02, A11Y-03, and re-checks A11Y-06 contrast): scan every primary
// route with @axe-core/playwright and require ZERO violations. The wcag22aa tag set covers
// the automatable success criteria — page-has-heading-one (single h1), heading-order
// (ordered tree), link-name (descriptive links, no bare "click here"), and colour contrast.
// URLs carry the production base subpath + trailing slash (trailingSlash:'always'),
// mirroring tests/mode.e2e.ts; the preview is served under BASE_PATH.
//
// A fresh Playwright context has no stored did2:mode; the inline head script resolves the
// LOCKED default. This suite asserts the mode a fresh headless context lands in — the
// Premium-mode axe pass is Phase 6 (QA-01).
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/'];
const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of ROUTES) {
	test(`axe WCAG 2.2 AA = 0 violations: ${route}`, async ({ page }) => {
		await page.goto(BASE + route);
		const results = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
		expect(results.violations).toEqual([]);
	});
}
