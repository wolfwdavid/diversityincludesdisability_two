// DID design tokens — SINGLE typed source of truth.
// Every hex here is mirrored verbatim in tokens.css (:root) and gated by
// scripts/check-contrast.mjs (WCAG 2.2 AA, A11Y-06). Do not edit a value here
// without mirroring it in tokens.css and re-running the contrast gate.
export const palette = {
	blue900: '#0b2a4a', // body/link/heading text on white; focus ring
	orange500: '#e8730c', // large-text / background accent; button background (with ink text)
	orangeDeep: '#c85f08', // orange UI borders/accents on white
	ink: '#12181f', // body text on white; text on an orange background
	white: '#ffffff',
	night: '#071c33' // premium scrim core; deepest night surface behind text panels (D-02, Pitfall 6)
} as const;

// Semantic tokens (map roles → palette keys) — consumed by CSS + components
export const semantic = {
	text: palette.ink,
	link: palette.blue900,
	heading: palette.blue900,
	accent: palette.orange500,
	accentBorder: palette.orangeDeep,
	focusRing: palette.blue900,
	surface: palette.white,
	// Premium dark-skin roles (Phase 5, D-02/D-16) — light-on-dark application of the same palette
	textOnDark: palette.white,
	linkOnDark: palette.orange500,
	headingOnDark: palette.white,
	accentBorderOnDark: palette.orangeDeep,
	focusRingOnDark: palette.white,
	surfaceDark: palette.blue900,
	scrim: palette.night
} as const;
