// src/lib/content/contact.ts
// Contact details (SECT-05). The email + subject are HIGH-confidence, captured verbatim
// from the live site. The four social links are structurally present but ALL pending:
// the Wix icons point at generic placeholder accounts, so the real handles need Eman's
// confirmation before they can be published (CONT-03; research Pitfall 2). Each candidate
// URL lives in the `reason` string — a candidate is not a published link.
import type { SocialLink } from './types';

export const contact = {
	email: 'emanrimawi@gmail.com',
	mailtoSubject: "Let's Connect...",
	ctaLabel: "Let's Connect"
} as const;

// All four platforms are structurally present (SECT-05) but unpublished until Eman confirms
// the real handles. Candidates from research are noted in `reason`, NOT shipped as live URLs.
// Typed as the `SocialLink[]` union (not `as const`) so each `link` keeps its full
// Slot<{url}> breadth — a consumer can branch on published(url) vs pending(reason) without
// a "no overlap" type error. Every SocialLink field is `readonly`, so it stays immutable.
export const socialLinks: readonly SocialLink[] = [
	{
		platform: 'Facebook',
		label: 'Diversity Includes Disability on Facebook',
		link: {
			status: 'pending',
			reason: 'Confirm real handle with Eman. Candidate: facebook.com/emanrimawiandtheworld'
		}
	},
	{
		platform: 'X (Twitter)',
		label: 'Diversity Includes Disability on X',
		link: { status: 'pending', reason: 'No reliable handle found; confirm with Eman' }
	},
	{
		platform: 'LinkedIn',
		label: 'Eman Rimawi on LinkedIn',
		link: {
			status: 'pending',
			reason: 'Confirm handle with Eman. Candidate: linkedin.com/in/erimawi'
		}
	},
	{
		platform: 'Instagram',
		label: 'Eman Rimawi on Instagram',
		link: {
			status: 'pending',
			reason: 'Confirm handle with Eman. Candidate: instagram.com/the_eman_meow_rimawi_show'
		}
	}
];
