import { describe, it, expect } from 'vitest';
import { nav } from './site';

// CONT-02 nav-parity invariant. The single nav model must expose every required
// route, must NOT port the Wix "Log In" item (out of scope), and every item must
// have a non-empty route and label.
describe('nav-parity invariant (CONT-02)', () => {
	it('exposes every required route', () => {
		const routes = nav.map((n) => n.route);
		expect(routes).toEqual(
			expect.arrayContaining(['/', '/services', '/about', '/contact', '/accessibility'])
		);
	});

	it('never ports the Wix Log In item', () => {
		expect(nav.some((n) => /log\s?in/i.test(n.label))).toBe(false);
	});

	it('every item has a route and label', () => {
		for (const n of nav) {
			expect(n.route.length).toBeGreaterThan(0);
			expect(n.label.length).toBeGreaterThan(0);
		}
	});
});
