import { test, expect } from '@playwright/test';

// End-to-end proof of the Phase-5 premium-layer success criteria (PREM-01/02/04/05/06 +
// Success Criteria 5) against the built preview. The preview serves under the production
// base subpath because playwright.config.ts pins webServer.env.BASE_PATH (Plan 03-01);
// trailingSlash:'always' means every route URL carries a trailing slash.
//
// Pitfall 7: a FRESH context resolves to the LOCKED premium default (headless chromium
// has SwiftShader WebGL and no stored key) — NEVER assume a starting mode. Every test
// seeds 'did2:mode' via addInitScript before any document script runs.
const BASE = 'http://localhost:4173/diversityincludesdisability_two';
const HOME = BASE + '/';

test('accessible mode ships no canvas; premium chunk loads lazily on toggle (PREM-03/04)', async ({
	page
}) => {
	const requests: string[] = [];
	page.on('request', (r) => requests.push(r.url()));

	await page.addInitScript(() => {
		try {
			localStorage.setItem('did2:mode', 'accessible');
		} catch {
			/* ignore sandboxed storage */
		}
	});

	await page.goto(HOME);
	await page.waitForLoadState('networkidle');

	// Accessible mode renders ZERO canvas elements — the premium graph never mounted.
	expect(await page.locator('canvas').count()).toBe(0);

	// Chunk names are hashed, so assert lazy loading behaviorally: flipping the toggle
	// must fetch a NEW js chunk (the dynamic import() in +layout.svelte firing on demand).
	const before = requests.filter((u) => u.endsWith('.js')).length;

	// dispatchEvent bypasses Playwright's actionability auto-scroll (sticky header —
	// Phase-3 convention), invoking the toggle handler directly.
	await page.getByRole('switch').dispatchEvent('click');
	await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });

	// The chunk arrived on demand — accessible mode never paid for it (PREM-03).
	expect(requests.filter((u) => u.endsWith('.js')).length).toBeGreaterThan(before);
});

test('no WebGL + stored premium falls back to accessible presentation (Success Criteria 5)', async ({
	page
}) => {
	await page.addInitScript(() => {
		try {
			// A stored premium choice bypasses the resolver's WebGL probe (Pitfall 5) —
			// the layout's own data-webgl stamp is the only remaining floor.
			localStorage.setItem('did2:mode', 'premium');
		} catch {
			/* ignore sandboxed storage */
		}
		// Stub WebGL dead: any webgl-flavored context request returns null; '2d' keeps
		// working so nothing unrelated breaks.
		const orig = HTMLCanvasElement.prototype.getContext as (
			this: HTMLCanvasElement,
			type: string,
			...args: unknown[]
		) => unknown;
		HTMLCanvasElement.prototype.getContext = function (
			this: HTMLCanvasElement,
			type: string,
			...args: unknown[]
		) {
			if (String(type).includes('webgl')) return null;
			return orig.call(this, type, ...args);
		} as typeof HTMLCanvasElement.prototype.getContext;
	});

	await page.goto(HOME);

	// No canvas ever mounts — the gate's webglOk leg is false.
	expect(await page.locator('canvas').count()).toBe(0);

	// The layout stamped the floor attribute...
	await expect(page.locator('html')).toHaveAttribute('data-webgl', 'no');

	// ...and the dark skin reverted: :root[data-mode='premium']:not([data-webgl='no'])
	// no longer matches, so --color-surface is the light --did-white again.
	const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	expect(bg).toBe('rgb(255, 255, 255)');
});

test('premium default mounts exactly one canvas (PREM-01)', async ({ page }) => {
	await page.addInitScript(() => {
		try {
			localStorage.setItem('did2:mode', 'premium');
		} catch {
			/* ignore sandboxed storage */
		}
	});

	await page.goto(HOME);

	// The ONE shared Canvas (PREM-02) mounts inside the fixed backdrop...
	await expect(page.locator('.premium-backdrop canvas')).toBeVisible({ timeout: 15000 });

	// ...and it is the ONLY canvas on the page.
	expect(await page.locator('canvas').count()).toBe(1);

	// The backdrop is inert to assistive tech: Threlte renders its context tree INSIDE
	// <canvas> as fallback content that would otherwise leak into the a11y tree.
	await expect(page.locator('.premium-backdrop')).toHaveAttribute('aria-hidden', 'true');
});
