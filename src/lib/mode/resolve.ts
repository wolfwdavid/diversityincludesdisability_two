// src/lib/mode/resolve.ts
// The SINGLE precedence source of truth for the mode system: a pure function that
// takes the three decision signals and returns the resolved Mode. Keeping it pure
// (signals in, mode out — no DOM, no globals) makes the LOCKED precedence provable
// in sub-second node unit tests, and every downstream artifact mirrors this order.

import { STORAGE_KEY, type Mode } from './constants';

export { STORAGE_KEY, type Mode };

export interface ModeSignals {
	/** Raw localStorage value (may be null or junk — never trusted blindly). */
	stored: string | null;
	prefersReducedMotion: boolean;
	webglAvailable: boolean;
}

/**
 * Resolve the active mode from the decision signals.
 *
 * Precedence (LOCKED): explicit stored choice > reduced-motion > no-WebGL > premium default.
 */
export function resolveMode(s: ModeSignals): Mode {
	if (s.stored === 'premium' || s.stored === 'accessible') return s.stored; // stored ALWAYS wins (MODE-02)
	if (s.prefersReducedMotion) return 'accessible'; // MODE-03
	if (!s.webglAvailable) return 'accessible'; // MODE-07
	return 'premium'; // LOCKED default (Open Q#1: capable + no-preference + no-stored → premium)
}

/**
 * Cheap runtime WebGL capability probe. Touches `document`/`window`, so it is
 * browser-only (exercised in Plan 02, never in the node truth-table spec). Returns
 * false on any failure rather than throwing, so a hostile/headless context degrades
 * safely to Accessible mode.
 */
export function hasWebGL(): boolean {
	try {
		const c = document.createElement('canvas');
		return !!(
			window.WebGLRenderingContext &&
			(c.getContext('webgl') || c.getContext('experimental-webgl'))
		);
	} catch {
		return false;
	}
}
