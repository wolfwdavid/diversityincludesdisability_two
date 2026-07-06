// src/lib/premium/state/motion-logic.ts
// PURE motion truth table (PREM-04/PREM-06) — the single place the gating policy is
// written down. The runes wrapper (motion.svelte.ts) delegates here so this logic is
// provable in node without any DOM:
//   animating = !reduced && !hidden   → useTask `running` gates (drift/morph)
//   parallax  = !reduced && !touch    → pointer parallax additionally off on touch (D-12)
// reduced dominates BOTH flags: a prefers-reduced-motion user gets a still, composed
// scene even when they explicitly chose Premium (Pitfall 4 — the mode resolver's PRM
// branch is bypassed by a stored choice, so this MUST hold in-canvas).

export interface MotionSignals {
	reduced: boolean;
	hidden: boolean;
	touch: boolean;
}

export interface MotionFlags {
	animating: boolean;
	parallax: boolean;
}

export function computeMotion(s: MotionSignals): MotionFlags {
	return { animating: !s.reduced && !s.hidden, parallax: !s.reduced && !s.touch };
}
