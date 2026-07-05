import { page, userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

// $app/state's `page` is populated by SvelteKit's router at runtime; in an isolated
// component test there is no router, so we mock it to mount Nav "at /" — this lets us
// assert the active-route (aria-current) contract deterministically. $app/paths
// (resolve/base) is left real: base is '' in test, so resolve(route) === route.
vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/') }
}));

import Nav from './Nav.svelte';

// CLIENT (chromium) project — real document + focus. This spec pins the A11Y-03/04/05
// contract: five descriptive barrel links, a mobile disclosure <button> whose
// aria-expanded toggles, that closes on Escape (returning focus to the toggle) and on
// focus leaving the nav, and aria-current="page" on the active route. requireAssertions
// is on, so every case asserts.

describe('Nav.svelte (A11Y-03/04/05)', () => {
	it('renders exactly 5 descriptive links from the content barrel', async () => {
		render(Nav);
		// On the narrow (mobile) test viewport the menu is collapsed; open it so the
		// links are in the accessibility tree.
		await page.getByRole('button', { name: /menu/i }).click();
		const links = page.getByRole('link');
		await expect.element(page.getByRole('link', { name: 'Home' })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: 'Services' })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: 'About' })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: 'Accessibility Statement' }))
			.toBeInTheDocument();
		expect((await links.all()).length).toBe(5);
	});

	it('the disclosure button starts aria-expanded="false" and toggles to "true" and back on click', async () => {
		render(Nav);
		const toggle = page.getByRole('button', { name: /menu/i });
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
	});

	it('Escape while open closes the disclosure AND returns focus to the toggle', async () => {
		render(Nav);
		const toggle = page.getByRole('button', { name: /menu/i });
		const btn = toggle.element() as HTMLButtonElement;
		btn.focus();
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{Escape}');
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
		expect(document.activeElement).toBe(btn);
	});

	it('moving focus out of the nav closes the disclosure', async () => {
		const { container } = render(Nav);
		const toggle = page.getByRole('button', { name: /menu/i });
		const btn = toggle.element() as HTMLButtonElement;
		btn.focus();
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');

		// A node outside the nav subtree; focusout with it as relatedTarget = focus left.
		const outside = document.createElement('button');
		document.body.appendChild(outside);
		btn.dispatchEvent(
			new FocusEvent('focusout', { bubbles: true, relatedTarget: outside })
		);
		outside.remove();

		await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
		expect(container).toBeTruthy();
	});

	it('marks the active route (Home at /) with aria-current="page"', async () => {
		render(Nav);
		await page.getByRole('button', { name: /menu/i }).click();
		const home = page.getByRole('link', { name: 'Home' });
		await expect.element(home).toHaveAttribute('aria-current', 'page');
		// A non-active route must NOT carry aria-current.
		const about = page.getByRole('link', { name: 'About' });
		await expect.element(about).not.toHaveAttribute('aria-current');
	});
});
