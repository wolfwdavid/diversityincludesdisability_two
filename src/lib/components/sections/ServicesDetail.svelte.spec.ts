import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ServicesDetail from './ServicesDetail.svelte';
import { services } from '$lib/content';

// CLIENT (chromium) project — real document. This spec pins the SECT-02 contract:
// the four real service pillars, sourced structurally from the $lib/content barrel
// (CONT-01, no hard-coded copy), each rendered as an <h2> heading with its summary.
// The component owns NO <h1> — the /services route owns the single page h1 (A11Y-02).
// requireAssertions is on, so every case asserts.

describe('ServicesDetail.svelte (SECT-02)', () => {
	it('renders exactly 4 level-2 headings — one per barrel service pillar', async () => {
		render(ServicesDetail);
		const headings = page.getByRole('heading', { level: 2 });
		expect((await headings.all()).length).toBe(services.length);
		expect(services.length).toBe(4);
	});

	it('renders all four real pillar titles from the barrel', async () => {
		render(ServicesDetail);
		await expect
			.element(page.getByRole('heading', { level: 2, name: 'Trainings & Facilitation' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 2, name: 'Disability Consulting' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 2, name: 'Modeling for Representation' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 2, name: 'Speaker & Panelist' }))
			.toBeInTheDocument();
	});

	it('renders each pillar summary from the barrel (structural, not duplicated copy)', async () => {
		render(ServicesDetail);
		// Assert one representative summary substring is present in the DOM.
		await expect
			.element(page.getByText(/Disability consulting to help organizations/i))
			.toBeInTheDocument();
	});

	it('exposes each pillar as an aria-labelledby region whose target is its own h2', async () => {
		const { container } = render(ServicesDetail);
		const regions = container.querySelectorAll('section[aria-labelledby]');
		expect(regions.length).toBe(services.length);
		for (const region of regions) {
			const id = region.getAttribute('aria-labelledby');
			expect(id).toBeTruthy();
			const label = container.querySelector(`#${CSS.escape(id as string)}`);
			expect(label?.tagName.toLowerCase()).toBe('h2');
		}
	});

	it('owns NO <h1> — the route owns the single page heading (A11Y-02)', async () => {
		const { container } = render(ServicesDetail);
		expect(container.querySelector('h1')).toBeNull();
	});
});
