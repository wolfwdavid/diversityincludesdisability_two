import { page } from 'vitest/browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ModeToggle from './ModeToggle.svelte';
import { setMode } from '$lib/mode/mode.svelte';

// CLIENT (chromium) project — real document, focus, and localStorage. This spec
// pins the USER-FACING switch contract (MODE-01/05/06): a native
// <button role="switch"> whose aria-checked mirrors isPremium(), that flips the
// whole-site <html data-mode> on click, is keyboard-operable (Enter/Space),
// keeps focus on itself after a toggle, and announces the change via a
// visually-hidden aria-live="polite" region. The store's own write-through is
// covered in mode.svelte.spec.ts — here we exercise it through the control.

beforeEach(() => {
	localStorage.clear();
	// Reset to the accessible baseline the inline head script would have stamped.
	setMode('accessible');
	document.documentElement.removeAttribute('data-mode-ready');
});

describe('ModeToggle.svelte (MODE-01/05/06)', () => {
	it('renders a role="switch" control with an accessible name naming what it controls', async () => {
		render(ModeToggle);
		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		await expect.element(sw).toBeInTheDocument();
	});

	it('aria-checked reflects isPremium(): premium -> "true", accessible -> "false"', async () => {
		setMode('premium');
		render(ModeToggle);
		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		await expect.element(sw).toHaveAttribute('aria-checked', 'true');
	});

	it('starts aria-checked="false" in the accessible baseline', async () => {
		render(ModeToggle);
		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		await expect.element(sw).toHaveAttribute('aria-checked', 'false');
	});

	it('clicking flips aria-checked AND flips the whole-site <html data-mode>', async () => {
		render(ModeToggle);
		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		await sw.click();
		await expect.element(sw).toHaveAttribute('aria-checked', 'true');
		expect(document.documentElement.getAttribute('data-mode')).toBe('premium');

		await sw.click();
		await expect.element(sw).toHaveAttribute('aria-checked', 'false');
		expect(document.documentElement.getAttribute('data-mode')).toBe('accessible');
	});

	it('keyboard: focusing the switch and pressing Enter toggles it (native button)', async () => {
		render(ModeToggle);
		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		const el = sw.element() as HTMLButtonElement;
		el.focus();
		expect(document.activeElement).toBe(el);
		await page.keyboard.press('Enter');
		await expect.element(sw).toHaveAttribute('aria-checked', 'true');
		expect(document.documentElement.getAttribute('data-mode')).toBe('premium');
	});

	it('keyboard: pressing Space toggles it (native button)', async () => {
		render(ModeToggle);
		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		const el = sw.element() as HTMLButtonElement;
		el.focus();
		await page.keyboard.press('Space');
		await expect.element(sw).toHaveAttribute('aria-checked', 'true');
		expect(document.documentElement.getAttribute('data-mode')).toBe('premium');
	});

	it('keeps focus ON the switch after a toggle (focus NOT moved — MODE-05)', async () => {
		render(ModeToggle);
		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		const el = sw.element() as HTMLButtonElement;
		el.focus();
		await sw.click();
		expect(document.activeElement).toBe(el);
	});

	it('announces the new mode via a visually-hidden aria-live="polite" region (MODE-05)', async () => {
		const { container } = render(ModeToggle);
		const live = container.querySelector('[aria-live="polite"]');
		expect(live).not.toBeNull();
		expect(live).toHaveClass('visually-hidden');

		const sw = page.getByRole('switch', { name: /Premium 3D mode/i });
		await sw.click();
		await expect.element(sw).toHaveAttribute('aria-checked', 'true');
		expect(live?.textContent?.trim()).toBe('Premium mode enabled');

		await sw.click();
		await expect.element(sw).toHaveAttribute('aria-checked', 'false');
		expect(live?.textContent?.trim()).toBe('Accessible mode enabled');
	});
});
