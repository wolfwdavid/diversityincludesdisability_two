// src/lib/content/seo.ts
// Per-route SEO metadata. Keyed by nav route ('/' -> home, else route without the
// leading slash). Titles are <=60 chars; descriptions sit in the 50..160 snippet band.
// Baked into static HTML by adapter-static prerender; consumed via <svelte:head>. No head library.
import type { PageMeta } from './types';

export const seo = {
	home: {
		title: 'Diversity Includes Disability',
		description:
			'Intersectional disability equity trainings, consulting, modeling, and speaking with Eman Rimawi.'
	},
	about: {
		title: 'About Eman Rimawi | Diversity Includes Disability',
		description:
			'Meet Eman Rimawi, founder of Diversity Includes Disability — disability-equity educator, consultant, model, and speaker.'
	},
	services: {
		title: 'Services | Diversity Includes Disability',
		description:
			'Disability equity trainings and facilitation, consulting, modeling for representation, and speaking and panels.'
	},
	contact: {
		title: 'Contact | Diversity Includes Disability',
		description:
			'Get in touch with Diversity Includes Disability — email Eman Rimawi to book trainings, consulting, modeling, or speaking.'
	},
	accessibility: {
		title: 'Accessibility Statement | Diversity Includes Disability',
		description:
			'How Diversity Includes Disability builds an accessible, WCAG 2.2 AA website that is a genuine peer to its premium experience.'
	}
} as const satisfies Record<string, PageMeta>;
