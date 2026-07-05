// src/lib/content/about.ts
// Bio blocks are an ATTRIBUTABLE scaffold from public sources (LinkedIn /in/erimawi/, NYLPI,
// Living with Amplitude, NYC DOT Equity in Motion). Confirm/replace with Eman's own on-site
// wording in the human-capture checkpoint (Task 3). Facts only — no invented claims.
// SECURITY: never add credentials, EIN, phone number, or a personal address here.
import type { Slot, Mission } from './types';

// Explicitly TYPED (not `as const`) so `mission` stays the wide `Slot<Mission>` union —
// consumers branch on `status` for BOTH arms, the pending marker renders nothing, and no
// mission is ever fabricated (CONT-03). Mirrors the socialProof Slot-union typing; an
// `as const` here collapses `about.mission` to its pending literal and makes every
// `status === 'published'` guard an "unintentional comparison" type error. Runtime value
// is unchanged (mission is still pending).
export const about: {
	readonly displayName: string;
	readonly legalName: string;
	readonly intro: string;
	readonly bio: readonly string[];
	readonly mission: Slot<Mission>;
} = {
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
};
