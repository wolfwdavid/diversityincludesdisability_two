<script lang="ts">
	// Home services overview (SECT-01). Lists the four real service pillars from the
	// $lib/content barrel (CONT-01/02 — no hard-coded copy) as an <h2> region with each
	// pillar an <h3> item, plus a descriptive link to the full Services page. The link
	// uses resolve('/services') (base-aware for GitHub Pages) — this typechecks against
	// the closed RouteId union because 04-01 registered the /services route stub (04-03
	// replaces it with the real page). Single column by default; multi-column at >=48rem
	// (SECT-07 reflow). Starts at <h2> so the route keeps one <h1> (A11Y-02).
	import { services } from '$lib/content';
	import { resolve } from '$app/paths';
</script>

<section class="services-overview" aria-labelledby="svc-ov-h">
	<h2 id="svc-ov-h">Services</h2>
	<ul class="grid">
		{#each services as s (s.id)}
			<li>
				<h3>{s.title}</h3>
				<p>{s.summary}</p>
			</li>
		{/each}
	</ul>
	<a class="more" href={resolve('/services')}>See all services</a>
</section>

<style>
	.services-overview h2 {
		color: var(--color-heading);
	}
	.grid {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}
	.grid li {
		max-width: 65ch;
	}
	.grid h3 {
		margin: 0 0 0.25rem;
		color: var(--color-heading);
	}
	.grid p {
		margin: 0;
		color: var(--color-text);
	}
	.more {
		display: inline-block;
		color: var(--color-link);
		font-weight: 600;
	}
	.more:hover {
		text-decoration: underline;
	}
	@media (min-width: 48rem) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
