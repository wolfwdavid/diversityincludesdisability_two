// src/lib/premium/state/worldState.svelte.ts
// Runes wrapper over the PURE route→world map (./worldState). This is the ONLY place
// the premium subtree reads SvelteKit app state: `page` from $app/state and `base`
// from $app/paths are both already in the shared bundle and WebGL-free, so consuming
// them inside the lazy premium chunk adds zero accessible-bundle bytes (PREM-03).
// It also owns scroll progress for the scroll-eased camera (D-09/D-11): scrollY is
// cheap to read per frame, but maxScroll (scrollHeight - innerHeight) forces layout —
// it is CACHED and recomputed only on resize + route change, never per frame.
// NOTE: sibling import is RELATIVE — the premium fence forbids the aliased path.

import { tick } from 'svelte';
import { page } from '$app/state';
import { base } from '$app/paths';
import { configFor, normalizeRoute, type WorldConfig } from './worldState';

/** The authored world configuration for the CURRENT route (reactive via page). */
export function currentConfig(): WorldConfig {
	return configFor(normalizeRoute(page.url.pathname, base));
}

let scrollProgress = $state(0);

// Cached scroll range. Reading scrollHeight/innerHeight forces layout, so this is
// recomputed ONLY by recomputeMaxScroll (resize listener + route-change effect).
let maxScroll = 1;
let initialized = false;

function recomputeMaxScroll(): void {
	maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

/**
 * Wire the maxScroll cache invalidation exactly once (idempotent — repeated Premium
 * re-entry never double-subscribes, mirroring initMotion). Browser-only: call from
 * the premium subtree after mount, never during SSR/prerender.
 */
export function initWorldScroll(): void {
	if (initialized) return;
	initialized = true;

	recomputeMaxScroll();
	window.addEventListener('resize', recomputeMaxScroll);

	// Route change → the new page content lays out after navigation; measure after
	// the DOM flush (tick) so the cached range reflects the NEW document height.
	// (An $effect at module scope needs an explicit root — this module outlives
	// components. No raw frame callbacks here: all frame work goes through useTask.)
	$effect.root(() => {
		$effect(() => {
			void page.url.pathname;
			void tick().then(recomputeMaxScroll);
		});
	});
}

/**
 * Per-frame scroll sample (called from the camera rig's gated useTask): reads only
 * window.scrollY (cheap, no layout) and normalizes by the cached range, clamped 0..1.
 */
export function updateScroll(): void {
	scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
}

export function getScrollProgress(): number {
	return scrollProgress;
}
