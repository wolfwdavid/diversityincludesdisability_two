<script lang="ts">
	// Home hero (SECT-01): the site's lead voice + the primary "Let's Connect" CTA.
	// Text/CSS only — no image dependency (RESEARCH Open Q#1) so the accessible baseline
	// ships zero non-essential bytes. All copy comes from the $lib/content barrel
	// (CONT-01/02) — nothing hard-coded. This component hosts the page <h1> (it is the
	// lead); +page.svelte adds no second h1, keeping exactly one h1 for the route (A11Y-02).
	// It builds only a `mailto:` string, so it MUST NOT import resolve from $app/paths
	// (an unused import would fail the no-unused-vars eslint gate — 04-06).
	import { about, contact, site } from '$lib/content';

	const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}`;
</script>

<section class="hero" aria-labelledby="hero-h">
	<h1 id="hero-h">{site.name}</h1>
	<p class="lead">{about.intro}</p>
	<a class="cta" href={mailto}>{contact.ctaLabel}</a>
</section>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
		max-width: 65ch;
	}
	.hero h1 {
		font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);
		line-height: 1.15;
		margin: 0;
		color: var(--color-heading);
	}
	.lead {
		font-size: clamp(1.1rem, 1rem + 0.5vw, 1.375rem);
		margin: 0;
		color: var(--color-text);
	}
	.cta {
		background: var(--color-accent);
		color: var(--did-ink);
		border: 2px solid var(--color-accent-border);
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		text-decoration: none;
		display: inline-block;
		font-weight: 600;
	}
	.cta:hover {
		text-decoration: underline;
	}
</style>
