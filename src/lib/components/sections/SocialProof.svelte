<script lang="ts">
	// SECT-04 / CONT-03. Branches on `Slot<T>.status` (RESEARCH Pattern 5): renders the
	// ONE published engagement (the Manhattan Borough President / Mark Levine training)
	// with its attribution, and renders the all-pending testimonials/press as honest
	// `role="note"` "coming soon" markers. Only the `published` arm exposes
	// `.title/.partner/.attribution` (compile-safe); `.reason` is NEVER shown as copy.
	import { engagements, testimonials, press } from '$lib/content';
</script>

<section aria-labelledby="proof-h">
	<h2 id="proof-h">Recent work</h2>
	<ul>
		{#each engagements as e, i (i)}
			{#if e.status === 'published'}
				<li>
					<h3>{e.title}</h3>
					<p>{e.partner}</p>
					<p class="attribution">{e.attribution}</p>
				</li>
			{/if}
		{/each}
	</ul>

	{#if testimonials.every((t) => t.status === 'pending')}
		<p class="pending" role="note">Client testimonials are coming soon.</p>
	{/if}
	{#if press.every((p) => p.status === 'pending')}
		<p class="pending" role="note">Press and client logos are coming soon.</p>
	{/if}
</section>

<style>
	section {
		color: var(--color-text);
	}

	h2 {
		color: var(--color-heading);
	}

	h3 {
		color: var(--color-heading);
		margin-block-end: 0.25rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1.5rem;
	}

	li {
		max-width: 65ch;
	}

	li p {
		margin-block: 0.25rem 0;
	}

	.attribution {
		font-size: 0.9rem;
		color: var(--color-text);
	}

	.pending {
		font-style: italic;
		max-width: 65ch;
	}
</style>
