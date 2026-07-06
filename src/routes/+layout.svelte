<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import ModeToggle from '$lib/components/ModeToggle.svelte';
	import SkipLinks from '$lib/components/SkipLinks.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { footer } from '$lib/content';
	import { isPremium } from '$lib/mode/mode.svelte';
	import { hasWebGL } from '$lib/mode/resolve';

	let { children } = $props();

	// The premium gate's capability leg: probed ONCE on the client (never re-derived).
	let webglOk = $state(false);

	// After the first paint, stamp data-mode-ready so the app.css no-transition guard
	// lifts — the pre-paint mode stamp is silent, later user toggles may animate. Using
	// requestAnimationFrame guarantees the initial mode was already painted first.
	onMount(() => {
		// Pitfall 5: the head script stamps data-mode='premium' for a stored choice
		// WITHOUT probing WebGL. Stamping data-webgl here lets the 05-01 dark-skin CSS
		// (:not([data-webgl='no'])) revert when a stored-premium visitor has no WebGL.
		webglOk = hasWebGL();
		document.documentElement.setAttribute('data-webgl', webglOk ? 'ok' : 'no');
		requestAnimationFrame(() => document.documentElement.setAttribute('data-mode-ready', ''));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Skip links MUST be the first focusable content (A11Y-01). -->
<SkipLinks />

<header class="site-header">
	<!-- #nav is a skip-link target (tabindex=-1) and the Primary navigation landmark. -->
	<nav id="nav" tabindex="-1" aria-label="Primary"><Nav /></nav>
	<!-- ModeToggle stays UNCONDITIONAL (never wrapped in a conditional block) so its
	     colocated aria-live region is present in the DOM from first paint (MODE-05). -->
	<ModeToggle />
</header>

<!-- #main is the primary skip-link target; tabindex=-1 makes it programmatically
     focusable so the skip link moves FOCUS, not just scroll (A11Y-01, Pitfall 1). -->
<main id="main" tabindex="-1" class="site-main">
	{@render children()}
</main>

<footer class="site-footer">{footer.copyright}</footer>

{#if browser && isPremium() && webglOk}
	<!-- The ONE premium fence crossing (PREM-03). Dynamic import() => separate Vite chunk;
	     the accessible entry graph never references it. Unmounting on toggle IS the
	     PREM-04 pause + PREM-05 disposal trigger. The backdrop is position:fixed, so DOM
	     order is irrelevant to stacking — keeping it last keeps the accessible shell
	     first in source. -->
	<!-- eslint-disable-next-line no-restricted-syntax -->
	{#await import('$lib/premium/PremiumLayer.svelte') then { default: PremiumLayer }}
		<PremiumLayer />
	{:catch}
		<!-- chunk failed to load: the accessible DOM above is complete — do nothing -->
	{/await}
{/if}

<style>
	/* Persistent header (MODE-01): sticky so nav + mode switch stay reachable while the
	   page scrolls. Nav sits left, ModeToggle right. Kept short so scroll-margin-top:4rem
	   on #main/#nav clears it (WCAG 2.4.11 Focus Not Obscured). */
	.site-header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 1rem;
		background: var(--color-surface);
	}

	.site-footer {
		padding: 1rem;
		color: var(--color-text);
	}
</style>
