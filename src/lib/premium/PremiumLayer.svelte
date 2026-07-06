<!-- src/lib/premium/PremiumLayer.svelte
     THE dynamic-import target (PREM-01/03): the single component the layout's one
     sanctioned import() resolves. Hosts the ONE shared <Canvas> (PREM-02) as a fixed
     full-viewport backdrop behind the DOM shell (05-01 stacks header/main/footer at
     z-index 1). aria-hidden: Threlte's context tree renders INSIDE <canvas> as
     fallback content that would otherwise leak into the accessibility tree
     (Pitfall 1); pointer-events none: nothing in-canvas is interactive (D-10).
     Unmounting this component (toggle → Accessible) IS the PREM-04 pause and the
     PREM-05 disposal trigger. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { detectTier } from './state/tier';
	import { initMotion, motion } from './state/motion.svelte';
	import { initWorldScroll } from './state/worldState.svelte';

	// Two-tier device quality (D-08), computed once per mount — this component only
	// ever initializes on the client (the layout gate is browser-guarded).
	const t = detectTier();

	// Context-loss floor (Pitfall 3): when the GPU evicts the context, remove the dead
	// canvas — the complete accessible DOM above is the fallback presentation.
	let contextLost = $state(false);

	onMount(() => {
		initMotion();
		initWorldScroll();
	});
</script>

<div
	class="premium-backdrop"
	aria-hidden="true"
	data-motion={motion.animating ? 'active' : 'paused'}
>
	{#if !contextLost}
		<Canvas dpr={t === 'low' ? [1, 1.5] : [1, 2]}>
			<Scene tier={t} onlost={() => (contextLost = true)} />
		</Canvas>
	{/if}
</div>

<style>
	.premium-backdrop {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}
</style>
