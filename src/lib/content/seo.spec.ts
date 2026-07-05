import { describe, it, expect } from 'vitest';
import { seo } from './seo';

// SEO field-bounds invariant. Every page has meta; titles fit the SERP ceiling
// (1..60 chars) and descriptions sit in the effective snippet band (50..160 chars).
describe('SEO field-bounds invariant', () => {
	it('has meta for every page', () => {
		expect(Object.keys(seo)).toEqual(
			expect.arrayContaining(['home', 'about', 'services', 'contact', 'accessibility'])
		);
	});

	it('titles are 1..60 chars', () => {
		for (const m of Object.values(seo)) {
			expect(m.title.length).toBeGreaterThan(0);
			expect(m.title.length).toBeLessThanOrEqual(60);
		}
	});

	it('descriptions are 50..160 chars', () => {
		for (const m of Object.values(seo)) {
			expect(m.description.length).toBeGreaterThanOrEqual(50);
			expect(m.description.length).toBeLessThanOrEqual(160);
		}
	});
});
