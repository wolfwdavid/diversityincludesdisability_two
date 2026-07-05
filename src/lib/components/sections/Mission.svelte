<script lang="ts">
	// Mission section (SECT-01 / SECT-03). Anti-fabrication (CONT-03) is enforced by
	// branching on about.mission.status: the published statement is only rendered on the
	// 'published' arm (where `.statement` exists); the current data is 'pending', so a
	// neutral "coming soon" note is shown instead — NEVER an invented mission sentence.
	// Starts at <h2> so the route keeps a single <h1> (A11Y-02).
	// `about` is exported `as const`, which narrows `about.mission` to its pending literal;
	// widen it back to the Slot<Mission> union (a safe widening assignment, no cast) so the
	// published arm — and its `.statement` — is a real, type-checked branch for when the
	// human-capture checkpoint publishes the mission.
	import { about, type Slot, type Mission } from '$lib/content';

	const mission: Slot<Mission> = about.mission;
</script>

<section class="mission" aria-labelledby="mission-h">
	<h2 id="mission-h">Mission</h2>
	{#if mission.status === 'published'}
		<p>{mission.statement}</p>
	{:else}
		<p class="pending" role="note">Mission statement coming soon.</p>
	{/if}
</section>

<style>
	.mission {
		max-width: 65ch;
	}
	.mission h2 {
		color: var(--color-heading);
	}
	.mission p {
		color: var(--color-text);
	}
	.pending {
		color: var(--color-text);
		font-style: italic;
	}
</style>
