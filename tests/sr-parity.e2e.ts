import { test, expect } from '@playwright/test';

// Automated half of QA-03 / D-01 — screen-reader PROXIES that prove D-03's specific claim:
// an NVDA user in Premium mode gets the identical page an Accessible-mode user gets, because
// the WebGL canvas is silent to assistive tech. The machine proof is cross-mode equality of
// the #main accessible tree (roles/names/heading structure) on every route, permanently
// gated here. The human-ear half (does it SOUND right through NVDA?) lives in 06-HUMAN-UAT.md.
//
// Why #main-scoped, not body-scoped: both modes share ONE DOM skeleton (see +layout.svelte);
// premium only appends the aria-hidden .premium-backdrop after the footer. But the header's
// mode switch legitimately reports a different aria-checked between modes, so a body-scoped
// snapshot would differ by design. #main is the content region an SR actually walks and is
// mode-invariant — the right parity probe.
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const ROUTES = ['/', '/services/', '/about/', '/contact/', '/accessibility/'];

// A) Per-route cross-mode aria parity. NOTE: seeding via addInitScript is deliberately
// avoided — it re-runs on every navigation and would overwrite the second mode's key on
// reload. Set localStorage directly between reloads instead.
for (const route of ROUTES) {
	test(`SR parity: #main aria snapshot identical across modes ${route} (D-03)`, async ({
		page
	}) => {
		await page.goto(BASE + route);

		// ACCESSIBLE pass — zero canvas, capture the accessible tree + heading structure.
		await page.evaluate(() => localStorage.setItem('did2:mode', 'accessible'));
		await page.reload();
		expect(await page.locator('canvas').count()).toBe(0);
		const accessibleSnapshot = await page.locator('#main').ariaSnapshot();
		const accessibleHeadings = await page.evaluate(() =>
			Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(
				(h) => `${h.tagName}:${h.textContent?.trim()}`
			)
		);

		// PREMIUM pass — same page, canvas live behind the aria-hidden backdrop.
		await page.evaluate(() => localStorage.setItem('did2:mode', 'premium'));
		await page.reload();
		await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });

		// The backdrop (the ONE canvas) is invisible to the a11y tree...
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

// B) The aria-live announcement (D-04 automated half): the toggle speaks the new mode and
// flips the switch state. The human confirms it is actually SPOKEN by NVDA in 06-HUMAN-UAT.md.
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
