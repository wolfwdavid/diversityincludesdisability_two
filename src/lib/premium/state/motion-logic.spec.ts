// src/lib/premium/state/motion-logic.spec.ts
// Full 8-row truth table for the PURE motion authority logic (PREM-04/PREM-06):
//   animating = !reduced && !hidden   (drift/morph tasks run only when true)
//   parallax  = !reduced && !touch    (pointer parallax additionally off on touch, D-12)
// reduced DOMINATES both flags — a prefers-reduced-motion user never gets motion,
// even with a stored 'premium' choice (Pitfall 4: the resolver will NOT protect you).
// Relative sibling import — the fence forbids the $lib/premium alias internally.

import { describe, expect, it } from 'vitest';
import { computeMotion } from './motion-logic';

describe('computeMotion (PREM-04/PREM-06 truth table)', () => {
	it('all-clear: animating and parallax both on', () => {
		expect(computeMotion({ reduced: false, hidden: false, touch: false })).toEqual({
			animating: true,
			parallax: true
		});
	});

	it('reduced alone kills both flags (PREM-06)', () => {
		expect(computeMotion({ reduced: true, hidden: false, touch: false })).toEqual({
			animating: false,
			parallax: false
		});
	});

	it('hidden tab pauses animation but leaves parallax logically available (PREM-04)', () => {
		expect(computeMotion({ reduced: false, hidden: true, touch: false })).toEqual({
			animating: false,
			parallax: true
		});
	});

	it('touch keeps animation but disables parallax (D-12)', () => {
		expect(computeMotion({ reduced: false, hidden: false, touch: true })).toEqual({
			animating: true,
			parallax: false
		});
	});

	it('hidden + touch: nothing animates, no parallax', () => {
		expect(computeMotion({ reduced: false, hidden: true, touch: true })).toEqual({
			animating: false,
			parallax: false
		});
	});

	it('reduced + hidden: reduced dominates — both off', () => {
		expect(computeMotion({ reduced: true, hidden: true, touch: false })).toEqual({
			animating: false,
			parallax: false
		});
	});

	it('reduced + touch: reduced dominates — both off', () => {
		expect(computeMotion({ reduced: true, hidden: false, touch: true })).toEqual({
			animating: false,
			parallax: false
		});
	});

	it('all signals set: both off', () => {
		expect(computeMotion({ reduced: true, hidden: true, touch: true })).toEqual({
			animating: false,
			parallax: false
		});
	});
});
