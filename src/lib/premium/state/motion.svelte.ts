// src/lib/premium/state/motion.svelte.ts
// The ONE runes motion authority for the premium layer (Research Pattern 3). It owns
// the three live signals (reduced-motion, tab visibility, coarse pointer) as
// module-level $state and exposes derived flags via getters, mirroring the house
// style of src/lib/mode/mode.svelte.ts. All policy lives in computeMotion (pure,
// node-tested) — this file only wires browser events to signals.
// NOTE: sibling import is RELATIVE — the premium fence forbids the aliased import
// path even inside src/lib/premium/.

import { computeMotion } from './motion-logic';

let reduced = $state(false);
let hidden = $state(false);
let touch = $state(false);

let initialized = false;

/**
 * Wire the live signal listeners exactly once (idempotent — a double init from
 * repeated Premium re-entry never double-subscribes). Browser-only: call from the
 * premium subtree after mount, never during SSR/prerender.
 */
export function initMotion(): void {
	if (initialized) return;
	initialized = true;

	// prefers-reduced-motion: honor live OS flips via the change listener (Pitfall 4 —
	// a stored 'premium' choice bypasses the resolver's PRM branch, so PREM-06 is
	// enforced here, in-canvas).
	const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
	reduced = mq.matches;
	mq.addEventListener('change', (e) => {
		reduced = e.matches;
	});

	// Tab visibility → deterministic pause signal for useTask `running` gates (PREM-04).
	hidden = document.hidden;
	document.addEventListener('visibilitychange', () => {
		hidden = document.hidden;
	});

	// Coarse pointer → no pointer parallax on touch devices (D-12).
	touch = window.matchMedia('(pointer: coarse)').matches;
}

export const motion = {
	get animating(): boolean {
		return computeMotion({ reduced, hidden, touch }).animating;
	},
	get parallax(): boolean {
		return computeMotion({ reduced, hidden, touch }).parallax;
	},
	get reduced(): boolean {
		return reduced;
	}
};
