import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hero from './Hero.svelte';
import { about, contact } from '$lib/content';

// CLIENT (chromium) project — real document. This spec pins the SECT-01/A11Y-03
// Home-hero contract: the lead intro copy comes from the $lib/content barrel
// (about.intro / site.tagline, never hard-coded), and the primary CTA is a real
// mailto: anchor to Eman's address whose visible/accessible name is the barrel's
// ctaLabel ("Let's Connect"). requireAssertions is on, so every case asserts.

describe('Hero.svelte (SECT-01, A11Y-03)', () => {
	it('renders the intro lead copy from the content barrel (about.intro)', async () => {
		render(Hero);
		await expect.element(page.getByText(about.intro)).toBeInTheDocument();
	});

	it('renders the primary CTA as a link with accessible name "Let\'s Connect"', async () => {
		render(Hero);
		const cta = page.getByRole('link', { name: /Let's Connect/i });
		await expect.element(cta).toBeInTheDocument();
		expect(cta.element().textContent?.trim()).toBe(contact.ctaLabel);
	});

	it('the CTA href is a mailto: link to emanrimawi@gmail.com with an encoded subject', async () => {
		render(Hero);
		const cta = page.getByRole('link', { name: /Let's Connect/i });
		const href = cta.element().getAttribute('href') ?? '';
		expect(href.startsWith(`mailto:${contact.email}`)).toBe(true);
		expect(href).toContain('subject=');
		// subject is URL-encoded (contact.mailtoSubject contains spaces + an ellipsis)
		expect(href).toContain(encodeURIComponent(contact.mailtoSubject));
	});
});
