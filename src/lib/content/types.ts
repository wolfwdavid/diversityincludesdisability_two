// src/lib/content/types.ts
// Shared content types. The Slot<T> union is the CONT-03 anti-fabrication guarantee:
// a published item is `{status:'published'} & T` (so required fields like `attribution`
// are mandatory), a pending item is only `{status:'pending', reason}` (carries no value).
export type ContentPending = { readonly status: 'pending'; readonly reason: string };
export type Published<T> = { readonly status: 'published' } & T;
/** Either real, attributable content OR an explicit pending marker. Never a bare value. */
export type Slot<T> = Published<T> | ContentPending;

export type Service = { readonly id: string; readonly title: string; readonly summary: string };
export type Testimonial = {
	readonly quote: string;
	readonly author: string;
	readonly attribution: string;
};
export type Engagement = {
	readonly title: string;
	readonly partner: string;
	readonly attribution: string;
};
export type Press = {
	readonly title: string;
	readonly source: string;
	readonly attribution: string;
};
export type SocialLink = {
	readonly platform: string;
	readonly label: string;
	readonly link: Slot<{ readonly url: string }>;
};
export type NavItem = { readonly route: string; readonly label: string };
export type PageMeta = {
	readonly title: string;
	readonly description: string;
	readonly ogImage?: string;
};
export type Mission = { readonly statement: string };
