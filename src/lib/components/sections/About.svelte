<script lang="ts">
	// SECT-03 / CONT-03. Renders Eman Rimawi's attributable bio paragraphs from the
	// single content barrel — no hard-coded copy. The route owns the page <h1>; this
	// section starts at <h2>. `about.mission` is a PENDING slot, so the mission arm
	// only renders when it is `published` — the anti-fabrication guarantee made visible.
	import { about } from '$lib/content';
</script>

<section aria-labelledby="bio-h">
	<h2 id="bio-h">Biography</h2>
	{#each about.bio as para (para)}
		<p>{para}</p>
	{/each}
	{#if about.mission.status === 'published'}
		<!-- Pending mission renders NOTHING here — no {:else} with invented copy (CONT-03). -->
		<p class="mission">{about.mission.statement}</p>
	{/if}
</section>

<style>
	section {
		color: var(--color-text);
	}

	h2 {
		color: var(--color-heading);
	}

	p {
		/* WCAG 1.4.4 / 1.4.10 — cap measure so text reflows and stays readable at 200% zoom */
		max-width: 65ch;
		margin-block: 0 1rem;
	}
</style>
