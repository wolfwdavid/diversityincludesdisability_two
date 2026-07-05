<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import ModeToggle from '$lib/components/ModeToggle.svelte';

	let { children } = $props();

	// After the first paint, stamp data-mode-ready so the app.css no-transition guard
	// lifts — the pre-paint mode stamp is silent, later user toggles may animate. Using
	// requestAnimationFrame guarantees the initial mode was already painted first.
	onMount(() =>
		requestAnimationFrame(() => document.documentElement.setAttribute('data-mode-ready', ''))
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Minimal header slot hosting the mode switch. Phase 4 builds the full nav around
     this. ModeToggle is rendered UNCONDITIONALLY (no {#if}) so its colocated
     aria-live region is present in the DOM from first paint. -->
<header class="site-header">
	<ModeToggle />
</header>

{@render children()}
