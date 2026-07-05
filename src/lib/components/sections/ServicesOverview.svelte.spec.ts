import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ServicesOverview from './ServicesOverview.svelte';
import { services } from '$lib/content';

// CLIENT (chromium) project. This spec pins the SECT-01 home services-overview
// contract: all four real service pillars are listed (titles from the $lib/content
// barrel, never hard-coded), the region is headed by an <h2> (not a second h1 —
// A11Y-02), and there is a DESCRIPTIVE link to the full /services page (not "click
// here"). $app/paths is left real (base='' in test, so resolve('/services') === '/services').
// requireAssertions is on, so every case asserts.

describe('ServicesOverview.svelte (SECT-01, A11Y-02/03)', () => {
	it('lists all four service pillar titles from the content barrel', async () => {
		render(ServicesOverview);
		for (const s of services) {
			await expect.element(page.getByRole('heading', { name: s.title })).toBeInTheDocument();
		}
		expect(services.length).toBe(4);
	});

	it('heads the region with an <h2> and contains no <h1> (single-h1 page contract)', async () => {
		const { container } = render(ServicesOverview);
		expect(container.querySelector('h2')).not.toBeNull();
		expect(container.querySelector('h1')).toBeNull();
	});

	it('renders a descriptive link to the full Services page (href contains /services, not "click here")', async () => {
		render(ServicesOverview);
		const link = page.getByRole('link', { name: /see all services/i });
		await expect.element(link).toBeInTheDocument();
		const href = link.element().getAttribute('href') ?? '';
		expect(href).toContain('/services');
		expect(link.element().textContent?.toLowerCase()).not.toContain('click here');
	});
});
