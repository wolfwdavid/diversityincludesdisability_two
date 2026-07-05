// src/lib/content/site.ts
// Org identity + the primary navigation model. This is the single edit surface for
// the org name, tagline, nav, and footer (CONT-01). Both modes render from `nav`,
// so no page can be reachable in only one mode (CONT-02).
import type { NavItem } from './types';

export const site = {
	name: 'Diversity Includes Disability',
	founder: 'Eman Rimawi', // homepage display name
	legalName: 'Eman Rimawi-Doster', // used in the copyright line
	tagline: 'My name is Eman Rimawi' // first-person homepage intro voice
} as const;

// Primary navigation — the spine BOTH modes render from (CONT-02). Route keys only;
// components resolve them with resolve() from $app/paths. The Wix "Log In" item is
// intentionally omitted (out of scope). The Accessibility Statement is in the primary nav (SECT-06).
export const nav = [
	{ route: '/', label: 'Home' },
	{ route: '/services', label: 'Services' },
	{ route: '/about', label: 'About' },
	{ route: '/contact', label: 'Contact' },
	{ route: '/accessibility', label: 'Accessibility Statement' }
] as const satisfies readonly NavItem[];

export const footer = {
	// Computed at build/render time so the year never goes stale (research Pitfall 5).
	copyright: `© ${new Date().getFullYear()} Eman Rimawi-Doster`
} as const;
