// src/lib/content/index.ts
// THE single content surface. Both the Accessible and Premium renderers import from here
// (`import { services, about } from '$lib/content'`) — never from a mode-specific copy.
// This is what makes content parity (CONT-01/02) a structural property: there is no second
// place to import copy from, so a string can never live in only one mode.
export * from './types';
export { site, nav, footer } from './site';
export { services } from './services';
export { about } from './about';
export { contact, socialLinks } from './contact';
export { engagements, testimonials, press } from './socialProof';
export { seo } from './seo';
