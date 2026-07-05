import { describe, it, expect } from 'vitest';
// barrel = the single content surface both modes import (CONT-01/02)
import * as content from './index';

// CONT-01/02 single-surface + section-completeness parity gate. The barrel is the
// ONE content import surface both modes consume; every required section must be
// re-exported, every nav route must map to a seo section, and the whole surface
// must be free of fabricated strings.
describe('single-surface + parity gate (CONT-01/02)', () => {
	it('barrel re-exports every content section', () => {
		const keys = [
			'site',
			'nav',
			'services',
			'about',
			'contact',
			'socialLinks',
			'engagements',
			'testimonials',
			'press',
			'seo'
		];
		for (const key of keys) {
			expect(content[key as keyof typeof content]).toBeDefined();
		}
	});

	it('every nav route maps to a section (parity/completeness)', () => {
		for (const item of content.nav) {
			const key = item.route === '/' ? 'home' : item.route.replace(/^\//, '');
			expect(content.seo[key as keyof typeof content.seo]).toBeDefined();
		}
	});

	it('the whole content surface has no fabricated strings', () => {
		const blob = JSON.stringify(content);
		expect(blob).not.toMatch(/lorem ipsum/i);
		expect(blob).not.toMatch(/click here/i);
		expect(blob).not.toMatch(/placeholder/i);
		expect(blob).not.toMatch(/trusted by \d+/i);
		expect(blob).not.toMatch(/\d+\+?\s+(organizations|clients|companies)/i);
	});
});
