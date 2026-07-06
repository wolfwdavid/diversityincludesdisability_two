// src/lib/premium/state/tier.spec.ts
// Node-project spec for the PURE two-tier device heuristic (D-08). resolveTier is
// signals-in → tier-out with no DOM/globals, so the whole policy is provable here;
// the browser-only detectTier() wrapper is exercised by E2E, never in node.
// NOTE: sibling imports are RELATIVE — the premium fence forbids the aliased import
// path even inside src/lib/premium/.

import { describe, expect, it } from 'vitest';
import { resolveTier } from './tier';

describe('resolveTier (D-08 two-tier device heuristic)', () => {
	it('returns low for coarse-pointer (touch/mobile) devices regardless of other signals (D-12)', () => {
		expect(resolveTier({ dpr: 2, coarsePointer: true })).toBe('low');
	});

	it('returns low when deviceMemory is 4GB or less', () => {
		expect(resolveTier({ dpr: 1, coarsePointer: false, deviceMemory: 4 })).toBe('low');
	});

	it('returns full for a fine-pointer device with ample memory', () => {
		expect(resolveTier({ dpr: 2, coarsePointer: false, deviceMemory: 8 })).toBe('full');
	});

	it('returns full when deviceMemory is undefined (unknown memory is not a low signal)', () => {
		expect(resolveTier({ dpr: 1, coarsePointer: false })).toBe('full');
	});
});
