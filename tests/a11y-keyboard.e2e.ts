import { test, expect } from '@playwright/test';

// Keyboard-operability gate (A11Y-01, A11Y-05): a keyboard-only user can (1) Tab to the
// skip link and activate it to move FOCUS — not just scroll — to #main, (2) open/close the
// mobile nav disclosure with Enter/Escape while focus is managed correctly, and (3) reach
// and operate the mode switch. URLs carry the production base subpath + trailing slash,
// mirroring tests/mode.e2e.ts; the preview is served under BASE_PATH.
const BASE = 'http://localhost:4173/diversityincludesdisability_two';

test('skip link moves focus to #main (A11Y-01)', async ({ page }) => {
	await page.goto(BASE + '/');
	// The skip links are rendered first, so the very first Tab lands on "Skip to main".
	await page.keyboard.press('Tab');
	await expect(page.locator('a.skip-link:focus')).toBeVisible();

	// Activating it navigates to #main; because #main has tabindex="-1" the browser moves
	// FOCUS there (Pitfall 1) — not merely the scroll position.
	await page.keyboard.press('Enter');
	const id = await page.evaluate(() => document.activeElement?.id);
	expect(id).toBe('main');
});

test('mobile nav disclosure: Enter opens, Escape closes and restores focus (A11Y-05)', async ({
	page
}) => {
	// Narrow viewport (<48rem) so the disclosure toggle is shown and the menu is collapsed.
	await page.setViewportSize({ width: 375, height: 800 });
	await page.goto(BASE + '/');

	const toggle = page.getByRole('button', { name: /menu/i });
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');

	// Enter on the native <button> opens the disclosure (APG Show/Hide pattern).
	await toggle.focus();
	await page.keyboard.press('Enter');
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');

	// Escape closes it AND returns focus to the toggle (no focus lost to <body>).
	await page.keyboard.press('Escape');
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(toggle).toBeFocused();
});

test('mode switch is keyboard-focusable and toggles via the keyboard (A11Y-05)', async ({
	page
}) => {
	await page.goto(BASE + '/');

	const sw = page.getByRole('switch');
	await sw.focus();
	await expect(sw).toBeFocused();

	// Space activates a native button → toggleMode() flips aria-checked. Smoke-check the
	// keyboard path only; full mode-persistence behavior is covered by tests/mode.e2e.ts.
	const before = await sw.getAttribute('aria-checked');
	await page.keyboard.press('Space');
	await expect.poll(() => sw.getAttribute('aria-checked')).not.toBe(before);
});
