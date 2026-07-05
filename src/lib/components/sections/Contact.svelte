<script lang="ts">
	// SECT-05 Contact section. A prominent mailto: "Let's Connect" CTA and the four
	// social platforms, all built from the $lib/content barrel (CONT-01). Each social
	// link branches on its Slot status (RESEARCH Pattern 5): a PUBLISHED link renders a
	// real <a href> with its descriptive barrel label (A11Y-03); a PENDING link renders
	// the label as PLAIN TEXT — never a dead placeholder anchor and never surfacing the
	// internal `reason`. All four are currently pending (CONT-03), so all render as text.
	import { contact, socialLinks } from '$lib/content';

	// RESEARCH Pattern 6: a mailto CTA with a URL-encoded subject.
	const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}`;
</script>

<section aria-labelledby="contact-h">
	<h2 id="contact-h">Contact</h2>

	<a class="cta" href={mailto}>{contact.ctaLabel}</a>

	<ul class="social">
		{#each socialLinks as s (s.platform)}
			<li>
				{#if s.link.status === 'published'}
					<!-- Published social handles are EXTERNAL absolute https:// profile URLs
					     (SocialLink.link.url), never internal base-aware routes — resolve() does
					     not apply. rel/target hardened for cross-origin nav. -->
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={s.link.url} rel="noopener noreferrer external" target="_blank">{s.label}</a>
				{:else}
					<span class="pending">{s.label}</span>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	/* CTA reuses the accent tokens (mirrors the Hero primary action). --color-* only,
	   no raw hex, no non-essential motion. */
	.cta {
		display: inline-block;
		padding: 0.625rem 1.25rem;
		background: var(--color-accent);
		color: var(--did-ink);
		border: 2px solid var(--color-accent-border);
		border-radius: 0.375rem;
		text-decoration: none;
		font-weight: 700;
	}
	.cta:hover {
		text-decoration: underline;
	}

	.social {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
	}
	.social li {
		margin: 0.25rem 0;
	}
	.social a {
		color: var(--color-link);
	}
	/* Pending handles read as plain text — muted but still on the accessible palette. */
	.pending {
		color: var(--color-text);
	}
</style>
