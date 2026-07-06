import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import About from './About.svelte';
import { about } from '$lib/content';

// CLIENT (chromium) project. Pins the SECT-03 / CONT-03 contract for the About
// section: it renders every attributable `about.bio` paragraph from the barrel
// (no hard-coded copy), owns NO <h1> (the /about route owns the single h1), and —
// because `about.mission` is a PENDING slot — never renders a fabricated mission
// statement. The anti-fabrication guarantee is made visible by branching on
// `about.mission.status === 'published'` (which is false here).

describe('About.svelte (SECT-03 / CONT-03)', () => {
	it('renders each of the three barrel bio paragraphs as its own <p>', async () => {
		const { container } = render(About);
		const paras = container.querySelectorAll('p');
		expect(paras.length).toBe(about.bio.length);
		expect(about.bio.length).toBe(3);
	});

	it('renders the bilateral-leg-amputee bio fact from the barrel', async () => {
		render(About);
		await expect.element(page.getByText(/bilateral leg amputee/i)).toBeInTheDocument();
	});

	it('renders the New York Lawyers for the Public Interest bio fact', async () => {
		render(About);
		await expect
			.element(page.getByText(/New York Lawyers for the Public Interest/i))
			.toBeInTheDocument();
	});

	it('renders the adaptive-clothing-line bio fact', async () => {
		render(About);
		await expect.element(page.getByText(/adaptive clothing line/i)).toBeInTheDocument();
	});

	it('does NOT render a fabricated mission (about.mission is pending)', async () => {
		const { container } = render(About);
		// mission is a pending slot — the reason string must never surface as copy,
		// and no invented "our mission is…" sentence may appear.
		expect(about.mission.status).toBe('pending');
		expect(container.textContent ?? '').not.toMatch(/our mission is/i);
		if (about.mission.status === 'pending') {
			expect(container.textContent ?? '').not.toContain(about.mission.reason);
		}
	});

	it('owns no <h1> (the route owns the single page h1)', async () => {
		const { container } = render(About);
		expect(container.querySelector('h1')).toBeNull();
	});
});
