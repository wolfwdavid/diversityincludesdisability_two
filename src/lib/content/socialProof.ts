// src/lib/content/socialProof.ts
// Real social-proof (SECT-04). The ONE published engagement is Eman's disability-equity
// training for the Office of the Manhattan Borough President (Mark Levine), confirmed on
// the live site. Testimonials and press are honest `pending` slots — NOT fabricated. Do
// NOT invent testimonials, client logos, press items, or engagement counts (CONT-03).
import type { Slot, Engagement, Testimonial, Press } from './types';

// Typed as the wide Slot<T> union (not `as const`) so consumers — and the CONT-03
// invariant spec — can branch on `status` for BOTH the published and pending variants.
// A narrow `as const` literal would collapse each array to a single variant and make
// the other branch a "no overlap" type error for every future renderer. Immutability
// is still guaranteed: every field in these types is `readonly`.
export const engagements: readonly Slot<Engagement>[] = [
	{
		status: 'published',
		title: 'Disability equity & inclusion training',
		partner: 'Office of the Manhattan Borough President (Mark Levine)',
		attribution: 'Delivered by DID; documented on diversityincludesdisability.org'
	}
];

export const testimonials: readonly Slot<Testimonial>[] = [
	{ status: 'pending', reason: 'Awaiting attributable testimonial from Eman (v2 SOCL-01)' }
];

export const press: readonly Slot<Press>[] = [
	{ status: 'pending', reason: 'Awaiting attributable press/logo material (v2 SOCL-02)' }
];
