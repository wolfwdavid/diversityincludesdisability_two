import { describe, it, expect } from 'vitest';
import { resolveMode, type ModeSignals } from './resolve';
import { STORAGE_KEY } from './constants';

// MODE-02/03/07 precedence truth table. resolveMode is the single precedence
// source of truth; its order is LOCKED: explicit stored choice > reduced-motion
// > no-WebGL > premium default. Each row below pins one rung of that ladder so
// downstream artifacts (runes store, inline no-flash script) cannot drift.
type Row = { name: string; signals: ModeSignals; expected: 'premium' | 'accessible' };

const table: readonly Row[] = [
	{
		name: "stored 'premium' wins over reduce+no-webgl (MODE-02 precedence)",
		signals: { stored: 'premium', prefersReducedMotion: true, webglAvailable: false },
		expected: 'premium'
	},
	{
		name: "stored 'accessible' wins over capable+no-preference (MODE-02 precedence)",
		signals: { stored: 'accessible', prefersReducedMotion: false, webglAvailable: true },
		expected: 'accessible'
	},
	{
		name: 'no stored + prefers-reduced-motion → accessible (MODE-03)',
		signals: { stored: null, prefersReducedMotion: true, webglAvailable: true },
		expected: 'accessible'
	},
	{
		name: 'no stored + WebGL unavailable → accessible (MODE-07)',
		signals: { stored: null, prefersReducedMotion: false, webglAvailable: false },
		expected: 'accessible'
	},
	{
		name: 'no stored + capable + no preference → premium (LOCKED default)',
		signals: { stored: null, prefersReducedMotion: false, webglAvailable: true },
		expected: 'premium'
	},
	{
		name: 'garbage stored value is ignored, falls through to premium default',
		signals: { stored: 'garbage', prefersReducedMotion: false, webglAvailable: true },
		expected: 'premium'
	}
];

describe('resolveMode precedence truth table (MODE-02/03/07)', () => {
	for (const row of table) {
		it(row.name, () => {
			expect(resolveMode(row.signals)).toBe(row.expected);
		});
	}
});

describe('shared constants surface', () => {
	it('STORAGE_KEY is the namespaced string did2:mode', () => {
		expect(STORAGE_KEY).toBe('did2:mode');
	});
});
