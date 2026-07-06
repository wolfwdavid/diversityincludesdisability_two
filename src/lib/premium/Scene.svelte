<!-- src/lib/premium/Scene.svelte
     World root of the ONE evolving crystalline world (D-01/D-04): night background +
     fog, the authored light rig (D-02 palette), the camera rig, and the procedural
     object groups. Also owns the two disposal hardenings:
     - webglcontextlost listener → onlost() flips the PremiumLayer floor (Pitfall 3)
     - onDestroy forceContextLoss() so rapid toggling can't exhaust the browser's
       WebGL context cap after Threlte's own dispose (PREM-05, Pitfall 2). -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import { Color, FogExp2 } from 'three';
	import CameraRig from './CameraRig.svelte';
	import type { Tier } from './state/tier';

	// eslint-disable-next-line svelte/no-unused-props -- tier is consumed by the object components (Task 2)
	let { onlost }: { tier: Tier; onlost: () => void } = $props();

	const { renderer, scene } = useThrelte();

	// Night world (D-02): deep-night backdrop + exponential fog, set once at init.
	scene.background = new Color('#071c33');
	scene.fog = new FogExp2('#071c33', 0.045);

	onMount(() => {
		const el = renderer.domElement;
		const handleLost = () => onlost();
		el.addEventListener('webglcontextlost', handleLost);
		return () => el.removeEventListener('webglcontextlost', handleLost);
	});

	onDestroy(() => {
		// Threlte teardown already ran setAnimationLoop(null) + renderer.dispose();
		// proactively release the context so 20 rapid toggles never hit the cap.
		try {
			renderer.forceContextLoss();
		} catch {
			/* context already lost — nothing to release */
		}
	});
</script>

<T.AmbientLight color="#0b2a4a" intensity={0.6} />
<T.DirectionalLight position={[4, 6, 3]} color="#ffffff" intensity={0.7} />
<T.PointLight position={[0, 2, 2]} color="#c85f08" intensity={2.2} />

<CameraRig />
