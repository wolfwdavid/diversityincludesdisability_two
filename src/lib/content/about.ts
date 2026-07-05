// src/lib/content/about.ts
// Bio blocks are an ATTRIBUTABLE scaffold from public sources (LinkedIn /in/erimawi/, NYLPI,
// Living with Amplitude, NYC DOT Equity in Motion). Confirm/replace with Eman's own on-site
// wording in the human-capture checkpoint (Task 3). Facts only — no invented claims.
// SECURITY: never add credentials, EIN, phone number, or a personal address here.
import type { Slot, Mission } from './types';

export const about = {
	displayName: 'Eman Rimawi',
	legalName: 'Eman Rimawi-Doster',
	intro: 'My name is Eman Rimawi',
	bio: [
		'Eman Rimawi-Doster is a Black, Native American and Palestinian New Yorker and a bilateral leg amputee.',
		'A spoken-word artist, educator, and organizer, she became a full-time disability advocate at New York Lawyers for the Public Interest, known for accessible-transit, voting-rights, and health-equity work.',
		'She founded Diversity Includes Disability as a disability-equity consulting practice, has consulted for comics publishers, speaks at conferences, and launched an adaptive clothing line.'
	],
	mission: {
		status: 'pending',
		reason: "Capture Eman's own mission wording from the live site during the human-capture checkpoint"
	}
} as const satisfies {
	displayName: string;
	legalName: string;
	intro: string;
	bio: readonly string[];
	mission: Slot<Mission>;
};
