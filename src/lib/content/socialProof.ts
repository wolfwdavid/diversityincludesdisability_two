// src/lib/content/socialProof.ts
// Real social-proof (SECT-04). The ONE published engagement is Eman's disability-equity
// training for the Office of the Manhattan Borough President (Mark Levine), confirmed on
// the live site. Testimonials and press are honest `pending` slots — NOT fabricated. Do
// NOT invent testimonials, client logos, press items, or engagement counts (CONT-03).
import type { Slot, Engagement, Testimonial, Press } from './types';

export const engagements = [
	{
		status: 'published',
		title: 'Disability equity & inclusion training',
		partner: 'Office of the Manhattan Borough President (Mark Levine)',
		attribution: 'Delivered by DID; documented on diversityincludesdisability.org'
	}
] as const satisfies readonly Slot<Engagement>[];

export const testimonials = [
	{ status: 'pending', reason: 'Awaiting attributable testimonial from Eman (v2 SOCL-01)' }
] as const satisfies readonly Slot<Testimonial>[];

export const press = [
	{ status: 'pending', reason: 'Awaiting attributable press/logo material (v2 SOCL-02)' }
] as const satisfies readonly Slot<Press>[];
