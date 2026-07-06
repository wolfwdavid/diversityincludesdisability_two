// src/lib/premium/state/worldState.ts
// PURE route→world configuration map (PREM-02, D-04): ONE evolving world — each
// route is a CONFIGURATION of the same continuous scene, never a new scene. This
// module has zero SvelteKit runtime imports so the whole map + normalizer is
// provable in the fast node project; the runes wrapper that reads the app-state
// page and the app-paths base arrives in 05-03.

export interface WorldConfig {
	camera: readonly [number, number, number];
	spread: number; // cluster dispersion multiplier
	glow: number; // emissive/accent intensity multiplier
}

export const WORLD_CONFIGS: Record<string, WorldConfig> = {
	'/': { camera: [0, 1.5, 8], spread: 1.0, glow: 1.0 }, // immersive hero (D-13)
	'/services': { camera: [3, 2, 10], spread: 1.6, glow: 0.8 },
	'/about': { camera: [-2, 1, 9], spread: 0.7, glow: 0.9 },
	'/contact': { camera: [0, 3, 12], spread: 1.2, glow: 1.1 },
	'/accessibility': { camera: [0, 2, 14], spread: 0.2, glow: 0.15 } // the quiet room (D-14)
};

// Pitfall 8: page.url.pathname arrives as '/<base>/services/' (trailingSlash:'always',
// base = '' in dev / '/diversityincludesdisability_two' in preview+prod) — strip both
// before the config lookup or every page silently gets the hero world.
export function normalizeRoute(pathname: string, base: string): string {
	let p = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	if (!p.startsWith('/')) p = '/' + p;
	if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
	return p;
}

export function configFor(path: string): WorldConfig {
	return WORLD_CONFIGS[path] ?? WORLD_CONFIGS['/'];
}
