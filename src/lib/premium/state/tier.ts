// src/lib/premium/state/tier.ts
// The two-tier device quality heuristic (D-08): 'low' → reduced particle counts /
// effects, 'full' → everything. Kept as a PURE signals-in → tier-out function so the
// whole policy is provable in the fast node project; detectTier() is the thin
// browser-only wrapper that gathers the real signals (exercised by E2E, never node).

export type Tier = 'full' | 'low';

export interface TierSignals {
	dpr: number;
	coarsePointer: boolean;
	deviceMemory?: number;
}

export function resolveTier(s: TierSignals): Tier {
	if (s.coarsePointer) return 'low'; // D-12: touch devices get the reduced tier
	if (s.deviceMemory !== undefined && s.deviceMemory <= 4) return 'low';
	return 'full';
}

/** Browser-only wrapper — reads live device signals. Never call during SSR/prerender. */
export function detectTier(): Tier {
	return resolveTier({
		dpr: window.devicePixelRatio ?? 1,
		coarsePointer: window.matchMedia('(pointer: coarse)').matches,
		deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory
	});
}
