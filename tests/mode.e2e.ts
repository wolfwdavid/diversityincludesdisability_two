import { test, expect } from '@playwright/test';

// End-to-end proof of the mode-toggle behaviors that only a REAL browser reload can
// verify (MODE-01/02/04/05). The preview server is served under the production base
// path because playwright.config.ts pins webServer.env.BASE_PATH=/diversityincludesdisability_two
// (Plan 03-01). Navigate to the absolute subpath with a trailing slash
// (trailingSlash:'always'); do NOT switch to a root path if it 404s — verify the
// BASE_PATH env is present instead.
const HOME = 'http://localhost:4173/diversityincludesdisability_two/';

test('persistence: the chosen mode survives a full page reload (MODE-01/02) @ci', async ({
	page
}) => {
	await page.goto(HOME);

	const sw = page.locator('[role="switch"]');
	await sw.click();

	// The mode the user just selected via the switch.
	const chosen = await page.evaluate(() => document.documentElement.dataset.mode);
	expect(chosen === 'premium' || chosen === 'accessible').toBe(true);

	await page.reload();

	// On the FIRST evaluation after reload the stamped attribute must already match
	// the pre-reload choice — it was persisted to localStorage under 'did2:mode' and
	// re-stamped by the inline head script before paint.
	const afterReload = await page.evaluate(() => document.documentElement.dataset.mode);
	expect(afterReload).toBe(chosen);
});

test('no-flash: a pre-existing did2:mode=premium is stamped before first paint (MODE-04)', async ({
	page
}) => {
	// Seed the namespaced key BEFORE any document script runs, so the inline head
	// script resolves premium and stamps data-mode pre-paint — no accessible→premium flip.
	await page.addInitScript(() => {
		try {
			localStorage.setItem('did2:mode', 'premium');
		} catch {
			/* ignore sandboxed storage */
		}
	});

	await page.goto(HOME);

	const mode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
	expect(mode).toBe('premium');
});

test('scroll + focus preserved across a toggle (MODE-05)', async ({ page }) => {
	await page.goto(HOME);

	// Force the document tall enough to scroll regardless of current page content.
	await page.addStyleTag({ content: 'body { min-height: 3000px; }' });

	const sw = page.locator('[role="switch"]');
	// The switch lives in a STICKY header (MODE-01 persistent header), so it stays in
	// the viewport when the page scrolls — focusing it does NOT scroll back to the top.
	await sw.focus();
	await page.evaluate(() => window.scrollTo(0, 300));

	// This is a fresh context with no stored choice, so the inline script picks the
	// LOCKED default (premium on a WebGL-capable, no-reduced-motion browser). Don't
	// assume the starting value — capture it, then prove the toggle FLIPPED it.
	const before = await page.evaluate(() => document.documentElement.dataset.mode);

	// Fire the toggle by dispatching a click straight to the element — this invokes the
	// onToggle handler WITHOUT Playwright's actionability auto-scroll, so we measure the
	// component's own behavior in isolation. The handler never touches scroll or focus.
	await sw.dispatchEvent('click');
	await expect
		.poll(() => page.evaluate(() => document.documentElement.dataset.mode))
		.not.toBe(before);

	// No navigation + handler never scrolls → the offset is exactly preserved.
	const scrollY = await page.evaluate(() => window.scrollY);
	expect(scrollY).toBe(300);

	// Focus must remain on the switch (it is never moved on toggle).
	const focusIsSwitch = await page.evaluate(
		() => document.activeElement?.getAttribute('role') === 'switch'
	);
	expect(focusIsSwitch).toBe(true);
});
