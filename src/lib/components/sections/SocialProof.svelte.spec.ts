import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SocialProof from './SocialProof.svelte';
import { engagements, testimonials, press } from '$lib/content';

// CLIENT (chromium) project. Pins the SECT-04 / CONT-03 contract: SocialProof
// branches on `Slot<T>.status`. It renders the ONE published engagement (Eman's
// disability-equity training for the Office of the Manhattan Borough President /
// Mark Levine) with its attribution, and it renders the all-pending testimonials
// and press as an explicit `role="note"` "coming soon" marker — NEVER a fabricated
// testimonial, author, quote, or client logo.

describe('SocialProof.svelte (SECT-04 / CONT-03)', () => {
	it('renders the published engagement title from the barrel', async () => {
		render(SocialProof);
		await expect
			.element(page.getByText(/Disability equity & inclusion training/i))
			.toBeInTheDocument();
	});

	it('renders the Manhattan Borough President partner attribution', async () => {
		render(SocialProof);
		await expect
			.element(page.getByText(/Office of the Manhattan Borough President/i))
			.toBeInTheDocument();
	});

	it('renders the engagement attribution string from the barrel', async () => {
		const published = engagements.find((e) => e.status === 'published');
		expect(published).toBeDefined();
		render(SocialProof);
		if (published && published.status === 'published') {
			await expect.element(page.getByText(published.attribution)).toBeInTheDocument();
		}
	});

	it('shows a role="note" "coming soon" marker for pending testimonials', async () => {
		expect(testimonials.every((t) => t.status === 'pending')).toBe(true);
		const { container } = render(SocialProof);
		const notes = container.querySelectorAll('[role="note"]');
		expect(notes.length).toBeGreaterThanOrEqual(1);
		expect(container.textContent ?? '').toMatch(/coming soon/i);
	});

	it('shows a pending marker for press because all press is pending', async () => {
		expect(press.every((p) => p.status === 'pending')).toBe(true);
		const { container } = render(SocialProof);
		// two pending domains (testimonials + press) → at least two notes
		expect(container.querySelectorAll('[role="note"]').length).toBeGreaterThanOrEqual(2);
	});

	it('does NOT render any pending slot reason string as user copy (no leakage)', async () => {
		const { container } = render(SocialProof);
		const text = container.textContent ?? '';
		for (const slot of [...testimonials, ...press]) {
			if (slot.status === 'pending') {
				expect(text).not.toContain(slot.reason);
			}
		}
	});

	it('owns no <h1> (the route owns the single page h1)', async () => {
		const { container } = render(SocialProof);
		expect(container.querySelector('h1')).toBeNull();
	});
});
