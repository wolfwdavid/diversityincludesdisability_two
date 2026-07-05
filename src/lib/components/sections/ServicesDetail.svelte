<script lang="ts">
	// SECT-02 — the four service pillars, sourced structurally from the single content
	// barrel (CONT-01: no hard-coded titles/summaries live here). Each pillar is an
	// aria-labelledby region whose heading is its accessible name; the /services route owns
	// the single page-level heading (A11Y-02: no skipped level). No non-essential motion (A11Y-08).
	import { services } from '$lib/content';
</script>

<ul class="service-list">
	{#each services as s (s.id)}
		<li>
			<section aria-labelledby={`svc-${s.id}`}>
				<h2 id={`svc-${s.id}`}>{s.title}</h2>
				<p>{s.summary}</p>
			</section>
		</li>
	{/each}
</ul>

<style>
	.service-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1.5rem;
	}

	.service-list h2 {
		margin: 0 0 0.5rem;
		color: var(--color-heading);
	}

	.service-list p {
		margin: 0;
		color: var(--color-text);
	}

	@media (min-width: 48rem) {
		.service-list {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
