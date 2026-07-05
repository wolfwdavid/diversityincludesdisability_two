import { page } from 'vitest/browser';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Contact from './Contact.svelte';
import { contact, socialLinks } from '$lib/content';

// CLIENT (chromium) project — real document. This spec pins the SECT-05/A11Y-03
// Contact contract: a prominent mailto: "Let's Connect" CTA built from the barrel,
// and all four social platforms listed with their descriptive barrel labels. Every
// social link is currently PENDING, so each renders as PLAIN TEXT — never a dead
// href="#" anchor and never a real <a>. The ONLY link in the section is the mailto
// CTA. requireAssertions is on, so every case asserts.

describe('Contact.svelte (SECT-05, A11Y-03, CONT-03)', () => {
	it('renders the primary CTA as a link with accessible name "Let\'s Connect"', async () => {
		render(Contact);
		const cta = page.getByRole('link', { name: /Let's Connect/i });
		await expect.element(cta).toBeInTheDocument();
		expect(cta.element().textContent?.trim()).toBe(contact.ctaLabel);
	});

	it('the CTA href is a mailto: link to emanrimawi@gmail.com with an encoded subject', async () => {
		render(Contact);
		const cta = page.getByRole('link', { name: /Let's Connect/i });
		const href = cta.element().getAttribute('href') ?? '';
		expect(href.startsWith(`mailto:${contact.email}`)).toBe(true);
		expect(href).toContain('subject=');
		expect(href).toContain(encodeURIComponent(contact.mailtoSubject));
	});

	it('lists all four social platform labels from the barrel as visible text', async () => {
		render(Contact);
		for (const s of socialLinks) {
			await expect.element(page.getByText(s.label)).toBeInTheDocument();
		}
	});

	it('renders NO dead href="#" anchor for pending social links', async () => {
		const { container } = render(Contact);
		expect(container.querySelector('a[href="#"]')).toBeNull();
	});

	it('all four social links are pending, so the mailto CTA is the ONLY anchor', async () => {
		const { container } = render(Contact);
		const anchors = Array.from(container.querySelectorAll('a'));
		expect(anchors).toHaveLength(1);
		expect(anchors[0].getAttribute('href')?.startsWith('mailto:')).toBe(true);
	});

	it('uses descriptive link text (no "click here")', async () => {
		const { container } = render(Contact);
		expect(container.textContent?.toLowerCase()).not.toContain('click here');
	});
});
