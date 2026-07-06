<!-- src/lib/premium/CameraRig.svelte
     The authored camera (D-11): fixed cinematic framing per route (worldState config),
     eased with framerate-independent MathUtils.damp — never a fixed-factor lerp.
     Scroll progress (D-09) offsets the authored target within a route; pointer
     parallax nudges it further, gated by motion.parallax (off under reduced motion
     AND on touch, D-12). Under prefers-reduced-motion the per-frame task is not
     running — an effect snaps the camera to the authored still per route and
     invalidates once (PREM-06, Research Pattern 4). -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { MathUtils, type PerspectiveCamera } from 'three';
	import { motion } from './state/motion.svelte';
	import { currentConfig, getScrollProgress, updateScroll } from './state/worldState.svelte';

	const { invalidate } = useThrelte();

	let camera = $state<PerspectiveCamera>();

	// Normalized pointer (-1..1), stored by ONE passive window listener — no raycasting,
	// nothing in-canvas is interactive (D-10).
	let pointerX = 0;
	let pointerY = 0;

	onMount(() => {
		const onPointerMove = (e: PointerEvent) => {
			pointerX = (e.clientX / window.innerWidth) * 2 - 1;
			pointerY = (e.clientY / window.innerHeight) * 2 - 1;
		};
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		return () => window.removeEventListener('pointermove', onPointerMove);
	});

	useTask(
		(delta) => {
			if (!camera) return;
			updateScroll();
			const p = getScrollProgress();
			const [cx, cy, cz] = currentConfig().camera;

			// Authored target + scroll-eased offset (D-09/D-11)…
			let tx = cx;
			let ty = cy - p * 1.5;
			let tz = cz + p * 2;
			// …+ subtle pointer parallax, only when the motion authority allows it.
			if (motion.parallax) {
				tx += pointerX * 0.4;
				ty += pointerY * 0.2;
			}

			// Framerate-independent easing per axis — calm drift at any refresh rate.
			camera.position.x = MathUtils.damp(camera.position.x, tx, 2, delta);
			camera.position.y = MathUtils.damp(camera.position.y, ty, 2, delta);
			camera.position.z = MathUtils.damp(camera.position.z, tz, 2, delta);
			camera.lookAt(0, 0, 0);
		},
		{ running: () => motion.animating }
	);

	// Reduced-motion snap (PREM-06): the task above is gated off, so route changes
	// while reduced position the camera DIRECTLY at the authored config (no drift)
	// and render exactly one still frame.
	$effect(() => {
		if (!camera || !motion.reduced) return;
		const [cx, cy, cz] = currentConfig().camera;
		camera.position.set(cx, cy, cz);
		camera.lookAt(0, 0, 0);
		invalidate();
	});
</script>

<T.PerspectiveCamera
	makeDefault
	fov={50}
	oncreate={(ref) => {
		// Start AT the current route's authored framing — never ease out of the origin
		// (camera at (0,0,0) looking at (0,0,0) is a degenerate first frame).
		const [cx, cy, cz] = currentConfig().camera;
		ref.position.set(cx, cy, cz);
		ref.lookAt(0, 0, 0);
		camera = ref;
	}}
/>
