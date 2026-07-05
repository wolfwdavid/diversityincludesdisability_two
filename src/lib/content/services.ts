// src/lib/content/services.ts
// The four real service pillars (SECT-02), sourced verbatim from the live DID site.
// Titles are confirmed real; summaries are truthful restatements (no invented metrics
// or claims — CONT-03).
import type { Service } from './types';

export const services = [
	{
		id: 'trainings',
		title: 'Trainings & Facilitation',
		summary: 'Intersectional Disability Equity and Inclusion trainings and facilitation.'
	},
	{
		id: 'consulting',
		title: 'Disability Consulting',
		summary: 'Disability consulting to help organizations build accessible, inclusive practices.'
	},
	{
		id: 'modeling',
		title: 'Modeling for Representation',
		summary: 'Modeling for representation that centers disabled people in media and marketing.'
	},
	{
		id: 'speaking',
		title: 'Speaker & Panelist',
		summary: 'Speaking and panels on disability equity, accessibility, and lived experience.'
	}
] as const satisfies readonly Service[];
