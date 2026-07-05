import { describe, it, expect } from 'vitest';
import { engagements, testimonials, press } from './socialProof';
import { socialLinks } from './contact';

// CONT-03 no-fabrication invariant. Published social-proof items MUST carry a
// non-empty attribution; pending slots carry only a reason (no value); social
// links are pending(reason) or published(https url); and no placeholder/fabricated
// strings (lorem ipsum, "click here", fake trust numbers) may appear in the data.
describe('no-fabrication invariant (CONT-03)', () => {
	it('every published item has a non-empty attribution', () => {
		for (const s of engagements) if (s.status === 'published') expect(s.attribution).toBeTruthy();
		for (const s of testimonials) if (s.status === 'published') expect(s.attribution).toBeTruthy();
		for (const s of press) if (s.status === 'published') expect(s.attribution).toBeTruthy();
	});

	it('every pending slot has a reason and no value', () => {
		for (const s of [...engagements, ...testimonials, ...press]) {
			if (s.status === 'pending') {
				expect(s.reason.length).toBeGreaterThan(0);
				expect('attribution' in s).toBe(false);
			}
		}
	});

	it('social links are pending-with-reason or published-with-https-url', () => {
		for (const s of socialLinks) {
			const link = s.link;
			if (link.status === 'published') {
				expect(link.url).toMatch(/^https:\/\//);
			} else {
				expect(link.reason.length).toBeGreaterThan(0);
			}
		}
	});

	it('no fabricated/placeholder strings', () => {
		const blob = JSON.stringify([engagements, testimonials, press, socialLinks]);
		expect(blob).not.toMatch(/lorem ipsum/i);
		expect(blob).not.toMatch(/click here/i);
		expect(blob).not.toMatch(/placeholder/i);
		expect(blob).not.toMatch(/trusted by \d+/i);
		expect(blob).not.toMatch(/\d+\+?\s+(organizations|clients|companies)/i);
	});
});
